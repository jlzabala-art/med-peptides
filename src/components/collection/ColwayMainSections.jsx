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

      {/* 4 Differential Value Lines (Horizontal Linear Rows with Rich Scientific & Catalogue Specifications) */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {/* Line 1: Intact 3D Triple Helix */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(13, 148, 136, 0.1)', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Dna size={20} />
              </div>
              <strong style={{ fontSize: '0.94rem', color: '#0f172a', fontWeight: 800 }}>
                {isEs ? 'Triple Hélice 3D Intacta (Biotecnología de Extracción en Frío en Gdańsk)' : 'Native 3D Triple-Helix Tropocollagen (Gdańsk Cold-Extraction Biotechnology)'}
              </strong>
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0d9488', background: '#f0fdfa', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '4px' }}>
              {isEs ? 'Arquitectura Proteica Cuaternaria' : 'Quaternary Protein Architecture'}
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
            {isEs
              ? 'A diferencia del 95% del colágeno cosmético y dietético comercial que utiliza hidrólisis ácida, alcalina o térmica (obteniendo gelatina desnaturalizada sin capacidad de señalización biológica), Colway aísla tropocolágeno vivo a partir de la hidratación de pieles de carpa plateada de agua dulce (Hypophthalmichthys molitrix). El proceso mantiene intactos los telopéptidos y los puentes de hidrógeno terciarios con una afinidad idéntica al pro-colágeno tisular humano, conservando su capacidad de señalización a temperatura fisiológica de la piel.'
              : 'Unlike 95% of commercial cosmetic and dietary collagens that use acid, alkali, or high-temperature hydrolysis (yielding denatured gelatin fragments incapable of conformational signaling), Colway isolates live, native tropocollagen directly from freshwater silver carp (Hypophthalmichthys molitrix) skin hydration. The process preserves intact telopeptides and tertiary helical hydrogen bonds with 100% biological affinity to human pro-collagen, maintaining structural signaling fidelity at physiological skin temperature.'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingTop: '4px' }}>
            {['Gdańsk Cold-Extraction', 'Zero Acid/Thermal Hydrolysis', 'Intact Native Telopeptides', 'Freshwater Fish Bio-Hydration', '100% Human Pro-Collagen Tissue Affinity'].map((chip, i) => (
              <span key={i} style={{ fontSize: '0.68rem', fontWeight: 650, color: '#334155', background: '#ffffff', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '4px' }}>
                ✓ {chip}
              </span>
            ))}
          </div>
        </div>

        {/* Line 2: Real Cellular Neocollagenesis & 110-Day Cycle */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(2, 132, 199, 0.1)', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Award size={20} />
              </div>
              <strong style={{ fontSize: '0.94rem', color: '#0f172a', fontWeight: 800 }}>
                {isEs ? 'Neocollagénesis Celular Real & Ciclo Fisiológico de 110 Días' : 'Documented Cellular Neocollagenesis & 110-Day Physiological Turnover Cycle'}
              </strong>
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0284c7', background: '#f0f9ff', border: '1px solid #bae6fd', padding: '2px 8px', borderRadius: '4px' }}>
              {isEs ? 'Estudio Clínico ITA-TEST Varsovia' : 'ITA-TEST Warsaw Lab Validated'}
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
            {isEs
              ? 'Aplicado tópicamente, el tropocolágeno nativo no actúa como un mero oclusivo superficial: oligopéptidos señalizadores de bajo peso molecular atraviesan la unión dermoepidérmica para estimular directamente a los fibroblastos dérmicos humanos, reactivando la biosíntesis endógena de Colágeno Tipo I, III y VII. En ensayos especializados del Laboratorio ITA-TEST de Varsovia (Ensayo B-89146-89147/12214/24/S, edad media 51 años), se constató un 90% de aumento en firmeza, 85% en densidad cutánea y 85% en retención hídrica profunda tras el ciclo de recambio celular de 110 días.'
              : 'Topically applied native tropocollagen does not act merely as a surface occlusive: low-molecular signal oligopeptides cross the epidermal barrier to directly stimulate human dermal fibroblasts (FGF receptor pathway), upregulating de novo biosynthesis of Collagen Types I, III, and VII. In specialized laboratory trials conducted at ITA-TEST Warsaw (Test B-89146-89147/12214/24/S, proband average age 51), systematic application for the 110-day physiological collagen replacement cycle yielded 90% confirmed skin firming, 85% density increase, and 85% deep moisture retention with reversal of sagging.'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingTop: '4px' }}>
            {['ITA-TEST Warsaw Study #B-89146', '90% Confirmed Skin Firming', '85% Skin Density Improvement', '110-Day Physiological Cellular Replacement', 'Upregulation of Collagen I, III & VII'].map((chip, i) => (
              <span key={i} style={{ fontSize: '0.68rem', fontWeight: 650, color: '#334155', background: '#ffffff', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '4px' }}>
                ✓ {chip}
              </span>
            ))}
          </div>
        </div>

        {/* Line 3: Cold Sublimation Freeze-Drying */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FlaskConical size={20} />
              </div>
              <strong style={{ fontSize: '0.94rem', color: '#0f172a', fontWeight: 800 }}>
                {isEs ? 'Sublimación Criogénica en Frío (Liofilización) & Micronización Marina' : 'Cryogenic Cold Sublimation (Freeze-Drying) & Marine Micronization'}
              </strong>
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#7c3aed', background: '#faf5ff', border: '1px solid #e9d5ff', padding: '2px 8px', borderRadius: '4px' }}>
              {isEs ? 'Liofilización Bajo Cero (-40°C)' : 'Sub-Zero Vacuum Lyophilization'}
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
            {isEs
              ? 'Para la nutricosmética celular oral (Colvita), Colway utiliza sublimación al vacío a -40°C, eliminando la humedad sin degradar la conformación cuaternaria de las cadenas peptídicas. Cada cápsula aporta tropocolágeno liofilizado bioactivo combinado con microalgas Fucus vesiculosus del Mar Báltico micronizadas, que aportan yodo orgánico biodisponible y polisacáridos fucoidanos cofactores de la prolil y lisil hidroxilasa, junto con D-alfa-tocoferol natural como protector contra la peroxidación lipídica de membranas.'
              : 'For systemic cellular nutrition, Colway employs sub-zero vacuum sublimation (lyophilization at -40°C), eliminating moisture without breaking sensitive peptide bonds. Each capsule delivers biologically intact tropocollagen signal peptides combined with Baltic Fucus vesiculosus algae micronized to optimal cellular bioavailability. This marine synergy provides essential organic iodine, fucoidans, and alginates that act as co-factors for lysyl hydroxylase, while natural D-alpha-tocopherol prevents cellular membrane lipid peroxidation.'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingTop: '4px' }}>
            {['Sub-Zero Cryogenic Freeze-Drying (-40°C)', 'Baltic Fucus vesiculosus Synergy', 'Bioavailable Organic Iodine', 'Natural D-Alpha-Tocopherol', 'Full Hydroxyproline/Proline Signal Profile'].map((chip, i) => (
              <span key={i} style={{ fontSize: '0.68rem', fontWeight: 650, color: '#334155', background: '#ffffff', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '4px' }}>
                ✓ {chip}
              </span>
            ))}
          </div>
        </div>

        {/* Line 4: Clean European GMP & CPNP Registration */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(22, 163, 74, 0.1)', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ShieldCheck size={20} />
              </div>
              <strong style={{ fontSize: '0.94rem', color: '#0f172a', fontWeight: 800 }}>
                {isEs ? 'Estándares Farmacéuticos Europeos GMP & Garantía de Formulación Limpia' : 'European Pharmaceutical GMP Standards & Clean Formulation Guarantee'}
              </strong>
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px' }}>
              {isEs ? 'ISO 22716 & Notificación CPNP' : 'ISO 22716 & EU CPNP Registered'}
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
            {isEs
              ? 'Formuladas y producidas bajo estrictas normas ISO 22716 (Buenas Prácticas de Fabricación cosmético-médica), todas las fórmulas cuentan con registro oficial en el Portal Europeo CPNP de la Comisión Europea. Son 100% hipoalergénicas, testadas dermatológicamente en humanos, formuladas sin parabenos, siliconas ni colorantes sintéticos, e incorporan la garantía Colway de hidratación dermo-compatible con "Efecto Cero Tirantez" (Zero Tightness).'
              : 'Formulated and manufactured strictly under ISO 22716 Good Manufacturing Practice (GMP) for cosmetic compounding, every Colway formulation holds official European Commission CPNP (Cosmetic Products Notification Portal) compliance. The formulations are 100% hypoallergenic, dermatologically tested on human subjects, formulated without parabens, silicones, synthetic colorants, or PEG compounds, and guaranteed with the Colway "Zero Tightness" physiological hydration mantle.'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingTop: '4px' }}>
            {['ISO 22716 Certified GMP Facility', 'EU CPNP Notification Portal Verified', '100% Dermatologically Tested in Humans', '0% Parabens, PEGs & Silicones', 'Zero Tightness Hydrolipid Protection'].map((chip, i) => (
              <span key={i} style={{ fontSize: '0.68rem', fontWeight: 650, color: '#334155', background: '#ffffff', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '4px' }}>
                ✓ {chip}
              </span>
            ))}
          </div>
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

