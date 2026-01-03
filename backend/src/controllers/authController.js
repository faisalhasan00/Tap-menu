const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    console.log('\n🔑 [LOGIN] Login attempt:', {
      username: req.body.username,
      hasPassword: !!req.body.password
    });

    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      console.log('❌ [LOGIN] Validation failed: missing username or password');
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Find user and include password field
    const user = await User.findOne({ username: username.toLowerCase() })
      .select('+password');

    if (!user) {
      console.log('❌ [LOGIN] User not found:', username.toLowerCase());
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('✅ [LOGIN] User found:', {
      id: user._id,
      username: user.username,
      role: user.role,
      isActive: user.isActive
    });

    // Check if user is active
    if (!user.isActive) {
      console.log('❌ [LOGIN] Account is deactivated');
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log('❌ [LOGIN] Invalid password');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('✅ [LOGIN] Password verified');

    // Generate token
    const token = generateToken(user._id, user.role);
    console.log('✅ [LOGIN] Token generated, length:', token.length);

    // Return user data (password excluded via model transform)
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          username: user.username,
          role: user.role,
          isActive: user.isActive
        },
        token
      }
    });

    console.log('✅ [LOGIN] Login successful for:', user.username);
  } catch (error) {
    console.error('❌ [LOGIN] Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  login
};

