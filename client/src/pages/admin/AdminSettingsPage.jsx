import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { useStore } from '../../context/StoreContext';
import {
  Settings,
  Store,
  Truck,
  CreditCard,
  Bell,
  Save,
  CheckCircle2,
  RefreshCw,
  Shield,
  ToggleLeft,
  ToggleRight,
  Server,
  Image,
  Plus,
  Search,
  Edit2,
  Trash2,
  Sparkles,
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
  Phone,
  Mail,
  Lock,
  Unlock,
  Building,
  Percent,
} from 'lucide-react';

const PRESET_BANNERS = [
  {
    name: 'Festival Grand Sale',
    title: 'CASA Grand Diwali & Festive Mega Sale',
    subtitle: 'Flat 50% - 75% Off Across 15+ Categories | Top Indian & Global Brands',
    tag: 'MEGA FESTIVAL SALE',
    badge: 'Limited Time Deal',
    image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1800&auto=format&fit=crop&q=85',
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
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1800&auto=format&fit=crop&q=85',
    link: '/category/womens-fashion',
    buttonText: 'Explore Ethnic Wear',
    accentColor: '#be185d',
  },
  {
    name: 'Next-Gen Electronics',
    title: 'Next-Gen Laptops, Audio & Smart Gadgets',
    subtitle: 'Apple M3 Pro, Sony ANC Headphones, Flagship OLEDs & High-Speed Gear',
    tag: 'TECH INNOVATION',
    badge: 'Exclusive Launch',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1800&auto=format&fit=crop&q=85',
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
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1800&auto=format&fit=crop&q=85',
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

const AdminSettingsPage = () => {
  const { success, error } = useToast();
  const { updateStoreSettingsLocally, applyThemeColor } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab: 'all' | 'banners' | 'profile' | 'logistics' | 'marketing'
  const initialTab = searchParams.get('tab') || 'all';
  const [activeTab, setActiveTab] = useState(initialTab);

  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // Store Settings State
  const [settings, setSettings] = useState({
    storeName: 'CASA',
    storeTagline: 'INDIA MARKETPLACE',
    primaryColor: '#2563eb',
    defaultLanguage: 'en',
    supportEmail: 'support@casa.in',
    supportPhone: '+91 9876543210',
    freeShippingThreshold: 499,
    standardDeliveryFee: 49,
    codEnabled: true,
    maintenanceMode: false,
    festivalSaleActive: true,
    festivalSaleBannerText: '🎉 FESTIVAL SALE IS LIVE: Up to 70% Off + Flat ₹200 OFF with code CASA200',
    gstRate: 18,
  });

  // Locked/Edit mode for Store Name, Tagline, Brand Color, Language & Phone
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    storeName: 'CASA',
    storeTagline: 'INDIA MARKETPLACE',
    primaryColor: '#2563eb',
    defaultLanguage: 'en',
    supportPhone: '+91 9876543210',
    supportEmail: 'support@casa.in',
    gstRate: 18,
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Banners State
  const [banners, setBanners] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [bannerSearch, setBannerSearch] = useState('');
  const [bannerFilter, setBannerFilter] = useState('all');

  // Banner Modal State
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [savingBanner, setSavingBanner] = useState(false);
  const [imageInputMode, setImageInputMode] = useState('upload'); // 'upload' | 'url' | 'presets'
  const fileInputRef = useRef(null);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileSize, setUploadFileSize] = useState('');

  const [bannerFormData, setBannerFormData] = useState({
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

  // Load Store Settings from Backend
  const loadSettings = async () => {
    try {
      const data = await adminService.getSettings();
      if (data) {
        setSettings((prev) => ({ ...prev, ...data }));
        setProfileForm({
          storeName: data.storeName || 'CASA',
          storeTagline: data.storeTagline || 'INDIA MARKETPLACE',
          primaryColor: data.primaryColor || '#2563eb',
          defaultLanguage: data.defaultLanguage || 'en',
          supportPhone: data.supportPhone || '+91 9876543210',
          supportEmail: data.supportEmail || 'support@casa.in',
          gstRate: data.gstRate || 18,
        });
      }
    } catch (err) {
      error('Failed to load system settings from backend');
    }
  };

  // Load Banners from Backend
  const loadBanners = async () => {
    setLoadingBanners(true);
    try {
      const data = await adminService.getAllBannersAdmin();
      setBanners(data || []);
    } catch (err) {
      error('Failed to load banners from backend');
    } finally {
      setLoadingBanners(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadSettings(), loadBanners()]);
      setLoading(false);
    };
    init();
  }, []);

  // Sync tab with URL
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setSearchParams(tabKey === 'all' ? {} : { tab: tabKey });
  };

  // Save Store Profile (Store Name, Tagline, Primary Color, Language, Phone, Email, GST)
  const handleStartEditProfile = () => {
    setProfileForm({
      storeName: settings.storeName || 'CASA',
      storeTagline: settings.storeTagline || 'INDIA MARKETPLACE',
      primaryColor: settings.primaryColor || '#2563eb',
      defaultLanguage: settings.defaultLanguage || 'en',
      supportPhone: settings.supportPhone || '',
      supportEmail: settings.supportEmail || '',
      gstRate: settings.gstRate || 18,
    });
    setIsEditingProfile(true);
  };

  const handleCancelEditProfile = () => {
    setProfileForm({
      storeName: settings.storeName || 'CASA',
      storeTagline: settings.storeTagline || 'INDIA MARKETPLACE',
      primaryColor: settings.primaryColor || '#2563eb',
      defaultLanguage: settings.defaultLanguage || 'en',
      supportPhone: settings.supportPhone || '',
      supportEmail: settings.supportEmail || '',
      gstRate: settings.gstRate || 18,
    });
    setIsEditingProfile(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.storeName.trim() || !profileForm.supportPhone.trim()) {
      error('Store Name and Phone Number are required!');
      return;
    }

    setSavingProfile(true);
    try {
      const payload = {
        storeName: profileForm.storeName.trim(),
        storeTagline: profileForm.storeTagline.trim(),
        primaryColor: profileForm.primaryColor.trim() || '#2563eb',
        defaultLanguage: profileForm.defaultLanguage || 'en',
        supportPhone: profileForm.supportPhone.trim(),
        supportEmail: profileForm.supportEmail.trim(),
        gstRate: Number(profileForm.gstRate) || 0,
      };

      const updated = await adminService.updateSettings(payload);

      setSettings((prev) => ({ ...prev, ...updated }));
      updateStoreSettingsLocally(updated);
      applyThemeColor(payload.primaryColor);
      setIsEditingProfile(false);
      success('Store Name, Brand Color, Language & Helpline saved to Backend!');
    } catch (err) {
      error('Failed to update Store settings in backend');
    } finally {
      setSavingProfile(false);
    }
  };

  // Save General Settings (Shipping, COD, Announcements)
  const handleSaveGeneralSettings = async (e) => {
    if (e) e.preventDefault();
    setSavingSettings(true);
    try {
      const updated = await adminService.updateSettings(settings);
      setSettings((prev) => ({ ...prev, ...updated }));
      success('Marketplace settings updated in Backend!');
    } catch (err) {
      error('Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  // BANNER HANDLERS
  const openCreateBannerModal = () => {
    setEditingBanner(null);
    setUploadFileName('');
    setUploadFileSize('');
    setImageInputMode('upload');
    setBannerFormData({
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
    setIsBannerModalOpen(true);
  };

  const openEditBannerModal = (banner) => {
    setEditingBanner(banner);
    setUploadFileName('');
    setUploadFileSize('');
    setImageInputMode(banner.image?.startsWith('data:') ? 'upload' : 'url');
    setBannerFormData({
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
    setIsBannerModalOpen(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      error('Please select a valid image file (PNG, JPG, WebP, etc.)');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      error('Image file size must be less than 8MB');
      return;
    }

    setUploadFileName(file.name);
    setUploadFileSize((file.size / 1024).toFixed(1) + ' KB');

    const reader = new FileReader();
    reader.onload = () => {
      setBannerFormData((prev) => ({ ...prev, image: reader.result }));
      success(`Image "${file.name}" uploaded successfully!`);
    };
    reader.onerror = () => {
      error('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const applyPreset = (preset) => {
    setBannerFormData((prev) => ({
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

  const notifyBannersChanged = () => {
    try {
      localStorage.removeItem('casa_active_banners');
      window.dispatchEvent(new Event('casa_banners_updated'));
    } catch {
      // ignore
    }
  };

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    if (!bannerFormData.title.trim()) {
      error('Banner Title is required');
      return;
    }
    if (!bannerFormData.image.trim()) {
      error('Banner Image is required. Please upload an image or enter a URL.');
      return;
    }

    setSavingBanner(true);
    try {
      if (editingBanner) {
        await adminService.updateBanner(editingBanner._id, bannerFormData);
        success(`Banner "${bannerFormData.title}" updated in Backend!`);
      } else {
        await adminService.createBanner(bannerFormData);
        success(`Banner "${bannerFormData.title}" created in Backend!`);
      }
      notifyBannersChanged();
      setIsBannerModalOpen(false);
      loadBanners();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save banner in backend');
    } finally {
      setSavingBanner(false);
    }
  };

  const handleDeleteBanner = async (banner) => {
    if (!window.confirm(`Are you sure you want to delete banner "${banner.title}"?`)) {
      return;
    }

    try {
      await adminService.deleteBanner(banner._id);
      success(`Banner "${banner.title}" removed from Backend.`);
      notifyBannersChanged();
      setBanners((prev) => prev.filter((b) => b._id !== banner._id));
    } catch (err) {
      error('Failed to delete banner in backend');
    }
  };

  const handleToggleBannerStatus = async (banner) => {
    const updatedStatus = !banner.isActive;
    try {
      await adminService.updateBanner(banner._id, { isActive: updatedStatus });
      notifyBannersChanged();
      setBanners((prev) =>
        prev.map((b) => (b._id === banner._id ? { ...b, isActive: updatedStatus } : b))
      );
      success(`Banner marked as ${updatedStatus ? 'Active' : 'Inactive'} in Backend!`);
    } catch (err) {
      error('Failed to update banner status in backend');
    }
  };

  const handleReorderBanner = async (banner, direction) => {
    const currentOrder = banner.order || 0;
    const newOrder = direction === 'up' ? Math.max(1, currentOrder - 1) : currentOrder + 1;
    try {
      await adminService.updateBanner(banner._id, { order: newOrder });
      notifyBannersChanged();
      loadBanners();
    } catch (err) {
      error('Failed to reorder banner in backend');
    }
  };

  // Filtered Banners
  const filteredBanners = useMemo(() => {
    return banners.filter((b) => {
      const q = bannerSearch.toLowerCase();
      const matchSearch =
        b.title?.toLowerCase().includes(q) ||
        b.subtitle?.toLowerCase().includes(q) ||
        b.tag?.toLowerCase().includes(q) ||
        b.badge?.toLowerCase().includes(q);

      if (bannerFilter === 'active') return matchSearch && b.isActive !== false;
      if (bannerFilter === 'inactive') return matchSearch && b.isActive === false;
      return matchSearch;
    });
  }, [banners, bannerSearch, bannerFilter]);

  const activeBannersCount = banners.filter((b) => b.isActive !== false).length;

  return (
    <div className="container" style={{ padding: '24px 16px 80px', maxWidth: '1280px' }}>
      <style>{`
        .settings-card {
          background: #ffffff;
          border-radius: 18px;
          border: 1.5px solid #e2e8f0;
          padding: 24px;
          margin-bottom: 24px;
          box-sizing: border-box;
          width: 100%;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
        }
        .settings-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .banner-grid-compact {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 18px;
        }
        @media (max-width: 640px) {
          .settings-grid-2 {
            grid-template-columns: 1fr !important;
          }
          .banner-grid-compact {
            grid-template-columns: 1fr !important;
          }
          .settings-card {
            padding: 16px !important;
          }
        }
        .tab-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 0.825rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
          border: 1.5px solid transparent;
          white-space: nowrap;
        }
        .tab-pill-btn.active {
          background: #2563eb;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
        }
        .tab-pill-btn.inactive {
          background: #ffffff;
          color: #64748b;
          border-color: #e2e8f0;
        }
        .tab-pill-btn.inactive:hover {
          background: #f8fafc;
          color: #0f172a;
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
          gap: 20px;
        }
        @media (max-width: 860px) {
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
          marginBottom: '20px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={22} color="#2563eb" />
            <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              Store & Marketplace Settings
            </h1>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Configure hero slider banners, store profile, helpline number, delivery rules, and backend credentials.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
            <span>View Public Store</span>
          </a>

          <button
            onClick={handleSaveGeneralSettings}
            disabled={savingSettings || loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              fontSize: '0.825rem',
              fontWeight: 700,
              border: 'none',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              cursor: savingSettings ? 'not-allowed' : 'pointer',
            }}
          >
            <Save size={15} />
            <span>{savingSettings ? 'Saving to Backend...' : 'Save All Settings'}</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs inside Store & Settings */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          marginBottom: '24px',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <button
          onClick={() => handleTabChange('all')}
          className={`tab-pill-btn ${activeTab === 'all' ? 'active' : 'inactive'}`}
        >
          <Settings size={15} />
          <span>All Settings View</span>
        </button>

        <button
          onClick={() => handleTabChange('banners')}
          className={`tab-pill-btn ${activeTab === 'banners' ? 'active' : 'inactive'}`}
        >
          <Image size={15} />
          <span>Hero Banners & Slides ({banners.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('profile')}
          className={`tab-pill-btn ${activeTab === 'profile' ? 'active' : 'inactive'}`}
        >
          <Store size={15} />
          <span>Store Name & Helpline</span>
        </button>

        <button
          onClick={() => handleTabChange('logistics')}
          className={`tab-pill-btn ${activeTab === 'logistics' ? 'active' : 'inactive'}`}
        >
          <Truck size={15} />
          <span>Logistics & Payments</span>
        </button>

        <button
          onClick={() => handleTabChange('marketing')}
          className={`tab-pill-btn ${activeTab === 'marketing' ? 'active' : 'inactive'}`}
        >
          <Bell size={15} />
          <span>Announcement Bar</span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <RefreshCw size={26} className="spin" style={{ margin: '0 auto 12px', display: 'block', color: '#2563eb' }} />
          Loading settings & banners from MongoDB backend...
        </div>
      ) : (
        <div>
          {/* ======================================================== */}
          {/* SECTION 1: HERO BANNERS & SLIDES (INTEGRATED IN SETTINGS) */}
          {/* ======================================================== */}
          {(activeTab === 'all' || activeTab === 'banners') && (
            <div className="settings-card" id="section-banners" style={{ borderColor: '#bfdbfe' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  paddingBottom: '16px',
                  marginBottom: '18px',
                  borderBottom: '1.5px solid #f1f5f9',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: '#eff6ff',
                        color: '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Image size={18} />
                    </div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                      Home Hero Carousel Banners & Slides
                    </h2>
                  </div>
                  <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '4px 0 0' }}>
                    Create, edit, reorder, and remove sliding banners displayed on the homepage.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={openCreateBannerModal}
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
                    <Plus size={16} />
                    <span>Add New Banner</span>
                  </button>
                </div>
              </div>

              {/* Banners Mini Filter Bar */}
              <div
                style={{
                  background: '#f8fafc',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  marginBottom: '18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '200px' }}>
                  <Search size={15} color="#94a3b8" />
                  <input
                    type="text"
                    value={bannerSearch}
                    onChange={(e) => setBannerSearch(e.target.value)}
                    placeholder="Search banners by title, tag or badge..."
                    style={{
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      fontSize: '0.825rem',
                      width: '100%',
                      color: '#0f172a',
                    }}
                  />
                  {bannerSearch && (
                    <button
                      onClick={() => setBannerSearch('')}
                      style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Filter:</span>
                  {['all', 'active', 'inactive'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setBannerFilter(st)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: bannerFilter === st ? '1px solid #2563eb' : '1px solid #e2e8f0',
                        background: bannerFilter === st ? '#eff6ff' : '#ffffff',
                        color: bannerFilter === st ? '#1d4ed8' : '#64748b',
                        fontSize: '0.72rem',
                        fontWeight: bannerFilter === st ? 700 : 500,
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Banners Grid in Settings */}
              {loadingBanners ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                  <RefreshCw size={20} className="spin" style={{ margin: '0 auto 8px', display: 'block' }} />
                  Loading banners...
                </div>
              ) : filteredBanners.length === 0 ? (
                <div
                  style={{
                    background: '#f8fafc',
                    borderRadius: '12px',
                    border: '1.5px dashed #cbd5e1',
                    padding: '36px 16px',
                    textAlign: 'center',
                  }}
                >
                  <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 12px' }}>
                    No hero banners found. Add your first promotional slide!
                  </p>
                  <button
                    type="button"
                    onClick={openCreateBannerModal}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      background: '#2563eb',
                      color: '#ffffff',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    + Add Slide
                  </button>
                </div>
              ) : (
                <div className="banner-grid-compact">
                  {filteredBanners.map((banner, index) => (
                    <div
                      key={banner._id || index}
                      style={{
                        background: '#ffffff',
                        borderRadius: '14px',
                        border: '1.5px solid #e2e8f0',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      {/* Image Thumbnail with overlay preview */}
                      <div
                        style={{
                          position: 'relative',
                          height: '150px',
                          backgroundImage: `url(${banner.image})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background:
                              'linear-gradient(90deg, rgba(10, 20, 40, 0.92) 0%, rgba(10, 20, 40, 0.6) 60%, rgba(10, 20, 40, 0.25) 100%)',
                            padding: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span
                              style={{
                                background: 'rgba(0,0,0,0.6)',
                                color: '#ffffff',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                              }}
                            >
                              Slide #{banner.order || index + 1}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleToggleBannerStatus(banner)}
                              title={banner.isActive !== false ? 'Click to deactivate' : 'Click to activate'}
                              style={{
                                background:
                                  banner.isActive !== false ? 'rgba(22, 163, 74, 0.95)' : 'rgba(220, 38, 38, 0.9)',
                                color: '#ffffff',
                                border: 'none',
                                padding: '2px 8px',
                                borderRadius: '9999px',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                              }}
                            >
                              {banner.isActive !== false ? <Eye size={11} /> : <EyeOff size={11} />}
                              <span>{banner.isActive !== false ? 'Active' : 'Inactive'}</span>
                            </button>
                          </div>

                          <div>
                            {banner.tag && (
                              <span
                                style={{
                                  background: 'rgba(249, 115, 22, 0.35)',
                                  color: '#fed7aa',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  fontSize: '0.64rem',
                                  fontWeight: 800,
                                  textTransform: 'uppercase',
                                  display: 'inline-block',
                                  marginBottom: '3px',
                                }}
                              >
                                {banner.tag}
                              </span>
                            )}
                            <h4
                              style={{
                                color: '#ffffff',
                                fontSize: '0.92rem',
                                fontWeight: 800,
                                margin: 0,
                                lineHeight: 1.25,
                              }}
                            >
                              {banner.title}
                            </h4>
                          </div>
                        </div>
                      </div>

                      {/* Details & Actions */}
                      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: '#64748b',
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '10px',
                          }}
                        >
                          <span>Button: <strong style={{ color: '#0f172a' }}>{banner.buttonText || 'Shop Now'}</strong></span>
                          <span>Link: <strong style={{ color: '#2563eb' }}>{banner.link || '/products'}</strong></span>
                        </div>

                        <div
                          style={{
                            marginTop: 'auto',
                            paddingTop: '8px',
                            borderTop: '1px solid #f1f5f9',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          {/* Reorder Buttons */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Order:</span>
                            <button
                              type="button"
                              onClick={() => handleReorderBanner(banner, 'up')}
                              style={smallIconBtnStyle}
                              title="Move Slide Up"
                            >
                              <ArrowUp size={12} />
                            </button>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a', padding: '0 2px' }}>
                              {banner.order || 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleReorderBanner(banner, 'down')}
                              style={smallIconBtnStyle}
                              title="Move Slide Down"
                            >
                              <ArrowDown size={12} />
                            </button>
                          </div>

                          {/* Edit / Delete Buttons */}
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => openEditBannerModal(banner)}
                              style={{
                                ...smallIconBtnStyle,
                                background: '#eff6ff',
                                color: '#2563eb',
                                borderColor: '#bfdbfe',
                              }}
                              title="Edit Banner"
                            >
                              <Edit2 size={13} />
                              <span style={{ fontSize: '0.72rem', fontWeight: 700, marginLeft: '3px' }}>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteBanner(banner)}
                              style={{
                                ...smallIconBtnStyle,
                                background: '#fef2f2',
                                color: '#dc2626',
                                borderColor: '#fecaca',
                              }}
                              title="Delete Banner"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 2: STORE PROFILE & CONTACTS (WITH EDIT BUTTON ONLY) */}
          {/* ======================================================== */}
          {(activeTab === 'all' || activeTab === 'profile') && (
            <div className="settings-card" id="section-profile">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  paddingBottom: '16px',
                  marginBottom: '18px',
                  borderBottom: '1.5px solid #f1f5f9',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: '#eff6ff',
                        color: '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Store size={18} />
                    </div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                      Store Identity & Helpline Details
                    </h2>
                  </div>
                  <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '4px 0 0' }}>
                    Store name aur customer care number secure hain — ye sirf "Edit" button click karne par hi modify ho sakte hain.
                  </p>
                </div>

                {/* Edit Button or Cancel/Save Buttons */}
                <div>
                  {!isEditingProfile ? (
                    <button
                      type="button"
                      onClick={handleStartEditProfile}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        borderRadius: '10px',
                        background: '#eff6ff',
                        color: '#2563eb',
                        border: '1.5px solid #bfdbfe',
                        fontSize: '0.825rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Edit2 size={14} />
                      <span>Edit Store Details</span>
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={handleCancelEditProfile}
                        disabled={savingProfile}
                        style={{
                          padding: '7px 14px',
                          borderRadius: '10px',
                          border: '1.5px solid #cbd5e1',
                          background: '#ffffff',
                          color: '#475569',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveProfile}
                        disabled={savingProfile}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '7px 16px',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                          color: '#ffffff',
                          border: 'none',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: savingProfile ? 'not-allowed' : 'pointer',
                          boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
                        }}
                      >
                        {savingProfile ? (
                          <>
                            <RefreshCw size={13} className="spin" />
                            <span>Updating Backend...</span>
                          </>
                        ) : (
                          <>
                            <Check size={14} />
                            <span>Save Changes</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* READ-ONLY DISPLAY STATE (Locked: Nobody can accidentally type or change) */}
              {!isEditingProfile ? (
                <div
                  style={{
                    background: '#f8fafc',
                    borderRadius: '14px',
                    border: '1.5px solid #e2e8f0',
                    padding: '20px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '16px',
                      color: '#64748b',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    <Lock size={13} color="#64748b" />
                    <span>Protected Store Credentials (Click "Edit Store Details" above to modify)</span>
                  </div>

                  <div className="settings-grid-2">
                    {/* Store Name & Tagline */}
                    <div
                      style={{
                        background: '#ffffff',
                        borderRadius: '12px',
                        padding: '16px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                        Store Brand Name & Tagline
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Building size={18} color={settings.primaryColor || '#2563eb'} />
                        <div>
                          <strong style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800 }}>
                            {settings.storeName || 'CASA'}
                          </strong>
                          <span style={{ display: 'block', fontSize: '0.68rem', color: '#64748b', fontWeight: 700 }}>
                            {settings.storeTagline || 'INDIA MARKETPLACE'}
                          </span>
                        </div>
                        <span
                          style={{
                            background: '#ecfdf5',
                            color: '#059669',
                            border: '1px solid #a7f3d0',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            marginLeft: 'auto',
                          }}
                        >
                          VERIFIED BRAND
                        </span>
                      </div>
                    </div>

                    {/* Brand Primary Color */}
                    <div
                      style={{
                        background: '#ffffff',
                        borderRadius: '12px',
                        padding: '16px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                        Brand Theme Color
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '6px',
                            background: settings.primaryColor || '#2563eb',
                            border: '2px solid #ffffff',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                          }}
                        />
                        <strong style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 800 }}>
                          {settings.primaryColor || '#2563eb'}
                        </strong>
                        <span
                          style={{
                            background: settings.primaryColor || '#2563eb',
                            color: '#ffffff',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            marginLeft: 'auto',
                          }}
                        >
                          ACTIVE THEME
                        </span>
                      </div>
                    </div>

                    {/* Store Default Language */}
                    <div
                      style={{
                        background: '#ffffff',
                        borderRadius: '12px',
                        padding: '16px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                        Store Language
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.2rem' }}>
                          {settings.defaultLanguage === 'hi' ? '🇮🇳' : settings.defaultLanguage === 'hinglish' ? '🇮🇳' : '🇬🇧'}
                        </span>
                        <strong style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 800 }}>
                          {settings.defaultLanguage === 'hi' ? 'हिन्दी (Hindi)' : settings.defaultLanguage === 'hinglish' ? 'Hinglish (Hindi+English)' : 'English (en)'}
                        </strong>
                        <span
                          style={{
                            background: '#eff6ff',
                            color: '#2563eb',
                            border: '1px solid #bfdbfe',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            marginLeft: 'auto',
                          }}
                        >
                          DEFAULT
                        </span>
                      </div>
                    </div>

                    {/* Customer Support Helpline Phone */}
                    <div
                      style={{
                        background: '#ffffff',
                        borderRadius: '12px',
                        padding: '16px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                        Customer Helpline Number
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Phone size={18} color="#16a34a" />
                        <strong style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800 }}>
                          {settings.supportPhone}
                        </strong>
                        <span
                          style={{
                            background: '#eff6ff',
                            color: '#2563eb',
                            border: '1px solid #bfdbfe',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            marginLeft: 'auto',
                          }}
                        >
                          ACTIVE
                        </span>
                      </div>
                    </div>

                    {/* Support Email */}
                    <div
                      style={{
                        background: '#ffffff',
                        borderRadius: '12px',
                        padding: '16px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                        Support Email Address
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Mail size={18} color="#7c3aed" />
                        <strong style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 700 }}>
                          {settings.supportEmail}
                        </strong>
                      </div>
                    </div>

                    {/* GST / Tax Rate */}
                    <div
                      style={{
                        background: '#ffffff',
                        borderRadius: '12px',
                        padding: '16px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                        Standard GST / Tax Rate
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Percent size={18} color="#ea580c" />
                        <strong style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 700 }}>
                          {settings.gstRate}% Integrated GST
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* EDIT FORM STATE (Active when admin clicked "Edit Store Details") */
                <form
                  onSubmit={handleSaveProfile}
                  style={{
                    background: '#eff6ff',
                    borderRadius: '14px',
                    border: '1.5px solid #93c5fd',
                    padding: '20px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '16px',
                      color: '#1d4ed8',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                    }}
                  >
                    <Unlock size={14} color="#2563eb" />
                    <span>Edit Brand, Color & Language Mode Active — Update and click "Save Changes"</span>
                  </div>

                  <div className="settings-grid-2">
                    {/* Store Name */}
                    <div style={fieldGroup}>
                      <label style={fieldLabel}>
                        Store Brand Name <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={profileForm.storeName}
                        onChange={(e) => setProfileForm({ ...profileForm, storeName: e.target.value })}
                        style={inputStyle}
                        placeholder="e.g. CASA"
                      />
                    </div>

                    {/* Store Tagline */}
                    <div style={fieldGroup}>
                      <label style={fieldLabel}>Store Tagline</label>
                      <input
                        type="text"
                        value={profileForm.storeTagline}
                        onChange={(e) => setProfileForm({ ...profileForm, storeTagline: e.target.value })}
                        style={inputStyle}
                        placeholder="e.g. INDIA MARKETPLACE"
                      />
                    </div>

                    {/* Brand Primary Color */}
                    <div style={fieldGroup}>
                      <label style={fieldLabel}>Brand Theme Primary Color</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                          type="color"
                          value={profileForm.primaryColor}
                          onChange={(e) => setProfileForm({ ...profileForm, primaryColor: e.target.value })}
                          style={{
                            width: '42px',
                            height: '38px',
                            padding: 0,
                            borderRadius: '8px',
                            border: '1.5px solid #cbd5e1',
                            cursor: 'pointer',
                          }}
                        />
                        <input
                          type="text"
                          value={profileForm.primaryColor}
                          onChange={(e) => setProfileForm({ ...profileForm, primaryColor: e.target.value })}
                          style={{ ...inputStyle, width: '120px' }}
                          placeholder="#2563eb"
                        />
                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                          {[
                            { name: 'CASA Blue', hex: '#2563eb' },
                            { name: 'Sapphire', hex: '#1d4ed8' },
                            { name: 'Emerald', hex: '#059669' },
                            { name: 'Royal Ruby', hex: '#be185d' },
                            { name: 'Indigo', hex: '#4f46e5' },
                            { name: 'Amber', hex: '#d97706' },
                            { name: 'Midnight', hex: '#0f172a' },
                            { name: 'Coral', hex: '#ea580c' },
                          ].map((swatch, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setProfileForm({ ...profileForm, primaryColor: swatch.hex })}
                              title={swatch.name}
                              className="color-swatch-btn"
                              style={{
                                background: swatch.hex,
                                outline: profileForm.primaryColor === swatch.hex ? '2px solid #0f172a' : 'none',
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Store Default Language */}
                    <div style={fieldGroup}>
                      <label style={fieldLabel}>Default Store Language</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {[
                          { id: 'en', label: '🇬🇧 English (Default)' },
                          { id: 'hi', label: '🇮🇳 हिन्दी (Hindi)' },
                          { id: 'hinglish', label: '🇮🇳 Hinglish' },
                        ].map((langOpt) => (
                          <button
                            key={langOpt.id}
                            type="button"
                            onClick={() => setProfileForm({ ...profileForm, defaultLanguage: langOpt.id })}
                            style={{
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: profileForm.defaultLanguage === langOpt.id ? '2px solid #2563eb' : '1px solid #cbd5e1',
                              background: profileForm.defaultLanguage === langOpt.id ? '#ffffff' : '#f8fafc',
                              color: profileForm.defaultLanguage === langOpt.id ? '#2563eb' : '#475569',
                              fontSize: '0.78rem',
                              fontWeight: profileForm.defaultLanguage === langOpt.id ? 700 : 500,
                              cursor: 'pointer',
                              flex: 1,
                            }}
                          >
                            {langOpt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Customer Helpline Phone */}
                    <div style={fieldGroup}>
                      <label style={fieldLabel}>
                        Customer Helpline Phone Number <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={profileForm.supportPhone}
                        onChange={(e) => setProfileForm({ ...profileForm, supportPhone: e.target.value })}
                        style={inputStyle}
                        placeholder="e.g. +91 9876543210"
                      />
                    </div>

                    {/* Support Email */}
                    <div style={fieldGroup}>
                      <label style={fieldLabel}>
                        Support Email Address <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={profileForm.supportEmail}
                        onChange={(e) => setProfileForm({ ...profileForm, supportEmail: e.target.value })}
                        style={inputStyle}
                        placeholder="support@casa.in"
                      />
                    </div>

                    {/* GST Rate */}
                    <div style={fieldGroup}>
                      <label style={fieldLabel}>Default GST / Tax Rate (%)</label>
                      <input
                        type="number"
                        min={0}
                        max={28}
                        value={profileForm.gstRate}
                        onChange={(e) => setProfileForm({ ...profileForm, gstRate: Number(e.target.value) })}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 3: LOGISTICS & SHIPPING RULES */}
          {/* ======================================================== */}
          {(activeTab === 'all' || activeTab === 'logistics') && (
            <div className="settings-card" id="section-logistics">
              <div style={sectionHeaderRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Truck size={18} color="#059669" />
                  <h3 style={sectionTitle}>Logistics, Delivery & Payment Gateways</h3>
                </div>
              </div>

              <div className="settings-grid-2" style={{ marginBottom: '18px' }}>
                <div style={fieldGroup}>
                  <label style={fieldLabel}>Free Shipping Threshold (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={settings.freeShippingThreshold}
                    onChange={(e) =>
                      setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })
                    }
                    style={inputStyle}
                  />
                  <span style={hintText}>
                    Cart totals at or above this amount automatically qualify for Free Doorstep Delivery.
                  </span>
                </div>

                <div style={fieldGroup}>
                  <label style={fieldLabel}>Standard Delivery Fee (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={settings.standardDeliveryFee}
                    onChange={(e) =>
                      setSettings({ ...settings, standardDeliveryFee: Number(e.target.value) })
                    }
                    style={inputStyle}
                  />
                  <span style={hintText}>Charged to orders below the free shipping threshold.</span>
                </div>
              </div>

              {/* Payment switches */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={switchRow}>
                  <div>
                    <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block' }}>
                      Cash on Delivery (COD) Checkout
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Allow customers across India to pay cash when parcels arrive.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, codEnabled: !settings.codEnabled })}
                    style={switchBtn(settings.codEnabled)}
                  >
                    {settings.codEnabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                  </button>
                </div>

                <div style={switchRow}>
                  <div>
                    <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block' }}>
                      Razorpay Gateway & Instant UPI
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Google Pay, PhonePe, Paytm, Debit/Credit cards & NetBanking.
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: '#ecfdf5',
                      color: '#059669',
                      border: '1px solid #a7f3d0',
                    }}
                  >
                    ACTIVE (ONLINE)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 4: ANNOUNCEMENTS & SYSTEM STATUS */}
          {/* ======================================================== */}
          {(activeTab === 'all' || activeTab === 'marketing') && (
            <div className="settings-card" id="section-marketing">
              <div style={sectionHeaderRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bell size={18} color="#e11d48" />
                  <h3 style={sectionTitle}>Storefront Announcement Strip & Server Status</h3>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                <div style={switchRow}>
                  <div>
                    <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block' }}>
                      Show Top Announcement Strip
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Display promotional banner text across all public storefront pages.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings({ ...settings, festivalSaleActive: !settings.festivalSaleActive })
                    }
                    style={switchBtn(settings.festivalSaleActive)}
                  >
                    {settings.festivalSaleActive ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                  </button>
                </div>

                {settings.festivalSaleActive && (
                  <div style={fieldGroup}>
                    <label style={fieldLabel}>Announcement Banner Headline Text</label>
                    <input
                      type="text"
                      value={settings.festivalSaleBannerText}
                      onChange={(e) =>
                        setSettings({ ...settings, festivalSaleBannerText: e.target.value })
                      }
                      style={inputStyle}
                    />
                  </div>
                )}
              </div>

              {/* Database & Diagnostics Box */}
              <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '10px' }}>
                  BACKEND & DATABASE DIAGNOSTICS
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div style={diagBox}>
                    <span style={diagLabel}>Database Driver</span>
                    <strong style={{ fontSize: '0.85rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={13} /> MongoDB Live Connected
                    </strong>
                  </div>
                  <div style={diagBox}>
                    <span style={diagLabel}>Server API</span>
                    <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>Port 5000 (Express & Node)</strong>
                  </div>
                  <div style={diagBox}>
                    <span style={diagLabel}>Security Protection</span>
                    <strong style={{ fontSize: '0.85rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Shield size={13} /> JWT & Helmet Protected
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* BANNER CREATE / EDIT MODAL */}
      {/* ======================================================== */}
      {isBannerModalOpen && (
        <div style={modalBackdropStyle}>
          <div style={modalContainerStyle}>
            {/* Modal Header */}
            <div style={modalHeaderStyle}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                  {editingBanner ? `Edit Banner: "${editingBanner.title}"` : 'Create New Hero Banner'}
                </h2>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0' }}>
                  Upload image from computer, craft your promo copy, set button link and save to MongoDB backend.
                </p>
              </div>
              <button onClick={() => setIsBannerModalOpen(false)} style={modalCloseBtnStyle}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveBanner} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, maxHeight: 'calc(85vh - 130px)' }}>
                {/* Live Real-Time Slide Preview */}
                <div style={{ marginBottom: '22px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}
                  >
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Live Real-Time Slide Preview
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 600 }}>
                      Storefront rendering preview
                    </span>
                  </div>

                  <div
                    style={{
                      borderRadius: '14px',
                      overflow: 'hidden',
                      position: 'relative',
                      minHeight: '170px',
                      backgroundImage: bannerFormData.image
                        ? `url(${bannerFormData.image})`
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
                        padding: '22px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {bannerFormData.tag && (
                          <span
                            style={{
                              background: 'rgba(249, 115, 22, 0.3)',
                              color: '#fed7aa',
                              border: '1px solid rgba(249, 115, 22, 0.6)',
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Flame size={11} color="#f97316" /> {bannerFormData.tag}
                          </span>
                        )}
                        {bannerFormData.badge && (
                          <span
                            style={{
                              background: 'rgba(245, 158, 11, 0.25)',
                              color: '#fef08a',
                              border: '1px solid rgba(245, 158, 11, 0.5)',
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Sparkles size={11} color="#fbbf24" /> {bannerFormData.badge}
                          </span>
                        )}
                      </div>

                      <h3
                        style={{
                          color: '#ffffff',
                          fontSize: '1.25rem',
                          fontWeight: 900,
                          margin: 0,
                          lineHeight: 1.2,
                        }}
                      >
                        {bannerFormData.title || 'Enter Banner Title Below...'}
                      </h3>

                      {bannerFormData.subtitle && (
                        <p
                          style={{
                            color: '#e2e8f0',
                            fontSize: '0.8rem',
                            margin: 0,
                            maxWidth: '460px',
                            lineHeight: 1.4,
                          }}
                        >
                          {bannerFormData.subtitle}
                        </p>
                      )}

                      <div style={{ marginTop: '4px' }}>
                        <span
                          style={{
                            background: bannerFormData.accentColor || '#1d4ed8',
                            color: '#ffffff',
                            padding: '5px 12px',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                          }}
                        >
                          {bannerFormData.buttonText || 'Shop Now'} <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Image Input Section (Upload File, URL, Presets) */}
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
                      fontSize: '0.825rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      marginBottom: '10px',
                    }}
                  >
                    Banner Background Image <span style={{ color: '#ef4444' }}>*</span>
                  </label>

                  {/* Mode switcher tabs */}
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
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: '#eff6ff',
                            color: '#2563eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 8px',
                          }}
                        >
                          <Upload size={18} />
                        </div>
                        <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', margin: '0 0 3px' }}>
                          Click to browse and upload image file from your computer
                        </p>
                        <p style={{ fontSize: '0.72rem', color: '#64748b', margin: 0 }}>
                          Supports PNG, JPG, WebP (Recommended: 1600 x 600px, max 8MB)
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
                            <CheckCircle2 size={15} color="#16a34a" />
                            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#15803d' }}>
                              {uploadFileName} ({uploadFileSize})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setUploadFileName('');
                              setUploadFileSize('');
                              setBannerFormData((p) => ({ ...p, image: '' }));
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
                        value={bannerFormData.image}
                        onChange={(e) => setBannerFormData({ ...bannerFormData, image: e.target.value })}
                        placeholder="https://images.unsplash.com/... or direct image link"
                        style={inputStyle}
                      />
                    </div>
                  )}

                  {/* Mode 3: Presets */}
                  {imageInputMode === 'presets' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '10px' }}>
                      {PRESET_BANNERS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => applyPreset(preset)}
                          style={{
                            textAlign: 'left',
                            borderRadius: '10px',
                            border: '1.5px solid #e2e8f0',
                            padding: '8px',
                            background: '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '3px',
                          }}
                        >
                          <div
                            style={{
                              height: '46px',
                              borderRadius: '6px',
                              backgroundImage: `url(${preset.image})`,
                              backgroundSize: 'cover',
                            }}
                          />
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                            {preset.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Form Inputs Grid */}
                <div className="modal-body-grid">
                  {/* Left Column */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={fieldLabel}>
                        Banner Title <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={bannerFormData.title}
                        onChange={(e) => setBannerFormData({ ...bannerFormData, title: e.target.value })}
                        placeholder="e.g. CASA Grand Festival Sale"
                        required
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={fieldLabel}>Subtitle Description</label>
                      <textarea
                        value={bannerFormData.subtitle}
                        onChange={(e) => setBannerFormData({ ...bannerFormData, subtitle: e.target.value })}
                        placeholder="e.g. Up to 70% Off on Top Brands | Handpicked Indian & Global Labels"
                        rows={3}
                        style={{ ...inputStyle, resize: 'vertical' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={fieldLabel}>Header Tag</label>
                        <input
                          type="text"
                          value={bannerFormData.tag}
                          onChange={(e) => setBannerFormData({ ...bannerFormData, tag: e.target.value })}
                          placeholder="e.g. FESTIVAL SALE"
                          style={inputStyle}
                        />
                      </div>

                      <div>
                        <label style={fieldLabel}>Promo Badge</label>
                        <input
                          type="text"
                          value={bannerFormData.badge}
                          onChange={(e) => setBannerFormData({ ...bannerFormData, badge: e.target.value })}
                          placeholder="e.g. Limited Offer"
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={fieldLabel}>Button Label</label>
                        <input
                          type="text"
                          value={bannerFormData.buttonText}
                          onChange={(e) => setBannerFormData({ ...bannerFormData, buttonText: e.target.value })}
                          placeholder="e.g. Shop Now"
                          style={inputStyle}
                        />
                      </div>

                      <div>
                        <label style={fieldLabel}>Display Sequence Order</label>
                        <input
                          type="number"
                          min="1"
                          max="99"
                          value={bannerFormData.order}
                          onChange={(e) => setBannerFormData({ ...bannerFormData, order: Number(e.target.value) })}
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={fieldLabel}>Button Target URL / Route</label>
                      <input
                        type="text"
                        value={bannerFormData.link}
                        onChange={(e) => setBannerFormData({ ...bannerFormData, link: e.target.value })}
                        placeholder="/products or /category/electronics"
                        style={inputStyle}
                      />
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '5px' }}>
                        {POPULAR_LINKS.map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setBannerFormData({ ...bannerFormData, link: item.path })}
                            style={{
                              background: bannerFormData.link === item.path ? '#eff6ff' : '#f1f5f9',
                              color: bannerFormData.link === item.path ? '#2563eb' : '#475569',
                              border: 'none',
                              padding: '2px 7px',
                              borderRadius: '5px',
                              fontSize: '0.68rem',
                              cursor: 'pointer',
                              fontWeight: 600,
                            }}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Accent Color */}
                    <div>
                      <label style={fieldLabel}>Accent Theme Color</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="color"
                          value={bannerFormData.accentColor}
                          onChange={(e) => setBannerFormData({ ...bannerFormData, accentColor: e.target.value })}
                          style={{
                            width: '38px',
                            height: '34px',
                            padding: 0,
                            borderRadius: '8px',
                            border: '1.5px solid #cbd5e1',
                            cursor: 'pointer',
                          }}
                        />
                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                          {COLOR_SWATCHES.map((swatch, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setBannerFormData({ ...bannerFormData, accentColor: swatch.hex })}
                              title={swatch.name}
                              className="color-swatch-btn"
                              style={{
                                background: swatch.hex,
                                outline: bannerFormData.accentColor === swatch.hex ? '2px solid #0f172a' : 'none',
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Active toggle */}
                    <div
                      style={{
                        background: '#f8fafc',
                        borderRadius: '10px',
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 'auto',
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0f172a', display: 'block' }}>
                          Active Status
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                          When enabled, this banner is displayed in the homepage slider.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={bannerFormData.isActive}
                        onChange={(e) => setBannerFormData({ ...bannerFormData, isActive: e.target.checked })}
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
                  onClick={() => setIsBannerModalOpen(false)}
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
                  disabled={savingBanner}
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
                    cursor: savingBanner ? 'not-allowed' : 'pointer',
                    opacity: savingBanner ? 0.7 : 1,
                  }}
                >
                  {savingBanner ? (
                    <>
                      <RefreshCw size={14} className="spin" />
                      <span>Saving to Backend...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>{editingBanner ? 'Update Banner' : 'Publish Banner'}</span>
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
const sectionHeaderRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingBottom: '14px',
  marginBottom: '16px',
  borderBottom: '1.5px solid #f1f5f9',
};

const sectionTitle = {
  fontSize: '1.05rem',
  fontWeight: 800,
  color: '#0f172a',
  margin: 0,
};

const fieldGroup = {
  display: 'flex',
  flexDirection: 'column',
  gap: '5px',
};

const fieldLabel = {
  fontSize: '0.8rem',
  fontWeight: 700,
  color: '#334155',
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
  background: '#ffffff',
};

const hintText = {
  fontSize: '0.72rem',
  color: '#64748b',
};

const switchRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 14px',
  background: '#f8fafc',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
};

const switchBtn = (active) => ({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: active ? '#059669' : '#94a3b8',
  display: 'flex',
  alignItems: 'center',
  padding: 0,
});

const diagBox = {
  background: '#ffffff',
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
};

const diagLabel = {
  fontSize: '0.7rem',
  color: '#64748b',
  display: 'block',
  marginBottom: '2px',
};

const smallIconBtnStyle = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  padding: '4px 6px',
  color: '#475569',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
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
};

const modalHeaderStyle = {
  padding: '16px 24px',
  borderBottom: '1.5px solid #f1f5f9',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const modalCloseBtnStyle = {
  background: '#f1f5f9',
  border: 'none',
  borderRadius: '50%',
  width: '32px',
  height: '32px',
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

export default AdminSettingsPage;
