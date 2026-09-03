'use client';
import React, { useState } from 'react';
import UniversalFormDrawer from '../../shared/UniversalFormDrawer';
import { SupplierSelect, TextField, Select, InlineAlert, Badge, Checkbox } from '../../ui';
import { db } from '../../../firebase';
import { doc, writeBatch, collection, getDocs, arrayUnion, arrayRemove } from 'firebase/firestore';
import notifier from '../../../services/NotificationService';
import { AlertTriangle, CheckSquare, Square, Tag, Layers, Archive, CheckCircle, Truck } from 'lucide-react';

const CANONICAL_CATEGORIES = [
  { value: 'peptide', label: '🧬 Péptidos / Peptides' },
  { value: 'supplement', label: '🌿 Suplementos / Supplements' },
  { value: 'hormone', label: '⚡ Hormonas / Hormones' },
  { value: 'diagnostic_test', label: '🧪 Pruebas Diagnósticas / Diagnostics' },
  { value: 'raw_material', label: '⚖️ Materia Prima / Bulk API' },
  { value: 'consumable', label: '💉 Insumos y Consumibles' },
  { value: 'skincare', label: '✨ Cuidado de la Piel / Skincare' },
  { value: 'bundle', label: '📦 Kits & Bundles' },
  { value: 'service', label: '📋 Servicios Clínicos' },
  { value: 'equipment', label: '🔬 Equipos de Laboratorio' },
];

const CANONICAL_TYPES = [
  { value: 'finished_product', label: '💊 Producto Terminado' },
  { value: 'raw_material', label: '🧪 Materia Prima / Bulk API' },
  { value: 'clinical_supplies', label: '💉 Insumos Clínicos' },
  { value: 'diagnostic', label: '🔬 Prueba Diagnóstica / Kit' },
  { value: 'service', label: '📋 Servicio Clínico' },
];

