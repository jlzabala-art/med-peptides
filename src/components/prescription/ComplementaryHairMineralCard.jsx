"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FlaskConical,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2,
  Sparkles,
  Activity,
  FileText
} from '@/lib/icons';
import PublicInstitutionalInquiryDrawer from '../shared/PublicInstitutionalInquiryDrawer';

/**
 * ComplementaryHairMineralCard
 * ─────────────────────────────────────────────────────────────────────────────
 * Integrates TeleTest's Hair Mineral & Heavy Metals Analysis (HTMA) as an
 * optional complementary diagnostic assessment within the TrichoTest prescription
 * workflow and physician portal.
 *
 * Requirements:
 * 1. Exact Title: "Complementary Hair Health Assessment"
 * 2. Exact Body: "Consider Hair Mineral & Heavy Metals Analysis to assess mineral
 *    and trace element concentrations and potential environmental metal exposure.
 *    This test may provide additional clinical information alongside genetic hair
 *    assessments, when indicated."
 * 3. Exact Action: [Request Information]
 * 4. Clinical Guardrail: Optional recommendation, not an automatic prescription.
 *    Cannot independently diagnose nutritional deficiencies, heavy metal toxicity,
 *    or causes of hair loss.
 * 5. Commercial Restriction: Mediluxe does not sell TrichoTest. It only manages
 *    prescriptions derived from independently performed TrichoTest assessments.
 * 6. Integration: Reuses existing Atlas product catalog (teletest-mineralograma-cabello-htma)
 *    and inquiry drawer.
 */
