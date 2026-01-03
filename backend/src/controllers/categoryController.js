const Category = require('../models/Category');

/**
 * @desc    Create a new category
 * @route   POST /api/categories
 * @access  Restaurant Owner only
 */
const createCategory = async (req, res) => {
  try {
    const { name, order } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    // Use restaurantId from authenticated user
    const restaurantId = req.user.restaurantId;

    // Create category
    const category = await Category.create({
      name: name.trim(),
      restaurantId: restaurantId,
      order: order !== undefined ? order : undefined // Let pre-save hook handle auto-increment
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    console.error('Create category error:', error);

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
        message: 'Category with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * @desc    Get all categories for restaurant
 * @route   GET /api/categories
 * @access  Restaurant Owner only
 */
const getCategories = async (req, res) => {
  try {
    // Use restaurantId from authenticated user
    const restaurantId = req.user.restaurantId;

    const categories = await Category.find({ restaurantId })
      .sort({ order: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createCategory,
  getCategories
};


