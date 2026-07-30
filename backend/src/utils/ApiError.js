/**
 * API Error Utility
 * =============================================
 * A standardized error class for handling and
 * propagating operational errors throughout the
 * PhoneShield Pro backend. Works in tandem with
 * the global error-handling middleware to produce
 * consistent error responses.
 *
 * Error Format:
 * {
 *   success: false,
 *   message: "Descriptive error message",
 *   statusCode: 400,
 *   errors: [ ... ]  // optional, for validation errors
 * }
 * =============================================
 */

/**
 * Custom error class for API-level errors.
 *
 * @class ApiError
 * @extends {Error}
 * @param {number}  statusCode - HTTP status code (e.g. 400, 404, 500).
 * @param {string}  message    - Human-readable error message.
 * @param {Array}   [errors]   - Optional array of detailed error objects
 *                               (e.g. validation errors).
 * @param {boolean} [isOperational=true] - Whether the error is operational
 *                                         (expected) or a programming error.
 */
class ApiError extends Error {
  constructor(statusCode, message, errors = [], isOperational = true) {
    // Call the parent Error constructor with the message
    super(message);

    // HTTP status code for the error response
    this.statusCode = statusCode;

    // Boolean flag indicating this is an error (always false for ApiError)
    this.success = false;

    // Optional array of detailed error objects (e.g. field-level validation errors)
    this.errors = errors;

    // Marks the error as operational (expected) vs. a programming bug
    this.isOperational = isOperational;

    // Maintain a proper stack trace in V8 environments (Node.js)
    Error.captureStackTrace(this, this.constructor);
  }
}

// Export the class so it can be used across controllers and middleware
module.exports = ApiError;
