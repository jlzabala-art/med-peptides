'use client';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { resolveVariantPrice } from '@/utils/resolvePrice';
import { filterProductVariantsStrictly, isVariantMatchingFilter } from '@/utils/strictFilterEngine';

export const DOC_TYPES = [
  { value: 'pricelist', label: 'Price List', icon: '📋', desc: 'Commercial pricing list by tier and currency.' },
  { value: 'catalog', label: 'Product Catalog', icon: '📚', desc: 'Product portfolio with specs, formats & descriptions.' },
  { value: 'quotation', label: 'Quotation', icon: '🧾', desc: 'Client-specific formal quote with validity & reference ID.' },
];

export const PRICE_SOURCES = [
  { value: 'cost', label: 'Supplier Cost (Master)', short: 'Master Cost' },
  { value: 'wholeseller', label: 'Wholesale Price', short: 'Wholesale' },
  { value: 'clinic', label: 'Clinic Price', short: 'Clinic' },
  { value: 'retail', label: 'Retail Price (Web Public)', short: 'Retail' },
];

export const CURRENCIES = ['USD', 'EUR', 'MXN', 'AED', 'GBP'];

export const PRODUCT_TYPE_FILTER_OPTIONS = [
  { value: 'all', label: 'All Types & Presentations (Complete Portfolio)' },
  { value: 'finished_product', label: 'Finished Formulations Only (Vials, Pens, Sprays)' },
  { value: 'raw_material', label: 'Bulk API Raw Materials Only (Compounding Powder)' },
  { value: 'diagnostic', label: 'Diagnostic Kits & Panels Only' },
  { value: 'service', label: 'Clinical Services Only' },
];

export const GROUP_OPTIONS = [
  { value: 'category', label: 'By Category' },
  { value: 'product', label: 'By Product' },
  { value: 'supplier', label: 'By Supplier' },
  { value: 'none', label: 'Flat List (No Grouping)' },
];

export const SORT_OPTIONS = [
  { value: 'name', label: 'Product Name (A-Z)' },
  { value: 'dosage', label: 'Numeric Dosage (Low to High)' },
  { value: 'price_asc', label: 'Price (Low to High)' },
  { value: 'price_desc', label: 'Price (High to Low)' },
  { value: 'supplier', label: 'Supplier Name' },
];

export const WATERMARK_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'confidential', label: 'CONFIDENTIAL' },
  { value: 'draft', label: 'DRAFT' },
  { value: 'internal', label: 'INTERNAL USE ONLY' },
  { value: 'sample', label: 'SAMPLE' },
];

export const INCOTERMS = [
  { value: 'EXW', label: 'EXW · Ex-Works', short: 'EXW', desc: 'Freight, duties & taxes not included (Default)' },
  { value: 'FOB', label: 'FOB · Free on Board', short: 'FOB', desc: 'Loaded onto transport, export cleared' },
  { value: 'DAP', label: 'DAP · Delivered at Place', short: 'DAP', desc: 'Delivered to destination, import duties unpaid' },
  { value: 'CIF', label: 'CIF · Cost, Insurance & Freight', short: 'CIF', desc: 'Main transit freight & insurance included' },
  { value: 'NONE', label: 'Standard (No Incoterm)', short: '', desc: 'Standard catalog pricing without trade terms' },
];

export const PRESETS = [
  {
    id: 'b2b_wholesale',
    name: 'B2B Wholesale EXW',
    icon: '🏢',
    desc: 'Wholesale tier, EXW terms, in-stock verified',
    badge: 'Popular B2B',
  },
  {
    id: 'clinic_catalog',
    name: 'Clinic Medical Catalog',
    icon: '🏥',
    desc: 'Clinic pricing, cover page, reconstitution specs',
    badge: 'Doctors & Clinics',
  },
  {
    id: 'best_sourcing_clean',
    name: 'Best Sourcing (Lowest Cost)',
    icon: '🎯',
    desc: 'Consolidated: lowest supplier price per dosage',
    badge: 'Competitive',
  },
  {
    id: 'master_cost_audit',
    name: 'Internal Cost Audit',
    icon: '🔍',
    desc: 'Master supplier costs, all suppliers, flat list',
    badge: 'Operations',
  },
];

