"use client";

import React, { useEffect, useMemo } from 'react';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import AlgoliaEntityPicker from '@/components/shared/AlgoliaEntityPicker';
import FormatPickerCards from '@/components/reconstitution/FormatPickerCards';
import HorizontalSyringeVisualizer from '@/components/reconstitution/HorizontalSyringeVisualizer';
import PenDialVisualizer from '@/components/reconstitution/PenDialVisualizer';
import NonInjectableVisualizer from '@/components/reconstitution/NonInjectableVisualizer';
import StepTimelineList from '@/components/ui/StepTimelineList';
import {
  useAlgoliaPeptideSelector,
  filterAndDeduplicatePatientPeptides,
} from '@/hooks/useAlgoliaPeptideSelector';
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
const SPRAY_VOLUMES = [5, 10, 15];
const TOPICAL_PRESETS = ['0.5 mL / 1 pump', '1 mL / 2 pumps', '2 mL / 4 pumps'];

const FORMAT_SHORT_BADGE = {
  vial: { en: 'Vial', es: 'Vial', bg: '#eff6ff', color: '#1d4ed8' },
  pen: { en: 'Pen', es: 'Pluma', bg: '#e0f2fe', color: '#0369a1' },
  cartridge: { en: 'Cartridge', es: 'Cartucho', bg: '#f0fdf4', color: '#15803d' },
  spray: { en: 'Nasal Spray', es: 'Spray Nasal', bg: '#faf5ff', color: '#7e22ce' },
  capsule: { en: 'Capsules', es: 'Cápsulas', bg: '#f0fdfa', color: '#0f766e' },
  topical: { en: 'Topical', es: 'Tópico', bg: '#fffbeb', color: '#b45309' },
};

