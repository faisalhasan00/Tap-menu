const express = require('express');
const router = express.Router();
const { authMiddleware, superAdminOnly, restaurantAdminOnly } = require('../middlewares/authMiddleware');
const { ensureRestaurantAccess } = require('../middlewares/restaurantOwnerMiddleware');
const {
  createRestaurant,
  getRestaurants,
  getRestaurantById,
  getOwnRestaurant,
  blockRestaurant,
  unblockRestaurant,
  createRestaurantOwner,
  getRestaurantBySlug,
  generateRestaurantQRCode
} = require('../controllers/restaurantController');

// ============================================
// Super Admin Only Routes
// ============================================

/**
 * @route   POST /api/restaurants
 * @desc    Create a new restaurant
 * @access  Super Admin only
 */
router.post('/', authMiddleware, superAdminOnly, createRestaurant);

/**
 * @route   GET /api/restaurants
 * @desc    Get all restaurants
 * @access  Super Admin only
 */
router.get('/', authMiddleware, superAdminOnly, getRestaurants);

/**
 * @route   PATCH /api/restaurants/:id/block
 * @desc    Block a restaurant
 * @access  Super Admin only
 */
router.patch('/:id/block', authMiddleware, superAdminOnly, blockRestaurant);

/**
 * @route   PATCH /api/restaurants/:id/unblock
 * @desc    Unblock a restaurant
 * @access  Super Admin only
 */
router.patch('/:id/unblock', authMiddleware, superAdminOnly, unblockRestaurant);

/**
 * @route   POST /api/restaurants/:id/create-owner
 * @desc    Create restaurant owner (RESTAURANT_ADMIN)
 * @access  Super Admin only
 */
router.post('/:id/create-owner', authMiddleware, superAdminOnly, createRestaurantOwner);

// ============================================
// Restaurant Owner Routes
// ============================================

/**
 * @route   GET /api/restaurants/me
 * @desc    Get own restaurant (for Restaurant Owner)
 * @access  Restaurant Owner only
 */
router.get('/me', authMiddleware, restaurantAdminOnly, ensureRestaurantAccess, getOwnRestaurant);

/**
 * @route   GET /api/restaurants/me/qr-code
 * @desc    Generate QR code for own restaurant
 * @access  Restaurant Owner only
 */
router.get('/me/qr-code', authMiddleware, restaurantAdminOnly, ensureRestaurantAccess, generateRestaurantQRCode);

/**
 * @route   GET /api/restaurants/slug/:slug
 * @desc    Get restaurant by slug (Public)
 * @access  Public
 */
router.get('/slug/:slug', getRestaurantBySlug);

/**
 * @route   GET /api/restaurants/:id
 * @desc    Get restaurant by ID
 * @access  Super Admin or Restaurant Owner (own restaurant only)
 */
router.get('/:id', authMiddleware, ensureRestaurantAccess, getRestaurantById);

module.exports = router;

