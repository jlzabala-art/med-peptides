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
            <span>{isEs ? 'Sinergia Clínica del Catálogo' : 'Catalog Clinical Synergy'}</span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
            {isEs ? 'Co-Terapias & Recomendaciones Clínicas' : 'Co-Therapies & Clinical Recommendations'}
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
            {isEs
              ? 'Formulaciones y analíticas del ecosistema Atlas emparejadas por mecanismo biológico para optimizar la biodisponibilidad y respuesta clínica.'
              : 'Ecosystem formulations and diagnostics biochemically paired to maximize tissue bioavailability and clinical response.'}
          </p>
        </div>
      </div>

      {/* Grid of Synergistic Recommendations */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem'
        }}
      >
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
            }}
          >
            <div>
              {/* Synergy Mechanism Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '10px' }}>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: rec.synergyBadgeColor || '#0284c7',
                    background: '#ffffff',
                    border: `1px solid ${rec.synergyBadgeColor || '#bae6fd'}60`,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    letterSpacing: '0.02em'
                  }}
                >
                  ⚡ {rec.synergyBadge}
                </span>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>
                  {rec.role}
                </span>
              </div>

              {/* Product Title */}
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', lineHeight: 1.3 }}>
                {rec.name}
              </h3>

              {/* Category & Presentation */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#64748b', fontWeight: 500, marginBottom: '10px' }}>
                <span>{rec.category}</span>
                <span>•</span>
                <span style={{ color: '#0284c7', fontWeight: 600 }}>{rec.presentation}</span>
              </div>

              {/* Clinical Rationale */}
              <p style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.55, margin: '0 0 14px 0' }}>
                {rec.clinicalRationale}
              </p>
            </div>

            {/* Card CTA Link */}
            <Link
              href={rec.url}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#003666',
                fontSize: '0.78rem',
                fontWeight: 700,
                textDecoration: 'none',
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
        ))}
      </div>
    </section>
  );
}
