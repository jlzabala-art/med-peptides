import React, { useState, useEffect } from 'react';
import { catalogRepository } from '../../repositories/catalogRepository';
import { Users, Mail, Phone, Calendar, ArrowUpRight, Search, Download, Loader2, RefreshCcw, FileText, Link, Edit2, Plus, Check, X, Trash2, ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../ui/DataTable';
import AppEntityCell from '../ui/AppEntityCell';
import AppActionGroup from '../ui/AppActionGroup';
import { useToast } from '../../hooks/useToast';
import { collection, query, orderBy, getDocs, updateDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import AdminPageHeader from './AdminPageHeader';

// Normalizes strings for exact matching
function normalizeText(txt) {
  return (txt || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

// Normalizes strings for slug creation
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// Find exact or normalized product matching
function findMatchingProduct(itemName, catalogProducts) {
  if (!itemName || !catalogProducts) return null;
  const itemNorm = normalizeText(itemName);
  
  // 1. Try exact normalized match on name
  let match = catalogProducts.find(p => normalizeText(p.name) === itemNorm);
  
  // 2. Try match on doc ID/slug (normalized)
  if (!match) {
    match = catalogProducts.find(p => normalizeText(p.id) === itemNorm);
  }
  
  // 3. Try matches on name/id substrings
  if (!match) {
    match = catalogProducts.find(p => 
      normalizeText(p.name).includes(itemNorm) || 
      itemNorm.includes(normalizeText(p.name))
    );
  }
  
  return match;
}

// Find fuzzy word overlap suggestions
function getFuzzySuggestions(itemName, catalogProducts) {
  if (!itemName || !catalogProducts) return [];
  const itemWords = itemName.toLowerCase().split(/[^a-z0-9]+/);
  
  return catalogProducts
    .map(p => {
      const prodName = (p.name || '').toLowerCase();
      const prodWords = prodName.split(/[^a-z0-9]+/);
      const overlap = itemWords.filter(w => w.length > 2 && prodWords.includes(w)).length;
      return { product: p, score: overlap };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(x => x.product);
}

function ProductDetailsPane({ item, catalogProducts, onProductCreated, onStockUpdated }) {
  const match = findMatchingProduct(item.peptide_name, catalogProducts);
  const suggestions = !match ? getFuzzySuggestions(item.peptide_name, catalogProducts) : [];
  
  // Quick stock adjuster state
  const [stockInput, setStockInput] = useState(match ? match.stock || 0 : 0);
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);
  
  // Clean SKU generation to avoid extra long/ugly SKUs
  const generateCleanSku = (name) => {
    let clean = slugify(name).toUpperCase();
    // Remove filler words
    clean = clean.replace(/\b(AND|OR|WITH|FOR|OF|TO|THE|A|AN)\b/g, '');
    clean = clean.replace(/-+/g, '-');
    if (clean.length > 15) {
      clean = clean.substring(0, 15);
    }
    return clean.replace(/-+$/, '');
  };

  // Quick register form states
  const [sku, setSku] = useState(() => generateCleanSku(item.peptide_name));
  const [dosage, setDosage] = useState(item.dosage || '5mg');
  const [category, setCategory] = useState('Healing & Recovery');
  const [customCategory, setCustomCategory] = useState('');
  const [stock, setStock] = useState(item.quantity || 10);
  const [guestPrice, setGuestPrice] = useState(item.clientUnitPrice || 25.0);
  const [proPrice, setProPrice] = useState(item.clientUnitPrice ? parseFloat((item.clientUnitPrice * 0.8).toFixed(2)) : 20.0);
  const [warehouse, setWarehouse] = useState('Poland');
  const [isRegistering, setIsRegistering] = useState(false);

  // Focus and hover states for UI reactivity
  const [focusField, setFocusField] = useState(null);
  const [isSubmitHovered, setIsSubmitHovered] = useState(false);
  const [isStockHovered, setIsStockHovered] = useState(false);

  // Sync stock if match changes
  useEffect(() => {
    if (match) {
      setStockInput(match.stock || 0);
    }
  }, [match]);

  const handleSaveStock = async () => {
    if (!match) return;
    setIsUpdatingStock(true);
    try {
      const productRef = doc(db, 'products', match.id);
      await updateDoc(productRef, {
        stock: stockInput,
        updatedAt: new Date().toISOString()
      });
      try {
        const variantRef = doc(db, 'products', match.id, 'variants', 'default');
        await updateDoc(variantRef, {
          'stock.quantity': stockInput,
          'stock.available': stockInput > 0
        });
      } catch (err) {
        console.warn('No default variant to update stock for:', err);
      }
      onStockUpdated(match.id, stockInput);
      alert('Stock updated successfully!');
    } catch (err) {
      console.error('Error updating stock:', err);
      alert('Failed to update stock: ' + err.message);
    } finally {
      setIsUpdatingStock(false);
    }
  };

  const handleRegisterProduct = async (e) => {
    e.preventDefault();
    if (!sku.trim()) return alert('SKU is required');
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
        stock: {
          quantity: parseInt(stock) || 0,
          available: parseInt(stock) > 0
        },
        warehouse: warehouse
      };
      await setDoc(doc(db, 'products', docId, 'variants', 'default'), variantDoc);

      onProductCreated(newProduct);
      alert('Product quick-registered successfully in catalog!');
    } catch (err) {
      console.error('Error registering product:', err);
      alert('Failed to register product: ' + err.message);
    } finally {
      setIsRegistering(false);
    }
  };



  const getLabelStyle = () => ({
    display: 'block', 
    fontSize: '0.7rem', 
    color: '#475569', 
    marginBottom: '4px', 
    fontWeight: 600,
    letterSpacing: '0.2px'
  });

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
      <div style={{
        display: 'flex', flexDirection: 'column', gap: '0.75rem',
        padding: '1rem', border: '1px solid #cbd5e1', borderRadius: '12px',
        backgroundColor: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        animation: 'fadeIn 0.2s', textAlign: 'left', marginTop: '0.25rem', marginBottom: '0.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                Catalog Match: <span style={{ color: '#2563eb' }}>{match.name}</span>
              </span>
              <span style={{
                fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px',
                color: badgeColor, backgroundColor: badgeBg, border: `1px solid ${badgeBorder}`
              }}>
                {stockStatusText} ({match.stock || 0} available)
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
              SKU: {match.sku || 'N/A'} | Category: {match.category} | Dosage: {match.dosage || 'N/A'} | Warehouse: {match.warehouse || 'Poland'}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <a 
              href={`/admin/products?search=${encodeURIComponent(match.name)}`}
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '5px 12px', fontSize: '0.75rem', borderRadius: '16px',
                backgroundColor: '#ffffff', color: '#1e293b', border: '1px solid #cbd5e1',
                fontWeight: 600, textDecoration: 'none', cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#94a3b8'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
            >
              View in Catalog <ArrowUpRight size={12} />
            </a>
          </div>
        </div>

        {/* Deficit Alert */}
        {hasDeficit && (
          <div style={{
            display: 'flex', gap: '0.5rem', padding: '0.6rem 0.85rem',
            backgroundColor: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px',
            color: '#b45309', fontSize: '0.75rem', alignItems: 'center', fontWeight: 500
          }}>
            <span style={{ fontSize: '1rem' }}>⚠️</span>
            <span>
              <strong>Stock Deficit:</strong> Customer requested <strong>{item.quantity}</strong> units, but only <strong>{match.stock || 0}</strong> are in stock. Deficit of <strong>{deficitCount}</strong> units.
            </span>
          </div>
        )}

        {/* Quick stock adjuster */}
        <div style={{
          display: 'flex', gap: '0.75rem', alignItems: 'center',
          borderTop: '1px solid #f1f5f9', paddingTop: '0.6rem', marginTop: '0.25rem'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Quick Adjust Stock:</span>
          <input 
            type="number"
            className="admin-premium-input"
            value={stockInput}
            onChange={(e) => setStockInput(parseInt(e.target.value) || 0)}
            style={{ width: '75px', padding: '4px 8px', fontSize: '0.75rem' }}
          />
          <button 
            onClick={handleSaveStock}
            disabled={isUpdatingStock}
            onMouseEnter={() => setIsStockHovered(true)}
            onMouseLeave={() => setIsStockHovered(false)}
            style={{
              padding: '4px 10px', fontSize: '0.7rem', borderRadius: '6px',
              backgroundColor: isStockHovered ? '#1d4ed8' : '#2563eb', color: '#ffffff', border: 'none',
              fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
              transition: 'background-color 0.15s ease'
            }}
          >
            {isUpdatingStock ? 'Saving...' : 'Update Stock'}
          </button>
        </div>
      </div>
    );
  }

  // Render NOT match view (Quick Register Form with Amber Warn Badge)
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '0.75rem',
      padding: '1rem', border: '1px solid #fed7aa', borderRadius: '12px',
      backgroundColor: '#fffbeb', animation: 'fadeIn 0.2s', textAlign: 'left',
      marginTop: '0.25rem', marginBottom: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
    }}>
      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
        <AlertTriangle size={18} color="#d97706" style={{ marginTop: '2px', flexShrink: 0 }} />
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#b45309' }}>
            Product not found in catalog: "{item.peptide_name}"
          </span>
          <p style={{ fontSize: '0.75rem', color: '#b45309', margin: '2px 0 0 0', opacity: 0.9, fontWeight: 500 }}>
            This item is not registered in the database catalog. You can quick-register it using the form below.
          </p>
        </div>
      </div>

      {/* Fuzzy suggestions if any */}
      {suggestions.length > 0 && (
        <div style={{
          padding: '0.5rem 0.75rem', backgroundColor: '#ffffff',
          border: '1px solid #fcd34d', borderRadius: '8px', fontSize: '0.75rem',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
        }}>
          <span style={{ fontWeight: 700, color: '#475569' }}>Similar items in catalog:</span>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '6px' }}>
            {suggestions.map(p => (
              <a 
                key={p.id}
                href={`/admin/products?search=${encodeURIComponent(p.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '0.7rem', color: '#2563eb', backgroundColor: '#eff6ff',
                  padding: '3px 8px', borderRadius: '12px', textDecoration: 'none', border: '1px solid #bfdbfe',
                  fontWeight: 600, display: 'inline-flex', alignItems: 'center', transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#dbeafe'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#eff6ff'; }}
              >
                {p.name} ({p.dosage || 'No dosage'}) - {p.stock || 0} in stock
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Sleek inline register form */}
      <form onSubmit={handleRegisterProduct} style={{
        backgroundColor: '#ffffff', padding: '1rem', borderRadius: '8px',
        border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.75rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem', marginBottom: '0.25rem' }}>
          Quick Catalog Registration
        </span>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
          <div>
            <label style={getLabelStyle()}>SKU Code (Required)</label>
            <input 
              type="text" 
              value={sku}
              onFocus={() => setFocusField('sku')}
              onBlur={() => setFocusField(null)}
              onChange={e => setSku(e.target.value.toUpperCase())}
              placeholder="e.g. BPC157"
              className="admin-premium-input"
              style={{ width: '100%' }}
              required
            />
          </div>
          <div>
            <label style={getLabelStyle()}>Dosage / Strength</label>
            <input 
              type="text" 
              value={dosage}
              onFocus={() => setFocusField('dosage')}
              onBlur={() => setFocusField(null)}
              onChange={e => setDosage(e.target.value)}
              placeholder="e.g. 5mg"
              className="admin-premium-input"
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={getLabelStyle()}>Category</label>
            <select
              value={category}
              onFocus={() => setFocusField('category')}
              onBlur={() => setFocusField(null)}
              onChange={e => setCategory(e.target.value)}
              className="admin-premium-select"
              style={{ width: '100%', cursor: 'pointer' }}
            >
              <option value="Healing & Recovery">Healing & Recovery</option>
              <option value="Weight Loss">Weight Loss</option>
              <option value="Anti-Aging">Anti-Aging</option>
              <option value="Cognitive & Focus">Cognitive & Focus</option>
              <option value="Muscle & Performance">Muscle & Performance</option>
              <option value="Other">Other (Type below)</option>
            </select>
          </div>
          {category === 'Other' && (
            <div>
              <label style={getLabelStyle()}>Custom Category</label>
              <input 
                type="text" 
                value={customCategory}
                onFocus={() => setFocusField('customCategory')}
                onBlur={() => setFocusField(null)}
                onChange={e => setCustomCategory(e.target.value)}
                placeholder="Category Name"
                className="admin-premium-input"
                style={{ width: '100%' }}
              />
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.75rem' }}>
          <div>
            <label style={getLabelStyle()}>Initial Stock Level</label>
            <input 
              type="number" 
              value={stock}
              onFocus={() => setFocusField('stock')}
              onBlur={() => setFocusField(null)}
              onChange={e => setStock(parseInt(e.target.value) || 0)}
              className="admin-premium-input"
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={getLabelStyle()}>Guest Price ($/vial)</label>
            <input 
              type="number" 
              step="0.01"
              value={guestPrice}
              onFocus={() => setFocusField('guestPrice')}
              onBlur={() => setFocusField(null)}
              onChange={e => setGuestPrice(parseFloat(e.target.value) || 0)}
              className="admin-premium-input"
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={getLabelStyle()}>Pro Price ($/vial)</label>
            <input 
              type="number" 
              step="0.01"
              value={proPrice}
              onFocus={() => setFocusField('proPrice')}
              onBlur={() => setFocusField(null)}
              onChange={e => setProPrice(parseFloat(e.target.value) || 0)}
              className="admin-premium-input"
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={getLabelStyle()}>Warehouse Location</label>
            <select
              value={warehouse}
              className="admin-premium-select"
              onFocus={() => setFocusField('warehouse')}
              onBlur={() => setFocusField(null)}
              onChange={e => setWarehouse(e.target.value)}
              style={{ width: '100%', cursor: 'pointer' }}
            >
              <option value="Poland">Poland</option>
              <option value="UK">UK</option>
              <option value="USA">USA</option>
              <option value="Greece">Greece</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.6rem' }}>
          <button 
            type="submit"
            disabled={isRegistering}
            onMouseEnter={() => setIsSubmitHovered(true)}
            onMouseLeave={() => setIsSubmitHovered(false)}
            style={{
              padding: '6px 18px', 
              fontSize: '0.75rem', 
              borderRadius: '6px',
              backgroundColor: isSubmitHovered ? '#059669' : '#10b981', 
              color: '#ffffff', 
              border: 'none',
              fontWeight: 600, 
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              transform: isSubmitHovered ? 'translateY(-1px)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            {isRegistering ? 'Registering...' : 'Register Product in Catalog'}
          </button>
        </div>
      </form>
    </div>
  );
}

function RFQItemsList({ rfqId, items: initialItems, onSaveItems, supplierName, catalogProducts, onProductCreated, onStockUpdated }) {
  const [items, setItems] = useState(initialItems);
  const [filterText, setFilterText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  // Selection & Expansion states
  const [selectedItems, setSelectedItems] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [bulkMargin, setBulkMargin] = useState('');
  const [bulkCost, setBulkCost] = useState('');

  // Sync with initialItems if they change externally
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const handleCopyMagicLink = () => {
    const magicLink = `${window.location.origin}/supplier-quote/${rfqId}?token=secure_${Date.now()}`;
    navigator.clipboard.writeText(magicLink);
    alert(`Magic link copied to clipboard!\n\n${magicLink}\n\nShare it with ${supplierName} to get a quote.`);
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      setItems(initialItems);
    }
    setIsEditing(!isEditing);
  };

  const handleItemChange = (idx, field, value) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const handleDeleteItem = (idx) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddItem = () => {
    setItems(prev => [
      ...prev,
      {
        peptide_name: 'New Material',
        dosage: '',
        quantity: 10,
        units: 'vials',
        supplierUnitCost: 0,
        marginPercent: 20,
        clientUnitPrice: 0
      }
    ]);
  };

  const handleSaveChanges = () => {
    onSaveItems(items);
    setIsEditing(false);
  };

  const filtered = items.filter(item => 
    (item.peptide_name || '').toLowerCase().includes(filterText.toLowerCase()) ||
    (item.dosage || '').toLowerCase().includes(filterText.toLowerCase())
  );

  const handleRowClick = (e, idx) => {
    if (isEditing) return;
    const tag = e.target.tagName.toLowerCase();
    if (tag === 'input' || tag === 'button' || tag === 'a' || e.target.closest('button') || e.target.closest('a') || e.target.closest('input')) {
      return;
    }
    setExpandedIndex(prev => prev === idx ? null : idx);
  };

  const handleToggleSelectItem = (item) => {
    setSelectedItems(prev => 
      prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(filtered);
    } else {
      setSelectedItems([]);
    }
  };

  const isAllSelected = filtered.length > 0 && filtered.every(item => selectedItems.includes(item));

  return (
    <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border, #cbd5e1)', paddingTop: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted, #64748b)', margin: 0, fontWeight: 600 }}>
            Requested Items ({filtered.length} of {items.length})
          </h4>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Filter items..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              borderRadius: '16px',
              border: '1px solid var(--border, #cbd5e1)',
              outline: 'none',
              width: '180px',
              backgroundColor: '#ffffff'
            }}
          />
          
          <button
            onClick={handleCopyMagicLink}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              fontSize: '0.8rem',
              borderRadius: '16px',
              backgroundColor: '#f5f3ff',
              color: '#6d28d9',
              border: '1px solid #ddd6fe',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            title={`Copy magic link to request pricing from ${supplierName}`}
          >
            <Link size={12} /> Request Quote
          </button>
          
          {!isEditing ? (
            <button
              onClick={handleToggleEdit}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                fontSize: '0.8rem',
                borderRadius: '16px',
                backgroundColor: '#f8fafc',
                color: '#475569',
                border: '1px solid #cbd5e1',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Edit2 size={12} /> Edit Lead
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handleAddItem}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  borderRadius: '16px',
                  backgroundColor: '#f0fdf4',
                  color: '#15803d',
                  border: '1px solid #bbf7d0',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Plus size={12} /> Add Item
              </button>
              <button
                onClick={handleSaveChanges}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  borderRadius: '16px',
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  border: '1px solid #2563eb',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Check size={12} /> Save
              </button>
              <button
                onClick={handleToggleEdit}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  borderRadius: '16px',
                  backgroundColor: '#fef2f2',
                  color: '#dc2626',
                  border: '1px solid #fca5a5',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <X size={12} /> Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Batch operations toolbar */}
      {selectedItems.length > 0 && !isEditing && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
          padding: '0.75rem 1rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe',
          borderRadius: '8px', marginBottom: '1rem', animation: 'fadeIn 0.2s', textAlign: 'left'
        }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e40af' }}>
            {selectedItems.length} selected:
          </span>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input 
                type="number"
                placeholder="Margin %"
                value={bulkMargin}
                onChange={e => setBulkMargin(e.target.value)}
                style={{ width: '80px', padding: '4px 6px', fontSize: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
              <button 
                onClick={() => {
                  const m = parseFloat(bulkMargin);
                  if (isNaN(m)) return alert('Enter a valid margin percentage');
                  setItems(prev => prev.map(item => {
                    if (selectedItems.includes(item)) {
                      const cost = item.supplierUnitCost || 0;
                      const price = cost * (1 + m / 100);
                      return { ...item, marginPercent: m, clientUnitPrice: parseFloat(price.toFixed(2)) };
                    }
                    return item;
                  }));
                  setBulkMargin('');
                }}
                style={{
                  padding: '4px 10px', fontSize: '0.75rem', backgroundColor: '#2563eb', color: '#fff',
                  border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600
                }}
              >
                Apply Margin
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#1e40af' }}>$</span>
              <input 
                type="number"
                step="0.01"
                placeholder="Cost"
                value={bulkCost}
                onChange={e => setBulkCost(e.target.value)}
                style={{ width: '80px', padding: '4px 6px', fontSize: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
              <button 
                onClick={() => {
                  const c = parseFloat(bulkCost);
                  if (isNaN(c)) return alert('Enter a valid supplier cost');
                  setItems(prev => prev.map(item => {
                    if (selectedItems.includes(item)) {
                      const margin = item.marginPercent || 20;
                      const price = c * (1 + margin / 100);
                      return { ...item, supplierUnitCost: c, clientUnitPrice: parseFloat(price.toFixed(2)) };
                    }
                    return item;
                  }));
                  setBulkCost('');
                }}
                style={{
                  padding: '4px 10px', fontSize: '0.75rem', backgroundColor: '#2563eb', color: '#fff',
                  border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600
                }}
              >
                Set Cost
              </button>
            </div>

            <button 
              onClick={() => {
                setItems(prev => prev.map(item => {
                  if (selectedItems.includes(item)) {
                    const cost = item.supplierUnitCost || 0;
                    const margin = item.marginPercent || 20;
                    const price = cost * (1 + margin / 100);
                    return { ...item, clientUnitPrice: parseFloat(price.toFixed(2)) };
                  }
                  return item;
                }));
                alert('Auto-calculated client prices for selected items!');
              }}
              style={{
                padding: '4px 12px', fontSize: '0.75rem', backgroundColor: '#10b981', color: '#fff',
                border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, marginLeft: '0.5rem'
              }}
            >
              Auto-Price Client
            </button>

            <button 
              onClick={async () => {
                const missing = selectedItems.filter(item => !findMatchingProduct(item.peptide_name, catalogProducts));
                if (missing.length === 0) {
                  return alert('All selected items are already registered in the catalog.');
                }
                const cat = prompt(
                  `Registering ${missing.length} items to catalog.\nChoose category:\n1. Healing & Recovery\n2. Weight Loss\n3. Anti-Aging\n4. Cognitive & Focus\n5. Muscle & Performance\n\nType category name:`, 
                  'Healing & Recovery'
                );
                if (!cat) return;
                
                let successCount = 0;
                const { doc, setDoc } = await import('firebase/firestore');
                
                for (const item of missing) {
                  try {
                    const skuCode = slugify(item.peptide_name).toUpperCase();
                    const dosageStr = item.dosage || '5mg';
                    const docId = slugify(item.peptide_name + '-' + dosageStr);
                    
                    const newProd = {
                      id: docId,
                      name: item.peptide_name,
                      sku: skuCode,
                      category: cat,
                      dosage: dosageStr,
                      guestVialPrice: item.clientUnitPrice || 25.0,
                      guestKitPrice: parseFloat(((item.clientUnitPrice || 25.0) * 10).toFixed(2)),
                      proVialPrice: parseFloat(((item.clientUnitPrice || 20.0) * 0.8).toFixed(2)),
                      proKitPrice: parseFloat(((item.clientUnitPrice || 20.0) * 8).toFixed(2)),
                      stock: item.quantity || 10,
                      warehouse: 'Poland',
                      isActive: true,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString()
                    };

                    await setDoc(doc(db, 'products', docId), newProd);
                    
                    const variantDoc = {
                      id: 'default',
                      sku: skuCode,
                      dosage: dosageStr,
                      isActive: true,
                      isDefault: true,
                      pricing: {
                        retailPrice: { base: item.clientUnitPrice || 25.0 },
                        wholesalePrice: { base: parseFloat(((item.clientUnitPrice || 20.0) * 0.8).toFixed(2)) }
                      },
                      stock: {
                        quantity: item.quantity || 10,
                        available: true
                      },
                      warehouse: 'Poland'
                    };
                    await setDoc(doc(db, 'products', docId, 'variants', 'default'), variantDoc);

                    onProductCreated(newProd);
                    successCount++;
                  } catch (err) {
                    console.error('Failed to register ' + item.peptide_name, err);
                  }
                }
                
                alert(`Bulk registered ${successCount} of ${missing.length} missing products!`);
                setSelectedItems([]);
              }}
              style={{
                padding: '4px 12px', fontSize: '0.75rem', backgroundColor: '#8b5cf6', color: '#fff',
                border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, marginLeft: '0.5rem'
              }}
            >
              Bulk Register Missing
            </button>

            <button 
              onClick={() => {
                if (!confirm(`Delete ${selectedItems.length} items from this RFQ?`)) return;
                setItems(prev => prev.filter(item => !selectedItems.includes(item)));
                setSelectedItems([]);
              }}
              style={{
                padding: '4px 12px', fontSize: '0.75rem', backgroundColor: '#ef4444', color: '#fff',
                border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, marginLeft: '0.5rem'
              }}
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      <div style={{ 
        maxHeight: '400px', 
        overflowY: 'auto', 
        border: '1px solid var(--border, #cbd5e1)', 
        borderRadius: '8px',
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
      }}>
        <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 1 }}>
              {!isEditing && (
                <th style={{ padding: '10px 14px', width: '40px', textAlign: 'center' }}>
                  <input 
                    type="checkbox" 
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
              )}
              <th style={{ padding: '10px 14px', fontWeight: 600, color: '#475569' }}>Item Description</th>
              <th style={{ padding: '10px 14px', fontWeight: 600, color: '#475569', textAlign: 'right', width: '100px' }}>Quantity</th>
              <th style={{ padding: '10px 14px', fontWeight: 600, color: '#475569', textAlign: 'center', width: '100px' }}>Units</th>
              <th style={{ padding: '10px 14px', fontWeight: 600, color: '#475569', textAlign: 'right', width: '120px' }}>Unit Price</th>
              <th style={{ padding: '10px 14px', fontWeight: 600, color: '#475569', textAlign: 'right', width: '120px' }}>Total Price</th>
              {isEditing && <th style={{ padding: '10px 14px', fontWeight: 600, color: '#475569', textAlign: 'center', width: '60px' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={isEditing ? 6 : 5} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  No matching items found.
                </td>
              </tr>
            ) : (
              filtered.map((item, idx) => {
                const originalIndex = items.findIndex(x => x === item);
                const price = item.clientUnitPrice || 0;
                const total = price * (item.quantity || 0);
                const isSelected = selectedItems.includes(item);
                const isExpanded = expandedIndex === idx;

                return (
                  <React.Fragment key={idx}>
                    <tr 
                      onClick={(e) => handleRowClick(e, idx)}
                      style={{ 
                        borderBottom: '1px solid #f1f5f9',
                        cursor: isEditing ? 'default' : 'pointer',
                        backgroundColor: isSelected ? '#f0f7ff' : isExpanded ? '#f8fafc' : 'transparent',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={e => { if(!isEditing && !isSelected && !isExpanded) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                      onMouseLeave={e => { if(!isEditing && !isSelected && !isExpanded) e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      {!isEditing && (
                        <td style={{ textAlign: 'center', padding: '10px 14px' }}>
                          <input 
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectItem(item)}
                            style={{ cursor: 'pointer' }}
                          />
                        </td>
                      )}
                      <td style={{ padding: '10px 14px' }}>
                        {isEditing ? (
                          <div style={{ display: 'flex', gap: '0.4rem', flexDirection: 'column' }}>
                            <input 
                              type="text" 
                              className="admin-premium-input"
                              value={item.peptide_name || ''} 
                              onChange={(e) => handleItemChange(originalIndex, 'peptide_name', e.target.value)}
                              style={{ padding: '4px 8px', fontSize: '0.85rem', width: '100%', fontWeight: '600' }}
                            />
                            <input 
                              type="text" 
                              className="admin-premium-input"
                              placeholder="Dosage (optional)"
                              value={item.dosage || ''} 
                              onChange={(e) => handleItemChange(originalIndex, 'dosage', e.target.value)}
                              style={{ padding: '4px 8px', fontSize: '0.75rem', width: '100%', color: '#64748b' }}
                            />
                            
                            {/* Supplier Cost & Margin Inputs */}
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '4px', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Cost: $</span>
                              <input 
                                type="number" 
                                className="admin-premium-input"
                                step="0.01"
                                value={item.supplierUnitCost || 0} 
                                onChange={(e) => {
                                  const cost = parseFloat(e.target.value) || 0;
                                  const margin = item.marginPercent || 20;
                                  const clientPrice = cost * (1 + margin / 100);
                                  setItems(prev => prev.map((x, i) => i === originalIndex ? { ...x, supplierUnitCost: cost, clientUnitPrice: parseFloat(clientPrice.toFixed(2)) } : x));
                                }}
                                style={{ width: '60px', padding: '4px 6px', fontSize: '0.75rem' }}
                              />
                              <span style={{ fontSize: '0.7rem', color: '#64748b', marginLeft: '4px' }}>Margin:</span>
                              <input 
                                type="number" 
                                className="admin-premium-input"
                                value={item.marginPercent || 20} 
                                onChange={(e) => {
                                  const margin = parseFloat(e.target.value) || 0;
                                  const cost = item.supplierUnitCost || 0;
                                  const clientPrice = cost * (1 + margin / 100);
                                  setItems(prev => prev.map((x, i) => i === originalIndex ? { ...x, marginPercent: margin, clientUnitPrice: parseFloat(clientPrice.toFixed(2)) } : x));
                                }}
                                style={{ width: '50px', padding: '4px 6px', fontSize: '0.75rem' }}
                              />
                              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>%</span>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{isExpanded ? '▼' : '▶'}</span>
                            <span style={{ fontWeight: 600, color: '#1e293b' }}>{item.peptide_name}</span>
                            {item.dosage && <span style={{ marginLeft: '4px', fontSize: '0.75rem', color: '#64748b', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{item.dosage}</span>}
                            
                            {/* Short stock status badge directly on row */}
                            {!isEditing && (
                              (() => {
                                const m = findMatchingProduct(item.peptide_name, catalogProducts);
                                if (!m) {
                                  return <span style={{ fontSize: '0.65rem', backgroundColor: '#f3f4f6', color: '#4b5563', padding: '1px 5px', borderRadius: '4px', border: '1px solid #e5e7eb' }}>Unregistered</span>;
                                }
                                if ((m.stock || 0) <= 0) {
                                  return <span style={{ fontSize: '0.65rem', backgroundColor: '#fef2f2', color: '#ef4444', padding: '1px 5px', borderRadius: '4px', border: '1px solid #fca5a5' }}>Out of Stock</span>;
                                }
                                if ((m.stock || 0) < 20) {
                                  return <span style={{ fontSize: '0.65rem', backgroundColor: '#fffbeb', color: '#d97706', padding: '1px 5px', borderRadius: '4px', border: '1px solid #fcd34d' }}>Low Stock</span>;
                                }
                                return <span style={{ fontSize: '0.65rem', backgroundColor: '#f0fdf4', color: '#16a34a', padding: '1px 5px', borderRadius: '4px', border: '1px solid #bbf7d0' }}>In Stock</span>;
                              })()
                            )}
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', padding: '10px 14px' }}>
                        {isEditing ? (
                          <input 
                            type="number" 
                            className="admin-premium-input"
                            value={item.quantity} 
                            onChange={(e) => handleItemChange(originalIndex, 'quantity', parseFloat(e.target.value) || 0)}
                            style={{ padding: '4px 6px', fontSize: '0.85rem', width: '70px', textAlign: 'right' }}
                          />
                        ) : (
                          <span style={{ color: '#334155', fontWeight: 600 }}>{item.quantity}</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center', padding: '10px 14px' }}>
                        {isEditing ? (
                          <input 
                            type="text" 
                            className="admin-premium-input"
                            value={item.units || ''} 
                            placeholder="Units"
                            onChange={(e) => handleItemChange(originalIndex, 'units', e.target.value)}
                            style={{ padding: '4px 6px', fontSize: '0.85rem', width: '70px', textAlign: 'center' }}
                          />
                        ) : (
                          <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 500 }}>{item.units || 'vials'}</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', padding: '10px 14px', color: price > 0 ? '#0f766e' : '#64748b' }}>
                        {isEditing ? (
                          <input 
                            type="number" 
                            className="admin-premium-input"
                            step="0.01"
                            value={item.clientUnitPrice || 0} 
                            onChange={(e) => handleItemChange(originalIndex, 'clientUnitPrice', parseFloat(e.target.value) || 0)}
                            style={{ padding: '4px 6px', fontSize: '0.85rem', width: '80px', textAlign: 'right' }}
                          />
                        ) : (
                          price > 0 ? `$${price.toFixed(2)}` : <span style={{ fontSize: '0.75rem', fontStyle: 'italic' }}>Awaiting pricing</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', padding: '10px 14px', fontWeight: 600, color: total > 0 ? '#0f766e' : '#64748b' }}>
                        {total > 0 ? `$${total.toFixed(2)}` : '-'}
                      </td>
                      {isEditing && (
                        <td style={{ textAlign: 'center', padding: '10px 14px' }}>
                          <button
                            onClick={() => handleDeleteItem(originalIndex)}
                            style={{
                              border: 'none',
                              background: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              padding: '2px'
                            }}
                            title="Delete this item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      )}
                    </tr>
                    
                    {/* Collapsible Details Row */}
                    {isExpanded && !isEditing && (
                      <tr>
                        <td colSpan={6} style={{ padding: '12px 14px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#fafbfd' }}>
                          <ProductDetailsPane 
                            item={item}
                            catalogProducts={catalogProducts}
                            onProductCreated={onProductCreated}
                            onStockUpdated={onStockUpdated}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


export default function AdminLeadsTab() {
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedTypeTab, setSelectedTypeTab] = useState('All');
  
  // Local catalog cache for RFQ matching
  const [catalogProducts, setCatalogProducts] = useState([]);

  const handleProductCreated = (newProduct) => {
    setCatalogProducts(prev => [...prev, newProduct]);
  };

  const handleStockUpdated = (productId, newStock) => {
    setCatalogProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
  };

  const handleUpdateRFQItems = async (rfqId, updatedItems) => {
    try {
      await updateDoc(doc(db, 'agency_rfqs', rfqId), {
        items: updatedItems
      });
      setLeads(prev => prev.map(l => {
        if (l.id === rfqId) {
          return {
            ...l,
            message: `RFQ from ${l.originalData.supplierName || 'Supplier'}\nItems: ${updatedItems.length}`,
            originalData: {
              ...l.originalData,
              items: updatedItems
            }
          };
        }
        return l;
      }));
      toast.success("Lead items updated successfully.");
    } catch (err) {
      console.error("Error updating RFQ items:", err);
      toast.error("Failed to save changes.");
    }
  };

  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);
  
  useEffect(() => {
    fetchLeads();
  }, []);
  
  async function fetchLeads() {
    setLoading(true);
    try {
      const [leadsData, rfqsSnap, productsSnap] = await Promise.all([
        isAdmin 
          ? catalogRepository.getAllLeads() 
          : catalogRepository.getLeadsByOwner(user?.uid),
        getDocs(query(collection(db, 'agency_rfqs'), orderBy('createdAt', 'desc'))),
        getDocs(collection(db, 'products'))
      ]);

      const allProducts = productsSnap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setCatalogProducts(allProducts);
      
      const rfqs = rfqsSnap.docs.map(d => {
        const data = d.data();
        const rawCreatedAt = data.createdAt;
        let isoCreatedAt = new Date().toISOString();
        if (rawCreatedAt) {
          if (typeof rawCreatedAt.toDate === 'function') {
            isoCreatedAt = rawCreatedAt.toDate().toISOString();
          } else if (rawCreatedAt.seconds) {
            isoCreatedAt = new Date(rawCreatedAt.seconds * 1000).toISOString();
          } else {
            const parsedDate = new Date(rawCreatedAt);
            if (!isNaN(parsedDate.getTime())) {
              isoCreatedAt = parsedDate.toISOString();
            }
          }
        }
        
        return {
          id: d.id,
          name: data.clientName || 'RFQ Client',
          email: 'N/A (B2B)',
          message: `RFQ from ${data.supplierName || 'Supplier'}\nItems: ${data.items?.length || 0}`,
          status: data.status?.toLowerCase() || 'new',
          createdAt: isoCreatedAt,
          type: 'rfq',
          originalData: data
        };
      });

      const combined = [...(leadsData || []), ...rfqs].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });

      setLeads(combined);
    } catch (err) {
      console.error('Error fetching leads:', err);
      toast.error('Failed to load leads.');
    } finally {
      setLoading(false);
    }
  }


  const handleStatusChange = async (leadId, newStatus) => {
    try {
      const leadToUpdate = leads.find(l => l.id === leadId);
      if (!leadToUpdate) return;
      
      if (leadToUpdate.type === 'rfq') {
         await updateDoc(doc(db, 'agency_rfqs', leadId), { status: newStatus.toUpperCase() });
      } else {
         const updatedLead = { ...leadToUpdate, status: newStatus };
         await catalogRepository.saveLeadRequest(updatedLead);
      }
      
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
      toast.success(`Lead status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating lead status:', err);
      toast.error('Failed to update status.');
    }
  };

  const handleExportCSV = () => {
    if (leads.length === 0) return;

    const headers = ['ID', 'Name', 'Email', 'Phone', 'Status', 'Date', 'Catalog ID', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...leads.map((l) => [
        l.id,
        `"${l.name || ''}"`,
        `"${l.email || ''}"`,
        `"${l.phone || ''}"`,
        l.status || 'new',
        new Date(l.createdAt).toLocaleDateString(),
        l.catalogId || '',
        `"${(l.message || '').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeads = leads.filter((l) => {
    if (selectedTypeTab === 'B2C' && l.type === 'rfq') return false;
    if (selectedTypeTab === 'B2B' && l.type !== 'rfq') return false;

    const matchesStatus = filterStatus === 'All' || l?.status === filterStatus.toLowerCase();
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (l?.name || '').toLowerCase().includes(searchLower) ||
      (l?.email || '').toLowerCase().includes(searchLower) ||
      (l?.phone || '').toLowerCase().includes(searchLower);

    return matchesStatus && matchesSearch;
  });


  const activeFilters = [];
  if (filterStatus !== 'All') activeFilters.push({ label: 'Status', value: filterStatus, type: 'status' });
  
  const handleFilterRemove = (filter) => {
    if (filter.type === 'status') setFilterStatus('All');
  };

  const columns = [
    {
      key: 'contact',
      header: 'Contact Info',
      sortKey: 'contact',
      sortValue: (l) => (l.name || '').toLowerCase(),
      render: (l) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AppEntityCell
            title={l.name || 'Unknown Contact'}
            subtitle={
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><Mail size={10} /> {l.email}</span>
                {l.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>| <Phone size={10} /> {l.phone}</span>}
              </div>
            }
          />
          {l.temperature && (
            <div style={{ 
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              backgroundColor: l.temperature === 'HOT' ? '#fef2f2' : l.temperature === 'WARM' ? '#fffbeb' : '#f8fafc',
              color: l.temperature === 'HOT' ? '#ef4444' : l.temperature === 'WARM' ? '#f59e0b' : '#64748b',
              border: `1px solid ${l.temperature === 'HOT' ? '#fca5a5' : l.temperature === 'WARM' ? '#fcd34d' : '#e2e8f0'}`,
              borderRadius: '8px', padding: '2px 8px', minWidth: '40px'
            }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.5px' }}>{l.temperature}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{l.score || 0}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '120px',
      sortKey: 'status',
      sortValue: (l) => l.status,
      render: (l) => {
        const isNew = l.status === 'new';
        const isContacted = l.status === 'contacted';
        return (
          <select 
            value={l.status || 'new'} 
            onChange={(e) => handleStatusChange(l.id, e.target.value)}
            style={{
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: isNew ? '#e8f0fe' : isContacted ? '#fef7e0' : '#e6f4ea',
              color: isNew ? '#1a73e8' : isContacted ? '#b06000' : '#137333',
              outline: 'none'
            }}
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="completed">Completed</option>
          </select>
        );
      },
    },
    {
      key: 'date',
      header: 'Date',
      width: '120px',
      sortKey: 'date',
      sortValue: (l) => new Date(l.createdAt).getTime(),
      render: (l) => (
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {new Date(l.createdAt).toLocaleDateString()}
        </span>
      ),
    }
  ];

  const renderExpandedRow = (l) => {
    return (
      <div
        style={{
          backgroundColor: 'var(--color-bg-subtle, #f8fafc)',
          borderRadius: 'var(--radius-lg, 8px)',
          border: '1px solid var(--border)',
          padding: '1.5rem',
          margin: '0.5rem 0',
          boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Message / Request Notes</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-wrap' }}>
              {l.message || 'No additional notes provided.'}
            </p>
          </div>
          <div>
             <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Source Catalog</h4>
             {l.catalogId ? (
                <a href={`/catalog/${l.catalogId}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem', color: 'var(--primary)', textDecoration: 'none' }}>
                  Open Catalog <ArrowUpRight size={14} />
                </a>
             ) : (
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Unknown source</span>
             )}
          </div>
        </div>

        {l.type === 'rfq' && l.originalData?.items && (
          <RFQItemsList 
            rfqId={l.id}
            items={l.originalData.items} 
            onSaveItems={(updatedItems) => handleUpdateRFQItems(l.id, updatedItems)}
            supplierName={l.originalData.supplierName || 'LotusLand'}
            catalogProducts={catalogProducts}
            onProductCreated={handleProductCreated}
            onStockUpdated={handleStockUpdated}
          />
        )}

      </div>
    );
  };


  const renderCustomFilters = () => (
    <select
      className="admin-premium-select"
      value={filterStatus}
      onChange={(e) => setFilterStatus(e.target.value)}
      style={{
        height: '32px', padding: '0 2rem 0 0.75rem', borderRadius: '16px',
        fontSize: '0.8rem', fontWeight: 500, minWidth: '120px'
      }}
    >
      <option value="All">Status: All</option>
      <option value="New">New</option>
      <option value="Contacted">Contacted</option>
      <option value="Completed">Completed</option>
    </select>
  );

  const totalItems = filteredLeads.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const totalCount = leads.length;
  const b2bCount = leads.filter(l => l.type === 'rfq').length;
  const b2cCount = leads.filter(l => l.type !== 'rfq').length;
  const awaitingPricingCount = leads.filter(l => l.type === 'rfq' && (l.status === 'new' || l.status === 'draft')).length;
  const hotLeadsCount = leads.filter(l => l.temperature === 'HOT').length;
  const newLeadsCount = leads.filter(l => l.status === 'new').length;

  const [selectedKPIs, setSelectedKPIs] = useState(['total_leads', 'b2b_rfqs']); // Default selected

  const kpis = [
    { id: 'total_leads', title: 'Total Leads', value: totalCount, icon: Users, color: '#2563eb', bg: '#eff6ff' },
    { id: 'b2b_rfqs', title: 'B2B Client RFQs', value: b2bCount, icon: FileText, color: '#9333ea', bg: '#faf5ff' },
    { id: 'b2c_requests', title: 'B2C Catalog Requests', value: b2cCount, icon: Mail, color: '#16a34a', bg: '#f0fdf4' },
    { id: 'awaiting_pricing', title: 'Awaiting Pricing', value: awaitingPricingCount, icon: Calendar, color: '#d97706', bg: '#fffbeb' },
    { id: 'hot_leads', title: 'Hot Leads', value: hotLeadsCount, icon: AlertTriangle, color: '#ef4444', bg: '#fef2f2' },
    { id: 'new_leads', title: 'New Leads', value: newLeadsCount, icon: ArrowUpRight, color: '#0ea5e9', bg: '#e0f2fe' },
  ];

  const toggleKPISelection = (kpiId) => {
    setSelectedKPIs(prev => prev.includes(kpiId) ? prev.filter(id => id !== kpiId) : [...prev, kpiId]);
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <AdminPageHeader
        title="Lead Management"
        subtitle="Global B2B/B2C lead routing and ownership rules. Manage incoming requests from clinic catalogs."
        icon={Users}
      />

      {/* KPI Dashboard Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {kpis.map((kpi) => {
          const isSelected = selectedKPIs.includes(kpi.id);
          const IconComponent = kpi.icon;
          return (
            <div 
              key={kpi.id}
              style={{
                backgroundColor: '#ffffff', borderRadius: '16px', border: isSelected ? '2px solid #2563eb' : '1px solid var(--border, #e2e8f0)',
                padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: isSelected ? '0 4px 12px rgba(37, 99, 235, 0.15)' : '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
                position: 'relative', transition: 'all 0.2s ease', cursor: 'pointer'
              }}
              onClick={() => toggleKPISelection(kpi.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: kpi.bg, color: kpi.color, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconComponent size={20} />
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted, #64748b)', fontWeight: 500 }}>{kpi.title}</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main, #1e293b)' }}>{kpi.value}</span>
                </div>
              </div>
              
              {/* Select Indicator */}
              <div 
                title="Pin to global dashboard"
                style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  backgroundColor: isSelected ? '#2563eb' : '#f1f5f9',
                  border: isSelected ? 'none' : '1px solid #cbd5e1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#ffffff'
                }}
              >
                {isSelected && <Check size={14} strokeWidth={3} />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Subnavigation Pill Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border, #cbd5e1)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        {['All', 'B2C', 'B2B'].map(tab => (
          <button
            key={tab}
            onClick={() => {
              setSelectedTypeTab(tab);
              setCurrentPage(1);
            }}
            style={{
              padding: '6px 16px',
              fontSize: '0.85rem',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all 0.2s',
              backgroundColor: selectedTypeTab === tab ? '#1e3a8a' : 'transparent',
              color: selectedTypeTab === tab ? '#ffffff' : 'var(--text-muted, #64748b)'
            }}
          >
            {tab === 'All' ? 'All Leads' : tab === 'B2C' ? 'B2C Clinic Requests' : 'B2B Wholesale RFQs'}
          </button>
        ))}
      </div>


      <div style={{ marginBottom: '2rem' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading leads...
          </div>
        ) : (
          <DataTable
            data={paginatedLeads}
            columns={columns}
            keyField="id"
            expandableRender={renderExpandedRow}
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
            searchPlaceholder="Search leads by name, email, or phone..."
            selectedIds={selectedLeadIds}
            onSelectionChange={setSelectedLeadIds}
            filters={activeFilters}
            onFilterRemove={handleFilterRemove}
            renderCustomFilters={renderCustomFilters}
            emptyTitle="No leads found"
            emptyDescription="There are no incoming leads at this time. When clinics request information via catalogs, they will appear here."
            renderBatchActions={(selected) => (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={async () => {
                    if(selectedLeadIds.length === 0) return toast.error("Select leads to sync");
                    setIsSyncing(true);
                    // Mock sync to Zoho Bigin
                    setTimeout(() => {
                      setIsSyncing(false);
                      toast.success(`Synced ${selectedLeadIds.length} leads to Zoho Bigin.`);
                      setSelectedLeadIds([]);
                    }, 1500);
                  }}
                  className="btn btn-primary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.8rem',
                    padding: '0.4rem 0.8rem',
                  }}
                  disabled={isSyncing}
                >
                  {isSyncing ? <Loader2 size={14} className="spin" /> : <RefreshCcw size={14} />}
                  Sync Zoho Bigin
                </button>
                <button
                  onClick={() => navigate('/admin/rfq')}
                  className="btn btn-secondary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.8rem',
                    padding: '0.4rem 0.8rem',
                  }}
                >
                  <FileText size={14} /> Import Excel Quote
                </button>
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
                  <Download size={14} /> Export All
                </button>
              </div>
            )}
          />
        )}
      </div>
    </div>
  );
}
