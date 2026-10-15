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
 * - 5. Precision Genomics & Epigenetics (ETERNA® · Eurofins Lab, always visible)
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
                  4. Atlas Clinical Recommendations (Adjuvant Ecosystem)
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
                  Evidence-Based · Synergistic Triad
                </span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#5f6368', marginTop: '2px' }}>
                Adjuvant protocol calibrated from the pharmacodynamic profile and active compounded ingredients of this prescription.
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
              <strong>Active Compounded Ingredients Analyzed in this Formulation:</strong>
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

        {/* Responsive Google Cloud UX Recommendations Rows (Full-Width Horizontal Stack) */}
        <style dangerouslySetInnerHTML={{ __html: `
          .atlas-gcp-recs-grid {
            display: flex;
            flex-direction: column;
            gap: 14px;
            width: 100%;
          }
          .atlas-gcp-rec-card {
            background: #ffffff;
            border: 1px solid #dadce0;
            border-radius: 8px;
            padding: 16px 18px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            transition: box-shadow 0.15s ease, border-color 0.15s ease;
            width: 100%;
            box-sizing: border-box;
          }
          .atlas-gcp-rec-card:hover {
            border-color: #bdc1c6;
            box-shadow: 0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15);
          }
          .atlas-gcp-btn {
            font-size: 0.75rem;
            font-weight: 600;
            color: #1a73e8;
            background: #ffffff;
            border: 1px solid #dadce0;
            padding: 6px 14px;
            border-radius: 4px;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: all 0.15s ease;
          }
          .atlas-gcp-btn:hover {
            background: #f8f9fa;
            border-color: #1a73e8;
            color: #174ea6;
          }
        ` }} />

        <div className="atlas-gcp-recs-grid">

          {/* ── CARD 1: BIOACTIVE PEPTIDE (LOTUSLAND RESEARCH) ── */}
          {peptide && (
            <div
              className="atlas-gcp-rec-card"
              style={{ borderLeft: '4px solid #1a73e8' }}
            >
              <div>
                {/* Header: Badge + Provider + Synergy Match */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.64rem',
                        fontWeight: 800,
                        color: '#1e40af',
                        background: '#dbeafe',
                        border: '1px solid #bfdbfe',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em'
                      }}
                    >
                      Priority 1 · Primary Pharmacodynamic Adjuvant
                    </span>
                    <span
                      style={{
                        fontSize: '0.66rem',
                        fontWeight: 700,
                        color: '#1a73e8',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        background: '#e8f0fe',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}
                    >
                      Bioregulator Peptide
                    </span>
                    <span style={{ fontSize: '0.73rem', color: '#5f6368', fontWeight: 600 }}>
                      Lotusland Research
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.67rem',
                      color: '#137333',
                      background: '#e6f4ea',
                      border: '1px solid #ceead6',
                      padding: '2px 7px',
                      borderRadius: '12px',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <Activity size={10} />
                    {peptide.matchScore || 'High Synergy'}
                  </span>
                </div>

                {/* Title & Category */}
                <h4 style={{ margin: '0 0 2px 0', fontSize: '0.92rem', fontWeight: 700, color: '#202124' }}>
                  {peptide.peptideName}
                </h4>
                <p style={{ margin: '0 0 10px 0', fontSize: '0.73rem', color: '#5f6368' }}>
                  {peptide.category}
                </p>

                {/* Rationale Callout */}
                <div
                  style={{
                    fontSize: '0.74rem',
                    color: '#3c4043',
                    lineHeight: 1.48,
                    background: '#f8f9fa',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #e8eaed',
                    borderLeft: '3px solid #1a73e8',
                    marginBottom: '10px'
                  }}
                >
                  <strong style={{ color: '#202124' }}>Pharmacological Mechanism & Synergy: </strong>
                  {peptide.pharmaRationale}
                </div>
              </div>

              {/* Card Footer: GCP Action Button */}
              {peptide.associatedProtocol && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid #f1f3f4', marginTop: 'auto' }}>
                  <a
                    href={peptide.associatedProtocol.url || `/proto/${peptide.associatedProtocol.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="atlas-gcp-btn"
                  >
                    <span>View Clinical Protocol</span>
                    <ArrowUpRight size={13} />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* ── CARD 2: PRECISION ORAL NUTRACEUTICAL (ULTRAPERSON) ── */}
          {supplement && (
            <div
              className="atlas-gcp-rec-card"
              style={{ borderLeft: '4px solid #ea580c' }}
            >
              <div>
                {/* Header: Badge + Provider + Synergy Match */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.64rem',
                        fontWeight: 800,
                        color: '#9a3412',
                        background: '#ffedd5',
                        border: '1px solid #fed7aa',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em'
                      }}
                    >
                      Priority 2 · Essential Micronutrition Synergy
                    </span>
                    <span
                      style={{
                        fontSize: '0.66rem',
                        fontWeight: 700,
                        color: '#c2410c',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        background: '#ffedd5',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}
                    >
                      Oral Nutraceutical
                    </span>
                    <span style={{ fontSize: '0.73rem', color: '#5f6368', fontWeight: 600 }}>
                      UltraPerson · PharmaPolis
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.67rem',
                      color: '#c2410c',
                      background: '#fff7ed',
                      border: '1px solid #fed7aa',
                      padding: '2px 7px',
                      borderRadius: '12px',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <Pill size={10} />
                    {supplement.matchScore || 'Metabolic Synergy'}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <h4 style={{ margin: '0 0 2px 0', fontSize: '0.92rem', fontWeight: 700, color: '#202124' }}>
                  {supplement.productName}
                </h4>
                <p style={{ margin: '0 0 8px 0', fontSize: '0.73rem', color: '#9a3412', fontWeight: 600 }}>
                  {supplement.subtitle || supplement.category}
                </p>

                {/* Key Actives Chips */}
                {supplement.keyActives && supplement.keyActives.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                    {supplement.keyActives.map((act, actIdx) => (
                      <span
                        key={actIdx}
                        style={{
                          fontSize: '0.66rem',
                          background: '#f1f3f4',
                          color: '#3c4043',
                          border: '1px solid #dadce0',
                          padding: '1px 6px',
                          borderRadius: '3px',
                          fontWeight: 500
                        }}
                      >
                        {act}
                      </span>
                    ))}
                  </div>
                )}

                {/* Rationale Callout */}
                <div
                  style={{
                    fontSize: '0.74rem',
                    color: '#3c4043',
                    lineHeight: 1.48,
                    background: '#f8f9fa',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #e8eaed',
                    borderLeft: '3px solid #ea580c',
                    marginBottom: supplement.routineAdvice ? '6px' : '10px'
                  }}
                >
                  <strong style={{ color: '#202124' }}>Clinical Rationale & Synergy: </strong>
                  {supplement.clinicalRationale}
                </div>

                {supplement.routineAdvice && (
                  <div
                    style={{
                      fontSize: '0.72rem',
                      color: '#475569',
                      background: '#fff7ed',
                      border: '1px solid #fed7aa',
                      padding: '6px 10px',
                      borderRadius: '4px',
                      marginBottom: '10px'
                    }}
                  >
                    <strong style={{ color: '#9a3412' }}>Suggested Adjuvant Regimen: </strong>
                    {supplement.routineAdvice}
                  </div>
                )}
              </div>

              {/* Card Footer: GCP Action Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid #f1f3f4', marginTop: 'auto' }}>
                <a
                  href={supplement.catalogUrl || `/p/${supplement.catalogSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="atlas-gcp-btn"
                  style={{ color: '#c2410c' }}
                >
                  <span>View UltraPerson Monograph</span>
                  <ArrowUpRight size={13} />
                </a>
              </div>
            </div>
          )}

          {/* ── CARD 3: DIAGNOSTIC BIOMARKER MONITORING (BLOODO) ── */}
          {diagnostic && (
            <div
              className="atlas-gcp-rec-card"
              style={{ borderLeft: '4px solid #0284c7' }}
            >
              <div>
                {/* Header: Badge + Provider + Synergy Match */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.64rem',
                        fontWeight: 800,
                        color: '#0369a1',
                        background: '#e0f2fe',
                        border: '1px solid #bae6fd',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em'
                      }}
                    >
                      Priority 3 · Objective Biomarker Monitoring
                    </span>
                    <span
                      style={{
                        fontSize: '0.66rem',
                        fontWeight: 700,
                        color: '#0369a1',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        background: '#e0f2fe',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}
                    >
                      Biomarker Monitoring
                    </span>
                    <span style={{ fontSize: '0.73rem', color: '#5f6368', fontWeight: 600 }}>
                      Bloodo Diagnostic Suite
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.67rem',
                      color: '#0284c7',
                      background: '#f0f9ff',
                      border: '1px solid #bae6fd',
                      padding: '2px 7px',
                      borderRadius: '12px',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <FlaskConical size={10} />
                    {diagnostic.matchScore || 'Diagnostic Synergy'}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <h4 style={{ margin: '0 0 2px 0', fontSize: '0.92rem', fontWeight: 700, color: '#202124' }}>
                  {diagnostic.testName}
                </h4>
                <p style={{ margin: '0 0 8px 0', fontSize: '0.73rem', color: '#0284c7', fontWeight: 600 }}>
                  {diagnostic.subtitle || diagnostic.category}
                </p>

                {/* Biomarkers Tested Chips */}
                {diagnostic.biomarkersTested && diagnostic.biomarkersTested.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                    {diagnostic.biomarkersTested.map((bio, bIdx) => (
                      <span
                        key={bIdx}
                        style={{
                          fontSize: '0.66rem',
                          background: '#f1f3f4',
                          color: '#3c4043',
                          border: '1px solid #dadce0',
                          padding: '1px 6px',
                          borderRadius: '3px',
                          fontWeight: 500
                        }}
                      >
                        {bio}
                      </span>
                    ))}
                  </div>
                )}

                {/* Rationale Callout */}
                <div
                  style={{
                    fontSize: '0.74rem',
                    color: '#3c4043',
                    lineHeight: 1.48,
                    background: '#f8f9fa',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #e8eaed',
                    borderLeft: '3px solid #0284c7',
                    marginBottom: diagnostic.timingRecommendation ? '6px' : '10px'
                  }}
                >
                  <strong style={{ color: '#202124' }}>Clinical Monitoring Objective: </strong>
                  {diagnostic.clinicalRationale}
                </div>

                {diagnostic.timingRecommendation && (
                  <div
                    style={{
                      fontSize: '0.72rem',
                      color: '#475569',
                      background: '#f0f9ff',
                      border: '1px solid #bae6fd',
                      padding: '6px 10px',
                      borderRadius: '4px',
                      marginBottom: '10px'
                    }}
                  >
                    <strong style={{ color: '#0369a1' }}>Recommended Time Window: </strong>
                    {diagnostic.timingRecommendation}
                  </div>
                )}
              </div>

              {/* Card Footer: GCP Action Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid #f1f3f4', marginTop: 'auto' }}>
                <a
                  href={diagnostic.catalogUrl || `/p/${diagnostic.catalogSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="atlas-gcp-btn"
                  style={{ color: '#0284c7' }}
                >
                  <span>View Bloodo Panel</span>
                  <ArrowUpRight size={13} />
                </a>
              </div>
            </div>
          )}

          {/* ── CARD 4: EPICUTANEOUS BARRIER & ECM SUPPORT (COLWAY) ── */}
          {colway && (
            <div
              className="atlas-gcp-rec-card"
              style={{ borderLeft: '4px solid #059669' }}
            >
              <div>
                {/* Header: Badge + Provider + Synergy Match */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.64rem',
                        fontWeight: 800,
                        color: '#065f46',
                        background: '#d1fae5',
                        border: '1px solid #a7f3d0',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em'
                      }}
                    >
                      Priority 4 · Scalp Barrier & Native ECM
                    </span>
                    <span
                      style={{
                        fontSize: '0.66rem',
                        fontWeight: 700,
                        color: '#047857',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        background: '#d1fae5',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}
                    >
                      Barrier & Native ECM
                    </span>
                    <span style={{ fontSize: '0.73rem', color: '#5f6368', fontWeight: 600 }}>
                      Colway Clinical Care
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.67rem',
                      color: '#047857',
                      background: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      padding: '2px 7px',
                      borderRadius: '12px',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <Droplets size={10} />
                    {colway.matchScore || 'Barrier Support'}
                  </span>
                </div>

                {/* Title & Brand */}
                <h4 style={{ margin: '0 0 2px 0', fontSize: '0.92rem', fontWeight: 700, color: '#202124' }}>
                  {colway.productName}
                </h4>
                <p style={{ margin: '0 0 8px 0', fontSize: '0.73rem', color: '#059669', fontWeight: 600 }}>
                  {colway.brand} • {colway.regulatoryNotice}
                </p>

                {/* Rationale Callout */}
                <div
                  style={{
                    fontSize: '0.74rem',
                    color: '#3c4043',
                    lineHeight: 1.48,
                    background: '#f8fafc',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #e8eaed',
                    borderLeft: '3px solid #059669',
                    marginBottom: colway.routineAdvice ? '6px' : '10px'
                  }}
                >
                  <strong style={{ color: '#202124' }}>Clinical Rationale: </strong>
                  {colway.clinicalRationale}
                </div>

                {colway.routineAdvice && (
                  <div
                    style={{
                      fontSize: '0.72rem',
                      color: '#475569',
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      padding: '6px 10px',
                      borderRadius: '4px',
                      marginBottom: '10px'
                    }}
                  >
                    <strong style={{ color: '#166534' }}>Adjuvant Regimen: </strong>
                    {colway.routineAdvice}
                  </div>
                )}
              </div>

              {/* Card Footer: GCP Action Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid #f1f3f4', marginTop: 'auto' }}>
                <a
                  href={colway.catalogUrl || `/p/${colway.catalogSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="atlas-gcp-btn"
                  style={{ color: '#047857' }}
                >
                  <span>View Colway Monograph</span>
                  <ArrowUpRight size={13} />
                </a>
              </div>
            </div>
          )}

          {/* ── CARD 5: PRECISION GENOMICS & EPIGENETICS (ETERNA® DX) ── */}
          <div
            className="atlas-gcp-rec-card"
            style={{
              borderLeft: '4px solid #0d9488'
            }}
          >
            <div>
              {/* Header: Badge + Provider + SNPs Tag */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: '0.64rem',
                      fontWeight: 800,
                      color: '#115e59',
                      background: '#ccfbf1',
                      border: '1px solid #99f6e4',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}
                  >
                    Priority 5 · Longitudinal Genomic & Epigenetic Tracking
                  </span>
                  <span
                    style={{
                      fontSize: '0.66rem',
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
                  <span style={{ fontSize: '0.73rem', color: '#5f6368', fontWeight: 600 }}>
                    ETERNA DX · Eurofins Lab
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.67rem',
                    color: '#0d9488',
                    background: '#f0fdfa',
                    border: '1px solid #99f6e4',
                    padding: '2px 7px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Dna size={10} />
                  +700K SNPs · Saliva · Track
                </span>
              </div>

              {/* Title & Subtitle */}
              <h4 style={{ margin: '0 0 2px 0', fontSize: '0.92rem', fontWeight: 700, color: '#202124' }}>
                ETERNA® DNA & Epigenetic Longevity Test
              </h4>
              <p style={{ margin: '0 0 8px 0', fontSize: '0.73rem', color: '#0d9488', fontWeight: 600 }}>
                Genomic & epigenetic baseline for ongoing patient wellness monitoring
              </p>

              {/* Rationale Callout */}
              <div
                style={{
                  fontSize: '0.74rem',
                  color: '#3c4043',
                  lineHeight: 1.48,
                  background: '#f8fafc',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #e8eaed',
                  borderLeft: '3px solid #0d9488',
                  marginBottom: '8px'
                }}
              >
                <strong style={{ color: '#202124' }}>Track your patients' wellness with molecular precision. </strong>
                ETERNA® gives you a genomic and epigenetic baseline for each patient — biological age
                (Horvath / Hannum clocks), nutrigenomic profile, cardiovascular risk markers, and
                pharmacogenomic response — so you can personalize peptide protocols, monitor treatment
                effectiveness over time, and make data-driven adjustments. Repeat testing reveals
                measurable epigenetic age reversal and validates your clinical interventions.
              </div>

              <div
                style={{
                  fontSize: '0.72rem',
                  color: '#475569',
                  background: '#f0fdfa',
                  border: '1px solid #99f6e4',
                  padding: '6px 10px',
                  borderRadius: '4px',
                  marginBottom: '10px'
                }}
              >
                <strong style={{ color: '#115e59' }}>Simple 2-minute saliva collection: </strong>
                Processed by Eurofins (ISO 17025). Downloadable clinical report in 15–20 days. Re-test every 6–12 months to measure patient progress.
              </div>
            </div>

            {/* Card Footer: GCP Action Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid #f1f3f4', marginTop: 'auto' }}>
              <a
                href="/p/eterna-epigenetic-age-test"
                target="_blank"
                rel="noopener noreferrer"
                className="atlas-gcp-btn"
                style={{ color: '#0d9488' }}
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
