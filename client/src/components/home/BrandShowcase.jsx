import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Award } from 'lucide-react';

const brands = [
  {
    name: 'Apple',
    category: 'Flagship Electronics',
    tagline: 'M3 MacBooks & iPads',
    slug: 'electronics',
    brandQuery: 'Apple',
    color: '#0f172a',
    initial: '',
  },
  {
    name: 'Sony',
    category: 'Acoustics & Visuals',
    tagline: 'Industry-Leading ANC Audio',
    slug: 'electronics',
    brandQuery: 'Sony',
    color: '#000000',
    initial: 'S',
  },
  {
    name: 'Manyavar',
    category: 'Ethnic & Festive',
    tagline: 'Royal Sherwanis & Kurtas',
    slug: 'mens-fashion',
    brandQuery: 'Manyavar',
    color: '#831843',
    initial: 'M',
  },
  {
    name: 'Titan',
    category: 'Luxury Timepieces',
    tagline: 'Edge & Regalia Classics',
    slug: 'furniture',
    brandQuery: 'Titan',
    color: '#9a3412',
    initial: 'T',
  },
  {
    name: 'FabIndia',
    category: 'Handloom & Khadi',
    tagline: 'Artisanal Weaves & Crafts',
    slug: 'womens-fashion',
    brandQuery: 'FabIndia',
    color: '#15803d',
    initial: 'F',
  },
  {
    name: 'Prestige',
    category: 'Kitchen Essentials',
    tagline: 'Tri-Ply Stainless Cookware',
    slug: 'home-and-kitchen',
    brandQuery: 'Prestige',
    color: '#b91c1c',
    initial: 'P',
  },
  {
    name: 'Raymond',
    category: 'Fine Suiting',
    tagline: 'Since 1925 The Complete Man',
    slug: 'mens-fashion',
    brandQuery: 'Raymond',
    color: '#1e3a8a',
    initial: 'R',
  },
  {
    name: 'Nike',
    category: 'Sport & Footwear',
    tagline: 'Jordan & Air Max Innovations',
    slug: 'footwear',
    brandQuery: 'Nike',
    color: '#111827',
    initial: 'N',
  },
];

const BrandShowcase = () => {
  return (
    <section style={{ padding: '36px 0', background: '#ffffff', borderTop: '1px solid #f1f5f9' }}>
      <style>{`
        .brand-grid-responsive {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        @media (min-width: 640px) {
          .brand-grid-responsive {
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
          }
        }
        @media (min-width: 1024px) {
          .brand-grid-responsive {
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
          }
        }
        .brand-card-item {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 16px;
          padding: 16px 14px;
          display: flex;
          align-items: center;
          gap: 14px;
          text-decoration: none;
          position: relative;
          overflow: hidden;
        }
        .brand-card-item:hover {
          transform: translateY(-4px) scale(1.02);
          background: #ffffff;
          border-color: #3b82f6 !important;
          box-shadow: 0 16px 30px -8px rgba(37, 99, 235, 0.15), 0 4px 12px rgba(15, 23, 42, 0.05);
        }
        .brand-card-item:hover .brand-arrow {
          transform: translateX(4px);
          color: #2563eb;
        }
        .brand-card-item .brand-arrow {
          transition: transform 0.25s ease, color 0.25s ease;
          color: #cbd5e1;
        }
        @media (max-width: 640px) {
          .brand-card-item {
            padding: 12px 10px;
            gap: 10px;
          }
        }
      `}</style>
      <div className="container">
        <div className="section-header" style={{ marginBottom: '18px' }}>
          <div>
            <h2 className="section-title">
              <Award size={20} color="#2563eb" /> Official Brand Partners
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
              Directly sourced authentic collections with 100% genuine brand warranty
            </p>
          </div>
          <Link to="/products" className="section-link">
            All Brands <ArrowRight size={14} />
          </Link>
        </div>

        <div className="brand-grid-responsive">
          {brands.map((b) => (
            <Link
              key={b.name}
              to={`/products?search=${encodeURIComponent(b.brandQuery)}`}
              className="brand-card-item"
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: b.color,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                {b.initial}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <strong style={{ fontSize: '0.92rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {b.name}
                  </strong>
                  <ShieldCheck size={13} color="#2563eb" style={{ flexShrink: 0 }} />
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                  {b.tagline}
                </div>
              </div>

              <ArrowRight size={16} className="brand-arrow" style={{ flexShrink: 0 }} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandShowcase;
