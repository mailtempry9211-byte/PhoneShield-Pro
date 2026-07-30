/**
 * Auth Routes
 * =============================================
 * Defines the authentication endpoints for the
 * PhoneShield Pro backend.
 *
 * Route Map:
 *   POST /api/auth/register  - Register a new user
 *   POST /api/auth/login     - Login an existing user
 *   GET  /api/auth/profile   - Get the authenticated user's profile
 * =============================================
 */

const express = require('express');
const { register, login, getProfile } = require('../controllers/authController');
const authenticate = require('../middleware/auth');

// Create a new Express router instance
const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate an existing user
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   GET /api/auth/profile
 * @desc    Get the authenticated user's profile
 * @access  Private (requires valid JWT)
 */
router.get('/profile', authenticate, getProfile);

// Export the router for use in the main routes index
module.exports = router;