"use client";

import React from 'react';
import { 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  Thermometer, 
  CheckCircle2, 
  FlaskConical, 
  Building2, 
  Activity, 
  Layers, 
  Info,
  Pill,
  HeartPulse
} from '@/lib/icons';

/**
 * SupplementTechnicalSpecs.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Institutional Clinical Monograph Component for Oral Supplements & Precision Nutraceuticals.
 * Specifically engineered for UltraPerson and oral compounding formulations:
 * - NO reconstitution or syringe simulators (strictly oral route)
 * - Oral posology & chronobiological dosing schedule
 * - Active compounded ingredients matrix with cellular targets
 * - Acid-resistant vegan HPMC shell specifications
 * - EU GMP traceability & storage criteria
 * ─────────────────────────────────────────────────────────────────────────────
 */
export default function SupplementTechnicalSpecs({
  product,
  _selectedStrength,
  lang = 'es'
}) {
  const isEs = lang === 'es';

  const actives = product?.activeIngredients || [
    { name: 'Coenzyme Q10 (Ubiquinone USP)', dose: '125 mg', target: isEs ? 'Cadena de transporte de electrones mitocondrial' : 'Mitochondrial Complex I & II Electron Transport' },
    { name: 'Pyrroloquinoline Quinone (PQQ)', dose: '20 mg', target: isEs ? 'Biogénesis mitocondrial vía CREB / PGC-1α' : 'CREB / PGC-1α Mitochondrial Biogenesis' },
    { name: 'Panax Ginseng (Ginsenosidos estandarizados)', dose: '200 mg', target: isEs ? 'Adaptógeno neuroendocrino y bioenergética celular' : 'Adrenal Adaptation & Cellular Bioenergetics' },
    { name: 'Ácido Alfa-Lipoico (ALA)', dose: '150 mg', target: isEs ? 'Reciclaje de antioxidantes endógenos y glutatión' : 'Endogenous Antioxidant Recycling & Glutathione' },
    { name: 'Piperina (Bioperine® 95%)', dose: '5 mg', target: isEs ? 'Optimización de absorción y biodisponibilidad enteral' : 'Bioavailability & Intestinal Absorption Maximizer' }
  ];

  const dosing = product?.dosingInstructions || (isEs 
    ? 'Tomar 2 cápsulas una vez al día por la mañana con el desayuno y abundante agua, junto con su protocolo formulado. Duración: 1 a 3 meses.' 
    : 'Take 2 capsules once daily in the morning with breakfast and water alongside your prescribed compounded protocol. Duration: 1 to 3 months.');

  const mechanism = product?.mechanism || product?.description || (isEs
    ? 'Formulación nutracéutica de precisión diseñada para estimular la biogénesis mitocondrial de novo e incrementar el rendimiento de ATP celular sin generar estrés oxidativo.'
    : 'Precision compounded co-factor matrix engineered to stimulate de novo mitochondrial biogenesis and multiply cellular ATP yield.');

  const vehicle = product?.vehicle || (isEs
    ? 'Cápsulas vegetales gastrorresistentes HPMC (Delayed-Release). 100% Vegano, libre de gluten, lactosa, colorantes y conservantes innecesarios.'
    : 'Acid-resistant vegan HPMC vegetable capsules. 100% Vegan, gluten-free, lactose-free, and additive-free.');

  const storage = product?.storage || (isEs
    ? 'Conservar en un lugar fresco y seco (15°C–25°C) protegido de la luz solar directa. Mantener el frasco herméticamente cerrado.'
    : 'Store in a cool, dry place away from direct sunlight (15°C–25°C). Keep bottle tightly sealed.');

  return (
    <div className="supplement-tech-specs" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* ── 1. HEADER BANNER ── */}
      <div className="pds-section-header" style={{
        background: '#ffffff',
        border: '1px solid #dadce0',
        borderRadius: '8px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: '8px',
            background: '#ffedd5',
            color: '#c2410c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: '1px solid #fed7aa'
          }}>
            <Pill size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#c2410c',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                background: '#fff7ed',
                border: '1px solid #fed7aa',
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                {isEs ? 'NUTRACÉUTICA DE PRECISIÓN · VÍA ORAL' : 'PRECISION NUTRACEUTICAL · ORAL ROUTE'}
              </span>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                color: '#137333',
                background: '#e6f4ea',
                border: '1px solid #ceead6',
                padding: '2px 8px',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <CheckCircle2 size={11} />
                {isEs ? 'Cápsulas Gastrorresistentes HPMC' : 'Acid-Resistant Vegan HPMC'}
              </span>
            </div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#111827' }}>
              {isEs ? 'Pauta de Administración Oral & Dosimetría Clínica' : 'Oral Administration Protocol & Clinical Dosimetry'}
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
              {isEs 
                ? 'Formulación magistral en cápsulas de liberación entérica retardada · No requiere reconstitución acuosa' 
                : 'Compounded delayed-release formulation · Zero aqueous reconstitution required'}
            </p>
          </div>
        </div>

        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          padding: '6px 12px',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.74rem',
          color: '#334155'
        }}>
          <ShieldCheck size={16} color="#059669" />
          <span>{isEs ? 'EU GMP Certificado · Pharmapolis' : 'EU GMP Certified · Pharmapolis'}</span>
        </div>
      </div>

      {/* ── 2. CLINICAL POSOLOGY & TIMING CARD ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #fed7aa',
        borderRadius: '8px',
        padding: '18px 20px',
        boxShadow: '0 1px 3px rgba(194, 65, 12, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Clock size={18} color="#c2410c" />
          <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: '#9a3412', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {isEs ? 'Posología Prescrita & Modo de Empleo' : 'Prescribed Posology & Directions for Use'}
          </h4>
        </div>

        <div style={{
          background: '#fff7ed',
          border: '1px solid #ffedd5',
          borderRadius: '6px',
          padding: '12px 14px',
          fontSize: '0.85rem',
          fontWeight: 650,
          color: '#9a3412',
          lineHeight: 1.5,
          marginBottom: '12px'
        }}>
          <div>{dosing}</div>
          {mechanism && (
            <div style={{ marginTop: '6px', fontSize: '0.78rem', fontWeight: 500, color: '#7c2d12' }}>
              {mechanism}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <span style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              {isEs ? 'Momento Óptimo de Toma' : 'Optimal Administration Timing'}
            </span>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a' }}>
              {isEs ? 'Por la mañana con el desayuno' : 'Morning alongside breakfast'}
            </span>
          </div>

          <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <span style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              {isEs ? 'Biodisponibilidad y Absorción' : 'Bioavailability Maximizer'}
            </span>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a' }}>
              {isEs ? 'Ingerir con alimentos que contengan grasas saludables' : 'Take with dietary lipids for optimal CoQ10 uptake'}
            </span>
          </div>

          <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <span style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              {isEs ? 'Duración del Protocolo' : 'Recommended Protocol Duration'}
            </span>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a' }}>
              {isEs ? 'Ciclos continuos de 30 a 90 días' : 'Continuous 30 to 90-day cycles'}
            </span>
          </div>
        </div>
      </div>

      {/* ── 3. ACTIVE COMPOUNDED INGREDIENTS MATRIX ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #dadce0',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '12px 18px',
          background: '#f8fafc',
          borderBottom: '1px solid #dadce0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="#1a73e8" />
            <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#202124' }}>
              {isEs ? 'Matriz de Principios Activos Compounded & Dianas Celulares' : 'Compounded Active Matrix & Cellular Targets'}
            </h4>
          </div>
          <span style={{ fontSize: '0.70rem', color: '#5f6368', fontWeight: 600 }}>
            {isEs ? 'Dosis por toma diaria (2 cápsulas)' : 'Dosage per daily serving (2 capsules)'}
          </span>
        </div>

        <div style={{ padding: '0' }}>
          {/* eslint-disable-next-line no-restricted-syntax */}
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '10px 18px', fontWeight: 700, color: '#475569' }}>
                  {isEs ? 'Principio Activo Compounded' : 'Active Compounded Ingredient'}
                </th>
                <th style={{ padding: '10px 18px', fontWeight: 700, color: '#475569', width: '130px' }}>
                  {isEs ? 'Concentración' : 'Strength / Dose'}
                </th>
                <th style={{ padding: '10px 18px', fontWeight: 700, color: '#475569' }}>
                  {isEs ? 'Mecanismo Farmacológico & Diana' : 'Pharmacological Mechanism & Cellular Target'}
                </th>
              </tr>
            </thead>
            <tbody>
              {actives.map((act, idx) => (
                <tr key={idx} style={{
                  borderBottom: idx < actives.length - 1 ? '1px solid #f1f5f9' : 'none',
                  background: idx % 2 === 0 ? '#ffffff' : '#fafafa'
                }}>
                  <td style={{ padding: '12px 18px', fontWeight: 700, color: '#0f172a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#c2410c', flexShrink: 0 }} />
                      <span>{act.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 18px', fontFamily: 'monospace', fontWeight: 800, color: '#003666' }}>
                    {act.dose}
                  </td>
                  <td style={{ padding: '12px 18px', color: '#334155', lineHeight: 1.45 }}>
                    {act.target}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 4. PHARMACOKINETICS & GASTRO-RESISTANT HPMC TECHNOLOGY ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '14px'
      }}>
        <div style={{
          background: '#ffffff',
          border: '1px solid #dadce0',
          borderRadius: '8px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1a73e8' }}>
            <ShieldCheck size={18} />
            <h5 style={{ margin: 0, fontSize: '0.80rem', fontWeight: 700, color: '#202124', textTransform: 'uppercase' }}>
              {isEs ? 'Tecnología Gastrorresistente HPMC' : 'Delayed-Release HPMC Technology'}
            </h5>
          </div>
          <p style={{ margin: 0, fontSize: '0.74rem', color: '#475569', lineHeight: 1.5 }}>
            {vehicle}
          </p>
        </div>

        <div style={{
          background: '#ffffff',
          border: '1px solid #dadce0',
          borderRadius: '8px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669' }}>
            <Thermometer size={18} />
            <h5 style={{ margin: 0, fontSize: '0.80rem', fontWeight: 700, color: '#202124', textTransform: 'uppercase' }}>
              {isEs ? 'Conservación y Estabilidad' : 'Storage & Shelf Stability'}
            </h5>
          </div>
          <p style={{ margin: 0, fontSize: '0.74rem', color: '#475569', lineHeight: 1.5 }}>
            {storage}
          </p>
        </div>
      </div>
    </div>
  );
}
