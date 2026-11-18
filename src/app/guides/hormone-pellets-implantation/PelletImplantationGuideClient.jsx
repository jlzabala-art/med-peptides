"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import InteractiveTrocarPelletGuide from '@/components/product/InteractiveTrocarPelletGuide';
import {
  ChevronLeft,
  Syringe,
  ShieldCheck,
  Share2,
  Building2,
  Package,
  Layers,
  Sparkles,
  ArrowRight,
  ExternalLink
} from '@/lib/icons';
import UniversalShareDrawer from '@/components/ui/UniversalShareDrawer';

export default function PelletImplantationGuideClient() {
  const [lang, setLang] = useState('en');
  const [isShareOpen, setIsShareOpen] = useState(false);
  const isEs = lang === 'es';
  const shareUrl = 'https://www.atlashealth-services.com/guides/hormone-pellets-implantation';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a' }}>
      {/* ── UNIFIED ATLAS PUBLIC HEADER ── */}
      <PublicUnifiedHeader currentApp="services" />

      {/* ── GOOGLE CLOUD CONSOLE STYLE RESOURCE HEADER ── */}
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #dadce0',
        position: 'sticky',
        top: '56px',
        zIndex: 30,
        boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0.65rem 1.5rem 0.85rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          {/* Breadcrumb Context Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#5f6368' }}>
            <Link href="/catalog" style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: '#1a73e8', textDecoration: 'none', fontWeight: 600 }}>
              <ChevronLeft size={14} />
              <span>{isEs ? 'Catálogo General' : 'Catalog'}</span>
            </Link>
            <span style={{ color: '#bdc1c6' }}>/</span>
            <Link href="/collection/hormone-pellets" style={{ color: '#5f6368', textDecoration: 'none', fontWeight: 500 }}>
              {isEs ? 'Pellets Hormonales (BHRT)' : 'Hormone Pellets (BHRT)'}
            </Link>
            <span style={{ color: '#bdc1c6' }}>/</span>
            <span style={{ color: '#202124', fontWeight: 600 }}>
              {isEs ? 'Guía Quirúrgica de Implantación' : 'Trocar Implantation Guide'}
            </span>
          </div>

          {/* Main Resource Header Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  backgroundColor: '#e8f0fe',
                  color: '#1a73e8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Syringe size={18} />
                </div>

                <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#202124', margin: 0, letterSpacing: '-0.01em' }}>
                  {isEs
                    ? 'Guía Gráfica de Implantación de Pellets Hormonales con Trócar'
                    : 'Subcutaneous Hormone Pellet Trocar Implantation Guide'}
                </h1>

                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.70rem',
                  fontWeight: 600,
                  backgroundColor: '#e6f4ea',
                  color: '#137333',
                  border: '1px solid #ceead6'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#188038' }} />
                  <span>EU GMP Clinical Standard</span>
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '0.73rem', color: '#5f6368' }}>
                <span>Pharmapolis Compounding Pharmacy</span>
                <span style={{ color: '#bdc1c6' }}>•</span>
                <span>Plovdiv, Bulgaria (EU GMP)</span>
                <span style={{ color: '#bdc1c6' }}>•</span>
                <span>Subcutaneous Infiltrative Trocar Procedure</span>
                <span style={{ color: '#bdc1c6' }}>•</span>
                <span>Extrusion Rate &lt; 0.3%</span>
              </div>
            </div>

            {/* Action Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <div style={{
                display: 'inline-flex',
                backgroundColor: '#f1f3f4',
                border: '1px solid #dadce0',
                borderRadius: '6px',
                padding: '2px'
              }}>
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  style={{
                    border: 'none',
                    background: lang === 'en' ? '#ffffff' : 'transparent',
                    color: lang === 'en' ? '#1a73e8' : '#5f6368',
                    padding: '4px 10px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    boxShadow: lang === 'en' ? '0 1px 2px rgba(60,64,67,0.15)' : 'none'
                  }}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLang('es')}
                  style={{
                    border: 'none',
                    background: lang === 'es' ? '#ffffff' : 'transparent',
                    color: lang === 'es' ? '#1a73e8' : '#5f6368',
                    padding: '4px 10px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    boxShadow: lang === 'es' ? '0 1px 2px rgba(60,64,67,0.15)' : 'none'
                  }}
                >
                  ES
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsShareOpen(true)}
                className="gcp-btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.76rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Share2 size={14} />
                <span>{isEs ? 'Compartir Guía' : 'Share Guide'}</span>
              </button>

              <Link
                href="/p/estradiol-12-5mg-pellet"
                className="gcp-btn-primary"
                style={{ padding: '6px 14px', fontSize: '0.76rem', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Package size={14} />
                <span>{isEs ? 'Explorar Monografías' : 'Explore Pellets'}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1.5rem 3rem' }}>
        
        {/* Intro Banner */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <h2 style={{ fontSize: '1.10rem', fontWeight: 800, color: '#003666', margin: '0 0 6px 0' }}>
            {isEs
              ? 'Protocolo Quirúrgico Clínico para la Inserción de Pellets Subcutáneos'
              : 'Standardized Physician Trocar Insertion Protocol for Bioidentical Hormone Pellets'}
          </h2>
          <p style={{ margin: 0, fontSize: '0.86rem', color: '#475569', lineHeight: 1.6 }}>
            {isEs
              ? 'Esta guía interactiva documenta el estándar de oro quirúrgico ambulatorio de 10 minutos para la inserción atraumática de pellets cristalinos puros fabricados por Pharmapolis (Bulgaria EU GMP). Utilice el simulador visual inferior para revisar la técnica de infiltración en abanico, entrada a 30° con nivelación horizontal, técnica de desnudamiento por retroceso y cuidados postoperatorios.'
              : 'This interactive clinical guide details the gold-standard 10-minute outpatient procedure for atraumatic implantation of pure crystalline bioidentical pellets manufactured by Pharmapolis (Bulgaria EU GMP). Use the visual simulator below to master the buffered local tumescence, 30° skin entry with 0° horizontal leveling, zero-force cannula withdrawal deposition, and patient discharge protocols.'}
          </p>
        </div>

        {/* ── THE INTERACTIVE TROCAR GUIDE COMPONENT ── */}
        <InteractiveTrocarPelletGuide lang={lang} />

        {/* ── SISTER MONOGRAPHS CARD GRID ── */}
        <div style={{ marginTop: '2.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#003666', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={16} color="#0284c7" />
            <span>{isEs ? 'Monografías Clínicas de Pellets en Catálogo' : 'Pharmapolis Hormone Pellets in Catalog'}</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
            <Link
              href="/p/estradiol-12-5mg-pellet"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '14px',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ fontSize: '0.70rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase' }}>Estradiol (E2)</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#003666', margin: '3px 0' }}>17β-Estradiol 12.5 mg</div>
              <div style={{ fontSize: '0.76rem', color: '#64748b', marginBottom: '8px' }}>Iniciación / Perimenopausia · €50.88</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', color: '#1a73e8', fontWeight: 700 }}>
                <span>{isEs ? 'Ver Monografía' : 'Open Monograph'}</span>
                <ArrowRight size={12} />
              </div>
            </Link>

            <Link
              href="/p/estradiol-25mg-pellet"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '14px',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ fontSize: '0.70rem', fontWeight: 700, color: '#db2777', textTransform: 'uppercase' }}>Estradiol (E2)</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#003666', margin: '3px 0' }}>17β-Estradiol 25 mg</div>
              <div style={{ fontSize: '0.76rem', color: '#64748b', marginBottom: '8px' }}>Estándar Clínico Menopausia · €54.43</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', color: '#1a73e8', fontWeight: 700 }}>
                <span>{isEs ? 'Ver Monografía' : 'Open Monograph'}</span>
                <ArrowRight size={12} />
              </div>
            </Link>

            <Link
              href="/p/testosterone-50mg-pellet"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '14px',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ fontSize: '0.70rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>Testosterona</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#003666', margin: '3px 0' }}>Testosterona 50 mg</div>
              <div style={{ fontSize: '0.76rem', color: '#64748b', marginBottom: '8px' }}>Sinergia Femenina / Titulación · €50.56</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', color: '#1a73e8', fontWeight: 700 }}>
                <span>{isEs ? 'Ver Monografía' : 'Open Monograph'}</span>
                <ArrowRight size={12} />
              </div>
            </Link>

            <Link
              href="/p/testosterone-100mg-pellet"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '14px',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ fontSize: '0.70rem', fontWeight: 700, color: '#6b21a8', textTransform: 'uppercase' }}>Testosterona</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#003666', margin: '3px 0' }}>Testosterona 100 mg</div>
              <div style={{ fontSize: '0.76rem', color: '#64748b', marginBottom: '8px' }}>Base Andrológica TRT · €54.36</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', color: '#1a73e8', fontWeight: 700 }}>
                <span>{isEs ? 'Ver Monografía' : 'Open Monograph'}</span>
                <ArrowRight size={12} />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* ── SHARE DRAWER ── */}
      <UniversalShareDrawer
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        docType="protocol"
        shareUrl={shareUrl}
        title={isEs ? 'Compartir Guía Quirúrgica de Pellets' : 'Share Pellet Implantation Guide'}
        subtitle={isEs ? 'Protocolo clínico estandarizado con trócar y tumescencia local' : 'Standardized trocar procedure and buffered anesthesia protocol'}
        itemName={isEs ? 'Guía Quirúrgica Pellets Hormonales' : 'Trocar Pellet Implantation Guide'}
      />

      {/* ── UNIFIED ATLAS PUBLIC FOOTER ── */}
      <PublicUnifiedFooter />
    </div>
  );
}
