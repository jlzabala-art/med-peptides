"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Pill, Check, ChevronRight, Sparkles } from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';

export const ULTRAPERSON_FORMULARY_ITEMS = [
  {
    slug: 'ultraperson-energy-metabolic-vitality',
    name: 'UltraPerson Energy & Metabolic Vitality',
    shortName: {
      es: 'Energy & Metabolic Vitality',
      en: 'Energy & Metabolic Vitality'
    },
    axisBadge: {
      es: 'Biogénesis Mitocondrial & ATP',
      en: 'Mitochondrial Biogenesis & ATP'
    },
    activeCofactors: {
      es: 'CoQ10 · PQQ · Panax Ginseng · ALA · Piperina',
      en: 'CoQ10 · PQQ · Panax Ginseng · ALA · Piperine'
    },
    accentColor: '#0284c7',
    accentBg: '#f0f9ff'
  },
  {
    slug: 'ultraperson-longevity-cellular-renewal',
    name: 'UltraPerson Longevity & Cellular Renewal',
    shortName: {
      es: 'Longevity & Cellular Renewal',
      en: 'Longevity & Cellular Renewal'
    },
    axisBadge: {
      es: 'Vía Sirtuinas & Senolítico',
      en: 'Sirtuin Activation & Senolytics'
    },
    activeCofactors: {
      es: 'Trans-Resveratrol · Fisetina · Curcumina Meriva® · OPCs',
      en: 'Trans-Resveratrol · Fisetin · Curcumin Meriva® · OPCs'
    },
    accentColor: '#7c3aed',
    accentBg: '#faf5ff'
  },
  {
    slug: 'ultraperson-stress-resilience-emotional-balance',
    name: 'UltraPerson Stress Resilience & Emotional Balance',
    shortName: {
      es: 'Stress Resilience & Balance',
      en: 'Stress Resilience & Balance'
    },
    axisBadge: {
      es: 'Eje HPA & Homeostasis Cortisol',
      en: 'HPA Axis & Cortisol Adaptation'
    },
    activeCofactors: {
      es: 'KSM-66® Ashwagandha · Suntheanine® L-Teanina',
      en: 'KSM-66® Ashwagandha · Suntheanine® L-Theanine'
    },
    accentColor: '#d97706',
    accentBg: '#fffbeb'
  },
  {
    slug: 'ultraperson-sleep-quality-restoration',
    name: 'UltraPerson Sleep Quality & Restoration (Melatonin-Free)',
    shortName: {
      es: 'Sleep Quality & Restoration',
      en: 'Sleep Quality & Restoration'
    },
    axisBadge: {
      es: 'Circadiano No Hormonal & GABA',
      en: 'Non-Hormonal Circadian & GABA'
    },
    activeCofactors: {
      es: 'L-Teanina · Melisa · Magnolia · Apigenina · Affron®',
      en: 'L-Theanine · Lemon Balm · Magnolia · Apigenin · Affron®'
    },
    accentColor: '#4f46e5',
    accentBg: '#eef2ff'
  },
  {
    slug: 'ultraperson-immune-strength-defense',
    name: 'UltraPerson Immune Strength & Defense',
    shortName: {
      es: 'Immune Strength & Defense',
      en: 'Immune Strength & Defense'
    },
    axisBadge: {
      es: 'Inmunomodulación Celular & Innata',
      en: 'Innate & Adaptive Immunomodulation'
    },
    activeCofactors: {
      es: 'Quercetina Fitosoma · Vit C Buffer · Zinc · D3 · Saúco',
      en: 'Quercetin Phytosome · Buffered Vit C · Zinc · D3 · Elderberry'
    },
    accentColor: '#059669',
    accentBg: '#ecfdf5'
  }
];

/**
 * UltraPersonFormularyNetworkWidget
 * ─────────────────────────────────────────────────────────────────────────────
 * Clinical formulary interconnectivity widget displayed exclusively on
 * UltraPerson oral precision supplement datasheets.
 *
 * Avoids aggressive marketing/ecommerce tropes (no buy buttons, no discounts, no star ratings).
 * Instead, acts as a pharmacopeia directory grouping the 5 formulations by biological target axis.
 */