export default function ComplementaryHairMineralCard({
  rx = null,
  onOpenInquiry = null,
  compact = false,
  lang = 'en',
  showCommercialNotice = true
}) {
  const [expandedDetails, setExpandedDetails] = useState(false);
  const [internalInquiryOpen, setInternalInquiryOpen] = useState(false);
  const isEs = lang === 'es';

  const teletestEntity = {
    name: 'TeleTest Hair Mineral & Heavy Metals Analysis (HTMA)',
    productName: 'TeleTest Hair Mineral & Heavy Metals Analysis',
    slug: 'teletest-mineralograma-cabello-htma',
    code: '18267691',
    category: 'Diagnostic & Heavy Metals Toxicology',
    supplier: 'TeleTest Analytika S.A.',
    supplierName: 'TeleTest Analytika S.A.',
    priceFormatted: '€195.00',
    brandType: 'teletest',
    inquiryGoal: 'quotation',
    rxId: rx?.code || rx?.id || null,
    patientName: rx?.patientName || rx?.patient?.name || null,
    doctorName: rx?.doctorName || rx?.treatingDoctor?.name || 'Treating Physician',
    clinic: rx?.clinic || rx?.doctorClinic || 'Specialist Trichology Clinic'
  };

  const handleRequestInformation = () => {
    if (typeof onOpenInquiry === 'function') {
      onOpenInquiry(teletestEntity);
      return;
    }

    // Try dispatching global event for parent drawers
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('OPEN_INSTITUTIONAL_INQUIRY', {
        detail: {
          entity: teletestEntity,
          contextType: 'product'
        }
      });
      window.dispatchEvent(event);
    }

    // Also toggle internal inquiry drawer as a reliable fallback
    setInternalInquiryOpen(true);
  };

  return (
    <>
      <div
        id="complementary-hair-mineral-card"
        style={{
          background: '#ffffff',
          borderRadius: compact ? '8px' : '14px',
          border: '1px solid #cbd5e1',
          boxShadow: compact ? '0 1px 3px rgba(15, 23, 42, 0.04)' : '0 4px 18px rgba(13, 148, 136, 0.08)',
          overflow: 'hidden',
          marginTop: compact ? '0.75rem' : '1.25rem',
          marginBottom: compact ? '0.75rem' : '1.25rem',
          position: 'relative'
        }}
      >
        {/* Top Clinical Accent Bar: TeleTest Analytical Teal & Cyan Gradient */}
        <div
          style={{
            height: '4px',
            background: 'linear-gradient(90deg, #0d9488 0%, #0284c7 60%, #14b8a6 100%)'
          }}
        />

        <div style={{ padding: compact ? '1rem 1.15rem' : '1.35rem 1.5rem' }}>
          {/* Header Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '0.85rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: compact ? 36 : 42,
                  height: compact ? 36 : 42,
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #0d9488 0%, #0369a1 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  flexShrink: 0,
                  boxShadow: '0 3px 10px rgba(13, 148, 136, 0.25)'
                }}
              >
                <FlaskConical size={compact ? 18 : 22} />
              </div>

              <div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    color: '#0d9488',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  <Sparkles size={11} />
                  <span>
                    {isEs
                      ? 'Opción Diagnóstica Adicional · TeleTest Analytika'
                      : 'Additional Diagnostic Option · TeleTest Analytika'}
                  </span>
                </div>

                <h3
                  style={{
                    margin: '2px 0 0 0',
                    fontSize: compact ? '0.98rem' : '1.12rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    lineHeight: 1.3
                  }}
                >
                  Complementary Hair Health Assessment
                </h3>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: '#f0fdfa',
                  color: '#0f766e',
                  border: '1px solid #99f6e4',
                  padding: '3px 8px',
                  borderRadius: '999px',
                  fontSize: '0.70rem',
                  fontWeight: 700
                }}
              >
                <ShieldCheck size={12} color="#0d9488" />
                <span>ICP-MS/MS · 33 Elements</span>
              </span>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: '#f8fafc',
                  color: '#475569',
                  border: '1px solid #e2e8f0',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.70rem',
                  fontFamily: 'monospace',
                  fontWeight: 600
                }}
              >
                Ref: 18267691
              </span>
            </div>
          </div>

          {/* Exact Recommendation Text (Mandatory) */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '0.9rem 1.1rem',
              marginBottom: '1rem'
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: compact ? '0.82rem' : '0.86rem',
                color: '#1e293b',
                lineHeight: 1.55,
                fontWeight: 500
              }}
            >
              Consider Hair Mineral &amp; Heavy Metals Analysis to assess mineral and trace element concentrations
              and potential environmental metal exposure. This test may provide additional clinical information
              alongside genetic hair assessments, when indicated.
            </p>
          </div>

          {/* Clinical Guardrail (Rule 4) */}
          <div
            style={{
              background: '#fffbeb',
              border: '1px solid #fef3c7',
              borderRadius: '8px',
              padding: '0.65rem 0.9rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px'
            }}
          >
            <AlertCircle size={15} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.74rem', color: '#92400e', lineHeight: 1.45, fontWeight: 550 }}>
              <strong>Important:</strong> This is an optional recommendation, not an automatic prescription.
              Hair mineral analysis cannot independently diagnose nutritional deficiencies, heavy metal toxicity, or
              causes of hair loss.
            </div>
          </div>

          {/* Expandable Clinical Rationale Panel (Nutritional & Environmental Toxicology) */}
          <div style={{ marginBottom: '1rem' }}>
            <button
              type="button"
              onClick={() => setExpandedDetails(!expandedDetails)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '4px 0',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#0d9488',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Info size={14} />
              <span>
                {expandedDetails
                  ? (isEs ? 'Ocultar fundamentación fisiológica y analítica' : 'Hide Physiological & Analytical Rationale')
                  : (isEs ? 'Ver fundamentación: Balance Mineral, Metales Pesados y Fisiología Folicular' : 'View Clinical Rationale: Mineral Balance, Heavy Metals & Follicle Physiology')}
              </span>
              {expandedDetails ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>

            {expandedDetails && (
              <div
                style={{
                  marginTop: '0.65rem',
                  padding: '1rem 1.15rem',
                  background: '#f0fdfa',
                  border: '1px solid #ccfbf1',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  fontSize: '0.77rem',
                  color: '#134e4a',
                  lineHeight: 1.5
                }}
              >
                <div>
                  <strong style={{ color: '#0f766e', display: 'block', marginBottom: '2px' }}>
                    Follicular Function &amp; Essential Trace Elements:
                  </strong>
                  Hair follicle function and the normal hair growth cycle depend on adequate nutritional status and
                  the availability of essential trace elements. Minerals such as <strong>zinc (Zn), iron (Fe), copper (Cu), and selenium (Se)</strong> contribute
                  to cellular metabolism, antioxidant defense, protein synthesis, and other biological processes involved in maintaining healthy hair follicles.
                  Alterations in mineral homeostasis, particularly clinically significant deficiencies or excesses, may contribute to hair and scalp abnormalities.
                </div>

                <div>
                  <strong style={{ color: '#0f766e', display: 'block', marginBottom: '2px' }}>
                    Toxic Environmental Metal Exposure &amp; Oxidative Stress:
                  </strong>
                  Exposure to certain toxic metals, including <strong>mercury (Hg), lead (Pb), cadmium (Cd), and arsenic (As)</strong>,
                  may affect cellular function through mechanisms involving oxidative stress and metabolic disruption.
                </div>

                <div>
                  <strong style={{ color: '#0f766e', display: 'block', marginBottom: '2px' }}>
                    Methodology &amp; Clinical Relevance:
                  </strong>
                  TeleTest Analytika uses advanced <strong>ICP-MS/MS</strong> (Triple Quadrupole Inductively Coupled Plasma Mass Spectrometry)
                  technology to measure the concentrations of selected minerals, trace elements, and potentially toxic metals in hair samples.
                  When interpreted alongside clinical history and other appropriate investigations, this analysis provides complementary
                  information about elemental composition and potential environmental exposure.
                </div>

                <div
                  style={{
                    paddingTop: '6px',
                    borderTop: '1px dashed #99f6e4',
                    fontSize: '0.72rem',
                    color: '#0f766e',
                    fontStyle: 'italic'
                  }}
                >
                  Clinical relevance: Hair mineral analysis is a complementary assessment tool, not a standalone diagnostic test for alopecia,
                  systemic mineral deficiencies, or heavy metal toxicity. Abnormal findings should be evaluated by a qualified healthcare
                  professional and confirmed using validated diagnostic methods when clinically indicated.
                </div>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
              paddingTop: '0.75rem',
              borderTop: '1px solid #f1f5f9'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleRequestInformation}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#0d9488',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '7px 16px',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#0f766e')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#0d9488')}
              >
                <FileText size={14} />
                <span>Request Information</span>
              </button>

              <Link
                href="/p/teletest-mineralograma-cabello-htma"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: '#ffffff',
                  color: '#003666',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '7px 14px',
                  fontSize: '0.8125rem',
                  fontWeight: 650,
                  textDecoration: 'none',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#003666';
                  e.currentTarget.style.background = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.background = '#ffffff';
                }}
              >
                <span>View Test Datasheet</span>
                <ExternalLink size={13} />
              </Link>
            </div>

            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
              TeleTest Analytika S.A. · ISO 15189 / ISO 17025 Accredited
            </span>
          </div>

          {/* Commercial Restriction Notice (Rule 6) */}
          {showCommercialNotice && (
            <div
              style={{
                marginTop: '0.75rem',
                paddingTop: '0.5rem',
                fontSize: '0.68rem',
                color: '#94a3b8',
                lineHeight: 1.4,
                borderTop: '1px dashed #e2e8f0'
              }}
            >
              <strong>Commercial Notice:</strong> Mediluxe does not sell TrichoTest. It only manages prescriptions
              derived from independently performed TrichoTest assessments.
            </div>
          )}
        </div>
      </div>

      {/* Internal Inquiry Drawer Fallback if standalone */}
      {internalInquiryOpen && (
        <PublicInstitutionalInquiryDrawer
          isOpen={internalInquiryOpen}
          onClose={() => setInternalInquiryOpen(false)}
          contextType="product"
          initialEntity={teletestEntity}
          lang={lang}
        />
      )}
    </>
  );
}
