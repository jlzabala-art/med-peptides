"use client";

import React, { useState, useMemo } from 'react';
import { Syringe, Check, AlertCircle, Droplets, ArrowRight } from '@/lib/icons';
import PublicSectionCard from '@/components/shared/public/PublicSectionCard';
import PublicSegmentedControl from '@/components/shared/public/PublicSegmentedControl';
import SyringeVisualizer from '@/components/SyringeVisualizer';

export default function ProtocolReconstitutionConsole({
  reconData = [],
  activeReconTab = 0,
  setActiveReconTab,
  currentRecon,
  lang = 'en'
}) {
  const [selectedPhaseIdx, setSelectedPhaseIdx] = useState(0);

  // Auto-reset phase index if recon tab changes
  React.useEffect(() => {
    setSelectedPhaseIdx(0);
  }, [activeReconTab, currentRecon?.name]);

  if (!currentRecon) return null;

  const dosingScale = currentRecon.dosingScale || [];
  const activeDosing = dosingScale[selectedPhaseIdx] || dosingScale[0] || null;

  // Extract numeric units from strings like "40 Units (0.40 mL)"
  const numericUnits = useMemo(() => {
    if (!activeDosing?.units) return 40;
    const match = String(activeDosing.units).match(/([0-9.]+)\s*Unit/i);
    return match ? parseFloat(match[1]) : 40;
  }, [activeDosing]);

  // Calculated mL volume (100 U = 1.0 mL)
  const volumeMl = (numericUnits / 100).toFixed(2);
  const isOver100 = numericUnits > 100;

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
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.25rem',
        alignItems: 'stretch'
      }}>
        {/* Column 1: Dilution Specifications */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              color: '#0284c7',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Droplets size={14} />
              <span>{lang === 'es' ? 'Arquitectura de Dilución' : 'Dilution Architecture'} • {currentRecon.name}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '0.85rem' }}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem' }}>
                <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>{lang === 'es' ? 'Contenido Activo de Vial' : 'Vial Active API'}</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{currentRecon.strength}</div>
              </div>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem' }}>
                <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>{lang === 'es' ? 'Volumen Diluyente (BAC)' : 'Diluent Volume (BAC)'}</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>{currentRecon.solvent}</div>
              </div>
            </div>

            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '0.85rem', marginBottom: '0.85rem' }}>
              <div style={{ fontSize: '0.70rem', color: '#1e40af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                {lang === 'es' ? 'Concentración Resultante' : 'Resulting Concentration'}
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1e3a8a', marginTop: '2px' }}>
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
              <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.45 }}>
                {currentRecon.steps[2] || currentRecon.steps[0]}
              </div>
            </div>
          )}
        </div>

        {/* Column 2: Interactive Phase-by-Phase Draw Units */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
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
                {lang === 'es' ? 'Haz clic para simular' : 'Click to preview'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {dosingScale.map((ds, idx) => {
                const isSelected = (selectedPhaseIdx === idx);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedPhaseIdx(idx)}
                    style={{
                      background: isSelected ? '#f0fdfa' : '#ffffff',
                      border: isSelected ? '1.5px solid #0d9488' : '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '0.75rem 0.9rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      textAlign: 'left',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 2px 8px rgba(13, 148, 136, 0.12)' : '0 1px 2px rgba(0,0,0,0.02)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      <div style={{
                        fontWeight: 800,
                        color: isSelected ? '#0f766e' : '#0f172a',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        {isSelected && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0d9488' }} />}
                        <span>{ds.phase}</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                        {lang === 'es' ? 'Dosis Objetivo:' : 'Target Dose:'} <strong style={{ color: '#334155' }}>{ds.dose}</strong>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        fontSize: '0.86rem',
                        fontWeight: 800,
                        color: isSelected ? '#0f766e' : '#0d9488',
                        background: isSelected ? '#ccfbf1' : '#f0fdfa',
                        border: '1px solid #99f6e4',
                        padding: '3px 9px',
                        borderRadius: '6px',
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

        {/* Column 3: High-Precision Interactive Syringe Visualizer */}
        <div style={{
          background: 'linear-gradient(135deg, #090e17 0%, #0f172a 100%)',
          border: '1px solid #1e293b',
          borderRadius: '14px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#ffffff',
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle laboratory ambient glow */}
          <div style={{
            position: 'absolute',
            top: '-20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '180px',
            height: '180px',
            background: 'radial-gradient(circle, rgba(13, 148, 136, 0.25) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          {/* Scientific Calibration Readout Header */}
          <div style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            padding: '0.65rem 0.85rem',
            textAlign: 'center',
            zIndex: 2
          }}>
            <div style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: 'rgba(255, 255, 255, 0.5)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em'
            }}>
              {lang === 'es' ? 'Extracción en Jeringa U-100' : 'U-100 Draw Measurement'} • {activeDosing?.phase || 'Active Phase'}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '4px'
            }}>
              <span style={{
                fontSize: '1.85rem',
                fontWeight: 900,
                color: isOver100 ? '#f87171' : '#34d399',
                fontFamily: 'monospace',
                lineHeight: 1
              }}>
                {numericUnits.toFixed(0)}
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'rgba(255,255,255,0.7)' }}>
                {lang === 'es' ? 'Unidades' : 'Units'}
              </span>
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginLeft: '6px' }}>
                ({volumeMl} mL)
              </span>
            </div>
          </div>

          {/* Syringe SVG Mount */}
          <div style={{
            padding: '1.25rem 0',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            zIndex: 2
          }}>
            <SyringeVisualizer units={numericUnits} />
          </div>

          {/* Warning or Guidance Callout */}
          <div style={{
            width: '100%',
            background: isOver100 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255, 255, 255, 0.03)',
            border: isOver100 ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '8px',
            padding: '0.55rem 0.75rem',
            fontSize: '0.70rem',
            color: isOver100 ? '#fca5a5' : '#94a3b8',
            lineHeight: 1.45,
            zIndex: 2,
            textAlign: 'center'
          }}>
            {isOver100 ? (
              <span>
                ⚠ {lang === 'es'
                  ? `Dosis superior a 100U (1.0 mL). Administrar en 2 inyecciones separadas (${(numericUnits / 2).toFixed(0)}U + ${(numericUnits / 2).toFixed(0)}U) o utilizar menor volumen de diluyente BAC.`
                  : `Dose exceeds 100U (1.0 mL). Split into 2 draws (${(numericUnits / 2).toFixed(0)}U + ${(numericUnits / 2).toFixed(0)}U) or reconstitute in lower BAC volume.`}
              </span>
            ) : (
              <span>
                ✓ {lang === 'es'
                  ? `Alinear la base del émbolo con la marca ${numericUnits.toFixed(0)} de la escala U-100.`
                  : `Align the plunger base with the ${numericUnits.toFixed(0)} line on the U-100 barrel.`}
              </span>
            )}
          </div>
        </div>
      </div>
    </PublicSectionCard>
  );
}
