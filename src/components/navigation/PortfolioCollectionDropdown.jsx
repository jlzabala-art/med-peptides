"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Zap,
  Droplets,
  Dna,
  Activity,
  Shield,
  Layers,
  ChevronDown,
  Check,
  Search,
  ExternalLink
} from '@/lib/icons';

// Curated Portfolios organized by scientific domain (GCP Taxonomy Standard)
export const PORTFOLIO_GROUPS = [
  {
    category: 'Biomaterials & Dermocosmetics',
    items: [
      {
        id: 'colway',
        slug: 'colway',
        aliases: ['colway'],
        href: '/collection/colway',
        name: 'Colway® Bio-Collagen',
        shortName: 'Colway®',
        domain: 'Tropocollagen & Dermal Biomaterials',
        subdomain: 'Native Triple-Helix Preserved · EU CPNP',
        icon: Sparkles,
        color: '#0d9488',
        badge: 'Biomaterials'
      }
    ]
  },
  {
    category: 'Cellular Nutraceuticals',
    items: [
      {
        id: 'ultraman',
        slug: 'ultraman',
        aliases: ['ultraperson', 'ultraman'],
        href: '/collection/ultraman',
        name: 'Ultraman™ / UltraPerson',
        shortName: 'Ultraman™',
        domain: 'Targeted Cellular Nutraceuticals',
        subdomain: 'PharmaPolis Precision Actives · Longevity',
        icon: Zap,
        color: '#7c3aed',
        badge: 'Nutraceuticals'
      }
    ]
  },
  {
    category: 'Diagnostic Panels & Toxicology',
    items: [
      {
        id: 'bloodo',
        slug: 'bloodo',
        aliases: ['bloodo'],
        href: '/collection/bloodo',
        name: 'Bloodo™ Diagnostics',
        shortName: 'Bloodo™',
        domain: 'Capillary Blood DBS Panels',
        subdomain: 'ISO 15189 · CE-IVDR Certified Kits',
        icon: Droplets,
        color: '#dc2626',
        badge: 'Diagnostics'
      },
      {
        id: 'teletest',
        slug: 'teletest',
        aliases: ['teletest'],
        href: '/collection/teletest',
        name: 'TeleTest® Analytika',
        shortName: 'TeleTest®',
        domain: 'Clinical Genomics & HTMA Toxicology',
        subdomain: 'European Reference Lab (ICP-MS/MS & qPCR)',
        icon: Dna,
        color: '#0284c7',
        badge: 'Genomics & HTMA'
      }
    ]
  },
  {
    category: 'Longevity & Multi-Omics',
    items: [
      {
        id: 'eterna',
        slug: 'eterna',
        aliases: ['eterna'],
        href: '/collection/eterna',
        name: 'ETERNA® Longevity DX',
        shortName: 'ETERNA®',
        domain: 'Multi-Omics & Organ Proteomics',
        subdomain: 'Eurofins Genomics · Biological Age Clocks',
        icon: Activity,
        color: '#0369a1',
        badge: 'Multi-Omics'
      }
    ]
  },
  {
    category: 'Compounding & Peptides',
    items: [
      {
        id: 'peptides',
        slug: 'peptides',
        aliases: ['peptides'],
        href: '/collection/peptides',
        name: 'Peptide Therapeutics',
        shortName: 'Peptides',
        domain: 'Analytical Peptide Monographs & APIs',
        subdomain: 'HPLC ≥99.0% Certified Reference Standards',
        icon: Shield,
        color: '#003666',
        badge: 'Therapeutics'
      }
    ]
  }
];

// Flat list for quick lookup
export const ALL_PORTFOLIOS = PORTFOLIO_GROUPS.flatMap(g => g.items);

