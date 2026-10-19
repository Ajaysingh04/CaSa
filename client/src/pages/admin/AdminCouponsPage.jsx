import React, { useState, useEffect, useMemo } from 'react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { formatINR, formatDate } from '../../utils/formatters';
import {
  Tag,
  Plus,
  Search,
  Trash2,
  Check,
  X,
  RefreshCw,
  Percent,
  DollarSign,
  Calendar,
  Clock,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Flame,
  Copy,
  CheckCircle2,
} from 'lucide-react';

const AdminCouponsPage = () => {
  const { success, error } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountAmount: 15,
    minOrderAmount: 499,
    maxDiscountAmount: 300,
    description: '',
    usageLimit: 500,
  });

  const loadCoupons = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      // Fetch all coupons including inactive
      const data = await adminService.getAllCouponsAdmin();
      setCoupons(data || []);
    } catch (err) {
      error('Failed to load coupons');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const openCreateModal = () => {
    setFormData({
      code: '',
      discountType: 'percentage',
      discountAmount: 15,
      minOrderAmount: 499,
      maxDiscountAmount: 300,
      description: '',
      usageLimit: 500,
    });
    setIsModalOpen(true);
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      error('Coupon code is required');
      return;
    }

    setSaving(true);
    try {
      await adminService.createCoupon({
        ...formData,
        code: formData.code.trim().toUpperCase(),
        discountAmount: Number(formData.discountAmount),
        minOrderAmount: Number(formData.minOrderAmount) || 0,
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
        usageLimit: Number(formData.usageLimit) || 1000,
      });
      success(`Promo code "${formData.code.toUpperCase()}" created successfully!`);
      setIsModalOpen(false);
      loadCoupons();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (coupon) => {
    const updatedStatus = !coupon.isActive;
    try {
      await adminService.updateCoupon(coupon._id, { isActive: updatedStatus });
      success(`Coupon "${coupon.code}" is now ${updatedStatus ? 'Active' : 'Inactive'}`);
      setCoupons((prev) =>
        prev.map((c) => (c._id === coupon._id ? { ...c, isActive: updatedStatus } : c))
      );
    } catch (err) {
      error('Failed to update coupon status');
    }
  };

  const handleDeleteCoupon = async (coupon) => {
    if (!window.confirm(`Are you sure you want to delete coupon code "${coupon.code}"?`)) {
      return;
    }

    try {
      await adminService.deleteCoupon(coupon._id);
      success(`Coupon "${coupon.code}" removed.`);
      setCoupons((prev) => prev.filter((c) => c._id !== coupon._id));
    } catch (err) {
      error('Failed to delete coupon');
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      const q = search.toLowerCase();
      return (
        c.code?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      );
    });
  }, [coupons, search]);

  const totalUsed = useMemo(() => {
    return coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);
  }, [coupons]);

  return (
    <div className="container" style={{ padding: '24px 16px 80px', maxWidth: '1380px' }}>
      <style>{`
        .coupon-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 16px;
        }
        @media (max-width: 640px) {
          .coupon-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tag size={22} color="#2563eb" />
            <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              Coupons & Promotional Deals
            </h1>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Manage discount vouchers, checkout promo codes, minimum spend limits, and customer savings.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => loadCoupons(true)}
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
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={openCreateModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              fontSize: '0.825rem',
              fontWeight: 700,
              border: 'none',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              cursor: 'pointer',
            }}
          >
            <Plus size={15} />
            <span>Create Coupon</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div style={kpiBox}>
          <span style={kpiLabel}>Total Coupons</span>
          <strong style={kpiVal}>{coupons.length}</strong>
        </div>
        <div style={kpiBox}>
          <span style={kpiLabel}>Active Codes</span>
          <strong style={{ ...kpiVal, color: '#059669' }}>
            {coupons.filter((c) => c.isActive).length}
          </strong>
        </div>
        <div style={kpiBox}>
          <span style={kpiLabel}>Total Redemptions</span>
          <strong style={{ ...kpiVal, color: '#4338ca' }}>{totalUsed}</strong>
        </div>
      </div>

      {/* Search Input */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#ffffff', padding: '12px 16px', borderRadius: '14px', border: '1.5px solid #e2e8f0', marginBottom: '24px' }}>
        <Search size={18} color="#94a3b8" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by coupon code or discount description (e.g. CASA20, FESTIVAL)..."
          style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.875rem', color: '#0f172a' }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Coupons Grid / Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <RefreshCw size={24} className="spin" style={{ margin: '0 auto 10px', display: 'block' }} />
          Loading promotional coupons...
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 16px', background: '#ffffff', borderRadius: '16px', border: '1.5px dashed #cbd5e1' }}>
          <Tag size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>No Coupons Found</h3>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>Create your first discount coupon above.</p>
        </div>
      ) : (
        <div className="coupon-grid">
          {filteredCoupons.map((coupon) => (
            <div
              key={coupon._id}
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: coupon.isActive ? '1.5px solid #cbd5e1' : '1.5px dashed #e2e8f0',
                padding: '20px',
                position: 'relative',
                opacity: coupon.isActive ? 1 : 0.75,
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                {/* Code Pill */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    onClick={() => handleCopyCode(coupon.code)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#f8fafc',
                      border: '1.5px dashed #2563eb',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      color: '#1d4ed8',
                      fontSize: '0.95rem',
                      fontWeight: 900,
                      letterSpacing: '0.04em',
                      cursor: 'pointer',
                    }}
                    title="Click to copy code"
                  >
                    <Tag size={13} color="#2563eb" />
                    {coupon.code}
                    {copiedCode === coupon.code ? <Check size={12} color="#059669" /> : <Copy size={12} color="#94a3b8" />}
                  </span>

                  {coupon.isActive ? (
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>
                      ACTIVE
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: '#f1f5f9', color: '#64748b' }}>
                      PAUSED
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() => handleToggleStatus(coupon)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      color: coupon.isActive ? '#059669' : '#94a3b8',
                    }}
                    title={coupon.isActive ? 'Pause coupon' : 'Activate coupon'}
                  >
                    {coupon.isActive ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                  </button>
                  <button
                    onClick={() => handleDeleteCoupon(coupon)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      color: '#ef4444',
                    }}
                    title="Delete coupon"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Discount Amount Highlight */}
              <div style={{ margin: '10px 0' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>
                  {coupon.discountType === 'percentage'
                    ? `${coupon.discountAmount}% OFF`
                    : `₹${coupon.discountAmount} FLAT OFF`}
                </span>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0', lineHeight: 1.4 }}>
                  {coupon.description || 'Promotional checkout discount code.'}
                </p>
              </div>

              {/* Terms & Stats */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem', color: '#475569' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Min Order Spend:</span>
                  <strong>{formatINR(coupon.minOrderAmount || 0)}</strong>
                </div>
                {coupon.maxDiscountAmount && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Max Discount Cap:</span>
                    <strong>{formatINR(coupon.maxDiscountAmount)}</strong>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Total Times Used:</span>
                  <strong style={{ color: '#2563eb' }}>{coupon.usedCount || 0} times</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE COUPON MODAL */}
      {isModalOpen && (
        <div style={modalBackdrop}>
          <div style={modalCard}>
            <div style={modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tag size={18} color="#2563eb" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Create Discount Promo Code
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={closeBtn}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Coupon Code (Uppercase) *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. CASA20, DIWALI500"
                  style={{ ...inputStyle, textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Discount Type *</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>
                    Discount Value {formData.discountType === 'percentage' ? '(%)' : '(₹)'} *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.discountAmount}
                    onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Min Order Spend (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.maxDiscountAmount || ''}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                    placeholder="Leave empty for no cap"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Description / Terms</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Flat ₹200 OFF on orders above ₹1499"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={secondaryBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={primaryBtn}>
                  {saving ? 'Creating...' : 'Create Promo Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* Styles */
const kpiBox = {
  background: '#ffffff',
  padding: '16px 20px',
  borderRadius: '14px',
  border: '1.5px solid #e2e8f0',
};

const kpiLabel = {
  fontSize: '0.78rem',
  color: '#64748b',
  fontWeight: 600,
  display: 'block',
  marginBottom: '4px',
};

const kpiVal = {
  fontSize: '1.65rem',
  fontWeight: 900,
  color: '#0f172a',
  letterSpacing: '-0.02em',
};

const modalBackdrop = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px',
  zIndex: 1000,
};

const modalCard = {
  background: '#ffffff',
  borderRadius: '18px',
  padding: '24px',
  width: '100%',
  maxWidth: '480px',
  boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.25)',
};

const modalHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '16px',
  paddingBottom: '12px',
  borderBottom: '1px solid #f1f5f9',
};

const closeBtn = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#94a3b8',
};

const labelStyle = {
  fontSize: '0.8rem',
  fontWeight: 700,
  color: '#334155',
  display: 'block',
  marginBottom: '5px',
};

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: '10px',
  border: '1.5px solid #cbd5e1',
  fontSize: '0.85rem',
  color: '#0f172a',
  outline: 'none',
  boxSizing: 'border-box',
};

const primaryBtn = {
  padding: '8px 16px',
  borderRadius: '10px',
  background: '#2563eb',
  color: '#ffffff',
  fontSize: '0.825rem',
  fontWeight: 700,
  border: 'none',
  cursor: 'pointer',
};

const secondaryBtn = {
  padding: '8px 14px',
  borderRadius: '10px',
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  color: '#475569',
  fontSize: '0.825rem',
  fontWeight: 600,
  cursor: 'pointer',
};

export default AdminCouponsPage;
