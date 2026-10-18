"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Dna,
  Award,
  FlaskConical,
  ShieldCheck,
  ArrowRight,
  Filter,
  CheckCircle2,
  Package,
  Layers,
  Calculator,
  Calendar,
  Clock,
  ArrowLeft
} from '@/lib/icons';
import { triggerHaptic } from '../../utils/haptics';

export const COLWAY_PROTOCOLS = [
  {
    id: 'epigenetic-ritual',
    slug: 'colway-dermo-renewal',
    title: 'Blue Diamond Epigenetic Ritual',
    badge: 'Epigenetic Cellular',
    badgeColor: '#0284c7',
    badgeBg: '#f0f9ff',
    badgeBorder: '#bae6fd',
    desc: 'Blue Diamond Peeling + Cream + Colvita',
    details: 'Epigenetic mRNA renewal, stimulates intracellular communication and cellular turnover via VEP peptide matrix.',
    category: 'epigenetic',
    search: 'Blue Diamond'
  },
  {
    id: 'hair-restoration',
    slug: 'colway-hair-restoration',
    title: 'Anti-DHT Hair Restoration',
    badge: 'Trichology & Scalp',
    badgeColor: '#0d9488',
    badgeBg: '#f0fdfa',
    badgeBorder: '#a7f3d0',
    desc: 'Strengthening Shampoo + Conditioner + Colvita',
    details: 'Inhibits follicular 5α-reductase, reactivates dormant dermal papilla microcirculation and anchors Collagen XVII.',
    category: 'trichology',
    search: 'Strengthening'
  },
  {
    id: 'native-dermal',
    slug: 'colway-native-dermal',
    title: 'Native Dermal & Barrier Recovery',
    badge: 'Native Collagen',
    badgeColor: '#16a34a',
    badgeBg: '#f0fdf4',
    badgeBorder: '#bbf7d0',
    desc: 'Collagen Wash Gel + Collagen Vege + Lip Care',
    details: 'Biologically active physiological tropocollagen restores stratum corneum integrity and deep lipid mantle barrier.',
    category: 'native-dermal',
    search: 'Vege'
  },
  {
    id: 'nutricosmetic-deep',
    slug: 'colway-nutricosmetic',
    title: 'Inside-Out Systemic ECM Matrix',
    badge: 'Oral Nutricosmetics',
    badgeColor: '#7c3aed',
    badgeBg: '#faf5ff',
    badgeBorder: '#e9d5ff',
    desc: 'Colvita Lyophilized Tropocollagen (60/120 caps)',
    details: 'Sub-zero vacuum freeze-dried tropocollagen peptides combined with micronized Baltic Fucus and natural tocopherols.',
    category: 'nutricosmetics',
    search: 'Colvita'
  }
];

/**
 * Section 1: The Colway Bio-Collagen Advantage
 */
