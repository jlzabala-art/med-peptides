"use client";

import React, { useState, useEffect, useRef } from 'react';
import StandardDrawer from '../../ui/StandardDrawer';
import { calculateProductCompleteness } from '../../../utils/calculateProductCompleteness';
import { Sparkles, CheckCircle2, AlertCircle, RefreshCw, Info, Database, Beaker, FileCheck } from '@/lib/icons';
import notifier from '../../../services/NotificationService';

const ENRICHMENT_STEPS = [
  { id: 1, label: 'Taxonomy & Domain Schema', icon: Database, desc: 'Classifying category & clinical validation rules' },
  { id: 2, label: 'PubChem & Molecular Data', icon: Beaker, desc: 'Querying CID, CAS number, MW & chemical structure' },
  { id: 3, label: 'Clinical & Compounding Rules', icon: Sparkles, desc: 'Synthesizing dosage, vehicles & program tags' },
  { id: 4, label: 'Completeness Sync (100%)', icon: FileCheck, desc: 'Validating and persisting authoritative records' },
];

export default function ProductEnrichmentModal({ isOpen, onClose, product: initialProduct, onEnriched }) {
  const [isEnriching, setIsEnriching] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(initialProduct);
  const [currentStep, setCurrentStep] = useState(1);
  const [animatedScore, setAnimatedScore] = useState(0);
  const autoEnrichTriggeredRef = useRef(null);

  useEffect(() => {
    setCurrentProduct(initialProduct);
    if (initialProduct) {
      const comp = calculateProductCompleteness(initialProduct);
      setAnimatedScore(comp.score);
    }
  }, [initialProduct]);

  const activeProduct = currentProduct || initialProduct;
  const completeness = activeProduct ? calculateProductCompleteness(activeProduct) : null;
  const { score = 0, color = '#64748b', bgColor = '#f8fafc', borderColor = '#e2e8f0', statusLabel = '', missingFields = [], schemaType = 'General' } = completeness || {};

  // Auto-start enrichment when opened if score < 100%
  useEffect(() => {
    if (isOpen && activeProduct && activeProduct.id && score < 100 && !isEnriching) {
      // Trigger once per open product instance
      if (autoEnrichTriggeredRef.current !== activeProduct.id) {
        autoEnrichTriggeredRef.current = activeProduct.id;
        handleAutoEnrich();
      }
    }
    if (!isOpen) {
      autoEnrichTriggeredRef.current = null;
    }
  }, [isOpen, activeProduct?.id, score]);

  const handleAutoEnrich = async () => {
    if (!activeProduct || isEnriching) return;
    setIsEnriching(true);
    setCurrentStep(1);

    // Smooth step & score animation in parallel with network call
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < 3) return prev + 1;
        return prev;
      });
      setAnimatedScore(prev => Math.min(prev + 10, 90));
    }, 450);

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
      clearInterval(stepInterval);

      if (res.ok && data.success && data.product) {
        setCurrentStep(4);
        setAnimatedScore(100);

        const enrichedProd = {
          ...data.product,
          variants: data.variants && data.variants.length > 0 ? data.variants : (activeProduct.variants || [])
        };
        setCurrentProduct(enrichedProd);

        notifier.success(`✨ ${activeProduct.canonicalName || activeProduct.name} enriched to 100%`);

        if (onEnriched) {
          onEnriched(enrichedProd);
        }
      } else {
        throw new Error(data.error || 'Enrichment failed');
      }
    } catch (err) {
      clearInterval(stepInterval);
      console.error('Enrichment Error:', err);
      notifier.error(`Enrichment notice: ${err.message}`);
    } finally {
      setIsEnriching(false);
    }
  };

  if (!activeProduct) return null;

  const displayScore = isEnriching ? animatedScore : score;
  const isComplete = displayScore >= 100;
  const activeColor = isComplete ? '#059669' : color;
  const activeBg = isComplete ? '#ecfdf5' : bgColor;
  const activeBorder = isComplete ? '#a7f3d0' : borderColor;

  return (
    <StandardDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Data Quality: ${activeProduct.canonicalName || activeProduct.name || 'Product'}`}
      subtitle="Product completeness breakdown & automatic AI enrichment"
      width="min(560px, 100vw)"
    >
      <div style={{
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.2rem',
        minHeight: '100%',
        boxSizing: 'border-box'
      }}>
        
        {/* Header Clinical Meter Card */}
        <div style={{
          padding: '1.25rem',
          borderRadius: '12px',
          backgroundColor: activeBg,
          border: `1px solid ${activeBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          transition: 'all 0.4s ease'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: activeColor }}>
                Data Completeness {isComplete ? '(Complete)' : `(${statusLabel})`}
              </div>
              {schemaType && (
                <span style={{
                  fontSize: '0.65rem', fontWeight: 600,
                  backgroundColor: '#ffffff', color: '#334155',
                  padding: '2px 8px', borderRadius: '20px',
                  border: '1px solid #cbd5e1', textTransform: 'uppercase', letterSpacing: '0.04em'
                }}>
                  {schemaType}
                </span>
              )}
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>
              {displayScore}% Complete
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>
              {isComplete ? 'All authoritative clinical & commercial parameters are complete.' : (isEnriching ? 'Synthesizing missing fields in real-time...' : `Missing ${missingFields.length} field(s) to reach 100%.`)}
            </div>
          </div>

          <div style={{
            width: '62px',
            height: '62px',
            borderRadius: '50%',
            backgroundColor: 'white',
            border: `3px solid ${activeColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.15rem',
            fontWeight: 800,
            color: activeColor,
            flexShrink: 0,
            boxShadow: isEnriching ? `0 0 16px ${activeColor}40` : 'none',
            transition: 'all 0.4s ease'
          }}>
            {isEnriching ? (
              <RefreshCw size={22} className="animate-spin" style={{ color: activeColor }} />
            ) : (
              `${displayScore}%`
            )}
          </div>
        </div>

        {/* Minimal Animated Progress Bar */}
        <div style={{ width: '100%', height: '6px', borderRadius: '3px', backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
          <div style={{
            width: `${displayScore}%`,
            height: '100%',
            backgroundColor: activeColor,
            transition: 'width 0.4s ease-out'
          }} />
        </div>

        {/* Live Stepper when Enriching */}
        {isEnriching && (
          <div style={{
            padding: '1rem',
            borderRadius: '10px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RefreshCw size={14} className="animate-spin" style={{ color: '#0284c7' }} />
              <span>Advancing Product Completeness with AI & PubChem...</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {ENRICHMENT_STEPS.map((s) => {
                const Icon = s.icon;
                const isPast = s.id < currentStep;
                const isCurrent = s.id === currentStep;
                return (
                  <div
                    key={s.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      fontSize: '0.78rem',
                      opacity: isPast || isCurrent ? 1 : 0.45,
                      color: isCurrent ? '#0284c7' : (isPast ? '#059669' : '#64748b'),
                      fontWeight: isCurrent ? 700 : 500,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: isPast ? '#ecfdf5' : (isCurrent ? '#e0f2fe' : '#f1f5f9'),
                      border: `1px solid ${isPast ? '#10b981' : (isCurrent ? '#0284c7' : '#cbd5e1')}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {isPast ? <CheckCircle2 size={13} style={{ color: '#059669' }} /> : <Icon size={12} />}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span>{s.label}</span>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 400 }}>{s.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Missing Fields Checklist */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.65rem' }}>
            {isComplete ? 'All Parameters Verified (100%)' : `Required Parameters (${missingFields.length} missing)`}
          </div>

          {isComplete || missingFields.length === 0 ? (
            <div style={{
              padding: '1rem',
              borderRadius: '10px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#15803d',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              fontSize: '0.82rem',
              lineHeight: 1.45
            }}>
              <CheckCircle2 size={18} style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', marginBottom: '0.2rem', color: '#14532d' }}>Authoritative Data Quality Reached</strong>
                All molecular properties, compounding indications, pharmacopeial grades, and pricing formats match clinical guidelines for {schemaType}.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {missingFields.map((field, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.65rem 0.85rem',
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

        {/* AI Action CTA Button (Mobile Friendly min 48px touch target) */}
        <div style={{
          paddingTop: '0.85rem',
          borderTop: '1px solid #e2e8f0',
          marginTop: 'auto',
          position: 'sticky',
          bottom: 0,
          background: '#ffffff'
        }}>
          <button
            onClick={handleAutoEnrich}
            disabled={isEnriching || isComplete}
            style={{
              width: '100%',
              minHeight: '48px',
              padding: '0.75rem 1.25rem',
              borderRadius: '8px',
              backgroundColor: isComplete ? '#059669' : (isEnriching ? '#475569' : '#003666'),
              color: 'white',
              border: 'none',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: (isEnriching || isComplete) ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 6px rgba(0, 54, 102, 0.2)'
            }}
          >
            {isEnriching ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                <span>Searching & Enriching Data...</span>
              </>
            ) : isComplete ? (
              <>
                <CheckCircle2 size={18} />
                <span>Product 100% Enriched</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Enrich Product to 100%</span>
              </>
            )}
          </button>
        </div>

      </div>
    </StandardDrawer>
  );
}
