'use client';

import React from 'react';
import { AlertCircle, ExternalLink, Pill } from 'lucide-react';
import {
  COMMERCIAL_LOCAL_SUPPLEMENTS,
  PRESCRIPTION_COMPARISON
} from '@/data/genomics/clinicalNutrigenomicEngine';

/**
 * Chapter 5 · Option A: Local Retail Pharmacy Supplements (OTC)
 * Direct OTC guidance for Doha retail pharmacies (Boots, Wellcare, Kulud, Aster).
 */
export default function DnaLocalPharmacyOptionA({ onSwitchToOptionB }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.5rem 1.75rem', boxShadow: '0 4px 20px rgba(0, 54, 102, 0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '8px' }}>
          <div>
            <span style={{ fontSize: '0.70rem', fontWeight: 800, backgroundColor: '#f0fdfa', color: '#0f766e', border: '1px solid #99f6e4', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
              OPTION A · LOCAL COMMERCIAL OTC SUPPLEMENTS
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 850, color: '#003666', margin: '6px 0 2px 0' }}>
              Personalized Multivitamin &amp; Retail Supplement Recommendation
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={onSwitchToOptionB}
              style={{
                padding: '7px 14px',
                fontSize: '0.76rem',
                fontWeight: 750,
                color: '#ffffff',
                backgroundColor: '#003666',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Switch to Option B (3-Cap Compounded) →
            </button>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
          Based on your genetic profile, these commercially available supplements can be purchased directly in retail pharmacies in Doha (Boots, Wellcare, Kulud, Aster). Make sure to purchase the exact active chemical forms specified below to bypass your metabolic bottlenecks.
        </p>
      </div>

      {/* Safety Warning */}
      <div style={{ backgroundColor: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '12px', padding: '1.15rem 1.25rem' }}>
        <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#b91c1c', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertCircle size={15} />
          <span>CRITICAL CLINICAL DIRECTIVE: MUTUALLY EXCLUSIVE PATHWAYS (CHOOSE ONE ONLY)</span>
        </div>
        <p style={{ margin: 0, fontSize: '0.80rem', color: '#7f1d1d', lineHeight: 1.5 }}>
          <strong>Do NOT combine Option A and Option B concurrently.</strong> They are alternative clinical tracks designed to resolve the same genetic targets. If taking the local commercial OTC supplements below, do not take compounded formulations to prevent micronutrient excess.
        </p>
      </div>

      {/* Dual Strategy Comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1.5px solid #0d9488', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.70rem', fontWeight: 800, backgroundColor: '#f0fdfa', color: '#0f766e', border: '1px solid #99f6e4', padding: '2px 6px', borderRadius: '4px' }}>
              CURRENT VIEW
            </span>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
              {PRESCRIPTION_COMPARISON.pathwayA.title}
            </h4>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 10px 0' }}>
            {PRESCRIPTION_COMPARISON.pathwayA.subtitle}
          </p>
          <div style={{ fontSize: '0.76rem', color: '#16a34a', fontWeight: 700, marginBottom: '6px' }}>Advantages:</div>
          <ul style={{ margin: '0 0 10px 0', paddingLeft: '18px', fontSize: '0.76rem', color: '#334155', lineHeight: 1.5 }}>
            {PRESCRIPTION_COMPARISON.pathwayA.pros.map((pro, i) => (
              <li key={i}>{pro}</li>
            ))}
          </ul>
          <div style={{ fontSize: '0.76rem', color: '#dc2626', fontWeight: 700, marginBottom: '6px' }}>Considerations:</div>
          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.76rem', color: '#64748b', lineHeight: 1.5 }}>
            {PRESCRIPTION_COMPARISON.pathwayA.cons.map((con, i) => (
              <li key={i}>{con}</li>
            ))}
          </ul>
        </div>

        <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #cbd5e1', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.70rem', fontWeight: 800, backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 6px', borderRadius: '4px' }}>
              OPTION B ALTERNATIVE
            </span>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#003666' }}>
              {PRESCRIPTION_COMPARISON.pathwayB.title}
            </h4>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 10px 0' }}>
            {PRESCRIPTION_COMPARISON.pathwayB.subtitle}
          </p>
          <div style={{ fontSize: '0.76rem', color: '#16a34a', fontWeight: 700, marginBottom: '6px' }}>Clinical Benefits:</div>
          <ul style={{ margin: '0 0 10px 0', paddingLeft: '18px', fontSize: '0.76rem', color: '#334155', lineHeight: 1.5 }}>
            {PRESCRIPTION_COMPARISON.pathwayB.pros.map((pro, i) => (
              <li key={i}>{pro}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Commercial Supplement Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1rem' }}>
        {COMMERCIAL_LOCAL_SUPPLEMENTS.map((supp, sIdx) => (
          <div key={sIdx} style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase' }}>
                  {supp.category}
                </span>
                <span style={{ fontSize: '0.66rem', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '3px' }}>
                  {supp.timing}
                </span>
              </div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 850, color: '#0f172a' }}>
                {supp.productName}
              </h4>
              <div style={{ fontSize: '0.74rem', color: '#64748b', marginBottom: '8px' }}>
                Brand Example: <strong>{supp.recommendedBrand}</strong>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#334155', lineHeight: 1.5 }}>
                {supp.description}
              </p>
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '8px', marginTop: '10px', fontSize: '0.74rem', display: 'flex', justifyContent: 'space-between', color: '#003666', fontWeight: 700 }}>
              <span>Dose: {supp.dose}</span>
              <span style={{ color: '#0d9488' }}>{supp.availInQatar ? '✓ Available in Qatar' : 'Special Order'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
