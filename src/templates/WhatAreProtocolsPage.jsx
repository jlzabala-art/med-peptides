/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ArrowRight,
  Layers,
  Target,
  Clock,
  FlaskConical,
  ShieldCheck,
  ChevronDown,
  Microscope,
  Zap,
  BrainCircuit,
} from 'lucide-react';
import '../styles/what_are_protocols.css';

/* Encode a context object for admin ClinicalAI deep-link */
const encodeCtx = (obj) => btoa(JSON.stringify(obj));

/* ── Navigation sections ─────────────────────────────────────── */
const NAV_SECTIONS = [
  { id: 'what',         label: 'What is a Protocol?' },
  { id: 'phases',       label: 'Why Phases?' },
  { id: 'how',          label: 'How Protocols Work' },
  { id: 'goals',        label: 'Common Goals' },
  { id: 'known',        label: 'Known Protocols' },
  { id: 'choose',       label: 'Choosing a Protocol' },
  { id: 'transparency', label: 'Transparency' },
  { id: 'faq',          label: 'FAQ' },
];

/* ── Phase nodes for Section 1 diagram ──────────────────────── */
const PHASE_NODES = [
  { label: 'Phase 1', sub: 'Initiation' },
  { label: 'Phase 2', sub: 'Escalation' },
  { label: 'Phase 3', sub: 'Maintenance' },
];

/* ── Timeline rows for Section 3 ────────────────────────────── */
const TIMELINE = [
  { weeks: 'Week 1–4',  phase: 'Initiation',   desc: 'Compounds introduced gradually at low doses.' },
  { weeks: 'Week 5–8',  phase: 'Escalation',   desc: 'Dosing adjustments or support compounds added.' },
  { weeks: 'Week 9–12', phase: 'Maintenance',  desc: 'Dosing stabilised to consolidate results.' },
];

/* ── Research goal pills for Section 4 ──────────────────────── */
const RESEARCH_GOALS = [
  { emoji: '🔥', label: 'Metabolic & Weight' },
  { emoji: '💪', label: 'Recovery & Repair' },
  { emoji: '🧠', label: 'Cognitive & Mood' },
  { emoji: '🌙', label: 'Sleep & Circadian' },
  { emoji: '♾️', label: 'Longevity & Anti-Aging' },
  { emoji: '⚖️', label: 'Hormonal Optimization' },
  { emoji: '🛡️', label: 'Immune Support' },
];

/* ── Known protocol examples for Section 5 ──────────────────── */
const KNOWN_PROTOCOLS = [
  {
    emoji: '🔥',
    title: 'Tirzepatide + MOTS-c Protocol',
    desc: 'Used in metabolic research and energy regulation studies. Targets insulin sensitivity and mitochondrial activity.',
    aiContext: {
      filter: 'Tirzepatide + MOTS-c',
      label: 'Tirzepatide + MOTS-c Protocol',
      icon: '🔥',
      count: null,
      note: 'Viewing ClinicalAI metrics for the Metabolic & Energy Regulation protocol — Tirzepatide + MOTS-c compound stack.',
    },
  },
  {
    emoji: '💪',
    title: 'BPC-157 + TB-500 Protocol',
    desc: 'Often referenced in tissue recovery research. Supports connective tissue signalling and cellular repair pathways.',
    aiContext: {
      filter: 'BPC-157 + TB-500',
      label: 'BPC-157 + TB-500 Protocol',
      icon: '💪',
      count: null,
      note: 'Viewing ClinicalAI metrics for the Tissue Recovery protocol — BPC-157 + TB-500 compound stack.',
    },
  },
  {
    emoji: '♾️',
    title: 'GHK-Cu Based Protocol',
    desc: 'Used in regenerative and cellular signalling studies. Associated with collagen synthesis and longevity markers.',
    aiContext: {
      filter: 'GHK-Cu',
      label: 'GHK-Cu Based Protocol',
      icon: '♾️',
      count: null,
      note: 'Viewing ClinicalAI metrics for the Regenerative & Longevity protocol — GHK-Cu compound stack.',
    },
  },
];

