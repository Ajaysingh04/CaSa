import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Store, Truck, Sparkles, ChevronDown, ChevronUp, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const DemoFlowQuickSwitcher = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login } = useAuth();
  const { success } = useToast();
  const [collapsed, setCollapsed] = useState(true);
  const [switching, setSwitching] = useState(false);

  // Determine current active persona
  let activeRole = 'guest';
  if (user) {
    if (user.role === 'vendor' || user.email === 'vendor@casa.in') activeRole = 'vendor';
    else if (user.role === 'delivery' || user.role === 'delivery_partner' || user.email === 'delivery@casa.in') activeRole = 'delivery';
    else if (user.role === 'admin' || user.role === 'super_admin' || user.email === 'admin@casa.in') activeRole = 'admin';
    else activeRole = 'customer';
  }

  const handleQuickSwitch = async (role) => {
    if (switching) return;
    setSwitching(true);

    let creds = { email: 'rajesh@casa.in', password: 'User@Casa2026', path: '/orders' };
    if (role === 'vendor') {
      creds = { email: 'vendor@casa.in', password: 'Vendor@Casa2026', path: '/vendor' };
    } else if (role === 'delivery') {
      creds = { email: 'delivery@casa.in', password: 'Delivery@Casa2026', path: '/delivery' };
    }

    try {
      const res = await login({ email: creds.email, password: creds.password });
      if (res.success) {
        success(`Switched to Demo ${role.toUpperCase()} persona!`);
        navigate(creds.path);
      }
    } catch {
      // fallback navigate
      navigate(creds.path);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '18px',
        right: '18px',
        zIndex: 9990,
        fontFamily: 'inherit',
        maxWidth: 'calc(100vw - 36px)'
      }}
    >
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.94)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: collapsed ? '9999px' : '20px',
          padding: collapsed ? '8px 16px' : '16px 18px',
          boxShadow: '0 12px 35px rgba(0, 0, 0, 0.35)',
          color: '#ffffff',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          minWidth: collapsed ? 'auto' : '320px',
          boxSizing: 'border-box'
        }}
      >
        {/* Header / Toggle button */}
        <div
          onClick={() => setCollapsed(!collapsed)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 8px #10b981',
                display: 'inline-block'
              }}
            />
            <span style={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#93c5fd' }}>
              ⚡ Demo Flow Switcher
            </span>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: '6px',
                background: activeRole === 'vendor' ? '#14532d' : activeRole === 'delivery' ? '#075985' : '#1e3a8a',
                color: activeRole === 'vendor' ? '#86efac' : activeRole === 'delivery' ? '#7dd3fc' : '#bfdbfe'
              }}
            >
              {activeRole.toUpperCase()}
            </span>
          </div>

          <button
            type="button"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: 0
            }}
          >
            {collapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Expanded Body: 1-Click Persona Switches & Flow Guide */}
        {!collapsed && (
          <div style={{ marginTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '12px' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '10px', lineHeight: 1.4 }}>
              Test end-to-end booking dispatch & delivery OTP handover in 1 click:
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {/* Persona 1: Customer */}
              <button
                type="button"
                disabled={switching}
                onClick={() => handleQuickSwitch('customer')}
                style={{
                  background: activeRole === 'customer' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'rgba(255, 255, 255, 0.08)',
                  border: activeRole === 'customer' ? '1px solid #60a5fa' : '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  padding: '10px 8px',
                  color: '#ffffff',
                  cursor: switching ? 'wait' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease'
                }}
              >
                <User size={16} color={activeRole === 'customer' ? '#ffffff' : '#93c5fd'} />
                <span style={{ fontSize: '0.74rem', fontWeight: 800 }}>1. User</span>
                <span style={{ fontSize: '0.62rem', color: '#cbd5e1' }}>Book & OTP</span>
              </button>

              {/* Persona 2: Vendor */}
              <button
                type="button"
                disabled={switching}
                onClick={() => handleQuickSwitch('vendor')}
                style={{
                  background: activeRole === 'vendor' ? 'linear-gradient(135deg, #16a34a, #15803d)' : 'rgba(255, 255, 255, 0.08)',
                  border: activeRole === 'vendor' ? '1px solid #4ade80' : '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  padding: '10px 8px',
                  color: '#ffffff',
                  cursor: switching ? 'wait' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease'
                }}
              >
                <Store size={16} color={activeRole === 'vendor' ? '#ffffff' : '#86efac'} />
                <span style={{ fontSize: '0.74rem', fontWeight: 800 }}>2. Vendor</span>
                <span style={{ fontSize: '0.62rem', color: '#cbd5e1' }}>Accept (No OTP)</span>
              </button>

              {/* Persona 3: Delivery */}
              <button
                type="button"
                disabled={switching}
                onClick={() => handleQuickSwitch('delivery')}
                style={{
                  background: activeRole === 'delivery' ? 'linear-gradient(135deg, #0284c7, #0369a1)' : 'rgba(255, 255, 255, 0.08)',
                  border: activeRole === 'delivery' ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  padding: '10px 8px',
                  color: '#ffffff',
                  cursor: switching ? 'wait' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease'
                }}
              >
                <Truck size={16} color={activeRole === 'delivery' ? '#ffffff' : '#7dd3fc'} />
                <span style={{ fontSize: '0.74rem', fontWeight: 800 }}>3. Delivery</span>
                <span style={{ fontSize: '0.62rem', color: '#cbd5e1' }}>Arrive & Verify</span>
              </button>
            </div>

            {/* Quick Flow Hint */}
            <div
              style={{
                marginTop: '10px',
                padding: '6px 10px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                fontSize: '0.68rem',
                color: '#cbd5e1',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Sparkles size={12} color="#fbbf24" />
              <span>Flow: User Books ➔ Vendor Accepts ➔ Delivery Arrives ➔ OTP ➔ Feedback</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoFlowQuickSwitcher;
