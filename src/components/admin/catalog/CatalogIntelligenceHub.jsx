import Plus from 'lucide-react/dist/esm/icons/plus';
import Download from 'lucide-react/dist/esm/icons/download';
import Package from 'lucide-react/dist/esm/icons/package';
import Activity from 'lucide-react/dist/esm/icons/activity';
import Building from 'lucide-react/dist/esm/icons/building';
import Shield from 'lucide-react/dist/esm/icons/shield';
import React, { useState, useMemo, useEffect } from 'react';
import { useCatalogData } from './useCatalogData';
import CatalogKPIHeader from './CatalogKPIHeader';
import CatalogSmartSearch from './CatalogSmartSearch';
import CatalogProductsWorkspace from './views/CatalogProductsWorkspace';
import InventoryIntelligenceView from './views/InventoryIntelligenceView';
import SupplierInsightsView from './views/SupplierInsightsView';
import RegulatoryTrackerView from './views/RegulatoryTrackerView';
import MissingDataCenterView from './views/MissingDataCenterView';
import ProductDetailsDrawer from '../products/ProductDetailsDrawer';
import SmartProductIntakeWizard from './SmartProductIntakeWizard';
import AdvancedFiltersDrawer from './AdvancedFiltersDrawer';
import CatalogImportWizard from './CatalogImportWizard';
import ProductIntelligenceModal from './ProductIntelligenceModal';

import toast from 'react-hot-toast';
import styles from './CatalogIntelligenceHub.module.css';

