"use client";

import React, { useState, useEffect } from 'react';
import StandardDrawer from '../../ui/StandardDrawer';
import { calculateProductCompleteness } from '../../../utils/calculateProductCompleteness';
import { Sparkles, CheckCircle2, AlertCircle, RefreshCw, Info } from '@/lib/icons';
import notifier from '../../../services/NotificationService';

export default function ProductEnrichmentModal({ isOpen, onClose, product: initialProduct, onEnriched }) {
  const [isEnriching, setIsEnriching] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(initialProduct);

  useEffect(() => {
    setCurrentProduct(initialProduct);
  }, [initialProduct]);

  const activeProduct = currentProduct || initialProduct;

  if (!activeProduct) return null;

  const completeness = calculateProductCompleteness(activeProduct);
  const { score, color, bgColor, borderColor, statusLabel, missingFields, schemaType } = completeness;

  const handleAutoEnrich = async () => {
    setIsEnriching(true);
    try {
      const res = await fetch('/api/admin/enrich-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: activeProduct.id,
          canonicalName: activeProduct.canonicalName || activeProduct.name,
          currentProduct: activeProduct
        })
      });

      const data = await res.json();
      if (res.ok && data.success && data.product) {
        // The API returns the parent document, but we must preserve the variants array
        // (which is fetched from the subcollection) for the optimistic UI update
        const enrichedProd = {
          ...data.product,
          variants: data.variants && data.variants.length > 0 ? data.variants : (activeProduct.variants || [])
        };
        setCurrentProduct(enrichedProd);

        const newComp = calculateProductCompleteness(enrichedProd);
        notifier.success(`✨ Product ${activeProduct.canonicalName || activeProduct.name} enriched to ${newComp.score}%`);

        if (onEnriched) {
          onEnriched(enrichedProd);
        }
      } else {
        throw new Error(data.error || 'Enrichment failed');
      }
    } catch (err) {
      console.error('Enrichment Error:', err);
      notifier.error(`Enrichment failed: ${err.message}`);
    } finally {
      setIsEnriching(false);
    }
  };

  return (
    <StandardDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Data Quality: ${activeProduct.canonicalName || activeProduct.name || 'Product'}`}
      subtitle="Product completeness breakdown & automatic AI enrichment"
      width="560px"
    >
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '100%' }}>
        
        {/* Header Clinical Meter Card */}
        <div style={{
          padding: '1.25rem',
          borderRadius: '10px',
          backgroundColor: bgColor,
          border: `1px solid ${borderColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: color }}>
                Data Completeness ({statusLabel})
              </div>
              {schemaType && (
                <span style={{
                  fontSize: '0.65rem', fontWeight: 600,
                  backgroundColor: '#f1f5f9', color: '#475569',
                  padding: '1px 7px', borderRadius: '20px',
                  border: '1px solid #e2e8f0', textTransform: 'uppercase', letterSpacing: '0.04em'
                }}>
                  {schemaType} Schema
                </span>
              )}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>
              {score}% Complete
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>
              {missingFields.length === 0 ? 'All parameters complete for this product type.' : `Missing ${missingFields.length} key fields to reach 100%.`}
            </div>
          </div>

          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'white',
            border: `3px solid ${color}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.1rem',
            fontWeight: 800,
            color: color,
            flexShrink: 0
          }}>
            {score}%
          </div>
        </div>

        {/* Minimal Progress Bar */}
        <div style={{ width: '100%', height: '4px', borderRadius: '2px', backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
          <div style={{
            width: `${score}%`,
            height: '100%',
            backgroundColor: color,
            transition: 'width 0.4s ease'
          }} />
        </div>

        {/* Missing Fields Explanation Box if < 100% */}
        {missingFields.length > 0 && (
          <div style={{
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            backgroundColor: bgColor,
            border: `1px solid ${borderColor}`,
            color: color,
            fontSize: '0.8rem',
            lineHeight: '1.4'
          }}>
            <div style={{ fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Info size={16} />
              <span>Why is the score {score}% ({statusLabel})?</span>
            </div>
            <span style={{ color: '#334155' }}>
              The score is partial because the database is currently missing {missingFields.length} parameter(s): <strong>{missingFields.map(m => m.label).join(', ')}</strong>.
              Click the button below to fetch PubChem specifications and auto-populate all missing parameters with AI.
            </span>
          </div>
        )}

        {/* Missing Fields Checklist */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.65rem' }}>
            Missing Data Breakdown ({missingFields.length})
          </div>

          {missingFields.length === 0 ? (
            <div style={{ padding: '0.85rem 1rem', borderRadius: '8px', backgroundColor: '#f0fdf4', border: '1px solid #ccfbf1', color: '#0f766e', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', fontWeight: 600 }}>
              <CheckCircle2 size={16} />
              <span>This product has 100% of all scientific and commercial parameters complete!</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {missingFields.map((field, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.82rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                    <AlertCircle size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>{field.label}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#475569', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                      {field.category}
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>
                      +{field.weight}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Action CTA Button */}
        <div style={{ paddingTop: '0.85rem', borderTop: '1px solid #e2e8f0', marginTop: 'auto' }}>
          <button
            onClick={handleAutoEnrich}
            disabled={isEnriching || missingFields.length === 0}
            style={{
              width: '100%',
              padding: '0.75rem 1.25rem',
              borderRadius: '8px',
              backgroundColor: missingFields.length === 0 ? '#0f766e' : (isEnriching ? '#475569' : '#003666'),
              color: 'white',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: (isEnriching || missingFields.length === 0) ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0, 54, 102, 0.15)'
            }}
          >
            {isEnriching ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Fetching PubChem & Generating Data with AI...</span>
              </>
            ) : missingFields.length === 0 ? (
              <>
                <CheckCircle2 size={16} />
                <span>Product Fully Enriched (100% Score)</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>✨ Enrich Product with AI (Auto-complete to 100%)</span>
              </>
            )}
          </button>
        </div>

      </div>
    </StandardDrawer>
  );
}
