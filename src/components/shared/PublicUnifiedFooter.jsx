"use client";

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Award,
  ExternalLink
} from '@/lib/icons';
import BrandLogo from '../common/BrandLogo';

/**
 * PublicUnifiedFooter
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud Console compliant clinical and institutional footer.
 * Clean, lightweight, zero-underline modern UX with minimal information density.
 * Features automatic safe-area clearance for persistent bottom action docks.
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
        borderTop: '1px solid #e8eaed',
        fontFamily: 'Inter, Roboto, system-ui, -apple-system, sans-serif',
        fontSize: '0.8125rem',
        lineHeight: 1.5,
        position: 'relative',
        zIndex: 10,
        paddingBottom: 'calc(2rem + var(--atlas-sticky-bar-height, 0px))'
      }}
    >
      <style jsx>{`
        .public-footer-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 2.25rem 1.5rem 1.5rem;
        }

        .public-footer-grid {
          display: grid;
          grid-template-columns: 1.25fr 1fr 1fr 1fr;
          gap: 2.5rem;
          margin-bottom: 2rem;
        }

        .public-footer-title {
          color: #202124;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.85rem;
        }

        .public-footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
          font-size: 0.80rem;
        }

        .public-footer-links a {
          color: #5f6368 !important;
          text-decoration: none !important;
          transition: color 0.15s ease;
          display: inline-block;
          line-height: 1.35;
        }

        .public-footer-links a:hover {
          color: #1a73e8 !important;
          text-decoration: none !important;
        }

        .gcp-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 9px;
          border-radius: 9999px;
          background: #e6f4ea;
          border: 1px solid #ceead6;
          color: #137333;
          font-size: 0.70rem;
          font-weight: 600;
          letter-spacing: 0.01em;
          margin-top: 0.75rem;
        }

        .gcp-status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #188038;
          box-shadow: 0 0 0 2px rgba(24, 128, 56, 0.2);
        }

        .public-footer-bottom {
          border-top: 1px solid #e8eaed;
          padding-top: 1.25rem;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          font-size: 0.75rem;
          color: #70757a;
        }

        .public-footer-bottom a {
          color: #5f6368 !important;
          text-decoration: none !important;
          transition: color 0.15s ease;
        }

        .public-footer-bottom a:hover {
          color: #1a73e8 !important;
          text-decoration: none !important;
        }

        .gcp-compliance-strip {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0.65rem 1rem;
          background: #ffffff;
          border: 1px solid #e8eaed;
          border-radius: 6px;
          font-size: 0.72rem;
          color: #5f6368;
          line-height: 1.45;
          margin-bottom: 1.5rem;
        }

        @media (max-width: 1023px) {
          .public-footer-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 2rem 1.5rem;
          }
        }

        @media (max-width: 639px) {
          .public-footer-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          .gcp-compliance-strip {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="public-footer-container">
        
        {/* ── 4-Column GCP Curated Directory (Zero Underlines, Concise Links) ── */}
        <div className="public-footer-grid">
          
          {/* Column 1: Institutional Identity & Live Operational Status */}
          <div>
            <div style={{ marginBottom: '0.65rem' }}>
              <BrandLogo variant="dark" showText={true} />
            </div>
            <p style={{ color: '#5f6368', fontSize: '0.78rem', margin: '0 0 0.5rem 0', lineHeight: 1.5, maxWidth: '280px' }}>
              {isEs 
                ? 'Plataforma clínica de formulación magistral, diagnóstico multi-ómico cuantitativo y logística médica.'
                : 'Clinical platform delivering pharmaceutical compounding, multi-omics telemetry, and cold-chain logistics.'}
            </p>
            
            <div className="gcp-status-pill">
              <span className="gcp-status-dot" />
              <span>{isEs ? 'Sistemas Operativos 100%' : 'All Systems Operational'}</span>
            </div>
          </div>

          {/* Column 2: Therapeutics & Formulations */}
          <div>
            <div className="public-footer-title">
              {isEs ? 'Terapéutica' : 'Therapeutics'}
            </div>
            <ul className="public-footer-links">
              <li>
                <Link href="/collection/peptides">
                  {isEs ? 'Terapia Peptídica & GLP-1' : 'Peptide Therapeutics & GLP-1'}
                </Link>
              </li>
              <li>
                <Link href="/collection/colway">
                  {isEs ? 'Colway® Tropocolágeno Nativo' : 'Colway® Native Bio-Collagen'}
                </Link>
              </li>
              <li>
                <Link href="/catalog?type=raw_material">
                  {isEs ? 'Materia Prima Farmacéutica & APIs' : 'Pharmaceutical APIs & Compounding'}
                </Link>
              </li>
              <li>
                <Link href="/collection/supplements">
                  {isEs ? 'Nutracéutica Clínica & BHRT' : 'Clinical Nutraceuticals & BHRT'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Diagnostics & Protocols */}
          <div>
            <div className="public-footer-title">
              {isEs ? 'Diagnóstico & Vías' : 'Diagnostics & Pathways'}
            </div>
            <ul className="public-footer-links">
              <li>
                <Link href="/collection/bloodo">
                  {isEs ? 'Diagnóstico Capilar DBS Bloodo™' : 'Bloodo™ Capillary Diagnostics (DBS)'}
                </Link>
              </li>
              <li>
                <Link href="/collection/teletest">
                  {isEs ? 'TeleTest HTMA & Genómica' : 'TeleTest HTMA & Genomics'}
                </Link>
              </li>
              <li>
                <Link href="/proto">
                  {isEs ? 'Directorio de Protocolos Clínicos' : 'Clinical Protocols Directory'}
                </Link>
              </li>
              <li>
                <Link href="/collection/ultraperson">
                  {isEs ? 'Medicina de Precisión UltraPerson™' : 'UltraPerson™ Precision Medicine'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Practitioner & Clinical Ops */}
          <div>
            <div className="public-footer-title">
              {isEs ? 'Portal Médico & B2B' : 'Practitioner & Ops'}
            </div>
            <ul className="public-footer-links">
              <li>
                <Link href="/dr" style={{ fontWeight: 650, color: '#1a73e8' }}>
                  {isEs ? 'Portal Médico Facultativo (/dr)' : 'Physician & Clinic Portal (/dr)'}
                </Link>
              </li>
              <li>
                <Link href="/rx/intake">
                  {isEs ? 'Prescripción Electrónica (E-Rx)' : 'Digital Compounding E-Rx'}
                </Link>
              </li>
              <li>
                <Link href="/pricing/colway">
                  {isEs ? 'Tarifario Mayorista B2B' : 'B2B Wholesale Pricing'}
                </Link>
              </li>
              <li>
                <Link href="/verify">
                  {isEs ? 'Verificación de Lotes & COAs' : 'Specimen & COA Verification'}
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* ── Minimalist GCP Compliance Strip (Replaces the bulky disclaimer box) ── */}
        <div className="gcp-compliance-strip">
          <ShieldCheck size={15} color="#188038" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <strong style={{ color: '#202124' }}>
              {isEs ? 'Cumplimiento Regulatorio: ' : 'Regulatory Compliance: '}
            </strong>
            {isEs
              ? 'Dispositivos CE-IVDR (UE 2017/746) e ISO 15189/17025. Fabricación bajo normativas EU GMP. Acceso exclusivo para profesionales sanitarios acreditados.'
              : 'CE-IVDR (EU 2017/746) & ISO 15189/17025 compliant diagnostics. Formulations compounded under EU GMP monographs. Intended strictly for accredited healthcare professionals.'}
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.70rem', color: '#1a73e8', fontWeight: 600, flexShrink: 0 }}>
            <Award size={13} color="#1a73e8" />
            <span>ISO 15189 · EU GMP</span>
          </div>
        </div>

        {/* ── Bottom Utility Bar: Clean, Minimalist & Legal ── */}
        <div className="public-footer-bottom">
          <div>
            © 2026 <strong style={{ color: '#202124' }}>Atlas Health Services</strong>. {isEs ? 'Todos los derechos reservados.' : 'All rights reserved.'}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <Link href="/privacy">
              {isEs ? 'Privacidad' : 'Privacy'}
            </Link>
            <span style={{ color: '#dadce0' }}>•</span>
            <Link href="/terms">
              {isEs ? 'Términos' : 'Terms'}
            </Link>
            <span style={{ color: '#dadce0' }}>•</span>
            <Link href="/faq">
              {isEs ? 'Ayuda & FAQ' : 'Help & FAQ'}
            </Link>
            <span style={{ color: '#dadce0' }}>•</span>
            <a href="mailto:clinical@atlashealth-services.com" style={{ fontWeight: 600, color: '#1a73e8' }}>
              clinical@atlashealth-services.com
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
