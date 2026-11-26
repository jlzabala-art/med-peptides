'use client';

import React from 'react';
import { Lock, Calculator } from '@/lib/icons';
import { usePatientDoseCalculator } from '@/hooks/usePatientDoseCalculator';
import ReconstitutionGuideCard from './ReconstitutionGuideCard';

/**
 * PatientExactDoseCard
 * Locked, read-only dosing breakdown tailored to the patient's purchased item.
 * Never exposes editable inputs to prevent accidental dosing miscalculations.
 */
export default function PatientExactDoseCard({
  item = {},
  rx = {},
  isEs = false,
}) {
  const calc = usePatientDoseCalculator(item, rx, isEs);

  if (!calc.needsCalculator) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
      <div
        style={{
          background: '#f8fbff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <Calculator size={15} color="#1a73e8" />
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#202124' }}>
              {isEs ? 'Guía Exacta de Dosis' : 'Exact Dose Guide'}
            </span>
          </div>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.68rem',
              fontWeight: 700,
              color: '#1967d2',
              background: '#e8f0fe',
              border: '1px solid #d2e3fc',
              padding: '2px 8px',
              borderRadius: '999px',
            }}
          >
            <Lock size={10} />
            <span>{isEs ? 'Calculado para tu receta' : 'Locked to your prescription'}</span>
          </span>
        </div>

        <style>{`
          .atlas-dose-calc-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 8px;
          }
          @media (max-width: 640px) {
            .atlas-dose-calc-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 7px;
            }
            .atlas-dose-calc-card--hero {
              grid-column: 1 / -1;
              order: -1;
            }
          }
        `}</style>
        <div className="atlas-dose-calc-grid">
          {calc.cards.map((card, idx) => (
            <div
              key={idx}
              className={card.highlight ? 'atlas-dose-calc-card--hero' : ''}
              style={{
                background: '#ffffff',
                border: card.highlight ? '1.5px solid #1a73e8' : '1px solid #dadce0',
                borderRadius: '8px',
                padding: '9px 11px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#5f6368' }}>
                {card.label}
              </span>
              <span style={{ fontSize: '0.96rem', fontWeight: 800, color: card.highlight ? '#1a73e8' : '#202124' }}>
                {card.value}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#5f6368' }}>
                {card.sub}
              </span>
            </div>
          ))}
        </div>

        {calc.fillPct !== null && calc.scaleLabel && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '0.70rem', fontWeight: 600, color: '#5f6368' }}>
              {calc.scaleLabel}
            </div>
            <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${calc.fillPct}%`,
                  height: '100%',
                  background: '#1a73e8',
                  borderRadius: '999px',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {calc.requiresMixingSteps && (
        <ReconstitutionGuideCard
          productName={item.title}
          vialDoseMg={calc.vialDoseMg || 5}
          diluentVolumeMl={calc.diluentVolumeMl || 2.0}
          prescribedDoseMcg={calc.prescribedDoseMcg || 250}
          lang={isEs ? 'es' : 'en'}
          initiallyExpanded={false}
        />
      )}
    </div>
  );
}
