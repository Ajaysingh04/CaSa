import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ProfessionalVendorProfile from '../../components/profile/ProfessionalVendorProfile';

const VendorDashboardPage = () => {
  const { user, updateProfile, switchRole } = useAuth();

  // If user is accessing the vendor portal but active role is not yet 'vendor', auto-switch to vendor
  useEffect(() => {
    if (user && user.role !== 'vendor' && switchRole) {
      switchRole('vendor');
    }
  }, [user, switchRole]);

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#f4f6fa' }}>
      <ProfessionalVendorProfile
        user={user}
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
