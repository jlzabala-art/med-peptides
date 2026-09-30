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
  const [packModes, setPackModes] = useState({}); // { [variantId]: 1 | 10 }
  const lastFetchedIdRef = React.useRef(null);

  // Find supply products (Bac Water, Syringes) in catalog with strict deduplication
  const supplyItems = useMemo(() => {
    const list = [];
    const seenCategories = new Set();

    allProducts.forEach(p => {
      const pName = (p.canonicalName || p.name || '').toLowerCase();
      const isWater = pName.includes('water');
      const isSyringe = pName.includes('syringe');

      if (!isWater && !isSyringe) return;

      p.variants?.forEach(v => {
        const vId = v.id || `${p.id}_${v.dosage}`;
        const inCart = cartItems.some(ci => ci.id === v.id || ci.id === vId || ci.variantId === v.id);
        if (inCart) return;

        const categoryKey = isWater ? 'water' : 'syringe';
        if (seenCategories.has(categoryKey)) return;
        seenCategories.add(categoryKey);

        list.push({
          product: p,
          variant: v,
          type: isWater ? 'water' : 'syringe',
          icon: isWater ? Droplets : Syringe,
          title: isWater ? 'Bacteriostatic Water (BAC)' : 'Insulin Syringes 31G',
        });
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
            const inCart = cartItems.some(ci => ci.id === variant.id || ci.variantId === variant.id);
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

  // Combine supply items and Algolia synergies (ensure zero duplicate products)
  const combinedSuggestions = useMemo(() => {
    const items = [...supplyItems];
    const seenNames = new Set(items.map(it => (it.product.canonicalName || it.product.name || '').toLowerCase()));

    recommendations.forEach(r => {
      const rName = (r.product.canonicalName || r.product.name || '').toLowerCase();
      if (!seenNames.has(rName) && !items.some(it => it.variant.id === r.variant.id)) {
        seenNames.add(rName);
        items.push(r);
      }
    });
    return items.slice(0, 3);
  }, [supplyItems, recommendations]);

  if (combinedSuggestions.length === 0) return null;

  const handleAdd = (item, qty = 1) => {
    if (onAddProduct) {
      onAddProduct(item.product, item.variant, qty);
    } else if (onAddToCart) {
      onAddToCart(item.variant, item.product, qty);
    }
    setAddedIds(prev => new Set(prev).add(`${item.variant.id}_${qty}`));
  };

  return (
    <div style={{
      marginTop: '12px',
      padding: '12px 14px',
      backgroundColor: '#f8fafc',
      borderRadius: '10px',
      border: '1px solid #e2e8f0'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '10px',
        fontSize: '0.76rem',
        fontWeight: 800,
        color: '#0369a1',
        letterSpacing: '0.03em',
        textTransform: 'uppercase'
      }}>
        <Sparkles size={14} color="#0284c7" />
        <span>Frequently Added with Order</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {combinedSuggestions.map((item) => {
          const mode = packModes[item.variant.id] || 1;
          const is10Kit = mode === 10;
          const isAdded = addedIds.has(`${item.variant.id}_${mode}`);

          const unitPrice = (item.variant.price || 0) * fxMultiplier;
          const tier10Rate = (item.variant.tier10UnitPrice || item.variant.price || 0) * fxMultiplier;
          const kitPrice = item.variant.kitPrice ? (item.variant.kitPrice * fxMultiplier) : (tier10Rate * 10);
          const displayPrice = is10Kit ? kitPrice.toFixed(2) : unitPrice.toFixed(2);

          return (
            <div
              key={item.variant.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                gap: '8px',
                flexWrap: 'wrap'
              }}
            >
              {/* Product Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: '1 1 180px' }}>
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>
                  {item.type === 'water' ? '💧' : item.type === 'syringe' ? '💉' : '⚡'}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.product.canonicalName || item.product.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {item.variant.dosage ? `${item.variant.dosage} • ` : ''}
                    <strong style={{ color: '#003666' }}>{currencySymbol}{displayPrice} {currentCurrency}</strong>
                    {is10Kit ? (
                      <span style={{ marginLeft: '5px', color: '#16a34a', fontWeight: 700 }}>• 10-Vial Kit</span>
                    ) : (
                      <span style={{ marginLeft: '5px', color: '#64748b' }}>• 1 Vial</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Controls: 1 Vial vs 10-Kit pill selector + Add Button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <div style={{
                  display: 'inline-flex',
                  background: '#f1f5f9',
                  borderRadius: '6px',
                  padding: '2px',
                  border: '1px solid #e2e8f0'
                }}>
                  <button
                    type="button"
                    onClick={() => setPackModes(prev => ({ ...prev, [item.variant.id]: 1 }))}
                    style={{
                      padding: '3px 8px',
                      fontSize: '0.70rem',
                      fontWeight: 700,
                      borderRadius: '4px',
                      border: 'none',
                      background: !is10Kit ? '#003666' : 'transparent',
                      color: !is10Kit ? '#ffffff' : '#64748b',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    1 Vial
                  </button>
                  <button
                    type="button"
                    onClick={() => setPackModes(prev => ({ ...prev, [item.variant.id]: 10 }))}
                    style={{
                      padding: '3px 8px',
                      fontSize: '0.70rem',
                      fontWeight: 700,
                      borderRadius: '4px',
                      border: 'none',
                      background: is10Kit ? '#003666' : 'transparent',
                      color: is10Kit ? '#ffffff' : '#64748b',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    10-Kit
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleAdd(item, is10Kit ? 10 : 1)}
                  disabled={isAdded}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '5px 10px',
                    backgroundColor: isAdded ? '#f0fdf4' : '#eff6ff',
                    border: `1px solid ${isAdded ? '#86efac' : '#bfdbfe'}`,
                    color: isAdded ? '#15803d' : '#1d4ed8',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
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
                      <span>Add {is10Kit ? '10-Kit' : '1'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
