'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * FloatingActionDock
 * ─────────────────────────────────────────────────────────────────────────────
 * Apple Glassmorphism bottom dock for public detail, catalog, and checkout views.
 * Enforces ≥44px touch targets and consistent Left (Context) / Right (AI + CTA) slots.
 */
export default function FloatingActionDock({
  summaryTitle = '',
  summarySubtitle = '',
  showAtlasAi = true,
  atlasAiLabel = 'Ask Atlas AI',
  onOpenAtlasAi = null,
  primaryAction = null, // { label, onClick, icon?, disabled? }
  secondaryAction = null, // { label, onClick, icon? }
}) {
  const handleAi = () => {
    if (onOpenAtlasAi) {
      onOpenAtlasAi();
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-public-atlas-ai'));
    }
  };

  return (
    <div
      className="no-print"
      style={{
        position: 'sticky',
        bottom: '0.75rem',
        zIndex: 40,
        margin: '1.5rem auto 0',
        maxWidth: '1120px',
        width: 'calc(100% - 1.5rem)',
        background: 'rgba(255, 255, 255, 0.86)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: '1px solid rgba(203, 213, 225, 0.85)',
        borderRadius: '16px',
        padding: '0.65rem 1rem',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}
    >
      {/* Left: Contextual Summary */}
      <div style={{ minWidth: 0 }}>
        {summaryTitle && (
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
            {summaryTitle}
          </div>
        )}
        {summarySubtitle && (
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {summarySubtitle}
          </div>
        )}
      </div>

      {/* Right: Actions (≥44px touch target height) */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        {secondaryAction && (
          <button
            type="button"
            onClick={secondaryAction.onClick}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              minHeight: '44px',
              padding: '0 0.95rem',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#0f172a',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {secondaryAction.icon}
            <span>{secondaryAction.label}</span>
          </button>
        )}

        {showAtlasAi && (
          <button
            type="button"
            onClick={handleAi}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              minHeight: '44px',
              padding: '0 0.95rem',
              borderRadius: '10px',
              border: '1px solid #c7d2fe',
              background: '#eef2ff',
              color: '#3730a3',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Sparkles size={15} />
            <span>{atlasAiLabel}</span>
          </button>
        )}

        {primaryAction && (
          <button
            type="button"
            disabled={primaryAction.disabled}
            onClick={primaryAction.onClick}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              minHeight: '44px',
              padding: '0 1.15rem',
              borderRadius: '10px',
              border: 'none',
              background: 'var(--color-primary, #003666)',
              color: '#ffffff',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              opacity: primaryAction.disabled ? 0.6 : 1,
            }}
          >
            {primaryAction.icon}
            <span>{primaryAction.label}</span>
          </button>
        )}
      </div>
    </div>
  );
}
