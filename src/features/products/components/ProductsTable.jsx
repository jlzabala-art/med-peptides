'use client';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { Copy, Download, UploadCloud, Percent, ArrowUpRight, XCircle, Eye, BookOpen, Package, ClipboardList, ShoppingCart } from '@/lib/icons';
import { doc, updateDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '../../../firebase';
import { toast } from 'react-hot-toast';
import notifier from '../../../services/NotificationService';

import { useAuth } from '../../../context/AuthContext';
import { useDrawer } from '../../../context/DrawerContext';

// UI Components
import DataModule from '../../../components/ui/DataModule';
import TextField from '../../../components/ui/TextField';
import Select from '../../../components/ui/Select';
import PaginationControl from '../../../components/common/PaginationControl';
import SupplierDetailDrawer from '../../../components/admin/suppliers/SupplierDetailDrawer';

// Admin Components
import AdminSupplyNotifierWidget from '../../../components/admin/gadgets/AdminSupplyNotifierWidget';
import PredictiveInventoryAlerts from '../../../components/admin/gadgets/PredictiveInventoryAlerts';
import ProductContextSwitcher from '../../../components/admin/ProductContextSwitcher';
import { useAdminProductsUIStore } from '../../../stores/adminProductsUIStore';
import { getAdminProductsColumns } from '../../../components/admin/AdminProductsColumns';
import VariantRow from '../../../components/admin/VariantRow';
import { Box, Activity, RefreshCw, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
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
const ProductFormDrawer = dynamic(() => import('../../../components/admin/ProductFormDrawer'));
const BulkOrderSelectionModal = dynamic(() => import('../../../components/admin/BulkOrders/BulkOrderSelectionModal'));

export default function ProductsTable({
  role = 'admin',
  initialProducts = [],
  globalMetrics = null,
  readOnly = false,
  hideCosts = false,
  allowedCategories = ['All'],
  isWholesaler = false,
  isSubTab = false,
}) {
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { openDrawer } = useDrawer();

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const basePanel = pathname?.split('/')[1] || 'admin';
  const initialSearch = searchParams.get('search') || '';
  const initialNew = searchParams.get('new') === 'true';

  const updateUrlParam = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'All') params.set(key, value);
    else params.delete(key);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const [linkedSupplier, setLinkedSupplier] = useState(null);

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
    productsToBulkOrder, setProductsToBulkOrder,
    inventoryMode
  } = useAdminProductsUIStore();

  const [bulkInventoryMode, setBulkInventoryMode] = useState(null); // 'set_stock', 'add_stock', 'set_min'
  const [bulkInventoryValue, setBulkInventoryValue] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [globalSuppliers, setGlobalSuppliers] = useState([]);

  useEffect(() => {
    getDocs(collection(db, 'wholesellers'))
      .then(snap => {
        const suppliers = snap.docs.map(d => ({
          id: d.id,
          name: d.data().name || d.data().companyName || d.id
        }));
        setGlobalSuppliers(suppliers.sort((a, b) => a.name.localeCompare(b.name)));
      })
      .catch(err => console.error('Error loading global suppliers for filter:', err));
  }, []);

  useEffect(() => {
    if (initialNew) setIsCreateProductModalOpen(true);
  }, [initialNew, setIsCreateProductModalOpen]);

  // Compat with URL filter field names
  const filterCategory = searchParams.get('category') || 'All';
  const setFilterCategory = (v) => updateUrlParam('category', v);
  const filterSupplier = searchParams.get('supplier') || 'All'; // Now this will hold the ID (e.g. 'pod-poland')
  const setFilterSupplier = (v) => updateUrlParam('supplier', v);
  const filterStatus = searchParams.get('isActive') || 'All';
  const setFilterStatus = (v) => updateUrlParam('isActive', v);
  const filterWarehouse = searchParams.get('warehouse') || 'All';
  const setFilterWarehouse = (v) => updateUrlParam('warehouse', v);
  const filterStock = searchParams.get('stock') || 'All';
  const setFilterStock = (v) => updateUrlParam('stock', v);
  const filterApiPlaceholder = searchParams.get('apiPlaceholder') || 'All';
  const setFilterApiPlaceholder = (v) => updateUrlParam('apiPlaceholder', v);

  // Firestore paginated data (with server-side filters pushed down)
  const { products, loading, loadingMore, fetchProducts, loadMore, hasMore, totalCount } =
    useProducts(allowedCategories, { 
      initialData: initialProducts, 
      pageSize: rowsPerPage,
      filters: {
        category: filterCategory,
        supplier: filterSupplier, // Pass the ID directly
        isActive: filterStatus,
        warehouse: filterWarehouse,
        apiPlaceholder: filterApiPlaceholder
      }
    });

  // Fuzzy search + filters (client-side for remaining results)
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

  useEffect(() => {
    // Sync URL state to useDataFilters state if needed
    setFilter('category', filterCategory);
    setFilter('supplier', filterSupplier); // Use filterSupplier which is now the ID
    setFilter('isActive', filterStatus);
    setFilter('warehouse', filterWarehouse);
    setFilter('apiPlaceholder', filterApiPlaceholder);
  }, [filterCategory, filterSupplier, filterStatus, filterWarehouse, filterApiPlaceholder, setFilter]);

  // Algolia Setup with Facets and Numeric Filters
  const facetFilters = [];
  if (filterCategory !== 'All') facetFilters.push(`category:${filterCategory}`);
  if (filterSupplier !== 'All') facetFilters.push(`supplier:${filterSupplier}`);
  if (filterWarehouse !== 'All') facetFilters.push(`warehouse:${filterWarehouse}`);
  if (filterStatus !== 'All') facetFilters.push(`isActive:${filterStatus === 'Active'}`);

  const numericFilters = [];
  if (filterStock === 'In Stock') numericFilters.push('stock_level > 0');
  if (filterStock === 'Out of Stock') numericFilters.push('stock_level = 0');

  const { hits: algoliaHits, isAlgoliaActive, loading: algoliaLoading, error: algoliaError } = useAlgoliaSearch(
    'products',
    searchTerm,
    { 
      hitsPerPage: 100, 
      facetFilters: facetFilters.length > 0 ? facetFilters : undefined,
      numericFilters: numericFilters.length > 0 ? numericFilters : undefined
    },
    300
  );

  const baseFilteredProducts = (() => {
    let localHits = filteredProducts;

    if (searchTerm && searchTerm.trim()) {
      localHits = localHits.filter(p => {
        const lower = searchTerm.toLowerCase();
        return (p.name && p.name.toLowerCase().includes(lower)) || 
               (p.sku && p.sku.toLowerCase().includes(lower)) || 
               (p.supplier && p.supplier.toLowerCase().includes(lower)) || 
               (p.supplierName && p.supplierName.toLowerCase().includes(lower));
      });
    }

    // Apply Stock Filter
    if (filterStock !== 'All') {
      localHits = localHits.filter(p => {
        const stock = p.stock_level || 0;
        const min = p.stock_min_threshold || 0;
        if (filterStock === 'Out of Stock') return stock === 0;
        if (filterStock === 'Low Stock') return stock > 0 && stock <= min;
        if (filterStock === 'In Stock') return stock > min;
        return true;
      });
    }

    if (!searchTerm || !searchTerm.trim()) {
      return localHits;
    }

    const algoliaMapped = isAlgoliaActive && !algoliaError
      ? algoliaHits.map(h => {
          const matched = products.find(p => p.id === (h.objectID || h.id));
          return matched ? { ...matched, _highlightResult: h._highlightResult } : { ...h, id: h.objectID || h.id };
        }).filter(Boolean)
      : [];

    if (isAlgoliaActive && !algoliaError) {
      if (algoliaLoading && algoliaHits.length === 0) return localHits;
      
      let combined = [...algoliaMapped];
      
      // Re-apply stock filter to algolia hits if needed
      if (filterStock !== 'All') {
        combined = combined.filter(p => {
          const stock = p.stock_level || 0;
          const min = p.stock_min_threshold || 0;
          if (filterStock === 'Out of Stock') return stock === 0;
          if (filterStock === 'Low Stock') return stock > 0 && stock <= min;
          if (filterStock === 'In Stock') return stock > min;
          return true;
        });
      }

      const algoliaIds = new Set(combined.map(p => p.id));
      for (const p of localHits) {
        if (!algoliaIds.has(p.id)) combined.push(p);
      }
      return combined;
    }
    return localHits;
  })();

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
    selectedArray: selectedProductIds,
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

    notifier.confirmCritical(`Apply adjustment to ${affectedProducts.length} products?`, async () => {
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
    });
  }

  async function handleBulkInventoryAdjust() {
    if (readOnly) return;
    if (bulkInventoryValue === '' || isNaN(bulkInventoryValue)) {
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

    notifier.confirmCritical(`Apply inventory adjustment to ${affectedProducts.length} products?`, async () => {
      try {
        const val = parseInt(bulkInventoryValue, 10);
        for (const p of affectedProducts) {
          let updates = {};
          if (bulkInventoryMode === 'set_stock') {
            updates = { stock_level: val };
          } else if (bulkInventoryMode === 'add_stock') {
            updates = { stock_level: (p.stock_level || 0) + val };
          } else if (bulkInventoryMode === 'set_min') {
            updates = { stock_min_threshold: val };
          }
          await updateDoc(doc(db, 'products', p.id), { ...updates, updatedAt: new Date().toISOString() });
        }
        toast.success('Bulk inventory adjustment complete!');
        fetchProducts();
        setBulkInventoryMode(null);
        setBulkInventoryValue('');
        clearSelection();
      } catch (err) {
        console.error('Bulk inventory error:', err);
        toast.error('Error applying bulk inventory adjustments.');
      }
    });
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

  const suppliersToShow = [...new Set([...products.map((p) => p.supplier).filter(Boolean), ...globalSuppliers])].sort();

  const baseColumns = useMemo(() => getAdminProductsColumns({
    isAdmin,
    user,
    readOnly,
    savingProduct,
    navigate: router.push,
    updateProduct,
    handleDeleteProduct: deleteProduct,
    inventoryMode,
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
  }), [isAdmin, user, readOnly, savingProduct, router, updateProduct, deleteProduct, inventoryMode]);

  const columns = useMemo(() => {
    return baseColumns.map(col => {
      if (col.key === 'supplier') {
        return {
          ...col,
          render: (row) => {
            const supplierName = row.supplier || row['Supplier'];
            if (!supplierName) return '-';
            return (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setLinkedSupplier({ name: supplierName, companyName: supplierName });
                }}
                style={{ 
                  background: 'none', border: 'none', padding: 0, 
                  color: 'var(--primary)', cursor: 'pointer', 
                  fontWeight: 600, textDecoration: 'underline' 
                }}
              >
                {supplierName}
              </button>
            );
          }
        };
      }
      return col;
    });
  }, [baseColumns]);

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

  // Custom filters are now integrated into DataModule's filterOptions

  const bulkActionsList = [
    { label: 'Add to Bulk Order', icon: ShoppingCart, onClick: () => { setProductsToBulkOrder(products.filter(p => selectedProductIds.includes(p.id))); setIsBulkOrderModalOpen(true); } },
    { label: 'New Prescription', icon: ClipboardList, onClick: () => {
        const selectedProducts = products.filter(p => selectedProductIds.includes(p.id));
        openDrawer('rx-builder', 'new', { initialProducts: selectedProducts });
      }
    },
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
      { label: 'Manage Visibility', icon: Eye, onClick: () => handleManageVisibility(selectedProductIds) },
      ...(inventoryMode ? [
        { label: 'Bulk Inventory Update', icon: Package, onClick: () => setBulkInventoryMode('set_stock') }
      ] : [])
    ] : [])
  ];

  return (
    <DataModule
      title="Items & Catalog"
      subtitle="Manage all products, APIs, supplements, and services"
      icon={Package}
      hideHeader={isSubTab}
      isSubModule={isSubTab}
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
      filterOptions={[
        ...(categoriesToShow.length > 0 ? [{
          key: 'category',
          label: 'Category',
          value: filterCategory === 'All' ? '' : filterCategory,
          options: [{ label: 'All Categories', value: '' }, ...categoriesToShow.map(c => ({ label: c, value: c }))],
          onChange: (v) => setFilterCategory(v || 'All')
        }] : []),
        ...(globalSuppliers.length > 0 ? [{
          key: 'supplier',
          label: 'Supplier',
          value: filterSupplier === 'All' ? '' : filterSupplier,
          options: [
            { label: 'All Suppliers', value: '' },
            ...globalSuppliers.map(s => ({ label: s.name, value: s.id }))
          ],
          onChange: (v) => setFilterSupplier(v || 'All')
        }] : []),
        {
          key: 'status',
          label: 'Status',
          value: filterStatus === 'All' ? '' : filterStatus,
          options: [
            { label: 'All Statuses', value: '' },
            { label: 'Active', value: 'Active' },
            { label: 'Inactive', value: 'Inactive' }
          ],
          onChange: (v) => setFilterStatus(v || 'All')
        },
        {
          key: 'warehouse',
          label: 'Warehouse',
          value: filterWarehouse === 'All' ? '' : filterWarehouse,
          options: [
            { label: 'All Warehouses', value: '' },
            { label: 'Poland', value: 'Poland' },
            { label: 'UK', value: 'UK' },
            { label: 'USA', value: 'USA' },
            { label: 'Greece', value: 'Greece' }
          ],
          onChange: (v) => setFilterWarehouse(v || 'All')
        },
        ...(inventoryMode ? [{
          key: 'stock',
          label: 'Stock Level',
          value: filterStock === 'All' ? '' : filterStock,
          options: [
            { label: 'All Stock Levels', value: '' },
            { label: 'In Stock', value: 'In Stock' },
            { label: 'Low Stock', value: 'Low Stock' },
            { label: 'Out of Stock', value: 'Out of Stock' }
          ],
          onChange: (v) => setFilterStock(v || 'All')
        }] : []),
        {
          key: 'apiPlaceholder',
          label: 'API Type',
          value: filterApiPlaceholder === 'All' ? '' : filterApiPlaceholder,
          options: [
            { label: 'All Items', value: '' },
            { label: 'Only APIs', value: 'Only APIs' },
            { label: 'Real Products', value: 'Real Products' }
          ],
          onChange: (v) => setFilterApiPlaceholder(v || 'All')
        }
      ]}
      filters={[
        filterCategory !== 'All' && { key: 'category', label: 'Category', value: filterCategory, onRemove: () => setFilterCategory('All') },
        filterSupplier !== 'All' && { key: 'supplier', label: 'Supplier', value: filterSupplier, onRemove: () => setFilterSupplier('All') },
        filterStatus !== 'All' && { key: 'status', label: 'Status', value: filterStatus, onRemove: () => setFilterStatus('All') },
        filterWarehouse !== 'All' && { key: 'warehouse', label: 'Warehouse', value: filterWarehouse, onRemove: () => setFilterWarehouse('All') },
        filterStock !== 'All' && { key: 'stock', label: 'Stock Level', value: filterStock, onRemove: () => setFilterStock('All') },
        filterApiPlaceholder !== 'All' && { key: 'apiPlaceholder', label: 'API Type', value: filterApiPlaceholder, onRemove: () => setFilterApiPlaceholder('All') }
      ].filter(Boolean)}
      emptyState={{
        title: "Catalog Empty",
        description: "No products match the selected filters or search criteria."
      }}
      kpis={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1rem', minWidth: 0 }}>
          {globalMetrics && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <MetricCard 
                title="Total Products" 
                value={globalMetrics.total} 
                color="var(--color-primary)" 
                icon={Package} 
                onClick={() => { setFilterStatus('All'); setFilterStock('All'); }}
              />
              <MetricCard 
                title="Active" 
                value={globalMetrics.active} 
                color="var(--color-success)" 
                icon={CheckCircle} 
                onClick={() => { setFilterStatus('active'); }}
              />
              <MetricCard 
                title="Drafts" 
                value={globalMetrics.drafts} 
                color="var(--color-warning)" 
                icon={Clock} 
                onClick={() => { setFilterStatus('draft'); }}
              />
              <MetricCard 
                title="Out of Stock" 
                value={globalMetrics.outOfStock} 
                color={globalMetrics.outOfStock > 0 ? "var(--color-danger)" : "var(--color-text-muted)"} 
                alert={globalMetrics.outOfStock > 0} 
                icon={AlertTriangle} 
                onClick={() => { setFilterStock('Out of Stock'); }}
              />
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
      {...(!readOnly ? {
        filtersBar: (
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 1rem 1rem 1rem', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleDownloadTemplate} className="gcp-btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                <Copy size={14} style={{ marginRight: '0.25rem' }} /> TEMPLATE
              </button>
              <label className="gcp-btn-primary" style={{ cursor: 'pointer', padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                <UploadCloud size={14} style={{ marginRight: '0.25rem' }} /> {importing ? `IMPORTING... ${importProgress}%` : 'IMPORT'}
                <input type="file" accept=".csv" onChange={handleImportCSV} style={{ display: 'none' }} disabled={importing} />
              </label>
            </div>
          </div>
        )
      } : {})}
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

      {!readOnly && bulkInventoryMode && (
        <div style={{ padding: '1.5rem', margin: '0 1rem 1rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary)', backgroundColor: 'white', animation: 'slideDown 0.3s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package size={20} /> Bulk Inventory Adjustment
            </h3>
            <XCircle size={20} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setBulkInventoryMode(null)} />
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <Select label="Apply to Category:" value={bulkCategory} onChange={(e) => setBulkCategory(e.target.value)} options={[{ value: "All", label: "All Categories" }, ...categoriesToShow.map(cat => ({ value: cat, label: cat }))]} />
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Action:</label>
              <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <button onClick={() => setBulkInventoryMode('set_stock')} style={{ padding: '0.6rem 1rem', border: 'none', backgroundColor: bulkInventoryMode === 'set_stock' ? 'var(--primary)' : 'white', color: bulkInventoryMode === 'set_stock' ? 'white' : 'var(--text-main)', cursor: 'pointer' }}>Set Stock</button>
                <button onClick={() => setBulkInventoryMode('add_stock')} style={{ padding: '0.6rem 1rem', border: 'none', backgroundColor: bulkInventoryMode === 'add_stock' ? 'var(--primary)' : 'white', color: bulkInventoryMode === 'add_stock' ? 'white' : 'var(--text-main)', cursor: 'pointer' }}>Add/Remove Stock</button>
                <button onClick={() => setBulkInventoryMode('set_min')} style={{ padding: '0.6rem 1rem', border: 'none', backgroundColor: bulkInventoryMode === 'set_min' ? 'var(--primary)' : 'white', color: bulkInventoryMode === 'set_min' ? 'white' : 'var(--text-main)', cursor: 'pointer' }}>Set Min Threshold</button>
              </div>
            </div>
            <div style={{ width: '200px' }}><TextField label={bulkInventoryMode === 'add_stock' ? 'Amount to adjust (+/-)' : 'New Value'} type="number" value={bulkInventoryValue} onChange={(e) => setBulkInventoryValue(e.target.value)} placeholder="0" /></div>
            <button onClick={handleBulkInventoryAdjust} className="gcp-btn-primary" style={{ padding: '0.6rem 1.5rem' }}>
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
      <ProductFormDrawer isOpen={isCreateProductModalOpen} onClose={() => setIsCreateProductModalOpen(false)} onCreated={() => { setIsCreateProductModalOpen(false); fetchProducts(); }} />
      <SupplierDetailDrawer isOpen={!!linkedSupplier} onClose={() => setLinkedSupplier(null)} supplier={linkedSupplier} />
    </DataModule>
  );
}
