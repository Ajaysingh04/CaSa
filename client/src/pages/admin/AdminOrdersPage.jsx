import React, { useState, useEffect, useMemo } from 'react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { formatINR, formatDateTime } from '../../utils/formatters';
import { getSocket } from '../../services/socketService';
import {
  Eye,
  CheckCircle,
  Package,
  Search,
  Filter,
  DollarSign,
  Truck,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Banknote,
  ChevronLeft,
  ChevronRight,
  Printer,
  Sparkles,
  ArrowUpDown,
  RotateCcw,
  Trash2,
} from 'lucide-react';

const STATUS_GROUPS = [
  { id: 'All', label: 'All Orders' },
  { id: 'Pending', label: 'Pending', color: '#ea580c', bg: '#fff7ed' },
  { id: 'Confirmed', label: 'Confirmed', color: '#4f46e5', bg: '#eef2ff' },
  { id: 'Processing', label: 'Processing', color: '#9333ea', bg: '#faf5ff' },
  { id: 'Packed', label: 'Packed', color: '#0891b2', bg: '#ecfeff' },
  { id: 'Shipped', label: 'Shipped', color: '#2563eb', bg: '#eff6ff' },
  { id: 'Out for delivery', label: 'Out for Delivery', color: '#0284c7', bg: '#f0f9ff' },
  { id: 'Delivered', label: 'Delivered', color: '#16a34a', bg: '#f0fdf4' },
  { id: 'Cancelled', label: 'Cancelled', color: '#dc2626', bg: '#fef2f2' },
  { id: 'Return requested', label: 'Returns', color: '#b45309', bg: '#fef3c7' },
  { id: 'Refunded', label: 'Refunded', color: '#64748b', bg: '#f1f5f9' },
];

