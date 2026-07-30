/**
 * Repair Routes
 * =============================================
 * Defines the repair CRUD endpoints.
 * All routes are protected by JWT auth middleware.
 *
 * Route Map:
 *   POST   /api/repairs      - Create a new repair job
 *   GET    /api/repairs      - Get all repairs (search + pagination)
 *   GET    /api/repairs/:id  - Get a single repair
 *   PUT    /api/repairs/:id  - Update a repair
 *   DELETE /api/repairs/:id  - Delete a repair
 * =============================================
 */

const express = require('express');
const {
  createRepair,
  getRepairs,
  getRepair,
  updateRepair,
  deleteRepair,
} = require('../controllers/repairController');
const authenticate = require('../middleware/auth');

const router = express.Router();

// Protect all repair routes with JWT authentication
router.use(authenticate);

router.post('/', createRepair);
router.get('/', getRepairs);
router.get('/:id', getRepair);
router.put('/:id', updateRepair);
router.delete('/:id', deleteRepair);

module.exports = router;