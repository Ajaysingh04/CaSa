import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = ({ items = [] }) => {
  return (
    <nav style={breadcrumbNavStyle} aria-label="Breadcrumb">
      <Link to="/" style={breadcrumbLinkStyle}>
        <Home size={14} />
        <span>Home</span>
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={index}>
            <ChevronRight size={14} color="#94a3b8" />
            {isLast || !item.link ? (
              <span style={breadcrumbCurrentStyle}>{item.label}</span>
            ) : (
              <Link to={item.link} style={breadcrumbLinkStyle}>
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

const breadcrumbNavStyle = {
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '6px',
  padding: '12px 0',
  fontSize: '0.825rem',
  color: '#64748b',
};

const breadcrumbLinkStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  color: '#64748b',
  textDecoration: 'none',
  transition: 'color 0.15s',
};

const breadcrumbCurrentStyle = {
  color: '#0f172a',
  fontWeight: '600',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '280px',
};

export default Breadcrumbs;
