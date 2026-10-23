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
        role: 'super_admin',
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

    // 9. Initial Seed Orders for Instant Testing & Demonstrations across all statuses
    this.orders = [
      {
        _id: 'ord_v1_001',
        orderNumber: 'ORD-2026-9214',
        user: { _id: 'user_cust_001', name: 'Priya Sharma', email: 'priya.s@example.com', phone: '+91 98234 56789' },
        vendor: 'user_vendor_001',
        shippingAddress: {
          fullName: 'Priya Sharma',
          phone: '+91 98234 56789',
          street: 'B-402, Prestige Palms, 100ft Road',
          locality: 'Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560038'
        },
        items: [
          {
            name: 'Pure Kanjivaram Silk Saree with Gold Zari Pallu',
            slug: 'pure-kanjivaram-silk-saree',
            image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&auto=format&fit=crop&q=80',
            price: 6499,
            quantity: 1,
            vendor: 'user_vendor_001'
          }
        ],
        totalPrice: 6499,
        itemsPrice: 6499,
        paymentMethod: 'razorpay',
        paymentStatus: 'paid',
        isPaid: true,
        orderStatus: 'Confirmed',
        tracking: {
          carrier: 'Delhivery Express Logistics',
          awbNumber: 'DLV-IND-92140',
          estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        _id: 'ord_v1_002',
        orderNumber: 'ORD-2026-8842',
        user: { _id: 'user_cust_002', name: 'Amit Patel', email: 'amit.patel@example.com', phone: '+91 98450 12345' },
        vendor: 'user_vendor_001',
        shippingAddress: {
          fullName: 'Amit Patel',
          phone: '+91 98450 12345',
          street: '14, Palm Avenue, Bodakdev',
          locality: 'SG Highway',
          city: 'Ahmedabad',
          state: 'Gujarat',
          pincode: '380054'
        },
        items: [
          {
            name: 'Traditional Royal Banarasi Katan Silk Saree',
            slug: 'traditional-banarasi-silk-saree',
            image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&auto=format&fit=crop&q=80',
            price: 12999,
            quantity: 1,
            vendor: 'user_vendor_001'
          }
        ],
        totalPrice: 12999,
        itemsPrice: 12999,
        paymentMethod: 'razorpay',
        paymentStatus: 'paid',
        isPaid: true,
        orderStatus: 'Processing',
        tracking: {
          carrier: 'Blue Dart Air Express',
          awbNumber: 'BLU-AMD-88421',
          estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
      },
      {
        _id: 'ord_v1_003',
        orderNumber: 'ORD-2026-7731',
        user: { _id: 'user_cust_003', name: 'Sneha Roy', email: 'sneha.roy@example.com', phone: '+91 97112 98765' },
        vendor: 'user_vendor_001',
        shippingAddress: {
          fullName: 'Sneha Roy',
          phone: '+91 97112 98765',
          street: 'Flat 7B, Silver Oak Heights, Salt Lake Sector 5',
          locality: 'Bidhannagar',
          city: 'Kolkata',
          state: 'West Bengal',
          pincode: '700091'
        },
        items: [
          {
            name: 'Designer Embroidered Wedding Anarkali Gown Set',
            slug: 'designer-embroidered-anarkali-suit',
            image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=400&auto=format&fit=crop&q=80',
            price: 4899,
            quantity: 1,
            vendor: 'user_vendor_001'
          }
        ],
        totalPrice: 4899,
        itemsPrice: 4899,
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        isPaid: false,
        orderStatus: 'Packed',
        tracking: {
          carrier: 'Delhivery Surface Pro',
          awbNumber: 'DLV-KOL-77319',
          estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString()
        },
        createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
      },
      {
        _id: 'ord_v1_004',
        orderNumber: 'ORD-2026-6519',
        user: { _id: 'user_cust_004', name: 'Vikram Malhotra', email: 'vikram.m@example.com', phone: '+91 98200 45678' },
        vendor: 'user_vendor_001',
        shippingAddress: {
          fullName: 'Vikram Malhotra',
          phone: '+91 98200 45678',
          street: 'Penthouse 1204, Lodha Bellissimo, Mahalaxmi',
          locality: 'Lower Parel',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400011'
        },
        items: [
          {
            name: 'Maheshwari Handcrafted Zari Border Dupatta',
            slug: 'maheshwari-cotton-dupatta',
            image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&auto=format&fit=crop&q=80',
            price: 1899,
            quantity: 2,
            vendor: 'user_vendor_001'
          }
        ],
        totalPrice: 3798,
        itemsPrice: 3798,
        paymentMethod: 'razorpay',
        paymentStatus: 'paid',
        isPaid: true,
        orderStatus: 'Shipped',
        tracking: {
          carrier: 'Blue Dart Apex Express',
          awbNumber: 'BLU-BOM-65194',
          estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        _id: 'ord_v1_005',
        orderNumber: 'ORD-2026-5104',
        user: { _id: 'user_cust_005', name: 'Sunita Jain', email: 'sunita.j@example.com', phone: '+91 94140 11223' },
        vendor: 'user_vendor_001',
        shippingAddress: {
          fullName: 'Sunita Jain',
          phone: '+91 94140 11223',
          street: 'Bungalow 22, Civil Lines',
          locality: 'Near High Court',
          city: 'Jaipur',
          state: 'Rajasthan',
          pincode: '302006'
        },
        items: [
          {
            name: 'Chanderi Pure Silk Handloom Saree with Zari Pallu',
            slug: 'chanderi-pure-silk-handloom-saree',
            image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&auto=format&fit=crop&q=80',
            price: 5499,
            quantity: 1,
            vendor: 'user_vendor_001'
          }
        ],
        totalPrice: 5499,
        itemsPrice: 5499,
        paymentMethod: 'razorpay',
        paymentStatus: 'paid',
        isPaid: true,
        orderStatus: 'Delivered',
        tracking: {
          carrier: 'Delhivery Express Logistics',
          awbNumber: 'DLV-JAI-51047',
          estimatedDelivery: new Date(Date.now() - 86400000).toISOString()
        },
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
      },
      {
        _id: 'ord_v1_006',
        orderNumber: 'ORD-2026-4022',
        user: { _id: 'user_cust_006', name: 'Pooja Kulkarni', email: 'pooja.k@example.com', phone: '+91 98811 77665' },
        vendor: 'user_vendor_001',
        shippingAddress: {
          fullName: 'Pooja Kulkarni',
          phone: '+91 98811 77665',
          street: 'Row House 4, Prabhat Road Lane 9',
          locality: 'Deccan Gymkhana',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411004'
        },
        items: [
          {
            name: 'Handcrafted Tussar Silk Kurti & Palazzo Set',
            slug: 'handcrafted-silk-kurti-set',
            image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&auto=format&fit=crop&q=80',
            price: 3299,
            quantity: 1,
            vendor: 'user_vendor_001'
          }
        ],
        totalPrice: 3299,
        itemsPrice: 3299,
        paymentMethod: 'razorpay',
        paymentStatus: 'paid',
        isPaid: true,
        orderStatus: 'Delivered',
        tracking: {
          carrier: 'Blue Dart Surface',
          awbNumber: 'BLU-PUN-40228',
          estimatedDelivery: new Date(Date.now() - 86400000 * 2).toISOString()
        },
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
      }
    ];
  }
}

const dataStore = new DataStore();
module.exports = dataStore;
