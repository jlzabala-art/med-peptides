import React, { useState, useEffect } from 'react';
import X from 'lucide-react/dist/esm/icons/x';
import Save from 'lucide-react/dist/esm/icons/save';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { doc, updateDoc, collection, getDocs, query } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useToast } from '../../../hooks/useToast';

export default function VariantDetailsModal({ isOpen, onClose, product, variant, onSave }) {
  const { toast } = useToast();
  const [form, setForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (variant) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        sku: variant.sku || '',
        supplier: variant.supplier || '',
        cost: variant.cost || 0,
        msrp: variant.msrp || 0,
        stock: variant.stock || 0,
        reorderPoint: variant.reorderPoint || 20,
        moq: variant.moq || 50,
        format: variant.format || '',
        size: variant.size || '',
        dosage: variant.dosage || '',
      });
    }
  }, [variant]);

  if (!isOpen || !variant || !product) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Find the specific variant inside the subcollection
      const variantsRef = collection(db, 'products', product.id, 'variants');
      const q = query(variantsRef);
      const snapshot = await getDocs(q);
      
      let variantDocId = variant.id;
      // If variant.id doesn't match directly, try to find it
      if (!snapshot.docs.some(d => d.id === variant.id)) {
        const found = snapshot.docs.find(d => d.data().sku === variant.sku);
        if (found) variantDocId = found.id;
      }

      if (variantDocId && !variantDocId.includes('-root')) {
        const vRef = doc(db, 'products', product.id, 'variants', variantDocId);
        await updateDoc(vRef, {
          ...form,
          updatedAt: new Date().toISOString()
        });
      } else {
        // Fallback: update main product if this is a flat/root variant mapped as variant
        const pRef = doc(db, 'products', product.id);
        await updateDoc(pRef, {
          ...form,
          updatedAt: new Date().toISOString()
        });
      }

      toast.success('Variant details saved successfully!');
      onSave?.();
      onClose();
    } catch (error) {
      console.error('Error saving variant:', error);
      toast.error('Failed to save variant details');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(3px)',
              zIndex: 99998,
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            style={{
              position: 'fixed',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%', maxWidth: '500px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              zIndex: 99999,
              overflow: 'hidden',
              display: 'flex', flexDirection: 'column'
            }}
          >
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              backgroundColor: '#f8fafc'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: 600 }}>
                Edit Variant: {form.sku || 'N/A'}
              </h3>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#475569' }}>SKU</label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={e => setForm({...form, sku: e.target.value})}
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#475569' }}>Supplier</label>
                  <input
                    type="text"
                    value={form.supplier}
                    onChange={e => setForm({...form, supplier: e.target.value})}
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#475569' }}>Format</label>
                  <input
                    type="text"
                    value={form.format}
                    onChange={e => setForm({...form, format: e.target.value})}
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#475569' }}>Size</label>
                  <input
                    type="text"
                    value={form.size}
                    onChange={e => setForm({...form, size: e.target.value})}
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#475569' }}>Dosage</label>
                  <input
                    type="text"
                    value={form.dosage}
                    onChange={e => setForm({...form, dosage: e.target.value})}
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '8px 0' }} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#475569' }}>Cost Price ($)</label>
                  <input
                    type="number"
                    value={form.cost}
                    onChange={e => setForm({...form, cost: Number(e.target.value)})}
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#475569' }}>MSRP ($)</label>
                  <input
                    type="number"
                    value={form.msrp}
                    onChange={e => setForm({...form, msrp: Number(e.target.value)})}
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#475569' }}>Stock</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={e => setForm({...form, stock: Number(e.target.value)})}
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#475569' }}>Reorder</label>
                  <input
                    type="number"
                    value={form.reorderPoint}
                    onChange={e => setForm({...form, reorderPoint: Number(e.target.value)})}
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#475569' }}>MOQ</label>
                  <input
                    type="number"
                    value={form.moq}
                    onChange={e => setForm({...form, moq: Number(e.target.value)})}
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>
            </div>
            
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              display: 'flex', justifyContent: 'flex-end', gap: '12px'
            }}>
              <button
                onClick={onClose}
                style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer', fontWeight: 500 }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#3b82f6', color: 'white',
                  cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px', opacity: isSaving ? 0.7 : 1
                }}
              >
                <Save size={16} /> {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
