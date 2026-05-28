/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AppDataTable from '../ui/AppDataTable';
import AppActionGroup from '../ui/AppActionGroup';
import AppStatusToggle from '../ui/AppStatusToggle';
import AppFilterBar from '../ui/AppFilterBar';
import AppEntityCell from '../ui/AppEntityCell';
import { useToast } from '../../hooks/useToast';
import AdminSupplyNotifierWidget from './gadgets/AdminSupplyNotifierWidget';
import InlineEditField from '../ui/InlineEditField';

export default function AdminProductsTab({
  readOnly = false,
  hideCosts = false,
  allowedCategories = ['All'],
  isWholesaler = false,
}) {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterStock, setFilterStock] = useState('All');
  const [filterWarehouse, setFilterWarehouse] = useState('All');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const [bulkMode, setBulkMode] = useState(null);
  const [bulkValue, setBulkValue] = useState('');
  const [bulkCategory, setBulkCategory] = useState('All');
  const [importing, setImporting] = useState(false);
  const [savingProduct, setSavingProduct] = useState(null);
  const [migrating, setMigrating] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterStatus, filterStock, filterWarehouse, dateRange]);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      const q = query(collection(db, 'products'));
      const querySnapshot = await getDocs(q);
      let productsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter if restricted by allowedCategories
      if (!allowedCategories.includes('All')) {
        productsList = productsList.filter((p) => allowedCategories.includes(p.category));
      }

      setProducts(productsList);
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
    ? [...new Set(products.map((p) => p.category))]
    : allowedCategories;

  const columns = [
    {
      key: 'product',
      header: 'Product / Category',
      sortKey: 'product',
      sortValue: (p) => p.name.toLowerCase(),
      render: (p) => (
        <AppEntityCell
          title={p.name}
          subtitle={
            <>
              <span style={{ opacity: 0.5 }}>↳</span> {p.category} | {p.dosage}
            </>
          }
        />
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '80px',
      sortKey: 'status',
      sortValue: (p) => (p.isActive !== false ? 1 : 0),
      render: (p) => {
        return (
          <AppStatusToggle
            isActive={p.isActive !== false}
            onToggle={(willBeActive) => handleUpdateProduct(p.id, { isActive: willBeActive })}
          />
        );
      },
    },
  ];

  if (!readOnly) {
    columns.push({
      key: 'actions',
      header: 'Actions',
      align: 'right',
      width: '100px',
      render: (p) => {
        const actions = [];
        actions.push({ type: 'delete', onClick: () => handleDeleteProduct(p.id) });
        return (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            {savingProduct === p.id && (
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Saving...</span>
            )}
            <AppActionGroup actions={actions} />
          </div>
        );
      },
    });
  }

  const renderExpandedRow = (p) => {
    const inputStyle = {
      padding: '0.5rem 0.75rem',
      border: '1px solid var(--border)',
      borderRadius: '4px',
      fontSize: '0.85rem',
      width: '100%',
      boxSizing: 'border-box',
      backgroundColor: 'var(--bg-card)',
      color: 'var(--text-main)',
    };
    const labelStyle = {
      display: 'block',
      fontWeight: 500,
      fontSize: '0.8rem',
      marginBottom: '0.25rem',
      color: 'var(--text-main)',
    };

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
            width: '100%',
            maxWidth: '600px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          <div>
            <label style={labelStyle}>SKU</label>
            {readOnly ? (
              <span className="mono-data">{p.sku || 'N/A'}</span>
            ) : (
              <InlineEditField
                value={p.sku || ''}
                onSave={(val) => handleUpdateProduct(p.id, { sku: val })}
                placeholder="SKU (optional)"
                inputStyle={{ fontFamily: 'var(--font-mono)' }}
              />
            )}
          </div>

          <div>
            <label style={labelStyle}>Stock</label>
            {readOnly ? (
              <span
                style={{
                  fontWeight: 700,
                  color: p.stock < 20 ? 'var(--error)' : p.stock < 50 ? '#f59e0b' : 'inherit',
                }}
              >
                {p.stock}
              </span>
            ) : (
              <InlineEditField
                type="number"
                value={p.stock}
                onSave={(val) => handleUpdateProduct(p.id, { stock: parseInt(val) || 0 })}
                inputStyle={{ 
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  color: p.stock < 20 ? 'var(--error)' : p.stock < 50 ? '#f59e0b' : 'inherit',
                }}
              />
            )}
          </div>

          <div>
            <label style={labelStyle}>Warehouse</label>
            {readOnly ? (
              <span>{p.warehouse || 'Poland'}</span>
            ) : (
              <InlineEditField
                type="select"
                value={p.warehouse || 'Poland'}
                options={['Poland', 'UK', 'HK', 'USA', 'Greece']}
                onSave={(val) => handleUpdateProduct(p.id, { warehouse: val })}
              />
            )}
          </div>

          {!hideCosts && isAdmin && (
            <div>
              <label style={labelStyle}>Supplier (optional)</label>
              {readOnly ? (
                <span>{p.supplier || 'N/A'}</span>
              ) : (
                <InlineEditField
                  type="select"
                  value={p.supplier || ''}
                  options={[
                    { value: '', label: 'Select...' },
                    { value: 'Lotusland', label: 'Lotusland' },
                    { value: 'NPLAB', label: 'NPLAB' },
                    { value: 'Eterna', label: 'Eterna' },
                    { value: 'Regpept', label: 'Regpept' },
                    { value: 'Other', label: 'Other' },
                  ]}
                  onSave={(val) => handleUpdateProduct(p.id, { supplier: val })}
                />
              )}
            </div>
          )}

          {isWholesaler && (
            <div>
              <label style={labelStyle}>Prices (B2B)</label>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                  width: '100%',
                  maxWidth: '300px',
                }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>Vial:</span>
                  <span className="mono-data" style={{ fontWeight: 600 }}>
                    ${p.proVialPrice?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.85rem',
                    borderTop: '1px solid var(--border)',
                    paddingTop: '0.25rem',
                  }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>Kit (10):</span>
                  <span className="mono-data" style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    ${p.proKitPrice?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = filterCategory === 'All' || p?.category === filterCategory;
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
      (p?.objective && p.objective.toLowerCase().includes(searchLower)) ||
      (p?.dosage && p.dosage.toLowerCase().includes(searchLower));

    let matchesDate = true;
    if (dateRange.start || dateRange.end) {
      const updated = p.updatedAt ? new Date(p.updatedAt) : null;
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

    return (
      matchesCategory &&
      matchesStatus &&
      matchesWarehouse &&
      matchesStock &&
      matchesSearch &&
      matchesDate
    );
  });

  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div style={{ marginBottom: '2rem' }}>
      {isAdmin && !readOnly && (
        <div style={{ marginBottom: '1.5rem' }}>
          <AdminSupplyNotifierWidget />
        </div>
      )}
      {/* Toolbar */}
      <AppFilterBar
        searchQuery={searchTerm}
        onSearchChange={setSearchTerm}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        searchPlaceholder="Search products by name, category, dosage..."
        primaryFilters={[]}
        secondaryActions={
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {categoriesToShow.length > 0 && (
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={{
                  height: '32px',
                  padding: '0 1.5rem 0 0.75rem',
                  borderRadius: '16px',
                  border: '1px solid var(--border)',
                  backgroundColor: filterCategory === 'All' ? 'white' : 'var(--primary-light)',
                  color: filterCategory === 'All' ? 'var(--text-main)' : 'var(--primary)',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  outline: 'none',
                  cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.5rem top 50%',
                  backgroundSize: '0.5rem auto',
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

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                height: '32px',
                padding: '0 1.5rem 0 0.75rem',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                backgroundColor: filterStatus === 'All' ? 'white' : 'var(--primary-light)',
                color: filterStatus === 'All' ? 'var(--text-main)' : 'var(--primary)',
                fontSize: '0.8rem',
                fontWeight: 500,
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.5rem top 50%',
                backgroundSize: '0.5rem auto',
              }}
            >
              <option value="All">Status: All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <select
              value={filterStock}
              onChange={(e) => setFilterStock(e.target.value)}
              style={{
                height: '32px',
                padding: '0 1.5rem 0 0.75rem',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                backgroundColor: filterStock === 'All' ? 'white' : 'var(--primary-light)',
                color: filterStock === 'All' ? 'var(--text-main)' : 'var(--primary)',
                fontSize: '0.8rem',
                fontWeight: 500,
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.5rem top 50%',
                backgroundSize: '0.5rem auto',
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
                height: '32px',
                padding: '0 1.5rem 0 0.75rem',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                backgroundColor: filterWarehouse === 'All' ? 'white' : 'var(--primary-light)',
                color: filterWarehouse === 'All' ? 'var(--text-main)' : 'var(--primary)',
                fontSize: '0.8rem',
                fontWeight: 500,
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.5rem top 50%',
                backgroundSize: '0.5rem auto',
              }}
            >
              <option value="All">Warehouse: All</option>
              <option value="Poland">Poland</option>
              <option value="UK">UK</option>
              <option value="USA">USA</option>
              <option value="Greece">Greece</option>
            </select>
          </div>
        }
      />

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
          }}
        >
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>
            Products ({filteredProducts.length})
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
              Products
            </button>
          </div>
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
              {migrating ? 'Migrating...' : 'Run Initial Products Migration'}
            </button>
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
          <AppDataTable
            data={paginatedProducts}
            columns={columns}
            keyField="id"
            expandableRender={renderExpandedRow}
            selectedIds={selectedProductIds}
            onSelectionChange={setSelectedProductIds}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(val) => {
              setRowsPerPage(val);
              setCurrentPage(1);
            }}
            renderBatchActions={(selected) => (
              <>
                <button
                  onClick={handleExportCSV}
                  className="btn btn-primary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.8rem',
                    padding: '0.4rem 0.8rem',
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
              </>
            )}
          />
        )}
      </div>
    
      <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.8, background: 'var(--surface)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', pointerEvents: 'none', zIndex: 1000, boxShadow: 'var(--shadow-sm)' }}>
        Widget: AdminProductsTab | Props: none
      </div>
    
</div>
  );
}
