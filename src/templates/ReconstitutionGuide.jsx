/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  ArrowRight,
  ChevronDown,
  Droplets,
  Syringe,
  Snowflake,
  Calculator,
} from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';
import '../styles/reconstitution_guide.css';

/* ── Data ─────────────────────────────────────────────────────── */

const NAV_SECTIONS = [
  { id: 'what',       label: 'What is reconstitution?' },
  { id: 'materials',  label: 'What you need' },
  { id: 'steps',      label: 'Step-by-step' },
  { id: 'calculator', label: 'Use the calculator' },
  { id: 'storage',    label: 'Storage' },
  { id: 'faq',        label: 'FAQ' },
];

const MATERIALS = [
  { emoji: '🧪', name: 'Peptide vial' },
  { emoji: '💧', name: 'Diluent' },
  { emoji: '💉', name: 'Syringe' },
  { emoji: '🧴', name: 'Alcohol swab' },
];

const STEPS = [
  { text: 'Clean the vial top with an alcohol swab.' },
  { text: 'Draw the correct volume of diluent into the syringe.' },
  { text: 'Inject slowly into the side of the vial.' },
  { text: 'Let it dissolve — do not shake.' },
];

const STORAGE = [
  { icon: '❄️', text: 'Keep refrigerated after reconstitution' },
  { icon: '🧼', text: 'Keep the vial and syringe clean' },
  { icon: '🌡️', text: 'Avoid heat or direct sunlight' },
];

const FAQS = [
  {
    q: 'Can I shake the vial?',
    a: 'No. Shaking can damage the peptide structure. Gently swirl or let it sit until the powder dissolves on its own.',
  },
  {
    q: 'How much liquid should I add?',
    a: 'It depends on your peptide amount and desired concentration. Use the calculator to get the exact volume for your dose.',
  },
  {
    q: 'How long does a reconstituted peptide last?',
    a: 'This varies by peptide. As a general guide, keep refrigerated and use within 30–60 days. Check the product details for specifics.',
  },
];

/* ── Component ─────────────────────────────────────────────────── */

