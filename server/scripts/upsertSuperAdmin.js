const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

async function run() {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/casa-ecommerce';
    console.log('Connecting to:', uri);
    await mongoose.connect(uri);

    const salt = await bcrypt.genSalt(10);
    const superAdminPasswordHash = await bcrypt.hash('CaSa@appsica', salt);
    const demoAdminPasswordHash = await bcrypt.hash('Admin@Casa2026', salt);

    // 1. Upsert Super Admin: casa@admin.com
    let superAdmin = await User.findOne({ email: 'casa@admin.com' });
    if (!superAdmin) {
      superAdmin = await User.create({
        name: 'CASA Super Admin',
        email: 'casa@admin.com',
        password: superAdminPasswordHash,
        role: 'super_admin',
        phone: '+91 99999 88888',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80'
      });
      console.log('Created Super Admin: casa@admin.com with role super_admin');
    } else {
      superAdmin.role = 'super_admin';
      superAdmin.password = superAdminPasswordHash;
      superAdmin.name = 'CASA Super Admin';
      await superAdmin.save();
      console.log('Updated Super Admin: casa@admin.com with role super_admin');
    }

    // 2. Set admin@casa.in as Demo Admin (role: 'admin')
    let demoAdmin = await User.findOne({ email: 'admin@casa.in' });
    if (!demoAdmin) {
      demoAdmin = await User.create({
        name: 'CASA Demo Admin',
        email: 'admin@casa.in',
        password: demoAdminPasswordHash,
        role: 'admin',
        phone: '+91 98765 43210',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
      });
      console.log('Created Demo Admin: admin@casa.in with role admin');
    } else {
      demoAdmin.role = 'admin';
      demoAdmin.password = demoAdminPasswordHash;
      demoAdmin.name = 'CASA Demo Admin';
      await demoAdmin.save();
      console.log('Updated Demo Admin: admin@casa.in with role admin');
    }

    console.log('Super Admin & Demo Admin setup completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error setting up Super Admin:', err);
    process.exit(1);
  }
}

run();
