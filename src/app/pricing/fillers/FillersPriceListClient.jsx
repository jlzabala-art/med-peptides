'use client';

import React, { useMemo } from 'react';
import ModularPriceSchedule from '@/components/pricing/shared/ModularPriceSchedule';
import { extractCost } from '@/lib/pricing/pricingCore';
import { FX_RATES_FROM_EUR } from '@/constants/fxRates';

/**
 * FillersPriceListClient
 * ─────────────────────────────────────────────────────────────────────────────
 * Converged onto canonical ModularPriceSchedule (Pillar 2) with full 40-SKU
 * CE-marked aesthetic injectables pricing (Cost + 15% + 15% = ×1.3225).
 */
export default function FillersPriceListClient({
  initialProducts = [],
  initialCurrency = 'EUR',
}) {
  const normalizedProducts = useMemo(() => {
    return (initialProducts || []).map((p) => {
      const costEur = Number(extractCost(p) || p.costPriceEur || p.cost || 0);
      const landedAed = p.landedCostAed ?? Number((costEur * FX_RATES_FROM_EUR.AED).toFixed(2));
      const clinicEur = Number(p.pricing?.clinic?.perUnit ?? p.clinicPriceEur ?? Number((costEur * 1.3225 * 1.15).toFixed(2)));
      const retailEur = Number(p.pricing?.retail?.perUnit ?? p.retailPriceEur ?? Number((clinicEur * 1.3).toFixed(2)));

      return {
        ...p,
        id: p.id,
        slug: p.slug || p.id,
        sku: p.atlas_product_code || p.sku || String(p.id || '').toUpperCase(),
        name: p.name || p.product_name || p.id,
        subtitle: p.subcategory || 'CE-Marked Aesthetic Injectable',
        category: p.brand || p.subcategory || 'Dermal Fillers',
        volume: p.packSize || p.volume || '1–2 Syringes',
        presentation: p.subcategory || 'Sterile Prefilled Syringe',
        keyActives: p.technology || p.indication || '',
        clinicalFocus: p.description || '',
        landedCostAed: Number(landedAed),
        distributorPriceAed: Number((landedAed * 1.15).toFixed(2)),
        wholesalePriceAed: Number((landedAed * 1.3225).toFixed(2)),
        clinicPriceAed: p.clinicPriceAed ?? Number((clinicEur * FX_RATES_FROM_EUR.AED).toFixed(2)),
        retailPriceAed: p.retailPriceAed ?? Number((retailEur * FX_RATES_FROM_EUR.AED).toFixed(2)),
        stockStatus: p.stockStatus || 'In Stock (Dubai · Express Dispatch)',
      };
    });
  }, [initialProducts]);

  return (
    <ModularPriceSchedule
      initialProducts={normalizedProducts}
      initialCategory="all"
      config={{
        switcherFormat: 'fillers',
        sectionLabel: 'Aesthetic Injectables',
        navCurrentLabel: 'Dermal Fillers & Boosters',
        loginRedirect: '/pricing/fillers',
        brandLeft: 'ATLAS HEALTH',
        brandRight: 'AESTHETIC INJECTABLES DIRECT',
        documentTitle: 'DERMAL FILLERS, BIOSTIMULATORS & SKIN BOOSTERS SCHEDULE',
        documentSubtitle: 'Official B2B Wholesale Schedule · Juvéderm, Restylane, Teoxane, Belotero, Sculptra, Radiesse, PhilArt & Aqualyx',
        documentRef: 'DOC-AESTHETICS-FILLERS-2026',
        defaultCurrency: ['EUR', 'USD', 'AED'].includes(initialCurrency) ? initialCurrency : 'EUR',
        availableCurrencies: ['EUR', 'USD', 'AED'],
        defaultMarkupPct: 32.25,
        skuPrefixPattern: /^SKU-FILLER-/i,
        searchPlaceholder: 'Search fillers by brand (Juvéderm, Teoxane, Sculptra...), SKU, or cross-linking tech...',
        storageNamespace: 'fillers_aesthetics_pricing',
        exportBrandTitle: 'Atlas Aesthetic Injectables',
        exportFilePrefix: 'Aesthetic_Injectables_B2B_Schedule',
        whatsappHeader: '*ATLAS AESTHETIC INJECTABLES — OFFICIAL B2B SCHEDULE*',
        persistInlineEdits: true,
      }}
    />
  );
}