export default function ProductBulkEditModal({ isOpen, onClose, selectedProducts = [], onRefresh }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Track which fields the user explicitly opts-in to edit
  const [activeFields, setActiveFields] = useState({
    categoryId: false,
    type: false,
    supplierId: false,
    status: false,
    tags: false,
  });

  const [resolvedSupplierName, setResolvedSupplierName] = useState('');

  const toggleField = (field) => {
    setActiveFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (formData) => {
    const fieldsToUpdate = Object.keys(activeFields).filter(k => activeFields[k]);
    
    if (fieldsToUpdate.length === 0) {
      notifier.warning('Please select at least one field to update by checking its box.');
      return;
    }
    if (!selectedProducts || selectedProducts.length === 0) {
      notifier.warning('No products selected.');
      return;
    }

    const productIds = [...new Set(selectedProducts.map(pg => pg.id).filter(Boolean))];

    if (productIds.length === 0) {
      notifier.error('Could not find product records to update.');
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();
      const BATCH_LIMIT = 450;
      let batch = writeBatch(db);
      let opCount = 0;

      const flushBatch = async () => {
        if (opCount > 0) { await batch.commit(); batch = writeBatch(db); opCount = 0; }
      };

      for (const productId of productIds) {
        const productRef = doc(db, 'products', productId);
        const productUpdates = { updatedAt: now };

        if (activeFields.supplierId && formData.supplierId) {
          productUpdates.supplierId   = formData.supplierId;
          productUpdates.supplierName = resolvedSupplierName || formData.supplierId;
          productUpdates.supplier     = resolvedSupplierName || formData.supplierId;
        }
        if (activeFields.categoryId && formData.categoryId) {
          productUpdates.categoryId = formData.categoryId;
          productUpdates.category   = formData.categoryId;
        }
        if (activeFields.type && formData.type) {
          productUpdates.type           = formData.type;
          productUpdates.productType    = formData.type;
          productUpdates.primaryType    = formData.type;
          productUpdates.availableTypes = [formData.type];
          productUpdates.isHybrid       = false;
        }
        if (activeFields.status && formData.status) {
          productUpdates.status = formData.status;
        }
        if (activeFields.tags && formData.tagsAction && formData.tags) {
            const tagArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
            if (tagArray.length > 0) {
                if (formData.tagsAction === 'add') {
                    productUpdates.tags = arrayUnion(...tagArray);
                } else if (formData.tagsAction === 'remove') {
                    productUpdates.tags = arrayRemove(...tagArray);
                }
            }
        }

        // Apply base product updates if there are any
        if (Object.keys(productUpdates).length > 1) { // More than just updatedAt
          batch.update(productRef, productUpdates);
          opCount++;
          if (opCount >= BATCH_LIMIT) await flushBatch();
        }

        // Cascade supplier or status to ALL variants
        if (activeFields.supplierId || activeFields.status) {
          const variantsSnap = await getDocs(collection(db, 'products', productId, 'variants'));
          for (const varDoc of variantsSnap.docs) {
            const variantUpdates = { updatedAt: now };
            if (activeFields.supplierId && formData.supplierId) {
              variantUpdates.supplierId   = formData.supplierId;
              variantUpdates.supplierName = resolvedSupplierName || formData.supplierId;
              variantUpdates.supplier     = resolvedSupplierName || formData.supplierId; 
            }
            if (activeFields.status && formData.status) {
              variantUpdates.status = formData.status;
            }
            batch.update(varDoc.ref, variantUpdates);
            opCount++;
            if (opCount >= BATCH_LIMIT) await flushBatch();
          }
        }
      }

      await flushBatch();

      notifier.success(`Bulk updated ${productIds.length} products successfully.`);
      onRefresh?.();
      onClose();
    } catch (error) {
      console.error('[BulkEdit] Error:', error);
      notifier.error('Failed to apply bulk updates: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const FieldToggle = ({ fieldId, label, icon: Icon, children }) => {
    const isActive = activeFields[fieldId];
    return (
      <div style={{
        borderBottom: '1px solid var(--color-border)',
        padding: '1rem 0',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        <div 
          onClick={() => toggleField(fieldId)}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          {isActive ? <CheckSquare size={20} color="var(--color-primary)" /> : <Square size={20} color="var(--color-text-muted)" />}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            color: isActive ? 'var(--color-text-main)' : 'var(--color-text-muted)',
            fontWeight: isActive ? 600 : 500,
            fontSize: '0.9rem'
          }}>
             {Icon && <Icon size={16} />}
             <span>{label}</span>
          </div>
        </div>
        
        {isActive && (
          <div style={{ paddingLeft: '2.25rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', animation: 'fadeIn 0.2s ease' }}>
             {children}
          </div>
        )}
      </div>
    );
  };

  const customHeader = (
    <div style={{ marginBottom: '1.5rem' }}>
      <InlineAlert 
        type="warning"
        title="Bulk Update Mode"
      >
        <p style={{ margin: 0, marginBottom: '0.75rem', fontSize: '0.85rem' }}>
          You are editing <strong>{selectedProducts?.length || 0} product groups</strong>. 
          Check the boxes below to activate the fields you want to override.
        </p>
        
        {/* Chips for previewing names */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '100px', overflowY: 'auto', paddingRight: '4px' }}>
            {selectedProducts.map(p => (
                <Badge key={p.id} variant="neutral" style={{ fontSize: '0.7rem' }}>
                    {p.name || p.displayName || 'Unknown Product'}
                </Badge>
            ))}
        </div>
      </InlineAlert>
    </div>
  );

  return (
    <UniversalFormDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Edit Products"
      submitLabel={isSubmitting ? 'Applying...' : 'Apply Bulk Edit'}
      onSubmit={handleSubmit}
      customHeader={customHeader}
      schema={[
        {
          name: 'categoryField',
          type: 'custom',
          fullWidth: true,
          render: ({ formData, onChange }) => (
            <FieldToggle fieldId="categoryId" label="Change Category (Canonical)" icon={Layers}>
              <Select 
                value={formData.categoryId || ''}
                onChange={(val) => onChange({ ...formData, categoryId: val })}
                options={[
                  { label: '-- Select Canonical Category --', value: '' },
                  ...CANONICAL_CATEGORIES.map(c => ({ label: c.label, value: c.value }))
                ]}
              />
            </FieldToggle>
          )
        },
        {
          name: 'typeField',
          type: 'custom',
          fullWidth: true,
          render: ({ formData, onChange }) => (
            <FieldToggle fieldId="type" label="Change Product Type (Canonical)" icon={Layers}>
              <Select 
                value={formData.type || ''}
                onChange={(val) => onChange({ ...formData, type: val })}
                options={[
                  { label: '-- Select Canonical Type --', value: '' },
                  ...CANONICAL_TYPES.map(t => ({ label: t.label, value: t.value }))
                ]}
              />
            </FieldToggle>
          )
        },
        {
          name: 'supplierField',
          type: 'custom',
          fullWidth: true,
          render: ({ formData, onChange }) => (
            <FieldToggle fieldId="supplierId" label="Change Supplier (Cascades to Variants)" icon={Truck}>
              <SupplierSelect
                value={formData.supplierId || ''}
                onChange={(newId, newName) => {
                  setResolvedSupplierName(newName || newId || '');
                  onChange({ ...formData, supplierId: newId });
                }}
                placeholder="-- Select Supplier --"
              />
            </FieldToggle>
          )
        },
        {
          name: 'statusField',
          type: 'custom',
          fullWidth: true,
          render: ({ formData, onChange }) => (
            <FieldToggle fieldId="status" label="Change Status (Cascades to Variants)" icon={CheckCircle}>
              <Select 
                value={formData.status || ''}
                onChange={(val) => onChange({ ...formData, status: val })}
                options={[
                  { label: '-- Select Status --', value: '' },
                  { label: 'Active', value: 'active' },
                  { label: 'Draft', value: 'draft' },
                  { label: 'Out of Stock', value: 'out of stock' },
                  { label: 'Archived', value: 'archived' }
                ]}
              />
            </FieldToggle>
          )
        },
        {
          name: 'tagsField',
          type: 'custom',
          fullWidth: true,
          render: ({ formData, onChange }) => (
            <FieldToggle fieldId="tags" label="Modify Tags" icon={Tag}>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.25rem', alignItems: 'center' }}>
                  <div style={{ width: '140px', flexShrink: 0 }}>
                    <Select 
                      value={formData.tagsAction || 'add'}
                      onChange={(val) => onChange({ ...formData, tagsAction: val })}
                      options={[
                        { label: 'Add Tags', value: 'add' },
                        { label: 'Remove Tags', value: 'remove' }
                      ]}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <TextField 
                      placeholder="e.g. Best Seller, Promo"
                      value={formData.tags || ''}
                      onChange={(val) => onChange({ ...formData, tags: val })}
                    />
                  </div>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>Comma separated list of tags.</p>
            </FieldToggle>
          )
        }
      ]}
      initialData={{ categoryId: '', type: '', supplierId: '', status: '', tags: '', tagsAction: 'add' }}
    />
  );
}
