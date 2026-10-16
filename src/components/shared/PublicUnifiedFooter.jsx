"use client";

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Microscope,
  Award,
  ExternalLink,
  ChevronRight,
  FlaskConical,
  Truck,
  FileCheck2,
  Stethoscope
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
        
        {/* ── Main Google Cloud Style Grid (4 Core Clinical & Operational Pillars) ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {/* Brand & Institutional Platform Info */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ marginBottom: '0.75rem' }}>
              <BrandLogo variant="dark" showText={true} />
            </div>
            <p style={{ color: '#5f6368', fontSize: '0.80rem', margin: 0, lineHeight: 1.5, maxWidth: '290px' }}>
              {isEs 
                ? 'Infraestructura clínica integral de formulación magistral, diagnóstico multi-ómico cuantitativo, terapias bioactivas y logística médica especializada en cadena de frío.'
                : 'Integrated clinical infrastructure delivering compounding pharmacy APIs, quantitative capillary blood diagnostics (DBS), multi-omics telemetry, and cold-chain medical freight.'}
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#137333', fontWeight: 600 }}>
                <ShieldCheck size={14} color="#137333" style={{ flexShrink: 0 }} />
                <span>LifeLab1 & TeleTest · ISO 15189 / 17025 · CE-IVDR</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#1a73e8', fontWeight: 600 }}>
                <Award size={14} color="#1a73e8" style={{ flexShrink: 0 }} />
                <span>EU GMP Compounding & Fagron Iberia Alliance</span>
              </div>
            </div>
          </div>

          {/* Column 1: Soluciones Terapéuticas & Formulación Magistral */}
          <div>
            <div style={{ color: '#202124', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.85rem' }}>
              {isEs ? 'Soluciones Terapéuticas' : 'Therapeutic Solutions'}
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.80rem' }}>
              <li>
                <Link href="/collection/peptides" style={{ color: '#5f6368', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#1a73e8'} onMouseLeave={(e) => e.target.style.color = '#5f6368'}>
                  {isEs ? 'Terapia Peptídica & Análogos GLP-1' : 'Peptide Therapeutics & GLP-1'}
                </Link>
              </li>
              <li>
                <Link href="/catalog?type=raw_material" style={{ color: '#5f6368', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#1a73e8'} onMouseLeave={(e) => e.target.style.color = '#5f6368'}>
                  {isEs ? 'Materia Prima Farmacéutica & APIs' : 'Pharmaceutical APIs & Compounding'}
                </Link>
              </li>
              <li>
                <Link href="/catalog?type=aesthetic_injectables" style={{ color: '#5f6368', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#1a73e8'} onMouseLeave={(e) => e.target.style.color = '#5f6368'}>
                  {isEs ? 'Medicina Estética & Bioestimuladores' : 'Aesthetic Medicine & Fillers'}
                </Link>
              </li>
              <li>
                <Link href="/collection/supplements" style={{ color: '#5f6368', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#1a73e8'} onMouseLeave={(e) => e.target.style.color = '#5f6368'}>
                  {isEs ? 'Nutracéutica Clínica & Terapias BHRT' : 'Clinical Nutraceuticals & BHRT'}
                </Link>
              </li>
              <li>
                <Link href="/collection/colway" style={{ color: '#5f6368', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#1a73e8'} onMouseLeave={(e) => e.target.style.color = '#5f6368'}>
                  {isEs ? 'Colway® Tropocolágeno & Tricología' : 'Colway® Native Collagen & Trichology'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Diagnóstico Avanzado & Terapias Clínicas */}
          <div>
            <div style={{ color: '#202124', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.85rem' }}>
              {isEs ? 'Diagnóstico & Terapias' : 'Diagnostics & Pathways'}
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.80rem' }}>
              <li>
                <Link href="/collection/bloodo" style={{ color: '#5f6368', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#1a73e8'} onMouseLeave={(e) => e.target.style.color = '#5f6368'}>
                  {isEs ? 'Diagnóstico Capilar DBS Bloodo™' : 'Bloodo™ Capillary Diagnostics (DBS)'}
                </Link>
              </li>
              <li>
                <Link href="/collection/teletest" style={{ color: '#5f6368', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#1a73e8'} onMouseLeave={(e) => e.target.style.color = '#5f6368'}>
                  {isEs ? 'Genómica, HLA & Toxicología HTMA' : 'Clinical Genomics & HTMA Toxicology'}
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=iv_drips" style={{ color: '#5f6368', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#1a73e8'} onMouseLeave={(e) => e.target.style.color = '#5f6368'}>
                  {isEs ? 'Terapia Intravenosa & Infusión IVNT' : 'IV Infusion Therapy & Micronutrients'}
                </Link>
              </li>
              <li>
                <Link href="/proto" style={{ color: '#5f6368', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#1a73e8'} onMouseLeave={(e) => e.target.style.color = '#5f6368'}>
                  {isEs ? 'Directorio de Protocolos (87)' : 'Clinical Protocols Directory (87)'}
                </Link>
              </li>
              <li>
                <Link href="/collection/ultraperson" style={{ color: '#5f6368', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#1a73e8'} onMouseLeave={(e) => e.target.style.color = '#5f6368'}>
                  {isEs ? 'Personalización UltraPerson™' : 'UltraPerson™ Precision Protocols'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Servicios Clínicos & Operaciones */}
          <div>
            <div style={{ color: '#202124', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.85rem' }}>
              {isEs ? 'Servicios & Operaciones' : 'Services & Operations'}
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.80rem' }}>
              <li>
                <Link href="/rx/intake" style={{ color: '#5f6368', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#1a73e8'} onMouseLeave={(e) => e.target.style.color = '#5f6368'}>
                  {isEs ? 'Prescripción Electrónica Magistral (E-Rx)' : 'Digital Compounding E-Rx Portal'}
                </Link>
              </li>
              <li>
                <a href="mailto:logistics@atlashealth-services.com?subject=Cold-Chain%20Medical%20Courier%20Inquiry" style={{ color: '#5f6368', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#1a73e8'} onMouseLeave={(e) => e.target.style.color = '#5f6368'}>
                  {isEs ? 'Logística Médica en Cadena de Frío' : 'Cold-Chain Medical Logistics'}
                </a>
              </li>
              <li>
                <Link href="/collection/eterna" style={{ color: '#5f6368', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#1a73e8'} onMouseLeave={(e) => e.target.style.color = '#5f6368'}>
                  {isEs ? 'Plataforma Multi-Ómica ETERNA®' : 'ETERNA® Multi-Omics Platform'}
                </Link>
              </li>
              <li>
                <a href="mailto:clinical@atlashealth-services.com?subject=Institutional%20Hospital%20Compounding%20Inquiry" style={{ color: '#5f6368', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#1a73e8'} onMouseLeave={(e) => e.target.style.color = '#5f6368'}>
                  {isEs ? 'Alianzas Hospitalarias & Formulación' : 'Hospital & Compounding Alliances'}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Acceso Facultativo & Validación */}
          <div>
            <div style={{ color: '#202124', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.85rem' }}>
              {isEs ? 'Acceso Médico & Control' : 'Practitioner Access'}
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.80rem' }}>
              <li>
                <Link href="/dr" style={{ color: '#5f6368', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#1a73e8'} onMouseLeave={(e) => e.target.style.color = '#5f6368'}>
                  {isEs ? 'Portales Clínicos Facultativos (/dr)' : 'Physician & Clinic Portals (/dr)'}
                </Link>
              </li>
              <li>
                <Link href="/calculator" style={{ color: '#5f6368', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#1a73e8'} onMouseLeave={(e) => e.target.style.color = '#5f6368'}>
                  {isEs ? 'Calculadora de Reconstitución' : 'Reconstitution Calculator'}
                </Link>
              </li>
              <li>
                <Link href="/verify" style={{ color: '#5f6368', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#1a73e8'} onMouseLeave={(e) => e.target.style.color = '#5f6368'}>
                  {isEs ? 'Verificación de Lotes, COAs y Reportes' : 'Specimen & COA Verification'}
                </Link>
              </li>
              <li>
                <Link href="/faq" style={{ color: '#5f6368', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#1a73e8'} onMouseLeave={(e) => e.target.style.color = '#5f6368'}>
                  {isEs ? 'Base de Conocimiento Clínico & FAQ' : 'Clinical Knowledgebase & FAQ'}
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

        {/* ── Comprehensive Institutional & Regulatory Notice (GCP Style Card) ── */}
        <div style={{
          padding: '0.85rem 1.15rem',
          background: '#ffffff',
          border: '1px solid #e8eaed',
          borderRadius: '8px',
          fontSize: '0.73rem',
          color: '#5f6368',
          lineHeight: 1.55,
          marginBottom: '1.25rem',
          boxShadow: '0 1px 2px rgba(60, 64, 67, 0.04)'
        }}>
          <strong style={{ color: '#202124' }}>
            {isEs ? 'Aviso Regulatorio e Institucional: ' : 'Regulatory & Institutional Notice: '}
          </strong>
          {isEs 
            ? 'Los dispositivos y procedimientos diagnósticos in vitro distribuidos por Atlas Health Services cumplen con el Reglamento (UE) 2017/746 (CE-IVDR) y normas analíticas ISO 15189 / ISO 17025. Las materias primas farmacéuticas, APIs y formulaciones magistrales se elaboran conforme a especificaciones de Farmacopea y normativas EU GMP en instalaciones autorizadas por Fagron Iberia y entidades colaboradoras. Plataforma destinada exclusivamente a profesionales médicos colegiados, clínicas y centros de investigación acreditados.'
            : 'In vitro diagnostic devices and procedures supplied by Atlas Health Services comply with Regulation (EU) 2017/746 (CE-IVDR) and ISO 15189 / ISO 17025 laboratory standards. Pharmaceutical raw materials, APIs, and magistral compounding formulations are manufactured under Pharmacopeia monographs and EU GMP guidelines in accredited facilities (including Fagron Iberia). Platform intended strictly for licensed healthcare practitioners, hospitals, and verified research institutions.'}
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
