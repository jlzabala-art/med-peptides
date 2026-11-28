'use client';

import React, { useMemo } from 'react';
import ModularPriceSchedule from '@/components/pricing/shared/ModularPriceSchedule';
import { FX_RATES_FROM_EUR } from '@/constants/fxRates';

/**
 * BloodoPriceListClient
 * ─────────────────────────────────────────────────────────────────────────────
 * Converged onto canonical ModularPriceSchedule (Pillar 2) with exact CE-IVDR
 * Dried Blood Spot (DBS) tiers in EUR/USD/AED.
 */
export default function BloodoPriceListClient({
  initialProducts = [],
  initialCurrency = 'EUR',
}) {
  const normalizedProducts = useMemo(() => {
    return (initialProducts || []).map((p) => {
      const wholesaleEur = Number(p.wholesalePriceEur || p.wholesalePrice || 0);
      const clinicEur = Number(p.clinicPriceEur || p.clinicPrice || Number((wholesaleEur * 1.15).toFixed(2)));
      const retailEur = Number(p.retailPriceEur || Number((clinicEur * 1.3).toFixed(2)));
      const landedEur = Number((wholesaleEur / 1.3225).toFixed(4));

      return {
        ...p,
        id: p.id,
        slug: p.slug || p.id,
        sku: p.sku || String(p.id || '').toUpperCase(),
        name: p.name,
        subtitle: p.biomarker || 'CE-IVDR Capillary Biomarker',
        category: p.category || 'Diagnostics',
        volume: p.turnaround || '48–72h',
        presentation: p.methodology || 'ISO 15189 Capillary DBS',
        keyActives: p.biomarker || '',
        clinicalFocus: p.description || '',
        landedCostAed: Number((landedEur * FX_RATES_FROM_EUR.AED).toFixed(2)),
        distributorPriceAed: Number((landedEur * 1.15 * FX_RATES_FROM_EUR.AED).toFixed(2)),
        wholesalePriceAed: Number((wholesaleEur * FX_RATES_FROM_EUR.AED).toFixed(2)),
        clinicPriceAed: Number((clinicEur * FX_RATES_FROM_EUR.AED).toFixed(2)),
        retailPriceAed: Number((retailEur * FX_RATES_FROM_EUR.AED).toFixed(2)),
        stockStatus: 'In Stock (CE-IVDR · 48–72h Lab)',
      };
    });
  }, [initialProducts]);

  return (
    <ModularPriceSchedule
      initialProducts={normalizedProducts}
      initialCategory="all"
      config={{
        switcherFormat: 'bloodo',
        sectionLabel: 'CE-IVDR Capillary Diagnostics',
        navCurrentLabel: 'Bloodo™ DBS Schedule',
        loginRedirect: '/pricing/bloodo',
        brandLeft: 'ATLAS HEALTH',
        brandRight: 'BLOODO™ ISO 15189 LAB',
        documentTitle: 'BLOODO™ CAPILLARY BLOOD DIAGNOSTICS PORTFOLIO',
        documentSubtitle: 'Official B2B Wholesale Schedule · CE-IVDR Dried Blood Spot (DBS) Kits · 48–72h LC-MS/MS Results',
        documentRef: 'DOC-BLOODO-DBS-2026',
        defaultCurrency: ['EUR', 'USD', 'AED'].includes(initialCurrency) ? initialCurrency : 'EUR',
        availableCurrencies: ['EUR', 'USD', 'AED'],
        defaultMarkupPct: 32.25,
        skuPrefixPattern: /^BLD-/i,
        searchPlaceholder: 'Search DBS biomarker kits by name, SKU, biomarker, or LC-MS/MS method...',
        storageNamespace: 'bloodo_dbs_pricing',
        exportBrandTitle: 'Bloodo Capillary DBS',
        exportFilePrefix: 'Bloodo_DBS_B2B_Schedule',
        whatsappHeader: '*BLOODO™ CE-IVDR CAPILLARY DIAGNOSTICS — OFFICIAL B2B SCHEDULE*',
        persistInlineEdits: true,
      }}
    />
  );
}
