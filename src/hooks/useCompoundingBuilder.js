'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { getUltramanApis } from '../repositories/ultramanApiRepository';
import { ULTRAMAN_APIS_MASTER } from '../data/ultramanApisMaster';
import { getClinicalDosageProfile } from '../data/clinicalDosageRegistry';
import { triggerHaptic } from '../utils/haptics';
import { safeReplaceState } from './useSafeUrlState';
import {
  MAX_ACTIVES,
  CLINICAL_SYNERGIES,
  CHRONO_OPPOSING,
  BIOAVAILABILITY_TRIGGERS,
  OVERLAP_GROUPS,
  COMPOUNDING_I18N,
  normalize,
  findApiByName,
  clampDose,
  matchesSearchCategory,
  computeGalenics,
  computeCostEstimate,
  computeSplitPhases,
  parseFormulaFromUrl
} from '../data/compoundingKnowledge';

const DRAFT_STORAGE_KEY = 'atlas_compounding_draft_v1';
const SAVED_STORAGE_KEY = 'atlas_compounding_saved_v1';
const MAX_SAVED_FORMULAS = 3;

export function useCompoundingBuilder({ initialLang = null } = {}) {
  const [lang, setLang] = useState(initialLang || 'en');
  const t = COMPOUNDING_I18N[lang] || COMPOUNDING_I18N.en;

  const [catalog, setCatalog] = useState(ULTRAMAN_APIS_MASTER);
  const [activeBlueprint, setActiveBlueprint] = useState(null);
  const [items, setItems] = useState([]);
  const [capsPerBottle, setCapsPerBottle] = useState(60);
  const [formulaName, setFormulaName] = useState('');
  const [activeGeneticProfile, setActiveGeneticProfile] = useState(null);
  const [activeFineTuningNotes, setActiveFineTuningNotes] = useState([]);
  const [query, setQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('all');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [pricingChannel, setPricingChannel] = useState('b2b');
  const [isSplitProtocol, setIsSplitProtocol] = useState(false);
  const [activePhaseTab, setActivePhaseTab] = useState('all');
  const [savedFormulas, setSavedFormulas] = useState([]);

  const hydratedRef = useRef(false);
  const searchWrapRef = useRef(null);

  const handleLangChange = useCallback((code) => {
    setLang(code);
    try { localStorage.setItem('atlas_public_lang', code); } catch { /* ignore */ }
  }, []);

  /* Load live catalog (4-layer cache) + hydrate from URL or localStorage draft */
  useEffect(() => {
    let cancelled = false;
    getUltramanApis()
      .then(list => {
        if (cancelled) return;
        const usable = Array.isArray(list) && list.length > 0 ? list : ULTRAMAN_APIS_MASTER;
        setCatalog(usable);

        if (!hydratedRef.current) {
          hydratedRef.current = true;
          try {
            const storedLang = localStorage.getItem('atlas_public_lang');
            if (storedLang === 'es' || storedLang === 'en') setLang(storedLang);
            else if (navigator.language?.toLowerCase().startsWith('es')) setLang('es');

            const rawSaved = localStorage.getItem(SAVED_STORAGE_KEY);
            if (rawSaved) {
              const parsedSaved = JSON.parse(rawSaved);
              if (Array.isArray(parsedSaved)) setSavedFormulas(parsedSaved.slice(0, MAX_SAVED_FORMULAS));
            }
          } catch { /* ignore */ }

          const fromUrl = parseFormulaFromUrl(usable);
          if (fromUrl && fromUrl.items.length > 0) {
            setItems(fromUrl.items);
            if (fromUrl.caps) setCapsPerBottle(fromUrl.caps);
            if (fromUrl.name) setFormulaName(fromUrl.name);
            setActiveBlueprint('blank');
          } else {
            try {
              const rawDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
              if (rawDraft) {
                const draft = JSON.parse(rawDraft);
                if (draft && Array.isArray(draft.items) && draft.items.length > 0) {
                  setItems(draft.items);
                  if (draft.capsPerBottle) setCapsPerBottle(draft.capsPerBottle);
                  if (draft.formulaName) setFormulaName(draft.formulaName);
                  if (draft.activeBlueprint) setActiveBlueprint(draft.activeBlueprint);
                  if (typeof draft.isSplitProtocol === 'boolean') setIsSplitProtocol(draft.isSplitProtocol);
                }
              }
            } catch { /* ignore */ }
          }
        }
      })
      .catch(() => { /* static fallback already in state */ });
    return () => { cancelled = true; };
  }, []);

  /* Sync formula to URL + localStorage draft */
  useEffect(() => {
    if (!hydratedRef.current || typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (items.length > 0) {
      params.set('f', items.map(i => `${i.apiId.replace(/^pharmapolis-/, '')}:${i.doseMg}`).join(','));
      params.set('caps', String(capsPerBottle));
      if (formulaName.trim()) params.set('name', formulaName.trim()); else params.delete('name');
    } else {
      params.delete('f'); params.delete('caps'); params.delete('name');
    }
    const qs = params.toString();
    safeReplaceState(`${window.location.pathname}${qs ? `?${qs}` : ''}`);

    try {
      if (items.length > 0) {
        localStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({ items, capsPerBottle, formulaName, activeBlueprint, isSplitProtocol })
        );
      } else {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    } catch { /* ignore */ }
  }, [items, capsPerBottle, formulaName, activeBlueprint, isSplitProtocol]);

  /* Close search dropdown on outside click */
  useEffect(() => {
    if (!isSearchOpen) return;
    const onDown = (e) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) setIsSearchOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [isSearchOpen]);

  /* Undo helper */
  const showUndoToast = useCallback((snapshot, message) => {
    if (!snapshot || !snapshot.items || snapshot.items.length === 0) return;
    toast((toastObj) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem' }}>
        <span>{message}</span>
        <button
          type="button"
          onClick={() => {
            setItems(snapshot.items);
            setActiveBlueprint(snapshot.activeBlueprint);
            setFormulaName(snapshot.formulaName);
            setCapsPerBottle(snapshot.capsPerBottle);
            setIsSplitProtocol(snapshot.isSplitProtocol);
            toast.dismiss(toastObj.id);
            triggerHaptic('selection');
          }}
          style={{
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            color: '#003666',
            fontWeight: 750,
            borderRadius: '6px',
            padding: '3px 8px',
            cursor: 'pointer',
            fontSize: '0.74rem'
          }}
        >
          {t.undo}
        </button>
      </div>
    ), { duration: 5000, id: 'cmp-undo' });
  }, [t.undo]);

  /* Actions */
  const applyBlueprint = useCallback((bp) => {
    triggerHaptic('selection');
    const prevSnapshot = items.length > 0
      ? { items, activeBlueprint, formulaName, capsPerBottle, isSplitProtocol }
      : null;

    setActiveBlueprint(bp.id);
    const resolved = bp.items.map(([name, mg]) => {
      const api = findApiByName(catalog, name);
      return api ? { apiId: api.id, name: api.name, spec: api.spec, doseMg: mg } : null;
    }).filter(Boolean);
    setItems(resolved);
    if (bp.id !== 'blank') setFormulaName(bp.label[lang] || bp.label.en);
    else setFormulaName('');

    if (prevSnapshot && prevSnapshot.activeBlueprint !== bp.id) {
      showUndoToast(prevSnapshot, t.formulaReplaced);
    }
  }, [catalog, lang, items, activeBlueprint, formulaName, capsPerBottle, isSplitProtocol, showUndoToast, t.formulaReplaced]);

  const handleApplyProposal = useCallback((proposal) => {
    if (!proposal || !proposal.items || !proposal.items.length) return;
    triggerHaptic('success');
    const resolved = proposal.items.map(propItem => {
      const api = catalog.find(a => a.id === propItem.apiId)
        || catalog.find(a => normalize(a.name) === normalize(propItem.apiId.replace(/^pharmapolis-/, '')))
        || findApiByName(catalog, propItem.apiId);
      return api ? {
        apiId: api.id,
        name: api.name,
        spec: api.spec,
        doseMg: clampDose(propItem.doseMg)
      } : null;
    }).filter(Boolean);

    if (resolved.length > 0) {
      setItems(resolved);
      setFormulaName(proposal.name || '');
      if (proposal.capsPerBottle) setCapsPerBottle(proposal.capsPerBottle);
      setIsSplitProtocol(Boolean(proposal.isSplit));
      setActiveBlueprint('blank');
      if (proposal.geneticProfile) {
        setActiveGeneticProfile(proposal.geneticProfile);
        setActiveFineTuningNotes(proposal.fineTuningNotes || []);
      } else {
        setActiveGeneticProfile(null);
        setActiveFineTuningNotes([]);
      }
      toast.success(
        lang === 'es'
          ? `Fórmula cargada con éxito: ${proposal.name} (${resolved.length} activos)`
          : `Formula loaded successfully: ${proposal.name} (${resolved.length} actives)`,
        { id: 'cmp-loaded-wizard' }
      );
    }
  }, [catalog, lang]);

  const addActive = useCallback((api) => {
    setItems(prev => {
      if (prev.some(i => i.apiId === api.id)) {
        toast(`${api.name} ${t.already}`, { id: 'cmp-dup' });
        return prev;
      }
      if (prev.length >= MAX_ACTIVES) {
        toast.error(t.warnMax, { id: 'cmp-max' });
        return prev;
      }
      const dosageProfile = getClinicalDosageProfile(api.name);
      const defaultDose = dosageProfile.standard || 100;
      toast.success(`${api.name} ${t.added} (${defaultDose} mg)`, { id: `cmp-add-${api.id}` });
      return [...prev, { apiId: api.id, name: api.name, spec: api.spec, doseMg: defaultDose }];
    });
    if (!activeBlueprint) setActiveBlueprint('blank');
    setQuery('');
    setIsSearchOpen(false);
    triggerHaptic('light');
  }, [t, activeBlueprint]);

  const removeActive = useCallback((apiId) => {
    setItems(prev => {
      const target = prev.find(i => i.apiId === apiId);
      if (target) toast(`${target.name} ${t.removed}`, { id: `cmp-rm-${apiId}` });
      return prev.filter(i => i.apiId !== apiId);
    });
    triggerHaptic('light');
  }, [t]);

  const updateDose = useCallback((apiId, value) => {
    setItems(prev => prev.map(i => (i.apiId === apiId ? { ...i, doseMg: value === '' ? '' : value } : i)));
  }, []);

  const commitDose = useCallback((apiId) => {
    setItems(prev => prev.map(i => (i.apiId === apiId ? { ...i, doseMg: clampDose(i.doseMg) } : i)));
  }, []);

  const stepDose = useCallback((apiId, delta) => {
    setItems(prev => prev.map(i => {
      if (i.apiId !== apiId) return i;
      const cur = Number(i.doseMg) || 0;
      const step = cur < 10 ? 1 : cur < 100 ? 10 : 25;
      return { ...i, doseMg: clampDose(cur + delta * step) };
    }));
  }, []);

  const resetAll = useCallback(() => {
    const prevSnapshot = items.length > 0
      ? { items, activeBlueprint, formulaName, capsPerBottle, isSplitProtocol }
      : null;
    setItems([]);
    setActiveBlueprint(null);
    setFormulaName('');
    setCapsPerBottle(60);
    setIsSplitProtocol(false);
    setActivePhaseTab('all');
    if (prevSnapshot) showUndoToast(prevSnapshot, t.formulaReset);
  }, [items, activeBlueprint, formulaName, capsPerBottle, isSplitProtocol, showUndoToast, t.formulaReset]);

  const toggleSplitProtocol = useCallback(() => {
    triggerHaptic('medium');
    setIsSplitProtocol(prev => {
      const next = !prev;
      setActivePhaseTab('all');
      if (next) {
        toast.success(lang === 'es' ? 'Fórmula dividida en Protocolo Día/Noche ✓' : 'Split into Day/Night Protocol ✓');
      } else {
        toast(lang === 'es' ? 'Fórmula unificada en fase única' : 'Recombined into single formula');
      }
      return next;
    });
  }, [lang]);

  /* Galenic & Split Computations */
  const galenics = useMemo(() => computeGalenics(items, capsPerBottle), [items, capsPerBottle]);
  const splitData = useMemo(() => (isSplitProtocol ? computeSplitPhases(items) : null), [isSplitProtocol, items]);

  const splitGalenics = useMemo(() => {
    if (!isSplitProtocol || !splitData) return null;
    const p1 = computeGalenics(splitData.phase1, capsPerBottle);
    const p2 = computeGalenics(splitData.phase2, capsPerBottle);
    return { phase1: p1, phase2: p2 };
  }, [isSplitProtocol, splitData, capsPerBottle]);

  const costEstimate = useMemo(() => {
    if (isSplitProtocol && splitData && splitGalenics) {
      const c1 = splitGalenics.phase1 ? computeCostEstimate(splitData.phase1, splitGalenics.phase1, capsPerBottle, catalog) : null;
      const c2 = splitGalenics.phase2 ? computeCostEstimate(splitData.phase2, splitGalenics.phase2, capsPerBottle, catalog) : null;
      if (c1 && c2) {
        return {
          finalPricing: {
            netSellingPriceEur: c1.finalPricing.netSellingPriceEur + c2.finalPricing.netSellingPriceEur,
            netPerCapEur: (c1.finalPricing.netPerCapEur + c2.finalPricing.netPerCapEur) / 2
          },
          isDualBottle: true
        };
      }
      return c1 || c2;
    }
    return computeCostEstimate(items, galenics, capsPerBottle, catalog);
  }, [isSplitProtocol, splitData, splitGalenics, items, galenics, capsPerBottle, catalog]);

  /* Clinical Intelligence */
  const activeSynergies = useMemo(() => {
    if (items.length < 2) return [];
    const itemNamesNorm = items.map(i => normalize(i.name));
    return CLINICAL_SYNERGIES.filter(syn =>
      syn.actives.every(act => itemNamesNorm.some(n => n.includes(normalize(act)) || normalize(act).includes(n)))
    );
  }, [items]);

  const chronoWarning = useMemo(() => {
    if (items.length < 2) return null;
    const itemNamesNorm = items.map(i => normalize(i.name));
    for (const rule of CHRONO_OPPOSING) {
      const hasDay = rule.dayActives.some(d => itemNamesNorm.some(n => n.includes(normalize(d))));
      const hasNight = rule.nightActives.some(nAct => itemNamesNorm.some(m => m.includes(normalize(nAct))));
      if (hasDay && hasNight) return rule.warning[lang] || rule.warning.en;
    }
    return null;
  }, [items, lang]);

  const overlapWarnings = useMemo(() => {
    if (items.length < 2) return [];
    const itemNamesNorm = items.map(i => normalize(i.name));
    return OVERLAP_GROUPS.filter(group => {
      const matches = itemNamesNorm.filter(n => group.keywords.some(kw => n.includes(kw)));
      return matches.length >= group.maxCount;
    }).map(g => g.warning[lang] || g.warning.en);
  }, [items, lang]);

  const synergySuggestions = useMemo(() => {
    if (items.length >= MAX_ACTIVES || items.length === 0) return [];
    const itemNamesNorm = items.map(i => normalize(i.name));
    const suggestions = [];

    CLINICAL_SYNERGIES.forEach(syn => {
      const present = syn.actives.filter(act => itemNamesNorm.some(n => n.includes(normalize(act))));
      const missing = syn.actives.filter(act => !itemNamesNorm.some(n => n.includes(normalize(act))));
      if (present.length > 0 && missing.length > 0) {
        missing.forEach(missName => {
          const apiObj = findApiByName(catalog, missName);
          if (apiObj && !suggestions.some(s => s.api.id === apiObj.id)) {
            suggestions.push({ api: apiObj, reason: syn.title, pairedWith: present.join(', ') });
          }
        });
      }
    });

    BIOAVAILABILITY_TRIGGERS.forEach(trig => {
      const matchedTarget = items.find(it => trig.targetKeywords.some(kw => normalize(it.name).includes(kw)));
      const hasEnhancer = itemNamesNorm.some(n => n.includes(normalize(trig.enhancerName)));
      if (matchedTarget && !hasEnhancer) {
        const enhancerApi = findApiByName(catalog, trig.enhancerName);
        if (enhancerApi && !suggestions.some(s => s.api.id === enhancerApi.id)) {
          suggestions.push({
            api: enhancerApi,
            reason: trig.reason[lang] || trig.reason.en,
            pairedWith: matchedTarget.name
          });
        }
      }
    });

    return suggestions.slice(0, 2);
  }, [items, catalog, lang]);

  /* Search */
  const searchResults = useMemo(() => {
    const q = normalize(query.trim());
    const selected = new Set(items.map(i => i.apiId));
    const pool = catalog.filter(a => !selected.has(a.id) && matchesSearchCategory(a, searchCategory));
    if (!q) {
      const priorityA = pool.filter(a => a.priority === 'A');
      return (priorityA.length > 0 ? priorityA : pool).slice(0, 8);
    }
    return pool.filter(a => normalize(`${a.name} ${a.spec || ''}`).includes(q)).slice(0, 10);
  }, [query, catalog, items, searchCategory]);

  /* Saved Formulas Comparison */
  const saveCurrentFormula = useCallback(() => {
    if (!items.length || !galenics) return;
    triggerHaptic('success');
    const entry = {
      id: `cmp-${Date.now()}`,
      name: formulaName.trim() || (lang === 'es' ? 'Fórmula guardada' : 'Saved formula'),
      items: items.map(i => ({ apiId: i.apiId, name: i.name, spec: i.spec, doseMg: i.doseMg })),
      capsPerBottle,
      isSplitProtocol,
      totalMg: galenics.totalMg,
      capsPerDay: galenics.capsPerDay,
      capsuleSize: galenics.size.size,
      supplyDays: galenics.supplyDays
    };
    setSavedFormulas(prev => {
      const next = [entry, ...prev].slice(0, MAX_SAVED_FORMULAS);
      try { localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
    toast.success(lang === 'es' ? 'Fórmula guardada para comparar' : 'Formula saved for comparison');
  }, [items, galenics, formulaName, capsPerBottle, isSplitProtocol, lang]);

  const loadSavedFormula = useCallback((saved) => {
    if (!saved || !Array.isArray(saved.items)) return;
    triggerHaptic('selection');
    setItems(saved.items);
    setFormulaName(saved.name || '');
    setCapsPerBottle(saved.capsPerBottle || 60);
    setIsSplitProtocol(Boolean(saved.isSplitProtocol));
    setActiveBlueprint('blank');
    toast.success(lang === 'es' ? `Fórmula "${saved.name}" cargada` : `Loaded "${saved.name}"`);
  }, [lang]);

  const removeSavedFormula = useCallback((id) => {
    setSavedFormulas(prev => {
      const next = prev.filter(s => s.id !== id);
      try { localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  return {
    lang,
    t,
    handleLangChange,
    catalog,
    activeBlueprint,
    items,
    capsPerBottle,
    setCapsPerBottle,
    formulaName,
    setFormulaName,
    activeGeneticProfile,
    setActiveGeneticProfile,
    activeFineTuningNotes,
    setActiveFineTuningNotes,
    query,
    setQuery,
    searchCategory,
    setSearchCategory,
    isSearchOpen,
    setIsSearchOpen,
    searchWrapRef,
    searchResults,
    pricingChannel,
    setPricingChannel,
    isSplitProtocol,
    activePhaseTab,
    setActivePhaseTab,
    toggleSplitProtocol,
    applyBlueprint,
    handleApplyProposal,
    addActive,
    removeActive,
    updateDose,
    commitDose,
    stepDose,
    resetAll,
    galenics,
    splitData,
    splitGalenics,
    costEstimate,
    activeSynergies,
    chronoWarning,
    overlapWarnings,
    synergySuggestions,
    savedFormulas,
    saveCurrentFormula,
    loadSavedFormula,
    removeSavedFormula
  };
}
