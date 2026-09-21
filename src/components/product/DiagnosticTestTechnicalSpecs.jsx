"use client";

import React, { useState } from 'react';
import { 
  Activity, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Droplets, 
  Thermometer, 
  FileText, 
  Check, 
  Building2, 
  Award,
  ArrowRight,
  Info,
  Calendar,
  Layers,
  FlaskConical,
  ExternalLink
} from '@/lib/icons';
import './DiagnosticTestTechnicalSpecs.css';

/**
 * DiagnosticTestTechnicalSpecs
 * ─────────────────────────────────────────────────────────────────────────────
 * Institutional Clinical Monograph Component for Diagnostic Kits (Bloodo DBS).
 * Replaces the injectable peptide reconstitution and U-100 syringe calculator
 * with clinical dried blood spot (DBS) methodology, enzymatic/chromatographic
 * assay specifications, interactive biomarker reference range simulator, and
 * illustrated 3-step at-home collection protocol.
 */
export default function DiagnosticTestTechnicalSpecs({ 
  product, 
  selectedDose = '1 test / kit', 
  supplierName = 'Bloodo UAB', 
  lang = 'en' 
}) {
  const isEs = lang === 'es';
  const slug = (product?.slug || product?.id || '').toLowerCase();
  
  // Identify specific Bloodo test type
  const isNad = slug.includes('nad');
  const isHba1c = slug.includes('hba1c') || slug.includes('hemoglobin');
  const isOmega = slug.includes('omega');
  const isVitD = slug.includes('vitamin-d');

  // Interactive biomarker level simulator state
  const [selectedRangeIndex, setSelectedRangeIndex] = useState(2); // Default to optimal/target

  // Biomarker ranges configuration
  const biomarkerData = (() => {
    if (isNad) {
      return {
        name: isEs ? 'NAD Total Intracelular (NAD⁺ + NADH)' : 'Total Intracellular NAD (NAD+ & NADH)',
        unit: 'µmol/L',
        method: isEs ? 'Ensayo Enzimático Cíclico (Espectrofotometría)' : 'Enzymatic Cyclic Assay (Colorimetric/Spectrophotometric)',
        lab: 'LifeLab1 (Vilnius, Lithuania)',
        lod: '0.23 µmol/L',
        range: '5.0 – 60.0 µmol/L',
        precision: 'RSD 6.6%',
        ranges: [
          {
            label: isEs ? 'Depleción Severa' : 'Severe Depletion',
            value: '< 20 µmol/L',
            status: 'critical',
            badge: isEs ? 'Riesgo Energético Alto' : 'High Energy Deficit',
            color: '#dc2626',
            bgColor: '#fef2f2',
            description: isEs 
              ? 'Niveles críticamente bajos asociados a fatiga mitocondrial crónica, senescencia celular acelerada y capacidad de reparación de ADN disminuida (baja actividad de PARP1 y sirtuinas).'
              : 'Critically depressed levels correlated with chronic mitochondrial exhaustion, accelerated cellular senescence, and impaired DNA repair (reduced sirtuin & PARP1 activity).'
          },
          {
            label: isEs ? 'Rango Moderado / Subóptimo' : 'Suboptimal / Moderate',
            value: '20 – 30 µmol/L',
            status: 'warning',
            badge: isEs ? 'Margen de Optimización' : 'Room for Optimization',
            color: '#d97706',
            bgColor: '#fffbeb',
            description: isEs
              ? 'Nivel medio poblacional en adultos mayores de 40 años. Pérdida típica del 40-50% respecto a la juventud. Recomendada optimización con precursores (NMN/NR/NAD+ IV) y ejercicio.'
              : 'Standard adult population median (>40 yrs). Typical 40-50% decline from peak youthful levels. High clinical utility for supplementation (NMN/NR/NAD+ therapy) and exercise.'
          },
          {
            label: isEs ? 'Rango Óptimo de Longevidad' : 'Optimal Longevity Range',
            value: '30 – 50 µmol/L',
            status: 'optimal',
            badge: isEs ? 'Objetivo Terapéutico' : 'Target Clinical Range',
            color: '#0d9488',
            bgColor: '#f0fdfa',
            description: isEs
              ? 'Nivel celular óptimo asociado a máxima activación de SIRT1 y SIRT3, biogénesis mitocondrial eficiente, alta capacidad física y recuperación celular sostenida.'
              : 'Ideal therapeutic baseline reflecting youthful cellular bioenergetics, peak SIRT1/SIRT3 sirtuin activation, efficient ATP synthesis, and resilient DNA integrity.'
          },
          {
            label: isEs ? 'Nivel Máximo Estimulado' : 'Peak Stimulated / Supra-optimal',
            value: '> 50 µmol/L',
            status: 'super',
            badge: isEs ? 'Pico Pos-Tratamiento' : 'Post-Intervention Peak',
            color: '#2563eb',
            bgColor: '#eff6ff',
            description: isEs
              ? 'Valores alcanzados habitualmente tras protocolos activos de infusión intravenosa de NAD+, suplementación de alta dosis con activadores de sirtuinas o protocolos regenerativos.'
              : 'Levels achieved following intensive clinical NAD+ IV therapy, high-dose precursor administration, and caloric restriction/longevity protocols.'
          }
        ]
      };
    }

    if (isHba1c) {
      return {
        name: isEs ? 'Hemoglobina Glicosilada (HbA1c)' : 'Glycated Hemoglobin (HbA1c)',
        unit: '% / mmol/mol',
        method: isEs ? 'Cromatografía de Afinidad por Boronato sobre Sangre Seca' : 'Boronate Affinity Chromatography / Certified DBS Immunoassay',
        lab: 'LifeLab1 (Vilnius, Lithuania)',
        lod: '3.5% (15 mmol/mol)',
        range: '4.0% – 15.0%',
        precision: 'RSD < 3.2%',
        ranges: [
          {
            label: isEs ? 'Metabolismo Óptimo' : 'Optimal Metabolic Health',
            value: '< 5.4%',
            status: 'optimal',
            badge: isEs ? 'Excelente' : 'Optimal',
            color: '#0d9488',
            bgColor: '#f0fdfa',
            description: isEs
              ? 'Excelente sensibilidad a la insulina y control glucémico estable a lo largo de los últimos 90 días. Bajo riesgo cardiovascular y de glicación tisular.'
              : 'Optimal insulin sensitivity and stable 90-day glycemic tone. Minimal systemic advanced glycation end-products (AGEs).'
          },
          {
            label: isEs ? 'Rango Normal' : 'Standard Normal',
            value: '5.4% – 5.6%',
            status: 'optimal',
            badge: isEs ? 'Normal' : 'Normal',
            color: '#16a34a',
            bgColor: '#f0fdf4',
            description: isEs
              ? 'Parámetro glucémico dentro de límites convencionales según criterios clínicos internacionales (ADA / OMS).'
              : 'Conventional normoglycemic range compliant with international endocrinology guidelines (ADA / WHO).'
          },
          {
            label: isEs ? 'Prediabetes / Resistencia Insulínica' : 'Prediabetes / Insulin Resistance',
            value: '5.7% – 6.4%',
            status: 'warning',
            badge: isEs ? 'Alerta Metabólica' : 'Metabolic Alert',
            color: '#d97706',
            bgColor: '#fffbeb',
            description: isEs
              ? 'Indica resistencia a la insulina y variabilidad glucémica crónica. Momento clave para intervención preventiva mediante péptidos GLP-1/GIP o cambios metabólicos.'
              : 'Signals progressive insulin resistance and chronic glycemic spikes. High-yield window for therapeutic metabolic optimization and GLP-1/GIP therapies.'
          },
          {
            label: isEs ? 'Glucemia Elevada' : 'Elevated / Diabetic Range',
            value: '≥ 6.5%',
            status: 'critical',
            badge: isEs ? 'Atención Clínica' : 'Clinical Action Required',
            color: '#dc2626',
            bgColor: '#fef2f2',
            description: isEs
              ? 'Criterio diagnóstico de diabetes mellitus. Requiere seguimiento médico, ajuste farmacológico y monitorización continua.'
              : 'Diagnostic threshold for diabetes mellitus. Demands clinical supervision, lifestyle intervention, and physician follow-up.'
          }
        ]
      };
    }

    if (isOmega) {
      return {
        name: isEs ? 'Índice Omega-3 y Ratio Omega-6/3' : 'Omega-3 Index & Omega-6/3 Ratio',
        unit: '% membranas eritrocitarias',
        method: isEs ? 'Cromatografía de Gases con Espectrometría (GC-MS / FID)' : 'Gas Chromatography Flame Ionization Detection (GC-FID / GC-MS)',
        lab: 'LifeLab1 (Vilnius, Lithuania)',
        lod: '0.05% total FA',
        range: '24 Ácidos Grasos (0.1% – 50%)',
        precision: 'RSD < 4.5%',
        ranges: [
          {
            label: isEs ? 'Alto Riesgo Inflamatorio' : 'High Inflammatory Risk',
            value: '< 4% Index | Ratio > 15:1',
            status: 'critical',
            badge: isEs ? 'Inflamación Alta' : 'Pro-inflammatory',
            color: '#dc2626',
            bgColor: '#fef2f2',
            description: isEs
              ? 'Severo desbalance inflamatorio celular con rigidez de membrana y baja protección cardiovascular.'
              : 'Severe cellular fatty acid imbalance, high eicosanoid inflammation, and elevated cardiovascular risk profile.'
          },
          {
            label: isEs ? 'Rango Moderado' : 'Moderate Protection',
            value: '4% – 8% Index | Ratio 5:1 – 15:1',
            status: 'warning',
            badge: isEs ? 'Mejorable' : 'Intermediate',
            color: '#d97706',
            bgColor: '#fffbeb',
            description: isEs
              ? 'Nivel promedio occidental. Protección cardiovascular parcial; se beneficia de suplementación con EPA/DHA de alta biodisponibilidad.'
              : 'Typical Western baseline. Intermediate cardiovascular protection; highly responsive to high-purity EPA/DHA titration.'
          },
          {
            label: isEs ? 'Rango Óptimo de Protección' : 'Cardioprotective Zone',
            value: '> 8% Index | Ratio < 4:1',
            status: 'optimal',
            badge: isEs ? 'Cardioprotegido' : 'Cardioprotective',
            color: '#0d9488',
            bgColor: '#f0fdfa',
            description: isEs
              ? 'Máxima protección cardiovascular, fluidez de membrana celular óptima y resolución activa de procesos inflamatorios.'
              : 'Target longevity zone associated with lowest all-cause cardiovascular mortality and maximal anti-inflammatory resolution.'
          }
        ]
      };
    }

    // Default: Vitamin D
    return {
      name: isEs ? '25-Hidroxivitamina D [25(OH)D Total]' : 'Total 25-Hydroxyvitamin D [25(OH)D]',
      unit: 'ng/mL (nmol/L)',
      method: isEs ? 'Espectrometría de Masas en Tándem LC-MS/MS' : 'Liquid Chromatography Tandem Mass Spectrometry (LC-MS/MS)',
      lab: 'LifeLab1 (Vilnius, Lithuania)',
      lod: '5.0 ng/mL',
      range: '10.0 – 150.0 ng/mL',
      precision: 'RSD < 5.0%',
      ranges: [
        {
          label: isEs ? 'Deficiencia Severa' : 'Deficiency',
          value: '< 20 ng/mL (< 50 nmol/L)',
          status: 'critical',
          badge: isEs ? 'Deficiente' : 'Deficient',
          color: '#dc2626',
          bgColor: '#fef2f2',
          description: isEs
            ? 'Deficiencia clínica asociada a desmineralización ósea, mayor susceptibilidad a infecciones respiratorias y disfunción inmune.'
            : 'Clinical deficiency linked to bone demineralization, compromised innate immunity, and systemic musculoskeletal weakness.'
        },
        {
          label: isEs ? 'Insuficiencia' : 'Insufficiency',
          value: '20 – 30 ng/mL (50 – 75 nmol/L)',
          status: 'warning',
          badge: isEs ? 'Subóptimo' : 'Insufficient',
          color: '#d97706',
          bgColor: '#fffbeb',
          description: isEs
            ? 'Nivel insuficiente para la optimización metabólica e inmunológica. Muy frecuente durante los meses de baja insolación.'
            : 'Suboptimal for endocrine regulation and cellular immunity. Common baseline in temperate latitudes requiring supplementation.'
        },
        {
          label: isEs ? 'Suficiencia Clínica' : 'Clinical Sufficiency',
          value: '30 – 50 ng/mL (75 – 125 nmol/L)',
          status: 'optimal',
          badge: isEs ? 'Suficiente' : 'Sufficient',
          color: '#16a34a',
          bgColor: '#f0fdf4',
          description: isEs
            ? 'Concentración adecuada para homeostasis de calcio y mantenimiento del sistema musculoesquelético.'
            : 'Standard therapeutic target for calcium homeostasis and baseline endocrine sufficiency.'
        },
        {
          label: isEs ? 'Rango Óptimo de Longevidad' : 'Optimal Longevity & Immune',
          value: '50 – 70 ng/mL (125 – 175 nmol/L)',
          status: 'optimal',
          badge: isEs ? 'Óptimo' : 'Optimal',
          color: '#0d9488',
          bgColor: '#f0fdfa',
          description: isEs
            ? 'Nivel óptimo recomendado en medicina funcional y longevidad para máxima resistencia inmunitaria y regulación genómica.'
            : 'Target functional range for enhanced antimicrobial peptide induction, immune regulation, and longevity optimization.'
        }
      ]
    };
  })();

  const activeRange = biomarkerData.ranges[selectedRangeIndex] || biomarkerData.ranges[0];

  return (
    <div className="dts-wrapper">
      {/* ── SECTION HEADER ── */}
      <div className="pds-section-header">
        <div className="pds-section-header-left">
          <div className="pds-section-header-shield" style={{ background: 'rgba(13, 148, 136, 0.12)', color: '#0d9488' }}>
            <Activity size={22} />
          </div>
          <div className="pds-section-header-titles">
            <div className="pds-section-header-meta-row">
              <span className="pds-section-header-category">
                {isEs ? 'ESPECIFICACIONES ANALÍTICAS & BIOMARCADORES' : 'ANALYTICAL SPECIFICATIONS & BIOMARKERS'}
              </span>
              <span className="pds-section-badge" style={{ background: '#f0fdfa', color: '#0d9488', borderColor: '#ccfbf1' }}>
                <CheckCircle2 size={11} /> {isEs ? 'MÉTODO CERTIFICADO DBS' : 'CERTIFIED DBS METHOD'}
              </span>
            </div>
            <h3 className="pds-section-header-title">
              {isEs 
                ? 'Monografía Analítica y Cuantificación de Biomarcadores' 
                : 'Analytical Monograph & Biomarker Quantification Protocol'}
            </h3>
          </div>
        </div>

        <div className="pds-section-header-right">
          <div className="pds-section-cert-badge" style={{ borderColor: '#0d9488' }}>
            <Award size={14} color="#0d9488" />
            <span style={{ color: '#0d9488', fontWeight: 700 }}>CE-IVDR (EU 2017/746)</span>
          </div>
        </div>
      </div>

      <div className="dts-body">
        {/* ── 1. ANALYTICAL METRICS GRID ── */}
        <div className="dts-metrics-grid">
          <div className="dts-metric-card">
            <span className="dts-metric-label">{isEs ? 'Método Analítico' : 'Analytical Method'}</span>
            <strong className="dts-metric-value">{biomarkerData.method}</strong>
            <span className="dts-metric-sub">{isEs ? 'Alta especificidad cuantitativa' : 'High quantitative specificity'}</span>
          </div>

          <div className="dts-metric-card">
            <span className="dts-metric-label">{isEs ? 'Tipo de Muestra' : 'Sample Format'}</span>
            <strong className="dts-metric-value">Dried Blood Spot (DBS)</strong>
            <span className="dts-metric-sub">{isEs ? 'Punción capilar en dedo (2–3 gotas)' : 'Finger-prick capillary blood (2–3 drops)'}</span>
          </div>

          <div className="dts-metric-card">
            <span className="dts-metric-label">{isEs ? 'Precisión / Repetibilidad' : 'Analytical Precision'}</span>
            <strong className="dts-metric-value">{biomarkerData.precision}</strong>
            <span className="dts-metric-sub">{isEs ? 'Coeficiente de variación validado' : 'Validated coefficient of variation'}</span>
          </div>

          <div className="dts-metric-card">
            <span className="dts-metric-label">{isEs ? 'Límite de Detección & Rango' : 'Sensitivity & Range'}</span>
            <strong className="dts-metric-value">{biomarkerData.range}</strong>
            <span className="dts-metric-sub">LoD: {biomarkerData.lod}</span>
          </div>

          <div className="dts-metric-card">
            <span className="dts-metric-label">{isEs ? 'Estabilidad de Muestra' : 'Sample Stability'}</span>
            <strong className="dts-metric-value">15 – 25 °C (Ambiente)</strong>
            <span className="dts-metric-sub">{isEs ? 'Bolsa desecante hermética (sin frío)' : 'Hermetic desiccant pack (no cold chain)'}</span>
          </div>

          <div className="dts-metric-card">
            <span className="dts-metric-label">{isEs ? 'Laboratorio Analítico' : 'Testing Laboratory'}</span>
            <strong className="dts-metric-value">LifeLab1 (Vilnius, EU)</strong>
            <span className="dts-metric-sub">{isEs ? 'Alineado con norma ISO 15189' : 'ISO 15189 standard alignment'}</span>
          </div>
        </div>

        {/* ── 2. INTERACTIVE BIOMARKER CLINICAL RANGE SIMULATOR ── */}
        <div className="dts-simulator-card">
          <div className="dts-simulator-header">
            <div>
              <span className="dts-simulator-kicker">
                {isEs ? 'SIMULADOR CLÍNICO DE REFERENCIA' : 'CLINICAL REFERENCE SIMULATOR'}
              </span>
              <h4 className="dts-simulator-title">
                {biomarkerData.name} ({biomarkerData.unit})
              </h4>
            </div>
            <span className="dts-interactive-hint">
              <Sparkles size={13} /> {isEs ? 'Haz clic en un rango para explorar' : 'Click a tier to inspect clinical impact'}
            </span>
          </div>

          {/* Range selection buttons */}
          <div className="dts-range-selector">
            {biomarkerData.ranges.map((rng, idx) => {
              const isSelected = selectedRangeIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedRangeIndex(idx)}
                  className={`dts-range-btn ${isSelected ? 'active' : ''}`}
                  style={{
                    borderColor: isSelected ? rng.color : '#e2e8f0',
                    backgroundColor: isSelected ? rng.bgColor : '#ffffff',
                    color: isSelected ? rng.color : 'var(--text-main, #1e293b)'
                  }}
                >
                  <span className="dts-range-btn-value">{rng.value}</span>
                  <span className="dts-range-btn-label">{rng.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Range Detail Panel */}
          <div className="dts-range-detail" style={{ borderColor: activeRange.color, backgroundColor: activeRange.bgColor }}>
            <div className="dts-range-detail-top">
              <span className="dts-range-status-badge" style={{ backgroundColor: activeRange.color, color: '#ffffff' }}>
                {activeRange.badge}
              </span>
              <strong className="dts-range-value-large" style={{ color: activeRange.color }}>
                {activeRange.value}
              </strong>
            </div>
            <p className="dts-range-desc">
              {activeRange.description}
            </p>
          </div>
        </div>

        {/* ── 3. AT-HOME 3-STEP DBS COLLECTION PROTOCOL ── */}
        <div className="dts-protocol-card">
          <h4 className="dts-protocol-title">
            <Droplets size={18} color="#0d9488" />
            {isEs ? 'Protocolo de Toma de Muestra en 3 Pasos (DBS)' : 'At-Home 3-Step Capillary Blood Spot Collection'}
          </h4>

          <div className="dts-steps-grid">
            <div className="dts-step">
              <div className="dts-step-num">1</div>
              <strong className="dts-step-title">{isEs ? 'Preparación' : 'Preparation'}</strong>
              <p className="dts-step-desc">
                {isEs 
                  ? 'Lava tus manos con agua tibia para activar la circulación sanguínea. Desinfecta la yema del dedo con la toallita con alcohol 70% suministrada y deja secar.'
                  : 'Wash hands with warm water to promote capillary blood flow. Clean the chosen fingertip with the provided 70% IPA alcohol wipe and allow to air dry.'}
              </p>
            </div>

            <div className="dts-step">
              <div className="dts-step-num">2</div>
              <strong className="dts-step-title">{isEs ? 'Punción y Recolección' : 'Prick & Collect'}</strong>
              <p className="dts-step-desc">
                {isEs
                  ? 'Presiona la lanceta de seguridad estéril en el lateral de la yema. Deja caer 2 a 3 gotas de sangre de forma natural hasta cubrir los círculos marcados en la tarjeta de filtro.'
                  : 'Place the retractable safety lancet against the side of the fingertip. Allow 2–3 large hanging blood drops to fill the printed circles on the certified filter card.'}
              </p>
            </div>

            <div className="dts-step">
              <div className="dts-step-num">3</div>
              <strong className="dts-step-title">{isEs ? 'Secado y Envío' : 'Dry & Dispatch'}</strong>
              <p className="dts-step-desc">
                {isEs
                  ? 'Deja secar la tarjeta 15 minutos al aire a temperatura ambiente. Introduce en la bolsa sellable con desecante y deposita en el sobre con franqueo pagado hacia LifeLab1.'
                  : 'Allow card to air-dry for 15 minutes at room temperature. Insert into the foil pouch with desiccant pack and mail in the prepaid envelope to LifeLab1.'}
              </p>
            </div>
          </div>
        </div>

        {/* ── 4. WHAT'S IN THE BOX CHECKLIST ── */}
        <div className="dts-contents-card">
          <h5 className="dts-contents-title">
            <Layers size={16} color="#003666" />
            {isEs ? 'Contenido del Kit de Diagnóstico' : 'Diagnostic Kit Included Accessories'}
          </h5>
          <div className="dts-contents-grid">
            <div className="dts-content-item">
              <Check size={14} color="#0d9488" />
              <span>{isEs ? '1x Tarjeta de colección DBS certificada con desecante' : '1x Certified Dried Blood Spot (DBS) collection card'}</span>
            </div>
            <div className="dts-content-item">
              <Check size={14} color="#0d9488" />
              <span>{isEs ? '2x Lancetas retráctiles de seguridad (punción indolora)' : '2x Single-use sterile retractable safety lancets'}</span>
            </div>
            <div className="dts-content-item">
              <Check size={14} color="#0d9488" />
              <span>{isEs ? '2x Toallitas desinfectantes con alcohol isopropílico 70%' : '2x 70% Isopropyl alcohol antiseptic prep pads'}</span>
            </div>
            <div className="dts-content-item">
              <Check size={14} color="#0d9488" />
              <span>{isEs ? '1x Apósitos adhesivos y gasa estéril de contención' : '1x Adhesive bandage & sterile cotton gauze pad'}</span>
            </div>
            <div className="dts-content-item">
              <Check size={14} color="#0d9488" />
              <span>{isEs ? '1x Sobre hermético de transporte con franqueo pagado' : '1x Prepaid laboratory return mailer to LifeLab1'}</span>
            </div>
            <div className="dts-content-item">
              <Check size={14} color="#0d9488" />
              <span>{isEs ? '1x Guía visual de instrucciones paso a paso' : '1x Step-by-step illustrated patient instructions'}</span>
            </div>
          </div>
        </div>

        {/* ── 5. ACCREDITATION & COMMERCIAL INQUIRY FOOTER ── */}
        <div className="dts-footer-banner">
          <div className="dts-footer-text">
            <strong className="dts-footer-headline">
              <Building2 size={16} color="#0d9488" />
              LifeLab1 Clinical Laboratory — Vilnius, Lithuania
            </strong>
            <p className="dts-footer-sub">
              {isEs 
                ? 'Laboratorio clínico homologado bajo regulación europea CE-IVDR (EU 2017/746). Informes cuantitativos generados en 3–5 días laborables mediante portal digital encriptado.'
                : 'Licensed European central laboratory compliant with CE-IVDR (EU 2017/746). Turnaround time 3–5 business days with secure digital portal delivery.'}
            </p>
          </div>

          <div className="dts-footer-badges">
            <span className="dts-accreditation-tag">ISO 15189 Compliant</span>
            <span className="dts-accreditation-tag">CE-IVDR In Vitro Diagnostic</span>
            <span className="dts-accreditation-tag">Room Temp Stable (15–25°C)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
