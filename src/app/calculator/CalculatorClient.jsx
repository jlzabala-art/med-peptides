"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { ToolWorkspaceLayout } from '@/components/shared/layouts';
import PharmacyOpsWorkspaceBar from '@/components/shared/PharmacyOpsWorkspaceBar';
import AlgoliaEntityPicker from '@/components/shared/AlgoliaEntityPicker';
import TemplateSkeleton from '@/components/shared/public/TemplateSkeleton';
import {
  Calculator as CalculatorIcon,
  Copy,
  Check,
  QrCode,
  FlaskConical,
  Syringe,
  Droplets,
  Link2,
} from '@/lib/icons';
import { parseMgFromPresentation } from '@/hooks/useReconstitution';
import { searchAlgolia } from '@/services/algoliaSearch';

const InteractiveReconstitutionGuide = dynamic(
  () => import('@/components/product/InteractiveReconstitutionGuide'),
  {
    ssr: false,
    loading: () => <TemplateSkeleton variant="detail" />,
  }
);

const DEFAULT_PEPTIDE_CATALOG = [
  {
    id: 'bpc-157',
    slug: 'bpc-157',
    name: 'BPC-157',
    supplier: 'Lotusland Pharma',
    strengths: ['2 mg', '5 mg', '10 mg', '20 mg'],
    formats: ['vial', 'pen', 'cartridge'],
  },
  {
    id: 'tb-500',
    slug: 'tb-500',
    name: 'TB-500',
    supplier: 'Lotusland Pharma',
    strengths: ['2 mg', '5 mg', '10 mg'],
    formats: ['vial', 'pen', 'cartridge'],
  },
  {
    id: 'tirzepatide',
    slug: 'tirzepatide',
    name: 'Tirzepatide',
    supplier: 'Lotusland Pharma',
    strengths: ['5 mg', '10 mg', '15 mg', '20 mg', '30 mg', '60 mg'],
    formats: ['vial', 'pen', 'cartridge'],
  },
  {
    id: 'retatrutide',
    slug: 'retatrutide',
    name: 'Retatrutide',
    supplier: 'Lotusland Pharma',
    strengths: ['5 mg', '10 mg', '15 mg', '20 mg', '30 mg'],
    formats: ['vial', 'pen', 'cartridge'],
  },
  {
    id: 'semaglutide',
    slug: 'semaglutide',
    name: 'Semaglutide',
    supplier: 'Lotusland Pharma',
    strengths: ['2 mg', '5 mg', '10 mg'],
    formats: ['vial', 'pen', 'cartridge'],
  },
  {
    id: 'ghk-cu',
    slug: 'ghk-cu',
    name: 'GHK-Cu',
    supplier: 'Lotusland Pharma',
    strengths: ['50 mg', '100 mg'],
    formats: ['vial'],
  },
  {
    id: 'cjc-1295-ipamorelin',
    slug: 'cjc-1295-ipamorelin',
    name: 'CJC-1295 + Ipamorelin',
    supplier: 'Lotusland Pharma',
    strengths: ['5 mg / 5 mg', '10 mg'],
    formats: ['vial', 'pen'],
  },
];

const FORMAT_OPTIONS = [
  { id: 'vial', name: 'Lyophilized Vial', nameEs: 'Vial Liofilizado' },
  { id: 'pen', name: 'Injector Pen (3 mL)', nameEs: 'Pluma Inyectora (3 mL)' },
  { id: 'cartridge', name: 'Cartridge (3 mL)', nameEs: 'Cartucho (3 mL)' },
];

function extractStrengthsFromHit(hit) {
  const candidates = [];
  const pushToken = (val) => {
    if (!val) return;
    const str = String(val).trim();
    if (!str) return;
    if (!candidates.includes(str)) candidates.push(str);
  };

  if (Array.isArray(hit?.availableStrengths)) {
    hit.availableStrengths.forEach((s) => pushToken(typeof s === 'object' ? (s.name || s.strength || s.dosage) : s));
  }
  if (Array.isArray(hit?.strengths)) {
    hit.strengths.forEach((s) => pushToken(typeof s === 'object' ? (s.name || s.strength || s.dosage) : s));
  }
  if (Array.isArray(hit?.variants)) {
    hit.variants.forEach((v) => pushToken(v?.strength || v?.dosage || v?.name));
  }
  if (hit?.dosage) pushToken(hit.dosage);
  if (hit?.strength) pushToken(hit.strength);

  const normalized = candidates
    .filter((c) => /\d+(?:\.\d+)?\s*(?:mg|mcg|iu)/i.test(c))
    .slice(0, 8);

  return normalized.length > 0 ? normalized : ['2 mg', '5 mg', '10 mg', '20 mg'];
}

