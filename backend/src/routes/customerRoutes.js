/**
 * Customer Routes
 * =============================================
 * Defines the customer CRUD endpoints.
 * All routes are protected by JWT auth middleware.
 *
 * Route Map:
 *   POST   /api/customers      - Create a new customer
 *   GET    /api/customers      - Get all customers (search + pagination)
 *   GET    /api/customers/:id  - Get a single customer
 *   PUT    /api/customers/:id  - Update a customer
 *   DELETE /api/customers/:id  - Delete a customer
 * =============================================
 */

const express = require('express');
const {
  createCustomer,
  getCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
} = require('../controllers/customerController');
const authenticate = require('../middleware/auth');

const router = express.Router();

// Protect all customer routes with JWT authentication
router.use(authenticate);

router.post('/', createCustomer);
router.get('/', getCustomers);
router.get('/:id', getCustomer);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

module.exports = router;