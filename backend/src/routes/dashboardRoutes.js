/**
 * Dashboard Routes
 * =============================================
 * Defines the dashboard statistics endpoint.
 * All routes are protected by JWT auth middleware.
 *
 * Route Map:
 *   GET /api/dashboard - Get dashboard statistics
 * =============================================
 */

const express = require('express');
const { getDashboard } = require('../controllers/dashboardController');
const authenticate = require('../middleware/auth');

const router = express.Router();

// Protect dashboard route with JWT authentication
router.use(authenticate);

router.get('/', getDashboard);

module.exports = router;