"use client";

import React, { useState } from 'react';
import UniversalFormDrawer from '../shared/UniversalFormDrawer';
import { createProduct } from '../../repositories/productRepository';
import { useToast } from '../../hooks/useToast';
import { Sparkles, Loader2 } from '@/lib/icons';

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
  { value: 'finished_product', label: '💊 Producto Terminado (Ready for Patient)' },
  { value: 'raw_material', label: '🧪 Materia Prima / Bulk API Powder' },
  { value: 'clinical_supplies', label: '💉 Insumos Clínicos & Diluyentes' },
  { value: 'diagnostic', label: '🔬 Prueba Diagnóstica / Diagnostic Kit' },
  { value: 'service', label: '📋 Servicio Clínico / Clinical Service' },
];

export default function ProductFormDrawer({ isOpen, onClose, onCreated }) {
  const { toast } = useToast();
  const [aiText, setAiText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [initialData, setInitialData] = useState({ 
    type: 'finished_product',
    categoryId: 'peptide',
    subcategory: 'Lyophilized Peptide APIs',
    basePrice: '',
    currency: 'USD',
    stock: '100',
    purityPercentage: '99.4',
    diluentRecommended: 'Bacteriostatic Water (0.9% Benzyl Alcohol)',
    status: 'draft'
  });

  const schema = [
    { name: 'name', label: 'Product / API Name', type: 'text', required: true, placeholder: 'e.g. BPC-157 Lyophilized API 5mg' },
    { name: 'sku', label: 'SKU / Catalog Code', type: 'text', required: true, placeholder: 'e.g. API-BPC157-5MG' },
    { 
      name: 'type', 
      label: 'Product Type (Canonical)', 
      type: 'select', 
      required: true, 
      options: CANONICAL_TYPES.map(t => ({ label: t.label, value: t.value })) 
    },
    { 
      name: 'categoryId', 
      label: 'Category (Canonical)', 
      type: 'select', 
      required: true, 
      options: CANONICAL_CATEGORIES.map(c => ({ label: c.label, value: c.value })) 
    },
    { 
      name: 'subcategory', 
      label: 'Subcategory', 
      type: 'select', 
      required: true, 
      options: [
        { label: '🧬 Lyophilized Peptide APIs', value: 'Lyophilized Peptide APIs' },
        { label: '⚖️ Bulk API Powder (Grams)', value: 'Bulk API Powder' },
        { label: '💧 Reconstitution Diluents (BAC Water)', value: 'Reconstitution Diluents' },
        { label: '💉 Injectable Ready (Vials/Pens)', value: 'Injectable Ready' },
        { label: '👃 Nasal Sprays', value: 'Nasal Sprays' },
        { label: '💊 Oral & Sublingual', value: 'Oral & Sublingual' },
        { label: '✨ Topical & Cosmeceutical', value: 'Topical & Cosmeceutical' }
      ] 
    },
    { name: 'casNumber', label: 'CAS Chemical Registry Number', type: 'text', required: false, placeholder: 'e.g. 137525-51-0' },
    { name: 'purityPercentage', label: 'Purity Percentage (HPLC %)', type: 'number', required: false, placeholder: '99.4' },
    { name: 'basePrice', label: 'Base Master/Cost Price ($)', type: 'number', required: true, placeholder: '65.00' },
    { name: 'currency', label: 'Currency', type: 'select', required: true, options: [{label: 'USD', value: 'USD'}, {label: 'EUR', value: 'EUR'}] },
    { name: 'stock', label: 'Initial Inventory Stock', type: 'number', required: false, placeholder: '100' },
    { name: 'manufacturer', label: 'Compounding Laboratory / Supplier', type: 'text', required: false, placeholder: 'Fagron Compounding' },
    { name: 'diluentRecommended', label: 'Recommended Reconstitution Diluent', type: 'text', required: false, placeholder: 'Bacteriostatic Water (0.9% Benzyl Alcohol)' },
    { name: 'description', label: 'Scientific & Therapeutic Description', type: 'textarea', required: false, placeholder: 'High-purity lyophilized peptide API...' }
  ];

  const handleExtractAI = async () => {
    if (!aiText.trim()) return;
    setIsExtracting(true);
    try {
      // Simulate AI extraction
      const priceMatch = aiText.match(/\$?(\d+(\.\d{2})?)/);
      const skuMatch = aiText.match(/\b[A-Z0-9]+-[A-Z0-9-]+\b/);
      const casMatch = aiText.match(/\b\d{2,7}-\d{2}-\d\b/);
      const purityMatch = aiText.match(/(\d{2}(\.\d+)?)\s*%/);
      
      const extracted = {};
      if (priceMatch) extracted.basePrice = priceMatch[1];
      if (skuMatch) extracted.sku = skuMatch[0];
      if (casMatch) extracted.casNumber = casMatch[0];
      if (purityMatch) extracted.purityPercentage = purityMatch[1];
      
      const lowerText = aiText.toLowerCase();
      if (lowerText.includes('lyophilized') || lowerText.includes('api') || lowerText.includes('bulk')) {
        extracted.type = 'raw_material';
        extracted.subcategory = 'Lyophilized Peptide APIs';
      }

      const matchedCategory = CANONICAL_CATEGORIES.find(c => 
        lowerText.includes(c.value) || lowerText.includes(c.label.toLowerCase())
      );
      if (matchedCategory) extracted.categoryId = matchedCategory.value;

      const lines = aiText.split('\n');
      if (lines.length > 0 && lines[0].length < 60) {
        extracted.name = lines[0].trim();
      }

      setInitialData(prev => ({ ...prev, ...extracted }));
      toast.success("AI Extracted fields and chemical specs successfully.");
      setAiText('');
    } catch (e) {
      toast.error("Failed to extract data via AI.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSave = async (data) => {
    try {
      const resolvedType = data.type || data.productType || 'finished_product';
      const resolvedCatId = data.categoryId || data.category || 'peptide';
      const baseCost = Number(data.basePrice || 75.00);
      const currency = data.currency || 'USD';

      const productData = {
        name: data.name,
        displayName: data.name,
        canonicalName: data.name.replace(/\s*(lyophilized|api|vial|5mg|10mg)\s*/gi, '').trim() || data.name,
        sku: data.sku,
        status: 'active',
        type: resolvedType,
        productType: resolvedType,
        categoryId: resolvedCatId,
        category: resolvedCatId,
        subcategory: data.subcategory || 'Lyophilized Peptide APIs',
        description: data.description || '',
        isActive: true,
        isProfessional: true,
        requiresPrescription: true,
        requiresColdChain: true,
        molecular: {
          casNumber: data.casNumber || '',
          sequence: '',
          molecularFormula: '',
        },
        apiSpecs: {
          purityPercentage: Number(data.purityPercentage || 99.2),
          grade: 'pharma_compounding',
          counterIon: 'acetate',
          storageConditionLyophilized: '-20°C',
          storageConditionReconstituted: '2°C to 8°C',
          reconstitutionGuide: {
            diluentRecommended: data.diluentRecommended || 'Bacteriostatic Water USP',
            volumeRecommendedMl: 2.0
          }
        },
        variants: [
          {
            id: `var_${Date.now()}`,
            name: data.name,
            dosage: '5 mg',
            presentation: 'Lyophilized Vial',
            route: 'injectable_vial',
            type: resolvedType,
            supplier: data.manufacturer || 'Fagron Compounding',
            supplierName: data.manufacturer || 'Fagron Compounding Pharmacy',
            stock: {
              available: true,
              quantity: Number(data.stock || 100),
            },
            pricing: {
              retail:    { perUnit: baseCost * 1.8, kit: baseCost * 1.8 * 10, currency },
              master:    { perUnit: baseCost,       kit: baseCost * 10,       currency },
              wholesale: { perUnit: baseCost * 0.9, kit: baseCost * 0.9 * 10, currency },
              clinic:    { perUnit: baseCost * 1.2, kit: baseCost * 1.2 * 10, currency },
            },
            isDefault: true,
            isActive: true,
          }
        ],
        tags: [],
        goals: [],
        mechanisms: [],
      };
      
      const result = await createProduct(productData, { strict: false });
      const createdProduct = { id: result.id, ...result.data };
      toast.success(`Product ${data.name} created successfully.`);
      if (onCreated) onCreated(createdProduct);
      onClose();
    } catch (e) {
      console.error(e);
      throw new Error('Failed to create product');
    }
  };

  const customHeader = (
    <div style={{ backgroundColor: 'var(--primary-light)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <Sparkles size={16} color="var(--primary)" />
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>AI Auto-fill</span>
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
        Paste the supplier's product specs. We will extract the Name, SKU, Price, and Category.
      </p>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input 
          type="text" 
          value={aiText}
          onChange={e => setAiText(e.target.value)}
          placeholder="Paste specs here..." 
          style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '0.85rem' }}
          disabled={isExtracting}
        />
        <button 
          type="button"
          onClick={handleExtractAI}
          disabled={isExtracting || !aiText.trim()}
          style={{ 
            backgroundColor: 'var(--primary)', color: '#fff', border: 'none', 
            borderRadius: '4px', padding: '0 1rem', cursor: aiText.trim() ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem'
          }}
        >
          {isExtracting ? <Loader2 size={14} className="spin" /> : 'Extract'}
        </button>
      </div>
    </div>
  );

  return (
    <UniversalFormDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Product"
      schema={schema}
      initialData={initialData}
      onSubmit={handleSave}
      submitLabel="Create Product"
      customHeader={customHeader}
    />
  );
}