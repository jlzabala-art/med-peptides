'use client';

import React, { useMemo } from 'react';
import { generateBarcode128Svg } from '@/utils/pharmaBarcode';
import { ShieldCheck } from 'lucide-react';

export default function PharmaBarcodeStamp({
  batchCode = 'RP-AT-260914-120-0',
  label = 'OFFICIAL LOT / BATCH VERIFICATION',
  theme = 'dark', // 'dark' (for blue executive card) | 'light' (for white cards)
  width = 210,
  height = 28
}) {
  const isDark = theme === 'dark';
  const barColor = isDark ? '#ffffff' : '#002244';

  const barcodeSvg = useMemo(() => {
    return generateBarcode128Svg(batchCode, {
      width,
      height,
      color: barColor,
      bgColor: 'transparent'
    });
  }, [batchCode, barColor, width, height]);

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '8px 12px 6px 12px',
        borderRadius: '10px',
        background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(241, 245, 249, 0.9)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #e2e8f0',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        maxWidth: '100%',
        marginTop: '6px',
      }}
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
          color: isDark ? '#7dd3fc' : '#0284c7',
          textTransform: 'uppercase',
          marginBottom: '5px',
        }}
      >
        <ShieldCheck size={11} />
        <span>{label}</span>
      </div>

      {/* Barcode SVG */}
      <div
        dangerouslySetInnerHTML={{ __html: barcodeSvg }}
        style={{
          display: 'flex',
          justifyContent: 'center',
          opacity: isDark ? 0.95 : 0.85,
        }}
      />

      {/* Human-Readable Batch Code */}
      <div
        style={{
          fontSize: '0.72rem',
          fontWeight: 800,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          letterSpacing: '0.12em',
          color: isDark ? '#ffffff' : '#002244',
          marginTop: '3px',
        }}
      >
        {batchCode}
      </div>
    </div>
  );
}
