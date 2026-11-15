'use client';

import React, { useState } from 'react';
import { Check, Copy, Download, MessageCircle, Sparkles } from 'lucide-react';

/**
 * ActionBar
 * ─────────────────────────────────────────────────────────────────────────────
 * Enforces the canonical button hierarchy & order across all public/portal views:
 *   [Share] → [Export] → [Copy Link] → [Ask Atlas AI] → [Primary CTA] → [Destructive]
 *
 * Guarantees at most ONE solid primary CTA and consistent 44px-friendly touch targets.
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

  const btnBase = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    minHeight: compact ? '34px' : '38px',
    padding: compact ? '0.35rem 0.7rem' : '0.45rem 0.85rem',
    borderRadius: '8px',
    fontSize: compact ? '0.78rem' : '0.82rem',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease',
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}
    >
      {secondaryActions.map((act, idx) => (
        <button
          key={act.label || idx}
          type="button"
          onClick={act.onClick}
          title={act.title || act.label}
          style={{
            ...btnBase,
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            color: '#334155',
          }}
        >
          {act.icon}
          <span>{act.label}</span>
        </button>
      ))}

      {onShare && (
        <button
          type="button"
          onClick={onShare}
          style={{
            ...btnBase,
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#15803d',
          }}
        >
          <MessageCircle size={14} />
          <span>{shareLabel}</span>
        </button>
      )}

      {onExport && (
        <button
          type="button"
          onClick={onExport}
          style={{
            ...btnBase,
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            color: '#0f172a',
          }}
        >
          <Download size={14} />
          <span>{exportLabel}</span>
        </button>
      )}

      {copyUrl !== false && (
        <button
          type="button"
          onClick={handleCopy}
          style={{
            ...btnBase,
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            color: copied ? '#15803d' : '#334155',
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? 'Copied' : copyLabel}</span>
        </button>
      )}

      {showAtlasAi && (
        <button
          type="button"
          onClick={handleAi}
          style={{
            ...btnBase,
            background: '#eef2ff',
            border: '1px solid #c7d2fe',
            color: '#3730a3',
          }}
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
          style={{
            ...btnBase,
            background: 'var(--color-primary, #003666)',
            border: '1px solid var(--color-primary, #003666)',
            color: '#ffffff',
            opacity: primaryAction.disabled || primaryAction.loading ? 0.65 : 1,
          }}
        >
          {primaryAction.icon}
          <span>{primaryAction.loading ? 'Working...' : primaryAction.label}</span>
        </button>
      )}

      {destructiveAction && (
        <button
          type="button"
          onClick={destructiveAction.onClick}
          style={{
            ...btnBase,
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            marginLeft: 'auto',
          }}
        >
          {destructiveAction.icon}
          <span>{destructiveAction.label}</span>
        </button>
      )}
    </div>
  );
}
