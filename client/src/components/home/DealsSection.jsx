import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Clock, ChevronRight } from 'lucide-react';
import ProductCard from '../product/ProductCard';

const DealsSection = ({ products = [] }) => {
  // Live Countdown timer
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 42,
    seconds: 15,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!products || products.length === 0) return null;

  // Filter products with good discounts
  const dealProducts = products
    .filter((p) => p.discountPrice && p.discountPrice < p.price)
    .slice(0, 4);

  if (dealProducts.length === 0) return null;

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <section style={dealsWrapperStyle}>
      <div className="container">
        {/* Deals Header with Countdown */}
        <div style={dealsHeaderStyle}>
          <div style={titleGroupStyle}>
            <div style={badgeStyle}>
              <Flame size={16} color="#ef4444" fill="#ef4444" />
              <span>TODAY'S BEST DEALS</span>
            </div>
            <div style={timerBoxStyle}>
              <Clock size={16} color="#64748b" />
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Ends in:</span>
              <div style={digitsContainer}>
                <span style={digitStyle}>{pad(timeLeft.hours)}h</span>:
                <span style={digitStyle}>{pad(timeLeft.minutes)}m</span>:
                <span style={digitStyle}>{pad(timeLeft.seconds)}s</span>
              </div>
            </div>
          </div>

          <Link to="/products?discount=true" className="section-link">
            See All Deals <ChevronRight size={16} />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid-products">
          {dealProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

const dealsWrapperStyle = {
  padding: '40px 0',
  background: '#ffffff',
  borderTop: '1px solid #e2e8f0',
  borderBottom: '1px solid #e2e8f0',
};

const dealsHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '12px',
  marginBottom: '20px',
};

const titleGroupStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  flexWrap: 'wrap',
};

const badgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  background: '#fee2e2',
  color: '#dc2626',
  padding: '6px 12px',
  borderRadius: '8px',
  fontWeight: '800',
  fontSize: '0.85rem',
  letterSpacing: '0.04em',
};

const timerBoxStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
};

const digitsContainer = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  fontWeight: '700',
  color: '#0f172a',
};

const digitStyle = {
  background: '#0a192f',
  color: '#ffffff',
  padding: '2px 6px',
  borderRadius: '4px',
  fontSize: '0.8rem',
};

export default DealsSection;
