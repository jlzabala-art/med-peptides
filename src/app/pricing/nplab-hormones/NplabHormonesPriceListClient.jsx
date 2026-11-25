'use client';

import React, { useState, useMemo } from 'react';
import ModularPriceSchedule from '@/components/pricing/shared/ModularPriceSchedule';
import { getAllPharmapolisHrtBulkOffers } from '@/data/pharmapolisHrtBulkOffers';
import { usePublicWorkspace } from '@/context/PublicWorkspaceContext';
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
  const workspace = usePublicWorkspace?.() || null;
  const t = workspace?.t || ((en) => en);

  const [selectedLab, setSelectedLab] = useState(() => {
    if (supplierLock === 'pharmapolis') {
      return ['pharmapolis', 'pharmapolis_bulk', 'pharmapolis_all'].includes(initialLab) ? initialLab : 'pharmapolis_all';
    }
    if (supplierLock === 'nplab') {
      return 'nplab';
    }
    return ['pharmapolis', 'pharmapolis_bulk', 'pharmapolis_all', 'nplab', 'all'].includes(initialLab) ? initialLab : 'pharmapolis';
  });
  const [activeCategoryOverride, setActiveCategoryOverride] = useState(initialCategory || 'all');

  const bulkProducts = useMemo(() => {
    return getAllPharmapolisHrtBulkOffers().map((offer, idx) => {
      const eur = Number(offer.bulkOfferExclVatEur || offer.pricing?.costPriceEur || 0);
      const aed = Number((eur * 3.98).toFixed(2));
      const matchedStd = pharmapolisProducts.find((p) => {
        const pName = String(p?.name || p?.canonicalName || '').toLowerCase();
        const oName = offer.productName.toLowerCase();
        if (oName.includes('progesterone capsules') && pName.includes('progesterone capsules, immediate')) return true;
        if (oName.includes('testosterone cream (women)') && pName.includes('testosterone cream, women')) return true;
        if (oName.includes('testosterone cream (men)') && pName.includes('testosterone cream/gel, men')) return true;
        if (oName.includes('biest cream') && pName.includes('biest 80:20')) return true;
        if (oName.includes('progesterone cream') && pName.includes('progesterone cream')) return true;
        return false;
      });
      const stdEur = Number(matchedStd?.costPriceEur || 0);
      const savingsPct = stdEur > eur ? Math.round(((stdEur - eur) / stdEur) * 100) : 0;
      const savingsBadge = savingsPct > 0 ? ` · Save ${savingsPct}% vs. €${stdEur.toFixed(2)} single-unit` : '';
      return {
        id: offer.id,
        slug: offer.id,
        sku: `SKU-PHARM-BULK-${idx + 1}`,
        name: `${offer.productName} (${offer.strength})`,
        canonicalName: offer.productName,
        subtitle: `${offer.packLabel} · Batch MOQ ×${offer.packsPerBatch}${savingsBadge}`,
        category: 'E. Bulk Batch Offers (MOQ 33–50)',
        packSize: `${offer.packLabel} · MOQ ${offer.packsPerBatch}`,
        volume: `${offer.packLabel} (Batch ×${offer.packsPerBatch})`,
        presentation: `${offer.packagingType} · Batch ×${offer.packsPerBatch}`,
        keyActives: `${offer.productName} ${offer.strength} · ${offer.batchSize} ${offer.batchUnit} batch`,
        clinicalFocus: `Institutional bulk compounding batch (${offer.packsPerBatch} packs/batch) · EU GMP Certified. Excl. VAT.${savingsBadge}`,
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
  }, [pharmapolisProducts]);

  const enrichedPharmapolisProducts = useMemo(() => {
    const offers = getAllPharmapolisHrtBulkOffers();
    return pharmapolisProducts.map((p) => {
      const pName = String(p?.name || p?.canonicalName || '').toLowerCase();
      const matched = offers.find((o) => {
        const oName = o.productName.toLowerCase();
        if (oName.includes('progesterone capsules') && pName.includes('progesterone capsules')) return true;
        if (oName.includes('testosterone cream (women)') && pName.includes('testosterone cream, women')) return true;
        if (oName.includes('testosterone cream (men)') && pName.includes('testosterone cream/gel, men')) return true;
        if (oName.includes('biest cream') && pName.includes('biest 80:20')) return true;
        if (oName.includes('progesterone cream') && pName.includes('progesterone cream')) return true;
        return false;
      });
      if (!matched) return p;
      const note = `Bulk Batch MOQ ×${matched.packsPerBatch}: €${matched.bulkOfferExclVatEur.toFixed(2)} excl. VAT (${matched.strength})`;
      return {
        ...p,
        clinicalFocus: p.clinicalFocus ? `${p.clinicalFocus} · ${note}` : note,
      };
    });
  }, [pharmapolisProducts]);

  const activeProducts = useMemo(() => {
    if (selectedLab === 'pharmapolis_bulk') {
      return bulkProducts;
    }
    if (selectedLab === 'pharmapolis_all') {
      return [...enrichedPharmapolisProducts, ...bulkProducts];
    }
    if (selectedLab === 'pharmapolis' && enrichedPharmapolisProducts.length > 0) {
      return enrichedPharmapolisProducts;
    }
    if (selectedLab === 'nplab') {
      return nplabProducts;
    }
    if (selectedLab === 'all') {
      return [...enrichedPharmapolisProducts, ...bulkProducts, ...nplabProducts];
    }
    return enrichedPharmapolisProducts.length > 0 ? enrichedPharmapolisProducts : initialProducts;
  }, [selectedLab, enrichedPharmapolisProducts, bulkProducts, nplabProducts, initialProducts]);

  const config = useMemo(() => {
    const isPharmapolis = supplierLock === 'pharmapolis' || selectedLab.startsWith('pharmapolis');
    const isNplabOnly = supplierLock === 'nplab' || selectedLab === 'nplab';
    return {
      sectionLabel: t('B2B Compounding Pharmacy', 'Farmacia Magistral B2B'),
      navCurrentLabel: isPharmapolis
        ? t('EU GMP Bioidentical HRT (BHRT & Pellets)', 'HRT Bioidéntica EU GMP (BHRT y Pellets)')
        : isNplabOnly
          ? t('Endocrinology & Hormones (TRT & BHRT)', 'Endocrinología y Hormonas (TRT y BHRT)')
          : t('EU GMP Bioidentical & Endocrine Hormones', 'Hormonas Bioidénticas y Endocrinología EU GMP'),
      loginRedirect: supplierLock === 'pharmapolis' ? '/pricing/pharmapolis-hrt' : '/pricing/nplab-hormones',
      switcherFormat: supplierLock === 'pharmapolis' ? 'pharmapolis-hrt' : 'nplab-hormones',
      brandLeft: 'ATLAS HEALTH',
      brandRight: isPharmapolis
        ? 'EU GMP · BIOIDENTICAL HRT'
        : isNplabOnly
          ? 'COMPOUNDED HORMONES · BHRT'
          : 'EU GMP · COMPOUNDED HORMONES',
      documentTitle: isPharmapolis
        ? t('EU GMP BIOIDENTICAL HRT & PELLETS SCHEDULE', 'TARIFA OFICIAL EU GMP HRT Y PELLETS')
        : isNplabOnly
          ? t('TRT, BHRT & SUBCUTANEOUS PELLETS SCHEDULE', 'TARIFA OFICIAL TRT, BHRT Y PELLETS SUBCUTÁNEOS')
          : t("MEN'S TRT, BHRT & SUBCUTANEOUS PELLETS SCHEDULE", 'TARIFA DE HORMONAS TRT, BHRT Y PELLETS SUBCUTÁNEOS'),
      documentSubtitle: isPharmapolis
        ? t(
            'Master Preparations & Institutional Bulk Batches · Topical Topi-CLICK, Oral Capsules, Subcutaneous Pellets & Vaginal · EUR',
            'Preparaciones Maestras y Lotes Institucionales · Cremas Topi-CLICK, Cápsulas Orales, Pellets Subcutáneos y Vaginales · EUR'
          )
        : t(
            'Bioidentical Hormone Replacement Therapy (BHRT), Pellets & Testosterone Formulations · Cost Basis in EUR',
            'Terapia Hormonal Bioidéntica (BHRT), Pellets y Formulaciones de Testosterona · Base en EUR'
          ),
      documentRef: isPharmapolis ? 'DOC-BG-PHARM-HORM-2026' : 'DOC-EU-NPLAB-HORM-2026',
      defaultCurrency: ['EUR', 'AED', 'USD'].includes(initialCurrency) ? initialCurrency : 'EUR',
      availableCurrencies: ['EUR', 'AED', 'USD'],
      defaultMarkupPct: 15,
      skuPrefixPattern: /^SKU-(PHARM-HORM|PHARM-BULK|NPLAB)-/i,
      searchPlaceholder: t(
        'Search hormones by preparation, strength or active ingredient (Biest, Triest, Progesterone, Testosterone, Pellets, DHEA)...',
        'Buscar hormonas por preparación, concentración o principio activo (Biest, Triest, Progesterona, Testosterona, Pellets, DHEA)...'
      ),
      storageNamespace: isPharmapolis ? 'pharmapolis_hormones_pricing' : 'nplab_hormones_pricing',
      exportBrandTitle: isPharmapolis ? 'Pharmapolis Bulgaria Hormones' : 'NP LABS Hormones',
      exportFilePrefix: isPharmapolis ? 'Pharmapolis_Hormones_Price_Schedule' : 'NPLAB_Hormones_Price_Schedule',
      whatsappHeader: isPharmapolis
        ? '*PHARMAPOLIS BULGARIA EU GMP — HRT, CAPSULES & PELLETS SCHEDULE*'
        : '*NP LABS INTERNATIONAL COMPOUNDING — TRT & BHRT SCHEDULE*',
      persistInlineEdits: true,
    };
  }, [selectedLab, supplierLock, initialCurrency, t]);

  const switcherTabs = useMemo(() => {
    if (supplierLock === 'pharmapolis') {
      return [
        {
          id: 'pharmapolis_all',
          label: t(
            `All EU GMP HRT (${enrichedPharmapolisProducts.length + bulkProducts.length})`,
            `Todo HRT Pharmapolis (${enrichedPharmapolisProducts.length + bulkProducts.length})`
          ),
        },
        {
          id: 'pharmapolis',
          label: t(
            `🇧🇬 Standard Master Preparations (${enrichedPharmapolisProducts.length})`,
            `🇧🇬 Preparaciones Maestras (${enrichedPharmapolisProducts.length})`
          ),
        },
        {
          id: 'pharmapolis_bulk',
          label: t(
            `📦 Bulk Batch Offers (MOQ 33–50 · ${bulkProducts.length})`,
            `📦 Lotes Bulk (MOQ 33–50 · ${bulkProducts.length})`
          ),
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
        label: `🇧🇬 Pharmapolis Bulgaria (${enrichedPharmapolisProducts.length} Master Preparations)`,
      },
      {
        id: 'pharmapolis_bulk',
        label: `📦 Pharmapolis Bulk Batch (MOQ 33–50 · ${bulkProducts.length})`,
      },
      {
        id: 'nplab',
        label: `🇬🇷 NP LABS Legacy (${nplabProducts.length} SKUs)`,
      },
      {
        id: 'all',
        label: `All EU GMP Hormones (${enrichedPharmapolisProducts.length + nplabProducts.length})`,
      },
    ];
  }, [supplierLock, enrichedPharmapolisProducts.length, bulkProducts.length, nplabProducts.length, t]);

  const clinicalProfileChips = useMemo(() => {
    if (supplierLock !== 'pharmapolis') return [];
    return [
      { id: 'all', label: t('All Routes', 'Todas las Vías'), cat: 'all', lab: 'pharmapolis_all' },
      { id: 'topical', label: t('Topi-CLICK Creams', 'Cremas Topi-CLICK'), cat: 'A. Topical / transdermal', lab: 'pharmapolis' },
      { id: 'oral', label: t('Oral Capsules', 'Cápsulas Orales'), cat: 'B. Oral (capsules)', lab: 'pharmapolis' },
      { id: 'pellets', label: t('Subcutaneous Pellets', 'Pellets Subcutáneos'), cat: 'C. Pellets', lab: 'pharmapolis' },
      { id: 'vaginal', label: t('Vaginal / Mucosal', 'Vaginal / Mucosa'), cat: 'D. Vaginal', lab: 'pharmapolis' },
      { id: 'bulk', label: t('Bulk MOQ 33–50', 'Lotes MOQ 33–50'), cat: 'all', lab: 'pharmapolis_bulk' },
    ];
  }, [supplierLock, t]);

  const topShellSlot = switcherTabs.length > 1 ? (
    <div
      className="no-print"
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '10px 14px',
        marginBottom: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {supplierLock === 'pharmapolis'
            ? t('Pharmapolis EU GMP Catalog Views:', 'Vistas del Catálogo Pharmapolis EU GMP:')
            : t('Compounding Laboratory Schedule:', 'Tarifa de Laboratorio:')}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {switcherTabs.map((tab) => {
            const active = selectedLab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setSelectedLab(tab.id);
                  setActiveCategoryOverride('all');
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: active ? '1px solid #1a73e8' : '1px solid #cbd5e1',
                  background: active ? '#e8f0fe' : '#ffffff',
                  color: active ? '#1a73e8' : '#334155',
                  fontSize: '0.75rem',
                  fontWeight: active ? 750 : 600,
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {clinicalProfileChips.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', marginRight: '4px' }}>
            {t('Quick Clinical Filter:', 'Filtro Clínico Rápido:')}
          </span>
          {clinicalProfileChips.map((chip) => {
            const isChipActive =
              chip.id === 'bulk'
                ? selectedLab === 'pharmapolis_bulk'
                : chip.id === 'all'
                  ? selectedLab === 'pharmapolis_all' && activeCategoryOverride === 'all'
                  : activeCategoryOverride === chip.cat && selectedLab === chip.lab;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => {
                  setSelectedLab(chip.lab);
                  setActiveCategoryOverride(chip.cat);
                }}
                style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  border: isChipActive ? '1px solid #003666' : '1px solid #e2e8f0',
                  background: isChipActive ? '#003666' : '#f8fafc',
                  color: isChipActive ? '#ffffff' : '#475569',
                  fontSize: '0.72rem',
                  fontWeight: isChipActive ? 750 : 600,
                  cursor: 'pointer',
                }}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  ) : null;

  return (
    <ModularPriceSchedule
      key={`${selectedLab}-${activeCategoryOverride}`}
      initialProducts={activeProducts}
      initialCategory={activeCategoryOverride}
      config={config}
      topShellSlot={topShellSlot}
    />
  );
}
