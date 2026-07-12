/* eslint-disable no-unused-vars */
import { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCatalog } from '../repositories/productRepository';

const ShopContext = createContext();

export function ShopProvider({ children }) {
  
  const [region, setRegion] = useState(() => {
    if (typeof window === 'undefined') return null;
    try { return localStorage.getItem('mp_region'); } catch(e) { return null; }
  });
  
  const [settings, setSettings] = useState({
    detectedCountry: 'US',
    exchangeRates: { EUR: 0.92, GBP: 0.79 },
    shippingCosts: { standard: 0, express: 45 },
    deliveryTimes: { standard: '5-7 business days', express: '2-3 business days' }
  });

  const [compareList, setCompareList] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const savedCompare = localStorage.getItem('mp_compare');
      return savedCompare ? JSON.parse(savedCompare) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('mp_compare', JSON.stringify(compareList));
  }, [compareList]);

  const enrichV2 = (p) => ({...p, productType: p.productType || 'peptide'});

  const { data: catalogData } = useQuery({
    queryKey: ['catalog'],
    queryFn: async () => {
      // Golden Rule: We no longer fetch the entire catalog into memory on load.
      // Individual components must fetch their own data using paginated or targeted queries.
      return [];
    },
    staleTime: Infinity,
  });

  const products = catalogData || [];

  return (
    <ShopContext.Provider value={{
      products,
      region, setRegion,
      settings, setSettings,
      compareList, setCompareList
    }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}
