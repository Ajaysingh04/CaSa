import React, { useState, useEffect, useMemo, useRef } from 'react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import {
  Image,
  Plus,
  Search,
  Edit2,
  Trash2,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff,
  Upload,
  Link as LinkIcon,
  Check,
  X,
  ArrowRight,
  Flame,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Layers,
  Palette,
  Sliders,
  CheckCircle2,
  AlertCircle,
  FileImage,
} from 'lucide-react';

const PRESET_BANNERS = [
  {
    name: 'Festival Grand Sale',
    title: 'CASA Grand Diwali & Festive Mega Sale',
    subtitle: 'Up to 75% Off Across 15+ Categories | Top Indian & Global Brands',
    tag: 'MEGA FESTIVAL SALE',
    badge: 'Limited Time Deal',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&auto=format&fit=crop&q=80',
    link: '/products',
    buttonText: 'Shop Grand Sale',
    accentColor: '#1d4ed8',
  },
  {
    name: 'Royal Ethnic & Bridal',
    title: 'Royal Heritage Sarees & Bridal Lehengas',
    subtitle: 'Pure Kanjivaram Silks, Banarasi Weaves & Master Artisan Couture',
    tag: 'HERITAGE COUTURE',
    badge: 'Trending Collection',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600&auto=format&fit=crop&q=80',
    link: '/category/womens-fashion',
    buttonText: 'Explore Ethnic Wear',
    accentColor: '#be185d',
  },
  {
    name: 'Next-Gen Electronics',
    title: 'Next-Gen Laptops, Audio & Smart Gadgets',
    subtitle: 'Apple M-Series, Sony Noise Cancelling, Flagship OLEDs & High-Speed Gear',
    tag: 'TECH INNOVATION',
    badge: 'Exclusive Launch',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&auto=format&fit=crop&q=80',
    link: '/category/electronics',
    buttonText: 'Upgrade Your Tech',
    accentColor: '#0f766e',
  },
  {
    name: 'Luxury Home & Living',
    title: 'Modern Sanctuary & Luxury Home Living',
    subtitle: 'Tri-ply Stainless Cookware, Egyptian Cotton Linens & Ergonomic Living',
    tag: 'ELEVATED LIVING',
    badge: 'Free Shipping > ₹499',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1600&auto=format&fit=crop&q=80',
    link: '/category/home-and-kitchen',
    buttonText: 'Shop Home Decor',
    accentColor: '#b45309',
  },
];

const POPULAR_LINKS = [
  { label: 'All Products', path: '/products' },
  { label: "Women's Fashion", path: '/category/womens-fashion' },
  { label: "Men's Fashion", path: '/category/mens-fashion' },
  { label: 'Electronics', path: '/category/electronics' },
  { label: 'Home & Kitchen', path: '/category/home-and-kitchen' },
  { label: 'Beauty & Wellness', path: '/category/beauty-and-personal-care' },
  { label: 'Footwear', path: '/category/footwear' },
  { label: 'Bestsellers', path: '/products?bestseller=true' },
];

const COLOR_SWATCHES = [
  { name: 'CASA Blue', hex: '#1d4ed8' },
  { name: 'Royal Crimson', hex: '#be185d' },
  { name: 'Emerald', hex: '#0f766e' },
  { name: 'Amber Gold', hex: '#b45309' },
  { name: 'Deep Indigo', hex: '#4338ca' },
  { name: 'Ruby Red', hex: '#dc2626' },
  { name: 'Midnight Slate', hex: '#0f172a' },
];

