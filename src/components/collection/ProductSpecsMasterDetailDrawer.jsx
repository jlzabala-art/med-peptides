"use client";

import React, { useState, useMemo } from 'react';
import StandardDrawer from '@/components/ui/StandardDrawer';
import {
  Sparkles,
  ShieldCheck,
  Microscope,
  Zap,
  Layers,
  FileText,
  Copy,
  Check,
  Search,
  MessageSquare,
  Download,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  Droplets,
  FlaskConical,
  Award,
  Clock,
  Info
} from '@/lib/icons';
import { getProductTechnicalDetails } from '@/data/productClinicalSpecsRegistry';
import toast from 'react-hot-toast';

export default function ProductSpecsMasterDetailDrawer({
  isOpen,
  onClose,
  product,
  brandSlug = 'colway',
  isEs = false,
  onPrevProduct = null,
  onNextProduct = null,
  hasPrev = false,
  hasNext = false,
  onQuickAdd = null,
  onWhatsAppInquiry = null,
  onViewProduct = null,
  regulatoryBadges = []
}) {
  const [activeTab, setActiveTab] = useState('actives'); // 'actives' | 'formula' | 'regulatory' | 'ordering'
  const [inciSearch, setInciSearch] = useState('');
  const [inciFilter, setInciFilter] = useState('all'); // 'all' | 'active' | 'excipient'
  const [copiedInci, setCopiedInci] = useState(false);
  const [copiedSeq, setCopiedSeq] = useState(false);

  const specs = useMemo(() => {
    if (!product) return null;
    return getProductTechnicalDetails(product, brandSlug);
  }, [product, brandSlug]);

  if (!product || !specs) return null;

  const displayName = product.name || product.title || 'Formulation';
  const categoryLabel = product.category || product.department || 'Formulation';
  const imageSrc = product.image || product.imageUrl || product.thumbnail || '/images/products/placeholder.png';
  const volumePresentation = product.volume || product.presentation || product.dosage || product.sampleType || '';

  // Filtered ingredients for INCI tab
  const filteredIngredients = (specs.ingredients || []).filter(ing => {
    const isAct = ing.inci_group === 'functional_active' || ing.inci_group === 'active';
    if (inciFilter === 'active' && !isAct) return false;
    if (inciFilter === 'excipient' && isAct) return false;
    if (!inciSearch.trim()) return true;
    const q = inciSearch.toLowerCase();
    return (
      (ing.inci_name && ing.inci_name.toLowerCase().includes(q)) ||
      (ing.common_name && ing.common_name.toLowerCase().includes(q)) ||
      (ing.function && Array.isArray(ing.function) ? ing.function.join(' ').toLowerCase().includes(q) : String(ing.function || '').toLowerCase().includes(q)) ||
      (ing.role && ing.role.toLowerCase().includes(q)) ||
      (ing.origin && ing.origin.toLowerCase().includes(q))
    );
  });

  const handleCopyInciList = () => {
    if (!specs.ingredients || specs.ingredients.length === 0) return;
    const inciString = specs.ingredients.map(i => i.inci_name).join(', ');
    navigator.clipboard.writeText(inciString);
    setCopiedInci(true);
    toast.success(isEs ? 'Lista oficial INCI copiada al portapapeles ✓' : 'Official INCI list copied to clipboard ✓');
    setTimeout(() => setCopiedInci(false), 2200);
  };

  const handleCopySequence = () => {
    if (!specs.sequence) return;
    navigator.clipboard.writeText(specs.sequence);
    setCopiedSeq(true);
    toast.success(isEs ? 'Secuencia de aminoácidos copiada ✓' : 'Amino acid sequence copied ✓');
    setTimeout(() => setCopiedSeq(false), 2200);
  };

  // Determine Tab titles according to product specification type
  const tabTitles = {
    actives: specs.type === 'inci'
      ? (isEs ? 'Activos Clave' : 'Bioactive Actives')
      : specs.type === 'peptide_monograph'
      ? (isEs ? 'Monografía' : 'Monograph & Bio')
      : specs.type === 'diagnostic'
      ? (isEs ? 'Biomarcadores' : 'Biomarkers')
      : (isEs ? 'Principios Activos' : 'Standardized Actives'),
    formula: specs.type === 'inci'
      ? (isEs ? 'Fórmula INCI' : 'Qualitative INCI')
      : specs.type === 'peptide_monograph'
      ? (isEs ? 'Especificaciones HPLC' : 'Analytical Specs')
      : specs.type === 'diagnostic'
      ? (isEs ? 'Metodología & Matriz' : 'Methodology & Matrix')
      : (isEs ? 'Matriz & Liberación' : 'Delivery Matrix'),
    regulatory: isEs ? 'Regulación & Calidad' : 'Compliance & Quality',
    ordering: isEs ? 'Ficha & Pedidos' : 'Datasheet & Order'
  };

  return (
    <StandardDrawer
      isOpen={isOpen}
      onClose={onClose}
      width="620px"
      hideHeader={true}
      bodyPadding="0px"
      disableBodyScroll={true}
      zIndex={10000}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '100vh', background: '#f8fafc' }}>
        
        {/* ── TOP GCP BAR: Navigation between formulations & Close ── */}
        <div style={{
          padding: '12px 18px',
          background: '#0f172a',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #1e293b',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '0.68rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#38bdf8',
              background: 'rgba(56, 189, 248, 0.12)',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid rgba(56, 189, 248, 0.25)'
            }}>
              <SlidersHorizontalIcon />
              <span>{isEs ? 'Inspector de Ficha Técnica' : 'Formulation Inspector'}</span>
            </span>

            <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
              • {brandSlug === 'colway' ? 'Colway® Biotech' : brandSlug === 'peptides' ? 'Lotusland Peptides' : 'Atlas Clinical'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {onPrevProduct && (
              <button
                type="button"
                onClick={onPrevProduct}
                disabled={!hasPrev}
                title={isEs ? 'Formulación anterior' : 'Previous formulation'}
                style={{
                  background: hasPrev ? '#1e293b' : 'transparent',
                  border: '1px solid #334155',
                  color: hasPrev ? '#f8fafc' : '#475569',
                  borderRadius: '5px',
                  padding: '4px 8px',
                  cursor: hasPrev ? 'pointer' : 'not-allowed',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  fontSize: '0.70rem',
                  fontWeight: 600,
                  transition: 'all 0.15s ease'
                }}
              >
                <ChevronLeft size={13} />
                <span className="hidden sm:inline">{isEs ? 'Ant.' : 'Prev'}</span>
              </button>
            )}

            {onNextProduct && (
              <button
                type="button"
                onClick={onNextProduct}
                disabled={!hasNext}
                title={isEs ? 'Formulación siguiente' : 'Next formulation'}
                style={{
                  background: hasNext ? '#1e293b' : 'transparent',
                  border: '1px solid #334155',
                  color: hasNext ? '#f8fafc' : '#475569',
                  borderRadius: '5px',
                  padding: '4px 8px',
                  cursor: hasNext ? 'pointer' : 'not-allowed',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  fontSize: '0.70rem',
                  fontWeight: 600,
                  transition: 'all 0.15s ease'
                }}
              >
                <span className="hidden sm:inline">{isEs ? 'Sig.' : 'Next'}</span>
                <ChevronRight size={13} />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              title={isEs ? 'Cerrar inspector (Esc)' : 'Close inspector (Esc)'}
              style={{
                background: '#1e293b',
                border: '1px solid #334155',
                color: '#cbd5e1',
                borderRadius: '5px',
                padding: '4px 7px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '4px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#dc2626';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.borderColor = '#dc2626';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1e293b';
                e.currentTarget.style.color = '#cbd5e1';
                e.currentTarget.style.borderColor = '#334155';
              }}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ── PRODUCT SUMMARY CARD (GCP Resource Header) ── */}
        <div style={{
          padding: '16px 20px',
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px',
          flexShrink: 0
        }}>
          {/* Thumbnail */}
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '8px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            padding: '4px'
          }}>
            <img
              src={imageSrc}
              alt={displayName}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>

          {/* Titles & Meta */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginBottom: '4px' }}>
              <span style={{
                fontSize: '0.66rem',
                fontWeight: 800,
                color: '#0d9488',
                background: '#f0fdfa',
                border: '1px solid #99f6e4',
                padding: '2px 7px',
                borderRadius: '4px',
                textTransform: 'uppercase'
              }}>
                {categoryLabel}
              </span>

              {volumePresentation && (
                <span style={{
                  fontSize: '0.66rem',
                  fontWeight: 700,
                  color: '#475569',
                  background: '#f1f5f9',
                  padding: '2px 7px',
                  borderRadius: '4px'
                }}>
                  {volumePresentation}
                </span>
              )}
            </div>

            <h2 style={{
              margin: '0 0 6px 0',
              fontSize: '1.05rem',
              fontWeight: 800,
              color: '#0f172a',
              lineHeight: 1.3
            }}>
              {displayName}
            </h2>

            {/* Regulatory Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {regulatoryBadges.map((rb, idx) => (
                <span
                  key={idx}
                  title={rb.title}
                  style={{
                    fontSize: '0.64rem',
                    fontWeight: 750,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: rb.bg,
                    color: rb.color,
                    border: `1px solid ${rb.border}`
                  }}
                >
                  {rb.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── GCP SEGMENTED NAVIGATION TABS ── */}
        <div style={{
          display: 'flex',
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '0 16px',
          gap: '4px',
          flexShrink: 0,
          overflowX: 'auto'
        }}>
          {[
            { id: 'actives', label: tabTitles.actives, icon: Sparkles },
            { id: 'formula', label: tabTitles.formula, icon: Layers },
            { id: 'regulatory', label: tabTitles.regulatory, icon: ShieldCheck },
            { id: 'ordering', label: tabTitles.ordering, icon: FileText }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 14px',
                  border: 'none',
                  borderBottom: isActive ? '2px solid #0d9488' : '2px solid transparent',
                  background: 'transparent',
                  color: isActive ? '#0d9488' : '#64748b',
                  fontSize: '0.78rem',
                  fontWeight: isActive ? 800 : 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={14} color={isActive ? '#0d9488' : '#64748b'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── TAB CONTENT SCROLL AREA ── */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>

          {/* ═════════ TAB 1: BIOACTIVE ACTIVES & SCIENCE ═════════ */}
          {activeTab === 'actives' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Key Actives Matrix (Colway / INCI) */}
              {specs.type === 'inci' && (
                <>
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '14px 16px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                  }}>
                    <div style={{
                      fontSize: '0.70rem',
                      fontWeight: 800,
                      color: '#0d9488',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginBottom: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      <Sparkles size={13} color="#0d9488" />
                      <span>{isEs ? 'Matriz de Complejos Activos Clave' : 'Key Bioactive Actives Matrix'}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.84rem', color: '#0f172a', fontWeight: 600, lineHeight: 1.55 }}>
                      {specs.keyActives}
                    </p>
                  </div>

                  {specs.clinicalFocus && (
                    <div style={{
                      background: '#f0fdfa',
                      borderLeft: '4px solid #0d9488',
                      borderRight: '1px solid #ccfbf1',
                      borderTop: '1px solid #ccfbf1',
                      borderBottom: '1px solid #ccfbf1',
                      borderRadius: '6px',
                      padding: '12px 14px',
                      fontSize: '0.76rem',
                      color: '#134e4a',
                      lineHeight: 1.5
                    }}>
                      <strong>{isEs ? 'Indicación Dermatológica y Mecanismo:' : 'Dermatological Focus & Mechanism:'}</strong> {specs.clinicalFocus}
                    </div>
                  )}

                  {/* Highlights Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 14px' }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 750, color: '#64748b', textTransform: 'uppercase' }}>
                        🧬 {isEs ? 'Tecnología Molecular' : 'Molecular Technology'}
                      </div>
                      <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
                        3D Intact Freshwater Tropocollagen (Triple Helix)
                      </div>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.70rem', color: '#64748b' }}>
                        {isEs ? 'Conserva la estructura terciaria nativa de colágeno sin desnaturalización térmica.' : 'Preserves native triple-helix tertiary structure without heat degradation.'}
                      </p>
                    </div>

                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 14px' }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 750, color: '#64748b', textTransform: 'uppercase' }}>
                        🛡️ {isEs ? 'Estabilidad y Conservación' : 'Stability & Packaging'}
                      </div>
                      <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
                        Vacuum Airless Dispenser / Dark Glass
                      </div>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.70rem', color: '#64748b' }}>
                        {isEs ? 'Protección contra la fotoxidación y la degradación biológica.' : 'Shielded from UV photolysis and microbial exposure.'}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Peptide Monograph Tab 1 */}
              {specs.type === 'peptide_monograph' && (
                <>
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '14px 16px'
                  }}>
                    <div style={{ fontSize: '0.70rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase', marginBottom: '6px' }}>
                      🧬 {isEs ? 'Secuencia de Aminoácidos Certificada' : 'Certified Primary Amino Acid Sequence'}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      gap: '10px'
                    }}>
                      <code style={{ fontSize: '0.80rem', color: '#003666', fontWeight: 700, fontFamily: 'monospace', wordBreak: 'break-all' }}>
                        {specs.sequence}
                      </code>
                      <button
                        type="button"
                        onClick={handleCopySequence}
                        style={{
                          background: copiedSeq ? '#f0fdf4' : '#ffffff',
                          border: copiedSeq ? '1px solid #86efac' : '1px solid #cbd5e1',
                          color: copiedSeq ? '#16a34a' : '#475569',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.70rem',
                          fontWeight: 700,
                          flexShrink: 0
                        }}
                      >
                        {copiedSeq ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                        <span>{copiedSeq ? (isEs ? 'Copiada' : 'Copied') : (isEs ? 'Copiar' : 'Copy')}</span>
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 14px' }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 750, color: '#64748b', textTransform: 'uppercase' }}>🧪 Pureza Analítica HPLC</div>
                      <div style={{ fontSize: '0.80rem', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>{specs.purity}</div>
                    </div>
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 14px' }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 750, color: '#64748b', textTransform: 'uppercase' }}>💧 Reconstitución Clínica</div>
                      <div style={{ fontSize: '0.76rem', fontWeight: 650, color: '#0f172a', marginTop: '4px' }}>{specs.reconstitution}</div>
                    </div>
                  </div>
                </>
              )}

              {/* Diagnostic Tab 1 */}
              {specs.type === 'diagnostic' && (
                <>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ padding: '10px 14px', background: '#fef2f2', borderBottom: '1px solid #fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#991b1b', textTransform: 'uppercase' }}>
                        🩸 {isEs ? 'Panel de Biomarcadores Cuantificados (CE-IVDR)' : 'Quantified Clinical Biomarker Panel'}
                      </span>
                    </div>
                    {/* eslint-disable-next-line no-restricted-syntax */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.76rem' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.68rem', textTransform: 'uppercase' }}>
                          <th style={{ padding: '8px 12px' }}>Biomarker</th>
                          <th style={{ padding: '8px 12px' }}>Unit</th>
                          <th style={{ padding: '8px 12px' }}>Target Range</th>
                          <th style={{ padding: '8px 12px' }}>CV%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(specs.biomarkers || []).map((bm, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '8px 12px', fontWeight: 700, color: '#0f172a' }}>{bm.name}</td>
                            <td style={{ padding: '8px 12px', color: '#64748b' }}>{bm.unit}</td>
                            <td style={{ padding: '8px 12px', fontWeight: 700, color: '#16a34a' }}>{bm.target}</td>
                            <td style={{ padding: '8px 12px', color: '#dc2626', fontWeight: 700 }}>{bm.cv}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* Nutraceutical Tab 1 */}
              {specs.type === 'nutraceutical' && (
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ padding: '10px 14px', background: '#f0f9ff', borderBottom: '1px solid #e0f2fe' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase' }}>
                      ✨ {isEs ? 'Principios Activos por Dosis Diaria' : 'Standardized Principles per Daily Dose'}
                    </span>
                  </div>
                  {/* eslint-disable-next-line no-restricted-syntax */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.76rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.68rem', textTransform: 'uppercase' }}>
                        <th style={{ padding: '8px 12px' }}>Compound</th>
                        <th style={{ padding: '8px 12px' }}>Clinical Amount</th>
                        <th style={{ padding: '8px 12px' }}>Target Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(specs.actives || []).map((act, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 700, color: '#0f172a' }}>{act.name}</td>
                          <td style={{ padding: '8px 12px', fontWeight: 800, color: '#0284c7' }}>{act.amount}</td>
                          <td style={{ padding: '8px 12px', color: '#475569' }}>{act.role}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          )}

          {/* ═════════ TAB 2: QUALITATIVE FORMULA (FULL INCI) ═════════ */}
          {activeTab === 'formula' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {specs.type === 'inci' && specs.ingredients && (
                <>
                  {/* INCI Controls Header Bar */}
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    {/* Search inside INCI */}
                    <div style={{ position: 'relative', flex: '1 1 200px' }}>
                      <Search size={14} style={{ position: 'absolute', left: '10px', top: '9px', color: '#94a3b8' }} />
                      <input
                        type="text"
                        value={inciSearch}
                        onChange={(e) => setInciSearch(e.target.value)}
                        placeholder={isEs ? 'Buscar ingrediente o función...' : 'Search ingredient or function...'}
                        style={{
                          width: '100%',
                          padding: '6px 10px 6px 30px',
                          fontSize: '0.76rem',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          outline: 'none',
                          color: '#0f172a',
                          background: '#ffffff'
                        }}
                      />
                    </div>

                    {/* Filter Pills */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {[
                        { id: 'all', label: isEs ? `Todos (${specs.ingredients.length})` : `All (${specs.ingredients.length})` },
                        { id: 'active', label: isEs ? 'Activos' : 'Actives' },
                        { id: 'excipient', label: isEs ? 'Excipientes' : 'Excipients' }
                      ].map(f => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setInciFilter(f.id)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: inciFilter === f.id ? '1px solid #0d9488' : '1px solid #e2e8f0',
                            background: inciFilter === f.id ? '#f0fdfa' : '#f8fafc',
                            color: inciFilter === f.id ? '#0d9488' : '#64748b',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {f.label}
                        </button>
                      ))}

                      {/* Copy Full INCI String */}
                      <button
                        type="button"
                        onClick={handleCopyInciList}
                        title={isEs ? 'Copiar lista INCI completa' : 'Copy complete INCI string'}
                        style={{
                          padding: '5px 9px',
                          borderRadius: '5px',
                          border: copiedInci ? '1px solid #86efac' : '1px solid #0d9488',
                          background: copiedInci ? '#f0fdf4' : '#0d9488',
                          color: copiedInci ? '#16a34a' : '#ffffff',
                          fontSize: '0.70rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          marginLeft: '4px'
                        }}
                      >
                        {copiedInci ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                        <span>{copiedInci ? (isEs ? 'Copiado' : 'Copied') : (isEs ? 'Copiar INCI' : 'Copy INCI')}</span>
                      </button>
                    </div>
                  </div>

                  {/* High Density GCP Table */}
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                  }}>
                    <div style={{
                      padding: '8px 12px',
                      background: '#f8fafc',
                      borderBottom: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                        Regulation (EC) 1223/2009 • Decreasing Concentration
                      </span>
                      <span style={{ fontSize: '0.66rem', color: '#64748b' }}>
                        Showing {filteredIngredients.length} of {specs.ingredients.length}
                      </span>
                    </div>

                    <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                      {/* eslint-disable-next-line no-restricted-syntax */}
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.74rem' }}>
                        <thead style={{ position: 'sticky', top: 0, background: '#f1f5f9', zIndex: 1 }}>
                          <tr style={{ color: '#475569', fontSize: '0.66rem', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '8px 12px', width: '34%' }}>INCI Standard Name</th>
                            <th style={{ padding: '8px 12px', width: '28%' }}>Functional Role</th>
                            <th style={{ padding: '8px 12px', width: '20%' }}>Classification</th>
                            <th style={{ padding: '8px 12px', width: '18%' }}>Origin</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredIngredients.map((ing, idx) => {
                            const isFunctionalActive = ing.inci_group === 'functional_active' || ing.inci_group === 'active';
                            return (
                              <tr
                                key={idx}
                                style={{
                                  borderBottom: '1px solid #f1f5f9',
                                  background: isFunctionalActive ? 'rgba(13, 148, 136, 0.03)' : '#ffffff'
                                }}
                              >
                                <td style={{ padding: '8px 12px', fontWeight: isFunctionalActive ? 750 : 600, color: isFunctionalActive ? '#0d9488' : '#0f172a' }}>
                                  {ing.inci_name}
                                  {ing.common_name && (
                                    <div style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 450 }}>
                                      {ing.common_name}
                                    </div>
                                  )}
                                </td>
                                <td style={{ padding: '8px 12px', color: '#475569' }}>
                                  {Array.isArray(ing.function) ? ing.function.join(', ') : (ing.role || ing.function || '—')}
                                </td>
                                <td style={{ padding: '8px 12px' }}>
                                  <span style={{
                                    fontSize: '0.64rem',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontWeight: 700,
                                    background: isFunctionalActive ? '#ccfbf1' : '#f1f5f9',
                                    color: isFunctionalActive ? '#0f766e' : '#475569'
                                  }}>
                                    {ing.inci_group || 'Excipient'}
                                  </span>
                                </td>
                                <td style={{ padding: '8px 12px', color: '#64748b', fontSize: '0.68rem' }}>
                                  {ing.origin || 'Pharma Grade'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* Peptide Monograph Tab 2: HPLC / MS / Storage */}
              {specs.type === 'peptide_monograph' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 16px' }}>
                    <div style={{ fontSize: '0.70rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase', marginBottom: '8px' }}>
                      📋 Analytical Quality Control Specifications
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '0.74rem' }}>
                      <div><strong>Format:</strong> <span style={{ color: '#475569' }}>{specs.presentation}</span></div>
                      <div><strong>Purity:</strong> <span style={{ color: '#16a34a', fontWeight: 700 }}>{specs.purity}</span></div>
                      <div><strong>Endotoxins:</strong> <span style={{ color: '#475569' }}>{specs.endotoxin}</span></div>
                      <div><strong>Storage:</strong> <span style={{ color: '#475569' }}>{specs.storage}</span></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Diagnostics Tab 2: Methodology */}
              {specs.type === 'diagnostic' && (
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 16px' }}>
                  <div style={{ fontSize: '0.70rem', fontWeight: 800, color: '#b91c1c', textTransform: 'uppercase', marginBottom: '8px' }}>
                    🔬 Specimen Matrix & Analytical Methodology
                  </div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '0.76rem', color: '#0f172a' }}>
                    <strong>Matrix:</strong> {specs.sampleMatrix}
                  </p>
                  <p style={{ margin: '0 0 8px 0', fontSize: '0.76rem', color: '#0f172a' }}>
                    <strong>Methodology:</strong> {specs.methodology}
                  </p>
                  <p style={{ margin: '0 0 8px 0', fontSize: '0.76rem', color: '#0f172a' }}>
                    <strong>Accreditation:</strong> {specs.accreditation}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: '#0f172a' }}>
                    <strong>Turnaround:</strong> {specs.turnaround}
                  </p>
                </div>
              )}

            </div>
          )}

          {/* ═════════ TAB 3: REGULATORY, COMPLIANCE & QUALITY ═════════ */}
          {activeTab === 'regulatory' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '14px 16px'
              }}>
                <div style={{
                  fontSize: '0.70rem',
                  fontWeight: 800,
                  color: '#15803d',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <ShieldCheck size={14} color="#15803d" />
                  <span>{isEs ? 'Acreditaciones Sanitarias y Regulatorias' : 'Sanitary & Regulatory Authorizations'}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: '#0f172a' }}>
                    <span style={{ fontWeight: 800, color: '#15803d' }}>✓</span>
                    <span><strong>European Union:</strong> Cosmetics Regulation (EC) No 1223/2009 & CPNP Notification Active.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: '#0f172a' }}>
                    <span style={{ fontWeight: 800, color: '#15803d' }}>✓</span>
                    <span><strong>Good Manufacturing Practice:</strong> ISO 22716 Cosmetics GMP Certified Facility.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: '#0f172a' }}>
                    <span style={{ fontWeight: 800, color: '#15803d' }}>✓</span>
                    <span><strong>Middle East Health Authorities:</strong> UAE MoHAP / Dubai Montaji & Qatar MoPH recognized items.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: '#0f172a' }}>
                    <span style={{ fontWeight: 800, color: '#15803d' }}>✓</span>
                    <span><strong>Analytical Purity:</strong> Independent Batch HPLC & Microbiology Tested.</span>
                  </div>
                </div>
              </div>

              {/* Cold-Chain Logistics Card */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '14px 16px'
              }}>
                <div style={{
                  fontSize: '0.70rem',
                  fontWeight: 800,
                  color: '#0369a1',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <Award size={14} color="#0369a1" />
                  <span>{isEs ? 'Conservación & Cadena de Frío' : 'Storage & Cold-Chain Parameters'}</span>
                </div>
                <p style={{ margin: '0 0 6px 0', fontSize: '0.76rem', color: '#334155', lineHeight: 1.5 }}>
                  {isEs
                    ? 'Formulación viva de tropocolágeno nativo. Mantener a temperatura inferior a 26°C para evitar la desnaturalización térmica de la triple hélice proteica.'
                    : 'Native biologically active formulation. Maintain under 26°C to preserve tertiary protein conformation and prevent thermal denaturation.'}
                </p>
                <div style={{ fontSize: '0.70rem', color: '#64748b' }}>
                  <strong>Origin:</strong> Gdańsk Biotechnology Labs, Poland (European Union).
                </div>
              </div>
            </div>
          )}

          {/* ═════════ TAB 4: DATASHEET & ORDERS ═════════ */}
          {activeTab === 'ordering' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center'
              }}>
                <FileText size={28} color="#0d9488" style={{ margin: '0 auto 8px auto' }} />
                <h3 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                  {isEs ? 'Monografía Clínica y Ficha Técnica' : 'Clinical Product Monograph & Datasheet'}
                </h3>
                <p style={{ margin: '0 0 14px 0', fontSize: '0.76rem', color: '#64748b' }}>
                  {isEs
                    ? 'Acceso a la ficha completa de formulación, compatibilidad biológica y protocolos recomendados.'
                    : 'Access full clinical monograph, compatibility notes, and medical protocol integration.'}
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  {onViewProduct && (
                    <button
                      type="button"
                      onClick={() => onViewProduct(product)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#0f172a',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <ExternalLink size={13} />
                      <span>{isEs ? 'Abrir Ficha de Producto' : 'Open Product Monograph'}</span>
                    </button>
                  )}

                  {onWhatsAppInquiry && (
                    <button
                      type="button"
                      onClick={() => onWhatsAppInquiry(product)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: '1px solid #86efac',
                        background: '#f0fdf4',
                        color: '#15803d',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <MessageSquare size={13} color="#16a34a" />
                      <span>{isEs ? 'Consultar por WhatsApp' : 'Inquire via WhatsApp'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ── STICKY GCP BOTTOM ACTION BAR ── */}
        <div style={{
          padding: '12px 18px',
          background: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          flexShrink: 0
        }}>
          <button
            type="button"
            onClick={handleCopyInciList}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: copiedInci ? '1px solid #86efac' : '1px solid #cbd5e1',
              background: copiedInci ? '#f0fdf4' : '#ffffff',
              color: copiedInci ? '#16a34a' : '#0f172a',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            {copiedInci ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
            <span>{copiedInci ? (isEs ? 'INCI Copiado ✓' : 'INCI Copied ✓') : (isEs ? 'Copiar INCI' : 'Copy INCI')}</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {onWhatsAppInquiry && (
              <button
                type="button"
                onClick={() => onWhatsAppInquiry(product)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #bbf7d0',
                  background: '#f0fdf4',
                  color: '#15803d',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <MessageSquare size={13} color="#16a34a" />
                <span>WA</span>
              </button>
            )}

            {onQuickAdd && (
              <button
                type="button"
                onClick={() => onQuickAdd(product)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#0d9488',
                  color: '#ffffff',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: '0 1px 2px rgba(13, 148, 136, 0.25)'
                }}
              >
                <span>{isEs ? 'Añadir al Pedido +' : 'Add to Order +'}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </StandardDrawer>
  );
}

function SlidersHorizontalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="21" y1="4" x2="14" y2="4"></line>
      <line x1="10" y1="4" x2="3" y2="4"></line>
      <line x1="21" y1="12" x2="12" y2="12"></line>
      <line x1="8" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="20" x2="16" y2="20"></line>
      <line x1="12" y1="20" x2="3" y2="20"></line>
      <line x1="14" y1="2" x2="14" y2="6"></line>
      <line x1="8" y1="10" x2="8" y2="14"></line>
      <line x1="16" y1="18" x2="16" y2="22"></line>
    </svg>
  );
}
