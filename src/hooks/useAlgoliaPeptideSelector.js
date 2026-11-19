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
    strengths: ['5 mg', '10 mg', '20 mg', '500 mcg'],
    formats: ['vial', 'pen', 'cartridge', 'capsule'],
  },
  {
    id: 'tirzepatide',
    slug: 'tirzepatide',
    name: 'Tirzepatide',
    strengths: ['5 mg', '10 mg', '15 mg', '20 mg', '30 mg', '60 mg'],
    formats: ['vial', 'pen', 'cartridge'],
  },
  {
    id: 'retatrutide',
    slug: 'retatrutide',
    name: 'Retatrutide',
    strengths: ['5 mg', '10 mg', '15 mg', '20 mg', '30 mg'],
    formats: ['vial', 'pen', 'cartridge'],
  },
  {
    id: 'semaglutide',
    slug: 'semaglutide',
    name: 'Semaglutide',
    strengths: ['2 mg', '5 mg', '10 mg'],
    formats: ['vial', 'pen', 'cartridge'],
  },
  {
    id: 'semax',
    slug: 'semax',
    name: 'Semax',
    strengths: ['10 mg', '30 mg'],
    formats: ['spray', 'vial'],
  },
  {
    id: 'selank',
    slug: 'selank',
    name: 'Selank',
    strengths: ['10 mg', '30 mg'],
    formats: ['spray', 'vial'],
  },
  {
    id: 'ghk-cu',
    slug: 'ghk-cu',
    name: 'GHK-Cu',
    strengths: ['30 mg', '50 mg', '60 mg', '100 mg'],
    formats: ['vial', 'pen', 'cartridge', 'topical'],
  },
  {
    id: 'tb-500',
    slug: 'tb-500',
    name: 'TB-500',
    strengths: ['5 mg', '10 mg'],
    formats: ['vial', 'pen', 'cartridge'],
  },
  {
    id: 'pt-141',
    slug: 'pt-141',
    name: 'PT-141 (Bremelanotide)',
    strengths: ['10 mg', '20 mg'],
    formats: ['vial', 'pen', 'spray'],
  },
  {
    id: 'kpv',
    slug: 'kpv',
    name: 'KPV',
    strengths: ['5 mg', '10 mg', '500 mcg'],
    formats: ['vial', 'pen', 'capsule', 'spray'],
  },
  {
    id: 'nad-plus',
    slug: 'nad-plus',
    name: 'NAD+',
    strengths: ['500 mg', '750 mg', '1050 mg'],
    formats: ['vial', 'pen', 'cartridge', 'spray'],
  },
];

export const DELIVERY_FORMAT_OPTIONS = [
  {
    id: 'vial',
    name: 'Lyophilized Vial',
    nameEs: 'Vial Liofilizado',
    shortEn: 'Powder + BAC Water',
    shortEs: 'Polvo + Agua BAC',
    descEn: 'Mix with BAC water & draw with U-100 syringe',
    descEs: 'Mezclar con agua BAC y cargar con jeringa U-100',
  },
  {
    id: 'pen',
    name: 'Injector Pen (3 mL)',
    nameEs: 'Pluma Inyectora (3 mL)',
    shortEn: 'Ready-to-Use Pen',
    shortEs: 'Pluma lista para usar',
    descEn: 'Factory-filled pen — attach needle & dial clicks',
    descEs: 'Cargada de fábrica — enroscar aguja y marcar clics',
  },
  {
    id: 'cartridge',
    name: 'Refill Cartridge (3 mL)',
    nameEs: 'Cartucho Recambio (3 mL)',
    shortEn: 'For Reusable Pen',
    shortEs: 'Para pluma reutilizable',
    descEn: 'Standalone 3 mL refill — Phase 1: insert into pen',
    descEs: 'Recambio suelto — Fase 1: insertar en tu pluma',
  },
  {
    id: 'spray',
    name: 'Nasal Spray',
    nameEs: 'Spray Nasal',
    shortEn: 'Metered Pump (0.1 mL)',
    shortEs: 'Pulverizador dosificado',
    descEn: 'Needle-free intranasal pump — puffs per dose',
    descEs: 'Sin agujas — pulverizaciones medidas por dosis',
  },
  {
    id: 'capsule',
    name: 'Oral Capsules / Troches',
    nameEs: 'Cápsulas / Troches Orales',
    shortEn: 'Oral / Sublingual',
    shortEs: 'Vía Oral / Sublingual',
    descEn: 'Empty-stomach enteric capsules or sublingual troches',
    descEs: 'Cápsulas en ayunas o troches sublinguales',
  },
  {
    id: 'topical',
    name: 'Topical Serum / Cream',
    nameEs: 'Sérum / Crema Tópica',
    shortEn: 'Skin / Scalp Formula',
    shortEs: 'Aplicación Dérmica / Capilar',
    descEn: 'Measured mL or airless pumps for skin or scalp',
    descEs: 'Dosis medida en mL o pulsaciones para piel/cabello',
  },
];

