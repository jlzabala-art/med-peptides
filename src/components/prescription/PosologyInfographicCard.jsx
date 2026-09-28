"use client";

import React from 'react';
import { 
  Clock, 
  Droplets, 
  Sparkles, 
  ShieldCheck, 
  Moon, 
  Sun, 
  CheckCircle2, 
  Info,
  Activity
} from '@/lib/icons';

/**
 * PosologyInfographicCard
 * ─────────────────────────────────────────────────────────────────────────────
 * High-impact, realistic visual clinical infographic illustrating the daily
 * administration and follicular delivery protocol for customized topical solutions
 * (TrichoSol™ liposomal vehicle with Latanoprost, 17-α-Estradiol, IGrantine-F1™).
 * Adheres to GCP clinical console standards and medical infographic guidelines.
 */
export default function PosologyInfographicCard({
  doseMl = 1.0,
  timing = 'Nightly (21:30 - 22:00)',
  carrier = 'TrichoSol™ Liposomal Phytocomplex',
  cycleDuration = '90 Days (3x 100 mL Bottles)',
  lang = 'en'
}) {
  const isEs = lang === 'es';

  return (
    <div 
      className="rx-posology-infographic-card"
      style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #cbd5e1',
        boxShadow: '0 4px 20px rgba(2, 132, 199, 0.08)',
        marginBottom: '1.5rem',
        overflow: 'hidden'
      }}
    >
      {/* ── Top Clinical Accent Bar ── */}
      <div style={{
        height: '4px',
        background: 'linear-gradient(90deg, #0284c7 0%, #0d9488 50%, #6366f1 100%)'
      }} />

      <div style={{ padding: '1.5rem' }}>
        
        {/* ── Infographic Header ── */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem',
          borderBottom: '1px solid #f1f5f9',
          paddingBottom: '1rem'
        }}>
          <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284c7, #0d9488)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
            }}>
              <Droplets size={22} />
            </div>
            <div>
              <div style={{
                fontSize: '0.70rem',
                fontWeight: 800,
                color: '#0284c7',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {isEs ? 'Infografía Clínica de Administración' : 'Clinical Posology & Follicular Delivery Infographic'}
              </div>
              <h3 style={{
                margin: '0.2rem 0',
                fontSize: '1.2rem',
                fontWeight: 800,
                color: '#0f172a'
              }}>
                {isEs ? 'Modo de Empleo & Técnica de Aplicación Tópica' : 'Administration Technique & Follicular Uptake'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                {isEs 
                  ? 'Guía visual paso a paso para optimizar la biodisponibilidad transdérmica en TrichoSol™' 
                  : 'Visual step-by-step protocol to optimize transdermal bioavailability in TrichoSol™ vehicle'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: '#ecfdf5',
              color: '#047857',
              border: '1px solid #a7f3d0',
              padding: '3px 10px',
              borderRadius: '20px',
              fontSize: '0.72rem',
              fontWeight: 700
            }}>
              <ShieldCheck size={13} color="#059669" />
              <span>{doseMl} mL {isEs ? 'Dosis Nocturna' : 'Nightly Dose'}</span>
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: '#f0f9ff',
              color: '#0369a1',
              border: '1px solid #bae6fd',
              padding: '3px 10px',
              borderRadius: '20px',
              fontSize: '0.72rem',
              fontWeight: 700
            }}>
              <Moon size={13} color="#0284c7" />
              <span>{timing}</span>
            </span>
          </div>
        </div>

        {/* ── Realistic Interactive Delivery Schematic (5 Visual Stages) ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '1.25rem'
        }}>
          
          {/* Stage 1: Scalp Preparation */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: '#0284c7',
                color: '#ffffff',
                fontSize: '0.78rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                1
              </span>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0369a1', background: '#e0f2fe', padding: '1px 6px', borderRadius: '4px' }}>
                21:30 - 22:00
              </span>
            </div>

            {/* Visual Mini Icon/Diagram */}
            <div style={{
              height: 48,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              🧖‍♂️
            </div>

            <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
              {isEs ? 'Cuero Cabelludo Seco' : 'Dry Scalp Prep'}
            </div>
            <p style={{ margin: 0, fontSize: '0.74rem', color: '#475569', lineHeight: 1.45 }}>
              {isEs 
                ? 'Aplicar exclusivamente sobre cuero cabelludo seco y limpio. Separar mechones en rayas de 1-2 cm.'
                : 'Apply solely on completely clean, dry scalp. Part hair in sections 1–2 cm apart across target zones.'}
            </p>
          </div>

          {/* Stage 2: Precision Dropper */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: '#0284c7',
                color: '#ffffff',
                fontSize: '0.78rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                2
              </span>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#15803d', background: '#dcfce7', padding: '1px 6px', borderRadius: '4px' }}>
                Exact 1.0 mL
              </span>
            </div>

            {/* Dropper Vector Graphic */}
            <div style={{
              height: 48,
              borderRadius: '8px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '1.2rem' }}>🧪</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#166534', fontFamily: 'monospace' }}>1.0 mL MARK</div>
                  <div style={{ fontSize: '0.62rem', color: '#15803d' }}>Calibrated Pipette</div>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
              {isEs ? 'Carga de Precisión' : 'Pipette Calibration'}
            </div>
            <p style={{ margin: 0, fontSize: '0.74rem', color: '#475569', lineHeight: 1.45 }}>
              {isEs 
                ? 'Extraer exactamente 1.0 ml con la pipeta graduada. No exceder para evitar saturar receptores.'
                : 'Draw exactly 1.0 mL using the calibrated dropper. Do not exceed 1.0 mL per application.'}
            </p>
          </div>

          {/* Stage 3: Droplet Root Contact */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: '#0284c7',
                color: '#ffffff',
                fontSize: '0.78rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                3
              </span>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#7e22ce', background: '#f3e8ff', padding: '1px 6px', borderRadius: '4px' }}>
                Root Skin Contact
              </span>
            </div>

            <div style={{
              height: 48,
              borderRadius: '8px',
              background: '#faf5ff',
              border: '1px solid #e9d5ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              💧
            </div>

            <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
              {isEs ? 'Gota a Gota en Raíz' : 'Root Micro-Droplets'}
            </div>
            <p style={{ margin: 0, fontSize: '0.74rem', color: '#475569', lineHeight: 1.45 }}>
              {isEs 
                ? 'Depositar las gotas directamente sobre la piel (no en el tallo), distribuidas en coronilla y frontal.'
                : 'Deposit droplets directly onto scalp skin (not hair shafts) across crown, frontal, and temporal zones.'}
            </p>
          </div>

          {/* Stage 4: Microcirculation Massage */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: '#0284c7',
                color: '#ffffff',
                fontSize: '0.78rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                4
              </span>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#b45309', background: '#fef3c7', padding: '1px 6px', borderRadius: '4px' }}>
                60 - 90 Seconds
              </span>
            </div>

            <div style={{
              height: 48,
              borderRadius: '8px',
              background: '#fffbeb',
              border: '1px solid #fde68a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              🤲
            </div>

            <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
              {isEs ? 'Masaje Circular Suave' : 'Microcirculation Massage'}
            </div>
            <p style={{ margin: 0, fontSize: '0.74rem', color: '#475569', lineHeight: 1.45 }}>
              {isEs 
                ? 'Efectuar masaje circular con la yema de los dedos para potenciar la absorción liposomal de TrichoSol™.'
                : 'Perform circular fingertip massage for 60–90s to boost capillary perfusion and lipid uptake.'}
            </p>
          </div>

          {/* Stage 5: Overnight Sustained Uptake */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: '#0284c7',
                color: '#ffffff',
                fontSize: '0.78rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                5
              </span>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0f172a', background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px' }}>
                6 - 8 Hours
              </span>
            </div>

            <div style={{
              height: 48,
              borderRadius: '8px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              🌙
            </div>

            <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
              {isEs ? 'Acción Nocturna Sin Aclarado' : 'Overnight Leave-In'}
            </div>
            <p style={{ margin: 0, fontSize: '0.74rem', color: '#475569', lineHeight: 1.45 }}>
              {isEs 
                ? 'Dejar secar al aire sin calor de secador. No enjuagar durante la noche (mínimo 6 horas de contacto).'
                : 'Air-dry naturally without hairdryer heat. Do not rinse overnight (minimum 6 hours contact time).'}
            </p>
          </div>

        </div>

        {/* ── Key Clinical Advantages Banner ── */}
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #f0f9ff 100%)',
          border: '1px solid #bbf7d0',
          borderRadius: '10px',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="#059669" />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#14532d' }}>
              {isEs ? 'Vehículo TrichoSol™ Patentado (Fagron):' : 'Patented TrichoSol™ Vehicle (Fagron):'}
            </span>
            <span style={{ fontSize: '0.76rem', color: '#166534' }}>
              {isEs 
                ? '100% libre de alcohol y propilenglicol · Cero residuo graso · Alta tolerabilidad dérmica' 
                : '100% alcohol-free & propylene glycol-free · Zero greasy residue · Superior scalp tolerance'}
            </span>
          </div>

          <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#0369a1', background: '#e0f2fe', padding: '2px 8px', borderRadius: '4px' }}>
            {cycleDuration}
          </span>
        </div>

      </div>
    </div>
  );
}
