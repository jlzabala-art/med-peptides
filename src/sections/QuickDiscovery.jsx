import React from 'react';
import { FlaskConical, Layers, BookOpen, Beaker, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DISCOVERY_CARDS = [
  {
    id: 'peptides',
    icon: FlaskConical,
    title: 'Browse Peptides',
    description: 'Explore our full catalog of research-grade peptides with clinical data.',
    color: '#00A3E0',
    bg: 'rgba(0,163,224,0.08)',
    border: 'rgba(0,163,224,0.18)',
    route: '/peptides',
  },
  {
    id: 'protocols',
    icon: Layers,
    title: 'Browse Protocols',
    description: 'Pre-built clinical protocols designed by research specialists.',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.18)',
    route: '/protocols',
  },
  {
    id: 'knowledge',
    icon: BookOpen,
    title: 'Clinical Knowledge',
    description: 'Evidence-based guides, dosing references, and clinical literature.',
    color: '#A78BFA',
    bg: 'rgba(167,139,250,0.08)',
    border: 'rgba(167,139,250,0.18)',
    route: '/knowledge',
  },
  {
    id: 'reconstitution',
    icon: Beaker,
    title: 'Reconstitution Guides',
    description: 'Step-by-step reconstitution protocols for every compound.',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.18)',
    route: '/guides',
  },
];

export default function QuickDiscovery() {
  const navigate = useNavigate();

  return (
    <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1.25rem', background: 'var(--background, #0A0F1E)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#00A3E0', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Quick Access
          </p>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, color: 'var(--text-primary, #fff)', letterSpacing: '-0.01em' }}>
            Start Your Discovery
          </h2>
        </div>

        {/* Cards grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '1.25rem',
        }}>
          {DISCOVERY_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => navigate(card.route)}
                style={{
                  background: card.bg,
                  border: `1.5px solid ${card.border}`,
                  borderRadius: '16px',
                  padding: '1.75rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.22s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 16px 40px ${card.bg}`;
                  e.currentTarget.style.borderColor = card.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = card.border;
                }}
              >
                {/* Icon */}
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: `${card.color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={22} color={card.color} strokeWidth={1.8} />
                </div>

                {/* Text */}
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary, #fff)', marginBottom: '0.4rem' }}>
                    {card.title}
                  </div>
                  <div style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.50)', lineHeight: 1.55 }}>
                    {card.description}
                  </div>
                </div>

                {/* Arrow */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: card.color, fontSize: '0.82rem', fontWeight: 600, marginTop: 'auto' }}>
                  Explore <ArrowRight size={14} strokeWidth={2.5} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
