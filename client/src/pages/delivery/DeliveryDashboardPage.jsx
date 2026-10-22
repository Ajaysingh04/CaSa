import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import ProfessionalDeliveryProfile from '../../components/profile/ProfessionalDeliveryProfile';

const DeliveryDashboardPage = () => {
  const { user, switchRole, login } = useAuth();
  const { success, error } = useToast();

  if (!user) {
    return (
      <div className="container" style={{ padding: '60px 16px', maxWidth: '520px', margin: '0 auto', textAlign: 'center' }}>
        <div
          className="card"
          style={{
            padding: '40px 32px',
            borderRadius: '24px',
            background: '#ffffff',
            boxShadow: '0 20px 40px -15px rgba(12, 74, 110, 0.15)',
            border: '1px solid #e0f2fe',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '20px',
              background: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <Truck size={38} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a' }}>Delivery Partner Portal</h2>
          <p style={{ color: '#64748b', fontSize: '0.92rem', marginTop: '10px', lineHeight: 1.55 }}>
            Access real-time package dispatches, accept route deliveries, GPS route directions, and COD collection metrics.
          </p>
          <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={async () => {
                const res = await login({ email: 'delivery@casa.in', password: 'Delivery@Casa2026' });
                if (res.success) {
                  success('Welcome to CASA Delivery! Live demo rider session started.');
                }
              }}
              className="btn btn-primary"
              style={{
                padding: '13px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #059669, #047857)',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 8px 20px -4px rgba(5, 150, 105, 0.4)',
                color: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <Sparkles size={17} /> ⚡ 1-Click Launch Delivery Demo
            </button>
            <Link
              to="/login?redirect=/delivery"
              className="btn btn-outline"
              style={{ padding: '12px', borderRadius: '12px', fontWeight: 700 }}
            >
              Sign In with Other Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#f8fafc', padding: '16px 0 60px' }}>
      {/* Non-delivery role warning banner with 1-click switch */}
      {user.role !== 'delivery' && user.role !== 'admin' && (
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
      <ProfessionalDeliveryProfile user={user} />
    </div>
  );
};

export default DeliveryDashboardPage;
