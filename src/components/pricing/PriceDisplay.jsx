'use client';

import React from 'react';
import { formatMoney } from '@/lib/pricing/pricingCore';

/**
 * PriceDisplay — Componente único de presentación de precios.
 *  - variant="table"   : celda tabular (Admin = 3 pills Coste / Wholeseller / Distribuitor; otros = 1 precio)
 *  - variant="card"    : bloque para fichas de producto (Admin = grid 3 columnas; otros = tarjeta única)
 *  - variant="compact" : versión resumida para listas/móvil
 */
export default function PriceDisplay({
  resolved,
  cost = null,
  wholeseller = null,
  distributor = null,
  primaryPrice = null,
  primaryLabel = '',
  currency = 'EUR',
  formatPrice = null,
  isAdmin = false,
  isEs = false,
  variant = 'table',
}) {
  const fmt = (val) => {
    if (val == null || Number.isNaN(Number(val)) || Number(val) <= 0) return '—';
    return typeof formatPrice === 'function'
      ? formatPrice(Number(val))
      : formatMoney(Number(val), currency);
  };

  const showTriple = Boolean(resolved?.showTriple ?? isAdmin);
  const cVal = resolved?.cost ?? cost;
  const wVal = resolved?.wholeseller ?? wholeseller;
  const dVal = resolved?.distributor ?? distributor;
  const pVal = resolved?.primaryPrice ?? primaryPrice ?? wVal;
  const pLabel = resolved?.primaryLabel ?? primaryLabel;

  if (showTriple) {
    const tiers = [
      {
        key: 'cost',
        label: isEs ? 'Coste' : 'Cost',
        value: fmt(cVal),
        color: '#475569',
        bg: '#f8fafc',
        border: '#e2e8f0',
      },
      {
        key: 'wholeseller',
        label: 'Wholeseller',
        value: fmt(wVal),
        color: '#c2410c',
        bg: '#fff7ed',
        border: '#fed7aa',
      },
      {
        key: 'distributor',
        label: isEs ? 'Distribuitor' : 'Distributor',
        value: fmt(dVal),
        color: '#1d4ed8',
        bg: '#eff6ff',
        border: '#bfdbfe',
      },
    ];

    if (variant === 'card') {
      return (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: '6px',
          }}
        >
          {tiers.map((t) => (
            <div
              key={t.key}
              style={{
                padding: '6px 8px',
                borderRadius: '6px',
                background: t.bg,
                border: `1px solid ${t.border}`,
              }}
            >
              <div style={{ fontSize: '0.64rem', fontWeight: 700, color: t.color, textTransform: 'uppercase' }}>
                {t.label}
              </div>
              <div
                style={{
                  fontSize: '0.96rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  fontVariantNumeric: 'tabular-nums',
                  marginTop: '2px',
                }}
              >
                {t.value}
              </div>
            </div>
          ))}
        </div>
      );
    }

    const isCompact = variant === 'compact';
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: isCompact ? '2px' : '4px', minWidth: 0 }}>
        {tiers.map((t) => (
          <div
            key={t.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '6px',
              padding: isCompact ? '1px 5px' : '2px 7px',
              borderRadius: '4px',
              background: t.bg,
              border: `1px solid ${t.border}`,
              fontSize: isCompact ? '0.70rem' : '0.74rem',
              lineHeight: 1.25,
            }}
          >
            <span style={{ fontWeight: 600, color: t.color, whiteSpace: 'nowrap' }}>
              {t.label}
            </span>
            <span style={{ fontFamily: 'monospace', fontWeight: 750, color: t.color, whiteSpace: 'nowrap' }}>
              {t.value}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: variant === 'table' ? 'flex-end' : 'flex-start' }}>
      <span
        style={{
          fontFamily: 'monospace',
          fontVariantNumeric: 'tabular-nums',
          fontWeight: 750,
          color: '#0f172a',
          fontSize: variant === 'card' ? '1.22rem' : '0.92rem',
        }}
      >
        {fmt(pVal)}
      </span>
      {pLabel && (
        <span style={{ fontSize: '0.64rem', color: '#5f6368', fontWeight: 500 }}>
          {pLabel}
        </span>
      )}
    </div>
  );
}
