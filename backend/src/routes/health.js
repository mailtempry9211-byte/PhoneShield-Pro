/**
 * Health Check Routes
 * =============================================
 * Defines the /api/health endpoint that returns
 * the current status of the backend service.
 * =============================================
 */

const express = require('express');
const { getHealth } = require('../controllers/healthController');

// Create a new Express router instance
const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Public (no authentication required)
 * @returns {Object} { success: true, message: "Backend Running" }
 */
router.route('/').get(getHealth);

// Export the router for use in the main routes index
module.exports = router;
