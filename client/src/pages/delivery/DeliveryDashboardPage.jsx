import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Truck, Sparkles, AlertCircle, LogOut, ShieldCheck, MapPin, Radio } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import ProfessionalDeliveryProfile from '../../components/profile/ProfessionalDeliveryProfile';

const DeliveryDashboardPage = () => {
  const navigate = useNavigate();
  const { user, switchRole, logout } = useAuth();
  const { success, error } = useToast();

  const effectiveUser = user || {
    name: 'Vikram Singh Express',
    email: 'delivery@casa.in',
    role: 'delivery',
    phone: '+91 9826012345',
    assignedZone: 'Central Indore Hub - Zone 1',
    vehicleType: 'TVS Apache 160 (MP-09-XX-4412)',
    rating: 4.94
  };

  const handleDeliveryLogout = async () => {
    try {
      await logout();
      success('Logged out successfully from Delivery Partner workstation.');
      navigate('/login', { replace: true });
    } catch {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#f4f6fa', padding: '0 0 60px' }}>
      {/* DEDICATED STANDALONE DELIVERY PARTNER TOPBAR (ZERO STORE LINKS) */}
      <header
        style={{
          background: '#064e3b',
          borderBottom: '1px solid #047857',
          padding: '12px 20px',
          boxShadow: '0 4px 16px rgba(6, 78, 59, 0.2)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Brand & Fleet Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              }}
            >
              <Truck size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>
                  CaSa <span style={{ color: '#34d399' }}>Fleet</span>
                </span>
                <span
                  style={{
                    background: 'rgba(52, 211, 153, 0.2)',
                    color: '#a7f3d0',
                    border: '1px solid rgba(52, 211, 153, 0.35)',
                    padding: '1px 7px',
                    borderRadius: '6px',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                  }}
                >
                  COURIER DISPATCH
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#a7f3d0', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <MapPin size={11} color="#34d399" />
                <span>Indore Central Logistics Hub (Zone 1)</span>
              </div>
            </div>
          </div>

          {/* Center Status Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(0, 0, 0, 0.25)',
              padding: '6px 14px',
              borderRadius: '9999px',
              border: '1px solid rgba(52, 211, 153, 0.25)',
              fontSize: '0.74rem',
              color: '#d1fae5',
              fontWeight: 700,
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#34d399',
                display: 'inline-block',
                boxShadow: '0 0 8px #34d399',
              }}
            />
            <span>Live GPS Radar & Courier Routing Online</span>
          </div>

          {/* Right: Rider Persona & Sign Out */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user ? (
              <>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffffff' }}>
                    {user.name}
                  </div>
                  <span
                    style={{
                      fontSize: '0.66rem',
                      color: '#a7f3d0',
                      fontWeight: 700,
                    }}
                  >
                    Rider ID: CASA-9024
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleDeliveryLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#fca5a5',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  title="Sign out of Delivery Partner console"
                >
                  <LogOut size={14} />
                  <span>Sign out</span>
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: '#a7f3d0', fontWeight: 700, background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '6px' }}>
                  Demo Mode
                </span>
                <Link
                  to="/login?redirect=/delivery"
                  style={{
                    background: '#10b981',
                    color: '#ffffff',
                    textDecoration: 'none',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.76rem',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  Rider Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Demo viewer banner when not signed in */}
      {!user && (
        <div style={{ maxWidth: '1240px', margin: '16px auto 0', padding: '0 16px', boxSizing: 'border-box' }}>
          <div
            style={{
              background: '#eff6ff',
              border: '1.5px solid #bfdbfe',
              borderRadius: '14px',
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Truck size={18} color="#2563eb" />
              <div style={{ fontSize: '0.85rem', color: '#1e40af' }}>
                <strong>Viewing CaSa Delivery Workstation:</strong> Live active runs, GPS navigation, OTP verify and hub queues are active in demo mode.
              </div>
            </div>
            <Link
              to="/login?redirect=/delivery"
              style={{
                background: '#2563eb',
                color: '#ffffff',
                textDecoration: 'none',
                padding: '6px 14px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.78rem',
              }}
            >
              Sign In to Save
            </Link>
          </div>
        </div>
      )}

      {/* Non-delivery role warning banner with 1-click switch */}
      {user && user.role !== 'delivery' && user.role !== 'admin' && (
        <div style={{ maxWidth: '1240px', margin: '0 auto 16px', padding: '0 16px', boxSizing: 'border-box' }}>
          <div
            style={{
              background: '#fffbeb',
              border: '1.5px solid #fde68a',
              borderRadius: '14px',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={20} color="#d97706" />
              <div>
                <strong style={{ color: '#92400e', fontSize: '0.9rem' }}>
                  Logged in as: {user.name} ({user.role?.toUpperCase() || 'USER'})
                </strong>
                <div style={{ color: '#b45309', fontSize: '0.8rem' }}>
                  Switch your account role to Delivery Partner to accept packages and execute delivery runs.
                </div>
              </div>
            </div>
            <button
              onClick={async () => {
                await switchRole('delivery');
                success('Switched to Delivery Partner persona!');
              }}
              style={{
                background: '#d97706',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              ⚡ Switch to Delivery Partner (1-Click)
            </button>
          </div>
        </div>
      )}

      {/* Full-featured Professional Delivery Partner Workstation */}
      <ProfessionalDeliveryProfile user={effectiveUser} />
    </div>
  );
};

export default DeliveryDashboardPage;
