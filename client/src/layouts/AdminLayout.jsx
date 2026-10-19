import React from 'react';
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
  Image,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();

  if (!user || !isAdmin) {
    return (
      <div className="container" style={{ padding: '80px 16px', maxWidth: '480px', textAlign: 'center' }}>
        <Shield size={48} color="#dc2626" />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '16px', color: '#0f172a' }}>
          Restricted Admin Access
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '8px' }}>
          You must be logged in as an administrator to access the CASA Management Console.
        </p>
        <Link to="/login" className="btn btn-primary" style={{ marginTop: '20px' }}>
          Login as Admin
        </Link>
      </div>
    );
  }

  const navTabs = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Products', path: '/admin/products', icon: ShoppingBag },
    { label: 'Orders', path: '/admin/orders', icon: Package },
    { label: 'Categories', path: '/admin/categories', icon: Layers },
    { label: 'Customers', path: '/admin/users', icon: Users },
    { label: 'Coupons & Deals', path: '/admin/coupons', icon: Tag },
    { label: 'Store & Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div style={adminWrapper}>
      <style>{`
        .admin-header-responsive {
          background: #ffffff;
          border-bottom: 1.5px solid #e2e8f0;
          padding: 12px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 90;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
        }
        .admin-header-top-row {
          display: flex;
          align-items: center;
          gap: 32px;
        }
        @media (max-width: 1024px) {
          .admin-header-responsive {
            padding: 10px 14px !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
          }
          .admin-header-top-row {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            width: 100% !important;
            gap: 12px !important;
          }
          .admin-nav-tabs-responsive {
            width: 100% !important;
            overflow-x: auto !important;
            padding-bottom: 3px !important;
            -webkit-overflow-scrolling: touch !important;
          }
          .admin-main-viewport {
            padding: 16px 12px 40px !important;
          }
        }
      `}</style>
      {/* Top Navbar */}
      <header className="admin-header-responsive">
        <div className="admin-header-top-row">
          <Link to="/admin" style={logoStyle}>
            <div style={logoIcon}>C</div>
            <span style={logoText}>CASA Console</span>
          </Link>

          {/* User Profile & Actions on Mobile are placed here in top row */}
          <div className="admin-mobile-user-row" style={headerRight}>
            <Link to="/" style={storefrontBtn} title="View public website">
              <ArrowLeft size={14} /> <span className="header-action-label">Store</span>
            </Link>

            <div style={adminUserPill}>
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={user.name}
                style={adminAvatar}
              />
              <span style={adminUserName}>{user.name.split(' ')[0]}</span>
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
        </div>

        {/* Navigation Tabs (Image 4 Style - Scrollable on mobile, inline on desktop) */}
        <nav className="admin-nav-tabs-responsive" style={navTabsGroup}>
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path;

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
                <Icon size={16} color={isActive ? '#2563eb' : '#64748b'} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Main Content Viewport */}
      <main className="admin-main-viewport" style={mainContentArea}>
        <Outlet />
      </main>
    </div>
  );
};

/* Styles */
const adminWrapper = {
  minHeight: '100vh',
  background: '#f8fafc',
  display: 'flex',
  flexDirection: 'column',
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
  zIndex: 90,
  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
};

const headerLeft = {
  display: 'flex',
  alignItems: 'center',
  gap: '32px',
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
  fontSize: '1.15rem',
  fontWeight: 800,
  color: '#0f172a',
  letterSpacing: '-0.02em',
};

const navTabsGroup = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  overflowX: 'auto',
  scrollbarWidth: 'none',
  flexWrap: 'nowrap',
  minWidth: 0,
};

const navTabItem = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '7px 11px',
  borderRadius: '9px',
  fontSize: '0.825rem',
  textDecoration: 'none',
  transition: 'all 0.15s',
  whiteSpace: 'nowrap',
  flexShrink: 0,
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
};

export default AdminLayout;
