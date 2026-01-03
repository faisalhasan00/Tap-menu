const Restaurant = require('../models/Restaurant');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');

/**
 * @desc    Get categories for a restaurant (Public)
 * @route   GET /api/customer/menu/:restaurantId/categories
 * @access  Public
 */
const getCustomerCategories = async (req, res) => {
  try {
    console.log('\n📋 [CUSTOMER_CATEGORIES] Request received:', {
      restaurantId: req.params.restaurantId
    });

    const { restaurantId } = req.params;

    // Verify restaurant exists and is active
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      console.log('❌ [CUSTOMER_CATEGORIES] Restaurant not found');
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    if (restaurant.status === 'BLOCKED') {
      console.log('❌ [CUSTOMER_CATEGORIES] Restaurant is blocked');
      return res.status(403).json({
        success: false,
        message: 'This restaurant is currently unavailable'
      });
    }

    const categories = await Category.find({ restaurantId })
      .sort({ order: 1, createdAt: 1 })
      .select('-restaurantId -__v');

    console.log('✅ [CUSTOMER_CATEGORIES] Categories found:', categories.length);

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error('❌ [CUSTOMER_CATEGORIES] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * @desc    Get menu items for a restaurant (Public)
 * @route   GET /api/customer/menu/:restaurantId/items
 * @access  Public
 */
const getCustomerMenuItems = async (req, res) => {
  try {
    console.log('\n🍽️ [CUSTOMER_MENU_ITEMS] Request received:', {
      restaurantId: req.params.restaurantId,
      query: req.query
    });

    const { restaurantId } = req.params;
    const { categoryId } = req.query;

    // Verify restaurant exists and is active
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      console.log('❌ [CUSTOMER_MENU_ITEMS] Restaurant not found');
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    if (restaurant.status === 'BLOCKED') {
      console.log('❌ [CUSTOMER_MENU_ITEMS] Restaurant is blocked');
      return res.status(403).json({
        success: false,
        message: 'This restaurant is currently unavailable'
      });
    }

    // Build query - only show available items
    const query = {
      restaurantId,
      isAvailable: true
    };

    if (categoryId) {
      query.categoryId = categoryId;
    }

    const menuItems = await MenuItem.find(query)
      .populate('categoryId', 'name order')
      .select('-restaurantId -__v')
      .sort({ createdAt: -1 });

    console.log('✅ [CUSTOMER_MENU_ITEMS] Items found:', menuItems.length);

    res.status(200).json({
      success: true,
      count: menuItems.length,
      data: menuItems
    });
  } catch (error) {
    console.error('❌ [CUSTOMER_MENU_ITEMS] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getCustomerCategories,
  getCustomerMenuItems
};