/**
 * Strictly excludes Bulk Raw Material / API powder entries so patients ONLY see
 * finished, ready-to-use clinical peptides in the search dropdown.
 */
export function isFinishedPatientProduct(hit) {
  if (!hit) return false;
  const name = String(hit.name || hit.title || hit.productName || '').toLowerCase();
  const slug = String(hit.slug || hit.id || hit.objectID || '').toLowerCase();
  const cat = String(hit.category || hit.productType || hit.type || '').toLowerCase();

  if (!name) return false;
  const rawApiPattern = /\b(bulk\s*api|bulk\s*powder|raw\s*material|raw\s*api|api\s*powder|raw\s*powder|active\s*pharmaceutical\s*ingredient)\b/i;
  if (rawApiPattern.test(name) || rawApiPattern.test(cat)) return false;
  if (slug.startsWith('api-') || slug.startsWith('raw-') || slug.includes('bulk-api')) return false;
  if (cat === 'bulk_api' || cat === 'raw_material' || cat === 'raw_api') return false;
  // Also exclude non-peptide lab diagnostic kits / surgical trocars
  if (/\b(trocar|dna\s*test|trichotest|telotest|nutrigen|acnetest|genomics)\b/i.test(name)) return false;
  return true;
}

/**
 * Infers all ready-to-use delivery formats available for a peptide from its Algolia record + clinical defaults.
 */
