/**
 * API Response Utility
 * =============================================
 * A standardized wrapper for all successful HTTP
 * responses sent from the backend. Ensures a
 * consistent JSON structure across every endpoint.
 *
 * Response Format:
 * {
 *   success: true,
 *   message: "Descriptive message",
 *   data:    { ... } | [ ... ] | null,
 *   statusCode: 200
 * }
 * =============================================
 */

/**
 * Constructs a standardized API response object.
 *
 * @class ApiResponse
 * @param {number} statusCode - HTTP status code (e.g. 200, 201).
 * @param {string} message    - Human-readable success message.
 * @param {*}      data       - The payload to return (object, array, or null).
 */
class ApiResponse {
  constructor(statusCode, message, data) {
    // HTTP status code for the response
    this.statusCode = statusCode;

    // Boolean flag indicating success (always true for ApiResponse)
    this.success = true;

    // Descriptive message for the client
    this.message = message;

    // The actual data payload (defaults to null if not provided)
    this.data = data !== undefined ? data : null;
  }
}

// Export the class so controllers can use it to wrap responses
module.exports = ApiResponse;
