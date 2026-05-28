 
import React from 'react';
import { Link } from 'react-router-dom';

/**
 * EducationTeaser
 * ─────────────────────────────────────────────────────────────────────────────
 * A section for guests only to introduce them to peptides and lead them
 * to the full educational page.
 */
export default function EducationTeaser() {
  return (
    <section id="EducationTeaser" className="section-padding" style={{ 
      background: 'linear-gradient(180deg, var(--background) 0%, var(--surface) 100%)',
      borderTop: '1px solid var(--border-color)',
      borderBottom: '1px solid var(--border-color)',
      overflow: 'hidden'
    }}>
      <div className="container">
        <div className="start-here-grid">
          <div className="start-here-content">
            <span className="badge badge-primary mb-m" style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Scientific Foundations
            </span>
            <h2 className="h1 mb-m">What Are Peptides?</h2>
            <p className="text-muted mb-l" style={{ fontSize: '1.125rem', lineHeight: '1.7', maxWidth: '600px' }}>
              Peptides are short chains of amino acids that act as biological messengers. 
              In clinical research, they represent one of the most promising frontiers for 
              cellular signaling and physiological optimization.
            </p>
            
            <div className="features-list mb-l" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ color: 'var(--primary)', flexShrink: 0 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem' }}>Targeted Signaling</h4>
                  <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>Precise molecular interaction with specific cellular receptors.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ color: 'var(--primary)', flexShrink: 0 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem' }}>Biological Precision</h4>
                  <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>Mimicking endogenous ligands for predictable physiological responses.</p>
                </div>
              </div>
            </div>

            <Link to="/what-are-peptides" className="btn btn-primary" style={{ padding: '1rem 2rem' }}>
              Explore Scientific Guide
            </Link>
          </div>

          <div className="start-here-image">
            <div className="peptide-structure-art" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="atom-group" style={{ position: 'relative', width: '250px', height: '250px' }}>
                <div className="atom" style={{ top: '10%', left: '40%', width: '60px', height: '60px' }}></div>
                <div className="atom" style={{ top: '50%', left: '10%', width: '45px', height: '45px', opacity: 0.7 }}></div>
                <div className="atom" style={{ top: '70%', left: '60%', width: '50px', height: '50px', opacity: 0.8 }}></div>
                <div className="atom" style={{ top: '30%', left: '80%', width: '35px', height: '35px', opacity: 0.6 }}></div>
                
                {/* Connecting lines SVG */}
                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, opacity: 0.2 }}>
                  <line x1="43%" y1="22%" x2="19%" y2="59%" stroke="var(--primary)" strokeWidth="1" />
                  <line x1="19%" y1="59%" x2="70%" y2="80%" stroke="var(--primary)" strokeWidth="1" />
                  <line x1="70%" y1="80%" x2="87%" y2="37%" stroke="var(--primary)" strokeWidth="1" />
                  <line x1="87%" y1="37%" x2="43%" y2="22%" stroke="var(--primary)" strokeWidth="1" />
                </svg>
              </div>
              
              {/* Floating glow effect */}
              <div style={{ 
                position: 'absolute', 
                width: '300px', 
                height: '300px', 
                background: 'radial-gradient(circle, var(--primary-soft) 0%, transparent 70%)',
                zIndex: -2,
                opacity: 0.5,
                filter: 'blur(40px)'
              }}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
