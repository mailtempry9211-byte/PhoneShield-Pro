/**
 * Repair Model
 * =============================================
 * Defines the schema for repair jobs in the
 * PhoneShield Pro backend. Tracks device info,
 * issue details, costs, technician, status, and
 * audit metadata.
 * =============================================
 */

const mongoose = require('mongoose');

const repairSchema = new mongoose.Schema(
  {
    // Auto-generated repair ID (e.g. REP-000001)
    repairId: {
      type: String,
      unique: true,
      index: true,
    },

    // Customer name (required)
    customer: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },

    // Customer phone number (required)
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },

    // Device brand (required)
    deviceBrand: {
      type: String,
      required: [true, 'Device brand is required'],
      trim: true,
    },

    // Device model (required)
    deviceModel: {
      type: String,
      required: [true, 'Device model is required'],
      trim: true,
    },

    // IMEI number (optional)
    imei: {
      type: String,
      trim: true,
      default: '',
    },

    // Issue description (required)
    issue: {
      type: String,
      required: [true, 'Issue description is required'],
      trim: true,
    },

    // Accessories received with device
    accessories: {
      type: String,
      trim: true,
      default: '',
    },

    // Estimated repair cost
    estimatedCost: {
      type: Number,
      default: 0,
      min: [0, 'Estimated cost cannot be negative'],
    },

    // Final repair cost
    finalCost: {
      type: Number,
      default: 0,
      min: [0, 'Final cost cannot be negative'],
    },

    // Advance payment received
    advancePaid: {
      type: Number,
      default: 0,
      min: [0, 'Advance paid cannot be negative'],
    },

    // Balance remaining
    balance: {
      type: Number,
      default: 0,
    },

    // Technician assigned
    technician: {
      type: String,
      trim: true,
      default: '',
    },

    // Priority level
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },

    // Repair status
    status: {
      type: String,
      enum: [
        'Received',
        'Diagnosing',
        'Waiting Parts',
        'Repairing',
        'Ready',
        'Delivered',
        'Cancelled',
      ],
      default: 'Received',
    },

    // Date device was received
    receivedDate: {
      type: Date,
      default: Date.now,
    },

    // Date device was delivered
    deliveryDate: {
      type: Date,
      default: null,
    },

    // Additional notes
    notes: {
      type: String,
      trim: true,
      default: '',
    },

    // Array of image URLs/paths
    images: {
      type: [String],
      default: [],
    },

    // User who created this record (audit)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate repairId before saving
repairSchema.pre('validate', async function (next) {
  if (!this.repairId) {
    // Find the highest repairId and increment
    const lastRepair = await this.constructor
      .findOne({}, {}, { sort: { repairId: -1 } })
      .lean();

    let nextNumber = 1;
    if (lastRepair && lastRepair.repairId) {
      const match = lastRepair.repairId.match(/REP-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }
    this.repairId = `REP-${String(nextNumber).padStart(6, '0')}`;
  }
  next();
});

// Export the Repair model
module.exports = mongoose.model('Repair', repairSchema);