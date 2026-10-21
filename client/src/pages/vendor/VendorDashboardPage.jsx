import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  TrendingUp,
  Boxes,
  Edit3,
  Check,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
  ShoppingBag,
  RotateCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { vendorService } from '../../services/vendorService';
import { formatINR, formatDate, formatDateTime } from '../../utils/formatters';

const VendorDashboardPage = () => {
  const { user, switchRole } = useAuth();
  const { success, error, info } = useToast();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'inventory'
  const [orderFilter, setOrderFilter] = useState('ALL');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [productSearch, setProductSearch] = useState('');

  // Editing product stock modal/inline
  const [editingProduct, setEditingProduct] = useState(null);
  const [newStock, setNewStock] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, ordersData, productsData] = await Promise.all([
        vendorService.getStats().catch(() => null),
        vendorService.getOrders(orderFilter).catch(() => []),
        vendorService.getProducts().catch(() => []),
      ]);
      setStats(statsData);
      setOrders(ordersData || []);
      setProducts(productsData || []);
    } catch (err) {
      console.error('Failed to load vendor data:', err);
      error('Failed to load vendor records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orderFilter]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await vendorService.updateOrderStatus(orderId, newStatus, `Vendor handled milestone: ${newStatus}`);
      success(`Order updated to ${newStatus}! Customer tracking notified.`);
      await loadData();
    } catch (err) {
      error(err.response?.data?.message || 'Could not update order status.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleSaveProductStock = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      await vendorService.updateProduct(editingProduct._id, {
        stock: Number(newStock),
        price: Number(newPrice),
      });
      success(`Updated stock & price for ${editingProduct.name}!`);
      setEditingProduct(null);
      await loadData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update product.');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.brand && p.brand.toLowerCase().includes(productSearch.toLowerCase()))
  );

  return (
    <div className="container" style={{ padding: '24px 16px 60px' }}>
      <style>{`
        .vendor-stat-card {
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }
        .vendor-stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 24px -6px rgba(15, 23, 42, 0.1);
        }
        .vendor-order-row {
          transition: background-color 0.18s ease;
        }
        .vendor-order-row:hover {
          background-color: #f8fafc;
        }
        .action-step-btn {
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .action-step-btn:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15) !important;
        }
      `}</style>

      {/* Top Banner / Role Switcher Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: '20px',
          padding: '24px 28px',
          color: '#ffffff',
          marginBottom: '28px',
          boxShadow: '0 20px 35px -10px rgba(15, 23, 42, 0.2)',
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
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 16px rgba(37, 99, 235, 0.35)',
            }}
          >
            <Store size={28} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
                {user?.vendorStoreName || `${user?.name || 'CASA'}'s Merchant Hub`}
              </h1>
              <span
                style={{
                  background: '#38bdf8',
                  color: '#0f172a',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                }}
              >
                VERIFIED VENDOR
              </span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>
              Manage incoming customer orders, inventory stock, and courier handovers
            </p>
          </div>
        </div>

        {/* Quick Portal Switcher Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginRight: '4px' }}>Quick Switch:</span>
          <button
            onClick={() => switchRole('user')}
            className="btn btn-sm"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '6px 12px',
            }}
          >
            🛒 Customer Store
          </button>
          <button
            onClick={() => switchRole('delivery')}
            className="btn btn-sm"
            style={{
              background: '#f97316',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '6px 12px',
            }}
          >
            🚚 Delivery Partner Portal
          </button>
          <button
            onClick={loadData}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 10px',
              color: '#fff',
              cursor: 'pointer',
            }}
            title="Refresh Data"
          >
            <RotateCw size={15} />
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div className="card vendor-stat-card" style={{ padding: '20px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>TOTAL REVENUE</span>
            <div style={{ padding: '6px', borderRadius: '8px', background: '#ecfdf5', color: '#059669' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: '10px' }}>
            {formatINR(stats?.totalRevenue || 0)}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>Lifetime vendor sales</span>
        </div>

        <div className="card vendor-stat-card" style={{ padding: '20px', borderRadius: '16px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>NEEDS PACKING</span>
            <div style={{ padding: '6px', borderRadius: '8px', background: '#fef3c7', color: '#d97706' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#d97706', marginTop: '10px' }}>
            {stats?.pendingToPack || 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 600 }}>Orders awaiting fulfillment</span>
        </div>

        <div className="card vendor-stat-card" style={{ padding: '20px', borderRadius: '16px', borderLeft: '4px solid #7c3aed' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>PACKED / READY</span>
            <div style={{ padding: '6px', borderRadius: '8px', background: '#f5f3ff', color: '#7c3aed' }}>
              <Package size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#7c3aed', marginTop: '10px' }}>
            {stats?.packedOrders || 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: 600 }}>Ready for courier pickup</span>
        </div>

        <div className="card vendor-stat-card" style={{ padding: '20px', borderRadius: '16px', borderLeft: '4px solid #2563eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>CATALOG PRODUCTS</span>
            <div style={{ padding: '6px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb' }}>
              <Boxes size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2563eb', marginTop: '10px' }}>
            {stats?.productsCount || products.length}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>Active items in marketplace</span>
        </div>
      </div>

      {/* Main Tab Controls */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid #e2e8f0', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'orders' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'orders' ? '#2563eb' : '#64748b',
            fontWeight: 800,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Package size={18} />
          <span>Customer Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'inventory' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'inventory' ? '#2563eb' : '#64748b',
            fontWeight: 800,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Boxes size={18} />
          <span>Inventory & Stock ({products.length})</span>
        </button>
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div>
          {/* Order Status Filter Buttons */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', overflowX: 'auto', paddingBottom: '4px' }}>
            {['ALL', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered'].map((st) => (
              <button
                key={st}
                onClick={() => setOrderFilter(st)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  border: orderFilter === st ? '1.5px solid #2563eb' : '1.5px solid #cbd5e1',
                  background: orderFilter === st ? '#2563eb' : '#ffffff',
                  color: orderFilter === st ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                }}
              >
                {st === 'ALL' ? 'All Orders' : st}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton" style={{ height: '120px', borderRadius: '14px' }} />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="card" style={{ padding: '48px 20px', textAlign: 'center', borderRadius: '16px' }}>
              <Package size={48} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>No Orders Found</h3>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                There are currently no orders under the "{orderFilter}" filter.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {orders.map((order) => {
                const isUpdating = updatingOrderId === order._id;

                return (
                  <div
                    key={order._id}
                    className="card vendor-order-row"
                    style={{
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                    }}
                  >
                    {/* Header */}
                    <div
                      style={{
                        padding: '12px 18px',
                        background: '#f8fafc',
                        borderBottom: '1px solid #f1f5f9',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '10px',
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>ORDER NO:</span>{' '}
                        <strong style={{ fontSize: '0.925rem', color: '#0f172a' }}>{order.orderNumber}</strong>
                        <span style={{ fontSize: '0.78rem', color: '#64748b', marginLeft: '12px' }}>
                          Placed {formatDate(order.createdAt)}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1d4ed8' }}>
                          {formatINR(order.totalPrice)}
                        </span>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: '9999px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            background: order.orderStatus === 'Delivered' ? '#dcfce7' : order.orderStatus === 'Packed' ? '#f3e8ff' : '#dbeafe',
                            color: order.orderStatus === 'Delivered' ? '#15803d' : order.orderStatus === 'Packed' ? '#7e22ce' : '#1d4ed8',
                          }}
                        >
                          {order.orderStatus}
                        </span>
                      </div>
                    </div>

                    {/* Body: Items + Customer Info */}
                    <div style={{ padding: '16px 18px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                      {/* Items */}
                      <div style={{ flex: 1, minWidth: '260px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>
                          ITEMS TO PACK ({order.items?.length || 0}):
                        </div>
                        {order.items?.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <img
                              src={item.image}
                              alt={item.name}
                              style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {item.name}
                              </div>
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                Qty: <strong>{item.quantity}</strong> • {formatINR(item.price)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Customer & Shipping */}
                      <div style={{ minWidth: '220px', maxWidth: '300px', fontSize: '0.8rem', color: '#475569', background: '#fafbfc', padding: '12px', borderRadius: '10px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                          Customer: {order.user?.name || order.shippingAddress?.fullName || 'Shopper'}
                        </div>
                        <div>{order.shippingAddress?.street}, {order.shippingAddress?.city} {order.shippingAddress?.pincode}</div>
                        <div style={{ marginTop: '4px', color: '#2563eb', fontWeight: 600 }}>
                          Phone: {order.shippingAddress?.phone || order.user?.phone || 'Not provided'}
                        </div>
                        {order.deliveryPartnerName && (
                          <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #e2e8f0', fontSize: '0.75rem' }}>
                            Courier: <strong>{order.deliveryPartnerName}</strong>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions: Step-by-Step Vendor Fulfillment */}
                    <div
                      style={{
                        padding: '12px 18px',
                        background: '#f8fafc',
                        borderTop: '1px solid #f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '10px',
                      }}
                    >
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Payment: <strong>{order.paymentMethod?.toUpperCase()}</strong>
                      </span>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {order.orderStatus === 'Confirmed' && (
                          <button
                            onClick={() => handleUpdateStatus(order._id, 'Processing')}
                            disabled={isUpdating}
                            className="action-step-btn"
                            style={{
                              padding: '7px 14px',
                              borderRadius: '8px',
                              background: '#3b82f6',
                              color: '#ffffff',
                              border: 'none',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            📦 Start Processing
                          </button>
                        )}

                        {['Confirmed', 'Processing'].includes(order.orderStatus) && (
                          <button
                            onClick={() => handleUpdateStatus(order._id, 'Packed')}
                            disabled={isUpdating}
                            className="action-step-btn"
                            style={{
                              padding: '7px 14px',
                              borderRadius: '8px',
                              background: '#7c3aed',
                              color: '#ffffff',
                              border: 'none',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            🏷️ Mark As Packed & Ready
                          </button>
                        )}

                        {order.orderStatus === 'Packed' && (
                          <button
                            onClick={() => handleUpdateStatus(order._id, 'Shipped')}
                            disabled={isUpdating}
                            className="action-step-btn"
                            style={{
                              padding: '7px 14px',
                              borderRadius: '8px',
                              background: '#059669',
                              color: '#ffffff',
                              border: 'none',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            🚚 Hand Over to Courier (Dispatch)
                          </button>
                        )}

                        <Link
                          to={`/orders/${order._id}`}
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.75rem', borderRadius: '8px' }}
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Inventory & Stock Tab */}
      {activeTab === 'inventory' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
              <input
                type="text"
                placeholder="Search products in inventory..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.85rem',
                }}
              />
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '11px' }} />
            </div>

            <div style={{ fontSize: '0.825rem', color: '#64748b' }}>
              Showing <strong>{filteredProducts.length}</strong> items in merchant catalog
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            {filteredProducts.map((p) => (
              <div
                key={p._id}
                className="card"
                style={{
                  borderRadius: '14px',
                  padding: '14px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  gap: '12px',
                }}
              >
                <img
                  src={p.image || p.images?.[0]}
                  alt={p.name}
                  style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                    Price: <strong>{formatINR(p.discountPrice || p.price)}</strong>
                  </div>
                  <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: (p.stock || 0) < 5 ? '#fee2e2' : '#ecfdf5',
                        color: (p.stock || 0) < 5 ? '#dc2626' : '#059669',
                      }}
                    >
                      Stock: {p.stock || 0} units
                    </span>

                    <button
                      onClick={() => {
                        setEditingProduct(p);
                        setNewStock(String(p.stock || 0));
                        setNewPrice(String(p.price || 0));
                      }}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: '6px' }}
                    >
                      <Edit3 size={12} /> Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Product Stock Modal */}
      {editingProduct && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '16px',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '420px',
              width: '100%',
              background: '#ffffff',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              Update Stock & Price
            </h3>
            <p style={{ fontSize: '0.825rem', color: '#64748b', marginBottom: '16px' }}>
              {editingProduct.name}
            </p>

            <form onSubmit={handleSaveProductStock}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Available Inventory Stock Units
                </label>
                <input
                  type="number"
                  min="0"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Listing Price (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="btn btn-outline"
                  style={{ padding: '8px 16px', borderRadius: '8px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '8px 18px', borderRadius: '8px', fontWeight: 700 }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboardPage;
