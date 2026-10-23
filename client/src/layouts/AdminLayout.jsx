import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  BarChart3,
  Settings,
  ArrowLeft,
  Shield,
  LogOut,
  ChevronDown,
  Layers,
  Tag,
  Menu,
  X,
  Store,
  Truck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, isSuperAdmin, isDemoAdmin, login, logout, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [autoLoggingDemo, setAutoLoggingDemo] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // When /admin is opened directly without an active session, auto-open Demo Admin!
  useEffect(() => {
    if (!loading && !user && !autoLoggingDemo) {
      setAutoLoggingDemo(true);
      login({ email: 'admin@casa.in', password: 'Admin@Casa2026' })
        .catch((err) => {
          console.warn('Auto demo admin fallback:', err);
        })
        .finally(() => {
          setAutoLoggingDemo(false);
        });
    }
  }, [loading, user, autoLoggingDemo, login]);

  if (loading || autoLoggingDemo) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
        <div className="spin-animation" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#0f172a' }} />
        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#334155' }}>
          Opening CASA Admin Console...
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="container" style={{ padding: '80px 16px', maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ background: '#ffffff', borderRadius: '24px', border: '1px solid #fee2e2', padding: '40px 24px', boxShadow: '0 20px 40px -15px rgba(220, 38, 38, 0.12)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Shield size={36} />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, marginTop: '0', color: '#0f172a' }}>
            CASA Admin Console
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '8px', lineHeight: 1.55 }}>
            Master Administrative portal for platform governance, catalog approvals, coupon management, and revenue analytics.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '24px' }}>
            <button
              type="button"
              onClick={() => login({ email: 'admin@casa.in', password: 'Admin@Casa2026' })}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Open Demo Admin Console →
            </button>
            <Link to="/login?redirect=/admin" className="btn btn-outline btn-md" style={{ width: '100%', justifyContent: 'center' }}>
              Sign In with Super Admin Credentials
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // All Admin Options with Dashboard at the very top of the Left Menu
  const navTabs = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Products', path: '/admin/products', icon: ShoppingBag },
    { label: 'Orders', path: '/admin/orders', icon: Package },
    { label: 'Categories', path: '/admin/categories', icon: Layers },
    { label: 'Customers', path: '/admin/users?role=user', icon: Users },
    { label: 'Vendors & Stores', path: '/admin/users?role=vendor', icon: Store },
    { label: 'Delivery Fleet', path: '/admin/users?role=delivery', icon: Truck },
    { label: 'Coupons & Deals', path: '/admin/coupons', icon: Tag },
    { label: 'Store & Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div style={adminWrapper}>
      <style>{`
        /* Custom slim scrollbar for admin sidebar and right content */
        .admin-sidebar-desktop::-webkit-scrollbar,
        .admin-right-content::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .admin-sidebar-desktop::-webkit-scrollbar-track,
        .admin-right-content::-webkit-scrollbar-track {
          background: transparent;
        }
        .admin-sidebar-desktop::-webkit-scrollbar-thumb,
        .admin-right-content::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 9999px;
        }
        .admin-sidebar-desktop::-webkit-scrollbar-thumb:hover,
        .admin-right-content::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Responsive adjustments */
        @media (max-width: 1024px) {
          .admin-sidebar-desktop {
            position: fixed !important;
            top: 0 !important;
            bottom: 0 !important;
            left: 0 !important;
            transform: translateX(-100%);
            transition: transform 0.22s ease-in-out;
            z-index: 100 !important;
            box-shadow: 10px 0 30px rgba(0,0,0,0.15) !important;
          }
          .admin-sidebar-desktop.mobile-open {
            transform: translateX(0) !important;
          }
          .admin-mobile-backdrop {
            display: block !important;
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.45);
            backdrop-filter: blur(3px);
            z-index: 95;
          }
          .admin-mobile-menu-btn {
            display: flex !important;
          }
        }
        @media (min-width: 1025px) {
          .admin-mobile-backdrop {
            display: none !important;
          }
          .admin-mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="admin-mobile-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ================= LEFT SIDEBAR ================= */}
      <aside className={`admin-sidebar-desktop ${isMobileMenuOpen ? 'mobile-open' : ''}`} style={sidebarStyle}>
        <div>
          {/* Logo Brand Header */}
          <div style={sidebarHeader}>
            <Link to="/admin" style={logoStyle}>
              <div style={logoIcon}>C</div>
              <span style={logoText}>CASA Console</span>
            </Link>

            {isMobileMenuOpen && (
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                style={closeBtnStyle}
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Vertical Navigation Items (Dashboard at top, options below) */}
          <nav style={sidebarNavGroup}>
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const currentFullPath = location.pathname + location.search;
              const isActive =
                tab.path === '/admin'
                  ? location.pathname === '/admin'
                  : tab.path.includes('?')
                    ? currentFullPath === tab.path
                    : location.pathname === tab.path;

              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  style={{
                    ...navTabItem,
                    color: isActive ? '#0f172a' : '#64748b',
                    background: isActive ? '#f1f5f9' : 'transparent',
                    fontWeight: isActive ? 700 : 500,
                  }}
                >
                  <Icon size={18} color={isActive ? '#2563eb' : '#64748b'} />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Back to Store */}
        <div style={sidebarFooter}>
          <Link to="/" style={storefrontSidebarBtn}>
            <ArrowLeft size={14} /> Back to Store
          </Link>
        </div>
      </aside>

      {/* ================= RIGHT MAIN AREA ================= */}
      <div className="admin-right-content" style={rightContentWrapper}>
        {/* Top Navbar */}
        <header style={adminHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              className="admin-mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(true)}
              style={mobileToggleBtn}
            >
              <Menu size={20} />
            </button>
            <div style={headerTitleStyle}>Admin Portal</div>
          </div>

          {/* User Profile & Actions in Top Row */}
          <div style={headerRight}>
            <div style={adminUserPill}>
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={user?.name || 'Admin'}
                style={adminAvatar}
              />
              <span style={adminUserName}>{user?.name ? user.name.split(' ')[0] : 'Admin'}</span>
              {isSuperAdmin ? (
                <span style={{ background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 900, border: '1px solid #fde68a', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  👑 SUPER ADMIN
                </span>
              ) : (
                <span style={{ background: '#f1f5f9', color: '#334155', padding: '2px 7px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 800, border: '1px solid #e2e8f0' }}>
                  ADMIN
                </span>
              )}
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                style={logoutIconBtn}
                title="Sign Out"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Viewport */}
        <main style={mainContentArea}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

/* Styles - Exact original design preserved */
const adminWrapper = {
  height: '100vh',
  maxHeight: '100vh',
  overflow: 'hidden',
  background: '#f8fafc',
  display: 'flex',
  width: '100%',
};

const sidebarStyle = {
  width: '240px',
  minWidth: '240px',
  background: '#ffffff',
  borderRight: '1.5px solid #e2e8f0',
  height: '100vh',
  maxHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: '16px 14px',
  boxSizing: 'border-box',
  overflowY: 'auto',
  flexShrink: 0,
  zIndex: 90,
};

const sidebarHeader = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '6px 8px 20px',
  borderBottom: '1px solid #f1f5f9',
  marginBottom: '16px',
};

const logoStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  textDecoration: 'none',
};

const logoIcon = {
  width: '34px',
  height: '34px',
  borderRadius: '10px',
  background: '#0f172a',
  color: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 800,
  fontSize: '1.1rem',
};

const logoText = {
  fontSize: '1.12rem',
  fontWeight: 800,
  color: '#0f172a',
  letterSpacing: '-0.02em',
};

const closeBtnStyle = {
  background: '#f1f5f9',
  border: 'none',
  borderRadius: '8px',
  padding: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: '#64748b',
};

const sidebarNavGroup = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const navTabItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '9px 12px',
  borderRadius: '9px',
  fontSize: '0.86rem',
  textDecoration: 'none',
  transition: 'all 0.15s',
};

const sidebarFooter = {
  paddingTop: '16px',
  borderTop: '1px solid #f1f5f9',
};

const storefrontSidebarBtn = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: '#2563eb',
  fontSize: '0.82rem',
  fontWeight: 700,
  textDecoration: 'none',
  padding: '8px 12px',
  borderRadius: '8px',
  background: '#eff6ff',
};

const rightContentWrapper = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  height: '100vh',
  maxHeight: '100vh',
  overflowY: 'auto',
  overflowX: 'hidden',
  background: '#f8fafc',
  position: 'relative',
};

const adminHeaderStyle = {
  background: '#ffffff',
  borderBottom: '1.5px solid #e2e8f0',
  padding: '12px 32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'sticky',
  top: 0,
  zIndex: 80,
  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
  flexShrink: 0,
};

const headerTitleStyle = {
  fontSize: '0.92rem',
  fontWeight: 700,
  color: '#64748b',
};

const mobileToggleBtn = {
  background: '#f1f5f9',
  border: 'none',
  borderRadius: '8px',
  padding: '6px',
  cursor: 'pointer',
  display: 'none',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#0f172a',
};

const headerRight = {
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
};

const storefrontBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 14px',
  borderRadius: '9999px',
  background: '#f1f5f9',
  color: '#334155',
  fontSize: '0.8rem',
  fontWeight: 600,
  textDecoration: 'none',
};

const adminUserPill = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '4px 8px 4px 4px',
  borderRadius: '9999px',
  border: '1.5px solid #e2e8f0',
  background: '#ffffff',
};

const adminAvatar = {
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  objectFit: 'cover',
};

const adminUserName = {
  fontSize: '0.8rem',
  fontWeight: 700,
  color: '#0f172a',
};

const logoutIconBtn = {
  background: 'none',
  border: 'none',
  color: '#ef4444',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  padding: '2px',
};

const mainContentArea = {
  flex: 1,
  padding: '28px 32px 60px',
  maxWidth: '1440px',
  width: '100%',
  margin: '0 auto',
  boxSizing: 'border-box',
};

export default AdminLayout;
