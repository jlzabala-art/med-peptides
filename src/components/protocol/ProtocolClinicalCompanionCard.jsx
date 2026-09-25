"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  ShieldCheck,
  Clock,
  HelpCircle,
  FileText,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  Sparkles,
  Droplet
} from '@/lib/icons';
import { toast } from 'react-hot-toast';
import './ProtocolClinicalCompanionCard.css';

export default function ProtocolClinicalCompanionCard({ protocol, lang = 'en', biomarkerCalibration = null }) {
  const isEs = lang === 'es';
  const companion = protocol?.companion_diagnostic;
  const methylation = protocol?.methylation_support;
  const modalities = protocol?.administration_modalities || [];
  const chronobiology = protocol?.chronobiology;

  const calibratedModality = biomarkerCalibration?.modality === 'intravenous' ? 'intravenous' : 'subcutaneous';
  const [userSelectedModalityId, setUserSelectedModalityId] = useState(null);
  const selectedModalityId = userSelectedModalityId || (biomarkerCalibration?.modality ? calibratedModality : (modalities[0]?.id || 'subcutaneous'));
  const setSelectedModalityId = setUserSelectedModalityId;

  const [userActiveTab, setUserActiveTab] = useState(null);
  const activeTab = userActiveTab || (biomarkerCalibration?.modality ? 'modalities' : 'companion');
  const setActiveTab = setUserActiveTab;

  const [copiedCadenceId, setCopiedCadenceId] = useState(null);

  // If this protocol has none of these clinical companion metadata fields, don't render
  if (!companion && !methylation && modalities.length === 0 && !chronobiology) {
    return null;
  }

  const selectedModality = modalities.find(m => m.id === selectedModalityId) || modalities[0];

  const handleCopyGuideline = async (cadence) => {
    const title = isEs ? cadence.milestone_es : cadence.milestone;
    const timing = isEs ? cadence.timing_es : cadence.timing;
    const guide = isEs ? cadence.guideline_es : cadence.guideline;
    const text = `*Bloodo™ NAD Protocol Monitoring — ${title}*\n⏱ Timing: ${timing}\n📋 Guideline: ${guide}\n\n_Med-Peptides Clinical Protocol Companion_`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedCadenceId(cadence.id);
      toast.success(isEs ? 'Pauta copiada al portapapeles' : 'Guideline copied to clipboard');
      setTimeout(() => setCopiedCadenceId(null), 2500);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  const [copiedCadenceAll, setCopiedCadenceAll] = useState(false);

  const handleCopyMonitoringGuidelines = async () => {
    const protoName = protocol?.name || protocol?.title || 'NAD+ Cellular Optimization';
    const protoSlug = protocol?.slug || protocol?.protocol_slug || 'nad-plus-optimization';
    const text = isEs
      ? `*MEMORANDO CLÍNICO DE MONITORIZACIÓN Y CADENCIA DIAGNÓSTICA*\n` +
        `Protocolo: ${protoName}\n` +
        `Diagnóstico Acompañante: Bloodo™ Test Intracelular (pmol/10⁶ células)\n` +
        `Laboratorio Central: LifeLab1 (Vilna, Lituania) / Certificación CE-IVDR\n` +
        `----------------------------------------\n` +
        `*CRONOGRAMA DE TOMA DE MUESTRAS:*\n` +
        `1. Día 0 (Línea Basal):\n` +
        `   • Objetivo: Nivel intracelular pre-tratamiento.\n` +
        `   • Pauta pre-analítica: Si toma precursores orales (NMN/NR), suspender 2-3 semanas antes si es clínicamente apropiado.\n\n` +
        `2. Semana 4 (En Tratamiento - Nadir):\n` +
        `   • Objetivo: Respuesta temprana a la dosis y absorción celular.\n` +
        `   • ¡ADVERTENCIA!: NO suspender el tratamiento ni realizar lavado. Registrar dosis exacta (ej. 250 mg IV ayer) y hora de infusión/inyección.\n\n` +
        `3. Semana 8 (Consolidación):\n` +
        `   • Objetivo: Estabilización a largo plazo y ajuste de mantenimiento.\n` +
        `   • Pauta: Mantener exactamente la misma ventana horaria e intervalo tras la última dosis para comparabilidad seriada.\n\n` +
        `*SALVAGUARDA DE METILACIÓN:*\n` +
        `• TMG (Trimetilglicina) ratio 1:1 con precursores para prevenir agotamiento de donantes de metilo.\n\n` +
        `Verificación clínica: https://med-peptides-app-27a3a.web.app/proto/${protoSlug}\n` +
        `_Atlas Clinical Governance Engine · SSOT Standard_`
      : `*CLINICAL COMPANION DIAGNOSTICS & CADENCE MEMORANDUM*\n` +
        `Protocol: ${protoName}\n` +
        `Companion Diagnostic: Bloodo™ Intracellular Test (pmol/10⁶ cells)\n` +
        `Central Laboratory: LifeLab1 (Vilnius, EU) / CE-IVDR Certified\n` +
        `----------------------------------------\n` +
        `*SAMPLING CADENCE & PROTOCOL GUIDELINES:*\n` +
        `1. Day 0 (Baseline Level):\n` +
        `   • Purpose: Quantitative pre-treatment cellular NAD baseline.\n` +
        `   • Pre-analytical: If on oral NMN/NR precursors, a 2-3 week washout is recommended if clinically safe.\n\n` +
        `2. Week 4 (Mid-Cycle / On-Treatment):\n` +
        `   • Purpose: Assess therapeutic uptake and initial cellular response.\n` +
        `   • WARNING: DO NOT discontinue oral or IV treatment. Document exact previous dose and administration timestamp.\n\n` +
        `3. Week 8 (Consolidation & Maintenance):\n` +
        `   • Purpose: Confirm steady-state intracellular elevation.\n` +
        `   • Guideline: Maintain identical collection window relative to last dose for serial comparability.\n\n` +
        `*METHYLATION SAFEGUARD:*\n` +
        `• TMG (Trimethylglycine) ratio 1:1 to preserve methyl donor pools against NNMT consumption.\n\n` +
        `Verification: https://med-peptides-app-27a3a.web.app/proto/${protoSlug}\n` +
        `_Atlas Clinical Governance Engine · SSOT Standard_`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedCadenceAll(true);
      toast.success(isEs ? 'Memorando clínico copiado al portapapeles ✓' : 'Clinical memo copied to clipboard ✓');
      setTimeout(() => setCopiedCadenceAll(false), 2000);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  return (
    <section id="protocol-clinical-companion" className="pcc-container">
      {/* ── Section Header (Google Cloud UX) ── */}
      <div className="pcc-header">
        <div className="pcc-header-main">
          <div className="pcc-header-icon-box">
            <Activity size={20} className="pcc-header-icon" />
          </div>
          <div style={{ flex: 1 }}>
            <div className="pcc-header-chips">
              <span className="pcc-chip pcc-chip-blue">CE-IVDR Diagnostic Companion</span>
              <span className="pcc-chip pcc-chip-green">Pharmacokinetic Guidance</span>
              <span className="pcc-chip pcc-chip-slate">GCP SSOT Specification</span>
            </div>
            <h3 className="pcc-title">
              {isEs
                ? 'Diagnóstico Acompañante y Farmacocinética Clínica'
                : 'Companion Diagnostics & Clinical Pharmacokinetics'}
            </h3>
            <p className="pcc-subtitle">
              {isEs
                ? 'Monitorización cuantitativa de biomarcadores celulares, salvaguarda del eje de metilación (NNMT/SAMe) y cronobiología de administración.'
                : 'Objective cellular biomarker tracking, NNMT methylation safeguards, and circadian chronobiology parameters.'}
            </p>

            {/* ── 3-Attribute Clinical Key-Value Strip (Google Cloud Resource Strip) ── */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '0.65rem',
              marginTop: '0.90rem',
              width: '100%'
            }}>
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '0.55rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0284c7', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    {isEs ? 'Biomarcador Diana' : 'Target Biomarker'}
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
                    {companion ? 'NAD+ Intracelular (pmol/10⁶)' : (isEs ? 'Respuesta Metabólica' : 'Metabolic Response')}
                  </div>
                </div>
              </div>

              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '0.55rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    {isEs ? 'Eje de Metilación' : 'Methylation Axis'}
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
                    {methylation ? (isEs ? 'Salvaguarda NNMT / TMG' : 'NNMT / TMG Safeguard') : (isEs ? 'Eje Protegido' : 'Protected')}
                  </div>
                </div>
              </div>

              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '0.55rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d97706', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    {isEs ? 'Cronobiología' : 'Circadian Timing'}
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
                    {isEs ? 'Mañana (07:00–10:00) · Ayuno' : 'Morning (07:00–10:00) · Fasted'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {companion && (
          <div className="pcc-header-cta-group">
            <button
              type="button"
              className="pcc-wa-quick-btn"
              onClick={handleCopyMonitoringGuidelines}
              title={isEs ? 'Copiar memorando clínico de monitorización' : 'Copy clinical monitoring memorandum'}
            >
              {copiedCadenceAll ? <Check size={13} style={{ color: '#16a34a' }} /> : <Copy size={13} />}
              <span>{copiedCadenceAll ? (isEs ? 'Copiado ✓' : 'Copied ✓') : (isEs ? 'Copiar Memorando Clínico' : 'Copy Clinical Memo')}</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Google Cloud Console Navigation Tabs ── */}
      <div className="pcc-nav-tabs" role="tablist">
        {companion && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'companion'}
            className={`pcc-nav-tab ${activeTab === 'companion' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('companion')}
          >
            <span className="pcc-tab-dot pcc-dot-blue" />
            <span>{isEs ? 'Test Acompañante Bloodo™' : 'Bloodo™ Companion Test'}</span>
          </button>
        )}

        {modalities.length > 0 && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'modalities'}
            className={`pcc-nav-tab ${activeTab === 'modalities' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('modalities')}
          >
            <span className="pcc-tab-dot pcc-dot-purple" />
            <span>{isEs ? 'Modalidades (SC vs. Infusión IV)' : 'Modalities (SC vs. IV 250mg)'}</span>
          </button>
        )}

        {methylation && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'methylation'}
            className={`pcc-nav-tab ${activeTab === 'methylation' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('methylation')}
          >
            <span className="pcc-tab-dot pcc-dot-green" />
            <span>{isEs ? 'Salvaguarda de Metilación (TMG)' : 'Methylation Safeguards (TMG)'}</span>
          </button>
        )}

        {chronobiology && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'chronobiology'}
            className={`pcc-nav-tab ${activeTab === 'chronobiology' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('chronobiology')}
          >
            <span className="pcc-tab-dot pcc-dot-amber" />
            <span>{isEs ? 'Cronobiología & Horarios' : 'Circadian Chronobiology'}</span>
          </button>
        )}
      </div>

      {/* ── Tab 1: Companion Diagnostic & Sampling Cadence ── */}
      {activeTab === 'companion' && companion && (
        <div className="pcc-tab-panel">
          <div className="pcc-companion-hero">
            <div className="pcc-companion-meta">
              <div className="pcc-companion-title-row">
                <h4 className="pcc-companion-name">{isEs ? companion.name_es : companion.name}</h4>
                <Link
                  href={`/p/${companion.product_slug || 'bloodo-nad-level-test'}`}
                  className="pcc-companion-link"
                  title={isEs ? 'Ver ficha técnica completa del test' : 'View full diagnostic test datasheet'}
                >
                  <span>{isEs ? 'Ver Ficha del Test' : 'View Test Datasheet'}</span>
                  <ExternalLink size={13} />
                </Link>
              </div>
              <p className="pcc-companion-specs">
                <strong>{isEs ? 'Laboratorio:' : 'Central Lab:'}</strong> {companion.lab} •{' '}
                <strong>{isEs ? 'Matriz:' : 'Matrix:'}</strong> {companion.matrix} •{' '}
                <strong>{isEs ? 'Biomarcadores:' : 'Biomarkers:'}</strong> {companion.biomarkers?.join(', ')}
              </p>
            </div>
          </div>

          {/* Strategic Active Protocol Alert */}
          <div className="pcc-notice-box">
            <div className="pcc-notice-title">
              💡 {isEs ? 'Regla de Oro en Monitorización Terapéutica:' : 'Golden Rule in Therapeutic Monitoring:'}
            </div>
            <p className="pcc-notice-text">
              {isEs ? (
                <>
                  Si la prueba se realiza en la <strong>Semana 4 o durante el protocolo</strong>, <strong>NO debe suspenderse el tratamiento oral ni parenteral de NAD+</strong>. El objetivo médico es valorar la respuesta in-vivo y calibrar la dosis. Se debe documentar la última toma (ej. <em>250 mg IV ayer a las 14:00</em>) y mantener constante la hora de extracción.
                </>
              ) : (
                <>
                  When testing at <strong>Week 4 or during an active protocol</strong>, <strong>do NOT discontinue oral or IV NAD+ therapy</strong>. The clinical objective is assessing in-treatment therapeutic response and calibrating dosage. Simply document the exact treatments (e.g. <em>received 250 mg IV NAD+ yesterday at 14:00</em>) and standardise extraction time.
                </>
              )}
            </p>
          </div>

          {/* Google Cloud Symmetrical Balanced Cadence Grid */}
          <div className={`pcc-cadence-grid cols-${(companion.sampling_cadence || []).length}`}>
            {(companion.sampling_cadence || []).map((cad, idx) => {
              const mTitle = isEs ? cad.milestone_es : cad.milestone;
              const mTiming = isEs ? cad.timing_es : cad.timing;
              const mObj = isEs ? cad.objective_es : cad.objective;
              const mGuide = isEs ? cad.guideline_es : cad.guideline;
              const isCopied = copiedCadenceId === cad.id;
              const isMidProtocol = idx === 1;
              const isCalibratedMilestone = biomarkerCalibration && (
                (biomarkerCalibration.retest === '4w' && idx === 1) ||
                (biomarkerCalibration.retest === '8w' && idx === 2) ||
                (biomarkerCalibration.retest === '6m' && idx === 2) ||
                (biomarkerCalibration.retest === '12w' && idx === 2)
              );

              return (
                <div 
                  key={cad.id || idx} 
                  className={`pcc-cadence-card ${isCalibratedMilestone ? 'is-calibrated-target' : (isMidProtocol ? 'is-recommended' : '')}`}
                  style={isCalibratedMilestone ? { borderColor: '#0d9488', backgroundColor: '#f0fdfa' } : {}}
                >
                  <div className="pcc-cadence-badge-row">
                    <span className="pcc-cadence-step">0{idx + 1}</span>
                    <span className="pcc-cadence-timing">{mTiming}</span>
                    {isCalibratedMilestone ? (
                      <span style={{
                        fontSize: '0.64rem',
                        fontWeight: 800,
                        backgroundColor: '#0d9488',
                        color: '#ffffff',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em'
                      }}>
                        {isEs ? '★ Control DBS Calibrado' : '★ Calibrated Target Re-Test'}
                      </span>
                    ) : isMidProtocol ? (
                      <span className="pcc-cadence-pill-green">
                        {isEs ? 'Monitorización Activa' : 'Therapeutic Response'}
                      </span>
                    ) : null}
                  </div>
                  <h5 className="pcc-cadence-title">{mTitle}</h5>
                  <p className="pcc-cadence-objective">
                    <strong>{isEs ? 'Objetivo:' : 'Objective:'}</strong> {mObj}
                  </p>
                  <div className="pcc-cadence-guideline">
                    <strong>{isEs ? 'Pauta Clínica:' : 'Clinical Guideline:'}</strong> {mGuide}
                  </div>
                  <div className="pcc-cadence-actions">
                    <button
                      type="button"
                      className="pcc-cadence-btn"
                      onClick={() => handleCopyGuideline(cad)}
                      title={isEs ? 'Copiar esta pauta al portapapeles' : 'Copy this guideline to clipboard'}
                    >
                      {isCopied ? <Check size={12} style={{ color: '#10b981' }} /> : <Copy size={12} />}
                      <span>{isCopied ? (isEs ? 'Copiado' : 'Copied') : (isEs ? 'Copiar Pauta' : 'Copy Guideline')}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Tab 2: Administration Modalities (SC vs. IV 250mg) ── */}
      {activeTab === 'modalities' && modalities.length > 0 && (
        <div className="pcc-tab-panel">
          {/* Segmented Modality Selector */}
          <div className="pcc-modality-selector">
            {modalities.map(m => {
              const isPrescribedModality = biomarkerCalibration && (
                (biomarkerCalibration.modality === 'intravenous' && m.id === 'intravenous') ||
                (biomarkerCalibration.modality !== 'intravenous' && m.id === 'subcutaneous')
              );
              return (
                <button
                  key={m.id}
                  type="button"
                  className={`pcc-modality-pill ${selectedModalityId === m.id ? 'is-selected' : ''}`}
                  onClick={() => setSelectedModalityId(m.id)}
                >
                  <span>{m.id === 'intravenous' ? '💉' : '🩹'}</span>
                  <span>{isEs ? m.label_es : m.label}</span>
                  {isPrescribedModality && (
                    <span style={{
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      backgroundColor: '#0d9488',
                      color: '#ffffff',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginLeft: '0.35rem'
                    }}>
                      {isEs ? '★ Prescrita para tu Nivel' : '★ Prescribed Route'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {selectedModality && (
            <div className="pcc-modality-detail-card">
              <div className="pcc-detail-row">
                <div className="pcc-detail-item">
                  <span className="pcc-detail-label">{isEs ? 'Vía de Administración' : 'Administration Route'}</span>
                  <span className="pcc-detail-value">{selectedModality.route}</span>
                </div>
                <div className="pcc-detail-item">
                  <span className="pcc-detail-label">{isEs ? 'Rango de Dosis' : 'Dose Range'}</span>
                  <span className="pcc-detail-value pcc-highlight-green">
                    {isEs ? selectedModality.dose_range_es : selectedModality.dose_range}
                  </span>
                </div>
                {selectedModality.vehicle && (
                  <div className="pcc-detail-item">
                    <span className="pcc-detail-label">{isEs ? 'Vehículo / Solvente' : 'Diluent Vehicle'}</span>
                    <span className="pcc-detail-value">{selectedModality.vehicle}</span>
                  </div>
                )}
                {selectedModality.infusion_rate && (
                  <div className="pcc-detail-item">
                    <span className="pcc-detail-label">{isEs ? 'Velocidad de Goteo' : 'Infusion Rate Limit'}</span>
                    <span className="pcc-detail-value pcc-highlight-blue">
                      {isEs ? selectedModality.infusion_rate_es : selectedModality.infusion_rate}
                    </span>
                  </div>
                )}
              </div>

              <div className="pcc-modality-section-block">
                <div className="pcc-section-subtitle">
                  {isEs ? '⏱ Duración y Tolerancia Vasomotora' : '⏱ Infusion Duration & Vasomotor Tolerance'}
                </div>
                <p className="pcc-modality-text">
                  <strong>{isEs ? 'Duración:' : 'Duration:'}</strong>{' '}
                  {isEs ? selectedModality.infusion_duration_es : selectedModality.infusion_duration}
                </p>
                <p className="pcc-modality-text">
                  <strong>{isEs ? 'Tolerancia y Manejo:' : 'Vasomotor Management:'}</strong>{' '}
                  {isEs ? selectedModality.vasomotor_tolerance_es : selectedModality.vasomotor_tolerance}
                </p>
              </div>

              <div className="pcc-modality-section-block">
                <div className="pcc-section-subtitle">
                  {isEs ? '🎯 Indicación y Perfil Clínico Recomendado' : '🎯 Best Suited Clinical Profile'}
                </div>
                <p className="pcc-modality-text">
                  {isEs ? selectedModality.best_for_es : selectedModality.best_for}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab 3: Methylation & Safety Safeguards (NNMT Axis) ── */}
      {activeTab === 'methylation' && methylation && (
        <div className="pcc-tab-panel">
          <div className="pcc-methylation-hero">
            <div className="pcc-meth-warning-header">
              <AlertTriangle size={18} className="pcc-meth-alert-icon" />
              <h4 className="pcc-meth-title">{isEs ? methylation.warning_es : methylation.warning}</h4>
            </div>
            <p className="pcc-meth-rationale">
              {isEs ? methylation.rationale_es : methylation.rationale}
            </p>
          </div>

          <div className="pcc-compounds-list">
            {(methylation.recommended_compounds || []).map((comp, idx) => (
              <div key={idx} className="pcc-compound-card">
                <div className="pcc-compound-top">
                  <div className="pcc-compound-badge-name">
                    <span className="pcc-compound-tag">{isEs ? 'Cofactor de Seguridad' : 'Safety Cofactor'}</span>
                    <h5 className="pcc-compound-name">{isEs ? comp.name_es : comp.name}</h5>
                  </div>
                  <div className="pcc-compound-dose">
                    <span className="pcc-dose-pill">{isEs ? comp.dosage_es : comp.dosage}</span>
                  </div>
                </div>
                <div className="pcc-compound-body">
                  <p className="pcc-compound-timing">
                    <strong>{isEs ? 'Pauta y Horario:' : 'Administration Timing:'}</strong>{' '}
                    {isEs ? comp.timing_es : comp.timing}
                  </p>
                  <p className="pcc-compound-purpose">
                    <strong>{isEs ? 'Fundamento Farmacológico:' : 'Pharmacological Mechanism:'}</strong>{' '}
                    {isEs ? comp.purpose_es : comp.purpose}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab 4: Chronobiology & Circadian Timing ── */}
      {activeTab === 'chronobiology' && chronobiology && (
        <div className="pcc-tab-panel">
          <div className="pcc-chrono-grid">
            <div className="pcc-chrono-card pcc-chrono-morning">
              <div className="pcc-chrono-icon-row">
                <span className="pcc-chrono-emoji">☀️</span>
                <span className="pcc-chrono-badge-green">{isEs ? 'Ventana Óptima' : 'Optimal Window'}</span>
              </div>
              <h5 className="pcc-chrono-window-time">
                {isEs ? chronobiology.optimal_window_es : chronobiology.optimal_window}
              </h5>
              <p className="pcc-chrono-window-desc">
                {isEs
                  ? 'Alineado con el pico circadiano natural de sirtuínas (SIRT1) y la máxima demanda diurna de ATP mitocondrial.'
                  : 'Aligned with peak circadian SIRT1 deacetylase activity and diurnal mitochondrial ATP bioenergetic demand.'}
              </p>
            </div>

            <div className="pcc-chrono-card pcc-chrono-blackout">
              <div className="pcc-chrono-icon-row">
                <span className="pcc-chrono-emoji">🌙</span>
                <span className="pcc-chrono-badge-red">{isEs ? 'Ventana Bloqueada' : 'Blackout Window'}</span>
              </div>
              <h5 className="pcc-chrono-window-time">
                {isEs ? chronobiology.blackout_window_es : chronobiology.blackout_window}
              </h5>
              <p className="pcc-chrono-window-desc">
                {isEs
                  ? 'Contraindicado en horas vespertinas/nocturnas para evitar la activación simpática y el insomnio de conciliación.'
                  : 'Avoid late afternoon or evening administration to prevent autonomic stimulation and REM sleep fragmentation.'}
              </p>
            </div>
          </div>

          <div className="pcc-chrono-rationale-box">
            <Clock size={16} className="pcc-chrono-clock-icon" />
            <p className="pcc-chrono-rationale-text">
              {isEs ? chronobiology.circadian_rationale_es : chronobiology.circadian_rationale}
            </p>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="pcc-footer">
        <ShieldCheck size={14} className="pcc-footer-shield" />
        <span>
          {isEs
            ? 'Metadatos clínicos farmacológicos revisados conforme a los estándares de medicina regenerativa y longevidad celular.'
            : 'Clinical pharmacological parameters verified according to international regenerative & mitochondrial medicine guidelines.'}
        </span>
      </div>
    </section>
  );
}
