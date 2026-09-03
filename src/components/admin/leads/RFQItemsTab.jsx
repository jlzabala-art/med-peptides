"use client";

import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';
import { TextField, Checkbox, MetricCard } from '../../../components/ui';

import { doc, updateDoc, setDoc } from 'firebase/firestore';
import * as fb from '../../../firebase';
const db = fb?.db;
import { findMatchingProduct, getFuzzySuggestions, slugify } from './LeadUtils';
import { Edit2, Plus, Check, X, Trash2, ArrowUpRight, AlertTriangle } from 'lucide-react';
import DataTable from '../../ui/DataTable';
import AppActionGroup from '../../ui/AppActionGroup';
import { toast } from 'react-hot-toast';

function ProductDetailsPane({ item, catalogProducts, onProductCreated, onStockUpdated }) {
  const match = findMatchingProduct(item.peptide_name, catalogProducts);
  const suggestions = !match ? getFuzzySuggestions(item.peptide_name, catalogProducts) : [];
  const [stockInput, setStockInput] = useState(match ? match.stock || 0 : 0);
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);
  const generateCleanSku = (name) => {
    let clean = slugify(name).toUpperCase();
    clean = clean.replace(/\b(AND|OR|WITH|FOR|OF|TO|THE|A|AN)\b/g, '');
    clean = clean.replace(/-+/g, '-');
    if (clean.length > 15) clean = clean.substring(0, 15);
    return clean.replace(/-+$/, '');
  };

  const [sku, setSku] = useState(() => generateCleanSku(item.peptide_name));
  const [dosage, setDosage] = useState(item.dosage || '5mg');
  const [category, setCategory] = useState('Healing & Recovery');
  const [customCategory, setCustomCategory] = useState('');
  const [stock, setStock] = useState(item.quantity || 10);
  const [guestPrice, setGuestPrice] = useState(item.clientUnitPrice || 25.0);
  const [proPrice, setProPrice] = useState(item.clientUnitPrice ? parseFloat((item.clientUnitPrice * 0.8).toFixed(2)) : 20.0);
  const [warehouse, setWarehouse] = useState('Poland');
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (match) setStockInput(match.stock || 0);
  }, [match]);

  const handleSaveStock = async () => {
    if (!match) return;
    setIsUpdatingStock(true);
    try {
      const productRef = doc(db, 'products', match.id);
      await updateDoc(productRef, { stock: stockInput, updatedAt: new Date().toISOString() });
      try {
        const variantRef = doc(db, 'products', match.id, 'variants', 'default');
        await updateDoc(variantRef, { 'stock.quantity': stockInput, 'stock.available': stockInput > 0 });
      } catch (err) {}
      onStockUpdated(match.id, stockInput);
      toast.success('Stock updated successfully!');
    } catch (err) {
      toast.error('Failed to update stock: ' + err.message);
    } finally {
      setIsUpdatingStock(false);
    }
  };

  const handleRegisterProduct = async (e) => {
    e.preventDefault();
    if (!sku.trim()) return toast('SKU is required');
    setIsRegistering(true);
    try {
      const finalCategory = category === 'Other' ? customCategory : category;
      const docId = slugify(item.peptide_name + '-' + dosage);
      const newProduct = {
        id: docId,
        name: item.peptide_name,
        sku: sku.toUpperCase(),
        category: finalCategory || 'Healing & Recovery',
        dosage: dosage,
        guestVialPrice: parseFloat(guestPrice) || 0,
        guestKitPrice: parseFloat((guestPrice * 10).toFixed(2)) || 0,
        proVialPrice: parseFloat(proPrice) || 0,
        proKitPrice: parseFloat((proPrice * 10).toFixed(2)) || 0,
        stock: parseInt(stock) || 0,
        warehouse: warehouse,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'products', docId), newProduct);

      const variantDoc = {
        id: 'default',
        sku: sku.toUpperCase(),
        dosage: dosage,
        isActive: true,
        isDefault: true,
        pricing: {
          retailPrice: { base: parseFloat(guestPrice) || 0 },
          wholesalePrice: { base: parseFloat(proPrice) || 0 }
        },
        stock: { quantity: parseInt(stock) || 0, available: parseInt(stock) > 0 },
        warehouse: warehouse
      };
      await setDoc(doc(db, 'products', docId, 'variants', 'default'), variantDoc);

      onProductCreated(newProduct);
      toast.success('Product quick-registered successfully in catalog!');
    } catch (err) {
      toast.error('Failed to register product: ' + err.message);
    } finally {
      setIsRegistering(false);
    }
  };

  const getLabelStyle = () => ({ display: 'block', fontSize: '0.7rem', color: '#475569', marginBottom: '4px', fontWeight: 600 });

  if (match) {
    const isOutOfStock = (match.stock || 0) <= 0;
    const isLowStock = (match.stock || 0) > 0 && (match.stock || 0) < 20;
    const stockStatusText = isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock';
    const badgeColor = isOutOfStock ? '#ef4444' : isLowStock ? '#f59e0b' : '#10b981';
    const badgeBg = isOutOfStock ? '#fef2f2' : isLowStock ? '#fffbeb' : '#f0fdf4';
    const badgeBorder = isOutOfStock ? '#fca5a5' : isLowStock ? '#fcd34d' : '#bbf7d0';

    const hasDeficit = item.quantity > (match.stock || 0);
    const deficitCount = hasDeficit ? item.quantity - (match.stock || 0) : 0;

    return (
      <div style={{ padding: '1rem', border: '1px solid #cbd5e1', borderRadius: '12px', backgroundColor: '#ffffff', margin: '0.5rem 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                Catalog Match: <span style={{ color: '#2563eb' }}>{match.name}</span>
              </span>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', color: badgeColor, backgroundColor: badgeBg, border: `1px solid ${badgeBorder}` }}>
                {stockStatusText} ({match.stock || 0} available)
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
              SKU: {match.sku || 'N/A'} | Category: {match.category} | Dosage: {match.dosage || 'N/A'} | Warehouse: {match.warehouse || 'Poland'}
            </div>
          </div>
          <a href={`/admin/products?search=${encodeURIComponent(match.name)}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 12px', fontSize: '0.75rem', borderRadius: '16px', backgroundColor: '#ffffff', color: '#1e293b', border: '1px solid #cbd5e1', fontWeight: 600, textDecoration: 'none' }}>
            View in Catalog <ArrowUpRight size={12} />
          </a>
        </div>
        {hasDeficit && (
          <div style={{ display: 'flex', gap: '0.5rem', padding: '0.6rem 0.85rem', backgroundColor: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px', color: '#b45309', fontSize: '0.75rem', alignItems: 'center', fontWeight: 500, marginTop: '0.75rem' }}>
            <span>⚠️</span>
            <span><strong>Stock Deficit:</strong> Customer requested <strong>{item.quantity}</strong> units, but only <strong>{match.stock || 0}</strong> are in stock. Deficit of <strong>{deficitCount}</strong> units.</span>
          </div>
        )}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '0.6rem', marginTop: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Quick Adjust Stock:</span>
          <TextField type="number" value={stockInput} onChange={(e) => setStockInput(parseInt(e.target.value) || 0)} />
          <button onClick={handleSaveStock} disabled={isUpdatingStock} style={{ padding: '4px 10px', fontSize: '0.7rem', borderRadius: '6px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
            {isUpdatingStock ? 'Saving...' : 'Update Stock'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', border: '1px solid #fed7aa', borderRadius: '12px', backgroundColor: '#fffbeb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', margin: '0.5rem 1rem' }}>
      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
        <AlertTriangle size={18} color="#d97706" style={{ marginTop: '2px', flexShrink: 0 }} />
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#b45309' }}>Product not found in catalog: "{item.peptide_name}"</span>
          <p style={{ fontSize: '0.75rem', color: '#b45309', margin: '2px 0 0 0', fontWeight: 500 }}>This item is not registered in the database catalog. You can quick-register it using the form below.</p>
        </div>
      </div>
      {suggestions.length > 0 && (
        <div style={{ padding: '0.5rem 0.75rem', backgroundColor: '#ffffff', border: '1px solid #fcd34d', borderRadius: '8px', fontSize: '0.75rem', marginTop: '0.75rem' }}>
          <span style={{ fontWeight: 700, color: '#475569' }}>Similar items in catalog:</span>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '6px' }}>
            {suggestions.map(p => (
              <a key={p.id} href={`/admin/products?search=${encodeURIComponent(p.name)}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: '#2563eb', backgroundColor: '#eff6ff', padding: '3px 8px', borderRadius: '12px', textDecoration: 'none', border: '1px solid #bfdbfe', fontWeight: 600 }}>
                {p.name} ({p.dosage || 'No dosage'}) - {p.stock || 0} in stock
              </a>
            ))}
          </div>
        </div>
      )}
      <form onSubmit={handleRegisterProduct} style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem', marginBottom: '0.25rem' }}>Quick Catalog Registration</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
          <div><label style={getLabelStyle()}>SKU Code (Required)</label><TextField type="text" value={sku} onChange={e => setSku(e.target.value.toUpperCase())} required /></div>
          <div><label style={getLabelStyle()}>Dosage / Strength</label><TextField type="text" value={dosage} onChange={e => setDosage(e.target.value)} /></div>
          <div><label style={getLabelStyle()}>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="admin-premium-select" style={{ width: '100%', cursor: 'pointer' }}>
              <option value="Healing & Recovery">Healing & Recovery</option>
              <option value="Weight Loss">Weight Loss</option>
              <option value="Anti-Aging">Anti-Aging</option>
              <option value="Other">Other</option>
            </select>
          </div>
          {category === 'Other' && <div><label style={getLabelStyle()}>Custom</label><TextField value={customCategory} onChange={e => setCustomCategory(e.target.value)} /></div>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.75rem' }}>
          <div><label style={getLabelStyle()}>Initial Stock</label><TextField type="number" value={stock} onChange={e => setStock(parseInt(e.target.value) || 0)} /></div>
          <div><label style={getLabelStyle()}>Guest Price</label><TextField type="number" step="0.01" value={guestPrice} onChange={e => setGuestPrice(parseFloat(e.target.value) || 0)} /></div>
          <div><label style={getLabelStyle()}>Pro Price</label><TextField type="number" step="0.01" value={proPrice} onChange={e => setProPrice(parseFloat(e.target.value) || 0)} /></div>
          <div><label style={getLabelStyle()}>Warehouse</label>
            <select value={warehouse} onChange={e => setWarehouse(e.target.value)} className="admin-premium-select" style={{ width: '100%' }}>
              <option value="Poland">Poland</option>
              <option value="USA">USA</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.6rem' }}>
          <button type="submit" disabled={isRegistering} style={{ padding: '6px 18px', fontSize: '0.75rem', borderRadius: '6px', backgroundColor: '#10b981', color: '#ffffff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
            {isRegistering ? 'Registering...' : 'Register Product in Catalog'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function RFQItemsTab({ rfqId, items: initialItems, onSaveItems, supplierName, catalogProducts, onProductCreated, onStockUpdated }) {
  const [items, setItems] = useState(() => initialItems.map(i => ({ ...i, _id: i._id || Math.random().toString(36) })));
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setItems(initialItems.map(i => ({ ...i, _id: i._id || Math.random().toString(36) })));
  }, [initialItems]);

  const handleToggleEdit = () => {
    if (isEditing) setItems(initialItems.map(i => ({ ...i, _id: i._id || Math.random().toString(36) })));
    setIsEditing(!isEditing);
  };

  const handleItemChange = (idx, field, value) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const handleDeleteItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

  const handleAddItem = () => {
    setItems(prev => [...prev, { _id: Math.random().toString(36), peptide_name: 'New Material', dosage: '', quantity: 10, units: 'vials', supplierUnitCost: 0, marginPercent: 20, clientUnitPrice: 0 }]);
  };

  const handleSaveChanges = () => {
    // Remove _id before saving to parent
    const itemsToSave = items.map(({ _id, ...rest }) => rest);
    onSaveItems(itemsToSave);
    setIsEditing(false);
  };

  const columns = useMemo(() => {
    const cols = [
      {
        key: 'peptide_name',
        header: 'Item Description',
        sortKey: 'peptide_name',
        render: (val, row) => {
          const originalIndex = items.findIndex(x => x._id === row._id);
          return isEditing ? (
            <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '4px' }} onClick={e => e.stopPropagation()}>
              <TextField type="text" value={row.peptide_name || ''} onChange={e => handleItemChange(originalIndex, 'peptide_name', e.target.value)} />
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Cost $</span>
                <TextField type="number" step="0.01" value={row.supplierUnitCost || 0} onChange={e => handleItemChange(originalIndex, 'supplierUnitCost', parseFloat(e.target.value) || 0)} />
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Margin %</span>
                <TextField type="number" value={row.marginPercent || 20} onChange={e => handleItemChange(originalIndex, 'marginPercent', parseFloat(e.target.value) || 0)} />
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, color: '#1e293b' }}>{row.peptide_name}</span>
              {(() => {
                const m = findMatchingProduct(row.peptide_name, catalogProducts);
                if (!m) return <span style={{ fontSize: '0.65rem', backgroundColor: '#f3f4f6', color: '#4b5563', padding: '2px 6px', borderRadius: '4px' }}>Unregistered</span>;
                if ((m.stock || 0) <= 0) return <span style={{ fontSize: '0.65rem', backgroundColor: '#fef2f2', color: '#ef4444', padding: '2px 6px', borderRadius: '4px' }}>Out of Stock</span>;
                if ((m.stock || 0) < 20) return <span style={{ fontSize: '0.65rem', backgroundColor: '#fffbeb', color: '#d97706', padding: '2px 6px', borderRadius: '4px' }}>Low Stock</span>;
                return <span style={{ fontSize: '0.65rem', backgroundColor: '#f0fdf4', color: '#16a34a', padding: '2px 6px', borderRadius: '4px' }}>In Stock</span>;
              })()}
            </div>
          );
        }
      },
      {
        key: 'quantity',
        header: 'Qty',
        sortKey: 'quantity',
        align: 'right',
        render: (val, row) => {
          const originalIndex = items.findIndex(x => x._id === row._id);
          return isEditing ? (
            <div onClick={e => e.stopPropagation()}>
              <TextField type="number" value={row.quantity} onChange={e => handleItemChange(originalIndex, 'quantity', parseFloat(e.target.value) || 0)} />
            </div>
          ) : (
            <span style={{ fontWeight: 600 }}>{row.quantity}</span>
          );
        }
      },
      {
        key: 'clientUnitPrice',
        header: 'Unit Price',
        sortKey: 'clientUnitPrice',
        align: 'right',
        render: (val, row) => {
          const originalIndex = items.findIndex(x => x._id === row._id);
          const price = row.clientUnitPrice || 0;
          return isEditing ? (
            <div onClick={e => e.stopPropagation()}>
              <TextField type="number" step="0.01" value={row.clientUnitPrice || 0} onChange={e => handleItemChange(originalIndex, 'clientUnitPrice', parseFloat(e.target.value) || 0)} />
            </div>
          ) : (
            <span style={{ color: price > 0 ? '#0f766e' : '#64748b' }}>{price > 0 ? `$${price.toFixed(2)}` : 'Pricing'}</span>
          );
        }
      },
      {
        key: 'total',
        header: 'Total',
        align: 'right',
        render: (val, row) => {
          const price = row.clientUnitPrice || 0;
          const total = price * (row.quantity || 0);
          return (
            <span style={{ fontWeight: 600, color: total > 0 ? '#0f766e' : '#64748b' }}>
              {total > 0 ? `$${total.toFixed(2)}` : '-'}
            </span>
          );
        }
      }
    ];

    if (isEditing) {
      cols.push({
        key: 'actions',
        header: 'Actions',
        align: 'center',
        render: (val, row) => {
          const originalIndex = items.findIndex(x => x._id === row._id);
          return (
            <div style={{ display: 'inline-flex', justifyContent: 'flex-end', width: '100%' }}>
              <AppActionGroup actions={[
                { type: 'delete', onClick: (e) => { e.stopPropagation(); handleDeleteItem(originalIndex); } }
              ]} />
            </div>
          );
        }
      });
    }

    return cols;
  }, [items, isEditing, catalogProducts]);

  // Stats
  const totalItems = items.length;
  const matchedCount = items.filter(i => findMatchingProduct(i.peptide_name, catalogProducts)).length;
  const unregisteredCount = totalItems - matchedCount;
  const outOfStockCount = items.filter(i => {
    const match = findMatchingProduct(i.peptide_name, catalogProducts);
    return match && (match.stock || 0) <= 0;
  }).length;
  const potentialRevenue = items.reduce((acc, curr) => acc + ((curr.clientUnitPrice || 0) * (curr.quantity || 0)), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      {/* KPI Row for RFQ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
        <MetricCard
          title="Total Requested"
          value={totalItems}
          color="var(--color-primary)"
        />
        <MetricCard
          title="Matched"
          value={matchedCount}
          color="var(--color-success)"
        />
        <MetricCard
          title="Out of Stock"
          value={outOfStockCount}
          color="var(--color-warning)"
          alert={outOfStockCount > 0}
        />
        <MetricCard
          title="Unregistered"
          value={unregisteredCount}
          color="var(--color-danger)"
          alert={unregisteredCount > 0}
        />
        <MetricCard
          title="Potential Rev."
          value={`$${potentialRevenue.toLocaleString()}`}
          color="var(--color-primary)"
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {!isEditing ? (
            <button onClick={handleToggleEdit} style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '16px', backgroundColor: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Edit2 size={12} /> Edit Lead
            </button>
          ) : (
            <>
              <button onClick={handleAddItem} style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '16px', backgroundColor: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><Plus size={12} /> Add Item</button>
              <button onClick={handleSaveChanges} style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '16px', backgroundColor: '#3b82f6', color: '#ffffff', border: '1px solid #2563eb', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={12} /> Save</button>
              <button onClick={handleToggleEdit} style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '16px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><X size={12} /> Cancel</button>
            </>
          )}
        </div>
      </div>

      <div className="gcp-table-container">
        <DataTable
          columns={columns}
          data={items}
          keyField="_id"
          expandableRender={!isEditing ? (row) => (
            <ProductDetailsPane item={row} catalogProducts={catalogProducts} onProductCreated={onProductCreated} onStockUpdated={onStockUpdated} />
          ) : undefined}
          globalSearch={true}
          searchPlaceholder="Filter items..."
          emptyMessage="No items found."
        />
      </div>
    </div>
  );
}