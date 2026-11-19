"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { searchAlgolia } from '@/services/algoliaSearch';
import { parseMgFromPresentation } from '@/hooks/useReconstitution';
import { usePublicWorkspace } from '@/context/PublicWorkspaceContext';

export const DEFAULT_PEPTIDE_CATALOG = [
  {
    id: 'bpc-157',
    slug: 'bpc-157',
    name: 'BPC-157',
    supplier: 'Lotusland Pharma',
    strengths: ['2 mg', '5 mg', '10 mg', '20 mg'],
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
    id: 'tb-500',
    slug: 'tb-500',
    name: 'TB-500',
    supplier: 'Lotusland Pharma',
    strengths: ['2 mg', '5 mg', '10 mg'],
    formats: ['vial', 'pen', 'cartridge'],
  },
  {
    id: 'ghk-cu',
    slug: 'ghk-cu',
    name: 'GHK-Cu',
    supplier: 'Lotusland Pharma',
    strengths: ['30 mg', '50 mg', '60 mg', '100 mg'],
    formats: ['vial', 'pen', 'cartridge'],
  },
  {
    id: 'cjc-1295-ipamorelin',
    slug: 'cjc-1295-ipamorelin',
    name: 'CJC-1295 + Ipamorelin',
    supplier: 'Lotusland Pharma',
    strengths: ['5 mg / 5 mg', '10 mg'],
    formats: ['vial', 'pen', 'cartridge'],
  },
];

export const DELIVERY_FORMAT_OPTIONS = [
  {
    id: 'vial',
    name: 'Lyophilized Vial',
    nameEs: 'Vial Liofilizado',
    shortEn: 'Powder + BAC Water',
    shortEs: 'Polvo + Agua BAC',
    descEn: 'Mix with BAC water & draw with U-100 insulin syringe',
    descEs: 'Mezclar con agua BAC y cargar con jeringa U-100',
  },
  {
    id: 'pen',
    name: 'Pre-filled Pen (3 mL)',
    nameEs: 'Pluma Precargada (3 mL)',
    shortEn: 'Ready-to-Use Device',
    shortEs: 'Lista para usar',
    descEn: 'Already filled liquid pen — attach needle & dial clicks',
    descEs: 'Ya viene cargada — solo enroscar aguja y marcar clics',
  },
  {
    id: 'cartridge',
    name: 'Refill Cartridge (3 mL)',
    nameEs: 'Cartucho Recambio (3 mL)',
    shortEn: 'For Reusable Pen',
    shortEs: 'Para pluma reutilizable',
    descEn: 'Standalone 3 mL glass refill — Step 1: load into reusable pen',
    descEs: 'Recambio suelto de 3 mL — Paso 1: insertar en tu pluma',
  },
];

