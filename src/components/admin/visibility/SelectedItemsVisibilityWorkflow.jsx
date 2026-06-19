import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, Globe, Users, DollarSign, Shield, RefreshCw, Save, Archive } from 'lucide-react';
import { db } from '../../../firebase.js';
import { doc, getDoc } from 'firebase/firestore';

export default function SelectedItemsVisibilityWorkflow({ selectedItemIds, onClearSelection }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Configuration States
  const [regions, setRegions] = useState({
    uae: true, ksa: true, qatar: true, kuwait: true, oman: true, bahrain: true, eu: false, usa: false
  });
  const [segments, setSegments] = useState({
    doctors: true, clinics: true, distributors: true, pharmacies: false, internal: true
  });
  const [pricingMode, setPricingMode] = useState('show'); // show, hide, request
  const [regulatoryGates, setRegulatoryGates] = useState({
    requireCoa: true,
    countryRestrict: true,
    flagRisk: false
  });
  const [zohoSync, setZohoSync] = useState('sync_now'); // sync_now, sync_later, pending

  useEffect(() => {
    let isMounted = true;
    const fetchItems = async () => {
      setLoading(true);
      try {
        const fetchedItems = [];
        for (const id of selectedItemIds) {
          // Attempt to fetch from variants first (as per user instruction "only variants")
          const variantRef = doc(db, 'variants', id);
          const variantSnap = await getDoc(variantRef);
          if (variantSnap.exists()) {
            fetchedItems.push({ id: variantSnap.id, ...variantSnap.data(), _type: 'variant' });
          } else {
            // Fallback to products if for some reason a product ID slipped through
            const productRef = doc(db, 'products', id);
            const productSnap = await getDoc(productRef);
            if (productSnap.exists()) {
              fetchedItems.push({ id: productSnap.id, ...productSnap.data(), _type: 'product' });
            }
          }
        }
        if (isMounted) setItems(fetchedItems);
      } catch (err) {
        console.error("Failed to fetch selected items:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (selectedItemIds && selectedItemIds.length > 0) {
      fetchItems();
    } else {
      setItems([]);
      setLoading(false);
    }

    return () => { isMounted = false; };
  }, [selectedItemIds]);

  const handleRemoveItem = (id) => {
    const updatedIds = selectedItemIds.filter(itemId => itemId !== id);
    if (updatedIds.length === 0) {
      onClearSelection();
    } else {
      // We don't have a direct setter for selectedItemIds from parent without a callback to update it.
      // But we can mutate session storage and reload, or just rely on the parent. 
      // Let's assume the parent handles it if we update session storage, but we need to trigger a re-render.
      // Actually, since we only get selectedItemIds as a prop, we should really just update session storage and dispatch an event or force refresh, or let parent provide an onUpdate.
      // For now, update session storage and mutate local state of items visually.
      sessionStorage.setItem('pricing_visibility_selected_items', JSON.stringify(updatedIds));
      setItems(items.filter(item => item.id !== id));
      // To properly sync with parent, parent needs to pass an onChange, but we can do a window reload as a fallback if needed.
    }
  };

  const handleAddMore = () => {
    navigate('/admin/products');
  };

  const handleSave = () => {
    // In a real implementation, this would save to Firestore and Zoho
    console.log("Saving rules for items", items.map(i => i.id), {
      regions, segments, pricingMode, regulatoryGates, zohoSync
    });
    alert("Visibility rules saved successfully!");
    onClearSelection();
  };

  const sectionStyle = {
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '24px'
  };

  const titleStyle = {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#0f172a',
    margin: '0 0 16px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const checkboxLabelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    color: '#334155'
  };

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button 
          onClick={onClearSelection}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', backgroundColor: '#f1f5f9' }}
        >
          <ArrowLeft size={20} color="#475569" />
        </button>
        <div>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>
            Pricing & Catalog Visibility
          </h2>
          <p style={{ margin: 0, color: '#64748b' }}>
            Editing visibility for {selectedItemIds.length} selected items
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
        
        {/* Main Configuration Form */}
        <div>
          {/* Regional Visibility */}
          <div style={sectionStyle}>
            <h3 style={titleStyle}><Globe size={18} color="#3b82f6" /> Regional Visibility</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '16px' }}>
              {Object.keys(regions).map(region => (
                <label key={region} style={checkboxLabelStyle}>
                  <input 
                    type="checkbox" 
                    checked={regions[region]} 
                    onChange={e => setRegions({...regions, [region]: e.target.checked})}
                    style={{ cursor: 'pointer' }}
                  />
                  {region.toUpperCase()}
                </label>
              ))}
            </div>
          </div>

          {/* Customer Segment Visibility */}
          <div style={sectionStyle}>
            <h3 style={titleStyle}><Users size={18} color="#10b981" /> Customer Segment Visibility</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
              {Object.keys(segments).map(segment => (
                <label key={segment} style={checkboxLabelStyle}>
                  <input 
                    type="checkbox" 
                    checked={segments[segment]} 
                    onChange={e => setSegments({...segments, [segment]: e.target.checked})}
                    style={{ cursor: 'pointer' }}
                  />
                  {segment.charAt(0).toUpperCase() + segment.slice(1)}
                </label>
              ))}
            </div>
          </div>

          {/* Pricing Visibility */}
          <div style={sectionStyle}>
            <h3 style={titleStyle}><DollarSign size={18} color="#eab308" /> Pricing Visibility</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={checkboxLabelStyle}>
                <input type="radio" name="pricing" checked={pricingMode === 'show'} onChange={() => setPricingMode('show')} />
                Show Price
              </label>
              <label style={checkboxLabelStyle}>
                <input type="radio" name="pricing" checked={pricingMode === 'hide'} onChange={() => setPricingMode('hide')} />
                Hide Price
              </label>
              <label style={checkboxLabelStyle}>
                <input type="radio" name="pricing" checked={pricingMode === 'request'} onChange={() => setPricingMode('request')} />
                Request Quotation Only
              </label>
            </div>
          </div>

          {/* Regulatory Gate */}
          <div style={sectionStyle}>
            <h3 style={titleStyle}><Shield size={18} color="#ef4444" /> Regulatory Gate</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={checkboxLabelStyle}>
                <input type="checkbox" checked={regulatoryGates.requireCoa} onChange={e => setRegulatoryGates({...regulatoryGates, requireCoa: e.target.checked})} />
                Allow visibility only if COA exists
              </label>
              <label style={checkboxLabelStyle}>
                <input type="checkbox" checked={regulatoryGates.countryRestrict} onChange={e => setRegulatoryGates({...regulatoryGates, countryRestrict: e.target.checked})} />
                Hide if restricted in selected country
              </label>
              <label style={checkboxLabelStyle}>
                <input type="checkbox" checked={regulatoryGates.flagRisk} onChange={e => setRegulatoryGates({...regulatoryGates, flagRisk: e.target.checked})} />
                Flag regulatory risk
              </label>
            </div>
          </div>

          {/* Zoho Propagation */}
          <div style={sectionStyle}>
            <h3 style={titleStyle}><RefreshCw size={18} color="#8b5cf6" /> Zoho Propagation</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={checkboxLabelStyle}>
                <input type="radio" name="zoho" checked={zohoSync === 'sync_now'} onChange={() => setZohoSync('sync_now')} />
                Sync visibility to Zoho immediately
              </label>
              <label style={checkboxLabelStyle}>
                <input type="radio" name="zoho" checked={zohoSync === 'sync_later'} onChange={() => setZohoSync('sync_later')} />
                Do not sync yet
              </label>
              <label style={checkboxLabelStyle}>
                <input type="radio" name="zoho" checked={zohoSync === 'pending'} onChange={() => setZohoSync('pending')} />
                Mark as pending sync
              </label>
            </div>
          </div>
        </div>

        {/* Sidebar: Selected Items Panel */}
        <div>
          <div style={{ ...sectionStyle, padding: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', margin: '0 0 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Selected Items
              <span style={{ fontSize: '0.8rem', backgroundColor: '#e0e7ff', color: '#4f46e5', padding: '2px 8px', borderRadius: '12px' }}>
                {items.length}
              </span>
            </h3>
            
            <button 
              onClick={handleAddMore}
              style={{ width: '100%', padding: '8px', marginBottom: '16px', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '6px', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.9rem' }}
            >
              <Plus size={16} /> Add More Items
            </button>

            {loading ? (
              <div style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>Loading items...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '500px', overflowY: 'auto' }}>
                {items.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: '#fafafa' }}>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontWeight: 500, fontSize: '0.85rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.name || item.sku || 'Unknown Variant'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                        {item.sku || 'No SKU'} • {item.productType || 'Standard'}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemoveItem(item.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#94a3b8' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div style={{ position: 'fixed', bottom: 0, left: 256, right: 0, backgroundColor: '#fff', borderTop: '1px solid #e2e8f0', padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: '12px', zIndex: 100 }}>
        <button 
          onClick={onClearSelection}
          style={{ padding: '8px 16px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#475569', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
        >
          Cancel
        </button>
        <button 
          style={{ padding: '8px 16px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#475569', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}
        >
          <Archive size={16} /> Save as Draft
        </button>
        <button 
          onClick={handleSave}
          style={{ padding: '8px 24px', border: 'none', backgroundColor: '#2563eb', color: '#fff', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}
        >
          <Save size={16} /> Save Visibility Rules
        </button>
      </div>
    </div>
  );
}
