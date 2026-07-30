/**
 * Search Controller
 * =============================================
 * Global search across all entities:
 *   - Phones
 *   - Sellers
 *   - Customers
 *   - Repairs
 *   - Invoices
 *
 * Searches by:
 *   - IMEI
 *   - Phone number
 *   - Name
 *   - Email
 *   - Repair ID
 *
 * All routes protected by JWT auth middleware.
 * =============================================
 */

const Phone = require('../models/Phone');
const Seller = require('../models/Seller');
const Customer = require('../models/Customer');
const Repair = require('../models/Repair');
const ApiError = require('../utils/ApiError');

/**
 * Global search across all entities.
 *
 * @route GET /api/search
 * @access Private
 */
exports.globalSearch = async (req, res, next) => {
  try {
    const query = req.query.q;
    if (!query || query.trim().length < 2) {
      return res.status(200).json({
        success: true,
        results: {
          phones: [],
          sellers: [],
          customers: [],
          repairs: [],
        },
      });
    }

    const searchRegex = new RegExp(query, 'i');
    const results = {
      phones: [],
      sellers: [],
      customers: [],
      repairs: [],
    };

    // Search phones by IMEI, model, brand
    const phones = await Phone.find({
      $or: [
        { imei: searchRegex },
        { model: searchRegex },
        { brand: searchRegex },
        { customer: searchRegex },
      ],
    }).limit(10);
    results.phones = phones;

    // Search sellers by name, phone, email
    const sellers = await Seller.find({
      $or: [
        { name: searchRegex },
        { phone: searchRegex },
        { email: searchRegex },
      ],
    }).limit(10);
    results.sellers = sellers;

    // Search customers by name, phone, email
    const customers = await Customer.find({
      $or: [
        { name: searchRegex },
        { phone: searchRegex },
        { email: searchRegex },
      ],
    }).limit(10);
    results.customers = customers;

    // Search repairs by repairId, customer, phoneNumber, imei
    const repairs = await Repair.find({
      $or: [
        { repairId: searchRegex },
        { customer: searchRegex },
        { phoneNumber: searchRegex },
        { imei: searchRegex },
      ],
    }).limit(10);
    results.repairs = repairs;

    return res.status(200).json({
      success: true,
      results,
    });
  } catch (err) {
    return next(err);
  }
};