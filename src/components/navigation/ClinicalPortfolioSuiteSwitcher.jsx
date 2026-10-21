"use client";

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Zap,
  Droplets,
  Dna,
  Activity,
  Shield,
  Layers,
  ChevronRight
} from '@/lib/icons';

const SUITES = [
  {
    id: 'colway',
    slug: 'colway',
    href: '/collection/colway',
    name: 'Colway® Bio-Collagen',
    shortName: 'Colway®',
    domain: 'Tropocollagen & Dermal Biomaterials',
    subdomain: 'Native Triple-Helix Preserved',
    icon: Sparkles,
    color: '#0d9488',
    activeBg: 'rgba(13, 148, 136, 0.08)',
    activeBorder: '#0d9488',
    badge: 'Dermocosmetics'
  },
  {
    id: 'ultraman',
    slug: 'ultraman',
    aliases: ['ultraperson', 'ultraman'],
    href: '/collection/ultraman',
    name: 'Ultraman™ / UltraPerson',
    shortName: 'Ultraman™',
    domain: 'Targeted Cellular Nutraceuticals',
    subdomain: 'PharmaPolis Precision Actives',
    icon: Zap,
    color: '#7c3aed',
    activeBg: 'rgba(124, 58, 237, 0.08)',
    activeBorder: '#7c3aed',
    badge: 'Nutraceuticals'
  },
  {
    id: 'bloodo',
    slug: 'bloodo',
    href: '/collection/bloodo',
    name: 'Bloodo™ Diagnostics',
    shortName: 'Bloodo™',
    domain: 'Capillary Blood DBS Panels',
    subdomain: 'ISO 15189 · CE-IVDR Test Kits',
    icon: Droplets,
    color: '#dc2626',
    activeBg: 'rgba(220, 38, 38, 0.08)',
    activeBorder: '#dc2626',
    badge: 'Diagnostics'
  },
  {
    id: 'teletest',
    slug: 'teletest',
    href: '/collection/teletest',
    name: 'TeleTest Analytika®',
    shortName: 'TeleTest®',
    domain: 'Clinical Genomics & HTMA',
    subdomain: 'European Reference Lab (ICP-MS/MS)',
    icon: Dna,
    color: '#0284c7',
    activeBg: 'rgba(2, 132, 199, 0.08)',
    activeBorder: '#0284c7',
    badge: 'Genomics & Tox'
  },
  {
    id: 'eterna',
    slug: 'eterna',
    href: '/collection/eterna',
    name: 'ETERNA® Longevity DX',
    shortName: 'ETERNA®',
    domain: 'Multi-Omics & Organ Proteomics',
    subdomain: 'Eurofins Genomics +700k SNPs',
    icon: Activity,
    color: '#0369a1',
    activeBg: 'rgba(3, 105, 161, 0.08)',
    activeBorder: '#0369a1',
    badge: 'Multi-Omics'
  },
  {
    id: 'peptides',
    slug: 'peptides',
    href: '/collection/peptides',
    name: 'Peptide Therapeutics',
    shortName: 'Peptides',
    domain: 'Analytical Peptide Monographs',
    subdomain: 'HPLC ≥99.0% Certified Reference',
    icon: Shield,
    color: '#003666',
    activeBg: 'rgba(0, 54, 102, 0.08)',
    activeBorder: '#003666',
    badge: 'Therapeutics'
  }
];

export default function ClinicalPortfolioSuiteSwitcher({ currentSlug = 'colway' }) {
  const normCurrent = (currentSlug || '').toLowerCase();

  return (
    <nav
      aria-label="Atlas Clinical Portfolio Suites Navigation"
      style={{
        width: '100%',
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0.65rem 0',
        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 clamp(1rem, 3vw, 2rem)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        {/* Suite Eyebrow Label (Desktop Only) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexShrink: 0,
            paddingRight: '10px',
            borderRight: '1px solid #e2e8f0',
            fontSize: '0.72rem',
            fontWeight: 800,
            color: '#64748b',
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}
          className="clinical-suite-label-desktop"
        >
          <Layers size={13} color="#003666" />
          <span>Clinical Suites</span>
        </div>

        {/* Scrollable Suite Tabs Strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            paddingBottom: '2px',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            flex: 1
          }}
        >
          {SUITES.map((suite) => {
            const isActive = suite.id === normCurrent ||
              suite.slug === normCurrent ||
              (suite.aliases && suite.aliases.includes(normCurrent));
            const Icon = suite.icon;

            return (
              <Link
                key={suite.id}
                href={suite.href}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  flexShrink: 0,
                  transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                  background: isActive ? suite.activeBg : '#f8fafc',
                  border: isActive ? `1.5px solid ${suite.activeBorder}` : '1px solid #e2e8f0',
                  boxShadow: isActive ? `0 2px 8px ${suite.color}20` : 'none'
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    background: isActive ? suite.color : '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isActive ? '#ffffff' : suite.color,
                    border: isActive ? 'none' : '1px solid #e2e8f0',
                    flexShrink: 0
                  }}
                >
                  <Icon size={13} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: isActive ? 800 : 700,
                        color: isActive ? '#0f172a' : '#475569',
                        letterSpacing: '-0.01em',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {suite.shortName}
                    </span>
                    {isActive && (
                      <span
                        style={{
                          fontSize: '0.62rem',
                          fontWeight: 800,
                          color: suite.color,
                          background: `${suite.color}15`,
                          padding: '1px 5px',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.03em'
                        }}
                      >
                        Active
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: '0.66rem',
                      color: isActive ? suite.color : '#94a3b8',
                      fontWeight: isActive ? 600 : 500,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {suite.domain}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
