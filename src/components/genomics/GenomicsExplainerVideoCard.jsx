'use client';

import React, { useState, useRef } from 'react';
import { Sparkles, PlayCircle, Play, CheckCircle2, Info, ExternalLink } from 'lucide-react';
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
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const effectiveKey = activeKey || internalKey;
  const handleSelect = (key) => {
    setInternalKey(key);
    setIsPlaying(false);
    if (typeof onSelectKey === 'function') onSelectKey(key);
  };
  const isEs = lang === 'es';
  const item = getGenomicsAssistantByKey(effectiveKey);

  return (
    <section
      aria-label={isEs ? item.titleEs : item.title}
      style={{
        background: '#ffffff',
        border: '1px solid #dadce0',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 1px 2px rgba(60, 64, 67, 0.06)',
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
            padding: '12px 18px',
            background: '#f8f9fa',
            borderBottom: '1px solid #dadce0',
          }}
        >
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', marginRight: '4px', letterSpacing: '0.02em' }}>
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
                  borderRadius: '16px',
                  border: active ? '1px solid #1a73e8' : '1px solid #dadce0',
                  background: active ? '#e8f0fe' : '#ffffff',
                  color: active ? '#1a73e8' : '#3c4043',
                  fontSize: '0.74rem',
                  fontWeight: active ? 650 : 500,
                  cursor: 'pointer',
                }}
              >
                {isEs ? a.shortLabelEs : a.shortLabel}
              </button>
            );
          })}
        </div>
      )}

      <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* ── Row 1: Balanced Video + Overview & Key Highlights (Zero Empty Space) ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            alignItems: 'center',
          }}
        >
          {/* Left: Native Hosted Video Player with Inviting Clinical Cover Overlay */}
          <div>
            <div
              style={{
                position: 'relative',
                borderRadius: '8px',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #002b52 0%, #0d9488 100%)',
                border: '1px solid #dadce0',
                aspectRatio: '16 / 9',
              }}
            >
              <video
                ref={videoRef}
                key={item.videoUrl}
                controls={isPlaying}
                playsInline
                preload="metadata"
                poster={item.posterUrl || undefined}
                onPlay={() => setIsPlaying(true)}
                onEnded={() => setIsPlaying(false)}
                style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
                aria-label={item.videoTitle}
              >
                <source src={item.videoUrl} type="video/mp4" />
              </video>

              {!isPlaying && (
                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(true);
                    setTimeout(() => {
                      videoRef.current?.play?.().catch(() => {});
                    }, 30);
                  }}
                  aria-label={`Play ${item.videoTitle}`}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    padding: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    background: item.posterUrl
                      ? `linear-gradient(180deg, rgba(0,30,60,0.22) 0%, rgba(0,30,60,0.68) 100%), url("${item.posterUrl}") center/cover no-repeat`
                      : 'linear-gradient(135deg, rgba(0,54,102,0.92) 0%, rgba(13,148,136,0.88) 100%)',
                    color: '#ffffff',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  <span
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.96)',
                      color: '#003666',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
                    }}
                  >
                    <Play size={24} fill="#003666" style={{ marginLeft: '3px' }} />
                  </span>
                  <span
                    style={{
                      padding: '5px 12px',
                      borderRadius: '9999px',
                      background: 'rgba(15, 23, 42, 0.72)',
                      backdropFilter: 'blur(6px)',
                      border: '1px solid rgba(255, 255, 255, 0.28)',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      letterSpacing: '0.01em',
                    }}
                  >
                    {isEs ? `Ver presentación · ${item.assistantName} AI` : `Watch Walkthrough · ${item.assistantName} AI`}
                  </span>
                </button>
              )}
            </div>
            <div
              style={{
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                fontSize: '0.73rem',
                color: '#5f6368',
                flexWrap: 'wrap',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                <PlayCircle size={13} color="#1a73e8" />
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

          {/* Right: Clean GCP Header, Summary & Key Highlights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '2px 9px',
                  borderRadius: '4px',
                  background: '#e8f0fe',
                  color: '#1a73e8',
                  border: '1px solid #d2e3fc',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  marginBottom: '8px',
                }}
              >
                <Sparkles size={11} />
                <span>24Genomics · {item.assistantName} AI</span>
              </span>

              <h3 style={{ margin: '0 0 4px', fontSize: '1.12rem', fontWeight: 700, color: '#202124', letterSpacing: '-0.01em' }}>
                {isEs ? item.titleEs : item.title}
              </h3>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1a73e8', marginBottom: '8px' }}>
                {isEs ? item.subtitleEs : item.subtitle}
              </div>
              <p style={{ margin: 0, fontSize: '0.84rem', lineHeight: 1.55, color: '#3c4043' }}>
                {isEs ? item.summaryEs : item.summary}
              </p>
            </div>

            {/* Highlights */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                paddingTop: '8px',
                borderTop: '1px solid #f1f3f4',
              }}
            >
              {(isEs ? item.highlightsEs : item.highlights).map((h, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', fontSize: '0.79rem', color: '#202124', lineHeight: 1.4 }}>
                  <CheckCircle2 size={14} color="#137333" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Row 2: Full-Width 3-Step Workflow Strip (3 Columns on Laptop, 1 Column on Mobile) ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
          }}
        >
          {item.howItWorks.map((step) => (
            <div
              key={step.step}
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                background: '#f8f9fa',
                border: '1px solid #dadce0',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <span
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#e8f0fe',
                    color: '#1a73e8',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {step.step}
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#202124' }}>
                  {isEs ? step.titleEs : step.title}
                </span>
              </div>
              <div style={{ fontSize: '0.76rem', lineHeight: 1.45, color: '#5f6368' }}>
                {isEs ? step.descriptionEs : step.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer Disclaimer Strip ── */}
      <div
        style={{
          padding: '10px 18px',
          background: '#f8f9fa',
          borderTop: '1px solid #dadce0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.73rem',
          color: '#5f6368',
          lineHeight: 1.4,
        }}
      >
        <Info size={13} style={{ flexShrink: 0 }} />
        <span>{isEs ? item.clinicalNoteEs : item.clinicalNote}</span>
      </div>
    </section>
  );
}
