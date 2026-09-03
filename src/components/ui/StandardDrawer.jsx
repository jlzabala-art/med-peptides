"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from '@/lib/icons';

/**
 * StandardDrawer
 *
 * A universal side-drawer component for detail views and edit forms across all portals.
 * Replaces heavy modals and page jumps.
 *
 * @param {boolean} isOpen - Whether the drawer is visible
 * @param {function} onClose - Function to call when closing
 * @param {string} title - Header title
 * @param {string} subtitle - Optional header subtitle
 * @param {node} children - Drawer content
 * @param {node} footer - Optional footer actions
 * @param {string} width - Drawer width (default '500px')
 */
export default function StandardDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  actions,
  width = '500px',
  bodyPadding = '1.5rem',
  fullWorkspace = false,
  hideHeader = false,
  zIndex = 9999,
}) {
  const bodyRef = React.useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when open and reset drawer scroll to top
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (bodyRef.current) {
        bodyRef.current.scrollTop = 0;
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, title]);

  // Handle Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const drawerContent = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: zIndex, // Support customized modal layering
        display: 'flex',
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(2px)',
        animation: 'drawerFadeIn 0.2s ease-out',
      }}
    >
      {/* Backdrop click layer */}
      <div style={{ position: 'absolute', inset: 0 }} onClick={onClose} />

      {/* Drawer Panel */}
      <div
        className={`standard-drawer-panel ${fullWorkspace ? 'drawer-full-workspace' : ''}`}
        style={{
          position: 'relative',
          width: fullWorkspace ? undefined : width,
          maxWidth: '100%',
          height: '100%',
          maxHeight: '100vh',
          backgroundColor: 'var(--background, #fff)',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          overscrollBehavior: 'contain',
        }}
      >
        {/* Mobile Drag Indicator Handle */}
        <div className="drawer-mobile-handle" style={{
          display: 'none',
          width: '36px',
          height: '4px',
          backgroundColor: 'rgba(0, 0, 0, 0.18)',
          borderRadius: '2px',
          margin: '10px auto 0 auto',
        }} />

        {/* Header */}
        {!hideHeader && (
          <div
            style={{
            padding: '1.25rem 1.5rem 1rem 1.5rem',
            borderBottom: '1px solid var(--border-color, #e5e7eb)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'var(--color-text, #111)',
                lineHeight: '1.4',
              }}
            >
              {title}
            </h2>
            {subtitle && (
              <div
                style={{
                  margin: '0.25rem 0 0 0',
                  fontSize: '0.875rem',
                  color: 'var(--color-text-tertiary, #666)',
                  lineHeight: '1.4',
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {actions && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>{actions}</div>
            )}
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                margin: '-0.5rem',
                color: 'var(--color-text-secondary, #444)',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = 'var(--bg-hover, #f3f4f6)')
              }
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <X size={18} />
            </button>
          </div>
        </div>
        )}

        {/* Body */}
        <div
          ref={bodyRef}
          className="drawer-condensed-layout"
          style={{
            flex: 1,
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            padding: bodyPadding,
            backgroundColor: 'var(--color-bg-app, #f9fafb)',
          }}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            style={{
              padding: '1rem 1.5rem calc(1rem + env(safe-area-inset-bottom, 8px)) 1.5rem',
              borderTop: '1px solid var(--border-color, #e5e7eb)',
              backgroundColor: 'var(--bg-secondary, #fafafa)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
            }}
          >
            {footer}
          </div>
        )}
      </div>

      <style>{`
        @keyframes drawerFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes drawerSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .drawer-full-workspace {
          width: calc(100vw - 260px);
        }
        .standard-drawer-panel {
          height: 100vh;
          animation: drawerSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @media (max-width: 768px) {
          .drawer-mobile-handle {
            display: block !important;
          }
          .drawer-full-workspace {
            width: 100vw;
          }
          .standard-drawer-panel {
            width: 100vw !important;
            height: 100vh !important;
            margin-top: 0;
            border-radius: 0;
            animation: drawerSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }
        }
        @keyframes bottomSheetSlideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(drawerContent, document.body) : drawerContent;
}
