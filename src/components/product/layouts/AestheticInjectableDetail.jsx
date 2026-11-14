"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Syringe, ShieldCheck, Sparkles, MapPin, Activity, Layers,
  Package, AlertTriangle, CheckCircle2, Info, ChevronRight,
  Microscope, Download, Share2, Lock, FlaskConical,
  Clock, Thermometer, ZoomIn, FileText, HeartPulse
} from 'lucide-react';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import PublicStickyActionBar from '@/components/shared/PublicStickyActionBar';
import PublicInstitutionalInquiryDrawer from '@/components/shared/PublicInstitutionalInquiryDrawer';
import ShareProductMonographDrawer from '@/components/admin/catalog/drawers/ShareProductMonographDrawer';
import PublicAtlasAIDrawer from '@/components/shared/PublicAtlasAIDrawer';
import ProductDetailSidebar from '@/components/product/ProductDetailSidebar';
import CopyableId from '@/components/ui/CopyableId';
import ImageModal from '@/snippets/ImageModal';
import {
  getInjectableMonograph,
  getInjectableImageUrl,
  getInjectableCollectionSiblings,
} from '@/data/aestheticInjectablesEnrichment';
import './AestheticInjectableDetail.css';

const CATEGORY_LABELS = {
  dermal_filler: { en: 'Dermal Filler', es: 'Relleno Dérmico', color: '#6d28d9' },
  skin_booster: { en: 'Skin Booster / Biorevitalizer', es: 'Skin Booster / Biorrevitalizante', color: '#0284c7' },
  biostimulator: { en: 'Collagen Biostimulator', es: 'Bioestimulador de Colágeno', color: '#0d9488' },
  hybrid_biostimulator: { en: 'Hybrid Biostimulator', es: 'Bioestimulador Híbrido', color: '#0f766e' },
  polynucleotide: { en: 'Polynucleotide (PN-HPT™)', es: 'Polinucleótido (PN-HPT™)', color: '#2563eb' },
  body_contouring: { en: 'Adipocytolytic / Contouring', es: 'Adipocitolítico / Contorno', color: '#d97706' },
};

function BrandedPackagingFallback({ brand, name, packSize, color = '#003666' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      gap: '10px',
      padding: '0.75rem',
      width: '100%',
    }}>
      <div style={{
        width: 64,
        height: 64,
        borderRadius: '16px',
        background: `linear-gradient(135deg, ${color}18 0%, ${color}30 100%)`,
        border: `1.5px solid ${color}40`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Syringe size={30} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '0.68rem', fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {brand || 'Aesthetic Medical Device'}
        </div>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', marginTop: '2px', lineHeight: 1.25 }}>
          {name}
        </div>
        {packSize && (
          <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '4px' }}>
            {packSize}
          </div>
        )}
      </div>
    </div>
  );
}

