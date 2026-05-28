import React from 'react';
import { X } from 'lucide-react';
import '../../styles/gcp-theme.css';

export default function GcpModal({ isOpen, onClose, title, children, maxWidth = '600px' }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(32,33,36,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div className="gcp-card" style={{ 
        width: '100%', 
        maxWidth, 
        backgroundColor: '#fff',
        display: 'flex', 
        flexDirection: 'column',
        maxHeight: '90vh',
        boxShadow: '0 24px 38px 3px rgba(0,0,0,0.14), 0 9px 46px 8px rgba(0,0,0,0.12), 0 11px 15px -7px rgba(0,0,0,0.2)'
      }}>
        {title && (
          <div className="gcp-header">
            {title}
            <button onClick={onClose} style={{ 
              background: 'none', border: 'none', cursor: 'pointer', 
              color: 'var(--gcp-text-muted)', display: 'flex', alignItems: 'center' 
            }}>
              <X size={20} />
            </button>
          </div>
        )}
        <div style={{ padding: '1.25rem', overflowY: 'auto' }}>
          {children}
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
