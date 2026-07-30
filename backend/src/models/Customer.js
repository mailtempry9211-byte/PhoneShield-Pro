/**
 * Customer Model
 * =============================================
 * Defines the schema for customers in the
 * PhoneShield Pro backend. Tracks contact info,
 * KYC documents, purchase statistics, and audit data.
 * =============================================
 */

const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    // Full name of the customer (required)
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

    // Aadhaar number (optional)
    aadhaarNumber: {
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

    // Total number of purchases by this customer
    totalPurchases: {
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

// Export the Customer model
module.exports = mongoose.model('Customer', customerSchema);