/**
 * Not Found Middleware
 * =============================================
 * Catches all requests that do not match any
 * defined route and returns a 404 response.
 * This middleware should be registered AFTER
 * all route definitions in the Express app.
 * =============================================
 */

const ApiError = require('../utils/ApiError');

/**
 * Express middleware that handles unmatched routes.
 *
 * @function notFound
 * @param {Object}   req - Express request object.
 * @param {Object}   res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {void}
 */
const notFound = (req, res, next) => {
  // Create a 404 ApiError with a descriptive message including the requested URL
  const error = new ApiError(
    404,
    `Route not found - ${req.originalUrl}`
  );

  // Pass the error to the global error-handling middleware
  next(error);
};

// Export the middleware for use in server.js
module.exports = notFound;
