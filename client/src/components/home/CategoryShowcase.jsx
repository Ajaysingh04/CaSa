import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import ProductCard from '../product/ProductCard';

const CategoryShowcase = ({ title, subtitle, categorySlug, products = [], linkText = 'View All' }) => {
  if (!products || products.length === 0) return null;

  const displayProducts = products.slice(0, 4);

  return (
    <section style={showcaseWrapperStyle}>
      <div className="container">
        <div className="section-header">
          <div>
            <h2 className="section-title">{title}</h2>
            {subtitle && (
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                {subtitle}
              </p>
            )}
          </div>
          <Link to={`/category/${categorySlug}`} className="section-link">
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
