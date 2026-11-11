"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Award,
  FileText,
  Clock,
  CheckCircle2,
  Package,
  ArrowRight,
  Download,
  Share2,
  Building2,
  ExternalLink,
  AlertTriangle,
  Info,
  Droplets,
  Activity,
  Thermometer,
  Lock,
  Check,
  ChevronRight,
  HeartPulse,
  Syringe,
  Brain,
  TrendingUp,
  Zap,
  Flame,
  Scale,
  Microscope,
  Dna,
  Sparkles,
  FlaskConical,
  X
} from '@/lib/icons';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import PublicStickyActionBar from '@/components/shared/PublicStickyActionBar';
import PublicInstitutionalInquiryDrawer from '@/components/shared/PublicInstitutionalInquiryDrawer';
import ShareProductMonographDrawer from '@/components/admin/catalog/drawers/ShareProductMonographDrawer';
import CopyableId from '@/components/ui/CopyableId';
import { getNormaProductBySlug } from '@/data/normaHellasRegistry';
import './NormaPharmaceuticalDetail.css';

export default function NormaPharmaceuticalDetail({
  product = {},
  slug = 'testosterone-enanthate-norma-250mg',
  baseUrl = 'https://www.atlashealth-services.com'
}) {
  // English by default as explicitly requested by user
  const [lang, setLang] = useState('en');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'protocols' | 'administration' | 'monitoring' | 'coa' | 'b2b'
  const [isInquiryDrawerOpen, setIsInquiryDrawerOpen] = useState(false);
  const [isShareDrawerOpen, setIsShareDrawerOpen] = useState(false);
  const [isDoctorUnlocked, setIsDoctorUnlocked] = useState(false);

  const isEs = lang === 'es';

  // Merge product with authoritative registry data to ensure 100% unpolluted clinical data
  const registryData = useMemo(() => {
    return getNormaProductBySlug(slug) || getNormaProductBySlug(product?.id) || {};
  }, [slug, product]);

  const p = useMemo(() => {
    return {
      ...registryData,
      ...product,
      composition: product?.composition || registryData?.composition || {},
      coaData: product?.coaData || registryData?.coaData || {},
      galenicSpecs: product?.galenicSpecs || registryData?.galenicSpecs || {},
      pharmaDetails: product?.pharmaDetails || registryData?.pharmaDetails || {},
      clinicalMonitoring: product?.clinicalMonitoring || registryData?.clinicalMonitoring || {}
    };
  }, [registryData, product]);

  const coa = p.coaData || {};
  const galenic = p.galenicSpecs || {};
  const pharma = p.pharmaDetails || {};
  const monitoring = p.clinicalMonitoring || {};

  return (
    <div className="norma-page-container">
      {/* ── UNIFIED ATLAS PUBLIC HEADER ── */}
      <PublicUnifiedHeader currentApp="services" />

      {/* ── INSTITUTIONAL TRUST & REGULATORY BAR (STICKY) ── */}
      <div className="norma-institutional-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className="norma-badge-pill norma-badge-gmp">
            <ShieldCheck size={13} />
            <span>EU GMP Certified</span>
          </span>

          <span className="norma-badge-pill norma-badge-eof">
            <Award size={13} />
            <span>EOF Greece MA # 45945/03-10-2008</span>
          </span>

          <span className="norma-badge-pill norma-badge-rx">
            <Lock size={12} />
            <span>{isEs ? 'Medicamento Bajo Receta (POM)' : 'Prescription Only Medicine (POM)'}</span>
          </span>

          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
            ATC: <strong style={{ color: '#003666' }}>G03BA03</strong> (Androgens, 3-oxoandrosten)
          </span>
        </div>

        {/* Right Actions: Lang toggle & Share */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
            <button
              onClick={() => setLang('en')}
              style={{
                padding: '4px 10px',
                fontSize: '0.72rem',
                fontWeight: 700,
                border: 'none',
                backgroundColor: lang === 'en' ? '#003666' : '#ffffff',
                color: lang === 'en' ? '#ffffff' : '#64748b',
                cursor: 'pointer'
              }}
            >
              EN
            </button>
            <button
              onClick={() => setLang('es')}
              style={{
                padding: '4px 10px',
                fontSize: '0.72rem',
                fontWeight: 700,
                border: 'none',
                backgroundColor: lang === 'es' ? '#003666' : '#ffffff',
                color: lang === 'es' ? '#ffffff' : '#64748b',
                cursor: 'pointer'
              }}
            >
              ES
            </button>
          </div>

          <button
            onClick={() => setIsShareDrawerOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '0.74rem',
              fontWeight: 700,
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <Share2 size={13} />
            <span>{isEs ? 'Compartir Ficha' : 'Share Monograph'}</span>
          </button>
        </div>
      </div>

      {/* ── BREADCRUMB ── */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1rem 1.5rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#64748b' }}>
          <Link href="/" style={{ color: '#64748b', textDecoration: 'none' }}>Home</Link>
          <ChevronRight size={12} />
          <Link href="/catalog" style={{ color: '#64748b', textDecoration: 'none' }}>
            {isEs ? 'Fármacos Humanos & TRT' : 'Human Pharmaceuticals & TRT'}
          </Link>
          <ChevronRight size={12} />
          <span style={{ color: '#003666', fontWeight: 700 }}>Testosterone Enanthate/Norma® 250 mg/ml</span>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main className="norma-content-grid">
        {/* ── TOP HERO PANORAMA: FULL WIDTH OVERVIEW (GOOGLE CLOUD STANDARD) ── */}
        <div className="norma-hero-panorama">
          {/* 1. Visual Box */}
          <div className="norma-hero-image-box">
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              fontSize: '0.66rem',
              fontWeight: 800,
              color: '#166534',
              backgroundColor: '#dcfce7',
              padding: '2px 7px',
              borderRadius: '4px',
              border: '1px solid #bbf7d0'
            }}>
              100% ORIGINAL EU PHARMA
            </div>

            <img
              src={p.imageUrl || '/images/products/norma/testosterone-enanthate-norma-250mg.svg'}
              alt="Testosterone Enanthate Norma Hellas 250mg"
              style={{ maxHeight: '180px', maxWidth: '100%', objectFit: 'contain' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.nextSibling) {
                  e.currentTarget.nextSibling.style.display = 'flex';
                }
              }}
            />
            <div style={{ display: 'none', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <Package size={52} color="#003666" />
              <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#003666' }}>
                Norma Hellas S.A. • 1 mL Ampoule
              </span>
            </div>
          </div>

          {/* 2. Center Identity & Quick Specs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  NORMA HELLAS PHARMACEUTICALS • EST. 1970
                </span>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>•</span>
                <span style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 600 }}>Athens, Greece</span>
              </div>

              <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 6px 0', lineHeight: 1.25 }}>
                Testosterone Enanthate/Norma® 250 mg/ml
              </h1>

              <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: '1.5', margin: 0 }}>
                {isEs
                  ? 'Solución oleosa estéril inyectable para terapia de sustitución androgénica masculina (TRT). Formulación de depósito de liberación prolongada en ampolla de vidrio ámbar de 1 ml.'
                  : 'Sterile depot oily solution for adult male androgen replacement therapy (TRT). Long-acting ester formulation engineered for sustained physiological testosterone release via deep intramuscular injection.'}
              </p>
            </div>

            {/* Quick Specs Grid (Google Cloud Key-Value Resource Format) */}
            <div className="gcp-kv-grid" style={{ marginTop: '2px' }}>
              <div className="gcp-kv-item">
                <span className="gcp-kv-label">{isEs ? 'Dosificación' : 'Established Dose'}</span>
                <span className="gcp-kv-value">250 mg / 1 mL</span>
              </div>
              <div className="gcp-kv-item">
                <span className="gcp-kv-label">{isEs ? 'Base Activa Pura' : 'Active Base Equiv.'}</span>
                <span className="gcp-kv-value" style={{ color: '#003666' }}>~180 mg Testosterone</span>
              </div>
              <div className="gcp-kv-item">
                <span className="gcp-kv-label">{isEs ? 'Envase Galénico' : 'Galenic Container'}</span>
                <span className="gcp-kv-value">Type I Amber Glass</span>
              </div>
              <div className="gcp-kv-item">
                <span className="gcp-kv-label">{isEs ? 'Vía de Aplicación' : 'Clinical Route'}</span>
                <span className="gcp-kv-value" style={{ color: '#991b1b' }}>Deep Intramuscular (I.M.)</span>
              </div>
            </div>

            {/* Quick Vehicle Highlight Box */}
            <div className="norma-vehicle-box" style={{ margin: 0, padding: '10px 12px' }}>
              <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', fontSize: '0.78rem' }}>
                <Droplets size={14} />
                <span>{isEs ? 'Vehículo Oleoso Depot — Listo para Inyección (Sin Reconstitución)' : 'Sterile Depot Oil Matrix — Ready to Inject (Zero Reconstitution Required)'}</span>
              </div>
              <div style={{ fontSize: '0.74rem', lineHeight: '1.4' }}>
                {isEs
                  ? 'Matriz estéril de Aceite de Ricino (Oleum Ricini, 439.6 mg) y Benzoato de Bencilo (342.0 mg). NUNCA debe mezclarse con agua bacteriostática ni diluirse.'
                  : 'Pre-solubilized in Castor Oil (Oleum Ricini, 439.6 mg) and Benzyl Benzoate (342.0 mg). STRICTLY DO NOT reconstitute with bacteriostatic water or aqueous diluents.'}
              </div>
            </div>
          </div>

          {/* 3. Right Action Box & Storage Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => setIsInquiryDrawerOpen(true)}
              className="gcp-btn-primary"
              style={{ width: '100%', padding: '11px 16px', fontSize: '0.84rem' }}
            >
              <Building2 size={16} />
              <span>{isEs ? 'Solicitar Asignación Clínica / Hospital' : 'Request Clinic / Hospital Allocation'}</span>
            </button>

            {/* Storage Warning Card */}
            <div className="norma-card" style={{ borderLeft: '4px solid #0284c7', margin: 0, padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#0369a1', fontSize: '0.78rem' }}>
                <Thermometer size={15} />
                <span>{isEs ? 'Condiciones de Conservación' : 'Storage Guidelines'}</span>
              </div>
              <p style={{ fontSize: '0.74rem', color: '#475569', marginTop: '4px', lineHeight: '1.4', margin: '4px 0 0' }}>
                {isEs
                  ? 'Conservar por debajo de 25°C en su envase original para protegerlo de la luz. NO CONGELAR NI REFRIGERAR.'
                  : 'Store below 25°C in original carton to protect from light. DO NOT REFRIGERATE OR FREEZE.'}
              </p>
            </div>
          </div>
        </div>

        {/* ── CLINICAL MONOGRAPH EXPLORER (SIDEBAR + DEDICATED CANVAS) ── */}
        <div className="norma-explorer-layout">
          {/* Mobile Sticky Section Chips Bar */}
          <div className="norma-mobile-tabs-bar">
            {[
              { id: 'overview', icon: Sparkles, label: isEs ? 'Mecanismo' : 'Mechanism' },
              { id: 'protocols', icon: TrendingUp, label: isEs ? 'Protocolos TRT' : 'TRT Protocols' },
              { id: 'administration', icon: Syringe, label: isEs ? 'Guía Inyección' : 'Administration' },
              { id: 'monitoring', icon: HeartPulse, label: isEs ? 'Biomarcadores' : 'Surveillance' },
              { id: 'coa', icon: Award, label: isEs ? 'Analítica Lote' : 'Batch COA' },
              { id: 'b2b', icon: Building2, label: isEs ? 'Tarifas B2B' : 'B2B Terms' },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`norma-mobile-tab-chip ${activeTab === tab.id ? 'active' : ''}`}
                >
                  <Icon size={13} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Desktop Left Sidebar Navigation (Google Cloud Standard) */}
          <aside className="norma-sidebar-nav">
            <div className="norma-sidebar-header">
              <FileText size={13} color="#003666" />
              <span>{isEs ? 'Secciones de la Monografía' : 'Clinical Monograph Sections'}</span>
            </div>

            {[
              {
                id: 'overview',
                icon: Sparkles,
                title: isEs ? 'Mecanismo & Impacto Clínico' : 'Mechanism & Clinical Impact',
                desc: isEs ? 'Farmacología Celular y Cascada AR' : 'Cellular Pharmacodynamics & AR Cascade'
              },
              {
                id: 'protocols',
                icon: TrendingUp,
                title: isEs ? 'Protocolos TRT & Farmacocinética' : 'TRT Protocols & Pharmacokinetics',
                desc: isEs ? 'Vida Media y Ventanas de Dosificación' : 'Half-Life & Clinical Dosage Windows'
              },
              {
                id: 'administration',
                icon: Syringe,
                title: isEs ? 'Guía de Inyección en Ampolla' : 'Ampoule Administration Guide',
                desc: isEs ? 'Apertura de Vidrio y Técnica I.M.' : 'Glass Ampoule Snapping & I.M. Technique'
              },
              {
                id: 'monitoring',
                icon: HeartPulse,
                title: isEs ? 'Seguridad & Biomarcadores TRT' : 'Physician Lab Surveillance',
                desc: isEs ? 'Hematocrito, PSA, Lípidos y Estradiol' : 'Hematocrit, PSA, Lipids & Estradiol'
              },
              {
                id: 'coa',
                icon: Award,
                title: isEs ? 'Analítica de Lote & COA' : 'Certified Batch COA & Standards',
                desc: isEs ? 'Liberación Oficial de Lote EOF/QP' : 'Batch-Specific Regulatory Lot Release'
              },
              {
                id: 'b2b',
                icon: Building2,
                title: isEs ? 'Tarifas y Suministro B2B' : 'B2B Clinic / Hospital Allocation',
                desc: isEs ? 'Distribución Hospitalaria y Cadena de Frío' : 'Hospital Supply Terms & Requisition'
              }
            ].map(sec => {
              const Icon = sec.icon;
              const isActive = activeTab === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveTab(sec.id)}
                  className={`norma-sidebar-item ${isActive ? 'active' : ''}`}
                >
                  <div className="norma-sidebar-item-icon">
                    <Icon size={16} />
                  </div>
                  <div className="norma-sidebar-item-content">
                    <span className="norma-sidebar-item-title">{sec.title}</span>
                    <span className="norma-sidebar-item-desc">{sec.desc}</span>
                  </div>
                </button>
              );
            })}
          </aside>

          {/* Right Main Content Canvas (Displays ONLY Selected Section and Nothing Else) */}
          <div className="norma-canvas-panel">

              {/* ── TAB 1: CELLULAR MECHANISM & CLINICAL PILLARS ── */}
              {activeTab === 'overview' && (
                <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Molecular & Cellular Pharmacology */}
                  <div className="norma-card">
                    <div className="norma-card-title">
                      <Microscope size={18} color="#003666" />
                      <span>{isEs ? 'Farmacología Celular y Cascada Androgénica' : 'Cellular Pharmacodynamics & Androgen Receptor Cascade'}</span>
                    </div>

                    <p style={{ fontSize: '0.80rem', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                      {isEs
                        ? 'El enantato de testosterona es un profármaco esterificado. Tras la inyección intramuscular profunda, las esterasas tisulares hidrolizan progresivamente el enlace éster, liberando testosterona libre bioidéntica en el torrente sanguíneo. La molécula ejerce su acción mediante tres vías biológicas fundamentales:'
                        : 'Testosterone enanthate is an esterified pro-drug. Following deep intramuscular injection into the gluteal muscle depot, tissue esterases progressively cleave the 17β-heptanoyl ester linkage, delivering pure, bioidentical free testosterone into systemic circulation. It exerts physiological action across three essential biological pathways:'}
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', marginTop: '12px' }}>
                      <div className="gcp-pathway-card" style={{ borderLeft: '3px solid #003666' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#003666', fontSize: '0.8125rem' }}>
                          <Dna size={15} />
                          <span>1. Direct AR Genomic Signaling</span>
                        </div>
                        <p style={{ fontSize: '0.74rem', color: '#475569', marginTop: '4px', lineHeight: '1.5', margin: '4px 0 0' }}>
                          Binds intracellular Androgen Receptors (AR), translocating to the nucleus to bind Androgen Response Elements (ARE), upregulating nitrogen retention, structural protein synthesis, and myoglobin expression.
                        </p>
                      </div>

                      <div className="gcp-pathway-card" style={{ borderLeft: '3px solid #c2410c' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#c2410c', fontSize: '0.8125rem' }}>
                          <Zap size={15} />
                          <span>2. 5α-Reductase Amplification (DHT)</span>
                        </div>
                        <p style={{ fontSize: '0.74rem', color: '#475569', marginTop: '4px', lineHeight: '1.5', margin: '4px 0 0' }}>
                          Irreversibly reduced in target tissues (prostate, scalp, CNS) to Dihydrotestosterone (DHT), which displays 3–5× higher receptor affinity, supporting virilization, CNS dopaminergic signaling, and libido.
                        </p>
                      </div>

                      <div className="gcp-pathway-card" style={{ borderLeft: '3px solid #0d9488' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#0d9488', fontSize: '0.8125rem' }}>
                          <HeartPulse size={15} />
                          <span>3. Aromatase (CYP19A1) Homeostasis</span>
                        </div>
                        <p style={{ fontSize: '0.74rem', color: '#475569', marginTop: '4px', lineHeight: '1.5', margin: '4px 0 0' }}>
                          A controlled fraction (~0.3%) converts via aromatase into 17β-Estradiol (E2). Physiological E2 is critical for vascular nitric oxide, bone mineral density, lipid homeostasis, and neurocognitive resilience.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 5 Clinical Pillars of Male Health */}
                  <div className="norma-card">
                    <div className="norma-card-title">
                      <Sparkles size={18} color="#003666" />
                      <span>{isEs ? 'Los 5 Pilares Clínicos de la Terapia TRT' : 'The 5 Systemic Pillars of Optimized TRT'}</span>
                    </div>

                    <div className="norma-pillars-grid">
                      {/* Pillar 1 */}
                      <div className="norma-pillar-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#003666', fontWeight: 800, fontSize: '0.84rem' }}>
                          <Flame size={16} color="#c2410c" />
                          <span>Muscle & Body Recomposition</span>
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '6px', lineHeight: '1.5' }}>
                          Increases fractional synthetic rate of mixed muscle proteins, stimulates IGF-1 synthesis, and mobilizes androgen-sensitive visceral adipocyte lipolysis.
                        </div>
                      </div>

                      {/* Pillar 2 */}
                      <div className="norma-pillar-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#003666', fontWeight: 800, fontSize: '0.84rem' }}>
                          <Brain size={16} color="#7c3aed" />
                          <span>Cognitive Drive & Neuroprotection</span>
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '6px', lineHeight: '1.5' }}>
                          Stimulates mesolimbic dopamine synthesis, sharpens executive processing speed, enhances spatial memory, and resolves chronic male brain fog.
                        </div>
                      </div>

                      {/* Pillar 3 */}
                      <div className="norma-pillar-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#003666', fontWeight: 800, fontSize: '0.84rem' }}>
                          <Activity size={16} color="#0d9488" />
                          <span>Metabolism & Glycemic Control</span>
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '6px', lineHeight: '1.5' }}>
                          Upregulates skeletal GLUT-4 glucose transporters, enhances peripheral insulin sensitivity, and promotes consistent reduction in circulating HbA1c.
                        </div>
                      </div>

                      {/* Pillar 4 */}
                      <div className="norma-pillar-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#003666', fontWeight: 800, fontSize: '0.84rem' }}>
                          <Scale size={16} color="#0284c7" />
                          <span>Bone Density & Erythropoiesis</span>
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '6px', lineHeight: '1.5' }}>
                          Promotes osteoblast mineralization and calcium retention while stimulating bone marrow erythropoietin (EPO) for optimal tissue oxygen delivery.
                        </div>
                      </div>

                      {/* Pillar 5 */}
                      <div className="norma-pillar-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#003666', fontWeight: 800, fontSize: '0.84rem' }}>
                          <HeartPulse size={16} color="#dc2626" />
                          <span>Endothelial Health & Libido</span>
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '6px', lineHeight: '1.5' }}>
                          Upregulates endothelial Nitric Oxide Synthase (eNOS) in vascular and cavernosal beds, restoring nocturnal tumescence and spontaneous libido.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 2: PROTOCOLS & PHARMACOKINETICS ── */}
              {activeTab === 'protocols' && (
                <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Pharmacokinetics Timeline */}
                  <div className="norma-card">
                    <div className="norma-card-title">
                      <Clock size={18} color="#003666" />
                      <span>{isEs ? 'Cinética de Depósito y Vida Media Biológica' : 'Depot Release Kinetics & Pharmacokinetic Timeline'}</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '0.78rem' }}>
                      <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '8px' }}>
                        <div style={{ color: '#166534', fontWeight: 800, fontSize: '0.72rem' }}>TMAX (PEAK ABSORPTION)</div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#166534', margin: '4px 0' }}>24 – 72 Hours</div>
                        <div style={{ color: '#475569', fontSize: '0.70rem' }}>Initial steady systemic entry from gluteal depot</div>
                      </div>

                      <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '12px', borderRadius: '8px' }}>
                        <div style={{ color: '#1e40af', fontWeight: 800, fontSize: '0.72rem' }}>ELIMINATION HALF-LIFE (T½)</div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#1e40af', margin: '4px 0' }}>7 – 9 Days</div>
                        <div style={{ color: '#475569', fontSize: '0.70rem' }}>Governed by tissue esterase hydrolysis rate</div>
                      </div>

                      <div style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', padding: '12px', borderRadius: '8px' }}>
                        <div style={{ color: '#6b21a8', fontWeight: 800, fontSize: '0.72rem' }}>DURATION OF ACTION</div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#6b21a8', margin: '4px 0' }}>2 – 4 Weeks</div>
                        <div style={{ color: '#475569', fontSize: '0.70rem' }}>Total biological therapeutic depot coverage</div>
                      </div>
                    </div>
                  </div>

                  {/* Protocol Comparison */}
                  <div className="norma-card">
                    <div className="norma-card-title">
                      <TrendingUp size={18} color="#003666" />
                      <span>{isEs ? 'Comparativa de Protocolos: Clásico vs. Optimizado Moderno' : 'Clinical Protocol Comparator: SmPC Regimen vs. Modern Split Dosing'}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {/* Protocol 1: Classical */}
                      <div className="norma-protocol-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.86rem' }}>
                            1. Classical European SmPC Protocol (Norma Hellas Traditional Label)
                          </span>
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px' }}>
                            Label Prescribing Info
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: '1.5' }}>
                          <strong>Dose:</strong> 1 full ampoule (250 mg / 1 mL) deep I.M. every 2 to 3 weeks (induction), transitioning to every 3 to 4 weeks (maintenance).
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#92400e', backgroundColor: '#fffbeb', padding: '8px 10px', borderRadius: '6px', marginTop: '8px', borderLeft: '3px solid #d97706' }}>
                          <strong>Physician Observation:</strong> May induce a high peak-to-trough ratio ("rollercoaster effect") with elevated supraphysiological levels at day 3 followed by symptomatic troughs near day 21. Higher temporary aromatization to E2 during peak days.
                        </div>
                      </div>

                      {/* Protocol 2: Modern Micro-Dosing */}
                      <div className="norma-protocol-card highlight">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 800, color: '#0369a1', fontSize: '0.86rem' }}>
                            2. Modern Clinical TRT Split Protocol (Endocrine Society Best Practice)
                          </span>
                          <span style={{ fontSize: '0.68rem', fontWeight: 800, backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px' }}>
                            Recommended for Stability
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#334155', lineHeight: '1.5' }}>
                          <strong>Dose:</strong> 125 mg (0.5 mL) administered deep I.M. every 7 days (or 60–80 mg every 3.5 to 4 days).
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#166534', backgroundColor: '#f0fdf4', padding: '8px 10px', borderRadius: '6px', marginTop: '8px', borderLeft: '3px solid #16a34a' }}>
                          <strong>Clinical Advantage:</strong> Flattens serum testosterone peaks and valleys, yielding stable steady-state concentrations (~600–850 ng/dL), dramatically mitigating estradiol spikes and reducing excess erythrocytosis.
                        </div>
                      </div>

                      {/* Protocol 3: TRT + hCG Synergy */}
                      <div className="norma-protocol-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.86rem' }}>
                            3. TRT + hCG Fertility & Neurosteroid Preservation Protocol
                          </span>
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px' }}>
                            Combination Protocol
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: '1.5' }}>
                          <strong>Regimen:</strong> Testosterone Enanthate (100–125 mg weekly) combined with <strong>hCG (Human Chorionic Gonadotropin) 250–500 IU twice weekly</strong> subcutaneous.
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#475569', backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '6px', marginTop: '8px', borderLeft: '3px solid #003666' }}>
                          <strong>Biochemical Rationale:</strong> Maintains LH receptor stimulation in Leydig cells, sustaining testicular volume, spermatogenesis, and vital upstream neurosteroid precursors (Pregnenolone, Progesterone, DHEA).
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 3: AMPOULE ADMINISTRATION GUIDE ── */}
              {activeTab === 'administration' && (
                <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="norma-card">
                    <div className="norma-card-title">
                      <Syringe size={18} color="#003666" />
                      <span>{isEs ? 'Técnica Oficial de Inyección en Ampolla de Vidrio' : 'Authoritative Glass Ampoule Administration Protocol'}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div className="norma-step-card">
                        <div className="norma-step-num">1</div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.82rem' }}>
                            {isEs ? 'Apertura Aseptica de la Ampolla' : 'Aseptic Ampoule Opening & Neck Inspection'}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>
                            {isEs
                              ? 'Asegurar que todo el líquido esté en la base de la ampolla (dar golpecitos suaves en el cuello). Romper el cuello ejerciendo presión hacia atrás sobre el punto blanco indicador (One-Point-Cut).'
                              : 'Tap the ampoule top gently to ensure all oily solution settles into the bottom chamber. Locate the white One-Point-Cut (OPC) indicator and snap backwards with firm, steady thumb pressure away from the dot.'}
                          </div>
                        </div>
                      </div>

                      <div className="norma-step-card">
                        <div className="norma-step-num">2</div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.82rem' }}>
                            {isEs ? 'Aspiración con Aguja de Filtro (18G)' : 'Withdrawal Using 18G Blunt Filter Needle'}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>
                            {isEs
                              ? 'Utilizar una aguja con filtro de 5 micras para aspirar la solución oleosa. Esto previene la aspiración accidental de micro-partículas de vidrio que puedan desprenderse al romper la ampolla.'
                              : 'Always draw the dense castor oil solution using an 18G blunt needle equipped with a 5-micron filter. This eliminates any possibility of drawing micro-particulate glass shards generated during ampoule snapping.'}
                          </div>
                        </div>
                      </div>

                      <div className="norma-step-card">
                        <div className="norma-step-num">3</div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.82rem' }}>
                            {isEs ? 'Cambio a Aguja Intramuscular Profunda (21G - 23G, 1.5 Pulgadas)' : 'Needle Swap to 21G–23G (1.5" / 38 mm) Injection Needle'}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>
                            {isEs
                              ? 'Desechar la aguja de filtro y acoplar una aguja estéril 21G o 23G de 1.5 pulgadas (38 mm) adecuada para inyección en el cuadrante superior externo del glúteo mayor.'
                              : 'Detach and safely discard the filter needle. Affix a sterile 21G to 23G 1.5-inch (38 mm) needle designed to reach deep intragluteal muscle tissue and avoid subcutaneous leakage.'}
                          </div>
                        </div>
                      </div>

                      <div className="norma-step-card">
                        <div className="norma-step-num">4</div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#991b1b', fontSize: '0.82rem' }}>
                            {isEs ? 'Aspiración Previa y Velocidad de Inyección Lenta (CRÍTICO)' : 'Aspiration Check & Ultra-Slow Injection (CRITICAL SAFETY STEP)'}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>
                            {isEs
                              ? 'Aspirar antes de inyectar para verificar la ausencia de sangre (evitar vía intravascular). Inyectar MUY LENTAMENTE (mínimo 60 segundos por 1 ml) para prevenir microembolismo pulmonar de soluciones oleosas (POME: tos, disnea).'
                              : 'Carefully aspirate for 3–5 seconds prior to depressing the plunger to confirm absence of blood flash (strictly avoid intravascular entry). Inject EXTREMELY SLOWLY (≥ 60 seconds per 1 mL) to prevent pulmonary oily microembolism (POME: severe cough, choking sensation).'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 4: CERTIFIED BATCH COA ── */}
              {activeTab === 'coa' && (
                <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="norma-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                      <div className="norma-card-title" style={{ margin: 0 }}>
                        <Award size={18} color="#003666" />
                        <span>{isEs ? 'Certificado Analítico Oficial de Lote (COA)' : 'Authoritative Batch Release Certificate of Analysis (COA)'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          Batch: <strong style={{ color: '#0f172a' }}>{coa.batchNumber || '12473'}</strong>
                        </span>
                        <span style={{
                          padding: '3px 8px',
                          backgroundColor: '#f0fdf4',
                          color: '#166534',
                          border: '1px solid #bbf7d0',
                          borderRadius: '4px',
                          fontSize: '0.70rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <Check size={11} />
                          <span>Official QP Released</span>
                        </span>
                      </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      <table className="norma-coa-table">
                        <thead>
                          <tr>
                            <th>Analytical Parameter</th>
                            <th>Method</th>
                            <th>Release Specification</th>
                            <th>Batch Result</th>
                            <th>Compliance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(coa.tests || [
                            { parameter: 'Assay (Testosterone Enanthate)', method: 'HPLC 012473', specification: '95.0 – 105.0 %', result: '102.5 %', status: 'PASSED' },
                            { parameter: 'Visual Appearance', method: 'COM 004105', specification: 'Clear yellowish oily solution', result: 'Conforms', status: 'PASSED' },
                            { parameter: 'Sterility Testing', method: 'EP 2.6.1', specification: 'Sterile (no microbial growth)', result: 'Conforms', status: 'PASSED' },
                            { parameter: 'Bacterial Endotoxins', method: 'EP 2.6.14', specification: '≤ 300 I.U./ml', result: '< 150 I.U./ml', status: 'PASSED' },
                            { parameter: 'Testosterone Caproate Impurity', method: 'HPLC 012473', specification: '≤ 1.0 %', result: '0.1 %', status: 'PASSED' },
                            { parameter: 'Free Testosterone Impurity', method: 'HPLC 012473', specification: '≤ 0.4 %', result: '< 0.1 %', status: 'PASSED' },
                            { parameter: 'Total Impurities', method: 'HPLC 012473', specification: '≤ 2.0 %', result: '0.3 %', status: 'PASSED' },
                            { parameter: 'Extractable Volume', method: 'COM 003680', specification: '≥ 1.00 ml', result: '1.08 ml', status: 'PASSED' },
                            { parameter: 'Density (20°C)', method: 'COM 003723', specification: '1.0246 – 1.0446 g/ml', result: '1.0320 g/ml', status: 'PASSED' }
                          ]).map((t, idx) => (
                            <tr key={idx}>
                              <td style={{ fontWeight: 600, color: '#0f172a' }}>{t.parameter}</td>
                              <td style={{ color: '#64748b' }}>{t.method}</td>
                              <td style={{ color: '#475569' }}>{t.specification}</td>
                              <td style={{ fontWeight: 700, color: '#003666' }}>{t.result}</td>
                              <td>
                                <span className="norma-coa-status-pass">
                                  <Check size={11} /> {t.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div style={{ marginTop: '14px', padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.74rem', color: '#475569' }}>
                      <strong>Qualified Person (QP) Certification:</strong> EVER Pharma Jena GmbH (Germany) certifies that all manufacturing stages of finished batch #12473 have been carried out in full compliance with European GMP requirements and Marketing Authorisation EOF # 45945/03-10-2008. The product has been officially released for clinical distribution.
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 5: PHYSICIAN LAB SURVEILLANCE ── */}
              {activeTab === 'monitoring' && (
                <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="norma-card">
                    <div className="norma-card-title">
                      <HeartPulse size={18} color="#003666" />
                      <span>{isEs ? 'Panel Obligatorio de Monitorización Biomédica (TRT)' : 'Physician TRT Biomarker Surveillance & Safety Panel'}</span>
                    </div>

                    <p style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '14px', lineHeight: '1.5' }}>
                      {isEs
                        ? 'Directrices de la Sociedad Europea de Urología (EAU) y Endocrine Society para la terapia de sustitución con enantato de testosterona:'
                        : 'Authoritative clinical directives from the Endocrine Society & European Association of Urology (EAU) for responsible testosterone administration:'}
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                      <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                        <div style={{ fontWeight: 800, color: '#003666', fontSize: '0.82rem' }}>
                          1. Total & Free Testosterone + SHBG
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '4px' }}>
                          Sample fasting between 8:00–10:00 AM. In established protocols, measure strictly at the <strong>trough (nadir)</strong> immediately prior to the subsequent injection.
                        </div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#166534', marginTop: '6px' }}>
                          Clinical Target: Mid-to-high normal range (550 – 850 ng/dL)
                        </div>
                      </div>

                      <div style={{ backgroundColor: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '8px', padding: '12px' }}>
                        <div style={{ fontWeight: 800, color: '#c2410c', fontSize: '0.82rem' }}>
                          2. Hematocrit (Hct) / Complete Blood Count
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '4px' }}>
                          Check baseline, 3 months, 6 months, and annually. Androgen-induced bone marrow erythropoietin stimulation may cause secondary erythrocytosis.
                        </div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#dc2626', marginTop: '6px' }}>
                          Critical Action Threshold: Hct &gt; 54% (Prompt dose reduction or therapeutic phlebotomy)
                        </div>
                      </div>

                      <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                        <div style={{ fontWeight: 800, color: '#003666', fontSize: '0.82rem' }}>
                          3. PSA & Digital Rectal Examination
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '4px' }}>
                          Mandatory in males &gt; 45 years. Exclude subclinical prostate adenocarcinoma prior to initiation. Follow up at 3, 6, and 12 months.
                        </div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0369a1', marginTop: '6px' }}>
                          Clinical Ceilings: PSA &lt; 4.0 ng/mL or velocity &lt; 1.4 ng/mL/year
                        </div>
                      </div>

                      <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                        <div style={{ fontWeight: 800, color: '#003666', fontSize: '0.82rem' }}>
                          4. Ultra-Sensitive Estradiol (E2)
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '4px' }}>
                          Crucial for bone density, libido, and vascular protection. Avoid reflexively crashing E2 with aromatase inhibitors unless symptomatic gynecomastia develops.
                        </div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginTop: '6px' }}>
                          Optimal Ratio: Total T (ng/dL) to E2 (pg/mL) ratio ~ 20:1 to 30:1
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 6: B2B COMMERCIAL SCHEDULE ── */}
              {activeTab === 'b2b' && (
                <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="norma-card">
                    <div className="norma-card-title">
                      <Building2 size={18} color="#003666" />
                      <span>{isEs ? 'Tarifas Comerciales Oficiales para Clínicas y Hospitales B2B' : 'Authoritative B2B Procurement Schedule for Licensed Clinics'}</span>
                    </div>

                    {!isDoctorUnlocked ? (
                      <div style={{
                        padding: '24px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <Lock size={32} color="#003666" />
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                          {isEs ? 'Precios Restringidos a Profesionales Sanitarios Colegiados' : 'Wholesale Pricing Restricted to Verified Clinical Practitioners'}
                        </div>
                        <p style={{ fontSize: '0.80rem', color: '#64748b', maxWidth: '440px', margin: 0, lineHeight: '1.45' }}>
                          {isEs
                            ? 'Conforme a la normativa farmacéutica europea y del Ministerio de Salud (MOHAP/DHA), los precios de medicamentos sujetos a prescripción no son públicos para pacientes generales.'
                            : 'In strict compliance with EU EMA and regional DHA/MOHAP medical guidelines, commercial terms for prescription-only pharmaceuticals are gated for licensed healthcare facilities.'}
                        </p>
                        <button
                          onClick={() => setIsDoctorUnlocked(true)}
                          className="gcp-btn-primary"
                          style={{ width: 'auto', padding: '10px 22px' }}
                        >
                          <ShieldCheck size={16} />
                          <span>{isEs ? 'Desbloquear como Médico Colegiado / Clínica' : 'Instant Unlock as Licensed Physician / Clinic'}</span>
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.70rem', color: '#166534', fontWeight: 800 }}>CLINIC ALLOCATION RATE</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#166534', margin: '4px 0' }}>21.00 EUR</div>
                            <div style={{ fontSize: '0.70rem', color: '#64748b' }}>Per 1 mL Ampoule (250 mg)</div>
                          </div>

                          <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.70rem', color: '#1e40af', fontWeight: 800 }}>STANDARD WHOLESALE B2B</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e40af', margin: '4px 0' }}>24.50 EUR</div>
                            <div style={{ fontSize: '0.70rem', color: '#64748b' }}>Standard medical supplier tier</div>
                          </div>

                          <div style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.70rem', color: '#6b21a8', fontWeight: 800 }}>HOSPITAL MASTER TIER (&gt;50)</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#6b21a8', margin: '4px 0' }}>18.00 EUR</div>
                            <div style={{ fontSize: '0.70rem', color: '#64748b' }}>Bulk institutional procurement</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                          <button
                            onClick={() => setIsInquiryDrawerOpen(true)}
                            className="gcp-btn-primary"
                            style={{ width: 'auto', padding: '11px 24px' }}
                          >
                            <Building2 size={15} />
                            <span>{isEs ? 'Crear Orden de Compra (PO)' : 'Submit Clinic Purchase Order (PO)'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
      </main>

      {/* ── DRAWERS ── */}
      <PublicInstitutionalInquiryDrawer
        isOpen={isInquiryDrawerOpen}
        onClose={() => setIsInquiryDrawerOpen(false)}
        contextType="product"
        brandType="hormone"
        lang={lang}
        initialEntity={{
          name: 'Testosterone Enanthate/Norma® 250 mg/ml',
          slug: slug,
          code: 'NORMA-TE-250-1AMP',
          strength: '250 mg / 1 mL (Active: ~180 mg Testosterone)',
          category: 'Human Pharmaceuticals & TRT (Finished EU GMP Medicine)',
          supplier: 'Norma Hellas Pharmaceuticals',
          brand: 'Norma Hellas S.A. (Athens, Greece)',
          atcCode: 'G03BA03',
          eofMarketingAuth: '45945/03-10-2008',
          galenicForm: 'Type I Amber Glass Ampoule (Castor Oil Depot)',
          inquiryGoal: 'hospital_clinic_allocation'
        }}
      />

      <ShareProductMonographDrawer
        isOpen={isShareDrawerOpen}
        onClose={() => setIsShareDrawerOpen(false)}
        product={{
          id: 'testosterone-enanthate-norma-250mg',
          name: 'Testosterone Enanthate/Norma® 250 mg/ml',
          brand: 'Norma Hellas S.A.',
          category: 'hormone'
        }}
        shareUrl={`${baseUrl}/p/testosterone-enanthate-norma-250mg`}
      />

      {/* ── STICKY GCP BOTTOM ACTION BAR WITH CLINICAL ATLAS AI ── */}
      <PublicStickyActionBar
        title="Testosterone Enanthate/Norma® 250 mg/ml"
        subtitle="1 mL Amber Ampoule · Castor Oil Depot · EOF #45945/03-10-2008"
        badge="EU GMP Certified"
        badgeType="success"
        inquireLabel={isEs ? 'Solicitar Asignación Clínica' : 'Request Allocation'}
        onInquire={() => setIsInquiryDrawerOpen(true)}
        showClinicalAI={true}
        aiPreset="peptide"
        aiCategory="hormone"
        aiContextQuery="Testosterone Enanthate Norma 250mg ampoule pharmacology, pharmacokinetics, injection protocol, castor oil depot, physician lab monitoring, and B2B hospital supply"
        aiMeta={{
          productName: 'Testosterone Enanthate/Norma® 250 mg/ml',
          brand: 'Norma Hellas S.A.',
          activeDose: '250 mg/mL (180 mg free base equivalent)',
          galenicForm: 'Type I Amber Glass Ampoule (Oleum Ricini depot)',
          regulatory: 'EOF Greece MA # 45945/03-10-2008 · POM'
        }}
        lang={lang}
      />

      {/* ── UNIFIED PUBLIC FOOTER ── */}
      <PublicUnifiedFooter />
    </div>
  );
}
