/**
 * Seller Routes
 * =============================================
 * Defines the seller CRUD endpoints.
 * All routes are protected by JWT auth middleware.
 *
 * Route Map:
 *   POST   /api/sellers      - Create a new seller
 *   GET    /api/sellers      - Get all sellers (search + pagination)
 *   GET    /api/sellers/:id  - Get a single seller
 *   PUT    /api/sellers/:id  - Update a seller
 *   DELETE /api/sellers/:id  - Delete a seller
 * =============================================
 */

const express = require('express');
const {
  createSeller,
  getSellers,
  getSeller,
  updateSeller,
  deleteSeller,
} = require('../controllers/sellerController');
const authenticate = require('../middleware/auth');

const router = express.Router();

// Protect all seller routes with JWT authentication
router.use(authenticate);

router.post('/', createSeller);
router.get('/', getSellers);
router.get('/:id', getSeller);
router.put('/:id', updateSeller);
router.delete('/:id', deleteSeller);

module.exports = router;