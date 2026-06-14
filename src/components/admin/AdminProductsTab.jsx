/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, limit, startAfter, orderBy } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../../firebase';
import {
  Search,
  Copy,
  Download,
  UploadCloud,
  Percent,
  ArrowUpRight,
  XCircle,
  EyeOff,
  Eye,
  Trash2,
  Edit3,
  BookOpen,
  Plus,
  ChevronDown,
  ChevronUp,
  Package,
  ClipboardList,
  Bot,
  ShoppingCart,
  MessageSquare,
  DollarSign,
  Activity,
  FileText,
  LineChart,
  Stethoscope,
  CheckCircle2,
  Users,
  Shield,
  Image as ImageIcon,
  Sparkles,
  LayoutGrid,
  List,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DataTable, StatusChip, FilterBar } from '../ui';
import AppActionGroup from '../ui/AppActionGroup';
import AppStatusToggle from '../ui/AppStatusToggle';
import AppFilterBar from '../ui/AppFilterBar';
import AppEntityCell from '../ui/AppEntityCell';
import { useToast } from '../../hooks/useToast';
import { catalogRepository } from '../../repositories/catalogRepository';
import AdminSupplyNotifierWidget from './gadgets/AdminSupplyNotifierWidget';
import PredictiveInventoryAlerts from './gadgets/PredictiveInventoryAlerts';
import ProductContextSwitcher from './ProductContextSwitcher';
import InlineEditField from '../ui/InlineEditField';
import BulkOrderSelectionModal from './BulkOrders/BulkOrderSelectionModal';
import TooltipWrapper from '../ui/TooltipWrapper';
import AdminPageHeader from './AdminPageHeader';
import ProductDetailsDrawer from './products/ProductDetailsDrawer';
import CreateProductModal from './CreateProductModal';

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

  const [isCreateProductModalOpen, setIsCreateProductModalOpen] = useState(initialNew);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerProduct, setDrawerProduct] = useState(null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  useEffect(() => {
    const searchVal = searchParams.get('search');
    if (searchVal !== null) {
      setSearchTerm(searchVal);
    }
  }, [searchParams]);

  // Auto-open Create Product modal when navigated from Command Palette with ?new=true
  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setIsCreateProductModalOpen(true);
      const url = new URL(window.location.href);
      url.searchParams.delete('new');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [viewMode, setViewMode] = useState('list'); // 'list', 'card'
  const [visibleColumns, setVisibleColumns] = useState(['image', 'product', 'category', 'type', 'stock', 'retail', 'clinic', 'supplier', 'regulatory']);
  const [activeQuickFilter, setActiveQuickFilter] = useState('all');
  const [showColConfig, setShowColConfig] = useState(false);

  // Master Product Hub filter states
  const [selectedQuickCategory, setSelectedQuickCategory] = useState('All');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [filterBrand, setFilterBrand] = useState('All');
  const [filterCountry, setFilterCountry] = useState('All');
  const [filterMoq, setFilterMoq] = useState('All');
  const [filterLeadTime, setFilterLeadTime] = useState('All');
  const [filterRegulatory, setFilterRegulatory] = useState('All');
  const [filterCommercial, setFilterCommercial] = useState('All');
  const [filterSku, setFilterSku] = useState('');

  const [filterCategory, setFilterCategory] = useState('All');
  const [filterSupplier, setFilterSupplier] = useState('All');
  const [filterProductType, setFilterProductType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterStock, setFilterStock] = useState('All');
  const [filterWarehouse, setFilterWarehouse] = useState('All');
  const [filterZoho, setFilterZoho] = useState('All');
  const [filterSource, setFilterSource] = useState('All');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const [bulkMode, setBulkMode] = useState(null);
  const [bulkValue, setBulkValue] = useState('');
  const [bulkCategory, setBulkCategory] = useState('All');
  const [importing, setImporting] = useState(false);
  const [savingProduct, setSavingProduct] = useState(null);
  const [migrating, setMigrating] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState([]);

  const [catalogSelectMode, setCatalogSelectMode] = useState(false);
  const [myCatalogs, setMyCatalogs] = useState([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(false);

  // Bulk Orders Modal State
  const [isBulkOrderModalOpen, setIsBulkOrderModalOpen] = useState(false);
  const [productsToBulkOrder, setProductsToBulkOrder] = useState([]);

  // Pagination State (Firestore)
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // Pagination State (Local UI)
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterSupplier, filterProductType, filterStatus, filterStock, filterWarehouse, filterZoho, filterSource, dateRange]);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts(loadMore = false) {
    try {
      if (!loadMore) setLoading(true);
      
      let q;
      if (loadMore && lastVisible) {
        q = query(collection(db, 'products'), orderBy('name'), startAfter(lastVisible));
      } else {
        q = query(collection(db, 'products'), orderBy('name'));
      }
      
      const querySnapshot = await getDocs(q);
      const newDocs = querySnapshot.docs;
      
      setHasMore(false); // Fetched all
      
      if (newDocs.length > 0) {
        setLastVisible(newDocs[newDocs.length - 1]);
      }

      let productsList = newDocs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      // Filter if restricted by allowedCategories
      if (!allowedCategories.includes('All')) {
        productsList = productsList.filter((p) => allowedCategories.includes(p.category));
      }

      if (loadMore) {
        setProducts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueNew = productsList.filter(p => !existingIds.has(p.id));
          const updated = [...prev, ...uniqueNew];
          // Inject data context for Atlas AI
          const lowStock = updated.filter(p => (p.stock || 0) < 20);
          const outOfStock = updated.filter(p => (p.stock || 0) === 0);
          window.dispatchEvent(new CustomEvent('admin-context-update', {
            detail: {
              page: 'products',
              totalProducts: updated.length,
              lowStockCount: lowStock.length,
              outOfStockCount: outOfStock.length,
              categories: [...new Set(updated.map(p => p.category).filter(Boolean))],
              lowStockItems: lowStock.slice(0, 5).map(p => ({ name: p.name, sku: p.sku, stock: p.stock })),
              summary: `Product catalog: ${updated.length} products loaded. ${outOfStock.length} out of stock, ${lowStock.length} with low stock (<20 units).`
            }
          }));
          return updated;
        });
      } else {
        setProducts(productsList);
        // Inject data context for Atlas AI
        const lowStock = productsList.filter(p => (p.stock || 0) < 20);
        const outOfStock = productsList.filter(p => (p.stock || 0) === 0);
        window.dispatchEvent(new CustomEvent('admin-context-update', {
          detail: {
            page: 'products',
            totalProducts: productsList.length,
            lowStockCount: lowStock.length,
            outOfStockCount: outOfStock.length,
            categories: [...new Set(productsList.map(p => p.category).filter(Boolean))],
            lowStockItems: lowStock.slice(0, 5).map(p => ({ name: p.name, sku: p.sku, stock: p.stock })),
            summary: `Product catalog: ${productsList.length} products loaded. ${outOfStock.length} out of stock, ${lowStock.length} with low stock (<20 units).`
          }
        }));
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  async function handleMigrate() {
    if (readOnly) return;
    setMigrating(true);
    toast.info('Migration already completed. Products live in Firestore.');
    setMigrating(false);
  };

  async function handleUpdateProduct(id, updates) {
    if (readOnly) return;
    setSavingProduct(id);
    try {
      const productRef = doc(db, 'products', id);
      await updateDoc(productRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
      toast.success('Product updated successfully');
    } catch (err) {
      console.error('Error updating product:', err);
      toast.error('Failed to update product.');
    } finally {
      setSavingProduct(null);
    }
  };

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
    const sampleRow = [
      'sample_id',
      'BPC157-5',
      'BPC-157',
      'Healing & Recovery',
      '5mg/vial',
      '28.75',
      '172.50',
      '24.44',
      '146.63',
      '100',
      'Poland',
      '15.00',
      'Regpept',
      'active',
    ];
    const csvContent = [headers.join(','), sampleRow.join(',')].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'med_peptides_import_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  async function handleImportCSV(event) {
    if (readOnly) return;
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      setImporting(true);
      try {
        const text = e.target.result;
        const rows = text.split('\n');
        const headers = rows[0].split(',');

        for (let i = 1; i < rows.length; i++) {
          if (!rows[i].trim()) continue;

          const cols = rows[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
          if (cols.length < 9) continue;

          const id = cols[0].replace(/"/g, '');
          const updates = {
            sku: cols[1]?.replace(/"/g, '') || '',
            guestVialPrice: parseFloat(cols[5]),
            guestKitPrice: parseFloat(cols[6]),
            proVialPrice: parseFloat(cols[7]),
            proKitPrice: parseFloat(cols[8]),
            stock: parseInt(cols[9]),
            warehouse: cols[10]?.replace(/"/g, '') || 'Poland',
            costPrice: parseFloat(cols[11]) || 0,
            supplier: cols[12]?.replace(/"/g, '') || '',
            isActive: cols[13]?.toLowerCase().includes('inactive') ? false : true,
            updatedAt: new Date().toISOString(),
            lastImportedAt: new Date().toISOString(),
          };

          const productRef = doc(db, 'products', id);
          await updateDoc(productRef, updates);
        }
        toast.success('Import complete! Refreshing catalog...');
        fetchProducts();
      } catch (err) {
        console.error('Import error:', err);
        toast.error('Error importing CSV. Ensure the format is correct.');
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
  };

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
      setSelectedProductIds([]);
    } catch (err) {
      console.error('Bulk adjust error:', err);
      toast.error('Error applying bulk adjustments.');
    } finally {
      setLoading(false);
    }
  };

  async function handleOpenCatalogSelect() {
    setCatalogSelectMode(true);
    setLoadingCatalogs(true);
    try {
      const list = isAdmin ? await catalogRepository.getAllCatalogs() : await catalogRepository.getCatalogsByOwner(user?.uid);
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
      selectedProductIds.forEach(id => {
        if (!newProducts.includes(id)) newProducts.push(id);
      });
      targetSection.products = newProducts;

      await catalogRepository.saveCatalog(updatedCatalog);
      toast.success(`Added ${selectedProductIds.length} products to ${catalog.title}`);
      setCatalogSelectMode(false);
      setSelectedProductIds([]);
    } catch (e) {
      console.error(e);
      toast.error('Failed to add to catalog');
    }
  }

  async function handleDeleteProduct(id) {
    if (readOnly) return;
    if (
      !window.confirm('Are you sure you want to delete this product? This action cannot be undone.')
    )
      return;
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Product deleted.');
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error('Failed to delete product.');
    }
  };

  // Determine which categories to show in filter dropdown
  const categoriesToShow = allowedCategories.includes('All')
    ? [...new Set(products.map((p) => p.category).filter(Boolean))]
    : allowedCategories;

  const suppliersToShow = [...new Set(products.map((p) => p.supplier).filter(Boolean))];

  const allColumnsList = [
    {
      key: 'image',
      header: 'Image',
      render: (row) => (
        <div style={{ width: '36px', height: '36px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {row.images?.length > 0 ? (
            <img src={row.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Package size={16} color="#94a3b8" />
          )}
        </div>
      )
    },
    {
      key: 'product',
      header: 'Product',
      sortKey: 'name',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>{row.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SKU: {row.sku || 'N/A'}</div>
        </div>
      )
    },
    {
      key: 'category',
      header: 'Category',
      render: (row) => <span style={{ fontSize: '0.85rem' }}>{row.category || 'N/A'}</span>
    },
    {
      key: 'type',
      header: 'Type',
      render: (row) => <span style={{ fontSize: '0.85rem' }}>{row.product_type || 'Peptide'}</span>
    },
    {
      key: 'stock',
      header: 'Stock',
      sortValue: row => row.stock,
      render: (row) => (
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: row.stock > 20 ? '#16a34a' : (row.stock > 0 ? '#ea580c' : '#dc2626') }}>
          {row.stock || 0}
        </span>
      )
    },
    {
      key: 'warehouse',
      header: 'Warehouse',
      render: (row) => <span style={{ fontSize: '0.85rem' }}>{row.warehouse || 'Poland'}</span>
    },
    {
      key: 'retail',
      header: 'Retail Price',
      render: (row) => <span style={{ fontSize: '0.85rem' }}>{row.guestVialPrice ? `$${row.guestVialPrice}` : '-'}</span>
    },
    {
      key: 'clinic',
      header: 'Clinic Price',
      render: (row) => <span style={{ fontSize: '0.85rem' }}>{row.proVialPrice ? `$${row.proVialPrice}` : '-'}</span>
    },
    {
      key: 'supplier',
      header: 'Supplier',
      render: (row) => <span style={{ fontSize: '0.85rem' }}>{row.supplier || '-'}</span>
    },
    {
      key: 'regulatory',
      header: 'Regulatory',
      render: (row) => (
        <span style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          color: row.registrationStatus === 'Registered' ? '#16a34a' : (row.registrationStatus === 'Pending' ? '#d97706' : '#64748b'),
          backgroundColor: row.registrationStatus === 'Registered' ? '#dcfce7' : (row.registrationStatus === 'Pending' ? '#fef3c7' : '#f1f5f9'),
          padding: '2px 8px',
          borderRadius: '12px'
        }}>
          {row.registrationStatus || 'Not Registered'}
        </span>
      )
    },
    {
      key: 'updated',
      header: 'Updated',
      render: (row) => <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : 'N/A'}</span>
    }
  ];

  const columns = allColumnsList.filter(col => visibleColumns.includes(col.key));

  const toggleColumnVisibility = (colKey) => {
    if (visibleColumns.includes(colKey)) {
      if (visibleColumns.length > 1) {
        setVisibleColumns(visibleColumns.filter(c => c !== colKey));
      } else {
        toast.warning('At least one column must be visible.');
      }
    } else {
      setVisibleColumns([...visibleColumns, colKey]);
    }
  };

  const handleBulkUpdateStock = async (selectedIds) => {
    const input = prompt("Enter stock quantity to set for selected items:");
    if (input === null || isNaN(input)) return;
    const qty = parseInt(input);
    try {
      const promises = selectedIds.map(id => {
        const ref = doc(db, 'products', id);
        return updateDoc(ref, { stock: qty, updatedAt: new Date().toISOString() });
      });
      await Promise.all(promises);
      toast.success(`Updated stock to ${qty} for ${selectedIds.length} products.`);
      setSelectedProductIds([]);
      fetchProducts();
    } catch (e) {
      toast.error('Failed to update stock: ' + e.message);
    }
  };

  const handleBulkAssignSupplier = async (selectedIds) => {
    const supplier = prompt("Enter supplier name to assign:");
    if (supplier === null) return;
    try {
      const promises = selectedIds.map(id => {
        const ref = doc(db, 'products', id);
        return updateDoc(ref, { supplier: supplier, updatedAt: new Date().toISOString() });
      });
      await Promise.all(promises);
      toast.success(`Assigned supplier "${supplier}" to ${selectedIds.length} products.`);
      setSelectedProductIds([]);
      fetchProducts();
    } catch (e) {
      toast.error('Failed to assign supplier: ' + e.message);
    }
  };

  const handleBulkAssignCategory = async (selectedIds) => {
    const category = prompt("Enter category name to assign (e.g. Recovery & Repair):");
    if (category === null) return;
    try {
      const promises = selectedIds.map(id => {
        const ref = doc(db, 'products', id);
        return updateDoc(ref, { category: category, updatedAt: new Date().toISOString() });
      });
      await Promise.all(promises);
      toast.success(`Assigned category "${category}" to ${selectedIds.length} products.`);
      setSelectedProductIds([]);
      fetchProducts();
    } catch (e) {
      toast.error('Failed to assign category: ' + e.message);
    }
  };

  if (!readOnly) {
    columns.push({
      key: 'actions',
      header: 'Actions',
      align: 'right',
      width: '180px',
      render: (p) => {
    const targetP = p.isGroup ? (p.variants && p.variants[0] ? p.variants[0] : p) : p;
    const actions = [
      { type: 'inventory', onClick: () => {
        navigate(`/admin/sku-sync?sku=${encodeURIComponent(targetP.sku || '')}&productId=${encodeURIComponent(targetP.id || '')}`);
      } },
      { type: 'pricing', onClick: () => {
        navigate(`/admin/prices?sku=${encodeURIComponent(targetP.sku || '')}&productId=${encodeURIComponent(targetP.id || '')}`);
      } },
      { type: 'protocols', onClick: () => {
        navigate(`/admin/protocols`);
      } },
      { type: 'ai', onClick: () => {
        window.dispatchEvent(new CustomEvent('OPEN_ATLAS_CLINICAL_MODE', {
          detail: { product: targetP.name, sku: targetP.sku }
        }));
      } },
      { type: 'search', label: 'Search Competitors', onClick: () => handleScrapeCompetitor(targetP) }
    ];
    
    if (!p.isGroup) {
      actions.push({ type: 'delete', onClick: () => handleDeleteProduct(p.id) });
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {savingProduct === p.id && (
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Saving...</span>
        )}
        <AppActionGroup actions={actions} />
      </div>
    );
      },
    });
  }

  const handleScrapeCompetitor = async (p) => {
    toast.info(`Buscando precios para ${p.name}...`);
    try {
      const url = `https://us-central1-med-peptides-app.cloudfunctions.net/forceScrapeCompetitors?productId=${encodeURIComponent(p.id)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { productId: p.id } })
      });
      
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      
      toast.success(`Precios actualizados para ${p.name}`);
      navigate(`/admin/prices?sku=${encodeURIComponent(p.sku || '')}&productId=${encodeURIComponent(p.id || '')}`);
    } catch (error) {
      console.error('Error scraping:', error);
      toast.error('Error al buscar precios.');
    }
  };

  const handleAddToBulkOrder = async (selectedIds) => {
    const selectedProducts = products.filter(p => selectedIds.includes(p.id));
    setProductsToBulkOrder(selectedProducts);
    setIsBulkOrderModalOpen(true);
  };

  const handleDeactivateSelected = async (selectedIds) => {
    try {
      const promises = selectedIds.map(id => {
        const ref = doc(db, 'products', id);
        return updateDoc(ref, { isActive: false });
      });
      await Promise.all(promises);
      toast.success(`${selectedIds.length} products have been deactivated.`);
      setSelectedProductIds([]);
      fetchProducts();
    } catch (error) {
      toast.error('Error deactivating products: ' + error.message);
    }
  };

  const VariantRow = ({ variant, navigate }) => {
    const [expandedSection, setExpandedSection] = React.useState(null);

    const toggleSection = (section) => {
      setExpandedSection(prev => prev === section ? null : section);
    };

    return (
      <div style={{ padding: '0.75rem 1rem', backgroundColor: 'white', borderRadius: '6px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>{variant.name}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              SKU: {variant.sku || 'N/A'}
              {(variant.dosage || variant.route || variant.form) && (
                <span style={{ marginLeft: '8px', paddingLeft: '8px', borderLeft: '1px solid var(--color-border)' }}>
                  {variant.dosage && <span style={{ marginRight: '6px', fontWeight: 500 }}>{variant.dosage}</span>}
                  {variant.form && <span style={{ marginRight: '6px' }}>• {variant.form}</span>}
                  {variant.route && <span>• {variant.route}</span>}
                </span>
              )}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={(e) => { e.stopPropagation(); toggleSection('pricing'); }} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', fontWeight: 600, backgroundColor: expandedSection === 'pricing' ? '#0f172a' : 'var(--color-bg-hover)', color: expandedSection === 'pricing' ? 'white' : 'var(--color-text-secondary)', border: '1px solid var(--color-border)', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}>
              Pricing {expandedSection === 'pricing' ? '▼' : '▶'}
            </button>
            <button onClick={(e) => { e.stopPropagation(); toggleSection('inventory'); }} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', fontWeight: 600, backgroundColor: expandedSection === 'inventory' ? '#0f172a' : 'var(--color-bg-hover)', color: expandedSection === 'inventory' ? 'white' : 'var(--color-text-secondary)', border: '1px solid var(--color-border)', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}>
              Inventory {expandedSection === 'inventory' ? '▼' : '▶'}
            </button>
          </div>
        </div>

        {expandedSection === 'pricing' && (() => {
          const retailUnit = variant.pricing?.retail?.perUnit || variant.guestVialPrice || 0;
          const clinicUnit = variant.pricing?.clinic?.perUnit || variant.proVialPrice || 0;
          const wholesaleUnit = variant.pricing?.wholesale?.perUnit || 0;
          const masterUnit = variant.pricing?.master?.perUnit || 0;

          const retailKit = variant.pricing?.retail?.kit || variant.guestKitPrice || 0;
          const clinicKit = variant.pricing?.clinic?.kit || variant.proKitPrice || 0;
          const wholesaleKit = variant.pricing?.wholesale?.kit || 0;
          const masterKit = variant.pricing?.master?.kit || 0;

          const hasKit = parseFloat(retailKit) > 0 || parseFloat(clinicKit) > 0 || parseFloat(wholesaleKit) > 0 || parseFloat(masterKit) > 0;

          return (
            <div style={{ marginTop: '0.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h5 style={{ margin: 0, fontSize: '0.8rem', color: '#334155' }}>Pricing Tiers Overview</h5>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '12px', backgroundColor: hasKit ? '#dcfce7' : '#f1f5f9', color: hasKit ? '#166534' : '#64748b' }}>
                  {hasKit ? '✓ Set of 10 Available' : '✗ No Set of 10'}
                </span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                <strong style={{ color: '#64748b' }}>Tier</strong>
                <strong style={{ textAlign: 'right', color: '#64748b' }}>1 Unit</strong>
                <strong style={{ textAlign: 'right', color: '#64748b' }}>Set of 10</strong>

                <span style={{ color: '#0f172a', fontWeight: 500 }}>Retail</span>
                <span style={{ textAlign: 'right' }}>${parseFloat(retailUnit).toFixed(2)}</span>
                <span style={{ textAlign: 'right' }}>{parseFloat(retailKit) > 0 ? `$${parseFloat(retailKit).toFixed(2)}` : '-'}</span>

                <span style={{ color: '#0f172a', fontWeight: 500 }}>Doctor / Clinic</span>
                <span style={{ textAlign: 'right' }}>${parseFloat(clinicUnit).toFixed(2)}</span>
                <span style={{ textAlign: 'right' }}>{parseFloat(clinicKit) > 0 ? `$${parseFloat(clinicKit).toFixed(2)}` : '-'}</span>

                <span style={{ color: '#0f172a', fontWeight: 500 }}>Wholesaler</span>
                <span style={{ textAlign: 'right' }}>${parseFloat(wholesaleUnit).toFixed(2)}</span>
                <span style={{ textAlign: 'right' }}>{parseFloat(wholesaleKit) > 0 ? `$${parseFloat(wholesaleKit).toFixed(2)}` : '-'}</span>

                <span style={{ color: '#0f172a', fontWeight: 500 }}>Master</span>
                <span style={{ textAlign: 'right' }}>${parseFloat(masterUnit).toFixed(2)}</span>
                <span style={{ textAlign: 'right' }}>{parseFloat(masterKit) > 0 ? `$${parseFloat(masterKit).toFixed(2)}` : '-'}</span>
              </div>

              <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/prices?sku=${encodeURIComponent(variant.sku || '')}&productId=${encodeURIComponent(variant.id || '')}`); }} style={{ width: '100%', padding: '0.6rem', fontSize: '0.8rem', fontWeight: 600, backgroundColor: 'white', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Manage Pricing in Detail</span>
                <span>→</span>
              </button>
            </div>
          );
        })()}

        {expandedSection === 'inventory' && (
          <div style={{ marginTop: '0.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
            <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: '#334155' }}>Inventory Status</h5>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem', fontSize: '0.8rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.25rem', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b' }}>Warehouse:</span> 
                <strong style={{ color: '#0f172a' }}>
                  {variant.warehouse || variant.stock?.warehouse || 'Primary Warehouse'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.25rem', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b' }}>Total Stock Qty:</span> 
                <strong>{variant.stock?.qty ?? variant.stock ?? 0} units</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.25rem', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b' }}>Availability:</span> 
                <strong style={{ color: (variant.stock?.available ?? true) ? '#10b981' : '#ef4444' }}>
                  {(variant.stock?.available ?? true) ? 'In Stock' : 'Out of Stock'}
                </strong>
              </div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/sku-sync?sku=${encodeURIComponent(variant.sku || '')}&productId=${encodeURIComponent(variant.id || '')}`); }} style={{ width: '100%', padding: '0.6rem', fontSize: '0.8rem', fontWeight: 600, backgroundColor: 'white', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Manage Inventory in Detail</span>
              <span>→</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  const allGroupsMap = products.reduce((acc, p) => {
    let gName = p.zoho_item_group_name || p.item_group_name || p.group_name;
    if (!gName) {
      gName = p.name.replace(/\s*\d+(\.\d+)?(mg|mcg|iu|g)\/?[a-zA-Z]*/i, '').trim();
    }
    
    if (!acc[gName]) {
      acc[gName] = {
        id: `group_${gName.replace(/\s+/g, '_')}`,
        isGroup: true,
        name: gName,
        category: p.category,
        variants: [],
        totalStock: 0,
        isActive: false
      };
    }
    
    acc[gName].variants.push(p);
    acc[gName].totalStock += (p.stock || 0);
    if (p.isActive !== false) acc[gName].isActive = true;
    
    if (!acc[gName].sku && p.sku) acc[gName].sku = p.sku.substring(0, 8); 
    if (!acc[gName].zoho_item_id && p.zoho_item_id) acc[gName].zoho_item_id = p.zoho_item_id;
    
    return acc;
  }, {});

  const allGroups = Object.values(allGroupsMap);

  const filteredGroups = allGroups.filter((group) => {
    return group.variants.some((p) => {
      // Category & Quick Filter Chips
      let matchesCategory = filterCategory === 'All' || p?.category === filterCategory;
      let matchesQuickCategory = true;
      if (selectedQuickCategory !== 'All') {
        const cat = (p?.category || '').toLowerCase();
        const pType = (p?.product_type || p?.productType || '').toLowerCase();
        if (selectedQuickCategory === 'Finished Peptides') {
          matchesQuickCategory = cat.includes('peptide') || pType.includes('peptide');
        } else if (selectedQuickCategory === 'APIs') {
          matchesQuickCategory = cat === 'apis' || cat.includes('api') || pType.includes('api peptide');
        } else if (selectedQuickCategory === 'Raw Materials') {
          matchesQuickCategory = cat.includes('raw mat') || cat.includes('material');
        } else if (selectedQuickCategory === 'Supplements') {
          matchesQuickCategory = cat.includes('suplement') || cat.includes('supplement') || pType.includes('supplement');
        } else if (selectedQuickCategory === 'Tests') {
          matchesQuickCategory = cat.includes('test') || cat.includes('genetic') || pType.includes('kit') || pType.includes('diagnostic');
        } else if (selectedQuickCategory === 'Medical Devices') {
          matchesQuickCategory = cat.includes('device') || pType.includes('device');
        } else if (selectedQuickCategory === 'Services') {
          matchesQuickCategory = cat.includes('service') || pType.includes('service');
        }
      }

      const matchesSupplier = filterSupplier === 'All' || p?.supplier === filterSupplier;
      const matchesStatus =
        filterStatus === 'All' ||
        (filterStatus === 'Active' && p?.isActive !== false) ||
        (filterStatus === 'Inactive' && p?.isActive === false);
      const matchesWarehouse = filterWarehouse === 'All' || p?.warehouse === filterWarehouse;

      const matchesProductType =
        filterProductType === 'All' ||
        p?.productType === filterProductType ||
        (filterProductType === 'Peptides' && (p?.productType === 'Peptide' || p?.category === 'Finished Peptides')) ||
        (filterProductType === 'API Peptides' && (p?.productType === 'API Peptide' || p?.category === 'APIs & Raw Mats')) ||
        (filterProductType === 'API Supplements' && p?.productType === 'API Supplement');

      let matchesStock = true;
      if (filterStock === 'Out of Stock') matchesStock = p?.stock < 1;
      else if (filterStock === 'Low Stock') matchesStock = p?.stock >= 1 && p?.stock < 20;
      else if (filterStock === 'In Stock') matchesStock = p?.stock >= 20;
      else if (filterStock === 'Reorder Needed') matchesStock = p?.stock <= (p?.reorderPoint || 20);

      // SKU
      let matchesSku = true;
      if (filterSku) {
        matchesSku = (p?.sku || '').toLowerCase().includes(filterSku.toLowerCase());
      }

      // Brand
      let matchesBrand = true;
      if (filterBrand !== 'All') {
        matchesBrand = p?.brand === filterBrand;
      }

      // Country
      let matchesCountry = true;
      if (filterCountry !== 'All') {
        matchesCountry = (p?.countryOfOrigin === filterCountry) || (p?.countries || []).includes(filterCountry);
      }

      // MOQ
      let matchesMoq = true;
      if (filterMoq !== 'All') {
        if (filterMoq === 'moq-1') matchesMoq = (p?.moq_1 || 0) <= 1;
        else if (filterMoq === 'moq-10') matchesMoq = (p?.moq_10 || 10) <= 10;
        else if (filterMoq === 'moq-50') matchesMoq = (p?.moq_50 || 50) <= 50;
      }

      // Lead Time
      let matchesLeadTime = true;
      if (filterLeadTime !== 'All') {
        const lt = Number(p?.supplierLeadTime || 14);
        if (filterLeadTime === 'under-7') matchesLeadTime = lt <= 7;
        else if (filterLeadTime === 'under-14') matchesLeadTime = lt <= 14;
        else if (filterLeadTime === 'over-14') matchesLeadTime = lt > 14;
      }

      // Regulatory checklist
      let matchesRegulatory = true;
      if (filterRegulatory !== 'All') {
        if (filterRegulatory === 'Registered') matchesRegulatory = p?.registrationStatus === 'Registered';
        else if (filterRegulatory === 'Pending') matchesRegulatory = p?.registrationStatus === 'Pending';
        else if (filterRegulatory === 'Missing CoA') matchesRegulatory = !p?.coaUrl || p?.docStatus_coa === 'Missing';
        else if (filterRegulatory === 'Missing MSDS') matchesRegulatory = !p?.msdsUrl || p?.docStatus_msds === 'Missing';
        else if (filterRegulatory === 'Missing GMP') matchesRegulatory = !p?.requiredDocs?.includes('GMP') || p?.docStatus_gmp === 'Missing';
      }

      // Commercial checklist
      let matchesCommercial = true;
      if (filterCommercial !== 'All') {
        if (filterCommercial === 'No Price') matchesCommercial = !p?.guestVialPrice;
        else if (filterCommercial === 'Low Margin') {
          const costVal = Number(p?.costPrice) || 0;
          const retailVal = Number(p?.guestVialPrice) || 0;
          const margin = retailVal > 0 ? ((retailVal - costVal) / retailVal) * 100 : 0;
          matchesCommercial = margin < 20;
        } else if (filterCommercial === 'No Supplier') matchesCommercial = !p?.supplier;
        else if (filterCommercial === 'No Image') matchesCommercial = !p?.images || p?.images?.length === 0;
      }

      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        (p?.name || '').toLowerCase().includes(searchLower) ||
        (p?.category || '').toLowerCase().includes(searchLower) ||
        (p?.supplier || '').toLowerCase().includes(searchLower) ||
        (p?.objective && p.objective.toLowerCase().includes(searchLower)) ||
        (p?.dosage && p.dosage.toLowerCase().includes(searchLower));

      let matchesDate = true;
      if (dateRange.start || dateRange.end) {
        let updatedStr = p.updatedAt;
        if (!updatedStr && p.createdAt) {
          if (p.createdAt?.toDate) {
            updatedStr = p.createdAt.toDate().toISOString();
          } else if (typeof p.createdAt === 'string') {
            updatedStr = p.createdAt;
          }
        }
        
        const updated = updatedStr ? new Date(updatedStr) : null;
        if (updated) {
          if (dateRange.start && updated < new Date(dateRange.start)) matchesDate = false;
          if (dateRange.end) {
            const endDate = new Date(dateRange.end);
            endDate.setHours(23, 59, 59, 999);
            if (updated > endDate) matchesDate = false;
          }
        } else {
          matchesDate = false;
        }
      }

      let matchesZoho = true;
      if (filterZoho !== 'All') {
        if (filterZoho === 'Synced') matchesZoho = !!p.zohoId || !!p.zoho_item_id;
        else if (filterZoho === 'Not Synced') matchesZoho = !p.zohoId && !p.zoho_item_id;
        else if (filterZoho === 'Sync Error') matchesZoho = p.zohoSyncStatus === 'Failed';
      }

      let matchesSource = true;
      if (filterSource === 'Recently Imported') {
        let baseDateStr = p.updatedAt;
        if (!baseDateStr && p.createdAt) {
          if (p.createdAt?.toDate) {
            baseDateStr = p.createdAt.toDate().toISOString();
          } else if (typeof p.createdAt === 'string') {
            baseDateStr = p.createdAt;
          }
        }
        const importedAt = p.lastImportedAt ? new Date(p.lastImportedAt) : (baseDateStr ? new Date(baseDateStr) : null);
        if (!importedAt) {
          matchesSource = false;
        } else {
          const hoursSinceImport = (new Date() - importedAt) / (1000 * 60 * 60);
          if (hoursSinceImport > 24) matchesSource = false;
        }
      }

      let matchesQuickFilter = true;
      if (activeQuickFilter === 'active') matchesQuickFilter = p.isActive !== false;
      else if (activeQuickFilter === 'lowStock') matchesQuickFilter = p.stock > 0 && p.stock <= 20;
      else if (activeQuickFilter === 'outOfStock') matchesQuickFilter = p.stock === 0;
      else if (activeQuickFilter === 'pendingRegulatory') matchesQuickFilter = p.registrationStatus !== 'Registered';
      else if (activeQuickFilter === 'pendingPrice') matchesQuickFilter = !p.guestVialPrice;
      else if (activeQuickFilter === 'noMedia') matchesQuickFilter = !p.images || p.images.length === 0;
      else if (activeQuickFilter === 'noSupplier') matchesQuickFilter = !p.supplier;

      return (
        matchesCategory &&
        matchesQuickCategory &&
        matchesSupplier &&
        matchesProductType &&
        matchesStatus &&
        matchesWarehouse &&
        matchesStock &&
        matchesSearch &&
        matchesDate &&
        matchesZoho &&
        matchesSource &&
        matchesQuickFilter &&
        matchesSku &&
        matchesBrand &&
        matchesCountry &&
        matchesMoq &&
        matchesLeadTime &&
        matchesRegulatory &&
        matchesCommercial
      );
    });
  });

  const activeFilters = [];
  if (filterCategory !== 'All') activeFilters.push({ label: 'Category', value: filterCategory, type: 'category' });
  if (selectedQuickCategory !== 'All') activeFilters.push({ label: 'Quick Category', value: selectedQuickCategory, type: 'quickCategory' });
  if (filterSupplier !== 'All') activeFilters.push({ label: 'Supplier', value: filterSupplier, type: 'supplier' });
  if (filterProductType !== 'All') activeFilters.push({ label: 'Product Type', value: filterProductType, type: 'productType' });
  if (filterStatus !== 'All') activeFilters.push({ label: 'Status', value: filterStatus, type: 'status' });
  if (filterWarehouse !== 'All') activeFilters.push({ label: 'Warehouse', value: filterWarehouse, type: 'warehouse' });
  if (filterStock !== 'All') activeFilters.push({ label: 'Stock', value: filterStock, type: 'stock' });
  if (filterZoho !== 'All') activeFilters.push({ label: 'Zoho', value: filterZoho, type: 'zoho' });
  if (filterSource !== 'All') activeFilters.push({ label: 'Source', value: filterSource, type: 'source' });
  if (filterBrand !== 'All') activeFilters.push({ label: 'Brand', value: filterBrand, type: 'brand' });
  if (filterCountry !== 'All') activeFilters.push({ label: 'Country', value: filterCountry, type: 'country' });
  if (filterMoq !== 'All') activeFilters.push({ label: 'MOQ', value: filterMoq, type: 'moq' });
  if (filterLeadTime !== 'All') activeFilters.push({ label: 'Lead Time', value: filterLeadTime, type: 'leadTime' });
  if (filterRegulatory !== 'All') activeFilters.push({ label: 'Regulatory', value: filterRegulatory, type: 'regulatory' });
  if (filterCommercial !== 'All') activeFilters.push({ label: 'Commercial', value: filterCommercial, type: 'commercial' });

  const handleFilterRemove = (filter) => {
    if (filter.type === 'category') setFilterCategory('All');
    if (filter.type === 'quickCategory') setSelectedQuickCategory('All');
    if (filter.type === 'supplier') setFilterSupplier('All');
    if (filter.type === 'productType') setFilterProductType('All');
    if (filter.type === 'status') setFilterStatus('All');
    if (filter.type === 'warehouse') setFilterWarehouse('All');
    if (filter.type === 'stock') setFilterStock('All');
    if (filter.type === 'zoho') setFilterZoho('All');
    if (filter.type === 'brand') setFilterBrand('All');
    if (filter.type === 'country') setFilterCountry('All');
    if (filter.type === 'moq') setFilterMoq('All');
    if (filter.type === 'leadTime') setFilterLeadTime('All');
    if (filter.type === 'regulatory') setFilterRegulatory('All');
    if (filter.type === 'commercial') setFilterCommercial('All');
  };

  const renderCustomFilters = () => (
    <>
      {categoriesToShow.length > 0 && (
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{
            height: '24px', padding: '0 1rem 0 0.4rem', borderRadius: '12px',
            border: '1px solid var(--border)', backgroundColor: filterCategory === 'All' ? 'white' : 'var(--primary-light)',
            color: filterCategory === 'All' ? 'var(--text-main)' : 'var(--primary)',
            fontSize: '0.7rem', fontWeight: 500, outline: 'none', cursor: 'pointer', appearance: 'none',
          }}
        >
          <option value="All">Category: All</option>
          {categoriesToShow.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      )}
      {suppliersToShow.length > 0 && (
        <select
          value={filterSupplier}
          onChange={(e) => setFilterSupplier(e.target.value)}
          style={{
            height: '24px', padding: '0 1rem 0 0.4rem', borderRadius: '12px',
            border: '1px solid var(--border)', backgroundColor: filterSupplier === 'All' ? 'white' : 'var(--primary-light)',
            color: filterSupplier === 'All' ? 'var(--text-main)' : 'var(--primary)',
            fontSize: '0.7rem', fontWeight: 500, outline: 'none', cursor: 'pointer', appearance: 'none',
          }}
        >
          <option value="All">Supplier: All</option>
          {suppliersToShow.map((sup) => <option key={sup} value={sup}>{sup}</option>)}
        </select>
      )}
      <select
        value={filterProductType}
        onChange={(e) => setFilterProductType(e.target.value)}
        style={{
          height: '24px', padding: '0 1rem 0 0.4rem', borderRadius: '12px',
          border: '1px solid var(--border)', backgroundColor: filterProductType === 'All' ? 'white' : 'var(--primary-light)',
          color: filterProductType === 'All' ? 'var(--text-main)' : 'var(--primary)',
          fontSize: '0.7rem', fontWeight: 500, outline: 'none', cursor: 'pointer', appearance: 'none',
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
          height: '24px', padding: '0 1rem 0 0.4rem', borderRadius: '12px',
          border: '1px solid var(--border)', backgroundColor: filterStatus === 'All' ? 'white' : 'var(--primary-light)',
          color: filterStatus === 'All' ? 'var(--text-main)' : 'var(--primary)',
          fontSize: '0.7rem', fontWeight: 500, outline: 'none', cursor: 'pointer', appearance: 'none',
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
          height: '24px', padding: '0 1rem 0 0.4rem', borderRadius: '12px',
          border: '1px solid var(--border)', backgroundColor: filterZoho === 'All' ? 'white' : 'var(--primary-light)',
          color: filterZoho === 'All' ? 'var(--text-main)' : 'var(--primary)',
          fontSize: '0.7rem', fontWeight: 500, outline: 'none', cursor: 'pointer', appearance: 'none',
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
          height: '24px', padding: '0 1rem 0 0.4rem', borderRadius: '12px',
          border: '1px solid var(--border)', backgroundColor: filterSource === 'All' ? 'white' : 'var(--primary-light)',
          color: filterSource === 'All' ? 'var(--text-main)' : 'var(--primary)',
          fontSize: '0.7rem', fontWeight: 500, outline: 'none', cursor: 'pointer', appearance: 'none',
        }}
      >
        <option value="All">Source: All</option>
        <option value="Recently Imported">Recently Imported (24h)</option>
      </select>
      <select
        value={filterStock}
        onChange={(e) => setFilterStock(e.target.value)}
        style={{
          height: '24px', padding: '0 1rem 0 0.4rem', borderRadius: '12px',
          border: '1px solid var(--border)', backgroundColor: filterStock === 'All' ? 'white' : 'var(--primary-light)',
          color: filterStock === 'All' ? 'var(--text-main)' : 'var(--primary)',
          fontSize: '0.7rem', fontWeight: 500, outline: 'none', cursor: 'pointer', appearance: 'none',
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
          height: '24px', padding: '0 1rem 0 0.4rem', borderRadius: '12px',
          border: '1px solid var(--border)', backgroundColor: filterWarehouse === 'All' ? 'white' : 'var(--primary-light)',
          color: filterWarehouse === 'All' ? 'var(--text-main)' : 'var(--primary)',
          fontSize: '0.7rem', fontWeight: 500, outline: 'none', cursor: 'pointer', appearance: 'none',
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

  const groupedProductsArray = filteredGroups.sort((a, b) => a.name.localeCompare(b.name));

  const totalItems = groupedProductsArray.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const paginatedProducts = groupedProductsArray.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const renderCardView = () => {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1rem',
        padding: '1rem 0'
      }}>
        {paginatedProducts.map(group => {
          const mainVariant = group.isGroup && group.variants.length > 0 ? group.variants[0] : group;
          const totalGroupStock = group.isGroup ? group.totalStock : (group.stock || 0);
          const isSelected = selectedProductIds.includes(mainVariant.id);
          
          return (
            <div
              key={group.id}
              onClick={() => {
                setDrawerProduct(mainVariant);
                setIsDrawerOpen(true);
              }}
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: '12px',
                border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
              onMouseEnter={e => {
                if (!isSelected) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.borderColor = 'var(--primary-light)';
                }
              }}
              onMouseLeave={e => {
                if (!isSelected) {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }
              }}
            >
              {/* Checkbox overlay */}
              <div 
                style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 10 }} 
                onClick={e => {
                  e.stopPropagation();
                  if (selectedProductIds.includes(mainVariant.id)) {
                    setSelectedProductIds(selectedProductIds.filter(id => id !== mainVariant.id));
                  } else {
                    setSelectedProductIds([...selectedProductIds, mainVariant.id]);
                  }
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}} // Handled by div wrapper onClick
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>
              {/* Image & Header */}
              <div style={{ position: 'relative', height: '140px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--border)' }}>
                {mainVariant.images && mainVariant.images.length > 0 ? (
                  <img src={mainVariant.images[0]} alt={mainVariant.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Package size={40} color="#94a3b8" />
                )}
                {/* Regulatory status badge */}
                <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: mainVariant.registrationStatus === 'Registered' ? '#16a34a' : (mainVariant.registrationStatus === 'Pending' ? '#d97706' : '#64748b'),
                    backgroundColor: mainVariant.registrationStatus === 'Registered' ? '#dcfce7' : (mainVariant.registrationStatus === 'Pending' ? '#fef3c7' : '#f1f5f9'),
                    padding: '2px 8px',
                    borderRadius: '12px'
                  }}>
                    {mainVariant.registrationStatus || 'Not Registered'}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{mainVariant.category || 'N/A'}</span>
                  <h4 style={{ margin: '2px 0 0 0', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
                    {mainVariant.name}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Type: {mainVariant.product_type || 'Peptide'}</span>
                </div>

                {/* Stock info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-bg-subtle)', padding: '6px 10px', borderRadius: '8px', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Stock Status:</span>
                  <span style={{ fontWeight: 700, color: totalGroupStock > 20 ? '#16a34a' : (totalGroupStock > 0 ? '#ea580c' : '#dc2626') }}>
                    {totalGroupStock} units
                  </span>
                </div>

                {/* Pricing */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Retail Price</span>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                      {mainVariant.guestVialPrice ? `$${mainVariant.guestVialPrice}` : '-'}
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Clinic Price</span>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                      {mainVariant.proVialPrice ? `$${mainVariant.proVialPrice}` : '-'}
                    </strong>
                  </div>
                </div>

                {/* Supplier principal */}
                {mainVariant.supplier && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <span>Supplier:</span>
                    <strong style={{ color: 'var(--text-main)' }}>{mainVariant.supplier}</strong>
                  </div>
                )}
              </div>

              {/* Quick Actions Footer */}
              <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border)', backgroundColor: '#f8fafc', padding: '0.5rem' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDrawerProduct(mainVariant);
                    setIsDrawerOpen(true);
                  }}
                  className="btn btn-outline"
                  style={{ flex: 1, padding: '0.35rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                >
                  <Edit3 size={12} /> More
                </button>
                {!readOnly && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeactivateSelected([mainVariant.id]);
                    }}
                    className="btn btn-outline"
                    style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem', color: '#ef4444', borderColor: '#ef4444', background: '#fef2f2' }}
                    title="Archive"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderPaginationControls = () => {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, totalItems)} of {totalItems} items
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="btn btn-outline"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="btn btn-outline"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  const renderBulkActionsBar = () => {
    if (selectedProductIds.length === 0) return null;
    return (
      <div style={{
        position: 'fixed',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#0f172a',
        color: '#ffffff',
        padding: '0.75rem 1.5rem',
        borderRadius: '30px',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        zIndex: 1000,
        border: '1px solid #334155'
      }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
          {selectedProductIds.length} Selected
        </div>
        <div style={{ width: '1px', height: '20px', backgroundColor: '#334155' }} />
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleBulkUpdateStock(selectedProductIds)}
            className="btn btn-primary"
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', backgroundColor: '#3b82f6', borderColor: '#3b82f6' }}
          >
            Update Stock
          </button>
          <button
            onClick={() => {
              setBulkCategory('All');
              setBulkMode(bulkMode ? null : 'percent');
            }}
            className="btn btn-outline"
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', color: '#fff', borderColor: '#475569' }}
          >
            Update Pricing
          </button>
          <button
            onClick={() => handleBulkAssignSupplier(selectedProductIds)}
            className="btn btn-outline"
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', color: '#fff', borderColor: '#475569' }}
          >
            Assign Supplier
          </button>
          <button
            onClick={() => handleBulkAssignCategory(selectedProductIds)}
            className="btn btn-outline"
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', color: '#fff', borderColor: '#475569' }}
          >
            Assign Category
          </button>
          <button
            onClick={handleExportCSV}
            className="btn btn-outline"
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', color: '#fff', borderColor: '#475569' }}
          >
            Export
          </button>
          <button
            onClick={() => handleDeactivateSelected(selectedProductIds)}
            className="btn btn-outline"
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', color: '#ef4444', borderColor: '#dc2626', backgroundColor: '#450a0a' }}
          >
            Archive
          </button>
          <button
            onClick={handleOpenCatalogSelect}
            className="btn btn-outline"
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', color: '#10b981', borderColor: '#047857', backgroundColor: '#064e3b' }}
          >
            Generate Catalog
          </button>
        </div>
        <button
          onClick={() => setSelectedProductIds([])}
          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.8rem' }}
        >
          Clear
        </button>
      </div>
    );
  };

  const renderMobileProductCard = (group) => {
    const mainVariant = group.variants[0] || {};
    return (
      <div key={group.name} style={{ backgroundColor: 'var(--surface)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: 'var(--shadow-sm)' }} onClick={() => { setDrawerProduct(mainVariant); setIsDrawerOpen(true); }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{mainVariant.sku || 'N/A'}</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>{group.name}</div>
          </div>
          <div style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: mainVariant.isActive !== false ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)', color: mainVariant.isActive !== false ? '#16a34a' : '#dc2626', fontSize: '0.7rem', fontWeight: 600 }}>
            {mainVariant.isActive !== false ? 'Active' : 'Inactive'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Package size={14} color="#64748b"/> {group.totalStock} in stock</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><DollarSign size={14} color="#64748b"/> {mainVariant.retailPrice || mainVariant.price || '---'}</div>
        </div>
      </div>
    );
  };

  const renderMobileView = () => (
    <div style={{ padding: '1rem', paddingBottom: '100px' }}>
      {/* Compact Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Item Intelligence</h2>
        <button onClick={() => setIsFilterDrawerOpen(true)} style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Settings size={18} color="var(--text-main)" />
        </button>
      </div>

      {/* Intelligence Summary */}
      <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'none', margin: '0 -1rem', paddingLeft: '1rem', paddingRight: '1rem' }}>
        {[
          { label: 'Total', val: products.length, color: '#0ea5e9', bg: '#f0f9ff' },
          { label: 'Low Stock', val: products.filter(p => p.stock > 0 && p.stock <= 20).length, color: '#ea580c', bg: '#fff7ed' },
          { label: 'Out of Stock', val: products.filter(p => p.stock === 0).length, color: '#dc2626', bg: '#fef2f2' },
          { label: 'Pending Reg', val: products.filter(p => p.registrationStatus !== 'Registered').length, color: '#9333ea', bg: '#faf5ff' },
        ].map(k => (
          <div key={k.label} style={{ flexShrink: 0, width: '100px', backgroundColor: k.bg, padding: '12px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '4px', border: `1px solid ${k.color}20` }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: k.color }}>{k.val}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input
          type="text"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', fontSize: '0.9rem', outline: 'none' }}
        />
      </div>
      
      {/* Product List */}
      <div>
        {groupedProductsArray.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No items found.</div>
        ) : (
          groupedProductsArray.map(renderMobileProductCard)
        )}
      </div>

      {renderPagination()}
    </div>
  );

  if (isMobile) {
    return (
      <>
        {renderMobileView()}
        {isCreateProductModalOpen && (
          <CreateProductModal 
            isOpen={isCreateProductModalOpen} 
            onClose={() => setIsCreateProductModalOpen(false)} 
            onProductCreated={() => { fetchProducts(); setIsCreateProductModalOpen(false); }}
          />
        )}
        <ProductDrawer product={drawerProduct} isOpen={isDrawerOpen} onClose={() => { setIsDrawerOpen(false); setDrawerProduct(null); }} onUpdate={fetchProducts} />
        {renderBulkActionsBar()}
        {renderCatalogModal()}
        {renderBulkOrderModal()}
        <FilterDrawer />
      </>
    );
  }

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'var(--color-bg-app)', paddingBottom: '0.5rem', margin: '0 -1.5rem', padding: '0 1.5rem 0.5rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
        <AdminPageHeader
          title="Items"
          subtitle="Master Catalog Workspace - Centralized item directory"
          icon={Package}
        />
        
        {/* Custom search bar with Advanced Filters button */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search master catalog by name, SKU, supplier, brand, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'white',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: `1px solid ${isFilterDrawerOpen ? 'var(--primary)' : 'var(--border)'}`,
              backgroundColor: isFilterDrawerOpen ? 'var(--primary-light)' : 'white',
              color: isFilterDrawerOpen ? 'var(--primary)' : 'var(--text-main)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              height: '38px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <Settings size={14} /> <span>Advanced Filters</span>
          </button>
        </div>

        {/* Master Category Filter Bar chips */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          padding: '0.75rem 0 0.25rem 0',
          scrollbarWidth: 'none',
          marginTop: '0.5rem'
        }}>
          {[
            { label: 'All Products', value: 'All' },
            { label: 'Finished Peptides', value: 'Finished Peptides' },
            { label: 'APIs', value: 'APIs' },
            { label: 'Raw Materials', value: 'Raw Materials' },
            { label: 'Supplements', value: 'Supplements' },
            { label: 'Tests', value: 'Tests' },
            { label: 'Medical Devices', value: 'Medical Devices' },
            { label: 'Services', value: 'Services' }
          ].map((chip) => {
            const isActive = selectedQuickCategory === chip.value;
            return (
              <button
                key={chip.value}
                onClick={() => setSelectedQuickCategory(chip.value)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '100px',
                  border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`,
                  backgroundColor: isActive ? 'var(--primary-light)' : 'white',
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>
      {isAdmin && !readOnly && (
        <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '0.75rem',
            marginBottom: '0.5rem'
          }}>
            {[
              { key: 'all', title: 'Total Items', value: products.length, icon: Package, bg: 'rgba(26, 115, 232, 0.08)', color: 'var(--primary)' },
              { key: 'active', title: 'Active Items', value: products.filter(p => p.isActive !== false).length, icon: CheckCircle2, bg: 'rgba(22, 163, 74, 0.08)', color: '#16a34a' },
              { key: 'lowStock', title: 'Low Stock', value: products.filter(p => p.stock > 0 && p.stock <= 20).length, icon: AlertTriangle, bg: 'rgba(234, 88, 12, 0.08)', color: '#ea580c' },
              { key: 'outOfStock', title: 'Out of Stock', value: products.filter(p => p.stock === 0).length, icon: XCircle, bg: 'rgba(220, 38, 38, 0.08)', color: '#dc2626' },
              { key: 'pendingRegulatory', title: 'Pending Reg Review', value: products.filter(p => p.registrationStatus !== 'Registered').length, icon: Shield, bg: 'rgba(147, 51, 234, 0.08)', color: '#9333ea' },
              { key: 'pendingPrice', title: 'Pending Price Update', value: products.filter(p => !p.guestVialPrice).length, icon: DollarSign, bg: 'rgba(217, 119, 6, 0.08)', color: '#d97706' },
              { key: 'noMedia', title: 'Items Without Media', value: products.filter(p => !p.images || p.images.length === 0).length, icon: ImageIcon, bg: 'rgba(71, 85, 105, 0.08)', color: '#475569' },
              { key: 'noSupplier', title: 'Missing Supplier', value: products.filter(p => !p.supplier).length, icon: Users, bg: 'rgba(2, 132, 199, 0.08)', color: '#0284c7' }
            ].map(kpi => {
              const Icon = kpi.icon;
              const isSelected = activeQuickFilter === kpi.key;
              return (
                <div
                  key={kpi.key}
                  onClick={() => setActiveQuickFilter(activeQuickFilter === kpi.key ? 'all' : kpi.key)}
                  style={{
                    backgroundColor: 'var(--surface)',
                    padding: '1rem',
                    borderRadius: '10px',
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                    boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    transform: isSelected ? 'translateY(-2px)' : 'none'
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'var(--primary-light)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.transform = 'none';
                    }
                  }}
                >
                  <div style={{ backgroundColor: kpi.bg, padding: '8px', borderRadius: '8px', color: kpi.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={20} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {kpi.title}
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
                      {kpi.value}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <PredictiveInventoryAlerts products={products} />
          <AdminSupplyNotifierWidget />
        </div>
      )}

      {activeFilters.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          alignItems: 'center',
          padding: '0.5rem 1.5rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          backgroundColor: 'var(--color-bg-subtle, #f8fafc)',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          margin: '0.5rem 0 1.5rem 0'
        }}>
          <span style={{ fontWeight: 600 }}>Active Filters:</span>
          {activeFilters.map((filter, idx) => (
            <span key={idx} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: 'var(--primary-light, #eff6ff)',
              color: 'var(--primary, #1d4ed8)',
              padding: '2px 8px',
              borderRadius: '100px',
              fontWeight: 600,
              fontSize: '0.75rem',
              border: '1px solid var(--primary-border, #bfdbfe)'
            }}>
              {filter.label}: {filter.value}
              <button
                onClick={() => handleFilterRemove(filter)}
                style={{
                  border: 'none',
                  background: 'none',
                  color: 'var(--primary, #1d4ed8)',
                  cursor: 'pointer',
                  fontWeight: 800,
                  padding: '0 2px',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}
              >
                ✕
              </button>
            </span>
          ))}
          <button
            onClick={() => {
              setFilterCategory('All');
              setFilterSupplier('All');
              setFilterProductType('All');
              setFilterStatus('All');
              setFilterWarehouse('All');
              setFilterStock('All');
              setFilterZoho('All');
              setFilterSource('All');
              setFilterBrand('All');
              setFilterCountry('All');
              setFilterMoq('All');
              setFilterLeadTime('All');
              setFilterRegulatory('All');
              setFilterCommercial('All');
              setFilterSku('');
              setSelectedQuickCategory('All');
              toast.success('All filters cleared');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#3b82f6',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 600
            }}
          >
            Clear All
          </button>
        </div>
      )}

      {!readOnly && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem 1rem',
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--border)',
            borderBottom: (isMobile || viewMode === 'card') ? '1px solid var(--border)' : 'none',
            borderRadius: (isMobile || viewMode === 'card') ? 'var(--radius-md)' : 'var(--radius-md) var(--radius-md) 0 0',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>
              Items ({filteredGroups.reduce((acc, g) => acc + g.variants.length, 0)} items in {filteredGroups.length} families)
            </div>
            
            {/* Desktop View Switcher */}
            {!isMobile && (
              <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden' }}>
                <button
                  onClick={() => setViewMode('list')}
                  style={{
                    padding: '4px 8px',
                    border: 'none',
                    backgroundColor: viewMode === 'list' ? 'var(--primary-light)' : 'transparent',
                    color: viewMode === 'list' ? 'var(--primary)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="List View"
                >
                  <List size={16} />
                </button>
                <button
                  onClick={() => setViewMode('card')}
                  style={{
                    padding: '4px 8px',
                    border: 'none',
                    backgroundColor: viewMode === 'card' ? 'var(--primary-light)' : 'transparent',
                    color: viewMode === 'card' ? 'var(--primary)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Card View"
                >
                  <LayoutGrid size={16} />
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', position: 'relative' }}>
            {/* Desktop Column Config Checklist Dropdown */}
            {!isMobile && viewMode === 'list' && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowColConfig(!showColConfig)}
                  className="btn btn-outline"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.85rem',
                    padding: '0.4rem 0.8rem',
                    backgroundColor: 'white',
                  }}
                >
                  Columns <ChevronDown size={14} />
                </button>
                {showColConfig && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-md)',
                    padding: '0.5rem',
                    zIndex: 50,
                    minWidth: '180px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    marginTop: '4px',
                  }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', padding: '2px 8px', borderBottom: '1px solid var(--border)', marginBottom: '4px' }}>
                      Configure Columns
                    </div>
                    {allColumnsList.map(col => (
                      <label
                        key={col.key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '0.8rem',
                          color: 'var(--text-main)',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <input
                          type="checkbox"
                          checked={visibleColumns.includes(col.key)}
                          onChange={() => toggleColumnVisibility(col.key)}
                          style={{ cursor: 'pointer' }}
                        />
                        {col.header}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

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
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(26,115,232,0.04)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
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
                transition: 'background-color 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#1765cc';
                e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#1a73e8';
                e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)';
              }}
            >
              <UploadCloud size={16} /> {importing ? 'IMPORTING...' : 'IMPORT'}
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
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading your catalogs...</div>
          ) : myCatalogs.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No catalogs found. You need to create a catalog first before adding items to it.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
              {myCatalogs.map(catalog => (
                <div 
                  key={catalog.id}
                  style={{
                    padding: '1rem',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: 'var(--color-bg-subtle)'
                  }}
                  onClick={() => handleAddToCatalog(catalog)}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.backgroundColor = 'var(--primary-light)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle)';
                  }}
                >
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>{catalog.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status: {catalog.status}</div>
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
            padding: '5rem 2rem',
            borderRadius: '16px',
            border: '1px dashed #dadce0',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ backgroundColor: '#f3f4f6', borderRadius: '50%', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <Package size={48} color="#9ca3af" />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>
            Your catalog is currently empty
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '400px', lineHeight: 1.5 }}>
            Start building your clinical and pharmaceutical offerings. You can add items manually or import them from a spreadsheet.
          </p>
          {!readOnly && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button 
                className="btn btn-primary" 
                onClick={() => setIsCreateProductModalOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem' }}
              >
                <Plus size={16} /> Add New Item
              </button>
              <button 
                className="btn btn-outline" 
                onClick={handleMigrate} 
                disabled={migrating}
                style={{ padding: '0.6rem 1.2rem' }}
              >
                {migrating ? 'Importing...' : 'Run Initial Import'}
              </button>
            </div>
          )}
        </div>
      )}

      <div style={{ marginBottom: '2rem' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading catalog...
          </div>
        ) : products.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Catalog is empty.
          </div>
        ) : (
          <>
          {isMobile || viewMode === 'card' ? (
            <>
              {renderCardView()}
              {renderPaginationControls()}
            </>
          ) : (
            <DataTable
              data={paginatedProducts}
              columns={columns}
              keyField="id"
              selectedIds={selectedProductIds}
              onSelectionChange={setSelectedProductIds}
              onRowClick={(row) => {
                setDrawerProduct(row.isGroup && row.variants.length === 1 ? row.variants[0] : row);
                setIsDrawerOpen(true);
              }}
              renderHoverActions={(row) => (
                <>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setDrawerProduct(row.isGroup && row.variants.length === 1 ? row.variants[0] : row); setIsDrawerOpen(true); }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', background: 'white', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-main)', boxShadow: 'var(--shadow-sm)' }}
                    title="Edit"
                  ><Edit3 size={14} /></button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeactivateSelected([row.id]); }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', background: 'white', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', color: '#ef4444', boxShadow: 'var(--shadow-sm)' }}
                    title="Archive"
                  ><Trash2 size={14} /></button>
                </>
              )}
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
              renderCustomFilters={null}
              renderBatchActions={(selected) => (
                <>
                  <button
                    onClick={() => handleAddToBulkOrder(selected)}
                    className="btn btn-primary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.8rem',
                      padding: '0.4rem 0.8rem',
                      backgroundColor: '#10b981',
                      borderColor: '#10b981'
                    }}
                  >
                    <ShoppingCart size={14} /> Add to Bulk Order
                  </button>
                  <button
                    onClick={() => handleDeactivateSelected(selected)}
                    className="btn btn-outline"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.8rem',
                      padding: '0.4rem 0.8rem',
                      color: '#ef4444',
                      borderColor: '#ef4444',
                      background: '#fef2f2'
                    }}
                  >
                    <XCircle size={14} /> Deactivate
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="btn btn-outline"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.8rem',
                      padding: '0.4rem 0.8rem',
                      background: 'white',
                    }}
                  >
                    <Download size={14} /> Export Selected
                  </button>
                  {!readOnly && (
                    <button
                      onClick={() => setBulkMode(bulkMode ? null : 'percent')}
                      className="btn btn-outline"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.8rem',
                        padding: '0.4rem 0.8rem',
                        background: 'white',
                      }}
                    >
                      <Percent size={14} /> Bulk Price Update
                    </button>
                  )}
                  {!readOnly && (
                    <button
                      onClick={handleOpenCatalogSelect}
                      className="btn btn-outline"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.8rem',
                        padding: '0.4rem 0.8rem',
                        background: 'white',
                      }}
                    >
                      <BookOpen size={14} /> Include in Catalog
                    </button>
                  )}
                </>
              )}
            />
          )}
          {hasMore && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
              <button 
                className="btn btn-outline" 
                onClick={() => fetchProducts(true)}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load more items'}
              </button>
            </div>
          )}
          </>
        )}
      </div>
    
      <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.8, background: 'var(--surface)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', pointerEvents: 'none', zIndex: 1000, boxShadow: 'var(--shadow-sm)' }}>
        Widget: AdminProductsTab | Props: none
      </div>
    
      {renderBulkActionsBar()}

      <BulkOrderSelectionModal 
        isOpen={isBulkOrderModalOpen}
        onClose={() => {
          setIsBulkOrderModalOpen(false);
          setSelectedProductIds([]);
        }}
        selectedProducts={productsToBulkOrder}
      />
      <CreateProductModal
        isOpen={isCreateProductModalOpen}
        onClose={() => setIsCreateProductModalOpen(false)}
        onCreated={() => { setIsCreateProductModalOpen(false); fetchProducts(); }}
      />
      <ProductDetailsDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => {
          setIsDrawerOpen(false);
          setDrawerProduct(null);
        }} 
        product={drawerProduct} 
        onSave={(updatedProduct) => {
          setIsDrawerOpen(false);
          setDrawerProduct(null);
          fetchProducts();
        }}
      />

      {/* Collapsible Advanced Filters Drawer */}
      <AnimatePresence>
        {isFilterDrawerOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterDrawerOpen(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.3)',
                backdropFilter: 'blur(2px)',
                zIndex: 9980,
              }}
            />

            {/* Drawer panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: '380px',
                maxWidth: '100vw',
                backgroundColor: '#ffffff',
                boxShadow: '-4px 0 24px rgba(15, 23, 42, 0.15)',
                zIndex: 9981,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
              }}
            >
              {/* Header */}
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: 700 }}>Advanced Filters</h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Configure master catalog parameters</span>
                </div>
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  style={{ border: 'none', background: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                >
                  <XCircle size={20} />
                </button>
              </div>

              {/* Drawer Body Scroll */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* PRODUCT SECTION */}
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Product</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '3px', fontWeight: 500 }}>Category</label>
                      <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ width: '100%', padding: '0.4rem 0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}>
                        <option value="All">All Categories</option>
                        {categoriesToShow.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '3px', fontWeight: 500 }}>Product Type</label>
                      <select value={filterProductType} onChange={(e) => setFilterProductType(e.target.value)} style={{ width: '100%', padding: '0.4rem 0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}>
                        <option value="All">All Types</option>
                        <option value="Peptide">Peptides (Finished)</option>
                        <option value="API Peptide">API Peptides</option>
                        <option value="API Supplement">API Supplements</option>
                        <option value="Supplement">Supplements</option>
                        <option value="Diagnostic Kit">Diagnostic Kits</option>
                        <option value="Service">Medical Services</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '3px', fontWeight: 500 }}>SKU Code</label>
                      <input type="text" value={filterSku} onChange={(e) => setFilterSku(e.target.value)} placeholder="SKU query..." style={{ width: '100%', padding: '0.4rem 0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '3px', fontWeight: 500 }}>Brand</label>
                      <select value={filterBrand} onChange={(e) => setFilterBrand(e.target.value)} style={{ width: '100%', padding: '0.4rem 0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}>
                        <option value="All">All Brands</option>
                        <option value="Atlas Health">Atlas Health</option>
                        <option value="Lotusland">Lotusland</option>
                        <option value="Helix Chemical">Helix Chemical</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* SUPPLIER SECTION */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Supplier</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '3px', fontWeight: 500 }}>Supplier</label>
                      <select value={filterSupplier} onChange={(e) => setFilterSupplier(e.target.value)} style={{ width: '100%', padding: '0.4rem 0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}>
                        <option value="All">All Suppliers</option>
                        {suppliersToShow.map((sup) => <option key={sup} value={sup}>{sup}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '3px', fontWeight: 500 }}>Country</label>
                      <select value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)} style={{ width: '100%', padding: '0.4rem 0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}>
                        <option value="All">All Countries</option>
                        <option value="UAE">UAE</option>
                        <option value="KSA">KSA</option>
                        <option value="EU">European Union</option>
                        <option value="US">United States</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '3px', fontWeight: 500 }}>Minimum Order Quantity (MOQ)</label>
                      <select value={filterMoq} onChange={(e) => setFilterMoq(e.target.value)} style={{ width: '100%', padding: '0.4rem 0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}>
                        <option value="All">No Restriction</option>
                        <option value="moq-1">MOQ = 1 Unit (No MOQ restriction)</option>
                        <option value="moq-10">MOQ &lt;= 10 Units</option>
                        <option value="moq-50">MOQ &lt;= 50 Units</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '3px', fontWeight: 500 }}>Lead Time</label>
                      <select value={filterLeadTime} onChange={(e) => setFilterLeadTime(e.target.value)} style={{ width: '100%', padding: '0.4rem 0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}>
                        <option value="All">No Restriction</option>
                        <option value="under-7">Under 7 Days (Fast delivery)</option>
                        <option value="under-14">Under 14 Days</option>
                        <option value="over-14">Over 14 Days</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* INVENTORY SECTION */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Inventory</h4>
                  <select value={filterStock} onChange={(e) => setFilterStock(e.target.value)} style={{ width: '100%', padding: '0.4rem 0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}>
                    <option value="All">All Stock Levels</option>
                    <option value="In Stock">In Stock (&gt;= 20 units)</option>
                    <option value="Low Stock">Low Stock (&lt; 20 units)</option>
                    <option value="Out of Stock">Out of Stock (0 units)</option>
                    <option value="Reorder Needed">Reorder Needed (Stock &lt;= Reorder Point)</option>
                  </select>
                </div>

                {/* REGULATORY SECTION */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Regulatory</h4>
                  <select value={filterRegulatory} onChange={(e) => setFilterRegulatory(e.target.value)} style={{ width: '100%', padding: '0.4rem 0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}>
                    <option value="All">All Compliance States</option>
                    <option value="Registered">Registered & Compliant</option>
                    <option value="Pending">Pending Audit</option>
                    <option value="Missing CoA">Missing CoA Document</option>
                    <option value="Missing MSDS">Missing MSDS Document</option>
                    <option value="Missing GMP">Missing GMP Document</option>
                  </select>
                </div>

                {/* COMMERCIAL SECTION */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Commercial</h4>
                  <select value={filterCommercial} onChange={(e) => setFilterCommercial(e.target.value)} style={{ width: '100%', padding: '0.4rem 0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}>
                    <option value="All">All Commercial Flags</option>
                    <option value="No Price">No B2C/Retail Price Assigned</option>
                    <option value="Low Margin">Low Profit Margin Alert (&lt; 20%)</option>
                    <option value="No Supplier">No Supplier Assigned</option>
                    <option value="No Image">No Product Image uploaded</option>
                  </select>
                </div>

                {/* ZOHO SECTION */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Zoho Sync</h4>
                  <select value={filterZoho} onChange={(e) => setFilterZoho(e.target.value)} style={{ width: '100%', padding: '0.4rem 0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}>
                    <option value="All">All Zoho States</option>
                    <option value="Synced">Synced with Zoho Books</option>
                    <option value="Not Synced">Not Synced with Zoho Books</option>
                    <option value="Sync Error">Sync Error / Failed status</option>
                  </select>
                </div>
              </div>

              {/* Footer Reset & Apply */}
              <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px', backgroundColor: '#f8fafc' }}>
                <button
                  onClick={() => {
                    setFilterCategory('All');
                    setFilterSupplier('All');
                    setFilterProductType('All');
                    setFilterStatus('All');
                    setFilterWarehouse('All');
                    setFilterStock('All');
                    setFilterZoho('All');
                    setFilterBrand('All');
                    setFilterCountry('All');
                    setFilterMoq('All');
                    setFilterLeadTime('All');
                    setFilterRegulatory('All');
                    setFilterCommercial('All');
                    setFilterSku('');
                    setSelectedQuickCategory('All');
                    toast.success('All filters cleared');
                  }}
                  style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  Reset Filters
                </button>
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: 'none', backgroundColor: 'var(--primary)', color: '#ffffff', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
