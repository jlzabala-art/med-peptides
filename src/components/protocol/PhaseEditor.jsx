import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, Trash2, Plus } from 'lucide-react';

const PhaseEditor = React.memo(({ phases, products: catalogProducts, onChange }) => {
  const navigate = useNavigate();
  const [productSearch, setProductSearch] = useState('');

  const updatePhase = (pi, patch) =>
    onChange(phases.map((p, i) => (i === pi ? { ...p, ...patch } : p)));

  const addPhase = () =>
    onChange([...phases, { label: `Phase ${phases.length + 1}`, durationWeeks: 4, items: [] }]);

  const removePhase = (pi) => onChange(phases.filter((_, i) => i !== pi));

  const addItem = (pi, product) => {
    const newItem = {
      productId: product.id,
      productName: product.displayName ?? product.name,
      dosage: product.defaultDosage ?? 0,
      frequency: 'Weekly',
      vialsNeeded: 1,
    };
    updatePhase(pi, { items: [...(phases[pi].items ?? []), newItem] });
    setProductSearch('');
  };

  const updateItem = (pi, ii, patch) =>
    updatePhase(pi, {
      items: phases[pi].items.map((it, i) => (i === ii ? { ...it, ...patch } : it)),
    });

  const removeItem = (pi, ii) =>
    updatePhase(pi, { items: phases[pi].items.filter((_, i) => i !== ii) });

  const filteredProducts = (catalogProducts ?? [])
    .filter(
      (p) =>
        p &&
        (!productSearch ||
          (p.displayName ?? p.name ?? '').toLowerCase().includes(productSearch.toLowerCase()))
    )
    .slice(0, 8);

  return (
    <div className="phase-editor-root">
      <AnimatePresence initial={false}>
        {phases.map((phase, pi) => (
          <motion.div
            key={pi}
            className="phase-card"
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: '1.25rem' }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            {/* Phase header */}
            <div className="phase-card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <GripVertical size={15} color="var(--text-muted)" style={{ cursor: 'grab' }} />
              <input
                value={phase.label ?? ''}
                placeholder="Phase label"
                aria-label="Edit phase label"
                onChange={(e) => updatePhase(pi, { label: e.target.value })}
                className="admin-premium-input"
                style={{ fontWeight: 500, flex: 1, border: 'none', background: 'transparent' }}
              />
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Duration:</span>
              <input
                type="number"
                min="1"
                value={phase.durationWeeks ?? 4}
                className="admin-premium-input"
                style={{ width: '65px', textAlign: 'center' }}
                aria-label="Edit phase duration in weeks"
                onChange={(e) => updatePhase(pi, { durationWeeks: parseInt(e.target.value) || 1 })}
              />
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>wks</span>
              <button
                onClick={() => removePhase(pi)}
                aria-label="Remove phase"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.25rem', display: 'flex', alignItems: 'center' }}
              >
                <Trash2 size={15} />
              </button>
            </div>

            {/* Items list */}
            <div style={{ padding: '0.5rem 0', marginLeft: '1.5rem', borderLeft: '2px solid #e2e8f0', paddingLeft: '1rem' }}>
              {(phase.items ?? []).length === 0 && (
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', padding: '0.5rem 0' }}>No products in this phase yet.</p>
              )}
              <AnimatePresence initial={false}>
                {(phase.items ?? []).map((item, ii) => (
                  <motion.div
                    key={ii}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/admin/products?sku=${encodeURIComponent(item.productId)}`); }}
                      style={{ fontWeight: 600, fontSize: '0.85rem', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', minWidth: '150px' }}
                    >
                      {item.productName ?? item.productId}
                    </button>
                    <input type="number" min="0" step="0.1" value={item.dosage ?? 0} onChange={(e) => updateItem(pi, ii, { dosage: parseFloat(e.target.value) || 0 })} className="admin-premium-input" style={{ width: '75px', textAlign: 'center' }} placeholder="0" />
                    <select value={item.doseUnit ?? 'mg'} onChange={(e) => updateItem(pi, ii, { doseUnit: e.target.value })} className="admin-premium-select" style={{ width: '70px', padding: '0.3rem' }}>
                      <option value="mg">mg</option>
                      <option value="mcg">mcg</option>
                      <option value="IU">IU</option>
                      <option value="ml">ml</option>
                    </select>
                    <select value={item.frequency ?? 'Weekly'} onChange={(e) => updateItem(pi, ii, { frequency: e.target.value })} className="admin-premium-select" style={{ width: '120px' }}>
                      {['Daily', 'Weekly', 'Bi-Weekly', 'Monthly', 'Custom'].map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <input type="number" min="1" value={item.vialsNeeded ?? 1} onChange={(e) => updateItem(pi, ii, { vialsNeeded: parseInt(e.target.value) || 1 })} className="admin-premium-input" style={{ width: '60px', textAlign: 'center' }} />
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>vials</span>
                    <button onClick={() => removeItem(pi, ii)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={15} /></button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Add product to phase */}
              <div style={{ marginTop: '0.75rem', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Plus size={14} color="#64748b" />
                  <input
                    type="text"
                    placeholder="Search product to add..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="admin-premium-input"
                    style={{ flex: 1, fontSize: '0.85rem' }}
                  />
                </div>
                {productSearch && filteredProducts.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', zIndex: 10, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', marginTop: '4px', overflow: 'hidden' }}>
                    {filteredProducts.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => addItem(pi, p)}
                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem 1rem', background: 'none', border: 'none', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        {p.displayName ?? p.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <button
        onClick={addPhase}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#eff6ff', color: '#2563eb', border: '1px dashed #93c5fd', padding: '0.75rem 1rem', borderRadius: '8px', cursor: 'pointer', width: '100%', justifyContent: 'center', fontWeight: 500, transition: 'background 0.2s' }}
      >
        <Plus size={16} /> Add Another Phase
      </button>
    </div>
  );
});

export default PhaseEditor;
