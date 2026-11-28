'use client';

import React from 'react';
import ModularPriceSchedule from '@/components/pricing/shared/ModularPriceSchedule';

export default function TelstarPriceListClient({
  initialProducts = [],
  initialCategory = 'all',
  initialCurrency = 'EUR',
}) {
  return (
    <ModularPriceSchedule
      initialProducts={initialProducts}
      initialCategory={initialCategory}
      config={{
        activeFormat: 'telstar-freeze-dryers',
        sectionLabel: 'Laboratory & GMP Equipment',
        navCurrentLabel: 'Telstar Freeze Dryers (2027)',
        loginRedirect: '/pricing/telstar-freeze-dryers',
        brandLeft: 'ATLAS HEALTH',
        brandRight: 'TELSTAR · A SYNTEGON COMPANY',
        documentTitle: 'TELSTAR 2027 LABORATORY & PILOT GMP FREEZE DRYERS',
        documentSubtitle: 'Official 2027 Distributor & Institutional B2B Schedule · FCA Terrassa · 2-Year Parts Warranty',
        documentRef: 'DOC-TELSTAR-2027-V1',
        defaultCurrency: initialCurrency,
        availableCurrencies: ['EUR', 'USD', 'AED'],
        defaultMarkupPct: 32.25,
        skuPrefixPattern: /^(6|5|1|2|EB|FB|ZLYO)/i,
        searchPlaceholder: 'Search freeze dryers by model (LyoQuest, LyoAlfa, LyoBeta), SKU, or condenser °C...',
        storageNamespace: 'telstar_2027_pricing',
        exportBrandTitle: 'Telstar Syntegon 2027',
        exportFilePrefix: 'Telstar_2027_Freeze_Dryers_Schedule',
        whatsappHeader: '*TELSTAR (SYNTEGON) — 2027 LABORATORY FREEZE DRYERS B2B SCHEDULE*',
        persistInlineEdits: true,
      }}
    />
  );
}
