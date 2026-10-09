"use client";

import React from 'react';
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
  Tag
} from '@/lib/icons';
import './EternaPublicOverviewShowcase.css';

/**
 * EternaPublicOverviewShowcase
 * ─────────────────────────────────────────────────────────────────────────────
 * Ultra-attractive, Google Cloud Console-compliant public longevity & epigenetic
 * overview component for ETERNA™ Diagnostic products.
 */
export default function EternaPublicOverviewShowcase({
  product = {},
  lang = 'en',
  onSelectSection = null
}) {
  const isEs = lang === 'es';

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
    }
  ];

  return (
    <div className="eterna-overview-root">
      {/* ── 1. Top Longevity Metric Hero Card ── */}
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
            {isEs ? 'PANEL EPIGENÉTICO DE PRECISIÓN' : 'PRECISION EPIGENETICS SUITE'}
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

      {/* ── 2. The 5 Epigenetic Pillars Preview ── */}
      <div className="eterna-pillars-section">
        <div className="eterna-section-head">
          <div className="eterna-section-title-wrap">
            <div className="eterna-section-icon-box">
              <Dna size={20} />
            </div>
            <div>
              <h4 className="eterna-section-title">
                {isEs ? 'Los 5 Pilares Epigenéticos de Intervención' : 'The 5 Epigenetic Intervention Pillars'}
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

      {/* ── 3. Sampling, Raw Genomic Data & Wearables Bar ── */}
      <div className="eterna-features-strip">
        <div className="eterna-feature-box">
          <div className="eterna-feature-icon-wrap" style={{ background: '#ecfdf5', color: '#059669' }}>
            <CheckCircle2 size={18} />
          </div>
          <div className="eterna-feature-content">
            <h5>{isEs ? 'Muestreo Salival No Invasivo' : 'Non-Invasive Saliva Collection'}</h5>
            <p>
              {isEs 
                ? 'Tubo estabilizador Oragene® DNA CE-IVD. Toma indolora de 2 minutos sin venopunción, estable 5 años a temperatura ambiente.'
                : 'Oragene® DNA CE-IVD saliva kit. Painless 2-minute collection, ambient temperature stable for 5 years.'}
            </p>
          </div>
        </div>

        <div className="eterna-feature-box">
          <div className="eterna-feature-icon-wrap" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
            <Download size={18} />
          </div>
          <div className="eterna-feature-content">
            <h5>{isEs ? 'Exportación de Datos Brutos (.TXT)' : 'Full Raw Genomic Data (.TXT)'}</h5>
            <p>
              {isEs 
                ? 'Descarga completa de genotipado en formato compatible con motores bioinformáticos de terceros (Promethease, SelfDecode).'
                : 'Complete raw genotype export compatible with third-party bioinformatics engines (Promethease, SelfDecode).'}
            </p>
          </div>
        </div>

        <div className="eterna-feature-box">
          <div className="eterna-feature-icon-wrap" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
            <Smartphone size={18} />
          </div>
          <div className="eterna-feature-content">
            <h5>{isEs ? 'Integración con Dispositivos de Salud' : 'Wearable Device Sync'}</h5>
            <p>
              {isEs 
                ? 'Conexión opcional con Apple Health, Oura Ring, Garmin y Whoop para correlacionar variabilidad cardíaca y sueño con el reloj biológico.'
                : 'Sync with Apple Health, Oura, Garmin, and Whoop to track HRV, delta sleep, and epigenetic trajectories.'}
            </p>
          </div>
        </div>
      </div>

      {/* ── 4. Quick Action Selector Bar ── */}
      {onSelectSection && (
        <div className="eterna-quick-nav-bar">
          <div className="eterna-quick-nav-title">
            <Layers size={16} color="#003666" />
            <span>{isEs ? 'Explorar Secciones Técnicas de Eterna:' : 'Explore Eterna Technical Sections:'}</span>
          </div>

          <div className="eterna-quick-nav-buttons">
            <button
              type="button"
              className="eterna-quick-nav-btn"
              onClick={() => onSelectSection('reconstitution-section')}
            >
              <Dna size={14} />
              <span>{isEs ? '5 Pilares & Dianas Genéticas' : '5 Pillars & Genetic Targets'}</span>
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
