"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Award,
  Sparkles,
  Droplets,
  Shield,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  Calculator,
  Calendar,
  Layers,
  FileText,
  Clock,
  FlaskConical,
  MessageSquare
} from '@/lib/icons';
import { toast } from 'react-hot-toast';
import { triggerHaptic } from '../../utils/haptics';

export default function ColwayCollectionSidebar({
  lang = 'en',
  onOpenInquiry = null,
  onOpenAi = null,
  selectedCategory = 'all',
  onSelectCategory = null,
  onSearchKeyword = null
}) {
  const isEs = lang === 'es';
  const [copied, setCopied] = useState(false);
  const [calcDuration, setCalcDuration] = useState('3m'); // '1m' | '3m'
  const [activeProtocolId, setActiveProtocolId] = useState(null);

  const canonicalUrl = 'https://atlashealth-services.com/collection/colway';

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
      toast.success(isEs ? 'Enlace canónico Colway copiado ✓' : 'Canonical Colway link copied ✓');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  // Protocols available in Colway
  const protocols = [
    {
      id: 'dermo-renewal',
      title: isEs ? 'Ritual Dermo-Renovación' : 'Dermo-Renewal Ritual',
      badge: isEs ? 'Facial & Escote' : 'Facial & Neck',
      desc: isEs ? 'Blue Diamond Cream + Peeling + Gel Colágeno' : 'Blue Diamond Cream + Peeling + Wash Gel',
      category: 'skincare',
      search: 'Blue Diamond'
    },
    {
      id: 'hair-restoration',
      title: isEs ? 'Restauración Folicular Anti-DHT' : 'Anti-DHT Hair Restoration',
      badge: isEs ? 'Tricología Médica' : 'Trichology',
      desc: isEs ? 'Szampon + Odżywka + Colvita (60/120 cap)' : 'Strengthening Shampoo + Conditioner + Colvita',
      category: 'hair',
      search: 'Strengthening'
    },
    {
      id: 'nutricosmetic-deep',
      title: isEs ? 'Matriz Extracelular & Longevidad' : 'Extracellular Matrix & Longevity',
      badge: isEs ? 'Nutricosmética' : 'Nutricosmetic',
      desc: isEs ? 'Colvita Colágeno Liofilizado + Vege Kolagen' : 'Colvita Lyophilized Collagen + Vege Collagen',
      category: 'anti-aging',
      search: 'Colvita'
    }
  ];

  const handleSelectProtocol = (proto) => {
    triggerHaptic('selection');
    setActiveProtocolId(proto.id);
    if (onSelectCategory && proto.category) {
      onSelectCategory(proto.category);
    }
    if (onSearchKeyword && proto.search) {
      onSearchKeyword(proto.search);
    }
    toast.success(isEs ? `Filtro aplicado: ${proto.title}` : `Filter applied: ${proto.title}`);
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
              Colway Official
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
              CPNP / EU 1223
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

      {/* ── 2. Interactive Clinical Protocol Selector (Directly filters catalog) ── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        padding: '1.25rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h5 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {isEs ? 'Protocolos Clínicos Colway' : 'Clinical Protocols'}
          </h5>
          {activeProtocolId && (
            <button
              type="button"
              onClick={() => {
                setActiveProtocolId(null);
                if (onSelectCategory) onSelectCategory('all');
                if (onSearchKeyword) onSearchKeyword('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#0d9488',
                fontSize: '0.70rem',
                fontWeight: 700,
                cursor: 'pointer',
                padding: 0
              }}
            >
              {isEs ? 'Restablecer' : 'Reset'}
            </button>
          )}
        </div>

        <p style={{ fontSize: '0.74rem', color: '#64748b', lineHeight: 1.4, margin: '0 0 10px 0' }}>
          {isEs ? 'Haz clic para filtrar el catálogo según el objetivo de tu paciente:' : 'Click to filter catalog by patient treatment objective:'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {protocols.map((proto) => {
            const isSelected = activeProtocolId === proto.id;
            return (
              <div
                key={proto.id}
                onClick={() => handleSelectProtocol(proto)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: isSelected ? '1.5px solid #0d9488' : '1px solid #f1f5f9',
                  background: isSelected ? '#f0fdfa' : '#f8fafc',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: isSelected ? '#0d9488' : '#0f172a' }}>
                    {proto.title}
                  </div>
                  <span style={{
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    color: '#64748b',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    padding: '1px 5px'
                  }}>
                    {proto.badge}
                  </span>
                </div>
                <div style={{ fontSize: '0.69rem', color: '#64748b', lineHeight: 1.3 }}>
                  {proto.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. Treatment Duration & Dispensing Calculator (1 Month vs 3 Months) ── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        padding: '1.25rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Calculator size={16} color="#0d9488" />
          <h5 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {isEs ? 'Calculadora de Dispensación' : 'Dispensing Calculator'}
          </h5>
        </div>

        {/* Duration Segmented Toggle */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4px',
          background: '#f1f5f9',
          padding: '3px',
          borderRadius: '8px',
          marginBottom: '12px'
        }}>
          <button
            type="button"
            onClick={() => setCalcDuration('1m')}
            style={{
              padding: '6px',
              borderRadius: '6px',
              border: 'none',
              background: calcDuration === '1m' ? '#ffffff' : 'transparent',
              color: calcDuration === '1m' ? '#0f172a' : '#64748b',
              fontSize: '0.74rem',
              fontWeight: calcDuration === '1m' ? 700 : 500,
              cursor: 'pointer',
              boxShadow: calcDuration === '1m' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            {isEs ? '1 Mes (Inducción)' : '1 Month (Induction)'}
          </button>
          <button
            type="button"
            onClick={() => setCalcDuration('3m')}
            style={{
              padding: '6px',
              borderRadius: '6px',
              border: 'none',
              background: calcDuration === '3m' ? '#ffffff' : 'transparent',
              color: calcDuration === '3m' ? '#0f172a' : '#64748b',
              fontSize: '0.74rem',
              fontWeight: calcDuration === '3m' ? 700 : 500,
              cursor: 'pointer',
              boxShadow: calcDuration === '3m' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            {isEs ? '3 Meses (Consolidación)' : '3 Months (Clinical Cycle)'}
          </button>
        </div>

        {/* Calculated Units breakdown */}
        <div style={{
          background: '#f8fafc',
          borderRadius: '8px',
          padding: '10px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          fontSize: '0.74rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
            <span>{isEs ? 'Colvita (Cápsulas Orales):' : 'Colvita (Oral Capsules):'}</span>
            <strong style={{ color: '#0f172a' }}>{calcDuration === '1m' ? '1x 60 cápsulas' : '1x 120 + 1x 60 cápsulas'}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
            <span>{isEs ? 'Tópico Folicular / Facial:' : 'Topical Facial/Follicular:'}</span>
            <strong style={{ color: '#0f172a' }}>{calcDuration === '1m' ? '1 Frasco (200 mL / 50 mL)' : '2 Frascos (Ciclo Completo)'}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', borderTop: '1px dashed #cbd5e1', paddingTop: '6px', marginTop: '2px' }}>
            <span style={{ fontWeight: 700, color: '#0d9488' }}>{isEs ? 'Dosis Recomendada:' : 'Posology:'}</span>
            <strong style={{ color: '#0d9488' }}>{calcDuration === '1m' ? '2 caps/día + 1 apl/noche' : '2 caps/día continuas'}</strong>
          </div>
        </div>
      </div>

      {/* ── 4. B2B Wholesale Pricing Link & Institutional Dossier ── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        padding: '1.25rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <h5 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {isEs ? 'Acceso B2B & Documentación' : 'B2B & Medical Documents'}
        </h5>

        <Link
          href="/pricing/colway"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            borderRadius: '8px',
            background: 'rgba(13, 148, 136, 0.08)',
            border: '1px solid rgba(13, 148, 136, 0.25)',
            color: '#0d9488',
            fontSize: '0.76rem',
            fontWeight: 700,
            textDecoration: 'none',
            transition: 'all 0.15s ease'
          }}
        >
          <span>{isEs ? 'Ver Baremo y Tarifas B2B' : 'View B2B Wholesale Pricing'}</span>
          <ArrowRight size={13} />
        </Link>

        {onOpenInquiry && (
          <button
            type="button"
            onClick={onOpenInquiry}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: '8px',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontSize: '0.76rem',
              fontWeight: 650,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <MessageSquare size={13} color="#64748b" />
              {isEs ? 'Consulta Médica de Clínica' : 'Clinic Inquiry Desk'}
            </span>
            <ChevronRight size={13} color="#94a3b8" />
          </button>
        )}
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
            <span>{isEs ? 'Copiar Enlace Oficial Colway®' : 'Share Canonical Colway® Link'}</span>
          </>
        )}
      </button>
    </aside>
  );
}
