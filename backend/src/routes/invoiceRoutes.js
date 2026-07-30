/**
 * Invoice Routes
 * =============================================
 * Defines the invoice generation endpoints.
 * All routes are protected by JWT auth middleware.
 *
 * Route Map:
 *   GET /api/invoice/sale/:id    - Generate sale invoice (HTML)
 *   GET /api/invoice/repair/:id  - Generate repair invoice (HTML)
 * =============================================
 */

const express = require('express');
const { getSaleInvoice, getRepairInvoice } = require('../controllers/invoiceController');
const authenticate = require('../middleware/auth');

const router = express.Router();

// Protect all invoice routes with JWT authentication
router.use(authenticate);

router.get('/sale/:id', getSaleInvoice);
router.get('/repair/:id', getRepairInvoice);

module.exports = router;