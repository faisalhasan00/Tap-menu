const express = require('express');
const router = express.Router();
const { authMiddleware, restaurantAdminOnly } = require('../middlewares/authMiddleware');
const { ensureRestaurantAccess } = require('../middlewares/restaurantOwnerMiddleware');
const { getAnalyticsOverview, getMonthlyReport } = require('../controllers/analyticsController');

/**
 * @route   GET /api/analytics/overview
 * @desc    Get analytics overview for restaurant
 * @access  Restaurant Owner only
 */
router.get('/overview', authMiddleware, restaurantAdminOnly, ensureRestaurantAccess, getAnalyticsOverview);

/**
 * @route   GET /api/analytics/monthly-report
 * @desc    Download monthly report (CSV)
 * @access  Restaurant Owner only
 */
router.get('/monthly-report', authMiddleware, restaurantAdminOnly, ensureRestaurantAccess, getMonthlyReport);

module.exports = router;

