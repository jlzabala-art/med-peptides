"use client";

import React, { useState } from 'react';
import { Package, Box, Droplets, Copy, Check, ShieldCheck, Activity, Sparkles, Clock } from '@/lib/icons';
import { toast } from 'react-hot-toast';
import PublicSectionCard from '@/components/shared/public/PublicSectionCard';

export default function ProtocolSupplyLogisticsCard({
  supplySummary,
  displayDuration,
  t,
  hasVials = true,
  items = [],
  lang = 'en'
}) {
  const isEs = lang === 'es';
  const [copiedBom, setCopiedBom] = useState(false);

  if (!supplySummary && items.length === 0) return null;

  const handleCopyBom = async () => {
    let text;
    if (hasVials) {
      const peptideLines = (supplySummary.compounds || []).map((c, i) =>
        `  ${i + 1}. ${c.name} (${c.vialStrength || 'API Vial'}): ${c.vials} ${isEs ? 'viales' : 'vials'} · ${c.cadence} (${c.totalInjections} ${isEs ? 'inyecciones' : 'doses'})`
      ).join('\n');

      text = `*${isEs ? 'LISTA DE MATERIALES Y DISPENSARIO CLÍNICO (BOM)' : 'CLINICAL DISPENSARY BILL OF MATERIALS (BOM)'}*\n` +
        `${isEs ? 'Ciclo Completo' : 'Full Cycle'}: ${displayDuration}\n` +
        `----------------------------------------\n` +
        `*${isEs ? 'Péptidos Activos Requeridos' : 'Active Peptide Requirements'}:*\n${peptideLines}\n\n` +
        `*${isEs ? 'Consumibles Estériles de Administración' : 'Sterile Administration Consumables'}:*\n` +
        `  • ${isEs ? 'Agua Bacteriostática USP' : 'USP Bacteriostatic Water'}: ${supplySummary.bacVials}x 10 mL\n` +
        `  • ${isEs ? 'Jeringas Estériles U-100' : 'Sterile U-100 Syringes'}: ${supplySummary.syringes} ${isEs ? 'unidades' : 'units'}\n` +
        `  • ${isEs ? 'Toallitas Antisépticas Alcohol 70%' : '70% Isopropyl Alcohol Swabs'}: ${supplySummary.alcoholSwabs} ${isEs ? 'unidades' : 'units'}\n\n` +
        `_Med-Peptides Logistics Engine · SSOT Dispensary Standard_`;
    } else {
      const itemLines = items.map((it, i) =>
        `  ${i + 1}. ${it.name || it.product_name} — ${it.dosage || it.dose || (it.volume || '1 Envase')} (${it.route || 'Oral/Tópico'})`
      ).join('\n');

      text = `*${isEs ? 'DISPENSARIO CLÍNICO & ESPECIFICACIÓN DE CICLO' : 'CLINICAL DISPENSARY & CYCLE SPECIFICATION'}*\n` +
        `${isEs ? 'Ciclo Completo' : 'Full Cycle'}: ${displayDuration}\n` +
        `----------------------------------------\n` +
        `*${isEs ? 'Fórmulas y Suplementos Requeridos' : 'Required Formulations & Nutricosmetics'}:*\n${itemLines}\n\n` +
        `_Atlas Health Clinical Standards_`;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedBom(true);
      toast.success(isEs ? 'Lista de dispensación copiada al portapapeles ✓' : 'Dispensary BOM copied to clipboard ✓');
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
      title={hasVials ? t.sec4Title : (isEs ? 'Dispensario de Formulación & Suministros del Ciclo' : 'Cycle Formulation & Dispensary Logistics')}
      badge={hasVials ? `${supplySummary?.totalVials || 0} ${t.kpiVialsUnit}` : `${items.length} ${isEs ? 'Formulaciones' : 'Formulations'}`}
      badgeVariant={hasVials ? "purple" : "cyan"}
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
          <span>{copiedBom ? (isEs ? 'Copiado ✓' : 'Copied ✓') : (isEs ? 'Copiar Dispensario' : 'Copy Kit BOM')}</span>
        </button>
      }
    >
      {/* ── Top KPI Metrics Strip (Google Cloud Resource Metrics Standard) ── */}
      <div className="proto-logistics-kpi-grid">
        <div className="proto-kpi-card">
          <div className="proto-kpi-title">
            {hasVials ? (isEs ? 'Total Viales API' : 'Total API Vials') : (isEs ? 'Total Formulaciones' : 'Total Formulations')}
          </div>
          <div className="proto-kpi-value" style={{ color: '#0284c7' }}>
            {hasVials ? supplySummary?.totalVials : items.length}
          </div>
          <div className="proto-kpi-sub">
            {displayDuration}
          </div>
        </div>

        <div className="proto-kpi-card">
          <div className="proto-kpi-title">
            {hasVials ? (isEs ? 'Micro-Inyecciones' : 'Micro Injections') : (isEs ? 'Días de Tratamiento' : 'Active Days')}
          </div>
          <div className="proto-kpi-value" style={{ color: '#0d9488' }}>
            {hasVials ? (supplySummary?.totalInjections || supplySummary?.syringes) : displayDuration}
          </div>
          <div className="proto-kpi-sub">
            {hasVials ? (isEs ? 'Subcutáneas (SubQ)' : 'Subcutaneous SubQ') : (isEs ? 'Pauta Diaria Continua' : 'Daily Regimen')}
          </div>
        </div>

        <div className="proto-kpi-card">
          <div className="proto-kpi-title">
            {hasVials ? (isEs ? 'Solvente Reconst.' : 'BAC Reconstitution') : (isEs ? 'Vía Principal' : 'Primary Delivery')}
          </div>
          <div className="proto-kpi-value" style={{ color: '#7c3aed' }}>
            {hasVials ? `${supplySummary?.bacVials || 1}x 10 mL` : (isEs ? 'Oral / Tópica' : 'Oral / Topical')}
          </div>
          <div className="proto-kpi-sub">
            {hasVials ? (isEs ? 'USP 0.9% Benzyl Alc.' : 'USP 0.9% Preserved') : (isEs ? 'No Inyectable' : 'Non-Invasive')}
          </div>
        </div>

        <div className="proto-kpi-card">
          <div className="proto-kpi-title">
            {hasVials ? (isEs ? 'Estabilidad Acuosa' : 'Aqueous Stability') : (isEs ? 'Conservación' : 'Storage')}
          </div>
          <div className="proto-kpi-value" style={{ color: '#0f172a' }}>
            {hasVials ? `28 ${isEs ? 'Días' : 'Days'}` : (isEs ? 'Ambiente Seco' : 'Dry & Cool')}
          </div>
          <div className="proto-kpi-sub">
            {hasVials ? '2°C – 8°C (No Congelar)' : '< 25°C Proteger de Luz'}
          </div>
        </div>
      </div>

      {/* ── Balanced Resource Ledger ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.25rem',
        marginBottom: '1rem'
      }}>
        {/* Active Products / Formulations Column */}
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
                {hasVials ? (isEs ? 'Péptidos Activos Requeridos' : 'Active Peptide Requirements') : (isEs ? 'Formulaciones Requeridas del Protocolo' : 'Required Formulations')}
              </span>
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0284c7', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '1px 6px', borderRadius: '4px' }}>
              {hasVials ? (supplySummary?.compounds || []).length : items.length} {isEs ? 'Líneas' : 'Items'}
            </span>
          </div>

          <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', flex: 1 }}>
            {hasVials ? (
              (supplySummary?.compounds || []).map((c, i) => (
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
              ))
            ) : (
              items.map((it, i) => (
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
                      {it.name || it.product_name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                      <span style={{ fontWeight: 600 }}>{isEs ? 'Pauta:' : 'Posology:'}</span> {it.dosage || it.dose || '1 unidad estándar'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#0d9488', fontWeight: 600, marginTop: '2px' }}>
                      • {it.timing || (isEs ? 'Aplicación diaria' : 'Daily administration')}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0284c7' }}>
                      {it.volume || it.presentation || (isEs ? '1 Envase' : '1 Unit')}
                    </div>
                    <div style={{ fontSize: '0.66rem', color: '#94a3b8', fontWeight: 600 }}>
                      {it.route || (isEs ? 'Oral/Tópico' : 'Oral/Topical')}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sterile Consumables Column (or Non-Invasive Clinical Assurance for non-vials) */}
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
              {hasVials ? <Droplets size={15} color="#0d9488" /> : <Sparkles size={15} color="#0d9488" />}
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                {hasVials ? (isEs ? 'Consumibles Estériles de Administración' : 'Sterile Administration Consumables') : (isEs ? 'Seguridad & Biodisponibilidad' : 'Delivery & Safety Guarantee')}
              </span>
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0d9488', background: '#f0fdfa', border: '1px solid #ccfbf1', padding: '1px 6px', borderRadius: '4px' }}>
              {hasVials ? 'Grade USP' : 'CPNP / ISO 22716'}
            </span>
          </div>

          <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', flex: 1 }}>
            {hasVials ? (
              <>
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
                    {supplySummary?.bacVials || 1}x 10 mL
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
                    {supplySummary?.syringes || 0} {isEs ? 'Jeringas' : 'Syringes'}
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
                    {supplySummary?.alcoholSwabs || 0} {isEs ? 'Unidades' : 'Swabs'}
                  </span>
                </div>
              </>
            ) : (
              <>
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
                      {isEs ? 'Conformación de Triple Hélice Nativa' : 'Preserved Native Triple-Helix'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                      {isEs ? 'Tropocolágeno biológicamente activo sin desnaturalizar térmicamente' : 'Biologically active tropocollagen without thermal degradation'}
                    </div>
                  </div>
                  <span style={{ fontWeight: 800, color: '#16a34a', fontSize: '0.85rem', flexShrink: 0 }}>
                    {isEs ? 'Certificado' : 'Certified'}
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
                      {isEs ? 'Envases Clínicos Airless & Herméticos' : 'Airless & Hermetic Dispensers'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                      {isEs ? 'Protección contra oxidación y contaminación microbiana' : 'Full oxidation and microbial contamination barrier'}
                    </div>
                  </div>
                  <span style={{ fontWeight: 800, color: '#0284c7', fontSize: '0.85rem', flexShrink: 0 }}>
                    ISO 22716
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
                      {isEs ? 'Tolerancia Cutánea & Gastrointestinal' : 'Cutaneous & Gastrointestinal Safety'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                      {isEs ? 'Testado dermatológicamente • Hipoalergénico' : 'Dermatologically tested • Hypoallergenic'}
                    </div>
                  </div>
                  <span style={{ fontWeight: 800, color: '#0d9488', fontSize: '0.85rem', flexShrink: 0 }}>
                    100% {isEs ? 'Seguro' : 'Safe'}
                  </span>
                </div>
              </>
            )}
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
          {hasVials
            ? (isEs
                ? 'Los suministros auxiliares están calculados automáticamente en base a eventos de administración semanales y límites de estabilidad acuosa de 28 días.'
                : 'Auxiliary dispensary supplies are automatically calculated based on exact weekly administration events and 28-day aqueous stability limits.')
            : (isEs
                ? 'Las cantidades y posologías están estandarizadas conforme a los expedientes de registro CPNP y buenas prácticas de nutricosmética clínica.'
                : 'Formulation quantities and posologies are standardized under European CPNP dossiers and clinical nutricosmetic best practices.')}
        </span>
      </div>
    </PublicSectionCard>
  );
}
