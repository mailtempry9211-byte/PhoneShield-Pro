/**
 * Repair Controller
 * =============================================
 * Handles CRUD operations for repair jobs:
 *   - createRepair:  POST /api/repairs
 *   - getRepairs:    GET  /api/repairs (search + pagination)
 *   - getRepair:     GET  /api/repairs/:id
 *   - updateRepair:  PUT  /api/repairs/:id
 *   - deleteRepair:  DELETE /api/repairs/:id
 *
 * Supports search by phone, customer, imei,
 * repairId, and status. Includes pagination.
 * All routes protected by JWT auth middleware.
 * =============================================
 */

const Repair = require('../models/Repair');
const ApiError = require('../utils/ApiError');

/**
 * Create a new repair job.
 *
 * @route POST /api/repairs
 * @access Private
 */
exports.createRepair = async (req, res, next) => {
  try {
    const {
      customer,
      phoneNumber,
      deviceBrand,
      deviceModel,
      imei,
      issue,
      accessories,
      estimatedCost,
      finalCost,
      advancePaid,
      balance,
      technician,
      priority,
      status,
      receivedDate,
      deliveryDate,
      notes,
      images,
    } = req.body;

    // --- Input Validation ---
    if (!customer || !phoneNumber || !deviceBrand || !deviceModel || !issue) {
      return next(
        new ApiError(
          400,
          'Required fields: customer, phoneNumber, deviceBrand, deviceModel, issue'
        )
      );
    }

    // --- Create Repair ---
    const repair = await Repair.create({
      customer,
      phoneNumber,
      deviceBrand,
      deviceModel,
      imei,
      issue,
      accessories,
      estimatedCost,
      finalCost,
      advancePaid,
      balance,
      technician,
      priority,
      status,
      receivedDate,
      deliveryDate,
      notes,
      images,
      createdBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      repair,
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Get all repair jobs with search and pagination.
 *
 * Query params:
 *   - search:  Search by phoneNumber, customer, imei, repairId, status
 *   - status:  Filter by exact status
 *   - page:    Page number (default 1)
 *   - limit:   Items per page (default 10)
 *
 * @route GET /api/repairs
 * @access Private
 */
exports.getRepairs = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};

    // Filter by exact status
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Search across multiple fields
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { phoneNumber: searchRegex },
        { customer: searchRegex },
        { imei: searchRegex },
        { repairId: searchRegex },
        { status: searchRegex },
      ];
    }

    const repairs = await Repair.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Repair.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      count: repairs.length,
      total,
      page,
      totalPages,
      repairs,
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Get a single repair by ID.
 *
 * @route GET /api/repairs/:id
 * @access Private
 */
exports.getRepair = async (req, res, next) => {
  try {
    const repair = await Repair.findById(req.params.id);

    if (!repair) {
      return next(new ApiError(404, 'Repair not found'));
    }

    return res.status(200).json({
      success: true,
      repair,
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Update a repair by ID.
 *
 * @route PUT /api/repairs/:id
 * @access Private
 */
exports.updateRepair = async (req, res, next) => {
  try {
    const allowedUpdates = [
      'customer',
      'phoneNumber',
      'deviceBrand',
      'deviceModel',
      'imei',
      'issue',
      'accessories',
      'estimatedCost',
      'finalCost',
      'advancePaid',
      'balance',
      'technician',
      'priority',
      'status',
      'receivedDate',
      'deliveryDate',
      'notes',
      'images',
    ];
    const updateData = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }

    const repair = await Repair.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!repair) {
      return next(new ApiError(404, 'Repair not found'));
    }

    return res.status(200).json({
      success: true,
      repair,
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Delete a repair by ID.
 *
 * @route DELETE /api/repairs/:id
 * @access Private
 */
exports.deleteRepair = async (req, res, next) => {
  try {
    const repair = await Repair.findByIdAndDelete(req.params.id);

    if (!repair) {
      return next(new ApiError(404, 'Repair not found'));
    }

    return res.status(200).json({
      success: true,
      message: 'Repair deleted successfully',
    });
  } catch (err) {
    return next(err);
  }
};