import Plus from 'lucide-react/dist/esm/icons/plus';
import Download from 'lucide-react/dist/esm/icons/download';
import Filter from 'lucide-react/dist/esm/icons/filter';
import Search from 'lucide-react/dist/esm/icons/search';
import X from 'lucide-react/dist/esm/icons/x';
import Package from 'lucide-react/dist/esm/icons/package';
import Activity from 'lucide-react/dist/esm/icons/activity';
import Building from 'lucide-react/dist/esm/icons/building';
import Shield from 'lucide-react/dist/esm/icons/shield';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import Tag from 'lucide-react/dist/esm/icons/tag';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useMemo, useEffect, lazy, Suspense, useDeferredValue } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCatalogData } from './useCatalogData';
import { useCatalogActionRouter } from './hooks/useCatalogActionRouter';
import OperationalActionCards from './OperationalActionCards';
import BulkUpdateModal from './BulkUpdateModal';
import CatalogProductsWorkspace from './views/CatalogProductsWorkspace';
import CatalogErrorBoundary from './CatalogErrorBoundary';
import { CatalogService } from './api/catalog.service';
import { MigrationService } from './api/migration.service';
import { BulkSupplierModal, BulkTagModal, BulkPoModal, BulkQuoteModal } from './modals/CatalogBulkActionModals';
import ActiveFilterChips from '../../../features/catalog/components/layout/ActiveFilterChips';

const ProductDetailsDrawer = lazy(() => import('../products/ProductDetailsDrawer'));
const SmartProductIntakeWizard = lazy(() => import('./SmartProductIntakeWizard'));
const UniversalImportWizard = lazy(() => import('./UniversalImportWizard'));
const CatalogImportWizard = lazy(() => import('./CatalogImportWizard'));
const ProductIntelligenceModal = lazy(() => import('./ProductIntelligenceModal'));
const VariantDetailsModal = lazy(() => import('../products/VariantDetailsModal'));
import CatalogHeaderGadget from '../../../gadgets/catalog/CatalogHeaderGadget';

import { GOALS, PRODUCT_TYPES, TYPE_LABELS, GOAL_LABELS } from '../../../constants/catalogFilters';
import AdvancedFiltersDrawer from './AdvancedFiltersDrawer';
import { useCatalogFilters } from '../../../hooks/useCatalogFilters';

import toast from 'react-hot-toast';
import styles from './CatalogIntelligenceHub.module.css';

