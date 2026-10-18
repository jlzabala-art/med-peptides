"use client";

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Award,
  Stethoscope,
  FlaskConical,
  Truck,
  Activity,
  FileText
} from '@/lib/icons';
import BrandLogo from '../common/BrandLogo';

/**
 * PublicUnifiedFooter
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud Console compliant clinical and institutional footer.
 * Balanced 4-column layout on desktop, 2x2 on tablet, and single column on mobile.
 * Features automatic safe-area clearance for persistent bottom action bars.
 */
export default function PublicUnifiedFooter({ lang = 'en' }) {
  const isEs = false; // Force English — Spanish translations preserved for future i18n

  return (
    <footer
      id="public-unified-footer"
      className="public-unified-footer"
      style={{
        background: '#f8f9fa',
        color: '#5f6368',
        borderTop: '1px solid #dadce0',
        fontFamily: 'Inter, Roboto, system-ui, -apple-system, sans-serif',
        fontSize: '0.84rem',
        lineHeight: 1.6,
        position: 'relative',
        zIndex: 10,
        paddingBottom: 'calc(2rem + var(--atlas-sticky-bar-height, 0px))'
      }}
    >
      <style jsx>{`
        .public-footer-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 2.5rem 1.5rem 1.75rem;
        }

        .public-footer-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 2.5rem;
          margin-bottom: 2.25rem;
        }

        .public-footer-title {
          color: #202124;
          font-size: 0.78rem;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 0.85rem;
        }

        .public-footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          font-size: 0.8125rem;
        }

        .public-footer-links a {
          color: #5f6368;
          text-decoration: none;
          transition: color 0.15s ease;
        }

        .public-footer-links a:hover {
          color: #003666;
        }

        @media (max-width: 1023px) {
          .public-footer-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 2rem 1.75rem;
          }
        }

        @media (max-width: 639px) {
          .public-footer-grid {
            grid-template-columns: 1fr;
            gap: 1.75rem;
          }
        }
      `}</style>

      <div className="public-footer-container">
        
        {/* ── Balanced 4-Column Clinical & Operational Grid ── */}
        <div className="public-footer-grid">
          
          {/* Column 1: Brand Identity & Certified Laboratory Accreditations */}
          <div>
            <div style={{ marginBottom: '0.85rem' }}>
              <BrandLogo variant="dark" showText={true} />
            </div>
            <p style={{ color: '#5f6368', fontSize: '0.80rem', margin: 0, lineHeight: 1.55, maxWidth: '290px' }}>
              {isEs 
                ? 'Infraestructura clínica integral de formulación magistral, diagnóstico multi-ómico cuantitativo, terapias bioactivas y logística médica especializada en cadena de frío.'
                : 'Integrated clinical infrastructure delivering compounding pharmacy APIs, quantitative capillary blood diagnostics (DBS), multi-omics telemetry, and cold-chain medical freight.'}
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.73rem', color: '#137333', fontWeight: 650 }}>
                <ShieldCheck size={14} color="#137333" style={{ flexShrink: 0 }} />
                <span>LifeLab1 &amp; TeleTest · ISO 15189 / 17025 · CE-IVDR</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.73rem', color: '#1a73e8', fontWeight: 650 }}>
                <Award size={14} color="#1a73e8" style={{ flexShrink: 0 }} />
                <span>EU GMP Compounding &amp; Fagron Iberia Alliance</span>
              </div>
            </div>
          </div>

          {/* Column 2: Soluciones Terapéuticas & Formulación */}
          <div>
            <div className="public-footer-title">
              {isEs ? 'Soluciones Terapéuticas' : 'Therapeutic Solutions'}
            </div>
            <ul className="public-footer-links">
              <li>
                <Link href="/collection/peptides">
                  {isEs ? 'Terapia Peptídica & Análogos GLP-1' : 'Peptide Therapeutics & GLP-1'}
                </Link>
              </li>
              <li>
                <Link href="/catalog?type=raw_material">
                  {isEs ? 'Materia Prima Farmacéutica & APIs' : 'Pharmaceutical APIs & Compounding'}
                </Link>
              </li>
              <li>
                <Link href="/catalog?type=aesthetic_injectables">
                  {isEs ? 'Medicina Estética & Bioestimuladores' : 'Aesthetic Medicine & Fillers'}
                </Link>
              </li>
              <li>
                <Link href="/collection/supplements">
                  {isEs ? 'Nutracéutica Clínica & Terapias BHRT' : 'Clinical Nutraceuticals & BHRT'}
                </Link>
              </li>
              <li>
                <Link href="/collection/colway">
                  {isEs ? 'Colway® Tropocolágeno & Tricología' : 'Colway® Native Collagen & Trichology'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Diagnóstico Avanzado & Vías Clínicas */}
          <div>
            <div className="public-footer-title">
              {isEs ? 'Diagnóstico & Vías Clínicas' : 'Diagnostics & Pathways'}
            </div>
            <ul className="public-footer-links">
              <li>
                <Link href="/collection/bloodo">
                  {isEs ? 'Diagnóstico Capilar DBS Bloodo™' : 'Bloodo™ Capillary Diagnostics (DBS)'}
                </Link>
              </li>
              <li>
                <Link href="/collection/teletest">
                  {isEs ? 'TeleTest HTMA Metales & Genómica' : 'TeleTest HTMA & Clinical Genomics'}
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=iv_drips">
                  {isEs ? 'Terapia Intravenosa & Infusión IVNT' : 'IV Infusion Therapy & Micronutrients'}
                </Link>
              </li>
              <li>
                <Link href="/proto">
                  {isEs ? 'Directorio de Protocolos (87)' : 'Clinical Protocols Directory (87)'}
                </Link>
              </li>
              <li>
                <Link href="/collection/ultraperson">
                  {isEs ? 'Personalización UltraPerson™' : 'UltraPerson™ Precision Protocols'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Portal Médico & Operaciones Clínicas */}
          <div>
            <div className="public-footer-title">
              {isEs ? 'Portal Médico & Operaciones' : 'Practitioner Portal & Ops'}
            </div>
            <ul className="public-footer-links">
              <li>
                <Link href="/dr" style={{ fontWeight: 650, color: '#003666' }}>
                  {isEs ? 'Portales Clínicos Facultativos (/dr)' : 'Physician & Clinic Portals (/dr)'}
                </Link>
              </li>
              <li>
                <Link href="/rx/intake">
                  {isEs ? 'Prescripción Electrónica Magistral (E-Rx)' : 'Digital Compounding E-Rx Portal'}
                </Link>
              </li>
              <li>
                <Link href="/verify">
                  {isEs ? 'Verificación de Lotes, COAs y Reportes' : 'Specimen & COA Verification'}
                </Link>
              </li>
              <li>
                <Link href="/calculator">
                  {isEs ? 'Calculadora de Reconstitución' : 'Reconstitution Calculator'}
                </Link>
              </li>
              <li>
                <a href="mailto:logistics@atlashealth-services.com?subject=Cold-Chain%20Medical%20Courier%20Inquiry">
                  {isEs ? 'Logística Médica en Cadena de Frío' : 'Cold-Chain Medical Logistics'}
                </a>
              </li>
              <li>
                <Link href="/faq">
                  {isEs ? 'Base de Conocimiento Clínico & FAQ' : 'Clinical Knowledgebase & FAQ'}
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* ── Compact Institutional & Regulatory Compliance Notice ── */}
        <div style={{
          padding: '0.85rem 1.15rem',
          background: '#ffffff',
          border: '1px solid #dadce0',
          borderRadius: '8px',
          fontSize: '0.72rem',
          color: '#5f6368',
          lineHeight: 1.5,
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          boxShadow: '0 1px 2px rgba(60, 64, 67, 0.04)'
        }}>
          <ShieldCheck size={16} color="#003666" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ color: '#202124' }}>
              {isEs ? 'Aviso Regulatorio e Institucional: ' : 'Regulatory & Institutional Notice: '}
            </strong>
            {isEs 
              ? 'Los dispositivos y procedimientos diagnósticos in vitro distribuidos por Atlas Health Services cumplen con el Reglamento (UE) 2017/746 (CE-IVDR) y normas analíticas ISO 15189 / ISO 17025. Las materias primas farmacéuticas, APIs y formulaciones magistrales se elaboran conforme a especificaciones de Farmacopea y normativas EU GMP en instalaciones autorizadas por Fagron Iberia y entidades colaboradoras. Plataforma destinada exclusivamente a profesionales médicos colegiados, clínicas y centros de investigación acreditados.'
              : 'In vitro diagnostic devices and procedures supplied by Atlas Health Services comply with Regulation (EU) 2017/746 (CE-IVDR) and ISO 15189 / ISO 17025 laboratory standards. Pharmaceutical raw materials, APIs, and magistral compounding formulations are manufactured under Pharmacopeia monographs and EU GMP guidelines in accredited facilities (including Fagron Iberia). Platform intended strictly for licensed healthcare practitioners, hospitals, and verified research institutions.'}
          </div>
        </div>

        {/* ── Bottom Bar: Clean, Minimalist & Legal ── */}
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
            <Link href="/privacy" style={{ color: '#5f6368', textDecoration: 'none' }}>
              {isEs ? 'Privacidad' : 'Privacy'}
            </Link>
            <span>•</span>
            <Link href="/terms" style={{ color: '#5f6368', textDecoration: 'none' }}>
              {isEs ? 'Términos' : 'Terms'}
            </Link>
            <span>•</span>
            <a href="mailto:clinical@atlashealth-services.com" style={{ color: '#003666', textDecoration: 'none', fontWeight: 600 }}>
              clinical@atlashealth-services.com
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
