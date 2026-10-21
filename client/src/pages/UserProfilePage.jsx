import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Plus,
  Trash2,
  Shield,
  ShieldCheck,
  Truck,
  Bike,
  Store,
  PackageCheck,
  Zap,
  Save,
  Camera,
  Check,
  CheckCircle2,
  Sparkles,
  Building,
  Home,
  Clock,
  Heart,
  ShoppingBag,
  ExternalLink,
  X,
  BadgeCheck,
  Lock,
  LogOut,
  ChevronRight,
  Settings,
  Edit3,
  Upload,
  Globe,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useStore } from '../context/StoreContext';
import { authService } from '../services/authService';
import { LANGUAGE_OPTIONS } from '../components/common/LanguageModal';
import ProfessionalVendorProfile from '../components/profile/ProfessionalVendorProfile';
import VendorStoreSettings from '../components/profile/VendorStoreSettings';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
];

const UserProfilePage = () => {
  const { user, updateProfile, isAdmin, logout } = useAuth();
  const { success, error } = useToast();
  const { language, setLanguage, openLanguageModal, primaryColor } = useStore();

  const isDelivery = user?.role === 'delivery';
  const isVendor = user?.role === 'vendor';

  // Active section tab: 'profile' | 'addresses' | 'delivery-hub' | 'vendor-hub' | 'security' | 'settings'
  const [activeSection, setActiveSection] = useState('profile');

  // Edit Mode toggle for personal info (prevents accidental direct editing)
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const fileInputRef = useRef(null);

  // Profile States
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [vehicleType, setVehicleType] = useState(user?.vehicleType || 'Two-Wheeler Bike');
  const [vendorStoreName, setVendorStoreName] = useState(user?.vendorStoreName || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Address States
  const [addresses, setAddresses] = useState([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [newAddr, setNewAddr] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    locality: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    addressType: 'home',
    isDefault: false,
  });

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAvatar(user.avatar || '');
      setVehicleType(user.vehicleType || 'Two-Wheeler Bike');
      setVendorStoreName(user.vendorStoreName || '');

      setLoadingAddresses(true);
      authService
        .getAddresses()
        .then((data) => setAddresses(data || []))
        .catch(() => setAddresses([]))
        .finally(() => setLoadingAddresses(false));
    }
  }, [user]);

  const handleCancelEdit = () => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
    setAvatar(user?.avatar || '');
    setVehicleType(user?.vehicleType || 'Two-Wheeler Bike');
    setVendorStoreName(user?.vendorStoreName || '');
    setIsEditingProfile(false);
  };

  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      error('Please select a valid image file (PNG, JPG, WebP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      error('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 320;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setAvatar(compressedDataUrl);
        setIsEditingProfile(true);
        success('Profile photo selected! Click "Save Profile Changes" to save.');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    const res = await updateProfile({
      name,
      phone,
      avatar,
      vehicleType,
      vendorStoreName,
      preferredLanguage: language
    });
    setSavingProfile(false);
    if (res?.success) {
      success('Profile details saved successfully!');
      setIsEditingProfile(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddr.fullName || !newAddr.phone || !newAddr.street || !newAddr.pincode) {
      error('Please fill in all required address fields.');
      return;
    }

    try {
      const created = await authService.addAddress(newAddr);
      setAddresses([created, ...addresses]);
      setIsAddingAddress(false);
      setNewAddr({
        fullName: user?.name || '',
        phone: user?.phone || '',
        street: '',
        locality: '',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038',
        addressType: 'home',
        isDefault: false,
      });
      success('Delivery address added successfully.');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to add address.');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await authService.deleteAddress(id);
      setAddresses(addresses.filter((a) => a._id !== id));
      success('Address removed from account.');
    } catch (err) {
      error('Failed to remove address.');
    }
  };

  return (
    <div className="profile-page-wrapper">
      <style>{`
        .profile-page-wrapper {
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
          padding: 24px 16px 80px;
          box-sizing: border-box;
          overflow-x: hidden;
        }
        .profile-header-card {
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          padding: 22px 24px;
          box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
          box-sizing: border-box;
          width: 100%;
        }
        .profile-content-card {
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03);
          box-sizing: border-box;
          width: 100%;
          overflow: hidden;
        }
        .profile-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          width: 100%;
          box-sizing: border-box;
        }
        .profile-grid-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 14px;
          width: 100%;
          box-sizing: border-box;
        }
        .profile-input-box {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 12px;
          border: 1.5px solid #cbd5e1;
          background: #ffffff;
          transition: all 0.15s ease;
          width: 100%;
          box-sizing: border-box;
        }
        .profile-input-box:focus-within {
          border-color: #2563eb !important;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12) !important;
        }
        .profile-input-locked {
          background: #f8fafc !important;
          border-color: #e2e8f0 !important;
          cursor: not-allowed;
        }
        .profile-input-locked:focus-within {
          border-color: #e2e8f0 !important;
          box-shadow: none !important;
        }
        .profile-native-input {
          border: none;
          outline: none;
          width: 100%;
          font-size: 0.9rem;
          color: #0f172a;
          background: transparent;
          min-width: 0;
        }
        .profile-native-input:disabled {
          color: #475569 !important;
          cursor: not-allowed !important;
          -webkit-text-fill-color: #475569;
        }
        .address-card-item {
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 16px;
          padding: 18px;
          box-sizing: border-box;
          width: 100%;
          transition: all 0.2s ease;
        }
        .address-card-item:hover {
          border-color: #93c5fd !important;
          box-shadow: 0 8px 20px -6px rgba(37, 99, 235, 0.12) !important;
        }
        .addresses-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          width: 100%;
          box-sizing: border-box;
        }
        .profile-tab-button {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justifyContent: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
          border: none;
          white-space: nowrap;
        }

        .tab-desktop-text {
          display: inline;
        }
        .tab-mobile-text {
          display: none;
        }
        /* Mobile Adjustments (under 640px) */
        @media (max-width: 640px) {
          .tab-desktop-text {
            display: none !important;
          }
          .tab-mobile-text {
            display: inline !important;
          }
          .profile-page-wrapper {
            padding: 12px 10px 60px !important;
          }
          .profile-header-card {
            padding: 14px 12px !important;
          }
          .profile-content-card {
            padding: 16px 12px !important;
          }
          .profile-grid-2 {
            grid-template-columns: 1fr !important;
            gap: 12px;
          }
          .profile-grid-3 {
            grid-template-columns: 1fr !important;
            gap: 12px;
          }
          .addresses-grid {
            grid-template-columns: 1fr !important;
            gap: 12px;
          }
          .profile-title {
            font-size: 1.35rem !important;
          }
          .profile-tab-button {
            padding: 8px 4px !important;
            font-size: 0.75rem !important;
            gap: 4px !important;
          }
          .vip-avatar-img {
            width: 56px !important;
            height: 56px !important;
          }
        }
      `}</style>

      {/* Hidden File Input for Device Photo Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageFileUpload}
        accept="image/png,image/jpeg,image/jpg,image/webp"
        style={{ display: 'none' }}
      />

      {/* Breadcrumb Navigation */}
      <div style={breadcrumbRow}>
        <Link to="/" style={breadcrumbLink}>Home</Link>
        <span style={{ color: '#cbd5e1' }}>/</span>
        <span style={{ color: '#0f172a', fontWeight: 600 }}>My Account</span>
      </div>

      {/* Main Title Section */}
      <div style={{ marginBottom: '20px' }}>
        <h1 className="profile-title" style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.025em', margin: 0 }}>
          {isDelivery
            ? 'Delivery Partner Profile & Fleet Details'
            : isVendor
            ? 'Merchant Store Profile & Operations'
            : 'Account Settings & Addresses'}
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px', margin: '4px 0 0 0' }}>
          {isDelivery
            ? 'Manage your courier rider credentials, assigned vehicle, and express delivery performance.'
            : isVendor
            ? 'Manage your merchant credentials, seller branding, and marketplace fulfillment.'
            : 'Manage your personal credentials, contact details, and saved delivery destinations.'}
        </p>
      </div>

      {/* If logged-in user is a Vendor, render the dedicated B2B Professional Merchant Profile */}
      {isVendor ? (
        <ProfessionalVendorProfile
          user={user}
          onProfileUpdated={(updatedUser) => {
            if (updatedUser) {
              if (updatedUser.name) setName(updatedUser.name);
              if (updatedUser.phone) setPhone(updatedUser.phone);
              if (updatedUser.vendorStoreName) setVendorStoreName(updatedUser.vendorStoreName);
              if (updatedUser.avatar) setAvatar(updatedUser.avatar);
            }
          }}
        />
      ) : (
        <>
          {/* Overview Header Banner */}
          <div className="profile-header-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Avatar with Ring Badge & Click to Upload */}
          <div
            style={{ position: 'relative', flexShrink: 0, cursor: 'pointer' }}
            onClick={() => {
              setActiveSection('profile');
              fileInputRef.current?.click();
            }}
            title="Click to upload profile photo from your device"
          >
            <img
              src={avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'}
              alt={name}
              className="vip-avatar-img"
              style={vipAvatarImg}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80';
              }}
            />
            <span style={avatarCameraPill} title="Change Profile Picture">
              <Camera size={11} color="#ffffff" />
            </span>
          </div>

          {/* User Details & Status Badges */}
          <div style={{ flex: '1 1 200px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: 0, wordBreak: 'break-word' }}>
                {name || (isDelivery ? 'Express Rider' : isVendor ? 'Verified Merchant' : 'CASA Customer')}
              </h2>
              {isAdmin ? (
                <span style={adminBadge}>
                  <Shield size={11} /> ADMIN
                </span>
              ) : isDelivery ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={deliveryBadge}>
                    <Truck size={12} color="#059669" /> EXPRESS RIDER
                  </span>
                  <span style={dutyBadge}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} /> ON DUTY
                  </span>
                  <span style={vehicleBadge}>
                    <Bike size={11} color="#0284c7" /> {vehicleType || 'Two-Wheeler Bike'}
                  </span>
                </div>
              ) : isVendor ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={vendorBadge}>
                    <Store size={12} color="#c2410c" /> VERIFIED SELLER
                  </span>
                  <span style={dutyBadge}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} /> STORE ACTIVE
                  </span>
                </div>
              ) : (
                <span style={shopperBadge}>
                  <Sparkles size={11} color="#4338ca" /> VIP SHOPPER
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
              <span style={{ fontSize: '0.825rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px', wordBreak: 'break-all' }}>
                <Mail size={13} color="#64748b" style={{ flexShrink: 0 }} /> {user?.email}
              </span>
              {phone && (
                <span style={{ fontSize: '0.825rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={13} color="#64748b" style={{ flexShrink: 0 }} /> +91 {phone}
                </span>
              )}
              {isVendor && vendorStoreName && (
                <span style={{ fontSize: '0.8rem', color: '#ea580c', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Store size={12} /> {vendorStoreName}
                </span>
              )}
            </div>
          </div>

          {/* Role-Specific Action Shortcuts */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', width: 'auto' }}>
            <button
              type="button"
              onClick={() => {
                setActiveSection('profile');
                setIsEditingProfile((prev) => !prev);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '8px 13px',
                borderRadius: '10px',
                background: isEditingProfile ? '#eff6ff' : '#f8fafc',
                border: isEditingProfile ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                color: isEditingProfile ? '#2563eb' : '#334155',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Edit3 size={14} color="#2563eb" />
              <span>{isEditingProfile ? 'Editing Mode' : 'Edit Profile'}</span>
            </button>

            {isDelivery ? (
              <Link
                to="/delivery"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 15px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  textDecoration: 'none',
                  boxShadow: '0 3px 10px rgba(5, 150, 105, 0.28)',
                }}
              >
                <Truck size={14} color="#ffffff" />
                <span>Delivery Runs Dashboard</span>
              </Link>
            ) : isVendor ? (
              <Link
                to="/vendor"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 15px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  textDecoration: 'none',
                  boxShadow: '0 3px 10px rgba(234, 88, 12, 0.28)',
                }}
              >
                <Store size={14} color="#ffffff" />
                <span>Vendor Hub</span>
              </Link>
            ) : (
              <>
                <Link to="/orders" style={shortcutBtn}>
                  <ShoppingBag size={14} color="#2563eb" />
                  <span>Orders</span>
                </Link>
                <Link to="/wishlist" style={shortcutBtn}>
                  <Heart size={14} color="#e11d48" />
                  <span>Wishlist</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Segmented Tabs Navigation */}
      <div style={tabBarContainer}>
        <button
          type="button"
          onClick={() => setActiveSection('profile')}
          className="profile-tab-button"
          style={{
            background: activeSection === 'profile' ? '#ffffff' : 'transparent',
            color: activeSection === 'profile' ? '#0f172a' : '#64748b',
            boxShadow: activeSection === 'profile' ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
          }}
        >
          <User size={15} color={activeSection === 'profile' ? '#2563eb' : '#64748b'} />
          <span className="tab-desktop-text">{isDelivery ? 'Rider & Vehicle Info' : isVendor ? 'Merchant & Store Info' : 'Personal Info'}</span>
          <span className="tab-mobile-text">{isDelivery ? 'Rider' : isVendor ? 'Store' : 'Profile'}</span>
        </button>

        {isDelivery ? (
          <button
            type="button"
            onClick={() => setActiveSection('delivery-hub')}
            className="profile-tab-button"
            style={{
              background: activeSection === 'delivery-hub' ? '#ffffff' : 'transparent',
              color: activeSection === 'delivery-hub' ? '#0f172a' : '#64748b',
              boxShadow: activeSection === 'delivery-hub' ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
            }}
          >
            <Truck size={15} color={activeSection === 'delivery-hub' ? '#059669' : '#64748b'} />
            <span className="tab-desktop-text">Rider Hub & Deliveries</span>
            <span className="tab-mobile-text">Rider Hub</span>
          </button>
        ) : isVendor ? (
          <button
            type="button"
            onClick={() => setActiveSection('vendor-hub')}
            className="profile-tab-button"
            style={{
              background: activeSection === 'vendor-hub' ? '#ffffff' : 'transparent',
              color: activeSection === 'vendor-hub' ? '#0f172a' : '#64748b',
              boxShadow: activeSection === 'vendor-hub' ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
            }}
          >
            <Store size={15} color={activeSection === 'vendor-hub' ? '#ea580c' : '#64748b'} />
            <span className="tab-desktop-text">Store & Catalog Hub</span>
            <span className="tab-mobile-text">Vendor Hub</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setActiveSection('addresses')}
            className="profile-tab-button"
            style={{
              background: activeSection === 'addresses' ? '#ffffff' : 'transparent',
              color: activeSection === 'addresses' ? '#0f172a' : '#64748b',
              boxShadow: activeSection === 'addresses' ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
            }}
          >
            <MapPin size={15} color={activeSection === 'addresses' ? '#2563eb' : '#64748b'} />
            <span className="tab-desktop-text">Delivery Addresses ({addresses.length})</span>
            <span className="tab-mobile-text">Addresses ({addresses.length})</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveSection('security')}
          className="profile-tab-button"
          style={{
            background: activeSection === 'security' ? '#ffffff' : 'transparent',
            color: activeSection === 'security' ? '#0f172a' : '#64748b',
            boxShadow: activeSection === 'security' ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
          }}
        >
          <Lock size={15} color={activeSection === 'security' ? '#2563eb' : '#64748b'} />
          <span className="tab-desktop-text">Account Security</span>
          <span className="tab-mobile-text">Security</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('settings')}
          className="profile-tab-button"
          style={{
            background: activeSection === 'settings' ? '#ffffff' : 'transparent',
            color: activeSection === 'settings' ? '#0f172a' : '#64748b',
            boxShadow: activeSection === 'settings' ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
          }}
        >
          <Settings size={15} color={activeSection === 'settings' ? '#2563eb' : '#64748b'} />
          <span className="tab-desktop-text">Settings & Language</span>
          <span className="tab-mobile-text">Language</span>
        </button>
      </div>

      {/* TAB 1: PERSONAL INFORMATION */}
      {activeSection === 'profile' && (
        <div className="profile-content-card">
          <div style={cardHeaderRow}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={17} color="#2563eb" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Personal Information
                </h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '3px 0 0 0' }}>
                {isEditingProfile
                  ? 'Editing mode active: Update your display name, contact phone, or profile avatar.'
                  : 'Your account credentials and details. Click Edit Profile to modify.'}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {!isEditingProfile ? (
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '9px',
                    background: '#eff6ff',
                    border: '1.5px solid #bfdbfe',
                    color: '#1d4ed8',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Edit3 size={13} /> Edit Profile
                </button>
              ) : (
                <span
                  style={{
                    ...securityChip,
                    background: '#fef3c7',
                    color: '#b45309',
                    borderColor: '#fde68a',
                  }}
                >
                  <Edit3 size={11} color="#b45309" /> Editing Active
                </span>
              )}
              <span style={securityChip}>
                <Shield size={11} color="#059669" /> 100% Encrypted
              </span>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="profile-grid-2">
              {/* Full Name */}
              <div style={fieldGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={fieldLabel}>
                    Full Name {isEditingProfile && '*'}
                  </label>
                  {!isEditingProfile && (
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Lock size={11} /> Locked (Click Edit)
                    </span>
                  )}
                </div>
                <div className={`profile-input-box ${!isEditingProfile ? 'profile-input-locked' : ''}`}>
                  <User size={16} color={isEditingProfile ? '#2563eb' : '#94a3b8'} style={{ flexShrink: 0 }} />
                  <input
                    type="text"
                    required
                    disabled={!isEditingProfile}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="profile-native-input"
                    placeholder="e.g. Ajay Singh"
                  />
                </div>
              </div>

              {/* Phone Number with India Flag */}
              <div style={fieldGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={fieldLabel}>
                    Mobile Phone Number {isEditingProfile && '*'}
                  </label>
                  {!isEditingProfile && (
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Lock size={11} /> Locked (Click Edit)
                    </span>
                  )}
                </div>
                <div className={`profile-input-box ${!isEditingProfile ? 'profile-input-locked' : ''}`}>
                  <div style={phonePrefix}>
                    <span style={{ fontSize: '0.95rem' }}>🇮🇳</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>+91</span>
                  </div>
                  <input
                    type="tel"
                    disabled={!isEditingProfile}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="profile-native-input"
                    placeholder="9876543210"
                    maxLength={10}
                  />
                </div>
              </div>
            </div>

            {/* Email Address (Protected) */}
            <div style={fieldGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                <label style={fieldLabel}>Email Address</label>
                <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <CheckCircle2 size={12} /> Primary Verified Email
                </span>
              </div>
              <div className="profile-input-box profile-input-locked">
                <Mail size={16} color="#94a3b8" style={{ flexShrink: 0 }} />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="profile-native-input"
                  style={{ color: '#64748b', cursor: 'not-allowed' }}
                />
              </div>
            </div>

            {/* Delivery Partner Specific Fleet & Operational Fields */}
            {isDelivery && (
              <div className="profile-grid-2">
                <div style={fieldGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={fieldLabel}>Rider Vehicle Type {isEditingProfile && '*'}</label>
                    {!isEditingProfile && (
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Lock size={11} /> Locked (Click Edit)
                      </span>
                    )}
                  </div>
                  <div className={`profile-input-box ${!isEditingProfile ? 'profile-input-locked' : ''}`}>
                    <Bike size={16} color={isEditingProfile ? '#059669' : '#94a3b8'} style={{ flexShrink: 0 }} />
                    {isEditingProfile ? (
                      <select
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value)}
                        className="profile-native-input"
                        style={{ background: 'transparent', cursor: 'pointer', fontWeight: 600 }}
                      >
                        <option value="Two-Wheeler Bike">Two-Wheeler Motorcycle / Bike</option>
                        <option value="Scooter">Scooter / Moped</option>
                        <option value="Electric Vehicle (EV)">Electric Two-Wheeler (EV)</option>
                        <option value="Commercial 3-Wheeler">Commercial 3-Wheeler Auto</option>
                        <option value="Delivery Van">Delivery Cargo Van</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        disabled
                        value={vehicleType || 'Two-Wheeler Bike'}
                        className="profile-native-input"
                        style={{ color: '#0f172a', fontWeight: 600 }}
                      />
                    )}
                  </div>
                </div>

                <div style={fieldGroup}>
                  <label style={fieldLabel}>Assigned Hub / Service Territory</label>
                  <div className="profile-input-box profile-input-locked">
                    <MapPin size={16} color="#059669" style={{ flexShrink: 0 }} />
                    <input
                      type="text"
                      disabled
                      value="Central Indore Express Hub (PIN: 452001)"
                      className="profile-native-input"
                      style={{ color: '#0f172a', fontWeight: 600 }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Vendor Specific Store Branding Fields */}
            {isVendor && (
              <div className="profile-grid-2">
                <div style={fieldGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={fieldLabel}>Merchant Store Name {isEditingProfile && '*'}</label>
                    {!isEditingProfile && (
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Lock size={11} /> Locked (Click Edit)
                      </span>
                    )}
                  </div>
                  <div className={`profile-input-box ${!isEditingProfile ? 'profile-input-locked' : ''}`}>
                    <Store size={16} color={isEditingProfile ? '#ea580c' : '#94a3b8'} style={{ flexShrink: 0 }} />
                    <input
                      type="text"
                      disabled={!isEditingProfile}
                      value={vendorStoreName}
                      onChange={(e) => setVendorStoreName(e.target.value)}
                      className="profile-native-input"
                      placeholder="e.g. Aarav Luxury Handlooms"
                      style={{ fontWeight: 600 }}
                    />
                  </div>
                </div>

                <div style={fieldGroup}>
                  <label style={fieldLabel}>Marketplace Fulfillment Channel</label>
                  <div className="profile-input-box profile-input-locked">
                    <Truck size={16} color="#ea580c" style={{ flexShrink: 0 }} />
                    <input
                      type="text"
                      disabled
                      value="CASA Direct Hub Pickup & Courier Dispatch"
                      className="profile-native-input"
                      style={{ color: '#0f172a', fontWeight: 600 }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Avatar Section: File Upload, URL & Presets */}
            <div style={fieldGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                <label style={fieldLabel}>Profile Avatar Picture</label>
                {isEditingProfile ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: '#eff6ff',
                      color: '#2563eb',
                      border: '1.5px solid #bfdbfe',
                      borderRadius: '8px',
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <Upload size={13} /> Upload Photo from Device
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingProfile(true);
                      setTimeout(() => fileInputRef.current?.click(), 50);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: 'none',
                      color: '#2563eb',
                      border: 'none',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    <Upload size={12} /> Change Photo
                  </button>
                )}
              </div>

              {/* Avatar Preview & File Input Options */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '10px 14px',
                  background: isEditingProfile ? '#ffffff' : '#f8fafc',
                  border: isEditingProfile ? '1.5px solid #cbd5e1' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{ position: 'relative', cursor: 'pointer' }}
                  onClick={() => fileInputRef.current?.click()}
                  title="Click to choose a photo from your device"
                >
                  <img
                    src={avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'}
                    alt="Current Avatar"
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid #2563eb',
                      display: 'block',
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      bottom: -2,
                      right: -2,
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#2563eb',
                      border: '2px solid #ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                    }}
                  >
                    <Camera size={10} />
                  </span>
                </div>

                <div style={{ flex: 1, minWidth: '200px' }}>
                  {isEditingProfile ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div className="profile-input-box" style={{ padding: '6px 10px' }}>
                        <Camera size={14} color="#94a3b8" style={{ flexShrink: 0 }} />
                        <input
                          type="url"
                          value={avatar}
                          onChange={(e) => setAvatar(e.target.value)}
                          className="profile-native-input"
                          placeholder="Or paste an image URL (https://...)"
                          style={{ fontSize: '0.825rem' }}
                        />
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        Upload directly from device (PNG, JPG) or paste image URL.
                      </span>
                    </div>
                  ) : (
                    <div>
                      <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block' }}>
                        Active Profile Photo
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Click <strong>Edit Profile</strong> or click the avatar to upload a photo from your device.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Preset Avatars (visible only in editing mode) */}
              {isEditingProfile && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
                    Or select preset:
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {AVATAR_PRESETS.map((preset, idx) => (
                      <img
                        key={idx}
                        src={preset}
                        alt=""
                        onClick={() => setAvatar(preset)}
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          cursor: 'pointer',
                          border: avatar === preset ? '2px solid #2563eb' : '2px solid #e2e8f0',
                          boxShadow: avatar === preset ? '0 0 0 2px rgba(37,99,235,0.2)' : 'none',
                          transition: 'transform 0.15s ease',
                        }}
                        title="Click to apply"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Preferred Language Setting Card */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                margin: '8px 0 12px 0',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Globe size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
                    Preferred Marketplace Language
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Current: <strong style={{ color: '#2563eb' }}>{language === 'hi' ? '🇮🇳 हिन्दी (Hindi)' : language === 'hinglish' ? '🇮🇳 Hinglish' : language === 'bn' ? '🇮🇳 বাংলা (Bengali)' : language === 'mr' ? '🇮🇳 मराठी (Marathi)' : language === 'ta' ? '🇮🇳 தமிழ் (Tamil)' : language === 'te' ? '🇮🇳 తెలుగు (Telugu)' : language === 'gu' ? '🇮🇳 ગુજરાતી (Gujarati)' : '🇬🇧 English'}</strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={openLanguageModal}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1.5px solid #2563eb',
                  background: '#ffffff',
                  color: '#2563eb',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Globe size={13} />
                <span>Change Language / भाषा बदलें</span>
              </button>
            </div>

            {/* Action Buttons: Edit / Save / Cancel */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', flexWrap: 'wrap' }}>
              {!isEditingProfile ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(true)}
                    style={primaryBtnStyle}
                  >
                    <Edit3 size={15} />
                    <span>Edit Profile Details</span>
                  </button>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Click to unlock and edit your name, mobile number or profile photo.
                  </span>
                </>
              ) : (
                <>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    style={{
                      ...primaryBtnStyle,
                      opacity: savingProfile ? 0.7 : 1,
                      cursor: savingProfile ? 'not-allowed' : 'pointer',
                      width: 'auto',
                    }}
                  >
                    <Save size={15} />
                    <span>{savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    style={secondaryBtnStyle}
                  >
                    <X size={15} />
                    <span>Cancel</span>
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      )}

      {/* TAB 2 FOR DELIVERY PARTNER: RIDER HUB & PERFORMANCE */}
      {activeSection === 'delivery-hub' && (
        <div className="profile-content-card">
          <div style={cardHeaderRow}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={18} color="#059669" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  CASA Express Delivery Operations Hub
                </h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '3px 0 0 0' }}>
                Manage your active delivery runs, pickup queue from sellers, and doorstep settlements.
              </p>
            </div>

            <Link
              to="/delivery"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: '#ffffff',
                fontSize: '0.825rem',
                fontWeight: 800,
                textDecoration: 'none',
                boxShadow: '0 3px 10px rgba(5, 150, 105, 0.28)',
              }}
            >
              <ExternalLink size={14} />
              <span>Launch Live Delivery Dashboard</span>
            </Link>
          </div>

          {/* Quick Metrics & Payout Strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                padding: '14px 16px',
                borderRadius: '12px',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
                Doorstep Payout Rate
              </span>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#15803d' }}>₹65 / Order</span>
              <span style={{ fontSize: '0.72rem', color: '#166534' }}>+ Weekly Fuel & Peak hour surge bonuses</span>
            </div>

            <div
              style={{
                padding: '14px 16px',
                borderRadius: '12px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase' }}>
                Assigned Vehicle
              </span>
              <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Bike size={18} /> {vehicleType || 'Two-Wheeler Bike'}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#1e40af' }}>Fuel allowance eligible</span>
            </div>

            <div
              style={{
                padding: '14px 16px',
                borderRadius: '12px',
                background: '#faf5ff',
                border: '1px solid #e9d5ff',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b21a8', textTransform: 'uppercase' }}>
                Express Delivery SLA
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#7e22ce' }}>Same-Day / 24h</span>
              <span style={{ fontSize: '0.72rem', color: '#6b21a8' }}>98.4% on-time milestone rating</span>
            </div>
          </div>

          {/* Flipkart-Style 4-Step Courier Protocols */}
          <div
            style={{
              padding: '16px',
              borderRadius: '14px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
            }}
          >
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <PackageCheck size={16} color="#059669" />
              Flipkart-Style Courier Field Workflow Checkpoints
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
              <div style={{ padding: '12px 14px', borderRadius: '10px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
                <strong style={{ fontSize: '0.82rem', color: '#0f172a', display: 'block', marginBottom: '3px' }}>1. Hub & Merchant Pickup</strong>
                <span style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>
                  Collect packed parcels from CASA merchant hubs with tamper-proof security seals intact.
                </span>
              </div>
              <div style={{ padding: '12px 14px', borderRadius: '10px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
                <strong style={{ fontSize: '0.82rem', color: '#0f172a', display: 'block', marginBottom: '3px' }}>2. Accept & Out for Delivery</strong>
                <span style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>
                  Click "Accept Order" and switch status to "Out for delivery" to notify customer with live tracking.
                </span>
              </div>
              <div style={{ padding: '12px 14px', borderRadius: '10px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
                <strong style={{ fontSize: '0.82rem', color: '#0f172a', display: 'block', marginBottom: '3px' }}>3. OTP Handshake & COD Collection</strong>
                <span style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>
                  Verify delivery OTP from customer, collect exact cash on COD shipments, and complete handoff.
                </span>
              </div>
            </div>

            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <Link
                to="/delivery"
                style={{
                  ...primaryBtnStyle,
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  textDecoration: 'none',
                  padding: '10px 24px',
                }}
              >
                <Truck size={16} /> Open Delivery Dashboard Now
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2 FOR VENDOR: STORE & OPERATIONS HUB */}
      {activeSection === 'vendor-hub' && (
        <div className="profile-content-card">
          <div style={cardHeaderRow}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Store size={18} color="#ea580c" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  CASA Merchant Operations & Store Hub
                </h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '3px 0 0 0' }}>
                Manage incoming orders, catalog pricing, inventory stock, and courier handovers.
              </p>
            </div>

            <Link
              to="/vendor"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                color: '#ffffff',
                fontSize: '0.825rem',
                fontWeight: 800,
                textDecoration: 'none',
                boxShadow: '0 3px 10px rgba(234, 88, 12, 0.28)',
              }}
            >
              <ExternalLink size={14} />
              <span>Open Vendor Dashboard</span>
            </Link>
          </div>

          <div
            style={{
              padding: '16px',
              borderRadius: '14px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              textAlign: 'center',
            }}
          >
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
              Merchant Fulfillment Workstation
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#64748b', maxWidth: '500px', margin: '0 auto 16px' }}>
              Process customer orders through Confirmed → Processing → Packed. Once marked Packed, CASA Express Couriers automatically receive the pickup dispatch!
            </p>
            <Link
              to="/vendor"
              style={{
                ...primaryBtnStyle,
                background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                textDecoration: 'none',
                padding: '10px 24px',
              }}
            >
              <Store size={16} /> Manage Store & Orders
            </Link>
          </div>
        </div>
      )}

      {/* TAB 2: SAVED DELIVERY ADDRESSES (For regular shoppers) */}
      {activeSection === 'addresses' && (
        <div className="profile-content-card">
          <div style={cardHeaderRow}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={17} color="#2563eb" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Saved Delivery Addresses ({addresses.length})
                </h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '3px 0 0 0' }}>
                Doorstep shipping destinations for 1-click accelerated checkout.
              </p>
            </div>

            {!isAddingAddress && (
              <button
                onClick={() => setIsAddingAddress(true)}
                style={outlineBtnStyle}
              >
                <Plus size={14} /> Add New Address
              </button>
            )}
          </div>

          {/* Inline Add Address Form Drawer */}
          {isAddingAddress && (
            <form onSubmit={handleAddAddress} style={addAddressContainer}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '26px', height: '26px', borderRadius: '8px', background: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Plus size={15} />
                  </span>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Add New Delivery Address
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingAddress(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="profile-grid-2">
                  <div style={fieldGroup}>
                    <label style={fieldLabel}>Recipient Full Name *</label>
                    <div className="profile-input-box">
                      <User size={16} color="#94a3b8" style={{ flexShrink: 0 }} />
                      <input
                        type="text"
                        required
                        value={newAddr.fullName}
                        onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                        className="profile-native-input"
                        placeholder="e.g. Ajay Singh"
                      />
                    </div>
                  </div>

                  <div style={fieldGroup}>
                    <label style={fieldLabel}>10-Digit Mobile Number *</label>
                    <div className="profile-input-box">
                      <div style={phonePrefix}>
                        <span style={{ fontSize: '0.95rem' }}>🇮🇳</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>+91</span>
                      </div>
                      <input
                        type="tel"
                        required
                        pattern="[0-9]{10}"
                        maxLength={10}
                        value={newAddr.phone}
                        onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value.replace(/\D/g, '') })}
                        className="profile-native-input"
                        placeholder="9876543210"
                      />
                    </div>
                  </div>
                </div>

                <div style={fieldGroup}>
                  <label style={fieldLabel}>Flat, House No., Building, Apartment *</label>
                  <div className="profile-input-box">
                    <Home size={16} color="#94a3b8" style={{ flexShrink: 0 }} />
                    <input
                      type="text"
                      required
                      value={newAddr.street}
                      onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                      className="profile-native-input"
                      placeholder="e.g. Flat 402, Signature Residency"
                    />
                  </div>
                </div>

                <div style={fieldGroup}>
                  <label style={fieldLabel}>Area, Colony, Sector, Street</label>
                  <div className="profile-input-box">
                    <MapPin size={16} color="#94a3b8" style={{ flexShrink: 0 }} />
                    <input
                      type="text"
                      value={newAddr.locality}
                      onChange={(e) => setNewAddr({ ...newAddr, locality: e.target.value })}
                      className="profile-native-input"
                      placeholder="e.g. Indiranagar 2nd Stage"
                    />
                  </div>
                </div>

                <div className="profile-grid-3">
                  <div style={fieldGroup}>
                    <label style={fieldLabel}>PIN Code *</label>
                    <div className="profile-input-box">
                      <input
                        type="text"
                        required
                        maxLength={6}
                        pattern="[0-9]{6}"
                        value={newAddr.pincode}
                        onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value.replace(/\D/g, '') })}
                        className="profile-native-input"
                        placeholder="560038"
                      />
                    </div>
                  </div>

                  <div style={fieldGroup}>
                    <label style={fieldLabel}>City / District *</label>
                    <div className="profile-input-box">
                      <input
                        type="text"
                        required
                        value={newAddr.city}
                        onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                        className="profile-native-input"
                        placeholder="Bengaluru"
                      />
                    </div>
                  </div>

                  <div style={fieldGroup}>
                    <label style={fieldLabel}>State *</label>
                    <div className="profile-input-box">
                      <input
                        type="text"
                        required
                        value={newAddr.state}
                        onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                        className="profile-native-input"
                        placeholder="Karnataka"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Type Selector */}
                <div style={fieldGroup}>
                  <label style={fieldLabel}>Address Type</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[
                      { id: 'home', label: 'Home (All Day)', icon: Home },
                      { id: 'work', label: 'Work (10 AM - 6 PM)', icon: Building },
                    ].map((type) => {
                      const Icon = type.icon;
                      const isSelected = newAddr.addressType === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setNewAddr({ ...newAddr, addressType: type.id })}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 12px',
                            borderRadius: '10px',
                            fontSize: '0.8rem',
                            fontWeight: isSelected ? 700 : 500,
                            background: isSelected ? '#eff6ff' : '#f8fafc',
                            border: isSelected ? '1.5px solid #2563eb' : '1.5px solid #e2e8f0',
                            color: isSelected ? '#1d4ed8' : '#64748b',
                            cursor: 'pointer',
                          }}
                        >
                          <Icon size={13} /> {type.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button type="submit" style={primaryBtnStyle}>
                    <Check size={15} /> Save Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingAddress(false)}
                    style={secondaryBtnStyle}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Address Cards List */}
          {loadingAddresses ? (
            <div style={{ padding: '30px 16px', textAlign: 'center', color: '#64748b' }}>
              Loading saved addresses...
            </div>
          ) : addresses.length === 0 && !isAddingAddress ? (
            /* Illustrated Empty State */
            <div style={emptyAddressBox}>
              <div style={emptyIconCircle}>
                <MapPin size={26} color="#94a3b8" />
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                No Delivery Addresses Saved Yet
              </h4>
              <p style={{ color: '#64748b', fontSize: '0.825rem', maxWidth: '340px', margin: '0 auto 16px', lineHeight: 1.5 }}>
                Save your home or office address to enable 1-click checkout on your next order.
              </p>
              <button
                onClick={() => setIsAddingAddress(true)}
                style={primaryBtnStyle}
              >
                <Plus size={15} /> Add Your First Address
              </button>
            </div>
          ) : (
            /* Grid of Saved Addresses */
            <div className="addresses-grid">
              {addresses.map((addr) => (
                <div key={addr._id} className="address-card-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={addressTypeBadge}>
                        {addr.addressType === 'work' ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Building size={11} /> WORK
                          </span>
                        ) : (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Home size={11} /> HOME
                          </span>
                        )}
                      </span>
                      <strong style={{ fontSize: '0.925rem', color: '#0f172a' }}>{addr.fullName}</strong>
                    </div>

                    <button
                      onClick={() => handleDeleteAddress(addr._id)}
                      style={deleteAddrBtn}
                      title="Remove address"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <p style={{ fontSize: '0.825rem', color: '#334155', lineHeight: 1.45, margin: '0 0 8px 0', wordBreak: 'break-word' }}>
                    {addr.street}
                    {addr.locality ? `, ${addr.locality}` : ''}
                    <br />
                    {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                  </p>

                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '6px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#64748b' }}>
                    <Phone size={12} color="#94a3b8" />
                    <span>Phone: +91 {addr.phone}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SECURITY & SESSION MANAGEMENT */}
      {activeSection === 'security' && (
        <div className="profile-content-card">
          <div style={cardHeaderRow}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={17} color="#2563eb" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Account Security & Session Management
                </h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '3px 0 0 0' }}>
                Your CASA account is protected with enterprise bank-grade security.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Security checklist item 1 */}
            <div style={securityItemRow}>
              <div style={securityIconBox}>
                <ShieldCheck size={18} color="#059669" />
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block' }}>
                  256-Bit SSL Data Encryption Active
                </strong>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  All payment transactions and credential handshakes are end-to-end encrypted.
                </span>
              </div>
            </div>

            {/* Security checklist item 2 */}
            <div style={securityItemRow}>
              <div style={securityIconBox}>
                <Clock size={18} color="#2563eb" />
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block' }}>
                  Active Browser Session
                </strong>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Authenticated via JWT bearer session token.
                </span>
              </div>
            </div>

            {/* Logout Action Card */}
            <div
              style={{
                background: '#fef2f2',
                border: '1.5px solid #fee2e2',
                borderRadius: '14px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                marginTop: '10px',
              }}
            >
              <div>
                <strong style={{ fontSize: '0.9rem', color: '#991b1b', display: 'block' }}>
                  Sign Out of CASA Account
                </strong>
                <span style={{ fontSize: '0.78rem', color: '#b91c1c' }}>
                  You will be logged out of this device. Your cart and wishlist will remain saved.
                </span>
              </div>
              <button
                type="button"
                onClick={logout}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 16px',
                  borderRadius: '10px',
                  background: '#dc2626',
                  color: '#ffffff',
                  fontSize: '0.825rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)',
                }}
              >
                <LogOut size={15} /> Sign Out Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SETTINGS & LANGUAGE PREFERENCES */}
      {activeSection === 'settings' && (
        isVendor ? (
          <VendorStoreSettings
            user={user}
            onSettingsSaved={(updatedUser) => {
              if (updatedUser) updateProfile(updatedUser);
            }}
          />
        ) : (
          <div className="profile-content-card">
          <div style={cardHeaderRow}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Settings size={18} color="#2563eb" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Settings & Language Preferences / भाषा व सेटिंग्स
                </h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '3px 0 0 0' }}>
                Choose your default language for browsing products, banners, notifications and checkout.
              </p>
            </div>

            <button
              type="button"
              onClick={openLanguageModal}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '10px',
                background: primaryColor || '#2563eb',
                color: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
              }}
            >
              <Globe size={15} />
              <span>Open Language Pop-up</span>
            </button>
          </div>

          {/* Current Active Language Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '12px',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#dcfce7',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircle2 size={18} />
              </div>
              <div>
                <strong style={{ fontSize: '0.88rem', color: '#166534', display: 'block' }}>
                  Current Active Language
                </strong>
                <span style={{ fontSize: '0.78rem', color: '#15803d' }}>
                  All website elements, catalogs, and actions are rendered in this language.
                </span>
              </div>
            </div>

            <span
              style={{
                padding: '4px 12px',
                borderRadius: '999px',
                background: '#16a34a',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
              }}
            >
              Active: {language}
            </span>
          </div>

          {/* All Languages Interactive Grid */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
              Select Your Preferred Language (1-Click Change):
            </h4>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '12px',
              }}
            >
              {LANGUAGE_OPTIONS.map((opt) => {
                const isSelected = language === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={async () => {
                      setLanguage(opt.id);
                      if (user) {
                        localStorage.setItem(`casa_lang_selected_${user._id || user.id}`, 'true');
                        try {
                          await updateProfile({ preferredLanguage: opt.id });
                        } catch {
                          // non-blocking
                        }
                      }
                      success(`Language changed to ${opt.nativeName} (${opt.name})!`);
                    }}
                    style={{
                      border: isSelected ? `2px solid ${primaryColor || '#2563eb'}` : '1.5px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '14px',
                      cursor: 'pointer',
                      background: isSelected ? '#eff6ff' : '#ffffff',
                      boxShadow: isSelected
                        ? '0 6px 16px -2px rgba(37,99,235,0.18)'
                        : '0 1px 3px rgba(0,0,0,0.03)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.4rem' }}>{opt.flag}</span>
                        <div>
                          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                            {opt.nativeName}
                          </div>
                          {opt.nativeName !== opt.name && (
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>({opt.name})</div>
                          )}
                        </div>
                      </div>

                      <div
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          border: isSelected ? `2px solid ${primaryColor || '#2563eb'}` : '2px solid #cbd5e1',
                          background: isSelected ? (primaryColor || '#2563eb') : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {isSelected && <Check size={13} color="#ffffff" strokeWidth={3} />}
                      </div>
                    </div>

                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '6px',
                          background: `${opt.badgeColor}15`,
                          color: opt.badgeColor,
                        }}
                      >
                        {opt.badge}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '6px 0 0 0', lineHeight: 1.35 }}>
                      {opt.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Additional Preferences Overview */}
          <div
            style={{
              padding: '16px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Regional & Marketplace Defaults
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Currency</span>
                <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>Indian Rupee (₹ INR)</strong>
              </div>
              <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Marketplace Region</span>
                <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>India (All States & UTs)</strong>
              </div>
              <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Language Auto-Prompt</span>
                <strong style={{ fontSize: '0.85rem', color: '#16a34a' }}>Configured on Account</strong>
              </div>
            </div>
          </div>
        </div>
        )
      )}
        </>
      )}
    </div>
  );
};

