import { lazy, Suspense } from 'react';
import HeroSearch from '../sections/HeroSearch';

// Below-the-fold — lazy-loaded, no initial paint cost
const FeaturedProtocols = lazy(() => import('../sections/FeaturedProtocols'));
const KeyPeptides       = lazy(() => import('../sections/KeyPeptides'));

/**
 * GuestHome — Minimal homepage (all users).
 *
 * Structure:
 *   1. HeroSearch       — dominant search entry point
 *   2. FeaturedProtocols — max 6 protocol cards (lazy)
 *   3. KeyPeptides       — max 8 peptide cards (lazy)
 *
 * Search wires into the global SearchModal via onOpenSearch / setSearchQuery.
 * No separate guest vs professional logic here.
 */
export default function GuestHome({
  onSelectProduct,
  onOpenSearch,
  searchQuery,
  setSearchQuery,
}) {
  return (
    <div style={{ background: 'var(--background, #0A0F1E)' }}>
      {/* 1 — Hero with integrated search */}
      <HeroSearch
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenSearch={onOpenSearch}
      />

      {/* 2 — Featured Protocols */}
      <Suspense fallback={null}>
        <FeaturedProtocols searchQuery={searchQuery} />
      </Suspense>

      {/* 3 — Key Peptides */}
      <Suspense fallback={null}>
        <KeyPeptides onSelectProduct={onSelectProduct} searchQuery={searchQuery} />
      </Suspense>
    </div>
  );
}
