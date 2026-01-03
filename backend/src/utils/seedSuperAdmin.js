const User = require('../models/User');

/**
 * Seed Super Admin user on server start
 */
const seedSuperAdmin = async () => {
  try {
    const username = process.env.SUPER_ADMIN_USERNAME;
    const password = process.env.SUPER_ADMIN_PASSWORD;

    // Check if env variables are set
    if (!username || !password) {
      console.warn('⚠️  SUPER_ADMIN_USERNAME and SUPER_ADMIN_PASSWORD not set. Skipping Super Admin seed.');
      return;
    }

    // Check if Super Admin already exists
    const existingSuperAdmin = await User.findOne({
      username: username.toLowerCase(),
      role: 'SUPER_ADMIN'
    });

    if (existingSuperAdmin) {
      console.log('✅ Super Admin already exists');
      return;
    }

    // Create Super Admin
    const superAdmin = await User.create({
      username: username.toLowerCase(),
      password: password,
      role: 'SUPER_ADMIN',
      isActive: true
    });

    console.log(`✅ Super Admin created: ${superAdmin.username}`);
  } catch (error) {
    console.error('❌ Error seeding Super Admin:', error.message);
    // Don't throw - allow server to start even if seeding fails
  }
};

module.exports = seedSuperAdmin;


