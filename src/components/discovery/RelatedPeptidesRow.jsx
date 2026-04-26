import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * RelatedPeptidesRow — Compact list format.
 * Each row: thumbnail | name + category | short description | arrow link.
 * Preserves all product info while using minimal vertical space.
 */
export default function RelatedPeptidesRow({ peptides = [], allProducts = [], title = 'Related Peptides' }) {
  const navigate = useNavigate();
  if (!peptides.length) return null;

  const resolveProduct = (entry) =>
    allProducts?.find(
      (p) => p.name?.toLowerCase() === (entry.peptideName || entry.name)?.toLowerCase()
    ) || entry;

  const handleNav = (slug) => {
    if (slug) {
      navigate(`/product/${slug}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div style={{ marginTop: '2.5rem' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .rp-list-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: -0.02em;
          margin: 0 0 1rem 0;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          color: #94a3b8;
        }
        .rp-list {
          display: flex;
          flex-direction: column;
          gap: 0;
          border: 1px solid #f1f5f9;
          border-radius: 16px;
          overflow: hidden;
          background: white;
        }
        .rp-list-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.85rem 1rem;
          cursor: pointer;
          transition: background 0.15s ease;
          border-bottom: 1px solid #f8fafc;
          text-decoration: none;
          color: inherit;
        }
        .rp-list-item:last-child {
          border-bottom: none;
        }
        .rp-list-item:hover {
          background: #f8fafc;
        }
        .rp-list-item:hover .rp-arrow {
          transform: translateX(3px);
          color: var(--primary);
        }
        .rp-thumb {
          width: 40px;
          height: 40px;
          object-fit: contain;
          flex-shrink: 0;
          border-radius: 8px;
          background: #f8fafc;
          padding: 4px;
        }
        .rp-info {
          flex: 1;
          min-width: 0;
        }
        .rp-name {
          font-size: 0.9rem;
          font-weight: 700;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin: 0;
          line-height: 1.3;
        }
        .rp-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.2rem;
          flex-wrap: nowrap;
          overflow: hidden;
        }
        .rp-badge {
          font-size: 0.6rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: var(--primary);
          background: rgba(0, 163, 224, 0.08);
          padding: 0.15rem 0.5rem;
          border-radius: 99px;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .rp-desc {
          font-size: 0.78rem;
          color: #94a3b8;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin: 0;
        }
        .rp-arrow {
          flex-shrink: 0;
          color: #cbd5e1;
          transition: transform 0.2s ease, color 0.2s ease;
        }
        @media (max-width: 600px) {
          .rp-desc { display: none; }
          .rp-list-item { gap: 0.75rem; padding: 0.75rem; }
        }
      ` }} />

      <h3 className="rp-list-title">{title}</h3>

      <div className="rp-list">
        {peptides.map((entry, i) => {
          const p = resolveProduct(entry);
          const rawName = p.name || entry.peptideName || entry.name || '';
          const slug = p.slug || rawName.toLowerCase().replace(/[\s_]+/g, '-');
          const imagePath = p.image || `/assets/vials/${rawName.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`;

          let tagText = p.primaryTarget || p.category;
          if (!tagText && p.familyTags?.length > 0) tagText = p.familyTags[0].replace(/_/g, ' ');
          if (!tagText) tagText = 'Compound';

          const desc = p.shortDescription || (p.desc ? p.desc.substring(0, 80) + '…' : '');

          return (
            <div
              key={slug || i}
              className="rp-list-item"
              onClick={() => handleNav(slug)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleNav(slug)}
              aria-label={`View ${rawName}`}
            >
              <img
                src={imagePath}
                alt={rawName}
                className="rp-thumb"
                onError={(e) => { e.target.src = '/assets/vials/generic-vial.png'; }}
                loading="lazy"
              />

              <div className="rp-info">
                <p className="rp-name">{rawName}</p>
                <div className="rp-meta">
                  <span className="rp-badge">{tagText}</span>
                  {desc && <p className="rp-desc">{desc}</p>}
                </div>
              </div>

              <ArrowRight size={16} className="rp-arrow" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
