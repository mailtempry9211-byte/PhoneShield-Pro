/**
 * Admin User Seeder
 * =============================================
 * Creates or updates a permanent default admin user.
 * This ensures there is always at least one admin account
 * with known credentials for system administration.
 *
 * Admin Details:
 *   Email:    mailtempry9211@gmail.com
 *   Password: Mobin@1998
 *   Name:     Mobin
 *   Phone:    9876543210
 *   Role:     admin
 * =============================================
 */

const User = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * Seeds or updates the default admin user.
 *
 * @async
 * @function seedAdmin
 * @returns {Promise<void>}
 */
const seedAdmin = async () => {
  try {
    const adminEmail = 'mailtempry9211@gmail.com';
    const adminPassword = 'Mobin@1998';
    const adminName = 'Mobin';
    const adminPhone = '9876543210';
    const adminRole = 'admin';

    // Check if admin user already exists
    let adminUser = await User.findOne({ email: adminEmail });

    // Hash the password
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    if (adminUser) {
      // Update existing admin user
      adminUser.password = hashedPassword;
      adminUser.role = adminRole;
      adminUser.name = adminName;
      adminUser.phone = adminPhone;
      await adminUser.save();
      console.log('Admin user updated');
    } else {
      // Create new admin user
      await User.create({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        phone: adminPhone,
        role: adminRole,
      });
      console.log('Admin user created');
    }
  } catch (error) {
    // Log seeding errors but do not crash the server
    console.error(`Error seeding admin user: ${error.message}`);
  }
};

// Export the seedAdmin function
module.exports = seedAdmin;