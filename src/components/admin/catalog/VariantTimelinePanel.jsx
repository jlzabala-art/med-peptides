"use client";

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  History, 
  DollarSign, 
  FlaskConical, 
  Building2, 
  ShieldCheck, 
  Package, 
  User, 
  Clock, 
  ArrowRight,
  Sparkles,
  Calendar,
  Tag,
  Percent,
  Zap,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  FileCheck,
  Barcode,
  Copy,
  Check,
  Share2,
  QrCode,
  FileText,
  X,
  Download
} from 'lucide-react';
import notifier from '@/services/NotificationService';
import { formatTimelineValue } from '../../../utils/variantTimelineHelper';
import { formatNumberAdaptive } from '../../../utils/formatters';
import InlineEditableCell from '../../ui/InlineEditableCell';
import SupplierAgreementCard from './cards/SupplierAgreementCard';
import ZohoReconcilerCard from './cards/ZohoReconcilerCard';
import SupplierQuotationDetailDrawer from '../quotations/SupplierQuotationDetailDrawer';
import UniversalShareDrawer from '../../ui/UniversalShareDrawer';

/**
 * VariantTimelinePanel
 * ─────────────────────────────────────────────────────────────────────────────
 * Expandable master-detail panel rendering:
 *  1. Unified 3D Traceability Suite (Datasheet, Web Share, Shipping & Client Labels with shared 3D Matrix)
 *  2. Supplier Pricing & Commercial Agreement Card (Quotation Date, Discounts, MOQ, Multi-currency)
 *  3. Bulk API Yield & Dilution Calculator (Raw Materials to Patient Vials Matrix)
 *  4. Zoho Books & Inventory Reconciler Card (SKU, Sync status, Create in Zoho)
 *  5. Chronological audit trail of changes made to the variant with quotation links.
 */
