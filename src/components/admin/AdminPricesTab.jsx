import React, { useState, useEffect } from 'react';
import { collection, doc, getDocs, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Percent, Search, Sliders, RefreshCw, CheckCircle, AlertCircle, BookOpen } from 'lucide-react';
import DataTable from '../ui/DataTable';
import AppEntityCell from '../ui/AppEntityCell';

export default function AdminPricesTab() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [discounts, setDiscounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState({ type: null, target: null, status: null });
  const [searchTerm, setSearchTerm] = useState(searchParams.get('sku') || '');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchPricingData();
  }, []);

  async function fetchPricingData() {
    setLoading(true);
    try {
      // 1. Fetch products
      const productsRef = collection(db, 'products');
      const productsSnapshot = await getDocs(productsRef);
      const productsList = [];
      productsSnapshot.forEach((doc) => {
        productsList.push({ id: doc.id, ...doc.data() });
      });

      // 2. Fetch global settings for discounts
      const globalRef = doc(db, 'settings', 'global');
      const globalSnap = await getDoc(globalRef);
      let loadedDiscounts = {};

      if (globalSnap.exists()) {
        loadedDiscounts = globalSnap.data().categoryDiscounts || {};
      }

      // Establish defaults (15%) for any categories that exist on products but not in settings
      const uniqueCategories = [...new Set(productsList.map((p) => p.category).filter(Boolean))];
      let updatedDiscounts = { ...loadedDiscounts };
      let neededSave = false;

      uniqueCategories.forEach((cat) => {
        if (updatedDiscounts[cat] === undefined) {
          updatedDiscounts[cat] = 15; // default 15% discount
          neededSave = true;
        }
      });

      if (neededSave) {
        await setDoc(globalRef, { categoryDiscounts: updatedDiscounts }, { merge: true });
      }

      setProducts(productsList);
      setDiscounts(updatedDiscounts);
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

    // Check if changed
    if (discounts[category] === discountVal) return;

    setSavingStatus({ type: 'discount', target: category, status: 'saving' });

    try {
      const updatedDiscounts = {
        ...discounts,
        [category]: discountVal,
      };

      // 1. Save global settings
      const globalRef = doc(db, 'settings', 'global');
      await setDoc(globalRef, { categoryDiscounts: updatedDiscounts }, { merge: true });

      // 2. Recalculate and update pro prices for products in this category
      const affectedProducts = products.filter((p) => p.category === category);

      const updatePromises = affectedProducts.map((p) => {
        const guestVial = parseFloat(p.guestVialPrice) || 0;
        const guestKit = parseFloat(p.guestKitPrice) || 0;
        const proVial = parseFloat((guestVial * (1 - discountVal / 100)).toFixed(2));
        const proKit = parseFloat((guestKit * (1 - discountVal / 100)).toFixed(2));

        const productRef = doc(db, 'products', p.id);
        return updateDoc(productRef, {
          proVialPrice: proVial,
          proKitPrice: proKit,
          updatedAt: new Date().toISOString(),
        });
      });

      await Promise.all(updatePromises);

      // Update state
      setDiscounts(updatedDiscounts);
      setProducts((prevProducts) =>
        prevProducts.map((p) => {
          if (p.category === category) {
            const guestVial = parseFloat(p.guestVialPrice) || 0;
            const guestKit = parseFloat(p.guestKitPrice) || 0;
            const proVial = parseFloat((guestVial * (1 - discountVal / 100)).toFixed(2));
            const proKit = parseFloat((guestKit * (1 - discountVal / 100)).toFixed(2));
            return {
              ...p,
              proVialPrice: proVial,
              proKitPrice: proKit,
            };
          }
          return p;
        })
      );

      setSavingStatus({ type: 'discount', target: category, status: 'saved' });
      setTimeout(() => setSavingStatus({ type: null, target: null, status: null }), 3000);
    } catch (err) {
      console.error('Error saving category discount:', err);
      setSavingStatus({ type: 'discount', target: category, status: 'error' });
    }
  };

  async function handlePriceChange(productId, field, valueString) {
    let priceVal = parseFloat(valueString);
    if (isNaN(priceVal)) return;
    if (priceVal < 0) priceVal = 0;

    const product = products.find((p) => p.id === productId);
    if (!product) return;

    // Check if changed
    if (parseFloat(product[field]) === priceVal) return;

    const targetKey = `${productId}-${field}`;
    setSavingStatus({ type: 'product', target: targetKey, status: 'saving' });

    try {
      const categoryDiscount = discounts[product.category] ?? 15;
      const updates = {
        [field]: priceVal,
      };

      // Recalculate Pro Price
      if (field === 'guestVialPrice') {
        updates.proVialPrice = parseFloat((priceVal * (1 - categoryDiscount / 100)).toFixed(2));
      } else if (field === 'guestKitPrice') {
        updates.proKitPrice = parseFloat((priceVal * (1 - categoryDiscount / 100)).toFixed(2));
      }

      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });

      // Update state
      setProducts((prevProducts) =>
        prevProducts.map((p) => {
          if (p.id === productId) {
            return {
              ...p,
              ...updates,
            };
          }
          return p;
        })
      );

      setSavingStatus({ type: 'product', target: targetKey, status: 'saved' });
      setTimeout(() => setSavingStatus({ type: null, target: null, status: null }), 3000);
    } catch (err) {
      console.error('Error saving product price:', err);
      setSavingStatus({ type: 'product', target: targetKey, status: 'error' });
    }
  };

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
    const matchSearch =
      (p?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p?.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCategory = selectedCategory === 'All' || p?.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

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

      {/* 1. Global Category Wholesale Discounts */}
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
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
                      navigate(`/admin/products?search=${encodeURIComponent(p.sku || p.name)}`);
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
              key: 'status',
              header: 'Status',
              align: 'right',
              render: (p) => {
                const vialKey = `${p.id}-guestVialPrice`;
                const kitKey = `${p.id}-guestKitPrice`;
                const isSaving =
                  (savingStatus.type === 'product' &&
                    savingStatus.target === vialKey &&
                    savingStatus.status === 'saving') ||
                  (savingStatus.type === 'product' &&
                    savingStatus.target === kitKey &&
                    savingStatus.status === 'saving');
                const isSaved =
                  (savingStatus.type === 'product' &&
                    savingStatus.target === vialKey &&
                    savingStatus.status === 'saved') ||
                  (savingStatus.type === 'product' &&
                    savingStatus.target === kitKey &&
                    savingStatus.status === 'saved');

                return (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      minHeight: '24px',
                    }}
                  >
                    {isSaving && (
                      <RefreshCw size={14} className="animate-spin" color="var(--text-muted)" />
                    )}
                    {isSaved && <CheckCircle size={14} color="var(--success)" />}
                  </div>
                );
              },
            },
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
            const vialKey = `${p.id}-guestVialPrice`;
            const kitKey = `${p.id}-guestKitPrice`;

            const isVialSaving =
              savingStatus.type === 'product' &&
              savingStatus.target === vialKey &&
              savingStatus.status === 'saving';
            const isVialSaved =
              savingStatus.type === 'product' &&
              savingStatus.target === vialKey &&
              savingStatus.status === 'saved';

            const isKitSaving =
              savingStatus.type === 'product' &&
              savingStatus.target === kitKey &&
              savingStatus.status === 'saving';
            const isKitSaved =
              savingStatus.type === 'product' &&
              savingStatus.target === kitKey &&
              savingStatus.status === 'saved';

            return (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  gap: '1.5rem',
                  borderLeft: '3px solid var(--primary)',
                  paddingLeft: '1.25rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.25rem',
                    width: '100%',
                    maxWidth: '400px',
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: 'var(--text-main)',
                        marginBottom: '0.5rem',
                      }}
                    >
                      Guest Vial Price
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue={p.guestVialPrice}
                        onBlur={(e) => handlePriceChange(p.id, 'guestVialPrice', e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter')
                            handlePriceChange(p.id, 'guestVialPrice', e.target.value);
                        }}
                        style={{
                          width: '120px',
                          padding: '0.4rem 0.5rem',
                          border: isVialSaved
                            ? '1px solid var(--success)'
                            : '1px solid var(--border)',
                          borderRadius: 'var(--radius-sm)',
                          textAlign: 'right',
                          fontSize: '0.85rem',
                          fontWeight: 800,
                          color: 'var(--text-main)',
                          backgroundColor: isVialSaving ? 'var(--surface-raised)' : 'transparent',
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        marginTop: '0.25rem',
                      }}
                    >
                      Pro Vial (Est):{' '}
                      <span style={{ fontWeight: 800, color: 'var(--primary)' }}>
                        ${parseFloat(p.proVialPrice || 0).toFixed(2)}
                      </span>{' '}
                      (-{categoryDiscount}%)
                    </div>
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: 'var(--text-main)',
                        marginBottom: '0.5rem',
                      }}
                    >
                      Guest Kit Price
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue={p.guestKitPrice}
                        onBlur={(e) => handlePriceChange(p.id, 'guestKitPrice', e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter')
                            handlePriceChange(p.id, 'guestKitPrice', e.target.value);
                        }}
                        style={{
                          width: '120px',
                          padding: '0.4rem 0.5rem',
                          border: isKitSaved
                            ? '1px solid var(--success)'
                            : '1px solid var(--border)',
                          borderRadius: 'var(--radius-sm)',
                          textAlign: 'right',
                          fontSize: '0.85rem',
                          fontWeight: 800,
                          color: 'var(--text-main)',
                          backgroundColor: isKitSaving ? 'var(--surface-raised)' : 'transparent',
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        marginTop: '0.25rem',
                      }}
                    >
                      Pro Kit (Est):{' '}
                      <span style={{ fontWeight: 800, color: 'var(--secondary)' }}>
                        ${parseFloat(p.proKitPrice || 0).toFixed(2)}
                      </span>{' '}
                      (-{categoryDiscount}%)
                    </div>
                  </div>
                </div>
              </div>
            );
          }}
        />
      </div>
      <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.8, background: 'var(--surface)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', pointerEvents: 'none', zIndex: 1000, boxShadow: 'var(--shadow-sm)' }}>
        Widget: AdminPricesTab | Props: none
      </div>
    </div>
  );
}
