'use client';

import React, { useEffect } from 'react';
import { X, List } from '@/lib/icons';

/**
 * UnifiedMobileSidebarDrawer
 * ─────────────────────────────────────────────────────────────────────────────
 * Standard GCP off-canvas mobile drawer shell shared by public, clinical,
 * protocol, pricing, and filter sidebars (<= 1024px).
 */
export default function UnifiedMobileSidebarDrawer({
  isOpen = false,
  onClose,
  title = 'Navigation & Filters',
  icon = null,
  headerContent = null,
  children,
}) {
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return undefined;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="gcp-sb-drawer-backdrop"
      onClick={() => onClose?.()}
    >
      <div
        className="gcp-sb-drawer-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="gcp-sb-drawer-header">
          {headerContent ? (
            headerContent
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <span style={{ color: '#5f6368', display: 'inline-flex', flexShrink: 0 }}>
                {icon || <List size={16} />}
              </span>
              <h4
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#202124',
                  margin: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {title}
              </h4>
            </div>
          )}

          <button
            type="button"
            onClick={() => onClose?.()}
            aria-label="Close navigation drawer"
            className="gcp-sb-drawer-close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="gcp-sb-drawer-body">{children}</div>
      </div>
    </div>
  );
}