export default function VariantTimelinePanel({ variant, selectedProduct, onUpdateVariantField }) {
  const [activeQuotationId, setActiveQuotationId] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [shareDrawerOpen, setShareDrawerOpen] = useState(false);
  const [is3DModalOpen, setIs3DModalOpen] = useState(false);
  const [copied3DUrl, setCopied3DUrl] = useState(false);

  // Deterministic fallback unique code if not explicitly saved on the variant
  const defaultSuppCode = (variant?.supplierId || variant?.supplier || 'RP').replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase();
  const defaultDoseCode = String(variant?.dosage || variant?.dose || '10MG').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const idSuffix = String(variant?.id || 'V1').replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase() || 'V01';
  const defaultVialCode = `RP-${defaultSuppCode}-${defaultDoseCode}-${idSuffix}`;
  const currentVialCode = variant?.vialCode || variant?.batchCode || variant?.batchNumber || defaultVialCode;

  const handleCopyVialCode = (code) => {
    if (!code) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      notifier.success(`Vial Code copied: ${code}`);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const productSlug = encodeURIComponent(selectedProduct?.slug || selectedProduct?.id || '');
  const variantIdParam = encodeURIComponent(variant?.id || '');
  const suppParam = encodeURIComponent(variant?.supplierId || variant?.supplier || '');
  const doseParam = encodeURIComponent(variant?.dosage || variant?.dose || '');
  const formatParam = encodeURIComponent(variant?.presentation || variant?.format || 'vial');
  const batchParam = encodeURIComponent(currentVialCode);

  const rawSlug = selectedProduct?.slug || selectedProduct?.id || '';
  const canonicalMonographPath = `/p/${encodeURIComponent(rawSlug)}?dose=${doseParam}&presentation=${formatParam}&supplier=${suppParam}&batch=${batchParam}&vialCode=${batchParam}`;
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const absoluteMonographUrl = `${origin}${canonicalMonographPath}`;

  const baseLabelQuery = `variantId=${variantIdParam}&supplier=${suppParam}&dose=${doseParam}&presentation=${formatParam}&batch=${batchParam}&vialCode=${batchParam}&url=${encodeURIComponent(absoluteMonographUrl)}`;

  const cleanStr = (s) => String(s || '').trim().replace(/^supplier[-_]/i, '').replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').toLowerCase();
  const vFileSuffix = `${cleanStr(rawSlug)}_${cleanStr(variant?.dosage || variant?.dose || '10mg')}_${cleanStr(variant?.presentation || 'vial')}_${cleanStr(variant?.supplierId || variant?.supplier || 'lotusland')}_${cleanStr(currentVialCode)}`;

  const shippingLabelUrl = `/api/vial-label/${productSlug}?format=38x90&type=shipping&${baseLabelQuery}&download=1`;
  const clientLabelUrl = `/api/vial-label/${productSlug}?format=38x90&type=client&${baseLabelQuery}&download=1`;
  const sheetLabelUrl = `/api/vial-label/${productSlug}?format=sheet_a4&type=full&${baseLabelQuery}&download=1`;

  const handleCopy3DUrl = (url) => {
    if (!url) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied3DUrl(true);
      notifier.success('3D Matrix Monograph URL copied to clipboard');
      setTimeout(() => setCopied3DUrl(false), 2000);
    }
  };

  if (!variant) return null;

  const timeline = Array.isArray(variant.timeline) 
    ? variant.timeline 
    : (Array.isArray(variant.history) ? variant.history : []);

  // Strict evaluation strictly based on THIS variant (never bleed from product-level raw properties)
  const isFinished = variant?.presentation === 'pre_filled_pen' ||
                     variant?.presentation === 'pen' ||
                     variant?.presentation === 'vial' ||
                     variant?.presentation === 'lyophilized_vial' ||
                     variant?.presentation === 'nasal_spray' ||
                     variant?.unitOfMeasure === 'unit' ||
                     variant?.unitOfMeasure === 'kit';

  const isRawMaterial = !isFinished && (
    variant?.unitOfMeasure === 'g' || 
    variant?.unitOfMeasure === 'kg' || 
    variant?.type === 'raw_material' || 
    variant?.format === 'raw_api' || 
    (typeof variant?.presentation === 'string' && variant.presentation.toLowerCase().includes('bulk')) ||
    (typeof variant?.dosage === 'string' && variant.dosage.toLowerCase().includes('moq'))
  );

  const getCategoryConfig = (category) => {
    switch (category) {
      case 'pricing':
        return {
          icon: DollarSign,
          bgColor: '#ecfdf5',
          textColor: '#059669',
          borderColor: '#a7f3d0',
          label: 'Pricing'
        };
      case 'formulation':
        return {
          icon: FlaskConical,
          bgColor: '#f3e8ff',
          textColor: '#7c3aed',
          borderColor: '#ddd6fe',
          label: 'Formulation'
        };
      case 'supplier':
        return {
          icon: Building2,
          bgColor: '#e0f2fe',
          textColor: '#0284c7',
          borderColor: '#bae6fd',
          label: 'Supplier'
        };
      case 'regulatory':
        return {
          icon: ShieldCheck,
          bgColor: '#fef3c7',
          textColor: '#d97706',
          borderColor: '#fde68a',
          label: 'Regulatory'
        };
      default:
        return {
          icon: Package,
          bgColor: '#f1f5f9',
          textColor: '#475569',
          borderColor: '#cbd5e1',
          label: 'General'
        };
    }
  };

  const formatTimestamp = (ts) => {
    if (!ts) return 'Recent';
    try {
      const date = new Date(ts);
      if (isNaN(date.getTime())) return String(ts);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return String(ts);
    }
  };

  const [activeTab, setActiveTab] = useState('pricing'); // 'pricing' | 'zoho' | 'audit' | 'yield'
  const isZohoLinked = Boolean(variant.zohoItemId);

  return (
    <div style={{
      padding: '0.875rem 1rem',
      backgroundColor: '#f1f5f9',
      borderTop: '2px solid #e2e8f0',
      borderRadius: '0 0 8px 8px',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem'
    }}>
      {/* Sleek Sub-Navigation Tab Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid #cbd5e1'
      }}>
        {/* Variant summary pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.80rem', fontWeight: 800, color: '#0f172a' }}>
            {variant.dosage || variant.dose || 'Variant'} • {variant.format || variant.presentation || 'Standard'}
          </span>
          <code style={{
            fontSize: '0.70rem',
            backgroundColor: '#ffffff',
            padding: '1px 6px',
            borderRadius: '4px',
            border: '1px solid #cbd5e1',
            color: '#475569',
            fontFamily: 'monospace'
          }}>
            {variant.id || 'variant-ref'}
          </code>
        </div>

        {/* Tab Controls */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          backgroundColor: '#e2e8f0',
          padding: '3px',
          borderRadius: '8px',
          gap: '2px',
          maxWidth: '100%',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}>
          {/* Commercial Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('pricing')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              fontSize: '0.74rem',
              fontWeight: activeTab === 'pricing' ? 750 : 550,
              color: activeTab === 'pricing' ? '#0f172a' : '#475569',
              backgroundColor: activeTab === 'pricing' ? '#ffffff' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              boxShadow: activeTab === 'pricing' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
              minHeight: '28px'
            }}
          >
            <DollarSign size={13} style={{ color: activeTab === 'pricing' ? '#059669' : '#64748b' }} />
            <span>Commercial Rates</span>
          </button>

          {/* Zoho ERP Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('zoho')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              fontSize: '0.74rem',
              fontWeight: activeTab === 'zoho' ? 750 : 550,
              color: activeTab === 'zoho' ? '#0f172a' : '#475569',
              backgroundColor: activeTab === 'zoho' ? '#ffffff' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              boxShadow: activeTab === 'zoho' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
              minHeight: '28px'
            }}
          >
            <Zap size={13} style={{ color: activeTab === 'zoho' ? '#6366f1' : '#64748b' }} />
            <span>Zoho ERP</span>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: isZohoLinked ? '#16a34a' : '#d97706',
              display: 'inline-block'
            }} />
          </button>

          {/* History Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              fontSize: '0.74rem',
              fontWeight: activeTab === 'audit' ? 750 : 550,
              color: activeTab === 'audit' ? '#0f172a' : '#475569',
              backgroundColor: activeTab === 'audit' ? '#ffffff' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              boxShadow: activeTab === 'audit' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
              minHeight: '28px'
            }}
          >
            <History size={13} style={{ color: activeTab === 'audit' ? '#0284c7' : '#64748b' }} />
            <span>Audit Trail</span>
            {timeline.length > 0 && (
              <span style={{
                fontSize: '0.65rem',
                backgroundColor: activeTab === 'audit' ? '#eff6ff' : '#cbd5e1',
                color: activeTab === 'audit' ? '#0369a1' : '#475569',
                padding: '0 5px',
                borderRadius: '9999px',
                fontWeight: 700
              }}>
                {timeline.length}
              </span>
            )}
          </button>

          {/* Yield Tab (Raw Material only) */}
          {isRawMaterial && (
            <button
              type="button"
              onClick={() => setActiveTab('yield')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                fontSize: '0.74rem',
                fontWeight: activeTab === 'yield' ? 750 : 550,
                color: activeTab === 'yield' ? '#0f172a' : '#475569',
                backgroundColor: activeTab === 'yield' ? '#ffffff' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: activeTab === 'yield' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                minHeight: '28px'
              }}
            >
              <FlaskConical size={13} style={{ color: activeTab === 'yield' ? '#7c3aed' : '#64748b' }} />
              <span>Bulk API Yield</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Unified 3D Traceability & Technical Suite Bar ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.625rem',
        padding: '0.5rem 0.75rem',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
      }}>
        {/* Left: Unique Editable Vial Code & 3D Matrix Trigger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0369a1' }}>
            <Barcode size={15} />
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              Vial Code / Batch:
            </span>
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            padding: '2px 6px',
            fontFamily: 'monospace',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: '#0f172a'
          }}>
            {onUpdateVariantField ? (
              <InlineEditableCell
                value={currentVialCode}
                type="text"
                width="165px"
                placeholder="Unique Vial Code"
                onSave={async (newVal) => {
                  const clean = String(newVal || '').trim().toUpperCase();
                  if (!clean) return;
                  await onUpdateVariantField(variant.id, 'vialCode', clean);
                }}
              />
            ) : (
              <span>{currentVialCode}</span>
            )}
          </div>

          {/* Copy Button */}
          <button
            type="button"
            onClick={() => handleCopyVialCode(currentVialCode)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 7px',
              fontSize: '0.70rem',
              fontWeight: 600,
              color: copiedCode ? '#15803d' : '#475569',
              backgroundColor: copiedCode ? '#dcfce7' : '#f1f5f9',
              border: `1px solid ${copiedCode ? '#86efac' : '#cbd5e1'}`,
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Copy unique vial code to clipboard"
          >
            {copiedCode ? <Check size={12} /> : <Copy size={12} />}
            <span>{copiedCode ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Live 3D Matrix Trigger Button */}
          <button
            type="button"
            onClick={() => setIs3DModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              fontSize: '0.70rem',
              fontWeight: 700,
              color: '#003666',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Inspect unified 3D QR Matrix linking Monograph & Labels"
          >
            <QrCode size={13} color="#0284c7" />
            <span>3D Matrix</span>
          </button>

          {variant?.vialCode ? (
            <span style={{
              fontSize: '0.66rem',
              fontWeight: 600,
              padding: '1px 5px',
              borderRadius: '4px',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              border: '1px solid #a7f3d0'
            }}>
              Custom Code
            </span>
          ) : (
            <span style={{
              fontSize: '0.66rem',
              fontWeight: 600,
              padding: '1px 5px',
              borderRadius: '4px',
              backgroundColor: '#f8fafc',
              color: '#64748b',
              border: '1px solid #e2e8f0'
            }}>
              Auto-Assigned
            </span>
          )}
        </div>

        {/* Right: Technical Datasheet, Web Share & Physical Labels */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          
          {/* Documentation Suite (Web Monograph & Share) */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            {/* 1. Ficha Técnica Web Link */}
            <a
              href={canonicalMonographPath}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 9px',
                fontSize: '0.70rem',
                fontWeight: 700,
                color: '#0369a1',
                backgroundColor: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '5px',
                textDecoration: 'none',
                transition: 'all 0.15s ease'
              }}
              title={`Open Live Technical Datasheet for ${variant?.dosage || '10mg'} (Batch ${currentVialCode})`}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#e0f2fe'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#f0f9ff'; }}
            >
              <FileText size={12} />
              <span>Datasheet ↗</span>
            </a>

            {/* 2. Web Share Drawer */}
            <button
              type="button"
              onClick={() => setShareDrawerOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 9px',
                fontSize: '0.70rem',
                fontWeight: 600,
                color: '#0d9488',
                backgroundColor: '#f0fdfa',
                border: '1px solid #99f6e4',
                borderRadius: '5px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title={`Share Datasheet & Labels for ${selectedProduct?.name || 'Peptide'} (${currentVialCode})`}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#ccfbf1'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#f0fdfa'; }}
            >
              <Share2 size={12} />
              <span>Share Web</span>
            </button>
          </div>

          {/* Physical Labels Suite */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#64748b', marginRight: '2px' }}>
              Labels:
            </span>

            {/* 3. Shipping Label */}
            <a
              href={shippingLabelUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={`shipping_label_${vFileSuffix}_38x90.pdf`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                fontSize: '0.70rem',
                fontWeight: 600,
                color: '#1e293b',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '5px',
                textDecoration: 'none',
                transition: 'all 0.15s ease'
              }}
              title={`Download 38x90mm Shipping Barcode Label for batch ${currentVialCode}`}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#e2e8f0'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#f8fafc'; }}
            >
              <span>📦</span> Shipping (38×90)
            </a>

            {/* 4. Client Vial Label */}
            <a
              href={clientLabelUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={`client_label_${vFileSuffix}_38x90.pdf`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                fontSize: '0.70rem',
                fontWeight: 600,
                color: '#0369a1',
                backgroundColor: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '5px',
                textDecoration: 'none',
                transition: 'all 0.15s ease'
              }}
              title={`Download 38x90mm Client Vial Label with active supplier, dosage & batch ${currentVialCode}`}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#e0f2fe'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#f0f9ff'; }}
            >
              <span>🏷️</span> Client Vial (38×90)
            </a>

            {/* 5. A4 Sheet */}
            <a
              href={sheetLabelUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={`vial_labels_sheet_${vFileSuffix}_a4.pdf`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                fontSize: '0.70rem',
                fontWeight: 600,
                color: '#475569',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '5px',
                textDecoration: 'none',
                transition: 'all 0.15s ease'
              }}
              title={`Download A4 Sheet (8 labels) for batch ${currentVialCode}`}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#e2e8f0'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#f8fafc'; }}
            >
              <span>📄</span> Sheet (×8)
            </a>
          </div>
        </div>
      </div>

      {/* Tab Content Area */}
      {activeTab === 'pricing' && (
        <SupplierAgreementCard
          variant={variant}
          selectedProduct={selectedProduct}
          onUpdateVariantField={onUpdateVariantField}
          onNavigateTab={setActiveTab}
        />
      )}

      {activeTab === 'zoho' && (
        <ZohoReconcilerCard
          variant={variant}
          product={selectedProduct}
          onUpdateVariantField={onUpdateVariantField}
        />
      )}

      {activeTab === 'yield' && isRawMaterial && (
        <BulkApiYieldCalculator
          variant={variant}
          selectedProduct={selectedProduct}
        />
      )}

      {activeTab === 'audit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Audit Trail Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
            paddingBottom: '0.4rem',
            borderBottom: '1px solid #cbd5e1'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                backgroundColor: '#eff6ff',
                color: '#003666'
              }}>
                <History size={14} />
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                Variant Modification Timeline & Audit Trail
              </span>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                ({timeline.length} {timeline.length === 1 ? 'event' : 'events'} recorded)
              </span>
            </div>
          </div>

      {/* Timeline Stream */}
      {timeline.length === 0 ? (
        <div style={{
          padding: '1.25rem 1rem',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px dashed #cbd5e1',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.35rem'
        }}>
          <Sparkles size={20} style={{ color: '#94a3b8' }} />
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
            No modifications recorded yet
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', maxWidth: '400px' }}>
            Any subsequent edits to pricing, dosage, supplier, or regulatory specs will automatically create an immutable audit record here.
          </div>
        </div>
      ) : (
        <div style={{
          position: 'relative',
          paddingLeft: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          {/* Vertical connecting line */}
          <div style={{
            position: 'absolute',
            top: '8px',
            bottom: '8px',
            left: '11px',
            width: '2px',
            backgroundColor: '#e2e8f0',
            zIndex: 0
          }} />

          {timeline.map((entry, idx) => {
            const config = getCategoryConfig(entry.category);
            const Icon = config.icon;

            return (
              <div
                key={entry.id || idx}
                style={{
                  position: 'relative',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                  zIndex: 1
                }}
              >
                {/* Node icon attached to the line */}
                <div style={{
                  position: 'absolute',
                  left: '-1.5rem',
                  top: '12px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: config.bgColor,
                  color: config.textColor,
                  border: `2px solid ${config.borderColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: 'translateX(-50%)',
                  boxShadow: '0 0 0 3px #f8fafc',
                  zIndex: 2
                }}>
                  <Icon size={12} />
                </div>

                {/* Event header & timestamp */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.4rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      backgroundColor: config.bgColor,
                      color: config.textColor,
                      border: `1px solid ${config.borderColor}`
                    }}>
                      {config.label}
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
                      {entry.fieldLabel || entry.field}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: '#64748b' }}>
                    <Clock size={11} />
                    <span>{formatTimestamp(entry.timestamp)}</span>
                  </div>
                </div>

                {/* Diff comparison pills */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                  margin: '2px 0'
                }}>
                  {/* Previous value */}
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    borderRadius: '5px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    fontSize: '0.75rem',
                    textDecoration: 'line-through',
                    opacity: 0.85
                  }}>
                    <span>{formatTimelineValue(entry.previousValue, entry.field)}</span>
                  </div>

                  <ArrowRight size={12} style={{ color: '#94a3b8' }} />

                  {/* New value */}
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    borderRadius: '5px',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    color: '#166534',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    <span>{formatTimelineValue(entry.newValue, entry.field)}</span>
                  </div>

                  {/* Optional Note */}
                  {entry.note && (
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontStyle: 'italic', marginLeft: '0.25rem' }}>
                      • {entry.note}
                    </span>
                  )}
                </div>

                {/* Quotation & Document Links for pricing audits */}
                {(entry.quotationId || entry.quotationDocUrl) && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '4px 8px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '5px',
                    fontSize: '0.72rem',
                    marginTop: '2px'
                  }}>
                    <FileCheck size={12} style={{ color: '#059669' }} />
                    <span style={{ fontWeight: 600, color: '#334155' }}>
                      Source Quotation:
                    </span>

                    {entry.quotationId && (
                      <button
                        type="button"
                        onClick={() => setActiveQuotationId(entry.quotationId)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          fontWeight: 700,
                          color: '#0284c7',
                          textDecoration: 'underline',
                          cursor: 'pointer'
                        }}
                      >
                        {entry.quotationNumber || entry.quotationId}
                      </button>
                    )}

                    {entry.quotationDocUrl && (
                      <a
                        href={entry.quotationDocUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          color: '#0369a1',
                          fontWeight: 600,
                          textDecoration: 'none',
                          marginLeft: 'auto'
                        }}
                      >
                        <ExternalLink size={11} /> View Original Document
                      </a>
                    )}
                  </div>
                )}

                {/* Author footer */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.68rem',
                  color: '#94a3b8',
                  paddingTop: '2px'
                }}>
                  <User size={11} />
                  <span>Modified by: <strong style={{ color: '#475569' }}>{entry.author || 'Admin Operator'}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      )}
        </div>
      )}

      {/* Supplier Quotation Detail Drawer */}
      {activeQuotationId && (
        <SupplierQuotationDetailDrawer
          quotationId={activeQuotationId}
          isOpen={Boolean(activeQuotationId)}
          onClose={() => setActiveQuotationId(null)}
        />
      )}

      {/* Universal Share Drawer for Monograph & Labels */}
      <UniversalShareDrawer
        isOpen={shareDrawerOpen}
        onClose={() => setShareDrawerOpen(false)}
        docUrl={absoluteMonographUrl || canonicalMonographPath}
        docType="monograph"
        itemName={`${selectedProduct?.name || 'Peptide'} - ${variant?.dosage || ''} (${currentVialCode})`}
        assetMeta={{
          vialCode: currentVialCode,
          productId: selectedProduct?.id || productSlug,
          productName: selectedProduct?.name,
          variantId: variant?.id,
          dosage: variant?.dosage || variant?.dose,
          supplier: variant?.supplierId || variant?.supplier,
          clientLabelUrl,
          shippingLabelUrl,
          sheetLabelUrl,
          monographUrl: canonicalMonographPath
        }}
      />

      {/* ── 3D Matrix / QR Code Traceability Modal ── */}
      {is3DModalOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            animation: 'fadeIn 0.15s ease-out'
          }}
          onClick={() => setIs3DModalOpen(false)}
        >
          <div 
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '460px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  padding: '8px',
                  borderRadius: '10px',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#0284c7'
                }}>
                  <QrCode size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                    3D Matrix Traceability
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748b' }}>
                    Shared code across Monograph, Shipping & Client Labels
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIs3DModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Batch Pill */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '8px 12px'
            }}>
              <div>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>
                  Active Batch / Vial Code
                </span>
                <span style={{ fontSize: '0.90rem', fontWeight: 800, color: '#003666', fontFamily: 'monospace' }}>
                  {currentVialCode}
                </span>
              </div>
              <span style={{
                fontSize: '0.70rem',
                fontWeight: 700,
                color: '#0369a1',
                backgroundColor: '#f0f9ff',
                padding: '3px 8px',
                borderRadius: '6px',
                border: '1px solid #bae6fd'
              }}>
                {variant?.dosage || '10mg'} · {variant?.presentation || 'vial'}
              </span>
            </div>

            {/* QR / 3D Matrix Code Render */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.25rem',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '2px dashed #cbd5e1'
            }}>
              <div style={{
                padding: '12px',
                backgroundColor: '#ffffff',
                borderRadius: '10px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
              }}>
                <QRCodeSVG
                  value={absoluteMonographUrl}
                  size={170}
                  level="M"
                  includeMargin={false}
                />
              </div>
              <span style={{ fontSize: '0.70rem', color: '#64748b', marginTop: '10px', fontWeight: 600 }}>
                Scan to open verified monograph on mobile device
              </span>
            </div>

            {/* URL Display with Copy */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#f1f5f9',
              borderRadius: '8px',
              padding: '6px 10px',
              border: '1px solid #cbd5e1'
            }}>
              <span style={{
                flex: 1,
                fontSize: '0.72rem',
                color: '#334155',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontFamily: 'monospace'
              }}>
                {absoluteMonographUrl}
              </span>
              <button
                type="button"
                onClick={() => handleCopy3DUrl(absoluteMonographUrl)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  fontSize: '0.70rem',
                  fontWeight: 700,
                  color: copied3DUrl ? '#15803d' : '#0369a1',
                  backgroundColor: copied3DUrl ? '#dcfce7' : '#ffffff',
                  border: `1px solid ${copied3DUrl ? '#86efac' : '#cbd5e1'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                {copied3DUrl ? <Check size={12} /> : <Copy size={12} />}
                <span>{copied3DUrl ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Quick Actions Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
              <a
                href={canonicalMonographPath}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  backgroundColor: '#003666',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  textAlign: 'center'
                }}
              >
                <FileText size={14} /> Open Datasheet ↗
              </a>

              <a
                href={clientLabelUrl}
                target="_blank"
                rel="noopener noreferrer"
                download={`client_label_${vFileSuffix}_38x90.pdf`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#0369a1',
                  backgroundColor: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  textAlign: 'center'
                }}
              >
                <Download size={14} /> Client Label (PDF)
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
