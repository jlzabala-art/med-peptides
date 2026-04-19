import React from 'react';
import { Target, Zap, Activity, Brain, Shield, Heart, ArrowRight } from 'lucide-react';

const PATHWAYS = [
  { id: 'Healing & Repair', name: 'Healing', icon: <Shield size={20} />, count: '2 Peptides' },
  { id: 'Metabolic', name: 'Metabolic', icon: <Zap size={20} />, count: '4 Peptides' },
  { id: 'Cognitive', name: 'Cognitive', icon: <Brain size={20} />, count: '3 Peptides' },
  { id: 'Longevity', name: 'Longevity', icon: <Heart size={20} />, count: '2 Peptides' },
  { id: 'Performance', name: 'Somatic', icon: <Activity size={20} />, count: '5 Peptides' },
  { id: 'Hormonal', name: 'Hormonal', icon: <Target size={20} />, count: '3 Peptides' }
];

export default function PathwayNavigation({ onSelectCategory }) {
  return (
    <section style={{ backgroundColor: '#f8fafc', padding: 'clamp(2rem, 5vw, 4rem) 0' }}>
      <div className="container" style={{ padding: '0 1rem' }}>

        <div style={{ textAlign: 'left', marginBottom: '1.5rem', paddingLeft: '0.25rem' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 850,
            color: '#0f172a',
            letterSpacing: '-0.02em',
            marginBottom: '0.25rem'
          }}>
            Research Pathways
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Select biological mechanism
          </p>
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
          .pathway-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
          }
          
          .pathway-card {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 20px;
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            transition: all 0.2s ease;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.02);
          }

          @media (max-width: 1024px) {
            .pathway-grid { grid-template-columns: repeat(2, 1fr); }
          }

          /* MOBILE OPTIMIZATION: Dashboard Style */
          @media (max-width: 640px) {
            .pathway-grid { 
              grid-template-columns: repeat(2, 1fr); /* 2 columnas para ver más en menos espacio */
              gap: 0.75rem; 
            }
            .pathway-card {
              padding: 1rem;
              gap: 0.5rem;
              border-radius: 16px;
              align-items: flex-start;
              justify-content: space-between;
              min-height: 110px;
            }
            .pathway-icon-wrapper {
              width: 36px !important;
              height: 36px !important;
              background: linear-gradient(135deg, rgba(0,163,224,0.1) 0%, rgba(0,163,224,0.02) 100%) !important;
              border-radius: 10px !important;
            }
            .pathway-card h3 {
              font-size: 0.95rem !important;
              font-weight: 800 !important;
            }
            .pathway-count {
              display: block !important;
              font-size: 0.7rem;
              color: #94a3b8;
              font-weight: 600;
            }
            .pathway-card:active {
              transform: scale(0.96);
              background-color: #f1f5f9;
              border-color: #00A3E0;
            }
            /* Escondemos elementos de escritorio */
            .pathway-desc, .pep-tags, .btn-build { display: none !important; }
          }
        `}} />

        <div className="pathway-grid">
          {PATHWAYS.map((pathway, idx) => (
            <div
              key={idx}
              className="pathway-card"
              onClick={() => onSelectCategory(pathway.id)}
            >
              <div className="pathway-icon-wrapper" style={{
                width: '44px', height: '44px',
                backgroundColor: '#f1f5f9',
                color: '#00A3E0',
                borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {pathway.icon}
              </div>

              <div style={{ width: '100%' }}>
                <h3 style={{ fontSize: '1.15rem', margin: 0, color: '#0f172a', fontWeight: 800 }}>
                  {pathway.name}
                </h3>
                <span className="pathway-count" style={{ display: 'none' }}>
                  {pathway.count}
                </span>

                {/* Desktop Elements */}
                <p className="pathway-desc" style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.5rem', lineHeight: 1.4 }}>
                  Biological mechanism research.
                </p>
              </div>

              <button className="btn-build" style={{
                marginTop: 'auto', padding: '0.6rem', borderRadius: '10px',
                border: 'none', background: '#00A3E0', color: 'white',
                fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer'
              }}>
                Explore
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}