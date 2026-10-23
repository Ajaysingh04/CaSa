const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { protect, authorize, forbidDemoAdminMutations } = require('../middleware/auth');

router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);
router.post('/', protect, authorize('admin', 'super_admin'), forbidDemoAdminMutations, createCategory);
router.put('/:id', protect, authorize('admin', 'super_admin'), forbidDemoAdminMutations, updateCategory);
router.delete('/:id', protect, authorize('admin', 'super_admin'), forbidDemoAdminMutations, deleteCategory);

module.exports = router;
