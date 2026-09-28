"use client";

import React, { useState } from 'react';
import { 
  Dna, 
  ShieldCheck, 
  ExternalLink, 
  FlaskConical, 
  CheckCircle2, 
  Sparkles, 
  Info,
  ChevronDown,
  ChevronUp,
  Layers
} from '@/lib/icons';

/**
 * GenomicsPrescriptionGuidanceCard
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders the pharmacogenomic clinical accreditation card for prescriptions
 * associated with Fagron Genomics tests (TrichoTest™, NutriGen™, TeloTest™, etc.).
 * Aligned with official Fagron Genomics messaging & evidence-based practice.
 */
export default function GenomicsPrescriptionGuidanceCard({
  genomicsData,
  lang = 'en'
}) {
  const [expanded, setExpanded] = useState(false);
  const isEs = lang === 'es';

  if (!genomicsData || !genomicsData.test) return null;

  const { test, boxId, matchedPathways = [] } = genomicsData;

  return (
    <div 
      id="genomics-card"
      style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #cbd5e1',
        boxShadow: '0 4px 20px rgba(14, 165, 233, 0.08)',
        marginBottom: '1.5rem',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* ── Top Clinical Accent Bar ── */}
      <div style={{
        height: '4px',
        background: 'linear-gradient(90deg, #0284c7 0%, #6366f1 50%, #0d9488 100%)'
      }} />

      <div style={{ padding: '1.5rem' }}>
        
        {/* ── Header Row ── */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start', minWidth: 260 }}>
            <div style={{
              width: 46,
              height: 46,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284c7, #4f46e5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0,
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.25)'
            }}>
              <Dna size={24} />
            </div>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.70rem',
                fontWeight: 800,
                color: '#0284c7',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                <Sparkles size={12} />
                <span>{isEs ? 'Medicina de Precisión Basada en ADN' : 'Precision Medicine · DNA-Guided'}</span>
              </div>
              <h2 style={{
                margin: '0.2rem 0',
                fontSize: '1.22rem',
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.25
              }}>
                {isEs ? 'Formulación Guiada por Fagron Genomics' : 'Formulation Guided by Fagron Genomics'}
              </h2>
              <div style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
                {test.name} · {isEs ? test.clinicalFieldEs : test.clinicalFieldEn}
              </div>
            </div>
          </div>

          {/* Badges */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: '#ecfdf5',
              color: '#047857',
              border: '1px solid #a7f3d0',
              padding: '3px 10px',
              borderRadius: '20px',
              fontSize: '0.73rem',
              fontWeight: 700
            }}>
              <ShieldCheck size={13} color="#059669" />
              <span>{isEs ? test.badgeEs : test.badgeEn}</span>
            </span>
            {boxId && (
              <span style={{
                fontSize: '0.70rem',
                color: '#64748b',
                fontFamily: 'monospace',
                fontWeight: 600,
                background: '#f8fafc',
                padding: '2px 8px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0'
              }}>
                Kit / Sample ID: {boxId}
              </span>
            )}
          </div>
        </div>

        {/* ── Official Scientific Statement Box ── */}
        <div style={{
          background: 'linear-gradient(135deg, #f0f9ff 0%, #eef2ff 100%)',
          border: '1px solid #bae6fd',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <Info size={18} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{
                margin: 0,
                fontSize: '0.84rem',
                color: '#0369a1',
                lineHeight: 1.5,
                fontWeight: 600
              }}>
                {isEs ? test.officialStatementEs : test.officialStatementEn}
              </p>
              <div style={{
                marginTop: '0.5rem',
                fontSize: '0.75rem',
                color: '#475569',
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap'
              }}>
                <span>🧬 <strong>{isEs ? 'Alcance Genético:' : 'Genetic Scope:'}</strong> {isEs ? test.geneticScopeEs : test.geneticScopeEn}</span>
                <span>🔬 <strong>{isEs ? 'Precisión Analítica:' : 'Analytical Precision:'}</strong> {test.reproducibility}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Pharmacogenomic Pathways Correlated with Prescribed APIs ── */}
        {matchedPathways.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#334155',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '0.65rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Layers size={14} color="#0284c7" />
              <span>{isEs ? 'Correlación de Rutas Genéticas con Principios Activos Prescritos:' : 'Genetic Pathways Correlated with Prescribed APIs:'}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {matchedPathways.map((p, idx) => (
                <div 
                  key={idx}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '0.85rem 1rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: 750,
                    fontSize: '0.82rem',
                    color: '#0f172a',
                    marginBottom: '0.35rem'
                  }}>
                    <CheckCircle2 size={15} color="#059669" style={{ flexShrink: 0 }} />
                    <span>{isEs ? p.pathwayEs : p.pathwayEn}</span>
                  </div>
                  <div style={{
                    fontSize: '0.78rem',
                    color: '#475569',
                    lineHeight: 1.45,
                    paddingLeft: '21px'
                  }}>
                    {isEs ? p.rationaleEs : p.rationaleEn}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Recommended Galenic Vehicle (TrichoSol™ / TrichoTech™) ── */}
        {test.recommendedVehicle && (
          <div style={{
            background: '#faf5ff',
            border: '1px solid #e9d5ff',
            borderRadius: '10px',
            padding: '0.85rem 1rem',
            marginBottom: '1rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.35rem',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 800, color: '#6b21a8' }}>
                <FlaskConical size={15} color="#7e22ce" />
                <span>{isEs ? 'Vehículo Magistral Recomendado por el Test:' : 'Test-Recommended Compounding Vehicle:'} {test.recommendedVehicle.name}</span>
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#7e22ce', background: '#f3e8ff', border: '1px solid #d8b4fe', padding: '1px 6px', borderRadius: '4px' }}>
                {test.recommendedVehicle.trademark}
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#581c87', lineHeight: 1.45 }}>
              {isEs ? test.recommendedVehicle.descriptionEs : test.recommendedVehicle.descriptionEn}
            </div>
          </div>
        )}

        {/* ── Footer Link to Fagron Genomics Official Website ── */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid #f1f5f9',
          fontSize: '0.74rem',
          color: '#64748b'
        }}>
          <div>
            {isEs 
              ? 'Práctica clínica avalada por consorcios internacionales de farmacogenómica.' 
              : 'Clinical practice aligned with international pharmacogenomic guidelines.'}
          </div>
          <a
            href={test.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              color: '#0284c7',
              fontWeight: 700,
              textDecoration: 'none'
            }}
          >
            <span>{isEs ? 'Ver Metodología en Fagron Genomics' : 'View Methodology at Fagron Genomics'}</span>
            <ExternalLink size={12} />
          </a>
        </div>

      </div>
    </div>
  );
}
