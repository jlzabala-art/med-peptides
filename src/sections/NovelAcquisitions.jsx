 
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
    dosage: 'Research phase',
  },
  {
    name: 'Retatrutide',
    slug: 'retatrutide',
    tag: 'New Arrival',
    desc: 'Triple-agonist breakthrough targeting GIP, GLP-1, and Glucagon receptors.',
    badge: 'Triple Agonist',
    dosage: '1–12 mg/week',
  },
  {
    name: 'Cagrilintide',
    slug: 'cagrilintide',
    tag: 'Enhanced Formula',
    desc: 'Long-acting amylin analog investigated for synergistic action in energy balance.',
    badge: 'Weight Research',
    dosage: '0.16–2.4 mg/week',
  },
  {
    name: 'NAD+',
    slug: 'nad',
    tag: 'Back in Stock',
    desc: 'Crucial cellular coenzyme essential for metabolic reactions and sirtuin function.',
    badge: 'Longevity Core',
    dosage: '500 mg–1 g/day',
  },
];

export default function NovelAcquisitions({ onSelectProduct }) {
  const navigate = useNavigate();

  const handleClick = (p) => {
    if (onSelectProduct) {
      onSelectProduct(p.name);
    } else {
      // Derive name-based slug to match ProductTemplate's resolver (not Firestore doc ID)
      const nameSlug = p.name ? p.name.toLowerCase().replace(/\s+/g, '-') : p.slug;
      navigate(`/product/${nameSlug}`);
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
              dosage={p.dosage}
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