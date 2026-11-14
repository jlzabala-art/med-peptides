"use client";

/**
 * CompoundingPage — Public Custom Compounding Lab (/compounding)
 * ─────────────────────────────────────────────────────────────────────────────
 * 3-step builder: (1) pick a base blueprint → (2) adjust actives & bottle size
 * with live galenic capsule sizing → (3) validate with Atlas AI and request an
 * official batch quotation through the institutional inquiry drawer.
 *
 * Data: actives come from `ultramanApiRepository` (Firestore `ultraman_apis`
 * with RAM → localStorage → Firestore → static fallback layers, Rule #2).
 * Galenics: `computeGalenics` + `CAPSULE_BOTTLE_SIZES` from the
 * Pharmapolis cost engine. No B2B manufacturing cost is exposed publicly;
 * pricing is delivered in the official quotation (shown only in clinical/embedded mode).
 */

import React, { useState, useMemo, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import PublicUnifiedHeader from '../components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '../components/shared/PublicUnifiedFooter';
import PublicStickyActionBar from '../components/shared/PublicStickyActionBar';
import PublicInstitutionalInquiryDrawer from '../components/shared/PublicInstitutionalInquiryDrawer';
import { CAPSULE_BOTTLE_SIZES } from '../services/pharmapolisCostEngine';
import CompoundingGoalWizard from '../components/compounding/CompoundingGoalWizard';
import DoctorCompoundingHeader from '../components/compounding/DoctorCompoundingHeader';
import BlueprintSelector from '../components/compounding/BlueprintSelector';
import ActiveIngredientCard from '../components/compounding/ActiveIngredientCard';
import ClinicalIntelligencePanel from '../components/compounding/ClinicalIntelligencePanel';
import GalenicSummaryPanel from '../components/compounding/GalenicSummaryPanel';
import { useCompoundingBuilder } from '../hooks/useCompoundingBuilder';
import {
  MAX_ACTIVES,
  SEARCH_CATEGORIES,
  COMPOUNDING_I18N
} from '../data/compoundingKnowledge';
import { triggerHaptic } from '../utils/haptics';
import {
  FlaskConical, ShieldCheck, Zap, Search, X, Plus,
  Pill, Sparkles, RotateCcw, Sun, Moon, Layers
} from '@/lib/icons';
import '../styles/compoundingPage.css';
import '@/styles/publicDesignSystem.css';

export default function CompoundingPage({
  embedded = false,
  initialLang = null,
  doctorId = null,
  doctorMeta = null,
  patients = [],
  onPrescriptionIssued = null
}) {
  const builder = useCompoundingBuilder({ initialLang });
  const {
    lang, t, handleLangChange, catalog, activeBlueprint, items,
    capsPerBottle, setCapsPerBottle, formulaName, setFormulaName,
    activeGeneticProfile, setActiveGeneticProfile,
    activeFineTuningNotes, setActiveFineTuningNotes,
    query, setQuery, searchCategory, setSearchCategory,
    isSearchOpen, setIsSearchOpen, searchWrapRef, searchResults,
    pricingChannel, setPricingChannel, isSplitProtocol,
    activePhaseTab, setActivePhaseTab, toggleSplitProtocol,
    applyBlueprint, handleApplyProposal, addActive, removeActive,
    updateDose, commitDose, stepDose, resetAll,
    galenics, splitData, splitGalenics, costEstimate,
    activeSynergies, chronoWarning, overlapWarnings, synergySuggestions,
    savedFormulas, saveCurrentFormula, loadSavedFormula, removeSavedFormula
  } = builder;

  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isGoalsWizardOpen, setIsGoalsWizardOpen] = useState(false);
  const [blueprintViewMode, setBlueprintViewMode] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('cmp_bp_view_mode');
        if (stored === 'chips' || stored === 'grid') return stored;
      } catch { /* ignore */ }
    }
    return 'grid';
  });

  // Doctor Clinical Integration State (used when embedded === true)
  const [selectedPatientId, setSelectedPatientId] = useState(() => patients?.[0]?.id || '');
  const [isNewPatientInline, setIsNewPatientInline] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientDob, setNewPatientDob] = useState('');
  const [newPatientGender, setNewPatientGender] = useState('Male');
  const [clinicalIndications, setClinicalIndications] = useState('');
  const [isIssuingPrescription, setIsIssuingPrescription] = useState(false);

  const totalMg = galenics?.totalMg || 0;
  const displayName = formulaName.trim() || (lang === 'es' ? 'Fórmula personalizada' : 'Custom formula');

  const formulaSummary = useMemo(() => {
    if (!items.length) return '';
    const lines = items.map(i => `${i.name} ${i.doseMg} mg`).join(' + ');
    const gal = galenics ? ` · ${galenics.size.size} HPMC · ${galenics.capsPerDay} ${t.capsDay} · ${capsPerBottle} caps` : '';
    return `${lines}${gal}`;
  }, [items, galenics, capsPerBottle, t]);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://www.atlashealth-services.com/compounding';

  const handleToggleViewMode = useCallback(() => {
    triggerHaptic('light');
    setBlueprintViewMode(prev => {
      const next = prev === 'chips' ? 'grid' : 'chips';
      try { localStorage.setItem('cmp_bp_view_mode', next); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(t.copied, { id: 'cmp-copy' });
      triggerHaptic('success');
    } catch {
      toast.error('Clipboard unavailable');
    }
  }, [t]);

  const handleRequest = useCallback(() => {
    if (!items.length) {
      toast.error(t.emptyTitle, { id: 'cmp-empty' });
      return;
    }
    triggerHaptic('medium');
    setIsInquiryOpen(true);
  }, [items.length, t]);

  const handleIssueDoctorPrescription = useCallback(async () => {
    if (!items.length) {
      toast.error(lang === 'es' ? 'Añade al menos un principio activo a la fórmula' : 'Add at least one active ingredient to the formula');
      return;
    }

    const chosenPatient = isNewPatientInline
      ? {
          name: newPatientName.trim(),
          dob: newPatientDob || '1985-06-15',
          gender: newPatientGender || 'Male',
          email: '',
          phone: ''
        }
      : (patients.find(p => String(p.id) === String(selectedPatientId)) || {
          id: selectedPatientId || 'pat-selected',
          name: patients.find(p => String(p.id) === String(selectedPatientId))?.name || 'Assigned Patient'
        });

    if (!chosenPatient?.name) {
      toast.error(lang === 'es' ? 'Selecciona o escribe el nombre del paciente asignado' : 'Select or enter the assigned patient name');
      return;
    }

    setIsIssuingPrescription(true);
    triggerHaptic('medium');
    try {
      const res = await fetch('/api/prescriptions/create-compounded', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: doctorId || doctorMeta?.id || 'dr-marina-cordeiro-fernandes',
          doctorMeta: {
            name: doctorMeta?.name || 'Dr. Marina Cordeiro Fernandes',
            license: doctorMeta?.license || doctorMeta?.licenseNumber || 'DHA-91105367',
            clinicName: doctorMeta?.clinicName || doctorMeta?.clinic || 'NOVA Aesthetics & Wellness',
            specialty: doctorMeta?.specialty || 'General Practitioner · Longevity & Aesthetic Medicine',
            email: doctorMeta?.email || 'dr.marina@novaclinic.ae',
            phone: doctorMeta?.phone || '+971 4 384 5678'
          },
          patient: chosenPatient,
          formulaName: formulaName || (activeBlueprint && activeBlueprint !== 'blank' ? activeBlueprint : 'Custom Compounded Formula'),
          items: items.map(it => ({
            name: it.name,
            doseMg: it.doseMg,
            unit: it.unit || 'mg',
            activeIngredient: it.activeIngredient || it.name,
            category: it.category || 'Compounded Active',
            role: it.role || ''
          })),
          capsuleDetails: {
            capsPerBottle,
            size: galenics?.size?.size || 'Size 0',
            totalMgPerCap: galenics?.mgPerCap || totalMg,
            capsPerDay: galenics?.capsPerDay || 2
          },
          nutrigenomics: activeGeneticProfile ? {
            source: activeGeneticProfile.source || '24Genetics Nutrition Report',
            sampleCode: activeGeneticProfile.sampleCode || '',
            fineTuningNotes: activeFineTuningNotes || []
          } : null,
          clinicalNotes: clinicalIndications || ''
        })
      });

      const data = await res.json();
      if (data.success && data.prescription) {
        toast.success(
          lang === 'es'
            ? `¡Prescripción #${data.prescription.prescriptionNumber || data.prescription.code} emitida y registrada con éxito!`
            : `Prescription #${data.prescription.prescriptionNumber || data.prescription.code} issued successfully!`,
          { duration: 5000, icon: '📜' }
        );
        onPrescriptionIssued?.(data.prescription);
      } else {
        throw new Error(data.error || 'Failed to issue prescription');
      }
    } catch (err) {
      toast.error(err.message || 'Error issuing compounded prescription');
    } finally {
      setIsIssuingPrescription(false);
    }
  }, [
    items, isNewPatientInline, newPatientName, newPatientDob, newPatientGender,
    patients, selectedPatientId, doctorId, doctorMeta, formulaName, activeBlueprint,
    capsPerBottle, galenics, totalMg, activeGeneticProfile, activeFineTuningNotes,
    clinicalIndications, lang, onPrescriptionIssued
  ]);

  const handleExportPdf = useCallback(async () => {
    if (!items.length || isExporting) return;
    setIsExporting(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      doc.setFillColor(0, 54, 102);
      doc.rect(0, 0, 210, 28, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(17);
      doc.text('Atlas Health · Custom Compounding', 14, 13);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
      doc.text(
        lang === 'es'
          ? 'Complementos Alimenticios · Directiva UE 2002/46/CE · Cápsulas veganas HPMC'
          : 'EU Directive 2002/46/EC Food Supplements · EU GMP · Vegan HPMC capsules',
        14, 21
      );
      doc.text(new Date().toLocaleDateString(), 196, 21, { align: 'right' });

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
      doc.text(displayName, 14, 42);

      let y = 54;
      doc.setFontSize(10); doc.setFillColor(241, 245, 249);
      doc.rect(14, y - 6, 182, 9, 'F');
      doc.text('#', 17, y);
      doc.text(lang === 'es' ? 'Activo Nutracéutico' : 'Nutraceutical Active', 26, y);
      doc.text(lang === 'es' ? 'Especificación' : 'Specification', 110, y);
      doc.text('mg/day', 194, y, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      items.forEach((i, idx) => {
        y += 9;
        doc.text(String(idx + 1), 17, y);
        doc.text(doc.splitTextToSize(i.name, 80)[0], 26, y);
        doc.text(doc.splitTextToSize(i.spec || '—', 72)[0], 110, y);
        doc.text(String(i.doseMg), 194, y, { align: 'right' });
      });

      if (galenics) {
        y += 16;
        doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
        doc.text('Galenic specification', 14, y);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
        const rows = [
          ['Capsule', `${galenics.size.size} vegan HPMC (${galenics.size.volumeCapacityMl} mL)`],
          ['Total active load', `${galenics.totalMg} mg / day`],
          ['Daily intake', `${galenics.capsPerDay} capsule(s) · ${galenics.mgPerCap} mg per capsule`],
          ['Bottle', `${capsPerBottle} capsules · ${galenics.supplyDays} days supply`]
        ];
        rows.forEach(([k, v]) => { y += 7; doc.text(`${k}:`, 14, y); doc.text(v, 60, y); });
      }

      y += 14;
      doc.setFontSize(8.5); doc.setTextColor(100, 116, 139);
      doc.text(doc.splitTextToSize(lang === 'es' ? COMPOUNDING_I18N.es.disclaimer : COMPOUNDING_I18N.en.disclaimer, 182), 14, y);
      doc.text(doc.splitTextToSize(`Formula link: ${window.location.href}`, 182), 14, 285);

      doc.save(`atlas-formula-${Date.now()}.pdf`);
      toast.success(lang === 'es' ? `Ficha "${displayName}" descargada ✓` : `"${displayName}" sheet downloaded ✓`);
    } catch (err) {
      console.error('[CompoundingPage] PDF export failed', err);
      toast.error(lang === 'es' ? 'No se pudo generar el PDF' : 'Could not generate the PDF');
    } finally {
      setIsExporting(false);
    }
  }, [items, galenics, capsPerBottle, displayName, isExporting, lang]);

  const aiContextQuery = items.length
    ? (lang === 'es'
      ? `Analiza la sinergia, seguridad e interacciones de esta fórmula magistral en cápsulas: ${formulaSummary}. Sugiere optimizaciones de dosis y absorción.`
      : `Analyze synergy, safety and interactions of this compounded capsule formula: ${formulaSummary}. Suggest dose and absorption optimizations.`)
    : (lang === 'es' ? '¿Qué fórmula magistral en cápsulas me recomiendas para longevidad?' : 'Which compounded capsule formula would you recommend for longevity?');

  const visibleItems = useMemo(() => {
    return items.filter(i => {
      if (!isSplitProtocol || activePhaseTab === 'all' || !splitData) return true;
      if (activePhaseTab === 'phase1') return splitData.phase1.some(p => p.apiId === i.apiId);
      if (activePhaseTab === 'phase2') return splitData.phase2.some(p => p.apiId === i.apiId);
      return true;
    });
  }, [items, isSplitProtocol, activePhaseTab, splitData]);

  return (
    <div className={`cmp-page ${embedded ? 'is-embedded' : ''}`}>
      {!embedded && (
        <PublicUnifiedHeader track="compounds" lang={lang} onLangChange={handleLangChange} copyUrl={shareUrl} />
      )}

      {!embedded && (
        <header className="cmp-hero">
          <div className="cmp-container">
            <div className="cmp-hero-badges">
              <span className="cmp-badge"><FlaskConical size={13} /> {t.badge}</span>
              <span className="cmp-badge is-regulatory"><ShieldCheck size={13} /> {t.regulatoryBadge}</span>
            </div>
            <h1 className="cmp-title">{t.title}</h1>
            <p className="cmp-subtitle">{t.subtitle}</p>

            <div className="cmp-kpis">
              {[ShieldCheck, Pill, FlaskConical, Zap].map((Icon, idx) => (
                <div key={idx} className="cmp-kpi">
                  <div className="cmp-kpi-head">
                    <span>{t.kpis[idx].label}</span>
                    <Icon size={15} />
                  </div>
                  <div className="cmp-kpi-value">{t.kpis[idx].value}</div>
                  <div className="cmp-kpi-sub">{t.kpis[idx].sub}</div>
                </div>
              ))}
            </div>
          </div>
        </header>
      )}

      {embedded && (
        <DoctorCompoundingHeader
          lang={lang}
          items={items}
          galenics={galenics}
          totalMg={totalMg}
          capsPerBottle={capsPerBottle}
          isSplitProtocol={isSplitProtocol}
          activeGeneticProfile={activeGeneticProfile}
          activeFineTuningNotes={activeFineTuningNotes}
          doctorMeta={doctorMeta}
          patients={patients}
          selectedPatientId={selectedPatientId}
          setSelectedPatientId={setSelectedPatientId}
          isNewPatientInline={isNewPatientInline}
          setIsNewPatientInline={setIsNewPatientInline}
          newPatientName={newPatientName}
          setNewPatientName={setNewPatientName}
          newPatientDob={newPatientDob}
          setNewPatientDob={setNewPatientDob}
          newPatientGender={newPatientGender}
          setNewPatientGender={setNewPatientGender}
          clinicalIndications={clinicalIndications}
          setClinicalIndications={setClinicalIndications}
        />
      )}

      <main className="cmp-container cmp-main">
        {/* Step 1: Blueprints */}
        <BlueprintSelector
          t={t}
          lang={lang}
          activeBlueprint={activeBlueprint}
          itemsCount={items.length}
          blueprintViewMode={blueprintViewMode}
          onToggleViewMode={handleToggleViewMode}
          onOpenWizard={() => setIsGoalsWizardOpen(true)}
          onSelectBlueprint={applyBlueprint}
        />

        <div className="cmp-grid">
          {/* Step 2: Actives & Bottle Size */}
          <section className="cmp-card" aria-labelledby="cmp-step2">
            <div className="cmp-step-head">
              <span className="cmp-step-num">2</span>
              <div className="cmp-step-head-text">
                <h2 id="cmp-step2">{t.step2}</h2>
                <p>{t.step2Hint}</p>
              </div>
              <div className="cmp-step-head-actions">
                {items.length > 0 && (
                  <button
                    type="button"
                    className={`cmp-ghost-btn cmp-split-toggle ${isSplitProtocol ? 'is-active' : ''}`}
                    onClick={toggleSplitProtocol}
                    title={isSplitProtocol ? t.recombineProtocol : t.splitProtocol}
                  >
                    <Layers size={13} />
                    <span>{isSplitProtocol ? (lang === 'es' ? '1 Fase' : 'Single') : (lang === 'es' ? 'Día/Noche' : 'Day/Night')}</span>
                  </button>
                )}
                {items.length > 0 && (
                  <button type="button" className="cmp-ghost-btn" onClick={resetAll}>
                    <RotateCcw size={13} /> {t.reset}
                  </button>
                )}
              </div>
            </div>

            {isSplitProtocol && splitData && (
              <div className="cmp-phase-tabs">
                <button
                  type="button"
                  className={`cmp-phase-tab ${activePhaseTab === 'all' ? 'is-active' : ''}`}
                  onClick={() => setActivePhaseTab('all')}
                >
                  <Layers size={13} />
                  <span>{t.allPhases} ({items.length})</span>
                </button>
                <button
                  type="button"
                  className={`cmp-phase-tab ${activePhaseTab === 'phase1' ? 'is-active' : ''}`}
                  onClick={() => setActivePhaseTab('phase1')}
                >
                  <Sun size={13} color="#ea580c" />
                  <span>{t.phase1Title} ({splitData.phase1.length})</span>
                </button>
                <button
                  type="button"
                  className={`cmp-phase-tab ${activePhaseTab === 'phase2' ? 'is-active' : ''}`}
                  onClick={() => setActivePhaseTab('phase2')}
                >
                  <Moon size={13} color="#6366f1" />
                  <span>{t.phase2Title} ({splitData.phase2.length})</span>
                </button>
              </div>
            )}

            {/* Category Quick-Filter Chips */}
            <div className="cmp-cat-chips" role="tablist" aria-label="Active categories">
              {SEARCH_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={searchCategory === cat.id}
                  className={`cmp-cat-chip ${searchCategory === cat.id ? 'is-active' : ''}`}
                  onClick={() => {
                    setSearchCategory(cat.id);
                    setIsSearchOpen(true);
                    triggerHaptic('selection');
                  }}
                >
                  {cat.label[lang] || cat.label.en}
                </button>
              ))}
            </div>

            {/* Search Combobox */}
            <div className="cmp-search" ref={searchWrapRef}>
              <Search size={16} className="cmp-search-icon" />
              <input
                type="search"
                value={query}
                placeholder={t.searchPh}
                onChange={(e) => { setQuery(e.target.value); setIsSearchOpen(true); }}
                onFocus={() => setIsSearchOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchResults[0]) { e.preventDefault(); addActive(searchResults[0]); }
                  if (e.key === 'Escape') setIsSearchOpen(false);
                }}
                aria-label={t.searchPh}
                disabled={items.length >= MAX_ACTIVES}
              />
              {query && (
                <button type="button" className="cmp-search-clear" onClick={() => setQuery('')} aria-label="Clear">
                  <X size={14} />
                </button>
              )}
              {isSearchOpen && (
                <div className="cmp-search-results" role="listbox">
                  {!query.trim() && searchResults.length > 0 && (
                    <div className="cmp-search-pop-head">{t.popularHeader}</div>
                  )}
                  {searchResults.length === 0 ? (
                    <div className="cmp-search-empty">{t.noResults}</div>
                  ) : searchResults.map(api => (
                    <button key={api.id} type="button" role="option" aria-selected="false" className="cmp-search-item" onClick={() => addActive(api)}>
                      <span>
                        <strong>{api.name}</strong>
                        <small>{api.spec}</small>
                      </span>
                      <Plus size={15} />
                    </button>
                  ))}
                </div>
              )}
            </div>
            {items.length >= MAX_ACTIVES && <p className="cmp-hint-warn">{t.warnMax}</p>}

            {/* Selected Actives */}
            {items.length === 0 ? (
              <div className="cmp-empty">
                <FlaskConical size={28} />
                <strong>{t.emptyTitle}</strong>
                <span>{t.emptySub}</span>
                <button
                  type="button"
                  className="cmp-goals-wizard-btn"
                  style={{ marginTop: '10px' }}
                  onClick={() => {
                    triggerHaptic('selection');
                    setIsGoalsWizardOpen(true);
                  }}
                >
                  <Sparkles size={14} />
                  <span>{t.goalsWizardBtn}</span>
                </button>
              </div>
            ) : (
              <ul className="cmp-items">
                {visibleItems.map((i, idx) => (
                  <ActiveIngredientCard
                    key={i.apiId}
                    item={i}
                    index={idx}
                    lang={lang}
                    t={t}
                    totalMg={totalMg}
                    onStepDose={stepDose}
                    onUpdateDose={updateDose}
                    onCommitDose={commitDose}
                    onRemove={removeActive}
                  />
                ))}
              </ul>
            )}

            <ClinicalIntelligencePanel
              lang={lang}
              t={t}
              activeSynergies={activeSynergies}
              chronoWarning={chronoWarning}
              overlapWarnings={overlapWarnings}
              synergySuggestions={synergySuggestions}
              isSplitProtocol={isSplitProtocol}
              onToggleSplit={toggleSplitProtocol}
              onAddActive={addActive}
            />

            {/* Bottle size */}
            <div className="cmp-bottle" style={{ marginTop: '16px' }}>
              <span className="cmp-label">{t.bottle}</span>
              <div className="cmp-bottle-options" role="radiogroup" aria-label={t.bottle}>
                {CAPSULE_BOTTLE_SIZES.map(b => (
                  <button
                    key={b.count}
                    type="button"
                    role="radio"
                    aria-checked={capsPerBottle === b.count}
                    className={`cmp-bottle-opt ${capsPerBottle === b.count ? 'is-active' : ''}`}
                    onClick={() => { setCapsPerBottle(b.count); triggerHaptic('selection'); }}
                  >
                    <strong>{b.count} caps</strong>
                    {b.savingsPercent ? <small className="cmp-save">-{b.savingsPercent}%</small> : <small>{b.badge.split(' / ')[0]}</small>}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Live Galenic Jump Bar */}
            {galenics && (
              <div className="cmp-mobile-galenic-bar">
                <span>
                  <strong>{galenics.size.size}</strong> · {galenics.fillPct}% {t.fill} · {galenics.capsPerDay} {t.capsDay}
                </span>
                <button
                  type="button"
                  className="cmp-mobile-galenic-jump"
                  onClick={() => document.getElementById('cmp-summary-panel')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  {lang === 'es' ? 'Ver resumen ↓' : 'View summary ↓'}
                </button>
              </div>
            )}
          </section>

          {/* Step 3: Galenic Summary & Request */}
          <GalenicSummaryPanel
            t={t}
            lang={lang}
            embedded={embedded}
            showPricing={embedded}
            items={items}
            formulaName={formulaName}
            setFormulaName={setFormulaName}
            displayName={displayName}
            activeGeneticProfile={activeGeneticProfile}
            onClearGeneticProfile={() => { setActiveGeneticProfile(null); setActiveFineTuningNotes([]); }}
            galenics={galenics}
            isSplitProtocol={isSplitProtocol}
            splitData={splitData}
            splitGalenics={splitGalenics}
            capsPerBottle={capsPerBottle}
            costEstimate={costEstimate}
            pricingChannel={pricingChannel}
            setPricingChannel={setPricingChannel}
            isIssuingPrescription={isIssuingPrescription}
            isExporting={isExporting}
            aiContextQuery={aiContextQuery}
            savedFormulas={savedFormulas}
            onSaveFormula={saveCurrentFormula}
            onLoadSavedFormula={loadSavedFormula}
            onRemoveSavedFormula={removeSavedFormula}
            onIssueDoctorPrescription={handleIssueDoctorPrescription}
            onRequest={handleRequest}
            onExportPdf={handleExportPdf}
            onCopyLink={handleCopyLink}
          />
        </div>

        <p className="cmp-disclaimer">{t.disclaimer}</p>
      </main>

      <PublicInstitutionalInquiryDrawer
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        contextType="brand_collection"
        brandType="ultraperson"
        initialEntity={{
          name: displayName,
          code: 'CUSTOM-FORMULA',
          strength: formulaSummary,
          brandSlug: 'ultraperson',
          brandName: 'Atlas Custom Compounding',
          catalogCount: items.length
        }}
        lang={lang}
      />

      <CompoundingGoalWizard
        isOpen={isGoalsWizardOpen}
        onClose={() => setIsGoalsWizardOpen(false)}
        catalog={catalog}
        lang={lang}
        onApplyProposal={handleApplyProposal}
      />

      {!embedded && <PublicUnifiedFooter lang={lang} />}

      {!embedded && (
        <PublicStickyActionBar
          title={displayName}
          subtitle={items.length
            ? `${items.length} ${t.actives}${galenics ? ` · ${galenics.size.size} (${galenics.fillPct}%) · ${galenics.capsPerDay} ${t.capsDay}` : ''}`
            : t.title}
          badge="Compounding"
          badgeType="protocol"
          inquireLabel={t.request}
          onInquire={handleRequest}
          showClinicalAI={true}
          aiContextQuery={aiContextQuery}
          aiCategory="compounding"
          lang={lang}
        />
      )}
    </div>
  );
}
