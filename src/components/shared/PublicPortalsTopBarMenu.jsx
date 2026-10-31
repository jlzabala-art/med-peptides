'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Globe, ExternalLink, Copy, Check, ChevronDown, 
  ShoppingBag, Dna, Sparkles, FlaskConical, FileText, Tags, Eye 
} from '@/lib/icons';

const PUBLIC_PORTALS = [
  {
    id: 'b2c-store',
    name: 'B2C Storefront',
    subtitle: 'Public Catalog & Patient Store',
    path: '/',
    icon: ShoppingBag,
    color: '#0284c7',
    badge: 'Live Shop'
  },
  {
    id: '24genetics',
    name: '24Genetics Genomics',
    subtitle: 'Genomic Vials & Epigenetic Price List',
    path: '/pricing/24genetics',
    icon: Dna,
    color: '#0d9488',
    badge: 'B2B/B2C'
  },
  {
    id: 'colway',
    name: 'Colway Trichology',
    subtitle: 'Capillary Stem Cells & Bio-Peptides',
    path: '/pricing/colway',
    icon: Sparkles,
    color: '#7c3aed',
    badge: 'Clinical'
  },
  {
    id: 'compounding',
    name: 'Custom Compounding Lab',
    subtitle: 'Interactive Galenic Capsule Builder',
    path: '/compounding',
    icon: FlaskConical,
    color: '#ea580c',
    badge: 'Lab Studio'
  },
  {
    id: 'protocols',
    name: 'Clinical Protocols Directory',
    subtitle: 'Public Dosage & Protocol Formulary',
    path: '/proto',
    icon: FileText,
    color: '#16a34a',
    badge: 'Formulary'
  },
  {
    id: 'labels',
    name: 'Label Studio Standalone',
    subtitle: 'Direct Warehouse Label Printer',
    path: '/labels',
    icon: Tags,
    color: '#475569',
    badge: 'Logistics'
  }
];

export default function PublicPortalsTopBarMenu({ iconBtnStyle = {} }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleCopy = (e, portal) => {
    e.stopPropagation();
    e.preventDefault();
    const fullUrl = `${window.location.origin}${portal.path}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(fullUrl);
      setCopiedId(portal.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handlePreview = (e, portal) => {
    e.stopPropagation();
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('open-customer-preview', {
      detail: { url: portal.path, title: portal.name }
    }));
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* ── TopBar Trigger Button ── */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          ...iconBtnStyle,
          height: '28px',
          padding: '0.2rem 0.65rem',
          borderRadius: '14px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: isOpen ? '#f1f5f9' : '#ffffff',
          border: '1px solid #cbd5e1',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        title="Public Portals & Live Catalogs"
        aria-label="Public Portals Menu"
        aria-expanded={isOpen}
      >
        <Globe size={13} color="#0284c7" style={{ flexShrink: 0 }} />
        <span
          style={{
            fontSize: '0.74rem',
            fontWeight: 700,
            color: '#0f172a',
            letterSpacing: '-0.01em',
            whiteSpace: 'nowrap',
          }}
        >
          Public Portals
        </span>
        <ChevronDown 
          size={11} 
          color="#64748b" 
          style={{ 
            transition: 'transform 0.2s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' 
          }} 
        />
      </button>

      {/* ── Dropdown Menu ── */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: '320px',
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            overflow: 'hidden',
            animation: 'fadeInMenu 0.15s ease-out'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
                Live Storefronts & Catalogs
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                Share links or preview what customers see
              </div>
            </div>
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                color: '#0284c7',
                backgroundColor: '#e0f2fe',
                padding: '2px 6px',
                borderRadius: '4px'
              }}
            >
              Public
            </span>
          </div>

          {/* Items List */}
          <div style={{ padding: '6px' }}>
            {PUBLIC_PORTALS.map((portal) => {
              const IconComp = portal.icon;
              const isCopied = copiedId === portal.id;

              return (
                <div
                  key={portal.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    transition: 'background-color 0.15s ease',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {/* Left: Icon & Title */}
                  <a
                    href={portal.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      textDecoration: 'none',
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        backgroundColor: `${portal.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <IconComp size={15} color={portal.color} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          color: '#0f172a',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {portal.name}
                        </span>
                        <span
                          style={{
                            fontSize: '0.6rem',
                            fontWeight: 700,
                            padding: '1px 4px',
                            borderRadius: '3px',
                            backgroundColor: '#f1f5f9',
                            color: '#475569',
                          }}
                        >
                          {portal.badge}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '0.68rem',
                          color: '#64748b',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {portal.subtitle}
                      </div>
                    </div>
                  </a>

                  {/* Right: Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '8px' }}>
                    {/* Copy Link Button */}
                    <button
                      type="button"
                      onClick={(e) => handleCopy(e, portal)}
                      style={{
                        padding: '4px',
                        borderRadius: '4px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: isCopied ? '#f0fdf4' : '#ffffff',
                        color: isCopied ? '#16a34a' : '#64748b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease',
                      }}
                      title={isCopied ? 'Link Copied!' : 'Copy Public URL'}
                    >
                      {isCopied ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                    </button>

                    {/* Preview Drawer Button */}
                    <button
                      type="button"
                      onClick={(e) => handlePreview(e, portal)}
                      style={{
                        padding: '4px',
                        borderRadius: '4px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#ffffff',
                        color: '#64748b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease',
                      }}
                      title="Preview in Panel (Side Drawer)"
                    >
                      <Eye size={12} />
                    </button>

                    {/* Open in New Tab Button */}
                    <a
                      href={portal.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '4px',
                        borderRadius: '4px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#ffffff',
                        color: '#64748b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none',
                        transition: 'all 0.15s ease',
                      }}
                      title="Open in New Tab"
                    >
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
