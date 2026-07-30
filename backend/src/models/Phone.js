/**
 * Phone Model
 * =============================================
 * Defines the schema for phone inventory items
 * in the PhoneShield Pro backend. Tracks device
 * details, pricing, seller/customer info, status,
 * images, and audit metadata.
 * =============================================
 */

const mongoose = require('mongoose');

// Define the phone schema with all required fields
const phoneSchema = new mongoose.Schema(
  {
    // Brand of the phone (e.g. Apple, Samsung)
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
    },

    // Model name (e.g. iPhone 13 Pro)
    model: {
      type: String,
      required: [true, 'Model is required'],
      trim: true,
    },

    // IMEI number (unique identifier)
    imei: {
      type: String,
      required: [true, 'IMEI is required'],
      unique: true,
      trim: true,
    },

    // Storage capacity (e.g. 128GB)
    storage: {
      type: String,
      trim: true,
      default: '',
    },

    // RAM capacity (e.g. 6GB)
    ram: {
      type: String,
      trim: true,
      default: '',
    },

    // Color of the device
    color: {
      type: String,
      trim: true,
      default: '',
    },

    // Battery health percentage
    batteryHealth: {
      type: String,
      trim: true,
      default: '',
    },

    // Physical condition (e.g. Excellent, Good, Fair)
    condition: {
      type: String,
      trim: true,
      default: '',
    },

    // Purchase price of the device
    purchasePrice: {
      type: Number,
      required: [true, 'Purchase price is required'],
      min: [0, 'Purchase price cannot be negative'],
    },

    // Selling price of the device
    sellingPrice: {
      type: Number,
      default: 0,
      min: [0, 'Selling price cannot be negative'],
    },

    // Seller information (name or reference)
    seller: {
      type: String,
      trim: true,
      default: '',
    },

    // Customer information (name or reference)
    customer: {
      type: String,
      trim: true,
      default: '',
    },

    // Status of the phone in inventory
    status: {
      type: String,
      enum: ['in-stock', 'sold', 'reserved', 'returned'],
      default: 'in-stock',
    },

    // Array of image URLs/paths
    images: {
      type: [String],
      default: [],
    },

    // Invoice number for the transaction
    invoiceNumber: {
      type: String,
      trim: true,
      default: '',
    },

    // Additional notes
    notes: {
      type: String,
      trim: true,
      default: '',
    },

    // User who created this record (audit)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// Export the Phone model for use in controllers
module.exports = mongoose.model('Phone', phoneSchema);