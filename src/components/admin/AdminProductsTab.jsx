/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Search, Copy, Download, UploadCloud, Percent, ArrowUpRight, XCircle, EyeOff, Eye, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AppDataTable from '../ui/AppDataTable';
import AppActionGroup from '../ui/AppActionGroup';
import AppStatusToggle from '../ui/AppStatusToggle';
import AppFilterBar from '../ui/AppFilterBar';

export default function AdminProductsTab({ 
  readOnly = false, 
  hideCosts = false, 
  allowedCategories = ['All'],
  isWholesaler = false
}) {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [bulkMode, setBulkMode] = useState(null); 
  const [bulkValue, setBulkValue] = useState('');
  const [bulkCategory, setBulkCategory] = useState('All');
  const [importing, setImporting] = useState(false);
  const [savingProduct, setSavingProduct] = useState(null);
  const [migrating, setMigrating] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'products'));
      const querySnapshot = await getDocs(q);
      let productsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Filter if restricted by allowedCategories
      if (!allowedCategories.includes('All')) {
        productsList = productsList.filter(p => allowedCategories.includes(p.category));
      }
      
      setProducts(productsList);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMigrate = async () => {
    if (readOnly) return;
    setMigrating(true);
    alert("Migration already completed. Products live in Firestore.");
    setMigrating(false);
  };

  const handleUpdateProduct = async (id, updates) => {
    if (readOnly) return;
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

  const handleExportCSV = () => {
    if (products.length === 0) return;
    
    const headers = ["ID", "SKU", "Name", "Category", "Dosage", "Guest Vial Price", "Guest Kit Price", "Pro Vial Price", "Pro Kit Price", "Stock", "Warehouse"];
    if (!hideCosts && isAdmin) headers.push("Cost Price", "Supplier");
    headers.push("Active");
    
    const csvContent = [
      headers.join(","),
      ...products.map(p => {
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
          `"${p.warehouse || 'Poland'}"`
        ];
        if (!hideCosts && isAdmin) row.push(p.costPrice || 0, `"${p.supplier || ''}"`);
        row.push(p.isActive === false ? "inactive" : "active");
        return row.join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `catalog_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadTemplate = () => {
    const headers = ["ID", "SKU", "Name", "Category", "Dosage", "Guest Vial Price", "Guest Kit Price", "Pro Vial Price", "Pro Kit Price", "Stock", "Warehouse", "Cost Price", "Supplier", "Active"];
    const sampleRow = ["sample_id", "BPC157-5", "BPC-157", "Healing & Recovery", "5mg/vial", "28.75", "172.50", "24.44", "146.63", "100", "Poland", "15.00", "Regpept", "active"];
    const csvContent = [headers.join(","), sampleRow.join(",")].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "med_peptides_import_template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = async (event) => {
    if (readOnly) return;
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      setImporting(true);
      try {
        const text = e.target.result;
        const rows = text.split("\n");
        const headers = rows[0].split(",");
        
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
            updatedAt: new Date().toISOString()
          };

          const productRef = doc(db, 'products', id);
          await updateDoc(productRef, updates);
        }
        alert("Import complete! Refreshing catalog...");
        fetchProducts();
      } catch (err) {
        console.error("Import error:", err);
        alert("Error importing CSV. Ensure the format is correct.");
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
  };

  const handleBulkAdjust = async () => {
    if (readOnly) return;
    if (!bulkValue || isNaN(bulkValue)) {
      alert("Please enter a valid number.");
      return;
    }

    const affectedProducts = products.filter(p => 
      (bulkCategory === 'All' || p.category === bulkCategory) &&
      (selectedProductIds.length === 0 || selectedProductIds.includes(p.id))
    );

    if (affectedProducts.length === 0) {
      alert("No products found in the selected category/selection.");
      return;
    }

    if (!window.confirm(`Apply adjustment to ${affectedProducts.length} products?`)) return;

    setLoading(true);
    try {
      const val = parseFloat(bulkValue);
      for (const p of affectedProducts) {
        let updates = {};
        if (bulkMode === 'percent') {
          const factor = 1 + (val / 100);
          updates = {
            guestVialPrice: (p.guestVialPrice * factor).toFixed(2),
            guestKitPrice: (p.guestKitPrice * factor).toFixed(2),
            proVialPrice: (p.proVialPrice * factor).toFixed(2),
            proKitPrice: (p.proKitPrice * factor).toFixed(2)
          };
        } else if (bulkMode === 'fixed') {
          updates = {
            guestVialPrice: (p.guestVialPrice + val).toFixed(2),
            guestKitPrice: (p.guestKitPrice + val).toFixed(2),
            proVialPrice: (p.proVialPrice + val).toFixed(2),
            proKitPrice: (p.proKitPrice + val).toFixed(2)
          };
        }

        const productRef = doc(db, 'products', p.id);
        await updateDoc(productRef, {
          ...updates,
          updatedAt: new Date().toISOString()
        });
      }
      alert("Bulk adjustment complete!");
      fetchProducts();
      setBulkMode(null);
      setBulkValue('');
      setSelectedProductIds([]);
    } catch (err) {
      console.error("Bulk adjust error:", err);
      alert("Error applying bulk adjustments.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (readOnly) return;
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Failed to delete product.");
    }
  };

  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Determine which categories to show in filter dropdown
  const categoriesToShow = allowedCategories.includes('All') 
    ? [...new Set(products.map(p => p.category))]
    : allowedCategories;

  const columns = [
    {
      key: 'product',
      header: 'Product / Category',
      sortKey: 'product',
      sortValue: (p) => p.name.toLowerCase(),
      render: (p) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{p.name}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.category} | {p.dosage}</div>
        </div>
      )
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
      }
    }
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
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.75rem' }}>
            {savingProduct === p.id && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Saving...</span>}
            <AppActionGroup actions={actions} />
          </div>
        );
      }
    });
  }

  const renderExpandedRow = (p) => {
    const inputStyle = { padding: '0.7rem 1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.95rem', width: '100%', boxSizing: 'border-box' };
    const labelStyle = { display: 'block', fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.4rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' };
    
    return (
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', backgroundColor: 'var(--color-bg-surface)' }}>
        <div>
          <label style={labelStyle}>SKU</label>
          {readOnly ? (
            <span className="mono-data">{p.sku || 'N/A'}</span>
          ) : (
            <input 
              type="text" defaultValue={p.sku || ''} 
              onBlur={(e) => handleUpdateProduct(p.id, { sku: e.target.value })}
              placeholder="SKU (optional)" className="mono-data" style={inputStyle}
            />
          )}
        </div>
        
        <div>
          <label style={labelStyle}>Stock</label>
          {readOnly ? (
            <span style={{ fontWeight: 700, color: p.stock < 20 ? 'var(--error)' : p.stock < 50 ? '#f59e0b' : 'inherit' }}>{p.stock}</span>
          ) : (
            <input 
              type="number" defaultValue={p.stock} 
              onBlur={(e) => handleUpdateProduct(p.id, { stock: parseInt(e.target.value) || 0 })}
              className="mono-data"
              style={{ ...inputStyle, fontWeight: 700, color: p.stock < 20 ? 'var(--error)' : p.stock < 50 ? '#f59e0b' : 'inherit', border: p.stock < 20 ? '2px solid var(--error)' : '1px solid var(--border)' }} 
            />
          )}
        </div>
        
        <div>
          <label style={labelStyle}>Warehouse</label>
          {readOnly ? (
            <span>{p.warehouse || 'Poland'}</span>
          ) : (
            <select 
              value={p.warehouse || 'Poland'} 
              onChange={(e) => handleUpdateProduct(p.id, { warehouse: e.target.value })}
              style={inputStyle}
            >
              <option value="Poland">Poland</option>
              <option value="UK">UK</option>
              <option value="HK">HK</option>
              <option value="USA">USA</option>
              <option value="Greece">Greece</option>
            </select>
          )}
        </div>

        {(!hideCosts && isAdmin) && (
          <div>
            <label style={labelStyle}>Supplier (optional)</label>
            {readOnly ? (
              <span>{p.supplier || 'N/A'}</span>
            ) : (
              <select 
                value={p.supplier || ''} 
                onChange={(e) => handleUpdateProduct(p.id, { supplier: e.target.value })}
                style={inputStyle}
              >
                <option value="">Select...</option>
                <option value="Lotusland">Lotusland</option>
                <option value="NPLAB">NPLAB</option>
                <option value="Eterna">Eterna</option>
                <option value="Regpept">Regpept</option>
                <option value="Other">Other</option>
              </select>
            )}
          </div>
        )}

        {isWholesaler && (
          <div>
            <label style={labelStyle}>Prices (B2B)</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '100%', maxWidth: '300px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Vial:</span> 
                <span className="mono-data" style={{ fontWeight: 600 }}>${p.proVialPrice?.toFixed(2) || '0.00'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderTop: '1px solid var(--border)', paddingTop: '0.25rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Kit (10):</span> 
                <span className="mono-data" style={{ fontWeight: 700, color: 'var(--primary)' }}>${p.proKitPrice?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const filteredProducts = products
    .filter(p => {
      const matchesCategory = filterCategory === 'All' || p?.category === filterCategory;
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
        
      return matchesCategory && matchesSearch && matchesDate;
    });

  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* Toolbar */}
      <AppFilterBar 
        searchQuery={searchTerm}
        onSearchChange={setSearchTerm}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        searchPlaceholder="Search products by name, category, dosage..."
        primaryFilters={[]}
        secondaryActions={
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {categoriesToShow.length > 0 && (
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={{
                  padding: '0.4rem 2rem 0.4rem 0.8rem',
                  borderRadius: '20px',
                  border: '1px solid var(--border)',
                  backgroundColor: filterCategory === 'All' ? 'white' : 'var(--primary-light)',
                  color: filterCategory === 'All' ? 'var(--text-main)' : 'var(--primary)',
                  fontSize: '0.85rem',
                  fontWeight: filterCategory === 'All' ? 500 : 600,
                  outline: 'none',
                  cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.7rem top 50%',
                  backgroundSize: '0.65rem auto'
                }}
              >
                <option value="All">Category: All</option>
                {categoriesToShow.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}
            {!readOnly && (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={handleDownloadTemplate} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--primary)', borderColor: 'var(--primary)' }}>
                <Copy size={16} /> Template
              </button>
              <label className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                <UploadCloud size={16} /> {importing ? 'Importing...' : 'Import'}
                <input type="file" accept=".csv" onChange={handleImportCSV} style={{ display: 'none' }} disabled={importing} />
              </label>
            </div>
          )
        }
      />

      {/* Bulk Adjustment Panel */}
      {!readOnly && bulkMode && (
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary)', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)', animation: 'slideDown 0.3s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowUpRight size={20} /> Bulk Price Adjustment
            </h3>
            <XCircle size={20} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setBulkMode(null)} />
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Apply to Category:</label>
              <select 
                value={bulkCategory}
                onChange={(e) => setBulkCategory(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
              >
                <option value="All">All Categories</option>
                {categoriesToShow.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Adjustment Type:</label>
              <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <button 
                  onClick={() => setBulkMode('percent')}
                  style={{ padding: '0.6rem 1rem', border: 'none', backgroundColor: bulkMode === 'percent' ? 'var(--primary)' : 'white', color: bulkMode === 'percent' ? 'white' : 'var(--text-main)', cursor: 'pointer' }}
                >
                  Percentage (%)
                </button>
                <button 
                  onClick={() => setBulkMode('fixed')}
                  style={{ padding: '0.6rem 1rem', border: 'none', backgroundColor: bulkMode === 'fixed' ? 'var(--primary)' : 'white', color: bulkMode === 'fixed' ? 'white' : 'var(--text-main)', cursor: 'pointer' }}
                >
                  Fixed Amount ($)
                </button>
              </div>
            </div>
            <div style={{ width: '150px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                {bulkMode === 'percent' ? "Percentage (e.g. 5 or -10)" : "Amount (e.g. 10 or -5)"}
              </label>
              <input 
                type="number" 
                value={bulkValue}
                onChange={(e) => setBulkValue(e.target.value)}
                placeholder="0"
                style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
              />
            </div>
            <button onClick={handleBulkAdjust} className="btn btn-primary" style={{ padding: '0.6rem 1.5rem' }}>
              Apply to {products.filter(p => (bulkCategory === 'All' || p.category === bulkCategory) && (selectedProductIds.length === 0 || selectedProductIds.includes(p.id))).length} Products
            </button>
          </div>
        </div>
      )}

      {products.length === 0 && !loading && (
        <div style={{ marginBottom: '2rem', textAlign: 'center', backgroundColor: 'white', padding: '3rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Your catalog is empty.</p>
          {!readOnly && (
            <button className="btn btn-primary" onClick={handleMigrate} disabled={migrating}>
              {migrating ? "Migrating..." : "Run Initial Products Migration"}
            </button>
          )}
        </div>
      )}

      <div style={{ marginBottom: '2rem' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading catalog...</div>
        ) : products.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Catalog is empty.</div>
        ) : (
          <AppDataTable 
            data={filteredProducts}
            columns={columns}
            keyField="id"
            expandableRender={renderExpandedRow}
            selectedIds={selectedProductIds}
            onSelectionChange={setSelectedProductIds}
            renderBatchActions={(selected) => (
              <>
                <button onClick={handleExportCSV} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                  <Download size={14} /> Export Selected
                </button>
                {!readOnly && (
                  <button 
                    onClick={() => setBulkMode(bulkMode ? null : 'percent')} 
                    className="btn btn-outline"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', padding: '0.4rem 0.8rem', background: 'white' }}
                  >
                    <Percent size={14} /> Bulk Price Update
                  </button>
                )}
              </>
            )}
          />
        )}
      </div>
    </div>
  );
}
