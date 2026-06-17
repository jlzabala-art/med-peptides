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
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../../firebase';
import { getDocs, collection, writeBatch, doc, setDoc, updateDoc } from 'firebase/firestore';
import { pdfData, normalize, customMappings, getSubcategory } from './regenpept_data';
import Papa from 'papaparse';
import { useCatalogData } from './useCatalogData';
import OperationalActionCards from './OperationalActionCards';
import CatalogProductsWorkspace from './views/CatalogProductsWorkspace';
import CatalogErrorBoundary from './CatalogErrorBoundary';
import { BulkSupplierModal, BulkTagModal, BulkPoModal, BulkQuoteModal } from './modals/CatalogBulkActionModals';

import ProductDetailsDrawer from '../products/ProductDetailsDrawer';
import SmartProductIntakeWizard from './SmartProductIntakeWizard';
import AdvancedFiltersDrawer from './AdvancedFiltersDrawer';
import CatalogImportWizard from './CatalogImportWizard';
import ProductIntelligenceModal from './ProductIntelligenceModal';
import VariantDetailsModal from '../products/VariantDetailsModal';
import CatalogHeaderGadget from '../../../gadgets/catalog/CatalogHeaderGadget';

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
  // Products Workspace specific state
  const [activeWorkspace] = useState('products');
  const [activeDisplayMode, setActiveDisplayMode] = useState(isMobile ? 'cards' : 'table');

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategories, setActiveCategories] = useState([]);
  const [activeKpis, setActiveKpis] = useState([]);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

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
    activeWorkspace,
    pageSize: 20
  });

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

  // Filter variants for the specific views (Inventory, Regulatory, Suppliers, Missing Data)
  // Note: CatalogProductsWorkspace still accepts products and does its own filtering if needed,
  // but we can pass variants to it as well, or we can filter the products array as before.
  const deferredSearchQuery = React.useDeferredValue(searchQuery);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Basic Filters (Search & Categories)
      if (activeCategories.length > 0) {
        const cat = p.category || 'Uncategorized';
        if (!activeCategories.includes(cat)) return false;
      }
      if (deferredSearchQuery) {
        const q = deferredSearchQuery.toLowerCase();
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
        const variants = p.variants || [];

        if (activeKpis.includes('missing_coa')) {
          const hasMissingCoa = !p.hasCoa || variants.some((v) => !v.hasCoa);
          if (!hasMissingCoa) return false;
        }
        if (activeKpis.includes('missing_supplier')) {
          const hasMissingSupplier = !p.supplier || p.supplier === 'Unassigned' || variants.some((v) => !v.supplier || v.supplier === 'Unassigned');
          if (!hasMissingSupplier) return false;
        }
        if (activeKpis.includes('regulatory_risk')) {
          const hasRisk = p.registrationStatus !== 'Registered' || variants.some((v) => v.registrationStatus !== 'Registered');
          if (!hasRisk) return false;
        }
        if (activeKpis.includes('single_source')) {
          const isSingleSource = p.suppliersCount === 1 || !p.suppliersCount || variants.some((v) => v.suppliersCount === 1 || !v.suppliersCount);
          if (!isSingleSource) return false;
        }
        if (activeKpis.includes('low_health')) {
          const hasLowHealth = (p.healthScore || 100) < 70 || variants.some((v) => (v.healthScore || 100) < 70);
          if (!hasLowHealth) return false;
        }
        if (activeKpis.includes('out_of_stock')) {
          const hasOutOfStock = p.stock === 0 || p.inventoryLevel === 0 || variants.some((v) => v.stock === 0 || v.inventoryLevel === 0);
          if (!hasOutOfStock) return false;
        }
      }

      return true;
    });
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
  }, [variants, deferredSearchQuery, activeWorkspace, advancedFilters]);

  // --- External Filters Visibility ---
  const activeFiltersVisuals = useMemo(() => {
    const visuals = [];

    // KPI Filters
    activeKpis.forEach((kpi) => {
      const labels = {
        missing_coa: 'Missing COA',
        missing_supplier: 'Missing Supplier',
        regulatory_risk: 'Regulatory Risk',
        single_source: 'Single Source',
        low_health: 'Low Health',
        out_of_stock: 'Out of Stock',
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

  const handleAction = (action, product, variant, context = 'overview') => {
    if (action === 'edit_variant' && variant) {
      setSelectedProduct(product);
      setSelectedVariant(variant);
      setVariantEditMode(context);
      setIsVariantModalOpen(true);
    } else if (action === 'edit') {
      setSelectedProduct(product);
      setIsDrawerOpen(true);
    } else if (action === 'clone_variant' && variant) {
      import('firebase/firestore').then(({ collection, addDoc }) => {
        const vRef = collection(db, 'products', product.id, 'variants');
        const newVariantData = { ...variant, sku: variant.sku ? variant.sku + '-COPY' : 'NEW-COPY', updatedAt: new Date().toISOString() };
        delete newVariantData.id;
        addDoc(vRef, newVariantData)
          .then(() => toast.success('Variant cloned successfully.'))
          .catch(e => toast.error('Failed to clone variant: ' + e.message));
      });
    } else if (action === 'clone_product' && product) {
      import('firebase/firestore').then(({ collection, addDoc }) => {
        const pRef = collection(db, 'products');
        const newProductData = { ...product, sku: product.sku ? product.sku + '-COPY' : 'NEW-COPY', name: product.name ? product.name + ' (Copy)' : 'Copy', updatedAt: new Date().toISOString() };
        delete newProductData.id;
        delete newProductData.variants;
        addDoc(pRef, newProductData)
          .then(() => toast.success('Product cloned successfully.'))
          .catch(e => toast.error('Failed to clone product: ' + e.message));
      });
    } else if (action === 'delete_variant' && variant) {
      toast(
        (t) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <span style={{ fontWeight: 600 }}>Delete variant {variant.sku || 'N/A'}?</span>
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
                  // Implementation for variant deletion
                  toast.dismiss(t.id);
                  toast.success('Variant deleted (mock)');
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
    } else if (action === 'bulk_delete') {
      const selectedIds = product;
      toast(
        (t) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <span style={{ fontWeight: 600 }}>Delete {selectedIds.length} selected items?</span>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button onClick={() => toast.dismiss(t.id)} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}>Cancel</button>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  toast.success(`${selectedIds.length} items deleted (Mock)`);
                }}
                style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontSize: '0.875rem' }}
              >
                Delete
              </button>
            </div>
          </div>
        ),
        { duration: Infinity }
      );
    } else if (
      [
        'bulk_supplier',
        'bulk_tag',
        'bulk_update',
        'bulk_mark_active',
        'bulk_mark_inactive'
      ].includes(action)
    ) {
      const selectedIds = product;
      setBulkActionState({ isOpen: true, type: action, ids: selectedIds });
    } else if (
      [
        'bulk_quote',
        'bulk_sales_order',
        'bulk_invoice',
        'bulk_po',
        'bulk_bill'
      ].includes(action)
    ) {
      const selectedIds = product;
      // Find the full items to prefill
      const prefilledItems = [];
      
      selectedIds.forEach(id => {
        // Find if it's a variant or product
        let found = variants.find(v => v.id === id);
        if (!found) {
          found = products.find(p => p.id === id);
        }
        
        if (found) {
          // Flatten some data so it matches the expected structure
          prefilledItems.push({
            id: found.id,
            name: found.name || found.displayName || 'Unknown Item',
            sku: found.sku || (found.parentProduct && found.parentProduct.sku) || '',
            images: found.images || (found.parentProduct && found.parentProduct.images) || [],
            description: found.description || found.supplier || '',
            stock: found.stock || 0,
            rate: found.msrp || found.price || found.cost || 0,
            cost: found.cost || found.unitCost || 0
          });
        }
      });

      // Map action to route type
      const routeTypeMap = {
        'bulk_quote': 'quote',
        'bulk_sales_order': 'sales-order',
        'bulk_invoice': 'invoice',
        'bulk_po': 'purchase-order',
        'bulk_bill': 'bill'
      };
      
      const routeType = routeTypeMap[action];
      navigate(`/admin/transactions/new/${routeType}`, { state: { prefilledItems } });
    } else if (action === 'ai_variant' || action === 'ai') {
      setAiProduct(product);
      setIsAiModalOpen(true);
    } else if (action === 'optimize_price') {
      const currentPrice = product.msrp || product.price || 0;
      const currentCost = product.cost || product.unitCost || 0;
      toast.promise(
        new Promise((resolve) => setTimeout(resolve, 2000)),
        {
          loading: `Atlas AI is analyzing market prices for ${product.name}...`,
          success: () => {
            // Mock AI suggestion logic based on cost
            const suggested = Math.ceil(currentCost * 1.5) - 0.01;
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontWeight: 600 }}>Atlas AI Price Optimizer</span>
                <span style={{ fontSize: '0.85rem' }}>Current: ${currentPrice} → Suggested: ${suggested}</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button 
                    onClick={() => {
                      toast.dismiss();
                      handleAction('quick_edit', product, 'msrp', suggested);
                    }}
                    style={{ padding: '4px 8px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.75rem', flex: 1 }}
                  >
                    Apply ${suggested}
                  </button>
                </div>
              </div>
            );
          },
          error: 'Analysis failed.',
        },
        { duration: Infinity }
      );
    } else if (action === 'quick_edit') {
      const field = variant; // field name passed as variant arg
      const val = arguments[3]; // value passed as 4th arg
      const updateData = {};
      if (field === 'cost') {
        updateData.cost = val;
        updateData.unitCost = val;
      } else if (field === 'msrp') {
        updateData.msrp = val;
        updateData.price = val;
      } else {
        updateData[field] = val;
      }

      import('firebase/firestore').then(({ doc, updateDoc }) => {
        let variantId = product.id;
        let productId = product.parentProduct?.id || product.originalProduct?.id;

        // If the product object IS the variant itself (flat mode row)
        if (product.isVariantRow) {
          variantId = product.id;
        }

        if (productId && variantId && !variantId.includes('-root')) {
          const vRef = doc(db, 'products', productId, 'variants', variantId);
          updateDoc(vRef, updateData)
            .then(() => {
              toast.success(`Updated ${field} successfully!`);
            })
            .catch((err) => {
              console.error('Quick edit error:', err);
              toast.error('Failed to update.');
            });
        } else {
          // If it's a main product pretending to be a variant
          const pRef = doc(db, 'products', product.id);
          updateDoc(pRef, updateData)
            .then(() => {
              toast.success(`Updated ${field} successfully!`);
            })
            .catch((err) => {
              console.error('Quick edit error:', err);
              toast.error('Failed to update.');
            });
        }
      });
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

  const runRegenPeptMigration = async () => {
    try {
      const loadingToast = toast.loading('Procesando catálogo RegenPept...');
      
      const snap = await getDocs(collection(db, 'products'));
      const dbProducts = snap.docs.map(d => ({ id: d.id, name: d.data().name, ref: d.ref }));

      let createdCount = 0;
      let updatedCount = 0;

      for (const item of pdfData) {
        const normName = normalize(item.name);
        let matchedProduct = dbProducts.find(p => {
          const normDbName = normalize(p.name);
          return normDbName.includes(normName) || normName.includes(normDbName) || customMappings[normName] === p.id;
        });

        if (!matchedProduct) {
          const newDocRef = doc(collection(db, 'products'));
          await setDoc(newDocRef, {
            name: item.name,
            slug: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            createdAt: new Date().toISOString(),
            supplier: "LotusLand",
            category: "Lyophilized Peptides",
            subcategory: getSubcategory(item.name),
            status: 'Active',
            visibility: 'Public'
          });
          matchedProduct = { id: newDocRef.id, name: item.name, ref: newDocRef };
          dbProducts.push(matchedProduct);
        } else {
          await updateDoc(matchedProduct.ref, { 
            supplier: "LotusLand",
            category: "Lyophilized Peptides",
            subcategory: getSubcategory(item.name)
          });
        }

        const variantsSnap = await getDocs(collection(db, 'products', matchedProduct.id, 'variants'));
        
        for (const v of item.variants) {
          const cleanSize = v.size.replace(/\s+/g, '');
          const expectedSku = `SKU-${matchedProduct.id.substring(0,8).toUpperCase()}-${cleanSize}-LOTUS`;
          
          let existingVariant = variantsSnap.docs.find(d => {
            const dData = d.data();
            return dData.sku === expectedSku || (dData.size && dData.size.replace(/\s+/g, '') === cleanSize && (dData.supplier === "Lotusland Limited" || dData.supplier === "LotusLand" || !dData.supplier || dData.supplier === "Unassigned"));
          });

          let dosageNum = v.size;
          let unitStr = "";
          const match = v.size.match(/^([\d.]+)\s*([a-zA-Z]+)$/);
          if (match) {
             dosageNum = parseFloat(match[1]);
             unitStr = match[2].toLowerCase();
          } else if (v.size.includes("|")) {
             const parts = v.size.split("|").map(s => s.trim());
             const m1 = parts[0].match(/^([\d.]+)\s*([a-zA-Z]+)$/);
             if (m1) {
                dosageNum = v.size.replace(/[a-zA-Z]+/g, '').replace(/\s+/g, '');
                unitStr = m1[2].toLowerCase();
             }
          }

          const payload = {
            sku: expectedSku,
            supplier: "LotusLand",
            format: v.format,
            size: v.size,
            dosage: dosageNum,
            dosage_unit: unitStr,
            pricing: {
              cost: v.price
            },
            updatedAt: new Date().toISOString()
          };

          if (existingVariant) {
            await updateDoc(existingVariant.ref, payload);
            updatedCount++;
          } else {
            const vRef = doc(collection(db, 'products', matchedProduct.id, 'variants'));
            await setDoc(vRef, {
              ...payload,
              status: 'Active',
              inventory: 0,
              createdAt: new Date().toISOString()
            });
            createdCount++;
          }
        }
      }

      toast.dismiss(loadingToast);
      toast.success(`¡Migración RegenPept completa! (${updatedCount} act, ${createdCount} nuevos)`);
    } catch (err) {
      console.error(err);
      toast.error('Error al migrar datos de RegenPept.');
    }
  };

  // Calculate unique suppliers for the modal
  const uniqueSuppliers = Array.from(new Set(
    [...products, ...variants].map(item => item.supplier).filter(Boolean)
  )).sort();

  return (
    <div className={styles.container}>
      <div style={{ padding: '0 1.5rem', marginBottom: '1rem', marginTop: '1rem' }}>
        <button
          onClick={runRegenPeptMigration}
          style={{
            backgroundColor: '#0ea5e9',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 4px rgba(14, 165, 233, 0.2)'
          }}
        >
          <Sparkles size={16} /> Procesar Catálogo RegenPept (LotusLand + Dosage)
        </button>
      </div>

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
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setIsAdvancedFiltersOpen={setIsAdvancedFiltersOpen}
          filteredCatalog={filteredProducts}
          isMobile={isMobile}
          isAddMenuOpen={isAddMenuOpen}
          setIsAddMenuOpen={setIsAddMenuOpen}
          setIntakeMode={setIntakeMode}
          setIsCreateModalOpen={setIsCreateModalOpen}
          setIsImportModalOpen={setIsImportModalOpen}
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

          {/* Quick Filters */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[
              { id: 'out_of_stock', label: 'Out of Stock' },
              { id: 'low_health', label: 'Low Health' },
            ].map((qf) => {
              const isActive = activeKpis.includes(qf.id);
              return (
                <button
                  key={qf.id}
                  onClick={() => handleFilterSelect(qf.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.3rem 0.8rem',
                    background: isActive ? 'var(--color-primary, #6366f1)' : '#ffffff',
                    border: `1px solid ${isActive ? 'var(--color-primary, #6366f1)' : 'var(--color-border, #e2e8f0)'}`,
                    borderRadius: '16px',
                    cursor: 'pointer',
                    fontWeight: 500,
                    fontSize: '0.75rem',
                    color: isActive ? '#ffffff' : 'var(--text-main, #1e293b)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {qf.label}
                </button>
              );
            })}
          </div>
        </div>

      {/* Active Filter Chips (if any) */}
      {(activeCategories.length > 0 ||
        activeFiltersVisuals.length > 0 ||
        (activeWorkspace === 'products' &&
          advancedFilters?.products?.supplier !== 'All Suppliers')) && (
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          {activeWorkspace === 'products' &&
            activeCategories.map((cat) => (
              <div
                key={cat}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  background: 'rgba(99,102,241,0.08)',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  color: 'var(--color-primary)',
                  fontWeight: 600,
                }}
              >
                {cat}
                <X
                  size={12}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setActiveCategories(activeCategories.filter((c) => c !== cat))}
                />
              </div>
            ))}
          {activeFiltersVisuals.map((filter) => (
            <div
              key={filter.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                background: 'var(--color-bg-hover, #f1f5f9)',
                borderRadius: '12px',
                fontSize: '0.75rem',
                color: 'var(--text-main)',
                fontWeight: 500,
              }}
            >
              {filter.label}
              <X
                size={12}
                style={{ cursor: 'pointer' }}
                onClick={() => handleRemoveFilter(filter.id)}
              />
            </div>
          ))}
          <button
            onClick={handleClearAllFilters}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
            }}
          >
            Clear all
          </button>
        </div>
      )}

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
        onClose={() => {
          setIsCreateModalOpen(false);
          refresh();
        }}
        onAddProduct={addProduct}
      />
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

      {/* Mobile Floating Action Button */}
      {isMobile && activeWorkspace === 'products' && (
        <button onClick={() => setIsCreateModalOpen(true)} className={styles.fab}>
          <Plus size={24} />
        </button>
      )}
    </div>
  );
}
