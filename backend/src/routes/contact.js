const express = require('express');
const router = express.Router();
const { 
  submitContact, 
  getAllLeads, 
  getLeadById, 
  updateLeadStatus,
  getLeadStats 
} = require('../controllers/contactController');
const { authMiddleware, superAdminOnly } = require('../middlewares/authMiddleware');

/**
 * @route   POST /api/contact
 * @desc    Submit contact form (Public - saves lead to database)
 * @access  Public
 */
router.post('/', submitContact);

/**
 * @route   GET /api/contact/stats
 * @desc    Get lead statistics
 * @access  Super Admin only
 */
router.get('/stats', authMiddleware, superAdminOnly, getLeadStats);

/**
 * @route   GET /api/contact
 * @desc    Get all contact leads
 * @access  Super Admin only
 */
router.get('/', authMiddleware, superAdminOnly, getAllLeads);

/**
 * @route   GET /api/contact/:id
 * @desc    Get single lead by ID
 * @access  Super Admin only
 */
router.get('/:id', authMiddleware, superAdminOnly, getLeadById);

/**
 * @route   PATCH /api/contact/:id/status
 * @desc    Update lead status
 * @access  Super Admin only
 */
router.patch('/:id/status', authMiddleware, superAdminOnly, updateLeadStatus);

module.exports = router;

