const Order = require('../models/Order');
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');

/**
 * @desc    Get analytics overview for restaurant
 * @route   GET /api/analytics/overview
 * @access  Restaurant Owner only
 */
const getAnalyticsOverview = async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;

    if (!restaurantId) {
      return res.status(403).json({
        success: false,
        message: 'Restaurant ID is required'
      });
    }

    // Validate and convert restaurantId to ObjectId
    let restaurantObjectId;
    try {
      restaurantObjectId = new mongoose.Types.ObjectId(restaurantId);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid restaurant ID format'
      });
    }

    // Get current date boundaries (using UTC to avoid timezone issues)
    const now = new Date();
    const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const startOfYesterday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));
    const endOfYesterday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

    // Base match condition: restaurantId and status (ACCEPTED or READY)
    const baseMatch = {
      restaurantId: restaurantObjectId,
      status: { $in: ['ACCEPTED', 'READY'] }
    };

    // ============================================
    // 1. Today Analytics
    // ============================================
    const todayMatch = {
      ...baseMatch,
      createdAt: { $gte: startOfToday }
    };

    const todayStats = await Order.aggregate([
      { $match: todayMatch },
      {
        $group: {
          _id: null,
          totalOrdersToday: { $sum: 1 },
          totalSalesToday: { $sum: '$totalAmount' }
        }
      }
    ]);

    const todayAnalytics = todayStats[0] || {
      totalOrdersToday: 0,
      totalSalesToday: 0
    };

    // ============================================
    // Yesterday Analytics
    // ============================================
    const yesterdayMatch = {
      ...baseMatch,
      createdAt: { 
        $gte: startOfYesterday,
        $lt: endOfYesterday
      }
    };

    const yesterdayStats = await Order.aggregate([
      { $match: yesterdayMatch },
      {
        $group: {
          _id: null,
          yesterdaySales: { $sum: '$totalAmount' }
        }
      }
    ]);

    const yesterdaySales = yesterdayStats[0]?.yesterdaySales || 0;

    // Calculate sales difference percentage
    let salesDifferencePercentage = 0;
    if (yesterdaySales > 0) {
      salesDifferencePercentage = ((todayAnalytics.totalSalesToday - yesterdaySales) / yesterdaySales) * 100;
    } else if (todayAnalytics.totalSalesToday > 0) {
      // If yesterday had no sales but today has sales, it's 100% increase
      salesDifferencePercentage = 100;
    }
    
    // Ensure percentage is a valid number (handle NaN, Infinity)
    if (!isFinite(salesDifferencePercentage)) {
      salesDifferencePercentage = 0;
    }

    // ============================================
    // 2. Monthly Analytics
    // ============================================
    const monthlyMatch = {
      ...baseMatch,
      createdAt: { $gte: startOfMonth }
    };

    const monthlyStats = await Order.aggregate([
      { $match: monthlyMatch },
      {
        $group: {
          _id: null,
          totalOrdersThisMonth: { $sum: 1 },
          totalSalesThisMonth: { $sum: '$totalAmount' }
        }
      }
    ]);

    const monthlyAnalytics = monthlyStats[0] || {
      totalOrdersThisMonth: 0,
      totalSalesThisMonth: 0
    };

    // ============================================
    // 3. Most Sold Dish
    // ============================================
    const mostSoldDish = await Order.aggregate([
      { $match: baseMatch },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          quantitySold: { $sum: '$items.quantity' }
        }
      },
      { $sort: { quantitySold: -1 } },
      { $limit: 1 },
      {
        $project: {
          _id: 0,
          dishName: '$_id',
          quantitySold: 1
        }
      }
    ]);

    const mostSold = mostSoldDish[0] || {
      dishName: null,
      quantitySold: 0
    };

    // ============================================
    // 4. Peak Time (Hour of day with highest orders)
    // ============================================
    const peakTime = await Order.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { orderCount: -1 } },
      { $limit: 1 },
      {
        $project: {
          _id: 0,
          hour: '$_id',
          orderCount: 1
        }
      }
    ]);

    const peakTimeResult = peakTime[0] || {
      hour: null,
      orderCount: 0
    };

    // ============================================
    // 5. Peak Day (Weekday with highest orders)
    // ============================================
    const peakDay = await Order.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { orderCount: -1 } },
      { $limit: 1 },
      {
        $project: {
          _id: 0,
          dayOfWeek: '$_id',
          orderCount: 1
        }
      }
    ]);

    const peakDayResult = peakDay[0] || {
      dayOfWeek: null,
      orderCount: 0
    };

    // Map dayOfWeek number to weekday name
    // MongoDB $dayOfWeek: 1=Sunday, 2=Monday, ..., 7=Saturday
    const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const peakDayName = peakDayResult.dayOfWeek 
      ? weekdayNames[peakDayResult.dayOfWeek - 1] 
      : null;

    // Return clean JSON structure
    res.status(200).json({
      success: true,
      data: {
        today: {
          totalOrdersToday: Number(todayAnalytics.totalOrdersToday) || 0,
          totalSalesToday: Number(todayAnalytics.totalSalesToday) || 0,
          yesterdaySales: Number(yesterdaySales) || 0,
          salesDifferencePercentage: Math.round(salesDifferencePercentage * 100) / 100 // Round to 2 decimal places
        },
        monthly: {
          totalOrdersThisMonth: Number(monthlyAnalytics.totalOrdersThisMonth) || 0,
          totalSalesThisMonth: Number(monthlyAnalytics.totalSalesThisMonth) || 0
        },
        mostSoldDish: {
          dishName: mostSold.dishName || null,
          quantitySold: Number(mostSold.quantitySold) || 0
        },
        peakTime: {
          hour: peakTimeResult.hour !== null && peakTimeResult.hour !== undefined ? Number(peakTimeResult.hour) : null,
          orderCount: Number(peakTimeResult.orderCount) || 0
        },
        peakDay: {
          weekday: peakDayName || null,
          orderCount: Number(peakDayResult.orderCount) || 0
        }
      }
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    
    // Don't expose internal error details in production
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data. Please try again later.'
    });
  }
};

