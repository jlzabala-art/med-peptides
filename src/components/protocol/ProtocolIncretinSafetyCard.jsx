"use client";

import React, { useState } from 'react';
import Link from 'next/link';
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
  Sparkles,
  ExternalLink
} from '@/lib/icons';
import { toast } from 'react-hot-toast';
import './ProtocolIncretinSafetyCard.css';

export default function ProtocolIncretinSafetyCard({ protocol, lang = 'en' }) {
  const isEs = lang === 'es';
  const giAlgorithm = protocol?.gi_tolerance_algorithm;
  const leanTarget = protocol?.lean_mass_preservation_target;
  const companion = protocol?.companion_diagnostic;
  const biliary = protocol?.biliary_pancreatic_surveillance;

  // Render only if protocol has incretin safety or lean mass target metadata
  if (!giAlgorithm && !leanTarget && !companion && !biliary) {
    return null;
  }

  const [activeTab, setActiveTab] = useState('gi');
  const [selectedGradeIdx, setSelectedGradeIdx] = useState(0);
  const [copiedCadence, setCopiedCadence] = useState(false);

  const decisionTree = giAlgorithm?.titration_decision_tree || [];
  const selectedGrade = decisionTree[selectedGradeIdx] || decisionTree[0];

  const [copiedHeader, setCopiedHeader] = useState(false);

  const handleCopyIncretinGuide = async () => {
    const text = isEs
      ? `*Guía de Manejo Clínico Incretinas — Retatrutide & MOTS-c*\n\n` +
        `• Regulación Digestiva: Ante náuseas leves o saciedad rápida, reducir el volumen de comida un 40% y evitar grasas densas.\n` +
        `• Regla de Desescalado: Si las molestias persisten > 48h, pausar el aumento de dosis durante 2–4 semanas o regresar al escalón previo.\n` +
        `• Protección Muscular (DEXA): Objetivo > 75% grasa perdida y < 25% masa magra. Consumir 1,6 – 2,2 g de proteína/kg peso objetivo diario + creatina 3-5g.\n` +
        `• Test Acompañante Bloodo™: Realizar HbA1c en Día 0 (basal) y Semana 12 para validar la optimización metabólica.\n\n` +
        `Atlas Services Clinical Reference • Protocolo Metabólico`
      : `*Clinical Incretin Management Guide — Retatrutide & MOTS-c*\n\n` +
        `• GI Adaptation: In case of mild nausea or fullness, reduce meal volume by 40% and eliminate high-fat foods.\n` +
        `• Step-Down Rule: For persistent symptoms > 48 hours, pause escalation for 2–4 weeks or drop to previous dose step.\n` +
        `• Lean Mass Target (DEXA): Aim for > 75% fat mass loss and < 25% lean loss. Maintain 1.6–2.2 g protein/kg target weight/day + 3-5g creatine.\n` +
        `• Bloodo™ Companion Test: Draw HbA1c at Day 0 (baseline) and Week 12 to verify glycemic optimization.\n\n` +
        `Atlas Services Clinical Reference • Precision Endocrinology`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedHeader(true);
      toast.success(isEs ? 'Pauta clínica copiada al portapapeles' : 'Clinical guidance copied to clipboard');
      setTimeout(() => setCopiedHeader(false), 2500);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  const handleCopyGrade = async (grade) => {
    const title = isEs ? grade.grade_es : grade.grade;
    const sym = isEs ? grade.symptoms_es : grade.symptoms;
    const action = isEs ? grade.clinical_action_es : grade.clinical_action;
    const text = `*${title}*\n⚠️ ${isEs ? 'Síntomas' : 'Symptoms'}: ${sym}\n📋 ${isEs ? 'Acción Clínica' : 'Clinical Action'}: ${action}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedCadence(true);
      toast.success(isEs ? 'Pauta de intervención copiada al portapapeles' : 'Intervention guidance copied to clipboard');
      setTimeout(() => setCopiedCadence(false), 2500);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  return (
    <section id="incretin-safety" className="pisc-container">
      {/* ── Section Header (Google Cloud UX) ── */}
      <div className="pisc-header">
        <div className="pisc-header-main">
          <div className="pisc-header-icon-box">
            <Activity size={20} className="pisc-header-icon" />
          </div>
          <div>
            <div className="pisc-header-chips">
              <span className="pisc-chip pisc-chip-blue">Incretin GI Adaptation</span>
              <span className="pisc-chip pisc-chip-purple">DEXA Lean Mass Guard</span>
              <span className="pisc-chip pisc-chip-amber">Bloodo™ HbA1c Companion</span>
            </div>
            <h3 className="pisc-title">
              {isEs
                ? 'Algoritmo de Tolerancia Digestiva, Masa Magra y Diagnóstico Acompañante'
                : 'GI Tolerance Algorithm, DEXA Lean Mass & Companion Diagnostics'}
            </h3>
            <p className="pisc-subtitle">
              {isEs
                ? 'Regla de desescalado para motilidad gástrica, objetivos de composición corporal en DEXA y analíticas de seguridad pancreática/biliar.'
                : 'Step-down rules for gastric motility kinetics, DEXA body composition benchmarks, and pancreatic/biliary lab surveillance.'}
            </p>
          </div>
        </div>

        <div className="pisc-header-cta-group">
          <button
            type="button"
            className="pisc-btn pisc-btn-outline"
            onClick={handleCopyIncretinGuide}
            title={isEs ? 'Copiar pautas clínicas al portapapeles' : 'Copy clinical guidelines to clipboard'}
          >
            {copiedHeader ? <Check size={14} style={{ color: '#16a34a' }} /> : <Copy size={14} />}
            <span>{copiedHeader ? (isEs ? 'Pauta Copiada' : 'Guideline Copied') : (isEs ? 'Copiar Pauta Clínica' : 'Copy Clinical Guide')}</span>
          </button>
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <div className="pisc-tabs-nav" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'gi'}
          className={`pisc-tab-btn ${activeTab === 'gi' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('gi')}
        >
          <Activity size={14} />
          <span>{isEs ? 'Algoritmo Tolerancia Digestiva' : 'GI Tolerance & Step-Down'}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'dexa'}
          className={`pisc-tab-btn ${activeTab === 'dexa' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('dexa')}
        >
          <Layers size={14} />
          <span>{isEs ? 'Preservación de Masa Magra (DEXA)' : 'Lean Mass Preservation'}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'companion'}
          className={`pisc-tab-btn ${activeTab === 'companion' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('companion')}
        >
          <FileText size={14} />
          <span>{isEs ? 'Diagnóstico Acompañante & Laboratorio' : 'Companion Diagnostics & Labs'}</span>
        </button>
      </div>

      {/* ── Tab 1: GI Tolerance Decision Tree ── */}
      {activeTab === 'gi' && giAlgorithm && (
        <div className="pisc-tab-pane">
          {/* Kinetics Banner */}
          <div className="pisc-kinetics-card">
            <div className="pisc-kinetics-icon">
              <Clock size={18} />
            </div>
            <div>
              <div className="pisc-kinetics-title">
                {isEs ? 'Cinética de Vaciamiento Gástrico' : 'Gastric Motility Kinetics'}
              </div>
              <p className="pisc-kinetics-text">
                {isEs ? giAlgorithm.delayed_gastric_emptying_kinetics_es : giAlgorithm.delayed_gastric_emptying_kinetics}
              </p>
            </div>
          </div>

          {/* Decision Tree Selector & Detail */}
          <div className="pisc-tree-layout">
            <div className="pisc-tree-sidebar">
              <div className="pisc-tree-label">
                {isEs ? 'Estratificación de Síntomas' : 'Symptom Severity Stratification'}
              </div>
              <div className="pisc-tree-nav">
                {decisionTree.map((item, idx) => {
                  const isSelected = idx === selectedGradeIdx;
                  const severityClass = idx === 0 ? 'grade-mild' : idx === 1 ? 'grade-moderate' : 'grade-severe';
                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`pisc-tree-btn ${isSelected ? 'is-selected' : ''} ${severityClass}`}
                      onClick={() => setSelectedGradeIdx(idx)}
                    >
                      <div className="pisc-tree-btn-top">
                        <span className="pisc-tree-badge">{isEs ? item.grade_es : item.grade}</span>
                        <ChevronRight size={14} className="pisc-tree-chevron" />
                      </div>
                      <div className="pisc-tree-btn-preview">
                        {isEs ? item.symptoms_es : item.symptoms}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pisc-tree-content">
              {selectedGrade && (
                <div className="pisc-detail-card">
                  <div className="pisc-detail-top">
                    <div>
                      <span className="pisc-detail-tier-badge">
                        {isEs ? selectedGrade.grade_es : selectedGrade.grade}
                      </span>
                      <h4 className="pisc-detail-title">
                        {isEs ? 'Conducta Terapéutica Obligatoria' : 'Mandatory Clinical Action'}
                      </h4>
                    </div>

                    <button
                      type="button"
                      className="pisc-detail-copy-btn"
                      onClick={() => handleCopyGrade(selectedGrade)}
                      title={isEs ? 'Copiar recomendación' : 'Copy recommendation'}
                    >
                      {copiedCadence ? <Check size={14} style={{ color: '#16a34a' }} /> : <Copy size={14} />}
                      <span>{copiedCadence ? (isEs ? 'Copiado' : 'Copied') : (isEs ? 'Copiar' : 'Copy')}</span>
                    </button>
                  </div>

                  <div className="pisc-detail-section">
                    <div className="pisc-detail-sublabel">
                      {isEs ? 'Manifestaciones Clínicas' : 'Clinical Presentation'}
                    </div>
                    <div className="pisc-symptoms-box">
                      <AlertTriangle size={15} style={{ color: selectedGradeIdx === 2 ? '#dc2626' : '#d97706', flexShrink: 0 }} />
                      <span>{isEs ? selectedGrade.symptoms_es : selectedGrade.symptoms}</span>
                    </div>
                  </div>

                  <div className="pisc-detail-section">
                    <div className="pisc-detail-sublabel">
                      {isEs ? 'Protocolo de Intervención' : 'Actionable Intervention'}
                    </div>
                    <div className={`pisc-action-box ${selectedGradeIdx === 2 ? 'is-critical' : ''}`}>
                      <ShieldCheck size={16} className="pisc-action-icon" />
                      <p className="pisc-action-text">
                        {isEs ? selectedGrade.clinical_action_es : selectedGrade.clinical_action}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: Lean Mass Preservation Target ── */}
      {activeTab === 'dexa' && leanTarget && (
        <div className="pisc-tab-pane">
          {/* Key Metrics Grid */}
          <div className="pisc-metrics-grid">
            <div className="pisc-metric-card pisc-metric-purple">
              <div className="pisc-metric-label">{isEs ? 'Ratio Grasa / Músculo Objetivo' : 'Target Fat / Lean Mass Ratio'}</div>
              <div className="pisc-metric-value">{isEs ? leanTarget.target_fat_loss_ratio_es : leanTarget.target_fat_loss_ratio}</div>
              <div className="pisc-metric-sub">{isEs ? 'Previene degradación sarcopénica en rápida pérdida' : 'Guards against sarcopenic deficit in rapid loss'}</div>
            </div>

            <div className="pisc-metric-card pisc-metric-blue">
              <div className="pisc-metric-label">{isEs ? 'Aporte Proteico Diario' : 'Daily Protein Target'}</div>
              <div className="pisc-metric-value">{isEs ? leanTarget.daily_protein_target_es : leanTarget.daily_protein_target}</div>
              <div className="pisc-metric-sub">{isEs ? 'Por kg de peso objetivo corporal diario' : 'Per kg of target weight to stimulate MPS'}</div>
            </div>

            <div className="pisc-metric-card pisc-metric-emerald">
              <div className="pisc-metric-label">{isEs ? 'Cadencia DEXA' : 'DEXA Scan Cadence'}</div>
              <div className="pisc-metric-value">{isEs ? 'Día 0 • Sem 12 • Sem 24' : 'Day 0 • Wk 12 • Wk 24'}</div>
              <div className="pisc-metric-sub">{isEs ? leanTarget.dexa_cadence_es : leanTarget.dexa_cadence}</div>
            </div>
          </div>

          {/* Muscle Protection Cofactors */}
          {leanTarget.muscle_protection_cofactors?.length > 0 && (
            <div className="pisc-cofactors-section">
              <h4 className="pisc-cofactors-title">
                <Sparkles size={16} style={{ color: '#7c3aed' }} />
                <span>{isEs ? 'Cofactores Farmacológicos para Preservación Muscular' : 'Pharmacological Muscle-Sparing Synergy'}</span>
              </h4>
              <div className="pisc-cofactors-grid">
                {leanTarget.muscle_protection_cofactors.map((cofactor, cIdx) => (
                  <div key={cIdx} className="pisc-cofactor-card">
                    <div className="pisc-cofactor-header">
                      <span className="pisc-cofactor-name">{isEs ? cofactor.name_es : cofactor.name}</span>
                      <span className="pisc-cofactor-dose">{isEs ? cofactor.dosage_es : cofactor.dosage}</span>
                    </div>
                    <p className="pisc-cofactor-rationale">
                      {isEs ? cofactor.rationale_es : cofactor.rationale}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab 3: Companion Diagnostics & Surveillance ── */}
      {activeTab === 'companion' && (
        <div className="pisc-tab-pane">
          {/* Bloodo Companion Test Card */}
          {companion && (
            <div className="pisc-companion-card">
              <div className="pisc-companion-top">
                <div className="pisc-companion-left">
                  <span className="pisc-companion-badge">
                    {isEs ? 'Diagnóstico Acompañante Certificado' : 'Certified Companion Diagnostic'}
                  </span>
                  <h4 className="pisc-companion-name">{isEs ? companion.name_es : companion.name}</h4>
                  <div className="pisc-companion-meta">
                    <span><strong>Lab:</strong> {companion.lab}</span>
                    <span>•</span>
                    <span><strong>Matrix:</strong> {companion.matrix}</span>
                  </div>
                </div>

                <Link
                  href={`/p/${companion.product_slug}`}
                  className="pisc-btn pisc-btn-primary"
                  title={isEs ? 'Ver test en catálogo de biomarcadores' : 'View test in diagnostic catalog'}
                >
                  <span>{isEs ? 'Ver Test Bloodo™' : 'Inspect Diagnostic'}</span>
                  <ExternalLink size={13} />
                </Link>
              </div>

              {/* Biomarkers Checked */}
              <div className="pisc-biomarkers-row">
                <span className="pisc-biomarkers-label">{isEs ? 'Biomarcadores Analizados:' : 'Analyzed Biomarkers:'}</span>
                <div className="pisc-biomarkers-pills">
                  {companion.biomarkers?.map((b, bIdx) => (
                    <span key={bIdx} className="pisc-biomarker-chip">{b}</span>
                  ))}
                </div>
              </div>

              {/* Sampling Cadence */}
              {companion.sampling_cadence?.length > 0 && (
                <div className="pisc-cadence-grid">
                  {companion.sampling_cadence.map(sc => (
                    <div key={sc.id} className="pisc-cadence-card">
                      <div className="pisc-cadence-milestone">{isEs ? sc.milestone_es : sc.milestone}</div>
                      <div className="pisc-cadence-timing">
                        <Clock size={12} />
                        <span>{isEs ? sc.timing_es : sc.timing}</span>
                      </div>
                      <p className="pisc-cadence-obj">{isEs ? sc.objective_es : sc.objective}</p>
                      <div className="pisc-cadence-guide">
                        <span><strong>{isEs ? 'Instrucción:' : 'Guideline:'}</strong> {isEs ? sc.guideline_es : sc.guideline}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Biliary & Pancreatic Surveillance */}
          {biliary && (
            <div className="pisc-surveillance-card">
              <h4 className="pisc-surveillance-title">
                <ShieldCheck size={16} style={{ color: '#003666' }} />
                <span>{isEs ? 'Monitorización de Seguridad Biliar y Pancreática' : 'Biliary & Pancreatic Surveillance Protocol'}</span>
              </h4>
              <p className="pisc-surveillance-text">
                {isEs ? biliary.ultrasound_guideline_es : biliary.ultrasound_guideline}
              </p>
              <div className="pisc-labs-row">
                <span className="pisc-labs-label">{isEs ? 'Pruebas Obligatorias de Cribado:' : 'Required Screening Labs:'}</span>
                <div className="pisc-labs-pills">
                  {(isEs ? biliary.required_labs_es : biliary.required_labs)?.map((lab, lIdx) => (
                    <span key={lIdx} className="pisc-lab-chip">{lab}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
