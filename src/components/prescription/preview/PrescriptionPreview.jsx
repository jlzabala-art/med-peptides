'use client';

import React, { useState, useMemo, useEffect } from 'react';
// eslint-disable-next-line no-restricted-imports
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import {
  FlaskConical,
  Pill,
  Tag,
  ExternalLink,
  Edit3,
  RotateCcw,
  Check,
  X,
  FileText,
  Calendar,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Link2,
  Eye,
  Info,
  Clock,
} from 'lucide-react';
import CopyableId from '@/components/ui/CopyableId';
import StatusBadge from '@/components/ui/StatusBadge';
import { usePrescriptionParts } from '@/hooks/usePrescriptionParts';
import PharmapolisLabelSvg from '../PharmapolisLabelSvg';

/**
 * PrescriptionPreview
 * ─────────────────────────────────────────────────────────────────────────────
 * Universal component to preview, inspect, select, or edit any prescription
 * broken down into its clinical parts (Formulas 1, 2, 3 / Vials), extracted
 * directly from the authoritative Pharmapolis Labels engine.
 *
 * Supported locations:
 * - UniversalPrescriptionsTable (expandable row master-detail)
 * - RefillPrescriptionWorkbench (selective refill duplication)
 * - PharmacyLabelsModal (parts switcher)
 * - Patient profile prescription history
 * - /rx/[code] public portal
 */
