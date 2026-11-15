'use client';

import React, { useMemo } from 'react';
import ModularPriceSchedule from '@/components/pricing/shared/ModularPriceSchedule';
import { useCommercialSchedule } from '@/hooks/useCommercialSchedule';
import { FALLBACK_AGREEMENTS } from '@/repositories/commercialAgreementsRepository';
import '../colway/ColwayPriceList.css';

const QAR_TO_AED = 3.6725 / 3.64;

export default function QatarColwayPriceClient() {
  const { agreement } = useCommercialSchedule('colway-qatar');
  const fallback = FALLBACK_AGREEMENTS['colway-qatar'];
  const pricing = agreement?.pricing || fallback.pricing;
  const items = agreement?.items || fallback.items;

  const initialProducts = useMemo(() => {
    const landedAed = Number(((pricing?.unitProductPriceQar || 93.94) * QAR_TO_AED).toFixed(2));
    const wholesaleAed = Number(((pricing?.unitDistributorPriceQar || 112.0) * QAR_TO_AED).toFixed(2));
    const retailAed = Number(((pricing?.unitRecommendedRetailQar || 187.0) * QAR_TO_AED).toFixed(2));
    const clinicAed = Number(((wholesaleAed + retailAed) / 2).toFixed(2));

    return items.map((item, idx) => ({
      id: item.id || `colway-qa-${idx + 1}`,
      sku: `SKU-QA-COL-${idx + 1}`,
      name: item.name,
      subtitle: 'Exclusive Qatar B2B Distribution · CIF Doha Port of Entry',
      volume: item.id?.includes('shampoo') ? '250 mL' : '200 mL',
      presentation: item.id?.includes('shampoo') ? 'Dispenser Pump Bottle' : 'Flexible Dispenser Tube',
      category: 'Trichology & Scalp',
      keyActives: item.actives,
      clinicalFocus: 'Pre- & post-transplant scalp optimization, follicular anchoring, and cuticular barrier repair.',
      landedCostAed: landedAed,
      wholesalePriceAed: Number(((item.unitPriceQar || pricing?.unitDistributorPriceQar || 112.0) * QAR_TO_AED).toFixed(2)),
      clinicPriceAed: clinicAed,
      retailPriceAed: retailAed,
      stockStatus: 'CIF Doha (40 Units/SKU)',
    }));
  }, [items, pricing]);

  const config = {
    sectionLabel: 'B2B Wholesale',
    navCurrentLabel: 'Colway Qatar Distribution',
    loginRedirect: '/pricing/colway-qatar',
    brandLeft: 'ATLAS HEALTH',
    brandRight: 'RYHANH MEDICAL · QATAR',
    documentTitle: agreement?.title || 'COLWAY® CLINICAL HAIR CARE & TRICHOLOGY SCHEDULE',
    documentSubtitle: agreement?.subtitle || 'Exclusive B2B Commercial Distribution Architecture · State of Qatar Territory',
    documentRef: agreement?.documentRef || 'DOC-QA-COL-2026-V1',
    defaultCurrency: 'QAR',
    availableCurrencies: ['QAR', 'USD', 'EUR'],
    defaultMarkupPct: 19.2,
    skuPrefixPattern: /^SKU-QA-COL-/i,
    searchPlaceholder: 'Search Qatar Colway trichology formulations by name, SKU, or active ingredient...',
    storageNamespace: 'colway_qatar_pricing',
    exportBrandTitle: 'Colway Qatar (Ryhanh Medical)',
    exportFilePrefix: 'Colway_Qatar_Price_Schedule',
    whatsappHeader: '*COLWAY® TRICHOLOGY — OFFICIAL QATAR B2B DISTRIBUTOR SCHEDULE*',
    persistInlineEdits: false,
  };

  return <ModularPriceSchedule initialProducts={initialProducts} config={config} />;
}