export default function ReconstitutionGuide() {
  usePageMeta({
    title: 'Peptide Reconstitution Guide — Made Simple',
    description:
      'Learn how to reconstitute peptides step by step. Covers materials, preparation, storage, and links to the precision calculator.',
    path: '/reconstitution-guide',
  });

  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('what');
  const sectionRefs = useRef({});

  /* Scroll to top on mount */
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);

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
    <div className="rg-page">

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="rg-hero">
        <div className="rg-hero__inner">
          <span className="rg-hero__eyebrow">
            <FlaskConical size={12} />
            Preparation Guide
          </span>
          <h1 className="rg-hero__title">
            Peptide Reconstitution —<br />Made Simple
          </h1>
          <p className="rg-hero__subtitle">
            Learn how to prepare peptides using the correct volume — and use the
            calculator to remove any guesswork.
          </p>
          <button
            className="rg-hero__cta"
            onClick={() => navigate('/calculator')}
          >
            Use Calculator
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ── Body ────────────────────────────────────────────── */}
      <div className="rg-layout">

        {/* Sticky sidebar (desktop only) */}
        <aside className="rg-sidebar">
          <p className="rg-sidebar__label">On this page</p>
          <ul className="rg-nav-list">
            {NAV_SECTIONS.map(({ id, label }) => (
              <li key={id}>
                <button
                  className={`rg-nav-link${activeSection === id ? ' active' : ''}`}
                  onClick={() => scrollTo(id)}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main content */}
        <main className="rg-content">

          {/* ── 1. What is reconstitution ── */}
          <section id="what" className="rg-section">
            <span className="rg-section__eyebrow">
              <FlaskConical size={11} />
              The basics
            </span>
            <h2 className="rg-section__title">What is reconstitution?</h2>
            <p className="rg-section__body">
              Peptides arrive as a dry powder — freeze-dried to preserve their
              structure during shipping and storage.
            </p>
            <p className="rg-section__body" style={{ marginTop: '0.75rem' }}>
              Reconstitution means adding a liquid (diluent) to that powder to
              create a ready-to-use solution. The most common diluent for
              multi-dose research vials is <strong>bacteriostatic water</strong>.
            </p>
          </section>

          {/* ── 2. Materials ── */}
          <section id="materials" className="rg-section">
            <span className="rg-section__eyebrow">
              <Droplets size={11} />
              Checklist
            </span>
            <h2 className="rg-section__title">What you need</h2>
            <p className="rg-section__body">
              Gather everything before you start to keep the process clean and
              controlled.
            </p>

            <div className="rg-materials">
              {MATERIALS.map(({ emoji, name }) => (
                <div key={name} className="rg-material-card">
                  <span className="rg-material-card__emoji">{emoji}</span>
                  <span className="rg-material-card__name">{name}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── 3. Steps ── */}
          <section id="steps" className="rg-section">
            <span className="rg-section__eyebrow">
              <Syringe size={11} />
              Preparation
            </span>
            <h2 className="rg-section__title">Step-by-step</h2>
            <p className="rg-section__body">
              Follow these steps in order for a safe, clean reconstitution.
            </p>

            <div className="rg-steps">
              {STEPS.map(({ text }, i) => (
                <div key={i} className="rg-step">
                  <div className="rg-step__num">{i + 1}</div>
                  <span className="rg-step__text">{text}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── 4. Calculator ── */}
          <section id="calculator" className="rg-section">
            <span className="rg-section__eyebrow">
              <Calculator size={11} />
              Precision tool
            </span>
            <h2 className="rg-section__title">Use the Calculator</h2>
            <p className="rg-section__body">
              The right volume depends on your peptide amount and desired dose.
              Manual math leads to errors — the calculator does it instantly.
            </p>

            <div className="rg-calc-block">
              <div className="rg-calc-block__text">
                <div className="rg-calc-block__title">Reconstitution Calculator</div>
                <div className="rg-calc-block__sub">
                  Enter your vial size, water volume, and dose to get the exact
                  number of units to draw.
                </div>
              </div>
              <button
                className="rg-calc-block__btn"
                onClick={() => navigate('/calculator')}
              >
                Open Calculator
                <ArrowRight size={15} />
              </button>
            </div>
          </section>

          {/* ── 5. Storage ── */}
          <section id="storage" className="rg-section">
            <span className="rg-section__eyebrow">
              <Snowflake size={11} />
              After reconstitution
            </span>
            <h2 className="rg-section__title">Storage</h2>
            <p className="rg-section__body">
              Proper storage protects the peptide after it has been
              reconstituted.
            </p>

            <div className="rg-storage-list">
              {STORAGE.map(({ icon, text }) => (
                <div key={text} className="rg-storage-item">
                  <span className="rg-storage-item__icon">{icon}</span>
                  <span className="rg-storage-item__text">{text}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── 6. FAQ ── */}
          <section id="faq" className="rg-section">
            <span className="rg-section__eyebrow">
              <ChevronDown size={11} />
              Help
            </span>
            <h2 className="rg-section__title">FAQ</h2>

            <div className="rg-faq">
              {FAQS.map(({ q, a }) => (
                <FaqItem key={q} question={q} answer={a} />
              ))}
            </div>
          </section>

          {/* ── Final CTA ── */}
          <div className="rg-cta-section">
            <h2 className="rg-cta-section__title">Ready to get started?</h2>
            <p className="rg-cta-section__sub">
              Use the calculator for exact volumes, or browse the full peptide catalog.
            </p>
            <div className="rg-cta-btns">
              <button
                className="rg-cta-btn rg-cta-btn--primary"
                onClick={() => navigate('/calculator')}
              >
                Use Calculator
                <ArrowRight size={16} />
              </button>
              <button
                className="rg-cta-btn rg-cta-btn--outline"
                onClick={() => navigate('/all-peptides')}
              >
                Browse Peptides
                <ArrowRight size={16} />
              </button>
            </div>
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
    <div className={`rg-faq-item${isOpen ? ' rg-faq-item--open' : ''}`}>
      <button className="rg-faq-btn" onClick={() => setIsOpen(!isOpen)}>
        {question}
        <ChevronDown className="rg-faq-chevron" />
      </button>
      <div className="rg-faq-answer">{answer}</div>
    </div>
  );
}
