"use client";

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck } from '@/lib/icons';
import { getProductClinicalRecommendations } from '@/services/productClinicalRecommendationsEngine';

export default function ClinicalRecommendationsSidebarWidget({
  product = {},
  slug = '',
  lang = 'en'
}) {
  const isEs = lang === 'es';
  const recommendations = getProductClinicalRecommendations(product, slug, lang);

  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div
      className="pds-clinical-recommendations-widget"
      style={{
        marginTop: '14px',
        padding: '14px 12px 12px 12px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}
    >
      {/* Widget Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={14} color="#003666" />
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0f172a', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {isEs ? 'Sinergia Clínica Recomendada' : 'Recommended Clinical Synergy'}
          </span>
        </div>
        <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#0369a1', background: '#f0f9ff', border: '1px solid #bae6fd', padding: '1px 6px', borderRadius: '9999px' }}>
          {recommendations.length} {isEs ? 'co-terapias' : 'therapies'}
        </span>
      </div>

      <p style={{ fontSize: '0.68rem', color: '#64748b', margin: '0 0 10px 0', lineHeight: 1.35 }}>
        {isEs 
          ? 'Formulaciones del catálogo validadas para maximizar la eficacia terapéutica de este tratamiento.' 
          : 'Complementary catalog therapies biochemically paired to maximize therapeutic efficacy.'}
      </p>

      {/* Recommended Items Stack */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {recommendations.slice(0, 3).map((rec) => (
          <Link
            key={rec.id}
            href={rec.url}
            style={{
              display: 'block',
              textDecoration: 'none',
              padding: '9px 10px',
              borderRadius: '8px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f0f9ff';
              e.currentTarget.style.borderColor = '#93c5fd';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.transform = 'none';
            }}
            title={rec.name}
          >
            {/* Synergy Badge - Full wrapping, no clipping */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px', marginBottom: '6px' }}>
              <span
                style={{
                  fontSize: '0.64rem',
                  fontWeight: 700,
                  color: rec.synergyBadgeColor || '#0284c7',
                  background: 'rgba(255,255,255,0.98)',
                  border: `1px solid ${rec.synergyBadgeColor || '#bae6fd'}50`,
                  padding: '2px 7px',
                  borderRadius: '5px',
                  letterSpacing: '0.02em',
                  whiteSpace: 'normal',
                  lineHeight: 1.3
                }}
              >
                ⚡ {rec.synergyBadge}
              </span>
              <ArrowRight size={12} color="#64748b" style={{ flexShrink: 0, marginTop: '3px' }} />
            </div>

            {/* Product Title */}
            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.3, marginBottom: '3px' }}>
              {rec.name}
            </div>

            {/* Presentation Format */}
            <div style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>
              {rec.presentation}
            </div>

            {/* Clinical Rationale Snippet - Complete readable text, no points/ellipsis */}
            <div style={{ fontSize: '0.68rem', color: '#334155', lineHeight: 1.45, whiteSpace: 'normal' }}>
              {rec.clinicalRationale}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
