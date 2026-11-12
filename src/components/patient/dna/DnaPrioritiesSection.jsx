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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 5 Clinical Genomic Axes Cards */}
      <div
        id="dna-axes-section"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '1.75rem',
          boxShadow: '0 4px 20px rgba(0, 54, 102, 0.04)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              CHAPTER 1 · YOUR DNA IN PLAIN LANGUAGE
            </span>
            <h3 style={{ fontSize: '1.30rem', fontWeight: 850, color: '#003666', margin: '3px 0 0 0' }}>
              The 5 Key Body Priorities
            </h3>
          </div>
          <span style={{ fontSize: '0.74rem', color: '#64748b', backgroundColor: '#f8fafc', padding: '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            Specimen: <strong style={{ color: '#003666' }}>{sampleCode}</strong> · Patient: <strong style={{ color: '#003666' }}>{patientName}</strong>
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.15rem' }}>
          {clinicalProfile.fiveClinicalAxes?.map((axis) => (
            <div
              key={axis.id}
              style={{
                backgroundColor: '#f8fafc',
                padding: '16px 18px',
                borderRadius: '12px',
                border: `1.5px solid ${axis.badgeBg === '#fce8e6' ? '#fecaca' : '#e2e8f0'}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase' }}>
                    Axis {axis.number} · {axis.titleEn}
                  </span>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      color: axis.badgeColor,
                      backgroundColor: axis.badgeBg,
                      padding: '3px 8px',
                      borderRadius: '4px',
                      border: `1px solid ${axis.badgeColor}33`
                    }}
                  >
                    {axis.riskLevel} ({axis.score}/100)
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 650, marginBottom: '8px' }}>
                  Genes: {axis.keyGenes}
                </div>
                <p style={{ margin: '0 0 10px 0', fontSize: '0.80rem', color: '#334155', lineHeight: 1.55 }}>
                  {axis.clinicalFindingEn}
                </p>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {axis.proteinTargetEn && (
                  <div style={{ fontSize: '0.75rem', color: '#0f766e', fontWeight: 700 }}>
                    🎯 <strong>Target:</strong> {axis.proteinTargetEn}
                  </div>
                )}
                {axis.emotionalEatingProtocolEn && (
                  <div style={{ fontSize: '0.74rem', color: '#7c2d12', lineHeight: 1.45 }}>
                    🧠 <strong>Dopamine Swaps:</strong> {axis.emotionalEatingProtocolEn}
                  </div>
                )}
                {axis.criticalWarningEn && (
                  <div style={{ fontSize: '0.74rem', color: '#991b1b', fontWeight: 750, lineHeight: 1.45 }}>
                    ⚠️ {axis.criticalWarningEn}
                  </div>
                )}
                {axis.criticalToxicityAlertEn && (
                  <div style={{ fontSize: '0.74rem', color: '#991b1b', fontWeight: 750, lineHeight: 1.45 }}>
                    🚫 {axis.criticalToxicityAlertEn}
                  </div>
                )}
                {axis.caffeineCutoffEn && (
                  <div style={{ fontSize: '0.74rem', color: '#92400e', fontWeight: 750, lineHeight: 1.45 }}>
                    ☕ {axis.caffeineCutoffEn}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* The 3-Step Genetic Plate Sequencing Protocol */}
      {clinicalProfile.plateSequencing && (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1.5px solid #99f6e4',
            padding: '1.75rem',
            boxShadow: '0 4px 16px rgba(13, 148, 136, 0.06)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, backgroundColor: '#f0fdfa', color: '#0f766e', border: '1px solid #99f6e4', padding: '3px 9px', borderRadius: '4px', textTransform: 'uppercase' }}>
              Biochemical Eating Order
            </span>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0d9488' }}>
              ⚡ Blunts glucose spikes by up to 45%
            </span>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 850, color: '#003666', margin: '2px 0 6px 0' }}>
            {clinicalProfile.plateSequencing.titleEn}
          </h3>
          <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
            {clinicalProfile.plateSequencing.impactEn}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
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
