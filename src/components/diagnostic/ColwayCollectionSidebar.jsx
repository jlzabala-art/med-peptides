"use client";

import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  Droplets,
  Shield,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  ArrowRight
} from '@/lib/icons';
import { toast } from 'react-hot-toast';
import { triggerHaptic } from '../../utils/haptics';

export default function ColwayCollectionSidebar({
  lang = 'en',
  onOpenInquiry = null,
  onOpenAi = null
}) {
  const isEs = lang === 'es';
  const [copied, setCopied] = useState(false);

  const canonicalUrl = 'https://www.atlashealth-services.com/collection/colway';

  const handleCopyLink = async () => {
    triggerHaptic('selection');
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(canonicalUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = canonicalUrl;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      toast.success(isEs ? 'Enlace Colway® copiado ✓' : 'Canonical Colway link copied to clipboard ✓');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  return (
    <aside className="gcp-collection-sidebar" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      position: 'sticky',
      top: '90px'
    }}>
      {/* ── 1. Native Collagen Bio-Activity Card ── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.85rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'rgba(13, 148, 136, 0.1)',
            color: '#0d9488',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
              Colway® International
            </h4>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              {isEs ? 'Tricología y Dermocosmética Nativa' : 'Native Collagen & Trichology'}
            </span>
          </div>
        </div>

        <p style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
          {isEs
            ? 'Tropocolágeno nativo biológicamente activo con conformación de triple hélice preservada y bloqueo folicular de 5α-reductasa mediante Zinc PCA y Baicapil™.'
            : 'Biologically active native tropocollagen in preserved triple-helix conformation paired with scalp 5α-reductase inhibition via Zinc PCA & Baicapil™.'}
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          background: '#f8fafc',
          borderRadius: '10px',
          padding: '10px',
          border: '1px solid #f1f5f9'
        }}>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
              {isEs ? 'Colágeno' : 'Collagen'}
            </div>
            <div style={{ fontSize: '0.80rem', fontWeight: 800, color: '#0d9488' }}>
              Type I, II, XVII
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
              {isEs ? 'Inhibición DHT' : 'DHT Block'}
            </div>
            <div style={{ fontSize: '0.80rem', fontWeight: 800, color: '#0284c7' }}>
              Zinc PCA + Biotin
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
              {isEs ? 'Regulación' : 'Regulation'}
            </div>
            <div style={{ fontSize: '0.80rem', fontWeight: 800, color: '#16a34a' }}>
              EU 1223/2009
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
              {isEs ? 'Eficacia' : 'Efficacy'}
            </div>
            <div style={{ fontSize: '0.80rem', fontWeight: 800, color: '#0f172a' }}>
              Baicapil™ 2%
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Trichological Protocol Application ── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        padding: '1.25rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <h5 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {isEs ? 'Protocolo Folicular' : 'Follicular Protocol'}
        </h5>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { step: '01', title: isEs ? 'Champú Fortalecedor' : 'Strengthening Cleanser', desc: isEs ? 'Limpieza suave con microcirculación activa' : 'Microcirculation activation & gentle sebum balance' },
            { step: '02', title: isEs ? 'Acondicionador Cuticular' : 'Cuticular Conditioner', desc: isEs ? 'Sellado de tallo con tropocolágeno nativo' : 'Shaft restoration with native peptide tropocollagen' },
            { step: '03', title: isEs ? 'Sinergia Tópica' : 'Topical Synergy', desc: isEs ? 'Complemento a fórmulas TrichoTest' : 'Complementary base for DNA-customized topical lotions' }
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#0d9488',
                background: '#f0fdfa',
                borderRadius: '6px',
                padding: '2px 6px',
                lineHeight: 1
              }}>
                {item.step}
              </span>
              <div>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#0f172a' }}>{item.title}</div>
                <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. Canonical Copy Link ── */}
      <button
        type="button"
        onClick={handleCopyLink}
        style={{
          width: '100%',
          padding: '8px 12px',
          borderRadius: '8px',
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          color: '#334155',
          fontSize: '0.74rem',
          fontWeight: 650,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          transition: 'all 0.15s ease'
        }}
      >
        {copied ? (
          <>
            <Check size={13} color="#16a34a" />
            <span style={{ color: '#16a34a' }}>{isEs ? 'Enlace Copiado' : 'Link Copied'}</span>
          </>
        ) : (
          <>
            <Copy size={13} />
            <span>{isEs ? 'Copiar Enlace Oficial' : 'Share Canonical Link'}</span>
          </>
        )}
      </button>
    </aside>
  );
}
