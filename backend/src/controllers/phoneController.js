/**
 * Phone Controller
 * =============================================
 * Handles CRUD operations for phone inventory:
 *   - createPhone:  POST /api/phones
 *   - getPhones:    GET  /api/phones
 *   - getPhone:     GET  /api/phones/:id
 *   - updatePhone:  PUT  /api/phones/:id
 *   - deletePhone:  DELETE /api/phones/:id
 *
 * All routes are protected by JWT auth middleware.
 * createdBy is automatically set from req.user.id.
 * =============================================
 */

const Phone = require('../models/Phone');
const ApiError = require('../utils/ApiError');

/**
 * Create a new phone inventory item.
 *
 * @route POST /api/phones
 * @access Private
 */
exports.createPhone = async (req, res, next) => {
  try {
    const {
      brand,
      model,
      imei,
      storage,
      ram,
      color,
      batteryHealth,
      condition,
      purchasePrice,
      sellingPrice,
      seller,
      customer,
      status,
      images,
      invoiceNumber,
      notes,
    } = req.body;

    // --- Input Validation ---
    if (!brand || !model || !imei || purchasePrice === undefined || purchasePrice === null) {
      return next(
        new ApiError(400, 'Required fields: brand, model, imei, purchasePrice')
      );
    }

    // --- Duplicate IMEI Check ---
    const existingPhone = await Phone.findOne({ imei });
    if (existingPhone) {
      return next(new ApiError(409, 'IMEI already exists'));
    }

    // --- Create Phone ---
    const phone = await Phone.create({
      brand,
      model,
      imei,
      storage,
      ram,
      color,
      batteryHealth,
      condition,
      purchasePrice,
      sellingPrice,
      seller,
      customer,
      status,
      images,
      invoiceNumber,
      notes,
      createdBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      phone,
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Get all phone inventory items.
 * Supports optional query filters (e.g. ?status=in-stock&brand=Apple).
 *
 * @route GET /api/phones
 * @access Private
 */
exports.getPhones = async (req, res, next) => {
  try {
    // Build filter from query params (only allow known fields)
    const allowedFilters = ['brand', 'model', 'status', 'condition', 'seller', 'customer'];
    const filter = {};
    for (const key of allowedFilters) {
      if (req.query[key]) {
        filter[key] = req.query[key];
      }
    }

    const phones = await Phone.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: phones.length,
      phones,
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Get a single phone by ID.
 *
 * @route GET /api/phones/:id
 * @access Private
 */
exports.getPhone = async (req, res, next) => {
  try {
    const phone = await Phone.findById(req.params.id);

    if (!phone) {
      return next(new ApiError(404, 'Phone not found'));
    }

    return res.status(200).json({
      success: true,
      phone,
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Update a phone by ID.
 *
 * @route PUT /api/phones/:id
 * @access Private
 */
exports.updatePhone = async (req, res, next) => {
  try {
    // Build update object from allowed fields only
    const allowedUpdates = [
      'brand',
      'model',
      'imei',
      'storage',
      'ram',
      'color',
      'batteryHealth',
      'condition',
      'purchasePrice',
      'sellingPrice',
      'seller',
      'customer',
      'status',
      'images',
      'invoiceNumber',
      'notes',
    ];
    const updateData = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }

    // If IMEI is being updated, check for duplicates
    if (updateData.imei) {
      const existingPhone = await Phone.findOne({
        imei: updateData.imei,
        _id: { $ne: req.params.id },
      });
      if (existingPhone) {
        return next(new ApiError(409, 'IMEI already exists'));
      }
    }

    const phone = await Phone.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!phone) {
      return next(new ApiError(404, 'Phone not found'));
    }

    return res.status(200).json({
      success: true,
      phone,
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Delete a phone by ID.
 *
 * @route DELETE /api/phones/:id
 * @access Private
 */
exports.deletePhone = async (req, res, next) => {
  try {
    const phone = await Phone.findByIdAndDelete(req.params.id);

    if (!phone) {
      return next(new ApiError(404, 'Phone not found'));
    }

    return res.status(200).json({
      success: true,
      message: 'Phone deleted successfully',
    });
  } catch (err) {
    return next(err);
  }
};