// Helper calculations
export function calcMarkup(cost, sell) {
  if (cost == null || sell == null || cost === 0 || isNaN(cost) || isNaN(sell)) return null;
  return ((sell - cost) / cost) * 100;
}

export function calcMargin(cost, sell) {
  if (cost == null || sell == null || sell === 0 || isNaN(cost) || isNaN(sell)) return null;
  return ((sell - cost) / sell) * 100;
}

export function applyMarkupToCost(cost, markupPct) {
  if (cost == null || isNaN(cost)) return null;
  return Number((cost * (1 + markupPct / 100)).toFixed(2));
}

export function applyMarginToCost(cost, marginPct) {
  if (cost == null || isNaN(cost) || marginPct >= 100) return null;
  return Number((cost / (1 - marginPct / 100)).toFixed(2));
}

export function useDocumentGeneratorState(selectedProducts = [], initialConfig = null) {
  // Document Type
  const [docType, setDocType] = useState(initialConfig?.docType || 'pricelist');

  // Pricing settings
  const [includePrices, setIncludePrices] = useState(initialConfig?.includePrices ?? true);
  const [priceSource, setPriceSource] = useState(initialConfig?.priceSource || 'cost');
  const [currency, setCurrency] = useState(initialConfig?.currency || 'USD');
  const [priceDisplayMode, setPriceDisplayMode] = useState(initialConfig?.priceDisplayMode || 'unit'); // 'unit' | 'kit' | 'both'
  const [kitSize, setKitSize] = useState(initialConfig?.kitSize ?? 10);
  const [isExWorks, setIsExWorks] = useState(initialConfig?.isExWorks ?? false);
  const [incoterm, setIncoterm] = useState(initialConfig?.incoterm || 'EXW');
  const [bestSourcingOnly, setBestSourcingOnly] = useState(initialConfig?.bestSourcingOnly ?? false);
  
  // Price adjustment modes: 'none' | 'markup' | 'margin' | 'custom'
  const [adjustmentType, setAdjustmentType] = useState('none');
  const [adjustmentValue, setAdjustmentValue] = useState(40); // e.g. 40% markup or 30% margin
  const [adjustmentScope, setAdjustmentScope] = useState('unpriced'); // 'all' | 'unpriced'
  const [overrides, setOverrides] = useState(initialConfig?.priceOverrides || {});

  // Content & Columns
  const [columns, setColumns] = useState({
    product: true,
    dosage: true,
    format: true,
    supplier: true,
    price: true,
    kitPrice: false,
    purity: false,
    reconstitution: false,
    gauge: true,
    packSize: true,
    sampleType: true,
    biomarkers: false,
    description: false,
  });

  // Presentation options
  const [groupBy, setGroupBy] = useState('category');
  const [sortBy, setSortBy] = useState('name');
  const [pdfLanguage, setPdfLanguage] = useState('en');
  const [watermark, setWatermark] = useState('none');
  const [coverPage, setCoverPage] = useState(false);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [includeBibliography, setIncludeBibliography] = useState(false);
  const [supplierMasking, setSupplierMasking] = useState('real'); // 'real' | 'anonymous'
  const [showPricePerMg, setShowPricePerMg] = useState(true);
  const [showWarehouse, setShowWarehouse] = useState(true);
  // Product type scope filter for hybrid products (Fase 2)
  const [productTypeFilter, setProductTypeFilter] = useState('all'); // 'all' | 'finished_product' | 'raw_material' | 'diagnostic' | 'service'
  const [supplierFilter, setSupplierFilter] = useState(initialConfig?.supplierFilter || initialConfig?.supplierId || null);
  const [catalogueFilter, setCatalogueFilter] = useState(initialConfig?.catalogueFilter || initialConfig?.catalogBrand || null);

  // Sync state if initialConfig is passed or updated
  useEffect(() => {
    if (!initialConfig) return;
    if (initialConfig.supplierFilter || initialConfig.supplierId) setSupplierFilter(initialConfig.supplierFilter || initialConfig.supplierId);
    if (initialConfig.catalogueFilter || initialConfig.catalogBrand) setCatalogueFilter(initialConfig.catalogueFilter || initialConfig.catalogBrand);
    if (initialConfig.docType) setDocType(initialConfig.docType);
    if (initialConfig.includePrices !== undefined) setIncludePrices(initialConfig.includePrices);
    if (initialConfig.priceSource) setPriceSource(initialConfig.priceSource);
    if (initialConfig.currency) setCurrency(initialConfig.currency);
    if (initialConfig.priceDisplayMode) setPriceDisplayMode(initialConfig.priceDisplayMode);
    if (initialConfig.kitSize !== undefined) setKitSize(initialConfig.kitSize);
    if (initialConfig.isExWorks !== undefined) setIsExWorks(initialConfig.isExWorks);
    if (initialConfig.incoterm) setIncoterm(initialConfig.incoterm);
    if (initialConfig.bestSourcingOnly !== undefined) setBestSourcingOnly(initialConfig.bestSourcingOnly);
    if (initialConfig.priceOverrides) setOverrides(initialConfig.priceOverrides);
    if (initialConfig.groupBy) setGroupBy(initialConfig.groupBy);
    if (initialConfig.sortBy) setSortBy(initialConfig.sortBy);
    if (initialConfig.pdfLanguage) setPdfLanguage(initialConfig.pdfLanguage);
    if (initialConfig.watermark) setWatermark(initialConfig.watermark);
    if (initialConfig.coverPage !== undefined) setCoverPage(initialConfig.coverPage);
    if (initialConfig.onlyInStock !== undefined) setOnlyInStock(initialConfig.onlyInStock);
    if (initialConfig.includeBibliography !== undefined) setIncludeBibliography(initialConfig.includeBibliography);
    if (initialConfig.supplierMasking) setSupplierMasking(initialConfig.supplierMasking);
    if (initialConfig.columns) setColumns(prev => ({ ...prev, ...initialConfig.columns }));
    if (initialConfig.clientId) setClientId(initialConfig.clientId);
    if (initialConfig.recipientName) setRecipientName(initialConfig.recipientName);
  }, [initialConfig]);

  // Active preset tag
  const [activePreset, setActivePreset] = useState(null);

  // Quick Preset Applicator
  const applyPreset = useCallback((presetId) => {
    setActivePreset(presetId);
    if (presetId === 'b2b_wholesale') {
      setDocType('pricelist');
      setPriceSource('wholeseller');
      setIsExWorks(true);
      setIncoterm('EXW');
      setBestSourcingOnly(false);
      setGroupBy('category');
      setSortBy('name');
      setOnlyInStock(true);
      setCoverPage(false);
      setColumns(prev => ({ ...prev, supplier: true, price: true, kitPrice: true }));
    } else if (presetId === 'clinic_catalog') {
      setDocType('catalog');
      setPriceSource('clinic');
      setIsExWorks(false);
      setIncoterm('NONE');
      setBestSourcingOnly(false);
      setGroupBy('category');
      setSortBy('name');
      setCoverPage(true);
      setColumns(prev => ({ ...prev, purity: true, reconstitution: true, description: true }));
    } else if (presetId === 'best_sourcing_clean') {
      setDocType('pricelist');
      setPriceSource('wholeseller');
      setIsExWorks(true);
      setIncoterm('EXW');
      setBestSourcingOnly(true);
      setGroupBy('category');
      setSortBy('name');
      setOnlyInStock(false);
      setCoverPage(false);
      setColumns(prev => ({ ...prev, supplier: false, price: true, kitPrice: true }));
    } else if (presetId === 'master_cost_audit') {
      setDocType('pricelist');
      setPriceSource('cost');
      setIsExWorks(true);
      setIncoterm('EXW');
      setBestSourcingOnly(false);
      setGroupBy('none');
      setSortBy('supplier');
      setOnlyInStock(false);
      setCoverPage(false);
      setColumns(prev => ({ ...prev, supplier: true, price: true, kitPrice: false }));
    }
  }, []);

  // Client Directory & Target Recipient
  const [clients, setClients] = useState([]);
  const [managers, setManagers] = useState([
    { id: 'desk', name: 'Atlas Commercial Desk', email: 'orders@atlas-solutions.com', role: 'desk' }
  ]);
  const [wholesellers, setWholesellers] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);

  const [recipientType, setRecipientType] = useState('custom'); // 'wholeseller' | 'clinic' | 'doctor' | 'custom'
  const [recipientId, setRecipientId] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [clientId, setClientId] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [commercialNotes, setCommercialNotes] = useState('');
  const [followUpNotes, setFollowUpNotes] = useState('');

  // Account Manager Assignment (Dynamic for orders & CRM tracking)
  const [accountManagerId, setAccountManagerId] = useState('desk');
  const [accountManagerName, setAccountManagerName] = useState('Atlas Commercial Desk');
  const [accountManagerEmail, setAccountManagerEmail] = useState('orders@atlas-solutions.com');
  const [accountManagerPhone, setAccountManagerPhone] = useState('');

  // Auto-fetch clients, clinics, and account managers directory
  useEffect(() => {
    let isMounted = true;
    async function loadDirectory() {
      try {
        setClientsLoading(true);
        const res = await fetch('/api/catalog/clients');
        if (res.ok && isMounted) {
          const data = await res.json();
          setClients(data.items || []);
          if (data.managers && data.managers.length > 0) setManagers(data.managers);
          if (data.wholesellers) setWholesellers(data.wholesellers);
          if (data.clinics) setClinics(data.clinics);
          if (data.doctors) setDoctors(data.doctors);
        }
        if (isMounted) setClientsLoading(false);
      } catch {
        if (isMounted) setClientsLoading(false);
      }
    }
    loadDirectory();
    return () => { isMounted = false; };
  }, []);

  // Quick Account Manager Selector
  const selectAccountManager = useCallback((mgrId) => {
    setAccountManagerId(mgrId);
    if (mgrId === 'custom') {
      setAccountManagerName('');
      setAccountManagerEmail('');
      return;
    }
    const found = managers.find(m => m.id === mgrId);
    if (found) {
      setAccountManagerName(found.name);
      setAccountManagerEmail(found.email);
    }
  }, [managers]);

  // Quick Target Recipient Selector (Wholesaler / Clinic / Doctor)
  const selectRecipient = useCallback((selectedId, type) => {
    setRecipientId(selectedId);
    setClientId(selectedId);
    if (!selectedId || selectedId === 'custom') {
      setRecipientType('custom');
      return;
    }
    const allEntities = [...wholesellers, ...clinics, ...doctors, ...clients];
    const found = allEntities.find(e => e.id === selectedId);
    if (found) {
      setRecipientName(found.name);
      setRecipientEmail(found.email || '');
      setRecipientType(type || found.type || 'custom');
      
      // Auto-tune price tier based on client type
      if ((type === 'wholeseller' || found.type === 'wholeseller') && priceSource !== 'wholeseller') {
        setPriceSource('wholeseller');
        setIsExWorks(true);
        setIncoterm('EXW');
      } else if ((type === 'clinic' || found.type === 'clinic') && priceSource !== 'clinic') {
        setPriceSource('clinic');
      }
    }
  }, [wholesellers, clinics, doctors, clients, priceSource]);

  // Helper: normalize variant type to canonical 5-type set
  const normalizeVariantType = (v, product) => {
    const raw = v.type || v.productType || product?.primaryType || product?.productType || 'finished_product';
    return raw === 'api_raw_material' ? 'raw_material' : raw;
  };

  // Canonical Selection Calculation — respects productTypeFilter and supplierFilter for strict isolation
  const canonicalMetrics = useMemo(() => {
    let pCount = 0;
    let vCount = 0;
    const supplierSet = new Set();
    const categoriesSet = new Set();

    selectedProducts.forEach(product => {
      const items = filterProductVariantsStrictly(product, {
        supplierFilter,
        productTypeFilter,
        onlyInStock
      });
      if (items.length === 0) return;
      pCount++;
      if (product.category) categoriesSet.add(product.category.toLowerCase());
      vCount += items.length;
      items.forEach(v => {
        const s = v.supplierName || v.supplier || product.supplier;
        if (s) supplierSet.add(s);
      });
    });

    return {
      productCount: pCount,
      variantCount: vCount,
      supplierCount: supplierSet.size,
      categories: Array.from(categoriesSet),
      summaryLabel: `${pCount} product${pCount !== 1 ? 's' : ''} · ${vCount} variant${vCount !== 1 ? 's' : ''}${supplierSet.size > 0 ? ` · ${supplierSet.size} supplier${supplierSet.size !== 1 ? 's' : ''}` : ''}`,
    };
  }, [selectedProducts, productTypeFilter, supplierFilter, onlyInStock]);

  // Derived Product IDs and Variant IDs for backend query
  const { productIds, variantIds } = useMemo(() => {
    const pIds = new Set();
    const vIds = new Set();
    selectedProducts.forEach(g => {
      const vars = filterProductVariantsStrictly(g, { supplierFilter, productTypeFilter, onlyInStock });
      if (vars.length > 0) {
        if (g.id) pIds.add(g.id);
        if (g.canonicalId) pIds.add(g.canonicalId);
        if (g.productId) pIds.add(g.productId);
      }
      vars.forEach(v => {
        if (v.productId) pIds.add(v.productId);
        if (v.id) vIds.add(v.id);
      });
    });
    return { productIds: Array.from(pIds), variantIds: Array.from(vIds) };
  }, [selectedProducts, supplierFilter, productTypeFilter, onlyInStock]);

  // Margin rows computed with live pricing resolver & active overrides
  const variantRows = useMemo(() => {
    const rows = [];
    selectedProducts.forEach(product => {
      const items = filterProductVariantsStrictly(product, {
        supplierFilter,
        productTypeFilter,
        onlyInStock
      });
      items.forEach(variant => {
        const costRes = resolveVariantPrice(variant, { tier: 'master' });
        const sellRes = resolveVariantPrice(variant, { tier: priceSource === 'cost' ? 'retail' : priceSource });
        const cost = costRes?.perUnit ?? null;
        
        let sell = null;
        if (overrides[variant.id] != null) {
          sell = overrides[variant.id];
        } else if (adjustmentType === 'markup' && cost != null) {
          const isUnpriced = sellRes?.perUnit == null || Math.abs((sellRes?.perUnit ?? 0) - cost) < 0.001;
          if (adjustmentScope === 'all' || isUnpriced) {
            sell = applyMarkupToCost(cost, adjustmentValue);
          } else {
            sell = sellRes?.perUnit ?? null;
          }
        } else if (adjustmentType === 'margin' && cost != null) {
          const isUnpriced = sellRes?.perUnit == null || Math.abs((sellRes?.perUnit ?? 0) - cost) < 0.001;
          if (adjustmentScope === 'all' || isUnpriced) {
            sell = applyMarginToCost(cost, adjustmentValue);
          } else {
            sell = sellRes?.perUnit ?? null;
          }
        } else {
          sell = sellRes?.perUnit ?? null;
        }

        rows.push({
          id: variant.id || product.id,
          productId: product.id || variant.productId,
          productName: product.name || product.canonicalName || variant.name || 'Unknown',
          dosage: variant.dosage || variant.dose || product.dosage || '-',
          format: variant.presentationName || variant.presentation || 'Vial',
          supplier: variant.supplierName || variant.supplier || product.supplier || 'Unassigned',
          cost,
          sell,
          isOverridden: overrides[variant.id] != null,
          markup: calcMarkup(cost, sell),
          margin: calcMargin(cost, sell),
        });
      });
    });
    return rows;
  }, [selectedProducts, priceSource, overrides, adjustmentType, adjustmentValue, adjustmentScope]);

  // Aggregate Averages
  const pricingSummary = useMemo(() => {
    const pricedRows = variantRows.filter(r => r.sell != null && r.sell > 0);
    const unpricedRows = variantRows.filter(r => r.sell == null || r.sell === 0);
    const validMarkups = variantRows.filter(r => r.markup != null && r.markup !== Infinity);
    const validMargins = variantRows.filter(r => r.margin != null);

    const avgMarkup = validMarkups.length > 0
      ? validMarkups.reduce((acc, r) => acc + r.markup, 0) / validMarkups.length
      : null;
    const avgMargin = validMargins.length > 0
      ? validMargins.reduce((acc, r) => acc + r.margin, 0) / validMargins.length
      : null;

    return {
      totalCount: variantRows.length,
      pricedCount: pricedRows.length,
      unpricedCount: unpricedRows.length,
      avgMarkup,
      avgMargin,
      hasOverrides: Object.keys(overrides).length > 0,
    };
  }, [variantRows, overrides]);

  // Actions
  const setIndividualOverride = useCallback((variantId, price) => {
    setOverrides(prev => ({
      ...prev,
      [variantId]: price != null ? Number(Number(price).toFixed(2)) : null,
    }));
  }, []);

  const clearAllOverrides = useCallback(() => {
    setOverrides({});
    setAdjustmentType('none');
  }, []);

  const toggleColumn = useCallback((colKey) => {
    setColumns(prev => ({ ...prev, [colKey]: !prev[colKey] }));
  }, []);

  return {
    // Selection metrics
    canonicalMetrics,
    productIds,
    variantIds,
    variantRows,
    pricingSummary,

    // Document Type
    docType,
    setDocType,

    // Pricing
    includePrices,
    setIncludePrices,
    priceSource,
    setPriceSource,
    currency,
    setCurrency,
    priceDisplayMode,
    setPriceDisplayMode,
    kitSize,
    setKitSize,
    isExWorks,
    setIsExWorks,
    incoterm,
    setIncoterm,
    bestSourcingOnly,
    setBestSourcingOnly,
    activePreset,
    applyPreset,
    adjustmentType,
    setAdjustmentType,
    adjustmentValue,
    setAdjustmentValue,
    adjustmentScope,
    setAdjustmentScope,
    overrides,
    setIndividualOverride,
    clearAllOverrides,

    // Content & Columns
    columns,
    setColumns,
    toggleColumn,

    // Presentation
    groupBy,
    setGroupBy,
    sortBy,
    setSortBy,
    pdfLanguage,
    setPdfLanguage,
    watermark,
    setWatermark,
    coverPage,
    setCoverPage,
    onlyInStock,
    setOnlyInStock,
    includeBibliography,
    setIncludeBibliography,
    supplierMasking,
    setSupplierMasking,
    showPricePerMg,
    setShowPricePerMg,
    showWarehouse,
    setShowWarehouse,
    // Product type & Supplier scope filter
    productTypeFilter,
    setProductTypeFilter,
    supplierFilter,
    setSupplierFilter,
    catalogueFilter,
    setCatalogueFilter,

    // Directory & Recipient
    clients,
    managers,
    wholesellers,
    clinics,
    doctors,
    clientsLoading,
    recipientType,
    setRecipientType,
    recipientId,
    setRecipientId,
    recipientName,
    setRecipientName,
    recipientEmail,
    setRecipientEmail,
    selectRecipient,
    clientId,
    setClientId,
    validUntil,
    setValidUntil,
    commercialNotes,
    setCommercialNotes,
    followUpNotes,
    setFollowUpNotes,

    // Account Manager
    accountManagerId,
    setAccountManagerId,
    accountManagerName,
    setAccountManagerName,
    accountManagerEmail,
    setAccountManagerEmail,
    accountManagerPhone,
    setAccountManagerPhone,
    selectAccountManager,
  };
}
