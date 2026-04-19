import React from 'react';
import { GraduationCap, ArrowRight, BookOpen, Users, Award } from 'lucide-react';

const AcademyBanner = ({ compact = false, onNavigate }) => {
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
          background: 'radial-gradient(circle at top right, rgba(6, 182, 212, 0.12), transparent)',
          zIndex: 0
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: '#22d3ee',
            fontWeight: 800,
            textTransform: 'uppercase',
            fontSize: '0.7rem',
            letterSpacing: '0.1em',
            marginBottom: '0.75rem'
          }}>
            <GraduationCap size={14} /> Knowledge Core
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
            RegenPept Academy
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.4 }}>
            Master peptide research with our comprehensive educational protocols.
          </p>
        </div>
        <button
          onClick={() => onNavigate?.('academy')}
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
          Enter Academy <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <section className="academy-section" style={{
      padding: 'clamp(2rem, 5vw, 4rem) 0',
      backgroundColor: '#fcfdfe'
    }}>
      <div className="container">
        <div style={{
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
            backgroundImage: 'url(/assets/academy-bg.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0
          }} />

          {/* Gradient Overlay */}
          <div className="academy-overlay" style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(90deg, #020617 0%, #020617 45%, rgba(2, 6, 23, 0.25) 100%)',
            zIndex: 1
          }} />

          {/* Ambient glow */}
          <div style={{
            position: 'absolute',
            top: '25%',
            left: '-5rem',
            width: '24rem',
            height: '24rem',
            background: 'rgba(6, 182, 212, 0.08)',
            borderRadius: '50%',
            filter: 'blur(120px)',
            zIndex: 1,
            pointerEvents: 'none'
          }} />

          {/* Content */}
          <div className="academy-content" style={{
            position: 'relative',
            zIndex: 2,
            padding: 'clamp(2rem, 8vw, 4rem)',
            maxWidth: '850px'
          }}>
            {/* Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: '#22d3ee',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              fontSize: '0.8rem',
              marginBottom: '1.5rem',
              backgroundColor: 'rgba(6, 182, 212, 0.12)',
              padding: '0.6rem 1.2rem',
              borderRadius: '100px',
              border: '1px solid rgba(6, 182, 212, 0.25)',
              backdropFilter: 'blur(4px)'
            }}>
              <BookOpen size={16} /> Knowledge Core
            </div>

            {/* Heading */}
            <h2 style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
              color: 'white',
              marginBottom: '1.25rem',
              fontWeight: 850,
              letterSpacing: '-0.04em',
              lineHeight: 1.05
            }}>
              Accelerate Your{' '}
              <span style={{
                background: 'linear-gradient(90deg, #22d3ee, #3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Research Excellence
              </span>
            </h2>

            {/* Description */}
            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.15rem)',
              color: 'rgba(255,255,255,0.65)',
              lineHeight: 1.6,
              marginBottom: '2rem',
              maxWidth: '540px'
            }}>
              RegenPept Academy provides peer-reviewed protocols, interactive research guides,
              and deep-dive technical documentation to ensure optimal results in your laboratory.
            </p>

            {/* Feature pills */}
            <div className="academy-features" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem',
              marginBottom: '2.5rem'
            }}>
              {[
                { icon: <Users size={20} />, title: 'Researcher Network', desc: 'Insights from leading biotech professionals.' },
                { icon: <Award size={20} />, title: 'Standardized Protocols', desc: 'Verified methodologies for consistent outcomes.' },
                { icon: <BookOpen size={20} />, title: 'Technical Library', desc: 'Comprehensive database of peptide whitepapers.' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '1rem',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(8px)'
                }}>
                  <div style={{ color: '#22d3ee', marginTop: '2px', flexShrink: 0 }}>{item.icon}</div>
                  <div>
                    <div style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{item.title}</div>
                    <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem', lineHeight: 1.4 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <button
                onClick={() => onNavigate?.('academy')}
                className="academy-cta-primary"
                style={{
                  padding: '1.1rem 2.2rem',
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                  color: 'white',
                  borderRadius: '16px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 10px 25px rgba(6,182,212,0.3)'
                }}
              >
                Explore Academy <ArrowRight size={20} />
              </button>
              <button
                onClick={() => onNavigate?.('whitepapers')}
                className="academy-cta-secondary"
                style={{
                  padding: '1.1rem 2.2rem',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  color: 'white',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(8px)'
                }}
              >
                View Whitepapers
              </button>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 768px) {
          .academy-section { padding: 1.5rem 0 !important; }
          .academy-overlay {
            background: linear-gradient(180deg, transparent 0%, rgba(2,6,23,0.7) 30%, #020617 90%) !important;
          }
          .academy-content {
            padding: 2rem 1.5rem !important;
            text-align: center;
          }
          .academy-features {
            grid-template-columns: 1fr !important;
          }
          .academy-cta-primary,
          .academy-cta-secondary {
            width: 100% !important;
            justify-content: center;
            padding: 1.2rem !important;
          }
        }
        .academy-cta-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 35px rgba(6,182,212,0.4) !important;
        }
        .academy-cta-secondary:hover {
          background-color: rgba(255,255,255,0.13) !important;
        }
      `}} />
    </section>
  );
};

export default AcademyBanner;