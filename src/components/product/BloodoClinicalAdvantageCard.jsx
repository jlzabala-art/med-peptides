"use client";

import React from 'react';
import {
  ShieldCheck,
  Zap,
  Clock,
  Thermometer,
  Microscope,
  Activity,
  CheckCircle2,
  Building2,
  ArrowRight,
  Sparkles
} from '@/lib/icons';
import './BloodoClinicalAdvantageCard.css';

/**
 * BloodoClinicalAdvantageCard
 * ─────────────────────────────────────────────────────────────────────────────
 * Institutional Google Cloud-styled clinical card detailing the decisive
 * advantages of In-Clinic / At-Home Capillary DBS testing over traditional
 * hospital phlebotomy and venipuncture clinical laboratories.
 * Placed immediately before the footer disclaimers.
 */
export default function BloodoClinicalAdvantageCard({ lang = 'en' }) {
  const isEs = lang === 'es';

  const ADVANTAGES = [
    {
      id: 'in-office-speed',
      icon: Zap,
      accentColor: '#0284c7',
      titleEn: 'In-Office Execution in 3 Minutes',
      titleEs: 'Toma Directa en Consulta en 3 Minutos',
      highlightEn: 'Zero Phlebotomy Delays',
      highlightEs: 'Cero Pérdida de Adherencia',
      descEn: 'Physicians or nurses collect validated capillary micro-volumes during the medical consultation, eliminating patient travel to external phlebotomy centers, queues, and diagnostic attrition.',
      descEs: 'El facultativo o personal de enfermería realiza la micro-extracción durante la propia consulta médica, evitando esperas en centros de analítica externos, desplazamientos del paciente y pérdida de adherencia.'
    },
    {
      id: 'circadian-precision',
      icon: Clock,
      accentColor: '#8b5cf6',
      titleEn: 'True Chronobiological Precision',
      titleEs: 'Exactitud Cronobiológica Real',
      highlightEn: 'Awakening Response Window',
      highlightEs: 'Ventana Matutina al Despertar',
      descEn: 'Captures basal circadian windows (such as 08:00–10:00 AM for free testosterone or +30 min post-waking for Cortisol CAR) under true rested conditions, preventing traffic-induced stress artifacts.',
      descEs: 'Permite muestrear en la ventana circadiana exacta (08:00–10:00 AM para testosterona o a los +30 min del despertar para cortisol CAR) en reposo absoluto, sin el estrés de desplazamientos que altera las hormonas.'
    },
    {
      id: 'cold-chain-elimination',
      icon: Thermometer,
      accentColor: '#059669',
      titleEn: '14-Day Ambient Thermal Stability',
      titleEs: 'Estabilidad de 14 Días Sin Cadena de Frío',
      highlightEn: 'No Dry Ice or Centrifuge Required',
      highlightEs: 'Fijación Celular Inmediata',
      descEn: 'Desiccated blood on Whatman 903 cards instantly inactivates cellular degrading enzymes (CD38, esterases). Samples remain analytically stable for 14 days at room temperature during postal transit.',
      descEs: 'La deshidratación inmediata en papel Whatman 903 inactiva las enzimas degradativas (CD38, esterasas). La muestra viaja estable a temperatura ambiente durante 14 días sin requerir hielo seco ni centrifugado.'
    },
    {
      id: 'mass-spec-accuracy',
      icon: Microscope,
      accentColor: '#ea580c',
      titleEn: 'Gold Standard Mass Spectrometry (LC-MS/MS)',
      titleEs: 'Espectrometría de Masas LC-MS/MS (Gold Standard)',
      highlightEn: 'Zero Immunoassay Cross-Reactivity',
      highlightEs: 'Separación Molecular Absoluta',
      descEn: 'Central laboratory analysis (LifeLab1, EU) provides reference-grade mass-to-charge (m/z) separation, eliminating antibody cross-reactivity with steroid metabolites common in automated hospital immunoassays.',
      descEs: 'El procesamiento en laboratorio central (LifeLab1, UE) garantiza separación molecular pura por relación masa/carga (m/z), eliminando la reactividad cruzada de los inmunoensayos automatizados convencionales.'
    }
  ];

  return (
    <section id="clinical-dbs-advantages" className="bca-card-container">
      {/* ── Card Header ── */}
      <div className="bca-header">
        <div className="bca-header-badge-row">
          <span className="bca-badge bca-badge-pharma">
            <ShieldCheck size={13} /> {isEs ? 'INNOVACIÓN DIAGNÓSTICA CE-IVDR' : 'CE-IVDR DIAGNOSTIC INNOVATION'}
          </span>
          <span className="bca-badge bca-badge-teal">
            <Building2 size={13} /> {isEs ? 'MEDICINA DE PRECISIÓN EN CONSULTA' : 'IN-OFFICE PRECISION MEDICINE'}
          </span>
        </div>
        <h2 className="bca-title">
          {isEs 
            ? 'Ventaja Clínica en Consulta: Micromuestreo DBS vs. Laboratorio Tradicional' 
            : 'In-Office Clinical Superiority: Capillary DBS vs. Conventional Phlebotomy'}
        </h2>
        <p className="bca-subtitle">
          {isEs
            ? 'Por qué los kits capilares de micro-volumen de sangre seca (DBS) superan a la venopunción convencional en consultas médicas, medicina funcional y programas de longevidad de alta precisión.'
            : 'Why capillary dried blood spot (DBS) micro-sampling outperforms conventional venous hospital blood draws in clinical practices, functional medicine, and high-precision longevity protocols.'}
        </p>
      </div>

      {/* ── 4-Column Balanced Grid ── */}
      <div className="bca-grid">
        {ADVANTAGES.map((adv) => {
          const Icon = adv.icon;
          return (
            <div 
              key={adv.id} 
              className="bca-item"
              style={{ '--adv-accent': adv.accentColor }}
            >
              <div className="bca-item-header">
                <div className="bca-item-icon-box">
                  <Icon size={18} />
                </div>
                <span className="bca-item-highlight">
                  {isEs ? adv.highlightEs : adv.highlightEn}
                </span>
              </div>
              <h3 className="bca-item-title">
                {isEs ? adv.titleEs : adv.titleEn}
              </h3>
              <p className="bca-item-desc">
                {isEs ? adv.descEs : adv.descEn}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Comparative Summary Callout ── */}
      <div className="bca-summary-callout">
        <div className="bca-summary-icon">
          <Activity size={20} />
        </div>
        <div className="bca-summary-content">
          <strong>{isEs ? 'Trazabilidad y Control Analítico Centralizado:' : 'Centralized Analytical Quality & Traceability:'}</strong>{' '}
          {isEs
            ? 'A diferencia de los analizadores portátiles de uso inmediato (POC) con alta variabilidad analítica, todos los kits Bloodo™ se remiten al laboratorio central LifeLab1 (Vilna, Lituania) para su extracción y cuantificación mediante LC-MS/MS y UHPLC bajo directivas CE-IVDR y trazabilidad ISO 15189.'
            : 'Unlike point-of-care (POC) desktop devices prone to analytical variance, all Bloodo™ kits are processed at LifeLab1 central laboratory facilities (Vilnius, Lithuania) using gold-standard LC-MS/MS and UHPLC instrumentation under CE-IVDR certification and ISO 15189 traceability.'}
        </div>
      </div>
    </section>
  );
}
