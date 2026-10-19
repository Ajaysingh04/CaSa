import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CASA UI Runtime Crash caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.href = '/';
  };

  handleReset = () => {
    localStorage.removeItem('casa_user');
    localStorage.removeItem('casa_token');
    sessionStorage.clear();
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={containerStyle}>
          <div style={cardStyle}>
            <div style={iconBadgeStyle}>⚠️</div>
            <h1 style={headingStyle}>Something went wrong</h1>
            <p style={subheadingStyle}>
              An unexpected display error occurred while rendering the page. Don't worry, your data is safe.
            </p>

            {this.state.error && (
              <div style={errorDetailsBox}>
                <code>{this.state.error.toString()}</code>
              </div>
            )}

            <div style={buttonGroupStyle}>
              <button onClick={this.handleReload} style={primaryBtnStyle}>
                Reload Application
              </button>
              <button onClick={this.handleReset} style={secondaryBtnStyle}>
                Clear Cache & Restart
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const containerStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#f8fafc',
  padding: '24px',
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const cardStyle = {
  maxWidth: '520px',
  width: '100%',
  background: '#ffffff',
  borderRadius: '20px',
  boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.1)',
  border: '1px solid #e2e8f0',
  padding: '40px 32px',
  textAlign: 'center',
};

const iconBadgeStyle = {
  fontSize: '2.5rem',
  marginBottom: '16px',
};

const headingStyle = {
  fontSize: '1.5rem',
  fontWeight: 800,
  color: '#0f172a',
  margin: '0 0 10px',
};

const subheadingStyle = {
  fontSize: '0.9rem',
  color: '#64748b',
  lineHeight: 1.5,
  margin: '0 0 20px',
};

const errorDetailsBox = {
  background: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '10px',
  padding: '12px 16px',
  color: '#b91c1c',
  fontSize: '0.8rem',
  textAlign: 'left',
  overflowX: 'auto',
  marginBottom: '24px',
  fontFamily: 'monospace',
};

const buttonGroupStyle = {
  display: 'flex',
  gap: '12px',
  justifyContent: 'center',
  flexWrap: 'wrap',
};

const primaryBtnStyle = {
  background: '#2563eb',
  color: '#ffffff',
  border: 'none',
  padding: '12px 24px',
  borderRadius: '10px',
  fontWeight: 700,
  fontSize: '0.9rem',
  cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
};

const secondaryBtnStyle = {
  background: '#f1f5f9',
  color: '#475569',
  border: '1px solid #cbd5e1',
  padding: '12px 20px',
  borderRadius: '10px',
  fontWeight: 600,
  fontSize: '0.9rem',
  cursor: 'pointer',
};

export default ErrorBoundary;
