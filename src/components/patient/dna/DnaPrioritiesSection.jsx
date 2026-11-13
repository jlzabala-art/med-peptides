'use client';

import React from 'react';
import { Target, Zap, ShieldCheck } from 'lucide-react';

/**
 * Chapter 1: Your DNA in Plain Language (5 Key Body Priorities)
 * Luxury MedTech UI with calm clinical cards, distinct priority badges, and the 3-step biochemical eating order.
 */
export default function DnaPrioritiesSection({ clinicalProfile, patientName, sampleCode }) {
  if (!clinicalProfile) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 5 Clinical Genomic Axes Cards */}
      <div
        id="dna-axes-section"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #dadce0',
          padding: '20px',
          boxShadow: '0 1px 2px rgba(60, 64, 67, 0.06)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#1a73e8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              CHAPTER 1 · CLINICAL INTELLIGENCE
            </span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#202124', margin: '2px 0 0 0' }}>
              The 5 Key Body Priorities
            </h3>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#5f6368', backgroundColor: '#f1f3f4', padding: '4px 10px', borderRadius: '4px', border: '1px solid #dadce0' }}>
            Specimen: <strong style={{ color: '#202124' }}>{sampleCode}</strong> · Patient: <strong style={{ color: '#202124' }}>{patientName}</strong>
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '12px' }}>
          {clinicalProfile.fiveClinicalAxes?.map((axis) => {
            const isHigh = axis.riskLevel.includes('HIGH') || axis.riskLevel.includes('SAFETY') || axis.riskLevel.includes('ACTIONABLE');
            const isMod = axis.riskLevel.includes('MODERATE');
            const gcpAccent = isHigh ? '#ea4335' : isMod ? '#f29900' : '#1e8e3e';
            const gcpBadgeBg = isHigh ? '#fce8e6' : isMod ? '#fef7e0' : '#e6f4ea';
            const gcpBadgeColor = isHigh ? '#c5221f' : isMod ? '#b06000' : '#137333';
            const gcpBadgeBorder = isHigh ? '#fad2cf' : isMod ? '#fde293' : '#ceead6';

            return (
              <div
                key={axis.id}
                style={{
                  backgroundColor: '#ffffff',
                  padding: '16px',
                  borderRadius: '6px',
                  border: '1px solid #dadce0',
                  borderLeft: `4px solid ${gcpAccent}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 2px rgba(60,64,67,0.04)',
                  transition: 'all 0.15s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#202124' }}>
                      Axis {axis.number} · {axis.titleEn}
                    </span>
                    <span
                      style={{
                        fontSize: '0.66rem',
                        fontWeight: 700,
                        color: gcpBadgeColor,
                        backgroundColor: gcpBadgeBg,
                        border: `1px solid ${gcpBadgeBorder}`,
                        padding: '2px 7px',
                        borderRadius: '4px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {axis.riskLevel} ({axis.score}/100)
                    </span>
                  </div>
                  <div style={{ fontSize: '0.70rem', color: '#5f6368', fontFamily: 'monospace', marginBottom: '8px' }}>
                    Genes: {axis.keyGenes}
                  </div>
                  <p style={{ margin: '0 0 10px 0', fontSize: '0.78rem', color: '#3c4043', lineHeight: 1.5 }}>
                    {axis.clinicalFindingEn}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid #f1f3f4', paddingTop: '10px', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {axis.proteinTargetEn && (
                    <div style={{ fontSize: '0.74rem', color: '#137333', backgroundColor: '#e6f4ea', borderLeft: '3px solid #1e8e3e', padding: '6px 10px', borderRadius: '0 4px 4px 0' }}>
                      <strong>Target:</strong> {axis.proteinTargetEn}
                    </div>
                  )}
                  {axis.emotionalEatingProtocolEn && (
                    <div style={{ fontSize: '0.74rem', color: '#7a3e00', backgroundColor: '#fef7e0', borderLeft: '3px solid #f29900', padding: '6px 10px', borderRadius: '0 4px 4px 0', lineHeight: 1.45 }}>
                      <strong>Dopamine Swaps:</strong> {axis.emotionalEatingProtocolEn}
                    </div>
                  )}
                  {axis.criticalWarningEn && (
                    <div style={{ fontSize: '0.74rem', color: '#c5221f', backgroundColor: '#fce8e6', borderLeft: '3px solid #ea4335', padding: '6px 10px', borderRadius: '0 4px 4px 0', fontWeight: 600, lineHeight: 1.45 }}>
                      ⚠️ {axis.criticalWarningEn}
                    </div>
                  )}
                  {axis.criticalToxicityAlertEn && (
                    <div style={{ fontSize: '0.74rem', color: '#c5221f', backgroundColor: '#fce8e6', borderLeft: '3px solid #ea4335', padding: '6px 10px', borderRadius: '0 4px 4px 0', fontWeight: 600, lineHeight: 1.45 }}>
                      🚫 {axis.criticalToxicityAlertEn}
                    </div>
                  )}
                  {axis.caffeineCutoffEn && (
                    <div style={{ fontSize: '0.74rem', color: '#7a3e00', backgroundColor: '#fef7e0', borderLeft: '3px solid #f29900', padding: '6px 10px', borderRadius: '0 4px 4px 0', lineHeight: 1.45 }}>
                      ☕ {axis.caffeineCutoffEn}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* The 3-Step Genetic Plate Sequencing Protocol */}
      {clinicalProfile.plateSequencing && (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #dadce0',
            padding: '20px',
            boxShadow: '0 1px 2px rgba(60, 64, 67, 0.06)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, backgroundColor: '#e8f0fe', color: '#1a73e8', border: '1px solid #d2e3fc', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
              BIOCHEMICAL EATING ORDER
            </span>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#137333' }}>
              ✓ Blunts glucose spikes by up to 45%
            </span>
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#202124', margin: '2px 0 6px 0' }}>
            {clinicalProfile.plateSequencing.titleEn}
          </h3>
          <p style={{ margin: '0 0 14px 0', fontSize: '0.80rem', color: '#5f6368', lineHeight: 1.5 }}>
            {clinicalProfile.plateSequencing.impactEn}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            {clinicalProfile.plateSequencing.steps?.map((st) => (
              <div key={st.step} style={{ backgroundColor: '#f0fdfa', border: '1px solid #5eead4', borderRadius: '10px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#0d9488', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 850 }}>
                    {st.step}
                  </span>
                  <strong style={{ fontSize: '0.88rem', color: '#0f766e' }}>{st.titleEn}</strong>
                </div>
                <p style={{ margin: '0 0 8px 0', fontSize: '0.80rem', color: '#134e4a', lineHeight: 1.5 }}>
                  <strong>Examples:</strong> {st.examplesEn}
                </p>
                <div style={{ fontSize: '0.74rem', color: '#0f766e', borderTop: '1px solid #ccfbf1', paddingTop: '6px' }}>
                  <em>Biochemical rationale:</em> {st.rationaleEn}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
