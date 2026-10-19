import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import ProductCard from '../product/ProductCard';

const CategoryShowcase = ({ title, subtitle, categorySlug, products = [], linkText = 'View All', allProducts = [] }) => {
  if (!products || products.length === 0) return null;

  // Always display 4 products so the 4-column desktop grid has zero awkward gaps
  let displayProducts = products.slice(0, 4);
  if (displayProducts.length < 4 && allProducts && allProducts.length > 0) {
    const existingIds = new Set(displayProducts.map((p) => p._id));
    const backfill = allProducts.filter((p) => !existingIds.has(p._id)).slice(0, 4 - displayProducts.length);
    displayProducts = [...displayProducts, ...backfill];
  }

  return (
    <section style={showcaseWrapperStyle} className="category-showcase-section animate-section-reveal">
      <style>{`
        .showcase-link-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-weight: 700;
          font-size: 0.85rem;
          color: #2563eb;
          text-decoration: none;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .showcase-link-btn:hover {
          transform: translateX(4px);
          color: #1d4ed8;
        }
        .showcase-header-title {
          font-size: 1.45rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.02em;
          margin: 0;
        }
        @media (max-width: 640px) {
          .showcase-header-title {
            font-size: 1.2rem !important;
          }
          .category-showcase-section {
            padding: 24px 0 !important;
          }
        }
      `}</style>
      <div className="container">
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
          <div>
            <h2 className="showcase-header-title">{title}</h2>
            {subtitle && (
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '3px', margin: '3px 0 0 0' }}>
                {subtitle}
              </p>
            )}
          </div>
          <Link to={`/category/${categorySlug}`} className="showcase-link-btn">
            {linkText} <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid-products">
          {displayProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

const showcaseWrapperStyle = {
  padding: '36px 0',
};

export default CategoryShowcase;
