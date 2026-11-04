"use client";

import React, { useState } from 'react';
import {
  ChevronDown,
  FlaskConical,
  Microscope,
  Briefcase,
  Globe
} from '@/lib/icons';
import BrandLogo from '../common/BrandLogo';
import './PublicUnifiedFooter.css';

const FOOTER_SECTIONS = [
  {
    id: 'therapeutics',
    title: 'Therapeutics',
    titleMobile: 'Therapeutics & Formulations',
    titleEs: 'Terapéutica',
    icon: FlaskConical,
    links: [
      { label: 'Clinical Peptide Monographs & Incretins', labelEs: 'Monografías Peptídicas Clínicas & Incretinas' },
      { label: 'Colway® Native Bio-Collagen', labelEs: 'Colway® Tropocolágeno Nativo' },
      { label: 'UltraPerson™ Clinical Nutraceuticals', labelEs: 'UltraPerson™ Nutracéutica Clínica' },
      { label: 'Pharmaceutical APIs & Compounding', labelEs: 'Materia Prima Farmacéutica & APIs' },
    ]
  },
  {
    id: 'diagnostics',
    title: 'Diagnostics & Pathways',
    titleMobile: 'Diagnostics & Clinical Pathways',
    titleEs: 'Diagnóstico & Vías',
    icon: Microscope,
    links: [
      { label: 'TeleTest® Laboratory Diagnostics', labelEs: 'TeleTest® Diagnóstico de Laboratorio' },
      { label: 'Bloodo™ Capillary Biomarkers (DBS)', labelEs: 'Diagnóstico Capilar DBS Bloodo™' },
      { label: 'ETERNA® Epigenetics & Multi-Omics', labelEs: 'ETERNA® Epigenética & Multi-Ómica' },
      { label: 'Clinical Protocols Directory', labelEs: 'Directorio de Protocolos Clínicos' },
    ]
  },
  {
    id: 'practitioner',
    title: 'Practitioner & Ops',
    titleMobile: 'Practitioner & Clinical Ops',
    titleEs: 'Portal Médico & B2B',
    icon: Briefcase,
    links: [
      { label: 'Physician & Clinic Portal (/dr)', labelEs: 'Portal Médico Facultativo (/dr)' },
      { label: 'Digital Compounding E-Rx', labelEs: 'Prescripción Electrónica (E-Rx)' },
      { label: 'B2B Wholesale Pricing', labelEs: 'Tarifario Mayorista B2B' },
      { label: 'Specimen & COA Verification', labelEs: 'Verificación de Lotes & COAs' },
    ]
  }
];

/**
 * PublicUnifiedFooter
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud Console compliant clinical and institutional footer.
 * Completely static & non-clickable as per strict specification.
 */
