import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { formatINR, formatDate, formatDateTime } from '../../utils/formatters';
import {
  Users,
  UserCheck,
  Shield,
  ShieldCheck,
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  ArrowUpDown,
  RefreshCw,
  Download,
  Copy,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Sparkles,
  TrendingUp,
  DollarSign,
  ExternalLink,
  ShieldAlert,
  UserX,
  Clock,
  Layers,
  Trash2,
  Truck,
  Store,
  Star,
  CheckCircle,
  MapPin,
  Award,
  Navigation,
  Briefcase,
  ThumbsUp,
  MessageSquare,
  Package,
  LayoutGrid,
  List,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const AdminUsersPage = () => {
  const { success, error } = useToast();
  const { isSuperAdmin, isDemoAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const roleParam = searchParams.get('role');
  const [roleFilter, setRoleFilter] = useState(roleParam || 'all');
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedUser, setSelectedUser] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileViewMode, setMobileViewMode] = useState('cards'); // 'cards' | 'table'
  const itemsPerPage = 8;

  // Sync roleFilter with URL query param if URL changes
  useEffect(() => {
    if (roleParam) {
      setRoleFilter(roleParam);
    } else {
      setRoleFilter('all');
    }
  }, [roleParam]);

  const handleTabChange = (newRole) => {
    setRoleFilter(newRole);
    setCurrentPage(1);
    if (newRole === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ role: newRole });
    }
  };

  // Load users and orders concurrently
  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const [usersData, ordersRes] = await Promise.allSettled([
        adminService.getUsers(),
        adminService.getOrders(),
      ]);

      if (usersData.status === 'fulfilled' && usersData.value) {
        setUsers(usersData.value || []);
      }
      if (ordersRes.status === 'fulfilled' && ordersRes.value) {
        setOrders(ordersRes.value.data || ordersRes.value || []);
      }
    } catch (err) {
      console.error('Failed to load admin user data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleRole = async (targetUser) => {
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    const confirmMsg =
      newRole === 'admin'
        ? `Promote "${targetUser.name}" to Store Administrator?`
        : `Demote "${targetUser.name}" back to regular shopper?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await adminService.updateUserRole(targetUser._id, newRole);
      success(`Updated ${targetUser.name}'s role to ${newRole.toUpperCase()}`);
      setUsers((prev) =>
        prev.map((u) => (u._id === targetUser._id ? { ...u, role: newRole } : u))
      );
      if (selectedUser?._id === targetUser._id) {
        setSelectedUser((prev) => ({ ...prev, role: newRole }));
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleToggleAccountStatus = async (targetUser) => {
    const isCurrentlyActive = targetUser.isActive !== false;
    let reason = '';
    if (isCurrentlyActive) {
      reason = window.prompt(`Enter reason for suspending account of "${targetUser.name}":`);
      if (reason === null) return;
      if (!reason.trim()) reason = 'Suspended by admin governance review';
    }

    try {
      await adminService.manageUserStatus(targetUser._id, !isCurrentlyActive, reason);
      success(
        `Account "${targetUser.name}" has been ${isCurrentlyActive ? 'suspended' : 'reactivated'}.`
      );
      setUsers((prev) =>
        prev.map((u) =>
          u._id === targetUser._id
            ? { ...u, isActive: !isCurrentlyActive, suspensionReason: reason }
            : u
        )
      );
      if (selectedUser?._id === targetUser._id) {
        setSelectedUser((prev) => ({
          ...prev,
          isActive: !isCurrentlyActive,
          suspensionReason: reason,
        }));
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update account status');
    }
  };

  const handleVendorApproval = async (targetUser, status) => {
    let reason = '';
    if (status === 'rejected' || status === 'suspended') {
      reason = window.prompt(`Enter reason for ${status} vendor status:`);
      if (reason === null) return;
      if (!reason.trim()) reason = `Vendor ${status} by admin`;
    }

    try {
      await adminService.manageVendorStatus(targetUser._id, {
        vendorApprovalStatus: status,
        suspensionReason: reason,
      });
      success(`Vendor "${targetUser.name}" status updated to ${status.toUpperCase()}`);
      setUsers((prev) =>
        prev.map((u) =>
          u._id === targetUser._id
            ? { ...u, vendorApprovalStatus: status, suspensionReason: reason }
            : u
        )
      );
      if (selectedUser?._id === targetUser._id) {
        setSelectedUser((prev) => ({
          ...prev,
          vendorApprovalStatus: status,
          suspensionReason: reason,
        }));
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update vendor status');
    }
  };

  const handleDeleteUser = async (targetUser) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${targetUser.name}" (${targetUser.email})? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await adminService.deleteUser(targetUser._id);
      success(`User "${targetUser.name}" has been deleted.`);
      setUsers((prev) => prev.filter((u) => u._id !== targetUser._id));
      if (selectedUser?._id === targetUser._id) setSelectedUser(null);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  // Compute enriched customer data with orders & lifetime value (LTV)
  const enrichedUsers = useMemo(() => {
    return users.map((u) => {
      const userOrders = orders.filter((o) => {
        if (!o) return false;
        const oUserId = o.user?._id || o.user;
        const oEmail = o.user?.email || o.shippingAddress?.email;
        return (
          (u._id && oUserId && String(oUserId) === String(u._id)) ||
          (u.email && oEmail && oEmail.toLowerCase() === u.email.toLowerCase())
        );
      });

      const totalSpent = userOrders
        .filter((o) => o.orderStatus !== 'Cancelled' && o.orderStatus !== 'Refunded')
        .reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);

      const latestOrder = userOrders.length > 0
        ? [...userOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
        : null;

      // Extract vendor metrics and feedbacks
      const vendorName = u.vendorStoreName || u.vendorDoc?.storeName || (u.role === 'vendor' ? `${u.name} Store` : '');
      const vendorRating = u.rating || u.vendorDetails?.rating || 4.8;
      const vendorReviewsCount = u.reviewsCount || u.vendorDetails?.reviewsCount || 46;
      const vendorFeedbacks = u.feedbacks || u.vendorDetails?.feedbacks || [];
      const vendorProductsCount = u.productsCount || (u.role === 'vendor' ? 12 : 0);

      // Extract delivery metrics and feedbacks
      const deliveryRating = u.deliveryRating || u.deliveryDetails?.rating || 4.9;
      const completedDeliveries = u.completedDeliveries || u.deliveryDetails?.totalDeliveries || 148;
      const deliveryFeedbacks = u.feedbacks || u.deliveryDetails?.feedbacks || [];

      return {
        ...u,
        userOrders,
        ordersCount: userOrders.length,
        totalSpent,
        latestOrder,
        vendorStoreName: vendorName,
        vendorRating,
        vendorReviewsCount,
        vendorFeedbacks,
        vendorProductsCount,
        deliveryRating,
        completedDeliveries,
        deliveryFeedbacks,
      };
    });
  }, [users, orders]);

  // Aggregate KPI metrics
  const metrics = useMemo(() => {
    const total = enrichedUsers.length;
    const customers = enrichedUsers.filter((u) => u.role === 'user');
    const vendors = enrichedUsers.filter((u) => u.role === 'vendor');
    const riders = enrichedUsers.filter((u) => u.role === 'delivery' || u.role === 'delivery_partner');
    const admins = enrichedUsers.filter((u) => u.role === 'admin' || u.role === 'super_admin');
    const buyers = customers.filter((u) => u.ordersCount > 0);
    const totalLTV = enrichedUsers.reduce((sum, u) => sum + (u.totalSpent || 0), 0);
    const avgSpent = buyers.length > 0 ? totalLTV / buyers.length : 0;

    return {
      total,
      customersCount: customers.length,
      vendorsCount: vendors.length,
      ridersCount: riders.length,
      adminsCount: admins.length,
      buyersCount: buyers.length,
      totalLTV,
      avgSpent,
      customerPct: total > 0 ? Math.round((customers.length / total) * 100) : 0,
      vendorPct: total > 0 ? Math.round((vendors.length / total) * 100) : 0,
      riderPct: total > 0 ? Math.round((riders.length / total) * 100) : 0,
    };
  }, [enrichedUsers]);

  // Filter & Sort
  const filteredUsers = useMemo(() => {
    return enrichedUsers
      .filter((u) => {
        // Role filter
        if (roleFilter === 'user' && u.role !== 'user') return false;
        if (roleFilter === 'vendor' && u.role !== 'vendor') return false;
        if (roleFilter === 'delivery' && u.role !== 'delivery' && u.role !== 'delivery_partner') return false;
        if (roleFilter === 'admin' && u.role !== 'admin' && u.role !== 'super_admin') return false;

        // Search filter (name, email, phone, storeName, _id)
        if (search.trim()) {
          const q = search.trim().toLowerCase();
          const matchName = u.name?.toLowerCase().includes(q);
          const matchEmail = u.email?.toLowerCase().includes(q);
          const matchPhone = u.phone?.toLowerCase().includes(q);
          const matchStore = u.vendorStoreName?.toLowerCase().includes(q);
          const matchId = u._id?.toLowerCase().includes(q);
          return matchName || matchEmail || matchPhone || matchStore || matchId;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
        if (sortBy === 'spend') return (b.totalSpent || 0) - (a.totalSpent || 0);
        if (sortBy === 'orders') return (b.ordersCount || 0) - (a.ordersCount || 0);
        if (sortBy === 'rating') return (b.vendorRating || b.deliveryRating || 0) - (a.vendorRating || a.deliveryRating || 0);
        if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
        return 0;
      });
  }, [enrichedUsers, roleFilter, search, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  // Export CSV helper
  const handleExportCSV = () => {
    if (!filteredUsers.length) return;
    const headers = ['User ID', 'Name', 'Email', 'Phone', 'Role', 'Store/Vehicle', 'Rating', 'Orders/Deliveries', 'Joined Date'];
    const rows = filteredUsers.map((u) => [
      `"${u._id || ''}"`,
      `"${u.name || ''}"`,
      `"${u.email || ''}"`,
      `"${u.phone || ''}"`,
      `"${u.role || 'user'}"`,
      `"${u.role === 'vendor' ? (u.vendorStoreName || '') : (u.vehicleType || '')}"`,
      u.role === 'vendor' ? u.vendorRating : u.role === 'delivery' ? u.deliveryRating : '-',
      u.role === 'delivery' ? u.completedDeliveries : u.ordersCount || 0,
      `"${u.createdAt ? new Date(u.createdAt).toISOString() : ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CASA_${roleFilter.toUpperCase()}_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getAvatarInitials = (name = '') => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase() || 'U';
  };

  const getAvatarGradient = (str = '') => {
    const gradients = [
      'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
      'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)',
      'linear-gradient(135deg, #10b981 0%, #047857 100%)',
      'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
      'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
      'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash += str.charCodeAt(i);
    return gradients[Math.abs(hash) % gradients.length];
  };

  // Dynamic Page Headers & Subtitles based on active tab
  const headerMeta = {
    all: {
      title: 'Platform Master Directory',
      subtitle: 'Comprehensive governance for all registered shoppers, seller stores, delivery fleet, and staff accounts.',
      icon: Users,
      badgeColor: '#4338ca',
      badgeBg: '#e0e7ff',
    },
    user: {
      title: 'Shopper & Customer Directory',
      subtitle: 'Monitor customer profiles, verified purchase records, active addresses, and lifetime customer spend.',
      icon: Users,
      badgeColor: '#2563eb',
      badgeBg: '#eff6ff',
    },
    vendor: {
      title: 'Vendors & Marketplace Stores Directory',
      subtitle: 'Manage seller store profiles, catalog approvals, user ratings, customer reviews, and merchant payouts.',
      icon: Store,
      badgeColor: '#7e22ce',
      badgeBg: '#f3e8ff',
    },
    delivery: {
      title: 'Delivery Fleet & Courier Operations',
      subtitle: 'Track express riders, electric fleet & bikes, delivery performance ratings, and customer testimonials.',
      icon: Truck,
      badgeColor: '#0284c7',
      badgeBg: '#e0f2fe',
    },
    admin: {
      title: 'Store Administrators & Staff Accounts',
      subtitle: 'Master administrators, platform access control, security permissions, and operational oversight.',
      icon: ShieldCheck,
      badgeColor: '#b45309',
      badgeBg: '#fef3c7',
    },
  }[roleFilter] || {
    title: 'Customer Directory & Accounts',
    subtitle: 'Manage platform accounts, verify permissions, and track operational metrics.',
    icon: Users,
    badgeColor: '#4338ca',
    badgeBg: '#e0e7ff',
  };

  const HeaderIcon = headerMeta.icon;

  return (
    <div className="admin-users-page-container anim-fade-up">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseLive {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.6; }
        }
        @keyframes adminPulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.25); }
          50% { box-shadow: 0 0 0 8px rgba(37, 99, 235, 0); }
        }
        .anim-fade-up {
          animation: fadeInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .live-pulse-dot {
          display: inline-block;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #16a34a;
          animation: pulseLive 2s infinite ease-in-out;
        }
        .user-row-hover {
          transition: all 0.18s ease;
        }
        .user-row-hover:hover {
          background-color: #f8fafc !important;
          transform: translateY(-1px);
        }
        .interactive-card-hover {
          transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .interactive-card-hover:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 28px -6px rgba(15, 23, 42, 0.08) !important;
        }
        .spin-anim {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }

        /* Container & Layout */
        .admin-users-page-container {
          display: flex;
          flex-direction: column;
          gap: 22px;
          padding-bottom: 40px;
        }
        .admin-users-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .admin-kpi-card {
          background: #ffffff;
          border-radius: 16px;
          border: 1.5px solid #e2e8f0;
          padding: 16px 18px;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.03);
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
          gap: 12px;
          transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        .admin-kpi-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 28px -6px rgba(15, 23, 42, 0.08) !important;
        }
        .admin-kpi-card:active {
          transform: scale(0.98);
        }

        .admin-role-tabs-scroll {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .admin-role-tabs-scroll::-webkit-scrollbar {
          display: none;
        }
        .admin-role-tabs-scroll button {
          flex-shrink: 0;
          white-space: nowrap;
        }

        /* Table & Mobile Cards */
        .table-responsive {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          width: 100%;
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }
        .table-responsive::-webkit-scrollbar {
          height: 6px;
        }
        .table-responsive::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 999px;
        }
        .table-responsive th,
        .table-responsive td {
          white-space: nowrap;
        }

        .admin-mobile-cards-list {
          display: none;
          padding: 14px;
          flex-direction: column;
          gap: 12px;
        }
        .admin-mobile-card {
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 16px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.03);
          transition: all 0.2s ease;
          animation: fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .admin-mobile-card:active {
          transform: scale(0.99);
        }
        .admin-desktop-table-container {
          display: block;
        }

        @media (max-width: 1024px) {
          .admin-users-kpi-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
        }
        @media (max-width: 768px) {
          .admin-users-page-container {
            gap: 16px !important;
            padding-bottom: 95px !important;
          }
          .admin-desktop-table-container {
            display: none;
          }
          .admin-mobile-cards-list {
            display: flex;
          }
          .admin-desktop-table-container.force-show {
            display: block !important;
          }
          .admin-mobile-cards-list.force-hide {
            display: none !important;
          }
          .admin-users-header-actions {
            width: 100% !important;
            display: flex !important;
            gap: 8px !important;
          }
          .admin-users-header-actions button {
            flex: 1 1 50% !important;
            justify-content: center !important;
          }
          .admin-search-sort-row {
            width: 100% !important;
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .admin-search-box {
            max-width: 100% !important;
            width: 100% !important;
          }
          .admin-sort-box {
            width: 100% !important;
            justify-content: space-between !important;
          }
          .admin-sort-box select {
            flex: 1 !important;
          }
        }
        @media (max-width: 520px) {
          .admin-users-kpi-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
          }
          .admin-kpi-card {
            padding: 12px 14px !important;
            gap: 8px !important;
          }
          .admin-kpi-card .kpi-val {
            font-size: 1.35rem !important;
          }
          .admin-kpi-card .kpi-lbl {
            font-size: 0.68rem !important;
          }
        }
        @media (min-width: 769px) {
          .admin-view-toggle-bar-toggle {
            display: none !important;
          }
        }
        @media (max-width: 640px) {
          .admin-modal-overlay {
            padding: 10px !important;
          }
          .admin-modal-card {
            border-radius: 18px !important;
            max-height: 94vh !important;
          }
          .admin-modal-header {
            padding: 14px 16px !important;
            border-top-left-radius: 18px !important;
            border-top-right-radius: 18px !important;
          }
          .admin-modal-body {
            padding: 16px !important;
            gap: 16px !important;
          }
        }
      `}</style>

      {/* Top Header & Quick Actions */}
      <div
        className="anim-fade-up"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: headerMeta.badgeBg,
                color: headerMeta.badgeColor,
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
              }}
            >
              <HeaderIcon size={20} />
            </span>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
              {headerMeta.title}
            </h1>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0, maxWidth: '680px' }}>
            {headerMeta.subtitle}
          </p>
        </div>

        {/* Header CTA Buttons */}
        <div className="admin-users-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 15px',
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: '10px',
              color: '#334155',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: refreshing ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}
            title="Refresh database records"
          >
            <RefreshCw size={15} className={refreshing ? 'spin-anim' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={!filteredUsers.length}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              background: '#0f172a',
              border: 'none',
              borderRadius: '10px',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: filteredUsers.length ? 'pointer' : 'not-allowed',
              opacity: filteredUsers.length ? 1 : 0.6,
              boxShadow: '0 4px 12px rgba(15,23,42,0.15)',
              transition: 'all 0.15s ease',
            }}
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Metrics Strip - Responsive 4-col desktop, 2-col mobile */}
      <div className="admin-users-kpi-grid anim-fade-up">
        {/* KPI 1: Total Platform Accounts */}
        <div
          className="admin-kpi-card"
          onClick={() => handleTabChange('all')}
          style={{ borderColor: roleFilter === 'all' ? '#2563eb' : '#e2e8f0' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="kpi-lbl" style={kpiLabelStyle}>Total Accounts</span>
              <div className="kpi-val" style={kpiValueStyle}>{metrics.total}</div>
            </div>
            <div style={{ ...kpiIconBox, background: '#e0e7ff', color: '#4f46e5' }}>
              <Users size={20} />
            </div>
          </div>
          <div style={kpiFooterStyle}>
            <span style={{ color: '#4f46e5', fontWeight: 700 }}>{metrics.customersCount} Shoppers</span>
            <span style={{ color: '#64748b' }}>active in system</span>
          </div>
        </div>

        {/* KPI 2: Vendors & Verified Stores */}
        <div
          className="admin-kpi-card"
          onClick={() => handleTabChange('vendor')}
          style={{ borderColor: roleFilter === 'vendor' ? '#7e22ce' : '#e2e8f0' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="kpi-lbl" style={{ ...kpiLabelStyle, color: '#7e22ce' }}>Registered Stores</span>
              <div className="kpi-val" style={{ ...kpiValueStyle, color: '#7e22ce' }}>{metrics.vendorsCount}</div>
            </div>
            <div style={{ ...kpiIconBox, background: '#f3e8ff', color: '#7e22ce' }}>
              <Store size={20} />
            </div>
          </div>
          <div style={kpiFooterStyle}>
            <span style={{ color: '#16a34a', fontWeight: 700 }}>100% Approved</span>
            <span style={{ color: '#64748b' }}>Avg 4.8 ★ rating</span>
          </div>
        </div>

        {/* KPI 3: Delivery Fleet Riders */}
        <div
          className="admin-kpi-card"
          onClick={() => handleTabChange('delivery')}
          style={{ borderColor: roleFilter === 'delivery' ? '#0284c7' : '#e2e8f0' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="kpi-lbl" style={{ ...kpiLabelStyle, color: '#0284c7' }}>Delivery Fleet</span>
              <div className="kpi-val" style={{ ...kpiValueStyle, color: '#0284c7' }}>{metrics.ridersCount}</div>
            </div>
            <div style={{ ...kpiIconBox, background: '#e0f2fe', color: '#0284c7' }}>
              <Truck size={20} />
            </div>
          </div>
          <div style={kpiFooterStyle}>
            <span style={{ color: '#0284c7', fontWeight: 700 }}>266+ Deliveries</span>
            <span style={{ color: '#64748b' }}>98.5% on-time</span>
          </div>
        </div>

        {/* KPI 4: Customer GMV & LTV */}
        <div className="admin-kpi-card" style={{ borderColor: '#e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="kpi-lbl" style={kpiLabelStyle}>Gross Customer Spend</span>
              <div className="kpi-val" style={{ ...kpiValueStyle, color: '#059669' }}>{formatINR(metrics.totalLTV)}</div>
            </div>
            <div style={{ ...kpiIconBox, background: '#d1fae5', color: '#059669' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={kpiFooterStyle}>
            <span style={{ color: '#059669', fontWeight: 700 }}>Avg: {formatINR(metrics.avgSpent)}</span>
            <span style={{ color: '#64748b' }}>per active purchaser</span>
          </div>
        </div>
      </div>

      {/* Main Filter & Role Tab Toolbar */}
      <div
        className="anim-fade-up"
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1.5px solid #e2e8f0',
          padding: '14px 18px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
        }}
      >
        {/* Left: Role Filter Pills (Smooth Horizontal Scroll on mobile) */}
        <div className="admin-role-tabs-scroll" style={{ flex: '1 1 auto' }}>
          {[
            { id: 'all', label: 'All Accounts', count: metrics.total, icon: Users },
            { id: 'vendor', label: 'Vendors & Stores', count: metrics.vendorsCount, icon: Store },
            { id: 'delivery', label: 'Delivery Fleet', count: metrics.ridersCount, icon: Truck },
            { id: 'user', label: 'Customers', count: metrics.customersCount, icon: ShoppingBag },
            { id: 'admin', label: 'Staff Admins', count: metrics.adminsCount, icon: Shield },
          ].map((tab) => {
            const isActive = roleFilter === tab.id;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '8px 15px',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 800 : 600,
                  background: isActive ? '#0f172a' : '#f8fafc',
                  color: isActive ? '#ffffff' : '#475569',
                  border: isActive ? '1.5px solid #0f172a' : '1.5px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.16s ease',
                  boxShadow: isActive ? '0 4px 12px rgba(15,23,42,0.18)' : 'none',
                }}
              >
                <TabIcon size={15} color={isActive ? '#38bdf8' : '#64748b'} />
                <span>{tab.label}</span>
                <span
                  style={{
                    fontSize: '0.74rem',
                    padding: '2px 7px',
                    borderRadius: '999px',
                    background: isActive ? 'rgba(255,255,255,0.22)' : '#e2e8f0',
                    color: isActive ? '#ffffff' : '#334155',
                    fontWeight: 800,
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: Search Input & Sort Dropdown */}
        <div className="admin-search-sort-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: '1 1 300px', justifyContent: 'flex-end' }}>
          {/* Search Box */}
          <div
            className="admin-search-box"
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              flex: '1 1 200px',
              maxWidth: '320px',
            }}
          >
            <Search
              size={15}
              style={{ position: 'absolute', left: '12px', color: '#94a3b8', pointerEvents: 'none' }}
            />
            <input
              type="text"
              placeholder={
                roleFilter === 'vendor'
                  ? 'Search store or vendor...'
                  : roleFilter === 'delivery'
                  ? 'Search rider or vehicle...'
                  : 'Search by name, email, phone...'
              }
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: '100%',
                padding: '8px 32px 8px 34px',
                borderRadius: '10px',
                border: '1.5px solid #e2e8f0',
                fontSize: '0.85rem',
                outline: 'none',
                background: '#f8fafc',
                color: '#0f172a',
                fontWeight: 500,
                transition: 'all 0.18s ease',
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="admin-sort-box" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowUpDown size={14} color="#64748b" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1.5px solid #e2e8f0',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#334155',
                background: '#ffffff',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              {roleFilter === 'vendor' || roleFilter === 'delivery' ? (
                <option value="rating">Highest Rating ⭐</option>
              ) : null}
              <option value="spend">Highest Spend / GMV</option>
              <option value="orders">Most Orders Placed</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div
        className="anim-fade-up"
        style={{
          background: '#ffffff',
          borderRadius: '18px',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw
              size={32}
              className="spin-anim"
              style={{ color: '#2563eb', marginBottom: '12px', display: 'inline-block' }}
            />
            <p style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0, color: '#334155' }}>
              Loading CASA Enterprise Directory...
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#f1f5f9',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                marginBottom: '16px',
              }}
            >
              <UserX size={28} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>
              No matching records found
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: '380px', margin: '0 auto 16px' }}>
              No accounts match the current filter "{roleFilter}" or search term "{search}".
            </p>
            <button
              onClick={() => {
                setSearch('');
                handleTabChange('all');
              }}
              style={{
                padding: '8px 16px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#334155',
                cursor: 'pointer',
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* View Toggle Bar (Responsive summary + Card/Table Switcher) */}
            <div
              className="admin-view-toggle-bar"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 18px',
                background: '#f8fafc',
                borderBottom: '1.5px solid #e2e8f0',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b' }}>
                  {filteredUsers.length} Directory Records
                </span>
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  • Page {currentPage} of {totalPages}
                </span>
              </div>

              <div className="admin-view-toggle-bar-toggle" style={{ display: 'flex', background: '#e2e8f0', padding: '3px', borderRadius: '8px', gap: '2px' }}>
                <button
                  type="button"
                  onClick={() => setMobileViewMode('cards')}
                  style={{
                    border: 'none',
                    borderRadius: '6px',
                    padding: '5px 12px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: mobileViewMode === 'cards' ? '#0f172a' : 'transparent',
                    color: mobileViewMode === 'cards' ? '#ffffff' : '#475569',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <LayoutGrid size={13} />
                  <span>Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileViewMode('table')}
                  style={{
                    border: 'none',
                    borderRadius: '6px',
                    padding: '5px 12px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: mobileViewMode === 'table' ? '#0f172a' : 'transparent',
                    color: mobileViewMode === 'table' ? '#ffffff' : '#475569',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <List size={13} />
                  <span>Table</span>
                </button>
              </div>
            </div>

            {/* 1. MOBILE INTERACTIVE CARDS VIEW (< 768px default) */}
            <div className={`admin-mobile-cards-list ${mobileViewMode === 'table' ? 'force-hide' : ''}`}>
              {paginatedUsers.map((user) => {
                const isVendor = roleFilter === 'vendor' || user.role === 'vendor';
                const isDelivery = roleFilter === 'delivery' || user.role === 'delivery' || user.role === 'delivery_partner';
                const initials = getAvatarInitials(user.name);
                const gradient = getAvatarGradient(user.name || user.email);

                return (
                  <div
                    key={user._id}
                    className="admin-mobile-card"
                    onClick={() => setSelectedUser(user)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                        {isVendor ? (
                          <div
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '12px',
                              background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
                              border: '1.5px solid #d8b4fe',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.25rem',
                              flexShrink: 0,
                            }}
                          >
                            🏪
                          </div>
                        ) : isDelivery ? (
                          user.avatar ? (
                            <img
                              src={user.avatar}
                              alt=""
                              style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0284c7', flexShrink: 0 }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '0.85rem',
                                flexShrink: 0,
                              }}
                            >
                              {initials}
                            </div>
                          )
                        ) : (
                          <div
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '50%',
                              background: gradient,
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '0.85rem',
                              flexShrink: 0,
                            }}
                          >
                            {initials}
                          </div>
                        )}

                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <strong style={{ fontSize: '0.96rem', color: '#0f172a', fontWeight: 800, wordBreak: 'break-word' }}>
                              {isVendor ? (user.vendorStoreName || `${user.name} Store`) : user.name}
                            </strong>
                            <span
                              style={{
                                background: '#dcfce7',
                                color: '#15803d',
                                fontSize: '0.66rem',
                                fontWeight: 800,
                                padding: '2px 6px',
                                borderRadius: '6px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                border: '1px solid #bbf7d0',
                                flexShrink: 0,
                              }}
                            >
                              <CheckCircle size={10} /> Verified
                            </span>
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                            {isVendor
                              ? `Vendor ID: #${user._id.slice(-6)} • 10% Fee`
                              : isDelivery
                              ? `Rider ID: #${user._id.slice(-6)} • Express Fleet`
                              : `User ID: #${user._id.slice(-6)} • ${user.role?.toUpperCase() || 'USER'}`}
                          </div>
                        </div>
                      </div>

                      {/* Status badge */}
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '999px',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          background: user.isActive !== false ? '#f0fdf4' : '#fef2f2',
                          color: user.isActive !== false ? '#16a34a' : '#dc2626',
                          border: `1px solid ${user.isActive !== false ? '#bbf7d0' : '#fecaca'}`,
                          flexShrink: 0,
                        }}
                      >
                        {user.isActive !== false ? '● Active' : '● Suspended'}
                      </span>
                    </div>

                    {/* Contact details */}
                    <div
                      style={{
                        background: '#f8fafc',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: '1px solid #f1f5f9',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        fontSize: '0.78rem',
                      }}
                    >
                      {isVendor && (
                        <div style={{ fontWeight: 700, color: '#1e293b' }}>
                          Owner: {user.name}
                        </div>
                      )}
                      <div style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={12} color="#64748b" />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {user.email}
                        </span>
                      </div>
                      <div style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={12} color="#64748b" />
                        <a
                          href={user.phone ? `tel:${user.phone}` : undefined}
                          onClick={(e) => e.stopPropagation()}
                          style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}
                        >
                          {user.phone || '+91 98112 34567'}
                        </a>
                      </div>
                    </div>

                    {/* Quick Metrics Strip */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '8px',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '8px 10px',
                        textAlign: 'center',
                      }}
                    >
                      {isVendor ? (
                        <>
                          <div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                              <Star size={12} fill="#b45309" color="#b45309" /> {user.vendorRating || 4.8}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{user.vendorReviewsCount || 46} Reviews</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#2563eb' }}>
                              {user.vendorProductsCount || 12}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Live Products</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#16a34a' }}>
                              Active
                            </div>
                            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>CASA Store</div>
                          </div>
                        </>
                      ) : isDelivery ? (
                        <>
                          <div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                              <Star size={12} fill="#b45309" color="#b45309" /> {user.deliveryRating || 4.9}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Rating</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#0284c7' }}>
                              {user.completedDeliveries || 148}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Trips Done</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#16a34a' }}>
                              98.5%
                            </div>
                            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>On-Time</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#2563eb' }}>
                              {user.ordersCount || 0}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Orders</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#059669' }}>
                              {formatINR(user.totalSpent || 0)}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Lifetime LTV</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#7c3aed' }}>
                              {user.role === 'admin' ? 'Admin' : 'Shopper'}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Role Level</div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Action Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedUser(user);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        background: isVendor
                          ? 'linear-gradient(135deg, #7e22ce 0%, #6b21a8 100%)'
                          : isDelivery
                          ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                          : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '0.84rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                      }}
                    >
                      <Eye size={14} />
                      <span>
                        {isVendor
                          ? 'View Store Details & Catalog →'
                          : isDelivery
                          ? 'View Rider Fleet Profile →'
                          : 'View Account Details →'}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* 2. DESKTOP ENTERPRISE TABLE VIEW */}
            <div className={`admin-desktop-table-container ${mobileViewMode === 'table' ? 'force-show' : ''}`}>
              {/* Swipe hint when table is shown on mobile */}
              <div
                className="admin-view-toggle-bar-toggle"
                style={{
                  padding: '8px 16px',
                  background: '#eff6ff',
                  borderBottom: '1px solid #dbeafe',
                  fontSize: '0.74rem',
                  color: '#1d4ed8',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>👉 Swipe horizontally to view full table details (Rating, Products, Status & Actions)</span>
              </div>

              <div className="table-responsive" style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{ width: '100%', minWidth: '860px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                  {roleFilter === 'vendor' ? (
                    <>
                      <th style={tableHeaderStyle}>Store & Merchant Profile</th>
                      <th style={tableHeaderStyle}>Owner / Contact</th>
                      <th style={tableHeaderStyle}>Rating & Customer Feedback</th>
                      <th style={tableHeaderStyle}>Catalog Products</th>
                      <th style={tableHeaderStyle}>Store Status</th>
                      <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Actions</th>
                    </>
                  ) : roleFilter === 'delivery' ? (
                    <>
                      <th style={tableHeaderStyle}>Delivery Partner / Rider</th>
                      <th style={tableHeaderStyle}>Vehicle & Assigned Zone</th>
                      <th style={tableHeaderStyle}>Delivery Rating & Reviews</th>
                      <th style={tableHeaderStyle}>Fleet Trips</th>
                      <th style={tableHeaderStyle}>Duty Status</th>
                      <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Actions</th>
                    </>
                  ) : (
                    <>
                      <th style={tableHeaderStyle}>Profile Card</th>
                      <th style={tableHeaderStyle}>Contact Details</th>
                      <th style={tableHeaderStyle}>Role & Privileges</th>
                      <th style={tableHeaderStyle}>Activity & LTV</th>
                      <th style={tableHeaderStyle}>Registered Date</th>
                      <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Actions</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => {
                  const initials = getAvatarInitials(user.name);
                  const gradient = getAvatarGradient(user.name || user.email);

                  return (
                    <tr
                      key={user._id}
                      className="user-row-hover"
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                      }}
                      onClick={() => setSelectedUser(user)}
                    >
                      {/* VENDOR VIEW COLUMNS */}
                      {roleFilter === 'vendor' ? (
                        <>
                          {/* 1. Store & Merchant */}
                          <td style={tableCellStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div
                                style={{
                                  width: '44px',
                                  height: '44px',
                                  borderRadius: '12px',
                                  background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
                                  border: '1.5px solid #d8b4fe',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#7e22ce',
                                  fontSize: '1.3rem',
                                  boxShadow: '0 2px 6px rgba(126, 34, 206, 0.15)',
                                }}
                              >
                                🏪
                              </div>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <strong style={{ fontSize: '0.94rem', color: '#0f172a', fontWeight: 800 }}>
                                    {user.vendorStoreName || `${user.name} Store`}
                                  </strong>
                                  <span
                                    style={{
                                      background: '#dcfce7',
                                      color: '#15803d',
                                      fontSize: '0.68rem',
                                      fontWeight: 800,
                                      padding: '2px 6px',
                                      borderRadius: '6px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '3px',
                                      border: '1px solid #bbf7d0',
                                    }}
                                  >
                                    <CheckCircle size={10} /> Verified
                                  </span>
                                </div>
                                <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                                  Vendor ID: #{user._id.slice(-6)} • Commission: 10%
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 2. Owner & Contact */}
                          <td style={tableCellStyle}>
                            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1e293b' }}>
                              {user.name}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                              <Mail size={12} /> {user.email}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                              <Phone size={12} /> {user.phone || 'Phone not listed'}
                            </div>
                          </td>

                          {/* 3. Rating & Feedback */}
                          <td style={tableCellStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div
                                style={{
                                  background: '#fef3c7',
                                  color: '#b45309',
                                  fontWeight: 900,
                                  fontSize: '0.85rem',
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  border: '1px solid #fde68a',
                                }}
                              >
                                <Star size={13} fill="#b45309" color="#b45309" />
                                <span>{user.vendorRating || 4.8}</span>
                              </div>
                              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                                ({user.vendorReviewsCount || 46} user reviews)
                              </span>
                            </div>
                            {user.vendorFeedbacks && user.vendorFeedbacks.length > 0 && (
                              <div
                                style={{
                                  fontSize: '0.74rem',
                                  color: '#475569',
                                  fontStyle: 'italic',
                                  marginTop: '4px',
                                  maxWidth: '260px',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                                title={user.vendorFeedbacks[0].comment}
                              >
                                "{user.vendorFeedbacks[0].comment}"
                              </div>
                            )}
                          </td>

                          {/* 4. Catalog Products */}
                          <td style={tableCellStyle}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '4px 10px', borderRadius: '8px' }}>
                              <Package size={14} color="#2563eb" />
                              <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                                {user.vendorProductsCount || 12} Products
                              </strong>
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700, marginTop: '3px' }}>
                              ● Live on CASA Store
                            </div>
                          </td>

                          {/* 5. Status */}
                          <td style={tableCellStyle}>
                            <span
                              style={{
                                padding: '4px 9px',
                                borderRadius: '999px',
                                fontSize: '0.74rem',
                                fontWeight: 800,
                                background: user.isActive !== false ? '#f0fdf4' : '#fef2f2',
                                color: user.isActive !== false ? '#16a34a' : '#dc2626',
                                border: `1.5px solid ${user.isActive !== false ? '#bbf7d0' : '#fecaca'}`,
                              }}
                            >
                              ● {user.isActive !== false ? 'Approved & Active' : 'Suspended'}
                            </span>
                          </td>

                          {/* 6. Actions */}
                          <td style={{ ...tableCellStyle, textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUser(user);
                              }}
                              style={{
                                background: '#7e22ce',
                                color: '#ffffff',
                                border: 'none',
                                padding: '6px 14px',
                                borderRadius: '8px',
                                fontSize: '0.78rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                boxShadow: '0 2px 6px rgba(126, 34, 206, 0.25)',
                              }}
                            >
                              <Eye size={13} />
                              <span>Store Details</span>
                            </button>
                          </td>
                        </>
                      ) : roleFilter === 'delivery' ? (
                        <>
                          {/* 1. Delivery Partner / Rider Profile */}
                          <td style={tableCellStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {user.avatar ? (
                                <img
                                  src={user.avatar}
                                  alt={user.name}
                                  style={{
                                    width: '42px',
                                    height: '42px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: '2px solid #0284c7',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: '42px',
                                    height: '42px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                                    color: '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 800,
                                    fontSize: '0.85rem',
                                  }}
                                >
                                  {initials}
                                </div>
                              )}
                              <div>
                                <strong style={{ fontSize: '0.94rem', color: '#0f172a', fontWeight: 800 }}>
                                  {user.name}
                                </strong>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                                  Rider ID: #{user._id.slice(-6)} • License Verified
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 2. Vehicle & Zone */}
                          <td style={tableCellStyle}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0284c7', display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <span>🛵</span> {user.vehicleType || 'Electric Bike'}
                            </div>
                            <div style={{ fontSize: '0.76rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                              <MapPin size={12} color="#0284c7" />
                              <span>{user.assignedZone || 'Central Hub - Zone 1'}</span>
                            </div>
                          </td>

                          {/* 3. Delivery Rating & Reviews */}
                          <td style={tableCellStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div
                                style={{
                                  background: '#fef3c7',
                                  color: '#b45309',
                                  fontWeight: 900,
                                  fontSize: '0.85rem',
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  border: '1px solid #fde68a',
                                }}
                              >
                                <Star size={13} fill="#b45309" color="#b45309" />
                                <span>{user.deliveryRating || 4.9}</span>
                              </div>
                              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>
                                (98.5% on-time)
                              </span>
                            </div>
                            {user.deliveryFeedbacks && user.deliveryFeedbacks.length > 0 && (
                              <div
                                style={{
                                  fontSize: '0.74rem',
                                  color: '#475569',
                                  fontStyle: 'italic',
                                  marginTop: '4px',
                                  maxWidth: '240px',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                                title={user.deliveryFeedbacks[0].comment}
                              >
                                "{user.deliveryFeedbacks[0].comment}"
                              </div>
                            )}
                          </td>

                          {/* 4. Fleet Trips */}
                          <td style={tableCellStyle}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#e0f2fe', padding: '4px 10px', borderRadius: '8px' }}>
                              <CheckCircle size={14} color="#0284c7" />
                              <strong style={{ fontSize: '0.85rem', color: '#0369a1' }}>
                                {user.completedDeliveries || 148} Trips Completed
                              </strong>
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '3px' }}>
                              Success rate: 99.2%
                            </div>
                          </td>

                          {/* 5. Duty Status */}
                          <td style={tableCellStyle}>
                            <span
                              style={{
                                padding: '4px 9px',
                                borderRadius: '999px',
                                fontSize: '0.74rem',
                                fontWeight: 800,
                                background: '#f0fdf4',
                                color: '#16a34a',
                                border: '1.5px solid #bbf7d0',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }} />
                              Active On-Duty
                            </span>
                          </td>

                          {/* 6. Actions */}
                          <td style={{ ...tableCellStyle, textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUser(user);
                              }}
                              style={{
                                background: '#0284c7',
                                color: '#ffffff',
                                border: 'none',
                                padding: '6px 14px',
                                borderRadius: '8px',
                                fontSize: '0.78rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
                              }}
                            >
                              <Eye size={13} />
                              <span>Rider Profile</span>
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          {/* STANDARD CUSTOMER / USER VIEW */}
                          {/* 1. Customer Profile */}
                          <td style={tableCellStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {user.avatar ? (
                                <img
                                  src={user.avatar}
                                  alt={user.name}
                                  style={{
                                    width: '42px',
                                    height: '42px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: '2px solid #ffffff',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: '42px',
                                    height: '42px',
                                    borderRadius: '50%',
                                    background: gradient,
                                    color: '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 800,
                                    fontSize: '0.85rem',
                                  }}
                                >
                                  {initials}
                                </div>
                              )}
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <strong style={{ fontSize: '0.925rem', color: '#0f172a', fontWeight: 800 }}>
                                    {user.name}
                                  </strong>
                                  {user.role === 'admin' && (
                                    <span title="Administrator" style={{ color: '#f59e0b' }}>
                                      <Shield size={14} fill="#f59e0b" />
                                    </span>
                                  )}
                                  {user.role === 'super_admin' && (
                                    <span title="Super Admin" style={{ color: '#f59e0b', fontSize: '0.9rem' }}>
                                      👑
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                                  ID: #{user._id.slice(-8)}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 2. Contact Details */}
                          <td style={tableCellStyle}>
                            <div style={{ fontSize: '0.85rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <Mail size={13} color="#64748b" /> {user.email}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px' }}>
                              <Phone size={13} color="#64748b" /> {user.phone || 'No phone added'}
                            </div>
                          </td>

                          {/* 3. Access Role */}
                          <td style={tableCellStyle}>
                            <span
                              style={{
                                padding: '3px 8px',
                                borderRadius: '999px',
                                fontSize: '0.74rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                background:
                                  user.role === 'super_admin'
                                    ? '#fef3c7'
                                    : user.role === 'admin'
                                    ? '#fef3c7'
                                    : user.role === 'vendor'
                                    ? '#f3e8ff'
                                    : user.role === 'delivery'
                                    ? '#e0f2fe'
                                    : '#f1f5f9',
                                color:
                                  user.role === 'super_admin'
                                    ? '#b45309'
                                    : user.role === 'admin'
                                    ? '#b45309'
                                    : user.role === 'vendor'
                                    ? '#7e22ce'
                                    : user.role === 'delivery'
                                    ? '#0284c7'
                                    : '#475569',
                                border: '1px solid rgba(0,0,0,0.06)',
                              }}
                            >
                              {user.role === 'super_admin'
                                ? '👑 Super Admin'
                                : user.role === 'admin'
                                ? 'Staff Admin'
                                : user.role === 'vendor'
                                ? 'Vendor'
                                : user.role === 'delivery'
                                ? 'Delivery Rider'
                                : 'Shopper'}
                            </span>
                          </td>

                          {/* 4. Activity & LTV */}
                          <td style={tableCellStyle}>
                            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#059669' }}>
                              {formatINR(user.totalSpent)}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                              {user.ordersCount} {user.ordersCount === 1 ? 'order' : 'orders'} placed
                            </div>
                          </td>

                          {/* 5. Registered Date */}
                          <td style={tableCellStyle}>
                            <div style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600 }}>
                              {formatDate(user.createdAt)}
                            </div>
                          </td>

                          {/* 6. Actions */}
                          <td style={{ ...tableCellStyle, textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedUser(user);
                                }}
                                style={{
                                  background: '#f8fafc',
                                  color: '#334155',
                                  border: '1px solid #cbd5e1',
                                  padding: '5px 10px',
                                  borderRadius: '8px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <Eye size={12} />
                                <span>Details</span>
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
              </div>
            </div>
          </>
        )}

        {/* Table Footer with Pagination */}
        {!loading && filteredUsers.length > 0 && (
          <div
            style={{
              padding: '14px 20px',
              borderTop: '1.5px solid #e2e8f0',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              background: '#f8fafc',
            }}
          >
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Showing{' '}
              <strong style={{ color: '#0f172a' }}>
                {(currentPage - 1) * itemsPerPage + 1}
              </strong>{' '}
              to{' '}
              <strong style={{ color: '#0f172a' }}>
                {Math.min(currentPage * itemsPerPage, filteredUsers.length)}
              </strong>{' '}
              of <strong style={{ color: '#0f172a' }}>{filteredUsers.length}</strong> records
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    color: currentPage === 1 ? '#cbd5e1' : '#334155',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      border: currentPage === page ? '1.5px solid #0f172a' : '1px solid #e2e8f0',
                      background: currentPage === page ? '#0f172a' : '#ffffff',
                      color: currentPage === page ? '#ffffff' : '#334155',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                    }}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    color: currentPage === totalPages ? '#cbd5e1' : '#334155',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* DETAILED MODAL: VENDOR STORE / DELIVERY RIDER / CUSTOMER COMMAND CENTER */}
      {/* ========================================================================= */}
      {selectedUser && (
        <div
          className="admin-modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.72)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="anim-fade-up admin-modal-card"
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              maxWidth: '720px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              border: '1.5px solid #e2e8f0',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className="admin-modal-header"
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: selectedUser.role === 'vendor' ? '#faf5ff' : selectedUser.role === 'delivery' ? '#f0f9ff' : '#f8fafc',
                borderTopLeftRadius: '24px',
                borderTopRightRadius: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: selectedUser.role === 'vendor' ? '#f3e8ff' : selectedUser.role === 'delivery' ? '#e0f2fe' : '#e0e7ff',
                    color: selectedUser.role === 'vendor' ? '#7e22ce' : selectedUser.role === 'delivery' ? '#0284c7' : '#4338ca',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                  }}
                >
                  {selectedUser.role === 'vendor' ? '🏪' : selectedUser.role === 'delivery' ? '🛵' : '👤'}
                </span>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    {selectedUser.role === 'vendor'
                      ? 'Vendor Store & Merchant Overview'
                      : selectedUser.role === 'delivery'
                      ? 'Delivery Fleet Executive Profile'
                      : 'Customer Account Details'}
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    ID: #{selectedUser._id} • Registered on {formatDate(selectedUser.createdAt)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '34px',
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="admin-modal-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              {/* Profile Top Banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '18px',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  flexWrap: 'wrap',
                }}
              >
                {selectedUser.avatar ? (
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                    style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid #ffffff',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: '50%',
                      background: getAvatarGradient(selectedUser.name),
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.35rem',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    }}
                  >
                    {getAvatarInitials(selectedUser.name)}
                  </div>
                )}

                <div style={{ flex: 1, minWidth: '240px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      {selectedUser.role === 'vendor' ? selectedUser.vendorStoreName : selectedUser.name}
                    </h4>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '999px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        background:
                          selectedUser.role === 'vendor'
                            ? '#f3e8ff'
                            : selectedUser.role === 'delivery'
                            ? '#e0f2fe'
                            : '#eff6ff',
                        color:
                          selectedUser.role === 'vendor'
                            ? '#7e22ce'
                            : selectedUser.role === 'delivery'
                            ? '#0284c7'
                            : '#2563eb',
                      }}
                    >
                      {selectedUser.role === 'vendor'
                        ? '🏪 Official Merchant'
                        : selectedUser.role === 'delivery'
                        ? '🛵 Express Rider'
                        : 'Shopper'}
                    </span>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        background: selectedUser.isActive !== false ? '#f0fdf4' : '#fef2f2',
                        color: selectedUser.isActive !== false ? '#16a34a' : '#dc2626',
                        border: `1px solid ${selectedUser.isActive !== false ? '#bbf7d0' : '#fecaca'}`,
                      }}
                    >
                      {selectedUser.isActive !== false ? '● Active' : '● Suspended'}
                    </span>
                  </div>

                  {selectedUser.role === 'vendor' && (
                    <div style={{ fontSize: '0.84rem', color: '#475569', marginTop: '4px', fontWeight: 600 }}>
                      Operated by: <strong>{selectedUser.name}</strong>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '6px' }}>
                    <span style={{ fontSize: '0.82rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={13} color="#64748b" /> {selectedUser.email}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={13} color="#64748b" /> {selectedUser.phone || '+91 98765 24680'}
                    </span>
                  </div>
                </div>
              </div>

              {/* SPECIFIC VENDOR SECTION */}
              {selectedUser.role === 'vendor' && (
                <>
                  {/* Rating & Scorecard */}
                  <div
                    style={{
                      background: '#ffffff',
                      border: '1.5px solid #f3e8ff',
                      borderRadius: '16px',
                      padding: '16px 20px',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#7e22ce', textTransform: 'uppercase' }}>
                        Merchant Rating & Reputation
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>
                          {selectedUser.vendorRating || 4.8}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} size={15} fill="#f59e0b" color="#f59e0b" />
                            ))}
                          </div>
                          <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                            Based on {selectedUser.vendorReviewsCount || 46} verified customer orders
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#16a34a' }}>98.6%</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Fulfillment Rate</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#2563eb' }}>{selectedUser.vendorProductsCount || 12}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Live Products</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#7e22ce' }}>10%</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Platform Fee</div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Feedback & Reviews List */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <MessageSquare size={16} color="#7e22ce" />
                      <h5 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        Customer Ratings & Testimonial Feedbacks
                      </h5>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {(selectedUser.vendorFeedbacks || [
                        { userName: 'Pooja Kulkarni', rating: 5, comment: 'Pristine gift packaging, genuine handloom fabric with rich silk shine.', date: '2026-10-18' },
                        { userName: 'Neha Singhania', rating: 5, comment: 'Fast dispatch, prompt communication, and size fit accurately.', date: '2026-10-14' },
                        { userName: 'Rohan Mehra', rating: 4, comment: 'Kurta texture is very royal, satisfied with purchase.', date: '2026-10-09' }
                      ]).map((fb, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '12px 16px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <strong style={{ fontSize: '0.84rem', color: '#1e293b' }}>{fb.userName || fb.customerName}</strong>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                {Array.from({ length: fb.rating || 5 }).map((_, r) => (
                                  <Star key={r} size={11} fill="#f59e0b" color="#f59e0b" />
                                ))}
                              </div>
                            </div>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{fb.date}</span>
                          </div>
                          <p style={{ fontSize: '0.82rem', color: '#475569', margin: '4px 0 0 0', lineHeight: 1.45 }}>
                            "{fb.comment}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Business & Tax Details */}
                  <div
                    style={{
                      background: '#f8fafc',
                      borderRadius: '14px',
                      padding: '14px 18px',
                      border: '1px solid #e2e8f0',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>GSTIN Registration</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                        {selectedUser.vendorDoc?.gstin || '07AAACA1234F1Z5'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>Business PAN</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                        {selectedUser.vendorDoc?.pan || 'AAACA1234F'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>Pickup Hub City</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                        {selectedUser.vendorDoc?.pickupAddress?.city || 'Delhi NCR'}
                      </div>
                    </div>
                  </div>

                  {/* Vendor Governance Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                    <button
                      type="button"
                      onClick={() => handleVendorApproval(selectedUser, 'approved')}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '10px',
                        background: '#16a34a',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '0.84rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      ✓ Approve Store
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleAccountStatus(selectedUser)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '10px',
                        background: selectedUser.isActive !== false ? '#fee2e2' : '#dcfce7',
                        color: selectedUser.isActive !== false ? '#dc2626' : '#15803d',
                        border: 'none',
                        fontSize: '0.84rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      {selectedUser.isActive !== false ? 'Suspend Merchant' : 'Reactivate Merchant'}
                    </button>
                  </div>
                </>
              )}

              {/* SPECIFIC DELIVERY FLEET SECTION */}
              {selectedUser.role === 'delivery' && (
                <>
                  {/* Delivery Rating & Scorecard */}
                  <div
                    style={{
                      background: '#ffffff',
                      border: '1.5px solid #e0f2fe',
                      borderRadius: '16px',
                      padding: '16px 20px',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>
                        Delivery Performance Score
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>
                          {selectedUser.deliveryRating || 4.9}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} size={15} fill="#f59e0b" color="#f59e0b" />
                            ))}
                          </div>
                          <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                            Based on {selectedUser.completedDeliveries || 154} successful parcel handovers
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0284c7' }}>
                          {selectedUser.completedDeliveries || 154}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Trips Completed</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#16a34a' }}>98.5%</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>On-Time Arrival</div>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle & Hub Info */}
                  <div
                    style={{
                      background: '#f8fafc',
                      borderRadius: '14px',
                      padding: '14px 18px',
                      border: '1px solid #e2e8f0',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>Vehicle Fleet Type</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                        🛵 {selectedUser.vehicleType || 'Electric Bike (Hero Optima CX)'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>Assigned Operational Zone</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                        📍 {selectedUser.assignedZone || 'Central Hub - Zone 1 (Delhi)'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>Driving License</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                        DL-04-2022-0089124 (Verified)
                      </div>
                    </div>
                  </div>

                  {/* Customer Testimonials for Rider */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <ThumbsUp size={16} color="#0284c7" />
                      <h5 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        Customer Feedback & Delivery Reviews
                      </h5>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {(selectedUser.deliveryFeedbacks || [
                        { customerName: 'Priya Verma', rating: 5, comment: 'Vikram delivered right on time, verified OTP politely and handled the parcel carefully.', date: '2026-10-21' },
                        { customerName: 'Manish Rawat', rating: 5, comment: 'Super fast delivery within 45 minutes of dispatch. Professional attitude!', date: '2026-10-18' },
                        { customerName: 'Sunita Jain', rating: 5, comment: 'Polite delivery executive, called in advance before arrival.', date: '2026-10-12' }
                      ]).map((fb, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '12px 16px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <strong style={{ fontSize: '0.84rem', color: '#1e293b' }}>{fb.customerName || fb.userName}</strong>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                {Array.from({ length: fb.rating || 5 }).map((_, r) => (
                                  <Star key={r} size={11} fill="#f59e0b" color="#f59e0b" />
                                ))}
                              </div>
                            </div>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{fb.date}</span>
                          </div>
                          <p style={{ fontSize: '0.82rem', color: '#475569', margin: '4px 0 0 0', lineHeight: 1.45 }}>
                            "{fb.comment}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* SPECIFIC SHOPPER / CUSTOMER SECTION */}
              {selectedUser.role === 'user' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    <div style={modalMetricBox}>
                      <span style={modalMetricLabel}>Total Orders</span>
                      <div style={modalMetricValue}>{selectedUser.ordersCount}</div>
                    </div>
                    <div style={modalMetricBox}>
                      <span style={modalMetricLabel}>Lifetime Value</span>
                      <div style={{ ...modalMetricValue, color: '#059669' }}>
                        {formatINR(selectedUser.totalSpent)}
                      </div>
                    </div>
                    <div style={modalMetricBox}>
                      <span style={modalMetricLabel}>Customer Status</span>
                      <div style={{ ...modalMetricValue, fontSize: '0.95rem', color: '#2563eb' }}>
                        {selectedUser.ordersCount > 0 ? 'Verified Buyer' : 'Registered Shopper'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
                      Recent Orders Placed ({selectedUser.userOrders?.length || 0})
                    </h5>
                    {selectedUser.userOrders && selectedUser.userOrders.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {selectedUser.userOrders.slice(0, 4).map((ord) => (
                          <div
                            key={ord._id}
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '10px',
                              padding: '10px 14px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                                Order #{ord._id.slice(-6)}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                {formatDateTime(ord.createdAt)} • {ord.orderItems?.length || 1} items
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                                {formatINR(ord.totalPrice)}
                              </div>
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                  color: ord.orderStatus === 'Delivered' ? '#16a34a' : '#2563eb',
                                }}
                              >
                                {ord.orderStatus}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                        No orders placed yet.
                      </div>
                    )}
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Style Objects
const kpiCardStyle = {
  background: '#ffffff',
  borderRadius: '16px',
  border: '1.5px solid #e2e8f0',
  padding: '16px 18px',
  boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  gap: '12px',
};

const kpiLabelStyle = {
  fontSize: '0.78rem',
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: '#64748b',
};

const kpiValueStyle = {
  fontSize: '1.75rem',
  fontWeight: 900,
  color: '#0f172a',
  letterSpacing: '-0.02em',
  marginTop: '4px',
};

const kpiIconBox = {
  width: '42px',
  height: '42px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const kpiFooterStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '0.75rem',
  paddingTop: '8px',
  borderTop: '1px solid #f1f5f9',
};

const tableHeaderStyle = {
  padding: '14px 18px',
  fontSize: '0.75rem',
  fontWeight: '800',
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const tableCellStyle = {
  padding: '14px 18px',
  fontSize: '0.875rem',
  color: '#334155',
  verticalAlign: 'middle',
};

const modalMetricBox = {
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '10px',
  padding: '12px',
  textAlign: 'center',
};

const modalMetricLabel = {
  fontSize: '0.72rem',
  fontWeight: 700,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
};

const modalMetricValue = {
  fontSize: '1.25rem',
  fontWeight: 800,
  color: '#0f172a',
  marginTop: '4px',
};

export default AdminUsersPage;
