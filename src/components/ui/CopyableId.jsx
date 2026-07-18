import React, { useState } from 'react';
import { Copy, Check } from '@/lib/icons';

/**
 * CopyableId
 * ─────────────────────────────────────────────────────────────────────────────
 * GCP-inspired component to display IDs that can be copied with a single click.
 * Golden Rule #11.
 */
export default function CopyableId({ value, displayValue = null }) {
  const [copied, setCopied] = useState(false);

  if (!value) return <span style={{ color: 'var(--text-muted)' }}>—</span>;

  const handleCopy = (e) => {
    e.stopPropagation();
    e.preventDefault();
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={handleCopy}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        fontFamily: 'monospace',
        fontSize: '0.8rem',
        color: 'var(--text-secondary, #475569)',
        cursor: 'pointer',
        padding: '2px 6px',
        borderRadius: '4px',
        border: '1px solid transparent',
        transition: 'all 0.15s ease',
      }}
      title="Copy to clipboard"
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle, #f1f5f9)';
        e.currentTarget.style.borderColor = 'var(--border, #e2e8f0)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.borderColor = 'transparent';
      }}
    >
      <span>{displayValue || (value.length > 8 ? value.substring(0, 8) + '...' : value)}</span>
      {copied ? (
        <Check size={12} color="#10b981" />
      ) : (
        <Copy size={12} style={{ opacity: 0.6 }} />
      )}
    </div>
  );
}
