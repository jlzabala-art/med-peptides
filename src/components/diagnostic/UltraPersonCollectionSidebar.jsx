"use client";

import React, { useState } from 'react';
import {
  ShieldCheck,
  Award,
  FlaskConical,
  Zap,
  Sparkles,
  Copy,
  Check,
  ChevronRight,
  Mail,
  SlidersHorizontal,
  ChevronDown
} from '@/lib/icons';
import { toast } from 'react-hot-toast';
import { triggerHaptic } from '../../utils/haptics';

export default function UltraPersonCollectionSidebar({
  lang = 'en',
  categories = [],
  selectedCategory = 'all',
  onSelectCategory = () => {},
  totalCount = 0,
  onOpenInquiry = null,
  onOpenAi: _onOpenAi = null
}) {
  const isEs = lang === 'es';
  const [copied, setCopied] = useState(false);
  const [isIntegrationOpen, setIsIntegrationOpen] = useState(true);

  const canonicalUrl = 'https://www.atlashealth-services.com/collection/ultraperson';

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
      toast.success(isEs ? 'Enlace oficial UltraPerson™ copiado ✓' : 'Canonical UltraPerson link copied to clipboard ✓');
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
      {/* ── 1. Quality & Accreditation Header Card ── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        padding: '1.25rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(124, 58, 237, 0.1)',
            color: '#7c3aed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <FlaskConical size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.80rem', fontWeight: 800, color: '#0f172a' }}>
              PharmaPolis Labs
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
              EU GMP · ISO Accredited
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.72rem', color: '#475569' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} color="#16a34a" />
            <span>{isEs ? 'Cápsula HPMC 100% Vegana' : 'Vegan HPMC Delayed-Release'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Award size={14} color="#7c3aed" />
            <span>{isEs ? 'Dosis estandarizada 500 mg/día' : 'Standardized 500 mg Actives/Day'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={14} color="#0284c7" />
            <span>{isEs ? 'Sinergia directa con péptidos' : 'Peptide Protocol Synergy'}</span>
          </div>
        </div>
      </div>

      {/* ── 2. Interactive Categories Filter Card (Google Cloud Standard) ── */}
      {categories && categories.length > 0 && (
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '1.25rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <SlidersHorizontal size={13} color="#7c3aed" />
              <span>{isEs ? 'Categorías Clínicas' : 'Clinical Categories'}</span>
            </span>
            <span style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 600 }}>
              {totalCount} Total
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const accent = '#7c3aed';
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(cat.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isSelected ? `${accent}12` : 'transparent',
                    color: isSelected ? accent : '#334155',
                    fontSize: '0.78rem',
                    fontWeight: isSelected ? 750 : 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.12s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span>{cat.label}</span>
                  {cat.count > 0 && (
                    <span
                      style={{
                        fontSize: '0.66rem',
                        padding: '1px 6px',
                        borderRadius: '9999px',
                        background: isSelected ? accent : '#f1f5f9',
                        color: isSelected ? '#ffffff' : '#64748b',
                        fontWeight: 700
                      }}
                    >
                      {cat.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 3. Clinical Workflow Steps (Collapsible Accordion Card) ── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        padding: '1rem 1.25rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div 
          onClick={() => setIsIntegrationOpen(!isIntegrationOpen)}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <h5 style={{ fontSize: '0.76rem', fontWeight: 800, color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {isEs ? 'Pauta de Integración' : 'Clinical Integration'}
          </h5>
          <ChevronDown 
            size={14} 
            color="#64748b" 
            style={{ 
              transform: isIntegrationOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease' 
            }} 
          />
        </div>

        {isIntegrationOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
            {[
              { step: '01', title: isEs ? 'Evaluación Biomarcadores' : 'Biomarker Evaluation', desc: isEs ? 'Base con Bloodo o ETERNA' : 'Baseline test with Bloodo or ETERNA' },
              { step: '02', title: isEs ? 'Selección de Fórmula' : 'Formula Selection', desc: isEs ? 'Cofactores según eje diurno/nocturno' : 'Targeted circadian or metabolic cofactors' },
              { step: '03', title: isEs ? 'Pauta 90 Días' : '90-Day Protocol', desc: isEs ? 'Administración continua oral' : 'Standardized daily oral administration' },
              { step: '04', title: isEs ? 'Reevaluación Analítica' : 'Outcome Reassessment', desc: isEs ? 'Control longitudinal en Atlas' : 'Longitudinal telemetric tracking' }
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: '#7c3aed',
                  background: '#f5f3ff',
                  borderRadius: '4px',
                  padding: '2px 5px',
                  lineHeight: 1
                }}>
                  {item.step}
                </span>
                <div>
                  <div style={{ fontSize: '0.73rem', fontWeight: 700, color: '#0f172a' }}>{item.title}</div>
                  <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 4. Quick Actions (Share Link & Inquire) ── */}
      <div style={{
        background: '#f8fafc',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {onOpenInquiry && (
          <button
            type="button"
            onClick={onOpenInquiry}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: '8px',
              background: '#7c3aed',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 750,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(124, 58, 237, 0.25)'
            }}
          >
            <Mail size={14} />
            <span>{isEs ? 'Consultar con PharmaPolis' : 'Inquire PharmaPolis Formulations'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleCopyLink}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '8px',
            background: '#ffffff',
            color: '#334155',
            border: '1px solid #cbd5e1',
            fontSize: '0.74rem',
            fontWeight: 650,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          {copied ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
          <span>{copied ? (isEs ? 'Copiado ✓' : 'Copied ✓') : (isEs ? 'Copiar Enlace Colección' : 'Copy Collection Link')}</span>
        </button>
      </div>
    </aside>
  );
}