/* ── Step-by-step choose cards for Section 6 ────────────────── */
const CHOOSE_STEPS = [
  {
    num: '01',
    title: 'Define Research Goal',
    body: 'Identify the biological pathway you want to study.',
    tag: 'Strategy',
    examples: ['Metabolic & Weight', 'Recovery & Repair', 'Cognitive & Mood', 'Longevity & Anti-Aging'],
    aiContext: {
      filter: 'research-goals',
      label: 'Define Research Goal',
      icon: '🎯',
      count: null,
      note: 'ClinicalAI — browsing AI activity related to research goal definition and protocol selection.',
    },
  },
  {
    num: '02',
    title: 'Review Protocol Phases',
    body: 'Understand the structure before committing to a program.',
    tag: 'Documentation',
    examples: ['Duration', 'Number of phases', 'Compounds used'],
    aiContext: {
      filter: 'protocol-phases',
      label: 'Review Protocol Phases',
      icon: '🧬',
      count: null,
      note: 'ClinicalAI — browsing AI activity related to protocol phase structure and progression logic.',
    },
  },
  {
    num: '03',
    title: 'Review Documentation',
    body: 'Verify all materials are available before starting.',
    tag: 'Verification',
    examples: ['Protocol structure', 'Compound profiles', 'Supporting materials'],
    aiContext: {
      filter: 'protocol-docs',
      label: 'Review Documentation',
      icon: '📋',
      count: null,
      note: 'ClinicalAI — browsing AI activity related to protocol documentation and verification steps.',
    },
  },
];

/* ── Transparency items for Section 7 ───────────────────────── */
const TRANSPARENCY_ITEMS = [
  { icon: FlaskConical, text: 'Defined compounds',    sub: 'Each compound is listed with its compound profile.' },
  { icon: Clock,        text: 'Phase schedules',      sub: 'Week-by-week structure for each protocol.' },
  { icon: Target,       text: 'Dosing timelines',     sub: 'Clear titration and maintenance windows.' },
  { icon: ShieldCheck,  text: 'Supporting materials', sub: 'COA documentation and sourcing information.' },
];

/* ── FAQ items for Section 8 ─────────────────────────────────── */
const FAQ_ITEMS = [
  {
    q: 'What is a peptide protocol?',
    a: 'A peptide protocol is a structured plan that combines one or more compounds over a defined period of time, divided into phases to guide progression safely and effectively.',
  },
  {
    q: 'Why are protocols divided into phases?',
    a: 'Phases allow for controlled progression — starting with lower doses to assess response, then adjusting or escalating, and finally stabilising at maintenance levels.',
  },
  {
    q: 'How long does a protocol last?',
    a: 'Most research protocols span 8–12 weeks, though duration varies depending on the compounds used and the research objective.',
  },
  {
    q: 'Can protocols vary in strength?',
    a: 'Yes. Protocols are designed with different intensities. Some are entry-level with a single compound; others combine multiple compounds across longer timeframes.',
  },
  {
    q: 'How do I choose the right protocol?',
    a: 'Start by defining your research goal (e.g., metabolic support, recovery, longevity), then review the protocol phase structure and documentation before proceeding.',
  },
];

/* ════════════════════════════════════════════════════════════════
   Component
   ════════════════════════════════════════════════════════════════ */
