const express = require('express');
const router = express.Router();
const { authMiddleware, restaurantAdminOnly } = require('../middlewares/authMiddleware');
const { ensureRestaurantAccess } = require('../middlewares/restaurantOwnerMiddleware');
const {
  createOrder,
  getOrders,
  updateOrderStatus,
  getOrderByTrackingId
} = require('../controllers/orderController');

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Public (Customer)
 */
router.post('/', createOrder);

/**
 * @route   GET /api/orders
 * @desc    Get all orders for restaurant
 * @access  Restaurant Owner only
 * @query   status (optional) - Filter by status
 * @query   tableNumber (optional) - Filter by table number
 */
router.get('/', authMiddleware, restaurantAdminOnly, ensureRestaurantAccess, getOrders);

/**
 * @route   PATCH /api/orders/:id/status
 * @desc    Update order status
 * @access  Restaurant Owner only
 */
router.patch('/:id/status', authMiddleware, restaurantAdminOnly, ensureRestaurantAccess, updateOrderStatus);

/**
 * @route   GET /api/orders/track/:trackingId
 * @desc    Get order by tracking ID
 * @access  Public
 */
router.get('/track/:trackingId', getOrderByTrackingId);

module.exports = router;


