import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useOrderBuilder } from '../../../hooks/ui/useOrderBuilder';

import BuilderTargetSelector from './BuilderTargetSelector';
import BuilderCatalogSearch from './BuilderCatalogSearch';
import BuilderDraftCart from './BuilderDraftCart';

import Save from "lucide-react/dist/esm/icons/save";
import Send from "lucide-react/dist/esm/icons/send";

/**
 * UniversalOrderBuilder
 * 
 * Centralized component for generating:
 * - Patient Prescriptions (mode: 'prescription')
 * - Wholesaler B2B Orders (mode: 'wholesale')
 * - Admin B2B Orders (mode: 'admin')
 */
export default function UniversalOrderBuilder({ mode = 'prescription', onSaved, onCanceled }) {
  const { currentUser } = useAuth();
  
  const {
    selectedTarget,
    setSelectedTarget,
    draftItems,
    pricingTier,
    totals,
    addItem,
    updateItemQuantity,
    removeItem,
    clear
  } = useOrderBuilder({ initialTier: 'tier_0' });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (status) => {
    if (!selectedTarget) {
      alert("Por favor, selecciona un destinatario.");
      return;
    }
    if (draftItems.length === 0) {
      alert("Añade al menos un producto a la orden.");
      return;
    }

    setSaving(true);
    try {
      // In a real implementation, this would call a Cloud Function or writeBatch
      // to atomically create the bulk_order/prescription and link any imported sources.
      console.log('Submitting Order:', {
        mode,
        target: selectedTarget,
        items: draftItems,
        totals,
        status
      });

      // Simulate network request
      await new Promise(r => setTimeout(r, 1000));
      
      clear();
      if (onSaved) onSaved();
      
    } catch (err) {
      console.error('Error submitting order:', err);
      alert('Error al guardar la orden.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      
      {/* 1. Target Selector */}
      <BuilderTargetSelector 
        mode={mode} 
        selectedTarget={selectedTarget} 
        onSelectTarget={setSelectedTarget}
        currentUserId={currentUser?.uid}
      />

      {/* 2. Catalog Search & Import (Only if a target is selected) */}
      {selectedTarget && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1rem', margin: 0, color: 'var(--color-text-primary)' }}>
            Agregar Productos
          </h3>
          <BuilderCatalogSearch onAdd={addItem} />
        </div>
      )}

      {/* 3. Draft Cart & Totals */}
      {selectedTarget && (
        <BuilderDraftCart 
          items={draftItems} 
          totals={totals}
          pricingTier={pricingTier}
          onUpdateQuantity={updateItemQuantity}
          onRemove={removeItem}
        />
      )}

      {/* 4. Action Buttons */}
      {selectedTarget && draftItems.length > 0 && (
        <div className="sticky-bottom-actions">
          {onCanceled && (
            <button 
              onClick={onCanceled}
              style={{ background: 'none', border: '1px solid var(--border)', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: 'var(--color-text-secondary)' }}
            >
              Cancelar
            </button>
          )}
          <button 
            onClick={() => handleSubmit('draft')}
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: 'var(--color-text-primary)' }}
          >
            <Save size={16} /> Guardar Borrador
          </button>
          <button 
            onClick={() => handleSubmit('sent')}
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-primary)', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: 'white' }}
          >
            <Send size={16} /> Procesar {mode === 'prescription' ? 'Receta' : 'Orden'}
          </button>
        </div>
      )}
    </div>
  );
}
