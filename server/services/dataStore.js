const bcrypt = require('bcryptjs');
const categoriesData = require('../data/categoriesData');
const productsData = require('../data/productsData');
const bannersData = require('../data/bannersData');
const couponsData = require('../data/couponsData');

class DataStore {
  constructor() {
    this.categories = [];
    this.products = [];
    this.banners = [];
    this.coupons = [];
    this.users = [];
    this.addresses = [];
    this.carts = new Map(); // userId -> { items: [], coupon: null }
    this.wishlists = new Map(); // userId -> Set of productIds
    this.orders = [];
    this.reviews = [];

    this.initializeData();
  }

  generateId() {
    return (
      Math.floor(Date.now() / 1000).toString(16) +
      'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () =>
        ((Math.random() * 16) | 0).toString(16)
      )
    );
  }

  initializeData() {
    // 1. Categories
    this.categories = categoriesData.map((cat, idx) => ({
      _id: `cat_${idx + 1}_${cat.slug}`,
      ...cat,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    // 2. Map category slug to _id
    const categoryMap = new Map();
    this.categories.forEach(cat => categoryMap.set(cat.slug, cat._id));

    // 3. Products
    this.products = productsData.map((prod, idx) => ({
      _id: `prod_${idx + 1}_${prod.slug.slice(0, 15)}`,
      ...prod,
      category: categoryMap.get(prod.categorySlug) || this.categories[0]._id,
      createdAt: new Date(Date.now() - (idx + 1) * 3600000).toISOString(),
      updatedAt: new Date().toISOString()
    }));

    // 4. Banners
    this.banners = bannersData.map((banner, idx) => ({
      _id: `banner_${idx + 1}`,
      ...banner,
      createdAt: new Date().toISOString()
    }));

    // 5. Coupons
    this.coupons = couponsData.map((cp, idx) => ({
      _id: `coupon_${idx + 1}`,
      ...cp,
      createdAt: new Date().toISOString()
    }));

    // 6. Users (Admin + Customer + Vendor + Delivery Rider)
    const salt = bcrypt.genSaltSync(10);
    const adminPasswordHash = bcrypt.hashSync('Admin@Casa2026', salt);
    const userPasswordHash = bcrypt.hashSync('User@Casa2026', salt);
    const vendorPasswordHash = bcrypt.hashSync('Vendor@Casa2026', salt);
    const deliveryPasswordHash = bcrypt.hashSync('Delivery@Casa2026', salt);

    this.users = [
      {
        _id: 'user_admin_001',
        name: 'CASA Executive Admin',
        email: 'admin@casa.in',
        password: adminPasswordHash,
        phone: '+91 98765 43210',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString()
      },
      {
        _id: 'user_cust_001',
        name: 'Rajesh Sharma',
        email: 'rajesh@casa.in',
        password: userPasswordHash,
        phone: '+91 91234 56789',
        role: 'user',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString()
      },
      {
        _id: 'user_vendor_001',
        name: 'Aarav Fashion & Handlooms',
        email: 'vendor@casa.in',
        password: vendorPasswordHash,
        phone: '+91 98765 24680',
        role: 'vendor',
        vendorStoreName: 'Aarav Luxury Handlooms & Apparel',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString()
      },
      {
        _id: 'user_delivery_001',
        name: 'Vikram Singh (Express Rider)',
        email: 'delivery@casa.in',
        password: deliveryPasswordHash,
        phone: '+91 98765 13579',
        role: 'delivery',
        vehicleType: 'Bike',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString()
      }
    ];

    // 7. Addresses
    this.addresses = [
      {
        _id: 'addr_001',
        user: 'user_cust_001',
        fullName: 'Rajesh Sharma',
        phone: '+91 91234 56789',
        street: 'Flat 402, Lotus Heritage, Indiranagar 100ft Road',
        locality: 'Near Metro Station',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038',
        addressType: 'home',
        isDefault: true,
        createdAt: new Date().toISOString()
      }
    ];

    // 8. Sample Reviews
    this.reviews = [
      {
        _id: 'rev_001',
        product: this.products[0]._id,
        user: 'user_cust_001',
        userName: 'Rajesh Sharma',
        rating: 5,
        title: 'Outstanding performance and build quality!',
        comment: 'The M3 MacBook Air is whisper quiet, incredibly fast, and the battery easily lasts 2 full working days. CASA delivery was lightning fast to Bangalore!',
        isVerifiedPurchase: true,
        isApproved: true,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
      },
      {
        _id: 'rev_002',
        product: this.products[8]._id, // Kanjivaram Silk Saree
        user: 'user_cust_001',
        userName: 'Priya Sundaram',
        rating: 5,
        title: 'Breathtaking silk and rich zari work',
        comment: 'Ordered this for my brother\'s wedding. The drape is magnificent, authentic heavy silk with real luster. Everyone complimented it!',
        isVerifiedPurchase: true,
        isApproved: true,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
      }
    ];

    // 9. Initial Orders: Empty by default (only real customer orders appear)
    this.orders = [];
  }
}

const dataStore = new DataStore();
module.exports = dataStore;
