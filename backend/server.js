/**
 * PhoneShield Pro - Backend Server Entry Point
 * =============================================
 * This file is the main entry point for the backend.
 * It performs the following:
 *   1. Loads environment variables from .env (dotenv)
 *   2. Connects to the MongoDB database
 *   3. Initializes the Express application
 *   4. Enables CORS and JSON body parsing
 *   5. Mounts the API routes under /api
 *   6. Registers the 404 and error-handling middleware
 *   7. Starts the server on the configured port
 * =============================================
 */

// Load environment variables from .env file FIRST, before any other imports
// that might depend on process.env values.
require('dotenv').config();

// Configure DNS servers to ensure MongoDB Atlas SRV records resolve correctly.
// This is required on some networks where the default DNS resolver cannot
// reach the Atlas cluster hostname.
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const compression = require('compression');

// Import the database connection function
const connectDB = require('./src/config/db');

// Import the admin seeder utility
const seedAdmin = require('./src/utils/seedAdmin');

// Import the main API router (aggregates all route modules)
const apiRoutes = require('./src/routes');

// Import middleware
const notFound = require('./src/middleware/notFound');
const errorHandler = require('./src/middleware/error');

// Initialize the Express application
const app = express();

// --- Database Connection ---
// Connect to MongoDB using the connection string from .env
connectDB().then(() => {
  // Seed the default admin user after successful database connection
  seedAdmin();
});

// --- Middleware ---

// Security middleware
app.use(helmet()); // Set security HTTP headers
app.use(compression()); // Compress responses
app.use(mongoSanitize()); // Sanitize MongoDB queries
app.use(xss()); // Prevent XSS attacks

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});
app.use('/api', limiter);

// Enable CORS (Cross-Origin Resource Sharing)
// Allows requests from the configured origin (set in .env as CORS_ORIGIN)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
);

// Enable JSON body parsing for incoming requests
// Parses application/json request bodies
app.use(express.json({ limit: '10mb' }));

// Enable URL-encoded body parsing (for form submissions)
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logger (only in development mode for debugging)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// --- Routes ---

// Mount the main API router under the /api base path
// All API endpoints will be prefixed with /api
app.use('/api', apiRoutes);

// --- Middleware (Order Matters) ---

// 404 handler: must be registered AFTER all route definitions
// Catches any unmatched routes and returns a 404 error
app.use(notFound);

// Global error-handling middleware: must be registered LAST
// Catches all errors passed via next(error) and sends a
// standardized JSON error response
app.use(errorHandler);

// --- Server Initialization ---

// Read the port from environment variables, defaulting to 5000
const PORT = process.env.PORT || 5000;

// Start the Express server
app.listen(PORT, () => {
  console.log(`PhoneShield Pro Backend Running on port ${PORT}`);
});

// Export the Express app for testing purposes
module.exports = app;
