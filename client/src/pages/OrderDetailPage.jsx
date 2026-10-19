import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Package,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  CreditCard,
  RotateCcw,
  AlertTriangle,
  ChevronLeft,
} from 'lucide-react';
import { orderService } from '../services/orderService';
import { useToast } from '../context/ToastContext';
import { formatINR, formatDateTime, formatDate } from '../utils/formatters';

const standardSteps = ['Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for delivery', 'Delivered'];

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Order placed by mistake');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await orderService.getOrderById(id);
        setOrder(data);
      } catch (err) {
        console.error('Failed to load order details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    setCancelling(true);
    try {
      const updated = await orderService.cancelOrder(order._id, cancelReason);
      setOrder(updated);
      setShowCancelModal(false);
      success('Order cancelled successfully.');
    } catch (err) {
      error(err.response?.data?.message || 'Could not cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '40px 16px' }}>
        <div className="skeleton" style={{ height: '300px', borderRadius: '16px' }} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container" style={{ padding: '80px 16px', textAlign: 'center' }}>
        <h2>Order Not Found</h2>
        <Link to="/orders" className="btn btn-primary" style={{ marginTop: '16px' }}>
          Back to Orders
        </Link>
      </div>
    );
  }

  const currentStepIdx = standardSteps.indexOf(order.orderStatus);
  const isCancellable = ['Pending', 'Confirmed', 'Processing', 'Packed'].includes(order.orderStatus);

  return (
    <div className="container" style={{ padding: '24px 16px 60px', maxWidth: '900px' }}>
      <Link to="/orders" style={backLinkStyle}>
        <ChevronLeft size={16} /> Back to My Orders
      </Link>

      <div style={headerCard} className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>ORDER DETAILS</span>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
              {order.orderNumber}
            </h1>
            <div style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '2px' }}>
              Placed on {formatDateTime(order.createdAt)}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={statusBadge}>{order.orderStatus}</span>
            {isCancellable && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="btn btn-outline btn-sm"
                style={{ color: '#dc2626', borderColor: '#fca5a5' }}
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>

        {/* Visual Step Tracker (if not cancelled/refunded) */}
        {!['Cancelled', 'Refunded', 'Return requested'].includes(order.orderStatus) && (
          <div style={trackerContainer}>
            <div style={trackerLineBackground} />
            <div
              style={{
                ...trackerLineProgress,
                width: `${Math.max(0, (currentStepIdx / (standardSteps.length - 1)) * 100)}%`,
              }}
            />

            <div style={trackerStepsRow}>
              {standardSteps.map((step, idx) => {
                const isPassed = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return (
                  <div key={step} style={trackerStepNode}>
                    <div
                      style={{
                        ...stepCircle,
                        background: isPassed ? '#1d4ed8' : '#ffffff',
                        borderColor: isPassed ? '#1d4ed8' : '#cbd5e1',
                        color: isPassed ? '#ffffff' : '#64748b',
                      }}
                    >
                      {isPassed ? <CheckCircle2 size={16} /> : idx + 1}
                    </div>
                    <span
                      style={{
                        ...stepLabel,
                        color: isCurrent ? '#1d4ed8' : isPassed ? '#0f172a' : '#94a3b8',
                        fontWeight: isCurrent ? 700 : 500,
                      }}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Cancelled Alert if applicable */}
        {order.orderStatus === 'Cancelled' && (
          <div style={cancelledAlertBox}>
            <AlertTriangle size={20} color="#dc2626" />
            <div>
              <strong>Order Cancelled</strong>
              <div style={{ fontSize: '0.85rem', color: '#7f1d1d' }}>
                Reason: {order.cancellationReason || 'Cancelled by customer'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Two Columns: Items & Address/Payment */}
      <style>{`
        .order-details-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        @media (min-width: 1024px) {
          .order-details-grid {
            grid-template-columns: 1.8fr 1.2fr;
          }
        }
      `}</style>
      <div className="order-details-grid">
        {/* Left: Items List */}
        <div style={itemsSectionCard} className="card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>
            Items in this Shipment
          </h3>
          <div style={itemsListWrapper}>
            {order.items?.map((item, idx) => (
              <div key={idx} style={orderItemRow}>
                <img src={item.image} alt={item.name} style={orderItemImg} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link to={`/product/${item.slug}`} style={itemTitleLink}>
                    {item.name}
                  </Link>
                  {item.selectedVariant && Object.keys(item.selectedVariant).length > 0 && (
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                      {Object.entries(item.selectedVariant)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(' | ')}
                    </div>
                  )}
                  <div style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 600, marginTop: '4px' }}>
                    {formatINR(item.price)} × {item.quantity} = {formatINR(item.subtotal || item.price * item.quantity)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Status timeline notes */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div style={{ marginTop: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px' }}>
                Shipment Activity Log
              </h4>
              <div style={activityLogList}>
                {order.statusHistory.map((hist, i) => (
                  <div key={i} style={activityLogRow}>
                    <div style={activityDot} />
                    <div>
                      <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>{hist.status}</strong>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        {formatDateTime(hist.timestamp)} {hist.note ? `— ${hist.note}` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Address & Price Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Shipping Address */}
          <div style={infoCard} className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <MapPin size={18} color="#1d4ed8" />
              <strong style={{ fontSize: '0.95rem' }}>Shipping Address</strong>
            </div>
            <div style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.5 }}>
              <strong>{order.shippingAddress?.fullName}</strong> ({order.shippingAddress?.phone})<br />
              {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - <strong>{order.shippingAddress?.pincode}</strong>
            </div>
          </div>

          {/* Payment Info */}
          <div style={infoCard} className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <CreditCard size={18} color="#1d4ed8" />
              <strong style={{ fontSize: '0.95rem' }}>Payment Info</strong>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#334155' }}>
              <div>Method: <strong style={{ textTransform: 'uppercase' }}>{order.paymentMethod}</strong></div>
              <div>Status: <strong style={{ color: order.paymentStatus === 'paid' ? '#059669' : '#b45309', textTransform: 'capitalize' }}>{order.paymentStatus}</strong></div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div style={infoCard} className="card">
            <strong style={{ fontSize: '0.95rem', display: 'block', marginBottom: '12px' }}>
              Payment Summary
            </strong>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Items Subtotal:</span>
                <span>{formatINR(order.itemsPrice)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Shipping:</span>
                <span>{order.shippingPrice === 0 ? 'FREE' : formatINR(order.shippingPrice)}</span>
              </div>
              {order.discountPrice > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 600 }}>
                  <span>Coupon Discount:</span>
                  <span>- {formatINR(order.discountPrice)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '8px', marginTop: '4px' }}>
                <strong style={{ fontSize: '1rem', color: '#0f172a' }}>Total Amount:</strong>
                <strong style={{ fontSize: '1.15rem', color: '#1d4ed8' }}>
                  {formatINR(order.totalPrice)}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div style={modalOverlay}>
          <div style={modalBackdrop} onClick={() => setShowCancelModal(false)} />
          <div style={modalCard} className="animate-slide-up">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>
              Cancel Order?
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
              Are you sure you want to cancel this order? Once cancelled, the inventory will be returned and your payment will be refunded.
            </p>

            <div className="form-group">
              <label className="form-label">Reason for cancellation:</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="form-select"
              >
                <option value="Order placed by mistake">Order placed by mistake</option>
                <option value="Found cheaper elsewhere">Found cheaper elsewhere</option>
                <option value="Delivery time is too long">Delivery time is too long</option>
                <option value="Need to change shipping address">Need to change shipping address</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => setShowCancelModal(false)}
                className="btn btn-outline"
                style={{ flex: 1 }}
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="btn btn-primary"
                style={{ flex: 1, background: '#dc2626' }}
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const backLinkStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  color: '#1d4ed8',
  fontWeight: '600',
  fontSize: '0.85rem',
  marginBottom: '16px',
};

const headerCard = {
  padding: '24px',
  marginBottom: '24px',
};

const statusBadge = {
  padding: '6px 14px',
  borderRadius: '9999px',
  background: '#eff6ff',
  color: '#1d4ed8',
  fontWeight: '700',
  fontSize: '0.8rem',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const trackerContainer = {
  position: 'relative',
  margin: '40px 10px 16px',
};

const trackerLineBackground = {
  position: 'absolute',
  top: '15px',
  left: '5%',
  right: '5%',
  height: '4px',
  background: '#e2e8f0',
  zIndex: 1,
};

const trackerLineProgress = {
  position: 'absolute',
  top: '15px',
  left: '5%',
  height: '4px',
  background: '#1d4ed8',
  zIndex: 2,
  transition: 'width 0.4s ease',
};

const trackerStepsRow = {
  position: 'relative',
  zIndex: 3,
  display: 'flex',
  justifyContent: 'space-between',
};

const trackerStepNode = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '6px',
  width: '70px',
};

const stepCircle = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  border: '2px solid',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.8rem',
  fontWeight: '700',
};

const stepLabel = {
  fontSize: '0.72rem',
  textAlign: 'center',
  lineHeight: 1.2,
};

const cancelledAlertBox = {
  marginTop: '20px',
  padding: '12px 16px',
  background: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const detailsGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '24px',
};


const itemsSectionCard = {
  padding: '24px',
};

const itemsListWrapper = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const orderItemRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  paddingBottom: '16px',
  borderBottom: '1px solid #f1f5f9',
};

const orderItemImg = {
  width: '64px',
  height: '64px',
  objectFit: 'cover',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
};

const itemTitleLink = {
  fontSize: '0.9rem',
  fontWeight: '600',
  color: '#0f172a',
  textDecoration: 'none',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};

const activityLogList = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const activityLogRow = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '10px',
};

const activityDot = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  background: '#1d4ed8',
  marginTop: '6px',
};

const infoCard = {
  padding: '20px',
};

const modalOverlay = {
  position: 'fixed',
  inset: 0,
  zIndex: 3000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px',
};

const modalBackdrop = {
  position: 'absolute',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.5)',
};

const modalCard = {
  position: 'relative',
  background: '#ffffff',
  borderRadius: '16px',
  padding: '24px',
  maxWidth: '440px',
  width: '100%',
  zIndex: 1,
};

export default OrderDetailPage;
