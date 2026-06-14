import X from "lucide-react/dist/esm/icons/x";
import Box from "lucide-react/dist/esm/icons/box";
import Tag from "lucide-react/dist/esm/icons/tag";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import Hash from "lucide-react/dist/esm/icons/hash";
import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';





import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = [
  'Peptides',
  'API Peptides',
  'API Supplements',
  'Healing & Recovery',
  'Performance',
  'Cognitive',
  'Other',
];

export default function CreateProductModal({ isOpen, onClose, onCreated }) {
  const { user } = useAuth();
  const { toast } = useToast();

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

  React.useEffect(() => {
    if (isOpen) {
      setForm({
        name: '',
        sku: '',
        category: 'Peptides',
        dosage: '',
        guestVialPrice: '',
        proVialPrice: '',
        stock: '',
        supplier: '',
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.sku) {
      toast.warning('Item Name and SKU are required.');
      return;
    }
    setIsSubmitting(true);
    try {
      const newProduct = {
        name: form.name.trim(),
        sku: form.sku.trim().toUpperCase(),
        category: form.category,
        dosage: form.dosage,
        guestVialPrice: parseFloat(form.guestVialPrice) || 0,
        guestKitPrice: 0,
        proVialPrice: parseFloat(form.proVialPrice) || 0,
        proKitPrice: 0,
        stock: parseInt(form.stock) || 0,
        supplier: form.supplier || '',
        isActive: true,
        isGroup: false,
        createdAt: new Date().toISOString(),
        createdBy: user?.uid || 'admin',
        updatedAt: new Date().toISOString(),
      };
      await addDoc(collection(db, 'products'), newProduct);
      toast.success(`Item "${form.name}" created successfully.`);
      if (onCreated) onCreated();
      onClose();
    } catch (err) {
      console.error('Error creating item:', err);
      toast.error('Failed to create item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px 10px 36px',
    border: '1px solid var(--color-border, #e2e8f0)',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: 'white',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    marginBottom: '8px',
    color: 'var(--color-text-primary, #0f172a)',
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
          maxWidth: '460px',
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
            Add New Item
          </h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <X size={20} color="#64748b" />
          </button>
        </div>

        {/* Form */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <form id="create-product-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

            {/* Name */}
            <div>
              <label style={labelStyle}>Item Name *</label>
              <div style={{ position: 'relative' }}>
                <Box size={16} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
                <input name="name" value={form.name} onChange={handleChange} required style={inputStyle} placeholder="e.g. BPC-157" />
              </div>
            </div>

            {/* SKU */}
            <div>
              <label style={labelStyle}>SKU *</label>
              <div style={{ position: 'relative' }}>
                <Hash size={16} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
                <input name="sku" value={form.sku} onChange={handleChange} required style={inputStyle} placeholder="e.g. BPC157-5MG" />
              </div>
            </div>

            {/* Category */}
            <div>
              <label style={labelStyle}>Category</label>
              <select name="category" value={form.category} onChange={handleChange}
                style={{ ...inputStyle, padding: '10px 12px', paddingLeft: '12px' }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Dosage */}
            <div>
              <label style={labelStyle}>Dosage / Presentation</label>
              <div style={{ position: 'relative' }}>
                <Tag size={16} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
                <input name="dosage" value={form.dosage} onChange={handleChange} style={inputStyle} placeholder="e.g. 5mg/vial" />
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '4px 0' }} />

            {/* Prices */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Retail Price ($/unit)</label>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={16} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
                  <input type="number" step="0.01" name="guestVialPrice" value={form.guestVialPrice} onChange={handleChange}
                    style={inputStyle} placeholder="0.00" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Pro Price ($/unit)</label>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={16} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
                  <input type="number" step="0.01" name="proVialPrice" value={form.proVialPrice} onChange={handleChange}
                    style={inputStyle} placeholder="0.00" />
                </div>
              </div>
            </div>

            {/* Stock & Supplier */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Initial Stock (units)</label>
                <div style={{ position: 'relative' }}>
                  <Hash size={16} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
                  <input type="number" name="stock" value={form.stock} onChange={handleChange}
                    style={inputStyle} placeholder="0" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Supplier</label>
                <div style={{ position: 'relative' }}>
                  <Box size={16} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
                  <input name="supplier" value={form.supplier} onChange={handleChange}
                    style={inputStyle} placeholder="e.g. Regpept" />
                </div>
              </div>
            </div>

          </form>
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
          <button type="submit" form="create-product-form" disabled={isSubmitting}
            style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', backgroundColor: 'var(--color-primary, #1a73e8)', color: 'white', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
            {isSubmitting ? 'Creating...' : 'Add Item'}
          </button>
        </div>
      </div>
    </div>
  );
}