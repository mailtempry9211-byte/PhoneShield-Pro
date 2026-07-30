/**
 * Auth Controller
 * =============================================
 * Handles user authentication operations:
 *   - register: Create a new user account
 *   - login:    Authenticate an existing user
 *   - profile:  Get the authenticated user's profile
 *
 * All endpoints return a JWT token and the
 * sanitized user object (password excluded).
 * =============================================
 */

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');

/**
 * Generates a signed JWT token for a given user ID.
 *
 * @function generateToken
 * @param {string} userId - The MongoDB ObjectId of the user.
 * @returns {string} Signed JWT token.
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Builds a sanitized user response object (password excluded).
 *
 * @function sanitizeUser
 * @param {Object} user - Mongoose user document.
 * @returns {Object} Sanitized user object safe for JSON responses.
 */
const sanitizeUser = (user) => {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

/**
 * Register a new user.
 *
 * @route POST /api/auth/register
 * @access Public
 * @returns {Object} { success: true, token: "...", user: {...} }
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    // --- Input Validation ---
    // Ensure all required fields are present and non-empty
    if (!name || !email || !password || !phone) {
      return next(
        new ApiError(400, 'All fields are required: name, email, password, phone')
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(new ApiError(400, 'Please provide a valid email address'));
    }

    // Minimum password length check (8 characters)
    if (password.length < 8) {
      return next(new ApiError(400, 'Password must be at least 8 characters long'));
    }

    // --- Duplicate Email Check ---
    // Only query when email is a valid string to avoid findOne({}) returning any user
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return next(new ApiError(409, 'Email already exists'));
    }

    // --- Password Hashing ---
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // --- Create User ---
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
    });

    // --- Generate JWT Token ---
    const token = generateToken(user._id);

    // --- Send Response ---
    // Exclude password from the response object
    return res.status(201).json({
      success: true,
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    // Forward any unexpected errors to the global error handler
    return next(err);
  }
};

/**
 * Login an existing user.
 *
 * @route POST /api/auth/login
 * @access Public
 * @returns {Object} { success: true, token: "...", user: {...} }
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // --- Input Validation ---
    if (!email || !password) {
      return next(new ApiError(400, 'Email and password are required'));
    }

    // --- Find User ---
    // Explicitly select the password field (it is excluded by default in the schema)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return next(new ApiError(401, 'Invalid credentials'));
    }

    // --- Verify Password ---
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new ApiError(401, 'Invalid credentials'));
    }

    // --- Generate JWT Token ---
    const token = generateToken(user._id);

    // --- Send Response ---
    // Exclude password from the response object
    return res.status(200).json({
      success: true,
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    // Forward any unexpected errors to the global error handler
    return next(err);
  }
};

/**
 * Get the authenticated user's profile.
 *
 * @route GET /api/auth/profile
 * @access Private (requires valid JWT)
 * @returns {Object} { success: true, user: {...} }
 */
exports.getProfile = async (req, res, next) => {
  try {
    // req.user is populated by the authenticate middleware (decoded JWT payload)
    // Fetch the full user document from the database (password excluded by default)
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    // --- Send Response ---
    // Exclude password from the response object
    return res.status(200).json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (err) {
    // Forward any unexpected errors to the global error handler
    return next(err);
  }
};