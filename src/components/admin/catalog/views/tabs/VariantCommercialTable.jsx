"use client";

import { CATALOG_ACTIONS } from "../../hooks/useCatalogActionRouter";
import React, { useState, useMemo } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { Check, Edit2, Play, Pause, ExternalLink, Eye, Sparkles } from 'lucide-react';
import { db } from '../../../../../firebase';
import AppActionGroup from '../../../../ui/AppActionGroup';
import DataTable from '../../../../ui/DataTable';
import InlineEditableCell from '../../../../ui/InlineEditableCell';
import notifier from '../../../../../services/NotificationService';
import { PRESENTATION_LABELS } from '../../../../../constants/presentationTypes';

export default function VariantCommercialTable({ variants, parentProduct, onAction, selectedIds = [], onSelectionChange }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return ' ↕';
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  const processedVariants = useMemo(() => {
    const extractNumber = (val) => {
      if (val && typeof val === 'object') return Number(val.perUnit || val.kit) || 0;
      return Number(val) || 0;
    };

    return variants.map(v => {
      const rawCost = extractNumber(v.cost_per_gram || v.cost || v.unitCost || v.pricing?.supplierCost);
      const rawCost10 = extractNumber(v.pricing?.supplierCost10 || 0);
      const rawShipping = extractNumber(v.shippingCost || v.shipping);
      const rawWholesale = extractNumber(v.pricing?.wholesale || v.wholesalePrice || v.wholesale);
      const rawWholesale10 = extractNumber(v.pricing?.wholesale10 || 0);
      const rawClinic = extractNumber(v.pricing?.clinic || v.clinicPrice || v.clinic);
      const rawClinic10 = extractNumber(v.pricing?.clinic10 || 0);
      const rawMsrp = extractNumber(v.pricing?.retail || v.msrp || v.price);
      const rawMsrp10 = extractNumber(v.pricing?.retail10 || 0);

      const generateFallbackSku = () => {
        const prodName = parentProduct?.name || parentProduct?.displayName || 'UNK';
        const safeName = prodName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 5).toUpperCase();
        const format = (v.format || '').substring(0, 3).toUpperCase();
        const size = (v.size || v.dosage || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        return ['SKU', safeName, format, size].filter(Boolean).join('-');
      };

      const typeStr = v.formatLabel || v.format || v.productType || '';
      const dosageStr = v.dosage || v.size || '';
      const unitStr = v.kit?.unit || v.dosage_unit || '';
      let displayDosageFormat = '-';
      if (typeStr.toLowerCase().includes('api')) {
        displayDosageFormat = `API (Bulk)`;
      } else if (dosageStr) {
        const presentation = unitStr ? unitStr : (typeStr.toLowerCase().includes('lyophilized') ? 'Vial' : typeStr);
        displayDosageFormat = `${dosageStr} / ${presentation.charAt(0).toUpperCase() + presentation.slice(1)}`;
      } else {
        displayDosageFormat = typeStr || '-';
      }

      return {
        ...v,
        displayDosageFormat,
        displaySku: v.sku || generateFallbackSku(),
        supplierName: v.supplier || parentProduct?.supplier || 'Unassigned',
        rawCost: Number(rawCost),
        rawCost10: Number(rawCost10),
        rawWholesale: Number(rawWholesale),
        rawWholesale10: Number(rawWholesale10),
        rawClinic: Number(rawClinic),
        rawClinic10: Number(rawClinic10),
        rawMsrp: Number(rawMsrp),
        rawMsrp10: Number(rawMsrp10),
      };
    });
  }, [variants, parentProduct]);

  const sortedVariants = useMemo(() => {
    let sortableItems = [...processedVariants];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [processedVariants, sortConfig]);

  const allSelected = variants.length > 0 && variants.every(v => selectedIds.includes(v.id));

  const handleSelectAll = (e) => {
    if (!onSelectionChange) return;
    if (e.target.checked) {
      const newIds = new Set([...selectedIds, ...variants.map(v => v.id)]);
      onSelectionChange(Array.from(newIds));
    } else {
      const variantIds = new Set(variants.map(v => v.id));
      onSelectionChange(selectedIds.filter(id => !variantIds.has(id)));
    }
  };

  const handleSelectRow = (id, checked) => {
    if (!onSelectionChange) return;
    if (checked) onSelectionChange([...selectedIds, id]);
    else onSelectionChange(selectedIds.filter(sid => sid !== id));
  };

  const columns = [
    ...(onSelectionChange ? [{
      key: 'select',
      header: <input type="checkbox" checked={allSelected} onChange={handleSelectAll} style={{ cursor: 'pointer' }} />,
      render: (val, row) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(row.id)}
          onChange={(e) => handleSelectRow(row.id, e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          style={{ cursor: 'pointer' }}
        />
      )
    }] : []),
    {
      key: 'displayDosageFormat',
      header: <span onClick={() => handleSort('displayDosageFormat')} style={{ cursor: 'pointer' }}>Dosage / Format{getSortIcon('displayDosageFormat')}</span>,
      render: (val) => <span style={{ fontWeight: 500 }}>{val}</span>
    },
    {
      key: 'supplierName',
      header: <span onClick={() => handleSort('supplierName')} style={{ cursor: 'pointer' }}>Supplier{getSortIcon('supplierName')}</span>,
      render: (val) => <span>{val}</span>
    },
    {
      key: 'rawCost',
      header: <span onClick={() => handleSort('rawCost')} style={{ cursor: 'pointer' }}>Base Cost{getSortIcon('rawCost')}</span>,
      render: (val, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', width: '16px' }}>1x</span>
            <InlineEditableCell
              value={val || 0}
              type="number"
              format={(v) => (v ? `$${v}` : '-')}
              onSave={async (newVal) => {
                const numeric = parseFloat(newVal) || 0;
                if (numeric !== val) {
                  const ref = doc(db, 'products', parentProduct.id, 'variants', row.id);
                  await updateDoc(ref, { 'pricing.supplierCost': numeric });
                  notifier.success('Base cost updated');
                }
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', width: '16px' }}>10x</span>
            <InlineEditableCell
              value={row.rawCost10 || 0}
              type="number"
              format={(v) => (v ? `$${v}` : '-')}
              onSave={async (newVal) => {
                const numeric = parseFloat(newVal) || 0;
                if (numeric !== row.rawCost10) {
                  const ref = doc(db, 'products', parentProduct.id, 'variants', row.id);
                  await updateDoc(ref, { 'pricing.supplierCost10': numeric });
                  notifier.success('Base cost (10 kits) updated');
                }
              }}
            />
          </div>
        </div>
      )
    },
    {
      key: 'rawWholesale',
      header: <span onClick={() => handleSort('rawWholesale')} style={{ cursor: 'pointer' }}>Wholesale{getSortIcon('rawWholesale')}</span>,
      render: (val, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', width: '16px' }}>1x</span>
            <InlineEditableCell
              value={val || 0}
              type="number"
              format={(v) => (v ? `$${v}` : '-')}
              onSave={async (newVal) => {
                const numeric = parseFloat(newVal) || 0;
                if (numeric !== val) {
                  const ref = doc(db, 'products', parentProduct.id, 'variants', row.id);
                  await updateDoc(ref, { 'pricing.wholesale': numeric });
                  notifier.success('Wholesale price updated');
                }
              }}
            />
            {val && row.rawCost ? <span style={{fontSize:'0.75rem', color:'#64748b'}}>{Math.round(((val - row.rawCost)/val)*100)}%</span> : null}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', width: '16px' }}>10x</span>
            <InlineEditableCell
              value={row.rawWholesale10 || 0}
              type="number"
              format={(v) => (v ? `$${v}` : '-')}
              onSave={async (newVal) => {
                const numeric = parseFloat(newVal) || 0;
                if (numeric !== row.rawWholesale10) {
                  const ref = doc(db, 'products', parentProduct.id, 'variants', row.id);
                  await updateDoc(ref, { 'pricing.wholesale10': numeric });
                  notifier.success('Wholesale price (10 kits) updated');
                }
              }}
            />
            {row.rawWholesale10 && row.rawCost10 ? <span style={{fontSize:'0.75rem', color:'#64748b'}}>{Math.round(((row.rawWholesale10 - row.rawCost10)/row.rawWholesale10)*100)}%</span> : null}
          </div>
        </div>
      )
    },
    {
      key: 'rawClinic',
      header: <span onClick={() => handleSort('rawClinic')} style={{ cursor: 'pointer' }}>Clinic{getSortIcon('rawClinic')}</span>,
      render: (val, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', width: '16px' }}>1x</span>
            <InlineEditableCell
              value={val || 0}
              type="number"
              format={(v) => (v ? `$${v}` : '-')}
              onSave={async (newVal) => {
                const numeric = parseFloat(newVal) || 0;
                if (numeric !== val) {
                  const ref = doc(db, 'products', parentProduct.id, 'variants', row.id);
                  await updateDoc(ref, { 'pricing.clinic': numeric });
                  notifier.success('Clinic price updated');
                }
              }}
            />
            {val && row.rawWholesale ? <span style={{fontSize:'0.75rem', color:'#64748b'}}>{Math.round(((val - row.rawWholesale)/val)*100)}%</span> : null}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', width: '16px' }}>10x</span>
            <InlineEditableCell
              value={row.rawClinic10 || 0}
              type="number"
              format={(v) => (v ? `$${v}` : '-')}
              onSave={async (newVal) => {
                const numeric = parseFloat(newVal) || 0;
                if (numeric !== row.rawClinic10) {
                  const ref = doc(db, 'products', parentProduct.id, 'variants', row.id);
                  await updateDoc(ref, { 'pricing.clinic10': numeric });
                  notifier.success('Clinic price (10 kits) updated');
                }
              }}
            />
            {row.rawClinic10 && row.rawWholesale10 ? <span style={{fontSize:'0.75rem', color:'#64748b'}}>{Math.round(((row.rawClinic10 - row.rawWholesale10)/row.rawClinic10)*100)}%</span> : null}
          </div>
        </div>
      )
    },
    {
      key: 'rawMsrp',
      header: <span onClick={() => handleSort('rawMsrp')} style={{ cursor: 'pointer' }}>MSRP{getSortIcon('rawMsrp')}</span>,
      render: (val, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', width: '16px' }}>1x</span>
            <span style={{ fontWeight: 'bold' }}>
              <InlineEditableCell
                value={val || 0}
                type="number"
                format={(v) => (v ? `$${v}` : '-')}
                onSave={async (newVal) => {
                  const numeric = parseFloat(newVal) || 0;
                  if (numeric !== val) {
                    const ref = doc(db, 'products', parentProduct.id, 'variants', row.id);
                    await updateDoc(ref, { 'pricing.retail': numeric });
                    notifier.success('MSRP updated');
                  }
                }}
              />
            </span>
            {val && row.rawClinic ? <span style={{fontSize:'0.75rem', color:'#f59e0b'}}>{Math.round(((val - row.rawClinic)/val)*100)}%</span> : null}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', width: '16px' }}>10x</span>
            <span style={{ fontWeight: 'bold' }}>
              <InlineEditableCell
                value={row.rawMsrp10 || 0}
                type="number"
                format={(v) => (v ? `$${v}` : '-')}
                onSave={async (newVal) => {
                  const numeric = parseFloat(newVal) || 0;
                  if (numeric !== row.rawMsrp10) {
                    const ref = doc(db, 'products', parentProduct.id, 'variants', row.id);
                    await updateDoc(ref, { 'pricing.retail10': numeric });
                    notifier.success('MSRP (10 kits) updated');
                  }
                }}
              />
            </span>
            {row.rawMsrp10 && row.rawClinic10 ? <span style={{fontSize:'0.75rem', color:'#f59e0b'}}>{Math.round(((row.rawMsrp10 - row.rawClinic10)/row.rawMsrp10)*100)}%</span> : null}
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (val, row) => (
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <AppActionGroup
            maxVisible={3}
            actions={[
              {
                type: 'sparkles',
                icon: Sparkles,
                label: `Ask ClinicalAI about ${parentProduct?.canonicalName || 'Product'}`,
                onClick: (e) => {
                  e?.stopPropagation?.();
                  window.dispatchEvent(new CustomEvent('open-clinical-ai', {
                    detail: {
                      action: 'ask_about_entity',
                      entityName: parentProduct?.canonicalName || row.name,
                      displayText: `Clinical Profile: ${parentProduct?.canonicalName || row.name}`,
                      autoSend: true,
                      clearHistory: true,
                      productMode: true,    // ✔️ activa modo producto sticky
                      autoGenerate: true,   // ✔️ auto-genera el perfil al abrir
                      context: {
                        isProductPage: true,
                        productMode: true,
                        // ── Identificación ─────────────────────────────────────
                        name: parentProduct?.canonicalName || row.name,
                        canonicalName: parentProduct?.canonicalName || row.name,
                        displayName: parentProduct?.displayName || parentProduct?.canonicalName,
                        slug: parentProduct?.slug || parentProduct?.id,
                        id: parentProduct?.id,
                        category: parentProduct?.category || '',
                        tags: parentProduct?.tags || [],
                        goalIds: parentProduct?.goalIds || [],
                        goalLabels: parentProduct?.goalLabels || [],
                        // ── Contenido clínico ──────────────────────────────────
                        description: parentProduct?.description || '',
                        objective: parentProduct?.objective || '',
                        mechanisms: parentProduct?.mechanisms || parentProduct?.mechanism || '',
                        clinical_benefits: parentProduct?.clinical_benefits || parentProduct?.clinicalBenefits || [],
                        pharmacology: parentProduct?.pharmacology || {
                          halfLife: parentProduct?.halfLife || null,
                          bioavailability: parentProduct?.bioavailability || null,
                          receptors: parentProduct?.receptors || [],
                        },
                        aiContent: parentProduct?.aiContent || null,
                        // ── Especificaciones ───────────────────────────────────
                        purity: parentProduct?.purity || '≥98%',
                        standard_dosage: parentProduct?.standard_dosage || '',
                        storage: parentProduct?.storage || null,
                        // ── Variante seleccionada ─────────────────────────────
                        selectedVariant: {
                          dosage: row.dosage,
                          presentation: PRESENTATION_LABELS[row.presentation] || row.presentation,
                          supplier: row.supplierName || row.supplierId,
                          price: row.pricing?.retail || row.msrp || row.price,
                          stock: row.stock
                        },
                        // ── Todas las variantes ───────────────────────────────
                        variants: (parentProduct?.variants || variants || []).map(v => ({
                          dosage: v.dosage,
                          presentation: PRESENTATION_LABELS[v.presentation] || v.presentation,
                          supplier: v.supplierName || v.supplierId,
                          price: v.pricing?.retail || v.msrp || v.price,
                          stock: v.stock,
                          purity: v.purity || parentProduct?.purity,
                        }))
                      }
                    }
                  }));
                }
              },
              { type: 'view', icon: Eye, label: 'Quick View', onClick: () => onAction && onAction(CATALOG_ACTIONS.QUICK_VIEW, parentProduct) },
              { type: 'edit', onClick: () => onAction && onAction(CATALOG_ACTIONS.EDIT_VARIANT, parentProduct, row, 'commercial') }
            ]}
          />
        </div>
      )
    }
  ];

  return (
    <div className="gcp-table-container">
      <DataTable
        columns={columns}
        data={sortedVariants}
        keyField={(row, idx) => row.id || idx.toString()}
        onRowClick={(row) => onAction && onAction(CATALOG_ACTIONS.EDIT_VARIANT, parentProduct, row, 'commercial')}
        rowStyle={(row) => ({
          backgroundColor: selectedIds.includes(row.id) ? 'var(--color-bg-selected)' : 'transparent',
          borderLeft: selectedIds.includes(row.id) ? '4px solid #3b82f6' : '4px solid transparent',
          cursor: 'pointer',
        })}
        emptyMessage="No variants found."
      />
    </div>
  );
}
