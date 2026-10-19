const Banner = require('../models/Banner');
const { getDBStatus } = require('../config/db');
const dataStore = require('../services/dataStore');

// @desc    Get active banners for public storefront
// @route   GET /api/banners
// @access  Public
exports.getActiveBanners = async (req, res, next) => {
  try {
    if (getDBStatus()) {
      const banners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
      return res.status(200).json({ success: true, count: banners.length, data: banners });
    } else {
      const banners = (dataStore.banners || [])
        .filter(b => b.isActive !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      return res.status(200).json({ success: true, count: banners.length, data: banners });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get all banners (Admin) including inactive
// @route   GET /api/banners/all
// @access  Private/Admin
exports.getAllBannersAdmin = async (req, res, next) => {
  try {
    if (getDBStatus()) {
      const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
      return res.status(200).json({ success: true, count: banners.length, data: banners });
    } else {
      const banners = [...(dataStore.banners || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
      return res.status(200).json({ success: true, count: banners.length, data: banners });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get single banner by ID
// @route   GET /api/banners/:id
// @access  Public / Admin
exports.getBannerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (getDBStatus()) {
      const banner = await Banner.findById(id);
      if (!banner) {
        return res.status(404).json({ success: false, message: 'Banner not found' });
      }
      return res.status(200).json({ success: true, data: banner });
    } else {
      const banner = (dataStore.banners || []).find(b => b._id === id);
      if (!banner) {
        return res.status(404).json({ success: false, message: 'Banner not found' });
      }
      return res.status(200).json({ success: true, data: banner });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new banner
// @route   POST /api/banners
// @access  Private/Admin
exports.createBanner = async (req, res, next) => {
  try {
    const {
      title,
      subtitle = '',
      tag = '',
      image,
      mobileImage = '',
      link = '/products',
      buttonText = 'Shop Now',
      badge = '',
      accentColor = '#1d4ed8',
      order = 0,
      isActive = true
    } = req.body;

    if (!title || !image) {
      return res.status(400).json({
        success: false,
        message: 'Banner title and image are required'
      });
    }

    if (getDBStatus()) {
      const banner = await Banner.create({
        title: title.trim(),
        subtitle: subtitle ? subtitle.trim() : '',
        tag: tag ? tag.trim() : '',
        image,
        mobileImage: mobileImage || '',
        link: link || '/products',
        buttonText: buttonText || 'Shop Now',
        badge: badge ? badge.trim() : '',
        accentColor: accentColor || '#1d4ed8',
        order: Number(order) || 0,
        isActive: isActive !== false
      });

      return res.status(201).json({ success: true, data: banner });
    } else {
      const newBanner = {
        _id: dataStore.generateId(),
        title: title.trim(),
        subtitle: subtitle ? subtitle.trim() : '',
        tag: tag ? tag.trim() : '',
        image,
        mobileImage: mobileImage || '',
        link: link || '/products',
        buttonText: buttonText || 'Shop Now',
        badge: badge ? badge.trim() : '',
        accentColor: accentColor || '#1d4ed8',
        order: Number(order) || 0,
        isActive: isActive !== false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (!dataStore.banners) dataStore.banners = [];
      dataStore.banners.push(newBanner);
      return res.status(201).json({ success: true, data: newBanner });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Update a banner
// @route   PUT /api/banners/:id
// @access  Private/Admin
exports.updateBanner = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (getDBStatus()) {
      const banner = await Banner.findByIdAndUpdate(
        id,
        { ...req.body },
        { new: true, runValidators: true }
      );

      if (!banner) {
        return res.status(404).json({ success: false, message: 'Banner not found' });
      }

      return res.status(200).json({ success: true, data: banner });
    } else {
      const index = (dataStore.banners || []).findIndex(b => b._id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Banner not found' });
      }

      dataStore.banners[index] = {
        ...dataStore.banners[index],
        ...req.body,
        updatedAt: new Date().toISOString()
      };

      return res.status(200).json({ success: true, data: dataStore.banners[index] });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a banner
// @route   DELETE /api/banners/:id
// @access  Private/Admin
exports.deleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (getDBStatus()) {
      const banner = await Banner.findByIdAndDelete(id);
      if (!banner) {
        return res.status(404).json({ success: false, message: 'Banner not found' });
      }
      return res.status(200).json({ success: true, message: 'Banner deleted successfully' });
    } else {
      const index = (dataStore.banners || []).findIndex(b => b._id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Banner not found' });
      }
      dataStore.banners.splice(index, 1);
      return res.status(200).json({ success: true, message: 'Banner deleted successfully' });
    }
  } catch (err) {
    next(err);
  }
};
