import Activity from "lucide-react/dist/esm/icons/activity";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import Info from "lucide-react/dist/esm/icons/info";
import Zap from "lucide-react/dist/esm/icons/zap";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import Clock from "lucide-react/dist/esm/icons/clock";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import ChevronUp from "lucide-react/dist/esm/icons/chevron-up";
import React, { useState } from 'react';









export default function ProtocolCompare({ variants, currentSelection, onSelectVariant }) {
  const [expandedRationale, setExpandedRationale] = useState({});

  if (!variants || !variants.standard) return null;

  const compareList = [
    { 
      id: 'standard', 
      label: 'Standard Clinical', 
      icon: <Activity size={24} />,
      guidance: 'Recommended for standard tolerance.',
      tags: ['Balanced Safety', 'Standard Ramp', 'Routine Monitoring'],
      rationale: {
        intro: 'This tempo follows a gradual escalation schedule designed to balance tolerability and therapeutic response.',
        interval: 'Every 4 weeks.',
        bestFor: ['First-time therapy', 'Standard tolerance', 'Moderate metabolic targets']
      },
      data: variants.standard, 
      color: 'var(--primary)', 
      bg: '#f0f9ff' 
    },
    { 
      id: 'aggressive', 
      label: 'Aggressive Escalation', 
      icon: <Zap size={24} />,
      guidance: 'Recommended for high-response targets.',
      tags: ['Rapid Peak', 'Fast Escalation', 'Close Monitoring'],
      rationale: {
        intro: 'Accelerated titration designed to reach steady-state therapeutic levels rapidly, requiring closer clinical observation.',
        interval: 'Every 2 weeks.',
        bestFor: ['Experienced patients', 'Time-sensitive goals', 'High therapeutic demand']
      },
      data: variants.aggressive, 
      color: '#991b1b', 
      bg: 'var(--color-danger-bg)' 
    },
    { 
      id: 'conservative', 
      label: 'Conservative Titration', 
      icon: <ShieldCheck size={24} />,
      guidance: 'Recommended for sensitive patients.',
      tags: ['Safety First', 'Micro-dosing', 'Minimal Side-effects'],
      rationale: {
        intro: 'Extended micro-dosing and delayed escalation to ensure maximum tolerability and minimize physiological stress.',
        interval: 'Every 6-8 weeks.',
        bestFor: ['Sensitive profiles', 'Complex co-morbidities', 'Long-term maintenance']
      },
      data: variants.conservative, 
      color: '#115e59', 
      bg: '#f0fdfa' 
    },
  ];

  const handleToggleRationale = (e, id) => {
    e.stopPropagation();
    setExpandedRationale(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="protocol-compare-container" style={{ 
      padding: '2.5rem', 
      backgroundColor: 'white', 
      borderRadius: '32px', 
      border: '1px solid var(--border)', 
      marginBottom: '0',
      boxShadow: '0 20px 50px rgba(0,0,0,0.04)'
    }}>
      <style>{`
        .model-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        @media (max-width: 1023px) {
          .model-grid {
            display: flex;
            flex-direction: column;
            padding: 1rem 0;
            margin: 0;
            gap: 1.25rem;
          }
          .model-card {
            width: 100%;
          }
        }

        .model-card {
          border: 2px solid transparent;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .model-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
          border-color: #E2E8F0;
        }

        .model-card.selected {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
        }

        .rationale-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #64748B;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: color 0.2s ease;
          user-select: none;
          padding: 0.5rem 0;
        }
        .rationale-toggle:hover {
          color: var(--primary);
        }

        .clinical-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background-color: #F1F5F9;
          color: #475569;
          margin-right: 0.4rem;
          margin-bottom: 0.4rem;
        }
      `}</style>

      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.75rem', color: 'var(--primary)', letterSpacing: '-0.02em' }}>Algorithm Selection</h3>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: 500, maxWidth: '700px', margin: '0 auto' }}>Select the titration strategy that best fits the clinical research objectives and patient tolerance profile.</p>
      </div>

      <div className="model-grid">
        {compareList.filter(v => v.data?.blueprint?.phases).map(variant => {
          const isSelected = currentSelection === variant.id;
          const isExpanded = !!expandedRationale[variant.id];
          const duration = variant.data.blueprint.phases.reduce((acc, p) => acc + (p.end_week - p.start_week + 1), 0);
          return (
            <div 
              key={variant.id}
              className={`model-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectVariant(variant.id)}
              style={{
                padding: '2rem',
                borderRadius: '24px',
                border: isSelected ? `2.5px solid ${variant.color}` : '2px solid #F1F5F9',
                backgroundColor: isSelected ? variant.bg : 'var(--color-bg-surface)',
                cursor: 'pointer',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ 
                  width: '56px', height: '56px', 
                  borderRadius: '16px', 
                  backgroundColor: isSelected ? 'white' : '#F1F5F9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isSelected ? variant.color : '#64748B',
                  boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                }}>
                  {variant.icon}
                </div>
                {isSelected ? (
                  <div style={{ backgroundColor: variant.color, borderRadius: '50%', padding: '6px', display: 'flex', boxShadow: `0 0 0 4px ${variant.color}20` }}>
                    <CheckCircle2 size={18} color="white" />
                  </div>
                ) : (
                   <div style={{ width: '24px', height: '24px', border: '2px solid #E2E8F0', borderRadius: '50%' }} />
                )}
              </div>

              <div>
                <h4 style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '1.25rem', marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>
                  {variant.label}
                </h4>
                <div style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  fontSize: '0.75rem', 
                  fontWeight: 800, 
                  color: variant.color,
                  backgroundColor: `${variant.color}15`,
                  padding: '4px 12px',
                  borderRadius: '100px',
                  textTransform: 'uppercase'
                }}>
                  <Clock size={12} /> {duration} Weeks
                </div>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: '0.5rem 0 0 0', fontWeight: 600, opacity: 0.8 }}>
                  Final logistics and tax calculations are applied at checkout.
                </p>
              </div>

              <div style={{ flexGrow: 1 }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 700, marginBottom: '1rem', lineHeight: 1.5 }}>
                  {variant.guidance}
                </p>
                {/* Visual Clinical Badges */}
                <div style={{ marginBottom: '1rem' }}>
                  {variant.tags.map(tag => (
                    <span key={tag} className="clinical-badge">{tag}</span>
                  ))}
                </div>

                <div 
                  className="rationale-toggle" 
                  onClick={(e) => handleToggleRationale(e, variant.id)}
                >
                  <Info size={16} /> 
                  Clinical rationale 
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>

                {isExpanded && (
                  <div style={{
                    marginTop: '0.75rem',
                    padding: '1.25rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    borderRadius: '12px',
                    border: '1px solid rgba(0,0,0,0.05)',
                    fontSize: '0.8rem',
                    color: 'var(--text-main)',
                    lineHeight: 1.6,
                    animation: 'fadeInSlideDown 0.3s ease-out',
                    cursor: 'default'
                  }} onClick={e => e.stopPropagation()}>
                    <p style={{ margin: '0 0 0.75rem 0', fontWeight: 500 }}>{variant.rationale.intro}</p>
                    <p style={{ margin: '0 0 0.75rem 0', fontWeight: 700 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Escalation interval:</span> {variant.rationale.interval}
                    </p>
                    <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Best suited for:</div>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', fontWeight: 500 }}>
                      {variant.rationale.bestFor.map(item => (
                        <li key={item} style={{ marginBottom: '0.25rem' }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

