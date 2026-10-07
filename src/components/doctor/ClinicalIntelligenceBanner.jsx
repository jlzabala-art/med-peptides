'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  BookOpen,
  FlaskConical,
  Sparkles,
  Zap,
  Share2,
  ExternalLink,
  ChevronRight,
  Filter,
  Layers,
  CheckCircle2,
  Clock,
  X,
  ArrowRight,
  Shield,
  Activity,
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { searchAlgolia } from '@/services/algoliaSearch';
import EmptyState from '@/components/ui/EmptyState';

// ── Quick Demonstration Presets (Demonstrates Search Flexibility) ─────────────
const CLINICAL_PRESETS = [
  { label: 'BPC-157 + TB-500', query: 'BPC-157 TB-500', category: 'regenerative', icon: '🧬', desc: 'Dual Tissue & Tendon Healing' },
  { label: 'Tirzepatide & GLP-1', query: 'Tirzepatide', category: 'metabolic', icon: '⚖️', desc: 'Incretin Weight & Glucose Titration' },
  { label: 'NAD+ & Epithalon', query: 'NAD+ Epithalon', category: 'longevity', icon: '⏳', desc: 'Cellular Vitality & Telomere Clock' },
  { label: 'KPV & Gut Microbiome', query: 'KPV', category: 'regenerative', icon: '🛡️', desc: 'Leaky Gut & Mucosal Barrier' },
  { label: 'DSIP & Neuro Sleep', query: 'DSIP Selank', category: 'neuro', icon: '🌙', desc: 'Circadian Slow-Wave Reset' },
  { label: 'PT-141 Libido Axis', query: 'PT-141', category: 'hormonal', icon: '⚡', desc: 'Melanocortin Receptor Activation' }
];

// ── Clinical Specialties ────────────────────────────────────────────────────
const CLINICAL_SPECIALTIES = [
  { id: 'all', label: 'All Disciplines', icon: Layers },
  { id: 'metabolic', label: 'Metabolism & GLP-1', icon: Activity },
  { id: 'regenerative', label: 'Tissue Repair & Gut', icon: Zap },
  { id: 'longevity', label: 'Cellular Longevity & NAD+', icon: Sparkles },
  { id: 'neuro', label: 'Neuro & Sleep', icon: Clock },
  { id: 'immune', label: 'Immune Resilience', icon: Shield },
  { id: 'hormonal', label: 'Hormonal & Vitality', icon: FlaskConical }
];

