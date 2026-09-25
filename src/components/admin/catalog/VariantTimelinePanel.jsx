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
  Download,
  ChevronDown
} from 'lucide-react';
import notifier from '@/services/NotificationService';
import { formatTimelineValue } from '../../../utils/variantTimelineHelper';
import { formatNumberAdaptive } from '../../../utils/formatters';
import InlineEditableCell from '../../ui/InlineEditableCell';
import SupplierAgreementCard from './cards/SupplierAgreementCard';
import ZohoReconcilerCard from './cards/ZohoReconcilerCard';
import SupplierQuotationDetailDrawer from '../quotations/SupplierQuotationDetailDrawer';
import UniversalShareDrawer from '../../ui/UniversalShareDrawer';
import BulkApiYieldCalculator from './widgets/BulkApiYieldCalculator';

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
  const [labelsDropdownOpen, setLabelsDropdownOpen] = useState(false);
  const labelsDropdownRef = React.useRef(null);

  React.useEffect(() => {
    function handleClickOutside(e) {
      if (labelsDropdownRef.current && !labelsDropdownRef.current.contains(e.target)) {
        setLabelsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isCosmetic = selectedProduct?.category === 'cosmetics' || 
                     selectedProduct?.category === 'skincare' || 
                     variant?.format === 'bottle' || 
                     variant?.packaging === 'bottle' ||
                     (variant?.presentation && variant.presentation.toLowerCase().includes('bottle'));

  // Deterministic fallback unique code if not explicitly saved on the variant
  const defaultSuppCode = (variant?.supplierId || variant?.supplier || selectedProduct?.supplier || (isCosmetic ? 'CWY' : 'RP')).replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase();
  const defaultDoseCode = String(variant?.dosage || variant?.dose || variant?.volume || (isCosmetic ? '250ML' : '10MG')).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const idSuffix = String(variant?.id || 'V1').replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase() || 'V01';
  const defaultVialCode = isCosmetic 
    ? `${defaultSuppCode}-${defaultDoseCode}-${idSuffix}`
    : `RP-${defaultSuppCode}-${defaultDoseCode}-${idSuffix}`;
  const currentVialCode = variant?.vialCode || variant?.batchCode || variant?.batchNumber || defaultVialCode;

  const handleCopyVialCode = (code) => {
    if (!code) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      notifier.success(`${isCosmetic ? 'Bottle Batch' : 'Vial Code'} copied: ${code}`);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const productSlug = encodeURIComponent(selectedProduct?.slug || selectedProduct?.id || '');
  const variantIdParam = encodeURIComponent(variant?.id || '');
  const suppParam = encodeURIComponent(variant?.supplierId || variant?.supplier || selectedProduct?.supplierId || selectedProduct?.supplier || '');
  const doseParam = encodeURIComponent(variant?.dosage || variant?.dose || variant?.volume || '');
  const formatParam = encodeURIComponent(variant?.presentation || variant?.format || (isCosmetic ? '250 mL Bottle' : 'vial'));
  const batchParam = encodeURIComponent(currentVialCode);

  const rawSlug = selectedProduct?.slug || selectedProduct?.id || '';
  const canonicalMonographPath = isCosmetic
    ? `/p/${encodeURIComponent(rawSlug)}?presentation=${formatParam}&supplier=${suppParam}&batch=${batchParam}`
    : `/p/${encodeURIComponent(rawSlug)}?dose=${doseParam}&presentation=${formatParam}&supplier=${suppParam}&batch=${batchParam}&vialCode=${batchParam}`;
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const absoluteMonographUrl = `${origin}${canonicalMonographPath}`;

  const baseLabelQuery = `variantId=${variantIdParam}&supplier=${suppParam}&dose=${doseParam}&presentation=${formatParam}&batch=${batchParam}${isCosmetic ? '' : `&vialCode=${batchParam}`}&url=${encodeURIComponent(absoluteMonographUrl)}`;

  const cleanStr = (s) => String(s || '').trim().replace(/^supplier[-_]/i, '').replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').toLowerCase();
  const vFileSuffix = `${cleanStr(rawSlug)}_${cleanStr(variant?.dosage || variant?.dose || variant?.volume || (isCosmetic ? '250ml' : '10mg'))}_${cleanStr(variant?.presentation || (isCosmetic ? 'bottle' : 'vial'))}_${cleanStr(variant?.supplierId || variant?.supplier || 'colway')}_${cleanStr(currentVialCode)}`;

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

        {/* Tab Controls (Material 3 Segmented Control) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#f1f5f9',
          border: '1px solid #e2e8f0',
          padding: '3px',
          borderRadius: '8px',
          gap: '3px',
          width: '100%',
          maxWidth: '520px'
        }}>
          {/* Commercial Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('pricing')}
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              minHeight: '34px',
              padding: '4px 10px',
              fontSize: '0.74rem',
              fontWeight: activeTab === 'pricing' ? 700 : 500,
              color: activeTab === 'pricing' ? '#003666' : '#64748b',
              backgroundColor: activeTab === 'pricing' ? '#ffffff' : 'transparent',
              border: activeTab === 'pricing' ? '1px solid #cbd5e1' : '1px solid transparent',
              borderRadius: '6px',
              cursor: 'pointer',
              boxShadow: activeTab === 'pricing' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap'
            }}
          >
            <DollarSign size={13} style={{ color: activeTab === 'pricing' ? '#003666' : '#94a3b8' }} />
            <span>Commercial Rates</span>
          </button>

          {/* Zoho ERP Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('zoho')}
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              minHeight: '34px',
              padding: '4px 10px',
              fontSize: '0.74rem',
              fontWeight: activeTab === 'zoho' ? 700 : 500,
              color: activeTab === 'zoho' ? '#003666' : '#64748b',
              backgroundColor: activeTab === 'zoho' ? '#ffffff' : 'transparent',
              border: activeTab === 'zoho' ? '1px solid #cbd5e1' : '1px solid transparent',
              borderRadius: '6px',
              cursor: 'pointer',
              boxShadow: activeTab === 'zoho' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap'
            }}
          >
            <Zap size={13} style={{ color: activeTab === 'zoho' ? '#003666' : '#94a3b8' }} />
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
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              minHeight: '34px',
              padding: '4px 10px',
              fontSize: '0.74rem',
              fontWeight: activeTab === 'audit' ? 700 : 500,
              color: activeTab === 'audit' ? '#003666' : '#64748b',
              backgroundColor: activeTab === 'audit' ? '#ffffff' : 'transparent',
              border: activeTab === 'audit' ? '1px solid #cbd5e1' : '1px solid transparent',
              borderRadius: '6px',
              cursor: 'pointer',
              boxShadow: activeTab === 'audit' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap'
            }}
          >
            <History size={13} style={{ color: activeTab === 'audit' ? '#003666' : '#94a3b8' }} />
            <span>Audit Trail</span>
            {timeline.length > 0 && (
              <span style={{
                fontSize: '0.65rem',
                backgroundColor: activeTab === 'audit' ? '#eff6ff' : '#e2e8f0',
                color: activeTab === 'audit' ? '#003666' : '#64748b',
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
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                minHeight: '34px',
                padding: '4px 10px',
                fontSize: '0.74rem',
                fontWeight: activeTab === 'yield' ? 700 : 500,
                color: activeTab === 'yield' ? '#003666' : '#64748b',
                backgroundColor: activeTab === 'yield' ? '#ffffff' : 'transparent',
                border: activeTab === 'yield' ? '1px solid #cbd5e1' : '1px solid transparent',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: activeTab === 'yield' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <FlaskConical size={13} style={{ color: activeTab === 'yield' ? '#003666' : '#94a3b8' }} />
              <span>Bulk API Yield</span>
            </button>
          )}
        </div>
      </div>

      {/* ── GCP Action Bar: Vial Code + Technical Suite ── */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        overflow: 'hidden'
      }}>
        {/* Row 1: Vial Code, Copy, 3D Matrix, Custom/Auto badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.375rem',
          padding: '0.5rem 0.75rem',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#0369a1' }}>
            <Barcode size={14} />
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
              {isCosmetic ? 'Bottle Lot / Batch' : 'Vial Code / Batch'}
            </span>
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            padding: '2px 8px',
            fontFamily: 'monospace',
            fontSize: '0.79rem',
            fontWeight: 700,
            color: '#0f172a',
            letterSpacing: '0.02em'
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

          {/* Copy */}
          <button
            type="button"
            onClick={() => handleCopyVialCode(currentVialCode)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              fontSize: '0.69rem',
              fontWeight: 600,
              color: copiedCode ? '#15803d' : '#475569',
              backgroundColor: copiedCode ? '#dcfce7' : '#f1f5f9',
              border: `1px solid ${copiedCode ? '#86efac' : '#cbd5e1'}`,
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap'
            }}
            title="Copy unique vial code to clipboard"
          >
            {copiedCode ? <Check size={11} /> : <Copy size={11} />}
            <span>{copiedCode ? 'Copied' : 'Copy'}</span>
          </button>

          {/* 3D Matrix */}
          <button
            type="button"
            onClick={() => setIs3DModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              fontSize: '0.69rem',
              fontWeight: 700,
              color: '#003666',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap'
            }}
            title="Inspect unified 3D QR Matrix linking Monograph & Labels"
          >
            <QrCode size={12} color="#0284c7" />
            <span>3D Matrix</span>
          </button>

          {/* Custom/Auto badge */}
          {variant?.vialCode ? (
            <span style={{ fontSize: '0.65rem', fontWeight: 600, padding: '1px 6px', borderRadius: '4px', backgroundColor: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', whiteSpace: 'nowrap' }}>
              Custom Code
            </span>
          ) : (
            <span style={{ fontSize: '0.65rem', fontWeight: 600, padding: '1px 6px', borderRadius: '4px', backgroundColor: '#f8fafc', color: '#94a3b8', border: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
              Auto-Assigned
            </span>
          )}
        </div>

        {/* Row 2: Unified Action Family — [ Datasheet ] [ Share Web ] [ Labels ▾ ] */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          padding: '0.45rem 0.75rem',
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
        }}>
          {/* 1. Datasheet Action */}
          <a
            href={canonicalMonographPath}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              minHeight: '32px',
              padding: '0 11px',
              fontSize: '0.74rem',
              fontWeight: 650,
              color: '#003666',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              whiteSpace: 'nowrap'
            }}
            title={`Open Live Technical Datasheet for ${variant?.dosage || '10mg'} (Batch ${currentVialCode})`}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.borderColor = '#94a3b8'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
          >
            <FileText size={13} color="#0284c7" />
            <span>Datasheet</span>
            <ExternalLink size={10} color="#94a3b8" />
          </a>

          {/* 2. Share Web Action (Consistent with Datasheet, no green) */}
          <button
            type="button"
            onClick={() => setShareDrawerOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              minHeight: '32px',
              padding: '0 11px',
              fontSize: '0.74rem',
              fontWeight: 650,
              color: '#003666',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              whiteSpace: 'nowrap'
            }}
            title={`Share Datasheet & Labels for ${selectedProduct?.name || 'Peptide'} (${currentVialCode})`}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.borderColor = '#94a3b8'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
          >
            <Share2 size={13} color="#0284c7" />
            <span>Share Web</span>
            <span style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 600 }}>• Public</span>
          </button>

          {/* 3. Download Labels Action Dropdown (Consistent with family) */}
          <div style={{ position: 'relative', display: 'inline-block' }} ref={labelsDropdownRef}>
            <button
              type="button"
              onClick={() => setLabelsDropdownOpen(prev => !prev)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                minHeight: '32px',
                padding: '0 11px',
                fontSize: '0.74rem',
                fontWeight: 650,
                color: '#003666',
                backgroundColor: labelsDropdownOpen ? '#f1f5f9' : '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                whiteSpace: 'nowrap'
              }}
              title="Download print-ready thermal labels & batch sheets"
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.borderColor = '#94a3b8'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = labelsDropdownOpen ? '#f1f5f9' : '#ffffff'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
            >
              <Download size={13} color="#0284c7" />
              <span>Labels</span>
              <ChevronDown size={11} color="#64748b" style={{ transform: labelsDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
            </button>

            {/* Dropdown Popover */}
            {labelsDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                minWidth: '230px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                zIndex: 100,
                padding: '4px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}>
                <div style={{ padding: '4px 8px', fontSize: '0.62rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Printable Formats
                </div>

                {/* Client Vial Label */}
                <a
                  href={clientLabelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={`client_label_${vFileSuffix}_38x90.pdf`}
                  onClick={() => setLabelsDropdownOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 8px',
                    borderRadius: '5px',
                    fontSize: '0.72rem',
                    color: '#0f172a',
                    textDecoration: 'none',
                    backgroundColor: '#ffffff',
                    transition: 'background-color 0.1s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f0f9ff'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#0369a1' }}>
                    🏷️ Client Vial
                  </span>
                  <span style={{ fontSize: '0.62rem', color: '#64748b', fontFamily: 'monospace' }}>38×90mm</span>
                </a>

                {/* Shipping Label */}
                <a
                  href={shippingLabelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={`shipping_label_${vFileSuffix}_38x90.pdf`}
                  onClick={() => setLabelsDropdownOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 8px',
                    borderRadius: '5px',
                    fontSize: '0.72rem',
                    color: '#0f172a',
                    textDecoration: 'none',
                    backgroundColor: '#ffffff',
                    transition: 'background-color 0.1s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#334155' }}>
                    📦 Shipping Barcode
                  </span>
                  <span style={{ fontSize: '0.62rem', color: '#64748b', fontFamily: 'monospace' }}>38×90mm</span>
                </a>

                {/* A4 Sheet */}
                <a
                  href={sheetLabelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={`vial_labels_sheet_${vFileSuffix}_a4.pdf`}
                  onClick={() => setLabelsDropdownOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 8px',
                    borderRadius: '5px',
                    fontSize: '0.72rem',
                    color: '#0f172a',
                    textDecoration: 'none',
                    backgroundColor: '#ffffff',
                    transition: 'background-color 0.1s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#475569' }}>
                    📑 Sheet A4 (Batch)
                  </span>
                  <span style={{ fontSize: '0.62rem', color: '#64748b', fontFamily: 'monospace' }}>8 labels</span>
                </a>
              </div>
            )}
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