/* Styles */
const breadcrumbRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '0.8rem',
  marginBottom: '14px',
};

const breadcrumbLink = {
  color: '#64748b',
  textDecoration: 'none',
};

const vipAvatarImg = {
  width: '68px',
  height: '68px',
  borderRadius: '50%',
  objectFit: 'cover',
  border: '3px solid #ffffff',
  boxShadow: '0 3px 10px rgba(15, 23, 42, 0.12)',
  display: 'block',
};

const avatarCameraPill = {
  position: 'absolute',
  bottom: '0',
  right: '0',
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  background: '#2563eb',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '2px solid #ffffff',
};

const adminBadge = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  background: '#fef3c7',
  color: '#b45309',
  fontSize: '0.68rem',
  fontWeight: 800,
  padding: '2px 7px',
  borderRadius: '9999px',
  border: '1px solid #fde68a',
};

const deliveryBadge = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  background: '#ecfdf5',
  color: '#065f46',
  fontSize: '0.68rem',
  fontWeight: 800,
  padding: '3px 8px',
  borderRadius: '9999px',
  border: '1px solid #a7f3d0',
};

const vendorBadge = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  background: '#fff7ed',
  color: '#c2410c',
  fontSize: '0.68rem',
  fontWeight: 800,
  padding: '3px 8px',
  borderRadius: '9999px',
  border: '1px solid #fed7aa',
};

