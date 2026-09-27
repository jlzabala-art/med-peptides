"use client";

import React from 'react';
import Link from 'next/link';
import { Droplets, Sparkles, ChevronRight, ShieldCheck, Beaker } from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';

/**
 * ProtocolTopicalAdjunctsSidebarWidget
 * ─────────────────────────────────────────────────────────────────────────────
 * Executive GCP-standard sidebar widget for displaying topical cosmeceutical
 * protocol adjuncts (e.g. Colway Hair System Step 1 & Step 2).
 */
export default function ProtocolTopicalAdjunctsSidebarWidget({
  adjuncts = [],
  lang = 'en'
}) {
  const isEs = lang === 'es';

  const defaultAdjuncts = [
    {
      slug: 'colway-strengthening-shampoo',
      name: isEs ? 'Champú Fortalecedor Colway' : 'Strengthening Hair Shampoo',
      stepBadge: isEs ? 'PASO 1 · PREPARAR' : 'STEP 1 · PREPARE',
      desc: isEs ? 'Elimina sebo con DHT · pH 4.5–5.5' : 'DHT sebum clearance · pH 4.5–5.5',
      iconType: 'shampoo',
      accentColor: '#2563eb',
      bgLight: '#eff6ff',
      borderColor: '#bfdbfe'
    },
    {
      slug: 'colway-strengthening-conditioner',
      name: isEs ? 'Acondicionador Fortalecedor' : 'Strengthening Conditioner',
      stepBadge: isEs ? 'PASO 2 · FORTALECER' : 'STEP 2 · FORTIFY',
      desc: isEs ? 'Colágeno nativo · Blindaje de cutícula' : 'Native collagen · Cuticle seal',
      iconType: 'conditioner',
      accentColor: '#0d9488',
      bgLight: '#f0fdfa',
      borderColor: '#99f6e4'
    }
  ];

  const items = Array.isArray(adjuncts) && adjuncts.length > 0
    ? adjuncts.map((a, idx) => ({
        slug: a.product_slug || a.slug || (idx === 0 ? 'colway-strengthening-shampoo' : 'colway-strengthening-conditioner'),
        name: (a.product_name || a.name || '').replace(/^Colway\s+/i, '') || (idx === 0 ? 'Strengthening Hair Shampoo' : 'Strengthening Conditioner'),
        stepBadge: idx === 0 ? (isEs ? 'PASO 1 · PREPARAR' : 'STEP 1 · PREPARE') : (isEs ? 'PASO 2 · FORTALECER' : 'STEP 2 · FORTIFY'),
        desc: a.key_mechanisms?.[0] || a.tagline || (idx === 0 ? 'DHT clearance · pH 4.5–5.5' : 'Native collagen · Cuticle seal'),
        iconType: idx === 0 ? 'shampoo' : 'conditioner',
        accentColor: idx === 0 ? '#2563eb' : '#0d9488',
        bgLight: idx === 0 ? '#eff6ff' : '#f0fdfa',
        borderColor: idx === 0 ? '#bfdbfe' : '#99f6e4'
      }))
    : defaultAdjuncts;

  return (
    <div style={{
      marginTop: '1rem',
      background: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
    }}>
      {/* Executive Clean Header */}
      <div style={{
        padding: '0.85rem 1rem',
        background: 'linear-gradient(135deg, #f0fdfa 0%, #ffffff 100%)',
        borderBottom: '1px solid #ccfbf1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '26px',
            height: '26px',
            borderRadius: '6px',
            backgroundColor: '#0d9488',
            color: '#ffffff'
          }}>
            <Droplets size={14} />
          </span>
          <div>
            <div style={{
              fontSize: '0.74rem',
              fontWeight: 800,
              color: '#003666',
              letterSpacing: '0.02em',
              lineHeight: 1.2
            }}>
              {isEs ? 'SISTEMA CAPILAR COLWAY' : 'COLWAY HAIR SYSTEM'}
            </div>
            <div style={{ fontSize: '0.64rem', color: '#64748b', marginTop: '1px' }}>
              {isEs ? 'Coadyuvantes tópicos recomendados' : 'Topical cosmeceutical adjuncts'}
            </div>
          </div>
        </div>

        <span style={{
          fontSize: '0.62rem',
          fontWeight: 800,
          color: '#0f766e',
          background: '#ccfbf1',
          padding: '2px 8px',
          borderRadius: '999px',
          border: '1px solid #99f6e4',
          letterSpacing: '0.04em',
          flexShrink: 0
        }}>
          94% SYNERGY
        </span>
      </div>

      {/* Modern Structured Step Cards */}
      <div style={{
        padding: '0.65rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        {items.map((it) => (
          <Link
            key={it.slug}
            href={`/p/${it.slug}`}
            onClick={() => triggerHaptic('selection')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '0.65rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid #f1f5f9',
              backgroundColor: '#f8fafc',
              textDecoration: 'none',
              transition: 'all 0.18s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.borderColor = it.accentColor;
              e.currentTarget.style.boxShadow = `0 3px 10px ${it.accentColor}18`;
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#f8fafc';
              e.currentTarget.style.borderColor = '#f1f5f9';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'none';
            }}
          >
            {/* Elegant SVG Badge Icon */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: it.bgLight,
              border: `1px solid ${it.borderColor}`,
              color: it.accentColor,
              flexShrink: 0
            }}>
              {it.iconType === 'shampoo' ? <Sparkles size={16} /> : <ShieldCheck size={16} />}
            </div>

            {/* Step Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <span style={{
                  fontSize: '0.58rem',
                  fontWeight: 800,
                  color: it.accentColor,
                  background: it.bgLight,
                  padding: '1px 5px',
                  borderRadius: '4px',
                  border: `1px solid ${it.borderColor}`,
                  letterSpacing: '0.04em'
                }}>
                  {it.stepBadge}
                </span>
              </div>
              <div style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#0f172a',
                lineHeight: 1.25,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {it.name}
              </div>
              <div style={{
                fontSize: '0.65rem',
                color: '#64748b',
                marginTop: '1px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {it.desc}
              </div>
            </div>

            <ChevronRight size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
          </Link>
        ))}
      </div>

      {/* Clinical Guidance Footer */}
      <div style={{
        padding: '0.55rem 0.85rem',
        background: '#f8fafc',
        borderTop: '1px solid #edf2f7',
        fontSize: '0.67rem',
        color: '#64748b',
        lineHeight: 1.45,
        display: 'flex',
        alignItems: 'flex-start',
        gap: '6px'
      }}>
        <span style={{ color: '#0d9488', fontSize: '0.8rem', lineHeight: 1 }}>💡</span>
        <span>
          {isEs 
            ? 'Aplicar 3–4×/sem para eliminar sebo con DHT y blindar la cutícula anágena durante el protocolo.'
            : 'Apply 3–4×/wk to clear DHT sebum barrier and protect fragile anagen regrowth.'}
        </span>
      </div>
    </div>
  );
}
