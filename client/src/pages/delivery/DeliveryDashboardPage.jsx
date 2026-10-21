import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  Package,
  MapPin,
  Phone,
  Navigation,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  RotateCw,
  ExternalLink,
  Shield,
  Banknote,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { deliveryService } from '../../services/deliveryService';
import { formatINR, formatDate, formatDateTime } from '../../utils/formatters';

const DeliveryDashboardPage = () => {
  const { user, switchRole, login } = useAuth();
  const { success, error, info } = useToast();

  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'available'
  const [stats, setStats] = useState(null);
  const [activeOrders, setActiveOrders] = useState([]);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const loadData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [statsData, myData, poolData] = await Promise.all([
        deliveryService.getStats().catch(() => null),
        deliveryService.getMyDeliveries().catch(() => []),
        deliveryService.getAvailableDeliveries().catch(() => []),
      ]);
      setStats(statsData);
      setActiveOrders(myData || []);
      setAvailableOrders(poolData || []);
    } catch (err) {
      console.error('Failed to load delivery partner data:', err);
      error('Failed to fetch delivery route assignments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Accept available shipment
  const handleAcceptDelivery = async (orderId) => {
    setUpdatingId(orderId);
    try {
      await deliveryService.acceptDelivery(orderId);
      success('Shipment assigned to you! Package ready for pickup.');
      setActiveTab('active');
      await loadData();
    } catch (err) {
      error(err.response?.data?.message || 'Could not accept shipment.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Update status milestone (Shipped -> Out for delivery -> Delivered)
  const handleUpdateMilestone = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await deliveryService.updateDeliveryStatus(orderId, newStatus, `Rider ${user?.name || ''} executed milestone: ${newStatus}`);
      success(`Status updated to ${newStatus}! Customer tracking notified in real-time.`);
      await loadData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update delivery milestone.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (!user) {
    return (
      <div className="container" style={{ padding: '60px 16px', maxWidth: '520px', margin: '0 auto', textAlign: 'center' }}>
        <div
          className="card"
          style={{
            padding: '40px 32px',
            borderRadius: '24px',
            background: '#ffffff',
            boxShadow: '0 20px 40px -15px rgba(12, 74, 110, 0.15)',
            border: '1px solid #e0f2fe',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '20px',
              background: '#e0f2fe',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <Truck size={38} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a' }}>Delivery Partner Portal</h2>
          <p style={{ color: '#64748b', fontSize: '0.92rem', marginTop: '10px', lineHeight: 1.55 }}>
            Access real-time package dispatches, accept route deliveries, GPS route directions, and COD collection metrics.
          </p>
          <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={async () => {
                const res = await login({ email: 'delivery@casa.in', password: 'Delivery@Casa2026' });
                if (res.success) {
                  success('Welcome to CASA Delivery! Live demo rider session started.');
                }
              }}
              className="btn btn-primary"
              style={{
                padding: '13px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 8px 20px -4px rgba(2, 132, 199, 0.4)',
              }}
            >
              <Sparkles size={17} /> ⚡ 1-Click Launch Delivery Demo
            </button>
            <Link
              to="/login?redirect=/delivery"
              className="btn btn-outline"
              style={{ padding: '12px', borderRadius: '12px', fontWeight: 700 }}
            >
              Sign In with Other Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '24px 16px 60px' }}>
      {/* Non-delivery role warning banner with 1-click switch */}
      {user.role !== 'delivery' && user.role !== 'admin' && (
        <div
          style={{
            background: '#fffbeb',
            border: '1.5px solid #fde68a',
            borderRadius: '14px',
            padding: '14px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={20} color="#d97706" />
            <div>
              <strong style={{ color: '#92400e', fontSize: '0.9rem' }}>You are viewing with account: {user.name} ({user.role.toUpperCase()})</strong>
              <div style={{ color: '#b45309', fontSize: '0.8rem' }}>Switch your persona to Delivery Partner to accept packages and execute delivery runs.</div>
            </div>
          </div>
          <button
            onClick={async () => {
              await switchRole('delivery');
              success('Switched to Delivery Partner persona!');
            }}
            className="btn"
            style={{
              background: '#d97706',
              color: '#ffffff',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.8rem',
            }}
          >
            ⚡ Switch to Delivery Partner (1-Click)
          </button>
        </div>
      )}
      <style>{`
        .rider-kpi-card {
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }
        .rider-kpi-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 24px -6px rgba(15, 23, 42, 0.1);
        }
        .rider-action-btn {
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .rider-action-btn:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 6px 16px -2px rgba(15, 23, 42, 0.18) !important;
        }
      `}</style>

      {/* Rider Header & Portal Switcher */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)',
          borderRadius: '20px',
          padding: '24px 28px',
          color: '#ffffff',
          marginBottom: '28px',
          boxShadow: '0 20px 35px -10px rgba(12, 74, 110, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 16px rgba(249, 115, 22, 0.35)',
            }}
          >
            <Truck size={28} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
                {user?.name || 'Courier Partner'} • CASA Express
              </h1>
              <span
                style={{
                  background: '#22c55e',
                  color: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                }}
              >
                ONLINE & ACTIVE
              </span>
            </div>
            <p style={{ color: '#bae6fd', fontSize: '0.85rem', marginTop: '4px' }}>
              Vehicle: <strong>{user?.vehicleType || 'Two-Wheeler Bike'}</strong> • Fast City Route Dispatch
            </p>
          </div>
        </div>

        {/* Portal Switcher Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: '#bae6fd', marginRight: '4px' }}>Quick Switch:</span>
          <button
            onClick={() => switchRole('user')}
            className="btn btn-sm"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '6px 12px',
            }}
          >
            🛒 Customer Store
          </button>
          <button
            onClick={() => switchRole('vendor')}
            className="btn btn-sm"
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '6px 12px',
            }}
          >
            🏪 Vendor Hub
          </button>
          <button
            onClick={loadData}
            style={{
              background: 'rgba(255,255,255,0.18)',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 10px',
              color: '#fff',
              cursor: 'pointer',
            }}
            title="Refresh Deliveries"
          >
            <RotateCw size={15} />
          </button>
        </div>
      </div>

      {/* Delivery Partner KPI Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div className="card rider-kpi-card" style={{ padding: '20px', borderRadius: '16px', borderLeft: '4px solid #0284c7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>ACTIVE ROUTE RUNS</span>
            <div style={{ padding: '6px', borderRadius: '8px', background: '#e0f2fe', color: '#0284c7' }}>
              <Navigation size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0284c7', marginTop: '10px' }}>
            {activeOrders.filter(o => ['Packed', 'Shipped', 'Out for delivery'].includes(o.orderStatus)).length}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600 }}>Deliveries in progress</span>
        </div>

        <div className="card rider-kpi-card" style={{ padding: '20px', borderRadius: '16px', borderLeft: '4px solid #f97316' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>AVAILABLE FOR PICKUP</span>
            <div style={{ padding: '6px', borderRadius: '8px', background: '#ffedd5', color: '#ea580c' }}>
              <Package size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ea580c', marginTop: '10px' }}>
            {availableOrders.length}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#ea580c', fontWeight: 600 }}>Packages ready at hub</span>
        </div>

        <div className="card rider-kpi-card" style={{ padding: '20px', borderRadius: '16px', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>SUCCESSFUL DELIVERIES</span>
            <div style={{ padding: '6px', borderRadius: '8px', background: '#ecfdf5', color: '#059669' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669', marginTop: '10px' }}>
            {stats?.myCompleted || activeOrders.filter(o => o.orderStatus === 'Delivered').length}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>Orders delivered safely</span>
        </div>

        <div className="card rider-kpi-card" style={{ padding: '20px', borderRadius: '16px', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>RIDER EARNINGS (₹65/DROP)</span>
            <div style={{ padding: '6px', borderRadius: '8px', background: '#f5f3ff', color: '#7c3aed' }}>
              <Banknote size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#7c3aed', marginTop: '10px' }}>
            {formatINR(stats?.earnings || (activeOrders.filter(o => o.orderStatus === 'Delivered').length * 65))}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: 600 }}>Total delivery commissions</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid #e2e8f0', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('active')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'active' ? '3px solid #0284c7' : '3px solid transparent',
            color: activeTab === 'active' ? '#0284c7' : '#64748b',
            fontWeight: 800,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Navigation size={18} />
          <span>My Delivery Tasks ({activeOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('available')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'available' ? '3px solid #0284c7' : '3px solid transparent',
            color: activeTab === 'available' ? '#0284c7' : '#64748b',
            fontWeight: 800,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Package size={18} />
          <span>Available Shipments Pool ({availableOrders.length})</span>
        </button>
      </div>

      {/* Tab 1: Active Assigned Deliveries */}
      {activeTab === 'active' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: '140px', borderRadius: '16px' }} />)}
            </div>
          ) : activeOrders.length === 0 ? (
            <div className="card" style={{ padding: '48px 20px', textAlign: 'center', borderRadius: '16px' }}>
              <Truck size={48} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>No Active Deliveries Assigned</h3>
              <p style={{ color: '#64748b', fontSize: '0.875rem', maxWidth: '420px', margin: '6px auto 16px' }}>
                Open the "Available Shipments Pool" tab above to accept orders packed by vendors and start delivery runs.
              </p>
              <button onClick={() => setActiveTab('available')} className="btn btn-primary" style={{ borderRadius: '10px' }}>
                View Available Shipments
              </button>
            </div>
          ) : (
            activeOrders.map((order) => {
              const isUpdating = updatingId === order._id;
              const isCOD = order.paymentMethod?.toLowerCase() === 'cod';
              const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(`${order.shippingAddress?.street || ''}, ${order.shippingAddress?.city || ''} ${order.shippingAddress?.pincode || ''}`)}`;

              return (
                <div
                  key={order._id}
                  className="card"
                  style={{
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1.5px solid #e2e8f0',
                    boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)',
                  }}
                >
                  {/* Status Banner Bar */}
                  <div
                    style={{
                      padding: '12px 18px',
                      background: order.orderStatus === 'Delivered' ? '#f0fdf4' : order.orderStatus === 'Out for delivery' ? '#eff6ff' : '#fff7ed',
                      borderBottom: '1px solid #e2e8f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>SHIPMENT ID:</span>
                      <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{order.orderNumber}</strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {isCOD ? (
                        <span style={{ padding: '3px 10px', borderRadius: '6px', background: '#fee2e2', color: '#b91c1c', fontSize: '0.75rem', fontWeight: 800 }}>
                          CASH ON DELIVERY: {formatINR(order.totalPrice)}
                        </span>
                      ) : (
                        <span style={{ padding: '3px 10px', borderRadius: '6px', background: '#dcfce7', color: '#15803d', fontSize: '0.75rem', fontWeight: 800 }}>
                          PAID ONLINE • {formatINR(order.totalPrice)}
                        </span>
                      )}

                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          background: order.orderStatus === 'Delivered' ? '#15803d' : order.orderStatus === 'Out for delivery' ? '#2563eb' : '#d97706',
                          color: '#ffffff',
                        }}
                      >
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>

                  {/* Customer Address & Contact */}
                  <div style={{ padding: '18px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '18px' }}>
                    <div style={{ flex: 1, minWidth: '280px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0284c7', fontWeight: 700, fontSize: '0.85rem' }}>
                        <MapPin size={18} />
                        <span>Delivery Destination:</span>
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                        {order.shippingAddress?.fullName || order.user?.name || 'Customer'}
                      </div>
                      <p style={{ color: '#475569', fontSize: '0.875rem', marginTop: '4px', lineHeight: 1.4 }}>
                        {order.shippingAddress?.street}, {order.shippingAddress?.locality ? `${order.shippingAddress.locality}, ` : ''}
                        <strong>{order.shippingAddress?.city} - {order.shippingAddress?.pincode}</strong>
                      </p>

                      <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline btn-sm"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: '#0284c7',
                            borderColor: '#bae6fd',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                          }}
                        >
                          <Navigation size={14} /> Open in Google Maps <ExternalLink size={12} />
                        </a>

                        {order.shippingAddress?.phone && (
                          <a
                            href={`tel:${order.shippingAddress.phone}`}
                            className="btn btn-outline btn-sm"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              color: '#059669',
                              borderColor: '#a7f3d0',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                            }}
                          >
                            <Phone size={14} /> Call {order.shippingAddress.phone}
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Items in Package */}
                    <div style={{ minWidth: '240px', background: '#fafbfc', padding: '12px 14px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>
                        PACKAGE CONTENTS ({order.items?.length || 0}):
                      </div>
                      {order.items?.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{ width: '34px', height: '34px', borderRadius: '6px', objectFit: 'cover' }}
                          />
                          <div style={{ fontSize: '0.8rem', color: '#0f172a', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                            {item.name} <span style={{ color: '#64748b' }}>x{item.quantity}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Rider Milestone Progress Actions */}
                  <div
                    style={{
                      padding: '12px 18px',
                      background: '#f8fafc',
                      borderTop: '1px solid #f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      Placed {formatDateTime(order.createdAt)}
                    </span>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {order.orderStatus === 'Packed' && (
                        <button
                          onClick={() => handleUpdateMilestone(order._id, 'Shipped')}
                          disabled={isUpdating}
                          className="rider-action-btn"
                          style={{
                            padding: '9px 18px',
                            borderRadius: '10px',
                            background: '#0284c7',
                            color: '#ffffff',
                            border: 'none',
                            fontSize: '0.825rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                          }}
                        >
                          📦 Pick Up Package from Hub
                        </button>
                      )}

                      {order.orderStatus === 'Shipped' && (
                        <button
                          onClick={() => handleUpdateMilestone(order._id, 'Out for delivery')}
                          disabled={isUpdating}
                          className="rider-action-btn"
                          style={{
                            padding: '9px 18px',
                            borderRadius: '10px',
                            background: '#ea580c',
                            color: '#ffffff',
                            border: 'none',
                            fontSize: '0.825rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                          }}
                        >
                          🛵 Start Delivery Run (Out for Delivery)
                        </button>
                      )}

                      {order.orderStatus === 'Out for delivery' && (
                        <button
                          onClick={() => handleUpdateMilestone(order._id, 'Delivered')}
                          disabled={isUpdating}
                          className="rider-action-btn"
                          style={{
                            padding: '9px 20px',
                            borderRadius: '10px',
                            background: '#16a34a',
                            color: '#ffffff',
                            border: 'none',
                            fontSize: '0.85rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)',
                          }}
                        >
                          ✅ Confirm Delivered to Customer
                        </button>
                      )}

                      {order.orderStatus === 'Delivered' && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontWeight: 800, fontSize: '0.85rem' }}>
                          <CheckCircle2 size={18} />
                          <span>Delivered on {formatDateTime(order.deliveredAt || order.updatedAt)}</span>
                        </div>
                      )}

                      <Link
                        to={`/orders/${order._id}`}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.78rem', borderRadius: '8px' }}
                      >
                        Order Tracking
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Available Shipments Pool */}
      {activeTab === 'available' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {availableOrders.length === 0 ? (
            <div className="card" style={{ padding: '48px 20px', textAlign: 'center', borderRadius: '16px' }}>
              <Package size={48} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>No Available Shipments in Hub Pool</h3>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                All current customer orders are already picked up or assigned. Check back once vendors mark packages as packed!
              </p>
            </div>
          ) : (
            availableOrders.map((order) => (
              <div
                key={order._id}
                className="card"
                style={{
                  borderRadius: '16px',
                  padding: '18px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{order.orderNumber}</strong>
                    <span style={{ padding: '2px 8px', borderRadius: '6px', background: '#dbeafe', color: '#1d4ed8', fontSize: '0.72rem', fontWeight: 800 }}>
                      {order.orderStatus}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '6px' }}>
                    Destination: <strong>{order.shippingAddress?.city}</strong> • {order.items?.length || 1} item(s) • Value: {formatINR(order.totalPrice)}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                    Customer: {order.user?.name || order.shippingAddress?.fullName} ({order.shippingAddress?.street})
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => handleAcceptDelivery(order._id)}
                    disabled={updatingId === order._id}
                    className="rider-action-btn"
                    style={{
                      padding: '10px 20px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Truck size={16} />
                    <span>Accept & Assign to Me</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default DeliveryDashboardPage;
