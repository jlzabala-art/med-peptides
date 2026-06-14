import Plus from 'lucide-react/dist/esm/icons/plus';
import Download from 'lucide-react/dist/esm/icons/download';
import Filter from 'lucide-react/dist/esm/icons/filter';
import Search from 'lucide-react/dist/esm/icons/search';
import X from 'lucide-react/dist/esm/icons/x';
import Package from 'lucide-react/dist/esm/icons/package';
import Activity from 'lucide-react/dist/esm/icons/activity';
import Building from 'lucide-react/dist/esm/icons/building';
import Shield from 'lucide-react/dist/esm/icons/shield';
import React, { useState, useMemo, useEffect } from 'react';
import { useCatalogData } from './useCatalogData';
import CatalogKPIHeader from './CatalogKPIHeader';
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
import VariantDetailsModal from '../products/VariantDetailsModal';

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
  const [activeKpis, setActiveKpis] = useState([]);

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
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);

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

      // 3. KPI Filters
      if (activeKpis.length > 0) {
        if (activeKpis.includes('missing_coa') && p.hasCoa) return false;
        if (activeKpis.includes('missing_supplier') && p.supplier) return false;
        if (activeKpis.includes('regulatory_risk') && p.registrationStatus === 'Registered') return false;
        if (activeKpis.includes('single_source') && p.suppliersCount > 1) return false;
        if (activeKpis.includes('low_health') && (p.healthScore || 100) >= 70) return false;
        if (activeKpis.includes('out_of_stock') && p.stock > 0) return false;
      }

      return true;
    });
  }, [products, activeCategories, searchQuery, activeWorkspace, advancedFilters, activeKpis]);

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

    // KPI Filters
    activeKpis.forEach(kpi => {
      const labels = {
        'missing_coa': 'Missing COA',
        'missing_supplier': 'Missing Supplier',
        'regulatory_risk': 'Regulatory Risk',
        'single_source': 'Single Source',
        'low_health': 'Low Health',
        'out_of_stock': 'Out of Stock'
      };
      if (labels[kpi]) {
        visuals.push({ id: `kpi.${kpi}`, label: labels[kpi] });
      }
    });

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
  }, [advancedFilters, activeWorkspace, activeKpis]);

  const handleRemoveFilter = (filterId) => {
    const parts = filterId.split('.');
    
    if (parts[0] === 'kpi') {
      setActiveKpis((prev) => prev.filter((k) => k !== parts[1]));
      return;
    }

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

  const handleAction = (action, product, variant) => {
    if (action === 'edit_variant' && variant) {
      setSelectedProduct(product);
      setSelectedVariant(variant);
      setIsVariantModalOpen(true);
    } else if (action === 'edit') {
      setSelectedProduct(product);
      setIsDrawerOpen(true);
    } else if (action === 'delete_variant' && variant) {
      toast(
        (t) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <span style={{ fontWeight: 600 }}>Delete variant {variant.sku || 'N/A'}?</span>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button onClick={() => toast.dismiss(t.id)} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}>Cancel</button>
              <button onClick={() => {
                // Implementation for variant deletion
                toast.dismiss(t.id);
                toast.success('Variant deleted (mock)');
              }} style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontSize: '0.875rem' }}>Delete</button>
            </div>
          </div>
        ), { duration: Infinity }
      );
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
    } else if (action === 'ai_variant' || action === 'ai') {
      setAiProduct(product);
      setIsAiModalOpen(true);
    }
  };

  const handleFilterSelect = (kpiId) => {
    if (kpiId === 'total') {
      setActiveKpis([]);
      return;
    }
    setActiveKpis((prev) =>
      prev.includes(kpiId) ? prev.filter((k) => k !== kpiId) : [...prev, kpiId]
    );
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
      <div className={styles.primaryActions} style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <h1 className={styles.title} style={{ margin: 0, fontSize: '1.5rem', whiteSpace: 'nowrap' }}>{activeWorkspace.charAt(0).toUpperCase() + activeWorkspace.slice(1)}</h1>
            
            {/* Search Input Integrated into Header */}
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              background: 'var(--color-bg-surface, #ffffff)',
              border: '1px solid var(--color-border, #e2e8f0)',
              borderRadius: '20px',
              padding: '0.4rem 1rem',
              width: isMobile ? '100%' : '350px',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)'
            }}>
              <Search size={16} color="var(--text-muted, #64748b)" style={{ marginRight: '8px' }} />
              <input 
                type="text"
                placeholder="Ask Atlas or Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1, border: 'none', background: 'transparent', outline: 'none',
                  fontSize: '0.85rem', color: 'var(--text-main, #1e293b)', fontWeight: 500
                }}
              />
              <button 
                onClick={() => setIsAdvancedFiltersOpen(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '4px', color: 'var(--color-primary)' }}
                title="Advanced Filters"
              >
                <Filter size={16} />
              </button>
            </div>
          </div>

          <div className={styles.actionButtons} style={{ display: 'flex', gap: '0.5rem' }}>
            {activeWorkspace === 'products' && (
              <>
                <button onClick={() => setIsImportModalOpen(true)} className={styles.btnImport} style={{ padding: '0.4rem 0.8rem', borderRadius: '16px', fontSize: '0.85rem' }}>
                  <Download size={16} /> Import
                </button>
                <button onClick={() => setIsCreateModalOpen(true)} className={styles.btnAdd} style={{ padding: '0.4rem 0.8rem', borderRadius: '16px', fontSize: '0.85rem' }}>
                  <Plus size={16} /> Add Product
                </button>
              </>
            )}
          </div>
        </div>

        {/* KPIs and Quick Filters Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          <CatalogKPIHeader 
            products={products} 
            activeFilters={activeFiltersVisuals}
            onFilterSelect={handleFilterSelect} 
          />
          <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--color-border, #e2e8f0)' }} />
          
          {/* Quick Filters */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[
              { id: 'out_of_stock', label: 'Out of Stock' },
              { id: 'low_health', label: 'Low Health' }
            ].map(qf => {
              const isActive = activeKpis.includes(qf.id);
              return (
                <button
                  key={qf.id}
                  onClick={() => handleFilterSelect(qf.id)}
                  style={{
                    display: 'flex', alignItems: 'center', padding: '0.3rem 0.8rem',
                    background: isActive ? 'var(--color-primary, #6366f1)' : '#ffffff',
                    border: `1px solid ${isActive ? 'var(--color-primary, #6366f1)' : 'var(--color-border, #e2e8f0)'}`,
                    borderRadius: '16px', cursor: 'pointer', fontWeight: 500, fontSize: '0.75rem',
                    color: isActive ? '#ffffff' : 'var(--text-main, #1e293b)', whiteSpace: 'nowrap'
                  }}
                >
                  {qf.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Filter Chips (if any) */}
      {(activeCategories.length > 0 || activeFiltersVisuals.length > 0 || (activeWorkspace === 'products' && advancedFilters?.products?.supplier !== 'All Suppliers')) && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {activeWorkspace === 'products' && activeCategories.map(cat => (
            <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 8px', background: 'rgba(99,102,241,0.08)', borderRadius: '12px', fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600 }}>
              {cat}
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => setActiveCategories(activeCategories.filter(c => c !== cat))} />
            </div>
          ))}
          {activeFiltersVisuals.map(filter => (
            <div key={filter.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 8px', background: 'var(--color-bg-hover, #f1f5f9)', borderRadius: '12px', fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: 500 }}>
              {filter.label}
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleRemoveFilter(filter.id)} />
            </div>
          ))}
          <button onClick={handleClearAllFilters} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Clear all</button>
        </div>
      )}

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
      <VariantDetailsModal
        isOpen={isVariantModalOpen}
        onClose={() => setIsVariantModalOpen(false)}
        product={selectedProduct}
        variant={selectedVariant}
        onSave={() => refresh()}
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
