"use client";

import React, { useMemo } from 'react';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import AlgoliaEntityPicker from '@/components/shared/AlgoliaEntityPicker';
import FormatPickerCards from '@/components/reconstitution/FormatPickerCards';
import HorizontalSyringeVisualizer from '@/components/reconstitution/HorizontalSyringeVisualizer';
import PenDialVisualizer from '@/components/reconstitution/PenDialVisualizer';
import { useAlgoliaPeptideSelector, extractStrengthsFromHit } from '@/hooks/useAlgoliaPeptideSelector';
import { useReconstitution } from '@/hooks/useReconstitution';
import {
  Copy,
  Check,
  QrCode,
  Droplets,
  Syringe,
  Sliders,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
} from '@/lib/icons';

const BAC_WATER_PRESETS = [1.0, 1.5, 2.0, 2.5, 3.0];
const SYRINGE_SIZES = [
  { ml: 0.3, units: 30, label: '0.3 mL (30U)' },
  { ml: 0.5, units: 50, label: '0.5 mL (50U)' },
  { ml: 1.0, units: 100, label: '1.0 mL (100U)' },
];

export default function CalculatorClient() {
  const {
    lang,
    isEs,
    handleLangChange,
    selectedProduct,
    formatId,
    setFormatId,
    activeFormat,
    selectedStrengthStr,
    setSelectedStrengthStr,
    availableStrengths,
    selectedStrength,
    searchQuery,
    setSearchQuery,
    handleSelectPeptideHit,
    shareFullUrl,
    copiedLink,
    handleCopyShareUrl,
    handleOpenQr,
    formatOptions,
    quickPeptides,
  } = useAlgoliaPeptideSelector({ syncUrl: true });

  const productObj = useMemo(
    () => ({
      id: selectedProduct.id,
      slug: selectedProduct.slug,
      name: selectedProduct.name,
      dosage: selectedStrength.name,
    }),
    [selectedProduct, selectedStrength]
  );

  const recon = useReconstitution(productObj, selectedStrength, {
    format: formatId,
    autoSyncStarterDose: true,
    initialGuidedMode: true,
  });

  const protocolSteps = useMemo(() => recon.getProtocolSteps(lang), [recon, lang]);

  const breadcrumbItems = useMemo(() => [
    { label: isEs ? 'Inicio' : 'Home', href: '/' },
    { label: isEs ? 'Guía Visual de Dosis' : 'Visual Dosing Guide' },
  ], [isEs]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a' }}>
      {/* ── 100% PUBLIC GOOGLE CLOUD CONSOLE HEADER (EN Default · Full ES · Zero Admin Chrome) ── */}
      <PublicUnifiedHeader
        purePublic={true}
        lang={lang}
        onLangChange={handleLangChange}
        copyUrl={shareFullUrl}
        breadcrumb={breadcrumbItems}
      />

      {/* ── COMPACT PATIENT-FRIENDLY HERO HEADER ── */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #dadce0' }}>
        <div style={{
          maxWidth: '1080px',
          margin: '0 auto',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#003666', letterSpacing: '-0.015em' }}>
                {recon.isCartridge
                  ? (isEs ? 'Guía Visual · Cartucho de Recambio (3 mL)' : 'Visual Guide · 3 mL Refill Cartridge')
                  : recon.isPen
                  ? (isEs ? 'Guía Visual · Pluma Precargada (3 mL)' : 'Visual Guide · Pre-filled Injector Pen')
                  : (isEs ? 'Guía Visual de Reconstitución y Dosis' : 'Peptide Reconstitution & Dosing Guide')}
              </h1>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '999px',
                background: '#f0fdf4',
                color: '#16a34a',
                border: '1px solid #bbf7d0',
              }}>
                {isEs ? 'Guía para Pacientes' : 'Patient-Friendly Guide'}
              </span>
            </div>
            <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#5f6368' }}>
              {isEs
                ? '3 pasos simples: elige tu péptido, tu formato y visualiza exactamente cuánto cargar o marcar.'
                : '3 simple steps: pick your peptide, pick your format, and see exactly how much to draw or dial.'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleOpenQr}
              className="gcp-btn-secondary"
              style={{ padding: '7px 12px', fontSize: '0.76rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <QrCode size={14} />
              <span>{isEs ? 'Código QR' : 'Share QR'}</span>
            </button>
            <button
              type="button"
              onClick={handleCopyShareUrl}
              className="gcp-btn-primary"
              style={{ padding: '7px 14px', fontSize: '0.76rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {copiedLink ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedLink ? (isEs ? 'Enlace Copiado' : 'Link Copied') : (isEs ? 'Compartir Guía' : 'Share This Guide')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN 3-STEP PATIENT WORKFLOW ── */}
      <main style={{ maxWidth: '1080px', margin: '0 auto', padding: '1.25rem 1.25rem 6.5rem', display: 'flex', flexDirection: 'column', gap: '18px' }}>

        {/* ── STEP 1: PICK PEPTIDE (ALGOLIA) & STRENGTH ── */}
        <section style={{
          background: '#ffffff',
          border: '1px solid #dadce0',
          borderRadius: '14px',
          padding: '1.15rem 1.25rem',
          boxShadow: '0 1px 3px rgba(60,64,67,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#1a73e8', color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.76rem', fontWeight: 800 }}>1</span>
              <h2 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
                {isEs ? 'Elige tu Péptido y Concentración' : 'Pick Your Peptide & Strength'}
              </h2>
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1a73e8', background: '#e8f0fe', padding: '3px 10px', borderRadius: '999px' }}>
              {selectedProduct.name} · {selectedStrength.name}
            </span>
          </div>

          <AlgoliaEntityPicker
            indexName="products"
            value={searchQuery}
            onChange={setSearchQuery}
            onSelect={(hit, preferredDose) => handleSelectPeptideHit(hit, preferredDose)}
            fallbackItems={quickPeptides}
            placeholder={isEs ? 'Buscar péptido (BPC-157, Tirzepatide, Retatrutide, TB-500...)' : 'Search peptide (BPC-157, Tirzepatide, Retatrutide, TB-500...)'}
            headerLabel={isEs ? 'Resultados Algolia · Catálogo Atlas' : 'Algolia Matches · Atlas Catalog'}
            fallbackHeaderLabel={isEs ? 'Péptidos Más Utilizados' : 'Popular Peptides'}
            storageNamespace="calculator-algolia"
            hitsPerPage={12}
            isEs={isEs}
            sortHits={(list) =>
              [...list]
                .sort((a, b) => {
                  const aLotus = String(a.supplierId || a.supplier || '').toLowerCase().includes('lotus') ? 1 : 0;
                  const bLotus = String(b.supplierId || b.supplier || '').toLowerCase().includes('lotus') ? 1 : 0;
                  return bLotus - aLotus;
                })
                .slice(0, 8)
            }
            renderItem={(item, pick) => {
              const itemStrengths = Array.isArray(item.strengths) ? item.strengths : extractStrengthsFromHit(item);
              const itemName = item.name || item.title || 'Peptide';
              return (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  padding: '8px 10px',
                  borderBottom: '1px solid #f1f5f9',
                }}>
                  <button
                    type="button"
                    onClick={() => pick(null)}
                    style={{ border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', padding: 0, fontWeight: 700, fontSize: '0.86rem', color: '#0f172a' }}
                  >
                    {itemName}
                  </button>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {itemStrengths.slice(0, 5).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => pick(st)}
                        style={{
                          border: '1px solid #cbd5e1',
                          background: '#f8fafc',
                          color: '#334155',
                          borderRadius: '6px',
                          padding: '3px 8px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              );
            }}
          />

          {/* Quick-tap popular peptides + strength selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                {isEs ? 'Frecuentes:' : 'Quick Pick:'}
              </span>
              {quickPeptides.slice(0, 6).map((p) => {
                const active = selectedProduct.slug === p.slug;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPeptideHit(p, p.strengths[1] || p.strengths[0])}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '999px',
                      border: active ? '1.5px solid #1a73e8' : '1px solid #e2e8f0',
                      background: active ? '#e8f0fe' : '#f8fafc',
                      color: active ? '#1a73e8' : '#334155',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                {recon.isCartridge
                  ? (isEs ? 'Concentración Cartucho:' : 'Cartridge Strength:')
                  : recon.isPen
                  ? (isEs ? 'Concentración Pluma:' : 'Pen Strength:')
                  : (isEs ? 'Concentración Vial:' : 'Vial Strength:')}
              </span>
              {availableStrengths.map((st) => {
                const active = selectedStrengthStr === st.name;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSelectedStrengthStr(st.name)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '8px',
                      border: active ? '1.5px solid #003666' : '1px solid #cbd5e1',
                      background: active ? '#003666' : '#ffffff',
                      color: active ? '#ffffff' : '#334155',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {st.name}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── STEP 2: PICK DELIVERY FORMAT (3 ILLUSTRATED CARDS) ── */}
        <section style={{
          background: '#ffffff',
          border: '1px solid #dadce0',
          borderRadius: '14px',
          padding: '1.15rem 1.25rem',
          boxShadow: '0 1px 3px rgba(60,64,67,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#1a73e8', color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.76rem', fontWeight: 800 }}>2</span>
            <h2 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
              {isEs ? '¿Cómo recibiste tu péptido?' : 'Which format do you have?'}
            </h2>
          </div>

          <FormatPickerCards
            options={formatOptions}
            activeFormatId={formatId}
            onSelectFormat={setFormatId}
            lang={lang}
          />
        </section>

        {/* ── STEP 3: YOUR EXACT DOSE + ULTRA-GRAPHIC VISUALIZER ── */}
        <section style={{
          background: '#ffffff',
          border: '1px solid #dadce0',
          borderRadius: '14px',
          padding: '1.15rem 1.25rem',
          boxShadow: '0 1px 3px rgba(60,64,67,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#16a34a', color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.76rem', fontWeight: 800 }}>3</span>
              <h2 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
                {recon.isPenOrCartridge
                  ? (isEs ? 'Tu Dosis Prescrita y Clics Exactos' : 'Your Prescribed Dose & Exact Dial Clicks')
                  : (isEs ? 'Tu Dosis Prescrita y Marca en Jeringa' : 'Your Prescribed Dose & Syringe Mark')}
              </h2>
            </div>

            {recon.isVial && (
              <button
                type="button"
                onClick={() => recon.setGuidedMode(!recon.guidedMode)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 11px',
                  borderRadius: '999px',
                  border: '1px solid #cbd5e1',
                  background: recon.guidedMode ? '#f0fdf4' : '#eff6ff',
                  color: recon.guidedMode ? '#15803d' : '#1d4ed8',
                  fontSize: '0.73rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <Sliders size={13} />
                <span>
                  {recon.guidedMode
                    ? (isEs ? `Modo Guiado (${recon.recommendedBacWaterMl.toFixed(1)} mL BAC) · Personalizar` : `Safe Guided (${recon.recommendedBacWaterMl.toFixed(1)} mL BAC) · Customize`)
                    : (isEs ? 'Volver a Modo Guiado Seguro' : 'Switch to Safe Guided Mode')}
                </span>
              </button>
            )}
          </div>

          {/* Dose Picker Controls */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: recon.isVial ? 'repeat(auto-fit, minmax(260px, 1fr))' : '1fr',
            gap: '14px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '14px',
          }}>
            {/* Prescribed Dose Input + Presets */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#334155', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <CheckCircle2 size={14} color="#1a73e8" />
                  <span>{isEs ? 'Dosis por aplicación:' : 'Dose per injection:'}</span>
                </span>
                <div style={{ display: 'inline-flex', background: '#e2e8f0', borderRadius: '6px', padding: '2px' }}>
                  {['mcg', 'mg'].map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => recon.setDoseUnit(u)}
                      style={{
                        border: 'none',
                        padding: '3px 10px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: recon.doseUnit === u ? '#ffffff' : 'transparent',
                        color: recon.doseUnit === u ? '#003666' : '#64748b',
                      }}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {recon.dosePresets.map((val) => {
                  const active = Number(recon.doseDisplayValue) === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => recon.setDoseDisplayValue(val)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: active ? '1.5px solid #1a73e8' : '1px solid #cbd5e1',
                        background: active ? '#e8f0fe' : '#ffffff',
                        color: active ? '#1a73e8' : '#334155',
                        fontSize: '0.80rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {val} {recon.doseUnit}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                <button
                  type="button"
                  onClick={() => recon.setDoseDisplayValue((prev) => Math.max(0.05, +(Number(prev) - (recon.doseUnit === 'mg' ? 0.25 : 50)).toFixed(2)))}
                  style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  −
                </button>
                <div style={{ position: 'relative', flex: 1, maxWidth: '160px' }}>
                  <input
                    type="number"
                    inputMode="decimal"
                    step={recon.doseUnit === 'mg' ? '0.1' : '25'}
                    min="0.05"
                    value={recon.doseDisplayValue}
                    onChange={(e) => recon.setDoseDisplayValue(Math.max(0, parseFloat(e.target.value) || 0))}
                    style={{ width: '100%', height: '36px', padding: '0 44px 0 12px', borderRadius: '8px', border: '1.5px solid #93c5fd', fontSize: '0.95rem', fontWeight: 800, fontFamily: 'monospace', boxSizing: 'border-box' }}
                  />
                  <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>
                    {recon.doseUnit}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => recon.setDoseDisplayValue((prev) => +(Number(prev) + (recon.doseUnit === 'mg' ? 0.25 : 50)).toFixed(2))}
                  style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  +
                </button>
                <span style={{ fontSize: '0.74rem', color: '#15803d', fontWeight: 700, marginLeft: 'auto' }}>
                  ~{recon.totalDoses} {isEs ? 'dosis totales' : 'total doses'}
                </span>
              </div>
            </div>

            {/* Vial-ONLY controls: BAC Water & Syringe Size (Hidden completely on Pen/Cartridge!) */}
            {recon.isVial && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderLeft: '1px solid #e2e8f0', paddingLeft: '14px' }}>
                <div>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Droplets size={14} color="#0284c7" />
                    <span>
                      {isEs ? 'Agua Bacteriostática (BAC):' : 'Bacteriostatic (BAC) Water:'}{' '}
                      <strong style={{ color: '#0284c7' }}>{recon.bacWaterMl.toFixed(1)} mL</strong>
                    </span>
                  </div>
                  {!recon.guidedMode ? (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {BAC_WATER_PRESETS.map((ml) => (
                        <button
                          key={ml}
                          type="button"
                          onClick={() => recon.setBacWaterMl(ml)}
                          style={{
                            padding: '5px 10px',
                            borderRadius: '7px',
                            border: recon.bacWaterMl === ml ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                            background: recon.bacWaterMl === ml ? '#e0f2fe' : '#ffffff',
                            color: recon.bacWaterMl === ml ? '#0369a1' : '#334155',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {ml.toFixed(1)} mL
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                      {isEs
                        ? `Volumen recomendado automáticamente para un vial de ${selectedStrength.name} (${recon.concentrationMgMl} mg/mL).`
                        : `Auto-selected optimal volume for a ${selectedStrength.name} vial (${recon.concentrationMgMl} mg/mL).`}
                    </div>
                  )}
                </div>

                <div>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Syringe size={14} color="#0d9488" />
                    <span>{isEs ? 'Tamaño de tu jeringa U-100:' : 'Your U-100 syringe size:'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {SYRINGE_SIZES.map((s) => (
                      <button
                        key={s.ml}
                        type="button"
                        onClick={() => recon.setSyringeCapacityMl(s.ml)}
                        style={{
                          padding: '5px 10px',
                          borderRadius: '7px',
                          border: recon.syringeCapacityMl === s.ml ? '1.5px solid #0d9488' : '1px solid #cbd5e1',
                          background: recon.syringeCapacityMl === s.ml ? '#f0fdfa' : '#ffffff',
                          color: recon.syringeCapacityMl === s.ml ? '#0f766e' : '#334155',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── GRAPHIC VISUALIZER (REUSED FROM PROTOCOLS FOR VIAL · DEDICATED DIAL + PHASE 1 FOR PEN/CARTRIDGE) ── */}
          {recon.isVial ? (
            <HorizontalSyringeVisualizer
              units={recon.unitsToInject}
              maxUnits={recon.maxSyringeUnits}
              volumeMl={recon.volumeMl}
              headingLabel={`${selectedProduct.name} (${selectedStrength.name} + ${recon.bacWaterMl.toFixed(1)} mL BAC)`}
              subLabel={isEs
                ? `Para ${recon.doseDisplayValue} ${recon.doseUnit} → llena hasta la marca ${Math.round(recon.unitsToInject)}`
                : `For ${recon.doseDisplayValue} ${recon.doseUnit} → draw to the ${Math.round(recon.unitsToInject)} mark`}
              lang={lang}
            />
          ) : (
            <PenDialVisualizer
              penClicks={recon.penClicks}
              volumeMl={recon.volumeMl}
              totalDoses={recon.totalDoses}
              strengthLabel={selectedStrength.name}
              isCartridge={recon.isCartridge}
              lang={lang}
            />
          )}

          {/* ── STEP-BY-STEP VISUAL INSTRUCTIONS ── */}
          <div style={{ marginTop: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <Sparkles size={15} color="#003666" />
              <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#003666' }}>
                {recon.isCartridge
                  ? (isEs ? 'Paso a Paso · Carga de Cartucho (3 mL) y Aplicación' : 'Step-by-Step · 3 mL Cartridge Loading & Injection')
                  : recon.isPen
                  ? (isEs ? 'Paso a Paso · Cómo Usar tu Pluma Precargada' : 'Step-by-Step · How to Use Your Pre-filled Pen')
                  : (isEs ? 'Paso a Paso · Cómo Mezclar y Cargar tu Vial' : 'Step-by-Step · How to Mix & Draw Your Vial')}
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
              {protocolSteps.map((s) => (
                <div
                  key={s.step}
                  style={{
                    background: s.highlight ? '#f0fdf4' : '#f8fafc',
                    border: s.highlight ? '1.5px solid #86efac' : '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: s.highlight ? '#16a34a' : '#003666',
                      color: '#ffffff',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      flexShrink: 0,
                    }}>
                      {s.step}
                    </span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.25 }}>
                      {s.title}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: '#475569', lineHeight: 1.5 }}>
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Patient Safety Footer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 12px',
            borderRadius: '8px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            fontSize: '0.74rem',
            color: '#64748b',
          }}>
            <ShieldCheck size={15} color="#003666" style={{ flexShrink: 0 }} />
            <span>
              {isEs
                ? 'Esta guía visual es una herramienta educativa de precisión. Confirma siempre tu dosis exacta y frecuencia con tu médico prescriptor.'
                : 'This visual guide is an educational precision aid. Always confirm your exact prescribed dose and schedule with your physician.'}
            </span>
          </div>
        </section>
      </main>

      <PublicUnifiedFooter />
    </div>
  );
}
