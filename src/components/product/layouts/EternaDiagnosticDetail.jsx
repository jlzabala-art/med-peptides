import { Dna } from '@/lib/icons';
import { Heart } from '@/lib/icons';
import { Activity } from '@/lib/icons';
import { FileText } from '@/lib/icons';
import { Sparkles } from '@/lib/icons';
import { ChevronRight } from '@/lib/icons';
import { Plus } from '@/lib/icons';
import { Minus } from '@/lib/icons';
import { Check } from '@/lib/icons';
import { ShieldCheck } from '@/lib/icons';
import { Smartphone } from '@/lib/icons';
import { Cpu } from '@/lib/icons';
import { ArrowRight } from '@/lib/icons';
/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';














import { X } from '@/lib/icons';
import { formatPrice, resolveVariantPrice } from '@/services/pricingService';

function useMediaQuery(query) {
  const [matches, setMatches] = React.useState(false);
  React.useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);
  return matches;
}

export default function EternaDiagnosticDetail({
  product,
  region,
  isProfessional,
  isAdmin,
  isMobile: propsIsMobile,
  onClose,
  isQuickView = false
}) {
  const [activeTab, setActiveTab] = useState('aging');
  const [selectedVariant, setSelectedVariant] = useState(product?.variants?.[0] || product);
  
  const isMobile = propsIsMobile || useMediaQuery('(max-width: 768px)'); 

  const displayPrice = React.useMemo(() => {
    if (!selectedVariant) return '—';
    const tier = isProfessional ? 'wholesale' : 'retail';
    
    if (selectedVariant.unit_price) {
        return formatPrice(selectedVariant.unit_price, 'USD', region);
    }
    
    const resolvedPrice = resolveVariantPrice(selectedVariant, { tier, countryCode: region });
    if (resolvedPrice.perUnit != null) {
      return formatPrice(resolvedPrice.perUnit, resolvedPrice.currency ?? 'USD', region);
    }
    return '—';
  }, [selectedVariant, isProfessional, region]);

  const renderAgingContent = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, uppercase: true }}>BIOLOGICAL AGE METRIC</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '2px' }}>
            Rate: <span style={{ color: '#22c55e' }}>0.82 / Year</span>
          </div>
        </div>
        <div style={{ 
          padding: '0.35rem 0.75rem', borderRadius: '100px', 
          background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)',
          fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-success)'
        }}>
          SLOW AGING
        </div>
      </div>

      {/* Organ Age Estimator Blocks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {[
          { organ: "Brain & Nervous System", diff: "-4.2 Years", score: "Optimal", color: "#0ea5e9", pct: 92 },
          { organ: "Cardiovascular System", diff: "-2.8 Years", score: "Optimal", color: "#e11d48", pct: 86 },
          { organ: "Immune & Inflammatory age", diff: "-5.1 Years", score: "Optimized", color: "#9333ea", pct: 95 }
        ].map((item, i) => (
          <div key={i} style={{ 
            padding: '0.9rem 1.1rem', borderRadius: '12px',
            background: 'var(--background)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>{item.organ}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Deviation vs Chronological: <span style={{ color: '#22c55e', fontWeight: 700 }}>{item.diff}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: item.color }}>{item.score}</div>
              {/* Small health progress bar */}
              <div style={{ width: '45px', height: '4px', background: 'var(--border)', borderRadius: '99px', marginTop: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${item.pct}%`, height: '100%', background: item.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderWearablesContent = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, uppercase: true }}>TELEMETRY STATUS</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '2px' }}>
            Continuous Sync Active
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {['Apple Watch', 'Garmin', 'Oura'].map((d, idx) => (
            <div key={idx} style={{ 
              width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e',
              boxShadow: '0 0 8px rgba(34, 197, 94, 0.4)'
            }} title={d} />
          ))}
        </div>
      </div>

      {/* Wearable metric grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        {[
          { title: "Sleep Architecture", val: "88%", label: "Restful Sleep", color: "#0ea5e9" },
          { title: "Heart Rate Variability", val: "78 ms", label: "+14% Baseline", color: "#9333ea" },
          { title: "Resting Heart Rate", val: "54 bpm", label: "Athletic/Optimal", color: "var(--color-success)" },
          { title: "Recovery Index", val: "94/100", label: "Ready for Load", color: "#ca8a04" }
        ].map((m, i) => (
          <div key={i} style={{
            padding: '0.85rem 1rem', borderRadius: '12px',
            background: 'var(--background)', border: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', gap: '0.2rem'
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>{m.title}</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>{m.val}</span>
            <span style={{ fontSize: '0.7rem', color: m.color, fontWeight: 700 }}>{m.label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBiomarkersContent = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, uppercase: true }}>CENTRALIZED PATHOLOGY</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '2px' }}>
            Last Report: April 2026
          </div>
        </div>
        <div style={{ 
          padding: '0.3rem 0.6rem', borderRadius: '6px', 
          background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.2)',
          fontSize: '0.65rem', fontWeight: 800, color: '#a855f7', display: 'flex', alignItems: 'center', gap: '0.25rem'
        }}>
          <Check size={10} strokeWidth={3} /> PARSED PDF
        </div>
      </div>

      {/* Biomarker list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {[
          { marker: "Apolipoprotein B (ApoB)", value: "72 mg/dL", target: "< 80 mg/dL", status: "Optimal", color: "var(--color-success)" },
          { marker: "Glycated Hemoglobin (HbA1c)", value: "4.9%", target: "< 5.3%", status: "Optimal", color: "var(--color-success)" },
          { marker: "High-Sensitivity CRP (hs-CRP)", value: "0.28 mg/L", target: "< 1.0 mg/L", status: "Optimized", color: "var(--color-success)" },
          { marker: "Lipoprotein(a)", value: "18 nmol/L", target: "< 75 nmol/L", status: "Low Risk", color: "#0ea5e9" }
        ].map((b, i) => (
          <div key={i} style={{ 
            padding: '0.7rem 0.9rem', borderRadius: '10px',
            background: 'var(--background)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>{b.marker}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '1px' }}>Target: {b.target}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>{b.value}</div>
              <span style={{ fontSize: '0.65rem', color: b.color, fontWeight: 700 }}>{b.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // We now use the real passed 'product' and 'selectedVariant' directly in AddToCartButton


  const [quantity, setQuantity] = useState(1);
  
  if (isProfessional || isAdmin) {
    return (
      <div className="container" style={{ padding: '2rem 0', minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        {/* Back Navigation */}
        {onClose && (
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={onClose}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', background: 'var(--color-bg-muted)',
              border: '1px solid var(--border)', borderRadius: '6px',
              color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <ArrowRight style={{ transform: 'rotate(180deg)' }} size={14} /> Back to Catalog
          </button>
        </div>
        )}

        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          {/* Left Column: Title & Description */}
          <div style={{ flex: '1 1 500px' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              {product?.name || "ETERNA® Platform Kit"}
            </h1>
            <div style={{ display: 'inline-block', padding: '4px 8px', background: 'var(--color-bg-muted)', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              CLINICAL WHOLESALE PORTAL
            </div>
            
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
              {product?.description || "Advanced diagnostic kit designed for clinical deployment. Provides comprehensive analysis with HIPAA/GDPR compliant reporting directly to your EMR system."}
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'var(--background)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)' }}>Clinical Grade Compliance</h4>
                  <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>ISO 15189 Certified Lab Processing</p>
                </div>
              </div>
              <div style={{ padding: '1rem', background: 'var(--background)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
                  <Activity size={20} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)' }}>EMR Integration</h4>
                  <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>HL7 & FHIR compatible data feeds</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing & Action */}
          <div style={{ flex: '1 1 350px' }}>
            <div style={{ padding: '2rem', background: 'var(--background)', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Wholesale Price
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)', margin: '0.5rem 0' }}>
                {displayPrice}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                Per Unit (Bulk discounts applied automatically at checkout)
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Quantity</div>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', width: 'fit-content' }}>
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{ padding: '0.75rem 1rem', background: 'var(--color-bg-muted)', border: 'none', borderRight: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-main)' }}
                  >
                    <Minus size={16} />
                  </button>
                  <div style={{ padding: '0 1.5rem', fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
                    {quantity}
                  </div>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    style={{ padding: '0.75rem 1rem', background: 'var(--color-bg-muted)', border: 'none', borderLeft: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-main)' }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <button
                onClick={() => onAddToCart && onAddToCart(selectedVariant || product, quantity)}
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '8px',
                  background: 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-primary-dark)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--color-primary)'}
              >
                Add {quantity} to Bulk Order
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="container" style={{ position: 'relative', zIndex: 1 }}>
      {/* Background radial glow */}
      <div style={{
        position: 'absolute', top: '10%', right: '15%', width: '35%', height: '40%',
        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, transparent 70%)',
        filter: 'blur(80px)', pointerEvents: 'none', zIndex: 1
      }} />
      <div style={{
        position: 'absolute', bottom: '15%', left: '10%', width: '30%', height: '35%',
        background: 'radial-gradient(circle, rgba(34, 211, 238, 0.06) 0%, transparent 70%)',
        filter: 'blur(90px)', pointerEvents: 'none', zIndex: 1
      }} />

      <div>
        {/* Section Header */}
        <div className="section-header">
          <div className="section-eyebrow" style={{ color: '#a855f7', borderColor: 'rgba(168, 85, 247, 0.25)', background: 'rgba(168, 85, 247, 0.1)' }}>
            <Sparkles size={14} /> EXCLUSIVE BIOMARKER INTEGRATION
          </div>

          <h2 className="section-title">
            ETERNA® Longevity Diagnostics
          </h2>
          <p className="section-subtitle">
            Optimize your research with clinical-grade multi-omics. Eterna combines DNA profiles, 
            organ-level proteomics, real-time wearables, and automated bloodwork parsing.
          </p>
        </div>

        {/* Two-Column Showcase Area */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '4rem', 
          alignItems: 'center',
          marginBottom: '5.5rem'
        }}>
          {/* Left Column: Product Info & Core Value Prop */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-main)' }}>
              The Unified Health Span Dashboard
            </h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2rem', fontSize: '0.975rem' }}>
              Instead of isolated lab values, Eterna analyzes your aging trajectory across organ systems. 
              By cross-referencing your genetics with functional proteomic changes and daily biometrics, 
              the system tracks how you age, why, and exactly which protocols mitigate specific risk factors.
            </p>

            {/* Checklist of what it includes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
              {[
                { title: "700k+ Genetic Marker Sequencer", detail: "Provides lifetime genetic predisposition map." },
                { title: "1,000+ Protein Biomarker Profiling", detail: "Calculates individual organ system biological age." },
                { title: "Continuous Wearable & Telemetry Sync", detail: "Links Oura, Apple Watch, Garmin, and Fitbit." },
                { title: "Automated PDF Bloodwork Uploader", detail: "Parses standard clinical panels (HbA1c, ApoB, hs-CRP)." }
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ 
                    flexShrink: 0, width: '20px', height: '20px', borderRadius: '50%',
                    background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7', marginTop: '2px'
                  }}>
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>{item.title}</h4>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Box */}
            <div style={{
              background: 'var(--background)',
              border: '1px solid var(--border)',
              borderRadius: '24px',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              boxShadow: 'var(--shadow-md)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>COMPLETE PACKAGE</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>{product?.name || "ETERNA® Platform Kit"}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)' }}>{displayPrice}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Includes 12-Month Access</div>
                </div>
              </div>

              <div style={{ width: '100%', marginTop: '0.5rem' }}>
                <button
                  onClick={() => onAddToCart && onAddToCart(selectedVariant || product, 1)}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '14px',
                    background: 'var(--primary)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1rem',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <Package size={18} /> Add to Order
                </button>
              </div>
            </div>

          </motion.div>

          {/* Right Column: Interactive App Interface Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ position: 'relative' }}
          >
            {/* App Outer shell */}
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '28px',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-lg)',
              position: 'relative',
              zIndex: 2,
              overflow: 'hidden'
            }}>
              {/* App Status Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.75rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-danger)' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#eab308' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e' }} />
                <div style={{ flex: 1 }} />
                <div style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.35rem', 
                  fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 
                }}>
                  <Smartphone size={12} /> ETERNA DX CLIENT PORTAL
                </div>
              </div>

              {!isMobile ? (
                <>
                  {/* App Tab selectors */}
                  <div style={{
                    display: 'flex',
                    background: 'var(--background)',
                    padding: '0.3rem',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    marginBottom: '1.75rem'
                  }}>
                    {[
                      { id: 'aging', label: 'Rate of Aging', icon: <Dna size={14} /> },
                      { id: 'wearables', label: 'Wearable Sync', icon: <Activity size={14} /> },
                      { id: 'biomarkers', label: 'Biomarkers', icon: <FileText size={14} /> }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          padding: '0.6rem 0.5rem',
                          borderRadius: '8px',
                          background: activeTab === tab.id ? 'rgba(168, 85, 247, 0.1)' : 'transparent',
                          color: activeTab === tab.id ? '#a855f7' : 'var(--text-muted)',
                          border: activeTab === tab.id ? '1px solid rgba(168, 85, 247, 0.2)' : '1px solid transparent',
                          fontSize: '0.78rem',
                          fontWeight: activeTab === tab.id ? 700 : 500,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {tab.icon}
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Dynamic App content screen */}
                  <div style={{ minHeight: '260px', position: 'relative' }}>
                    <AnimatePresence mode="wait">
                      {activeTab === 'aging' && (
                        <motion.div key="aging" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                          {renderAgingContent()}
                        </motion.div>
                      )}
                      {activeTab === 'wearables' && (
                        <motion.div key="wearables" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                          {renderWearablesContent()}
                        </motion.div>
                      )}
                      {activeTab === 'biomarkers' && (
                        <motion.div key="biomarkers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                          {renderBiomarkersContent()}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                /* Mobile Accordion */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  {[
                    { id: 'aging', label: 'Rate of Aging', icon: <Dna size={16} />, content: renderAgingContent },
                    { id: 'wearables', label: 'Wearable Sync', icon: <Activity size={16} />, content: renderWearablesContent },
                    { id: 'biomarkers', label: 'Biomarkers', icon: <FileText size={16} />, content: renderBiomarkersContent }
                  ].map(tab => (
                    <div key={tab.id} style={{
                      border: '1px solid var(--border)',
                      borderRadius: '16px',
                      background: 'var(--background)',
                      overflow: 'hidden'
                    }}>
                      <button
                        onClick={() => setActiveTab(activeTab === tab.id ? null : tab.id)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '1rem 1.25rem',
                          background: activeTab === tab.id ? 'rgba(168, 85, 247, 0.05)' : 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: activeTab === tab.id ? '#a855f7' : 'var(--text-main)',
                          fontWeight: 700,
                          fontSize: '0.9rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {tab.icon}
                          <span>{tab.label}</span>
                        </div>
                        <ChevronRight size={16} style={{ 
                          transform: activeTab === tab.id ? 'rotate(90deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease'
                        }} />
                      </button>
                      <AnimatePresence>
                        {activeTab === tab.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div style={{ padding: '0 1.25rem 1.25rem' }}>
                              {tab.content()}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              )}

              {/* Dashboard Action Footer */}
              <div style={{ 
                marginTop: '1.75rem', paddingTop: '1.25rem',
                borderTop: '1px solid var(--border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>SECURE HEALTH PROFILE (GDPR)</span>
                <span style={{ fontSize: '0.72rem', color: '#a855f7', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  12 Month License Active <ShieldCheck size={12} />
                </span>
              </div>

            </div>

            {/* Back decorative mockup circle wireframe */}
            <div style={{
              position: 'absolute', top: '-7%', right: '-7%', width: '114%', height: '114%',
              border: '1px dashed rgba(168, 85, 247, 0.25)', borderRadius: '50%',
              zIndex: 1, pointerEvents: 'none'
            }} />
          </motion.div>

        </div>


      </div>
    </div>
  );
}