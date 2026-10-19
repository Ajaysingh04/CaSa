const Category = require('../models/Category');
const { getDBStatus } = require('../config/db');
const dataStore = require('../services/dataStore');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    if (getDBStatus()) {
      const categories = await Category.find().sort({ order: 1, name: 1 });
      return res.status(200).json({ success: true, count: categories.length, data: categories });
    } else {
      const categories = [...dataStore.categories].sort((a, b) => a.order - b.order);
      return res.status(200).json({ success: true, count: categories.length, data: categories });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get single category by slug
// @route   GET /api/categories/:slug
// @access  Public
exports.getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    if (getDBStatus()) {
      const category = await Category.findOne({ slug });
      if (!category) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }
      return res.status(200).json({ success: true, data: category });
    } else {
      const category = dataStore.categories.find(c => c.slug === slug);
      if (!category) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }
      return res.status(200).json({ success: true, data: category });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = async (req, res, next) => {
  try {
    if (getDBStatus()) {
      const category = await Category.create(req.body);
      return res.status(201).json({ success: true, data: category });
    } else {
      const newCategory = {
        _id: dataStore.generateId(),
        ...req.body,
        createdAt: new Date().toISOString()
      };
      dataStore.categories.push(newCategory);
      return res.status(201).json({ success: true, data: newCategory });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (getDBStatus()) {
      const category = await Category.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
      });
      if (!category) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }
      return res.status(200).json({ success: true, data: category });
    } else {
      const index = dataStore.categories.findIndex(c => c._id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }
      dataStore.categories[index] = { ...dataStore.categories[index], ...req.body, updatedAt: new Date().toISOString() };
      return res.status(200).json({ success: true, data: dataStore.categories[index] });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (getDBStatus()) {
      const category = await Category.findByIdAndDelete(id);
      if (!category) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }
      return res.status(200).json({ success: true, message: 'Category removed' });
    } else {
      const index = dataStore.categories.findIndex(c => c._id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }
      dataStore.categories.splice(index, 1);
      return res.status(200).json({ success: true, message: 'Category removed' });
    }
  } catch (err) {
    next(err);
  }
};
