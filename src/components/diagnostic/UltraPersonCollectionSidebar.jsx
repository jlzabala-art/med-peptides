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
  ExternalLink,
  ChevronRight,
  Mail,
  Lock,
  ArrowRight,
  HeartPulse
} from '@/lib/icons';
import { toast } from 'react-hot-toast';
import { triggerHaptic } from '../../utils/haptics';

export default function UltraPersonCollectionSidebar({
  lang = 'en',
  onOpenInquiry = null,
  onOpenAi = null
}) {
  const isEs = lang === 'es';
  const [copied, setCopied] = useState(false);

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

  const handleAskAi = () => {
    triggerHaptic('selection');
    if (onOpenAi) {
      onOpenAi();
    } else {
      window.dispatchEvent(new CustomEvent('open-atlas-ai', {
        detail: {
          prompt: isEs 
            ? '¿Cuáles son las formulaciones UltraPerson™ más recomendadas para combinar con péptidos y optimizar energía mitocondrial?' 
            : 'Which UltraPerson™ targeted nutritional protocols are recommended for peptide synergy and mitochondrial rejuvenation?'
        }
      }));
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
      {/* ── 1. Compounding Standards & Laboratory Quality Card ── */}
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
            background: 'rgba(124, 58, 237, 0.1)',
            color: '#7c3aed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <FlaskConical size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
              PharmaPolis Compounding
            </h4>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              {isEs ? 'Laboratorio Galénico Farmacéutico' : 'Clinical Galenic Laboratory'}
            </span>
          </div>
        </div>

        <p style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
          {isEs
            ? 'Cofactores nutricionales de grado clínico formulados específicamente para sinergia con protocolos de péptidos, optimización mitocondrial y longevidad celular.'
            : 'Medical-grade targeted nutritional cofactors engineered by PharmaPolis for synergy with precision peptide protocols, mitochondrial rejuvenation, and cellular resilience.'}
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
              {isEs ? 'Estándar' : 'Standard'}
            </div>
            <div style={{ fontSize: '0.80rem', fontWeight: 800, color: '#7c3aed' }}>
              EU GMP / cGMP
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
              {isEs ? 'Cápsulas' : 'Capsules'}
            </div>
            <div style={{ fontSize: '0.80rem', fontWeight: 800, color: '#0f172a' }}>
              Vegan HPMC
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
              {isEs ? 'Alérgenos' : 'Allergens'}
            </div>
            <div style={{ fontSize: '0.80rem', fontWeight: 800, color: '#16a34a' }}>
              0% Non-GMO
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
              {isEs ? 'Liberación' : 'Release'}
            </div>
            <div style={{ fontSize: '0.80rem', fontWeight: 800, color: '#0f172a' }}>
              Acid-Resistant
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Regulated Access Notice ── */}
      <div style={{
        background: '#fffbeb',
        borderRadius: '14px',
        border: '1px solid #fde68a',
        padding: '1.25rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Lock size={16} color="#d97706" />
          <h5 style={{ fontSize: '0.84rem', fontWeight: 800, color: '#92400e', margin: 0 }}>
            {isEs ? 'Acceso Profesional Clínico' : 'Professional Clinical Access'}
          </h5>
        </div>
        <p style={{ fontSize: '0.74rem', color: '#78350f', lineHeight: 1.45, margin: '0 0 10px 0' }}>
          {isEs
            ? 'Las formulaciones UltraPerson™ se dispensan exclusivamente a través de profesionales sanitarios colegiados, clínicas y miembros verificados del portal.'
            : 'UltraPerson™ formulations are strictly dispensed through registered healthcare practitioners, accredited clinics, and verified medical members.'}
        </p>
        <div style={{ fontSize: '0.70rem', color: '#b45309', fontWeight: 700 }}>
          {isEs ? 'Registro obligatorio para tramitar pedidos.' : 'Registration required to place compounding orders.'}
        </div>
      </div>

      {/* ── 3. Clinical Workflow Steps ── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        padding: '1.25rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <h5 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {isEs ? 'Pauta de Integración' : 'Clinical Integration'}
        </h5>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { step: '01', title: isEs ? 'Evaluación Biomarcadores' : 'Biomarker Evaluation', desc: isEs ? 'Diagnóstico base con Bloodo o ETERNA' : 'Baseline test with Bloodo or ETERNA' },
            { step: '02', title: isEs ? 'Selección de Fórmula' : 'Formula Selection', desc: isEs ? 'Cofactores diurnos o nocturnos sinérgicos' : 'Targeted circadian or metabolic cofactors' },
            { step: '03', title: isEs ? 'Pauta 90 Días' : '90-Day Protocol', desc: isEs ? 'Administración continua estandarizada' : 'Standardized daily oral administration' },
            { step: '04', title: isEs ? 'Reevaluación Analítica' : 'Outcome Reassessment', desc: isEs ? 'Control longitudinal en portal Atlas' : 'Longitudinal telemetric tracking' }
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#7c3aed',
                background: '#f5f3ff',
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

      {/* ── 4. Interactive Atlas Clinical AI Assistant ── */}
      <div style={{
        background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
        border: '1px solid #ddd6fe',
        borderRadius: '14px',
        padding: '1.25rem',
        boxShadow: '0 2px 8px rgba(124, 58, 237, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Sparkles size={16} color="#7c3aed" />
          <h5 style={{ fontSize: '0.84rem', fontWeight: 800, color: '#5b21b6', margin: 0 }}>
            Atlas AI Clinical Consultant
          </h5>
        </div>
        <p style={{ fontSize: '0.74rem', color: '#6d28d9', lineHeight: 1.4, margin: '0 0 10px 0' }}>
          {isEs
            ? 'Consulta interacciones, sinergias con péptidos y protocolos personalizados de suplementación.'
            : 'Inquire about peptide synergies, co-factor posology, and customized compounding cofactors.'}
        </p>
        <button
          type="button"
          onClick={handleAskAi}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '8px',
            background: '#7c3aed',
            color: '#ffffff',
            border: 'none',
            fontSize: '0.76rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'background 0.15s ease'
          }}
        >
          <Sparkles size={13} />
          <span>{isEs ? 'Consultar con IA' : 'Ask Atlas AI'}</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* ── 5. Canonical Copy Link ── */}
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
