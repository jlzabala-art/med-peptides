/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { HelpCircle, ChevronDown, Search, X } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';
import { useHeaderHeight } from '../hooks/useHeaderHeight';

const faqData = [
  {
    question: "Where is Atlas Health based?",
    answer: "Atlas Health is proudly based in the USA. All of our operations, including fulfillment and customer support, are conducted domestically to ensure the highest standards of service and reliability."
  },
  {
    question: "Do you provide third-party testing for your products?",
    answer: "Absolutely. Quality and transparency are our core values. Every single batch of our peptides undergoes rigorous third-party testing for identity, purity, and concentration. High-performance liquid chromatography (HPLC) and Mass Spectrometry (MS) reports are available for all products to verify their quality."
  },
  {
    question: "What are peptides?",
    answer: "Peptides are short chains of amino acids linked by peptide bonds. They act as biological signaling molecules and are involved in numerous physiological processes including cellular communication, metabolic regulation, tissue repair, immune modulation, and hormonal signaling.\n\nDue to their specificity and biological activity, peptides are widely used in biomedical research and are increasingly studied for potential therapeutic applications."
  },
  {
    question: "What is the typical purity of peptide products?",
    answer: "High-quality research peptides are typically manufactured with a purity level of ≥98–99%, confirmed by analytical techniques such as High-Performance Liquid Chromatography (HPLC) and Mass Spectrometry (MS).\n\nEach production batch should be accompanied by a Certificate of Analysis (CoA) documenting purity, molecular weight verification, and analytical validation."
  },
  {
    question: "How are peptides manufactured?",
    answer: "Most peptides are produced using Solid Phase Peptide Synthesis (SPPS), a well-established technique that allows sequential assembly of amino acids under controlled laboratory conditions.\n\nFollowing synthesis, peptides undergo purification and quality control procedures including chromatographic purification, analytical verification, and stability assessment. This ensures product consistency, reproducibility, and traceability."
  },
  {
    question: "How should peptides be stored?",
    answer: "Lyophilized peptides should generally be stored under controlled temperature conditions.\n\nTypical recommendations include:\n• Long-term storage: −20°C to −80°C\n• Short-term storage: 2–8°C\n• Protect from light and moisture.\n\nOnce reconstituted, peptide solutions should be used within the recommended timeframe and stored under refrigerated conditions unless otherwise specified."
  },
  {
    question: "What solvent is used for peptide reconstitution?",
    answer: "Lyophilized peptides may be reconstituted using appropriate sterile solvents depending on the intended laboratory application. Commonly used solvents include bacteriostatic water, sterile water for injection, and buffered solutions.\n\nThe choice of solvent may affect peptide stability and solubility and should be selected based on experimental requirements."
  },
  {
    question: "What is the stability of peptides after reconstitution?",
    answer: "Peptide stability depends on several factors including peptide sequence, solvent used, storage temperature, and exposure to light or oxygen. In general, reconstituted peptides should be stored refrigerated and used within a limited time frame to minimize degradation.\n\nRepeated freeze-thaw cycles should be avoided whenever possible."
  },
  {
    question: "Are peptides sterile?",
    answer: "Unless specifically labeled as sterile and manufactured under validated sterile conditions, research peptides are typically not intended for sterile pharmaceutical applications. For sterile use in laboratory settings, appropriate filtration or sterile handling procedures may be required."
  },
  {
    question: "What quality control tests are typically performed?",
    answer: "Standard analytical testing for peptides may include HPLC purity analysis, Mass spectrometry confirmation, peptide sequence verification, endotoxin analysis (in some applications), and sterility testing when applicable.\n\nThese tests ensure product identity, purity, and analytical consistency."
  },
  {
    question: "Are these peptides intended for human or veterinary use?",
    answer: "Unless specifically approved as pharmaceutical products by regulatory authorities, peptides supplied for research purposes are intended strictly for laboratory research use only. They are not intended for human or veterinary use, diagnosis, treatment, or prevention of disease.\n\nUse must comply with all applicable regulations and institutional guidelines."
  },
  {
    question: "Do peptide products include documentation?",
    answer: "Yes. Reputable suppliers provide documentation including Certificate of Analysis (CoA), batch number and traceability information, analytical test results, and storage recommendations. This documentation ensures transparency and quality verification."
  },
  {
    question: "How should peptide handling be performed in the laboratory?",
    answer: "Peptides should be handled using standard laboratory practices, including appropriate personal protective equipment (PPE), sterile handling procedures when required, controlled storage conditions, and accurate dosing and documentation. Proper laboratory procedures help maintain product integrity and experimental reliability."
  }
];

