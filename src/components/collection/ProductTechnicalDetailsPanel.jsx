"use client";

import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Award,
  Microscope,
  Droplets,
  FlaskConical,
  Zap,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
  Clock,
  Layers,
  FileText
} from '@/lib/icons';
import { getProductTechnicalDetails } from '@/data/productClinicalSpecsRegistry';

export default function ProductTechnicalDetailsPanel({ product, brandSlug, isEs = false, datasheet = null, onViewProduct = null }) {
  const specs = getProductTechnicalDetails(product, brandSlug);
  const [showFullInci, setShowFullInci] = useState(false);

  if (!specs) return null;

  return (
    <div
      style={{
        background: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        padding: '1.25rem 1.5rem',
        fontSize: '0.80rem',
        color: '#334155',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        animation: 'fadeIn 0.2s ease-in-out'
      }}
    >
      {/* ── Top Header Badge Strip ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '3px 9px',
              borderRadius: '6px',
              background: specs.type === 'inci' ? '#f0fdfa' : specs.type === 'diagnostic' ? '#fef2f2' : '#f5f3ff',
              border: '1px solid',
              borderColor: specs.type === 'inci' ? '#99f6e4' : specs.type === 'diagnostic' ? '#fecaca' : '#ddd6fe',
              color: specs.type === 'inci' ? '#0d9488' : specs.type === 'diagnostic' ? '#dc2626' : '#7c3aed',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.02em',
              textTransform: 'uppercase'
            }}
          >
            {specs.type === 'inci' ? <Sparkles size={12} /> : specs.type === 'diagnostic' ? <Microscope size={12} /> : <Zap size={12} />}
            <span>{specs.badge}</span>
          </span>

          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
            {specs.title}
          </span>
        </div>

        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
          {specs.compliance || specs.accreditation}
        </span>
      </div>

      {/* ── CASE 1: INCI (Colway Cosmetics, Topicals, Nutricosmetics) ── */}
      {specs.type === 'inci' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Key Actives Summary Card */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              lineHeight: 1.5
            }}
          >
            <div style={{ fontSize: '0.70rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
              🧬 {isEs ? 'Complejo de Activos Clave' : 'Key Bioactive Actives Matrix'}
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#1e293b', fontWeight: 550 }}>
              {specs.keyActives}
            </p>
          </div>

          {/* Full INCI Table / List */}
          {specs.ingredients && specs.ingredients.length > 0 && (
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  padding: '8px 12px',
                  background: '#f1f5f9',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase' }}>
                  📋 {isEs ? 'Fórmula Cualitativa Completa (INCI List)' : 'Complete Qualitative Formula (INCI List)'} ({specs.ingredients.length} {isEs ? 'ingredientes' : 'ingredients'})
                </span>
                <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
                  Decreasing concentration order (EC 1223/2009)
                </span>
              </div>

              <div
                style={{
                  maxHeight: showFullInci ? 'none' : '220px',
                  overflowY: showFullInci ? 'visible' : 'auto',
                  transition: 'max-height 0.3s ease'
                }}
              >
                {/* eslint-disable-next-line no-restricted-syntax */}
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.74rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.68rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '6px 12px', width: '32%' }}>INCI Standard Name</th>
                      <th style={{ padding: '6px 12px', width: '28%' }}>Functional Role</th>
                      <th style={{ padding: '6px 12px', width: '22%' }}>Classification</th>
                      <th style={{ padding: '6px 12px', width: '18%' }}>Origin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {specs.ingredients.map((ing, idx) => {
                      const isFunctionalActive = ing.inci_group === 'functional_active' || ing.inci_group === 'active';
                      return (
                        <tr
                          key={idx}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            background: isFunctionalActive ? 'rgba(13, 148, 136, 0.03)' : '#ffffff'
                          }}
                        >
                          <td style={{ padding: '6px 12px', fontWeight: isFunctionalActive ? 750 : 600, color: isFunctionalActive ? '#0d9488' : '#0f172a' }}>
                            {ing.inci_name}
                            {ing.common_name && (
                              <div style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 450 }}>
                                {ing.common_name}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '6px 12px', color: '#475569' }}>
                            {Array.isArray(ing.function) ? ing.function.join(', ') : (ing.role || ing.function || '—')}
                          </td>
                          <td style={{ padding: '6px 12px' }}>
                            <span
                              style={{
                                fontSize: '0.64rem',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: 700,
                                background: isFunctionalActive ? '#ccfbf1' : '#f1f5f9',
                                color: isFunctionalActive ? '#0f766e' : '#475569'
                              }}
                            >
                              {ing.inci_group || 'Excipient'}
                            </span>
                          </td>
                          <td style={{ padding: '6px 12px', color: '#64748b', fontSize: '0.68rem' }}>
                            {ing.origin || 'Pharma Grade'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {specs.ingredients.length > 5 && (
                <div style={{ padding: '6px 12px', background: '#fafafa', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setShowFullInci(!showFullInci)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0d9488',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>{showFullInci ? (isEs ? 'Mostrar menos' : 'Show less') : (isEs ? `Ver los ${specs.ingredients.length} ingredientes INCI ▾` : `View all ${specs.ingredients.length} INCI ingredients ▾`)}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Clinical Focus Dossier Quote */}
          {specs.clinicalFocus && (
            <div style={{ fontSize: '0.72rem', color: '#475569', fontStyle: 'italic', background: '#f8fafc', padding: '6px 10px', borderRadius: '6px', borderLeft: '3px solid #0d9488' }}>
              <strong>Clinical Indication:</strong> {specs.clinicalFocus}
            </div>
          )}
        </div>
      )}

      {/* ── CASE 2: NUTRACEUTICAL (Ultraman / UltraPerson Supplements) ── */}
      {specs.type === 'nutraceutical' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Actives Table (Google Cloud Console Standard) */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
            <div style={{ padding: '9px 14px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={13} color="#0284c7" />
                <span>{isEs ? 'Composición Activa Estandarizada por Dosis' : 'Standardized Active Principles per Daily Dose'}</span>
              </span>
              <span style={{ fontSize: '0.68rem', color: '#0284c7', background: '#f0f9ff', border: '1px solid #bae6fd', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                High Bioavailability
              </span>
            </div>

            {/* eslint-disable-next-line no-restricted-syntax */}
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.74rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  <th style={{ padding: '8px 14px', width: '38%', fontWeight: 700 }}>{isEs ? 'Principio Activo Estandarizado' : 'Standardized Bioactive Compound'}</th>
                  <th style={{ padding: '8px 14px', width: '22%', fontWeight: 700 }}>{isEs ? 'Cantidad Clínica' : 'Clinical Amount'}</th>
                  <th style={{ padding: '8px 14px', width: '40%', fontWeight: 700 }}>{isEs ? 'Mecanismo y Diana Biológica' : 'Biological Action & Target'}</th>
                </tr>
              </thead>
              <tbody>
                {specs.actives.map((act, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                    <td style={{ padding: '9px 14px', fontWeight: 750, color: '#0f172a' }}>
                      {act.name}
                    </td>
                    <td style={{ padding: '9px 14px', fontWeight: 800, color: '#0284c7', fontVariantNumeric: 'tabular-nums' }}>
                      {act.amount}
                    </td>
                    <td style={{ padding: '9px 14px', color: '#475569', lineHeight: 1.4 }}>
                      {act.role}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Delivery & Purity Highlights (Clean GCP Cards) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 750, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Layers size={12} color="#0284c7" />
                <span>{isEs ? 'Tecnología de Liberación' : 'Delivery Technology'}</span>
              </div>
              <div style={{ fontSize: '0.74rem', fontWeight: 650, color: '#0f172a', marginTop: '4px', lineHeight: 1.4 }}>{specs.capsuleSpecs}</div>
            </div>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 750, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <ShieldCheck size={12} color="#16a34a" />
                <span>{isEs ? 'Estándar Clean Label' : 'Clean Label Standard'}</span>
              </div>
              <div style={{ fontSize: '0.74rem', fontWeight: 650, color: '#0f172a', marginTop: '4px', lineHeight: 1.4 }}>{specs.purity}</div>
            </div>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 750, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Zap size={12} color="#7c3aed" />
                <span>{isEs ? 'Sinergia con Protocolos Peptídicos' : 'Peptide Protocol Synergy'}</span>
              </div>
              <div style={{ fontSize: '0.74rem', fontWeight: 650, color: '#0f172a', marginTop: '4px', lineHeight: 1.4 }}>{specs.synergy}</div>
            </div>
          </div>
        </div>
      )}

      {/* ── CASE 3: DIAGNOSTIC (Bloodo, TeleTest, Eterna Diagnostic Tests) ── */}
      {specs.type === 'diagnostic' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Biomarkers Table */}
          {specs.biomarkers && specs.biomarkers.length > 0 && (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ padding: '8px 12px', background: '#fef2f2', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#b91c1c', textTransform: 'uppercase' }}>
                  🩸 {isEs ? 'Biomarcadores Analíticos Cuantificados (CE-IVDR)' : 'Quantified Clinical Biomarkers (CE-IVDR Standard)'}
                </span>
                <span style={{ fontSize: '0.68rem', color: '#dc2626', fontWeight: 700 }}>
                  Quantitative Validation
                </span>
              </div>

              {/* eslint-disable-next-line no-restricted-syntax */}
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.74rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.68rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '8px 12px', width: '42%' }}>Clinical Biomarker Panel</th>
                    <th style={{ padding: '8px 12px', width: '18%' }}>Reporting Unit</th>
                    <th style={{ padding: '8px 12px', width: '22%' }}>Target Clinical Range</th>
                    <th style={{ padding: '8px 12px', width: '18%' }}>Precision CV%</th>
                  </tr>
                </thead>
                <tbody>
                  {specs.biomarkers.map((bm, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 750, color: '#0f172a' }}>
                        {bm.name}
                      </td>
                      <td style={{ padding: '8px 12px', color: '#64748b' }}>
                        {bm.unit}
                      </td>
                      <td style={{ padding: '8px 12px', fontWeight: 750, color: '#16a34a' }}>
                        {bm.target}
                      </td>
                      <td style={{ padding: '8px 12px', color: '#dc2626', fontWeight: 700 }}>
                        {bm.cv}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Analytical Methodology & Specimen Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 750, color: '#dc2626', textTransform: 'uppercase' }}>💧 Specimen Matrix</div>
              <div style={{ fontSize: '0.74rem', fontWeight: 650, color: '#0f172a', marginTop: '2px' }}>{specs.sampleMatrix}</div>
            </div>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 750, color: '#0284c7', textTransform: 'uppercase' }}>🔬 Analytical Methodology</div>
              <div style={{ fontSize: '0.74rem', fontWeight: 650, color: '#0f172a', marginTop: '2px' }}>{specs.methodology}</div>
            </div>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 750, color: '#16a34a', textTransform: 'uppercase' }}>⏱️ Result Turnaround</div>
              <div style={{ fontSize: '0.74rem', fontWeight: 650, color: '#0f172a', marginTop: '2px' }}>{specs.turnaround}</div>
            </div>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 750, color: '#7c3aed', textTransform: 'uppercase' }}>🏛️ Accredited Reference Lab</div>
              <div style={{ fontSize: '0.74rem', fontWeight: 650, color: '#0f172a', marginTop: '2px' }}>{specs.referenceLab || specs.accreditation}</div>
            </div>
          </div>

          {specs.clinicalScope && (
            <div style={{ fontSize: '0.72rem', color: '#475569', fontStyle: 'italic', background: '#f8fafc', padding: '6px 10px', borderRadius: '6px', borderLeft: '3px solid #dc2626' }}>
              <strong>Clinical Diagnostic Utility:</strong> {specs.clinicalScope}
            </div>
          )}
        </div>
      )}

      {/* ── CASE 4: PEPTIDE MONOGRAPH (Lotusland Finished Lyophilized Vials) ── */}
      {specs.type === 'peptide_monograph' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Technical Monograph Specification Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 750, color: '#003666', textTransform: 'uppercase' }}>🧪 Format & Presentation</div>
              <div style={{ fontSize: '0.74rem', fontWeight: 650, color: '#0f172a', marginTop: '2px' }}>{specs.presentation}</div>
            </div>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 750, color: '#16a34a', textTransform: 'uppercase' }}>🛡️ Verified Analytical Purity</div>
              <div style={{ fontSize: '0.74rem', fontWeight: 650, color: '#0f172a', marginTop: '2px' }}>{specs.purity}</div>
            </div>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 750, color: '#0284c7', textTransform: 'uppercase' }}>💧 Reconstitution Guidelines</div>
              <div style={{ fontSize: '0.74rem', fontWeight: 650, color: '#0f172a', marginTop: '2px' }}>{specs.reconstitution}</div>
            </div>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 750, color: '#7c3aed', textTransform: 'uppercase' }}>❄️ Storage & Cold-Chain</div>
              <div style={{ fontSize: '0.74rem', fontWeight: 650, color: '#0f172a', marginTop: '2px' }}>{specs.storage}</div>
            </div>
          </div>

          {/* Sequence & Compliance Bar */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem' }}>
              <span style={{ fontWeight: 750, color: '#475569' }}>Sequence:</span>
              <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.70rem', color: '#003666', fontFamily: 'monospace' }}>
                {specs.sequence}
              </code>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.70rem', color: '#64748b' }}>
              {specs.molecularWeight && <span><strong>MW:</strong> {specs.molecularWeight}</span>}
              {specs.casNumber && <span><strong>CAS:</strong> {specs.casNumber}</span>}
              <span><strong>Endotoxins:</strong> {specs.endotoxin}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Action Footer: PDF Datasheet Download & Full Product Monograph ── */}
      {(datasheet || onViewProduct) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          paddingTop: '0.85rem',
          borderTop: '1px solid #e2e8f0',
          marginTop: '0.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {datasheet && (
              <a
                href={datasheet.url}
                download={datasheet.filename}
                target="_blank"
                rel="noopener noreferrer"
                title={`Download official datasheet: ${datasheet.title}`}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #fed7aa',
                  background: '#fff7ed',
                  color: '#ea580c',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FileText size={13} color="#ea580c" />
                <span>{isEs ? 'Descargar Ficha Técnica PDF' : 'Download Technical Datasheet (PDF)'}</span>
                {datasheet.size && <span style={{ fontSize: '0.66rem', opacity: 0.8 }}>({datasheet.size})</span>}
              </a>
            )}
          </div>

          {onViewProduct && (
            <button
              type="button"
              onClick={onViewProduct}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#0f172a',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#94a3b8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
            >
              <span>{isEs ? 'Ver Ficha Completa del Producto →' : 'View Full Product Monograph →'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
