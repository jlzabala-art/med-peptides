'use client';

import React from 'react';
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import ShoppingBag from "lucide-react/dist/esm/icons/shopping-bag";
import Tag from "lucide-react/dist/esm/icons/tag";
import { formatAEDtoDual } from '../../../utils/currencies';
import { normalizeProductTitle } from '../../../utils/productNormalizer';

const AVAILABLE_TIERS = [
  { id: 'clinic',    label: 'Clinic / Medical', icon: '🏥' },
  { id: 'retail',    label: 'Retail / Patient', icon: '👤' },
  { id: 'wholesale', label: 'Wholesale / B2B',  icon: '🏢' },
  { id: 'cost',      label: 'Master Cost',      icon: '⚙️' },
];

export function getItemResolvedPrice(item, tier) {
  if (!item) return 0;
  const tierKey = String(tier || 'clinic').toLowerCase();

  // 1. Check item.pricing sub-object (canonical Firestore schema)
  if (item.pricing?.[tierKey]?.perUnit !== undefined) {
    return Number(item.pricing[tierKey].perUnit);
  }
  // 2. Check item.prices map
  if (item.prices?.[tierKey] !== undefined) {
    return Number(item.prices[tierKey]);
  }
  // 3. Check specific price properties
  if (tierKey === 'retail' && item.retailPrice !== undefined) return Number(item.retailPrice);
  if (tierKey === 'clinic' && item.clinicPrice !== undefined) return Number(item.clinicPrice);
  if (tierKey === 'wholesale' && item.wholesalePrice !== undefined) return Number(item.wholesalePrice);
  if ((tierKey === 'cost' || tierKey === 'master') && item.costPrice !== undefined) return Number(item.costPrice);
  if ((tierKey === 'cost' || tierKey === 'master') && item.supplierCost !== undefined) return Number(item.supplierCost);

  // 4. Fallback to tier_0, base price or price
  if (item.prices?.tier_0 !== undefined) return Number(item.prices.tier_0);
  if (item.price !== undefined) return Number(item.price);
  if (item.basePrice !== undefined) return Number(item.basePrice);

  return 0;
}

export default function BuilderDraftCart({
  items,
  totals,
  onUpdateQuantity,
  onRemove,
  pricingTier = 'clinic',
  onSelectPricingTier,
  splitPrescriptions,
  itemTreatmentTypes,
}) {
  if (!items || items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-bg-surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <ShoppingBag size={32} color="var(--color-text-tertiary)" style={{ margin: '0 auto 1rem' }} />
        <h4 style={{ margin: 0, color: 'var(--color-text-secondary)' }}>Your cart is empty</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-tertiary)', marginTop: '0.5rem' }}>
          Search products above to add items to this prescription or order.
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--color-bg-surface)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
      {/* Cart Header with Interactive Price Tier Selector */}
      <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border)', background: 'var(--color-bg-app)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700 }}>Prescription & Order Items ({items.length})</h3>
        </div>

        {/* Pricing Tier Selector Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#ffffff', padding: '3px', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, padding: '0 6px', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Tag size={11} />
            Tier:
          </div>
          {AVAILABLE_TIERS.map(t => {
            const isActive = String(pricingTier).toLowerCase() === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelectPricingTier && onSelectPricingTier(t.id)}
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.74rem',
                  fontWeight: isActive ? 700 : 500,
                  background: isActive ? '#003666' : 'transparent',
                  color: isActive ? '#ffffff' : '#475569',
                  cursor: onSelectPricingTier ? 'pointer' : 'default',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {(() => {
          const renderItem = (item, index) => {
            const unitPrice = getItemResolvedPrice(item, pricingTier);

            return (
              <div key={`${item.id}-${item.sourceId}-${index}`} className="draft-cart-item">
                <div style={{ flex: 1, width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-text-primary)' }}>
                      {normalizeProductTitle(item.name || item.productName)}
                    </span>
                    {item.dosage && (
                      <span style={{
                        fontSize: '0.72rem',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: '#dbeafe',
                        color: '#1d4ed8',
                        fontWeight: 700
                      }}>
                        {item.dosage}
                      </span>
                    )}
                    {item.presentation && (
                      <span style={{
                        fontSize: '0.72rem',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: '#f1f5f9',
                        color: '#475569',
                        fontWeight: 600
                      }}>
                        {item.presentation}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {item.category && <span style={{ color: '#0d9488', fontWeight: 600 }}>{item.category}</span>}
                    {item.supplier && <span style={{ color: '#6366f1' }}>{item.supplier}</span>}
                    {item.sku && <span>SKU: {item.sku}</span>}
                    <span>· {formatAEDtoDual(unitPrice)} each</span>
                  </div>
                  {item.sourceId && (
                    <div style={{ fontSize: '0.65rem', color: 'var(--color-primary)', marginTop: '0.2rem', fontWeight: 700 }}>
                      Source: {item.sourceType === 'prescription' ? 'Imported Prescription' : 'Direct Order'}
                    </div>
                  )}
                </div>
                
                <div className="draft-cart-item-actions">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'var(--surface-50, #f8fafc)', padding: '0.25rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                    <button 
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, item.sourceId, Math.max(1, (item.quantity || 1) - 1))}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '0.2rem 0.4rem', color: 'var(--text-muted)' }}
                    >
                      -
                    </button>
                    <span style={{ fontSize: '0.85rem', width: '20px', textAlign: 'center', fontWeight: 600 }}>
                      {item.quantity}
                    </span>
                    <button 
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, item.sourceId, (item.quantity || 1) + 1)}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '0.2rem 0.4rem', color: 'var(--text-muted)' }}
                    >
                      +
                    </button>
                  </div>
                  
                  <div style={{ width: '80px', textAlign: 'right', fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
                    {formatAEDtoDual(unitPrice * item.quantity)}
                  </div>
                  
                  <button 
                    type="button"
                    onClick={() => onRemove(item.id, item.sourceId)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          };

          if (splitPrescriptions) {
            const grouped = items.reduce((acc, item) => {
              const type = itemTreatmentTypes?.[item.id] || item.treatmentType || 'General';
              if (!acc[type]) acc[type] = [];
              acc[type].push(item);
              return acc;
            }, {});
            
            return Object.entries(grouped).map(([type, groupItems]) => (
              <div key={type} style={{ marginBottom: '1rem', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)', padding: '0.75rem 1rem', background: 'var(--surface-50)', borderBottom: '1px solid var(--border)', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
                  {type} Prescription ({groupItems.length} items)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem' }}>
                  {groupItems.map((item, index) => renderItem(item, index))}
                </div>
              </div>
            ));
          }

          return items.map((item, index) => renderItem(item, index));
        })()}
      </div>
      
      <div style={{ padding: '1.25rem', borderTop: '1px dashed var(--border)', background: 'var(--color-bg-app)', display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ width: '250px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Subtotal ({pricingTier.toUpperCase()}):</span>
            <span style={{ fontWeight: 600 }}>{formatAEDtoDual(totals.subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Tax (5%):</span>
            <span style={{ fontWeight: 600 }}>{formatAEDtoDual(totals.tax)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text-primary)', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
            <span>Total:</span>
            <span>{formatAEDtoDual(totals.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
