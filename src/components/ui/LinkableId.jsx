"use client";

import React, { useState } from 'react';
import { Copy, Check, ExternalLink } from '@/lib/icons';
import { useRouter } from 'next/navigation';

/**
 * LinkableId
 * ─────────────────────────────────────────────────────────────────────────────
 * GCP-inspired component to display IDs that can be copied with a single click,
 * and also links directly to the detailed view of the resource.
 * Combines Golden Rule #11 (Copyable) with Cross-Navigation UX.
 */
export default function LinkableId({ value, displayValue = null, href = null, onClick = null, iconOnly = false }) {
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  if (!value) return <span style={{ color: 'var(--text-muted)' }}>—</span>;

  const handleCopy = (e) => {
    e.stopPropagation();
    e.preventDefault();
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNavigate = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (onClick) {
      onClick(e);
    } else if (href) {
      router.push(href);
    }
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        fontFamily: 'monospace',
        fontSize: '0.8rem',
        color: (href || onClick) ? 'var(--color-primary, #3b82f6)' : 'var(--text-secondary, #475569)',
        cursor: (href || onClick) ? 'pointer' : 'default',
        padding: iconOnly ? '4px' : '2px 6px',
        borderRadius: '4px',
        border: '1px solid transparent',
        transition: 'all 0.15s ease',
      }}
      onClick={(href || onClick) ? handleNavigate : undefined}
      title={(href || onClick) ? `Go to resource (${value})` : value}
      onMouseEnter={(e) => {
        if (href || onClick) {
          e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle, #f1f5f9)';
          e.currentTarget.style.borderColor = 'var(--border, #e2e8f0)';
        }
      }}
      onMouseLeave={(e) => {
        if (href || onClick) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.borderColor = 'transparent';
        }
      }}
    >
      {!iconOnly && <span style={{ textDecoration: (href || onClick) ? 'underline' : 'none', textUnderlineOffset: '2px' }}>{displayValue || (value.length > 8 ? value.substring(0, 8) + '...' : value)}</span>}
      
      {/* Action Icons Wrapper */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        {/* Copy Button */}
        <div 
          onClick={handleCopy}
          title="Copy ID to clipboard"
          style={{ 
            cursor: 'copy', 
            padding: '2px', 
            borderRadius: '3px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => {
             e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)';
          }}
          onMouseLeave={(e) => {
             e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {copied ? (
            <Check size={iconOnly ? 14 : 12} color="#10b981" />
          ) : (
            <Copy size={iconOnly ? 14 : 12} style={{ opacity: 0.6 }} />
          )}
        </div>

        {/* Link Button (if href or onClick is provided) */}
        {(href || onClick) && (
          <div 
            title="Open in new context"
            style={{ 
              cursor: 'pointer', 
              padding: '2px', 
              borderRadius: '3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ExternalLink size={iconOnly ? 14 : 12} style={{ opacity: 0.8 }} />
          </div>
        )}
      </div>
    </div>
  );
}
