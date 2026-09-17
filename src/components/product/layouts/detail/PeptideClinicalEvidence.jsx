import React from 'react';
import { BookOpen, ExternalLink, Bot } from '@/lib/icons';

/**
 * PeptideClinicalEvidence
 * Clinical Evidence Hub trigger card + ClinicAI Interactive Research Assistant queries.
 */
export default function PeptideClinicalEvidence({
  product,
  isMobile = false,
  isPeptide = true,
  presentationClass = 'vial',
  onOpenPubMed,
}) {
  const cat = (product?.category || '').toLowerCase();
  const isDna = cat.includes('dna') || cat.includes('epigenetic');
  const isSkin = cat.includes('topical') || cat.includes('skin') || cat.includes('cream');

  const queryChips = (() => {
    if (isDna) {
      return [
        {
          label: 'Biomarker Significance',
          icon: '🧬',
          query: `What key genetic or epigenetic biomarkers does ${product.name} analyze, and what is their clinical significance?`,
        },
        {
          label: 'Actionable Interventions',
          icon: '⚡',
          query: `Based on the results of ${product.name}, what are common clinical interventions and lifestyle modifications?`,
        },
        {
          label: 'Scientific Validity',
          icon: '🔬',
          query: `Explain the scientific methodology and evidence base behind ${product.name}.`,
        },
      ];
    }
    if (isSkin) {
      return [
        {
          label: 'Application & Dosing',
          icon: '🧴',
          query: `What are the recommended application protocols and absorption rates for ${product.name}?`,
        },
        {
          label: 'Active Ingredients',
          icon: '🌿',
          query: `What are the mechanisms of action for the active ingredients in ${product.name}?`,
        },
        {
          label: 'Compatibility',
          icon: '⚡',
          query: `Which other topical treatments or procedures synergize with ${product.name}?`,
        },
      ];
    }

    const isVialPeptide = isPeptide && presentationClass === 'vial';
    return [
      {
        label: isVialPeptide ? 'Dosing & Reconstitution' : 'Dosing & Administration',
        icon: '🩺',
        query: isVialPeptide
          ? `What are the recommended dosing timelines, reconstitution ratios, and safety thresholds for ${product.name}?`
          : `What are the recommended dosing timelines, administration protocols, and safety thresholds for ${product.name}?`,
      },
      {
        label: 'Stack Synergies',
        icon: '⚡',
        query: `Which compounds synergize best with ${product.name} to maximize clinical efficacy?`,
      },
      {
        label: 'Molecular Mechanisms',
        icon: '🧬',
        query: `Explain the biological mechanisms of action and pathways affected by ${product.name}.`,
      },
    ];
  })();

  const handleChipClick = (queryText) => {
    try {
      localStorage.removeItem('clinical_ai_messages_v2');
    } catch (e) {
      /* ignore */
    }
    window.dispatchEvent(
      new CustomEvent('open-clinical-ai', {
        detail: { query: queryText, section: 'ProductDetail.FAQWidget', autoSend: true },
      })
    );
  };

  return (
    <>
      {/* Clinical Evidence Hub */}
      <div
        onClick={onOpenPubMed}
        style={{
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          cursor: 'pointer',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 4px 15px rgba(0,54,102,0.03)',
          position: 'relative',
          overflow: 'hidden',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--secondary)';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,163,224,0.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,54,102,0.03)';
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '100px',
            height: '100px',
            background: 'var(--secondary)',
            opacity: 0.05,
            filter: 'blur(20px)',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            backgroundColor: 'var(--section-alt, #EEF4FA)',
            padding: '1rem',
            borderRadius: '12px',
            color: 'var(--secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(0, 163, 224, 0.15)',
          }}
        >
          <BookOpen size={24} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h4
              style={{
                margin: 0,
                fontSize: '1.05rem',
                color: 'var(--primary)',
                fontWeight: 800,
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              Clinical Evidence Hub
            </h4>
            <span
              style={{
                fontSize: '0.6rem',
                fontWeight: 800,
                background: 'var(--primary)',
                color: 'white',
                padding: '0.15rem 0.4rem',
                borderRadius: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              AI Summarized
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Access peer-reviewed PubMed publications with key insight summaries.
          </p>
        </div>
        <div style={{ color: 'var(--secondary)', opacity: 0.7 }}>
          <ExternalLink size={18} />
        </div>
      </div>

      {/* ClinicAI Interactive Research Assistant Widget */}
      <div
        className="anim-fade-in"
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '1.25rem',
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          marginBottom: '1.5rem',
          boxShadow: '0 4px 15px rgba(0,54,102,0.03)',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
          <div
            style={{
              backgroundColor: 'rgba(0, 163, 224, 0.1)',
              padding: '1rem',
              borderRadius: '12px',
              color: 'var(--secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(0, 163, 224, 0.2)',
              flexShrink: 0,
            }}
          >
            <Bot size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
              <h4
                style={{
                  margin: 0,
                  fontSize: '1.05rem',
                  color: 'var(--primary)',
                  fontWeight: 800,
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                Interactive Research Assistant
              </h4>
              <span
                style={{
                  fontSize: '0.6rem',
                  fontWeight: 800,
                  background: 'var(--secondary)',
                  color: 'white',
                  padding: '0.15rem 0.4rem',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                ClinicAI
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Select a research inquiry below to explore data for {product.name} with our institutional AI.
            </p>
          </div>
        </div>

        {/* AI Query Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem', marginLeft: isMobile ? '0' : '4.25rem' }}>
          {queryChips.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleChipClick(q.query)}
              className="btn"
              style={{
                padding: '0.4rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: 'var(--color-bg-app)',
                color: 'var(--text-main)',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--secondary)';
                e.currentTarget.style.color = 'var(--secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-main)';
              }}
            >
              <span>{q.icon}</span>
              {q.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
