'use client';

import React, { useState, useMemo } from 'react';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import CatalogPricingBridgeBar from '@/components/shared/CatalogPricingBridgeBar';
import PageHeroCard from '@/components/ui/PageHeroCard';
import MetricCard from '@/components/ui/MetricCard';
import GlobalSearchBar from '@/components/ui/GlobalSearchBar';
import DataTable from '@/components/ui/DataTable';
import CopyableId from '@/components/ui/CopyableId';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import ProductQuickViewDrawer from '@/components/shared/ProductQuickViewDrawer';
import { exportPriceSchedulePdf } from '@/utils/exportPriceSchedulePdf';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, Syringe, Layers, ShieldCheck, Download } from 'lucide-react';
import '../colway/ColwayPriceList.css';

const FX_FROM_EUR = {
  EUR: 1,
  USD: 1.08,
  AED: 3.98
};

function convertFromEur(amountEur, targetCurrency) {
  const n = Number(amountEur || 0);
  if (!n) return 0;
  const rate = FX_FROM_EUR[targetCurrency] || 1;
  return Math.round((n * rate + Number.EPSILON) * 100) / 100;
}

function formatMoney(amount, currency) {
  const sym = currency === 'EUR' ? '€' : (currency === 'USD' ? '$' : 'AED ');
  return `${sym}${Number(amount || 0).toFixed(2)}`;
}

