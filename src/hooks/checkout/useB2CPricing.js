"use client";
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import * as fb from '../../firebase';
const db = fb?.db;
import { resolveVariantPrice } from '../../utils/resolvePrice';

/**
 * useB2CPricing
 * Enforces the Single Source of Truth for B2C pricing:
 * 1. Fetches real-time products from Firestore (ignoring local state/cache).
 * 2. Forces Retail pricing.
 * 3. Enforces the 'lotusland' tenant/region prices.
 * 4. Ignores "Kit" pricing (calculates sum of individual retail items).
 */
export function useB2CPricing(cartItemEntries = []) {
  const [b2cTotals, setB2cTotals] = useState({ total: 0, subtotal: 0, items: [] });
  const [isPricingLoading, setIsPricingLoading] = useState(false);
  const [pricingError, setPricingError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    async function calculateB2CPricing() {
      if (!cartItemEntries || cartItemEntries.length === 0) {
        setB2cTotals({ total: 0, subtotal: 0, items: [] });
        return;
      }
      
      setIsPricingLoading(true);
      setPricingError(null);
      
      try {
        let total = 0;
        const pricedItems = [];
        
        // We will fetch fresh docs for every item
        // In a real high-traffic environment, this should ideally be done in a Cloud Function
        // or bundled via an 'in' query. For B2C checkout security, live-fetch is correct.
        
        for (const entry of cartItemEntries) {
          const { id, quantity = 1, type, name, products = [] } = entry;
          
          if (type === 'protocol' && products && products.length > 0) {
            // PROTOCOL: No Kit pricing. Sum individual items at retail.
            let protocolSum = 0;
            const protocolItems = [];
            
            for (const pName of products) {
              // We need the product ID. Assuming products array contains strings (names) 
              // or objects. If strings, we need a way to look them up.
              // B2C will now rely on actual product docs. If they are objects with ID:
              const productId = typeof pName === 'object' ? pName.id : pName;
              
              // For robustness, if it's just a string name, we might not be able to fetch by ID directly here
              // without a query. But normally cart items store the full object or ID.
              // We'll skip the name-only fetch here for safety and rely on the full product objects
              // that should be passed in B2C cart.
              
              // Let's assume the cart stores full objects for products in B2C:
              const prodObj = typeof pName === 'object' ? pName : null;
              if (prodObj && prodObj.id) {
                const docRef = doc(db, 'products', prodObj.id);
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                  const freshProduct = snap.data();
                  // Force Lotusland Retail
                  const resolved = resolveVariantPrice(freshProduct, {
                    tier: 'retail',
                    tenant: { id: 'lotusland' }, // Force Lotusland
                    // Country code can also be forced if Lotusland relies on it:
                    // countryCode: 'LL' 
                  });
                  
                  const retailPrice = resolved.perUnit || 0;
                  protocolSum += (retailPrice * quantity);
                  protocolItems.push({ name: prodObj.name, price: retailPrice, quantity });
                }
              }
            }
            
            total += protocolSum;
            pricedItems.push({ id, type, name, price: protocolSum, quantity, subItems: protocolItems });
            
          } else {
            // INDIVIDUAL PEPTIDE OR SUPPLEMENT
            let productId = id;
            if (!productId && typeof entry === 'object') {
              productId = entry.productId || entry.id;
            }
            
            if (productId) {
              const docRef = doc(db, 'products', productId);
              const snap = await getDoc(docRef);
              if (snap.exists()) {
                const freshProduct = snap.data();
                
                const resolved = resolveVariantPrice(freshProduct, {
                  tier: 'retail',
                  tenant: { id: 'lotusland' } // Force Lotusland
                });
                
                const retailPrice = resolved.perUnit || 0;
                total += (retailPrice * quantity);
                pricedItems.push({ id, type, name, price: retailPrice, quantity });
              }
            }
          }
        }
        
        if (isMounted) {
          setB2cTotals({ total, subtotal: total, items: pricedItems });
        }
      } catch (err) {
        console.error('B2C Pricing Error:', err);
        if (isMounted) setPricingError(err);
      } finally {
        if (isMounted) setIsPricingLoading(false);
      }
    }
    
    calculateB2CPricing();
    
    return () => {
      isMounted = false;
    };
  }, [cartItemEntries]);

  return { b2cTotals, isPricingLoading, pricingError };
}
