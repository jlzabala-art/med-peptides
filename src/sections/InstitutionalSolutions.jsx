import React from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export default function InstitutionalSolutions({ isProfessional, onSelectCategory }) {
  if (!isProfessional) return null;

  return (
    <section className="institutional-section" style={{ 
      padding: '4rem 0', 
      backgroundColor: '#fcfdfe'
    }}>
      <div className="container">
        <div className="institutional-card" style={{
          position: 'relative',
          borderRadius: '40px',
          overflow: 'hidden',
          minHeight: '450px',
          display: 'flex',
          alignItems: 'center',
          boxShadow: '0 30px 60px rgba(15, 23, 42, 0.12)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          {/* Background Image with Overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url(/assets/institutional-solutions-bg.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0
          }} />
          
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(90deg, #000d1a 0%, #000d1a 30%, rgba(0, 13, 26, 0.4) 100%)',
            zIndex: 1
          }} />

          {/* Content */}
          <div className="container" style={{ 
            position: 'relative', 
            zIndex: 2, 
            padding: '3rem 4rem',
            maxWidth: '800px'
          }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              color: 'var(--secondary)', 
              fontWeight: 800, 
              textTransform: 'uppercase', 
              letterSpacing: '4px', 
              fontSize: '0.85rem', 
              marginBottom: '1.5rem',
              backgroundColor: 'rgba(0, 163, 224, 0.1)',
              padding: '0.5rem 1rem',
              borderRadius: '100px',
              border: '1px solid rgba(0, 163, 224, 0.2)'
            }}>
              <ShieldCheck size={18} /> Institutional Logistics
            </div>
            
            <h2 style={{ 
              fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
              color: 'white', 
              marginBottom: '1.5rem', 
              fontWeight: 800, 
              letterSpacing: '-0.04em',
              lineHeight: 1.1
            }}>
              Precision Logistics <span style={{ color: 'var(--secondary)' }}>at Scale</span>
            </h2>
            
            <p style={{ 
              fontSize: '1.25rem', 
              color: 'rgba(255,255,255,0.7)', 
              lineHeight: 1.6, 
              marginBottom: '2.5rem',
              maxWidth: '550px' 
            }}>
              Standardized 10-vial kits ensuring absolute lot consistency and verified batch stability. 
              Exclusive institutional pricing for specialized practitioners and research labs.
            </p>

            <button 
              onClick={() => onSelectCategory('Investigational Pathways')}
              className="btn"
              style={{ 
                padding: '1.25rem 2.5rem', 
                fontSize: '1.1rem', 
                fontWeight: 800, 
                backgroundColor: 'white', 
                color: '#000d1a',
                borderRadius: '16px',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.3s ease',
                boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
              }}
            >
              Research Protocols <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 768px) {
          .institutional-section .container { padding: 0 1rem; }
          .institutional-section .institutional-card { 
            border-radius: 24px !important;
            min-height: 500px !important;
            align-items: flex-end !important;
          }
          .institutional-section .institutional-card > div:nth-child(2) {
            background: linear-gradient(0deg, #000d1a 0%, #000d1a 60%, transparent 100%) !important;
          }
          .institutional-section .institutional-card > div:nth-child(3) {
            padding: 2.5rem 2rem !important;
            text-align: center;
          }
          .institutional-section .institutional-card > div:nth-child(3) > div {
            margin-left: auto;
            margin-right: auto;
          }
        }
      `}} />
    </section>
  );
}
