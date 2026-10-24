"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown
} from '@/lib/icons';
import BrandLogo from '../common/BrandLogo';
import './PublicUnifiedFooter.css';

const FOOTER_SECTIONS = [
  {
    id: 'therapeutics',
    title: 'Therapeutics',
    titleMobile: 'Therapeutics & Formulations',
    titleEs: 'Terapéutica',
    links: [
      { label: 'Clinical Peptide Monographs & Incretins', labelEs: 'Monografías Peptídicas Clínicas & Incretinas', href: '/collection/peptides' },
      { label: 'Colway® Native Bio-Collagen', labelEs: 'Colway® Tropocolágeno Nativo', href: '/collection/colway' },
      { label: 'UltraPerson™ Clinical Nutraceuticals', labelEs: 'UltraPerson™ Nutracéutica Clínica', href: '/collection/ultraperson' },
      { label: 'Pharmaceutical APIs & Compounding', labelEs: 'Materia Prima Farmacéutica & APIs', href: '/collection/research-supplies' },
    ]
  },
  {
    id: 'diagnostics',
    title: 'Diagnostics & Pathways',
    titleMobile: 'Diagnostics & Clinical Pathways',
    titleEs: 'Diagnóstico & Vías',
    links: [
      { label: 'TeleTest® Laboratory Diagnostics', labelEs: 'TeleTest® Diagnóstico de Laboratorio', href: '/collection/teletest' },
      { label: 'Bloodo™ Capillary Biomarkers (DBS)', labelEs: 'Diagnóstico Capilar DBS Bloodo™', href: '/collection/bloodo' },
      { label: 'ETERNA® Epigenetics & Multi-Omics', labelEs: 'ETERNA® Epigenética & Multi-Ómica', href: '/collection/eterna' },
      { label: 'Clinical Protocols Directory', labelEs: 'Directorio de Protocolos Clínicos', href: '/protocols' },
    ]
  },
  {
    id: 'practitioner',
    title: 'Practitioner & Ops',
    titleMobile: 'Practitioner & Clinical Ops',
    titleEs: 'Portal Médico & B2B',
    links: [
      { label: 'Physician & Clinic Portal (/dr)', labelEs: 'Portal Médico Facultativo (/dr)', href: '/login' },
      { label: 'Digital Compounding E-Rx', labelEs: 'Prescripción Electrónica (E-Rx)', href: '/rx/intake' },
      { label: 'B2B Wholesale Pricing', labelEs: 'Tarifario Mayorista B2B', href: '/b2b/colway-prices' },
      { label: 'Specimen & COA Verification', labelEs: 'Verificación de Lotes & COAs', href: '/verify' },
    ]
  }
];

/**
 * PublicUnifiedFooter
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud Console compliant clinical and institutional footer.
 * Features an adaptive, progressive-disclosure mobile accordion layout,
 * dedicated Atlas AI Clinical Consultant copilot dock, and safe clearance
 * for floating action docks and tab bars.
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

  const linkStyle = {
    color: '#5f6368',
    textDecoration: 'none',
    transition: 'color 0.15s ease'
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
    >
      <div className="public-footer-container">
        
        {/* ── DESKTOP & TABLET VIEW (Clean 4-Column GCP Grid) ── */}
        <div className="public-footer-desktop-grid">
          
          {/* Column 1: Institutional Identity, Live Operational Status & Atlas AI Consultant */}
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

          {/* Columns 2-4: Curated Directories */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.id}>
              <div className="public-footer-title">
                {isEs ? section.titleEs : section.title}
              </div>
              <ul className="public-footer-links">
                {section.links.map((link, idx) => (
                  <li key={idx}>
                    <Link href={link.href} style={linkStyle}>
                      {isEs ? link.labelEs : link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

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

          {/* Interactive Mobile Accordions (Rule #26 Progressive Disclosure) */}
          <div className="public-footer-mobile-accordions">
            {FOOTER_SECTIONS.map((section) => {
              const isOpen = Boolean(openMobileSections[section.id]);
              return (
                <div key={section.id} className="gcp-footer-accordion-item">
                  <button
                    type="button"
                    onClick={() => toggleMobileSection(section.id)}
                    className={`gcp-footer-accordion-header ${isOpen ? 'active' : ''}`}
                    aria-expanded={isOpen}
                  >
                    <span className="gcp-footer-accordion-title">
                      {isEs ? section.titleEs : section.titleMobile}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="gcp-footer-accordion-badge">
                        {section.links.length}
                      </span>
                      <ChevronDown
                        size={15}
                        className={`gcp-footer-accordion-icon ${isOpen ? 'open' : ''}`}
                      />
                    </div>
                  </button>

                  {isOpen && (
                    <ul className="gcp-footer-accordion-list">
                      {section.links.map((link, idx) => (
                        <li key={idx}>
                          <Link href={link.href} className="gcp-footer-accordion-link">
                            <span>{isEs ? link.labelEs : link.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>

        </div>

        {/* ── Bottom Utility Bar: Minimalist & Legal (GCP Style) ── */}
        <div className="public-footer-bottom">
          <div className="public-footer-copyright">
            © 2026 <strong style={{ color: '#202124' }}>Atlas Health Services</strong>. {isEs ? 'Todos los derechos reservados.' : 'All rights reserved.'}
          </div>
        </div>

      </div>
    </footer>
  );
}
