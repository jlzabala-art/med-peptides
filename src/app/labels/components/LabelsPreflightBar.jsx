'use client';

import React from 'react';
import {
  Eye,
  Edit3,
  AlertTriangle,
  CheckCircle2,
  Printer,
  FileSpreadsheet,
  Keyboard,
  Sparkles
} from 'lucide-react';
import { detectLabelOverflow } from '@/utils/labels/labelOverflowDetector';

const CONTAINER_QUICK_PRESETS = [
  { id: 'vial10', labelEs: 'Vial 10 mL', labelEn: '10 mL Vial', widthMm: 50, heightMm: 25, variant: 'backQr', storage: '2–8 °C' },
  { id: 'spray100', labelEs: 'Spray 100 mL', labelEn: '100 mL Spray', widthMm: 75, heightMm: 45, variant: 'backQr', storage: '< 25 °C' },
  { id: 'jar60', labelEs: 'Bote 60 Cáps.', labelEn: '60 Caps Jar', widthMm: 70, heightMm: 35, variant: 'backQr', storage: '< 25 °C' },
  { id: 'box', labelEs: 'Caja Exterior', labelEn: 'Outer Box', widthMm: 100, heightMm: 55, variant: 'shipping', storage: '2–8 °C' }
];

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
  onOpenShortcuts
}) {
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
            onClick={() => isEditing && onToggleEditMode?.(false)}
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
            <span>{isEs ? 'Vista Impresión' : 'Print View'}</span>
          </button>
          <button
            type="button"
            onClick={() => !isEditing && onToggleEditMode?.(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              borderRadius: '5px',
              border: 'none',
              background: isEditing ? '#ffffff' : 'transparent',
              color: isEditing ? '#1a73e8' : '#475569',
              fontSize: '0.73rem',
              fontWeight: isEditing ? 700 : 600,
              cursor: 'pointer',
              boxShadow: isEditing ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            <Edit3 size={13} />
            <span>{isEs ? 'Modo Edición (E)' : 'Edit Mode (E)'}</span>
          </button>
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

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              padding: '2px 7px',
              borderRadius: '12px',
              background: hasLotBud ? '#f0fdf4' : '#fffbeb',
              color: hasLotBud ? '#16a34a' : '#d97706',
              border: `1px solid ${hasLotBud ? '#bbf7d0' : '#fde68a'}`
            }}
          >
            <CheckCircle2 size={11} />
            <span>{hasLotBud ? 'Lot & BUD' : (isEs ? 'Sin Lote/BUD' : 'No Lot/BUD')}</span>
          </span>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              padding: '2px 7px',
              borderRadius: '12px',
              background: isApproved ? '#f0fdf4' : '#fffbeb',
              color: isApproved ? '#16a34a' : '#d97706',
              border: `1px solid ${isApproved ? '#bbf7d0' : '#fde68a'}`
            }}
          >
            <CheckCircle2 size={11} />
            <span>{isApproved ? (isEs ? 'Aprobada' : 'Approved') : (isEs ? 'Pendiente' : 'Pending')}</span>
          </span>

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
        </div>

        <span style={{ color: '#cbd5e1' }}>|</span>

        <button
          type="button"
          onClick={onDownloadZplBatch}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 9px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            color: '#0f172a',
            fontSize: '0.71rem',
            fontWeight: 650,
            cursor: 'pointer'
          }}
          title={isEs ? 'Exportar ZPL nativo para impresora térmica Zebra' : 'Export native ZPL for Zebra thermal printer'}
        >
          <Printer size={12} color="#0d9488" />
          <span>ZPL</span>
        </button>

        <button
          type="button"
          onClick={onDownloadPackingListPdf}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 9px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            color: '#0f172a',
            fontSize: '0.71rem',
            fontWeight: 650,
            cursor: 'pointer'
          }}
          title={isEs ? 'Descargar hoja de picking y verificación del lote' : 'Download Batch Picking & Packing List PDF'}
        >
          <FileSpreadsheet size={12} color="#1a73e8" />
          <span>{isEs ? 'Packing List' : 'Packing List'}</span>
        </button>

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
