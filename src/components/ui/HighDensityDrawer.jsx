"use client";

import React, { useEffect } from 'react';

/**
 * HighDensityDrawer
 *
 * An advanced, wide drawer designed for data-heavy views (Dashboards, Master-Detail, Hubs).
 * It maximizes screen real estate and ensures no horizontal scrolling issues occur.
 * Automatically adapts to mobile by becoming a full-screen sheet.
 *
 * @param {boolean} isOpen - Whether the drawer is visible
 * @param {function} onClose - Function to call when closing
 * @param {node} children - Drawer content
 * @param {string} width - Desktop width (default: '1200px' or 'calc(100vw - 280px)')
 */
export default function HighDensityDrawer({
  isOpen,
  onClose,
  children,
  width = 'min(1200px, calc(100vw - 280px))',
}) {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(3px)',
        animation: 'hdFadeIn 0.2s ease-out',
      }}
    >
      {/* Backdrop click layer */}
      <div style={{ position: 'absolute', inset: 0 }} onClick={onClose} />

      {/* Drawer Panel */}
      <div
        className="hd-drawer-panel"
        style={{
          position: 'relative',
          width: width,
          maxWidth: '100vw',
          backgroundColor: 'var(--bg-app, #f8fafc)',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </div>
      </div>

      <style>{`
        @keyframes hdFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes hdSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .hd-drawer-panel {
          animation: hdSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @media (max-width: 1024px) {
          .hd-drawer-panel {
            width: 90vw !important;
          }
        }
        @media (max-width: 768px) {
          .hd-drawer-panel {
            width: 100vw !important;
            height: 100vh !important;
          }
        }
      `}</style>
    </div>
  );
}
