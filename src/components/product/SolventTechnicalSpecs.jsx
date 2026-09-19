"use client";

import React, { useState } from 'react';
import { 
  Droplets, ShieldCheck, Clock, AlertTriangle, 
  FlaskConical, CheckCircle2, Info, Thermometer,
  Layers, Beaker, FileText, Check
} from '@/lib/icons';

export default function SolventTechnicalSpecs({ product, lang = 'en' }) {
  const [selectedPeptideMass, setSelectedPeptideMass] = useState(10); // mg
  const [selectedDiluentVolume, setSelectedDiluentVolume] = useState(2.0); // mL

  // Calculations for universal diluent helper
  const nominalConcentration = (selectedPeptideMass / selectedDiluentVolume).toFixed(2); // mg/mL
  const mcgPerUnit = ((selectedPeptideMass * 1000) / (selectedDiluentVolume * 100)).toFixed(1); // mcg per U-100 unit (100 units = 1 mL)

  const isEs = lang === 'es';

  return (
    <div style={{ padding: '1.75rem', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
      {/* ── Banner: Authorized Solvent Notice ── */}
      <div style={{
        background: 'linear-gradient(135deg, #002244 0%, #003666 100%)',
        color: '#ffffff',
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 4px 12px rgba(0, 54, 102, 0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: 'rgba(56, 189, 248, 0.2)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            color: '#38bdf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Droplets size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7dd3fc', fontWeight: 800 }}>
              {isEs ? 'VEHÍCULO ESTÉRIL AUTORIZADO • FARMACOPEA USP' : 'AUTHORIZED STERILE VEHICLE • USP PHARMACOPEIA'}
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: '2px 0' }}>
              {isEs ? 'Especificaciones Técnicas y Función como Solvente Universal' : 'Technical Specifications & Universal Diluent Architecture'}
            </div>
            <div style={{ fontSize: '0.80rem', color: '#cbd5e1' }}>
              {isEs 
                ? 'Agente diluyente preservado para reconstitución multidosis de péptidos liofilizados con protección antimicrobiana de 28 días.'
                : 'Preserved sterile diluent for multi-dose reconstitution of lyophilized research peptides with 28-day antimicrobial stability.'}
            </div>
          </div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '0.4rem 0.9rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: '#38bdf8',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <ShieldCheck size={14} />
          <span>{isEs ? 'Estándar Farmacéutico USP' : 'USP Pharmaceutical Grade'}</span>
        </div>
      </div>

      {/* ── 4 Key Chemical & Quality Metrics ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
        marginBottom: '1.75rem'
      }}>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
            {isEs ? 'Composición del Solvente' : 'Solvent Composition'}
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
            0.9% Benzyl Alcohol
          </div>
          <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 600 }}>
            9 mg/mL Preservative (USP)
          </div>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
            {isEs ? 'Vehículo Acuoso Base' : 'Base Aqueous Vehicle'}
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
            Sterile Water for Injection
          </div>
          <div style={{ fontSize: '0.72rem', color: '#0d9488', fontWeight: 600 }}>
            Endotoxin &lt; 0.25 EU/mL
          </div>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
            {isEs ? 'Estabilidad Acuosa Reconstituida' : 'Aqueous In-Use Stability'}
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
            28 Days Post-Puncture
          </div>
          <div style={{ fontSize: '0.72rem', color: '#7c3aed', fontWeight: 600 }}>
            Refrigerated at 2°C – 8°C
          </div>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
            {isEs ? 'Rango de pH Fisiológico' : 'Physiological pH Range'}
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
            pH 4.5 – 7.0
          </div>
          <div style={{ fontSize: '0.72rem', color: '#ea580c', fontWeight: 600 }}>
            Compatible with Peptide Salts
          </div>
        </div>
      </div>

      {/* ── Two Columns: Universal Reconstitution Calculator & Antimicrobial Mechanism ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem',
        marginBottom: '1.75rem'
      }}>
        {/* Left: Universal Reconstitution Matrix Calculator */}
        <div style={{
          background: '#f8fafc',
          border: '1.5px solid #cbd5e1',
          borderRadius: '12px',
          padding: '1.35rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.85rem' }}>
              <FlaskConical size={18} color="#0284c7" />
              <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                {isEs ? 'Calculadora de Dilución Universal para Péptidos' : 'Universal Peptide Dilution & Calibration Engine'}
              </h4>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
              {isEs
                ? 'Simula cómo preparar cualquier vial de péptido liofilizado usando este frasco de Agua Bacteriostática:'
                : 'Simulate how to prepare any lyophilized peptide vial using this Bacteriostatic Water diluent:'}
            </p>

            {/* Mass Selector */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                {isEs ? '1. Masa Activa del Péptido en el Vial:' : '1. Active Peptide Mass in Target Vial:'}
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[2, 5, 10, 15, 20, 30].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedPeptideMass(m)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: selectedPeptideMass === m ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                      background: selectedPeptideMass === m ? '#eff6ff' : '#ffffff',
                      color: selectedPeptideMass === m ? '#0284c7' : '#475569'
                    }}
                  >
                    {m} mg
                  </button>
                ))}
              </div>
            </div>

            {/* Volume Selector */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                {isEs ? '2. Volumen de Agua Bacteriostática a Añadir:' : '2. Bacteriostatic Water Volume Added:'}
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[1.0, 1.5, 2.0, 2.5, 3.0, 5.0].map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setSelectedDiluentVolume(v)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: selectedDiluentVolume === v ? '1.5px solid #0d9488' : '1px solid #cbd5e1',
                      background: selectedDiluentVolume === v ? '#f0fdfa' : '#ffffff',
                      color: selectedDiluentVolume === v ? '#0d9488' : '#475569'
                    }}
                  >
                    {v.toFixed(1)} mL
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Result Card */}
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #93c5fd',
            borderRadius: '10px',
            padding: '1rem',
            boxShadow: '0 2px 6px rgba(147, 197, 253, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e40af' }}>
                {isEs ? 'Concentración Resultante' : 'Resulting Nominal Concentration'}
              </span>
              <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1e3a8a' }}>
                {nominalConcentration} mg/mL
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '0.4rem' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                {isEs ? 'Factor de Jeringa U-100 (1 UI):' : 'U-100 Syringe Factor (1 Unit):'}
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0d9488' }}>
                {mcgPerUnit} mcg / UI
              </span>
            </div>
          </div>
        </div>

        {/* Right: Antimicrobial Mechanism & Biological Standard */}
        <div style={{
          background: '#f8fafc',
          border: '1.5px solid #cbd5e1',
          borderRadius: '12px',
          padding: '1.35rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.85rem' }}>
              <ShieldCheck size={18} color="#0d9488" />
              <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                {isEs ? 'Mecanismo de Preservación y Seguridad Antimicrobiana' : 'Antimicrobial Preservation Mechanism & Standards'}
              </h4>
            </div>

            <div style={{ fontSize: '0.80rem', color: '#334155', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <CheckCircle2 size={15} color="#0d9488" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>{isEs ? 'Inhibición Bacteriostática:' : 'Bacteriostatic Inhibition:'}</strong>{' '}
                  {isEs
                    ? 'El alcohol bencílico al 0.9% detiene la proliferación de bacterias grampositivas y gramnegativas sin desnaturalizar la estructura peptídica terciaria.'
                    : '0.9% benzyl alcohol prevents the proliferation of gram-positive and gram-negative bacteria without denaturing fragile peptide tertiary structures.'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <Clock size={15} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>{isEs ? 'Protocolo de 28 Días:' : '28-Day In-Use Window:'}</strong>{' '}
                  {isEs
                    ? 'A diferencia del agua estéril común (que debe desecharse en 24-48 horas por riesgo de infección), el agua bacteriostática mantiene la esterilidad del vial multidosis durante 28 días refrigerada.'
                    : 'Unlike plain sterile water (which must be discarded within 24-48 hours due to contamination risk), bacteriostatic water ensures sterility for 28 days of multi-draw access.'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <Thermometer size={15} color="#7c3aed" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>{isEs ? 'Cadena de Conservación:' : 'Thermal Management:'}</strong>{' '}
                  {isEs
                    ? 'Conservar a 2°C – 25°C antes de abrir. Una vez perforado el septo con una aguja estéril, mantener estrictamente refrigerado a 2°C – 8°C. Prohibido congelar.'
                    : 'Store at 2°C – 25°C before puncture. Once the vial septum is entered with a sterile needle, store strictly at 2°C – 8°C. Do not freeze.'}
                </span>
              </div>
            </div>
          </div>

          {/* Clinical Alert */}
          <div style={{
            marginTop: '1rem',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '0.75rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <AlertTriangle size={16} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.72rem', color: '#991b1b', lineHeight: 1.4 }}>
              <strong>{isEs ? 'Contraindicación Estricta:' : 'Strict Clinical Contraindication:'}</strong>{' '}
              {isEs
                ? 'No administrar directamente por vía intravenosa sin diluir en soluto. Contraindicado en neonatos y lactantes debido a toxicidad por alcohol bencílico.'
                : 'Do not administer directly IV without therapeutic solute. Contraindicated in neonates and infants due to potential benzyl alcohol toxicity (gasping syndrome).'}
            </div>
          </div>
        </div>
      </div>

      {/* ── Universal Diluent Ratio Reference Table ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        overflow: 'hidden'
      }}>
        <div style={{
          background: '#f1f5f9',
          padding: '0.65rem 1rem',
          borderBottom: '1px solid #e2e8f0',
          fontSize: '0.75rem',
          fontWeight: 800,
          color: '#334155',
          textTransform: 'uppercase',
          letterSpacing: '0.04em'
        }}>
          {isEs ? 'Tabla Rápida de Diluciones Habituales para el Compendio Clínico' : 'Standard Reconstitution Dilution Ratios for Clinical Compendium'}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.80rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                <th style={{ padding: '0.6rem 1rem' }}>{isEs ? 'Vial de Péptido' : 'Peptide Vial API'}</th>
                <th style={{ padding: '0.6rem 1rem' }}>{isEs ? 'Volumen BAC' : 'BAC Diluent'}</th>
                <th style={{ padding: '0.6rem 1rem' }}>{isEs ? 'Concentración' : 'Concentration'}</th>
                <th style={{ padding: '0.6rem 1rem' }}>{isEs ? 'Factor Jeringa U-100' : 'U-100 Draw Rate'}</th>
                <th style={{ padding: '0.6rem 1rem' }}>{isEs ? 'Ejemplos en el Compendio' : 'Compendium Examples'}</th>
              </tr>
            </thead>
            <tbody>
              {[
                { vial: '5 mg', bac: '2.0 mL', conc: '2.5 mg/mL', rate: '25 mcg / UI', ex: 'BPC-157, TB-500, Epithalon' },
                { vial: '10 mg', bac: '2.0 mL', conc: '5.0 mg/mL', rate: '50 mcg / UI', ex: 'Retatrutide, MOTS-c, GHK-Cu' },
                { vial: '15 mg', bac: '3.0 mL', conc: '5.0 mg/mL', rate: '50 mcg / UI', ex: 'Tirzepatide High-Dose, GLP-1' },
                { vial: '30 mg', bac: '3.0 mL', conc: '10.0 mg/mL', rate: '100 mcg / UI', ex: 'Semaglutide Multi-Week, Ipamorelin' }
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.6rem 1rem', fontWeight: 800, color: '#0f172a' }}>{row.vial}</td>
                  <td style={{ padding: '0.6rem 1rem', color: '#0284c7', fontWeight: 700 }}>{row.bac}</td>
                  <td style={{ padding: '0.6rem 1rem', fontWeight: 700, color: '#0d9488' }}>{row.conc}</td>
                  <td style={{ padding: '0.6rem 1rem', color: '#475569' }}>{row.rate}</td>
                  <td style={{ padding: '0.6rem 1rem', color: '#64748b', fontStyle: 'italic' }}>{row.ex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
