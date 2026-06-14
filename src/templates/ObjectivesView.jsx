import Beaker from "lucide-react/dist/esm/icons/beaker";
import Activity from "lucide-react/dist/esm/icons/activity";
import Zap from "lucide-react/dist/esm/icons/zap";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import Brain from "lucide-react/dist/esm/icons/brain";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import Droplets from "lucide-react/dist/esm/icons/droplets";
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import Moon from "lucide-react/dist/esm/icons/moon";
/* eslint-disable no-unused-vars */










import { useEffect } from 'react';

const objectives = [
  {
    id: "Recovery & Repair",
    title: "Recovery & Repair",
    shortTitle: "Recovery",
    icon: Activity,
    description: "Scientific investigation into tissue regeneration, cellular repair mechanisms, and inflammatory modulation.",
    color: "var(--color-primary)"
  },
  {
    id: "Metabolic & Weight",
    title: "Metabolic & Weight",
    shortTitle: "Metabolic",
    icon: Zap,
    description: "Advanced research on metabolic pathways, energy expenditure, and peptide-mediated hormonal signaling.",
    color: "#f59e0b"
  },
  {
    id: "Longevity & Anti-Aging",
    title: "Longevity & Anti-Aging",
    shortTitle: "Longevity",
    icon: Sparkles,
    description: "Molecular studies regarding telomerase activity, DNA repair, and systemic physiological rejuvenation.",
    color: "#8b5cf6"
  },
  {
    id: "Cognitive & Mood",
    title: "Cognitive & Mood",
    shortTitle: "Cognitive",
    icon: Brain,
    description: "Inquiry into neurotrophic factors, neurotransmitter balance, and cognitive optimization through specialized reagents.",
    color: "#8b5cf6"
  },
  {
    id: "Sleep & Circadian",
    title: "Sleep & Circadian",
    shortTitle: "Sleep",
    icon: Moon,
    description: "Research into circadian rhythm regulation, sleep architecture, and restorative biological signaling.",
    color: "#6366f1"
  },
  {
    id: "Hormonal Optimization",
    title: "Hormonal Optimization",
    shortTitle: "Hormonal",
    icon: Droplets,
    description: "Exploration of GH axis support, endocrine signaling, and physiological balance in research models.",
    color: "var(--color-success)"
  },
  {
    id: "Immune Support",
    title: "Immune Support",
    shortTitle: "Immune",
    icon: ShieldCheck,
    description: "Research on immune modulation, inflammatory cytokines, and systemic defense mechanisms.",
    color: "var(--color-success)"
  },
  {
    id: "Research Supplies",
    title: "Research Supplies",
    shortTitle: "Supplies",
    icon: Beaker,
    description: "High-purity essential materials for standardized laboratory reconstitution and experimental procedures.",
    color: "var(--color-text-secondary)"
  },
  {
    id: "Other Research Peptides",
    title: "Other Research Peptides",
    shortTitle: "Other",
    icon: FlaskConical,
    description: "Specialized ligands and research-grade peptides for diverse scientific inquiry and developmental studies.",
    color: "#0f172a"
  }
];

