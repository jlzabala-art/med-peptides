'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import toast from 'react-hot-toast';
import './labels-studio.css';
import { useSearchParams } from 'next/navigation';
import PharmacyLabelsModal from '@/components/prescription/PharmacyLabelsModal';
import ImportPrescriptionModal from '@/features/prescriptions/components/ImportPrescriptionModal';
import PrescriptionRefillModal from '@/components/prescription/PrescriptionRefillModal';
import LabelsHeader from './components/LabelsHeader';
import LabelsSearchDropdown from './components/LabelsSearchDropdown';
import LabelsBatchBar from './components/LabelsBatchBar';
import LabelsMetaStrip from './components/LabelsMetaStrip';
import LabelsPreflightBar from './components/LabelsPreflightBar';
import LabelsOffscreenRenderer from './components/LabelsOffscreenRenderer';
import LabelsWorkspaceSkeleton from './components/LabelsWorkspaceSkeleton';
import LabelsErrorBoundary from './components/LabelsErrorBoundary';
import LabelsAtlasDock from './components/LabelsAtlasDock';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import {
  Search,
  Database,
  ShieldCheck,
  Clock,
  ChevronRight,
  Upload,
  Printer,
  Layers,
  Plus
} from '@/lib/icons';
import { useAuth } from '@/context/AuthContext';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/firebase';
import { trackToolUsage } from '@/hooks/useAnalytics';
import {
  FEATURED_PATIENTS,
  sanitizeRecentCode,
  getDoctorSlug,
  formatResultDate
} from './utils/labelHelpers';
import { useWorkstationPrefs } from './hooks/useWorkstationPrefs';
import { useLabelsWorklist } from './hooks/useLabelsWorklist';
import { useLabelsQueue } from './hooks/useLabelsQueue';
import { useBatchExport } from './hooks/useBatchExport';

