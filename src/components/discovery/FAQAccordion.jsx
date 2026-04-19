import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';

/**
 * FAQAccordion — renders a list of FAQ items with expand/collapse,
 * inline peptide suggestions below each answer, and a CTA.
 */
function FAQAccordionItem({ faq, isOpen, onToggle, relatedProducts, onProductClick }) {
  const itemRef = useRef(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (isOpen && itemRef.current) {
      setTimeout(() => {
        const headerHeight = 120;
        const rect = itemRef.current.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        window.scrollTo({ top: rect.top + scrollTop - headerHeight, behavior: 'smooth' });
      }, 100);
    }
  }, [isOpen]);

  // Find peptides suggested by this FAQ
  const suggested = (faq.relatedPeptideNames || [])
    .map((name) => relatedProducts?.find((p) => p.name?.toLowerCase() === name.toLowerCase()))
    .filter(Boolean)
    .slice(0, 3);

  return (
    <div
      ref={itemRef}
      style={{
        borderBottom: '1px solid var(--border)',
        backgroundColor: isOpen ? 'rgba(0, 43, 77, 0.02)' : 'transparent',
        transition: 'background-color 0.3s ease',
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          gap: '1rem',
        }}
      >
        <span
          style={{
            fontSize: '1.05rem',
            fontWeight: 600,
            color: isOpen ? 'var(--primary)' : 'var(--text-main)',
            transition: 'color 0.3s ease',
            lineHeight: 1.4,
          }}
        >
          {faq.question}
        </span>
        <span style={{ color: 'var(--primary)', flexShrink: 0 }}>
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </span>
      </button>

      {isOpen && (
        <div style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>
          {/* Answer */}
          <p
            style={{
              color: 'var(--text-muted)',
              lineHeight: 1.8,
              fontSize: '1rem',
              marginBottom: suggested.length > 0 ? '1.25rem' : 0,
              whiteSpace: 'pre-line',
            }}
          >
            {faq.answer}
          </p>

          {/* Inline peptide suggestions */}
          {suggested.length > 0 && (
            <div>
              <p
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  marginBottom: '0.75rem',
                }}
              >
                Related Peptides
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {suggested.map((prod) => (
                  <button
                    key={prod.id || prod.name}
                    onClick={() => onProductClick && onProductClick(prod)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.4rem 0.85rem',
                      borderRadius: '999px',
                      border: '1.5px solid var(--primary)',
                      background: 'white',
                      color: 'var(--primary)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--primary)';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.color = 'var(--primary)';
                    }}
                  >
                    {prod.name} <ArrowRight size={13} />
                  </button>
                ))}
              </div>
            </div>
          )}


        </div>
      )}
    </div>
  );
}

export default function FAQAccordion({ faqItems = [], relatedProducts = [], onProductClick }) {
  const [openIndex, setOpenIndex] = useState(0);

  if (!faqItems.length) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        No FAQ items found.
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
      }}
    >
      {faqItems.map((faq, index) => (
        <FAQAccordionItem
          key={faq.faqId || index}
          faq={faq}
          isOpen={openIndex === index}
          onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
          relatedProducts={relatedProducts}
          onProductClick={onProductClick}
        />
      ))}
    </div>
  );
}
