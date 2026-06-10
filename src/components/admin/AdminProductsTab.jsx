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
  CheckCircle2
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

  const columns = [
    {
      key: 'product',
      header: 'Product',
      sortKey: 'name',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '4px 0' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '4px', backgroundColor: 'var(--color-bg-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)'
          }}>
            <Package size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '2px' }}>
              {row.name}
            </div>
            {row.isGroup && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {row.variants.length} variant{row.variants.length !== 1 && 's'}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{row.category || 'N/A'}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <StatusChip status={row.stock > 0 ? (row.isActive ? 'Active' : 'Draft') : 'Out of Stock'} />
      )
    },
    {
      key: 'stock',
      header: 'Stock',
      sortable: true,
      sortValue: row => row.totalStock,
      render: (row) => {
        const stock = row.isGroup ? row.totalStock : row.stock;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ 
              fontSize: '0.85rem', 
              fontWeight: 500,
              color: stock > 20 ? '#10b981' : (stock > 0 ? '#f59e0b' : '#ef4444')
            }}>
              {stock || 0}
            </span>
          </div>
        );
      }
    },
    {
      key: 'guestVialPrice',
      header: 'Retail Price',
      sortable: true,
      render: (row) => (
        <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
          {row.guestVialPrice ? `$${row.guestVialPrice}` : '-'}
        </span>
      )
    }
  ];

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
      const matchesCategory = filterCategory === 'All' || p?.category === filterCategory;
      const matchesSupplier = filterSupplier === 'All' || p?.supplier === filterSupplier;
      const matchesStatus =
        filterStatus === 'All' ||
        (filterStatus === 'Active' && p?.isActive !== false) ||
        (filterStatus === 'Inactive' && p?.isActive === false);
      const matchesWarehouse = filterWarehouse === 'All' || p?.warehouse === filterWarehouse;

      let matchesStock = true;
      if (filterStock === 'Out of Stock') matchesStock = p?.stock < 1;
      else if (filterStock === 'Low Stock') matchesStock = p?.stock >= 1 && p?.stock < 20;
      else if (filterStock === 'In Stock') matchesStock = p?.stock >= 20;

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
        if (filterZoho === 'Synced') matchesZoho = !!p.zoho_item_id;
        if (filterZoho === 'Not Synced') matchesZoho = !p.zoho_item_id;
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

      let matchesProductType = true;
      if (filterProductType !== 'All') {
         matchesProductType = p.product_type === filterProductType;
      }

      return (
        matchesCategory &&
        matchesSupplier &&
        matchesProductType &&
        matchesStatus &&
        matchesWarehouse &&
        matchesStock &&
        matchesSearch &&
        matchesDate &&
        matchesZoho &&
        matchesSource
      );
    });
  });

  const activeFilters = [];
  if (filterCategory !== 'All') activeFilters.push({ label: 'Category', value: filterCategory, type: 'category' });
  if (filterSupplier !== 'All') activeFilters.push({ label: 'Supplier', value: filterSupplier, type: 'supplier' });
  if (filterProductType !== 'All') activeFilters.push({ label: 'Product Type', value: filterProductType, type: 'productType' });
  if (filterStatus !== 'All') activeFilters.push({ label: 'Status', value: filterStatus, type: 'status' });
  if (filterWarehouse !== 'All') activeFilters.push({ label: 'Warehouse', value: filterWarehouse, type: 'warehouse' });
  if (filterStock !== 'All') activeFilters.push({ label: 'Stock', value: filterStock, type: 'stock' });
  if (filterZoho !== 'All') activeFilters.push({ label: 'Zoho', value: filterZoho, type: 'zoho' });
  if (filterSource !== 'All') activeFilters.push({ label: 'Source', value: filterSource, type: 'source' });

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

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'var(--color-bg-app)', paddingBottom: '0.5rem', margin: '0 -1.5rem', padding: '0 1.5rem 0.5rem 1.5rem' }}>
        <AdminPageHeader
          title="Items & Catalog"
          subtitle="Manage all products, APIs, supplements, and services"
          icon={Package}
        />
        
        <ProductContextSwitcher 
          searchTerm={searchTerm} 
          currentTab="products" 
          onClear={() => setSearchTerm('')} 
        />
      </div>
      {isAdmin && !readOnly && (
        <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem',
            marginBottom: '0.5rem'
          }}>
            <div style={{ backgroundColor: 'var(--surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ backgroundColor: 'var(--primary-light)', padding: '12px', borderRadius: '10px', color: 'var(--primary)' }}>
                <Package size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Items</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>{products.length}</div>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ backgroundColor: '#fff7ed', padding: '12px', borderRadius: '10px', color: '#ea580c' }}>
                <Activity size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Low Stock</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
                  {products.filter(p => p.stock > 0 && p.stock <= 20).length}
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ backgroundColor: '#fef2f2', padding: '12px', borderRadius: '10px', color: '#dc2626' }}>
                <ShoppingCart size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Out of Stock</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
                  {products.filter(p => p.stock === 0).length}
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ backgroundColor: '#f0fdf4', padding: '12px', borderRadius: '10px', color: '#16a34a' }}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Items</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
                  {products.filter(p => p.isActive !== false).length}
                </div>
              </div>
            </div>
          </div>
          
          <PredictiveInventoryAlerts products={products} />
          <AdminSupplyNotifierWidget />
        </div>
      )}

      <div style={{ margin: '0 0 1.5rem 0' }}>
        <FilterBar filters={activeFilters} onRemoveFilter={handleFilterRemove} onClearAll={() => {
          setFilterCategory('All');
          setFilterSupplier('All');
          setFilterProductType('All');
          setFilterStatus('All');
          setFilterWarehouse('All');
          setFilterStock('All');
          setFilterZoho('All');
          setFilterSource('All');
        }}>
          {renderCustomFilters()}
        </FilterBar>
      </div>

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
          }}
        >
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>
            Items ({filteredGroups.reduce((acc, g) => acc + g.variants.length, 0)} items in {filteredGroups.length} families)
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
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
    </div>
  );
}
