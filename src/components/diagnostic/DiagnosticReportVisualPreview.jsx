"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Microscope,
  Droplets,
  FileText,
  ShieldCheck,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Zap,
  Activity,
  HeartPulse,
  Check,
  Copy
} from '@/lib/icons';
import CopyableId from '../ui/CopyableId';

export default function DiagnosticReportVisualPreview({
  activeTest = 'nad',
  lang = 'en',
  onSelectTest = null,
  hideSelector = false,
  hideWorkflow = false,
  variant = 'gcp' // 'gcp' | 'dark'
}) {
  const isEs = lang === 'es';

  // Sample data simulating real laboratory output for each test panel
  const SAMPLE_REPORTS = {
    nad: {
      title: isEs ? 'NAD+ Intracelular Cuantitativo' : 'Intracellular NAD+ Pool Test',
      sampleId: 'LAB-2610-NAD-849',
      method: 'UHPLC-MS/MS Tandem Mass Spectrometry',
      biomarker: 'NAD+ (Nicotinamide Adenine Dinucleotide)',
      value: '34.2',
      unit: 'µM',
      zone: isEs ? 'Rango Óptimo de Longevidad' : 'Optimal Longevity Range',
      zoneColor: '#10b981',
      percentage: 72, // marker position 0-100%
      refMin: '15 µM',
      refOptimal: '30 – 50 µM',
      refMax: '65 µM',
      interpretation: isEs 
        ? 'Actividad mitocondrial robusta y alta disponibilidad de coenzima para sirtuinas (SIRT1/SIRT3) y enzimas de reparación del ADN (PARP1).' 
        : 'High cellular bioenergetic reserve supporting sirtuin deacetylation (SIRT1/SIRT3) and genomic DNA repair mechanisms (PARP1).',
      recommendation: isEs
        ? 'Sinergia recomendada: Precursores NMN/NR + Péptido Epithalon para estabilidad telomérica.'
        : 'Synergistic Protocol: NMN cellular precursors + Epithalon peptide for telomeric stabilization.',
      liveReportCode: '261006004'
    },
    cortisol: {
      title: isEs ? 'Cortisol Ritmo Diurno CAR' : 'Diurnal Cortisol & CAR Rhythm Test',
      sampleId: 'LAB-2610-CORT-312',
      method: 'LC-MS/MS High-Resolution Chromatographic Immunoassay',
      biomarker: 'Cortisol (Awakening CAR Response)',
      value: '18.4',
      unit: 'µg/dL',
      zone: isEs ? 'Ritmo Circadiano Balanceado' : 'Balanced Circadian Rhythm',
      zoneColor: '#10b981',
      percentage: 64,
      refMin: '4.0 µg/dL',
      refOptimal: '12.0 – 22.0 µg/dL',
      refMax: '28.0 µg/dL',
      interpretation: isEs
        ? 'Eje Hipotálamo-Hipofisario-Adrenal (HPA) con respuesta matutina normal sin fatiga adrenal ni elevación nocturna alostática.'
        : 'Physiologically intact Hypothalamic-Pituitary-Adrenal (HPA) axis awakening response with no subclinical adrenal exhaustion.',
      recommendation: isEs
        ? 'Sinergia recomendada: UltraPerson Stress Ashwagandha + Péptido Selank/Semax para neuromodulación.'
        : 'Synergistic Protocol: Ashwagandha adaptogen matrix + Selank peptide for neuro-adrenal modulation.',
      liveReportCode: '261006004'
    },
    testosterone: {
      title: isEs ? 'Testosterona Total y Libre (Perfil FAI)' : 'Testosterone Total & Free (FAI Profile)',
      sampleId: 'LAB-2610-TEST-190',
      method: 'Direct Isotope Dilution LC-MS/MS & SHBG Equilibrium',
      biomarker: 'Free Testosterone (Direct Equilibrium)',
      value: '14.8',
      unit: 'pg/mL',
      zone: isEs ? 'Rango Óptimo Fisiológico' : 'Optimal Physiological Range',
      zoneColor: '#10b981',
      percentage: 68,
      refMin: '5.0 pg/mL',
      refOptimal: '12.0 – 25.0 pg/mL',
      refMax: '32.0 pg/mL',
      interpretation: isEs
        ? 'Fracción libre biodisponible equilibrada con SHBG dentro de límites fisiológicos para síntesis proteica muscular y vitalidad androgénica.'
        : 'Optimal bioavailable free fraction for androgen receptor activation, lean muscle anabolism, and metabolic homeostasis.',
      recommendation: isEs
        ? 'Sinergia recomendada: Protocolo Gonadorelin / Kisspeptin-10 para soporte endógeno pulsátil.'
        : 'Synergistic Protocol: Kisspeptin-10 secretagogue therapy for endogenous axis preservation.',
      liveReportCode: '261006004'
    },
    hba1c: {
      title: isEs ? 'HbA1c y Glucosa Media 90 Días' : 'HbA1c & 90-Day Glycation Index',
      sampleId: 'LAB-2610-HBA1C-504',
      method: 'Boronate Affinity HPLC European Standardization (IFCC / NGSP)',
      biomarker: 'Glycated Hemoglobin (HbA1c)',
      value: '5.1',
      unit: '%',
      zone: isEs ? 'Glucorregulación Óptima' : 'Optimal Glycoregulation',
      zoneColor: '#10b981',
      percentage: 38,
      refMin: '4.2 %',
      refOptimal: '4.8 – 5.4 %',
      refMax: '5.7 %',
      interpretation: isEs
        ? 'Glucosa media estimada de 100 mg/dL en eritrocitos. Ausencia de resistencia a la insulina ni formación acelerada de AGEs.'
        : 'Mean estimated blood glucose of 100 mg/dL over 90 days. Minimal advanced glycation end-products (AGEs) accumulation.',
      recommendation: isEs
        ? 'Sinergia recomendada: Tirzepatide / Retatrutide en microdosis metabólica + Berberina liposomal.'
        : 'Synergistic Protocol: Low-dose GLP-1/GIP receptor agonist + Berberine cofactor for metabolic sensitivity.',
      liveReportCode: '261006004'
    },
    omega: {
      title: isEs ? 'Ratio Omega-3 / Omega-6 & Índice AA/EPA' : 'Omega-3 Index & Cellular Membrane Fluidity',
      sampleId: 'LAB-2610-OMG-722',
      method: 'Capillary Gas Chromatography (GC-FID) Membrane Lipidomics',
      biomarker: 'Omega-3 Erythrocyte Index (EPA + DHA)',
      value: '8.4',
      unit: '%',
      zone: isEs ? 'Bajo Riesgo Cardiovascular' : 'Low Cardiovascular Risk (>8%)',
      zoneColor: '#10b981',
      percentage: 82,
      refMin: '3.0 %',
      refOptimal: '8.0 – 11.0 %',
      refMax: '14.0 %',
      interpretation: isEs
        ? 'Fuerte incorporación de EPA y DHA en membranas eritrocitarias con resolución activa de la inflamación silenciosa.'
        : 'High membrane phospholipid fluidity with optimal SPM (Specialized Pro-resolving Mediators) generation.',
      recommendation: isEs
        ? 'Sinergia recomendada: BPC-157 para integridad del endotelio microvascular y modulación citoquímica.'
        : 'Synergistic Protocol: BPC-157 for systemic endothelial cytoprotection.',
      liveReportCode: '261006004'
    },
    vitd: {
      title: isEs ? 'Vitamina D3 Total (25-OH)' : 'Vitamin D3 Total (25-OH) Immuno-Profile',
      sampleId: 'LAB-2610-VITD-611',
      method: 'Chemiluminescent Microparticle Immunoassay (CMIA)',
      biomarker: '25-Hydroxyvitamin D3',
      value: '58.6',
      unit: 'ng/mL',
      zone: isEs ? 'Suficiencia Inmunológica Óptima' : 'Optimal Immune Sufficiency',
      zoneColor: '#10b981',
      percentage: 60,
      refMin: '20 ng/mL',
      refOptimal: '50 – 80 ng/mL',
      refMax: '100 ng/mL',
      interpretation: isEs
        ? 'Concentración ideal para activación génica del receptor VDR, expresión de péptidos antimicrobianos (catelicidina) y mineralización ósea.'
        : 'Sufficient circulating 25(OH)D for nuclear VDR receptor transactivation and antimicrobial peptide synthesis.',
      recommendation: isEs
        ? 'Sinergia recomendada: Vitamina K2 (MK-7) + Magnesio bisglicinato + Péptido Thymosin Alpha-1.'
        : 'Synergistic Protocol: Vitamin K2 (MK-7) co-administration + Thymosin Alpha-1 for immune synergy.',
      liveReportCode: '261006004'
    }
  };

  const [selectedKey, setSelectedKey] = useState(activeTest || 'nad');
  
  React.useEffect(() => {
    if (activeTest) {
      setSelectedKey(activeTest);
    }
  }, [activeTest]);

  const report = SAMPLE_REPORTS[selectedKey] || SAMPLE_REPORTS.nad;

  const handleSelect = (key) => {
    setSelectedKey(key);
    if (onSelectTest) onSelectTest(key);
  };

  // Google Cloud UX Specimen Dossier Card
  const specimenCard = (
    <div style={{
      background: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      color: '#0f172a',
      boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(226, 232, 240, 0.7)',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      {/* GCP Console Top Header Strip */}
      <div style={{
        background: '#f8fafc',
        padding: '0.85rem 1.25rem',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 0 3px #dcfce7'
          }} />
          <span style={{
            fontSize: '0.74rem',
            fontWeight: 800,
            letterSpacing: '0.06em',
            color: '#475569',
            textTransform: 'uppercase'
          }}>
            {isEs ? 'DOSSIER OFICIAL DE MUESTRA CLÍNICA' : 'OFFICIAL CLINICAL SPECIMEN DOSSIER'}
          </span>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <CopyableId value={report.sampleId} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '4px',
            background: '#ecfdf5',
            color: '#047857',
            border: '1px solid #a7f3d0'
          }}>
            ISO 15189 Validated
          </span>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '4px',
            background: '#eff6ff',
            color: '#0369a1',
            border: '1px solid #bfdbfe'
          }}>
            CE-IVDR Certified
          </span>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 650,
            padding: '2px 8px',
            borderRadius: '4px',
            background: '#f1f5f9',
            color: '#334155',
            border: '1px solid #e2e8f0'
          }}>
            Capillary DBS LC-MS/MS
          </span>
        </div>
      </div>

      {/* GCP Card Body */}
      <div style={{ padding: '1.25rem 1.5rem' }}>
        {/* Test Name & Quantitative KPI Card */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
          alignItems: 'center',
          marginBottom: '1.25rem'
        }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
              {isEs ? 'Panel Diagnóstico Cuantitativo' : 'Quantitative Diagnostic Panel'}
            </span>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 850, color: '#0f172a', margin: '4px 0 6px 0', letterSpacing: '-0.01em' }}>
              {report.title}
            </h3>
            <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5 }}>
              {isEs ? 'Metodología analítica:' : 'Analytical Methodology:'}{' '}
              <strong style={{ color: '#1e293b' }}>{report.method}</strong>
            </div>
            <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
              {isEs ? 'Laboratorio Central:' : 'Central Laboratory:'}{' '}
              <strong style={{ color: '#0284c7' }}>LifeLab1 (Vilnius, EU · ISO 15189)</strong>
            </div>
          </div>

          {/* Big KPI Metric Box (Google Cloud Console Style) */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '0.9rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
          }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: 700, letterSpacing: '0.04em' }}>
                {isEs ? 'Resultado Cuantificado' : 'Quantified Result'}
              </span>
              <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#0284c7', lineHeight: 1.1, marginTop: '2px' }}>
                {report.value} <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748b' }}>{report.unit}</span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{
                display: 'inline-block',
                padding: '3px 10px',
                borderRadius: '999px',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#047857',
                fontSize: '0.76rem',
                fontWeight: 800
              }}>
                ● {report.zone}
              </span>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px', fontWeight: 500 }}>
                {isEs ? 'Rango Óptimo:' : 'Optimal Range:'} <strong>{report.refOptimal}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Range Bar (GCP Calibrated Meter) */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '1rem 1.25rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginBottom: '8px' }}>
            <span style={{ color: '#ef4444', fontWeight: 600 }}>{isEs ? 'Deficiente' : 'Deficient'} ({report.refMin})</span>
            <span style={{ color: '#059669', fontWeight: 700 }}>● {isEs ? 'Rango Óptimo de Salud' : 'Optimal Target Window'} ({report.refOptimal})</span>
            <span style={{ color: '#3b82f6', fontWeight: 600 }}>{isEs ? 'Elevado' : 'Elevated'} ({report.refMax})</span>
          </div>

          {/* Gradient Track */}
          <div style={{
            height: '12px',
            borderRadius: '6px',
            background: 'linear-gradient(90deg, #ef4444 0%, #f59e0b 22%, #10b981 48%, #10b981 74%, #3b82f6 100%)',
            position: 'relative',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
          }}>
            {/* Pin Indicator */}
            <div style={{
              position: 'absolute',
              left: `${report.percentage}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              background: '#ffffff',
              border: '3px solid #0284c7',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0284c7' }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748b', marginTop: '6px' }}>
            <span>0%</span>
            <span style={{ color: '#0284c7', fontWeight: 700 }}>
              {isEs ? 'Muestra del Paciente' : 'Patient Specimen'}: {report.value} {report.unit} ({isEs ? 'Dentro de Rango Óptimo' : 'Within Optimal Range'})
            </span>
            <span>100%</span>
          </div>
        </div>

        {/* Clinical Findings & Synergies (GCP Callouts) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #0284c7',
            borderRadius: '8px',
            padding: '0.85rem 1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0284c7', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
              <Activity size={14} />
              <span>{isEs ? 'Interpretación Médica del Laboratorio' : 'Laboratory Clinical Interpretation'}</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#334155', lineHeight: 1.5 }}>
              {report.interpretation}
            </p>
          </div>

          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #10b981',
            borderRadius: '8px',
            padding: '0.85rem 1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
              <Zap size={14} />
              <span>{isEs ? 'Recomendación Terapéutica y de Péptidos' : 'Therapeutic & Peptide Synergies'}</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#334155', lineHeight: 1.5 }}>
              {report.recommendation}
            </p>
          </div>
        </div>
      </div>

      {/* GCP Card Footer Strip */}
      <div style={{
        background: '#f8fafc',
        padding: '0.75rem 1.25rem',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        fontSize: '0.75rem',
        color: '#64748b'
      }}>
        <div>
          <span>{isEs ? 'Emitido por ' : 'Issued by '}</span>
          <strong style={{ color: '#1e293b' }}>LifeLab1 Central Diagnostic Laboratory (Vilnius, Lithuania)</strong>
          <span> · ISO 15189 Accredited</span>
        </div>

        <Link
          href={`/lab/${report.liveReportCode}`}
          style={{
            color: '#0284c7',
            fontWeight: 700,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.78rem'
          }}
        >
          <span>{isEs ? 'Explorar Informe Completo con Desbloqueo Médico' : 'Explore Complete Report with Physician Unlock'}</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );

  // If hideWorkflow is true, render the specimen card directly (for prominent placement in Overview)
  if (hideWorkflow) {
    return (
      <div>
        {/* Only show test selector if NOT hidden */}
        {!hideSelector && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
              {isEs ? 'Selecciona una prueba para visualizar su informe modelo:' : 'Select test panel to preview live report mockup:'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {[
                { id: 'nad', label: 'NAD+ Cellular' },
                { id: 'cortisol', label: 'Cortisol Ritmo CAR' },
                { id: 'testosterone', label: 'Testosterona Total & Libre' },
                { id: 'hba1c', label: 'HbA1c 90 Días' },
                { id: 'omega', label: 'Ratio Omega-3/6' },
                { id: 'vitd', label: 'Vitamina D3' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: selectedKey === item.id ? '#0284c7' : '#e2e8f0',
                    background: selectedKey === item.id ? 'rgba(2, 132, 199, 0.08)' : '#ffffff',
                    color: selectedKey === item.id ? '#0284c7' : '#475569',
                    fontSize: '0.8rem',
                    fontWeight: selectedKey === item.id ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
        {specimenCard}
      </div>
    );
  }

  // Full section with workflow (for BrandCollection or detailed workflow tabs)
  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #e2e8f0',
      padding: '2rem',
      boxShadow: '0 4px 20px -4px rgba(0,0,0,0.06)',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      {/* ── Section Title & High-Level Promise ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(2, 132, 199, 0.1)',
            color: '#0284c7',
            padding: '3px 10px',
            borderRadius: '12px',
            fontSize: '0.74rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: '6px'
          }}>
            <Sparkles size={12} />
            <span>{isEs ? 'Flujo de Diagnóstico Clínico' : 'Clinical Diagnostic Workflow'}</span>
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            {isEs ? 'Cómo Obtienes tus Resultados y tu Informe Clínico' : 'How You Receive Your Results & Clinical Diagnostic Report'}
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '4px 0 0 0' }}>
            {isEs 
              ? 'Trazabilidad completa: desde la micro-punción capilar indolora hasta la emisión del informe cuantitativo oficial por LifeLab1.' 
              : 'Complete specimen traceability: from painless finger-prick collection to official quantitative reporting by LifeLab1.'}
          </p>
        </div>

        <Link
          href={`/lab/${report.liveReportCode}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            color: '#0284c7',
            fontSize: '0.82rem',
            fontWeight: 700,
            textDecoration: 'none',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#e0f2fe'; e.currentTarget.style.borderColor = '#38bdf8'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
        >
          <span>{isEs ? 'Ver Informe Real Interactivo (#LAB-261006004)' : 'View Live Interactive Report (#LAB-261006004)'}</span>
          <ExternalLink size={14} />
        </Link>
      </div>

      {/* ── Visual 3-Step Graphic Flow ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        {/* Step 1 */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '1.25rem',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            fontSize: '0.72rem',
            fontWeight: 800,
            color: '#94a3b8',
            background: '#ffffff',
            padding: '2px 8px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0'
          }}>
            01
          </div>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'rgba(225, 29, 72, 0.1)',
            color: '#e11d48',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.75rem'
          }}>
            <Droplets size={22} />
          </div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
            {isEs ? '1. Toma de Muestra DBS' : '1. Painless DBS Sampling'}
          </h4>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
            {isEs 
              ? '4 micro-gotas de sangre capilar sobre tarjeta protectora Whatman® 903. 100% indoloro en casa o clínica.' 
              : '4 micro-drops of capillary blood on Whatman® 903 protein matrix card. Takes 5 minutes at home or office.'}
          </p>
        </div>

        {/* Step 2 */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '1.25rem',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            fontSize: '0.72rem',
            fontWeight: 800,
            color: '#94a3b8',
            background: '#ffffff',
            padding: '2px 8px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0'
          }}>
            02
          </div>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'rgba(2, 132, 199, 0.1)',
            color: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.75rem'
          }}>
            <Microscope size={22} />
          </div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
            {isEs ? '2. Análisis LC-MS/MS' : '2. Central Lab Analysis'}
          </h4>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
            {isEs 
              ? 'Procesamiento en LifeLab1 Vilnius (ISO 15189) mediante cromatografía líquida acoplada a espectrometría de masas.' 
              : 'Processed at LifeLab1 Vilnius (ISO 15189) via tandem mass spectrometry with strict intra-assay precision.'}
          </p>
        </div>

        {/* Step 3 */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '1.25rem',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            fontSize: '0.72rem',
            fontWeight: 800,
            color: '#94a3b8',
            background: '#ffffff',
            padding: '2px 8px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0'
          }}>
            03
          </div>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'rgba(22, 163, 74, 0.1)',
            color: '#16a34a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.75rem'
          }}>
            <FileText size={22} />
          </div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
            {isEs ? '3. Informe y Posología' : '3. Clinical Diagnostic Dossier'}
          </h4>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
            {isEs 
              ? 'Acceso en ~2 semanas (validación analítica dual y tránsito LifeLab1) a tus rangos cuantitativos, interpretación médica y sinergias con protocolos terapéuticos.' 
              : 'Direct portal delivery in ~2 weeks (dual analytical validation & LifeLab1 courier transit) with reference ranges, physician interpretation, and recommended protocols.'}
          </p>
        </div>
      </div>

      {/* ── Interactive Test Switcher Chips ── */}
      {!hideSelector && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
            {isEs ? 'Selecciona una prueba para visualizar su informe modelo:' : 'Select test panel to preview live report mockup:'}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {[
              { id: 'nad', label: 'NAD+ Cellular' },
              { id: 'cortisol', label: 'Cortisol Ritmo CAR' },
              { id: 'testosterone', label: 'Testosterona Total & Libre' },
              { id: 'hba1c', label: 'HbA1c 90 Días' },
              { id: 'omega', label: 'Ratio Omega-3/6' },
              { id: 'vitd', label: 'Vitamina D3' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: selectedKey === item.id ? '#0284c7' : '#e2e8f0',
                  background: selectedKey === item.id ? 'rgba(2, 132, 199, 0.08)' : '#ffffff',
                  color: selectedKey === item.id ? '#0284c7' : '#475569',
                  fontSize: '0.8rem',
                  fontWeight: selectedKey === item.id ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Google Cloud UX Specimen Dossier Card */}
      {specimenCard}
    </div>
  );
}
