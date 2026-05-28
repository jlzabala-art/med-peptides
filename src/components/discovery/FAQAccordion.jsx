 
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, ArrowRight, Play, Video, Target } from 'lucide-react';
import { useHeaderHeight } from '../../hooks/useHeaderHeight';
import { highlightMatch } from '../../utils/textUtils';

/**
 * FAQAccordion — renders a list of FAQ items with expand/collapse,
 * inline peptide suggestions below each answer, and a CTA.
 */
function FAQAccordionItem({ faq, isOpen, onToggle, relatedProducts, onProductClick, searchQuery }) {
  const itemRef = useRef(null);
  const isInitialMount = useRef(true);
  const headerHeight = useHeaderHeight();

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (isOpen && itemRef.current) {
      setTimeout(() => {
        const rect = itemRef.current.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        window.scrollTo({ top: rect.top + scrollTop - headerHeight - 16, behavior: 'smooth' });
      }, 100);
    }
  }, [isOpen, headerHeight]);

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
        backgroundColor: isOpen ? 'rgba(56, 189, 248, 0.03)' : 'transparent',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {faq.videoUrl && <Video size={16} style={{ color: '#38bdf8' }} />}
          <span
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: isOpen ? 'var(--color-primary)' : 'var(--text-main)',
              transition: 'color 0.3s ease',
              lineHeight: 1.4,
            }}
          >
            {highlightMatch(faq.question, searchQuery)}
          </span>
        </div>
        <span style={{ color: '#38bdf8', flexShrink: 0 }}>
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </span>
      </button>

      {isOpen && (
        <div style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>
          {/* Pro Video Integration */}
          {faq.videoUrl && (
            <div style={{ 
              marginBottom: '1.5rem', 
              borderRadius: '16px', 
              overflow: 'hidden', 
              aspectRatio: '16/9', 
              background: '#000',
              border: '1px solid var(--border)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}>
              <iframe
                width="100%"
                height="100%"
                src={faq.videoUrl.replace('watch?v=', 'embed/')}
                title="Clinical Explanation Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}

          {/* Answer */}
          <div
            style={{
              color: 'var(--text-muted)',
              lineHeight: 1.8,
              fontSize: '1rem',
              marginBottom: suggested.length > 0 ? '1.5rem' : 0,
              whiteSpace: 'pre-line',
            }}
          >
            {highlightMatch(faq.answer, searchQuery)}
          </div>

          {/* Inline peptide suggestions */}
          {suggested.length > 0 && (
            <div style={{ background: 'var(--color-bg-app)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <p
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-secondary)',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Target size={14} /> Recommended for this Domain
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {suggested.map((prod) => (
                  <button
                    key={prod.id || prod.name}
                    onClick={() => onProductClick && onProductClick(prod)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      borderRadius: '12px',
                      border: '1px solid #38bdf8',
                      background: 'white',
                      color: '#0369a1',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 4px rgba(56,189,248,0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#38bdf8';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.color = '#0369a1';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {prod.name} <ArrowRight size={14} />
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

export default function FAQAccordion({ faqItems = [], relatedProducts = [], onProductClick, searchQuery }) {
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
        borderRadius: '24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
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
          searchQuery={searchQuery}
        />
      ))}
    </div>
  );
}
