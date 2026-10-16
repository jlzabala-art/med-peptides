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

    // ── Colway Colvita specific nutraceutical safety profile (Fish collagen, Fucus iodine, Vitamin E) ──
    const isColvita = cleanCandidates.some(c => String(c).toLowerCase().includes('colvita'));
    if (isColvita) {
      return {
        safetyNote: isEs
          ? "Complemento alimenticio a base de colágeno nativo liofilizado de pescado de agua dulce (triple hélice intacta), algas marinas Fucus vesiculosus y vitamina E natural. No superar la dosis diaria expresamente recomendada (2 cápsulas al día). Los complementos alimenticios no deben utilizarse como sustitutos de una dieta variada y equilibrada. El alga Fucus es una fuente natural de yodo orgánico biodisponible; los pacientes con trastornos tiroideos diagnosticados (hipertiroidismo, tiroiditis) deben consultar a su médico especialista antes de su administración. La cubierta de la cápsula es 100% gelatina de pescado."
          : "Dietary food supplement formulated with pure freeze-dried native freshwater fish tropocollagen (intact triple-helix conformation), marine Bladderwrack (Fucus vesiculosus) algae, and natural Vitamin E. Do not exceed the recommended daily intake (2 capsules daily). Food supplements should not be used as a substitute for a varied and balanced diet. Fucus algae is a rich natural source of bioavailable organic iodine; individuals with diagnosed thyroid conditions (hyperthyroidism, autoimmune thyroiditis) should consult their physician prior to supplementation. Capsule shell is manufactured from 100% fish gelatin.",
        contraindications: isEs
          ? [
              "Hipersensibilidad o alergia conocida al pescado o proteínas marinas",
              "Hipersensibilidad al yodo o a las algas marinas (Fucus vesiculosus)",
              "Hipertiroidismo diagnosticado o afecciones tiroideas no controladas (debido al aporte natural de yodo orgánico)",
              "Embarazo y período de lactancia (se recomienda consultar con el médico facultativo antes de su administración)",
              "Dietas vegetarianas o veganas estrictas (cubierta de cápsula 100% gelatina de pescado)",
              "Uso pediátrico no indicado (mantener fuera del alcance de los niños pequeños)"
            ]
          : [
              "Known hypersensitivity or allergy to fish proteins or marine ingredients",
              "Hypersensitivity to iodine or Bladderwrack (Fucus vesiculosus) sea algae",
              "Diagnosed hyperthyroidism or unmonitored thyroid disorders (due to natural organic iodine content)",
              "Pregnancy and lactation (consult with a qualified healthcare professional prior to use)",
              "Strict vegan or vegetarian diets (capsule shell is made of 100% fish gelatin)",
              "Not formulated for pediatric use (keep out of reach of young children)"
            ]
      };
    }

    const isSupplement = product?.is_supplement || product?.isSupplement || product?.productType === 'supplement' || product?.type === 'supplement';
    if (isSupplement) {
      return {
        safetyNote: isEs
          ? "Complemento alimenticio de grado clínico. No superar la dosis recomendada. Los complementos alimenticios no deben utilizarse como sustitutos de una dieta equilibrada. Mantener fuera del alcance de los niños. Si está embarazada, en período de lactancia o bajo tratamiento farmacológico, consulte a su médico."
          : "Clinical-grade nutritional dietary supplement. Do not exceed recommended daily serving. Food supplements should not be used as a replacement for a balanced lifestyle. Keep out of reach of children. Consult your physician if pregnant, lactating, or taking prescription medication.",
        contraindications: isEs
          ? [
              "Hipersensibilidad conocida a cualquiera de los principios activos o excipientes",
              "Embarazo y lactancia (salvo indicación médica expresa)",
              "Insuficiencia renal o hepática avanzada sin monitorización médica"
            ]
          : [
              "Known hypersensitivity to active ingredients or excipients",
              "Pregnancy and lactation (unless specifically directed by physician)",
              "Severe unmonitored renal or hepatic impairment"
            ]
      };
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
      <div className="pds-section-card-body" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Safety Note - Google Cloud Warning Banner Standard */}
        {safetyNote && (
          <div
            className="gcp-callout gcp-callout-warning"
            style={{
              display: 'flex',
              gap: '0.85rem',
              alignItems: 'flex-start',
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderLeft: '4px solid #d97706',
              borderRadius: '8px',
              padding: '1rem 1.15rem',
              boxShadow: '0 1px 2px rgba(217, 119, 6, 0.05)'
            }}
          >
            <AlertTriangle size={18} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {isEs ? "Aviso Clínico de Seguridad Farmacológica" : "Clinical Pharmacological Safety Advisory"}
              </span>
              <p style={{ margin: 0, fontSize: '0.845rem', color: '#92400e', lineHeight: 1.6, fontWeight: 500 }}>
                {safetyNote}
              </p>
            </div>
          </div>
        )}

        {/* Contraindications - Google Cloud Policy / Exclusion Callouts */}
        {contraindications.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={15} color="#dc2626" />
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {isEs ? "Contraindicaciones Absolutas & Relativas" : "Absolute & Relative Contraindications"}
                </span>
              </div>
              <span style={{
                fontSize: '0.70rem',
                fontWeight: 700,
                color: '#991b1b',
                background: '#fee2e2',
                border: '1px solid #fca5a5',
                padding: '2px 8px',
                borderRadius: '12px'
              }}>
                {contraindications.length} {isEs ? "Criterios de exclusión" : "Exclusion Criteria"}
              </span>
            </div>

            {/* Container uses .pds-contraindications-container for responsive mobile-stacking */}
            <div className="pds-contraindications-container">
              {contraindications.map((item, idx) => (
                <div
                  key={idx}
                  className="pds-contraindication-item"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderLeft: '3.5px solid #dc2626',
                    borderRadius: '6px',
                    padding: '0.65rem 0.85rem',
                    fontSize: '0.825rem',
                    color: '#991b1b',
                    fontWeight: 600,
                    lineHeight: 1.4,
                    boxShadow: '0 1px 2px rgba(220, 38, 38, 0.04)',
                    minHeight: '44px',
                    boxSizing: 'border-box'
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'rgba(220, 38, 38, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <XCircle size={13} color="#dc2626" />
                  </div>
                  <span style={{ flex: 1 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regulatory Disclaimer - Google Cloud Info Callout Standard */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'flex-start',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderLeft: '3px solid #64748b',
          borderRadius: '6px',
          padding: '0.85rem 1.1rem',
          fontSize: '0.74rem',
          color: '#475569',
          lineHeight: 1.55
        }}>
          <Info size={15} color="#64748b" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ color: '#1e293b', display: 'block', marginBottom: '2px' }}>
              {isEs ? "Aviso de Uso Clínico e Investigación:" : "Research & Clinical Use Disclaimer:"}
            </strong>
            {isEs
              ? "Este perfil de seguridad se proporciona para profesionales médicos cualificados e investigadores autorizados. Las precauciones se fundamentan en la bibliografía científica disponible y los datos de clase farmacológica. Su uso clínico requiere evaluación médica independiente y el cumplimiento regulatorio aplicable."
              : "This safety profile is provided for qualified medical professionals and licensed researchers. Contraindications and precautions are based on available published literature and pharmacological class data. This compound is supplied for research purposes; clinical application requires independent physician evaluation and appropriate regulatory compliance."}
          </div>
        </div>
      </div>
    </section>
  );
}
