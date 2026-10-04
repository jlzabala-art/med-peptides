import React, { useMemo } from 'react';
import AppEntityCell from '../../../ui/AppEntityCell';
import InlineEditableCell from '../../../ui/InlineEditableCell';
import { CopyableId } from '../../../ui';
import StatusBadge from '../../../ui/StatusBadge';
import SearchableDropdown from '../../../ui/SearchableDropdown';
import AppActionGroup from '../../../ui/AppActionGroup';
import DataCompletenessBadge from '../DataCompletenessBadge';
import ScientificHoverCard from '../ScientificHoverCard';
import { extractProductPresentation } from '../../../../utils/productNormalizer';
import { PRESENTATION_LABELS } from '../../../../constants/presentationTypes';
import { getGoalLabel } from '../../../../config/goals';
import { useWorkspaceStore } from '../../../../stores/useWorkspaceStore';
import notifier from '../../../../services/NotificationService';
import { resolveItemSku } from '../../../../utils/skuResolver';
import { updateProduct } from '../../../../repositories/productRepository';
import {
  PackageCheck,
  FlaskConical,
  Stethoscope,
  Sparkles,
  Wand2,
  Layers,
  Eye,
  Activity,
  Play,
  Pause,
  Archive,
  Briefcase,
  ClipboardList,
  FileText,
  Droplets,
  Building2,
  Syringe
} from 'lucide-react';

