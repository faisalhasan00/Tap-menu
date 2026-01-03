const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');

/**
 * @desc    Ensure restaurant owners can only access their own restaurant
 * @access  Restaurant-specific routes
 * 
 * This middleware ensures that RESTAURANT_ADMIN users can only access
 * resources belonging to their restaurant and checks if restaurant is BLOCKED.
 */
const ensureRestaurantAccess = async (req, res, next) => {
  try {
    console.log('\n🔐 [RESTAURANT_ACCESS] Checking access:', {
      path: req.path,
      method: req.method,
      user: req.user ? { role: req.user.role, restaurantId: req.user.restaurantId } : null
    });

    if (!req.user) {
      console.log('❌ [RESTAURANT_ACCESS] No user in request');
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Super Admin can access all restaurants
    if (req.user.role === 'SUPER_ADMIN') {
      console.log('✅ [RESTAURANT_ACCESS] Super Admin - access granted');
      return next();
    }

    // RESTAURANT_ADMIN must have a restaurantId
    if (req.user.role === 'RESTAURANT_ADMIN') {
      if (!req.user.restaurantId) {
        console.log('❌ [RESTAURANT_ACCESS] Restaurant Admin has no restaurantId');
        return res.status(403).json({
          success: false,
          message: 'Restaurant owner account is not properly configured'
        });
      }

      let restaurantId = req.params.restaurantId || req.body.restaurantId || req.user.restaurantId;

      // Special handling for order routes - get restaurantId from order
      if (req.path.includes('/orders/') && req.params.id && !restaurantId) {
        console.log('🔍 [RESTAURANT_ACCESS] Order route detected, fetching order:', req.params.id);
        const order = await Order.findById(req.params.id);
        if (!order) {
          console.log('❌ [RESTAURANT_ACCESS] Order not found');
          return res.status(404).json({
            success: false,
            message: 'Order not found'
          });
        }
        restaurantId = order.restaurantId;
        console.log('✅ [RESTAURANT_ACCESS] Order found, restaurantId:', restaurantId);
      }

      // If still no restaurantId, try params.id (for non-order routes)
      if (!restaurantId) {
        restaurantId = req.params.id || req.user.restaurantId;
      }

      if (!restaurantId) {
        console.log('❌ [RESTAURANT_ACCESS] No restaurantId found');
        return res.status(400).json({
          success: false,
          message: 'Restaurant ID is required'
        });
      }

      // Check if the restaurant ID matches the owner's restaurant
      if (restaurantId.toString() !== req.user.restaurantId.toString()) {
        console.log('❌ [RESTAURANT_ACCESS] Restaurant ID mismatch:', {
          requested: restaurantId.toString(),
          user: req.user.restaurantId.toString()
        });
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own restaurant'
        });
      }

      // Check if restaurant is BLOCKED
      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
        console.log('❌ [RESTAURANT_ACCESS] Restaurant not found:', restaurantId);
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found'
        });
      }

      if (restaurant.status === 'BLOCKED') {
        console.log('❌ [RESTAURANT_ACCESS] Restaurant is blocked');
        return res.status(403).json({
          success: false,
          message: 'Access denied. This restaurant is currently blocked'
        });
      }

      console.log('✅ [RESTAURANT_ACCESS] Access granted');

      // Attach restaurant to request for use in controllers
      req.restaurant = restaurant;
    }

    next();
  } catch (error) {
    console.error('❌ [RESTAURANT_ACCESS] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  ensureRestaurantAccess
};

