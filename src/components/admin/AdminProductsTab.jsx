import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search, Copy, Download, UploadCloud, Percent, ArrowUpRight,
  XCircle, EyeOff, Eye, Trash2, BookOpen, Plus,
  ChevronDown, ChevronUp, Package, ClipboardList, Bot,
  ShoppingCart, MessageSquare, DollarSign, Activity,
  FileText, LineChart, Stethoscope, LayoutGrid, List,
} from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useNavigate as useNav, useSearchParams as useSP } from 'react-router-dom';

// UI Components
import DataTable from '../ui/DataTable';
import AppActionGroup from '../ui/AppActionGroup';
import AppStatusToggle from '../ui/AppStatusToggle';
import AppFilterBar from '../ui/AppFilterBar';
import AppEntityCell from '../ui/AppEntityCell';
import GlobalSearchBar from '../ui/GlobalSearchBar';
import DataTableSkeleton from '../ui/skeletons/DataTableSkeleton';
import GridSkeleton from '../ui/skeletons/GridSkeleton';

// Admin Components
import AdminSupplyNotifierWidget from './gadgets/AdminSupplyNotifierWidget';
import PredictiveInventoryAlerts from './gadgets/PredictiveInventoryAlerts';
import ProductContextSwitcher from './ProductContextSwitcher';
import InlineEditField from '../ui/InlineEditField';
import AdminPageHeader from './AdminPageHeader';
import { useAdminProductsUIStore } from '../../stores/adminProductsUIStore';
import { getAdminProductsColumns } from './AdminProductsColumns';
import AdminProductsBatchActions from './AdminProductsBatchActions';
import VariantRow from './VariantRow';
import ProductGridCard from './ProductGridCard';

// Hooks
import { useToast } from '../../hooks/useToast';
import { catalogRepository } from '../../repositories/catalogRepository';
import { useDataFilters } from '../../hooks/ui/useDataFilters';
import { useProducts } from '../../hooks/admin/useProducts';
import { useBulkSelection } from '../../hooks/admin/useBulkSelection';
import { useUpdateProduct, useDeleteProduct, useBulkUpdateProduct } from '../../hooks/admin/useProductMutations';
import { useCsvImport } from '../../hooks/data/useCsvImport';

// Lazy-loaded heavy modals
const ProductMicrosite = React.lazy(() => import('./products/ProductMicrosite'));
const CreateProductModal = React.lazy(() => import('./CreateProductModal'));
const BulkOrderSelectionModal = React.lazy(() => import('./BulkOrders/BulkOrderSelectionModal'));



