import Search from "lucide-react/dist/esm/icons/search";
import X from "lucide-react/dist/esm/icons/x";
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import Beaker from "lucide-react/dist/esm/icons/beaker";
import Activity from "lucide-react/dist/esm/icons/activity";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import ClipboardList from "lucide-react/dist/esm/icons/clipboard-list";
import Clock from "lucide-react/dist/esm/icons/clock";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import HelpCircle from "lucide-react/dist/esm/icons/help-circle";
import Leaf from "lucide-react/dist/esm/icons/leaf";
import MessageCircle from "lucide-react/dist/esm/icons/message-circle";
import Bot from "lucide-react/dist/esm/icons/bot";
import SlidersHorizontal from "lucide-react/dist/esm/icons/sliders-horizontal";
/* eslint-disable react-hooks/set-state-in-effect, no-unused-vars */














import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchProducts, searchProtocols, searchSupplements, getSearchThemes, isQuestion, buildFAQIndex } from '../utils/searchEngine';
import { classifyQuery, QUERY_TYPE_TO_INTENT } from '../utils/classifyQuery';
import { useResponsive } from '../hooks/useResponsive';
import { trackToolUsage } from '../hooks/useAnalytics';
import { trackSearchEmptyResult, trackSearchRepeated } from '../utils/analytics';
import { lockScroll, unlockScroll } from '../utils/scrollLock';
import { searchAlgolia, checkAlgoliaQuota } from '../services/algoliaSearch';

// Cycling placeholder messages — shows users what the search can do
const PLACEHOLDER_CYCLE = [
  'Search peptides, supplements or protocols…',
  'Try "BPC-157" to explore healing peptides…',
  'Search "NMN" or "Berberine" for longevity supplements…',
  'Try "Weight loss protocol"…',
  'Search "TB-500" for recovery peptides…',
  'Try "Spermidine" or "NAD+" for anti-aging supplements…',
  'Try "longevity" to browse anti-aging options…',
];

