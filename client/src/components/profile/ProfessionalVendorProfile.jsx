import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  ShieldCheck,
  Award,
  CheckCircle2,
  Building2,
  FileText,
  MapPin,
  Truck,
  CreditCard,
  Copy,
  Check,
  Edit3,
  Clock,
  Star,
  Sparkles,
  Package,
  RefreshCw,
  AlertCircle,
  Phone,
  Mail,
  Globe,
  Percent,
  Save,
  X,
  ChevronRight,
  Eye,
  EyeOff,
  Sliders,
  CheckCircle,
  Calendar,
  Layers,
  HelpCircle,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import VendorStoreSettings from './VendorStoreSettings';

const ProfessionalVendorProfile = ({ user, onProfileUpdated }) => {
  const { success, error } = useToast();

  // Active Merchant Sub-Tab
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'legal' | 'warehouse' | 'payouts' | 'settings'

  // Store Live Status (Accepting Orders vs Holiday Mode)
  const [isStoreActive, setIsStoreActive] = useState(
    user?.vendorDetails?.storeStatus !== 'vacation'
  );

  // Copied State Tracker
  const [copiedKey, setCopiedKey] = useState(null);

  // Reveal Account Number
  const [showAccountNo, setShowAccountNo] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Merchant Details State (with rich defaults for Aarav Handlooms)
  const initialDetails = {
    storeName: user?.vendorStoreName || 'Aarav Luxury Handlooms & Apparel',
    tagline:
      user?.vendorDetails?.tagline ||
      'Authentic Chanderi, Maheshwari & Banarasi Silk Heritage Crafted for Modern India',
    legalEntityName:
      user?.vendorDetails?.legalEntityName || 'Aarav Handlooms & Textiles Private Limited',
    merchantId: user?.vendorDetails?.merchantId || 'VND-MP-4520',
    contactPerson: user?.name || 'Aarav Fashion & Handlooms',
    businessEmail: user?.email || 'vendor@casa.in',
    businessPhone: user?.phone || '9876524680',
    gstin: user?.vendorDetails?.gstin || '23AAACA9876Q1Z5',
    pan: user?.vendorDetails?.pan || 'AAACA9876Q',
    msmeReg: user?.vendorDetails?.msmeReg || 'UDYAM-MP-26-0048123',
    businessType: user?.vendorDetails?.businessType || 'Private Limited / Manufacturer',
    primaryCategory: user?.vendorDetails?.primaryCategory || "Women's Ethnic Wear & Handloom Sarees",
    warehouseName:
      user?.vendorDetails?.warehouseName || 'Indore Central Logistics & Textile Hub #14',
    warehouseStreet:
      user?.vendorDetails?.warehouseStreet || 'Plot 14-B, Sector C, Sanwer Road Industrial Area',
    warehouseCity: user?.vendorDetails?.warehouseCity || 'Indore',
    warehouseState: user?.vendorDetails?.warehouseState || 'Madhya Pradesh',
    warehousePincode: user?.vendorDetails?.warehousePincode || '452015',
    dispatchCutoff: user?.vendorDetails?.dispatchCutoff || '4:30 PM IST (Mon - Sat)',
    dispatchManager: user?.vendorDetails?.dispatchManager || 'Rajesh Verma (Dispatch In-Charge)',
    bankName: user?.vendorDetails?.bankName || 'HDFC Bank Ltd',
    bankBranch: user?.vendorDetails?.bankBranch || 'Commercial Banking Branch, MG Road, Indore',
    accountHolder:
      user?.vendorDetails?.accountHolder || 'Aarav Luxury Handlooms & Apparel Pvt Ltd',
    accountNumber: user?.vendorDetails?.accountNumber || '50200084920194',
    ifscCode: user?.vendorDetails?.ifscCode || 'HDFC0000412',
    upiId: user?.vendorDetails?.upiId || 'aaravhandlooms@hdfcbank',
    settlementCycle: user?.vendorDetails?.settlementCycle || 'T+2 Daily Rolling Settlements',
    commissionRate: user?.vendorDetails?.commissionRate || 8.0,
    sellerTier: user?.vendorDetails?.sellerTier || 'Gold Merchant Tier',
  };

  const [formData, setFormData] = useState(initialDetails);
  const [savedData, setSavedData] = useState(initialDetails);

  // Copy helper
  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Toggle Store Active / Vacation Mode
  const handleToggleStoreStatus = async () => {
    const nextStatus = isStoreActive ? 'vacation' : 'active';
    try {
      await api.put('/auth/profile', {
        vendorDetails: {
          ...savedData,
          storeStatus: nextStatus,
        },
      });
      setIsStoreActive(!isStoreActive);
      success(
        !isStoreActive
          ? 'Store status updated: Store is OPEN on Flipkart marketplace and receiving customer orders!'
          : 'Store status updated: Vacation Mode activated. Listings are marked temporarily away.'
      );
    } catch (err) {
      error('Failed to update store status. Please try again.');
    }
  };

  // Save Modal Form Changes
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        name: formData.contactPerson,
        phone: formData.businessPhone,
        vendorStoreName: formData.storeName,
        vendorDetails: {
          ...formData,
          storeStatus: isStoreActive ? 'active' : 'vacation',
        },
      };

      const res = await api.put('/auth/profile', payload);
      if (res.data?.success) {
        setSavedData({ ...formData });
        setIsEditModalOpen(false);
        success('Seller Hub credentials & operational business profile saved successfully!');
        if (onProfileUpdated) {
          onProfileUpdated(res.data.user);
        }
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update merchant profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <style>{`
        .fk-profile-hero {
          background: #2874f0;
          border-radius: 4px;
          padding: 24px 28px;
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(40, 116, 240, 0.18);
          position: relative;
          overflow: hidden;
        }
        .fk-kpi-card {
          background: #ffffff;
          border: 1px solid #dfe3e8;
          border-radius: 4px;
          padding: 16px 18px;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .fk-kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
        }
        .fk-profile-tab {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 18px;
          font-size: 0.86rem;
          font-weight: 700;
          border: none;
          background: transparent;
          border-bottom: 3px solid transparent;
          color: #212121;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .fk-profile-tab:hover {
          color: #2874f0;
          background: #f9fbfd;
        }
        .fk-profile-tab.active {
          color: #2874f0;
          border-bottom: 3px solid #2874f0;
          font-weight: 800;
        }
        .fk-info-tile {
          background: #f9fbfd;
          border: 1px solid #dfe3e8;
          border-radius: 4px;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .fk-info-label {
          font-size: 0.72rem;
          font-weight: 800;
          color: #878787;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .fk-info-value {
          font-size: 0.95rem;
          font-weight: 700;
          color: #212121;
          word-break: break-word;
        }
        .fk-btn-primary {
          background: #fb641b;
          color: #ffffff;
          border: none;
          border-radius: 2px;
          padding: 9px 18px;
          font-weight: 700;
          font-size: 0.84rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
          transition: all 0.15s ease;
        }
        .fk-btn-primary:hover {
          background: #e65510;
        }
        .fk-btn-outline {
          background: #ffffff;
          color: #2874f0;
          border: 1.5px solid #2874f0;
          border-radius: 2px;
          padding: 8px 16px;
          font-weight: 700;
          font-size: 0.84rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.15s ease;
        }
        .fk-btn-outline:hover {
          background: #f1f7ff;
        }
      `}</style>

      {/* 1. FLIPKART SELLER HUB HERO BANNER */}
      <div className="fk-profile-hero">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', position: 'relative', zIndex: 2 }}>
          {/* Brand Identity with Avatar & Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'}
                alt={savedData.storeName}
                style={{
                  width: '74px',
                  height: '74px',
                  borderRadius: '6px',
                  objectFit: 'cover',
                  border: '3px solid #ffe500',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  bottom: '-4px',
                  right: '-4px',
                  background: '#388e3c',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #ffffff',
                }}
                title="Flipkart Verified Seller"
              >
                <Check size={11} color="#ffffff" strokeWidth={3} />
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
                  {savedData.storeName}
                </h1>

                {/* CaSa Assured Badge */}
                <div
                  style={{
                    background: '#ffffff',
                    color: '#2874f0',
                    padding: '2px 8px',
                    borderRadius: '3px',
                    fontSize: '0.72rem',
                    fontWeight: 900,
                    fontStyle: 'italic',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  }}
                >
                  <span>CaSa Assured</span>
                  <span style={{ color: '#fb641b', fontStyle: 'normal' }}>★</span>
                </div>

                <span
                  style={{
                    background: '#ffe500',
                    color: '#2874f0',
                    borderRadius: '3px',
                    padding: '2px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Award size={12} color="#2874f0" /> {savedData.sellerTier}
                </span>

                <span
                  style={{
                    background: 'rgba(255, 255, 255, 0.18)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '3px',
                    padding: '2px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <ShieldCheck size={12} color="#ffe500" /> GST VERIFIED
                </span>
              </div>

              <p style={{ margin: 0, color: '#dbeafe', fontSize: '0.84rem', maxWidth: '640px', lineHeight: 1.45 }}>
                {savedData.tagline}
              </p>

              {/* Badges Bar: ID, Status, Hub */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => handleCopy(savedData.merchantId, 'merchantId')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    borderRadius: '3px',
                    padding: '2px 8px',
                    color: '#ffffff',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                  title="Click to copy Merchant ID"
                >
                  <span>SELLER ID: {savedData.merchantId}</span>
                  {copiedKey === 'merchantId' ? <Check size={12} color="#ffe500" /> : <Copy size={12} />}
                </button>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    color: isStoreActive ? '#ffe500' : '#ffcdd2',
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: isStoreActive ? '#ffe500' : '#ef4444',
                      display: 'inline-block',
                    }}
                  />
                  <span>{isStoreActive ? 'FLIPKART STORE ACTIVE (RECEIVING ORDERS)' : 'STORE PAUSED (HOLIDAY MODE)'}</span>
                </div>

                <span style={{ fontSize: '0.76rem', color: '#dbeafe', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={12} color="#ffe500" /> {savedData.warehouseCity}, {savedData.warehouseState}
                </span>
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleToggleStoreStatus}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#ffffff',
                padding: '8px 14px',
                borderRadius: '3px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
              title="Toggle Store Active / Holiday Mode"
            >
              <Sliders size={13} />
              <span>{isStoreActive ? 'Set Vacation Mode' : 'Open Store Now'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setFormData({ ...savedData });
                setIsEditModalOpen(true);
              }}
              style={{
                background: '#ffffff',
                color: '#2874f0',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '3px',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <Edit3 size={14} color="#2874f0" />
              <span>Edit Store Profile</span>
            </button>

            <Link
              to="/vendor"
              className="fk-btn-primary"
              style={{ textDecoration: 'none' }}
            >
              <Store size={15} color="#ffffff" />
              <span>Launch Seller Hub</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. OPERATIONAL KPI SCORECARD (4 STATS) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        <div className="fk-kpi-card" style={{ borderLeft: '4px solid #388e3c' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '4px', background: '#eafaf1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Star size={20} color="#388e3c" fill="#388e3c" />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#878787', textTransform: 'uppercase' }}>SELLER RATING</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#212121' }}>4.9 / 5.0 ★</div>
            <div style={{ fontSize: '0.72rem', color: '#388e3c', fontWeight: 700 }}>1,280+ Verified Buyer Reviews</div>
          </div>
        </div>

        <div className="fk-kpi-card" style={{ borderLeft: '4px solid #2874f0' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '4px', background: '#e8f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Clock size={20} color="#2874f0" />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#878787', textTransform: 'uppercase' }}>DISPATCH SLA COMPLIANCE</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#212121' }}>99.4% SLA</div>
            <div style={{ fontSize: '0.72rem', color: '#2874f0', fontWeight: 700 }}>On-time handover to courier</div>
          </div>
        </div>

        <div className="fk-kpi-card" style={{ borderLeft: '4px solid #fb641b' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '4px', background: '#fff0e8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Truck size={20} color="#fb641b" />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#878787', textTransform: 'uppercase' }}>AVERAGE DISPATCH SPEED</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#212121' }}>&lt; 24 Hours</div>
            <div style={{ fontSize: '0.72rem', color: '#fb641b', fontWeight: 700 }}>Express Handover Enabled</div>
          </div>
        </div>

        <div className="fk-kpi-card" style={{ borderLeft: '4px solid #7c3aed' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '4px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <RefreshCw size={20} color="#7c3aed" />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#878787', textTransform: 'uppercase' }}>LOW RETURN RATE</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#212121' }}>1.8% RTO</div>
            <div style={{ fontSize: '0.72rem', color: '#388e3c', fontWeight: 700 }}>Flipkart benchmark 8.2%</div>
          </div>
        </div>
      </div>

      {/* 3. FLIPKART NAVIGATION TABS BAR */}
      <div style={{ background: '#ffffff', border: '1px solid #dfe3e8', borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'center', overflowX: 'auto' }}>
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`fk-profile-tab ${activeTab === 'overview' ? 'active' : ''}`}
        >
          <Building2 size={16} />
          <span>Store & Brand Identity</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('legal')}
          className={`fk-profile-tab ${activeTab === 'legal' ? 'active' : ''}`}
        >
          <FileText size={16} />
          <span>GSTIN & Statutory Compliance</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('warehouse')}
          className={`fk-profile-tab ${activeTab === 'warehouse' ? 'active' : ''}`}
        >
          <MapPin size={16} />
          <span>Warehouse & Dispatch Hub</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('payouts')}
          className={`fk-profile-tab ${activeTab === 'payouts' ? 'active' : ''}`}
        >
          <CreditCard size={16} />
          <span>Bank & Settlement Payouts</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`fk-profile-tab ${activeTab === 'settings' ? 'active' : ''}`}
        >
          <Sliders size={16} />
          <span>Store Operations & Automation</span>
        </button>
      </div>

      {/* 4. ACTIVE SUB-TAB CONTENT PANELS */}
      <div style={{ background: '#ffffff', borderRadius: '0 0 4px 4px', border: '1px solid #dfe3e8', borderTop: 'none', padding: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
        {/* TAB 1: STORE & BRAND IDENTITY */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#212121', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Store size={19} color="#2874f0" />
                  Storefront & Merchant Credentials
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.82rem', color: '#878787' }}>
                  Official brand credentials visible on Flipkart product pages and seller storefront.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFormData({ ...savedData });
                  setIsEditModalOpen(true);
                }}
                className="fk-btn-outline"
              >
                <Edit3 size={13} /> Edit Brand Info
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              <div className="fk-info-tile">
                <span className="fk-info-label"><Store size={12} /> Merchant Store Name</span>
                <span className="fk-info-value">{savedData.storeName}</span>
              </div>

              <div className="fk-info-tile">
                <span className="fk-info-label"><Sparkles size={12} /> Brand Tagline / Slogan</span>
                <span className="fk-info-value">{savedData.tagline}</span>
              </div>

              <div className="fk-info-tile">
                <span className="fk-info-label"><Building2 size={12} /> Legal Entity Name</span>
                <span className="fk-info-value">{savedData.legalEntityName}</span>
              </div>

              <div className="fk-info-tile">
                <span className="fk-info-label"><Layers size={12} /> Primary Product Specialization</span>
                <span className="fk-info-value">{savedData.primaryCategory}</span>
              </div>

              <div className="fk-info-tile">
                <span className="fk-info-label"><Phone size={12} /> Direct Merchant Phone</span>
                <span className="fk-info-value">+91 {savedData.businessPhone}</span>
              </div>

              <div className="fk-info-tile">
                <span className="fk-info-label"><Mail size={12} /> Verified Business Email</span>
                <span className="fk-info-value">{savedData.businessEmail}</span>
              </div>

              <div className="fk-info-tile">
                <span className="fk-info-label"><Truck size={12} /> Fulfillment Channel</span>
                <span className="fk-info-value" style={{ color: '#388e3c', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <CheckCircle2 size={14} color="#388e3c" /> Flipkart Logistics / Direct Express Hub Pickup
                </span>
              </div>

              <div className="fk-info-tile">
                <span className="fk-info-label"><Award size={12} /> Platform Partnership</span>
                <span className="fk-info-value">Certified Merchant Agreement 2026-2027</span>
              </div>
            </div>

            {/* Brand Story Callout */}
            <div style={{ background: '#f0f7ff', border: '1px solid #cce5ff', borderRadius: '4px', padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <Sparkles size={20} color="#2874f0" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: '#1a5dc7' }}>
                  Authentic Handloom & Apparel Certified Seller
                </h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#2874f0', lineHeight: 1.5 }}>
                  Aarav Luxury Handlooms is integrated with master weavers across Chanderi, Maheshwar, and Varanasi. Every consignment dispatched carries verified Silk Mark certifications and Flipkart-certified tamper-proof packaging.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LEGAL, GST & STATUTORY COMPLIANCE */}
        {activeTab === 'legal' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#212121', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={19} color="#2874f0" />
                GSTIN & Statutory Tax Compliance
              </h3>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.82rem', color: '#878787' }}>
                Verified tax identities, GST filings, and legal business classification under Government of India guidelines.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              <div className="fk-info-tile" style={{ borderLeft: '4px solid #388e3c' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="fk-info-label"><FileText size={12} /> GSTIN (Active Verified)</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(savedData.gstin, 'gstin')}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#878787' }}
                    title="Copy GSTIN"
                  >
                    {copiedKey === 'gstin' ? <Check size={14} color="#388e3c" /> : <Copy size={14} />}
                  </button>
                </div>
                <span className="fk-info-value" style={{ fontFamily: 'monospace', fontSize: '1.05rem', color: '#212121' }}>
                  {savedData.gstin}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#388e3c', fontWeight: 700 }}>
                  State Code: 23 (Madhya Pradesh) | Regular Taxpayer
                </span>
              </div>

              <div className="fk-info-tile" style={{ borderLeft: '4px solid #2874f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="fk-info-label"><ShieldCheck size={12} /> Permanent Account Number (PAN)</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(savedData.pan, 'pan')}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#878787' }}
                    title="Copy PAN"
                  >
                    {copiedKey === 'pan' ? <Check size={14} color="#2874f0" /> : <Copy size={14} />}
                  </button>
                </div>
                <span className="fk-info-value" style={{ fontFamily: 'monospace', fontSize: '1.05rem', color: '#212121' }}>
                  {savedData.pan}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#2874f0', fontWeight: 700 }}>
                  Corporate Entity PAN | Verified
                </span>
              </div>

              <div className="fk-info-tile">
                <span className="fk-info-label"><Award size={12} /> MSME / Udyam Registration</span>
                <span className="fk-info-value" style={{ fontFamily: 'monospace', fontSize: '0.92rem' }}>
                  {savedData.msmeReg}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#878787' }}>Enterprise: Micro, Small & Medium Enterprise</span>
              </div>

              <div className="fk-info-tile">
                <span className="fk-info-label"><Building2 size={12} /> Business Constitution</span>
                <span className="fk-info-value">{savedData.businessType}</span>
                <span style={{ fontSize: '0.7rem', color: '#878787' }}>Incorporation: Ministry of Corporate Affairs</span>
              </div>
            </div>

            <div style={{ background: '#eafaf1', border: '1px solid #c2eed5', borderRadius: '4px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle2 size={22} color="#388e3c" style={{ flexShrink: 0 }} />
              <div>
                <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: '#1e7e34' }}>
                  Statutory Invoicing & TDS Compliance Active
                </h4>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#2e7d32' }}>
                  All orders fulfilled by your store automatically generate compliant GST B2C and B2B invoices with digital HSN codes (5007 / 5208) and Section 194-O TDS deductions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: WAREHOUSE & PICKUP HUB */}
        {activeTab === 'warehouse' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#212121', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={19} color="#2874f0" />
                  Primary Dispatch Warehouse & Courier Pickup Location
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.82rem', color: '#878787' }}>
                  Location where delivery partners (Delhivery, BlueDart, Flipkart Logistics) arrive to collect packed consignments.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFormData({ ...savedData });
                  setIsEditModalOpen(true);
                }}
                className="fk-btn-outline"
              >
                <Edit3 size={13} /> Update Warehouse Address
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              <div className="fk-info-tile" style={{ gridColumn: 'span 2' }}>
                <span className="fk-info-label"><Building2 size={12} /> Facility Name & Full Address</span>
                <span className="fk-info-value" style={{ fontSize: '1rem', color: '#212121' }}>
                  {savedData.warehouseName}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#555', marginTop: '3px', fontWeight: 500 }}>
                  {savedData.warehouseStreet}, {savedData.warehouseCity}, {savedData.warehouseState} - {savedData.warehousePincode}
                </span>
              </div>

              <div className="fk-info-tile">
                <span className="fk-info-label"><Clock size={12} /> Daily Pickup Cutoff Time</span>
                <span className="fk-info-value" style={{ color: '#fb641b' }}>{savedData.dispatchCutoff}</span>
                <span style={{ fontSize: '0.7rem', color: '#878787' }}>Orders packed before 3:30 PM dispatched same day</span>
              </div>

              <div className="fk-info-tile">
                <span className="fk-info-label"><Phone size={12} /> Warehouse In-Charge / Dispatch Phone</span>
                <span className="fk-info-value">{savedData.dispatchManager}</span>
                <span style={{ fontSize: '0.7rem', color: '#878787' }}>Direct Line: +91 {savedData.businessPhone}</span>
              </div>

              <div className="fk-info-tile">
                <span className="fk-info-label"><Truck size={12} /> Integrated Logistics Fleets</span>
                <span className="fk-info-value" style={{ fontSize: '0.88rem' }}>Delhivery Surface, BlueDart Air & Flipkart Logistics</span>
                <span style={{ fontSize: '0.7rem', color: '#388e3c', fontWeight: 700 }}>Auto-manifesting enabled</span>
              </div>

              <div className="fk-info-tile">
                <span className="fk-info-label"><RefreshCw size={12} /> RTO & Customer Returns Hub</span>
                <span className="fk-info-value" style={{ fontSize: '0.88rem' }}>Returns inspected at Indore Central Hub before restock</span>
                <span style={{ fontSize: '0.7rem', color: '#878787' }}>48h quality audit guarantee</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: BANK & SETTLEMENT PAYOUTS */}
        {activeTab === 'payouts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#212121', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CreditCard size={19} color="#2874f0" />
                  Bank Account & Settlement Payout Credentials
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.82rem', color: '#878787' }}>
                  Designated commercial bank account where sales revenues are deposited on a rolling T+2 schedule.
                </p>
              </div>

              <Link
                to="/vendor"
                className="fk-btn-outline"
                style={{ textDecoration: 'none' }}
              >
                <span>View Payout History & UTR</span>
                <ChevronRight size={13} />
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              <div className="fk-info-tile" style={{ borderLeft: '4px solid #388e3c' }}>
                <span className="fk-info-label"><Building2 size={12} /> Settlement Bank</span>
                <span className="fk-info-value">{savedData.bankName}</span>
                <span style={{ fontSize: '0.75rem', color: '#878787' }}>{savedData.bankBranch}</span>
              </div>

              <div className="fk-info-tile">
                <span className="fk-info-label"><Award size={12} /> Beneficiary Account Name</span>
                <span className="fk-info-value">{savedData.accountHolder}</span>
              </div>

              <div className="fk-info-tile">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="fk-info-label"><CreditCard size={12} /> Account Number</span>
                  <button
                    type="button"
                    onClick={() => setShowAccountNo(!showAccountNo)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#878787', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem' }}
                  >
                    {showAccountNo ? <EyeOff size={13} /> : <Eye size={13} />}
                    <span>{showAccountNo ? 'Hide' : 'Reveal'}</span>
                  </button>
                </div>
                <span className="fk-info-value" style={{ fontFamily: 'monospace', fontSize: '1.05rem', letterSpacing: '0.04em' }}>
                  {showAccountNo ? savedData.accountNumber : `•••• •••• •••• ${savedData.accountNumber.slice(-4)}`}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#388e3c', fontWeight: 700 }}>Direct IMPS / NEFT Auto-Credit</span>
              </div>

              <div className="fk-info-tile">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="fk-info-label"><FileText size={12} /> IFSC Routing Code</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(savedData.ifscCode, 'ifsc')}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#878787' }}
                    title="Copy IFSC Code"
                  >
                    {copiedKey === 'ifsc' ? <Check size={14} color="#388e3c" /> : <Copy size={14} />}
                  </button>
                </div>
                <span className="fk-info-value" style={{ fontFamily: 'monospace', fontSize: '1.05rem', color: '#212121' }}>
                  {savedData.ifscCode}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#878787' }}>RTGS / NEFT / IMPS Enabled</span>
              </div>

              <div className="fk-info-tile">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="fk-info-label"><Sparkles size={12} /> Business UPI VPA</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(savedData.upiId, 'upi')}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#878787' }}
                    title="Copy UPI ID"
                  >
                    {copiedKey === 'upi' ? <Check size={14} color="#fb641b" /> : <Copy size={14} />}
                  </button>
                </div>
                <span className="fk-info-value" style={{ color: '#fb641b', fontFamily: 'monospace' }}>
                  {savedData.upiId}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#878787' }}>Instant Merchant QR & Settlement ID</span>
              </div>

              <div className="fk-info-tile">
                <span className="fk-info-label"><Percent size={12} /> Platform Commission Slab</span>
                <span className="fk-info-value" style={{ color: '#2874f0' }}>{savedData.commissionRate}% Flat Rate</span>
                <span style={{ fontSize: '0.7rem', color: '#878787' }}>Gold Merchant Tier privileged rate (Standard: 12%)</span>
              </div>
            </div>

            <div style={{ background: '#f9fbfd', border: '1px solid #dfe3e8', borderRadius: '4px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Clock size={20} color="#2874f0" />
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: '#212121' }}>
                    Rolling Settlement Schedule: T+2 Working Days
                  </h4>
                  <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#878787' }}>
                    Payments for delivered orders are credited directly into your verified HDFC account within 48 hours of successful customer delivery.
                  </p>
                </div>
              </div>

              <Link
                to="/vendor"
                className="fk-btn-primary"
                style={{ textDecoration: 'none' }}
              >
                View Financial Ledger
              </Link>
            </div>
          </div>
        )}

        {/* TAB 5: STORE OPERATIONS & AUTOMATION SETTINGS */}
        {activeTab === 'settings' && (
          <VendorStoreSettings user={user} onSettingsSaved={onProfileUpdated} />
        )}
      </div>

      {/* 5. DIRECT ACTION BANNER TO FLIPKART SELLER HUB */}
      <div
        style={{
          background: 'linear-gradient(90deg, #e8f0fe 0%, #ffffff 100%)',
          border: '1px solid #c2dbfe',
          borderRadius: '4px',
          padding: '18px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '4px', background: '#2874f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', flexShrink: 0 }}>
            <Store size={22} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#1a5dc7' }}>
              Need to Fulfill Orders, Add Listings, or Check Payouts?
            </h3>
            <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: '#555' }}>
              Generate shipping labels, confirm packed consignments, and update stock counts inside the full CaSa Seller Hub.
            </p>
          </div>
        </div>

        <Link
          to="/vendor"
          className="fk-btn-primary"
          style={{ textDecoration: 'none' }}
        >
          <span>Open Full Seller Hub</span>
          <ChevronRight size={15} />
        </Link>
      </div>

      {/* 6. EDIT STORE PROFILE MODAL (FLIPKART STYLE) */}
      {isEditModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '4px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
              border: '1px solid #dfe3e8',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: '1px solid #dfe3e8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '4px', background: '#e8f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2874f0' }}>
                  <Edit3 size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#212121' }}>
                    Edit Merchant Store Profile
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#878787' }}>
                    Update your business credentials, warehouse location, and statutory details.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#878787' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProfile} style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Store & Contact Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#2874f0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  1. Store Branding & Identity
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#212121', display: 'block', marginBottom: '4px' }}>
                      Merchant Store Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.storeName}
                      onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '3px', border: '1px solid #dfe3e8', fontSize: '0.86rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#212121', display: 'block', marginBottom: '4px' }}>
                      Authorized Contact Person *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '3px', border: '1px solid #dfe3e8', fontSize: '0.86rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#212121', display: 'block', marginBottom: '4px' }}>
                    Brand Slogan / Tagline
                  </label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '3px', border: '1px solid #dfe3e8', fontSize: '0.86rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#212121', display: 'block', marginBottom: '4px' }}>
                      Direct Phone Number (+91) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.businessPhone}
                      onChange={(e) => setFormData({ ...formData, businessPhone: e.target.value.replace(/\D/g, '') })}
                      maxLength={10}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '3px', border: '1px solid #dfe3e8', fontSize: '0.86rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#212121', display: 'block', marginBottom: '4px' }}>
                      Primary Operating Categories
                    </label>
                    <input
                      type="text"
                      value={formData.primaryCategory}
                      onChange={(e) => setFormData({ ...formData, primaryCategory: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '3px', border: '1px solid #dfe3e8', fontSize: '0.86rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Statutory & Warehouse */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '10px', borderTop: '1px solid #dfe3e8' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#2874f0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  2. Warehouse & GST Details
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#212121', display: 'block', marginBottom: '4px' }}>
                      GSTIN Number *
                    </label>
                    <input
                      type="text"
                      value={formData.gstin}
                      onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '3px', border: '1px solid #dfe3e8', fontSize: '0.86rem', fontFamily: 'monospace' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#212121', display: 'block', marginBottom: '4px' }}>
                      Business PAN *
                    </label>
                    <input
                      type="text"
                      value={formData.pan}
                      onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '3px', border: '1px solid #dfe3e8', fontSize: '0.86rem', fontFamily: 'monospace' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#212121', display: 'block', marginBottom: '4px' }}>
                    Warehouse Facility / Dispatch Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.warehouseStreet}
                    onChange={(e) => setFormData({ ...formData, warehouseStreet: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '3px', border: '1px solid #dfe3e8', fontSize: '0.86rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#212121', display: 'block', marginBottom: '4px' }}>City *</label>
                    <input
                      type="text"
                      required
                      value={formData.warehouseCity}
                      onChange={(e) => setFormData({ ...formData, warehouseCity: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '3px', border: '1px solid #dfe3e8', fontSize: '0.86rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#212121', display: 'block', marginBottom: '4px' }}>State *</label>
                    <input
                      type="text"
                      required
                      value={formData.warehouseState}
                      onChange={(e) => setFormData({ ...formData, warehouseState: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '3px', border: '1px solid #dfe3e8', fontSize: '0.86rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#212121', display: 'block', marginBottom: '4px' }}>PIN Code *</label>
                    <input
                      type="text"
                      required
                      value={formData.warehousePincode}
                      onChange={(e) => setFormData({ ...formData, warehousePincode: e.target.value.replace(/\D/g, '') })}
                      maxLength={6}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '3px', border: '1px solid #dfe3e8', fontSize: '0.86rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '14px', borderTop: '1px solid #dfe3e8' }}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="fk-btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="fk-btn-primary"
                >
                  <Save size={15} />
                  <span>{isSaving ? 'Saving...' : 'Save Merchant Profile'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalVendorProfile;
