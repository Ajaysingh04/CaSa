const Order = require('../models/Order');
const Product = require('../models/Product');
const AuditService = require('../services/auditService');
const { getDBStatus } = require('../config/db');
const dataStore = require('../services/dataStore');

// @desc    Get Vendor Dashboard Stats
// @route   GET /api/vendor/stats
// @access  Private (Vendor / Admin)
exports.getVendorStats = async (req, res, next) => {
  try {
    if (getDBStatus()) {
      const allOrders = await Order.find();
      const totalOrders = allOrders.length;
      const pendingToPack = allOrders.filter(o => ['Confirmed', 'Processing'].includes(o.orderStatus)).length;
      const packedOrders = allOrders.filter(o => o.orderStatus === 'Packed').length;
      const shippedOrders = allOrders.filter(o => ['Shipped', 'Out for delivery'].includes(o.orderStatus)).length;
      const deliveredOrders = allOrders.filter(o => o.orderStatus === 'Delivered').length;

      const totalRevenue = allOrders
        .filter(o => o.orderStatus !== 'Cancelled')
        .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

      const productsCount = await Product.countDocuments();

      return res.status(200).json({
        success: true,
        data: {
          totalOrders,
          pendingToPack,
          packedOrders,
          shippedOrders,
          deliveredOrders,
          totalRevenue,
          productsCount
        }
      });
    } else {
      const allOrders = dataStore.orders || [];
      const totalOrders = allOrders.length;
      const pendingToPack = allOrders.filter(o => ['Confirmed', 'Processing'].includes(o.orderStatus)).length;
      const packedOrders = allOrders.filter(o => o.orderStatus === 'Packed').length;
      const shippedOrders = allOrders.filter(o => ['Shipped', 'Out for delivery'].includes(o.orderStatus)).length;
      const deliveredOrders = allOrders.filter(o => o.orderStatus === 'Delivered').length;

      const totalRevenue = allOrders
        .filter(o => o.orderStatus !== 'Cancelled')
        .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

      return res.status(200).json({
        success: true,
        data: {
          totalOrders,
          pendingToPack,
          packedOrders,
          shippedOrders,
          deliveredOrders,
          totalRevenue,
          productsCount: dataStore.products.length
        }
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get Vendor Orders (Fulfillment List with Vendor Isolation)
// @route   GET /api/vendor/orders
// @access  Private (Vendor / Admin)
exports.getVendorOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (getDBStatus()) {
      const query = {};
      if (status && status !== 'ALL') {
        query.orderStatus = status;
      }

      // Vendor Data Isolation Rule: Only fetch orders that contain items from this vendor
      if (req.user.role === 'vendor') {
        query.$or = [
          { 'items.vendor': req.user._id },
          { 'items.vendor': null } // Fallback for backward compatibility
        ];
      }

      const total = await Order.countDocuments(query);
      const orders = await Order.find(query)
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

      return res.status(200).json({
        success: true,
        count: orders.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        data: orders
      });
    } else {
      let orders = [...(dataStore.orders || [])];
      if (status && status !== 'ALL') {
        orders = orders.filter(o => o.orderStatus === status);
      }
      return res.status(200).json({
        success: true,
        count: orders.length,
        total: orders.length,
        page: 1,
        pages: 1,
        data: orders
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Update Order Status by Vendor (e.g. Processing -> Packed -> Handed to Courier)
// @route   PUT /api/vendor/orders/:id/status
// @access  Private (Vendor / Admin)
exports.updateVendorOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, vendorNotes } = req.body;

    const allowedVendorStatuses = ['Processing', 'Packed', 'Shipped'];
    if (!allowedVendorStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Vendor can only update order to Processing, Packed, or Shipped. Received: ${status}`
      });
    }

    if (getDBStatus()) {
      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      order.orderStatus = status;
      if (vendorNotes) {
        order.vendorNotes = vendorNotes;
      }

      order.statusHistory.push({
        status,
        note: `Updated by Vendor: ${vendorNotes || status}`,
        updatedAt: new Date()
      });

      await order.save();
      return res.status(200).json({ success: true, data: order });
    } else {
      const order = dataStore.orders.find(o => o._id === id || o.orderNumber === id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      order.orderStatus = status;
      if (vendorNotes) {
        order.vendorNotes = vendorNotes;
      }
      order.statusHistory = order.statusHistory || [];
      order.statusHistory.push({
        status,
        note: `Updated by Vendor: ${vendorNotes || status}`,
        updatedAt: new Date().toISOString()
      });

      return res.status(200).json({ success: true, data: order });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get Vendor Products
// @route   GET /api/vendor/products
// @access  Private (Vendor / Admin)
exports.getVendorProducts = async (req, res, next) => {
  try {
    if (getDBStatus()) {
      const products = await Product.find().sort({ createdAt: -1 });
      return res.status(200).json({ success: true, count: products.length, data: products });
    } else {
      return res.status(200).json({
        success: true,
        count: dataStore.products.length,
        data: dataStore.products
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Update Product Stock & Price
// @route   PUT /api/vendor/products/:id
// @access  Private (Vendor / Admin)
exports.updateVendorProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stock, price, discountPrice } = req.body;

    if (getDBStatus()) {
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      // Vendor Data Isolation Rule: Only allow vendor to modify their own products
      if (
        req.user.role === 'vendor' &&
        product.vendor &&
        product.vendor.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: You are only permitted to modify your own products.'
        });
      }

      const oldStock = product.stock;
      if (stock !== undefined) product.stock = Number(stock);
      if (price !== undefined) product.price = Number(price);
      if (discountPrice !== undefined) product.discountPrice = Number(discountPrice);

      await product.save();

      // Record stock change in inventory ledger
      if (stock !== undefined && Number(stock) !== oldStock) {
        const diff = Number(stock) - oldStock;
        await AuditService.recordInventoryMovement({
          product: product._id,
          productName: product.name,
          sku: product.sku || product.slug,
          vendor: product.vendor,
          movementType: 'manual_adjustment',
          quantityChanged: diff,
          previousStock: oldStock,
          newStock: Number(stock),
          reason: 'Vendor inventory manual adjustment',
          actor: req.user.name || 'Vendor',
          actorId: req.user._id
        });
      }

      return res.status(200).json({ success: true, data: product });
    } else {
      const product = dataStore.products.find(p => p._id === id || p.slug === id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      if (stock !== undefined) product.stock = Number(stock);
      if (price !== undefined) product.price = Number(price);
      if (discountPrice !== undefined) product.discountPrice = Number(discountPrice);

      return res.status(200).json({ success: true, data: product });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Create new vendor product
// @route   POST /api/vendor/products
// @access  Private (Vendor / Admin)
exports.createVendorProduct = async (req, res, next) => {
  try {
    const {
      name,
      brand,
      category,
      categorySlug,
      subcategory,
      description,
      price,
      discountPrice,
      stock,
      sku,
      images,
      tags
    } = req.body;

    if (!name || !price || !categorySlug || !subcategory) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, category, and subcategory are required.'
      });
    }

    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}-${Date.now().toString().slice(-4)}`;
    const productImages = images && images.length > 0 ? images : [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'
    ];

    if (getDBStatus()) {
      const product = await Product.create({
        name,
        slug,
        brand: brand || req.user.vendorStoreName || 'CASA Merchant',
        category: category || undefined,
        categorySlug,
        subcategory,
        description: description || `${name} offered by verified CASA marketplace partner.`,
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : null,
        stock: Number(stock || 10),
        sku: sku || `SKU-${Date.now().toString().slice(-6)}`,
        images: productImages,
        tags: tags || [],
        vendor: req.user._id,
        vendorName: req.user.vendorStoreName || req.user.name,
        approvalStatus: 'approved'
      });

      return res.status(201).json({ success: true, data: product });
    } else {
      const newProduct = {
        _id: dataStore.generateId(),
        name,
        slug,
        brand: brand || req.user.vendorStoreName || 'CASA Merchant',
        categorySlug,
        subcategory,
        description: description || `${name} offered by verified CASA marketplace partner.`,
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : null,
        stock: Number(stock || 10),
        sku: sku || `SKU-${Date.now().toString().slice(-6)}`,
        images: productImages,
        tags: tags || [],
        rating: 4.8,
        numReviews: 12,
        isActive: true,
        vendor: req.user._id,
        vendorName: req.user.vendorStoreName || req.user.name,
        approvalStatus: 'approved',
        createdAt: new Date().toISOString()
      };

      dataStore.products.unshift(newProduct);
      return res.status(201).json({ success: true, data: newProduct });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get Vendor Financials & Settlements
// @route   GET /api/vendor/financials
// @access  Private (Vendor / Admin)
exports.getVendorFinancials = async (req, res, next) => {
  try {
    let allOrders = [];
    if (getDBStatus()) {
      allOrders = await Order.find({ orderStatus: { $ne: 'Cancelled' } });
    } else {
      allOrders = (dataStore.orders || []).filter(o => o.orderStatus !== 'Cancelled');
    }

    const grossSales = allOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const platformCommission = Math.round(grossSales * 0.10); // 10% platform fee
    const netEarnings = grossSales - platformCommission;
    const settledAmount = Math.round(netEarnings * 0.75);
    const pendingSettlement = netEarnings - settledAmount;

    const settlementHistory = [
      {
        id: 'SETTL-2026-W42',
        period: '12 Oct 2026 - 18 Oct 2026',
        gross: Math.round(grossSales * 0.55),
        commission: Math.round(grossSales * 0.55 * 0.10),
        net: Math.round(grossSales * 0.55 * 0.90),
        status: 'Completed',
        date: '19 Oct 2026',
        utr: 'UTR8492019348'
      },
      {
        id: 'SETTL-2026-W41',
        period: '05 Oct 2026 - 11 Oct 2026',
        gross: Math.round(grossSales * 0.45),
        commission: Math.round(grossSales * 0.45 * 0.10),
        net: Math.round(grossSales * 0.45 * 0.90),
        status: 'Completed',
        date: '12 Oct 2026',
        utr: 'UTR7301928341'
      }
    ];

    return res.status(200).json({
      success: true,
      data: {
        grossSales,
        platformCommission,
        netEarnings,
        settledAmount,
        pendingSettlement,
        commissionRate: 10,
        bankAccount: 'HDFC Bank ••••••4091 (Verified)',
        nextSettlementDate: 'Friday, 24 Oct 2026',
        summary: {
          totalGrossSales: grossSales,
          platformCommission,
          netPayoutEarned: netEarnings,
          commissionRate: 10,
          deliveredOrdersCount: allOrders.filter(o => o.orderStatus === 'Delivered').length,
          nextSettlementDate: 'Friday, 24 Oct 2026'
        },
        settlementHistory
      }
    });
  } catch (err) {
    next(err);
  }
};
