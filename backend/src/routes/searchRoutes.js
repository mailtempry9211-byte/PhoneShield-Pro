/**
 * Search Routes
 * =============================================
 * Defines global search endpoint.
 * All routes are protected by JWT auth middleware.
 *
 * Route Map:
 *   GET /api/search?q=query - Global search across all entities
 * =============================================
 */

const express = require('express');
const { globalSearch } = require('../controllers/searchController');
const authenticate = require('../middleware/auth');

const router = express.Router();

// Protect search route with JWT authentication
router.use(authenticate);

router.get('/', globalSearch);

module.exports = router;