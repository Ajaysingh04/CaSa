import React, { useState } from 'react';
import { Star, CheckCircle, Quote, Plus, Edit2, Trash2, X, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const DEFAULT_REVIEWS = [
  {
    id: 'rev-1',
    name: 'Priya Nair',
    city: 'Bengaluru, Karnataka',
    product: 'Pure Banarasi Kanjivaram Silk Saree',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    rating: 5,
    date: '3 days ago',
    comment: 'The zari weave and silk sheen exceeded my expectations. Arrived in royal gift-ready packaging within 48 hours. Genuine craftsmanship!',
  },
  {
    id: 'rev-2',
    name: 'Rohan Mehta',
    city: 'South Mumbai, Maharashtra',
    product: 'Sony WH-1000XM5 Wireless Headphones',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    rating: 5,
    date: '1 week ago',
    comment: '100% brand-sealed original with Indian warranty card. ANC performance is unmatched and CASA doorstep delivery was lightning fast.',
  },
  {
    id: 'rev-3',
    name: 'Dr. Ananya Sharma',
    city: 'New Delhi, NCR',
    product: 'Handmade Solid Sheesham Wood Desk',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    rating: 5,
    date: '2 weeks ago',
    comment: 'Exquisite wooden grain texture and solid durability. The delivery team handled assembly with utmost care. Highly recommended platform!',
  },
  {
    id: 'rev-4',
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
  const { isSuperAdmin } = useAuth();
  const { success, error } = useToast();

  const [reviews, setReviews] = useState(() => {
    try {
      const saved = localStorage.getItem('casa_verified_testimonials');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_REVIEWS;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    product: '',
    avatar: '',
    rating: 5,
    comment: '',
    date: 'Just now',
  });

  const saveReviews = (newReviews) => {
    setReviews(newReviews);
    try {
      localStorage.setItem('casa_verified_testimonials', JSON.stringify(newReviews));
      window.dispatchEvent(new Event('casa_testimonials_updated'));
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenAdd = () => {
    setEditingReview(null);
    setFormData({
      name: '',
      city: 'Mumbai, India',
      product: 'Handpicked Collection Item',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      rating: 5,
      comment: '',
      date: 'Just now',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (review, e) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingReview(review);
    setFormData({
      name: review.name,
      city: review.city || '',
      product: review.product || '',
      avatar: review.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      rating: review.rating || 5,
      comment: review.comment || '',
      date: review.date || 'Recently',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id, reviewerName, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Delete review from "${reviewerName}"?`)) {
      const updated = reviews.filter((r) => r.id !== id);
      saveReviews(updated);
      success(`Review by "${reviewerName}" removed.`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.comment.trim()) {
      error('Please provide reviewer name and comment.');
      return;
    }

    const payload = {
      ...formData,
      avatar: formData.avatar.trim() || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    };

    if (editingReview) {
      const updated = reviews.map((r) => (r.id === editingReview.id ? { ...r, ...payload } : r));
      saveReviews(updated);
      success(`Review by "${formData.name}" updated successfully.`);
    } else {
      const newReview = {
        id: `rev-${Date.now()}`,
        ...payload,
      };
      saveReviews([...reviews, newReview]);
      success(`New testimonial by "${formData.name}" added successfully.`);
    }
    setIsModalOpen(false);
  };

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
        .testimonial-admin-actions {
          position: absolute;
          top: 10px;
          right: 10px;
          display: flex;
          gap: 5px;
          z-index: 10;
        }
        .testimonial-admin-btn {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #475569;
          transition: all 0.15s;
        }
        .testimonial-admin-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }
        .testimonial-admin-btn.delete:hover {
          background: #fee2e2;
          color: #dc2626;
          border-color: #fca5a5;
        }
      `}</style>
      <div className="container">
        {/* Super Admin Toolbar Banner */}
        {isSuperAdmin && (
          <div
            style={{
              background: '#0f172a',
              border: '1.5px solid #334155',
              borderRadius: '12px',
              padding: '8px 16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fde68a', fontSize: '0.82rem', fontWeight: 800 }}>
              <span>👑</span>
              <span>SUPER ADMIN: Verified Shopper Testimonials Manager</span>
            </div>
            <button
              type="button"
              onClick={handleOpenAdd}
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
              }}
            >
              <Plus size={14} />
              <span>Add New Testimonial</span>
            </button>
          </div>
        )}

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
          {reviews.map((rev) => (
            <div key={rev.id || rev.name} className="testimonial-card-item">
              {/* Super Admin Edit / Delete Actions */}
              {isSuperAdmin && (
                <div className="testimonial-admin-actions">
                  <button
                    type="button"
                    onClick={(e) => handleOpenEdit(rev, e)}
                    className="testimonial-admin-btn"
                    title="Edit Review"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(rev.id, rev.name, e)}
                    className="testimonial-admin-btn delete"
                    title="Delete Review"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}

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
                    {[...Array(rev.rating || 5)].map((_, i) => (
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
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80';
                  }}
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

      {/* Super Admin Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '16px',
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '500px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>👑</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {editingReview ? 'Edit Verified Testimonial' : 'Add Verified Testimonial'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Priya Nair"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    City & State
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Bengaluru, Karnataka"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Product Purchased & Reviewed
                </label>
                <input
                  type="text"
                  value={formData.product}
                  onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                  placeholder="e.g. Pure Banarasi Silk Saree"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Rating Stars (1 - 5)
                  </label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', background: '#ffffff' }}
                  >
                    <option value={5}>★★★★★ (5 Stars)</option>
                    <option value={4}>★★★★☆ (4 Stars)</option>
                    <option value={3}>★★★☆☆ (3 Stars)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Review Date Tag
                  </label>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    placeholder="e.g. 2 days ago"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="https://..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Review Comment *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="The customer's actual words and review..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '9px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 20px', borderRadius: '10px', border: 'none', background: '#2563eb', color: '#ffffff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}
                >
                  {editingReview ? 'Save Review' : 'Create Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default TestimonialSection;
