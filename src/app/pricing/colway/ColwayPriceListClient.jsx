'use client';

import React, { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import ModularPriceSchedule from '@/components/pricing/shared/ModularPriceSchedule';
import PricingMarketSwitcherBar from '@/components/pricing/shared/PricingMarketSwitcherBar';
import './ColwayPriceList.css';

const QatarColwayPriceListClient = dynamic(
  () => import('../colway-qatar/QatarColwayPriceListClient'),
  { ssr: false }
);

export default function ColwayPriceListClient({
  initialProducts = [],
  initialCategory = 'all',
  isHairLineFocus = false,
  initialCurrency = null,
  initialMarket = 'uae',
}) {
  const [market, setMarket] = useState(initialMarket === 'qatar' ? 'qatar' : 'uae');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = (new URLSearchParams(window.location.search).get('market') || '').toLowerCase();
    if (raw === 'qatar' || raw === 'qa') setMarket('qatar');
  }, []);

  const handleMarketChange = useCallback((nextMarket) => {
    const normalized = nextMarket === 'qatar' ? 'qatar' : 'uae';
    setMarket(normalized);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (normalized === 'qatar') url.searchParams.set('market', 'qatar');
      else url.searchParams.delete('market');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  const config = isHairLineFocus
    ? {
        sectionLabel: 'B2B Wholesale',
        navCurrentLabel: 'Colway Hair & Trichology',
        loginRedirect: '/pricing/colway?category=hair',
        brandLeft: 'ATLAS HEALTH',
        brandRight: 'COLWAY TRICHOLOGY',
        documentTitle: 'COLWAY CLINICAL HAIR & TRICHOLOGY PORTFOLIO',
        documentSubtitle:
          'Official UAE B2B Wholesaler Price Schedule · Baicapil™ & Native Tropocollagen',
        documentRef: 'DOC-UAE-COL-HAIR-2026',
        defaultCurrency: 'AED',
        availableCurrencies: ['AED', 'USD', 'EUR'],
        defaultMarkupPct: 15,
        skuPrefixPattern: /^SKU-COLWAY-/i,
        searchPlaceholder:
          'Search Colway trichology formulations by name, SKU, or active ingredient...',
        storageNamespace: 'colway_hair_pricing',
        exportBrandTitle: 'Colway Trichology UAE',
        exportFilePrefix: 'Colway_Hair_UAE_Price_Schedule',
        whatsappHeader:
          '*COLWAY TRICHOLOGY — OFFICIAL UAE B2B WHOLESALE SCHEDULE*',
        persistInlineEdits: true,
      }
    : {
        sectionLabel: 'B2B Wholesale',
        navCurrentLabel: 'Colway UAE Price Schedule',
        loginRedirect: '/pricing/colway',
        brandLeft: 'ATLAS HEALTH',
        brandRight: 'COLWAY CLINICAL DERMA',
        documentTitle: 'COLWAY CLINICAL CELLULAR & TRICHOLOGY PORTFOLIO',
        documentSubtitle:
          'Official UAE B2B Wholesaler Price Schedule · Biologically Active Collagen & Peptides',
        documentRef: 'DOC-UAE-COL-2026-V1',
        defaultCurrency: 'AED',
        availableCurrencies: ['AED', 'USD', 'EUR'],
        defaultMarkupPct: 15,
        skuPrefixPattern: /^SKU-COLWAY-/i,
        searchPlaceholder:
          'Search Colway formulations by product name, SKU, or active ingredient...',
        storageNamespace: 'colway_uae_pricing',
        exportBrandTitle: 'Colway UAE',
        exportFilePrefix: 'Colway_UAE_Price_Schedule',
        whatsappHeader:
          '*COLWAY CLINICAL DERMA — OFFICIAL UAE B2B WHOLESALE SCHEDULE*',
        persistInlineEdits: true,
      };

  const marketSwitcher = (
    <PricingMarketSwitcherBar
      label="Colway Market"
      activeMarket={market}
      onChange={handleMarketChange}
      options={[
        { id: 'uae', label: 'UAE · Derma & Trichology', badge: 'AED / USD' },
        { id: 'qatar', label: 'Qatar · Hair Distribution', badge: 'QA' },
      ]}
    />
  );

  if (market === 'qatar') {
    return (
      <>
        {marketSwitcher}
        <QatarColwayPriceListClient />
      </>
    );
  }

  return (
    <>
      {marketSwitcher}
      <ModularPriceSchedule
        initialProducts={initialProducts}
        initialCategory={initialCategory}
        config={{
          ...config,
          defaultCurrency: initialCurrency && config.availableCurrencies.includes(initialCurrency)
            ? initialCurrency
            : config.defaultCurrency,
        }}
      />
    </>
  );
}
