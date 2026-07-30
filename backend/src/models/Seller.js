/**
 * Seller Model
 * =============================================
 * Defines the schema for sellers in the
 * PhoneShield Pro backend. Tracks contact info,
 * KYC documents, deal statistics, and audit data.
 * =============================================
 */

const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema(
  {
    // Full name of the seller (required)
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },

    // Primary phone number (required)
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },

    // Alternate phone number (optional)
    alternatePhone: {
      type: String,
      trim: true,
      default: '',
    },

    // Email address (optional)
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
      default: '',
    },

    // Aadhaar number (optional)
    aadhaarNumber: {
      type: String,
      trim: true,
      default: '',
    },

    // PAN number (optional)
    panNumber: {
      type: String,
      trim: true,
      default: '',
    },

    // Full address (optional)
    address: {
      type: String,
      trim: true,
      default: '',
    },

    // City (optional)
    city: {
      type: String,
      trim: true,
      default: '',
    },

    // State (optional)
    state: {
      type: String,
      trim: true,
      default: '',
    },

    // Pincode (optional)
    pincode: {
      type: String,
      trim: true,
      default: '',
    },

    // Array of document image URLs/paths
    documentImages: {
      type: [String],
      default: [],
    },

    // Additional notes
    notes: {
      type: String,
      trim: true,
      default: '',
    },

    // Total number of deals with this seller
    totalDeals: {
      type: Number,
      default: 0,
    },

    // Total purchase amount from this seller
    totalPurchaseAmount: {
      type: Number,
      default: 0,
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

// Export the Seller model
module.exports = mongoose.model('Seller', sellerSchema);