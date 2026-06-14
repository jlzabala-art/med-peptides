import ChevronLeft from "lucide-react/dist/esm/icons/chevron-left";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import Pill from "lucide-react/dist/esm/icons/pill";
import ClipboardList from "lucide-react/dist/esm/icons/clipboard-list";
import Bot from "lucide-react/dist/esm/icons/bot";
import X from "lucide-react/dist/esm/icons/x";
import Microscope from "lucide-react/dist/esm/icons/microscope";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
/* eslint-disable no-unused-vars */
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';










/**
 * GoalLifestyleStrip — Clinical Pathway 2.0
 * 7 lifestyle pathways with full navigation awareness and guided exploration UX.
 */
const GOALS = [
  { id: 'Muscle Growth & Recovery',      label: 'Muscle Growth & Recovery',      img: '/assets/goals/recovery.png',  desc: 'Hypertrophy and tissue restoration',  imgPos: 'center 40%' },
  { id: 'Fat Loss & Metabolic Health',   label: 'Fat Loss & Metabolic Health',   img: '/assets/goals/metabolic.png', desc: 'Lipid mobilization and energy',       imgPos: 'center 30%' },
  { id: 'Cognitive Performance & Focus', label: 'Cognitive Performance & Focus', img: '/assets/goals/cognitive.png', desc: 'Neurotrophic support and clarity',    imgPos: 'center 25%' },
  { id: 'Longevity & Biological Repair', label: 'Longevity & Biological Repair', img: '/assets/goals/longevity.png', desc: 'Telomere maintenance and autophagy',  imgPos: 'center 50%' },
  { id: 'Hormonal Vitality & Balance',   label: 'Hormonal Vitality & Balance',   img: '/assets/goals/hormonal.png',  desc: 'Endocrine signaling and libido',      imgPos: 'center 20%' },
  { id: 'Skin, Hair & Cellular Health',  label: 'Skin, Hair & Cellular Health',  img: '/assets/goals/sleep.png',     desc: 'Collagen matrix and dermal repair',   imgPos: 'center 30%' },
  { id: 'Immune Function & Defense',     label: 'Immune Function & Defense',     img: '/assets/goals/immune.png',    desc: 'Cytokine regulation and resilience',  imgPos: 'center 35%' },
  { id: 'Better Sleep & Circadian Restoration', label: 'Better Sleep & Circadian Restoration', img: '/images/sleep-goal.png', desc: 'Delta wave support and sleep cycles', imgPos: 'center 30%' },
];

import { GOAL_DRAWER_DETAILS, CLINICAL_AI_CONTEXTS } from '../hooks/useGuestPreferences';

