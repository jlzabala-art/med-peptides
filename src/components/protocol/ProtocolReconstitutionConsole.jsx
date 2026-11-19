"use client";

import React, { useState, useMemo } from 'react';
import { Syringe, Droplets } from '@/lib/icons';
import PublicSectionCard from '@/components/shared/public/PublicSectionCard';
import PublicSegmentedControl from '@/components/shared/public/PublicSegmentedControl';
import HorizontalSyringeVisualizer from '@/components/reconstitution/HorizontalSyringeVisualizer';

/**
 * ProtocolReconstitutionConsole
 * ─────────────────────────────────────────────────────────────────────────────
 * Interactive reconstitution & calibrated horizontal U-100 syringe console.
 * Styled to perfectly harmonize with the clean clinical aesthetic of the protocol guide.
 *
 * Features:
 * - Two top cards: (1) Dilution Architecture (API & BAC volume) and (2) Phase-by-Phase Draw Selector.
 * - Full-width horizontal U-100 syringe visualizer spanning 100% available container width.
 * - Precision medical graduation scale (0 to 100 Units, with 2U, 5U, and 10U ticks).
 * - Smooth animated plunger draw & liquid fill matching the selected phase.
 * - Dynamic laser alignment guide showing exact volumetric target (e.g. 12 Units · 0.12 mL).
 * - Cohesive clinical palette (clean whites, slate borders, brand corporate blue #003666 and teal #0d9488).
 */

