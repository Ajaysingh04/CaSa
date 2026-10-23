import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Award, Plus, Edit2, Trash2, X, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const DEFAULT_BRANDS = [
  {
    id: 'b-apple',
    name: 'Apple',
    category: 'Flagship Electronics',
    tagline: 'M3 MacBooks & iPads',
    slug: 'electronics',
    brandQuery: 'Apple',
    color: '#0f172a',
    initial: '',
  },
  {
    id: 'b-sony',
    name: 'Sony',
    category: 'Acoustics & Visuals',
    tagline: 'Industry-Leading ANC Audio',
    slug: 'electronics',
    brandQuery: 'Sony',
    color: '#000000',
    initial: 'S',
  },
  {
    id: 'b-manyavar',
    name: 'Manyavar',
    category: 'Ethnic & Festive',
    tagline: 'Royal Sherwanis & Kurtas',
    slug: 'mens-fashion',
    brandQuery: 'Manyavar',
    color: '#831843',
    initial: 'M',
  },
  {
    id: 'b-titan',
    name: 'Titan',
    category: 'Luxury Timepieces',
    tagline: 'Edge & Regalia Classics',
    slug: 'furniture',
    brandQuery: 'Titan',
    color: '#9a3412',
    initial: 'T',
  },
  {
    id: 'b-fabindia',
    name: 'FabIndia',
    category: 'Handloom & Khadi',
    tagline: 'Artisanal Weaves & Crafts',
    slug: 'womens-fashion',
    brandQuery: 'FabIndia',
    color: '#15803d',
    initial: 'F',
  },
  {
    id: 'b-prestige',
    name: 'Prestige',
    category: 'Kitchen Essentials',
    tagline: 'Tri-Ply Stainless Cookware',
    slug: 'home-and-kitchen',
    brandQuery: 'Prestige',
    color: '#b91c1c',
    initial: 'P',
  },
  {
    id: 'b-raymond',
    name: 'Raymond',
    category: 'Fine Suiting',
    tagline: 'Since 1925 The Complete Man',
    slug: 'mens-fashion',
    brandQuery: 'Raymond',
    color: '#1e3a8a',
    initial: 'R',
  },
  {
    id: 'b-nike',
    name: 'Nike',
    category: 'Sport & Footwear',
    tagline: 'Jordan & Air Max Innovations',
    slug: 'footwear',
    brandQuery: 'Nike',
    color: '#111827',
    initial: 'N',
  },
];

