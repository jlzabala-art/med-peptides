/* eslint-disable no-unused-vars */
import { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCatalog } from '../repositories/productRepository';
import { products as staticProducts } from '../data/products';

const ShopContext = createContext();

export function ShopProvider({ children }) {
  
  const [region, setRegion] = useState(() => {
    try { return localStorage.getItem('mp_region'); } catch(e) { return null; }
  });
  
  const [settings, setSettings] = useState({
    detectedCountry: 'US',
    exchangeRates: { EUR: 0.92, GBP: 0.79 },
    shippingCosts: { standard: 0, express: 45 },
    deliveryTimes: { standard: '5-7 business days', express: '2-3 business days' }
  });

  const [compareList, setCompareList] = useState(() => {
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
      try {
        const firestoreCatalog = await getCatalog();
        if (firestoreCatalog && firestoreCatalog.length > 0) {
          return firestoreCatalog;
        }
      } catch (err) {
        console.error('[ShopProvider] Product catalog load error:', err);
      }
      const staticProductsList = Array.isArray(staticProducts) ? staticProducts : [];
      return staticProductsList.map(enrichV2);
    },
    staleTime: 1000 * 60 * 60, // 1 hour for catalog
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
