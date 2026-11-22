'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Eye,
  Edit3,
  AlertTriangle,
  CheckCircle2,
  Printer,
  FileSpreadsheet,
  Keyboard,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { detectLabelOverflow } from '@/utils/labels/labelOverflowDetector';
import { useLabelsExport } from '../hooks/useLabelsExport';

const CONTAINER_QUICK_PRESETS = [
  { id: 'vial10', labelEs: 'Vial 10 mL', labelEn: '10 mL Vial', widthMm: 50, heightMm: 25, variant: 'backQr', storage: '2–8 °C' },
  { id: 'spray100', labelEs: 'Spray 100 mL', labelEn: '100 mL Spray', widthMm: 75, heightMm: 45, variant: 'backQr', storage: '< 25 °C' },
  { id: 'jar60', labelEs: 'Bote 60 Cáps.', labelEn: '60 Caps Jar', widthMm: 70, heightMm: 35, variant: 'backQr', storage: '< 25 °C' },
  { id: 'box', labelEs: 'Caja Exterior', labelEn: 'Outer Box', widthMm: 100, heightMm: 55, variant: 'shipping', storage: '2–8 °C' }
];

export function detectContainerPreset(label = {}) {
  const txt = `${label?.volume || ''} ${label?.productTitle || ''} ${label?.productName || ''}`.toLowerCase();
  if (/cap|troche|oral|tablet|softgel/.test(txt)) return CONTAINER_QUICK_PRESETS[2];
  if (/vial|2\s*ml|3\s*ml|5\s*ml|10\s*ml|pellet/.test(txt)) return CONTAINER_QUICK_PRESETS[0];
  if (/50\s*ml|60\s*ml|100\s*ml|120\s*ml|200\s*ml|250\s*ml|trichosol|shampoo|spray|lotion/.test(txt)) return CONTAINER_QUICK_PRESETS[1];
  return null;
}

/**
 * LabelsPreflightBar
 * ─────────────────────────────────────────────────────────────────────────────
 * Ergonomic operator bar right above the label workbench:
 *  - Print/Preview Mode vs. Edit Mode toggle
 *  - 1-Click Container Presets
 *  - Real-time GMP Pre-flight Checklist + Overflow Guard with 1-click Auto-Fit
 *  - Quick ZPL Thermal Export, Batch Packing List PDF & Keyboard Shortcuts (?)
 */
