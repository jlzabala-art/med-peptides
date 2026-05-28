 
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
import SearchModal from '../snippets/SearchModal';

/**
 * SearchTemplate wraps the Search view or modal for a dedicated /search route.
 * Supplement objects (not present in the peptide products array) are routed to
 * /supplements/:slug; everything else goes to /product/:slug.
 */
export default function SearchTemplate({ products = [], allFaqs = [], protocolIndex = [], isLoading = false }) {
  const navigate = useNavigate();

  usePageMeta({
    title: 'Search Compounds, Protocols & FAQs',
    description: 'Use our high-performance clinical search engine to find research peptides, scientific protocols, premium supplements, and FAQs.',
    path: '/search',
  });

  const ROUTE_MAP = {
    supplement: (slug) => `/supplements/${slug}`,
    peptide:    (slug) => `/product/${slug}`,
  };

  const handleSelect = (p) => {
    if (!p) return;
    const slug = p.slug || p.id || (p.name && p.name.toLowerCase().replace(/\s+/g, '-'));
    if (!slug) return;

    // Primary: productType stamped by repository
    const routeFn = ROUTE_MAP[p.productType] || ROUTE_MAP[p.type];
    if (routeFn) { navigate(routeFn(slug)); return; }

    // Fallback: array-lookup for objects without productType
    const isKnownPeptide = products.some(
      (pr) => pr.id === p.id || pr.slug === slug || pr.name === p.name
    );
    navigate(isKnownPeptide ? `/product/${slug}` : `/supplements/${slug}`);
  };

  return (
    <div style={{ paddingTop: '80px', minHeight: '80vh' }}>
      <SearchModal 
        isOpen={true} 
        onClose={() => navigate(-1)}
        onSelectProduct={handleSelect}
        products={products}
        allFaqs={allFaqs}
        protocolIndex={protocolIndex}
        isLoading={isLoading}
      />
    </div>
  );
}
