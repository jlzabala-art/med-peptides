'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Copy, Check } from '@/lib/icons';
import toast from 'react-hot-toast';

/**
 * CopyActionButton — Unified GCP Clipboard Action Button
 * ─────────────────────────────────────────────────────────────────────────────
 * Replaces ad-hoc navigator.clipboard.writeText + setCopied + toast.success
 * boilerplate across the platform with a single accessible, monochrome button.
 */
export default function CopyActionButton({
  text,
  getText,
  label = 'Copy',
  copiedLabel = 'Copied ✓',
  toastMessage = 'Copied to clipboard ✓',
  errorMessage = 'Could not copy to clipboard',
  variant = 'secondary', // 'secondary' | 'primary'
  size = 'sm', // 'sm' | 'md'
  resetMs = 2400,
  className = '',
  style = {},
  title,
  ariaLabel,
  onCopied,
}) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const handleCopy = async (e) => {
    if (e) e.stopPropagation();
    const payload = typeof getText === 'function' ? getText() : text;
    if (!payload) return;
    try {
      await navigator.clipboard.writeText(String(payload));
      setCopied(true);
      if (toastMessage) toast.success(toastMessage);
      if (typeof onCopied === 'function') onCopied(payload);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), resetMs);
    } catch {
      if (errorMessage) toast.error(errorMessage);
    }
  };

  const baseClass = variant === 'primary' ? 'gcp-btn-primary' : 'gcp-btn-secondary';
  const sizeStyle =
    size === 'md'
      ? { padding: '7px 12px', fontSize: '0.78rem', fontWeight: 600 }
      : { padding: '6px 11px', minHeight: '36px', fontSize: '0.74rem', fontWeight: 700 };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`${baseClass} ${className}`.trim()}
      aria-label={ariaLabel || label}
      title={title || label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        whiteSpace: 'nowrap',
        ...sizeStyle,
        ...style,
      }}
    >
      {copied ? <Check size={13} color={variant === 'primary' ? '#ffffff' : '#16a34a'} /> : <Copy size={13} />}
      <span>{copied ? copiedLabel : label}</span>
    </button>
  );
}
