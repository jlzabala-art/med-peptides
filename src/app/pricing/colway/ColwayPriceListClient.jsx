'use client';

import React from 'react';
import ModularPriceSchedule from '@/components/pricing/shared/ModularPriceSchedule';
import './ColwayPriceList.css';

export default function ColwayPriceListClient({
  initialProducts = [],
  initialCategory = 'all',
  isHairLineFocus = false,
}) {
  const config = isHairLineFocus
    ? {
        sectionLabel: 'B2B Wholesale',
        navCurrentLabel: 'Colway Hair & Trichology',
        loginRedirect: '/pricing/colway-hair',
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

  return (
    <ModularPriceSchedule
      initialProducts={initialProducts}
      initialCategory={initialCategory}
      config={config}
    />
  );
}
