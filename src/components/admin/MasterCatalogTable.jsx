import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter, usePathname } from 'next/navigation';
import DataModule from '../ui/DataModule';
import DataTable from '../ui/DataTable';
import MobileActionSheet from '../ui/MobileActionSheet';
import notifier from '../../services/NotificationService';
import { logger } from '../../utils/logger';
import { useAuth } from '../../context/AuthContext';
import { useDrawer } from '../../context/DrawerContext';
import { useCart } from '../../context/CartProvider';
import { useAppSettings } from '../../hooks/useAppSettings';
import { useCatalogSummary } from '../../hooks/admin/useCatalogSummary';
import { useCategories } from '../../hooks/admin/useCategories';
import { useCatalogFacets } from '../../hooks/admin/useCatalogFacets';
import { useSupplierData } from './suppliers/useSupplierData';
import { useProtocols } from '../../hooks/admin/useProtocols';
import { calculateProductCompleteness } from '../../utils/calculateProductCompleteness';
import { inferProductSubcategory, getProductAvailableTypes } from '../../utils/productNormalizer';
import { CLINICAL_GOALS } from '../../config/goals';

// ── Modular Catalog Components & Hooks ─────────────────────────────────────────
import { useCatalogUrlFilters } from './catalog/hooks/useCatalogUrlFilters';
import { useCatalogItemMutations } from './catalog/hooks/useCatalogItemMutations';
import CatalogKpiHeader from './catalog/components/CatalogKpiHeader';
import { useMasterCatalogColumns } from './catalog/columns/useMasterCatalogColumns';
import CatalogVariantExpander from './catalog/components/CatalogVariantExpander';
import dynamic from 'next/dynamic';

const CatalogModalsContainer = dynamic(() => import('./catalog/drawers/CatalogModalsContainer'), { ssr: false });
const GenomicsMatrixView = dynamic(() => import('./catalog/GenomicsMatrixView'), { ssr: false });
const GenomicsPriorityEditorModal = dynamic(() => import('./catalog/GenomicsPriorityEditorModal'), { ssr: false });

// Icons
import {
  Package,
  DownloadCloud,
  RefreshCw,
  Sparkles,
  Layers,
  Edit3,
  Eye,
  Archive,
  Briefcase,
  FileText,
  Send,
  Dna,
  X
} from 'lucide-react';