function SpecKeyValueList({ rows = [] }) {
  return (
    <dl style={{ margin: 0, display: 'flex', flexDirection: 'column' }}>
      {rows.map((row, idx) => (
        <div
          key={idx}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '1rem',
            padding: '0.65rem 0',
            borderBottom: idx < rows.length - 1 ? '1px solid #f1f5f9' : 'none',
          }}
        >
          <dt style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', flex: '0 0 42%' }}>
            {row.label}
          </dt>
          <dd style={{ margin: 0, fontSize: '0.83rem', fontWeight: 600, color: '#0f172a', textAlign: 'right', flex: 1 }}>
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default function AestheticInjectableDetail({
  product = {},
  slug: propSlug,
  baseUrl = 'https://www.atlashealth-services.com',
  isQuickView = false,
}) {
  const [lang, setLang] = useState('en');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'protocol' | 'safety' | 'regulatory'
  const [isInquiryDrawerOpen, setIsInquiryDrawerOpen] = useState(false);
  const [isShareDrawerOpen, setIsShareDrawerOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const isEs = lang === 'es';
  const effectiveSlug = propSlug || product?.slug || product?.id || 'juvederm-ultra-2';

  const monograph = useMemo(() => {
    return getInjectableMonograph(effectiveSlug, product) || {};
  }, [effectiveSlug, product]);

  const imageUrl = useMemo(() => {
    return getInjectableImageUrl(effectiveSlug, product);
  }, [effectiveSlug, product]);

  // Merge authoritative monograph with Firestore product record
  const p = useMemo(() => {
    const name = monograph.canonicalName || product?.name || product?.canonicalName || effectiveSlug;
    const brand = monograph.brand || product?.brand || 'Clinical Aesthetics';
    const manufacturer = monograph.manufacturer || product?.manufacturer || brand;
    const originCountry = monograph.originCountry || 'EU / International';
    const categoryType = monograph.categoryType || product?.category || 'dermal_filler';
    const catMeta = CATEGORY_LABELS[categoryType] || CATEGORY_LABELS.dermal_filler;

    return {
      id: product?.id || effectiveSlug,
      slug: effectiveSlug,
      name,
      brand,
      manufacturer,
      originCountry,
      categoryType,
      catMeta,
      subcategory: monograph.subcategory || product?.subcategory || catMeta.en,
      atlasCode: product?.atlas_product_code || monograph.atlasCode || 'ATLAS-AI',
      platformTechnology: monograph.platformTechnology || product?.technology || product?.product_type || 'Crosslinked Dermal Matrix',
      activeIngredient: monograph.activeIngredient || product?.active_ingredient || product?.technology || 'Hyaluronic Acid Formulation',
      crosslinkingAgent: monograph.crosslinkingAgent || 'Medical-Grade Crosslinked / Biocompatible Matrix',
      lidocaine: monograph.lidocaine || 'Refer to manufacturer IFU',
      packSize: monograph.packSize || product?.packSize || 'Standard Clinical Pack',
      needlesIncluded: monograph.needlesIncluded || 'Sterile Single-Use Needles (see IFU)',
      injectionDepth: monograph.injectionDepth || 'Mid-to-Deep Dermis / Subcutaneous',
      injectionTechnique: monograph.injectionTechnique || 'Linear retrograde threading, fanning, or bolus',
      longevity: monograph.longevity || '9 – 12 Months',
      rheology: monograph.rheology || product?.rheology || {
        elasticityGPrime: 'Balanced Viscoelasticity',
        cohesivity: 'High Tissue Integration',
        swellingFactor: 'Low-to-Moderate',
        gelTexture: 'Smooth sterile injectable gel',
      },
      regulatory: monograph.regulatory || {
        ceMark: 'CE Marked Medical Device',
        classification: 'Class III Medical Device',
        reversible: categoryType === 'dermal_filler' || categoryType === 'skin_booster' ? 'Yes — Hyaluronidase Reversible' : 'Biodegradable',
        storage: '2°C – 25°C · Do not freeze · Protect from light',
      },
      clinicalOverview: (isEs ? monograph.clinicalOverview?.es : monograph.clinicalOverview?.en)
        || product?.description
        || `${name} by ${manufacturer} — professional ${catMeta.en.toLowerCase()} formulated for qualified aesthetic practitioners.`,
      mechanismOfAction: (isEs ? monograph.mechanismOfAction?.es : monograph.mechanismOfAction?.en)
        || product?.indication
        || 'Restores extracellular dermal matrix architecture, hydration, and soft-tissue contour.',
      indications: monograph.indications || (product?.indication ? [product.indication] : ['Facial soft-tissue augmentation and contour restoration']),
      treatmentAreas: monograph.treatmentAreas || product?.treatment_areas || ['Facial Aesthetics'],
      clinicalProtocol: monograph.clinicalProtocol || {
        dosingGuidance: 'Titrate volume according to anatomical defect and tissue plane.',
        touchUpInterval: 'Evaluate at 2–4 weeks; maintenance per clinical assessment.',
        postCare: [
          'Avoid touching or applying makeup to the treated zone for 12–24 hours',
          'Avoid strenuous exercise, saunas, and intense heat for 48 hours',
        ],
      },
      contraindications: monograph.contraindications || [
        'Known hypersensitivity to any formulation component',
        'Active skin infection or inflammation at the injection site',
        'Pregnancy or lactation',
      ],
      expectedReactions: monograph.expectedReactions || [
        'Transient erythema, mild localized edema, or tenderness (2–7 days)',
        'Minor pinpoint bruising at injection entry points',
      ],
      specialties: product?.specialties || ['Aesthetic Medicine', 'Dermatology', 'Plastic Surgery'],
    };
  }, [monograph, product, effectiveSlug, isEs]);

  const collectionSiblings = useMemo(
    () => getInjectableCollectionSiblings(effectiveSlug, p.brand),
    [effectiveSlug, p.brand]
  );

  const sidebarSections = useMemo(() => [
    {
      id: 'overview',
      title: isEs ? 'Resumen y Reología' : 'Overview & Rheology',
      icon: <Microscope size={15} />,
    },
    {
      id: 'protocol',
      title: isEs ? 'Indicaciones y Protocolo' : 'Indications & Protocol',
      icon: <Syringe size={15} />,
    },
    {
      id: 'safety',
      title: isEs ? 'Seguridad y Contraindicaciones' : 'Safety & Contraindications',
      icon: <HeartPulse size={15} />,
    },
    {
      id: 'regulatory',
      title: isEs ? 'Regulación y Trazabilidad' : 'Regulatory & Packaging',
      icon: <FileText size={15} />,
    },
  ], [isEs]);

  const activeSectionIndex = useMemo(
    () => Math.max(0, sidebarSections.findIndex((s) => s.id === activeTab)),
    [sidebarSections, activeTab]
  );

  return (
    <div className="ai-page-container">
      {!isQuickView && <PublicUnifiedHeader currentApp="services" />}

      {/* ── INSTITUTIONAL TRUST & REGULATORY BAR ── */}
      {!isQuickView && (
        <div className="ai-institutional-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className="ai-badge-pill ai-badge-ce">
              <ShieldCheck size={13} />
              <span>{p.regulatory.ceMark}</span>
            </span>
            <span className="ai-badge-pill ai-badge-device">
              <FlaskConical size={12} />
              <span>{p.regulatory.classification}</span>
            </span>
            <span className="ai-badge-pill ai-badge-pro">
              <Lock size={12} />
              <span>{isEs ? 'Uso Médico Profesional' : 'Licensed Practitioners Only'}</span>
            </span>
            <span style={{ fontSize: '0.73rem', color: '#64748b', fontWeight: 600 }}>
              {p.manufacturer} · {p.originCountry}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
              <button
                onClick={() => setLang('en')}
                style={{
                  padding: '4px 10px', fontSize: '0.72rem', fontWeight: 700, border: 'none', cursor: 'pointer',
                  backgroundColor: lang === 'en' ? '#003666' : '#ffffff',
                  color: lang === 'en' ? '#ffffff' : '#64748b',
                }}
              >
                EN
              </button>
              <button
                onClick={() => setLang('es')}
                style={{
                  padding: '4px 10px', fontSize: '0.72rem', fontWeight: 700, border: 'none', cursor: 'pointer',
                  backgroundColor: lang === 'es' ? '#003666' : '#ffffff',
                  color: lang === 'es' ? '#ffffff' : '#64748b',
                }}
              >
                ES
              </button>
            </div>

            <button
              onClick={() => setIsShareDrawerOpen(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1',
                borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700, color: '#334155', cursor: 'pointer',
              }}
            >
              <Share2 size={13} />
              <span>{isEs ? 'Compartir Ficha' : 'Share Monograph'}</span>
            </button>

            <button
              onClick={() => window.print()}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1',
                borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700, color: '#334155', cursor: 'pointer',
              }}
            >
              <Download size={13} />
              <span>PDF</span>
            </button>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <main className="ai-content-wrap">

        {/* Breadcrumb */}
        {!isQuickView && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: '#64748b', textDecoration: 'none' }}>Home</Link>
            <ChevronRight size={12} />
            <Link href="/collection/aesthetic-injectables" style={{ color: '#64748b', textDecoration: 'none' }}>
              {isEs ? 'Inyectables Estéticos' : 'Aesthetic Injectables'}
            </Link>
            <ChevronRight size={12} />
            <span style={{ color: '#475569', fontWeight: 600 }}>{p.brand}</span>
            <ChevronRight size={12} />
            <span style={{ color: '#003666', fontWeight: 700 }}>{p.name}</span>
          </div>
        )}

        {/* ── HERO PANORAMA CARD ── */}
        <section className="ai-hero-panorama">
          {/* 1. Product Visual */}
          <div
            className="ai-hero-image-box"
            style={{ cursor: imageUrl ? 'zoom-in' : 'default' }}
            onClick={() => { if (imageUrl) setIsImageModalOpen(true); }}
          >
            <span className="ai-code-badge">{p.atlasCode}</span>

            {imageUrl ? (
              <>
                <img src={imageUrl} alt={p.name} />
                <span style={{
                  position: 'absolute', top: '10px', right: '10px',
                  background: 'rgba(255,255,255,0.9)', border: '1px solid #cbd5e1',
                  borderRadius: '6px', padding: '3px 6px', display: 'flex', alignItems: 'center', gap: '4px',
                  fontSize: '0.65rem', fontWeight: 600, color: '#475569'
                }}>
                  <ZoomIn size={11} /> Zoom
                </span>
              </>
            ) : (
              <BrandedPackagingFallback
                brand={p.brand}
                name={p.name}
                packSize={p.packSize}
                color={p.catMeta.color}
              />
            )}

            <div className="ai-reversible-pill">
              {p.regulatory.reversible}
            </div>
          </div>

          {/* 2. Clinical Identity & GCP Key-Value Specs Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: p.catMeta.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {p.manufacturer} • {isEs ? p.catMeta.es : p.catMeta.en}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>•</span>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>{p.subcategory}</span>
              </div>

              <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 8px 0', lineHeight: 1.2 }}>
                {p.name}
              </h1>

              <p style={{ fontSize: '0.87rem', color: '#475569', lineHeight: 1.55, margin: 0 }}>
                {p.clinicalOverview}
              </p>
            </div>

            <div className="ai-kv-grid">
              <div className="ai-kv-item">
                <span className="ai-kv-label">{isEs ? 'Concentración Activa' : 'Active Formulation'}</span>
                <span className="ai-kv-value" style={{ color: '#003666' }}>{p.activeIngredient}</span>
              </div>
              <div className="ai-kv-item">
                <span className="ai-kv-label">{isEs ? 'Plataforma / Tecnología' : 'Platform Technology'}</span>
                <span className="ai-kv-value">{p.platformTechnology}</span>
              </div>
              <div className="ai-kv-item">
                <span className="ai-kv-label">{isEs ? 'Plano de Inyección' : 'Injection Plane'}</span>
                <span className="ai-kv-value">{p.injectionDepth}</span>
              </div>
              <div className="ai-kv-item">
                <span className="ai-kv-label">{isEs ? 'Aguja / Cánula' : 'Needle / Cannula'}</span>
                <span className="ai-kv-value">{p.needlesIncluded}</span>
              </div>
              <div className="ai-kv-item">
                <span className="ai-kv-label">{isEs ? 'Duración Clínica' : 'Clinical Longevity'}</span>
                <span className="ai-kv-value">{p.longevity}</span>
              </div>
              <div className="ai-kv-item">
                <span className="ai-kv-label">{isEs ? 'Presentación' : 'Pack Configuration'}</span>
                <span className="ai-kv-value">{p.packSize}</span>
              </div>
            </div>
          </div>

          {/* 3. B2B Institutional Inquiry & Action Card */}
          <aside className="ai-action-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {isEs ? 'Distribución Clínica B2B' : 'B2B Clinical Supply'}
              </span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '2px 8px', borderRadius: '999px',
                background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0',
                fontSize: '0.68rem', fontWeight: 700,
              }}>
                <CheckCircle2 size={11} /> {isEs ? 'Disponible' : 'Clinic Ready'}
              </span>
            </div>

            <div style={{ padding: '0.65rem 0.75rem', borderRadius: '8px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
                {isEs ? 'Cotización Institucional para Clínicas' : 'Institutional Clinic & Pharmacy Pricing'}
              </div>
              <div style={{ fontSize: '0.71rem', color: '#64748b', lineHeight: 1.4 }}>
                {isEs
                  ? 'Suministro verificado por lotes con trazabilidad completa para médicos y clínicas autorizadas.'
                  : 'Verified batch-traceable supply for licensed aesthetic clinics, physicians, and medical distributors.'}
              </div>
            </div>

            <button className="ai-btn-primary" onClick={() => setIsInquiryDrawerOpen(true)}>
              <Package size={15} />
              <span>{isEs ? 'Solicitar Cotización B2B' : 'Request Institutional Quote'}</span>
            </button>

            <button className="ai-btn-secondary" onClick={() => setIsAiDrawerOpen(true)}>
              <Sparkles size={14} color="#003666" />
              <span>{isEs ? 'Consultar a Atlas AI' : 'Ask Atlas Clinical AI'}</span>
            </button>

            <div style={{ fontSize: '0.69rem', color: '#64748b', lineHeight: 1.4, display: 'flex', alignItems: 'flex-start', gap: '6px', marginTop: '2px' }}>
              <ShieldCheck size={13} color="#047857" style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>
                {isEs
                  ? 'Venta exclusiva a profesionales sanitarios colegiados. No apto para venta directa al público.'
                  : 'Restricted to qualified healthcare practitioners. Not for direct-to-consumer sale.'}
              </span>
            </div>
          </aside>
        </section>

        {/* ── CLINICAL MONOGRAPH 2-COLUMN WORKSPACE (SIDEBAR + CONTENT) ── */}
        <div className="ai-monograph-layout">
          <aside className="ai-monograph-sidebar">
            <ProductDetailSidebar
              sections={sidebarSections}
              lang={lang}
              product={{ ...product, ...p }}
              slug={p.slug}
              activeSection={activeTab}
              onSelectSection={(id) => setActiveTab(id)}
              onOpenInquiry={() => setIsInquiryDrawerOpen(true)}
              hideFloatingTrigger={true}
              collectionSiblings={collectionSiblings}
              collectionName={p.brand}
              collectionHref="/collection/aesthetic-injectables"
            />
          </aside>

          <div className="ai-monograph-content">
            {/* ── TAB 1: OVERVIEW & RHEOLOGY ── */}
            {activeTab === 'overview' && (
          <div className="ai-section-grid">
            <div className="ai-card">
              <h2 className="ai-card-title">
                <Activity size={15} />
                <span>{isEs ? 'Mecanismo de Acción' : 'Mechanism of Action'}</span>
              </h2>
              <p style={{ fontSize: '0.87rem', color: '#334155', lineHeight: 1.6, margin: '0 0 1rem 0' }}>
                {p.mechanismOfAction}
              </p>

              <h3 style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.6rem 0' }}>
                {isEs ? 'Zonas Anatómicas Principales' : 'Primary Treatment Zones'}
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                {p.treatmentAreas.map((area, i) => (
                  <span key={i} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    padding: '4px 10px', borderRadius: '6px',
                    background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0',
                    fontSize: '0.75rem', fontWeight: 600,
                  }}>
                    <MapPin size={11} />
                    {area}
                  </span>
                ))}
              </div>
            </div>

            <div className="ai-card">
              <h2 className="ai-card-title">
                <Layers size={15} />
                <span>{isEs ? 'Perfil Reológico y Fisicoquímico' : 'Rheological & Physicochemical Profile'}</span>
              </h2>
              <SpecKeyValueList
                rows={[
                  { label: isEs ? 'Módulo Elástico (G′)' : 'Elastic Modulus (G′)', value: p.rheology.elasticityGPrime },
                  { label: isEs ? 'Cohesividad' : 'Cohesivity', value: p.rheology.cohesivity },
                  { label: isEs ? 'Factor de Hinchazón' : 'Swelling / Water Uptake', value: p.rheology.swellingFactor },
                  { label: isEs ? 'Textura del Gel / Matriz' : 'Gel / Matrix Architecture', value: p.rheology.gelTexture },
                  { label: isEs ? 'Agente Reticulante' : 'Crosslinking / Carrier', value: p.crosslinkingAgent },
                  { label: isEs ? 'Anestésico Local' : 'Lidocaine Content', value: p.lidocaine },
                ]}
              />
            </div>
          </div>
        )}

        {/* ── TAB 2: INDICATIONS & PROTOCOL ── */}
        {activeTab === 'protocol' && (
          <div className="ai-section-grid">
            <div className="ai-card">
              <h2 className="ai-card-title">
                <CheckCircle2 size={15} />
                <span>{isEs ? 'Indicaciones Clínicas Aprobadas' : 'Approved Clinical Indications'}</span>
              </h2>
              <ul className="ai-list">
                {p.indications.map((ind, idx) => (
                  <li key={idx}>{ind}</li>
                ))}
              </ul>

              <div style={{ marginTop: '1.25rem', padding: '0.9rem', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                  {isEs ? 'Técnica y Plano Recomendado' : 'Recommended Plane & Technique'}
                </div>
                <div style={{ fontSize: '0.84rem', color: '#1e293b', lineHeight: 1.5 }}>
                  <strong>{isEs ? 'Plano:' : 'Plane:'}</strong> {p.injectionDepth}<br />
                  <strong>{isEs ? 'Técnica:' : 'Technique:'}</strong> {p.injectionTechnique}<br />
                  <strong>{isEs ? 'Instrumental:' : 'Needle / Cannula:'}</strong> {p.needlesIncluded}
                </div>
              </div>
            </div>

            <div className="ai-card">
              <h2 className="ai-card-title">
                <Clock size={15} />
                <span>{isEs ? 'Pauta de Dosificación y Post-Cuidados' : 'Dosing Protocol & Post-Care'}</span>
              </h2>

              {p.clinicalProtocol.preparation && (
                <div style={{ marginBottom: '1rem', padding: '0.85rem', borderRadius: '8px', background: '#eff6ff', border: '1px solid #bfdbfe', fontSize: '0.82rem', color: '#1e3a8a', lineHeight: 1.5 }}>
                  <strong>{isEs ? 'Preparación / Reconstitución:' : 'Preparation / Reconstitution:'}</strong> {p.clinicalProtocol.preparation}
                </div>
              )}

              <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.55, marginBottom: '1rem' }}>
                <div style={{ marginBottom: '6px' }}>
                  <strong>{isEs ? 'Guía de Volumen:' : 'Session Volume:'}</strong> {p.clinicalProtocol.dosingGuidance}
                </div>
                <div>
                  <strong>{isEs ? 'Revisión / Mantenimiento:' : 'Follow-Up & Maintenance:'}</strong> {p.clinicalProtocol.touchUpInterval}
                </div>
              </div>

              <h3 style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.5rem 0' }}>
                {isEs ? 'Instrucciones Post-Tratamiento' : 'Post-Procedure Patient Care'}
              </h3>
              <ul className="ai-list">
                {(p.clinicalProtocol.postCare || []).map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ── TAB 3: SAFETY & CONTRAINDICATIONS ── */}
        {activeTab === 'safety' && (
          <div className="ai-section-grid">
            <div className="ai-card ai-card-full" style={{ background: '#fef9c3', borderColor: '#fde047' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <AlertTriangle size={20} color="#ca8a04" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h2 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: 800, color: '#854d0e' }}>
                    {isEs ? 'Advertencia de Seguridad Vascular y Administración Profesional' : 'Vascular Safety & Professional Administration Notice'}
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.83rem', color: '#92400e', lineHeight: 1.5 }}>
                    {isEs
                      ? 'La inyección intravascular accidental puede provocar isquemia tisular, necrosis o complicaciones oculares. Verifique siempre el plano anatómico, aspire cuando corresponda, inyecte lentamente con mínima presión y mantenga hialuronidasa disponible en clínica para rellenos de ácido hialurónico.'
                      : 'Inadvertent intravascular injection may lead to vascular occlusion, tissue ischemia, necrosis, or visual compromise. Always verify anatomical depth, inject slowly under minimal pressure, and maintain an emergency hyaluronidase protocol on site for hyaluronic acid formulations.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="ai-card">
              <h2 className="ai-card-title">
                <AlertTriangle size={15} color="#dc2626" />
                <span>{isEs ? 'Contraindicaciones Principales' : 'Contraindications'}</span>
              </h2>
              <ul className="ai-list">
                {p.contraindications.map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            </div>

            <div className="ai-card">
              <h2 className="ai-card-title">
                <Info size={15} />
                <span>{isEs ? 'Reacciones Esperadas y Reversibilidad' : 'Expected Reactions & Reversibility'}</span>
              </h2>
              <ul className="ai-list" style={{ marginBottom: '1rem' }}>
                {p.expectedReactions.map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
              <div style={{ padding: '0.75rem', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.82rem', color: '#1e293b' }}>
                <strong>{isEs ? 'Reversibilidad:' : 'Reversibility:'}</strong> {p.regulatory.reversible}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: REGULATORY & PACKAGING ── */}
        {activeTab === 'regulatory' && (
          <div className="ai-section-grid">
            <div className="ai-card">
              <h2 className="ai-card-title">
                <ShieldCheck size={15} />
                <span>{isEs ? 'Clasificación Regulatoria y Conservación' : 'Regulatory Status & Storage'}</span>
              </h2>
              <SpecKeyValueList
                rows={[
                  { label: isEs ? 'Marcado / Aprobación' : 'Regulatory Mark', value: p.regulatory.ceMark },
                  { label: isEs ? 'Clasificación' : 'Device Classification', value: p.regulatory.classification },
                  { label: isEs ? 'Fabricante' : 'Manufacturer', value: `${p.manufacturer} (${p.originCountry})` },
                  {
                    label: isEs ? 'Conservación' : 'Storage Conditions',
                    value: (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <Thermometer size={13} color="#0284c7" />
                        {p.regulatory.storage}
                      </span>
                    ),
                  },
                ]}
              />
            </div>

            <div className="ai-card">
              <h2 className="ai-card-title">
                <Package size={15} />
                <span>{isEs ? 'Contenido del Envase y Trazabilidad' : 'Packaging & Batch Traceability'}</span>
              </h2>
              <SpecKeyValueList
                rows={[
                  { label: isEs ? 'Presentación' : 'Pack Contents', value: p.packSize },
                  { label: isEs ? 'Agujas Incluidas' : 'Needles / Delivery', value: p.needlesIncluded },
                  { label: isEs ? 'Código Atlas' : 'Atlas SKU Code', value: <CopyableId value={p.atlasCode} /> },
                  { label: isEs ? 'Identificador URL' : 'Catalog Slug', value: <CopyableId value={p.slug} /> },
                ]}
              />
            </div>
          </div>
        )}
          </div>
        </div>
      </main>

      {!isQuickView && <PublicUnifiedFooter />}

      {!isQuickView && (
        <PublicStickyActionBar
          title={p.name}
          subtitle={`${p.brand} · ${p.activeIngredient}`}
          badge={p.regulatory.ceMark}
          badgeType="verified"
          inquireLabel={isEs ? 'Solicitar Cotización' : 'Request Quote'}
          onInquire={() => setIsInquiryDrawerOpen(true)}
          showClinicalAI={true}
          onOpenClinicalAI={() => setIsAiDrawerOpen(true)}
          mountAiDrawer={false}
          aiCategory="aesthetic_injectable"
          aiContextQuery={`Clinical consultation for ${p.name} (${p.brand}, ${p.activeIngredient}, ${p.platformTechnology}). Injection plane: ${p.injectionDepth}. Rheology G': ${p.rheology.elasticityGPrime}.`}
          aiMeta={{
            slug: p.slug,
            brand: p.brand,
            activeIngredient: p.activeIngredient,
            platformTechnology: p.platformTechnology,
            injectionDepth: p.injectionDepth,
            needlesIncluded: p.needlesIncluded,
            longevity: p.longevity,
            ceMark: p.regulatory.ceMark,
          }}
          lang={lang}
          showSections={true}
          sectionsCount={sidebarSections.length}
          activeSectionIndex={activeSectionIndex}
          overflowMobile={true}
        />
      )}

      {/* ── DRAWERS & MODALS ── */}
      <PublicInstitutionalInquiryDrawer
        isOpen={isInquiryDrawerOpen}
        onClose={() => setIsInquiryDrawerOpen(false)}
        contextType="product"
        brandType="aesthetic_injectable"
        lang={lang}
        initialEntity={{
          name: p.name,
          slug: p.slug,
          code: p.atlasCode,
          strength: p.activeIngredient,
          category: `Aesthetic Injectables · ${p.catMeta.en}`,
          brand: p.brand,
          supplier: p.manufacturer,
          inquiryGoal: 'clinic_aesthetic_supply',
        }}
      />

      <ShareProductMonographDrawer
        isOpen={isShareDrawerOpen}
        onClose={() => setIsShareDrawerOpen(false)}
        product={{
          id: p.id,
          name: p.name,
          brand: p.brand,
          category: 'Aesthetic Injectables',
        }}
        shareUrl={`${baseUrl}/p/${p.slug}`}
      />

      {isAiDrawerOpen && (
        <PublicAtlasAIDrawer
          product={{ ...product, ...p }}
          isOpen={isAiDrawerOpen}
          onClose={() => setIsAiDrawerOpen(false)}
          context="aesthetic_injectable"
        />
      )}

      {isImageModalOpen && imageUrl && (
        <ImageModal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          src={imageUrl}
          alt={p.name}
        />
      )}
    </div>
  );
}
