const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/dashboard/stats
 * @access  Restaurant Owner only
 */
const getDashboardStats = async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;

    if (!restaurantId) {
      return res.status(403).json({
        success: false,
        message: 'Restaurant ID not found'
      });
    }

    // Get current date boundaries (UTC)
    const now = new Date();
    const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const endOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));

    // Parallel queries for better performance
    const [totalMenuItems, todayOrders, pendingOrders] = await Promise.all([
      // Total menu items count
      MenuItem.countDocuments({ restaurantId }),
      
      // Today's orders count
      Order.countDocuments({
        restaurantId,
        createdAt: {
          $gte: startOfToday,
          $lt: endOfToday
        }
      }),
      
      // Pending orders count
      Order.countDocuments({
        restaurantId,
        status: 'PENDING'
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalMenuItems,
        todayOrders,
        pendingOrders
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getDashboardStats
};


