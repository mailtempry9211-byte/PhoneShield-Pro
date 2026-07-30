/**
 * Phone Routes
 * =============================================
 * Defines the phone inventory CRUD endpoints
 * for the PhoneShield Pro backend.
 *
 * All routes are protected by JWT auth middleware.
 *
 * Route Map:
 *   POST   /api/phones      - Create a new phone
 *   GET    /api/phones      - Get all phones
 *   GET    /api/phones/:id  - Get a single phone
 *   PUT    /api/phones/:id  - Update a phone
 *   DELETE /api/phones/:id  - Delete a phone
 * =============================================
 */

const express = require('express');
const {
  createPhone,
  getPhones,
  getPhone,
  updatePhone,
  deletePhone,
} = require('../controllers/phoneController');
const authenticate = require('../middleware/auth');

// Create a new Express router instance
const router = express.Router();

// Protect all phone routes with JWT authentication
router.use(authenticate);

/**
 * @route   POST /api/phones
 * @desc    Create a new phone inventory item
 * @access  Private
 */
router.post('/', createPhone);

/**
 * @route   GET /api/phones
 * @desc    Get all phone inventory items (supports query filters)
 * @access  Private
 */
router.get('/', getPhones);

/**
 * @route   GET /api/phones/:id
 * @desc    Get a single phone by ID
 * @access  Private
 */
router.get('/:id', getPhone);

/**
 * @route   PUT /api/phones/:id
 * @desc    Update a phone by ID
 * @access  Private
 */
router.put('/:id', updatePhone);

/**
 * @route   DELETE /api/phones/:id
 * @desc    Delete a phone by ID
 * @access  Private
 */
router.delete('/:id', deletePhone);

// Export the router for use in the main routes index
module.exports = router;