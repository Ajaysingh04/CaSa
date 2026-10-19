import React, { useState, useEffect, useMemo } from 'react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  Sparkles,
  ChevronRight,
  ExternalLink,
  X,
  Check,
  FolderPlus,
  RefreshCw,
  FolderTree,
  Tag,
  Eye,
  ArrowUpDown,
  ShoppingBag,
  Laptop,
  Shirt,
  Baby,
  Home,
  Heart,
  Footprints,
  Activity,
  Watch,
} from 'lucide-react';

const ICON_OPTIONS = [
  'ShoppingBag',
  'Shirt',
  'Laptop',
  'Footprints',
  'Home',
  'Heart',
  'Sparkles',
  'Baby',
  'Watch',
  'Activity',
];

const AdminCategoriesPage = () => {
  const { success, error } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [saving, setSaving] = useState(false);

  // Subcategory Quick Add Modal / Drawer
  const [activeSubCatCategory, setActiveSubCatCategory] = useState(null);
  const [newSubName, setNewSubName] = useState('');

  // Form State for Create/Edit
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: 'ShoppingBag',
    image: '',
    bannerImage: '',
    isFeatured: false,
    order: 0,
    subcategories: [],
  });

  const loadCategories = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await adminService.getCategories();
      setCategories(data || []);
    } catch (err) {
      error('Failed to load categories');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: 'ShoppingBag',
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&auto=format&fit=crop&q=80',
      bannerImage: '',
      isFeatured: false,
      order: categories.length + 1,
      subcategories: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      icon: cat.icon || 'ShoppingBag',
      image: cat.image || '',
      bannerImage: cat.bannerImage || '',
      isFeatured: Boolean(cat.isFeatured),
      order: cat.order || 0,
      subcategories: cat.subcategories || [],
    });
    setIsModalOpen(true);
  };

  const handleNameChange = (nameVal) => {
    const slugVal = nameVal
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    setFormData((prev) => ({
      ...prev,
      name: nameVal,
      slug: editingCategory ? prev.slug : slugVal,
    }));
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.slug || !formData.image) {
      error('Name, slug and image are required');
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        await adminService.updateCategory(editingCategory._id, formData);
        success(`Category "${formData.name}" updated successfully!`);
      } else {
        await adminService.createCategory(formData);
        success(`Category "${formData.name}" created successfully!`);
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (cat) => {
    if (!window.confirm(`Are you sure you want to delete "${cat.name}" and all its subcategories?`)) {
      return;
    }

    try {
      await adminService.deleteCategory(cat._id);
      success(`Category "${cat.name}" removed successfully.`);
      setCategories((prev) => prev.filter((c) => c._id !== cat._id));
    } catch (err) {
      error('Failed to delete category');
    }
  };

  const handleAddSubcategory = async (e) => {
    e.preventDefault();
    if (!newSubName.trim() || !activeSubCatCategory) return;

    const subSlug = newSubName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const updatedSubcategories = [
      ...(activeSubCatCategory.subcategories || []),
      { name: newSubName.trim(), slug: subSlug },
    ];

    try {
      await adminService.updateCategory(activeSubCatCategory._id, {
        subcategories: updatedSubcategories,
      });
      success(`Subcategory "${newSubName}" added to ${activeSubCatCategory.name}!`);
      setNewSubName('');
      setActiveSubCatCategory(null);
      loadCategories();
    } catch (err) {
      error('Failed to add subcategory');
    }
  };

  const handleDeleteSubcategory = async (category, subSlug) => {
    if (!window.confirm('Remove this subcategory?')) return;

    const updated = (category.subcategories || []).filter((s) => s.slug !== subSlug);
    try {
      await adminService.updateCategory(category._id, {
        subcategories: updated,
      });
      success('Subcategory removed');
      loadCategories();
    } catch (err) {
      error('Failed to remove subcategory');
    }
  };

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      const q = search.toLowerCase();
      const inName = c.name?.toLowerCase().includes(q);
      const inSlug = c.slug?.toLowerCase().includes(q);
      const inSub = (c.subcategories || []).some((s) => s.name?.toLowerCase().includes(q));
      return inName || inSlug || inSub;
    });
  }, [categories, search]);

  const totalSubcategories = useMemo(() => {
    return categories.reduce((sum, c) => sum + (c.subcategories?.length || 0), 0);
  }, [categories]);

  return (
    <div className="container" style={{ padding: '24px 16px 80px', maxWidth: '1380px' }}>
      <style>{`
        .cat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 20px;
        }
        @media (max-width: 640px) {
          .cat-grid {
            grid-template-columns: 1fr !important;
          }
        }
        .cat-card {
          background: #ffffff;
          border-radius: 16px;
          border: 1.5px solid #e2e8f0;
          overflow: hidden;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
        }
        .cat-card:hover {
          border-color: #93c5fd;
          box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.08);
          transform: translateY(-2px);
        }
      `}</style>

      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={22} color="#2563eb" />
            <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              Category & Taxonomy Manager
            </h1>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Control store collections, navigation icons, subcategory tags, and homepage placement.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => loadCategories(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              border: '1.5px solid #e2e8f0',
              background: '#ffffff',
              color: '#334155',
              fontSize: '0.825rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={openCreateModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              fontSize: '0.825rem',
              fontWeight: 700,
              border: 'none',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              cursor: 'pointer',
            }}
          >
            <Plus size={15} />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div style={kpiBox}>
          <span style={kpiLabel}>Total Categories</span>
          <strong style={kpiVal}>{categories.length}</strong>
        </div>
        <div style={kpiBox}>
          <span style={kpiLabel}>Total Subcategories</span>
          <strong style={{ ...kpiVal, color: '#4338ca' }}>{totalSubcategories}</strong>
        </div>
        <div style={kpiBox}>
          <span style={kpiLabel}>Featured Collections</span>
          <strong style={{ ...kpiVal, color: '#059669' }}>
            {categories.filter((c) => c.isFeatured).length}
          </strong>
        </div>
      </div>

      {/* Search Filter Strip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#ffffff', padding: '12px 16px', borderRadius: '14px', border: '1.5px solid #e2e8f0', marginBottom: '24px' }}>
        <Search size={18} color="#94a3b8" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories or subcategories (e.g. Sarees, Electronics, Footwear)..."
          style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.875rem', color: '#0f172a' }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <RefreshCw size={24} className="spin" style={{ margin: '0 auto 10px', display: 'block' }} />
          Loading store categories...
        </div>
      ) : filteredCategories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 16px', background: '#ffffff', borderRadius: '16px', border: '1.5px dashed #cbd5e1' }}>
          <FolderTree size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>No Categories Found</h3>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>Try a different search or create a new category.</p>
        </div>
      ) : (
        <div className="cat-grid">
          {filteredCategories.map((cat) => (
            <div key={cat._id} className="cat-card">
              {/* Category Cover Image Header */}
              <div style={{ height: '140px', position: 'relative', background: '#f1f5f9' }}>
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600'}
                  alt={cat.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.75) 0%, rgba(15,23,42,0.1) 60%)' }} />

                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '6px' }}>
                  {cat.isFeatured && (
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
                      FEATURED
                    </span>
                  )}
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: 'rgba(15,23,42,0.6)', color: '#ffffff' }}>
                    Order #{cat.order || 0}
                  </span>
                </div>

                <div style={{ position: 'absolute', bottom: '12px', left: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
                    <Layers size={18} color="#2563eb" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                      {cat.name}
                    </h3>
                    <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>/{cat.slug}</span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 12px', lineHeight: 1.45, flex: '0 0 auto' }}>
                  {cat.description || 'No description provided.'}
                </p>

                {/* Subcategories Header & Badges */}
                <div style={{ marginBottom: '14px', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>
                      Subcategories ({cat.subcategories?.length || 0})
                    </span>
                    <button
                      onClick={() => setActiveSubCatCategory(cat)}
                      style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                    >
                      <Plus size={12} /> Add Subtag
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(cat.subcategories || []).length === 0 ? (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                        No subcategories added yet.
                      </span>
                    ) : (
                      cat.subcategories.map((sub) => (
                        <span
                          key={sub.slug}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: '#f1f5f9',
                            color: '#334155',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            border: '1px solid #e2e8f0',
                          }}
                        >
                          {sub.name}
                          <button
                            onClick={() => handleDeleteSubcategory(cat, sub.slug)}
                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#94a3b8' }}
                            title="Remove subcategory"
                          >
                            <X size={11} />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                  <a
                    href={`/category/${cat.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '0.78rem', color: '#2563eb', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    View Storefront <ExternalLink size={12} />
                  </a>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => openEditModal(cat)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '5px 10px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#334155',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '5px 10px',
                        borderRadius: '8px',
                        border: '1px solid #fee2e2',
                        background: '#fef2f2',
                        color: '#dc2626',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT CATEGORY MODAL */}
      {isModalOpen && (
        <div style={modalBackdrop}>
          <div style={modalCard}>
            <div style={modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} color="#2563eb" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={closeBtn}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Ethnic & Festive Wear"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Category Slug *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. ethnic-wear"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Display Order #</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Cover Image URL *</label>
                <input
                  type="url"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief summary of items in this collection..."
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <input
                  type="checkbox"
                  id="featuredCheck"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="featuredCheck" style={{ fontSize: '0.825rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  Mark as Featured Collection on Homepage
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={secondaryBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={primaryBtn}>
                  {saving ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK ADD SUBCATEGORY MODAL */}
      {activeSubCatCategory && (
        <div style={modalBackdrop}>
          <div style={{ ...modalCard, maxWidth: '420px' }}>
            <div style={modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tag size={17} color="#2563eb" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Add Subcategory to {activeSubCatCategory.name}
                </h3>
              </div>
              <button onClick={() => setActiveSubCatCategory(null)} style={closeBtn}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubcategory} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Subcategory Tag Name *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="e.g. Silk Sarees, Cotton Kurtis"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button type="button" onClick={() => setActiveSubCatCategory(null)} style={secondaryBtn}>
                  Cancel
                </button>
                <button type="submit" style={primaryBtn}>
                  Add Subcategory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* Styles */
const kpiBox = {
  background: '#ffffff',
  padding: '16px 20px',
  borderRadius: '14px',
  border: '1.5px solid #e2e8f0',
};

const kpiLabel = {
  fontSize: '0.78rem',
  color: '#64748b',
  fontWeight: 600,
  display: 'block',
  marginBottom: '4px',
};

const kpiVal = {
  fontSize: '1.65rem',
  fontWeight: 900,
  color: '#0f172a',
  letterSpacing: '-0.02em',
};

const modalBackdrop = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px',
  zIndex: 1000,
};

const modalCard = {
  background: '#ffffff',
  borderRadius: '18px',
  padding: '24px',
  width: '100%',
  maxWidth: '520px',
  boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.25)',
};

const modalHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '16px',
  paddingBottom: '12px',
  borderBottom: '1px solid #f1f5f9',
};

const closeBtn = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#94a3b8',
};

const labelStyle = {
  fontSize: '0.8rem',
  fontWeight: 700,
  color: '#334155',
  display: 'block',
  marginBottom: '5px',
};

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: '10px',
  border: '1.5px solid #cbd5e1',
  fontSize: '0.85rem',
  color: '#0f172a',
  outline: 'none',
  boxSizing: 'border-box',
};

const primaryBtn = {
  padding: '8px 16px',
  borderRadius: '10px',
  background: '#2563eb',
  color: '#ffffff',
  fontSize: '0.825rem',
  fontWeight: 700,
  border: 'none',
  cursor: 'pointer',
};

const secondaryBtn = {
  padding: '8px 14px',
  borderRadius: '10px',
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  color: '#475569',
  fontSize: '0.825rem',
  fontWeight: 600,
  cursor: 'pointer',
};

export default AdminCategoriesPage;
