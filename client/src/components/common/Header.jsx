import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  Heart,
  User as UserIcon,
  MapPin,
  Menu,
  ChevronDown,
  Shield,
  Package,
  LogOut,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import { useStore } from '../../context/StoreContext';
import { productService } from '../../services/productService';
import { formatINR } from '../../utils/formatters';

const Header = ({ onToggleMobileMenu }) => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const { success } = useToast();
  const { cartCount, openDrawer } = useCart();
  const { wishlistCount } = useWishlist();
  const { storeName, storeTagline, primaryColor, t } = useStore();

  // Location State (persisted in localStorage)
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [detectStatus, setDetectStatus] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('casa_delivery_location');
      return saved ? JSON.parse(saved) : { city: 'Bengaluru', pincode: '560038' };
    } catch {
      return { city: 'Bengaluru', pincode: '560038' };
    }
  });

  const handleDetectLocationInline = async () => {
    if (isDetectingLocation) return;
    setIsDetectingLocation(true);
    setDetectStatus('Locating...');

    const applyLocation = (city, pincode, state = '') => {
      const loc = { city: city || 'Bengaluru', pincode: pincode || '560038', state };
      setDeliveryLocation(loc);
      try {
        localStorage.setItem('casa_delivery_location', JSON.stringify(loc));
      } catch (e) {
        console.error(e);
      }
      setIsDetectingLocation(false);
      setDetectStatus('');
      success(`📍 Delivery location set to ${loc.city} ${loc.pincode}`);
    };

    const tryIpFallback = async () => {
      try {
        setDetectStatus('Analyzing IP...');
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
          const data = await res.json();
          if (data && data.city) {
            applyLocation(data.city, data.postal || '560038', data.region || '');
            return;
          }
        }
      } catch {
        try {
          const res2 = await fetch('https://ipwho.is/');
          if (res2.ok) {
            const data2 = await res2.json();
            if (data2 && data2.city) {
              applyLocation(data2.city, data2.postal || '560038', data2.region || '');
              return;
            }
          }
        } catch {
          // ignore
        }
      }
      applyLocation('Bengaluru', '560038', 'Karnataka');
    };

    if (!navigator.geolocation) {
      await tryIpFallback();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          setDetectStatus('Analyzing GPS...');
          const { latitude, longitude } = pos.coords;

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3500);

          let detectedCity = '';
          let detectedPincode = '';
          let detectedState = '';

          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
              {
                signal: controller.signal,
                headers: { 'Accept-Language': 'en' },
              }
            );
            clearTimeout(timeoutId);
            if (res.ok) {
              const data = await res.json();
              if (data && data.address) {
                detectedCity =
                  data.address.city ||
                  data.address.town ||
                  data.address.suburb ||
                  data.address.state_district ||
                  data.address.county ||
                  '';
                detectedPincode = data.address.postcode || '';
                detectedState = data.address.state || '';
              }
            }
          } catch (fetchErr) {
            console.log('Reverse geocode error or timeout:', fetchErr);
          }

          if (detectedCity && detectedPincode) {
            applyLocation(detectedCity, detectedPincode, detectedState);
          } else {
            await tryIpFallback();
          }
        } catch {
          await tryIpFallback();
        }
      },
      async (err) => {
        console.log('GPS denied or unavailable, trying IP fallback:', err.message);
        await tryIpFallback();
      },
      { timeout: 6000, maximumAge: 60000, enableHighAccuracy: false }
    );
  };

  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  // Sync search input with URL if query is present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('search');
    if (q !== null && q !== undefined) {
      setSearchQuery(q);
    }
  }, [location.search]);

  // Debounced search suggestions
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const results = await productService.getSearchSuggestions(searchQuery);
        setSuggestions(results || []);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = (slug) => {
    setShowSuggestions(false);
    setSearchQuery('');
    navigate(`/product/${slug}`);
  };

  return (
    <header style={headerWrapperStyle}>
      <style>{`
        .header-mobile-menu-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          color: #0f172a;
          background: none;
          border: none;
          cursor: pointer;
        }
        @media (min-width: 1024px) {
          .header-mobile-menu-btn {
            display: none !important;
          }
        }
        .header-delivery-badge {
          display: none;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          border-radius: 8px;
          border: 1.5px solid #e2e8f0;
          background: #f8fafc;
          flex-shrink: 0;
          cursor: pointer;
          outline: none;
        }
        @media (min-width: 1200px) {
          .header-delivery-badge {
            display: flex !important;
          }
        }
        .header-account-text {
          display: none;
          flex-direction: column;
          align-items: flex-start;
          line-height: 1.15;
        }
        @media (min-width: 768px) {
          .header-account-text {
            display: flex !important;
          }
        }
        @media (max-width: 768px) {
          .header-container-responsive {
            display: flex !important;
            flex-wrap: wrap !important;
            height: auto !important;
            min-height: 58px !important;
            padding-top: 8px !important;
            padding-bottom: 8px !important;
            column-gap: 8px !important;
            row-gap: 8px !important;
            align-items: center !important;
          }
          .header-mobile-menu-btn {
            order: 1 !important;
          }
          .header-logo-container {
            order: 2 !important;
          }
          .header-logo-text {
            display: flex !important;
          }
          .header-logo-text span:last-child {
            display: none !important;
          }
          .header-action-group-responsive {
            order: 3 !important;
            margin-left: auto !important;
            gap: 10px !important;
          }
          .header-action-label {
            display: none !important;
          }
          .header-search-container {
            order: 4 !important;
            flex: 0 0 100% !important;
            width: 100% !important;
            max-width: 100% !important;
            margin-top: 2px !important;
          }
          .header-search-form {
            width: 100% !important;
            border-radius: 10px !important;
            box-shadow: 0 1px 4px rgba(15, 23, 42, 0.05) !important;
          }
          .header-search-input {
            padding: 9px 14px !important;
            font-size: 0.875rem !important;
          }
          .header-search-btn {
            padding: 9px 16px !important;
          }
        }
      `}</style>
      <div className="container header-container-responsive" style={headerContainerStyle}>
        {/* Mobile Menu Button */}
        <button
          onClick={onToggleMobileMenu}
          className="header-mobile-menu-btn"
          aria-label="Open Category Navigation"
        >
          <Menu size={24} />
        </button>

        {/* CASA Logo */}
        <Link to="/" className="header-logo-container" style={logoContainerStyle}>
          <div style={{ ...logoMarkStyle, background: primaryColor || '#1d4ed8' }}>
            {(storeName || 'C')[0]?.toUpperCase()}
          </div>
          <div className="header-logo-text" style={logoTextStyle}>
            <span style={brandNameStyle}>{storeName || 'CASA'}</span>
            <span style={brandTaglineStyle}>{storeTagline || 'INDIA MARKETPLACE'}</span>
          </div>
        </Link>

        {/* Deliver To Pin Code (Inline Auto-Detect GPS & IP Analyzer) */}
        <button
          type="button"
          onClick={handleDetectLocationInline}
          disabled={isDetectingLocation}
          className="header-delivery-badge delivery-badge-btn"
          style={{
            ...deliveryBadgeStyle,
            borderColor: isDetectingLocation ? '#2563eb' : '#e2e8f0',
            background: isDetectingLocation ? '#eff6ff' : '#f8fafc',
            cursor: isDetectingLocation ? 'wait' : 'pointer',
          }}
          title="Click to auto-detect and analyze your delivery location"
        >
          {isDetectingLocation ? (
            <Loader2 size={18} color="#2563eb" className="spin-animation" style={{ flexShrink: 0 }} />
          ) : (
            <MapPin size={18} color={primaryColor || '#1d4ed8'} style={{ flexShrink: 0 }} />
          )}
          <div style={deliveryBadgeText}>
            <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px' }}>
              {isDetectingLocation ? (detectStatus || 'Locating...') : t('deliverTo')}
            </span>
            <strong style={{ fontSize: '0.825rem', color: isDetectingLocation ? '#2563eb' : '#0f172a', whiteSpace: 'nowrap', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {isDetectingLocation ? 'Analyzing...' : `${deliveryLocation.city} ${deliveryLocation.pincode}`}
            </strong>
          </div>
        </button>

        {/* Live Search Bar */}
        <div className="header-search-container" style={searchContainerStyle} ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="header-search-form" style={searchFormStyle}>
            <input
              type="text"
              className="header-search-input"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
              style={searchInputStyle}
            />
            <button
              type="submit"
              className="header-search-btn"
              style={{ ...searchBtnStyle, background: primaryColor || '#1d4ed8' }}
              aria-label="Search"
            >
              <Search size={18} />
            </button>
          </form>

          {/* Search Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div style={suggestionsBoxStyle} className="animate-slide-up">
              <div style={suggestionsHeader}>Suggested Products & Brands</div>
              {suggestions.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleSuggestionClick(item.slug)}
                  style={suggestionItemStyle}
                >
                  <img
                    src={item.image || item.images?.[0]}
                    alt={item.name}
                    style={suggestionImgStyle}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={suggestionNameStyle}>{item.name}</div>
                    <div style={suggestionMetaStyle}>
                      <span style={{ color: '#1d4ed8', fontWeight: 600 }}>{item.brand}</span>
                      <span>•</span>
                      <span style={{ fontWeight: 700 }}>{formatINR(item.price)}</span>
                    </div>
                  </div>
                </div>
              ))}
              <div onClick={handleSearchSubmit} style={viewAllSuggestionsStyle}>
                View all results for "{searchQuery}" →
              </div>
            </div>
          )}
        </div>

        {/* Action Icons & Account */}
        <div className="header-action-group-responsive" style={actionGroupStyle}>
          {/* Wishlist */}
          <Link to="/wishlist" style={actionItemStyle} title="My Wishlist">
            <div style={{ position: 'relative' }}>
              <Heart size={22} />
              {wishlistCount > 0 && <span style={badgeCountStyle}>{wishlistCount}</span>}
            </div>
            <span className="header-action-label" style={actionLabelStyle}>{t('wishlist')}</span>
          </Link>

          {/* Orders */}
          <Link to="/orders" style={actionItemStyle} title="My Orders">
            <Package size={22} />
            <span className="header-action-label" style={actionLabelStyle}>{t('orders')}</span>
          </Link>

          {/* Cart */}
          <button onClick={openDrawer} style={actionItemStyle} title="Shopping Cart">
            <div style={{ position: 'relative' }}>
              <ShoppingCart size={22} />
              {cartCount > 0 && <span style={badgeCountStyle}>{cartCount}</span>}
            </div>
            <span className="header-action-label" style={actionLabelStyle}>{t('cart')}</span>
          </button>

          {/* Account Dropdown */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }} ref={userMenuRef}>
            <button onClick={() => setShowUserMenu(!showUserMenu)} style={accountBtnStyle}>
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} style={userAvatarStyle} />
              ) : (
                <div style={userAvatarFallback}>
                  <UserIcon size={18} />
                </div>
              )}
              <div className="header-account-text">
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  {user ? 'Hello,' : 'Sign In'}
                </span>
                <strong style={{ fontSize: '0.825rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  {user ? (user.name ? user.name.split(' ')[0] : (user.email ? user.email.split('@')[0] : 'Shopper')) : 'Account'} <ChevronDown size={14} />
                </strong>
              </div>
            </button>

            {/* Quick 1-Click Logout Button when logged in */}
            {user && (
              <button
                onClick={() => {
                  logout();
                  success('Logged out successfully.');
                  navigate('/');
                }}
                style={{
                  display: 'none',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 10px',
                  borderRadius: '8px',
                  border: '1px solid #fee2e2',
                  background: '#fef2f2',
                  color: '#dc2626',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
                className="desktop-logout-btn"
                title="Sign out of CASA"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            )}

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div style={userDropdownStyle} className="animate-slide-up">
                {user ? (
                  <>
                    <div style={dropdownUserHeader}>
                      <strong>{user.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{user.email}</span>
                      {isAdmin && <span style={adminBadgeStyle}>ADMINISTRATOR</span>}
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setShowUserMenu(false)}
                        style={dropdownAdminLink}
                      >
                        <Shield size={16} /> Admin Dashboard
                      </Link>
                    )}

                    <Link to="/profile" onClick={() => setShowUserMenu(false)} style={dropdownLinkStyle}>
                      <UserIcon size={16} /> My Profile & Addresses
                    </Link>
                    <Link to="/orders" onClick={() => setShowUserMenu(false)} style={dropdownLinkStyle}>
                      <Package size={16} /> Order History
                    </Link>
                    <Link to="/wishlist" onClick={() => setShowUserMenu(false)} style={dropdownLinkStyle}>
                      <Heart size={16} /> My Wishlist
                    </Link>

                    <div style={{ borderTop: '1px solid #f1f5f9', margin: '4px 0' }} />

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                        success('Logged out successfully.');
                        navigate('/');
                      }}
                      style={{
                        ...dropdownLogoutBtn,
                        background: '#fee2e2',
                        color: '#dc2626',
                        fontWeight: 700,
                        padding: '8px 14px',
                        borderRadius: '8px',
                        margin: '6px 12px 10px',
                        width: 'calc(100% - 24px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                      }}
                    >
                      <LogOut size={16} /> Sign Out / Logout
                    </button>
                  </>
                ) : (
                  <div style={{ padding: '16px' }}>
                    <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '12px' }}>
                      Sign in for personalized recommendations and faster checkout.
                    </p>
                    <Link
                      to="/login"
                      onClick={() => setShowUserMenu(false)}
                      className="btn btn-primary"
                      style={{ width: '100%', fontSize: '0.875rem' }}
                    >
                      Sign In to CASA
                    </Link>
                    <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.78rem', color: '#64748b' }}>
                      New customer?{' '}
                      <Link
                        to="/register"
                        onClick={() => setShowUserMenu(false)}
                        style={{ color: '#1d4ed8', fontWeight: 700 }}
                      >
                        Start here
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Delivery Location Strip (<900px) */}
      <div
        className="mobile-delivery-strip"
        onClick={handleDetectLocationInline}
        style={{ cursor: isDetectingLocation ? 'wait' : 'pointer' }}
        title="Tap to auto-detect your live delivery location"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isDetectingLocation ? (
            <Loader2 size={14} color="#1d4ed8" className="spin-animation" />
          ) : (
            <MapPin size={14} color="#1d4ed8" />
          )}
          <span style={{ fontSize: '0.74rem', color: '#334155' }}>
            {isDetectingLocation ? (
              <span style={{ color: '#1d4ed8', fontWeight: 600 }}>Analyzing live location...</span>
            ) : (
              <>Deliver to <strong>{deliveryLocation.city} {deliveryLocation.pincode}</strong></>
            )}
          </span>
        </div>
        <span style={{ fontSize: '0.72rem', color: '#1d4ed8', fontWeight: 700 }}>
          {isDetectingLocation ? 'Buffering...' : 'Auto-Detect 📍'}
        </span>
      </div>
    </header>
  );
};

