import React, { useState, useEffect, useMemo } from 'react';
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
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const AdminUsersPage = () => {
  const { success, error } = useToast();
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'user' | 'admin'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'spend' | 'orders' | 'name'
  const [selectedUser, setSelectedUser] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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
      console.error('Failed to load admin customer data:', err);
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
      // Find orders matching this user
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

      return {
        ...u,
        userOrders,
        ordersCount: userOrders.length,
        totalSpent,
        latestOrder,
      };
    });
  }, [users, orders]);

  // Aggregate KPI metrics
  const metrics = useMemo(() => {
    const total = enrichedUsers.length;
    const customers = enrichedUsers.filter((u) => u.role === 'user');
    const admins = enrichedUsers.filter((u) => u.role === 'admin');
    const buyers = customers.filter((u) => u.ordersCount > 0);
    const totalLTV = enrichedUsers.reduce((sum, u) => sum + (u.totalSpent || 0), 0);
    const avgSpent = buyers.length > 0 ? totalLTV / buyers.length : 0;

    return {
      total,
      customersCount: customers.length,
      adminsCount: admins.length,
      buyersCount: buyers.length,
      totalLTV,
      avgSpent,
      customerPct: total > 0 ? Math.round((customers.length / total) * 100) : 0,
      adminPct: total > 0 ? Math.round((admins.length / total) * 100) : 0,
    };
  }, [enrichedUsers]);

  // Filter & Sort
  const filteredUsers = useMemo(() => {
    return enrichedUsers
      .filter((u) => {
        // Role filter
        if (roleFilter !== 'all' && u.role !== roleFilter) return false;

        // Search filter (name, email, phone, _id)
        if (search.trim()) {
          const q = search.trim().toLowerCase();
          const matchName = u.name?.toLowerCase().includes(q);
          const matchEmail = u.email?.toLowerCase().includes(q);
          const matchPhone = u.phone?.toLowerCase().includes(q);
          const matchId = u._id?.toLowerCase().includes(q);
          return matchName || matchEmail || matchPhone || matchId;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
        if (sortBy === 'spend') return (b.totalSpent || 0) - (a.totalSpent || 0);
        if (sortBy === 'orders') return (b.ordersCount || 0) - (a.ordersCount || 0);
        if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
        return 0;
      });
  }, [enrichedUsers, roleFilter, search, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  // Reset to page 1 on search or filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, sortBy]);

  // Copy to clipboard helper
  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Export CSV helper
  const handleExportCSV = () => {
    if (!filteredUsers.length) return;
    const headers = ['User ID', 'Name', 'Email', 'Phone', 'Role', 'Orders Count', 'Total Spent (INR)', 'Registered Date'];
    const rows = filteredUsers.map((u) => [
      `"${u._id || ''}"`,
      `"${u.name || ''}"`,
      `"${u.email || ''}"`,
      `"${u.phone || ''}"`,
      `"${u.role || 'user'}"`,
      u.ordersCount || 0,
      u.totalSpent || 0,
      `"${u.createdAt ? new Date(u.createdAt).toISOString() : ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CASA_Customers_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper for avatar initials & color
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', paddingBottom: '40px' }}>
      {/* Top Header & Quick Actions */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#e0e7ff',
                color: '#4338ca',
              }}
            >
              <Users size={18} />
            </span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
              Customer Directory & Accounts
            </h1>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
            Manage customer accounts, verify permissions, monitor order histories, and track customer lifetime value (LTV).
          </p>
        </div>

        {/* Header CTA Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 14px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              color: '#334155',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: refreshing ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}
            title="Refresh customer list"
          >
            <RefreshCw size={15} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
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
              fontWeight: 600,
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

      {/* 4 KPI Metrics Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Metric 1: Total Registered Accounts */}
        <div style={kpiCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={kpiLabelStyle}>Total Accounts</span>
              <div style={kpiValueStyle}>{metrics.total}</div>
            </div>
            <div style={{ ...kpiIconBox, background: '#ede9fe', color: '#7c3aed' }}>
              <Users size={22} />
            </div>
          </div>
          <div style={kpiFooterStyle}>
            <span style={{ color: '#16a34a', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={13} /> Active
            </span>
            <span style={{ color: '#64748b' }}>Across all system roles</span>
          </div>
        </div>

        {/* Metric 2: Shoppers / Customers */}
        <div style={kpiCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={kpiLabelStyle}>Active Shoppers</span>
              <div style={kpiValueStyle}>{metrics.customersCount}</div>
            </div>
            <div style={{ ...kpiIconBox, background: '#e0f2fe', color: '#0284c7' }}>
              <ShoppingBag size={22} />
            </div>
          </div>
          <div style={kpiFooterStyle}>
            <span style={{ color: '#0284c7', fontWeight: 700 }}>{metrics.customerPct}% of total</span>
            <span style={{ color: '#64748b' }}>• {metrics.buyersCount} placed orders</span>
          </div>
        </div>

        {/* Metric 3: Store Administrators */}
        <div style={kpiCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={kpiLabelStyle}>Store Administrators</span>
              <div style={kpiValueStyle}>{metrics.adminsCount}</div>
            </div>
            <div style={{ ...kpiIconBox, background: '#fef3c7', color: '#d97706' }}>
              <ShieldCheck size={22} />
            </div>
          </div>
          <div style={kpiFooterStyle}>
            <span style={{ color: '#d97706', fontWeight: 700 }}>Elevated Access</span>
            <span style={{ color: '#64748b' }}>Console Management</span>
          </div>
        </div>

        {/* Metric 4: Customer Lifetime Value (LTV) */}
        <div style={kpiCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={kpiLabelStyle}>Total Customer Spend</span>
              <div style={{ ...kpiValueStyle, color: '#059669' }}>{formatINR(metrics.totalLTV)}</div>
            </div>
            <div style={{ ...kpiIconBox, background: '#d1fae5', color: '#059669' }}>
              <TrendingUp size={22} />
            </div>
          </div>
          <div style={kpiFooterStyle}>
            <span style={{ color: '#059669', fontWeight: 700 }}>Avg: {formatINR(metrics.avgSpent)}</span>
            <span style={{ color: '#64748b' }}>per active purchaser</span>
          </div>
        </div>
      </div>

      {/* Visual Role Distribution Bar */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={16} color="#6366f1" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
              Account Composition & Privilege Distribution
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8rem', color: '#64748b' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4f46e5' }} />
              Shoppers ({metrics.customerPct}%)
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
              Staff Admins ({metrics.adminPct}%)
            </span>
          </div>
        </div>

        {/* Stacked Progress Bar */}
        <div
          style={{
            height: '8px',
            borderRadius: '999px',
            background: '#f1f5f9',
            overflow: 'hidden',
            display: 'flex',
          }}
        >
          <div
            style={{
              width: `${metrics.customerPct}%`,
              background: 'linear-gradient(90deg, #6366f1, #4f46e5)',
              transition: 'width 0.4s ease',
            }}
            title={`Customers: ${metrics.customersCount}`}
          />
          <div
            style={{
              width: `${metrics.adminPct}%`,
              background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
              transition: 'width 0.4s ease',
            }}
            title={`Admins: ${metrics.adminsCount}`}
          />
        </div>
      </div>

      {/* Main Filter & Search Toolbar */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '16px 20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        {/* Left: Role Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Accounts', count: metrics.total },
            { id: 'user', label: 'Customers', count: metrics.customersCount },
            { id: 'admin', label: 'Store Admins', count: metrics.adminsCount },
          ].map((tab) => {
            const isActive = roleFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setRoleFilter(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 14px',
                  borderRadius: '999px',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 700 : 500,
                  background: isActive ? '#0f172a' : '#f8fafc',
                  color: isActive ? '#ffffff' : '#64748b',
                  border: isActive ? '1px solid #0f172a' : '1px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    padding: '1px 6px',
                    borderRadius: '999px',
                    background: isActive ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                    color: isActive ? '#ffffff' : '#475569',
                    fontWeight: 700,
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: Search Input & Sort Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: '1 1 320px', justifyContent: 'flex-end' }}>
          {/* Search Box */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              flex: '1 1 220px',
              maxWidth: '340px',
            }}
          >
            <Search
              size={16}
              style={{ position: 'absolute', left: '12px', color: '#94a3b8', pointerEvents: 'none' }}
            />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 34px 9px 36px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
                outline: 'none',
                color: '#0f172a',
                background: '#f8fafc',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
              onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
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
                  padding: '2px',
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowUpDown size={15} color="#64748b" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '9px 12px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#334155',
                background: '#ffffff',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="newest">Joined: Newest First</option>
              <option value="oldest">Joined: Oldest First</option>
              <option value="spend">Highest Lifetime Spend</option>
              <option value="orders">Most Orders Placed</option>
              <option value="name">Name (A to Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw
              size={32}
              style={{
                animation: 'spin 1s linear infinite',
                color: '#6366f1',
                marginBottom: '12px',
                display: 'inline-block',
              }}
            />
            <p style={{ fontWeight: 600, fontSize: '0.95rem', margin: 0 }}>Loading customer database...</p>
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
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
              No matching accounts found
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', maxWidth: '380px', margin: '0 auto 16px' }}>
              We couldn't find any users matching your search "{search}" or current role filter.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setRoleFilter('all');
              }}
              style={{
                padding: '8px 16px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer',
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="table-responsive" style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', minWidth: '780px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={tableHeaderStyle}>Customer Profile</th>
                  <th style={tableHeaderStyle}>Contact Details</th>
                  <th style={tableHeaderStyle}>Access Role</th>
                  <th style={tableHeaderStyle}>Activity & LTV</th>
                  <th style={tableHeaderStyle}>Registered Date</th>
                  <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => {
                  const isAdmin = user.role === 'admin';
                  const isVerifiedBuyer = user.ordersCount > 0;
                  const initials = getAvatarInitials(user.name);
                  const gradient = getAvatarGradient(user.name || user.email);

                  return (
                    <tr
                      key={user._id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Column 1: Customer Profile */}
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
                              onError={(e) => {
                                // fallback to initials if avatar URL fails
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '50%',
                              background: gradient,
                              color: '#ffffff',
                              display: user.avatar ? 'none' : 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              letterSpacing: '0.05em',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                            }}
                          >
                            {initials}
                          </div>

                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <strong style={{ fontSize: '0.925rem', color: '#0f172a', fontWeight: 700 }}>
                                {user.name}
                              </strong>
                              {isAdmin && (
                                <span
                                  title="Store Administrator"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    color: '#f59e0b',
                                  }}
                                >
                                  <Shield size={14} fill="#f59e0b" />
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  color: '#94a3b8',
                                  fontFamily: 'monospace',
                                  letterSpacing: '0.02em',
                                }}
                              >
                                ID: #{user._id ? user._id.slice(-6).toUpperCase() : 'N/A'}
                              </span>
                              <button
                                onClick={() => handleCopy(user._id, `id-${user._id}`)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  padding: 0,
                                  cursor: 'pointer',
                                  color: copiedKey === `id-${user._id}` ? '#10b981' : '#94a3b8',
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                                title="Copy full User ID"
                              >
                                {copiedKey === `id-${user._id}` ? <Check size={12} /> : <Copy size={12} />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Contact Info */}
                      <td style={tableCellStyle}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Mail size={13} color="#94a3b8" />
                            <a
                              href={`mailto:${user.email}`}
                              style={{
                                fontSize: '0.85rem',
                                color: '#2563eb',
                                textDecoration: 'none',
                                fontWeight: 500,
                              }}
                              title={`Send email to ${user.email}`}
                            >
                              {user.email}
                            </a>
                            <button
                              onClick={() => handleCopy(user.email, `email-${user._id}`)}
                              style={{
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer',
                                color: copiedKey === `email-${user._id}` ? '#10b981' : '#cbd5e1',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                              title="Copy email address"
                            >
                              {copiedKey === `email-${user._id}` ? <Check size={12} /> : <Copy size={12} />}
                            </button>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Phone size={13} color="#94a3b8" />
                            {user.phone ? (
                              <a
                                href={`tel:${user.phone}`}
                                style={{
                                  fontSize: '0.82rem',
                                  color: '#475569',
                                  textDecoration: 'none',
                                }}
                              >
                                {user.phone}
                              </a>
                            ) : (
                              <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                Not provided
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Column 3: Role Chip */}
                      <td style={tableCellStyle}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 10px',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            letterSpacing: '0.02em',
                            textTransform: 'uppercase',
                            background: isAdmin ? '#fef3c7' : '#e0e7ff',
                            color: isAdmin ? '#b45309' : '#3730a3',
                            border: isAdmin ? '1px solid #fde68a' : '1px solid #c7d2fe',
                          }}
                        >
                          {isAdmin ? <ShieldCheck size={13} /> : <UserCheck size={13} />}
                          <span>{isAdmin ? 'Store Admin' : 'Shopper'}</span>
                        </span>
                      </td>

                      {/* Column 4: Activity & LTV */}
                      <td style={tableCellStyle}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                background: isVerifiedBuyer ? '#f0fdf4' : '#f8fafc',
                                color: isVerifiedBuyer ? '#16a34a' : '#64748b',
                                border: isVerifiedBuyer ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                              }}
                            >
                              {user.ordersCount} {user.ordersCount === 1 ? 'order' : 'orders'}
                            </span>
                            {user.totalSpent > 0 && (
                              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                                {formatINR(user.totalSpent)}
                              </span>
                            )}
                          </div>
                          {user.latestOrder && (
                            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                              Last order: {formatDate(user.latestOrder.createdAt)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Column 5: Registered Date */}
                      <td style={tableCellStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '0.85rem' }}>
                          <Calendar size={13} color="#94a3b8" />
                          <span>{formatDate(user.createdAt)}</span>
                        </div>
                      </td>

                      {/* Column 6: Actions */}
                      <td style={{ ...tableCellStyle, textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={() => setSelectedUser(user)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '5px 10px',
                              borderRadius: '8px',
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              color: '#334155',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                            title="View Customer Profile"
                          >
                            <Eye size={13} />
                            <span>Profile</span>
                          </button>

                          <button
                            onClick={() => handleToggleRole(user)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '5px 9px',
                              borderRadius: '8px',
                              background: isAdmin ? '#fef3c7' : '#eff6ff',
                              border: isAdmin ? '1px solid #fde68a' : '1px solid #bfdbfe',
                              color: isAdmin ? '#b45309' : '#1d4ed8',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                            title={isAdmin ? 'Demote to regular shopper' : 'Promote to Store Administrator'}
                          >
                            {isAdmin ? <UserCheck size={13} /> : <ShieldCheck size={13} />}
                            <span>{isAdmin ? 'Demote' : 'Make Admin'}</span>
                          </button>

                          <button
                            onClick={() => handleDeleteUser(user)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '5px 7px',
                              borderRadius: '8px',
                              background: '#fef2f2',
                              border: '1px solid #fee2e2',
                              color: '#ef4444',
                              cursor: 'pointer',
                            }}
                            title="Delete user"
                          >
                            <Trash2 size={13} />
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

        {/* Table Footer with Pagination */}
        {!loading && filteredUsers.length > 0 && (
          <div
            style={{
              padding: '14px 20px',
              borderTop: '1px solid #e2e8f0',
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
              of <strong style={{ color: '#0f172a' }}>{filteredUsers.length}</strong> accounts
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
                      border: page === currentPage ? '1px solid #0f172a' : '1px solid #e2e8f0',
                      background: page === currentPage ? '#0f172a' : '#ffffff',
                      color: page === currentPage ? '#ffffff' : '#334155',
                      fontSize: '0.85rem',
                      fontWeight: page === currentPage ? 700 : 500,
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

      {/* Customer Profile Inspection Modal */}
      {selectedUser && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
          onClick={() => setSelectedUser(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '620px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid #e2e8f0',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f8fafc',
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#ede9fe',
                    color: '#6366f1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <UserCheck size={20} />
                </span>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Account Profile Card
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    ID: #{selectedUser._id}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Profile Overview Banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                }}
              >
                {selectedUser.avatar ? (
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid #ffffff',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: getAvatarGradient(selectedUser.name),
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.25rem',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    }}
                  >
                    {getAvatarInitials(selectedUser.name)}
                  </div>
                )}

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      {selectedUser.name}
                    </h4>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '999px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background: selectedUser.role === 'admin' ? '#fef3c7' : '#e0e7ff',
                        color: selectedUser.role === 'admin' ? '#b45309' : '#3730a3',
                      }}
                    >
                      {selectedUser.role === 'admin' ? 'Store Admin' : 'Shopper'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={13} color="#64748b" /> {selectedUser.email}
                    </span>
                    {selectedUser.phone && (
                      <span style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={13} color="#64748b" /> {selectedUser.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 3 Metrics Cards inside Modal */}
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
                  <span style={modalMetricLabel}>Joined On</span>
                  <div style={{ ...modalMetricValue, fontSize: '0.9rem', color: '#334155', fontWeight: 700 }}>
                    {formatDate(selectedUser.createdAt)}
                  </div>
                </div>
              </div>

              {/* Order History Section */}
              <div>
                <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginBottom: '10px' }}>
                  Recent Orders Placed by {selectedUser.name} ({selectedUser.userOrders?.length || 0})
                </h5>

                {selectedUser.userOrders && selectedUser.userOrders.length > 0 ? (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      maxHeight: '220px',
                      overflowY: 'auto',
                    }}
                  >
                    {selectedUser.userOrders.map((order) => (
                      <div
                        key={order._id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '10px',
                          fontSize: '0.85rem',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>
                            Order #{order._id?.slice(-8).toUpperCase()}
                          </div>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {formatDateTime(order.createdAt)} • {order.items?.length || 0} item(s)
                          </span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 800, color: '#0f172a' }}>
                            {formatINR(order.totalPrice)}
                          </div>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color: order.orderStatus === 'Delivered' ? '#16a34a' : '#ea580c',
                            }}
                          >
                            {order.orderStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      padding: '24px',
                      textAlign: 'center',
                      background: '#f8fafc',
                      borderRadius: '10px',
                      color: '#94a3b8',
                      fontSize: '0.85rem',
                    }}
                  >
                    No purchase history found for this account yet.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer / Direct Action Links */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #e2e8f0',
                background: '#f8fafc',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottomLeftRadius: '20px',
                borderBottomRightRadius: '20px',
              }}
            >
              <div style={{ display: 'flex', gap: '10px' }}>
                <a
                  href={`mailto:${selectedUser.email}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    color: '#334155',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  <Mail size={14} /> Send Email
                </a>
                {selectedUser.phone && (
                  <a
                    href={`tel:${selectedUser.phone}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      color: '#334155',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    <Phone size={14} /> Call Customer
                  </a>
                )}
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                style={{
                  padding: '8px 18px',
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
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
  border: '1px solid #e2e8f0',
  padding: '18px 20px',
  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  gap: '12px',
};

const kpiLabelStyle = {
  fontSize: '0.8rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: '#64748b',
};

const kpiValueStyle = {
  fontSize: '1.75rem',
  fontWeight: 800,
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
