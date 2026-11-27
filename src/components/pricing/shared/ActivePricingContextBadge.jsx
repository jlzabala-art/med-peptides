'use client';

import React from 'react';
import { Globe, ShieldCheck } from 'lucide-react';
import { usePricing } from '@/hooks/usePricing';
import { PRICING_MARKETS } from '@/constants/roles';

const ROLE_DISPLAY = Object.freeze({
  admin: { en: 'Admin (All Tiers)', es: 'Admin (Todas las tarifas)' },
  distributor: { en: 'Distributor (+15%)', es: 'Distribuidor (+15%)' },
  wholeseller: { en: 'Wholeseller (15%+15%)', es: 'Wholeseller (15%+15%)' },
  clinic: { en: 'Clinic / Doctor', es: 'Clínica / Médico' },
  retail: { en: 'Retail / Patient', es: 'PVP / Paciente' },
  guest: { en: 'Wholeseller (15%+15%)', es: 'Wholeseller (15%+15%)' },
});

/**
 * ActivePricingContextBadge
 * ─────────────────────────────────────────────────────────────────────────────
 * Monochrome Google-Cloud-style pill indicating the exact active Role + Market
 * + Currency currently resolving prices on any /pricing/* schedule.
 */
export default function ActivePricingContextBadge({
  currency = null,
  marketOverride = null,
  lang = 'en',
  style = {},
}) {
  const { pricingRole, market: sessionMarket, isSimulating } = usePricing();
  const isEs = lang === 'es';
  const activeMarket = marketOverride || sessionMarket || 'global';
  const marketMeta =
    PRICING_MARKETS.find((m) => m.id === activeMarket) ||
    PRICING_MARKETS[0] ||
    { id: 'global', labelEn: 'Global / EU', labelEs: 'Global / UE', badge: 'GLB' };
  const roleMeta = ROLE_DISPLAY[pricingRole] || ROLE_DISPLAY.wholeseller;

  return (
    <div
      title={
        isEs
          ? `Tarifa activa resuelta por rol (${roleMeta.es}) y mercado (${marketMeta.labelEs})`
          : `Active schedule resolved by role (${roleMeta.en}) and market (${marketMeta.labelEn})`
      }
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: '999px',
        border: isSimulating ? '1px solid #f59e0b' : '1px solid #dadce0',
        backgroundColor: isSimulating ? '#fffbeb' : '#f8f9fa',
        color: isSimulating ? '#92400e' : '#3c4043',
        fontSize: '0.72rem',
        fontWeight: 600,
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {isSimulating ? (
        <ShieldCheck size={12} style={{ color: '#d97706', flexShrink: 0 }} />
      ) : (
        <Globe size={12} style={{ color: '#5f6368', flexShrink: 0 }} />
      )}
      <span>{isEs ? roleMeta.es : roleMeta.en}</span>
      <span style={{ opacity: 0.45 }}>·</span>
      <span>{isEs ? marketMeta.labelEs : marketMeta.labelEn}</span>
      {currency && (
        <>
          <span style={{ opacity: 0.45 }}>·</span>
          <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{String(currency).toUpperCase()}</span>
        </>
      )}
    </div>
  );
}
