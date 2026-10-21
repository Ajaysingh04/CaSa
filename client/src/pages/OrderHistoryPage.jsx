import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ArrowRight,
  Clock,
  CheckCircle2,
  Truck,
  Copy,
  Check,
  Sparkles,
  ShoppingBag,
  RotateCcw,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { orderService } from '../services/orderService';
import { formatINR, formatDate } from '../utils/formatters';

const statusBadgeColors = {
  Pending: { bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
  Confirmed: { bg: '#dbeafe', text: '#1d4ed8', border: '#bfdbfe' },
  Processing: { bg: '#e0e7ff', text: '#4338ca', border: '#c7d2fe' },
  Packed: { bg: '#f3e8ff', text: '#7e22ce', border: '#e9d5ff' },
  Shipped: { bg: '#ccfbf1', text: '#0f766e', border: '#99f6e4' },
  'Out for delivery': { bg: '#ffedd5', text: '#c2410c', border: '#fed7aa' },
  Delivered: { bg: '#d1fae5', text: '#047857', border: '#a7f3d0' },
  Cancelled: { bg: '#fee2e2', text: '#dc2626', border: '#fecaca' },
  'Return requested': { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' },
  Refunded: { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' },
};

const getStatusProgress = (status) => {
  switch (status) {
    case 'Pending':
      return 20;
    case 'Confirmed':
      return 40;
    case 'Processing':
      return 55;
    case 'Packed':
      return 70;
    case 'Shipped':
      return 85;
    case 'Out for delivery':
      return 92;
    case 'Delivered':
      return 100;
    default:
      return 0;
  }
};

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [copiedId, setCopiedId] = useState(null);

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

  const handleCopyOrderNumber = (e, orderNumber, id) => {
    e.stopPropagation();
    e.preventDefault();
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(orderNumber);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2200);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'ACTIVE') {
      return !['Delivered', 'Cancelled', 'Refunded'].includes(order.orderStatus);
    }
    if (activeTab === 'DELIVERED') {
      return order.orderStatus === 'Delivered';
    }
    if (activeTab === 'CANCELLED') {
      return ['Cancelled', 'Refunded', 'Return requested'].includes(order.orderStatus);
    }
    return true;
  });

  const activeCount = orders.filter((o) => !['Delivered', 'Cancelled', 'Refunded'].includes(o.orderStatus)).length;
  const deliveredCount = orders.filter((o) => o.orderStatus === 'Delivered').length;
  const cancelledCount = orders.filter((o) => ['Cancelled', 'Refunded', 'Return requested'].includes(o.orderStatus)).length;

  return (
    <div className="container" style={{ padding: '24px 16px 60px' }}>
      <style>{`
        @keyframes orderFadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.99);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes pulseGlow {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.45);
            opacity: 0.5;
          }
        }

        @keyframes gentleFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes shimmerGlow {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .order-card-animated {
          animation: orderFadeSlideUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
          transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1),
                      box-shadow 0.28s cubic-bezier(0.16, 1, 0.3, 1),
                      border-color 0.25s ease !important;
        }

        .order-card-animated:hover {
          transform: translateY(-4px) !important;
          box-shadow: 0 16px 32px -6px rgba(15, 23, 42, 0.12), 0 4px 12px -2px rgba(15, 23, 42, 0.05) !important;
          border-color: #93c5fd !important;
        }

        .order-action-btn {
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }

        .order-action-btn:hover {
          background: #1d4ed8 !important;
          color: #ffffff !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 14px rgba(29, 78, 216, 0.25) !important;
        }

        .order-action-btn:hover .action-arrow {
          transform: translateX(4px) !important;
        }

        .action-arrow {
          transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }

        .item-thumb-hover {
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }

        .order-item-row:hover .item-thumb-hover {
          transform: scale(1.08) !important;
        }

        .order-item-row {
          transition: background-color 0.18s ease;
          border-radius: 8px;
          padding: 6px;
        }

        .order-item-row:hover {
          background-color: #f8fafc;
        }

        .copy-btn-interactive {
          transition: all 0.2s ease;
        }

        .copy-btn-interactive:hover {
          background: #e2e8f0 !important;
          color: #0f172a !important;
          transform: scale(1.08);
        }

        .filter-pill-btn {
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
          cursor: pointer;
        }

        .filter-pill-btn:hover {
          transform: translateY(-2px) !important;
        }

        .floating-package-icon {
          animation: gentleFloat 3.5s ease-in-out infinite;
        }

        .pulse-dot-indicator {
          display: inline-block;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          animation: pulseGlow 2s infinite ease-in-out;
        }

        @media (max-width: 640px) {
          .order-history-title-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 8px !important;
          }
          .order-history-title {
            font-size: 1.35rem !important;
          }
          .order-card-header-responsive {
            padding: 12px 14px !important;
            gap: 10px !important;
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
          }
          .order-card-header-responsive > div:last-child {
            grid-column: 1 / -1;
            display: flex;
            justify-content: flex-start;
          }
          .order-card-footer-responsive {
            padding: 10px 14px !important;
            flex-direction: column !important;
            gap: 10px !important;
            align-items: stretch !important;
          }
          .order-action-btn {
            width: 100% !important;
            justify-content: center !important;
          }
        }
      `}</style>

      {/* Title & Stats Row */}
      <div
        className="order-history-title-row"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1 className="order-history-title" style={pageTitleStyle}>
            My Orders & Purchases
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '2px' }}>
            Track real-time shipment updates, delivery timelines & invoices
          </p>
        </div>

        {orders.length > 0 && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1d4ed8',
              fontSize: '0.8rem',
              fontWeight: 700,
            }}
          >
            <Sparkles size={14} />
            <span>{orders.length} Total Orders</span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      {orders.length > 0 && (
        <div
          className="touch-scroll-x"
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '20px',
            paddingBottom: '4px',
            overflowX: 'auto',
          }}
        >
          <button
            type="button"
            className="filter-pill-btn"
            onClick={() => setActiveTab('ALL')}
            style={{
              padding: '7px 16px',
              borderRadius: '9999px',
              fontSize: '0.825rem',
              fontWeight: 700,
              border: activeTab === 'ALL' ? '1.5px solid #1d4ed8' : '1.5px solid #e2e8f0',
              background: activeTab === 'ALL' ? '#1d4ed8' : '#ffffff',
              color: activeTab === 'ALL' ? '#ffffff' : '#475569',
              boxShadow: activeTab === 'ALL' ? '0 4px 10px rgba(29, 78, 216, 0.25)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>All Orders</span>
            <span
              style={{
                background: activeTab === 'ALL' ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                color: activeTab === 'ALL' ? '#ffffff' : '#64748b',
                padding: '1px 7px',
                borderRadius: '10px',
                fontSize: '0.72rem',
              }}
            >
              {orders.length}
            </span>
          </button>

          <button
            type="button"
            className="filter-pill-btn"
            onClick={() => setActiveTab('ACTIVE')}
            style={{
              padding: '7px 16px',
              borderRadius: '9999px',
              fontSize: '0.825rem',
              fontWeight: 700,
              border: activeTab === 'ACTIVE' ? '1.5px solid #2563eb' : '1.5px solid #e2e8f0',
              background: activeTab === 'ACTIVE' ? '#2563eb' : '#ffffff',
              color: activeTab === 'ACTIVE' ? '#ffffff' : '#475569',
              boxShadow: activeTab === 'ACTIVE' ? '0 4px 10px rgba(37, 99, 235, 0.25)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>Active / In Transit</span>
            <span
              style={{
                background: activeTab === 'ACTIVE' ? 'rgba(255,255,255,0.25)' : '#eff6ff',
                color: activeTab === 'ACTIVE' ? '#ffffff' : '#2563eb',
                padding: '1px 7px',
                borderRadius: '10px',
                fontSize: '0.72rem',
              }}
            >
              {activeCount}
            </span>
          </button>

          <button
            type="button"
            className="filter-pill-btn"
            onClick={() => setActiveTab('DELIVERED')}
            style={{
              padding: '7px 16px',
              borderRadius: '9999px',
              fontSize: '0.825rem',
              fontWeight: 700,
              border: activeTab === 'DELIVERED' ? '1.5px solid #059669' : '1.5px solid #e2e8f0',
              background: activeTab === 'DELIVERED' ? '#059669' : '#ffffff',
              color: activeTab === 'DELIVERED' ? '#ffffff' : '#475569',
              boxShadow: activeTab === 'DELIVERED' ? '0 4px 10px rgba(5, 150, 105, 0.25)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>Delivered</span>
            <span
              style={{
                background: activeTab === 'DELIVERED' ? 'rgba(255,255,255,0.25)' : '#ecfdf5',
                color: activeTab === 'DELIVERED' ? '#ffffff' : '#059669',
                padding: '1px 7px',
                borderRadius: '10px',
                fontSize: '0.72rem',
              }}
            >
              {deliveredCount}
            </span>
          </button>

          {cancelledCount > 0 && (
            <button
              type="button"
              className="filter-pill-btn"
              onClick={() => setActiveTab('CANCELLED')}
              style={{
                padding: '7px 16px',
                borderRadius: '9999px',
                fontSize: '0.825rem',
                fontWeight: 700,
                border: activeTab === 'CANCELLED' ? '1.5px solid #dc2626' : '1.5px solid #e2e8f0',
                background: activeTab === 'CANCELLED' ? '#dc2626' : '#ffffff',
                color: activeTab === 'CANCELLED' ? '#ffffff' : '#475569',
                boxShadow: activeTab === 'CANCELLED' ? '0 4px 10px rgba(220, 38, 38, 0.25)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>Cancelled / Refunded</span>
              <span
                style={{
                  background: activeTab === 'CANCELLED' ? 'rgba(255,255,255,0.25)' : '#fef2f2',
                  color: activeTab === 'CANCELLED' ? '#ffffff' : '#dc2626',
                  padding: '1px 7px',
                  borderRadius: '10px',
                  fontSize: '0.72rem',
                }}
              >
                {cancelledCount}
              </span>
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{
                height: '160px',
                borderRadius: '14px',
                animation: 'orderFadeSlideUp 0.3s ease both',
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div style={emptyOrdersStyle}>
          <div className="floating-package-icon" style={{ display: 'inline-flex' }}>
            <Package size={56} color="#3b82f6" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '18px' }}>
            {orders.length === 0 ? 'No Orders Placed Yet' : 'No Orders In This Category'}
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '420px', marginTop: '6px' }}>
            {orders.length === 0
              ? 'When you place orders on CASA, their live shipment tracking, delivery progress and invoices will appear right here.'
              : 'Try selecting another tab or check your complete order history above.'}
          </p>
          <Link
            to="/products"
            className="btn btn-primary"
            style={{
              marginTop: '22px',
              padding: '11px 26px',
              borderRadius: '10px',
              fontWeight: 700,
              boxShadow: '0 6px 16px rgba(37, 99, 235, 0.28)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <ShoppingBag size={18} />
            <span>Start Shopping</span>
          </Link>
        </div>
      ) : (
        <div style={ordersListStyle}>
          {filteredOrders.map((order, idx) => {
            const badge = statusBadgeColors[order.orderStatus] || {
              bg: '#f1f5f9',
              text: '#475569',
              border: '#e2e8f0',
            };
            const progress = getStatusProgress(order.orderStatus);
            const isCancelled = ['Cancelled', 'Refunded'].includes(order.orderStatus);
            const isCopied = copiedId === order._id;

            return (
              <div
                key={order._id}
                style={{
                  ...orderCardStyle,
                  animationDelay: `${idx * 0.07}s`,
                }}
                className="card order-card-animated"
              >
                {/* Header */}
                <div style={orderHeaderRow} className="order-card-header-responsive">
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.04em' }}>
                      ORDER NUMBER
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                        {order.orderNumber}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleCopyOrderNumber(e, order.orderNumber, order._id)}
                        className="copy-btn-interactive"
                        style={{
                          background: isCopied ? '#dcfce7' : '#f1f5f9',
                          color: isCopied ? '#15803d' : '#64748b',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '3px 6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.7rem',
                          cursor: 'pointer',
                        }}
                        title="Copy order number"
                      >
                        {isCopied ? <Check size={12} color="#15803d" /> : <Copy size={12} />}
                        {isCopied ? 'Copied!' : ''}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.04em' }}>
                      DATE PLACED
                    </span>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#334155', marginTop: '2px' }}>
                      {formatDate(order.createdAt)}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.04em' }}>
                      TOTAL AMOUNT
                    </span>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1d4ed8', marginTop: '2px' }}>
                      {formatINR(order.totalPrice)}
                    </div>
                  </div>

                  <div>
                    <span
                      style={{
                        ...statusBadgeStyle,
                        background: badge.bg,
                        color: badge.text,
                        border: `1px solid ${badge.border}`,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {!isCancelled && order.orderStatus !== 'Delivered' && (
                        <span
                          className="pulse-dot-indicator"
                          style={{ background: badge.text }}
                        />
                      )}
                      {order.orderStatus === 'Delivered' && (
                        <CheckCircle2 size={13} color="#047857" />
                      )}
                      {isCancelled && (
                        <XCircle size={13} color="#dc2626" />
                      )}
                      {order.orderStatus}
                    </span>
                  </div>
                </div>

                {/* Mini Delivery Progress Bar (only for active or delivered orders) */}
                {!isCancelled && (
                  <div
                    style={{
                      padding: '10px 20px',
                      background: '#fafbfc',
                      borderBottom: '1px solid #f1f5f9',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.75rem',
                        color: '#64748b',
                        marginBottom: '6px',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                        <Truck size={14} color="#2563eb" />
                        <span>Live Delivery Tracker:</span>
                        <strong style={{ color: order.orderStatus === 'Delivered' ? '#047857' : '#1d4ed8' }}>
                          {order.orderStatus === 'Delivered' ? 'Delivered successfully' : order.orderStatus}
                        </strong>
                      </span>
                      <span style={{ fontWeight: 700, color: '#1d4ed8' }}>{progress}%</span>
                    </div>

                    <div
                      style={{
                        width: '100%',
                        height: '6px',
                        borderRadius: '9999px',
                        background: '#e2e8f0',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          width: `${progress}%`,
                          height: '100%',
                          background: order.orderStatus === 'Delivered'
                            ? 'linear-gradient(90deg, #10b981, #059669)'
                            : 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
                          borderRadius: '9999px',
                          transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Items preview */}
                <div style={orderItemsPreview}>
                  {order.items?.map((item, idx2) => (
                    <div key={idx2} className="order-item-row" style={itemPreviewRow}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="item-thumb-hover"
                        style={itemThumb}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={itemPreviewTitle}>{item.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                          Qty: <strong>{item.quantity}</strong> •{' '}
                          <span style={{ color: '#0f172a', fontWeight: 600 }}>
                            {formatINR(item.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer action */}
                <div style={orderCardFooter} className="order-card-footer-responsive">
                  <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Package size={15} color="#94a3b8" />
                    <span>{order.items?.length || 1} item{order.items?.length > 1 ? 's' : ''} in package</span>
                  </div>

                  <Link
                    to={`/orders/${order._id}`}
                    className="order-action-btn"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 18px',
                      borderRadius: '8px',
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      fontSize: '0.825rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    <span>View Complete Details & Tracking</span>
                    <ArrowRight size={15} className="action-arrow" />
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
  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
};

const ordersListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '18px',
};

const orderCardStyle = {
  borderRadius: '14px',
  border: '1px solid #e2e8f0',
  overflow: 'hidden',
  background: '#ffffff',
  boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
};

const orderHeaderRow = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '16px',
  padding: '14px 20px',
  background: '#f8fafc',
  borderBottom: '1px solid #f1f5f9',
};

const statusBadgeStyle = {
  padding: '5px 12px',
  borderRadius: '9999px',
  fontWeight: '700',
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const orderItemsPreview = {
  padding: '14px 20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const itemPreviewRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
};

const itemThumb = {
  width: '54px',
  height: '54px',
  objectFit: 'cover',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  background: '#f8fafc',
};

const itemPreviewTitle = {
  fontSize: '0.875rem',
  fontWeight: '600',
  color: '#0f172a',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const orderCardFooter = {
  padding: '12px 20px',
  background: '#fafbfc',
  borderTop: '1px solid #f1f5f9',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

export default OrderHistoryPage;