// ── PHASE 4a: Static styles for HighlightText ────────────────────────────────────
const HIGHLIGHT_MARK_STYLE = {
  backgroundColor: 'rgba(0, 163, 224, 0.18)',
  color: 'var(--primary)',
  borderRadius: '3px',
  padding: '0 2px',
  fontWeight: 700,
  background: 'linear-gradient(120deg, rgba(0,163,224,0.25) 0%, rgba(0,163,224,0.12) 100%)',
};

// ── PHASE 3: HighlightText — highlights the search term in text ──────────────────
// Splits the string by the search term and wraps matches in <mark>.
// Uses case-insensitive regex to preserve original casing.
const HighlightText = React.memo(function HighlightText({ text, highlight }) {
  if (!highlight?.trim()) return <>{text}</>;

  const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} style={HIGHLIGHT_MARK_STYLE}>
            {part}
          </mark>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  );
});
// ── PHASE 4b: FAQItem base constants — module level (singleton) ─────────────────
const ITEM_BTN_STYLE_BASE = {
  width: '100%',
  minHeight: '44px',
  padding: '1.25rem 1.5rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  textAlign: 'left',
  WebkitTapHighlightColor: 'transparent',
};

const ITEM_QUESTION_STYLE_BASE = {
  fontSize: '1.1rem',
  fontWeight: 600,
  transition: 'color 0.3s ease',
  flex: 1,
};

const ITEM_ICON_STYLE_BASE = {
  color: 'var(--primary)',
  flexShrink: 0,
  marginLeft: '1rem',
  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  display: 'flex',
};

const ITEM_GRID_STYLE_BASE = {
  display: 'grid',
  transition: 'grid-template-rows 0.32s cubic-bezier(0.4, 0, 0.2, 1)',
};

const ITEM_OVERFLOW_STYLE = { overflow: 'hidden' };

const ITEM_ANSWER_STYLE_BASE = {
  padding: '0 1.5rem 1.5rem 1.5rem',
  color: 'var(--text-muted)',
  lineHeight: 1.7,
  fontSize: '1rem',
  whiteSpace: 'pre-line',
  transition: 'opacity 0.25s ease',
};

// ── PHASE 4b: Dynamic getters — pure functions that derive style from state ──────
const getItemWrapperStyle = (isOpen) => ({
  borderBottom: '1px solid var(--border)',
  backgroundColor: isOpen ? 'rgba(0, 43, 77, 0.02)' : 'transparent',
  transition: 'background-color 0.3s ease',
});

const getItemBtnStyle = (isPressed) => ({
  ...ITEM_BTN_STYLE_BASE,
  transform: isPressed ? 'scale(0.985)' : 'scale(1)',
  transition: 'transform 0.1s ease',
});

const getItemQuestionStyle = (isOpen) => ({
  ...ITEM_QUESTION_STYLE_BASE,
  color: isOpen ? 'var(--primary)' : 'var(--text-main)',
});

const getItemIconStyle = (isOpen) => ({
  ...ITEM_ICON_STYLE_BASE,
  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
});

const getItemGridStyle = (isOpen) => ({
  ...ITEM_GRID_STYLE_BASE,
  gridTemplateRows: isOpen ? '1fr' : '0fr',
});

const getItemAnswerStyle = (isOpen) => ({
  ...ITEM_ANSWER_STYLE_BASE,
  opacity: isOpen ? 1 : 0,
});

