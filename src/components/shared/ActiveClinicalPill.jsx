'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Calculator, X } from 'lucide-react';
import { useActiveClinicalStore } from '@/stores/useActiveClinicalStore';

/**
 * ActiveClinicalPill
 * ─────────────────────────────────────────────────────────────────────────────
 * Compact cross-app context pill shown in the global header when an operator
 * has an active prescription/patient loaded, allowing 1-click SPA jumps between
 * Labels Studio, Rx View, and Dosing Calculator without losing context.
 */
export default function ActiveClinicalPill({ isSpanish = false }) {
  const pathname = usePathname() || '/';
  const {
    activeRxCode,
    patientName,
    clearActiveClinicalResource
  } = useActiveClinicalStore();

  if (!activeRxCode) return null;

  const isOnLabels = pathname.startsWith('/labels');
  const isOnCalculator = pathname.startsWith('/calculator');

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 8px',
        borderRadius: '999px',
        background: 'rgba(255, 255, 255, 0.12)',
        border: '1px solid rgba(255, 255, 255, 0.22)',
        color: '#ffffff',
        fontSize: '0.72rem',
        maxWidth: '340px',
        flexShrink: 1,
        overflow: 'hidden'
      }}
      title={`${activeRxCode}${patientName ? ` · ${patientName}` : ''}`}
    >
      <span
        style={{
          fontFamily: 'monospace',
          fontWeight: 800,
          color: '#93c5fd',
          whiteSpace: 'nowrap',
          flexShrink: 0
        }}
      >
        #{activeRxCode}
      </span>
      {patientName && (
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            opacity: 0.92,
            fontWeight: 600
          }}
        >
          {patientName}
        </span>
      )}
      {!isOnLabels && (
        <Link
          href={`/labels?rx=${encodeURIComponent(activeRxCode)}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            padding: '1px 6px',
            borderRadius: '999px',
            background: '#1a73e8',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.66rem',
            textDecoration: 'none',
            whiteSpace: 'nowrap'
          }}
          title={isSpanish ? 'Volver a Labels Studio con esta receta' : 'Jump to Labels Studio with this Rx'}
        >
          <FileText size={10} />
          <span>Labels</span>
        </Link>
      )}
      {!isOnCalculator && (
        <Link
          href="/calculator"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            padding: '1px 6px',
            borderRadius: '999px',
            background: 'rgba(255,255,255,0.16)',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.66rem',
            textDecoration: 'none',
            whiteSpace: 'nowrap'
          }}
          title={isSpanish ? 'Abrir Calculadora de Reconstitución' : 'Open Reconstitution Calculator'}
        >
          <Calculator size={10} />
          <span>Calc</span>
        </Link>
      )}
      <button
        type="button"
        onClick={clearActiveClinicalResource}
        aria-label={isSpanish ? 'Limpiar contexto activo' : 'Clear active clinical context'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          border: 'none',
          color: 'rgba(255,255,255,0.7)',
          cursor: 'pointer',
          padding: '1px',
          lineHeight: 1
        }}
      >
        <X size={11} />
      </button>
    </div>
  );
}
