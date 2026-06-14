import Plus from "lucide-react/dist/esm/icons/plus";
import Download from "lucide-react/dist/esm/icons/download";
import Package from "lucide-react/dist/esm/icons/package";
import Activity from "lucide-react/dist/esm/icons/activity";
import Building from "lucide-react/dist/esm/icons/building";
import Shield from "lucide-react/dist/esm/icons/shield";
import React, { useState, useMemo, useEffect } from 'react';
import { useCatalogData } from './useCatalogData';
import CatalogKPIHeader from './CatalogKPIHeader';
import CatalogSmartSearch from './CatalogSmartSearch';
import CatalogProductsWorkspace from './views/CatalogProductsWorkspace';
import InventoryIntelligenceView from './views/InventoryIntelligenceView';
import SupplierInsightsView from './views/SupplierInsightsView';
import RegulatoryTrackerView from './views/RegulatoryTrackerView';
import ProductDetailsDrawer from "../products/ProductDetailsDrawer";
import CreateProductModal from "../CreateProductModal";
import AdvancedFiltersDrawer from './AdvancedFiltersDrawer';
import CatalogImportWizard from './CatalogImportWizard';






import toast from 'react-hot-toast';
import styles from './CatalogIntelligenceHub.module.css';

export default function CatalogIntelligenceHub() {
  const { products, loading, refresh, updateProduct, deleteProduct } = useCatalogData();
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
    inventory: { stockStatus: { inStock: true, lowStock: true, outOfStock: true }, maxReorder: 500, performance: { fastMovers: true, deadStock: true } },
    suppliers: { supplier: 'All Suppliers', country: 'All Countries', minPerformance: 0, maxRisk: 100 },
    regulatory: { status: { registered: true, pending: true }, documents: { missingCOA: true, missingSDS: true, missingDocs: true }, country: 'All Countries', maxRisk: 100 }
  });
  // Drawer & Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Derive categories for chips
  const categories = useMemo(() => {
    const counts = {};
    products.forEach(p => {
      const cat = p.category || 'Uncategorized';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([label, count]) => ({ id: label, label, count }))
      .sort((a, b) => b.count - a.count);
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // 1. Basic Filters (Search & Categories)
      if (activeCategories.length > 0) {
        const cat = p.category || 'Uncategorized';
        if (!activeCategories.includes(cat)) return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesSearch = (
          p.name?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.supplier?.toLowerCase().includes(q)
        );
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
      if (activeWorkspace === 'inventory') {
        const f = advancedFilters.inventory;
        const stock = p.stock || 0;
        const isLowStock = stock > 0 && stock < (p.reorderPoint || 20);
        const isOutOfStock = stock === 0;
        const isInStock = stock >= (p.reorderPoint || 20);
        if (!f.stockStatus.inStock && isInStock) return false;
        if (!f.stockStatus.lowStock && isLowStock) return false;
        if (!f.stockStatus.outOfStock && isOutOfStock) return false;
        if ((p.reorderPoint || 0) > f.maxReorder) return false;
        const isFastMover = p.salesStatus === 'fast';
        const isDeadStock = p.salesStatus === 'dead';
        if (!f.performance.fastMovers && isFastMover) return false;
        if (!f.performance.deadStock && isDeadStock) return false;
      }

      if (activeWorkspace === 'suppliers') {
        const f = advancedFilters.suppliers;
        if (f.supplier !== 'All Suppliers' && p.supplier !== f.supplier) return false;
        const country = p.originCountry || 'Unknown';
        if (f.country !== 'All Countries' && country !== f.country) return false;
        const perf = p.supplierPerformance || 90;
        if (perf < f.minPerformance) return false;
        const risk = p.supplierRisk || 10;
        if (risk > f.maxRisk) return false;
      }

      if (activeWorkspace === 'regulatory') {
        const f = advancedFilters.regulatory;
        const isRegistered = p.registrationStatus === 'Registered';
        const isPending = p.registrationStatus === 'Pending';
        if (!f.status.registered && isRegistered) return false;
        if (!f.status.pending && isPending) return false;

        if (!f.documents.missingCOA && p.missingCOA) return false;
        if (!f.documents.missingSDS && p.missingSDS) return false;
        if (!f.documents.missingDocs && (p.missingCOA || p.missingSDS)) return false;

        const risk = p.complianceRisk || 10;
        if (risk > f.maxRisk) return false;
      }

      return true;
    });
  }, [products, activeCategories, searchQuery, activeWorkspace, advancedFilters]);

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
              <button onClick={() => toast.dismiss(t.id)} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}>Cancel</button>
              <button onClick={() => { deleteProduct(product.id); toast.dismiss(t.id); toast.success('Product deleted'); }} style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontSize: '0.875rem' }}>Delete</button>
            </div>
          </div>
        ),
        { duration: Infinity }
      );
    } else if (action === 'ai') {
      toast('AI Insights coming soon for ' + product.name, { icon: '✨' });
    }
  };

  const handleFilterSelect = (kpiId) => {
    if (kpiId === 'active') setSearchQuery(''); 
    else if (kpiId === 'missing_data') setSearchQuery('');
  };

  return (
    <div className={styles.container}>
      {/* Workspaces Navigation */}
      <div className={styles.workspaceNav}>
        {[
          { id: 'products', label: 'Products', icon: Package },
          { id: 'inventory', label: 'Inventory', icon: Activity },
          { id: 'suppliers', label: 'Suppliers', icon: Building },
          { id: 'regulatory', label: 'Regulatory', icon: Shield }
        ].map(ws => (
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
          <h1 className={styles.title}>
            {activeWorkspace} Intelligence
          </h1>
        </div>
        <div className={styles.actionButtons}>
          {activeWorkspace === 'products' && (
            <>
              <button 
                onClick={() => setIsImportModalOpen(true)}
                className={styles.btnImport}
              >
                <Download size={18} /> Import
              </button>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className={styles.btnAdd}
              >
                <Plus size={18} /> Add Product
              </button>
            </>
          )}
        </div>
      </div>

      {/* Global Context (Search, Categories, KPIs) only relevant if not deep inside a specialized dashboard, but to keep architecture unified we show Search/KPIs globally */}
      <CatalogKPIHeader products={products} onFilterSelect={handleFilterSelect} />
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
      />

      {/* Workspace Content Router */}
      <div className={styles.workspaceContent}>
        {activeWorkspace === 'products' && (
          <CatalogProductsWorkspace 
            products={filteredProducts}
            loading={loading}
            activeDisplayMode={activeDisplayMode}
            onDisplayModeChange={setActiveDisplayMode}
            onAction={handleAction}
            isMobile={isMobile}
          />
        )}
        {activeWorkspace === 'inventory' && <InventoryIntelligenceView products={filteredProducts} />}
        {activeWorkspace === 'suppliers' && <SupplierInsightsView products={filteredProducts} />}
        {activeWorkspace === 'regulatory' && <RegulatoryTrackerView products={filteredProducts} />}
      </div>

      {/* Modals & Drawers */}
      {isCreateModalOpen && (
        <CreateProductModal onClose={() => setIsCreateModalOpen(false)} onSuccess={() => { setIsCreateModalOpen(false); refresh(); }} />
      )}
      {isDrawerOpen && selectedProduct && (
        <ProductDetailsDrawer product={selectedProduct} onClose={() => { setIsDrawerOpen(false); setSelectedProduct(null); }} onProductUpdated={() => refresh()} />
      )}
      <AdvancedFiltersDrawer 
        isOpen={isAdvancedFiltersOpen} 
        onClose={() => setIsAdvancedFiltersOpen(false)} 
        activeWorkspace={activeWorkspace}
        advancedFilters={advancedFilters}
        setAdvancedFilters={setAdvancedFilters}
      />
      <CatalogImportWizard isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />

      {/* Mobile Floating Action Button */}
      {isMobile && activeWorkspace === 'products' && (
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className={styles.fab}
        >
          <Plus size={24} />
        </button>
      )}
    </div>
  );
}