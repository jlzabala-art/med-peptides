'use client';

import React, { useState } from 'react';
import { Sparkles, PlayCircle, CheckCircle2, Info, ExternalLink } from 'lucide-react';
import {
  TWENTY_FOUR_GENOMICS_ASSISTANT_LIST,
  getGenomicsAssistantByKey,
} from '@/data/genomics/twentyFourGenomicsAssistants';

/**
 * GenomicsExplainerVideoCard
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable documentation + locally-hosted MP4 video player for 24Genomics
 * AI Assistants (Jun, Julia, Kai, Gaia). English by default.
 */
export default function GenomicsExplainerVideoCard({
  assistantKey = 'skin-and-hair',
  activeKey = null,
  onSelectKey = null,
  lang = 'en',
  showAllTabs = true,
}) {
  const [internalKey, setInternalKey] = useState(assistantKey);
  const effectiveKey = activeKey || internalKey;
  const handleSelect = (key) => {
    setInternalKey(key);
    if (typeof onSelectKey === 'function') onSelectKey(key);
  };
  const isEs = lang === 'es';
  const item = getGenomicsAssistantByKey(effectiveKey);

  return (
    <section
      aria-label={isEs ? item.titleEs : item.title}
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        marginBottom: '20px',
      }}
    >
      {showAllTabs && TWENTY_FOUR_GENOMICS_ASSISTANT_LIST.length > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexWrap: 'wrap',
            marginBottom: '16px',
            paddingBottom: '12px',
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginRight: '4px' }}>
            {isEs ? 'Asistentes IA 24Genomics:' : '24Genomics AI Assistants:'}
          </span>
          {TWENTY_FOUR_GENOMICS_ASSISTANT_LIST.map((a) => {
            const active = a.id === item.id;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => handleSelect(a.id)}
                style={{
                  padding: '5px 11px',
                  borderRadius: '9999px',
                  border: active ? '1.5px solid #1a73e8' : '1px solid #cbd5e1',
                  background: active ? '#eff6ff' : '#ffffff',
                  color: active ? '#1d4ed8' : '#475569',
                  fontSize: '0.74rem',
                  fontWeight: active ? 750 : 600,
                  cursor: 'pointer',
                }}
              >
                {isEs ? a.shortLabelEs : a.shortLabel}
              </button>
            );
          })}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          alignItems: 'start',
        }}
      >
        {/* Left: Native Hosted Video Player */}
        <div>
          <div
            style={{
              borderRadius: '12px',
              overflow: 'hidden',
              background: '#0f172a',
              border: '1px solid #cbd5e1',
              aspectRatio: '16 / 9',
            }}
          >
            <video
              key={item.videoUrl}
              controls
              playsInline
              preload="metadata"
              style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
              aria-label={item.videoTitle}
            >
              <source src={item.videoUrl} type="video/mp4" />
            </video>
          </div>
          <div
            style={{
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              fontSize: '0.72rem',
              color: '#64748b',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
              <PlayCircle size={13} color="#0284c7" />
              <span>{item.videoTitle}</span>
            </span>
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                color: '#1a73e8',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <span>{isEs ? 'Fuente 24Genetics' : '24Genetics Source'}</span>
              <ExternalLink size={11} />
            </a>
          </div>
        </div>

        {/* Right: Structured Clinical & Patient Documentation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 9px',
                borderRadius: '9999px',
                background: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
                fontSize: '0.7rem',
                fontWeight: 700,
                marginBottom: '8px',
              }}
            >
              <Sparkles size={12} />
              <span>24Genomics · {item.assistantName} AI</span>
            </span>

            <h3 style={{ margin: '0 0 4px', fontSize: '1.12rem', fontWeight: 800, color: '#0f172a' }}>
              {isEs ? item.titleEs : item.title}
            </h3>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0284c7', marginBottom: '8px' }}>
              {isEs ? item.subtitleEs : item.subtitle}
            </div>
            <p style={{ margin: 0, fontSize: '0.84rem', lineHeight: 1.55, color: '#334155' }}>
              {isEs ? item.summaryEs : item.summary}
            </p>
          </div>

          {/* 3-Step Workflow */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px' }}>
            {item.howItWorks.map((step) => (
              <div
                key={step.step}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#003666', marginBottom: '3px' }}>
                  {step.step}. {isEs ? step.titleEs : step.title}
                </div>
                <div style={{ fontSize: '0.73rem', lineHeight: 1.4, color: '#475569' }}>
                  {isEs ? step.descriptionEs : step.description}
                </div>
              </div>
            ))}
          </div>

          {/* Highlights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {(isEs ? item.highlightsEs : item.highlights).map((h, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#1e293b' }}>
                <CheckCircle2 size={13} color="#0d9488" style={{ flexShrink: 0 }} />
                <span>{h}</span>
              </div>
            ))}
          </div>

          {/* Clinical Note */}
          <div
            style={{
              padding: '8px 10px',
              borderRadius: '8px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '6px',
              fontSize: '0.72rem',
              color: '#64748b',
              lineHeight: 1.4,
            }}
          >
            <Info size={13} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{isEs ? item.clinicalNoteEs : item.clinicalNote}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
