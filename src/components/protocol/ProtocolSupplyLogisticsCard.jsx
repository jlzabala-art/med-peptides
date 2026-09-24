"use client";

import React from 'react';
import { Package, Box, Droplets } from '@/lib/icons';
import PublicSectionCard from '@/components/shared/public/PublicSectionCard';

export default function ProtocolSupplyLogisticsCard({
  supplySummary,
  displayDuration,
  t,
  lang = 'en'
}) {
  if (!supplySummary) return null;

  return (
    <PublicSectionCard
      id="cycle-supplies"
      icon={Package}
      category={lang === 'es' ? 'DISPENSARIO DEL CICLO' : 'CYCLE DISPENSARY'}
      title={t.sec4Title}
      badge={`${supplySummary.totalVials} ${t.kpiVialsUnit}`}
      badgeVariant="purple"
      rightAction={
        <span style={{ fontSize: '0.74rem', color: '#c4b5fd', fontWeight: 600 }}>
          {lang === 'es' ? `Asignación Completa · ${displayDuration}` : `Full Cycle · ${displayDuration}`}
        </span>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
        {/* Peptide Supply Breakdown */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.15rem' }}>
          <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Box size={14} color="#0284c7" />
            <span>{lang === 'es' ? 'Requerimientos de Péptidos Activos' : 'Active Peptide Requirements'}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {(supplySummary.compounds || []).map((c, i) => (
              <div key={i} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.90rem' }}>{c.name} ({c.vialStrength})</div>
                  <div style={{ fontSize: '0.70rem', color: '#64748b' }}>{lang === 'es' ? 'Cadencia:' : 'Cadence:'} {c.cadence}</div>
                  <div style={{ fontSize: '0.70rem', color: '#0d9488', fontWeight: 600, marginTop: '2px' }}>{c.totalInjections} {lang === 'es' ? 'Microinyecciones' : 'Micro-Dose Injections'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0284c7' }}>{c.vials} {lang === 'es' ? 'Viales' : 'Vials'}</div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>{displayDuration}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sterile Ancillary Consumables */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.15rem' }}>
          <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Droplets size={14} color="#0d9488" />
            <span>{lang === 'es' ? 'Consumibles Estériles de Administración' : 'Sterile Administration Consumables'}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>{lang === 'es' ? 'Agua Bacteriostática (BAC)' : 'Bacteriostatic Water (BAC)'}</div>
                <div style={{ fontSize: '0.70rem', color: '#64748b' }}>{lang === 'es' ? 'Solvente preservado USP (2.0 mL por vial)' : 'USP Preserved Solvent (2.0 mL per vial)'}</div>
              </div>
              <span style={{ fontWeight: 800, color: '#0d9488', fontSize: '0.95rem' }}>{supplySummary.bacVials}x 10 mL</span>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>{lang === 'es' ? 'Jeringas Estériles U-100' : 'Sterile U-100 Insulin Syringes'}</div>
                <div style={{ fontSize: '0.70rem', color: '#64748b' }}>31G 8mm Ultra-Fine ({lang === 'es' ? 'Uso único' : 'Single Use'})</div>
              </div>
              <span style={{ fontWeight: 800, color: '#0284c7', fontSize: '0.95rem' }}>{supplySummary.syringes} {lang === 'es' ? 'Jeringas' : 'Syringes'}</span>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>{lang === 'es' ? 'Toallitas Antisépticas' : 'Antiseptic Prep Pads'}</div>
                <div style={{ fontSize: '0.70rem', color: '#64748b' }}>70% Isopropyl Alcohol Swabs</div>
              </div>
              <span style={{ fontWeight: 800, color: '#64748b', fontSize: '0.95rem' }}>{supplySummary.alcoholSwabs} {lang === 'es' ? 'Unidades' : 'Swabs'}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ fontSize: '0.70rem', color: '#64748b', fontStyle: 'italic', borderTop: '1px solid #f1f5f9', paddingTop: '0.65rem' }}>
        {lang === 'es' 
          ? 'ℹ️ Nota: Los suministros auxiliares están calculados automáticamente en base a eventos de administración semanales y límites de estabilidad acuosa de 28 días.'
          : 'ℹ️ Note: Auxiliary supplies are automatically calculated based on exact weekly administration events and 28-day aqueous stability limits.'}
      </div>
    </PublicSectionCard>
  );
}