export default function PrescriptionPreview({
  rx,
  variant = 'standard', // 'compact' | 'standard' | 'full'
  mode = 'readOnly',    // 'readOnly' | 'selectable' | 'editable'
  initialPartIndex = 0,
  activePartIndex: controlledPartIndex,
  onPartChange,
  // Selectable mode props (Refill)
  selectedPartKeys = null,
  onTogglePartSelect = null,
  onUpdatePartQuantity = null,
  partQuantities = null,
  // Custom action renderers
  renderHeaderActions = null,
  renderPartActions = null,
  // Handlers
  onOpenLabels = null,
  onEditLabel = null,
  onRefill = null,
  onOpenZohoMatcher = null,
  isEs = false,
}) {
  // ── Self-healing: if rx comes from Algolia (slim), hydrate with full Firestore doc ──
  const [liveRx, setLiveRx] = useState(rx);
  useEffect(() => {
    setLiveRx(rx); // reset whenever rx prop changes
    const needsHydration =
      rx?.id &&
      (!rx.parts || (Array.isArray(rx.items) && rx.items.some(i => i.activeIngredient == null)));
    if (!needsHydration) return;
    let cancelled = false;
    getDoc(doc(db, 'prescriptions', rx.id))
      .then(snap => {
        if (!cancelled && snap.exists()) {
          setLiveRx({ id: snap.id, ...snap.data() });
        }
      })
      .catch(() => { /* silent – fall back to slim rx */ });
    return () => { cancelled = true; };
  }, [rx]);

  const { header, parts, isEmpty, isMultipart, totalParts } = usePrescriptionParts(liveRx);
  const [internalPartIdx, setInternalPartIdx] = useState(initialPartIndex || 0);
  const [showLabelSvg, setShowLabelSvg] = useState(false);

  const activeIndex = typeof controlledPartIndex === 'number'
    ? Math.max(0, Math.min(controlledPartIndex, (parts.length || 1) - 1))
    : Math.max(0, Math.min(internalPartIdx, (parts.length || 1) - 1));

  const handleSelectPart = (idx) => {
    if (onPartChange) onPartChange(idx);
    else setInternalPartIdx(idx);
  };

  const selectedPart = parts[activeIndex] || parts[0] || null;

  if (isEmpty || !header) {
    return (
      <div style={{
        padding: '1.25rem',
        background: '#f8fafc',
        border: '1px dashed #cbd5e1',
        borderRadius: '8px',
        color: '#64748b',
        fontSize: '0.82rem',
        textAlign: 'center',
      }}>
        {isEs ? 'No se encontraron fórmulas desglosadas en esta prescripción.' : 'No formulated prescription parts available for this record.'}
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      background: '#f8fafc',
      borderTop: '1px dashed #cbd5e1',
      padding: variant === 'compact' ? '10px 12px' : '14px 18px',
      fontSize: '0.82rem',
    }}>
      {/* ── 1. HEADER ROW: Program badge + Source + Code + Doctor + Next Refill + Status ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Program / Category Badge */}
          {header.typeInfo && (
            <span
              title={`${header.typeInfo.label} — ${header.typeInfo.sublabel}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.74rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '4px',
                background: header.typeInfo.badgeBg,
                color: header.typeInfo.badgeColor,
                border: `1px solid ${header.typeInfo.badgeBorder}`,
                whiteSpace: 'nowrap',
              }}
            >
              <span>{header.typeInfo.label}</span>
              {header.typeInfo.sublabel && (
                <span style={{ opacity: 0.85, fontWeight: 500 }}>· {header.typeInfo.sublabel}</span>
              )}
            </span>
          )}

          {/* Prescription Code with Copy-on-Click */}
          <CopyableId value={header.code} />

          {/* Source Tag */}
          <span style={{
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '0.7rem',
            fontWeight: 600,
            background: header.isImport ? '#eff6ff' : '#ffffff',
            color: header.isImport ? '#1a73e8' : '#5f6368',
            border: header.isImport ? '1px solid #bfdbfe' : '1px solid #dadce0',
          }}>
            {header.sourceLabel}
          </span>

          {/* Refill Status / Scheduled Badge */}
          {(header.nextRefillDate || rx.isRefill || rx.parentPrescriptionCode) && (
            <span style={{
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.7rem',
              fontWeight: 700,
              background: '#f0fdf4',
              color: '#15803d',
              border: '1px solid #86efac',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              {rx.isRefill && rx.parentPrescriptionCode
                ? `🔄 Refill #${rx.refillNumber || 1} de #${rx.parentPrescriptionCode}`
                : '🔄 Refill Programado'}
              {header.nextRefillDate ? ` · Próximo: ${header.nextRefillDate}` : ''}
            </span>
          )}

          {/* Status Badge */}
          <StatusBadge status={header.status} />
        </div>

        {/* Header Right Actions Slot (Source file, Zoho Matching, Custom) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {renderHeaderActions ? renderHeaderActions({ header, parts }) : (
            <>
              {onOpenZohoMatcher && (
                <button
                  type="button"
                  onClick={() => onOpenZohoMatcher(rx)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    color: '#15803d',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  title="Sincronizar APIs de esta prescripción con Zoho Books"
                >
                  <Link2 size={11} />
                  <span>Zoho Matching</span>
                </button>
              )}

              {header.sourceFileUrl && (
                <a
                  href={header.sourceFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: '#eff6ff',
                    color: '#2563eb',
                    border: '1px solid #bfdbfe',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <FileText size={11} />
                  <span>{isEs ? 'Ver Documento' : 'Open file'}</span>
                </a>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── 2. MULTI-PART TABS / SWITCHER (Identical to Labels Module) ── */}
      {parts.length > 1 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '4px',
          borderBottom: '1px solid #e2e8f0',
        }}>
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: '#64748b',
            marginRight: '2px',
          }}>
            {isEs ? 'Fórmulas / Partes:' : 'Prescription Parts:'}
          </span>

          {parts.map((p, idx) => {
            const isSelected = idx === activeIndex;
            const isChecked = selectedPartKeys ? selectedPartKeys.has(p.key) : true;

            return (
              <button
                key={p.key || idx}
                type="button"
                onClick={() => handleSelectPart(idx)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: isSelected ? 800 : 600,
                  background: isSelected ? '#003666' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#334155',
                  border: isSelected ? '1px solid #003666' : '1px solid #cbd5e1',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 1px 3px rgba(0,54,102,0.2)' : 'none',
                }}
              >
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: isSelected ? 'rgba(255,255,255,0.25)' : '#e0f2fe',
                  color: isSelected ? '#ffffff' : '#0369a1',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                }}>
                  {p.phaseNumber}
                </span>

                <span>{p.title}</span>

                {p.routeTag && (
                  <span style={{
                    fontSize: '0.66rem',
                    fontWeight: 600,
                    opacity: isSelected ? 0.9 : 0.7,
                    padding: '0 4px',
                    borderRadius: '3px',
                    background: isSelected ? 'rgba(255,255,255,0.15)' : '#f1f5f9',
                  }}>
                    {p.routeTag}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ── 3. ACTIVE PART DETAIL CARD (Labels-Style Breakdown) ── */}
      {selectedPart && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '10px',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
        }}>
          {/* Part Title + Volume + Route Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: '#003666',
                color: '#ffffff',
                fontSize: '0.72rem',
                fontWeight: 800,
              }}>
                {selectedPart.phaseNumber}
              </span>

              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                {selectedPart.title}
              </span>

              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '1px 8px',
                borderRadius: '999px',
                background: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
              }}>
                {selectedPart.volume}
              </span>

              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                {selectedPart.dosageForm}
              </span>
            </div>

            {/* Quick Action Buttons for this part — unified hub */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              {/* Primary CTA: Preview Label SVG inline */}
              <button
                type="button"
                onClick={() => setShowLabelSvg(!showLabelSvg)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  borderRadius: '5px',
                  border: showLabelSvg ? '1px solid #003666' : '1px solid #cbd5e1',
                  background: showLabelSvg ? '#003666' : '#ffffff',
                  color: showLabelSvg ? '#ffffff' : '#0f172a',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
                title={showLabelSvg ? 'Ocultar miniatura de la etiqueta' : 'Previsualizar la etiqueta galénica de esta fórmula'}
              >
                <Eye size={12} />
                <span>{showLabelSvg ? (isEs ? 'Ocultar Etiqueta' : 'Hide Label') : (isEs ? 'Ver Etiqueta SVG' : 'Preview Label SVG')}</span>
              </button>

              {/* Labels Modal */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenLabels) onOpenLabels(liveRx, activeIndex, 'label');
                  else if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('OPEN_PHARMAPOLIS_LABELS', { detail: { rx: liveRx, index: activeIndex } }));
                  }
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  borderRadius: '5px',
                  border: '1px solid #86efac',
                  background: '#f0fdf4',
                  color: '#166534',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
                title="Abrir en el visor oficial de etiquetas Pharmapolis (PNG / ZPL / Print)"
              >
                <Tag size={12} />
                <span>{isEs ? 'Módulo Labels' : 'Labels Modal'}</span>
              </button>

              {/* Edit button */}
              {onEditLabel && (
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenLabels) onOpenLabels(liveRx, activeIndex, 'edit');
                    else onEditLabel(liveRx, activeIndex);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '5px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#334155',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  title="Editar los textos clínicos de la etiqueta"
                >
                  <Edit3 size={11} />
                  <span>{isEs ? 'Editar' : 'Edit'}</span>
                </button>
              )}

              {/* Refill button */}
              {onRefill && (
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenLabels) onOpenLabels(liveRx, activeIndex, 'refill');
                    else onRefill(liveRx);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '5px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#003666',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  title="Duplicar o renovar esta prescripción con el Refill Workbench"
                >
                  <RotateCcw size={11} />
                  <span>{isEs ? 'Refill' : 'Refill'}</span>
                </button>
              )}

              {renderPartActions && renderPartActions(selectedPart, activeIndex)}
            </div>
          </div>

          {/* Active Ingredients (APIs) Pills */}
          <div>
            <div style={{
              fontSize: '0.67rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: '#64748b',
              marginBottom: '4px',
            }}>
              {isEs ? 'Principios Activos & Concentración (APIs)' : 'Compounded Active Ingredients (APIs)'}
            </div>

            {selectedPart.apis && selectedPart.apis.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {selectedPart.apis.map((api, aIdx) => (
                  <span
                    key={aIdx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: '#f8fafc',
                      border: api.zohoMatched ? '1px solid #86efac' : '1px solid #cbd5e1',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#0f172a',
                    }}
                  >
                    <FlaskConical size={12} color="#003666" />
                    <span>{api.name}</span>
                    {api.dose && (
                      <span style={{
                        padding: '0 5px',
                        borderRadius: '4px',
                        background: '#dbeafe',
                        color: '#1d4ed8',
                        fontWeight: 700,
                        fontSize: '0.72rem',
                      }}>
                        {api.dose}
                      </span>
                    )}
                    {api.zohoMatched && (
                      <span style={{
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        background: '#dcfce7',
                        color: '#166534',
                        padding: '0 4px',
                        borderRadius: '3px',
                      }}>
                        ✓ Zoho
                      </span>
                    )}
                  </span>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.80rem', fontWeight: 600, color: '#334155' }}>
                {selectedPart.formula}
              </div>
            )}
          </div>

          {/* Two-Column Galenic Vehicle + Posology Breakdown */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '8px',
          }}>
            <div style={{
              padding: '8px 10px',
              borderRadius: '6px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
            }}>
              <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '2px' }}>
                {isEs ? 'Vehículo / Excipiente Galénico' : 'Galenic Base & Vehicle'}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#1e293b', fontWeight: 600 }}>
                {selectedPart.vehicle} ({selectedPart.volume})
              </div>
            </div>

            <div style={{
              padding: '8px 10px',
              borderRadius: '6px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
            }}>
              <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '2px' }}>
                {isEs ? 'Posología / Pauta de Administración' : 'Posology & Patient Directions'}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#1e293b', fontWeight: 500 }}>
                {selectedPart.directions}
              </div>
            </div>
          </div>

          {/* Optional Interactive SVG Label Preview (Clean Sidecar / Dropdown Embed) */}
          {showLabelSvg && selectedPart.rawLabel && (
            <div style={{
              marginTop: '4px',
              padding: '12px',
              borderRadius: '8px',
              background: '#ffffff',
              border: '1.5px solid #003666',
              boxShadow: '0 4px 12px rgba(0,54,102,0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '6px',
              }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#003666', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <ShieldCheck size={14} color="#16a34a" />
                  <span>{isEs ? `Etiqueta Galénica Oficial Pharmapolis · Parte ${selectedPart.phaseNumber}` : `Pharmapolis Official Compounding Label · Part ${selectedPart.phaseNumber}`}</span>
                </span>
                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                  75 × 45 mm (300 DPI)
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'center',
                overflowX: 'auto',
                background: '#f8fafc',
                padding: '8px',
                borderRadius: '6px',
              }}>
                <div style={{ maxWidth: '420px', width: '100%' }}>
                  <PharmapolisLabelSvg
                    data={selectedPart.rawLabel}
                    widthMm={75}
                    heightMm={45}
                    variant="backQr"
                    isEs={isEs}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

