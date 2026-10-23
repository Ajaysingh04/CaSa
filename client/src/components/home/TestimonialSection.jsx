import React from 'react';
import { Star, CheckCircle, Quote, ThumbsUp, Sparkles } from 'lucide-react';

const reviews = [
  {
    name: 'Priya Nair',
    city: 'Bengaluru, Karnataka',
    product: 'Pure Banarasi Kanjivaram Silk Saree',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    rating: 5,
    date: '3 days ago',
    comment: 'The zari weave and silk sheen exceeded my expectations. Arrived in royal gift-ready packaging within 48 hours. Genuine craftsmanship!',
  },
  {
    name: 'Rohan Mehta',
    city: 'South Mumbai, Maharashtra',
    product: 'Sony WH-1000XM5 Wireless Headphones',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    rating: 5,
    date: '1 week ago',
    comment: '100% brand-sealed original with Indian warranty card. ANC performance is unmatched and CASA doorstep delivery was lightning fast.',
  },
  {
    name: 'Dr. Ananya Sharma',
    city: 'New Delhi, NCR',
    product: 'Handmade Solid Sheesham Wood Desk',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    rating: 5,
    date: '2 weeks ago',
    comment: 'Exquisite wooden grain texture and solid durability. The delivery team handled assembly with utmost care. Highly recommended platform!',
  },
  {
    name: 'Vikramaditya Verma',
    city: 'Jaipur, Rajasthan',
    product: 'Parker Sonnet 18k Solid Gold Nib Pen',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    rating: 5,
    date: 'Yesterday',
    comment: 'Executive perfection in black lacquer and gold. Writing is smooth as butter. Authentic certificate and warranty registered smoothly.',
  },
];

const TestimonialSection = () => {
  return (
    <section style={{ padding: '48px 0', background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)', borderTop: '1px solid #e2e8f0' }}>
      <style>{`
        .testimonial-grid-responsive {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 640px) {
          .testimonial-grid-responsive {
            grid-template-columns: repeat(2, 1fr);
            gap: 18px;
          }
        }
        @media (min-width: 1024px) {
          .testimonial-grid-responsive {
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
          }
        }
        .testimonial-card-item {
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 20px;
          padding: 22px 18px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s ease;
          overflow: hidden;
        }
        .testimonial-card-item:hover {
          transform: translateY(-6px);
          border-color: #93c5fd !important;
          box-shadow: 0 20px 35px -8px rgba(37, 99, 235, 0.12), 0 6px 14px rgba(15, 23, 42, 0.04);
        }
        .testimonial-avatar-glow {
          box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px #bfdbfe;
        }
      `}</style>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 32px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#eff6ff',
              color: '#1d4ed8',
              border: '1px solid #bfdbfe',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              marginBottom: '10px',
            }}
          >
            <Sparkles size={13} color="#2563eb" /> VERIFIED SHOPPER VOICES
          </div>
          <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.85rem)', fontWeight: 900, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.025em' }}>
            Trusted by 2.5 Lakh+ Shoppers Across India
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
            Read real unfiltered reviews from verified buyers who experience CASA quality every day.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="testimonial-grid-responsive">
          {reviews.map((rev, idx) => (
            <div key={idx} className="testimonial-card-item">
              {/* Quote Icon Backdrop */}
              <Quote
                size={42}
                color="#f1f5f9"
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '14px',
                  zIndex: 0,
                  pointerEvents: 'none',
                }}
              />

              <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Rating Stars & Date */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={15} color="#f59e0b" fill="#f59e0b" />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{rev.date}</span>
                </div>

                {/* Verified Purchase Tag */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, marginBottom: '12px' }}>
                  <CheckCircle size={12} color="#059669" />
                  <span>Verified Purchase</span>
                </div>

                {/* Comment Text */}
                <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.55, margin: '0 0 16px', minHeight: '66px' }}>
                  "{rev.comment}"
                </p>

                {/* Product Tag */}
                <div style={{ fontSize: '0.74rem', color: '#2563eb', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', background: '#eff6ff', padding: '4px 8px', borderRadius: '6px', marginBottom: '16px' }}>
                  📦 {rev.product}
                </div>
              </div>

              {/* User Bio */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', position: 'relative', zIndex: 1 }}>
                <img
                  src={rev.avatar}
                  alt={rev.name}
                  className="testimonial-avatar-glow"
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                  loading="lazy"
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {rev.name}
                  </strong>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {rev.city}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
