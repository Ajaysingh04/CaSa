const express = require('express');
const router = express.Router();
const {
  getActiveBanners,
  getAllBannersAdmin,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner
} = require('../controllers/bannerController');
const { protect, authorize } = require('../middleware/auth');

// Public route - get active banners for home slider
router.get('/', getActiveBanners);

// Admin route - get all banners including inactive
router.get('/all', protect, authorize('admin'), getAllBannersAdmin);

// Get single banner by ID
router.get('/:id', getBannerById);

// Admin CRUD routes
router.post('/', protect, authorize('admin'), createBanner);
router.put('/:id', protect, authorize('admin'), updateBanner);
router.delete('/:id', protect, authorize('admin'), deleteBanner);

module.exports = router;
