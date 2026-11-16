'use client';

import React from 'react';
import ModularPriceSchedule from '@/components/pricing/shared/ModularPriceSchedule';
import '../colway/ColwayPriceList.css';

export default function NplabHormonesPriceClient({
  initialProducts = [],
  initialCategory = 'all',
  initialCurrency = 'EUR',
}) {
  const config = {
    sectionLabel: 'B2B Compounding Pharmacy',
    navCurrentLabel: 'NP LABS Hormones (TRT & BHRT)',
    loginRedirect: '/pricing/nplab-hormones',
    brandLeft: 'ATLAS HEALTH',
    brandRight: 'NP LABS · COMPOUNDED HORMONES',
    documentTitle: "NP LABS MEN'S TRT & BHRT COMPOUNDING SCHEDULE",
    documentSubtitle:
      'Bioidentical Hormone Replacement Therapy (BHRT) & Testosterone Formulations · Cost Basis in EUR',
    documentRef: 'DOC-EU-NPLAB-HORM-2026',
    defaultCurrency: ['EUR', 'AED', 'USD'].includes(initialCurrency) ? initialCurrency : 'EUR',
    availableCurrencies: ['EUR', 'AED', 'USD'],
    defaultMarkupPct: 15,
    skuPrefixPattern: /^SKU-NPLAB-/i,
    searchPlaceholder:
      'Search hormones by active ingredient (BIEST, Progesterone, Testosterone, DHEA, Enclomiphene, LDN)...',
    storageNamespace: 'nplab_hormones_pricing',
    exportBrandTitle: 'NP LABS Hormones',
    exportFilePrefix: 'NPLAB_Hormones_Price_Schedule',
    whatsappHeader:
      '*NP LABS INTERNATIONAL COMPOUNDING — TRT & BHRT SCHEDULE*',
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
