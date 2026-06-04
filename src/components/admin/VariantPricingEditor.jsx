import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { getVariants } from '../../repositories/productRepository';

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

  if (loading) return <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Loading variants...</div>;
  if (!variants.length) return <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No variants found for this product.</div>;

  return (
    <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '1rem' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' }}>
            <th style={{ padding: '0.5rem' }}>Variant SKU / Size</th>
            <th style={{ padding: '0.5rem', textAlign: 'right' }}>Master Price (Cost)</th>
            <th style={{ padding: '0.5rem', textAlign: 'right' }}>Retail Price (Base)</th>
            <th style={{ padding: '0.5rem', textAlign: 'right' }}>Clinic Price (B2B)</th>
            <th style={{ padding: '0.5rem', textAlign: 'right' }}>Wholesale Price</th>
          </tr>
        </thead>
        <tbody>
          {variants.map(v => {
            const retail = v.pricing?.retailPrice?.base || 0;
            const clinic = v.pricing?.clinicPrice?.base || parseFloat((retail * (1 - categoryDiscount / 100)).toFixed(2));
            const wholesale = v.pricing?.wholesalePrice?.base || parseFloat((retail * (1 - categoryDiscount / 100)).toFixed(2));
            const master = v.pricing?.masterPrice?.base || 0;

            const isClinicOverride = v.pricing?.clinicPrice?.override;
            const isWholesaleOverride = v.pricing?.wholesalePrice?.override;

            const renderInput = (field, val, isOverride) => {
              const targetKey = `${v.id}-${field}`;
              const isSaving = savingTarget === targetKey;
              const isSaved = savedTarget === targetKey;

              return (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  {isSaving && <RefreshCw size={12} className="animate-spin" color="var(--text-muted)" />}
                  {isSaved && <CheckCircle size={12} color="var(--success)" />}
                  <span style={{ color: 'var(--text-muted)' }}>$</span>
                  <input
                    type="number"
                    step="0.01"
                    defaultValue={val}
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
                      backgroundColor: isOverride ? 'var(--warning-light, rgba(255, 170, 0, 0.1))' : 'transparent',
                      color: 'var(--text-main)',
                      fontWeight: 600
                    }}
                    title={isOverride ? "Manual override active" : "Auto-calculated from discount"}
                  />
                </div>
              );
            };

            return (
              <tr key={v.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '0.75rem 0.5rem', fontWeight: 500 }}>
                  {v.sku || 'No SKU'}<br/>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {v.attributes?.dosage || ''} {v.attributes?.route || ''}
                  </span>
                </td>
                <td style={{ padding: '0.75rem 0.5rem' }}>{renderInput('masterPrice', master, false)}</td>
                <td style={{ padding: '0.75rem 0.5rem' }}>{renderInput('retailPrice', retail, false)}</td>
                <td style={{ padding: '0.75rem 0.5rem' }}>{renderInput('clinicPrice', clinic, isClinicOverride)}</td>
                <td style={{ padding: '0.75rem 0.5rem' }}>{renderInput('wholesalePrice', wholesale, isWholesaleOverride)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
