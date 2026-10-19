const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { getDBStatus } = require('../config/db');
const dataStore = require('../services/dataStore');

// Helper to calculate totals
const calculateCartTotals = (items, coupon = null) => {
  const itemsPrice = items.reduce((acc, item) => {
    const unitPrice = item.product.discountPrice || item.product.price;
    return acc + unitPrice * item.quantity;
  }, 0);

  // Free shipping over ₹499, otherwise ₹49 flat
  const shippingPrice = itemsPrice >= 499 || itemsPrice === 0 ? 0 : 49;

  let discountPrice = 0;
  if (coupon && coupon.isActive) {
    if (itemsPrice >= (coupon.minOrderAmount || 0)) {
      if (coupon.discountType === 'percentage') {
        discountPrice = Math.round((itemsPrice * coupon.discountAmount) / 100);
        if (coupon.maxDiscountAmount && discountPrice > coupon.maxDiscountAmount) {
          discountPrice = coupon.maxDiscountAmount;
        }
      } else if (coupon.discountType === 'fixed') {
        discountPrice = coupon.discountAmount;
      }
    }
  }

  const taxPrice = 0; // GST included in product MRP in India
  const totalPrice = Math.max(0, itemsPrice + shippingPrice - discountPrice);

  return {
    itemsPrice,
    shippingPrice,
    taxPrice,
    discountPrice,
    totalPrice
  };
};

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res, next) => {
  try {
    const userId = req.user._id;

    if (getDBStatus()) {
      let cart = await Cart.findOne({ user: userId })
        .populate('items.product')
        .populate('coupon');

      if (!cart) {
        cart = await Cart.create({ user: userId, items: [] });
      }

      // Filter out deleted products or items where product is null
      cart.items = cart.items.filter(item => item.product && item.product.isActive);

      const totals = calculateCartTotals(cart.items, cart.coupon);

      return res.status(200).json({
        success: true,
        data: {
          items: cart.items,
          coupon: cart.coupon,
          totals
        }
      });
    } else {
      let userCart = dataStore.carts.get(userId);
      if (!userCart) {
        userCart = { items: [], coupon: null };
        dataStore.carts.set(userId, userCart);
      }

      // Populate products
      const populatedItems = userCart.items
        .map(item => {
          const product = dataStore.products.find(p => p._id === item.productId);
          if (!product) return null;
          return {
            _id: item._id,
            product,
            selectedVariant: item.selectedVariant,
            quantity: item.quantity,
            priceAtAddition: item.priceAtAddition
          };
        })
        .filter(Boolean);

      const totals = calculateCartTotals(populatedItems, userCart.coupon);

      return res.status(200).json({
        success: true,
        data: {
          items: populatedItems,
          coupon: userCart.coupon,
          totals
        }
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
exports.addItem = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId, quantity = 1, selectedVariant = {} } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    if (getDBStatus()) {
      const product = await Product.findById(productId);
      if (!product || !product.isActive) {
        return res.status(404).json({ success: false, message: 'Product not found or unavailable' });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} units currently in stock for ${product.name}`
        });
      }

      let cart = await Cart.findOne({ user: userId });
      if (!cart) {
        cart = new Cart({ user: userId, items: [] });
      }

      // Check if item with same variant already exists
      const existingItemIndex = cart.items.findIndex(
        item =>
          item.product.toString() === productId &&
          JSON.stringify(Object.fromEntries(item.selectedVariant || new Map())) ===
            JSON.stringify(selectedVariant)
      );

      const currentPrice = product.discountPrice || product.price;

      if (existingItemIndex > -1) {
        const newQty = cart.items[existingItemIndex].quantity + Number(quantity);
        if (newQty > product.stock) {
          return res.status(400).json({
            success: false,
            message: `Cannot add more. Only ${product.stock} available in stock.`
          });
        }
        cart.items[existingItemIndex].quantity = newQty;
      } else {
        cart.items.push({
          product: productId,
          selectedVariant,
          quantity: Number(quantity),
          priceAtAddition: currentPrice
        });
      }

      await cart.save();
      return exports.getCart(req, res, next);
    } else {
      const product = dataStore.products.find(p => p._id === productId || p.slug === productId);
      if (!product || !product.isActive) {
        return res.status(404).json({ success: false, message: 'Product not found or unavailable' });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} units currently in stock for ${product.name}`
        });
      }

      let userCart = dataStore.carts.get(userId);
      if (!userCart) {
        userCart = { items: [], coupon: null };
        dataStore.carts.set(userId, userCart);
      }

      const existingItem = userCart.items.find(
        item =>
          item.productId === product._id &&
          JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant)
      );

      const currentPrice = product.discountPrice || product.price;

      if (existingItem) {
        const newQty = existingItem.quantity + Number(quantity);
        if (newQty > product.stock) {
          return res.status(400).json({
            success: false,
            message: `Cannot add more. Only ${product.stock} available in stock.`
          });
        }
        existingItem.quantity = newQty;
      } else {
        userCart.items.push({
          _id: dataStore.generateId(),
          productId: product._id,
          selectedVariant,
          quantity: Number(quantity),
          priceAtAddition: currentPrice
        });
      }

      return exports.getCart(req, res, next);
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Update item quantity in cart
// @route   PUT /api/cart/items/:itemId
// @access  Private
exports.updateQuantity = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    if (getDBStatus()) {
      const cart = await Cart.findOne({ user: userId }).populate('items.product');
      if (!cart) {
        return res.status(404).json({ success: false, message: 'Cart not found' });
      }

      const item = cart.items.id(itemId);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Cart item not found' });
      }

      if (item.product && item.product.stock < qty) {
        return res.status(400).json({
          success: false,
          message: `Only ${item.product.stock} units in stock`
        });
      }

      item.quantity = qty;
      await cart.save();
      return exports.getCart(req, res, next);
    } else {
      const userCart = dataStore.carts.get(userId);
      if (!userCart) {
        return res.status(404).json({ success: false, message: 'Cart not found' });
      }

      const item = userCart.items.find(i => i._id === itemId);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Cart item not found' });
      }

      const product = dataStore.products.find(p => p._id === item.productId);
      if (product && product.stock < qty) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} units in stock`
        });
      }

      item.quantity = qty;
      return exports.getCart(req, res, next);
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:itemId
// @access  Private
exports.removeItem = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;

    if (getDBStatus()) {
      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        return res.status(404).json({ success: false, message: 'Cart not found' });
      }

      cart.items = cart.items.filter(item => item._id.toString() !== itemId);
      await cart.save();
      return exports.getCart(req, res, next);
    } else {
      const userCart = dataStore.carts.get(userId);
      if (userCart) {
        userCart.items = userCart.items.filter(item => item._id !== itemId);
      }
      return exports.getCart(req, res, next);
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Apply coupon to cart
// @route   POST /api/cart/coupon
// @access  Private
exports.applyCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Please enter a coupon code' });
    }

    const cleanCode = code.trim().toUpperCase();

    if (getDBStatus()) {
      const coupon = await Coupon.findOne({ code: cleanCode, isActive: true });
      if (!coupon) {
        return res.status(400).json({ success: false, message: 'Invalid or expired coupon code' });
      }

      const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ success: false, message: 'Cart is empty' });
      }

      const itemsPrice = cart.items.reduce((acc, item) => {
        return acc + (item.product.discountPrice || item.product.price) * item.quantity;
      }, 0);

      if (itemsPrice < coupon.minOrderAmount) {
        return res.status(400).json({
          success: false,
          message: `Coupon '${cleanCode}' requires a minimum order value of ₹${coupon.minOrderAmount}. (Current items total: ₹${itemsPrice})`
        });
      }

      cart.coupon = coupon._id;
      await cart.save();
      return exports.getCart(req, res, next);
    } else {
      const coupon = dataStore.coupons.find(c => c.code === cleanCode && c.isActive);
      if (!coupon) {
        return res.status(400).json({ success: false, message: 'Invalid or expired coupon code' });
      }

      let userCart = dataStore.carts.get(req.user._id);
      if (!userCart || userCart.items.length === 0) {
        return res.status(400).json({ success: false, message: 'Cart is empty' });
      }

      const itemsPrice = userCart.items.reduce((acc, item) => {
        const prod = dataStore.products.find(p => p._id === item.productId);
        return acc + ((prod?.discountPrice || prod?.price) || item.priceAtAddition) * item.quantity;
      }, 0);

      if (itemsPrice < coupon.minOrderAmount) {
        return res.status(400).json({
          success: false,
          message: `Coupon '${cleanCode}' requires a minimum order value of ₹${coupon.minOrderAmount}. (Current total: ₹${itemsPrice})`
        });
      }

      userCart.coupon = coupon;
      return exports.getCart(req, res, next);
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Remove coupon from cart
// @route   DELETE /api/cart/coupon
// @access  Private
exports.removeCoupon = async (req, res, next) => {
  try {
    if (getDBStatus()) {
      const cart = await Cart.findOne({ user: req.user._id });
      if (cart) {
        cart.coupon = null;
        await cart.save();
      }
    } else {
      const userCart = dataStore.carts.get(req.user._id);
      if (userCart) {
        userCart.coupon = null;
      }
    }
    return exports.getCart(req, res, next);
  } catch (err) {
    next(err);
  }
};

// @desc    Merge guest cart into user cart after login
// @route   POST /api/cart/merge
// @access  Private
exports.mergeGuestCart = async (req, res, next) => {
  try {
    const { guestItems = [] } = req.body;
    for (const item of guestItems) {
      if (item.productId) {
        req.body = item;
        await exports.addItem(req, { status: () => ({ json: () => {} }) }, () => {});
      }
    }
    return exports.getCart(req, res, next);
  } catch (err) {
    next(err);
  }
};
