/* eslint-disable no-unused-vars */
import React, { useState, useRef } from 'react';
import { 
  Search, 
  ShieldCheck, 
  BookOpen, 
  Zap,
  Activity,
  Microscope,
  Scale,
  Moon,
  FlaskConical,
  ZapIcon,
  ArrowRight,
  Globe,
  Sparkles
} from 'lucide-react';

import { useResponsive } from '../hooks/useResponsive';
import { useNavigate } from 'react-router-dom';
import { classifyQuery, QUERY_TYPE_TO_INTENT } from '../utils/classifyQuery';
import '../styles/hero_search.css';

const QUICK_SUGGESTIONS = [
  { label: 'Tirzepatide',       icon: Activity },
  { label: 'BPC-157',           icon: Microscope },
  { label: 'Weight Loss',       icon: Scale },
  { label: 'Muscle Growth',     icon: Zap },
  { label: 'GHK-Cu',            icon: Sparkles },
  { label: 'NAD+',              icon: ZapIcon },
  { label: 'Skin Regeneration', icon: Sparkles },
  { label: 'Fat Loss',          icon: Activity },
  { label: 'TB-500',            icon: Microscope },
  { label: 'Anti-Aging',        icon: Moon },
  { label: 'Sleep Protocol',     icon: Moon },
  { label: 'Reconstitution',    icon: FlaskConical },
];

const STATIC_TRUST = [
  { icon: ShieldCheck, label: 'Research Validated' },
  { icon: BookOpen,    label: 'Evidence-Based' },
  { icon: Globe,       label: 'Worldwide Shipping' },
];

/**
 * HeroSearch — search-first hero.
 * Refined for a premium medical-pharmaceutical aesthetic.
 */
export default function HeroSearch({ onOpenSearch, searchQuery = '', setSearchQuery }) {
  const navigate = useNavigate();
  const [focused, setFocused] = useState(false);
  const isMobile = useResponsive('(max-width: 768px)');
  const inputRef = useRef(null);



  const triggerSearch = (q = '') => {
    const finalQuery = q || searchQuery;
    if (!finalQuery.trim()) return;

    // Phase 4: Basic AI Routing in Hero Search
    const classification = classifyQuery(finalQuery); // Using keyword fallback classification
    const intent = QUERY_TYPE_TO_INTENT[classification.query_type];

    // Auto-route to ClinicalAI for specific intents
    if (classification.query_type === 'comparison_query' || classification.query_type === 'general_education_query') {
      window.dispatchEvent(new CustomEvent('open-clinical-ai', { 
        detail: { 
          autoSend: true, 
          query: finalQuery,
          context: {
            source: "hero_search",
            intent: intent,
            classification: classification.query_type
          }
        } 
      }));
    } else {
      if (setSearchQuery) setSearchQuery(finalQuery);
      onOpenSearch?.(finalQuery);
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setSearchQuery?.(val);
    onOpenSearch?.(val);
  };

  const handleFocus = () => {
    setFocused(true);
    onOpenSearch?.(searchQuery);
  };

  const handleChip = (label) => {
    triggerSearch(label);
    inputRef.current?.blur();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    triggerSearch();
  };

  return (
    <section className={`hero-search ${isMobile ? 'hero-search--mobile' : ''}`}>
      {/* Background glow orbs */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: [
          'radial-gradient(ellipse 60% 50% at 20% 40%, rgba(0,163,224,0.06) 0%, transparent 70%)',
          'radial-gradient(ellipse 50% 40% at 80% 60%, rgba(16,185,129,0.04) 0%, transparent 70%)',
        ].join(','),
      }} />

      {/* Grid noise texture */}
      <div className="hero-search__grid-noise" />

      <div className="hero-search__content">

        {/* Eyebrow badge */}
        {!isMobile && (
          <div className="hero-search__eyebrow">
            <Zap size={12} strokeWidth={2.5} />
            Research Peptide Intelligence
          </div>
        )}

        {/* Main headline */}
        <h1 className={`hero-search__title ${isMobile ? 'hero-search__title--mobile' : ''}`}>
          Research Peptides and Research Protocols,{' '}
          <span className="hero-search__gradient-text">
            Ready for Research
          </span>
        </h1>
        
        <p className="hero-search__subtitle">
          Find protocols, compounds, and research evidence instantly with our advanced search system.
        </p>

        {/* Search bar */}
        <form onSubmit={handleSubmit} className="hero-search__form">
          <div className={`hero-search__input-wrapper ${focused ? 'hero-search__input-wrapper--focused' : ''} ${isMobile ? 'hero-search__input-wrapper--mobile' : ''}`}>
            <Search 
              size={20} 
              color={focused ? 'var(--secondary)' : 'var(--text-muted)'} 
              style={{ flexShrink: 0, transition: 'color 0.2s', marginLeft: isMobile ? '0.75rem' : 0, opacity: focused ? 1 : 0.5 }} 
            />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={() => setFocused(false)}
              placeholder={isMobile ? "Search..." : "Search peptides, blueprints, compounds, or research goals..."}
              className={`hero-search__input ${isMobile ? 'hero-search__input--mobile' : ''}`}
            />
            <button
              type="submit"
              className="hero-search__submit hide-on-mobile"
            >
              Search
            </button>
          </div>
        </form>

        {/* Popular Searches Title */}
        <div className="hero-search__suggestions-header">
          Popular Searches — Tap to try
        </div>

        {/* Quick suggestion chips — Scrolling Strip */}
        <div className="hero-search__suggestions-container">
          <div className="hero-search__suggestions-track">
            {[...QUICK_SUGGESTIONS, ...QUICK_SUGGESTIONS].map((s, idx) => (
              <button
                key={`${s.label}-${idx}`}
                onClick={() => handleChip(s.label)}
                className={`hero-search__chip ${isMobile ? 'hero-search__chip--mobile' : ''}`}
              >
                <s.icon size={isMobile ? 13 : 15} strokeWidth={2.5} color="var(--secondary)" /> 
                {s.label}
              </button>
            ))}
          </div>
        </div>



        {/* Trust indicators */}
        <div className={`hero-search__trust ${isMobile ? 'hero-search__trust--mobile' : ''}`}>
          {STATIC_TRUST.map(({ icon: Icon, label }) => (
            <div key={label} className={`hero-search__trust-item ${isMobile ? 'hero-search__trust-item--mobile' : ''}`}>
              <Icon size={isMobile ? 13 : 15} color='var(--secondary)' strokeWidth={2.5} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