export default function ObjectivesView({ 
  onSelectObjective, 
  onBack,
  region, setRegion,
  isProfessional,
  EXCHANGE_RATES
}) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="template-root" style={{ padding: 'clamp(2rem, 8vw, 6rem) 0 4rem 0', backgroundColor: 'var(--background)', minHeight: '100vh' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        /* ===== Desktop: Rich Cards ===== */
        .objectives-grid-desktop {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
        }
        .objective-card {
          background: white;
          border-radius: var(--radius-lg);
          padding: 2.5rem;
          box-shadow: var(--shadow-md);
          border: 1px solid var(--border);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          height: 100%;
          position: relative;
          overflow: hidden;
        }
        .objective-card:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-lg);
          border-color: var(--primary);
        }
        .objective-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: var(--objective-color);
          opacity: 0.8;
        }
        .icon-container {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
          transition: all 0.3s ease;
        }
        .objective-card:hover .icon-container {
          background: var(--objective-color) !important;
          color: white !important;
          transform: scale(1.1);
        }
        .learn-more-link {
          margin-top: auto;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--primary);
          font-weight: 600;
          font-size: 0.95rem;
          transition: gap 0.2s ease;
        }
        .objective-card:hover .learn-more-link {
          gap: 0.75rem;
        }

        /* ===== Mobile: Compact Grid ===== */
        .objectives-grid-mobile {
          display: none;
        }

        @media (max-width: 768px) {
          .objectives-grid-desktop {
            display: none;
          }
          .objectives-grid-mobile {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
          }
          .objective-tile {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            background: white;
            border-radius: 16px;
            padding: 1.25rem 0.75rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            border: 2px solid var(--border);
            cursor: pointer;
            transition: all 0.2s ease;
            gap: 0.6rem;
            -webkit-tap-highlight-color: transparent;
          }
          .objective-tile:active {
            transform: scale(0.96);
            border-color: var(--objective-color);
            box-shadow: 0 0 0 3px rgba(var(--objective-rgb), 0.15);
          }
          .tile-icon {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .tile-label {
            font-size: 0.8rem;
            font-weight: 700;
            color: var(--text-main);
            line-height: 1.2;
            letter-spacing: -0.01em;
          }
          .objectives-header-mobile h1 {
            font-size: 1.5rem !important;
            margin-bottom: 0.5rem !important;
          }
          .objectives-header-mobile p {
            font-size: 0.9rem !important;
          }
          .objectives-header-mobile .header-icon {
            display: none;
          }
        }

        /* Tablet tweaks */
        @media (min-width: 769px) and (max-width: 1024px) {
          .objectives-grid-desktop {
            grid-template-columns: repeat(2, 1fr);
          }
          .objective-card {
            padding: 1.75rem;
          }
        }
      `}} />

      <div className="container">
        <div className="objectives-header-mobile" style={{ textAlign: 'center', marginBottom: 'clamp(2rem, 5vw, 4rem)' }}>
          <div className="header-icon" style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '80px', 
            height: '80px', 
            backgroundColor: 'rgba(0, 75, 135, 0.05)', 
            borderRadius: '20px', 
            color: 'var(--primary)',
            marginBottom: '1.5rem'
          }}>
            <Beaker size={40} />
          </div>
          <h1 style={{ 
            fontSize: 'clamp(2rem, 5vw, 3rem)', 
            fontFamily: 'var(--font-heading)', 
            color: 'var(--primary)', 
            marginBottom: '1rem',
            fontWeight: 800
          }}>
            Research Pathways
          </h1>
          <p style={{ 
            maxWidth: '700px', 
            margin: '0 auto', 
            color: 'var(--text-muted)', 
            fontSize: '1.15rem',
            lineHeight: 1.6
          }}>
            Explore our curated research catalog organized by scientific focus. Each category represents a distinct therapeutic pathway for rigorous laboratory investigation.
          </p>
        </div>

        {/* ===== Desktop: Rich Cards ===== */}
        <div className="objectives-grid-desktop">
          {objectives
            .filter(obj => isProfessional || (obj.title !== 'Research Supplies' && obj.title !== 'Other Research Peptides'))
            .map(objective => {
            const rgb = objective.color === 'var(--color-primary)' ? '59, 130, 246' :
                        objective.color === '#f59e0b' ? '245, 158, 11' :
                        objective.color === '#8b5cf6' ? '139, 92, 246' :
                        objective.color === '#ec4899' ? '236, 72, 153' :
                        objective.color === 'var(--color-danger)' ? '239, 68, 68' :
                        objective.color === 'var(--color-success)' ? '16, 185, 129' :
                        objective.color === 'var(--color-text-secondary)' ? '100, 116, 139' : '15, 23, 42';

            return (
              <div 
                key={objective.id} 
                className="objective-card" 
                onClick={() => onSelectObjective(objective.id)}
                style={{ '--objective-color': objective.color, '--objective-rgb': rgb }}
              >
                <div className="icon-container" style={{ background: `rgba(${rgb}, 0.1)`, color: objective.color }}>
                  <objective.icon size={28} />
                </div>
                <h3 style={{ 
                  fontSize: '1.3rem', 
                  fontFamily: 'var(--font-heading)', 
                  marginBottom: '0.75rem', 
                  color: 'var(--text-main)',
                  fontWeight: 700
                }}>
                  {objective.title}
                </h3>
                <p style={{ 
                  color: 'var(--text-muted)', 
                  fontSize: '0.95rem', 
                  lineHeight: 1.5,
                  marginBottom: '1.5rem'
                }}>
                  {objective.description}
                </p>
                <div className="learn-more-link">
                  View Scientific Catalog <ArrowRight size={16} />
                </div>
              </div>
            );
          })}
        </div>

        {/* ===== Mobile: Compact Tile Grid ===== */}
        <div className="objectives-grid-mobile">
          {objectives
            .filter(obj => isProfessional || (obj.title !== 'Research Supplies' && obj.title !== 'Other Research Peptides'))
            .map(objective => {
            const rgb = objective.color === 'var(--color-primary)' ? '59, 130, 246' :
                        objective.color === '#f59e0b' ? '245, 158, 11' :
                        objective.color === '#8b5cf6' ? '139, 92, 246' :
                        objective.color === '#ec4899' ? '236, 72, 153' :
                        objective.color === 'var(--color-danger)' ? '239, 68, 68' :
                        objective.color === 'var(--color-success)' ? '16, 185, 129' :
                        objective.color === 'var(--color-text-secondary)' ? '100, 116, 139' : '15, 23, 42';

            return (
              <div 
                key={objective.id} 
                className="objective-tile" 
                onClick={() => onSelectObjective(objective.id)}
                style={{ '--objective-color': objective.color, '--objective-rgb': rgb }}
              >
                <div className="tile-icon" style={{ background: `rgba(${rgb}, 0.1)`, color: objective.color }}>
                  <objective.icon size={24} />
                </div>
                <span className="tile-label">{objective.shortTitle}</span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}