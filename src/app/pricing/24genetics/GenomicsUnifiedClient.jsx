'use client';

import React, { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import GenomicsPriceListClient from './GenomicsPriceListClient';
import PricingMarketSwitcherBar from '@/components/pricing/shared/PricingMarketSwitcherBar';
import { usePricing } from '@/hooks/usePricing';

const QatarGenomicsPriceListClient = dynamic(
  () => import('../24genomics-qatar/QatarGenomicsPriceListClient'),
  { ssr: false }
);

export default function GenomicsUnifiedClient({
  initialProducts = [],
  initialCurrency = 'EUR',
  initialLang = 'en',
  initialMarket = 'global',
}) {
  const { market: sessionMarket, isSimulating } = usePricing();
  const [market, setMarket] = useState(initialMarket === 'qatar' ? 'qatar' : 'global');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = (new URLSearchParams(window.location.search).get('market') || '').toLowerCase();
    if (raw === 'qatar' || raw === 'qa') setMarket('qatar');
  }, []);

  // Automatically reflect Admin Role/Market simulation or logged-in user's assigned market
  useEffect(() => {
    if (isSimulating || sessionMarket === 'qatar') {
      setMarket(sessionMarket === 'qatar' ? 'qatar' : 'global');
    }
  }, [sessionMarket, isSimulating]);

  const handleMarketChange = useCallback((nextMarket) => {
    const normalized = nextMarket === 'qatar' ? 'qatar' : 'global';
    setMarket(normalized);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (normalized === 'qatar') url.searchParams.set('market', 'qatar');
      else url.searchParams.delete('market');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  const isEs = initialLang === 'es';

  return (
    <>
      <PricingMarketSwitcherBar
        label={isEs ? 'Mercado 24Genetics' : '24Genetics Market'}
        activeMarket={market}
        onChange={handleMarketChange}
        options={[
          { id: 'global', label: isEs ? 'Global · Paneles CE-IVD' : 'Global · CE-IVD Panels', badge: 'EUR / USD' },
          { id: 'qatar', label: isEs ? 'Qatar · Distribución & Comp.' : 'Qatar · Distribution & Comp.', badge: 'QA' },
        ]}
      />
      {market === 'qatar' ? (
        <QatarGenomicsPriceListClient />
      ) : (
        <GenomicsPriceListClient
          initialProducts={initialProducts}
          initialCurrency={initialCurrency}
          initialLang={initialLang}
        />
      )}
    </>
  );
}
