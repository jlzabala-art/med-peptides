"use client";

import React from 'react';
import Link from 'next/link';
import { Droplets, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';

export default function ProtocolTopicalAdjunctsSidebarWidget({
  adjuncts = [],
  lang = 'en'
}) {
  const isEs = lang === 'es';

  const defaultAdjuncts = [
    {
      slug: 'colway-strengthening-shampoo',
      name: 'Strengthening Shampoo',
      step: isEs ? 'Paso 1' : 'Step 1',
      desc: isEs ? 'Limpieza de sebo DHT · pH 4.5' : 'DHT sebum clearance · pH 4.5',
      icon: '🧴',
      color: '#2563eb'
    },
    {
      slug: 'colway-strengthening-conditioner',
      name: 'Strengthening Conditioner',
      step: isEs ? 'Paso 2' : 'Step 2',
      desc: isEs ? 'Colágeno nativo · Blindaje cutícula' : 'Native collagen · Cuticle seal',
      icon: '💧',
      color: '#0d9488'
    }
  ];

  const items = Array.isArray(adjuncts) && adjuncts.length > 0
    ? adjuncts.map((a, idx) => ({
        slug: a.product_slug || a.slug || (idx === 0 ? 'colway-strengthening-shampoo' : 'colway-strengthening-conditioner'),
        name: (a.product_name || a.name || '').replace(/^Colway\s+/i, '') || (idx === 0 ? 'Strengthening Shampoo' : 'Strengthening Conditioner'),
        step: a.step?.split('—')?.[0]?.trim() || (idx === 0 ? (isEs ? 'Paso 1' : 'Step 1') : (isEs ? 'Paso 2' : 'Step 2')),
        desc: a.key_mechanisms?.[0] || a.tagline || (idx === 0 ? 'DHT clearance · pH 4.5' : 'Native collagen · Cuticle seal'),
        icon: idx === 0 ? '🧴' : '💧',
        color: idx === 0 ? '#2563eb' : '#0d9488'
      }))
    : defaultAdjuncts;

  return (
    <div style={{
      marginTop: '1rem',
      background: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
    }}>
      <div style={{
        padding: '0.75rem 1rem',
        background: 'linear-gradient(90deg, #0f172a, #1a2e4a)',
        borderBottom: '2px solid #0d9488',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <div style={{
            fontSize: '0.68rem',
            fontWeight: 800,
            color: '#e2e8f0',
            letterSpacing: '0.06em',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <Droplets size={12} style={{ color: '#0d9488' }} />
            {isEs ? 'SISTEMA CAPILAR COLWAY' : 'COLWAY HAIR SYSTEM'}
          </div>
          <div style={{ fontSize: '0.62rem', color: '#94a3b8', marginTop: '2px' }}>
            {isEs ? 'Coadyuvantes tópicos recomendados' : 'Topical cosmeceutical adjuncts'}
          </div>
        </div>
        <span style={{
          fontSize: '0.6rem',
          fontWeight: 800,
          color: '#0d9488',
          background: '#0d948820',
          padding: '2px 6px',
          borderRadius: '99px',
          border: '1px solid #0d948840'
        }}>
          94% SYNERGY
        </span>
      </div>

      <div style={{ padding: '0.35rem 0' }}>
        {items.map((it) => (
          <Link
            key={it.slug}
            href={`/p/${it.slug}`}
            onClick={() => triggerHaptic('selection')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '0.65rem 1rem',
              textDecoration: 'none',
              borderBottom: '1px solid #f8fafc',
              transition: 'background 0.15s ease'
            }}
          >
            <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{it.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{
                  fontSize: '0.6rem',
                  fontWeight: 800,
                  color: it.color,
                  background: `${it.color}15`,
                  padding: '1px 6px',
                  borderRadius: '99px'
                }}>
                  {it.step}
                </span>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a' }}>
                  {it.name}
                </span>
              </div>
              <div style={{
                fontSize: '0.66rem',
                color: '#64748b',
                marginTop: '2px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {it.desc}
              </div>
            </div>
            <ChevronRight size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
          </Link>
        ))}
      </div>

      <div style={{
        padding: '0.55rem 0.9rem',
        background: '#f8fafc',
        borderTop: '1px solid #f1f5f9',
        fontSize: '0.66rem',
        color: '#64748b',
        lineHeight: 1.45
      }}>
        💡 {isEs 
          ? 'Aplicar 3–4×/sem para eliminar sebo con DHT y reforzar la cutícula durante el protocolo.'
          : 'Apply 3–4×/wk to clear DHT sebum barrier and protect fragile anagen regrowth.'}
      </div>
    </div>
  );
}
