 
import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { getAnalytics, logEvent } from 'firebase/analytics';
import app from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useHomeLayout, DEFAULT_GUEST_SECTIONS, DEFAULT_PRO_SECTIONS, PRO_ROLES } from '../hooks/useHomeLayout';
import HomeSectionRenderer from '../components/HomeSectionRenderer';
import HomeLayoutSkeleton from '../components/HomeLayoutSkeleton';
import MoleculeParticles from '../components/MoleculeParticles';

/**
 * HomeView — unified homepage router for all 8 roles.
 */
export default function HomeView({
  forcedRole,
  userProfile,
  onSelectCategory,
  onSelectProduct,
  onSelectProtocol,
  onOpenSearch,
  onOpenCart,
  searchQuery,
  setSearchQuery,
}) {
  const { activeRole, isProfessional, user } = useAuth();
  const { layout, loading } = useHomeLayout();
  
  // Use forcedRole if provided (for dedicated landing pages), otherwise activeRole
  const renderRole = forcedRole || activeRole;

  useEffect(() => {
    try {
      const analytics = getAnalytics(app);
      logEvent(analytics, `home_view_${renderRole}`);
    } catch (err) {
      // Analytics is non-critical — silently ignore if unavailable
      console.warn('[HomeView] Analytics unavailable:', err?.message);
    }
  }, [renderRole]);

  const structuredData = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Atlas Health",
    "url": "https://Atlas Health.com/",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://Atlas Health.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  }), []);

  usePageMeta({
    title: 'Atlas Health | Premium Research Peptides & Research Protocols',
    description: 'Atlas Health provides high-purity research peptides and advanced research protocols for scientific professionals. Global logistics and verified analytical standards.',
    canonicalUrl: 'https://Atlas Health.com/',
    structuredData
  });

  // --- Seed-to-Hero Bridge ---
  const [heroSeedQuery, setHeroSeedQuery] = useState('');

  const handleSeedSearch = useCallback((query) => {
    setHeroSeedQuery(query);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      onOpenSearch?.(query);
    }, 150);
  }, [onOpenSearch]);

  const handleExternalQueryConsumed = useCallback(() => {
    setHeroSeedQuery('');
  }, []);

  const handleOpenAI = useCallback((seedQuery = '', displayText = '') => {
    window.dispatchEvent(
      new CustomEvent('open-clinical-ai', {
        detail: { query: seedQuery, autoSend: Boolean(seedQuery), displayText },
      })
    );
  }, []);

  // --- Layout Loading ---
  const sections = loading 
    ? null 
    : (layout[renderRole] || [])
        .filter(s => s.enabled && s.id !== 'FeaturedCategories')
        .sort((a, b) => a.order - b.order);

  const sharedProps = {
    onSelectProduct,
    onSelectCategory,
    onSelectProtocol,
    onOpenSearch,
    onOpenCart,
    searchQuery,
    setSearchQuery,
    user,
    userProfile,
    isProfessional,
    // Seed-to-Hero
    onSeedSearch: handleSeedSearch,
    externalQuery: heroSeedQuery,
    onExternalQuery: handleExternalQueryConsumed,
    // Goal-to-AI
    onOpenAI: handleOpenAI,
  };

  if (!sections) {
    // Skeleton fallback
    const fallbackSecs = PRO_ROLES.includes(renderRole) ? DEFAULT_PRO_SECTIONS : DEFAULT_GUEST_SECTIONS;
    const skeletonSections = fallbackSecs.filter(s => s.enabled).sort((a, b) => a.order - b.order);
    return <HomeLayoutSkeleton sections={skeletonSections} />;
  }

  return (
    <div style={{ position: 'relative', background: 'var(--background)' }}>
      <MoleculeParticles />
      <div className="home-seq" style={{ position: 'relative', zIndex: 1 }}>
        {sections.map((section, idx) => (
          <HomeSectionRenderer
            key={section.id}
            id={section.id}
            index={idx}
            visibility={section.visibility ?? 'all'}
            props={sharedProps}
          />
        ))}
      </div>
    </div>
  );
}
