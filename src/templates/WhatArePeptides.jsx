import BookOpen from "lucide-react/dist/esm/icons/book-open";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import Zap from "lucide-react/dist/esm/icons/zap";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import Activity from "lucide-react/dist/esm/icons/activity";
import Brain from "lucide-react/dist/esm/icons/brain";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import Dna from "lucide-react/dist/esm/icons/dna";
import Microscope from "lucide-react/dist/esm/icons/microscope";
import Heart from "lucide-react/dist/esm/icons/heart";
/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';











import '../styles/what_are_peptides.css';

/* ── Data ─────────────────────────────────────────────────────── */

const NAV_SECTIONS = [
  { id: 'what',     label: 'What are peptides?' },
  { id: 'how',      label: 'How do they work?' },
  { id: 'areas',    label: 'Research areas' },
  { id: 'choose',   label: 'How to start' },
  { id: 'safety',   label: 'Safety & sourcing' },
  { id: 'faq',      label: 'Common questions' },
];

const AMINO_CHAIN = [
  { code: 'Gly', full: 'Glycine' },
  { code: 'Ser', full: 'Serine' },
  { code: 'Pro', full: 'Proline' },
  { code: 'Glu', full: 'Glutamic acid' },
  { code: 'Lys', full: 'Lysine' },
];

const SIGNAL_FLOW = [
  { icon: Dna,          color: 'blue',  label: 'Peptide binds receptor' },
  { icon: Zap,          color: 'navy',  label: 'Cell receives signal' },
  { icon: Activity,     color: 'green', label: 'Biological response' },
];

const RESEARCH_AREAS = [
  { emoji: '🧠', label: 'Cognitive Performance' },
  { emoji: '💪', label: 'Muscle & Recovery' },
  { emoji: '🛡️', label: 'Immune Modulation' },
  { emoji: '🌙', label: 'Sleep Quality' },
  { emoji: '✨', label: 'Skin & Collagen' },
  { emoji: '🔥', label: 'Metabolic Health' },
  { emoji: '❤️', label: 'Cardiovascular' },
  { emoji: '⚡', label: 'Energy & Longevity' },
];

/* ── Component ─────────────────────────────────────────────────── */

