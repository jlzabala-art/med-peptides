"use client";

import React, { useState, useMemo } from 'react';
import { Droplet, Info, Check, Copy } from '@/lib/icons';
import notifier from '@/services/NotificationService';

/**
 * ClinicalSyringeHelper
 * Clinical micro-calculator for reconstitution and U-100 syringe dosing marks.
 * Calculates exact syringe units (1ml = 100 units):
 * units = (desiredDoseMg / totalVialMg) * diluentMl * 100
 */
export default function ClinicalSyringeHelper({
  defaultVialMg = 5,
  defaultDiluentMl = 2,
  defaultDoseMg = 0.25,
  compoundName = 'Compound',
  onApplyInstructions,
}) {
  const [vialMg, setVialMg] = useState(defaultVialMg);
  const [diluentMl, setDiluentMl] = useState(defaultDiluentMl);
  const [doseMg, setDoseMg] = useState(defaultDoseMg);

  const calc = useMemo(() => {
    const vMg = Math.max(0.01, Number(vialMg) || 1);
    const dMl = Math.max(0.1, Number(diluentMl) || 1);
    const targetMg = Math.max(0.001, Number(doseMg) || 0.1);

    const concentrationMgPerMl = vMg / dMl;
    const drawVolumeMl = targetMg / concentrationMgPerMl;
    const u100Units = Math.round(drawVolumeMl * 100 * 10) / 10; // 1 decimal place
    const dosesPerVial = Math.floor(vMg / targetMg);

    return {
      concentrationMgPerMl: concentrationMgPerMl.toFixed(2),
      drawVolumeMl: drawVolumeMl.toFixed(3),
      u100Units,
      dosesPerVial,
    };
  }, [vialMg, diluentMl, doseMg]);

  const instructionText = `Inject ${calc.u100Units} units (${calc.drawVolumeMl} ml) subcutaneously as directed. (Reconstituted with ${diluentMl}ml Bac Water).`;

  const handleCopy = () => {
    navigator.clipboard.writeText(instructionText);
    notifier.success('Clinical dosing instructions copied!');
  };

  return (
    <div
      style={{
        backgroundColor: '#f8fafc',
        border: '1.5px solid #cbd5e1',
        borderRadius: '12px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Droplet size={15} color="#0284c7" />
          <span style={{ fontSize: '0.80rem', fontWeight: 800, color: '#0f172a' }}>
            Reconstitution & U-100 Syringe Calculator
          </span>
        </div>
        <span
          style={{
            fontSize: '0.68rem',
            backgroundColor: '#e0f2fe',
            color: '#0369a1',
            padding: '2px 8px',
            borderRadius: '12px',
            fontWeight: 700,
          }}
        >
          {compoundName}
        </span>
      </div>

      {/* Inputs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#64748b', marginBottom: '2px' }}>
            Vial Strength (mg)
          </label>
          <input
            type="number"
            step="any"
            value={vialMg}
            onChange={(e) => setVialMg(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.82rem',
              fontWeight: 700,
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#64748b', marginBottom: '2px' }}>
            Bac Water (ml)
          </label>
          <input
            type="number"
            step="0.5"
            value={diluentMl}
            onChange={(e) => setDiluentMl(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.82rem',
              fontWeight: 700,
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#64748b', marginBottom: '2px' }}>
            Target Dose (mg)
          </label>
          <input
            type="number"
            step="any"
            value={doseMg}
            onChange={(e) => setDoseMg(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.82rem',
              fontWeight: 700,
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Result Indicator Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1.5px solid #0284c7',
          borderRadius: '10px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          boxShadow: '0 2px 6px rgba(2, 132, 199, 0.08)',
        }}
      >
        <div>
          <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700 }}>
            DRAW ON U-100 SYRINGE
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0284c7' }}>
              {calc.u100Units}
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
              UNITS
            </span>
            <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
              ({calc.drawVolumeMl} ml)
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700 }}>
            YIELD PER VIAL
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#16a34a' }}>
            ~{calc.dosesPerVial} doses
          </div>
        </div>
      </div>

      {/* Copy / Apply Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <span style={{ fontSize: '0.70rem', color: '#475569', fontStyle: 'italic', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {instructionText}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          style={{
            padding: '5px 10px',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            fontSize: '0.72rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            flexShrink: 0,
          }}
        >
          <Copy size={12} /> Copy Sig
        </button>
      </div>
    </div>
  );
}
