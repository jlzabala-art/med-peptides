"use client";

import React, { useState } from 'react';
import { MoreHorizontal, X } from '@/lib/icons';
import { BottomSheet } from '../shared/BottomSheet';

/**
 * MobileActionsMenu
 *
 * On desktop (> 768px): renders all actions as a flat row of buttons.
 * On mobile (≤ 768px): renders the primary action prominently + a "⋯" button
 *   that opens a BottomSheet with all secondary actions.
 *
 * Usage:
 *   <MobileActionsMenu
 *     primaryAction={{ label: 'Create Product', icon: Plus, onClick: handleCreate, className: 'gcp-btn-primary' }}
 *     secondaryActions={[
 *       { label: 'Export', icon: Download, onClick: handleExport },
 *       { label: 'PDF Library', icon: BookOpen, onClick: openLibrary },
 *       { label: 'Draft Order', icon: ShoppingCart, onClick: openDraft, destructive: false },
 *     ]}
 *   />
 */
export default function MobileActionsMenu({
  primaryAction,
  secondaryActions = [],
  // For pages with no clear "primary", pass all actions as secondaryActions and this as null
  desktopActionsComponent = null,
}) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const PrimaryIcon = primaryAction?.icon;

  const handleSecondary = (action) => {
    setSheetOpen(false);
    // Small delay so sheet closes before action runs (avoids scroll lock conflicts)
    setTimeout(() => action.onClick?.(), 150);
  };

  return (
    <>
      {/* ── DESKTOP: flat button row ─────────────────────────────────────── */}
      {desktopActionsComponent ? (
        <div className="mobile-actions-desktop-only desktop-only">
          {desktopActionsComponent}
        </div>
      ) : (
        <div className="mobile-actions-desktop-only desktop-only" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {primaryAction && (
            <button
              className={primaryAction.className || 'gcp-btn-primary'}
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', minHeight: '36px', padding: '0 1rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.875rem', cursor: primaryAction.disabled ? 'not-allowed' : 'pointer' }}
            >
              {PrimaryIcon && <PrimaryIcon size={16} />}
              {primaryAction.label}
            </button>
          )}
          {secondaryActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <button
                key={i}
                className={action.className || 'gcp-btn-secondary'}
                onClick={action.onClick}
                disabled={action.disabled}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', minHeight: '36px', padding: '0 0.875rem', borderRadius: '8px', fontWeight: 500, fontSize: '0.82rem', cursor: action.disabled ? 'not-allowed' : 'pointer' }}
              >
                {Icon && <Icon size={15} />}
                {action.label}
              </button>
            );
          })}
        </div>
      )}

      {/* ── MOBILE: primary + overflow ───────────────────────────────────── */}
      <div className="mobile-actions-mobile-bar mobile-only--flex" style={{ gap: '0.5rem', alignItems: 'center', width: '100%' }}>
        {primaryAction && (
          <button
            className={primaryAction.className || 'gcp-btn-primary'}
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled}
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              minHeight: '44px',
              padding: '0 1rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: primaryAction.disabled ? 'not-allowed' : 'pointer',
            }}
          >
            {PrimaryIcon && <PrimaryIcon size={16} />}
            {primaryAction.label}
          </button>
        )}

        {secondaryActions.length > 0 && (
          <button
            aria-label="More actions"
            onClick={() => setSheetOpen(true)}
            style={{
              flexShrink: 0,
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--color-border, #e2e8f0)',
              borderRadius: '8px',
              background: 'var(--color-bg-surface, #fff)',
              cursor: 'pointer',
              color: 'var(--color-text-secondary, #64748b)',
            }}
          >
            <MoreHorizontal size={20} />
          </button>
        )}
      </div>

      {/* ── BottomSheet: secondary actions ──────────────────────────────── */}
      <BottomSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Actions"
      >
        <div style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}>
          {secondaryActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <button
                key={i}
                className={`mobile-action-sheet-item${action.destructive ? ' destructive' : ''}`}
                onClick={() => handleSecondary(action)}
                disabled={action.disabled}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  padding: '0.875rem 1rem',
                  borderBottom: i < secondaryActions.length - 1 ? '1px solid var(--color-border-subtle, #f1f5f9)' : 'none',
                  background: 'none',
                  border: 'none',
                  borderBottom: i < secondaryActions.length - 1 ? '1px solid var(--color-border-subtle, #f1f5f9)' : 'none',
                  cursor: action.disabled ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: action.destructive ? 'var(--color-danger, #dc2626)' : 'var(--color-text-main, #0f172a)',
                  textAlign: 'left',
                  minHeight: '52px',
                  opacity: action.disabled ? 0.5 : 1,
                }}
              >
                {Icon && (
                  <span style={{ color: action.destructive ? 'var(--color-danger, #dc2626)' : 'var(--color-primary, #003666)', flexShrink: 0 }}>
                    <Icon size={20} />
                  </span>
                )}
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      </BottomSheet>
    </>
  );
}
