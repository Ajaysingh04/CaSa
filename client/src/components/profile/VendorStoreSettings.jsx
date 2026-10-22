import React, { useState } from 'react';
import {
  Sliders,
  Bell,
  Volume2,
  MessageSquare,
  Package,
  Truck,
  FileText,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Save,
  RotateCcw,
  AlertTriangle,
  Globe,
  DollarSign,
  Printer,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Store,
  Check,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useStore } from '../../context/StoreContext';

const VendorStoreSettings = ({ user, onSettingsSaved }) => {
  const { success, error } = useToast();
  const { language, setLanguage } = useStore();

  const userSettings = user?.vendorDetails?.settings || {};

  // Merchant Operational & Automation Settings State
  const [settings, setSettings] = useState({
    autoConfirmOrders: userSettings.autoConfirmOrders !== false,
    newOrderSoundAlert: userSettings.newOrderSoundAlert !== false,
    whatsappAlerts: userSettings.whatsappAlerts !== false,
    lowStockThreshold: userSettings.lowStockThreshold || 5,
    dailyDigestEmail: userSettings.dailyDigestEmail !== false,
    preferredCourier: userSettings.preferredCourier || 'Delhivery Express Air & Surface',
    dispatchCutoffTime: userSettings.dispatchCutoffTime || '4:30 PM IST (Mon - Sat)',
    invoicePrefix: userSettings.invoicePrefix || 'CASA-AARAV/2026/',
    taxInclusive: userSettings.taxInclusive !== false,
    returnWindowDays: userSettings.returnWindowDays || 7,
    autoAcceptReturns: userSettings.autoAcceptReturns !== false,
    vacationMode: user?.vendorDetails?.storeStatus === 'vacation',
    portalLanguage: user?.preferredLanguage || language || 'en',
    packagingBagType: userSettings.packagingBagType || 'Tamper-Proof Biodegradable Polybag (500g)',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [savedRecently, setSavedRecently] = useState(false);

  // Toggle helper
  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Save Settings to Backend API
  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        preferredLanguage: settings.portalLanguage,
        vendorDetails: {
          ...(user?.vendorDetails || {}),
          storeStatus: settings.vacationMode ? 'vacation' : 'active',
          settings: {
            ...settings,
          },
        },
      };

      const res = await api.put('/auth/profile', payload);
      if (res.data?.success) {
        success('Vendor operations and Flipkart store fulfillment settings saved successfully!');
        setSavedRecently(true);
        setTimeout(() => setSavedRecently(false), 3000);
        if (onSettingsSaved) {
          onSettingsSaved(res.data.user);
        }
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save vendor settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <style>{`
        .setting-section-card {
          background: #ffffff;
          border: 1px solid #dfe3e8;
          border-radius: 4px;
          padding: 20px 22px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }
        .setting-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 13px 0;
          border-bottom: 1px solid #f1f3f6;
          gap: 16px;
          flex-wrap: wrap;
        }
        .setting-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .toggle-switch-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          transition: transform 0.15s ease;
        }
        .toggle-switch-btn:hover {
          transform: scale(1.05);
        }
        .fk-btn-primary {
          background: #fb641b;
          color: #ffffff;
          border: none;
          border-radius: 2px;
          padding: 10px 22px;
          font-weight: 700;
          font-size: 0.85rem;
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
      `}</style>

      {/* Header Banner - Flipkart Blue Header */}
      <div
        style={{
          background: '#2874f0',
          borderRadius: '4px',
          padding: '20px 24px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 2px 6px rgba(40, 116, 240, 0.2)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '4px', background: '#ffe500', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sliders size={20} color="#2874f0" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                Flipkart Store Operations & Automation Settings
              </h2>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: '#dbeafe' }}>
                Configure real-time order alerts, courier fulfillment rules, automated GST billing, and return policies.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="fk-btn-primary"
          style={{ background: savedRecently ? '#388e3c' : '#fb641b' }}
        >
          {savedRecently ? <Check size={16} /> : <Save size={16} />}
          <span>{isSaving ? 'Saving Settings...' : savedRecently ? 'Settings Saved!' : 'Save All Settings'}</span>
        </button>
      </div>

      {/* 1. ORDER DISPATCH & FULFILLMENT AUTOMATION */}
      <div className="setting-section-card">
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#212121', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Truck size={18} color="#2874f0" />
          Fulfillment & Courier Logistics Rules
        </h3>
        <p style={{ fontSize: '0.78rem', color: '#878787', margin: '0 0 16px 0' }}>
          Automate order acceptance and daily shipping dispatch with integrated Flipkart logistics partners.
        </p>

        {/* Auto Confirm Orders */}
        <div className="setting-row">
          <div>
            <strong style={{ fontSize: '0.88rem', color: '#212121', display: 'block' }}>
              Auto-Confirm Incoming Customer Orders
            </strong>
            <span style={{ fontSize: '0.76rem', color: '#878787' }}>
              Immediately switch new orders to "Confirmed" status so warehouse pickers can begin packing without waiting for manual confirmation.
            </span>
          </div>
          <button
            type="button"
            className="toggle-switch-btn"
            onClick={() => handleToggle('autoConfirmOrders')}
            title="Toggle Auto-Confirm"
          >
            {settings.autoConfirmOrders ? (
              <ToggleRight size={38} color="#2874f0" />
            ) : (
              <ToggleLeft size={38} color="#878787" />
            )}
          </button>
        </div>

        {/* Preferred Courier Fleet */}
        <div className="setting-row">
          <div>
            <strong style={{ fontSize: '0.88rem', color: '#212121', display: 'block' }}>
              Preferred Express Logistics Fleet
            </strong>
            <span style={{ fontSize: '0.76rem', color: '#878787' }}>
              Default delivery network assigned for automatic pickup manifests and airway bill (AWB) generation.
            </span>
          </div>
          <select
            value={settings.preferredCourier}
            onChange={(e) => setSettings({ ...settings, preferredCourier: e.target.value })}
            style={{
              padding: '7px 12px',
              borderRadius: '3px',
              border: '1px solid #dfe3e8',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: '#212121',
              background: '#f9fbfd',
              cursor: 'pointer',
              maxWidth: '320px',
            }}
          >
            <option value="Delhivery Express Air & Surface">Delhivery Express Air & Surface (Recommended)</option>
            <option value="BlueDart Air Express Cargo">BlueDart Air Express Cargo</option>
            <option value="Flipkart Dedicated Express Logistics">Flipkart Dedicated Express Logistics</option>
            <option value="Smart Auto-Routing (Fastest Available)">Smart Auto-Routing (Fastest Available)</option>
          </select>
        </div>

        {/* Daily Courier Cutoff */}
        <div className="setting-row">
          <div>
            <strong style={{ fontSize: '0.88rem', color: '#212121', display: 'block' }}>
              Daily Courier Handover Cutoff Window
            </strong>
            <span style={{ fontSize: '0.76rem', color: '#878787' }}>
              Scheduled time when delivery riders arrive at your Indore warehouse hub for daily parcel collection.
            </span>
          </div>
          <select
            value={settings.dispatchCutoffTime}
            onChange={(e) => setSettings({ ...settings, dispatchCutoffTime: e.target.value })}
            style={{
              padding: '7px 12px',
              borderRadius: '3px',
              border: '1px solid #dfe3e8',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: '#212121',
              background: '#f9fbfd',
              cursor: 'pointer',
            }}
          >
            <option value="4:30 PM IST (Mon - Sat)">Evening Cutoff: 4:30 PM IST (Mon - Sat)</option>
            <option value="11:30 AM IST (Mon - Sat)">Morning Cutoff: 11:30 AM IST (Mon - Sat)</option>
            <option value="Twice Daily (11:30 AM & 4:30 PM)">Twice Daily Dispatch (11:30 AM & 4:30 PM)</option>
          </select>
        </div>

        {/* Standard Packaging Type */}
        <div className="setting-row">
          <div>
            <strong style={{ fontSize: '0.88rem', color: '#212121', display: 'block' }}>
              Standard Dispatch Packaging Unit
            </strong>
            <span style={{ fontSize: '0.76rem', color: '#878787' }}>
              Official Flipkart branded packaging tier used for calculating courier volumetric weight.
            </span>
          </div>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2874f0', background: '#e8f0fe', padding: '4px 10px', borderRadius: '3px' }}>
            {settings.packagingBagType}
          </span>
        </div>
      </div>

      {/* 2. REAL-TIME ORDER ALERTS & NOTIFICATIONS */}
      <div className="setting-section-card">
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#212121', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={18} color="#2874f0" />
          Real-Time Order Alerts & Seller Notification Channels
        </h3>
        <p style={{ fontSize: '0.78rem', color: '#878787', margin: '0 0 16px 0' }}>
          Never miss an order with instant sound alerts, WhatsApp notifications, and inventory triggers.
        </p>

        {/* New Order Audio Chime */}
        <div className="setting-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Volume2 size={20} color="#2874f0" style={{ flexShrink: 0 }} />
            <div>
              <strong style={{ fontSize: '0.88rem', color: '#212121', display: 'block' }}>
                New Order Audio Chime Alert
              </strong>
              <span style={{ fontSize: '0.76rem', color: '#878787' }}>
                Play a distinctive notification bell on the vendor workstation whenever a customer places an order.
              </span>
            </div>
          </div>
          <button
            type="button"
            className="toggle-switch-btn"
            onClick={() => handleToggle('newOrderSoundAlert')}
          >
            {settings.newOrderSoundAlert ? (
              <ToggleRight size={38} color="#2874f0" />
            ) : (
              <ToggleLeft size={38} color="#878787" />
            )}
          </button>
        </div>

        {/* WhatsApp Alerts */}
        <div className="setting-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MessageSquare size={20} color="#388e3c" style={{ flexShrink: 0 }} />
            <div>
              <strong style={{ fontSize: '0.88rem', color: '#212121', display: 'block' }}>
                WhatsApp Direct Order Notifications
              </strong>
              <span style={{ fontSize: '0.76rem', color: '#878787' }}>
                Send instant order summary, buyer pincode, and packing slip links to registered phone (+91 {user?.phone || '9876524680'}).
              </span>
            </div>
          </div>
          <button
            type="button"
            className="toggle-switch-btn"
            onClick={() => handleToggle('whatsappAlerts')}
          >
            {settings.whatsappAlerts ? (
              <ToggleRight size={38} color="#388e3c" />
            ) : (
              <ToggleLeft size={38} color="#878787" />
            )}
          </button>
        </div>

        {/* Low Stock Alert Threshold */}
        <div className="setting-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={20} color="#fb641b" style={{ flexShrink: 0 }} />
            <div>
              <strong style={{ fontSize: '0.88rem', color: '#212121', display: 'block' }}>
                Low Inventory Warning Threshold
              </strong>
              <span style={{ fontSize: '0.76rem', color: '#878787' }}>
                Trigger automatic red badges and restocking warnings in catalog when available inventory units drop below this limit.
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="number"
              min={1}
              max={100}
              value={settings.lowStockThreshold}
              onChange={(e) => setSettings({ ...settings, lowStockThreshold: Number(e.target.value) || 1 })}
              style={{
                width: '70px',
                padding: '6px 10px',
                borderRadius: '3px',
                border: '1px solid #dfe3e8',
                fontSize: '0.88rem',
                fontWeight: 800,
                textAlign: 'center',
              }}
            />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#878787' }}>Units remaining</span>
          </div>
        </div>

        {/* Daily Sales Digest */}
        <div className="setting-row">
          <div>
            <strong style={{ fontSize: '0.88rem', color: '#212121', display: 'block' }}>
              End-of-Day 9:00 PM Financial Digest Email
            </strong>
            <span style={{ fontSize: '0.76rem', color: '#878787' }}>
              Daily automated email with total gross sales, commission deductions, packed volume, and rolling settlement projection.
            </span>
          </div>
          <button
            type="button"
            className="toggle-switch-btn"
            onClick={() => handleToggle('dailyDigestEmail')}
          >
            {settings.dailyDigestEmail ? (
              <ToggleRight size={38} color="#2874f0" />
            ) : (
              <ToggleLeft size={38} color="#878787" />
            )}
          </button>
        </div>
      </div>

      {/* 3. GST INVOICING & TAX AUTOMATION */}
      <div className="setting-section-card">
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#212121', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={18} color="#2874f0" />
          GST Billing, Tax Invoices & Surcharge Preferences
        </h3>
        <p style={{ fontSize: '0.78rem', color: '#878787', margin: '0 0 16px 0' }}>
          Digital invoices generated for buyers adhere to Government of India GST and Section 194-O standards.
        </p>

        {/* Tax Inclusive Pricing */}
        <div className="setting-row">
          <div>
            <strong style={{ fontSize: '0.88rem', color: '#212121', display: 'block' }}>
              Tax-Inclusive Catalog Pricing
            </strong>
            <span style={{ fontSize: '0.76rem', color: '#878787' }}>
              Listed product prices on the marketplace already include applicable Handloom GST (5% / 12%).
            </span>
          </div>
          <button
            type="button"
            className="toggle-switch-btn"
            onClick={() => handleToggle('taxInclusive')}
          >
            {settings.taxInclusive ? (
              <ToggleRight size={38} color="#388e3c" />
            ) : (
              <ToggleLeft size={38} color="#878787" />
            )}
          </button>
        </div>

        {/* Custom Invoice Series Prefix */}
        <div className="setting-row">
          <div>
            <strong style={{ fontSize: '0.88rem', color: '#212121', display: 'block' }}>
              Official Tax Invoice Series Prefix
            </strong>
            <span style={{ fontSize: '0.76rem', color: '#878787' }}>
              Unique sequential identifier printed on customer tax invoices generated by your merchant store.
            </span>
          </div>
          <input
            type="text"
            value={settings.invoicePrefix}
            onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value.toUpperCase() })}
            style={{
              padding: '6px 12px',
              borderRadius: '3px',
              border: '1px solid #dfe3e8',
              fontSize: '0.84rem',
              fontWeight: 800,
              fontFamily: 'monospace',
              maxWidth: '220px',
            }}
          />
        </div>
      </div>

      {/* 4. CUSTOMER RETURN & RTO POLICIES */}
      <div className="setting-section-card">
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#212121', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RotateCcw size={18} color="#2874f0" />
          Customer Returns & RTO Restocking Rules
        </h3>
        <p style={{ fontSize: '0.78rem', color: '#878787', margin: '0 0 16px 0' }}>
          Define window for customer doorstep returns and reverse courier handover procedures.
        </p>

        {/* Return Window */}
        <div className="setting-row">
          <div>
            <strong style={{ fontSize: '0.88rem', color: '#212121', display: 'block' }}>
              Customer Return Eligibility Window
            </strong>
            <span style={{ fontSize: '0.76rem', color: '#878787' }}>
              Number of days from delivery date during which buyers may request a return or size exchange.
            </span>
          </div>
          <select
            value={settings.returnWindowDays}
            onChange={(e) => setSettings({ ...settings, returnWindowDays: Number(e.target.value) })}
            style={{
              padding: '7px 12px',
              borderRadius: '3px',
              border: '1px solid #dfe3e8',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: '#212121',
              background: '#f9fbfd',
              cursor: 'pointer',
            }}
          >
            <option value={7}>7 Days Easy Return (Flipkart Standard Policy)</option>
            <option value={10}>10 Days Extended Return Window</option>
            <option value={14}>14 Days Premium Handloom Privilege</option>
          </select>
        </div>

        {/* Auto Accept RTO */}
        <div className="setting-row">
          <div>
            <strong style={{ fontSize: '0.88rem', color: '#212121', display: 'block' }}>
              Automated RTO (Return to Origin) Inbound Acceptance
            </strong>
            <span style={{ fontSize: '0.76rem', color: '#878787' }}>
              Automatically log undelivered RTO packages upon arrival at your Indore hub for quality audit before restocking.
            </span>
          </div>
          <button
            type="button"
            className="toggle-switch-btn"
            onClick={() => handleToggle('autoAcceptReturns')}
          >
            {settings.autoAcceptReturns ? (
              <ToggleRight size={38} color="#2874f0" />
            ) : (
              <ToggleLeft size={38} color="#878787" />
            )}
          </button>
        </div>
      </div>

      {/* 5. VACATION / HOLIDAY MODE */}
      <div
        className="setting-section-card"
        style={{
          border: settings.vacationMode ? '1.5px solid #dc2626' : '1px solid #dfe3e8',
          background: settings.vacationMode ? '#fef2f2' : '#ffffff',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: settings.vacationMode ? '#991b1b' : '#212121', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Store size={18} color={settings.vacationMode ? '#dc2626' : '#2874f0'} />
              Temporary Store Vacation / Holiday Mode
            </h3>
            <p style={{ fontSize: '0.78rem', color: settings.vacationMode ? '#b91c1c' : '#878787', margin: 0, maxWidth: '600px' }}>
              Enable this when your workshop is closed for festivals, inventory audits, or holidays. Your products will be temporarily paused on marketplace search so dispatch SLA is not impacted.
            </p>
          </div>

          <button
            type="button"
            className="toggle-switch-btn"
            onClick={() => handleToggle('vacationMode')}
          >
            {settings.vacationMode ? (
              <ToggleRight size={44} color="#dc2626" />
            ) : (
              <ToggleLeft size={44} color="#878787" />
            )}
          </button>
        </div>
      </div>

      {/* Bottom Save Action */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="fk-btn-primary"
          style={{ background: savedRecently ? '#388e3c' : '#fb641b', padding: '11px 26px', fontSize: '0.88rem' }}
        >
          {savedRecently ? <Check size={18} /> : <Save size={18} />}
          <span>{isSaving ? 'Saving Changes...' : savedRecently ? 'Settings Saved Successfully!' : 'Save All Settings'}</span>
        </button>
      </div>
    </div>
  );
};

export default VendorStoreSettings;
