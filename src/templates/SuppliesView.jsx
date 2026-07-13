"use client";

/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useCallback, memo, useState } from 'react';

import UniversalProductCard from '../components/universal/UniversalProductCard';
import PaginationControl from '../components/common/PaginationControl';






import { resolveVariantPrice } from '../utils/resolvePrice';
import { usePricingTier } from '../hooks/usePricingTier';
import { trackEvent } from '../hooks/useAnalytics';
import { Droplets, Syringe, Info, CheckCircle, ShieldCheck, FlaskConical } from '@/lib/icons';

const SuppliesView = ({
  onSelectProduct,
  updateCart,
  products = [],
  region,
  isProfessional,
  EXCHANGE_RATES
}) => {
  const { tier } = usePricingTier();
  const [page, setPage] = useState(1);
  const [hitsPerPage, setHitsPerPage] = useState(25);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // PHASE 1: Data Optimization (Memoized)
  const supplies = useMemo(() => {
    if (!products.length) return [];

    const filtered = products.filter(p => p.category === "Research Supplies");
    const map = new Map();

    filtered.forEach(item => {
      const existing = map.get(item.name);
      // Prefer entries with a resolved price over price-less entries
      const variant = item.defaultVariant ?? item.variants?.[0] ?? item;
      const hasPrice = (p) => {
        const v = p.defaultVariant ?? p.variants?.[0] ?? p;
        return resolveVariantPrice(v, { tier }).perUnit != null;
      };
      if (!existing || (!hasPrice(existing) && hasPrice(item))) {
        map.set(item.name, item);
      }
    });

    return Array.from(map.values());
  }, [products, tier]);

  // PHASE 1.1: Price Formatting — resolved from variant data in Firestore
  const formatPrice = useCallback((item) => {
    if (!region || !EXCHANGE_RATES[region]) return '---';

    const variant = item.defaultVariant ?? item.variants?.[0] ?? item;
    const resolved = resolveVariantPrice(variant, { tier });
    const priceUSD = resolved.perUnit ?? 0;

    const formatValue = (val) => val.toLocaleString(region === 'row' ? 'en-US' : 'de-DE');

    if (region === 'row') {
      return `$${formatValue(Math.round(priceUSD))} USD`;
    } else {
      const config = EXCHANGE_RATES[region];
      const localPrice = Math.round(priceUSD * config.rate * 1.10);
      return `${formatValue(localPrice)} ${config.currency}`;
    }
  }, [region, isProfessional, EXCHANGE_RATES, tier]);

  // PHASE 1.2: Pagination Logic
  const displaySupplies = useMemo(
    () => supplies.slice(0, page * hitsPerPage),
    [supplies, page, hitsPerPage]
  );
  const hasMore = displaySupplies.length < supplies.length;

  return (
    <div className="template-root" style={{ padding: 'clamp(1rem, 5vw, 4rem) 1rem', maxWidth: '1200px', margin: '0 auto' }}>

      {/* Minimalist Header */}
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <div style={{ color: 'var(--secondary)', marginBottom: '1rem' }}>
          <FlaskConical size={48} strokeWidth={1.5} />
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800 }}>Laboratory Consumables</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
          Certified research supplies optimized for analytical peptide stability and precise laboratory handling.
        </p>
      </header>

      {/* Mobile-Optimized Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {displaySupplies.map(item => (
          <UniversalProductCard
            key={item.id || item.objectID || item.name}
            product={{
              ...item,
              price: formatPrice(item), // Pass the pre-formatted string if UniversalProductCard accepts it, or just use UniversalProductCard's internal resolution
            }}
            onAddToCart={updateCart}
            onClick={() => onSelectProduct(item.name)}
            viewMode="grid"
            showImage={true}
            badge={{ text: 'LAB-GRADE', type: 'info' }}
          />
        ))}
      </div>

      {supplies.length > 0 && (
        <PaginationControl 
          hitsPerPage={hitsPerPage}
          setHitsPerPage={(val) => { setHitsPerPage(val); setPage(1); }}
          hasMore={hasMore}
          onLoadMore={() => setPage(p => p + 1)}
          totalHits={supplies.length}
          loadedHits={displaySupplies.length}
          isLoading={false}
        />
      )}

      {/* Security Disclaimer Small */}
      <footer style={{ marginTop: '4rem', opacity: 0.7 }}>
        <p style={{ fontSize: '0.75rem', textAlign: 'center', fontStyle: 'italic' }}>
          <strong>Research Use Only:</strong> Laboratory consumables are strictly for institutional research.
        </p>
      </footer>
    </div>
  );
};

export default memo(SuppliesView);