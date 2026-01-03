const express = require('express');
const router = express.Router();
const { authMiddleware, restaurantAdminOnly } = require('../middlewares/authMiddleware');
const { ensureRestaurantAccess } = require('../middlewares/restaurantOwnerMiddleware');
const {
  createMenuItem,
  getMenuItems,
  toggleMenuItemAvailability
} = require('../controllers/menuItemController');

// All routes require authentication, Restaurant Admin role, and restaurant access check
router.use(authMiddleware);
router.use(restaurantAdminOnly);
router.use(ensureRestaurantAccess);

/**
 * @route   POST /api/menu-items
 * @desc    Create a new menu item
 * @access  Restaurant Owner only
 */
router.post('/', createMenuItem);

/**
 * @route   GET /api/menu-items
 * @desc    Get all menu items for restaurant
 * @access  Restaurant Owner only
 * @query   categoryId (optional) - Filter by category
 * @query   isAvailable (optional) - Filter by availability (true/false)
 */
router.get('/', getMenuItems);

/**
 * @route   PATCH /api/menu-items/:id/toggle
 * @desc    Toggle menu item availability
 * @access  Restaurant Owner only
 */
router.patch('/:id/toggle', toggleMenuItemAvailability);

module.exports = router;


