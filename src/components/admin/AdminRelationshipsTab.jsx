import Layers from "lucide-react/dist/esm/icons/layers";
import Search from "lucide-react/dist/esm/icons/search";
import Filter from "lucide-react/dist/esm/icons/filter";
import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';



import DataTable from '../ui/DataTable';
import notifier from '../../services/NotificationService';

const CATEGORIES = [
  'Healing & Recovery',
  'Weight Management & Metabolic',
  'Anti-Aging & Longevity',
  'Cognitive & Neuro-Protection',
  'Muscle Growth & Performance',
  'Hormonal Support',
  'Research Supplies',
  'Other Research Peptides',
];

export default function AdminRelationshipsTab({ readOnly = false }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingProduct, setSavingProduct] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      const q = query(collection(db, 'products'));
      const querySnapshot = await getDocs(q);
      const productsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productsList);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  async function handleUpdateProduct(id, updates) {
    setSavingProduct(id);
    try {
      const productRef = doc(db, 'products', id);
      await updateDoc(productRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    } catch (err) {
      console.error('Error updating product:', err);
      notifier.info('Failed to update product.');
    } finally {
      setSavingProduct(null);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat =
        categoryFilter === 'all' ||
        p.category === categoryFilter ||
        (!p.category && categoryFilter === 'uncategorized');
      return matchesSearch && matchesCat;
    });
  }, [products, searchTerm, categoryFilter]);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter]);

  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const activeFilters = [];
  if (categoryFilter !== 'all') {
    activeFilters.push({ label: 'Category', value: categoryFilter, type: 'category' });
  }

  const handleFilterRemove = (filter) => {
    if (filter.type === 'category') setCategoryFilter('all');
  };

  const renderCustomFilters = () => (
    <select
      value={categoryFilter}
      onChange={(e) => setCategoryFilter(e.target.value)}
      style={{
        height: '32px', padding: '0 1.5rem 0 0.75rem', borderRadius: '16px',
        border: '1px solid var(--border)', backgroundColor: categoryFilter === 'all' ? 'white' : 'var(--primary-light)',
        color: categoryFilter === 'all' ? 'var(--text-main)' : 'var(--primary)',
        fontSize: '0.8rem', fontWeight: 500, outline: 'none', cursor: 'pointer', appearance: 'none',
      }}
    >
      <option value="all">Category: All</option>
      <option value="uncategorized">Uncategorized</option>
      {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
    </select>
  );

  const columns = [
    {
      header: 'Product Details',
      key: 'name',
      sortable: true,
      render: (p) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{p.name}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
            {p.dosage || '—'}
          </div>
        </div>
      ),
    },
    {
      header: 'Current Category',
      key: 'category',
      sortable: true,
      render: (p) => {
        if (readOnly) {
          return (
            <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
              {p.category || 'Uncategorized'}
            </span>
          );
        }
        return (
          <select
            value={p.category || ''}
            onChange={(e) => handleUpdateProduct(p.id, { category: e.target.value })}
            style={{
              width: '100%',
              maxWidth: '250px',
              padding: '0.4rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              fontSize: '0.85rem',
            }}
          >
            <option value="">Select Category...</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        );
      },
    },
    {
      header: 'Action',
      key: 'action',
      align: 'right',
      render: (p) => (
        <div style={{ display: 'inline-flex', alignItems: 'center' }}>
          {savingProduct === p.id ? (
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
              Updating...
            </span>
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 600 }}>
              Synced
            </span>
          )}
        </div>
      ),
    },
  ];

  if (loading)
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading catalog...
      </div>
    );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--color-primary)',
            }}
          >
            Product-Category Relationships
          </h2>
          <p
            style={{
              margin: '0.25rem 0 0',
              color: 'var(--color-text-secondary)',
              fontSize: '0.9rem',
            }}
          >
            Manage how products are organized within the catalog and investigational pathways.
          </p>
        </div>
      </div>

      <div
        style={{
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--table-radius)',
          backgroundColor: 'var(--color-bg-surface)',
          overflow: 'hidden',
        }}
      >
        <DataTable
          columns={columns}
          data={paginatedProducts}
          keyField="id"
          emptyTitle="No relationships found"
          emptyDescription="Try adjusting your filters or search term."
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
          searchPlaceholder="Search by product name..."
          filters={activeFilters}
          onFilterRemove={handleFilterRemove}
          renderCustomFilters={renderCustomFilters}
        />
      </div>
      <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.8, background: 'var(--surface)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', pointerEvents: 'none', zIndex: 1000, boxShadow: 'var(--shadow-sm)' }}>
        Widget: AdminRelationshipsTab | Props: none
      </div>
</div>
  );
}