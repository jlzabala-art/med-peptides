 
import React from 'react';
import { Beaker, ArrowRight } from 'lucide-react';

export default function CustomSynthesisBanner({ onNavigate, compact = false }) {
  if (compact) {
    return (
      <div style={{
        backgroundColor: '#020617',
        borderRadius: '24px',
        padding: '1.75rem',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        height: '100%',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}>
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(circle at top right, rgba(0, 163, 224, 0.12), transparent)',
          zIndex: 0
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--color-primary)',
            fontWeight: 800,
            textTransform: 'uppercase',
            fontSize: '0.7rem',
            letterSpacing: '0.1em',
            marginBottom: '0.75rem'
          }}>
            <Beaker size={14} /> Professional
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>Custom Synthesis</h3>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.4 }}>
            Bespoke molecular manufacturing for elite institutions.
          </p>
        </div>
        <button
          onClick={() => onNavigate('Custom Synthesis')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            backgroundColor: 'white', color: '#020617',
            border: 'none', padding: '0.75rem 1.5rem', borderRadius: '12px',
            fontSize: '0.9rem', fontWeight: 800, cursor: 'pointer',
            width: 'fit-content',
            position: 'relative', zIndex: 1,
            transition: 'transform 0.2s ease'
          }}
        >
          Explore <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <section className="custom-synthesis-section" style={{
      padding: 'clamp(2rem, 5vw, 4rem) 0',
      backgroundColor: '#fcfdfe'
    }}>
      <div className="container">
        <div className="custom-synthesis-card" style={{
          position: 'relative',
          borderRadius: 'clamp(24px, 4vw, 40px)',
          overflow: 'hidden',
          minHeight: '480px',
          display: 'flex',
          alignItems: 'center',
          boxShadow: '0 40px 80px -15px rgba(15, 23, 42, 0.2)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          {/* Background Image */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: 'url(/assets/custom-synthesis-bg.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0
          }} />

          {/* Dynamic Gradient Overlay */}
          <div className="card-overlay" style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(90deg, #020617 0%, #020617 40%, rgba(2, 6, 23, 0.3) 100%)',
            zIndex: 1
          }} />

          {/* Content */}
          <div className="content-wrapper" style={{
            position: 'relative',
            zIndex: 2,
            padding: 'clamp(2rem, 8vw, 4rem)',
            maxWidth: '850px'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: 'var(--color-primary)',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              fontSize: '0.8rem',
              marginBottom: '1.5rem',
              backgroundColor: 'rgba(0, 163, 224, 0.12)',
              padding: '0.6rem 1.2rem',
              borderRadius: '100px',
              border: '1px solid rgba(0, 163, 224, 0.2)',
              backdropFilter: 'blur(4px)'
            }}>
              <Beaker size={18} /> Professional Solutions
            </div>

            <h2 className="title" style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
              color: 'white',
              marginBottom: '1.25rem',
              fontWeight: 850,
              letterSpacing: '-0.04em',
              lineHeight: 1.05
            }}>
              Customised <span style={{ color: 'var(--color-primary)' }}>Synthesis</span>
            </h2>

            <p className="description" style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.5,
              marginBottom: '2.5rem',
              maxWidth: '500px'
            }}>
              Bespoke molecular manufacturing for elite research institutions.
              Verified analytical markers to 99.5% purity.
            </p>

            <button
              onClick={() => onNavigate('Custom Synthesis')}
              className="cta-button"
              style={{
                padding: '1.1rem 2.2rem',
                fontSize: '1.05rem',
                fontWeight: 800,
                backgroundColor: 'white',
                color: '#020617',
                borderRadius: '16px',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
              }}
            >
              Explore Services <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @media (max-width: 768px) {
          .custom-synthesis-section { padding: 1.5rem 0 !important; }
          .custom-synthesis-card { 
            min-height: 520px !important;
            align-items: flex-end !important; /* Texto abajo para ver la imagen arriba */
          }
          .card-overlay {
            background: linear-gradient(180deg, transparent 0%, rgba(2, 6, 23, 0.7) 30%, #020617 90%) !important;
          }
          .content-wrapper {
            padding: 2rem 1.5rem !important;
            text-align: center;
          }
          .title { letter-spacing: -0.02em !important; }
          .description { margin-bottom: 2rem !important; }
          .cta-button {
            width: 100% !important;
            justify-content: center;
            padding: 1.2rem !important;
          }
        }
      `}} />
    </section>
  );
}