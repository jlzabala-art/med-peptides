"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Award, FlaskConical } from '@/lib/icons';
import {
  GOAL_BUCKETS,
  enrichProtocolForCatalog,
  resolveDisplayedGoal,
} from '../utils/protocolCatalogTaxonomy';

const SHORTLIST_STORAGE_KEY = 'atlas_protocol_shortlist_v1';
const VALID_LANGS = ['en', 'es', 'fr', 'de', 'it'];

function matchesSafetyExclusions(proto, exclusions) {
  if (!exclusions || exclusions.length === 0) return true;
  const text = [
    ...(Array.isArray(proto.contraindications) ? proto.contraindications : []),
    proto.summary,
    proto.cleanName,
    ...(proto.compounds || []).map((c) => c.name),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (exclusions.includes('oncology')) {
    if (/malignan|cancer|angiogen|neoplasm|tumor|bpc-157|tb-500|cjc-1295|ipamorelin|sermorelin|ghrh/.test(text)) {
      return false;
    }
  }
  if (exclusions.includes('thyroid_men2')) {
    if (/medullary thyroid|mtc|men\s*2|pancreatitis|glp-1|semaglutide|tirzepatide|retatrutide/.test(text)) {
      return false;
    }
  }
  if (exclusions.includes('immunosuppression')) {
    if (/immunosuppress|transplant|thymosin alpha/.test(text)) {
      return false;
    }
  }
  return true;
}

export function useProtocolCatalogFilters(initialProtocols = []) {
  const [lang, setLang] = useState('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');
  const [phasesFilter, setPhasesFilter] = useState('all');
  const [routeFilter, setRouteFilter] = useState('all');
  const [evidenceFilter, setEvidenceFilter] = useState('all');
  const [safetyExclusions, setSafetyExclusions] = useState([]);
  const [onlyShortlisted, setOnlyShortlisted] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState('list');
  const [kpiScope, setKpiScope] = useState('filtered'); // 'filtered' | 'global'

  const [shortlistSlugs, setShortlistSlugs] = useState(() => new Set());
  const [compareSlugs, setCompareSlugs] = useState([]);
  const [isUrlHydrated, setIsUrlHydrated] = useState(false);

  // Hydrate URL params + localStorage shortlist on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang && VALID_LANGS.includes(urlLang)) {
      setLang(urlLang);
    }

    const q = urlParams.get('q');
    if (q) setSearchQuery(q);

    const goal = urlParams.get('goal');
    if (goal && GOAL_BUCKETS.some((b) => b.id === goal)) setSelectedGoal(goal);

    const dur = urlParams.get('duration');
    if (dur && ['short', 'medium', 'long'].includes(dur)) setDurationFilter(dur);

    const ph = urlParams.get('phases');
    if (ph && ['single', 'titration'].includes(ph)) setPhasesFilter(ph);

    const route = urlParams.get('route');
    if (route) setRouteFilter(route);

    const ev = urlParams.get('evidence');
    if (ev && ['high', 'high_moderate'].includes(ev)) setEvidenceFilter(ev);

    const excl = urlParams.get('exclude');
    if (excl) {
      setSafetyExclusions(excl.split(',').filter(Boolean));
    }

    const sort = urlParams.get('sort');
    if (sort) setSortBy(sort);

    const view = urlParams.get('view');
    if (view === 'cards' || view === 'list') setViewMode(view);

    try {
      const saved = localStorage.getItem(SHORTLIST_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setShortlistSlugs(new Set(parsed));
      }
    } catch (_) {
      /* storage unavailable */
    }

    setIsUrlHydrated(true);

    const handleGlobalLang = (e) => {
      if (e.detail && VALID_LANGS.includes(e.detail)) {
        setLang(e.detail);
      }
    };
    window.addEventListener('atlas_lang_change', handleGlobalLang);
    return () => window.removeEventListener('atlas_lang_change', handleGlobalLang);
  }, []);

  // Sync filter state back to URL searchParams
  useEffect(() => {
    if (!isUrlHydrated || typeof window === 'undefined') return;
    const url = new URL(window.location.href);

    const setOrDelete = (key, val, defaultVal = 'all') => {
      if (!val || val === defaultVal) url.searchParams.delete(key);
      else url.searchParams.set(key, val);
    };

    setOrDelete('q', searchQuery.trim(), '');
    setOrDelete('goal', selectedGoal, 'all');
    setOrDelete('duration', durationFilter, 'all');
    setOrDelete('phases', phasesFilter, 'all');
    setOrDelete('route', routeFilter, 'all');
    setOrDelete('evidence', evidenceFilter, 'all');
    setOrDelete('exclude', safetyExclusions.join(','), '');
    setOrDelete('sort', sortBy, 'relevance');
    setOrDelete('view', viewMode, 'list');
    setOrDelete('lang', lang, 'en');

    window.history.replaceState({}, '', url.toString());
  }, [
    isUrlHydrated,
    searchQuery,
    selectedGoal,
    durationFilter,
    phasesFilter,
    routeFilter,
    evidenceFilter,
    safetyExclusions,
    sortBy,
    viewMode,
    lang,
  ]);

  const handleLangChange = useCallback((nextLang) => {
    setLang(nextLang);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('atlas_portal_lang', nextLang);
        localStorage.setItem('atlas_catalog_lang', nextLang);
        window.dispatchEvent(new CustomEvent('atlas_lang_change', { detail: nextLang }));
      } catch (_) {
        /* storage unavailable */
      }
    }
  }, []);

  const toggleShortlist = useCallback((slug) => {
    setShortlistSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      try {
        localStorage.setItem(SHORTLIST_STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch (_) {
        /* ignore */
      }
      return next;
    });
  }, []);

  const toggleCompare = useCallback((slug) => {
    setCompareSlugs((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= 3) return [...prev.slice(1), slug];
      return [...prev, slug];
    });
  }, []);

  const toggleSafetyExclusion = useCallback((key) => {
    setSafetyExclusions((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  }, []);

  const enrichedProtocols = useMemo(() => {
    return (initialProtocols || []).map((p) => enrichProtocolForCatalog(p)).filter(Boolean);
  }, [initialProtocols]);

  const goalCounts = useMemo(() => {
    const counts = {};
    GOAL_BUCKETS.forEach((g) => {
      counts[g.id] = 0;
    });
    enrichedProtocols.forEach((p) => {
      p.mappedGoals.forEach((gid) => {
        if (counts[gid] !== undefined) counts[gid]++;
      });
    });
    return counts;
  }, [enrichedProtocols]);

  const filteredProtocols = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    const result = enrichedProtocols.filter((p) => {
      if (selectedGoal !== 'all' && !p.mappedGoals.includes(selectedGoal)) return false;

      if (durationFilter === 'short' && p.durationWeeks > 8) return false;
      if (durationFilter === 'medium' && (p.durationWeeks <= 8 || p.durationWeeks > 12)) return false;
      if (durationFilter === 'long' && p.durationWeeks <= 12) return false;

      if (phasesFilter === 'single' && p.phasesCount !== 1) return false;
      if (phasesFilter === 'titration' && p.phasesCount < 2) return false;

      if (routeFilter !== 'all' && p.route !== routeFilter) return false;

      if (evidenceFilter === 'high') {
        if (!String(p.evidence_grade || '').toLowerCase().includes('high')) return false;
      } else if (evidenceFilter === 'high_moderate') {
        const ev = String(p.evidence_grade || '').toLowerCase();
        if (!ev.includes('high') && !ev.includes('moderate')) return false;
      }

      if (!matchesSafetyExclusions(p, safetyExclusions)) return false;

      if (onlyShortlisted && !shortlistSlugs.has(p.cleanSlug)) return false;

      if (q) {
        const nameMatch = p.cleanName.toLowerCase().includes(q);
        const codeMatch = p.cleanCode.toLowerCase().includes(q);
        const summaryMatch = p.summary.toLowerCase().includes(q);
        const compoundMatch = p.compounds.some((c) => c.name.toLowerCase().includes(q));
        const goalMatch = p.mappedGoals.some((g) => g.toLowerCase().includes(q));
        const biomarkerMatch = (p.biomarkers || []).some((b) => String(b).toLowerCase().includes(q));
        const routeMatch = String(p.route || '').toLowerCase().includes(q);

        if (!nameMatch && !codeMatch && !summaryMatch && !compoundMatch && !goalMatch && !biomarkerMatch && !routeMatch) {
          return false;
        }
      }

      return true;
    });

    result.sort((a, b) => {
      if (sortBy === 'duration-desc') return b.durationWeeks - a.durationWeeks;
      if (sortBy === 'duration-asc') return a.durationWeeks - b.durationWeeks;
      if (sortBy === 'name-asc') return a.cleanName.localeCompare(b.cleanName);
      if (sortBy === 'phases-desc') return b.phasesCount - a.phasesCount;

      const aRefScore = a.is_reference_standard ? 1000 - (a.reference_order || 10) * 10 : 0;
      const bRefScore = b.is_reference_standard ? 1000 - (b.reference_order || 10) * 10 : 0;
      if (aRefScore !== bRefScore) return bRefScore - aRefScore;
      return b.compounds.length * 2 + b.phasesCount - (a.compounds.length * 2 + a.phasesCount);
    });

    return result;
  }, [
    enrichedProtocols,
    selectedGoal,
    durationFilter,
    phasesFilter,
    routeFilter,
    evidenceFilter,
    safetyExclusions,
    onlyShortlisted,
    shortlistSlugs,
    searchQuery,
    sortBy,
  ]);

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
      selectedGoal !== 'all' ||
      durationFilter !== 'all' ||
      phasesFilter !== 'all' ||
      routeFilter !== 'all' ||
      evidenceFilter !== 'all' ||
      safetyExclusions.length > 0 ||
      onlyShortlisted
  );

  const groupedProtocols = useMemo(() => {
    const groups = [];

    if (!hasActiveFilters) {
      const referenceProtocols = filteredProtocols
        .filter((p) => p.is_reference_standard)
        .sort((a, b) => (a.reference_order || 99) - (b.reference_order || 99));

      if (referenceProtocols.length > 0) {
        groups.push({
          bucket: {
            id: 'reference_standards',
            label: lang === 'es' ? 'Protocolos de Referencia Clínica' : 'Primary Clinical Reference Standards',
            sublabel:
              lang === 'es'
                ? 'Monografías de máxima profundidad clínica: farmacocinética celular, técnica anatómica perilesional y algoritmos de titulación'
                : 'Highest clinical depth monographs: cellular pharmacokinetics, peri-lesional geometry & titration algorithms',
            icon: Award,
            color: '#003666',
            bg: '#eff6ff',
            isReferenceGroup: true,
          },
          protocols: referenceProtocols,
        });
      }
    }

    const targetBuckets =
      selectedGoal === 'all'
        ? GOAL_BUCKETS.filter((b) => b.id !== 'all' && b.id !== 'reference_standards')
        : GOAL_BUCKETS.filter((b) => b.id === selectedGoal);

    targetBuckets.forEach((bucket) => {
      const matching = filteredProtocols.filter((p) => {
        const primary = resolveDisplayedGoal(p, bucket.id, selectedGoal);
        return primary === bucket.id || (selectedGoal !== 'all' && p.mappedGoals.includes(bucket.id));
      });
      if (matching.length > 0) {
        if (sortBy === 'relevance') {
          matching.sort((a, b) => {
            const aRefScore = a.is_reference_standard ? 1000 - (a.reference_order || 10) * 10 : 0;
            const bRefScore = b.is_reference_standard ? 1000 - (b.reference_order || 10) * 10 : 0;
            if (aRefScore !== bRefScore) return bRefScore - aRefScore;
            return b.compounds.length * 2 + b.phasesCount - (a.compounds.length * 2 + a.phasesCount);
          });
        }
        groups.push({ bucket, protocols: matching });
      }
    });

    if (selectedGoal === 'all') {
      const matchedSlugs = new Set(groups.flatMap((g) => g.protocols.map((p) => p.cleanSlug || p.id)));
      const remainder = filteredProtocols.filter((p) => !matchedSlugs.has(p.cleanSlug || p.id));
      if (remainder.length > 0) {
        groups.push({
          bucket: {
            id: 'other',
            label: lang === 'es' ? 'Protocolos Especializados' : 'Specialized Protocols',
            icon: FlaskConical,
            color: '#003666',
            bg: '#eff6ff',
          },
          protocols: remainder,
        });
      }
    }

    return groups;
  }, [filteredProtocols, hasActiveFilters, selectedGoal, sortBy, lang]);

  // Real, dynamic KPI metrics aligned with Rule #22 Scope Switcher
  const kpiMetrics = useMemo(() => {
    const scopeList = kpiScope === 'global' || !hasActiveFilters ? enrichedProtocols : filteredProtocols;
    const count = scopeList.length;

    const activeGoalSet = new Set();
    let biomarkerTrackedCount = 0;
    let minWeeks = Infinity;
    let maxWeeks = 0;

    scopeList.forEach((p) => {
      (p.mappedGoals || []).forEach((g) => {
        if (g !== 'all' && g !== 'reference_standards') activeGoalSet.add(g);
      });
      if ((p.biomarkers && p.biomarkers.length > 0) || p.is_reference_standard) {
        biomarkerTrackedCount++;
      }
      if (p.durationWeeks > 0) {
        if (p.durationWeeks < minWeeks) minWeeks = p.durationWeeks;
        if (p.durationWeeks > maxWeeks) maxWeeks = p.durationWeeks;
      }
    });

    const labCoveragePct = count > 0 ? Math.round((biomarkerTrackedCount / count) * 100) : 0;
    const cycleRange =
      count === 0 || minWeeks === Infinity
        ? '—'
        : minWeeks === maxWeeks
          ? `${minWeeks} wks`
          : `${minWeeks}–${maxWeeks} wks`;

    return {
      activeCount: count,
      totalCount: enrichedProtocols.length,
      filteredCount: filteredProtocols.length,
      goalsCount: activeGoalSet.size,
      labCoveragePct,
      cycleRange,
    };
  }, [kpiScope, hasActiveFilters, enrichedProtocols, filteredProtocols]);

  const compareProtocols = useMemo(() => {
    return compareSlugs
      .map((slug) => enrichedProtocols.find((p) => p.cleanSlug === slug))
      .filter(Boolean);
  }, [compareSlugs, enrichedProtocols]);

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedGoal('all');
    setDurationFilter('all');
    setPhasesFilter('all');
    setRouteFilter('all');
    setEvidenceFilter('all');
    setSafetyExclusions([]);
    setOnlyShortlisted(false);
    setSortBy('relevance');
  }, []);

  return {
    lang,
    handleLangChange,
    searchQuery,
    setSearchQuery,
    selectedGoal,
    setSelectedGoal,
    durationFilter,
    setDurationFilter,
    phasesFilter,
    setPhasesFilter,
    routeFilter,
    setRouteFilter,
    evidenceFilter,
    setEvidenceFilter,
    safetyExclusions,
    toggleSafetyExclusion,
    onlyShortlisted,
    setOnlyShortlisted,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    kpiScope,
    setKpiScope,
    shortlistSlugs,
    toggleShortlist,
    compareSlugs,
    compareProtocols,
    toggleCompare,
    clearCompare: () => setCompareSlugs([]),
    enrichedProtocols,
    goalCounts,
    filteredProtocols,
    groupedProtocols,
    hasActiveFilters,
    kpiMetrics,
    handleResetFilters,
  };
}
