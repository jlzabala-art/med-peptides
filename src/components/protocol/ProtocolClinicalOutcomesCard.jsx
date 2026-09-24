"use client";

import React, { useState } from 'react';
import PublicSectionCard from '@/components/shared/public/PublicSectionCard';
import { 
  BarChart3, Award, ExternalLink, ShieldCheck, 
  CheckCircle2, Info, BookOpen, ChevronRight, Copy, Check 
} from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';
import toast from 'react-hot-toast';

export default function ProtocolClinicalOutcomesCard({ protocol, lang = 'en' }) {
  const data = protocol?.clinical_outcomes;
  const [copiedPmid, setCopiedPmid] = useState(null);

  // Strict zero-state guard: only render if verified objective data is present
  if (!data || !data.has_objective_data) {
    return null;
  }

  const isEs = lang === 'es';

  const evidenceGrade = isEs
    ? (data.evidence_grade_es || data.evidence_grade || 'Grado A · Ensayos Clínicos')
    : (data.evidence_grade || 'Grade A · Clinical Trials');

  const headline = isEs
    ? (data.headline_highlight_es || data.headline_highlight)
    : (data.headline_highlight || data.headline_highlight_es);

  const endpoints = Array.isArray(data.endpoints) ? data.endpoints : [];
  const publishedTrials = Array.isArray(data.published_trials) ? data.published_trials : [];

  const handleCopyPmid = (e, pmid) => {
    e.stopPropagation();
    e.preventDefault();
    if (!pmid) return;
    navigator.clipboard?.writeText(pmid);
    triggerHaptic('notificationSuccess');
    setCopiedPmid(pmid);
    toast.success(isEs ? `PMID ${pmid} copiado` : `PMID ${pmid} copied`);
    setTimeout(() => setCopiedPmid(null), 2000);
  };

  return (
    <PublicSectionCard
      id="clinical-outcomes"
      icon={BarChart3}
      category={isEs ? 'EVIDENCIA CLÍNICA Y ENSAYOS' : 'CLINICAL EVIDENCE & TRIALS'}
      badge={evidenceGrade}
      badgeVariant="green"
      title={isEs ? 'Beneficios Clínicos y Endpoints Objetivos' : 'Verified Clinical Outcomes & Endpoints'}
      rightAction={
        publishedTrials.length > 0 ? (
          <span style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={14} />
            {isEs ? `${publishedTrials.length} Estudios Publicados` : `${publishedTrials.length} Published Trials`}
          </span>
        ) : null
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>

        {/* ── Headline Clinical Highlight ── */}
        {headline && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.85rem',
              padding: '1rem 1.15rem',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(240, 253, 244, 0.9) 0%, rgba(236, 253, 245, 0.6) 100%)',
              border: '1px solid #bbf7d0',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#16a34a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '2px'
              }}
            >
              <Award size={20} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '0.70rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#15803d',
                    background: '#dcfce7',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}
                >
                  {isEs ? 'Hallazgo Principal Comprobado' : 'Primary Verified Endpoint'}
                </span>
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500 }}>
                  {isEs ? 'Estándar Metodológico RCT' : 'RCT Methodological Standard'}
                </span>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.95rem',
                  lineHeight: '1.45',
                  fontWeight: 600,
                  color: '#0f172a'
                }}
              >
                {headline}
              </p>
            </div>
          </div>
        )}

        {/* ── Endpoints Grid with Comparative GCP Bars ── */}
        {endpoints.length > 0 && (
          <div
            className={`gcp-clinical-endpoints-grid cols-${endpoints.length <= 4 ? endpoints.length : '4'}`}
          >
            {endpoints.map((ep, idx) => {
              const title = isEs ? (ep.title_es || ep.title) : (ep.title || ep.title_es);
              const timeframe = isEs ? (ep.timeframe_es || ep.timeframe) : (ep.timeframe || ep.timeframe_es);
              const isReduction = String(ep.value || '').startsWith('-');

              // Visual bar calculation (clamped between 8% and 100%)
              const activeMagnitude = Math.min(100, Math.max(15, Math.abs(parseFloat(ep.value || '0')) * 2.5));
              const placeboMagnitude = ep.comparator ? Math.min(100, Math.max(8, Math.abs(parseFloat(ep.comparator || '0')) * 2.5)) : 12;

              return (
                <div
                  key={ep.id || idx}
                  style={{
                    padding: '1.25rem 1.35rem',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.95rem',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
                    transition: 'border-color 0.15s ease'
                  }}
                >
                  {/* Endpoint Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.35 }}>
                        {title}
                      </h4>
                      {timeframe && (
                        <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500, marginTop: '2px', display: 'inline-block' }}>
                          {timeframe}
                        </span>
                      )}
                    </div>
                    {ep.p_value && (
                      <span
                        style={{
                          fontSize: '0.70rem',
                          fontWeight: 700,
                          color: '#0369a1',
                          background: '#f0f9ff',
                          border: '1px solid #bae6fd',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {ep.p_value}
                      </span>
                    )}
                  </div>

                  {/* Quantitative Callout with Google Cloud Comparative Badge */}
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '1.95rem',
                        fontWeight: 800,
                        letterSpacing: '-0.025em',
                        color: isReduction ? '#003666' : '#0d9488',
                        lineHeight: 1
                      }}
                    >
                      {ep.value}
                    </span>
                    {ep.comparator && (
                      <span style={{ 
                        fontSize: '0.74rem', 
                        color: '#475569', 
                        fontWeight: 600,
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        padding: '3px 8px',
                        borderRadius: '6px'
                      }}>
                        vs. {ep.comparator}
                      </span>
                    )}
                  </div>

                  {/* GCP Comparative Bar Chart */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.2rem' }}>
                    {/* Active Treatment Bar */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.70rem', marginBottom: '3px', fontWeight: 600 }}>
                        <span style={{ color: '#0f172a' }}>{isEs ? 'Protocolo Activo' : 'Active Protocol'}</span>
                        <span style={{ color: '#003666' }}>{ep.value}</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${activeMagnitude}%`,
                            height: '100%',
                            background: isReduction
                              ? 'linear-gradient(90deg, #003666 0%, #0284c7 100%)'
                              : 'linear-gradient(90deg, #0d9488 0%, #10b981 100%)',
                            borderRadius: '4px',
                            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                          }}
                        />
                      </div>
                    </div>

                    {/* Placebo / Control Bar */}
                    {ep.comparator && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', marginBottom: '2px', color: '#64748b' }}>
                          <span>{isEs ? 'Control / Placebo' : 'Control / Placebo'}</span>
                          <span>{ep.comparator}</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${placeboMagnitude}%`,
                              height: '100%',
                              background: '#cbd5e1',
                              borderRadius: '3px'
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Biological Mechanism / Note */}
                  {ep.mechanism && (
                    <div style={{ fontSize: '0.72rem', color: '#64748b', borderTop: '1px dashed #e2e8f0', paddingTop: '0.5rem', lineHeight: 1.35 }}>
                      <strong style={{ color: '#475569' }}>{isEs ? 'Mecanismo:' : 'Mechanism:'}</strong> {ep.mechanism}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Published Clinical Trials & Biomedical Evidence ── */}
        {publishedTrials.length > 0 && (
          <div
            style={{
              padding: '1rem',
              borderRadius: '10px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <BookOpen size={15} style={{ color: '#003666' }} />
                <h5 style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {isEs ? 'Ensayos Clínicos & Publicaciones Indexadas' : 'Indexed Clinical Trials & Publications'}
                </h5>
              </div>
              <span style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 500 }}>
                {isEs ? 'Revisión por Pares' : 'Peer-Reviewed'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {publishedTrials.map((tr, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b', lineHeight: 1.35 }}>
                      {tr.title}
                    </div>
                    {tr.url && (
                      <a
                        href={tr.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          color: '#0284c7',
                          textDecoration: 'none',
                          flexShrink: 0
                        }}
                      >
                        PubMed <ExternalLink size={12} />
                      </a>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', fontSize: '0.72rem', color: '#64748b' }}>
                    {tr.journal && (
                      <span style={{ fontWeight: 600, color: '#003666' }}>
                        {tr.journal} {tr.year ? `(${tr.year})` : ''}
                      </span>
                    )}
                    {tr.sample_size && (
                      <span style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: '3px', fontWeight: 500 }}>
                        {tr.sample_size}
                      </span>
                    )}
                    {tr.pmid && (
                      <button
                        type="button"
                        onClick={(e) => handleCopyPmid(e, tr.pmid)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          borderRadius: '3px',
                          padding: '1px 6px',
                          fontSize: '0.68rem',
                          color: '#475569',
                          cursor: 'pointer',
                          fontFamily: 'monospace'
                        }}
                        title={isEs ? 'Copiar PMID' : 'Copy PMID'}
                      >
                        PMID: {tr.pmid}
                        {copiedPmid === tr.pmid ? <Check size={10} color="#16a34a" /> : <Copy size={10} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Methodological Governance Disclaimer ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            padding: '0.65rem 0.85rem',
            borderRadius: '6px',
            background: '#f8fafc',
            border: '1px solid #f1f5f9',
            fontSize: '0.72rem',
            color: '#64748b',
            lineHeight: 1.4
          }}
        >
          <Info size={14} style={{ color: '#94a3b8', flexShrink: 0, marginTop: '2px' }} />
          <span>
            {isEs
              ? (data.disclosure_es || 'Los datos cuantitativos provienen de ensayos clínicos revisados por pares y registros biomédicos. La respuesta biológica individual varía según adherencia, comorbilidades y prescripción médica.')
              : (data.disclosure || 'Quantitative metrics are sourced from peer-reviewed clinical trials and biomedical registries. Individual biological response varies based on adherence, baseline metabolic health, and clinical oversight.')}
          </span>
        </div>

      </div>
    </PublicSectionCard>
  );
}
