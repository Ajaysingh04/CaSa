require('dotenv').config();
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

    console.log('Seeding Users (Admin + Demo User)...');
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('Admin@Casa2026', salt);
    const userPassword = await bcrypt.hash('User@Casa2026', salt);

    const createdUsers = await User.insertMany([
      {
        name: 'CASA Executive Admin',
        email: 'admin@casa.in',
        password: adminPassword,
        phone: '+91 98765 43210',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
      },
      {
        name: 'Rajesh Sharma',
        email: 'rajesh@casa.in',
        password: userPassword,
        phone: '+91 91234 56789',
        role: 'user',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
      }
    ]);

    const demoUserId = createdUsers[1]._id;

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

    console.log('Seeding Default Delivery Address...');
    const createdAddress = await Address.create({
      user: demoUserId,
      fullName: 'Rajesh Sharma',
      phone: '+91 91234 56789',
      street: 'Flat 402, Lotus Heritage, Indiranagar 100ft Road',
      locality: 'Near Metro Station',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      addressType: 'home',
      isDefault: true
    });

    console.log('Seeding Initial Reviews...');
    await Review.insertMany([
      {
        product: createdProducts[0]._id,
        user: demoUserId,
        userName: 'Rajesh Sharma',
        rating: 5,
        title: 'Outstanding performance and build quality!',
        comment: 'The M3 MacBook Air is whisper quiet, incredibly fast, and the battery easily lasts 2 full working days. CASA delivery was lightning fast to Bangalore!',
        isVerifiedPurchase: true,
        isApproved: true
      },
      {
        product: createdProducts[8]._id,
        user: demoUserId,
        userName: 'Priya Sundaram',
        rating: 5,
        title: 'Breathtaking silk and rich zari work',
        comment: 'Ordered this for my brother\'s wedding. The drape is magnificent, authentic heavy silk with real luster. Everyone complimented it!',
        isVerifiedPurchase: true,
        isApproved: true
      }
    ]);

    console.log('Seeding Demo Order...');
    await Order.create({
      orderNumber: 'CASA-2026-98124',
      user: demoUserId,
      items: [
        {
          product: createdProducts[1]._id,
          name: createdProducts[1].name,
          slug: createdProducts[1].slug,
          image: createdProducts[1].images[0],
          price: createdProducts[1].discountPrice || createdProducts[1].price,
          quantity: 1,
          selectedVariant: { Color: 'Silver' },
          subtotal: createdProducts[1].discountPrice || createdProducts[1].price
        }
      ],
      shippingAddress: {
        fullName: createdAddress.fullName,
        phone: createdAddress.phone,
        street: createdAddress.street,
        locality: createdAddress.locality,
        city: createdAddress.city,
        state: createdAddress.state,
        pincode: createdAddress.pincode,
        addressType: createdAddress.addressType
      },
      paymentMethod: 'razorpay',
      paymentStatus: 'paid',
      paymentDetails: {
        razorpayOrderId: 'order_rzp_mock_12345',
        razorpayPaymentId: 'pay_rzp_mock_67890',
        razorpaySignature: 'sig_mock_verified',
        paidAt: new Date(Date.now() - 86400000 * 2)
      },
      itemsPrice: 28990,
      shippingPrice: 0,
      taxPrice: 0,
      discountPrice: 200,
      couponCode: 'CASA200',
      totalPrice: 28790,
      orderStatus: 'Delivered',
      statusHistory: [
        { status: 'Confirmed', timestamp: new Date(Date.now() - 86400000 * 2), note: 'Order placed & payment verified' },
        { status: 'Processing', timestamp: new Date(Date.now() - 86400000 * 1.8), note: 'Packed at Bengaluru Fulfillment Center' },
        { status: 'Shipped', timestamp: new Date(Date.now() - 86400000 * 1.2), note: 'Dispatched with BlueDart' },
        { status: 'Out for delivery', timestamp: new Date(Date.now() - 86400000 * 0.4), note: 'Out for delivery by agent' },
        { status: 'Delivered', timestamp: new Date(Date.now() - 86400000 * 0.1), note: 'Delivered to resident' }
      ],
      deliveredAt: new Date(Date.now() - 86400000 * 0.1)
    });

    console.log('================================================================');
    console.log('🎉 CASA DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log(`- Categories: ${createdCategories.length}`);
    console.log(`- Products: ${createdProducts.length}`);
    console.log(`- Admin Account: admin@casa.in / Admin@Casa2026`);
    console.log(`- Customer Account: rajesh@casa.in / User@Casa2026`);
    console.log('================================================================');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedData();
