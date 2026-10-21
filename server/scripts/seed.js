const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Category = require('../models/Category');
const Product = require('../models/Product');
const User = require('../models/User');
const Banner = require('../models/Banner');
const Coupon = require('../models/Coupon');
const Address = require('../models/Address');
const Order = require('../models/Order');
const Review = require('../models/Review');

const categoriesData = require('../data/categoriesData');
const productsData = require('../data/productsData');
const bannersData = require('../data/bannersData');
const couponsData = require('../data/couponsData');

const seedData = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/casa';
  console.log(`Connecting to MongoDB at: ${uri}...`);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB. Clearing previous collections...');

    await Promise.all([
      Category.deleteMany(),
      Product.deleteMany(),
      User.deleteMany(),
      Banner.deleteMany(),
      Coupon.deleteMany(),
      Address.deleteMany(),
      Order.deleteMany(),
      Review.deleteMany()
    ]);

    console.log('Seeding 15 Categories...');
    const createdCategories = await Category.insertMany(categoriesData);
    const categoryMap = {};
    createdCategories.forEach(cat => {
      categoryMap[cat.slug] = cat._id;
    });

    console.log('Seeding Administrator Account...');
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('Admin@Casa2026', salt);

    await User.create({
      name: 'CASA Executive Admin',
      email: 'admin@casa.in',
      password: adminPassword,
      phone: '+91 98765 43210',
      role: 'super_admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
    });

    console.log('Seeding Products...');
    const mappedProducts = productsData.map(prod => ({
      ...prod,
      category: categoryMap[prod.categorySlug] || createdCategories[0]._id
    }));
    const createdProducts = await Product.insertMany(mappedProducts);

    console.log('Seeding Promotional Banners...');
    await Banner.insertMany(bannersData);

    console.log('Seeding Discount Coupons...');
    await Coupon.insertMany(couponsData);

    console.log('================================================================');
    console.log('🎉 CASA DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log(`- Categories: ${createdCategories.length}`);
    console.log(`- Products: ${createdProducts.length}`);
    console.log(`- Admin Account: admin@casa.in / Admin@Casa2026`);
    console.log('- Orders: Clean state (0 dummy orders)');
    console.log('================================================================');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedData();