export default function LabelsPreflightBar({
  isEs,
  isEditing,
  onToggleEditMode,
  activeLabel = {},
  currentRx = {},
  activeQueueItem = {},
  onApplyPreset,
  onAutoFitOverflow,
  onDownloadZplBatch,
  onDownloadPackingListPdf,
  onDownloadA4BatchPdf = null,
  onOpenShortcuts,
  strictGmpGate = false,
  onToggleStrictGmpGate = null,
  colorMode = 'monochrome',
  onColorModeChange = null,
  onFocusLotBud = null,
  editorTab = 'fields',
  onChangeEditorTab = null,
  onQueueRxQuantity = null
}) {
  const [exportOpen, setExportOpen] = useState(false);
  const [lastPrintAction, setLastPrintAction] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('atlas_labels_last_print_action') || 'a4';
      } catch (_) {
        return 'a4';
      }
    }
    return 'a4';
  });
  const exportRef = useRef(null);
  const { markPrintedInFirestore } = useLabelsExport({ currentRx, activeQueueItem });

  const runPrintAction = (action) => {
    setLastPrintAction(action);
    try {
      localStorage.setItem('atlas_labels_last_print_action', action);
    } catch (_) {
      /* ignore */
    }
    setExportOpen(false);
    if (action === 'a4' && onDownloadA4BatchPdf) {
      onDownloadA4BatchPdf();
      markPrintedInFirestore();
    } else if (action === 'zpl' && onDownloadZplBatch) {
      onDownloadZplBatch();
      markPrintedInFirestore();
    } else if (action === 'packing' && onDownloadPackingListPdf) {
      onDownloadPackingListPdf();
    }
  };

  useEffect(() => {
    if (!exportOpen) return undefined;
    const onOutside = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setExportOpen(false);
      }
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [exportOpen]);
  const widthMm = activeLabel?.widthMm || activeQueueItem?.widthMm || 75;
  const heightMm = activeLabel?.heightMm || activeQueueItem?.heightMm || 45;
  const overflow = detectLabelOverflow(activeLabel, widthMm, heightMm);

  const hasFormula = Boolean(
    activeLabel?.productName ||
    activeLabel?.title ||
    activeLabel?.formulaName ||
    activeLabel?.composition ||
    activeLabel?.activesSummary
  );
  const hasLotBud = Boolean(
    (activeLabel?.batchNumber || activeLabel?.lotNumber) &&
    (activeLabel?.expiryDate || activeLabel?.bud)
  );
  const isApproved = currentRx?.status === 'approved' || Boolean(currentRx?.isSigned);
  const gmpBlocked = Boolean(strictGmpGate && (!hasFormula || !hasLotBud || !isApproved || overflow.hasOverflow));

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px',
        padding: '8px 20px',
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        flexWrap: 'wrap'
      }}
    >
      {/* Left: Dual-Mode Toggle + Quick Presets */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <div
          style={{
            display: 'inline-flex',
            background: '#e2e8f0',
            padding: '2px',
            borderRadius: '7px'
          }}
        >
          <button
            type="button"
            onClick={() => onToggleEditMode?.(false)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              borderRadius: '5px',
              border: 'none',
              background: !isEditing ? '#ffffff' : 'transparent',
              color: !isEditing ? '#0f172a' : '#475569',
              fontSize: '0.73rem',
              fontWeight: !isEditing ? 700 : 600,
              cursor: 'pointer',
              boxShadow: !isEditing ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            <Eye size={13} />
            <span>{isEs ? 'Vista Previa' : 'Preview'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onChangeEditorTab?.('fields');
              if (!isEditing) onToggleEditMode?.(true);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              borderRadius: '5px',
              border: 'none',
              background: isEditing && editorTab !== 'markdown' ? '#ffffff' : 'transparent',
              color: isEditing && editorTab !== 'markdown' ? '#1a73e8' : '#475569',
              fontSize: '0.73rem',
              fontWeight: isEditing && editorTab !== 'markdown' ? 700 : 600,
              cursor: 'pointer',
              boxShadow: isEditing && editorTab !== 'markdown' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            <Edit3 size={13} />
            <span>{isEs ? 'Editar Campos' : 'Edit Fields'}</span>
          </button>
          {onChangeEditorTab && (
            <button
              type="button"
              onClick={() => {
                onChangeEditorTab('markdown');
                if (!isEditing) onToggleEditMode?.(true);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '5px',
                border: 'none',
                background: isEditing && editorTab === 'markdown' ? '#ffffff' : 'transparent',
                color: isEditing && editorTab === 'markdown' ? '#1a73e8' : '#475569',
                fontSize: '0.73rem',
                fontWeight: isEditing && editorTab === 'markdown' ? 700 : 600,
                cursor: 'pointer',
                boxShadow: isEditing && editorTab === 'markdown' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              <span>📝 .md</span>
            </button>
          )}
        </div>

        <span style={{ color: '#cbd5e1' }}>|</span>

        {/* 1-Click Container Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginRight: '2px' }}>
            {isEs ? 'Envase:' : 'Preset:'}
          </span>
          {CONTAINER_QUICK_PRESETS.map((preset) => {
            const isActive = Number(widthMm) === preset.widthMm && Number(heightMm) === preset.heightMm;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onApplyPreset?.(preset)}
                style={{
                  padding: '3px 8px',
                  borderRadius: '5px',
                  border: isActive ? '1.5px solid #1a73e8' : '1px solid #cbd5e1',
                  background: isActive ? '#e8f0fe' : '#ffffff',
                  color: isActive ? '#1a73e8' : '#475569',
                  fontSize: '0.69rem',
                  fontWeight: isActive ? 750 : 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
                title={`${preset.widthMm}×${preset.heightMm} mm · ${preset.storage}`}
              >
                {isEs ? preset.labelEs : preset.labelEn}
              </button>
            );
          })}
          {(() => {
            const suggested = detectContainerPreset(activeLabel);
            if (!suggested) return null;
            const alreadyMatches = Number(widthMm) === suggested.widthMm && Number(heightMm) === suggested.heightMm;
            if (alreadyMatches) return null;
            return (
              <button
                type="button"
                onClick={() => onApplyPreset?.(suggested)}
                style={{
                  padding: '3px 8px',
                  borderRadius: '999px',
                  border: '1px solid #a7f3d0',
                  background: '#ecfdf5',
                  color: '#047857',
                  fontSize: '0.68rem',
                  fontWeight: 750,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
                title={isEs ? 'Aplicar tamaño sugerido según fórmula' : 'Apply suggested size based on formula'}
              >
                ✨ {isEs ? `Sugerido: ${suggested.labelEs}` : `Suggested: ${suggested.labelEn}`}
              </button>
            );
          })()}
        </div>
      </div>

      {/* Center/Right: Pre-flight GMP Checklist + Overflow Guard + Quick Exports */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.70rem', fontWeight: 650 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              padding: '2px 7px',
              borderRadius: '12px',
              background: hasFormula ? '#f0fdf4' : '#fef2f2',
              color: hasFormula ? '#16a34a' : '#dc2626',
              border: `1px solid ${hasFormula ? '#bbf7d0' : '#fecaca'}`
            }}
          >
            <CheckCircle2 size={11} />
            <span>{isEs ? 'Fórmula' : 'Formula'}</span>
          </span>

          <button
            type="button"
            onClick={() => onFocusLotBud?.()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              padding: '2px 7px',
              borderRadius: '12px',
              background: hasLotBud ? '#f0fdf4' : '#fffbeb',
              color: hasLotBud ? '#16a34a' : '#d97706',
              border: `1px solid ${hasLotBud ? '#bbf7d0' : '#fde68a'}`,
              cursor: onFocusLotBud ? 'pointer' : 'default',
              fontSize: 'inherit',
              fontWeight: 'inherit',
            }}
            title={isEs ? 'Ir al campo de Lote / BUD' : 'Jump to Lot / BUD field'}
          >
            <CheckCircle2 size={11} />
            <span>{hasLotBud ? 'Lot & BUD' : (isEs ? 'Falta Lote/BUD' : 'No Lot/BUD')}</span>
          </button>

          {overflow.hasOverflow && (
            <button
              type="button"
              onClick={() => onAutoFitOverflow?.(overflow.recommendedScale)}
              title={overflow.warnings.map(w => `${isEs ? w.labelEs : w.labelEn}: ${w.chars}/${w.limit}`).join(' · ')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '12px',
                background: '#fff7ed',
                color: '#c2410c',
                border: '1px solid #fed7aa',
                fontSize: '0.70rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <AlertTriangle size={11} />
              <span>{isEs ? 'Texto largo · Auto-ajustar' : 'Text Overflow · Auto-Fit'}</span>
              <Sparkles size={10} />
            </button>
          )}
          {onToggleStrictGmpGate && (
            <button
              type="button"
              onClick={() => onToggleStrictGmpGate(!strictGmpGate)}
              title={isEs ? 'Bloqueo estricto GMP: impide exportar si falta Lote/BUD, Aprobación o hay desbordamiento' : 'Strict GMP Gate: blocks export if Lot/BUD, Approval, or text fit fails'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '12px',
                border: strictGmpGate ? '1.5px solid #0f766e' : '1px solid #cbd5e1',
                background: strictGmpGate ? '#f0fdfa' : '#ffffff',
                color: strictGmpGate ? '#0f766e' : '#64748b',
                fontSize: '0.68rem',
                fontWeight: 750,
                cursor: 'pointer'
              }}
            >
              <span>{strictGmpGate ? (isEs ? '🔒 Bloqueo GMP' : '🔒 GMP Lock') : (isEs ? '🔓 GMP Libre' : '🔓 GMP Off')}</span>
            </button>
          )}
        </div>

        <span style={{ color: '#cbd5e1' }}>|</span>

        {/* Vector SVG Print Palette Toggle (Thermal B&W vs Vector Color) */}
        {onColorModeChange && (
          <div
            role="group"
            aria-label={isEs ? 'Modo de color de impresión SVG' : 'SVG print color mode'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: '#f1f5f9',
              padding: '2px',
              borderRadius: '7px',
              border: '1px solid #cbd5e1',
            }}
          >
            <button
              type="button"
              onClick={() => onColorModeChange('monochrome')}
              style={{
                padding: '3px 8px',
                borderRadius: '5px',
                border: 'none',
                background: colorMode !== 'color' ? '#ffffff' : 'transparent',
                color: colorMode !== 'color' ? '#0f172a' : '#64748b',
                boxShadow: colorMode !== 'color' ? '0 1px 2px rgba(15,23,42,0.08)' : 'none',
                fontSize: '0.68rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
              title={isEs ? 'SVG Blanco y Negro (Térmica / Alto contraste)' : 'Vector B&W (Thermal / High contrast)'}
            >
              🖨️ B&amp;W
            </button>
            <button
              type="button"
              onClick={() => onColorModeChange('color')}
              style={{
                padding: '3px 8px',
                borderRadius: '5px',
                border: 'none',
                background: colorMode === 'color' ? '#ffffff' : 'transparent',
                color: colorMode === 'color' ? '#1a73e8' : '#64748b',
                boxShadow: colorMode === 'color' ? '0 1px 2px rgba(15,23,42,0.08)' : 'none',
                fontSize: '0.68rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
              title={isEs ? 'SVG Color Vectorial (Sin pérdida de calidad)' : 'Vector Color SVG (Full sharpness)'}
            >
              🎨 Color
            </button>
          </div>
        )}

        {/* Unified Print / Export Dropdown (GCP Action Menu) */}
        {(() => {
          const rawItemQty = Number(currentRx?.items?.[0]?.quantity || activeLabel?.rxQty || 0);
          const parsedQtyMatch = String(activeLabel?.quantity || '').match(/[×x]\s*(\d+)/i);
          const rxQty = rawItemQty > 1 ? rawItemQty : (parsedQtyMatch ? Number(parsedQtyMatch[1]) : 0);
          if (!onQueueRxQuantity || rxQty <= 1) return null;
          return (
            <button
              type="button"
              onClick={() => onQueueRxQuantity(rxQty)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 9px',
                borderRadius: '6px',
                border: '1px solid #0d9488',
                background: '#f0fdfa',
                color: '#0f766e',
                fontSize: '0.70rem',
                fontWeight: 750,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
              title={isEs ? `Añadir las ${rxQty} unidades de esta receta a la cola de impresión A4/lote` : `Queue all ${rxQty} units from this Rx for batch A4 printing`}
            >
              <span>+ {isEs ? `Cola ×${rxQty}` : `Queue ×${rxQty}`}</span>
            </button>
          );
        })()}
        <div ref={exportRef} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => {
              if (gmpBlocked) {
                setExportOpen((v) => !v);
                return;
              }
              runPrintAction(lastPrintAction);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 10px',
              borderRadius: '6px 0 0 6px',
              border: 'none',
              borderRight: '1px solid rgba(255,255,255,0.25)',
              background: gmpBlocked ? '#94a3b8' : '#1a73e8',
              color: '#ffffff',
              fontSize: '0.73rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
            title={isEs ? 'Imprimir directamente con el último formato usado' : '1-click print with last used format'}
          >
            <Printer size={13} />
            <span>
              {lastPrintAction === 'zpl'
                ? (isEs ? 'Imprimir ZPL' : 'Print ZPL')
                : lastPrintAction === 'packing'
                  ? 'Packing List'
                  : (isEs ? 'Imprimir A4' : 'Print A4')}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setExportOpen((v) => !v)}
            aria-label={isEs ? 'Más opciones de impresión' : 'More print options'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '5px 7px',
              borderRadius: '0 6px 6px 0',
              border: 'none',
              background: gmpBlocked ? '#94a3b8' : '#1a73e8',
              color: '#ffffff',
              cursor: 'pointer',
            }}
          >
            <ChevronDown size={13} />
          </button>

          {exportOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '6px',
                zIndex: 70,
                width: '230px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                boxShadow: '0 12px 30px rgba(15, 23, 42, 0.16)',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '3px',
              }}
            >
              {onDownloadA4BatchPdf && (
                <button
                  type="button"
                  disabled={gmpBlocked}
                  onClick={() => runPrintAction('a4')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'transparent',
                    color: gmpBlocked ? '#94a3b8' : '#0f172a',
                    fontSize: '0.76rem',
                    fontWeight: 650,
                    cursor: gmpBlocked ? 'not-allowed' : 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <Printer size={14} color="#1a73e8" />
                  <span>{isEs ? 'Pliego A4 (PDF)' : 'A4 Sheet (PDF)'}</span>
                </button>
              )}

              <button
                type="button"
                disabled={gmpBlocked}
                onClick={() => runPrintAction('zpl')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'transparent',
                  color: gmpBlocked ? '#94a3b8' : '#0f172a',
                  fontSize: '0.76rem',
                  fontWeight: 650,
                  cursor: gmpBlocked ? 'not-allowed' : 'pointer',
                  textAlign: 'left',
                }}
              >
                <Printer size={14} color="#0d9488" />
                <span>{isEs ? 'Térmica Zebra (ZPL)' : 'Zebra Thermal (ZPL)'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setExportOpen(false);
                  onDownloadPackingListPdf?.();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'transparent',
                  color: '#0f172a',
                  fontSize: '0.76rem',
                  fontWeight: 650,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <FileSpreadsheet size={14} color="#4f46e5" />
                <span>{isEs ? 'Packing List (PDF)' : 'Batch Packing List (PDF)'}</span>
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenShortcuts}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '26px',
            height: '26px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            color: '#475569',
            cursor: 'pointer'
          }}
          title={isEs ? 'Atajos de teclado (?)' : 'Keyboard shortcuts (?)'}
        >
          <Keyboard size={13} />
        </button>
      </div>
    </div>
  );
}
