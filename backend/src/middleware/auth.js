/**
 * Authentication Middleware
 * =============================================
 * Verifies JWT tokens sent by the client in the
 * Authorization header. If the token is valid,
 * the decoded user payload is attached to
 * req.user for downstream controllers.
 *
 * Expected Header Format:
 *   Authorization: Bearer <token>
 * =============================================
 */

const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');

/**
 * Express middleware that authenticates requests using JWT.
 *
 * @async
 * @function authenticate
 * @param {Object}   req - Express request object.
 * @param {Object}   res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {void}
 */
const authenticate = async (req, res, next) => {
  try {
    let token;

    // Extract the token from the Authorization header
    // Expected format: "Bearer <token>"
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // If no token is present, the request is unauthorized
    if (!token) {
      return next(new ApiError(401, 'Not authorized, no token provided'));
    }

    // Verify the token using the secret key from the environment
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded user payload to the request object
    // so that downstream controllers can access user data
    req.user = decoded;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // Handle invalid/expired tokens
    return next(new ApiError(401, 'Not authorized, token invalid or expired'));
  }
};

// Export the middleware for use in route definitions
module.exports = authenticate;
