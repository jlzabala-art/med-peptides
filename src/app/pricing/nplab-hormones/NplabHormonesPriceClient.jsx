'use client';

import React, { useState, useMemo } from 'react';
import ModularPriceSchedule from '@/components/pricing/shared/ModularPriceSchedule';
import { getAllPharmapolisHrtBulkOffers } from '@/data/pharmapolisHrtBulkOffers';
import '../colway/ColwayPriceList.css';

export default function NplabHormonesPriceClient({
  pharmapolisProducts = [],
  nplabProducts = [],
  initialProducts = [],
  supplierLock = null, // 'pharmapolis' | 'nplab' | null
  initialLab = 'pharmapolis',
  initialCategory = 'all',
  initialCurrency = 'EUR',
}) {
  const [selectedLab, setSelectedLab] = useState(() => {
    if (supplierLock === 'pharmapolis') {
      return ['pharmapolis', 'pharmapolis_bulk', 'pharmapolis_all'].includes(initialLab) ? initialLab : 'pharmapolis';
    }
    if (supplierLock === 'nplab') {
      return 'nplab';
    }
    return ['pharmapolis', 'pharmapolis_bulk', 'pharmapolis_all', 'nplab', 'all'].includes(initialLab) ? initialLab : 'pharmapolis';
  });

  const bulkProducts = useMemo(() => {
    return getAllPharmapolisHrtBulkOffers().map((offer, idx) => {
      const eur = Number(offer.bulkOfferExclVatEur || offer.pricing?.costPriceEur || 0);
      const aed = Number((eur * 3.98).toFixed(2));
      return {
        id: offer.id,
        slug: offer.id,
        sku: `SKU-PHARM-BULK-${idx + 1}`,
        name: `${offer.productName} (${offer.strength})`,
        canonicalName: offer.productName,
        subtitle: `${offer.packLabel} · Batch MOQ ×${offer.packsPerBatch}`,
        category: 'E. Bulk Batch Offers (MOQ 33–50)',
        packSize: `${offer.packLabel} · MOQ ${offer.packsPerBatch}`,
        volume: `${offer.packLabel} (Batch ×${offer.packsPerBatch})`,
        presentation: `${offer.packagingType} · Batch ×${offer.packsPerBatch}`,
        keyActives: `${offer.productName} ${offer.strength} · ${offer.batchSize} ${offer.batchUnit} batch`,
        clinicalFocus: `Institutional bulk compounding batch (${offer.packsPerBatch} packs/batch) by Pharmapolis Bulgaria (EU GMP). Excl. VAT.`,
        costCurrency: 'EUR',
        costPriceEur: eur,
        landedCostAed: aed,
        wholesalePriceAed: Number((aed * 1.15).toFixed(2)),
        clinicPriceAed: Number((aed * 1.3225).toFixed(2)),
        retailPriceAed: Number((aed * 1.55).toFixed(2)),
        pricing: offer.pricing,
        status: 'published',
        isActive: true,
      };
    });
  }, []);

  const activeProducts = useMemo(() => {
    if (selectedLab === 'pharmapolis_bulk') {
      return bulkProducts;
    }
    if (selectedLab === 'pharmapolis_all') {
      return [...pharmapolisProducts, ...bulkProducts];
    }
    if (selectedLab === 'pharmapolis' && pharmapolisProducts.length > 0) {
      return pharmapolisProducts;
    }
    if (selectedLab === 'nplab') {
      return nplabProducts;
    }
    if (selectedLab === 'all') {
      return [...pharmapolisProducts, ...bulkProducts, ...nplabProducts];
    }
    return pharmapolisProducts.length > 0 ? pharmapolisProducts : initialProducts;
  }, [selectedLab, pharmapolisProducts, bulkProducts, nplabProducts, initialProducts]);

  const config = useMemo(() => {
    const isPharmapolis = supplierLock === 'pharmapolis' || selectedLab.startsWith('pharmapolis');
    const isNplabOnly = supplierLock === 'nplab' || selectedLab === 'nplab';
    return {
      sectionLabel: 'B2B Compounding Pharmacy',
      navCurrentLabel: isPharmapolis
        ? 'Pharmapolis Bulgaria HRT (BHRT & Pellets)'
        : isNplabOnly
          ? 'NP LABS Hormones (TRT & BHRT)'
          : 'EU GMP Hormones (Pharmapolis & NP LABS)',
      loginRedirect: supplierLock === 'pharmapolis' ? '/pricing/pharmapolis-hrt' : '/pricing/nplab-hormones',
      switcherFormat: supplierLock === 'pharmapolis' ? 'pharmapolis-hrt' : 'nplab-hormones',
      brandLeft: 'ATLAS HEALTH',
      brandRight: isPharmapolis
        ? 'PHARMAPOLIS BULGARIA · EU GMP HRT'
        : isNplabOnly
          ? 'NP LABS · COMPOUNDED HORMONES'
          : 'NP LABS & PHARMAPOLIS · COMPOUNDED HORMONES',
      documentTitle: isPharmapolis
        ? 'PHARMAPOLIS BULGARIA EU GMP HRT & PELLETS SCHEDULE'
        : isNplabOnly
          ? 'NP LABS TRT, BHRT & SUBCUTANEOUS PELLETS SCHEDULE'
          : "MEN'S TRT, BHRT & SUBCUTANEOUS PELLETS SCHEDULE",
      documentSubtitle: isPharmapolis
        ? 'Master Preparations & Institutional Bulk Batches · Topical Topi-CLICK, Oral Capsules, Subcutaneous Pellets & Vaginal · EUR'
        : 'Bioidentical Hormone Replacement Therapy (BHRT), Pellets & Testosterone Formulations · Cost Basis in EUR',
      documentRef: isPharmapolis ? 'DOC-BG-PHARM-HORM-2026' : 'DOC-EU-NPLAB-HORM-2026',
      defaultCurrency: ['EUR', 'AED', 'USD'].includes(initialCurrency) ? initialCurrency : 'EUR',
      availableCurrencies: ['EUR', 'AED', 'USD'],
      defaultMarkupPct: 15,
      skuPrefixPattern: /^SKU-(PHARM-HORM|PHARM-BULK|NPLAB)-/i,
      searchPlaceholder:
        'Search hormones by preparation, strength or active ingredient (Biest, Triest, Progesterone, Testosterone, Pellets, DHEA)...',
      storageNamespace: isPharmapolis ? 'pharmapolis_hormones_pricing' : 'nplab_hormones_pricing',
      exportBrandTitle: isPharmapolis ? 'Pharmapolis Bulgaria Hormones' : 'NP LABS Hormones',
      exportFilePrefix: isPharmapolis ? 'Pharmapolis_Hormones_Price_Schedule' : 'NPLAB_Hormones_Price_Schedule',
      whatsappHeader: isPharmapolis
        ? '*PHARMAPOLIS BULGARIA EU GMP — HRT, CAPSULES & PELLETS SCHEDULE*'
        : '*NP LABS INTERNATIONAL COMPOUNDING — TRT & BHRT SCHEDULE*',
      persistInlineEdits: true,
    };
  }, [selectedLab, supplierLock, initialCurrency]);

  const switcherTabs = useMemo(() => {
    if (supplierLock === 'pharmapolis') {
      return [
        {
          id: 'pharmapolis',
          label: `🇧🇬 Standard Master Preparations (${pharmapolisProducts.length} Preparations · 240 Strengths)`,
        },
        {
          id: 'pharmapolis_bulk',
          label: `📦 Bulk Batch Offers (MOQ 33–50 · ${bulkProducts.length} Top HRT)`,
        },
        {
          id: 'pharmapolis_all',
          label: `All Pharmapolis HRT (${pharmapolisProducts.length + bulkProducts.length})`,
        },
      ];
    }
    if (supplierLock === 'nplab') {
      return [
        {
          id: 'nplab',
          label: `🇬🇷 NP LABS Compounded Hormones (${nplabProducts.length} SKUs)`,
        },
      ];
    }
    return [
      {
        id: 'pharmapolis',
        label: `🇧🇬 Pharmapolis Bulgaria (${pharmapolisProducts.length} Master Preparations · 240 Strengths)`,
      },
      {
        id: 'pharmapolis_bulk',
        label: `📦 Pharmapolis Bulk Batch (MOQ 33–50 · ${bulkProducts.length} Top HRT)`,
      },
      {
        id: 'nplab',
        label: `🇬🇷 NP LABS Legacy (${nplabProducts.length} SKUs)`,
      },
      {
        id: 'all',
        label: `All EU GMP Hormones (${pharmapolisProducts.length + nplabProducts.length})`,
      },
    ];
  }, [supplierLock, pharmapolisProducts.length, bulkProducts.length, nplabProducts.length]);

  return (
    <div>
      {/* GCP Compounding Lab Switcher Strip */}
      {switcherTabs.length > 1 && (
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
            {supplierLock === 'pharmapolis' ? 'Pharmapolis EU GMP Catalog Views:' : 'Compounding Laboratory Schedule:'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {switcherTabs.map((tab) => {
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
      )}

      <ModularPriceSchedule
        key={selectedLab}
        initialProducts={activeProducts}
        initialCategory={initialCategory}
        config={config}
      />
    </div>
  );
}
