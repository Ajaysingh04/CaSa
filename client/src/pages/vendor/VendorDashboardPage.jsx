import React from 'react';
import { Link } from 'react-router-dom';
import { Store, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import ProfessionalVendorProfile from '../../components/profile/ProfessionalVendorProfile';

const VendorDashboardPage = () => {
  const { user, switchRole, updateProfile } = useAuth();
  const { success } = useToast();

  const effectiveUser = user || {
    name: 'Aarav Sharma',
    email: 'vendor@casa.in',
    role: 'vendor',
    phone: '+91 9876524680',
    vendorStoreName: 'Aarav Luxury Handlooms',
    vendorDetails: {
      tagline: 'Authentic Handloom & Apparel Heritage Crafted for Modern India',
      legalEntityName: 'Aarav Handlooms & Textiles Pvt Ltd',
      merchantId: 'VND-MP-4520',
      gstin: '23AAACA9876Q1Z5',
      pan: 'AAACA9876Q',
      warehouseName: 'Indore Central Logistics & Textile Hub #14',
      warehouseStreet: 'Plot 14-B, Sector C, Sanwer Road Industrial Area',
      warehouseCity: 'Indore',
      warehouseState: 'Madhya Pradesh',
      warehousePincode: '452015',
    },
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#f4f6fa', padding: '16px 0 60px' }}>
      {/* Demo viewer banner when not signed in */}
      {!user && (
        <div style={{ maxWidth: '1440px', margin: '0 auto 16px', padding: '0 16px', boxSizing: 'border-box' }}>
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
              <Store size={18} color="#2563eb" />
              <div style={{ fontSize: '0.85rem', color: '#1e40af' }}>
                <strong>Viewing CaSa Vendor Merchant Center:</strong> Product catalog, inventory stock, order dispatches, settlement ledger and store settings are active in demo mode.
              </div>
            </div>
            <Link
              to="/login?redirect=/vendor"
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

      {/* Non-vendor role warning banner with 1-click switch */}
      {user && user.role !== 'vendor' && user.role !== 'admin' && (
        <div style={{ maxWidth: '1440px', margin: '0 auto 16px', padding: '0 16px', boxSizing: 'border-box' }}>
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
                  Switch your account role to Verified Vendor to manage merchant products, warehouse stock and incoming customer orders.
                </div>
              </div>
            </div>
            <button
              onClick={async () => {
                await switchRole('vendor');
                success('Switched to CaSa Merchant Vendor persona!');
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
              ⚡ Switch to Vendor Partner (1-Click)
            </button>
          </div>
        </div>
      )}

      <ProfessionalVendorProfile
        user={effectiveUser}
        onProfileUpdated={(updatedUser) => {
          if (updatedUser && updateProfile) {
            updateProfile(updatedUser);
          }
        }}
      />
    </div>
  );
};

export default VendorDashboardPage;