export default function MasterCatalogTable({ initialProducts, globalMetrics, headerProps = {}, headerActions, mobileHeaderActions }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { openDrawer } = useDrawer();
  const { updateCart } = useCart();
  const { settings } = useAppSettings();

  const { suppliers } = useSupplierData();
  const { allOptions: categoryOptions, getCategoryLabel } = useCategories();
  const { formats: facetFormats, suppliers: facetSuppliers, productTypes: facetProductTypes, categories: facetCategories, totals: facetTotals } = useCatalogFacets();
  const { protocols } = useProtocols();

  const supplierIdToName = useMemo(() => {
    const map = {};
    (suppliers || []).forEach(s => {
      const name = s.companyName || s.name || s.id;
      map[s.id] = name;
      map[s.id.replace(/^supplier-/, '')] = name;
    });
    (facetSuppliers || []).forEach(s => {
      if (s.id && s.name) {
        map[s.id] = s.name;
        map[s.id.replace(/^supplier-/, '')] = s.name;
      }
    });
    const defaults = {
      'supplier-centrico': 'Centrico Compounding Pharmacy',
      'centrico': 'Centrico Compounding Pharmacy',
      'supplier-magenta': 'Magenta Medical',
      'magenta': 'Magenta Medical',
      'supplier-lotusland': 'Lotusland',
      'lotusland': 'Lotusland',
      'supplier-nplabs': 'NP Labs',
      'nplabs': 'NP Labs',
      'supplier-fagron-iberia': 'Fagron Iberia',
      'fagron-iberia': 'Fagron Iberia',
      'supplier-bioniq': 'Bioniq',
      'bioniq': 'Bioniq',
      'supplier-pod-poland': 'POD Poland',
      'pod-poland': 'POD Poland',
      'supplier-vallida': 'Vallida Labs',
      'vallida': 'Vallida Labs',
      'supplier-europeptides': 'Europeptides',
      'europeptides': 'Europeptides',
      'supplier-fusion': 'Fusion Peptides',
      'fusion': 'Fusion Peptides',
      'supplier-bloodo': 'Bloodo UAB',
      'bloodo': 'Bloodo UAB',
      'supplier-eternadx': 'ETERNA Diagnostics S.L.',
      'eternadx': 'ETERNA Diagnostics S.L.'
    };
    return { ...defaults, ...map };
  }, [suppliers, facetSuppliers]);

  const resolveSupplierName = useCallback((v) => {
    if (!v) return 'Unknown Supplier';
    if (typeof v === 'string') {
      return supplierIdToName[v] || supplierIdToName[v.replace(/^supplier-/, '')] || v;
    }
    const sId = v.supplierId || v.supplier || '';
    if (v.supplierName && v.supplierName !== 'undefined') return v.supplierName;
    return supplierIdToName[sId] || supplierIdToName[sId.replace(/^supplier-/, '')] || (sId.startsWith('supplier-') ? sId.replace(/^supplier-/, '').charAt(0).toUpperCase() + sId.slice(10) : (sId || 'Unknown Supplier'));
  }, [supplierIdToName]);

  // 1. URL & Filter State Hook
  const {
    filterCategory,
    filterSubcategory,
    filterGoals,
    filterFormatId,
    filterPresentation,
    filterSupplier,
    filterProductType,
    filterTags,
    filterTagMode,
    filterPriority,
    filterStatus,
    filterAvailability,
    filterQuality,
    filterTimeframe,
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    updateUrlParam,
    setMultiParam,
    clearAllFilters,
    filterChips,
    hasAnyFilter
  } = useCatalogUrlFilters({ supplierIdToName });

  // Drawers & Modals States
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeDrawer, setActiveDrawer] = useState(null); // 'offers', 'pricing', 'competitors', 'edit', 'quick-view'
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [isPriceListModalOpen, setIsPriceListModalOpen] = useState(false);
  const [isScanPriceListOpen, setIsScanPriceListOpen] = useState(false);
  const [scanPriceListInitialData, setScanPriceListInitialData] = useState(null);
  const [isSavedPdfsOpen, setIsSavedPdfsOpen] = useState(false);
  const [cloneConfig, setCloneConfig] = useState(null);
  const [pdfCustomProduct, setPdfCustomProduct] = useState(null);
  const [commercialChannel, setCommercialChannel] = useState('cost');
  const [displayCurrency, setDisplayCurrency] = useState('USD');
  const [priceView, setPriceView] = useState('unit');
  const [showGoalsCoverage, setShowGoalsCoverage] = useState(false);
  const [enrichmentProduct, setEnrichmentProduct] = useState(null);
  const [transactionsProduct, setTransactionsProduct] = useState(null);
  const [mobileActionProduct, setMobileActionProduct] = useState(null);
  const [optimisticOverrides, setOptimisticOverrides] = useState({});
  const [kpiScope, setKpiScope] = useState('filtered');
  const [catalogViewMode, setCatalogViewMode] = useState('table'); // 'table' | 'genomics_matrix'
  const [editingGenomic, setEditingGenomic] = useState({ isOpen: false, product: null, programSlug: null });

  const [recentImportFilter, setRecentImportFilter] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlFilter = new URLSearchParams(window.location.search).get('filter');
      if (urlFilter === 'recent_import') {
        try {
          const stored = localStorage.getItem('atlas_recent_imported') || localStorage.getItem('regenpept_recent_imported');
          if (stored) return JSON.parse(stored);
        } catch (e) {
          logger.warn('[MasterCatalogTable] Failed to parse recent import cache', { error: e.message });
        }
      }
    }
    return null;
  });

  // 2. Fetch Catalog Data from React Query
  const { data, kpis, goalFacets, categoryFacets, presentationFacets, supplierFacets, loading, refresh, fetchNextPage, hasNextPage, isFetchingNextPage } = useCatalogSummary({ 
    limit: 50, 
    q: debouncedSearchTerm, 
    timeframe: filterTimeframe,
    category: filterCategory,
    goals: filterGoals,
    formatId: filterFormatId,
    presentation: filterPresentation,
    supplier: filterSupplier,
    productType: filterProductType,
    tag: filterTags,
    tagMode: filterTagMode,
    priority: filterPriority,
    status: filterStatus,
    availability: filterAvailability,
    includeInactive: true,
    initialData: (Array.isArray(initialProducts) && initialProducts.length > 0) ? { items: initialProducts, kpis: globalMetrics } : undefined
  });

  // 3. Item Mutations Hook
  const {
    handleParentFieldUpdate,
    handleVariantFieldUpdate,
    handleAddVariant,
    handleArchiveProduct
  } = useCatalogItemMutations({ refresh, user });

  // Listen for PDF Library and external events
  useEffect(() => {
    const handleOpenPdfLibrary = () => setIsSavedPdfsOpen(true);
    const handleNewProduct = () => { setSelectedProduct(null); setActiveDrawer('edit'); };
    window.addEventListener('open-pdf-library', handleOpenPdfLibrary);
    window.addEventListener('catalog-new-product', handleNewProduct);
    return () => {
      window.removeEventListener('open-pdf-library', handleOpenPdfLibrary);
      window.removeEventListener('catalog-new-product', handleNewProduct);
    };
  }, []);

  const handleNavigation = useCallback((url) => {
    setActiveDrawer(null);
    setSelectedProduct(null);
    router.push(url);
  }, [router]);

  // Derived filtered rows with shallow meta augmentation
  const dataWithMeta = useMemo(() => {
    let rows = data.map(row => {
      const override = optimisticOverrides[row.id] || optimisticOverrides[row.canonicalName] || optimisticOverrides[row.slug];
      const effectiveRow = override ? { ...row, ...override } : row;
      return {
        ...effectiveRow,
        __catalogMeta: { supplierIdToName, getCategoryLabel },
      };
    });

    if (filterCategory.length > 0) {
      rows = rows.filter(row => {
        const cat = (row.category || row.categoryId || '').toLowerCase();
        return filterCategory.some(fc => {
          const fcLow = fc.toLowerCase();
          return cat === fcLow || cat === fcLow.replace(/s$/, '') || cat + 's' === fcLow;
        });
      });
    }

    if (filterProductType.length > 0) {
      rows = rows.filter(row => {
        const rowTypes = getProductAvailableTypes(row);
        const normalizedFilter = filterProductType.map(t => t === 'api_raw_material' ? 'raw_material' : t);
        
        if (normalizedFilter.includes('multi_type') || normalizedFilter.includes('dual')) {
          if (rowTypes.length >= 2 || row.isHybrid || row.productType === 'dual') {
            return true;
          }
        }

        return rowTypes.some(t => normalizedFilter.includes(t));
      });
    }

    if (filterTags.length > 0) {
      rows = rows.filter(row => {
        const rowTags = (Array.isArray(row.tags) ? row.tags : []).map(t => String(t).toLowerCase());
        const rowPrograms = Array.isArray(row.programs) ? row.programs : [];
        const rowProgSlugs = rowPrograms.map(p => String(p.slug || p.id || '').toLowerCase());
        const rowProgNames = rowPrograms.map(p => String(p.name || '').toLowerCase());

        const checkMatch = (tp) => {
          const cleanTp = String(tp).toLowerCase();
          return rowTags.includes(cleanTp) || 
                 rowProgSlugs.includes(cleanTp) || 
                 rowProgNames.includes(cleanTp) ||
                 rowTags.some(t => t.includes(cleanTp)) ||
                 rowProgSlugs.some(s => s.includes(cleanTp)) ||
                 rowProgNames.some(n => n.includes(cleanTp));
        };

        return filterTagMode === 'all' 
          ? filterTags.every(checkMatch)
          : filterTags.some(checkMatch);
      });
    }

    if (filterPriority && filterPriority !== 'all') {
      const cleanPri = String(filterPriority).toUpperCase();
      rows = rows.filter(row => {
        const rowPrograms = Array.isArray(row.programs) ? row.programs : [];
        return rowPrograms.some(prog => {
          if (filterTags.length > 0) {
            const progSlug = String(prog.slug || prog.id || '').toLowerCase();
            const progName = String(prog.name || '').toLowerCase();
            const matchesProg = filterTags.some(tp => {
              const cleanTp = String(tp).toLowerCase();
              return progSlug.includes(cleanTp) || progName.includes(cleanTp) || cleanTp.includes(progSlug);
            });
            if (!matchesProg) return false;
          }
          return String(prog.priority || '').toUpperCase() === cleanPri;
        });
      });
    }

    if (filterSubcategory.length > 0) {
      rows = rows.filter(row => filterSubcategory.includes(inferProductSubcategory(row)));
    }

    if (filterSupplier.length > 0) {
      rows = rows.filter(row => {
        const rowSuppliers = [
          row.supplierId,
          row.supplier,
          ...(Array.isArray(row.supplierIds) ? row.supplierIds : []),
          ...(Array.isArray(row.suppliers) ? row.suppliers : []),
          ...(row.variants || []).map(v => v.supplierId || v.supplier)
        ].filter(Boolean).map(s => String(s).toLowerCase().replace(/^supplier-/, ''));

        return filterSupplier.some(s => {
          const cleanS = String(s).toLowerCase().replace(/^supplier-/, '');
          return rowSuppliers.includes(cleanS);
        });
      });
    }

    if (filterGoals.length > 0) {
      rows = rows.filter(row => {
        const rowGoals = row.goalIds || (row.primaryGoal ? [row.primaryGoal] : []);
        return filterGoals.some(g => rowGoals.includes(g));
      });
    }

    if (filterQuality && filterQuality !== 'all') {
      rows = rows.filter(row => {
        const completeness = calculateProductCompleteness(row);
        if (filterQuality === 'optimal') return completeness.score >= 85;
        if (filterQuality === 'partial') return completeness.score >= 50 && completeness.score < 85;
        if (filterQuality === 'needs_data') return completeness.score < 50;
        return true;
      });
    }

    if ((filterTimeframe === 'recent_import' || filterTimeframe === 'latest_session') && recentImportFilter?.ids?.length > 0) {
      rows = rows.filter(row => {
        return recentImportFilter.ids.includes(row.id) || 
               recentImportFilter.ids.includes(row.slug) || 
               (recentImportFilter.supplierId && (row.supplierId === recentImportFilter.supplierId || (row.suppliers || []).includes(recentImportFilter.supplierId)));
      });
    }

    // Deduplicate
    const seenIds = new Set();
    const uniqueRows = [];
    for (const r of rows) {
      const id = r.id || r.slug;
      if (id) {
        if (!seenIds.has(id)) {
          seenIds.add(id);
          uniqueRows.push(r);
        }
      } else {
        uniqueRows.push(r);
      }
    }
    return uniqueRows;
  }, [data, optimisticOverrides, supplierIdToName, getCategoryLabel, filterCategory, filterProductType, filterTags, filterTagMode, filterPriority, filterSubcategory, filterSupplier, filterGoals, filterQuality, filterTimeframe, recentImportFilter]);

  // Server-side KPIs derivation (Rule #22)
  const displayedMetrics = useMemo(() => {
    const globalProducts = facetTotals?.activeProducts || globalMetrics?.totals?.activeProducts || (facetProductTypes || []).reduce((acc, curr) => acc + (curr.count || 0), 0) || 474;
    const globalVariants = facetTotals?.variants || globalMetrics?.totals?.variants || 814;
    const globalApis = (facetTotals?.apiRawMaterials != null) 
      ? facetTotals.apiRawMaterials 
      : ((facetProductTypes?.find(p => p.value === 'api_raw_material')?.count || 0) + (facetProductTypes?.find(p => p.value === 'raw_material')?.count || 0) || 58);
    const globalFinished = facetTotals?.finishedProducts || (globalProducts - globalApis) || (474 - 58);
    const globalCategories = Object.keys(facetCategories || {}).length || 10;

    if (kpiScope === 'global') {
      return {
        total: globalProducts,
        totalProducts: globalProducts,
        totalVariants: globalVariants,
        apis: globalApis,
        apisProducts: globalApis,
        apisVariants: 89,
        finished: globalFinished,
        finishedProducts: globalFinished,
        finishedVariants: globalVariants - 89,
        categories: globalCategories,
        globalTotal: globalProducts,
        globalProducts,
        globalVariants,
        filteredTotal: globalProducts,
        isFiltered: false,
        scopeLabel: 'Entire Database (Unfiltered)'
      };
    }

    const filteredProducts = hasAnyFilter ? dataWithMeta.length : ((kpis?.totalProducts != null && kpis.totalProducts > 0) ? kpis.totalProducts : globalProducts);
    
    let filteredVariants;
    if (hasAnyFilter) {
      filteredVariants = dataWithMeta.reduce((acc, p) => acc + (Array.isArray(p.variants) && p.variants.length > 0 ? p.variants.length : (p.variantsCount || 1)), 0);
    } else {
      filteredVariants = (kpis?.totalVariants != null && kpis.totalVariants > 0) ? kpis.totalVariants : globalVariants;
    }

    const checkIsApi = (p) => {
      const types = getProductAvailableTypes(p);
      return types.includes('raw_material') || types.includes('api_raw_material') || p.primaryType === 'raw_material' || p.primaryType === 'api_raw_material' || p.productType === 'raw_material' || (p.category && String(p.category).toLowerCase().includes('raw'));
    };

    const filteredApisProducts = (kpis?.apisProducts != null && kpis.apisProducts > 0)
      ? kpis.apisProducts 
      : dataWithMeta.filter(checkIsApi).length;

    const filteredFinishedProducts = (kpis?.finishedProducts != null && kpis.finishedProducts > 0)
      ? kpis.finishedProducts 
      : Math.max(0, filteredProducts - filteredApisProducts);

    const filteredApisVariants = (kpis?.apisVariants != null && kpis.apisVariants > 0)
      ? kpis.apisVariants
      : dataWithMeta.filter(checkIsApi).reduce((acc, p) => acc + (p.variants?.length || p.variantsCount || 1), 0);

    const filteredFinishedVariants = (kpis?.finishedVariants != null && kpis.finishedVariants > 0)
      ? kpis.finishedVariants
      : Math.max(0, filteredVariants - filteredApisVariants);

    const filteredCategories = (kpis?.activeCategories != null && kpis.activeCategories > 0)
      ? kpis.activeCategories
      : (Object.keys(categoryFacets || {}).length || new Set(dataWithMeta.map(p => p.category || p.categoryId).filter(Boolean)).size);

    return {
      total: filteredProducts,
      totalProducts: filteredProducts,
      totalVariants: filteredVariants,
      apis: filteredApisProducts,
      apisProducts: filteredApisProducts,
      apisVariants: filteredApisVariants,
      finished: filteredFinishedProducts,
      finishedProducts: filteredFinishedProducts,
      finishedVariants: filteredFinishedVariants,
      categories: filteredCategories,
      globalTotal: globalProducts,
      globalProducts,
      globalVariants,
      filteredTotal: filteredProducts,
      isFiltered: hasAnyFilter,
      scopeLabel: hasAnyFilter ? 'Matching Active Filters' : 'Active Catalog'
    };
  }, [kpiScope, facetTotals, globalMetrics, facetProductTypes, facetCategories, dataWithMeta, kpis, categoryFacets, hasAnyFilter, filterSupplier, facetSuppliers, filterCategory]);

  const handleExportProductPdf = useCallback((params = {}) => {
    if (!selectedProduct) return;
    const activeChan = params.commercialChannel || commercialChannel;
    const resolvedPriceSource = activeChan === 'wholesale' ? 'wholeseller' : (activeChan === 'clinic' ? 'clinic' : (activeChan === 'retail' ? 'retail' : 'cost'));
    const initialConfig = {
      docType: 'pricelist',
      currency: params.currency || displayCurrency || 'USD',
      priceSource: resolvedPriceSource,
      priceDisplayMode: params.priceView === 'kit' ? 'kit' : 'unit',
      groupBy: params.groupBy === 'supplier' ? 'supplier' : 'none',
      bestSourcingOnly: false,
      supplierMasking: false,
    };
    setPdfCustomProduct(selectedProduct);
    setCloneConfig(initialConfig);
    setIsPriceListModalOpen(true);
  }, [selectedProduct, commercialChannel, displayCurrency]);

  const openPrescriptionDrawer = useCallback((row) => {
    if (typeof openDrawer === 'function') {
      openDrawer('rx-builder', 'new', {
        initialItems: [{
          type: 'product',
          id: row.id,
          productId: row.id,
          name: row.canonicalName || row.displayName || '',
          sku: row.variants?.[0]?.sku || '',
          price: row.variants?.[0]?.resolvedPrice?.perUnit || row.variants?.[0]?.price || 0,
          quantity: 1,
          sourceType: 'catalog',
          sourceId: row.id,
        }],
        sourceModule: 'master-catalog',
      });
    }
  }, [openDrawer]);

  const [enrichingProductIds, setEnrichingProductIds] = useState(new Set());
  const [enrichingStatusMessage, setEnrichingStatusMessage] = useState(null);

  const handleInstantEnrich = useCallback(async (product) => {
    if (!product || !product.id) return;
    const prodId = product.id;
    const name = product.canonicalName || product.name || 'Product';
    
    setEnrichingProductIds(prev => new Set(prev).add(prodId));
    setEnrichingStatusMessage(`✨ Enriqueciendo "${name}" con IA...`);

    try {
      const res = await fetch('/api/admin/enrich-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: prodId,
          canonicalName: product.canonicalName,
          currentProduct: product
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEnrichingStatusMessage(`✅ "${name}" enriquecido al 100% con éxito!`);
        setTimeout(() => setEnrichingStatusMessage(null), 4000);

        setOptimisticOverrides(prev => ({
          ...prev,
          [prodId]: {
            ...(prev[prodId] || {}),
            ...data.product,
            completeness: data.completeness
          }
        }));

        queryClient?.invalidateQueries?.({ queryKey: ['catalog'] });
        queryClient?.invalidateQueries?.({ queryKey: ['products'] });
        refresh?.();
      } else {
        setEnrichingStatusMessage(`❌ Error al enriquecer: ${data.error || 'Error desconocido'}`);
        setTimeout(() => setEnrichingStatusMessage(null), 4000);
      }
    } catch (err) {
      logger.error('Instant enrichment error', { error: err });
      setEnrichingStatusMessage(`❌ Error: ${err.message}`);
      setTimeout(() => setEnrichingStatusMessage(null), 4000);
    } finally {
      setEnrichingProductIds(prev => {
        const next = new Set(prev);
        next.delete(prodId);
        return next;
      });
    }
  }, [queryClient, refresh, setOptimisticOverrides]);

  // 4. Memoized Columns Definition Hook
  const columns = useMasterCatalogColumns({
    categoryOptions,
    filterSupplier,
    supplierIdToName,
    protocols,
    onParentFieldUpdate: handleParentFieldUpdate,
    onOpenDrawer: (type) => setActiveDrawer(type),
    setSelectedProduct,
    setEnrichmentProduct,
    setTransactionsProduct,
    openPrescriptionDrawer,
    onEditGenomicPriority: (prod, slug) => setEditingGenomic({ isOpen: true, product: prod, programSlug: slug }),
    refresh,
    queryClient,
    setOptimisticOverrides,
    handleInstantEnrich,
    enrichingProductIds
  });

  return (
    <div style={{ position: 'relative' }}>
      <DataModule
        title={headerProps.title || "Product Catalog"}
        subtitle={headerProps.subtitle}
        resultCount={displayedMetrics.total}
        kpis={
          <CatalogKpiHeader
            displayedMetrics={displayedMetrics}
            kpiScope={kpiScope}
            setKpiScope={setKpiScope}
            hasAnyFilter={hasAnyFilter}
            filterProductType={filterProductType}
            setMultiParam={setMultiParam}
          />
        }
        icon={headerProps.icon}
        primaryAction={headerProps.primaryAction}
        mobileOverflowActions={headerProps.mobileOverflowActions || null}
        actions={
          <div className="catalog-header-actions-wrap">
            <style>{`
              .catalog-header-actions-wrap {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                flex-wrap: wrap;
                justify-content: flex-end;
              }
              .catalog-view-switcher-bar {
                display: inline-flex;
                background: #f1f5f9;
                padding: 3px;
                border-radius: 9px;
                border: 1px solid #e2e8f0;
              }
              .catalog-view-switcher-btn {
                display: inline-flex;
                align-items: center;
                gap: 5px;
                padding: 0.35rem 0.75rem;
                border-radius: 7px;
                border: none;
                background: transparent;
                color: var(--text-muted, #64748b);
                font-weight: 500;
                font-size: 0.8rem;
                cursor: pointer;
                transition: all 0.15s ease;
              }
              .catalog-view-switcher-btn.active {
                background: #ffffff;
                color: #003666;
                font-weight: 700;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              }
              .catalog-toolbar-actions {
                display: flex;
                align-items: center;
                gap: 0.4rem;
              }
              @media (max-width: 768px) {
                .catalog-header-actions-wrap {
                  flex-direction: column;
                  align-items: stretch;
                  gap: 0.5rem;
                  width: 100%;
                }
                .catalog-view-switcher-bar {
                  width: 100%;
                  display: flex;
                }
                .catalog-view-switcher-btn {
                  flex: 1;
                  justify-content: center;
                  padding: 0.5rem 0.25rem;
                  font-size: 0.8rem;
                  min-height: 38px;
                }
                .catalog-toolbar-actions {
                  width: 100%;
                  display: flex;
                  gap: 0.35rem;
                }
              }
            `}</style>
            <div className="catalog-view-switcher-bar">
              <button
                type="button"
                className={`catalog-view-switcher-btn ${catalogViewMode === 'table' ? 'active' : ''}`}
                onClick={() => setCatalogViewMode('table')}
              >
                <Layers size={13} /> Table View
              </button>
              <button
                type="button"
                className={`catalog-view-switcher-btn ${catalogViewMode === 'genomics_matrix' ? 'active' : ''}`}
                onClick={() => setCatalogViewMode('genomics_matrix')}
              >
                <Dna size={13} color={catalogViewMode === 'genomics_matrix' ? '#0284c7' : 'currentColor'} /> Genomics Matrix
              </button>
            </div>
            <div className="catalog-toolbar-actions">
              {mobileHeaderActions ? (
                <>
                  <div className="catalog-header-actions-desktop">
                    {headerActions || headerProps.actions}
                  </div>
                  <div className="catalog-header-actions-mobile" style={{ width: '100%' }}>
                    {mobileHeaderActions}
                  </div>
                </>
              ) : (
                headerActions || headerProps.actions
              )}
            </div>
          </div>
        }
        breadcrumbs={headerProps.breadcrumbs}
        loading={loading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search products by name or category..."
        resultCount={searchTerm ? dataWithMeta.length : undefined}
        namespace="admin-catalog"
        onRowClick={(row) => { setSelectedProduct(row); setActiveDrawer('offers'); }}
        expandableRender={(row) => (
          <CatalogVariantExpander
            product={row}
            commercialChannel={commercialChannel}
            onOpenPricingDrawer={(p) => {
              setSelectedProduct(p);
              setActiveDrawer('offers');
            }}
          />
        )}
        emptyState={{
          title: "No products found",
          subtitle: "Adjust your search or filters to see more results.",
          icon: Package
        }}
        filters={filterChips}
        filterOptions={[
          {
            key: 'tag',
            label: 'Tags',
            pluralLabel: 'Genomics Programs',
            multiSelect: true,
            values: filterTags,
            options: [
              { label: '🧬 Fagron Genomics | TeloTest', value: 'fagron-genomics-telotest', count: 23 },
              { label: '🧬 Fagron Genomics | TrichoTest', value: 'fagron-genomics-trichotest', count: 33 },
              { label: '🧬 Fagron Genomics | NutriGen', value: 'fagron-genomics-nutrigen', count: 87 }
            ],
            onChange: (vals) => {
              setMultiParam('tag', vals);
              const hasGenomics = vals.some(v => v.startsWith('fagron-genomics-'));
              if (!hasGenomics) {
                updateUrlParam('priority', '');
              }
            }
          },
          ...(filterTags.length >= 2 ? [{
            key: 'tagMode',
            label: 'Program Match Mode',
            pluralLabel: 'Match Modes',
            multiSelect: false,
            value: filterTagMode || 'any',
            options: [
              { label: '🔀 Match ANY Selected Tag (Union)', value: 'any' },
              { label: '🎯 Match ALL Selected Tags (Shared Ingredients)', value: 'all' }
            ],
            onChange: (val) => updateUrlParam('tagMode', val === 'all' ? 'all' : '')
          }] : []),
          ...(filterTags.some(v => v.startsWith('fagron-genomics-')) ? [{
            key: 'priority',
            label: 'Priority',
            pluralLabel: 'Priorities',
            multiSelect: false,
            values: filterPriority && filterPriority !== 'all' ? [filterPriority] : [],
            options: [
              { label: 'All Priorities', value: 'all' },
              { label: '🟢 Priority A (First-line)', value: 'A' },
              { label: '🟡 Priority B (Second-line)', value: 'B' },
              { label: '🔵 Priority C (Supportive)', value: 'C' }
            ],
            onChange: (vals) => updateUrlParam('priority', vals.length > 0 ? vals[0] : '')
          }] : []),
          {
            key: 'productType',
            label: 'Product Type',
            pluralLabel: 'Product Types',
            multiSelect: true,
            values: filterProductType,
            options: [
              { label: '🔄 Multi-Type (2+ Types)', value: 'multi_type' },
              { label: '💊 Finished Product', value: 'finished_product' },
              { label: '🧪 API / Raw Material', value: 'raw_material' },
              { label: '💉 Clinical Supplies & Diluents', value: 'clinical_supplies' },
              { label: '🔬 Diagnostics & Testing Kits', value: 'diagnostic' },
              { label: '📋 Clinical Services', value: 'service' }
            ],
            onChange: (vals) => setMultiParam('productType', vals)
          },
          {
            key: 'status',
            label: 'Status',
            pluralLabel: 'Statuses',
            multiSelect: true,
            values: (filterStatus.length === 1 && filterStatus[0] === 'active') ? [] : filterStatus,
            options: [
              { label: 'Active', value: 'active' },
              { label: 'Draft', value: 'draft' },
              { label: 'Archived', value: 'archived' }
            ],
            onChange: (vals) => setMultiParam('status', vals.length === 0 ? ['active'] : vals.map(v => v === 'published' ? 'active' : v))
          },
          {
            key: 'timeframe',
            label: 'Import Date',
            pluralLabel: 'Dates',
            value: filterTimeframe,
            options: [
              { label: 'All Dates', value: '' },
              { label: 'Imported Today', value: 'today' },
              { label: 'Last 7 Days', value: '7d' },
              { label: 'Last 30 Days', value: '30d' },
              { label: 'Last 90 Days', value: '90d' },
              ...(recentImportFilter ? [{ label: `✨ Latest Import (${recentImportFilter.supplierName || 'Lotusland'})`, value: 'latest_session' }] : [])
            ],
            onChange: (val) => {
              updateUrlParam('timeframe', val);
              const p = new URLSearchParams(window.location.search);
              if (p.has('filter')) {
                p.delete('filter');
                router.replace(`${pathname}?${p.toString()}`, { scroll: false });
              }
            }
          },
          {
            key: 'category',
            label: 'Category',
            pluralLabel: 'Categories',
            multiSelect: true,
            values: filterCategory,
            options: categoryOptions.map(c => ({
              ...c,
              count: categoryFacets[c.value] ?? 0,
            })).sort((a, b) => (b.count || 0) - (a.count || 0)),
            onChange: (vals) => setMultiParam('category', vals)
          },
          {
            key: 'goals',
            label: 'Goal',
            pluralLabel: 'Goals',
            multiSelect: true,
            values: filterGoals,
            options: CLINICAL_GOALS.map(g => ({
              label: g.label,
              value: g.id,
              count: goalFacets[g.id] ?? 0,
            })).sort((a, b) => (b.count || 0) - (a.count || 0)),
            onChange: (vals) => setMultiParam('goals', vals)
          },
          {
            key: 'presentation',
            label: 'Presentation',
            pluralLabel: 'Presentations',
            multiSelect: true,
            values: filterPresentation,
            options: (facetFormats || []).map(f => ({
              label: f.label,
              value: f.value,
              count: presentationFacets[f.value] ?? 0,
            })).sort((a, b) => (b.count || 0) - (a.count || 0)),
            onChange: (vals) => setMultiParam('presentation', vals)
          },
          {
            key: 'supplier',
            label: 'Supplier',
            pluralLabel: 'Suppliers',
            multiSelect: true,
            values: filterSupplier,
            options: (facetSuppliers || []).map(s => ({
              label: s.label,
              value: s.value,
              count: supplierFacets[s.value] ?? 0,
            })).sort((a, b) => (b.count || 0) - (a.count || 0)),
            onChange: (vals) => setMultiParam('supplier', vals)
          },
          {
            key: 'quality',
            label: 'Data Quality',
            pluralLabel: 'Quality Filters',
            multiSelect: false,
            values: filterQuality !== 'all' ? [filterQuality] : [],
            options: [
              { label: '🟢 Optimal (85-100%)', value: 'optimal' },
              { label: '🟡 Partial (50-84%)', value: 'partial' },
              { label: '🔴 Needs Data (<50%)', value: 'needs_data' },
            ],
            onChange: (vals) => updateUrlParam('quality', vals.length > 0 ? vals[0] : '')
          }
        ]}
        onClearAllFilters={clearAllFilters}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        bulkActions={[
          {
            label: 'Quote to Client',
            icon: FileText,
            onClick: () => setIsPriceListModalOpen(true)
          },
          {
            label: 'Supplier RFQ',
            icon: Send,
            onClick: () => {
              const selectedProds = data.filter(d => selectedIds.includes(d.id));
              notifier.info(`Initiating supplier RFQs for ${selectedProds.length} products...`);
              if (typeof openDrawer === 'function') {
                openDrawer({
                  type: 'supplier-rfq',
                  data: {
                    source: 'bulk_catalog',
                    products: selectedProds
                  }
                });
              }
            }
          },
          {
            label: 'Export PDF',
            icon: DownloadCloud,
            onClick: () => setIsPriceListModalOpen(true)
          },
          {
            label: 'Edit Selected',
            icon: Edit3,
            onClick: () => setIsBulkEditModalOpen(true)
          }
        ]}
        columns={columns}
        data={dataWithMeta}
        hasNextPage={hasNextPage}
        onLoadMore={fetchNextPage}
        isLoadingNextPage={isFetchingNextPage}
      >
        {catalogViewMode === 'genomics_matrix' && (
          <GenomicsMatrixView
            products={dataWithMeta}
            onSelectProduct={(p) => { setSelectedProduct(p); setActiveDrawer('offers'); }}
            onEditPriority={(p, slug) => setEditingGenomic({ isOpen: true, product: p, programSlug: slug })}
          />
        )}
      </DataModule>

      {/* 5. Isolated Modals & Drawers Container */}
      <CatalogModalsContainer
        activeDrawer={activeDrawer}
        setActiveDrawer={setActiveDrawer}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        data={data}
        filterSupplier={filterSupplier}
        displayCurrency={displayCurrency}
        setDisplayCurrency={setDisplayCurrency}
        priceView={priceView}
        setPriceView={setPriceView}
        commercialChannel={commercialChannel}
        setCommercialChannel={setCommercialChannel}
        resolveSupplierName={resolveSupplierName}
        handleExportProductPdf={handleExportProductPdf}
        isPriceListModalOpen={isPriceListModalOpen}
        setIsPriceListModalOpen={setIsPriceListModalOpen}
        isSavedPdfsOpen={isSavedPdfsOpen}
        setIsSavedPdfsOpen={setIsSavedPdfsOpen}
        isScanPriceListOpen={isScanPriceListOpen}
        setIsScanPriceListOpen={setIsScanPriceListOpen}
        scanPriceListInitialData={scanPriceListInitialData}
        setScanPriceListInitialData={setScanPriceListInitialData}
        isBulkEditModalOpen={isBulkEditModalOpen}
        setIsBulkEditModalOpen={setIsBulkEditModalOpen}
        isMergeModalOpen={isMergeModalOpen}
        setIsMergeModalOpen={setIsMergeModalOpen}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        cloneConfig={cloneConfig}
        setCloneConfig={setCloneConfig}
        pdfCustomProduct={pdfCustomProduct}
        setPdfCustomProduct={setPdfCustomProduct}
        showGoalsCoverage={showGoalsCoverage}
        setShowGoalsCoverage={setShowGoalsCoverage}
        enrichmentProduct={enrichmentProduct}
        setEnrichmentProduct={setEnrichmentProduct}
        transactionsProduct={transactionsProduct}
        setTransactionsProduct={setTransactionsProduct}
        setOptimisticOverrides={setOptimisticOverrides}
        handleNavigation={handleNavigation}
        refresh={refresh}
        queryClient={queryClient}
        openDrawer={openDrawer}
      />

      {/* 6. Genomics Priority Editor Modal (Rule #5 Inline Editing) */}
      <GenomicsPriorityEditorModal
        isOpen={editingGenomic.isOpen}
        onClose={() => setEditingGenomic({ isOpen: false, product: null, programSlug: null })}
        product={editingGenomic.product}
        programSlug={editingGenomic.programSlug}
        onSaved={(prodId, newPrograms) => {
          setOptimisticOverrides(prev => ({
            ...prev,
            [prodId]: { ...(prev[prodId] || {}), programs: newPrograms }
          }));
          refresh(true);
        }}
      />
    </div>
  );
}
