import React, { useState } from 'react';
import { Headphones, Laptop, ShieldCheck, Tag, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const FloatingDock = () => {
  const [activeTooltip, setActiveTooltip] = useState(null);

  const dockItems = [
    {
      id: 'support',
      icon: Headphones,
      label: '24/7 Support',
      sub: 'Chat with an expert',
      link: '/contact',
      color: '#3b82f6',
    },
    {
      id: 'gadgets',
      icon: Laptop,
      label: 'Electronics',
      sub: 'Latest tech & deals',
      link: '/category/electronics',
      color: '#6366f1',
    },
    {
      id: 'warranty',
      icon: ShieldCheck,
      label: 'CASA Guarantee',
      sub: '100% Genuine & Verified',
      link: '/products',
      color: '#10b981',
    },
    {
      id: 'coupons',
      icon: Tag,
      label: 'Active Offers',
      sub: 'Code: CASA200, FESTIVE15',
      link: '/products?bestseller=true',
      color: '#f59e0b',
    },
  ];

  return (
    <aside
      style={dockContainerStyle}
      aria-label="Quick Action Dock"
      className="floating-dock-desktop"
    >
      <div style={dockCardStyle}>
        {dockItems.map((item) => {
          const Icon = item.icon;
          const isHovered = activeTooltip === item.id;

          return (
            <div
              key={item.id}
              style={{ position: 'relative' }}
              onMouseEnter={() => setActiveTooltip(item.id)}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              <Link
                to={item.link}
                style={{
                  ...dockBtnStyle,
                  borderColor: isHovered ? item.color : '#e2e8f0',
                  color: isHovered ? item.color : '#475569',
                  background: isHovered ? '#eff6ff' : '#ffffff',
                  transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                }}
                title={item.label}
              >
                <Icon size={19} />
              </Link>

              {/* Floating Tooltip Bubble */}
              {isHovered && (
                <div style={tooltipStyle} className="animate-fade-in">
                  <strong style={{ fontSize: '0.8rem', color: '#0f172a', display: 'block' }}>
                    {item.label}
                  </strong>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    {item.sub}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};

const dockContainerStyle = {
  position: 'fixed',
  left: '20px',
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: 90,
  display: 'flex',
  flexDirection: 'column',
};

const dockCardStyle = {
  background: 'rgba(255, 255, 255, 0.92)',
  backdropFilter: 'blur(12px)',
  border: '1.5px solid rgba(226, 232, 240, 0.8)',
  boxShadow: '0 12px 28px -4px rgba(15, 23, 42, 0.12), 0 4px 10px -2px rgba(15, 23, 42, 0.05)',
  borderRadius: '24px',
  padding: '10px 8px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const dockBtnStyle = {
  width: '42px',
  height: '42px',
  borderRadius: '16px',
  border: '1.5px solid #e2e8f0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
};

const tooltipStyle = {
  position: 'absolute',
  left: '54px',
  top: '50%',
  transform: 'translateY(-50%)',
  background: '#ffffff',
  boxShadow: '0 10px 24px -3px rgba(15, 23, 42, 0.15)',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '6px 14px',
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
  zIndex: 100,
};

export default FloatingDock;
