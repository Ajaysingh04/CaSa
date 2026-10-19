const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Category = require('../models/Category');
const Setting = require('../models/Setting');
const { getDBStatus } = require('../config/db');
const dataStore = require('../services/dataStore');

// Valid status transitions
const validTransitions = {
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Processing', 'Cancelled'],
  Processing: ['Packed', 'Cancelled'],
  Packed: ['Shipped', 'Cancelled'],
  Shipped: ['Out for delivery'],
  'Out for delivery': ['Delivered'],
  Delivered: ['Return requested'],
  'Return requested': ['Refunded', 'Delivered'],
  Cancelled: [],
  Refunded: []
};

// @desc    Get Admin Dashboard Stats & Metrics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    if (getDBStatus()) {
      const totalProducts = await Product.countDocuments();
      const totalOrders = await Order.countDocuments();
      const totalUsers = await User.countDocuments({ role: 'user' });

      // Revenue calculation: sum of paid or delivered orders
      const revenueAgg = await Order.aggregate([
        { $match: { orderStatus: { $nin: ['Cancelled', 'Refunded'] } } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
      ]);
      const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

      // Low stock products (< 15 units)
      const lowStockProducts = await Product.find({ stock: { $lte: 15 }, isActive: true })
        .select('name slug stock price discountPrice images brand categorySlug')
        .limit(10);

      // Recent 5 orders
      const recentOrders = await Order.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(6);

      // Status breakdown
      const ordersByStatus = await Order.aggregate([
        { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
      ]);

      // Category breakdown for charts
      const categoryAgg = await Product.aggregate([
        { $group: { _id: '$categorySlug', count: { $sum: 1 }, totalStock: { $sum: '$stock' } } },
        { $sort: { count: -1 } },
        { $limit: 6 }
      ]);

      // Top rated / best selling products
      const topProducts = await Product.find({ isActive: true })
        .sort({ rating: -1, numReviews: -1 })
        .select('name slug stock price discountPrice images brand categorySlug rating numReviews')
        .limit(6);

      const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

      return res.status(200).json({
        success: true,
        data: {
          totalProducts,
          totalOrders,
          totalUsers,
          totalRevenue,
          avgOrderValue,
          lowStockProducts,
          topProducts,
          recentOrders,
          categoryBreakdown: categoryAgg,
          ordersByStatus: ordersByStatus.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
          }, {})
        }
      });
    } else {
      const totalProducts = dataStore.products.length;
      const totalOrders = dataStore.orders.length;
      const totalUsers = dataStore.users.filter(u => u.role === 'user').length;

      const totalRevenue = dataStore.orders
        .filter(o => o.orderStatus !== 'Cancelled' && o.orderStatus !== 'Refunded')
        .reduce((acc, o) => acc + (o.totalPrice || 0), 0);

      const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

      const lowStockProducts = dataStore.products
        .filter(p => p.stock <= 20)
        .slice(0, 10);

      const topProducts = [...dataStore.products]
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 6);

      const categoryCounts = {};
      dataStore.products.forEach(p => {
        const cat = p.categorySlug || 'general';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
      const categoryBreakdown = Object.keys(categoryCounts).map(cat => ({
        _id: cat,
        count: categoryCounts[cat]
      })).sort((a, b) => b.count - a.count).slice(0, 6);

      const recentOrders = dataStore.orders.slice(0, 6).map(o => {
        const user = dataStore.users.find(u => u._id === o.user);
        return {
          ...o,
          user: user ? { name: user.name, email: user.email } : { name: 'Customer' }
        };
      });

      const ordersByStatus = {};
      dataStore.orders.forEach(o => {
        ordersByStatus[o.orderStatus] = (ordersByStatus[o.orderStatus] || 0) + 1;
      });

      return res.status(200).json({
        success: true,
        data: {
          totalProducts,
          totalOrders,
          totalUsers,
          totalRevenue,
          avgOrderValue,
          lowStockProducts,
          topProducts,
          recentOrders,
          categoryBreakdown,
          ordersByStatus
        }
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get all orders (Admin) with filter and pagination
// @route   GET /api/admin/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 15 } = req.query;

    if (getDBStatus()) {
      const query = status ? { orderStatus: status } : {};
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      const total = await Order.countDocuments(query);
      const orders = await Order.find(query)
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      return res.status(200).json({
        success: true,
        count: orders.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        data: orders
      });
    } else {
      let orders = [...dataStore.orders];
      if (status) {
        orders = orders.filter(o => o.orderStatus === status);
      }

      const populatedOrders = orders.map(o => {
        const user = dataStore.users.find(u => u._id === o.user);
        return {
          ...o,
          user: user ? { _id: user._id, name: user.name, email: user.email, phone: user.phone } : { name: 'Customer' }
        };
      });

      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const total = populatedOrders.length;
      const skip = (pageNum - 1) * limitNum;
      const paginated = populatedOrders.slice(skip, skip + limitNum);

      return res.status(200).json({
        success: true,
        count: paginated.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        data: paginated
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note = '' } = req.body;

    const allowedStatuses = [
      'Pending',
      'Confirmed',
      'Processing',
      'Packed',
      'Shipped',
      'Out for delivery',
      'Delivered',
      'Cancelled',
      'Return requested',
      'Refunded'
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status '${status}'. Must be one of: ${allowedStatuses.join(', ')}`
      });
    }

    if (getDBStatus()) {
      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      // Check transition
      const current = order.orderStatus;
      if (current === status) {
        return res.status(200).json({ success: true, data: order });
      }

      const allowedNext = validTransitions[current] || [];
      if (!allowedNext.includes(status) && req.user.role !== 'admin') {
        return res.status(400).json({
          success: false,
          message: `Cannot transition order directly from '${current}' to '${status}'. Permitted: ${allowedNext.join(', ')}`
        });
      }

      order.orderStatus = status;
      if (status === 'Delivered') {
        order.deliveredAt = new Date();
      }
      if (status === 'Cancelled' || status === 'Refunded') {
        // Restore inventory if previously active
        if (current !== 'Cancelled' && current !== 'Refunded') {
          for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
              $inc: { stock: item.quantity }
            });
          }
        }
      }

      order.statusHistory.push({
        status,
        note: note || `Status updated to ${status} by admin`,
        updatedBy: req.user.name || 'Admin'
      });

      await order.save();
      return res.status(200).json({ success: true, data: order });
    } else {
      const order = dataStore.orders.find(o => o._id === id || o.orderNumber === id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      const current = order.orderStatus;
      order.orderStatus = status;
      if (status === 'Delivered') {
        order.deliveredAt = new Date().toISOString();
      }

      if (status === 'Cancelled' || status === 'Refunded') {
        if (current !== 'Cancelled' && current !== 'Refunded') {
          for (const item of order.items) {
            const prod = dataStore.products.find(p => p._id === item.product);
            if (prod) prod.stock += item.quantity;
          }
        }
      }

      order.statusHistory.push({
        status,
        timestamp: new Date().toISOString(),
        note: note || `Status updated to ${status} by admin`,
        updatedBy: req.user.name || 'Admin'
      });

      return res.status(200).json({ success: true, data: order });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Create product (Admin)
// @route   POST /api/admin/products
// @access  Private/Admin
exports.createProduct = async (req, res, next) => {
  try {
    const {
      name,
      brand,
      categorySlug,
      subcategory,
      description,
      shortDescription,
      price,
      discountPrice,
      stock,
      images,
      variants,
      specifications,
      isFeatured,
      isBestSeller,
      isTrending
    } = req.body;

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') + `-${Date.now().toString().slice(-4)}`;

    if (getDBStatus()) {
      let category = await Category.findOne({ slug: categorySlug });
      if (!category) {
        category = await Category.findOne();
      }

      const product = await Product.create({
        name,
        slug,
        brand,
        category: category._id,
        categorySlug: category.slug,
        subcategory,
        description,
        shortDescription: shortDescription || '',
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : null,
        stock: Number(stock),
        images: images && images.length ? images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'],
        variants: variants || [],
        specifications: specifications || [],
        isFeatured: Boolean(isFeatured),
        isBestSeller: Boolean(isBestSeller),
        isTrending: Boolean(isTrending),
        isActive: true
      });

      return res.status(201).json({ success: true, data: product });
    } else {
      const newProduct = {
        _id: dataStore.generateId(),
        name,
        slug,
        brand,
        categorySlug,
        subcategory,
        description,
        shortDescription: shortDescription || '',
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : null,
        stock: Number(stock),
        images: images && images.length ? images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'],
        variants: variants || [],
        specifications: specifications || [],
        rating: 5.0,
        numReviews: 1,
        isFeatured: Boolean(isFeatured),
        isBestSeller: Boolean(isBestSeller),
        isTrending: Boolean(isTrending),
        isActive: true,
        createdAt: new Date().toISOString()
      };

      dataStore.products.unshift(newProduct);
      return res.status(201).json({ success: true, data: newProduct });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Update product (Admin)
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (getDBStatus()) {
      const product = await Product.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
      });
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      return res.status(200).json({ success: true, data: product });
    } else {
      const index = dataStore.products.findIndex(p => p._id === id || p.slug === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      dataStore.products[index] = {
        ...dataStore.products[index],
        ...req.body,
        updatedAt: new Date().toISOString()
      };
      return res.status(200).json({ success: true, data: dataStore.products[index] });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Delete product (Admin)
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (getDBStatus()) {
      const product = await Product.findByIdAndDelete(id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      return res.status(200).json({ success: true, message: 'Product removed' });
    } else {
      const index = dataStore.products.findIndex(p => p._id === id || p.slug === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      dataStore.products.splice(index, 1);
      return res.status(200).json({ success: true, message: 'Product removed' });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get all registered users (Admin)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    if (getDBStatus()) {
      const users = await User.find().select('-password').sort({ createdAt: -1 });
      return res.status(200).json({ success: true, count: users.length, data: users });
    } else {
      const users = dataStore.users.map(u => {
        const { password, ...safe } = u;
        return safe;
      });
      return res.status(200).json({ success: true, count: users.length, data: users });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Update user role (Admin)
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be user or admin' });
    }

    if (req.user._id && req.user._id.toString() === id && role !== 'admin') {
      return res.status(400).json({ success: false, message: 'You cannot remove your own admin access' });
    }

    if (getDBStatus()) {
      const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      return res.status(200).json({ success: true, data: user });
    } else {
      const userIndex = dataStore.users.findIndex(u => u._id === id);
      if (userIndex === -1) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      dataStore.users[userIndex].role = role;
      const { password, ...safe } = dataStore.users[userIndex];
      return res.status(200).json({ success: true, data: safe });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user account (Admin)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user._id && req.user._id.toString() === id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account' });
    }

    if (getDBStatus()) {
      const user = await User.findByIdAndDelete(id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      return res.status(200).json({ success: true, message: 'User deleted successfully' });
    } else {
      const userIndex = dataStore.users.findIndex(u => u._id === id);
      if (userIndex === -1) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      dataStore.users.splice(userIndex, 1);
      return res.status(200).json({ success: true, message: 'User deleted successfully' });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Delete order (Admin)
// @route   DELETE /api/admin/orders/:id
// @access  Private/Admin
exports.deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (getDBStatus()) {
      const order = await Order.findByIdAndDelete(id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      return res.status(200).json({ success: true, message: 'Order deleted successfully' });
    } else {
      const index = dataStore.orders.findIndex(o => o._id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      dataStore.orders.splice(index, 1);
      return res.status(200).json({ success: true, message: 'Order deleted successfully' });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get store settings
// @route   GET /api/admin/settings
// @access  Private/Admin
exports.getSettings = async (req, res, next) => {
  try {
    if (getDBStatus()) {
      let settings = await Setting.findOne();
      if (!settings) {
        settings = await Setting.create({});
      }
      return res.status(200).json({ success: true, data: settings });
    } else {
      if (!dataStore.settings) {
        dataStore.settings = {
          storeName: 'CASA India Marketplace',
          supportEmail: 'support@casa.in',
          supportPhone: '+91 9876543210',
          freeShippingThreshold: 499,
          standardDeliveryFee: 49,
          codEnabled: true,
          maintenanceMode: false,
          festivalSaleActive: true,
          festivalSaleBannerText: '🎉 FESTIVAL SALE IS LIVE: Up to 70% Off + Flat ₹200 OFF with code CASA200',
          gstRate: 18
        };
      }
      return res.status(200).json({ success: true, data: dataStore.settings });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Update store settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
exports.updateSettings = async (req, res, next) => {
  try {
    if (getDBStatus()) {
      let settings = await Setting.findOne();
      if (!settings) {
        settings = await Setting.create(req.body);
      } else {
        Object.assign(settings, req.body);
        await settings.save();
      }
      return res.status(200).json({ success: true, data: settings });
    } else {
      dataStore.settings = { ...(dataStore.settings || {}), ...req.body };
      return res.status(200).json({ success: true, data: dataStore.settings });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get public store settings (Store Name, Brand Color, Tagline, Language, Announcement)
// @route   GET /api/settings/public
// @access  Public
exports.getPublicSettings = async (req, res, next) => {
  try {
    if (getDBStatus()) {
      let settings = await Setting.findOne();
      if (!settings) {
        settings = await Setting.create({});
      }
      return res.status(200).json({
        success: true,
        data: {
          storeName: settings.storeName || 'CASA',
          storeTagline: settings.storeTagline || 'INDIA MARKETPLACE',
          primaryColor: settings.primaryColor || '#2563eb',
          defaultLanguage: settings.defaultLanguage || 'en',
          supportEmail: settings.supportEmail || 'support@casa.in',
          supportPhone: settings.supportPhone || '+91 9876543210',
          festivalSaleActive: settings.festivalSaleActive !== false,
          festivalSaleBannerText: settings.festivalSaleBannerText || '',
          freeShippingThreshold: settings.freeShippingThreshold || 499,
          standardDeliveryFee: settings.standardDeliveryFee || 49,
          codEnabled: settings.codEnabled !== false
        }
      });
    } else {
      const s = dataStore.settings || {};
      return res.status(200).json({
        success: true,
        data: {
          storeName: s.storeName || 'CASA',
          storeTagline: s.storeTagline || 'INDIA MARKETPLACE',
          primaryColor: s.primaryColor || '#2563eb',
          defaultLanguage: s.defaultLanguage || 'en',
          supportEmail: s.supportEmail || 'support@casa.in',
          supportPhone: s.supportPhone || '+91 9876543210',
          festivalSaleActive: s.festivalSaleActive !== false,
          festivalSaleBannerText: s.festivalSaleBannerText || '',
          freeShippingThreshold: s.freeShippingThreshold || 499,
          standardDeliveryFee: s.standardDeliveryFee || 49,
          codEnabled: s.codEnabled !== false
        }
      });
    }
  } catch (err) {
    next(err);
  }
};