export default function UltraPersonFormularyNetworkWidget({
  currentSlug = '',
  currentProduct = {},
  lang = 'en'
}) {
  const isEs = lang === 'es';

  // Normalize current slug to match active formula
  const activeSlugNormalized = useMemo(() => {
    const raw = (
      currentSlug ||
      currentProduct?.slug ||
      currentProduct?.id ||
      currentProduct?.canonicalKey ||
      ''
    ).toLowerCase().trim();

    if (raw.includes('energy') || raw.includes('vitality')) return 'ultraperson-energy-metabolic-vitality';
    if (raw.includes('longevity') || raw.includes('renewal')) return 'ultraperson-longevity-cellular-renewal';
    if (raw.includes('stress') || raw.includes('resilience') || raw.includes('emotional')) return 'ultraperson-stress-resilience-emotional-balance';
    if (raw.includes('sleep') || raw.includes('restoration')) return 'ultraperson-sleep-quality-restoration';
    if (raw.includes('immune') || raw.includes('defense')) return 'ultraperson-immune-strength-defense';

    return raw;
  }, [currentSlug, currentProduct]);

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '10px',
      border: '1px solid #e2e8f0',
      padding: '0.85rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.70rem'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid #f1f5f9',
        flexWrap: 'wrap',
        gap: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Pill size={14} color="#003666" />
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {isEs ? 'FORMULARIO CLÍNICO ULTRAPERSON™' : 'ULTRAPERSON™ CLINICAL FORMULARY'}
          </span>
        </div>
        <span style={{
          fontSize: '0.64rem',
          fontWeight: 700,
          color: '#0369a1',
          background: '#e0f2fe',
          border: '1px solid #bae6fd',
          padding: '1px 6px',
          borderRadius: '4px'
        }}>
          PHARMAPOLIS · 5 {isEs ? 'EJES' : 'AXES'}
        </span>
      </div>

      {/* Subtitle */}
      <p style={{
        margin: 0,
        fontSize: '0.70rem',
        color: '#64748b',
        lineHeight: 1.45
      }}>
        {isEs
          ? 'Formulaciones orales en cápsulas gastrorresistentes HPMC clasificadas por diana biológica:'
          : 'Oral formulations in delayed-release HPMC capsules categorized by clinical biological axis:'}
      </p>

      {/* 5 Formulations Interconnectivity List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {ULTRAPERSON_FORMULARY_ITEMS.map((item) => {
          const isCurrent = item.slug === activeSlugNormalized;
          const shortTitle = item.shortName[isEs ? 'es' : 'en'];
          const axisText = item.axisBadge[isEs ? 'es' : 'en'];
          const cofactorsText = item.activeCofactors[isEs ? 'es' : 'en'];

          if (isCurrent) {
            return (
              <div
                key={item.slug}
                style={{
                  background: '#f8fafc',
                  border: '1.5px solid #003666',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  boxShadow: '0 1px 2px rgba(0,54,102,0.06)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#003666' }}>
                    {shortTitle}
                  </span>
                  <span style={{
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    background: '#003666',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}>
                    <Check size={10} />
                    <span>{isEs ? 'Ficha Actual' : 'Active Form'}</span>
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.64rem',
                    fontWeight: 700,
                    color: item.accentColor,
                    background: item.accentBg,
                    padding: '1px 5px',
                    borderRadius: '3px'
                  }}>
                    {axisText}
                  </span>
                </div>

                <div style={{ fontSize: '0.66rem', color: '#64748b', lineHeight: 1.35 }}>
                  {cofactorsText}
                </div>
              </div>
            );
          }

          return (
            <Link
              key={item.slug}
              href={`/p/${item.slug}`}
              onClick={() => triggerHaptic('selection')}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '8px 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#94a3b8';
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#1e293b' }}>
                  {shortTitle}
                </span>
                <ChevronRight size={13} color="#94a3b8" />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '0.64rem',
                  fontWeight: 650,
                  color: item.accentColor,
                  background: item.accentBg,
                  padding: '1px 5px',
                  borderRadius: '3px'
                }}>
                  {axisText}
                </span>
              </div>

              <div style={{ fontSize: '0.65rem', color: '#64748b', lineHeight: 1.35 }}>
                {cofactorsText}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
