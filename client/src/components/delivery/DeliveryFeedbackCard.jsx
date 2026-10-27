import React, { useState } from 'react';
import { Star, Truck, CheckCircle2, MessageSquare, ShieldCheck, Sparkles, Send } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { useToast } from '../../context/ToastContext';

const FEEDBACK_TAGS = [
  '⚡ On-time Delivery',
  '🤝 Polite & Courteous',
  '📦 Handled with Care',
  '📍 Followed Directions',
  '💬 Great Communication',
  '🛡️ Safe & Contactless'
];

const RATING_LABELS = {
  1: 'Disappointing 😞',
  2: 'Needs Improvement 😐',
  3: 'Good Delivery 🙂',
  4: 'Great & Professional 😊',
  5: 'Exceptional Service! 🌟'
};

const DeliveryFeedbackCard = ({ order, onFeedbackSubmitted }) => {
  const { success, error } = useToast();

  const existingFeedback = order?.deliveryFeedback;
  const [rating, setRating] = useState(existingFeedback?.rating || 5);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState(existingFeedback?.tags || ['⚡ On-time Delivery', '🤝 Polite & Courteous']);
  const [comment, setComment] = useState(existingFeedback?.comment || '');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(!!existingFeedback);

  const deliveryPartnerName = order?.deliveryPartnerName || 'Vikram Singh Express';
  const deliveryPartnerPhone = order?.deliveryPartnerPhone || '+91 9826012345';

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      error('Please select a star rating (1 to 5).');
      return;
    }

    setSubmitting(true);
    try {
      const feedbackPayload = {
        rating,
        tags: selectedTags,
        comment: comment.trim()
      };

      const updated = await orderService.submitDeliveryFeedback(order._id || order.orderNumber, feedbackPayload).catch(() => null);

      success('⭐ Thank you! Your feedback for the delivery partner has been recorded.');
      setSubmitted(true);
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted(updated || { ...order, deliveryFeedback: feedbackPayload });
      }
    } catch (err) {
      error(err.response?.data?.message || 'Could not submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1.5px solid #e2e8f0',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 8px 30px rgba(15, 23, 42, 0.05)',
        position: 'relative',
        overflow: 'hidden',
        marginTop: '20px'
      }}
    >
      {/* Decorative accent top bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #10b981 0%, #059669 50%, #34d399 100%)'
        }}
      />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          paddingBottom: '16px',
          borderBottom: '1px solid #f1f5f9'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
            }}
          >
            <Truck size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Delivery Partner Feedback
              </span>
              <span
                style={{
                  background: '#ecfdf5',
                  color: '#047857',
                  border: '1px solid #a7f3d0',
                  padding: '1px 7px',
                  borderRadius: '6px',
                  fontSize: '0.68rem',
                  fontWeight: 800
                }}
              >
                VERIFIED HANDOVER
              </span>
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '2px 0 0 0' }}>
              How was your delivery by {deliveryPartnerName}?
            </h3>
          </div>
        </div>

        {submitted && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#f0fdf4',
              border: '1px solid #86efac',
              color: '#15803d',
              padding: '6px 12px',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 800
            }}
          >
            <CheckCircle2 size={14} /> Review Submitted
          </div>
        )}
      </div>

      {submitted ? (
        /* Read-only submitted review view */
        <div style={{ paddingTop: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={20}
                  fill={star <= rating ? '#f59e0b' : 'none'}
                  color={star <= rating ? '#f59e0b' : '#cbd5e1'}
                />
              ))}
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
              {rating}.0 / 5.0
            </span>
            <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 700 }}>
              — {RATING_LABELS[rating]}
            </span>
          </div>

          {selectedTags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '12px 0' }}>
              {selectedTags.map((t) => (
                <span
                  key={t}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    color: '#334155',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '0.76rem',
                    fontWeight: 700
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {comment && (
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '12px 14px',
                fontSize: '0.84rem',
                color: '#334155',
                fontStyle: 'italic',
                marginTop: '10px'
              }}
            >
              "{comment}"
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' }}>
            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
              Your review is visible to CaSa Logistics and directly credits rider performance incentives.
            </span>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#2563eb',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Edit Feedback
            </button>
          </div>
        </div>
      ) : (
        /* Interactive Rating Form */
        <form onSubmit={handleSubmit} style={{ paddingTop: '18px' }}>
          {/* Star selector */}
          <div style={{ marginBottom: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>
              Rate Courier Service
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map((star) => {
                const active = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      transform: active ? 'scale(1.15)' : 'scale(1)',
                      transition: 'transform 0.15s ease'
                    }}
                    title={`${star} Star`}
                  >
                    <Star
                      size={28}
                      fill={active ? '#f59e0b' : 'none'}
                      color={active ? '#f59e0b' : '#cbd5e1'}
                    />
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginTop: '4px', minHeight: '20px' }}>
              {RATING_LABELS[hoverRating || rating]}
            </div>
          </div>

          {/* Quick Compliment Tags */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
              What went great? (Select tags)
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {FEEDBACK_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    style={{
                      background: isSelected ? '#ecfdf5' : '#f8fafc',
                      color: isSelected ? '#047857' : '#475569',
                      border: `1.5px solid ${isSelected ? '#10b981' : '#e2e8f0'}`,
                      borderRadius: '10px',
                      padding: '6px 12px',
                      fontSize: '0.78rem',
                      fontWeight: isSelected ? 800 : 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comment text area */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
              Additional Remarks for Delivery Partner (Optional)
            </label>
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Vikram was very polite, came right on time and handed over the parcel safely..."
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1.5px solid #e2e8f0',
                fontSize: '0.84rem',
                color: '#0f172a',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: submitting ? 'wait' : 'pointer',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                transition: 'all 0.2s ease'
              }}
            >
              <Send size={14} /> {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default DeliveryFeedbackCard;
