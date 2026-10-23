import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight, Sparkles } from 'lucide-react';

const CategoryGrid = ({ categories = [] }) => {
  if (!categories || categories.length === 0) return null;

  return (
    <section style={sectionWrapper} className="category-section-wrapper">
      {/* Component Specific Keyframe Animations & Hover Effects */}
      <style>{`
        @keyframes catEntrance {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .cat-card-item {
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), 
                      box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1), 
                      border-color 0.3s ease;
          position: relative;
          overflow: hidden;
          background: #ffffff;
          border-radius: 16px;
          border: 1.5px solid #e2e8f0;
          text-decoration: none;
          display: flex;
          flex-direction: column;
        }

        .cat-card-item:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 35px -6px rgba(37, 99, 235, 0.18), 0 8px 16px -4px rgba(15, 23, 42, 0.08);
          border-color: #60a5fa !important;
        }

        .cat-card-item .cat-img {
          transition: transform 0.55s cubic-bezier(0.16, 1, 0.3, 1), filter 0.4s ease;
        }

        .cat-card-item:hover .cat-img {
          transform: scale(1.12);
          filter: brightness(1.04);
        }

        .cat-card-item .shimmer-sweep {
          position: absolute;
          top: 0;
          left: -120%;
          width: 80%;
          height: 100%;
          background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%);
          transform: skewX(-25deg);
          pointer-events: none;
          z-index: 5;
        }

        .cat-card-item:hover .shimmer-sweep {
          left: 180%;
          transition: left 0.75s ease-in-out;
        }

        .cat-card-item .cat-title {
          transition: color 0.25s ease;
        }

        .cat-card-item:hover .cat-title {
          color: #2563eb !important;
        }

        .cat-card-item .cat-arrow-icon {
          opacity: 0;
          transform: translateX(-8px);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          color: #2563eb;
        }

        .cat-card-item:hover .cat-arrow-icon {
          opacity: 1;
          transform: translateX(0);
        }

        .cat-card-item .cat-pill-badge {
          transition: all 0.25s ease;
        }

        .cat-card-item:hover .cat-pill-badge {
          background: #eff6ff !important;
          color: #2563eb !important;
          border-color: #bfdbfe !important;
        }

        .category-mobile-track {
          display: none;
        }

        .category-grid-responsive {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        @media (max-width: 639px) {
          .category-section-wrapper {
            padding: 16px 0 20px !important;
          }
          .category-mobile-track {
            display: flex !important;
            gap: 14px;
            overflow-x: auto;
            padding: 4px 4px 14px;
            scrollbar-width: none;
            -webkit-overflow-scrolling: touch;
          }
          .category-mobile-track::-webkit-scrollbar {
            display: none;
          }
          .category-mobile-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
            text-decoration: none;
            flex-shrink: 0;
            width: 72px;
          }
          .category-mobile-avatar {
            width: 62px;
            height: 62px;
            border-radius: 50%;
            overflow: hidden;
            background: #ffffff;
            border: 2px solid #e2e8f0;
            box-shadow: 0 4px 10px rgba(15, 23, 42, 0.08);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s ease, border-color 0.2s ease;
          }
          .category-mobile-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .category-mobile-item:active .category-mobile-avatar {
            transform: scale(0.94);
            border-color: #2563eb;
          }
          .category-mobile-name {
            font-size: 0.72rem;
            font-weight: 700;
            color: #1e293b;
            text-align: center;
            line-height: 1.15;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .category-grid-responsive {
            display: none !important;
          }
        }

        @media (min-width: 640px) {
          .category-grid-responsive {
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
          }
        }

        @media (min-width: 1024px) {
          .category-grid-responsive {
            grid-template-columns: repeat(5, 1fr);
            gap: 18px;
          }
        }
      `}</style>

      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div>
            <h2 className="section-title">
              <Sparkles size={20} color="#2563eb" /> Shop by Category
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '2px' }}>
              Explore authentic collections across 15 curated departments
            </p>
          </div>
          <Link to="/products" className="section-link">
            Explore All Departments <ChevronRight size={16} />
          </Link>
        </div>

        {/* Mobile Horizontal App-Style Category Track */}
        <div className="category-mobile-track touch-scroll-x">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/category/${cat.slug}`}
              className="category-mobile-item"
            >
              <div className="category-mobile-avatar">
                <img
                  src={cat.slug === 'mens-fashion' ? 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&auto=format&fit=crop&q=80' : cat.image}
                  alt={cat.name}
                  loading="lazy"
                />
              </div>
              <span className="category-mobile-name">{cat.name}</span>
            </Link>
          ))}
        </div>

        {/* 15 Categories Grid for Tablet & Desktop */}
        <div className="category-grid-responsive">
          {categories.map((cat, idx) => (
            <Link
              key={cat._id}
              to={`/category/${cat.slug}`}
              className="cat-card-item"
              style={{
                animation: `catEntrance 0.5s cubic-bezier(0.16, 1, 0.3, 1) both`,
                animationDelay: `${Math.min(idx * 45, 600)}ms`,
              }}
            >
              {/* Shimmer Light Sweep Effect on Hover */}
              <div className="shimmer-sweep" />

              {/* Image Container with Dynamic Zoom */}
              <div style={imgContainerStyle}>
                <img
                  src={cat.slug === 'mens-fashion' ? 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80' : cat.image}
                  alt={cat.name}
                  className="cat-img"
                  style={categoryImgStyle}
                  loading="lazy"
                />
                <div style={imgOverlayStyle} />

                {/* Subcategory Count Tag */}
                <div style={floatingCountTag}>
                  <span>{cat.subcategories?.length || 4}+ Subcategories</span>
                </div>
              </div>

              {/* Card Footer with Title and Interactive Arrow */}
              <div style={categoryInfoStyle}>
                <div style={titleRowStyle}>
                  <h3 className="cat-title" style={categoryNameStyle}>
                    {cat.name}
                  </h3>
                  <div className="cat-arrow-icon">
                    <ArrowRight size={15} />
                  </div>
                </div>

                <div style={bottomRowStyle}>
                  <span className="cat-pill-badge" style={categoryPillStyle}>
                    Explore Collection →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

/* Styles */
const sectionWrapper = {
  padding: '44px 0',
  background: '#f8fafc',
};

const imgContainerStyle = {
  position: 'relative',
  width: '100%',
  paddingTop: '95%',
  background: '#f8fafc',
  overflow: 'hidden',
};

const categoryImgStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  objectPosition: 'top center',
};

const imgOverlayStyle = {
  position: 'absolute',
  inset: 0,
  background: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 70%, rgba(0, 0, 0, 0.2) 100%)',
};

const floatingCountTag = {
  position: 'absolute',
  bottom: '8px',
  left: '8px',
  background: 'rgba(15, 23, 42, 0.75)',
  backdropFilter: 'blur(4px)',
  color: '#ffffff',
  fontSize: '0.68rem',
  fontWeight: 700,
  padding: '2px 8px',
  borderRadius: '9999px',
  letterSpacing: '0.02em',
  zIndex: 3,
};

const categoryInfoStyle = {
  padding: '14px 12px 12px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  flex: 1,
  background: '#ffffff',
};

const titleRowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '6px',
};

const categoryNameStyle = {
  fontSize: '0.9rem',
  fontWeight: '800',
  color: '#0f172a',
  lineHeight: 1.25,
  letterSpacing: '-0.015em',
};

const bottomRowStyle = {
  marginTop: '8px',
};

const categoryPillStyle = {
  fontSize: '0.72rem',
  fontWeight: '700',
  color: '#64748b',
  background: '#f8fafc',
  padding: '3px 8px',
  borderRadius: '6px',
  border: '1px solid #e2e8f0',
  display: 'inline-block',
};

export default CategoryGrid;