export function extractStrengthsFromHit(hit) {
  const candidates = [];
  const pushToken = (val) => {
    if (!val) return;
    const str = String(val).trim();
    if (!str || candidates.includes(str)) return;
    candidates.push(str);
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

export function normalizeFormatParam(raw) {
  const val = String(raw || '').toLowerCase().trim();
  if (val.includes('cartridge')) return 'cartridge';
  if (val.includes('pen')) return 'pen';
  return 'vial';
}

export function formatDoseToken(raw) {
  const s = String(raw || '').trim();
  if (!s) return '10 mg';
  if (/\d+(?:\.\d+)?\s*(?:mg|mcg|iu)/i.test(s)) {
    return s.replace(/(\d+(?:\.\d+)?)\s*(mg|mcg|iu)/i, '$1 $2').toLowerCase();
  }
  const n = parseMgFromPresentation(s, 10);
  return `${n} mg`;
}

/**
 * Reusable Hook: useAlgoliaPeptideSelector
 * Encapsulates Algolia peptide lookup, strength/format selection, EN (default) / ES language sync,
 * shareable URL query syncing (?peptide&format&dose&lang), and QR modal triggering.
 */
export function useAlgoliaPeptideSelector({ syncUrl = true } = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workspace = usePublicWorkspace();

  const initialUrlLang = String(searchParams?.get('lang') || '').toLowerCase() === 'es' ? 'es' : 'en';
  const [localLang, setLocalLang] = useState(initialUrlLang);
  const lang = workspace?.lang || localLang || 'en';
  const isEs = lang === 'es';

  const handleLangChange = useCallback((nextLang) => {
    const normalized = nextLang === 'es' ? 'es' : 'en';
    setLocalLang(normalized);
    if (workspace?.setLang) workspace.setLang(normalized);
  }, [workspace]);

  useEffect(() => {
    if (initialUrlLang === 'es' && workspace?.setLang && workspace?.lang !== 'es') {
      workspace.setLang('es');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initialPeptideSlug = String(searchParams?.get('peptide') || searchParams?.get('slug') || 'bpc-157')
    .toLowerCase()
    .trim();
  const initialFormat = normalizeFormatParam(searchParams?.get('format') || searchParams?.get('presentation'));
  const initialDoseParam = searchParams?.get('dose') || searchParams?.get('mg') || '';

  const initialLocalMatch =
    DEFAULT_PEPTIDE_CATALOG.find((p) => p.slug === initialPeptideSlug || p.id === initialPeptideSlug) ||
    DEFAULT_PEPTIDE_CATALOG[0];

  const [selectedProduct, setSelectedProduct] = useState(initialLocalMatch);
  const [formatId, setFormatId] = useState(initialFormat);
  const [selectedStrengthStr, setSelectedStrengthStr] = useState(() =>
    initialDoseParam ? formatDoseToken(initialDoseParam) : (initialLocalMatch.strengths[1] || initialLocalMatch.strengths[0] || '5 mg')
  );
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
  }, [initialPeptideSlug, initialDoseParam, initialLocalMatch.name]);

  const sharePath = useMemo(() => {
    const params = new URLSearchParams();
    params.set('peptide', selectedProduct.slug || selectedProduct.id || 'bpc-157');
    params.set('format', formatId || 'vial');
    params.set('dose', selectedStrengthStr.replace(/\s+/g, ''));
    if (isEs) params.set('lang', 'es');
    return `/calculator?${params.toString()}`;
  }, [selectedProduct, formatId, selectedStrengthStr, isEs]);

  useEffect(() => {
    if (syncUrl) {
      router.replace(sharePath, { scroll: false });
    }
  }, [sharePath, router, syncUrl]);

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
    setSelectedStrengthStr(preferredDose || strengths[0] || '5 mg');
  }, []);

  const availableStrengths = useMemo(() => {
    const list = selectedProduct.strengths || ['5 mg', '10 mg'];
    const merged = list.includes(selectedStrengthStr) ? list : [selectedStrengthStr, ...list];
    return merged.map((s) => ({ id: s, name: s }));
  }, [selectedProduct.strengths, selectedStrengthStr]);

  const selectedStrength = useMemo(
    () => availableStrengths.find((s) => s.name === selectedStrengthStr) || availableStrengths[0] || { id: '5 mg', name: '5 mg' },
    [availableStrengths, selectedStrengthStr]
  );

  const activeFormat = useMemo(
    () => DELIVERY_FORMAT_OPTIONS.find((f) => f.id === formatId) || DELIVERY_FORMAT_OPTIONS[0],
    [formatId]
  );

  const shareFullUrl = useMemo(() => {
    if (typeof window === 'undefined') return `https://www.atlashealth-services.com${sharePath}`;
    return `${window.location.origin}${sharePath}`;
  }, [sharePath]);

  const handleCopyShareUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareFullUrl);
      setCopiedLink(true);
      toast.success(isEs ? 'Enlace de guía copiado ✓' : 'Shareable guide link copied ✓');
      setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      toast.error(isEs ? 'No se pudo copiar el enlace' : 'Copy failed');
    }
  }, [shareFullUrl, isEs]);

  const handleOpenQr = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(
      new CustomEvent('open-global-qr-modal', {
        detail: {
          url: shareFullUrl,
          title: `${selectedProduct.name} · ${selectedStrengthStr} (${isEs ? activeFormat.nameEs : activeFormat.name})`,
          subtitle: formatId === 'cartridge'
            ? (isEs ? 'Escanea para ver cómo cargar tu cartucho de 3 mL y cuántos clics marcar' : 'Scan to open your 3 mL cartridge loading & click dial guide')
            : formatId === 'pen'
            ? (isEs ? 'Escanea para ver cuántos clics marcar en tu pluma precargada' : 'Scan to open your pre-filled pen click dosing guide')
            : (isEs ? 'Escanea para ver cómo mezclar tu vial y hasta qué marca llenar la jeringa' : 'Scan to open your visual vial mixing & U-100 syringe draw guide'),
        },
      })
    );
  }, [shareFullUrl, selectedProduct.name, selectedStrengthStr, isEs, activeFormat, formatId]);

  return {
    lang,
    isEs,
    handleLangChange,
    selectedProduct,
    formatId,
    setFormatId,
    activeFormat,
    selectedStrengthStr,
    setSelectedStrengthStr,
    availableStrengths,
    selectedStrength,
    searchQuery,
    setSearchQuery,
    handleSelectPeptideHit,
    sharePath,
    shareFullUrl,
    copiedLink,
    handleCopyShareUrl,
    handleOpenQr,
    formatOptions: DELIVERY_FORMAT_OPTIONS,
    quickPeptides: DEFAULT_PEPTIDE_CATALOG,
  };
}
