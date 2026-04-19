import { ArrowRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * RelatedPeptidesRow — Redesigned related peptide cards matching TrendingPeptides visuals.
 * Flexible minmax grid layout that adapts to any number of products without hardcoded breaks.
 */
export default function RelatedPeptidesRow({ peptides = [], allProducts = [], title = 'Related Peptides' }) {
  const navigate = useNavigate();
  if (!peptides.length) return null;

  const resolveProduct = (entry) => {
    return allProducts?.find(
      (p) => p.name?.toLowerCase() === (entry.peptideName || entry.name)?.toLowerCase()
    ) || entry;
  };

  return (
    <div style={{ marginTop: '2.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
          {title}
        </h3>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .related-card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 2rem;
        }
        .related-card-title {
          font-size: 1.5rem;
          color: #0f172a;
          margin-bottom: 0.5rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }
        .related-vial-img {
          width: 140px;
          height: 140px;
          object-fit: contain;
          margin: 0 auto 1.5rem auto;
          transition: transform 0.4s ease;
        }
        .related-hero-card:hover .related-vial-img {
          transform: scale(1.05) translateY(-5px);
        }
        @media (max-width: 1200px) {
          .related-card-grid {
            gap: 1.5rem;
          }
        }
        @media (max-width: 768px) {
          .related-card-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
          .related-card-grid::-webkit-scrollbar {
            display: none;
          }
          .related-hero-card {
            min-width: 260px;
            scroll-snap-align: start;
            padding: 1.5rem 1rem !important;
            gap: 1rem !important;
          }
          .related-card-tag, .related-card-desc, .related-card-benefit {
            display: none !important;
          }
          .related-card-title {
            font-size: 1.25rem !important;
            margin-bottom: 0.5rem !important;
            text-align: center;
          }
          .related-vial-img {
            width: 90px !important;
            height: 90px !important;
            margin: 0 auto 1rem auto !important;
          }
          .mobile-more-info {
            display: flex !important;
            align-items: center;
            justify-content: center;
            gap: 0.25rem;
            font-size: 0.8rem;
            font-weight: 700;
            color: var(--primary);
            margin-top: auto;
            background: rgba(0, 75, 135, 0.05);
            padding: 0.6rem;
            border-radius: 8px;
            width: 100%;
            transition: all 0.2s ease;
          }
          .related-hero-card:hover .mobile-more-info {
            background: var(--primary);
            color: white;
          }
        }
      ` }} />

      <div className="related-card-grid">
        {peptides.map((entry, i) => {
          const p = resolveProduct(entry);
          const rawName = p.name || entry.peptideName || entry.name || '';
          const derivedSlug = p.slug || rawName.toLowerCase().replace(/[\\s_]+/g, '-');
          const imagePath = p.image || `/assets/vials/${rawName.toLowerCase().replace(/[^a-z0-0]/g, '')}.png`;
          
          // Use primaryTarget, or category, or first family tag as badge
          let tagText = p.primaryTarget || p.category;
          if (!tagText && p.familyTags && p.familyTags.length > 0) {
            tagText = p.familyTags[0].replace(/_/g, ' ');
          }
          if (!tagText) tagText = "Scientific Compound";

          return (
            <div key={derivedSlug || i} 
              className="related-hero-card hvr-lift" 
              onClick={() => {
                if (derivedSlug) {
                  navigate(`/product/${derivedSlug}`);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              style={{ 
                padding: '2.5rem 2rem', 
                display: 'flex', 
                flexDirection: 'column', 
                backgroundColor: 'white',
                borderRadius: '24px',
                border: '1px solid #f1f5f9',
                transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
                boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div className="related-card-tag" style={{ 
                backgroundColor: 'rgba(0, 163, 224, 0.05)', 
                color: 'var(--primary)', 
                padding: '0.4rem 0.8rem', 
                borderRadius: '99px', 
                fontSize: '0.7rem', 
                fontWeight: 800, 
                alignSelf: 'center',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                {tagText}
              </div>
              
              <img 
                src={imagePath} 
                alt={p.name} 
                className="related-vial-img" 
                onError={(e) => { e.target.src = '/assets/vials/generic-vial.png' }}
                loading="lazy"
              />

              <div style={{ textAlign: 'center', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 className="related-card-title">{p.name || entry.peptideName}</h3>
                <p className="related-card-desc" style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '0', fontWeight: 400 }}>
                  {p.shortDescription || p.desc?.substring(0, 90) + '...'}
                </p>
                
                <div className="related-card-benefit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', color: 'var(--primary)', fontWeight: 800, fontSize: '0.85rem', marginTop: 'auto', paddingTop: '1.5rem' }}>
                  View Peptide <ArrowRight size={14} />
                </div>
              </div>

              <div className="mobile-more-info" style={{ display: 'none' }}>
                View Peptide <ArrowRight size={14} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