export default function CalculatorClient() {
  const selector = useAlgoliaPeptideSelector({ syncUrl: false });
  const {
    lang,
    isEs,
    handleLangChange,
    selectedProduct,
    formatId,
    setFormatId,
    selectFormat,
    availableFormatIds,
    isLoadingFormats,
    activeFormat,
    selectedStrengthStr,
    setSelectedStrengthStr,
    availableStrengths,
    selectedStrength,
    searchQuery,
    setSearchQuery,
    handleSelectPeptideHit,
    buildSharePath,
    copiedLink,
    handleCopyShareUrl,
    handleOpenQr,
    formatOptions,
    quickPeptides,
    initialUrlOverrides,
  } = selector;

  const productObj = useMemo(
    () => ({
      id: selectedProduct.id,
      slug: selectedProduct.slug,
      name: selectedProduct.name,
      dosage: selectedStrength.name,
    }),
    [selectedProduct, selectedStrength]
  );

  // Parse optional URL overrides so shared links restore the EXACT dose, BAC water, syringe or puffs
  const parsedUrlOverrides = useMemo(() => {
    const out = {};
    if (initialUrlOverrides?.target) {
      const m = String(initialUrlOverrides.target).match(/^(\d+(?:\.\d+)?)\s*(mg|mcg)$/i);
      if (m) {
        out.initialDoseUnit = m[2].toLowerCase();
        out.initialDoseMcg = out.initialDoseUnit === 'mg' ? parseFloat(m[1]) * 1000 : parseFloat(m[1]);
      }
    }
    if (initialUrlOverrides?.bac) {
      const b = parseFloat(initialUrlOverrides.bac);
      if (Number.isFinite(b) && b > 0) {
        out.initialBacWaterMl = b;
        out.initialGuidedMode = false;
      }
    }
    if (initialUrlOverrides?.syringe) {
      const s = parseFloat(initialUrlOverrides.syringe);
      if ([0.3, 0.5, 1.0].includes(s)) out.initialSyringeMl = s;
    }
    if (initialUrlOverrides?.puffs) {
      const p = parseInt(initialUrlOverrides.puffs, 10);
      if (Number.isFinite(p) && p >= 1 && p <= 8) out.initialSprayPuffs = p;
    }
    return out;
  }, [initialUrlOverrides]);

  const recon = useReconstitution(productObj, selectedStrength, {
    format: formatId,
    autoSyncStarterDose: !parsedUrlOverrides.initialDoseMcg,
    initialGuidedMode: parsedUrlOverrides.initialGuidedMode ?? true,
    ...parsedUrlOverrides,
  });

  // Build complete shareable URL params carrying EVERY active parameter for sharing + OpenGraph metadata
  const currentShareOverrides = useMemo(() => {
    if (recon.isVial) {
      return {
        target: `${recon.doseDisplayValue}${recon.doseUnit}`,
        bac: `${recon.bacWaterMl}ml`,
        syringe: `${recon.syringeCapacityMl}ml`,
      };
    }
    if (recon.isPenOrCartridge) {
      return {
        target: `${recon.doseDisplayValue}${recon.doseUnit}`,
      };
    }
    if (recon.isSpray) {
      return {
        puffs: String(recon.sprayPuffs),
        vol: `${recon.sprayVolumeMl}ml`,
      };
    }
    if (recon.isCapsule) {
      return {
        qty: `${recon.oralUnitsPerDose}caps`,
      };
    }
    return {
      qty: recon.topicalDoseLabel.replace(/\s+/g, ''),
    };
  }, [
    recon.isVial,
    recon.isPenOrCartridge,
    recon.isSpray,
    recon.isCapsule,
    recon.doseDisplayValue,
    recon.doseUnit,
    recon.bacWaterMl,
    recon.syringeCapacityMl,
    recon.sprayPuffs,
    recon.sprayVolumeMl,
    recon.oralUnitsPerDose,
    recon.topicalDoseLabel,
  ]);

  const fullSharePath = useMemo(
    () => buildSharePath(currentShareOverrides),
    [buildSharePath, currentShareOverrides]
  );

  // Sync full configuration cleanly into browser address bar without jumping scroll
  useEffect(() => {
    if (typeof window !== 'undefined' && window.history?.replaceState) {
      window.history.replaceState(null, '', fullSharePath);
    }
  }, [fullSharePath]);

  const fullShareUrl = useMemo(() => {
    if (typeof window === 'undefined') return `https://www.atlashealth-services.com${fullSharePath}`;
    return `${window.location.origin}${fullSharePath}`;
  }, [fullSharePath]);

  const protocolSteps = useMemo(() => recon.getProtocolSteps(lang), [recon, lang]);

  const breadcrumbItems = useMemo(() => [
    { label: isEs ? 'Inicio' : 'Home', href: '/' },
    { label: isEs ? 'Guía de Uso y Dosificación' : 'How to Use & Dosing Guide' },
  ], [isEs]);

  const activeFormatBadge = FORMAT_SHORT_BADGE[formatId] || FORMAT_SHORT_BADGE.vial;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a' }}>
      {/* ── 100% PUBLIC GOOGLE CLOUD CONSOLE HEADER (EN Default · Full ES · Zero Admin Chrome) ── */}
      <PublicUnifiedHeader
        purePublic={true}
        lang={lang}
        onLangChange={handleLangChange}
        copyUrl={fullShareUrl}
        breadcrumb={breadcrumbItems}
      />

      {/* ── GENERAL PATIENT-FIRST HERO (Adapts clearly to chosen peptide & format, never hardcoded "Pre-filled") ── */}
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
                {isEs ? 'Guía Visual de Uso y Dosificación de Péptidos' : 'Peptide Administration & Dosing Guide'}
              </h1>
              <span style={{
                fontSize: '0.70rem',
                fontWeight: 700,
                padding: '2px 9px',
                borderRadius: '999px',
                background: activeFormatBadge.bg,
                color: activeFormatBadge.color,
                border: '1px solid rgba(0,0,0,0.08)',
              }}>
                {selectedProduct.name} · {selectedStrength.name} · {isEs ? activeFormat.nameEs : activeFormat.name}
              </span>
            </div>
            <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#5f6368' }}>
              {isEs
                ? 'Cómo preparar y administrar tu péptido paso a paso: viales, plumas, cartuchos, spray nasal, cápsulas o tópicos.'
                : 'Step-by-step visual guide on how to prepare and administer your peptide: vials, pens, cartridges, nasal spray, oral or topical.'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleOpenQr(currentShareOverrides)}
              className="gcp-btn-secondary"
              style={{ padding: '7px 12px', fontSize: '0.76rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <QrCode size={14} />
              <span>{isEs ? 'Código QR' : 'Share QR'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleCopyShareUrl(currentShareOverrides)}
              className="gcp-btn-primary"
              style={{ padding: '7px 14px', fontSize: '0.76rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {copiedLink ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedLink ? (isEs ? 'Enlace Copiado' : 'Link Copied') : (isEs ? 'Copiar Enlace Completo' : 'Copy Personalized Link')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN 3-STEP PATIENT WORKFLOW ── */}
      <main style={{ maxWidth: '1080px', margin: '0 auto', padding: '1.25rem 1.25rem 6.5rem', display: 'flex', flexDirection: 'column', gap: '18px' }}>

        {/* ── STEP 1: SEARCH READY-TO-USE PEPTIDES (ZERO RAW APIs · ZERO SUPPLIER LABELS) ── */}
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
                {isEs ? 'Busca tu Péptido y Elige Presentación' : 'Find Your Peptide & Presentation'}
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#003666', background: '#e8f0fe', padding: '3px 10px', borderRadius: '999px' }}>
                ✓ {selectedProduct.name} · {selectedStrength.name}
              </span>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: activeFormatBadge.color, background: activeFormatBadge.bg, padding: '3px 10px', borderRadius: '999px' }}>
                {isEs ? activeFormat.nameEs : activeFormat.name}
              </span>
            </div>
          </div>

          <AlgoliaEntityPicker
            indexName="products"
            value={searchQuery}
            onChange={setSearchQuery}
            onSelect={(hit, extra) => {
              if (extra && typeof extra === 'object') {
                handleSelectPeptideHit(hit, extra.strength || null, extra.format || null);
              } else {
                handleSelectPeptideHit(hit, extra || null, null);
              }
            }}
            fallbackItems={quickPeptides}
            placeholder={isEs ? 'Buscar péptido listo para usar (BPC-157, Tirzepatide, Semax, GHK-Cu...)' : 'Search ready-to-use peptide (BPC-157, Tirzepatide, Semax, GHK-Cu...)'}
            headerLabel={isEs ? 'Péptidos Disponibles para Uso (Sin APIs en bruto)' : 'Ready-to-Use Peptides (Finished Presentations Only)'}
            fallbackHeaderLabel={isEs ? 'Péptidos Más Consultados' : 'Popular Ready-to-Use Peptides'}
            storageNamespace="calculator-patient-search"
            hitsPerPage={24}
            isEs={isEs}
            sortHits={(list) => filterAndDeduplicatePatientPeptides(list)}
            renderItem={(item, pick) => {
              const itemStrengths = Array.isArray(item.strengths) ? item.strengths : ['5 mg', '10 mg'];
              const itemFormats = Array.isArray(item.formats) ? item.formats : ['vial', 'pen', 'cartridge'];
              return (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  padding: '9px 10px',
                  borderBottom: '1px solid #f1f5f9',
                }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => pick({ strength: itemStrengths[0], format: itemFormats[0] })}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        textAlign: 'left',
                        cursor: 'pointer',
                        padding: 0,
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        color: '#0f172a',
                      }}
                    >
                      {item.name}
                    </button>

                    {/* Clickable Strength chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {itemStrengths.slice(0, 5).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => pick({ strength: st, format: itemFormats[0] })}
                          style={{
                            border: '1px solid #cbd5e1',
                            background: '#f8fafc',
                            color: '#334155',
                            borderRadius: '6px',
                            padding: '2px 8px',
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

                  {/* Clickable Available Formats directly inside search results (NO supplier tags!) */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '5px' }}>
                    <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                      {isEs ? 'Formatos:' : 'Formats:'}
                    </span>
                    {itemFormats.map((fKey) => {
                      const fb = FORMAT_SHORT_BADGE[fKey];
                      if (!fb) return null;
                      return (
                        <button
                          key={fKey}
                          type="button"
                          onClick={() => pick({ strength: itemStrengths[0], format: fKey })}
                          style={{
                            border: 'none',
                            borderRadius: '999px',
                            padding: '2px 8px',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            background: fb.bg,
                            color: fb.color,
                            cursor: 'pointer',
                          }}
                        >
                          {isEs ? fb.es : fb.en}
                        </button>
                      );
                    })}
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
              {quickPeptides.slice(0, 8).map((p) => {
                const active = selectedProduct.slug === p.slug;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPeptideHit(p, p.strengths[0], p.formats[0])}
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
                {isEs ? 'Concentración / Contenido:' : 'Strength / Content:'}
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

        {/* ── STEP 2: PICK DELIVERY FORMAT (ALL 6 READY-TO-USE PRESENTATIONS) ── */}
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
              <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#1a73e8', color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.76rem', fontWeight: 800 }}>2</span>
              <h2 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
                {isEs ? 'Elige el Formato que Vas a Utilizar' : 'Choose Your Format'}
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {isLoadingFormats && (
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: '#1a73e8',
                  background: '#e8f0fe',
                  padding: '2px 8px',
                  borderRadius: '999px',
                }}>
                  {isEs ? 'Verificando presentaciones...' : 'Checking presentations...'}
                </span>
              )}
              <span style={{
                fontSize: '0.70rem',
                fontWeight: 700,
                color: '#15803d',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                padding: '2px 8px',
                borderRadius: '999px',
              }}>
                {isEs
                  ? `${availableFormatIds.length} de ${formatOptions.length} disponibles`
                  : `${availableFormatIds.length} of ${formatOptions.length} available`}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#5f6368', fontWeight: 600 }}>
                {isEs ? 'Seleccionado:' : 'Selected:'}{' '}
                <strong style={{ color: '#003666' }}>{isEs ? activeFormat.nameEs : activeFormat.name}</strong>
              </span>
            </div>
          </div>

          <FormatPickerCards
            options={formatOptions}
            availableFormatIds={availableFormatIds}
            activeFormatId={formatId}
            onSelectFormat={selectFormat || setFormatId}
            lang={lang}
          />
        </section>

        {/* ── STEP 3: DOSE + VISUAL ADMINISTRATION GUIDE ── */}
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
                {recon.isSpray
                  ? (isEs ? 'Tu Dosis de Spray Nasal' : 'Your Nasal Spray Dose')
                  : recon.isCapsule
                  ? (isEs ? 'Tu Pauta Oral / Sublingual' : 'Your Oral / Sublingual Schedule')
                  : recon.isTopical
                  ? (isEs ? 'Tu Dosis de Aplicación Tópica' : 'Your Topical Application Amount')
                  : recon.isPenOrCartridge
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

          {/* Format-Specific Dose Controls */}
          {(recon.isVial || recon.isPenOrCartridge) && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: recon.isVial ? 'repeat(auto-fit, minmax(260px, 1fr))' : '1fr',
              gap: '14px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '14px',
            }}>
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
          )}

          {/* Nasal Spray Controls */}
          {recon.isSpray && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '12px', padding: '12px 14px', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6b21a8' }}>
                  {isEs ? 'Pulverizaciones por toma:' : 'Sprays per dose:'}
                </span>
                {[1, 2, 3, 4].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => recon.setSprayPuffs(p)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '8px',
                      border: recon.sprayPuffs === p ? '1.5px solid #9333ea' : '1px solid #d8b4fe',
                      background: recon.sprayPuffs === p ? '#9333ea' : '#ffffff',
                      color: recon.sprayPuffs === p ? '#ffffff' : '#6b21a8',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {p} {p === 1 ? 'spray' : 'sprays'}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#7e22ce' }}>
                  {isEs ? 'Frasco:' : 'Bottle:'}
                </span>
                {SPRAY_VOLUMES.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => recon.setSprayVolumeMl(v)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: recon.sprayVolumeMl === v ? '1.5px solid #9333ea' : '1px solid #d8b4fe',
                      background: recon.sprayVolumeMl === v ? '#f3e8ff' : '#ffffff',
                      color: '#6b21a8',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {v} mL
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Oral Capsules Controls */}
          {recon.isCapsule && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '12px', padding: '12px 14px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f766e' }}>
                {isEs ? 'Cantidad por toma:' : 'Units per serving:'}
              </span>
              {[1, 2, 3].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => recon.setOralUnitsPerDose(q)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '8px',
                    border: recon.oralUnitsPerDose === q ? '1.5px solid #0d9488' : '1px solid #99f6e4',
                    background: recon.oralUnitsPerDose === q ? '#0d9488' : '#ffffff',
                    color: recon.oralUnitsPerDose === q ? '#ffffff' : '#0f766e',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {q} {q === 1 ? (isEs ? 'cápsula / troche' : 'capsule / troche') : (isEs ? 'cápsulas / troches' : 'capsules / troches')}
                </button>
              ))}
            </div>
          )}

          {/* Topical Controls */}
          {recon.isTopical && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '12px 14px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#b45309' }}>
                {isEs ? 'Cantidad por aplicación:' : 'Amount per application:'}
              </span>
              {TOPICAL_PRESETS.map((lbl) => (
                <button
                  key={lbl}
                  type="button"
                  onClick={() => recon.setTopicalDoseLabel(lbl)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '8px',
                    border: recon.topicalDoseLabel === lbl ? '1.5px solid #d97706' : '1px solid #fde68a',
                    background: recon.topicalDoseLabel === lbl ? '#d97706' : '#ffffff',
                    color: recon.topicalDoseLabel === lbl ? '#ffffff' : '#b45309',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {lbl}
                </button>
              ))}
            </div>
          )}

          {/* ── FORMAT-SPECIFIC VISUALIZER ── */}
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
          ) : recon.isPenOrCartridge ? (
            <PenDialVisualizer
              penClicks={recon.penClicks}
              volumeMl={recon.volumeMl}
              totalDoses={recon.totalDoses}
              strengthLabel={selectedStrength.name}
              isCartridge={recon.isCartridge}
              lang={lang}
            />
          ) : (
            <NonInjectableVisualizer
              format={formatId}
              peptideName={selectedProduct.name}
              strengthLabel={selectedStrength.name}
              sprayPuffs={recon.sprayPuffs}
              sprayMcgPerPuff={recon.sprayMcgPerPuff}
              sprayDoseMcg={recon.sprayDoseMcg}
              sprayRemainingDoses={recon.sprayRemainingDoses}
              sprayVolumeMl={recon.sprayVolumeMl}
              oralUnitsPerDose={recon.oralUnitsPerDose}
              topicalDoseLabel={recon.topicalDoseLabel}
              lang={lang}
            />
          )}

          {/* ── STEP-BY-STEP VISUAL INSTRUCTIONS (Linear Stepper — Golden Rule #70) ── */}
          <div style={{ marginTop: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={15} color="#003666" />
                <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#003666' }}>
                  {isEs
                    ? `Cómo usar ${selectedProduct.name} (${activeFormat.nameEs})`
                    : `How to Use ${selectedProduct.name} (${activeFormat.name})`}
                </h3>
              </div>
              <span style={{
                fontSize: '0.70rem',
                fontWeight: 700,
                color: '#5f6368',
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                padding: '2px 9px',
                borderRadius: '999px',
              }}>
                {protocolSteps.length} {isEs ? 'pasos' : 'steps'}
              </span>
            </div>

            <StepTimelineList steps={protocolSteps} />
          </div>

          {/* Shareable Link Preview Strip (Transparent URL + Metadata Summary) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            padding: '10px 12px',
            borderRadius: '8px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            fontSize: '0.74rem',
            color: '#475569',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
              <ShieldCheck size={15} color="#003666" style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <strong>{isEs ? 'Enlace compartible:' : 'Shareable URL:'}</strong>{' '}
                <code style={{ color: '#1d4ed8', fontSize: '0.72rem' }}>{fullSharePath}</code>
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleCopyShareUrl(currentShareOverrides)}
              style={{
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#1a73e8',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {copiedLink ? (isEs ? 'Copiado ✓' : 'Copied ✓') : (isEs ? 'Copiar URL' : 'Copy URL')}
            </button>
          </div>
        </section>
      </main>

      <PublicUnifiedFooter />
    </div>
  );
}
