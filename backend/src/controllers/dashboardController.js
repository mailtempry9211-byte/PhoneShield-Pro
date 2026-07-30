/**
 * Dashboard Controller
 * =============================================
 * Provides aggregated statistics for the dashboard:
 *   - Total Phones
 *   - Available Phones
 *   - Sold Phones
 *   - Total Sellers
 *   - Total Customers
 *   - Total Repairs
 *   - Pending Repairs
 *   - Completed Repairs
 *   - Today's Sales
 *   - Today's Repairs
 *   - Monthly Sales
 *   - Monthly Profit
 *   - Recent Sales
 *   - Recent Repairs
 *
 * @route GET /api/dashboard
 * @access Private
 * =============================================
 */

const Phone = require('../models/Phone');
const Repair = require('../models/Repair');
const Seller = require('../models/Seller');
const Customer = require('../models/Customer');
const ApiError = require('../utils/ApiError');

/**
 * Get dashboard statistics.
 *
 * @route GET /api/dashboard
 * @access Private
 */
exports.getDashboard = async (req, res, next) => {
  try {
    // --- Date Ranges ---
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // --- Phone Stats ---
    const totalPhones = await Phone.countDocuments();
    const availablePhones = await Phone.countDocuments({ status: 'in-stock' });
    const soldPhones = await Phone.countDocuments({ status: 'sold' });

    // --- Seller & Customer Stats ---
    const totalSellers = await Seller.countDocuments();
    const totalCustomers = await Customer.countDocuments();

    // --- Repair Stats ---
    const totalRepairs = await Repair.countDocuments();
    const pendingRepairs = await Repair.countDocuments({
      status: { $nin: ['Delivered', 'Cancelled'] },
    });
    const completedRepairs = await Repair.countDocuments({ status: 'Delivered' });

    // --- Today's Stats ---
    const todaysSales = await Phone.countDocuments({
      status: 'sold',
      updatedAt: { $gte: startOfToday },
    });

    const todaysRepairs = await Repair.countDocuments({
      createdAt: { $gte: startOfToday },
    });

    // --- Monthly Stats ---
    const monthlySalesPhones = await Phone.find({
      status: 'sold',
      updatedAt: { $gte: startOfMonth },
    });

    const monthlySales = monthlySalesPhones.reduce(
      (sum, phone) => sum + (phone.sellingPrice || 0),
      0
    );

    const monthlyProfit = monthlySalesPhones.reduce(
      (sum, phone) => sum + ((phone.sellingPrice || 0) - (phone.purchasePrice || 0)),
      0
    );

    // --- Recent Sales (last 5 sold phones) ---
    const recentSales = await Phone.find({ status: 'sold' })
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean();

    // --- Recent Repairs (last 5) ---
    const recentRepairs = await Repair.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return res.status(200).json({
      success: true,
      dashboard: {
        totalPhones,
        availablePhones,
        soldPhones,
        totalSellers,
        totalCustomers,
        totalRepairs,
        pendingRepairs,
        completedRepairs,
        todaysSales,
        todaysRepairs,
        monthlySales,
        monthlyProfit,
        recentSales,
        recentRepairs,
      },
    });
  } catch (err) {
    return next(err);
  }
};