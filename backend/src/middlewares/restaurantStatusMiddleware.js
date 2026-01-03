const Restaurant = require('../models/Restaurant');

/**
 * @desc    Check if restaurant is blocked
 * @access  Restaurant APIs
 * 
 * This middleware should be used on routes that require the restaurant to be active.
 * It checks if the restaurant (identified by restaurantId param or body) is BLOCKED.
 */
const checkRestaurantStatus = async (req, res, next) => {
  try {
    // Get restaurant ID from params or body
    const restaurantId = req.params.restaurantId || req.params.id || req.body.restaurantId;

    if (!restaurantId) {
      // If no restaurant ID is provided, skip this check
      // This allows routes that don't need restaurant context to proceed
      return next();
    }

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    if (restaurant.status === 'BLOCKED') {
      return res.status(403).json({
        success: false,
        message: 'This restaurant is currently blocked and cannot perform this action'
      });
    }

    // Attach restaurant to request for use in controllers
    req.restaurant = restaurant;
    next();
  } catch (error) {
    console.error('Restaurant status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  checkRestaurantStatus
};


