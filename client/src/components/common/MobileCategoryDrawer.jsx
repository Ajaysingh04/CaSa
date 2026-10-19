import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronDown, ChevronRight, User, Package, Heart, Shield, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MobileCategoryDrawer = ({ isOpen, onClose, categories = [] }) => {
  const { user, isAdmin, logout } = useAuth();
  const [expandedCat, setExpandedCat] = useState(null);

  if (!isOpen) return null;

  const toggleExpand = (catId) => {
    setExpandedCat(expandedCat === catId ? null : catId);
  };

  return (
    <div style={overlayStyle}>
      <div style={backdropStyle} onClick={onClose} />
      <div style={drawerStyle} className="animate-slide-up">
        {/* User Header */}
        <div style={userHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={avatarCircle}>
              <User size={20} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                {user ? user.name : 'Hello, Guest'}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#93c5fd' }}>
                {user ? user.email : 'Sign in for best shopping experience'}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={closeBtn} aria-label="Close menu">
            <X size={22} color="#ffffff" />
          </button>
        </div>

        {/* Quick User Links */}
        <div style={quickLinksStyle}>
          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin" onClick={onClose} style={quickLinkItem}>
                  <Shield size={16} color="#1d4ed8" /> Admin Panel
                </Link>
              )}
              <Link to="/orders" onClick={onClose} style={quickLinkItem}>
                <Package size={16} /> My Orders
              </Link>
              <Link to="/wishlist" onClick={onClose} style={quickLinkItem}>
                <Heart size={16} /> Wishlist
              </Link>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <Link
                to="/login"
                onClick={onClose}
                className="btn btn-primary btn-sm"
                style={{ flex: 1 }}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={onClose}
                className="btn btn-outline btn-sm"
                style={{ flex: 1 }}
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Categories Section */}
        <div style={categoriesContainerStyle}>
          <div style={sectionTitleStyle}>Shop by Department (15 Categories)</div>
          <div style={categoriesListStyle}>
            {categories.map((cat) => {
              const isExpanded = expandedCat === cat._id;
              const hasSubs = cat.subcategories && cat.subcategories.length > 0;

              return (
                <div key={cat._id} style={categoryItemRow}>
                  <div style={categoryItemHeader}>
                    <Link
                      to={`/category/${cat.slug}`}
                      onClick={onClose}
                      style={categoryLinkText}
                    >
                      <ShoppingBag size={16} color="#1d4ed8" />
                      <span>{cat.name}</span>
                    </Link>
                    {hasSubs && (
                      <button
                        onClick={() => toggleExpand(cat._id)}
                        style={expandBtnStyle}
                        aria-label="Toggle subcategories"
                      >
                        <ChevronDown
                          size={18}
                          style={{
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s',
                          }}
                        />
                      </button>
                    )}
                  </div>

                  {/* Subcategories */}
                  {isExpanded && hasSubs && (
                    <div style={subcategoriesDrawerList}>
                      {cat.subcategories.map((sub) => (
                        <Link
                          key={sub.slug}
                          to={`/category/${cat.slug}?subcategory=${encodeURIComponent(sub.name)}`}
                          onClick={onClose}
                          style={subcategoryDrawerLink}
                        >
                          <ChevronRight size={14} color="#94a3b8" />
                          <span>{sub.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info in drawer */}
        {user && (
          <div style={drawerFooterStyle}>
            <button
              onClick={() => {
                onClose();
                logout();
              }}
              style={logoutBtnStyle}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: 2000,
  display: 'flex',
};

const backdropStyle = {
  position: 'absolute',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.5)',
  backdropFilter: 'blur(2px)',
};

const drawerStyle = {
  position: 'relative',
  width: '85%',
  maxWidth: '340px',
  height: '100%',
  background: '#ffffff',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '4px 0 24px rgba(0,0,0,0.2)',
  zIndex: 1,
};

const userHeaderStyle = {
  background: 'linear-gradient(135deg, #0a192f 0%, #1e3a8a 100%)',
  padding: '20px 16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const avatarCircle = {
  width: '38px',
  height: '38px',
  borderRadius: '50%',
  background: 'rgba(255,255,255,0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const closeBtn = {
  background: 'none',
  border: 'none',
  padding: '4px',
  cursor: 'pointer',
};

const quickLinksStyle = {
  padding: '12px 16px',
  background: '#f8fafc',
  borderBottom: '1px solid #e2e8f0',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  flexWrap: 'wrap',
};

const quickLinkItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '0.825rem',
  fontWeight: '600',
  color: '#334155',
  textDecoration: 'none',
};

const categoriesContainerStyle = {
  flex: 1,
  overflowY: 'auto',
  padding: '16px',
};

const sectionTitleStyle = {
  fontSize: '0.75rem',
  fontWeight: '800',
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '12px',
};

const categoriesListStyle = {
  display: 'flex',
  flexDirection: 'column',
};

const categoryItemRow = {
  borderBottom: '1px solid #f1f5f9',
};

const categoryItemHeader = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 0',
};

const categoryLinkText = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontSize: '0.9rem',
  fontWeight: '600',
  color: '#0f172a',
  textDecoration: 'none',
  flex: 1,
};

const expandBtnStyle = {
  padding: '4px 8px',
  color: '#64748b',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
};

const subcategoriesDrawerList = {
  padding: '4px 0 8px 24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  background: '#f8fafc',
  borderRadius: '6px',
  marginBottom: '6px',
};

const subcategoryDrawerLink = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '0.825rem',
  color: '#475569',
  padding: '4px 0',
  textDecoration: 'none',
};

const drawerFooterStyle = {
  padding: '16px',
  borderTop: '1px solid #e2e8f0',
  background: '#f8fafc',
};

const logoutBtnStyle = {
  width: '100%',
  padding: '8px',
  fontSize: '0.85rem',
  fontWeight: '600',
  color: '#dc2626',
  background: 'none',
  border: 'none',
  textAlign: 'center',
  cursor: 'pointer',
};

export default MobileCategoryDrawer;