function normalizeFormatParam(raw) {
  const val = String(raw || '').toLowerCase().trim();
  if (val.includes('pen')) return 'pen';
  if (val.includes('cartridge')) return 'cartridge';
  return 'vial';
}

function formatDoseToken(raw) {
  const s = String(raw || '').trim();
  if (!s) return '10 mg';
  if (/\d+(?:\.\d+)?\s*(?:mg|mcg|iu)/i.test(s)) {
    return s.replace(/(\d+(?:\.\d+)?)\s*(mg|mcg|iu)/i, '$1 $2').toLowerCase();
  }
  const n = parseMgFromPresentation(s, 10);
  return `${n} mg`;
}

export default function CalculatorClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lang = String(searchParams?.get('lang') || '').toLowerCase() === 'es' ? 'es' : 'en';
  const isEs = lang === 'es';

  const initialPeptideSlug = String(searchParams?.get('peptide') || searchParams?.get('slug') || 'bpc-157')
    .toLowerCase()
    .trim();
  const initialFormat = normalizeFormatParam(searchParams?.get('format') || searchParams?.get('presentation'));
  const initialDoseParam = searchParams?.get('dose') || searchParams?.get('mg') || '';

  const initialLocalMatch =
    DEFAULT_PEPTIDE_CATALOG.find(
      (p) => p.slug === initialPeptideSlug || p.id === initialPeptideSlug
    ) || DEFAULT_PEPTIDE_CATALOG[0];

  const [selectedProduct, setSelectedProduct] = useState(initialLocalMatch);
  const [formatId, setFormatId] = useState(initialFormat);
  const [selectedStrengthStr, setSelectedStrengthStr] = useState(() =>
    initialDoseParam ? formatDoseToken(initialDoseParam) : (initialLocalMatch.strengths[2] || initialLocalMatch.strengths[0] || '10 mg')
  );

  // Algolia search state (preloaded with the current peptide name)
  const [searchQuery, setSearchQuery] = useState(initialLocalMatch.name);
  const [copiedLink, setCopiedLink] = useState(false);

  // Enrich initial peptide from Algolia when launched with ?peptide=...
  useEffect(() => {
    let active = true;
    if (!initialPeptideSlug) return;
    const cleanTarget = initialPeptideSlug.replace(/-/g, ' ').toLowerCase();
    searchAlgolia(cleanTarget, { hitsPerPage: 10 })
      .then((res) => {
        if (!active || !Array.isArray(res?.products) || res.products.length === 0) return;
        const lotusHits = res.products.filter((h) =>
          String(h.supplierId || h.supplier || '').toLowerCase().includes('lotus')
        );
        const pool = lotusHits.length > 0 ? lotusHits : res.products;
        const exact =
          pool.find((h) => String(h.slug || '').toLowerCase() === initialPeptideSlug) ||
          pool.find((h) => String(h.name || '').toLowerCase() === cleanTarget) ||
          pool.find((h) => String(h.id || h.objectID || '').toLowerCase() === initialPeptideSlug) ||
          pool.find((h) => String(h.name || '').toLowerCase().startsWith(cleanTarget) && !String(h.name || '').includes('+')) ||
          pool[0];
        if (!exact) return;
        const strengths = extractStrengthsFromHit(exact);
        setSelectedProduct({
          id: exact.id || exact.objectID || exact.slug || initialPeptideSlug,
          slug: exact.slug || initialPeptideSlug,
          name: exact.name || exact.title || initialLocalMatch.name,
          supplier: exact.supplierName || 'Lotusland Pharma',
          strengths,
          formats: ['vial', 'pen', 'cartridge'],
        });
        setSearchQuery(exact.name || exact.title || initialLocalMatch.name);
        if (!initialDoseParam && strengths.length > 0) {
          setSelectedStrengthStr(strengths[0]);
        }
      })
      .catch(() => {
        /* keep local preset fallback */
      });
    return () => {
      active = false;
    };
  }, [initialPeptideSlug]);

  // Synchronize shareable URL (?peptide=...&format=...&dose=...)
  const sharePath = useMemo(() => {
    const params = new URLSearchParams();
    params.set('peptide', selectedProduct.slug || selectedProduct.id || 'bpc-157');
    params.set('format', formatId || 'vial');
    params.set('dose', selectedStrengthStr.replace(/\s+/g, ''));
    if (isEs) params.set('lang', 'es');
    return `/calculator?${params.toString()}`;
  }, [selectedProduct, formatId, selectedStrengthStr, isEs]);

  useEffect(() => {
    router.replace(sharePath, { scroll: false });
  }, [sharePath, router]);

  const handleSelectPeptideHit = useCallback((hit, preferredDose = null) => {
    const strengths = Array.isArray(hit.strengths) ? hit.strengths : extractStrengthsFromHit(hit);
    const nextProduct = {
      id: hit.id || hit.objectID || hit.slug,
      slug: hit.slug || String(hit.name || 'peptide').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: hit.name || hit.title || 'Peptide',
      supplier: hit.supplierName || hit.supplier || 'Lotusland Pharma',
      strengths,
      formats: hit.formats || ['vial', 'pen', 'cartridge'],
    };
    setSelectedProduct(nextProduct);
    setSearchQuery(nextProduct.name);
    setSelectedStrengthStr(preferredDose || strengths[0] || '10 mg');
  }, []);

  const shareFullUrl = useMemo(() => {
    if (typeof window === 'undefined') return `https://www.atlashealth-services.com${sharePath}`;
    return `${window.location.origin}${sharePath}`;
  }, [sharePath]);

  const handleCopyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareFullUrl);
      setCopiedLink(true);
      toast.success(isEs ? 'Enlace de calculadora copiado' : 'Shareable calculator link copied');
      setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      toast.error('Copy failed');
    }
  };

  const handleOpenQr = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('open-global-qr-modal', {
          detail: {
            url: shareFullUrl,
            title: `${selectedProduct.name} · ${selectedStrengthStr} (${formatId.toUpperCase()})`,
            subtitle: isEs
              ? 'Escanea para abrir la calculadora preconfigurada con este péptido y dosis'
              : 'Scan to open the reconstitution calculator preloaded with this peptide & dosage',
          },
        })
      );
    }
  };

  const availableStrengths = useMemo(() => {
    const list = selectedProduct.strengths || ['5 mg', '10 mg'];
    const merged = list.includes(selectedStrengthStr) ? list : [selectedStrengthStr, ...list];
    return merged.map((s) => ({ id: s, name: s }));
  }, [selectedProduct.strengths, selectedStrengthStr]);

  const selectedStrength = useMemo(() => {
    return availableStrengths.find((s) => s.name === selectedStrengthStr) || availableStrengths[0] || { id: '10 mg', name: '10 mg' };
  }, [availableStrengths, selectedStrengthStr]);

  const activeFormat = useMemo(
    () => FORMAT_OPTIONS.find((f) => f.id === formatId) || FORMAT_OPTIONS[0],
    [formatId]
  );

  const productObj = useMemo(
    () => ({
      id: selectedProduct.id,
      slug: selectedProduct.slug,
      name: selectedProduct.name,
      dosage: selectedStrength.name,
    }),
    [selectedProduct, selectedStrength]
  );

  const toolbarActions = (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
      <button
        type="button"
        className="gcp-btn-secondary"
        onClick={handleOpenQr}
        style={{ fontSize: '0.78rem', padding: '6px 12px', minHeight: '38px' }}
      >
        <QrCode size={15} />
        <span>{isEs ? 'QR Directo' : 'Share QR'}</span>
      </button>
      <button
        type="button"
        className="gcp-btn-primary"
        onClick={handleCopyShareUrl}
        style={{ fontSize: '0.78rem', padding: '6px 14px', minHeight: '38px' }}
      >
        {copiedLink ? <Check size={15} /> : <Copy size={15} />}
        <span>{copiedLink ? (isEs ? 'Copiado' : 'Copied') : (isEs ? 'Copiar Enlace' : 'Copy Calculator Link')}</span>
      </button>
    </div>
  );

  return (
    <ToolWorkspaceLayout
      title={isEs ? 'Calculadora Clínica de Reconstitución' : 'Peptide Reconstitution & Dosing Calculator'}
      subtitle={
        isEs
          ? 'Simulador clínico unificado · Búsqueda Lotusland por Algolia y enlace directo por péptido, formato y dosis'
          : 'Unified clinical simulator · Algolia Lotusland peptide search with shareable peptide, format & dosage URL'
      }
      icon={CalculatorIcon}
      showPublicHeader={true}
      showPublicFooter={true}
      toolbarActions={toolbarActions}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ margin: '-8px -16px 0' }}>
          <PharmacyOpsWorkspaceBar lang={lang} />
        </div>
        {/* 1. 4 Executive KPI Cards (Golden Rule #22) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: '10px',
          }}
        >
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <FlaskConical size={13} color="#003666" />
              <span>{isEs ? 'Péptido & Formato' : 'Compound & Format'}</span>
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
              {selectedProduct.name}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#475569' }}>
              {isEs ? activeFormat.nameEs : activeFormat.name} · {selectedProduct.supplier}
            </div>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <Droplets size={13} color="#0284c7" />
              <span>{isEs ? 'Dosis del Vial' : 'Vial Strength'}</span>
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
              {selectedStrength.name}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#475569' }}>
              {availableStrengths.length} {isEs ? 'concentraciones disponibles' : 'available strengths'}
            </div>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <Syringe size={13} color="#16a34a" />
              <span>{isEs ? 'Estándar Jeringa' : 'Syringe Standard'}</span>
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
              U-100 Insulin
            </div>
            <div style={{ fontSize: '0.74rem', color: '#475569' }}>
              0.3 mL / 0.5 mL / 1.0 mL
            </div>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <Link2 size={13} color="#4f46e5" />
              <span>{isEs ? 'URL Compartible' : 'Shareable URL'}</span>
            </div>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1d4ed8', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              ?peptide={selectedProduct.slug}&amp;format={formatId}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#475569' }}>
              dose={selectedStrengthStr.replace(/\s+/g, '')}
            </div>
          </div>
        </div>

        {/* 2. Unified AlgoliaEntityPicker (Lotusland Peptides) + Dosage & Format Chips */}
        <div
          style={{
            position: 'relative',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <AlgoliaEntityPicker
            indexName="products"
            value={searchQuery}
            onChange={setSearchQuery}
            onSelect={(hit, preferredDose) => handleSelectPeptideHit(hit, preferredDose)}
            fallbackItems={DEFAULT_PEPTIDE_CATALOG}
            placeholder={
              isEs
                ? 'Buscar péptido de Lotusland en Algolia (ej. BPC-157, Tirzepatide, Retatrutide...)'
                : 'Search Lotusland peptides via Algolia (e.g. BPC-157, Tirzepatide, Retatrutide...)'
            }
            headerLabel={isEs ? 'Resultados Algolia · Catálogo Lotusland' : 'Algolia Results · Lotusland Portfolio'}
            fallbackHeaderLabel={isEs ? 'Péptidos Frecuentes · Lotusland' : 'Quick Select · Lotusland Peptides'}
            storageNamespace="calculator-algolia"
            hitsPerPage={12}
            isEs={isEs}
            sortHits={(list) =>
              [...list]
                .sort((a, b) => {
                  const aLotus = String(a.supplierId || a.supplier || '').toLowerCase().includes('lotus') ? 1 : 0;
                  const bLotus = String(b.supplierId || b.supplier || '').toLowerCase().includes('lotus') ? 1 : 0;
                  return bLotus - aLotus;
                })
                .slice(0, 8)
            }
            renderItem={(item, pick) => {
              const itemStrengths = Array.isArray(item.strengths) ? item.strengths : extractStrengthsFromHit(item);
              const itemName = item.name || item.title || 'Peptide';
              return (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    borderBottom: '1px solid #f1f5f9',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => pick(null)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: 700,
                      fontSize: '0.86rem',
                      color: '#0f172a',
                    }}
                  >
                    <span>{itemName}</span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 7px', borderRadius: '9999px', background: '#eff6ff', color: '#1d4ed8' }}>
                      Lotusland
                    </span>
                  </button>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {itemStrengths.slice(0, 5).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => pick(st)}
                        style={{
                          border: '1px solid #cbd5e1',
                          background: '#f8fafc',
                          color: '#334155',
                          borderRadius: '6px',
                          padding: '2px 8px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              );
            }}
          />

          {/* Available Dosages + Delivery Format Selector */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginRight: '4px' }}>
                {isEs ? 'Dosis Disponibles:' : 'Available Dosages:'}
              </span>
              {availableStrengths.map((s) => {
                const isActive = selectedStrength.name === s.name;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedStrengthStr(s.name)}
                    style={{
                      minHeight: '34px',
                      padding: '4px 11px',
                      borderRadius: '8px',
                      border: isActive ? '1.5px solid #003666' : '1px solid #cbd5e1',
                      background: isActive ? '#003666' : '#ffffff',
                      color: isActive ? '#ffffff' : '#334155',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginRight: '4px' }}>
                {isEs ? 'Formato:' : 'Format:'}
              </span>
              {FORMAT_OPTIONS.map((f) => {
                const isActive = formatId === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFormatId(f.id)}
                    style={{
                      minHeight: '34px',
                      padding: '4px 11px',
                      borderRadius: '8px',
                      border: isActive ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                      background: isActive ? '#e0f2fe' : '#ffffff',
                      color: isActive ? '#0369a1' : '#334155',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {isEs ? f.nameEs : f.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. Unified Clinical Reconstitution Simulator */}
        <InteractiveReconstitutionGuide
          product={productObj}
          selectedStrength={selectedStrength}
          availableStrengths={availableStrengths}
          activeFormatId={formatId}
          activeFormat={activeFormat}
          availableFormats={FORMAT_OPTIONS}
          onFormatChange={setFormatId}
          lang={lang}
        />
      </div>
    </ToolWorkspaceLayout>
  );
}
