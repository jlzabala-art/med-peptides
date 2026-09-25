"use client";

import React, { useState } from 'react';
import { Package, Box, Droplets, Copy, Check, ShieldCheck, Activity } from '@/lib/icons';
import { toast } from 'react-hot-toast';
import PublicSectionCard from '@/components/shared/public/PublicSectionCard';

export default function ProtocolSupplyLogisticsCard({
  supplySummary,
  displayDuration,
  t,
  lang = 'en'
}) {
  const isEs = lang === 'es';
  const [copiedBom, setCopiedBom] = useState(false);

  if (!supplySummary) return null;

  const handleCopyBom = async () => {
    const peptideLines = (supplySummary.compounds || []).map((c, i) =>
      `  ${i + 1}. ${c.name} (${c.vialStrength || 'API Vial'}): ${c.vials} ${isEs ? 'viales' : 'vials'} · ${c.cadence} (${c.totalInjections} ${isEs ? 'inyecciones' : 'doses'})`
    ).join('\n');

    const text = `*${isEs ? 'LISTA DE MATERIALES Y DISPENSARIO CLÍNICO (BOM)' : 'CLINICAL DISPENSARY BILL OF MATERIALS (BOM)'}*\n` +
      `${isEs ? 'Ciclo Completo' : 'Full Cycle'}: ${displayDuration}\n` +
      `----------------------------------------\n` +
      `*${isEs ? 'Péptidos Activos Requeridos' : 'Active Peptide Requirements'}:*\n${peptideLines}\n\n` +
      `*${isEs ? 'Consumibles Estériles de Administración' : 'Sterile Administration Consumables'}:*\n` +
      `  • ${isEs ? 'Agua Bacteriostática USP' : 'USP Bacteriostatic Water'}: ${supplySummary.bacVials}x 10 mL\n` +
      `  • ${isEs ? 'Jeringas Estériles U-100' : 'Sterile U-100 Syringes'}: ${supplySummary.syringes} ${isEs ? 'unidades' : 'units'}\n` +
      `  • ${isEs ? 'Toallitas Antisépticas Alcohol 70%' : '70% Isopropyl Alcohol Swabs'}: ${supplySummary.alcoholSwabs} ${isEs ? 'unidades' : 'units'}\n\n` +
      `_Med-Peptides Logistics Engine · SSOT Dispensary Standard_`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedBom(true);
      toast.success(isEs ? 'Lista de materiales copiada al portapapeles ✓' : 'Dispensary BOM copied to clipboard ✓');
      setTimeout(() => setCopiedBom(false), 2000);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  return (
    <PublicSectionCard
      id="cycle-supplies"
      icon={Package}
      category={isEs ? 'DISPENSARIO DEL CICLO & LOGÍSTICA' : 'CYCLE DISPENSARY & LOGISTICS'}
      title={t.sec4Title}
      badge={`${supplySummary.totalVials} ${t.kpiVialsUnit}`}
      badgeVariant="purple"
      rightAction={
        <button
          type="button"
          onClick={handleCopyBom}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '6px',
            backgroundColor: '#ffffff',
            color: '#1e293b',
            fontSize: '0.74rem',
            fontWeight: 700,
            border: '1px solid #cbd5e1',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            transition: 'background 0.15s ease'
          }}
          title={isEs ? 'Copiar lista de materiales y suministros' : 'Copy clinical dispensary BOM'}
        >
          {copiedBom ? <Check size={13} style={{ color: '#16a34a' }} /> : <Copy size={13} />}
          <span>{copiedBom ? (isEs ? 'Copiado ✓' : 'Copied ✓') : (isEs ? 'Copiar Lista BOM' : 'Copy Kit BOM')}</span>
        </button>
      }
    >
      {/* ── Top KPI Metrics Strip (Google Cloud Resource Metrics Standard) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '0.75rem',
        marginBottom: '1.25rem'
      }}>
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '0.75rem 1rem'
        }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            {isEs ? 'Total Viales API' : 'Total API Vials'}
          </div>
          <div style={{ fontSize: '1.30rem', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>
            {supplySummary.totalVials}
          </div>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
            {displayDuration}
          </div>
        </div>

        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '0.75rem 1rem'
        }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            {isEs ? 'Micro-Inyecciones' : 'Micro Injections'}
          </div>
          <div style={{ fontSize: '1.30rem', fontWeight: 800, color: '#0d9488', marginTop: '2px' }}>
            {supplySummary.totalInjections || supplySummary.syringes}
          </div>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
            {isEs ? 'Subcutáneas (SubQ)' : 'Subcutaneous SubQ'}
          </div>
        </div>

        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '0.75rem 1rem'
        }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            {isEs ? 'Solvente Reconst.' : 'BAC Reconstitution'}
          </div>
          <div style={{ fontSize: '1.30rem', fontWeight: 800, color: '#7c3aed', marginTop: '2px' }}>
            {supplySummary.bacVials}x 10 mL
          </div>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
            {isEs ? 'USP 0.9% Benzyl Alc.' : 'USP 0.9% Preserved'}
          </div>
        </div>

        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '0.75rem 1rem'
        }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            {isEs ? 'Estabilidad Acuosa' : 'Aqueous Stability'}
          </div>
          <div style={{ fontSize: '1.30rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
            28 {isEs ? 'Días' : 'Days'}
          </div>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
            2°C – 8°C (No Congelar)
          </div>
        </div>
      </div>

      {/* ── Balanced Resource Ledger (Equalized 2-Column Ledger) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.25rem',
        marginBottom: '1rem'
      }}>
        {/* Active Peptides Column */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Box size={15} color="#0284c7" />
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                {isEs ? 'Péptidos Activos Requeridos' : 'Active Peptide Requirements'}
              </span>
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0284c7', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '1px 6px', borderRadius: '4px' }}>
              {(supplySummary.compounds || []).length} {isEs ? 'Líneas' : 'Items'}
            </span>
          </div>

          <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', flex: 1 }}>
            {(supplySummary.compounds || []).map((c, i) => (
              <div
                key={i}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #f1f5f9',
                  borderRadius: '8px',
                  padding: '0.85rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.90rem' }}>
                    {c.name} {c.vialStrength ? `(${c.vialStrength})` : ''}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                    <span style={{ fontWeight: 600 }}>{isEs ? 'Cadencia:' : 'Cadence:'}</span> {c.cadence}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#0d9488', fontWeight: 600, marginTop: '2px' }}>
                    • {c.totalInjections} {isEs ? 'Microinyecciones programadas' : 'Scheduled micro-injections'}
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '1.20rem', fontWeight: 800, color: '#0284c7' }}>
                    {c.vials} {isEs ? 'Viales' : 'Vials'}
                  </div>
                  <div style={{ fontSize: '0.66rem', color: '#94a3b8', fontWeight: 600 }}>
                    {displayDuration}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sterile Consumables Column */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Droplets size={15} color="#0d9488" />
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                {isEs ? 'Consumibles Estériles de Administración' : 'Sterile Administration Consumables'}
              </span>
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0d9488', background: '#f0fdfa', border: '1px solid #ccfbf1', padding: '1px 6px', borderRadius: '4px' }}>
              Grade USP
            </span>
          </div>

          <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', flex: 1 }}>
            <div style={{
              background: '#f8fafc',
              border: '1px solid #f1f5f9',
              borderRadius: '8px',
              padding: '0.85rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>
                  {isEs ? 'Agua Bacteriostática (BAC)' : 'Bacteriostatic Water (BAC)'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                  {isEs ? 'Solvente preservado USP (2.0 mL por vial API)' : 'USP Preserved Solvent (2.0 mL per API vial)'}
                </div>
              </div>
              <span style={{ fontWeight: 800, color: '#0d9488', fontSize: '1.05rem', flexShrink: 0 }}>
                {supplySummary.bacVials}x 10 mL
              </span>
            </div>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #f1f5f9',
              borderRadius: '8px',
              padding: '0.85rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>
                  {isEs ? 'Jeringas Estériles U-100' : 'Sterile U-100 Insulin Syringes'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                  31G 8mm Ultra-Fine ({isEs ? 'Un Solo Uso Clínico' : 'Single Clinical Use'})
                </div>
              </div>
              <span style={{ fontWeight: 800, color: '#0284c7', fontSize: '1.05rem', flexShrink: 0 }}>
                {supplySummary.syringes} {isEs ? 'Jeringas' : 'Syringes'}
              </span>
            </div>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #f1f5f9',
              borderRadius: '8px',
              padding: '0.85rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>
                  {isEs ? 'Toallitas Antisépticas' : 'Antiseptic Prep Pads'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                  70% Isopropyl Alcohol Swabs
                </div>
              </div>
              <span style={{ fontWeight: 800, color: '#64748b', fontSize: '1.05rem', flexShrink: 0 }}>
                {supplySummary.alcoholSwabs} {isEs ? 'Unidades' : 'Swabs'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer Regulatory Note ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '0.72rem',
        color: '#64748b',
        borderTop: '1px solid #f1f5f9',
        paddingTop: '0.75rem'
      }}>
        <ShieldCheck size={14} color="#0284c7" />
        <span>
          {isEs
            ? 'Los suministros auxiliares están calculados automáticamente en base a eventos de administración semanales y límites de estabilidad acuosa de 28 días.'
            : 'Auxiliary dispensary supplies are automatically calculated based on exact weekly administration events and 28-day aqueous stability limits.'}
        </span>
      </div>
    </PublicSectionCard>
  );
}
