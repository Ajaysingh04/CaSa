const mongoose = require('mongoose');

const specificationSchema = new mongoose.Schema({
  key: { type: String, required: true },
  value: { type: String, required: true }
});

const variantSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "Size", "Color"
  options: [{ type: String, required: true }] // e.g. ["S", "M", "L"]
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters']
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required']
    },
    categorySlug: {
      type: String,
      required: true
    },
    subcategory: {
      type: String,
      required: [true, 'Subcategory is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Product description is required']
    },
    shortDescription: {
      type: String,
      default: ''
    },
    images: {
      type: [String],
      required: [true, 'At least one product image is required'],
      validate: [val => val.length > 0, 'Must have at least one image']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive']
    },
    discountPrice: {
      type: Number,
      default: null,
      validate: {
        validator: function (val) {
          return val === null || val === undefined || val < this.price;
        },
        message: 'Discounted price must be lower than original price'
      }
    },
    stock: {
      type: Number,
      required: [true, 'Stock count is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0
    },
    sku: {
      type: String,
      trim: true
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    vendorName: {
      type: String,
      default: ''
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved'
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    variants: [variantSchema],
    specifications: [specificationSchema],
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be below 0'],
      max: [5, 'Rating cannot exceed 5']
    },
    numReviews: {
      type: Number,
      default: 0
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    isBestSeller: {
      type: Boolean,
      default: false
    },
    isTrending: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    tags: [String]
  },
  {
    timestamps: true
  }
);

productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });
productSchema.index({ categorySlug: 1, subcategory: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });

module.exports = mongoose.model('Product', productSchema);
