"use client";

import React, { useState, useMemo } from 'react';
import { Droplet, FlaskConical, Check, Copy, AlertCircle, Info } from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';

/**
 * ReconstitutionGuideWidget
 * Provides instant precision reconstitution math and syringe volume guidance.
 *
 * @param {Object} props
 * @param {string} props.compoundName - Name of the peptide/compound
 * @param {number|string} props.initialVialMg - Initial quantity in vial (mg)
 * @param {number|string} props.initialDoseMcg - Desired single dose (mcg)
 * @param {string} props.route - Route of administration (SC, IM, etc.)
 * @param {string} props.frequency - Frequency of administration (e.g. Daily, 5/2, etc.)
 */
export default function ReconstitutionGuideWidget({
  compoundName = 'Peptide Compound',
  initialVialMg = 5,
  initialDoseMcg = 250,
  route = 'Subcutaneous (SC)',
  frequency = 'Once Daily (Morning)'
}) {
  const [vialMg, setVialMg] = useState(parseFloat(initialVialMg) || 5);
  const [bacWaterMl, setBacWaterMl] = useState(2.0); // Standard default 2.0 ml
  const [doseMcg, setDoseMcg] = useState(parseFloat(initialDoseMcg) || 250);
  const [copied, setCopied] = useState(false);

  // Calculation Math Engine
  const mathResults = useMemo(() => {
    const totalVialMcg = (parseFloat(vialMg) || 0) * 1000;
    const waterMl = parseFloat(bacWaterMl) || 1;
    const targetDoseMcg = parseFloat(doseMcg) || 0;

    if (totalVialMcg <= 0 || waterMl <= 0 || targetDoseMcg <= 0) {
      return {
        concentrationMgPerMl: 0,
        concentrationMcgPerMl: 0,
        doseVolumeMl: 0,
        syringeUnits: 0,
        dosesPerVial: 0,
        isValid: false,
      };
    }

    const concentrationMgPerMl = vialMg / waterMl;
    const concentrationMcgPerMl = totalVialMcg / waterMl;
    const doseVolumeMl = targetDoseMcg / concentrationMcgPerMl;
    // Standard U-100 syringe: 1 ml = 100 units -> units = doseVolumeMl * 100
    const syringeUnits = parseFloat((doseVolumeMl * 100).toFixed(1));
    const dosesPerVial = Math.floor(totalVialMcg / targetDoseMcg);

    return {
      concentrationMgPerMl: concentrationMgPerMl.toFixed(2),
      concentrationMcgPerMl: concentrationMcgPerMl.toFixed(0),
      doseVolumeMl: doseVolumeMl.toFixed(3),
      syringeUnits,
      dosesPerVial,
      isValid: true,
    };
  }, [vialMg, bacWaterMl, doseMcg]);

  const copyInstructions = () => {
    const text = `📋 Reconstitution Protocol for ${compoundName}:
• Vial Quantity: ${vialMg} mg
• Reconstitution Liquid: ${bacWaterMl} ml Bacteriostatic Water
• Concentration: ${mathResults.concentrationMgPerMl} mg/ml (${mathResults.concentrationMcgPerMl} mcg/ml)
• Target Dose: ${doseMcg} mcg (${mathResults.doseVolumeMl} ml)
• Syringe Setting: ${mathResults.syringeUnits} Units on U-100 Insulin Syringe
• Total Doses per Vial: ~${mathResults.dosesPerVial} doses
• Route: ${route} | Schedule: ${frequency}`;

    navigator.clipboard.writeText(text);
    triggerHaptic('success');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '1.25rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      fontFamily: 'inherit'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            background: '#e0f2fe',
            color: '#0369a1',
            padding: '6px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FlaskConical size={18} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>
              Precision Reconstitution Guide
            </h4>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {compoundName} · {route}
            </span>
          </div>
        </div>
        <button
          onClick={copyInstructions}
          type="button"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '4px 10px',
            fontSize: '0.75rem',
            fontWeight: 500,
            color: copied ? '#15803d' : '#0369a1',
            background: copied ? '#f0fdf4' : '#f0f9ff',
            border: `1px solid ${copied ? '#bbf7d0' : '#bae6fd'}`,
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Copied Protocol' : 'Copy Guide'}
        </button>
      </div>

      {/* Input Parameters Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '0.75rem',
        marginBottom: '1rem'
      }}>
        {/* Vial Mg */}
        <div style={{ background: '#f8fafc', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
            Vial Content (mg)
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <input
              type="number"
              min="0.1"
              step="0.5"
              value={vialMg}
              onChange={(e) => setVialMg(e.target.value)}
              style={{
                width: '100%',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                padding: '4px 6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#0f172a'
              }}
            />
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>mg</span>
          </div>
        </div>

        {/* BAC Water Ml */}
        <div style={{ background: '#f8fafc', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
            <Droplet size={11} color="#0284c7" /> BAC Water (ml)
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <select
              value={bacWaterMl}
              onChange={(e) => setBacWaterMl(parseFloat(e.target.value))}
              style={{
                width: '100%',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                padding: '4px 6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#0f172a',
                background: '#fff'
              }}
            >
              <option value={1.0}>1.0 ml</option>
              <option value={1.5}>1.5 ml</option>
              <option value={2.0}>2.0 ml (Std)</option>
              <option value={2.5}>2.5 ml</option>
              <option value={3.0}>3.0 ml</option>
              <option value={5.0}>5.0 ml</option>
            </select>
          </div>
        </div>

        {/* Target Dose Mcg */}
        <div style={{ background: '#f8fafc', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
            Prescribed Dose (mcg)
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <input
              type="number"
              min="10"
              step="50"
              value={doseMcg}
              onChange={(e) => setDoseMcg(e.target.value)}
              style={{
                width: '100%',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                padding: '4px 6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#0f172a'
              }}
            />
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>mcg</span>
          </div>
        </div>
      </div>

      {/* Primary Result Banner: Syringe Units */}
      {mathResults.isValid ? (
        <div style={{
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          borderRadius: '10px',
          padding: '1rem',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          boxShadow: '0 2px 4px rgba(3, 105, 161, 0.2)'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.9, fontWeight: 600 }}>
              Draw on U-100 Syringe
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.1, marginTop: '2px' }}>
              {mathResults.syringeUnits} <span style={{ fontSize: '1rem', fontWeight: 500 }}>Units</span>
            </div>
            <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>
              Equals {mathResults.doseVolumeMl} ml ({doseMcg} mcg active compound)
            </span>
          </div>

          <div style={{
            textAlign: 'right',
            borderLeft: '1px solid rgba(255,255,255,0.25)',
            paddingLeft: '1rem'
          }}>
            <div style={{ fontSize: '0.7rem', opacity: 0.85 }}>Vial Yield</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              ~{mathResults.dosesPerVial} <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>doses</span>
            </div>
            <div style={{ fontSize: '0.7rem', opacity: 0.85 }}>
              @{mathResults.concentrationMgPerMl} mg/ml
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '0.75rem',
          color: '#991b1b',
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
          <AlertCircle size={16} />
          Please specify valid positive numbers for vial content, BAC water and target dose.
        </div>
      )}

      {/* Patient Step-by-Step Instructions */}
      <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.75rem', border: '1px solid #f1f5f9' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Info size={13} color="#0284c7" /> Step-by-Step Reconstitution Protocol
        </div>
        <ol style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.75rem', color: '#475569', lineHeight: 1.5 }}>
          <li>Swab the rubber stopper of both the <strong>{compoundName}</strong> vial and bacteriostatic water vial with 70% alcohol.</li>
          <li>Draw exactly <strong>{bacWaterMl} ml</strong> of bacteriostatic water into a mixing syringe.</li>
          <li>Slowly inject the liquid down the inner glass wall of the peptide vial to avoid shearing delicate peptide chains.</li>
          <li>Gently swirl the vial until fully dissolved (<strong>never shake vigorously</strong>). Store in refrigerator at 2–8°C (36–46°F).</li>
          <li>For each dose, draw up to the <strong>{mathResults.syringeUnits} mark</strong> ({mathResults.syringeUnits} units) on a standard U-100 syringe.</li>
        </ol>
      </div>
    </div>
  );
}
