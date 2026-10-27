import React, { useState, useEffect } from 'react';
import { X, Sparkles, Trash2, ExternalLink, Save, Check, Image as ImageIcon } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { categoryService } from '../../services/categoryService';
import { useToast } from '../../context/ToastContext';

const SuperAdminEditModal = ({ isOpen, onClose, product, onProductSaved }) => {
  const { success, error } = useToast();
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    categorySlug: 'electronics',
    subcategory: '',
    price: '',
    discountPrice: '',
    stock: '',
    imageUrl: '',
    description: '',
    isFeatured: false,
    isBestSeller: false,
    isActive: true,
  });

  // Load available categories
  useEffect(() => {
    categoryService.getCategories()
      .then((cats) => {
        if (cats && cats.length) setCategories(cats);
      })
      .catch(() => null);
  }, []);

  // Populate form when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        brand: product.brand || '',
        categorySlug: product.categorySlug || 'electronics',
        subcategory: product.subcategory || '',
        price: product.price !== undefined ? String(product.price) : '',
        discountPrice: product.discountPrice !== undefined && product.discountPrice !== null ? String(product.discountPrice) : '',
        stock: product.stock !== undefined ? String(product.stock) : '50',
        imageUrl: product.images?.[0] || '',
        description: product.description || product.shortDescription || '',
        isFeatured: Boolean(product.isFeatured),
        isBestSeller: Boolean(product.isBestSeller),
        isActive: product.isActive !== false,
      });
    } else {
      setFormData({
        name: '',
        brand: '',
        categorySlug: 'electronics',
        subcategory: '',
        price: '',
        discountPrice: '',
        stock: '50',
        imageUrl: '',
        description: '',
        isFeatured: false,
        isBestSeller: false,
        isActive: true,
      });
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      error('Product title is required.');
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      error('Please enter a valid price.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        brand: formData.brand.trim() || 'CASA Signature',
        categorySlug: formData.categorySlug,
        subcategory: formData.subcategory.trim() || undefined,
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
        stock: Number(formData.stock) || 0,
        images: formData.imageUrl ? [formData.imageUrl] : (product?.images || ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800']),
        description: formData.description.trim(),
        isFeatured: formData.isFeatured,
        isBestSeller: formData.isBestSeller,
        isActive: formData.isActive,
      };

      let result;
      if (product && product._id) {
        result = await adminService.updateProduct(product._id, payload);
        const updated = result || { ...product, ...payload };
        success(`Product "${payload.name}" updated live on store!`);
        window.dispatchEvent(new CustomEvent('casa:product-updated', { detail: updated }));
        if (onProductSaved) onProductSaved(updated, false);
      } else {
        result = await adminService.createProduct(payload);
        const created = result || payload;
        success(`New product "${payload.name}" added to store!`);
        window.dispatchEvent(new CustomEvent('casa:product-created', { detail: created }));
        if (onProductSaved) onProductSaved(created, false);
      }
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (typeof err.response?.data === 'string' && err.response.data) ||
        err.message ||
        'Failed to save product changes.';
      error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!product || !product._id) return;
    if (!window.confirm(`Are you sure you want to permanently delete "${product.name}" from the store catalog?`)) {
      return;
    }

    setDeleting(true);
    try {
      await adminService.deleteProduct(product._id);
      success(`Product "${product.name}" deleted from store.`);
      window.dispatchEvent(new CustomEvent('casa:product-deleted', { detail: product._id }));
      if (onProductSaved) onProductSaved(product, true);
      onClose();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete product.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={modalBackdrop} onClick={onClose}>
      <div style={modalContainer} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={crownBadge}>👑</div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                {product ? 'Super Admin: Live Product Editor' : 'Super Admin: Add Product to Live Store'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                Root Access • Changes will reflect immediately across customer store
              </div>
            </div>
          </div>
          <button type="button" onClick={onClose} style={closeBtn} title="Close Editor">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={formStyle}>
          {/* Two-Column Top: Title & Brand */}
          <div style={formGrid}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Product Title *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Premium Noise Cancelling Headphones"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Brand Name</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="e.g. Sony, Apple, CASA Luxury"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Category *</label>
              <select
                value={formData.categorySlug}
                onChange={(e) => setFormData({ ...formData, categorySlug: e.target.value })}
                style={selectStyle}
              >
                {categories.length > 0 ? (
                  categories.map((c) => (
                    <option key={c.slug || c._id} value={c.slug}>
                      {c.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="electronics">Electronics</option>
                    <option value="fashion">Fashion & Apparel</option>
                    <option value="home-living">Home & Living</option>
                    <option value="beauty">Beauty & Grooming</option>
                    <option value="grocery">Daily Grocery</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Subcategory</label>
              <input
                type="text"
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                placeholder="e.g. Wireless Audio, Smartwatches"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Stock Inventory *</label>
              <input
                type="number"
                min="0"
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="50"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Price (₹) *</label>
              <input
                type="number"
                min="1"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="1999"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Discount / Sale Price (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.discountPrice}
                onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                placeholder="Leave blank if no discount"
                style={inputStyle}
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>
                <ImageIcon size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
                Product Image URL
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                style={inputStyle}
              />
              {formData.imageUrl && (
                <div style={imagePreviewBox}>
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Live image preview</span>
                </div>
              )}
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Short Description</label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Highlights and key product specifications..."
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Badges / Toggles */}
          <div style={togglesRow}>
            <label style={toggleLabel}>
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                style={{ accentColor: '#2563eb', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }}>⭐ Feature on Homepage</span>
            </label>

            <label style={toggleLabel}>
              <input
                type="checkbox"
                checked={formData.isBestSeller}
                onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                style={{ accentColor: '#2563eb', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }}>🔥 Mark as Top Pick / Best Seller</span>
            </label>

            <label style={toggleLabel}>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                style={{ accentColor: '#16a34a', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }}>✅ Visible on Store</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div style={modalFooter}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {product && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting || saving}
                  style={deleteBtn}
                  title="Delete this product from catalog"
                >
                  <Trash2 size={14} />
                  <span>{deleting ? 'Deleting...' : 'Delete'}</span>
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={saving || deleting}
                style={cancelBtn}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || deleting}
                style={saveBtn}
              >
                <Save size={15} />
                <span>{saving ? 'Updating Live...' : 'Save Changes (Live)'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

/* Styles */
const modalBackdrop = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.65)',
  backdropFilter: 'blur(4px)',
  zIndex: 10000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px',
  boxSizing: 'border-box',
};

const modalContainer = {
  background: '#ffffff',
  borderRadius: '20px',
  maxWidth: '680px',
  width: '100%',
  maxHeight: '92vh',
  overflowY: 'auto',
  boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3)',
  border: '1px solid #e2e8f0',
  animation: 'modalSlideUp 0.22s ease-out',
};

const modalHeader = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '18px 24px',
  borderBottom: '1px solid #f1f5f9',
  background: '#f8fafc',
  borderTopLeftRadius: '20px',
  borderTopRightRadius: '20px',
};

const crownBadge = {
  width: '38px',
  height: '38px',
  borderRadius: '10px',
  background: '#0f172a',
  color: '#fbbf24',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.2rem',
  boxShadow: '0 4px 10px rgba(15, 23, 42, 0.15)',
};

const closeBtn = {
  background: '#f1f5f9',
  border: 'none',
  borderRadius: '8px',
  padding: '7px',
  cursor: 'pointer',
  color: '#64748b',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const formStyle = {
  padding: '22px 24px 24px',
};

const formGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '14px',
};

const labelStyle = {
  display: 'block',
  fontSize: '0.78rem',
  fontWeight: 700,
  color: '#334155',
  marginBottom: '6px',
};

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: '9px',
  border: '1.5px solid #cbd5e1',
  fontSize: '0.86rem',
  color: '#0f172a',
  background: '#ffffff',
  boxSizing: 'border-box',
  outline: 'none',
};

const selectStyle = {
  ...inputStyle,
  cursor: 'pointer',
};

const imagePreviewBox = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginTop: '8px',
  padding: '6px 10px',
  background: '#f8fafc',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
};

const togglesRow = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '16px',
  margin: '18px 0 22px',
  padding: '12px 14px',
  background: '#f8fafc',
  borderRadius: '10px',
  border: '1px solid #e2e8f0',
};

const toggleLabel = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
};

const modalFooter = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingTop: '16px',
  borderTop: '1px solid #f1f5f9',
};

const cancelBtn = {
  background: '#f1f5f9',
  border: 'none',
  padding: '10px 18px',
  borderRadius: '10px',
  fontSize: '0.86rem',
  fontWeight: 700,
  color: '#475569',
  cursor: 'pointer',
};

const saveBtn = {
  background: '#0f172a',
  color: '#ffffff',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '10px',
  fontSize: '0.86rem',
  fontWeight: 800,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.25)',
};

const deleteBtn = {
  background: '#fee2e2',
  color: '#dc2626',
  border: '1px solid #fecaca',
  padding: '9px 14px',
  borderRadius: '10px',
  fontSize: '0.82rem',
  fontWeight: 700,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
};

export default SuperAdminEditModal;
