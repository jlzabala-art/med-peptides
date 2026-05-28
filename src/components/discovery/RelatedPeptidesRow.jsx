 
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { trackPeptideView } from '../../hooks/useAnalytics';

/**
 * RelatedPeptidesRow — Premium Card Grid / Carousel.
 * Switches to horizontal scroll on mobile and rich grid on desktop.
 * Designed for visual discovery and premium feel.
 */
export default function RelatedPeptidesRow({ peptides = [], allProducts = [], title = 'Related Research Peptides' }) {
  const navigate = useNavigate();
  if (!peptides.length) return null;

  const resolveProduct = (entry) =>
    allProducts?.find(
      (p) => p.name?.toLowerCase() === (entry.peptideName || entry.name)?.toLowerCase()
    ) || entry;

  const handleNav = (slug, name) => {
    if (slug) {
      trackPeptideView({
        peptide_id: slug,
        peptide_name: name
      });
      navigate(`/product/${slug}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="rp-section">
      <style dangerouslySetInnerHTML={{ __html: `
        .rp-section {
          margin-top: 4rem;
          padding-bottom: 2rem;
          position: relative;
        }
        
        .rp-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.75rem;
          padding: 0 0.5rem;
        }

        .rp-title-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .rp-eyebrow {
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--primary);
          opacity: 0.8;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .rp-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: -0.02em;
          margin: 0;
          font-family: var(--font-heading);
        }

        /* ── Grid Container ── */
        .rp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.25rem;
          padding: 0.5rem;
        }

        /* ── Card Design ── */
        .rp-card {
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.04);
          border-radius: 20px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
          position: relative;
          overflow: hidden;
          height: 100%;
          text-decoration: none;
          color: inherit;
        }

        .rp-card:hover {
          transform: translateY(-5px);
          border-color: rgba(0, 163, 224, 0.2);
          box-shadow: 
            0 20px 40px rgba(0, 54, 102, 0.08),
            0 8px 16px rgba(0, 54, 102, 0.04);
        }

        .rp-card-header {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .rp-image-box {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          flex-shrink: 0;
          border: 1px solid #f1f5f9;
          transition: transform 0.3s ease;
        }

        .rp-card:hover .rp-image-box {
          transform: scale(1.05);
          background: #fff;
          border-color: rgba(0, 163, 224, 0.1);
        }

        .rp-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .rp-name-box {
          flex: 1;
          min-width: 0;
        }

        .rp-name {
          font-size: 1.05rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          line-height: 1.2;
          font-family: var(--font-heading);
        }

        .rp-badge {
          display: inline-block;
          font-size: 0.6rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--primary);
          background: rgba(0, 163, 224, 0.06);
          padding: 0.15rem 0.5rem;
          border-radius: 6px;
          margin-top: 0.35rem;
        }

        .rp-desc {
          font-size: 0.85rem;
          line-height: 1.5;
          color: #64748b;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
        }

        .rp-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 0.5rem;
          padding-top: 1rem;
          border-top: 1px solid #f1f5f9;
        }

        .rp-action-text {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--primary);
          display: flex;
          align-items: center;
          gap: 0.35rem;
          opacity: 0;
          transform: translateX(-10px);
          transition: all 0.3s ease;
        }

        .rp-card:hover .rp-action-text {
          opacity: 1;
          transform: translateX(0);
        }

        .rp-arrow-circle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          transition: all 0.3s ease;
        }

        .rp-card:hover .rp-arrow-circle {
          background: var(--primary);
          color: white;
          transform: rotate(-45deg);
        }

        /* ── Mobile Carousel Adjustments ── */
        @media (max-width: 768px) {
          .rp-grid {
            display: flex;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            gap: 1rem;
            padding: 0.5rem 1rem 1.5rem;
            margin: 0 -1rem;
            -webkit-overflow-scrolling: touch;
          }
          .rp-grid::-webkit-scrollbar { display: none; }
          
          .rp-card {
            min-width: 280px;
            max-width: 280px;
            scroll-snap-align: center;
          }

          .rp-title { font-size: 1.25rem; }
          .rp-action-text { opacity: 1; transform: translateX(0); }
        }
      ` }} />

      <div className="rp-header">
        <div className="rp-title-group">
          <span className="rp-eyebrow">
            <Sparkles size={12} /> CLINICAL DISCOVERY
          </span>
          <h3 className="rp-title">{title}</h3>
        </div>
      </div>

      <div className="rp-grid">
        {peptides.map((entry, i) => {
          const p = resolveProduct(entry);
          const rawName = p.name || entry.peptideName || entry.name || '';
          const slug = p.slug || rawName.toLowerCase().replace(/[\s_]+/g, '-');
          const imagePath = p.image || `/assets/vials/${rawName.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`;

          let tagText = p.primaryTarget || p.category;
          if (!tagText && p.familyTags?.length > 0) tagText = p.familyTags[0].replace(/_/g, ' ');
          if (!tagText) tagText = 'Compound';

          const desc = p.shortDescription || (p.desc ? p.desc.substring(0, 100) + '…' : 'Research-grade analytical peptide.');

          return (
            <div
              key={slug || i}
              className="rp-card"
              onClick={() => handleNav(slug, rawName)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleNav(slug, rawName)}
            >
              <div className="rp-card-header">
                <div className="rp-image-box">
                  <img
                    src={imagePath}
                    alt={rawName}
                    className="rp-image"
                    onError={(e) => { e.target.src = '/assets/vials/generic-vial.png'; }}
                    loading="lazy"
                  />
                </div>
                <div className="rp-name-box">
                  <h4 className="rp-name">{rawName}</h4>
                  <span className="rp-badge">{tagText}</span>
                </div>
              </div>

              <p className="rp-desc">{desc}</p>

              <div className="rp-footer">
                <span className="rp-action-text">
                  View Specifications <ArrowRight size={12} />
                </span>
                <div className="rp-arrow-circle">
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
