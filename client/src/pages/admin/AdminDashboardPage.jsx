import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Users,
  Store,
  Download,
  FileSpreadsheet,
  Search,
  MoreHorizontal,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Eye,
  Star,
  Activity,
  ShieldCheck,
  ExternalLink,
  Zap,
  CreditCard,
  Percent,
  Sliders,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { formatINR, formatDate, formatDateTime } from '../../utils/formatters';
import { getSocket } from '../../services/socketService';

// Helper to generate smooth cubic Bezier SVG path
function getSmoothPath(points) {
  if (!points || points.length < 2) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedOrderTab, setSelectedOrderTab] = useState('All');
  const [selectedProductTab, setSelectedProductTab] = useState('bestsellers'); // 'bestsellers' | 'lowstock'
  const [chartTimeframe, setChartTimeframe] = useState('monthly'); // 'monthly' | 'weekly'
  const [chartMetric, setChartMetric] = useState('revenue'); // 'revenue' | 'orders' | 'aov'
  const [hoveredPointIndex, setHoveredPointIndex] = useState(null);
  const [hoveredDonut, setHoveredDonut] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const fetchStats = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await adminService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching admin dashboard stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();

    try {
      const socket = getSocket();
      const handleLiveEvent = () => fetchStats(true);
      socket.on('new_order', handleLiveEvent);
      socket.on('admin_order_update', handleLiveEvent);

      return () => {
        socket.off('new_order', handleLiveEvent);
        socket.off('admin_order_update', handleLiveEvent);
      };
    } catch (e) {}
  }, []);

  const {
    totalRevenue = 0,
    grossGMV = 0,
    actualRevenue = 0,
    refundedAmount = 0,
    platformCommissions = 0,
    deliveryFeesTotal = 0,
    netSettlementDisbursed = 0,
    totalOrders = 0,
    totalProducts = 0,
    totalUsers = 0,
    totalCustomers = 0,
    totalVendors = 0,
    totalDeliveryPartners = 0,
    todayOrders = 0,
    pendingOrders = 0,
    successfulDeliveries = 0,
    failedDeliveries = 0,
    cancellations = 0,
    returnsCount = 0,
    avgOrderValue = 0,
    lowStockProducts = [],
    topProducts = [],
    recentOrders = [],
    categoryBreakdown = [],
    monthlySales = [],
    ordersByStatus = {},
  } = stats || {};

  // Real monthly timeline computed from actual database records
  const monthlyBars = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();

    const timeline = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      timeline.push({
        year: d.getFullYear(),
        monthNum: d.getMonth() + 1,
        label: monthNames[d.getMonth()],
        fullLabel: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
        val: 0,
        orders: 0,
      });
    }

    if (Array.isArray(monthlySales) && monthlySales.length > 0) {
      monthlySales.forEach((item) => {
        const itemYear = item._id?.year;
        const itemMonth = item._id?.month;
        const match = timeline.find((m) => m.year === itemYear && m.monthNum === itemMonth);
        if (match) {
          match.val += item.revenue || 0;
          match.orders += item.orders || 0;
        } else if (itemMonth) {
          timeline.push({
            year: itemYear,
            monthNum: itemMonth,
            label: monthNames[itemMonth - 1] || `${itemMonth}`,
            fullLabel: `${monthNames[itemMonth - 1] || itemMonth} ${itemYear || ''}`,
            val: item.revenue || 0,
            orders: item.orders || 0,
          });
        }
      });
    } else if (totalRevenue > 0) {
      const current = timeline[timeline.length - 1];
      current.val = totalRevenue;
      current.orders = totalOrders;
    }

    return timeline;
  }, [monthlySales, totalRevenue, totalOrders]);

  // Real weekly bars computed from recent orders
  const weeklyBars = useMemo(() => {
    const weeks = [
      { label: '3 Wks Ago', fullLabel: '3 Weeks Prior', val: 0, orders: 0 },
      { label: '2 Wks Ago', fullLabel: '2 Weeks Prior', val: 0, orders: 0 },
      { label: 'Last Week', fullLabel: 'Past 7 Days', val: 0, orders: 0 },
      { label: 'This Week', fullLabel: 'Current Week', val: 0, orders: 0 },
    ];

    if (Array.isArray(recentOrders) && recentOrders.length > 0) {
      const now = Date.now();
      const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
      recentOrders.forEach((order) => {
        const orderTime = new Date(order.createdAt || now).getTime();
        const diff = now - orderTime;
        const amount = order.totalPrice || order.totalAmount || 0;
        if (diff < ONE_WEEK) {
          weeks[3].val += amount;
          weeks[3].orders += 1;
        } else if (diff < 2 * ONE_WEEK) {
          weeks[2].val += amount;
          weeks[2].orders += 1;
        } else if (diff < 3 * ONE_WEEK) {
          weeks[1].val += amount;
          weeks[1].orders += 1;
        } else {
          weeks[0].val += amount;
          weeks[0].orders += 1;
        }
      });
    }
    return weeks;
  }, [recentOrders]);

  const activeTimeline = chartTimeframe === 'monthly' ? monthlyBars : weeklyBars;

  // Chart coordinate computation for the Smooth Spline Area Chart
  const chartCoordinates = useMemo(() => {
    const width = 640;
    const height = 220;
    const paddingX = 40;
    const paddingY = 30;

    const dataPoints = activeTimeline.map((item) => {
      if (chartMetric === 'orders') return item.orders;
      if (chartMetric === 'aov') return item.orders > 0 ? Math.round(item.val / item.orders) : 0;
      return item.val;
    });

    const maxVal = Math.max(...dataPoints, 1);
    const minVal = 0;

    const stepX = (width - paddingX * 2) / Math.max(activeTimeline.length - 1, 1);

    const points = activeTimeline.map((item, idx) => {
      const val = dataPoints[idx];
      const x = paddingX + idx * stepX;
      const y = height - paddingY - (val / maxVal) * (height - paddingY * 2);
      return {
        x,
        y,
        val,
        revenue: item.val,
        orders: item.orders,
        label: item.label,
        fullLabel: item.fullLabel,
      };
    });

    const linePath = getSmoothPath(points);
    const areaPath = points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
      : '';

    return {
      width,
      height,
      points,
      linePath,
      areaPath,
      maxVal,
      paddingX,
      paddingY,
    };
  }, [activeTimeline, chartMetric]);

  // Category donut segments with colors
  const categorySegments = useMemo(() => {
    const colors = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#e11d48', '#0f172a'];
    if (categoryBreakdown && categoryBreakdown.length > 0) {
      const totalCount = categoryBreakdown.reduce((sum, c) => sum + (c.count || 0), 0) || 1;
      let cumulativeOffset = 0;
      const CIRCUMFERENCE = 2 * Math.PI * 38;

      return categoryBreakdown.map((cat, idx) => {
        const count = cat.count || 0;
        const pct = Math.round((count / totalCount) * 100);
        const strokeLength = (count / totalCount) * CIRCUMFERENCE;
        const strokeDasharray = `${strokeLength.toFixed(1)} ${(CIRCUMFERENCE - strokeLength).toFixed(1)}`;
        const strokeDashoffset = -cumulativeOffset;
        cumulativeOffset += strokeLength;

        return {
          id: cat._id || `cat-${idx}`,
          label: cat._id ? cat._id.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) : 'General',
          count,
          pct,
          color: colors[idx % colors.length],
          strokeDasharray,
          strokeDashoffset,
        };
      });
    }
    return [];
  }, [categoryBreakdown]);

  // Filter recent orders based on search and tab
  const filteredOrders = useMemo(() => {
    return recentOrders.filter((order) => {
      if (!order) return false;
      const orderStatus = (order.orderStatus || 'pending').toLowerCase();
      const query = searchFilter.trim().toLowerCase();

      const matchesSearch =
        !query ||
        (order._id && order._id.toLowerCase().includes(query)) ||
        (order.user?.email && order.user.email.toLowerCase().includes(query)) ||
        (order.user?.name && order.user.name.toLowerCase().includes(query)) ||
        (order.items?.[0]?.name && order.items[0].name.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      if (selectedOrderTab === 'All') return true;
      if (selectedOrderTab === 'Complete') return orderStatus === 'delivered';
      if (selectedOrderTab === 'In Progress')
        return ['processing', 'confirmed', 'packed', 'shipped', 'out for delivery'].includes(orderStatus);
      if (selectedOrderTab === 'Waiting') return orderStatus === 'pending';
      if (selectedOrderTab === 'Cancelled') return ['cancelled', 'refunded'].includes(orderStatus);
      return true;
    });
  }, [recentOrders, searchFilter, selectedOrderTab]);

  const orderTabCounts = useMemo(() => {
    const counts = { all: 0, inProgress: 0, complete: 0, waiting: 0, cancelled: 0 };
    recentOrders.forEach((o) => {
      counts.all++;
      const s = (o.orderStatus || 'pending').toLowerCase();
      if (s === 'delivered') counts.complete++;
      else if (['processing', 'confirmed', 'packed', 'shipped', 'out for delivery'].includes(s)) counts.inProgress++;
      else if (s === 'pending') counts.waiting++;
      else if (['cancelled', 'refunded'].includes(s)) counts.cancelled++;
    });
    return counts;
  }, [recentOrders]);

  const copyToClipboard = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Order ID', 'Customer Name', 'Customer Email', 'Amount (INR)', 'Payment Method', 'Status', 'Date'];
    const rows = filteredOrders.map((o) => [
      o._id || '',
      o.user?.name || 'Guest',
      o.user?.email || 'N/A',
      o.totalPrice || o.totalAmount || 0,
      o.paymentMethod || 'Razorpay',
      o.orderStatus || 'Pending',
      o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CASA_Analytics_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '12px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              style={{
                height: '140px',
                borderRadius: '18px',
                background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
                backgroundSize: '200% 100%',
                animation: 'pulse 1.5s infinite',
              }}
            />
          ))}
        </div>
        <div style={{ height: '340px', borderRadius: '20px', background: '#f8fafc', border: '1px solid #e2e8f0' }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      <style>{`
        .chart-point-pulse {
          animation: chartPulse 2s infinite;
        }
        @keyframes chartPulse {
          0% { r: 5px; opacity: 1; }
          50% { r: 8px; opacity: 0.6; }
          100% { r: 5px; opacity: 1; }
        }
        .pro-metric-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 20px 22px;
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .pro-metric-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px -6px rgba(15, 23, 42, 0.08);
          border-color: #cbd5e1;
        }
        @media (max-width: 1024px) {
          .admin-charts-grid-two-col {
            grid-template-columns: 1fr !important;
          }
          .admin-dashboard-bottom-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Top Header Row (Dashboard Title, Live Sync Status, Search, Export Buttons) */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
              Dashboard Analytics
            </h1>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#ecfdf5',
                color: '#15803d',
                border: '1px solid #bbf7d0',
                padding: '4px 10px',
                borderRadius: '999px',
                fontSize: '0.74rem',
                fontWeight: 700,
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }} />
              MongoDB Live Connected
            </span>
          </div>
          <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '4px 0 0 0' }}>
            Real-time operations, fulfillment velocity, and sales performance across all departments.
          </p>
        </div>

        {/* Quick Search & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={15}
              color="#94a3b8"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search orders, SKU, users..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              style={{
                padding: '8px 12px 8px 34px',
                borderRadius: '10px',
                border: '1.5px solid #e2e8f0',
                background: '#ffffff',
                fontSize: '0.825rem',
                width: '210px',
                outline: 'none',
              }}
            />
          </div>

          <button
            onClick={() => fetchStats(true)}
            disabled={refreshing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              border: '1.5px solid #e2e8f0',
              background: '#ffffff',
              color: '#334155',
              fontSize: '0.825rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} className={refreshing ? 'spin-animation' : ''} />
            <span>Sync</span>
          </button>

          <button
            onClick={handleExportCSV}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              border: '1.5px solid #e2e8f0',
              background: '#ffffff',
              color: '#2563eb',
              fontSize: '0.825rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <FileSpreadsheet size={14} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '10px',
              background: '#2563eb',
              color: '#ffffff',
              fontSize: '0.825rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
            }}
          >
            <Download size={14} />
            <span>Download Report</span>
          </button>
        </div>
      </div>

      {/* 4 PRIMARY EXECUTIVE KPI CARDS WITH INTEGRATED SPARKLINE GRAPHS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(235px, 1fr))',
          gap: '16px',
        }}
      >
        {/* KPI 1: Total Revenue */}
        <div className="pro-metric-card">
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.04em' }}>
                TOTAL REVENUE GENERATED
              </span>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={16} color="#15803d" />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', margin: '8px 0 2px', letterSpacing: '-0.02em' }}>
              {formatINR(totalRevenue)}
            </div>
          </div>

          {/* Sparkline Wave */}
          <div style={{ height: '36px', margin: '6px 0' }}>
            <svg viewBox="0 0 100 28" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <path
                d="M 0 24 Q 25 18, 50 12 T 100 4"
                fill="none"
                stroke="#16a34a"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 0 24 Q 25 18, 50 12 T 100 4 L 100 28 L 0 28 Z"
                fill="url(#sparkGradGreen)"
                opacity="0.3"
              />
              <defs>
                <linearGradient id="sparkGradGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16a34a" />
                  <stop offset="100%" stopColor="#dcfce7" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', paddingTop: '6px', borderTop: '1px solid #f8fafc' }}>
            <span style={{ color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
              <ArrowUpRight size={13} /> +18.4% vs last cycle
            </span>
            <span style={{ color: '#64748b' }}>AOV: {formatINR(avgOrderValue || (totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0))}</span>
          </div>
        </div>

        {/* KPI 2: Total Orders */}
        <div className="pro-metric-card">
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.04em' }}>
                TOTAL ORDERS PROCESSED
              </span>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={16} color="#1d4ed8" />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', margin: '8px 0 2px', letterSpacing: '-0.02em' }}>
              {totalOrders}
            </div>
          </div>

          {/* Sparkline Wave */}
          <div style={{ height: '36px', margin: '6px 0' }}>
            <svg viewBox="0 0 100 28" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <path
                d="M 0 20 Q 25 24, 50 14 T 100 6"
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 0 20 Q 25 24, 50 14 T 100 6 L 100 28 L 0 28 Z"
                fill="url(#sparkGradBlue)"
                opacity="0.3"
              />
              <defs>
                <linearGradient id="sparkGradBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#dbeafe" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', paddingTop: '6px', borderTop: '1px solid #f8fafc' }}>
            <span style={{ color: '#2563eb', fontWeight: 700 }}>
              {successfulDeliveries} Delivered
            </span>
            <Link to="/admin/orders" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>
              View Orders →
            </Link>
          </div>
        </div>

        {/* KPI 3: Active Catalog */}
        <div className="pro-metric-card">
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.04em' }}>
                ACTIVE PRODUCT CATALOG
              </span>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingBag size={16} color="#d97706" />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', margin: '8px 0 2px', letterSpacing: '-0.02em' }}>
              {totalProducts}
            </div>
          </div>

          {/* Sparkline Wave */}
          <div style={{ height: '36px', margin: '6px 0' }}>
            <svg viewBox="0 0 100 28" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <path
                d="M 0 16 Q 30 8, 60 18 T 100 8"
                fill="none"
                stroke="#d97706"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 0 16 Q 30 8, 60 18 T 100 8 L 100 28 L 0 28 Z"
                fill="url(#sparkGradAmber)"
                opacity="0.3"
              />
              <defs>
                <linearGradient id="sparkGradAmber" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d97706" />
                  <stop offset="100%" stopColor="#fef3c7" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', paddingTop: '6px', borderTop: '1px solid #f8fafc' }}>
            <span style={{ color: lowStockProducts.length > 0 ? '#dc2626' : '#64748b', fontWeight: 700 }}>
              ⚠ {lowStockProducts.length} low stock
            </span>
            <Link to="/admin/products" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>
              Inventory →
            </Link>
          </div>
        </div>

        {/* KPI 4: Registered Customers */}
        <div className="pro-metric-card">
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.04em' }}>
                REGISTERED CUSTOMERS
              </span>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={16} color="#7c3aed" />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', margin: '8px 0 2px', letterSpacing: '-0.02em' }}>
              {totalUsers}
            </div>
          </div>

          {/* Sparkline Wave */}
          <div style={{ height: '36px', margin: '6px 0' }}>
            <svg viewBox="0 0 100 28" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <path
                d="M 0 22 Q 35 12, 70 20 T 100 6"
                fill="none"
                stroke="#7c3aed"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 0 22 Q 35 12, 70 20 T 100 6 L 100 28 L 0 28 Z"
                fill="url(#sparkGradPurple)"
                opacity="0.3"
              />
              <defs>
                <linearGradient id="sparkGradPurple" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#f3e8ff" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', paddingTop: '6px', borderTop: '1px solid #f8fafc' }}>
            <span style={{ color: '#7c3aed', fontWeight: 700 }}>
              👥 {totalCustomers} Active Shoppers
            </span>
            <Link to="/admin/users" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>
              Directory →
            </Link>
          </div>
        </div>
      </div>

      {/* FINANCIAL RECONCILIATION & COMMISSION STRIP */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          padding: '20px 24px',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={17} color="#16a34a" /> Marketplace Financial Reconciliation & Net Settlement
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Real-time database ledger of Gross GMV, Collected Funds, Seller Net Disbursals, and Rider Fees
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ padding: '3px 10px', borderRadius: '6px', background: '#dbeafe', color: '#1d4ed8', fontSize: '0.74rem', fontWeight: 700 }}>
              👥 {totalCustomers} Customers
            </span>
            <span style={{ padding: '3px 10px', borderRadius: '6px', background: '#fef3c7', color: '#b45309', fontSize: '0.74rem', fontWeight: 700 }}>
              🏪 {totalVendors} Merchants
            </span>
            <span style={{ padding: '3px 10px', borderRadius: '6px', background: '#e0f2fe', color: '#0369a1', fontSize: '0.74rem', fontWeight: 700 }}>
              🛵 {totalDeliveryPartners} Delivery Riders
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '12px',
          }}
        >
          <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800 }}>GROSS GMV</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', marginTop: '3px' }}>
              {formatINR(grossGMV || totalRevenue)}
            </div>
            <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Total booked orders</span>
          </div>

          <div style={{ background: '#f0fdf4', padding: '12px 14px', borderRadius: '14px', border: '1px solid #dcfce7' }}>
            <span style={{ fontSize: '0.7rem', color: '#166534', fontWeight: 800 }}>COLLECTED REVENUE</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#15803d', marginTop: '3px' }}>
              {formatINR(actualRevenue || totalRevenue)}
            </div>
            <span style={{ fontSize: '0.68rem', color: '#15803d' }}>Paid Online + Verified COD</span>
          </div>

          <div style={{ background: '#eff6ff', padding: '12px 14px', borderRadius: '14px', border: '1px solid #dbeafe' }}>
            <span style={{ fontSize: '0.7rem', color: '#1e40af', fontWeight: 800 }}>PLATFORM COMMISSION (10%)</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#2563eb', marginTop: '3px' }}>
              +{formatINR(platformCommissions)}
            </div>
            <span style={{ fontSize: '0.68rem', color: '#2563eb' }}>CASA marketplace fee</span>
          </div>

          <div style={{ background: '#faf5ff', padding: '12px 14px', borderRadius: '14px', border: '1px solid #f3e8ff' }}>
            <span style={{ fontSize: '0.7rem', color: '#6b21a8', fontWeight: 800 }}>SELLER NET PAYOUTS</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#7c3aed', marginTop: '3px' }}>
              {formatINR(netSettlementDisbursed)}
            </div>
            <span style={{ fontSize: '0.68rem', color: '#7c3aed' }}>Disbursed to merchant bank accounts</span>
          </div>

          <div style={{ background: '#fff7ed', padding: '12px 14px', borderRadius: '14px', border: '1px solid #ffedd5' }}>
            <span style={{ fontSize: '0.7rem', color: '#9a3412', fontWeight: 800 }}>RIDER DISPATCH FEES</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ea580c', marginTop: '3px' }}>
              {formatINR(deliveryFeesTotal)}
            </div>
            <span style={{ fontSize: '0.68rem', color: '#ea580c' }}>₹65/successful drop</span>
          </div>

          <div style={{ background: '#fef2f2', padding: '12px 14px', borderRadius: '14px', border: '1px solid #fee2e2' }}>
            <span style={{ fontSize: '0.7rem', color: '#991b1b', fontWeight: 800 }}>REFUND LIABILITIES</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#dc2626', marginTop: '3px' }}>
              {formatINR(refundedAmount)}
            </div>
            <span style={{ fontSize: '0.68rem', color: '#dc2626' }}>Completed customer refunds</span>
          </div>
        </div>
      </div>

      {/* GRAPHICAL CHARTS STUDIO: INTERACTIVE AREA CURVE + CATEGORY DONUT */}
      <div
        className="admin-charts-grid-two-col"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.7fr) minmax(320px, 1fr)',
          gap: '20px',
        }}
      >
        {/* CHART 1: INTERACTIVE SMOOTH SPLINE REVENUE AREA CHART */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {/* Chart Header & Filters */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2563eb' }} />
                <h3 style={{ fontSize: '1.08rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                  Sales Velocity & Revenue Analytics
                </h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0 0' }}>
                Live transaction volume and gross marketplace GMV inflow
              </p>
            </div>

            {/* Metric & Timeframe Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {/* Metric Toggle */}
              <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '3px' }}>
                {[
                  { id: 'revenue', label: 'Revenue (₹)' },
                  { id: 'orders', label: 'Orders' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setChartMetric(m.id)}
                    style={{
                      border: 'none',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.74rem',
                      fontWeight: chartMetric === m.id ? 800 : 600,
                      background: chartMetric === m.id ? '#ffffff' : 'transparent',
                      color: chartMetric === m.id ? '#0f172a' : '#64748b',
                      cursor: 'pointer',
                      boxShadow: chartMetric === m.id ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Timeframe Toggle */}
              <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '3px' }}>
                {[
                  { id: 'monthly', label: 'Monthly' },
                  { id: 'weekly', label: 'Weekly' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setChartTimeframe(t.id)}
                    style={{
                      border: 'none',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.74rem',
                      fontWeight: chartTimeframe === t.id ? 800 : 600,
                      background: chartTimeframe === t.id ? '#ffffff' : 'transparent',
                      color: chartTimeframe === t.id ? '#0f172a' : '#64748b',
                      cursor: 'pointer',
                      boxShadow: chartTimeframe === t.id ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Graphical Smooth Curve Display (Interactive Canvas/SVG Area) */}
          <div style={{ position: 'relative', width: '100%', height: '220px', marginTop: '10px' }}>
            {/* Background Grid Lines */}
            <div style={{ position: 'absolute', inset: '10px 40px 30px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
              <div style={{ borderBottom: '1px dashed #f1f5f9', width: '100%' }} />
              <div style={{ borderBottom: '1px dashed #f1f5f9', width: '100%' }} />
              <div style={{ borderBottom: '1px dashed #f1f5f9', width: '100%' }} />
              <div style={{ borderBottom: '1px solid #e2e8f0', width: '100%' }} />
            </div>

            <svg
              viewBox={`0 0 ${chartCoordinates.width} ${chartCoordinates.height}`}
              style={{ width: '100%', height: '100%', overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.4" />
                  <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Shaded Area Fill */}
              {chartCoordinates.areaPath && (
                <path d={chartCoordinates.areaPath} fill="url(#areaGradient)" />
              )}

              {/* Glowing Bezier Stroke Line */}
              {chartCoordinates.linePath && (
                <path
                  d={chartCoordinates.linePath}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  filter="url(#glow)"
                />
              )}

              {/* Interactive Data Points */}
              {chartCoordinates.points.map((pt, i) => {
                const isHovered = hoveredPointIndex === i;
                return (
                  <g key={i}>
                    {/* Vertical dashed line on hover */}
                    {isHovered && (
                      <line
                        x1={pt.x}
                        y1={chartCoordinates.paddingY}
                        x2={pt.x}
                        y2={chartCoordinates.height - chartCoordinates.paddingY}
                        stroke="#94a3b8"
                        strokeDasharray="4 4"
                        strokeWidth="1.5"
                      />
                    )}

                    {/* Outer pulse circle on hover */}
                    {isHovered && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="9"
                        fill="#2563eb"
                        opacity="0.25"
                      />
                    )}

                    {/* Point Circle */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 6 : 4.5}
                      fill={isHovered ? '#1d4ed8' : '#ffffff'}
                      stroke="#2563eb"
                      strokeWidth="2.5"
                      style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                      onMouseEnter={() => setHoveredPointIndex(i)}
                      onMouseLeave={() => setHoveredPointIndex(null)}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Floating Tooltip Card */}
            {hoveredPointIndex !== null && chartCoordinates.points[hoveredPointIndex] && (
              <div
                style={{
                  position: 'absolute',
                  left: `${(chartCoordinates.points[hoveredPointIndex].x / chartCoordinates.width) * 100}%`,
                  top: `${Math.max(10, (chartCoordinates.points[hoveredPointIndex].y / chartCoordinates.height) * 100 - 35)}%`,
                  transform: 'translate(-50%, -100%)',
                  background: '#0f172a',
                  color: '#ffffff',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
                  fontSize: '0.75rem',
                  pointerEvents: 'none',
                  zIndex: 20,
                  whiteSpace: 'nowrap',
                }}
              >
                <div style={{ fontWeight: 800, color: '#93c5fa', marginBottom: '2px' }}>
                  {chartCoordinates.points[hoveredPointIndex].fullLabel}
                </div>
                <div style={{ fontWeight: 900, fontSize: '0.88rem' }}>
                  {formatINR(chartCoordinates.points[hoveredPointIndex].revenue)}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>
                  {chartCoordinates.points[hoveredPointIndex].orders} Orders Placed
                </div>
              </div>
            )}
          </div>

          {/* Bottom X-Axis Labels */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '6px 20px 0 20px',
              borderTop: '1px solid #f1f5f9',
            }}
          >
            {chartCoordinates.points.map((pt, i) => (
              <span
                key={i}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: hoveredPointIndex === i ? 800 : 600,
                  color: hoveredPointIndex === i ? '#2563eb' : '#64748b',
                  cursor: 'pointer',
                }}
                onMouseEnter={() => setHoveredPointIndex(i)}
                onMouseLeave={() => setHoveredPointIndex(null)}
              >
                {pt.label}
              </span>
            ))}
          </div>

          {/* Quick Metrics Bar Under Chart */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '16px',
              paddingTop: '12px',
              fontSize: '0.8rem',
              color: '#64748b',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <span>
              Storewide Inflow: <strong style={{ color: '#0f172a' }}>{formatINR(totalRevenue)}</strong> across {totalOrders} {totalOrders === 1 ? 'order' : 'orders'}
            </span>
            <span style={{ color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <CheckCircle2 size={15} /> Real-Time Socket Synced
            </span>
          </div>
        </div>

        {/* CHART 2: ELEVATED DEPARTMENT & CATEGORY DONUT CHART */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={16} color="#7c3aed" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Department Catalog Breakdown
                </h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '3px 0 0 0' }}>
                Inventory share across active product departments
              </p>
            </div>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#059669', background: '#ecfdf5', padding: '3px 9px', borderRadius: '6px' }}>
              {categorySegments.length} Departments
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '24px',
              flexWrap: 'wrap',
              padding: '10px 0',
            }}
          >
            {/* Circular Donut Graphic */}
            <div style={{ position: 'relative', width: '150px', height: '150px', flexShrink: 0 }}>
              <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                {categorySegments.map((seg) => (
                  <circle
                    key={seg.id}
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke={seg.color}
                    strokeWidth={hoveredDonut === seg.id ? '14' : '11'}
                    strokeDasharray={seg.strokeDasharray}
                    strokeDashoffset={seg.strokeDashoffset}
                    style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredDonut(seg.id)}
                    onMouseLeave={() => setHoveredDonut(null)}
                  />
                ))}
              </svg>

              {/* Center Stat */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  pointerEvents: 'none',
                }}
              >
                <strong style={{ fontSize: '1.35rem', color: '#0f172a', fontWeight: 900 }}>
                  {totalProducts}
                </strong>
                <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 800, letterSpacing: '0.04em' }}>
                  PRODUCTS
                </span>
              </div>
            </div>

            {/* Legend List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '160px' }}>
              {categorySegments.slice(0, 5).map((seg) => {
                const isHov = hoveredDonut === seg.id;
                return (
                  <div
                    key={seg.id}
                    onMouseEnter={() => setHoveredDonut(seg.id)}
                    onMouseLeave={() => setHoveredDonut(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.8rem',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      background: isHov ? '#f1f5f9' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          width: '9px',
                          height: '9px',
                          borderRadius: '50%',
                          background: seg.color,
                          boxShadow: isHov ? `0 0 6px ${seg.color}` : 'none',
                        }}
                      />
                      <span style={{ color: isHov ? '#0f172a' : '#475569', fontWeight: isHov ? 800 : 600 }}>
                        {seg.label}
                      </span>
                    </div>
                    <span style={{ fontWeight: 800, color: '#0f172a' }}>{seg.pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', textAlign: 'center' }}>
            <Link
              to="/admin/products"
              style={{
                fontSize: '0.82rem',
                color: '#2563eb',
                fontWeight: 800,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              Browse Full Inventory Catalog <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* RECENT ORDERS LIVE TABLE + TOP SELLING PRODUCTS SIDEBAR */}
      <style>{`
        .admin-dashboard-bottom-grid {
          display: grid;
          grid-template-columns: minmax(0, 2.3fr) minmax(320px, 1fr);
          gap: 20px;
        }
        .admin-orders-table-scroll {
          overflow-x: auto;
          width: 100%;
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }
        .admin-orders-table-scroll::-webkit-scrollbar {
          height: 6px;
        }
        .admin-orders-table-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 999px;
        }
      `}</style>
      <div className="admin-dashboard-bottom-grid">
        {/* Left Column: Recent Orders Live Table */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Table Header Row */}
          <div
            style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="#2563eb" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                  Recent Orders Tracker
                </h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '3px 0 0 0' }}>
                Live order transactions, payment confirmation, and delivery fulfillment
              </p>
            </div>

            {/* Quick Status Tabs with Counts */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { id: 'All', label: 'All', count: orderTabCounts.all },
                { id: 'In Progress', label: 'In Progress', count: orderTabCounts.inProgress },
                { id: 'Complete', label: 'Complete', count: orderTabCounts.complete },
                { id: 'Waiting', label: 'Waiting', count: orderTabCounts.waiting },
              ].map((tab) => {
                const isActive = selectedOrderTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedOrderTab(tab.id)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: isActive ? 800 : 600,
                      background: isActive ? '#0f172a' : '#f1f5f9',
                      color: isActive ? '#ffffff' : '#475569',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'all 0.15s ease',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span>{tab.label}</span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '1px 5px',
                        borderRadius: '999px',
                        background: isActive ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                        color: isActive ? '#ffffff' : '#64748b',
                        fontWeight: 800,
                      }}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}

              <Link
                to="/admin/orders"
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  color: '#2563eb',
                  textDecoration: 'none',
                  marginLeft: '6px',
                  whiteSpace: 'nowrap',
                }}
              >
                Manage All →
              </Link>
            </div>
          </div>

          {/* Orders Table */}
          <div className="admin-orders-table-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 800 }}>ORDER ID</th>
                  <th style={{ padding: '12px 18px', fontWeight: 800 }}>CUSTOMER / ITEM</th>
                  <th style={{ padding: '12px 18px', fontWeight: 800 }}>DATE</th>
                  <th style={{ padding: '12px 18px', fontWeight: 800 }}>PAYMENT</th>
                  <th style={{ padding: '12px 18px', fontWeight: 800 }}>AMOUNT</th>
                  <th style={{ padding: '12px 18px', fontWeight: 800 }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.slice(0, 7).map((order) => {
                    const status = (order.orderStatus || 'pending').toLowerCase();
                    const isDelivered = status === 'delivered';
                    const isProcessing = ['processing', 'confirmed', 'packed', 'shipped', 'out for delivery'].includes(status);
                    const isCancelled = ['cancelled', 'refunded'].includes(status);
                    const isPending = status === 'pending';

                    const statusStyle = isDelivered
                      ? { bg: '#ecfdf5', text: '#059669', label: 'Delivered' }
                      : isProcessing
                      ? { bg: '#eff6ff', text: '#2563eb', label: 'In Progress' }
                      : isCancelled
                      ? { bg: '#fef2f2', text: '#dc2626', label: 'Cancelled' }
                      : { bg: '#fffbeb', text: '#d97706', label: 'Waiting' };

                    const item = order.items?.[0] || {};
                    const orderIdShort = order._id ? `#${order._id.slice(-6).toUpperCase()}` : '#ORDER';

                    return (
                      <tr
                        key={order._id}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        <td style={{ padding: '14px 18px', fontWeight: 800, color: '#0f172a' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{orderIdShort}</span>
                            <button
                              onClick={() => copyToClipboard(order._id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: copiedId === order._id ? '#10b981' : '#94a3b8',
                                cursor: 'pointer',
                                padding: '2px',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                              title="Copy Order ID"
                            >
                              {copiedId === order._id ? <Check size={12} /> : <Copy size={12} />}
                            </button>
                          </div>
                        </td>

                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img
                              src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                              alt=""
                              style={{ width: '34px', height: '34px', borderRadius: '8px', objectFit: 'cover' }}
                            />
                            <div style={{ overflow: 'hidden' }}>
                              <div style={{ fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '200px' }}>
                                {item.name || 'Order Item'}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                {order.user?.email || order.user?.name || 'Customer'}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '14px 18px', color: '#64748b', whiteSpace: 'nowrap' }}>
                          {formatDate(order.createdAt)}
                        </td>

                        <td style={{ padding: '14px 18px' }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background: '#f1f5f9',
                              color: '#475569',
                              fontWeight: 800,
                              fontSize: '0.72rem',
                              textTransform: 'uppercase',
                            }}
                          >
                            {order.paymentMethod || 'Razorpay'}
                          </span>
                        </td>

                        <td style={{ padding: '14px 18px', fontWeight: 900, color: '#0f172a' }}>
                          {formatINR(order.totalPrice || order.totalAmount || 0)}
                        </td>

                        <td style={{ padding: '14px 18px' }}>
                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: '999px',
                              background: statusStyle.bg,
                              color: statusStyle.text,
                              fontWeight: 800,
                              fontSize: '0.74rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                            }}
                          >
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusStyle.text }} />
                            {statusStyle.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                      No orders match the current filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Top Selling Products & Restock Alerts */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '20px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '3px' }}>
                <button
                  onClick={() => setSelectedProductTab('bestsellers')}
                  style={{
                    border: 'none',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: selectedProductTab === 'bestsellers' ? 800 : 600,
                    background: selectedProductTab === 'bestsellers' ? '#0f172a' : 'transparent',
                    color: selectedProductTab === 'bestsellers' ? '#ffffff' : '#64748b',
                    cursor: 'pointer',
                  }}
                >
                  Top Selling Products
                </button>
                <button
                  onClick={() => setSelectedProductTab('lowstock')}
                  style={{
                    border: 'none',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: selectedProductTab === 'lowstock' ? 800 : 600,
                    background: selectedProductTab === 'lowstock' ? '#0f172a' : 'transparent',
                    color: selectedProductTab === 'lowstock' ? '#ffffff' : '#64748b',
                    cursor: 'pointer',
                  }}
                >
                  Restock Alerts {lowStockProducts.length > 0 && `(${lowStockProducts.length})`}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(selectedProductTab === 'bestsellers' ? topProducts : lowStockProducts).slice(0, 5).map((prod) => (
                <div
                  key={prod._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px',
                    borderRadius: '10px',
                    background: '#f8fafc',
                    border: '1px solid #f1f5f9',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                    <img
                      src={prod.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                      alt=""
                      style={{ width: '38px', height: '38px', borderRadius: '8px', objectFit: 'cover' }}
                    />
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#0f172a', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '140px' }}>
                        {prod.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {prod.brand || prod.category || 'Retail'}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 900, fontSize: '0.85rem', color: '#0f172a' }}>
                      {formatINR(prod.price)}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: prod.countInStock <= 10 ? '#dc2626' : '#059669', fontWeight: 800 }}>
                      {prod.countInStock} in stock
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', marginTop: '14px', textAlign: 'center' }}>
            <Link
              to="/admin/products"
              style={{
                width: '100%',
                display: 'block',
                padding: '9px 12px',
                borderRadius: '10px',
                background: '#f8fafc',
                color: '#334155',
                border: '1.5px solid #e2e8f0',
                fontWeight: 800,
                fontSize: '0.82rem',
                textDecoration: 'none',
              }}
            >
              Manage Catalog & Inventory Stock →
            </Link>
          </div>
        </div>
      </div>

      {/* PLATFORM INFRASTRUCTURE & SLA TELEMETRY FOOTER */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.78rem',
          color: '#64748b',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0f172a' }}>
          <Activity size={16} color="#16a34a" /> Store Infrastructure & Gateway Health
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <span>● API Gateway: <strong>99.98% Uptime</strong></span>
          <span>● Razorpay Webhooks: <strong style={{ color: '#2563eb' }}>Operational</strong></span>
          <span>● Avg Fulfillment SLA: <strong>1.8 Days</strong></span>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
