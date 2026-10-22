import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ProfessionalVendorProfile from '../../components/profile/ProfessionalVendorProfile';

const VendorDashboardPage = () => {
  const { user, updateProfile } = useAuth();

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
