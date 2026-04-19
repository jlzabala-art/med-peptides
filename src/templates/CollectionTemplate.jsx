import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Catalog from './Catalog';
import CategoryDetailView from './CategoryDetailView';

// Slug → exact category name mapping
const SLUG_TO_CATEGORY = {
  'healing-recovery': 'Healing & Recovery',
  'healing': 'Healing & Recovery',
  'recovery': 'Healing & Recovery',
  'weight-management-metabolic': 'Weight Management & Metabolic',
  'weight-management': 'Weight Management & Metabolic',
  'metabolic': 'Weight Management & Metabolic',
  'anti-aging-longevity': 'Anti-Aging & Longevity',
  'anti-aging': 'Anti-Aging & Longevity',
  'longevity': 'Anti-Aging & Longevity',
  'longevity-vitality': 'Anti-Aging & Longevity',
  'cognitive-neuro-protection': 'Cognitive & Neuro-Protection',
  'cognitive': 'Cognitive & Neuro-Protection',
  'neuro': 'Cognitive & Neuro-Protection',
  'muscle-growth-performance': 'Muscle Growth & Performance',
  'muscle': 'Muscle Growth & Performance',
  'performance': 'Muscle Growth & Performance',
  'hormonal-support': 'Hormonal Support',
  'hormonal': 'Hormonal Support',
  'research-supplies': 'Research Supplies',
  'other-research-peptides': 'Other Research Peptides',
};

/**
 * CollectionTemplate — route handler for /collection/:slug
 *
 * /collection/peptides  → full accordion Catalog (all categories)
 * /collection/all       → same
 * /collection/<cat>     → CategoryDetailView for that specific category
 */
export default function CollectionTemplate({
  region, isProfessional, isAdmin,
  cart, setCart, updateCart, setRegion,
  isCartOpen, setIsCartOpen,
  setPendingQuote,
  onOpenSearch,
  products,
  EXCHANGE_RATES,
  allFaqs,
  allMappings,
}) {
  const { slug } = useParams();
  const navigate = useNavigate();

  const handleProductSelect = (name) => {
    const target = (products || []).find(p => p.name === name);
    if (target?.slug) navigate(`/product/${target.slug}`);
    else if (target?.name) navigate(`/product/${target.name.toLowerCase().replace(/\s+/g, '-')}`);
  };

  const s = (slug || '').toLowerCase();
  // "peptides" / "all" / "pathways" → show the full accordion catalog
  if (!s || s === 'peptides' || s === 'all' || s === 'pathways' || s === 'investigation-pathways') {
    return (
      <Catalog
        region={region}
        setRegion={setRegion}
        isProfessional={isProfessional}
        cart={cart}
        setCart={setCart}
        updateCart={updateCart}
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        setPendingQuote={setPendingQuote}
        onOpenSearch={onOpenSearch || (() => {})}
        onSelectCategory={(cat) => navigate(`/collection/${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`)}
        onSelectProduct={handleProductSelect}
        EXCHANGE_RATES={EXCHANGE_RATES || {}}
        products={products || []}
      />
    );
  }

  // Specific category slug → CategoryDetailView
  const categoryName = SLUG_TO_CATEGORY[slug]
    || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <CategoryDetailView
      category={categoryName}
      products={products || []}
      region={region}
      isProfessional={isProfessional}
      cart={cart}
      updateCart={updateCart}
      setRegion={setRegion}
      EXCHANGE_RATES={EXCHANGE_RATES || {}}
      onBack={() => navigate(-1)}
      onSelectProduct={handleProductSelect}
      allFaqs={allFaqs}
      allMappings={allMappings}
    />
  );
}
