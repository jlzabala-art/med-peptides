"use client";

import React, { useState } from 'react';
import {
  FlaskConical,
  Droplets,
  Thermometer,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';

/**
 * ReconstitutionGuideCard
 * ─────────────────────────────────────────────────────────────────────────────
 * Step-by-step visual, patient-first reconstitution protocol for lyophilized
 * peptide vials (BPC-157, TB-500, GLP-1 agonists, bioregulators) and complex biologics.
 * 
 * Features:
 *  - Checklist of sterile supplies needed
 *  - 5-step numbered sequence with golden rules (slide down wall, swirl don't shake)
 *  - Insulin syringe (U-100) unit calculator and tick mark conversion
 *  - Cold chain & stability guard (2-8°C, 28-30 days)
 *  - Bilingual (ES / EN) support
 */
export default function ReconstitutionGuideCard({
  productName = 'Péptido en Vial Liofilizado',
  vialDoseMg = 5, // e.g. 5 mg
  diluentVolumeMl = 2.0, // e.g. 2.0 mL BAC Water
  prescribedDoseMcg = 250, // e.g. 250 mcg
  diluentName = 'Agua Bacteriostática (BAC Water con 0.9% Alcohol Bencílico)',
  lang = 'es',
  initiallyExpanded = true,
  standalone = false
}) {
  const isEs = lang === 'es';
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
  const customDiluentMl = diluentVolumeMl || 2.0;
  const customDoseMcg = prescribedDoseMcg || 250;

  // Calculation:
  // Concentration (mcg/mL) = (vialDoseMg * 1000) / diluentVolumeMl
  // In a U-100 insulin syringe: 1.0 mL = 100 units => 1 unit = 0.01 mL
  // Concentration per unit (mcg/unit) = Concentration / 100 = (vialDoseMg * 10) / diluentVolumeMl
  // Units to inject = customDoseMcg / (Concentration per unit)
  const concentrationMcgPerMl = (Number(vialDoseMg || 5) * 1000) / Number(customDiluentMl || 2.0);
  const mcgPerUnit = concentrationMcgPerMl / 100;
  const calculatedUnits = mcgPerUnit > 0 ? Math.round((Number(customDoseMcg || 250) / mcgPerUnit) * 10) / 10 : 10;
  const calculatedVolumeMl = Math.round((Number(customDoseMcg || 250) / concentrationMcgPerMl) * 100) / 100;

  const toggleExpand = () => {
    triggerHaptic('selection');
    setIsExpanded(!isExpanded);
  };

  const steps = [
    {
      num: 1,
      title: isEs ? 'Desinfección Aséptica' : 'Aseptic Disinfection',
      desc: isEs
        ? 'Lávate bien las manos con agua y jabón. Retira las tapas protectoras de plástico (flip-off) del vial de péptido en polvo y del vial de Agua Bacteriostática. Limpia firmemente los tapones de goma de ambos con una toallita de alcohol isopropílico y déjalos secar al aire 10 segundos.'
        : 'Wash your hands thoroughly with soap. Flip off the protective plastic caps from both the peptide vial and the Bacteriostatic Water vial. Firmly swab the rubber stoppers of both vials with an alcohol prep pad and allow them to air dry for 10 seconds.',
      badge: isEs ? 'Paso 1 · Preparación' : 'Step 1 · Prep',
      icon: '🧼'
    },
    {
      num: 2,
      title: isEs ? `Extracción del Diluyente (${customDiluentMl} mL)` : `Diluent Withdrawal (${customDiluentMl} mL)`,
      desc: isEs
        ? `Toma una jeringa de mezcla limpia con aguja. Inyecta ${customDiluentMl} mL de aire en el vial de Agua Bacteriostática para igualar presiones, invierte el vial boca abajo y extrae lentamente ${customDiluentMl} mL exactos de líquido. Asegúrate de expulsar cualquier burbuja de aire.`
        : `Take a clean mixing syringe. Inject ${customDiluentMl} mL of air into the Bacteriostatic Water vial to equalize pressure, invert the vial upside down, and slowly withdraw exactly ${customDiluentMl} mL of liquid. Tap syringe to expel any large air bubbles.`,
      badge: isEs ? 'Paso 2 · Medición' : 'Step 2 · Measure',
      icon: '💧'
    },
    {
      num: 3,
      title: isEs ? 'Inyección Lenta por la Pared (Regla de Oro)' : 'Slow Sidewall Injection (Golden Rule)',
      desc: isEs
        ? 'Introduce la aguja inclinada en el vial de péptido en polvo. Presiona el émbolo MUY LENTAMENTE haciendo que el líquido se deslice suavemente por la pared interna de vidrio. NUNCA dispares el chorro directo con fuerza sobre el polvo seco, ya que podría dañar las cadenas de aminoácidos del péptido.'
        : 'Insert the needle into the peptide vial at an angle. Depress the plunger VERY SLOWLY, allowing the diluent to gently glide down the inside glass wall. NEVER shoot diluent directly onto the lyophilized cake with high pressure, as this can denature delicate peptide bonds.',
      badge: isEs ? '⚠️ Crítico · Suave' : '⚠️ Critical · Gentle',
      icon: '🎯',
      isWarning: true
    },
    {
      num: 4,
      title: isEs ? 'Disolución en Círculos (Sin Agitar)' : 'Circular Swirl (Do Not Shake)',
      desc: isEs
        ? 'Retira la aguja y deséchala en un contenedor seguro. Rota suavemente el vial en círculos sobre una mesa ("swirling") o entre tus manos durante 1 o 2 minutos hasta que el polvo se disuelva por completo. ¡NUNCA agites vigorosamente como una coctelera! El líquido debe quedar completamente claro y transparente.'
        : 'Withdraw and safely discard the mixing needle. Gently swirl the vial in circular motions on a flat surface or between your palms for 1–2 minutes until fully dissolved. NEVER shake vigorously like a shaker cup! The solution should become completely clear.',
      badge: isEs ? 'Paso 4 · Reposo' : 'Step 4 · Swirl',
      icon: '🔄'
    },
    {
      num: 5,
      title: isEs ? 'Conservación Inmediata en Nevera (2°C – 8°C)' : 'Immediate Refrigeration (2°C – 8°C)',
      desc: isEs
        ? 'Una vez reconstituido, guarda el vial INMEDIATAMENTE en la nevera (en una balda central, nunca en la puerta donde la temperatura varía, y NUNCA en el congelador). Apunta la fecha de reconstitución: el vial mantiene su máxima potencia durante 28 a 30 días.'
        : 'Once reconstituted, store the vial IMMEDIATELY in the refrigerator (middle shelf, not the door, and NEVER in the freezer). Note down the preparation date: the reconstituted solution maintains peak therapeutic potency for 28 to 30 days.',
      badge: isEs ? 'Paso 5 · Nevera 2-8°C' : 'Step 5 · Storage',
      icon: '❄️'
    }
  ];

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #bfdbfe',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: standalone ? '0 4px 16px rgba(37, 99, 235, 0.08)' : 'none',
        transition: 'all 0.2s ease'
      }}
    >
      {/* Header Bar */}
      <div
        onClick={toggleExpand}
        style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
          padding: '14px 18px',
          borderBottom: isExpanded ? '1px solid #bfdbfe' : 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              background: '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
              flexShrink: 0
            }}
          >
            <FlaskConical size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  background: '#2563eb',
                  color: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}
              >
                {isEs ? 'GUÍA PASO A PASO' : 'STEP-BY-STEP GUIDE'}
              </span>
              <span
                style={{
                  fontSize: '0.70rem',
                  fontWeight: 700,
                  color: '#0d9488',
                  background: '#ccfbf1',
                  border: '1px solid #99f6e4',
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}
              >
                ❄️ {isEs ? 'Requiere Nevera 2–8°C' : 'Requires Refrigeration 2–8°C'}
              </span>
            </div>
            <h4 style={{ margin: '4px 0 0 0', fontSize: '0.98rem', fontWeight: 800, color: '#1e3a8a' }}>
              {isEs ? `Guía de Reconstitución: ${productName}` : `Reconstitution Protocol: ${productName}`}
            </h4>
            <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '2px' }}>
              {isEs
                ? `Cómo preparar tu vial de ${vialDoseMg}mg con ${diluentVolumeMl}mL de diluyente de forma 100% segura`
                : `How to reconstitute your ${vialDoseMg}mg vial with ${diluentVolumeMl}mL diluent safely`}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#2563eb' }}>
            {isExpanded ? (isEs ? 'Ocultar Guía' : 'Collapse Guide') : (isEs ? 'Ver Guía Completa' : 'View Full Guide')}
          </span>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563eb'
            }}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Material Checklist Box */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '14px 16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ fontSize: '1.1rem' }}>📋</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                {isEs ? 'Materiales Necesarios antes de Empezar' : 'Required Supplies Before Starting'}
              </span>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '10px'
              }}
            >
              {[
                { label: isEs ? `Vial de péptido en polvo (${vialDoseMg} mg)` : `Peptide powder vial (${vialDoseMg} mg)`, icon: '🧪' },
                { label: isEs ? `Vial de diluyente (${diluentName.split('(')[0].trim()})` : `Diluent vial (${diluentName.split('(')[0].trim()})`, icon: '💧' },
                { label: isEs ? 'Jeringa de mezcla 2–3 mL (para diluir)' : '2–3 mL mixing syringe (for diluent)', icon: '💉' },
                { label: isEs ? 'Jeringas de insulina U-100 (para las dosis diarias)' : 'U-100 insulin syringes (for daily doses)', icon: '📏' },
                { label: isEs ? 'Toallitas con alcohol isopropílico al 70%' : '70% Isopropyl alcohol prep pads', icon: '🧼' }
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '0.76rem',
                    color: '#334155',
                    fontWeight: 600
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Insulin Syringe (U-100) Tick Mark Converter */}
          <div
            style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #0369a1 100%)',
              color: '#ffffff',
              borderRadius: '12px',
              padding: '16px 20px',
              boxShadow: '0 4px 14px rgba(30, 58, 138, 0.25)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.3rem' }}>🎯</span>
                <div>
                  <div style={{ fontSize: '0.70rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#93c5fd' }}>
                    {isEs ? 'Calculadora Visual de Dosis en Jeringa' : 'Visual Syringe Dose Converter'}
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                    {isEs ? '¿Hasta qué raya de la jeringa debo cargar?' : 'Which tick mark should I draw to?'}
                  </div>
                </div>
              </div>
              <span
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '0.72rem',
                  fontWeight: 700
                }}
              >
                {isEs ? 'Jeringa de Insulina U-100 (1 mL = 100 Unidades)' : 'U-100 Syringe (1 mL = 100 Units)'}
              </span>
            </div>

            {/* Syringe Converter Result Banner */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '10px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px'
              }}
            >
              <div>
                <div style={{ fontSize: '0.76rem', color: '#e0f2fe' }}>
                  {isEs ? 'Dosis Prescrita por tu Médico:' : 'Doctor Prescribed Dose:'}
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                  {customDoseMcg} mcg{' '}
                  <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#bfdbfe' }}>
                    ({(customDoseMcg / 1000).toFixed(2)} mg)
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#bae6fd', marginTop: '2px' }}>
                  {isEs
                    ? `En vial de ${vialDoseMg}mg diluido con ${customDiluentMl}mL`
                    : `In ${vialDoseMg}mg vial with ${customDiluentMl}mL diluent`}
                </div>
              </div>

              {/* Big Unit Display */}
              <div
                style={{
                  background: '#ffffff',
                  color: '#1e3a8a',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
              >
                <div style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0369a1' }}>
                  {isEs ? 'CARGAR EN LA JERINGA' : 'DRAW IN SYRINGE'}
                </div>
                <div style={{ fontSize: '1.9rem', fontWeight: 900, lineHeight: 1.1, color: '#2563eb' }}>
                  {calculatedUnits}{' '}
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e3a8a' }}>
                    {isEs ? 'UNIDADES' : 'UNITS'}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b' }}>
                  = {calculatedVolumeMl} mL
                </div>
              </div>
            </div>

            {/* Visual Syringe Tick Representation */}
            <div style={{ marginTop: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#bfdbfe', marginBottom: '4px' }}>
                <span>0 U</span>
                <span>10 U</span>
                <span>20 U</span>
                <span>30 U</span>
                <span>40 U</span>
                <span>50 U</span>
              </div>
              <div
                style={{
                  height: '24px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.4)'
                }}
              >
                {/* Fill Bar */}
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, Math.max(5, (calculatedUnits / 50) * 100))}%`,
                    background: 'linear-gradient(90deg, #38bdf8 0%, #4ade80 100%)',
                    borderRadius: '5px',
                    transition: 'width 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: '6px'
                  }}
                >
                  <span style={{ fontSize: '0.68rem', fontWeight: 900, color: '#064e3b' }}>
                    ▲ {calculatedUnits} U
                  </span>
                </div>
              </div>
              <p style={{ margin: '6px 0 0', fontSize: '0.72rem', color: '#e0f2fe', textAlign: 'center' }}>
                {isEs
                  ? `👉 Carga tu jeringa hasta la marca número ${calculatedUnits}. Si tienes dudas, confirma con tu médico.`
                  : `👉 Draw liquid up to mark ${calculatedUnits} on your U-100 syringe.`}
              </p>
            </div>
          </div>

          {/* 5 Sequential Steps */}
          <div>
            <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🔢</span>
              <span>{isEs ? 'Pasos de Preparación en 5 Minutos' : '5-Minute Step-by-Step Preparation Protocol'}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {steps.map((st) => (
                <div
                  key={st.num}
                  style={{
                    background: st.isWarning ? '#fffbeb' : '#ffffff',
                    border: `1px solid ${st.isWarning ? '#fde68a' : '#e2e8f0'}`,
                    borderLeft: `4px solid ${st.isWarning ? '#d97706' : '#2563eb'}`,
                    borderRadius: '8px',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: st.isWarning ? '#d97706' : '#2563eb',
                          color: '#ffffff',
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {st.num}
                      </span>
                      <span style={{ fontSize: '0.88rem', fontWeight: 800, color: st.isWarning ? '#92400e' : '#0f172a' }}>
                        {st.title}
                      </span>
                    </div>

                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: st.isWarning ? '#fef3c7' : '#eff6ff',
                        color: st.isWarning ? '#92400e' : '#1d4ed8'
                      }}
                    >
                      {st.badge}
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#334155', lineHeight: 1.5, paddingLeft: '32px' }}>
                    {st.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Golden Rules: Dos and Don'ts */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '12px'
            }}
          >
            {/* DOs */}
            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                padding: '12px 14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 800, color: '#15803d', marginBottom: '6px' }}>
                <CheckCircle2 size={16} />
                <span>{isEs ? 'Buenas Prácticas (RECOMENDADO)' : 'Best Practices (DO)'}</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.74rem', color: '#166534', lineHeight: 1.5 }}>
                <li>{isEs ? 'Inyectar el diluyente haciéndolo resbalar suavemente por la pared.' : 'Inject diluent slowly down the glass wall.'}</li>
                <li>{isEs ? 'Mover el vial en círculos lentos hasta que quede 100% transparente.' : 'Swirl in gentle circles until crystal clear.'}</li>
                <li>{isEs ? 'Guardar en la nevera a 2°C–8°C inmediatamente tras mezclar.' : 'Store refrigerated (2°C–8°C) immediately after mixing.'}</li>
                <li>{isEs ? 'Rotar la zona de inyección en el abdomen (pellizco a 5cm del ombligo).' : 'Rotate abdominal subcutaneous injection sites daily.'}</li>
              </ul>
            </div>

            {/* DONTs */}
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '12px 14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 800, color: '#b91c1c', marginBottom: '6px' }}>
                <AlertTriangle size={16} />
                <span>{isEs ? 'Errores Críticos a Evitar (NUNCA)' : 'Critical Mistakes (DON’T)'}</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.74rem', color: '#991b1b', lineHeight: 1.5 }}>
                <li>{isEs ? 'NUNCA agites con fuerza como una coctelera (rompe el péptido).' : 'NEVER shake vigorously (breaks fragile peptide chains).'}</li>
                <li>{isEs ? 'NUNCA congeles el vial una vez reconstituido con agua.' : 'NEVER freeze after reconstitution.'}</li>
                <li>{isEs ? 'NUNCA dejes el vial a temperatura ambiente o bajo el sol.' : 'NEVER leave at room temperature or exposed to direct light.'}</li>
                <li>{isEs ? 'NUNCA reutilices la misma aguja o jeringa de inyección.' : 'NEVER reuse syringes or injection needles.'}</li>
              </ul>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