export default function PublicUnifiedFooter({ lang = 'en', minimal = false }) {
  const isEs = lang === 'es';
  const [openMobileSections, setOpenMobileSections] = useState({});

  const toggleMobileSection = (id) => {
    setOpenMobileSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const textStyle = {
    color: '#5f6368',
    textDecoration: 'none',
    cursor: 'default',
    pointerEvents: 'none'
  };

  if (minimal) {
    return (
      <footer
        id="public-unified-footer"
        className="public-unified-footer public-unified-footer-minimal"
      >
        <div className="public-footer-container public-footer-container-minimal">
          <div className="public-footer-copyright">
            © 2026 <strong style={{ color: '#202124' }}>Atlas Health Services</strong>. {isEs ? 'Todos los derechos reservados.' : 'All rights reserved.'}
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer
      id="public-unified-footer"
      className="public-unified-footer"
      style={{ pointerEvents: 'none', userSelect: 'none' }}
    >
      <div className="public-footer-container">
        
        {/* ── DESKTOP & TABLET VIEW (Clean 4-Column GCP Grid) ── */}
        <div className="public-footer-desktop-grid">
          
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

          {/* Columns 2-4: Curated Directories (Static, Non-Clickable) */}
          {FOOTER_SECTIONS.map((section) => {
            const SectionIcon = section.icon;
            return (
              <div key={section.id}>
                <div className="public-footer-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <SectionIcon size={14} style={{ color: '#5f6368', flexShrink: 0 }} />
                  <span>{isEs ? section.titleEs : section.title}</span>
                </div>
                <ul className="public-footer-links">
                  {section.links.map((link, idx) => (
                    <li key={idx}>
                      <span style={textStyle}>
                        {isEs ? link.labelEs : link.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

        </div>

        {/* ── MOBILE VIEW (Progressive Disclosure Accordions - GCP UX) ── */}
        <div className="public-footer-mobile-view">
          
          {/* Compact Mobile Brand & Status Header */}
          <div className="public-footer-mobile-header">
            <BrandLogo variant="dark" showText={true} />
            <div className="gcp-status-pill gcp-status-pill-mobile">
              <span className="gcp-status-dot" />
              <span>{isEs ? 'Sistemas OK' : 'Operational'}</span>
            </div>
          </div>

          {/* Interactive Mobile Accordions (Static list items) */}
          <div className="public-footer-mobile-accordions">
            {FOOTER_SECTIONS.map((section) => {
              const isOpen = Boolean(openMobileSections[section.id]);
              const SectionIcon = section.icon;
              return (
                <div key={section.id} className="gcp-footer-accordion-item">
                  <div
                    onClick={() => toggleMobileSection(section.id)}
                    className={`gcp-footer-accordion-header ${isOpen ? 'active' : ''}`}
                    style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <SectionIcon size={14} style={{ color: '#5f6368', flexShrink: 0 }} />
                      <span className="gcp-footer-accordion-title">
                        {isEs ? section.titleEs : section.titleMobile}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="gcp-footer-accordion-badge">
                        {section.links.length}
                      </span>
                      <ChevronDown
                        size={15}
                        className={`gcp-footer-accordion-icon ${isOpen ? 'open' : ''}`}
                      />
                    </div>
                  </div>

                  {isOpen && (
                    <ul className="gcp-footer-accordion-list">
                      {section.links.map((link, idx) => (
                        <li key={idx}>
                          <span className="gcp-footer-accordion-link" style={textStyle}>
                            <span>{isEs ? link.labelEs : link.label}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>

        </div>

        {/* ── Bottom Utility Bar: Minimalist & Legal (Static GCP Style) ── */}
        <div className="public-footer-bottom">
          <div className="public-footer-copyright">
            © 2026 <strong style={{ color: '#202124' }}>Atlas Health Services</strong>. {isEs ? 'Todos los derechos reservados.' : 'All rights reserved.'}
          </div>

          <div className="public-footer-legal-links">
            <span className="public-footer-legal-link" style={textStyle}>
              {isEs ? 'Privacidad' : 'Privacy Policy'}
            </span>
            <span className="public-footer-separator">•</span>
            <span className="public-footer-legal-link" style={textStyle}>
              {isEs ? 'Términos' : 'Terms of Service'}
            </span>
            <span className="public-footer-separator">•</span>
            <span className="public-footer-legal-link" style={textStyle}>
              {isEs ? 'Estándares Regulatorios (CPNP / CE-IVDR)' : 'Regulatory (CPNP / CE-IVDR)'}
            </span>
          </div>

          <div className="public-footer-lang-switcher" aria-label="Language selector">
            <Globe size={13} style={{ color: '#5f6368', flexShrink: 0 }} />
            <span
              className={`public-footer-lang-btn ${!isEs ? 'active' : ''}`}
              style={{ cursor: 'default', pointerEvents: 'none' }}
            >
              EN
            </span>
            <span className="public-footer-lang-divider">|</span>
            <span
              className={`public-footer-lang-btn ${isEs ? 'active' : ''}`}
              style={{ cursor: 'default', pointerEvents: 'none' }}
            >
              ES
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