export default function WhatArePeptides() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('what');
  const sectionRefs = useRef({});

  /* ── Scroll spy ── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
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
            Understanding Peptides —<br />Made Simple
          </h1>
          <p className="wap-hero__subtitle">
            Peptides are short chains of amino acids that act as biological messengers.
            They help regulate many natural processes in the body — from tissue repair
            to hormonal balance. This guide explains what they are, how they work,
            and how to explore them safely.
          </p>
          <button
            className="wap-hero__cta"
            onClick={() => scrollTo('what')}
          >
            Start reading
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

        {/* Main content */}
        <main className="wap-content">

          {/* ── Section 1: What are peptides? ── */}
          <section id="what" className="wap-section">
            <span className="wap-section__eyebrow">
              <FlaskConical size={11} />
              The basics
            </span>
            <h2 className="wap-section__title">What exactly are peptides?</h2>
            <p className="wap-section__body">
              Amino acids are the building blocks of all proteins. When a short sequence
              of amino acids (typically 2–50) are linked together, they form a
              <strong> peptide</strong>. Unlike full proteins, peptides are small enough
              to cross biological barriers and interact directly with cell receptors.
            </p>
            <p className="wap-section__body">
              Your body already produces thousands of peptides naturally — hormones like
              insulin and oxytocin are peptides. What makes synthetic research peptides
              interesting is their potential to mimic, amplify, or modulate these
              natural processes with precision.
            </p>

            {/* Amino acid chain diagram */}
            <div className="wap-chain">
              {AMINO_CHAIN.map((aa, i) => (
                <div key={aa.code} style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="wap-chain__node">
                    <div className="wap-chain__dot">{aa.code}</div>
                    <span className="wap-chain__label">{aa.full}</span>
                  </div>
                  {i < AMINO_CHAIN.length - 1 && (
                    <div className="wap-chain__arrow" aria-hidden="true" />
                  )}
                </div>
              ))}
            </div>
            <p className="wap-section__body" style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>
              ↑ Example: 5 amino acids linked in sequence form a short peptide chain.
            </p>
          </section>

          {/* ── Section 2: How do they work? ── */}
          <section id="how" className="wap-section">
            <span className="wap-section__eyebrow">
              <Zap size={11} />
              Mechanism
            </span>
            <h2 className="wap-section__title">How do peptides work in the body?</h2>
            <p className="wap-section__body">
              Peptides act as <strong>signalling molecules</strong>. They travel through
              the bloodstream and bind to specific receptors on the surface of target
              cells — much like a key fitting a lock. Once bound, they trigger a
              biological cascade inside the cell.
            </p>
            <p className="wap-section__body">
              Different peptides target different receptors, which is why a peptide
              designed for tissue repair (like BPC-157) behaves very differently from
              one designed for growth hormone release (like CJC-1295).
            </p>

            {/* Signal flow diagram */}
            <div className="wap-flow">
              {SIGNAL_FLOW.map(({ icon: Icon, color, label }, i) => (
                <div key={label}>
                  <div className="wap-flow__step">
                    <div className={`wap-flow__icon wap-flow__icon--${color}`}>
                      <Icon size={22} />
                    </div>
                    <span className="wap-flow__text">{label}</span>
                  </div>
                  {i < SIGNAL_FLOW.length - 1 && (
                    <div className="wap-flow__connector" />
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ── Section 3: Research areas ── */}
          <section id="areas" className="wap-section">
            <span className="wap-section__eyebrow">
              <Microscope size={11} />
              Applications
            </span>
            <h2 className="wap-section__title">What areas are peptides being researched in?</h2>
            <p className="wap-section__body">
              Research peptides are being studied across a wide range of biological
              systems. These are not medical claims — they are active areas of
              investigation in peer-reviewed literature.
            </p>

            <div className="wap-areas">
              {RESEARCH_AREAS.map(({ emoji, label }) => (
                <div key={label} className="wap-area-pill">
                  <span className="wap-area-pill__icon">{emoji}</span>
                  {label}
                </div>
              ))}
            </div>
          </section>

          {/* ── Section 4: How to start ── */}
          <section id="choose" className="wap-section">
            <span className="wap-section__eyebrow">
              <Zap size={11} />
              Getting Started
            </span>
            <h2 className="wap-section__title">How to start your research</h2>
            <p className="wap-section__body">
              Entering the world of peptide research requires a structured approach. 
              It is not just about finding a sequence; it's about understanding 
              the protocol and ensuring environmental controls.
            </p>

            <div className="wap-steps">
              <div className="wap-step-card">
                <div className="wap-step-card__num">01</div>
                <h3 className="wap-step-card__title">Define Objectives</h3>
                <p className="wap-step-card__body">
                  Identify the biological pathway you wish to study. Is it recovery, 
                  cognition, or metabolic signalling?
                </p>
                <div className="wap-step-card__tag">Strategy</div>
              </div>

              <div className="wap-step-card">
                <div className="wap-step-card__num">02</div>
                <h3 className="wap-step-card__title">Study Protocols</h3>
                <p className="wap-step-card__body">
                  Review literature for established dosages, reconstitution 
                  requirements, and storage temperatures.
                </p>
                <div className="wap-step-card__tag">Documentation</div>
              </div>

              <div className="wap-step-card">
                <div className="wap-step-card__num">03</div>
                <h3 className="wap-step-card__title">Secure Supplies</h3>
                <h3 className="wap-step-card__body">
                  Ensure you have all necessary laboratory materials, including 
                  bacteriostatic water and proper storage.
                </h3>
                <div className="wap-step-card__tag">Logistics</div>
              </div>
            </div>
          </section>

          {/* ── Section 5: Safety & sourcing ── */}
          <section id="safety" className="wap-section">
            <span className="wap-section__eyebrow">
              <ShieldCheck size={11} />
              Quality Control
            </span>
            <h2 className="wap-section__title">Safety, Purity & Sourcing</h2>
            <p className="wap-section__body">
              In the research world, purity is everything. A peptide that is only 
              90% pure contains 10% unknown contaminants. We recommend only 
              sourcing materials that provide independent, third-party 
              <strong> COA (Certificate of Analysis)</strong> using HPLC and MS testing.
            </p>

            <div className="wap-docs-list">
              <div className="wap-doc-item">
                <div className="wap-doc-item__icon">
                  <Heart size={18} />
                </div>
                <div>
                  <div className="wap-doc-item__text">Purity Verification</div>
                  <div className="wap-doc-item__sub">Always look for &gt;99% purity.</div>
                </div>
              </div>
              <div className="wap-doc-item">
                <div className="wap-doc-item__icon">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div className="wap-doc-item__text">Batch Consistency</div>
                  <div className="wap-doc-item__sub">Verify testing for each new lot.</div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Section 6: FAQ ── */}
          <section id="faq" className="wap-section">
            <span className="wap-section__eyebrow">
              <ChevronDown size={11} />
              Help Center
            </span>
            <h2 className="wap-section__title">Common Questions</h2>
            <div className="wap-faq">
              <FaqItem 
                question="Are peptides legal?"
                answer="In most jurisdictions, peptides are legal to purchase and possess for laboratory research purposes. However, they are generally not approved for human consumption by agencies like the FDA. Always check your local laws."
              />
              <FaqItem 
                question="How should they be stored?"
                answer="Lyophilized (powder) peptides should be stored in a cool, dark place. Once reconstituted with bacteriostatic water, they must be refrigerated and used within a specific timeframe (usually 30-60 days)."
              />
              <FaqItem 
                question="What is reconstitution?"
                answer="Reconstitution is the process of adding a liquid (solvent), typically bacteriostatic water, to the freeze-dried peptide powder to create an injectable or usable solution."
              />
            </div>
          </section>

          {/* ── Final CTA ── */}
          <div className="wap-cta-section">
            <h2 className="wap-cta-section__title">Ready to start your research?</h2>
            <p className="wap-cta-section__sub">
              Browse our curated selection of high-purity research peptides and 
              accelerate your findings today.
            </p>
            <button 
              className="wap-cta-btn"
              onClick={() => navigate('/all-peptides')}
            >
              View Catalog
              <ArrowRight size={18} />
            </button>
          </div>

        </main>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function FaqItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`wap-faq-item${isOpen ? ' wap-faq-item--open' : ''}`}>
      <button className="wap-faq-btn" onClick={() => setIsOpen(!isOpen)}>
        {question}
        <ChevronDown className="wap-faq-chevron" />
      </button>
      <div className="wap-faq-answer">
        {answer}
      </div>
    </div>
  );
}