export default function CatalogIntelligenceHub() {
  const {
    products,
    variants,
    metrics,
    loading,
    refresh,
    updateProduct,
    deleteProduct,
    addProduct,
  } = useCatalogData();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Workspace Navigation
  const [activeWorkspace, setActiveWorkspace] = useState('products'); // products, inventory, suppliers, regulatory
  // Products Workspace specific state
  const [activeDisplayMode, setActiveDisplayMode] = useState(isMobile ? 'cards' : 'table');

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategories, setActiveCategories] = useState([]);

  // Advanced Filters State
  const [advancedFilters, setAdvancedFilters] = useState({
    products: { category: 'All Categories', supplier: 'All Suppliers', minHealth: 0 },
    inventory: {
      stockStatus: { inStock: true, lowStock: true, outOfStock: true },
      maxReorder: 500,
      performance: { fastMovers: true, deadStock: true },
    },
    suppliers: {
      supplier: 'All Suppliers',
      country: 'All Countries',
      minPerformance: 0,
      maxRisk: 100,
    },
    regulatory: {
      status: { registered: true, pending: true },
      documents: { missingCOA: true, missingSDS: true, missingDocs: true },
      country: 'All Countries',
      maxRisk: 100,
    },
  });
  // Drawer & Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiProduct, setAiProduct] = useState(null);

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

  // Filter variants for the specific views (Inventory, Regulatory, Suppliers, Missing Data)
  // Note: CatalogProductsWorkspace still accepts products and does its own filtering if needed,
  // but we can pass variants to it as well, or we can filter the products array as before.
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Basic Filters (Search & Categories)
      if (activeCategories.length > 0) {
        const cat = p.category || 'Uncategorized';
        if (!activeCategories.includes(cat)) return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          p.name?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.supplier?.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      // 2. Advanced Contextual Filters
      if (activeWorkspace === 'products') {
        const f = advancedFilters.products;
        if (f.category !== 'All Categories' && p.category !== f.category) return false;
        if (f.supplier !== 'All Suppliers' && p.supplier !== f.supplier) return false;
        // Mock health score logic
        const health = p.healthScore || 80;
        if (health < f.minHealth) return false;
      }
      return true;
    });
  }, [products, activeCategories, searchQuery, activeWorkspace, advancedFilters]);

  // Filter variants for intelligence views
  const filteredVariants = useMemo(() => {
    return variants.filter((v) => {
      // Basic Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!v.name.toLowerCase().includes(q) && !v.supplier.toLowerCase().includes(q))
          return false;
      }

      if (activeWorkspace === 'inventory') {
        const f = advancedFilters.inventory;
        const isLowStock = v.stock > 0 && v.stock < v.reorderPoint;
        const isOutOfStock = v.stock === 0;
        const isInStock = v.stock >= v.reorderPoint;
        if (!f.stockStatus.inStock && isInStock) return false;
        if (!f.stockStatus.lowStock && isLowStock) return false;
        if (!f.stockStatus.outOfStock && isOutOfStock) return false;
        if (v.reorderPoint > f.maxReorder) return false;
      }

      if (activeWorkspace === 'suppliers') {
        const f = advancedFilters.suppliers;
        if (f.supplier !== 'All Suppliers' && v.supplier !== f.supplier) return false;
      }

      if (activeWorkspace === 'regulatory') {
        const f = advancedFilters.regulatory;
        const isRegistered = v.registration === 'Active';
        const isPending = v.registration === 'Pending';
        if (!f.status.registered && isRegistered) return false;
        if (!f.status.pending && isPending) return false;
        if (!f.documents.missingCOA && v.coa === 'Missing') return false;
        if (!f.documents.missingDocs && (v.coa === 'Missing' || v.gmp === 'Missing')) return false;
      }

      return true;
    });
  }, [variants, searchQuery, activeWorkspace, advancedFilters]);

  // --- External Filters Visibility ---
  const activeFiltersVisuals = useMemo(() => {
    const visuals = [];
    const f = advancedFilters[activeWorkspace];
    if (!f) return visuals;

    if (activeWorkspace === 'products') {
      if (f.supplier !== 'All Suppliers')
        visuals.push({ id: 'products.supplier', label: `Supplier: ${f.supplier}` });
      if (f.minHealth > 0)
        visuals.push({ id: 'products.minHealth', label: `Health > ${f.minHealth}` });
    } else if (activeWorkspace === 'inventory') {
      if (!f.stockStatus.inStock)
        visuals.push({ id: 'inventory.stockStatus.inStock', label: `Hide In Stock` });
      if (!f.stockStatus.lowStock)
        visuals.push({ id: 'inventory.stockStatus.lowStock', label: `Hide Low Stock` });
      if (!f.stockStatus.outOfStock)
        visuals.push({ id: 'inventory.stockStatus.outOfStock', label: `Hide Out of Stock` });
      if (f.maxReorder < 500)
        visuals.push({ id: 'inventory.maxReorder', label: `Max Reorder: ${f.maxReorder}` });
      if (!f.performance.fastMovers)
        visuals.push({ id: 'inventory.performance.fastMovers', label: `Hide Fast Movers` });
      if (!f.performance.deadStock)
        visuals.push({ id: 'inventory.performance.deadStock', label: `Hide Dead Stock` });
    } else if (activeWorkspace === 'suppliers') {
      if (f.supplier !== 'All Suppliers')
        visuals.push({ id: 'suppliers.supplier', label: `Supplier: ${f.supplier}` });
      if (f.country !== 'All Countries')
        visuals.push({ id: 'suppliers.country', label: `Country: ${f.country}` });
      if (f.minPerformance > 0)
        visuals.push({ id: 'suppliers.minPerformance', label: `Perf > ${f.minPerformance}` });
      if (f.maxRisk < 100) visuals.push({ id: 'suppliers.maxRisk', label: `Risk < ${f.maxRisk}` });
    } else if (activeWorkspace === 'regulatory') {
      if (!f.status.registered)
        visuals.push({ id: 'regulatory.status.registered', label: `Hide Registered` });
      if (!f.status.pending)
        visuals.push({ id: 'regulatory.status.pending', label: `Hide Pending` });
      if (!f.documents.missingCOA)
        visuals.push({ id: 'regulatory.documents.missingCOA', label: `Hide Missing COA` });
      if (!f.documents.missingSDS)
        visuals.push({ id: 'regulatory.documents.missingSDS', label: `Hide Missing SDS` });
      if (!f.documents.missingDocs)
        visuals.push({ id: 'regulatory.documents.missingDocs', label: `Hide Missing Docs` });
      if (f.country !== 'All Countries')
        visuals.push({ id: 'regulatory.country', label: `Country: ${f.country}` });
      if (f.maxRisk < 100) visuals.push({ id: 'regulatory.maxRisk', label: `Risk < ${f.maxRisk}` });
    }
    return visuals;
  }, [advancedFilters, activeWorkspace]);

  const handleRemoveFilter = (filterId) => {
    const parts = filterId.split('.');
    setAdvancedFilters((prev) => {
      const newState = { ...prev };
      const workspace = parts[0];
      const key = parts[1];

      if (parts.length === 3) {
        const subKey = parts[2];
        newState[workspace] = {
          ...newState[workspace],
          [key]: { ...newState[workspace][key], [subKey]: true }, // true is the default for boolean checkboxes
        };
      } else {
        // Handle non-nested defaults
        let defaultValue = 'All ' + (key === 'country' ? 'Countries' : 'Suppliers');
        if (key === 'minHealth' || key === 'minPerformance') defaultValue = 0;
        if (key === 'maxReorder') defaultValue = 500;
        if (key === 'maxRisk') defaultValue = 100;

        newState[workspace] = { ...newState[workspace], [key]: defaultValue };
      }
      return newState;
    });
  };

  const handleUpdateAdvancedFilter = (workspace, key, value, subKey = null) => {
    setAdvancedFilters((prev) => {
      const newState = { ...prev };
      if (subKey) {
        newState[workspace] = {
          ...newState[workspace],
          [key]: { ...newState[workspace][key], [subKey]: value },
        };
      } else {
        newState[workspace] = { ...newState[workspace], [key]: value };
      }
      return newState;
    });
  };

  const handleClearAllFilters = () => {
    setAdvancedFilters({
      products: { category: 'All Categories', supplier: 'All Suppliers', minHealth: 0 },
      inventory: {
        stockStatus: { inStock: true, lowStock: true, outOfStock: true },
        maxReorder: 500,
        performance: { fastMovers: true, deadStock: true },
      },
      suppliers: {
        supplier: 'All Suppliers',
        country: 'All Countries',
        minPerformance: 0,
        maxRisk: 100,
      },
      regulatory: {
        status: { registered: true, pending: true },
        documents: { missingCOA: true, missingSDS: true, missingDocs: true },
        country: 'All Countries',
        maxRisk: 100,
      },
    });
    setActiveCategories([]);
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

  const handleAction = (action, product) => {
    if (action === 'edit') {
      setSelectedProduct(product);
      setIsDrawerOpen(true);
    } else if (action === 'delete') {
      toast(
        (t) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <span style={{ fontWeight: 600 }}>Are you sure you want to delete {product.name}?</span>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="btn btn-outline"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteProduct(product.id);
                  toast.dismiss(t.id);
                  toast.success('Product deleted');
                }}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '4px',
                  border: 'none',
                  background: '#ef4444',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ),
        { duration: Infinity }
      );
    } else if (action === 'ai') {
      setAiProduct(product);
      setIsAiModalOpen(true);
    }
  };

  const handleFilterSelect = (kpiId) => {
    if (kpiId === 'active') setSearchQuery('');
    else if (kpiId === 'missing_data') {
      setSearchQuery('');
      setActiveWorkspace('missing_data');
    }
  };

  return (
    <div className={styles.container}>
      {/* Workspaces Navigation */}
      <div className={styles.workspaceNav}>
        {[
          { id: 'products', label: 'Products', icon: Package },
          { id: 'inventory', label: 'Inventory', icon: Activity },
          { id: 'suppliers', label: 'Suppliers', icon: Building },
          { id: 'regulatory', label: 'Regulatory', icon: Shield },
        ].map((ws) => (
          <button
            key={ws.id}
            onClick={() => setActiveWorkspace(ws.id)}
            className={`${styles.workspaceBtn} ${activeWorkspace === ws.id ? styles.workspaceBtnActive : styles.workspaceBtnInactive}`}
          >
            <ws.icon size={18} />
            {ws.label}
          </button>
        ))}
      </div>

      {/* Primary Actions Area */}
      <div className={styles.primaryActions}>
        <div>
          <h1 className={styles.title}>{activeWorkspace} Intelligence</h1>
        </div>
        <div className={styles.actionButtons}>
          {activeWorkspace === 'products' && (
            <>
              <button onClick={() => setIsImportModalOpen(true)} className={styles.btnImport}>
                <Download size={18} /> Import
              </button>
              <button onClick={() => setIsCreateModalOpen(true)} className={styles.btnAdd}>
                <Plus size={18} /> Add Product
              </button>
            </>
          )}
        </div>
      </div>

      {/* Global Context (Search, Categories, KPIs) only relevant if not deep inside a specialized dashboard, but to keep architecture unified we show Search/KPIs globally */}
      <CatalogKPIHeader products={products} metrics={metrics} onFilterSelect={handleFilterSelect} />
      <CatalogSmartSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCategories={activeCategories}
        categories={categories}
        onCategoryChange={setActiveCategories}
        isMobile={isMobile}
        onOpenAdvancedFilters={() => setIsAdvancedFiltersOpen(true)}
        products={products}
        activeWorkspace={activeWorkspace}
        activeFilters={activeFiltersVisuals}
        onRemoveFilter={handleRemoveFilter}
        onClearAllFilters={handleClearAllFilters}
        advancedFilters={advancedFilters}
        onUpdateAdvancedFilter={handleUpdateAdvancedFilter}
      />

      {/* Workspace Content Router */}
      <div className={styles.workspaceContent}>
        {activeWorkspace === 'products' && (
          <CatalogProductsWorkspace
            products={filteredProducts}
            variants={filteredVariants}
            loading={loading}
            activeDisplayMode={activeDisplayMode}
            onDisplayModeChange={setActiveDisplayMode}
            onAction={handleAction}
            isMobile={isMobile}
          />
        )}
        {activeWorkspace === 'inventory' && (
          <InventoryIntelligenceView variants={filteredVariants} />
        )}
        {activeWorkspace === 'suppliers' && <SupplierInsightsView variants={filteredVariants} />}
        {activeWorkspace === 'regulatory' && <RegulatoryTrackerView variants={filteredVariants} />}
        {activeWorkspace === 'missing_data' && (
          <MissingDataCenterView variants={filteredVariants} onAction={handleAction} />
        )}
      </div>

      {/* Modals & Drawers */}
      <SmartProductIntakeWizard
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          refresh();
        }}
        onAddProduct={addProduct}
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
      />
      <CatalogImportWizard isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />
      <ProductIntelligenceModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        product={aiProduct}
      />

      {/* Mobile Floating Action Button */}
      {isMobile && activeWorkspace === 'products' && (
        <button onClick={() => setIsCreateModalOpen(true)} className={styles.fab}>
          <Plus size={24} />
        </button>
      )}
    </div>
  );
}
