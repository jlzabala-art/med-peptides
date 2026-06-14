import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import MinusCircle from "lucide-react/dist/esm/icons/minus-circle";


import { trackPeptideView } from '../../hooks/useAnalytics';

/**
 * ComparePeptidesBlock — renders a comparison grid between a base peptide
 * and one or more alternatives, grouped by dimensions such as goal, family, format.
 */
export default function ComparePeptidesBlock({ block, allProducts = [], onProductClick }) {
  if (!block) return null;

  const { title, basePeptide, compareWith = [], compareBy = [], cta } = block;

  const candidates = [basePeptide, ...compareWith].slice(0, 4);
  const dimensions = compareBy.length > 0 ? compareBy : ['goal', 'family', 'format', 'route'];

  const findProduct = (name) =>
    allProducts?.find((p) => p.name?.toLowerCase() === name?.toLowerCase());

  return (
    <div
      style={{
        marginTop: '2.5rem',
        background: 'white',
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          background: 'var(--primary)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.08em', fontWeight: 700, opacity: 0.7, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            Peptide Comparison
          </p>
          <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: 'white' }}>
            {title || `Compare ${basePeptide}`}
          </h3>
        </div>
      </div>

      {/* Peptide Headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `180px repeat(${candidates.length}, 1fr)`,
          borderBottom: '1px solid var(--border)',
          background: 'var(--color-bg-app)',
        }}
      >
        <div style={{ padding: '0.85rem 1rem', fontWeight: 700, fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Dimension
        </div>
        {candidates.map((name, i) => (
          <div
            key={i}
            onClick={() => {
              const p = findProduct(name);
              if (p) {
                trackPeptideView({ peptide_name: p.name });
                onProductClick?.(p);
              }
            }}
            style={{
              padding: '0.85rem 1rem',
              textAlign: 'center',
              fontWeight: 700,
              fontSize: '0.88rem',
              color: i === 0 ? 'var(--primary)' : 'var(--text-main)',
              cursor: findProduct(name) ? 'pointer' : 'default',
              borderLeft: '1px solid var(--border)',
              backgroundColor: i === 0 ? 'rgba(0,43,77,0.06)' : 'transparent',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => {
              if (findProduct(name)) e.currentTarget.style.backgroundColor = 'rgba(0,43,77,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = i === 0 ? 'rgba(0,43,77,0.06)' : 'transparent';
            }}
          >
            {name}
          </div>
        ))}
      </div>

      {/* Rows */}
      {dimensions.map((dim, di) => (
        <div
          key={di}
          style={{
            display: 'grid',
            gridTemplateColumns: `180px repeat(${candidates.length}, 1fr)`,
            borderBottom: di < dimensions.length - 1 ? '1px solid var(--border)' : 'none',
            backgroundColor: di % 2 === 1 ? 'rgba(0,0,0,0.015)' : 'white',
          }}
        >
          <div
            style={{
              padding: '0.85rem 1rem',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'capitalize',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {dim.replace(/_/g, ' ')}
          </div>
          {candidates.map((name, ci) => {
            const product = findProduct(name);
            let cellValue = '–';

            if (product) {
              if (dim === 'goal' || dim === 'goal_tags') { const arr = Array.isArray(product.goalTags) ? product.goalTags : Array.isArray(product.goal_tags) ? product.goal_tags : []; cellValue = arr.map(t => String(t).replace(/_/g, ' ')).join(', ') || '–'; }
              else if (dim === 'family' || dim === 'family_tags') { const arr = Array.isArray(product.familyTags) ? product.familyTags : Array.isArray(product.family_tags) ? product.family_tags : []; cellValue = arr.map(t => String(t).replace(/_/g, ' ')).join(', ') || '–'; }
              else if (dim === 'format' || dim === 'formats') { const arr = Array.isArray(product.formats) ? product.formats : []; cellValue = arr.map(t => String(t).replace(/_or_/g, '/')).join(', ') || '–'; }
              else if (dim === 'route') cellValue = product.route?.replace(/_/g, ' ') || '–';
              else if (dim === 'visibility') cellValue = product.visibility || '–';
              else cellValue = product[dim] || '–';
            }

            return (
              <div
                key={ci}
                style={{
                  padding: '0.85rem 1rem',
                  textAlign: 'center',
                  fontSize: '0.82rem',
                  color: 'var(--text-main)',
                  borderLeft: '1px solid var(--border)',
                  backgroundColor: ci === 0 ? 'rgba(0,43,77,0.04)' : 'transparent',
                }}
              >
                {cellValue}
              </div>
            );
          })}
        </div>
      ))}

      {/* Footer CTA */}
      {cta && (
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', background: 'var(--color-bg-app)' }}>
          <button
            onClick={() => {
              const p = findProduct(basePeptide);
              if (p) {
                trackPeptideView({ peptide_name: p.name });
                onProductClick?.(p);
              }
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1.25rem',
              borderRadius: '999px',
              backgroundColor: 'var(--primary)',
              color: 'white',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <CheckCircle size={15} /> {cta}
          </button>
        </div>
      )}
    </div>
  );
}