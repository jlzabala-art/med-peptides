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
  Link2,
  MessageCircle,
  Building2,
  BookOpen,
} from 'lucide-react';
import CopyableId from '@/components/ui/CopyableId';
import StatusBadge from '@/components/ui/StatusBadge';
import DataTable from '@/components/ui/DataTable';
import GlobalSearchBar from '@/components/ui/GlobalSearchBar';
import LabelsRowQuickPreview from './LabelsRowQuickPreview';
import PrescriptionStatusPopover from '@/components/prescription/PrescriptionStatusPopover';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { sanitizeRecentCode, getWorklistTestKind } from '../utils/labelHelpers';

export default function LabelsHomeView({
  isEs,
  searchQuery = '',
  setSearchQuery,
  isSearching = false,
  searchResults = [],
  labelsKpis,
  unprintedCodes,
  handleAddMultipleToQueue,
  worklistTab,
  setWorklistTab,
  worklistTabCounts,
  worklistDateRange,
  setWorklistDateRange,
  worklistCountryFilter = 'all',
  setWorklistCountryFilter,
  worklistCountryCounts = {},
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
  onRefreshWorklist,
}) {
  const { role } = useRoleAccess();
  const [statusOverrides, setStatusOverrides] = useState({});
  const [selectedCodes, setSelectedCodes] = useState([]);
  const [openRowMenuCode, setOpenRowMenuCode] = useState(null);
  const [manualsMenuOpen, setManualsMenuOpen] = useState(false);
  const [sharedRowCodes, setSharedRowCodes] = useState(() => {
    if (typeof window === 'undefined') return {};
    try {
      return JSON.parse(localStorage.getItem('atlas_labels_shared_codes') || '{}');
    } catch {
      return {};
    }
  });

  const markRowShared = (code) => {
    setSharedRowCodes((prev) => {
      const next = { ...prev, [code]: true };
      try {
        localStorage.setItem('atlas_labels_shared_codes', JSON.stringify(next));
      } catch { /* ignore */ }
      return next;
    });
  };

  const buildPatientShareUrl = (row) => {
    const cleanCode = sanitizeRecentCode(row.code);
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.atlashealth-services.com';
    const langParam = isEs ? 'es' : 'en';
    const lotVal = row.lotNumber || row.batchCode || '';
    const budVal = row.bud || row.expDate || '';
    const lotQs = lotVal ? `&lot=${encodeURIComponent(lotVal)}` : '';
    const budQs = budVal ? `&bud=${encodeURIComponent(budVal)}` : '';
    return `${origin}/rx/${encodeURIComponent(cleanCode)}?view=patient&src=shared_link&lang=${langParam}${lotQs}${budQs}`;
  };

  // Group visible worklist rows by patient so each patient appears once in the main table
  const groupedWorklistRows = React.useMemo(() => {
    const seen = new Set();
    const rows = [];
    for (const item of paginatedWorklistItems || []) {
      const key = (item.name || item.patientName || '').trim().toLowerCase() || item.id || item.code;
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push(item);
    }
    return rows;
  }, [paginatedWorklistItems]);

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
            {worklistTabCounts?.unprinted ?? unprintedCodes.length} {isEs ? 'Listas' : 'Ready'}
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
                  <span>{isEs ? 'Crear Rx' : 'Create Rx'}</span>
                </button>
              )}
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setManualsMenuOpen((v) => !v)}
                  title={isEs ? 'Manuales operativos en PDF (EN)' : 'Operations User Manuals (PDF)'}
                  style={{
                    padding: '7px 11px',
                    borderRadius: '6px',
                    border: '1px solid #dadce0',
                    background: manualsMenuOpen ? '#f1f5f9' : '#ffffff',
                    color: '#5f6368',
                    fontSize: '0.75rem',
                    fontWeight: 650,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <BookOpen size={14} color="#5f6368" />
                  <span>{isEs ? 'Manuales ▾' : 'Manuals ▾'}</span>
                </button>
                {manualsMenuOpen && (
                  <div
                    onMouseLeave={() => setManualsMenuOpen(false)}
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 6px)',
                      zIndex: 90,
                      minWidth: '320px',
                      background: '#ffffff',
                      border: '1px solid #dadce0',
                      borderRadius: '8px',
                      boxShadow: '0 8px 24px rgba(15, 23, 42, 0.14)',
                      padding: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                    }}
                  >
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '4px 8px' }}>
                      {isEs ? 'Guías Operativas (PDF · EN)' : 'Operations Manuals (PDF · EN)'}
                    </div>
                    {[
                      {
                        title: '1. Share Treatment Guide via WhatsApp',
                        sub: 'Send patient guide link after parcel delivery',
                        href: '/manuals/Atlas-Labels-Share-User-Manual-EN.pdf',
                      },
                      {
                        title: '2. Print Bottle & Box Labels (Delivery & QR)',
                        sub: 'Lot/BUD, A4/thermal print & SCAN FOR REFILL QR',
                        href: '/manuals/Atlas-Delivery-Labels-QR-Manual-EN.pdf',
                      },
                      {
                        title: '3. Prepare Customs & Courier Labels (Shipping)',
                        sub: 'Domestic UAE & GCC/EU international dispatch',
                        href: '/manuals/Atlas-Shipping-Customs-Manual-EN.pdf',
                      },
                      {
                        title: '4. Import Rx, Update Status & Country Filter',
                        sub: 'Upload Rx, 1-click lifecycle & doctor country filter',
                        href: '/manuals/Atlas-Rx-Intake-Lifecycle-Filters-Manual-EN.pdf',
                      },
                    ].map((m) => (
                      <a
                        key={m.href}
                        href={m.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setManualsMenuOpen(false)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          color: '#202124',
                          fontSize: '0.76rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px',
                        }}
                      >
                        <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span>{m.title}</span>
                          <span style={{ fontSize: '0.68rem', fontWeight: 400, color: '#5f6368' }}>{m.sub}</span>
                        </span>
                        <ExternalLink size={12} color="#1a73e8" style={{ flexShrink: 0 }} />
                      </a>
                    ))}
                  </div>
                )}
              </div>
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

          {/* Prominent Google Cloud Console Command Search Bar (Golden Rule #7) */}
          <div
            style={{
              padding: '14px 20px',
              background: '#ffffff',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <GlobalSearchBar
              namespace="labels"
              searchScope="clinical"
              lang={isEs ? 'es' : 'en'}
              value={searchQuery || ''}
              onChange={(val) => {
                setSearchQuery?.(val);
                setWorklistPage?.(1);
              }}
              isLoading={isSearching}
              resultCount={searchQuery?.trim() ? filteredWorklistItems.length : undefined}
              size="lg"
            />
            {searchQuery?.trim() && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.73rem',
                  color: '#475569',
                  padding: '2px 4px',
                }}
              >
                <span>
                  {isSearching
                    ? (isEs ? 'Buscando en la base de datos...' : 'Searching clinical database...')
                    : filteredWorklistItems.length === 0 && searchResults.length > 0
                      ? (isEs
                          ? `${searchResults.length} resultado(s) en Algolia — haz clic en un resultado para abrirlo`
                          : `${searchResults.length} result(s) found in Algolia — click a result above to open it`)
                      : (isEs
                          ? `Mostrando resultados para: "${searchQuery}" (${filteredWorklistItems.length} encontrados)`
                          : `Showing matches for: "${searchQuery}" (${filteredWorklistItems.length} found)`)}
                </span>
                <button
                  type="button"
                  onClick={() => setSearchQuery?.('')}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#1a73e8',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  {isEs ? 'Limpiar búsqueda' : 'Clear search'}
                </button>
              </div>
            )}
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

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <select
                aria-label={isEs ? 'País del médico' : 'Doctor country'}
                value={worklistCountryFilter}
                onChange={(e) => {
                  setWorklistCountryFilter?.(e.target.value);
                  setWorklistPage(1);
                }}
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: worklistCountryFilter !== 'all' ? '#1a73e8' : '#334155',
                  background: worklistCountryFilter !== 'all' ? '#e8f0fe' : '#ffffff',
                  border: worklistCountryFilter !== 'all' ? '1px solid #bfdbfe' : '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                }}
              >
                <option value="all">{isEs ? 'Todos los países' : 'All countries'}</option>
                {Object.entries(worklistCountryCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([country, cnt]) => {
                    const flag = country === 'UAE' ? '🇦🇪 ' : country === 'Saudi Arabia' ? '🇸🇦 ' : country === 'Qatar' ? '🇶🇦 ' : country === 'Kuwait' ? '🇰🇼 ' : country === 'Spain' ? '🇪🇸 ' : country === 'UK' ? '🇬🇧 ' : country === 'USA' ? '🇺🇸 ' : '🌐 ';
                    return (
                      <option key={country} value={country}>
                        {flag}{country} ({cnt})
                      </option>
                    );
                  })}
              </select>

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
              <>
              {selectedCodes.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    flexWrap: 'wrap',
                    padding: '8px 14px',
                    marginBottom: '8px',
                    borderRadius: '8px',
                    background: '#e8f0fe',
                    border: '1px solid #c2e7ff'
                  }}
                >
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#174ea6' }}>
                    {isEs ? `${selectedCodes.length} seleccionada(s) para lote` : `${selectedCodes.length} selected for batch`}
                  </span>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={async () => {
                        if (handleAddMultipleToQueue) {
                          await handleAddMultipleToQueue(selectedCodes, false);
                        } else {
                          for (const c of selectedCodes) {
                            await handleSelectOrAddPatient(c, false);
                          }
                        }
                        setSelectedCodes([]);
                      }}
                      className="gcp-btn-secondary"
                      style={{ minHeight: '36px', fontSize: '0.74rem', fontWeight: 600 }}
                    >
                      {isEs ? '+ Añadir a Zona de Trabajo' : '+ Add to Workspace'}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (handleAddMultipleToQueue) {
                          await handleAddMultipleToQueue(selectedCodes, true);
                        } else {
                          for (let i = 0; i < selectedCodes.length; i += 1) {
                            await handleSelectOrAddPatient(selectedCodes[i], i === selectedCodes.length - 1);
                          }
                        }
                        setSelectedCodes([]);
                      }}
                      className="gcp-btn-primary"
                      style={{ minHeight: '36px', fontSize: '0.74rem', fontWeight: 700 }}
                    >
                      {isEs ? 'Abrir Lote e Imprimir →' : 'Open Batch & Print →'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCodes([])}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#5f6368',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: '4px 8px'
                      }}
                    >
                      {isEs ? 'Limpiar' : 'Clear'}
                    </button>
                  </div>
                </div>
              )}
              <DataTable
                columns={[
                  {
                    key: 'patient',
                    label: isEs ? 'Paciente / Código / Fórmula' : 'Patient / Code / Formula',
                    align: 'left',
                    width: '34%',
                    render: (_val, p) => {
                      const cleanCode = sanitizeRecentCode(p.code);
                      const isChecked = selectedCodes.includes(cleanCode);
                      const pName = (p.name || p.patientName || '').trim().toLowerCase();
                      const samePatientItems = pName && Array.isArray(allWorklistItems)
                        ? allWorklistItems.filter((item) => (item.name || item.patientName || '').trim().toLowerCase() === pName)
                        : [];
                      const extraCodes = samePatientItems
                        .map((item) => sanitizeRecentCode(item.code))
                        .filter((c) => c && c !== cleanCode);

                      return (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', minWidth: 0 }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            aria-label={isEs ? `Seleccionar ${p.name || cleanCode}` : `Select ${p.name || cleanCode}`}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setSelectedCodes((prev) =>
                                checked ? (prev.includes(cleanCode) ? prev : [...prev, cleanCode]) : prev.filter((x) => x !== cleanCode)
                              );
                            }}
                            style={{ width: '16px', height: '16px', marginTop: '3px', flexShrink: 0, cursor: 'pointer', accentColor: '#1a73e8' }}
                          />
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 }}>
                            <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#202124', lineHeight: 1.25 }}>
                              {p.name || p.patientName || 'Patient'}
                            </span>
                            <span onClick={(e) => e.stopPropagation()} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                              <CopyableId value={cleanCode} displayValue={`#${p.code}`} />
                              {extraCodes.map((ec) => (
                                <CopyableId key={ec} value={ec} displayValue={`#${ec}`} />
                              ))}
                            </span>
                            <span style={{ fontSize: '0.74rem', color: '#64748b', lineHeight: 1.35 }}>
                              {p.title || p.treatmentTitle || 'Prescription protocol'}
                            </span>
                          </div>
                        </div>
                      );
                    },
                  },
                  {
                    key: 'prescriptions',
                    label: isEs ? 'Prescripciones' : 'Prescriptions',
                    width: '10%',
                    align: 'left',
                    render: (_val, p) => {
                      const pName = (p.name || p.patientName || '').trim().toLowerCase();
                      const samePatientItems = pName && Array.isArray(allWorklistItems)
                        ? allWorklistItems.filter((item) => (item.name || item.patientName || '').trim().toLowerCase() === pName)
                        : [];
                      const rxCount = Math.max(1, samePatientItems.length);
                      const isMultiRx = rxCount > 1;
                      return (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 9px',
                              borderRadius: '999px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              background: isMultiRx ? '#f3e8fd' : '#f1f5f9',
                              color: isMultiRx ? '#7c3aed' : '#475569',
                              border: isMultiRx ? '1px solid #e9d5ff' : '1px solid #cbd5e1',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <Layers size={11} />
                            <span>
                              {rxCount} {rxCount === 1 ? (isEs ? 'Prescripción' : 'Rx') : (isEs ? 'Prescripciones' : 'Rx')}
                            </span>
                          </span>
                          {isMultiRx && (
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
                                gap: '3px',
                                padding: '3px 7px',
                                borderRadius: '6px',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                background: '#eff6ff',
                                color: '#1d4ed8',
                                border: '1px solid #bfdbfe',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                              }}
                              title={isEs ? 'Cargar todas las prescripciones del paciente en la cola' : 'Queue all prescriptions for this patient'}
                            >
                              <span>{isEs ? 'Queue all' : 'Queue all'}</span>
                            </button>
                          )}
                        </div>
                      );
                    },
                  },
                  {
                    key: 'status',
                    label: isEs ? 'Estado' : 'Status',
                    align: 'left',
                    width: '16%',
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
                    width: '14%',
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
                      const hasShippingConfigured = Boolean(
                        p.shippingTitle ||
                        p.legacyShippingApplied ||
                        (Array.isArray(p.items) && p.items.some((it) => it?.shippingTitle || it?.legacyShippingApplied))
                      );
                      const hasPdf = Boolean(p.cloudStoragePath || p.cloudStorageUri || p.pdfUrl);

                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '3px' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                            {renderPrintStatusBadge(p.code, p.a4PrintCount)}
                            {isRecentImport && (
                              <span style={{ fontSize: '0.60rem', fontWeight: 800, color: '#0f766e', background: '#ccfbf1', padding: '1px 5px', borderRadius: '4px' }}>
                                NEW
                              </span>
                            )}
                            {hasShippingConfigured && (
                              <span
                                style={{ fontSize: '0.60rem', fontWeight: 700, color: '#174ea6', background: '#e8f0fe', padding: '1px 5px', borderRadius: '4px' }}
                                title={isEs ? 'Etiqueta de Shipping configurada (Legacy)' : 'Shipping label configured (Legacy)'}
                              >
                                Legacy ✓
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', fontSize: '0.68rem', color: '#64748b' }}>
                            {dateStr && <span style={{ whiteSpace: 'nowrap' }}>{dateStr}</span>}
                            {hasPdf && (
                              <span style={{ fontSize: '0.60rem', fontWeight: 700, color: '#047857', background: '#ecfdf5', padding: '0 4px', borderRadius: '3px', border: '1px solid #a7f3d0' }}>
                                PDF ✓
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    },
                  },
                  {
                    key: 'actions',
                    label: isEs ? 'Acciones' : 'Actions',
                    align: 'right',
                    width: '26%',
                    render: (_val, p) => {
                      const cleanCode = sanitizeRecentCode(p.code);
                      const isMenuOpen = openRowMenuCode === p.code;
                      const wasShared = Boolean(sharedRowCodes[cleanCode] || sharedRowCodes[p.code]);
                      const patientUrl = buildPatientShareUrl(p);
                      const pName = p.name || p.patientName || '';
                      const rawPhone = String(p.patientPhone || p.phone || p.patient?.phone || '').replace(/[^\d]/g, '');

                      const rowIdx = paginatedWorklistItems.findIndex((item) => item.code === p.code);
                      const openUpward = rowIdx >= Math.max(2, paginatedWorklistItems.length - 2);

                      return (
                        <div className="gcp-actions-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', position: 'relative', paddingRight: '4px' }}>
                          <style>{`
                            @media (max-width: 768px) {
                              .gcp-actions-wrap {
                                width: 100%;
                                justify-content: stretch !important;
                                padding-right: 0 !important;
                              }
                              .gcp-actions-capsule {
                                display: grid !important;
                                grid-template-columns: repeat(2, minmax(0, 1fr));
                                width: 100%;
                                overflow: visible !important;
                              }
                              .gcp-actions-capsule > *,
                              .gcp-actions-capsule > div > button {
                                min-height: 44px !important;
                                justify-content: center !important;
                                width: 100%;
                                font-size: 0.78rem !important;
                              }
                              .gcp-share-popover {
                                position: static !important;
                                grid-column: 1 / -1;
                                width: 100% !important;
                                min-width: 0 !important;
                                margin-top: 6px;
                                box-shadow: none !important;
                              }
                            }
                          `}</style>
                          {/* GCP 4-in-1 Segmented Action Capsule: [ Share ▾ | Rx ↗ | Delivery | Shipping ] */}
                          <div
                            className="gcp-actions-capsule"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'stretch',
                              border: '1px solid #dadce0',
                              borderRadius: '6px',
                              background: '#ffffff',
                              position: 'relative',
                              overflow: 'visible',
                              flexShrink: 0,
                            }}
                          >
                            <div style={{ position: 'relative', display: 'flex' }}>
                              <button
                                type="button"
                                className="gcp-btn-secondary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenRowMenuCode(isMenuOpen ? null : p.code);
                                }}
                                title={
                                  wasShared
                                    ? (isEs ? 'Enlace ya compartido · Abrir menú' : 'Link shared · Open menu')
                                    : (isEs ? 'Compartir enlace con paciente o clínica' : 'Share link with patient or clinic')
                                }
                                style={{
                                  padding: '4px 7px',
                                  border: 'none',
                                  borderRight: '1px solid #e2e8f0',
                                  borderRadius: '5px 0 0 5px',
                                  background: isMenuOpen ? '#e8f0fe' : wasShared ? '#f0fdf4' : 'transparent',
                                  color: isMenuOpen ? '#1a73e8' : wasShared ? '#15803d' : '#3c4043',
                                  fontSize: '0.69rem',
                                  fontWeight: 650,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                <span>{wasShared ? (isEs ? 'Enviado ✓ ▾' : 'Sent ✓ ▾') : (isEs ? 'Enviar ▾' : 'Share ▾')}</span>
                              </button>

                              {isMenuOpen && (
                                <div
                                  className="gcp-share-popover"
                                  onClick={(e) => e.stopPropagation()}
                                  style={{
                                    position: 'absolute',
                                    left: 0,
                                    ...(openUpward ? { bottom: 'calc(100% + 4px)' } : { top: 'calc(100% + 4px)' }),
                                    zIndex: 80,
                                    minWidth: '210px',
                                    background: '#ffffff',
                                    border: '1px solid #dadce0',
                                    borderRadius: '8px',
                                    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.14)',
                                    padding: '6px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '2px',
                                    textAlign: 'left',
                                  }}
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (typeof navigator !== 'undefined' && navigator.clipboard) {
                                        navigator.clipboard.writeText(patientUrl);
                                      }
                                      markRowShared(cleanCode);
                                      setOpenRowMenuCode(null);
                                      toast.success(isEs ? 'Link de paciente copiado ✓' : 'Patient link copied ✓');
                                    }}
                                    style={{
                                      padding: '8px 10px',
                                      minHeight: '36px',
                                      borderRadius: '6px',
                                      border: 'none',
                                      background: 'transparent',
                                      color: '#202124',
                                      fontSize: '0.75rem',
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                      textAlign: 'left',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                    }}
                                  >
                                    <Link2 size={14} color="#5f6368" />
                                    <span>{isEs ? 'Copiar Link Paciente' : 'Copy Patient Link'}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.color = '#15803d';
                                      e.currentTarget.style.background = '#f0fdf4';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.color = '#202124';
                                      e.currentTarget.style.background = 'transparent';
                                    }}
                                    onClick={() => {
                                      const msg = isEs
                                        ? `Hola ${pName}, gracias por confiar en Atlas Health. Aquí tienes tu guía privada de tratamiento (#${cleanCode}) con instrucciones y refill en 1 clic: ${patientUrl}`
                                        : `Hi ${pName}, thank you for trusting Atlas Health. Here is your private treatment guide (#${cleanCode}) with instructions & 1-click refill: ${patientUrl}`;
                                      const waBase = rawPhone ? `https://wa.me/${rawPhone}` : 'https://wa.me/';
                                      window.open(`${waBase}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
                                      markRowShared(cleanCode);
                                      setOpenRowMenuCode(null);
                                    }}
                                    style={{
                                      padding: '8px 10px',
                                      minHeight: '36px',
                                      borderRadius: '6px',
                                      border: 'none',
                                      background: 'transparent',
                                      color: '#202124',
                                      fontSize: '0.75rem',
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                      textAlign: 'left',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      transition: 'all 0.15s ease',
                                    }}
                                  >
                                    <MessageCircle size={14} color="currentColor" />
                                    <span>{isEs ? 'WhatsApp al Paciente' : 'WhatsApp to Patient'}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const msg = isEs
                                        ? `Hola, compartimos el enlace de seguimiento y refill para ${pName} (#${cleanCode}) para su revisión/reenvío: ${patientUrl}`
                                        : `Hi, here is the treatment guide & refill link for ${pName} (#${cleanCode}) for your review/forwarding: ${patientUrl}`;
                                      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
                                      markRowShared(cleanCode);
                                      setOpenRowMenuCode(null);
                                    }}
                                    style={{
                                      padding: '8px 10px',
                                      minHeight: '36px',
                                      borderRadius: '6px',
                                      border: 'none',
                                      background: 'transparent',
                                      color: '#202124',
                                      fontSize: '0.75rem',
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                      textAlign: 'left',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                    }}
                                  >
                                    <Building2 size={14} color="#5f6368" />
                                    <span>{isEs ? 'Enviar a Partner / Clínica' : 'Send to Partner / Clinic'}</span>
                                  </button>
                                </div>
                              )}
                            </div>

                            <a
                              href={`/rx/${encodeURIComponent(cleanCode)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              title={isEs ? `Ver prescripción #${p.code}` : `View prescription #${p.code}`}
                              style={{
                                padding: '4px 6px',
                                borderRight: '1px solid #e2e8f0',
                                background: 'transparent',
                                color: '#1a73e8',
                                fontSize: '0.69rem',
                                fontWeight: 700,
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '2px',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <span>Rx</span>
                              <ExternalLink size={10} />
                            </a>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectOrAddPatient(p.code, true, 'backQr');
                              }}
                              title={isEs ? 'Etiqueta Delivery (Clínica)' : 'Delivery Label (Clinical)'}
                              style={{
                                padding: '4px 6px',
                                border: 'none',
                                borderRight: '1px solid #e2e8f0',
                                background: 'transparent',
                                color: '#3c4043',
                                fontSize: '0.69rem',
                                fontWeight: 650,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {isEs ? 'Delivery' : 'Delivery'}
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectOrAddPatient(p.code, true, 'shipping');
                              }}
                              title={isEs ? 'Etiqueta Shipping (Aduanas)' : 'Shipping Label (Customs)'}
                              style={{
                                padding: '4px 7px',
                                border: 'none',
                                borderRadius: '0 5px 5px 0',
                                background: 'transparent',
                                color: '#3c4043',
                                fontSize: '0.69rem',
                                fontWeight: 650,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {isEs ? 'Shipping' : 'Shipping'}
                            </button>
                          </div>
                        </div>
                      );
                    },
                  },
                ]}
                data={groupedWorklistRows}
                keyField="code"
                globalSearch={false}
                hidePagination={true}
                expandableRender={(row) => {
                  const pName = (row.name || row.patientName || '').trim().toLowerCase();
                  const samePatientItems = pName && Array.isArray(allWorklistItems)
                    ? allWorklistItems.filter((item) => (item.name || item.patientName || '').trim().toLowerCase() === pName)
                    : [row];
                  return (
                    <LabelsRowQuickPreview
                      row={row}
                      patientPrescriptions={samePatientItems.length > 0 ? samePatientItems : [row]}
                      cleanCode={sanitizeRecentCode(row.code)}
                      isEs={isEs}
                      onOpenStudio={(code) => handleSelectOrAddPatient(code, true)}
                      onRefreshWorklist={onRefreshWorklist}
                    />
                  );
                }}
                onRowClick={(row) => handleSelectOrAddPatient(row.code, true)}
              />
              </>
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
