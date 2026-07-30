/**
 * Customer Controller
 * =============================================
 * Handles CRUD operations for customers:
 *   - createCustomer:  POST /api/customers
 *   - getCustomers:    GET  /api/customers (search + pagination)
 *   - getCustomer:     GET  /api/customers/:id
 *   - updateCustomer:  PUT  /api/customers/:id
 *   - deleteCustomer:  DELETE /api/customers/:id
 *
 * Supports search by name and phone, plus pagination.
 * All routes protected by JWT auth middleware.
 * =============================================
 */

const Customer = require('../models/Customer');
const ApiError = require('../utils/ApiError');

/**
 * Create a new customer.
 *
 * @route POST /api/customers
 * @access Private
 */
exports.createCustomer = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      alternatePhone,
      email,
      address,
      city,
      state,
      pincode,
      aadhaarNumber,
      documentImages,
      notes,
      totalPurchases,
    } = req.body;

    // --- Input Validation ---
    if (!name || !phone) {
      return next(new ApiError(400, 'Required fields: name, phone'));
    }

    // --- Create Customer ---
    const customer = await Customer.create({
      name,
      phone,
      alternatePhone,
      email,
      address,
      city,
      state,
      pincode,
      aadhaarNumber,
      documentImages,
      notes,
      totalPurchases,
      createdBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      customer,
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Get all customers with search and pagination.
 *
 * Query params:
 *   - search:  Search by name or phone (case-insensitive)
 *   - page:    Page number (default 1)
 *   - limit:   Items per page (default 10)
 *
 * @route GET /api/customers
 * @access Private
 */
exports.getCustomers = async (req, res, next) => {
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
    const customers = await Customer.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination metadata
    const total = await Customer.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      count: customers.length,
      total,
      page,
      totalPages,
      customers,
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Get a single customer by ID.
 *
 * @route GET /api/customers/:id
 * @access Private
 */
exports.getCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return next(new ApiError(404, 'Customer not found'));
    }

    return res.status(200).json({
      success: true,
      customer,
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Update a customer by ID.
 *
 * @route PUT /api/customers/:id
 * @access Private
 */
exports.updateCustomer = async (req, res, next) => {
  try {
    const allowedUpdates = [
      'name',
      'phone',
      'alternatePhone',
      'email',
      'address',
      'city',
      'state',
      'pincode',
      'aadhaarNumber',
      'documentImages',
      'notes',
      'totalPurchases',
    ];
    const updateData = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return next(new ApiError(404, 'Customer not found'));
    }

    return res.status(200).json({
      success: true,
      customer,
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Delete a customer by ID.
 *
 * @route DELETE /api/customers/:id
 * @access Private
 */
exports.deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);

    if (!customer) {
      return next(new ApiError(404, 'Customer not found'));
    }

    return res.status(200).json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (err) {
    return next(err);
  }
};