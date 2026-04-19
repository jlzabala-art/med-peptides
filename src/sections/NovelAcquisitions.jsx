import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PeptideCard from '../components/common/PeptideCard';

const newPeptides = [
  {
    name: 'SLU PP-332',
    slug: 'slu-pp-332',
    tag: 'Latest Release',
    desc: 'Novel ERR agonist simulating structural metabolic adaptations similar to endurance training.',
    badge: 'New Arrival',
  },
  {
    name: 'Retatrutide',
    slug: 'retatrutide',
    tag: 'New Arrival',
    desc: 'Triple-agonist breakthrough targeting GIP, GLP-1, and Glucagon receptors.',
    badge: 'Triple Agonist',
  },
  {
    name: 'Cagrilintide',
    slug: 'cagrilintide',
    tag: 'Enhanced Formula',
    desc: 'Long-acting amylin analog investigated for synergistic action in energy balance.',
    badge: 'Weight Research',
  },
  {
    name: 'NAD+',
    slug: 'nad',
    tag: 'Back in Stock',
    desc: 'Crucial cellular coenzyme essential for metabolic reactions and sirtuin function.',
    badge: 'Longevity Core',
  },
];

export default function NovelAcquisitions({ onSelectProduct }) {
  const navigate = useNavigate();

  const handleClick = (p) => {
    if (onSelectProduct) {
      onSelectProduct(p.name);
    } else {
      navigate(`/product/${p.slug}`);
    }
  };

  return (
    <section className="peptide-section">
      <div className="container">
        <div className="peptide-section__header">
          <div className="peptide-section__label">
            <Sparkles size={18} strokeWidth={2.5} /> Experimental Frontiers
          </div>
          <h2 className="peptide-section__title">Novel Acquisitions</h2>
          <p className="peptide-section__subtitle">
            Newly introduced peptides based on emerging research interest.
          </p>
        </div>

        <div className="peptide-grid">
          {newPeptides.map((p) => (
            <PeptideCard
              key={p.slug}
              name={p.name}
              slug={p.slug}
              tag={p.tag}
              desc={p.desc}
              footerIcon={<Sparkles size={14} fill="var(--secondary)" />}
              footerText={p.badge}
              mobileCTA="Research Data"
              onClick={() => handleClick(p)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}