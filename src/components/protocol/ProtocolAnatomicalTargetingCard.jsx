"use client";

import React, { useState } from 'react';
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  Clock,
  ChevronRight,
  Copy,
  Check,
  FileText,
  Layers,
  Sparkles
} from '@/lib/icons';
import { toast } from 'react-hot-toast';
import './ProtocolAnatomicalTargetingCard.css';

export default function ProtocolAnatomicalTargetingCard({ protocol, lang = 'en' }) {
  const isEs = lang === 'es';
  const targeting = protocol?.anatomical_targeting;
  const mechanotherapy = protocol?.mechanotherapy_phases || [];
  const tissueDosages = protocol?.tissue_specific_dosages || [];
  const safetyScreen = protocol?.angiogenesis_safety_screen;

  // Render only if protocol has these specific musculoskeletal metadata fields
  if (!targeting && mechanotherapy.length === 0 && tissueDosages.length === 0 && !safetyScreen) {
    return null;
  }

  const [activeTab, setActiveTab] = useState('targeting');
  const [selectedModeId, setSelectedModeId] = useState(() => targeting?.modes?.[0]?.id || 'perilesional');
  const [copiedCadence, setCopiedCadence] = useState(false);

  const selectedMode = targeting?.modes?.find(m => m.id === selectedModeId) || targeting?.modes?.[0];

  const [copiedHeader, setCopiedHeader] = useState(false);

  const handleCopyAnatomicalGuide = async () => {
    const text = isEs
      ? `*Pautas de Inyección Anatómica — Protocolo BPC-157 & TB-500*\n\n` +
        `• Infiltración Perilesional: Subcutánea a 2,0 – 4,0 cm del epicentro del dolor (NO inyectar dentro del tendón para evitar sobrepresión).\n` +
        `• Aguja recomendada: 31G 8mm en ángulo de 45°.\n` +
        `• Fase 1 Fisioterapia (Sem 1-2): Reposo relativo y contracciones isométricas suaves (sin movimiento articular brusco).\n` +
        `• Fase 2 Mecanoterapia (Sem 3-5): Carga excéntrica progresiva lenta para organizar el colágeno tipo I.\n\n` +
        `Atlas Services Clinical Reference • Medicina Regenerativa`
      : `*Anatomical Injection & Rehab Guidelines — BPC-157 & TB-500 Stack*\n\n` +
        `• Peri-Lesional Infiltration: SubQ within 2.0 – 4.0 cm radius of lesion (NEVER inject intratendinous).\n` +
        `• Needle Specification: 31G 8mm ultra-fine at 45° angle.\n` +
        `• Phase 1 Rehab (Weeks 1-2): Low-intensity isometrics, protected range of motion (collagen III synthesis).\n` +
        `• Phase 2 Rehab (Weeks 3-5): Progressive heavy slow eccentric resistance under Davis' Law.\n\n` +
        `Atlas Services Clinical Reference • Regenerative Sports Medicine`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedHeader(true);
      toast.success(isEs ? 'Pauta anatómica copiada al portapapeles' : 'Anatomical guideline copied to clipboard');
      setTimeout(() => setCopiedHeader(false), 2500);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  const handleCopyModeGuide = async (mode) => {
    const name = isEs ? mode.name_es : mode.name;
    const geom = isEs ? mode.geometry_es : mode.geometry;
    const needle = isEs ? mode.needle_spec_es : mode.needle_spec;
    const warn = isEs ? mode.clinical_warning_es : mode.clinical_warning;
    const text = `*${name}*\n📍 Geometría: ${geom}\n💉 Aguja: ${needle}\n⚠️ Precaución: ${warn}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedCadence(true);
      toast.success(isEs ? 'Técnica de inyección copiada al portapapeles' : 'Injection guide copied to clipboard');
      setTimeout(() => setCopiedCadence(false), 2500);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  return (
    <section id="anatomical-targeting" className="patc-container">
      {/* ── Section Header (Google Cloud UX) ── */}
      <div className="patc-header">
        <div className="patc-header-main">
          <div className="patc-header-icon-box">
            <Activity size={20} className="patc-header-icon" />
          </div>
          <div>
            <div className="patc-header-chips">
              <span className="patc-chip patc-chip-cyan">Tissue Regeneration Engine</span>
              <span className="patc-chip patc-chip-purple">Davis' Law Mechanotherapy</span>
              <span className="patc-chip patc-chip-amber">VEGF Safety Screen</span>
            </div>
            <h3 className="patc-title">
              {isEs
                ? 'Técnica Anatómica de Inyección y Mecanoterapia de Carga'
                : 'Anatomical Injection Geometry & Mechanotherapy Pathway'}
            </h3>
            <p className="patc-subtitle">
              {isEs
                ? 'Mapeo perilesional específico para tendones y ligamentos, fases biológicas de remodelación de colágeno y pautas por tejido.'
                : 'Peri-lesional musculoskeletal infiltration geometry, biological collagen transition phases, and tissue-specific dosages.'}
            </p>
          </div>
        </div>

        <div className="patc-header-cta-group">
          <button
            type="button"
            className="patc-copy-header-btn"
            onClick={handleCopyAnatomicalGuide}
            title={isEs ? 'Copiar pauta anatómica y técnica de inyección al portapapeles' : 'Copy anatomical guideline and injection protocol to clipboard'}
          >
            {copiedHeader ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
            <span>{copiedHeader ? (isEs ? 'Pauta Copiada' : 'Guideline Copied') : (isEs ? 'Copiar Pauta Anatómica' : 'Copy Anatomical Guide')}</span>
          </button>
        </div>
      </div>

      {/* ── Google Cloud Subnav Tabs ── */}
      <div className="patc-nav-tabs" role="tablist">
        {targeting && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'targeting'}
            className={`patc-nav-tab ${activeTab === 'targeting' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('targeting')}
          >
            <span className="patc-tab-dot patc-dot-cyan" />
            <span>{isEs ? 'Geometría de Inyección' : 'Injection Geometry'}</span>
          </button>
        )}

        {mechanotherapy.length > 0 && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'mechanotherapy'}
            className={`patc-nav-tab ${activeTab === 'mechanotherapy' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('mechanotherapy')}
          >
            <span className="patc-tab-dot patc-dot-purple" />
            <span>{isEs ? 'Fases de Mecanoterapia' : 'Rehab & Mechanotherapy'}</span>
          </button>
        )}

        {tissueDosages.length > 0 && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'tissues'}
            className={`patc-nav-tab ${activeTab === 'tissues' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('tissues')}
          >
            <span className="patc-tab-dot patc-dot-green" />
            <span>{isEs ? 'Pautas por Tejido Diana' : 'Tissue-Specific Dosages'}</span>
          </button>
        )}

        {safetyScreen && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'safety'}
            className={`patc-nav-tab ${activeTab === 'safety' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('safety')}
          >
            <span className="patc-tab-dot patc-dot-red" />
            <span>{isEs ? 'Seguridad Angiogénica (VEGF)' : 'Angiogenesis Safety'}</span>
          </button>
        )}
      </div>

      {/* ── Tab 1: Injection Geometry (Peri-Lesional vs Systemic) ── */}
      {activeTab === 'targeting' && targeting && (
        <div className="patc-tab-panel">
          <div className="patc-mode-selector">
            {(targeting.modes || []).map(m => (
              <button
                key={m.id}
                type="button"
                className={`patc-mode-pill ${selectedModeId === m.id ? 'is-selected' : ''}`}
                onClick={() => setSelectedModeId(m.id)}
              >
                <span>{m.id === 'perilesional' ? '🎯' : '🌐'}</span>
                <span>{isEs ? m.name_es : m.name}</span>
              </button>
            ))}
          </div>

          {selectedMode && (
            <div className="patc-mode-card">
              <div className="patc-mode-top">
                <div className="patc-mode-badge-col">
                  <span className="patc-badge-pill">
                    {selectedMode.id === 'perilesional'
                      ? (isEs ? 'Recomendado en Lesión Musculoesquelética' : 'Recommended for MSK Lesions')
                      : (isEs ? 'Enfoque Sistémico / Gastrointestinal' : 'Systemic / Gastrointestinal Focus')}
                  </span>
                  <h4 className="patc-mode-title">{isEs ? selectedMode.name_es : selectedMode.name}</h4>
                </div>
                <button
                  type="button"
                  className="patc-copy-btn"
                  onClick={() => handleCopyModeGuide(selectedMode)}
                  title={isEs ? 'Copiar técnica al portapapeles' : 'Copy technique to clipboard'}
                >
                  {copiedCadence ? <Check size={12} style={{ color: '#10b981' }} /> : <Copy size={12} />}
                  <span>{copiedCadence ? (isEs ? 'Copiado' : 'Copied') : (isEs ? 'Copiar Técnica' : 'Copy Technique')}</span>
                </button>
              </div>

              <div className="patc-mode-details-grid">
                <div className="patc-detail-block">
                  <span className="patc-detail-label">{isEs ? 'Indicación Primaria' : 'Best Suited For'}</span>
                  <p className="patc-detail-text">{isEs ? selectedMode.best_for_es : selectedMode.best_for}</p>
                </div>
                <div className="patc-detail-block">
                  <span className="patc-detail-label">{isEs ? 'Radio y Geometría de Punción' : 'Puncture Radius & Geometry'}</span>
                  <p className="patc-detail-text pcc-bold-text">{isEs ? selectedMode.geometry_es : selectedMode.geometry}</p>
                </div>
                <div className="patc-detail-block">
                  <span className="patc-detail-label">{isEs ? 'Calibre y Ángulo de Aguja' : 'Needle Gauge & Infiltration Angle'}</span>
                  <p className="patc-detail-text">{isEs ? selectedMode.needle_spec_es : selectedMode.needle_spec}</p>
                </div>
              </div>

              {selectedMode.clinical_warning && (
                <div className={`patc-alert-strip ${selectedMode.id === 'perilesional' ? 'is-danger' : 'is-info'}`}>
                  <AlertTriangle size={18} className="patc-alert-icon" />
                  <p className="patc-alert-text">
                    {isEs ? selectedMode.clinical_warning_es : selectedMode.clinical_warning}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Tab 2: Mechanotherapy & Rehabilitation Timeline ── */}
      {activeTab === 'mechanotherapy' && mechanotherapy.length > 0 && (
        <div className="patc-tab-panel">
          <div className="patc-mech-intro">
            <h4 className="patc-mech-intro-title">
              {isEs ? 'Sinergia Biomecánica: Péptidos + Ley de Davis' : 'Biomechanical Synergy: Peptides + Davis\' Law'}
            </h4>
            <p className="patc-mech-intro-desc">
              {isEs
                ? 'Los péptidos BPC-157 y TB-500 inducen angiogénesis y reclutan tenocitos. Sin embargo, para orientar longitudinalmente las fibras de colágeno y prevenir tejido cicatricial fibrótico desorganizado, es obligatorio aplicar cargas mecánicas graduadas según la fase celular.'
                : 'BPC-157 and TB-500 accelerate tenocyte proliferation and angiogenic sprouting. However, directional tensile alignment of collagen fibers requires progressive mechanical loading aligned with biological cross-linking phases.'}
            </p>
          </div>

          <div className="patc-mech-timeline">
            {mechanotherapy.map((phase) => (
              <div key={phase.phase} className="patc-phase-card">
                <div className="patc-phase-header">
                  <span className="patc-phase-number">0{phase.phase}</span>
                  <span className="patc-phase-weeks">{isEs ? phase.weeks_es : phase.weeks}</span>
                  <h5 className="patc-phase-title">{isEs ? phase.title_es : phase.title}</h5>
                </div>
                <div className="patc-phase-body">
                  <div className="patc-phase-row">
                    <span className="patc-phase-label">{isEs ? 'Mecanismo Biológico:' : 'Biological Target:'}</span>
                    <p className="patc-phase-text">{isEs ? phase.biological_target_es : phase.biological_target}</p>
                  </div>
                  <div className="patc-phase-row patc-phase-guideline-box">
                    <span className="patc-phase-label patc-label-rehab">{isEs ? 'Pauta de Fisioterapia y Carga:' : 'Physiotherapy & Loading Protocol:'}</span>
                    <p className="patc-phase-text patc-rehab-text">{isEs ? phase.rehab_guideline_es : phase.rehab_guideline}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab 3: Tissue-Specific Dosages ── */}
      {activeTab === 'tissues' && tissueDosages.length > 0 && (
        <div className="patc-tab-panel">
          <div className="patc-tissue-grid">
            {tissueDosages.map((t, idx) => (
              <div key={idx} className="patc-tissue-card">
                <div className="patc-tissue-header">
                  <h5 className="patc-tissue-name">{isEs ? t.tissue_es : t.tissue}</h5>
                  <span className="patc-tissue-dur">{t.duration}</span>
                </div>
                <div className="patc-tissue-doses">
                  <div className="patc-dose-item">
                    <span className="patc-dose-label">BPC-157</span>
                    <span className="patc-dose-val">{t.bpc_dose}</span>
                  </div>
                  <div className="patc-dose-item">
                    <span className="patc-dose-label">TB-500</span>
                    <span className="patc-dose-val">{t.tb_dose}</span>
                  </div>
                </div>
                {t.clinical_notes && (
                  <p className="patc-tissue-notes">
                    <strong>{isEs ? 'Nota Clínica:' : 'Clinical Pearl:'}</strong> {t.clinical_notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab 4: Angiogenesis Safety Screen ── */}
      {activeTab === 'safety' && safetyScreen && (
        <div className="patc-tab-panel">
          <div className="patc-safety-card">
            <div className="patc-safety-header">
              <ShieldCheck size={20} className="patc-safety-icon" />
              <h4 className="patc-safety-title">{isEs ? safetyScreen.rule_title_es : safetyScreen.rule_title}</h4>
            </div>
            <p className="patc-safety-rationale">
              {isEs ? safetyScreen.rationale_es : safetyScreen.rationale}
            </p>

            <div className="patc-safety-contraindications">
              <span className="patc-contra-heading">{isEs ? 'Contraindicaciones Estrictas:' : 'Absolute Contraindications:'}</span>
              <ul className="patc-contra-list">
                {(isEs ? safetyScreen.contraindications_es : safetyScreen.contraindications || []).map((ci, idx) => (
                  <li key={idx} className="patc-contra-item">
                    <span className="patc-contra-cross">✕</span>
                    <span>{ci}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="patc-footer">
        <ShieldCheck size={14} className="patc-footer-shield" />
        <span>
          {isEs
            ? 'Metadatos anatómicos y de mecanoterapia validados bajo la Ley de Davis y estándares de medicina física y regenerativa.'
            : 'Anatomical targeting and mechanotherapy specifications validated under Davis\' Law of soft-tissue remodeling.'}
        </span>
      </div>
    </section>
  );
}