export default function AdminProductsTab({
  readOnly = false,
  hideCosts = false,
  allowedCategories = ['All'],
  isWholesaler = false,
}) {
  const { isAdmin, user, userRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const [viewMode, setViewMode] = useState(window.innerWidth < 1024 ? 'grid' : 'list');

  useEffect(() => {
    if (initialNew) setIsCreateProductModalOpen(true);
  }, [initialNew, setIsCreateProductModalOpen]);

  // Firestore paginated data (never loads all docs at once)
  const { products, loading, loadingMore, fetchProducts, loadMore, hasMore, totalCount } =
    useProducts(allowedCategories);

  // Fuzzy search + filters (client-side, on already-loaded page)
  const {
    searchTerm,
    setSearchTerm,
    filters,
    setFilter,
    clearFilters,
    activeFilterCount,
    paginatedData: paginatedProducts,
    filteredData: filteredProducts,
    totalItems,
    totalPages,
    currentPage,
    setCurrentPage,
    pageSize: rowsPerPage,
    setPageSize: setRowsPerPage,
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
    pageSize: 20,
    initialSearch: initialSearch,
  });

  // Group flat product list by name for table display
  const filteredGroups = React.useMemo(() => {
    const groupMap = filteredProducts.reduce((acc, p) => {
      const gName = p.name || 'Unnamed';
      if (!acc[gName]) {
        acc[gName] = {
          name: gName, category: p.category || '', supplier: p.supplier || '',
          warehouse: p.warehouse || '', totalStock: 0, isActive: false,
          variants: [], zoho_item_id: null, sku: null,
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
  }, [filteredProducts]);

  // Compat with old filter field names
  const filterCategory = filters.category;
  const setFilterCategory = (v) => setFilter('category', v);
  const filterSupplier = filters.supplier;
  const setFilterSupplier = (v) => setFilter('supplier', v);
  const filterStatus = filters.isActive;
  const setFilterStatus = (v) => setFilter('isActive', v);
  const filterWarehouse = filters.warehouse;
  const setFilterWarehouse = (v) => setFilter('warehouse', v);
  // Keeping these for existing filter UI
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
  const { mutateAsync: performBulkUpdate, isPending: isBulkUpdating } = useBulkUpdateProduct();
  const savingProduct = (isUpdating ? updateVars?.id : null) || (isDeleting ? deleteVars : null);

  const {
    selectedIds: selectedProductIds,
    handleSelectAll,
    handleSelectRow,
    clearSelection,
    isAllSelected,
  } = useBulkSelection(filteredGroups.flatMap((g) => g.variants));

  useEffect(() => {
    const searchVal = searchParams.get('search');
    if (searchVal !== null) {
      setSearchTerm(searchVal);
    }
  }, [searchParams]);


  async function handleMigrate() {
    if (readOnly) return;
    setMigrating(true);
    toast.info('Migration already completed. Products live in Firestore.');
    setMigrating(false);
  }

  const handleExportCSV = () => {
    if (products.length === 0) return;

    const headers = [
      'ID',
      'SKU',
      'Name',
      'Category',
      'Dosage',
      'Guest Vial Price',
      'Guest Kit Price',
      'Pro Vial Price',
      'Pro Kit Price',
      'Stock',
      'Warehouse',
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
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `catalog_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadTemplate = () => {
    const headers = [
      'ID',
      'SKU',
      'Name',
      'Category',
      'Dosage',
      'Guest Vial Price',
      'Guest Kit Price',
      'Pro Vial Price',
      'Pro Kit Price',
      'Stock',
      'Warehouse',
      'Cost Price',
      'Supplier',
      'Active',
    ];
    downloadTemplate(headers, 'med_peptides_import_template.csv');
  };

  async function handleImportCSV(event) {
    if (readOnly) return;
    const file = event.target.files[0];
    if (!file) return;
    importData(file);
    // Reset file input so same file can be uploaded again if needed
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

    setLoading(true);
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

        const productRef = doc(db, 'products', p.id);
        await updateDoc(productRef, {
          ...updates,
          updatedAt: new Date().toISOString(),
        });
      }
      toast.success('Bulk adjustment complete!');
      fetchProducts();
      setBulkMode(null);
      setBulkValue('');
      clearSelection();
    } catch (err) {
      console.error('Bulk adjust error:', err);
      toast.error('Error applying bulk adjustments.');
    } finally {
      setLoading(false);
    }
  }

  async function handleOpenCatalogSelect() {
    setCatalogSelectMode(true);
    setLoadingCatalogs(true);
    try {
      const list = isAdmin
        ? await catalogRepository.getAllCatalogs()
        : await catalogRepository.getCatalogsByOwner(user?.uid);
      setMyCatalogs(list || []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load catalogs');
    } finally {
      setLoadingCatalogs(false);
    }
  }

  async function handleAddToCatalog(catalog) {
    if (!selectedProductIds.length) return;
    try {
      const updatedCatalog = { ...catalog };
      let targetSection = null;
      if (updatedCatalog.sections && updatedCatalog.sections.length > 0) {
        targetSection = updatedCatalog.sections[0];
      } else {
        targetSection = { title: 'Products', products: [], protocols: [] };
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

  // Determine which categories to show in filter dropdown
  const categoriesToShow = allowedCategories.includes('All')
    ? [...new Set(products.map((p) => p.category).filter(Boolean))]
    : allowedCategories;

  const suppliersToShow = [...new Set(products.map((p) => p.supplier).filter(Boolean))];

  const columns = getAdminProductsColumns({
    isAdmin,
    user,
    readOnly,
    savingProduct,
    navigate,
    updateProduct,
    handleDeleteProduct: deleteProduct,
    handleScrapeCompetitor
  });

  async function handleScrapeCompetitor(p) {
    toast.info(`Buscando precios para ${p.name}...`);
    try {
      // Using fetch directly since forceScrapeCompetitors is an onRequest (HTTP) function
      const url = `https://us-central1-med-peptides-app.cloudfunctions.net/forceScrapeCompetitors?productId=${encodeURIComponent(p.id)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { productId: p.id } }),
      });

      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();

      toast.success(`Precios actualizados para ${p.name}`);
      // Navigate to pricing tab as requested
      navigate(
        `/admin/prices?sku=${encodeURIComponent(p.sku || '')}&productId=${encodeURIComponent(p.id || '')}`
      );
    } catch (error) {
      console.error('Error scraping:', error);
      toast.error('Error al buscar precios.');
    }
  };

  const handleAddToBulkOrder = async (selectedIds) => {
    const selectedProducts = products.filter((p) => selectedIds.includes(p.id));
    setProductsToBulkOrder(selectedProducts);
    setIsBulkOrderModalOpen(true);
  };

  const handleCreatePrescription = (selectedIds) => {
    // You could pass IDs to the state or query params
    navigate(`/prescriptions/new?source=Selected Items&items=${selectedIds.join(',')}`);
  };

  const handleDeactivateSelected = async (selectedIds) => {
    try {
      await performBulkUpdate({ ids: selectedIds, updates: { isActive: false }, actionName: 'Deactivate' });
      clearSelection();
    } catch (error) {
      // Error handled by mutation
    }
  };


  const renderExpandedRow = (groupItem) => {
    const targetProduct = groupItem.isGroup
      ? groupItem.variants && groupItem.variants[0]
        ? groupItem.variants[0]
        : groupItem
      : groupItem;

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          padding: '1rem',
          backgroundColor: 'var(--color-bg-subtle)',
        }}
      >
        {groupItem.isGroup && (
          <div>
            <h4
              style={{
                margin: '0 0 1rem 0',
                color: 'var(--text-main)',
                fontSize: '0.95rem',
                fontWeight: 600,
              }}
            >
              Available Variants
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {groupItem.variants.map((variant) => (
                <VariantRow key={variant.id} variant={variant} navigate={navigate} />
              ))}
            </div>
          </div>
        )}

        <div>
          <h4
            style={{
              margin: '0 0 1rem 0',
              color: 'var(--text-main)',
              fontSize: '0.95rem',
              fontWeight: 600,
            }}
          >
            General Information & Clinical Data
          </h4>
          <ProductMicrosite product={targetProduct} onUpdateProduct={fetchProducts} />
        </div>
      </div>
    );
  };



  const handleFilterRemove = (filter) => {
    if (filter.type === 'category') setFilterCategory('All');
    if (filter.type === 'supplier') setFilterSupplier('All');
    if (filter.type === 'productType') setFilterProductType('All');
    if (filter.type === 'status') setFilterStatus('All');
    if (filter.type === 'warehouse') setFilterWarehouse('All');
    if (filter.type === 'stock') setFilterStock('All');
    if (filter.type === 'zoho') setFilterZoho('All');
  };

  const renderCustomFilters = () => (
    <>
      {categoriesToShow.length > 0 && (
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{
            height: '24px',
            padding: '0 1rem 0 0.4rem',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            backgroundColor: filterCategory === 'All' ? 'white' : 'var(--primary-light)',
            color: filterCategory === 'All' ? 'var(--text-main)' : 'var(--primary)',
            fontSize: '0.7rem',
            fontWeight: 500,
            outline: 'none',
            cursor: 'pointer',
            appearance: 'none',
          }}
        >
          <option value="All">Category: All</option>
          {categoriesToShow.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      )}
      {suppliersToShow.length > 0 && (
        <select
          value={filterSupplier}
          onChange={(e) => setFilterSupplier(e.target.value)}
          style={{
            height: '24px',
            padding: '0 1rem 0 0.4rem',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            backgroundColor: filterSupplier === 'All' ? 'white' : 'var(--primary-light)',
            color: filterSupplier === 'All' ? 'var(--text-main)' : 'var(--primary)',
            fontSize: '0.7rem',
            fontWeight: 500,
            outline: 'none',
            cursor: 'pointer',
            appearance: 'none',
          }}
        >
          <option value="All">Supplier: All</option>
          {suppliersToShow.map((sup) => (
            <option key={sup} value={sup}>
              {sup}
            </option>
          ))}
        </select>
      )}
      <select
        value={filterProductType}
        onChange={(e) => setFilterProductType(e.target.value)}
        style={{
          height: '24px',
          padding: '0 1rem 0 0.4rem',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          backgroundColor: filterProductType === 'All' ? 'white' : 'var(--primary-light)',
          color: filterProductType === 'All' ? 'var(--text-main)' : 'var(--primary)',
          fontSize: '0.7rem',
          fontWeight: 500,
          outline: 'none',
          cursor: 'pointer',
          appearance: 'none',
        }}
      >
        <option value="All">Type: All</option>
        <option value="Peptides">Peptides (Finished)</option>
        <option value="API Peptides">API Peptides</option>
        <option value="API Supplements">API Supplements</option>
        <option value="Other">Other</option>
      </select>
      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        style={{
          height: '24px',
          padding: '0 1rem 0 0.4rem',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          backgroundColor: filterStatus === 'All' ? 'white' : 'var(--primary-light)',
          color: filterStatus === 'All' ? 'var(--text-main)' : 'var(--primary)',
          fontSize: '0.7rem',
          fontWeight: 500,
          outline: 'none',
          cursor: 'pointer',
          appearance: 'none',
        }}
      >
        <option value="All">Status: All</option>
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
      </select>
      <select
        value={filterZoho}
        onChange={(e) => setFilterZoho(e.target.value)}
        style={{
          height: '24px',
          padding: '0 1rem 0 0.4rem',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          backgroundColor: filterZoho === 'All' ? 'white' : 'var(--primary-light)',
          color: filterZoho === 'All' ? 'var(--text-main)' : 'var(--primary)',
          fontSize: '0.7rem',
          fontWeight: 500,
          outline: 'none',
          cursor: 'pointer',
          appearance: 'none',
        }}
      >
        <option value="All">Zoho Sync: All</option>
        <option value="Synced">Synced</option>
        <option value="Not Synced">Not Synced</option>
      </select>
      <select
        value={filterSource}
        onChange={(e) => setFilterSource(e.target.value)}
        style={{
          height: '24px',
          padding: '0 1rem 0 0.4rem',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          backgroundColor: filterSource === 'All' ? 'white' : 'var(--primary-light)',
          color: filterSource === 'All' ? 'var(--text-main)' : 'var(--primary)',
          fontSize: '0.7rem',
          fontWeight: 500,
          outline: 'none',
          cursor: 'pointer',
          appearance: 'none',
        }}
      >
        <option value="All">Source: All</option>
        <option value="Recently Imported">Recently Imported (24h)</option>
      </select>
      <select
        value={filterStock}
        onChange={(e) => setFilterStock(e.target.value)}
        style={{
          height: '24px',
          padding: '0 1rem 0 0.4rem',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          backgroundColor: filterStock === 'All' ? 'white' : 'var(--primary-light)',
          color: filterStock === 'All' ? 'var(--text-main)' : 'var(--primary)',
          fontSize: '0.7rem',
          fontWeight: 500,
          outline: 'none',
          cursor: 'pointer',
          appearance: 'none',
        }}
      >
        <option value="All">Stock: All</option>
        <option value="In Stock">Healthy (20+)</option>
        <option value="Low Stock">Low (&lt;20)</option>
        <option value="Out of Stock">Out of Stock</option>
      </select>
      <select
        value={filterWarehouse}
        onChange={(e) => setFilterWarehouse(e.target.value)}
        style={{
          height: '24px',
          padding: '0 1rem 0 0.4rem',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          backgroundColor: filterWarehouse === 'All' ? 'white' : 'var(--primary-light)',
          color: filterWarehouse === 'All' ? 'var(--text-main)' : 'var(--primary)',
          fontSize: '0.7rem',
          fontWeight: 500,
          outline: 'none',
          cursor: 'pointer',
          appearance: 'none',
        }}
      >
        <option value="All">Warehouse: All</option>
        <option value="Poland">Poland</option>
        <option value="UK">UK</option>
        <option value="USA">USA</option>
        <option value="Greece">Greece</option>
      </select>
    </>
  );

  return (
    <div style={{ marginBottom: '2rem' }}>
      <AdminPageHeader
        title="Items & Catalog"
        subtitle="Manage all products, APIs, supplements, and services"
        icon={Package}
      />

      {/* Global Search Bar — prominent position, fuzzy search with scoring */}
      <div style={{ marginBottom: '1rem' }}>
        <GlobalSearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by name, SKU, category, dosage, supplier..."
          resultCount={loading ? undefined : totalItems}
          isLoading={loadingMore}
          namespace="admin-products"
          size="lg"
        />
      </div>

      <ProductContextSwitcher
        searchTerm={searchTerm}
        currentTab="products"
        onClear={() => setSearchTerm('')}
      />

      {isAdmin && !readOnly && (
        <div
          style={{
            marginBottom: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          <PredictiveInventoryAlerts products={products} />
          <AdminSupplyNotifierWidget />
        </div>
      )}

      {/* <UniformKPIs products={products} /> */}
      {/* <SmartChips activeChip={activeChip} setActiveChip={setActiveChip} /> */}

      {/* Table Action Toolbar */}
      {!readOnly && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem 1rem',
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--border)',
            borderBottom: 'none',
            borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>
            Items ({filteredGroups.reduce((acc, g) => acc + g.variants.length, 0)} items in{' '}
            {filteredGroups.length} families)
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', background: 'var(--color-bg-subtle)', borderRadius: '8px', padding: '0.2rem', marginRight: '0.5rem' }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0.4rem', borderRadius: '6px', border: 'none', cursor: 'pointer',
                  background: viewMode === 'grid' ? 'white' : 'transparent',
                  color: viewMode === 'grid' ? 'var(--primary)' : 'var(--text-muted)',
                  boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s'
                }}
                title="Grid View"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0.4rem', borderRadius: '6px', border: 'none', cursor: 'pointer',
                  background: viewMode === 'list' ? 'white' : 'transparent',
                  color: viewMode === 'list' ? 'var(--primary)' : 'var(--text-muted)',
                  boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s'
                }}
                title="List View"
              >
                <List size={18} />
              </button>
            </div>
            <button
              onClick={handleDownloadTemplate}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                fontWeight: 500,
                color: '#1a73e8',
                backgroundColor: 'transparent',
                border: '1px solid transparent',
                cursor: 'pointer',
                padding: '0.4rem 0.8rem',
                borderRadius: '4px',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = 'rgba(26,115,232,0.04)')
              }
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Copy size={16} /> TEMPLATE
            </button>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                fontWeight: 500,
                color: 'white',
                backgroundColor: '#1a73e8',
                border: '1px solid transparent',
                cursor: 'pointer',
                padding: '0.4rem 1rem',
                margin: 0,
                borderRadius: '4px',
                boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
                transition: 'background-color 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1765cc';
                e.currentTarget.style.boxShadow =
                  '0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1a73e8';
                e.currentTarget.style.boxShadow =
                  '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)';
              }}
            >
              <UploadCloud size={16} /> {importing ? `IMPORTING... ${importProgress}%` : 'IMPORT'}
              <input
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                style={{ display: 'none' }}
                disabled={importing}
              />
            </label>
          </div>
        </div>
      )}

      {/* Bulk Adjustment Panel */}
      {!readOnly && bulkMode && (
        <div
          style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--primary)',
            marginBottom: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
            animation: 'slideDown 0.3s ease-out',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: '1.1rem',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <ArrowUpRight size={20} /> Bulk Price Adjustment
            </h3>
            <XCircle
              size={20}
              style={{ cursor: 'pointer', color: 'var(--text-muted)' }}
              onClick={() => setBulkMode(null)}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  marginBottom: '0.5rem',
                  color: 'var(--text-muted)',
                }}
              >
                Apply to Category:
              </label>
              <select
                value={bulkCategory}
                onChange={(e) => setBulkCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                }}
              >
                <option value="All">All Categories</option>
                {categoriesToShow.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  marginBottom: '0.5rem',
                  color: 'var(--text-muted)',
                }}
              >
                Adjustment Type:
              </label>
              <div
                style={{
                  display: 'flex',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => setBulkMode('percent')}
                  style={{
                    padding: '0.6rem 1rem',
                    border: 'none',
                    backgroundColor: bulkMode === 'percent' ? 'var(--primary)' : 'white',
                    color: bulkMode === 'percent' ? 'white' : 'var(--text-main)',
                    cursor: 'pointer',
                  }}
                >
                  Percentage (%)
                </button>
                <button
                  onClick={() => setBulkMode('fixed')}
                  style={{
                    padding: '0.6rem 1rem',
                    border: 'none',
                    backgroundColor: bulkMode === 'fixed' ? 'var(--primary)' : 'white',
                    color: bulkMode === 'fixed' ? 'white' : 'var(--text-main)',
                    cursor: 'pointer',
                  }}
                >
                  Fixed Amount ($)
                </button>
              </div>
            </div>
            <div style={{ width: '150px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  marginBottom: '0.5rem',
                  color: 'var(--text-muted)',
                }}
              >
                {bulkMode === 'percent' ? 'Percentage (e.g. 5 or -10)' : 'Amount (e.g. 10 or -5)'}
              </label>
              <input
                type="number"
                value={bulkValue}
                onChange={(e) => setBulkValue(e.target.value)}
                placeholder="0"
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                }}
              />
            </div>
            <button
              onClick={handleBulkAdjust}
              className="btn btn-primary"
              style={{ padding: '0.6rem 1.5rem' }}
            >
              Apply to{' '}
              {
                products.filter(
                  (p) =>
                    (bulkCategory === 'All' || p.category === bulkCategory) &&
                    (selectedProductIds.length === 0 || selectedProductIds.includes(p.id))
                ).length
              }{' '}
              Items
            </button>
          </div>
        </div>
      )}

      {/* Catalog Select Panel */}
      {!readOnly && catalogSelectMode && (
        <div
          style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--primary)',
            marginBottom: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
            animation: 'slideDown 0.3s ease-out',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: '1.1rem',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <BookOpen size={20} /> Include {selectedProductIds.length} Items in Catalog
            </h3>
            <XCircle
              size={20}
              style={{ cursor: 'pointer', color: 'var(--text-muted)' }}
              onClick={() => setCatalogSelectMode(false)}
            />
          </div>

          {loadingCatalogs ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading your catalogs...
            </div>
          ) : myCatalogs.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No catalogs found. You need to create a catalog first before adding items to it.
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '1rem',
              }}
            >
              {myCatalogs.map((catalog) => (
                <div
                  key={catalog.id}
                  style={{
                    padding: '1rem',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: 'var(--color-bg-subtle)',
                  }}
                  onClick={() => handleAddToCatalog(catalog)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.backgroundColor = 'var(--primary-light)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle)';
                  }}
                >
                  <div
                    style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}
                  >
                    {catalog.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Status: {catalog.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {products.length === 0 && !loading && (
        <div
          style={{
            marginBottom: '2rem',
            textAlign: 'center',
            backgroundColor: 'white',
            padding: '3rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
          }}
        >
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Your catalog is empty.
          </p>
          {!readOnly && (
            <button className="btn btn-primary" onClick={handleMigrate} disabled={migrating}>
              {migrating ? 'Migrating...' : 'Run Initial Items Migration'}
            </button>
          )}
        </div>
      )}

      <div style={{ marginBottom: '2rem' }}>
        {loading ? (
          viewMode === 'grid' ? (
            <GridSkeleton cards={8} cardHeight="220px" minCardWidth={300} />
          ) : (
            <DataTableSkeleton rows={10} columns={6} hasSelect={true} hasExpand={true} />
          )
        ) : products.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Catalog is empty.
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Custom Filters and Search for Grid Mode */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', padding: '1rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ flex: '1 1 300px', position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      value={searchTerm} 
                      onChange={(e) => setSearchTerm(e.target.value)} 
                      placeholder="Search items by name, category, dosage..." 
                      style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none' }} 
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {renderCustomFilters()}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {paginatedProducts.map(product => (
                    <ProductGridCard 
                      key={product.id} 
                      product={product} 
                      isSelected={selectedProductIds.includes(product.id)}
                      onToggleSelect={(id) => handleSelectRow(id, !selectedProductIds.includes(id))}
                      onClick={() => navigate(`/admin/catalog/${product.id}`)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <DataTable
                virtualize={true}
                data={paginatedProducts}
                columns={columns}
                keyField="id"
                expandableRender={renderExpandedRow}
                selectedIds={selectedProductIds}
                onSelectionChange={handleSelectRow}
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                onPageChange={setCurrentPage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(val) => {
                  setRowsPerPage(val);
                  setCurrentPage(1);
                }}
                searchQuery={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Search items by name, category, dosage..."
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                filters={activeFilters}
                onFilterRemove={handleFilterRemove}
                renderCustomFilters={renderCustomFilters}
                renderBatchActions={(selected) => (
                  <AdminProductsBatchActions
                    selectedIds={selected}
                    readOnly={readOnly}
                    bulkMode={bulkMode}
                    onAddToBulkOrder={handleAddToBulkOrder}
                    onCreatePrescription={handleCreatePrescription}
                    onDeactivateSelected={handleDeactivateSelected}
                    onExportCSV={handleExportCSV}
                    onToggleBulkMode={() => setBulkMode(bulkMode ? null : 'percent')}
                    onOpenCatalogSelect={handleOpenCatalogSelect}
                  />
                )}
              />
            )}
            {hasMore && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                <button
                  className="btn btn-outline"
                  onClick={() => loadMore()}
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Loading...' : 'Load more items'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div
        style={{
          position: 'fixed',
          bottom: '1rem',
          right: '1rem',
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
          opacity: 0.8,
          background: 'var(--surface)',
          padding: '4px 8px',
          borderRadius: '4px',
          border: '1px solid var(--border)',
          pointerEvents: 'none',
          zIndex: 1000,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        Widget: AdminProductsTab | Props: none
      </div>

      {/* Modals */}
      <BulkOrderSelectionModal
        isOpen={isBulkOrderModalOpen}
        onClose={() => {
          setIsBulkOrderModalOpen(false);
          clearSelection();
        }}
        selectedProducts={productsToBulkOrder}
      />
      <CreateProductModal
        isOpen={isCreateProductModalOpen}
        onClose={() => setIsCreateProductModalOpen(false)}
        onCreated={() => {
          setIsCreateProductModalOpen(false);
          fetchProducts();
        }}
      />
    </div>
  );
}
