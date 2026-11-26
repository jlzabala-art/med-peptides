'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Calculator, Copy, Syringe, Sparkles, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import PageHeroCard from '@/components/ui/PageHeroCard';
import { usePublicWorkspace } from '@/context/PublicWorkspaceContext';

const PRESETS = [
  { label: 'BPC-157 · 10 mg / 2 mL · 250 mcg', vialMg: 10, diluentMl: 2, targetMcg: 250 },
  { label: 'TB-500 · 10 mg / 2 mL · 2,500 mcg', vialMg: 10, diluentMl: 2, targetMcg: 2500 },
  { label: 'Tirzepatide · 10 mg / 2 mL · 2,500 mcg', vialMg: 10, diluentMl: 2, targetMcg: 2500 },
  { label: 'MOTS-c Pen (3 mL) · 30 mg · 5,000 mcg', vialMg: 30, diluentMl: 3, targetMcg: 5000 },
  { label: 'NAD+ Pen (3 mL) · 750 mg · 50,000 mcg', vialMg: 750, diluentMl: 3, targetMcg: 50000 },
];

export default function PeptideCalculatorClient({ initialLang = 'en' }) {
  const workspace = usePublicWorkspace?.() || {};
  const [localLang, setLocalLang] = useState(initialLang);
  const lang = workspace?.lang || localLang;
  const isEs = lang === 'es';

  const [vialMg, setVialMg] = useState(10);
  const [diluentMl, setDiluentMl] = useState(2);
  const [targetMcg, setTargetMcg] = useState(250);

  const calc = useMemo(() => {
    const mg = Math.max(0.01, Number(vialMg) || 0);
    const ml = Math.max(0.1, Number(diluentMl) || 0);
    const mcg = Math.max(1, Number(targetMcg) || 0);
    const totalMcg = mg * 1000;
    const concMcgMl = totalMcg / ml;
    const drawMl = mcg / concMcgMl;
    const u100Units = drawMl * 100;
    const doses = totalMcg / mcg;
    return {
      totalMcg,
      concMcgMl,
      drawMl,
      u100Units,
      doses,
    };
  }, [vialMg, diluentMl, targetMcg]);

  const handleCopySummary = async () => {
    const text = isEs
      ? `Atlas Peptide Calculator: Vial ${vialMg} mg + ${diluentMl} mL BAC → Dosis ${targetMcg} mcg = ${calc.u100Units.toFixed(1)} unidades U-100 (${calc.drawMl.toFixed(3)} mL) · ${calc.doses.toFixed(1)} dosis totales. https://www.atlashealth-services.com/tools/peptide-calculator`
      : `Atlas Peptide Calculator: ${vialMg} mg vial + ${diluentMl} mL BAC → ${targetMcg} mcg dose = ${calc.u100Units.toFixed(1)} U-100 units (${calc.drawMl.toFixed(3)} mL) · ${calc.doses.toFixed(1)} total doses. https://www.atlashealth-services.com/tools/peptide-calculator`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success(isEs ? 'Cálculo copiado al portapapeles' : 'Dosing calculation copied');
    } catch {
      toast.error('Copy failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: '72px' }}>
      <PublicUnifiedHeader
        track="products"
        lang={lang}
        onLangChange={(next) => {
          setLocalLang(next);
          workspace?.setLang?.(next);
        }}
        brandHref="/"
        loginRedirect="/tools/peptide-calculator"
        breadcrumb={[
          { label: isEs ? 'Guías Clínicas' : 'Clinical Guides', href: '/guides/peptide-reconstitution-dosing' },
          { label: isEs ? 'Calculadora de Péptidos' : 'Peptide Calculator' },
        ]}
      />

      <main className="atlas-page-shell" style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '16px' }}>
        <PageHeroCard
          badge={isEs ? 'Herramienta Clínica Abierta · U-100 & Plumas 3 mL' : 'Open Clinical Tool · U-100 & 3 mL Pens'}
          title={isEs ? 'Calculadora de Reconstitución y Clics de Péptidos' : 'Peptide Reconstitution & Click-Dial Calculator'}
          subtitle={
            isEs
              ? 'Calcula al instante las unidades exactas en jeringa de insulina U-100 (100 UI = 1 mL) o clics en cartucho de 3 mL a partir de la masa del vial y el volumen de agua bacteriostática.'
              : 'Instantly calculate exact U-100 insulin syringe units (100 IU = 1 mL) or 3 mL cartridge dial clicks from vial mass, bacteriostatic water volume, and target dose.'
          }
          actions={
            <button type="button" className="gcp-btn-primary" onClick={handleCopySummary}>
              <Copy size={14} />
              <span>{isEs ? 'Copiar Resultado' : 'Copy Calculation'}</span>
            </button>
          }
        />

        {/* Quick Presets */}
        <section style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              className="gcp-btn-secondary"
              onClick={() => {
                setVialMg(p.vialMg);
                setDiluentMl(p.diluentMl);
                setTargetMcg(p.targetMcg);
              }}
              style={{ fontSize: '0.75rem', padding: '6px 10px' }}
            >
              {p.label}
            </button>
          ))}
        </section>

        {/* Inputs + Results Grid */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '16px' }}>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#0f172a' }}>
              <Calculator size={17} color="#003666" />
              <span>{isEs ? 'Parámetros del Vial o Pluma' : 'Vial or Cartridge Parameters'}</span>
            </div>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.80rem', fontWeight: 700, color: '#334155' }}>
              <span>{isEs ? 'Cantidad total de péptido (mg)' : 'Total peptide in vial / pen (mg)'}</span>
              <input
                type="number"
                min="0.1"
                step="0.5"
                value={vialMg}
                onChange={(e) => setVialMg(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', fontWeight: 700 }}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.80rem', fontWeight: 700, color: '#334155' }}>
              <span>{isEs ? 'Agua bacteriostática / volumen cartucho (mL)' : 'Bacteriostatic water / cartridge volume (mL)'}</span>
              <input
                type="number"
                min="0.1"
                step="0.5"
                value={diluentMl}
                onChange={(e) => setDiluentMl(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', fontWeight: 700 }}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.80rem', fontWeight: 700, color: '#334155' }}>
              <span>{isEs ? 'Dosis objetivo por administración (mcg)' : 'Target dose per administration (mcg)'}</span>
              <input
                type="number"
                min="1"
                step="25"
                value={targetMcg}
                onChange={(e) => setTargetMcg(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', fontWeight: 700 }}
              />
            </label>
          </div>

          <div style={{ background: '#003666', color: '#fff', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#7dd3fc', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Syringe size={14} />
                <span>{isEs ? 'Resultado Exacto (U-100 / Click-Dial)' : 'Exact Dosing Output (U-100 / Click-Dial)'}</span>
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: 850, marginTop: '8px', color: '#ffffff' }}>
                {calc.u100Units.toFixed(1)} {isEs ? 'unidades (UI / clics)' : 'units (IU / clicks)'}
              </div>
              <div style={{ fontSize: '0.86rem', color: '#dbeafe', marginTop: '4px' }}>
                {isEs
                  ? `Volumen a cargar: ${calc.drawMl.toFixed(3)} mL · Concentración: ${calc.concMcgMl.toFixed(0)} mcg/mL`
                  : `Draw volume: ${calc.drawMl.toFixed(3)} mL · Concentration: ${calc.concMcgMl.toFixed(0)} mcg/mL`}
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
              <span>{isEs ? 'Dosis totales por vial / pluma:' : 'Total doses per vial / pen:'}</span>
              <strong>{calc.doses.toFixed(1)}</strong>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Link
                href="/pricing/peptides"
                style={{ background: '#fff', color: '#003666', padding: '8px 13px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 750, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Sparkles size={13} />
                <span>{isEs ? 'Ver Péptidos cGMP' : 'Browse cGMP Peptides'}</span>
                <ArrowRight size={13} />
              </Link>
              <Link
                href="/guides/peptide-protocols-comparison"
                style={{ background: 'rgba(255,255,255,0.14)', color: '#fff', padding: '8px 13px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.25)' }}
              >
                {isEs ? 'Comparativa BPC-157 vs TB-500' : 'Compare Peptide Protocols'}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicUnifiedFooter />
    </div>
  );
}
