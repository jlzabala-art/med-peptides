'use client';

import React, { useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';

export default function KeyboardShortcutsModal({ isOpen, onClose, isEs = false }) {
  useEffect(() => {
    if (!isOpen) return;
    const onEsc = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    { keys: '⌘K / Ctrl+K', descEs: 'Buscar receta, paciente o escanear código', descEn: 'Search prescription, patient or scan barcode' },
    { keys: '← / →  o  [ / ]', descEs: 'Cambiar entre partes / frascos de la receta', descEn: 'Switch between formula parts / bottles' },
    { keys: 'Alt + ↑ / ↓', descEs: 'Cambiar de paciente en la cola del lote', descEn: 'Switch patient in batch queue' },
    { keys: 'E', descEs: 'Alternar Vista Impresión / Modo Edición', descEn: 'Toggle Print View / Edit Mode' },
    { keys: 'Space', descEs: 'Marcar / desmarcar frasco actual como Etiquetado ✓', descEn: 'Toggle current bottle Labeled ✓' },
    { keys: '⌘P / Ctrl+P', descEs: 'Exportar / imprimir lote actual (A4 PDF o ZPL)', descEn: 'Export / print active batch (A4 PDF or ZPL)' },
    { keys: '?', descEs: 'Abrir / cerrar esta ayuda de atajos', descEn: 'Open / close this shortcuts guide' }
  ];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(2px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 16px 40px rgba(15, 23, 42, 0.2)',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
            <Keyboard size={17} color="#1a73e8" />
            <span>{isEs ? 'Atajos de Teclado · Label Studio' : 'Keyboard Shortcuts · Label Studio'}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', color: '#64748b', cursor: 'pointer', padding: '4px' }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {shortcuts.map((s) => (
            <div
              key={s.keys}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                fontSize: '0.78rem'
              }}
            >
              <span style={{ color: '#334155' }}>{isEs ? s.descEs : s.descEn}</span>
              <kbd
                style={{
                  padding: '3px 8px',
                  borderRadius: '5px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  fontFamily: 'monospace',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  whiteSpace: 'nowrap'
                }}
              >
                {s.keys}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
