'use client';

import React, { useState, useMemo } from 'react';
import ModularPriceSchedule from '@/components/pricing/shared/ModularPriceSchedule';
import '../colway/ColwayPriceList.css';

export default function NplabHormonesPriceClient({
  pharmapolisProducts = [],
  nplabProducts = [],
  initialProducts = [],
  initialLab = 'pharmapolis',
  initialCategory = 'all',
  initialCurrency = 'EUR',
}) {
  const [selectedLab, setSelectedLab] = useState(
    ['pharmapolis', 'nplab', 'all'].includes(initialLab) ? initialLab : 'pharmapolis'
  );

  const activeProducts = useMemo(() => {
    if (selectedLab === 'pharmapolis' && pharmapolisProducts.length > 0) {
      return pharmapolisProducts;
    }
    if (selectedLab === 'nplab' && nplabProducts.length > 0) {
      return nplabProducts;
    }
    if (selectedLab === 'all') {
      return [...pharmapolisProducts, ...nplabProducts];
    }
    return pharmapolisProducts.length > 0 ? pharmapolisProducts : initialProducts;
  }, [selectedLab, pharmapolisProducts, nplabProducts, initialProducts]);

  const config = useMemo(() => {
    const isPharmapolis = selectedLab === 'pharmapolis';
    return {
      sectionLabel: 'B2B Compounding Pharmacy',
      navCurrentLabel: isPharmapolis
        ? 'Pharmapolis Bulgaria Hormones (BHRT & Pellets)'
        : 'EU GMP Hormones (Pharmapolis & NP LABS)',
      loginRedirect: '/pricing/nplab-hormones',
      brandLeft: 'ATLAS HEALTH',
      brandRight: isPharmapolis
        ? 'PHARMAPOLIS BULGARIA · BHRT & PELLETS'
        : 'NP LABS & PHARMAPOLIS · COMPOUNDED HORMONES',
      documentTitle: isPharmapolis
        ? 'PHARMAPOLIS BULGARIA EU GMP HORMONES & PELLETS SCHEDULE'
        : "MEN'S TRT, BHRT & SUBCUTANEOUS PELLETS SCHEDULE",
      documentSubtitle: isPharmapolis
        ? '43 Master Preparations (240 Standardized Strengths) · Topical, Oral Capsules, Subcutaneous Pellets & Vaginal · EUR incl. VAT'
        : 'Bioidentical Hormone Replacement Therapy (BHRT), Pellets & Testosterone Formulations · Cost Basis in EUR',
      documentRef: isPharmapolis ? 'DOC-BG-PHARM-HORM-2026' : 'DOC-EU-NPLAB-HORM-2026',
      defaultCurrency: ['EUR', 'AED', 'USD'].includes(initialCurrency) ? initialCurrency : 'EUR',
      availableCurrencies: ['EUR', 'AED', 'USD'],
      defaultMarkupPct: 15,
      skuPrefixPattern: /^SKU-(PHARM-HORM|NPLAB)-/i,
      searchPlaceholder:
        'Search hormones by preparation, strength or active ingredient (Biest, Triest, Progesterone, Testosterone, Pellets, DHEA)...',
      storageNamespace: isPharmapolis ? 'pharmapolis_hormones_pricing' : 'nplab_hormones_pricing',
      exportBrandTitle: isPharmapolis ? 'Pharmapolis Bulgaria Hormones' : 'NP LABS Hormones',
      exportFilePrefix: isPharmapolis ? 'Pharmapolis_Hormones_Price_Schedule' : 'NPLAB_Hormones_Price_Schedule',
      whatsappHeader: isPharmapolis
        ? '*PHARMAPOLIS BULGARIA EU GMP — BHRT, CAPSULES & PELLETS SCHEDULE*'
        : '*NP LABS INTERNATIONAL COMPOUNDING — TRT & BHRT SCHEDULE*',
      persistInlineEdits: true,
    };
  }, [selectedLab, initialCurrency]);

  return (
    <div>
      {/* GCP Compounding Lab Switcher Strip */}
      <div
        className="no-print"
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #dadce0',
          padding: '8px 16px',
        }}
      >
        <div
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            Compounding Laboratory Schedule:
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {[
              {
                id: 'pharmapolis',
                label: `🇧🇬 Pharmapolis Bulgaria (${pharmapolisProducts.length} Master Preparations · 240 Strengths)`,
              },
              {
                id: 'nplab',
                label: `🇬🇷 NP LABS Legacy (${nplabProducts.length} SKUs)`,
              },
              {
                id: 'all',
                label: `All EU GMP Hormones (${pharmapolisProducts.length + nplabProducts.length})`,
              },
            ].map((tab) => {
              const active = selectedLab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedLab(tab.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: active ? '1px solid #1a73e8' : '1px solid #dadce0',
                    background: active ? '#e8f0fe' : '#ffffff',
                    color: active ? '#1a73e8' : '#3c4043',
                    fontSize: '0.76rem',
                    fontWeight: active ? 700 : 600,
                    cursor: 'pointer',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <ModularPriceSchedule
        key={selectedLab}
        initialProducts={activeProducts}
        initialCategory={initialCategory}
        config={config}
      />
    </div>
  );
}
