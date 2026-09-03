import React, { useMemo } from 'react';
import AppEntityCell from '../../../ui/AppEntityCell';
import InlineEditableCell from '../../../ui/InlineEditableCell';
import { CopyableId } from '../../../ui';
import StatusBadge from '../../../ui/StatusBadge';
import SearchableDropdown from '../../../ui/SearchableDropdown';
import AppActionGroup from '../../../ui/AppActionGroup';
import DataCompletenessBadge from '../DataCompletenessBadge';
import ScientificHoverCard from '../ScientificHoverCard';
import { getProductAvailableTypes } from '../../../../utils/productNormalizer';
import { PRESENTATION_LABELS } from '../../../../constants/presentationTypes';
import { getGoalLabel } from '../../../../config/goals';
import { useWorkspaceStore } from '../../../../stores/useWorkspaceStore';
import notifier from '../../../../services/NotificationService';
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
  ClipboardList
} from 'lucide-react';

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
      width: '44%',
      mobilePriority: 1,
      render: (row) => (
        <AppEntityCell
          title={
            <ScientificHoverCard product={row}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  <InlineEditableCell 
                    value={row.canonicalName || 'Unknown Product'} 
                    type="text" 
                    onSave={(v) => onParentFieldUpdate(row, 'canonicalName', v)} 
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '4px' }}>
              {/* Tier 1: Category & Product Grade Badges */}
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                {/* Category Pill */}
                <div style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  backgroundColor: '#f8fafc', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '5px', 
                  padding: '1px 6px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: '#334155'
                }}>
                  <InlineEditableCell 
                    value={row.category || 'No Category'} 
                    type="select" 
                    options={categoryOptions}
                    onSave={(v) => onParentFieldUpdate(row, 'category', v)} 
                  />
                </div>

                {/* Product Type Chips */}
                {(() => {
                  const types = getProductAvailableTypes(row);
                  const TYPE_CONFIG = {
                    finished_product:  { label: 'FINISHED',  icon: <PackageCheck size={11} strokeWidth={2.2} />, bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
                    raw_material:      { label: 'BULK API',   icon: <FlaskConical size={11} strokeWidth={2.2} />,  bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
                    clinical_supplies: { label: 'CLINICAL',   icon: <Stethoscope size={11} strokeWidth={2.2} />,   bg: '#f8fafc', color: '#475569', border: '#e2e8f0' },
                    diagnostic:        { label: 'DIAGNOSTIC', icon: <Sparkles size={11} strokeWidth={2.2} />,      bg: '#fef9c3', color: '#854d0e', border: '#fde047' },
                    service:           { label: 'SERVICE',    icon: <Sparkles size={11} strokeWidth={2.2} />,      bg: '#fdf4ff', color: '#7e22ce', border: '#e9d5ff' },
                    dual:              { label: 'DUAL',       icon: <Sparkles size={11} strokeWidth={2.2} />,      bg: 'linear-gradient(135deg, #f5f3ff 0%, #eff6ff 100%)', color: '#6d28d9', border: '#ddd6fe' },
                  };
                  return (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                      {types.map(t => {
                        const cfg = TYPE_CONFIG[t] || TYPE_CONFIG['finished_product'];
                        return (
                          <span key={t} style={{
                            fontSize: '0.68rem', fontWeight: 700,
                            padding: '1.5px 7px', borderRadius: '5px',
                            background: cfg.bg, color: cfg.color,
                            border: `1px solid ${cfg.border}`,
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                          }}>
                            {cfg.icon}
                            <span>{cfg.label}</span>
                          </span>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Associated Programs & Genomic Priorities */}
                {Array.isArray(row.programs) && row.programs.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {row.programs.map((prog, pIdx) => {
                      const progSlug = prog.slug || prog.id || '';
                      let progShortName = prog.name ? prog.name.replace('Fagron Genomics | ', '') : 'Genomics';
                      if (progSlug === 'fagron-genomics-telotest') progShortName = 'TeloTest';
                      if (progSlug === 'fagron-genomics-trichotest') progShortName = 'TrichoTest';
                      if (progSlug === 'fagron-genomics-nutrigen') progShortName = 'NutriGen';

                      const pri = prog.priority || 'A';
                      const priColor = pri === 'A' ? '#15803d' : pri === 'B' ? '#b45309' : '#0369a1';
                      const priBg = pri === 'A' ? '#f0fdf4' : pri === 'B' ? '#fffbeb' : '#f0f9ff';
                      const priBorder = pri === 'A' ? '#bbf7d0' : pri === 'B' ? '#fde68a' : '#bae6fd';

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
                            fontWeight: 700,
                            padding: '1.5px 6px',
                            borderRadius: '5px',
                            background: priBg,
                            color: priColor,
                            border: `1px solid ${priBorder}`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: onEditGenomicPriority ? 'pointer' : 'default',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                            transition: 'all 0.15s ease'
                          }}
                          title={`Associated Program: ${prog.name || progShortName} (Priority ${pri}). Click to edit.`}
                        >
                          <span>🧬 {progShortName}</span>
                          <span style={{
                            fontSize: '0.62rem',
                            backgroundColor: priColor,
                            color: '#ffffff',
                            padding: '0 4px',
                            borderRadius: '3px',
                            fontWeight: 800
                          }}>
                            {pri}
                          </span>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Tier 2: Variants Count & Formats Footprint */}
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '5px' }}>
                <span style={{ 
                  color: 'var(--color-primary, #003666)', 
                  fontWeight: 700, 
                  fontSize: '0.74rem',
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '3px' 
                }}>
                  <Layers size={12} strokeWidth={2.2} />
                  {(() => { const n = row.variants?.length || row.variantsCount || 0; return `${n} Var${n === 1 ? '' : 's'}`; })()}
                </span>

                {(() => {
                  const variants = row.variants || [];
                  if (variants.length === 0) return null;

                  const counts = {};
                  const isRawType = getProductAvailableTypes(row).includes('raw_material');
                  for (const v of variants) {
                    const pStr = String(v.presentation || v.presentationName || v.format || '').toLowerCase();
                    const isBulk = v.unitOfMeasure === 'g' || v.unitOfMeasure === 'kg' || v.supplierPricing?.unitOfMeasure === 'g' || pStr.includes('bulk') || pStr.includes('api') || pStr.includes('powder') || v.type === 'raw_material' || isRawType;
                    const isPen = pStr.includes('pen') || pStr.includes('cartridge');
                    const isSpray = pStr.includes('spray') || pStr.includes('nasal') || pStr.includes('drop');
                    const isCapsule = pStr.includes('capsule') || pStr.includes('oral');

                    const pres = isBulk ? 'bulk_powder_gram' : isPen ? 'pen' : isSpray ? 'spray' : isCapsule ? 'capsule' : 'vial';
                    counts[pres] = (counts[pres] || 0) + 1;
                  }

                  const badges = [];
                  const bulks = (counts.bulk_powder_gram || 0) + (counts.powder || 0) + (counts.raw_api || 0);
                  if (bulks > 0) {
                    badges.push(
                      <span key="bulk" style={{ fontSize: '0.68rem', fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}>
                        {bulks} Bulk API (g)
                      </span>
                    );
                  }
                  const pens = (counts.pen || 0) + (counts.cartridge || 0);
                  if (pens > 0) {
                    badges.push(
                      <span key="pens" style={{ fontSize: '0.68rem', fontWeight: 600, padding: '1px 5px', borderRadius: 4, background: '#fffbeb', color: '#b45309', border: '1px solid #fef3c7' }}>
                        {pens} Pen{pens > 1 ? 's' : ''}
                      </span>
                    );
                  }
                  if (counts.vial && !isRawType) {
                    badges.push(
                      <span key="vials" style={{ fontSize: '0.68rem', fontWeight: 600, padding: '1px 5px', borderRadius: 4, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #dbeafe' }}>
                        {counts.vial} Vial{counts.vial > 1 ? 's' : ''}
                      </span>
                    );
                  }
                  const sprays = (counts.spray || 0) + (counts.nasal_spray || 0) + (counts.sublingual_drops || 0);
                  if (sprays > 0) {
                    badges.push(
                      <span key="sprays" style={{ fontSize: '0.68rem', fontWeight: 600, padding: '1px 5px', borderRadius: 4, background: '#f0fdfa', color: '#0f766e', border: '1px solid #ccfbf1' }}>
                        {sprays} Spray{sprays > 1 ? 's' : ''}
                      </span>
                    );
                  }
                  const orals = (counts.capsule || 0) + (counts.tablet || 0);
                  if (orals > 0) {
                    badges.push(
                      <span key="orals" style={{ fontSize: '0.68rem', fontWeight: 600, padding: '1px 5px', borderRadius: 4, background: '#faf5ff', color: '#7e22ce', border: '1px solid #f3e8ff' }}>
                        {orals} Oral{orals > 1 ? 's' : ''}
                      </span>
                    );
                  }
                  const kits = (counts.kit || 0) + (counts.bundle || 0) + (counts.box || 0) + (counts.combination_blend || 0);
                  if (kits > 0) {
                    badges.push(
                      <span key="kits" style={{ fontSize: '0.68rem', fontWeight: 600, padding: '1px 5px', borderRadius: 4, background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }}>
                        {kits} Kit{kits > 1 ? 's' : ''}
                      </span>
                    );
                  }
                  const tests = (counts.blood_test || 0) + (counts.dna_test || 0) + (counts.digital || 0);
                  if (tests > 0) {
                    badges.push(
                      <span key="tests" style={{ fontSize: '0.68rem', fontWeight: 600, padding: '1px 5px', borderRadius: 4, background: '#ecfeff', color: '#0e7490', border: '1px solid #cffafe' }}>
                        {tests} Test{tests > 1 ? 's' : ''}
                      </span>
                    );
                  }

                  if (badges.length === 0) return null;
                  return (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', flexWrap: 'wrap' }}>
                      {badges}
                    </div>
                  );
                })()}
              </div>
            </div>
          }
        />
      )
    },
    {
      key: 'suppliers',
      header: 'Suppliers',
      width: '90px',
      align: 'center',
      nowrap: true,
      mobilePriority: 2,
      render: (row) => {
        const allSuppliers = Array.from(new Set([
          row.supplierId,
          row.supplier,
          ...(Array.isArray(row.supplierIds) ? row.supplierIds : []),
          ...(Array.isArray(row.suppliers) ? row.suppliers : []).map(s => typeof s === 'object' ? s.id || s.name : s),
          ...(row.variants || []).map(v => v.supplierId || v.supplier)
        ].filter(Boolean).map(s => String(s).toLowerCase().replace(/^supplier-/, ''))));

        const totalCount = allSuppliers.length > 0 ? allSuppliers.length : (typeof row.supplierCount === 'number' && row.supplierCount > 0 ? row.supplierCount : 1);
        const hasSupplierFilter = filterSupplier.length > 0;
        let matchingCount = totalCount;
        if (hasSupplierFilter) {
          const matched = filterSupplier.filter(filterVal => {
            const cleanFilter = String(filterVal).toLowerCase().replace(/^supplier-/, '');
            return allSuppliers.includes(cleanFilter);
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
                gap: '1px',
                fontWeight: 700, 
                fontSize: '0.74rem',
                color: '#0284c7',
                backgroundColor: '#f0f9ff',
                border: '1px solid #bae6fd',
                padding: '1px 6px',
                borderRadius: '6px'
              }}
              title={`Showing ${matchingCount} of ${totalCount} suppliers available`}
            >
              <span>{matchingCount}</span>
              <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 500 }}>/{totalCount}</span>
            </span>
          );
        }

        return (
          <span 
            style={{ 
              whiteSpace: 'nowrap',
              fontWeight: 700, 
              color: totalCount > 0 ? 'var(--color-primary, #003666)' : '#94a3b8',
              backgroundColor: totalCount > 0 ? 'rgba(0, 54, 102, 0.05)' : 'transparent',
              padding: totalCount > 0 ? '1px 6px' : '0',
              borderRadius: '6px',
              fontSize: '0.78rem',
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
      width: '16%',
      align: 'center',
      mobilePriority: 2,
      render: (row) => {
        const isInactive = row.isActive === false || row.status === 'inactive';
        const isOutOfStock = row.status === 'out of stock' || row.status === 'out_of_stock';
        const isExplicitInStock = row.stockType === 'in_stock' && Number(row.totalStock) > 0 && !row.isDemand;
        const isLow = isExplicitInStock && Number(row.totalStock) < 10;

        let currentOption = 'on_demand';
        let badgeStatus = 'pending';
        let badgeLabel = 'On Demand';

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
      width: '22%',
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
                sku: row.variants?.[0]?.sku || '',
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

        return <AppActionGroup maxVisible={3} actions={actions} />;
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
