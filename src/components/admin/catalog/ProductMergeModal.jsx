import React, { useState, useMemo } from 'react';
import UniversalFormDrawer from '../../shared/UniversalFormDrawer';
import { db } from '../../../firebase';
import { doc, writeBatch } from 'firebase/firestore';
import notifier from '../../../services/NotificationService';
import { Info } from 'lucide-react';

export default function ProductMergeModal({ isOpen, onClose, selectedProducts = [], onRefresh }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract a flat list of all unique real product ID and names so the user can pick the primary one
  const variants = useMemo(() => {
    const list = [];
    selectedProducts.forEach(group => {
      if (group.variants && group.variants.length > 0) {
        group.variants.forEach(v => {
          list.push({ id: v.id, name: v.name || group.canonicalName || 'Unnamed' });
        });
      } else {
        list.push({ id: group.id, name: group.canonicalName || group.name || 'Unnamed' });
      }
    });
    return list;
  }, [selectedProducts]);

  const handleSubmit = async (formData) => {
    if (!formData.primaryVariantId) {
      notifier.error('You must select a primary master variant.');
      return;
    }

    const primaryVariant = variants.find(v => v.id === formData.primaryVariantId);
    if (!primaryVariant) return;

    const primaryName = formData.customName || primaryVariant.name;

    setIsSubmitting(true);
    try {
      const batch = writeBatch(db);
      
      variants.forEach(v => {
        const productRef = doc(db, 'products', v.id);
        const isPrimary = v.id === formData.primaryVariantId;
        
        batch.update(productRef, {
          canonicalName: primaryName,
          isPrimaryVariant: isPrimary,
          isLocked: isPrimary ? !!formData.lockPrimary : false,
          updatedAt: new Date().toISOString()
        });
      });

      await batch.commit();
      notifier.success(`Successfully merged ${variants.length} variants into "${primaryName}".`);
      onRefresh?.();
      onClose();
    } catch (error) {
      console.error('Error merging products:', error);
      notifier.error('Failed to merge products.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const customHeader = (
    <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#1d4ed8' }}>
        <Info size={18} />
        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Merge Products (Group)</span>
      </div>
      <p style={{ fontSize: '0.8rem', color: '#1e3a8a', margin: 0 }}>
        You are merging <strong>{selectedProducts?.length || 0} product groups</strong> (total {variants.length} variants).
        They will be collapsed into a single catalog item. You must select which variant will be the <strong>Master/Primary</strong>.
      </p>
    </div>
  );

  return (
    <UniversalFormDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Merge Products"
      submitLabel={isSubmitting ? "Merging..." : "Confirm Merge"}
      onSubmit={handleSubmit}
      customHeader={customHeader}
      schema={[
        {
          name: 'primaryVariantId',
          label: 'Select Master Product',
          type: 'select',
          options: [
            { label: '-- Select Master Product --', value: '' },
            ...variants.map(v => ({ label: v.name, value: v.id }))
          ],
          required: true
        },
        {
          name: 'customName',
          label: 'Override Group Name (Optional)',
          type: 'text',
          placeholder: 'Leave blank to use the master product name'
        },
        {
          name: 'lockPrimary',
          label: '',
          type: 'custom',
          render: ({ value, onChange }) => (
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer', color: 'var(--text-main)', marginTop: '0.5rem' }}>
              <input 
                type="checkbox" 
                checked={value}
                onChange={(e) => onChange(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
              />
              Lock Master Product (Prevent manual edits to master data)
            </label>
          )
        }
      ]}
      initialData={{ primaryVariantId: '', customName: '', lockPrimary: true }}
    />
  );
}
