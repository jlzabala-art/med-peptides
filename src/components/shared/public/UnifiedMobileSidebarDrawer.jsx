'use client';

import React, { useEffect } from 'react';
import { X, List } from 'lucide-react';

/**
 * UnifiedMobileSidebarDrawer
 * ─────────────────────────────────────────────────────────────────────────────
 * Standard off-canvas mobile drawer shell for all public sidebars & filters
 * (/p/*, /proto/*, /c/*, /collection/*, /lab/*, /dr/*).
 * Ensures identical backdrop, sticky header, ≥44px close button, and Escape key handling.
 */
export default function UnifiedMobileSidebarDrawer({
  isOpen = false,
  onClose,
  title = 'Sections & Navigation',
  icon = null,
  accentColor = '#003666',
  children,
}) {
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return undefined;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={() => onClose?.()}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.58)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-start',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '86%',
          maxWidth: '360px',
          height: '100%',
          background: 'var(--atlas-surface, #ffffff)',
          boxShadow: '4px 0 28px rgba(15, 23, 42, 0.18)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.85rem 1rem',
            borderBottom: '1px solid var(--atlas-border, #e2e8f0)',
            position: 'sticky',
            top: 0,
            background: 'var(--atlas-surface, #ffffff)',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            {icon || <List size={16} color={accentColor} />}
            <h4
              style={{
                fontSize: '0.9rem',
                fontWeight: 800,
                color: '#0f172a',
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {title}
            </h4>
          </div>

          <button
            type="button"
            onClick={() => onClose?.()}
            aria-label="Close navigation drawer"
            style={{
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              minWidth: '44px',
              minHeight: '44px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '1rem', flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}
