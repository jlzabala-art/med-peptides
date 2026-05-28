 
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ComparePeptidesModal from '../components/discovery/ComparePeptidesModal';

/**
 * CompareTemplate provides a dedicated comparison view via routes.
 * URL Pattern: /compare/:slug1/:slug2
 */
export default function CompareTemplate({ products }) {
  const { slug1, slug2 } = useParams();
  const navigate = useNavigate();

  // Find products by slug
  const p1 = products?.find(p => p.slug === slug1);
  const p2 = products?.find(p => p.slug === slug2);

  // If one product is missing, handle fallback (handled globally in Phase 3)
  const toCompare = [];
  if (p2) toCompare.push(p2);

  return (
    <div style={{ minHeight: '80vh', backgroundColor: 'var(--background)' }}>
      <div className="container">
        <button 
          className="btn-text" 
          onClick={() => navigate(-1)}
          style={{ margin: '2rem 0', color: 'var(--text-muted)' }}
        >
          ← Back
        </button>
      </div>

      {p1 ? (
        <ComparePeptidesModal 
          isOpen={true}
          onClose={() => navigate(-1)}
          baseProduct={p1}
          comparedProducts={toCompare}
        />
      ) : (
        <div className="container">
          <h2 style={{ color: 'var(--primary)' }}>Product not found for comparison.</h2>
        </div>
      )}
    </div>
  );
}