const CATEGORY_STYLES = {
  peptide:               { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', icon: '💊', defaultLabel: 'Peptides' },
  raw_material:          { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', icon: '⚗️', defaultLabel: 'Bulk APIs & Raw Materials' },
  aesthetic_injectables: { bg: '#faf5ff', color: '#7c3aed', border: '#c4b5fd', icon: '💉', defaultLabel: 'Aesthetic Injectables' },
  diagnostic_test:       { bg: '#f0fdfa', color: '#0f766e', border: '#99f6e4', icon: '🩸', defaultLabel: 'Diagnostic Tests' },
  genomics_biomarkers:   { bg: '#eef2ff', color: '#4338ca', border: '#c7d2fe', icon: '🧬', defaultLabel: 'Genomics & Biomarkers' },
  nutricosmetics:        { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', icon: '🌿', defaultLabel: 'Nutricosmetics' },
  cosmetics:             { bg: '#f0fdfa', color: '#0d9488', border: '#5eead4', icon: '🧴', defaultLabel: 'Cosmeceuticals & Skincare' },
  clinical_supplies:     { bg: '#f8fafc', color: '#475569', border: '#e2e8f0', icon: '🩺', defaultLabel: 'Clinical Supplies' },
  iv_drips:              { bg: '#f0fdfa', color: '#0f766e', border: '#99f6e4', icon: '💧', defaultLabel: 'IV Drips & Protocols' },
  corporate_services:    { bg: '#faf5ff', color: '#7e22ce', border: '#e9d5ff', icon: '💼', defaultLabel: 'B2B Services' },
  supplement:            { bg: '#fffbeb', color: '#b45309', border: '#fde68a', icon: '💎', defaultLabel: 'Supplements' },
  compounding_material:  { bg: '#fdf2f8', color: '#be185d', border: '#fbcfe8', icon: '🧪', defaultLabel: 'Compounding Materials' },
  hormone:               { bg: '#fff7ed', color: '#c2410c', border: '#ffedd5', icon: '⚡', defaultLabel: 'Hormones' },
};

const CATEGORY_ALIASES = {
  'api_raw_material': 'raw_material',
  'api_raw_materials': 'raw_material',
  'Aesthetic Injectables': 'aesthetic_injectables',
  'skincare': 'cosmetics',
  'service': 'corporate_services',
  'logistics_service': 'corporate_services',
  'medical_supplies': 'clinical_supplies',
  'diagnostic': 'diagnostic_test',
};

function resolveCategoryBadge(rawCat, categoryOptions = []) {
  if (!rawCat) {
    return {
      bg: '#f8fafc',
      color: '#64748b',
      border: '#e2e8f0',
      icon: '📦',
      label: 'Uncategorized'
    };
  }
  const normId = CATEGORY_ALIASES[rawCat] || rawCat;
  const opt = categoryOptions.find(o => o.value === normId || o.value === rawCat);
  const style = CATEGORY_STYLES[normId] || {
    bg: '#f8fafc',
    color: '#475569',
    border: '#e2e8f0',
    icon: opt?.icon || '📦',
    defaultLabel: normId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  };
  return {
    bg: style.bg,
    color: style.color,
    border: style.border,
    icon: opt?.icon || style.icon,
    label: opt?.label || style.defaultLabel || normId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  };
}

export function useMasterCatalogColumns({
  categoryOptions = [],
  filterSupplier = [],
  supplierIdToName = {},
  protocols = [],
  onParentFieldUpdate,
  onOpenDrawer,
  setSelectedProduct,
  setEnrichmentProduct,
  setTransactionsProduct,
  openPrescriptionDrawer,
  onEditGenomicPriority,
  refresh,
  queryClient,
  setOptimisticOverrides,
  handleInstantEnrich,
  enrichingProductIds
}) {
  return useMemo(() => [
    {
      key: 'product',
      header: 'Canonical Product',
      width: '45%',
      mobilePriority: 1,
      render: (row) => (
        <AppEntityCell
          title={
            <ScientificHoverCard product={row}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  <InlineEditableCell 
                    value={row.canonicalName || row.name || row.displayName || row.title || 'Unknown Product'} 
                    type="text" 
                    onSave={(v) => {
                      onParentFieldUpdate(row, 'canonicalName', v);
                      onParentFieldUpdate(row, 'name', v);
                    }} 
                  />
                </span>
                <CopyableId value={row.id} iconOnly={true} />
                <DataCompletenessBadge
                  product={row}
                  onClick={(p) => setEnrichmentProduct?.(p)}
                />
              </div>
            </ScientificHoverCard>
          }
          subtitle={
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginTop: '3px' }}>
              {/* 1. Single Interactive Category Badge (GCP Enterprise Style) */}
              {(() => {
                const catBadge = resolveCategoryBadge(row.category, categoryOptions);
                return (
                  <div style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    backgroundColor: '#f1f3f4', 
                    border: '1px solid #dadce0', 
                    borderRadius: '4px', 
                    padding: '1px 6px',
                    fontSize: '0.70rem',
                    fontWeight: 600,
                    color: '#3c4043'
                  }}>
                    <InlineEditableCell 
                      value={row.category || 'No Category'} 
                      type="select" 
                      options={categoryOptions}
                      format={() => (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <span>{catBadge.icon}</span>
                          <span>{catBadge.label}</span>
                        </span>
                      )}
                      onSave={(v) => onParentFieldUpdate(row, 'category', v)} 
                    />
                  </div>
                );
              })()}

              <span style={{ color: '#dadce0', fontSize: '0.8rem', userSelect: 'none' }}>•</span>

              {/* 2. Format & Variant Footprint (Clean Secondary Text) */}
              {(() => {
                const catLower = String(row.category || '').toLowerCase();
                const isCorpService = catLower === 'corporate_services' || catLower === 'service' || row.type === 'service' || row.product_type === 'service' || row.isCorporateService || row.isService;
                const variants = row.variants || [];
                const n = variants.length || row.variantsCount || 0;

                if (isCorpService) {
                  return (
                    <span style={{ fontSize: '0.73rem', color: '#5f6368', fontWeight: 500 }}>
                      💼 {n} {n === 1 ? 'Service Tier' : 'Service Tiers'}
                    </span>
                  );
                }

                let formatStr = extractProductPresentation(row);
                if (catLower === 'diagnostic_test' || catLower === 'diagnostic') {
                  const firstPres = String(variants[0]?.presentation || variants[0]?.presentationName || '').toLowerCase();
                  if (firstPres.includes('blood')) formatStr = 'Blood Test Kit';
                  else if (firstPres.includes('dna') || firstPres.includes('swab')) formatStr = 'Genetic Swab Kit';
                  else formatStr = 'Diagnostic Kit';
                }

                return (
                  <span style={{ fontSize: '0.73rem', color: '#5f6368', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <span style={{ fontWeight: 600, color: '#202124' }}>{formatStr}</span>
                    <span style={{ color: '#5f6368' }}>({n} {n === 1 ? 'var' : 'vars'})</span>
                  </span>
                );
              })()}

              {/* 3. Associated Clinical / Genomic Program (GCP Minimalist Tag) */}
              {Array.isArray(row.programs) && row.programs.length > 0 && (
                <>
                  <span style={{ color: '#dadce0', fontSize: '0.8rem', userSelect: 'none' }}>•</span>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                    {row.programs.map((prog, pIdx) => {
                      const progSlug = prog.slug || prog.id || '';
                      let progShortName = prog.name ? prog.name.replace('Fagron Genomics | ', '') : 'Genomics';
                      if (progSlug === 'fagron-genomics-telotest') progShortName = 'TeloTest';
                      if (progSlug === 'fagron-genomics-trichotest') progShortName = 'TrichoTest';
                      if (progSlug === 'fagron-genomics-nutrigen') progShortName = 'NutriGen';
                      if (progShortName.length > 18) progShortName = progShortName.slice(0, 16) + '…';

                      const pri = prog.priority || 'A';
                      const priColor = pri === 'A' ? '#137333' : pri === 'B' ? '#b06000' : '#5f6368';

                      return (
                        <span
                          key={prog.id || pIdx}
                          onClick={(e) => {
                            if (onEditGenomicPriority) {
                              e.stopPropagation();
                              onEditGenomicPriority(row, progSlug);
                            }
                          }}
                          style={{
                            fontSize: '0.67rem',
                            fontWeight: 500,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            background: '#f8f9fa',
                            color: '#3c4043',
                            border: '1px solid #dadce0',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: onEditGenomicPriority ? 'pointer' : 'default',
                          }}
                          title={`Associated Program: ${prog.name || progShortName} (Priority ${pri}). Click to edit.`}
                        >
                          <span>{progShortName}</span>
                          <span style={{
                            fontSize: '0.62rem',
                            color: priColor,
                            fontWeight: 700
                          }}>
                            · {pri}
                          </span>
                        </span>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          }
        />
      )
    },
    {
      key: 'suppliers',
      header: 'Suppliers',
      width: '10%',
      align: 'center',
      nowrap: true,
      mobilePriority: 2,
      render: (row) => {
        // Collect canonical supplier IDs only (never mix company names with IDs)
        const supplierIdSet = new Set();
        if (row.supplierId && typeof row.supplierId === 'string' && !row.supplierId.includes(' ')) {
          supplierIdSet.add(row.supplierId.toLowerCase().replace(/^supplier-/, ''));
        }
        if (Array.isArray(row.supplierIds)) {
          row.supplierIds.forEach(id => {
            if (id && typeof id === 'string' && !id.includes(' ')) {
              supplierIdSet.add(id.toLowerCase().replace(/^supplier-/, ''));
            }
          });
        }
        if (Array.isArray(row.suppliers)) {
          row.suppliers.forEach(s => {
            const id = typeof s === 'object' && s !== null ? s.id : s;
            if (id && typeof id === 'string' && (id.startsWith('supplier-') || !id.includes(' '))) {
              supplierIdSet.add(id.toLowerCase().replace(/^supplier-/, ''));
            }
          });
        }
        (row.variants || []).forEach(v => {
          if (v.supplierId && typeof v.supplierId === 'string' && !v.supplierId.includes(' ')) {
            supplierIdSet.add(v.supplierId.toLowerCase().replace(/^supplier-/, ''));
          }
        });

        const allSuppliers = Array.from(supplierIdSet);
        const totalCount = allSuppliers.length > 0
          ? allSuppliers.length
          : (typeof row.supplierCount === 'number' && row.supplierCount > 0 ? row.supplierCount : 1);
        const hasSupplierFilter = filterSupplier.length > 0;
        let matchingCount = totalCount;
        if (hasSupplierFilter) {
          const matched = filterSupplier.filter(filterVal => {
            const cleanFilter = String(filterVal).toLowerCase().replace(/^supplier-/, '');
            return supplierIdSet.has(cleanFilter);
          });
          matchingCount = matched.length > 0 ? Math.min(matched.length, totalCount) : 1;
        }

        if (hasSupplierFilter) {
          return (
            <span 
              style={{ 
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'baseline',
                gap: '2px',
                fontWeight: 600, 
                fontSize: '0.74rem',
                color: '#1a73e8',
                backgroundColor: '#e8f0fe',
                border: '1px solid #d2e3fc',
                padding: '2px 8px',
                borderRadius: '4px'
              }}
              title={`Showing ${matchingCount} of ${totalCount} suppliers available`}
            >
              <span>{matchingCount}</span>
              <span style={{ fontSize: '0.68rem', color: '#5f6368', fontWeight: 500 }}>/{totalCount}</span>
            </span>
          );
        }

        return (
          <span 
            style={{ 
              whiteSpace: 'nowrap',
              fontWeight: 600, 
              color: '#3c4043',
              backgroundColor: '#f1f3f4',
              border: '1px solid #dadce0',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.74rem',
              display: 'inline-block'
            }}
            title={`${totalCount} suppliers available`}
          >
            {totalCount}
          </span>
        );
      }
    },
    {
      key: 'status',
      header: 'Status',
      width: '18%',
      align: 'center',
      mobilePriority: 2,
      render: (row) => {
        const isInactive = row.isActive === false || row.status === 'inactive';
        const isOutOfStock = row.status === 'out of stock' || row.status === 'out_of_stock';
        const isExplicitInStock = row.stockType === 'in_stock' && Number(row.totalStock) > 0 && !row.isDemand;
        const isLow = isExplicitInStock && Number(row.totalStock) < 10;

        let currentOption;
        let badgeStatus;
        let badgeLabel;

        if (isInactive) {
          currentOption = 'inactive';
          badgeStatus = 'inactive';
          badgeLabel = 'Paused';
        } else if (isOutOfStock) {
          currentOption = 'out_of_stock';
          badgeStatus = 'out of stock';
          badgeLabel = 'Out of Stock';
        } else if (isLow) {
          currentOption = 'low_stock';
          badgeStatus = 'pending';
          badgeLabel = 'Low Stock';
        } else if (isExplicitInStock) {
          currentOption = 'in_stock';
          badgeStatus = 'active';
          badgeLabel = 'In Stock';
        } else {
          // Standard catalog model: All active products & APIs are On Demand
          currentOption = 'on_demand';
          badgeStatus = 'pending';
          badgeLabel = 'On Demand';
        }

        const statusOptions = [
          { value: 'on_demand', label: '🟡 On Demand (Supplier Synthesis / SCM)' },
          { value: 'in_stock', label: '🟢 In Stock (Immediate Dispatch)' },
          { value: 'low_stock', label: '🟠 Low Stock (< 10 units)' },
          { value: 'out_of_stock', label: '🔴 Out of Stock (Depleted)' },
          { value: 'inactive', label: '⚪ Paused (Hidden from Store)' }
        ];

        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'center' }}>
            <SearchableDropdown
              value={currentOption}
              options={statusOptions}
              inline={true}
              displayValue={
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <StatusBadge status={badgeStatus} customLabel={badgeLabel} />
                  {isExplicitInStock && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                      ({row.totalStock})
                    </span>
                  )}
                </div>
              }
              onChange={async (newVal) => {
                try {
                  let updatePayload = {};
                  if (newVal === 'on_demand') {
                    updatePayload = { inStock: true, totalStock: 0, stockType: 'on_demand', isDemand: true, availability: 'on_demand', status: 'active', isActive: true };
                  } else if (newVal === 'in_stock') {
                    updatePayload = { inStock: true, totalStock: row.totalStock > 0 ? row.totalStock : 50, stockType: 'in_stock', status: 'active', isActive: true, isDemand: false };
                  } else if (newVal === 'low_stock') {
                    updatePayload = { inStock: true, totalStock: 5, stockType: 'in_stock', status: 'active', isActive: true, isDemand: false };
                  } else if (newVal === 'out_of_stock') {
                    updatePayload = { inStock: false, totalStock: 0, status: 'out of stock', isActive: true, isDemand: false };
                  } else if (newVal === 'inactive') {
                    updatePayload = { inStock: false, status: 'inactive', isActive: false };
                  }

                  setOptimisticOverrides?.(prev => ({
                    ...prev,
                    [row.id]: { ...row, ...updatePayload }
                  }));

                  const { doc, updateDoc } = await import('firebase/firestore');
                  const { db } = await import('@/firebase');
                  await updateDoc(doc(db, 'products', row.id), {
                    ...updatePayload,
                    updatedAt: new Date().toISOString()
                  });

                  notifier.success(`Status updated to ${statusOptions.find(o => o.value === newVal)?.label || newVal}`);
                  queryClient?.invalidateQueries({ queryKey: ['catalog-summary'], exact: false });
                  refresh?.();
                } catch (err) {
                  notifier.error('Failed to update status: ' + err.message);
                }
              }}
            />
          </div>
        );
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '27%',
      align: 'right',
      isAction: true,
      render: (row) => {
        const matchedProtocols = (protocols || [])
          .filter(p => (p.peptideIds || []).includes(row.id) || (p.peptides || []).some(pep => pep.id === row.id || pep.name?.toLowerCase() === row.canonicalName?.toLowerCase()))
          .slice(0, 3)
          .map(p => ({ name: p.name, goal: p.primary_goal, slug: p.protocol_slug || p.id }));

        const cleanVariants = (row.variants || []).map(v => ({
          dosage: v.dosage,
          presentation: PRESENTATION_LABELS[v.presentation] || v.presentation,
          presentationId: v.presentation,
          supplier: supplierIdToName[v.supplierId] || v.supplierName || v.supplierId,
          price: v.resolvedPrice?.perUnit || v.pricePerUnit || v.price,
          unit_price: v.resolvedPrice?.perUnit || v.pricePerUnit || v.price,
          cost: v.cost ?? v.unit_cost ?? v.pricing?.masterPrice?.base ?? v.pricing?.master?.perUnit ?? null,
          wholesalePrice: v.wholesalePrice ?? v.wholesale_price ?? v.pricing?.wholesalePrice?.base ?? v.pricing?.wholesale?.perUnit ?? null,
          clinicPrice: v.clinicPrice ?? v.clinic_price ?? v.pricing?.clinicPrice?.base ?? v.pricing?.clinic?.perUnit ?? null,
          cost_tiers: v.cost_tiers || (v.price_per_kit_10 ? { cost_10: v.price_per_kit_10, cost_50: v.price_per_kit_50 } : null),
          stock: v.stock,
        }));

        const formatSummary = {};
        (row.variants || []).forEach(v => {
          const label = PRESENTATION_LABELS[v.presentation] || v.presentation || 'Standard';
          formatSummary[label] = (formatSummary[label] || 0) + 1;
        });

        const isEnriching = enrichingProductIds instanceof Set ? enrichingProductIds.has(row.id) : false;

        const actions = [
          {
            type: 'enrich',
            icon: Wand2,
            label: isEnriching ? `Enriqueciendo ${row.canonicalName}...` : `✨ Enrich ${row.canonicalName} with AI`,
            onClick: () => {
              if (typeof handleInstantEnrich === 'function') {
                handleInstantEnrich(row);
              } else {
                setEnrichmentProduct?.(row);
              }
            },
            disabled: isEnriching
          },
          {
            type: 'offers',
            icon: Layers,
            label: `Price Comparison & Offers (${row.variants?.length || 0} variants)`,
            onClick: () => { setSelectedProduct?.(row); onOpenDrawer?.('offers'); }
          },
          {
            type: 'view',
            icon: Eye,
            label: 'View Product Details',
            onClick: () => { setSelectedProduct?.(row); onOpenDrawer?.('quick-view'); }
          },
          {
            type: 'datasheet',
            icon: FileText,
            label: 'Product Sheet (Clinical Monograph)',
            onClick: () => { setSelectedProduct?.(row); onOpenDrawer?.('datasheet'); }
          },
          {
            type: 'sparkles',
            icon: Sparkles,
            label: `Ask ClinicalAI about ${row.canonicalName}`,
            onClick: (e) => {
              e?.stopPropagation?.();
              window.dispatchEvent(new CustomEvent('open-clinical-ai', {
                detail: {
                  action: 'ask_about_entity',
                  entityName: row.canonicalName,
                  displayText: `Clinical Profile: ${row.canonicalName}`,
                  autoSend: true,
                  clearHistory: true,
                  productMode: true,
                  autoGenerate: true,
                  context: {
                    isProductPage: true,
                    productMode: true,
                    name: row.canonicalName,
                    canonicalName: row.canonicalName,
                    displayName: row.displayName || row.canonicalName,
                    slug: row.slug || row.id,
                    id: row.id,
                    category: row.category,
                    tags: row.tags || [],
                    goalIds: row.goalIds || [],
                    goalLabels: (row.goalIds || []).map(g => getGoalLabel(g)).filter(Boolean),
                    description: row.description || row.short_description || '',
                    variants: cleanVariants,
                    formatSummary,
                    priceRange: row.priceRange,
                    relatedProtocols: matchedProtocols,
                  }
                }
              }));
            }
          },
          {
            type: 'usage',
            icon: Activity,
            label: 'Usage & Transactions',
            onClick: () => { setTransactionsProduct?.(row); }
          },
          {
            type: row.isActive === false ? 'play' : 'pause',
            icon: row.isActive === false ? Play : Pause,
            label: row.isActive === false ? 'Activate Product' : 'Pause Product',
            onClick: async () => {
              const isPausing = row.isActive !== false;
              try {
                await Promise.all((row.variants || []).map(v =>
                  updateProduct(v.id, { isActive: !isPausing, status: isPausing ? 'archived' : 'active' }, { strict: false })
                ));
                notifier.success(`Product ${row.canonicalName} ${isPausing ? 'paused' : 'activated'}`);
                refresh?.();
              } catch (e) {
                notifier.error('Failed to update product status');
                console.error(e);
              }
            }
          },
          {
            type: 'archive',
            icon: Archive,
            label: 'Archive Product',
            onClick: () => {
              notifier.confirmCritical(
                `Archive "${row.canonicalName}"? It will be hidden from the catalog.`,
                async () => {
                  try {
                    await updateProduct(row.id, { status: 'archived', isActive: false }, { strict: false });
                    notifier.success(`"${row.canonicalName}" archived.`);
                    refresh?.();
                  } catch (e) {
                    notifier.error('Archive failed: ' + e.message);
                  }
                }
              );
            }
          },
          {
            type: 'add_to_workspace',
            icon: Briefcase,
            label: 'Add to Workspace',
            onClick: () => {
              const itemToAdd = {
                id: row.variants?.[0]?.id || row.id,
                productId: row.id,
                variantId: row.variants?.[0]?.id || row.id,
                canonicalName: row.canonicalName || row.displayName || row.name || 'Compound',
                sku: resolveItemSku({ ...row, ...row.variants?.[0] }),
                dosage: row.variants?.[0]?.dosage || row.dosage || '',
                format: row.variants?.[0]?.format || row.format || 'Vial',
                quantity: 1,
                unitPrice: row.variants?.[0]?.resolvedPrice?.perUnit || row.variants?.[0]?.price || 0,
                supplierCost: row.variants?.[0]?.supplierCost || row.pricing?.supplierCost || 0,
                supplierName: row.variants?.[0]?.supplierName || (row.suppliers && row.suppliers[0]) || '',
                supplierId: row.variants?.[0]?.supplierId || '',
              };
              const { workspaces, activeWorkspaceId, addItem } = useWorkspaceStore.getState();
              const wsList = Object.values(workspaces || {});
              const activeWs = workspaces[activeWorkspaceId] || wsList[0];
              addItem(itemToAdd, activeWs?.id);
              notifier.success(`"${itemToAdd.canonicalName}" agregado a ${activeWs?.name || 'Workspace 1'}.`);
            }
          },
          {
            type: 'create_prescription',
            icon: ClipboardList,
            label: 'New Rx with this product',
            onClick: () => openPrescriptionDrawer?.(row)
          }
        ];

        return <AppActionGroup maxVisible={2} actions={actions} />;
      }
    }
  ], [
    categoryOptions,
    filterSupplier,
    supplierIdToName,
    protocols,
    onParentFieldUpdate,
    onOpenDrawer,
    setSelectedProduct,
    setEnrichmentProduct,
    setTransactionsProduct,
    openPrescriptionDrawer,
    refresh,
    queryClient,
    setOptimisticOverrides
  ]);
}
