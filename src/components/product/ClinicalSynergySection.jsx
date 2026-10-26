"use client";

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2, ArrowUpRight, FlaskConical, Droplets } from '@/lib/icons';
import { getProductClinicalRecommendations } from '@/services/productClinicalRecommendationsEngine';

export default function ClinicalSynergySection({
  product = {},
  slug = '',
  lang = 'en'
}) {
  const isEs = lang === 'es';
  const recommendations = getProductClinicalRecommendations(product, slug, lang);

  if (!recommendations || recommendations.length === 0) return null;

  return (
    <section
      id="clinical-synergy"
      className="pds-section-card"
      style={{
        marginTop: '2rem',
        marginBottom: '2rem',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '1.75rem',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
      }}
    >
      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#eff6ff', color: '#003666', padding: '3px 10px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
            <Sparkles size={13} color="#003666" />
            <span>Atlas Recommendations</span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
            {isEs ? '7. Recomendaciones Atlas y Protocolos Sinergistas' : '7. Atlas Recommendations & Companion Protocols'}
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
            {isEs 
              ? 'Terapias complementarias, péptidos calibrados y cofactores formulados para optimizar los resultados clínicos basándose en biomarcadores.' 
              : 'Recommended companion therapies, calibrated peptides, and co-factors to optimize clinical outcomes based on biomarker targets.'}
          </p>
        </div>
      </div>

      {/* GCP Console Style Aligned Resource Rows */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}
      >
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px',
              transition: 'all 0.15s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
            }}
          >
            {/* Left: Identifier & Presentation */}
            <div style={{ minWidth: '220px', maxWidth: '300px', flex: '1 1 220px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span
                  style={{
                    fontSize: '0.66rem',
                    fontWeight: 750,
                    color: rec.synergyBadgeColor || '#0284c7',
                    background: '#ffffff',
                    border: `1px solid ${rec.synergyBadgeColor || '#bae6fd'}80`,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    letterSpacing: '0.02em',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  ⚡ {rec.synergyBadge}
                </span>
                <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 650, background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px' }}>
                  {rec.role}
                </span>
              </div>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: '0 0 2px 0', lineHeight: 1.3 }}>
                {rec.name}
              </h3>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
                <span>{rec.category}</span>
                <span style={{ margin: '0 4px' }}>•</span>
                <span style={{ color: '#003666', fontWeight: 700 }}>{rec.presentation}</span>
              </div>
            </div>

            {/* Center: Clinical Rationale */}
            <div style={{ flex: '2 1 320px', minWidth: '240px' }}>
              <p style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.55, margin: 0 }}>
                {rec.clinicalRationale}
              </p>
            </div>

            {/* Right: GCP CTA Action Button */}
            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
              <Link
                href={rec.url}
                prefetch={true}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#003666',
                  fontSize: '0.76rem',
                  fontWeight: 750,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#003666';
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.borderColor = '#003666';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.color = '#003666';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }}
              >
                <span>{isEs ? 'Ver Monografía & Posología' : 'View Monograph & Posology'}</span>
                <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
