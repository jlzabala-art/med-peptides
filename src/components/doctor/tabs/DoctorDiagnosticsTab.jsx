"use client";

import React from 'react';
import { Activity, ExternalLink, ShieldCheck, FileText } from 'lucide-react';

/**
 * DoctorDiagnosticsTab
 * 
 * Bloodo™ Diagnostic Biomarker Panels & Quantitative Baseline Calibration
 * Displays all 6 certified CE-IVDR pre-treatment capillary DBS diagnostic panels.
 */
export default function DoctorDiagnosticsTab({
  bloodoPanels = [],
  triggerHaptic
}) {
  return (
    <section
      id="diagnostics"
      style={{
        background: '#ffffff',
        border: '1px solid #dadce0',
        borderRadius: '8px',
        marginTop: '32px',
        boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
        overflow: 'hidden'
      }}
    >
      {/* Section Header */}
      <div
        style={{
          padding: '18px 22px',
          borderBottom: '1px solid #dadce0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          background: '#ffffff'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.08rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} style={{ color: '#003666' }} />
              <span>Bloodo™ Diagnostic Biomarker Panels &amp; Quantitative Baseline Calibration</span>
            </h2>
            <span style={{ fontSize: '0.70rem', color: '#0d9488', background: '#f0fdfa', border: '1px solid #99f6e4', padding: '1px 8px', borderRadius: '12px', fontWeight: 600 }}>
              6 CE-IVDR Certified Capillary DBS Tests
            </span>
            <span style={{ fontSize: '0.70rem', color: '#64748b', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '1px 8px', borderRadius: '12px', fontWeight: 600 }}>
              ISO 15189 Accredited Lab
            </span>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.80rem', color: '#64748b' }}>
            All 6 certified pre-treatment diagnostic panels for objective physiological baseline profiling. Click any test to open its complete public analytical datasheet.
          </p>
        </div>
      </div>

      {/* Diagnostic Panels Matrix */}
      <div style={{ padding: '20px 22px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '16px'
        }}>
          {bloodoPanels.map((panel) => (
            <div
              key={panel.id}
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '16px 18px',
                background: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                transition: 'all 0.15s ease-in-out'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#003666';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,54,102,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
              }}
            >
              <div>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '8px' }}>
                  <a
                    href={`/p/${panel.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.35 }}>
                      {panel.name}
                    </h4>
                    <ExternalLink size={13} style={{ color: '#1a73e8', flexShrink: 0 }} />
                  </a>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 650,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: '#f8fafc',
                    color: '#475569',
                    border: '1px solid #e2e8f0',
                    whiteSpace: 'nowrap'
                  }}>
                    TAT: {panel.tat}
                  </span>
                </div>

                {/* Specimen pill */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    padding: '1px 8px',
                    borderRadius: '12px',
                    background: '#eff6ff',
                    color: '#1d4ed8'
                  }}>
                    Specimen: {panel.specimen}
                  </span>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    padding: '1px 8px',
                    borderRadius: '12px',
                    background: '#f0fdf4',
                    color: '#166534',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}>
                    <ShieldCheck size={11} /> Pre-Protocol Baseline
                  </span>
                </div>

                {/* Indication */}
                <p style={{ margin: '0 0 10px 0', fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>
                  {panel.indications}
                </p>

                {/* Measured Biomarkers */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px 12px', marginBottom: '10px' }}>
                  <div style={{ fontSize: '0.70rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Quantitative Analytes Measured:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {panel.biomarkers.map((b, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '0.70rem',
                          fontWeight: 500,
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#1e293b',
                          padding: '2px 6px',
                          borderRadius: '3px'
                        }}
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Clinical Decision Utility */}
                <div style={{ fontSize: '0.73rem', color: '#0d9488', lineHeight: 1.35, marginBottom: '10px', background: '#f0fdfa', border: '1px solid #ccfbf1', padding: '8px 10px', borderRadius: '4px' }}>
                  <strong>Clinical Decision Utility:</strong> {panel.clinicalUtility}
                </div>

                {/* Companion Evidence Protocol Link */}
                {panel.associatedProtocolTitle && (
                  <div style={{ marginBottom: '10px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '4px', padding: '7px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '0.71rem', color: '#1d4ed8', fontWeight: 600 }}>
                      Baseline for: <strong>{panel.associatedProtocolTitle}</strong>
                    </div>
                    <a
                      href={panel.associatedProtocolUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '0.70rem',
                        fontWeight: 700,
                        color: '#1d4ed8',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      <span>Protocol Guide</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>
                )}
              </div>

              {/* Panel footer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginTop: '12px' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Requisition via Atlas Clinical Lab
                </span>
                <a
                  href={`/p/${panel.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => triggerHaptic && triggerHaptic('light')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: '#ffffff',
                    border: '1px solid #1a73e8',
                    borderRadius: '4px',
                    padding: '4px 10px',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    color: '#1a73e8',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.12s',
                    boxShadow: '0 1px 2px rgba(26,115,232,0.06)'
                  }}
                >
                  <FileText size={12} />
                  <span>Public Datasheet</span>
                  <ExternalLink size={10} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
