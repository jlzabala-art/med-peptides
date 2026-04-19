import { TrendingUp, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PeptideCard from '../components/common/PeptideCard';

const trendingPeptides = [
  {
    name: 'Tirzepatide',
    slug: 'tirzepatide',
    tag: 'Most Used',
    desc: 'A powerhouse dual GIP/GLP-1 receptor agonist revolutionizing metabolic research.',
    benefit: 'Highest Demand 2024-2025',
  },
  {
    name: 'BPC-157',
    slug: 'bpc-157',
    tag: 'Clinical Interest',
    desc: 'The gold standard for tissue repair and systemic regenerative experimentation.',
    benefit: 'Proven Research Stability',
  },
  {
    name: 'Semaglutide',
    slug: 'semaglutide',
    tag: 'Established Marker',
    desc: 'Long-acting GLP-1 analog with extensive analytical data available for researchers.',
    benefit: 'Reliable Metabolic Marker',
  },
  {
    name: 'Retatrutide',
    slug: 'retatrutide',
    tag: 'New Research',
    desc: 'Triple-agonist breakthrough targeting GIP, GLP-1, and Glucagon receptors.',
    benefit: 'Maximum Potency',
  },
];

export default function TrendingPeptides() {
  const navigate = useNavigate();

  return (
    <section className="peptide-section">
      <div className="container">
        <div className="peptide-section__header">
          <div className="peptide-section__label">
            <TrendingUp size={18} strokeWidth={2.5} /> Research Velocity
          </div>
          <h2 className="peptide-section__title">Trending Peptides</h2>
          <p className="peptide-section__subtitle">
            Most requested by clinical research teams.
          </p>
        </div>

        <div className="peptide-grid">
          {trendingPeptides.map((p) => (
            <PeptideCard
              key={p.slug}
              name={p.name}
              slug={p.slug}
              tag={p.tag}
              desc={p.desc}
              footerIcon={<Zap size={14} fill="var(--secondary)" />}
              footerText={p.benefit}
              mobileCTA="Ver Detalles"
              onClick={() => navigate(`/product/${p.slug}`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
