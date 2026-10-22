import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import ProfessionalDeliveryProfile from '../../components/profile/ProfessionalDeliveryProfile';

const DeliveryDashboardPage = () => {
  const { user, switchRole, login } = useAuth();
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

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#f8fafc', padding: '16px 0 60px' }}>
      {/* Demo viewer banner when not signed in */}
      {!user && (
        <div style={{ maxWidth: '1240px', margin: '0 auto 16px', padding: '0 16px', boxSizing: 'border-box' }}>
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
