"use client";

import React, { useState, useEffect } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../context/AuthContext';
import { useCatalogStore } from '../../store/useCatalogStore';
import { TextField, Select } from '../ui';
import { X, Box, Tag, DollarSign, Hash, Search, CheckCircle, AlertCircle, Check } from '@/lib/icons';

const CATEGORIES = [
  'Peptides',
  'API Peptides',
  'API Supplements',
  'Healing & Recovery',
  'Performance',
  'Cognitive',
  'Other',
];

const STEPS = [
  { id: 1, title: 'Zoho Lookup', icon: Search },
  { id: 2, title: 'Details & Prices', icon: DollarSign },
];

const ZOHO_SEARCH_URL = 'https://europe-west1-med-peptides-app.cloudfunctions.net/searchZohoItem';
const ZOHO_CREATE_URL = 'https://europe-west1-med-peptides-app.cloudfunctions.net/createZohoEntity';

export default function CreateProductModal({ isOpen, onClose, onCreated }) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [zohoCheckStatus, setZohoCheckStatus] = useState('idle'); // idle, loading, found, not_found, error
  const [zohoItems, setZohoItems] = useState([]);
  const [selectedZohoItem, setSelectedZohoItem] = useState(null);

  const [form, setForm] = useState({
    name: '',
    sku: '',
    category: 'Peptides',
    dosage: '',
    guestVialPrice: '',
    proVialPrice: '',
    stock: '',
    supplier: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setZohoCheckStatus('idle');
      setZohoItems([]);
      setSelectedZohoItem(null);
      setForm({
        name: '', sku: '', category: 'Peptides', dosage: '',
        guestVialPrice: '', proVialPrice: '', stock: '', supplier: '',
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLookupZoho = async () => {
    if (!form.sku && !form.name) {
      toast.warning("Please enter SKU or Name to search");
      return;
    }
    setZohoCheckStatus('loading');
    setZohoItems([]);
    setSelectedZohoItem(null);
    try {
      const res = await fetch(ZOHO_SEARCH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku: form.sku.trim(), name: form.name.trim() })
      });
      const data = await res.json();
      if (data.found && data.items && data.items.length > 0) {
        setZohoItems(data.items);
        setZohoCheckStatus('found');
        if (data.alreadyRegistered) {
          toast.warning("Warning: A similar product is already registered in Firebase.");
        }
      } else {
        setZohoCheckStatus('not_found');
      }
    } catch (err) {
      console.error(err);
      setZohoCheckStatus('error');
    }
  };

  const handleSelectZohoItem = (item) => {
    setSelectedZohoItem(item);
    setForm(prev => ({
      ...prev,
      name: prev.name || item.name,
      sku: prev.sku || item.sku,
      guestVialPrice: prev.guestVialPrice || (item.rate ? item.rate.toString() : ''),
    }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (zohoCheckStatus === 'idle') {
        handleLookupZoho();
        return;
      }
      if (zohoCheckStatus === 'not_found' && (!form.name || !form.sku)) {
        toast.warning("Name and SKU are required to create a new product.");
        return;
      }
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.name || !form.sku) {
      toast.warning('Item Name and SKU are required.');
      return;
    }
    setIsSubmitting(true);
    try {
      let zohoItemId = null;
      let finalName = form.name;
      let finalSku = form.sku;

      if (selectedZohoItem) {
        zohoItemId = selectedZohoItem.item_id;
      } else {
        // Create in Zoho first
        const createRes = await fetch(ZOHO_CREATE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'item',
            payload: {
              name: form.name.trim(),
              sku: form.sku.trim().toUpperCase(),
              rate: parseFloat(form.guestVialPrice) || 0,
              description: form.dosage,
            }
          })
        });
        const createData = await createRes.json();
        if (!createData.success) throw new Error("Failed to create in Zoho Books");
        zohoItemId = createData.entity_id;
      }

      const newProduct = {
        name: finalName.trim(),
        sku: finalSku.trim().toUpperCase(),
        category: form.category,
        dosage: form.dosage,
        guestVialPrice: parseFloat(form.guestVialPrice) || 0,
        guestKitPrice: 0,
        proVialPrice: parseFloat(form.proVialPrice) || 0,
        proKitPrice: 0,
        stock: parseInt(form.stock) || 0,
        supplier: form.supplier || '',
        zoho_item_id: zohoItemId, // Linking field
        isActive: true,
        isGroup: false,
        createdAt: new Date().toISOString(),
        createdBy: user?.uid || 'admin',
        updatedAt: new Date().toISOString(),
      };
      await addDoc(collection(db, 'products'), newProduct);
      toast.success(`Item "${finalName}" created and linked to Zoho successfully.`);
      useCatalogStore.getState().invalidateCache();
      if (onCreated) onCreated();
      onClose();
    } catch (err) {
      console.error('Error creating item:', err);
      toast.error('Failed to create item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-bg-surface, #fff)',
          width: '100%',
          maxWidth: '500px',
          height: '100%',
          boxShadow: '-4px 0 20px rgba(0,0,0,0.12)',
          borderLeft: '1px solid var(--color-border, #e2e8f0)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            borderBottom: '1px solid var(--color-border, #e2e8f0)',
            backgroundColor: 'var(--color-bg-app, #f8fafc)',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Box size={20} color="var(--color-primary, #1a73e8)" />
            Add New Product (Zoho Linked)
          </h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <X size={20} color="#64748b" />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          
          {/* Stepper */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2.5rem', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '14px', left: 0, right: 0, height: '2px', backgroundColor: 'var(--border)', zIndex: 0 }}></div>
            <div style={{ position: 'absolute', top: '14px', left: 0, width: `${((step - 1) / (STEPS.length - 1)) * 100}%`, height: '2px', backgroundColor: 'var(--primary)', zIndex: 0, transition: 'width 0.3s ease' }}></div>
            {STEPS.map((s) => {
              const isCompleted = step > s.id;
              const isCurrent = step === s.id;
              return (
                <div key={s.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', zIndex: 1 }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: isCompleted || isCurrent ? 'var(--primary)' : 'var(--background)', border: `2px solid ${isCompleted || isCurrent ? 'var(--primary)' : 'var(--border)'}`, color: isCompleted || isCurrent ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
                    {isCompleted ? <Check size={16} strokeWidth={3} /> : <s.icon size={14} />}
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isCurrent ? 'var(--text-main)' : 'var(--text-muted)' }}>{s.title}</span>
                </div>
              );
            })}
          </div>

          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Enter SKU or Name to check if this product already exists in Zoho Books.
              </div>
              
              <TextField
                label="SKU"
                name="sku" 
                value={form.sku} 
                onChange={(e) => { handleChange(e); setZohoCheckStatus('idle'); setSelectedZohoItem(null); }} 
                placeholder="e.g. BPC157-5MG"
                icon={Hash}
              />
              
              <TextField
                label="Item Name"
                name="name" 
                value={form.name} 
                onChange={(e) => { handleChange(e); setZohoCheckStatus('idle'); setSelectedZohoItem(null); }} 
                placeholder="e.g. BPC-157"
                icon={Box}
              />

              <button className="gcp-btn-secondary" onClick={handleLookupZoho} disabled={zohoCheckStatus === 'loading' || (!form.sku && !form.name)}>
                {zohoCheckStatus === 'loading' ? 'Checking...' : 'Check Zoho'}
              </button>

              {zohoCheckStatus === 'found' && zohoItems.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                    Found {zohoItems.length} matching items in Zoho:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {zohoItems.map(item => (
                      <div 
                        key={item.item_id}
                        onClick={() => handleSelectZohoItem(item)}
                        style={{ 
                          padding: '1rem', 
                          backgroundColor: selectedZohoItem?.item_id === item.item_id ? 'rgba(26,115,232,0.05)' : 'var(--background)', 
                          borderRadius: '8px', 
                          border: `1px solid ${selectedZohoItem?.item_id === item.item_id ? 'var(--primary)' : 'var(--border)'}`, 
                          display: 'flex', 
                          gap: '1rem', 
                          alignItems: 'flex-start',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>{item.name}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            <strong>SKU:</strong> {item.sku} | <strong>Rate:</strong> ${item.rate}
                          </div>
                        </div>
                        {selectedZohoItem?.item_id === item.item_id && (
                          <CheckCircle size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
                        )}
                      </div>
                    ))}
                    
                    <div 
                      onClick={() => setSelectedZohoItem(null)}
                      style={{ 
                        padding: '0.8rem', 
                        backgroundColor: selectedZohoItem === null ? 'rgba(26,115,232,0.05)' : 'transparent', 
                        borderRadius: '8px', 
                        border: `1px solid ${selectedZohoItem === null ? 'var(--primary)' : 'transparent'}`, 
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        marginTop: '0.5rem',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        color: selectedZohoItem === null ? 'var(--primary)' : 'var(--text-muted)'
                      }}
                    >
                      None of these match (Create New)
                    </div>
                  </div>
                </div>
              )}

              {zohoCheckStatus === 'not_found' && (
                <div style={{ padding: '1rem', backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <AlertCircle size={16} /> No matching items found in Zoho. Proceed to create a new item.
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <form id="create-product-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <TextField label="Item Name *" name="name" value={form.name} onChange={handleChange} required icon={Box} />
                <TextField label="SKU *" name="sku" value={form.sku} onChange={handleChange} required icon={Hash} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Select
                  label="Category"
                  name="category" 
                  value={form.category} 
                  onChange={handleChange}
                  options={CATEGORIES.map(c => ({ value: c, label: c }))}
                />
                <TextField label="Dosage" name="dosage" value={form.dosage} onChange={handleChange} icon={Tag} />
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '4px 0' }} />

              {/* Prices */}
              <div className="form-grid">
                <TextField
                  label="Retail Price ($/unit)"
                  type="number" step="0.01" name="guestVialPrice" value={form.guestVialPrice} onChange={handleChange} icon={DollarSign}
                />
                <TextField
                  label="Pro Price ($/unit)"
                  type="number" step="0.01" name="proVialPrice" value={form.proVialPrice} onChange={handleChange} icon={DollarSign}
                />
              </div>

              {/* Stock & Supplier */}
              <div className="form-grid">
                <TextField
                  label="Initial Stock (units)"
                  type="number" name="stock" value={form.stock} onChange={handleChange} icon={Hash}
                />
                <TextField
                  label="Supplier"
                  name="supplier" value={form.supplier} onChange={handleChange} icon={Box}
                />
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--color-border, #e2e8f0)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            backgroundColor: 'var(--color-bg-app, #f8fafc)',
          }}
        >
          <button type="button" onClick={onClose}
            style={{ padding: '8px 20px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: 'white', cursor: 'pointer', fontWeight: 600, color: '#334155' }}>
            Cancel
          </button>
          
          {step === 1 ? (
            <button className="gcp-btn-primary" onClick={handleNext} disabled={zohoCheckStatus === 'loading' || (!form.sku && !form.name)}>
              Next Step
            </button>
          ) : (
            <button type="submit" form="create-product-form" disabled={isSubmitting}
              style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', backgroundColor: 'var(--color-primary, #1a73e8)', color: 'white', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
              {isSubmitting ? 'Creating...' : (selectedZohoItem ? 'Link & Create' : 'Create in Zoho & App')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}