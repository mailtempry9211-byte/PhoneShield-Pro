/**
 * User Model
 * =============================================
 * Defines the schema for user accounts in the
 * PhoneShield Pro backend. Includes fields for
 * authentication (email, password), profile data
 * (name, phone), and role-based access control.
 *
 * Security Notes:
 *   - Password is excluded from queries by default
 *     via `select: false`. Use `.select('+password')`
 *     when password comparison is needed (e.g. login).
 *   - Email is normalized to lowercase before saving.
 * =============================================
 */

const mongoose = require('mongoose');

// Define the user schema with all required fields
const userSchema = new mongoose.Schema(
  {
    // Full name of the user (required)
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
    },

    // Email address (required, unique, normalized to lowercase)
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },

    // Hashed password (required, excluded from queries by default)
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false, // Excluded from find queries unless explicitly selected
    },

    // Phone number (required)
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },

    // Role-based access control (admin or staff, defaults to admin)
    role: {
      type: String,
      enum: ['admin', 'staff'],
      default: 'admin',
    },
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// Export the User model for use in controllers
module.exports = mongoose.model('User', userSchema);