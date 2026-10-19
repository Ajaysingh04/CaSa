import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle, Package, ArrowRight, Truck, MapPin } from 'lucide-react';
import { orderService } from '../services/orderService';
import { formatINR, formatDate } from '../utils/formatters';

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    const fetchOrder = async () => {
      try {
        const data = await orderService.getOrderById(orderId);
        setOrder(data);
      } catch (err) {
        console.error('Failed to load confirmed order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 16px', textAlign: 'center' }}>
        <div className="skeleton" style={{ width: '120px', height: '120px', borderRadius: '50%', margin: '0 auto' }} />
        <div className="skeleton" style={{ width: '320px', height: '28px', margin: '20px auto 0' }} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container" style={{ padding: '80px 16px', textAlign: 'center' }}>
        <h2>Order Not Found</h2>
        <Link to="/orders" className="btn btn-primary" style={{ marginTop: '16px' }}>
          View Order History
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '32px 12px 80px', maxWidth: '780px' }}>
      <style>{`
        @media (max-width: 640px) {
          .confirmation-card-responsive {
            padding: 24px 16px !important;
            border-radius: 14px !important;
          }
          .confirmation-title-responsive {
            font-size: 1.35rem !important;
          }
          .confirmation-btn-row-responsive {
            flex-direction: column !important;
          }
          .confirmation-meta-box-responsive {
            grid-template-columns: 1fr 1fr !important;
            gap: 12px !important;
            padding: 12px !important;
          }
        }
        @media (max-width: 420px) {
          .confirmation-meta-box-responsive {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      <div style={confirmationCardStyle} className="card confirmation-card-responsive animate-slide-up">
        {/* Success Icon */}
        <div style={successIconBox}>
          <CheckCircle size={44} color="#10b981" />
        </div>

        <h1 className="confirmation-title-responsive" style={orderSuccessTitle}>Thank You! Your Order is Placed</h1>
        <p style={{ color: '#475569', fontSize: '0.95rem', marginTop: '6px' }}>
          We have sent an order confirmation and tracking details to your registered email.
        </p>

        {/* Order Meta Box */}
        <div className="confirmation-meta-box-responsive" style={orderMetaBox}>
          <div>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Order Number:</span>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
              {order.orderNumber}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Estimated Delivery:</span>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#059669' }}>
              {formatDate(order.estimatedDeliveryDate)}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Payment Method:</span>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', textTransform: 'uppercase' }}>
              {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay (Paid)'}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Total Paid:</span>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1d4ed8' }}>
              {formatINR(order.totalPrice)}
            </div>
          </div>
        </div>

        {/* Delivery Address Details */}
        <div style={addressBoxStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <MapPin size={18} color="#1d4ed8" />
            <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>Shipping Destination</strong>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
            <strong>{order.shippingAddress?.fullName}</strong> ({order.shippingAddress?.phone})<br />
            {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - <strong>{order.shippingAddress?.pincode}</strong>
          </div>
        </div>

        {/* Purchased Items List */}
        <div style={{ marginTop: '24px', textAlign: 'left' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>
            Items Ordered ({order.items?.length})
          </h3>
          <div style={itemsListWrapper}>
            {order.items?.map((item, idx) => (
              <div key={idx} style={itemSnippetRow}>
                <img src={item.image} alt={item.name} style={itemSnippetImg} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Qty: {item.quantity} × {formatINR(item.price)}
                  </div>
                </div>
                <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
                  {formatINR(item.subtotal || item.price * item.quantity)}
                </strong>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div style={btnRowStyle} className="confirmation-btn-row-responsive">
          <Link to={`/orders/${order._id}`} className="btn btn-outline" style={{ flex: 1 }}>
            <Package size={16} /> Track Order Progress
          </Link>
          <Link to="/" className="btn btn-primary" style={{ flex: 1 }}>
            Continue Shopping <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

const confirmationCardStyle = {
  padding: '40px 32px',
  textAlign: 'center',
};

const successIconBox = {
  width: '72px',
  height: '72px',
  borderRadius: '50%',
  background: '#ecfdf5',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 16px',
};

const orderSuccessTitle = {
  fontSize: '1.75rem',
  fontWeight: '800',
  color: '#0f172a',
  letterSpacing: '-0.02em',
};

const orderMetaBox = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
  gap: '16px',
  background: '#f8fafc',
  padding: '16px',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  marginTop: '24px',
  textAlign: 'left',
};

const addressBoxStyle = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '10px',
  padding: '16px',
  marginTop: '16px',
  textAlign: 'left',
};

const itemsListWrapper = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  border: '1px solid #f1f5f9',
  borderRadius: '10px',
  padding: '12px 16px',
};

const itemSnippetRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const itemSnippetImg = {
  width: '56px',
  height: '56px',
  objectFit: 'cover',
  borderRadius: '6px',
  border: '1px solid #e2e8f0',
};

const btnRowStyle = {
  display: 'flex',
  gap: '12px',
  marginTop: '32px',
  flexWrap: 'wrap',
};

export default OrderConfirmationPage;
