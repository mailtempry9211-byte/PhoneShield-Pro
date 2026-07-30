/**
 * Seller Controller
 * =============================================
 * Handles CRUD operations for sellers:
 *   - createSeller:  POST /api/sellers
 *   - getSellers:    GET  /api/sellers (search + pagination)
 *   - getSeller:     GET  /api/sellers/:id
 *   - updateSeller:  PUT  /api/sellers/:id
 *   - deleteSeller:  DELETE /api/sellers/:id
 *
 * Supports search by name and phone, plus pagination.
 * All routes protected by JWT auth middleware.
 * =============================================
 */

const Seller = require('../models/Seller');
const ApiError = require('../utils/ApiError');

/**
 * Create a new seller.
 *
 * @route POST /api/sellers
 * @access Private
 */
exports.createSeller = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      alternatePhone,
      email,
      aadhaarNumber,
      panNumber,
      address,
      city,
      state,
      pincode,
      documentImages,
      notes,
      totalDeals,
      totalPurchaseAmount,
    } = req.body;

    // --- Input Validation ---
    if (!name || !phone) {
      return next(new ApiError(400, 'Required fields: name, phone'));
    }

    // --- Create Seller ---
    const seller = await Seller.create({
      name,
      phone,
      alternatePhone,
      email,
      aadhaarNumber,
      panNumber,
      address,
      city,
      state,
      pincode,
      documentImages,
      notes,
      totalDeals,
      totalPurchaseAmount,
      createdBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      seller,
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Get all sellers with search and pagination.
 *
 * Query params:
 *   - search:  Search by name or phone (case-insensitive)
 *   - page:    Page number (default 1)
 *   - limit:   Items per page (default 10)
 *
 * @route GET /api/sellers
 * @access Private
 */
exports.getSellers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    // Build search filter
    const filter = {};
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [{ name: searchRegex }, { phone: searchRegex }];
    }

    // Execute query with pagination
    const sellers = await Seller.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination metadata
    const total = await Seller.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      count: sellers.length,
      total,
      page,
      totalPages,
      sellers,
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Get a single seller by ID.
 *
 * @route GET /api/sellers/:id
 * @access Private
 */
exports.getSeller = async (req, res, next) => {
  try {
    const seller = await Seller.findById(req.params.id);

    if (!seller) {
      return next(new ApiError(404, 'Seller not found'));
    }

    return res.status(200).json({
      success: true,
      seller,
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Update a seller by ID.
 *
 * @route PUT /api/sellers/:id
 * @access Private
 */
exports.updateSeller = async (req, res, next) => {
  try {
    const allowedUpdates = [
      'name',
      'phone',
      'alternatePhone',
      'email',
      'aadhaarNumber',
      'panNumber',
      'address',
      'city',
      'state',
      'pincode',
      'documentImages',
      'notes',
      'totalDeals',
      'totalPurchaseAmount',
    ];
    const updateData = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }

    const seller = await Seller.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!seller) {
      return next(new ApiError(404, 'Seller not found'));
    }

    return res.status(200).json({
      success: true,
      seller,
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Delete a seller by ID.
 *
 * @route DELETE /api/sellers/:id
 * @access Private
 */
exports.deleteSeller = async (req, res, next) => {
  try {
    const seller = await Seller.findByIdAndDelete(req.params.id);

    if (!seller) {
      return next(new ApiError(404, 'Seller not found'));
    }

    return res.status(200).json({
      success: true,
      message: 'Seller deleted successfully',
    });
  } catch (err) {
    return next(err);
  }
};