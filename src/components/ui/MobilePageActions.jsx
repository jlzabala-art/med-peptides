"use client";
/**
 * MobilePageActions
 * Universal mobile header action bar: [ Primary CTA ] [ ••• ]
 *
 * The overflow dropdown is Portal-rendered to avoid stacking context
 * clipping from position:sticky + z-index on PageHeader.
 *
 * Usage:
 *   <MobilePageActions
 *     primaryAction={{ label: '+ Create', icon: PlusCircle, onClick: handleCreate }}
 *     overflowActions={[
 *       { label: 'Export', icon: Download, onClick: handleExport },
 *       { label: 'View Draft Order', icon: ShoppingCart, onClick: handleCart, badge: cartCount },
 *     ]}
 *     badgeCount={cartCount}
 *   />
 *
 * CSS classes used:
 *   .catalog-actions-mobile-only  — visibility toggle (mobile only)
 *   .catalog-actions-desktop-only — visibility toggle (desktop only, renders nothing)
 *   .mobile-catalog-actions-row   — flex row container
 *   .mobile-catalog-primary-btn   — primary CTA button
 *   .mobile-catalog-overflow-btn  — ••• trigger button
 *   .mobile-catalog-overflow-dot  — notification dot on ••• button
 * All defined in src/styles/mobile.css
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal, X } from '@/lib/icons';

export default function MobilePageActions({
  primaryAction,
  overflowActions = [],
  badgeCount = 0,
}) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const triggerRef = useRef(null);

  const openMenu = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + window.scrollY + 6,
        right: window.innerWidth - rect.right,
      });
    }
    setOpen(true);
  }, []);

  const closeMenu = useCallback(() => setOpen(false), []);

  /* Escape key */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') closeMenu(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, closeMenu]);

  const PrimaryIcon = primaryAction?.icon;

  if (!primaryAction && overflowActions.length === 0) {
    return null;
  }

  return (
    <>
      {/* Mobile: primary + overflow row */}
      <div className="catalog-actions-mobile-only">
        <div className="mobile-catalog-actions-row">
          {primaryAction ? (
            <button
              className="mobile-catalog-primary-btn"
              onClick={primaryAction.onClick}
            >
              {PrimaryIcon && <PrimaryIcon size={18} />}
              {primaryAction.label}
            </button>
          ) : (
            <div style={{ flex: 1 }} />
          )}

          {overflowActions.length > 0 && (
            <button
              ref={triggerRef}
              className="mobile-catalog-overflow-btn"
              onClick={openMenu}
              aria-label="More actions"
              aria-haspopup="menu"
              aria-expanded={open}
            >
              <MoreHorizontal size={20} />
              {badgeCount > 0 && (
                <span
                  className="mobile-catalog-overflow-dot"
                  aria-label={`${badgeCount} items`}
                />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Desktop: intentionally empty — caller renders desktop actions separately */}
      <span className="catalog-actions-desktop-only" style={{ display: 'none' }} />

      {/* Portal-rendered dropdown — escapes all stacking contexts */}
      {open && typeof window !== 'undefined' && createPortal(
        <>
          {/* Transparent backdrop to close on outside tap */}
          <div
            onClick={closeMenu}
            style={{ position: 'fixed', inset: 0, zIndex: 1000 }}
            aria-hidden="true"
          />

          {/* Dropdown menu */}
          <div
            role="menu"
            aria-label="Secondary actions"
            style={{
              position: 'absolute',
              top: menuPos.top,
              right: menuPos.right,
              minWidth: 220,
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
              zIndex: 1001,
              overflow: 'hidden',
              animation: 'mpaMenuIn 0.15s cubic-bezier(0.32,0.72,0,1)',
            }}
          >
            {/* Header row */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.75rem 1rem 0.5rem',
              borderBottom: '1px solid #f1f5f9',
            }}>
              <span style={{
                fontSize: '0.75rem', fontWeight: 700, color: '#64748b',
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                Actions
              </span>
              <button
                onClick={closeMenu}
                aria-label="Close menu"
                style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: 'none', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#94a3b8',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Action rows */}
            {overflowActions.map((action, i) => {
              const Icon = action.icon;
              return (
                <button
                  key={i}
                  role="menuitem"
                  onClick={() => { action.onClick?.(); closeMenu(); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    width: '100%', minHeight: 50, padding: '0 1.25rem',
                    background: 'none', border: 'none',
                    borderBottom: i < overflowActions.length - 1 ? '1px solid #f8fafc' : 'none',
                    cursor: 'pointer', fontSize: '0.88rem', fontWeight: 500,
                    color: action.variant === 'danger' ? '#dc2626' : '#1e293b',
                    textAlign: 'left',
                    WebkitTapHighlightColor: 'transparent',
                    transition: 'background 0.1s ease',
                  }}
                  onTouchStart={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
                  onTouchEnd={(e) => { e.currentTarget.style.background = 'none'; }}
                >
                  {Icon && (
                    <Icon
                      size={18}
                      style={{
                        flexShrink: 0,
                        color: action.variant === 'danger' ? '#dc2626' : '#64748b',
                      }}
                    />
                  )}
                  <span style={{ flex: 1 }}>{action.label}</span>
                  {action.badge != null && action.badge > 0 && (
                    <span style={{
                      flexShrink: 0,
                      background: 'var(--color-primary, #003666)',
                      color: 'white',
                      fontSize: '0.65rem', fontWeight: 700,
                      minWidth: 20, height: 20, borderRadius: 10,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      padding: '0 5px',
                    }}>
                      {action.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <style>{`
            @keyframes mpaMenuIn {
              from { opacity: 0; transform: translateY(-6px) scale(0.97) }
              to   { opacity: 1; transform: translateY(0)    scale(1)    }
            }
          `}</style>
        </>,
        document.body
      )}
    </>
  );
}
