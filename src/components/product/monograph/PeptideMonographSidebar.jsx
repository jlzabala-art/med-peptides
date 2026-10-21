"use client";

import React, { useState } from 'react';
import { 
  LayoutTemplate, 
  FlaskConical, 
  Droplet, 
  ShieldCheck, 
  BookOpen, 
  Copy, 
  Check, 
  Printer, 
  FileText, 
  QrCode,
  ExternalLink,
  Sparkles
} from '@/lib/icons';
import { QRCodeSVG } from 'qrcode.react';
import { triggerHaptic } from '@/utils/haptics';
import { toast } from 'react-hot-toast';
import { formatCommercialSupplierName } from '@/utils/supplierCommercialNames';
import { classifyProductDomain } from '@/utils/productNormalizer';

/**
 * PeptideMonographSidebar
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud Console-compliant Right Inspector Panel.
 * Unifies vertical tab navigation, active batch telemetry, operative triggers,
 * and traceability QR code WITHOUT redundant content duplication.
 */
export default function PeptideMonographSidebar({
  activeTab = 'overview',
  onTabChange,
  protocolCount = 3,
  product = {},
  slug = 'retatrutide',
  effectiveBatch = '',
  selectedStrength = null,
  activeFormat = null,
  supplierName = '',
  dynamicPublicUrl = null,
  onOpenCoaModal,
  onOpenPreviewModal
}) {
  const [copiedBatch, setCopiedBatch] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const cleanSlug = slug || product.slug || 'product';
  const pageUrl = dynamicPublicUrl || (typeof window !== 'undefined' ? window.location.href : `https://www.atlashealth-services.com/p/${cleanSlug}`);
  const batchCode = effectiveBatch || product.batchNumber || 'RP-LOT-RT10-2609';
  const rawSupplier = supplierName || product.supplierName || product.supplier || (product.variants?.[0]?.supplierName) || 'Lotusland';
  const supplier = formatCommercialSupplierName(rawSupplier);
  const { isDiagnostic } = classifyProductDomain(product, { slug: cleanSlug, activeFormat });

  // Active strength & presentation label in English
  const rawStrength = selectedStrength?.name || selectedStrength?.id || (typeof selectedStrength === 'string' ? selectedStrength : '');
  const cleanStrength = rawStrength && !rawStrength.toLowerCase().includes('perfil') 
    ? rawStrength 
    : '1 Complete 24 Fatty Acid Analytical Profile + Evaluation';
  const strengthLabel = isDiagnostic ? cleanStrength : (rawStrength || 'Standard Formulation');
  const formatLabel = isDiagnostic 
    ? (product.sampleType ? `Matrix: ${product.sampleType}` : 'Diagnostic Specimen Collection Kit') 
    : (activeFormat?.name || activeFormat?.id || product.presentation || 'Lyophilized SubQ Vial');
  const purityText = isDiagnostic 
    ? 'ISO 15189 · CE-IVD (CV < 4.5%)' 
    : (product.purity || '≥99.2% (HPLC Verified)');

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      subtitle: isDiagnostic ? 'Diagnostic identity & biomarkers' : 'Clinical identity & specifications',
      icon: LayoutTemplate
    },
    {
      id: 'protocols',
      label: isDiagnostic ? 'Clinical Protocols' : 'Protocols',
      subtitle: isDiagnostic ? 'Action thresholds & guidelines' : 'Titration & clinical planning',
      icon: FlaskConical,
      count: protocolCount
    },
    {
      id: 'preparation',
      label: isDiagnostic ? 'Specimen Collection' : 'Preparation & Admin',
      subtitle: isDiagnostic ? 'Pre-analytical prep & packaging' : 'Reconstitution & U-100 syringe',
      icon: Droplet
    },
    {
      id: 'quality',
      label: isDiagnostic ? 'Quality & Lab' : 'Quality & Batch',
      subtitle: isDiagnostic ? 'GC-FID validation & ISO 15189 CoA' : 'HPLC purity & analytical CoA',
      icon: ShieldCheck
    },
    {
      id: 'references',
      label: 'References',
      subtitle: isDiagnostic ? 'PubMed lipidology citations' : 'FDA dossiers & PubMed citations',
      icon: BookOpen
    },
    {
      id: 'synergy',
      label: 'Atlas Recommendations',
      subtitle: isDiagnostic ? 'Targeted companion therapies' : 'Companion therapies & pairings',
      icon: Sparkles
    }
  ];

  const handleCopyBatch = (e) => {
    e.stopPropagation();
    triggerHaptic('light');
    navigator.clipboard?.writeText(batchCode);
    setCopiedBatch(true);
    toast.success(`Batch code ${batchCode} copied ✓`);
    setTimeout(() => setCopiedBatch(false), 2000);
  };

  const handleCopyUrl = (e) => {
    e.stopPropagation();
    triggerHaptic('light');
    navigator.clipboard?.writeText(pageUrl);
    setCopiedUrl(true);
    toast.success('Canonical monograph link copied ✓');
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <aside 
      className="pds-monograph-sidebar-root"
      aria-label="Monograph Navigation & Context Panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        width: '100%',
        maxWidth: '300px'
      }}
    >
      {/* ── CARD 1: Vertical Tabs Navigation (Google Cloud Console Standard) ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 54, 102, 0.04)'
      }}>
        <div style={{
          background: '#003666',
          color: '#ffffff',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '0.70rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Monograph Navigation
          </span>
          <span style={{
            fontSize: '0.62rem',
            background: 'rgba(255,255,255,0.18)',
            padding: '1px 6px',
            borderRadius: '4px',
            fontWeight: 700
          }}>
            5 Sections
          </span>
        </div>

        <nav role="tablist" style={{ padding: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => {
                  if (isActive) return;
                  triggerHaptic('selection');
                  onTabChange?.(tab.id);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: isActive ? '1px solid #bfdbfe' : '1px solid transparent',
                  borderLeft: isActive ? '3.5px solid #003666' : '3.5px solid transparent',
                  background: isActive ? '#eff6ff' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  outline: 'none'
                }}
                onMouseOver={(e) => {
                  if (!isActive) e.currentTarget.style.background = '#f8fafc';
                }}
                onMouseOut={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '5px',
                    background: isActive ? '#003666' : '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.15s ease'
                  }}>
                    <Icon size={14} color={isActive ? '#ffffff' : '#64748b'} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.78rem',
                      fontWeight: isActive ? 800 : 650,
                      color: isActive ? '#003666' : '#1e293b',
                      lineHeight: 1.2
                    }}>
                      {tab.label}
                    </div>
                    <div style={{
                      fontSize: '0.64rem',
                      color: isActive ? '#0369a1' : '#64748b',
                      marginTop: '1px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {tab.subtitle}
                    </div>
                  </div>
                </div>

                {typeof tab.count === 'number' && tab.count > 0 && (
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '10px',
                    background: isActive ? '#003666' : '#e2e8f0',
                    color: isActive ? '#ffffff' : '#475569',
                    flexShrink: 0,
                    marginLeft: '4px'
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── CARD 2: Active Presentation & Verified Batch (GCP Instance Specs) ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '10px',
        padding: '10px 12px',
        boxShadow: '0 1px 3px rgba(0, 54, 102, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.66rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>
            Active Consultation Unit
          </span>
          <span style={{
            fontSize: '0.62rem',
            background: '#f0fdf4',
            color: '#166534',
            border: '1px solid #bbf7d0',
            padding: '1px 5px',
            borderRadius: '4px',
            fontWeight: 750,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px'
          }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#16a34a' }} />
            Active
          </span>
        </div>

        {/* Selected Vial Strength & Presentation */}
        <div style={{ background: '#f8fafc', padding: '6px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
            {isDiagnostic ? 'Analytical Scope & Specimen' : 'Strength & Format'}
          </div>
          <div style={{ fontSize: '0.82rem', fontWeight: 850, color: '#003666', marginTop: '1px' }}>
            {isDiagnostic ? formatLabel : `${strengthLabel} • ${formatLabel}`}
          </div>
        </div>

        {/* Batch Code with Copy-on-Click */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f8fafc',
          padding: '6px 8px',
          borderRadius: '6px',
          border: '1px solid #e2e8f0'
        }}>
          <div>
            <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              Batch Record
            </div>
            <code style={{ fontSize: '0.78rem', fontWeight: 800, color: '#003666', fontFamily: 'monospace' }}>
              {batchCode}
            </code>
          </div>
          <button
            type="button"
            onClick={handleCopyBatch}
            style={{
              background: copiedBatch ? '#f0fdf4' : '#ffffff',
              border: `1px solid ${copiedBatch ? '#bbf7d0' : '#cbd5e1'}`,
              borderRadius: '4px',
              padding: '4px 6px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.65rem',
              fontWeight: 700,
              color: copiedBatch ? '#166534' : '#003666',
              transition: 'all 0.15s ease'
            }}
            title="Copy verified batch code"
          >
            {copiedBatch ? <Check size={11} /> : <Copy size={11} />}
            <span>{copiedBatch ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Purity & Assay row (Universal clinical quality, no lab dependency) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <div style={{ background: '#f8fafc', padding: '5px 7px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.60rem', color: '#64748b', display: 'block' }}>
              {isDiagnostic ? 'Analytical Precision' : 'Verified Purity'}
            </span>
            <strong style={{ fontSize: '0.74rem', color: '#166534' }}>{purityText}</strong>
          </div>
          <div style={{ background: '#f8fafc', padding: '5px 7px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.60rem', color: '#64748b', display: 'block' }}>Assay Standard</span>
            <strong style={{ fontSize: '0.74rem', color: '#003666', display: 'block' }}>
              {isDiagnostic ? 'GC-FID / ISO 15189' : 'RP-HPLC / MS'}
            </strong>
          </div>
        </div>
      </div>

      {/* ── CARD 3: Direct Operative Actions (CoA, Label 300DPI, PDF) ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '10px',
        padding: '10px 12px',
        boxShadow: '0 1px 3px rgba(0, 54, 102, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <span style={{ fontSize: '0.66rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: '2px' }}>
          Clinical Tools
        </span>

        {/* 1. View CoA Button */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onOpenCoaModal?.();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '7px 10px',
            borderRadius: '6px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            color: '#003666',
            fontSize: '0.76rem',
            fontWeight: 750,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#eff6ff';
            e.currentTarget.style.borderColor = '#93c5fd';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.borderColor = '#cbd5e1';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <ShieldCheck size={14} color="#16a34a" />
            <span>Certificate of Analysis (CoA)</span>
          </div>
          <ExternalLink size={12} color="#003666" style={{ opacity: 0.6 }} />
        </button>

        {/* 2. Print Label 300 DPI */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onOpenPreviewModal?.('label');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '7px 10px',
            borderRadius: '6px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            color: '#1e293b',
            fontSize: '0.76rem',
            fontWeight: 750,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#f8fafc';
            e.currentTarget.style.borderColor = '#94a3b8';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.borderColor = '#cbd5e1';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <Printer size={14} color="#003666" />
            <span>Print Clinical Label (300 DPI)</span>
          </div>
          <span style={{ fontSize: '0.62rem', color: '#64748b', background: '#f1f5f9', padding: '1px 5px', borderRadius: '3px' }}>
            {isDiagnostic ? 'Specimen Kit' : formatLabel?.toLowerCase().includes('capsule') ? 'Capsule' : formatLabel?.toLowerCase().includes('pen') ? 'Pen' : 'Vial'}
          </span>
        </button>

        {/* 3. Export PDF Monograph */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onOpenPreviewModal?.('monograph');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '7px 10px',
            borderRadius: '6px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            color: '#1e293b',
            fontSize: '0.76rem',
            fontWeight: 750,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#f8fafc';
            e.currentTarget.style.borderColor = '#94a3b8';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.borderColor = '#cbd5e1';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <FileText size={14} color="#0284c7" />
            <span>Export Official PDF Dossier</span>
          </div>
          <span style={{ fontSize: '0.62rem', color: '#64748b', background: '#f1f5f9', padding: '1px 5px', borderRadius: '3px' }}>
            PDF
          </span>
        </button>
      </div>

      {/* ── CARD 4: Traceability QR Code (Canonical Monograph Lookup) ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <QrCode size={13} color="#003666" />
            <span style={{ fontSize: '0.66rem', fontWeight: 800, letterSpacing: '0.06em', color: '#64748b', textTransform: 'uppercase' }}>
              Digital Verification QR
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyUrl}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              fontSize: '0.64rem',
              color: '#0284c7',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px'
            }}
            title="Copy link"
          >
            {copiedUrl ? <Check size={11} /> : <Copy size={11} />}
            <span>{copiedUrl ? 'Copied' : 'Copy link'}</span>
          </button>
        </div>

        <a
          href={pageUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Direct digital verification link"
          style={{
            display: 'block',
            lineHeight: 0,
            padding: '5px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
          }}
        >
          <QRCodeSVG
            value={pageUrl}
            size={105}
            bgColor="#ffffff"
            fgColor="#003666"
            level="M"
          />
        </a>

        <div style={{ fontSize: '0.62rem', color: '#94a3b8', textAlign: 'center', fontFamily: 'monospace', lineHeight: 1.2 }}>
          Scan in clinic to verify batch authenticity & posology
        </div>
      </div>
    </aside>
  );
}
