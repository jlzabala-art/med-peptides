"use client";

import React from 'react';
import { Sparkles, ArrowUpRight, Activity, Pill, FlaskConical, Droplets, ShieldCheck, CheckCircle2, Dna } from '@/lib/icons';

/**
 * AtlasSynergyRecommendationsSection
 * 
 * Google Cloud UX Horizontal Layout for Clinical Adjuvant Recommendations:
 * - 1. Bioactive Peptide (Lotusland Research)
 * - 2. Precision Oral Nutraceutical (UltraPerson by PharmaPolis)
 * - 3. Diagnostic Biomarker Monitoring (Bloodo Diagnostic Suite)
 * - 4. Scalp Barrier & ECM Support (Colway Clinical Care, conditional)
 * - 5. Precision Genomics & Epigenetics (ETERNA® · Fagron Genomics, always visible)
 * 
 * Styled according to Google Cloud Console design principles:
 * - Full-width stacked horizontal rows (not vertical cards)
 * - Left accent indicator bar
 * - Left column: Pillar badge + Provider + Match score
 * - Center column: Product name, key actives/biomarkers, clinical rationale & suggested dosing schedule in Spanish
 * - Right column: GCP standard action button with arrow icon
 */
export default function AtlasSynergyRecommendationsSection({
  atlasRecs,
  _isEs = true
}) {
  if (!atlasRecs) return null;
  const { peptide, supplement, diagnostic, colway, detectedApis } = atlasRecs;
  if (!peptide && !supplement && !diagnostic && !colway) return null;

  return (
    <div
      id="atlas-recommendations-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        marginBottom: '1.5rem',
        scrollMarginTop: '100px'
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #dadce0',
          padding: '1.25rem',
          boxShadow: 'none'
        }}
      >
        {/* Clean GCP Card Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '1rem',
            marginBottom: '1rem',
            borderBottom: '1px solid #f1f3f4',
            flexWrap: 'wrap',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '4px',
                background: '#e0e7ff',
                color: '#4338ca',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Sparkles size={16} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#202124' }}>
                  4. Recomendaciones Clínicas Atlas (Ecosistema Coadyuvante)
                </span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    background: '#ecfdf5',
                    color: '#047857',
                    border: '1px solid #a7f3d0',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    fontWeight: 600
                  }}
                >
                  Basado en Evidencia · Tríada Sinérgica
                </span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#5f6368', marginTop: '2px' }}>
                Protocolo coadyuvante calibrado a partir del perfil farmacodinámico y los principios activos de esta formulación magistral.
              </div>
            </div>
          </div>

          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              padding: '3px 10px',
              borderRadius: '12px',
              background: '#f0fdf4',
              color: '#16a34a',
              border: '1px solid #bbf7d0',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <CheckCircle2 size={12} />
            Atlas AI Clinical Intelligence
          </span>
        </div>

        {/* Detected APIs Header */}
        {detectedApis && detectedApis.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              padding: '8px 12px',
              background: '#f8f9fa',
              borderRadius: '6px',
              border: '1px solid #edf2f7',
              flexWrap: 'wrap',
              gap: '8px'
            }}
          >
            <div style={{ fontSize: '0.76rem', color: '#3c4043' }}>
              <strong>Principios Activos Analizados en esta Fórmula:</strong>
            </div>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {detectedApis.map((api, aIdx) => (
                <span
                  key={aIdx}
                  style={{
                    fontSize: '0.70rem',
                    background: '#ffffff',
                    color: '#202124',
                    border: '1px solid #dadce0',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 600,
                    fontFamily: 'monospace'
                  }}
                >
                  {api}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Stacked Horizontal Rows (Google Cloud UX Pattern) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

          {/* ── ROW 1: BIOACTIVE PEPTIDE (LOTUSLAND RESEARCH) ── */}
          {peptide && (
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e0e0e0',
                borderLeft: '4px solid #4338ca',
                borderRadius: '6px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap',
                transition: 'border-color 0.15s ease'
              }}
            >
              {/* Left Column: Pillar & Match Badge (~210px) */}
              <div style={{ minWidth: '190px', maxWidth: '220px', flex: '0 0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span
                    style={{
                      fontSize: '0.67rem',
                      fontWeight: 700,
                      color: '#4338ca',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      background: '#e0e7ff',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}
                  >
                    Péptido Biorregulador
                  </span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                  Lotusland Research
                </div>
                <div style={{ marginTop: '6px' }}>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      color: '#047857',
                      background: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      padding: '2px 7px',
                      borderRadius: '4px',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Activity size={10} />
                    {peptide.matchScore || 'Alta Sinergia'}
                  </span>
                </div>
              </div>

              {/* Center Column: Information & Clinical Rationale (flex: 1) */}
              <div style={{ flex: '1 1 340px', minWidth: '260px' }}>
                <h4 style={{ margin: '0 0 3px 0', fontSize: '0.94rem', fontWeight: 800, color: '#0f172a' }}>
                  {peptide.peptideName}
                </h4>
                <p style={{ margin: '0 0 8px 0', fontSize: '0.73rem', color: '#64748b' }}>
                  {peptide.category}
                </p>

                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#334155',
                    lineHeight: 1.48,
                    background: '#f8fafc',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #edf2f7'
                  }}
                >
                  <strong style={{ color: '#0f172a' }}>Mecanismo Farmacológico y Sinergia: </strong>
                  {peptide.pharmaRationale}
                </div>
              </div>

              {/* Right Column: GCP Button Action */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flex: '0 0 auto', alignSelf: 'center' }}>
                {peptide.associatedProtocol && (
                  <a
                    href={peptide.associatedProtocol.url || `/proto/${peptide.associatedProtocol.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      color: '#1d4ed8',
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      padding: '6px 14px',
                      borderRadius: '4px',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <span>Ver Protocolo Clínico</span>
                    <ArrowUpRight size={13} />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* ── ROW 2: PRECISION ORAL NUTRACEUTICAL (ULTRAPERSON BY PHARMAPOLIS) ── */}
          {supplement && (
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e0e0e0',
                borderLeft: '4px solid #ea580c',
                borderRadius: '6px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap',
                transition: 'border-color 0.15s ease'
              }}
            >
              {/* Left Column: Pillar & Match Badge (~210px) */}
              <div style={{ minWidth: '190px', maxWidth: '220px', flex: '0 0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span
                    style={{
                      fontSize: '0.67rem',
                      fontWeight: 700,
                      color: '#c2410c',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      background: '#ffedd5',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}
                  >
                    Nutracéutico Oral
                  </span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                  UltraPerson · PharmaPolis
                </div>
                <div style={{ marginTop: '6px' }}>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      color: '#c2410c',
                      background: '#fff7ed',
                      border: '1px solid #fed7aa',
                      padding: '2px 7px',
                      borderRadius: '4px',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Pill size={10} />
                    {supplement.matchScore || 'Sinergia Metabólica'}
                  </span>
                </div>
              </div>

              {/* Center Column: Information, Key Actives & Clinical Rationale (flex: 1) */}
              <div style={{ flex: '1 1 340px', minWidth: '260px' }}>
                <h4 style={{ margin: '0 0 3px 0', fontSize: '0.94rem', fontWeight: 800, color: '#0f172a' }}>
                  {supplement.productName}
                </h4>
                <p style={{ margin: '0 0 6px 0', fontSize: '0.73rem', color: '#9a3412', fontWeight: 600 }}>
                  {supplement.subtitle || supplement.category}
                </p>

                {/* Key Actives Pills */}
                {supplement.keyActives && supplement.keyActives.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                    {supplement.keyActives.map((act, actIdx) => (
                      <span
                        key={actIdx}
                        style={{
                          fontSize: '0.66rem',
                          background: '#f8fafc',
                          color: '#475569',
                          border: '1px solid #e2e8f0',
                          padding: '1px 6px',
                          borderRadius: '3px',
                          fontWeight: 600
                        }}
                      >
                        {act}
                      </span>
                    ))}
                  </div>
                )}

                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#334155',
                    lineHeight: 1.48,
                    background: '#f8fafc',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #edf2f7',
                    marginBottom: supplement.routineAdvice ? '6px' : '0'
                  }}
                >
                  <strong style={{ color: '#0f172a' }}>Justificación Clínica y Sinergia: </strong>
                  {supplement.clinicalRationale}
                </div>

                {supplement.routineAdvice && (
                  <div
                    style={{
                      fontSize: '0.73rem',
                      color: '#475569',
                      background: '#fff7ed',
                      border: '1px solid #fed7aa',
                      padding: '6px 10px',
                      borderRadius: '6px'
                    }}
                  >
                    <strong style={{ color: '#9a3412' }}>Pauta Coadyuvante Sugerida: </strong>
                    {supplement.routineAdvice}
                  </div>
                )}
              </div>

              {/* Right Column: GCP Button Action */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flex: '0 0 auto', alignSelf: 'center' }}>
                <a
                  href={supplement.catalogUrl || `/p/${supplement.catalogSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    color: '#c2410c',
                    background: '#fff7ed',
                    border: '1px solid #fed7aa',
                    padding: '6px 14px',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span>Ver Ficha UltraPerson</span>
                  <ArrowUpRight size={13} />
                </a>
              </div>
            </div>
          )}

          {/* ── ROW 3: DIAGNOSTIC BIOMARKER MONITORING (BLOODO DIAGNOSTIC SUITE) ── */}
          {diagnostic && (
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e0e0e0',
                borderLeft: '4px solid #0284c7',
                borderRadius: '6px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap',
                transition: 'border-color 0.15s ease'
              }}
            >
              {/* Left Column: Pillar & Match Badge (~210px) */}
              <div style={{ minWidth: '190px', maxWidth: '220px', flex: '0 0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span
                    style={{
                      fontSize: '0.67rem',
                      fontWeight: 700,
                      color: '#0369a1',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      background: '#e0f2fe',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}
                  >
                    Monitorización Analítica
                  </span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                  Bloodo Diagnostic Suite
                </div>
                <div style={{ marginTop: '6px' }}>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      color: '#0284c7',
                      background: '#f0f9ff',
                      border: '1px solid #bae6fd',
                      padding: '2px 7px',
                      borderRadius: '4px',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <FlaskConical size={10} />
                    {diagnostic.matchScore || 'Sinergia Diagnóstica'}
                  </span>
                </div>
              </div>

              {/* Center Column: Information, Biomarkers & Clinical Objectives (flex: 1) */}
              <div style={{ flex: '1 1 340px', minWidth: '260px' }}>
                <h4 style={{ margin: '0 0 3px 0', fontSize: '0.94rem', fontWeight: 800, color: '#0f172a' }}>
                  {diagnostic.testName}
                </h4>
                <p style={{ margin: '0 0 6px 0', fontSize: '0.73rem', color: '#0284c7', fontWeight: 600 }}>
                  {diagnostic.subtitle || diagnostic.category}
                </p>

                {/* Biomarkers Tested Pills */}
                {diagnostic.biomarkersTested && diagnostic.biomarkersTested.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                    {diagnostic.biomarkersTested.map((bio, bIdx) => (
                      <span
                        key={bIdx}
                        style={{
                          fontSize: '0.66rem',
                          background: '#f8fafc',
                          color: '#334155',
                          border: '1px solid #e2e8f0',
                          padding: '1px 6px',
                          borderRadius: '3px',
                          fontWeight: 600
                        }}
                      >
                        {bio}
                      </span>
                    ))}
                  </div>
                )}

                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#334155',
                    lineHeight: 1.48,
                    background: '#f8fafc',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #edf2f7',
                    marginBottom: diagnostic.timingRecommendation ? '6px' : '0'
                  }}
                >
                  <strong style={{ color: '#0f172a' }}>Objetivo Clínico de Monitorización: </strong>
                  {diagnostic.clinicalRationale}
                </div>

                {diagnostic.timingRecommendation && (
                  <div
                    style={{
                      fontSize: '0.73rem',
                      color: '#475569',
                      background: '#f0f9ff',
                      border: '1px solid #bae6fd',
                      padding: '6px 10px',
                      borderRadius: '6px'
                    }}
                  >
                    <strong style={{ color: '#0369a1' }}>Ventana Temporal Recomendada: </strong>
                    {diagnostic.timingRecommendation}
                  </div>
                )}
              </div>

              {/* Right Column: GCP Button Action */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flex: '0 0 auto', alignSelf: 'center' }}>
                <a
                  href={diagnostic.catalogUrl || `/p/${diagnostic.catalogSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    color: '#0284c7',
                    background: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    padding: '6px 14px',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span>Ver Panel Bloodo</span>
                  <ArrowUpRight size={13} />
                </a>
              </div>
            </div>
          )}

          {/* ── ROW 4: EPICUTANEOUS BARRIER & ECM SUPPORT (COLWAY CLINICAL CARE) ── */}
          {colway && (
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e0e0e0',
                borderLeft: '4px solid #059669',
                borderRadius: '6px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap',
                transition: 'border-color 0.15s ease'
              }}
            >
              {/* Left Column: Pillar & Match Badge (~210px) */}
              <div style={{ minWidth: '190px', maxWidth: '220px', flex: '0 0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span
                    style={{
                      fontSize: '0.67rem',
                      fontWeight: 700,
                      color: '#047857',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      background: '#d1fae5',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}
                  >
                    Barrera & Colágeno
                  </span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                  Colway Clinical Care
                </div>
                <div style={{ marginTop: '6px' }}>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      color: '#047857',
                      background: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      padding: '2px 7px',
                      borderRadius: '4px',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Droplets size={10} />
                    {colway.matchScore || 'Soporte Barrera'}
                  </span>
                </div>
              </div>

              {/* Center Column: Information & Clinical Rationale (flex: 1) */}
              <div style={{ flex: '1 1 340px', minWidth: '260px' }}>
                <h4 style={{ margin: '0 0 3px 0', fontSize: '0.94rem', fontWeight: 800, color: '#0f172a' }}>
                  {colway.productName}
                </h4>
                <p style={{ margin: '0 0 8px 0', fontSize: '0.73rem', color: '#059669', fontWeight: 600 }}>
                  {colway.brand} • {colway.regulatoryNotice}
                </p>

                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#334155',
                    lineHeight: 1.48,
                    background: '#f8fafc',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #edf2f7',
                    marginBottom: colway.routineAdvice ? '6px' : '0'
                  }}
                >
                  <strong style={{ color: '#0f172a' }}>Justificación Clínica: </strong>
                  {colway.clinicalRationale}
                </div>

                {colway.routineAdvice && (
                  <div
                    style={{
                      fontSize: '0.73rem',
                      color: '#475569',
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      padding: '6px 10px',
                      borderRadius: '6px'
                    }}
                  >
                    <strong style={{ color: '#166534' }}>Pauta Coadyuvante: </strong>
                    {colway.routineAdvice}
                  </div>
                )}
              </div>

              {/* Right Column: GCP Button Action */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flex: '0 0 auto', alignSelf: 'center' }}>
                <a
                  href={colway.catalogUrl || `/p/${colway.catalogSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    color: '#047857',
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    padding: '6px 14px',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span>Ver Ficha Colway</span>
                  <ArrowUpRight size={13} />
                </a>
              </div>
            </div>
          )}

          {/* ── ROW 5: PRECISION GENOMICS & EPIGENETICS (ETERNA® · EUROFINS) ── */}
          {/* Always visible — universal platform recommendation for every prescription */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e0e0e0',
              borderLeft: '4px solid #0d9488',
              borderRadius: '6px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
              transition: 'border-color 0.15s ease'
            }}
          >
            {/* Left Column: Pillar & Match Badge (~210px) */}
            <div style={{ minWidth: '190px', maxWidth: '220px', flex: '0 0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span
                  style={{
                    fontSize: '0.67rem',
                    fontWeight: 700,
                    color: '#0d9488',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    background: '#ccfbf1',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}
                >
                  Patient Wellness Tracking
                </span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                ETERNA DX · Eurofins Lab
              </div>
              <div style={{ marginTop: '6px' }}>
                <span
                  style={{
                    fontSize: '0.68rem',
                    color: '#0d9488',
                    background: '#f0fdfa',
                    border: '1px solid #99f6e4',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Dna size={10} />
                  +700K SNPs · Saliva · Track
                </span>
              </div>
            </div>

            {/* Center Column: Information & Clinical Rationale (flex: 1) */}
            <div style={{ flex: '1 1 340px', minWidth: '260px' }}>
              <h4 style={{ margin: '0 0 3px 0', fontSize: '0.94rem', fontWeight: 800, color: '#0f172a' }}>
                ETERNA® DNA & Epigenetic Longevity Test
              </h4>
              <p style={{ margin: '0 0 8px 0', fontSize: '0.73rem', color: '#0d9488', fontWeight: 600 }}>
                Genomic & epigenetic baseline for ongoing patient wellness monitoring
              </p>

              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#334155',
                  lineHeight: 1.48,
                  background: '#f8fafc',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #edf2f7',
                  marginBottom: '6px'
                }}
              >
                <strong style={{ color: '#0f172a' }}>Track your patients' wellness with molecular precision. </strong>
                ETERNA® gives you a genomic and epigenetic baseline for each patient — biological age
                (Horvath / Hannum clocks), nutrigenomic profile, cardiovascular risk markers, and
                pharmacogenomic response — so you can personalize peptide protocols, monitor treatment
                effectiveness over time, and make data-driven adjustments. Repeat testing reveals
                measurable epigenetic age reversal and validates your clinical interventions.
              </div>

              <div
                style={{
                  fontSize: '0.73rem',
                  color: '#475569',
                  background: '#f0fdfa',
                  border: '1px solid #99f6e4',
                  padding: '6px 10px',
                  borderRadius: '6px'
                }}
              >
                <strong style={{ color: '#115e59' }}>Simple 2-minute saliva collection: </strong>
                Processed by Eurofins (ISO 17025). Downloadable clinical report in 15–20 days. Re-test every 6–12 months to measure patient progress.
              </div>
            </div>

            {/* Right Column: GCP Button Action */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flex: '0 0 auto', alignSelf: 'center' }}>
              <a
                href="/p/eterna-epigenetic-age-test"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  color: '#0d9488',
                  background: '#f0fdfa',
                  border: '1px solid #99f6e4',
                  padding: '6px 14px',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>Learn More</span>
                <ArrowUpRight size={13} />
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
