'use client';

import React from 'react';
import { Sparkles, List, QrCode } from 'lucide-react';

/**
 * FloatingActionDock
 * ─────────────────────────────────────────────────────────────────────────────
 * Apple Glassmorphism bottom dock (Golden Rules #57, #58, #64 & #69).
 * Uses backdrop-filter: blur(24px) saturate(190%), specular edge highlights,
 * monochromatic secondary buttons with semantic hover, and ≥44px touch targets.
 * Supports page-outline Sections trigger on both desktop and mobile.
 */
export default function FloatingActionDock({
  summaryTitle = '',
  summarySubtitle = '',
  badge = null,
  showAtlasAi = true,
  atlasAiLabel = 'Ask Atlas AI',
  onOpenAtlasAi = null,
  showQr = true,
  qrLabel = 'QR',
  onOpenQr = null,
  sectionsAction = null, // { label, countLabel?, onClick }
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

  const handleQr = () => {
    if (onOpenQr) {
      onOpenQr();
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-global-qr-modal'));
    }
  };

  return (
    <div className="no-print atlas-glass-dock">
      {/* Left: Contextual Summary */}
      <div className="atlas-glass-dock__meta">
        <div className="atlas-glass-dock__title-row">
          {badge && <span className="atlas-glass-dock__badge">{badge}</span>}
          {summaryTitle && <div className="atlas-glass-dock__title">{summaryTitle}</div>}
        </div>
        {summarySubtitle && <div className="atlas-glass-dock__sub">{summarySubtitle}</div>}
      </div>

      {/* Right: Actions (≥44px touch target height) */}
      <div className="atlas-glass-dock__actions">
        {sectionsAction && (
          <button
            type="button"
            onClick={sectionsAction.onClick}
            className="gcp-btn-secondary atlas-glass-dock__sec atlas-glass-dock__sections"
            aria-label={sectionsAction.label || 'Sections'}
            title={sectionsAction.label || 'Sections'}
          >
            <List size={16} />
            <span className="atlas-glass-dock__sections-text">{sectionsAction.label || 'Sections'}</span>
            {sectionsAction.countLabel && (
              <span className="atlas-glass-dock__count-pill">{sectionsAction.countLabel}</span>
            )}
          </button>
        )}

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

        {showQr && (
          <button
            type="button"
            onClick={handleQr}
            className="gcp-btn-secondary atlas-glass-dock__sec atlas-glass-dock__qr"
            aria-label={qrLabel}
            title={qrLabel}
          >
            <QrCode size={16} />
            <span className="atlas-glass-dock__qr-text">{qrLabel}</span>
          </button>
        )}

        {showAtlasAi && (
          <button
            type="button"
            onClick={handleAi}
            className="gcp-btn-secondary atlas-glass-dock__sec atlas-glass-dock__ai"
            aria-label={atlasAiLabel}
            title={atlasAiLabel}
          >
            <Sparkles size={16} />
            <span className="atlas-glass-dock__ai-text">{atlasAiLabel}</span>
            <span className="atlas-glass-dock__ai-short" aria-hidden="true">AI</span>
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
          flex-wrap: nowrap;
          gap: 0.75rem;
        }
        .atlas-glass-dock__meta {
          min-width: 0;
          padding-left: 0.25rem;
          flex: 1 1 auto;
          overflow: hidden;
        }
        .atlas-glass-dock__title-row {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          flex-wrap: wrap;
        }
        .atlas-glass-dock__badge {
          display: inline-flex;
          align-items: center;
          padding: 2px 7px;
          border-radius: 9999px;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          background: #f0fdf4;
          color: #16a34a;
          border: 1px solid #bbf7d0;
          white-space: nowrap;
        }
        .atlas-glass-dock__title {
          font-size: 0.86rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.01em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }
        .atlas-glass-dock__sub {
          font-size: 0.75rem;
          font-weight: 600;
          color: #0284c7;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .atlas-glass-dock__count-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 1px 6px;
          border-radius: 9999px;
          background: rgba(15, 23, 42, 0.07);
          color: #334155;
          font-size: 0.72rem;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }
        .atlas-glass-dock__actions {
          display: flex;
          align-items: center;
          flex-wrap: nowrap;
          flex: 0 0 auto;
          gap: 0.45rem;
        }
        .atlas-glass-dock :global(.atlas-glass-dock__sec) {
          width: auto !important;
          flex: 0 0 auto !important;
          white-space: nowrap !important;
          min-height: 40px;
          padding: 0 0.9rem;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.92);
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
          width: auto !important;
          flex: 0 0 auto !important;
          white-space: nowrap !important;
          min-height: 40px;
          padding: 0 1.15rem;
          border-radius: 9999px;
          background: linear-gradient(180deg, #1a73e8 0%, #1557b0 100%);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.25),
            0 2px 6px rgba(26, 115, 232, 0.35);
          font-weight: 700;
        }
        .atlas-glass-dock__ai-short {
          display: none;
        }
        @media (max-width: 768px) {
          .atlas-glass-dock {
            bottom: 0;
            margin: 1rem 0 0;
            width: 100%;
            border-radius: 16px 16px 0 0;
            border: none;
            border-top: 1px solid #e2e8f0;
            outline: none;
            background: rgba(255, 255, 255, 0.98);
            box-shadow: 0 -4px 20px rgba(15, 23, 42, 0.08);
            padding: 0.5rem 0.75rem calc(0.5rem + env(safe-area-inset-bottom, 0px));
            flex-wrap: nowrap;
            gap: 0.4rem;
          }
          .atlas-glass-dock__meta {
            display: none;
          }
          .atlas-glass-dock__actions {
            width: 100%;
            flex-wrap: nowrap;
            justify-content: flex-start;
            align-items: center;
            gap: 0.4rem;
          }
          .atlas-glass-dock :global(.atlas-glass-dock__sec) {
            width: auto !important;
            flex: 0 0 auto;
            min-width: 44px;
            min-height: 44px;
            padding: 0 0.65rem;
            font-size: 0.78rem;
            white-space: nowrap;
          }
          .atlas-glass-dock__sections-text,
          .atlas-glass-dock__qr-text,
          .atlas-glass-dock__ai-text {
            display: none;
          }
          .atlas-glass-dock__ai-short {
            display: inline;
          }
          .atlas-glass-dock :global(.atlas-glass-dock__pri) {
            width: auto !important;
            flex: 1 1 auto;
            min-width: 0;
            min-height: 44px;
            padding: 0 0.9rem;
            font-size: 0.82rem;
            justify-content: center;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      `}</style>
    </div>
  );
}
