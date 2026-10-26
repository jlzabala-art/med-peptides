"use client";

import React, { useState } from 'react';
import {
  ShieldCheck,
  Award,
  Microscope,
  Droplets,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Mail,
  Lock,
  ArrowRight
} from '@/lib/icons';
import { toast } from 'react-hot-toast';
import { triggerHaptic } from '../../utils/haptics';

export default function BloodoCollectionSidebar({
  lang = 'en',
  onOpenInquiry = null,
  onOpenAi = null
}) {
  const isEs = lang === 'es';
  const [copied, setCopied] = useState(false);

  const canonicalUrl = 'https://www.atlashealth-services.com/collection/bloodo';

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
      toast.success(isEs ? 'Enlace oficial copiado al portapapeles ✓' : 'Canonical Bloodo link copied to clipboard ✓');
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
            ? '¿Cuál es la prueba diagnóstica Bloodo más adecuada para medir mi reserva celular, fatiga o salud mitocondrial?' 
            : 'Which Bloodo diagnostic test is most suitable for evaluating cellular energy and longevity biomarkers?'
        }
      }));
    }
  };

  return (
    <aside style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      position: 'sticky',
      top: '90px'
    }}>
      {/* ── 1. Laboratory Accreditation Card (LifeLab1) ── */}
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
            background: 'rgba(2, 132, 199, 0.1)',
            color: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Award size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
              LifeLab1 Central Diagnostic Lab
            </h4>
            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
              Vilnius, Lithuania · License 4864
            </span>
          </div>
        </div>

        <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.55, margin: '0 0 1rem 0' }}>
          {isEs 
            ? 'Laboratorio europeo acreditado bajo norma médica ISO 15189. Cuantificación de alta resolución por LC-MS/MS y UHPLC según Reglamento (UE) 2017/746.' 
            : 'European reference laboratory accredited under ISO 15189 medical standards. High-resolution LC-MS/MS & UHPLC chromatography compliant with EU IVDR.'}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '4px 8px',
            borderRadius: '6px',
            background: 'rgba(22, 163, 74, 0.1)',
            color: '#15803d',
            border: '1px solid rgba(22, 163, 74, 0.25)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <ShieldCheck size={12} /> ISO 15189
          </span>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '4px 8px',
            borderRadius: '6px',
            background: 'rgba(56, 189, 248, 0.1)',
            color: '#0284c7',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Microscope size={12} /> CE-IVDR Certified
          </span>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '4px 8px',
            borderRadius: '6px',
            background: 'rgba(168, 85, 247, 0.1)',
            color: '#7c3aed',
            border: '1px solid rgba(168, 85, 247, 0.25)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Lock size={12} /> Whatman® 903
          </span>
        </div>
      </div>

      {/* ── 2. Visual 4-Step DBS Protocol ── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
          <Droplets size={18} color="#e11d48" />
          <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            {isEs ? 'Protocolo de Toma de Muestra DBS' : 'DBS Sample Collection Guide'}
          </h4>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {[
            {
              step: '1',
              title: isEs ? 'Punción capilar indolora' : 'Painless finger-prick',
              desc: isEs ? 'Lanceta retráctil estéril incluida en cada kit.' : 'Sterile single-use micro-lancet included.'
            },
            {
              step: '2',
              title: isEs ? 'Llenar 4 círculos DBS' : 'Fill 4 Whatman® spots',
              desc: isEs ? 'Gotas de sangre sobre la tarjeta Whatman® 903.' : 'Saturate printed circles until outer boundary.'
            },
            {
              step: '3',
              title: isEs ? 'Secado al aire 15 min' : 'Air dry 15 minutes',
              desc: isEs ? 'Secado a temperatura ambiente sin exponer a luz solar.' : 'Allow to dry naturally before packaging.'
            },
            {
              step: '4',
              title: isEs ? 'Envío prepagado al laboratorio' : 'Prepaid courier return',
              desc: isEs ? 'Bolsa con desecante y sobre de retorno europeo incluido.' : 'Seal in desiccant pouch and drop in mail.'
            }
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: '#f1f5f9',
                color: '#0f172a',
                fontSize: '0.72rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '1px'
              }}>
                {item.step}
              </div>
              <div>
                <strong style={{ fontSize: '0.82rem', color: '#0f172a', display: 'block' }}>{item.title}</strong>
                <span style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4, display: 'block' }}>{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </aside>
  );
}
