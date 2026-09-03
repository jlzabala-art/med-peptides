'use client';

import React, { useState, useCallback } from 'react';
import {
  collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../../../firebase';
import { usePresentations } from '../../../hooks/admin/usePresentations';
import { Package, Plus, Pencil, Trash2, Check, X, Grip } from 'lucide-react';
import notifier from '../../../services/NotificationService';

/**
 * PresentationsManager
 * ─────────────────────────────────────────────────────────────────────────────
 * CRUD panel for the `presentations` Firestore collection.
 * Embedded inside AdminSettingsTabClient.
 */
export default function PresentationsManager() {
  const { presentations, loading, error } = usePresentations();
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [newName, setNewName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAdd = useCallback(async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    // Prevent duplicates (case-insensitive)
    if (presentations.some(p => (p.name || '').toLowerCase() === trimmed.toLowerCase())) {
      notifier.warn(`"${trimmed}" ya existe.`);
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, 'presentations'), {
        name: trimmed,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setNewName('');
      setIsAdding(false);
      notifier.success(`Presentación "${trimmed}" añadida.`);
    } catch (e) {
      notifier.error('Error al añadir presentación.');
      console.error(e);
    } finally {
      setSaving(false);
    }
  }, [newName, presentations]);

  const handleUpdate = useCallback(async (id) => {
    const trimmed = editingValue.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'presentations', id), {
        name: trimmed,
        updatedAt: serverTimestamp(),
      });
      setEditingId(null);
      notifier.success(`Presentación actualizada.`);
    } catch (e) {
      notifier.error('Error al actualizar.');
      console.error(e);
    } finally {
      setSaving(false);
    }
  }, [editingValue]);

  const handleDelete = useCallback((id, name) => {
    notifier.confirmCritical(
      `¿Eliminar la presentación "${name}"? Esta acción no se puede deshacer.`,
      async () => {
        try {
          await deleteDoc(doc(db, 'presentations', id));
          notifier.success(`"${name}" eliminada.`);
        } catch (e) {
          notifier.error('Error al eliminar.');
          console.error(e);
        }
      }
    );
  }, []);

  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      backgroundColor: 'var(--color-bg-surface)',
      padding: '1.5rem',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '2px solid var(--primary-light)', paddingBottom: '0.75rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', margin: 0 }}>
          <Package size={24} color="var(--primary)" />
          Presentaciones de Producto
        </h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px', fontSize: '0.85rem', fontWeight: 600,
              background: 'var(--primary)', color: '#fff',
              border: 'none', borderRadius: '8px', cursor: 'pointer',
            }}
          >
            <Plus size={15} /> Nueva presentación
          </button>
        )}
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
        Lista maestra de formatos/presentaciones disponibles para asignar a variantes de producto en el catálogo.
        Todas las entradas son únicas y no pueden duplicarse.
      </p>

      {/* Add new row */}
      {isAdding && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 12px', marginBottom: '0.75rem',
          background: 'var(--color-bg-subtle, #f8fafc)',
          borderRadius: '8px', border: '1px dashed var(--primary)',
        }}>
          <input
            type="text"
            autoFocus
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') { setIsAdding(false); setNewName(''); } }}
            placeholder="Presentation name (e.g. Vial, Capsule...)"
            style={{
              flex: 1, padding: '6px 10px',
              border: '1px solid var(--border)', borderRadius: '6px',
              fontSize: '0.9rem', background: '#fff', outline: 'none',
            }}
          />
          <button
            onClick={handleAdd}
            disabled={saving || !newName.trim()}
            style={{
              padding: '6px 12px', background: 'var(--color-success, #16a34a)', color: '#fff',
              border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '0.85rem', fontWeight: 600, opacity: (!newName.trim() || saving) ? 0.5 : 1
            }}
          >
            <Check size={14} /> Guardar
          </button>
          <button
            onClick={() => { setIsAdding(false); setNewName(''); }}
            style={{
              padding: '6px 12px', background: 'transparent', color: 'var(--text-muted)',
              border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem',
            }}
          >
            <X size={14} /> Cancelar
          </button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Cargando presentaciones...
        </div>
      ) : presentations.length === 0 ? (
        <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--color-bg-subtle, #f8fafc)', borderRadius: '8px' }}>
          <Package size={32} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
          <p style={{ margin: 0, fontSize: '0.9rem' }}>No hay presentaciones. Añade la primera.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {presentations.map(p => (
            <div
              key={p.id}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 12px',
                borderRadius: '8px',
                border: editingId === p.id ? '1px solid var(--primary)' : '1px solid transparent',
                background: editingId === p.id ? 'var(--color-bg-subtle, #f8fafc)' : 'transparent',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (editingId !== p.id) e.currentTarget.style.background = 'var(--color-bg-subtle, #f8fafc)'; }}
              onMouseLeave={e => { if (editingId !== p.id) e.currentTarget.style.background = 'transparent'; }}
            >
              <Grip size={14} style={{ color: 'var(--text-muted)', opacity: 0.5, flexShrink: 0, cursor: 'grab' }} />

              {editingId === p.id ? (
                <>
                  <input
                    type="text"
                    autoFocus
                    value={editingValue}
                    onChange={e => setEditingValue(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleUpdate(p.id); if (e.key === 'Escape') setEditingId(null); }}
                    style={{
                      flex: 1, padding: '4px 8px',
                      border: '1px solid var(--border)', borderRadius: '6px',
                      fontSize: '0.9rem', background: '#fff', outline: 'none',
                    }}
                  />
                  <button onClick={() => handleUpdate(p.id)} disabled={saving} title="Guardar"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-success, #16a34a)', display: 'flex', padding: '4px' }}>
                    <Check size={16} strokeWidth={2.5} />
                  </button>
                  <button onClick={() => setEditingId(null)} title="Cancelar"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger, #dc2626)', display: 'flex', padding: '4px' }}>
                    <X size={16} strokeWidth={2.5} />
                  </button>
                </>
              ) : (
                <>
                  <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-main)' }}>
                    {p.name}
                  </span>
                  <button
                    onClick={() => { setEditingId(p.id); setEditingValue(p.name || ''); }}
                    title="Editar"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '4px', opacity: 0.6 }}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    title="Eliminar"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger, #dc2626)', display: 'flex', padding: '4px', opacity: 0.6 }}
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
