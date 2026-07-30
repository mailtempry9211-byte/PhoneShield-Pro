/**
 * Report Routes
 * =============================================
 * Defines report generation endpoints.
 * All routes are protected by JWT auth middleware.
 *
 * Route Map:
 *   GET /api/reports/daily        - Daily report
 *   GET /api/reports/weekly       - Weekly report
 *   GET /api/reports/monthly      - Monthly report
 *   GET /api/reports/profit       - Profit report
 *   GET /api/reports/repairs      - Repair report
 *   GET /api/reports/inventory    - Inventory report
 *   GET /api/reports/top-brands   - Top selling brands
 *   GET /api/reports/top-sellers  - Top sellers
 * =============================================
 */

const express = require('express');
const {
  getDailyReport,
  getWeeklyReport,
  getMonthlyReport,
  getProfitReport,
  getRepairReport,
  getInventoryReport,
  getTopSellingBrands,
  getTopSellers,
} = require('../controllers/reportController');
const authenticate = require('../middleware/auth');

const router = express.Router();

// Protect all report routes with JWT authentication
router.use(authenticate);

router.get('/daily', getDailyReport);
router.get('/weekly', getWeeklyReport);
router.get('/monthly', getMonthlyReport);
router.get('/profit', getProfitReport);
router.get('/repairs', getRepairReport);
router.get('/inventory', getInventoryReport);
router.get('/top-brands', getTopSellingBrands);
router.get('/top-sellers', getTopSellers);

module.exports = router;