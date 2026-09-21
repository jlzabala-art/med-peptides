"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Dna, 
  ShieldCheck, 
  Sparkles, 
  Activity, 
  Heart, 
  Clock, 
  CheckCircle2, 
  Download, 
  ExternalLink, 
  FileText, 
  Smartphone, 
  Cpu, 
  ArrowRight,
  FlaskConical,
  Award
} from '@/lib/icons';
import './EternaGeneticTechnicalSpecs.css';

export default function EternaGeneticTechnicalSpecs({ product, lang = 'en' }) {
  const [activeArea, setActiveArea] = useState('longevity');
  const isEs = lang === 'es';

  const areas = [
    {
      id: 'longevity',
      label: isEs ? 'Longevidad & Edad Biológica' : 'Longevity & Biological Age',
      icon: Clock,
      color: '#0d9488',
      summary: isEs 
        ? 'Evaluación de la tasa de envejecimiento celular, senescencia y relojes epigenéticos.'
        : 'Cellular aging rate, senescent cell burden, and epigenetic clock algorithms.'
    },
    {
      id: 'nutrition',
      label: isEs ? 'Nutrición & Metabolismo' : 'Nutrition & Metabolism',
      icon: Sparkles,
      color: '#0284c7',
      summary: isEs 
        ? 'Metabolismo de cafeína, conversión de Omega-3, asimilación de vitaminas y carbohidratos.'
        : 'Caffeine clearance, plant Omega-3 conversion, vitamin transport, and glycemic response.'
    },
    {
      id: 'cardio',
      label: isEs ? 'Prevención Cardiovascular' : 'Cardiovascular Prevention',
      icon: Heart,
      color: '#e11d48',
      summary: isEs 
        ? 'Genotipo ApoE, metabolismo de lipoproteínas, homocisteína y detoxificación hepática.'
        : 'ApoE genotype, lipid transport, homocysteine remethylation, and phase I/II detox.'
    },
    {
      id: 'sport',
      label: isEs ? 'Deporte & Rendimiento' : 'Fitness & Performance',
      icon: Activity,
      color: '#8b5cf6',
      summary: isEs 
        ? 'Genotipo ACTN3 de fibras musculares, cinética de recuperación articular y VO2 máx.'
        : 'ACTN3 fast-twitch fiber ratio, tissue recovery kinetics, and connective collagen tensile.'
    },
    {
      id: 'chronobiology',
      label: isEs ? 'Bienestar & Cronobiología' : 'Wellbeing & Chronobiology',
      icon: Cpu,
      color: '#d97706',
      summary: isEs 
        ? 'Cronotipo circadiano, arquitectura de sueño profundo delta y modulación del eje HPA.'
        : 'Circadian CLOCK chronotype, slow-wave delta sleep quality, and HPA axis resilience.'
    }
  ];

  const areaDetails = {
    longevity: {
      metrics: [
        {
          gene: 'TERT / TERC',
          name: isEs ? 'Mantenimiento Telomérico' : 'Telomerase Reverse Transcriptase',
          finding: isEs ? 'Genotipo con tasa de desgaste telomérico favorable' : 'Concordant with favorable telomere elongation capacity',
          status: 'Optimal',
          action: isEs ? 'Protocolo de estimulación telomérica con Epithalon semestral' : 'Biannual Epithalon peptide bioregulator course'
        },
        {
          gene: 'FOXO3 (rs2802292)',
          name: isEs ? 'Resistencia a la Senescencia Celular' : 'Forkhead Box O3 Longevity Axis',
          finding: isEs ? 'Alelo G protector asociado a longevidad extrema' : 'G-allele carrier associated with exceptional human longevity',
          status: 'High Resilience',
          action: isEs ? 'Optimización de autofagia mediante ayuno intermitente o agonistas AMPK' : 'Autophagy activation via AMPK modulation & MOTS-c'
        },
        {
          gene: 'SIRT1 / PARP1',
          name: isEs ? 'Reparación del ADN & Coenzima NAD+' : 'DNA Repair & Sirtuin Activation',
          finding: isEs ? 'Consumo incrementado de dinucleótido de nicotinamida' : 'High cellular NAD+ turnover rate under physiological stress',
          status: 'Actionable',
          action: isEs ? 'Suplementación con precursores NMN / NAD+ para mantener niveles óptimos' : 'Targeted NAD+ / NMN replenishment therapy'
        }
      ]
    },
    nutrition: {
      metrics: [
        {
          gene: 'CYP1A2 (rs762551)',
          name: isEs ? 'Metabolismo Hepático de Cafeína' : 'Hepatic Caffeine Clearance',
          finding: isEs ? 'Alelo A/C: Metabolizador Lento de cafeína' : 'A/C Carrier: Slow caffeine metabolizer phenotype',
          status: 'Attention',
          action: isEs ? 'Limitar ingesta de café a máx. 1-2 tazas al día y antes de las 12:00' : 'Limit coffee to 1-2 cups maximum before midday'
        },
        {
          gene: 'FADS1 (rs174537)',
          name: isEs ? 'Conversión de Ácidos Grasos Omega-3' : 'Fatty Acid Desaturase 1 (ALA → EPA/DHA)',
          finding: isEs ? 'Conversión reducida de Omega-3 vegetal (lino, chía)' : 'Reduced desaturase activity from plant-based ALA',
          status: 'Actionable',
          action: isEs ? 'Requerimiento imperativo de EPA/DHA marino directo en dosis clínica' : 'Direct marine EPA/DHA supplementation essential'
        },
        {
          gene: 'VDR (rs2228570)',
          name: isEs ? 'Receptor Nuclear de Vitamina D' : 'Vitamin D Nuclear Receptor Affinity',
          finding: isEs ? 'Afinidad de unión reducida a 1,25(OH)2D3' : 'Mild reduced transcriptional activation efficiency',
          status: 'Attention',
          action: isEs ? 'Mantener niveles de 25-OH Vitamina D sérica en rango de 60-80 ng/mL' : 'Target therapeutic 25-OH Vitamin D serum at 60–80 ng/mL'
        }
      ]
    },
    cardio: {
      metrics: [
        {
          gene: 'APOE (rs429358 / rs7412)',
          name: isEs ? 'Isoforma de Apolipoproteína E' : 'Apolipoprotein E Isoform',
          finding: isEs ? 'Genotipo ApoE ε3/ε3: Perfil de riesgo cardiovascular basal medio' : 'ApoE ε3/ε3: Baseline average cardiovascular risk profile',
          status: 'Normal Risk',
          action: isEs ? 'Monitorización anual de Apolipoproteína B (ApoB) y LDL oxidada' : 'Annual monitoring of ApoB and LDL particle density'
        },
        {
          gene: 'MTHFR (C677T & A1298C)',
          name: isEs ? 'Ruta de la Metilación & Homocisteína' : 'Folate Methionine Homocysteine Cycle',
          finding: isEs ? 'Heterocigoto C677T: Eficiencia enzimática al 65%' : 'Heterozygous C677T: ~65% methylfolate enzyme efficiency',
          status: 'Actionable',
          action: isEs ? 'Consumir folato activo (5-MTHF) y metilcobalamina; evitar ácido fólico sintético' : 'Use bioactive 5-MTHF & methylcobalamin'
        },
        {
          gene: 'GSTM1 / GSTT1',
          name: isEs ? 'Glutatión S-Transferasas (Detox Fase II)' : 'Phase II Glutathione Conjugation',
          finding: isEs ? 'Genotipo nulo parcial en GSTM1' : 'Partial deletion in GSTM1 reducing xenobiotic conjugation',
          status: 'Actionable',
          action: isEs ? 'Soporte con N-Acetilcisteína (NAC) y glutatión liposomal' : 'Support with NAC (N-Acetylcysteine) & Glutathione'
        }
      ]
    },
    sport: {
      metrics: [
        {
          gene: 'ACTN3 (R577X)',
          name: isEs ? 'Alfa-Actinina-3 en Fibras Rápidas' : 'Fast-Twitch Alpha-Actinin-3',
          finding: isEs ? 'Genotipo R/X: Fibras híbridas equilibradas (Fuerza y Resistencia)' : 'R/X Genotype: Balanced hybrid fast/slow twitch fiber mix',
          status: 'Hybrid Profile',
          action: isEs ? 'Periodización combinada de entrenamiento de fuerza e hipertrofia con aeróbico' : 'Combined concurrent resistance and aerobic training'
        },
        {
          gene: 'COL1A1 / COL5A1',
          name: isEs ? 'Estructura de Colágeno en Tendones' : 'Fibrillar Collagen Tendon Architecture',
          finding: isEs ? 'Variante protectora frente a roturas de tendón de Aquiles' : 'Favorable structural resilience against tendon rupture',
          status: 'Protected',
          action: isEs ? 'Cargas excéntricas y soporte con péptidos reparadores BPC-157 / GHK-Cu' : 'Progressive eccentric loading; BPC-157 / GHK-Cu support'
        },
        {
          gene: 'IL6 (rs1800795)',
          name: isEs ? 'Respuesta Inflamatoria Post-Ejercicio' : 'Post-Exercise Interleukin-6 Response',
          finding: isEs ? 'Alelo C: Mayor aclaramiento inflamatorio y rápida recuperación' : 'C-allele: Efficient cytokine resolution and rapid recovery',
          status: 'Optimal',
          action: isEs ? 'Permite frecuencias de entreno elevadas con descansos activos' : 'Supports elevated training frequency with active recovery'
        }
      ]
    },
    chronobiology: {
      metrics: [
        {
          gene: 'CLOCK (rs1801260)',
          name: isEs ? 'Ritmo Circadiano & Cronotipo' : 'Circadian Locomotor Output Cycles',
          finding: isEs ? 'Genotipo T/C: Cronotipo intermedio con ligera tendencia matutina' : 'T/C Genotype: Intermediate chronotype with morning lean',
          status: 'Optimal',
          action: isEs ? 'Exposición a luz solar en los primeros 30 minutos tras despertar' : 'Direct outdoor light exposure within 30 min of waking'
        },
        {
          gene: 'COMT (Val158Met)',
          name: isEs ? 'Catecol-O-Metiltransferasa (Dopamina / Estrés)' : 'Catecholamine Degradation Rate',
          finding: isEs ? 'Genotipo Val/Met: Degradación equilibrada de catecolaminas bajo estrés' : 'Val/Met: Balanced dopamine degradation and stress buffering',
          status: 'Balanced',
          action: isEs ? 'Excelente resiliencia ejecutiva; optimizar magnesio y adaptógenos en sobrecarga' : 'High executive focus; maintain magnesium & adaptogens'
        },
        {
          gene: 'BDNF (Val66Met)',
          name: isEs ? 'Factor Neurotrófico Derivado del Cerebro' : 'Brain-Derived Neurotrophic Factor',
          finding: isEs ? 'Val/Val: Máxima neuroplasticidad y retención de memoria' : 'Val/Val: Optimal activity-dependent neuroplasticity',
          status: 'High Performance',
          action: isEs ? 'Refuerzo cognitivo mediante ejercicio de alta intensidad y péptidos Semax / Selank' : 'Sustain with aerobic exercise & Semax / Selank'
        }
      ]
    }
  };

  const currentDetails = areaDetails[activeArea] || areaDetails.longevity;

  return (
    <div className="eterna-specs-root">
      {/* ── Top Quality Header Ribbon ── */}
      <div className="eterna-specs-header">
        <div className="eterna-header-left">
          <div className="eterna-header-icon-wrap">
            <Dna size={26} color="#5eead4" />
          </div>
          <div>
            <div className="eterna-header-meta">
              <span className="eterna-facility-pill">
                ETERNA Diagnostics S.L. · Madrid, España
              </span>
              <span className="eterna-ce-pill">
                <CheckCircle2 size={11} /> CE-IVD DIRECTIVE 2017/746
              </span>
            </div>
            <h3 className="eterna-header-title">
              ETERNA® DNA & Epigenetic Longevity Suite
            </h3>
          </div>
        </div>

        <div className="eterna-header-right">
          <div className="eterna-iso-badge">
            <Award size={15} color="#5eead4" />
            <span>ISO 15189 European Accredited Laboratory</span>
          </div>
        </div>
      </div>

      {/* ── Key Technical Indicators Grid (Saliva & Microarray) ── */}
      <div className="eterna-kpi-grid">
        {/* KPI 1: Biological Specimen */}
        <div className="eterna-kpi-card">
          <div className="eterna-kpi-top">
            <span className="eterna-kpi-label">
              <FlaskConical size={12} color="#0d9488" /> {isEs ? 'Matriz Biológica de Muestra' : 'Biological Specimen Matrix'}
            </span>
            <span className="eterna-kpi-pill specimen-pill">{isEs ? 'SIN AGUJAS' : 'NON-INVASIVE'}</span>
          </div>
          <div className="eterna-kpi-val font-mono">
            {isEs ? 'Saliva (Buffer ADN)' : 'Saliva (DNA Buffer)'}
          </div>
          <div className="eterna-kpi-sub">
            {isEs ? '2.0 mL tubo estabilizador · Estable 12 meses a 15–25°C' : '2.0 mL collection tube · Stable 12 mo at 15–25°C'}
          </div>
        </div>

        {/* KPI 2: Genomic Resolution */}
        <div className="eterna-kpi-card">
          <div className="eterna-kpi-top">
            <span className="eterna-kpi-label">
              <Sparkles size={12} color="#0284c7" /> {isEs ? 'Resolución Genómica (SNPs)' : 'Genotyping Array Resolution'}
            </span>
            <span className="eterna-kpi-pill tech-pill">MICROARRAY</span>
          </div>
          <div className="eterna-kpi-val font-mono">
            +700.000 SNPs
          </div>
          <div className="eterna-kpi-sub">
            {isEs ? 'Array de alta densidad con llamada de genotipo > 99.8%' : 'High-density array with > 99.8% call rate accuracy'}
          </div>
        </div>

        {/* KPI 3: Health Metrics */}
        <div className="eterna-kpi-card">
          <div className="eterna-kpi-top">
            <span className="eterna-kpi-label">
              <Activity size={12} color="#8b5cf6" /> {isEs ? 'Métricas Clínicas de Salud' : 'Clinical Health Markers'}
            </span>
            <span className="eterna-kpi-pill metrics-pill">5 ÁREAS</span>
          </div>
          <div className="eterna-kpi-val font-mono">
            183 {isEs ? 'Métricas' : 'Metrics'}
          </div>
          <div className="eterna-kpi-sub">
            {isEs ? 'Nutrición, Deporte, Prevención, Longevidad y Cronobiología' : 'Nutrition, Sport, Prevention, Longevity & Sleep'}
          </div>
        </div>

        {/* KPI 4: Data Ownership & Wearables */}
        <div className="eterna-kpi-card">
          <div className="eterna-kpi-top">
            <span className="eterna-kpi-label">
              <Smartphone size={12} color="#16a34a" /> {isEs ? 'Telemetría & Datos en Bruto' : 'Wearables & Raw Data'}
            </span>
            <span className="eterna-kpi-pill data-pill">RAW .TXT</span>
          </div>
          <div className="eterna-kpi-val font-mono">
            {isEs ? 'Datos Tuyos' : 'Full Raw .TXT'}
          </div>
          <div className="eterna-kpi-sub">
            {isEs ? 'Descarga libre compatible con Promethease + Sync Wearables' : 'Free download Promethease-ready + Live Wearables'}
          </div>
        </div>
      </div>

      {/* ── Interactive 5-Domain Health Explorer ── */}
      <div className="eterna-explorer-card">
        <div className="eterna-explorer-header">
          <div>
            <div className="eterna-explorer-tag">
              ETERNA™ CLINICAL GENOMICS ENGINE
            </div>
            <h4 className="eterna-explorer-title">
              {isEs ? 'Explorador Interactivo de Áreas Genéticas y Variantes' : 'Interactive Genomic Markers & Health Domain Explorer'}
            </h4>
          </div>
          <span className="eterna-explorer-note">
            {isEs ? 'Selecciona un área clínica para examinar marcadores' : 'Select a clinical domain to inspect validated SNPs'}
          </span>
        </div>

        {/* Domain Tabs */}
        <div className="eterna-tabs-nav">
          {areas.map(area => {
            const Icon = area.icon;
            const isSelected = activeArea === area.id;
            return (
              <button
                key={area.id}
                type="button"
                className={`eterna-tab-btn ${isSelected ? 'active' : ''}`}
                onClick={() => setActiveArea(area.id)}
              >
                <Icon size={16} color={isSelected ? '#0d9488' : '#64748b'} />
                <span>{area.label}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Domain Content */}
        <div className="eterna-tab-body">
          <div className="eterna-area-summary">
            <strong>{isEs ? 'Enfoque Clínico:' : 'Clinical Focus:'}</strong> {areas.find(a => a.id === activeArea)?.summary}
          </div>

          <div className="eterna-metrics-table-wrap">
            <table className="eterna-metrics-table">
              <thead>
                <tr>
                  <th>{isEs ? 'Gen & Variante (SNP)' : 'Gene & Variant (SNP)'}</th>
                  <th>{isEs ? 'Marcador Funcional' : 'Functional Trait'}</th>
                  <th>{isEs ? 'Hallazgo Genético Observado' : 'Genomic Phenotype'}</th>
                  <th>{isEs ? 'Estado' : 'Status'}</th>
                  <th>{isEs ? 'Intervención Clínica / Acción' : 'Clinical Optimization Strategy'}</th>
                </tr>
              </thead>
              <tbody>
                {currentDetails.metrics.map((m, idx) => (
                  <tr key={idx}>
                    <td className="eterna-font-mono font-bold" data-label={isEs ? 'Gen' : 'Gene'}>
                      {m.gene}
                    </td>
                    <td data-label={isEs ? 'Marcador' : 'Trait'}>
                      {m.name}
                    </td>
                    <td data-label={isEs ? 'Hallazgo' : 'Phenotype'}>
                      {m.finding}
                    </td>
                    <td data-label={isEs ? 'Estado' : 'Status'}>
                      <span className={`eterna-status-chip ${m.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {m.status}
                      </span>
                    </td>
                    <td data-label={isEs ? 'Acción' : 'Strategy'} className="eterna-action-cell">
                      {m.action}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Organ Biological Age & Wearables Section ── */}
      <div className="eterna-telemetry-grid">
        {/* Left: Biological Organ Age Estimator */}
        <div className="eterna-telemetry-card">
          <div className="eterna-telemetry-header">
            <div>
              <div className="eterna-mini-tag">{isEs ? 'ALGORITMO DE EDAD BIOLÓGICA' : 'BIOLOGICAL AGE ALGORITHM'}</div>
              <h4 className="eterna-card-title">{isEs ? 'Estimación de Edad por Órgano' : 'Biological Age by Organ System'}</h4>
            </div>
            <span className="eterna-rate-badge">0.82 / {isEs ? 'Año (Lento)' : 'Year (Slow)'}</span>
          </div>

          <div className="eterna-organ-list">
            {[
              { organ: isEs ? "Sistema Nervioso & Cognitivo" : "Brain & Nervous System", diff: "-4.2 " + (isEs ? "Años" : "Years"), score: isEs ? "Óptimo" : "Optimal", color: "#0ea5e9", pct: 92 },
              { organ: isEs ? "Sistema Cardiovascular" : "Cardiovascular System", diff: "-2.8 " + (isEs ? "Años" : "Years"), score: isEs ? "Óptimo" : "Optimal", color: "#e11d48", pct: 86 },
              { organ: isEs ? "Eje Inmunitario & Inflamatorio" : "Immune & Inflammatory Axis", diff: "-5.1 " + (isEs ? "Años" : "Years"), score: isEs ? "Excelente" : "Optimized", color: "#9333ea", pct: 95 }
            ].map((item, i) => (
              <div key={i} className="eterna-organ-row">
                <div>
                  <div className="eterna-organ-name">{item.organ}</div>
                  <div className="eterna-organ-sub">
                    {isEs ? 'Desviación vs Edad Cronológica:' : 'Deviation vs Chronological:'} <strong style={{ color: '#16a34a' }}>{item.diff}</strong>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="eterna-organ-score" style={{ color: item.color }}>{item.score}</span>
                  <div className="eterna-progress-bar">
                    <div className="eterna-progress-fill" style={{ width: `${item.pct}%`, background: item.color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Continuous Wearables Telemetry */}
        <div className="eterna-telemetry-card">
          <div className="eterna-telemetry-header">
            <div>
              <div className="eterna-mini-tag">{isEs ? 'INTEGRACIÓN CONTINUA' : 'CONTINUOUS TELEMETRY'}</div>
              <h4 className="eterna-card-title">{isEs ? 'Sincronización con Wearables' : 'Live Wearables Telemetry'}</h4>
            </div>
            <div className="eterna-devices-row">
              {['Apple Watch', 'Garmin', 'Oura Ring'].map((dev, i) => (
                <span key={i} className="eterna-device-pill">{dev}</span>
              ))}
            </div>
          </div>

          <div className="eterna-telemetry-metrics">
            {[
              { title: isEs ? "Arquitectura de Sueño" : "Sleep Architecture", val: "88%", label: isEs ? "Sueño Reparador" : "Restorative", color: "#0ea5e9" },
              { title: isEs ? "Variabilidad Cardíaca (HRV)" : "Heart Rate Variability", val: "78 ms", label: "+14% Baseline", color: "#9333ea" },
              { title: isEs ? "Frecuencia en Reposo" : "Resting Heart Rate", val: "54 bpm", label: isEs ? "Rango Atlético" : "Athletic Optimal", color: "#16a34a" },
              { title: isEs ? "Índice de Recuperación" : "Recovery Index", val: "94/100", label: isEs ? "Listo para Carga" : "Ready for Load", color: "#d97706" }
            ].map((m, idx) => (
              <div key={idx} className="eterna-metric-box">
                <span className="eterna-metric-label">{m.title}</span>
                <span className="eterna-metric-val font-mono">{m.val}</span>
                <span className="eterna-metric-tag" style={{ color: m.color }}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 5-Step At-Home Collection Protocol ── */}
      <div className="eterna-protocol-card">
        <div className="eterna-protocol-header">
          <div>
            <div className="eterna-protocol-badge">{isEs ? 'PROTOCOLO CLÍNICO' : 'SAMPLING STANDARD'}</div>
            <h4 className="eterna-protocol-title">{isEs ? 'Toma de Muestra de Saliva en 5 Minutos' : 'Non-Invasive 5-Minute Saliva Protocol'}</h4>
          </div>
          <span className="eterna-protocol-note">{isEs ? 'Comodidad total en el hogar · Cero pinchazos' : 'At-home convenience · Zero needles'}</span>
        </div>

        <div className="eterna-steps-grid">
          {[
            { step: "01", title: isEs ? "Ayuno Previo (30 min)" : "Fasting Window (30 min)", desc: isEs ? "No comer, beber, fumar ni masticar chicle durante los 30 minutos previos a la toma." : "Avoid food, beverages, tobacco, or chewing gum for 30 minutes prior." },
            { step: "02", title: isEs ? "Depósito de Saliva" : "Saliva Collection", desc: isEs ? "Salivar en el embudo hasta alcanzar la línea de 2.0 mL (sin incluir burbujas de aire)." : "Spit into collection funnel up to the marked 2.0 mL fill line." },
            { step: "03", title: isEs ? "Liberación del Buffer" : "Buffer Release", desc: isEs ? "Enroscar el tapón de seguridad para liberar automáticamente el reactivo estabilizador." : "Screw cap firmly to automatically release DNA stabilizing preservative." },
            { step: "04", title: isEs ? "Homogeneización (5s)" : "Vigorous Mixing (5s)", desc: isEs ? "Agitar el tubo enérgicamente durante 5 segundos para mezclar el buffer con la saliva." : "Shake vigorously for 5 seconds to homogenize saliva with preservation buffer." },
            { step: "05", title: isEs ? "Envío Prepago al Lab" : "Prepaid Lab Dispatch", desc: isEs ? "Introducir en el sobre de bioseguridad prepagado y depositar en Correos/DHL." : "Place in prepaid biohazard return mailer for courier pickup or drop-off." }
          ].map(s => (
            <div key={s.step} className="eterna-step-card">
              <span className="eterna-step-num font-mono">{s.step}</span>
              <h5 className="eterna-step-title">{s.title}</h5>
              <p className="eterna-step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Eterna Diagnostics Ecosystem Navigation ── */}
      <div className="eterna-ecosystem-card">
        <div className="eterna-ecosystem-header">
          <div>
            <div className="eterna-ecosystem-tag">{isEs ? 'SUITE ETERNA DIAGNOSTICS' : 'ETERNA DIAGNOSTICS ECOSYSTEM'}</div>
            <h4 className="eterna-ecosystem-title">{isEs ? 'Productos y Servicios Complementarios Eterna' : 'Complementary Eterna Suite Products & Services'}</h4>
          </div>
          <span className="eterna-ecosystem-link-all">
            <Link href="/catalog?supplier=supplier-eternadx" className="eterna-view-all-btn">
              <span>{isEs ? 'Ver Catálogo Eterna Completo' : 'View Full Eterna Catalog'}</span>
              <ArrowRight size={13} />
            </Link>
          </span>
        </div>

        <div className="eterna-ecosystem-grid">
          {[
            {
              slug: 'eternadx-agescan-basic',
              name: 'Eterna DX AgeScan Basic',
              category: isEs ? 'Biomarcadores Sanguíneos' : 'Blood Biomarkers',
              desc: isEs ? 'Panel bioquímico básico (hemoglobina, glucosa en ayunas, colesterol) calibrador de edad biológica.' : 'Essential blood biochemistry panel for biological age calibration.'
            },
            {
              slug: 'eternadx-agescan-advanced',
              name: 'Eterna DX AgeScan Advanced',
              category: isEs ? 'Panel Avanzado de Longevidad' : 'Advanced Longevity Panel',
              desc: isEs ? 'Panel sanguíneo integral: ApoB, HbA1c, hs-CRP, Lipoproteína(a) y ratio metabólico.' : 'Comprehensive blood panel measuring ApoB, HbA1c, hs-CRP, Lp(a), and metabolic indices.'
            },
            {
              slug: 'eternadx-bio-age-organ-pro',
              name: 'Eterna DX Biological Age by Organ (Pro)',
              category: isEs ? 'Proteómica de Precisión' : 'Precision Proteomics',
              desc: isEs ? 'Determinación proteómica de la edad biológica independiente por órganos (cerebro, corazón, inmunidad).' : 'Proteomic quantification of organ-specific biological age differentials.'
            },
            {
              slug: 'eternadx-pro-subscription',
              name: 'Eterna DX Pro Subscription',
              category: isEs ? 'Suscripción Digital / App' : 'Digital Platform & App',
              desc: isEs ? 'Acceso vitalicio a la app, telemetría continua con wearables y actualización con nueva evidencia científica.' : 'Continuous platform access, wearables telemetry, and automated scientific updates.'
            }
          ].map(p => (
            <div key={p.slug} className="eterna-suite-card">
              <div className="eterna-suite-cat">{p.category}</div>
              <h5 className="eterna-suite-name">{p.name}</h5>
              <p className="eterna-suite-desc">{p.desc}</p>
              <Link href={`/p/${p.slug}?supplier=supplier-eternadx`} className="eterna-suite-link">
                <span>{isEs ? 'Ver Especificación Técnica' : 'View Specification'}</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
