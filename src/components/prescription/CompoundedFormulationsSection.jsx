"use client";

import React from 'react';
import { 
  Layers, 
  Pill, 
  Droplets, 
  FlaskConical, 
  Tag, 
  ChevronUp, 
  ChevronDown, 
  CheckCircle2, 
  Dna, 
  Clock, 
  Info 
} from '@/lib/icons';
import { AlertTriangle } from 'lucide-react';

/**
 * CompoundedFormulationsSection
 * 
 * Renders sequential compounded formulation blocks (oral capsules, topical solutions, foams, oils)
 * with active APIs, purity standards, nutrigenomic gene targets, and dedicated posology steps.
 */
export default function CompoundedFormulationsSection({
  compoundedFormulations = [],
  isEs = false,
  prescriptionLabels = [],
  expandedPhases = {},
  setExpandedPhases,
  setSelectedPhase,
  togglePhase,
  setSelectedLabelIndex,
  setShowLabelsModal
}) {
  if (!compoundedFormulations || compoundedFormulations.length === 0) return null;

  return (
    <div id="formula-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', scrollMarginTop: '100px' }}>
      {/* Google Cloud Style Phase Overview & Controls (100% Vertical & Responsive, No Horizontal Scroll) */}
      {compoundedFormulations.length > 1 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          padding: '10px 14px',
          background: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dadce0',
          marginBottom: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{
              background: '#e8f0fe',
              color: '#1a73e8',
              padding: '3px 9px',
              borderRadius: '12px',
              fontSize: '0.74rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <Layers size={13} />
              <span>{compoundedFormulations.length} {isEs ? 'Fases Secuenciales' : 'Sequential Phases'}</span>
            </span>
            <span style={{ fontSize: '0.76rem', color: '#5f6368' }}>
              {isEs ? 'Régimen cronobiológico secuencial adaptado al perfil genómico' : 'Sequential chronobiological regimen calibrated to patient genomics'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => {
                const allOpen = {};
                compoundedFormulations.forEach(f => { allOpen[f.id] = true; });
                if (setExpandedPhases) setExpandedPhases(allOpen);
                if (setSelectedPhase) setSelectedPhase('all');
              }}
              style={{
                background: '#ffffff',
                border: '1px solid #dadce0',
                borderRadius: '4px',
                padding: '4px 10px',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: '#1a73e8',
                cursor: 'pointer'
              }}
            >
              {isEs ? 'Expandir Todo' : 'Expand All'}
            </button>
            <button
              type="button"
              onClick={() => {
                const allClosed = {};
                compoundedFormulations.forEach(f => { allClosed[f.id] = false; });
                if (setExpandedPhases) setExpandedPhases(allClosed);
              }}
              style={{
                background: '#ffffff',
                border: '1px solid #dadce0',
                borderRadius: '4px',
                padding: '4px 10px',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: '#5f6368',
                cursor: 'pointer'
              }}
            >
              {isEs ? 'Colapsar Todo' : 'Collapse All'}
            </button>
          </div>
        </div>
      )}

      {compoundedFormulations.map((formulation, fIdx) => {
        const isPhaseExpanded = expandedPhases[formulation.id] !== false;
        const phaseNumber = formulation.index || (fIdx + 1);
        const phaseLabel = prescriptionLabels.find(l => 
          l.phaseNumber === phaseNumber || 
          (l.productName && formulation.title && l.productName.toLowerCase().includes(formulation.title.toLowerCase().slice(0, 10)))
        );

        return (
          <div
            key={formulation.id}
            id={formulation.id}
            style={{
              background: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #dadce0',
              boxShadow: 'none',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              scrollMarginTop: '100px',
              marginBottom: '12px'
            }}
          >
            {/* Individual Phase Accordion Header - 100% Mobile Responsive (GCP Standard) */}
            <div
              onClick={() => togglePhase && togglePhase(formulation.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                background: isPhaseExpanded ? '#f8fafc' : '#ffffff',
                borderBottom: isPhaseExpanded ? '1px solid #dadce0' : 'none',
                cursor: 'pointer',
                userSelect: 'none',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 320px' }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '8px',
                  background: formulation.accentColor ? `${formulation.accentColor}15` : '#eff6ff',
                  color: formulation.accentColor || '#1a73e8',
                  border: `1px solid ${formulation.accentColor ? `${formulation.accentColor}33` : '#bfdbfe'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {formulation.isOral || formulation.route?.toLowerCase().includes('oral') || formulation.title?.toLowerCase().includes('cápsula') || formulation.title?.toLowerCase().includes('capsule') ? (
                    <Pill size={18} />
                  ) : (formulation.id.includes('oil') || formulation.title?.toLowerCase().includes('oil')) ? (
                    <Droplets size={18} />
                  ) : (
                    <FlaskConical size={18} />
                  )}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '2px' }}>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: formulation.accentColor || '#003666',
                      background: formulation.accentBg || '#f1f5f9',
                      padding: '1px 7px',
                      borderRadius: '4px'
                    }}>
                      {isEs ? `FASE ${phaseNumber} DE ${compoundedFormulations.length}` : `PHASE ${phaseNumber} OF ${compoundedFormulations.length}`} · {formulation.route || (isEs ? 'VÍA ORAL' : 'ORAL ROUTE')}
                    </span>
                    {formulation.duration && (
                      <span style={{ fontSize: '0.68rem', color: '#1967d2', background: '#e8f0fe', border: '1px solid #d2e3fc', borderRadius: '4px', padding: '1px 7px', fontWeight: 600 }}>
                        {formulation.duration}
                      </span>
                    )}
                    <span style={{ fontSize: '0.68rem', color: '#475569', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1px 7px', borderRadius: '4px', fontWeight: 600 }}>
                      {formulation.apis.length} APIs · {formulation.volume}
                    </span>
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                    {formulation.title}
                  </h3>
                  {formulation.subtitle && (
                    <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: '#64748b' }}>
                      {formulation.subtitle}
                    </p>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                {phaseLabel && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const idx = prescriptionLabels.findIndex(l => l.id === phaseLabel.id);
                      if (setSelectedLabelIndex) setSelectedLabelIndex(idx >= 0 ? idx : 0);
                      if (setShowLabelsModal) setShowLabelsModal(true);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      background: '#ffffff',
                      border: '1px solid #dadce0',
                      color: '#1a73e8',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#e8f0fe'; e.currentTarget.style.borderColor = '#1a73e8'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#dadce0'; }}
                  >
                    <Tag size={12} color="#1a73e8" />
                    <span>{isEs ? 'Etiqueta 7.5×4.5 cm' : 'Label (7.5×4.5 cm)'}</span>
                  </button>
                )}
                <span style={{ color: '#5f6368', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>{isPhaseExpanded ? (isEs ? 'Colapsar' : 'Collapse') : (isEs ? 'Expandir' : 'Expand')}</span>
                  {isPhaseExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
              </div>
            </div>

            {(compoundedFormulations.length <= 1 || isPhaseExpanded) && (
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Sub-Section 1: Compounding Vehicle / Base Carrier */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderLeft: `4px solid ${formulation.accentColor || '#0284c7'}`,
                  borderRadius: '12px',
                  padding: '1.15rem 1.35rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.55rem',
                  boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: formulation.accentColor || '#0284c7',
                        color: '#ffffff',
                        letterSpacing: '0.04em'
                      }}>
                        {formulation.vehicle.tag}
                      </span>
                      <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                        {formulation.vehicle.name}
                      </span>
                      {formulation.vehicle.volume && formulation.vehicle.volume !== formulation.volume && (
                        <span style={{
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          color: '#0284c7',
                          background: '#f0f9ff',
                          border: '1px solid #bae6fd',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontFamily: 'monospace'
                        }}>
                          {formulation.vehicle.volume}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={13} />
                      <span>{formulation.isOral ? (isEs ? '100% Cápsulas Vegetales HPMC · Sin Gluten · Sin Alérgenos' : '100% Plant-Based HPMC Capsules · Gluten-Free · Allergen-Free') : (formulation.id.includes('topical') ? 'Alcohol-Free & Non-Irritating' : 'Enteric Bioavailable Powder')}</span>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.55 }}>
                    {formulation.vehicle.specs}
                  </div>

                  <div style={{ fontSize: '0.74rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>📦 {isEs ? 'Envase Dispensador:' : 'Dispensing Container:'}</span>
                    <strong style={{ color: '#0f172a' }}>{formulation.container}</strong>
                  </div>
                </div>

                {/* Sub-Section 1b: Special Compounding Requirements & Galenic Purity Badges */}
                {Array.isArray(formulation.extra?.specialCompoundingRequirements) && formulation.extra.specialCompoundingRequirements.length > 0 && (
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '0.85rem 1.15rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.55rem',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)'
                  }}>
                    <div style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      color: '#475569',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <CheckCircle2 size={14} color="#059669" />
                      <span>{isEs ? 'Requisitos Galénicos de Formulación & Pureza (Clean Label)' : 'Galenic Purity Standards & Compounding Requirements'}</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {formulation.extra.specialCompoundingRequirements.map((req, rIdx) => (
                        <span
                          key={rIdx}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            color: '#0f766e',
                            background: '#f0fdfa',
                            border: '1px solid #ccfbf1',
                            padding: '3px 9px',
                            borderRadius: '6px'
                          }}
                        >
                          <span style={{ fontSize: '0.75rem', color: '#0d9488' }}>✓</span>
                          <span>{req}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-Section 2: Compounded Active Ingredients (APIs) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {isEs 
                        ? `Principios Activos Formulados en este Vehículo (${formulation.apis.length})` 
                        : `Active Compounded Ingredients in this Vehicle (${formulation.apis.length} APIs)`}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      {isEs ? 'Calibrados al perfil farmacogenómico' : 'Calibrated to patient pharmacogenomics'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {formulation.apis.map((api) => (
                      <div
                        key={api.id}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '10px',
                          padding: '1rem 1.15rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.45rem',
                          boxShadow: '0 1px 4px rgba(15, 23, 42, 0.02)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                            <span style={{
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              padding: '2px 7px',
                              borderRadius: '4px',
                              background: '#e0f2fe',
                              color: '#0369a1'
                            }}>
                              {api.tag}
                            </span>
                            <span style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                              {api.name}
                            </span>
                            <span style={{
                              fontSize: '0.78rem',
                              fontWeight: 800,
                              color: formulation.isOral ? '#047857' : '#0284c7',
                              background: formulation.isOral ? '#ecfdf5' : '#f0f9ff',
                              border: `1px solid ${formulation.isOral ? '#a7f3d0' : '#bae6fd'}`,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontFamily: 'monospace',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}>
                              {formulation.isOral 
                                ? (String(api.dosage).includes('Ref:') || String(api.dosage).includes('Dosis') || String(api.dosage).includes('Dose') || String(api.dosage).toLowerCase().includes('/ cap') || String(api.dosage).toLowerCase().includes('/cap')
                                    ? `💊 ${String(api.dosage).replace(/cápsulas?/gi, 'capsules').replace(/cápsula/gi, 'capsule')}` 
                                    : `💊 ${String(api.dosage).replace(/cápsulas?/gi, 'capsules').replace(/cápsula/gi, 'capsule')} / capsule`) 
                                : String(api.dosage).replace(/cápsulas?/gi, 'capsules').replace(/cápsula/gi, 'capsule')}
                            </span>
                            {api.dosageSafety?.evaluated && (
                              <span 
                                style={{
                                  fontSize: '0.67rem',
                                  fontWeight: 700,
                                  padding: '2px 7px',
                                  borderRadius: '5px',
                                  background: api.dosageSafety.level === 'high' ? '#fef2f2' : (api.dosageSafety.level === 'low' ? '#fffbeb' : '#f0fdf4'),
                                  color: api.dosageSafety.level === 'high' ? '#dc2626' : (api.dosageSafety.level === 'low' ? '#b45309' : '#15803d'),
                                  border: `1px solid ${api.dosageSafety.level === 'high' ? '#fca5a5' : (api.dosageSafety.level === 'low' ? '#fde68a' : '#bbf7d0')}`,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }} 
                                title={api.dosageSafety.message}
                              >
                                <span>{api.dosageSafety.level === 'high' ? '⚠️' : (api.dosageSafety.level === 'low' ? 'ℹ️' : '✓')}</span>
                                <span>
                                  {api.dosageSafety.level === 'high' 
                                    ? (isEs ? 'Dosis Elevada' : 'High Dose') 
                                    : (api.dosageSafety.level === 'low' 
                                      ? (isEs ? 'Dosis Baja' : 'Low Dose') 
                                      : (isEs ? 'Dosis Estándar' : 'Standard Dose'))}
                                </span>
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
                            {api.role} · <span style={{ color: '#0369a1', fontWeight: 700 }}>{api.indication}</span>
                          </div>
                        </div>

                        <div style={{ fontSize: '0.79rem', color: '#334155', lineHeight: 1.5 }}>
                          {api.action}
                        </div>

                        {api.geneTargets && api.geneTargets.length > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#4338ca', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span>🧬</span> {isEs ? 'Genes Diana:' : 'Target Genes:'}
                            </span>
                            {api.geneTargets.map((g, gIdx) => (
                              <span key={gIdx} style={{
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                color: '#3730a3',
                                background: '#e0e7ff',
                                border: '1px solid #c7d2fe',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                fontFamily: 'monospace'
                              }}>
                                {g}
                              </span>
                            ))}
                          </div>
                        )}

                        {api.rationale && (
                          <div style={{
                            fontSize: '0.72rem',
                            color: '#047857',
                            background: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            borderRadius: '6px',
                            padding: '3px 8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            width: 'fit-content'
                          }}>
                            <span>🧬</span>
                            <span>{api.rationale}</span>
                          </div>
                        )}

                        {api.cellularTarget && (
                          <div style={{ fontSize: '0.74rem', color: '#5f6368', display: 'flex', gap: '6px', alignItems: 'baseline' }}>
                            <span style={{ fontWeight: 600, color: '#202124' }}>{isEs ? 'Diana celular:' : 'Cellular target:'}</span>
                            <span>{api.cellularTarget}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sub-Section 2b: Genetic information for THIS part (Google Cloud style disclosure) */}
                {formulation.extra?.nutrigenomics && (
                  <details open style={{ border: '1px solid #dadce0', borderRadius: '8px', background: '#ffffff', overflow: 'hidden' }}>
                    <summary style={{ cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'center', gap: '10px', padding: '0.75rem 1rem', background: '#f8f9fa', borderBottom: '1px solid #dadce0', fontSize: '0.84rem', fontWeight: 600, color: '#202124' }}>
                      <Dna size={16} color="#1a73e8" />
                      <span>{isEs ? 'Información genética de esta parte' : 'Genetic information for this part'}</span>
                      <span style={{ marginLeft: 'auto', fontSize: '0.72rem', fontWeight: 500, color: '#5f6368' }}>{formulation.extra.nutrigenomics.genes?.length || 0} {isEs ? 'genes' : 'genes'}</span>
                      <ChevronDown size={16} color="#5f6368" />
                    </summary>
                    <div style={{ padding: '1rem', display: 'grid', gap: '0.75rem', fontSize: '0.8rem', color: '#3c4043', lineHeight: 1.55 }}>
                      <div>
                        <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{isEs ? 'Vía metabólica' : 'Metabolic pathway'}</div>
                        <div>{formulation.extra.nutrigenomics.pathway}</div>
                      </div>
                      {formulation.extra.nutrigenomics.genes?.length > 0 && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{isEs ? 'Genes diana' : 'Target genes'}</span>
                          {formulation.extra.nutrigenomics.genes.map((g) => (
                            <span key={g} style={{ fontFamily: 'monospace', fontSize: '0.72rem', fontWeight: 600, color: '#1967d2', background: '#e8f0fe', border: '1px solid #d2e3fc', borderRadius: '4px', padding: '1px 8px' }}>{g}</span>
                          ))}
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{isEs ? 'Resumen clínico' : 'Clinical summary'}</div>
                        <div>{formulation.extra.nutrigenomics.clinicalSummary}</div>
                      </div>
                      <div style={{ background: '#e6f4ea', border: '1px solid #ceead6', borderRadius: '4px', padding: '0.6rem 0.8rem', color: '#137333' }}>
                        <strong>{isEs ? 'Objetivo de la fase: ' : 'Phase objective: '}</strong>{formulation.extra.nutrigenomics.phaseObjective}
                      </div>
                    </div>
                  </details>
                )}

                {/* Sub-Section 2c: Clinical Protocol Initiation Milestone */}
                {Array.isArray(formulation.extra?.clinicalMilestones) && formulation.extra.clinicalMilestones.length > 0 && (
                  <div style={{
                    background: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    borderLeft: '4px solid #0284c7',
                    borderRadius: '10px',
                    padding: '0.95rem 1.15rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)'
                  }}>
                    {formulation.extra.clinicalMilestones.map((ms, mIdx) => (
                      <div key={ms.id || mIdx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1rem' }}>🗓️</span>
                          <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0369a1' }}>
                            {ms.title}: {ms.timing}
                          </span>
                        </div>
                        {ms.description && (
                          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#0c4a6e', lineHeight: 1.5, paddingLeft: '26px' }}>
                            {ms.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Sub-Section 3: Dedicated Posology Protocol FOR THIS SPECIFIC VEHICLE */}
                <div 
                  id={fIdx === 0 ? "posology-card" : `posology-${formulation.id}`}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    marginTop: '0.25rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: '8px',
                        background: formulation.accentColor || '#0284c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff'
                      }}>
                        <Clock size={18} />
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                          {formulation.posology.title}
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748b' }}>
                          {formulation.posology.timing}
                        </p>
                      </div>
                    </div>

                    <div style={{
                      background: '#f0fdf4',
                      border: '1px solid #86efac',
                      color: '#15803d',
                      padding: '4px 12px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 800
                    }}>
                      {String(formulation.posology.regimen || '')}
                    </div>
                  </div>

                  {/* Specific Doctor Dosage Instructions */}
                  {formulation.posology.dosageInstructions && (
                    <div style={{
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      borderRadius: '8px',
                      padding: '9px 13px',
                      color: '#1e40af',
                      fontSize: '0.78rem',
                      lineHeight: 1.45,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px'
                    }}>
                      <Info size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#1d4ed8' }} />
                      <div>
                        <strong style={{ display: 'block', color: '#1e3a8a', marginBottom: '2px', fontWeight: 700 }}>
                          {isEs ? 'Indicaciones clínicas específicas del médico prescriptor:' : 'Prescribing Physician Clinical Directions:'}
                        </strong>
                        <span>{formulation.posology.dosageInstructions}</span>
                      </div>
                    </div>
                  )}

                  {/* Step-by-Step Pathway for this vehicle */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {formulation.posology.steps.map((st) => (
                      <div
                        key={st.step}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderLeft: `3px solid ${formulation.accentColor || '#0284c7'}`,
                          borderRadius: '8px',
                          padding: '0.85rem 1rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.35rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                            <span style={{
                              width: 22,
                              height: 22,
                              borderRadius: '50%',
                              background: formulation.accentColor || '#0284c7',
                              color: '#ffffff',
                              fontSize: '0.74rem',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              {st.step}
                            </span>
                            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                              {st.title}
                            </span>
                          </div>
                          {st.timing && (
                            <span style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              color: '#0369a1',
                              background: '#e0f2fe',
                              padding: '2px 8px',
                              borderRadius: '4px'
                            }}>
                              {st.timing}
                            </span>
                          )}
                        </div>
                        <p style={{ margin: 0, fontSize: '0.79rem', color: '#334155', lineHeight: 1.55, paddingLeft: '30px' }}>
                          {st.instruction}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Sub-Section 3b: Critical Medical Safety Alerts & Pre-Procedure Guidance */}
                  {Array.isArray(formulation.extra?.criticalPrecautions) && formulation.extra.criticalPrecautions.length > 0 && (
                    <div style={{
                      background: '#fffbeb',
                      border: '1px solid #fde68a',
                      borderLeft: '4px solid #d97706',
                      borderRadius: '10px',
                      padding: '0.95rem 1.15rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.65rem',
                      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)'
                    }}>
                      <div style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: '#92400e',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <AlertTriangle size={15} color="#d97706" />
                        <span>{isEs ? 'Instrucciones Críticas de Seguridad y Manejo Pre-Procedimiento' : 'Critical Clinical Safety Alerts & Pre-Procedure Guidance'}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {formulation.extra.criticalPrecautions.map((prec, pIdx) => (
                          <div key={prec.id || pIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                            <span style={{
                              fontSize: '0.70rem',
                              fontWeight: 800,
                              color: prec.severity === 'critical' ? '#991b1b' : '#92400e',
                              background: prec.severity === 'critical' ? '#fee2e2' : '#fef3c7',
                              border: `1px solid ${prec.severity === 'critical' ? '#fecaca' : '#fde68a'}`,
                              padding: '2px 7px',
                              borderRadius: '4px',
                              whiteSpace: 'nowrap'
                            }}>
                              {prec.severity === 'critical' ? 'CRITICAL' : 'CAUTION'}
                            </span>
                            <span style={{ fontSize: '0.82rem', color: '#78350f', lineHeight: 1.4 }}>
                              {prec.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
