import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Laptop,
  Sparkles,
  Shirt,
  Baby,
  Home,
  Heart,
  Footprints,
  ShoppingBag,
  Activity,
  BookOpen,
  Armchair,
  Luggage,
  Watch,
  Car,
  PawPrint,
  ChevronRight,
  Flame,
  LayoutGrid,
} from 'lucide-react';

import { useStore } from '../../context/StoreContext';

const iconMap = {
  Laptop: Laptop,
  Sparkles: Sparkles,
  Shirt: Shirt,
  Baby: Baby,
  Home: Home,
  Heart: Heart,
  Footprints: Footprints,
  ShoppingBag: ShoppingBag,
  Activity: Activity,
  BookOpen: BookOpen,
  Armchair: Armchair,
  Luggage: Luggage,
  Watch: Watch,
  Car: Car,
  PawPrint: PawPrint,
};

const CategoryNavbar = ({ categories = [] }) => {
  const location = useLocation();
  const { t, primaryColor } = useStore();
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const isAllActive = location.pathname === '/products' && !location.search;

  return (
    <nav style={navWrapperStyle}>
      <div className="container" style={navContainerStyle}>
        {/* Horizontal Category Pill Row (Reference Image 2 Style) */}
        <div style={categoriesScrollStyle}>
          {/* All Categories Pill */}
          <Link
            to="/products"
            style={{
              ...pillTabStyle,
              background: isAllActive ? (primaryColor || '#2563eb') : '#ffffff',
              color: isAllActive ? '#ffffff' : '#475569',
              borderColor: isAllActive ? (primaryColor || '#2563eb') : '#e2e8f0',
              fontWeight: isAllActive ? 700 : 600,
            }}
          >
            <LayoutGrid size={14} />
            <span>{t('allCategories')}</span>
          </Link>

          {/* Deals Pill */}
          <Link
            to="/products?bestseller=true"
            style={{
              ...pillTabStyle,
              background: '#fef2f2',
              color: '#dc2626',
              borderColor: '#fecaca',
            }}
          >
            <Flame size={14} />
            <span>{t('deals')}</span>
          </Link>

          {/* Category Pills */}
          {categories.map((cat) => {
            const IconComponent = iconMap[cat.icon] || ShoppingBag;
            const isActive = location.pathname === `/category/${cat.slug}`;
            const isHovered = hoveredCategory?._id === cat._id;

            return (
              <div
                key={cat._id}
                onMouseEnter={() => setHoveredCategory(cat)}
                onMouseLeave={() => setHoveredCategory(null)}
                style={{ position: 'relative' }}
              >
                <Link
                  to={`/category/${cat.slug}`}
                  style={{
                    ...pillTabStyle,
                    background: isActive ? '#4f46e5' : isHovered ? '#eff6ff' : '#ffffff',
                    color: isActive ? '#ffffff' : isHovered ? '#2563eb' : '#475569',
                    borderColor: isActive ? '#4f46e5' : isHovered ? '#bfdbfe' : '#e2e8f0',
                    fontWeight: isActive ? 700 : 600,
                  }}
                >
                  <IconComponent size={14} />
                  <span>{cat.name}</span>
                </Link>

                {/* Subcategories Dropdown */}
                {isHovered && cat.subcategories && cat.subcategories.length > 0 && (
                  <div style={dropdownStyle} className="animate-slide-up">
                    <div style={dropdownTitle}>
                      <span>{cat.name}</span>
                      <Link to={`/category/${cat.slug}`} style={viewAllLink}>
                        View All <ChevronRight size={13} />
                      </Link>
                    </div>
                    <div style={subcategoriesGrid}>
                      {cat.subcategories.map((sub) => (
                        <Link
                          key={sub.slug}
                          to={`/category/${cat.slug}?subcategory=${encodeURIComponent(sub.name)}`}
                          style={subItemStyle}
                        >
                          <ChevronRight size={12} color="#94a3b8" />
                          <span>{sub.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

/* Styles */
const navWrapperStyle = {
  background: '#ffffff',
  borderBottom: '1px solid #f1f5f9',
  padding: '10px 0',
};

const navContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  minWidth: 0,
};

const categoriesScrollStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  overflowX: 'auto',
  paddingBottom: '4px',
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  width: '100%',
  minWidth: 0,
};

const pillTabStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 16px',
  borderRadius: '9999px',
  fontSize: '0.825rem',
  textDecoration: 'none',
  border: '1.5px solid #e2e8f0',
  whiteSpace: 'nowrap',
  transition: 'all 0.2s',
  flexShrink: 0,
};

const dropdownStyle = {
  position: 'absolute',
  top: 'calc(100% + 8px)',
  left: 0,
  minWidth: '260px',
  background: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 16px 36px -4px rgba(15, 23, 42, 0.15)',
  padding: '14px',
  zIndex: 100,
};

const dropdownTitle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '0.8rem',
  fontWeight: 700,
  color: '#0f172a',
  paddingBottom: '8px',
  borderBottom: '1px solid #f1f5f9',
  marginBottom: '8px',
};

const viewAllLink = {
  fontSize: '0.72rem',
  color: '#2563eb',
  display: 'inline-flex',
  alignItems: 'center',
  textDecoration: 'none',
  fontWeight: 600,
};

const subcategoriesGrid = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const subItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 8px',
  borderRadius: '8px',
  fontSize: '0.8rem',
  color: '#475569',
  textDecoration: 'none',
  transition: 'background 0.15s',
};

export default CategoryNavbar;