export default function PortfolioCollectionDropdown({ currentSlug = 'colway', compact = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  const normCurrent = (currentSlug || '').toLowerCase();

  // Find currently active item
  const activeItem = useMemo(() => {
    return (
      ALL_PORTFOLIOS.find(
        p => p.id === normCurrent || p.slug === normCurrent || (p.aliases && p.aliases.includes(normCurrent))
      ) || ALL_PORTFOLIOS[0]
    );
  }, [normCurrent]);

  // Click outside to dismiss popover (GCP Console Pattern)
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      // Auto focus search field when opened
      setTimeout(() => {
        if (searchInputRef.current) searchInputRef.current.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Filter items based on user search in dropdown
  const filteredGroups = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    if (!q) return PORTFOLIO_GROUPS;

    return PORTFOLIO_GROUPS.map(g => ({
      ...g,
      items: g.items.filter(
        item =>
          item.name.toLowerCase().includes(q) ||
          item.domain.toLowerCase().includes(q) ||
          item.subdomain.toLowerCase().includes(q) ||
          item.badge.toLowerCase().includes(q)
      )
    })).filter(g => g.items.length > 0);
  }, [filterQuery]);

  const ActiveIcon = activeItem.icon;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        display: 'inline-block',
        zIndex: isOpen ? 100 : 20
      }}
    >
      {/* ── GCP Standard Resource Selector Button ── */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Current Portfolio: ${activeItem.name}. Click to switch collection.`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          height: compact ? '32px' : '36px',
          padding: compact ? '0 10px' : '0 12px',
          background: isOpen ? '#f1f5f9' : '#ffffff',
          border: isOpen ? '1px solid #003666' : '1px solid #cbd5e1',
          borderRadius: '8px',
          color: '#0f172a',
          fontSize: '0.80rem',
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: isOpen
            ? '0 0 0 3px rgba(0, 54, 102, 0.12)'
            : '0 1px 2px rgba(0,0,0,0.04)',
          transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Subtle Category/Scope Label */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            color: '#64748b',
            fontSize: '0.72rem',
            fontWeight: 750,
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}
        >
          <Layers size={13} color="#003666" />
          <span>Portfolio:</span>
        </span>

        {/* Active Item Pill Indicator */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: '#0f172a',
            fontWeight: 750
          }}
        >
          <span
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '4px',
              background: `${activeItem.color}15`,
              color: activeItem.color,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <ActiveIcon size={11} />
          </span>
          <span>{activeItem.shortName}</span>
        </span>

        {/* Domain Subtitle Tag (Hidden on very compact screens) */}
        {!compact && (
          <span
            className="portfolio-switcher-domain-tag"
            style={{
              fontSize: '0.70rem',
              color: '#64748b',
              fontWeight: 500,
              paddingLeft: '4px',
              borderLeft: '1px solid #e2e8f0'
            }}
          >
            {activeItem.badge}
          </span>
        )}

        {/* Chevron Indicator */}
        <ChevronDown
          size={14}
          color="#64748b"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            marginLeft: '2px'
          }}
        />
      </button>

      {/* ── GCP Console Style Grouped Dropdown Popover ── */}
      {isOpen && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: 'clamp(320px, 90vw, 420px)',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '12px',
            boxShadow: '0 12px 36px rgba(15, 23, 42, 0.16), 0 2px 8px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            zIndex: 1000,
            animation: 'fadeInSlideDown 0.15s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Header Bar */}
          <div
            style={{
              padding: '12px 14px 10px',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '0.80rem',
                  fontWeight: 800,
                  color: '#003666',
                  letterSpacing: '-0.01em'
                }}
              >
                Specialized Product Portfolios
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '1px' }}>
                Curated catalogs across biomaterials, nutraceuticals & diagnostics
              </div>
            </div>
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                color: '#0284c7',
                background: '#e0f2fe',
                padding: '2px 7px',
                borderRadius: '9999px'
              }}
            >
              {ALL_PORTFOLIOS.length} Collections
            </span>
          </div>

          {/* Quick Filter Search Input */}
          <div
            style={{
              padding: '8px 12px',
              borderBottom: '1px solid #f1f5f9',
              background: '#ffffff',
              position: 'relative'
            }}
          >
            <Search
              size={14}
              color="#94a3b8"
              style={{
                position: 'absolute',
                left: '20px',
                top: '50%',
                transform: 'translateY(-50%)'
              }}
            />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search portfolios, biomaterials or diagnostics..."
              value={filterQuery}
              onChange={e => setFilterQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px 6px 30px',
                fontSize: '0.78rem',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                outline: 'none',
                background: '#f8fafc',
                color: '#0f172a',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Scrollable Groups Container */}
          <div
            style={{
              maxHeight: '380px',
              overflowY: 'auto',
              padding: '6px 0',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {filteredGroups.length === 0 ? (
              <div
                style={{
                  padding: '24px 16px',
                  textAlign: 'center',
                  fontSize: '0.78rem',
                  color: '#94a3b8'
                }}
              >
                No portfolios match &ldquo;{filterQuery}&rdquo;
              </div>
            ) : (
              filteredGroups.map((group, gIdx) => (
                <div key={gIdx} style={{ marginBottom: '6px' }}>
                  {/* Category Taxonomy Label */}
                  <div
                    style={{
                      padding: '6px 14px 4px',
                      fontSize: '0.66rem',
                      fontWeight: 800,
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                  >
                    {group.category}
                  </div>

                  {/* Portfolio Items in this category */}
                  {group.items.map(item => {
                    const isSelected = item.id === activeItem.id;
                    const ItemIcon = item.icon;

                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px',
                          padding: '8px 14px',
                          textDecoration: 'none',
                          background: isSelected ? `${item.color}0a` : 'transparent',
                          borderLeft: isSelected ? `3px solid ${item.color}` : '3px solid transparent',
                          transition: 'background 0.12s ease'
                        }}
                        onMouseEnter={e => {
                          if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                        }}
                        onMouseLeave={e => {
                          if (!isSelected) e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        {/* Left: Branded Icon + Information */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          <div
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '7px',
                              background: isSelected ? item.color : `${item.color}15`,
                              color: isSelected ? '#ffffff' : item.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <ItemIcon size={14} />
                          </div>

                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <span
                                style={{
                                  fontSize: '0.80rem',
                                  fontWeight: isSelected ? 800 : 700,
                                  color: isSelected ? '#0f172a' : '#334155',
                                  lineHeight: 1.2
                                }}
                              >
                                {item.name}
                              </span>
                            </div>
                            <div
                              style={{
                                fontSize: '0.68rem',
                                color: isSelected ? item.color : '#64748b',
                                fontWeight: isSelected ? 600 : 500,
                                marginTop: '1px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {item.subdomain}
                            </div>
                          </div>
                        </div>

                        {/* Right: Active Checkmark or Category Badge */}
                        <div style={{ flexShrink: 0 }}>
                          {isSelected ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                fontSize: '0.64rem',
                                fontWeight: 800,
                                color: item.color,
                                background: `${item.color}15`,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                textTransform: 'uppercase'
                              }}
                            >
                              <Check size={10} /> Active
                            </span>
                          ) : (
                            <span
                              style={{
                                fontSize: '0.64rem',
                                color: '#94a3b8',
                                background: '#f1f5f9',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: 600
                              }}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer note */}
          <div
            style={{
              padding: '8px 14px',
              background: '#f8fafc',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.68rem',
              color: '#94a3b8'
            }}
          >
            <span>Atlas Health Services · Global Portfolios</span>
            <span style={{ fontSize: '0.64rem' }}>ESC to close</span>
          </div>
        </div>
      )}
    </div>
  );
}
