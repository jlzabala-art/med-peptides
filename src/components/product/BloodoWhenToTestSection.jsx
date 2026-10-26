"use client";

import React from 'react';
import { 
  Calendar, 
  Activity, 
  Zap, 
  Flame, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  HeartPulse,
  Sparkles
} from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';

/**
 * BloodoWhenToTestSection
 * ─────────────────────────────────────────────────────────────────────────────
 * Section 2: "When to Take This Test" (¿Cuándo Hacerse el Test?)
 * Provides clear, human-centered, and actionable clinical guidance on when to 
 * take this specific diagnostic test, structured into:
 * 1. The 6 Core Clinical Scenarios (Age 40-50+, Fatigue, Sports, Baseline, Follow-up, Weight Loss)
 * 2. Dual Clinical Focus Pillars (Longevity / Sirtuins & Weight Loss / GLP-1)
 * 3. Clinical Decision Checklist / Recommended Retest Frequency
 */
export default function BloodoWhenToTestSection({
  product = {},
  lang = 'en',
  onSelectSection = null,
  onUnlockRequest = null
}) {
  const isEs = lang === 'es';
  const slug = (product?.slug || product?.id || '').toLowerCase();
  const isNad = slug.includes('nad');
  const isTestosterone = slug.includes('testosterone') || slug.includes('testosterona');
  const isCortisol = slug.includes('cortisol');
  const isHba1c = slug.includes('hba1c') || slug.includes('hemoglobin') || slug.includes('glucose');
  const isOmega = slug.includes('omega') || slug.includes('lipid');
  const isVitD = slug.includes('vitamin') || slug.includes('vitd');

  // Analyte-specific clinical title
  const testTitle = isNad ? 'NAD+ Intracellular' :
    isTestosterone ? 'Testosterone+' :
    isCortisol ? 'Cortisol CAR & PM' :
    isHba1c ? 'HbA1c & Mean Glycemia' :
    isOmega ? 'Omega-3/6 Ratio' :
    isVitD ? 'Vitamin D3 (25-OH)' : 'Diagnostic';

  return (
    <section 
      id="when-to-test" 
      className="pds-section-card"
      style={{
        marginTop: '1.5rem',
        marginBottom: '1.75rem',
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '1.5rem',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
      }}
    >
      {/* ── Section Header ── */}
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
            <Calendar size={12} /> {isEs ? 'SECCIÓN 2 · INDICACIONES CLÍNICAS' : 'SECTION 2 · CLINICAL INDICATIONS'}
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
            <Calendar size={22} color="#003666" />
            {isEs 
              ? `2. ¿Cuándo Hacerse el Test de ${testTitle}?` 
              : `2. When to Take the ${testTitle} Test?`}
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
            {isEs 
              ? 'Guía clara y accesible para orientar al paciente y profesional en qué momentos y situaciones clínicas está indicado realizar esta prueba analítica.'
              : 'Clear and accessible guidance outlining key clinical situations, age milestones, and therapeutic moments when taking this test provides maximum value.'}
          </p>
        </div>

        <span style={{
          fontSize: '0.72rem',
          fontWeight: 700,
          color: '#15803d',
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          padding: '4px 10px',
          borderRadius: '6px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px'
        }}>
          <ShieldCheck size={13} /> CE-IVDR · ISO 15189
        </span>
      </div>

      {/* ── 6 Core Clinical Scenarios (Grid) ── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{
          fontSize: '0.95rem',
          fontWeight: 800,
          color: '#0f172a',
          margin: '0 0 0.85rem 0',
          display: 'flex',
          alignItems: 'center',
          gap: '7px'
        }}>
          <Activity size={16} color="#0d9488" />
          {isEs ? 'Situaciones Clínicas y Momentos de Mayor Utilidad' : 'Key Clinical Situations & Optimal Testing Moments'}
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '12px'
        }}>
          {/* Card 1: Age 40-50+ Baseline */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 800, fontSize: '0.8rem' }}>
                40+
              </div>
              <h4 style={{ margin: 0, fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>
                {isEs ? 'A partir de los 40–50 años' : 'From Age 40–50 Upwards'}
              </h4>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#334155', lineHeight: '1.5', margin: 0 }}>
              {isNad ? (
                isEs 
                  ? 'Para conocer los niveles celulares basales como parte de una evaluación integral de salud, longevidad y prevención activa del envejecimiento biológico.'
                  : 'To determine your baseline cellular levels as part of a comprehensive proactive health, biological aging, and longevity evaluation.'
              ) : (
                isEs
                  ? 'Punto de inflexión biológico para establecer un registro basal objetivo y anticiparse a desequilibrios subclínicos endocrinos o metabólicos.'
                  : 'Key biological milestone to establish an objective baseline and detect subclinical endocrine or metabolic shifts before symptoms manifest.'
              )}
            </p>
          </div>

          {/* Card 2: Chronic Fatigue / Unexplained Energy Depletion */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Zap size={15} />
              </div>
              <h4 style={{ margin: 0, fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>
                {isEs ? 'Fatiga persistente o falta de energía' : 'Persistent Fatigue or Low Energy'}
              </h4>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#334155', lineHeight: '1.5', margin: 0 }}>
              {isNad ? (
                isEs 
                  ? 'Aporta información biológica objetiva sobre la capacidad mitocondrial y el metabolismo celular cuando se experimenta cansancio o niebla mental sin causa aparente.'
                  : 'Provides objective biological data regarding mitochondrial ATP capacity and cellular vitality when dealing with unexplained fatigue or mental brain fog.'
              ) : (
                isEs
                  ? 'Permite descartar disrupciones en la producción hormonal, sobrecarga adrenal o déficits nutricionales implicados en el agotamiento crónico.'
                  : 'Identifies endocrine axis dysregulation, adrenal overload, or nutrient deficiencies directly driving chronic exhaustion.'
              )}
            </p>
          </div>

          {/* Card 3: Sports Training & Athletic Recovery */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#f0fdf4', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <TrendingUp size={15} />
              </div>
              <h4 style={{ margin: 0, fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>
                {isEs ? 'Entrenamiento deportivo y alto rendimiento' : 'Athletic Training & High Performance'}
              </h4>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#334155', lineHeight: '1.5', margin: 0 }}>
              {isEs 
                ? 'Para explorar la eficiencia del metabolismo bioenergético, la capacidad de recuperación muscular y la resiliencia mitocondrial ante cargas físicas intensas.'
                : 'To quantify bioenergetic metabolic efficiency, muscular recovery kinetics, and mitochondrial resilience under demanding athletic training loads.'}
            </p>
          </div>

          {/* Card 4: Before Starting a Longevity or Peptide Protocol (Baseline) */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#f0fdfa', color: '#0f766e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Sparkles size={15} />
              </div>
              <h4 style={{ margin: 0, fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>
                {isEs ? 'Antes de iniciar un protocolo de longevidad' : 'Before Starting a Longevity Protocol'}
              </h4>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#334155', lineHeight: '1.5', margin: 0 }}>
              {isNad ? (
                isEs 
                  ? 'Para disponer de un valor inicial verificable (baseline), especialmente antes de comenzar precursores (NMN, NR) o terapias de NAD+ directo (SubQ o IV).'
                  : 'To establish an objective clinical baseline before initiating precursors (NMN, NR) or direct SubQ/IV NAD+ therapeutic administration.'
              ) : (
                isEs
                  ? 'Para documentar objetivamente el punto de partida antes de prescribir terapias hormonales, péptidos biorreguladores o suplementación clínica.'
                  : 'To objectively document starting baseline values prior to initiating hormone optimization, peptide protocols, or clinical supplementation.'
              )}
            </p>
          </div>

          {/* Card 5: Supplementation Monitoring & Dosage Calibration */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#fae8ff', color: '#86198f', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Clock size={15} />
              </div>
              <h4 style={{ margin: 0, fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>
                {isEs ? 'Seguimiento y calibración de dosis' : 'Follow-up & Dosage Titration'}
              </h4>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#334155', lineHeight: '1.5', margin: 0 }}>
              {isEs 
                ? 'Tras 6–12 semanas de tratamiento, para comprobar si la pauta está produciendo una elevación cuantitativa en sangre y ajustar la dosis óptima individualizada.'
                : 'After 6–12 weeks of intervention, to verify if your protocol is successfully raising levels and precisely calibrate individualized maintenance dosing.'}
            </p>
          </div>

          {/* Card 6: Weight Loss & Metabolic Protocols (GLP-1 Synergy) */}
          <div style={{
            background: '#fff7ed',
            border: '1px solid #fed7aa',
            borderRadius: '10px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#ffedd5', color: '#c2410c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Flame size={15} />
              </div>
              <h4 style={{ margin: 0, fontSize: '0.86rem', fontWeight: 800, color: '#9a3412' }}>
                {isEs ? 'Pérdida de peso y pautas GLP-1' : 'Weight Loss & GLP-1 Protocols'}
              </h4>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#7c2d12', lineHeight: '1.5', margin: 0 }}>
              {isEs 
                ? 'En pacientes en programas de adelgazamiento (Tirzepatida, Semaglutida) para proteger la masa muscular magra, evitar bajadas de energía y maximizar la quema lipídica mitocondrial.'
                : 'For individuals on active weight loss programs (Tirzepatide, Semaglutide) to protect lean mass, avoid energy crashes in caloric deficit, and optimize mitochondrial fat oxidation.'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Dual Clinical Focus: Longevity & Weight Loss ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
        gap: '12px',
        marginBottom: '1.5rem'
      }}>
        {/* Pillar 1: Longevity & Cellular Rejuvenation */}
        <div style={{
          background: 'linear-gradient(145deg, #f0fdfa 0%, #ffffff 100%)',
          border: '1px solid #ccfbf1',
          borderRadius: '10px',
          padding: '1.1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: '#0d9488',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Zap size={15} />
            </div>
            <div>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isEs ? 'Pilar Clínico 1' : 'Clinical Focus 1'}
              </span>
              <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
                {isEs ? 'Longevidad y Rejuvenecimiento Celular' : 'Longevity & Cellular Rejuvenation'}
              </h4>
            </div>
          </div>

          <p style={{ fontSize: '0.78rem', color: '#475569', lineHeight: '1.5', margin: 0 }}>
            {isNad ? (
              isEs 
                ? 'El NAD+ es el cofactor indispensable que activa las Sirtuinas (SIRT1/SIRT3) y las enzimas PARP1 responsables de reparar el ADN frente al estrés oxidativo y envejecimiento.'
                : 'NAD+ is the mandatory fuel required by Sirtuin longevity genes (SIRT1/SIRT3) and PARP1 DNA repair enzymes to maintain genomic integrity and cellular youth.'
            ) : (
              isEs
                ? 'Monitorea biomarcadores diana que dictan la tasa de senescencia celular, inflamación sistémica subclínica y preservación de órganos vitales.'
                : 'Monitors primary biomarker targets that regulate cellular senescence rates, low-grade systemic inflammation, and vital organ preservation.'
            )}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.74rem', color: '#1e293b' }}>
              <CheckCircle2 size={14} color="#0d9488" style={{ marginTop: '2px', flexShrink: 0 }} />
              <span>
                <strong>{isEs ? 'Titulación Terapéutica:' : 'Therapeutic Titration:'}</strong> {isEs ? 'Comprueba si tu protocolo alcanza el rango diana juvenil óptimo (>35 µmol/L).' : 'Confirms if your supplementation protocol reaches youthful target ranges (>35 µmol/L).'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.74rem', color: '#1e293b' }}>
              <CheckCircle2 size={14} color="#0d9488" style={{ marginTop: '2px', flexShrink: 0 }} />
              <span>
                <strong>{isEs ? 'Vitalidad Mitocondrial:' : 'Mitochondrial Vitality:'}</strong> {isEs ? 'Restaura la producción endógena de ATP disminuyendo el cansancio celular profundo.' : 'Restores endogenous ATP production, eliminating deep cellular exhaustion.'}
              </span>
            </div>
          </div>
        </div>

        {/* Pillar 2: Weight Loss & Metabolic Optimization */}
        <div style={{
          background: 'linear-gradient(145deg, #fff7ed 0%, #ffffff 100%)',
          border: '1px solid #ffedd5',
          borderRadius: '10px',
          padding: '1.1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: '#ea580c',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Flame size={15} />
            </div>
            <div>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isEs ? 'Pilar Clínico 2' : 'Clinical Focus 2'}
              </span>
              <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
                {isEs ? 'Pérdida de Peso y Salud Metabólica' : 'Weight Loss & Metabolic Flexibility'}
              </h4>
            </div>
          </div>

          <p style={{ fontSize: '0.78rem', color: '#475569', lineHeight: '1.5', margin: 0 }}>
            {isNad ? (
              isEs 
                ? 'El NAD+ es el aceptor de electrones obligatorio para la beta-oxidación de ácidos grasos. Niveles insuficientes frenan la quema mitocondrial de grasa.'
                : 'NAD+ serves as the mandatory electron acceptor for fatty acid beta-oxidation. Depleted cellular levels stall mitochondrial fat burning.'
            ) : (
              isEs
                ? 'Evalúa el balance lipídico, sensibilidad insulínica y control glucémico para optimizar la pérdida de grasa conservando la masa muscular.'
                : 'Assesses lipid balance, insulin sensitivity, and glycemic control to maximize fat loss while preserving metabolically active lean muscle mass.'
            )}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.74rem', color: '#1e293b' }}>
              <CheckCircle2 size={14} color="#ea580c" style={{ marginTop: '2px', flexShrink: 0 }} />
              <span>
                <strong>{isEs ? 'Sinergia con GLP-1:' : 'GLP-1 Synergy:'}</strong> {isEs ? 'Protege el músculo magro y mantiene la claridad mental durante el déficit calórico.' : 'Protects lean mass and maintains cognitive vitality during caloric restriction.'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.74rem', color: '#1e293b' }}>
              <CheckCircle2 size={14} color="#ea580c" style={{ marginTop: '2px', flexShrink: 0 }} />
              <span>
                <strong>{isEs ? 'Sensibilidad a la Insulina:' : 'Insulin Sensitivity:'}</strong> {isEs ? 'Favorece la señalización de AMPK para mejorar el aclaramiento de glucosa.' : 'Activates AMPK signaling to accelerate peripheral glucose disposal and metabolic flexibility.'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Retesting Frequency & Next Steps ── */}
      <div style={{
        background: '#f1f5f9',
        borderRadius: '8px',
        padding: '0.85rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={16} color="#003666" />
          <span style={{ fontSize: '0.78rem', color: '#334155' }}>
            <strong>{isEs ? 'Frecuencia recomendada de re-test:' : 'Recommended Retest Frequency:'}</strong>{' '}
            {isEs ? 'Cada 3 a 6 meses para evaluar la respuesta biológica al tratamiento.' : 'Every 3 to 6 months to quantify biological response to your intervention.'}
          </span>
        </div>

        {onSelectSection && (
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onSelectSection('diagnostic-specs');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#0d9488',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <span>{isEs ? 'Siguiente: 3. Rangos de Referencia y Biomarcadores' : 'Next: 3. Reference Ranges & Biomarkers'}</span>
            <ArrowRight size={13} />
          </button>
        )}
      </div>
    </section>
  );
}
