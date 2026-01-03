const MenuItem = require('../models/MenuItem');
const Category = require('../models/Category');

/**
 * @desc    Create a new menu item
 * @route   POST /api/menu-items
 * @access  Restaurant Owner only
 */
const createMenuItem = async (req, res) => {
  try {
    const { name, price, image, vegType, isAvailable, categoryId } = req.body;

    // Validate input
    if (!name || price === undefined || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, and categoryId are required'
      });
    }

    // Validate price
    if (price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a positive number'
      });
    }

    // Use restaurantId from authenticated user
    const restaurantId = req.user.restaurantId;

    // Verify category exists and belongs to the same restaurant
    const category = await Category.findOne({
      _id: categoryId,
      restaurantId: restaurantId
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found or does not belong to your restaurant'
      });
    }

    // Create menu item
    const menuItem = await MenuItem.create({
      name: name.trim(),
      price: parseFloat(price),
      image: image || null,
      vegType: vegType || 'VEG',
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      categoryId: categoryId,
      restaurantId: restaurantId
    });

    // Populate category info
    await menuItem.populate('categoryId', 'name');

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: menuItem
    });
  } catch (error) {
    console.error('Create menu item error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    // Handle duplicate key error (unique constraint)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Menu item with this name already exists'
      });
    }

    // Handle pre-save hook errors
    if (error.message && error.message.includes('Category')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * @desc    Get all menu items for restaurant
 * @route   GET /api/menu-items
 * @access  Restaurant Owner only
 */
const getMenuItems = async (req, res) => {
  try {
    // Use restaurantId from authenticated user
    const restaurantId = req.user.restaurantId;

    // Optional query params
    const { categoryId, isAvailable } = req.query;

    // Build query
    const query = { restaurantId };
    if (categoryId) {
      query.categoryId = categoryId;
    }
    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable === 'true';
    }

    const menuItems = await MenuItem.find(query)
      .populate('categoryId', 'name order')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: menuItems.length,
      data: menuItems
    });
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * @desc    Toggle menu item availability
 * @route   PATCH /api/menu-items/:id/toggle
 * @access  Restaurant Owner only
 */
const toggleMenuItemAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;

    // Find menu item and verify it belongs to the restaurant
    const menuItem = await MenuItem.findOne({
      _id: id,
      restaurantId: restaurantId
    });

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found or does not belong to your restaurant'
      });
    }

    // Toggle availability
    menuItem.isAvailable = !menuItem.isAvailable;
    await menuItem.save();

    // Populate category info
    await menuItem.populate('categoryId', 'name');

    res.status(200).json({
      success: true,
      message: `Menu item ${menuItem.isAvailable ? 'enabled' : 'disabled'} successfully`,
      data: menuItem
    });
  } catch (error) {
    console.error('Toggle menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createMenuItem,
  getMenuItems,
  toggleMenuItemAvailability
};


