'use client';
import { useRouter } from 'next/navigation';
import Percent from "lucide-react/dist/esm/icons/percent";
import Search from "lucide-react/dist/esm/icons/search";
import Sliders from "lucide-react/dist/esm/icons/sliders";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import BookOpen from "lucide-react/dist/esm/icons/book-open";
import TrendingDown from "lucide-react/dist/esm/icons/trending-down";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import Minus from "lucide-react/dist/esm/icons/minus";
import Edit3 from "lucide-react/dist/esm/icons/edit-3";
import AppActionGroup from '../ui/AppActionGroup';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  getGlobalSettings,
  updateGlobalSettings,
  saveCategoryDiscountsAndVariants,
  getCompetitorCache
} from '../../services/settingsService';

import { useSearchParams } from 'next/navigation';
import { getCatalog, getVariants } from '../../repositories/productRepository';










import DataTable from '../ui/DataTable';
import AppEntityCell from '../ui/AppEntityCell';
import ProductContextSwitcher from './ProductContextSwitcher';
import VariantPricingEditor from './VariantPricingEditor';

export default function AdminPricesTabClient({ isSubTab = false, initialProducts = null, initialDiscounts = null, initialSearch = '' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState(initialProducts || []);
  const [discounts, setDiscounts] = useState(initialDiscounts || {});
  const [competitorData, setCompetitorData] = useState([]);
  const [loading, setLoading] = useState(!initialProducts);
  const [savingStatus, setSavingStatus] = useState({ type: null, target: null, status: null });
  const [searchTerm, setSearchTerm] = useState(initialSearch || searchParams?.get('sku') || '');
  const [selectedCategory, setSelectedCategory] = useState('All');
  // Auto-expand the product row when coming from the Products tab via ?productId=
  const autoExpandProductId = searchParams?.get('productId') || null;
  const [expandedRowIds, setExpandedRowIds] = useState(() => autoExpandProductId ? new Set([autoExpandProductId]) : new Set());

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  useEffect(() => {
    fetchPricingData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  async function fetchPricingData() {
    if (!initialProducts) {
      setLoading(true);
    }
    try {
      // 1. Fetch products via Repository cache
      const productsList = await getCatalog();

      // 2. Fetch global settings for discounts via settingsService
      const globalData = await getGlobalSettings();
      let loadedDiscounts = globalData.categoryDiscounts || {};

      // Establish defaults (15%) for any categories that exist on products but not in settings
      const uniqueCategories = [...new Set(productsList.map((p) => p.category).filter(Boolean))];
      let updatedDiscounts = { ...loadedDiscounts };
      let neededSave = false;

      uniqueCategories.forEach((cat) => {
        if (updatedDiscounts[cat] === undefined) {
          updatedDiscounts[cat] = 15;
          neededSave = true;
        }
      });

      if (neededSave) {
        await updateGlobalSettings({ categoryDiscounts: updatedDiscounts });
      }

      // 3. Fetch competitor cache via settingsService
      const compCache = await getCompetitorCache();
      if (compCache.matches) {
        setCompetitorData(compCache.matches);
      }

      setProducts(productsList);
      setDiscounts(updatedDiscounts);
      window.dispatchEvent(new CustomEvent('admin-context-update', {
        detail: {
          page: 'prices',
          totalProducts: productsList.length,
          categoriesWithDiscounts: Object.keys(updatedDiscounts),
          globalDiscounts: updatedDiscounts,
          samplePrices: productsList.slice(0, 5).map(p => ({ sku: p.sku, price: p.price, activeDiscount: updatedDiscounts[p.category] || 0 })),
          summary: `Pricing dashboard: ${productsList.length} products loaded. Global discounts applied across ${Object.keys(updatedDiscounts).length} categories.`
        }
      }));
    } catch (err) {
      console.error('Error loading pricing data:', err);
    } finally {
      setLoading(false);
    }
  };

  async function handleDiscountChange(category, valueString) {
    let discountVal = parseFloat(valueString);
    if (isNaN(discountVal)) return;
    if (discountVal < 0) discountVal = 0;
    if (discountVal > 100) discountVal = 100;

    if (discounts[category] === discountVal) return;

    setSavingStatus({ type: 'discount', target: category, status: 'saving' });

    try {
      const updatedDiscounts = { ...discounts, [category]: discountVal };

      // Build flat list of variants for settingsService batch
      const affectedProducts = products.filter((p) => p.category === category);
      const affectedVariants = [];
      for (const p of affectedProducts) {
        const variants = await getVariants(p.id);
        for (const v of variants) {
          affectedVariants.push({ productId: p.id, variantId: v.id, retail: v.pricing?.retail || 0 });
        }
      }

      const totalUpdated = await saveCategoryDiscountsAndVariants(updatedDiscounts, affectedVariants, discountVal);
      console.log(`Successfully updated ${totalUpdated} variants for category ${category}`);

      setDiscounts(updatedDiscounts);
      setSavingStatus({ type: 'discount', target: category, status: 'saved' });
      setTimeout(() => setSavingStatus({ type: null, target: null, status: null }), 3000);
    } catch (err) {
      console.error('Error saving category discount:', err);
      setSavingStatus({ type: 'discount', target: category, status: 'error' });
    }
  };

  // --------------------------------------------------------
  // Filters & Pagination Setup
  // --------------------------------------------------------

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '6rem 0',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(0, 54, 102, 0.1)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '1.5rem',
          }}
        />
        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
          Loading Pricing Architecture...
        </span>
      </div>
    );
  }

  // Get list of categories dynamically from products
  const uniqueCategories = [...new Set(products.map((p) => p.category).filter(Boolean))];

  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchSearch = !term ||
      (p?.name         || '').toLowerCase().includes(term) ||
      (p?.canonicalName|| '').toLowerCase().includes(term) ||
      (p?.displayName  || '').toLowerCase().includes(term) ||
      (p?.sku          || '').toLowerCase().includes(term);
    const matchCategory = selectedCategory === 'All' || p?.category === selectedCategory;
    return matchSearch && matchCategory;
  });



  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const activeFilters = [];
  if (selectedCategory !== 'All') {
    activeFilters.push({ label: 'Category', value: selectedCategory, type: 'category' });
  }

  const handleFilterRemove = (filter) => {
    if (filter.type === 'category') setSelectedCategory('All');
  };

  const renderCustomFilters = () => (
    <select
      value={selectedCategory}
      onChange={(e) => setSelectedCategory(e.target.value)}
      style={{
        padding: '0.5rem 1.5rem 0.5rem 1rem',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border)',
        backgroundColor: 'white',
        fontSize: '0.85rem',
        fontWeight: 650,
        color: 'var(--text-main)',
      }}
    >
      <option value="All">All Categories</option>
      {uniqueCategories.map((cat) => (
        <option key={cat} value={cat}>
          {cat}
        </option>
      ))}
    </select>
  );

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      {/* Description header */}
      {!isSubTab && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '2.5rem',
          }}
        >
          <div>
            <h2
              style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}
            >
              Pricing Matrix Control
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
              Set category B2B discounts and adjust individual peptide guest pricing. Tier
              calculations update instantly.
            </p>
          </div>
          <button
            onClick={fetchPricingData}
            className="admin-quick-btn"
            style={{ padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RefreshCw size={14} /> Refresh Data
          </button>
        </div>
      )}

      {!isSubTab && (
        <ProductContextSwitcher 
          searchTerm={searchTerm} 
          productId={autoExpandProductId}
          currentTab="prices" 
          onClear={() => {
            setSearchTerm('');
            router.push('/admin/prices', { replace: true });
          }} 
        />
      )}

      {/* 1. Global Category Wholesale Discounts */}
      {!isSubTab && (
        <div
          className="card"
          style={{ padding: '2rem', marginBottom: '2.5rem', border: '1px solid var(--border)' }}
        >
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}
        >
          <Sliders size={20} color="var(--primary)" />
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 850, color: 'var(--primary)' }}>
            Category B2B Discounts
          </h3>
        </div>

        <DataTable
          data={uniqueCategories.map((cat) => ({
            id: cat,
            category: cat,
            discount: discounts[cat] ?? 15,
          }))}
          keyField="id"
          columns={[
            {
              key: 'category',
              header: 'Category',
              sortValue: (row) => row.category,
              render: (row) => (
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                    {row.category}
                  </div>
                  <div
                    style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}
                  >
                    B2B Professional Tier discount
                  </div>
                </div>
              ),
            },
            {
              key: 'discount',
              header: 'Discount (%)',
              align: 'right',
              sortValue: (row) => row.discount,
              render: (row) => {
                const cat = row.category;
                const currentDiscount = row.discount;
                const isSaving =
                  savingStatus.type === 'discount' &&
                  savingStatus.target === cat &&
                  savingStatus.status === 'saving';
                const isSaved =
                  savingStatus.type === 'discount' &&
                  savingStatus.target === cat &&
                  savingStatus.status === 'saved';
                const isError =
                  savingStatus.type === 'discount' &&
                  savingStatus.target === cat &&
                  savingStatus.status === 'error';

                return (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '1rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}
                    >
                      {isSaving && (
                        <span
                          style={{
                            color: 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          <RefreshCw size={12} className="animate-spin" /> Saving...
                        </span>
                      )}
                      {isSaved && (
                        <span
                          style={{
                            color: 'var(--success)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          <CheckCircle size={12} /> Saved
                        </span>
                      )}
                      {isError && (
                        <span
                          style={{
                            color: 'var(--error)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          <AlertCircle size={12} /> Error
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        defaultValue={currentDiscount}
                        onBlur={(e) => handleDiscountChange(cat, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleDiscountChange(cat, e.target.value);
                        }}
                        style={{
                          width: '80px',
                          padding: '0.5rem 1.8rem 0.5rem 0.75rem',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.9rem',
                          fontWeight: 800,
                          color: 'var(--primary)',
                          textAlign: 'right',
                        }}
                      />
                      <Percent
                        size={14}
                        style={{ position: 'absolute', right: '8px', color: 'var(--text-muted)' }}
                      />
                    </div>
                  </div>
                );
              },
            },
          ]}
        />
      </div>
      )}

      {/* 2. Products Pricing Matrix */}
      <div
        className="card"
        style={{ padding: '0', border: '1px solid var(--border)', overflow: 'hidden' }}
      >


        {/* Pricing Table */}
        <DataTable
          columns={[
            {
              key: 'product',
              header: 'Product / Category',
              sortValue: (p) => p.name || '',
              render: (p) => (
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <AppEntityCell
                    title={p.name}
                    subtitle={
                      <>
                        <span style={{ opacity: 0.5 }}>↳</span> {p.category} | SKU: {p.sku || 'N/A'} |{' '}
                        {p.dosage || 'No dosage'}
                      </>
                    }
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/admin/products?search=${encodeURIComponent(p.sku || p.name)}`);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.4rem 0.6rem',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--primary)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-raised)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    title="Ir a Ficha Clínica (Materia Medica)"
                  >
                    <BookOpen size={14} /> Ficha Clínica
                  </button>
                </div>
              ),
            },
            {
              key: 'market',
              header: 'Market Benchmark',
              render: (p) => {
                const match = competitorData.find(m => m.productName === p.name || m.productName === p.displayName);
                if (!match || !match.competitors || match.competitors.length === 0) {
                  return <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No data</div>;
                }
                const bestMatch = match.competitors[0];
                // Compare with our guestVialPrice
                const myPrice = parseFloat(p.guestVialPrice) || 0;
                const compPrice = parseFloat(bestMatch.price_usd) || 0;
                const isExpensive = myPrice > compPrice && myPrice > 0;
                const isCheaper = myPrice < compPrice && myPrice > 0;
                return (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      ${compPrice.toFixed(2)}
                    </div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.25rem',
                      color: isExpensive ? 'var(--error)' : (isCheaper ? 'var(--success)' : 'var(--text-muted)') 
                    }}>
                      {bestMatch.competitor_name}
                      {isExpensive && <span title="We are more expensive"><TrendingDown size={12} /></span>}
                      {isCheaper && <span title="We are cheaper"><TrendingUp size={12} /></span>}
                      {!isExpensive && !isCheaper && myPrice > 0 && <span title="Price matching"><Minus size={12} /></span>}
                    </div>
                  </div>
                );
              }
            },
            {
              key: 'actions',
              header: 'Actions',
              align: 'right',
              render: (p) => (
                <div style={{ display: 'inline-flex', justifyContent: 'flex-end', width: '100%' }}>
                  <AppActionGroup
                    maxVisible={3}
                    actions={[
                      {
                        type: 'clone',
                        label: 'Duplicate Pricing Rule',
                        onClick: () => {
                          const catDiscount = discounts[p.category] ?? 15;
                          navigator?.clipboard?.writeText(JSON.stringify({
                            productName: p.name,
                            category: p.category,
                            discountPercent: catDiscount,
                            vialPrice: p.guestVialPrice || 0
                          }, null, 2));
                          toast.success(`Pricing configuration for "${p.name}" copied to clipboard!`);
                        }
                      },
                      {
                        type: 'edit',
                        label: 'Edit Pricing & Tiers',
                        onClick: () => {
                          setExpandedRowIds(prev => {
                            const next = new Set(prev);
                            if (next.has(p.id)) next.delete(p.id);
                            else next.add(p.id);
                            return next;
                          });
                        }
                      },
                      {
                        type: 'view',
                        label: 'View in Products Catalog',
                        onClick: () => router.push(`/admin/products?search=${encodeURIComponent(p.sku || p.name)}`)
                      }
                    ]}
                  />
                </div>
              )
            }
          ]}
          data={paginatedProducts}
          keyField="id"
          emptyTitle="No products found"
          emptyDescription="Try adjusting the search criteria or category filter."
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
          searchPlaceholder="Search by SKU or name..."
          filters={activeFilters}
          onFilterRemove={handleFilterRemove}
          renderCustomFilters={renderCustomFilters}
          expandableRender={(p) => {
            const categoryDiscount = discounts[p.category] ?? 15;
            return (
              <div
                style={{
                  padding: '1rem',
                  borderLeft: '3px solid var(--primary)',
                  backgroundColor: 'var(--surface-raised)',
                  marginBottom: '1rem'
                }}
              >
                <VariantPricingEditor product={p} categoryDiscount={categoryDiscount} />
              </div>
            );
          }}
        />
      </div>
      <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.8, background: 'var(--surface)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', pointerEvents: 'none', zIndex: 1000, boxShadow: 'var(--shadow-sm)' }}>
        Widget: AdminPricesTabClient | Props: none
      </div>
    </div>
  );
}
