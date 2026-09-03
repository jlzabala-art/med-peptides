import { Dna } from '@/lib/icons';
import { Heart } from '@/lib/icons';
import { Activity } from '@/lib/icons';
import { FileText } from '@/lib/icons';
import { Sparkles } from '@/lib/icons';
import { ChevronRight } from '@/lib/icons';
import { Plus } from '@/lib/icons';
import { Check } from '@/lib/icons';
import { ShieldCheck } from '@/lib/icons';
import { Smartphone } from '@/lib/icons';
import { Cpu } from '@/lib/icons';
import { ArrowRight } from '@/lib/icons';
/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';














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

export default function EternaDiagnosticsShowcase({ onSelectProduct }) {
  const [activeTab, setActiveTab] = useState('aging');
  const isMobile = useMediaQuery('(max-width: 768px)'); // 'aging', 'wearables', 'biomarkers'

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

  // Eterna Longevity Platform product payload for Cart integration
  const eternaProduct = {
    id: "eterna-longevity-platform",
    name: "ETERNA® Longevity Platform",
    displayName: "ETERNA® Longevity Platform",
    slug: "eterna-longevity-platform",
    productType: "diagnostic",
    isDiagnostic: true,
    pricing: {
      retail: {
        perUnit: 400,
        currency: "USD"
      }
    }
  };

  const handleAddToCart = () => {
    window.dispatchEvent(new CustomEvent('add-to-cart-direct', {
      detail: { product: eternaProduct, delta: 1 }
    }));
  };

  const handleViewDetails = () => {
    if (onSelectProduct) {
      onSelectProduct(eternaProduct);
    } else {
      window.location.href = `/testing/eterna-longevity-platform`;
    }
  };

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
        <div className="section-header" style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 2.5rem' }}>
          <div className="section-eyebrow" style={{ color: '#0284c7', borderColor: 'rgba(2, 132, 199, 0.25)', background: 'rgba(2, 132, 199, 0.08)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.85rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.06em' }}>
            <Sparkles size={13} /> LONGEVITY DIAGNOSTICS · ETERNA®
          </div>

          <h2 className="section-title" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 850, letterSpacing: '-0.02em', margin: '0.6rem 0 0.4rem' }}>
            ETERNA® Longevity Diagnostics
          </h2>
          <p className="section-subtitle" style={{ fontSize: 'clamp(0.92rem, 1.8vw, 1.05rem)', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 auto' }}>
            Clinical-grade multi-omics integrating genetics, proteomics and real-time biometrics into a unified healthspan trajectory.
          </p>
        </div>

        {/* Two-Column Showcase Area on Laptop / Dashboard First on Mobile */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: isMobile ? '2rem' : '3.5rem', 
          alignItems: 'center',
          marginBottom: '3.5rem'
        }}>
          {/* Left Column (Desktop Only or Bottom on Mobile): Value Prop & Metrics */}
          {!isMobile && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.85rem', color: 'var(--text-main)' }}>
                The Unified Health Span Dashboard
              </h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: '1.5rem', fontSize: '0.925rem' }}>
                Instead of isolated lab values, Eterna analyzes your biological aging rate across major organ systems, identifying exact protocols to optimize your healthspan.
              </p>

              {/* Checklist of what it includes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.75rem' }}>
                {[
                  { title: "700k+ Genetic Marker Sequencer", detail: "Lifetime predisposition map" },
                  { title: "1,000+ Protein Biomarker Profiling", detail: "Organ-system biological age tracking" },
                  { title: "Continuous Wearable & Lab Sync", detail: "Links Oura, Apple Watch & clinical bloodwork" }
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
                    <div style={{ 
                      flexShrink: 0, width: '18px', height: '18px', borderRadius: '50%',
                      background: 'rgba(2, 132, 199, 0.12)', border: '1px solid rgba(2, 132, 199, 0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7', marginTop: '2px'
                    }}>
                      <Check size={11} strokeWidth={3} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>{item.title}</h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '1px 0 0' }}>{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                onClick={handleViewDetails}
                style={{
                  padding: '0.75rem 1.75rem',
                  borderRadius: '999px',
                  background: 'var(--primary, #003666)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(0, 54, 102, 0.15)',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(0, 54, 102, 0.25)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 54, 102, 0.15)';
                }}
              >
                Explore Eterna Platform <ArrowRight size={15} />
              </button>
            </motion.div>
          )}

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
                <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  12 Month License Active <ShieldCheck size={12} />
                </span>
              </div>

            </div>

            {/* Mobile 2x2 Benefits Grid & CTA */}
            {isMobile && (
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                  {[
                    { val: '700K+', lbl: 'Genetic markers' },
                    { val: '1,000+', lbl: 'Protein biomarkers' },
                    { val: '24/7', lbl: 'Wearables sync' },
                    { val: 'PDF', lbl: 'Bloodwork import' },
                  ].map((stat, i) => (
                    <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '0.75rem 0.65rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--primary, #003666)' }}>{stat.val}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>{stat.lbl}</div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleViewDetails}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1.5rem',
                    borderRadius: '999px',
                    background: 'var(--primary, #003666)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 14px rgba(0, 54, 102, 0.15)'
                  }}
                >
                  Explore Eterna Platform <ArrowRight size={15} />
                </button>
              </div>
            )}

            {/* Back decorative mockup circle wireframe */}
            <div style={{
              position: 'absolute', top: '-7%', right: '-7%', width: '114%', height: '114%',
              border: '1px dashed rgba(2, 132, 199, 0.25)', borderRadius: '50%',
              zIndex: 1, pointerEvents: 'none'
            }} />
          </motion.div>

        </div>

      </div>
    </div>
  );
}