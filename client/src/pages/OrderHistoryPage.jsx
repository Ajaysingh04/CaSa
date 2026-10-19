import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { orderService } from '../services/orderService';
import { formatINR, formatDate } from '../utils/formatters';

const statusBadgeColors = {
  Pending: { bg: '#fef3c7', text: '#b45309' },
  Confirmed: { bg: '#dbeafe', text: '#1d4ed8' },
  Processing: { bg: '#e0e7ff', text: '#4338ca' },
  Packed: { bg: '#f3e8ff', text: '#7e22ce' },
  Shipped: { bg: '#ccfbf1', text: '#0f766e' },
  'Out for delivery': { bg: '#ffedd5', text: '#c2410c' },
  Delivered: { bg: '#d1fae5', text: '#047857' },
  Cancelled: { bg: '#fee2e2', text: '#dc2626' },
  'Return requested': { bg: '#f1f5f9', text: '#475569' },
  Refunded: { bg: '#f3f4f6', text: '#374151' },
};

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderService.getMyOrders();
        setOrders(data || []);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="container" style={{ padding: '24px 16px 60px' }}>
      <style>{`
        @media (max-width: 640px) {
          .order-history-title {
            font-size: 1.35rem !important;
          }
          .order-card-header-responsive {
            padding: 12px 14px !important;
            gap: 10px !important;
          }
        }
      `}</style>
      <h1 className="order-history-title" style={pageTitleStyle}>My Orders & Purchases</h1>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '140px', borderRadius: '12px' }} />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div style={emptyOrdersStyle}>
          <Package size={56} color="#94a3b8" />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', marginTop: '16px' }}>
            No Orders Placed Yet
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '400px', marginTop: '6px' }}>
            When you place orders on CASA, their shipment progress and history will be visible here.
          </p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: '20px' }}>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div style={ordersListStyle}>
          {orders.map((order) => {
            const badge = statusBadgeColors[order.orderStatus] || { bg: '#f1f5f9', text: '#475569' };

            return (
              <div key={order._id} style={orderCardStyle} className="card">
                {/* Header */}
                <div style={orderHeaderRow}>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>ORDER NUMBER</span>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                      {order.orderNumber}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>DATE PLACED</span>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#334155' }}>
                      {formatDate(order.createdAt)}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>TOTAL AMOUNT</span>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1d4ed8' }}>
                      {formatINR(order.totalPrice)}
                    </div>
                  </div>

                  <span
                    style={{
                      ...statusBadgeStyle,
                      background: badge.bg,
                      color: badge.text,
                    }}
                  >
                    {order.orderStatus}
                  </span>
                </div>

                {/* Items preview */}
                <div style={orderItemsPreview}>
                  {order.items?.map((item, idx) => (
                    <div key={idx} style={itemPreviewRow}>
                      <img src={item.image} alt={item.name} style={itemThumb} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={itemPreviewTitle}>{item.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          Qty: {item.quantity} • {formatINR(item.price)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer action */}
                <div style={orderCardFooter}>
                  <Link to={`/orders/${order._id}`} className="section-link">
                    View Complete Details & Tracking <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const pageTitleStyle = {
  fontSize: '1.75rem',
  fontWeight: '800',
  color: '#0f172a',
  letterSpacing: '-0.02em',
  marginBottom: '20px',
};

const emptyOrdersStyle = {
  background: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  padding: '60px 20px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
};

const ordersListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const orderCardStyle = {
  borderRadius: '14px',
  border: '1px solid #e2e8f0',
  overflow: 'hidden',
  background: '#ffffff',
};

const orderHeaderRow = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '16px',
  padding: '16px 20px',
  background: '#f8fafc',
  borderBottom: '1px solid #f1f5f9',
};

const statusBadgeStyle = {
  padding: '4px 10px',
  borderRadius: '9999px',
  fontWeight: '700',
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const orderItemsPreview = {
  padding: '16px 20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const itemPreviewRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const itemThumb = {
  width: '54px',
  height: '54px',
  objectFit: 'cover',
  borderRadius: '6px',
  border: '1px solid #e2e8f0',
};

const itemPreviewTitle = {
  fontSize: '0.9rem',
  fontWeight: '600',
  color: '#0f172a',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const orderCardFooter = {
  padding: '12px 20px',
  borderTop: '1px solid #f1f5f9',
  display: 'flex',
  justifyContent: 'flex-end',
};

export default OrderHistoryPage;