export default function PublicLabelsAppClient({
  initialRx = null,
  initialLabels = [],
  initialCode = '',
  initialQueue = [],
  initialEditMode = false,
  initialLabelIndex = 0,
  initialLang = 'en',
  embedded = false
}) {
  const searchParams = useSearchParams();
  const { user, userProfile } = useAuth();
  const { prefs, updatePref } = useWorkstationPrefs();

  const [lang, setLang] = useState(initialLang || 'en');
  const isEs = lang === 'es';
  const [isEditing, setIsEditing] = useState(
    Boolean(initialEditMode || prefs.preferredEditMode)
  );
  const [showImport, setShowImport] = useState(false);
  const [showRefillModal, setShowRefillModal] = useState(false);
  const [refillPresetPartIndex, setRefillPresetPartIndex] = useState(null);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [copyCodeSuccess, setCopyCodeSuccess] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [copiedShareType, setCopiedShareType] = useState(null);

  const searchBoxRef = useRef(null);
  const searchInputRef = useRef(null);

  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    searchOpen,
    setSearchOpen,
    highlightedIndex,
    setHighlightedIndex,
    recentPrescriptions,
    setRecentPrescriptions,
    worklistTab,
    setWorklistTab,
    labelsKpis,
    setLabelsKpis,
    printCountsMap,
    setPrintCountsMap,
    printDetailsMap,
    setPrintDetailsMap,
    handleClearRecent
  } = useLabelsWorklist();

  const {
    patientQueue,
    setPatientQueue,
    activeQueueIndex,
    currentRx,
    labels,
    setLabels,
    activeCode,
    labelIndex,
    setLabelIndex,
    isLoadingRx,
    isApprovingRx,
    isBatchApproving,
    labeledMap,
    updateUrlWithQueue,
    handleSelectOrAddPatient,
    handleAddMultipleToQueue,
    handleSwitchActivePatient,
    handleRemoveFromQueue,
    handleUpdatePatientConfig,
    handleBatchUpdateLotBud,
    handleToggleLabeled,
    handleApprovePrescription,
    handleBatchApprove
  } = useLabelsQueue({
    initialRx,
    initialLabels,
    initialCode,
    initialQueue,
    initialLabelIndex,
    lang,
    isEs,
    user,
    userProfile,
    setSearchOpen,
    setRecentPrescriptions
  });

  const {
    isGeneratingBatchPdf,
    batchPdfProgress,
    handleDownloadA4BatchPdf,
    handleDownloadZplBatch,
    handleDownloadPackingListPdf
  } = useBatchExport({
    patientQueue,
    startOffset: prefs.startOffset || 0,
    isEs,
    user,
    userProfile,
    zplDpi: prefs.zplDpi || 203,
    setPrintCountsMap,
    setPrintDetailsMap,
    setLabelsKpis
  });

  const setStartOffset = (val) => updatePref('startOffset', Number(val) || 0);

  const patientName = currentRx?.patient?.name || currentRx?.patientName || 'Patient';
  const rxCode = currentRx?.fileNumber || currentRx?.code || activeCode;
  const cleanRxCode = String(rxCode || '').replace(/^#/, '').trim();
  const docName = currentRx?.doctorName || currentRx?.physician || currentRx?.doctor?.name || currentRx?.treatingDoctor?.name || 'Dr. Marina Cordeiro Fernandes';
  const doctorSlug = getDoctorSlug(currentRx, docName);

  const isPartLabeled = (code, partIdx) => {
    const clean = String(code || '').trim().toUpperCase();
    return Boolean(labeledMap[`${clean}-${partIdx}`]);
  };

  const isPatientFullyLabeled = (pItem) => {
    const code = String(pItem?.rx?.fileNumber || pItem?.rx?.code || pItem?.code || '').trim().toUpperCase();
    const total = Array.isArray(pItem?.labels) && pItem.labels.length > 0 ? pItem.labels.length : 1;
    for (let i = 0; i < total; i++) {
      if (!labeledMap[`${code}-${i}`]) return false;
    }
    return true;
  };

  const totalBatchLabelsCount = useMemo(() => {
    return patientQueue.reduce((acc, pItem) => {
      const count = (pItem.selectedPartIndex != null && pItem.selectedPartIndex !== 'all')
        ? 1
        : (Array.isArray(pItem.labels) && pItem.labels.length > 0 ? pItem.labels.length : 1);
      return acc + count;
    }, 0);
  }, [patientQueue]);

  const totalLabeledCount = useMemo(() => {
    return patientQueue.reduce((acc, pItem) => {
      const code = String(pItem.rx?.fileNumber || pItem.rx?.code || pItem.code || '').trim().toUpperCase();
      const total = Array.isArray(pItem.labels) && pItem.labels.length > 0 ? pItem.labels.length : 1;
      const indices = (pItem.selectedPartIndex != null && pItem.selectedPartIndex !== 'all')
        ? [Number(pItem.selectedPartIndex)]
        : Array.from({ length: total }, (_, i) => i);
      return acc + indices.filter((i) => labeledMap[`${code}-${i}`]).length;
    }, 0);
  }, [patientQueue, labeledMap]);

  // Auto-open Refill Modal when accessed via ?refill=true
  useEffect(() => {
    if (searchParams?.get('refill') === 'true' && currentRx) {
      setShowRefillModal(true);
    }
  }, [searchParams, currentRx]);

  // Track studio usage on mount
  useEffect(() => {
    if (user?.uid) {
      try {
        const userRef = doc(db, 'users', user.uid);
        updateDoc(userRef, {
          'usageStats.labelStudioVisits': increment(1),
          'usageStats.lastLabelStudioAt': new Date().toISOString(),
          lastActiveAt: new Date().toISOString()
        }).catch(() => {});
      } catch { /* ignore */ }
      trackToolUsage('pharmapolis_labels_studio', {
        userId: user.uid,
        email: user.email,
        timestamp: new Date().toISOString()
      });
    }
  }, [user]);

  // Close search dropdown on outside click
  useEffect(() => {
    const onOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [setSearchOpen]);

  // Global Keyboard Shortcuts (⌘K, ←/→ or [/], Alt+↑/↓, ⌘P, E, Space, ?)
  useEffect(() => {
    const onKeyDown = (e) => {
      const tag = (e.target?.tagName || '').toLowerCase();
      const isInputFocused = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target?.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        searchInputRef.current?.focus();
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'p' && patientQueue.length > 0) {
        e.preventDefault();
        handleDownloadA4BatchPdf();
        return;
      }

      if (isInputFocused) return;

      if (e.key === '?') {
        e.preventDefault();
        setShowShortcutsModal((v) => !v);
        return;
      }

      if (patientQueue.length === 0) return;

      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        setIsEditing((prev) => {
          const next = !prev;
          updatePref('preferredEditMode', next);
          return next;
        });
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        handleToggleLabeled(cleanRxCode || activeCode, labelIndex);
      } else if (e.key === 'ArrowRight' || e.key === ']') {
        if (labels.length > 1) {
          e.preventDefault();
          const nextIdx = (labelIndex + 1) % labels.length;
          setLabelIndex(nextIdx);
          updateUrlWithQueue(patientQueue, activeQueueIndex, nextIdx);
        }
      } else if (e.key === 'ArrowLeft' || e.key === '[') {
        if (labels.length > 1) {
          e.preventDefault();
          const prevIdx = (labelIndex - 1 + labels.length) % labels.length;
          setLabelIndex(prevIdx);
          updateUrlWithQueue(patientQueue, activeQueueIndex, prevIdx);
        }
      } else if (e.altKey && e.key === 'ArrowDown') {
        if (patientQueue.length > 1) {
          e.preventDefault();
          handleSwitchActivePatient((activeQueueIndex + 1) % patientQueue.length);
        }
      } else if (e.altKey && e.key === 'ArrowUp') {
        if (patientQueue.length > 1) {
          e.preventDefault();
          handleSwitchActivePatient((activeQueueIndex - 1 + patientQueue.length) % patientQueue.length);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    patientQueue,
    activeQueueIndex,
    labels.length,
    labelIndex,
    cleanRxCode,
    activeCode,
    handleDownloadA4BatchPdf,
    handleToggleLabeled,
    handleSwitchActivePatient,
    setLabelIndex,
    setSearchOpen,
    updatePref,
    updateUrlWithQueue
  ]);

  // Search keyboard + barcode/QR scanner Enter auto-add
  const handleKeyDownSearch = (e) => {
    const items = searchQuery.trim()
      ? searchResults
      : (recentPrescriptions.length > 0 ? recentPrescriptions : FEATURED_PATIENTS);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSearchOpen(true);
      setHighlightedIndex(prev => (prev < items.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSearchOpen(true);
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : items.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && items[highlightedIndex]) {
        handleSelectOrAddPatient(items[highlightedIndex].code, true);
        setSearchOpen(false);
        setHighlightedIndex(-1);
      } else if (searchQuery.trim()) {
        // Barcode/QR scanner or direct code entry: pick exact match, single result, or direct code
        const q = searchQuery.trim().toUpperCase();
        const exact = searchResults.find(
          (r) => String(r.code).toUpperCase() === q || String(r.fileNumber || '').toUpperCase() === q
        );
        const targetCode = exact?.code || (searchResults.length === 1 ? searchResults[0].code : searchQuery.trim());
        handleSelectOrAddPatient(targetCode, true);
        setSearchOpen(false);
        setHighlightedIndex(-1);
      }
    } else if (e.key === 'Escape') {
      setSearchOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const getShareUrl = () => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/labels?rx=${encodeURIComponent(activeCode)}&phase=${labelIndex + 1}&edit=${isEditing}&lang=${lang}`;
  };

  const handleShareType = async (type = 'active') => {
    if (typeof window === 'undefined') return;
    const origin = window.location.origin;
    let url = '';
    let title = '';
    let text = '';

    if (type === 'clean') {
      url = `${origin}/labels`;
      title = 'Compounding Label Studio • Atlas Health';
      text = isEs ? '🏷️ Atlas Compounding Studio — Espacio de trabajo.' : '🏷️ Atlas Compounding Studio — Compounding workspace.';
    } else if (type === 'batch') {
      if (!patientQueue.length) return;
      const allCodes = patientQueue.map(p => p.code).filter(Boolean).join(',');
      url = `${origin}/labels?rx=${encodeURIComponent(allCodes)}&lang=${lang}`;
      const names = patientQueue.map(p => p.rx?.patientName || p.code).join(', ');
      title = `Atlas Compounding Studio • ${patientQueue.length} ${isEs ? 'Prescripciones' : 'Prescriptions'}`;
      text = `🏷️ Atlas Compounding Studio • ${names}`;
    } else {
      url = getShareUrl();
      const currentLabel = labels[labelIndex] || {};
      const formulaTitle = currentLabel.productTitle || currentLabel.productName || currentRx?.treatmentTitle || 'Compounded Formula';
      title = `${patientName} • #${rxCode} Compounding Label`;
      text = `🏷️ ${patientName} • #${rxCode} • ${formulaTitle}`;
    }

    if (navigator?.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setCopiedShareType(type);
        setCopiedShareLink(true);
        toast.success(isEs ? 'Enlace copiado al portapapeles' : 'Link copied to clipboard');
        setTimeout(() => {
          setCopiedShareType(null);
          setCopiedShareLink(false);
        }, 2500);
      } catch { /* ignore */ }
    }
  };

  const handleCopyCode = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(rxCode);
      setCopyCodeSuccess(true);
      setTimeout(() => setCopyCodeSuccess(false), 2000);
    }
  };

  // Worklist items (real Firestore latest prescriptions, fallback to FEATURED_PATIENTS only if empty)
  const worklistSource = useMemo(() => {
    return (searchResults.length > 0 && !searchQuery.trim()) ? searchResults : FEATURED_PATIENTS;
  }, [searchResults, searchQuery]);

  const filterWorklistItem = (item) => {
    const pCode = sanitizeRecentCode(item.code).toUpperCase();
    const count = printCountsMap[pCode] ?? printCountsMap[String(item.code).toUpperCase()] ?? item.a4PrintCount ?? 0;
    const isPendingApproval = (item.status && item.status !== 'approved' && !item.isSigned);
    if (worklistTab === 'unprinted') return count === 0;
    if (worklistTab === 'pending_approval') return isPendingApproval;
    if (worklistTab === 'printed') return count === 1;
    if (worklistTab === 'reprint') return count > 1;
    return true;
  };

  const unprintedCodes = useMemo(() => {
    return worklistSource
      .filter((item) => {
        const pCode = sanitizeRecentCode(item.code).toUpperCase();
        const count = printCountsMap[pCode] ?? printCountsMap[String(item.code).toUpperCase()] ?? item.a4PrintCount ?? 0;
        return count === 0;
      })
      .map((item) => item.code)
      .slice(0, 12);
  }, [worklistSource, printCountsMap]);

  const renderPrintStatusBadge = (code, fallbackCount = 0) => {
    const pCode = sanitizeRecentCode(code).toUpperCase();
    const printCount = printCountsMap[pCode] ?? printCountsMap[String(code).toUpperCase()] ?? fallbackCount ?? 0;
    const detail = printDetailsMap[pCode] || printDetailsMap[String(code).toUpperCase()];
    const auditTip = detail?.lastPrintedAt
      ? `${isEs ? 'Última imp.' : 'Last printed'}: ${formatResultDate(detail.lastPrintedAt) || detail.lastPrintedAt}${detail.lastPrintedBy ? ` · ${detail.lastPrintedBy}` : ''}`
      : '';

    if (printCount === 0) {
      return (
        <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#64748b', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '1px 6px', borderRadius: '4px' }}>
          ○ {isEs ? 'Pendiente' : 'Unprinted'}
        </span>
      );
    }
    if (printCount === 1) {
      return (
        <span
          title={auditTip || (isEs ? 'Etiqueta original emitida (1 vez)' : 'Original label issued (1 time)')}
          style={{ fontSize: '0.68rem', fontWeight: 700, color: '#137333', background: '#e6f4ea', border: '1px solid #ceead6', padding: '1px 6px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
        >
          🖨️ {isEs ? 'Impresa (1×)' : 'Printed (1×)'}
        </span>
      );
    }
    return (
      <span
        title={auditTip || (isEs ? `Reimpresión #${printCount}` : `Reprint #${printCount}`)}
        style={{ fontSize: '0.68rem', fontWeight: 800, color: '#9a3412', background: '#fff7ed', border: '1px solid #fed7aa', padding: '1px 7px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
      >
        🔁 {isEs ? `Reimpresión #${printCount}` : `Reprint #${printCount}`}
      </span>
    );
  };

  const hasPendingApprovalsInQueue = patientQueue.some(
    p => (p.rx?.status || p.rx?.state) !== 'approved' && !p.rx?.isSigned
  );
  const showBatchBar = patientQueue.length >= 2 || hasPendingApprovalsInQueue;

  return (
    <div
      className="public-label-studio-root"
      style={embedded ? {
        minHeight: 'calc(100vh - 68px)',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
      } : undefined}
    >
      <LabelsHeader
        searchBoxRef={searchBoxRef}
        searchInputRef={searchInputRef}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchOpen={searchOpen}
        setSearchOpen={setSearchOpen}
        isEs={isEs}
        lang={lang}
        setLang={setLang}
        isGeneratingBatchPdf={isGeneratingBatchPdf}
        batchPdfProgress={batchPdfProgress}
        patientQueue={patientQueue}
        onDownloadA4BatchPdf={handleDownloadA4BatchPdf}
        startOffset={prefs.startOffset || 0}
        setStartOffset={setStartOffset}
        onOpenImport={() => setShowImport(true)}
        onShare={() => handleShareType('active')}
        onShareType={handleShareType}
        copiedShareLink={copiedShareLink}
        copiedShareType={copiedShareType}
        activeCode={activeCode}
        patientName={patientName}
        onKeyDownSearch={handleKeyDownSearch}
        embedded={embedded}
      >
        <LabelsSearchDropdown
          searchQuery={searchQuery}
          isSearching={isSearching}
          searchResults={searchResults}
          recentPrescriptions={recentPrescriptions}
          featuredPatients={FEATURED_PATIENTS}
          patientQueue={patientQueue}
          onSelectPatient={handleSelectOrAddPatient}
          onClearRecent={handleClearRecent}
          onOpenImport={() => setShowImport(true)}
          formatResultDate={formatResultDate}
          isEs={isEs}
          highlightedIndex={highlightedIndex}
        />
      </LabelsHeader>

      {/* Show Batch Bar when multi-patient batch is active or approvals are pending */}
      {showBatchBar && (
        <LabelsBatchBar
          patientQueue={patientQueue}
          activeQueueIndex={activeQueueIndex}
          activeLabelIndex={labelIndex}
          totalBatchLabelsCount={totalBatchLabelsCount}
          onSwitchActivePatient={handleSwitchActivePatient}
          onRemoveFromQueue={handleRemoveFromQueue}
          onUpdatePatientQueueItem={handleUpdatePatientConfig}
          onBatchApprove={handleBatchApprove}
          isBatchApproving={isBatchApproving}
          totalLabeledCount={totalLabeledCount}
          isPatientFullyLabeled={isPatientFullyLabeled}
          onBatchUpdateLotBud={handleBatchUpdateLotBud}
          isEs={isEs}
        />
      )}

      {patientQueue.length > 0 && (
        <LabelsMetaStrip
          isEs={isEs}
          patientName={patientName}
          cleanRxCode={cleanRxCode}
          rxCode={rxCode}
          copyCodeSuccess={copyCodeSuccess}
          onCopyCode={handleCopyCode}
          doctorSlug={doctorSlug}
          docName={docName}
          labels={labels}
          labelIndex={labelIndex}
          rxStatus={currentRx?.status || currentRx?.state || 'approved'}
          isApproving={isApprovingRx}
          onApprovePrescription={handleApprovePrescription}
          isCurrentLabeled={isPartLabeled(cleanRxCode || activeCode, labelIndex)}
          onToggleLabeled={() => handleToggleLabeled(cleanRxCode || activeCode, labelIndex)}
          onSelectLabelPart={(idx) => {
            setLabelIndex(idx);
            updateUrlWithQueue(patientQueue, activeQueueIndex, idx);
          }}
          onQuickSearchPatient={() => {
            setSearchQuery(patientName);
            setSearchOpen(true);
            searchInputRef.current?.focus();
          }}
          onOpenRefillModal={(partIdx) => {
            setRefillPresetPartIndex(typeof partIdx === 'number' ? partIdx : labelIndex);
            setShowRefillModal(true);
          }}
        />
      )}

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: '48px' }}>
        {patientQueue.length === 0 ? (
          <div className="pls-gcp-home">
            {/* 4 Clinical & Print Audit KPI Metric Cards */}
            <div className="pls-gcp-kpis">
              <div className="pls-gcp-kpi-card">
                <div className="pls-gcp-kpi-top">
                  <span>{isEs ? 'Prescripciones Disponibles' : 'Available Prescriptions'}</span>
                  <Database size={15} color="#1a73e8" />
                </div>
                <div className="pls-gcp-kpi-val">{labelsKpis.totalPrescriptions || 339} {isEs ? 'Recetas' : 'Dossiers'}</div>
                <div className="pls-gcp-kpi-sub">{isEs ? 'Base de datos clínica centralizada' : 'Centralized clinical database'}</div>
              </div>

              <div className="pls-gcp-kpi-card">
                <div className="pls-gcp-kpi-top">
                  <span>{isEs ? 'Pendientes de Imprimir' : 'Pending Print Queue'}</span>
                  <Printer size={15} color="#0d9488" />
                </div>
                <div className="pls-gcp-kpi-val">{unprintedCodes.length} {isEs ? 'Listas' : 'Ready'}</div>
                <div className="pls-gcp-kpi-sub">{isEs ? 'Recetas recientes sin imprimir' : 'Recent unprinted prescriptions'}</div>
              </div>

              <div className="pls-gcp-kpi-card">
                <div className="pls-gcp-kpi-top">
                  <span>{isEs ? 'Etiquetas A4 Impresas' : 'A4 Labels Printed'}</span>
                  <ShieldCheck size={15} color="#16a34a" />
                </div>
                <div className="pls-gcp-kpi-val">{labelsKpis.totalPrintedA4Count ?? 0} {isEs ? 'Impresas' : 'Printed'}</div>
                <div className="pls-gcp-kpi-sub">{isEs ? 'Trazabilidad de impresión por lote' : 'Cumulative A4 batch audit trail'}</div>
              </div>

              <div className="pls-gcp-kpi-card">
                <div className="pls-gcp-kpi-top">
                  <span>{isEs ? 'Cargas Recientes (7 Días)' : 'Ingested (Last 7 Days)'}</span>
                  <Clock size={15} color="#7c3aed" />
                </div>
                <div className="pls-gcp-kpi-val">{labelsKpis.uploadedThisWeek ?? 0} {isEs ? 'Nuevas' : 'New RXs'}</div>
                <div className="pls-gcp-kpi-sub">{isEs ? 'Prescripciones sincronizadas esta semana' : 'Prescriptions ingested this week'}</div>
              </div>
            </div>

            {/* Main 2-Column Worklist & Upload Workspace */}
            <div className="pls-gcp-grid">
              <section className="pls-gcp-card">
                <div className="pls-gcp-card-header">
                  <div>
                    <h2 className="pls-gcp-card-title">
                      <Search size={17} color="#1a73e8" />
                      <span>{isEs ? '1. Cola de Trabajo del Día' : '1. Daily Compounding Worklist'}</span>
                    </h2>
                    <p className="pls-gcp-card-subtitle">
                      {isEs
                        ? 'Selecciona una receta pendiente, escanea su código QR/barras en el buscador o carga todo el lote pendiente en 1 clic.'
                        : 'Click any prescription below, scan a barcode/QR in search, or load all pending prescriptions in 1 click.'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
                          cursor: 'pointer'
                        }}
                      >
                        <Layers size={13} />
                        <span>
                          {isEs
                            ? `Cargar ${unprintedCodes.length} pendientes al lote`
                            : `Queue ${unprintedCodes.length} Unprinted`}
                        </span>
                      </button>
                    )}

                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '5px 9px',
                        fontSize: '0.72rem',
                        fontWeight: 650,
                        color: '#5f6368',
                        background: '#f1f5f9',
                        borderRadius: '6px'
                      }}
                    >
                      <kbd style={{ padding: '1px 5px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 700 }}>⌘K</kbd>
                    </div>
                  </div>
                </div>

                {/* Worklist Filter Tabs */}
                <div style={{
                  padding: '10px 20px',
                  background: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}>
                  {[
                    { id: 'unprinted', labelEs: '○ Pendientes de imprimir', labelEn: '○ Unprinted' },
                    { id: 'pending_approval', labelEs: '⏳ Por aprobar', labelEn: '⏳ Pending Approval' },
                    { id: 'printed', labelEs: '🖨️ Impresas (1×)', labelEn: '🖨️ Printed (1×)' },
                    { id: 'reprint', labelEs: '🔁 Reimpresiones', labelEn: '🔁 Reprints' },
                    { id: 'all', labelEs: 'Todas', labelEn: 'All' }
                  ].map((tab) => {
                    const isTabActive = worklistTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setWorklistTab(tab.id)}
                        style={{
                          border: isTabActive ? '1.5px solid #1a73e8' : '1px solid #cbd5e1',
                          background: isTabActive ? '#e8f0fe' : '#ffffff',
                          color: isTabActive ? '#1a73e8' : '#475569',
                          fontSize: '0.72rem',
                          fontWeight: isTabActive ? 750 : 600,
                          padding: '3px 10px',
                          borderRadius: '16px',
                          cursor: 'pointer'
                        }}
                      >
                        {isEs ? tab.labelEs : tab.labelEn}
                      </button>
                    );
                  })}
                </div>

                {/* Recently Opened */}
                {recentPrescriptions.filter(filterWorklistItem).length > 0 && (
                  <div style={{ borderBottom: '1px solid #dadce0' }}>
                    <div style={{
                      padding: '8px 20px',
                      background: '#f8fafc',
                      borderBottom: '1px solid #f1f3f4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.70rem',
                      fontWeight: 700,
                      color: '#5f6368',
                      textTransform: 'uppercase'
                    }}>
                      <span>{isEs ? 'Consultados Recientemente' : 'Recently Opened'}</span>
                      <button
                        type="button"
                        onClick={handleClearRecent}
                        style={{ border: 'none', background: 'transparent', color: '#1a73e8', fontSize: '0.70rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        {isEs ? 'Limpiar' : 'Clear'}
                      </button>
                    </div>
                    {recentPrescriptions.filter(filterWorklistItem).map((r) => {
                      const dateStr = formatResultDate(r.date || r.createdAt || r.uploadedAt);
                      return (
                        <div
                          key={`recent-${r.code}`}
                          className="pls-gcp-patient-row"
                          onClick={() => handleSelectOrAddPatient(r.code, true)}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#202124' }}>{r.patientName}</span>
                              <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', fontWeight: 700, color: '#1a73e8', background: '#e8f0fe', padding: '1px 7px', borderRadius: '4px' }}>
                                #{sanitizeRecentCode(r.code)}
                              </span>
                              {dateStr && <span style={{ fontSize: '0.70rem', color: '#5f6368' }}>📅 {dateStr}</span>}
                              {renderPrintStatusBadge(r.code, r.a4PrintCount)}
                            </div>
                            <span style={{ fontSize: '0.76rem', color: '#5f6368' }}>{r.title}</span>
                          </div>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '6px', background: '#1a73e8', color: '#ffffff', fontSize: '0.76rem', fontWeight: 650, flexShrink: 0 }}>
                            <span>{isEs ? 'Abrir' : 'Open'}</span>
                            <ChevronRight size={13} />
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Active Worklist Rows */}
                <div>
                  <div style={{
                    padding: '8px 20px',
                    background: '#f8fafc',
                    borderBottom: '1px solid #f1f3f4',
                    fontSize: '0.70rem',
                    fontWeight: 700,
                    color: '#5f6368',
                    textTransform: 'uppercase'
                  }}>
                    {isEs ? 'Recetas en Base de Datos' : 'Prescriptions Worklist'}
                  </div>

                  {worklistSource
                    .filter(p => !recentPrescriptions.some(r => String(r.code).toUpperCase() === String(p.code).toUpperCase()))
                    .filter(filterWorklistItem)
                    .map((p) => {
                      const dateStr = formatResultDate(p.date || p.createdAt || p.uploadedAt);
                      return (
                        <div
                          key={p.code}
                          className="pls-gcp-patient-row"
                          onClick={() => handleSelectOrAddPatient(p.code, true)}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#202124' }}>{p.name || p.patientName}</span>
                              <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', fontWeight: 700, color: '#1a73e8', background: '#e8f0fe', padding: '1px 7px', borderRadius: '4px' }}>
                                #{p.code}
                              </span>
                              {dateStr && <span style={{ fontSize: '0.70rem', color: '#5f6368' }}>📅 {dateStr}</span>}
                              {renderPrintStatusBadge(p.code, p.a4PrintCount)}
                            </div>
                            <span style={{ fontSize: '0.76rem', color: '#5f6368' }}>{p.title || p.treatmentTitle || 'Prescription protocol'}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectOrAddPatient(p.code, false);
                                toast.success(isEs ? `#${p.code} añadido a la cola` : `#${p.code} queued`);
                              }}
                              title={isEs ? 'Añadir al lote sin salir de la lista' : 'Add to batch queue'}
                              style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                            >
                              <Plus size={13} />
                            </button>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '6px', background: '#ffffff', border: '1px solid #dadce0', color: '#1a73e8', fontSize: '0.76rem', fontWeight: 650 }}>
                              <span>{isEs ? 'Abrir' : 'Open'}</span>
                              <ChevronRight size={13} />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </section>

              {/* Step 2: Upload New Prescription */}
              <aside style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="pls-gcp-card">
                  <div className="pls-gcp-card-header">
                    <div>
                      <h2 className="pls-gcp-card-title">
                        <Upload size={17} color="#1a73e8" />
                        <span>{isEs ? '2. ¿Paciente Nuevo? Subir Receta' : '2. New Patient? Upload Prescription'}</span>
                      </h2>
                      <p className="pls-gcp-card-subtitle">
                        {isEs
                          ? 'Sube el PDF o escaneo de la receta para generar automáticamente sus etiquetas.'
                          : 'Upload a prescription PDF or scan to automatically extract formulas and generate labels.'}
                      </p>
                    </div>
                  </div>
                  <div className="pls-gcp-upload-body" style={{ padding: '16px 20px' }}>
                    <button
                      type="button"
                      className="pls-gcp-upload-zone"
                      onClick={() => setShowImport(true)}
                      style={{
                        width: '100%',
                        border: '1.5px dashed #93c5fd',
                        background: '#f8fafd',
                        borderRadius: '8px',
                        padding: '18px 16px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#e8f0fe', color: '#1a73e8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Upload size={18} />
                      </div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#202124' }}>
                        {isEs ? 'Subir Receta (PDF o Escaneo)' : 'Upload Prescription (PDF or Scan)'}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#5f6368', maxWidth: '300px', lineHeight: 1.4 }}>
                        {isEs
                          ? 'Extrae paciente, médico, activos y posología para generar las etiquetas automáticamente.'
                          : 'Automatically extracts patient, physician, actives, and posology to build bottle & shipping labels.'}
                      </div>
                      <span style={{ marginTop: '4px', padding: '7px 14px', fontSize: '0.78rem', fontWeight: 700, color: '#ffffff', background: '#1a73e8', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Upload size={14} />
                        <span>{isEs ? 'Seleccionar archivo...' : 'Select PDF or Image...'}</span>
                      </span>
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        ) : isLoadingRx ? (
          <LabelsWorkspaceSkeleton isEs={isEs} />
        ) : (
          <div id="pls-label-workbench" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <LabelsPreflightBar
              isEs={isEs}
              isEditing={isEditing}
              onToggleEditMode={(val) => {
                setIsEditing(val);
                updatePref('preferredEditMode', val);
              }}
              activeLabel={labels[labelIndex] || {}}
              currentRx={currentRx || {}}
              activeQueueItem={patientQueue[activeQueueIndex] || {}}
              onApplyPreset={(preset) => {
                handleUpdatePatientConfig(activeQueueIndex, {
                  widthMm: preset.widthMm,
                  heightMm: preset.heightMm,
                  variant: preset.variant,
                  selectedPreset: `${preset.widthMm}x${preset.heightMm}`
                });
                toast.success(
                  isEs
                    ? `Formato ${preset.labelEs} (${preset.widthMm}×${preset.heightMm} mm)`
                    : `Applied ${preset.labelEn} (${preset.widthMm}×${preset.heightMm} mm)`
                );
              }}
              onAutoFitOverflow={(scale) => {
                handleUpdatePatientConfig(activeQueueIndex, { fontScale: scale });
                toast.success(isEs ? `Fuente auto-ajustada (${Math.round(scale * 100)}%)` : `Font auto-fitted (${Math.round(scale * 100)}%)`);
              }}
              onDownloadZplBatch={handleDownloadZplBatch}
              onDownloadPackingListPdf={handleDownloadPackingListPdf}
              onOpenShortcuts={() => setShowShortcutsModal(true)}
            />

            <LabelsErrorBoundary isEs={isEs}>
              <PharmacyLabelsModal
                key={activeCode}
                isOpen={true}
                onClose={() => {}}
                labels={labels}
                initialLabelIndex={labelIndex}
                sourceRx={currentRx}
                hideInternalPartsSwitcher={true}
                hideBottomShare={true}
                onLabelIndexChange={(newIdx) => {
                  setLabelIndex(newIdx);
                  updateUrlWithQueue(patientQueue, activeQueueIndex, newIdx);
                }}
                initialWidthMm={patientQueue[activeQueueIndex]?.labels?.[labelIndex]?.widthMm || patientQueue[activeQueueIndex]?.widthMm || 75}
                initialHeightMm={patientQueue[activeQueueIndex]?.labels?.[labelIndex]?.heightMm || patientQueue[activeQueueIndex]?.heightMm || 45}
                initialVariant={patientQueue[activeQueueIndex]?.labels?.[labelIndex]?.variant || patientQueue[activeQueueIndex]?.variant || 'backQr'}
                onConfigChange={(cfg) => {
                  handleUpdatePatientConfig(activeQueueIndex, {
                    widthMm: cfg.widthMm,
                    heightMm: cfg.heightMm,
                    variant: cfg.variant,
                    selectedPreset: cfg.preset
                  });
                }}
                onLabelDataChange={(partIdx, updatedLabel) => {
                  setLabels(prev => {
                    const next = [...prev];
                    next[partIdx] = { ...(next[partIdx] || {}), ...updatedLabel };
                    return next;
                  });
                  setPatientQueue(prev => {
                    const next = [...prev];
                    if (!next[activeQueueIndex]) return prev;
                    const pItem = { ...next[activeQueueIndex] };
                    const pLabels = Array.isArray(pItem.labels) ? [...pItem.labels] : [];
                    pLabels[partIdx] = { ...(pLabels[partIdx] || {}), ...updatedLabel };
                    pItem.labels = pLabels;
                    next[activeQueueIndex] = pItem;
                    return next;
                  });
                }}
                onPrescriptionUpdated={({ updatedFields, item }) => {
                  if (Array.isArray(updatedFields?.pharmacyLabels)) {
                    setLabels(updatedFields.pharmacyLabels);
                    setPatientQueue(prev => {
                      const next = [...prev];
                      if (!next[activeQueueIndex]) return prev;
                      next[activeQueueIndex] = { ...next[activeQueueIndex], labels: updatedFields.pharmacyLabels };
                      return next;
                    });
                  } else if (item) {
                    setLabels(prev => {
                      const next = [...prev];
                      next[labelIndex] = { ...(next[labelIndex] || {}), ...item };
                      return next;
                    });
                  }
                }}
                initialEditMode={isEditing}
                isStandalone={true}
                isEs={isEs}
              />
            </LabelsErrorBoundary>
          </div>
        )}

        <LabelsOffscreenRenderer patientQueue={patientQueue} />
      </main>

      <ImportPrescriptionModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        title={isEs ? 'Importar Prescripción (Account Manager)' : 'Import Prescription (Account Manager)'}
        persistEndpoint="/api/labels/import"
        note={isEs
          ? 'Modo Account Manager: la prescripción se guarda como borrador sin validación de Atlas y se abre aquí para generar sus etiquetas.'
          : 'Account Manager mode: the prescription is saved as a draft without Atlas validation and opened here to generate its labels.'}
        onImported={(created) => {
          setShowImport(false);
          const first = Array.isArray(created) ? created[0] : null;
          if (first?.id || first?.code) handleSelectOrAddPatient(first.id || first.code, true);
        }}
      />

      <PrescriptionRefillModal
        isOpen={showRefillModal}
        onClose={() => {
          setShowRefillModal(false);
          setRefillPresetPartIndex(null);
        }}
        currentRx={currentRx}
        labels={labels}
        cleanRxCode={cleanRxCode || activeCode}
        patientName={patientName}
        docName={docName}
        isEs={isEs}
        presetPartIndex={refillPresetPartIndex}
        onRefillCreated={(newRefillData) => {
          if (newRefillData?.newCode) handleSelectOrAddPatient(newRefillData.newCode, true);
        }}
      />

      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
        isEs={isEs}
      />

      {!embedded && (
        <LabelsAtlasDock
          isEs={isEs}
          patientQueue={patientQueue}
          activeRx={currentRx}
          onOpenSearch={() => {
            setSearchOpen(true);
            searchInputRef.current?.focus();
          }}
          onAddFeaturedPatient={(code) => handleSelectOrAddPatient(code, true)}
        />
      )}
    </div>
  );
}
