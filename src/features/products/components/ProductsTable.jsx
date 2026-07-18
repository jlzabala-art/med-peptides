'use client';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Copy, Download, UploadCloud, Percent, ArrowUpRight, XCircle, Eye, BookOpen, Package, ClipboardList, ShoppingCart } from '@/lib/icons';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase';

import { useAuth } from '../../../context/AuthContext';

// UI Components
import DataModule from '../../../components/ui/DataModule';
import TextField from '../../../components/ui/TextField';
import Select from '../../../components/ui/Select';
import PaginationControl from '../../../components/common/PaginationControl';

// Admin Components
import AdminSupplyNotifierWidget from '../../../components/admin/gadgets/AdminSupplyNotifierWidget';
import PredictiveInventoryAlerts from '../../../components/admin/gadgets/PredictiveInventoryAlerts';
import ProductContextSwitcher from '../../../components/admin/ProductContextSwitcher';
import { useAdminProductsUIStore } from '../../../stores/adminProductsUIStore';
import { getAdminProductsColumns } from '../../../components/admin/AdminProductsColumns';
import VariantRow from '../../../components/admin/VariantRow';
import MetricCard from '../../../components/ui/MetricCard';

// Hooks
import { useCatalogSelectionStore } from '../../../stores/useCatalogSelectionStore';
import { useToast } from '../../../hooks/useToast';
import { catalogRepository } from '../../../repositories/catalogRepository';
import { useDataFilters } from '../../../hooks/ui/useDataFilters';
import { useProducts } from '../../../hooks/admin/useProducts';
import { useBulkSelection } from '../../../hooks/admin/useBulkSelection';
import { useUpdateProduct, useDeleteProduct, useBulkUpdateProduct } from '../../../hooks/admin/useProductMutations';
import { useCsvImport } from '../../../hooks/data/useCsvImport';
import { useAlgoliaSearch } from '../../../hooks/data/useAlgoliaSearch';

// Lazy-loaded heavy modals
import dynamic from 'next/dynamic';
const ProductMicrosite = dynamic(() => import('../../../components/admin/products/ProductMicrosite'));
const CreateProductModal = dynamic(() => import('../../../components/admin/CreateProductModal'));
const BulkOrderSelectionModal = dynamic(() => import('../../../components/admin/BulkOrders/BulkOrderSelectionModal'));