export default function GoalLifestyleStrip({ onSelectCategory, onOpenSearch, onSeedSearch, onOpenAI }) {
  const navigate    = useNavigate();
  const scrollRef   = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX,     setStartX]     = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [activeIdx,  setActiveIdx]  = useState(0);   // tracks visible card for progress dots
  const [showHint,   setShowHint]   = useState(true); // first-visit scroll hint
  const [isMobile,   setIsMobile]   = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const ITEMS = [
    {
      id: 'intro',
      isIntro: true,
      label: 'Begin Your Journey',
      desc: 'Get ready for a wonderful journey to improve your health. Explore our 8 optimization paths integrating advanced research peptides and protocols.',
    },
    ...GOALS
  ];

  const TOTAL = ITEMS.length;

  const [navOpen,    setNavOpen]    = useState(false); // Phase 7: mini navigator
  const [navAnchor,  setNavAnchor]  = useState({ top: 0, left: 0 }); // badge position
  const navRef = useRef(null);

  // ── Measure actual card width + gap from the DOM ─────────────────────────
  // Using a hardcoded value breaks on mobile (cards are 220px not 280px).
  const getCardWidth = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return 304;
    const firstCard = el.querySelector('.gls-card');
    if (!firstCard) return 304;
    const inner = el.querySelector('.gls-inner');
    const gap = inner ? parseFloat(getComputedStyle(inner).gap) || 24 : 24;
    return firstCard.offsetWidth + gap;
  }, []);

  // ── Update active index on scroll ──────────────────────────────────────────
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = getCardWidth();
    const idx = Math.round(el.scrollLeft / cardWidth);
    setActiveIdx(Math.min(Math.max(idx, 0), TOTAL - 1));
    if (el.scrollLeft > 10) setShowHint(false);
  }, [getCardWidth, TOTAL]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Always start at the first card so counter shows 01
    el.scrollLeft = 0;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // ── Keyboard navigation ────────────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') scrollManual('right');
      if (e.key === 'ArrowLeft')  scrollManual('left');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // ── Phase 7: close navigator on outside click or ESC ─────────────────────
  useEffect(() => {
    if (!navOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') setNavOpen(false); };
    const handleClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setNavOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [navOpen]);

  const openNavigator = (e, idx) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setNavAnchor({ top: rect.bottom + window.scrollY + 8, left: rect.left + window.scrollX });
    setNavOpen((prev) => !prev);
  };

  const jumpToPathway = (idx) => {
    scrollToCard(idx);
    setNavOpen(false);
  };

  // ── Manual scroll via arrows ───────────────────────────────────────────────
  const scrollManual = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = getCardWidth();
    const newScroll = direction === 'left'
      ? el.scrollLeft - cardWidth
      : el.scrollLeft + cardWidth;
    el.scrollTo({ left: newScroll, behavior: 'smooth' });
  };

  // Navigate directly to a card by dot click
  const scrollToCard = (idx) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = getCardWidth();
    el.scrollTo({ left: idx * cardWidth, behavior: 'smooth' });
  };

  const onStart = (clientX) => {
    setIsDragging(true);
    const el = scrollRef.current;
    setStartX(clientX - el.offsetLeft);
    setScrollLeft(el.scrollLeft);
  };

  const onMove = (clientX) => {
    if (!isDragging) return;
    const el = scrollRef.current;
    const x    = clientX - el.offsetLeft;
    const walk = (x - startX) * 1.5;
    el.scrollLeft = scrollLeft - walk;
  };

  const onEnd = () => setIsDragging(false);

  const openOnTab = (query, tab) => {
    if (onOpenSearch)  { onOpenSearch(query, tab);  return; }
    if (onSeedSearch)  { onSeedSearch(query);        return; }
  };

  // CLINICAL_AI_CONTEXTS is now imported

  const handleGoalClick = (goal) => {
    if (isDragging) return;
    if (goal.isIntro) {
      const richPrompt = CLINICAL_AI_CONTEXTS['intro'];
      const cleanLabel = "I am ready to embark on a wonderful journey to improve my health!";
      if (onOpenAI) {
        onOpenAI(richPrompt, cleanLabel);
      } else {
        window.dispatchEvent(
          new CustomEvent('open-clinical-ai', {
            detail: { query: richPrompt, autoSend: true, displayText: cleanLabel },
          })
        );
      }
      return;
    }

    window.dispatchEvent(
      new CustomEvent('open-research-drawer', {
        detail: { mode: 'goal-detail', goalId: goal.id, goal }
      })
    );
  };



  // ── Global drag tracking ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isDragging) return;
    const handleGlobalMove = (e) => {
      const clientX = e.type.includes('touch') ? e.touches[0].pageX : e.pageX;
      onMove(clientX);
    };
    const handleGlobalEnd = () => onEnd();
    window.addEventListener('mousemove', handleGlobalMove);
    window.addEventListener('mouseup',   handleGlobalEnd);
    window.addEventListener('touchmove', handleGlobalMove);
    window.addEventListener('touchend',  handleGlobalEnd);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('mouseup',   handleGlobalEnd);
      window.removeEventListener('touchmove', handleGlobalMove);
      window.removeEventListener('touchend',  handleGlobalEnd);
    };
  }, [isDragging, startX, scrollLeft]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <section className="gls-container">
      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <div className="gls-header">
        <div className="gls-date-badge">Updated: May 2026</div>

        {/* Phase 1 — new title */}
        <h2 className="gls-title">8 Optimization Paths by Lifestyle Goal</h2>

        {/* Phase 5 — improved subtitle */}
        <p className="gls-subtitle">
          Explore curated peptides, supplements and intelligent protocols tailored to specific biological goals.
        </p>

        {/* Progress indicator — minimal text counter */}
        <div className="gls-progress-counter">
          <button className="gls-prog-arrow" onClick={() => scrollManual('left')} aria-label="Previous">
            ‹
          </button>
          <span className="gls-prog-text">
            <span className="gls-prog-current">{String(activeIdx + 1).padStart(2, '0')}</span>
            <span className="gls-prog-sep"> of </span>
            <span className="gls-prog-total">{String(TOTAL).padStart(2, '0')}</span>
          </span>
          <button className="gls-prog-arrow" onClick={() => scrollManual('right')} aria-label="Next">
            ›
          </button>
        </div>

        {/* First-visit hint */}
        {showHint && (
          <p className="gls-scroll-hint">Swipe or drag to explore all paths →</p>
        )}
      </div>

      {/* ── CAROUSEL VIEWPORT ────────────────────────────────────────────── */}
      <div className="gls-viewport-wrap">
        {/* Navigation Arrows */}
        <button
          className="gls-nav-btn gls-nav-left"
          onClick={() => scrollManual('left')}
          aria-label="Previous path"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          className="gls-nav-btn gls-nav-right"
          onClick={() => scrollManual('right')}
          aria-label="Next path"
        >
          <ChevronRight size={24} />
        </button>

        {/* Phase 4 — enhanced side fade edges */}
        <div className="gls-fade gls-fade-left" />
        <div className="gls-fade gls-fade-right" />

        <div
          className={`gls-strip ${isDragging ? 'dragging' : ''}`}
          ref={scrollRef}
          onMouseDown={(e) => onStart(e.pageX)}
          onTouchStart={(e) => onStart(e.touches[0].pageX)}
        >
          <div className="gls-inner">
            {ITEMS.map((goal, idx) => {
              if (goal.isIntro) {
                return (
                  <div
                    key="intro-card"
                    className={`gls-card gls-intro-card-new ${idx === activeIdx ? 'gls-card--active' : ''}`}
                    onClick={() => handleGoalClick(goal)}
                    onMouseEnter={() => setActiveIdx(idx)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Top visual block: scenic pathway image acting as a photo */}
                    <div className="gls-image-container">
                      <img 
                        src="/assets/goals/journey_intro.png" 
                        alt="Your Clinical Journey" 
                        className="gls-image" 
                        loading="lazy" 
                        style={{ objectPosition: 'center center' }} 
                      />

                      <div className="gls-overlay">
                        <span className="gls-badge">Begin Journey</span>
                      </div>
                    </div>

                    {/* Bottom info block: matches gls-info perfectly */}
                    <div className="gls-info">
                      <h3 className="gls-label">{goal.label}</h3>
                      <p className="gls-desc">{goal.desc}</p>
                      <div className="gls-card-footer">
                        <span className="gls-footer-cta">Explore Paths</span>
                        <span className="gls-footer-arrow">↓</span>
                      </div>
                    </div>
                  </div>
                );
              }
              return (
                <div
                  key={`${goal.id}-${idx}`}
                  className={`gls-card ${idx === activeIdx ? 'gls-card--active' : ''}`}
                  onClick={() => handleGoalClick(goal)}
                  onMouseEnter={() => setActiveIdx(idx)}
                >
                  {/* Image area */}
                  <div className="gls-image-container">
                    <img src={goal.img} alt={goal.label} className="gls-image" loading="lazy" style={{ objectPosition: goal.imgPos || 'center center' }} />

                    {/* Phase 2 + 7 — clickable position badge → mini navigator */}
                    <button
                      className="gls-position-badge"
                      aria-label={`Path ${idx + 1} of ${TOTAL} — click to navigate`}
                      onClick={(e) => openNavigator(e, idx)}
                      title="Open path navigator"
                    >
                      {String(idx + 1).padStart(2, '0')} / {String(TOTAL).padStart(2, '0')}
                    </button>

                    {/* "Start Here" badge — only on first photographic card */}
                    {idx === (isMobile ? 1 : 0) && (
                      <div className="gls-start-here">
                        <span className="gls-start-here-dot" />
                        Start Here
                      </div>
                    )}

                    <div className="gls-overlay">
                      <span className="gls-badge">Explore</span>
                    </div>
                  </div>

                  {/* Card info */}
                  <div className="gls-info">
                    <h3 className="gls-label">{goal.label}</h3>
                    <p className="gls-desc">{goal.desc}</p>

                    <div className="gls-card-footer">
                      <span className="gls-footer-cta">Explore Research</span>
                      <span className="gls-footer-arrow">→</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>


      {/* ── Phase 7: Mini Pathway Navigator ──────────────────────────────── */}
      {navOpen && (
        <div
          ref={navRef}
          className="gls-mini-nav"
          style={{ top: navAnchor.top, left: navAnchor.left }}
          role="dialog"
          aria-label="Optimization path navigator"
        >
          <div className="gls-mini-nav-header">
            <span className="gls-mini-nav-title">OPTIMIZATION PATH NAVIGATOR</span>
            <button className="gls-mini-nav-close" onClick={() => setNavOpen(false)} aria-label="Close">
              <X size={13} />
            </button>
          </div>
          {ITEMS.map((g, i) => (
            <button
              key={g.id}
              className={`gls-mini-nav-row ${i === activeIdx ? 'gls-mini-nav-row--active' : ''}`}
              onClick={() => jumpToPathway(i)}
            >
              <span className="gls-mini-nav-num">{String(i + 1).padStart(2, '0')}</span>
              {g.isIntro ? (
                <div className="gls-mini-nav-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 209, 255, 0.1)', border: '1px solid rgba(0, 209, 255, 0.2)' }}>
                  <Microscope size={14} style={{ color: '#00D1FF' }} />
                </div>
              ) : (
                <img src={g.img} alt="" className="gls-mini-nav-thumb" loading="lazy" decoding="async" />
              )}
              <span className="gls-mini-nav-label">{g.label}</span>
              {i === activeIdx && <span className="gls-mini-nav-current">●</span>}
            </button>
          ))}
        </div>
      )}

      <style>{`
        /* ── Container ───────────────────────────────────────────────── */
        .gls-container {
          padding: 0;
          background: transparent;
          overflow: hidden;
          position: relative;
        }

        /* ── Header ──────────────────────────────────────────────────── */
        .gls-header {
          max-width: 1200px;
          margin: 0 auto 2.5rem;
          padding: 0 1.5rem;
          text-align: center;
        }

        .gls-date-badge {
          display: inline-block;
          padding: 0.4rem 1rem;
          background: var(--accent-soft);
          color: var(--secondary);
          border-radius: 100px;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 1rem;
          border: 1px solid var(--accent-medium);
        }

        .gls-title {
          font-size: 2.25rem;
          font-weight: 950;
          color: var(--primary);
          margin-bottom: 0.5rem;
          letter-spacing: -0.02em;
        }

        .gls-subtitle {
          color: var(--text-muted);
          font-size: 1rem;
          font-weight: 600;
          max-width: 600px;
          margin: 0 auto 1.5rem;
        }

        @media (max-width: 768px) {
          .gls-title { font-size: 1.75rem; }
          .gls-subtitle { font-size: 0.9rem; margin-bottom: 1rem; }
        }

        /* ── Progress counter (replaces dots) ────────────────────────── */
        .gls-progress-counter {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .gls-prog-arrow {
          background: none;
          border: 1px solid var(--accent-medium, rgba(0,150,204,0.25));
          color: var(--text-muted);
          width: 28px;
          height: 28px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.1rem;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.18s;
        }
        .gls-prog-arrow:hover {
          border-color: var(--secondary, #0096CC);
          color: var(--secondary, #0096CC);
        }

        .gls-prog-text {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          font-variant-numeric: tabular-nums;
        }
        .gls-prog-current {
          color: var(--secondary, #0096CC);
          font-size: 0.95rem;
          font-weight: 900;
        }
        .gls-prog-sep {
          color: var(--text-muted);
          opacity: 0.5;
          font-size: 0.7rem;
        }
        .gls-prog-total {
          color: var(--text-muted);
          opacity: 0.6;
        }

        /* ── Scroll hint ──────────────────────────────────────────────── */
        .gls-scroll-hint {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-muted);
          letter-spacing: 0.04em;
          opacity: 0.6;
          margin: 0;
          animation: gls-hint-pulse 2.2s ease-in-out infinite;
        }

        @keyframes gls-hint-pulse {
          0%, 100% { opacity: 0.35; }
          50%       { opacity: 0.7; }
        }

        /* ── Viewport & nav ──────────────────────────────────────────── */
        .gls-viewport-wrap {
          position: relative;
          width: 100%;
        }

        /* ── Strip, Inner & Cards (Desktop Carousel Scroll) ──────────── */
        .gls-strip {
          display: flex;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none; /* Hide scrollbar for Firefox */
          -ms-overflow-style: none;  /* Hide scrollbar for IE/Edge */
          padding: 1.5rem 0;
          cursor: grab;
        }

        .gls-strip::-webkit-scrollbar {
          display: none; /* Hide scrollbar for Chrome/Safari */
        }

        .gls-strip.dragging {
          cursor: grabbing;
          scroll-snap-type: none;
          scroll-behavior: auto;
        }

        .gls-inner {
          display: flex;
          gap: 1.75rem;
          padding: 0 max(1.5rem, calc((100vw - 1200px) / 2));
          width: max-content;
        }

        .gls-card {
          flex: 0 0 280px;
          width: 280px;
          scroll-snap-align: start;
          background: var(--surface);
          border-radius: 8px;
          border: 1px solid var(--border-light);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
          overflow: hidden;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .gls-card--active {
          border-color: rgba(0,150,204,0.45);
          box-shadow: 0 0 0 1px rgba(0,150,204,0.2),
                      0 8px 32px rgba(0,150,204,0.15);
        }

        .gls-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }

        .gls-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(0,0,0,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
          cursor: pointer;
          z-index: 20;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(8px);
        }

        .gls-nav-btn:hover {
          background: white;
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          color: var(--secondary);
        }

        .gls-nav-left  { left: 1.5rem; }
        .gls-nav-right { right: 1.5rem; }

        /* ── Phase 4: Enhanced fade edges ────────────────────────────── */
        .gls-fade {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 100px;
          z-index: 10;
          pointer-events: none;
          transition: opacity 0.3s;
        }

        .gls-fade-left  { left: 0; background: linear-gradient(to right, var(--background) 0%, transparent 100%); }
        .gls-fade-right { right: 0; background: linear-gradient(to left, var(--background) 0%, transparent 100%); }

        /* ── Image area ──────────────────────────────────────────────── */
        .gls-image-container {
          height: 270px; /* Increased from 200px to make images taller and perfectly clear */
          position: relative;
          overflow: hidden;
        }

        .gls-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .gls-card:hover .gls-image { transform: scale(1.1); }

        /* ── Intro Card Styles (gls-intro-card-new) ──────────────────── */
        .gls-intro-card-new {
          background: var(--surface);
          border-radius: 8px;
          border: 1px solid rgba(0, 209, 255, 0.12);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04), 0 0 0px rgba(0, 209, 255, 0);
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .gls-intro-card-new:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 209, 255, 0.12), 0 0 20px 2px rgba(0, 209, 255, 0.25);
          border-color: rgba(0, 209, 255, 0.45);
        }

        .gls-intro-graphic-header {
          height: 270px;
          background: linear-gradient(135deg, #001f3f 0%, #003b5c 50%, #005670 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .gls-intro-graphic-header {
            height: 140px;
          }
        }

        .gls-intro-icon-backdrop {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(0, 209, 255, 0.12);
          border: 1px solid rgba(0, 209, 255, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #00D1FF;
          box-shadow: 0 0 20px rgba(0, 209, 255, 0.2);
          animation: gls-pulse-glow 2.5s infinite ease-in-out;
        }

        @media (max-width: 768px) {
          .gls-intro-icon-backdrop {
            width: 44px;
            height: 44px;
          }
        }

        .gls-intro-icon-pulsing {
          color: #00D1FF;
          animation: gls-icon-pulse 2.5s infinite ease-in-out;
        }

        @keyframes gls-icon-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        @keyframes gls-pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0, 209, 255, 0.15); }
          50% { box-shadow: 0 0 12px 3px rgba(0, 209, 255, 0.35); }
        }

        .gls-intro-graphic-overlay {
          position: absolute;
          bottom: 1rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 5;
        }

        .gls-intro-start-badge {
          font-size: 0.62rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #00D1FF;
          background: rgba(0, 209, 255, 0.12);
          padding: 0.3rem 0.7rem;
          border-radius: 6px;
          border: 1px solid rgba(0, 209, 255, 0.25);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }

        /* ── "Start Here" badge ───────────────────────────────────────── */
        .gls-start-here {
          position: absolute;
          top: 0.65rem;
          left: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(0,54,102,0.85);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          color: #fff;
          font-size: 0.55rem;
          font-weight: 900;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 0.28rem 0.6rem;
          border-radius: 6px;
          z-index: 5;
          border: 1px solid rgba(0,150,204,0.3);
          animation: gls-start-pulse 2.8s ease-in-out infinite;
        }
        .gls-start-here-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #78dcff;
          animation: gls-dot-ping 2.8s ease-in-out infinite;
        }
        @keyframes gls-start-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0,150,204,0); }
          50%       { box-shadow: 0 0 0 5px rgba(0,150,204,0.22); }
        }
        @keyframes gls-dot-ping {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(1.4); }
        }

        /* ── Phase 2 + 7: Clickable position badge ─────────────────── */
        .gls-position-badge {
          position: absolute;
          top: 0.65rem;
          right: 0.75rem;
          background: rgba(0, 0, 0, 0.38);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          color: rgba(255, 255, 255, 0.85);
          font-size: 0.6rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          padding: 0.28rem 0.55rem;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          z-index: 5;
          font-variant-numeric: tabular-nums;
          cursor: pointer;
          transition: background 0.18s, transform 0.18s;
        }
        .gls-position-badge:hover {
          background: rgba(0, 150, 204, 0.6);
          transform: scale(1.06);
        }

        /* ── Phase 7: Mini Navigator popup ──────────────────────────── */
        .gls-mini-nav {
          position: absolute;
          z-index: 200;
          width: 260px;
          background: rgba(15, 15, 25, 0.96);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.45);
          overflow: hidden;
          animation: gls-nav-in 0.2s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes gls-nav-in {
          from { opacity: 0; transform: scale(0.9) translateY(-6px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .gls-mini-nav-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem 0.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .gls-mini-nav-title {
          font-size: 0.55rem;
          font-weight: 900;
          letter-spacing: 0.14em;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
        }
        .gls-mini-nav-close {
          background: none;
          border: none;
          color: rgba(255,255,255,0.4);
          cursor: pointer;
          display: flex;
          padding: 2px;
          border-radius: 4px;
          transition: color 0.15s;
        }
        .gls-mini-nav-close:hover { color: rgba(255,255,255,0.9); }
        .gls-mini-nav-row {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          width: 100%;
          padding: 0.5rem 1rem;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: background 0.15s;
        }
        .gls-mini-nav-row:hover { background: rgba(255,255,255,0.06); }
        .gls-mini-nav-row--active { background: rgba(0,150,204,0.15); }
        .gls-mini-nav-num {
          font-size: 0.6rem;
          font-weight: 800;
          font-variant-numeric: tabular-nums;
          color: rgba(255,255,255,0.3);
          min-width: 20px;
          letter-spacing: 0.05em;
        }
        .gls-mini-nav-row--active .gls-mini-nav-num { color: var(--secondary, #0096CC); }
        .gls-mini-nav-thumb {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          object-fit: cover;
          opacity: 0.8;
        }
        .gls-mini-nav-label {
          flex: 1;
          font-size: 0.72rem;
          font-weight: 700;
          color: rgba(255,255,255,0.75);
          line-height: 1.3;
        }
        .gls-mini-nav-row--active .gls-mini-nav-label { color: #fff; }
        .gls-mini-nav-current {
          font-size: 0.45rem;
          color: var(--secondary, #0096CC);
        }

        /* ── Image overlay ────────────────────────────────────────────── */
        .gls-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, transparent 100%);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 1.5rem;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .gls-card:hover .gls-overlay { opacity: 1; }

        .gls-badge {
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(4px);
          color: var(--primary);
          padding: 0.4rem 1rem;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* ── Card info ───────────────────────────────────────────────── */
        .gls-info {
          padding: 1rem 1.1rem 1.1rem;
          text-align: left;
        }

        .gls-label {
          font-size: 1.05rem;
          font-weight: 900;
          color: var(--primary);
          margin-bottom: 0.2rem;
          line-height: 1.3;
        }

        .gls-desc {
          font-size: 0.82rem;
          color: var(--text-muted);
          font-weight: 600;
          margin: 0 0 0.85rem;
        }

        /* ── Card Footer ─────────────────────────────────────────────── */
        .gls-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 1rem;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(0,0,0,0.05);
        }

        .gls-footer-cta {
          font-size: 0.7rem;
          font-weight: 800;
          color: var(--secondary, #0096CC);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .gls-footer-arrow {
          color: var(--secondary, #0096CC);
          transition: transform 0.2s ease;
          font-size: 1.1rem;
          line-height: 1;
        }

        .gls-card:hover .gls-footer-arrow {
          transform: translateX(4px);
        }

        /* ── Dot navigation ──────────────────────────────────────────── */
        .gls-dots {
          display: flex;
          justify-content: center;
          gap: 0.45rem;
          margin-top: 1.5rem;
          padding: 0 1.5rem;
        }
        .gls-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          border: none;
          background: rgba(0,0,0,0.15);
          cursor: pointer;
          padding: 0;
          transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
          flex-shrink: 0;
        }
        .gls-dot:hover {
          background: rgba(0,150,204,0.45);
          transform: scale(1.3);
        }
        .gls-dot--active {
          background: var(--secondary, #0096CC);
          width: 22px;
          border-radius: 4px;
          transform: none;
        }

        /* ── Responsive ──────────────────────────────────────────────── */
        @media (max-width: 1024px) {
          .gls-nav-btn         { display: none; }
          .gls-fade            { width: 60px; }
        }

        @media (max-width: 768px) {
          .gls-title           { font-size: 1.45rem; letter-spacing: -0.02em; margin-bottom: 0.4rem; }
          .gls-subtitle        { font-size: 0.82rem; margin-bottom: 1.25rem; line-height: 1.4; }
          .gls-container       { padding: 2rem 0; }
          /* Change carousel strip into a highly-optimized 2-column grid on mobile */
          .gls-strip {
            display: block;
            overflow-x: visible;
            cursor: default !important;
          }
          .gls-inner {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.6rem;
            width: 100% !important;
            padding: 0 0.85rem 1rem;
            margin: 0;
            box-sizing: border-box;
          }
          .gls-card {
            flex: none;
            width: 100% !important;
            border-radius: 12px;
            scroll-snap-align: none;
            background: var(--surface);
            border: 1px solid rgba(0, 150, 204, 0.08);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
            grid-column: auto !important;
          }
          .gls-intro-card-new,
          .gls-card:first-child {
            grid-column: auto !important;
          }
          .gls-image-container {
            height: 140px; /* Increased from 105px for taller and beautifully clear photos on mobile */
          }

          .gls-position-badge {
            font-size: 0.48rem;
            top: 0.4rem;
            right: 0.4rem;
            padding: 0.18rem 0.4rem;
            border-radius: 4px;
          }
          .gls-start-here {
            font-size: 0.46rem;
            padding: 0.18rem 0.4rem;
            top: 0.4rem;
            left: 0.4rem;
            border-radius: 4px;
          }
          .gls-info {
            padding: 0.5rem 0.6rem 0.6rem;
          }
          .gls-label {
            font-size: 0.76rem;
            font-weight: 900;
            line-height: 1.25;
            margin-bottom: 0.15rem;
            letter-spacing: -0.01em;
          }
          .gls-desc {
            font-size: 0.6rem;
            margin-bottom: 0.25rem;
            line-height: 1.25;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            height: 2.45em; /* exact height to perfectly align footer borders */
          }
          .gls-card-footer {
            margin-top: 0.35rem;
            padding-top: 0.35rem;
            border-top: 1px solid rgba(0,0,0,0.04);
          }
          .gls-footer-cta {
            font-size: 0.55rem;
            font-weight: 800;
          }
          .gls-footer-arrow {
            font-size: 0.8rem;
          }
          /* Hide pagination, scroll hints, and fade borders when grid is active */
          .gls-progress-counter { display: none !important; }
          .gls-scroll-hint       { display: none !important; }
          .gls-fade              { display: none !important; }
          .gls-dots              { display: none !important; }
        }
      `}</style>

      {/* Drawer has been removed and integrated into ResearchDrawer */}
    </section>
  );
}