const dutyBadge = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  background: '#f0fdf4',
  color: '#15803d',
  fontSize: '0.68rem',
  fontWeight: 800,
  padding: '3px 8px',
  borderRadius: '9999px',
  border: '1px solid #bbf7d0',
};

const vehicleBadge = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  background: '#f0f9ff',
  color: '#0369a1',
  fontSize: '0.68rem',
  fontWeight: 800,
  padding: '3px 8px',
  borderRadius: '9999px',
  border: '1px solid #bae6fd',
};

const shopperBadge = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  background: '#e0e7ff',
  color: '#3730a3',
  fontSize: '0.68rem',
  fontWeight: 800,
  padding: '2px 7px',
  borderRadius: '9999px',
  border: '1px solid #c7d2fe',
};

const shortcutBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  padding: '7px 12px',
  borderRadius: '9px',
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  color: '#334155',
  fontSize: '0.8rem',
  fontWeight: 600,
  textDecoration: 'none',
};

const tabBarContainer = {
  display: 'flex',
  background: '#f1f5f9',
  borderRadius: '14px',
  padding: '4px',
  margin: '18px 0',
  border: '1px solid #e2e8f0',
  gap: '4px',
  overflowX: 'auto',
  boxSizing: 'border-box',
  width: '100%',
};

