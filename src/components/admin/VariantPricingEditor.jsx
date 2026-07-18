"use client";

import React, { useState, useEffect } from 'react';


import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

import { getVariants } from '../../repositories/productRepository';
import { RefreshCw, CheckCircle } from '@/lib/icons';
import DataTable from '../ui/DataTable';

export default function VariantPricingEditor({ product, categoryDiscount }) {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingTarget, setSavingTarget] = useState(null); // 'variantId-field'
  const [savedTarget, setSavedTarget] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const v = await getVariants(product.id);
        setVariants(v);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [product.id]);

  const handlePriceChange = async (variantId, field, valueString) => {
    let priceVal = parseFloat(valueString);
    if (isNaN(priceVal)) return;

    const variant = variants.find(v => v.id === variantId);
    if (!variant) return;

    // Check if changed
    const currentPrice = variant.pricing?.[field]?.base || 0;
    if (currentPrice === priceVal) return;

    const targetKey = `${variantId}-${field}`;
    setSavingTarget(targetKey);

    try {
      const variantRef = doc(db, 'products', product.id, 'variants', variantId);
      // We assume pricing structure: { pricing: { retailPrice: { base: X }, clinicPrice: { base: Y, override: true } } }
      const updateData = {
        [`pricing.${field}.base`]: priceVal,
        [`pricing.${field}.override`]: field === 'clinicPrice' || field === 'wholesalePrice' ? true : undefined,
        updatedAt: new Date().toISOString()
      };
      await updateDoc(variantRef, updateData);

      setVariants(prev => prev.map(v => {
        if (v.id === variantId) {
          return {
            ...v,
            pricing: {
              ...v.pricing,
              [field]: { ...(v.pricing?.[field] || {}), base: priceVal, override: field === 'clinicPrice' || field === 'wholesalePrice' ? true : undefined }
            }
          };
        }
        return v;
      }));

      setSavedTarget(targetKey);
      setTimeout(() => setSavedTarget(null), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingTarget(null);
    }
  };

  const handleToggleOverride = async (variantId, field, isOverride) => {
    const targetKey = `${variantId}-${field}-toggle`;
    setSavingTarget(targetKey);

    try {
      const variantRef = doc(db, 'products', product.id, 'variants', variantId);
      const updateData = {
        [`pricing.${field}.override`]: isOverride ? true : false,
        updatedAt: new Date().toISOString()
      };
      // If switching back to Auto, recalculate base price immediately
      if (!isOverride) {
        const variant = variants.find(v => v.id === variantId);
        const retail = variant?.pricing?.retailPrice?.base || 0;
        const computed = parseFloat((retail * (1 - categoryDiscount / 100)).toFixed(2));
        updateData[`pricing.${field}.base`] = computed;
      }
      await updateDoc(variantRef, updateData);

      setVariants(prev => prev.map(v => {
        if (v.id === variantId) {
          const newBase = !isOverride 
            ? parseFloat(((v.pricing?.retailPrice?.base || 0) * (1 - categoryDiscount / 100)).toFixed(2)) 
            : v.pricing?.[field]?.base;
          return {
            ...v,
            pricing: {
              ...v.pricing,
              [field]: { ...(v.pricing?.[field] || {}), base: newBase, override: isOverride }
            }
          };
        }
        return v;
      }));

      setSavedTarget(targetKey);
      setTimeout(() => setSavedTarget(null), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingTarget(null);
    }
  };

  if (loading) return <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Loading variants...</div>;
  if (!variants.length) return <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No variants found for this product.</div>;

  const renderInput = (v, field, val, isOverride) => {
    const targetKey = `${v.id}-${field}`;
    const isSaving = savingTarget === targetKey;
    const isSaved = savedTarget === targetKey;
    const isToggleSaving = savingTarget === `${v.id}-${field}-toggle`;
    const isB2B = field === 'clinicPrice' || field === 'wholesalePrice';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
        {isB2B && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.65rem' }}>
            {isToggleSaving && <RefreshCw size={10} className="animate-spin" color="var(--text-muted)" />}
            <button
              onClick={() => handleToggleOverride(v.id, field, !isOverride)}
              style={{
                background: isOverride ? 'var(--warning-light, rgba(255,170,0,0.1))' : 'var(--surface-raised)',
                border: `1px solid ${isOverride ? 'var(--warning)' : 'var(--border)'}`,
                borderRadius: '12px',
                padding: '0.1rem 0.4rem',
                cursor: 'pointer',
                color: isOverride ? 'var(--warning-dark, #b37700)' : 'var(--text-muted)',
                fontWeight: 600,
                transition: 'all 0.2s',
              }}
            >
              {isOverride ? 'Manual' : 'Auto'}
            </button>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
          {isSaving && <RefreshCw size={12} className="animate-spin" color="var(--text-muted)" />}
          {isSaved && <CheckCircle size={12} color="var(--success)" />}
          <span style={{ color: 'var(--text-muted)' }}>$</span>
          <input
            type="number"
            step="0.01"
            defaultValue={val}
            key={`${field}-${val}`} // Force re-render when base value updates from toggle
            disabled={isB2B && !isOverride}
            onBlur={(e) => handlePriceChange(v.id, field, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handlePriceChange(v.id, field, e.target.value);
            }}
            style={{
              width: '80px',
              padding: '0.3rem 0.4rem',
              border: isSaved ? '1px solid var(--success)' : (isOverride ? '1px solid var(--warning)' : '1px solid var(--border)'),
              borderRadius: '4px',
              textAlign: 'right',
              backgroundColor: isOverride ? 'var(--warning-light, rgba(255, 170, 0, 0.1))' : (isB2B && !isOverride ? 'var(--surface-raised)' : 'transparent'),
              color: isB2B && !isOverride ? 'var(--text-muted)' : 'var(--text-main)',
              fontWeight: 600,
              opacity: isB2B && !isOverride ? 0.7 : 1
            }}
            title={isOverride ? "Manual override active" : "Auto-calculated from discount"}
          />
        </div>
      </div>
    );
  };

  return (
    <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '1rem' }}>
      <DataTable
        data={variants.map(v => {
          const retail = v.pricing?.retailPrice?.base || 0;
          const clinic = v.pricing?.clinicPrice?.base || parseFloat((retail * (1 - categoryDiscount / 100)).toFixed(2));
          const wholesale = v.pricing?.wholesalePrice?.base || parseFloat((retail * (1 - categoryDiscount / 100)).toFixed(2));
          const master = v.pricing?.masterPrice?.base || 0;

          const isClinicOverride = v.pricing?.clinicPrice?.override;
          const isWholesaleOverride = v.pricing?.wholesalePrice?.override;
          
          return { ...v, retail, clinic, wholesale, master, isClinicOverride, isWholesaleOverride };
        })}
        columns={[
          {
            key: 'sku',
            header: 'Variant SKU / Size',
            render: (r) => (
              <div style={{ fontWeight: 500 }}>
                {r.sku || 'No SKU'}<br/>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {r.attributes?.dosage || ''} {r.attributes?.route || ''}
                </span>
              </div>
            )
          },
          {
            key: 'masterPrice',
            header: <div style={{ textAlign: 'right' }}>Master Price (Cost)</div>,
            render: (r) => renderInput(r, 'masterPrice', r.master, false)
          },
          {
            key: 'retailPrice',
            header: <div style={{ textAlign: 'right' }}>Retail Price (Base)</div>,
            render: (r) => renderInput(r, 'retailPrice', r.retail, false)
          },
          {
            key: 'clinicPrice',
            header: <div style={{ textAlign: 'right' }}>Clinic Price (B2B)</div>,
            render: (r) => renderInput(r, 'clinicPrice', r.clinic, r.isClinicOverride)
          },
          {
            key: 'wholesalePrice',
            header: <div style={{ textAlign: 'right' }}>Wholesale Price</div>,
            render: (r) => renderInput(r, 'wholesalePrice', r.wholesale, r.isWholesaleOverride)
          }
        ]}
      />
    </div>
  );
}