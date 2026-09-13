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
          <a
            href={`/api/vial-label/${encodeURIComponent(selectedProduct?.slug || selectedProduct?.id || '')}?format=38x90&type=shipping&variantId=${encodeURIComponent(variant.id || '')}&supplier=${encodeURIComponent(variant.supplierId || variant.supplier || '')}&dose=${encodeURIComponent(variant.dosage || variant.dose || '')}&presentation=${encodeURIComponent(variant.presentation || variant.format || '')}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              fontSize: '0.70rem',
              fontWeight: 600,
              color: '#0369a1',
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '6px',
              textDecoration: 'none',
              transition: 'all 0.15s ease'
            }}
            title="Download 38x90mm label for this variant"
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e0f2fe'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f0f9ff'}
          >
            🏷️ Print Label
          </a>
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
    </div>
  );
}
