'use client';

import React from 'react';
import Link from 'next/link';
import { LayoutGrid, Table2 } from 'lucide-react';

const UNIFIED_CATALOG_TRACKS = [
  { id: 'peptides', labelEn: 'Peptides', labelEs: 'Péptidos', collectionHref: '/collection/peptides', pricingHref: '/pricing/peptides' },
  { id: 'fillers', labelEn: 'Boosters & Fillers', labelEs: 'Boosters y Fillers', collectionHref: '/collection/fillers', pricingHref: '/pricing/fillers' },
  { id: 'pellets', labelEn: 'Pellets HRT', labelEs: 'Pellets HRT', collectionHref: '/collection/hormones', pricingHref: '/pricing/pellets' },
  { id: '24genomics', labelEn: '24Genetics', labelEs: '24Genetics', collectionHref: '/collection/24genomics', pricingHref: '/pricing/24genetics' },
  { id: 'colway', labelEn: 'Colway', labelEs: 'Colway', collectionHref: '/collection/colway', pricingHref: '/pricing/colway' },
  { id: 'hormones', labelEn: 'Hormones', labelEs: 'Hormonas', collectionHref: '/collection/hormones', pricingHref: '/pricing/pharmapolis-hrt' }
];

function normalizeTrackId(slug = '') {
  const s = String(slug || '').toLowerCase();
  if (s.includes('filler') || s.includes('injectable') || s.includes('booster')) return 'fillers';
  if (s.includes('pellet')) return 'pellets';
  if (s.includes('24gen')) return '24genomics';
  if (s.includes('colway')) return 'colway';
  if (s.includes('hormone') || s.includes('hrt')) return 'hormones';
  if (s.includes('peptide')) return 'peptides';
  return s;
}

/**
 * CatalogPricingBridgeBar
 * ─────────────────────────────────────────────────────────────────────────────
 * Unifies /collection/* (Visual Cards) and /pricing/* (B2B Price Table) into
 * one continuous experience with a 1-click Dual View Toggle + Category Switcher.
 */
export default function CatalogPricingBridgeBar({
  activeMode = 'catalog', // 'catalog' | 'pricing'
  slug = '',
  lang = 'en'
}) {
  const isEs = lang === 'es';
  const currentId = normalizeTrackId(slug);
  const currentTrack = UNIFIED_CATALOG_TRACKS.find((t) => t.id === currentId) || UNIFIED_CATALOG_TRACKS[0];

  const catalogUrl = currentTrack?.collectionHref || '/collection/peptides';
  const pricingUrl = currentTrack?.pricingHref || '/pricing/peptides';

  return (
    <div
      className="no-print"
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #dadce0',
        padding: '0 16px'
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          minHeight: '42px',
          flexWrap: 'wrap',
          padding: '4px 0'
        }}
      >
        {/* Left: Category Tracks */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            overflowX: 'auto',
            maxWidth: '100%'
          }}
        >
          {UNIFIED_CATALOG_TRACKS.map((track) => {
            const isActive = track.id === currentId;
            const href = activeMode === 'pricing' ? track.pricingHref : track.collectionHref;
            return (
              <Link
                key={track.id}
                href={href}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: isActive ? 750 : 600,
                  color: isActive ? '#003666' : '#5f6368',
                  background: isActive ? '#eff6ff' : 'transparent',
                  border: isActive ? '1px solid #bfdbfe' : '1px solid transparent',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                {isEs ? track.labelEs : track.labelEn}
              </Link>
            );
          })}
        </div>

        {/* Right: Dual View Switcher (Cards <-> B2B Table) */}
        <div
          role="group"
          aria-label={isEs ? 'Cambiar vista catálogo o tarifa' : 'Switch catalog or pricing table view'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: '#f1f5f9',
            padding: '2px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            gap: '2px',
            flexShrink: 0
          }}
        >
          <Link
            href={catalogUrl}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: activeMode === 'catalog' ? 750 : 600,
              background: activeMode === 'catalog' ? '#ffffff' : 'transparent',
              color: activeMode === 'catalog' ? '#003666' : '#475569',
              boxShadow: activeMode === 'catalog' ? '0 1px 2px rgba(15,23,42,0.08)' : 'none',
              textDecoration: 'none',
              whiteSpace: 'nowrap'
            }}
          >
            <LayoutGrid size={13} />
            <span>{isEs ? 'Tarjetas' : 'Catalog'}</span>
          </Link>
          <Link
            href={pricingUrl}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: activeMode === 'pricing' ? 750 : 600,
              background: activeMode === 'pricing' ? '#ffffff' : 'transparent',
              color: activeMode === 'pricing' ? '#003666' : '#475569',
              boxShadow: activeMode === 'pricing' ? '0 1px 2px rgba(15,23,42,0.08)' : 'none',
              textDecoration: 'none',
              whiteSpace: 'nowrap'
            }}
          >
            <Table2 size={13} />
            <span>{isEs ? 'Tarifa B2B' : 'B2B Table'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
