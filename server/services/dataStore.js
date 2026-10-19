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

    // 6. Users (Admin + Demo User)
    const salt = bcrypt.genSaltSync(10);
    const adminPasswordHash = bcrypt.hashSync('Admin@Casa2026', salt);
    const userPasswordHash = bcrypt.hashSync('User@Casa2026', salt);

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

    // 9. Sample Initial Orders for Admin & Customer view
    this.orders = [
      {
        _id: 'ord_001',
        orderNumber: 'CASA-2026-98124',
        user: 'user_cust_001',
        items: [
          {
            product: this.products[1]._id,
            name: this.products[1].name,
            slug: this.products[1].slug,
            image: this.products[1].images[0],
            price: this.products[1].discountPrice || this.products[1].price,
            quantity: 1,
            selectedVariant: { Color: 'Silver' },
            subtotal: this.products[1].discountPrice || this.products[1].price
          }
        ],
        shippingAddress: { ...this.addresses[0] },
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
        deliveredAt: new Date(Date.now() - 86400000 * 0.1),
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        _id: 'ord_002',
        orderNumber: 'CASA-2026-98125',
        user: 'user_cust_001',
        items: [
          {
            product: this.products[9]._id, // Anarkali Kurti Set
            name: this.products[9].name,
            slug: this.products[9].slug,
            image: this.products[9].images[0],
            price: this.products[9].discountPrice || this.products[9].price,
            quantity: 1,
            selectedVariant: { Size: 'M', Color: 'Powder Blue' },
            subtotal: this.products[9].discountPrice || this.products[9].price
          }
        ],
        shippingAddress: { ...this.addresses[0] },
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        itemsPrice: 2899,
        shippingPrice: 0,
        taxPrice: 0,
        discountPrice: 0,
        totalPrice: 2899,
        orderStatus: 'Shipped',
        statusHistory: [
          { status: 'Confirmed', timestamp: new Date(Date.now() - 86400000 * 1), note: 'Order confirmed with Cash on Delivery' },
          { status: 'Packed', timestamp: new Date(Date.now() - 86400000 * 0.7), note: 'Packed at Hub' },
          { status: 'Shipped', timestamp: new Date(Date.now() - 86400000 * 0.3), note: 'Handed over to courier' }
        ],
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
      }
    ];
  }
}

const dataStore = new DataStore();
module.exports = dataStore;
