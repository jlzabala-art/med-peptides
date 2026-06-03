import React, { useState, useEffect } from 'react';
import { PackagePlus, Beaker, Plus, X, Save, AlertTriangle } from 'lucide-react';
import { db } from '../../firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';

export default function CustomProtocolBuilder({ onSaved, onClose }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [protocolName, setProtocolName] = useState('');
  const [patientName, setPatientName] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchProducts() {
      try {
        const snap = await getDocs(collection(db, 'products'));
        setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const handleAddItem = (prod) => {
    const existing = selectedItems.find(i => i.id === prod.id);
    if (existing) {
      setSelectedItems(selectedItems.map(i => i.id === prod.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setSelectedItems([...selectedItems, { id: prod.id, name: prod.displayName || prod.name, qty: 1 }]);
    }
    setSearch('');
  };

  const handleRemoveItem = (id) => {
    setSelectedItems(selectedItems.filter(i => i.id !== id));
  };

  const handleUpdateQty = (id, newQty) => {
    if (newQty < 1) return;
    setSelectedItems(selectedItems.map(i => i.id === id ? { ...i, qty: newQty } : i));
  };

  const handleSave = async () => {
    if (!protocolName || selectedItems.length === 0) return;
    
    // We create a custom protocol with 1 phase that holds all items
    const customProtocol = {
      protocol_name: `${protocolName} (Custom Kit)`,
      therapeutic_category: 'Custom Patient Protocol',
      patient: patientName,
      status: 'active', // ready to be used
      created_at: new Date(),
      is_custom_composite: true, // Tag for Zoho
      phases: [
        {
          label: 'Phase 1: Custom Administration',
          durationWeeks: 4,
          medications: selectedItems.map(item => ({
            name: item.name,
            productId: item.id,
            dose_logic: { vials_required: item.qty }
          }))
        }
      ]
    };

    try {
      await addDoc(collection(db, 'protocols'), customProtocol);
      if (onSaved) onSaved();
    } catch (err) {
      console.error(err);
      alert('Error saving custom protocol');
    }
  };

  const filteredProducts = products.filter(p => (p.displayName || p.name || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '90%', maxWidth: '600px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
        
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PackagePlus size={20} color="var(--primary)" /> Build Custom Protocol Kit
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>

        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Protocol Name</label>
              <input 
                type="text" 
                value={protocolName} 
                onChange={(e) => setProtocolName(e.target.value)}
                placeholder="e.g. Intensive Recovery Stack"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.95rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Patient Name (Optional)</label>
              <input 
                type="text" 
                value={patientName} 
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. John Doe"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.95rem' }}
              />
            </div>
          </div>

          <div style={{ background: 'var(--surface-raised)', borderRadius: '12px', padding: '1rem', border: '1px solid var(--border)' }}>
            <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
              <Beaker size={16} /> Selected Components
            </h4>
            
            {selectedItems.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: '8px' }}>
                No peptides added yet. Search below to add items.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedItems.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Qty</span>
                        <input 
                          type="number" 
                          min="1" 
                          value={item.qty} 
                          onChange={(e) => handleUpdateQty(item.id, parseInt(e.target.value) || 1)}
                          style={{ width: '50px', padding: '0.25rem', textAlign: 'center', border: '1px solid var(--border)', borderRadius: '4px' }}
                        />
                      </div>
                      <button onClick={() => handleRemoveItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)' }}><X size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginTop: '2rem', position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Search Products</label>
            <input 
              type="text" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search catalog (e.g. Tirzepatide)..."
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.95rem' }}
            />
            {search && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', maxHeight: '200px', overflowY: 'auto', zIndex: 10, marginTop: '4px' }}>
                {filteredProducts.slice(0, 10).map(p => (
                  <div 
                    key={p.id} 
                    onClick={() => handleAddItem(p)}
                    style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-light)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{p.displayName || p.name}</span>
                    <Plus size={16} color="var(--primary)" />
                  </div>
                ))}
                {filteredProducts.length === 0 && <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No products found.</div>}
              </div>
            )}
          </div>
          
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <AlertTriangle size={20} style={{ color: 'var(--warning)', flexShrink: 0 }} />
            <div style={{ fontSize: '0.85rem', color: 'var(--warning)', fontWeight: 600, lineHeight: 1.4 }}>
              Saving this will automatically create a new <code style={{ background: 'white', padding: '2px 4px', borderRadius: '4px' }}>Composite Item</code> in Zoho Inventory representing this specific combination of components.
            </div>
          </div>
        </div>

        <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border)', backgroundColor: 'var(--surface)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button onClick={onClose} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'white', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button 
            onClick={handleSave} 
            disabled={!protocolName || selectedItems.length === 0}
            style={{ padding: '0.5rem 1.5rem', borderRadius: '6px', border: 'none', backgroundColor: 'var(--primary)', color: 'white', fontWeight: 600, cursor: (!protocolName || selectedItems.length === 0) ? 'not-allowed' : 'pointer', opacity: (!protocolName || selectedItems.length === 0) ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Save size={16} /> Save Kit to Zoho
          </button>
        </div>
      </div>
    </div>
  );
}