const BrandShowcase = () => {
  const { isSuperAdmin } = useAuth();
  const { success, error } = useToast();

  const [brands, setBrands] = useState(() => {
    try {
      const saved = localStorage.getItem('casa_brand_partners');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_BRANDS;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    tagline: '',
    brandQuery: '',
    color: '#0f172a',
    initial: '',
  });

  const saveBrands = (newBrands) => {
    setBrands(newBrands);
    try {
      localStorage.setItem('casa_brand_partners', JSON.stringify(newBrands));
      window.dispatchEvent(new Event('casa_brand_partners_updated'));
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenAdd = () => {
    setEditingBrand(null);
    setFormData({
      name: '',
      category: 'General',
      tagline: 'Authentic Collection',
      brandQuery: '',
      color: '#1d4ed8',
      initial: 'B',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (brand, e) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      category: brand.category || '',
      tagline: brand.tagline || '',
      brandQuery: brand.brandQuery || brand.name,
      color: brand.color || '#0f172a',
      initial: brand.initial || brand.name[0]?.toUpperCase() || 'B',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id, brandName, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Delete "${brandName}" from Brand Partners?`)) {
      const updated = brands.filter((b) => b.id !== id);
      saveBrands(updated);
      success(`Brand "${brandName}" deleted successfully.`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      error('Brand name is required.');
      return;
    }

    const payload = {
      ...formData,
      initial: formData.initial.trim() || formData.name.trim()[0]?.toUpperCase() || 'B',
      brandQuery: formData.brandQuery.trim() || formData.name.trim(),
    };

    if (editingBrand) {
      const updated = brands.map((b) => (b.id === editingBrand.id ? { ...b, ...payload } : b));
      saveBrands(updated);
      success(`Brand "${formData.name}" updated successfully.`);
    } else {
      const newBrand = {
        id: `brand-${Date.now()}`,
        ...payload,
      };
      saveBrands([...brands, newBrand]);
      success(`New Brand "${formData.name}" added successfully.`);
    }
    setIsModalOpen(false);
  };

  return (
    <section style={{ padding: '36px 0', background: '#ffffff', borderTop: '1px solid #f1f5f9' }}>
      <style>{`
        .brand-grid-responsive {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        @media (min-width: 640px) {
          .brand-grid-responsive {
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
          }
        }
        @media (min-width: 1024px) {
          .brand-grid-responsive {
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
          }
        }
        .brand-card-item {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 16px;
          padding: 16px 14px;
          display: flex;
          align-items: center;
          gap: 14px;
          text-decoration: none;
          position: relative;
          overflow: hidden;
        }
        .brand-card-item:hover {
          transform: translateY(-4px) scale(1.02);
          background: #ffffff;
          border-color: #3b82f6 !important;
          box-shadow: 0 16px 30px -8px rgba(37, 99, 235, 0.15), 0 4px 12px rgba(15, 23, 42, 0.05);
        }
        .brand-card-item:hover .brand-arrow {
          transform: translateX(4px);
          color: #2563eb;
        }
        .brand-card-item .brand-arrow {
          transition: transform 0.25s ease, color 0.25s ease;
          color: #cbd5e1;
        }
        .brand-admin-actions {
          position: absolute;
          top: 6px;
          right: 6px;
          display: flex;
          gap: 4px;
          z-index: 5;
        }
        .brand-admin-btn {
          width: 26px;
          height: 26px;
          border-radius: 6px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #475569;
          transition: all 0.15s;
        }
        .brand-admin-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }
        .brand-admin-btn.delete:hover {
          background: #fee2e2;
          color: #dc2626;
          border-color: #fca5a5;
        }
      `}</style>

      <div className="container">
        {/* Super Admin Toolbar Banner */}
        {isSuperAdmin && (
          <div
            style={{
              background: '#0f172a',
              border: '1.5px solid #334155',
              borderRadius: '12px',
              padding: '8px 16px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fde68a', fontSize: '0.82rem', fontWeight: 800 }}>
              <span>👑</span>
              <span>SUPER ADMIN: Official Brand Partners Manager</span>
            </div>
            <button
              type="button"
              onClick={handleOpenAdd}
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
              }}
            >
              <Plus size={14} />
              <span>Add New Brand</span>
            </button>
          </div>
        )}

        <div className="section-header" style={{ marginBottom: '18px' }}>
          <div>
            <h2 className="section-title">
              <Award size={20} color="#2563eb" /> Official Brand Partners
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
              Directly sourced authentic collections with 100% genuine brand warranty
            </p>
          </div>
          <Link to="/products" className="section-link">
            All Brands <ArrowRight size={14} />
          </Link>
        </div>

        <div className="brand-grid-responsive">
          {brands.map((b) => (
            <div key={b.id || b.name} style={{ position: 'relative' }}>
              {/* Super Admin Controls on Card */}
              {isSuperAdmin && (
                <div className="brand-admin-actions">
                  <button
                    type="button"
                    onClick={(e) => handleOpenEdit(b, e)}
                    className="brand-admin-btn"
                    title="Edit Brand"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(b.id, b.name, e)}
                    className="brand-admin-btn delete"
                    title="Delete Brand"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}

              <Link
                to={`/products?search=${encodeURIComponent(b.brandQuery || b.name)}`}
                className="brand-card-item"
              >
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: b.color || '#0f172a',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    fontWeight: 900,
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                >
                  {b.initial || b.name[0]}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <strong style={{ fontSize: '0.92rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {b.name}
                    </strong>
                    <ShieldCheck size={13} color="#2563eb" style={{ flexShrink: 0 }} />
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                    {b.tagline}
                  </div>
                </div>

                <ArrowRight size={16} className="brand-arrow" style={{ flexShrink: 0 }} />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Super Admin Add / Edit Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '16px',
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '480px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>👑</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {editingBrand ? 'Edit Brand Partner' : 'Add New Brand Partner'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Brand Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Apple, Manyavar, Samsung"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Logo / Initial Char
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    value={formData.initial}
                    onChange={(e) => setFormData({ ...formData, initial: e.target.value })}
                    placeholder="e.g.  or S"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Brand Color Theme
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      style={{ width: '40px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      style={{ flex: 1, padding: '9px 10px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Tagline / Catchphrase
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. M3 MacBooks & iPads"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Search Keyword for Catalog
                </label>
                <input
                  type="text"
                  value={formData.brandQuery}
                  onChange={(e) => setFormData({ ...formData, brandQuery: e.target.value })}
                  placeholder="e.g. Apple (opens /products?search=Apple)"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '9px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 20px', borderRadius: '10px', border: 'none', background: '#2563eb', color: '#ffffff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}
                >
                  {editingBrand ? 'Save Changes' : 'Create Brand Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default BrandShowcase;
