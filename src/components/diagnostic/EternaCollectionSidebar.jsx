"use client";

import React, { useState } from 'react';
import {
  ShieldCheck,
  Award,
  Dna,
  Activity,
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

export default function EternaCollectionSidebar({
  lang = 'en',
  onOpenInquiry = null,
  onOpenAi = null
}) {
  const isEs = lang === 'es';
  const [copied, setCopied] = useState(false);

  const canonicalUrl = 'https://www.atlashealth-services.com/collection/eterna';

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
      toast.success(isEs ? 'Enlace oficial ETERNA copiado al portapapeles ✓' : 'Canonical ETERNA link copied to clipboard ✓');
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
            ? '¿Cómo calcula ETERNA Longevity DX la edad biológica de mis órganos y qué protocolos peptídicos complementan los resultados genómicos?' 
            : 'How does ETERNA Longevity DX calculate organ biological age and which peptide protocols complement the genomic results?'
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
      {/* ── 1. Laboratory Accreditation Card (Eurofins Genomics) ── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        padding: '1.4rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.85rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'rgba(2, 132, 199, 0.1)',
            border: '1px solid rgba(2, 132, 199, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0284c7'
          }}>
            <Dna size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
              Eurofins Genomics EU
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
              Ebersberg (Munich) · Germany
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '1.1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#334155' }}>
            <ShieldCheck size={14} color="#0284c7" />
            <span><strong>ISO 15189:2012</strong> {isEs ? 'Acreditación Clínica' : 'Clinical Laboratory Accreditation'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#334155' }}>
            <Award size={14} color="#0284c7" />
            <span><strong>CAP & CLIA Certified</strong> {isEs ? 'Estándares Internacionales' : 'International Standards'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#334155' }}>
            <Activity size={14} color="#0284c7" />
            <span><strong>Illumina HTP Infinium</strong> {isEs ? '+700.000 Marcadores SNPs' : '+700,000 SNPs Microarray'}</span>
          </div>
        </div>

        <div style={{
          padding: '0.75rem 0.9rem',
          borderRadius: '8px',
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          fontSize: '0.72rem',
          color: '#0369a1',
          lineHeight: 1.45
        }}>
          {isEs
            ? 'Plataforma multi-ómica de longevidad celular que combina ADN genómico fijo, proteómica longitudinal y relojes epigenéticos de edad biológica de órganos.'
            : 'Multi-omics cellular longevity platform combining fixed genomic DNA baseline, longitudinal proteomics, and organ-specific epigenetic biological age clocks.'}
        </div>
      </div>

      {/* ── 2. How ETERNA Testing Works Infographic ── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        padding: '1.4rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={16} color="#0284c7" />
          <span>{isEs ? 'Protocolo ETERNA en 4 Pasos' : '4-Step ETERNA Protocol'}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {[
            {
              num: '01',
              title: isEs ? 'Recepción de Kit Estéril' : 'Sterile Kit Delivery',
              desc: isEs ? 'Tubo estabilizador de saliva + tarjeta DBS barcoded en sobre hermético.' : 'Saliva DNA stabilization tube + barcoded DBS card in hermetic pouch.'
            },
            {
              num: '02',
              title: isEs ? 'Toma Rápida No Invasiva' : 'Non-Invasive Sampling',
              desc: isEs ? 'Muestra de saliva y 4 gotas de sangre capilar. Sin agujas intravenosas.' : 'Saliva sample & 4 capillary blood drops. No intravenous needle required.'
            },
            {
              num: '03',
              title: isEs ? 'Envío DHL Express Directo' : 'Prepaid DHL Express Return',
              desc: isEs ? 'Courier prepagado directo a Eurofins Genomics en Munich (Alemania).' : 'Prepaid express courier directly to Eurofins Genomics center in Munich.'
            },
            {
              num: '04',
              title: isEs ? 'Dossier Genómico 700k SNPs' : '700k SNPs Genomic Dossier',
              desc: isEs ? 'Edad biológica por órganos, informe interactivo y pautas de optimización.' : 'Organ biological age, interactive online portal & personalized protocols.'
            }
          ].map((step, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                color: '#0284c7',
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {step.num}
              </span>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.25 }}>
                  {step.title}
                </div>
                <div style={{ fontSize: '0.71rem', color: '#64748b', marginTop: '2px', lineHeight: 1.4 }}>
                  {step.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </aside>
  );
}
