 
/**
 * ProductProtocolsSection.jsx
 * Displays protocols that feature the current peptide.
 * Uses the same premium card design as RelatedProtocolsSection for consistency.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { RelatedCard } from '../protocol/RelatedProtocolsSection';

export default function ProductProtocolsSection({ protocols, peptideName }) {
  const navigate = useNavigate();

  if (!protocols || protocols.length === 0) return null;

  return (
    <section style={{ padding: '1rem 0 4rem', background: 'transparent' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Section header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
            background: 'rgba(0,113,189,0.06)',
            border: '1px solid rgba(0,113,189,0.12)',
            borderRadius: '30px',
            padding: '0.3rem 0.9rem',
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--primary)',
            marginBottom: '0.75rem',
          }}>
            <Sparkles size={12} />
            Clinical Integration
          </div>

          <h2 style={{
            margin: '0 0 0.4rem',
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 900,
            color: 'var(--text-main)',
            letterSpacing: '-0.025em',
            lineHeight: 1.2,
          }}>
            Used in Protocols
          </h2>
          <p style={{
            margin: 0,
            fontSize: '1rem',
            color: 'var(--text-muted)',
            lineHeight: 1.55,
          }}>
            Clinical workflows and treatment strategies integrating {peptideName}.
          </p>
        </div>

        {/* Swipeable Scroll Area (consistent with RelatedProtocolsSection) */}
        <div style={{
          display: 'flex',
          gap: '1.25rem',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: '1.5rem',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}>
          {protocols.map((protocol) => (
            <div
              key={protocol.id}
              style={{
                scrollSnapAlign: 'start',
                flexShrink: 0,
                width: 'clamp(280px, 85vw, 340px)',
              }}
            >
              <RelatedCard
                id={protocol.id}
                protocol={protocol}
                matchReason="Contains Compound"
                onClick={() => navigate(`/protocol/${protocol.slug || protocol.id}`)}
              />
            </div>
          ))}
        </div>

        {/* View All Protocols CTA */}
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => navigate('/protocols')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.75rem 1.75rem',
              background: 'white',
              color: 'var(--primary)',
              border: '1.5px solid rgba(0,113,189,0.2)',
              borderRadius: '40px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.background = 'rgba(0,113,189,0.04)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(0,113,189,0.2)';
              e.currentTarget.style.background = 'white';
            }}
          >
            Explore All Protocols
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
