import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import AnnouncementBar from '../components/common/AnnouncementBar';
import Header from '../components/common/Header';
import CategoryNavbar from '../components/common/CategoryNavbar';
import CartDrawer from '../components/common/CartDrawer';
import MobileCategoryDrawer from '../components/common/MobileCategoryDrawer';
import Footer from '../components/common/Footer';
import { categoryService } from '../services/categoryService';

const MainLayout = () => {
  const [categories, setCategories] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await categoryService.getCategories();
        setCategories(data || []);
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };
    fetchCats();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8fafc', width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
      <AnnouncementBar />
      <Header onToggleMobileMenu={() => setIsMobileMenuOpen(true)} />
      <CategoryNavbar categories={categories} />

      <main style={{ flex: 1, minHeight: '60vh', width: '100%', maxWidth: '100vw', overflowX: 'hidden', boxSizing: 'border-box' }}>
        <Outlet context={{ categories }} />
      </main>

      <Footer />
      <CartDrawer />
      <MobileCategoryDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        categories={categories}
      />
    </div>
  );
};

export default MainLayout;
