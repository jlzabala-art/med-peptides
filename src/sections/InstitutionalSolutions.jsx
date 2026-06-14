import Building2 from "lucide-react/dist/esm/icons/building-2";
import Pill from "lucide-react/dist/esm/icons/pill";
import Microscope from "lucide-react/dist/esm/icons/microscope";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import React from 'react';






export default function InstitutionalSolutions({ isProfessional, onSelectCategory }) {
  if (!isProfessional) return null;

  const solutions = [
    {
      id: 'clinics',
      icon: <Building2 size={32} />,
      title: 'Medical Clinics',
      description: 'Scale your practice with precision patient tracking and protocols.',
      cta: 'Clinic Programs',
      category: 'Research Pathways'
    },
    {
      id: 'pharmacies',
      icon: <Pill size={32} />,
      title: 'Institutional Pharmacies',
      description: 'Direct-to-patient institutional supply and fulfillment.',
      cta: 'Supply Chain',
      category: 'Research Pathways'
    },
    {
      id: 'researchers',
      icon: <Microscope size={32} />,
      title: 'Research Labs',
      description: 'Analytical materials and custom synthesis for advanced research.',
      cta: 'Lab Synthesis',
      category: 'Research Pathways'
    }
  ];

  return (
    <section className="institutional-section" style={{ 
      padding: '6rem 0', 
      backgroundColor: 'var(--color-bg-app)',
      borderTop: '1px solid rgba(0,0,0,0.05)'
    }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
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
              padding: '0.5rem 1.25rem',
              borderRadius: '100px',
              border: '1px solid rgba(0, 163, 224, 0.2)'
            }}>
              <ShieldCheck size={18} /> Institutional Logistics
            </div>
            <h2 style={{ 
              fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', 
              color: '#0f172a', 
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              Precision Solutions <span style={{ color: 'var(--secondary)' }}>at Scale</span>
            </h2>
        </div>

        <div className="solutions-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {solutions.map((solution) => (
            <div key={solution.id} className="solution-card" style={{
              backgroundColor: 'white',
              borderRadius: '40px',
              padding: '3.5rem 2.5rem',
              boxShadow: '0 20px 50px rgba(15, 23, 42, 0.05)',
              border: '1px solid rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              height: '100%',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ 
                color: 'var(--secondary)', 
                marginBottom: '2.5rem',
                backgroundColor: 'rgba(0, 163, 224, 0.08)',
                width: '80px',
                height: '80px',
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {solution.icon}
              </div>
              <h3 style={{ 
                fontSize: '1.85rem', 
                color: '#0f172a', 
                marginBottom: '1.25rem', 
                fontWeight: 800,
                letterSpacing: '-0.01em'
              }}>
                {solution.title}
              </h3>
              <p style={{ 
                fontSize: '1.15rem', 
                color: 'var(--color-text-secondary)', 
                lineHeight: 1.6, 
                marginBottom: '3rem',
                flexGrow: 1
              }}>
                {solution.description}
              </p>

              <button 
                onClick={() => onSelectCategory(solution.category)}
                style={{ 
                  padding: '1.15rem 2rem', 
                  fontSize: '1.05rem', 
                  fontWeight: 800, 
                  backgroundColor: '#0f172a', 
                  color: 'white',
                  borderRadius: '16px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  transition: 'all 0.3s ease',
                  width: '100%'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--secondary)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#0f172a';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {solution.cta} <ArrowRight size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .solution-card:hover {
          transform: translateY(-12px);
          box-shadow: 0 40px 80px rgba(15, 23, 42, 0.12) !important;
          border-color: rgba(0, 163, 224, 0.3) !important;
        }
        @media (max-width: 768px) {
          .institutional-section { padding: 4rem 1rem !important; }
          .solutions-grid { grid-template-columns: 1fr !important; }
          .solution-card { padding: 2.5rem 2rem !important; }
        }
      `}} />
    </section>
  );
}