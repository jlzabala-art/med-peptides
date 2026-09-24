"use client";

import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Activity,
  Copy,
  Check,
  Sparkles,
  Layers,
  FileText,
  AlertTriangle
} from '@/lib/icons';
import { toast } from 'react-hot-toast';
import './ProtocolImmuneModulationCard.css';

export default function ProtocolImmuneModulationCard({ protocol, lang = 'en' }) {
  const isEs = lang === 'es';
  const imm = protocol?.immune_modulation_matrix;

  if (!imm) return null;

  const [activeTab, setActiveTab] = useState('mechanism');
  const [copiedCadence, setCopiedCadence] = useState(false);

  const lineage = imm.regulatory_lineage;
  const mechanism = imm.dual_orchestration_mechanism;
  const tiers = imm.stratified_dosing_schemes || [];
  const labs = imm.laboratory_biomarkers;

  const [copiedHeader, setCopiedHeader] = useState(false);

  const handleCopyImmuneGuide = async () => {
    const text = isEs
      ? `*Pautas Inmunitarias Clínicas — Timosina Alfa-1 (TA-1)*\n\n` +
        `• Linaje Terapéutico: Fármaco huérfano FDA (Zadaxin® en >30 países) para restauración tímica y soporte inmune.\n` +
        `• Mecanismo Dual: Estimula linfocitos citotóxicos CD4+/CD8+ y células NK, a la vez que estabiliza linfocitos T-reguladores (FoxP3+) para evitar autoinmunidad.\n` +
        `• Pauta Activa: 1,6 mg SubQ 2–3 veces por semana durante 4–8 semanas.\n` +
        `• Pauta Estacional: 1,6 mg semanal o ciclo de 10 días seguidos en cambios estacionales.\n\n` +
        `Atlas Services Clinical Reference • Inmunología & Longevidad`
      : `*Clinical Immune Guidelines — Thymosin Alpha-1 (TA-1)*\n\n` +
        `• Therapeutic Lineage: FDA Orphan Drug designation (Zadaxin® lineage) for thymic restoration.\n` +
        `• Dual Orchestration: Activates CD4+/CD8+ and NK cells while stabilizing FoxP3+ T-regs to prevent autoimmune hyper-reactivity.\n` +
        `• Active Induction: 1.6 mg SubQ 2–3 times weekly for 4–8 weeks.\n` +
        `• Seasonal Maintenance: 1.6 mg once weekly or 10-day pulse during seasonal transitions.\n\n` +
        `Atlas Services Clinical Reference • Cellular Immunology`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedHeader(true);
      toast.success(isEs ? 'Pautas inmunitarias copiadas al portapapeles' : 'Immune guidelines copied to clipboard');
      setTimeout(() => setCopiedHeader(false), 2500);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  const handleCopyTier = async (tier) => {
    const title = isEs ? tier.tier_es : tier.tier;
    const dose = isEs ? tier.dosage_es : tier.dosage;
    const goal = isEs ? tier.clinical_goal_es : tier.clinical_goal;
    const text = `*${title}*\n💉 ${dose}\n🎯 ${goal}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedCadence(true);
      toast.success(isEs ? 'Pauta inmunológica copiada al portapapeles' : 'Immune protocol copied to clipboard');
      setTimeout(() => setCopiedCadence(false), 2500);
    } catch {
      toast.error('Could not copy');
    }
  };

  return (
    <section id="immune-modulation" className="pimc-container">
      {/* ── Section Header (Google Cloud UX) ── */}
      <div className="pimc-header">
        <div className="pimc-header-main">
          <div className="pimc-header-icon-box">
            <ShieldAlert size={20} className="pimc-header-icon" />
          </div>
          <div>
            <div className="pimc-header-chips">
              <span className="pimc-chip pimc-chip-cyan">Zadaxin® Lineage</span>
              <span className="pimc-chip pimc-chip-purple">CD4/CD8 Orchestration</span>
              <span className="pimc-chip pimc-chip-emerald">FoxP3+ T-Reg Guard</span>
            </div>
            <h3 className="pimc-title">
              {isEs
                ? 'Matriz de Modulación Inmune: Linaje Zadaxin®, Linfocitos T y Tolerancia'
                : 'Immune Modulation Matrix: Zadaxin® Lineage & T-Cell Orchestration'}
            </h3>
            <p className="pimc-subtitle">
              {isEs
                ? 'Activación dual de linfocitos CD4+/CD8+ y NK, expansión de T-reguladores contra autoinmunidad y pautas estratificadas.'
                : 'Dual activation of CD4+/CD8+ effector cells and natural killer (NK) cells with FoxP3+ T-reg immune tolerance balancing.'}
            </p>
          </div>
        </div>

        <div className="pimc-header-cta-group">
          <button
            type="button"
            className="pimc-btn pimc-btn-outline"
            onClick={handleCopyImmuneGuide}
            title={isEs ? 'Copiar pautas inmunitarias al portapapeles' : 'Copy immune guidelines to clipboard'}
          >
            {copiedHeader ? <Check size={14} style={{ color: '#16a34a' }} /> : <Copy size={14} />}
            <span>{copiedHeader ? (isEs ? 'Pautas Copiadas' : 'Guidelines Copied') : (isEs ? 'Copiar Pautas Inmunes' : 'Copy Immune Guidelines')}</span>
          </button>
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <div className="pimc-tabs-nav" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'mechanism'}
          className={`pimc-tab-btn ${activeTab === 'mechanism' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('mechanism')}
        >
          <Shield size={14} />
          <span>{isEs ? 'Linaje & Mecanismo Dual' : 'Lineage & Dual Mechanism'}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'dosing'}
          className={`pimc-tab-btn ${activeTab === 'dosing' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('dosing')}
        >
          <Clock size={14} />
          <span>{isEs ? 'Estratificación Posológica' : 'Stratified Dosing Tiers'}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'labs'}
          className={`pimc-tab-btn ${activeTab === 'labs' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('labs')}
        >
          <FileText size={14} />
          <span>{isEs ? 'Panel Inmunológico de Control' : 'Immune Lab Surveillance'}</span>
        </button>
      </div>

      {/* ── Tab 1: Mechanism & Lineage ── */}
      {activeTab === 'mechanism' && (
        <div className="pimc-tab-pane">
          {/* Regulatory Banner */}
          {lineage && (
            <div className="pimc-lineage-card">
              <div className="pimc-lineage-badge">{isEs ? 'ESTATUS REGULATORIO Y TRASFONDO CLÍNICO' : 'REGULATORY STATUS & CLINICAL LINEAGE'}</div>
              <h4 className="pimc-lineage-title">{isEs ? lineage.fda_status_es : lineage.fda_status}</h4>
              <p className="pimc-lineage-text">
                <strong>{isEs ? 'Indicaciones clínicas estudiadas:' : 'Investigated indications:'}</strong> {isEs ? lineage.clinical_indications_es : lineage.clinical_indications}
              </p>
            </div>
          )}

          {/* Dual Mechanism Grid */}
          {mechanism && (
            <div className="pimc-mechanism-grid">
              <div className="pimc-mech-card pimc-mech-effector">
                <div className="pimc-mech-icon">
                  <Activity size={18} />
                </div>
                <div>
                  <div className="pimc-mech-title">
                    {isEs ? '1. Activación Efectora Citotóxica' : '1. Cytotoxic Effector Activation'}
                  </div>
                  <p className="pimc-mech-text">
                    {isEs ? mechanism.effector_activation_es : mechanism.effector_activation}
                  </p>
                </div>
              </div>

              <div className="pimc-mech-card pimc-mech-tolerance">
                <div className="pimc-mech-icon">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div className="pimc-mech-title">
                    {isEs ? '2. Paradoja de Inmunotolerancia (T-Regs)' : '2. Immune Tolerance Paradox (T-Regs)'}
                  </div>
                  <p className="pimc-mech-text">
                    {isEs ? mechanism.tolerance_paradox_es : mechanism.tolerance_paradox}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab 2: Stratified Dosing Tiers ── */}
      {activeTab === 'dosing' && (
        <div className="pimc-tab-pane">
          <div className="pimc-tiers-grid">
            {tiers.map((tier, idx) => (
              <div key={idx} className="pimc-tier-card">
                <div className="pimc-tier-header">
                  <div>
                    <span className="pimc-tier-badge">{isEs ? `Nivel ${idx + 1}` : `Tier ${idx + 1}`}</span>
                    <h4 className="pimc-tier-title">{isEs ? tier.tier_es : tier.tier}</h4>
                  </div>
                  <button
                    type="button"
                    className="pimc-copy-btn"
                    onClick={() => handleCopyTier(tier)}
                    title={isEs ? 'Copiar pauta' : 'Copy tier'}
                  >
                    {copiedCadence ? <Check size={14} style={{ color: '#16a34a' }} /> : <Copy size={14} />}
                    <span>{copiedCadence ? (isEs ? 'Copiado' : 'Copied') : (isEs ? 'Copiar' : 'Copy')}</span>
                  </button>
                </div>

                <div className="pimc-tier-dose-box">
                  <div className="pimc-dose-label">{isEs ? 'Dosis y Frecuencia:' : 'Dose & Frequency:'}</div>
                  <div className="pimc-dose-val">{isEs ? tier.dosage_es : tier.dosage}</div>
                  <div className="pimc-dose-dur">⏱️ {isEs ? tier.duration_es : tier.duration}</div>
                </div>

                <div className="pimc-tier-goal">
                  <strong>{isEs ? 'Objetivo Terapéutico:' : 'Therapeutic Goal:'}</strong> {isEs ? tier.clinical_goal_es : tier.clinical_goal}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab 3: Immune Laboratory Surveillance ── */}
      {activeTab === 'labs' && labs && (
        <div className="pimc-tab-pane">
          <div className="pimc-labs-card">
            <h4 className="pimc-labs-title">
              <ShieldCheck size={16} style={{ color: '#0891b2' }} />
              <span>{isEs ? 'Panel Inmunológico de Monitorización' : 'Recommended Immunological Panel'}</span>
            </h4>
            <p className="pimc-labs-sub">
              {isEs
                ? 'Marcadores analíticos recomendados para cuantificar la competencia de la inmunidad celular adaptativa antes y después del protocolo.'
                : 'Recommended diagnostic laboratory biomarkers to quantify cell-mediated immune competence pre and post protocol.'}
            </p>

            <div className="pimc-labs-list">
              {(isEs ? labs.primary_immune_panel_es : labs.primary_immune_panel)?.map((item, idx) => (
                <div key={idx} className="pimc-lab-item">
                  <div className="pimc-lab-bullet">•</div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
