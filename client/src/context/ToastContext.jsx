import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((msg) => addToast(msg, 'success'), [addToast]);
  const error = useCallback((msg) => addToast(msg, 'error'), [addToast]);
  const info = useCallback((msg) => addToast(msg, 'info'), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, success, error, info, removeToast }}>
      {children}
      <div style={toastContainerStyle}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              ...toastItemStyle,
              borderLeft: `4px solid ${
                toast.type === 'success'
                  ? '#10b981'
                  : toast.type === 'error'
                  ? '#ef4444'
                  : '#3b82f6'
              }`,
            }}
            className="animate-slide-up"
          >
            {toast.type === 'success' && <CheckCircle2 size={20} color="#10b981" />}
            {toast.type === 'error' && <AlertCircle size={20} color="#ef4444" />}
            {toast.type === 'info' && <Info size={20} color="#3b82f6" />}
            <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: 500 }}>
              {toast.message}
            </span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{ color: '#94a3b8', padding: 2 }}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

const toastContainerStyle = {
  position: 'fixed',
  bottom: '24px',
  right: '24px',
  zIndex: 9999,
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  maxWidth: '380px',
  width: 'calc(100% - 48px)',
  pointerEvents: 'none',
};

const toastItemStyle = {
  background: '#ffffff',
  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)',
  borderRadius: '8px',
  padding: '12px 16px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  color: '#0f172a',
  pointerEvents: 'auto',
};