const cardHeaderRow = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingBottom: '14px',
  marginBottom: '16px',
  borderBottom: '1px solid #f1f5f9',
  flexWrap: 'wrap',
  gap: '10px',
};

const securityChip = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '0.72rem',
  fontWeight: 700,
  color: '#059669',
  background: '#ecfdf5',
  padding: '3px 8px',
  borderRadius: '999px',
  border: '1px solid #a7f3d0',
};

const fieldGroup = {
  display: 'flex',
  flexDirection: 'column',
  gap: '5px',
  width: '100%',
  boxSizing: 'border-box',
};

const fieldLabel = {
  fontSize: '0.78rem',
  fontWeight: 700,
  color: '#334155',
};

const phonePrefix = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  paddingRight: '8px',
  borderRight: '1.5px solid #e2e8f0',
  flexShrink: 0,
};

const primaryBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  padding: '9px 18px',
  borderRadius: '11px',
  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
  color: '#ffffff',
  fontSize: '0.85rem',
  fontWeight: 700,
  border: 'none',
  boxShadow: '0 3px 10px rgba(37, 99, 235, 0.25)',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
};

const secondaryBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  padding: '9px 16px',
  borderRadius: '11px',
  background: '#f8fafc',
  color: '#475569',
  fontSize: '0.85rem',
  fontWeight: 600,
  border: '1px solid #e2e8f0',
  cursor: 'pointer',
};

const outlineBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  padding: '7px 12px',
  borderRadius: '9px',
  background: '#ffffff',
  border: '1.5px solid #2563eb',
  color: '#2563eb',
  fontSize: '0.8rem',
  fontWeight: 700,
  cursor: 'pointer',
};

const addAddressContainer = {
  background: '#f8fafc',
  border: '1.5px solid #e2e8f0',
  borderRadius: '14px',
  padding: '16px',
  marginBottom: '16px',
  boxSizing: 'border-box',
  width: '100%',
};

const emptyAddressBox = {
  textAlign: 'center',
  padding: '30px 16px',
  background: '#f8fafc',
  borderRadius: '14px',
  border: '1.5px dashed #cbd5e1',
  boxSizing: 'border-box',
  width: '100%',
};

const emptyIconCircle = {
  width: '50px',
  height: '50px',
  borderRadius: '50%',
  background: '#ffffff',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '12px',
  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
};

const addressTypeBadge = {
  fontSize: '0.68rem',
  fontWeight: 800,
  padding: '2px 7px',
  borderRadius: '6px',
  background: '#eff6ff',
  color: '#2563eb',
  border: '1px solid #bfdbfe',
};

const deleteAddrBtn = {
  background: 'none',
  border: 'none',
  color: '#ef4444',
  cursor: 'pointer',
  padding: '4px',
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const securityItemRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 14px',
  background: '#f8fafc',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
};

const securityIconBox = {
  width: '36px',
  height: '36px',
  borderRadius: '10px',
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

export default UserProfilePage;
