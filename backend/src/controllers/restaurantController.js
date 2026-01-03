const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const { generateQRCode, generateRestaurantUrl } = require('../utils/qrCodeGenerator');

/**
 * @desc    Create a new restaurant
 * @route   POST /api/restaurants
 * @access  Super Admin only
 */
const createRestaurant = async (req, res) => {
  try {
    console.log('\n🍽️ [CREATE_RESTAURANT] Request received:', {
      body: req.body,
      user: req.user
    });

    const { name, slug, logo } = req.body;

    // Validate input
    if (!name || !slug) {
      console.log('❌ [CREATE_RESTAURANT] Validation failed: name or slug missing');
      return res.status(400).json({
        success: false,
        message: 'Name and slug are required'
      });
    }

    // Check if slug already exists
    const existingRestaurant = await Restaurant.findOne({ slug: slug.toLowerCase() });
    if (existingRestaurant) {
      console.log('❌ [CREATE_RESTAURANT] Slug already exists:', slug);
      return res.status(400).json({
        success: false,
        message: 'Restaurant with this slug already exists'
      });
    }

    // Create restaurant
    const restaurant = await Restaurant.create({
      name: name.trim(),
      slug: slug.toLowerCase().trim(),
      logo: logo || null,
      status: 'ACTIVE',
      createdBy: req.user.id
    });

    console.log('✅ [CREATE_RESTAURANT] Restaurant created:', restaurant._id);

    res.status(201).json({
      success: true,
      message: 'Restaurant created successfully',
      data: restaurant
    });
  } catch (error) {
    console.error('❌ [CREATE_RESTAURANT] Error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant with this slug already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * @desc    Get all restaurants
 * @route   GET /api/restaurants
 * @access  Super Admin only
 */
const getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find()
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: restaurants.length,
      data: restaurants
    });
  } catch (error) {
    console.error('Get restaurants error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * @desc    Get restaurant by ID
 * @route   GET /api/restaurants/:id
 * @access  Super Admin or Restaurant Owner (own restaurant only)
 */
const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findById(id)
      .populate('createdBy', 'username');

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    res.status(200).json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    console.error('Get restaurant error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * @desc    Get own restaurant (for Restaurant Owner)
 * @route   GET /api/restaurants/me
 * @access  Restaurant Owner only
 */
const getOwnRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.user.restaurantId)
      .populate('createdBy', 'username');

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    res.status(200).json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    console.error('Get own restaurant error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * @desc    Block a restaurant
 * @route   PATCH /api/restaurants/:id/block
 * @access  Super Admin only
 */
const blockRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    if (restaurant.status === 'BLOCKED') {
      return res.status(400).json({
        success: false,
        message: 'Restaurant is already blocked'
      });
    }

    restaurant.status = 'BLOCKED';
    await restaurant.save();

    res.status(200).json({
      success: true,
      message: 'Restaurant blocked successfully',
      data: restaurant
    });
  } catch (error) {
    console.error('Block restaurant error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * @desc    Unblock a restaurant
 * @route   PATCH /api/restaurants/:id/unblock
 * @access  Super Admin only
 */
const unblockRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    if (restaurant.status === 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'Restaurant is already active'
      });
    }

    restaurant.status = 'ACTIVE';
    await restaurant.save();

    res.status(200).json({
      success: true,
      message: 'Restaurant unblocked successfully',
      data: restaurant
    });
  } catch (error) {
    console.error('Unblock restaurant error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * @desc    Create restaurant owner (RESTAURANT_ADMIN)
 * @route   POST /api/restaurants/:id/create-owner
 * @access  Super Admin only
 */
const createRestaurantOwner = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Check if restaurant already has an owner
    const existingOwner = await User.findOne({
      restaurantId: id,
      role: 'RESTAURANT_ADMIN'
    });

    if (existingOwner) {
      return res.status(400).json({
        success: false,
        message: 'This restaurant already has an owner'
      });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Create restaurant owner
    const owner = await User.create({
      username: username.toLowerCase().trim(),
      password: password,
      role: 'RESTAURANT_ADMIN',
      restaurantId: id,
      isActive: true
    });

    // Return owner without password
    const ownerResponse = owner.toJSON();

    res.status(201).json({
      success: true,
      message: 'Restaurant owner created successfully',
      data: ownerResponse
    });
  } catch (error) {
    console.error('Create restaurant owner error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * @desc    Get restaurant by slug (Public)
 * @route   GET /api/restaurants/slug/:slug
 * @access  Public
 */
const getRestaurantBySlug = async (req, res) => {
  try {
    console.log('\n🍽️ [GET_RESTAURANT_BY_SLUG] Request received:', {
      slug: req.params.slug
    });

    const { slug } = req.params;

    const restaurant = await Restaurant.findOne({ slug: slug.toLowerCase() });

    if (!restaurant) {
      console.log('❌ [GET_RESTAURANT_BY_SLUG] Restaurant not found:', slug);
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    console.log('✅ [GET_RESTAURANT_BY_SLUG] Restaurant found:', restaurant._id);

    res.status(200).json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    console.error('❌ [GET_RESTAURANT_BY_SLUG] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * @desc    Generate QR code for restaurant
 * @route   GET /api/restaurants/:id/qr-code
 * @access  Restaurant Owner only (own restaurant)
 */
const generateRestaurantQRCode = async (req, res) => {
  try {
    console.log('\n📱 [GENERATE_QR] Request received:', {
      restaurantId: req.params.id,
      user: req.user
    });

    const { id } = req.params;
    const restaurantId = req.user.restaurantId || id;

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      console.log('❌ [GENERATE_QR] Restaurant not found:', restaurantId);
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Generate menu URL (no table number)
    const menuUrl = generateRestaurantUrl(restaurant.slug);

    // Generate QR code
    const qrCodeDataUrl = await generateQRCode(menuUrl);

    console.log('✅ [GENERATE_QR] QR code generated for restaurant:', restaurant.name);

    res.status(200).json({
      success: true,
      data: {
        qrCodeUrl: qrCodeDataUrl,
        menuUrl: menuUrl,
        restaurant: {
          _id: restaurant._id,
          name: restaurant.name,
          slug: restaurant.slug
        }
      }
    });
  } catch (error) {
    console.error('❌ [GENERATE_QR] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createRestaurant,
  getRestaurants,
  getRestaurantById,
  getOwnRestaurant,
  blockRestaurant,
  unblockRestaurant,
  createRestaurantOwner,
  getRestaurantBySlug,
  generateRestaurantQRCode
};

