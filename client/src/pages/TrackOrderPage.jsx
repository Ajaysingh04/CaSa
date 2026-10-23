import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Package,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Copy,
  Check,
  ShieldCheck,
  Phone,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { orderService } from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatINR, formatDateTime, formatDate } from '../utils/formatters';

const TRACKING_STEPS = [
  { key: 'Confirmed', label: 'Order Confirmed', desc: 'Verified and payment approved' },
  { key: 'Packed', label: 'Packed & Dispatched', desc: 'Securely packed at fulfillment hub' },
  { key: 'Shipped', label: 'In Transit', desc: 'Handed over to express courier fleet' },
  { key: 'Out for delivery', label: 'Out for Delivery', desc: 'Courier rider on route to address' },
  { key: 'Delivered', label: 'Delivered', desc: 'Handed over to customer' },
];

const getStepIndex = (status) => {
  switch (status) {
    case 'Pending':
      return 0;
    case 'Confirmed':
    case 'Processing':
      return 0;
    case 'Packed':
      return 1;
    case 'Shipped':
      return 2;
    case 'Out for delivery':
      return 3;
    case 'Delivered':
      return 4;
    default:
      return 1;
  }
};

const TrackOrderPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('id') || searchParams.get('order') || '';
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [copiedAwb, setCopiedAwb] = useState(false);
  const [myRecentOrders, setMyRecentOrders] = useState([]);

  const { user } = useAuth();
  const { error, success } = useToast();

  // If user is logged in, fetch their recent orders for 1-click tracking
  useEffect(() => {
    if (user) {
      orderService.getMyOrders()
        .then((orders) => {
          if (Array.isArray(orders)) {
            setMyRecentOrders(orders.slice(0, 5));
          }
        })
        .catch(() => {});
    }
  }, [user]);

  // Execute tracking query
  const performTrack = async (queryToTrack) => {
    const q = (queryToTrack || '').trim();
    if (!q) {
      error('Please enter an Order ID or Tracking Number.');
      return;
    }

    setLoading(true);
    setSearched(true);
    setSearchParams({ id: q });

    try {
      const data = await orderService.publicTrackOrder(q);
      setTrackingData(data);
    } catch (err) {
      console.warn('Track order lookup failed:', err);
      setTrackingData(null);
      error(err.response?.data?.message || `No order found with reference "${q}". Please check your Order ID.`);
    } finally {
      setLoading(false);
    }
  };

  // Auto-search if URL has query
  useEffect(() => {
    if (initialQuery) {
      performTrack(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    performTrack(searchInput);
  };

  const handleCopyAwb = (awb) => {
    if (!awb) return;
    navigator.clipboard.writeText(awb);
    setCopiedAwb(true);
    success('AWB Tracking Number copied!');
    setTimeout(() => setCopiedAwb(false), 2000);
  };

  const currentStepIdx = trackingData ? getStepIndex(trackingData.status) : 0;

  return (
    <div style={{ width: '100%', minHeight: '85vh', background: '#f8fafc', padding: '36px 0 80px' }}>
      <style>{`
        .track-hero-box {
          background: linear-gradient(135deg, #09101d 0%, #0f172a 45%, #1e3a8a 100%);
          border-radius: 24px;
          padding: 44px 32px;
          color: #ffffff;
          box-shadow: 0 20px 45px -10px rgba(15, 23, 42, 0.35);
          position: relative;
          overflow: hidden;
          margin-bottom: 32px;
        }
        @media (max-width: 640px) {
          .track-hero-box {
            padding: 28px 18px !important;
            border-radius: 18px !important;
          }
        }
        .track-input-container {
          display: flex;
          align-items: center;
          background: #ffffff;
          border-radius: 9999px;
          padding: 6px 8px 6px 18px;
          box-shadow: 0 10px 25px -4px rgba(0, 0, 0, 0.25);
          max-width: 580px;
          margin: 20px auto 0;
        }
        @media (max-width: 640px) {
          .track-input-container {
            border-radius: 14px;
            flex-direction: column;
            padding: 10px;
            gap: 10px;
          }
          .track-input-container input {
            width: 100% !important;
            text-align: center;
          }
          .track-input-container button {
            width: 100% !important;
          }
        }
        @keyframes pulseTrackDot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.6; }
        }
        .live-pulse-dot {
          display: inline-block;
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
          animation: pulseTrackDot 2s infinite ease-in-out;
        }
        .stepper-progress-line {
          position: absolute;
          top: 20px;
          left: 10%;
          right: 10%;
          height: 3px;
          background: #e2e8f0;
          z-index: 1;
        }
        .stepper-progress-active {
          height: 100%;
          background: #2563eb;
          transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @media (max-width: 768px) {
          .desktop-stepper-row {
            display: none !important;
          }
          .mobile-vertical-stepper {
            display: flex !important;
          }
        }
        @media (min-width: 769px) {
          .desktop-stepper-row {
            display: flex !important;
          }
          .mobile-vertical-stepper {
            display: none !important;
          }
        }
      `}</style>

      <div className="container" style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* Hero Section with Search Input */}
        <div className="track-hero-box">
          <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                padding: '4px 14px',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                marginBottom: '14px',
              }}
            >
              <Truck size={14} color="#38bdf8" /> 24x7 LIVE SHIPMENT RADAR
            </div>

            <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 900, margin: '0 0 10px', letterSpacing: '-0.025em' }}>
              Track Your CASA Shipment
            </h1>

            <p style={{ fontSize: '0.92rem', color: '#cbd5e1', maxWidth: '520px', margin: '0 auto' }}>
              Enter your Order Number or Courier AWB to see real-time dispatch, transit hubs, and expected doorstep delivery.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="track-input-container">
                <Search size={20} color="#64748b" style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Enter Order Number (e.g. ORD-2026-9214) or AWB..."
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.92rem',
                    color: '#0f172a',
                    padding: '10px 14px',
                    fontWeight: 600,
                  }}
                />
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '12px 24px',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    cursor: loading ? 'wait' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                    transition: 'all 0.2s',
                  }}
                >
                  {loading ? (
                    <span>Locating...</span>
                  ) : (
                    <>
                      <span>Track Shipment</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Logged in User Quick Picks */}
            {myRecentOrders.length > 0 && (
              <div style={{ marginTop: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Your Recent Orders:</span>
                {myRecentOrders.map((ord) => (
                  <button
                    key={ord._id}
                    type="button"
                    onClick={() => {
                      setSearchInput(ord.orderNumber || ord._id);
                      performTrack(ord.orderNumber || ord._id);
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.12)',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      color: '#f8fafc',
                      borderRadius: '9999px',
                      padding: '3px 10px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span>{ord.orderNumber || ord._id.slice(-6)}</span>
                    <span style={{ color: '#38bdf8' }}>({ord.status})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Live Tracking Result Card */}
        {trackingData && (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1.5px solid #e2e8f0',
              boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.08)',
              overflow: 'hidden',
              marginBottom: '32px',
            }}
          >
            {/* Top Status Header Bar */}
            <div
              style={{
                padding: '24px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                background: '#fafafa',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="live-pulse-dot" />
                  <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Active Shipment Status
                  </span>
                </div>
                <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a' }}>
                  {trackingData.status === 'Delivered' ? 'Delivered' : `Status: ${trackingData.status}`}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                  Order Reference: <strong style={{ color: '#0f172a' }}>{trackingData.orderNumber}</strong> • Placed on {formatDate(trackingData.createdAt)}
                </div>
              </div>

              {/* Estimated Delivery Badge */}
              <div
                style={{
                  background: '#eff6ff',
                  border: '1.5px solid #bfdbfe',
                  borderRadius: '14px',
                  padding: '12px 18px',
                  textAlign: 'right',
                }}
              >
                <div style={{ fontSize: '0.72rem', color: '#1d4ed8', fontWeight: 800, textTransform: 'uppercase' }}>
                  Estimated Doorstep Delivery
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1e40af' }}>
                  {formatDate(trackingData.tracking?.estimatedDelivery || Date.now())}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Delivering to: {trackingData.shippingCity} ({trackingData.shippingPincode})
                </div>
              </div>
            </div>

            {/* Stepper Progress Bar (Desktop) */}
            <div style={{ padding: '36px 24px', position: 'relative' }}>
              <div className="desktop-stepper-row" style={{ position: 'relative', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                {/* Horizontal Progress Connecting Line */}
                <div className="stepper-progress-line">
                  <div
                    className="stepper-progress-active"
                    style={{
                      width: `${(currentStepIdx / (TRACKING_STEPS.length - 1)) * 100}%`,
                    }}
                  />
                </div>

                {TRACKING_STEPS.map((step, idx) => {
                  const isDone = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;

                  return (
                    <div
                      key={step.key}
                      style={{
                        position: 'relative',
                        zIndex: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        maxWidth: '140px',
                      }}
                    >
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          background: isDone ? '#2563eb' : '#ffffff',
                          border: isDone ? '2px solid #2563eb' : '2px solid #cbd5e1',
                          color: isDone ? '#ffffff' : '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: isCurrent ? '0 0 0 4px rgba(37, 99, 235, 0.25)' : 'none',
                          marginBottom: '10px',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {isDone ? <CheckCircle2 size={20} /> : <Clock size={18} />}
                      </div>

                      <strong style={{ fontSize: '0.85rem', color: isDone ? '#0f172a' : '#94a3b8', display: 'block', marginBottom: '2px' }}>
                        {step.label}
                      </strong>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.3 }}>
                        {step.desc}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Vertical Stepper for Mobile */}
              <div className="mobile-vertical-stepper" style={{ flexDirection: 'column', gap: '20px' }}>
                {TRACKING_STEPS.map((step, idx) => {
                  const isDone = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;

                  return (
                    <div key={step.key} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: isDone ? '#2563eb' : '#ffffff',
                          border: isDone ? '2px solid #2563eb' : '2px solid #cbd5e1',
                          color: isDone ? '#ffffff' : '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          boxShadow: isCurrent ? '0 0 0 3px rgba(37, 99, 235, 0.25)' : 'none',
                        }}
                      >
                        {isDone ? <CheckCircle2 size={16} /> : <Clock size={14} />}
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.88rem', color: isDone ? '#0f172a' : '#94a3b8', display: 'block' }}>
                          {step.label}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {step.desc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Courier & AWB Logistics Strip */}
            <div
              style={{
                background: '#f8fafc',
                borderTop: '1px solid #f1f5f9',
                borderBottom: '1px solid #f1f5f9',
                padding: '20px 24px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Courier Fleet</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <Truck size={16} color="#2563eb" />
                  <span>{trackingData.tracking?.carrier || 'Delhivery Express Surface'}</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>AWB Tracking Number</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                  <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#2563eb', letterSpacing: '0.04em' }}>
                    {trackingData.tracking?.awbNumber || `DLV-${trackingData.orderNumber}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyAwb(trackingData.tracking?.awbNumber || `DLV-${trackingData.orderNumber}`)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: copiedAwb ? '#059669' : '#64748b',
                    }}
                    title="Copy AWB Tracking Number"
                  >
                    {copiedAwb ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Delivery Destination</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <MapPin size={15} color="#059669" />
                  <span>{trackingData.shippingCity}, {trackingData.shippingState} - {trackingData.shippingPincode}</span>
                </div>
              </div>
            </div>

            {/* Package Contents */}
            <div style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>
                Items in This Shipment ({trackingData.items?.length || 1})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {trackingData.items?.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: '#f8fafc',
                      borderRadius: '12px',
                      border: '1px solid #f1f5f9',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200&auto=format&fit=crop&q=80'}
                        alt={item.name}
                        style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                      <div>
                        <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block' }}>{item.name}</strong>
                        <span style={{ fontSize: '0.76rem', color: '#64748b' }}>Qty: {item.quantity} • Verified Dispatch</span>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                      {formatINR(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order total & bottom shortcuts */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ fontSize: '0.88rem', color: '#64748b' }}>
                  Total Order Value: <strong style={{ color: '#0f172a', fontSize: '1.05rem' }}>{formatINR(trackingData.totalPrice)}</strong> ({trackingData.paymentMethod?.toUpperCase()})
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <Link
                    to={`/orders/${trackingData._id}`}
                    style={{
                      background: '#f1f5f9',
                      color: '#334155',
                      padding: '8px 16px',
                      borderRadius: '10px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    View Full Order & Invoice
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setTrackingData(null);
                      setSearchInput('');
                      setSearchParams({});
                    }}
                    style={{
                      background: '#2563eb',
                      color: '#ffffff',
                      padding: '8px 16px',
                      borderRadius: '10px',
                      border: 'none',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Track Another Shipment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Informative Help Guide if no active result */}
        {!trackingData && (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1.5px solid #e2e8f0',
              padding: '36px 28px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Package size={28} />
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
              Where do I find my Order ID?
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', maxWidth: '520px', margin: '0 auto 24px', lineHeight: 1.55 }}>
              Your Order Number starts with <strong>ORD-2026-XXXX</strong>. It was sent to your registered email & phone upon checkout and is also visible on your Order Confirmation receipt.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', textAlign: 'left' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                  📱 SMS Notification
                </strong>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Check the live dispatch SMS sent from CASA when your order was processed.
                </span>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                  📧 Order Email Receipt
                </strong>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Your confirmation invoice contains the order number right under the subject line.
                </span>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                  👤 Account Orders
                </strong>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Logged-in customers can view their complete shipment timeline in{' '}
                  <Link to="/orders" style={{ color: '#2563eb', fontWeight: 700 }}>
                    My Orders →
                  </Link>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrderPage;
