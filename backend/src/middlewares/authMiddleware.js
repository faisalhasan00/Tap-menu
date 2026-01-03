const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * @desc    Verify JWT token and attach user to request
 * @access  Protected routes
 */
const authMiddleware = async (req, res, next) => {
  try {
    console.log('\n🔐 [AUTH] Request received:', {
      method: req.method,
      path: req.path,
      hasAuthHeader: !!req.headers.authorization,
      authHeaderPrefix: req.headers.authorization?.substring(0, 20) + '...'
    });

    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ [AUTH] No valid authorization header');
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided'
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      console.log('❌ [AUTH] Token is empty after extraction');
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided'
      });
    }

    console.log('🔑 [AUTH] Token extracted, length:', token.length);

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ [AUTH] Token verified, userId:', decoded.userId);

    // Get user from database (include restaurantId)
    const user = await User.findById(decoded.userId).select('+restaurantId');

    if (!user) {
      console.log('❌ [AUTH] User not found in database, userId:', decoded.userId);
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      console.log('❌ [AUTH] User account is deactivated, username:', user.username);
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Attach user to request
    req.user = {
      id: user._id,
      username: user.username,
      role: user.role,
      isActive: user.isActive,
      restaurantId: user.restaurantId ? user.restaurantId.toString() : null
    };

    console.log('✅ [AUTH] User authenticated:', {
      username: req.user.username,
      role: req.user.role,
      restaurantId: req.user.restaurantId
    });

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      console.log('❌ [AUTH] Invalid token:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      console.log('❌ [AUTH] Token expired');
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    console.error('❌ [AUTH] Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * @desc    Allow only SUPER_ADMIN role
 * @access  Super Admin only
 */
const superAdminOnly = (req, res, next) => {
  console.log('👮 [SUPER_ADMIN_CHECK] Checking role:', req.user?.role);
  
  if (!req.user) {
    console.log('❌ [SUPER_ADMIN_CHECK] No user in request');
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'SUPER_ADMIN') {
    console.log('❌ [SUPER_ADMIN_CHECK] Access denied, role:', req.user.role);
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super Admin privileges required'
    });
  }

  console.log('✅ [SUPER_ADMIN_CHECK] Access granted');
  next();
};

/**
 * @desc    Allow only RESTAURANT_ADMIN role
 * @access  Restaurant Admin only
 */
const restaurantAdminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'RESTAURANT_ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Restaurant Admin privileges required'
    });
  }

  if (!req.user.restaurantId) {
    return res.status(403).json({
      success: false,
      message: 'Restaurant owner account is not properly configured'
    });
  }

  next();
};

module.exports = {
  authMiddleware,
  superAdminOnly,
  restaurantAdminOnly
};

