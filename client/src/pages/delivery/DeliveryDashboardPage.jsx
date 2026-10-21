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
  AlertTriangle,
  KeyRound,
  X,
  Check,
  DollarSign,
  Boxes,
  ShieldCheck,
  Power
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { deliveryService } from '../../services/deliveryService';
import { formatINR, formatDate, formatDateTime } from '../../utils/formatters';

const DeliveryDashboardPage = () => {
  const { user, switchRole, login } = useAuth();
  const { success, error, info } = useToast();

  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'available' | 'earnings'
  const [stats, setStats] = useState(null);
  const [activeOrders, setActiveOrders] = useState([]);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [earningsData, setEarningsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Duty status
  const [onDuty, setOnDuty] = useState(true);
  const [togglingDuty, setTogglingDuty] = useState(false);

  // OTP Verification Modal
  const [otpModalOrder, setOtpModalOrder] = useState(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [submittingOtp, setSubmittingOtp] = useState(false);

  // Delivery Attempt Failed Modal
  const [failedModalOrder, setFailedModalOrder] = useState(null);
  const [failedReason, setFailedReason] = useState('Customer unreachable / Phone switched off');
  const [submittingFailed, setSubmittingFailed] = useState(false);

  const loadData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [statsData, myData, poolData, finData] = await Promise.all([
        deliveryService.getStats().catch(() => null),
        deliveryService.getMyDeliveries().catch(() => []),
        deliveryService.getAvailableDeliveries().catch(() => []),
        deliveryService.getEarnings().catch(() => null),
      ]);
      setStats(statsData);
      if (statsData && statsData.onDuty !== undefined) {
        setOnDuty(statsData.onDuty);
      }
      setActiveOrders(myData || []);
      setAvailableOrders(poolData || []);
      setEarningsData(finData);
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

  // Toggle on-duty / off-duty status
  const handleToggleDuty = async () => {
    setTogglingDuty(true);
    try {
      const res = await deliveryService.toggleDutyStatus();
      setOnDuty(res.onDuty);
      if (res.onDuty) {
        success('You are now ONLINE & ready for delivery tasks!');
      } else {
        info('You are now OFF DUTY. New assignments paused.');
      }
      await loadData();
    } catch (err) {
      error('Failed to toggle duty status.');
    } finally {
      setTogglingDuty(false);
    }
  };

  // Accept available shipment
  const handleAcceptDelivery = async (orderId) => {
    if (!onDuty) {
      error('You are currently OFF DUTY. Please turn ON DUTY first.');
      return;
    }
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

  // Confirm Hub Pickup & Barcode Scan
  const handleConfirmPickup = async (orderId) => {
    setUpdatingId(orderId);
    try {
      await deliveryService.confirmPickup(orderId);
      success('Package barcode verified! Picked up from Merchant Hub.');
      await loadData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to confirm pickup.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Start Out for Delivery run
  const handleStartDeliveryRun = async (orderId) => {
    setUpdatingId(orderId);
    try {
      await deliveryService.updateDeliveryStatus(orderId, 'Out for delivery', `Rider ${user?.name || ''} started delivery route run.`);
      success('Order marked Out for Delivery! Customer notified in real-time.');
      await loadData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to start delivery run.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Submit OTP Delivery
  const handleSubmitOtpDelivery = async (e) => {
    e.preventDefault();
    if (!otpModalOrder) return;
    setSubmittingOtp(true);
    try {
      await deliveryService.updateDeliveryStatus(
        otpModalOrder._id,
        'Delivered',
        'Delivered successfully at customer doorstep with OTP confirmation',
        enteredOtp.trim()
      );
      success(`Delivery completed for order ${otpModalOrder.orderNumber}! Payout credited.`);
      setOtpModalOrder(null);
      setEnteredOtp('');
      await loadData();
    } catch (err) {
      error(err.response?.data?.message || 'OTP verification failed. Please check with customer.');
    } finally {
      setSubmittingOtp(false);
    }
  };

  // Submit Failed Attempt
  const handleSubmitFailedAttempt = async (e) => {
    e.preventDefault();
    if (!failedModalOrder) return;
    setSubmittingFailed(true);
    try {
      await deliveryService.updateDeliveryStatus(
        failedModalOrder._id,
        'Delivery Attempt Failed',
        `Attempt failed: ${failedReason}`,
        '',
        failedReason
      );
      info(`Logged failed attempt: ${failedReason}. Reattempt scheduled.`);
      setFailedModalOrder(null);
      await loadData();
    } catch (err) {
      error(err.response?.data?.message || 'Could not log failed attempt.');
    } finally {
      setSubmittingFailed(false);
    }
  };

  // Initiate Return to Origin (RTO)
  const handleInitiateRTO = async (orderId) => {
    if (!window.confirm('Initiate Return-to-Origin (RTO)? This package will be routed back to the merchant fulfillment hub.')) {
      return;
    }
    setUpdatingId(orderId);
    try {
      await deliveryService.updateDeliveryStatus(
        orderId,
        'RTO - Return to Hub',
        'RTO Initiated: Package returning to Merchant Fulfillment Hub.'
      );
      info('Order marked for RTO handover to Merchant Hub.');
      await loadData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to initiate RTO.');
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

      {/* Rider Header with On-Duty Switch & Hub Zone */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
                {user?.name || 'Courier Partner'} • CASA Express Rider
              </h1>
              {/* Duty Toggle Button */}
              <button
                type="button"
                onClick={handleToggleDuty}
                disabled={togglingDuty}
                style={{
                  background: onDuty ? '#22c55e' : '#64748b',
                  color: '#ffffff',
                  padding: '3px 12px',
                  borderRadius: '9999px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: onDuty ? '0 0 12px rgba(34, 197, 94, 0.5)' : 'none'
                }}
              >
                <Power size={11} /> {onDuty ? 'ONLINE (ON DUTY)' : 'OFF DUTY'}
              </button>
            </div>
            <p style={{ color: '#bae6fd', fontSize: '0.85rem', marginTop: '4px' }}>
              Zone: <strong>{stats?.assignedZone || user?.assignedZone || 'Central Hub - Zone 1'}</strong> • Vehicle: <strong>{user?.vehicleType || 'Two-Wheeler Bike'}</strong>
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
            {activeOrders.filter(o => ['Packed', 'Shipped', 'Out for delivery', 'Delivery Attempt Failed'].includes(o.orderStatus)).length}
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
          <span>Available Hub Pool ({availableOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('earnings')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'earnings' ? '3px solid #0284c7' : '3px solid transparent',
            color: activeTab === 'earnings' ? '#0284c7' : '#64748b',
            fontWeight: 800,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <DollarSign size={18} />
          <span>COD & Rider Earnings</span>
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
                Open the "Available Hub Pool" tab above to accept orders packed by vendors and start delivery runs.
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
                      background: order.orderStatus === 'Delivered' ? '#f0fdf4' : order.orderStatus === 'Delivery Attempt Failed' ? '#fef2f2' : order.orderStatus === 'Out for delivery' ? '#eff6ff' : '#fff7ed',
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
                      {order.pickupConfirmedAt && (
                        <span style={{ fontSize: '0.72rem', color: '#0284c7', background: '#e0f2fe', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                          ✓ Hub Scanned
                        </span>
                      )}
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
                          background: order.orderStatus === 'Delivered' ? '#15803d' : order.orderStatus === 'Delivery Attempt Failed' ? '#dc2626' : order.orderStatus === 'Out for delivery' ? '#2563eb' : '#d97706',
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

                      {order.failedAttemptReason && (
                        <div style={{ marginTop: '8px', padding: '8px 12px', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fee2e2', color: '#991b1b', fontSize: '0.78rem' }}>
                          <strong>Last Failed Reason:</strong> {order.failedAttemptReason}
                          {order.reattemptDate && ` (Reattempt scheduled: ${formatDate(order.reattemptDate)})`}
                        </div>
                      )}

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

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {/* Step 1: Scan & Pick Up */}
                      {(order.orderStatus === 'Packed' || (order.orderStatus === 'Confirmed' && !order.pickupConfirmedAt)) && (
                        <button
                          onClick={() => handleConfirmPickup(order._id)}
                          disabled={isUpdating}
                          className="rider-action-btn"
                          style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            background: '#0284c7',
                            color: '#ffffff',
                            border: 'none',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                          }}
                        >
                          📦 Confirm Hub Pickup & Barcode Scan
                        </button>
                      )}

                      {/* Step 2: Start Out for delivery run */}
                      {['Shipped', 'Delivery Attempt Failed'].includes(order.orderStatus) && (
                        <button
                          onClick={() => handleStartDeliveryRun(order._id)}
                          disabled={isUpdating}
                          className="rider-action-btn"
                          style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            background: '#ea580c',
                            color: '#ffffff',
                            border: 'none',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                          }}
                        >
                          🛵 Start Delivery Run (Out for Delivery)
                        </button>
                      )}

                      {/* Step 3: Out for delivery actions */}
                      {order.orderStatus === 'Out for delivery' && (
                        <>
                          <button
                            onClick={() => {
                              setOtpModalOrder(order);
                              setEnteredOtp('');
                            }}
                            className="rider-action-btn"
                            style={{
                              padding: '8px 18px',
                              borderRadius: '8px',
                              background: '#16a34a',
                              color: '#ffffff',
                              border: 'none',
                              fontSize: '0.82rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.35)',
                            }}
                          >
                            ✅ Verify OTP & Deliver
                          </button>

                          <button
                            onClick={() => {
                              setFailedModalOrder(order);
                              setFailedReason('Customer unreachable / Phone switched off');
                            }}
                            className="rider-action-btn"
                            style={{
                              padding: '8px 14px',
                              borderRadius: '8px',
                              background: '#dc2626',
                              color: '#ffffff',
                              border: 'none',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            ⚠️ Attempt Failed
                          </button>

                          <button
                            onClick={() => handleInitiateRTO(order._id)}
                            className="rider-action-btn"
                            style={{
                              padding: '8px 12px',
                              borderRadius: '8px',
                              background: '#475569',
                              color: '#ffffff',
                              border: 'none',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            🔄 Initiate RTO
                          </button>
                        </>
                      )}

                      {order.orderStatus === 'Delivered' && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontWeight: 800, fontSize: '0.82rem' }}>
                          <CheckCircle2 size={16} />
                          <span>Delivered on {formatDateTime(order.deliveredAt || order.updatedAt)}</span>
                        </div>
                      )}

                      <Link
                        to={`/orders/${order._id}`}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.78rem', borderRadius: '8px' }}
                      >
                        Tracking Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Available Hub Pool */}
      {activeTab === 'available' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!onDuty && (
            <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '12px', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.85rem', color: '#991b1b', fontWeight: 700 }}>
                ⚠️ You are currently OFF DUTY. You must turn ON DUTY in the header to accept and claim orders.
              </div>
              <button onClick={handleToggleDuty} className="btn btn-sm btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>
                Go Online
              </button>
            </div>
          )}

          {availableOrders.length === 0 ? (
            <div className="card" style={{ padding: '48px 20px', textAlign: 'center', borderRadius: '16px' }}>
              <Package size={48} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>No Available Shipments in Hub Pool</h3>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                All current customer orders are already picked up or assigned. Check back once merchants finish packing parcels!
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
                    {order.paymentMethod === 'cod' ? (
                      <span style={{ padding: '2px 8px', borderRadius: '6px', background: '#fee2e2', color: '#dc2626', fontSize: '0.72rem', fontWeight: 800 }}>
                        COD: {formatINR(order.totalPrice)}
                      </span>
                    ) : (
                      <span style={{ padding: '2px 8px', borderRadius: '6px', background: '#dcfce7', color: '#16a34a', fontSize: '0.72rem', fontWeight: 800 }}>
                        Prepaid ({formatINR(order.totalPrice)})
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '6px' }}>
                    Destination: <strong>{order.shippingAddress?.city} ({order.shippingAddress?.pincode})</strong> • {order.items?.length || 1} parcel item(s)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                    Address: {order.shippingAddress?.street}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => handleAcceptDelivery(order._id)}
                    disabled={updatingId === order._id || !onDuty}
                    className="rider-action-btn"
                    style={{
                      padding: '10px 20px',
                      borderRadius: '10px',
                      background: onDuty ? 'linear-gradient(135deg, #0284c7, #0369a1)' : '#cbd5e1',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      cursor: onDuty ? 'pointer' : 'not-allowed',
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

      {/* Tab 3: COD & Rider Earnings */}
      {activeTab === 'earnings' && (
        <div>
          {/* Earnings KPI grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            <div className="card" style={{ padding: '20px', borderRadius: '16px', borderTop: '4px solid #16a34a' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>NET RIDER EARNINGS</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#16a34a', marginTop: '10px' }}>
                {formatINR(earningsData?.summary?.totalEarnings || 0)}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                ₹65/drop + {formatINR(earningsData?.summary?.incentives || 0)} speed bonus
              </span>
            </div>

            <div className="card" style={{ padding: '20px', borderRadius: '16px', borderTop: '4px solid #dc2626' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>COD CASH IN HAND</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#dc2626', marginTop: '10px' }}>
                {formatINR(earningsData?.summary?.codCollected || stats?.codCashInHand || 0)}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 700 }}>
                {earningsData?.summary?.codDepositStatus || 'Pending Shift Deposit at Hub'}
              </span>
            </div>

            <div className="card" style={{ padding: '20px', borderRadius: '16px', borderTop: '4px solid #0284c7' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>TOTAL PARCELS DELIVERED</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0284c7', marginTop: '10px' }}>
                {earningsData?.summary?.totalDeliveries || 0}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>100% on-time SLA rate</span>
            </div>

            <div className="card" style={{ padding: '20px', borderRadius: '16px', borderTop: '4px solid #7c3aed' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>WEEKLY BANK PAYOUT</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#7c3aed', marginTop: '10px' }}>
                {earningsData?.summary?.nextPayoutDate || 'Upcoming Tuesday'}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {earningsData?.summary?.bankAccount || 'Direct Bank NEFT'}
              </span>
            </div>
          </div>

          {/* COD Deposit Warning & Reconciliation Guide */}
          <div
            className="card"
            style={{
              padding: '16px 20px',
              borderRadius: '14px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                COD Cash Settlement Rule
              </div>
              <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '4px' }}>
                All Cash on Delivery collections must be handed over to Hub Cashier before end of shift (10:00 PM). Automatic audit logs reconciliation status.
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ padding: '4px 12px', borderRadius: '9999px', background: '#e0f2fe', color: '#0369a1', fontSize: '0.75rem', fontWeight: 800 }}>
                Flipkart Express Logistics Verified
              </span>
            </div>
          </div>

          {/* Completed Runs Audit Ledger */}
          <div className="card" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <div style={{ padding: '16px 20px', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Delivered Shipments Audit Ledger
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 0' }}>
                Itemized breakdown of completed delivery runs with per-order payout and COD collection receipts.
              </p>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>
                    <th style={{ padding: '12px 16px' }}>SHIPMENT ID</th>
                    <th style={{ padding: '12px 16px' }}>RECIPIENT</th>
                    <th style={{ padding: '12px 16px' }}>CITY</th>
                    <th style={{ padding: '12px 16px' }}>PAYMENT</th>
                    <th style={{ padding: '12px 16px' }}>COD COLLECTED</th>
                    <th style={{ padding: '12px 16px' }}>RIDER PAYOUT</th>
                    <th style={{ padding: '12px 16px' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {(!earningsData?.runHistory || earningsData.runHistory.length === 0) ? (
                    <tr>
                      <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                        No delivery runs completed yet today. Accept shipments from the pool to start earning!
                      </td>
                    </tr>
                  ) : (
                    earningsData.runHistory.map((run, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>{run.orderNumber}</td>
                        <td style={{ padding: '12px 16px', color: '#475569' }}>{run.customerName}</td>
                        <td style={{ padding: '12px 16px', color: '#475569' }}>{run.city}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: run.paymentMethod === 'COD' ? '#dc2626' : '#16a34a' }}>
                            {run.paymentMethod}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: run.codAmount > 0 ? '#dc2626' : '#64748b' }}>
                          {run.codAmount > 0 ? formatINR(run.codAmount) : '₹0 (Prepaid)'}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 800, color: '#16a34a' }}>
                          +{formatINR(run.payout)}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ padding: '3px 10px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 800, background: '#dcfce7', color: '#15803d' }}>
                            Delivered
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* OTP Delivery Verification Modal */}
      {otpModalOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2500,
            padding: '16px',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '480px',
              width: '100%',
              background: '#ffffff',
              borderRadius: '20px',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={20} color="#16a34a" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Confirm Delivery with OTP
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOtpModalOrder(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* COD Cash Collection Warning in Modal */}
            {otpModalOrder.paymentMethod === 'cod' ? (
              <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.8rem', color: '#991b1b', fontWeight: 700 }}>💵 CASH COLLECTION REQUIRED</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#dc2626', marginTop: '4px' }}>
                  Collect {formatINR(otpModalOrder.totalPrice)} in Cash
                </div>
                <div style={{ fontSize: '0.75rem', color: '#7f1d1d', marginTop: '2px' }}>
                  Please collect cash payment from recipient before entering their verification OTP.
                </div>
              </div>
            ) : (
              <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 700 }}>✅ PREPAID SHIPMENT</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#15803d', marginTop: '2px' }}>
                  No Cash to Collect (Paid Online: {formatINR(otpModalOrder.totalPrice)})
                </div>
              </div>
            )}

            <div style={{ marginBottom: '14px', fontSize: '0.85rem', color: '#475569' }}>
              Recipient: <strong>{otpModalOrder.shippingAddress?.fullName || 'Customer'}</strong>
              <br />
              Order: <strong>{otpModalOrder.orderNumber}</strong>
            </div>

            <form onSubmit={handleSubmitOtpDelivery}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Enter 4-Digit Delivery Verification OTP
                </label>
                <input
                  type="text"
                  required
                  maxLength="4"
                  placeholder="e.g. 5821"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '2px solid #cbd5e1',
                    fontSize: '1.4rem',
                    letterSpacing: '0.3em',
                    textAlign: 'center',
                    fontWeight: 800,
                  }}
                  autoFocus
                />
                <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', marginTop: '6px' }}>
                  The 4-digit code is visible on the customer's Order Tracking Page and SMS notification.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setOtpModalOrder(null)}
                  className="btn btn-outline"
                  style={{ padding: '9px 18px', borderRadius: '10px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOtp || enteredOtp.length < 4}
                  className="btn btn-primary"
                  style={{
                    padding: '9px 22px',
                    borderRadius: '10px',
                    fontWeight: 800,
                    background: '#16a34a',
                    border: 'none',
                  }}
                >
                  {submittingOtp ? 'Verifying...' : 'Verify OTP & Mark Delivered'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delivery Attempt Failed Modal */}
      {failedModalOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2500,
            padding: '16px',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '480px',
              width: '100%',
              background: '#ffffff',
              borderRadius: '20px',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={20} color="#dc2626" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Report Delivery Attempt Failed
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setFailedModalOrder(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.825rem', color: '#64748b', marginBottom: '16px' }}>
              Select the primary reason for failed doorstep delivery. A reattempt will automatically be scheduled for the next business day.
            </p>

            <form onSubmit={handleSubmitFailedAttempt}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  Reason for Failure
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    'Customer unreachable / Phone switched off',
                    'Premises locked / Door not opened',
                    'Customer requested delivery on future date',
                    'Incorrect or incomplete delivery address',
                    'Customer refused to accept parcel',
                    'Customer does not have COD cash ready'
                  ].map((r) => (
                    <label
                      key={r}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: failedReason === r ? '2px solid #dc2626' : '1px solid #cbd5e1',
                        background: failedReason === r ? '#fef2f2' : '#ffffff',
                        cursor: 'pointer',
                        fontSize: '0.825rem',
                        fontWeight: failedReason === r ? 700 : 500,
                        color: failedReason === r ? '#991b1b' : '#334155'
                      }}
                    >
                      <input
                        type="radio"
                        name="failedReason"
                        checked={failedReason === r}
                        onChange={() => setFailedReason(r)}
                      />
                      <span>{r}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setFailedModalOrder(null)}
                  className="btn btn-outline"
                  style={{ padding: '9px 18px', borderRadius: '10px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingFailed}
                  className="btn btn-primary"
                  style={{
                    padding: '9px 22px',
                    borderRadius: '10px',
                    fontWeight: 800,
                    background: '#dc2626',
                    border: 'none',
                  }}
                >
                  {submittingFailed ? 'Logging Failure...' : 'Schedule Reattempt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryDashboardPage;
