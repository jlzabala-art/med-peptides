'use client';

import React, { useState } from 'react';
import { Check, Copy, Download, MessageCircle, Sparkles } from 'lucide-react';

/**
 * ActionBar
 * ─────────────────────────────────────────────────────────────────────────────
 * Enforces Golden Rules #40, #57 & #64:
 *   [Share] → [Export] → [Copy Link] → [Ask Atlas AI] → [Primary CTA] → [Destructive]
 *
 * Uses `gcp-btn-primary`, `gcp-btn-secondary`, and `gcp-btn-danger` with
 * monochromatic idle state (#5f6368) and semantic hover accents only.
 */
export default function ActionBar({
  onShare = null,
  shareLabel = 'Share',
  onExport = null,
  exportLabel = 'Export',
  copyUrl = null,
  copyLabel = 'Copy Link',
  showAtlasAi = true,
  atlasAiLabel = 'Atlas AI',
  onOpenAtlasAi = null,
  primaryAction = null, // { label, onClick, icon?, disabled?, loading? }
  secondaryActions = [], // [{ label, onClick, icon?, title? }]
  destructiveAction = null, // { label, onClick, icon? }
  compact = false,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const target = copyUrl || (typeof window !== 'undefined' ? window.location.href : '');
    if (!target || typeof navigator === 'undefined') return;
    try {
      await navigator.clipboard.writeText(target);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  const handleAi = () => {
    if (onOpenAtlasAi) {
      onOpenAtlasAi();
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-public-atlas-ai'));
      window.dispatchEvent(new CustomEvent('open-atlas-ai'));
    }
  };

  return (
    <div className={`atlas-action-bar ${compact ? 'is-compact' : ''}`}>
      {secondaryActions.map((act, idx) => (
        <button
          key={act.label || idx}
          type="button"
          onClick={act.onClick}
          title={act.title || act.label}
          className="gcp-btn-secondary atlas-ab-btn"
        >
          {act.icon}
          <span>{act.label}</span>
        </button>
      ))}

      {onShare && (
        <button
          type="button"
          onClick={onShare}
          className="gcp-btn-secondary atlas-ab-btn atlas-ab-share"
        >
          <MessageCircle size={14} />
          <span>{shareLabel}</span>
        </button>
      )}

      {onExport && (
        <button
          type="button"
          onClick={onExport}
          className="gcp-btn-secondary atlas-ab-btn"
        >
          <Download size={14} />
          <span>{exportLabel}</span>
        </button>
      )}

      {copyUrl !== false && (
        <button
          type="button"
          onClick={handleCopy}
          className="gcp-btn-secondary atlas-ab-btn"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? 'Copied' : copyLabel}</span>
        </button>
      )}

      {showAtlasAi && (
        <button
          type="button"
          onClick={handleAi}
          className="gcp-btn-secondary atlas-ab-btn atlas-ab-ai"
        >
          <Sparkles size={14} />
          <span>{atlasAiLabel}</span>
        </button>
      )}

      {primaryAction && (
        <button
          type="button"
          disabled={primaryAction.disabled || primaryAction.loading}
          onClick={primaryAction.onClick}
          className="gcp-btn-primary atlas-ab-btn"
        >
          {primaryAction.icon}
          <span>{primaryAction.loading ? 'Working...' : primaryAction.label}</span>
        </button>
      )}

      {destructiveAction && (
        <button
          type="button"
          onClick={destructiveAction.onClick}
          className="gcp-btn-danger atlas-ab-btn"
          style={{ marginLeft: 'auto' }}
        >
          {destructiveAction.icon}
          <span>{destructiveAction.label}</span>
        </button>
      )}

      <style jsx>{`
        .atlas-action-bar {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .atlas-ab-btn {
          min-height: 38px;
          padding: 0.45rem 0.85rem;
          font-size: 0.82rem;
          font-weight: 600;
        }
        .atlas-action-bar.is-compact .atlas-ab-btn {
          min-height: 34px;
          padding: 0.35rem 0.7rem;
          font-size: 0.78rem;
        }
        .atlas-action-bar :global(.gcp-btn-secondary) {
          background-color: #ffffff;
          border-color: #dadce0;
          color: #5f6368;
        }
        .atlas-action-bar :global(.gcp-btn-secondary:hover:not(:disabled)) {
          background-color: #f8fafc;
          color: #0f172a;
          border-color: #cbd5e1;
        }
        .atlas-action-bar :global(.atlas-ab-share:hover:not(:disabled)) {
          color: #15803d;
          border-color: #86efac;
          background-color: #f0fdf4;
        }
        .atlas-action-bar :global(.atlas-ab-ai:hover:not(:disabled)) {
          color: #4f46e5;
          border-color: #c7d2fe;
          background-color: #eef2ff;
        }
      `}</style>
    </div>
  );
}
