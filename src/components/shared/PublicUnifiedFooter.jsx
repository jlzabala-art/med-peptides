"use client";

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Award,
  ExternalLink
} from '@/lib/icons';
import BrandLogo from '../common/BrandLogo';
import './PublicUnifiedFooter.css';

/**
 * PublicUnifiedFooter
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud Console compliant clinical and institutional footer.
 * Clean, lightweight, zero-underline modern UX with minimal information density.
 * Features automatic safe-area clearance for persistent bottom action docks.
 */
export default function PublicUnifiedFooter({ lang = 'en' }) {
  const isEs = false; // Force English — Spanish translations preserved for future i18n

  const linkStyle = {
    color: '#5f6368',
    textDecoration: 'none',
    transition: 'color 0.15s ease'
  };

  const primaryLinkStyle = {
    color: '#1a73e8',
    textDecoration: 'none',
    fontWeight: 600,
    transition: 'color 0.15s ease'
  };

  return (
    <footer
      id="public-unified-footer"
      className="public-unified-footer"
      style={{
        paddingBottom: 'calc(2.5rem + var(--atlas-sticky-bar-height, 0px))'
      }}
    >
      <div className="public-footer-container">
        
        {/* ── 4-Column GCP Curated Directory (Zero Underlines, Concise Links) ── */}
        <div className="public-footer-grid">
          
          {/* Column 1: Institutional Identity & Live Operational Status */}
          <div className="public-footer-brand-col">
            <div style={{ marginBottom: '0.65rem' }}>
              <BrandLogo variant="dark" showText={true} />
            </div>
            <p className="public-footer-desc">
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
                <Link href="/collection/peptides" style={linkStyle}>
                  {isEs ? 'Terapia Peptídica & GLP-1' : 'Peptide Therapeutics & GLP-1'}
                </Link>
              </li>
              <li>
                <Link href="/collection/colway" style={linkStyle}>
                  {isEs ? 'Colway® Tropocolágeno Nativo' : 'Colway® Native Bio-Collagen'}
                </Link>
              </li>
              <li>
                <Link href="/catalog?type=raw_material" style={linkStyle}>
                  {isEs ? 'Materia Prima Farmacéutica & APIs' : 'Pharmaceutical APIs & Compounding'}
                </Link>
              </li>
              <li>
                <Link href="/collection/supplements" style={linkStyle}>
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
                <Link href="/collection/bloodo" style={linkStyle}>
                  {isEs ? 'Diagnóstico Capilar DBS Bloodo™' : 'Bloodo™ Capillary Diagnostics (DBS)'}
                </Link>
              </li>
              <li>
                <Link href="/collection/teletest" style={linkStyle}>
                  {isEs ? 'TeleTest HTMA & Genómica' : 'TeleTest HTMA & Genomics'}
                </Link>
              </li>
              <li>
                <Link href="/proto" style={linkStyle}>
                  {isEs ? 'Directorio de Protocolos Clínicos' : 'Clinical Protocols Directory'}
                </Link>
              </li>
              <li>
                <Link href="/collection/ultraperson" style={linkStyle}>
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
                <Link href="/dr" style={primaryLinkStyle}>
                  {isEs ? 'Portal Médico Facultativo (/dr)' : 'Physician & Clinic Portal (/dr)'}
                </Link>
              </li>
              <li>
                <Link href="/rx/intake" style={linkStyle}>
                  {isEs ? 'Prescripción Electrónica (E-Rx)' : 'Digital Compounding E-Rx'}
                </Link>
              </li>
              <li>
                <Link href="/pricing/colway" style={linkStyle}>
                  {isEs ? 'Tarifario Mayorista B2B' : 'B2B Wholesale Pricing'}
                </Link>
              </li>
              <li>
                <Link href="/verify" style={linkStyle}>
                  {isEs ? 'Verificación de Lotes & COAs' : 'Specimen & COA Verification'}
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* ── Minimalist GCP Compliance Strip (GCP Trust Center Style) ── */}
        <div className="gcp-compliance-strip">
          <div className="gcp-compliance-content">
            <ShieldCheck size={16} color="#188038" style={{ flexShrink: 0 }} />
            <div>
              <strong style={{ color: '#202124' }}>
                {isEs ? 'Cumplimiento Regulatorio: ' : 'Regulatory Compliance: '}
              </strong>
              {isEs
                ? 'Dispositivos CE-IVDR (UE 2017/746) e ISO 15189/17025. Fabricación bajo normativas EU GMP. Acceso exclusivo para profesionales sanitarios acreditados.'
                : 'CE-IVDR (EU 2017/746) & ISO 15189/17025 compliant diagnostics. Formulations compounded under EU GMP monographs. Intended strictly for accredited healthcare professionals.'}
            </div>
          </div>
          <div className="gcp-compliance-badge">
            <Award size={13} color="#1a73e8" />
            <span>ISO 15189 · EU GMP</span>
          </div>
        </div>

        {/* ── Bottom Utility Bar: Clean, Minimalist & Legal (GCP Style) ── */}
        <div className="public-footer-bottom">
          <div>
            © 2026 <strong style={{ color: '#202124' }}>Atlas Health Services</strong>. {isEs ? 'Todos los derechos reservados.' : 'All rights reserved.'}
          </div>

          <div className="public-footer-legal-links">
            <Link href="/privacy" style={linkStyle}>
              {isEs ? 'Privacidad' : 'Privacy'}
            </Link>
            <span className="public-footer-divider">•</span>
            <Link href="/terms" style={linkStyle}>
              {isEs ? 'Términos' : 'Terms'}
            </Link>
            <span className="public-footer-divider">•</span>
            <Link href="/faq" style={linkStyle}>
              {isEs ? 'Ayuda & FAQ' : 'Help & FAQ'}
            </Link>
            <span className="public-footer-divider">•</span>
            <a href="mailto:clinical@atlashealth-services.com" style={primaryLinkStyle}>
              clinical@atlashealth-services.com
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
