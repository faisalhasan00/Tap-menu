const express = require('express');
const router = express.Router();
const {
  getCustomerCategories,
  getCustomerMenuItems
} = require('../controllers/customerMenuController');

/**
 * @route   GET /api/customer/menu/:restaurantId/categories
 * @desc    Get categories for a restaurant (Public)
 * @access  Public
 */
router.get('/:restaurantId/categories', getCustomerCategories);

/**
 * @route   GET /api/customer/menu/:restaurantId/items
 * @desc    Get menu items for a restaurant (Public)
 * @access  Public
 */
router.get('/:restaurantId/items', getCustomerMenuItems);

module.exports = router;


