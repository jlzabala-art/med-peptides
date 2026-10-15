"use client";

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Microscope,
  Award,
  Activity,
  FileText,
  Lock,
  ExternalLink,
  Mail,
  ChevronRight,
  Globe,
  Sparkles
} from '@/lib/icons';
import BrandLogo from '../common/BrandLogo';

export default function PublicUnifiedFooter({ lang = 'en' }) {
  const isEs = lang === 'es';

  return (
    <footer style={{
      background: '#0b1329',
      color: '#94a3b8',
      borderTop: '1px solid #1e293b',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      fontSize: '0.85rem',
      lineHeight: 1.6,
      position: 'relative',
      zIndex: 10
    }}>
      {/* ── Top Accreditation Banner ── */}
      <div style={{
        borderBottom: '1px solid #1e293b',
        background: 'rgba(15, 23, 42, 0.6)',
        padding: '1.25rem 2rem'
      }}>
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(14, 165, 233, 0.15)',
              border: '1px solid rgba(14, 165, 233, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8'
            }}>
              <Award size={18} />
            </div>
            <div>
              <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.88rem', display: 'block' }}>
                {isEs ? 'Acreditación y Cumplimiento Normativo de Laboratorio Europeo' : 'European Central Laboratory Accreditation & Clinical Governance'}
              </span>
              <span style={{ color: '#64748b', fontSize: '0.78rem' }}>
                LifeLab1 Vilnius (License 4864) · ISO 15189 Medical Lab Standard · Regulation (EU) 2017/746 (CE-IVDR)
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'rgba(22, 163, 74, 0.12)',
              border: '1px solid rgba(22, 163, 74, 0.25)',
              color: '#4ade80',
              fontSize: '0.72rem',
              fontWeight: 700
            }}>
              <ShieldCheck size={13} /> ISO 15189 Accredited
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              color: '#38bdf8',
              fontSize: '0.72rem',
              fontWeight: 700
            }}>
              <Microscope size={13} /> CE-IVDR Certified DBS
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'rgba(168, 85, 247, 0.12)',
              border: '1px solid rgba(168, 85, 247, 0.25)',
              color: '#c084fc',
              fontSize: '0.72rem',
              fontWeight: 700
            }}>
              <Lock size={13} /> GDPR Health Data Encryption
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Footer Columns ── */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '3.5rem 2rem 2.5rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2.5rem'
        }}>
          {/* Brand & Mission */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
              <BrandLogo variant="light" showText={true} />
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              {isEs 
                ? 'Plataforma líder en inteligencia clínica diagnóstica, biomarcadores cuantitativos capilares DBS y compendio terapéutico de péptidos para profesionales de la salud y centros de longevidad.' 
                : 'Advanced clinical intelligence platform providing quantitative capillary blood diagnostics (DBS), multi-omics longevity clocks, and reference peptide compendiums for medical practitioners.'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.78rem', color: '#64748b' }}>
              <div><strong style={{ color: '#cbd5e1' }}>EU Central Operations:</strong> Vilnius, Lithuania</div>
              <div><strong style={{ color: '#cbd5e1' }}>Direct Logistics:</strong> Bucharest / Warsaw / Dubai</div>
              <div><strong style={{ color: '#cbd5e1' }}>Support:</strong> clinical@atlashealth-services.com</div>
            </div>
          </div>

          {/* Column 1: Bloodo™ Diagnostics */}
          <div>
            <h4 style={{
              color: '#f8fafc',
              fontSize: '0.8rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              margin: '0 0 1.25rem 0'
            }}>
              Bloodo™ Diagnostics
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li>
                <Link href="/p/bloodo-nad-level-test" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s ease' }} onMouseEnter={(e) => e.target.style.color = '#38bdf8'} onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
                  {isEs ? 'Test NAD+ Celular Cuantitativo' : 'Bloodo™ NAD+ Intracellular Test'}
                </Link>
              </li>
              <li>
                <Link href="/p/cortisol-test" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s ease' }} onMouseEnter={(e) => e.target.style.color = '#38bdf8'} onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
                  {isEs ? 'Test Cortisol Ritmo Diurno' : 'Bloodo™ Cortisol Diurnal CAR Test'}
                </Link>
              </li>
              <li>
                <Link href="/p/testosterone-test" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s ease' }} onMouseEnter={(e) => e.target.style.color = '#38bdf8'} onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
                  {isEs ? 'Test Testosterona Total y Libre' : 'Bloodo™ Testosterone+ Profile'}
                </Link>
              </li>
              <li>
                <Link href="/p/hemoglobin-a1c-hba1c-test" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s ease' }} onMouseEnter={(e) => e.target.style.color = '#38bdf8'} onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
                  {isEs ? 'Test HbA1c y Glucosa Media 90 Días' : 'Bloodo™ HbA1c 90-Day Glycation'}
                </Link>
              </li>
              <li>
                <Link href="/p/omega-ratio-test" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s ease' }} onMouseEnter={(e) => e.target.style.color = '#38bdf8'} onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
                  {isEs ? 'Test Ratio Omega-3 / Omega-6' : 'Bloodo™ Omega-3 Index & Ratio'}
                </Link>
              </li>
              <li>
                <Link href="/p/vitamin-d-test" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s ease' }} onMouseEnter={(e) => e.target.style.color = '#38bdf8'} onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
                  {isEs ? 'Test Vitamina D3 (25-OH)' : 'Bloodo™ Vitamin D3 (25-OH)'}
                </Link>
              </li>
              <li>
                <Link href="/collection/bloodo" style={{ color: '#38bdf8', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <span>{isEs ? 'Ver Suite Completa Bloodo™' : 'View Complete Bloodo™ Suite'}</span>
                  <ChevronRight size={13} />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Compendiums & Protocols */}
          <div>
            <h4 style={{
              color: '#f8fafc',
              fontSize: '0.8rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              margin: '0 0 1.25rem 0'
            }}>
              {isEs ? 'Compendio y Protocolos' : 'Compendiums & Protocols'}
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li>
                <Link href="/collection/peptides" style={{ color: '#94a3b8', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#38bdf8'} onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
                  {isEs ? 'Catálogo de Péptidos de Precisión' : 'Precision Research Peptides'}
                </Link>
              </li>
              <li>
                <Link href="/proto" style={{ color: '#94a3b8', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#38bdf8'} onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
                  {isEs ? 'Biblioteca de Protocolos Clínicos' : 'Clinical Protocols Directory'}
                </Link>
              </li>
              <li>
                <Link href="/collection/eterna" style={{ color: '#94a3b8', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#38bdf8'} onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
                  {isEs ? 'ETERNA® Multi-Omics y Proteómica' : 'ETERNA® Multi-Omics DX'}
                </Link>
              </li>
              <li>
                <Link href="/collection/colway" style={{ color: '#94a3b8', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#38bdf8'} onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
                  {isEs ? 'Colway® Tropocolágeno y Tricología' : 'Colway® Trichology & Collagen'}
                </Link>
              </li>
              <li>
                <Link href="/collection/research-supplies" style={{ color: '#94a3b8', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#38bdf8'} onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
                  {isEs ? 'Disolventes y Suministros' : 'Solvents & Research Supplies'}
                </Link>
              </li>
              <li>
                <Link href="/mediluxe" style={{ color: '#94a3b8', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#38bdf8'} onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
                  {isEs ? 'Mediluxe Perfil Corporativo B2B' : 'Mediluxe Corporate Profile'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Physician & Portal Access */}
          <div>
            <h4 style={{
              color: '#f8fafc',
              fontSize: '0.8rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              margin: '0 0 1.25rem 0'
            }}>
              {isEs ? 'Acceso Médico y Validación' : 'Clinical Portals & Verification'}
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li>
                <Link href="/rx/intake" style={{ color: '#94a3b8', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#38bdf8'} onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
                  {isEs ? 'Portal de Prescripción Médica' : 'Physician Prescription Intake'}
                </Link>
              </li>
              <li>
                <Link href="/verify" style={{ color: '#94a3b8', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#38bdf8'} onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
                  {isEs ? 'Verificación de Lotes y Reportes' : 'Specimen & Report Verification'}
                </Link>
              </li>
              <li>
                <Link href="/c/CAT-MU9L9GBN" style={{ color: '#94a3b8', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#38bdf8'} onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
                  {isEs ? 'Catálogo Compartido B2B / Clínicas' : 'B2B Shared Clinical Catalog'}
                </Link>
              </li>
              <li>
                <Link href="/dr/haytham-salem" style={{ color: '#94a3b8', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#38bdf8'} onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
                  {isEs ? 'Portal Público de Médicos' : 'Physician Public Portals'}
                </Link>
              </li>
              <li>
                <a href="mailto:clinical@atlashealth-services.com?subject=Clinical%20Account%20Inquiry" style={{ color: '#94a3b8', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#38bdf8'} onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
                  {isEs ? 'Contacto Directo con Laboratorio' : 'Direct Laboratory Inquiries'}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Medical Disclaimer Strip ── */}
        <div style={{
          marginTop: '3rem',
          padding: '1.25rem 1.5rem',
          borderRadius: '10px',
          background: 'rgba(15, 23, 42, 0.4)',
          border: '1px solid #1e293b',
          fontSize: '0.74rem',
          color: '#64748b',
          lineHeight: 1.55
        }}>
          <strong style={{ color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
            {isEs ? 'Aviso Médico y Regulatorio Institucional:' : 'Institutional Medical & Regulatory Notice:'}
          </strong>
          {isEs 
            ? 'Los kits diagnósticos Bloodo™ y las pruebas de laboratorio LifeLab1 son dispositivos de diagnóstico in vitro conformes con el Reglamento (UE) 2017/746 (CE-IVDR). Los datos cuantitativos de biomarcadores tienen como fin asistir a médicos colegiados en la toma de decisiones clínicas y no constituyen un diagnóstico automático sin la debida evaluación facultativa. Los compuestos del compendio de investigación analítica están reservados a laboratorios acreditados y administración bajo supervisión clínica autorizada.'
            : 'Bloodo™ diagnostic kits and LifeLab1 testing procedures are CE-IVDR certified under Regulation (EU) 2017/746. Quantitative biomarker reports are intended to support licensed physicians in clinical diagnosis and longevity intervention design. Information presented on this platform is for educational and healthcare professional reference only.'}
        </div>

        {/* ── Bottom Bar ── */}
        <div style={{
          marginTop: '2.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #1e293b',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.78rem',
          color: '#64748b'
        }}>
          <div>
            <span>© 2026 </span>
            <strong style={{ color: '#f8fafc' }}>Atlas Health Services</strong>
            <span>. {isEs ? 'Todos los derechos reservados. Inteligencia Clínica y Diagnóstica.' : 'All rights reserved. Clinical & Healthcare Intelligence.'}</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'center' }}>
            <Link href="/privacy" style={{ color: '#64748b', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#f8fafc'} onMouseLeave={(e) => e.target.style.color = '#64748b'}>
              {isEs ? 'Privacidad' : 'Privacy Policy'}
            </Link>
            <Link href="/terms" style={{ color: '#64748b', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#f8fafc'} onMouseLeave={(e) => e.target.style.color = '#64748b'}>
              {isEs ? 'Términos' : 'Terms of Service'}
            </Link>
            <span style={{ color: '#334155' }}>•</span>
            <a href="https://www.atlashealth-services.com" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>
              https://www.atlashealth-services.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
