/* eslint-disable no-unused-vars */
import React from 'react';
import { useFirestoreData } from '../hooks/useFirestoreData';
import { useParams, useNavigate } from 'react-router-dom';
import Catalog from './Catalog';
import CategoryDetailView from './CategoryDetailView';
import Breadcrumbs from '../components/common/Breadcrumbs';
import PeptideCollectionPage from './PeptideCollectionPage';
import ProtocolCollectionPage from './ProtocolCollectionPage';
import SupplementCollectionPage from './SupplementCollectionPage';
import SuppliesView from './SuppliesView';
import RestrictedCatalogRoute from '../components/auth/RestrictedCatalogRoute';


// Slug → exact category name mapping
const SLUG_TO_CATEGORY = {
  'recovery-repair': 'Recovery & Repair',
  'recovery': 'Recovery & Repair',
  'healing': 'Recovery & Repair',
  'healing-recovery': 'Recovery & Repair',
  'metabolic-weight': 'Metabolic & Weight',
  'metabolic': 'Metabolic & Weight',
  'weight-management': 'Metabolic & Weight',
  'weight-management-metabolic': 'Metabolic & Weight',
  'longevity-anti-aging': 'Longevity & Anti-Aging',
  'longevity': 'Longevity & Anti-Aging',
  'anti-aging': 'Longevity & Anti-Aging',
  'cognitive-mood': 'Cognitive & Mood',
  'cognitive': 'Cognitive & Mood',
  'neuro': 'Cognitive & Mood',
  'cognitive-neuro-protection': 'Cognitive & Mood',
  'hormonal-optimization': 'Hormonal Optimization',
  'hormonal': 'Hormonal Optimization',
  'hormonal-support': 'Hormonal Optimization',
  'muscle': 'Hormonal Optimization',
  'muscle-growth-performance': 'Hormonal Optimization',
  'sleep-circadian': 'Sleep & Circadian',
  'sleep': 'Sleep & Circadian',
  'immune-support': 'Immune Support',
  'immune': 'Immune Support',
  'research-supplies': 'Research Supplies',
  'other-research-peptides': 'Other Research Peptides',
  'hormone-pellets': 'Hormone Pellets',
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
  toggleCompare,
  isCartOpen, setIsCartOpen,
  setPendingQuote,
  onOpenSearch,
  products,
  EXCHANGE_RATES,
}) {
  const { allFaqs } = useFirestoreData();
  const { slug } = useParams();
  const navigate = useNavigate();

  const handleProductSelect = (name) => {
    const target = (products || []).find(p => p.name === name);
    if (target?.slug) navigate(`/product/${target.slug}`);
    else if (target?.name) navigate(`/product/${target.name.toLowerCase().replace(/\s+/g, '-')}`);
  };

  const s = (slug || '').toLowerCase();

  // /collection/peptides → dedicated full-page collection
  if (s === 'peptides') {
    return (
      <RestrictedCatalogRoute catalogName="products">
        <PeptideCollectionPage
          onNavigate={(productSlug) => navigate(`/product/${productSlug}`)}
          onBack={() => navigate(-1)}
          toggleCompare={toggleCompare}
        />
      </RestrictedCatalogRoute>
    );
  }

  // /collection/protocols → protocol library
  if (s === 'protocols') {
    return (
      <RestrictedCatalogRoute catalogName="protocols">
        <ProtocolCollectionPage
          onNavigate={(slug) => navigate(`/protocol/${slug}`)}
          onBack={() => navigate(-1)}
        />
      </RestrictedCatalogRoute>
    );
  }

  // /collection/supplements → supplement catalog
  if (s === 'supplements') {
    return (
      <RestrictedCatalogRoute catalogName="products">
        <SupplementCollectionPage
          onNavigate={(supplementSlug) => navigate(`/supplements/${supplementSlug}`)}
          onBack={() => navigate(-1)}
          toggleCompare={toggleCompare}
        />
      </RestrictedCatalogRoute>
    );
  }

  // /collection/research-supplies → research supplies catalog
  if (s === 'research-supplies') {
    return (
      <RestrictedCatalogRoute catalogName="apis">
        <SuppliesView
          onBack={() => navigate(-1)}
          onSelectProduct={handleProductSelect}
          updateCart={updateCart}
          cart={cart}
          region={region}
          setRegion={setRegion}
          isProfessional={isProfessional}
          EXCHANGE_RATES={EXCHANGE_RATES || {}}
          products={products || []}
        />
      </RestrictedCatalogRoute>
    );
  }

  // "all" / "pathways" → show the legacy full accordion catalog
  if (!s || s === 'all' || s === 'pathways' || s === 'investigation-pathways') {
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

  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Catalog', path: '/collection/peptides' },
    { label: categoryName }
  ];

  return (
    <div className="template-root">
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        <Breadcrumbs items={breadcrumbItems} />
      </div>
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
      />
    </div>
  );
}
