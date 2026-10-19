import React from 'react';
import { Sparkles, Truck, ShieldCheck } from 'lucide-react';

const AnnouncementBar = () => {
  return (
    <div style={announcementStyle}>
      <style>{`
        .announcement-features-group {
          display: none;
          align-items: center;
          gap: 16px;
          color: #94a3b8;
        }
        @media (min-width: 900px) {
          .announcement-features-group {
            display: flex;
          }
        }
      `}</style>
      <div className="container" style={innerStyle}>
        <div style={badgeGroup}>
          <span style={pillStyle}>
            <Sparkles size={13} style={{ color: '#fbbf24' }} />
            <span>FESTIVAL SALE IS LIVE</span>
          </span>
          <span style={textStyle}>
            Get up to 70% Off + Flat ₹200 OFF with code <strong style={{ color: '#fbbf24' }}>CASA200</strong>
          </span>
        </div>
        <div className="announcement-features-group">
          <span style={featureItem}>
            <Truck size={14} /> Free Express Delivery Over ₹499
          </span>
          <span style={featureItem}>
            <ShieldCheck size={14} /> 100% Authentic Guarantee
          </span>
        </div>
      </div>
    </div>
  );
};

const announcementStyle = {
  background: '#0a192f',
  color: '#e2e8f0',
  fontSize: '0.8rem',
  padding: '6px 0',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
};

const innerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '8px',
};

const badgeGroup = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  flexWrap: 'wrap',
};

const pillStyle = {
  background: 'rgba(245, 158, 11, 0.2)',
  color: '#fbbf24',
  padding: '2px 8px',
  borderRadius: '9999px',
  fontWeight: '700',
  fontSize: '0.72rem',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  letterSpacing: '0.04em',
};

const textStyle = {
  color: '#cbd5e1',
};


const featureItem = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
};

export default AnnouncementBar;