export default function SearchModal({ isOpen, onClose, onSelectProduct, products, allFaqs = [], protocolIndex = [], supplementCatalogue = [], initialQuery = '', initialTab = 'peptides', onQueryChange, isLoading = false, isProfessional = false }) {

  const isMobile = useResponsive('(max-width: 768px)');

  // ─── Theme tokens ────────────────────────────────────────────────────────
  // Guest  → warm mint/lavender wellness palette (approachable, discovery-first)
  // Pro    → deep navy/slate clinical palette (efficient, data-dense, serious)
  const THEME = isProfessional ? {
    // ── Backdrop & overlay ──
    backdrop:       'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'none',

    // ── Modal shell ──
    modalBg:        '#202124',
    modalBorder:    '#3c4043',
    modalShadow:    '0 4px 16px rgba(0,0,0,0.25)',
    modalRadius:    '4px',
    headerBg:       '#202124',
    headerBorder:   '#3c4043',

    // ── Input ──
    inputColor:     '#e8eaed',
    inputWeight:    400,
    searchIconColor: '#9aa0a6',

    // ── Tabs ──
    tabActivePeptides:  '#8ab4f8',
    tabActiveProtocols: '#81c995',
    tabActiveQuestions: '#f28b82',
    tabInactive:        '#9aa0a6',
    tabInactiveBorder:  'transparent',
    tabBarBg:           '#303134',

    // ── Accent palette ──
    accentA: '#8ab4f8',
    accentB: '#81c995',
    accentC: '#c58af9',

    // ── Cards ──
    cardBg:     '#303134',
    cardRadius: '4px',
    cardBorder: '#3c4043',

    // ── Footer ──
    footerBg:     '#202124',
    footerBorder: '#3c4043',
    // ── Typography ──
    textPrimary:   '#e8eaed',
    textSecondary: '#9aa0a6',
    textMuted:     '#70757a',
  } : {
    // ── Backdrop & overlay ──
    backdrop:       'rgba(0, 0, 0, 0.25)',
    backdropFilter: 'none',

    // ── Modal shell ──
    modalBg:        'var(--color-bg-surface)',
    modalBorder:    '#dadce0',
    modalShadow:    '0 4px 16px rgba(0,0,0,0.12)',
    modalRadius:    '4px',
    headerBg:       'var(--color-bg-surface)',
    headerBorder:   '#dadce0',

    // ── Input ──
    inputColor:     '#202124',
    inputWeight:    400,
    searchIconColor: '#5f6368',

    // ── Tabs ──
    tabActivePeptides:  '#1a73e8',
    tabActiveProtocols: '#188038',
    tabActiveQuestions: '#d93025',
    tabInactive:        '#5f6368',
    tabInactiveBorder:  'transparent',
    tabBarBg:           '#f1f3f4',

    // ── Accent palette ──
    accentA: '#1a73e8',
    accentB: '#188038',
    accentC: '#a142f4',

    // ── Cards ──
    cardBg:     'var(--color-bg-surface)',
    cardRadius: '4px',
    cardBorder: '#dadce0',

    // ── Footer ──
    footerBg:     'var(--color-bg-surface)',
    footerBorder: '#dadce0',
    // ── Typography ──
    textPrimary:   '#202124',
    textSecondary: '#5f6368',
    textMuted:     '#70757a',
  };
  // ────────────────────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [showAll, setShowAll] = useState(false);
  const [selectedFaqId, setSelectedFaqId] = useState(null);
  const activeTab = 'unified';
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [activeClinicalFilters, setActiveClinicalFilters] = useState({ route: null, storage: null });
  const navigate = useNavigate();
  const inputRef = useRef(null);
  // ─── Phase 6: session-level query history for repeat/empty detection ────────
  const seenQueriesRef = useRef(new Map()); // query → count
  // Track whether we just opened the modal to block the auto-tab from overriding initialTab
  const justOpenedRef = useRef(false);
  // ── Algolia Cloud Fallback State ─────────────────────────────────────────
  const [algoliaResults, setAlgoliaResults] = useState({ products: [], protocols: [] });
  const [algoliaLoading, setAlgoliaLoading] = useState(false);
  const algoliaTimerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      justOpenedRef.current = true; // flag: tab was just reset to initialTab
      setSearchTerm(initialQuery);
      setShowAll(false); // Always start with limited results per user request
      setFocusedIndex(-1);
      const lockId = lockScroll();
      return () => unlockScroll(lockId);
    }
  }, [isOpen, initialQuery]);

  // NOTE: auto-tab useEffect intentionally moved BELOW useMemo declarations
  // to avoid TDZ crash in the minified bundle (cannot reference useMemo vars before they exist).

  // Cycle placeholder text every 3s when the field is empty
  useEffect(() => {
    if (!isOpen || searchTerm.trim()) return;
    const timer = setInterval(() => {
      setPlaceholderIdx(i => (i + 1) % PLACEHOLDER_CYCLE.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [isOpen, searchTerm]);

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    setShowAll(false);
    setSelectedFaqId(null);
    // NOTE: do NOT reset activeTab here — keep whatever tab the user selected
    setFocusedIndex(-1);
    if (onQueryChange) onQueryChange(val);
  };

  const faqIndex = useMemo(() => buildFAQIndex(allFaqs), [allFaqs]);

  const searchResults = useMemo(() => {
    let res = searchProducts(searchTerm, products, protocolIndex);
    if (activeClinicalFilters.route) {
      res = res.filter(p => (p.pharmacokinetics?.route || 'Subcutaneous') === activeClinicalFilters.route);
    }
    if (activeClinicalFilters.storage) {
      res = res.filter(p => (p.storage_conditions?.dry || 'Room Temperature').includes(activeClinicalFilters.storage));
    }
    return res;
  }, [searchTerm, products, protocolIndex, activeClinicalFilters]);

  const protocolResults = useMemo(() => searchProtocols(searchTerm, protocolIndex), [searchTerm, protocolIndex]);
  const supplementResults = useMemo(() => {
    let res = searchSupplements(searchTerm, supplementCatalogue);
    if (activeClinicalFilters.route) {
      res = res.filter(p => (p.pharmacokinetics?.route || 'Oral') === activeClinicalFilters.route);
    }
    if (activeClinicalFilters.storage) {
      res = res.filter(p => (p.storage_conditions?.dry || 'Room Temperature').includes(activeClinicalFilters.storage));
    }
    return res;
  }, [searchTerm, supplementCatalogue, activeClinicalFilters]);

  // When the modal opens with a pre-filled query, auto-switch to the first
  // tab that actually has results — avoids confusing "no results" screens.
  // IMPORTANT: must live AFTER the useMemo declarations to avoid TDZ in minified bundles.
  // When the modal opens with a pre-filled query, auto-expand the first
  // section that actually has results.
  useEffect(() => {
    /* Auto-tab switching disabled for unified vertical search layout */
  }, [isOpen, searchResults.length, supplementResults.length, protocolResults.length, searchTerm]);

  // Debounced search tracking + Phase 6 friction signals
  useEffect(() => {
    const timer = setTimeout(() => {
      const term = searchTerm.trim();
      if (term.length < 3) return;

      const totalResults = searchResults.length + supplementResults.length + protocolResults.length;

      // Base search event
      trackToolUsage('site_search', {
        search_term:   term,
        results_count: totalResults,
      });

      // Phase 6a — empty result signal
      if (totalResults === 0) {
        trackSearchEmptyResult(term, activeTab);
      }

      // Phase 6b — repeated query signal
      const lower = term.toLowerCase();
      const prev  = seenQueriesRef.current.get(lower) || 0;
      seenQueriesRef.current.set(lower, prev + 1);
      if (prev >= 1) {
        trackSearchRepeated(lower, prev + 1);
      }
    }, 1500); // 1.5s delay to capture "intent" rather than every keystroke
    return () => clearTimeout(timer);
  }, [searchTerm, searchResults.length, supplementResults.length, protocolResults.length, activeTab]);

  // ── Algolia Cloud Fallback: fires ONLY when local search returns 0 results ──
  useEffect(() => {
    // Clear previous Algolia timer
    if (algoliaTimerRef.current) clearTimeout(algoliaTimerRef.current);

    const localTotal = searchResults.length + supplementResults.length + protocolResults.length;
    const term = searchTerm.trim();

    // Only trigger Algolia when: local has 0 results, query is 3+ chars, and quota allows
    if (localTotal > 0 || term.length < 3 || !isOpen) {
      setAlgoliaResults({ products: [], protocols: [] });
      setAlgoliaLoading(false);
      return;
    }

    const quota = checkAlgoliaQuota();
    if (!quota.allowed) {
      return; // Free tier exhausted — silently skip
    }

    setAlgoliaLoading(true);

    // 700ms debounce to save Algolia quota
    algoliaTimerRef.current = setTimeout(async () => {
      try {
        const results = await searchAlgolia(term);
        setAlgoliaResults(results);
      } catch (e) {
        console.error('[SearchModal] Algolia fallback failed:', e);
      } finally {
        setAlgoliaLoading(false);
      }
    }, 700);

    return () => {
      if (algoliaTimerRef.current) clearTimeout(algoliaTimerRef.current);
    };
  }, [searchTerm, searchResults.length, supplementResults.length, protocolResults.length, isOpen]);

  const searchThemes = useMemo(() => getSearchThemes(searchResults), [searchResults]);
  const questionMode = useMemo(() => isQuestion(searchTerm), [searchTerm]);

  // One entry per unique product — variants shown as chips inside the card
  // Peptides that belong to protocols are sorted to the top so the "In X protocols" badge
  // is immediately visible and the ordering feels intentional.
  const displayProducts = useMemo(() => {
    if (searchResults.length === 0) return [];
    const sorted = [...searchResults].sort((a, b) => {
      const aHasProtocol = (a.protocolCount || 0) > 0 ? 1 : 0;
      const bHasProtocol = (b.protocolCount || 0) > 0 ? 1 : 0;
      // Descending: items WITH protocols come first; within each group, keep original score order
      return bHasProtocol - aHasProtocol;
    });
    if (showAll) return sorted;
    return sorted.slice(0, 6);
  }, [searchResults, showAll]);
  const displayProtocols   = showAll ? protocolResults  : protocolResults.slice(0, 3);
  const displaySupplements = showAll ? supplementResults : supplementResults.slice(0, 6);
  // faqResults kept for legacy analytics; no longer rendered

  // Plain inline expression — avoids any useMemo closure TDZ in minified bundles
  const navigableItems = useMemo(() => {
    return [
      ...displayProducts.map(p => ({ ...p, type: 'peptide' })),
      ...displaySupplements.map(s => ({ ...s, type: 'supplement' })),
      ...displayProtocols.map(pr => ({ ...pr, type: 'protocol' }))
    ];
  }, [displayProducts, displaySupplements, displayProtocols]);

  const handleKeyDown = (e) => {
    if (!searchTerm.trim()) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(i => Math.min(i + 1, navigableItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && focusedIndex >= 0) {
      e.preventDefault();
      const item = navigableItems[focusedIndex];
      if (!item) return;
      if (activeTab === 'peptides')  { 
        trackToolUsage('search_result_click', { type: 'product', id: item.id, term: searchTerm });
        onSelectProduct(item); onClose(); 
      }
      if (activeTab === 'supplements') { 
        trackToolUsage('search_result_click', { type: 'supplement', id: item.id, term: searchTerm });
        onSelectProduct(item); onClose();
      }
      if (activeTab === 'protocols') { 
        trackToolUsage('search_result_click', { type: 'protocol', id: item.protocol_id, term: searchTerm });
        onClose(); navigate(`/protocol/${item.protocol_id}`); 
      }
    } else if (e.key === 'Enter' && searchTerm.trim().length > 2) {
      // Phase 3: Intelligent Routing on Enter
      e.preventDefault();
      const classification = classifyQuery(searchTerm, { catalogIndex: products });
      const intent = QUERY_TYPE_TO_INTENT[classification.query_type];

      // Auto-route to ClinicalAI for specific intents
      if (classification.query_type === 'comparison_query' || classification.query_type === 'general_education_query') {
        window.dispatchEvent(new CustomEvent('open-clinical-ai', { 
          detail: { 
            autoSend: true, 
            query: searchTerm,
            section: 'SearchModal.Input'
          } 
        }));
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="search-modal-container" style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 10001,
      display: 'flex',
      justifyContent: 'center',
      alignItems: isMobile ? 'stretch' : 'flex-start',
      padding: isMobile ? 0 : 'var(--header-height, 80px) 1rem 2rem',
      backgroundColor: THEME.backdrop,
      backdropFilter: THEME.backdropFilter,
      WebkitBackdropFilter: THEME.backdropFilter,
      animation: 'smFadeIn 0.18s ease-out',
      overflow: isMobile ? 'hidden' : 'auto'
    }} onClick={onClose}>
      {useMemo(() => (
        <style>{`
        @keyframes smFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes smSlideDown { from { transform: translateY(-8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes smSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .srRow { display: flex; align-items: center; gap: 1rem; padding: 0.6rem 1rem; background: ${THEME.cardBg}; border: none; cursor: pointer; transition: background 0.1s; }
        .srRow:hover { background: ${isProfessional ? '#383a3e' : '#f1f3f4'}; }
        .smInput::placeholder { color: ${isProfessional ? '#5f6368' : '#70757a'}; }
        .smTabBtn { transition: color 0.15s, opacity 0.15s; }
        .smSpinner { width:24px; height:24px; border:2px solid ${isProfessional ? '#3c4043' : '#dadce0'}; border-top-color:${THEME.accentA}; border-radius:50%; animation: smSpin 0.7s linear infinite; }
        .smSpinnerGreen { width:24px; height:24px; border:2px solid ${isProfessional ? '#3c4043' : '#dadce0'}; border-top-color:${THEME.accentB}; border-radius:50%; animation: smSpin 0.7s linear infinite; }
        .smPill { position: relative; }
        @media (max-width: 480px) {
          .smVariantChips { display: none !important; }
        }
        @media (max-width: 768px) {
          .smSearchTags { display: none !important; }
        }
        .smInput::-webkit-search-decoration,
        .smInput::-webkit-search-cancel-button,
        .smInput::-webkit-search-results-button,
        .smInput::-webkit-search-results-decoration { display: none; }
      `}</style>
      ), [THEME, isProfessional])}

      <div style={{
        width: '100%',
        maxWidth: isMobile ? '100%' : (isProfessional ? '820px' : '760px'),
        height: isMobile ? '100%' : 'auto',
        background: THEME.modalBg,
        borderRadius: isMobile ? 0 : THEME.modalRadius,
        boxShadow: THEME.modalShadow,
        border: isMobile ? 'none' : `1px solid ${THEME.modalBorder}`,
        overflow: 'hidden',
        animation: isMobile ? 'none' : 'smSlideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        marginTop: isMobile ? 0 : '4px',
        display: 'flex',
        flexDirection: 'column',
        paddingTop: isMobile ? 'env(safe-area-inset-top, 0px)' : 0
      }} onClick={e => e.stopPropagation()}>

        {/* Search Input Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: `0.5px solid ${THEME.headerBorder}`,
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          background: THEME.headerBg,
          backdropFilter: isProfessional ? 'none' : 'blur(8px)',
        }}>
          <Search size={20} strokeWidth={1.5} style={{ color: questionMode ? THEME.accentC : THEME.searchIconColor, flexShrink: 0, opacity: 0.9 }} />
          <input
            className="smInput"
            ref={inputRef}
            autoFocus
            type="search"
            inputMode="search"
            placeholder={PLACEHOLDER_CYCLE[placeholderIdx]}
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: '1.125rem',
              fontWeight: THEME.inputWeight,
              color: THEME.inputColor,
              outline: 'none',
              fontFamily: "'Inter', sans-serif",
            }}
          />
          {/* Removed redundant Clear button — users use the large X or browser default */}
          <button
            className="smCloseBtn"
            onClick={onClose}
            aria-label="Cerrar búsqueda"
            style={{
              background: 'transparent',
              border: 'none',
              borderRadius: '4px',
              color: THEME.textSecondary,
              cursor: 'pointer',
              width: '38px',
              height: '38px',
              minWidth: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'background 0.15s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = isProfessional ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <X
              size={18}
              strokeWidth={2}
              style={{
                stroke: THEME.textSecondary,
                fill: 'none',
                display: 'block',
                color: THEME.textSecondary,
                flexShrink: 0,
              }}
            />
          </button>
        </div>

        {/* ── Phase 2: Advanced Clinical Filters ── */}
        {isProfessional && (
          <div style={{
            borderBottom: `0.5px solid ${THEME.headerBorder}`,
            background: THEME.headerBg,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              padding: '0.4rem 1.5rem',
            }}>
              <button
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  background: 'transparent', border: 'none',
                  color: showFilters ? THEME.accentA : THEME.textSecondary,
                  fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                  transition: 'color 0.2s',
                  padding: 0
                }}
              >
                <SlidersHorizontal size={14} />
                Clinical Filters {activeClinicalFilters.route || activeClinicalFilters.storage ? '(Active)' : ''}
              </button>
            </div>
            {showFilters && (
              <div style={{
                padding: '0.5rem 1.5rem 1rem',
                display: 'flex', gap: '1.5rem',
                animation: 'smFadeIn 0.2s ease-out'
              }}>
                {/* Route of Administration Filter */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: THEME.textMuted, fontWeight: 700 }}>
                    Administration Route
                  </span>
                  <select 
                    value={activeClinicalFilters.route || ''}
                    onChange={e => setActiveClinicalFilters(prev => ({ ...prev, route: e.target.value || null }))}
                    style={{
                      background: isProfessional ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.8)',
                      border: `1px solid ${THEME.cardBorder}`,
                      color: THEME.textPrimary,
                      padding: '0.4rem 0.6rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">Any Route</option>
                    <option value="Subcutaneous">Subcutaneous (SC)</option>
                    <option value="Intramuscular">Intramuscular (IM)</option>
                    <option value="Oral">Oral / Caps</option>
                    <option value="Nasal">Intranasal</option>
                  </select>
                </div>
                {/* Storage Stability Filter */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: THEME.textMuted, fontWeight: 700 }}>
                    Storage Stability
                  </span>
                  <select 
                    value={activeClinicalFilters.storage || ''}
                    onChange={e => setActiveClinicalFilters(prev => ({ ...prev, storage: e.target.value || null }))}
                    style={{
                      background: isProfessional ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.8)',
                      border: `1px solid ${THEME.cardBorder}`,
                      color: THEME.textPrimary,
                      padding: '0.4rem 0.6rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">Any Storage</option>
                    <option value="Room Temperature">Room Temperature Stable</option>
                    <option value="Refrigerated">Refrigeration Required</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}


        {/* Quick Filter Pills — only for guest (wellness-discovery mode) */}
        {!searchTerm.trim() && !isProfessional && (
          <div className="smSearchTags" style={{
            display: 'flex',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            overflowX: 'auto',
            borderBottom: `0.5px solid ${THEME.headerBorder}`,
            scrollbarWidth: 'none',
          }}>
            {[
              { label: '🔥 Fat Loss',  q: 'Fat Loss' },
              { label: '💉 Peptides', q: 'Peptide' },
              { label: '🦱 Hair',      q: 'Hair' },
              { label: '🏋️ Recovery', q: 'Recovery' },
              { label: '🧬 Longevity', q: 'Longevity' },
              { label: '🩹 Healing',   q: 'Healing' },
            ].map(({ label, q }, pillIdx) => (
              <button
                key={q}
                className="smPill"
                onClick={() => handleSearchChange(q)}
                style={{
                  whiteSpace: 'nowrap',
                  padding: '6px 14px',
                  borderRadius: '4px',
                  border: `1px solid ${THEME.cardBorder}`,
                  background: isProfessional ? '#303134' : '#f1f3f4',
                  color: THEME.textPrimary,
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'background 0.15s',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = isProfessional ? '#383a3e' : 'var(--color-border)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = isProfessional ? '#303134' : '#f1f3f4';
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Pro keyword chips — shown only for professional mode when idle */}
        {!searchTerm.trim() && isProfessional && (
          <div className="smSearchTags" style={{
            display: 'flex',
            gap: '0.4rem',
            padding: '0.6rem 1.5rem',
            overflowX: 'auto',
            borderBottom: `0.5px solid ${THEME.headerBorder}`,
            scrollbarWidth: 'none',
          }}>
            {[
              { label: 'BPC-157' }, { label: 'TB-500' }, { label: 'GHK-Cu' },
              { label: 'Semaglutide' }, { label: 'IGF-1' }, { label: 'CJC-1295' },
              { label: 'NMN' }, { label: 'Berberine' }, { label: 'CoQ10' },
            ].map(({ label }, pillIdx) => (
              <button
                key={label}
                onClick={() => handleSearchChange(label)}
                style={{
                  whiteSpace: 'nowrap',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: `1px solid ${THEME.cardBorder}`,
                  background: isProfessional ? '#303134' : '#f1f3f4',
                  color: THEME.textPrimary,
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  letterSpacing: '0.01em',
                  transition: 'background 0.15s ease',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = isProfessional ? '#383a3e' : 'var(--color-border)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = isProfessional ? '#303134' : '#f1f3f4';
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}



        {/* Scrollable Results Area */}
        <div style={{ 
          flex: 1,
          maxHeight: isMobile ? 'none' : (isProfessional ? '60vh' : '52vh'), 
          overflowY: 'auto', 
          backgroundColor: 'transparent',
          position: 'relative',
          WebkitOverflowScrolling: 'touch',
        }}>
          <div style={{ padding: '0 0 1rem' }}>
            {questionMode && searchTerm.trim().length > 3 && (
              <div style={{ padding: isMobile ? '0.75rem 1rem 0' : '1.25rem 1.5rem 0' }}>
                <ClinicalAIConsultationCard searchTerm={searchTerm} THEME={THEME} onClose={onClose} isMobile={isMobile} />
              </div>
            )}
            {/* Contextual AI Suggestions */}
            {searchTerm.trim().length > 2 && (
              <div style={{ 
                padding: isMobile ? '0.5rem 1rem' : '0.5rem 1.5rem', 
                display: 'flex', 
                gap: '0.4rem', 
                overflowX: 'auto', 
                scrollbarWidth: 'none',
                opacity: 0.85
              }}>
                {(searchResults.length > 0 ? ['Dosage', 'Side effects', 'Clinical evidence'] : 
                  supplementResults.length > 0 ? ['Stacking', 'Bioavailability', 'Benefits'] : 
                  ['Synergies', 'Cycle length', 'Safety']).map(sug => (
                  <button
                    key={sug}
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('open-clinical-ai', { 
                        detail: { autoSend: true, query: `${sug} of ${searchTerm}`, section: 'SearchModal.Suggestions' } 
                      }));
                    }}
                    style={{
                      whiteSpace: 'nowrap',
                      background: 'rgba(59,130,246,0.08)',
                      border: '1px solid rgba(59,130,246,0.15)',
                      borderRadius: '99px',
                      padding: '0.35rem 0.85rem',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: 'var(--color-primary)',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <Sparkles size={10} />
                    {sug}
                  </button>
                ))}
              </div>
            )}

            {isLoading ? (
              <SearchSkeleton THEME={THEME} isMobile={isMobile} />
            ) : (
              <>
                {searchTerm.trim().length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'smFadeIn 0.25s ease-out' }}>
                    {searchResults.length > 0 && (
                      <div style={{ padding: isMobile ? '0.5rem 1rem' : '0.75rem 1.5rem' }}>
                        <div style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          color: THEME.accentA,
                          marginBottom: '0.5rem',
                          borderBottom: `1px solid ${THEME.cardBorder}`,
                          paddingBottom: '0.25rem'
                        }}>
                          Peptides ({searchResults.length})
                        </div>
                        <PeptidesResults 
                          searchTerm={searchTerm}
                          isLoading={isLoading}
                          results={searchResults}
                          focusedItem={navigableItems[focusedIndex]}
                          onSelectProduct={onSelectProduct}
                          onClose={onClose}
                          THEME={THEME}
                          isProfessional={isProfessional}
                          isMobile={isMobile}
                        />
                      </div>
                    )}

                    {supplementResults.length > 0 && (
                      <div style={{ padding: isMobile ? '0.5rem 1rem' : '0.75rem 1.5rem' }}>
                        <div style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          color: THEME.accentC,
                          marginBottom: '0.5rem',
                          borderBottom: `1px solid ${THEME.cardBorder}`,
                          paddingBottom: '0.25rem'
                        }}>
                          Supplements ({supplementResults.length})
                        </div>
                        <SupplementsResults 
                          searchTerm={searchTerm}
                          isLoading={isLoading}
                          results={supplementResults}
                          focusedItem={navigableItems[focusedIndex]}
                          onSelectProduct={onSelectProduct}
                          onClose={onClose}
                          THEME={THEME}
                          isProfessional={isProfessional}
                          isMobile={isMobile}
                        />
                      </div>
                    )}

                    {protocolResults.length > 0 && (
                      <div style={{ padding: isMobile ? '0.5rem 1rem' : '0.75rem 1.5rem' }}>
                        <div style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          color: THEME.accentB,
                          marginBottom: '0.5rem',
                          borderBottom: `1px solid ${THEME.cardBorder}`,
                          paddingBottom: '0.25rem'
                        }}>
                          Protocols ({protocolResults.length})
                        </div>
                        <ProtocolsResults 
                          searchTerm={searchTerm}
                          isLoading={isLoading}
                          results={protocolResults}
                          focusedItem={navigableItems[focusedIndex]}
                          onClose={onClose}
                          navigate={navigate}
                          THEME={THEME}
                          isProfessional={isProfessional}
                          isMobile={isMobile}
                        />
                      </div>
                    )}

                    {!isLoading && searchResults.length === 0 && supplementResults.length === 0 && protocolResults.length === 0 && (
                      <>
                        {/* ── Algolia Cloud Fallback Results ── */}
                        {algoliaLoading && (
                          <div style={{ padding: '2rem', textAlign: 'center' }}>
                            <div className="smSpinner" style={{ margin: '0 auto 1rem' }} />
                            <p style={{ color: THEME.textMuted, fontSize: '0.85rem' }}>Searching cloud index...</p>
                          </div>
                        )}
                        {!algoliaLoading && (algoliaResults.products.length > 0 || algoliaResults.protocols.length > 0) && (
                          <div style={{ padding: isMobile ? '0.5rem 1rem' : '0.75rem 1.5rem', animation: 'smFadeIn 0.25s ease-out' }}>
                            <div style={{ 
                              fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', 
                              color: THEME.accentA, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem'
                            }}>
                              <Sparkles size={12} /> Cloud Search Results
                            </div>
                            {algoliaResults.products.map(hit => (
                              <div 
                                key={hit.objectID} 
                                className="srRow"
                                onClick={() => { onSelectProduct({ id: hit.objectID, name: hit.name }); onClose(); }}
                              >
                                <FlaskConical size={16} color={THEME.accentA} />
                                <div>
                                  <div style={{ fontWeight: 600, color: THEME.textPrimary, fontSize: '0.9rem' }}>{hit.name}</div>
                                  <div style={{ fontSize: '0.75rem', color: THEME.textSecondary }}>{hit.category}</div>
                                </div>
                              </div>
                            ))}
                            {algoliaResults.protocols.map(hit => (
                              <div 
                                key={hit.objectID} 
                                className="srRow"
                                onClick={() => { onClose(); navigate(`/protocol/${hit.objectID}`); }}
                              >
                                <ClipboardList size={16} color={THEME.accentB} />
                                <div>
                                  <div style={{ fontWeight: 600, color: THEME.textPrimary, fontSize: '0.9rem' }}>{hit.name}</div>
                                  <div style={{ fontSize: '0.75rem', color: THEME.textSecondary }}>{hit.category}</div>
                                </div>
                              </div>
                            ))}
                            <div style={{ textAlign: 'right', marginTop: '0.5rem', fontSize: '0.65rem', color: THEME.textMuted }}>
                              Powered by Algolia
                            </div>
                          </div>
                        )}
                        {!algoliaLoading && algoliaResults.products.length === 0 && algoliaResults.protocols.length === 0 && (
                          <SearchEmptyState query={searchTerm} THEME={THEME} onClose={onClose} isMobile={isMobile} />
                        )}
                      </>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Global Empty/Discovery States */}
            {!searchTerm.trim() && (
              <DiscoveryMode 
                isProfessional={isProfessional} 
                THEME={THEME} 
                setSearchTerm={setSearchTerm} 
                isMobile={isMobile}
              />
            )}

            {/* Global Loading State */}
            {isLoading && searchTerm.trim() && (
              <div style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
                <div className="smSpinner" style={{ margin: '0 auto 1.25rem' }} />
                <p style={{ color: THEME.textMuted, fontSize: '0.9rem', fontWeight: 500 }}>Searching database...</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Fixed Bottom Area (Always Visible) ─────────────────────────── */}
        <div style={{
          borderTop: `1px solid ${THEME.headerBorder}`,
          background: THEME.headerBg,
          position: 'relative',
          zIndex: 100,
          padding: '0.75rem 1.25rem 0.75rem'
        }}>

          {/* ── ClinicalAI Premium Discovery Dock ── */}
          <div
            style={{
              background: isProfessional ? '#303134' : '#f8f9fa',
              borderRadius: '4px',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              border: `1px solid ${THEME.cardBorder}`,
            }}
          >
            {/* AI Avatar Bubble */}
            <div style={{
              flexShrink: 0,
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: '#1a73e8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Bot size={22} style={{ color: 'var(--color-bg-surface)', zIndex: 1 }} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: THEME.textPrimary,
                fontFamily: 'inherit',
                letterSpacing: '-0.01em',
                marginBottom: '0.1rem'
              }}>
                ClinicalAI <span style={{ opacity: 0.5, fontWeight: 400, fontSize: '0.7rem' }}>• v6.6.1 Guided Discovery</span>
              </div>
              <div style={{
                fontSize: '0.7rem',
                color: THEME.textSecondary,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontWeight: 500
              }}>
                Compare options or find protocols with intelligent AI guidance.
              </div>
            </div>

            <button
              onClick={() => {
                const classification = classifyQuery(searchTerm, { catalogIndex: products });
                const intent = QUERY_TYPE_TO_INTENT[classification.query_type] || "guided_discovery";
                const ctx = {
                  source: "search_modal_dock",
                  currentQuery: searchTerm || "",
                  activeSection: activeTab || "peptides",
                  intent: intent,
                  classification: classification.query_type
                };
                window.dispatchEvent(
                  new CustomEvent('open-clinical-ai', {
                    detail: { 
                      autoSend: !!searchTerm.trim(), 
                      query: searchTerm,
                      context: ctx 
                    },
                  })
                );
              }}
              style={{
                background: '#1a73e8',
                color: 'var(--color-bg-surface)',
                border: 'none',
                padding: '0.6rem 1.25rem',
                borderRadius: '4px',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                whiteSpace: 'nowrap',
                transition: 'background 0.15s ease',
                fontFamily: 'inherit',
                letterSpacing: '0.01em',
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = '#1557b0';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = '#1a73e8';
              }}
            >
              <Sparkles size={14} strokeWidth={2} />
              Ask ClinicalAI
            </button>
          </div>
        </div>

        {/* Footer — database stats + keyboard hint (Fase 6: THEME tokens) */}
        <div style={{
          padding: isProfessional ? '0.65rem 1.5rem' : '0.85rem 1.5rem',
          borderTop: `1px solid ${THEME.footerBorder}`,
          background: THEME.footerBg,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          gap: '1rem', flexWrap: 'wrap',
          borderRadius: `0 0 ${THEME.modalRadius} ${THEME.modalRadius}`,
        }}>
          {/* Live stats badges — colors from THEME accent palette */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            {[
              { count: products.length,        label: isProfessional ? 'compounds'   : 'peptides',     color: THEME.accentA },
              { count: protocolIndex.length,   label: isProfessional ? 'protocols'   : 'routines',     color: THEME.accentB },
              { count: supplementResults.length,   label: isProfessional ? 'supplements' : 'supplements',  color: THEME.accentC },
            ].map(({ count, label, color }) => count > 0 && (
              <span key={label} style={{
                fontSize: '0.65rem', fontWeight: isProfessional ? 600 : 500,
                padding: isProfessional ? '2px 8px' : '3px 10px',
                borderRadius: isProfessional ? '6px' : '20px',
                backgroundColor: `${color}18`,
                border: `1px solid ${color}30`,
                color: color,
                letterSpacing: isProfessional ? '0.03em' : '0.01em',
                display: 'inline-flex', alignItems: 'center', gap: '3px',
                textTransform: isProfessional ? 'uppercase' : 'none',
              }}>
                <span style={{ fontWeight: 700 }}>{count}</span> {label}
              </span>
            ))}
          </div>

          {/* Right side: advanced link (Pro only) + keyboard hint */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isProfessional && (
              <button
                onClick={() => { onClose(); navigate('/search'); }}
                style={{
                  background: 'none', border: `1px solid ${THEME.accentA}30`,
                  borderRadius: '4px',
                  padding: '3px 10px',
                  color: THEME.accentA, fontWeight: 600,
                  fontSize: '0.65rem', cursor: 'pointer',
                  fontFamily: 'inherit', letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  transition: 'all 0.15s',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = `${THEME.accentA}18`;
                  e.currentTarget.style.borderColor = `${THEME.accentA}60`;
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.borderColor = `${THEME.accentA}30`;
                }}
              >
                Advanced Search <ArrowRight size={11} />
              </button>
            )}
            <span style={{
              fontSize: '0.67rem',
              color: THEME.textSecondary,
              fontWeight: 400, whiteSpace: 'nowrap'
            }}>
              {isProfessional ? 'Press ' : 'Tap '}
              <kbd style={{
                color: THEME.textSecondary,
                fontWeight: 600, fontFamily: 'inherit',
                background: isProfessional ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                border: `0.5px solid ${THEME.cardBorder}`,
                borderRadius: '4px', padding: '1px 5px', fontSize: '0.66rem'
              }}>Esc</kbd>
              {isProfessional ? ' to dismiss' : ' to close'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PeptidesResults({ searchTerm, isLoading, results, focusedItem, onSelectProduct, onClose, THEME, isProfessional, isMobile }) {
  const [showAll, setShowAll] = useState(false);
  const displayItems = showAll ? results : results.slice(0, 3);
  const hasMore = results.length > 3;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', border: `1px solid ${THEME.cardBorder}`, borderRadius: '4px', overflow: 'hidden' }}>
      {displayItems.map((p, idx) => {
        const isFocused = focusedItem && focusedItem.type === 'peptide' && focusedItem.id === p.id;
        const isLast = idx === displayItems.length - 1;
        return (
          <div
            key={`p-${p.id || p.name}-${idx}`}
            className="srRow"
            onClick={() => { onSelectProduct(p); onClose(); }}
            style={{
              background: isFocused ? (isProfessional ? '#383a3e' : '#f1f3f4') : THEME.cardBg,
              borderBottom: isLast ? 'none' : `1px solid ${THEME.cardBorder}`,
            }}
          >
            <div style={{ 
              width: '32px', height: '32px', borderRadius: '4px', 
              background: `${THEME.accentA}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: THEME.accentA,
              flexShrink: 0
            }}>
              <FlaskConical size={16} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: THEME.textPrimary, fontFamily: "var(--font-sans)", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
              <div style={{ fontSize: '0.75rem', color: THEME.textSecondary, fontFamily: "var(--font-sans)", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.shortDescription || 'Research Peptide'}</div>
            </div>
            <ArrowRight size={14} style={{ color: `${THEME.accentA}80`, flexShrink: 0 }} />
          </div>
        );
      })}
      {hasMore && (
        <button 
          onClick={() => setShowAll(!showAll)}
          style={{
            background: THEME.headerBg, border: 'none', color: THEME.accentA, fontSize: '0.75rem', fontWeight: 700,
            cursor: 'pointer', padding: '0.5rem', textAlign: 'center', opacity: 0.8, borderTop: `1px solid ${THEME.cardBorder}`
          }}
        >
          {showAll ? 'Show Less' : `Show ${results.length - 3} More Results`}
        </button>
      )}
    </div>
  );
}

function SupplementsResults({ searchTerm, isLoading, results, focusedItem, onSelectProduct, onClose, THEME, isProfessional, isMobile }) {
  const [showAll, setShowAll] = useState(false);
  const displayItems = showAll ? results : results.slice(0, 3);
  const hasMore = results.length > 3;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', border: `1px solid ${THEME.cardBorder}`, borderRadius: '4px', overflow: 'hidden' }}>
      {displayItems.map((s, idx) => {
        const isFocused = focusedItem && focusedItem.type === 'supplement' && focusedItem.id === s.id;
        const isLast = idx === displayItems.length - 1;
        return (
          <div
            key={`s-${s.id || s.name}-${idx}`}
            className="srRow"
            onClick={() => { onSelectProduct(s); onClose(); }}
            style={{
              background: isFocused ? (isProfessional ? '#383a3e' : '#f1f3f4') : THEME.cardBg,
              borderBottom: isLast ? 'none' : `1px solid ${THEME.cardBorder}`,
            }}
          >
            <div style={{ 
              width: '32px', height: '32px', borderRadius: '4px', 
              background: `${THEME.accentC}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: THEME.accentC,
              flexShrink: 0
            }}>
              <Sparkles size={16} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: THEME.textPrimary, fontFamily: "var(--font-sans)", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.displayName || s.name}</div>
              <div style={{ fontSize: '0.75rem', color: THEME.textSecondary, fontFamily: "var(--font-sans)", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.category || 'Supplement'}</div>
            </div>
            <ArrowRight size={14} style={{ color: `${THEME.accentC}80`, flexShrink: 0 }} />
          </div>
        );
      })}
      {hasMore && (
        <button 
          onClick={() => setShowAll(!showAll)}
          style={{
            background: THEME.headerBg, border: 'none', color: THEME.accentC, fontSize: '0.75rem', fontWeight: 700,
            cursor: 'pointer', padding: '0.5rem', textAlign: 'center', opacity: 0.8, borderTop: `1px solid ${THEME.cardBorder}`
          }}
        >
          {showAll ? 'Show Less' : `Show ${results.length - 3} More Results`}
        </button>
      )}
    </div>
  );
}

function ProtocolsResults({ searchTerm, isLoading, results, focusedItem, onClose, navigate, THEME, isProfessional, isMobile }) {
  const [showAll, setShowAll] = useState(false);
  const displayItems = showAll ? results : results.slice(0, 3);
  const hasMore = results.length > 3;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', border: `1px solid ${THEME.cardBorder}`, borderRadius: '4px', overflow: 'hidden' }}>
      {displayItems.map((p, idx) => {
        const isFocused = focusedItem && focusedItem.type === 'protocol' && focusedItem.protocol_id === p.protocol_id;
        const isLast = idx === displayItems.length - 1;
        return (
          <div
            key={`pr-${p.protocol_id}-${idx}`}
            className="srRow"
            onClick={() => { onClose(); navigate(`/protocol/${p.protocol_id}`); }}
            style={{
              background: isFocused ? (isProfessional ? '#383a3e' : '#f1f3f4') : THEME.cardBg,
              borderBottom: isLast ? 'none' : `1px solid ${THEME.cardBorder}`,
            }}
          >
            <div style={{ 
              width: '32px', height: '32px', borderRadius: '4px', 
              background: `${THEME.accentB}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: THEME.accentB,
              flexShrink: 0
            }}>
              <ClipboardList size={16} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: THEME.textPrimary, fontFamily: "var(--font-sans)", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
              <div style={{ fontSize: '0.75rem', color: THEME.textSecondary, fontFamily: "var(--font-sans)", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Protocol for {p.category}</div>
            </div>
            <ArrowRight size={14} style={{ color: `${THEME.accentB}80`, flexShrink: 0 }} />
          </div>
        );
      })}
      {hasMore && (
        <button 
          onClick={() => setShowAll(!showAll)}
          style={{
            background: THEME.headerBg, border: 'none', color: THEME.accentB, fontSize: '0.75rem', fontWeight: 700,
            cursor: 'pointer', padding: '0.5rem', textAlign: 'center', opacity: 0.8, borderTop: `1px solid ${THEME.cardBorder}`
          }}
        >
          {showAll ? 'Show Less' : `Show ${results.length - 3} More Results`}
        </button>
      )}
    </div>
  );
}

function DiscoveryMode({ isProfessional, THEME, setSearchTerm, isMobile }) {
  const categories = [
    {
      title: 'Peptides',
      desc: 'Query by name, CAS, or indication.',
      color: THEME.accentA,
      suggestions: ['BPC-157', 'TB-500', 'GHK-Cu', 'CJC-1295']
    },
    {
      title: 'Supplements',
      desc: 'Longevity and biological path indexes.',
      color: THEME.accentC,
      suggestions: ['NMN', 'Berberine', 'CoQ10', 'Spermidine']
    },
    {
      title: 'Protocols',
      desc: 'Structured stacks for research goals.',
      color: THEME.accentB,
      suggestions: ['TRT Protocol', 'Longevity Stack', 'Deep Sleep']
    }
  ];

  return (
    <div style={{ padding: isMobile ? '1.5rem 1rem' : '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ color: THEME.textPrimary, fontSize: '1rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>
          Search Reference Database
        </h3>
        <p style={{ color: THEME.textSecondary, fontSize: '0.85rem', margin: 0 }}>
          Query biological compounds, longevity routines, and active research protocols.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
        gap: '1.25rem'
      }}>
        {categories.map((cat) => (
          <div
            key={cat.title}
            style={{
              padding: '1.25rem',
              background: isProfessional ? '#303134' : '#f8f9fa',
              borderRadius: THEME.cardRadius,
              border: `1px solid ${THEME.cardBorder}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              alignItems: 'flex-start',
              textAlign: 'left'
            }}
          >
            <div>
              <h4 style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: cat.color,
                margin: '0 0 0.25rem 0',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                {cat.title}
              </h4>
              <p style={{
                fontSize: '0.75rem',
                color: THEME.textSecondary,
                margin: 0,
                lineHeight: 1.4
              }}>
                {cat.desc}
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: 'auto' }}>
              {cat.suggestions.map((sug) => (
                <button
                  key={sug}
                  onClick={() => setSearchTerm(sug)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: `1px solid ${THEME.cardBorder}`,
                    background: isProfessional ? '#202124' : 'var(--color-bg-surface)',
                    color: THEME.textPrimary,
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'background 0.1s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = isProfessional ? '#3c4043' : '#f1f3f4';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = isProfessional ? '#202124' : 'var(--color-bg-surface)';
                  }}
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClinicalAIConsultationCard({ searchTerm, THEME, onClose, isMobile }) {
  const isProfessional = THEME.modalBg === '#202124';
  return (
    <div 
      onClick={() => {
        window.dispatchEvent(new CustomEvent('open-clinical-ai', { 
          detail: { 
            autoSend: true, 
            query: searchTerm,
            section: 'SearchModal.QuestionCard'
          } 
        }));
      }}
      style={{
        background: isProfessional ? '#1c3d5a' : '#e8f0fe',
        borderRadius: '4px',
        padding: isMobile ? '1rem' : '1.25rem',
        marginBottom: '0.5rem',
        cursor: 'pointer',
        color: isProfessional ? '#d2e3fc' : '#1a73e8',
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '0.85rem' : '1.25rem',
        border: `1px solid ${isProfessional ? '#1a73e8' : '#d2e3fc'}`,
        borderLeft: `4px solid #1a73e8`,
        transition: 'background 0.15s',
      }}
      onMouseOver={e => e.currentTarget.style.background = isProfessional ? '#244e73' : '#d2e3fc'}
      onMouseOut={e => e.currentTarget.style.background = isProfessional ? '#1c3d5a' : '#e8f0fe'}
    >
      <div style={{
        background: 'rgba(255,255,255,0.2)',
        borderRadius: '4px',
        width: isMobile ? '40px' : '48px',
        height: isMobile ? '40px' : '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <Sparkles size={isMobile ? 20 : 24} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.9 }}>
          ClinicalAI Analysis
        </div>
        <div style={{ fontSize: isMobile ? '0.9rem' : '1.05rem', fontWeight: 800, marginTop: '2px', lineHeight: 1.2 }}>
          Consult AI about "{searchTerm}"
        </div>
        {!isMobile && (
          <div style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: '4px', fontWeight: 500 }}>
            Get research data and protocol insights instantly.
          </div>
        )}
      </div>
      <ArrowRight size={isMobile ? 16 : 20} />
    </div>
  );
}

function SearchEmptyState({ query, THEME, onClose, isMobile }) {
  return (
    <div style={{ 
      padding: isMobile ? '2rem 1rem' : '3rem 2rem', 
      textAlign: 'center', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      gap: '1rem'
    }}>
      <div style={{ 
        width: '60px', height: '60px', borderRadius: '20px', 
        background: 'rgba(148,163,184,0.06)', display: 'flex', 
        alignItems: 'center', justifyContent: 'center', color: THEME.textMuted,
        marginBottom: '0.5rem'
      }}>
        <Search size={28} strokeWidth={1.5} />
      </div>
      <div>
        <h3 style={{ margin: '0 0 0.5rem', color: THEME.textPrimary, fontSize: '1.15rem', fontWeight: 800 }}>No exact matches found</h3>
        <p style={{ margin: 0, color: THEME.textSecondary, fontSize: '0.9rem', lineHeight: 1.5, maxWidth: '280px' }}>
          We couldn't find anything for "{query}", but our ClinicalAI can still assist you.
        </p>
      </div>
      <button
        onClick={() => {
          window.dispatchEvent(new CustomEvent('open-clinical-ai', { 
            detail: { autoSend: true, query: `Tell me about ${query} in a clinical context`, section: 'SearchModal.FooterCard' } 
          }));
        }}
        style={{
          marginTop: '0.5rem',
          background: '#1a73e8',
          color: 'var(--color-bg-surface)',
          border: 'none',
          padding: '0.6rem 1.25rem',
          borderRadius: '4px',
          fontWeight: 600,
          fontSize: '0.85rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          transition: 'background 0.15s ease'
        }}
        onMouseOver={e => e.currentTarget.style.background = '#1557b0'}
        onMouseOut={e => e.currentTarget.style.background = '#1a73e8'}
      >
        <Bot size={16} />
        Ask ClinicalAI instead
      </button>
    </div>
  );
}