/* Styles */
const headerWrapperStyle = {
  background: '#ffffff',
  borderBottom: '1px solid #e2e8f0',
  position: 'sticky',
  top: 0,
  zIndex: 100,
  boxShadow: '0 2px 4px rgba(15, 23, 42, 0.04)',
};

const headerContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '20px',
  height: '72px',
};

const mobileMenuBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '6px',
  color: '#0f172a',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
};

const logoContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  textDecoration: 'none',
  flexShrink: 0,
};

const logoMarkStyle = {
  width: '38px',
  height: '38px',
  background: 'linear-gradient(135deg, #1d4ed8 0%, #0a192f 100%)',
  color: '#ffffff',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '800',
  fontSize: '1.25rem',
  boxShadow: '0 4px 6px rgba(29, 78, 216, 0.25)',
};

const logoTextStyle = {
  display: 'flex',
  flexDirection: 'column',
};

const brandNameStyle = {
  fontSize: '1.35rem',
  fontWeight: '800',
  letterSpacing: '-0.03em',
  color: '#0a192f',
  lineHeight: 1,
};

const brandTaglineStyle = {
  fontSize: '0.62rem',
  fontWeight: '700',
  letterSpacing: '0.08em',
  color: '#1d4ed8',
};

const deliveryBadgeStyle = {
  alignItems: 'center',
  gap: '8px',
  padding: '6px 12px',
  borderRadius: '8px',
  border: '1.5px solid #e2e8f0',
  background: '#f8fafc',
  flexShrink: 0,
  cursor: 'pointer',
  outline: 'none',
};

