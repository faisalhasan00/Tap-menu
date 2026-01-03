const mongoose = require('mongoose');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

/**
 * @desc    Create a new order
 * @route   POST /api/orders
 * @access  Public (Customer)
 */
const createOrder = async (req, res) => {
  try {
    console.log('\n🛒 [CREATE_ORDER] Request received:', {
      restaurantId: req.body.restaurantId,
      tableNumber: req.body.tableNumber,
      itemsCount: req.body.items?.length || 0,
      items: req.body.items
    });

    const { restaurantId, tableNumber, items } = req.body;

    // Validate input
    if (!restaurantId || !tableNumber || !items || !Array.isArray(items) || items.length === 0) {
      console.log('❌ [CREATE_ORDER] Validation failed: missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Restaurant ID, table number, and items are required'
      });
    }

    // Check if restaurant exists and is active
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    if (restaurant.status === 'BLOCKED') {
      return res.status(403).json({
        success: false,
        message: 'Restaurant is currently blocked and cannot accept orders'
      });
    }

    // Validate and process items
    const orderItems = [];
    for (const item of items) {
      console.log('🔍 [CREATE_ORDER] Processing item:', item);
      
      if (!item.menuItemId || !item.quantity || item.quantity < 1) {
        console.log('❌ [CREATE_ORDER] Invalid item:', item);
        return res.status(400).json({
          success: false,
          message: 'Each item must have menuItemId and quantity (at least 1)'
        });
      }

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(item.menuItemId)) {
        console.log('❌ [CREATE_ORDER] Invalid ObjectId format:', item.menuItemId);
        return res.status(400).json({
          success: false,
          message: `Invalid menu item ID format: ${item.menuItemId}`
        });
      }

      // Get menu item details
      const menuItem = await MenuItem.findOne({
        _id: item.menuItemId,
        restaurantId: restaurantId,
        isAvailable: true
      });

      if (!menuItem) {
        console.log('❌ [CREATE_ORDER] Menu item not found:', {
          menuItemId: item.menuItemId,
          restaurantId: restaurantId
        });
        return res.status(400).json({
          success: false,
          message: `Menu item not found or unavailable. Please refresh the menu and try again.`
        });
      }

      console.log('✅ [CREATE_ORDER] Menu item found:', {
        id: menuItem._id,
        name: menuItem.name,
        price: menuItem.price
      });

      orderItems.push({
        menuItemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity
      });
    }

    // Calculate total amount
    const totalAmount = orderItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    console.log('💰 [CREATE_ORDER] Calculated total amount:', totalAmount);

    // Create order
    const order = await Order.create({
      restaurantId: restaurantId,
      tableNumber: parseInt(tableNumber),
      items: orderItems,
      totalAmount: totalAmount,
      status: 'PENDING'
    });

    console.log('✅ [CREATE_ORDER] Order created successfully:', {
      orderId: order._id,
      restaurantId: order.restaurantId,
      tableNumber: order.tableNumber,
      itemsCount: order.items.length,
      totalAmount: order.totalAmount
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    console.error('❌ [CREATE_ORDER] Error:', error);
    console.error('❌ [CREATE_ORDER] Error details:', {
      name: error.name,
      message: error.message,
      errors: error.errors
    });

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      console.log('❌ [CREATE_ORDER] Validation errors:', errors);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * @desc    Get all orders for restaurant
 * @route   GET /api/orders
 * @access  Restaurant Owner only
 */
const getOrders = async (req, res) => {
  try {
    // Use restaurantId from authenticated user
    const restaurantId = req.user.restaurantId;

    // Optional query params
    const { status, tableNumber } = req.query;

    // Build query
    const query = { restaurantId };
    if (status) {
      query.status = status;
    }
    if (tableNumber) {
      query.tableNumber = parseInt(tableNumber);
    }

    const orders = await Order.find(query)
      .populate('items.menuItemId', 'name price image')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * @desc    Update order status
 * @route   PATCH /api/orders/:id/status
 * @access  Restaurant Owner only
 */
const updateOrderStatus = async (req, res) => {
  try {
    console.log('\n🔄 [UPDATE_ORDER_STATUS] Request received:', {
      orderId: req.params.id,
      status: req.body.status,
      user: req.user
    });

    const { id } = req.params;
    const { status } = req.body;
    const restaurantId = req.user.restaurantId;

    // Validate status
    const validStatuses = ['PENDING', 'ACCEPTED', 'REJECTED', 'READY'];
    if (!status || !validStatuses.includes(status)) {
      console.log('❌ [UPDATE_ORDER_STATUS] Invalid status:', status);
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Find order and verify it belongs to the restaurant
    const order = await Order.findOne({
      _id: id,
      restaurantId: restaurantId
    });

    if (!order) {
      console.log('❌ [UPDATE_ORDER_STATUS] Order not found:', {
        orderId: id,
        restaurantId: restaurantId
      });
      return res.status(404).json({
        success: false,
        message: 'Order not found or does not belong to your restaurant'
      });
    }

    console.log('✅ [UPDATE_ORDER_STATUS] Order found:', {
      orderId: order._id,
      currentStatus: order.status,
      newStatus: status
    });

    // Update status
    order.status = status;
    await order.save();

    // Populate items
    await order.populate('items.menuItemId', 'name price image');

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  updateOrderStatus
};