const AdminBannersPage = () => {
  const { success, error } = useToast();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState('all'); // 'all', 'active', 'inactive'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [saving, setSaving] = useState(false);
  const [imageInputMode, setImageInputMode] = useState('upload'); // 'upload' | 'url' | 'presets'
  const [previewTab, setPreviewTab] = useState(false); // Toggle preview on mobile

  // Form Data
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    tag: '',
    badge: '',
    image: '',
    mobileImage: '',
    link: '/products',
    buttonText: 'Shop Now',
    accentColor: '#1d4ed8',
    order: 1,
    isActive: true,
  });

  const fileInputRef = useRef(null);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileSize, setUploadFileSize] = useState('');

  // Load all banners from server
  const loadBanners = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await adminService.getAllBannersAdmin();
      setBanners(data || []);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to load banners');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const openCreateModal = () => {
    setEditingBanner(null);
    setUploadFileName('');
    setUploadFileSize('');
    setImageInputMode('upload');
    setFormData({
      title: '',
      subtitle: '',
      tag: 'NEW ARRIVAL',
      badge: 'Special Offer',
      image: '',
      mobileImage: '',
      link: '/products',
      buttonText: 'Shop Collection',
      accentColor: '#1d4ed8',
      order: banners.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (banner) => {
    setEditingBanner(banner);
    setUploadFileName('');
    setUploadFileSize('');
    setImageInputMode(banner.image?.startsWith('data:') ? 'upload' : 'url');
    setFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      tag: banner.tag || '',
      badge: banner.badge || '',
      image: banner.image || '',
      mobileImage: banner.mobileImage || '',
      link: banner.link || '/products',
      buttonText: banner.buttonText || 'Shop Now',
      accentColor: banner.accentColor || '#1d4ed8',
      order: banner.order || 1,
      isActive: banner.isActive !== false,
    });
    setIsModalOpen(true);
  };

  // Handle local image file upload & convert to base64 Data URL
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      error('Please select a valid image file (PNG, JPG, WebP, etc.)');
      return;
    }

    // Max 8MB
    if (file.size > 8 * 1024 * 1024) {
      error('Image file size must be less than 8MB');
      return;
    }

    setUploadFileName(file.name);
    setUploadFileSize((file.size / 1024).toFixed(1) + ' KB');

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        image: reader.result,
      }));
      success(`Image "${file.name}" loaded successfully!`);
    };
    reader.onerror = () => {
      error('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const applyPreset = (preset) => {
    setFormData((prev) => ({
      ...prev,
      title: preset.title,
      subtitle: preset.subtitle,
      tag: preset.tag,
      badge: preset.badge,
      image: preset.image,
      link: preset.link,
      buttonText: preset.buttonText,
      accentColor: preset.accentColor,
    }));
    success(`Applied preset template "${preset.name}"!`);
  };

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      error('Banner Title is required');
      return;
    }
    if (!formData.image.trim()) {
      error('Banner Image is required. Please upload an image file or enter a valid URL.');
      return;
    }

    setSaving(true);
    try {
      if (editingBanner) {
        await adminService.updateBanner(editingBanner._id, formData);
        success(`Banner "${formData.title}" updated successfully!`);
      } else {
        await adminService.createBanner(formData);
        success(`Banner "${formData.title}" created successfully!`);
      }
      setIsModalOpen(false);
      loadBanners();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save banner');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBanner = async (banner) => {
    if (!window.confirm(`Are you sure you want to delete banner "${banner.title}"?`)) {
      return;
    }

    try {
      await adminService.deleteBanner(banner._id);
      success(`Banner "${banner.title}" removed successfully.`);
      setBanners((prev) => prev.filter((b) => b._id !== banner._id));
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete banner');
    }
  };

  const handleToggleStatus = async (banner) => {
    const updatedStatus = !banner.isActive;
    try {
      await adminService.updateBanner(banner._id, { isActive: updatedStatus });
      setBanners((prev) =>
        prev.map((b) => (b._id === banner._id ? { ...b, isActive: updatedStatus } : b))
      );
      success(`Banner marked as ${updatedStatus ? 'Active' : 'Inactive'}`);
    } catch (err) {
      error('Failed to update banner status');
    }
  };

  const handleReorder = async (banner, direction) => {
    const currentOrder = banner.order || 0;
    const newOrder = direction === 'up' ? Math.max(1, currentOrder - 1) : currentOrder + 1;
    try {
      await adminService.updateBanner(banner._id, { order: newOrder });
      loadBanners();
    } catch (err) {
      error('Failed to reorder banner');
    }
  };

  // Filtered banners
  const filteredBanners = useMemo(() => {
    return banners.filter((b) => {
      const q = search.toLowerCase();
      const matchSearch =
        b.title?.toLowerCase().includes(q) ||
        b.subtitle?.toLowerCase().includes(q) ||
        b.tag?.toLowerCase().includes(q) ||
        b.badge?.toLowerCase().includes(q);

      if (filterActive === 'active') return matchSearch && b.isActive !== false;
      if (filterActive === 'inactive') return matchSearch && b.isActive === false;
      return matchSearch;
    });
  }, [banners, search, filterActive]);

  const activeCount = banners.filter((b) => b.isActive !== false).length;
  const inactiveCount = banners.length - activeCount;

  return (
    <div className="container" style={{ padding: '24px 16px 80px', maxWidth: '1400px' }}>
      <style>{`
        .banner-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 22px;
        }
        @media (max-width: 640px) {
          .banner-grid {
            grid-template-columns: 1fr !important;
          }
        }
        .banner-card {
          background: #ffffff;
          border-radius: 16px;
          border: 1.5px solid #e2e8f0;
          overflow: hidden;
          transition: all 0.25s ease;
          display: flex;
          flex-direction: column;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
        }
        .banner-card:hover {
          border-color: #93c5fd;
          box-shadow: 0 12px 28px -6px rgba(37, 99, 235, 0.12);
          transform: translateY(-2px);
        }
        .banner-preview-box {
          position: relative;
          height: 190px;
          background-size: cover;
          background-position: center;
          overflow: hidden;
        }
        .banner-preview-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(10, 20, 40, 0.92) 0%, rgba(10, 20, 40, 0.65) 55%, rgba(10, 20, 40, 0.25) 100%);
          padding: 16px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .upload-dropzone {
          border: 2px dashed #cbd5e1;
          border-radius: 14px;
          padding: 24px 16px;
          text-align: center;
          background: #f8fafc;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .upload-dropzone:hover {
          border-color: #3b82f6;
          background: #eff6ff;
        }
        .modal-body-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        @media (max-width: 900px) {
          .modal-body-grid {
            grid-template-columns: 1fr !important;
          }
        }
        .color-swatch-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 2px solid #ffffff;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          cursor: pointer;
          transition: transform 0.15s ease;
        }
        .color-swatch-btn:hover {
          transform: scale(1.15);
        }
      `}</style>

      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              }}
            >
              <Image size={20} />
            </div>
            <h1
              style={{
                fontSize: '1.65rem',
                fontWeight: 900,
                color: '#0f172a',
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              Hero Banners & Slider Manager
            </h1>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.86rem', margin: '6px 0 0' }}>
            Manage the homepage sliding carousel: upload images, edit headings, badges, CTA buttons, and slide orders.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
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
              textDecoration: 'none',
            }}
          >
            <ExternalLink size={14} />
            <span>View Live Home</span>
          </a>

          <button
            onClick={() => loadBanners(true)}
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
              padding: '8px 18px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              fontSize: '0.825rem',
              fontWeight: 700,
              border: 'none',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
              cursor: 'pointer',
            }}
          >
            <Plus size={16} />
            <span>Add New Banner</span>
          </button>
        </div>
      </div>

      {/* Stats Counters */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          marginBottom: '24px',
        }}
      >
        <div style={statCardStyle}>
          <span style={statLabelStyle}>Total Banners</span>
          <div style={statValStyle}>
            {banners.length}
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>in database</span>
          </div>
        </div>

        <div style={statCardStyle}>
          <span style={statLabelStyle}>Active Slides</span>
          <div style={{ ...statValStyle, color: '#16a34a' }}>
            {activeCount}
            <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 500 }}>
              (Live on Homepage)
            </span>
          </div>
        </div>

        <div style={statCardStyle}>
          <span style={statLabelStyle}>Inactive Drafts</span>
          <div style={{ ...statValStyle, color: inactiveCount > 0 ? '#ea580c' : '#64748b' }}>
            {inactiveCount}
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>hidden</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '12px 18px',
          border: '1.5px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search banners by title, subtitle, tag or badge..."
            style={{
              border: 'none',
              outline: 'none',
              width: '100%',
              fontSize: '0.875rem',
              color: '#0f172a',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Status Filter Buttons */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {['all', 'active', 'inactive'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterActive(status)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: filterActive === status ? '1.5px solid #2563eb' : '1.5px solid #e2e8f0',
                background: filterActive === status ? '#eff6ff' : '#ffffff',
                color: filterActive === status ? '#1d4ed8' : '#64748b',
                fontSize: '0.78rem',
                fontWeight: filterActive === status ? 700 : 500,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Loading & Empty State */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 16px', color: '#64748b' }}>
          <RefreshCw size={28} className="spin" color="#2563eb" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontWeight: 600 }}>Loading banners from server...</p>
        </div>
      ) : filteredBanners.length === 0 ? (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1.5px dashed #cbd5e1',
            padding: '50px 20px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Image size={28} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
            No banners found
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: '420px', margin: '0 auto 18px' }}>
            {search
              ? 'No banners match your search term. Try a different query.'
              : 'You have not created any hero slider banners yet. Create your first slide now!'}
          </p>
          <button
            onClick={openCreateModal}
            style={{
              padding: '8px 18px',
              borderRadius: '10px',
              background: '#2563eb',
              color: '#ffffff',
              fontSize: '0.825rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            + Create First Banner
          </button>
        </div>
      ) : (
        /* Banners Cards Grid */
        <div className="banner-grid">
          {filteredBanners.map((banner, index) => (
            <div key={banner._id || index} className="banner-card">
              {/* Visual Live Preview Banner */}
              <div
                className="banner-preview-box"
                style={{ backgroundImage: `url(${banner.image})` }}
              >
                <div className="banner-preview-overlay">
                  {/* Top Bar inside overlay: Order & Active badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <span
                        style={{
                          background: 'rgba(0,0,0,0.6)',
                          color: '#ffffff',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backdropFilter: 'blur(4px)',
                        }}
                      >
                        Slide #{banner.order || index + 1}
                      </span>
                      {banner.tag && (
                        <span
                          style={{
                            background: 'rgba(249, 115, 22, 0.35)',
                            color: '#fed7aa',
                            border: '1px solid rgba(249, 115, 22, 0.6)',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                          }}
                        >
                          {banner.tag}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleToggleStatus(banner)}
                      title={banner.isActive !== false ? 'Click to deactivate' : 'Click to activate'}
                      style={{
                        background:
                          banner.isActive !== false
                            ? 'rgba(22, 163, 74, 0.9)'
                            : 'rgba(220, 38, 38, 0.85)',
                        color: '#ffffff',
                        border: 'none',
                        padding: '3px 9px',
                        borderRadius: '9999px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                      }}
                    >
                      {banner.isActive !== false ? <Eye size={12} /> : <EyeOff size={12} />}
                      <span>{banner.isActive !== false ? 'Active' : 'Inactive'}</span>
                    </button>
                  </div>

                  {/* Middle / Bottom text in overlay */}
                  <div>
                    {banner.badge && (
                      <span
                        style={{
                          background: 'rgba(245, 158, 11, 0.3)',
                          color: '#fef08a',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          display: 'inline-block',
                          marginBottom: '4px',
                        }}
                      >
                        ★ {banner.badge}
                      </span>
                    )}
                    <h4
                      style={{
                        color: '#ffffff',
                        fontSize: '1.05rem',
                        fontWeight: 800,
                        margin: 0,
                        lineHeight: 1.25,
                        textShadow: '0 2px 6px rgba(0,0,0,0.6)',
                      }}
                    >
                      {banner.title}
                    </h4>
                  </div>
                </div>
              </div>

              {/* Card Meta & Details */}
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <p
                  style={{
                    color: '#64748b',
                    fontSize: '0.82rem',
                    lineHeight: 1.45,
                    margin: '0 0 12px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {banner.subtitle || '(No description subtitle provided)'}
                </p>

                <div
                  style={{
                    background: '#f8fafc',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    marginBottom: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    fontSize: '0.78rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Button Text:</span>
                    <span
                      style={{
                        color: '#ffffff',
                        background: banner.accentColor || '#1d4ed8',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '0.72rem',
                      }}
                    >
                      {banner.buttonText || 'Shop Now'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Target Route:</span>
                    <span
                      style={{
                        color: '#2563eb',
                        fontWeight: 600,
                        maxWidth: '200px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {banner.link || '/products'}
                    </span>
                  </div>
                </div>

                {/* Footer Controls: Order Up/Down, Edit, Delete */}
                <div
                  style={{
                    marginTop: 'auto',
                    paddingTop: '12px',
                    borderTop: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  {/* Order shift buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginRight: '4px' }}>
                      Order:
                    </span>
                    <button
                      onClick={() => handleReorder(banner, 'up')}
                      title="Move slide order up"
                      style={iconBtnStyle}
                    >
                      <ArrowUp size={13} />
                    </button>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', padding: '0 4px' }}>
                      {banner.order || 1}
                    </span>
                    <button
                      onClick={() => handleReorder(banner, 'down')}
                      title="Move slide order down"
                      style={iconBtnStyle}
                    >
                      <ArrowDown size={13} />
                    </button>
                  </div>

                  {/* Edit and Delete Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={() => openEditModal(banner)}
                      style={{
                        ...iconBtnStyle,
                        background: '#eff6ff',
                        color: '#2563eb',
                        border: '1px solid #bfdbfe',
                      }}
                      title="Edit Banner"
                    >
                      <Edit2 size={14} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, marginLeft: '4px' }}>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDeleteBanner(banner)}
                      style={{
                        ...iconBtnStyle,
                        background: '#fef2f2',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                      }}
                      title="Delete Banner"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT BANNER MODAL */}
      {isModalOpen && (
        <div style={modalBackdropStyle}>
          <div style={modalContainerStyle}>
            {/* Modal Header */}
            <div style={modalHeaderStyle}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                  {editingBanner ? `Edit Banner: "${editingBanner.title}"` : 'Create New Hero Banner'}
                </h2>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0' }}>
                  Upload image file or paste URL, craft your promo message and set target link.
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={modalCloseBtnStyle}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveBanner} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, maxHeight: 'calc(85vh - 130px)' }}>
                {/* Live Preview Bar (Interactive) */}
                <div style={{ marginBottom: '22px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}
                  >
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Live Slide Preview
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>
                      Real-time storefront rendering
                    </span>
                  </div>

                  <div
                    style={{
                      borderRadius: '14px',
                      overflow: 'hidden',
                      position: 'relative',
                      minHeight: '180px',
                      backgroundImage: formData.image
                        ? `url(${formData.image})`
                        : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                          'linear-gradient(90deg, rgba(10, 20, 40, 0.94) 0%, rgba(10, 20, 40, 0.65) 50%, rgba(10, 20, 40, 0.25) 100%)',
                        padding: '24px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {formData.tag && (
                          <span
                            style={{
                              background: 'rgba(249, 115, 22, 0.3)',
                              color: '#fed7aa',
                              border: '1px solid rgba(249, 115, 22, 0.6)',
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Flame size={11} color="#f97316" /> {formData.tag}
                          </span>
                        )}
                        {formData.badge && (
                          <span
                            style={{
                              background: 'rgba(245, 158, 11, 0.25)',
                              color: '#fef08a',
                              border: '1px solid rgba(245, 158, 11, 0.5)',
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Sparkles size={11} color="#fbbf24" /> {formData.badge}
                          </span>
                        )}
                      </div>

                      <h3
                        style={{
                          color: '#ffffff',
                          fontSize: '1.3rem',
                          fontWeight: 900,
                          margin: 0,
                          lineHeight: 1.2,
                        }}
                      >
                        {formData.title || 'Enter Banner Title Below...'}
                      </h3>

                      {formData.subtitle && (
                        <p
                          style={{
                            color: '#e2e8f0',
                            fontSize: '0.82rem',
                            margin: 0,
                            maxWidth: '480px',
                            lineHeight: 1.4,
                          }}
                        >
                          {formData.subtitle}
                        </p>
                      )}

                      <div style={{ marginTop: '4px' }}>
                        <span
                          style={{
                            background: formData.accentColor || '#1d4ed8',
                            color: '#ffffff',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                          }}
                        >
                          {formData.buttonText || 'Shop Now'} <ArrowRight size={13} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1. Image Selection Section */}
                <div
                  style={{
                    background: '#f8fafc',
                    borderRadius: '14px',
                    border: '1.5px solid #e2e8f0',
                    padding: '16px',
                    marginBottom: '20px',
                  }}
                >
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      marginBottom: '10px',
                    }}
                  >
                    Banner Background Image <span style={{ color: '#ef4444' }}>*</span>
                  </label>

                  {/* Mode switcher tabs: File Upload, Image URL, Presets */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('upload')}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        border: imageInputMode === 'upload' ? '1.5px solid #2563eb' : '1.5px solid #cbd5e1',
                        background: imageInputMode === 'upload' ? '#eff6ff' : '#ffffff',
                        color: imageInputMode === 'upload' ? '#1d4ed8' : '#64748b',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Upload size={13} />
                      <span>Upload File (Computer)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setImageInputMode('url')}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        border: imageInputMode === 'url' ? '1.5px solid #2563eb' : '1.5px solid #cbd5e1',
                        background: imageInputMode === 'url' ? '#eff6ff' : '#ffffff',
                        color: imageInputMode === 'url' ? '#1d4ed8' : '#64748b',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <LinkIcon size={13} />
                      <span>Image URL</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setImageInputMode('presets')}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        border: imageInputMode === 'presets' ? '1.5px solid #2563eb' : '1.5px solid #cbd5e1',
                        background: imageInputMode === 'presets' ? '#eff6ff' : '#ffffff',
                        color: imageInputMode === 'presets' ? '#1d4ed8' : '#64748b',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Sparkles size={13} />
                      <span>Preset Templates</span>
                    </button>
                  </div>

                  {/* Mode 1: File Upload */}
                  {imageInputMode === 'upload' && (
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*"
                        style={{ display: 'none' }}
                      />
                      <div
                        className="upload-dropzone"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            background: '#eff6ff',
                            color: '#2563eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 10px',
                          }}
                        >
                          <Upload size={20} />
                        </div>
                        <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
                          Click to browse and upload image from device
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                          Supports JPG, PNG, WebP, SVG (Recommended size: 1600 x 600px, max 8MB)
                        </p>
                      </div>

                      {uploadFileName && (
                        <div
                          style={{
                            marginTop: '10px',
                            background: '#ffffff',
                            border: '1px solid #bbf7d0',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CheckCircle2 size={16} color="#16a34a" />
                            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#15803d' }}>
                              {uploadFileName} ({uploadFileSize})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setUploadFileName('');
                              setUploadFileSize('');
                              setFormData((p) => ({ ...p, image: '' }));
                            }}
                            style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mode 2: URL Input */}
                  {imageInputMode === 'url' && (
                    <div>
                      <input
                        type="url"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="https://images.unsplash.com/... or CDN link"
                        style={inputStyle}
                      />
                      <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '6px 0 0' }}>
                        Provide a direct link to any high-resolution banner image.
                      </p>
                    </div>
                  )}

                  {/* Mode 3: Presets */}
                  {imageInputMode === 'presets' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                      {PRESET_BANNERS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => applyPreset(preset)}
                          style={{
                            textAlign: 'left',
                            borderRadius: '10px',
                            border: '1.5px solid #e2e8f0',
                            padding: '10px',
                            background: '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div
                            style={{
                              height: '50px',
                              borderRadius: '6px',
                              backgroundImage: `url(${preset.image})`,
                              backgroundSize: 'cover',
                              marginBottom: '4px',
                            }}
                          />
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
                            {preset.name}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                            {preset.tag}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Text Fields Grid */}
                <div className="modal-body-grid">
                  {/* Left Column */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={labelStyle}>
                        Banner Title <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g. CASA Grand Festival Sale"
                        required
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Subtitle / Description</label>
                      <textarea
                        value={formData.subtitle}
                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                        placeholder="e.g. Up to 70% Off on Top Brands | Handpicked Indian & Global Labels"
                        rows={3}
                        style={{ ...inputStyle, resize: 'vertical' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={labelStyle}>Header Tag Pill</label>
                        <input
                          type="text"
                          value={formData.tag}
                          onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                          placeholder="e.g. FESTIVAL EXCLUSIVE"
                          style={inputStyle}
                        />
                      </div>

                      <div>
                        <label style={labelStyle}>Promo Badge</label>
                        <input
                          type="text"
                          value={formData.badge}
                          onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                          placeholder="e.g. Limited Time Offer"
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={labelStyle}>Button Label</label>
                        <input
                          type="text"
                          value={formData.buttonText}
                          onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                          placeholder="e.g. Shop Grand Sale"
                          style={inputStyle}
                        />
                      </div>

                      <div>
                        <label style={labelStyle}>Slide Display Order</label>
                        <input
                          type="number"
                          min="1"
                          max="99"
                          value={formData.order}
                          onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    {/* Target Route with Suggestion Chips */}
                    <div>
                      <label style={labelStyle}>Button Destination URL / Route</label>
                      <input
                        type="text"
                        value={formData.link}
                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                        placeholder="/products or /category/electronics"
                        style={inputStyle}
                      />
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                        {POPULAR_LINKS.map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setFormData({ ...formData, link: item.path })}
                            style={{
                              background: formData.link === item.path ? '#eff6ff' : '#f1f5f9',
                              color: formData.link === item.path ? '#2563eb' : '#475569',
                              border: 'none',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '0.7rem',
                              cursor: 'pointer',
                              fontWeight: 600,
                            }}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Accent Color Picker & Swatches */}
                    <div>
                      <label style={labelStyle}>Theme Accent Color</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                          type="color"
                          value={formData.accentColor}
                          onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                          style={{
                            width: '40px',
                            height: '36px',
                            padding: 0,
                            borderRadius: '8px',
                            border: '1.5px solid #cbd5e1',
                            cursor: 'pointer',
                          }}
                        />
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {COLOR_SWATCHES.map((swatch, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setFormData({ ...formData, accentColor: swatch.hex })}
                              title={swatch.name}
                              className="color-swatch-btn"
                              style={{
                                background: swatch.hex,
                                outline: formData.accentColor === swatch.hex ? '2px solid #0f172a' : 'none',
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Active Status Checkbox */}
                    <div
                      style={{
                        background: '#f8fafc',
                        borderRadius: '10px',
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 'auto',
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', display: 'block' }}>
                          Display in Hero Slider (Active)
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          When enabled, shoppers will see this banner on the homepage.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={modalFooterStyle}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: '1.5px solid #e2e8f0',
                    background: '#ffffff',
                    color: '#475569',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 20px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: '#ffffff',
                    fontSize: '0.825rem',
                    fontWeight: 700,
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? (
                    <>
                      <RefreshCw size={14} className="spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>{editingBanner ? 'Save Changes' : 'Publish Banner'}</span>
                    </>
                  )}
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
const statCardStyle = {
  background: '#ffffff',
  borderRadius: '14px',
  border: '1.5px solid #e2e8f0',
  padding: '16px 20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
};

const statLabelStyle = {
  fontSize: '0.78rem',
  color: '#64748b',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const statValStyle = {
  fontSize: '1.5rem',
  fontWeight: 900,
  color: '#0f172a',
  display: 'flex',
  alignItems: 'baseline',
  gap: '8px',
};

const iconBtnStyle = {
  background: '#ffffff',
  border: '1.5px solid #e2e8f0',
  borderRadius: '8px',
  padding: '5px 8px',
  color: '#475569',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.15s ease',
};

const modalBackdropStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.65)',
  backdropFilter: 'blur(5px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '16px',
};

const modalContainerStyle = {
  background: '#ffffff',
  borderRadius: '20px',
  width: '100%',
  maxWidth: '920px',
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  overflow: 'hidden',
  animation: 'modalSlideUp 0.2s ease-out',
};

const modalHeaderStyle = {
  padding: '18px 24px',
  borderBottom: '1.5px solid #f1f5f9',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const modalCloseBtnStyle = {
  background: '#f1f5f9',
  border: 'none',
  borderRadius: '50%',
  width: '34px',
  height: '34px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#64748b',
  cursor: 'pointer',
};

const modalFooterStyle = {
  padding: '14px 24px',
  borderTop: '1.5px solid #f1f5f9',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: '12px',
  background: '#ffffff',
};

const labelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 700,
  color: '#334155',
  marginBottom: '6px',
};

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: '10px',
  border: '1.5px solid #cbd5e1',
  fontSize: '0.85rem',
  color: '#0f172a',
  outline: 'none',
  transition: 'border-color 0.15s ease',
};

export default AdminBannersPage;
