import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Save from 'lucide-react/dist/esm/icons/save';
import PackageOpen from 'lucide-react/dist/esm/icons/package-open';
import { doc, updateDoc, collection, getDocs, query } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useToast } from '../../../hooks/useToast';
import RightWorkspacePanel from '../catalog/RightWorkspacePanel';
import { Button } from '../../ui';

export default function VariantDetailsModal({ isOpen, onClose, product, variant, onSave }) {
  const { toast } = useToast();
  const [form, setForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (variant) {
      const prodName = product?.name || product?.displayName || 'UNK';
      const safeName = prodName
        .replace(/[^a-zA-Z0-9]/g, '')
        .substring(0, 5)
        .toUpperCase();
      const format = (variant.format || '').substring(0, 3).toUpperCase();
      const size = (variant.size || variant.dosage || '')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase();
      const generatedSku = ['SKU', safeName, format, size].filter(Boolean).join('-');

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        sku: variant.sku || generatedSku,
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
  }, [variant, product]);

  if (!isOpen || !variant || !product) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const variantsRef = collection(db, 'products', product.id, 'variants');
      const q = query(variantsRef);
      const snapshot = await getDocs(q);

      let variantDocId = variant.id;
      if (!snapshot.docs.some((d) => d.id === variant.id)) {
        const found = snapshot.docs.find((d) => d.data().sku === variant.sku);
        if (found) variantDocId = found.id;
      }

      if (variantDocId && !variantDocId.includes('-root')) {
        const vRef = doc(db, 'products', product.id, 'variants', variantDocId);
        await updateDoc(vRef, {
          ...form,
          updatedAt: new Date().toISOString(),
        });
      } else {
        const pRef = doc(db, 'products', product.id);
        await updateDoc(pRef, {
          ...form,
          updatedAt: new Date().toISOString(),
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

  const modalContent = (
    <RightWorkspacePanel
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Variant"
      icon={<PackageOpen size={20} color="#6366f1" />}
      badge={form.sku || 'N/A'}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', gap: '12px' }}>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving} icon={<Save size={16} />}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      }
    >
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>SKU</label>
            <input
              type="text"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
              Supplier
            </label>
            <select
              value={form.supplier}
              onChange={(e) => setForm({ ...form, supplier: e.target.value })}
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                backgroundColor: '#fff',
                outline: 'none',
              }}
            >
              <option value="">Select a supplier...</option>
              <option value="REGENPEPT-LABS">REGENPEPT-LABS</option>
              <option value="Global Peptide Synthesis Ltd.">Global Peptide Synthesis Ltd.</option>
              <option value="Apex Biochemicals Corp">Apex Biochemicals Corp</option>
              <option value="Unassigned">Unassigned</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Format</label>
            <input
              type="text"
              value={form.format}
              onChange={(e) => setForm({ ...form, format: e.target.value })}
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Size</label>
            <input
              type="text"
              value={form.size}
              onChange={(e) => setForm({ ...form, size: e.target.value })}
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Dosage</label>
            <input
              type="text"
              value={form.dosage}
              onChange={(e) => setForm({ ...form, dosage: e.target.value })}
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>
        </div>

        <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '4px 0' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
              Cost Price ($)
            </label>
            <input
              type="number"
              value={form.cost}
              onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
              MSRP ($)
            </label>
            <input
              type="number"
              value={form.msrp}
              onChange={(e) => setForm({ ...form, msrp: Number(e.target.value) })}
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Stock</label>
            <input
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
              Reorder Point
            </label>
            <input
              type="number"
              value={form.reorderPoint}
              onChange={(e) => setForm({ ...form, reorderPoint: Number(e.target.value) })}
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>MOQ</label>
            <input
              type="number"
              value={form.moq}
              onChange={(e) => setForm({ ...form, moq: Number(e.target.value) })}
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>
        </div>
      </div>
    </RightWorkspacePanel>
  );

  return isOpen ? createPortal(modalContent, document.body) : null;
}
