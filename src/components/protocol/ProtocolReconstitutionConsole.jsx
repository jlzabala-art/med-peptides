"use client";

import React from 'react';
import { Syringe } from '@/lib/icons';
import PublicSectionCard from '@/components/shared/public/PublicSectionCard';
import PublicSegmentedControl from '@/components/shared/public/PublicSegmentedControl';

export default function ProtocolReconstitutionConsole({
  reconData = [],
  activeReconTab = 0,
  setActiveReconTab,
  currentRecon,
  lang = 'en'
}) {
  if (!currentRecon) return null;

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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Dilution Specifications */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.65rem' }}>
            {lang === 'es' ? 'Arquitectura de Dilución' : 'Dilution Architecture'} • {currentRecon.name}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.65rem' }}>
              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{lang === 'es' ? 'Contenido Activo de Vial' : 'Vial Active API'}</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{currentRecon.strength}</div>
            </div>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.65rem' }}>
              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{lang === 'es' ? 'Volumen de Diluyente' : 'Diluent Volume'}</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0284c7' }}>{currentRecon.solvent}</div>
            </div>
          </div>
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.70rem', color: '#1e40af', fontWeight: 700 }}>{lang === 'es' ? 'Concentración Resultante' : 'Resulting Concentration'}</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1e3a8a' }}>{currentRecon.concentration}</div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.5 }}>
            <strong>{lang === 'es' ? 'Almacenamiento:' : 'Storage:'}</strong> {currentRecon.storage}
          </div>
        </div>

        {/* Syringe Graduation Scale */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.65rem' }}>
            {lang === 'es' ? 'Unidades en Jeringa U-100 por Fase' : 'Phase-by-Phase Draw Units (U-100 Syringe)'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {(currentRecon.dosingScale || []).map((ds, idx) => (
              <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.85rem' }}>{ds.phase}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{lang === 'es' ? 'Dosis Objetivo:' : 'Target Dose:'} {ds.dose}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0d9488', background: '#f0fdfa', border: '1px solid #ccfbf1', padding: '3px 8px', borderRadius: '6px' }}>
                    {ds.units}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '0.85rem', fontSize: '0.72rem', color: '#64748b' }}>
            ✓ {lang === 'es' ? 'Calibrado para jeringas estándar U-100 de 0.3mL, 0.5mL o 1.0mL (100 unidades = 1.0 mL).' : 'Calibrated for 0.3mL, 0.5mL, or 1.0mL U-100 standard insulin syringes (100 units = 1.0 mL).'}
          </div>
        </div>
      </div>
    </PublicSectionCard>
  );
}
