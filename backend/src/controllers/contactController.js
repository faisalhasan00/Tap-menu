const Contact = require('../models/Contact');
const validator = require('validator');

/**
 * Sanitize input to prevent XSS
 */
const sanitizeInput = (str) => {
  if (typeof str !== 'string') return '';
  return validator.escape(str.trim());
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  return validator.isEmail(email);
};

/**
 * Validate phone number (basic validation)
 */
const isValidPhone = (phone) => {
  if (!phone) return true; // Optional field
  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
};

/**
 * @desc    Submit contact form
 * @route   POST /api/contact
 * @access  Public
 */
const submitContact = async (req, res) => {
  try {
    const { name, email, phone, restaurantName, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required'
      });
    }

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    const sanitizedPhone = phone ? sanitizeInput(phone) : '';
    const sanitizedRestaurantName = restaurantName ? sanitizeInput(restaurantName) : '';
    const sanitizedMessage = sanitizeInput(message);

    // Validate email format
    if (!isValidEmail(sanitizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Validate phone if provided
    if (sanitizedPhone && !isValidPhone(sanitizedPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid phone number'
      });
    }

    // Check for duplicate submissions (same email + message within last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const duplicate = await Contact.findOne({
      email: sanitizedEmail,
      message: sanitizedMessage,
      createdAt: { $gte: fiveMinutesAgo }
    });

    if (duplicate) {
      return res.status(429).json({
        success: false,
        message: 'You have already submitted this message. Please wait a few minutes before submitting again.'
      });
    }

    // Get client IP and user agent for logging
    const ipAddress = req.ip || 
                     req.headers['x-forwarded-for']?.split(',')[0] || 
                     req.connection.remoteAddress || 
                     'unknown';
    const userAgent = req.get('user-agent') || 'unknown';

    // Create contact submission (LEAD SAVED TO DATABASE)
    // Build contact data object, omitting null/empty fields that might cause index conflicts
    const contactData = {
      name: sanitizedName,
      email: sanitizedEmail,
      restaurantName: sanitizedRestaurantName || undefined,
      message: sanitizedMessage,
      ipAddress: ipAddress || undefined,
      userAgent: userAgent || undefined
    };
    
    // Only add phone fields if they have values (to avoid unique index conflicts)
    if (sanitizedPhone) {
      contactData.phone = sanitizedPhone;
      contactData.phoneNumber = sanitizedPhone;
    }
    
    // Omit businessId to avoid unique index conflict on businessId_1_phoneNumber_1
    
    const contact = await Contact.create(contactData);

    console.log('✅ [CONTACT] Lead saved to database:', {
      id: contact._id,
      name: sanitizedName,
      email: sanitizedEmail,
      restaurantName: sanitizedRestaurantName || 'N/A',
      status: contact.status,
      createdAt: contact.createdAt
    });

    // TODO: Send email notification to admin
    // TODO: Send auto-reply to user
    // This can be implemented using nodemailer or similar service

    res.status(201).json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.',
      data: {
        id: contact._id
      }
    });
  } catch (error) {
    console.error('❌ [CONTACT] Error submitting contact form:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

/**
 * @desc    Get all contact leads (Admin only)
 * @route   GET /api/contact
 * @access  Super Admin only
 */
const getAllLeads = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    
    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { restaurantName: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Get total count
    const total = await Contact.countDocuments(query);
    
    // Get leads
    const leads = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('-__v');
    
    res.status(200).json({
      success: true,
      data: {
        leads,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('❌ [CONTACT] Error fetching leads:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

/**
 * @desc    Get single lead by ID (Admin only)
 * @route   GET /api/contact/:id
 * @access  Super Admin only
 */
const getLeadById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const lead = await Contact.findById(id);
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: lead
    });
  } catch (error) {
    console.error('❌ [CONTACT] Error fetching lead:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

/**
 * @desc    Update lead status (Admin only)
 * @route   PATCH /api/contact/:id/status
 * @access  Super Admin only
 */
const updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['new', 'read', 'replied', 'archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    const lead = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Lead status updated successfully',
      data: lead
    });
  } catch (error) {
    console.error('❌ [CONTACT] Error updating lead status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

/**
 * @desc    Get lead statistics (Admin only)
 * @route   GET /api/contact/stats
 * @access  Super Admin only
 */
const getLeadStats = async (req, res) => {
  try {
    const stats = await Contact.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const total = await Contact.countDocuments();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await Contact.countDocuments({
      createdAt: { $gte: today }
    });
    
    const statsObj = {
      total,
      today: todayCount,
      new: 0,
      read: 0,
      replied: 0,
      archived: 0
    };
    
    stats.forEach(stat => {
      statsObj[stat._id] = stat.count;
    });
    
    res.status(200).json({
      success: true,
      data: statsObj
    });
  } catch (error) {
    console.error('❌ [CONTACT] Error fetching lead stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

module.exports = {
  submitContact,
  getAllLeads,
  getLeadById,
  updateLeadStatus,
  getLeadStats
};

