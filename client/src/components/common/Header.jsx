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
  ChevronRight,
  Sparkles,
  Store,
  Truck,
  Bell,
  CheckCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useNotifications } from '../../context/NotificationContext';
import { useToast } from '../../context/ToastContext';
import { useStore } from '../../context/StoreContext';
import { productService } from '../../services/productService';
import { formatINR } from '../../utils/formatters';

const Header = ({ onToggleMobileMenu }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const { user, logout, isAdmin, switchRole } = useAuth();
  const { success } = useToast();
  const { cartCount, openDrawer } = useCart();
  const { wishlistCount } = useWishlist();
  const { notifications = [], unreadCount = 0, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);
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
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-sanitize customer accounts if role was corrupted to vendor or delivery
  useEffect(() => {
    if (
      user &&
      user.email !== 'vendor@casa.in' &&
      user.email !== 'delivery@casa.in' &&
      user.email !== 'admin@casa.in' &&
      (user.role === 'vendor' || user.role === 'delivery' || user.role === 'delivery_partner')
    ) {
      if (switchRole) {
        switchRole('user').catch(() => {});
      }
    }
  }, [user?.email, user?.role, switchRole]);

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
            border-radius: 9999px !important;
            box-shadow: 0 1px 6px rgba(15, 23, 42, 0.06) !important;
            background: #f8fafc !important;
            border: 1.5px solid #e2e8f0 !important;
            overflow: hidden !important;
          }
          .header-search-input {
            padding: 7px 14px !important;
            font-size: 0.84rem !important;
            background: transparent !important;
          }
          .header-search-btn {
            padding: 7px 14px !important;
            border-radius: 9999px !important;
            margin: 2px !important;
          }
        }

        /* User Dropdown Premium Animations & Styling */
        @keyframes userDropdownSlideIn {
          0% {
            opacity: 0;
            transform: translateY(-8px) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .user-dropdown-card {
          animation: userDropdownSlideIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transform-origin: top right;
        }

        .dropdown-menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 9px 12px;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
          cursor: pointer;
        }

        .dropdown-menu-item:hover {
          background: #f1f5f9 !important;
          transform: translateX(4px) !important;
        }

        .dropdown-menu-item:hover .dropdown-menu-arrow {
          transform: translateX(3px) !important;
          color: #1d4ed8 !important;
        }

        .dropdown-menu-arrow {
          color: #94a3b8;
          transition: transform 0.2s ease, color 0.2s ease;
          flex-shrink: 0;
        }

        .dropdown-logout-animated-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 10px 12px;
          border-radius: 12px;
          background: #fef2f2;
          border: 1px solid #fee2e2;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }

        .dropdown-logout-animated-btn:hover {
          background: #fee2e2 !important;
          border-color: #fca5a5 !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 6px 16px -2px rgba(220, 38, 38, 0.2) !important;
        }

        .dropdown-logout-animated-btn:hover .logout-icon-rotate {
          transform: translateX(-3px) scale(1.05) !important;
        }

        .logout-icon-rotate {
          transition: transform 0.2s ease;
        }

        @keyframes pulseDotOnline {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.4);
            opacity: 0.6;
          }
        }

        .user-online-dot {
          display: inline-block;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.25);
          flex-shrink: 0;
          animation: pulseDotOnline 2.2s infinite ease-in-out;
        }
      `}</style>
      <div className="container header-container-responsive" style={headerContainerStyle}>
        {/* Mobile Menu Button */}
        {!isAuthPage && (
          <button
            onClick={onToggleMobileMenu}
            className="header-mobile-menu-btn"
            aria-label="Open Category Navigation"
          >
            <Menu size={24} />
          </button>
        )}

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
          {!isAuthPage && (
            <>
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
            </>
          )}

          {/* Real-Time Live Notification Alerts */}
          {user && (
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={actionItemStyle}
                title="Notifications & Live Alerts"
              >
                <div style={{ position: 'relative' }}>
                  <Bell size={22} />
                  {unreadCount > 0 && (
                    <span style={{
                      ...badgeCountStyle,
                      background: '#ef4444',
                      color: '#ffffff',
                      animation: 'pulse 1.8s infinite'
                    }}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>
                <span className="header-action-label" style={actionLabelStyle}>Alerts</span>
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 12px)',
                  right: '-60px',
                  width: '360px',
                  maxWidth: '90vw',
                  background: '#ffffff',
                  borderRadius: '16px',
                  boxShadow: '0 20px 40px -10px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
                  zIndex: 1000,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#f8fafc'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>Live Alerts</strong>
                      {unreadCount > 0 && (
                        <span style={{
                          background: '#fee2e2',
                          color: '#dc2626',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '12px'
                        }}>
                          {unreadCount} unread
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#2563eb',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <CheckCheck size={14} />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>

                  <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '36px 20px', textAlign: 'center', color: '#94a3b8' }}>
                        <Bell size={32} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#64748b' }}>No notifications yet</div>
                        <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>Real-time order & delivery alerts will appear here.</div>
                      </div>
                    ) : (
                      notifications.slice(0, 15).map((notif) => (
                        <div
                          key={notif._id || notif.id}
                          onClick={() => {
                            if (!notif.isRead && markAsRead) markAsRead(notif._id);
                            if (notif.data?.orderId) {
                              navigate(`/orders/${notif.data.orderId}`);
                              setShowNotifications(false);
                            }
                          }}
                          style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid #f1f5f9',
                            background: notif.isRead ? '#ffffff' : '#f0f9ff',
                            cursor: 'pointer',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'flex-start'
                          }}
                        >
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: notif.isRead ? '#f1f5f9' : '#e0f2fe',
                            color: notif.isRead ? '#64748b' : '#0284c7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {notif.type === 'delivery_alert' || notif.type === 'shipment_dispatch' ? (
                              <Truck size={16} />
                            ) : (
                              <Package size={16} />
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                              <strong style={{ fontSize: '0.825rem', color: '#0f172a' }}>{notif.title}</strong>
                              {!notif.isRead && (
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0284c7', flexShrink: 0 }} />
                              )}
                            </div>
                            <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#475569', lineHeight: 1.4 }}>
                              {notif.message}
                            </p>
                            <span style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                              {notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Direct Vendor Portal Shortcut */}
          {user && (user.role === 'vendor' || user.email === 'vendor@casa.in') && (
            <Link
              to="/vendor"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #1e1e24 0%, #2563eb 100%)',
                color: '#ffffff',
                textDecoration: 'none',
                fontWeight: 800,
                fontSize: '0.78rem',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
              }}
              title="Open CaSa Vendor Dashboard"
            >
              <Store size={15} color="#f59e0b" />
              <span className="header-action-label">Vendor Hub</span>
            </Link>
          )}

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
            {showUserMenu && (() => {
              const isDeliveryUser = Boolean(
                user && (
                  user.email === 'delivery@casa.in' ||
                  user.role === 'delivery' ||
                  user.role === 'delivery_partner' ||
                  (user.name && user.name.toLowerCase().includes('express'))
                )
              );
              const isVendorUser = Boolean(
                user &&
                !isDeliveryUser &&
                (user.role === 'vendor' || user.email === 'vendor@casa.in')
              );
              const isSuperAdminUser = Boolean(user && (user.role === 'super_admin' || user.email === 'casa@admin.com'));
              const isAdminUser = Boolean(isAdmin || user?.email === 'admin@casa.in' || user?.role === 'admin' || isSuperAdminUser);

              return (
                <div style={userDropdownStyle} className="user-dropdown-card">
                  {user ? (
                    <>
                      {/* Premium Profile Header Card */}
                      <div style={dropdownUserHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} style={dropdownAvatarStyle} />
                          ) : (
                            <div style={dropdownAvatarFallback}>
                              {(user.name || 'User')
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <strong style={dropdownUserNameStyle}>{user.name}</strong>
                              <span className="user-online-dot" title="Active Session" />
                            </div>
                            <div style={dropdownUserEmailStyle} title={user.email}>
                              {user.email}
                            </div>
                          </div>
                        </div>

                        {/* Badge strip */}
                        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          {isDeliveryUser ? (
                            <span style={{ ...adminBadgeStyle, background: 'rgba(249, 115, 22, 0.25)', color: '#fed7aa', borderColor: 'rgba(249, 115, 22, 0.4)' }}>
                              <Truck size={11} /> CASA DELIVERY PARTNER
                            </span>
                          ) : isVendorUser ? (
                            <span style={{ ...adminBadgeStyle, background: 'rgba(56, 189, 248, 0.25)', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)' }}>
                              <Store size={11} /> VERIFIED VENDOR
                            </span>
                          ) : isSuperAdminUser ? (
                            <span style={{ ...adminBadgeStyle, background: 'rgba(245, 158, 11, 0.25)', color: '#fef08a', borderColor: 'rgba(245, 158, 11, 0.45)' }}>
                              👑 SUPER ADMIN
                            </span>
                          ) : isAdminUser ? (
                            <span style={adminBadgeStyle}>
                              <Shield size={11} /> ADMINISTRATOR
                            </span>
                          ) : (
                            <span style={shopperBadgeStyle}>
                              <Sparkles size={11} /> CASA MEMBER
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Navigation Menu Links */}
                      <div style={{ padding: '8px' }}>
                        {/* Role-Specific Dashboard Shortcut */}
                        {isDeliveryUser ? (
                          <Link
                            to="/delivery"
                            onClick={() => setShowUserMenu(false)}
                            className="dropdown-menu-item"
                            style={{
                              ...dropdownMenuItemStyle,
                              width: '100%',
                              border: 'none',
                              background: '#ecfdf5',
                              borderRadius: '12px',
                              marginBottom: '6px',
                            }}
                          >
                            <div style={{ ...menuIconBox, background: '#059669', color: '#ffffff' }}>
                              <Truck size={16} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                              <div style={{ ...menuItemTitleStyle, color: '#047857', fontWeight: 800 }}>CaSa Delivery Dashboard</div>
                              <div style={{ ...menuItemSubStyle, color: '#065f46' }}>Active runs, live GPS & earnings</div>
                            </div>
                            <ChevronRight size={14} color="#059669" className="dropdown-menu-arrow" />
                          </Link>
                        ) : isVendorUser ? (
                          <Link
                            to="/vendor"
                            onClick={() => setShowUserMenu(false)}
                            className="dropdown-menu-item"
                            style={{
                              ...dropdownMenuItemStyle,
                              width: '100%',
                              border: 'none',
                              background: '#eff6ff',
                              borderRadius: '12px',
                              marginBottom: '6px',
                            }}
                          >
                            <div style={{ ...menuIconBox, background: '#2563eb', color: '#ffffff' }}>
                              <Store size={16} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                              <div style={{ ...menuItemTitleStyle, color: '#1d4ed8', fontWeight: 800 }}>CaSa Vendor Dashboard</div>
                              <div style={{ ...menuItemSubStyle, color: '#1e40af' }}>Orders, catalog & merchant center</div>
                            </div>
                            <ChevronRight size={14} color="#2563eb" className="dropdown-menu-arrow" />
                          </Link>
                        ) : isSuperAdminUser ? (
                          <Link
                            to="/admin"
                            onClick={() => setShowUserMenu(false)}
                            className="dropdown-menu-item"
                            style={{
                              ...dropdownMenuItemStyle,
                              width: '100%',
                              border: 'none',
                              background: '#0f172a',
                              borderRadius: '12px',
                              marginBottom: '6px',
                            }}
                          >
                            <div style={{ ...menuIconBox, background: '#f59e0b', color: '#0f172a' }}>
                              <Shield size={16} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                              <div style={{ ...menuItemTitleStyle, color: '#fde68a', fontWeight: 800 }}>👑 Super Admin Console</div>
                              <div style={{ ...menuItemSubStyle, color: '#94a3b8' }}>Live store editing & full control</div>
                            </div>
                            <ChevronRight size={14} color="#f59e0b" className="dropdown-menu-arrow" />
                          </Link>
                        ) : isAdminUser ? (
                          <Link
                            to="/admin"
                            onClick={() => setShowUserMenu(false)}
                            className="dropdown-menu-item"
                            style={{
                              ...dropdownMenuItemStyle,
                              width: '100%',
                              border: 'none',
                              background: '#f8fafc',
                              borderRadius: '12px',
                              marginBottom: '6px',
                            }}
                          >
                            <div style={{ ...menuIconBox, background: '#1e293b', color: '#ffffff' }}>
                              <Shield size={16} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                              <div style={{ ...menuItemTitleStyle, color: '#0f172a', fontWeight: 800 }}>CaSa Admin Console</div>
                              <div style={{ ...menuItemSubStyle, color: '#475569' }}>Platform operations & settings</div>
                            </div>
                            <ChevronRight size={14} color="#1e293b" className="dropdown-menu-arrow" />
                          </Link>
                        ) : null}

                      <Link
                        to="/orders"
                        onClick={() => setShowUserMenu(false)}
                        className="dropdown-menu-item"
                        style={dropdownMenuItemStyle}
                      >
                        <div style={{ ...menuIconBox, background: '#fff7ed', color: '#ea580c' }}>
                          <Package size={16} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={menuItemTitleStyle}>My Orders & Purchases</div>
                          <div style={menuItemSubStyle}>View order history & invoices</div>
                        </div>
                        <ChevronRight size={14} className="dropdown-menu-arrow" />
                      </Link>

                      <Link
                        to="/track-order"
                        onClick={() => setShowUserMenu(false)}
                        className="dropdown-menu-item"
                        style={dropdownMenuItemStyle}
                      >
                        <div style={{ ...menuIconBox, background: '#eff6ff', color: '#2563eb' }}>
                          <Truck size={16} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ ...menuItemTitleStyle, color: '#1d4ed8' }}>Live Shipment Tracker</div>
                          <div style={menuItemSubStyle}>Real-time AWB & delivery radar</div>
                        </div>
                        <ChevronRight size={14} className="dropdown-menu-arrow" />
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="dropdown-menu-item"
                        style={dropdownMenuItemStyle}
                      >
                        <div style={{
                          ...menuIconBox,
                          background: isDeliveryUser ? '#ecfdf5' : isVendorUser ? '#eff6ff' : '#f5f3ff',
                          color: isDeliveryUser ? '#059669' : isVendorUser ? '#2563eb' : '#7c3aed'
                        }}>
                          {isDeliveryUser ? <Truck size={16} /> : isVendorUser ? <Store size={16} /> : <UserIcon size={16} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={menuItemTitleStyle}>
                            {isDeliveryUser ? 'CaSa Delivery Partner Profile' : isVendorUser ? 'CaSa Merchant Profile' : 'My Profile & Addresses'}
                          </div>
                          <div style={menuItemSubStyle}>
                            {isDeliveryUser ? 'KYC documents, vehicle & route GPS' : isVendorUser ? 'Store credentials & merchant settings' : 'Personal details & delivery addresses'}
                          </div>
                        </div>
                        <ChevronRight size={14} className="dropdown-menu-arrow" />
                      </Link>

                      <Link
                        to="/wishlist"
                        onClick={() => setShowUserMenu(false)}
                        className="dropdown-menu-item"
                        style={dropdownMenuItemStyle}
                      >
                        <div style={{ ...menuIconBox, background: '#fff1f2', color: '#e11d48' }}>
                          <Heart size={16} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={menuItemTitleStyle}>My Wishlist</div>
                          <div style={menuItemSubStyle}>Saved favorite products</div>
                        </div>
                        {wishlistCount > 0 ? (
                          <span style={menuCountBadgeStyle}>{wishlistCount}</span>
                        ) : (
                          <ChevronRight size={14} className="dropdown-menu-arrow" />
                        )}
                      </Link>
                    </div>

                    <div style={{ padding: '0 8px 8px' }}>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                          success('Logged out successfully.');
                          navigate('/');
                        }}
                        className="dropdown-logout-animated-btn"
                        style={dropdownLogoutBtnStyle}
                      >
                        <div style={{ ...menuIconBox, background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626' }}>
                          <LogOut size={16} className="logout-icon-rotate" />
                        </div>
                        <div style={{ flex: 1, textAlign: 'left' }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#dc2626' }}>
                            Sign Out / Logout
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#ef4444' }}>
                            End current CASA session
                          </div>
                        </div>
                        <ChevronRight size={14} color="#dc2626" className="dropdown-menu-arrow" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ padding: '20px 18px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Sparkles size={20} />
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.95rem', color: '#0f172a', display: 'block' }}>
                          Welcome to CASA
                        </strong>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          Sign in for personalized shopping
                        </span>
                      </div>
                    </div>
                    <Link
                      to="/login"
                      onClick={() => setShowUserMenu(false)}
                      className="btn btn-primary"
                      style={{
                        width: '100%',
                        fontSize: '0.875rem',
                        padding: '10px',
                        borderRadius: '10px',
                        boxShadow: '0 4px 14px rgba(29, 78, 216, 0.28)',
                      }}
                    >
                      Sign In to CASA
                    </Link>
                    <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.8rem', color: '#64748b' }}>
                      New customer?{' '}
                      <Link
                        to="/register"
                        onClick={() => setShowUserMenu(false)}
                        style={{ color: '#1d4ed8', fontWeight: 700 }}
                      >
                        Start here
                      </Link>
                    </div>
                    <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                      <Link
                        to="/track-order"
                        onClick={() => setShowUserMenu(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          color: '#2563eb',
                          textDecoration: 'none',
                          padding: '6px 8px',
                          borderRadius: '8px',
                          background: '#eff6ff',
                        }}
                      >
                        <Truck size={16} color="#2563eb" />
                        <span>🚚 Track Your Order / Shipment</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
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
  width: '300px',
  maxWidth: 'calc(100vw - 24px)',
  background: '#ffffff',
  borderRadius: '20px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.16), 0 0 0 1px rgba(0, 0, 0, 0.03)',
  overflow: 'hidden',
  zIndex: 1000,
};

const dropdownUserHeader = {
  padding: '16px 18px',
  background: 'linear-gradient(135deg, #0a192f 0%, #1e3a8a 100%)',
  color: '#ffffff',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
};

const dropdownAvatarStyle = {
  width: '42px',
  height: '42px',
  borderRadius: '50%',
  objectFit: 'cover',
  border: '2px solid rgba(255, 255, 255, 0.85)',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
};

const dropdownAvatarFallback = {
  width: '42px',
  height: '42px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #2563eb, #38bdf8)',
  color: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '800',
  fontSize: '0.95rem',
  border: '2px solid rgba(255, 255, 255, 0.85)',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
  letterSpacing: '0.04em',
};

const dropdownUserNameStyle = {
  fontSize: '0.975rem',
  fontWeight: '800',
  color: '#ffffff',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: 'block',
};

const dropdownUserEmailStyle = {
  fontSize: '0.75rem',
  color: '#93c5fd',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: 'block',
  marginTop: '2px',
};

const adminBadgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '2px 8px',
  background: 'rgba(219, 234, 254, 0.2)',
  color: '#93c5fd',
  border: '1px solid rgba(147, 197, 253, 0.35)',
  borderRadius: '9999px',
  fontSize: '0.65rem',
  fontWeight: 800,
  letterSpacing: '0.05em',
};

const shopperBadgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '2px 8px',
  background: 'rgba(255, 255, 255, 0.15)',
  color: '#f8fafc',
  border: '1px solid rgba(255, 255, 255, 0.25)',
  borderRadius: '9999px',
  fontSize: '0.65rem',
  fontWeight: 700,
  letterSpacing: '0.04em',
};

const dropdownMenuItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '9px 12px',
  borderRadius: '12px',
  textDecoration: 'none',
  color: '#1e293b',
  cursor: 'pointer',
};

const menuIconBox = {
  width: '34px',
  height: '34px',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const menuItemTitleStyle = {
  fontSize: '0.85rem',
  fontWeight: '700',
  color: '#0f172a',
  lineHeight: 1.2,
};

const menuItemSubStyle = {
  fontSize: '0.7rem',
  color: '#64748b',
  marginTop: '2px',
};

const menuCountBadgeStyle = {
  padding: '2px 7px',
  borderRadius: '9999px',
  background: '#eff6ff',
  color: '#1d4ed8',
  fontSize: '0.72rem',
  fontWeight: '800',
  border: '1px solid #bfdbfe',
};

const dropdownLogoutBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  width: '100%',
  padding: '9px 12px',
  borderRadius: '12px',
  background: '#fef2f2',
  border: '1px solid #fee2e2',
  cursor: 'pointer',
};

export default Header;
