"use client";

import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Droplets, 
  CheckCircle2, 
  ArrowRight, 
  Lock,
  Activity,
  FileText,
  Download,
  Calendar,
  Layers,
  Zap,
  Clock
} from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';
import DocumentPreviewModal from '@/components/ui/DocumentPreviewModal';

/**
 * BloodoDiagnosticOverviewCard
 * ─────────────────────────────────────────────────────────────────────────────
 * Section 1: "What It Is & Why Measure It" (1. ¿Qué es y Para Qué Sirve?)
 * Focused clinical overview of the diagnostic analyte, its cellular mechanism,
 * biological role in mitochondrial health and DNA repair, and why intracellular
 * capillary DBS testing provides superior diagnostic value.
 */
export default function BloodoDiagnosticOverviewCard({
  product = {},
  lang = 'en',
  onUnlockRequest = null,
  onSelectSection = null
}) {
  const isEs = lang === 'es';
  const slug = (product?.slug || product?.id || '').toLowerCase();
  const isNad = slug.includes('nad');
  const isTestosterone = slug.includes('testosterone') || slug.includes('testosterona');
  const isCortisol = slug.includes('cortisol');
  const isHba1c = slug.includes('hba1c') || slug.includes('hemoglobin') || slug.includes('glucose');
  const isOmega = slug.includes('omega') || slug.includes('lipid');
  const isVitD = slug.includes('vitamin') || slug.includes('vitd');

  // Resolve official sample report and catalog PDF
  let reportPdf = '/docs/bloodo-report-nad.pdf';
  let catalogPdf = '/docs/bloodo-product-catalog-2026.pdf';
  let testName = 'NAD+ Intracellular';

  if (isTestosterone) {
    reportPdf = '/docs/bloodo-report-testosterone-male.pdf';
    testName = 'Testosterone+';
  } else if (isCortisol) {
    reportPdf = '/docs/bloodo-report-cortisol-am-pm.pdf';
    testName = 'Cortisol CAR & PM';
  } else if (isHba1c) {
    reportPdf = '/docs/bloodo-report-hba1c.pdf';
    testName = 'HbA1c & Mean Glucose';
  } else if (isOmega) {
    reportPdf = '/docs/bloodo-report-omega-ratio.pdf';
    testName = 'Omega-3/6 Ratio';
  } else if (isVitD) {
    reportPdf = '/docs/bloodo-report-vitamin-d.pdf';
    testName = 'Vitamin D3 (25-OH)';
  } else if (slug.includes('htma') || slug.includes('mineralograma')) {
    reportPdf = '/docs/teletest-report-htma.pdf';
    catalogPdf = '/docs/teletest-report-htma.pdf';
    testName = 'HTMA Mineralogram';
  }

  const [previewDoc, setPreviewDoc] = useState(null);

  return (
    <div 
      id="overview"
      style={{
        marginTop: '1.25rem',
        marginBottom: '1.75rem',
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '1.5rem',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
        position: 'relative'
      }}
    >
      {/* ── Section Tag & Accreditations ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
        <div>
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: '#0d9488',
            background: '#f0fdfa',
            border: '1px solid #99f6e4',
            padding: '2px 8px',
            borderRadius: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            marginBottom: '6px'
          }}>
            <Sparkles size={12} /> {isEs ? 'SECCIÓN 1 · ¿QUÉ ES Y PARA QUÉ SIRVE?' : 'SECTION 1 · WHAT IT IS & WHY MEASURE IT'}
          </span>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#0f172a',
            margin: '2px 0 4px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Sparkles size={22} color="#0d9488" />
            {isNad 
              ? (isEs ? '1. ¿Qué es el NAD+ y por qué puede ser interesante medirlo?' : '1. What is NAD+ and Why Is It Valuable to Measure It?')
              : (isEs ? `1. ¿Qué es el test de ${testName} y para qué sirve?` : `1. What is the ${testName} Test and Why Measure It?`)}
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
            {isEs 
              ? 'Fundamentos moleculares, rol biológico celular y justificación diagnóstica de la cuantificación intracelular.'
              : 'Molecular foundations, cellular biological mechanisms, and clinical rationale for intracellular quantification.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: '#15803d',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            padding: '4px 10px',
            borderRadius: '6px'
          }}>
            CE-IVDR · ISO 15189
          </span>
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
            Whatman® 903 DBS
          </span>
        </div>
      </div>

      {/* ── Core Molecular & Biological Explanation ── */}
      <div style={{ marginBottom: '1.25rem' }}>
        <p style={{
          fontSize: '0.88rem',
          lineHeight: '1.65',
          color: '#334155',
          margin: '0 0 0.85rem 0'
        }}>
          {isNad ? (
            isEs ? (
              'El NAD+ (nicotinamida adenina dinucleótido) es una molécula que está presente en prácticamente todas las células de nuestro organismo y que desempeña un papel fundamental en la producción de energía celular (ATP), la reparación del ADN y el funcionamiento metabólico. Podríamos decir que es uno de los elementos principales que ayudan a nuestras células a funcionar correctamente. Con la edad, los niveles de NAD+ tienden a disminuir de forma progresiva en determinados tejidos, aunque el ritmo varía notablemente entre personas.'
            ) : (
              'NAD+ (Nicotinamide Adenine Dinucleotide) is a critical coenzyme present in virtually every cell of our body. It plays a fundamental role in mitochondrial cellular energy production (ATP), genomic DNA repair (PARP1 enzymes), and sirtuin-mediated longevity pathways (SIRT1/SIRT3). As we age, intracellular NAD+ levels decline significantly across tissues—often dropping by over 50% between age 40 and 60—directly impacting cellular recovery, mitochondrial resilience, and metabolic vitality.'
            )
          ) : isTestosterone ? (
            isEs ? (
              'Panel endocrino cuantitativo para medir la testosterona total y libre, globulina fijadora de hormonas sexuales (SHBG) y el índice de andrógenos libres (FAI). Esencial para evaluar la función del eje hipotálamo-hipofisario-gonadal (HPTA), vitalidad masculina, rendimiento físico y masa magra.'
            ) : (
              'Comprehensive quantitative endocrine panel measuring Total & Free Testosterone, Sex Hormone-Binding Globulin (SHBG), and the Free Androgen Index (FAI). Essential for assessing HPTA axis balance, male vitality, muscle preservation, and hormonal homeostasis.'
            )
          ) : isCortisol ? (
            isEs ? (
              'Ensayo clínico para cuantificar la curva diurna de cortisol (Respuesta al Despertar - CAR y nivel vespertino PM). Permite evaluar con precisión la función del eje HPA (hipotálamo-hipofisario-adrenal), el ritmo circadiano del estrés y la recuperación del sueño.'
            ) : (
              'Quantitative clinical assay evaluating the diurnal cortisol curve (Cortisol Awakening Response - CAR & evening PM levels). Accurately maps hypothalamic-pituitary-adrenal (HPA) axis balance, chronic stress dynamics, and circadian recovery.'
            )
          ) : isHba1c ? (
            isEs ? (
              'Cuantificación de hemoglobina glicada (HbA1c) y glucosa media estimada (eAG). Proporciona un registro acumulativo del control glucémico durante los últimos 90–120 días, clave para la longevidad metabólica y la prevención de complicaciones microvasculares.'
            ) : (
              'Quantitative determination of Glycated Hemoglobin (HbA1c) and Estimated Average Glucose (eAG). Provides an objective 90–120 day cumulative record of glycemic control, essential for metabolic longevity and insulin sensitivity optimization.'
            )
          ) : isOmega ? (
            isEs ? (
              'Evaluación del índice Omega-3, ratio ácido araquidónico / ácido eicosapentaenoico (AA:EPA) y perfil de ácidos grasos en membrana eritrocitaria. Marcador clave de inflamación sistémica celular y salud cardiovascular.'
            ) : (
              'Measures the Omega-3 Index, Arachidonic Acid to Eicosapentaenoic Acid (AA:EPA) ratio, and erythrocyte membrane fatty acid profile. Key clinical indicator of low-grade systemic neuroinflammation and cardiovascular health.'
            )
          ) : isVitD ? (
            isEs ? (
              'Determinación cuantitativa de 25-hidroxivitamina D [25(OH)D] en sangre total. Hormona esteroidea esencial para la transcripción genómica, regulación inmunológica, densidad mineral ósea y modulación inflamatoria.'
            ) : (
              'Quantitative determination of total 25-hydroxyvitamin D [25(OH)D]. A critical secosteroid hormone governing genomic transcription, innate immunity, bone mineralization, and longevity modulation.'
            )
          ) : (
            isEs ? (
              'Dispositivo de diagnóstico in vitro con marcado CE-IVDR para la cuantificación precisa de biomarcadores metabólicos y endocrinos mediante tarjeta de sangre seca DBS en laboratorio clínico central acreditado (LifeLab1, ISO 15189).'
            ) : (
              'CE-IVDR in vitro diagnostic device for the quantitative measurement of key metabolic and endocrine biomarkers via capillary dried blood spot (DBS) processed at an accredited European central laboratory (LifeLab1, ISO 15189).'
            )
          )}
        </p>

        {/* Why Intracellular Blood Spot Testing Matters */}
        <div style={{
          background: '#f8fafc',
          borderLeft: '3px solid #0d9488',
          padding: '0.75rem 1rem',
          borderRadius: '0 8px 8px 0',
          fontSize: '0.78rem',
          color: '#334155',
          lineHeight: '1.5'
        }}>
          <strong>{isEs ? '¿Por qué medir a nivel intracelular (DBS)?' : 'Why Measure Intracellular Biomarkers via DBS?'}</strong>{' '}
          {isEs 
            ? 'A diferencia de las mediciones plasmáticas estándar que solo reflejan metabolitos circulantes transitorios, el análisis en sangre total DBS cuantifica las reservas funcionales intracelulares activas en eritrocitos y células nucleadas, aportando una lectura biológica mucho más precisa y reproducible.'
            : 'Unlike standard serum tests that only capture transient plasma circulating metabolites, whole-blood dried blood spot (DBS) testing quantifies active intracellular functional reserves inside erythrocytes and nucleated cells, providing a far more clinically representative and reproducible baseline.'}
        </div>
      </div>

      {/* ── Key Specimen & Analytical Highlights Grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '10px',
        marginBottom: '1.25rem'
      }}>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem' }}>
          <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '2px' }}>
            {isEs ? 'Compartimento Biológico' : 'Cellular Compartment'}
          </span>
          <strong style={{ fontSize: '0.82rem', color: '#0f172a' }}>
            {isEs ? 'Intracelular (Eritrocitos / Sangre Total)' : 'Intracellular (RBC & Whole Blood)'}
          </strong>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem' }}>
          <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '2px' }}>
            {isEs ? 'Tecnología Analítica' : 'Analytical Technology'}
          </span>
          <strong style={{ fontSize: '0.82rem', color: '#0f172a' }}>
            {isNad ? 'UHPLC Enzymatic Cycling' : 'Capillary DBS LC-MS/MS'}
          </strong>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem' }}>
          <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '2px' }}>
            {isEs ? 'Tiempo de Respuesta (TAT)' : 'Clinical Turnaround'}
          </span>
          <strong style={{ fontSize: '0.82rem', color: '#0d9488' }}>
            {isEs ? '48–72 horas (Informe Digital)' : '48–72h (Encrypted PDF Portal)'}
          </strong>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem' }}>
          <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '2px' }}>
            {isEs ? 'Laboratorio Central' : 'Central Laboratory'}
          </span>
          <strong style={{ fontSize: '0.82rem', color: '#0f172a' }}>
            LifeLab1 (Vilnius, EU · ISO 15189)
          </strong>
        </div>
      </div>

      {/* ── Action Buttons: Gated Pricing, Sample Report & Brochure Downloads ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', paddingTop: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('medium');
              if (onUnlockRequest) onUnlockRequest();
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#0d9488',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '7px 14px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(13, 148, 136, 0.25)',
              transition: 'background 0.15s ease'
            }}
          >
            <Lock size={13} />
            <span>{isEs ? 'Iniciar Sesión para Consultar Tarifas' : 'Sign In to View Clinical Pricing'}</span>
          </button>

          {/* 1. Official Sample Report PDF Preview */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setPreviewDoc({
                fileUrl: reportPdf,
                downloadName: reportPdf.split('/').pop() || 'bloodo-report-sample.pdf',
                title: isEs ? 'Informe Clínico Muestra (PDF)' : 'Sample Clinical Report (PDF)',
                subtitle: isEs
                  ? `Bloodo Diagnostics • Simulación de Informe Clínico Real (${testName})`
                  : `Bloodo Diagnostics • Official Specimen Report Simulation (${testName})`
              });
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: '#f0fdfa',
              color: '#0d9488',
              border: '1px solid #99f6e4',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title={isEs ? 'Ver vista previa del informe clínico de muestra real en PDF' : 'Preview official sample clinical report in PDF'}
          >
            <FileText size={13} />
            <span>{isEs ? 'Informe Clínico Muestra (PDF)' : 'Sample Clinical Report (PDF)'}</span>
          </button>

          {/* 2. Direct Sample Collection Instructions (IFU) Preview */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setPreviewDoc({
                fileUrl: '/docs/bloodo-nad-ifu.pdf',
                downloadName: 'Bloodo_NAD_IFU.pdf',
                title: isEs ? 'Instrucciones de Toma de Muestra (PDF)' : 'Collection Guide (PDF)',
                subtitle: isEs
                  ? 'Guía oficial paso a paso para la recolección de muestra capilar de sangre (IFU)'
                  : 'Official Step-by-Step Blood Sample Collection Instructions (IFU)'
              });
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: '#f0fdfa',
              color: '#0d9488',
              border: '1px solid #99f6e4',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title={isEs ? 'Ver vista previa de instrucciones de muestreo (IFU PDF)' : 'Preview official sample collection instructions (IFU PDF)'}
          >
            <Download size={13} />
            <span>{isEs ? 'Instrucciones Muestreo (PDF)' : 'Collection Guide (PDF)'}</span>
          </button>

          {/* 3. Direct Catalog PDF Preview */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setPreviewDoc({
                fileUrl: catalogPdf,
                downloadName: catalogPdf.split('/').pop() || 'bloodo-product-catalog-2026.pdf',
                title: isEs ? 'Catálogo 2026 (PDF)' : 'Brochure / Catalog (PDF)',
                subtitle: isEs
                  ? 'Catálogo Diagnóstico Bloodo 2026 • Portafolio Clínico Completo'
                  : 'Bloodo 2026 Diagnostic Catalog • Complete Clinical Test Portfolio'
              });
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: '#ffffff',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title={isEs ? 'Ver vista previa del catálogo Bloodo 2026' : 'Preview complete 2026 Bloodo catalog'}
          >
            <Download size={13} />
            <span>{isEs ? 'Catálogo 2026 (PDF)' : 'Brochure / Catalog'}</span>
          </button>
        </div>

        {onSelectSection && (
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onSelectSection('when-to-test');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: 'transparent',
              color: '#003666',
              border: 'none',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              padding: '4px 8px'
            }}
          >
            <span>{isEs ? 'Siguiente: 2. ¿Cuándo Hacerse el Test?' : 'Next: 2. When to Take This Test'}</span>
            <ArrowRight size={13} />
          </button>
        )}
      </div>

      {/* Interactive Document Preview Modal with Download & Print (GCP Standards) */}
      <DocumentPreviewModal
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        fileUrl={previewDoc?.fileUrl}
        downloadUrl={previewDoc?.fileUrl}
        downloadName={previewDoc?.downloadName}
        title={previewDoc?.title || 'Document Preview'}
        subtitle={previewDoc?.subtitle}
        printable={true}
      />
    </div>
  );
}
