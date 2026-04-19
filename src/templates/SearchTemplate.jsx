import React from 'react';
import { useNavigate } from 'react-router-dom';
import SearchModal from '../snippets/SearchModal';

/**
 * SearchTemplate wraps the Search view or modal for a dedicated /search route.
 */
export default function SearchTemplate({ products, allFaqs = [], allMappings = [], protocolIndex = [] }) {
  const navigate = useNavigate();

  return (
    <div style={{ paddingTop: '80px', minHeight: '80vh' }}>
      <SearchModal 
        isOpen={true} 
        onClose={() => navigate(-1)}
        onSelectProduct={(p) => {
          if (p?.slug) navigate(`/product/${p.slug}`);
          else if (p?.id) navigate(`/product/${p.id}`);
        }}
        products={products}
        allFaqs={allFaqs}
        allMappings={allMappings}
        protocolIndex={protocolIndex}
      />
    </div>
  );
}