export function ColwayAdvantageSection({ isEs = false, onBackToCatalog = null }) {
  return (
    <section
      id="colway-advantage"
      style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        padding: '2rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(13, 148, 136, 0.1)',
            color: '#0d9488',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Sparkles size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {isEs ? 'La Ventaja del Bio-Colágeno Colway®' : 'The Colway® Bio-Collagen Advantage'}
              </h3>
              <span style={{
                fontSize: '0.70rem',
                fontWeight: 700,
                color: '#0d9488',
                background: '#f0fdfa',
                border: '1px solid #a7f3d0',
                padding: '2px 8px',
                borderRadius: '9999px'
              }}>
                Gdańsk Biotechnology
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '3px 0 0 0', fontWeight: 500 }}>
              {isEs ? 'Pioneros en Tropocolágeno Nativo & Calidad Farmacéutica Europea' : 'Native Tropocollagen Pioneers & European Pharmaceutical Standards'}
            </p>
          </div>
        </div>

        {onBackToCatalog && (
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              onBackToCatalog();
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '8px',
              background: '#0d9488',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.80rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <span>{isEs ? 'Ver Catálogo de Formulaciones' : 'Browse Product Catalog'}</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>

      <p style={{ fontSize: '0.90rem', color: '#334155', lineHeight: 1.65, margin: '0 0 1.75rem 0', maxWidth: '1000px' }}>
        {isEs
          ? 'A diferencia del 95% del colágeno comercial —que es gelatina desnaturalizada por calor y ácidos—, Colway aísla en frío tropocolágeno biológicamente activo conservando su triple hélice 3D intacta, con biodisponibilidad y afinidad idéntica al pro-colágeno tisular humano.'
          : 'Unlike 95% of commercial collagen —which is gelatin denatured by heat and acids—, Colway cold-extracts biologically active tropocollagen preserving its intact 3D triple-helix conformation, delivering tissue affinity identical to native human pro-collagen.'}
      </p>

      {/* 4 Differential Value Anchors (Responsive 4 Columns) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* Card 1 */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(13, 148, 136, 0.1)', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Dna size={18} />
            </div>
            <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>
              {isEs ? 'Triple Hélice 3D Preservada' : 'Intact 3D Triple Helix'}
            </strong>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
            {isEs ? 'Estructura terciaria molecular viva reconocida como pro-colágeno nativo humano.' : 'Live molecular tertiary structure recognized as native human pro-collagen.'}
          </p>
        </div>

        {/* Card 2 */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(2, 132, 199, 0.1)', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={18} />
            </div>
            <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>
              {isEs ? 'Neocollagénesis Celular Real' : 'Real Cellular Neocollagenesis'}
            </strong>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
            {isEs ? 'Estimula directamente a los fibroblastos dérmicos para sintetizar colágeno endógeno.' : 'Directly triggers dermal fibroblasts to synthesize new endogenous collagen.'}
          </p>
        </div>

        {/* Card 3 */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FlaskConical size={18} />
            </div>
            <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>
              {isEs ? 'Liofilización en Frío' : 'Cold Sublimation Freeze-Drying'}
            </strong>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
            {isEs ? 'Sublimación al vacío bajo cero conservando péptidos activos y microalgas Fucus.' : 'Sub-zero vacuum sublimation retaining live bioactive peptides & Baltic Fucus.'}
          </p>
        </div>

        {/* Card 4 */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(22, 163, 74, 0.1)', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={18} />
            </div>
            <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>
              {isEs ? 'EU CPNP & ISO 22716' : 'EU CPNP & ISO 22716 Certified'}
            </strong>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
            {isEs ? 'Registro cosmético europeo formal, testado dermatológicamente en humanos.' : 'Official European cosmetic registration, human dermatologically tested.'}
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * Section 2: Clinical Protocols & Treatment Objectives
 */
export function ColwayProtocolsSection({
  isEs = false,
  activeProtocolId = null,
  onSelectProtocol = null,
  onResetProtocolFilter = null,
  onBackToCatalog = null
}) {
  return (
    <section
      id="colway-protocols"
      style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        padding: '2rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {isEs ? 'Protocolos Clínicos & Objetivos de Tratamiento' : 'Clinical Protocols & Treatment Objectives'}
            </h3>
            <span style={{
              fontSize: '0.70rem',
              fontWeight: 700,
              color: '#0d9488',
              background: '#f0fdfa',
              border: '1px solid #a7f3d0',
              padding: '2px 8px',
              borderRadius: '9999px'
            }}>
              4 Pathways
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0 0' }}>
            {isEs
              ? 'Pautas combinadas para patologías y objetivos estético-médicos específicos. Selecciona uno para filtrar formulaciones:'
              : 'Targeted combination regimens engineered for specific patient clinical outcomes:'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {activeProtocolId && onResetProtocolFilter && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                onResetProtocolFilter();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                fontSize: '0.76rem',
                fontWeight: 700,
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              <span>✕</span>
              <span>{isEs ? 'Limpiar Filtro' : 'Reset Filter'}</span>
            </button>
          )}

          {onBackToCatalog && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                onBackToCatalog();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '8px',
                background: '#0d9488',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.80rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <span>{isEs ? 'Ver Catálogo Completo' : 'View Full Catalog'}</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 4 Protocol Dossier Cards (2x2 Grid) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.25rem'
      }}>
        {COLWAY_PROTOCOLS.map((proto) => {
          const isSelected = activeProtocolId === proto.id;
          return (
            <div
              key={proto.id}
              style={{
                border: isSelected ? '1.5px solid #0d9488' : '1px solid #e2e8f0',
                background: isSelected ? '#f0fdfa' : '#ffffff',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
                boxShadow: isSelected ? '0 4px 14px rgba(13, 148, 136, 0.12)' : '0 1px 4px rgba(0,0,0,0.03)',
                transition: 'all 0.2s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: proto.badgeColor,
                    background: proto.badgeBg,
                    border: `1px solid ${proto.badgeBorder}`,
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    {proto.badge}
                  </span>
                  {isSelected && (
                    <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#0d9488', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <CheckCircle2 size={13} /> Active Filter
                    </span>
                  )}
                </div>

                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0', lineHeight: 1.3 }}>
                  {proto.title}
                </h4>

                <div style={{
                  fontSize: '0.76rem',
                  fontWeight: 650,
                  color: '#0d9488',
                  background: '#f8fafc',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: '1px solid #f1f5f9',
                  marginBottom: '10px'
                }}>
                  {proto.desc}
                </div>

                <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                  {proto.details}
                </p>
              </div>

              {/* Card Actions: Filter Catalog + Open Dossier */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('selection');
                    if (onSelectProtocol) onSelectProtocol(proto);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '7px 12px',
                    borderRadius: '6px',
                    border: isSelected ? '1px solid #0d9488' : '1px solid #cbd5e1',
                    background: isSelected ? '#0d9488' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#334155',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Filter size={12} />
                  <span>{isSelected ? (isEs ? 'Filtro Activo' : 'Filtering Catalog') : (isEs ? 'Filtrar en Catálogo' : 'Filter in Catalog')}</span>
                </button>

                <Link
                  href={`/proto/${proto.slug}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '7px 12px',
                    borderRadius: '6px',
                    background: 'rgba(13, 148, 136, 0.08)',
                    color: '#0d9488',
                    textDecoration: 'none',
                    fontSize: '0.74rem',
                    fontWeight: 700
                  }}
                >
                  <span>{isEs ? 'Dossier Clínico' : 'Open Protocol Dossier'}</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/**
 * Section 3: Clinical Cycle Calculator & Dosing Tool
 */
export function ColwayCalculatorSection({ isEs = false, onBackToCatalog = null }) {
  const [calcDuration, setCalcDuration] = useState('3m'); // '1m' | '3m'

  return (
    <section
      id="colway-calculator"
      style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        padding: '2rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(13, 148, 136, 0.1)',
            color: '#0d9488',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Calculator size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {isEs ? 'Calculadora de Ciclos Clínicos & Dispensación' : 'Clinical Cycle Calculator & Dosing Schedule'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '3px 0 0 0' }}>
              {isEs ? 'Estimación de unidades recomendadas según duración del tratamiento dérmico y sistémico:' : 'Estimated formulation units for dermal and systemic tissue replenishment:'}
            </p>
          </div>
        </div>

        {onBackToCatalog && (
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              onBackToCatalog();
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '8px',
              background: '#0d9488',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.80rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <span>{isEs ? 'Ver Catálogo de Formulaciones' : 'Browse Product Catalog'}</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>

      {/* Duration Selector Segmented Button */}
      <div style={{
        display: 'inline-flex',
        background: '#f1f5f9',
        borderRadius: '8px',
        padding: '4px',
        gap: '4px',
        marginBottom: '1.5rem'
      }}>
        <button
          type="button"
          onClick={() => setCalcDuration('1m')}
          style={{
            padding: '8px 20px',
            borderRadius: '6px',
            border: 'none',
            background: calcDuration === '1m' ? '#0d9488' : 'transparent',
            color: calcDuration === '1m' ? '#ffffff' : '#475569',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          {isEs ? 'Ciclo Inicial (30 Días / 1 Mes)' : 'Initial Cycle (30 Days / 1 Month)'}
        </button>
        <button
          type="button"
          onClick={() => setCalcDuration('3m')}
          style={{
            padding: '8px 20px',
            borderRadius: '6px',
            border: 'none',
            background: calcDuration === '3m' ? '#0d9488' : 'transparent',
            color: calcDuration === '3m' ? '#ffffff' : '#475569',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          {isEs ? 'Ciclo Completo Tisular (90 Días / 3 Meses - Recomendado)' : 'Complete Tissue Cycle (90 Days / 3 Months - Recommended)'}
        </button>
      </div>

      {/* Results Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1.25rem'
      }}>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', marginBottom: '4px' }}>
            {isEs ? 'Sistémico Oral (Colvita)' : 'Systemic Oral (Colvita)'}
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
            {calcDuration === '1m' ? (isEs ? '1 Frasco (60 Cápsulas)' : '1 Bottle (60 Capsules)') : (isEs ? '1 Frasco Grande (120 Cápsulas)' : '1 Large Bottle (120 Capsules)')}
          </div>
          <p style={{ fontSize: '0.76rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
            {calcDuration === '1m' ? (isEs ? '2 cápsulas / día con las comidas' : '2 capsules / day with meals') : (isEs ? '2 cápsulas / día durante 90 días' : '2 capsules / day for 90 days')}
          </p>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', marginBottom: '4px' }}>
            {isEs ? 'Tópico Dérmico (Colágeno Vege)' : 'Topical Dermal (Collagen Vege)'}
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
            {calcDuration === '1m' ? (isEs ? '1 Envase (45ml)' : '1 Bottle (45ml)') : (isEs ? '2 Envases (45ml x 2)' : '2 Bottles (45ml x 2)')}
          </div>
          <p style={{ fontSize: '0.76rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
            {isEs ? '2 pulsaciones mañana y noche sobre piel húmeda' : '2 pumps morning & night on damp skin'}
          </p>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', marginBottom: '4px' }}>
            {isEs ? 'Tricología Capilar' : 'Trichology Scalp'}
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
            {calcDuration === '1m' ? (isEs ? '1 Champú + 1 Acondicionador' : '1 Shampoo + 1 Conditioner') : (isEs ? '2 Champús + 2 Acondicionadores' : '2 Shampoos + 2 Conditioners')}
          </div>
          <p style={{ fontSize: '0.76rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
            {isEs ? '3-4 aplicaciones semanales con masaje folicular' : '3-4 applications weekly with follicular massage'}
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * Section 4: Colway Clinical Overview (Hero Ecosystem & Universal KPIs)
 */
export function ColwayOverviewSection({
  isEs = false,
  products = [],
  filteredProducts = [],
  scopeMode = 'filtered',
  setScopeMode = null,
  onGoToCatalog = null
}) {
  return (
    <section
      id="colway-overview"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        width: '100%'
      }}
    >
      {/* 1. Clinic Hero Photo Banner (Completely visible without cropping products) */}
      <div style={{
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(15, 23, 42, 0.08)',
        border: '1px solid #e2e8f0',
        background: '#f8fafc',
        position: 'relative',
        width: '100%'
      }}>
        <img
          src="/images/products/colway/colway-dermatology-clinic-hero-v2.jpg"
          alt="Colway Complete Cellular Dermocosmetics & Nutricosmetics Collection"
          style={{
            width: '100%',
            height: 'auto',
            aspectRatio: '1376 / 768',
            objectFit: 'contain',
            display: 'block'
          }}
        />
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '14px',
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(8px)',
          borderRadius: '8px',
          padding: '5px 12px',
          color: '#ffffff',
          fontSize: '0.74rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          pointerEvents: 'none'
        }}>
          <span>🏛️ Gdańsk Biotechnology · European Medical Esthetics</span>
        </div>
      </div>

      {/* 2. Universal 4 KPIs (Applicable to ALL Colway Formulations) */}
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        padding: '1.5rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1rem'
        }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {isEs ? 'Pautas y Estándares Clínicos Universales' : 'Colway® Universal Clinical & Scientific Standards'}
            </h3>
            <p style={{ fontSize: '0.80rem', color: '#64748b', margin: '2px 0 0 0' }}>
              {isEs ? 'Criterios aplicables a todas las formulaciones del catálogo:' : 'Pillars verified across all 9 dermal, trichology, and systemic formulations:'}
            </p>
          </div>

          {/* Scope Indicator & Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                setScopeMode?.('filtered');
              }}
              style={{
                background: scopeMode === 'filtered' ? '#0d9488' : '#ffffff',
                color: scopeMode === 'filtered' ? '#ffffff' : '#64748b',
                border: '1px solid',
                borderColor: scopeMode === 'filtered' ? '#0d9488' : '#cbd5e1',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {isEs ? `Filtrados (${filteredProducts.length})` : `Filtered View (${filteredProducts.length})`}
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                setScopeMode?.('global');
              }}
              style={{
                background: scopeMode === 'global' ? '#0d9488' : '#ffffff',
                color: scopeMode === 'global' ? '#ffffff' : '#64748b',
                border: '1px solid',
                borderColor: scopeMode === 'global' ? '#0d9488' : '#cbd5e1',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {isEs ? `Todos (${products.length})` : `All Database (${products.length})`}
            </button>
          </div>
        </div>

        {/* 4 Universal KPI Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '1rem'
        }}>
          {/* KPI 1: Native Tropocollagen */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '1rem 1.15rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(13, 148, 136, 0.12)', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.70rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isEs ? 'Tropocolágeno Nativo' : 'Native Tropocollagen'}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '2px 0' }}>
                Triple Hélice 3D
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', lineHeight: 1.4 }}>
                {isEs ? 'Aislamiento en frío sin desnaturalizar por calor o ácidos.' : 'Cold-isolated preserving tertiary pro-collagen structure.'}
              </div>
            </div>
          </div>

          {/* KPI 2: EU Compliance */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '1rem 1.15rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(2, 132, 199, 0.12)', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.70rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isEs ? 'Normativa Europea' : 'EU Medical Compliance'}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '2px 0' }}>
                CPNP & ISO 22716
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', lineHeight: 1.4 }}>
                {isEs ? 'Reglamento (CE) 1223/2009 y testado dermatológico en humanos.' : 'Regulation (EC) 1223/2009 & clinical safety dossiers.'}
              </div>
            </div>
          </div>

          {/* KPI 3: Cellular Neocollagenesis */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '1rem 1.15rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(124, 58, 237, 0.12)', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Award size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.70rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isEs ? 'Mecanismo Celular' : 'Cellular Mechanism'}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '2px 0' }}>
                Neocolagénesis I y III
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', lineHeight: 1.4 }}>
                {isEs ? 'Estimula a los fibroblastos dérmicos para regenerar matriz extracelular.' : 'Triggers dermal fibroblasts to regenerate natural ECM.'}
              </div>
            </div>
          </div>

          {/* KPI 4: Clean Formula Safety */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '1rem 1.15rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(22, 163, 74, 0.12)', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.70rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isEs ? 'Seguridad Clínica' : 'Clean Safety Standard'}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '2px 0' }}>
                pH Fisiológico 5.5
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', lineHeight: 1.4 }}>
                {isEs ? '0% sulfatos agresivos, parabenos ni conservantes citotóxicos.' : '0% harsh sulphates, parabens or cytotoxic additives.'}
              </div>
            </div>
          </div>
        </div>

        {/* CTA to Catalog */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              if (onGoToCatalog) onGoToCatalog();
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              background: '#0d9488',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <span>{isEs ? 'Ver Catálogo Completo (9 Formulaciones)' : 'Browse Formulations Catalog (9)'}</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}

/**
 * Unified Colway Main Sections:
 * Renders ONLY the active section selected in the sidebar!
 */
export default function ColwayMainSections({
  activeSection = 'catalog',
  isEs = false,
  activeProtocolId = null,
  onSelectProtocol = null,
  onResetProtocolFilter = null,
  onBackToCatalog = null,
  products = [],
  filteredProducts = [],
  scopeMode = 'filtered',
  setScopeMode = null
}) {
  if (activeSection === 'overview') {
    return (
      <ColwayOverviewSection
        isEs={isEs}
        products={products}
        filteredProducts={filteredProducts}
        scopeMode={scopeMode}
        setScopeMode={setScopeMode}
        onGoToCatalog={onBackToCatalog}
      />
    );
  }

  if (activeSection === 'advantage') {
    return <ColwayAdvantageSection isEs={isEs} onBackToCatalog={onBackToCatalog} />;
  }

  if (activeSection === 'protocols') {
    return (
      <ColwayProtocolsSection
        isEs={isEs}
        activeProtocolId={activeProtocolId}
        onSelectProtocol={onSelectProtocol}
        onResetProtocolFilter={onResetProtocolFilter}
        onBackToCatalog={onBackToCatalog}
      />
    );
  }

  if (activeSection === 'calculator') {
    return <ColwayCalculatorSection isEs={isEs} onBackToCatalog={onBackToCatalog} />;
  }

  return null;
}