export default function WhatAreProtocolsPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('what');

  /* Scroll spy */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-30% 0px -60% 0px' }
    );
    NAV_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="wap-page">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="wap-hero">
        <div className="wap-hero__inner">
          <span className="wap-hero__eyebrow">
            <BookOpen size={12} />
            Beginner's Guide
          </span>
          <h1 className="wap-hero__title">
            Understanding Peptide Protocols —<br />Made Simple
          </h1>
          <p className="wap-hero__subtitle">
            Peptide protocols are structured sequences of compounds used over time
            to support specific biological goals. Instead of using individual
            compounds randomly, protocols organise usage into clear phases that
            guide progression. This guide explains what protocols are, how they
            work, and how to select the right one for your research.
          </p>
          <button
            className="wap-hero__cta"
            onClick={() => navigate('/protocols')}
          >
            Explore Clinical Protocols
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ── Body: sidebar + content ───────────────────────────── */}
      <div className="wap-layout">

        {/* Sticky sidebar (desktop only) */}
        <aside className="wap-sidebar">
          <p className="wap-sidebar__label">On this page</p>
          <ul className="wap-nav-list">
            {NAV_SECTIONS.map(({ id, label }) => (
              <li key={id}>
                <button
                  className={`wap-nav-link${activeSection === id ? ' active' : ''}`}
                  onClick={() => scrollTo(id)}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="wap-content">

          {/* ── Section 1: What is a Protocol? ── */}
          <section id="what" className="wap-section">
            <span className="wap-section__eyebrow">
              <Layers size={11} />
              The basics
            </span>
            <h2 className="wap-section__title">What is a peptide protocol?</h2>
            <p className="wap-section__body">
              A <strong>peptide protocol</strong> is a structured plan that combines one or more
              compounds over a defined period of time. Rather than using individual compounds
              randomly, a protocol organises them into clear phases — each with a specific purpose
              and progression logic.
            </p>
            <p className="wap-section__body">
              Think of it as a research roadmap: it tells you which compounds to use, in what
              order, at what dose, and for how long. This structure is what makes protocols more
              reliable and reproducible than ad-hoc compound use.
            </p>

            {/* Phase flow diagram */}
            <div className="warp-phases">
              {PHASE_NODES.map((node, i) => (
                <div key={node.label} style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="warp-phase-node">
                    <div className="warp-phase-dot">{node.label}</div>
                    <span className="warp-phase-label">{node.sub}</span>
                  </div>
                  {i < PHASE_NODES.length - 1 && (
                    <div className="warp-phase-arrow" aria-hidden="true" />
                  )}
                </div>
              ))}
            </div>
            <p className="wap-section__body" style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>
              ↑ A typical protocol progresses through three distinct phases.
            </p>
          </section>

          {/* ── Section 2: Why Phases? ── */}
          <section id="phases" className="wap-section">
            <span className="wap-section__eyebrow">
              <Clock size={11} />
              Progression
            </span>
            <h2 className="wap-section__title">Why do protocols use phases?</h2>
            <p className="wap-section__body">
              Phases exist to allow <strong>controlled progression</strong>. Introducing compounds
              gradually — rather than all at once — gives researchers the ability to observe
              responses at each stage before proceeding.
            </p>

            <div className="wap-steps">
              {[
                { num: '01', title: 'Initiation', tag: 'Phase 1', body: 'Introduces compounds gradually at conservative doses to assess initial biological response.' },
                { num: '02', title: 'Escalation', tag: 'Phase 2', body: 'Adjusts dosing upward or adds supporting compounds based on observed responses.' },
                { num: '03', title: 'Maintenance', tag: 'Phase 3', body: 'Stabilises dosing to consolidate results and sustain the desired biological state.' },
              ].map((s) => (
                <div key={s.num} className="wap-step-card">
                  <div className="wap-step-card__num">{s.num}</div>
                  <h3 className="wap-step-card__title">{s.title}</h3>
                  <p className="wap-step-card__body">{s.body}</p>
                  <div className="wap-step-card__tag">{s.tag}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Section 3: How Protocols Work (Timeline) ── */}
          <section id="how" className="wap-section">
            <span className="wap-section__eyebrow">
              <Zap size={11} />
              Structure
            </span>
            <h2 className="wap-section__title">How protocols work — week by week</h2>
            <p className="wap-section__body">
              Most research protocols follow a 8–12 week timeline broken into the three phases
              described above. Each week range has a defined role in the overall progression.
            </p>

            <div className="warp-timeline">
              {TIMELINE.map((row) => (
                <div key={row.weeks} className="warp-timeline-row">
                  <div className="warp-tl-weeks">{row.weeks}</div>
                  <div className="warp-tl-card">
                    <div className="warp-tl-card__phase">{row.phase}</div>
                    <div className="warp-tl-card__desc">{row.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Section 4: Common Research Goals ── */}
          <section id="goals" className="wap-section">
            <span className="wap-section__eyebrow">
              <Target size={11} />
              Applications
            </span>
            <h2 className="wap-section__title">Common research goals</h2>
            <p className="wap-section__body">
              Protocols are categorised by their primary research objective. These areas reflect
              active fields of investigation — not medical claims.
            </p>
            <div className="wap-areas">
              {RESEARCH_GOALS.map(({ emoji, label }) => (
                <div key={label} className="wap-area-pill">
                  <span className="wap-area-pill__icon">{emoji}</span>
                  {label}
                </div>
              ))}
            </div>
          </section>

          {/* ── Section 5: Known Protocol Types ── */}
          <section id="known" className="wap-section">
            <span className="wap-section__eyebrow">
              <Microscope size={11} />
              Examples
            </span>
            <h2 className="wap-section__title">Most known protocol types</h2>
            <p className="wap-section__body">
              The following examples are drawn from the current catalog. Each combines
              multiple compounds in a structured phase schedule.
            </p>
            <div className="warp-protocol-cards">
              {KNOWN_PROTOCOLS.map((p) => (
                <div
                  key={p.title}
                  className="warp-protocol-card"
                  style={{ cursor: 'pointer', transition: 'transform 0.18s, box-shadow 0.18s' }}
                  onClick={() => navigate(`/admin?t=clinical-ai&ctx=${encodeCtx(p.aiContext)}`)}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'scale(1.025)';
                    e.currentTarget.style.boxShadow = '0 8px 28px rgba(139,92,246,0.22)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  <div className="warp-protocol-card__emoji">{p.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div className="warp-protocol-card__title">{p.title}</div>
                    <div className="warp-protocol-card__desc">{p.desc}</div>
                  </div>
                  <div style={{
                    marginLeft: 'auto',
                    paddingLeft: '12px',
                    color: '#a78bfa',
                    opacity: 0.55,
                    flexShrink: 0,
                  }}>
                    <BrainCircuit size={14} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Section 6: How to Choose ── */}
          <section id="choose" className="wap-section">
            <span className="wap-section__eyebrow">
              <Zap size={11} />
              Getting Started
            </span>
            <h2 className="wap-section__title">How to choose your first protocol</h2>
            <p className="wap-section__body">
              Selecting the right protocol starts with clarity about what you want to study.
              Follow these three steps before beginning any research program.
            </p>
            <div className="wap-steps">
              {CHOOSE_STEPS.map((s) => (
                <div key={s.num} className="wap-step-card" style={{ position: 'relative' }}>
                  {/* Subtle AI icon — top-right corner */}
                  <button
                    title="Ver en ClinicalAI"
                    onClick={() => navigate(`/admin?t=clinical-ai&ctx=${encodeCtx(s.aiContext)}`)}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#a78bfa',
                      opacity: 0.5,
                      padding: 0,
                      lineHeight: 1,
                      transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
                  >
                    <BrainCircuit size={14} />
                  </button>
                  <div className="wap-step-card__num">{s.num}</div>
                  <h3 className="wap-step-card__title">{s.title}</h3>
                  <p className="wap-step-card__body">{s.body}</p>
                  {s.examples && (
                    <ul className="wap-step-card__examples">
                      {s.examples.map((ex) => <li key={ex}>{ex}</li>)}
                    </ul>
                  )}
                  <div className="wap-step-card__tag">{s.tag}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Section 7: Protocol Transparency ── */}
          <section id="transparency" className="wap-section">
            <span className="wap-section__eyebrow">
              <ShieldCheck size={11} />
              Documentation
            </span>
            <h2 className="wap-section__title">Protocol transparency</h2>
            <p className="wap-section__body">
              Every protocol in this catalog is structured around four pillars of transparency.
              Consistency and traceability are the foundation of reliable research.
            </p>
            <div className="wap-docs-list">
              {TRANSPARENCY_ITEMS.map(({ icon: Icon, text, sub }) => (
                <div key={text} className="wap-doc-item">
                  <div className="wap-doc-item__icon">
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="wap-doc-item__text">{text}</div>
                    <div className="wap-doc-item__sub">{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Section 8: FAQ ── */}
          <section id="faq" className="wap-section">
            <span className="wap-section__eyebrow">
              <ChevronDown size={11} />
              Help Center
            </span>
            <h2 className="wap-section__title">Beginner questions</h2>
            <div className="wap-faq">
              {FAQ_ITEMS.map((item) => (
                <FaqItem key={item.q} question={item.q} answer={item.a} />
              ))}
            </div>
          </section>

          {/* ── Final CTA ── */}
          <div className="wap-cta-section">
            <h2 className="wap-cta-section__title">Ready to Explore Protocols?</h2>
            <p className="wap-cta-section__sub">
              Browse structured research protocols built from peer-reviewed compound combinations.
            </p>
            <div className="warp-cta-buttons">
              <button
                className="wap-cta-btn"
                onClick={() => navigate('/protocols')}
              >
                Browse Clinical Protocols
                <ArrowRight size={18} />
              </button>
              <button
                className="wap-cta-btn--outline"
                onClick={() => navigate('/protocols?level=beginner')}
              >
                Browse Beginner Protocols
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

        </main>

      </div>
    </div>
  );
}

/* ── Sub-component: FAQ accordion ────────────────────────────── */
function FaqItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`wap-faq-item${isOpen ? ' wap-faq-item--open' : ''}`}>
      <button className="wap-faq-btn" onClick={() => setIsOpen(!isOpen)}>
        {question}
        <ChevronDown className="wap-faq-chevron" />
      </button>
      <div className="wap-faq-answer">{answer}</div>
    </div>
  );
}