export default function FillersPriceListClient({
  initialProducts = [],
  initialCurrency = 'EUR',
  initialLang = 'en'
}) {
  const { activeRole } = useAuth();
  const isAdmin = activeRole === 'admin';

  const [lang, setLang] = useState(initialLang);
  const isEs = lang === 'es';
  const [currency, setCurrency] = useState(initialCurrency);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [tierMode, setTierMode] = useState('clinic'); // 'wholesale' (+15%) | 'clinic' (+15%+15%) | 'retail' (+50%) | 'master' (cost)
  const [quickProduct, setQuickProduct] = useState(null);

  const subcategories = useMemo(() => {
    const set = new Set();
    initialProducts.forEach((p) => {
      if (p.subcategory) set.add(String(p.subcategory));
    });
    return ['all', ...Array.from(set).sort()];
  }, [initialProducts]);

  const enrichedRows = useMemo(() => {
    return initialProducts.map((p) => {
      const pPricing = p.pricing || {};
      const baseCostEur = Number(
        pPricing.masterPrice ??
        p.cost ??
        p.costPrice ??
        p.unit_price ??
        p.price ??
        0
      );

      const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
      const masterEur = round2(baseCostEur);
      const mediluxeEur = round2(pPricing.mediluxePrice ?? masterEur * 1.15);
      const wholesaleEur = round2(pPricing.wholesalePrice ?? mediluxeEur * 1.15);
      const clinicEur = round2(pPricing.clinicPrice ?? masterEur * 1.45);

      return {
        ...p,
        code: p.atlas_product_code || p.sku || p.id,
        masterPrice: convertFromEur(masterEur, currency),
        wholesalePrice: convertFromEur(mediluxeEur, currency),
        clinicPrice: convertFromEur(wholesaleEur, currency),
        retailPrice: convertFromEur(clinicEur, currency)
      };
    });
  }, [initialProducts, currency]);

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return enrichedRows.filter((r) => {
      if (selectedSubcategory !== 'all' && String(r.subcategory || '') !== selectedSubcategory) {
        return false;
      }
      if (!q) return true;
      const hay = `${r.name || ''} ${r.brand || ''} ${r.product_name || ''} ${r.subcategory || ''} ${r.code || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [enrichedRows, searchQuery, selectedSubcategory]);

  const boostersCount = useMemo(
    () => enrichedRows.filter((r) => /booster|polynucleotide|biostimulator/i.test(`${r.subcategory || ''} ${r.name || ''}`)).length,
    [enrichedRows]
  );

  const columns = useMemo(() => {
    const cols = [
      {
        key: 'code',
        label: isEs ? 'Código' : 'Code',
        width: '130px',
        render: (_val, row) => <CopyableId value={row.code} />
      },
      {
        key: 'name',
        label: isEs ? 'Producto / Marca' : 'Product / Brand',
        render: (_val, row) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <button
              type="button"
              onClick={() => setQuickProduct({ slug: row.slug || row.id, title: row.name || row.product_name })}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                textAlign: 'left',
                color: '#003666',
                fontWeight: 750,
                fontSize: '0.86rem',
                cursor: 'pointer'
              }}
            >
              {row.name || row.product_name}
            </button>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              {row.brand ? `${row.brand} · ` : ''}{row.subcategory || 'Aesthetic Injectable'}
            </span>
          </div>
        )
      },
      {
        key: 'status',
        label: isEs ? 'Estado' : 'Status',
        width: '110px',
        render: (_val, row) => <StatusBadge status={row.status || 'published'} />
      }
    ];

    if (isAdmin && tierMode === 'master') {
      cols.push({
        key: 'masterPrice',
        label: isEs ? 'Coste' : 'Cost',
        width: '110px',
        render: (_val, row) => (
          <span style={{ fontWeight: 700, color: '#475569' }}>
            {formatMoney(row.masterPrice, currency)}
          </span>
        )
      });
    }

    if (isAdmin && (tierMode === 'wholesale' || tierMode === 'master')) {
      cols.push({
        key: 'wholesalePrice',
        label: 'Mediluxe',
        width: '120px',
        render: (_val, row) => (
          <span style={{ fontWeight: 700, color: '#0369a1' }}>
            {formatMoney(row.wholesalePrice, currency)}
          </span>
        )
      });
    }

    cols.push({
      key: 'clinicPrice',
      label: isEs ? `Precio B2B (${currency})` : `B2B Price (${currency})`,
      width: '140px',
      render: (_val, row) => (
        <span style={{ fontWeight: 800, color: '#003666', fontSize: '0.9rem' }}>
          {formatMoney(row.clinicPrice, currency)}
        </span>
      )
    });

    cols.push({
      key: 'retailPrice',
      label: isEs ? 'PVP Ref.' : 'Retail Ref.',
      width: '125px',
      render: (_val, row) => (
        <span style={{ fontWeight: 600, color: '#64748b' }}>
          {formatMoney(row.retailPrice, currency)}
        </span>
      )
    });

    return cols;
  }, [isEs, isAdmin, tierMode, currency]);

  const handleExportPdf = () => {
    exportPriceSchedulePdf({
      group: {
        id: 'fillers',
        label: isEs ? 'Inyectables Estéticos y Skin Boosters' : 'Aesthetic Injectables & Skin Boosters',
        description: isEs
          ? 'Tarifa oficial B2B · Skin Boosters, Fillers Dérmicos, Bioestimuladores y Polinucleótidos'
          : 'Official B2B Clinical Price Schedule · Skin Boosters, Dermal Fillers, Biostimulators & Polynucleotides',
        currency,
        supplier: 'PharmaMedic / Atlas Verified Network',
        documentRef: 'CAT-B2B-FILLERS-2026'
      },
      products: filteredRows.map((r) => ({
        ...r,
        id: r.code,
        packSize: r.subcategory || 'Standard',
        inStock: true
      })),
      tier: isAdmin ? 'admin' : 'wholesale',
      priceFor: (row) => ({
        price: row.clinicPrice,
        costPrice: row.masterPrice,
        mediluxePrice: row.wholesalePrice,
        wholesalePrice: row.clinicPrice,
        clinicPrice: row.retailPrice
      }),
      formatPrice: (val, cur) => formatMoney(val, cur || currency),
      brandFilter: selectedSubcategory,
      isGuest: !isAdmin
    });
  };

  return (
    <div className="colway-price-root atlas-page-bg">
      <PublicUnifiedHeader
        brandHref="/"
        lang={lang}
        onLangChange={setLang}
        currency={currency}
        onCurrencyChange={setCurrency}
        loginRedirect="/pricing/fillers"
        breadcrumb={[
          { label: isEs ? 'Tarifas B2B' : 'B2B Pricing', href: '/pricing' },
          { label: isEs ? 'Boosters & Fillers' : 'Boosters & Fillers' }
        ]}
      />

      <CatalogPricingBridgeBar activeMode="pricing" slug="fillers" lang={lang} />

      <main className="atlas-page-shell" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <PageHeroCard
          brandLeft="ATLAS HEALTH × PHARMAMEDIC"
          brandRight={isEs ? 'TARIFA OFICIAL B2B' : 'OFFICIAL B2B SCHEDULE'}
          badges={[
            isEs ? 'Skin Boosters · Fillers · Polinucleótidos' : 'Skin Boosters · Fillers · Polynucleotides',
            isEs ? 'Margen Estándar +15% / +15%' : 'Standard +15% / +15% Tiering'
          ]}
          title={isEs ? 'Inyectables Estéticos & Skin Boosters (Lorenzo)' : 'Aesthetic Injectables & Skin Boosters (Lorenzo)'}
          subtitle={
            isEs
              ? 'Tarifa homogénea B2B en tiempo real con niveles Mayorista (+15%), Clínica/Wholeseller (+15% + 15%) y PVP (+50%).'
              : 'Homogeneous real-time B2B price schedule with Wholesale (+15%), Clinic/Wholeseller (+15% + 15%), and Retail (+50%) tiers.'
          }
          actions={
            <button
              type="button"
              onClick={handleExportPdf}
              className="gcp-btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Download size={14} />
              <span>{isEs ? 'Descargar Tarifa PDF' : 'Download PDF Schedule'}</span>
            </button>
          }
        />

        <div className="atlas-kpi-grid" style={{ marginBottom: 0 }}>
          <MetricCard
            title="Total Catalog SKUs"
            value={String(enrichedRows.length)}
            subtitle="Active in Firestore"
            icon={Layers}
          />
          <MetricCard
            title="Skin Boosters & Bio"
            value={String(boostersCount)}
            subtitle="Boosters & Polynucleotides"
            icon={Sparkles}
          />
          <MetricCard
            title="B2B Margin Structure"
            value="+15% / +15%"
            subtitle="Mediluxe + Wholeseller"
            icon={ShieldCheck}
          />
          <MetricCard
            title="Active Currency"
            value={currency}
            subtitle="Live FX Conversion"
            icon={Syringe}
          />
        </div>

        <GlobalSearchBar
          size="lg"
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={isEs ? 'Buscar booster, filler, marca o código...' : 'Search booster, filler, brand or code...'}
          resultCount={filteredRows.length}
          filters={subcategories.map((sub) => ({
            id: sub,
            label: sub === 'all' ? (isEs ? 'Todos' : 'All') : sub,
            active: selectedSubcategory === sub,
            onClick: () => setSelectedSubcategory(sub)
          }))}
        />

        {isAdmin && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>
              {isEs ? 'Vista de margen:' : 'Margin view:'}
            </span>
            {[
              { id: 'clinic', label: 'B2B (+15% + 15%)' },
              { id: 'wholesale', label: 'Mediluxe (+15%)' },
              { id: 'master', label: 'Master Cost' }
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTierMode(t.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: tierMode === t.id ? '1.5px solid #003666' : '1px solid #cbd5e1',
                  background: tierMode === t.id ? '#eff6ff' : '#ffffff',
                  color: tierMode === t.id ? '#003666' : '#475569',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {filteredRows.length === 0 ? (
          <EmptyState
            icon={Syringe}
            title={isEs ? 'Sin resultados en tarifa' : 'No matching injectables'}
            subtitle={isEs ? 'Prueba limpiando la búsqueda o cambiando la subcategoría.' : 'Try clearing your search or switching subcategory.'}
            action={{
              label: isEs ? 'Limpiar filtros' : 'Reset filters',
              onClick: () => {
                setSearchQuery('');
                setSelectedSubcategory('all');
              }
            }}
          />
        ) : (
          <DataTable
            data={filteredRows}
            columns={columns}
            pageSize={50}
          />
        )}
      </main>

      <ProductQuickViewDrawer
        isOpen={Boolean(quickProduct)}
        slug={quickProduct?.slug || ''}
        title={quickProduct?.title || ''}
        isEs={isEs}
        onClose={() => setQuickProduct(null)}
      />

      <PublicUnifiedFooter lang={lang} />
    </div>
  );
}
