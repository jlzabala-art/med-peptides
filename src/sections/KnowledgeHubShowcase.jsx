import Microscope from "lucide-react/dist/esm/icons/microscope";
import Pill from "lucide-react/dist/esm/icons/pill";
import BrainCircuit from "lucide-react/dist/esm/icons/brain-circuit";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import Zap from "lucide-react/dist/esm/icons/zap";
import React from 'react';






import { useNavigate } from 'react-router-dom';
import '../styles/knowledge_hub_showcase.css';

/* ─── Pillar definitions ────────────────────────────────────────────────────
   link   → correct app route (matched against App.jsx Route definitions)
   color  → pillar accent pulled from design tokens where possible
   ───────────────────────────────────────────────────────────────────────── */
const PILLARS = [
  {
    id: 'peptides',
    title: 'Peptide Research',
    subtitle: 'Molecular Precision',
    description:
      'High-purity amino acid sequences engineered for target receptor specificity. Explore advanced research compounds for metabolic and neurological pathways.',
    icon: <Microscope size={28} />,
    // secondary (#0096CC) expressed as hex so inline style can use opacity variants
    color: '#0096CC',
    colorSoft: 'rgba(0, 150, 204, 0.10)',
    features: ['≥98% Purity Verification', 'Cross-Lab CoA Validation', 'Specific Receptor Binding'],
    link: '/collection/peptides',          // ✅ matches Route path="/collection/:slug"
  },
  {
    id: 'supplements',
    title: 'Advanced Supplements',
    subtitle: 'Clinical Optimization',
    description:
      'Medical-grade micronutrients and adaptogens validated through peer-reviewed research. Focused on cellular energy, stress resilience, and hormonal health.',
    icon: <Pill size={28} />,
    // primary-light (#1A5EA8) for the second card
    color: '#1A5EA8',
    colorSoft: 'rgba(26, 94, 168, 0.10)',
    features: ['Bioavailable Formulations', 'Clinical-Grade Extracts', 'Evidence-Based Dosing'],
    link: '/collection/supplements',       // ✅ → SupplementCollectionPage
  },
];

export default function KnowledgeHubShowcase() {
  const navigate = useNavigate();

  return (
    <section className="khs-section">
      <div className="container khs-container">

        {/* Header */}
        <div className="khs-header">
          <div className="khs-eyebrow">
            <BrainCircuit size={13} /> The Knowledge Intelligence Hub
          </div>
          <h2 className="khs-title">
            Two Pillars of{' '}
            <span className="khs-gradient">Modern Research</span>
          </h2>
          <p className="khs-subtitle">
            An integrated ecosystem providing the scientific community with verified molecular
            compounds and clinical-grade supplementation protocols.
          </p>
        </div>

        {/* Cards */}
        <div className="khs-grid">
          {PILLARS.map((pillar) => (
            <div
              key={pillar.id}
              className={`khs-card khs-card--${pillar.id}`}
              onClick={() => navigate(pillar.link)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate(pillar.link)}
            >
              {/* Subtle top-glow accent — now light-mode friendly */}
              <div
                className="khs-card-glow"
                style={{
                  background: `radial-gradient(circle at 50% 0%, ${pillar.colorSoft} 0%, transparent 65%)`,
                }}
              />

              <div className="khs-card-content">
                <div
                  className="khs-icon-box"
                  style={{ color: pillar.color, backgroundColor: pillar.colorSoft }}
                >
                  {pillar.icon}
                </div>

                <div className="khs-card-text">
                  <span className="khs-card-subtitle">{pillar.subtitle}</span>
                  <h3 className="khs-card-title">{pillar.title}</h3>
                  <p className="khs-card-desc">{pillar.description}</p>
                </div>

                <div className="khs-features">
                  {pillar.features.map((feat, i) => (
                    <div key={i} className="khs-feature-item">
                      <ShieldCheck size={14} style={{ color: pillar.color }} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <button className="khs-button">
                  Explore {pillar.title} <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bridge — links to unified protocols */}
        <div className="khs-bridge">
          <div className="khs-bridge-icon">
            <Zap size={22} />
          </div>
          <div className="khs-bridge-content">
            <h4>Unified Protocol Intelligence</h4>
            <p>
              Our Clinical AI integrates both databases to generate comprehensive research
              protocols tailored to your goals.
            </p>
          </div>
          <button onClick={() => navigate('/collection/protocols')} className="khs-bridge-cta">
            View Protocols
          </button>
        </div>

      </div>
    </section>
  );
}