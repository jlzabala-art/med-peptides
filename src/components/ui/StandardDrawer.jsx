"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Maximize2, Minimize2 } from '@/lib/icons';

/**
 * StandardDrawer
 *
 * Universal adaptive drawer component tailored for Laptop (Side-over slide) 
 * and Mobile (Bottom Sheet modal).
 *
 * @param {boolean} isOpen - Whether the drawer is visible
 * @param {function} onClose - Function to call when closing
 * @param {string} title - Header title
 * @param {string} subtitle - Optional header subtitle
 * @param {node} children - Drawer content
 * @param {node} footer - Optional footer actions
 * @param {string} width - Drawer width (default 'clamp(480px, 52vw, 760px)')
 * @param {boolean} expandable - Allow expanding width on desktop/laptop
 */
export default function StandardDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  actions,
  width = 'clamp(480px, 52vw, 760px)',
  bodyPadding = '1.5rem',
  fullWorkspace = false,
  expandable = true,
  hideHeader = false,
  zIndex = 9999,
}) {
  const bodyRef = React.useRef(null);
  const [mounted, setMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset expansion when drawer closes or changes
  useEffect(() => {
    if (!isOpen) setIsExpanded(false);
  }, [isOpen]);

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

  const resolvedWidth = fullWorkspace
    ? undefined
    : isExpanded
      ? 'min(1360px, 95vw)'
      : width;

  const drawerContent = (
    <div
      className="standard-drawer-backdrop"
      style={{
        zIndex: zIndex,
      }}
    >
      {/* Backdrop click layer */}
      <div style={{ position: 'absolute', inset: 0 }} onClick={onClose} />

      {/* Drawer Panel */}
      <div
        className={`standard-drawer-panel ${fullWorkspace ? 'drawer-full-workspace' : ''}`}
        style={{
          position: 'relative',
          width: fullWorkspace ? undefined : resolvedWidth,
          maxWidth: '100%',
          backgroundColor: 'var(--background, #fff)',
          boxShadow: '-4px 0 28px rgba(0, 0, 0, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          overscrollBehavior: 'contain',
        }}
      >
        {/* Mobile Grabber Handle (for Bottom Sheet) */}
        <div className="drawer-mobile-handle" />

        {/* Header */}
        {!hideHeader && (
          <div
            style={{
              padding: '1.15rem 1.5rem 1rem 1.5rem',
              borderBottom: '1px solid var(--border-color, #e5e7eb)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--background, #fff)',
              zIndex: 2,
            }}
          >
            <div style={{ flex: 1, minWidth: 0, paddingRight: '0.75rem' }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: 'var(--color-text, #0f172a)',
                  lineHeight: '1.3',
                  letterSpacing: '-0.01em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={typeof title === 'string' ? title : undefined}
              >
                {title}
              </h2>
              {subtitle && (
                <div
                  style={{
                    margin: '0.2rem 0 0 0',
                    fontSize: '0.8rem',
                    color: 'var(--color-text-tertiary, #64748b)',
                    lineHeight: '1.3',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {subtitle}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
              {actions && (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>{actions}</div>
              )}

              {/* Laptop width expand/contract toggle */}
              {expandable && !fullWorkspace && (
                <button
                  type="button"
                  className="drawer-expand-btn"
                  onClick={() => setIsExpanded(prev => !prev)}
                  title={isExpanded ? "Collapse to side drawer" : "Expand width (Wide view)"}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.45rem',
                    color: 'var(--color-text-secondary, #64748b)',
                    borderRadius: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover, #f1f5f9)')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
              )}

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close drawer"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.45rem',
                  color: 'var(--color-text-secondary, #64748b)',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover, #fee2e2)', e.currentTarget.style.color = '#ef4444')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = 'var(--color-text-secondary, #64748b)')}
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
            backgroundColor: 'var(--color-bg-app, #f8fafc)',
          }}
        >
          {children}
        </div>

        {/* Sticky Footer */}
        {footer && (
          <div
            className="standard-drawer-footer"
            style={{
              padding: '0.85rem 1.5rem',
              borderTop: '1px solid var(--border-color, #e2e8f0)',
              backgroundColor: 'var(--bg-secondary, #ffffff)',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '0.75rem',
              zIndex: 2,
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
        @keyframes bottomSheetSlideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        /* ── Laptop / Desktop layout: Side-Over Drawer ── */
        .standard-drawer-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100vw;
          height: 100vh;
          display: flex;
          justify-content: flex-end;
          align-items: stretch;
          background-color: rgba(15, 23, 42, 0.35);
          backdrop-filter: blur(2px);
          animation: drawerFadeIn 0.2s ease-out;
        }
        .drawer-full-workspace {
          width: calc(100vw - 260px);
        }
        .standard-drawer-panel {
          height: 100vh;
          transition: width 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          animation: drawerSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .drawer-mobile-handle {
          display: none;
        }

        /* ── Mobile layout: Native Bottom Sheet ── */
        @media (max-width: 768px) {
          .standard-drawer-backdrop {
            align-items: flex-end !important;
            justify-content: center !important;
          }
          .drawer-expand-btn {
            display: none !important;
          }
          .drawer-mobile-handle {
            display: block !important;
            width: 44px;
            height: 5px;
            background-color: #cbd5e1;
            border-radius: 3px;
            margin: 10px auto 4px auto;
            flex-shrink: 0;
          }
          .drawer-full-workspace {
            width: 100vw !important;
          }
          .standard-drawer-panel {
            width: 100vw !important;
            max-width: 100vw !important;
            height: auto !important;
            max-height: 92vh !important;
            border-radius: 20px 20px 0 0 !important;
            box-shadow: 0 -8px 36px rgba(0, 0, 0, 0.22) !important;
            animation: bottomSheetSlideUp 0.32s cubic-bezier(0.16, 1, 0.3, 1) !important;
          }
          .standard-drawer-footer {
            padding-bottom: calc(1rem + env(safe-area-inset-bottom, 16px)) !important;
          }
        }
      `}</style>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(drawerContent, document.body) : drawerContent;
}
