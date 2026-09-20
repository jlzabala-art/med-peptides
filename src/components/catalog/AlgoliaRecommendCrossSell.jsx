'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, Plus, Check, Droplets, Syringe } from 'lucide-react';
import { getFrequentlyPrescribedTogether } from '@/services/algoliaRecommendService';

export default function AlgoliaRecommendCrossSell({
  cartItems = [],
  products,
  catalogProducts,
  onAddToCart,
  onAddProduct,
  currencySymbol = '$',
  fxMultiplier = 1,
  currentCurrency = 'USD'
}) {
  const allProducts = useMemo(() => catalogProducts || products || [], [catalogProducts, products]);
  const [recommendations, setRecommendations] = useState([]);
  const [addedIds, setAddedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const lastFetchedIdRef = React.useRef(null);

  // Identify if cart contains lyophilized peptide vials
  const needsReconstitution = useMemo(() => {
    return cartItems.some(item => {
      const pres = (item.presentation || '').toLowerCase();
      const name = (item.productName || '').toLowerCase();
      return pres.includes('vial') || pres.includes('lyophilized') || (!pres.includes('pen') && !pres.includes('capsule') && !pres.includes('water') && !name.includes('water') && !name.includes('syringe'));
    });
  }, [cartItems]);

  // Find supply products (Bac Water, Syringes) in catalog
  const supplyItems = useMemo(() => {
    const list = [];
    allProducts.forEach(p => {
      const name = (p.canonicalName || p.name || '').toLowerCase();
      p.variants?.forEach(v => {
        const vName = (v.name || '').toLowerCase();
        const vDosage = (v.dosage || '').toLowerCase();
        const inCart = cartItems.some(ci => ci.id === v.id);
        if (inCart) return;

        if (name.includes('water') || vName.includes('water') || vDosage.includes('water')) {
          list.push({ product: p, variant: v, type: 'water', icon: Droplets, title: 'Bac Water Reconstitution' });
        } else if (name.includes('syringe') || vName.includes('syringe') || vDosage.includes('syringe')) {
          list.push({ product: p, variant: v, type: 'syringe', icon: Syringe, title: 'Insulin Syringes 31G' });
        }
      });
    });
    return list.slice(0, 2);
  }, [allProducts, cartItems]);

  const targetId = cartItems && cartItems.length > 0 ? (cartItems[0].productId || cartItems[0].id) : null;

  // Fetch Algolia AI synergies
  useEffect(() => {
    if (!targetId) {
      setRecommendations([]);
      lastFetchedIdRef.current = null;
      return;
    }

    if (lastFetchedIdRef.current === targetId) {
      return;
    }

    let active = true;
    const fetchAlgoliaRecommendations = async () => {
      setLoading(true);
      try {
        lastFetchedIdRef.current = targetId;
        const hits = await getFrequentlyPrescribedTogether({
          objectID: targetId,
          category: 'peptide',
          maxRecommendations: 3
        });

        if (!active) return;

        // Map hits back to catalog products
        const matches = [];
        hits.forEach(hit => {
          const hitName = (hit.name || hit.canonicalName || '').toLowerCase().trim();
          const matchProd = allProducts.find(p => {
            const pName = (p.canonicalName || p.name || '').toLowerCase().trim();
            return pName.includes(hitName) || hitName.includes(pName);
          });
          if (matchProd && matchProd.variants && matchProd.variants.length > 0) {
            const variant = matchProd.variants[0];
            const inCart = cartItems.some(ci => ci.id === variant.id);
            if (!inCart && !matches.some(m => m.product.id === matchProd.id)) {
              matches.push({ product: matchProd, variant, type: 'synergy', title: matchProd.canonicalName });
            }
          }
        });

        setRecommendations(matches.slice(0, 2));
      } catch (err) {
        console.debug('Algolia Recommend fallback to supplies:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchAlgoliaRecommendations();
    return () => { active = false; };
  }, [targetId, allProducts, cartItems]);

  // Combine supply items and Algolia synergies
  const combinedSuggestions = useMemo(() => {
    const items = [...supplyItems];
    recommendations.forEach(r => {
      if (!items.some(it => it.variant.id === r.variant.id)) {
        items.push(r);
      }
    });
    return items.slice(0, 3);
  }, [supplyItems, recommendations]);

  if (combinedSuggestions.length === 0) return null;

  const handleAdd = (item) => {
    if (onAddProduct) {
      onAddProduct(item.product, item.variant);
    } else if (onAddToCart) {
      onAddToCart(item.variant, item.product);
    }
    setAddedIds(prev => new Set(prev).add(item.variant.id));
  };

  return (
    <div style={{
      marginTop: '12px',
      padding: '10px 12px',
      backgroundColor: '#f8fafc',
      borderRadius: '8px',
      border: '1px solid #e2e8f0'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '8px',
        fontSize: '0.75rem',
        fontWeight: 700,
        color: '#0369a1',
        letterSpacing: '0.02em',
        textTransform: 'uppercase'
      }}>
        <Sparkles size={13} color="#0284c7" />
        <span>Frequently Added with Order</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {combinedSuggestions.map((item) => {
          const isAdded = addedIds.has(item.variant.id);
          const price = ((item.variant.price || 0) * fxMultiplier).toFixed(2);

          return (
            <div
              key={item.variant.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 8px',
                backgroundColor: '#ffffff',
                borderRadius: '6px',
                border: '1px solid #f1f5f9',
                fontSize: '0.78rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1, paddingRight: '8px' }}>
                <span style={{ fontSize: '0.85rem' }}>
                  {item.type === 'water' ? '💧' : item.type === 'syringe' ? '💉' : '⚡'}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.product.canonicalName || item.product.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    {item.variant.dosage ? `${item.variant.dosage} • ` : ''}{currencySymbol}{price} {currentCurrency}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleAdd(item)}
                disabled={isAdded}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  backgroundColor: isAdded ? '#f0fdf4' : '#eff6ff',
                  border: `1px solid ${isAdded ? '#86efac' : '#bfdbfe'}`,
                  color: isAdded ? '#15803d' : '#1d4ed8',
                  borderRadius: '5px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: isAdded ? 'default' : 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s ease'
                }}
              >
                {isAdded ? (
                  <>
                    <Check size={12} />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <Plus size={12} />
                    <span>Add</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
