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
const { protect, authorize, forbidDemoAdminMutations } = require('../middleware/auth');

// Public route - get active banners for home slider
router.get('/', getActiveBanners);

// Admin route - get all banners including inactive
router.get('/all', protect, authorize('admin', 'super_admin'), getAllBannersAdmin);

// Get single banner by ID
router.get('/:id', getBannerById);

// Admin CRUD routes
router.post('/', protect, authorize('admin', 'super_admin'), forbidDemoAdminMutations, createBanner);
router.put('/:id', protect, authorize('admin', 'super_admin'), forbidDemoAdminMutations, updateBanner);
router.delete('/:id', protect, authorize('admin', 'super_admin'), forbidDemoAdminMutations, deleteBanner);

module.exports = router;