export function inferAvailableFormats(hit) {
  if (Array.isArray(hit?.formats) && hit.formats.length > 0) {
    return hit.formats;
  }
  const corpus = [
    hit?.name,
    hit?.title,
    hit?.category,
    hit?.route,
    hit?.form,
    hit?.presentation,
    ...(Array.isArray(hit?.availableFormats) ? hit.availableFormats.map((f) => (typeof f === 'string' ? f : f?.id || f?.name)) : []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const found = new Set();
  if (corpus.includes('nasal') || corpus.includes('spray') || /\b(semax|selank|oxytocin|dsip)\b/i.test(corpus)) found.add('spray');
  if (corpus.includes('capsule') || corpus.includes('oral') || corpus.includes('troche') || /\b(bpc-?157|kpv|ll-?37)\b/i.test(corpus)) found.add('capsule');
  if (corpus.includes('topical') || corpus.includes('serum') || corpus.includes('cream') || corpus.includes('shampoo') || /\b(ghk-?cu)\b/i.test(corpus)) found.add('topical');
  if (corpus.includes('cartridge')) found.add('cartridge');
  if (corpus.includes('pen')) found.add('pen');
  if (corpus.includes('vial') || corpus.includes('lyophilized') || found.size === 0) found.add('vial');

  // Injectable peptides generally exist as Vial + Injector Pen + Refill Cartridge
  if (found.has('vial') && !/\b(semax|selank)\b/i.test(corpus)) {
    found.add('pen');
    found.add('cartridge');
  }

  return DELIVERY_FORMAT_OPTIONS.map((o) => o.id).filter((id) => found.has(id));
}

export function cleanPatientProductName(raw = '') {
  return String(raw || '')
    .replace(/\b(bulk\s*api\s*powder|bulk\s*api|api\s*powder|lyophilized\s*vial)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

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
    .filter((c) => /\d+(?:\.\d+)?\s*(?:mg|mcg|iu|ml)/i.test(c))
    .slice(0, 8);

  return normalized.length > 0 ? normalized : ['5 mg', '10 mg', '20 mg'];
}

/**
 * Filter & deduplicate Algolia hits into clean, supplier-free, ready-to-use peptides.
 */
export function filterAndDeduplicatePatientPeptides(hits = []) {
  const seen = new Set();
  const clean = [];

  for (const h of hits) {
    if (!isFinishedPatientProduct(h)) continue;
    const displayName = cleanPatientProductName(h.canonicalName || h.name || h.title || '');
    if (!displayName) continue;
    const key = displayName.toLowerCase().replace(/[^a-z0-9+]+/g, '');
    if (!key || seen.has(key)) continue;
    seen.add(key);

    clean.push({
      id: h.id || h.objectID || h.slug || key,
      slug: h.slug || displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: displayName,
      strengths: extractStrengthsFromHit(h),
      formats: inferAvailableFormats(h),
    });
    if (clean.length >= 10) break;
  }

  return clean;
}

export function normalizeFormatParam(raw) {
  const val = String(raw || '').toLowerCase().trim();
  if (val.includes('cartridge')) return 'cartridge';
  if (val.includes('pen')) return 'pen';
  if (val.includes('spray') || val.includes('nasal')) return 'spray';
  if (val.includes('capsule') || val.includes('oral') || val.includes('troche')) return 'capsule';
  if (val.includes('topical') || val.includes('cream') || val.includes('serum')) return 'topical';
  return 'vial';
}

export function formatDoseToken(raw) {
  const s = String(raw || '').trim();
  if (!s) return '10 mg';
  if (/\d+(?:\.\d+)?\s*(?:mg|mcg|iu|ml)/i.test(s)) {
    return s.replace(/(\d+(?:\.\d+)?)\s*(mg|mcg|iu|ml)/i, '$1 $2').toLowerCase();
  }
  const n = parseMgFromPresentation(s, 10);
  return `${n} mg`;
}

/**
 * Reusable Hook: useAlgoliaPeptideSelector
 * Searches ONLY finished ready-to-use peptides (zero raw APIs, zero supplier tags),
 * detects available formats (Vial, Pen, Cartridge, Nasal Spray, Oral, Topical),
 * syncs ALL dosing & format params to the shareable URL, and provides EN (default) / ES sync.
 */
export function useAlgoliaPeptideSelector({ syncUrl = true, extraUrlParams = null } = {}) {
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
  const initialFormatParam = searchParams?.get('format') || searchParams?.get('presentation') || '';
  const initialStrengthParam = searchParams?.get('strength') || searchParams?.get('dose') || searchParams?.get('mg') || '';
  const initialTargetParam = searchParams?.get('target') || '';
  const initialBacParam = searchParams?.get('bac') || '';
  const initialSyringeParam = searchParams?.get('syringe') || '';
  const initialPuffsParam = searchParams?.get('puffs') || '';

  const initialLocalMatch =
    DEFAULT_PEPTIDE_CATALOG.find((p) => p.slug === initialPeptideSlug || p.id === initialPeptideSlug) ||
    DEFAULT_PEPTIDE_CATALOG[0];

  const [selectedProduct, setSelectedProduct] = useState(initialLocalMatch);
  const [formatId, setFormatId] = useState(() =>
    initialFormatParam ? normalizeFormatParam(initialFormatParam) : (initialLocalMatch.formats[0] || 'vial')
  );
  const [selectedStrengthStr, setSelectedStrengthStr] = useState(() =>
    initialStrengthParam ? formatDoseToken(initialStrengthParam) : (initialLocalMatch.strengths[0] || '5 mg')
  );
  const [searchQuery, setSearchQuery] = useState(initialLocalMatch.name);
  const [copiedLink, setCopiedLink] = useState(false);

  // Enrich initial peptide from Algolia when launched via URL
  useEffect(() => {
    let active = true;
    if (!initialPeptideSlug) return;
    const cleanTarget = initialPeptideSlug.replace(/-/g, ' ').toLowerCase();
    searchAlgolia(cleanTarget, { hitsPerPage: 12 })
      .then((res) => {
        if (!active || !Array.isArray(res?.products)) return;
        const cleanPool = filterAndDeduplicatePatientPeptides(res.products);
        if (cleanPool.length === 0) return;
        const exact =
          cleanPool.find((h) => String(h.slug || '').toLowerCase() === initialPeptideSlug) ||
          cleanPool.find((h) => String(h.name || '').toLowerCase() === cleanTarget) ||
          cleanPool[0];
        if (!exact) return;
        setSelectedProduct(exact);
        setSearchQuery(exact.name);
        if (!initialStrengthParam && exact.strengths.length > 0) {
          setSelectedStrengthStr(exact.strengths[0]);
        }
        if (!initialFormatParam && exact.formats.length > 0) {
          setFormatId(exact.formats[0]);
        }
      })
      .catch(() => {
        /* keep local preset fallback */
      });
    return () => {
      active = false;
    };
  }, [initialPeptideSlug, initialStrengthParam, initialFormatParam]);

  const handleSelectPeptideHit = useCallback((hit, preferredDose = null, preferredFormat = null) => {
    const cleanName = cleanPatientProductName(hit.name || hit.title || 'Peptide');
    const strengths = Array.isArray(hit.strengths) ? hit.strengths : extractStrengthsFromHit(hit);
    const formats = inferAvailableFormats(hit);
    const nextProduct = {
      id: hit.id || hit.objectID || hit.slug,
      slug: hit.slug || cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: cleanName,
      strengths,
      formats,
    };
    setSelectedProduct(nextProduct);
    setSearchQuery(nextProduct.name);
    setSelectedStrengthStr(preferredDose || strengths[0] || '5 mg');
    if (preferredFormat) {
      setFormatId(normalizeFormatParam(preferredFormat));
    } else if (!formats.includes(formatId)) {
      setFormatId(formats[0] || 'vial');
    }
  }, [formatId]);

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

  const buildSharePath = useCallback((overrides = {}) => {
    const params = new URLSearchParams();
    params.set('peptide', selectedProduct.slug || selectedProduct.id || 'bpc-157');
    params.set('format', formatId || 'vial');
    params.set('strength', selectedStrengthStr.replace(/\s+/g, ''));

    const mergedExtra = { ...(extraUrlParams || {}), ...(overrides || {}) };
    Object.entries(mergedExtra).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v).trim() !== '') {
        params.set(k, String(v).replace(/\s+/g, ''));
      }
    });
    if (isEs) params.set('lang', 'es');
    return `/calculator?${params.toString()}`;
  }, [selectedProduct, formatId, selectedStrengthStr, extraUrlParams, isEs]);

  const sharePath = useMemo(() => buildSharePath(), [buildSharePath]);

  useEffect(() => {
    if (syncUrl) {
      router.replace(sharePath, { scroll: false });
    }
  }, [sharePath, router, syncUrl]);

  const shareFullUrl = useMemo(() => {
    if (typeof window === 'undefined') return `https://www.atlashealth-services.com${sharePath}`;
    return `${window.location.origin}${sharePath}`;
  }, [sharePath]);

  const handleCopyShareUrl = useCallback(async (overrides = {}) => {
    const path = Object.keys(overrides || {}).length > 0 ? buildSharePath(overrides) : sharePath;
    const url = typeof window === 'undefined'
      ? `https://www.atlashealth-services.com${path}`
      : `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      toast.success(isEs ? 'Enlace personalizado con todos los datos copiado ✓' : 'Personalized guide link copied with full dosing info ✓');
      setTimeout(() => setCopiedLink(false), 2400);
    } catch {
      toast.error(isEs ? 'No se pudo copiar el enlace' : 'Copy failed');
    }
  }, [buildSharePath, sharePath, isEs]);

  const handleOpenQr = useCallback((overrides = {}) => {
    if (typeof window === 'undefined') return;
    const path = Object.keys(overrides || {}).length > 0 ? buildSharePath(overrides) : sharePath;
    const url = `${window.location.origin}${path}`;
    window.dispatchEvent(
      new CustomEvent('open-global-qr-modal', {
        detail: {
          url,
          title: `${selectedProduct.name} · ${selectedStrengthStr} · ${isEs ? activeFormat.nameEs : activeFormat.name}`,
          subtitle: isEs
            ? 'Escanea para abrir esta guía visual personalizada exactamente con tu péptido, formato y dosis'
            : 'Scan to open this personalized visual guide with your exact peptide, format & dosing pre-loaded',
        },
      })
    );
  }, [buildSharePath, sharePath, selectedProduct.name, selectedStrengthStr, isEs, activeFormat]);

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
    buildSharePath,
    copiedLink,
    handleCopyShareUrl,
    handleOpenQr,
    formatOptions: DELIVERY_FORMAT_OPTIONS,
    quickPeptides: DEFAULT_PEPTIDE_CATALOG,
    initialUrlOverrides: {
      target: initialTargetParam,
      bac: initialBacParam,
      syringe: initialSyringeParam,
      puffs: initialPuffsParam,
    },
  };
}
