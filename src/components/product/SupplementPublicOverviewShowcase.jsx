"use client";

import React from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Activity, 
  Layers, 
  CheckCircle2, 
  FlaskConical, 
  ArrowRight,
  ClipboardList
} from '@/lib/icons';

/**
 * SupplementPublicOverviewShowcase
 * ─────────────────────────────────────────────────────────────────────────────
 * Attractive nutraceutical and clinical overview showcase for oral supplements.
 */
export default function SupplementPublicOverviewShowcase({
  product = {},
  lang = 'en',
  onSelectSection = null
}) {
  const isEs = lang === 'es';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      marginTop: '1.25rem',
      marginBottom: '1.5rem',
      width: '100%'
    }}>
      {/* ── Top Clinical Highlight Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
        borderRadius: '14px',
        padding: '1.5rem',
        color: '#ffffff',
        boxShadow: '0 4px 12px rgba(6, 95, 70, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(255,255,255,0.18)',
              padding: '3px 10px',
              borderRadius: '9999px',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}>
              <Sparkles size={12} />
              <span>{isEs ? 'Fórmula Nutracéutica Avanzada' : 'Advanced Nutraceutical Matrix'}</span>
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(52, 211, 153, 0.25)',
              color: '#a7f3d0',
              padding: '3px 10px',
              borderRadius: '9999px',
              fontSize: '0.72rem',
              fontWeight: 700
            }}>
              <ShieldCheck size={12} />
              <span>EU GMP · Ph. Eur. Directiva 2002/46/CE</span>
            </span>
          </div>
          <span style={{ fontSize: '0.70rem', color: '#a7f3d0' }}>
            {isEs ? 'COMPENDIO CLÍNICO ULTRA-PERSON' : 'ULTRA-PERSON CLINICAL COMPENDIUM'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginTop: '4px' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px 14px', borderRadius: '10px' }}>
            <span style={{ fontSize: '0.70rem', textTransform: 'uppercase', color: '#a7f3d0', fontWeight: 700 }}>
              {isEs ? 'Tecnología de Liberación' : 'Delivery Technology'}
            </span>
            <h5 style={{ fontSize: '1rem', fontWeight: 800, margin: '4px 0 2px', color: '#ffffff' }}>
              {isEs ? 'Cápsula HPMC Gastrorresistente' : 'Acid-Resistant HPMC Capsule'}
            </h5>
            <p style={{ fontSize: '0.72rem', margin: 0, color: '#d1fae5', lineHeight: 1.35 }}>
              {isEs ? 'Protección contra pH estomacal <2.0; liberación duodenal para absorción intacta de bioactivos.' : 'Resists gastric acid pH <2.0; delivers intact actives directly to the duodenum.'}
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px 14px', borderRadius: '10px' }}>
            <span style={{ fontSize: '0.70rem', textTransform: 'uppercase', color: '#a7f3d0', fontWeight: 700 }}>
              {isEs ? 'Dianas Bioquímicas' : 'Target Biological Axis'}
            </span>
            <h5 style={{ fontSize: '1rem', fontWeight: 800, margin: '4px 0 2px', color: '#ffffff' }}>
              {isEs ? 'Respiración Mitocondrial & ATP' : 'Mitochondrial Respiration & ATP'}
            </h5>
            <p style={{ fontSize: '0.72rem', margin: 0, color: '#d1fae5', lineHeight: 1.35 }}>
              {isEs ? 'Activación de la vía AMPK y sirtuinas para eficiencia metabólica y vitalidad celular.' : 'Modulation of AMPK and sirtuin pathways for metabolic efficiency and stamina.'}
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px 14px', borderRadius: '10px' }}>
            <span style={{ fontSize: '0.70rem', textTransform: 'uppercase', color: '#a7f3d0', fontWeight: 700 }}>
              {isEs ? 'Estándar Clean Label' : 'Clean Label Standard'}
            </span>
            <h5 style={{ fontSize: '1rem', fontWeight: 800, margin: '4px 0 2px', color: '#ffffff' }}>
              100% Vegan & Non-GMO
            </h5>
            <p style={{ fontSize: '0.72rem', margin: 0, color: '#d1fae5', lineHeight: 1.35 }}>
              {isEs ? 'Sin dióxido de titanio, sin gluten, sin lactosa y testado para metales pesados.' : 'Titanium dioxide free, allergen-free, independently tested for heavy metals.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