const AdminOrdersPage = () => {
  const { success, error } = useToast();
  const { isDemoAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [assignedRiderId, setAssignedRiderId] = useState('');
  const itemsPerPage = 8;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const [res, usersRes] = await Promise.allSettled([
        adminService.getOrders(),
        adminService.getUsers(),
      ]);
      if (res.status === 'fulfilled') setOrders(res.value?.data || []);
      if (usersRes.status === 'fulfilled') {
        const riders = (usersRes.value || []).filter((u) => u.role === 'delivery');
        setDeliveryPartners(riders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    try {
      const socket = getSocket();
      const handleLiveOrderEvent = () => fetchOrders();
      socket.on('new_order', handleLiveOrderEvent);
      socket.on('order_status_update', handleLiveOrderEvent);

      return () => {
        socket.off('new_order', handleLiveOrderEvent);
        socket.off('order_status_update', handleLiveOrderEvent);
      };
    } catch (e) {}
  }, []);

  const handleAssignRider = async (orderId, riderId) => {
    if (isDemoAdmin) {
      error('Action restricted: Assigning delivery partners is disabled.');
      return;
    }

    if (!riderId) {
      error('Please select a delivery partner to assign');
      return;
    }
    const reason = window.prompt('Enter instructions or dispatch reason for delivery partner:') || 'Direct admin dispatch';
    try {
      const res = await adminService.assignDeliveryPartner(orderId, {
        deliveryPartnerId: riderId,
        reason,
      });
      success('Delivery partner successfully assigned to order');
      fetchOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev) => ({
          ...prev,
          deliveryPartner: deliveryPartners.find((r) => r._id === riderId) || { _id: riderId },
          orderStatus: res.data?.order?.orderStatus || prev.orderStatus,
        }));
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to assign delivery partner');
    }
  };

  const handleAdminOverride = async (orderId, newStatus) => {
    if (isDemoAdmin) {
      error('Action restricted: Overriding order status is disabled.');
      return;
    }

    const reason = window.prompt(`Enter mandatory audit reason for administratively overriding status to "${newStatus}":`);
    if (!reason || !reason.trim()) {
      error('Administrative override aborted: An audit reason is mandatory.');
      return;
    }

    try {
      await adminService.overrideOrderStatus(orderId, {
        status: newStatus,
        reason: reason.trim(),
      });
      success(`Order status successfully overridden to "${newStatus}"`);
      fetchOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, orderStatus: newStatus }));
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to override order status');
    }
  };

  const handleReturnAction = async (orderId, action) => {
    if (isDemoAdmin) {
      error('Action restricted: Returns and refund processing is disabled.');
      return;
    }

    let refundAmount = null;
    let reason = '';

    if (action === 'refund') {
      const input = window.prompt('Enter refund settlement amount (INR):', selectedOrder?.totalPrice || '');
      if (input === null) return;
      refundAmount = Number(input) || selectedOrder?.totalPrice;
    } else if (action === 'reject') {
      const input = window.prompt('Enter rejection reason for customer return:');
      if (input === null) return;
      reason = input || 'Return inspection failed policy check';
    }

    try {
      await adminService.handleReturnAction(orderId, {
        action,
        refundAmount,
        reason,
      });
      success(`Return workflow action "${action.toUpperCase()}" completed successfully.`);
      fetchOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        const newStatus =
          action === 'approve'
            ? 'Return approved'
            : action === 'receive'
            ? 'Return received'
            : action === 'refund'
            ? 'Refunded'
            : selectedOrder.orderStatus;
        setSelectedOrder((prev) => ({ ...prev, orderStatus: newStatus }));
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to process return action');
    }
  };

  // Compute Overall Order Metrics
  const orderMetrics = useMemo(() => {
    const totalCount = orders.length;
    let grossRevenue = 0;
    let activeFulfillmentCount = 0;
    let deliveredCount = 0;
    let cancelledCount = 0;

    orders.forEach((o) => {
      grossRevenue += o.totalPrice || 0;
      const st = o.orderStatus || 'Pending';
      if (['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for delivery'].includes(st)) {
        activeFulfillmentCount++;
      } else if (st === 'Delivered') {
        deliveredCount++;
      } else if (['Cancelled', 'Refunded'].includes(st)) {
        cancelledCount++;
      }
    });

    return {
      totalCount,
      grossRevenue,
      activeFulfillmentCount,
      deliveredCount,
      cancelledCount,
    };
  }, [orders]);

  // Filtered & Sorted Orders
  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        // Status filter
        if (selectedStatus !== 'All' && o.orderStatus !== selectedStatus) {
          return false;
        }

        // Payment method filter
        if (paymentFilter !== 'all' && (o.paymentMethod || '').toLowerCase() !== paymentFilter.toLowerCase()) {
          return false;
        }

        // Search filter
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchOrderNo = (o.orderNumber || '').toLowerCase().includes(q);
          const matchName = (o.user?.name || o.shippingAddress?.fullName || '').toLowerCase().includes(q);
          const matchEmail = (o.user?.email || '').toLowerCase().includes(q);
          const matchCity = (o.shippingAddress?.city || '').toLowerCase().includes(q);
          const matchItem = o.items?.some((i) => (i.name || '').toLowerCase().includes(q));
          if (!matchOrderNo && !matchName && !matchEmail && !matchCity && !matchItem) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'amount_desc') return (b.totalPrice || 0) - (a.totalPrice || 0);
        if (sortBy === 'amount_asc') return (a.totalPrice || 0) - (b.totalPrice || 0);
        if (sortBy === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [orders, selectedStatus, paymentFilter, search, sortBy]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage));
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      success(`Order status updated to "${newStatus}"`);
      fetchOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, orderStatus: newStatus }));
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleDeleteOrder = async (order) => {
    const shortId = order._id.slice(-6).toUpperCase();
    if (!window.confirm(`Are you sure you want to permanently delete order #${shortId}? This cannot be undone.`)) {
      return;
    }

    try {
      await adminService.deleteOrder(order._id);
      success(`Order #${shortId} deleted successfully.`);
      setOrders((prev) => prev.filter((o) => o._id !== order._id));
      if (selectedOrder?._id === order._id) {
        setSelectedOrder(null);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete order');
    }
  };

  const getStatusColor = (status) => {
    const found = STATUS_GROUPS.find((s) => s.id === status);
    return found ? { color: found.color, bg: found.bg } : { color: '#64748b', bg: '#f1f5f9' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* CSS Styles & Micro-Animations */}
      <style>{`
        .admin-order-row {
          transition: background 0.15s ease;
        }

        .admin-order-row:hover {
          background: #f8fafc !important;
        }

        .order-kpi-card {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .order-kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px -4px rgba(15, 23, 42, 0.08);
        }

        .status-pill-btn {
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .status-pill-btn:hover {
          transform: translateY(-1px);
        }
      `}</style>

      {/* 1. Header Title & Actions */}
      <div style={headerRow}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={pageTitleStyle}>Order Management Console</h1>
            <span style={activeCountPill}>{filteredOrders.length} Orders</span>
          </div>
          <p style={pageSubtitleStyle}>
            Real-time fulfillment tracking, carrier dispatch management, and payment verification
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="btn btn-outline"
          style={refreshBtnStyle}
          title="Refresh orders from database"
        >
          <RotateCcw size={15} /> Refresh Data
        </button>
      </div>

      {/* 2. Top 4 Orders KPI Metrics */}
      <div style={kpiGrid}>
        <div style={kpiCard} className="card order-kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={kpiLabel}>Total Orders</span>
              <div style={kpiValue}>{orderMetrics.totalCount}</div>
              <span style={kpiSub}>Lifetime customer orders</span>
            </div>
            <div style={{ ...kpiIconBox, background: '#eff6ff', color: '#2563eb' }}>
              <Package size={22} />
            </div>
          </div>
        </div>

        <div style={kpiCard} className="card order-kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={kpiLabel}>Gross Sales Revenue</span>
              <div style={{ ...kpiValue, color: '#16a34a' }}>
                {formatINR(orderMetrics.grossRevenue)}
              </div>
              <span style={kpiSub}>Calculated across all orders</span>
            </div>
            <div style={{ ...kpiIconBox, background: '#f0fdf4', color: '#16a34a' }}>
              <DollarSign size={22} />
            </div>
          </div>
        </div>

        <div style={kpiCard} className="card order-kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={kpiLabel}>Active In Fulfillment</span>
              <div style={{ ...kpiValue, color: '#2563eb' }}>
                {orderMetrics.activeFulfillmentCount}
              </div>
              <span style={kpiSub}>Pending, Packed or In Transit</span>
            </div>
            <div style={{ ...kpiIconBox, background: '#eff6ff', color: '#2563eb' }}>
              <Truck size={22} />
            </div>
          </div>
        </div>

        <div style={kpiCard} className="card order-kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={kpiLabel}>Delivered & Complete</span>
              <div style={{ ...kpiValue, color: '#15803d' }}>
                {orderMetrics.deliveredCount}
              </div>
              <span style={kpiSub}>{orderMetrics.cancelledCount} Cancelled / Refunded</span>
            </div>
            <div style={{ ...kpiIconBox, background: '#f0fdf4', color: '#15803d' }}>
              <CheckCircle2 size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filter & Search Suite */}
      <div style={filterCard} className="card">
        {/* Top Search & Filter Dropdown Row */}
        <div style={filterTopRow}>
          {/* Search Box */}
          <div style={searchBoxWrapper}>
            <Search size={16} color="#94a3b8" style={{ marginLeft: '12px' }} />
            <input
              type="text"
              placeholder="Search by Order #, Customer Name, Email, or City..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              style={searchInputStyle}
            />
            {search && (
              <button onClick={() => setSearch('')} style={clearIconBtn}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Payment Method Filter */}
          <div style={selectBox}>
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={selectDropdown}
            >
              <option value="all">Payment: All Methods</option>
              <option value="razorpay">UPI / Cards (Razorpay)</option>
              <option value="cod">Cash on Delivery (COD)</option>
            </select>
          </div>

          {/* Sort By */}
          <div style={selectBox}>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              style={selectDropdown}
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="amount_desc">Amount: High to Low</option>
              <option value="amount_asc">Amount: Low to High</option>
            </select>
          </div>
        </div>

        {/* Scrollable Status Tabs Strip */}
        <div style={statusTabsStrip}>
          {STATUS_GROUPS.map((st) => {
            const isSelected = selectedStatus === st.id;
            const countForStatus =
              st.id === 'All'
                ? orders.length
                : orders.filter((o) => o.orderStatus === st.id).length;

            return (
              <button
                key={st.id}
                onClick={() => {
                  setSelectedStatus(st.id);
                  setCurrentPage(1);
                }}
                className="status-pill-btn"
                style={{
                  ...statusPillBtn,
                  background: isSelected ? '#0f172a' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#334155',
                  borderColor: isSelected ? '#0f172a' : '#e2e8f0',
                  boxShadow: isSelected ? '0 4px 12px rgba(15, 23, 42, 0.15)' : 'none',
                }}
              >
                <span>{st.label}</span>
                <span
                  style={{
                    ...statusCountChip,
                    background: isSelected ? 'rgba(255, 255, 255, 0.2)' : '#f1f5f9',
                    color: isSelected ? '#ffffff' : '#475569',
                  }}
                >
                  {countForStatus}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Orders Table Container */}
      <div style={tableContainerCard} className="card">
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
            <div
              className="skeleton"
              style={{ width: '50px', height: '50px', margin: '0 auto 16px', borderRadius: '50%' }}
            />
            <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>Fetching Order Records...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={emptyTableState}>
            <Package size={48} color="#94a3b8" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '12px', color: '#0f172a' }}>
              No orders found
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '360px', marginTop: '4px' }}>
              No orders matched the status "{selectedStatus}" or your active search criteria.
            </p>
            <button
              onClick={() => {
                setSelectedStatus('All');
                setSearch('');
                setPaymentFilter('all');
              }}
              className="btn btn-outline btn-sm"
              style={{ marginTop: '16px' }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="table-responsive" style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', minWidth: '780px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Order ID</th>
                  <th style={thStyle}>Customer Details</th>
                  <th style={thStyle}>Delivery Address</th>
                  <th style={thStyle}>Items</th>
                  <th style={thStyle}>Grand Total</th>
                  <th style={thStyle}>Payment</th>
                  <th style={thStyle}>Fulfillment Status</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((o) => {
                  const statusStyle = getStatusColor(o.orderStatus);
                  const isCOD = (o.paymentMethod || '').toLowerCase() === 'cod';

                  return (
                    <tr key={o._id} className="admin-order-row" style={trStyle}>
                      {/* Order Number & Date */}
                      <td style={tdStyle}>
                        <div>
                          <strong style={orderNumberText}>{o.orderNumber}</strong>
                          <span style={orderDateText}>{formatDateTime(o.createdAt)}</span>
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={customerAvatarCircle}>
                            {(o.user?.name || o.shippingAddress?.fullName || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={customerNameText}>
                              {o.user?.name || o.shippingAddress?.fullName || 'Guest Customer'}
                            </div>
                            <div style={customerSubText}>
                              {o.user?.email || o.shippingAddress?.phone || 'No email provided'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Destination */}
                      <td style={tdStyle}>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                            {o.shippingAddress?.city}, {o.shippingAddress?.state}
                          </div>
                          <span style={pincodeBadge}>PIN: {o.shippingAddress?.pincode}</span>
                        </div>
                      </td>

                      {/* Items */}
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={itemsBadge}>
                            {o.items?.length || 1} {o.items?.length === 1 ? 'item' : 'items'}
                          </span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td style={tdStyle}>
                        <strong style={orderAmountText}>{formatINR(o.totalPrice)}</strong>
                      </td>

                      {/* Payment */}
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              ...paymentPill,
                              background: isCOD ? '#fef3c7' : '#eff6ff',
                              color: isCOD ? '#b45309' : '#1d4ed8',
                            }}
                          >
                            {isCOD ? '💵 Cash on Delivery' : '💳 Online Prepaid'}
                          </span>
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td style={tdStyle}>
                        <select
                          value={o.orderStatus}
                          onChange={(e) => handleStatusChange(o._id, e.target.value)}
                          style={{
                            ...statusSelectBox,
                            color: statusStyle.color,
                            background: statusStyle.bg,
                            borderColor: statusStyle.color + '40',
                          }}
                        >
                          {STATUS_GROUPS.filter((s) => s.id !== 'All').map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* View & Delete Actions */}
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={() => setSelectedOrder(o)}
                            style={viewBtnStyle}
                            title="View order details and packing slip"
                          >
                            <Eye size={15} />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(o)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '6px 8px',
                              borderRadius: '8px',
                              background: '#fef2f2',
                              border: '1px solid #fee2e2',
                              color: '#ef4444',
                              cursor: 'pointer',
                            }}
                            title="Delete order record"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. Pagination Footer */}
        {filteredOrders.length > 0 && (
          <div style={paginationFooter}>
            <span style={{ fontSize: '0.825rem', color: '#64748b' }}>
              Showing <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> to{' '}
              <strong>{Math.min(currentPage * itemsPerPage, filteredOrders.length)}</strong> of{' '}
              <strong>{filteredOrders.length}</strong> orders
            </span>

            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{
                    ...paginationNavBtn,
                    opacity: currentPage === 1 ? 0.4 : 1,
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  <ChevronLeft size={16} /> Prev
                </button>

                {[...Array(totalPages)].map((_, i) => {
                  const pNum = i + 1;
                  return (
                    <button
                      key={pNum}
                      onClick={() => setCurrentPage(pNum)}
                      style={{
                        ...pageNumberBtn,
                        background: currentPage === pNum ? '#2563eb' : '#ffffff',
                        color: currentPage === pNum ? '#ffffff' : '#0f172a',
                        borderColor: currentPage === pNum ? '#2563eb' : '#e2e8f0',
                      }}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    ...paginationNavBtn,
                    opacity: currentPage === totalPages ? 0.4 : 1,
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  }}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 6. Comprehensive Order Detail Modal */}
      {selectedOrder && (
        <div style={modalOverlay}>
          <div style={modalBackdrop} onClick={() => setSelectedOrder(null)} />
          <div style={modalBox}>
            {/* Modal Header */}
            <div style={modalHeader}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                    Order {selectedOrder.orderNumber}
                  </h3>
                  <span
                    style={{
                      ...statusBadgePill,
                      ...getStatusColor(selectedOrder.orderStatus),
                    }}
                  >
                    {selectedOrder.orderStatus}
                  </span>
                </div>
                <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  Placed on {formatDateTime(selectedOrder.createdAt)}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => window.print()}
                  style={printBtnStyle}
                  title="Print invoice"
                >
                  <Printer size={15} /> Print Slip
                </button>
                <button onClick={() => setSelectedOrder(null)} style={modalCloseBtn}>
                  <X size={18} color="#64748b" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={modalBody}>
              {/* Customer & Shipping 2-Col Card */}
              <div style={modalTwoCol}>
                <div style={infoBlockCard}>
                  <div style={infoBlockHeader}>
                    <MapPin size={16} color="#2563eb" />
                    <strong>Delivery Address</strong>
                  </div>
                  <div style={infoBlockBody}>
                    <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block' }}>
                      {selectedOrder.shippingAddress?.fullName}
                    </strong>
                    <p style={{ margin: '4px 0', color: '#475569', fontSize: '0.825rem', lineHeight: 1.45 }}>
                      {selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.locality && `${selectedOrder.shippingAddress?.locality}, `}
                      {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - <strong>{selectedOrder.shippingAddress?.pincode}</strong>
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#64748b', marginTop: '6px' }}>
                      <Phone size={13} /> {selectedOrder.shippingAddress?.phone}
                    </div>
                  </div>
                </div>

                <div style={infoBlockCard}>
                  <div style={infoBlockHeader}>
                    <CreditCard size={16} color="#16a34a" />
                    <strong>Payment & Dispatch</strong>
                  </div>
                  <div style={infoBlockBody}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Method:</span>
                      <strong style={{ fontSize: '0.8rem', color: '#0f172a', textTransform: 'uppercase' }}>
                        {selectedOrder.paymentMethod}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Status:</span>
                      <strong style={{ fontSize: '0.8rem', color: '#16a34a' }}>
                        {selectedOrder.paymentStatus || 'Completed'}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Tracking ID:</span>
                      <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: '#2563eb' }}>
                        TRK-{selectedOrder._id.slice(-8).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div style={{ marginTop: '16px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
                  Ordered Items ({selectedOrder.items?.length || 0})
                </h4>

                <div style={itemRowsContainer}>
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} style={itemDetailRow}>
                      <img
                        src={item.image || 'https://placehold.co/80'}
                        alt={item.name}
                        style={itemThumbImg}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100';
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <strong style={itemDetailTitle}>{item.name}</strong>
                        {item.selectedVariant && Object.keys(item.selectedVariant).length > 0 && (
                          <div style={itemVariantTag}>
                            {Object.entries(item.selectedVariant)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(' • ')}
                          </div>
                        )}
                        <span style={itemDetailSub}>
                          Qty: {item.quantity} × {formatINR(item.price)}
                        </span>
                      </div>
                      <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
                        {formatINR(item.subtotal || item.price * item.quantity)}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Total Breakdown */}
              <div style={orderBreakdownBox}>
                <div style={breakdownRow}>
                  <span style={breakdownLabel}>Items Subtotal</span>
                  <span style={breakdownValue}>{formatINR(selectedOrder.itemsPrice || selectedOrder.totalPrice)}</span>
                </div>
                <div style={breakdownRow}>
                  <span style={breakdownLabel}>Shipping Fee</span>
                  <span style={breakdownValue}>
                    {selectedOrder.shippingPrice === 0 ? (
                      <span style={{ color: '#16a34a', fontWeight: 700 }}>FREE</span>
                    ) : (
                      formatINR(selectedOrder.shippingPrice || 0)
                    )}
                  </span>
                </div>
                {selectedOrder.discountPrice > 0 && (
                  <div style={breakdownRow}>
                    <span style={{ ...breakdownLabel, color: '#16a34a' }}>Coupon Discount</span>
                    <span style={{ ...breakdownValue, color: '#16a34a' }}>
                      - {formatINR(selectedOrder.discountPrice)}
                    </span>
                  </div>
                )}
                <div style={breakdownDivider} />
                <div style={breakdownRow}>
                  <strong style={{ fontSize: '1rem', color: '#0f172a' }}>Total Amount Paid</strong>
                  <strong style={{ fontSize: '1.25rem', color: '#1d4ed8' }}>
                    {formatINR(selectedOrder.totalPrice)}
                  </strong>
                </div>
              </div>

              {/* Delivery Partner Assignment Section */}
              <div
                style={{
                  marginTop: '16px',
                  padding: '16px',
                  borderRadius: '12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Truck size={17} color="#2563eb" />
                    <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>
                      Delivery Partner Assignment
                    </strong>
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: selectedOrder.deliveryPartner ? '#ecfeff' : '#fef2f2',
                      color: selectedOrder.deliveryPartner ? '#0891b2' : '#dc2626',
                    }}
                  >
                    {selectedOrder.deliveryPartner
                      ? `Assigned: ${selectedOrder.deliveryPartner.name || selectedOrder.deliveryPartner.phone || 'Partner'}`
                      : 'Unassigned'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <select
                    value={assignedRiderId}
                    onChange={(e) => setAssignedRiderId(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.825rem',
                      background: '#ffffff',
                      color: '#0f172a',
                    }}
                  >
                    <option value="">-- Select Rider to Assign --</option>
                    {deliveryPartners.map((rider) => (
                      <option key={rider._id} value={rider._id}>
                        {rider.name} ({rider.phone || 'No phone'}) - {rider.email}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleAssignRider(selectedOrder._id, assignedRiderId)}
                    disabled={!assignedRiderId}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      background: assignedRiderId ? '#2563eb' : '#e2e8f0',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.825rem',
                      fontWeight: 700,
                      cursor: assignedRiderId ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Truck size={14} /> Assign Rider
                  </button>
                </div>
              </div>

              {/* Returns & Refunds Workflow Section */}
              {(selectedOrder.orderStatus?.toLowerCase().includes('return') ||
                selectedOrder.orderStatus === 'Refund pending' ||
                selectedOrder.orderStatus === 'Refunded') && (
                <div
                  style={{
                    marginTop: '16px',
                    padding: '16px',
                    borderRadius: '12px',
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <RotateCcw size={16} color="#b45309" />
                      <strong style={{ fontSize: '0.88rem', color: '#92400e' }}>
                        Customer Return & Refund Workflow
                      </strong>
                    </div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        color: '#b45309',
                        padding: '2px 8px',
                        background: '#fef3c7',
                        borderRadius: '4px',
                      }}
                    >
                      Status: {selectedOrder.orderStatus}
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#78350f' }}>
                    Process reverse logistics, approve physical inspection at warehouse, and disburse gateway refund settlement.
                  </p>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                    {selectedOrder.orderStatus === 'Return requested' && (
                      <>
                        <button
                          onClick={() => handleReturnAction(selectedOrder._id, 'approve')}
                          style={{
                            padding: '7px 12px',
                            background: '#16a34a',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          ✓ Approve Return Request
                        </button>
                        <button
                          onClick={() => handleReturnAction(selectedOrder._id, 'reject')}
                          style={{
                            padding: '7px 12px',
                            background: '#dc2626',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          ✕ Reject Return
                        </button>
                      </>
                    )}

                    {['Return approved', 'Return picked up'].includes(selectedOrder.orderStatus) && (
                      <button
                        onClick={() => handleReturnAction(selectedOrder._id, 'receive')}
                        style={{
                          padding: '7px 12px',
                          background: '#0891b2',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        📦 Mark Return Received at Hub
                      </button>
                    )}

                    {['Return received', 'Refund pending'].includes(selectedOrder.orderStatus) && (
                      <button
                        onClick={() => handleReturnAction(selectedOrder._id, 'refund')}
                        style={{
                          padding: '7px 14px',
                          background: '#2563eb',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        💳 Disburse Refund ({formatINR(selectedOrder.totalPrice)})
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Status History / Audit Trail */}
              {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                    Order Timeline & Audit History
                  </h4>
                  <div
                    style={{
                      maxHeight: '130px',
                      overflowY: 'auto',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      padding: '10px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    {selectedOrder.statusHistory.map((h, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                        <div>
                          <strong style={{ color: '#0f172a' }}>{h.status}</strong>
                          {h.reason && <span style={{ color: '#64748b' }}> — {h.reason}</span>}
                          {h.updatedBy && <span style={{ color: '#2563eb', fontWeight: 600 }}> ({h.updatedBy})</span>}
                        </div>
                        <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                          {formatDateTime(h.changedAt || h.timestamp)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Status Advance Buttons & Administrative Override in Footer */}
            <div style={{ ...modalFooter, flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                  Standard Status Flow:
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered'].map((step) => (
                    <button
                      key={step}
                      onClick={() => handleStatusChange(selectedOrder._id, step)}
                      disabled={selectedOrder.orderStatus === step}
                      style={{
                        ...stepAdvanceBtn,
                        background: selectedOrder.orderStatus === step ? '#2563eb' : '#ffffff',
                        color: selectedOrder.orderStatus === step ? '#ffffff' : '#334155',
                        borderColor: selectedOrder.orderStatus === step ? '#2563eb' : '#cbd5e1',
                        cursor: selectedOrder.orderStatus === step ? 'default' : 'pointer',
                      }}
                    >
                      {step}
                    </button>
                  ))}
                </div>
              </div>

              {/* Administrative Status Override */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '10px',
                  borderTop: '1px solid #e2e8f0',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <span style={{ fontSize: '0.78rem', color: '#b91c1c', fontWeight: 700 }}>
                  ⚠️ Administrative Override (Audit Logged):
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <select
                    id="adminOverrideSelect"
                    defaultValue=""
                    style={{
                      padding: '5px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.78rem',
                      color: '#0f172a',
                    }}
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAdminOverride(selectedOrder._id, e.target.value);
                        e.target.value = '';
                      }
                    }}
                  >
                    <option value="" disabled>-- Force Override Status --</option>
                    {STATUS_GROUPS.filter((s) => s.id !== 'All').map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* Styles */
const headerRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '14px',
};

const pageTitleStyle = {
  fontSize: '1.75rem',
  fontWeight: '900',
  color: '#0f172a',
  margin: 0,
  letterSpacing: '-0.025em',
};

const activeCountPill = {
  background: '#eff6ff',
  color: '#2563eb',
  fontSize: '0.75rem',
  fontWeight: '800',
  padding: '4px 10px',
  borderRadius: '9999px',
  border: '1px solid #bfdbfe',
};

const pageSubtitleStyle = {
  color: '#64748b',
  fontSize: '0.875rem',
  margin: '4px 0 0',
};

const refreshBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '9px 16px',
  borderRadius: '10px',
  fontSize: '0.825rem',
  fontWeight: 700,
};

const kpiGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '16px',
};

const kpiCard = {
  background: '#ffffff',
  borderRadius: '18px',
  padding: '20px',
  border: '1.5px solid #e2e8f0',
};

const kpiLabel = {
  fontSize: '0.75rem',
  fontWeight: 700,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const kpiValue = {
  fontSize: '1.65rem',
  fontWeight: 900,
  color: '#0f172a',
  margin: '4px 0 2px',
  letterSpacing: '-0.02em',
};

const kpiSub = {
  fontSize: '0.72rem',
  color: '#64748b',
  fontWeight: 600,
};

const kpiIconBox = {
  width: '46px',
  height: '46px',
  borderRadius: '14px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const filterCard = {
  background: '#ffffff',
  borderRadius: '18px',
  border: '1.5px solid #e2e8f0',
  padding: '18px 20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
};

const filterTopRow = {
  display: 'flex',
  gap: '12px',
  flexWrap: 'wrap',
  alignItems: 'center',
};

const searchBoxWrapper = {
  flex: 1,
  minWidth: '260px',
  display: 'flex',
  alignItems: 'center',
  background: '#f8fafc',
  border: '1.5px solid #cbd5e1',
  borderRadius: '10px',
  overflow: 'hidden',
};

const searchInputStyle = {
  flex: 1,
  border: 'none',
  outline: 'none',
  background: 'transparent',
  padding: '9px 12px',
  fontSize: '0.85rem',
  color: '#0f172a',
};

const clearIconBtn = {
  background: 'none',
  border: 'none',
  padding: '6px 10px',
  cursor: 'pointer',
  color: '#94a3b8',
};

const selectBox = {
  minWidth: '160px',
  border: '1.5px solid #cbd5e1',
  borderRadius: '10px',
  background: '#f8fafc',
  overflow: 'hidden',
};

const selectDropdown = {
  width: '100%',
  border: 'none',
  outline: 'none',
  background: 'transparent',
  padding: '9px 12px',
  fontSize: '0.825rem',
  fontWeight: 700,
  color: '#0f172a',
  cursor: 'pointer',
};

const statusTabsStrip = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  overflowX: 'auto',
  paddingTop: '6px',
  borderTop: '1px solid #f1f5f9',
};

const statusPillBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '7px 14px',
  borderRadius: '10px',
  border: '1.5px solid',
  fontSize: '0.8rem',
  fontWeight: 700,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

const statusCountChip = {
  fontSize: '0.68rem',
  fontWeight: 800,
  padding: '2px 6px',
  borderRadius: '6px',
};

const tableContainerCard = {
  background: '#ffffff',
  borderRadius: '20px',
  border: '1.5px solid #e2e8f0',
  overflow: 'hidden',
  boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.04)',
};

const emptyTableState = {
  padding: '60px 20px',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
};

const ordersTableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'left',
};

const thStyle = {
  padding: '14px 18px',
  background: '#f8fafc',
  fontSize: '0.72rem',
  fontWeight: 800,
  color: '#475569',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  borderBottom: '1.5px solid #e2e8f0',
};

const trStyle = {
  borderBottom: '1px solid #f1f5f9',
};

const tdStyle = {
  padding: '14px 18px',
  verticalAlign: 'middle',
};

const orderNumberText = {
  fontSize: '0.875rem',
  color: '#1d4ed8',
  fontFamily: 'monospace',
  display: 'block',
  letterSpacing: '0.02em',
};

const orderDateText = {
  fontSize: '0.72rem',
  color: '#64748b',
  marginTop: '2px',
  display: 'block',
};

const customerAvatarCircle = {
  width: '34px',
  height: '34px',
  borderRadius: '50%',
  background: '#eff6ff',
  color: '#1d4ed8',
  fontWeight: 800,
  fontSize: '0.85rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const customerNameText = {
  fontSize: '0.85rem',
  fontWeight: 700,
  color: '#0f172a',
};

const customerSubText = {
  fontSize: '0.72rem',
  color: '#64748b',
};

const pincodeBadge = {
  fontSize: '0.7rem',
  color: '#64748b',
  fontFamily: 'monospace',
};

const itemsBadge = {
  fontSize: '0.75rem',
  fontWeight: 700,
  background: '#f1f5f9',
  color: '#334155',
  padding: '3px 8px',
  borderRadius: '6px',
};

const orderAmountText = {
  fontSize: '0.95rem',
  color: '#0f172a',
  letterSpacing: '-0.01em',
};

const paymentPill = {
  fontSize: '0.72rem',
  fontWeight: 700,
  padding: '3px 8px',
  borderRadius: '6px',
  whiteSpace: 'nowrap',
};

const statusSelectBox = {
  padding: '5px 10px',
  borderRadius: '8px',
  border: '1.5px solid',
  fontSize: '0.78rem',
  fontWeight: 800,
  outline: 'none',
  cursor: 'pointer',
};

const viewBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 12px',
  borderRadius: '8px',
  border: '1.5px solid #cbd5e1',
  background: '#ffffff',
  color: '#0f172a',
  fontSize: '0.78rem',
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
};

const paginationFooter = {
  padding: '14px 20px',
  background: '#ffffff',
  borderTop: '1px solid #f1f5f9',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '12px',
};

const paginationNavBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '6px 12px',
  borderRadius: '8px',
  border: '1.5px solid #e2e8f0',
  background: '#ffffff',
  fontSize: '0.78rem',
  fontWeight: 700,
  color: '#0f172a',
};

const pageNumberBtn = {
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  border: '1.5px solid #e2e8f0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.78rem',
  fontWeight: 800,
  cursor: 'pointer',
};

/* Modal Styles */
const modalOverlay = {
  position: 'fixed',
  inset: 0,
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px',
};

const modalBackdrop = {
  position: 'absolute',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.65)',
  backdropFilter: 'blur(5px)',
};

const modalBox = {
  position: 'relative',
  background: '#ffffff',
  borderRadius: '20px',
  width: '100%',
  maxWidth: '680px',
  padding: '24px',
  boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
  border: '1.5px solid #e2e8f0',
  maxHeight: '90vh',
  overflowY: 'auto',
  zIndex: 1,
};

const modalHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  paddingBottom: '16px',
  borderBottom: '1px solid #f1f5f9',
};

const statusBadgePill = {
  fontSize: '0.72rem',
  fontWeight: 800,
  padding: '3px 8px',
  borderRadius: '6px',
  border: '1px solid',
};

const printBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 12px',
  borderRadius: '8px',
  border: '1.5px solid #cbd5e1',
  background: '#ffffff',
  fontSize: '0.75rem',
  fontWeight: 700,
  color: '#0f172a',
  cursor: 'pointer',
};

const modalCloseBtn = {
  background: '#f8fafc',
  border: 'none',
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

const modalBody = {
  paddingTop: '16px',
};

const modalTwoCol = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: '14px',
};

const infoBlockCard = {
  background: '#f8fafc',
  borderRadius: '12px',
  padding: '14px',
  border: '1px solid #e2e8f0',
};

const infoBlockHeader = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '0.825rem',
  color: '#0f172a',
  marginBottom: '8px',
};

const infoBlockBody = {
  fontSize: '0.825rem',
};

const itemRowsContainer = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  maxHeight: '220px',
  overflowY: 'auto',
  paddingRight: '4px',
};

const itemDetailRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '10px 12px',
  borderRadius: '10px',
  border: '1px solid #f1f5f9',
  background: '#ffffff',
};

const itemThumbImg = {
  width: '46px',
  height: '46px',
  borderRadius: '8px',
  objectFit: 'cover',
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  flexShrink: 0,
};

const itemDetailTitle = {
  fontSize: '0.85rem',
  color: '#0f172a',
  display: '-webkit-box',
  WebkitLineClamp: 1,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};

const itemVariantTag = {
  fontSize: '0.7rem',
  color: '#64748b',
  fontWeight: 600,
  marginTop: '2px',
};

const itemDetailSub = {
  fontSize: '0.75rem',
  color: '#64748b',
  display: 'block',
  marginTop: '2px',
};

const orderBreakdownBox = {
  marginTop: '16px',
  padding: '14px',
  borderRadius: '12px',
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const breakdownRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const breakdownLabel = {
  fontSize: '0.8rem',
  color: '#64748b',
};

const breakdownValue = {
  fontSize: '0.85rem',
  fontWeight: 700,
  color: '#0f172a',
};

const breakdownDivider = {
  height: '1px',
  background: '#e2e8f0',
  margin: '4px 0',
};

const modalFooter = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '12px',
  marginTop: '18px',
  paddingTop: '16px',
  borderTop: '1px solid #f1f5f9',
};

const stepAdvanceBtn = {
  padding: '6px 12px',
  borderRadius: '8px',
  border: '1.5px solid',
  fontSize: '0.75rem',
  fontWeight: 700,
  transition: 'all 0.15s ease',
};

export default AdminOrdersPage;
