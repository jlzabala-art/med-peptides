'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus } from '@/lib/icons';
import { TextField } from '../../../components/ui';

export default function SupplementsEditor({ supplements, onChange }) {
  const addSupplement = () =>
    onChange([...supplements, { name: '', dosage: '', rationale: '', timing: '' }]);

  const updateSupplement = (i, patch) =>
    onChange(supplements.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  const removeSupplement = (i) => onChange(supplements.filter((_, idx) => idx !== i));

  if (!supplements) return null;

  return (
    <div className="phase-editor-root" style={{ marginTop: '2rem' }}>
      <h4 style={{ margin: '0 0 1rem', fontSize: '1rem', color: 'var(--primary)' }}>
        Recommended Supplements
      </h4>
      <AnimatePresence initial={false}>
        {supplements.map((sup, i) => (
          <motion.div
            key={i}
            className="phase-card"
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: '1.25rem' }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden', padding: '1rem', background: 'var(--surface)' }}
          >
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
              <div style={{ flex: 2 }}>
                <label
                  style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}
                >
                  Name
                </label>
                <TextField
                  value={sup.name ?? ''}
                  onChange={(e) => updateSupplement(i, { name: e.target.value })}
                  style={{ width: '100%', marginTop: '0.25rem' }}
                  placeholder="e.g. NMN (Nicotinamide Mononucleotide)"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label
                  style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}
                >
                  Dosage
                </label>
                <TextField
                  value={sup.dosage ?? ''}
                  onChange={(e) => updateSupplement(i, { dosage: e.target.value })}
                  style={{ width: '100%', marginTop: '0.25rem' }}
                  placeholder="e.g. 500mg daily"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label
                  style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}
                >
                  Timing
                </label>
                <TextField
                  value={sup.timing ?? ''}
                  onChange={(e) => updateSupplement(i, { timing: e.target.value })}
                  style={{ width: '100%', marginTop: '0.25rem' }}
                  placeholder="e.g. Morning with breakfast"
                />
              </div>
              <button
                onClick={() => removeSupplement(i)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--error)',
                  padding: '0.25rem',
                  marginTop: '1.5rem',
                  height: 'fit-content',
                }}
              >
                <Trash2 size={18} />
              </button>
            </div>
            <div>
              <label
                style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}
              >
                Rationale
              </label>
              <textarea
                value={sup.rationale ?? ''}
                onChange={(e) => updateSupplement(i, { rationale: e.target.value })}
                style={{
                  width: '100%',
                  marginTop: '0.25rem',
                  resize: 'vertical',
                  minHeight: '60px',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: '1px solid var(--color-border, #cbd5e1)',
                  backgroundColor: 'var(--color-bg-elevated, #fff)',
                  color: 'var(--color-text-primary, #1e293b)',
                  fontSize: '0.875rem'
                }}
                placeholder="Rationale for this supplement..."
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <button
        onClick={addSupplement}
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
      >
        <Plus size={15} /> Add Supplement
      </button>
    </div>
  );
}
