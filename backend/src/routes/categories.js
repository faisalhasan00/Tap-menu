const express = require('express');
const router = express.Router();
const { authMiddleware, restaurantAdminOnly } = require('../middlewares/authMiddleware');
const { ensureRestaurantAccess } = require('../middlewares/restaurantOwnerMiddleware');
const {
  createCategory,
  getCategories
} = require('../controllers/categoryController');

// All routes require authentication, Restaurant Admin role, and restaurant access check
router.use(authMiddleware);
router.use(restaurantAdminOnly);
router.use(ensureRestaurantAccess);

/**
 * @route   POST /api/categories
 * @desc    Create a new category
 * @access  Restaurant Owner only
 */
router.post('/', createCategory);

/**
 * @route   GET /api/categories
 * @desc    Get all categories for restaurant
 * @access  Restaurant Owner only
 */
router.get('/', getCategories);

module.exports = router;


