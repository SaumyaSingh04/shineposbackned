require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const SuperAdmin = require('../src/models/SuperAdmin');

async function createSuperAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if super admin already exists
    const existingAdmin = await SuperAdmin.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Super admin already exists');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const superAdmin = new SuperAdmin({
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Super Admin'
    });

    await superAdmin.save();
    console.log('Super admin created successfully');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Error creating super admin:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createSuperAdmin();