export default function ProductsTable({
  role = 'admin',
  initialProducts = [],
  readOnly = false,
  hideCosts = false,
  allowedCategories = ['All'],
  isWholesaler = false,
}) {
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialNew = searchParams.get('new') === 'true';

  const {
    isCreateProductModalOpen, setIsCreateProductModalOpen,
    catalogSelectMode, setCatalogSelectMode,
    myCatalogs, setMyCatalogs,
    loadingCatalogs, setLoadingCatalogs,
    bulkMode, setBulkMode,
    bulkValue, setBulkValue,
    bulkCategory, setBulkCategory,
    migrating, setMigrating,
    isBulkOrderModalOpen, setIsBulkOrderModalOpen,
    productsToBulkOrder, setProductsToBulkOrder
  } = useAdminProductsUIStore();

  const [rowsPerPage, setRowsPerPage] = useState(50);

  useEffect(() => {
    if (initialNew) setIsCreateProductModalOpen(true);
  }, [initialNew, setIsCreateProductModalOpen]);

  // Firestore paginated data
  const { products, loading, loadingMore, fetchProducts, loadMore, hasMore, totalCount } =
    useProducts(allowedCategories, { initialData: initialProducts, pageSize: rowsPerPage });

  // Fuzzy search + filters
  const {
    searchTerm,
    setSearchTerm,
    filters,
    setFilter,
    paginatedData: paginatedProducts,
    filteredData: filteredProducts,
    totalItems,
  } = useDataFilters(products, {
    searchConfig: [
      { field: 'name', weight: 4 },
      { field: 'sku', weight: 3 },
      { field: 'category', weight: 2 },
      { field: 'dosage', weight: 2 },
      { field: 'objective', weight: 1 },
      { field: 'supplier', weight: 1 },
    ],
    initialFilters: {
      category: 'All',
      supplier: 'All',
      isActive: 'All',
      warehouse: 'All',
    },
    pageSize: 10000,
    initialSearch: initialSearch,
  });

  // Compat with old filter field names
  const filterCategory = filters.category;
  const setFilterCategory = (v) => setFilter('category', v);
  const filterSupplier = filters.supplier;
  const setFilterSupplier = (v) => setFilter('supplier', v);
  const filterStatus = filters.isActive;
  const setFilterStatus = (v) => setFilter('isActive', v);
  const filterWarehouse = filters.warehouse;
  const setFilterWarehouse = (v) => setFilter('warehouse', v);

  // Algolia Setup
  const facetFilters = [];
  if (filterCategory !== 'All') facetFilters.push(`category:${filterCategory}`);
  if (filterSupplier !== 'All') facetFilters.push(`supplier:${filterSupplier}`);
  if (filterWarehouse !== 'All') facetFilters.push(`warehouse:${filterWarehouse}`);
  if (filterStatus !== 'All') facetFilters.push(`isActive:${filterStatus === 'Active'}`);

  const { hits: algoliaHits, isAlgoliaActive, loading: algoliaLoading } = useAlgoliaSearch(
    'products',
    searchTerm,
    { hitsPerPage: 100, facetFilters },
    300
  );

  const baseFilteredProducts = isAlgoliaActive && searchTerm.trim()
    ? algoliaHits.map(h => products.find(p => p.id === h.objectID) || { ...h, id: h.objectID }).filter(Boolean)
    : filteredProducts;

  // Group flat product list by name for table display
  const filteredGroups = useMemo(() => {
    const groupMap = baseFilteredProducts.reduce((acc, p) => {
      const gName = p.name || 'Unnamed';
      if (!acc[gName]) {
        acc[gName] = {
          name: gName, category: p.category || '', supplier: p.supplier || '',
          warehouse: p.warehouse || '', totalStock: 0, isActive: false,
          variants: [], zoho_item_id: null, sku: null,
          isGroup: true, // Mark as group for expanded view rendering
        };
      }
      acc[gName].variants.push(p);
      acc[gName].totalStock += p.stock || 0;
      if (p.isActive !== false) acc[gName].isActive = true;
      if (!acc[gName].sku && p.sku) acc[gName].sku = p.sku.substring(0, 8);
      if (!acc[gName].zoho_item_id && p.zoho_item_id) acc[gName].zoho_item_id = p.zoho_item_id;
      return acc;
    }, {});
    return Object.values(groupMap);
  }, [baseFilteredProducts]);

  const [filterProductType, setFilterProductType] = useState('All');
  const [filterStock, setFilterStock] = useState('All');
  const [filterZoho, setFilterZoho] = useState('All');
  const [filterSource, setFilterSource] = useState('All');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const activeFilters = [];
  if (filterCategory !== 'All') activeFilters.push({ label: 'Category', value: filterCategory, type: 'category' });
  if (filterSupplier !== 'All') activeFilters.push({ label: 'Supplier', value: filterSupplier, type: 'supplier' });
  if (filterProductType !== 'All') activeFilters.push({ label: 'Product Type', value: filterProductType, type: 'productType' });
  if (filterStatus !== 'All') activeFilters.push({ label: 'Status', value: filterStatus, type: 'status' });
  if (filterWarehouse !== 'All') activeFilters.push({ label: 'Warehouse', value: filterWarehouse, type: 'warehouse' });
  if (filterStock !== 'All') activeFilters.push({ label: 'Stock', value: filterStock, type: 'stock' });
  if (filterZoho !== 'All') activeFilters.push({ label: 'Zoho', value: filterZoho, type: 'zoho' });
  if (filterSource !== 'All') activeFilters.push({ label: 'Source', value: filterSource, type: 'source' });

  const transformProductRow = (row) => ({
    id: row['ID'] || '',
    sku: row['SKU'] || '',
    productName: row['Name'] || '',
    category: row['Category'] || '',
    dosage: row['Dosage'] || '',
    guestVialPrice: parseFloat(row['Guest Vial Price']) || 0,
    guestKitPrice: parseFloat(row['Guest Kit Price']) || 0,
    proVialPrice: parseFloat(row['Pro Vial Price']) || 0,
    proKitPrice: parseFloat(row['Pro Kit Price']) || 0,
    stock: parseInt(row['Stock'], 10) || 0,
    warehouse: row['Warehouse'] || 'Poland',
    costPrice: parseFloat(row['Cost Price']) || 0,
    supplier: row['Supplier'] || '',
    isActive: String(row['Active']).toLowerCase() !== 'inactive',
    updatedAt: new Date().toISOString(),
    lastImportedAt: new Date().toISOString(),
  });

  const {
    importData,
    isImporting: importing,
    progress: importProgress,
    downloadTemplate
  } = useCsvImport({
    collectionName: 'products',
    transformRow: transformProductRow,
    onSuccess: () => fetchProducts()
  });

  const { mutateAsync: updateProduct, isPending: isUpdating, variables: updateVars } = useUpdateProduct();
  const { mutateAsync: deleteProduct, isPending: isDeleting, variables: deleteVars } = useDeleteProduct();
  const { mutateAsync: performBulkUpdate } = useBulkUpdateProduct();
  const savingProduct = (isUpdating ? updateVars?.id : null) || (isDeleting ? deleteVars : null);

  const setSelectedCatalogIds = useCatalogSelectionStore(state => state.setSelectedIds);

  const handleManageVisibility = (selectedIds) => {
    setSelectedCatalogIds(selectedIds);
    router.push('/admin/pricing-visibility');
  };

  const {
    selectedIds: selectedProductIds,
    handleSelectRow,
    clearSelection,
  } = useBulkSelection(filteredGroups.flatMap((g) => g.variants));

  async function handleExportCSV() {
    if (products.length === 0) return;
    const headers = [
      'ID', 'SKU', 'Name', 'Category', 'Dosage',
      'Guest Vial Price', 'Guest Kit Price', 'Pro Vial Price', 'Pro Kit Price',
      'Stock', 'Warehouse',
    ];
    if (!hideCosts && isAdmin) headers.push('Cost Price', 'Supplier');
    headers.push('Active');

    const csvContent = [
      headers.join(','),
      ...products.map((p) => {
        const row = [
          p.id,
          `"${p.sku || ''}"`,
          `"${p.name}"`,
          `"${p.category}"`,
          `"${p.dosage}"`,
          p.guestVialPrice,
          p.guestKitPrice,
          p.proVialPrice,
          p.proKitPrice,
          p.stock || 0,
          `"${p.warehouse || 'Poland'}"`,
        ];
        if (!hideCosts && isAdmin) row.push(p.costPrice || 0, `"${p.supplier || ''}"`);
        row.push(p.isActive === false ? 'inactive' : 'active');
        return row.join(',');
      }),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `catalog_${new Date().toISOString().split('T')[0]}.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handleDownloadTemplate = () => {
    downloadTemplate([
      'ID', 'SKU', 'Name', 'Category', 'Dosage',
      'Guest Vial Price', 'Guest Kit Price', 'Pro Vial Price', 'Pro Kit Price',
      'Stock', 'Warehouse', 'Cost Price', 'Supplier', 'Active'
    ], 'med_peptides_import_template.csv');
  };

  async function handleImportCSV(event) {
    if (readOnly) return;
    const file = event.target.files[0];
    if (!file) return;
    importData(file);
    event.target.value = null;
  }

  async function handleBulkAdjust() {
    if (readOnly) return;
    if (!bulkValue || isNaN(bulkValue)) {
      toast.warning('Please enter a valid number.');
      return;
    }

    const affectedProducts = products.filter(
      (p) =>
        (bulkCategory === 'All' || p.category === bulkCategory) &&
        (selectedProductIds.length === 0 || selectedProductIds.includes(p.id))
    );

    if (affectedProducts.length === 0) {
      toast.warning('No products found in the selected category/selection.');
      return;
    }

    if (!window.confirm(`Apply adjustment to ${affectedProducts.length} products?`)) return;

    try {
      const val = parseFloat(bulkValue);
      for (const p of affectedProducts) {
        let updates = {};
        if (bulkMode === 'percent') {
          const factor = 1 + val / 100;
          updates = {
            guestVialPrice: (p.guestVialPrice * factor).toFixed(2),
            guestKitPrice: (p.guestKitPrice * factor).toFixed(2),
            proVialPrice: (p.proVialPrice * factor).toFixed(2),
            proKitPrice: (p.proKitPrice * factor).toFixed(2),
          };
        } else if (bulkMode === 'fixed') {
          updates = {
            guestVialPrice: (p.guestVialPrice + val).toFixed(2),
            guestKitPrice: (p.guestKitPrice + val).toFixed(2),
            proVialPrice: (p.proVialPrice + val).toFixed(2),
            proKitPrice: (p.proKitPrice + val).toFixed(2),
          };
        }
        await updateDoc(doc(db, 'products', p.id), { ...updates, updatedAt: new Date().toISOString() });
      }
      toast.success('Bulk adjustment complete!');
      fetchProducts();
      setBulkMode(null);
      setBulkValue('');
      clearSelection();
    } catch (err) {
      console.error('Bulk adjust error:', err);
      toast.error('Error applying bulk adjustments.');
    }
  }

  async function handleAddToCatalog(catalog) {
    if (!selectedProductIds.length) return;
    try {
      const updatedCatalog = { ...catalog };
      let targetSection = updatedCatalog.sections && updatedCatalog.sections.length > 0
        ? updatedCatalog.sections[0]
        : { title: 'Products', products: [], protocols: [] };

      if (!updatedCatalog.sections || updatedCatalog.sections.length === 0) {
        updatedCatalog.sections = [targetSection];
      }

      const newProducts = [...(targetSection.products || [])];
      selectedProductIds.forEach((id) => {
        if (!newProducts.includes(id)) newProducts.push(id);
      });
      targetSection.products = newProducts;

      await catalogRepository.saveCatalog(updatedCatalog);
      toast.success(`Added ${selectedProductIds.length} products to ${catalog.title}`);
      setCatalogSelectMode(false);
      clearSelection();
    } catch (e) {
      console.error(e);
      toast.error('Failed to add to catalog');
    }
  }

  const categoriesToShow = allowedCategories.includes('All')
    ? [...new Set(products.map((p) => p.category).filter(Boolean))]
    : allowedCategories;

  const suppliersToShow = [...new Set(products.map((p) => p.supplier).filter(Boolean))];

  const columns = getAdminProductsColumns({
    isAdmin,
    user,
    readOnly,
    savingProduct,
    navigate: router.push,
    updateProduct,
    handleDeleteProduct: deleteProduct,
    handleScrapeCompetitor: async (p) => {
      toast.info(`Buscando precios para ${p.name}...`);
      try {
        const res = await fetch(`https://us-central1-med-peptides-app.cloudfunctions.net/forceScrapeCompetitors?productId=${encodeURIComponent(p.id)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: { productId: p.id } }),
        });
        if (!res.ok) throw new Error('Network error');
        toast.success(`Precios actualizados para ${p.name}`);
        router.push(`/admin/prices?sku=${encodeURIComponent(p.sku || '')}&productId=${encodeURIComponent(p.id || '')}`);
      } catch (error) {
        toast.error('Error al buscar precios.');
      }
    }
  });

  const renderExpandedRow = (groupItem) => {
    const targetProduct = groupItem.isGroup && groupItem.variants && groupItem.variants[0]
      ? groupItem.variants[0]
      : groupItem;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem', backgroundColor: 'var(--color-bg-subtle)' }}>
        {groupItem.isGroup && (
          <div>
            <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 600 }}>Available Variants</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {groupItem.variants.map((variant) => (
                <VariantRow key={variant.id} variant={variant} navigate={router.push} />
              ))}
            </div>
          </div>
        )}
        <div>
          <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 600 }}>General Information & Clinical Data</h4>
          <ProductMicrosite product={targetProduct} onUpdateProduct={fetchProducts} />
        </div>
      </div>
    );
  };

  const renderCustomFilters = () => (
    <>
      {categoriesToShow.length > 0 && (
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="gcp-filter-select">
          <option value="All">Category: All</option>
          {categoriesToShow.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      )}
      {suppliersToShow.length > 0 && (
        <select value={filterSupplier} onChange={(e) => setFilterSupplier(e.target.value)} className="gcp-filter-select">
          <option value="All">Supplier: All</option>
          {suppliersToShow.map(sup => <option key={sup} value={sup}>{sup}</option>)}
        </select>
      )}
      <select value={filterProductType} onChange={(e) => setFilterProductType(e.target.value)} className="gcp-filter-select">
        <option value="All">Type: All</option>
        <option value="Peptides">Peptides (Finished)</option>
        <option value="API Peptides">API Peptides</option>
        <option value="API Supplements">API Supplements</option>
        <option value="Other">Other</option>
      </select>
      <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="gcp-filter-select">
        <option value="All">Status: All</option>
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
      </select>
      <select value={filterWarehouse} onChange={(e) => setFilterWarehouse(e.target.value)} className="gcp-filter-select">
        <option value="All">Warehouse: All</option>
        <option value="Poland">Poland</option>
        <option value="UK">UK</option>
        <option value="USA">USA</option>
        <option value="Greece">Greece</option>
      </select>
    </>
  );

  const bulkActionsList = [
    { label: 'Add to Bulk Order', icon: ShoppingCart, onClick: () => { setProductsToBulkOrder(products.filter(p => selectedProductIds.includes(p.id))); setIsBulkOrderModalOpen(true); } },
    { label: 'Create Prescription', icon: ClipboardList, onClick: () => router.push(`/admin/prescriptions/new?items=${selectedProductIds.join(',')}`) },
    { label: 'Deactivate', icon: XCircle, onClick: () => { performBulkUpdate({ ids: selectedProductIds, updates: { isActive: false }, actionName: 'Deactivate' }); clearSelection(); } },
    { label: 'Export Selected', icon: Download, onClick: handleExportCSV },
    ...(!readOnly ? [
      { label: 'Bulk Price Update', icon: Percent, onClick: () => setBulkMode(!bulkMode) },
      { label: 'Include in Catalog', icon: BookOpen, onClick: () => {
          setCatalogSelectMode(true);
          setLoadingCatalogs(true);
          (isAdmin ? catalogRepository.getAllCatalogs() : catalogRepository.getCatalogsByOwner(user?.uid))
            .then(list => setMyCatalogs(list || []))
            .finally(() => setLoadingCatalogs(false));
        }
      },
      { label: 'Manage Visibility', icon: Eye, onClick: () => handleManageVisibility(selectedProductIds) }
    ] : [])
  ];

  return (
    <DataModule
      title="Items & Catalog"
      subtitle="Manage all products, APIs, supplements, and services"
      icon={Package}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Search catalog by name, sku, category (Algolia)..."
      searchLoading={algoliaLoading}
      resultCount={loading && !algoliaLoading ? undefined : filteredGroups.length}
      namespace="admin-products"
      data={filteredGroups}
      columns={columns}
      loading={loading}
      hasMore={hasMore}
      loadMore={loadMore}
      selectedIds={selectedProductIds}
      onSelectionChange={handleSelectRow}
      bulkActions={bulkActionsList}
      expandableRender={renderExpandedRow}
      emptyState={{
        title: "Catalog Empty",
        description: "No products match the selected filters or search criteria."
      }}
      kpis={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1rem' }}>
          {globalMetrics && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <MetricCard title="Total Products" value={globalMetrics.total} color="blue" />
              <MetricCard title="Active" value={globalMetrics.active} color="green" />
              <MetricCard title="Drafts" value={globalMetrics.drafts} color="amber" />
              <MetricCard title="Out of Stock" value={globalMetrics.outOfStock} color={globalMetrics.outOfStock > 0 ? "red" : "slate"} alert={globalMetrics.outOfStock > 0} />
            </div>
          )}
          <ProductContextSwitcher searchTerm={searchTerm} currentTab="products" onClear={() => setSearchTerm('')} />
          {isAdmin && !readOnly && (
            <>
              <PredictiveInventoryAlerts products={products} />
              <AdminSupplyNotifierWidget />
            </>
          )}
        </div>
      }
      filtersBar={
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {renderCustomFilters()}
          </div>
          {!readOnly && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleDownloadTemplate} className="gcp-btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                <Copy size={14} style={{ marginRight: '0.25rem' }} /> TEMPLATE
              </button>
              <label className="gcp-btn-primary" style={{ cursor: 'pointer', padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                <UploadCloud size={14} style={{ marginRight: '0.25rem' }} /> {importing ? `IMPORTING... ${importProgress}%` : 'IMPORT'}
                <input type="file" accept=".csv" onChange={handleImportCSV} style={{ display: 'none' }} disabled={importing} />
              </label>
            </div>
          )}
        </div>
      }
    >
      {/* Dynamic Panels inside DataModule content area */}
      {!readOnly && bulkMode && (
        <div style={{ padding: '1.5rem', margin: '0 1rem 1rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary)', backgroundColor: 'white', animation: 'slideDown 0.3s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowUpRight size={20} /> Bulk Price Adjustment
            </h3>
            <XCircle size={20} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setBulkMode(null)} />
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <Select label="Apply to Category:" value={bulkCategory} onChange={(e) => setBulkCategory(e.target.value)} options={[{ value: "All", label: "All Categories" }, ...categoriesToShow.map(cat => ({ value: cat, label: cat }))]} />
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Adjustment Type:</label>
              <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <button onClick={() => setBulkMode('percent')} style={{ padding: '0.6rem 1rem', border: 'none', backgroundColor: bulkMode === 'percent' ? 'var(--primary)' : 'white', color: bulkMode === 'percent' ? 'white' : 'var(--text-main)', cursor: 'pointer' }}>Percentage (%)</button>
                <button onClick={() => setBulkMode('fixed')} style={{ padding: '0.6rem 1rem', border: 'none', backgroundColor: bulkMode === 'fixed' ? 'var(--primary)' : 'white', color: bulkMode === 'fixed' ? 'white' : 'var(--text-main)', cursor: 'pointer' }}>Fixed Amount ($)</button>
              </div>
            </div>
            <div style={{ width: '200px' }}><TextField label={bulkMode === 'percent' ? 'Percentage (e.g. 5 or -10)' : 'Amount (e.g. 10 or -5)'} type="number" value={bulkValue} onChange={(e) => setBulkValue(e.target.value)} placeholder="0" /></div>
            <button onClick={handleBulkAdjust} className="gcp-btn-primary" style={{ padding: '0.6rem 1.5rem' }}>
              Apply to {products.filter((p) => (bulkCategory === 'All' || p.category === bulkCategory) && (selectedProductIds.length === 0 || selectedProductIds.includes(p.id))).length} Items
            </button>
          </div>
        </div>
      )}

      {!readOnly && catalogSelectMode && (
        <div style={{ padding: '1.5rem', margin: '0 1rem 1rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary)', backgroundColor: 'white', animation: 'slideDown 0.3s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={20} /> Include {selectedProductIds.length} Items in Catalog
            </h3>
            <XCircle size={20} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setCatalogSelectMode(false)} />
          </div>
          {loadingCatalogs ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading your catalogs...</div>
          ) : myCatalogs.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No catalogs found. You need to create a catalog first before adding items to it.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
              {myCatalogs.map((catalog) => (
                <div key={catalog.id} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', backgroundColor: 'var(--color-bg-subtle)' }} onClick={() => handleAddToCatalog(catalog)}>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>{catalog.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status: {catalog.status}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <BulkOrderSelectionModal isOpen={isBulkOrderModalOpen} onClose={() => { setIsBulkOrderModalOpen(false); clearSelection(); }} selectedProducts={productsToBulkOrder} />
      <CreateProductModal isOpen={isCreateProductModalOpen} onClose={() => setIsCreateProductModalOpen(false)} onCreated={() => { setIsCreateProductModalOpen(false); fetchProducts(); }} />
    </DataModule>
  );
}
