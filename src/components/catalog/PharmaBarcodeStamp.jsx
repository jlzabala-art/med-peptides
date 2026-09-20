'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { generateBarcode128Svg } from '@/utils/pharmaBarcode';
import { ShieldCheck, Copy, Check } from 'lucide-react';

/**
 * PharmaBarcodeStamp — Renders a pharma-grade barcode with the catalog ID.
 * Click-to-copy: clicking anywhere on the stamp copies the catalogCode to clipboard
 * and shows a brief "Copied ✓" toast (Regla #11: IDs are always copy-on-click).
 */
export default function PharmaBarcodeStamp({
  catalogCode = null,
  batchCode = null,
  code = 'RP-AT-260914-120-0',
  label = 'CATALOG ID VERIFICATION',
  theme = 'dark', // 'dark' (blue executive card) | 'light' (white cards)
  width = 210,
  height = 28
}) {
  const displayCode = catalogCode || batchCode || code;
  const isDark = theme === 'dark';
  const barColor = isDark ? '#ffffff' : '#002244';
  const [copied, setCopied] = useState(false);

  const barcodeSvg = useMemo(() => {
    return generateBarcode128Svg(displayCode, {
      width,
      height,
      color: barColor,
      bgColor: 'transparent'
    });
  }, [displayCode, barColor, width, height]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(displayCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for insecure contexts
      const ta = document.createElement('textarea');
      ta.value = displayCode;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [displayCode]);

  return (
    <div
      onClick={handleCopy}
      title={copied ? 'Copied!' : `Click to copy catalog ID: ${displayCode}`}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '8px 12px 6px 12px',
        borderRadius: '10px',
        background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(241, 245, 249, 0.9)',
        border: isDark
          ? `1px solid ${copied ? 'rgba(134,239,172,0.5)' : 'rgba(255,255,255,0.15)'}`
          : `1px solid ${copied ? '#86efac' : '#e2e8f0'}`,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        maxWidth: '100%',
        marginTop: '6px',
        cursor: 'pointer',
        transition: 'border-color 0.2s ease, transform 0.1s ease',
        userSelect: 'none',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {/* Top Label */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '0.62rem',
          fontWeight: 700,
          letterSpacing: '0.06em',
          color: copied
            ? (isDark ? '#86efac' : '#16a34a')
            : (isDark ? '#7dd3fc' : '#0284c7'),
          textTransform: 'uppercase',
          marginBottom: '5px',
          transition: 'color 0.2s ease',
        }}
      >
        {copied ? <Check size={11} /> : <ShieldCheck size={11} />}
        <span>{copied ? 'Copied to clipboard ✓' : label}</span>
      </div>

      {/* Barcode SVG */}
      <div
        dangerouslySetInnerHTML={{ __html: barcodeSvg }}
        style={{
          display: 'flex',
          justifyContent: 'center',
          opacity: isDark ? 0.95 : 0.85,
          transition: 'opacity 0.2s ease',
        }}
      />

      {/* Human-Readable Catalog ID Code with copy icon */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          fontSize: '0.72rem',
          fontWeight: 800,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          letterSpacing: '0.12em',
          color: copied
            ? (isDark ? '#86efac' : '#16a34a')
            : (isDark ? '#ffffff' : '#002244'),
          marginTop: '3px',
          transition: 'color 0.2s ease',
        }}
      >
        <span>{displayCode}</span>
        {!copied && (
          <Copy
            size={9}
            style={{ opacity: 0.5, flexShrink: 0 }}
          />
        )}
      </div>
    </div>
  );
}
