/**
 * Health Controller
 * =============================================
 * Provides a simple health-check endpoint that
 * confirms the backend is running and responsive.
 * Used by load balancers, monitoring tools, and
 * CI/CD pipelines to verify service availability.
 * =============================================
 */

const ApiResponse = require('../utils/ApiResponse');

/**
 * Returns a health-check response indicating the
 * backend service is up and running.
 *
 * @function getHealth
 * @param {Object}   req - Express request object.
 * @param {Object}   res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {Object} JSON response with success status and message.
 */
const getHealth = (req, res, next) => {
  try {
    // Construct a standardized success response
    const response = new ApiResponse(
      200,
      'Backend Running',
      null
    );

    // Send the response to the client
    return res.status(response.statusCode).json({
      success: response.success,
      message: response.message,
    });
  } catch (error) {
    // Forward any unexpected errors to the error-handling middleware
    next(error);
  }
};

// Export the controller function for use in route definitions
module.exports = {
  getHealth,
};
