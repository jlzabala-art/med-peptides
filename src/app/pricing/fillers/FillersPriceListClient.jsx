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
import { convertCurrencyAmount } from '@/utils/productViewModel';
import { useRegisterAtlasContext } from '@/context/AtlasContextProvider';
import { useAuth } from '@/context/AuthContext';
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
  const { activeRole } = useAuth();
  const isAdmin = activeRole === 'admin';

  const [lang, setLang] = useState(initialLang);
  const isEs = lang === 'es';
  const [currency, setCurrency] = useState(initialCurrency);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedType, setSelectedType] = useState('all'); // 'all' | 'boosters' | 'fillers' | 'biostimulators'
  const [tierMode, setTierMode] = useState('clinic'); // 'wholesale' (mediluxe) | 'clinic' (wholeseller) | 'master' (cost)
  const [quickProduct, setQuickProduct] = useState(null);

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

  const minB2bPrice = useMemo(() => {
    const prices = enrichedRows.map((r) => r.clinicPrice).filter((n) => n > 0);
    return prices.length > 0 ? Math.min(...prices) : 0;
  }, [enrichedRows]);

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
              onClick={() => setQuickProduct({ slug: row.slug || row.id, title: row.name || row.product_name })}
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
      },
      {
        key: 'status',
        label: isEs ? 'Disponibilidad' : 'Availability',
        width: '115px',
        render: (_val, row) => <StatusBadge status={row.status || 'published'} />
      }
    ];

    if (isAdmin && tierMode === 'master') {
      cols.push({
        key: 'masterPrice',
        label: isEs ? 'Coste' : 'Cost',
        width: '105px',
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
        width: '115px',
        render: (_val, row) => (
          <span style={{ fontWeight: 700, color: '#0369a1' }}>
            {formatMoney(row.wholesalePrice, currency)}
          </span>
        )
      });
    }

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

    return cols;
  }, [isEs, isAdmin, tierMode, currency]);

  const groupedByBrand = useMemo(() => {
    const groups = new Map();
    for (const row of filteredRows) {
      const brandKey = String(row.brand || row.manufacturer || 'Other').trim();
      if (!groups.has(brandKey)) groups.set(brandKey, []);
      groups.get(brandKey).push(row);
    }
    return Array.from(groups.entries()).map(([brandName, rows]) => ({
      brandName,
      rows
    }));
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
        ? 'ATLAS HEALTH SERVICES — Inyectables Estéticos y Skin Boosters'
        : 'ATLAS HEALTH SERVICES — Aesthetic Injectables & Skin Boosters',
      subtitle: isEs
        ? 'Tarifa Oficial B2B Wholeseller · Fillers Dérmicos, Skin Boosters, Bioestimuladores y Polinucleótidos'
        : 'Official Wholeseller B2B Price Schedule · Dermal Fillers, Skin Boosters, Biostimulators & Polynucleotides',
      documentRef: 'CAT-B2B-FILLERS-2026',
      issuedDate: dateStr,
      tierLabel: isEs ? 'Tarifa Oficial Wholeseller B2B' : 'Official Wholeseller B2B Schedule'
    });

    nextY = chrome.drawAtlasKpiStrip(doc, {
      startY: nextY,
      items: [
        { label: isEs ? 'Divisa' : 'Currency', value: currency },
        { label: isEs ? 'Catálogo' : 'Catalog Scope', value: `${filteredRows.length} SKUs` },
        { label: isEs ? 'Red' : 'Network', value: 'Atlas Health Verified' }
      ]
    });

    const sortedRows = [...filteredRows].sort((a, b) => {
      const bCmp = String(a.brand || '').localeCompare(String(b.brand || ''));
      if (bCmp !== 0) return bCmp;
      return String(a.name || '').localeCompare(String(b.name || ''));
    });

    autoTable(doc, {
      ...chrome.getAtlasAutoTableDefaults(nextY),
      head: [[
        isEs ? 'Marca' : 'Brand',
        isEs ? 'Producto, Presentación y Ref.' : 'Product, Pack Size & Ref.',
        isEs ? 'Disponibilidad' : 'Availability',
        isEs ? `Wholeseller (${currency})` : `Wholeseller (${currency})`
      ]],
      body: sortedRows.map((r) => {
        const refCode = r.atlas_product_code || r.sku || r.code;
        const pack = r.packSize || r.dosage || 'Standard Box';
        const sub = r.subcategory ? `${r.subcategory} · ` : '';
        return [
          r.brand || r.manufacturer || '—',
          `${r.name || r.product_name}\n${pack} · ${sub}Ref: ${refCode}`,
          'In Stock',
          formatMoney(r.clinicPrice, currency)
        ];
      }),
      columnStyles: {
        0: { cellWidth: 28, fontStyle: 'bold' },
        1: { cellWidth: 96 },
        2: { cellWidth: 26, halign: 'center' },
        3: { cellWidth: 32, halign: 'right', fontStyle: 'bold' }
      }
    });

    chrome.applyAtlasRunningFooter(doc, {
      documentRef: 'CAT-B2B-FILLERS-2026',
      tierLabel: isEs ? 'Tarifa Oficial Wholeseller B2B' : 'Official Wholeseller B2B Schedule'
    });

    doc.save(`ATLAS_WHOLESELLER_FILLERS_${currency}_${dateStr}.pdf`);
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
          brandLeft="ATLAS HEALTH SERVICES"
          brandRight={isEs ? 'TARIFA OFICIAL B2B' : 'OFFICIAL B2B SCHEDULE'}
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
            subtitle={isEs ? `${uniqueBrandsCount} marcas europeas líderes` : `${uniqueBrandsCount} leading European brands`}
            icon={Layers}
          />
          <MetricCard
            title={isEs ? 'Desde (Wholeseller)' : 'Starting Wholeseller'}
            value={minB2bPrice > 0 ? formatMoney(minB2bPrice, currency) : '—'}
            subtitle={isEs ? 'Skin Boosters y Polinucleótidos' : 'Skin Boosters & Polynucleotides'}
            icon={Sparkles}
          />
          <MetricCard
            title={isEs ? 'Envío Cadena Fría' : 'Cold-Chain Dispatch'}
            value="24–48h"
            subtitle={isEs ? 'Logística verificada · Trazabilidad' : 'Verified EU logistics & batch'}
            icon={ShieldCheck}
          />
          <MetricCard
            title={isEs ? 'Condiciones B2B' : 'Wholeseller Terms'}
            value={isEs ? 'Directo' : 'Direct B2B'}
            subtitle={isEs ? 'Caja original · Sin pedido mínimo' : 'Original sealed box · No MOQ'}
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
            aria-label={isEs ? 'Filtrar por marca' : 'Filter by brand'}
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
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
            {brands.map((b) => (
              <option key={b} value={b}>
                {b === 'all' ? (isEs ? 'Marca: Todas' : 'Brand: All') : b}
              </option>
            ))}
          </select>

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
                setSelectedBrand('all');
                setSelectedType('all');
              }
            }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {groupedByBrand.map(({ brandName, rows }) => (
              <section key={brandName} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: '#003666' }}>
                      {brandName}
                    </h2>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 750,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      border: '1px solid #bfdbfe'
                    }}>
                      {rows.length} {rows.length === 1 ? 'SKU' : 'SKUs'}
                    </span>
                  </div>
                </div>
                <DataTable
                  data={rows}
                  columns={columns}
                  hidePagination={true}
                  pageSize={50}
                  expandableRender={(row) => (
                    <div style={{
                      padding: '14px 18px',
                      background: '#f8fafc',
                      borderTop: '1px solid #e2e8f0',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                      gap: '14px'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {isEs ? 'Indicación Clínica' : 'Clinical Indication'}
                        </div>
                        <p style={{ margin: 0, fontSize: '0.77rem', color: '#334155', lineHeight: 1.5 }}>
                          {row.indication || row.description || (isEs ? 'Formulación estética profesional para uso médico.' : 'Professional aesthetic injectable formulation for medical practice.')}
                        </p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', borderLeft: '1px solid #e2e8f0', paddingLeft: '14px' }}>
                        {(row.technology || row.clinical?.mechanism_of_action) && (
                          <div style={{ fontSize: '0.75rem', color: '#0f172a' }}>
                            <strong style={{ color: '#475569' }}>{isEs ? 'Tecnología / Composición:' : 'Technology / Composition:'}</strong>{' '}
                            <span>{row.technology || row.clinical?.mechanism_of_action}</span>
                          </div>
                        )}
                        <div style={{ fontSize: '0.75rem', color: '#0f172a' }}>
                          <strong style={{ color: '#475569' }}>{isEs ? 'Fabricante:' : 'Manufacturer:'}</strong>{' '}
                          <span>{row.manufacturer || row.brand || 'EU Certified'}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#0f172a' }}>
                          <strong style={{ color: '#475569' }}>{isEs ? 'Conservación:' : 'Storage:'}</strong>{' '}
                          <span>
                            {row.requiresColdChain
                              ? (isEs ? 'Cadena fría (2–8 °C)' : 'Cold Chain (2–8 °C)')
                              : (isEs ? 'Temperatura ambiente (2–25 °C)' : 'Ambient (2–25 °C)')}
                          </span>
                        </div>
                        <div style={{ paddingTop: '4px' }}>
                          <button
                            type="button"
                            onClick={() => setQuickProduct({ slug: row.slug || row.id, title: row.name || row.product_name })}
                            style={{
                              padding: '5px 11px',
                              borderRadius: '6px',
                              border: '1px solid #bfdbfe',
                              background: '#eff6ff',
                              color: '#1d4ed8',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            {isEs ? 'Abrir Ficha Completa →' : 'Open Full Monograph →'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                />
              </section>
            ))}
          </div>
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
