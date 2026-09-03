import React from 'react';
import { X, CheckSquare } from 'lucide-react';
import { createPortal } from 'react-dom';

export default function MobileBulkActionBar({ selectedCount, actions, onCancel }) {
  if (typeof window === 'undefined') return null;

  return createPortal(
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'white',
      borderTop: '1px solid var(--border-color)',
      padding: '0.75rem 1rem',
      paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))',
      boxShadow: '0 -4px 12px rgba(0,0,0,0.08)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      animation: 'slideUp 0.2s ease-out'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', fontWeight: 600 }}>
          <CheckSquare size={18} />
          <span>{selectedCount} selected</span>
        </div>
        <button 
          onClick={onCancel}
          style={{ 
            background: 'none', border: 'none', color: 'var(--text-secondary)', 
            display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', fontWeight: 500 
          }}
        >
          Cancel <X size={16} />
        </button>
      </div>
      
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem', margin: '0 -0.5rem', padding: '0 0.5rem' }} className="hide-scrollbar">
        {actions.map((action, idx) => (
          <button
            key={idx}
            onClick={action.onClick}
            disabled={selectedCount === 0 && !action.alwaysActive}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              border: `1px solid ${action.variant === 'danger' ? '#fca5a5' : 'var(--border-color)'}`,
              background: action.variant === 'danger' ? '#fef2f2' : 'white',
              color: action.variant === 'danger' ? '#dc2626' : 'var(--text-primary)',
              fontSize: '0.85rem',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              flexShrink: 0,
              opacity: (selectedCount === 0 && !action.alwaysActive) ? 0.5 : 1
            }}
          >
            {action.icon}
            <span>{action.label}</span>
          </button>
        ))}
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>,
    document.body
  );
}
