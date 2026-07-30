/**
 * Database Connection Module
 * =============================================
 * Handles MongoDB connection using Mongoose.
 * Provides a reusable connectDB function that
 * establishes and manages the database connection
 * for the PhoneShield Pro backend.
 *
 * After connecting, it seeds a default admin user
 * if the users collection is empty.
 * =============================================
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

/**
 * Seeds a default admin user if the users collection is empty.
 *
 * Default credentials:
 *   Email:    admin@phoneshield.com
 *   Password: 12345678
 *
 * @async
 * @function seedDefaultAdmin
 * @returns {Promise<void>}
 */
const seedDefaultAdmin = async () => {
  try {
    // Check if any users exist in the database
    const userCount = await User.countDocuments();

    if (userCount === 0) {
      // Hash the default admin password
      const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
      const hashedPassword = await bcrypt.hash('12345678', saltRounds);

      // Create the default admin user
      await User.create({
        name: 'Default Admin',
        email: 'admin@phoneshield.com',
        password: hashedPassword,
        phone: '0000000000',
        role: 'admin',
      });

      console.log('Default admin user created: admin@phoneshield.com');
    }
  } catch (error) {
    // Log seeding errors but do not crash the server
    console.error(`Error seeding default admin: ${error.message}`);
  }
};

/**
 * Establishes a connection to the MongoDB database.
 *
 * Reads the MongoDB connection string from the
 * environment variable MONGODB_URI (loaded via dotenv).
 *
 * @async
 * @function connectDB
 * @returns {Promise<void>} Resolves when the connection is established.
 * @throws  {Error} If the connection attempt fails, the process exits
 *                   with a non-zero code after logging the error.
 */
const connectDB = async () => {
  try {
    // Attempt to connect to MongoDB using the connection string from .env
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // These options ensure stable, future-proof connection behavior
      // and silence the deprecation warnings in the console.
    });

    // Log the successful connection with the host name for debugging
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Seed the default admin user if the database is empty
    await seedDefaultAdmin();
  } catch (error) {
    // Log the error and terminate the process if the DB is unreachable
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Export the connectDB function for use in server.js
module.exports = connectDB;