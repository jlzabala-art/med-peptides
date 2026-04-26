import React, { useState, useEffect } from 'react';
import { TrendingUp, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PeptideCard from '../components/common/PeptideCard';
import { getCatalog } from '../repositories/productRepository';

// Static config: metadata + order for trending peptides
const TRENDING_CONFIG = [
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

export default function TrendingPeptides({ onSelectProduct }) {
  const navigate = useNavigate();
  // Map: lowercase product name → sorted dosage strings from Firestore
  const [dosageMap, setDosageMap] = useState({});
  const [dosageLoading, setDosageLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getCatalog()
      .then((catalog) => {
        if (cancelled) return;
        const map = {};
        catalog.forEach((product) => {
          const key = product.name?.toLowerCase();
          if (!key) return;
          // Collect unique, sorted dosage strings from all variants
          const dosages = [
            ...new Set(
              (product.variants ?? [])
                .map((v) => v.dosage || v.strength || null)
                .filter(Boolean)
            ),
          ].sort();
          // Fall back to product-level dosage if no variants
          if (!dosages.length && product.dosage) dosages.push(product.dosage);
          map[key] = dosages;
        });
        setDosageMap(map);
      })
      .catch((err) => console.error('[TrendingPeptides] dosage fetch:', err))
      .finally(() => { if (!cancelled) setDosageLoading(false); });

    return () => { cancelled = true; };
  }, []);

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
          {TRENDING_CONFIG.map((p) => {
            const dosages = dosageMap[p.name.toLowerCase()] ?? [];

            // Build a joined dosage string to pass to PeptideCard's existing
            // single-dosage prop, OR render multi-pill dosage inline.
            // We render a custom dosage element so all variants are visible.
            const dosageEl = dosageLoading ? (
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.1rem' }}>
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      height: '22px',
                      width: '70px',
                      borderRadius: '6px',
                      background: 'linear-gradient(90deg,rgba(0,163,224,0.08) 25%,rgba(0,163,224,0.15) 50%,rgba(0,163,224,0.08) 75%)',
                      backgroundSize: '300px 100%',
                      animation: 'proto-shimmer 1.4s infinite',
                    }}
                  />
                ))}
              </div>
            ) : dosages.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.1rem' }}>
                {dosages.slice(0, 5).map((d) => (
                  <span
                    key={d}
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.55rem',
                      borderRadius: '6px',
                      background: 'rgba(0,163,224,0.1)',
                      color: 'var(--primary)',
                      border: '1px solid rgba(0,163,224,0.2)',
                      letterSpacing: '0.02em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {d}
                  </span>
                ))}
                {dosages.length > 5 && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.55rem',
                      borderRadius: '6px',
                      background: 'rgba(0,0,0,0.04)',
                      color: '#6b7280',
                      border: '1px solid #e5e7eb',
                    }}
                  >
                    +{dosages.length - 5}
                  </span>
                )}
              </div>
            ) : null;

            return (
              <PeptideCard
                key={p.slug}
                name={p.name}
                slug={p.slug}
                tag={p.tag}
                desc={p.desc}
                dosageElement={dosageEl}
                footerIcon={<Activity size={14} fill="var(--secondary)" />}
                footerText={p.benefit}
                mobileCTA="Ver Detalles"
                onClick={() =>
                  onSelectProduct
                    ? onSelectProduct(p.name)
                    : navigate(`/product/${p.slug}`)
                }
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
