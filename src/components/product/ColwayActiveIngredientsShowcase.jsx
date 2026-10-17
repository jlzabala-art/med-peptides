"use client";

import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Droplets,
  Activity,
  Award,
  Zap,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen
} from '@/lib/icons';
import { getColwayProductData } from '@/data/colwayInciRegistry';

/**
 * ColwayActiveIngredientsShowcase
 * 
 * Clinical, high-aesthetic GCP-standard showcase for Colway Active Ingredients,
 * Biological Mechanisms (MEC-01..03), and Molecular Targets.
 * Modeled after the reference trichology showcase for hair care, but dynamically
 * adapted to any Colway facial cosmeceutical, peeling, or nutricosmetic.
 */
export default function ColwayActiveIngredientsShowcase({ product, slug: propSlug, lang = 'en' }) {
  const isEs = lang === 'es';
  const slug = propSlug || product?.slug || product?.id || '';
  const colwayData = getColwayProductData(slug);
  const [expandedActives, setExpandedActives] = useState({});

  if (!colwayData) return null;

  const toggleActive = (name) => {
    setExpandedActives(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const keyActives = (colwayData.ingredients || []).filter(
    i => i.inci_group === 'key_active' || i.inci_group === 'functional_active'
  );

  return (
    <section style={{
      background: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      marginBottom: '2rem',
      boxShadow: '0 4px 20px -4px rgba(0,0,0,0.05)',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      {/* ── 1. Header Strip ── */}
      <div style={{
        padding: '1.75rem 2rem 1.25rem',
        borderBottom: '1px solid #f1f5f9',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.25rem',
        background: '#ffffff'
      }}>
        <div style={{ maxWidth: '780px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(13, 148, 136, 0.1)',
            color: '#0d9488',
            padding: '3px 10px',
            borderRadius: '12px',
            fontSize: '0.74rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: '8px'
          }}>
            <Sparkles size={12} />
            <span>{isEs ? 'Monografía Farmacéutica & Molecular' : 'Clinical & Molecular Monograph'}</span>
          </div>

          <h2 style={{ fontSize: '1.45rem', fontWeight: 850, color: '#0f172a', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            {isEs
              ? 'Mecanismos Biológicos y Activos de Grado Farmacopea'
              : 'Biological Mechanisms & Pharmacopoeial Active Compounds'}
          </h2>

          <p style={{ fontSize: '0.86rem', color: '#64748b', margin: 0, lineHeight: 1.55 }}>
            {colwayData.key_actives_summary}
          </p>
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 14px',
          borderRadius: '8px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: '#334155'
        }}>
          <ShieldCheck size={16} color="#0d9488" />
          <span>EU Reg. 1223/2009 Compliant</span>
        </div>
      </div>

      {/* ── 2. 4 Clinical & Biomarker Efficacy Cards (Hero Stats) ── */}
      {colwayData.hero_stats?.length > 0 && (
        <div style={{
          padding: '1.25rem 2rem',
          background: '#f8fafc',
          borderBottom: '1px solid #f1f5f9'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '1rem'
          }}>
            {colwayData.hero_stats.map((statItem, idx) => {
              const colors = ['#0d9488', '#0284c7', '#7c3aed', '#ea580c'];
              const color = colors[idx % colors.length];
              return (
                <div key={idx} style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                  textAlign: 'center',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}>
                  <div style={{ fontSize: '1.65rem', fontWeight: 900, color: color, lineHeight: 1.1 }}>
                    {statItem.stat}
                  </div>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginTop: '6px' }}>
                    {statItem.label}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                    {statItem.sub}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 3. Primary Biological Mechanisms (GCP Stacked Lines) ── */}
      {colwayData.mechanisms?.length > 0 && (
        <div style={{ padding: '1.75rem 2rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {isEs ? 'Mecanismos Biológicos Celulares' : 'Cellular & Biological Mechanisms of Action'}
            </h3>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
              Direct receptor targeting & extracellular matrix reconstitution
            </span>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            marginBottom: '1.75rem'
          }}>
            {colwayData.mechanisms.map((mec, idx) => {
              const iconColors = [
                { bg: 'rgba(13, 148, 136, 0.12)', fg: '#0d9488', border: 'rgba(13, 148, 136, 0.25)', icon: Zap },
                { bg: 'rgba(2, 132, 199, 0.12)', fg: '#0284c7', border: 'rgba(2, 132, 199, 0.25)', icon: Clock },
                { bg: 'rgba(225, 29, 72, 0.12)', fg: '#e11d48', border: 'rgba(225, 29, 72, 0.25)', icon: ShieldCheck }
              ];
              const theme = iconColors[idx % iconColors.length];
              const IconComp = theme.icon;

              return (
                <div
                  key={mec.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.25rem',
                    transition: 'all 0.15s ease',
                    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#ffffff'; }}
                >
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '8px',
                    background: theme.bg,
                    color: theme.fg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <IconComp size={22} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        fontFamily: 'monospace',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: '#f1f5f9',
                        color: '#475569'
                      }}>
                        {mec.id}
                      </span>
                      <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        {mec.title}
                      </h4>
                      {mec.tag && (
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: '#f0fdfa',
                          color: '#0d9488',
                          border: `1px solid ${theme.border}`
                        }}>
                          {mec.tag}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0, lineHeight: 1.55 }}>
                      {mec.description}
                    </p>
                  </div>

                  <div style={{
                    flexShrink: 0,
                    textAlign: 'right',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    minWidth: '140px'
                  }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {mec.pathway}
                    </span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: theme.fg, marginTop: '2px' }}>
                      {mec.endpoint}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 4. Key Active Ingredients & Clinical Properties (Detailed Cards) ── */}
      <div style={{ padding: '0 2rem 2rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {isEs ? 'Compuestos Activos Clave & Evidencia Farmacéutica' : 'Key Bio-Active Ingredients & Molecular Targets'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '3px 0 0 0' }}>
              Standardized active compounds with biological function, cellular target, and clinical rationale.
            </p>
          </div>
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            background: '#f1f5f9',
            color: '#334155',
            padding: '3px 10px',
            borderRadius: '12px'
          }}>
            {keyActives.length} Primary Actives Analyzed
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1rem'
        }}>
          {keyActives.map((active, index) => {
            const isKey = active.inci_group === 'key_active';
            const isExpanded = !!expandedActives[active.inci_name];

            return (
              <div
                key={active.inci_name || index}
                style={{
                  border: isKey ? '1px solid #ccfbf1' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  background: isKey ? '#fcfffe' : '#ffffff',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                {/* Card Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '0.64rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: isKey ? '#0d9488' : '#64748b',
                        color: '#ffffff'
                      }}>
                        {isKey ? 'Key Active' : 'Functional'}
                      </span>
                      {active.concentration_range && (
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: '#0d9488',
                          background: '#f0fdfa',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          border: '1px solid #ccfbf1'
                        }}>
                          {active.concentration_range}
                        </span>
                      )}
                    </div>

                    <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', margin: '6px 0 2px 0' }}>
                      {active.inci_name}
                    </h4>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                      {active.common_name}
                    </div>
                  </div>

                  {active.origin && (
                    <span style={{
                      fontSize: '0.66rem',
                      fontWeight: 600,
                      color: '#475569',
                      background: '#f1f5f9',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      whiteSpace: 'nowrap',
                      maxWidth: '130px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }} title={active.origin}>
                      {active.origin}
                    </span>
                  )}
                </div>

                {/* Function Tags */}
                {Array.isArray(active.function) && active.function.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {active.function.map((fn, fIdx) => (
                      <span
                        key={fIdx}
                        style={{
                          fontSize: '0.66rem',
                          fontWeight: 600,
                          color: '#334155',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '4px',
                          padding: '1px 6px'
                        }}
                      >
                        {fn}
                      </span>
                    ))}
                  </div>
                )}

                {/* Primary Role */}
                <p style={{ fontSize: '0.8rem', color: '#334155', margin: 0, lineHeight: 1.55 }}>
                  {active.role}
                </p>

                {/* Expandable Clinical Data (Mechanism & Evidence) */}
                {active.clinical_data && (
                  <div style={{ marginTop: 'auto', paddingTop: '6px' }}>
                    <button
                      type="button"
                      onClick={() => toggleActive(active.inci_name)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#0d9488',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      <span>{isExpanded ? 'Hide Molecular Rationale' : 'View Molecular Mechanism & Evidence'}</span>
                    </button>

                    {isExpanded && (
                      <div style={{
                        marginTop: '8px',
                        padding: '10px 12px',
                        background: '#f0fdfa',
                        border: '1px solid #ccfbf1',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        fontSize: '0.74rem',
                        color: '#134e4a'
                      }}>
                        {active.clinical_data.mechanism && (
                          <div>
                            <strong style={{ color: '#0f766e' }}>Molecular Mechanism: </strong>
                            <span>{active.clinical_data.mechanism}</span>
                          </div>
                        )}
                        {active.clinical_data.evidence && (
                          <div>
                            <strong style={{ color: '#0f766e' }}>Clinical Evidence: </strong>
                            <span>{active.clinical_data.evidence}</span>
                          </div>
                        )}
                        {active.pmid && (
                          <div style={{ marginTop: '2px' }}>
                            <a
                              href={`https://pubmed.ncbi.nlm.nih.gov/${active.pmid}/`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: '#0d9488',
                                fontWeight: 700,
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <BookOpen size={12} />
                              <span>PubMed PMID: {active.pmid}</span>
                              <ExternalLink size={10} />
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
