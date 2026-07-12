import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, Trash2, X, Plus } from '@/lib/icons';
import { TextField, Select } from '../../../ui';
import SmartProductPicker from '../../../shared/SmartProductPicker';

export default function PhaseEditor({ phases, products: catalogProducts, onChange }) {
  const router = useRouter();
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
            <div className="phase-card-header">
              <GripVertical size={15} color="var(--text-muted)" style={{ cursor: 'grab' }} />
              <TextField
                value={phase.label ?? ''}
                placeholder="Phase label"
                aria-label="Edit phase label"
                onChange={(e) => updatePhase(pi, { label: e.target.value })}
                style={{ fontWeight: 500, flex: 1 }}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Duration:
              </span>
              <TextField
                type="number"
                min="1"
                value={phase.durationWeeks ?? 4}
                style={{ width: '65px', textAlign: 'center' }}
                aria-label="Edit phase duration in weeks"
                onChange={(e) => updatePhase(pi, { durationWeeks: parseInt(e.target.value) || 1 })}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                wks
              </span>
              <button
                onClick={() => removePhase(pi)}
                aria-label="Remove phase"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--error)',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'transform 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <Trash2 size={15} />
              </button>
            </div>

            {/* Items list */}
            <div style={{ padding: '0.5rem 0' }}>
              {(phase.items ?? []).length === 0 && (
                <p
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    textAlign: 'center',
                    padding: '1rem 0',
                  }}
                >
                  No products in this phase yet.
                </p>
              )}
              <AnimatePresence initial={false}>
                {(phase.items ?? []).map((item, ii) => (
                  <motion.div
                    key={ii}
                    className="phase-product-row"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/admin/products?sku=${encodeURIComponent(item.productId)}`);
                      }}
                      style={{
                        fontWeight: 600,
                        fontSize: '0.82rem',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        textAlign: 'left',
                        wordBreak: 'break-word',
                        transition: 'color 0.2s',
                        textDecoration: 'none',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                      onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                      title="Ver Ficha Clínica (Materia Medica)"
                    >
                      {item.productName ?? item.productId}
                    </button>

                    <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                      <TextField
                        type="number"
                        min="0"
                        step="0.1"
                        value={item.dosage ?? 0}
                        aria-label="Edit dosage"
                        onChange={(e) =>
                          updateItem(pi, ii, { dosage: parseFloat(e.target.value) || 0 })
                        }
                        style={{ width: '75px', textAlign: 'center' }}
                        placeholder="0"
                      />
                      <Select
                        value={item.doseUnit ?? 'mg'}
                        onChange={(e) => updateItem(pi, ii, { doseUnit: e.target.value })}
                        options={['mg', 'mcg', 'IU', 'ml']}
                        style={{ width: '85px' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                      <Select
                        value={item.frequency ?? 'Weekly'}
                        aria-label="Select dosage frequency"
                        onChange={(e) => updateItem(pi, ii, { frequency: e.target.value })}
                        options={['Daily', 'Weekly', 'Bi-Weekly', 'Monthly', 'Custom']}
                        style={{ width: '120px' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                      <TextField
                        type="number"
                        min="1"
                        value={item.vialsNeeded ?? 1}
                        aria-label="Edit vials needed quantity"
                        onChange={(e) =>
                          updateItem(pi, ii, { vialsNeeded: parseInt(e.target.value) || 1 })
                        }
                        style={{ width: '60px', textAlign: 'center' }}
                      />
                      <span
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-secondary)',
                          fontWeight: 500,
                        }}
                      >
                        vials
                      </span>
                    </div>

                    <button
                      onClick={() => removeItem(pi, ii)}
                      aria-label="Remove product"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        padding: '0.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--error)';
                        e.currentTarget.style.transform = 'scale(1.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--text-muted)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Add product */}
              <div style={{ padding: '0.75rem 1rem 0.5rem', position: 'relative' }}>
                <SmartProductPicker
                  placeholder="Type SKU or product name to add..."
                  onSelect={(product) => addItem(pi, product)}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <button
        onClick={addPhase}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.65rem 1rem',
          border: '1px dashed var(--primary)',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--accent-soft)',
          color: 'var(--primary)',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: '0.83rem',
          width: '100%',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-medium)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--accent-soft)')}
      >
        <Plus size={15} /> Add Phase
      </button>
    </div>
  );
}