export default function ProtocolReconstitutionConsole({
  reconData = [],
  activeReconTab = 0,
  setActiveReconTab,
  currentRecon,
  lang = 'en'
}) {
  const [selectedPhaseIdx, setSelectedPhaseIdx] = useState(0);
  const [prevTabKey, setPrevTabKey] = useState(() => `${activeReconTab}-${currentRecon?.name || ''}`);

  const currentTabKey = `${activeReconTab}-${currentRecon?.name || ''}`;
  if (prevTabKey !== currentTabKey) {
    setPrevTabKey(currentTabKey);
    setSelectedPhaseIdx(0);
  }

  const dosingScale = currentRecon?.dosingScale || [];
  const activeDosing = dosingScale[selectedPhaseIdx] || dosingScale[0] || null;

  // Extract numeric units from strings like "12 Units (0.12 mL)" or "40 Units"
  const numericUnits = useMemo(() => {
    if (!activeDosing?.units) return 40;
    const match = String(activeDosing.units).match(/([0-9.]+)\s*Unit/i);
    return match ? parseFloat(match[1]) : 40;
  }, [activeDosing]);

  if (!currentRecon) return null;

  // Calculated mL volume (100 U = 1.0 mL)
  const volumeMl = (numericUnits / 100).toFixed(2);

  return (
    <PublicSectionCard
      id="reconstitution-console"
      icon={Syringe}
      category={lang === 'es' ? 'CONSOLA DE RECONSTITUCIÓN' : 'RECONSTITUTION CONSOLE'}
      title={lang === 'es' ? 'Consola Interactiva de Reconstitución & Calibración de Jeringa' : 'Interactive Reconstitution & Syringe Calibration Console'}
      badge={lang === 'es' ? 'Calibrado U-100' : 'U-100 Calibrated'}
      badgeVariant="cyan"
      rightAction={
        reconData.length > 1 ? (
          <PublicSegmentedControl
            size="sm"
            items={reconData.map((rd, idx) => ({ id: idx, label: rd.name }))}
            activeId={activeReconTab}
            onChange={setActiveReconTab}
          />
        ) : null
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* ── TOP ROW: Dilution Architecture (Left) + Phase Draw Selector (Right) ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.25rem',
          alignItems: 'stretch'
        }}>
          {/* Column 1: Dilution Architecture */}
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #e2e8f0',
            borderRadius: '14px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <div>
              <div style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                color: '#0284c7',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Droplets size={15} />
                <span>{lang === 'es' ? 'Arquitectura de Dilución' : 'Dilution Architecture'} • {currentRecon.name}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
                    {lang === 'es' ? 'Contenido Activo de Vial' : 'Vial Active API'}
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    {currentRecon.strength}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
                    {lang === 'es' ? 'Volumen Agua BAC' : 'BAC Diluent Volume'}
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0d9488', marginTop: '2px' }}>
                    {currentRecon.bacVolume}
                  </div>
                </div>
              </div>

              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '0.85rem', marginBottom: '0.85rem' }}>
                <div style={{ fontSize: '0.70rem', color: '#1e40af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  {lang === 'es' ? 'Concentración Resultante' : 'Resulting Concentration'}
                </div>
                <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#1e3a8a', marginTop: '2px' }}>
                  {currentRecon.concentration}
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.55 }}>
                <strong style={{ color: '#0f172a' }}>{lang === 'es' ? 'Almacenamiento:' : 'Storage:'}</strong> {currentRecon.storage}
              </div>
            </div>

            {currentRecon.steps && currentRecon.steps.length > 0 && (
              <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px dashed #cbd5e1' }}>
                <div style={{ fontSize: '0.70rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  {lang === 'es' ? 'Técnica de Reconstitución' : 'Reconstitution Technique'}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#475569', lineHeight: 1.45 }}>
                  {currentRecon.steps[2] || currentRecon.steps[0]}
                </div>
              </div>
            )}
          </div>

          {/* Column 2: Interactive Phase-by-Phase Draw Units */}
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #e2e8f0',
            borderRadius: '14px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <div>
              <div style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                color: '#0d9488',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span>{lang === 'es' ? 'Calibración por Fase' : 'Phase-by-Phase Draw Units'}</span>
                <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'none' }}>
                  {lang === 'es' ? 'Haz clic para simular' : 'Click to inspect draw'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {dosingScale.map((ds, idx) => {
                  const isSelected = selectedPhaseIdx === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedPhaseIdx(idx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.8rem 1rem',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid #0d9488' : '1px solid #e2e8f0',
                        background: isSelected ? '#f0fdfa' : '#f8fafc',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 2px 6px rgba(13, 148, 136, 0.12)' : 'none'
                      }}
                    >
                      <div>
                        <div style={{
                          fontWeight: isSelected ? 800 : 700,
                          color: isSelected ? '#0f766e' : '#0f172a',
                          fontSize: '0.88rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          {isSelected && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#0d9488' }} />}
                          <span>{ds.phase}</span>
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                          {lang === 'es' ? 'Dosis Objetivo:' : 'Target Dose:'} <strong style={{ color: '#334155' }}>{ds.dose}</strong>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          fontSize: '0.90rem',
                          fontWeight: 800,
                          color: isSelected ? '#0f766e' : '#0d9488',
                          background: isSelected ? '#ccfbf1' : '#ffffff',
                          border: isSelected ? '1.5px solid #0d9488' : '1px solid #cbd5e1',
                          padding: '4px 10px',
                          borderRadius: '7px',
                          display: 'inline-block'
                        }}>
                          {ds.units}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: '0.85rem', fontSize: '0.72rem', color: '#64748b', lineHeight: 1.45 }}>
              ✓ {lang === 'es' ? 'Calibrado para jeringas estándar U-100 de insulina (100 Unidades = 1.0 mL).' : 'Calibrated for standard U-100 insulin syringes (100 Units = 1.0 mL).'}
            </div>
          </div>
        </div>

        {/* ── FULL-WIDTH HORIZONTAL SYRINGE VISUALIZER (SHARED REUSABLE COMPONENT) ── */}
        <HorizontalSyringeVisualizer
          units={numericUnits}
          maxUnits={100}
          volumeMl={Number(volumeMl)}
          headingLabel={`${lang === 'es' ? 'Medición de Extracción en Jeringa U-100' : 'U-100 Draw Measurement'} • ${activeDosing?.phase || 'Active Phase'}`}
          subLabel={activeDosing?.dose ? `${lang === 'es' ? 'Dosis prescrita' : 'Target Dose'}: ${activeDosing.dose}` : currentRecon.name}
          lang={lang}
        />
      </div>
    </PublicSectionCard>
  );
}

