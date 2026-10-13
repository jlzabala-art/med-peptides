"use client";

import React, { useState } from 'react';
import { 
  Clock, 
  Dna, 
  ShieldCheck, 
  Sparkles, 
  Activity, 
  Heart, 
  Download, 
  Layers, 
  CheckCircle2, 
  Smartphone, 
  Cpu, 
  ArrowRight, 
  FileText, 
  Tag,
  Users,
  Building2,
  Bot,
  Brain,
  Check,
  TrendingUp,
  Zap
} from '@/lib/icons';
import './EternaPublicOverviewShowcase.css';

/**
 * EternaPublicOverviewShowcase
 * ─────────────────────────────────────────────────────────────────────────────
 * Complete Precision Health Ecosystem & Clinical Portal Showcase for ETERNA®.
 * Bridges Track 1 (Patient-Centric Multiomics) and Track 2 (Professional Clinic Platform B2B SaaS).
 * Designed according to Google Cloud Console UX standards.
 */
export default function EternaPublicOverviewShowcase({
  product = {},
  lang = 'en',
  onSelectSection = null
}) {
  const isEs = lang === 'es';

  // ─── Dual-Track & Currency State ──────────────────────────────────────────
  const [activeTrack, setActiveTrack] = useState('patient'); // 'patient' | 'clinic'
  const [currency, setCurrency] = useState('EUR'); // 'EUR' | 'AED'
  const [billingCycle, setBillingCycle] = useState('annual'); // 'monthly' | 'annual'

  // Pricing dictionaries
  const isEur = currency === 'EUR';
  const currSym = isEur ? '€' : 'AED ';

  // Patient Track Pricing
  const patientPricing = {
    genetics360: isEur ? '€199' : 'AED 1,300',
    monitoringMonthly: isEur ? '€5.90' : 'AED 40',
    monitoringAnnual: isEur ? '€59' : 'AED 400',
    ageScanBasic: isEur ? '€54' : 'AED 360',
    ageScanAdvanced: isEur ? '€217' : 'AED 1,450',
  };

  // Clinic Track Pricing
  const clinicPricing = {
    free: isEur ? '€0' : 'AED 0',
    starter: billingCycle === 'annual' 
      ? (isEur ? '€39' : 'AED 250') 
      : (isEur ? '€49' : 'AED 320'),
    growth: billingCycle === 'annual' 
      ? (isEur ? '€199' : 'AED 1,300') 
      : (isEur ? '€249' : 'AED 1,600'),
    addon50: isEur ? '€29' : 'AED 200',
    addon5: isEur ? '€10' : 'AED 70',
    seat: isEur ? '€38' : 'AED 250',
    location: isEur ? '€99' : 'AED 650',
  };

  // 6 Epigenetic Intervention Pillars (Track 1)
  const pillars = [
    {
      id: 'longevity',
      name: isEs ? 'Longevidad & Edad Celular' : 'Longevity & Cellular Age',
      icon: Clock,
      color: '#0d9488',
      bg: '#f0fdfa',
      summary: isEs
        ? 'Reloj epigenético de metilación del ADN (Horvath / Hannum), longitud telomérica y senescencia.'
        : 'DNA methylation epigenetic clocks (Horvath / Hannum), telomere biology, and senescent cell load.',
      targets: 'TERT · TERC · FOXO3 · SIRT1'
    },
    {
      id: 'nutrition',
      name: isEs ? 'Nutrigenómica & Metabolismo' : 'Nutrigenomics & Metabolism',
      icon: Sparkles,
      color: '#0284c7',
      bg: '#f0f9ff',
      summary: isEs
        ? 'Cinética de depuración de cafeína, conversión vegetal de Omega-3 EPA/DHA y ciclo de metilación.'
        : 'CYP1A2 caffeine clearance, plant Omega-3 EPA/DHA conversion, and folate MTHFR cycle.',
      targets: 'CYP1A2 · FADS1 · MTHFR · SLC23A1'
    },
    {
      id: 'cardio',
      name: isEs ? 'Prevención Cardiovascular' : 'Cardiovascular Genetics',
      icon: Heart,
      color: '#e11d48',
      bg: '#fff1f2',
      summary: isEs
        ? 'Genotipado ApoE, metabolismo de lipoproteínas aterogénicas, homocisteína y detoxificación.'
        : 'ApoE ε2/ε3/ε4 isoforms, atherogenic lipoprotein transport, homocysteine and hepatic detox.',
      targets: 'APOE · LPA · NOS3 · CBS'
    },
    {
      id: 'sport',
      name: isEs ? 'Rendimiento & Fibras Musculares' : 'Fitness & Performance',
      icon: Activity,
      color: '#8b5cf6',
      bg: '#f5f3ff',
      summary: isEs
        ? 'Composición ACTN3 de contracción rápida, elasticidad del colágeno tendinoso y tasa de recuperación.'
        : 'ACTN3 fast-twitch ratio, COL1A1 ligament tensile strength, and systemic recovery rate.',
      targets: 'ACTN3 · ACE · COL1A1 · IL6'
    },
    {
      id: 'chronobiology',
      name: isEs ? 'Cronobiología & Arquitectura del Sueño' : 'Chronobiology & Sleep',
      icon: Cpu,
      color: '#d97706',
      bg: '#fffbeb',
      summary: isEs
        ? 'Cronotipo circadiano molecular (CLOCK), profundidad de ondas delta y resiliencia del eje HPA.'
        : 'Circadian CLOCK chronotype, slow-wave delta sleep restoration, and HPA axis resilience.',
      targets: 'CLOCK · PER2 · ARNTL · CRY1'
    },
    {
      id: 'immunity',
      name: isEs ? 'Inmunidad & Inflamaging' : 'Immunity & Inflammaging',
      icon: ShieldCheck,
      color: '#059669',
      bg: '#ecfdf5',
      summary: isEs
        ? 'Regulación de la cascada de citoquinas, homeostasis mucosal y trayectoria de senescencia inmunitaria.'
        : 'Systemic cytokine cascade regulation, mucosal barrier defense, and immunosenescence trajectory.',
      targets: 'IL1B · TNF · CRP · IFNG'
    }
  ];

  return (
    <div className="eterna-overview-root">

      {/* ── 0. GCP Scope & Perspective Dual-Track Switcher Bar ── */}
      <div className="eterna-scope-bar">
        <div className="eterna-scope-left">
          <div className="eterna-scope-label">
            <Layers size={15} color="#003666" />
            <span>{isEs ? 'ECOSISTEMA CLÍNICO ETERNA®:' : 'ETERNA® CLINICAL ECOSYSTEM:'}</span>
          </div>
          <div className="eterna-track-pills">
            <button
              type="button"
              className={`eterna-track-btn ${activeTrack === 'patient' ? 'active' : ''}`}
              onClick={() => setActiveTrack('patient')}
            >
              <Dna size={14} />
              <span>{isEs ? 'Vía 1: Soluciones para Pacientes (B2C)' : 'Track 1: Patient-Centric Multiomics'}</span>
            </button>
            <button
              type="button"
              className={`eterna-track-btn ${activeTrack === 'clinic' ? 'active' : ''}`}
              onClick={() => setActiveTrack('clinic')}
            >
              <Building2 size={14} />
              <span>{isEs ? 'Vía 2: Plataforma para Clínicas (B2B SaaS)' : 'Track 2: Professional Clinic Platform'}</span>
            </button>
          </div>
        </div>

        {/* Currency & Billing Toggles */}
        <div className="eterna-scope-right">
          <div className="eterna-toggle-group">
            <button
              type="button"
              className={`eterna-toggle-chip ${currency === 'EUR' ? 'active' : ''}`}
              onClick={() => setCurrency('EUR')}
              title="Show pricing in EUR (€)"
            >
              EUR (€)
            </button>
            <button
              type="button"
              className={`eterna-toggle-chip ${currency === 'AED' ? 'active' : ''}`}
              onClick={() => setCurrency('AED')}
              title="Show pricing in AED (United Arab Emirates Dirham)"
            >
              AED (د.إ)
            </button>
          </div>

          {activeTrack === 'clinic' && (
            <div className="eterna-toggle-group">
              <button
                type="button"
                className={`eterna-toggle-chip ${billingCycle === 'monthly' ? 'active' : ''}`}
                onClick={() => setBillingCycle('monthly')}
              >
                {isEs ? 'Mensual' : 'Monthly'}
              </button>
              <button
                type="button"
                className={`eterna-toggle-chip ${billingCycle === 'annual' ? 'active' : ''}`}
                onClick={() => setBillingCycle('annual')}
              >
                {isEs ? 'Anual (-20%)' : 'Annual (-20%)'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          TRACK 1: PATIENT-CENTRIC MULTIOMICS (B2C JOURNEY)
      ────────────────────────────────────────────────────────────────────────── */}
      {activeTrack === 'patient' && (
        <div className="eterna-track-content-fade">
          
          {/* 1.1 The 3 Patient Journey Cards: Genetics 360, 24/7 Monitoring, AgeScan */}
          <div className="eterna-patient-trio-grid">
            
            {/* Card A: Genetics 360 Plan (Foundational Baseline) */}
            <div className="eterna-patient-card eterna-featured-card">
              <div className="eterna-patient-badge-row">
                <span className="eterna-badge-blue">
                  <Dna size={12} />
                  <span>{isEs ? 'GENOTIPADO FUNDACIONAL' : 'FOUNDATIONAL GENOMIC MAP'}</span>
                </span>
                <span className="eterna-badge-highlight">{isEs ? 'BASE DE CUIDADO' : 'FOUNDATION OF CARE'}</span>
              </div>
              <h4 className="eterna-patient-card-title">Genetics 360 Plan</h4>
              <div className="eterna-patient-price-row">
                <span className="eterna-price-val">{patientPricing.genetics360}</span>
                <span className="eterna-price-period">{isEs ? 'pago único / de por vida' : 'one-time / lifetime map'}</span>
              </div>
              <p className="eterna-patient-card-desc">
                {isEs
                  ? 'Mapeo genómico exhaustivo de por vida (>200 rasgos biológicos, farmacogenética y predisposición nutricional). Incluye 6 meses de acceso completo a la plataforma ETERNA y recomendaciones de longevidad guiadas por tasa de envejecimiento.'
                  : 'A lifetime comprehensive assessment of >200 biological traits, including pharmacogenetic profiles and nutritional predispositions. Includes 6 months of platform access and personalized longevity recommendations based on aging rate and wearable data.'}
              </p>
              <div className="eterna-patient-specs-list">
                <div className="eterna-spec-bullet">
                  <Check size={14} color="#0284c7" />
                  <span>Illumina MethylationEPIC (+700k SNPs · 850k CpG)</span>
                </div>
                <div className="eterna-spec-bullet">
                  <Check size={14} color="#0284c7" />
                  <span>{isEs ? 'Muestreo salival no invasivo CE-IVD' : 'Non-invasive CE-IVD saliva buffer kit'}</span>
                </div>
                <div className="eterna-spec-bullet">
                  <Check size={14} color="#0284c7" />
                  <span>{isEs ? '6 meses de acceso al portal incluidos' : '6 months full platform access included'}</span>
                </div>
              </div>
            </div>

            {/* Card B: Continuous Monitoring Subscription */}
            <div className="eterna-patient-card">
              <div className="eterna-patient-badge-row">
                <span className="eterna-badge-teal">
                  <Activity size={12} />
                  <span>{isEs ? 'TELEMETRÍA 24/7' : 'SYNCHRONOUS 24/7'}</span>
                </span>
                <span className="eterna-badge-sub">{isEs ? 'SUSCRIPCIÓN CONTINUA' : 'CONTINUOUS TELEMETRY'}</span>
              </div>
              <h4 className="eterna-patient-card-title">Continuous Biometric Monitoring</h4>
              <div className="eterna-patient-price-row">
                <span className="eterna-price-val">{patientPricing.monitoringMonthly}</span>
                <span className="eterna-price-period">
                  {isEs ? `/mes (o ${patientPricing.monitoringAnnual}/año)` : `/month (or ${patientPricing.monitoringAnnual}/year)`}
                </span>
              </div>
              <p className="eterna-patient-card-desc">
                {isEs
                  ? 'Monitorización homeostática continua de Variabilidad Cardíaca (HRV), frecuencia en reposo y arquitectura del sueño profundo para establecer líneas de base relativas y detección predictiva de inflamación.'
                  : 'Continuous homeostatic monitoring of Heart Rate Variability (HRV), resting tachycardia, and sleep architecture to establish personalized relative baselines and ongoing longitudinal health analytics.'}
              </p>
              <div className="eterna-patient-specs-list">
                <div className="eterna-spec-bullet">
                  <Check size={14} color="#0d9488" />
                  <span>{isEs ? 'Sincronización Oura, Apple Health, Garmin, Whoop' : 'Sync with Apple Health, Oura, Garmin, Whoop'}</span>
                </div>
                <div className="eterna-spec-bullet">
                  <Check size={14} color="#0d9488" />
                  <span>{isEs ? '12 meses de analítica y tendencias en salud' : '12 months continuous health trend analytics'}</span>
                </div>
                <div className="eterna-spec-bullet">
                  <Check size={14} color="#0d9488" />
                  <span>{isEs ? 'Carga de datos genéticos existentes (.TXT)' : 'Import external genetic datasets (.TXT)'}</span>
                </div>
              </div>
            </div>

            {/* Card C: AgeScan Series (Biochemical Phenotyping) */}
            <div className="eterna-patient-card">
              <div className="eterna-patient-badge-row">
                <span className="eterna-badge-purple">
                  <Heart size={12} />
                  <span>{isEs ? 'FENOTIPADO BIOQUÍMICO' : 'BIOCHEMICAL PHENOTYPING'}</span>
                </span>
                <span className="eterna-badge-sub">{isEs ? 'SERIE AGESCAN' : 'AGESCAN SERIES'}</span>
              </div>
              <h4 className="eterna-patient-card-title">AgeScan Series Validation</h4>
              <div className="eterna-patient-price-row">
                <span className="eterna-price-val">{patientPricing.ageScanBasic} - {patientPricing.ageScanAdvanced}</span>
                <span className="eterna-price-period">{isEs ? 'por analítica validada' : 'per clinical blood panel'}</span>
              </div>
              <p className="eterna-patient-card-desc">
                {isEs
                  ? 'Validación multiómica puntual mediante analíticas clínicas en sangre integradas directamente en el expediente epigenético para correlacionar expresión génica y marcadores circulantes.'
                  : 'Point-in-time multiomic validation through localized blood biomarker profiling integrated into the epigenetic patient profile to track systemic vascular and metabolic risk.'}
              </p>
              <div className="eterna-patient-specs-list">
                <div className="eterna-spec-bullet">
                  <Check size={14} color="#7c3aed" />
                  <span><strong>Basic AgeScan ({patientPricing.ageScanBasic}):</strong> Glucosa, Colesterol, Hemoglobina</span>
                </div>
                <div className="eterna-spec-bullet">
                  <Check size={14} color="#7c3aed" />
                  <span><strong>Advanced AgeScan ({patientPricing.ageScanAdvanced}):</strong> HbA1c, ApoB, Lp(a)</span>
                </div>
                <div className="eterna-spec-bullet">
                  <Check size={14} color="#7c3aed" />
                  <span>{isEs ? 'Laboratorios acreditados LifeLab1 / UE' : 'LifeLab1 / EU Accredited Laboratory Network'}</span>
                </div>
              </div>
            </div>

          </div>

          {/* 1.2 Live Patient Dashboard Preview (Biological Age Gauge & Clocks) */}
          <div className="eterna-hero-metric-card">
            <div className="eterna-hero-header-row">
              <div className="eterna-hero-tag-group">
                <span className="eterna-pill-tech">
                  <Dna size={13} />
                  <span>Illumina Infinium MethylationEPIC (850k+ CpG)</span>
                </span>
                <span className="eterna-pill-ce">
                  <ShieldCheck size={13} />
                  <span>CE-IVD Certified · LifeLab1 Acreditado</span>
                </span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', letterSpacing: '0.04em' }}>
                {isEs ? 'PORTAL EN VIVO: MÉTRICAS DE LONGEVIDAD' : 'LIVE PATIENT PORTAL: MULTIOMIC BIOMARKERS'}
              </span>
            </div>

            <div className="eterna-hero-grid">
              {/* Left: Biological Age & Speedometer */}
              <div className="eterna-gauge-showcase">
                <div className="eterna-gauge-card">
                  <div className="eterna-gauge-title-row">
                    <span className="eterna-gauge-label">
                      {isEs ? 'Tasa de Envejecimiento (DunedinPACE)' : 'Rate of Aging (DunedinPACE)'}
                    </span>
                    <span className="eterna-gauge-badge-good">
                      {isEs ? 'ENVEJECIMIENTO LENTO (-18%)' : 'SLOW AGING (-18%)'}
                    </span>
                  </div>
                  <div className="eterna-gauge-numbers-row">
                    <span className="eterna-gauge-main-val">0.82</span>
                    <span className="eterna-gauge-subtext">
                      {isEs ? 'años biológicos / año cronológico' : 'biological yrs / calendar yr'}
                    </span>
                  </div>
                  <div className="eterna-speedometer-bar-wrap">
                    <div className="eterna-speedometer-fill" />
                  </div>
                  <div className="eterna-speedometer-scale">
                    <span>0.60 (Óptimo)</span>
                    <span>1.00 (Promedio Poblacional)</span>
                    <span>1.40 (Acelerado)</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', padding: '10px 14px' }}>
                  <Clock size={18} color="#38bdf8" style={{ flexShrink: 0 }} />
                  <div style={{ fontSize: '0.78rem', color: '#e2e8f0', lineHeight: 1.4 }}>
                    <strong>{isEs ? 'Edad Biológica Proyectada:' : 'Estimated Biological Age:'}</strong>{' '}
                    <span style={{ color: '#38bdf8', fontWeight: 800 }}>-4.8 {isEs ? 'años' : 'years'}</span>{' '}
                    {isEs 
                      ? 'respecto a la edad cronológica promedio de referencia.' 
                      : 'relative to cohort baseline calendar age.'}
                  </div>
                </div>
              </div>

              {/* Right: Organ Biological Age Matrix */}
              <div className="eterna-organ-matrix">
                <div className="eterna-organ-card">
                  <div className="eterna-organ-top">
                    <Cpu size={14} color="#38bdf8" />
                    <span>{isEs ? 'Cerebro & SNC' : 'Brain & CNS'}</span>
                  </div>
                  <div className="eterna-organ-val">-3.8 {isEs ? 'años' : 'yrs'}</div>
                  <div className="eterna-organ-status">{isEs ? 'Reserva neurogénica alta' : 'High neural resilience'}</div>
                </div>

                <div className="eterna-organ-card">
                  <div className="eterna-organ-top">
                    <Heart size={14} color="#f43f5e" />
                    <span>{isEs ? 'Cardiovascular' : 'Cardiovascular'}</span>
                  </div>
                  <div className="eterna-organ-val">-2.4 {isEs ? 'años' : 'yrs'}</div>
                  <div className="eterna-organ-status">{isEs ? 'Baja rigidez endotelial' : 'Low endothelial stiffness'}</div>
                </div>

                <div className="eterna-organ-card">
                  <div className="eterna-organ-top">
                    <ShieldCheck size={14} color="#10b981" />
                    <span>{isEs ? 'Sistema Inmune' : 'Immune System'}</span>
                  </div>
                  <div className="eterna-organ-val">-5.1 {isEs ? 'años' : 'yrs'}</div>
                  <div className="eterna-organ-status">{isEs ? 'Bajo índice inflammaging' : 'Low inflammaging burden'}</div>
                </div>

                <div className="eterna-organ-card">
                  <div className="eterna-organ-top">
                    <Activity size={14} color="#a855f7" />
                    <span>{isEs ? 'Metabolismo' : 'Metabolic Axis'}</span>
                  </div>
                  <div className="eterna-organ-val">-4.0 {isEs ? 'años' : 'yrs'}</div>
                  <div className="eterna-organ-status">{isEs ? 'Sensibilidad insulínica óptima' : 'Optimal insulin sensitivity'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 1.3 The 6 Epigenetic Intervention Pillars Grid */}
          <div className="eterna-pillars-section">
            <div className="eterna-section-head">
              <div className="eterna-section-title-wrap">
                <div className="eterna-section-icon-box">
                  <Dna size={20} />
                </div>
                <div>
                  <h4 className="eterna-section-title">
                    {isEs ? 'Los 6 Pilares Epigenéticos de Intervención' : 'The 6 Epigenetic Intervention Pillars'}
                  </h4>
                  <p className="eterna-section-subtitle">
                    {isEs 
                      ? 'Cada pilar incluye dianas genotípicas de nucleótido único (SNPs) y recomendaciones terapéuticas precisas.' 
                      : 'Each pillar includes specific single nucleotide polymorphisms (SNPs) and targeted therapeutic actions.'}
                  </p>
                </div>
              </div>

              {onSelectSection && (
                <button
                  type="button"
                  onClick={() => onSelectSection('reconstitution-section')}
                  className="eterna-quick-nav-btn"
                  style={{ background: '#003666', color: '#ffffff', borderColor: '#003666' }}
                >
                  <span>{isEs ? 'Ver Dianas Detalladas' : 'Explore Full Targets'}</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>

            <div className="eterna-pillars-grid">
              {pillars.map((pillar) => {
                const IconComp = pillar.icon;
                return (
                  <div key={pillar.id} className="eterna-pillar-card">
                    <div className="eterna-pillar-header">
                      <div className="eterna-pillar-icon" style={{ background: pillar.bg, color: pillar.color }}>
                        <IconComp size={16} />
                      </div>
                      <strong className="eterna-pillar-name">{pillar.name}</strong>
                    </div>
                    <p className="eterna-pillar-summary">{pillar.summary}</p>
                    <div className="eterna-pillar-targets">{pillar.targets}</div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          TRACK 2: PROFESSIONAL CLINIC PLATFORM (B2B CLINICAL OS & SAAS)
      ────────────────────────────────────────────────────────────────────────── */}
      {activeTrack === 'clinic' && (
        <div className="eterna-track-content-fade">

          {/* 2.1 The Eterna Advantage (3 Strategic Pillars) */}
          <div className="eterna-advantage-trio">
            <div className="eterna-advantage-box">
              <div className="eterna-adv-icon" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
                <Brain size={22} />
              </div>
              <h5>{isEs ? 'Enfoque Multiómico Integrado' : 'Integrated Multiomics Approach'}</h5>
              <p>
                {isEs 
                  ? 'Combina genotipado masivo, analíticas en sangre, cuestionarios clínicos y telemetría de wearables en un único expediente continuo de longevidad.'
                  : 'Combines genetics, blood analytics, lifestyle questionnaires, and wearable data into a single patient journey for comprehensive precision health.'}
              </p>
            </div>

            <div className="eterna-advantage-box">
              <div className="eterna-adv-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                <Bot size={22} />
              </div>
              <h5>{isEs ? 'Eficiencia Impulsada por IA' : 'AI-Driven Efficiency'}</h5>
              <p>
                {isEs 
                  ? 'Agentes autónomos de IA que pre-interpretan archivos genéticos y generan briefings clínicos sintéticos, permitiendo a los médicos centrarse en la atención clínica.'
                  : 'Utilizes AI agents for raw file pre-interpretation and clinical briefings, allowing physicians to focus on patient care rather than tedious data entry.'}
              </p>
            </div>

            <div className="eterna-advantage-box">
              <div className="eterna-adv-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                <Building2 size={22} />
              </div>
              <h5>{isEs ? 'Una Plataforma. Una Trayectoria.' : 'One Platform. One Journey.'}</h5>
              <p>
                {isEs 
                  ? 'Ecosistema integral escalable con soporte multi-profesional, multi-sede y personalización de marca white-label para clínicas de medicina preventiva.'
                  : 'A comprehensive ecosystem enabling scalable, data-driven healthcare for modern longevity, aesthetic, and preventive medicine clinics.'}
              </p>
            </div>
          </div>

          {/* 2.2 Clinical Platform Pricing & Feature Matrix Table (GCP Style) */}
          <div className="eterna-pricing-table-card">
            <div className="eterna-pricing-header-row">
              <div>
                <h4 className="eterna-pricing-title">
                  {isEs ? 'Planes de Plataforma Clínica para Profesionales' : 'Professional Clinic Platform Pricing'}
                </h4>
                <p className="eterna-pricing-sub">
                  {isEs 
                    ? `Precios en ${currency}. ${billingCycle === 'annual' ? 'Facturación anual seleccionada (20% de ahorro incluido).' : 'Facturación mensual seleccionada.'}`
                    : `Prices in ${currency}. ${billingCycle === 'annual' ? 'Annual billing selected (20% savings applied).' : 'Monthly billing selected.'}`}
                </p>
              </div>
              <span className="eterna-b2b-guarantee-badge">
                <ShieldCheck size={14} color="#059669" />
                <span>{isEs ? 'Conforme HIPAA / GDPR Sanitario' : 'HIPAA & GDPR Health Compliant'}</span>
              </span>
            </div>

            <div className="eterna-pricing-grid">
              
              {/* TIER 1: FREE */}
              <div className="eterna-tier-col">
                <div className="eterna-tier-top">
                  <span className="eterna-tier-label">{isEs ? 'NIVEL DE ENTRADA' : 'ENTRY-LEVEL'}</span>
                  <h3 className="eterna-tier-name">Free</h3>
                  <div className="eterna-tier-price">
                    <span className="eterna-tier-amount">{clinicPricing.free}</span>
                    <span className="eterna-tier-cadence">{isEs ? '/mes' : '/month'}</span>
                  </div>
                  <p className="eterna-tier-desc">
                    {isEs 
                      ? 'Para médicos y especialistas individuales que inician su práctica de longevidad.' 
                      : 'Designed for solo practitioners, offering multiomic dashboarding and individual profiling.'}
                  </p>
                  <div className="eterna-tier-capacity">
                    <div><strong>1</strong> {isEs ? 'Profesional incluido' : 'Professional included'}</div>
                    <div><strong>5</strong> {isEs ? 'Pacientes activos máx.' : 'Active client capacity'}</div>
                  </div>
                </div>

                <div className="eterna-tier-features">
                  <div className="eterna-tf-item checked"><Check size={14} /> <span>{isEs ? 'Perfiles individuales de pacientes' : 'Individual Patient Profiles'}</span></div>
                  <div className="eterna-tf-item checked"><Check size={14} /> <span>{isEs ? 'Multiómica (Genética, Sangre, Wearables)' : 'Multiomics (Genetics, Blood, Wearables)'}</span></div>
                  <div className="eterna-tf-item disabled"><span>✕</span> <span>{isEs ? 'Pre-interpretación por IA' : 'AI File Pre-Interpretation'}</span></div>
                  <div className="eterna-tf-item disabled"><span>✕</span> <span>{isEs ? 'Branding y logo propio' : 'Own Clinic Branding'}</span></div>
                  <div className="eterna-tf-item disabled"><span>✕</span> <span>{isEs ? 'Agente de IA (Briefings Clínicos)' : 'AI Clinical Agent (Briefings)'}</span></div>
                  <div className="eterna-tf-item disabled"><span>✕</span> <span>{isEs ? 'Roles y permisos de equipo' : 'Team Roles & Permissions'}</span></div>
                  <div className="eterna-tf-item disabled"><span>✕</span> <span>{isEs ? 'Listado en Marketplace Profesional' : 'Professional Marketplace Listing'}</span></div>
                </div>

                <div className="eterna-tier-action">
                  <a href="#clinic-onboarding" className="eterna-tier-btn secondary">
                    {isEs ? 'Comenzar Gratis (5 Pacientes)' : 'Start Free Tier'}
                  </a>
                </div>
              </div>

              {/* TIER 2: STARTER */}
              <div className="eterna-tier-col">
                <div className="eterna-tier-top">
                  <span className="eterna-tier-label">{isEs ? 'PRÁCTICA INDIVIDUAL' : 'INDIVIDUAL PRACTICE'}</span>
                  <h3 className="eterna-tier-name">Starter</h3>
                  <div className="eterna-tier-price">
                    <span className="eterna-tier-amount">{clinicPricing.starter}</span>
                    <span className="eterna-tier-cadence">{isEs ? '/mes' : '/month'}</span>
                  </div>
                  <p className="eterna-tier-desc">
                    {isEs 
                      ? 'Optimización de consulta privada con pre-interpretación por IA y marca propia.' 
                      : 'Individual practice optimization with AI-assisted file pre-interpretation and custom branding.'}
                  </p>
                  <div className="eterna-tier-capacity">
                    <div><strong>1</strong> {isEs ? 'Profesional incluido' : 'Professional included'}</div>
                    <div><strong>50</strong> {isEs ? 'Pacientes activos máx.' : 'Active client capacity'}</div>
                  </div>
                </div>

                <div className="eterna-tier-features">
                  <div className="eterna-tf-item checked"><Check size={14} /> <span>{isEs ? 'Perfiles individuales de pacientes' : 'Individual Patient Profiles'}</span></div>
                  <div className="eterna-tf-item checked"><Check size={14} /> <span>{isEs ? 'Multiómica (Genética, Sangre, Wearables)' : 'Multiomics (Genetics, Blood, Wearables)'}</span></div>
                  <div className="eterna-tf-item checked highlight"><Check size={14} /> <span>{isEs ? 'IA Pre-Interpretación (100 / mes)' : 'AI Pre-Interpretation (100 / mo)'}</span></div>
                  <div className="eterna-tf-item checked"><Check size={14} /> <span>{isEs ? 'Branding propio (Logo y Color)' : 'Own Branding (Logo & Color)'}</span></div>
                  <div className="eterna-tf-item checked"><Check size={14} /> <span>{isEs ? 'Programa de Referidos activo' : 'Referral Program Access'}</span></div>
                  <div className="eterna-tf-item checked"><Check size={14} /> <span>{isEs ? 'Directorio en Marketplace' : 'Professional Marketplace Listing'}</span></div>
                  <div className="eterna-tf-item disabled"><span>✕</span> <span>{isEs ? 'Agente de IA (Briefings Clínicos)' : 'AI Clinical Agent (Briefings)'}</span></div>
                </div>

                <div className="eterna-tier-action">
                  <a href="#clinic-onboarding" className="eterna-tier-btn primary">
                    {isEs ? 'Elegir Starter' : 'Choose Starter'}
                  </a>
                </div>
              </div>

              {/* TIER 3: GROWTH (RECOMMENDED) */}
              <div className="eterna-tier-col featured">
                <div className="eterna-tier-featured-ribbon">
                  <Zap size={13} />
                  <span>{isEs ? 'RECOMENDADO PARA CLÍNICAS' : 'RECOMMENDED CLINIC TIER'}</span>
                </div>
                <div className="eterna-tier-top">
                  <span className="eterna-tier-label">{isEs ? 'ESCALA CORPORATIVA' : 'ENTERPRISE SCALABILITY'}</span>
                  <h3 className="eterna-tier-name">Growth</h3>
                  <div className="eterna-tier-price">
                    <span className="eterna-tier-amount">{clinicPricing.growth}</span>
                    <span className="eterna-tier-cadence">{isEs ? '/mes' : '/month'}</span>
                  </div>
                  <p className="eterna-tier-desc">
                    {isEs 
                      ? 'Solución completa White-Label para clínicas multidisciplinares con Agente de IA clínico ilimitado.' 
                      : 'Full white-label solution supporting 5 professionals and 250 patients with unlimited AI briefings.'}
                  </p>
                  <div className="eterna-tier-capacity highlighted">
                    <div><strong>{isEs ? 'Hasta 5' : 'Up to 5'}</strong> {isEs ? 'Profesionales incluidos' : 'Professionals included'}</div>
                    <div><strong>250</strong> {isEs ? 'Pacientes activos máx.' : 'Active client capacity'}</div>
                  </div>
                </div>

                <div className="eterna-tier-features">
                  <div className="eterna-tf-item checked"><Check size={14} /> <span>{isEs ? 'Perfiles individuales de pacientes' : 'Individual Patient Profiles'}</span></div>
                  <div className="eterna-tf-item checked"><Check size={14} /> <span>{isEs ? 'Multiómica completa en tiempo real' : 'Complete Real-Time Multiomics'}</span></div>
                  <div className="eterna-tf-item checked highlight"><Check size={14} /> <span>{isEs ? 'IA Pre-Interpretación ILIMITADA' : 'Unlimited AI Pre-Interpretation'}</span></div>
                  <div className="eterna-tf-item checked highlight"><Check size={14} /> <span>{isEs ? 'White-Label Total (Dominio & Portal)' : 'Full White-Label (Custom Domain)'}</span></div>
                  <div className="eterna-tf-item checked highlight"><Check size={14} /> <span>{isEs ? 'Agente de IA (Briefings & Sugerencias)' : 'AI Clinical Agent (Briefings)'}</span></div>
                  <div className="eterna-tf-item checked"><Check size={14} /> <span>{isEs ? 'Roles de Equipo y Permisos' : 'Team Roles & Permissions'}</span></div>
                  <div className="eterna-tf-item checked"><Check size={14} /> <span>{isEs ? 'Soporte 24/7 + Chat Directo' : '24/7 Dedicated Support + Chat'}</span></div>
                </div>

                <div className="eterna-tier-action">
                  <a href="#clinic-onboarding" className="eterna-tier-btn enterprise">
                    {isEs ? 'Desplegar Growth Enterprise' : 'Deploy Growth Tier'}
                  </a>
                </div>
              </div>

            </div>

            {/* 2.3 Scalability Add-Ons Bar */}
            <div className="eterna-addons-section">
              <div className="eterna-addons-head">
                <TrendingUp size={16} color="#003666" />
                <h5>{isEs ? 'Complementos de Escalabilidad Operativa:' : 'Scalability Add-Ons for Clinical Expansion:'}</h5>
              </div>

              <div className="eterna-addons-grid">
                <div className="eterna-addon-card">
                  <div className="eterna-addon-icon"><Users size={18} color="#0284c7" /></div>
                  <div className="eterna-addon-info">
                    <strong>{isEs ? 'Pack Expansión Pacientes (+50)' : 'Patient Roster Pack (+50)'}</strong>
                    <span>{clinicPricing.addon50} {isEs ? '/mes por cada 50 pacientes adicionales' : '/month to expand client base'}</span>
                  </div>
                </div>

                <div className="eterna-addon-card">
                  <div className="eterna-addon-icon"><Users size={18} color="#0d9488" /></div>
                  <div className="eterna-addon-info">
                    <strong>{isEs ? 'Pack Ágil Pacientes (+5)' : 'Agile Patient Pack (+5)'}</strong>
                    <span>{clinicPricing.addon5} {isEs ? '/mes para aumentos puntuales' : '/month for agile increments'}</span>
                  </div>
                </div>

                <div className="eterna-addon-card">
                  <div className="eterna-addon-icon"><ShieldCheck size={18} color="#7c3aed" /></div>
                  <div className="eterna-addon-info">
                    <strong>{isEs ? 'Profesional Clínico Adicional' : 'Additional Clinician Seat'}</strong>
                    <span>{clinicPricing.seat} {isEs ? '/mes por cada médico extra' : '/month per additional seat'}</span>
                  </div>
                </div>

                <div className="eterna-addon-card">
                  <div className="eterna-addon-icon"><Building2 size={18} color="#ea580c" /></div>
                  <div className="eterna-addon-info">
                    <strong>{isEs ? 'Sede de Clínica Adicional' : 'Multi-Location Sync'}</strong>
                    <span>{clinicPricing.location} {isEs ? '/mes por nueva ubicación de clínica' : '/month per new branch'}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* 2.4 Interactive AI Clinical Agent Simulation Box */}
          <div className="eterna-ai-briefing-simulation">
            <div className="eterna-sim-top">
              <div className="eterna-sim-badge">
                <Bot size={14} color="#0284c7" />
                <span>{isEs ? 'SIMULADOR DE AGENTE DE IA CLÍNICO' : 'AI CLINICAL BRIEFING AGENT (LIVE DEMO)'}</span>
              </div>
              <span className="eterna-sim-status">{isEs ? 'Briefing Generado en 1.2s' : 'Synthesized in 1.2s'}</span>
            </div>

            <div className="eterna-sim-body">
              <div className="eterna-sim-patient-header">
                <strong>{isEs ? 'Expediente Multiómico:' : 'Multiomic Case:'}</strong> Patient #ET-8492 · 48 yo Male · Chronological: 48.0y · 
                <span style={{ color: '#059669', fontWeight: 700 }}> Biological: 43.2y (-4.8y)</span> · DunedinPACE: 0.82
              </div>

              <div className="eterna-sim-findings-grid">
                <div className="eterna-sim-f-card">
                  <span className="sim-f-title">🧬 {isEs ? 'Genotipado de Entrada:' : 'Genomic Baseline:'}</span>
                  <p>APOE ε3/ε4 (Cardiovascular vigilance), CYP1A2 slow caffeine clearance, MTHFR C677T heterozygous.</p>
                </div>
                <div className="eterna-sim-f-card">
                  <span className="sim-f-title">🩸 {isEs ? 'Biomarcadores AgeScan:' : 'AgeScan Blood Series:'}</span>
                  <p>ApoB: 114 mg/dL (Elevated), HbA1c: 5.1% (Optimal insulin sensitivity), hs-CRP: 0.7 mg/L (Low inflammation).</p>
                </div>
                <div className="eterna-sim-f-card">
                  <span className="sim-f-title">⌚ {isEs ? 'Telemetría Wearables:' : 'Wearable Telemetry (24/7):'}</span>
                  <p>Mean HRV: 58ms, Sleep score: 84/100, delta wave deficiency observed consistently on Thursdays.</p>
                </div>
              </div>

              <div className="eterna-sim-ai-briefing">
                <div className="sim-ai-head">
                  <Sparkles size={14} color="#0284c7" />
                  <strong>{isEs ? 'Briefing Sintético Generado para el Médico:' : 'AI Clinical Briefing for Treating Physician:'}</strong>
                </div>
                <ol className="sim-ai-list">
                  <li>
                    <strong>{isEs ? 'Optimización Lipídica:' : 'Targeted Lipid Clearance:'}</strong>{' '}
                    {isEs 
                      ? 'ApoB elevado (114 mg/dL) combinado con alelo APOE ε4 requiere protocolo de depuración vascular con Omega-3 EPA/DHA de alta concentración y control trimestral con AgeScan Advanced.'
                      : 'Elevated ApoB (114 mg/dL) combined with APOE ε4 allele indicates protocol adjustment: high-concentration Omega-3 EPA/DHA + follow-up via AgeScan Advanced in 90 days.'}
                  </li>
                  <li>
                    <strong>{isEs ? 'Sincronización Circadiana:' : 'Circadian Synchrony Protocol:'}</strong>{' '}
                    {isEs 
                      ? 'Debido al polimorfismo CYP1A2 de aclaramiento lento, fijar restricción de cafeína antes de las 12:00 PM para restaurar la arquitectura de sueño delta profundo.'
                      : 'Due to CYP1A2 slow metabolizer status, restrict stimulant cutoff to 12:00 PM to recover deep delta sleep restoration.'}
                  </li>
                  <li>
                    <strong>{isEs ? 'Protocolo Magistral Sugerido:' : 'Suggested Magistral Formulation:'}</strong>{' '}
                    {isEs 
                      ? 'UltraPerson Multi-Active Matrix + Soporte de metilación adaptativa (L-Metilfolato + P5P).'
                      : 'UltraPerson Multi-Active Matrix + active folate support (L-Methylfolate + P5P).'}
                  </li>
                </ol>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ── 3. Quick Action Selector Bar (Universal Navigation) ── */}
      {onSelectSection && (
        <div className="eterna-quick-nav-bar">
          <div className="eterna-quick-nav-title">
            <Layers size={16} color="#003666" />
            <span>{isEs ? 'Explorar Secciones Técnicas de Eterna:' : 'Explore Technical Sections:'}</span>
          </div>

          <div className="eterna-quick-nav-buttons">
            <button
              type="button"
              className="eterna-quick-nav-btn"
              onClick={() => onSelectSection('reconstitution-section')}
            >
              <Dna size={14} />
              <span>{isEs ? '6 Pilares & Dianas' : '6 Pillars & Targets'}</span>
            </button>

            <button
              type="button"
              className="eterna-quick-nav-btn"
              onClick={() => onSelectSection('presentations-matrix')}
            >
              <Layers size={14} />
              <span>{isEs ? 'Kit y Presentaciones' : 'Kit Presentations'}</span>
            </button>

            <button
              type="button"
              className="eterna-quick-nav-btn"
              onClick={() => onSelectSection('specs-section')}
            >
              <ShieldCheck size={14} />
              <span>{isEs ? 'Certificado de Calidad' : 'Quality Certificate'}</span>
            </button>

            <button
              type="button"
              className="eterna-quick-nav-btn"
              onClick={() => onSelectSection('publications-section')}
            >
              <FileText size={14} />
              <span>{isEs ? 'Ensayos & Literatura' : 'Clinical Trials'}</span>
            </button>

            <button
              type="button"
              className="eterna-quick-nav-btn"
              onClick={() => onSelectSection('labels-section')}
            >
              <Tag size={14} />
              <span>{isEs ? 'Etiquetado Clínico' : 'Clinical Labels'}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
