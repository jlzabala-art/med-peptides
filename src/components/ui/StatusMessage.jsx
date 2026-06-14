import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import React from 'react';



import './ui.css';

export default function StatusMessage({ 
  status = 'loading', // 'loading', 'success', 'error'
  message, 
  onDismiss 
}) {
  const getIcon = () => {
    switch (status) {
      case 'loading': return <Loader2 size={16} className="spin" color="var(--color-primary)" />;
      case 'success': return <CheckCircle size={16} color="var(--color-success)" />;
      case 'error': return <AlertCircle size={16} color="var(--color-danger)" />;
      default: return null;
    }
  };

  return (
    <div 
      className="fade-in"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        backgroundColor: 'var(--color-bg-hover)',
        borderRadius: '6px',
        border: '1px solid var(--border)',
        fontSize: '13px',
        color: 'var(--text-main)',
        marginBottom: '16px'
      }}
      role="status"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {getIcon()}
        <span>{message}</span>
      </div>
      {onDismiss && (
        <button 
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '12px',
            textDecoration: 'underline'
          }}
        >
          Dismiss
        </button>
      )}
    </div>
  );
}