import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { db } from '../../../firebase';
import { doc, updateDoc, writeBatch } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function BulkUpdateModal({ isOpen, onClose, selectedIds, variants = [], onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    supplier: '',
    status: '',
    format: '',
    goals: ''
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    // Collect non-empty fields
    const updates = {};
    if (formData.supplier) updates.supplier = formData.supplier;
    if (formData.status) updates.status = formData.status;
    if (formData.format) updates.format = formData.format;
    
    // If they provided a comma-separated list of goals
    if (formData.goals) {
      updates.goals = formData.goals.split(',').map(g => g.trim()).filter(Boolean);
    }

    if (Object.keys(updates).length === 0) {
      toast.error('No changes specified');
      return;
    }

    setLoading(true);
    try {
      const batch = writeBatch(db);
      
      selectedIds.forEach(id => {
        // Try to find if it's a variant or product in our variants array
        const v = variants.find(val => val.id === id);
        if (v && v.productId) {
          // It's a variant
          const ref = doc(db, 'products', v.productId, 'variants', id);
          batch.update(ref, updates);
        } else {
          // Fallback to product
          const ref = doc(db, 'products', id);
          batch.update(ref, updates);
        }
      });

      await batch.commit();
      toast.success(`Successfully updated ${selectedIds.length} items`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Bulk update error:', err);
      toast.error('Failed to apply bulk updates');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '90%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Bulk Update {selectedIds.length} Items</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: '#f0f9ff', color: '#0369a1', borderRadius: '6px', fontSize: '0.9rem', display: 'flex', gap: '8px' }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ margin: 0 }}>Leave fields blank if you do not want to change them. Only filled fields will be updated across all selected items.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 500, color: '#334155' }}>Supplier</label>
            <input 
              type="text" 
              name="supplier" 
              value={formData.supplier} 
              onChange={handleChange}
              placeholder="e.g. LotusLand"
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 500, color: '#334155' }}>Status</label>
            <select 
              name="status" 
              value={formData.status} 
              onChange={handleChange}
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem', backgroundColor: '#fff' }}
            >
              <option value="">-- No Change --</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 500, color: '#334155' }}>Format / Presentation</label>
            <select 
              name="format" 
              value={formData.format} 
              onChange={handleChange}
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem', backgroundColor: '#fff' }}
            >
              <option value="">-- No Change --</option>
              <option value="vial">Vial</option>
              <option value="bottle">Bottle</option>
              <option value="spray">Nasal Spray</option>
              <option value="tablet">Tablet</option>
              <option value="capsule">Capsule</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 500, color: '#334155' }}>Goals (comma separated)</label>
            <input 
              type="text" 
              name="goals" 
              value={formData.goals} 
              onChange={handleChange}
              placeholder="e.g. weight_loss, recovery"
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button 
            onClick={onClose}
            disabled={loading}
            style={{ padding: '10px 16px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#334155', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={loading}
            style={{ padding: '10px 16px', border: 'none', backgroundColor: '#2563eb', color: '#fff', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {loading ? 'Saving...' : <><Save size={16} /> Apply Updates</>}
          </button>
        </div>
      </div>
    </div>
  );
}