const deliveryBadgeText = {
  display: 'flex',
  flexDirection: 'column',
  lineHeight: 1.15,
};

const searchContainerStyle = {
  position: 'relative',
  flex: 1,
  maxWidth: '620px',
  minWidth: 0,
};

const searchFormStyle = {
  display: 'flex',
  alignItems: 'center',
  background: '#ffffff',
  borderRadius: '10px',
  border: '2px solid #cbd5e1',
  overflow: 'hidden',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  width: '100%',
};

const searchInputStyle = {
  border: 'none',
  outline: 'none',
  padding: '10px 16px',
  width: '100%',
  minWidth: 0,
  fontSize: '0.875rem',
  color: '#0f172a',
};

const searchBtnStyle = {
  background: '#1d4ed8',
  color: '#ffffff',
  border: 'none',
  padding: '10px 18px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  transition: 'background 0.2s',
};

const suggestionsBoxStyle = {
  position: 'absolute',
  top: 'calc(100% + 6px)',
  left: 0,
  right: 0,
  background: '#ffffff',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15)',
  overflow: 'hidden',
  zIndex: 100,
  maxHeight: '360px',
  overflowY: 'auto',
};

const suggestionsHeader = {
  padding: '8px 14px',
  background: '#f8fafc',
  fontSize: '0.72rem',
  fontWeight: 700,
  color: '#64748b',
  textTransform: 'uppercase',
  borderBottom: '1px solid #f1f5f9',
};

const suggestionItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '10px 14px',
  borderBottom: '1px solid #f8fafc',
  cursor: 'pointer',
  transition: 'background 0.15s',
};

const suggestionImgStyle = {
  width: '36px',
  height: '36px',
  borderRadius: '6px',
  objectFit: 'cover',
  background: '#f1f5f9',
};

const suggestionNameStyle = {
  fontSize: '0.825rem',
  fontWeight: 600,
  color: '#0f172a',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const suggestionMetaStyle = {
  fontSize: '0.75rem',
  color: '#64748b',
  display: 'flex',
  gap: '8px',
};

const viewAllSuggestionsStyle = {
  padding: '10px 14px',
  textAlign: 'center',
  fontSize: '0.8rem',
  fontWeight: 700,
  color: '#1d4ed8',
  background: '#eff6ff',
  cursor: 'pointer',
};

const actionGroupStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  flexShrink: 0,
};

const actionItemStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '2px',
  color: '#334155',
  textDecoration: 'none',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  position: 'relative',
  padding: '4px',
};

const actionLabelStyle = {
  fontSize: '0.7rem',
  fontWeight: 600,
  color: '#475569',
};

const badgeCountStyle = {
  position: 'absolute',
  top: '-6px',
  right: '-8px',
  background: '#1d4ed8',
  color: '#ffffff',
  fontSize: '0.65rem',
  fontWeight: 800,
  width: '18px',
  height: '18px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '2px solid #ffffff',
};

const accountBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '4px 8px',
  borderRadius: '8px',
  border: '1px solid transparent',
  background: 'none',
  cursor: 'pointer',
};

const userAvatarStyle = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  objectFit: 'cover',
};

const userAvatarFallback = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  background: '#eff6ff',
  color: '#1d4ed8',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const accountTextStyle = {
  flexDirection: 'column',
  alignItems: 'flex-start',
  lineHeight: 1.15,
};

const userDropdownStyle = {
  position: 'absolute',
  top: 'calc(100% + 10px)',
  right: 0,
  width: '260px',
  background: '#ffffff',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15)',
  overflow: 'hidden',
  zIndex: 100,
};

const dropdownUserHeader = {
  padding: '14px',
  background: '#f8fafc',
  borderBottom: '1px solid #f1f5f9',
};

const adminBadgeStyle = {
  display: 'inline-block',
  marginTop: '4px',
  padding: '2px 6px',
  background: '#dbeafe',
  color: '#1d4ed8',
  borderRadius: '4px',
  fontSize: '0.65rem',
  fontWeight: 800,
  letterSpacing: '0.04em',
};

const dropdownAdminLink = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 14px',
  fontSize: '0.85rem',
  fontWeight: 700,
  color: '#1d4ed8',
  background: '#eff6ff',
  textDecoration: 'none',
};

const dropdownLinkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 14px',
  fontSize: '0.85rem',
  color: '#334155',
  textDecoration: 'none',
  transition: 'background 0.15s',
};

const dropdownLogoutBtn = {
  ...dropdownLinkStyle,
  width: '100%',
  color: '#dc2626',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
};

export default Header;
