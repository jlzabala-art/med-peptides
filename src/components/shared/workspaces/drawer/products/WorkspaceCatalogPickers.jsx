"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Package, Layers, X, Trash2, ChevronDown, ChevronUp, Loader2, Sparkles, Check } from 'lucide-react';
import QuickClinicalRegimens from '../QuickClinicalRegimens';
import CopyableId from '@/components/ui/CopyableId';
import { resolveItemSku } from '@/utils/skuResolver';
import { resolveVariantPrice } from '@/utils/resolvePrice';

/**
 * WorkspaceCatalogPickers
 * Algolia-powered inline search and multi-variant selector for:
 * 1. Clinical Protocols (with live Algolia search)
 * 2. Master Catalog Products (with expandable multi-variant selection: dose, format, supplier, SKU, role price)
 * 3. Saved Reusable Kit Templates
 */
export default function WorkspaceCatalogPickers({
  itemsCount = 0,
  isAdmin = false,
  isDoctor = false,
  isWholesaler = false,
  isPatient = false,
  activePicker = null,
  setActivePicker,
  pickerSearch = '',
  setPickerSearch,
  onAddClinicalRegimen,
  protocols = [],
  onLoadProtocol,
  availableProducts = [],
  onAddProduct,
  savedKits = [],
  onLoadKit,
  onDeleteKit,
}) {
  const [liveProducts, setLiveProducts] = useState([]);
  const [liveProtocols, setLiveProtocols] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedProductIds, setExpandedProductIds] = useState(new Set());
  const [addedVariantId, setAddedVariantId] = useState(null);

  const effectiveTier = useMemo(() => {
    if (isDoctor) return 'clinic';
    if (isWholesaler) return 'wholesale';
    if (isPatient) return 'retail';
    return 'clinic';
  }, [isDoctor, isWholesaler, isPatient]);

  // Reactive Debounced Algolia / Catalog Search (<250ms)
  useEffect(() => {
    if (!activePicker) {
      setLiveProducts([]);
      setLiveProtocols([]);
      return;
    }

    const cleanQ = pickerSearch.trim();
    if (cleanQ.length < 2) {
      setLiveProducts([]);
      setLiveProtocols([]);
      setIsSearching(false);
      return;
    }

    let isCancelled = false;
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        if (activePicker === 'products') {
          // Query catalog summary API which handles Algolia search + embedded variants
          const res = await fetch(`/api/catalog/summary?limit=12&q=${encodeURIComponent(cleanQ)}`);
          if (res.ok) {
            const data = await res.json();
            if (!isCancelled) {
              const list = Array.isArray(data.items) ? data.items : (Array.isArray(data.data) ? data.data : (Array.isArray(data.products) ? data.products : []));
              setLiveProducts(list);
              // Auto-expand if only 1 or 2 products match
              if (list.length <= 2) {
                setExpandedProductIds(new Set(list.map(p => p.id)));
              }
            }
          }
        } else if (activePicker === 'protocols') {
          // Query Algolia federated protocols via repository
          const { searchCatalogFast } = await import('@/repositories/workspaceSearchRepository');
          const fastRes = await searchCatalogFast(cleanQ);
          if (!isCancelled && fastRes?.protocols) {
            setLiveProtocols(fastRes.protocols);
          }
        }
      } catch (err) {
        console.warn('[WorkspaceCatalogPickers] Search error:', err);
      } finally {
        if (!isCancelled) setIsSearching(false);
      }
    }, 250);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [pickerSearch, activePicker]);

  const toggleProductExpand = (prodId) => {
    setExpandedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(prodId)) next.delete(prodId);
      else next.add(prodId);
      return next;
    });
  };

  // Handler to add an exact variant with all immutable properties
  const handleAddExactVariant = (prod, variant, idx) => {
    const v = variant || {};
    const resolved = resolveVariantPrice(v, { tier: effectiveTier });
    const rawPrice = resolved?.perUnit ?? Number(v.price || v.unit_price || v.unitPrice || 0);

    const variantSku = resolveItemSku({ ...prod, ...v });
    const doseLabel = v.dosage || v.size || (v.dosage_unit ? `${v.dosage || ''} ${v.dosage_unit}`.trim() : 'Standard');
    const formatLabel = v.format || v.presentation || 'Vial';

    const itemToAdd = {
      id: `ws_${prod.id}_${v.id || v.sku || idx}_${Date.now()}`,
      productId: prod.id,
      variantId: v.id || `${prod.id}_var_${idx}`,
      canonicalName: `${prod.canonicalName || prod.name || 'Compound'} · ${doseLabel}`,
      sku: variantSku,
      dosage: doseLabel,
      format: formatLabel,
      quantity: 1,
      unitPrice: rawPrice,
      price: rawPrice,
      unitRate: rawPrice,
      supplierCost: isDoctor ? 0 : Number(v.supplierCost || v.cost || v.pricing?.supplierCost || 0),
      supplierName: isDoctor ? '' : (v.supplierName || v.supplier || prod.supplierName || 'Lotusland Limited'),
      supplierId: isDoctor ? '' : (v.supplierId || v.supplier || ''),
      category: prod.category || prod.categoryId || 'Peptides',
      presentation: v.presentation || formatLabel,
      targetTier: effectiveTier,
      cost_tiers: v.cost_tiers || prod.cost_tiers || (v.cost_10 ? { cost_10: v.cost_10, cost_50: v.cost_50, cost_100: v.cost_100 } : null),
      pricing: v.pricing || prod.pricing || null,
      cost_10: v.cost_10 ?? v.cost_tiers?.cost_10 ?? prod.cost_10 ?? null,
      price_per_kit_10: v.price_per_kit_10 ?? prod.price_per_kit_10 ?? null,
      kit_price: v.kit_price ?? v.kitPrice ?? prod.kit_price ?? null,
      kitCost: v.kitCost ?? prod.kitCost ?? null,
    };

    if (onAddProduct) onAddProduct(itemToAdd);
    setAddedVariantId(v.id || idx);
    setTimeout(() => setAddedVariantId(null), 1500);
  };

  // Protocols to display: live Algolia protocols when searching, or local protocols
  const displayProtocols = pickerSearch.trim().length >= 2 && liveProtocols.length > 0
    ? liveProtocols
    : (Array.isArray(protocols) ? protocols : []).filter((p) => {
        if (!pickerSearch.trim()) return true;
        const q = pickerSearch.toLowerCase();
        return (
          (p.name || p.title || '').toLowerCase().includes(q) ||
          (p.primary_goal || p.category || '').toLowerCase().includes(q)
        );
      });

  // Products to display: live Algolia products when searching, or local available products
  const displayProducts = pickerSearch.trim().length >= 2
    ? liveProducts
    : (Array.isArray(availableProducts) ? availableProducts : []).slice(0, 15);

  return (
    <>
      {/* Empty State Action Cards when workspace has 0 items */}
      {itemsCount === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Doctor 1-Tap Clinical Regimens */}
          {isDoctor && (
            <QuickClinicalRegimens
              onApplyRegimen={onAddClinicalRegimen}
              isDoctor={isDoctor}
            />
          )}

          {/* Card 1: Load Clinical Protocol */}
          <div
            onClick={() => {
              setActivePicker(activePicker === 'protocols' ? null : 'protocols');
              setPickerSearch('');
            }}
            style={{
              backgroundColor: activePicker === 'protocols' ? '#e0f2fe' : '#ffffff',
              border: `1.5px solid ${activePicker === 'protocols' ? '#0284c7' : '#bfdbfe'}`,
              borderRadius: '12px',
              padding: '1.1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.05)',
              touchAction: 'manipulation',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#003666',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <FileText size={22} />
              </div>
              <div style={{ minWidth: 0 }}>
                <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#003666' }}>
                  Load Clinical Protocol
                </h4>
                <p style={{ margin: '3px 0 0', fontSize: '0.76rem', color: '#0284c7', fontWeight: 600 }}>
                  Import multi-compound treatment regimens
                </p>
              </div>
            </div>
            <button
              type="button"
              style={{
                border: 'none',
                backgroundColor: '#003666',
                color: '#ffffff',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              Select →
            </button>
          </div>

          {/* Card 2: Add from Master Catalog */}
          <div
            onClick={() => {
              setActivePicker(activePicker === 'products' ? null : 'products');
              setPickerSearch('');
            }}
            style={{
              backgroundColor: activePicker === 'products' ? '#dcfce7' : '#ffffff',
              border: `1.5px solid ${activePicker === 'products' ? '#16a34a' : '#bbf7d0'}`,
              borderRadius: '12px',
              padding: '1.1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              boxShadow: '0 2px 6px rgba(22, 163, 74, 0.05)',
              touchAction: 'manipulation',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Package size={22} />
              </div>
              <div style={{ minWidth: 0 }}>
                <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#14532d' }}>
                  Add from Master Catalog
                </h4>
                <p style={{ margin: '3px 0 0', fontSize: '0.76rem', color: '#16a34a', fontWeight: 600 }}>
                  Browse single compounds and specific presentations
                </p>
              </div>
            </div>
            <button
              type="button"
              style={{
                border: 'none',
                backgroundColor: '#16a34a',
                color: '#ffffff',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              Browse →
            </button>
          </div>

          {/* Card 3: Load Saved Kit */}
          {savedKits && savedKits.length > 0 && (
            <div
              onClick={() => {
                setActivePicker(activePicker === 'kits' ? null : 'kits');
                setPickerSearch('');
              }}
              style={{
                backgroundColor: activePicker === 'kits' ? '#faf5ff' : '#ffffff',
                border: `1.5px solid ${activePicker === 'kits' ? '#9333ea' : '#e9d5ff'}`,
                borderRadius: '12px',
                padding: '1rem 1.1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                touchAction: 'manipulation',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: '#faf5ff',
                    border: '1px solid #e9d5ff',
                    color: '#9333ea',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Layers size={20} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: '#581c87' }}>
                    Load Saved Kit Template ({savedKits.length})
                  </h4>
                  <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: '#9333ea', fontWeight: 600 }}>
                    Quick-load custom composite kits
                  </p>
                </div>
              </div>
              <button
                type="button"
                style={{
                  border: 'none',
                  backgroundColor: '#9333ea',
                  color: '#ffffff',
                  padding: '6px 12px',
                  borderRadius: '7px',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Kits →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Inline Picker Overlay for Protocols (Algolia Connected) */}
      {activePicker === 'protocols' && (
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1.5px solid #0284c7',
            borderRadius: '10px',
            padding: '0.85rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
              Select Clinical Protocol
            </span>
            <button
              type="button"
              onClick={() => setActivePicker(null)}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={16} />
            </button>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search protocols by name, goal, or compound (Algolia)..."
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 30px 7px 10px',
                borderRadius: '7px',
                border: '1px solid #cbd5e1',
                fontSize: '0.78rem',
                outline: 'none',
              }}
            />
            {isSearching && (
              <Loader2
                size={14}
                className="animate-spin"
                style={{ position: 'absolute', right: '9px', top: '9px', color: '#0284c7' }}
              />
            )}
          </div>
          <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {displayProtocols.length === 0 && !isSearching && (
              <div style={{ padding: '15px', textAlign: 'center', fontSize: '0.78rem', color: '#94a3b8' }}>
                No clinical protocols found matching &quot;{pickerSearch}&quot;.
              </div>
            )}
            {displayProtocols.map((p) => (
              <div
                key={p.id || p.objectID}
                onClick={() => {
                  if (onLoadProtocol) onLoadProtocol(p);
                  setActivePicker(null);
                  setPickerSearch('');
                }}
                style={{
                  padding: '8px 10px',
                  borderRadius: '7px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  touchAction: 'manipulation',
                  transition: 'background-color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#eff6ff')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
              >
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#003666' }}>{p.name || p.title}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    {p.primary_goal || 'Clinical Regimen'} • {p.duration_weeks || 8} wks
                  </div>
                </div>
                <span style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 700 }}>+ Select</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inline Picker Overlay for Master Catalog (Algolia + Multi-Variant Selector) */}
      {activePicker === 'products' && (
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1.5px solid #16a34a',
            borderRadius: '10px',
            padding: '0.85rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                Select Product & Variant
              </span>
              <span style={{ fontSize: '0.7rem', backgroundColor: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                Algolia Live
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActivePicker(null)}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search by peptide name, brand synonym, or SKU (e.g. tirze, sema)..."
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 30px 7px 10px',
                borderRadius: '7px',
                border: '1px solid #cbd5e1',
                fontSize: '0.78rem',
                outline: 'none',
              }}
            />
            {isSearching && (
              <Loader2
                size={14}
                className="animate-spin"
                style={{ position: 'absolute', right: '9px', top: '9px', color: '#16a34a' }}
              />
            )}
          </div>

          <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {displayProducts.length === 0 && !isSearching && pickerSearch.trim().length >= 2 && (
              <div style={{ padding: '20px', textAlign: 'center', fontSize: '0.78rem', color: '#94a3b8' }}>
                No products found matching &quot;{pickerSearch}&quot;.
              </div>
            )}

            {displayProducts.map((prod) => {
              const variants = Array.isArray(prod.variants) && prod.variants.length > 0
                ? prod.variants
                : [
                    {
                      id: prod.id,
                      dosage: prod.dosage || prod.size || 'Standard',
                      format: prod.format || prod.presentation || 'Vial',
                      supplierName: prod.supplierName || (Array.isArray(prod.suppliers) ? prod.suppliers[0] : 'Lotusland Limited'),
                      supplierId: prod.supplierId || '',
                      sku: prod.sku || '',
                      price: prod.price || prod.unitPrice || 0,
                    },
                  ];

              const isExpanded = expandedProductIds.has(prod.id);

              return (
                <div
                  key={prod.id || prod.objectID}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    overflow: 'hidden',
                  }}
                >
                  {/* Product Header Row */}
                  <div
                    onClick={() => toggleProductExpand(prod.id)}
                    style={{
                      padding: '8px 10px',
                      backgroundColor: isExpanded ? '#f0fdf4' : '#f8fafc',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: isExpanded ? '1px solid #bbf7d0' : 'none',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                        {prod.canonicalName || prod.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        {prod.category || 'Peptide'} • {variants.length} presentation{variants.length > 1 ? 's' : ''} available
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700 }}>
                        {isExpanded ? 'Hide Options' : 'Select Variant'}
                      </span>
                      {isExpanded ? <ChevronUp size={14} color="#16a34a" /> : <ChevronDown size={14} color="#16a34a" />}
                    </div>
                  </div>

                  {/* Variants List Accordion */}
                  {isExpanded && (
                    <div style={{ padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: '6px', backgroundColor: '#fafafa' }}>
                      {variants.map((v, vIdx) => {
                        const resolved = resolveVariantPrice(v, { tier: effectiveTier });
                        const displayPrice = resolved?.perUnit ?? Number(v.price || v.unit_price || v.unitPrice || 0);
                        const variantSku = resolveItemSku({ ...prod, ...v });
                        const isAdded = addedVariantId === (v.id || vIdx);

                        return (
                          <div
                            key={v.id || vIdx}
                            style={{
                              padding: '8px 10px',
                              borderRadius: '6px',
                              backgroundColor: '#ffffff',
                              border: '1px solid #e2e8f0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '8px',
                            }}
                          >
                            <div style={{ minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: 800, fontSize: '0.8rem', color: '#0f172a' }}>
                                  {v.dosage || v.size || 'Standard'}
                                </span>
                                <span
                                  style={{
                                    fontSize: '0.68rem',
                                    backgroundColor: '#f1f5f9',
                                    color: '#475569',
                                    padding: '1px 5px',
                                    borderRadius: '4px',
                                    fontWeight: 700,
                                  }}
                                >
                                  {v.format || v.presentation || 'Vial'}
                                </span>
                                {isAdmin && (v.supplierName || v.supplier) && (
                                  <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                                    • {v.supplierName || v.supplier}
                                  </span>
                                )}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>SKU:</span>
                                <CopyableId value={variantSku} displayValue={variantSku} />
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                                  ${displayPrice.toFixed(2)}
                                </div>
                                <div style={{ fontSize: '0.64rem', color: '#94a3b8' }}>
                                  {effectiveTier} rate
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleAddExactVariant(prod, v, vIdx)}
                                style={{
                                  border: 'none',
                                  backgroundColor: isAdded ? '#10b981' : '#16a34a',
                                  color: '#ffffff',
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  fontSize: '0.74rem',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  touchAction: 'manipulation',
                                  transition: 'all 0.15s',
                                }}
                              >
                                {isAdded ? (
                                  <>
                                    <Check size={12} /> Added
                                  </>
                                ) : (
                                  '+ Add'
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Inline Picker Overlay for Saved Kits */}
      {activePicker === 'kits' && (
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1.5px solid #a855f7',
            borderRadius: '10px',
            padding: '0.85rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>Select Reusable Kit</span>
            <button
              type="button"
              onClick={() => setActivePicker(null)}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={16} />
            </button>
          </div>
          <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {(savedKits || []).map((kit) => (
              <div
                key={kit.id}
                style={{
                  padding: '8px 10px',
                  borderRadius: '7px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>{kit.name}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{(kit.items || []).length} items</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (onLoadKit) onLoadKit(kit.id);
                      setActivePicker(null);
                      setPickerSearch('');
                    }}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#9333ea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    + Load
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteKit && onDeleteKit(kit.id)}
                    style={{
                      padding: '5px 7px',
                      backgroundColor: '#fff5f5',
                      color: '#dc2626',
                      border: '1px solid #fca5a5',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
