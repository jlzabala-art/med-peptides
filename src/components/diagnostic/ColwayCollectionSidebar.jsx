"use client";

import React, { useState, useMemo } from 'react';
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
  MessageSquare,
  Zap,
  CheckCircle2,
  Dna,
  ShieldCheck,
  Boxes
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
  products = []
}) {
  const isEs = false; // Force English — Spanish translations preserved for future i18n
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
      icon: Boxes
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
      {/* ── 1. CATEGORÍAS & FORMULACIONES (Google Cloud Console Navigation Tree) ── */}
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
            const isActive = selectedCategory === cat.id;
            const CatIcon = cat.icon || Layers;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  if (onSelectCategory) onSelectCategory(cat.id);
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

      {/* ── 2. ¿POR QUÉ EL COLÁGENO COLWAY ES DIFERENCIAL? (Biotecnología de Gdańsk & Calidad Clínica) ── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        padding: '1.25rem',
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
            <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
              {isEs ? 'Colágeno Diferencial Colway®' : 'The Colway® Bio-Collagen Advantage'}
            </h4>
            <span style={{ fontSize: '0.70rem', color: '#0d9488', fontWeight: 600 }}>
              {isEs ? 'Pioneros en Tropocolágeno Nativo (Gdańsk)' : 'Native Tropocollagen Pioneers (Gdańsk)'}
            </span>
          </div>
        </div>

        <p style={{ fontSize: '0.76rem', color: '#475569', lineHeight: 1.5, margin: '0 0 0.85rem 0' }}>
          {isEs
            ? 'A diferencia del 95% del colágeno comercial —que es gelatina desnaturalizada por calor y ácidos—, Colway aísla en frío tropocolágeno biológicamente activo conservando su triple hélice 3D intacta.'
            : 'Unlike 95% of commercial collagen —which is gelatin denatured by heat and acids—, Colway cold-extracts biologically active tropocollagen preserving its intact 3D triple-helix conformation.'}
        </p>

        {/* 4 Differential Value Anchors */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', background: '#f8fafc', padding: '8px 10px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
            <Dna size={14} color="#0d9488" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <strong style={{ fontSize: '0.74rem', color: '#0f172a', display: 'block' }}>
                {isEs ? 'Triple Hélice 3D Preservada' : 'Intact 3D Triple Helix'}
              </strong>
              <span style={{ fontSize: '0.70rem', color: '#64748b', lineHeight: 1.35, display: 'block' }}>
                {isEs ? 'Estructura terciaria molecular viva idéntica al pro-colágeno humano.' : 'Live molecular tertiary structure recognized as native human pro-collagen.'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', background: '#f8fafc', padding: '8px 10px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
            <Award size={14} color="#0284c7" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <strong style={{ fontSize: '0.74rem', color: '#0f172a', display: 'block' }}>
                {isEs ? 'Neocollagénesis Celular Real' : 'Real Cellular Neocollagenesis'}
              </strong>
              <span style={{ fontSize: '0.70rem', color: '#64748b', lineHeight: 1.35, display: 'block' }}>
                {isEs ? 'Estimula a los fibroblastos a sintetizar colágeno nuevo endógeno.' : 'Directly triggers dermal fibroblasts to synthesize new endogenous collagen.'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', background: '#f8fafc', padding: '8px 10px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
            <FlaskConical size={14} color="#7c3aed" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <strong style={{ fontSize: '0.74rem', color: '#0f172a', display: 'block' }}>
                {isEs ? 'Liofilización en Frío (Colvita)' : 'Cold Sublimation Freeze-Drying'}
              </strong>
              <span style={{ fontSize: '0.70rem', color: '#64748b', lineHeight: 1.35, display: 'block' }}>
                {isEs ? 'Secado al vacío bajo cero con microalgas Fucus y Vitamina E natural.' : 'Sub-zero vacuum sublimation retaining live bioactive peptides & Baltic Fucus.'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', background: '#f8fafc', padding: '8px 10px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
            <ShieldCheck size={14} color="#16a34a" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <strong style={{ fontSize: '0.74rem', color: '#0f172a', display: 'block' }}>
                {isEs ? 'Estándar Farmacéutico CPNP / EU 1223' : 'EU CPNP & ISO 22716 Certified'}
              </strong>
              <span style={{ fontSize: '0.70rem', color: '#64748b', lineHeight: 1.35, display: 'block' }}>
                {isEs ? 'Registro cosmético europeo, testado en humanos, 0% metales pesados.' : 'Official European cosmetic registration, human dermatologically tested.'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. FICHA TÉCNICA DINÁMICA SEGÚN LÍNEA SELECCIONADA (100% Verídica y Contextual) ── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        padding: '1.15rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <h5 style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {isEs ? 'Ficha Técnica de la Línea' : 'Line Technical Specifications'}
          </h5>
          <span style={{ fontSize: '0.65rem', color: '#0284c7', fontWeight: 700 }}>
            {selectedCategory === 'trichology'
              ? (isEs ? 'Tricología Capilar' : 'Trichology')
              : selectedCategory === 'epigenetic'
              ? (isEs ? 'Diamante Azul' : 'Blue Diamond')
              : selectedCategory === 'nutricosmetics'
              ? (isEs ? 'Nutricosmética' : 'Nutricosmetics')
              : (isEs ? 'Dermo-Nativo' : 'Native Dermal')}
          </span>
        </div>

        {selectedCategory === 'trichology' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: '#f8fafc', borderRadius: '10px', padding: '10px', border: '1px solid #f1f5f9' }}>
            <div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>{isEs ? 'Activo Folicular' : 'Active Follicular'}</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0d9488' }}>Baicapil™ 2%</div>
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>{isEs ? 'Inhibición DHT' : 'DHT Block'}</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0284c7' }}>{isEs ? 'Zinc PCA + Diosmina' : 'Zinc PCA + Diosmin'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>{isEs ? 'Anclaje Matriz' : 'Matrix Anchorage'}</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#16a34a' }}>{isEs ? 'Colágeno XVII' : 'Collagen XVII'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>{isEs ? 'Aplicación' : 'Application'}</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a' }}>{isEs ? '3-4x / semana' : '3–4x / week'}</div>
            </div>
          </div>
        ) : selectedCategory === 'epigenetic' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: '#f8fafc', borderRadius: '10px', padding: '10px', border: '1px solid #f1f5f9' }}>
            <div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>{isEs ? 'Tecnología' : 'Technology'}</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0d9488' }}>{isEs ? 'Péptidos VEP' : 'VEP Peptides'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>{isEs ? 'Vectorización' : 'Vectorization'}</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0284c7' }}>{isEs ? 'Diamante Coloidal' : 'Colloidal Diamond'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>{isEs ? 'Objetivo' : 'Target'}</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#16a34a' }}>{isEs ? 'Remodelación 3D' : '3D Remodeling'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>{isEs ? 'Penetración' : 'Penetration'}</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a' }}>{isEs ? 'Transdérmica 3x' : '3x Transdermal'}</div>
            </div>
          </div>
        ) : selectedCategory === 'nutricosmetics' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: '#f8fafc', borderRadius: '10px', padding: '10px', border: '1px solid #f1f5f9' }}>
            <div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>{isEs ? 'Forma Oral' : 'Oral Form'}</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0d9488' }}>{isEs ? 'Liofilizado 100%' : '100% Freeze-Dried'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>{isEs ? 'Sinergia Marina' : 'Marine Synergy'}</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0284c7' }}>Fucus vesiculosus</div>
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>{isEs ? 'Antioxidante' : 'Antioxidant'}</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#16a34a' }}>{isEs ? 'D-alfa-tocoferol' : 'D-alpha-tocopherol'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>{isEs ? 'Posología' : 'Dosage'}</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a' }}>{isEs ? '2 caps / día' : '2 caps / day'}</div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: '#f8fafc', borderRadius: '10px', padding: '10px', border: '1px solid #f1f5f9' }}>
            <div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>{isEs ? 'Tropocolágeno' : 'Tropocollagen'}</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0d9488' }}>{isEs ? 'Peces Agua Dulce' : 'Freshwater Fish'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>{isEs ? 'Estructura' : 'Structure'}</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0284c7' }}>{isEs ? 'Triple Hélice Nativa' : 'Native Triple-Helix'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>{isEs ? 'Barrera Cutánea' : 'Skin Barrier'}</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#16a34a' }}>{isEs ? 'Lípidos Fisiológicos' : 'Physiological Lipids'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>{isEs ? 'Pureza' : 'Purity'}</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a' }}>{isEs ? '0% Parabenos' : '0% Parabens'}</div>
            </div>
          </div>
        )}
      </div>

      {/* ── 4. PROTOCOLOS CLÍNICOS COLWAY (Interactive Protocol Selector) ── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        padding: '1.25rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <h5 style={{ fontSize: '0.80rem', fontWeight: 800, color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
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

        <p style={{ fontSize: '0.73rem', color: '#64748b', lineHeight: 1.4, margin: '0 0 10px 0' }}>
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
                  padding: '9px 11px',
                  borderRadius: '10px',
                  border: isSelected ? '1.5px solid #0d9488' : '1px solid #f1f5f9',
                  background: isSelected ? '#f0fdfa' : '#f8fafc',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <div style={{ fontSize: '0.76rem', fontWeight: 700, color: isSelected ? '#0d9488' : '#0f172a' }}>
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
                <div style={{ fontSize: '0.69rem', color: '#64748b', lineHeight: 1.3, marginBottom: '6px' }}>
                  {proto.desc}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingTop: '4px', borderTop: '1px dashed #e2e8f0' }}>
                  <Link
                    href={`/proto/${proto.slug}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: '#0d9488',
                      textDecoration: 'none',
                      background: 'rgba(13, 148, 136, 0.08)',
                      padding: '2px 8px',
                      borderRadius: '5px'
                    }}
                  >
                    <span>{isEs ? 'Ver Protocolo Clínico' : 'Open Protocol Dossier'}</span>
                    <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 5. CALCULADORA DE DISPENSACIÓN (1 Mes vs 3 Meses) ── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        padding: '1.25rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Calculator size={16} color="#0d9488" />
          <h5 style={{ fontSize: '0.80rem', fontWeight: 800, color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {isEs ? 'Calculadora de Ciclo Clínico' : 'Clinical Cycle Calculator'}
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
          marginBottom: '10px'
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
            <strong style={{ color: '#0f172a' }}>{calcDuration === '1m' ? (isEs ? '1x 60 cápsulas' : '1x 60 capsules') : (isEs ? '1x 120 + 1x 60 cápsulas' : '1x 120 + 1x 60 capsules')}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
            <span>{isEs ? 'Tópico Folicular / Facial:' : 'Topical Facial/Follicular:'}</span>
            <strong style={{ color: '#0f172a' }}>{calcDuration === '1m' ? (isEs ? '1 Frasco (200 mL / 50 mL)' : '1 Bottle (200 mL / 50 mL)') : (isEs ? '2 Frascos (Ciclo Completo)' : '2 Bottles (Full Cycle)')}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', borderTop: '1px dashed #cbd5e1', paddingTop: '6px', marginTop: '2px' }}>
            <span style={{ fontWeight: 700, color: '#0d9488' }}>{isEs ? 'Posología Recomendada:' : 'Recommended Posology:'}</span>
            <strong style={{ color: '#0d9488' }}>{calcDuration === '1m' ? (isEs ? '2 caps/día + 1 apl/noche' : '2 caps/day + 1 app/night') : (isEs ? '2 caps/día continuas' : '2 caps/day continuous')}</strong>
          </div>
        </div>
      </div>

      {/* ── 6. ACCESO B2B & BAREMO MAYORISTA ── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        padding: '1.15rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <h5 style={{ fontSize: '0.80rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
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

      {/* ── 7. COMPARTIR ENLACE OFICIAL ── */}
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
