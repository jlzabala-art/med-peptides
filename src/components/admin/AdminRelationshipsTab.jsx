import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Layers, Search, Filter } from 'lucide-react';
import AppDataTable from '../ui/AppDataTable';
import AppFilterBar from '../ui/AppFilterBar';

const CATEGORIES = [
  "Healing & Recovery",
  "Weight Management & Metabolic",
  "Anti-Aging & Longevity",
  "Cognitive & Neuro-Protection",
  "Muscle Growth & Performance",
  "Hormonal Support",
  "Research Supplies",
  "Other Research Peptides"
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

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'products'));
      const querySnapshot = await getDocs(q);
      const productsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsList);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async (id, updates) => {
    setSavingProduct(id);
    try {
      const productRef = doc(db, 'products', id);
      await updateDoc(productRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    } catch (err) {
      console.error("Error updating product:", err);
      alert("Failed to update product.");
    } finally {
      setSavingProduct(null);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = categoryFilter === 'all' || p.category === categoryFilter || (!p.category && categoryFilter === 'uncategorized');
      return matchesSearch && matchesCat;
    });
  }, [products, searchTerm, categoryFilter]);

  const columns = [
    {
      header: 'Product Details',
      key: 'name',
      sortable: true,
      render: (p) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{p.name}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>{p.dosage || '—'}</div>
        </div>
      )
    },
    {
      header: 'Current Category',
      key: 'category',
      sortable: true,
      render: (p) => {
        if (readOnly) {
          return <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>{p.category || 'Uncategorized'}</span>;
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
              fontSize: '0.85rem'
            }}
          >
            <option value="">Select Category...</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        );
      }
    },
    {
      header: 'Action',
      key: 'action',
      align: 'right',
      render: (p) => (
        <div style={{ display: 'inline-flex', alignItems: 'center' }}>
          {savingProduct === p.id ? (
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Updating...</span>
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 600 }}>Synced</span>
          )}
        </div>
      )
    }
  ];

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading catalog...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>Product-Category Relationships</h2>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Manage how products are organized within the catalog and investigational pathways.</p>
        </div>
      </div>

      <AppFilterBar 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by product name..."
        filters={[
          {
            id: 'category',
            label: 'Category',
            value: categoryFilter,
            options: [
              { value: 'all', label: 'All Categories' },
              { value: 'uncategorized', label: 'Uncategorized' },
              ...CATEGORIES.map(c => ({ value: c, label: c }))
            ],
            onChange: setCategoryFilter
          }
        ]}
      />

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', backgroundColor: 'var(--color-bg-surface)', padding: '1rem', borderRadius: 'var(--table-radius)', border: '1px solid var(--color-border)', alignItems: 'center' }}>
        <Layers size={18} color="var(--color-primary)" />
        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
          {categoryFilter === 'all' && !searchTerm ? 'Total Catalog Products:' : 'Filtered Results:'}
        </span>
        <span style={{ backgroundColor: 'var(--color-bg-app)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700, border: '1px solid var(--color-border)' }}>
          {filteredProducts.length} items
        </span>
        {categoryFilter !== 'all' && (
           <span style={{ fontSize: '0.85rem', color: 'var(--color-text-tertiary)', marginLeft: 'auto' }}>
             Active Filter: {categoryFilter}
           </span>
        )}
      </div>

      <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--table-radius)', backgroundColor: 'var(--color-bg-surface)', overflow: 'hidden' }}>
        <AppDataTable 
          columns={columns}
          data={filteredProducts}
          keyField="id"
          emptyTitle="No relationships found"
          emptyDescription="Try adjusting your filters or search term."
        />
      </div>
    </div>
  );
}
