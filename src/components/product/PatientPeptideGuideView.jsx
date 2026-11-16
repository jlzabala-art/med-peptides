'use client';

import React, { useMemo, useState } from 'react';
import {
  Droplets,
  Thermometer,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  QrCode,
  Copy,
  Check,
  AlertCircle,
  HeartPulse,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import AlgoliaRelatedStrip from '@/components/shared/AlgoliaRelatedStrip';
import ReconstitutionGuide from './ReconstitutionGuide';
import GenomicsExplainerVideoCard from '@/components/genomics/GenomicsExplainerVideoCard';
import { resolveAssistantKeyForPanel } from '@/data/genomics/twentyFourGenomicsAssistants';
import { useRegisterAtlasContext } from '@/context/AtlasContextProvider';

/**
 * PatientPeptideGuideView
 * ─────────────────────────────────────────────────────────────────────────────
 * Patient-facing, plain-language peptide guide (?view=patient).
 * - English ('en') by default.
 * - Includes the interactive Reconstitution Guide & step-by-step preparation.
 * - Strict one-way view: NO link, button, or parameter to switch to Doctor view.
 * - Hides all B2B pricing, wholesale, supplier, and customs terminology.
 */
export default function PatientPeptideGuideView({
  product = {},
  slug = '',
  baseUrl = 'https://www.atlashealth-services.com',
  initialLang = 'en',
  initialStrength = null,
}) {
  const [lang, setLang] = useState(initialLang === 'es' ? 'es' : 'en');
  const [copiedLink, setCopiedLink] = useState(false);
  const isEs = lang === 'es';

  const name = product?.canonicalName || product?.name || product?.title || slug;
  const patientUrl = `${baseUrl}/p/${encodeURIComponent(slug)}?view=patient${isEs ? '&lang=es' : ''}`;
  const genomicsAssistantKey = useMemo(() => resolveAssistantKeyForPanel({ ...product, slug }), [product, slug]);

  const rawSummary =
    product?.patientSummary ||
    product?.overview_summary ||
    product?.clinicalSummary ||
    product?.description ||
    (isEs
      ? `${name} es un péptido bioactivo formulado bajo prescripción médica para apoyar la recuperación tisular y el bienestar metabólico.`
      : `${name} is a clinician-prescribed bioactive peptide formulated to support targeted recovery, cellular repair, and metabolic wellness.`);

  const selectedVariant = useMemo(() => {
    const variants = Array.isArray(product?.variants) ? product.variants : [];
    if (initialStrength && variants.length > 0) {
      const match = variants.find((v) =>
        String(v?.dosage || v?.strength || '').toLowerCase().includes(String(initialStrength).toLowerCase())
      );
      if (match) return match;
    }
    return variants[0] || { dosage: product?.dosage || product?.strength || '5 mg' };
  }, [product, initialStrength]);

  useRegisterAtlasContext(
    {
      title: isEs ? `${name} — Guía para el Paciente` : `${name} — Patient Guide`,
      subtitle: isEs ? 'Guía de reconstitución, conservación y seguridad' : 'Reconstitution, storage & safety guide',
      canonicalUrl: patientUrl,
      type: 'patient_guide',
      bottomBar: {
        summaryTitle: name,
        summarySubtitle: isEs ? 'Guía del Paciente y Reconstitución' : 'Patient Guide & Reconstitution',
        showAtlasAi: true,
        atlasAiLabel: isEs ? 'Preguntar a Atlas AI' : 'Ask Atlas AI',
        showQr: true,
        qrLabel: isEs ? 'Código QR' : 'QR Code',
        primaryAction: {
          label: isEs ? 'Copiar enlace' : 'Copy Guide Link',
          icon: copiedLink ? <Check size={14} /> : <Copy size={14} />,
          onClick: async () => {
            try {
              await navigator.clipboard.writeText(patientUrl);
              setCopiedLink(true);
              toast.success(isEs ? 'Enlace de guía copiado' : 'Patient guide link copied');
              setTimeout(() => setCopiedLink(false), 2000);
            } catch {
              toast.error('Copy failed');
            }
          },
        },
      },
    },
    [name, patientUrl, isEs, copiedLink]
  );

  const prepSteps = isEs
    ? [
        {
          step: '1',
          title: 'Limpia el tapón del vial',
          desc: 'Lava tus manos y limpia la tapa de goma del vial de péptido y del agua bacteriostática con una toallita de alcohol.',
        },
        {
          step: '2',
          title: 'Añade el agua suavemente',
          desc: 'Introduce el agua bacteriostática lentamente por la pared interior del vial. No apuntes directamente al polvo.',
        },
        {
          step: '3',
          title: 'Gira con suavidad (No agitar)',
          desc: 'Rota el vial suavemente entre los dedos hasta que el líquido quede totalmente transparente. Nunca lo agites bruscamente.',
        },
        {
          step: '4',
          title: 'Refrigera de inmediato',
          desc: 'Una vez reconstituido, conserva el vial en nevera (2–8 °C / 36–46 °F) protegido de la luz directa.',
        },
      ]
    : [
        {
          step: '1',
          title: 'Clean Both Vial Stoppers',
          desc: 'Wash your hands thoroughly and wipe the rubber stoppers of both the peptide vial and bacteriostatic water with an alcohol swab.',
        },
        {
          step: '2',
          title: 'Add Water Down the Vial Wall',
          desc: 'Slowly inject the bacteriostatic water against the inside glass wall of the vial so it trickles gently onto the powder.',
        },
        {
          step: '3',
          title: 'Swirl Gently (Never Shake)',
          desc: 'Gently roll or swirl the vial between your fingers until the powder dissolves completely and the solution is clear. Never shake vigorously.',
        },
        {
          step: '4',
          title: 'Refrigerate Immediately',
          desc: 'Store the reconstituted vial upright in the refrigerator (2–8 °C / 36–46 °F) away from direct light.',
        },
      ];

  const faqs = isEs
    ? [
        {
          q: '¿Qué hago si olvido una dosis?',
          a: 'Aplícala en cuanto lo recuerdes si falta bastante para la siguiente toma. Si ya está cerca la próxima dosis, omite la olvidada y continúa tu pauta habitual. Nunca dupliques una dosis.',
        },
        {
          q: '¿Es normal notar un leve enrojecimiento local?',
          a: 'Puede aparecer una ligera molestia o enrojecimiento transitorio en la zona de aplicación. Si notas hinchazón persistente, fiebre o reacción alérgica, suspende su uso y contacta a tu médico.',
        },
        {
          q: '¿Cuánto dura el vial una vez mezclado?',
          a: 'Por lo general entre 28 y 30 días refrigerado entre 2–8 °C, salvo que la etiqueta de tu farmacia indique otra fecha límite de uso (BUD).',
        },
      ]
    : [
        {
          q: 'What should I do if I miss a dose?',
          a: 'Take it as soon as you remember unless it is close to your next scheduled dose. If it is nearly time for the next dose, skip the missed one and resume your regular schedule. Never double a dose.',
        },
        {
          q: 'Is mild redness at the application site normal?',
          a: 'Mild, temporary redness or warmth can occasionally occur. If you experience persistent swelling, rash, dizziness, or any unexpected symptoms, stop use and contact your prescribing clinician.',
        },
        {
          q: 'How long does the mixed vial stay potent?',
          a: 'Most reconstituted peptide vials remain stable for 28–30 days when refrigerated at 2–8 °C (36–46 °F), unless your pharmacy label specifies an earlier Beyond-Use Date (BUD).',
        },
      ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <PublicUnifiedHeader
        track="peptides"
        lang={lang}
        onLangChange={setLang}
        copyUrl={patientUrl}
        shortUrl={patientUrl}
        hideCurrencySelector={true}
        hideImportRx={true}
        hideSwitchRx={true}
        hideSearchButton={true}
        hideTier2={false}
        breadcrumb={[
          { label: isEs ? 'Guía del Paciente' : 'Patient Guide' },
          { label: name },
        ]}
      />

      <main style={{ flex: 1, maxWidth: '960px', width: '100%', margin: '0 auto', padding: '24px 16px 64px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Patient Hero Card */}
        <section
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)',
            border: '1px solid #dbeafe',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '9999px',
                background: '#dcfce7',
                color: '#166534',
                fontSize: '0.72rem',
                fontWeight: 700,
              }}
            >
              <ShieldCheck size={13} />
              <span>{isEs ? 'Guía Educativa para el Paciente' : 'Patient Education & Care Guide'}</span>
            </span>

            <button
              type="button"
              className="gcp-btn-secondary"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('open-global-qr-modal', {
                    detail: {
                      url: patientUrl,
                      title: isEs ? `${name} — QR Guía del Paciente` : `${name} — Patient Guide QR`,
                      subtitle: isEs ? 'Escanea para abrir la guía educativa y reconstitución' : 'Scan to open Patient Education & Reconstitution Guide',
                    },
                  }));
                }
              }}
              style={{ fontSize: '0.75rem', padding: '5px 10px' }}
            >
              <QrCode size={14} color="#003666" />
              <span>{isEs ? 'Compartir QR' : 'Patient QR'}</span>
            </button>
          </div>

          <h1 style={{ margin: '0 0 10px', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            {name}
          </h1>
          <p style={{ margin: 0, fontSize: '0.96rem', lineHeight: 1.6, color: '#334155' }}>
            {rawSummary}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '10px', marginTop: '18px' }}>
            <div style={{ padding: '10px 12px', borderRadius: '10px', background: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <HeartPulse size={18} color="#0284c7" />
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  {isEs ? 'Uso Clínico' : 'Clinical Use'}
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                  {isEs ? 'Solo bajo pauta médica' : 'Follow your prescribed schedule'}
                </div>
              </div>
            </div>

            <div style={{ padding: '10px 12px', borderRadius: '10px', background: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Thermometer size={18} color="#0d9488" />
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  {isEs ? 'Conservación' : 'Storage'}
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                  2–8 °C (36–46 °F) {isEs ? 'tras mezclar' : 'after mixing'}
                </div>
              </div>
            </div>

            <div style={{ padding: '10px 12px', borderRadius: '10px', background: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={18} color="#7c3aed" />
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  {isEs ? 'Estabilidad' : 'Stability'}
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                  {isEs ? '28–30 días refrigerado' : '28–30 days refrigerated'}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step-by-Step Reconstitution Walkthrough */}
        <section
          id="reconstitution-guide"
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '22px',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Droplets size={18} color="#0284c7" />
            <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
              {isEs ? 'Guía Paso a Paso para Reconstituir el Vial' : 'Step-by-Step Reconstitution Guide'}
            </h2>
          </div>
          <p style={{ margin: '0 0 16px', fontSize: '0.86rem', color: '#475569' }}>
            {isEs
              ? 'Sigue estos 4 pasos con calma antes de tu primera aplicación. Usa siempre el volumen de agua bacteriostática indicado en tu receta.'
              : 'Follow these 4 simple steps before your first dose. Always use the exact bacteriostatic water volume specified on your prescription.'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            {prepSteps.map((s) => (
              <div
                key={s.step}
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <span
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '9999px',
                    background: '#003666',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {s.step}
                </span>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>{s.title}</div>
                <div style={{ fontSize: '0.78rem', lineHeight: 1.45, color: '#475569' }}>{s.desc}</div>
              </div>
            ))}
          </div>

          {/* Interactive Dosing & Syringe Units Helper */}
          <ReconstitutionGuide product={product} selectedVariant={selectedVariant} />
        </section>

        {genomicsAssistantKey && (
          <GenomicsExplainerVideoCard assistantKey={genomicsAssistantKey} lang={lang} showAllTabs={false} />
        )}

        {/* Safety & FAQ */}
        <section
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '22px',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <HelpCircle size={18} color="#0d9488" />
            <h2 style={{ margin: 0, fontSize: '1.12rem', fontWeight: 800, color: '#0f172a' }}>
              {isEs ? 'Preguntas Frecuentes y Seguridad' : 'Safety & Frequently Asked Questions'}
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {faqs.map((f, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} color="#0d9488" style={{ flexShrink: 0 }} />
                  <span>{f.q}</span>
                </div>
                <div style={{ fontSize: '0.8rem', lineHeight: 1.5, color: '#475569' }}>{f.a}</div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: '14px',
              padding: '12px 14px',
              borderRadius: '10px',
              background: '#fffbeb',
              border: '1px solid #fde68a',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              fontSize: '0.78rem',
              color: '#92400e',
              lineHeight: 1.45,
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>
              {isEs
                ? 'Esta guía es informativa y complementa las indicaciones de tu médico prescriptor. Ante cualquier duda sobre tu dosis o síntomas, consulta directamente con tu clínica.'
                : 'This guide supports your prescribing physician’s instructions. Always follow your personalized prescription label and contact your clinic with any dosing questions.'}
            </span>
          </div>
        </section>

        <AlgoliaRelatedStrip
          objectID={product?.id || product?.slug}
          category={product?.category || 'peptide'}
          lang={lang}
          patientView={true}
        />
      </main>

      <PublicUnifiedFooter lang={lang} />
    </div>
  );
}
