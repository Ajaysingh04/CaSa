const Product = require('../models/Product');
const Review = require('../models/Review');
const { getDBStatus } = require('../config/db');
const dataStore = require('../services/dataStore');

// @desc    Get all products with filtering, sorting, pagination
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const {
      category,
      subcategory,
      brand,
      minPrice,
      maxPrice,
      rating,
      inStock,
      sort,
      search,
      page = 1,
      limit = 12,
      featured,
      bestseller,
      trending
    } = req.query;

    if (getDBStatus()) {
      let query = { isActive: true };

      if (category) query.categorySlug = category;
      if (subcategory) query.subcategory = new RegExp(`^${subcategory}$`, 'i');
      if (brand) {
        const brands = brand.split(',');
        query.brand = { $in: brands.map(b => new RegExp(b.trim(), 'i')) };
      }
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
      }
      if (rating) {
        query.rating = { $gte: Number(rating) };
      }
      if (inStock === 'true') {
        query.stock = { $gt: 0 };
      }
      if (featured === 'true') query.isFeatured = true;
      if (bestseller === 'true') query.isBestSeller = true;
      if (trending === 'true') query.isTrending = true;

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { brand: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      let sortOptions = { createdAt: -1 };
      if (sort === 'price_asc') sortOptions = { discountPrice: 1, price: 1 };
      else if (sort === 'price_desc') sortOptions = { discountPrice: -1, price: -1 };
      else if (sort === 'rating') sortOptions = { rating: -1 };
      else if (sort === 'newest') sortOptions = { createdAt: -1 };

      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      const total = await Product.countDocuments(query);
      const products = await Product.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum);

      return res.status(200).json({
        success: true,
        count: products.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        data: products
      });
    } else {
      // In-Memory store filtering
      let result = dataStore.products.filter(p => p.isActive !== false);

      if (category) {
        result = result.filter(p => p.categorySlug.toLowerCase() === category.toLowerCase());
      }
      if (subcategory) {
        result = result.filter(p => p.subcategory && p.subcategory.toLowerCase() === subcategory.toLowerCase());
      }
      if (brand) {
        const brands = brand.split(',').map(b => b.trim().toLowerCase());
        result = result.filter(p => brands.includes(p.brand.toLowerCase()));
      }
      if (minPrice) {
        const min = Number(minPrice);
        result = result.filter(p => (p.discountPrice || p.price) >= min);
      }
      if (maxPrice) {
        const max = Number(maxPrice);
        result = result.filter(p => (p.discountPrice || p.price) <= max);
      }
      if (rating) {
        const r = Number(rating);
        result = result.filter(p => p.rating >= r);
      }
      if (inStock === 'true') {
        result = result.filter(p => p.stock > 0);
      }
      if (featured === 'true') {
        result = result.filter(p => p.isFeatured);
      }
      if (bestseller === 'true') {
        result = result.filter(p => p.isBestSeller);
      }
      if (trending === 'true') {
        result = result.filter(p => p.isTrending);
      }
      if (search) {
        const s = search.toLowerCase();
        result = result.filter(p =>
          p.name.toLowerCase().includes(s) ||
          p.brand.toLowerCase().includes(s) ||
          p.categorySlug.toLowerCase().includes(s) ||
          p.subcategory.toLowerCase().includes(s) ||
          (p.description && p.description.toLowerCase().includes(s))
        );
      }

      // Sorting
      if (sort === 'price_asc') {
        result.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
      } else if (sort === 'price_desc') {
        result.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
      } else if (sort === 'rating') {
        result.sort((a, b) => b.rating - a.rating);
      } else {
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      // Pagination
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const total = result.length;
      const startIndex = (pageNum - 1) * limitNum;
      const paginated = result.slice(startIndex, startIndex + limitNum);

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

// @desc    Get single product by slug or id
// @route   GET /api/products/:slugOrId
// @access  Public
exports.getProduct = async (req, res, next) => {
  try {
    const { slugOrId } = req.params;

    if (getDBStatus()) {
      let product;
      if (slugOrId.match(/^[0-9a-fA-F]{24}$/)) {
        product = await Product.findById(slugOrId).populate('category');
      } else {
        product = await Product.findOne({ slug: slugOrId }).populate('category');
      }

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      // Get reviews for this product
      const reviews = await Review.find({ product: product._id, isApproved: true }).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        data: {
          ...product.toObject(),
          reviews
        }
      });
    } else {
      const product = dataStore.products.find(
        p => p.slug === slugOrId || p._id === slugOrId
      );

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      const reviews = dataStore.reviews.filter(
        r => r.product === product._id && r.isApproved
      );

      return res.status(200).json({
        success: true,
        data: {
          ...product,
          reviews
        }
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get search suggestions / auto-complete
// @route   GET /api/products/search/suggestions
// @access  Public
exports.getSearchSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(200).json({ success: true, suggestions: [] });
    }

    const query = q.trim().toLowerCase();

    if (getDBStatus()) {
      const products = await Product.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { brand: { $regex: query, $options: 'i' } }
        ]
      })
        .select('name slug brand categorySlug images price discountPrice')
        .limit(6);

      return res.status(200).json({ success: true, suggestions: products });
    } else {
      const matches = dataStore.products
        .filter(
          p =>
            p.name.toLowerCase().includes(query) ||
            p.brand.toLowerCase().includes(query) ||
            p.subcategory.toLowerCase().includes(query)
        )
        .slice(0, 6)
        .map(p => ({
          _id: p._id,
          name: p.name,
          slug: p.slug,
          brand: p.brand,
          categorySlug: p.categorySlug,
          image: p.images[0],
          price: p.discountPrice || p.price
        }));

      return res.status(200).json({ success: true, suggestions: matches });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Add review for a product
// @route   POST /api/products/:id/reviews
// @access  Private
exports.createProductReview = async (req, res, next) => {
  try {
    const { rating, title, comment } = req.body;
    const productId = req.params.id;

    if (!rating || !title || !comment) {
      return res.status(400).json({ success: false, message: 'Please provide rating, title, and comment' });
    }

    if (getDBStatus()) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      const alreadyReviewed = await Review.findOne({
        product: productId,
        user: req.user._id
      });

      if (alreadyReviewed) {
        return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
      }

      const review = await Review.create({
        product: productId,
        user: req.user._id,
        userName: req.user.name,
        rating: Number(rating),
        title,
        comment,
        isVerifiedPurchase: true,
        isApproved: true
      });

      const allReviews = await Review.find({ product: productId, isApproved: true });
      product.numReviews = allReviews.length;
      product.rating = Number((allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length).toFixed(1));
      await product.save();

      return res.status(201).json({ success: true, data: review });
    } else {
      const product = dataStore.products.find(p => p._id === productId || p.slug === productId);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      const existingReview = dataStore.reviews.find(
        r => (r.product === product._id || r.product === product.slug) && r.user === req.user._id
      );

      if (existingReview) {
        return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
      }

      const newReview = {
        _id: dataStore.generateId(),
        product: product._id,
        user: req.user._id,
        userName: req.user.name,
        rating: Number(rating),
        title,
        comment,
        isVerifiedPurchase: true,
        isApproved: true,
        createdAt: new Date().toISOString()
      };

      dataStore.reviews.push(newReview);

      const productReviews = dataStore.reviews.filter(r => r.product === product._id && r.isApproved);
      product.numReviews = productReviews.length;
      product.rating = Number((productReviews.reduce((acc, item) => item.rating + acc, 0) / productReviews.length).toFixed(1));

      return res.status(201).json({ success: true, data: newReview });
    }
  } catch (err) {
    next(err);
  }
};
