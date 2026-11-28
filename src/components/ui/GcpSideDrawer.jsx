'use client';

import React, { useEffect, useState, useRef, useSyncExternalStore, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Maximize2, Minimize2 } from '@/lib/icons';
import StatusBadge from './StatusBadge';
import CopyableId from './CopyableId';

const emptySubscribe = () => () => {};
const getClientMounted = () => true;
const getServerMounted = () => false;

const SIZE_WIDTH_MAP = Object.freeze({
  sm: '420px',
  md: '560px',
  lg: '780px',
  xl: 'min(1200px, calc(100vw - 280px))',
  split: 'min(1320px, 94vw)',
});

/**
 * GcpSideDrawer — Canonical Pillar 3 Right-Side Drawer Archetype
 * ─────────────────────────────────────────────────────────────────────────────
 * Replaces fragmented drawer shells across Admin & Public portals with a single
 * portal-backed, accessible, keyboard-trapped, responsive side sheet.
 */
export default function GcpSideDrawer({
  isOpen = false,
  onClose,
  title = '',
  subtitle = '',
  status = null,
  statusLabel = '',
  copyId = '',
  headerContent = null,
  children,
  footer = null,
  actions = null,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl' | 'split'
  width = null,
  bodyPadding = '1.35rem',
  fullWorkspace = false,
  expandable = true,
  hideHeader = false,
  disableBodyScroll = false,
  zIndex = 9999,
  preserveSidebar = false,
  className = '',
  ariaLabel = 'Panel',
}) {
  const bodyRef = useRef(null);
  const panelRef = useRef(null);
  const previousFocusRef = useRef(null);
  const mounted = useSyncExternalStore(emptySubscribe, getClientMounted, getServerMounted);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClose = useCallback(() => {
    setIsExpanded(false);
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      document.body.style.overflow = 'hidden';
      if (bodyRef.current) bodyRef.current.scrollTop = 0;
    } else {
      document.body.style.overflow = '';
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        try {
          previousFocusRef.current.focus();
        } catch {
          // ignore unmounted element focus errors
        }
        previousFocusRef.current = null;
      }
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, title]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        handleClose();
        return;
      }
      if (e.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen || !mounted) return null;

  const baseWidth = width || SIZE_WIDTH_MAP[size] || SIZE_WIDTH_MAP.md;
  const resolvedWidth = fullWorkspace
    ? undefined
    : isExpanded
      ? 'min(1360px, 95vw)'
      : baseWidth;

  const panelClasses = [
    'gcp-drawer-panel',
    fullWorkspace ? 'is-full-workspace' : '',
    size === 'xl' ? 'is-xl-preset' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const drawerNode = (
    <div
      className={`gcp-drawer-backdrop ${preserveSidebar ? 'preserve-sidebar' : ''}`}
      style={{ zIndex }}
    >
      <div className="gcp-drawer-backdrop-scrim" onClick={handleClose} />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' && title ? title : ariaLabel}
        className={panelClasses}
        style={{ width: resolvedWidth }}
      >
        {!hideHeader && (
          <div className="gcp-drawer-header">
            <div style={{ flex: 1, minWidth: 0, paddingRight: '0.5rem' }}>
              {headerContent || (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h2 className="gcp-drawer-title" title={typeof title === 'string' ? title : undefined}>
                      {title}
                    </h2>
                    {status && <StatusBadge status={status} customLabel={statusLabel || undefined} />}
                    {copyId && <CopyableId value={copyId} maxLength={18} />}
                  </div>
                  {subtitle && <div className="gcp-drawer-subtitle">{subtitle}</div>}
                </>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
              {actions && (
                <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>{actions}</div>
              )}

              {expandable && !fullWorkspace && (
                <button
                  type="button"
                  className="gcp-drawer-icon-btn gcp-drawer-expand-btn"
                  onClick={() => setIsExpanded((prev) => !prev)}
                  aria-label={isExpanded ? 'Collapse panel width' : 'Expand panel width'}
                  title={isExpanded ? 'Collapse to side drawer' : 'Expand width'}
                >
                  {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
              )}

              <button
                type="button"
                onClick={handleClose}
                className="gcp-drawer-icon-btn gcp-drawer-icon-btn--close"
                aria-label="Close drawer"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        <div
          ref={bodyRef}
          className="gcp-drawer-body drawer-condensed-layout"
          style={{
            overflowY: disableBodyScroll ? 'hidden' : 'auto',
            padding: disableBodyScroll ? 0 : bodyPadding,
            display: disableBodyScroll ? 'flex' : 'block',
            flexDirection: disableBodyScroll ? 'column' : undefined,
          }}
        >
          {children}
        </div>

        {footer && <div className="gcp-drawer-footer">{footer}</div>}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(drawerNode, document.body) : drawerNode;
}