// ── PHASE 2+3: FAQItem ──────────────────────────────────────────────────────────────────
const FAQItem = React.memo(function FAQItem({ question, answer, isOpen, onToggle, searchTerm }) {
  const itemRef = useRef(null);
  // PHASE 3: Pressed state for tactile feedback
  const [isPressed, setIsPressed] = useState(false);
  const headerHeight = useHeaderHeight();

  // ── PHASE 2: Intelligent scroll — only fires if item is OUTSIDE viewport ──
  useEffect(() => {
    if (!isOpen || !itemRef.current) return;

    const checkAndScroll = () => {
      const rect = itemRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const itemTopVisible = rect.top >= headerHeight;
      const itemBottomVisible = rect.bottom <= viewportHeight;

      if (!itemTopVisible) {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        window.scrollTo({ top: rect.top + scrollTop - headerHeight - 16, behavior: 'smooth' });
      } else if (!itemBottomVisible && rect.height < viewportHeight * 0.6) {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        window.scrollTo({ top: rect.top + scrollTop - headerHeight - 16, behavior: 'smooth' });
      }
    };

    const timer = setTimeout(checkAndScroll, 120);
    return () => clearTimeout(timer);
  }, [isOpen, headerHeight]);


  return (
    <div ref={itemRef} style={getItemWrapperStyle(isOpen)}>
      <button
        onClick={onToggle}
        onPointerDown={() => setIsPressed(true)}
        onPointerUp={() => setIsPressed(false)}
        onPointerLeave={() => setIsPressed(false)}
        style={getItemBtnStyle(isPressed)}
      >
        <span style={getItemQuestionStyle(isOpen)}>
          {/* PHASE 3: Search highlighting in the question */}
          <HighlightText text={question} highlight={searchTerm} />
        </span>
        <span style={getItemIconStyle(isOpen)}>
          <ChevronDown size={20} />
        </span>
      </button>

      {/* PHASE 2: CSS Grid Animation — unknown height without JS */}
      <div style={getItemGridStyle(isOpen)}>
        <div style={ITEM_OVERFLOW_STYLE}>
          <div style={getItemAnswerStyle(isOpen)}>
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
});

// ── PHASE 4c: Root FAQ component style constants ────────────────────────────
const FAQ_SECTION_STYLE  = { minHeight: '80vh', paddingTop: 'clamp(2rem, 8vw, 6rem)' };
const FAQ_INNER_STYLE    = { maxWidth: '900px', margin: '0 auto' };
const FAQ_HEADER_STYLE   = { textAlign: 'center', marginBottom: '3rem' };
const FAQ_ICON_BADGE_STYLE = {
  display: 'inline-flex',
  backgroundColor: 'var(--primary)',
  color: 'white',
  padding: '0.75rem',
  borderRadius: '50%',
  marginBottom: '1rem',
};
const FAQ_H1_STYLE = {
  fontFamily: 'var(--font-heading)',
  fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
  color: 'var(--primary)',
  marginBottom: '1.5rem',
  letterSpacing: '-0.03em',
  fontWeight: 850,
};
const FAQ_SUBTITLE_STYLE = { color: 'var(--text-muted)', fontSize: '1.1rem' };

const FAQ_SEARCH_WRAPPER_STYLE = { position: 'relative', marginBottom: '1.5rem' };
const FAQ_SEARCH_ICON_STYLE = {
  position: 'absolute',
  left: '1rem',
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'var(--text-muted)',
  pointerEvents: 'none',
};
const FAQ_INPUT_BASE_STYLE = {
  width: '100%',
  padding: '0.875rem 3rem 0.875rem 2.75rem',
  borderRadius: '12px',
  border: '1.5px solid var(--border)',
  fontSize: '1rem',
  color: 'var(--text-main)',
  background: 'white',
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  outline: 'none',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  boxSizing: 'border-box',
};
const FAQ_CLEAR_BTN_STYLE = {
  position: 'absolute',
  right: '1rem',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--text-muted)',
  display: 'flex',
  alignItems: 'center',
  padding: '0.25rem',
};
const FAQ_RESULTS_COUNT_STYLE = {
  fontSize: '0.85rem',
  color: 'var(--text-muted)',
  marginBottom: '1rem',
  paddingLeft: '0.25rem',
};
const FAQ_LIST_WRAPPER_STYLE = {
  backgroundColor: 'white',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-md)',
  border: '1px solid var(--border)',
  overflow: 'hidden',
};
const FAQ_EMPTY_STATE_STYLE = { padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' };
const FAQ_EMPTY_ICON_STYLE  = { marginBottom: '1rem', opacity: 0.3 };
const FAQ_EMPTY_TITLE_STYLE = { fontWeight: 600, marginBottom: '0.5rem' };
const FAQ_EMPTY_LINK_STYLE  = {
  background: 'none', border: 'none', color: 'var(--primary)',
  cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
};
const FAQ_CTA_BLOCK_STYLE = {
  marginTop: '3rem',
  padding: '2rem',
  backgroundColor: 'var(--primary)',
  color: 'white',
  borderRadius: 'var(--radius-lg)',
  textAlign: 'center',
  boxShadow: 'var(--shadow-lg)',
};
const FAQ_CTA_H4_STYLE  = { margin: '0 0 1rem 0', color: 'white', fontSize: '1.3rem' };
const FAQ_CTA_P_STYLE   = { marginBottom: '1.5rem', opacity: 0.9 };
const FAQ_CTA_BTN_STYLE = { backgroundColor: 'white', color: 'var(--primary)', padding: '0.75rem 2rem' };

export default function FAQ({ onBack }) {
  usePageMeta({
    title: 'Frequently Asked Questions',
    description: 'Find answers to common questions about research peptides, purity standards, shipping, and how to order from Atlas Health.',
    path: '/faq',
  });

  const [openIndex, setOpenIndex] = useState(0);
  // ── PHASE 1: Search state ──
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // PHASE 1: Filtered list — useMemo avoids recalculating on every render
  const filteredFAQs = useMemo(() => {
    if (!searchTerm.trim()) return faqData.map((item, idx) => ({ ...item, originalIndex: idx }));
    const lower = searchTerm.toLowerCase();
    return faqData
      .map((item, idx) => ({ ...item, originalIndex: idx }))
      .filter(item =>
        item.question.toLowerCase().includes(lower) ||
        item.answer.toLowerCase().includes(lower)
      );
  }, [searchTerm]);

  // Reset open index when filter changes so it doesn't point to a stale item
  useEffect(() => {
    setOpenIndex(-1);
  }, [searchTerm]);

  const clearSearch = () => {
    setSearchTerm('');
    setOpenIndex(0);
  };

  return (
    <section className="section section-light template-root" style={FAQ_SECTION_STYLE}>
      <div className="container">
        <div style={FAQ_INNER_STYLE}>

          {/* Header */}
          <div style={FAQ_HEADER_STYLE}>
            <div style={FAQ_ICON_BADGE_STYLE}>
              <HelpCircle size={32} />
            </div>
            <h1 style={FAQ_H1_STYLE}>
              Frequently Asked Questions
            </h1>
            <p style={FAQ_SUBTITLE_STYLE}>
              Comprehensive scientific and regulatory information regarding our research peptide products.
            </p>
          </div>

          {/* ── PHASE 1: Search Input ── */}
          <div style={FAQ_SEARCH_WRAPPER_STYLE}>
            <Search size={18} style={FAQ_SEARCH_ICON_STYLE} />
            <input
              type="search"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={FAQ_INPUT_BASE_STYLE}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary)';
                e.target.style.boxShadow = '0 0 0 3px rgba(0, 163, 224, 0.12)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border)';
                e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
              }}
            />
            {searchTerm && (
              <button onClick={clearSearch} style={FAQ_CLEAR_BTN_STYLE} aria-label="Clear search">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Results count */}
          {searchTerm.trim() && (
            <p style={FAQ_RESULTS_COUNT_STYLE}>
              {filteredFAQs.length === 0
                ? 'No results found.'
                : `${filteredFAQs.length} result${filteredFAQs.length !== 1 ? 's' : ''} for "${searchTerm}"`}
            </p>
          )}

          {/* FAQ List */}
          <div style={FAQ_LIST_WRAPPER_STYLE}>
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((item, idx) => (
                <FAQItem
                  key={item.originalIndex}
                  question={item.question}
                  answer={item.answer}
                  isOpen={openIndex === idx}
                  onToggle={() => setOpenIndex(openIndex === idx ? -1 : idx)}
                  searchTerm={searchTerm}
                />
              ))
            ) : (
              <div style={FAQ_EMPTY_STATE_STYLE}>
                <Search size={32} style={FAQ_EMPTY_ICON_STYLE} />
                <p style={FAQ_EMPTY_TITLE_STYLE}>No matching questions</p>
                <p style={{ fontSize: '0.9rem' }}>
                  Try a different keyword or{' '}
                  <button onClick={clearSearch} style={FAQ_EMPTY_LINK_STYLE}>clear the search</button>
                </p>
              </div>
            )}
          </div>

          {/* CTA Block */}
          <div style={FAQ_CTA_BLOCK_STYLE}>
            <h4 style={FAQ_CTA_H4_STYLE}>Have more technical questions?</h4>
            <p style={FAQ_CTA_P_STYLE}>Our analytical team is available to provide detailed specifications and batch-specific data.</p>
            <button
              onClick={() => {
                onBack();
                setTimeout(() => {
                  const el = document.getElementById('contact');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  else window.scrollTo(0, 0);
                }, 100);
              }}
              className="btn"
              style={FAQ_CTA_BTN_STYLE}
            >
              Contact Laboratory Support
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
