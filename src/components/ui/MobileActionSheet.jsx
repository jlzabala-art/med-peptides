"use client";
/**
 * MobileActionSheet
 * Portal-rendered bottom sheet for mobile action menus.
 * Shared across all panels — catalog cards, bulk selection, overflow menus.
 *
 * Props:
 *   isOpen   : boolean
 *   onClose  : () => void
 *   title    : string
 *   items    : [{ label, icon?: IconComponent, onClick, variant?: 'default'|'danger', badge?: number }]
 */

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function MobileActionSheet({ isOpen, onClose, title, items = [] }) {
  /* Lock body scroll while open */
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('mobile-sheet-open');
    return () => { 
      document.body.style.overflow = prev; 
      document.body.classList.remove('mobile-sheet-open');
    };
  }, [isOpen]);

  /* Escape key */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen || typeof window === 'undefined') return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.40)',
          zIndex: 900,
          animation: 'masBackdropIn 0.2s ease',
        }}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Actions'}
        style={{
          position: 'fixed',
          bottom: 0, left: 0, right: 0,
          background: '#ffffff',
          borderRadius: '20px 20px 0 0',
          zIndex: 901,
          maxHeight: '85vh',
          overflowY: 'auto',
          animation: 'masSheetIn 0.25s cubic-bezier(0.32,0.72,0,1)',
          boxShadow: '0 -8px 32px rgba(0,0,0,0.14)',
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)',
        }}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#d1d5db' }} />
        </div>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.5rem 1.25rem 0.75rem',
          borderBottom: '1px solid #f1f5f9',
        }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>
            {title}
          </span>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: '#f1f5f9', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#64748b',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Items */}
        <div style={{ padding: '0.375rem 0' }}>
          {items.map((item, i) => {
            const Icon = item.icon;
            const isDanger = item.variant === 'danger';
            return (
              <button
                key={i}
                onClick={() => { item.onClick?.(); onClose(); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.875rem',
                  width: '100%', minHeight: 52,
                  padding: '0 1.25rem',
                  background: 'none', border: 'none',
                  borderBottom: i < items.length - 1 ? '1px solid #f8fafc' : 'none',
                  cursor: 'pointer', textAlign: 'left',
                  color: isDanger ? '#dc2626' : '#1e293b',
                  fontSize: '0.9rem', fontWeight: 500,
                  WebkitTapHighlightColor: 'transparent',
                  transition: 'background 0.1s ease',
                }}
                onTouchStart={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
                onTouchEnd={(e) => { e.currentTarget.style.background = 'none'; }}
              >
                {Icon && (
                  <Icon
                    size={20}
                    style={{ flexShrink: 0, color: isDanger ? '#dc2626' : '#64748b' }}
                  />
                )}
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge != null && item.badge > 0 && (
                  <span style={{
                    flexShrink: 0,
                    background: 'var(--color-primary, #003666)',
                    color: 'white',
                    fontSize: '0.65rem', fontWeight: 700,
                    minWidth: 20, height: 20, borderRadius: 10,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 5px',
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes masBackdropIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes masSheetIn     { from { transform: translateY(100%) } to { transform: translateY(0) } }
      `}</style>
    </>,
    document.body
  );
}
