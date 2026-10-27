const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);
router.post('/', protect, authorize('admin', 'super_admin', 'vendor'), createCategory);
router.put('/:id', protect, authorize('admin', 'super_admin', 'vendor'), updateCategory);
router.delete('/:id', protect, authorize('admin', 'super_admin', 'vendor'), deleteCategory);

module.exports = router;
