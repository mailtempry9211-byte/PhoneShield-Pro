/**
 * Global Error-Handling Middleware
 * =============================================
 * Catches all errors passed via next(error) and
 * sends a standardized JSON error response to the
 * client. This is the central place for error
 * formatting in the PhoneShield Pro backend.
 *
 * Error Response Format:
 * {
 *   success: false,
 *   message: "Descriptive error message",
 *   errors: [...]   // only present for validation errors
 * }
 * =============================================
 */

/**
 * Express error-handling middleware.
 *
 * @function errorHandler
 * @param {Error|Object} err - The error object (may be an ApiError or generic Error).
 * @param {Object}       req - Express request object.
 * @param {Object}       res - Express response object.
 * @param {Function}     next - Express next middleware function.
 * @returns {Object} JSON error response.
 */
const errorHandler = (err, req, res, next) => {
  // Log the error for debugging (in production, consider a logging service)
  console.error(err);

  // Default to 500 (Internal Server Error) if no status code is set
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = [];

  // Handle Mongoose validation errors (e.g. required fields missing)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    // Extract field-level validation error messages from Mongoose
    errors = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message,
    }));
  }

  // Handle Mongoose duplicate key errors (e.g. unique field violation)
  if (err.code && err.code === 11000) {
    statusCode = 409;
    // Extract the duplicated field name from the error response
    const field = Object.keys(err.keyValue)[0];
    message = `${field ? field.charAt(0).toUpperCase() + field.slice(1) : 'Field'} already exists`;
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId format)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Build the error response object
  const errorResponse = {
    success: false,
    message,
  };

  // Include detailed errors array if present (e.g. validation errors)
  if (errors.length > 0) {
    errorResponse.errors = errors;
  }

  // In production, hide internal error details for non-operational errors
  if (process.env.NODE_ENV === 'production' && !err.isOperational) {
    errorResponse.message = 'Something went wrong';
    delete errorResponse.errors;
  }

  // Send the standardized error response
  return res.status(statusCode).json(errorResponse);
};

// Export the error handler for use in server.js
module.exports = errorHandler;