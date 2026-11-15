'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * FloatingActionDock
 * ─────────────────────────────────────────────────────────────────────────────
 * Apple Glassmorphism bottom dock (Golden Rules #57, #58 & #64).
 * Uses backdrop-filter: blur(24px) saturate(190%), specular edge highlights,
 * monochromatic secondary buttons with semantic hover, and ≥44px touch targets.
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
    <div className="no-print atlas-glass-dock">
      {/* Left: Contextual Summary */}
      <div className="atlas-glass-dock__meta">
        {summaryTitle && <div className="atlas-glass-dock__title">{summaryTitle}</div>}
        {summarySubtitle && <div className="atlas-glass-dock__sub">{summarySubtitle}</div>}
      </div>

      {/* Right: Actions (≥44px touch target height) */}
      <div className="atlas-glass-dock__actions">
        {secondaryAction && (
          <button
            type="button"
            onClick={secondaryAction.onClick}
            className="gcp-btn-secondary atlas-glass-dock__sec"
          >
            {secondaryAction.icon}
            <span>{secondaryAction.label}</span>
          </button>
        )}

        {showAtlasAi && (
          <button
            type="button"
            onClick={handleAi}
            className="gcp-btn-secondary atlas-glass-dock__sec atlas-glass-dock__ai"
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
            className="gcp-btn-primary atlas-glass-dock__pri"
          >
            {primaryAction.icon}
            <span>{primaryAction.label}</span>
          </button>
        )}
      </div>

      <style jsx>{`
        .atlas-glass-dock {
          position: sticky;
          bottom: 0.85rem;
          z-index: 40;
          margin: 1.5rem auto 0;
          max-width: 1120px;
          width: calc(100% - 1.5rem);
          background: rgba(255, 255, 255, 0.78);
          backdrop-filter: blur(24px) saturate(190%);
          -webkit-backdrop-filter: blur(24px) saturate(190%);
          border: 1px solid rgba(255, 255, 255, 0.85);
          outline: 1px solid rgba(203, 213, 225, 0.4);
          border-radius: 9999px;
          padding: 8px 16px;
          box-shadow:
            inset 0 1px 1px 0 rgba(255, 255, 255, 0.95),
            0 16px 36px -4px rgba(15, 23, 42, 0.12),
            0 4px 12px rgba(15, 23, 42, 0.05);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .atlas-glass-dock__meta {
          min-width: 0;
          padding-left: 0.25rem;
        }
        .atlas-glass-dock__title {
          font-size: 0.86rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.01em;
        }
        .atlas-glass-dock__sub {
          font-size: 0.75rem;
          font-weight: 600;
          color: #0284c7;
        }
        .atlas-glass-dock__actions {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .atlas-glass-dock :global(.atlas-glass-dock__sec) {
          min-height: 44px;
          padding: 0 0.95rem;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(203, 213, 225, 0.85);
          color: #5f6368;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
          font-weight: 600;
        }
        .atlas-glass-dock :global(.atlas-glass-dock__sec:hover) {
          color: #0f172a;
          background: #ffffff;
        }
        .atlas-glass-dock :global(.atlas-glass-dock__ai:hover) {
          color: #4f46e5;
          border-color: #c7d2fe;
          background: #eef2ff;
        }
        .atlas-glass-dock :global(.atlas-glass-dock__pri) {
          min-height: 44px;
          padding: 0 1.2rem;
          border-radius: 9999px;
          background: linear-gradient(180deg, #1a73e8 0%, #1557b0 100%);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.25),
            0 2px 6px rgba(26, 115, 232, 0.35);
          font-weight: 700;
        }
        @media (max-width: 768px) {
          .atlas-glass-dock {
            bottom: 0;
            width: 100%;
            border-radius: 20px 20px 0 0;
            border-top: 1px solid rgba(255, 255, 255, 0.9);
            background: rgba(255, 255, 255, 0.86);
            padding: 0.75rem 1rem calc(0.75rem + env(safe-area-inset-bottom, 0px));
          }
        }
      `}</style>
    </div>
  );
}
