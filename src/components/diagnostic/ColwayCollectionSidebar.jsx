"use client";

import React, { useState, useMemo } from 'react';
import {
  Award,
  Sparkles,
  Droplets,
  Shield,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Calculator,
  Calendar,
  Layers,
  FileText,
  Clock,
  FlaskConical,
  Zap,
  CheckCircle2,
  Dna,
  ShieldCheck,
  Package,
  Building2
} from '@/lib/icons';
import { toast } from 'react-hot-toast';
import { triggerHaptic } from '../../utils/haptics';

export default function ColwayCollectionSidebar({
  lang = 'en',
  onOpenInquiry = null,
  onOpenAi = null,
  selectedCategory = 'all',
  onSelectCategory = null,
  onSearchKeyword = null,
  products = [],
  activeProtocolId: externalActiveProtocolId = null,
  onSelectProtocol = null,
  activeSection = 'catalog',
  onSelectSection = null
}) {
  const isEs = false; // Force English — Spanish translations preserved for future i18n
  const [copied, setCopied] = useState(false);
  const [calcDuration, setCalcDuration] = useState('3m'); // '1m' | '3m'
  const [internalActiveProtocolId, setInternalActiveProtocolId] = useState(null);
  const activeProtocolId = externalActiveProtocolId !== null ? externalActiveProtocolId : internalActiveProtocolId;

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

  // Category definitions with GCP vertical navigation styling
  const categories = useMemo(() => [
    {
      id: 'all',
      label: isEs ? 'Todas las Formulaciones' : 'All Formulations',
      count: 9,
      icon: Layers
    },
    {
      id: 'epigenetic',
      label: isEs ? 'Epigenética & Diamante Azul' : 'Epigenetic & Blue Diamond',
      count: 2,
      icon: Sparkles
    },
    {
      id: 'native-dermal',
      label: isEs ? 'Dermo-Nativo & Barrera' : 'Native Dermal & Barrier',
      count: 3,
      icon: Droplets
    },
    {
      id: 'trichology',
      label: isEs ? 'Tricología Médica Capilar' : 'Trichology & Scalp System',
      count: 3,
      icon: Zap
    },
    {
      id: 'nutricosmetics',
      label: isEs ? 'Nutricosmética Celular Oral' : 'Inside-Out Nutricosmetics',
      count: 1,
      icon: FlaskConical
    },
    {
      id: 'bundles',
      label: isEs ? 'Kits & Protocolos Clínicos' : 'Clinical Protocol Bundles',
      count: 3,
      icon: Package
    }
  ], [isEs]);

  // Protocols available in Colway
  const protocols = [
    {
      id: 'epigenetic-ritual',
      slug: 'colway-dermo-renewal',
      title: isEs ? 'Ritual Epigenético Diamante Azul' : 'Blue Diamond Epigenetic Ritual',
      badge: isEs ? 'Epigenética Celular' : 'Epigenetic Cellular',
      desc: isEs ? 'Blue Diamond Peeling + Blue Diamond Cream + Colvita' : 'Blue Diamond Peeling + Cream + Colvita',
      category: 'epigenetic',
      search: 'Blue Diamond'
    },
    {
      id: 'hair-restoration',
      slug: 'colway-hair-restoration',
      title: isEs ? 'Restauración Folicular Anti-DHT' : 'Anti-DHT Hair Restoration',
      badge: isEs ? 'Tricología Médica' : 'Trichology',
      desc: isEs ? 'Champú Fortalecedor + Acondicionador + Colvita' : 'Strengthening Shampoo + Conditioner + Colvita',
      category: 'trichology',
      search: 'Strengthening'
    },
    {
      id: 'native-dermal',
      slug: 'colway-native-dermal',
      title: isEs ? 'Restauración Dérmica & Barrera' : 'Native Dermal & Barrier Recovery',
      badge: isEs ? 'Colágeno Nativo' : 'Native Collagen',
      desc: isEs ? 'Gel Limpiador Colágeno + Colágeno Vege + Bálsamo Labial' : 'Collagen Wash Gel + Collagen Vege + Lip Care',
      category: 'native-dermal',
      search: 'Vege'
    },
    {
      id: 'nutricosmetic-deep',
      slug: 'colway-nutricosmetic',
      title: isEs ? 'Matriz Extracelular Sistémica "Inside-Out"' : 'Inside-Out Systemic ECM Matrix',
      badge: isEs ? 'Nutricosmética Oral' : 'Oral Nutricosmetics',
      desc: isEs ? 'Colvita Tropocolágeno Liofilizado (60/120 caps)' : 'Colvita Lyophilized Tropocollagen (60/120 caps)',
      category: 'nutricosmetics',
      search: 'Colvita'
    }
  ];

  const handleSelectProtocol = (proto) => {
    triggerHaptic('selection');
    setInternalActiveProtocolId(proto.id);
    if (onSelectProtocol) {
      onSelectProtocol(proto);
    } else {
      if (onSelectCategory && proto.category) {
        onSelectCategory(proto.category);
      }
      if (onSearchKeyword && proto.search) {
        onSearchKeyword(proto.search);
      }
    }
    toast.success(isEs ? `Filtro aplicado: ${proto.title}` : `Filter applied: ${proto.title}`);
  };

  const scrollToSectionTop = () => {
    if (typeof window !== 'undefined') {
      const el = document.getElementById('colway-main-content');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 200, behavior: 'smooth' });
      }
    }
  };

  return (
    <aside className="gcp-collection-sidebar" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      position: 'sticky',
      top: '90px',
      gridColumn: '1',
      order: 1
    }}>
      {/* ── 1. THE 3 SCIENTIFIC PILLARS (Section 1 in Sidebar) ── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        padding: '1.15rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <Sparkles size={14} color="#0d9488" />
            <h5 style={{ fontSize: '0.76rem', fontWeight: 800, color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isEs ? 'Los 3 Pilares Científicos' : 'The 3 Scientific Pillars'}
            </h5>
          </div>
          <span style={{ fontSize: '0.66rem', color: '#0d9488', fontWeight: 700, background: '#f0fdfa', border: '1px solid #a7f3d0', padding: '1px 6px', borderRadius: '4px' }}>
            ISO 22716
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Pillar 01 */}
          <div style={{ padding: '8px 10px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0d9488', background: 'rgba(13, 148, 136, 0.1)', padding: '1px 5px', borderRadius: '4px' }}>01</span>
              <strong style={{ fontSize: '0.76rem', color: '#0f172a' }}>{isEs ? 'Triple Hélice 3D Intacta' : 'Intact 3D Triple Helix'}</strong>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#64748b', margin: 0, lineHeight: 1.35 }}>
              {isEs ? 'Tropocolágeno nativo biológicamente activo con 100% de afinidad y bioasimilación celular.' : 'Bioactive native freshwater tropocollagen preserving 3D tertiary structure with 100% human cellular affinity.'}
            </p>
          </div>

          {/* Pillar 02 */}
          <div style={{ padding: '8px 10px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0284c7', background: 'rgba(2, 132, 199, 0.1)', padding: '1px 5px', borderRadius: '4px' }}>02</span>
              <strong style={{ fontSize: '0.76rem', color: '#0f172a' }}>{isEs ? 'Neocolagénesis a 110 Días' : '110-Day Neocollagenesis'}</strong>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#64748b', margin: 0, lineHeight: 1.35 }}>
              {isEs ? 'Estudio ITA-TEST #B-89146: estimula fibroblastos dérmicos para reactivar síntesis de colágeno (+90% firmeza).' : 'ITA-TEST Warsaw study #B-89146: triggers dermal fibroblasts for endogenous neocollagenesis (+90% confirmed firming).'}
            </p>
          </div>

          {/* Pillar 03 */}
          <div style={{ padding: '8px 10px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#7c3aed', background: 'rgba(124, 58, 237, 0.1)', padding: '1px 5px', borderRadius: '4px' }}>03</span>
              <strong style={{ fontSize: '0.76rem', color: '#0f172a' }}>{isEs ? 'Liofilización Criogénica (-40°C)' : 'Sub-Zero Freeze-Drying (-40°C)'}</strong>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#64748b', margin: 0, lineHeight: 1.35 }}>
              {isEs ? 'Sublimación al vacío que preserva péptidos señal vivos en Colvita sin desnaturalización proteica.' : 'Cryogenic vacuum sublimation retaining living signal peptides in Colvita without denaturation, with Baltic Fucus & Vit E.'}
            </p>
          </div>
        </div>
      </div>

      {/* -- 2. CATEGORIAS & FORMULACIONES (Google Cloud Console Navigation Tree) -- */}
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        padding: '1.15rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
          <h5 style={{ fontSize: '0.74rem', fontWeight: 800, color: '#475569', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {isEs ? 'Categorías & Departamentos' : 'Departments & Categories'}
          </h5>
          <span style={{ fontSize: '0.68rem', color: '#0d9488', fontWeight: 700, background: '#f0fdfa', border: '1px solid #a7f3d0', padding: '1px 7px', borderRadius: '4px' }}>
            Colway®
          </span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {categories.map((cat) => {
            const isActive = activeSection === 'catalog' && selectedCategory === cat.id;
            const CatIcon = cat.icon || Layers;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  if (onSelectSection) onSelectSection('catalog');
                  if (onSelectCategory) onSelectCategory(cat.id);
                  scrollToSectionTop();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: isActive ? '1px solid #a7f3d0' : '1px solid transparent',
                  background: isActive ? '#f0fdfa' : 'transparent',
                  color: isActive ? '#0d9488' : '#334155',
                  fontSize: '0.80rem',
                  fontWeight: isActive ? 750 : 550,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.color = '#0f172a';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#334155';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
                  <CatIcon size={14} color={isActive ? '#0d9488' : '#64748b'} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {cat.label}
                  </span>
                </div>
                {cat.count != null && (
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '9999px',
                    background: isActive ? '#0d9488' : '#f1f5f9',
                    color: isActive ? '#ffffff' : '#64748b',
                    marginLeft: '6px',
                    flexShrink: 0
                  }}>
                    {cat.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* -- 2. ACREDITACION & CALIDAD EUROPEA (Laboratory / Biotech Standard) -- */}
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        padding: '1.25rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            background: 'rgba(13, 148, 136, 0.1)',
            color: '#0d9488',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Award size={18} />
          </div>
          <div>
            <h5 style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Colway® Biotechnology
            </h5>
            <span style={{ fontSize: '0.70rem', color: '#64748b' }}>
              Gdańsk, Poland · European Pioneers
            </span>
          </div>
        </div>

        <p style={{ fontSize: '0.76rem', color: '#475569', lineHeight: 1.5, margin: '0 0 0.85rem 0' }}>
          {isEs
            ? 'Extracción en frío de tropocolágeno nativo biológicamente activo con triple hélice 3D preservada. Certificación europea ISO 22716 y registro CPNP.'
            : 'Cold-extraction of biologically active native tropocollagen with intact 3D triple-helix conformation. Certified under ISO 22716 GMP & EU CPNP registered.'}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          <span style={{ fontSize: '0.66rem', fontWeight: 700, padding: '2px 7px', borderRadius: '4px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
            ISO 22716 GMP
          </span>
          <span style={{ fontSize: '0.66rem', fontWeight: 700, padding: '2px 7px', borderRadius: '4px', background: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd' }}>
            EU CPNP Verified
          </span>
          <span style={{ fontSize: '0.66rem', fontWeight: 700, padding: '2px 7px', borderRadius: '4px', background: '#faf5ff', color: '#7c3aed', border: '1px solid #e9d5ff' }}>
            100% Bioactive
          </span>
        </div>
      </div>
    </aside>
  );
}


