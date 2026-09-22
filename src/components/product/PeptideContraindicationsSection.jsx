"use client";

import React, { useMemo } from 'react';
import { ShieldAlert, AlertTriangle, XCircle, Info } from '@/lib/icons';
import safetyRegistry from '@/data/v2/safetyData.json';

/**
 * PeptideContraindicationsSection
 * Renders the Clinical Precautions & Contraindications block for a peptide
 * product on the public datasheet. Data sourced from safetyData.json,
 * keyed by canonicalName, slug or name, with an institutional clinical fallback.
 */
export default function PeptideContraindicationsSection({ product, lang = 'en' }) {
  const isEs = lang === 'es';

  const safetyEntry = useMemo(() => {
    if (!product) return null;
    const cleanCandidates = [
      product.canonicalName,
      product.name,
      product.title,
      product.slug,
      product.id
    ].filter(Boolean);

    for (const rawName of cleanCandidates) {
      const name = String(rawName).trim();
      if (safetyRegistry[name]) return safetyRegistry[name];

      // Case insensitive direct match
      const key = Object.keys(safetyRegistry).find(k => k.toLowerCase() === name.toLowerCase());
      if (key) return safetyRegistry[key];

      // Base name without parentheses or trailing suffixes
      const baseName = name.replace(/\s*\([^)]*\)/g, '').trim();
      if (baseName && baseName !== name) {
        if (safetyRegistry[baseName]) return safetyRegistry[baseName];
        const baseKey = Object.keys(safetyRegistry).find(k => k.toLowerCase() === baseName.toLowerCase());
        if (baseKey) return safetyRegistry[baseKey];
      }

      // Slug hyphen to space match: e.g. "bpc-157" -> "bpc 157"
      const unhyphenated = name.replace(/-/g, ' ');
      const unhyphenKey = Object.keys(safetyRegistry).find(k => k.toLowerCase() === unhyphenated.toLowerCase());
      if (unhyphenKey) return safetyRegistry[unhyphenKey];
    }

    // Standard clinical fallback when peptide is active but lacks an explicit entry
    return {
      safetyNote: isEs
        ? "Polipéptido biológicamente activo para investigación y formulación clínica bajo supervisión médica facultativa. Se recomienda evaluación analítica de base (perfil metabólico, renal y hepático) previo al inicio de cualquier ciclo. No indicado durante el embarazo, lactancia o en pacientes pediátricos."
        : "Biologically active polypeptide for research and physician-directed protocol application. Baseline laboratory evaluation (metabolic, renal, and hepatic function) recommended prior to initiation. Not evaluated for pediatric use or during pregnancy/lactation.",
      contraindications: isEs
        ? [
            "Malignidad o neoplasia activa",
            "Embarazo y lactancia",
            "Insuficiencia hepática o renal severa",
            "Hipersensibilidad al principio activo o excipientes"
          ]
        : [
            "Active malignancy or high oncological risk",
            "Pregnancy and lactation",
            "Severe hepatic or renal impairment",
            "Known hypersensitivity to active polypeptide or excipients"
          ]
    };
  }, [product, isEs]);

  if (!safetyEntry) return null;

  const { safetyNote, contraindications = [] } = safetyEntry;

  return (
    <section
      id="contraindications-section"
      className="pds-section-card"
      aria-label={isEs ? "Precauciones Clínicas y Contraindicaciones" : "Clinical Precautions and Contraindications"}
    >
      {/* Header */}
      <div className="pds-section-header" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #1a2744 100%)' }}>
        <div className="pds-section-header-left">
          <div className="pds-section-header-shield" style={{ background: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.35)' }}>
            <ShieldAlert size={22} color="#f87171" />
          </div>
          <div className="pds-section-header-titles">
            <div className="pds-section-header-meta-row">
              <span className="pds-section-header-category">
                {isEs ? "PERFIL DE SEGURIDAD CLÍNICA" : "CLINICAL SAFETY PROFILE"}
              </span>
              <span className="pds-section-badge" style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', borderColor: 'rgba(239,68,68,0.3)' }}>
                <ShieldAlert size={11} /> {isEs ? "Revisión Médica Requerida" : "Prescriber Review Required"}
              </span>
            </div>
            <h3 className="pds-section-header-title">
              {isEs ? "Contraindicaciones & Precauciones Clínicas" : "Contraindications & Clinical Precautions"}
            </h3>
          </div>
        </div>
        <div className="pds-section-header-right">
          <div className="pds-section-cert-badge" style={{ background: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.3)', color: '#fca5a5' }}>
            <AlertTriangle size={14} color="#f87171" />
            <span>{isEs ? "Supervisión Médica" : "Medical Supervision"}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="pds-section-card-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Safety Note */}
        {safetyNote && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '1rem 1.125rem' }}>
            <Info size={17} color="#d97706" style={{ flexShrink: 0, marginTop: '1px' }} />
            <p style={{ margin: 0, fontSize: '0.845rem', color: '#92400e', lineHeight: 1.6, fontWeight: 500 }}>
              {safetyNote}
            </p>
          </div>
        )}

        {/* Contraindications chips grid */}
        {contraindications.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
              <XCircle size={15} color="#dc2626" />
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {isEs ? "Contraindicaciones Absolutas & Relativas" : "Absolute & Relative Contraindications"}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '0.5rem' }}>
              {contraindications.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: '#991b1b', fontWeight: 500, lineHeight: 1.35 }}>
                  <span style={{ color: '#dc2626', flexShrink: 0, fontSize: '0.6rem' }}>●</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regulatory Disclaimer */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.72rem', color: '#64748b', lineHeight: 1.55 }}>
          <strong style={{ color: '#475569' }}>
            {isEs ? "Aviso de Uso Clínico e Investigación:" : "Research & Clinical Use Disclaimer:"}
          </strong>{' '}
          {isEs
            ? "Este perfil de seguridad se proporciona para profesionales médicos cualificados e investigadores autorizados. Las precauciones se fundamentan en la bibliografía científica disponible y los datos de clase farmacológica. Su uso clínico requiere evaluación médica independiente y el cumplimiento regulatorio aplicable."
            : "This safety profile is provided for qualified medical professionals and licensed researchers. Contraindications and precautions are based on available published literature and pharmacological class data. This compound is supplied for research purposes; clinical application requires independent physician evaluation and appropriate regulatory compliance."}
        </div>
      </div>
    </section>
  );
}