export default function ClinicalIntelligenceBanner({
  protocols = [],
  formulary = [],
  opaqueDoctorCode = '',
  doctorName = '',
  onSelectProtocol,
  onSelectPeptide
}) {
  const [query, setQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [viewMode, setViewMode] = useState('dual'); // 'dual' | 'protocols' | 'peptides'
  const [activeTabMobile, setActiveTabMobile] = useState('protocols'); // 'protocols' | 'peptides' (for small screens)
  const [isSearchingAlgolia, setIsSearchingAlgolia] = useState(false);
  const [algoliaHits, setAlgoliaHits] = useState(null);
  const [searchSource, setSearchSource] = useState('local'); // 'local' | 'algolia'
  const searchInputRef = useRef(null);

  // Trigger Haptic Feedback safely
  const triggerHaptic = useCallback((type = 'light') => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      if (type === 'light') window.navigator.vibrate(8);
      else if (type === 'success') window.navigator.vibrate([10, 30, 15]);
    }
  }, []);

  // ── Keyboard Shortcut ⌘K / Ctrl+K ───────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        triggerHaptic('light');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerHaptic]);

  // ── Algolia Multi-Index Search with 180ms Debounce ──────────────────────────
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      setAlgoliaHits(null);
      setSearchSource('local');
      setIsSearchingAlgolia(false);
      return;
    }

    let isCurrent = true;
    const timer = setTimeout(async () => {
      setIsSearchingAlgolia(true);
      try {
        const res = await searchAlgolia(trimmed, { hitsPerPage: 20 });
        if (!isCurrent) return;
        if (res && (res.products?.length > 0 || res.protocols?.length > 0)) {
          setAlgoliaHits(res);
          setSearchSource('algolia');
        } else {
          setAlgoliaHits(null);
          setSearchSource('local');
        }
      } catch (err) {
        if (!isCurrent) return;
        setAlgoliaHits(null);
        setSearchSource('local');
      } finally {
        if (isCurrent) setIsSearchingAlgolia(false);
      }
    }, 180);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [query]);

  // ── Federated Search Computation (Combining Protocols & Formulary) ────────
  const { matchedProtocols, matchedPeptides, isFiltered } = useMemo(() => {
    const q = query.toLowerCase().trim();
    const spec = selectedSpecialty;
    const hasFilter = q.length > 0 || spec !== 'all';

    let protos = protocols;
    let peps = formulary;

    // 1. Specialty Filter
    if (spec !== 'all') {
      protos = protos.filter((p) => {
        const cat = String(p.category || '').toLowerCase();
        const title = String(p.title || '').toLowerCase();
        const summary = String(p.summary || '').toLowerCase();
        if (spec === 'metabolic') {
          return cat.includes('metabol') || cat.includes('weight') || cat.includes('incretin') || title.includes('glp') || title.includes('tirzepatide') || title.includes('semaglutide') || summary.includes('glucose');
        }
        if (spec === 'regenerative') {
          return cat.includes('regen') || cat.includes('tissue') || cat.includes('recovery') || title.includes('bpc') || title.includes('tb-500') || title.includes('kpv') || summary.includes('gut') || summary.includes('tendon');
        }
        if (spec === 'longevity') {
          return cat.includes('long') || cat.includes('cellular') || cat.includes('anti-aging') || title.includes('nad') || title.includes('epithalon') || title.includes('mitochondr') || summary.includes('telomere');
        }
        if (spec === 'neuro') {
          return cat.includes('neuro') || cat.includes('cognit') || cat.includes('sleep') || title.includes('dsip') || title.includes('selank') || title.includes('semax');
        }
        if (spec === 'immune') {
          return cat.includes('immun') || cat.includes('resilien') || title.includes('thymosin') || title.includes('ta1');
        }
        if (spec === 'hormonal') {
          return cat.includes('hormon') || cat.includes('sexual') || cat.includes('vital') || title.includes('pt-141') || title.includes('gonadorelin') || title.includes('kisspeptin');
        }
        return true;
      });

      peps = peps.filter((p) => {
        const goalStr = `${p.primaryGoal || ''} ${(p.goals || []).join(' ')} ${p.name || ''}`.toLowerCase();
        if (spec === 'metabolic') return goalStr.includes('metabol') || goalStr.includes('fat') || goalStr.includes('weight') || goalStr.includes('glp');
        if (spec === 'regenerative') return goalStr.includes('tissue') || goalStr.includes('repair') || goalStr.includes('gut') || goalStr.includes('recovery') || goalStr.includes('tendon');
        if (spec === 'longevity') return goalStr.includes('cellular') || goalStr.includes('aging') || goalStr.includes('longevity') || goalStr.includes('mitochondr');
        if (spec === 'neuro') return goalStr.includes('neuro') || goalStr.includes('cognit') || goalStr.includes('sleep');
        if (spec === 'immune') return goalStr.includes('immun');
        if (spec === 'hormonal') return goalStr.includes('hormon') || goalStr.includes('sexual') || goalStr.includes('growth');
        return true;
      });
    }

    // 2. Query Search (Algolia-assisted or local deep text search)
    if (q) {
      // Check if Algolia provided explicit hit IDs
      const algoliaProtoIds = algoliaHits?.protocols ? new Set(algoliaHits.protocols.map(h => String(h.objectID || h.slug || h.id))) : null;
      const algoliaProductNames = algoliaHits?.products ? new Set(algoliaHits.products.map(h => String(h.name || h.title || '').toLowerCase())) : null;

      protos = protos.filter((p) => {
        if (algoliaProtoIds && (algoliaProtoIds.has(String(p.id)) || algoliaProtoIds.has(String(p.slug)))) {
          return true;
        }
        const matchTitle = (p.title || '').toLowerCase().includes(q);
        const matchSummary = (p.summary || '').toLowerCase().includes(q);
        const matchCategory = (p.category || '').toLowerCase().includes(q);
        const matchCompounds = Array.isArray(p.compounds) && p.compounds.some((c) => String(typeof c === 'string' ? c : c.name || '').toLowerCase().includes(q));
        return matchTitle || matchSummary || matchCategory || matchCompounds;
      });

      peps = peps.filter((p) => {
        const pNameLower = String(p.name || '').toLowerCase();
        if (algoliaProductNames && algoliaProductNames.has(pNameLower)) {
          return true;
        }
        const matchName = pNameLower.includes(q);
        const matchGoal = (p.primaryGoal || '').toLowerCase().includes(q);
        const matchGoals = Array.isArray(p.goals) && p.goals.some((g) => String(g).toLowerCase().includes(q));
        const matchMoa = (p.moa || '').toLowerCase().includes(q);
        const matchDesc = (p.description || '').toLowerCase().includes(q);
        return matchName || matchGoal || matchGoals || matchMoa || matchDesc;
      });
    }

    return {
      matchedProtocols: protos,
      matchedPeptides: peps,
      isFiltered: hasFilter
    };
  }, [protocols, formulary, query, selectedSpecialty, algoliaHits]);

  // Handle Preset Click
  const handleApplyPreset = (preset) => {
    triggerHaptic('light');
    setQuery(preset.query);
    if (preset.category) {
      setSelectedSpecialty(preset.category);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    triggerHaptic('light');
    setQuery('');
    setSelectedSpecialty('all');
    searchInputRef.current?.focus();
  };

  // Copy 1-Click Intake for a Protocol
  const handleCopyProtocolIntake = (proto, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    triggerHaptic('success');
    const url = `${window.location.origin}/intake?protocol=${proto.slug || proto.id}&dr=${opaqueDoctorCode}`;
    navigator.clipboard?.writeText(url);
    toast.success(`Prescription intake link for "${proto.title}" copied to clipboard ✓`);
  };

  // Copy 1-Click Intake for a Peptide
  const handleCopyPeptideIntake = (pep, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    triggerHaptic('success');
    const url = `${window.location.origin}/intake?peptide=${encodeURIComponent(pep.name)}&dr=${opaqueDoctorCode}`;
    navigator.clipboard?.writeText(url);
    toast.success(`Custom compounding intake link for "${pep.name}" copied to clipboard ✓`);
  };

  return (
    <section
      id="protocols"
      style={{
        background: '#ffffff',
        border: '1px solid #dadce0',
        borderRadius: '10px',
        marginTop: '32px',
        boxShadow: '0 2px 8px rgba(0, 34, 68, 0.05)',
        overflow: 'hidden'
      }}
    >
      {/* ── 1. Hero Cockpit Header (Dark Navy & GCP Aesthetic) ───────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #002244 0%, #003666 50%, #084c8d 100%)',
          color: '#ffffff',
          padding: '24px 24px 20px 24px',
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span
                style={{
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  color: '#38bdf8',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Sparkles size={11} />
                <span>Algolia AI Discovery Engine</span>
              </span>
              <span
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  color: '#e2e8f0',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  fontSize: '0.68rem',
                  fontWeight: 600
                }}
              >
                Dual Federated Index
              </span>
            </div>

            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>Clinical Protocols & Bioactive Pharmacopeia</span>
            </h2>

            <p style={{ margin: '6px 0 0 0', fontSize: '0.82rem', color: '#93c5fd', maxWidth: '780px', lineHeight: 1.45 }}>
              Universal search engine connecting standardized titration pathways, chronobiological receptor management, and compounding APIs for licensed clinical practice.
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.10)',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                padding: '6px 12px',
                borderRadius: '6px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', lineHeight: 1 }}>
                {matchedProtocols.length}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#cbd5e1', marginTop: '2px', textTransform: 'uppercase' }}>
                Protocols
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.10)',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                padding: '6px 12px',
                borderRadius: '6px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#38bdf8', lineHeight: 1 }}>
                {matchedPeptides.length}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#cbd5e1', marginTop: '2px', textTransform: 'uppercase' }}>
                Active APIs
              </div>
            </div>

            <a
              href="/proto"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: '#ffffff',
                color: '#003666',
                padding: '7px 12px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 650,
                textDecoration: 'none',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
              }}
            >
              <span>Full Dossier Index</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* ── 2. Prominent Interactive Search Bar (Golden Rule #7) ─────────────── */}
        <div style={{ marginTop: '18px', position: 'relative' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#ffffff',
              borderRadius: '8px',
              border: '2px solid rgba(56, 189, 248, 0.6)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.18)',
              padding: '4px 8px 4px 14px',
              transition: 'all 0.15s ease'
            }}
          >
            <Search size={18} style={{ color: '#003666', flexShrink: 0, marginRight: '10px' }} />

            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by clinical objective, peptide name or protocol (e.g. BPC-157, Semaglutide, gut repair, sleep, NAD+)..."
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                fontSize: '0.90rem',
                color: '#0f172a',
                padding: '8px 0',
                background: 'transparent'
              }}
            />

            {/* Clear Button */}
            {query.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  searchInputRef.current?.focus();
                }}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '22px',
                  height: '22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                  cursor: 'pointer',
                  marginRight: '8px',
                  flexShrink: 0
                }}
                title="Clear query"
              >
                <X size={12} />
              </button>
            )}

            {/* Keyboard Hint or Algolia Live Spinner */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              {isSearchingAlgolia ? (
                <span
                  style={{
                    fontSize: '0.68rem',
                    color: '#0284c7',
                    background: '#e0f2fe',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <RefreshCw size={10} className="animate-spin" />
                  <span>Algolia Indexing</span>
                </span>
              ) : searchSource === 'algolia' && query.length >= 2 ? (
                <span
                  style={{
                    fontSize: '0.68rem',
                    color: '#0369a1',
                    background: '#e0f2fe',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 600
                  }}
                >
                  ⚡ Algolia Live
                </span>
              ) : (
                <kbd
                  style={{
                    fontSize: '0.70rem',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    color: '#64748b',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 600
                  }}
                >
                  ⌘K
                </kbd>
              )}
            </div>
          </div>
        </div>

        {/* ── 3. Quick Demonstration Presets (Banner Flexibility) ──────────────── */}
        <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', color: '#93c5fd', fontWeight: 600, textTransform: 'uppercase', marginRight: '4px' }}>
            Quick Clinical Stacks:
          </span>
          {CLINICAL_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(p)}
              style={{
                background: query.includes(p.query) ? 'rgba(56, 189, 248, 0.3)' : 'rgba(255, 255, 255, 0.12)',
                border: query.includes(p.query) ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.22)',
                color: query.includes(p.query) ? '#ffffff' : '#f8fafc',
                borderRadius: '14px',
                padding: '3px 9px',
                fontSize: '0.72rem',
                fontWeight: 550,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.12s'
              }}
              title={p.desc}
            >
              <span>{p.icon}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 4. Specialty Discipline Pills & View Control Bar ─────────────────── */}
      <div
        style={{
          padding: '12px 22px',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        {/* Specialty Filter Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginRight: '4px' }}>
            Discipline:
          </span>
          {CLINICAL_SPECIALTIES.map((spec) => {
            const isSelected = selectedSpecialty === spec.id;
            const Icon = spec.icon;
            return (
              <button
                key={spec.id}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedSpecialty(spec.id);
                }}
                style={{
                  padding: '4px 10px',
                  borderRadius: '14px',
                  border: isSelected ? '1px solid #003666' : '1px solid #cbd5e1',
                  background: isSelected ? '#003666' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#334155',
                  fontSize: '0.72rem',
                  fontWeight: isSelected ? 650 : 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.12s'
                }}
              >
                <Icon size={11} />
                <span>{spec.label}</span>
              </button>
            );
          })}

          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              style={{
                padding: '4px 8px',
                borderRadius: '14px',
                border: '1px dashed #ef4444',
                background: '#fef2f2',
                color: '#dc2626',
                fontSize: '0.70rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}
            >
              <X size={10} />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* View Layout Switcher (Desktop) & Tab Switcher (Mobile) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Mobile Tab Switcher */}
          <div className="md:hidden" style={{ display: 'inline-flex', background: '#e2e8f0', padding: '2px', borderRadius: '6px' }}>
            <button
              type="button"
              onClick={() => setActiveTabMobile('protocols')}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: 650,
                border: 'none',
                background: activeTabMobile === 'protocols' ? '#ffffff' : 'transparent',
                color: activeTabMobile === 'protocols' ? '#003666' : '#64748b',
                cursor: 'pointer'
              }}
            >
              Protocols ({matchedProtocols.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTabMobile('peptides')}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: 650,
                border: 'none',
                background: activeTabMobile === 'peptides' ? '#ffffff' : 'transparent',
                color: activeTabMobile === 'peptides' ? '#003666' : '#64748b',
                cursor: 'pointer'
              }}
            >
              APIs ({matchedPeptides.length})
            </button>
          </div>

          {/* Desktop View Mode Toggle */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: '4px', background: '#e2e8f0', padding: '2px', borderRadius: '6px' }}>
            {[
              { id: 'dual', label: 'Side-by-Side Dual', icon: Layers },
              { id: 'protocols', label: `Protocols (${matchedProtocols.length})`, icon: BookOpen },
              { id: 'peptides', label: `APIs (${matchedPeptides.length})`, icon: FlaskConical }
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setViewMode(mode.id);
                }}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: 'none',
                  background: viewMode === mode.id ? '#ffffff' : 'transparent',
                  color: viewMode === mode.id ? '#003666' : '#64748b',
                  fontSize: '0.70rem',
                  fontWeight: viewMode === mode.id ? 650 : 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: viewMode === mode.id ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                <mode.icon size={11} />
                <span>{mode.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 5. Discovery Results Matrix ──────────────────────────────────────── */}
      <div style={{ padding: '20px 22px' }}>
        {matchedProtocols.length === 0 && matchedPeptides.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No clinical protocols or peptides match your search"
            subtitle="Try adjusting your keyword, resetting the specialty filter, or using one of the quick clinical stacks above."
            action={{
              label: 'Reset Discovery Search',
              onClick: handleResetFilters
            }}
          />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                viewMode === 'dual'
                  ? 'repeat(auto-fit, minmax(420px, 1fr))'
                  : '1fr',
              gap: '24px'
            }}
          >
            {/* ── Column A: Clinical Protocols ── */}
            {(viewMode === 'dual' || viewMode === 'protocols' || (typeof window !== 'undefined' && window.innerWidth < 768 && activeTabMobile === 'protocols')) && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '6px', borderBottom: '2px solid #003666' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BookOpen size={16} style={{ color: '#003666' }} />
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                      Evidence-Based Clinical Protocols
                    </span>
                    <span style={{ fontSize: '0.70rem', fontWeight: 650, color: '#1d4ed8', background: '#eff6ff', padding: '1px 6px', borderRadius: '10px' }}>
                      {matchedProtocols.length}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.70rem', color: '#64748b' }}>
                    Structured Titration Curves
                  </span>
                </div>

                {matchedProtocols.length === 0 ? (
                  <div style={{ padding: '30px 16px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                    <p style={{ margin: 0, fontSize: '0.80rem', color: '#64748b' }}>
                      No structured protocols match &ldquo;{query}&rdquo; in this specialty.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSelectedSpecialty('all')}
                      style={{ marginTop: '8px', fontSize: '0.72rem', color: '#1a73e8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Show protocols in all specialties →
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {matchedProtocols.slice(0, 16).map((proto) => (
                      <div
                        key={proto.id || proto.slug}
                        style={{
                          border: '1px solid #dadce0',
                          borderRadius: '8px',
                          background: '#ffffff',
                          padding: '14px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '10px',
                          transition: 'border-color 0.15s, box-shadow 0.15s',
                          boxShadow: '0 1px 2px rgba(60,64,67,0.04)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#003666';
                          e.currentTarget.style.boxShadow = '0 3px 10px rgba(0, 54, 102, 0.08)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#dadce0';
                          e.currentTarget.style.boxShadow = '0 1px 2px rgba(60,64,67,0.04)';
                        }}
                      >
                        <div>
                          {/* Badges */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '6px' }}>
                            <span style={{ fontSize: '0.66rem', fontWeight: 650, color: '#003666', background: '#f0f7ff', border: '1px solid #c8e1ff', padding: '1px 6px', borderRadius: '10px' }}>
                              {proto.category || 'Integrative'}
                            </span>
                            <span style={{ fontSize: '0.66rem', fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Clock size={10} />
                              <span>{proto.durationWeeks || 8} Weeks</span>
                            </span>
                          </div>

                          {/* Title */}
                          <a
                            href={proto.dossierUrl || `/proto/${proto.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: 'none', color: 'inherit' }}
                          >
                            <h4 style={{ margin: '0 0 4px 0', fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.35 }}>
                              {proto.title}
                            </h4>
                          </a>

                          {/* Summary */}
                          <p style={{ margin: '0 0 8px 0', fontSize: '0.76rem', color: '#475569', lineHeight: 1.4 }}>
                            {proto.summary && proto.summary.length > 120 ? `${proto.summary.slice(0, 120)}...` : (proto.summary || 'Evidence-based structured clinical protocol.')}
                          </p>

                          {/* Formulated Compounds Pills (Interactive cross-filter) */}
                          {Array.isArray(proto.compounds) && proto.compounds.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                              {proto.compounds.slice(0, 4).map((c, i) => {
                                const cName = typeof c === 'string' ? c : (c.name || 'API');
                                return (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => {
                                      triggerHaptic('light');
                                      setQuery(cName);
                                    }}
                                    style={{
                                      fontSize: '0.68rem',
                                      fontWeight: 550,
                                      background: '#f8fafc',
                                      border: '1px solid #e2e8f0',
                                      color: '#1e293b',
                                      padding: '1px 6px',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      transition: 'all 0.1s'
                                    }}
                                    title={`Filter APIs and protocols matching "${cName}"`}
                                  >
                                    🧪 {cName}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                          <button
                            type="button"
                            onClick={(e) => handleCopyProtocolIntake(proto, e)}
                            style={{
                              background: '#003666',
                              border: '1px solid #002244',
                              color: '#ffffff',
                              borderRadius: '4px',
                              padding: '4px 10px',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              boxShadow: '0 1px 2px rgba(0,54,102,0.18)'
                            }}
                            title="Generate patient intake link with this protocol preselected"
                          >
                            <Share2 size={11} />
                            <span>Prescribe Intake</span>
                          </button>

                          <a
                            href={proto.dossierUrl || `/proto/${proto.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              color: '#334155',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              textDecoration: 'none'
                            }}
                          >
                            <span>View Dossier</span>
                            <ExternalLink size={10} />
                          </a>
                        </div>
                      </div>
                    ))}
                    {matchedProtocols.length > 16 && (
                      <div style={{ textAlign: 'center', padding: '8px' }}>
                        <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          Showing 16 of {matchedProtocols.length} matching protocols. Refine search query for exact matches.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Column B: Therapeutic Peptides & APIs ── */}
            {(viewMode === 'dual' || viewMode === 'peptides' || (typeof window !== 'undefined' && window.innerWidth < 768 && activeTabMobile === 'peptides')) && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '6px', borderBottom: '2px solid #0284c7' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FlaskConical size={16} style={{ color: '#0284c7' }} />
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                      Compounding Pharmacopeia & APIs
                    </span>
                    <span style={{ fontSize: '0.70rem', fontWeight: 650, color: '#0369a1', background: '#e0f2fe', padding: '1px 6px', borderRadius: '10px' }}>
                      {matchedPeptides.length}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.70rem', color: '#64748b' }}>
                    EU GMP / Sterile Lyophilized
                  </span>
                </div>

                {matchedPeptides.length === 0 ? (
                  <div style={{ padding: '30px 16px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                    <p style={{ margin: 0, fontSize: '0.80rem', color: '#64748b' }}>
                      No therapeutic APIs match &ldquo;{query}&rdquo; in this specialty.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSelectedSpecialty('all')}
                      style={{ marginTop: '8px', fontSize: '0.72rem', color: '#0284c7', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Show APIs in all specialties →
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {matchedPeptides.slice(0, 16).map((pep) => {
                      // Find protocols connected to this peptide
                      const connectedProtos = protocols.filter(proto => {
                        const pepName = String(pep.name || '').toLowerCase();
                        return (
                          (proto.title || '').toLowerCase().includes(pepName) ||
                          (Array.isArray(proto.compounds) && proto.compounds.some(c => String(typeof c === 'string' ? c : c.name || '').toLowerCase().includes(pepName)))
                        );
                      });

                      return (
                        <div
                          key={pep.id || pep.code || pep.name}
                          style={{
                            border: '1px solid #dadce0',
                            borderRadius: '8px',
                            background: '#ffffff',
                            padding: '14px 16px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '10px',
                            transition: 'border-color 0.15s, box-shadow 0.15s',
                            boxShadow: '0 1px 2px rgba(60,64,67,0.04)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#0284c7';
                            e.currentTarget.style.boxShadow = '0 3px 10px rgba(2, 132, 199, 0.08)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#dadce0';
                            e.currentTarget.style.boxShadow = '0 1px 2px rgba(60,64,67,0.04)';
                          }}
                        >
                          <div>
                            {/* Badges */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '6px' }}>
                              <span style={{ fontSize: '0.66rem', fontWeight: 650, color: '#0369a1', background: '#e0f2fe', border: '1px solid #bae6fd', padding: '1px 6px', borderRadius: '10px' }}>
                                {pep.primaryGoal || 'Bioactive API'}
                              </span>
                              <span style={{ fontSize: '0.66rem', fontWeight: 600, color: '#475569', background: '#f8fafc', padding: '1px 6px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                                {pep.format || 'SubQ / Lyophilized'}
                              </span>
                            </div>

                            {/* Peptide Name */}
                            <h4 style={{ margin: '0 0 4px 0', fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                              {pep.name}
                            </h4>

                            {/* MOA / Description */}
                            <p style={{ margin: '0 0 8px 0', fontSize: '0.76rem', color: '#475569', lineHeight: 1.4 }}>
                              {pep.moa || pep.description || 'Reference Active Pharmaceutical Ingredient for custom compounded prescription formulations.'}
                            </p>

                            {/* Connected Protocols Synergy */}
                            {connectedProtos.length > 0 && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', marginBottom: '6px' }}>
                                <span style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 600 }}>
                                  In Protocols:
                                </span>
                                {connectedProtos.slice(0, 2).map((cp, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                      triggerHaptic('light');
                                      setQuery(cp.title || cp.slug);
                                    }}
                                    style={{
                                      fontSize: '0.66rem',
                                      background: '#f0fdf4',
                                      border: '1px solid #bbf7d0',
                                      color: '#166534',
                                      borderRadius: '4px',
                                      padding: '1px 5px',
                                      cursor: 'pointer'
                                    }}
                                    title={`View protocol: ${cp.title}`}
                                  >
                                    📘 {cp.title.length > 25 ? `${cp.title.slice(0, 25)}...` : cp.title}
                                  </button>
                                ))}
                                {connectedProtos.length > 2 && (
                                  <span style={{ fontSize: '0.66rem', color: '#64748b' }}>
                                    +{connectedProtos.length - 2} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                            <button
                              type="button"
                              onClick={(e) => handleCopyPeptideIntake(pep, e)}
                              style={{
                                background: '#0284c7',
                                border: '1px solid #0369a1',
                                color: '#ffffff',
                                borderRadius: '4px',
                                padding: '4px 10px',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                boxShadow: '0 1px 2px rgba(2,132,199,0.18)'
                              }}
                              title="Generate patient intake link with this peptide API preselected"
                            >
                              <Share2 size={11} />
                              <span>Prescribe Intake</span>
                            </button>

                            <a
                              href={`https://med-peptides.com/c/CAT-MUWWS6JL`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: '#ffffff',
                                border: '1px solid #cbd5e1',
                                color: '#334155',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                textDecoration: 'none'
                              }}
                            >
                              <span>COA & Monograph</span>
                              <ExternalLink size={10} />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                    {matchedPeptides.length > 16 && (
                      <div style={{ textAlign: 'center', padding: '8px' }}>
                        <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          Showing 16 of {matchedPeptides.length} matching APIs. Refine search query for exact matches.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
