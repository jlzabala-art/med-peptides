import Beaker from "lucide-react/dist/esm/icons/beaker";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import Microscope from "lucide-react/dist/esm/icons/microscope";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import Send from "lucide-react/dist/esm/icons/send";
import React from 'react';






export default function CustomSynthesis({ onBack }) {
  return (
    <div className="template-root" style={{ animation: 'viewFadeIn 0.8s ease-out', backgroundColor: 'var(--background)', minHeight: '100vh', padding: 'clamp(2rem, 8vw, 6rem) 0 6rem 0' }}>
      <div className="container">
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', color: 'var(--secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '4px', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              <Beaker size={20} /> Advanced Manufacturing
            </div>
            <h1 style={{ fontSize: 'clamp(3rem, 6vw, 4.5rem)', color: 'var(--text-main)', marginBottom: '1.5rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1 }}>
              Custom <span className="hero-title-accent">Synthesis</span>
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', lineHeight: 1.7, fontWeight: 400 }}>
              <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>Med</span>-Peptides is a premium platform dedicated to sourcing high-purity research materials. We meticulously curate our collection from the world's most elite analytical laboratories.
            </p>
          </div>

          {/* Service Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2.5rem', marginBottom: '6rem' }}>
            <div style={{ padding: '3rem', backgroundColor: 'white', borderRadius: '32px', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: 'rgba(0, 163, 224, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '2rem' }}>
                <Microscope size={28} />
              </div>
              <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem', fontWeight: 800, color: '#0f172a' }}>Purity Precision</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', lineHeight: 1.7 }}>
                Standard catalog items often reach 98%+. Our custom synthesis service can provide analytical markers verified to 99.5% and beyond, essential for longitudinal sensitivity.
              </p>
            </div>
            <div style={{ padding: '3rem', backgroundColor: 'white', borderRadius: '32px', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: 'rgba(16, 185, 129, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-success)', marginBottom: '2rem' }}>
                <ShieldCheck size={28} />
              </div>
              <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem', fontWeight: 800, color: '#0f172a' }}>Structural Mod</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', lineHeight: 1.7 }}>
                Acetylation, amidation, phosphorylation, or isotopic labeling. We implement specific molecular modifications to optimize stability, bioavailability, or tracking.
              </p>
            </div>
          </div>

          {/* Methodology */}
          <div style={{ backgroundColor: '#000d1a', padding: '4rem', borderRadius: '40px', color: 'white', border: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden', marginBottom: '6rem' }}>
             <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 100% 0%, rgba(0, 163, 224, 0.15) 0%, transparent 50%)', zIndex: 0 }} />
             <div style={{ position: 'relative', zIndex: 1 }}>
               <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem', letterSpacing: '-0.03em' }}>Institutional Pipeline</h2>
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem' }}>
                 <div>
                   <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.1em' }}>01. Consultation</div>
                   <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>Review of molecular specifications and volume requirements with our analytical team.</p>
                 </div>
                 <div>
                   <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.1em' }}>02. Feasibility</div>
                   <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>Structural analysis and timeline estimation for complex heterocyclic synthesis.</p>
                 </div>
                 <div>
                   <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.1em' }}>03. Validation</div>
                   <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>Comprehensive HPLC, MS, and NMR verification provided with the final COA.</p>
                 </div>
               </div>
             </div>
          </div>

          {/* CTA Section */}
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '2rem' }}>Request a Synthesis Quote</h2>
            <button 
              onClick={() => {
                // Navigate to contact with Synthesis prefix
                onBack(); // Temp back
                setTimeout(() => {
                  const contactBtn = document.querySelector('[data-nav="Contact"]');
                  if (contactBtn) contactBtn.click();
                }, 100);
              }}
              className="btn btn-primary"
              style={{ 
                padding: '1.25rem 3rem', 
                fontSize: '1.2rem', 
                fontWeight: 800, 
                backgroundColor: 'var(--primary)', 
                color: 'white',
                borderRadius: '20px',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '1rem',
                boxShadow: '0 20px 40px rgba(0, 31, 63, 0.2)'
              }}
            >
              Contact Specialist <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}