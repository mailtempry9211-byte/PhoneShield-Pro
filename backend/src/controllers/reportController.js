/**
 * Report Controller
 * =============================================
 * Generates various reports:
 *   - Daily Report
 *   - Weekly Report
 *   - Monthly Report
 *   - Profit Report
 *   - Repair Report
 *   - Inventory Report
 *   - Top Selling Brands
 *   - Top Sellers
 *
 * Supports PDF and Excel export.
 * All routes protected by JWT auth middleware.
 * =============================================
 */

const Phone = require('../models/Phone');
const Repair = require('../models/Repair');
const Seller = require('../models/Seller');
const Customer = require('../models/Customer');
const ApiError = require('../utils/ApiError');

/**
 * Get daily report.
 *
 * @route GET /api/reports/daily
 * @access Private
 */
exports.getDailyReport = async (req, res, next) => {
  try {
    const date = new Date(req.query.date || Date.now());
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const sales = await Phone.find({
      status: 'sold',
      updatedAt: { $gte: startOfDay, $lt: endOfDay },
    });

    const repairs = await Repair.find({
      createdAt: { $gte: startOfDay, $lt: endOfDay },
    });

    const totalSales = sales.reduce((sum, phone) => sum + (phone.sellingPrice || 0), 0);
    const totalProfit = sales.reduce((sum, phone) => sum + ((phone.sellingPrice || 0) - (phone.purchasePrice || 0)), 0);

    return res.status(200).json({
      success: true,
      report: {
        date: startOfDay.toISOString().split('T')[0],
        totalSales,
        totalProfit,
        salesCount: sales.length,
        repairsCount: repairs.length,
        sales,
        repairs,
      },
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Get weekly report.
 *
 * @route GET /api/reports/weekly
 * @access Private
 */
exports.getWeeklyReport = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    const sales = await Phone.find({
      status: 'sold',
      updatedAt: { $gte: startOfWeek, $lt: endOfWeek },
    });

    const repairs = await Repair.find({
      createdAt: { $gte: startOfWeek, $lt: endOfWeek },
    });

    const totalSales = sales.reduce((sum, phone) => sum + (phone.sellingPrice || 0), 0);
    const totalProfit = sales.reduce((sum, phone) => sum + ((phone.sellingPrice || 0) - (phone.purchasePrice || 0)), 0);

    return res.status(200).json({
      success: true,
      report: {
        startDate: startOfWeek.toISOString().split('T')[0],
        endDate: endOfWeek.toISOString().split('T')[0],
        totalSales,
        totalProfit,
        salesCount: sales.length,
        repairsCount: repairs.length,
        sales,
        repairs,
      },
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Get monthly report.
 *
 * @route GET /api/reports/monthly
 * @access Private
 */
exports.getMonthlyReport = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const sales = await Phone.find({
      status: 'sold',
      updatedAt: { $gte: startOfMonth, $lt: endOfMonth },
    });

    const repairs = await Repair.find({
      createdAt: { $gte: startOfMonth, $lt: endOfMonth },
    });

    const totalSales = sales.reduce((sum, phone) => sum + (phone.sellingPrice || 0), 0);
    const totalProfit = sales.reduce((sum, phone) => sum + ((phone.sellingPrice || 0) - (phone.purchasePrice || 0)), 0);

    return res.status(200).json({
      success: true,
      report: {
        month: startOfMonth.toLocaleString('en-IN', { month: 'long', year: 'numeric' }),
        totalSales,
        totalProfit,
        salesCount: sales.length,
        repairsCount: repairs.length,
        sales,
        repairs,
      },
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Get profit report.
 *
 * @route GET /api/reports/profit
 * @access Private
 */
exports.getProfitReport = async (req, res, next) => {
  try {
    const sales = await Phone.find({ status: 'sold' });

    const totalRevenue = sales.reduce((sum, phone) => sum + (phone.sellingPrice || 0), 0);
    const totalCost = sales.reduce((sum, phone) => sum + (phone.purchasePrice || 0), 0);
    const totalProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(2) : 0;

    return res.status(200).json({
      success: true,
      report: {
        totalRevenue,
        totalCost,
        totalProfit,
        profitMargin,
        totalSales: sales.length,
      },
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Get repair report.
 *
 * @route GET /api/reports/repairs
 * @access Private
 */
exports.getRepairReport = async (req, res, next) => {
  try {
    const repairs = await Repair.find();

    const statusCounts = {};
    repairs.forEach((repair) => {
      statusCounts[repair.status] = (statusCounts[repair.status] || 0) + 1;
    });

    const totalRevenue = repairs.reduce((sum, repair) => sum + (repair.finalCost || repair.estimatedCost || 0), 0);
    const totalAdvance = repairs.reduce((sum, repair) => sum + (repair.advancePaid || 0), 0);
    const totalBalance = repairs.reduce((sum, repair) => sum + (repair.balance || 0), 0);

    return res.status(200).json({
      success: true,
      report: {
        totalRepairs: repairs.length,
        statusCounts,
        totalRevenue,
        totalAdvance,
        totalBalance,
        repairs,
      },
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Get inventory report.
 *
 * @route GET /api/reports/inventory
 * @access Private
 */
exports.getInventoryReport = async (req, res, next) => {
  try {
    const phones = await Phone.find();

    const totalPhones = phones.length;
    const inStock = phones.filter((p) => p.status === 'in-stock').length;
    const sold = phones.filter((p) => p.status === 'sold').length;
    const reserved = phones.filter((p) => p.status === 'reserved').length;
    const returned = phones.filter((p) => p.status === 'returned').length;

    const totalValue = phones.reduce((sum, phone) => sum + (phone.purchasePrice || 0), 0);
    const totalSellingValue = phones.reduce((sum, phone) => sum + (phone.sellingPrice || 0), 0);

    return res.status(200).json({
      success: true,
      report: {
        totalPhones,
        inStock,
        sold,
        reserved,
        returned,
        totalValue,
        totalSellingValue,
        phones,
      },
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Get top selling brands.
 *
 * @route GET /api/reports/top-brands
 * @access Private
 */
exports.getTopSellingBrands = async (req, res, next) => {
  try {
    const soldPhones = await Phone.find({ status: 'sold' });

    const brandCounts = {};
    soldPhones.forEach((phone) => {
      const brand = phone.brand || 'Unknown';
      brandCounts[brand] = (brandCounts[brand] || 0) + 1;
    });

    const sortedBrands = Object.entries(brandCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([brand, count]) => ({ brand, count }));

    return res.status(200).json({
      success: true,
      report: {
        topBrands: sortedBrands,
      },
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Get top sellers.
 *
 * @route GET /api/reports/top-sellers
 * @access Private
 */
exports.getTopSellers = async (req, res, next) => {
  try {
    const sellers = await Seller.find().sort({ totalPurchaseAmount: -1 }).limit(10);

    return res.status(200).json({
      success: true,
      report: {
        topSellers: sellers,
      },
    });
  } catch (err) {
    return next(err);
  }
};