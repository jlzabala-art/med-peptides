"use client";

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Microscope,
  Award,
  ExternalLink,
  ChevronRight
} from '@/lib/icons';
import BrandLogo from '../common/BrandLogo';

export default function PublicUnifiedFooter({ lang = 'en' }) {
  const isEs = lang === 'es';

  return (
    <footer style={{
      background: '#f8f9fa',
      color: '#5f6368',
      borderTop: '1px solid #dadce0',
      fontFamily: 'Inter, Roboto, system-ui, -apple-system, sans-serif',
      fontSize: '0.84rem',
      lineHeight: 1.6,
      position: 'relative',
      zIndex: 10
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.5rem 1.75rem' }}>
        {/* ── Main Google Cloud Style Grid (Less Information, Maximum Clarity) ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {/* Brand Info */}
          <div>
            <div style={{ marginBottom: '0.75rem' }}>
              <BrandLogo variant="dark" showText={true} />
            </div>
            <p style={{ color: '#5f6368', fontSize: '0.80rem', margin: 0, lineHeight: 1.5, maxWidth: '280px' }}>
              {isEs 
                ? 'Plataforma de inteligencia diagnóstica capilar DBS, biomarcadores de longevidad y compendios bioactivos para profesionales médicos.'
                : 'Clinical intelligence platform delivering quantitative capillary blood diagnostics (DBS), multi-omics longevity clocks, and bioactive reference compendiums.'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '0.75rem', fontSize: '0.75rem', color: '#137333', fontWeight: 600 }}>
              <ShieldCheck size={14} color="#137333" />
              <span>LifeLab1 Vilnius · ISO 15189 · CE-IVDR</span>
            </div>
          </div>

          {/* Column 1: Soluciones */}
          <div>
            <div style={{ color: '#202124', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.85rem' }}>
              {isEs ? 'Soluciones' : 'Solutions'}
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.80rem' }}>
              <li>
                <Link href="/collection/bloodo" style={{ color: '#5f6368', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#1a73e8'} onMouseLeave={(e) => e.target.style.color = '#5f6368'}>
                  {isEs ? 'Kits Diagnósticos Bloodo™ (DBS)' : 'Bloodo™ Diagnostic Kits (DBS)'}
                </Link>
              </li>
              <li>
                <Link href="/collection/eterna" style={{ color: '#5f6368', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#1a73e8'} onMouseLeave={(e) => e.target.style.color = '#5f6368'}>
                  {isEs ? 'ETERNA® Multi-Omics y Longevidad' : 'ETERNA® Multi-Omics Platform'}
                </Link>
              </li>
              <li>
                <Link href="/collection/peptides" style={{ color: '#5f6368', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#1a73e8'} onMouseLeave={(e) => e.target.style.color = '#5f6368'}>
                  {isEs ? 'Péptidos de Precisión' : 'Precision Research Peptides'}
                </Link>
              </li>
              <li>
                <Link href="/collection/colway" style={{ color: '#5f6368', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#1a73e8'} onMouseLeave={(e) => e.target.style.color = '#5f6368'}>
                  {isEs ? 'Colway® Tropocolágeno y Tricología' : 'Colway® Bioactive Collagen & Trichology'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Protocolos & Herramientas */}
          <div>
            <div style={{ color: '#202124', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.85rem' }}>
              {isEs ? 'Recursos Clínicos' : 'Clinical Resources'}
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.80rem' }}>
              <li>
                <Link href="/proto" style={{ color: '#5f6368', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#1a73e8'} onMouseLeave={(e) => e.target.style.color = '#5f6368'}>
                  {isEs ? 'Biblioteca de Protocolos (/proto)' : 'Clinical Protocols Directory'}
                </Link>
              </li>
              <li>
                <Link href="/calculator" style={{ color: '#5f6368', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#1a73e8'} onMouseLeave={(e) => e.target.style.color = '#5f6368'}>
                  {isEs ? 'Calculadora de Reconstitución' : 'Reconstitution Calculator'}
                </Link>
              </li>
              <li>
                <Link href="/verify" style={{ color: '#5f6368', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#1a73e8'} onMouseLeave={(e) => e.target.style.color = '#5f6368'}>
                  {isEs ? 'Verificación de Lotes y Reportes' : 'Specimen & Report Verification'}
                </Link>
              </li>
              <li>
                <Link href="/faq" style={{ color: '#5f6368', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#1a73e8'} onMouseLeave={(e) => e.target.style.color = '#5f6368'}>
                  {isEs ? 'Preguntas Frecuentes y Guías' : 'Clinical Knowledgebase & FAQ'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Acceso Facultativo */}
          <div>
            <div style={{ color: '#202124', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.85rem' }}>
              {isEs ? 'Acceso Médico' : 'Practitioner Access'}
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.80rem' }}>
              <li>
                <Link href="/rx/intake" style={{ color: '#5f6368', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#1a73e8'} onMouseLeave={(e) => e.target.style.color = '#5f6368'}>
                  {isEs ? 'Portal de Prescripción Médica' : 'Physician Prescription Portal'}
                </Link>
              </li>
              <li>
                <Link href="/doctor" style={{ color: '#5f6368', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#1a73e8'} onMouseLeave={(e) => e.target.style.color = '#5f6368'}>
                  {isEs ? 'Portales Públicos de Médicos' : 'Physician Public Portals'}
                </Link>
              </li>
              <li>
                <a href="mailto:clinical@atlashealth-services.com?subject=Clinical%20Inquiry" style={{ color: '#5f6368', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#1a73e8'} onMouseLeave={(e) => e.target.style.color = '#5f6368'}>
                  {isEs ? 'Contacto Laboratorio Central' : 'Central Laboratory Contact'}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Compact Regulatory Note (Single Line GCP Standard) ── */}
        <div style={{
          padding: '0.75rem 1rem',
          background: '#ffffff',
          border: '1px solid #e8eaed',
          borderRadius: '6px',
          fontSize: '0.72rem',
          color: '#70757a',
          marginBottom: '1.25rem'
        }}>
          <strong>{isEs ? 'Aviso Médico y Regulatorio: ' : 'Regulatory Notice: '}</strong>
          {isEs 
            ? 'Los kits diagnósticos Bloodo™ y análisis LifeLab1 son conformes con el Reglamento (UE) 2017/746 (CE-IVDR). Para uso exclusivo por profesionales médicos e investigadores acreditados.'
            : 'Bloodo™ diagnostic kits and LifeLab1 testing procedures comply with Regulation (EU) 2017/746 (CE-IVDR). Intended for licensed medical practitioners and accredited laboratory research.'}
        </div>

        {/* ── Bottom Bar: Minimalist & Clean ── */}
        <div style={{
          borderTop: '1px solid #dadce0',
          paddingTop: '1rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          fontSize: '0.75rem',
          color: '#70757a'
        }}>
          <div>
            © 2026 <strong style={{ color: '#202124' }}>Atlas Health Services</strong>. {isEs ? 'Todos los derechos reservados.' : 'All rights reserved.'}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/privacy" style={{ color: '#5f6368', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#1a73e8'} onMouseLeave={(e) => e.target.style.color = '#5f6368'}>
              {isEs ? 'Privacidad' : 'Privacy'}
            </Link>
            <span>•</span>
            <Link href="/terms" style={{ color: '#5f6368', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#1a73e8'} onMouseLeave={(e) => e.target.style.color = '#5f6368'}>
              {isEs ? 'Términos' : 'Terms'}
            </Link>
            <span>•</span>
            <span style={{ color: '#5f6368' }}>clinical@atlashealth-services.com</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
