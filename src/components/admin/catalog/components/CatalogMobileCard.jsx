"use client";

import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Layers, 
  PackageCheck, 
  FlaskConical, 
  Stethoscope, 
  Dna, 
  Briefcase, 
  ClipboardList, 
  Archive, 
  Copy, 
  Check,
  FileText,
  Bot,
  Building2,
  Plus
} from '@/lib/icons';
import StatusBadge from '../../../ui/StatusBadge';
import InlineEditableCell from '../../../ui/InlineEditableCell';
import { CopyableId } from '../../../ui';
import DataCompletenessBadge from '../DataCompletenessBadge';
import AppActionGroup from '../../../ui/AppActionGroup';
import CatalogVariantExpander from './CatalogVariantExpander';
import ProductDatasheetDrawer from './ProductDatasheetDrawer';
import { getProductAvailableTypes } from '../../../../utils/productNormalizer';
import { useWorkspaceStore } from '../../../../stores/useWorkspaceStore';
import { useRoleAccess } from '../../../../hooks/useRoleAccess';
import { openProductAI } from '../../../../utils/openModuleAI';
import notifier from '../../../../services/NotificationService';

const TYPE_CONFIG = {
  finished_product:    { label: 'FINISHED',  icon: <PackageCheck size={11} strokeWidth={2.2} />, bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  raw_material:        { label: 'BULK API',   icon: <FlaskConical size={11} strokeWidth={2.2} />,  bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  clinical_supplies:   { label: 'CLINICAL',   icon: <Stethoscope size={11} strokeWidth={2.2} />,   bg: '#f8fafc', color: '#475569', border: '#e2e8f0' },
  genomics_biomarkers: { label: 'GENOMICS',   icon: <Dna size={11} strokeWidth={2.2} />,          bg: '#eef2ff', color: '#4338ca', border: '#c7d2fe' },
  diagnostic:          { label: 'GENOMICS',   icon: <Dna size={11} strokeWidth={2.2} />,          bg: '#eef2ff', color: '#4338ca', border: '#c7d2fe' },
  service:             { label: 'SERVICE',    icon: <Sparkles size={11} strokeWidth={2.2} />,     bg: '#fdf4ff', color: '#7e22ce', border: '#e9d5ff' },
};

export default function CatalogMobileCard({
  row,
  onSelectProduct,
  onEnrichProduct,
  onOpenDrawer,
  onExportPdf,
  supplierIdToName = {},
  onParentFieldUpdate,
  categoryOptions = [],
  openPrescriptionDrawer,
  onEditGenomicPriority,
  commercialChannel = 'b2b',
  onRowClick,
  isSelected = false,
  onToggleSelect
}) {
  const [expanded, setExpanded] = useState(false);
  const [showDatasheet, setShowDatasheet] = useState(false);

  if (!row) return null;

  const name = row.canonicalName || row.name || 'Unknown Product';
  const types = getProductAvailableTypes(row);
  const primaryType = types[0] || (row.category === 'raw_material' ? 'raw_material' : 'finished_product');
  const typeCfg = TYPE_CONFIG[primaryType] || TYPE_CONFIG.finished_product;

  const variants = Array.isArray(row.variants) && row.variants.length > 0 
    ? row.variants 
    : [{ 
        id: row.id, 
        dosage: row.dosage || 'Standard', 
        format: row.format || 'Vial', 
        price: row.price || row.pricing?.retail || 0,
        supplierName: row.supplierName || 'Fagron Iberia'
      }];
  const variantCount = variants.length;
  const primaryFormat = variants[0]?.format || row.format || (primaryType === 'raw_material' ? 'API Powder' : 'Vial');

  const suppliers = Array.isArray(row.suppliers) ? row.suppliers : [];
  const firstSupplierId = row.supplierId || (typeof suppliers[0] === 'object' ? suppliers[0]?.id : suppliers[0]);
  const supplierName = supplierIdToName?.[firstSupplierId] || 
                       row.supplierName || 
                       (typeof suppliers[0] === 'object' ? suppliers[0]?.name : suppliers[0]) || 
                       'Fagron Iberia';

  const programs = Array.isArray(row.programs) ? row.programs : [];
  const status = row.status || (row.isActive === false ? 'inactive' : 'active');

  const { can, role } = useRoleAccess();
  const canArchive = can('archive:products') || can('delete:products') || role === 'admin';

  // Handle adding a SPECIFIC VARIANT to active workspace
  const handleAddVariantToWorkspace = (v) => {
    const itemToAdd = {
      id: v.id || `${row.id}-${v.sku || 'var'}`,
      productId: row.id,
      variantId: v.id || `${row.id}-${v.sku || 'var'}`,
      canonicalName: `${name} · ${v.dosage || v.strength || v.presentation || 'Standard'}`,
      sku: v.sku || '',
      dosage: v.dosage || v.strength || '',
      format: v.presentation || v.format || 'Vial',
      quantity: 1,
      unitPrice: v.resolvedPrice?.perUnit || v.price || v.unit_price || 0,
      supplierCost: v.supplierCost || v.cost || 0,
      supplierName: v.supplierName || supplierName,
      supplierId: v.supplierId || firstSupplierId || '',
    };
    const { workspaces, activeWorkspaceId, addItem } = useWorkspaceStore.getState();
    const wsList = Object.values(workspaces || {});
    const activeWs = workspaces[activeWorkspaceId] || wsList[0];
    addItem(itemToAdd, activeWs?.id);
    notifier.success(`Added "${itemToAdd.canonicalName}" to ${activeWs?.name || 'Workspace 1'}.`);
  };

  // Actions for the "•••" menu at PRODUCT LEVEL (Scientific, Clinical & Administrative)
  const contextualActions = [
    {
      type: 'export_pdf',
      icon: FileText,
      label: 'Product Sheet (PDF Dossier)',
      onClick: () => {
        setShowDatasheet(true);
      }
    },
    {
      type: 'sparkles',
      icon: Bot,
      label: 'Consult Atlas Clinical AI',
      onClick: () => {
        openProductAI(row, {
          initialPrompt: `Provide comprehensive clinical overview, dosage guidelines, variants/supplier analysis, and contraindications for ${name}. Role: ${role || 'doctor'}.`,
          displayText: `Clinical AI: ${name}`
        });
      }
    },
    {
      type: 'link_protocol',
      icon: Dna,
      label: 'Link to Clinical Protocol',
      onClick: () => {
        if (typeof onOpenDrawer === 'function') {
          onOpenDrawer('protocol-editor');
        } else {
          window.dispatchEvent(new CustomEvent('open-protocol-link-modal', { detail: { product: row } }));
        }
        notifier.info(`Select target protocol to link ${name}`);
      }
    },
    ...(canArchive ? [{
      type: 'archive',
      icon: Archive,
      label: 'Archive Product',
      onClick: () => {
        notifier.confirmCritical(
          `Archive "${name}"? It will be hidden from the active catalog.`,
          async () => {
            if (onParentFieldUpdate) {
              await onParentFieldUpdate(row, 'status', 'archived');
              notifier.success(`Product "${name}" archived.`);
            }
          }
        );
      }
    }] : [])
  ];

  return (
    <div
      id={`product-card-${row.id}`}
      className={`mobile-record-card${isSelected ? ' mobile-record-card--selected' : ''}`}
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        marginBottom: '12px',
        boxShadow: '0 2px 6px -1px rgba(0, 0, 0, 0.05), 0 1px 3px -1px rgba(0, 0, 0, 0.03)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
      }}
      onClick={() => onRowClick?.(row) || onSelectProduct?.(row)}
    >
      {/* ── CARD HEADER: Primary Title & Badges ── */}
      <div style={{
        padding: '12px 14px 8px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        {/* Row 1: Title (Left) & Type Badge + Expand Chevron (Right) */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.96rem',
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.25,
                wordBreak: 'break-word'
              }}>
                {onParentFieldUpdate ? (
                  <InlineEditableCell 
                    value={name} 
                    type="text" 
                    onSave={(v) => onParentFieldUpdate(row, 'canonicalName', v)} 
                  />
                ) : (
                  name
                )}
              </span>
              <CopyableId value={row.id} iconOnly={true} />
              <DataCompletenessBadge
                product={row}
                onClick={(p) => onEnrichProduct?.(p)}
              />
            </div>
          </div>

          {/* Right Anchor: Type Badge and Expand Chevron */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <span style={{
              fontSize: '0.66rem',
              fontWeight: 800,
              padding: '2px 7px',
              borderRadius: '5px',
              background: typeCfg.bg,
              color: typeCfg.color,
              border: `1px solid ${typeCfg.border}`,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              letterSpacing: '0.03em',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}>
              {typeCfg.icon}
              <span>{typeCfg.label}</span>
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              aria-label={expanded ? 'Collapse details' : 'Expand details'}
              style={{
                width: '28px',
                height: '28px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                color: '#64748b',
                cursor: 'pointer'
              }}
            >
              {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          </div>
        </div>

        {/* Row 2: Unified Horizontal Metadata Strip */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flexWrap: 'wrap',
          fontSize: '0.74rem',
          color: '#64748b',
          marginTop: '2px'
        }}>
          {/* Category Pill */}
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '5px',
            padding: '1px 6px',
            fontSize: '0.70rem',
            fontWeight: 600,
            color: '#334155'
          }}>
            {onParentFieldUpdate && categoryOptions.length > 0 ? (
              <InlineEditableCell 
                value={row.category || 'No Category'} 
                type="select" 
                options={categoryOptions}
                onSave={(v) => onParentFieldUpdate(row, 'category', v)} 
              />
            ) : (
              row.category || 'Standard'
            )}
          </span>

          <span style={{ color: '#cbd5e1' }}>•</span>

          {/* Format Footprint */}
          <span style={{ fontWeight: 600, color: 'var(--color-primary, #003666)' }}>
            {variantCount} Var{variantCount !== 1 ? 's' : ''} ({primaryFormat})
          </span>

          {/* Genomic Program Pill if present */}
          {programs.length > 0 && (
            <>
              <span style={{ color: '#cbd5e1' }}>•</span>
              <span
                onClick={(e) => {
                  if (onEditGenomicPriority) {
                    e.stopPropagation();
                    const firstSlug = programs[0].slug || programs[0].id || '';
                    onEditGenomicPriority(row, firstSlug);
                  }
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#1d4ed8',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  cursor: onEditGenomicPriority ? 'pointer' : 'default'
                }}
              >
                <Dna size={10} />
                <span>
                  {(programs[0].name || programs[0].id || 'Test')
                    .replace(/^Fagron Genomics\s*\|\s*/i, '')
                    .replace(/Test/i, 'Test™')}
                </span>
                <span style={{
                  background: '#1d4ed8',
                  color: '#ffffff',
                  padding: '0 3px',
                  borderRadius: '2px',
                  fontSize: '0.60rem'
                }}>
                  {programs[0].priority || 'A'}
                </span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── CARD BODY: 2-Column Sourcing & Operational Status Grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        padding: '8px 14px',
        background: '#f8fafc',
        borderTop: '1px solid #f1f5f9',
        borderBottom: '1px solid #f1f5f9',
        fontSize: '0.78rem'
      }}>
        {/* Left: Supplier Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{
            color: '#64748b',
            fontSize: '0.65rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            Suppliers ({suppliers.length || 1})
          </span>
          <span style={{
            color: '#0f172a',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }} title={supplierName}>
            {supplierName}
          </span>
        </div>

        {/* Right: Operational Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{
            color: '#64748b',
            fontSize: '0.65rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            Status
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <StatusBadge status={status} />
            {onParentFieldUpdate && (
              <span style={{ opacity: 0.6 }}>
                <InlineEditableCell
                  value={status}
                  type="select"
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'draft', label: 'Draft' },
                    { value: 'archived', label: 'Archived' }
                  ]}
                  onSave={(v) => onParentFieldUpdate(row, 'status', v)}
                />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── CARD FOOTER: Balanced Thumb-Zone Action Bar (100% Width) ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 14px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Secondary Action: AI Clinical Enrichment */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEnrichProduct?.(row);
          }}
          title="AI Clinical Data Completeness & Enrichment"
          style={{
            flex: '0 0 auto',
            minHeight: '38px',
            padding: '0 12px',
            borderRadius: '8px',
            border: '1px solid #e9d5ff',
            background: '#faf5ff',
            color: '#7c3aed',
            fontSize: '0.78rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
          }}
        >
          <Sparkles size={15} />
          <span>Enrich</span>
        </button>

        {/* Primary Action: Offers & Pricing (Flex 1 to fill and balance the card width) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectProduct?.(row);
          }}
          title="View Offers, Variants & Pricing"
          style={{
            flex: 1,
            minHeight: '38px',
            padding: '0 12px',
            borderRadius: '8px',
            border: '1px solid #bae6fd',
            background: '#f0f9ff',
            color: '#0284c7',
            fontSize: '0.78rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
          }}
        >
          <Layers size={15} />
          <span>Offers & Pricing</span>
        </button>

        {/* More Actions Dropdown (•••) */}
        <div onClick={(e) => e.stopPropagation()}>
          <AppActionGroup actions={contextualActions} maxVisible={0} />
        </div>
      </div>

      {/* ── EXPANDABLE IN-PLACE: Presentations by Supplier & Actions ── */}
      {expanded && (
        <div style={{
          padding: '12px 14px',
          borderTop: '1px solid #f1f5f9',
          background: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {/* Header of variants section */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Presentations by Supplier ({variants.length})
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectProduct?.(row);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#0284c7',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Full Price Matrix →
            </button>
          </div>

          {/* List of distinct presentations with in-place action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {variants.map((v, idx) => {
              const vSuppName = v.supplierName || supplierName;
              const vPrice = v.resolvedPrice?.perUnit || v.price || v.unit_price;
              const vStrength = v.dosage || v.strength || v.presentation || 'Standard';
              const vFormat = v.format || v.presentation || 'Vial';

              return (
                <div
                  key={v.id || idx}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Building2 size={12} color="#64748b" />
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0f172a' }}>
                        {vSuppName}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#475569' }}>
                      {vStrength} ({vFormat})
                      {vPrice > 0 && (
                        <strong style={{ marginLeft: '6px', color: '#16a34a' }}>
                          ${Number(vPrice).toFixed(2)}
                        </strong>
                      )}
                    </span>
                  </div>

                  {/* Direct Actions on THIS Specific Variant */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <button
                      type="button"
                      title="Add this specific presentation to active workspace"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddVariantToWorkspace(v);
                      }}
                      style={{
                        padding: '5px 8px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        background: '#f8fafc',
                        color: '#003666',
                        fontSize: '0.70rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      <Briefcase size={12} />
                      <span>+ Workspace</span>
                    </button>

                    <button
                      type="button"
                      title="Create prescription with this specific presentation"
                      onClick={(e) => {
                        e.stopPropagation();
                        openPrescriptionDrawer?.({
                          ...row,
                          variants: [v],
                          dosage: v.dosage || v.strength,
                          format: v.format || v.presentation
                        });
                      }}
                      style={{
                        padding: '5px 8px',
                        borderRadius: '6px',
                        border: '1px solid #bfdbfe',
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        fontSize: '0.70rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      <ClipboardList size={12} />
                      <span>+ Rx</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Technical Specs & Synergies Expander */}
          <div style={{ marginTop: '6px' }}>
            <CatalogVariantExpander
              product={row}
              commercialChannel={commercialChannel}
              onOpenPricingDrawer={(p) => {
                onSelectProduct?.(p);
              }}
            />
          </div>
        </div>
      )}

      {/* ── CLINICAL DATASHEET PREVIEW DRAWER ── */}
      <ProductDatasheetDrawer
        product={row}
        isOpen={showDatasheet}
        onClose={() => setShowDatasheet(false)}
      />
    </div>
  );
}
