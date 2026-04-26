import React from 'react';
import { Activity, Clock, Target, ChevronRight } from 'lucide-react';

const featuredCategories = [
  {
    name: "Weight & Metabolic", // Nombre más corto para mobile
    fullName: "Weight Management & Metabolic",
    desc: "Next-generation metabolic regulators and agonists.",
    icon: <Activity size={26} />,
    color: "#10B981",
    colorBg: "rgba(16, 185, 129, 0.1)",
    colorBorder: "rgba(16, 185, 129, 0.3)"
  },
  {
    name: "Anti-Aging",
    fullName: "Anti-Aging & Longevity",
    desc: "Cellular rejuvenation and longevity research.",
    icon: <Clock size={26} />,
    color: "#8B5CF6",
    colorBg: "rgba(139, 92, 246, 0.1)",
    colorBorder: "rgba(139, 92, 246, 0.3)"
  },
  {
    name: "Cognitive",
    fullName: "Cognitive & Neuro-Protection",
    desc: "Nootropic potentials and neuroprotective models.",
    icon: <Target size={26} />,
    color: "#F59E0B",
    colorBg: "rgba(245, 158, 11, 0.1)",
    colorBorder: "rgba(245, 158, 11, 0.3)"
  }
];

export default function FeaturedCategories({ onSelectCategory }) {
  return (
    <section className="fc-container" style={{ position: 'relative', zIndex: 10, marginTop: '-40px' }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        .fc-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border-radius: 28px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          max-width: 1200px;
          margin: 0 auto;
        }
        .fc-card {
          padding: 1.75rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .fc-card:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-5px);
          border-color: var(--card-border);
        }
        
        @media (max-width: 900px) {
          .fc-grid { grid-template-columns: repeat(2, 1fr); }
        }

        /* MOBILE OPTIMIZED: HORIZONTAL SCROLL */
        @media (max-width: 640px) {
          .fc-container {
             padding: 0 0 1rem 1rem !important; /* Padding lateral para que el scroll empiece pegado */
             margin-top: -30px !important;
          }
          .fc-grid {
            display: flex !important;
            overflow-x: auto !important;
            scroll-snap-type: x mandatory;
            background: transparent !important; /* Quitamos el fondo del contenedor */
            border: none !important;
            box-shadow: none !important;
            backdrop-filter: none !important;
            padding: 1rem 1rem 1rem 0 !important;
            gap: 1rem;
            -webkit-overflow-scrolling: touch;
          }
          .fc-grid::-webkit-scrollbar { display: none; } /* Ocultar scrollbar */

          .fc-card {
            min-width: 260px; /* Ancho fijo para el scroll */
            scroll-snap-align: start;
            background: rgba(255, 255, 255, 0.05) !important;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            padding: 1.5rem;
          }
          .fc-card:active {
            transform: scale(0.97);
            background: rgba(255, 255, 255, 0.1) !important;
          }
        }
      `}} />

      {/* Fase 3: swipe hint visible solo en mobile */}
      <div className="fc-swipe-hint">
        Desliza para ver más →
      </div>

      <div className="fc-grid">
        {featuredCategories.map((cat) => (
          <div
            key={cat.name}
            className="fc-card"
            onClick={() => onSelectCategory(cat.fullName)}
            style={{ '--card-border': cat.colorBorder }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{
                width: '48px', height: '48px',
                borderRadius: '12px',
                background: cat.colorBg,
                border: `1px solid ${cat.colorBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: cat.color
              }}>
                {cat.icon}
              </div>
              {/* Icono sutil para mobile indicando acción */}
              <ChevronRight size={18} className="mobile-only" style={{ color: 'rgba(255,255,255,0.2)', marginTop: '5px' }} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.4rem 0', color: 'white', letterSpacing: '-0.01em' }}>
                <span className="desktop-only">{cat.fullName}</span>
                <span className="mobile-only">{cat.name}</span>
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.5 }}>
                {cat.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}