/**
 * @desc    Generate monthly report (CSV format)
 * @route   GET /api/analytics/monthly-report
 * @access  Restaurant Owner only
 */
const getMonthlyReport = async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;

    if (!restaurantId) {
      return res.status(403).json({
        success: false,
        message: 'Restaurant ID is required'
      });
    }

    // Validate and convert restaurantId to ObjectId
    let restaurantObjectId;
    try {
      restaurantObjectId = new mongoose.Types.ObjectId(restaurantId);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid restaurant ID format'
      });
    }

    // Get current month boundaries (using UTC)
    const now = new Date();
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const endOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));

    // Get month name
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const monthName = monthNames[now.getUTCMonth()];
    const year = now.getUTCFullYear();

    // Fetch all orders for the current month (ACCEPTED and READY only)
    const orders = await Order.find({
      restaurantId: restaurantObjectId,
      status: { $in: ['ACCEPTED', 'READY'] },
      createdAt: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    })
    .sort({ createdAt: 1 })
    .lean();

    // Calculate summary statistics
    const totalOrders = orders.length;
    const totalSales = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Group orders by day
    const ordersByDay = {};
    orders.forEach(order => {
      const date = new Date(order.createdAt);
      const dayKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
      if (!ordersByDay[dayKey]) {
        ordersByDay[dayKey] = { date: dayKey, orders: 0, sales: 0 };
      }
      ordersByDay[dayKey].orders += 1;
      ordersByDay[dayKey].sales += order.totalAmount || 0;
    });

    // Generate PDF
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers for PDF download
    const filename = `monthly-report-${monthName.toLowerCase()}-${year}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Pipe PDF to response
    doc.pipe(res);
    
    // Header
    doc.fontSize(24).font('Helvetica-Bold').text('Monthly Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(16).font('Helvetica').text(`${monthName} ${year}`, { align: 'center' });
    doc.moveDown(1);
    
    // Restaurant Info
    doc.fontSize(10).font('Helvetica').text(`Restaurant ID: ${restaurantId}`, { align: 'left' });
    doc.text(`Generated: ${new Date().toLocaleString()}`, { align: 'left' });
    doc.moveDown(1);
    
    // Summary Section
    doc.fontSize(14).font('Helvetica-Bold').text('SUMMARY', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica');
    doc.text(`Total Orders: ${totalOrders}`, { indent: 20 });
    doc.text(`Total Sales: ₹${totalSales.toFixed(2)}`, { indent: 20 });
    doc.text(`Average Order Value: ₹${averageOrderValue.toFixed(2)}`, { indent: 20 });
    doc.moveDown(1);
    
    // Daily Breakdown
    doc.fontSize(14).font('Helvetica-Bold').text('DAILY BREAKDOWN', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica-Bold');
    
    // Table header
    const tableTop = doc.y;
    doc.text('Date', 50, tableTop);
    doc.text('Orders', 200, tableTop);
    doc.text('Sales (₹)', 300, tableTop);
    
    // Draw line under header
    doc.moveTo(50, doc.y + 5).lineTo(500, doc.y + 5).stroke();
    doc.moveDown(0.3);
    
    // Table rows
    doc.fontSize(10).font('Helvetica');
    const sortedDays = Object.keys(ordersByDay).sort();
    sortedDays.forEach(dayKey => {
      const dayData = ordersByDay[dayKey];
      if (doc.y > 700) { // New page if needed
        doc.addPage();
      }
      doc.text(dayData.date, 50);
      doc.text(dayData.orders.toString(), 200);
      doc.text(`₹${dayData.sales.toFixed(2)}`, 300);
      doc.moveDown(0.4);
    });
    
    doc.moveDown(1);
    
    // Order Details
    doc.fontSize(14).font('Helvetica-Bold').text('ORDER DETAILS', { underline: true });
    doc.moveDown(0.5);
    
    // Add orders (limit to prevent PDF from being too large)
    const maxOrdersToShow = 100;
    const ordersToShow = orders.slice(0, maxOrdersToShow);
    
    ordersToShow.forEach((order, index) => {
      if (doc.y > 700) { // New page if needed
        doc.addPage();
      }
      
      const date = new Date(order.createdAt);
      const dateStr = date.toLocaleDateString();
      const timeStr = date.toLocaleTimeString();
      const itemsList = order.items.map(item => `${item.name} (x${item.quantity})`).join(', ');
      
      doc.fontSize(10).font('Helvetica-Bold').text(`Order #${index + 1}`, { indent: 20 });
      doc.fontSize(9).font('Helvetica');
      doc.text(`ID: ${order._id.toString().substring(0, 20)}...`, { indent: 40 });
      doc.text(`Date: ${dateStr} ${timeStr}`, { indent: 40 });
      doc.text(`Table: ${order.tableNumber || 'N/A'}`, { indent: 40 });
      doc.text(`Items: ${itemsList}`, { indent: 40 });
      doc.text(`Amount: ₹${(order.totalAmount || 0).toFixed(2)}`, { indent: 40 });
      doc.text(`Status: ${order.status}`, { indent: 40 });
      doc.moveDown(0.5);
    });
    
    if (orders.length > maxOrdersToShow) {
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica').text(`Note: Showing first ${maxOrdersToShow} of ${orders.length} orders.`, { indent: 20, color: 'gray' });
    }
    
    // Footer
    doc.fontSize(8).font('Helvetica').text(
      `Report generated on ${new Date().toLocaleString()}`,
      50,
      doc.page.height - 50,
      { align: 'center' }
    );
    
    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('Monthly report generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate monthly report. Please try again later.'
    });
  }
};

module.exports = {
  getAnalyticsOverview,
  getMonthlyReport
};
