import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="container" style={wrapper}>
      <AlertTriangle size={64} color="#f59e0b" />
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', marginTop: '16px' }}>
        404 - Page Not Found
      </h1>
      <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '420px', marginTop: '8px' }}>
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link to="/" className="btn btn-primary btn-lg" style={{ marginTop: '24px' }}>
        <Home size={18} /> Back to Homepage
      </Link>
    </div>
  );
};

const wrapper = {
  padding: '100px 16px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
};

export default NotFoundPage;
