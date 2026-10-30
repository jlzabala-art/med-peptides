"use client";

import React, { useState } from 'react';
import {
  ShieldCheck,
  Award,
  Microscope,
  Copy,
  Check,
  Mail,
  FlaskConical
} from '@/lib/icons';
import { toast } from 'react-hot-toast';
import { triggerHaptic } from '../../utils/haptics';

export default function GenericCollectionSidebar({
  brandSlug = 'peptides',
  config,
  categories = [],
  selectedCategory = 'all',
  onSelectCategory = () => {},
  totalCount = 0,
  onOpenInquiry = null,
  activePriceTier = 'clinic',
  onSelectPriceTier = null
}) {
  const [copied, setCopied] = useState(false);
  const canonicalUrl = `https://www.atlashealth-services.com/collection/${brandSlug}`;

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
      toast.success('Collection link copied to clipboard ✓');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const isPeptides = brandSlug === 'peptides';
  const isHairTreatments = ['hair-treatments', 'hair-treatment', 'trichology', 'hair', 'trichotest'].includes(brandSlug);

  return (
    <aside
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        position: 'sticky',
        top: '90px'
      }}
    >
      {/* ── 1. Category Navigation Card (Primary Sidebar Filter) ── */}
      {categories.length > 0 && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.80rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isHairTreatments ? 'Secciones Capilares' : 'Categories'}
            </span>
            <span style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 600 }}>
              {totalCount} Total
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const accent = config?.accentColor || '#003666';
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

      {/* ── 2. B2B Pricing Profile Selector (Wholeseller +20% vs Clinic/Doctor +30% over Cost) ── */}
      {onSelectPriceTier && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.6rem' }}>
            Perfil de Tarifa B2B (Sobre Coste)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { id: 'wholesaler', label: 'Wholeseller (+20% s/ coste)', sub: 'Distribuidores & Mayoristas', color: '#c2410c', bg: '#fff7ed', border: '#fed7aa' },
              { id: 'clinic', label: 'Clínica / Médico (+30% s/ coste)', sub: 'Prescriptores & Clínicas Capilares', color: '#0d9488', bg: '#f0fdfa', border: '#99f6e4' },
              { id: 'cost', label: 'Precio de Coste (Base)', sub: 'Coste neto registrado', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' }
            ].map((tier) => {
              const isActive = activePriceTier === tier.id;
              return (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => onSelectPriceTier(tier.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: isActive ? `1.5px solid ${tier.color}` : '1px solid #e2e8f0',
                    background: isActive ? tier.bg : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '0.78rem', fontWeight: 750, color: isActive ? tier.color : '#1e293b' }}>
                    {tier.label}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                    {tier.sub}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 3. Quality & Accreditation Card (Only for Non-Hair or Clean Trichology Summary) ── */}
      {!isHairTreatments && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: isPeptides ? 'rgba(0, 54, 102, 0.1)' : 'rgba(2, 132, 199, 0.1)',
                color: isPeptides ? '#003666' : '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isPeptides ? <FlaskConical size={16} /> : <Microscope size={16} />}
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                {isPeptides ? 'Lotusland Analytical Hub' : 'TeleTest Reference Lab'}
              </div>
              <div style={{ fontSize: '0.70rem', color: '#64748b' }}>
                {isPeptides ? 'HPLC ≥99.0% · EU Lyophilization Hub' : 'ISO 17025 Accredited · E08750211'}
              </div>
            </div>
          </div>

          <p style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
            {isPeptides
              ? 'Monographs verified via High-Performance Liquid Chromatography (HPLC) and Mass Spectrometry (MS). Sourced and lyophilized under ISO 9001/cGMP conditions at the Lotusland Hub.'
              : 'European reference laboratory accredited by Generalitat de Catalunya and ISO 17025. Specializing in high-precision immunogenetics, celiac HLA, and ICP-MS/MS toxicology.'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#334155', fontWeight: 650 }}>
              <ShieldCheck size={13} color="#16a34a" />
              <span>{isPeptides ? 'Lot-Specific Certificate of Analysis (COA)' : 'FNMT Electronically Signed Lab Reports'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#334155', fontWeight: 650 }}>
              <Award size={13} color="#0284c7" />
              <span>{isPeptides ? 'Certified Reference Standard Monograph' : '36+ Elements ICP-MS/MS & HLA qPCR'}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. Institutional Inquiry & Share CTA ── */}
      <div
        style={{
          background: '#f8fafc',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        <button
          type="button"
          onClick={onOpenInquiry}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: '8px',
            background: config?.accentColor || '#003666',
            color: '#ffffff',
            border: 'none',
            fontSize: '0.80rem',
            fontWeight: 750,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
          }}
        >
          <Mail size={14} />
          <span>Institutional Inquiry / Quote</span>
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          style={{
            width: '100%',
            padding: '8px 14px',
            borderRadius: '8px',
            background: '#ffffff',
            color: '#334155',
            border: '1px solid #cbd5e1',
            fontSize: '0.76rem',
            fontWeight: 650,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          {copied ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
          <span>{copied ? 'Copied to Clipboard ✓' : 'Share Collection Link'}</span>
        </button>
      </div>
    </aside>
  );
}