export default function CatalogIntelligenceHub({
  readOnly = false,
  hideCosts = false,
  allowedCategories = ['All']
}) {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const {
    searchQuery, setSearchQuery,
    activeCategories, setActiveCategories,
    activeKpis, setActiveKpis,
    advancedFilters, setAdvancedFilters,
    clearAllFilters, removeFilter, checkItemAgainstFilters, filterProducts
  } = useCatalogFilters();

  // Products Workspace specific state
  const [activeWorkspace, setActiveWorkspace] = useState('products');
  const [activeDisplayMode, setActiveDisplayMode] = useState(isMobile ? 'cards' : 'table');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const {
    products,
    variants,
    metrics,
    loading,
    refresh,
    updateProduct,
    deleteProduct,
    addProduct,
    hasMore,
    currentPage,
    nextPage,
    prevPage,
  } = useCatalogData({
    searchQuery: searchQuery,
    categoryFilter: activeCategories.length > 0 ? activeCategories[0] : null,
    advancedFilters,
    activeKpis,
    activeWorkspace,
    pageSize: 20
  });

  // Drawer & Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isUniversalWizardOpen, setIsUniversalWizardOpen] = useState(false);
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [bulkActionState, setBulkActionState] = useState({ isOpen: false, type: null, ids: [] });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [catalogToEdit, setCatalogToEdit] = useState(null);

  const [aiProduct, setAiProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [variantEditMode, setVariantEditMode] = useState('overview');
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [intakeMode, setIntakeMode] = useState('product'); // 'product' | 'variant'

  // Derive categories for chips
  const categories = useMemo(() => {
    const counts = {};
    products.forEach((p) => {
      const cat = p.category || 'Uncategorized';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([label, count]) => ({ id: label, label, count }))
      .sort((a, b) => b.count - a.count);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return filterProducts(products, deferredSearchQuery);
  }, [
    products,
    activeCategories,
    deferredSearchQuery,
    activeWorkspace,
    advancedFilters,
    activeKpis,
  ]);

  // Filter variants for intelligence views
  const filteredVariants = useMemo(() => {
    return variants.filter((v) => {
      if (deferredSearchQuery) {
        const q = deferredSearchQuery.toLowerCase();
        const vName = v.name || '';
        const vSupplier = v.supplier || '';
        if (!vName.toLowerCase().includes(q) && !vSupplier.toLowerCase().includes(q))
          return false;
      }

      if (!checkItemAgainstFilters(v)) return false;

      return true;
    });
  }, [variants, deferredSearchQuery, activeWorkspace, advancedFilters]);
  useEffect(() => {
    const handleOpenWizard = () => setIsUniversalWizardOpen(true);
    window.addEventListener('open-universal-wizard', handleOpenWizard);
    return () => window.removeEventListener('open-universal-wizard', handleOpenWizard);
  }, []);

  // --- External Filters Visibility ---
  const activeFiltersVisuals = useMemo(() => {
    const visuals = [];

    // KPI Filters
    activeKpis.forEach((kpi) => {
      const labels = {
        missing_coa: 'Missing COA',
        missing_supplier: 'Missing Supplier',
        regulatory_risk: 'Regulatory Risk',
        single_source: 'Single Source Risk',
        low_health: 'Low Health Score',
        out_of_stock: 'Out of Stock',
      };
      if (labels[kpi]) {
        visuals.push({ id: `kpi.${kpi}`, label: labels[kpi] });
      }
    });

    const GOAL_LABELS = {
      weight_loss_glp1: 'Weight Loss / GLP-1',
      metabolic_health: 'Metabolic Health',
      anti_aging_longevity: 'Anti-Aging & Longevity',
      recovery_healing: 'Recovery & Healing',
      cognitive_mood: 'Cognitive & Mood',
      hormonal_optimization: 'Hormonal Optimization',
      fertility: 'Fertility',
      immune_support: 'Immune Support',
      skin_hair_aesthetics: 'Skin / Hair / Aesthetics',
      performance_muscle: 'Performance / Muscle',
      biomarkers: 'Biomarkers',
      genomics: 'Genomics',
      general_wellness: 'General Wellness'
    };

    const TYPE_LABELS = {
      lyophilized_peptide: 'Lyophilized Peptides',
      api_peptide: 'API Peptides',
      api_supplement: 'API Supplements',
      dna_testing_kit: 'DNA Testing Kits',
      biomarker_testing_kit: 'Biomarker Testing Kits',
      pellet: 'Pellets',
      injectable: 'Injectables',
      capsule_tablet: 'Capsules / Tablets',
      medical_device: 'Medical Devices',
      consumable: 'Consumables',
      service: 'Services'
    };

    const COMM_LABELS = {
      inStock: 'In Stock',
      outOfStock: 'Out of Stock',
      priceMissing: 'Price Missing',
      supplierMissing: 'Supplier Missing',
      singleSourceRisk: 'Single Source Risk'
    };

    const REG_LABELS = {
      registered: 'Registered',
      coaAvailable: 'COA Available',
      missingCOA: 'Missing COA',
      regulatoryRisk: 'Regulatory Risk',
      researchUseOnly: 'Research Use Only'
    };

    if (advancedFilters.goals) {
      advancedFilters.goals.forEach(g => visuals.push({ id: `goals.${g}`, label: GOAL_LABELS[g] || g }));
    }
    if (advancedFilters.productTypes) {
      advancedFilters.productTypes.forEach(t => visuals.push({ id: `productTypes.${t}`, label: TYPE_LABELS[t] || t }));
    }
    if (advancedFilters.commercialStatus) {
      Object.entries(advancedFilters.commercialStatus).forEach(([k, v]) => {
        if (v) visuals.push({ id: `commercialStatus.${k}`, label: COMM_LABELS[k] || k });
      });
    }
    if (advancedFilters.regulatoryStatus) {
      Object.entries(advancedFilters.regulatoryStatus).forEach(([k, v]) => {
        if (v) visuals.push({ id: `regulatoryStatus.${k}`, label: REG_LABELS[k] || k });
      });
    }

    return visuals;
  }, [advancedFilters, activeWorkspace, activeKpis]);

  const handleRemoveFilter = (filterId) => {
    const parts = filterId.split('.');

    if (parts[0] === 'kpi') {
      setActiveKpis((prev) => prev.filter((k) => k !== parts[1]));
      return;
    }

    setAdvancedFilters((prev) => {
      const newState = { ...prev };
      const category = parts[0];
      const key = parts[1];

      if (category === 'goals' || category === 'productTypes') {
        newState[category] = newState[category].filter(v => v !== key);
      } else if (category === 'commercialStatus' || category === 'regulatoryStatus') {
        newState[category] = { ...newState[category], [key]: false };
      }
      return newState;
    });
  };

  const handleUpdateAdvancedFilter = (category, key, value) => {
    // Left for compatibility, but handled mostly via AdvancedFiltersDrawer now
  };

  const handleClearAllFilters = () => {
    setAdvancedFilters({
      goals: [],
      productTypes: [],
      commercialStatus: {
        inStock: false,
        outOfStock: false,
        priceMissing: false,
        supplierMissing: false,
        singleSourceRisk: false
      },
      regulatoryStatus: {
        registered: false,
        coaAvailable: false,
        missingCOA: false,
        regulatoryRisk: false,
        researchUseOnly: false
      }
    });
    setActiveCategories([]);
    setActiveKpis([]);
  };

  // --- Atlas AI Semantic Search Engine ---
  useEffect(() => {
    if (searchQuery.toLowerCase().startsWith('ask atlas:')) {
      const intentText = searchQuery.substring(10).trim();
      if (intentText.length > 3) {
        const timer = setTimeout(() => {
          import('../../../utils/atlasAiParser').then(({ parseAtlasIntent }) => {
            const currentState = {
              activeWorkspace,
              activeCategories,
              advancedFilters,
            };

            const { nextState, applied } = parseAtlasIntent(intentText, currentState);

            if (applied) {
              setActiveWorkspace(nextState.workspace);
              setActiveCategories(nextState.categories);
              setAdvancedFilters(nextState.advancedFilters);
              setSearchQuery('');
              toast.success('Atlas AI: Applied filters based on your request ✨', {
                duration: 4000,
              });
            }
          });
        }, 600);
        return () => clearTimeout(timer);
      }
    }
  }, [searchQuery, activeWorkspace, activeCategories, advancedFilters]);

  const { handleAction } = useCatalogActionRouter({
    setSelectedProduct,
    setSelectedVariant,
    setVariantEditMode,
    setIsVariantModalOpen,
    setIsDrawerOpen,
    setBulkActionState,
    setAiProduct,
    setIsAiModalOpen,
    currentFilters: { searchQuery: deferredSearchQuery, advancedFilters, activeKpis, categoryFilter: activeCategories[0] }
  });

  const handleFilterSelect = (kpiId) => {
    if (kpiId === 'total') {
      setActiveKpis([]);
      return;
    }
    setActiveKpis((prev) =>
      prev.includes(kpiId) ? prev.filter((k) => k !== kpiId) : [...prev, kpiId]
    );
  };

  const runRegenPeptMigration = async () => {
    try {
      const loadingToast = toast.loading('Procesando catálogo RegenPept...');
      const { updatedCount, createdCount } = await MigrationService.runRegenPeptMigration();
      toast.dismiss(loadingToast);
      toast.success(`¡Migración RegenPept completa! (${updatedCount} act, ${createdCount} nuevos)`);
    } catch (err) {
      console.error(err);
      toast.error('Error al migrar datos de RegenPept.');
    }
  };

  // Calculate unique suppliers for the modal (aggregated by lowercase name)
  const uniqueSuppliers = useMemo(() => {
    const supplierMap = new Map();
    [...products, ...variants].forEach(item => {
      if (item.supplier) {
        const name = item.supplier.trim();
        const lower = name.toLowerCase();
        if (!supplierMap.has(lower)) {
          supplierMap.set(lower, name);
        }
      }
    });
    return Array.from(supplierMap.values()).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  }, [products, variants]);

  return (
    <div className={styles.container}>

      {/* Primary Actions Area */}
      <div
        className={styles.primaryActions}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        {/* Gadget: Catalog Header */}
        <CatalogHeaderGadget
        activeWorkspace={activeWorkspace}
        title={activeWorkspace === 'products' ? 'Product Intelligence' : undefined}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setIsAdvancedFiltersOpen={setIsAdvancedFiltersOpen}
        activeFilterCount={activeFiltersVisuals.length}
        filteredCatalog={filteredProducts}
        totalItems={metrics?.totalProducts || 0}
        isMobile={isMobile}
        isAddMenuOpen={isAddMenuOpen}
        setIsAddMenuOpen={setIsAddMenuOpen}
        setIntakeMode={setIntakeMode}
        setIsCreateModalOpen={setIsCreateModalOpen}
        setIsImportModalOpen={setIsImportModalOpen}
        onAction={handleAction}
      />
      </div>

        {/* KPIs and Quick Filters Row */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            paddingTop: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          <OperationalActionCards
            products={products}
            activeFilters={activeFiltersVisuals}
            onFilterSelect={handleFilterSelect}
            globalKpis={metrics?.globalKpis}
            totalProducts={metrics?.totalProducts || 0}
            onAction={(filterId) => {
              if (!activeKpis.includes(filterId)) {
                handleFilterSelect(filterId);
              }
              let itemToOpen = null;
              if (filterId === 'missing_supplier') {
                itemToOpen = products.find(p => !p.supplier);
              } else if (filterId === 'missing_coa') {
                itemToOpen = products.find(p => !p.hasCoa);
              } else if (filterId === 'regulatory_risk') {
                itemToOpen = products.find(p => p.registrationStatus !== 'Registered');
              } else if (filterId === 'single_source') {
                itemToOpen = products.find(p => p.suppliersCount === 1 || !p.suppliersCount);
              } else if (filterId === 'low_health') {
                itemToOpen = products.find(p => (p.healthScore || 100) < 70);
              } else if (filterId === 'out_of_stock') {
                itemToOpen = products.find(p => p.inventoryLevel === 0);
              }
              
              if (itemToOpen) {
                handleAction('edit', itemToOpen);
              }
            }}
          />
          </div>
        </div>

      {/* Active Filter Chips (if any) */}
      <ActiveFilterChips
        activeCategories={activeCategories}
        activeFiltersVisuals={activeFiltersVisuals}
        activeWorkspace={activeWorkspace}
        advancedFilters={advancedFilters}
        setActiveCategories={setActiveCategories}
        handleRemoveFilter={handleRemoveFilter}
        handleClearAllFilters={handleClearAllFilters}
      />

      {/* Workspace Content Router */}
      <div className={styles.workspaceContent}>
        <CatalogErrorBoundary>
          <CatalogProductsWorkspace
            products={filteredProducts}
            variants={filteredVariants}
            loading={loading}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeDisplayMode={activeDisplayMode}
            onDisplayModeChange={setActiveDisplayMode}
            onAction={handleAction}
            isMobile={isMobile}
            hasMore={hasMore}
            currentPage={currentPage}
            nextPage={nextPage}
            prevPage={prevPage}
          />
        </CatalogErrorBoundary>
      </div>

      {/* Modals & Drawers */}
      <SmartProductIntakeWizard
        isOpen={isCreateModalOpen}
        mode={intakeMode}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIntakeMode('product');
        }}
      />
      <UniversalImportWizard
        isOpen={isUniversalWizardOpen}
        onClose={() => setIsUniversalWizardOpen(false)}
      />
      <Suspense fallback={null}>
        <BulkSupplierModal
          isOpen={bulkActionState.isOpen && bulkActionState.type === 'bulk_supplier'}
          onClose={() => setBulkActionState({ isOpen: false, type: null, ids: [] })}
          selectedIds={bulkActionState.ids}
          suppliers={uniqueSuppliers}
          onApply={(supplier) => {
            toast.success(`Supplier assigned to ${bulkActionState.ids.length} items (Mock)`);
            setBulkActionState({ isOpen: false, type: null, ids: [] });
          }}
        />
        <BulkTagModal
          isOpen={bulkActionState.isOpen && bulkActionState.type === 'bulk_tag'}
          onClose={() => setBulkActionState({ isOpen: false, type: null, ids: [] })}
          selectedIds={bulkActionState.ids}
          onApply={(tags) => {
            toast.success(`Tags updated for ${bulkActionState.ids.length} items (Mock)`);
            setBulkActionState({ isOpen: false, type: null, ids: [] });
          }}
        />
        <BulkUpdateModal
          isOpen={bulkActionState.isOpen && bulkActionState.type === 'bulk_update'}
          onClose={() => setBulkActionState({ isOpen: false, type: null, ids: [] })}
          selectedIds={bulkActionState.ids}
          variants={variants}
          onSuccess={() => {
            setBulkActionState({ isOpen: false, type: null, ids: [] });
            refresh();
          }}
        />
        <BulkPoModal
          isOpen={bulkActionState.isOpen && bulkActionState.type === 'bulk_po'}
          onClose={() => setBulkActionState({ isOpen: false, type: null, ids: [] })}
          selectedIds={bulkActionState.ids}
          onApply={() => {
            toast.success(`Purchase Order draft created with ${bulkActionState.ids.length} items! (Mock)`);
            setBulkActionState({ isOpen: false, type: null, ids: [] });
          }}
        />
        <BulkQuoteModal
          isOpen={bulkActionState.isOpen && bulkActionState.type === 'bulk_quote'}
          onClose={() => setBulkActionState({ isOpen: false, type: null, ids: [] })}
          selectedIds={bulkActionState.ids}
          onApply={() => {
            toast.success(`Quotation draft created with ${bulkActionState.ids.length} items! (Mock)`);
            setBulkActionState({ isOpen: false, type: null, ids: [] });
          }}
        />
        {isDrawerOpen && selectedProduct && (
          <ProductDetailsDrawer
            product={selectedProduct}
            onClose={() => {
              setIsDrawerOpen(false);
              setSelectedProduct(null);
            }}
            onProductUpdated={() => refresh()}
          />
        )}
        <AdvancedFiltersDrawer
          isOpen={isAdvancedFiltersOpen}
          onClose={() => setIsAdvancedFiltersOpen(false)}
          activeWorkspace={activeWorkspace}
          advancedFilters={advancedFilters}
          setAdvancedFilters={setAdvancedFilters}
          activeCategories={activeCategories}
          onCategoryChange={setActiveCategories}
          suppliers={uniqueSuppliers}
          filteredCount={filteredProducts?.length || 0}
          totalCount={metrics?.totalProducts || 0}
        />
        <CatalogImportWizard isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />
        <SmartProductIntakeWizard
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onAddProduct={addProduct}
          mode={intakeMode}
          products={products}
        />
        <ProductIntelligenceModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          product={aiProduct}
        />
        <VariantDetailsModal
          isOpen={isVariantModalOpen}
          onClose={() => setIsVariantModalOpen(false)}
          product={selectedProduct}
          variant={selectedVariant}
          mode={variantEditMode}
          onSave={() => refresh()}
        />
      </Suspense>

      {/* Mobile Floating Action Button */}
      {isMobile && activeWorkspace === 'products' && (
        <button onClick={() => setIsCreateModalOpen(true)} className={styles.fab}>
          <Plus size={24} />
        </button>
      )}
    </div>
  );
}
