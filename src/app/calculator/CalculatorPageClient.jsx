"use client";

import React, { useEffect, useMemo } from 'react';
import Link from 'next/link';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import PharmacyOpsWorkspaceBar from '@/components/shared/PharmacyOpsWorkspaceBar';
import { useActiveClinicalStore } from '@/stores/useActiveClinicalStore';
import ClinicalFormatSwitcher from '@/components/pricing/shared/ClinicalFormatSwitcher';
import AlgoliaEntityPicker from '@/components/shared/AlgoliaEntityPicker';
import FormatPickerCards from '@/components/reconstitution/FormatPickerCards';
import HorizontalSyringeVisualizer from '@/components/reconstitution/HorizontalSyringeVisualizer';
import PenDialVisualizer from '@/components/reconstitution/PenDialVisualizer';
import NonInjectableVisualizer from '@/components/reconstitution/NonInjectableVisualizer';
import StepTimelineList from '@/components/ui/StepTimelineList';
import PageHeroCard from '@/components/ui/PageHeroCard';
import { useRegisterAtlasContext } from '@/context/AtlasContextProvider';
import { usePublicWorkspace } from '@/context/PublicWorkspaceContext';
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
  ShoppingBag,
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
  const workspace = usePublicWorkspace?.() || null;
  const { activeRxCode, patientName: activePatientName, formulaTitle: activeFormulaTitle } = useActiveClinicalStore();
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
    hasUserInteracted,
    setHasUserInteracted,
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
    if (initialUrlOverrides?.vol) {
      const v = parseFloat(String(initialUrlOverrides.vol).replace(/[^0-9.]/g, ''));
      if (Number.isFinite(v) && v >= 1 && v <= 15) {
        out.penVolumeMl = v;
        out.initialSprayVolumeMl = v;
      }
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
      const out = {
        target: `${recon.doseDisplayValue}${recon.doseUnit}`,
      };
      if (parsedUrlOverrides.penVolumeMl && parsedUrlOverrides.penVolumeMl !== 3) {
        out.vol = `${parsedUrlOverrides.penVolumeMl}ml`;
      }
      return out;
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

  // Sync full configuration cleanly into browser address bar once user interacts or opened with params
  useEffect(() => {
    if (!hasUserInteracted) return;
    if (typeof window !== 'undefined' && window.history?.replaceState) {
      window.history.replaceState(null, '', fullSharePath);
    }
  }, [fullSharePath, hasUserInteracted]);

  const fullShareUrl = useMemo(() => {
    if (typeof window === 'undefined') return `https://www.atlashealth-services.com${fullSharePath}`;
    return `${window.location.origin}${fullSharePath}`;
  }, [fullSharePath]);

  const protocolSteps = useMemo(() => recon.getProtocolSteps(lang), [recon, lang]);

  const breadcrumbItems = useMemo(() => [
    { label: isEs ? 'Inicio' : 'Home', href: '/' },
    { label: isEs ? 'Guía Universal de Uso y Dosificación' : 'Universal Peptide Dosing Guide' },
  ], [isEs]);

  const activeFormatBadge = FORMAT_SHORT_BADGE[formatId] || FORMAT_SHORT_BADGE.vial;
  const activeCartridgeVolMl = parsedUrlOverrides.penVolumeMl || 3.0;

  // Concise human summary of the exact action for KPI Card #4 & Contextual Help
  const activeActionSummary = useMemo(() => {
    if (recon.isVial) {
      return isEs
        ? `${recon.doseDisplayValue} ${recon.doseUnit} → Marca ${Math.round(recon.unitsToInject)} U-100 (${recon.volumeMl} mL)`
        : `${recon.doseDisplayValue} ${recon.doseUnit} → Draw ${Math.round(recon.unitsToInject)} U-100 (${recon.volumeMl} mL)`;
    }
    if (recon.isPenOrCartridge) {
      return isEs
        ? `${recon.doseDisplayValue} ${recon.doseUnit} → ${recon.penClicks} clics (${recon.volumeMl} mL)`
        : `${recon.doseDisplayValue} ${recon.doseUnit} → Dial ${recon.penClicks} clicks (${recon.volumeMl} mL)`;
    }
    if (recon.isSpray) {
      return isEs
        ? `${recon.sprayPuffs} spray(s) (${recon.sprayDoseMcg} mcg)`
        : `${recon.sprayPuffs} spray(s) (${recon.sprayDoseMcg} mcg)`;
    }
    if (recon.isCapsule) {
      return isEs
        ? `${recon.oralUnitsPerDose} cápsula(s) / toma`
        : `${recon.oralUnitsPerDose} capsule(s) / dose`;
    }
    return recon.topicalDoseLabel;
  }, [recon, isEs]);

  // Register live contextual metadata for Atlas AI & HelpDrawer (?)
  useRegisterAtlasContext(
    {
      contextType: 'peptide_calculator',
      title: isEs
        ? 'Guía Universal de Preparación y Dosificación de Péptidos'
        : 'Universal Peptide Administration & Dosing Guide',
      lang,
      contextAnchor: {
        type: 'peptide_calculator',
        lang,
        name: isEs
          ? `Guía de Dosificación · ${selectedProduct.name} (${selectedStrength.name} · ${activeFormat.nameEs})`
          : `Dosing Guide · ${selectedProduct.name} (${selectedStrength.name} · ${activeFormat.name})`,
        badgeLabel: isEs ? activeFormat.nameEs : activeFormat.name,
        sectionTitle: isEs
          ? `Configuración activa: ${selectedProduct.name} · ${selectedStrength.name} · ${activeFormat.nameEs}`
          : `Active setup: ${selectedProduct.name} · ${selectedStrength.name} · ${activeFormat.name}`,
        keyActives: `${selectedProduct.name} (${selectedStrength.name}) — ${isEs ? activeFormat.nameEs : activeFormat.name} — ${activeActionSummary}`,
        mechanisms: recon.isVial
          ? (isEs
              ? `Vial liofilizado reconstituido con ${recon.bacWaterMl.toFixed(1)} mL de agua bacteriostática (${recon.concentrationMgMl} mg/mL). Jeringa U-100 (${recon.syringeCapacityMl} mL): cargar hasta la marca ${Math.round(recon.unitsToInject)} (${recon.volumeMl} mL) para ${recon.doseDisplayValue} ${recon.doseUnit}. Rendimiento: ~${recon.totalDoses} dosis.`
              : `Lyophilized vial reconstituted with ${recon.bacWaterMl.toFixed(1)} mL BAC water (${recon.concentrationMgMl} mg/mL). U-100 syringe (${recon.syringeCapacityMl} mL): draw to the ${Math.round(recon.unitsToInject)} mark (${recon.volumeMl} mL) for ${recon.doseDisplayValue} ${recon.doseUnit}. Yield: ~${recon.totalDoses} doses.`)
          : recon.isPenOrCartridge
            ? (isEs
                ? `${activeFormat.nameEs} (${selectedStrength.name} en ${activeCartridgeVolMl.toFixed(1)} mL = ${recon.concentrationMgMl} mg/mL). Dial U-100 (100 clics = 1 mL): girar a ${recon.penClicks} clics (${recon.volumeMl} mL) para administrar ${recon.doseDisplayValue} ${recon.doseUnit}. Rendimiento: ~${recon.totalDoses} dosis.`
                : `${activeFormat.name} (${selectedStrength.name} in ${activeCartridgeVolMl.toFixed(1)} mL = ${recon.concentrationMgMl} mg/mL). U-100 dial (100 clicks = 1 mL): turn to ${recon.penClicks} clicks (${recon.volumeMl} mL) to deliver ${recon.doseDisplayValue} ${recon.doseUnit}. Yield: ~${recon.totalDoses} doses.`)
            : `${selectedProduct.name} (${selectedStrength.name}) · ${activeActionSummary}`,
        welcomeIntro: isEs
          ? `1) Elige cualquier péptido y su concentración en el Paso 1. 2) Selecciona el formato de presentación en el Paso 2 (${availableFormatIds.length} formatos disponibles para ${selectedProduct.name}). 3) Ajusta tu dosis prescrita en el Paso 3 para ver los clics o unidades U-100 exactos y compartir el enlace o QR con el paciente.`
          : `1) Select any peptide and strength in Step 1. 2) Pick your delivery presentation in Step 2 (${availableFormatIds.length} formats available for ${selectedProduct.name}). 3) Set your prescribed dose in Step 3 to view exact U-100 clicks or syringe units and share the personalized link or QR with the patient.`,
        helpPrompts: isEs
          ? [
              `¿Cómo preparo y administro ${selectedProduct.name} (${selectedStrength.name}) en formato ${activeFormat.nameEs}?`,
              recon.isPenOrCartridge
                ? `¿Por qué ${recon.doseDisplayValue} ${recon.doseUnit} equivalen a ${recon.penClicks} clics (${recon.volumeMl} mL) en esta pluma/cartucho?`
                : `¿Cuánta agua bacteriostática (BAC) debo añadir a un vial de ${selectedStrength.name} de ${selectedProduct.name}?`,
              `¿Qué presentaciones están disponibles para ${selectedProduct.name} y cómo conservo el producto entre 2°C y 8°C?`,
              '¿Cómo comparto esta pauta personalizada por enlace o código QR con mi paciente?',
            ]
          : [
              `How do I prepare and administer ${selectedProduct.name} (${selectedStrength.name}) as a ${activeFormat.name}?`,
              recon.isPenOrCartridge
                ? `Why does ${recon.doseDisplayValue} ${recon.doseUnit} equal ${recon.penClicks} clicks (${recon.volumeMl} mL) on this pen/cartridge?`
                : `How much bacteriostatic (BAC) water should I add to a ${selectedStrength.name} vial of ${selectedProduct.name}?`,
              `Which presentations are available for ${selectedProduct.name} and how should it be stored at 2°C–8°C?`,
              'How do I share this exact personalized dosing guide via URL or QR code with a patient?',
            ],
      },
    },
    [
      isEs,
      lang,
      selectedProduct.name,
      selectedStrength.name,
      activeFormat.name,
      activeFormat.nameEs,
      activeActionSummary,
      availableFormatIds.length,
      recon.isVial,
      recon.isPenOrCartridge,
      recon.bacWaterMl,
      recon.concentrationMgMl,
      recon.syringeCapacityMl,
      recon.unitsToInject,
      recon.volumeMl,
      recon.doseDisplayValue,
      recon.doseUnit,
      recon.totalDoses,
      recon.penClicks,
      activeCartridgeVolMl,
    ]
  );

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

      {/* ── UNIFIED PHARMACY OPS BAR (shown seamlessly when operator has active Rx context) ── */}
      {activeRxCode && <PharmacyOpsWorkspaceBar lang={lang} />}

      {/* ── UNIFIED CLINICAL FORMAT SWITCHER (5-Tab Continuous Suite Bar) ── */}
      <ClinicalFormatSwitcher activeFormat="calculator" lang={lang} />

      {/* ── MAIN 3-STEP PATIENT WORKFLOW + UNIFIED COMPACT GCP HERO + 4-KPI SUMMARY ── */}
      <main style={{ maxWidth: '1240px', margin: '0 auto', padding: '0.85rem 1.25rem 6.5rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {activeRxCode && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: '8px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              fontSize: '0.78rem',
              color: '#1e3a8a'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 800, fontFamily: 'monospace' }}>#{activeRxCode}</span>
              {activePatientName && <span style={{ fontWeight: 700 }}>{activePatientName}</span>}
              {activeFormulaTitle && <span style={{ color: '#3b82f6' }}>· {activeFormulaTitle}</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {activeFormulaTitle && (
                <button
                  type="button"
                  onClick={() => setSearchQuery(activeFormulaTitle.split('(')[0].trim())}
                  className="gcp-btn-secondary"
                  style={{
                    minHeight: '34px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontWeight: 600,
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {isEs ? 'Cargar fórmula en calculadora' : 'Load formula in calculator'}
                </button>
              )}
              <Link
                href={`/labels?rx=${encodeURIComponent(activeRxCode)}`}
                className="gcp-btn-primary"
                style={{
                  minHeight: '34px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.74rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                {isEs ? '← Volver a Labels' : '← Back to Labels'}
              </Link>
            </div>
          </div>
        )}
        <PageHeroCard
          brandRight={isEs ? 'GUÍA UNIVERSAL DE DOSIFICACIÓN' : 'UNIVERSAL DOSING GUIDE'}
          badges={[
            isEs ? '6 Formatos: Vial · Pluma · Cartucho · Spray · Oral · Tópico' : '6 Formats: Vial · Pen · Cartridge · Spray · Oral · Topical',
            'U-100: 100 clicks = 1 mL',
          ]}
          title={
            isEs
              ? 'Guía Universal de Preparación y Dosificación de Péptidos'
              : 'Universal Peptide Administration & Dosing Guide'
          }
          subtitle={
            isEs
              ? 'Empieza eligiendo tu péptido y su presentación en los Pasos 1 y 2 para obtener la marca exacta de jeringa U-100, los clics del dial o las instrucciones paso a paso.'
              : 'Start by choosing your peptide and presentation in Steps 1 & 2 below to calculate your exact U-100 syringe mark, pen dial clicks, and step-by-step instructions.'
          }
          actions={
            <>
              {selectedProduct && (recon.isVial || recon.isPenOrCartridge) && typeof workspace?.addRfqItem === 'function' && (
                <button
                  type="button"
                  onClick={() => {
                    workspace.addRfqItem({
                      id: `calc:${selectedProduct.id || selectedProduct.slug || selectedProduct.productName}:${formatId}`,
                      sku: selectedProduct.sku || selectedProduct.slug || 'CALC-SKU',
                      name: `${selectedProduct.name || selectedProduct.productName || 'Peptide'} (${formatId})`,
                      unitPrice: Number(selectedProduct.unitPrice || selectedProduct.price || 0),
                      qty: 1,
                      source: 'calculator',
                      href: '/calculator',
                    });
                    workspace.setIsQuoteDrawerOpen?.(true);
                  }}
                  className="gcp-btn-secondary"
                  style={{ height: '36px', padding: '0 12px', fontSize: '0.76rem', fontWeight: 650, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <ShoppingBag size={14} color="#5f6368" />
                  <span>{isEs ? 'Añadir al Presupuesto B2B' : 'Add to Quote Cart'}</span>
                </button>
              )}
              {recon.isPenOrCartridge ? (
                <Link
                  href={`/pricing/pens${isEs ? '?lang=es' : ''}`}
                  className="gcp-btn-secondary"
                  style={{ height: '36px', padding: '0 12px', fontSize: '0.76rem', fontWeight: 650, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                >
                  <span>{isEs ? '27 Plumas U-100 ↗' : '27-Pen Guide ↗'}</span>
                </Link>
              ) : recon.isVial ? (
                <Link
                  href={`/pricing/peptides${isEs ? '?lang=es' : ''}`}
                  className="gcp-btn-secondary"
                  style={{ height: '36px', padding: '0 12px', fontSize: '0.76rem', fontWeight: 650, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                >
                  <span>{isEs ? 'Catálogo Viales ↗' : 'Vials Schedule ↗'}</span>
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => handleOpenQr(currentShareOverrides)}
                className="gcp-btn-secondary"
                style={{ height: '36px', padding: '0 12px', fontSize: '0.76rem', fontWeight: 650, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <QrCode size={14} color="#5f6368" />
                <span>{isEs ? 'Código QR' : 'Share QR'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleCopyShareUrl(currentShareOverrides)}
                className="gcp-btn-primary"
                style={{ height: '36px', padding: '0 13px', fontSize: '0.76rem', fontWeight: 750, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedLink ? (isEs ? 'Enlace Copiado' : 'Link Copied') : (isEs ? 'Copiar Guía Personalizada' : 'Copy Personalized Link')}</span>
              </button>
            </>
          }
        />

        {/* ── Instant Answer Strip + Clinical Precision Safety Tip ── */}
        <section
          aria-label={isEs ? 'Resumen instantáneo de dosis' : 'Instant dosing summary'}
          style={{
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '10px',
            padding: '10px 14px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{
              background: '#0369a1',
              color: '#ffffff',
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '999px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}>
              {isEs ? 'Resultado Directo' : 'Instant Answer'}
            </span>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0c4a6e' }}>
              {selectedProduct?.name || 'Peptide'} ({selectedStrength?.name || `${recon.vialMg}mg`})
              {recon.isVial && ` · ${recon.bacWaterMl} mL BAC → `}
              {recon.isVial && (
                <span style={{ color: '#0284c7' }}>
                  {recon.unitsToInject} {isEs ? 'U-100' : 'U-100 units'} ({recon.volumeMl} mL · {recon.totalDoses} {isEs ? 'dosis/vial' : 'doses/vial'})
                </span>
              )}
              {recon.isPenOrCartridge && (
                <span style={{ color: '#0284c7' }}>
                  {' → '}
                  {recon.penClicks} {isEs ? 'clics del dial' : 'pen clicks'} ({recon.totalDoses} {isEs ? 'dosis' : 'doses'})
                </span>
              )}
              {recon.isSpray && (
                <span style={{ color: '#0284c7' }}>
                  {' → '}
                  {recon.sprayPuffs} {isEs ? 'pulsaciones' : 'sprays'} ({recon.sprayDoseMcg} mcg)
                </span>
              )}
            </span>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', width: '100%' }}>
              <button
                type="button"
                onClick={() => {
                  const pName = selectedProduct?.name || 'Peptide';
                  const sName = selectedStrength?.name || `${recon.vialMg}mg`;
                  const doseVal = `${recon.doseDisplayValue || ''} ${recon.doseUnit || ''}`.trim();
                  let line = `${pName} (${sName}) — Dose: ${doseVal}`;
                  if (recon.isVial) {
                    line += ` · Reconstitute with ${recon.bacWaterMl} mL BAC → Draw ${recon.unitsToInject} U-100 units (${recon.volumeMl} mL) · ${recon.totalDoses} doses/vial`;
                  } else if (recon.isPenOrCartridge) {
                    line += ` · Dial ${recon.penClicks} clicks (${recon.volumeMl} mL) · ${recon.totalDoses} doses/pen`;
                  } else if (recon.isSpray) {
                    line += ` · ${recon.sprayPuffs} sprays (${recon.sprayDoseMcg} mcg)`;
                  }
                  if (typeof navigator !== 'undefined' && navigator.clipboard) {
                    navigator.clipboard.writeText(line);
                    toast.success(isEs ? 'Pauta copiada para etiqueta / WhatsApp' : 'Dosing line copied for label / WhatsApp');
                  }
                }}
                className="gcp-btn-secondary"
                style={{
                  minHeight: '36px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  whiteSpace: 'nowrap',
                }}
              >
                📋 {isEs ? 'Copiar Pauta' : 'Copy Dosing Line'}
              </button>
              <a
                href={`/rx/intake?peptide=${encodeURIComponent(selectedProduct?.name || '')}&dose=${encodeURIComponent(`${recon.doseDisplayValue || ''} ${recon.doseUnit || ''}`.trim())}&lang=${lang}`}
                className="gcp-btn-secondary"
                style={{
                  minHeight: '36px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                {isEs ? 'Prescribir este cálculo →' : 'Prescribe This Calculation →'}
              </a>
            </div>
          </div>

          {recon.isVial && recon.unitsToInject > 0 && recon.unitsToInject < 10 && recon.syringeCapacityMl >= 1.0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '8px',
              padding: '5px 10px',
              fontSize: '0.74rem',
              color: '#92400e',
            }}>
              <span>
                <strong>{isEs ? 'Tip de precisión clínica:' : 'Clinical Precision Tip:'}</strong>{' '}
                {isEs
                  ? `${recon.unitsToInject} U es un volumen pequeño en jeringa de 1.0 mL.`
                  : `${recon.unitsToInject} U is a small draw on a 1.0 mL syringe.`}
              </span>
              <button
                type="button"
                onClick={() => recon.setSyringeCapacityMl?.(0.3)}
                style={{
                  background: '#d97706',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 9px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {isEs ? 'Cambiar a 0.3 mL (30U)' : 'Switch to 0.3 mL (30U)'}
              </button>
            </div>
          )}
        </section>

        <style dangerouslySetInnerHTML={{ __html: `
          .calc-gcp-kpi-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 10px;
          }
          .calc-header-actions {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
          }
          .calc-quick-pick-rail {
            display: flex;
            align-items: center;
            gap: 6px;
            overflow-x: auto;
            scrollbar-width: none;
            -webkit-overflow-scrolling: touch;
            padding-bottom: 2px;
          }
          .calc-quick-pick-rail::-webkit-scrollbar {
            display: none;
          }
          .calc-vial-secondary-col {
            display: flex;
            flex-direction: column;
            gap: 10px;
            border-left: 1px solid #e2e8f0;
            padding-left: 14px;
          }
          .calc-dose-num-input::-webkit-outer-spin-button,
          .calc-dose-num-input::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          .calc-dose-num-input {
            -moz-appearance: textfield;
          }
          @media (max-width: 860px) {
            .calc-gcp-kpi-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 8px;
            }
          }
          @media (max-width: 680px) {
            .calc-header-actions {
              display: grid;
              grid-template-columns: 1fr 1fr;
              width: 100%;
            }
            .calc-header-actions button {
              width: 100%;
              justify-content: center;
              min-height: 40px;
            }
            .calc-vial-secondary-col {
              border-left: none;
              padding-left: 0;
              border-top: 1px solid #e2e8f0;
              padding-top: 12px;
            }
          }
        ` }} />

        {/* ── GOOGLE CLOUD UX 4-KPI ACTIVE CONFIGURATION SUMMARY + STEP-1 CALLOUT (Rule #22) ── */}
        <section
          aria-label={isEs ? 'Resumen de Configuración Activa' : 'Active Dosing Configuration Summary'}
          style={{
            background: '#ffffff',
            border: '1px solid #dadce0',
            borderRadius: '12px',
            padding: '10px 14px 12px',
            boxShadow: '0 1px 2px rgba(60,64,67,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '9px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.67rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {isEs ? 'RESUMEN DE DOSIFICACIÓN ACTIVA' : 'ACTIVE DOSING SUMMARY'}
              </span>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#1e40af',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                padding: '2px 8px',
                borderRadius: '999px',
              }}>
                {isEs
                  ? 'Paso 1: Elige primero cualquier péptido y su presentación abajo'
                  : 'First: Choose any peptide & presentation in Steps 1 & 2 below'}
              </span>
            </div>
            <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
              {isEs
                ? `Mostrando guía para: ${selectedProduct.name} (${selectedStrength.name})`
                : `Showing guide for: ${selectedProduct.name} (${selectedStrength.name})`}
            </span>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', width: '100%' }}>
              <button
                type="button"
                onClick={() => {
                  const pName = selectedProduct?.name || 'Peptide';
                  const sName = selectedStrength?.name || `${recon.vialMg}mg`;
                  const doseVal = `${recon.doseDisplayValue || ''} ${recon.doseUnit || ''}`.trim();
                  let line = `${pName} (${sName}) — Dose: ${doseVal}`;
                  if (recon.isVial) {
                    line += ` · Reconstitute with ${recon.bacWaterMl} mL BAC → Draw ${recon.unitsToInject} U-100 units (${recon.volumeMl} mL) · ${recon.totalDoses} doses/vial`;
                  } else if (recon.isPenOrCartridge) {
                    line += ` · Dial ${recon.penClicks} clicks (${recon.volumeMl} mL) · ${recon.totalDoses} doses/pen`;
                  } else if (recon.isSpray) {
                    line += ` · ${recon.sprayPuffs} sprays (${recon.sprayDoseMcg} mcg)`;
                  }
                  if (typeof navigator !== 'undefined' && navigator.clipboard) {
                    navigator.clipboard.writeText(line);
                    toast.success(isEs ? 'Pauta copiada para etiqueta / WhatsApp' : 'Dosing line copied for label / WhatsApp');
                  }
                }}
                className="gcp-btn-secondary"
                style={{
                  minHeight: '36px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  whiteSpace: 'nowrap',
                }}
              >
                📋 {isEs ? 'Copiar Pauta' : 'Copy Dosing Line'}
              </button>
              <a
                href={`/rx/intake?peptide=${encodeURIComponent(selectedProduct?.name || '')}&dose=${encodeURIComponent(`${recon.doseDisplayValue || ''} ${recon.doseUnit || ''}`.trim())}&lang=${lang}`}
                className="gcp-btn-secondary"
                style={{
                  minHeight: '36px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                {isEs ? 'Prescribir este cálculo →' : 'Prescribe This Calculation →'}
              </a>
            </div>
          </div>

          <div className="calc-gcp-kpi-grid">
            {/* KPI 1: Selected Peptide */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 11px', minWidth: 0 }}>
              <div style={{ fontSize: '0.63rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isEs ? '1. PÉPTIDO SELECCIONADO' : '1. SELECTED PEPTIDE'}
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#003666', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {selectedProduct.name}
              </div>
              <div style={{ fontSize: '0.67rem', color: '#64748b', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {isEs
                  ? `${availableFormatIds.length} presentaciones disponibles`
                  : `${availableFormatIds.length} presentations available`}
              </div>
            </div>

            {/* KPI 2: Presentation Format */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 11px', minWidth: 0 }}>
              <div style={{ fontSize: '0.63rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isEs ? '2. PRESENTACIÓN / FORMATO' : '2. PRESENTATION FORMAT'}
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: activeFormatBadge.color, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {isEs ? activeFormat.nameEs : activeFormat.name}
              </div>
              <div style={{ fontSize: '0.67rem', color: '#64748b', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {isEs ? activeFormat.shortEs : activeFormat.shortEn}
              </div>
            </div>

            {/* KPI 3: Strength & Concentration */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 11px', minWidth: 0 }}>
              <div style={{ fontSize: '0.63rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isEs ? '3. CONTENIDO Y CONCENTRACIÓN' : '3. CONTENT & CONCENTRATION'}
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {selectedStrength.name}
                {(recon.isVial || recon.isPenOrCartridge) ? ` / ${recon.effectiveLiquidMl.toFixed(1)} mL` : ''}
              </div>
              <div style={{ fontSize: '0.67rem', color: '#64748b', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {(recon.isVial || recon.isPenOrCartridge)
                  ? `${recon.concentrationMgMl} mg/mL (${recon.concentrationMcgUnit} mcg/clic)`
                  : (isEs ? 'Fórmula lista para administrar' : 'Ready-to-use formulation')}
              </div>
            </div>

            {/* KPI 4: Exact Dose & Action */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '8px 11px', minWidth: 0 }}>
              <div style={{ fontSize: '0.63rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isEs ? '4. DOSIS Y PAUTA EXACTA' : '4. EXACT DOSE & ACTION'}
              </div>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#14532d', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {activeActionSummary}
              </div>
              <div style={{ fontSize: '0.67rem', color: '#15803d', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 650 }}>
                {(recon.isVial || recon.isPenOrCartridge)
                  ? `~${recon.totalDoses} ${isEs ? 'dosis totales por envase' : 'total doses per unit'}`
                  : recon.isSpray
                    ? `~${recon.sprayRemainingDoses} ${isEs ? 'tomas por frasco' : 'doses per bottle'}`
                    : (isEs ? 'Guía paso a paso abajo' : 'Step-by-step guide below')}
              </div>
            </div>
          </div>
        </section>

        {/* ── STEP 1: SEARCH READY-TO-USE PEPTIDES (ZERO RAW APIs · ZERO SUPPLIER LABELS) ── */}
        <section style={{
          background: '#ffffff',
          border: '1.5px solid #93c5fd',
          borderRadius: '12px',
          padding: '1.1rem 1.25rem',
          boxShadow: '0 2px 8px rgba(26,115,232,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#1a73e8', color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.76rem', fontWeight: 800 }}>1</span>
              <h2 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
                {isEs ? 'Primero: Elige tu Péptido y Concentración' : 'First: Choose Your Peptide & Strength'}
              </h2>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#1a73e8', background: '#e8f0fe', padding: '2px 8px', borderRadius: '999px' }}>
                {isEs ? 'Empieza aquí' : 'Start here'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#003666', background: '#e8f0fe', padding: '3px 10px', borderRadius: '999px' }}>
                {isEs ? 'Activo:' : 'Active:'} {selectedProduct.name} · {selectedStrength.name}
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
            placeholder={isEs
              ? 'Paso 1 · Busca cualquier péptido por nombre (BPC-157, Tirzepatide, Retatrutide, GHK-Cu, NAD+, Semax...)'
              : 'Step 1 · Search any peptide by name (BPC-157, Tirzepatide, Retatrutide, GHK-Cu, NAD+, Semax...)'}
            headerLabel={isEs ? 'Péptidos Disponibles para Uso (Haz clic en péptido, formato o mg)' : 'Ready-to-Use Peptides (Click peptide, format or mg)'}
            fallbackHeaderLabel={isEs ? 'Péptidos Más Consultados (Elige uno o escribe arriba)' : 'Popular Ready-to-Use Peptides (Pick one or type above)'}
            storageNamespace="calculator-peptide-search"
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

          {/* Quick-tap popular peptides (Single-row Horizontal Scroll Rail on Mobile) + strength selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="calc-quick-pick-rail">
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', flexShrink: 0 }}>
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
                      padding: '4px 11px',
                      borderRadius: '999px',
                      border: active ? '1.5px solid #1a73e8' : '1px solid #e2e8f0',
                      background: active ? '#e8f0fe' : '#f8fafc',
                      color: active ? '#1a73e8' : '#334155',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
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
                    onClick={() => {
                      setHasUserInteracted?.(true);
                      setSelectedStrengthStr(st.name);
                    }}
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

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(72px, 1fr))', gap: '6px' }}>
                  {recon.dosePresets.map((val) => {
                    const active = Number(recon.doseDisplayValue) === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => recon.setDoseDisplayValue(val)}
                        style={{
                          padding: '6px 8px',
                          borderRadius: '8px',
                          border: active ? '1.5px solid #1a73e8' : '1px solid #cbd5e1',
                          background: active ? '#e8f0fe' : '#ffffff',
                          color: active ? '#1a73e8' : '#334155',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
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
                    onClick={() => recon.setDoseDisplayValue((prev) => Math.max(0.05, Number((Number(prev) - (recon.doseUnit === 'mg' ? 0.25 : 50)).toFixed(2))))}
                    style={{ width: '38px', height: '38px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}
                  >
                    −
                  </button>
                  <div style={{ position: 'relative', flex: 1, maxWidth: '170px' }}>
                    <input
                      type="number"
                      className="calc-dose-num-input"
                      inputMode="decimal"
                      step={recon.doseUnit === 'mg' ? '0.1' : '25'}
                      min="0.05"
                      value={recon.doseDisplayValue}
                      onChange={(e) => recon.setDoseDisplayValue(Math.max(0, parseFloat(e.target.value) || 0))}
                      style={{ width: '100%', height: '38px', padding: '0 44px 0 12px', borderRadius: '8px', border: '1.5px solid #93c5fd', fontSize: '0.95rem', fontWeight: 800, fontFamily: 'monospace', boxSizing: 'border-box' }}
                    />
                    <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', pointerEvents: 'none' }}>
                      {recon.doseUnit}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => recon.setDoseDisplayValue((prev) => Number((Number(prev) + (recon.doseUnit === 'mg' ? 0.25 : 50)).toFixed(2)))}
                    style={{ width: '38px', height: '38px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}
                  >
                    +
                  </button>
                  <span style={{ fontSize: '0.74rem', color: '#15803d', fontWeight: 800, marginLeft: 'auto', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '4px 9px', borderRadius: '999px', whiteSpace: 'nowrap' }}>
                    ~{recon.totalDoses} {isEs ? 'dosis' : 'doses'}
                  </span>
                </div>
              </div>

              {recon.isVial && (
                <div className="calc-vial-secondary-col">
                  <div>
                    <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Droplets size={14} color="#0284c7" />
                      <span>
                        {isEs ? 'Agua Bacteriostática (BAC):' : 'Bacteriostatic (BAC) Water:'}{' '}
                        <strong style={{ color: '#0284c7' }}>{recon.bacWaterMl.toFixed(1)} mL</strong>
                      </span>
                    </div>
                    {!recon.guidedMode ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '6px' }}>
                        {BAC_WATER_PRESETS.map((ml) => (
                          <button
                            key={ml}
                            type="button"
                            onClick={() => recon.setBacWaterMl(ml)}
                            style={{
                              padding: '6px 4px',
                              borderRadius: '7px',
                              border: recon.bacWaterMl === ml ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                              background: recon.bacWaterMl === ml ? '#e0f2fe' : '#ffffff',
                              color: recon.bacWaterMl === ml ? '#0369a1' : '#334155',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              textAlign: 'center',
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
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '6px' }}>
                      {SYRINGE_SIZES.map((s) => (
                        <button
                          key={s.ml}
                          type="button"
                          onClick={() => recon.setSyringeCapacityMl(s.ml)}
                          style={{
                            padding: '6px 8px',
                            borderRadius: '7px',
                            border: recon.syringeCapacityMl === s.ml ? '1.5px solid #0d9488' : '1px solid #cbd5e1',
                            background: recon.syringeCapacityMl === s.ml ? '#f0fdfa' : '#ffffff',
                            color: recon.syringeCapacityMl === s.ml ? '#0f766e' : '#334155',
                            fontSize: '0.73rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textAlign: 'center',
                            whiteSpace: 'nowrap',
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
              cartridgeVolume={`${(parsedUrlOverrides.penVolumeMl || 3.0).toFixed(1)} mL`}
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
