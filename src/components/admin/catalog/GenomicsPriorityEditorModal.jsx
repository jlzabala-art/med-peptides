'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Check, X, Dna, AlertCircle } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import * as fb from '@/firebase';
import { invalidateGenomicsCache } from '@/services/genomicsCatalogLookup';
import { getProgramDisplayName } from '@/services/genomicsCatalogLookup';

export default function GenomicsPriorityEditorModal({ isOpen, onClose, product, programSlug, onSaved }) {
  const [mounted, setMounted] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState('A');
  const [selectedRoute, setSelectedRoute] = useState('Oral');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const programs = Array.isArray(product?.programs) ? product.programs : [];
  const currentAssoc = programs.find(p => p.slug === programSlug || p.id === programSlug);

  useEffect(() => {
    if (isOpen && product && programSlug) {
      setSelectedPriority(currentAssoc?.priority || 'A');
      setSelectedRoute(currentAssoc?.applicationRoute || currentAssoc?.route || 'Oral');
      setError(null);
    }
  }, [isOpen, product, programSlug, currentAssoc?.priority, currentAssoc?.applicationRoute, currentAssoc?.route]);

  if (!isOpen || !product || !programSlug || !mounted) return null;

  const db = fb?.db;
  const programTitle = getProgramDisplayName(programSlug);

  const handleSave = async () => {
    if (!db) {
      setError('Database connection not available.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      let updatedPrograms = [...programs];
      const existingIdx = updatedPrograms.findIndex(p => p.slug === programSlug || p.id === programSlug);

      if (selectedPriority === 'REMOVE') {
        // Remove association
        if (existingIdx >= 0) {
          updatedPrograms.splice(existingIdx, 1);
        }
      } else {
        // Update or insert
        const newAssoc = {
          slug: programSlug,
          id: programSlug,
          name: `Fagron Genomics | ${programTitle}`,
          priority: selectedPriority,
          applicationRoute: selectedRoute,
          route: selectedRoute,
          updatedAt: new Date().toISOString()
        };

        if (existingIdx >= 0) {
          updatedPrograms[existingIdx] = { ...updatedPrograms[existingIdx], ...newAssoc };
        } else {
          updatedPrograms.push(newAssoc);
        }
      }

      // Update program tags
      const currentTags = Array.isArray(product.tags) ? [...product.tags] : [];
      let updatedTags = currentTags.filter(t => t !== programSlug);
      if (selectedPriority !== 'REMOVE') {
        updatedTags.push(programSlug);
        if (!updatedTags.includes('Fagron Genomics')) {
          updatedTags.push('Fagron Genomics');
        }
      }

      const prodRef = doc(db, 'products', product.id);
      await updateDoc(prodRef, {
        programs: updatedPrograms,
        tags: updatedTags,
        updatedAt: new Date().toISOString()
      });

      invalidateGenomicsCache();
      onSaved?.(product.id, updatedPrograms);
      onClose();
    } catch (err) {
      console.error('Error updating genomic priority:', err);
      setError(err.message || 'Failed to update priority.');
    } finally {
      setIsSaving(false);
    }
  };

  const modalContent = (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.55)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999999,
      padding: '1rem'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        maxWidth: '440px',
        width: '100%',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{ padding: '1.25rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.25rem' }}>🧬</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                Genomic Priority & Routing
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {programTitle} — {product.name || product.id}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && (
            <div style={{ padding: '0.65rem 0.85rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {/* Priority selection */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
              Test Priority Level:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {[
                { id: 'A', label: 'Priority A', desc: 'First-line', color: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
                { id: 'B', label: 'Priority B', desc: 'Second-line', color: '#ca8a04', bg: '#fefce8', border: '#fde047' },
                { id: 'C', label: 'Priority C', desc: 'Supportive', color: '#0284c7', bg: '#f0f9ff', border: '#7dd3fc' },
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedPriority(opt.id)}
                  style={{
                    padding: '0.65rem 0.5rem',
                    borderRadius: '8px',
                    border: `2px solid ${selectedPriority === opt.id ? opt.color : opt.border}`,
                    background: selectedPriority === opt.id ? opt.bg : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    boxShadow: selectedPriority === opt.id ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: opt.color }}>{opt.label}</span>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Application Route */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
              Suggested Application Route:
            </label>
            <select
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                outline: 'none',
                background: '#ffffff'
              }}
            >
              <option value="Oral">Oral (Capsules / Powder / Softgel)</option>
              <option value="Topical Scalp">Topical Scalp (TrichoSol / TrichoFoam)</option>
              <option value="Topical Skin">Topical Skin / Dermatological</option>
              <option value="Transdermal">Transdermal (Pentravan)</option>
              <option value="Subcutaneous">Subcutaneous / Injectable</option>
            </select>
          </div>

          {/* Remove Option */}
          {currentAssoc && (
            <button
              type="button"
              onClick={() => setSelectedPriority('REMOVE')}
              style={{
                background: selectedPriority === 'REMOVE' ? '#fee2e2' : 'none',
                border: selectedPriority === 'REMOVE' ? '1px solid #ef4444' : 'none',
                padding: '0.4rem',
                borderRadius: '6px',
                color: '#dc2626',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              🗑️ {selectedPriority === 'REMOVE' ? '✓ Marked to Remove from Program' : `Remove from ${programTitle}`}
            </button>
          )}
        </div>

        {/* Modal Footer (Golden Rule #5 explicit confirm/cancel buttons) */}
        <div style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '0.5rem 0.9rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#475569',
              cursor: 'pointer'
            }}
          >
            <X size={14} /> Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '0.5rem 1.1rem',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--color-primary, #003666)',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#ffffff',
              cursor: isSaving ? 'wait' : 'pointer',
              boxShadow: '0 2px 8px rgba(0,54,102,0.2)'
            }}
          >
            <Check size={14} /> {isSaving ? 'Guardando...' : 'Guardar Prioridad'}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
