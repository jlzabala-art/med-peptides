'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
import DocumentPreviewModal from '@/components/ui/DocumentPreviewModal';
import ProductQuickViewDrawer from '@/components/shared/ProductQuickViewDrawer';
import PriceScheduleRowActions from '@/components/pricing/shared/PriceScheduleRowActions';
import PriceScheduleExpandedActions from '@/components/pricing/shared/PriceScheduleExpandedActions';
import { convertCurrencyAmount } from '@/utils/productViewModel';
import { useRegisterAtlasContext } from '@/context/AtlasContextProvider';
import { usePublicWorkspace } from '@/context/PublicWorkspaceContext';
import { trackSearchClick, trackConversion } from '@/services/algoliaInsights';
import { getTrendingItems } from '@/services/algoliaRecommendService';
import { Sparkles, Syringe, Layers, ShieldCheck, Download } from 'lucide-react';
import '../colway/ColwayPriceList.css';

function convertFromEur(amountEur, targetCurrency) {
  return convertCurrencyAmount(amountEur, 'EUR', targetCurrency);
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
  const workspace = usePublicWorkspace?.() || null;
  const [localLang, setLocalLang] = useState(initialLang);
  const [localCurrency, setLocalCurrency] = useState(initialCurrency);
  const lang = workspace?.lang || localLang;
  const isEs = lang === 'es';
  const currency = workspace?.currency || localCurrency;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedType, setSelectedType] = useState('all'); // 'all' | 'boosters' | 'fillers' | 'biostimulators'
  const [quickProduct, setQuickProduct] = useState(null);
  const [trendingFillers, setTrendingFillers] = useState([]);
  const [pdfPreviewState, setPdfPreviewState] = useState({ open: false, blob: null, name: '' });

  useEffect(() => {
    let active = true;
    getTrendingItems({
      indexName: 'products',
      facetName: 'categoryId',
      facetValue: 'dermal-fillers',
      maxRecommendations: 4
    }).then((hits) => {
      if (active && Array.isArray(hits) && hits.length > 0) {
        setTrendingFillers(hits);
      }
    });
    return () => { active = false; };
  }, []);

  const brands = useMemo(() => {
    const set = new Set();
    initialProducts.forEach((p) => {
      if (p.brand) set.add(String(p.brand).trim());
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
      if (selectedBrand !== 'all' && String(r.brand || '').trim() !== selectedBrand) {
        return false;
      }
      if (selectedType !== 'all') {
        const sub = `${r.subcategory || ''} ${r.name || ''} ${r.technology || ''}`.toLowerCase();
        if (selectedType === 'boosters' && !/booster|revive|redensity|hydro|skinvive|philart|polynucleotide/.test(sub)) return false;
        if (selectedType === 'biostimulators' && !/sculptra|radiesse|stimulate|biostimulator|plla|caha/.test(sub)) return false;
        if (selectedType === 'fillers' && /booster|revive|redensity|hydro|skinvive|philart|polynucleotide|sculptra|radiesse|aqualyx/.test(sub)) return false;
      }
      if (!q) return true;
      const hay = `${r.name || ''} ${r.brand || ''} ${r.product_name || ''} ${r.subcategory || ''} ${r.packSize || ''} ${r.code || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [enrichedRows, searchQuery, selectedBrand, selectedType]);

  const uniqueBrandsCount = useMemo(
    () => Math.max(0, brands.length - 1),
    [brands]
  );

  const columns = useMemo(() => {
    const cols = [
      {
        key: 'name',
        label: isEs ? 'Producto y Referencia' : 'Product & Reference',
        render: (_val, row) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <button
              type="button"
              onClick={() => {
                trackSearchClick({ indexName: 'products', objectID: row.id || row.slug, eventName: 'Fillers Schedule Item Clicked' });
                setQuickProduct({ slug: row.slug || row.id, title: row.name || row.product_name });
              }}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                textAlign: 'left',
                color: '#003666',
                fontWeight: 750,
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              {row.name || row.product_name}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', fontSize: '0.72rem', color: '#64748b' }}>
              <span>{row.subcategory || 'Aesthetic Injectable'}</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <CopyableId
                value={row.code}
                displayValue={row.atlas_product_code || row.sku || (String(row.code).length > 14 ? 'ID' : row.code)}
              />
              {row.status === 'out of stock' && <StatusBadge status="out of stock" />}
            </div>
          </div>
        )
      },
      {
        key: 'packSize',
        label: isEs ? 'Presentación' : 'Pack Size',
        width: '190px',
        render: (_val, row) => (
          <span style={{ fontSize: '0.78rem', color: '#334155', fontWeight: 600 }}>
            {row.packSize || row.dosage || 'Standard Box'}
          </span>
        )
      }
    ];

    cols.push({
      key: 'clinicPrice',
      label: isEs ? `Wholeseller (${currency})` : `Wholeseller Price (${currency})`,
      width: '165px',
      render: (_val, row) => (
        <span style={{ fontWeight: 800, color: '#003666', fontSize: '0.92rem' }}>
          {formatMoney(row.clinicPrice, currency)}
        </span>
      )
    });

    cols.push({
      key: 'actions',
      label: isEs ? 'Acciones' : 'Actions',
      width: '120px',
      align: 'right',
      render: (_val, row) => (
        <PriceScheduleRowActions
          item={{
            ...row,
            name: row.name || row.product_name,
            sku: row.atlas_product_code || row.sku || row.code,
          }}
          currency={currency}
          unitPrice={row.clinicPrice}
          formattedPrice={formatMoney(row.clinicPrice, currency)}
          categoryLabel="Aesthetic Injectables & Skin Boosters"
          onQuickView={(r) =>
            setQuickProduct({ slug: r.slug || r.id, title: r.name || r.product_name })
          }
        />
      )
    });

    return cols;
  }, [isEs, currency]);

  const tableRows = useMemo(() => {
    return [...filteredRows]
      .map((row) => ({
        ...row,
        brandGroup: String(row.brand || row.manufacturer || 'Other').trim(),
      }))
      .sort((a, b) => {
        const bCmp = a.brandGroup.localeCompare(b.brandGroup);
        if (bCmp !== 0) return bCmp;
        return String(a.name || a.product_name || '').localeCompare(
          String(b.name || b.product_name || '')
        );
      });
  }, [filteredRows]);

  const handleExportPdf = async () => {
    const [{ jsPDF }, { default: autoTable }, chrome] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
      import('@/lib/pdf/atlasPdfChrome')
    ]);

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const dateStr = new Date().toISOString().slice(0, 10);

    let nextY = chrome.drawAtlasInstitutionalHeader(doc, {
      title: isEs
        ? 'Inyectables Estéticos y Skin Boosters'
        : 'Aesthetic Injectables & Skin Boosters',
      subtitle: isEs
        ? 'Tarifa Oficial B2B Wholeseller · Fillers Dérmicos, Skin Boosters, Bioestimuladores y Polinucleótidos'
        : 'Official Wholeseller B2B Price Schedule · Dermal Fillers, Skin Boosters, Biostimulators & Polynucleotides',
      documentRef: 'B2B-FILLERS-2026',
      issuedDate: dateStr,
      tierLabel: isEs ? 'Tarifa Oficial Wholeseller B2B' : 'Official Wholeseller B2B Schedule'
    });

    nextY = chrome.drawAtlasKpiStrip(doc, {
      startY: nextY,
      items: [
        { label: isEs ? 'Divisa' : 'Currency', value: currency },
        { label: isEs ? 'Marcas Líderes' : 'Top Brands', value: `${uniqueBrandsCount} Brands · ${filteredRows.length} SKUs` },
        { label: isEs ? 'Stock Local' : 'Local Stock', value: isEs ? 'Disponible · 24–48h' : 'In Stock · 24–48h' }
      ]
    });

    const sortedRows = [...filteredRows].sort((a, b) => {
      const bCmp = String(a.brand || a.manufacturer || '').localeCompare(String(b.brand || b.manufacturer || ''));
      if (bCmp !== 0) return bCmp;
      return String(a.name || a.product_name || '').localeCompare(String(b.name || b.product_name || ''));
    });

    // Build brand-grouped body rows (no repetitive Availability column)
    const groupedMap = new Map();
    for (const r of sortedRows) {
      const bName = String(r.brand || r.manufacturer || 'Other').trim();
      if (!groupedMap.has(bName)) groupedMap.set(bName, []);
      groupedMap.get(bName).push(r);
    }

    const bodyRows = [];
    for (const [bName, bRows] of groupedMap.entries()) {
      bodyRows.push([
        {
          content: `${bName}  (${bRows.length} ${bRows.length === 1 ? 'SKU' : 'SKUs'})`,
          colSpan: 2,
          styles: {
            fillColor: [239, 246, 255],
            textColor: [0, 54, 102],
            fontStyle: 'bold',
            fontSize: 8.5,
            cellPadding: { top: 2.5, bottom: 2.5, left: 4, right: 4 }
          }
        }
      ]);
      for (const r of bRows) {
        const refCode = r.atlas_product_code || r.sku || r.code;
        const pack = r.packSize || r.dosage || 'Standard Box';
        const sub = r.subcategory ? `${r.subcategory} · ` : '';
        bodyRows.push([
          `${r.name || r.product_name}\n${pack} · ${sub}Ref: ${refCode}`,
          formatMoney(r.clinicPrice, currency)
        ]);
      }
    }

    autoTable(doc, {
      ...chrome.getAtlasAutoTableDefaults({ rightAlignCols: [1] }),
      startY: nextY + 2,
      margin: { top: 18, bottom: 18, left: 14, right: 14 },
      head: [[
        isEs ? 'Producto, Presentación y Referencia' : 'Product, Pack Size & Reference',
        isEs ? `Wholeseller (${currency})` : `Wholeseller (${currency})`
      ]],
      body: bodyRows,
      columnStyles: {
        0: { cellWidth: 146 },
        1: { cellWidth: 36, halign: 'right', fontStyle: 'bold' }
      }
    });

    chrome.applyAtlasRunningFooter(doc, {
      documentRef: 'B2B-FILLERS-2026',
      tierLabel: isEs ? 'Tarifa Oficial Wholeseller B2B' : 'Official Wholeseller B2B Schedule'
    });

    trackConversion({
      indexName: 'products',
      objectIDs: sortedRows.slice(0, 20).map((r) => String(r.id || r.slug)),
      eventName: 'Wholeseller Fillers PDF Exported'
    });

    const blob = doc.output('blob');
    setPdfPreviewState({
      open: true,
      blob,
      name: `WHOLESELLER_FILLERS_SCHEDULE_${currency}_${dateStr}.pdf`
    });
  };

  useRegisterAtlasContext(
    {
      contextAnchor: {
        type: 'pricing-fillers',
        name: 'Aesthetic Injectables & Skin Boosters',
        subtitle: 'Dermal Fillers · Skin Boosters · Biostimulators · Polynucleotides',
        sectionTitle: isEs
          ? 'Portafolio Clínico de Inyectables Estéticos y Skin Boosters'
          : 'Aesthetic Injectables & Skin Boosters Portfolio',
        keyActives: 'Crosslinked Hyaluronic Acid (Vycross / OBT / NASHA) · PLLA (Sculptra) · CaHA (Radiesse) · PN-HPT® Polynucleotides (PhilArt) · Deoxycholic Acid (Aqualyx)',
        products: enrichedRows.slice(0, 40).map((r) => ({
          name: r.name || r.product_name,
          brand: r.brand,
          category: r.subcategory,
          packSize: r.packSize,
          price: formatMoney(r.clinicPrice, currency),
          indication: r.indication
        })),
        category: 'dermal-fillers',
        currency,
        skuCount: enrichedRows.length
      },
      bottomBar: {
        summaryTitle: isEs ? 'Inyectables Estéticos y Skin Boosters' : 'Aesthetic Injectables & Skin Boosters',
        summarySubtitle: `${currency} · ${enrichedRows.length} SKUs · ${uniqueBrandsCount} ${isEs ? 'Marcas' : 'Brands'}`,
        badge: isEs ? 'Tarifa Wholeseller' : 'Wholeseller B2B',
        atlasAiLabel: 'Ask Atlas AI',
        primaryAction: {
          label: isEs ? 'Descargar PDF' : 'Download PDF',
          onClick: handleExportPdf
        }
      }
    },
    [isEs, currency, enrichedRows, uniqueBrandsCount]
  );

  return (
    <div className="colway-price-root atlas-page-bg">
      <PublicUnifiedHeader
        brandHref="/"
        lang={lang}
        onLangChange={(nextLang) => {
          setLocalLang(nextLang);
          workspace?.setLang?.(nextLang);
        }}
        currency={currency}
        onCurrencyChange={(nextCurr) => {
          setLocalCurrency(nextCurr);
          workspace?.setCurrency?.(nextCurr);
        }}
        loginRedirect="/pricing/fillers"
        breadcrumb={[
          { label: isEs ? 'Tarifas B2B' : 'B2B Pricing', href: '/pricing' },
          { label: isEs ? 'Boosters & Fillers' : 'Boosters & Fillers' }
        ]}
      />

      <CatalogPricingBridgeBar activeMode="pricing" slug="fillers" lang={lang} />

      <main className="atlas-page-shell" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <PageHeroCard
          brandLeft={isEs ? 'PORTAFOLIO ESTÉTICO CLÍNICO' : 'CLINICAL AESTHETICS PORTFOLIO'}
          brandRight={isEs ? 'TARIFA OFICIAL WHOLESELLER' : 'OFFICIAL WHOLESELLER SCHEDULE'}
          badges={[
            isEs ? 'Skin Boosters · Fillers · Polinucleótidos' : 'Skin Boosters · Fillers · Polynucleotides',
            isEs ? 'Marcado CE · Trazabilidad Lote' : 'CE Marked · Full Batch Traceability'
          ]}
          title={isEs ? 'Inyectables Estéticos & Skin Boosters' : 'Aesthetic Injectables & Skin Boosters'}
          subtitle={
            isEs
              ? 'Portafolio europeo certificado de Fillers Dérmicos, Skin Boosters, Bioestimuladores y Polinucleótidos con tarifa directa para clínicas.'
              : 'Certified European portfolio of Dermal Fillers, Skin Boosters, Biostimulators & Polynucleotides with direct B2B clinic pricing.'
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
            title={isEs ? 'SKUs Certificados' : 'Certified SKUs'}
            value={String(enrichedRows.length)}
            subtitle={isEs ? 'Originales con marcado CE · Trazabilidad de lote' : 'CE-marked originals · Full batch traceability'}
            icon={Layers}
          />
          <MetricCard
            title={isEs ? 'Marcas Líderes' : 'Top Market Brands'}
            value={isEs ? `${uniqueBrandsCount} Marcas` : `${uniqueBrandsCount} Brands`}
            subtitle="Juvéderm · Restylane · Belotero · Profhilo · Sculptra"
            icon={Sparkles}
          />
          <MetricCard
            title={isEs ? 'Stock Local' : 'Local Stock'}
            value={isEs ? 'Disponible' : 'In Stock'}
            subtitle={isEs ? 'Almacén local UE · Envío 24–48h' : 'Ready in local EU warehouse · 24–48h dispatch'}
            icon={ShieldCheck}
          />
          <MetricCard
            title={isEs ? 'Condiciones B2B' : 'Wholeseller Terms'}
            value={isEs ? 'B2B Directo' : 'Direct B2B'}
            subtitle={isEs ? 'Caja original precintada · Sin pedido mínimo' : 'Original sealed box · No MOQ'}
            icon={Syringe}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 320px' }}>
            <GlobalSearchBar
              size="lg"
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={isEs ? 'Buscar booster, filler, marca o código...' : 'Search booster, filler, brand or code...'}
              resultCount={filteredRows.length}
            />
          </div>

          <select
            aria-label={isEs ? 'Filtrar por tipo' : 'Filter by type'}
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            style={{
              height: '44px',
              padding: '0 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#0f172a',
              fontSize: '0.82rem',
              fontWeight: 650,
              cursor: 'pointer'
            }}
          >
            <option value="all">{isEs ? 'Tipo: Todos' : 'Type: All'}</option>
            <option value="boosters">{isEs ? 'Skin Boosters & Polinucleótidos' : 'Skin Boosters & Polynucleotides'}</option>
            <option value="fillers">{isEs ? 'Dermal Fillers (HA)' : 'Dermal Fillers (HA)'}</option>
            <option value="biostimulators">{isEs ? 'Bioestimuladores (PLLA/CaHA)' : 'Biostimulators (PLLA/CaHA)'}</option>
          </select>
        </div>

        {/* 1-Click Brand Jump Pills */}
        {brands.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {brands.map((b) => {
              const isActive = selectedBrand === b;
              return (
                <button
                  key={b}
                  type="button"
                  onClick={() => setSelectedBrand(b)}
                  style={{
                    padding: '5px 12px',
                    minHeight: '32px',
                    borderRadius: '999px',
                    border: isActive ? '1px solid #003666' : '1px solid #cbd5e1',
                    background: isActive ? '#003666' : '#ffffff',
                    color: isActive ? '#ffffff' : '#334155',
                    fontSize: '0.74rem',
                    fontWeight: isActive ? 700 : 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.12s ease'
                  }}
                >
                  {b === 'all' ? (isEs ? 'Todas las Marcas' : 'All Brands') : b}
                </button>
              );
            })}
          </div>
        )}

        {trendingFillers.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 750, color: '#64748b', textTransform: 'uppercase' }}>
              {isEs ? 'Tendencia en Clínicas:' : 'Trending in Clinics:'}
            </span>
            {trendingFillers.map((item) => (
              <button
                key={item.objectID || item.id}
                type="button"
                onClick={() => setQuickProduct({ slug: item.slug || item.objectID, title: item.name })}
                style={{
                  padding: '3px 10px',
                  borderRadius: '999px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#003666',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {item.name}
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
                setSelectedBrand('all');
                setSelectedType('all');
              }
            }}
          />
        ) : (
          <DataTable
            data={tableRows}
            columns={columns}
            keyField="id"
            hidePagination={true}
            pageSize={100}
            stickyTopOffset={64}
            groupByKey="brandGroup"
            renderGroupHeader={(brandName, _firstRow, count) => (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                background: '#e8f0fe',
                borderRadius: '6px',
                padding: '6px 12px',
              }}>
                <span style={{ fontWeight: 800, fontSize: '0.80rem', color: '#003666', letterSpacing: '0.02em' }}>
                  {brandName}
                </span>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 750,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: '#ffffff',
                  color: '#1d4ed8',
                  border: '1px solid #bfdbfe'
                }}>
                  {count} {count === 1 ? 'SKU' : 'SKUs'}
                </span>
              </div>
            )}
            expandableRender={(row) => (
              <div style={{
                padding: '14px 18px',
                background: '#f8fafc',
                borderLeft: '3px solid #003666',
                borderTop: '1px solid #e2e8f0',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ fontSize: '0.67rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {isEs ? 'Indicación Clínica' : 'Clinical Indication'}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#1e293b', lineHeight: 1.55 }}>
                    {row.indication || row.description || (isEs ? 'Formulación estética profesional para uso médico.' : 'Professional aesthetic injectable formulation for medical practice.')}
                  </p>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '130px minmax(0, 1fr)',
                  rowGap: '6px',
                  columnGap: '12px',
                  alignContent: 'start',
                  fontSize: '0.76rem'
                }}>
                  {(row.technology || row.clinical?.mechanism_of_action) && (
                    <>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>{isEs ? 'Tecnología' : 'Technology'}</span>
                      <span style={{ color: '#0f172a', fontWeight: 600 }}>{row.technology || row.clinical?.mechanism_of_action}</span>
                    </>
                  )}
                  <span style={{ color: '#64748b', fontWeight: 600 }}>{isEs ? 'Fabricante' : 'Manufacturer'}</span>
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>{row.manufacturer || row.brand || 'EU Certified'}</span>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>{isEs ? 'Conservación' : 'Storage'}</span>
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>
                    {row.requiresColdChain
                      ? (isEs ? 'Cadena fría (2–8 °C)' : 'Cold Chain (2–8 °C)')
                      : (isEs ? 'Temperatura ambiente (2–25 °C)' : 'Ambient (2–25 °C)')}
                  </span>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <PriceScheduleExpandedActions
                    item={{
                      ...row,
                      name: row.name || row.product_name,
                      sku: row.atlas_product_code || row.sku || row.code,
                    }}
                    currency={currency}
                    unitPrice={row.clinicPrice}
                    formattedPrice={formatMoney(row.clinicPrice, currency)}
                    categoryLabel="Aesthetic Injectables & Skin Boosters"
                  />
                </div>
              </div>
            )}
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

      <DocumentPreviewModal
        isOpen={pdfPreviewState.open}
        onClose={() => setPdfPreviewState({ open: false, blob: null, name: '' })}
        pdfBlob={pdfPreviewState.blob}
        downloadName={pdfPreviewState.name}
        title={isEs ? 'Inyectables Estéticos y Skin Boosters — Tarifa PDF' : 'Aesthetic Injectables & Skin Boosters — Official PDF'}
        subtitle={`${filteredRows.length} SKUs · ${currency}`}
      />

      <PublicUnifiedFooter lang={lang} />
    </div>
  );
}
