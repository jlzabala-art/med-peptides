/* eslint-disable no-unused-vars */
import React from 'react';
import { useFirestoreData } from '../hooks/useFirestoreData';
import { useParams, useRouter, usePathname } from 'next/navigation';
import Catalog from './Catalog';
import CategoryDetailView from './CategoryDetailView';
import Breadcrumbs from '../components/common/Breadcrumbs';
import PeptideCollectionPage from './PeptideCollectionPage';
import ProtocolCollectionPage from './ProtocolCollectionPage';
import SupplementCollectionPage from './SupplementCollectionPage';
import SuppliesView from './SuppliesView';
import RestrictedCatalogRoute from '../components/auth/RestrictedCatalogRoute';
import BrandCollectionPage from './BrandCollectionPage';
import ClinicalPortfolioSuiteSwitcher from '../components/navigation/ClinicalPortfolioSuiteSwitcher';
import PublicUnifiedHeader from '../components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '../components/shared/PublicUnifiedFooter';
import PublicStickyActionBar from '../components/shared/PublicStickyActionBar';
import UnifiedOrderDrawer from '../components/orders/UnifiedOrderDrawer';


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
  slug: propSlug,
}) {
  const { allFaqs } = useFirestoreData();
  const params = useParams();
  const slug = propSlug || params?.slug;
  const router = useRouter();

  const handleProductSelect = (name) => {
    const target = (products || []).find(p => p.name === name || p.title === name || p.id === name || p.slug === name);
    if (target?.slug) router.push(`/p/${target.slug}`);
    else if (target?.id) router.push(`/p/${target.id}`);
    else if (target?.name) router.push(`/p/${target.name.toLowerCase().replace(/\s+/g, '-')}`);
  };

  const s = (slug || '').toLowerCase();

  // /collection/peptides → Google Cloud UX BrandCollectionPage (Lotusland Peptides Collection)
  if (s === 'peptides') {
    return (
      <RestrictedCatalogRoute catalogName="products">
        <BrandCollectionPage
          brandSlug="peptides"
          products={products || []}
          onSelectProduct={handleProductSelect}
          updateCart={updateCart}
          toggleCompare={toggleCompare}
        />
      </RestrictedCatalogRoute>
    );
  }

  // /collection/protocols → redirect to official /proto directory
  if (s === 'protocols' || s === 'protocol') {
    if (typeof window !== 'undefined') {
      router.replace('/proto');
    }
    return null;
  }

  // /collection/supplements → supplement catalog
  if (s === 'supplements') {
    return (
      <RestrictedCatalogRoute catalogName="products">
        <PublicUnifiedHeader
          track="products"
          lang="en"
          copyUrl="https://www.atlashealth-services.com/collection/supplements"
          shortUrl="https://www.atlashealth-services.com/collection/supplements"
          brandHref="/c/CAT-MU9L9GBN"
          brandTitle="Atlas Health Services Clinical & Healthcare Intelligence"
          hideTier2={true}
          hideAccountManager={true}
          hideAiButton={true}
        />
        <ClinicalPortfolioSuiteSwitcher currentSlug="supplements" />
        <SupplementCollectionPage
          onNavigate={(supplementSlug) => router.push(`/supplements/${supplementSlug}`)}
          onBack={() => router.back()}
          toggleCompare={toggleCompare}
        />
        <PublicUnifiedFooter lang="en" />
        <PublicStickyActionBar
          title="Clinical Supplements & Longevity Formulations"
          subtitle="Therapeutic Cofactors, Mitochondrial Actives & Precursors"
          badge="Nutraceuticals"
          inquireLabel="Inquire Catalog"
          onInquire={() => { if (typeof window !== 'undefined') window.location.href = '/contact'; }}
          showClinicalAI={true}
          aiCategory="Supplements & Longevity"
          aiContextQuery="What are the clinical synergies, recommended daily doses, and cofactor combinations across this longevity supplements portfolio?"
          lang="en"
        />
        <UnifiedOrderDrawer lang="en" />
      </RestrictedCatalogRoute>
    );
  }

  // /collection/research-supplies → research supplies catalog
  if (s === 'research-supplies') {
    return (
      <RestrictedCatalogRoute catalogName="apis">
        <ClinicalPortfolioSuiteSwitcher currentSlug="peptides" />
        <SuppliesView
          onBack={() => router.back()}
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

  // Normalize brand or clinical area slug
  const AREA_SLUG_MAP = {
    'ultraman': 'ultraperson',
    'hair-treatment': 'hair-treatments',
    'trichology': 'hair-treatments',
    'hair': 'hair-treatments',
    'weight': 'weight-loss',
    'metabolic': 'weight-loss',
    'metabolic-weight': 'weight-loss',
    'repair': 'tissue-repair',
    'recovery': 'tissue-repair',
    'healing': 'tissue-repair',
    'longevity': 'longevity-cellular',
    'anti-aging': 'longevity-cellular',
    'neuro': 'neuro-performance',
    'cognitive': 'neuro-performance',
    'dermal': 'dermal-aesthetics',
    'skin': 'dermal-aesthetics'
  };

  const normalizedBrand = AREA_SLUG_MAP[s] || s;
  const SUPPORTED_COLLECTION_PAGES = [
    'colway', 'bloodo', 'ultraperson', 'eterna', 'teletest',
    'hair-treatments', 'weight-loss', 'tissue-repair',
    'longevity-cellular', 'neuro-performance', 'dermal-aesthetics'
  ];

  if (SUPPORTED_COLLECTION_PAGES.includes(normalizedBrand)) {
    return (
      <RestrictedCatalogRoute catalogName="products">
        <BrandCollectionPage
          brandSlug={normalizedBrand}
          products={products || []}
          onSelectProduct={handleProductSelect}
          updateCart={updateCart}
          toggleCompare={toggleCompare}
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
        onSelectCategory={(cat) => router.push(`/collection/${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`)}
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
    <div className="template-root" style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 16px))' }}>
      <PublicUnifiedHeader
        track="products"
        lang="en"
        copyUrl={typeof window !== 'undefined' ? window.location.href : 'https://www.atlashealth-services.com/collection/peptides'}
        shortUrl={typeof window !== 'undefined' ? window.location.href : 'https://www.atlashealth-services.com/collection/peptides'}
        brandHref="/c/CAT-MU9L9GBN"
        brandTitle="Atlas Health Services Clinical & Healthcare Intelligence"
        hideTier2={true}
        hideAccountManager={true}
        hideAiButton={true}
      />
      <ClinicalPortfolioSuiteSwitcher currentSlug={slug} />
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
        onBack={() => router.back()}
        onSelectProduct={handleProductSelect}
        allFaqs={allFaqs}
      />
      <PublicUnifiedFooter lang="en" />
      <PublicStickyActionBar
        title={`${categoryName} Reference Catalog`}
        subtitle="Verified Clinical Monograph Standards • HPLC ≥99.0%"
        badge="Peptide Portfolio"
        inquireLabel="Inquire Catalog"
        onInquire={() => { if (typeof window !== 'undefined') window.location.href = '/contact'; }}
        showClinicalAI={true}
        aiCategory="Peptide Portfolio"
        aiContextQuery={`Which bioactive formulations in the ${categoryName} catalog are most recommended for clinical integration and batch synthesis?`}
        lang="en"
      />
      <UnifiedOrderDrawer lang="en" />
    </div>
  );
}
