'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  Search,
  Upload,
  Plus,
  ChevronRight,
  Layers,
  Database,
  Printer,
  ShieldCheck,
  Clock,
  ExternalLink,
  Repeat,
  FilePlus2,
} from 'lucide-react';
import CopyableId from '@/components/ui/CopyableId';
import StatusBadge from '@/components/ui/StatusBadge';
import DataTable from '@/components/ui/DataTable';
import LabelsRowQuickPreview from './LabelsRowQuickPreview';
import PrescriptionStatusPopover from '@/components/prescription/PrescriptionStatusPopover';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { sanitizeRecentCode, getWorklistTestKind } from '../utils/labelHelpers';

export default function LabelsHomeView({
  isEs,
  labelsKpis,
  unprintedCodes,
  handleAddMultipleToQueue,
  worklistTab,
  setWorklistTab,
  worklistTabCounts,
  worklistDateRange,
  setWorklistDateRange,
  setWorklistPage,
  recentPrescriptions,
  filterWorklistItem,
  handleClearRecent,
  handleSelectOrAddPatient,
  formatResultDate,
  renderPrintStatusBadge,
  paginatedWorklistItems,
  filteredWorklistItems,
  safeWorklistPage,
  worklistPageSize,
  setWorklistPageSize,
  totalWorklistPages,
  onOpenImport,
  onOpenManualRx,
  worklistTestFilter = 'all',
  setWorklistTestFilter,
  allWorklistItems = [],
}) {
  const { role } = useRoleAccess();
  const [statusOverrides, setStatusOverrides] = useState({});

  const renderRefillTag = (item) => {
    const codeStr = String(item.code || '');
    const isRefill = Number(item.refillCycle || 1) > 1 || /-R\d+$/i.test(codeStr) || Boolean(item.refillOf);
    if (!isRefill && !item.refillAlertDate) return null;
    return (
      <span
        style={{
          fontSize: '0.66rem',
          fontWeight: 700,
          color: '#047857',
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          padding: '1px 6px',
          borderRadius: '4px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '3px',
        }}
      >
        <Repeat size={10} />
        <span>
          {isRefill ? `R${item.refillCycle || 2}` : ''}
          {item.refillAlertDate ? `${isRefill ? ' · ' : ''}${item.refillAlertDate}` : ''}
        </span>
      </span>
    );
  };

  return (
    <div className="pls-gcp-home">
      {/* 4 Clinical & Print Audit KPI Metric Cards */}
      <div className="pls-gcp-kpis">
        <div className="pls-gcp-kpi-card">
          <div className="pls-gcp-kpi-top">
            <span>{isEs ? 'Prescripciones Disponibles' : 'Available Prescriptions'}</span>
            <Database size={15} color="#1a73e8" />
          </div>
          <div className="pls-gcp-kpi-val">
            {labelsKpis.totalPrescriptions || 339} {isEs ? 'Recetas' : 'Dossiers'}
          </div>
          <div className="pls-gcp-kpi-sub">
            {isEs ? 'Base de datos clínica centralizada' : 'Centralized clinical database'}
          </div>
        </div>

        <div className="pls-gcp-kpi-card">
          <div className="pls-gcp-kpi-top">
            <span>{isEs ? 'Pendientes de Imprimir' : 'Pending Print Queue'}</span>
            <Printer size={15} color="#0d9488" />
          </div>
          <div className="pls-gcp-kpi-val">
            {unprintedCodes.length} {isEs ? 'Listas' : 'Ready'}
          </div>
          <div className="pls-gcp-kpi-sub">
            {isEs ? 'Recetas recientes sin imprimir' : 'Recent unprinted prescriptions'}
          </div>
        </div>

        <div className="pls-gcp-kpi-card">
          <div className="pls-gcp-kpi-top">
            <span>{isEs ? 'Etiquetas A4 Impresas' : 'A4 Labels Printed'}</span>
            <ShieldCheck size={15} color="#16a34a" />
          </div>
          <div className="pls-gcp-kpi-val">
            {labelsKpis.totalPrintedA4Count ?? 0} {isEs ? 'Impresas' : 'Printed'}
          </div>
          <div className="pls-gcp-kpi-sub">
            {isEs ? 'Trazabilidad de impresión por lote' : 'Cumulative A4 batch audit trail'}
          </div>
        </div>

        <div className="pls-gcp-kpi-card">
          <div className="pls-gcp-kpi-top">
            <span>{isEs ? 'Cargas Recientes (7 Días)' : 'Ingested (Last 7 Days)'}</span>
            <Clock size={15} color="#7c3aed" />
          </div>
          <div className="pls-gcp-kpi-val">
            {labelsKpis.uploadedThisWeek ?? 0} {isEs ? 'Nuevas' : 'New RXs'}
          </div>
          <div className="pls-gcp-kpi-sub">
            {isEs ? 'Prescripciones sincronizadas esta semana' : 'Prescriptions ingested this week'}
          </div>
        </div>
      </div>

      {/* Full-Width Prescriptions Worklist (Balanced Single-Column GCP Layout) */}
      <div style={{ width: '100%' }}>
        <section className="pls-gcp-card" style={{ width: '100%' }}>
          <div className="pls-gcp-card-header">
            <div>
              <h2 className="pls-gcp-card-title">
                <Search size={17} color="#1a73e8" />
                <span>
                  {isEs
                    ? 'Centro de Prescripciones y Etiquetado'
                    : 'Prescriptions & Dispensing Worklist'}
                </span>
              </h2>
              <p className="pls-gcp-card-subtitle">
                {isEs
                  ? 'Gestiona recetas, revisa refills, abre su ficha clínica o carga el lote pendiente en 1 clic.'
                  : 'Manage prescriptions, review refills, open clinical dossiers, or queue unprinted labels in 1 click.'}
              </p>
            </div>

            <div className="pls-worklist-tabs-scroll" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {onOpenImport && (
                <button
                  type="button"
                  onClick={onOpenImport}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#1a73e8',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Upload size={14} color="#1a73e8" />
                  <span>{isEs ? 'Importar Receta' : 'Import Rx'}</span>
                </button>
              )}
              {onOpenManualRx && (
                <button
                  type="button"
                  onClick={onOpenManualRx}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#334155',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <FilePlus2 size={14} color="#1a73e8" />
                  <span>{isEs ? 'Rx Manual' : 'Manual Rx'}</span>
                </button>
              )}
              {unprintedCodes.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleAddMultipleToQueue(unprintedCodes)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 11px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#1a73e8',
                    color: '#ffffff',
                    fontSize: '0.73rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Layers size={13} />
                  <span>
                    {isEs ? `Cargar ${unprintedCodes.length} pendientes` : `Queue ${unprintedCodes.length} Unprinted`}
                  </span>
                </button>
              )}

              <div
                className="pls-desktop-only"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 9px',
                  fontSize: '0.72rem',
                  fontWeight: 650,
                  color: '#5f6368',
                  background: '#f1f5f9',
                  borderRadius: '6px',
                }}
              >
                <kbd
                  style={{
                    padding: '1px 5px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                  }}
                >
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>

          {/* Worklist Filter Tabs + Date Range */}
          <div
            style={{
              padding: '10px 20px',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              flexWrap: 'wrap',
            }}
          >
            <div className="pls-worklist-tabs-scroll" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { id: 'unprinted', labelEs: '○ Pendientes', labelEn: '○ Unprinted' },
                { id: 'pending_approval', labelEs: '⏳ Por aprobar', labelEn: '⏳ Pending Approval' },
                { id: 'refills', labelEs: '🔄 Refills', labelEn: '🔄 Refills' },
                { id: 'printed', labelEs: '🖨️ Impresas (1×)', labelEn: '🖨️ Printed (1×)' },
                { id: 'reprint', labelEs: '🔁 Reimpresiones', labelEn: '🔁 Reprints' },
                { id: 'all', labelEs: 'Todas', labelEn: 'All' },
              ].map((tab) => {
                const isTabActive = worklistTab === tab.id;
                const tabCount = worklistTabCounts[tab.id] ?? 0;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setWorklistTab(tab.id);
                      setWorklistPage(1);
                    }}
                    style={{
                      border: isTabActive ? '1.5px solid #1a73e8' : '1px solid #cbd5e1',
                      background: isTabActive ? '#e8f0fe' : '#ffffff',
                      color: isTabActive ? '#1a73e8' : '#475569',
                      fontSize: '0.72rem',
                      fontWeight: isTabActive ? 750 : 600,
                      padding: '3px 10px',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <span>{isEs ? tab.labelEs : tab.labelEn}</span>
                    <span
                      style={{
                        fontSize: '0.66rem',
                        fontWeight: 700,
                        padding: '0 5px',
                        borderRadius: '999px',
                        background: isTabActive ? '#1a73e8' : '#e2e8f0',
                        color: isTabActive ? '#ffffff' : '#475569',
                      }}
                    >
                      {tabCount}
                    </span>
                  </button>
                );
              })}
            </div>

            <select
              aria-label={isEs ? 'Rango temporal' : 'Date range'}
              value={worklistDateRange}
              onChange={(e) => {
                setWorklistDateRange(e.target.value);
                setWorklistPage(1);
              }}
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: '#334155',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '4px 8px',
                cursor: 'pointer',
              }}
            >
              <option value="7d">{isEs ? 'Últimos 7 días' : 'Last 7 days'}</option>
              <option value="30d">{isEs ? 'Últimos 30 días' : 'Last 30 days'}</option>
              <option value="all">{isEs ? 'Todo el historial' : 'All time'}</option>
            </select>
          </div>

          {/* Test kind filter sub-bar */}
          <div
            style={{
              padding: '6px 20px',
              background: '#ffffff',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#64748b', marginRight: '4px' }}>
              {isEs ? 'Tipo de test:' : 'Test type:'}
            </span>
            {[
              { id: 'all', label: isEs ? 'Todos' : 'All' },
              { id: 'trichotest', label: 'TrichoTest™' },
              { id: 'telotest', label: 'TeloTest™' },
              { id: 'acnetest', label: 'AcneTest™' },
              { id: 'nutrigen', label: 'NutriGen™' },
              { id: 'compounding', label: isEs ? 'Magistral' : 'Compounding' },
            ].map((kind) => {
              const active = (worklistTestFilter || 'all') === kind.id;
              const count = kind.id === 'all'
                ? (Array.isArray(allWorklistItems) ? allWorklistItems.length : 0)
                : (Array.isArray(allWorklistItems) ? allWorklistItems.filter((item) => getWorklistTestKind(item) === kind.id).length : 0);
              return (
                <button
                  key={kind.id}
                  type="button"
                  onClick={() => {
                    if (setWorklistTestFilter) setWorklistTestFilter(kind.id);
                    if (setWorklistPage) setWorklistPage(1);
                  }}
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: active ? 700 : 500,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: active ? '1px solid #1a73e8' : '1px solid #e2e8f0',
                    background: active ? '#e8f0fe' : '#ffffff',
                    color: active ? '#1a73e8' : '#475569',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{kind.label}</span>
                  {count > 0 && (
                    <span style={{ fontSize: '0.62rem', color: active ? '#1a73e8' : '#94a3b8', fontWeight: 700 }}>
                      ({count})
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Unified Single Worklist Table */}
          <div>
            <div
              style={{
                padding: '10px 20px',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#334155',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {isEs ? 'Recetas en Base de Datos' : 'Prescriptions Worklist'}
            </div>

            {paginatedWorklistItems.length === 0 ? (
              <div style={{ padding: '2rem 1.5rem', textAlign: 'center', color: '#64748b' }}>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  {isEs ? 'No hay recetas que coincidan con los filtros activos' : 'No prescriptions match the active filters'}
                </div>
                <div style={{ fontSize: '0.76rem', marginBottom: '12px' }}>
                  {isEs ? 'Prueba cambiando la pestaña de estado o ampliando el rango temporal.' : 'Try switching the status tab or expanding the date range.'}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setWorklistTab('all');
                    setWorklistDateRange('all');
                    setWorklistPage(1);
                  }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: '1px solid #1a73e8',
                    background: '#e8f0fe',
                    color: '#1a73e8',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {isEs ? 'Limpiar filtros' : 'Reset filters'}
                </button>
              </div>
            ) : (
              <DataTable
                columns={[
                  {
                    key: 'patient',
                    label: isEs ? 'Paciente / Código / Fórmula' : 'Patient / Code / Formula',
                    align: 'left',
                    render: (_val, p) => {
                      const cleanCode = sanitizeRecentCode(p.code);
                      const pName = (p.name || p.patientName || '').trim().toLowerCase();
                      const samePatientItems = pName && Array.isArray(allWorklistItems)
                        ? allWorklistItems.filter((item) => (item.name || item.patientName || '').trim().toLowerCase() === pName)
                        : [];
                      const hasMultipleTests = samePatientItems.length > 1;

                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#202124' }}>
                              {p.name || p.patientName || 'Patient'}
                            </span>
                            <span onClick={(e) => e.stopPropagation()}>
                              <CopyableId value={cleanCode} displayValue={`#${p.code}`} />
                            </span>
                          </div>
                          <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                            {p.title || p.treatmentTitle || 'Prescription protocol'}
                          </span>
                          {hasMultipleTests && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const codes = samePatientItems.map((item) => item.code).filter(Boolean);
                                if (handleAddMultipleToQueue && codes.length > 0) {
                                  handleAddMultipleToQueue(codes);
                                  toast.success(
                                    isEs
                                      ? `${codes.length} recetas de ${p.name || p.patientName} añadidas a la cola`
                                      : `Added ${codes.length} prescriptions for ${p.name || p.patientName} to queue`
                                  );
                                }
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '2px 7px',
                                borderRadius: '4px',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                background: '#eff6ff',
                                color: '#1d4ed8',
                                border: '1px solid #bfdbfe',
                                cursor: 'pointer',
                                marginTop: '2px',
                                alignSelf: 'flex-start',
                              }}
                              title={isEs ? 'Cargar todos los tests del paciente en la cola' : 'Queue all tests for this patient'}
                            >
                              <Layers size={11} />
                              {isEs ? `${samePatientItems.length} tests · Añadir todos` : `${samePatientItems.length} tests · Queue all`}
                            </button>
                          )}
                        </div>
                      );
                    },
                  },
                  {
                    key: 'parts',
                    label: isEs ? 'Partes' : 'Parts',
                    align: 'left',
                    render: (_val, p) => {
                      const removedLen = Array.isArray(p.removedParts) ? p.removedParts.length : 0;
                      const activeLabelsLen = Array.isArray(p.pharmacyLabels) && p.pharmacyLabels.length > 0 ? p.pharmacyLabels.length : null;
                      const activePartsLen = Array.isArray(p.parts) && p.parts.length > 0 ? p.parts.length : null;
                      const totalParts = Math.max(
                        1,
                        activeLabelsLen ??
                        activePartsLen ??
                        Math.max(1, Number(
                          p.partsCount ||
                            (Array.isArray(p.formulationBlocks) ? p.formulationBlocks.length : 0) ||
                            (Array.isArray(p.items) ? p.items.length : 0) ||
                            1
                        ) - removedLen)
                      );
                      const labeledCount = p.labeledParts && typeof p.labeledParts === 'object'
                        ? Object.values(p.labeledParts).filter(Boolean).length
                        : 0;
                      const isMulti = totalParts > 1;
                      return (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 8px',
                              borderRadius: '999px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              background: isMulti ? '#e8f0fe' : '#f1f5f9',
                              color: isMulti ? '#1a73e8' : '#475569',
                              border: isMulti ? '1px solid #bfdbfe' : '1px solid #cbd5e1',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <Layers size={11} />
                            <span>
                              {totalParts} {totalParts === 1 ? (isEs ? 'Parte' : 'Part') : (isEs ? 'Partes' : 'Parts')}
                            </span>
                          </span>
                          {labeledCount > 0 && (
                            <span
                              style={{
                                fontSize: '0.66rem',
                                fontWeight: 700,
                                color: '#166534',
                                background: '#dcfce7',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {labeledCount}/{totalParts} ✓
                            </span>
                          )}
                        </div>
                      );
                    },
                  },
                  {
                    key: 'status',
                    label: isEs ? 'Estado' : 'Status',
                    align: 'left',
                    render: (_val, p) => {
                      const cleanCode = sanitizeRecentCode(p.code);
                      const mergedRx = statusOverrides[p.code]
                        ? { ...p, ...statusOverrides[p.code] }
                        : p;
                      return (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <PrescriptionStatusPopover
                            prescription={mergedRx}
                            cleanCode={cleanCode}
                            role={role || 'admin'}
                            isEs={isEs}
                            onUpdated={(_code, nextPrimary, nextAxes) => {
                              setStatusOverrides((prev) => ({
                                ...prev,
                                [p.code]: { status: nextPrimary, ...nextAxes },
                              }));
                            }}
                          />
                          {renderRefillTag(p)}
                        </div>
                      );
                    },
                  },
                  {
                    key: 'printStatus',
                    label: isEs ? 'Impresión / Importado' : 'Print / Imported',
                    align: 'left',
                    render: (_val, p) => {
                      const rawDate = p.importedAt || p.createdAt || p.uploadedAt || p.updatedAt || p.date;
                      const ms = (() => {
                        if (!rawDate) return 0;
                        if (typeof rawDate === 'number') return rawDate;
                        if (typeof rawDate?.toDate === 'function') return rawDate.toDate().getTime();
                        if (typeof rawDate?._seconds === 'number') return rawDate._seconds * 1000;
                        if (typeof rawDate?.seconds === 'number') return rawDate.seconds * 1000;
                        const t = Date.parse(String(rawDate));
                        return Number.isNaN(t) ? 0 : t;
                      })();
                      const dateStr = formatResultDate(rawDate) || (ms > 0
                        ? new Date(ms).toLocaleDateString(isEs ? 'es-ES' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '');
                      const isRecentImport = ms > 0 && (Date.now() - ms) < 24 * 60 * 60 * 1000;
                      const reportDateRaw = p.prescriptionDate || p.date || p.reportDate;
                      const reportDateStr = formatResultDate(reportDateRaw);
                      const showReportDate = reportDateStr && reportDateStr !== dateStr;

                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                            {renderPrintStatusBadge(p.code, p.a4PrintCount)}
                            {isRecentImport && (
                              <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#0f766e', background: '#ccfbf1', padding: '1px 5px', borderRadius: '4px' }}>
                                NEW
                              </span>
                            )}
                          </div>
                          {dateStr && (
                            <span style={{ fontSize: '0.68rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                              {isEs ? 'Importado:' : 'Imported:'} {dateStr}
                            </span>
                          )}
                          {showReportDate && (
                            <span style={{ fontSize: '0.66rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                              {isEs ? 'Informe:' : 'Report:'} {reportDateStr}
                            </span>
                          )}
                        </div>
                      );
                    },
                  },
                  {
                    key: 'actions',
                    label: isEs ? 'Acciones' : 'Actions',
                    align: 'right',
                    render: (_val, p) => {
                      const cleanCode = sanitizeRecentCode(p.code);
                      return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                          <a
                            href={`/rx/${encodeURIComponent(cleanCode)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            title={isEs ? `Ver prescripción #${p.code}` : `Open prescription #${p.code}`}
                            style={{
                              padding: '5px 8px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              background: '#ffffff',
                              color: '#1a73e8',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                            }}
                          >
                            <span>{isEs ? 'Ver Rx' : 'Rx'}</span>
                            <ExternalLink size={11} />
                          </a>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectOrAddPatient(p.code, false);
                              toast.success(isEs ? `#${p.code} añadido a la cola` : `#${p.code} queued`);
                            }}
                            title={isEs ? 'Añadir al lote sin salir de la lista' : 'Add to batch queue'}
                            style={{
                              padding: '5px 8px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              background: '#ffffff',
                              color: '#475569',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                            }}
                          >
                            <Plus size={13} />
                          </button>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              background: '#e8f0fe',
                              color: '#1a73e8',
                              fontSize: '0.73rem',
                              fontWeight: 700,
                            }}
                          >
                            <span>{isEs ? 'Abrir' : 'Open'}</span>
                            <ChevronRight size={13} />
                          </span>
                        </div>
                      );
                    },
                  },
                ]}
                data={paginatedWorklistItems}
                keyField="code"
                globalSearch={false}
                hidePagination={true}
                expandableRender={(row) => (
                  <LabelsRowQuickPreview
                    row={row}
                    cleanCode={sanitizeRecentCode(row.code)}
                    isEs={isEs}
                    onOpenStudio={(code) => handleSelectOrAddPatient(code, true)}
                  />
                )}
                onRowClick={(row) => handleSelectOrAddPatient(row.code, true)}
              />
            )}

            {/* Pagination Footer */}
            {filteredWorklistItems.length > 0 && (
              <div
                style={{
                  padding: '10px 20px',
                  background: '#f8fafc',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  flexWrap: 'wrap',
                  fontSize: '0.74rem',
                  color: '#5f6368',
                }}
              >
                <span>
                  {isEs
                    ? `Mostrando ${(safeWorklistPage - 1) * worklistPageSize + 1}–${Math.min(safeWorklistPage * worklistPageSize, filteredWorklistItems.length)} de ${filteredWorklistItems.length} recetas`
                    : `Showing ${(safeWorklistPage - 1) * worklistPageSize + 1}–${Math.min(safeWorklistPage * worklistPageSize, filteredWorklistItems.length)} of ${filteredWorklistItems.length} prescriptions`}
                </span>

                <div className="pls-worklist-tabs-scroll" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                    <span>{isEs ? 'Filas:' : 'Rows per page:'}</span>
                    <select
                      value={worklistPageSize}
                      onChange={(e) => {
                        setWorklistPageSize(Number(e.target.value));
                        setWorklistPage(1);
                      }}
                      style={{
                        border: '1px solid #cbd5e1',
                        borderRadius: '5px',
                        padding: '3px 6px',
                        background: '#ffffff',
                        fontSize: '0.73rem',
                      }}
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </label>

                  <button
                    type="button"
                    disabled={safeWorklistPage <= 1}
                    onClick={() => setWorklistPage((p) => Math.max(1, p - 1))}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '5px',
                      border: '1px solid #cbd5e1',
                      background: safeWorklistPage <= 1 ? '#f1f5f9' : '#ffffff',
                      color: safeWorklistPage <= 1 ? '#94a3b8' : '#334155',
                      fontWeight: 600,
                      cursor: safeWorklistPage <= 1 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isEs ? 'Anterior' : 'Previous'}
                  </button>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>
                    {safeWorklistPage} / {totalWorklistPages}
                  </span>
                  <button
                    type="button"
                    disabled={safeWorklistPage >= totalWorklistPages}
                    onClick={() => setWorklistPage((p) => Math.min(totalWorklistPages, p + 1))}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '5px',
                      border: '1px solid #cbd5e1',
                      background: safeWorklistPage >= totalWorklistPages ? '#f1f5f9' : '#ffffff',
                      color: safeWorklistPage >= totalWorklistPages ? '#94a3b8' : '#334155',
                      fontWeight: 600,
                      cursor: safeWorklistPage >= totalWorklistPages ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isEs ? 'Siguiente' : 'Next'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
