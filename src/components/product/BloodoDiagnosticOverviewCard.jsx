"use client";

import React from 'react';
import { 
  Sparkles, 
  Flame, 
  ShieldCheck, 
  Droplets, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Lock,
  Activity,
  HeartPulse,
  Zap,
  FileText,
  Download,
  Info,
  Calendar,
  BatteryCharging
} from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';

export default function BloodoDiagnosticOverviewCard({
  product = {},
  lang = 'en',
  onUnlockRequest = null,
  onSelectSection = null
}) {
  const isEs = lang === 'es';
  const slug = (product?.slug || product?.id || '').toLowerCase();
  const isNad = slug.includes('nad');

  // Resolve official sample report and catalog PDF
  let reportPdf = '/docs/bloodo-report-nad.pdf';
  let catalogPdf = '/docs/bloodo-product-catalog-2026.pdf';
  let testName = 'NAD+ Intracellular';

  if (slug.includes('testosterone') || slug.includes('testosterona')) {
    reportPdf = '/docs/bloodo-report-testosterone-male.pdf';
    testName = 'Testosterone+';
  } else if (slug.includes('cortisol')) {
    reportPdf = '/docs/bloodo-report-cortisol-am-pm.pdf';
    testName = 'Cortisol CAR & PM';
  } else if (slug.includes('hba1c') || slug.includes('hemoglobin') || slug.includes('glucose')) {
    reportPdf = '/docs/bloodo-report-hba1c.pdf';
    testName = 'HbA1c & Mean Glucose';
  } else if (slug.includes('omega')) {
    reportPdf = '/docs/bloodo-report-omega-ratio.pdf';
    testName = 'Omega-3/6 Ratio';
  } else if (slug.includes('vitamin') || slug.includes('vitd')) {
    reportPdf = '/docs/bloodo-report-vitamin-d.pdf';
    testName = 'Vitamin D3 (25-OH)';
  } else if (slug.includes('htma') || slug.includes('mineralograma')) {
    reportPdf = '/docs/teletest-report-htma.pdf';
    catalogPdf = '/docs/teletest-report-htma.pdf';
    testName = 'HTMA Mineralogram';
  }

  return (
    <div style={{
      marginTop: '1.25rem',
      marginBottom: '1.75rem',
      background: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      padding: '1.25rem',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      position: 'relative'
    }}>
      {/* ── 1. Top Badges & Category Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#0d9488',
            background: '#f0fdfa',
            border: '1px solid #99f6e4',
            padding: '2px 8px',
            borderRadius: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Activity size={12} /> {isEs ? 'Diagnóstico Clínico Avanzado' : 'Advanced Clinical Diagnostics'}
          </span>
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            color: '#15803d',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            padding: '2px 8px',
            borderRadius: '4px'
          }}>
            CE-IVDR · ISO 15189
          </span>
        </div>

        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
          {isEs ? 'Muestra Capilar DBS (Whatman® 903)' : 'Capillary DBS Specimen (Whatman® 903)'}
        </span>
      </div>

      {/* ── 2. What is this test and why measure it? ── */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{
          fontSize: '1.15rem',
          fontWeight: 800,
          color: '#0f172a',
          margin: '0 0 0.45rem 0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Sparkles size={18} color="#0d9488" />
          {isNad 
            ? (isEs ? '¿Qué es el NAD+ y por qué puede ser interesante medirlo?' : 'What is NAD+ and Why Is It Valuable to Measure It?')
            : (isEs ? `¿Qué es este biomarcador y por qué medirlo?` : `What is this test and why is it valuable to measure it?`)}
        </h3>
        <p style={{
          fontSize: '0.84rem',
          lineHeight: '1.6',
          color: '#334155',
          margin: '0 0 0.5rem 0'
        }}>
          {isNad ? (
            isEs ? (
              'El NAD+ (nicotinamida adenina dinucleótido) es una molécula que está presente en prácticamente todas las células de nuestro organismo y que desempeña un papel fundamental en la producción de energía celular (ATP), la reparación del ADN y el funcionamiento metabólico. Podríamos decir que es uno de los elementos principales que ayudan a nuestras células a funcionar correctamente. Con la edad, los niveles de NAD+ tienden a disminuir de forma progresiva en determinados tejidos, aunque el ritmo varía notablemente entre personas.'
            ) : (
              'NAD+ (Nicotinamide Adenine Dinucleotide) is a critical coenzyme present in virtually every cell of our body. It plays a fundamental role in mitochondrial cellular energy production (ATP), genomic DNA repair (PARP1), and sirtuin-mediated longevity pathways. As we age, intracellular NAD+ levels can decline significantly across tissues, directly impacting cellular recovery and metabolic vitality.'
            )
          ) : (
            isEs ? (
              'Dispositivo de diagnóstico in vitro con marcado CE-IVDR para la cuantificación precisa de biomarcadores metabólicos y endocrinos mediante tarjeta de sangre seca DBS en laboratorio clínico central acreditado (LifeLab1, ISO 15189).'
            ) : (
              'CE-IVDR in vitro diagnostic device for the quantitative measurement of key metabolic and endocrine biomarkers via capillary dried blood spot (DBS) processed at an accredited European central laboratory (LifeLab1, ISO 15189).'
            )
          )}
        </p>
      </div>

      {/* ── 3. When is it recommended to take this test? (Clinical Indications) ── */}
      <div id="when-to-test" style={{
        marginBottom: '1.25rem',
        background: '#f8fafc',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        padding: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '0.65rem' }}>
          <Calendar size={16} color="#003666" />
          <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
            {isNad
              ? (isEs ? '¿Cuándo puede ser interesante realizar un análisis de NAD+?' : 'When is it recommended to take an NAD+ test?')
              : (isEs ? '¿Cuándo puede ser interesante realizar este análisis?' : 'When is it recommended to take this diagnostic test?')}
          </h4>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '10px'
        }}>
          {/* Bullet 1: 40-50+ Longevity baseline */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.78rem', color: '#1e293b' }}>
            <span style={{ color: '#0d9488', fontWeight: 800, fontSize: '0.9rem', lineHeight: '1.2' }}>🔹</span>
            <div>
              <strong>{isEs ? 'A partir de los 40-50 años:' : 'From age 40–50 upwards:'}</strong>{' '}
              {isEs 
                ? 'Para conocer nuestros niveles celulares basales como parte de una evaluación integral de salud, longevidad y prevención del envejecimiento.'
                : 'To evaluate baseline cellular levels as part of a comprehensive proactive health, aging rate, and longevity assessment.'}
            </div>
          </div>

          {/* Bullet 2: Fatigue / Low Energy */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.78rem', color: '#1e293b' }}>
            <span style={{ color: '#0d9488', fontWeight: 800, fontSize: '0.9rem', lineHeight: '1.2' }}>🔹</span>
            <div>
              <strong>{isEs ? 'Fatiga persistente o falta de energía:' : 'Persistent fatigue or low energy:'}</strong>{' '}
              {isEs 
                ? 'Aporta información objetiva sobre la capacidad mitocondrial y el metabolismo celular cuando se experimenta cansancio sin causa aparente.'
                : 'Provides objective biological data regarding mitochondrial energy metabolism when dealing with unexplained chronic fatigue.'}
            </div>
          </div>

          {/* Bullet 3: Sports / Athletic Training */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.78rem', color: '#1e293b' }}>
            <span style={{ color: '#0d9488', fontWeight: 800, fontSize: '0.9rem', lineHeight: '1.2' }}>🔹</span>
            <div>
              <strong>{isEs ? 'Práctica deportiva regular:' : 'Regular sports & athletic training:'}</strong>{' '}
              {isEs 
                ? 'Para explorar aspectos relacionados con el metabolismo bioenergético, la capacidad de recuperación muscular y la resiliencia mitocondrial.'
                : 'To explore bioenergetic metabolism, muscular recovery capacity, and cellular adaptation under rigorous training loads.'}
            </div>
          </div>

          {/* Bullet 4: Before Longevity Protocol (Baseline) */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.78rem', color: '#1e293b' }}>
            <span style={{ color: '#0d9488', fontWeight: 800, fontSize: '0.9rem', lineHeight: '1.2' }}>🔹</span>
            <div>
              <strong>{isEs ? 'Antes de iniciar un programa de longevidad:' : 'Before starting a longevity program:'}</strong>{' '}
              {isEs 
                ? 'Para disponer de un valor inicial verificable (baseline), especialmente si se van a iniciar intervenciones orientadas a elevar el NAD+ (NMN, NR, NAD+ SubQ o IV).'
                : 'To establish an objective baseline before initiating precursors (NMN, NR) or direct SubQ/IV NAD+ protocols.'}
            </div>
          </div>

          {/* Bullet 5: Supplement Monitoring & Dosing */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.78rem', color: '#1e293b' }}>
            <span style={{ color: '#0d9488', fontWeight: 800, fontSize: '0.9rem', lineHeight: '1.2' }}>🔹</span>
            <div>
              <strong>{isEs ? 'Durante el seguimiento de suplementación:' : 'During supplementation follow-up:'}</strong>{' '}
              {isEs 
                ? 'Para comprobar si el protocolo está produciendo una elevación medible en sangre y calibrar la dosis óptima terapéutica.'
                : 'To confirm whether your supplementation protocol is successfully raising intracellular levels and fine-tune individual dosing.'}
            </div>
          </div>

          {/* Bullet 6: Weight loss & GLP-1 synergy */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.78rem', color: '#1e293b' }}>
            <span style={{ color: '#ea580c', fontWeight: 800, fontSize: '0.9rem', lineHeight: '1.2' }}>🔹</span>
            <div>
              <strong>{isEs ? 'Pérdida de peso y pautas metabólicas (GLP-1):' : 'Weight loss & metabolic protocols (GLP-1):'}</strong>{' '}
              {isEs 
                ? 'Para proteger la masa muscular magra, evitar caídas de energía durante el déficit calórico y optimizar la beta-oxidación de grasas.'
                : 'To protect lean muscle mass, prevent severe energy dips during caloric deficits, and maintain mitochondrial fat burning.'}
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Dual Clinical Focus: Longevity & Weight Loss ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
        gap: '12px',
        marginBottom: '1.25rem'
      }}>
        {/* Pillar 1: Longevity & Healthy Aging */}
        <div style={{
          background: 'linear-gradient(145deg, #f0fdfa 0%, #ffffff 100%)',
          border: '1px solid #ccfbf1',
          borderRadius: '10px',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              background: '#0d9488',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Zap size={14} />
            </div>
            <div>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isEs ? 'Pilar Clínico 1' : 'Clinical Focus 1'}
              </span>
              <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                {isEs ? 'Longevidad y Rejuvenecimiento Celular' : 'Longevity & Cellular Rejuvenation'}
              </h4>
            </div>
          </div>

          <p style={{ fontSize: '0.76rem', color: '#475569', lineHeight: '1.45', margin: 0 }}>
            {isEs 
              ? 'El NAD+ es el cofactor indispensable para activar las Sirtuinas (SIRT1/SIRT3) y las enzimas PARP1 de reparación del ADN celular.'
              : 'NAD+ is the indispensable cofactor that fuels Sirtuin longevity genes (SIRT1/SIRT3) and PARP1 DNA repair enzymes.'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '2px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.73rem', color: '#1e293b' }}>
              <CheckCircle2 size={13} color="#0d9488" style={{ marginTop: '2px', flexShrink: 0 }} />
              <span>
                <strong>{isEs ? 'Titulación de Precisión:' : 'Precision Dosing:'}</strong> {isEs ? 'Verifica si tus dosis alcanzan el rango diana juvenil (>35 µmol/L).' : 'Confirms if your protocol reaches youthful therapeutic target levels (>35 µmol/L).'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.73rem', color: '#1e293b' }}>
              <CheckCircle2 size={13} color="#0d9488" style={{ marginTop: '2px', flexShrink: 0 }} />
              <span>
                <strong>{isEs ? 'Vitalidad Mitocondrial:' : 'Mitochondrial Energy:'}</strong> {isEs ? 'Restaura la capacidad bioenergética reduciendo el agotamiento celular.' : 'Restores bioenergetic capacity, combating chronic fatigue and mental exhaustion.'}
              </span>
            </div>
          </div>
        </div>

        {/* Pillar 2: Weight Loss & Metabolic Optimization */}
        <div style={{
          background: 'linear-gradient(145deg, #fff7ed 0%, #ffffff 100%)',
          border: '1px solid #ffedd5',
          borderRadius: '10px',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              background: '#ea580c',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Flame size={14} />
            </div>
            <div>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isEs ? 'Pilar Clínico 2' : 'Clinical Focus 2'}
              </span>
              <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                {isEs ? 'Pérdida de Peso y Salud Metabólica' : 'Weight Loss & Metabolic Flexibility'}
              </h4>
            </div>
          </div>

          <p style={{ fontSize: '0.76rem', color: '#475569', lineHeight: '1.45', margin: 0 }}>
            {isEs 
              ? 'Aceptor obligatorio de electrones para la beta-oxidación de grasas. Niveles bajos bloquean la quema lipídica mitocondrial.'
              : 'Mandatory electron acceptor for fatty acid beta-oxidation (fat burning). Depleted levels cause metabolic drag.'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '2px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.73rem', color: '#1e293b' }}>
              <CheckCircle2 size={13} color="#ea580c" style={{ marginTop: '2px', flexShrink: 0 }} />
              <span>
                <strong>{isEs ? 'Sinergia con GLP-1 (Tirzepatida/Semaglutida):' : 'GLP-1 Synergy:'}</strong> {isEs ? 'Protege la masa magra y mantiene la energía en déficit calórico.' : 'Protects lean mass and prevents fatigue during rapid weight loss protocols.'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.73rem', color: '#1e293b' }}>
              <CheckCircle2 size={13} color="#ea580c" style={{ marginTop: '2px', flexShrink: 0 }} />
              <span>
                <strong>{isEs ? 'Sensibilidad a la Insulina:' : 'Insulin Sensitivity:'}</strong> {isEs ? 'Activa la vía AMPK para acelerar la captación periférica de glucosa.' : 'Activates AMPK signaling to accelerate glucose disposal and metabolic flexibility.'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. How It Works: 3-Step Simple Protocol ── */}
      <div style={{
        background: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        padding: '0.85rem 1rem',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.55rem' }}>
          <Clock size={14} color="#003666" />
          <span style={{ fontSize: '0.73rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {isEs ? '¿Cómo se realiza el análisis? Protocolo Sencillo en 3 Pasos' : 'How It Works: 3-Step Simple At-Home Protocol'}
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px'
        }}>
          <div style={{ fontSize: '0.74rem', color: '#334155', lineHeight: '1.4' }}>
            <strong style={{ color: '#0d9488', display: 'block', marginBottom: '2px' }}>
              {isEs ? '1. Punción Capilar Rápida' : '1. Quick Finger Prick'}
            </strong>
            {isEs ? 'Deposita 3 gotas de sangre en los círculos de la tarjeta Whatman 903 incluida.' : 'Deposit 3 drops of capillary blood onto the certified Whatman 903 filter card.'}
          </div>

          <div style={{ fontSize: '0.74rem', color: '#334155', lineHeight: '1.4' }}>
            <strong style={{ color: '#0d9488', display: 'block', marginBottom: '2px' }}>
              {isEs ? '2. Secado de 3 Horas' : '2. 3-Hour Air Dry'}
            </strong>
            {isEs ? 'Seca al aire a temperatura ambiente (15–25°C). Estable durante 14 días con desecante.' : 'Air-dry at room temperature (15–25°C). Stable for 14 days in the included desiccant mailer.'}
          </div>

          <div style={{ fontSize: '0.74rem', color: '#334155', lineHeight: '1.4' }}>
            <strong style={{ color: '#0d9488', display: 'block', marginBottom: '2px' }}>
              {isEs ? '3. Envío Prepagado' : '3. Prepaid European Return'}
            </strong>
            {isEs ? 'Deposita el sobre en cualquier buzón. Resultados analíticos en 48–72h en tu portal.' : 'Drop prepaid envelope in mailbox. Verified clinical PDF results delivered in 48–72h to your encrypted portal.'}
          </div>
        </div>
      </div>

      {/* ── 6. Scientific Context & Clinical Interpretation Notice ── */}
      <div style={{
        background: '#f1f5f9',
        borderLeft: '3px solid #64748b',
        padding: '0.65rem 0.85rem',
        borderRadius: '0 6px 6px 0',
        marginBottom: '1rem',
        fontSize: '0.73rem',
        color: '#475569',
        lineHeight: '1.45'
      }}>
        <strong>{isEs ? '¿Qué nos dice el resultado?' : 'What do the results indicate?'}</strong>{' '}
        {isEs 
          ? 'Nos permite conocer con rigor analítico los niveles celulares de NAD+ en sangre completa y observar su evolución en el tiempo. Como prueba emergente en medicina preventiva y longevidad, es una excelente herramienta complementaria de monitorización metabólica personalizada.'
          : 'Accurately quantifies intracellular levels and tracks longitudinal response to interventions over time. As an advanced preventive biomarker tool, it serves as an objective clinical compass for personalized metabolic optimization.'}
      </div>

      {/* ── 7. Clean Action Buttons: Gated Pricing, Sample Report & Brochure Downloads ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', paddingTop: '4px' }}>
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

          {/* Direct Sample Report PDF */}
          <a
            href={reportPdf}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: '#f0fdfa',
              color: '#0d9488',
              border: '1px solid #99f6e4',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '0.75rem',
              fontWeight: 700,
              transition: 'all 0.15s ease'
            }}
            title={isEs ? 'Descargar informe clínico de muestra real en PDF' : 'View or download official sample clinical report in PDF'}
          >
            <FileText size={13} />
            <span>{isEs ? 'Informe Clínico Muestra (PDF)' : 'Sample Clinical Report (PDF)'}</span>
          </a>

          {/* Direct Catalog PDF */}
          <a
            href={catalogPdf}
            target="_blank"
            rel="noopener noreferrer"
            download={catalogPdf.split('/').pop()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: '#ffffff',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '0.74rem',
              fontWeight: 600,
              transition: 'all 0.15s ease'
            }}
            title={isEs ? 'Descargar catálogo Bloodo 2026' : 'Download complete 2026 Bloodo catalog'}
          >
            <Download size={13} />
            <span>{isEs ? 'Catálogo 2026 (PDF)' : 'Brochure / Catalog'}</span>
          </a>
        </div>

        {onSelectSection && (
          <button
            type="button"
            onClick={() => onSelectSection('collection-protocol')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: 'transparent',
              color: '#003666',
              border: 'none',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              padding: '4px 8px'
            }}
          >
            <span>{isEs ? 'Ver guía de muestreo ilustrada' : 'View full collection guide'}</span>
            <ArrowRight size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
