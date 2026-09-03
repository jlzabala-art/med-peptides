"use client";

import React, { useState } from 'react';
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
  FileCheck
} from 'lucide-react';
import { formatTimelineValue } from '../../../utils/variantTimelineHelper';
import { formatNumberAdaptive } from '../../../utils/formatters';
import InlineEditableCell from '../../ui/InlineEditableCell';
import SupplierAgreementCard from './cards/SupplierAgreementCard';
import ZohoReconcilerCard from './cards/ZohoReconcilerCard';
import BulkApiYieldCalculator from './widgets/BulkApiYieldCalculator';
import SupplierQuotationDetailDrawer from '../quotations/SupplierQuotationDetailDrawer';

/**
 * VariantTimelinePanel
 * ─────────────────────────────────────────────────────────────────────────────
 * Expandable master-detail panel rendering:
 *  1. Supplier Pricing & Commercial Agreement Card (Quotation Date, Discounts, MOQ, Multi-currency)
 *  2. Bulk API Yield & Dilution Calculator (Raw Materials to Patient Vials Matrix)
 *  3. Zoho Books & Inventory Reconciler Card (SKU, Sync status, Create in Zoho)
 *  4. Chronological audit trail of changes made to the variant with quotation links.
 */
export default function VariantTimelinePanel({ variant, selectedProduct, onUpdateVariantField }) {
  const [activeQuotationId, setActiveQuotationId] = useState(null);

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

  return (
    <div style={{
      padding: '1rem 1.25rem',
      backgroundColor: '#f8fafc',
      borderTop: '1px solid #e2e8f0',
      borderRadius: '0 0 8px 8px',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.875rem'
    }}>
      {/* 1. Supplier Pricing & Commercial Agreement Card */}
      <SupplierAgreementCard
        variant={variant}
        selectedProduct={selectedProduct}
        onUpdateVariantField={onUpdateVariantField}
      />

      {/* 2. Bulk API Yield & Dilution Calculator (For Raw Materials / Bulk APIs) */}
      {isRawMaterial && (
        <BulkApiYieldCalculator
          variant={variant}
          selectedProduct={selectedProduct}
        />
      )}

      {/* 3. Zoho Books & Inventory Reconciler Card */}
      <ZohoReconcilerCard
        variant={variant}
        product={selectedProduct}
        onUpdateVariantField={onUpdateVariantField}
      />

      {/* 2. Audit Trail Header bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
        paddingBottom: '0.625rem',
        borderBottom: '1px solid #e2e8f0'
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
          <div>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
              Variant Modification Timeline & Audit Trail
            </span>
            <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: '0.5rem' }}>
              ({timeline.length} {timeline.length === 1 ? 'event' : 'events'} recorded)
            </span>
          </div>
        </div>

        <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontWeight: 600, color: '#334155' }}>SKU / Ref:</span>
          <code style={{ backgroundColor: '#ffffff', padding: '1px 5px', borderRadius: '4px', border: '1px solid #e2e8f0', color: '#475569' }}>
            {variant.id || 'variant-ref'}
          </code>
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

      {/* Supplier Quotation Detail Drawer */}
      {activeQuotationId && (
        <SupplierQuotationDetailDrawer
          quotationId={activeQuotationId}
          isOpen={Boolean(activeQuotationId)}
          onClose={() => setActiveQuotationId(null)}
        />
      )}
    </div>
  );
}
