import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Plus, LayoutDashboard, Sliders, X, Eye, Sparkles, ChevronUp, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SuperAdminEditModal from './SuperAdminEditModal';

const SuperAdminStoreToolbar = () => {
  const location = useLocation();
  const { isSuperAdmin, user } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [highlightEditable, setHighlightEditable] = useState(true);

  // Listen to open-editor events triggered from any ProductCard or page
  useEffect(() => {
    const handleOpenEditor = (e) => {
      setProductToEdit(e.detail || null);
      setIsEditorOpen(true);
    };
    window.addEventListener('casa:open-product-editor', handleOpenEditor);
    return () => window.removeEventListener('casa:open-product-editor', handleOpenEditor);
  }, []);

  // Toggle edit outlines on products across DOM
  useEffect(() => {
    if (highlightEditable) {
      document.body.classList.add('super-admin-highlight-active');
    } else {
      document.body.classList.remove('super-admin-highlight-active');
    }
    return () => document.body.classList.remove('super-admin-highlight-active');
  }, [highlightEditable]);

  // Only active for Super Admin on customer storefront (not in /admin)
  if (!isSuperAdmin || location.pathname.startsWith('/admin')) {
    return null;
  }

  const handleCreateNew = () => {
    setProductToEdit(null);
    setIsEditorOpen(true);
  };

  return (
    <>
      <style>{`
        body.super-admin-highlight-active .card.card-hover-interactive {
          outline: 2px dashed rgba(245, 158, 11, 0.45);
          outline-offset: 3px;
          transition: outline-color 0.2s ease;
        }
        body.super-admin-highlight-active .card.card-hover-interactive:hover {
          outline: 2.5px solid #f59e0b;
        }
        .super-admin-floating-dock {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          font-family: inherit;
          animation: slideUpFade 0.3s ease-out;
        }
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 640px) {
          .super-admin-floating-dock {
            bottom: 16px;
            right: 12px;
            left: 12px;
          }
        }
      `}</style>

      {/* Floating Super Admin Bar */}
      <div className="super-admin-floating-dock">
        {isOpen ? (
          <div style={toolbarBox}>
            {/* Header / Brand strip */}
            <div style={toolbarHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.05rem' }}>👑</span>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.01em' }}>
                    SUPER ADMIN LIVE STORE EDITOR
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                    Active Root User: <strong style={{ color: '#fde68a' }}>{user?.email}</strong>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={collapseBtn}
                title="Minimize Super Admin Bar"
              >
                <ChevronDown size={16} />
              </button>
            </div>

            {/* Quick Actions Row */}
            <div style={actionsRow}>
              <button
                type="button"
                onClick={handleCreateNew}
                style={actionPrimaryBtn}
                title="Add a new product directly into the live store"
              >
                <Plus size={15} />
                <span>+ Add Product (Live)</span>
              </button>

              <Link
                to="/admin"
                style={actionSecondaryBtn}
                title="Open Administrative Master Console"
              >
                <LayoutDashboard size={14} />
                <span>Admin Console</span>
              </Link>

              <button
                type="button"
                onClick={() => setHighlightEditable(!highlightEditable)}
                style={{
                  ...actionSecondaryBtn,
                  background: highlightEditable ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                  borderColor: highlightEditable ? '#f59e0b' : 'rgba(255, 255, 255, 0.15)',
                  color: highlightEditable ? '#fef08a' : '#cbd5e1',
                }}
                title="Highlight all editable products on page"
              >
                <Sparkles size={14} color={highlightEditable ? '#f59e0b' : '#94a3b8'} />
                <span>{highlightEditable ? 'Outlines ON' : 'Outlines OFF'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Minimized pill */
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            style={minimizedPill}
            title="Expand Super Admin Storefront Controls"
          >
            <span>👑</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 800 }}>Super Admin Controls</span>
            <ChevronUp size={15} />
          </button>
        )}
      </div>

      {/* Dedicated Super Admin Edit Modal */}
      <SuperAdminEditModal
        isOpen={isEditorOpen}
        product={productToEdit}
        onClose={() => setIsEditorOpen(false)}
      />
    </>
  );
};

/* Styles */
const toolbarBox = {
  background: '#0f172a',
  borderRadius: '16px',
  border: '1.5px solid rgba(245, 158, 11, 0.5)',
  boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.5), 0 0 15px rgba(245, 158, 11, 0.25)',
  padding: '12px 16px',
  minWidth: '320px',
  maxWidth: '480px',
  boxSizing: 'border-box',
};

const toolbarHeader = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingBottom: '10px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  marginBottom: '10px',
};

const collapseBtn = {
  background: 'rgba(255, 255, 255, 0.1)',
  border: 'none',
  borderRadius: '6px',
  color: '#94a3b8',
  padding: '4px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const actionsRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flexWrap: 'wrap',
};

const actionPrimaryBtn = {
  background: '#f59e0b',
  color: '#0f172a',
  border: 'none',
  padding: '7px 14px',
  borderRadius: '8px',
  fontSize: '0.78rem',
  fontWeight: 900,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)',
};

const actionSecondaryBtn = {
  background: 'rgba(255, 255, 255, 0.08)',
  color: '#f1f5f9',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  padding: '7px 12px',
  borderRadius: '8px',
  fontSize: '0.76rem',
  fontWeight: 700,
  textDecoration: 'none',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
};

const minimizedPill = {
  background: '#0f172a',
  color: '#f8fafc',
  border: '1.5px solid #f59e0b',
  borderRadius: '9999px',
  padding: '8px 16px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 0 10px rgba(245, 158, 11, 0.3)',
};

export default SuperAdminStoreToolbar;
