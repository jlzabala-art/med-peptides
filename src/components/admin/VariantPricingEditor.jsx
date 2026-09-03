"use client";

import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { getVariants } from '../../repositories/productRepository';
import { RefreshCw, CheckCircle } from '@/lib/icons';
import DataTable from '../ui/DataTable';
import InlineEditableCell from '../ui/InlineEditableCell';
import notifier from '../../services/NotificationService';

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

    const currentPrice = variant.pricing?.[field] || 0;
    if (currentPrice === priceVal) return;

    const targetKey = `${variantId}-${field}`;
    setSavingTarget(targetKey);

    try {
      const variantRef = doc(db, 'products', product.id, 'variants', variantId);
      const updateData = {
        [`pricing.${field}`]: priceVal,
        updatedAt: new Date().toISOString()
      };
      
      // If updating retail, also auto-update clinic and wholesale if they are missing or if we just want to apply discount
      if (field === 'retail') {
         const computedClinic = parseFloat((priceVal * (1 - categoryDiscount / 100)).toFixed(2));
         const computedWholesale = parseFloat((priceVal * (1 - categoryDiscount / 100)).toFixed(2));
         updateData[`pricing.clinic`] = computedClinic;
         updateData[`pricing.wholesale`] = computedWholesale;
      } else if (field === 'retail10') {
         const computedClinic10 = parseFloat((priceVal * (1 - categoryDiscount / 100)).toFixed(2));
         const computedWholesale10 = parseFloat((priceVal * (1 - categoryDiscount / 100)).toFixed(2));
         updateData[`pricing.clinic10`] = computedClinic10;
         updateData[`pricing.wholesale10`] = computedWholesale10;
      }
      
      await updateDoc(variantRef, updateData);

      setVariants(prev => prev.map(v => {
        if (v.id === variantId) {
          const newPricing = { ...v.pricing, [field]: priceVal };
          if (field === 'retail') {
             newPricing.clinic = parseFloat((priceVal * (1 - categoryDiscount / 100)).toFixed(2));
             newPricing.wholesale = parseFloat((priceVal * (1 - categoryDiscount / 100)).toFixed(2));
          } else if (field === 'retail10') {
             newPricing.clinic10 = parseFloat((priceVal * (1 - categoryDiscount / 100)).toFixed(2));
             newPricing.wholesale10 = parseFloat((priceVal * (1 - categoryDiscount / 100)).toFixed(2));
          }
          return { ...v, pricing: newPricing };
        }
        return v;
      }));

      setSavedTarget(targetKey);
      notifier.success('Price updated');
      setTimeout(() => setSavedTarget(null), 2000);
    } catch (err) {
      console.error(err);
      notifier.error('Failed to update price');
      throw err;
    } finally {
      setSavingTarget(null);
    }
  };

  if (loading) return <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Loading variants...</div>;
  if (!variants.length) return <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No variants found for this product.</div>;

  const renderInput = (v, field, field10, val, val10) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', width: '16px' }}>1x</span>
          <span style={{ color: 'var(--text-muted)' }}>$</span>
          <div style={{ minWidth: '80px', textAlign: 'right', fontWeight: 600 }}>
            <InlineEditableCell
              value={val || 0}
              type="number"
              onSave={(newVal) => handlePriceChange(v.id, field, newVal)}
            />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', width: '16px' }}>10x</span>
          <span style={{ color: 'var(--text-muted)' }}>$</span>
          <div style={{ minWidth: '80px', textAlign: 'right', fontWeight: 600 }}>
            <InlineEditableCell
              value={val10 || 0}
              type="number"
              onSave={(newVal) => handlePriceChange(v.id, field10, newVal)}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '1rem' }}>
      <DataTable
        data={variants.map(v => {
          const retail = v.pricing?.retail || 0;
          const clinic = v.pricing?.clinic || parseFloat((retail * (1 - categoryDiscount / 100)).toFixed(2));
          const wholesale = v.pricing?.wholesale || parseFloat((retail * (1 - categoryDiscount / 100)).toFixed(2));
          const supplierCost = v.pricing?.supplierCost || 0;
          const retail10 = v.pricing?.retail10 || 0;
          const clinic10 = v.pricing?.clinic10 || parseFloat((retail10 * (1 - categoryDiscount / 100)).toFixed(2));
          const wholesale10 = v.pricing?.wholesale10 || parseFloat((retail10 * (1 - categoryDiscount / 100)).toFixed(2));
          const supplierCost10 = v.pricing?.supplierCost10 || 0;
          return { ...v, retail, clinic, wholesale, supplierCost, retail10, clinic10, wholesale10, supplierCost10 };
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
            key: 'supplierCost',
            header: <div style={{ textAlign: 'right' }}>Supplier Cost</div>,
            render: (r) => renderInput(r, 'supplierCost', 'supplierCost10', r.supplierCost, r.supplierCost10)
          },
          {
            key: 'retail',
            header: <div style={{ textAlign: 'right' }}>Retail Price</div>,
            render: (r) => renderInput(r, 'retail', 'retail10', r.retail, r.retail10)
          },
          {
            key: 'clinic',
            header: <div style={{ textAlign: 'right' }}>Clinic Price (B2B)</div>,
            render: (r) => renderInput(r, 'clinic', 'clinic10', r.clinic, r.clinic10)
          },
          {
            key: 'wholesale',
            header: <div style={{ textAlign: 'right' }}>Wholesale Price</div>,
            render: (r) => renderInput(r, 'wholesale', 'wholesale10', r.wholesale, r.wholesale10)
          }
        ]}
      />
    </div>
  );
}