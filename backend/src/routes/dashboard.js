const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { authMiddleware, restaurantAdminOnly } = require('../middlewares/authMiddleware');

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Restaurant Owner only
 */
router.get('/stats', authMiddleware, restaurantAdminOnly, getDashboardStats);

module.exports = router;

