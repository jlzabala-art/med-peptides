'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
import LabelsHomeView from './components/LabelsHomeView';
import QuickManualRxModal from './components/QuickManualRxModal';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import { useLabelsPrescriptionActions } from './hooks/useLabelsPrescriptionActions';
import { LabelsWorkspaceProvider } from './context/LabelsWorkspaceContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import PharmacyOpsWorkspaceBar from '@/components/shared/PharmacyOpsWorkspaceBar';
import { useRegisterAtlasContext } from '@/context/AtlasContextProvider';
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
import { getWorklistTestKind } from './utils/labelHelpers';
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
  const { effectiveRole, can } = useRoleAccess();
  const isRestrictedRole = ['patient', 'wholesaler', 'clinic'].includes(effectiveRole);
  const canApproveRx = !isRestrictedRole && (can('edit:prescriptions') || ['admin', 'medical_director', 'doctor', 'pharmacist', 'compounding_pharmacy', 'account_manager', 'guest'].includes(effectiveRole));
  const canEditRxParts = !isRestrictedRole;
  const { prefs, updatePref } = useWorkstationPrefs();

  const [lang, setLang] = useState(initialLang || 'en');
  const isEs = lang === 'es';
  const [isEditing, setIsEditing] = useState(
    Boolean(initialEditMode || prefs.preferredEditMode)
  );
  const [showImport, setShowImport] = useState(false);
  const [showManualRxModal, setShowManualRxModal] = useState(false);
  const [showRefillModal, setShowRefillModal] = useState(false);
  const [refillPresetPartIndex, setRefillPresetPartIndex] = useState(null);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [copyCodeSuccess, setCopyCodeSuccess] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [copiedShareType, setCopiedShareType] = useState(null);
  const [worklistPage, setWorklistPage] = useState(1);
  const [worklistPageSize, setWorklistPageSize] = useState(10);
  const [worklistDateRange, setWorklistDateRange] = useState('30d');
  const [mountTimestamp] = useState(() => Date.now());

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
    handleClearRecent,
    refreshWorklist,
    updateWorklistItem
  } = useLabelsWorklist();
  const [worklistTestFilter, setWorklistTestFilter] = useState('all');

  const {
    patientQueue,
    setPatientQueue,
    activeQueueIndex,
    setActiveQueueIndex,
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

  const setCurrentRx = useCallback((updater) => {
    setPatientQueue((prev) =>
      prev.map((item, idx) =>
        idx === activeQueueIndex
          ? { ...item, rx: typeof updater === 'function' ? updater(item.rx) : updater }
          : item
      )
    );
  }, [activeQueueIndex, setPatientQueue]);

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
      const formulaTitle = currentLabel?.productTitle || currentLabel?.productName || currentRx?.treatmentTitle || 'Compounded Formula';
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

  // Worklist items: always prefer real searchResults / Firestore database, fallback to FEATURED_PATIENTS only if completely empty
  const worklistSource = useMemo(() => {
    if (Array.isArray(searchResults) && searchResults.length > 0) {
      return searchResults;
    }
    return FEATURED_PATIENTS;
  }, [searchResults]);

  const matchesDateRange = useMemo(() => {
    const maxAgeMs = worklistDateRange === '7d' ? 7 * 86400000 : worklistDateRange === '30d' ? 30 * 86400000 : null;
    return (item) => {
      // If user is actively searching a term/patient/code, do NOT filter out historical database matches
      if (searchQuery && searchQuery.trim().length >= 2) return true;
      if (!maxAgeMs) return true;
      const raw = item.importedAt || item.createdAt || item.uploadedAt || item.date;
      if (!raw) return true;
      const ts = typeof raw === 'number' ? raw : raw?.seconds ? raw.seconds * 1000 : Date.parse(raw);
      if (Number.isNaN(ts)) return true;
      return (mountTimestamp - ts) <= maxAgeMs;
    };
  }, [worklistDateRange, mountTimestamp, searchQuery]);

  const filterWorklistItem = (item, tabOverride = null) => {
    const activeTab = tabOverride || worklistTab;
    const pCode = sanitizeRecentCode(item.code).toUpperCase();
    const count = printCountsMap[pCode] ?? printCountsMap[String(item.code).toUpperCase()] ?? item.a4PrintCount ?? 0;
    const isPendingApproval = (item.status && item.status !== 'approved' && !item.isSigned);
    const isRefill = Number(item.refillCycle || 1) > 1 || /-R\d+$/i.test(String(item.code || '')) || Boolean(item.refillOf || item.refillAlertDate);
    if (activeTab === 'unprinted') return count === 0;
    if (activeTab === 'pending_approval') return isPendingApproval;
    if (activeTab === 'refills') return isRefill;
    if (activeTab === 'printed') return count === 1;
    if (activeTab === 'reprint') return count > 1;
    return true;
  };

  const baseWorklistItems = useMemo(() => {
    return worklistSource.filter(matchesDateRange);
  }, [worklistSource, matchesDateRange]);

  const worklistTabCounts = useMemo(() => {
    const counts = { unprinted: 0, pending_approval: 0, refills: 0, printed: 0, reprint: 0, all: baseWorklistItems.length };
    for (const item of baseWorklistItems) {
      const pCode = sanitizeRecentCode(item.code).toUpperCase();
      const count = printCountsMap[pCode] ?? printCountsMap[String(item.code).toUpperCase()] ?? item.a4PrintCount ?? 0;
      const isPendingApproval = (item.status && item.status !== 'approved' && !item.isSigned);
      const isRefill = Number(item.refillCycle || 1) > 1 || /-R\d+$/i.test(String(item.code || '')) || Boolean(item.refillOf || item.refillAlertDate);
      if (count === 0) counts.unprinted++;
      if (isPendingApproval) counts.pending_approval++;
      if (isRefill) counts.refills++;
      if (count === 1) counts.printed++;
      if (count > 1) counts.reprint++;
    }
    return counts;
  }, [baseWorklistItems, printCountsMap]);

  const getImportTimestampMs = useCallback((item) => {
    const raw = item?.importedAt || item?.createdAt || item?.uploadedAt || item?.updatedAt || item?.date;
    if (!raw) return 0;
    if (typeof raw === 'number') return raw;
    if (typeof raw?.toDate === 'function') return raw.toDate().getTime();
    if (typeof raw?._seconds === 'number') return raw._seconds * 1000;
    if (typeof raw?.seconds === 'number') return raw.seconds * 1000;
    const parsed = Date.parse(String(raw));
    return Number.isNaN(parsed) ? 0 : parsed;
  }, []);

  const filteredWorklistItems = useMemo(() => {
    return baseWorklistItems
      .filter((item) => filterWorklistItem(item))
      .filter((item) => worklistTestFilter === 'all' || getWorklistTestKind(item) === worklistTestFilter)
      .sort((a, b) => getImportTimestampMs(b) - getImportTimestampMs(a));
  }, [baseWorklistItems, worklistTab, printCountsMap, getImportTimestampMs, worklistTestFilter]);

  const totalWorklistPages = Math.max(1, Math.ceil(filteredWorklistItems.length / worklistPageSize));
  const safeWorklistPage = Math.min(worklistPage, totalWorklistPages);
  const paginatedWorklistItems = useMemo(() => {
    const startIdx = (safeWorklistPage - 1) * worklistPageSize;
    return filteredWorklistItems.slice(startIdx, startIdx + worklistPageSize);
  }, [filteredWorklistItems, safeWorklistPage, worklistPageSize]);

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

  const {
    removingPartIndex,
    handleRemoveLabelPart,
    handleRestoreRemovedPart,
  } = useLabelsPrescriptionActions({
    currentRx,
    cleanRxCode,
    activeCode,
    labels,
    activeQueueIndex,
    patientQueue,
    isEs,
    setLabels,
    setCurrentRx,
    setPatientQueue,
    setLabelIndex,
    updateUrlWithQueue,
    onPartsChanged: (targetId, mutation) => {
      updateWorklistItem?.(targetId, mutation);
      refreshWorklist?.();
    },
  });

  const hasPendingApprovalsInQueue = patientQueue.some(
    p => (p.rx?.status || p.rx?.state) !== 'approved' && !p.rx?.isSigned
  );
  const showBatchBar = patientQueue.length >= 2;

  useRegisterAtlasContext(
    {
      contextAnchor: {
        type: 'labels_studio',
        name: activeCode ? `Label Studio · #${activeCode}` : 'Prescriptions & Dispensing Worklist',
        activeCode: activeCode || null,
        patientName: patientName || null,
        queueCount: patientQueue.length,
      },
      bottomBar: !embedded
        ? {
            summaryTitle: activeCode ? `#${activeCode} · ${patientName || 'Prescription'}` : (isEs ? 'Estudio de Etiquetas y Recetas' : 'Prescriptions & Label Studio'),
            summarySubtitle: patientQueue.length > 0
              ? `${patientQueue.length} ${isEs ? 'paciente(s) en cola' : 'patient(s) in queue'} · ${totalBatchLabelsCount} ${isEs ? 'etiquetas' : 'labels'}`
              : (isEs ? 'Worklist GMP · Impresión Zebra & A4' : 'GMP Worklist · Zebra & A4 Print'),
            badge: 'EU GMP Label Studio',
            atlasAiLabel: 'Ask Atlas AI',
            primaryAction: {
              label: isEs ? `Imprimir Lote A4 (${totalBatchLabelsCount})` : `Print Batch A4 (${totalBatchLabelsCount})`,
              onClick: handleDownloadA4BatchPdf,
            },
          }
        : undefined,
    },
    [activeCode, patientName, patientQueue.length, totalBatchLabelsCount, embedded, isEs, handleDownloadA4BatchPdf]
  );

  const workspaceContextValue = {
    lang,
    isEs,
    patientQueue,
    activeQueueIndex,
    currentRx,
    labels,
    labelIndex,
    activeCode,
    cleanRxCode,
    patientName,
    docName,
    isEditing,
    setIsEditing,
    selectPatient: handleSelectOrAddPatient,
    backToWorklist: () => {
      setPatientQueue([]);
      setActiveQueueIndex(0);
      setLabelIndex(0);
      setLabels([]);
      setCurrentRx(null);
      updateUrlWithQueue([], 0, 0);
    },
  };

  return (
    <LabelsWorkspaceProvider value={workspaceContextValue}>
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
      {!embedded && (
        <PublicUnifiedHeader
          track="protocols"
          lang={lang}
          onLangChange={(nextLang) => setLang(nextLang)}
          hideCurrencySelector={true}
          breadcrumbs={[
            { label: isEs ? 'Inicio' : 'Home', href: '/' },
            { label: isEs ? 'Prescripciones y Etiquetas' : 'Prescriptions & Labels', href: '/labels' },
            ...(activeCode
              ? [{ label: `#${activeCode}`, href: `/rx/${encodeURIComponent(cleanRxCode || activeCode)}` }]
              : []),
          ]}
        />
      )}
      <PharmacyOpsWorkspaceBar lang={lang} />
      {(patientQueue.length > 0 || embedded) && (
      <LabelsHeader
        hideTopChrome={!embedded}
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
        onBackToWorklist={() => {
          setPatientQueue([]);
          setActiveQueueIndex(0);
          setLabelIndex(0);
          setLabels([]);
          setCurrentRx(null);
          updateUrlWithQueue([], 0, 0);
        }}
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
      )}

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
          onRemoveLabelPart={handleRemoveLabelPart}
          removingPartIndex={removingPartIndex}
          removedParts={currentRx?.removedParts || []}
          onRestoreRemovedPart={handleRestoreRemovedPart}
          refillCycle={currentRx?.refillCycle || 1}
          refillAlertDate={currentRx?.refillAlertDate || currentRx?.nextRefillDate || ''}
          refillAlertStatus={currentRx?.refillAlertStatus || 'scheduled'}
          onSwitchPrescriptionCode={(code) => handleSelectOrAddPatient(code, true)}
          canApproveRx={canApproveRx}
          canEditRxParts={canEditRxParts}
          isPartLabeledFn={(idx) => isPartLabeled(cleanRxCode || activeCode, idx)}
        />
      )}

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: '48px' }}>
        {patientQueue.length === 0 ? (
          <LabelsHomeView
            isEs={isEs}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isSearching={isSearching}
            searchResults={searchResults}
            labelsKpis={labelsKpis}
            unprintedCodes={unprintedCodes}
            handleAddMultipleToQueue={handleAddMultipleToQueue}
            worklistTab={worklistTab}
            setWorklistTab={setWorklistTab}
            worklistTabCounts={worklistTabCounts}
            worklistDateRange={worklistDateRange}
            setWorklistDateRange={setWorklistDateRange}
            setWorklistPage={setWorklistPage}
            recentPrescriptions={recentPrescriptions}
            filterWorklistItem={filterWorklistItem}
            handleClearRecent={handleClearRecent}
            handleSelectOrAddPatient={handleSelectOrAddPatient}
            formatResultDate={formatResultDate}
            renderPrintStatusBadge={renderPrintStatusBadge}
            paginatedWorklistItems={paginatedWorklistItems}
            filteredWorklistItems={filteredWorklistItems}
            safeWorklistPage={safeWorklistPage}
            worklistPageSize={worklistPageSize}
            setWorklistPageSize={setWorklistPageSize}
            totalWorklistPages={totalWorklistPages}
            onOpenImport={() => setShowImport(true)}
            onOpenManualRx={() => setShowManualRxModal(true)}
            worklistTestFilter={worklistTestFilter}
            setWorklistTestFilter={setWorklistTestFilter}
            allWorklistItems={baseWorklistItems}
          />
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
              onDownloadA4BatchPdf={handleDownloadA4BatchPdf}
              onOpenShortcuts={() => setShowShortcutsModal(true)}
              strictGmpGate={Boolean(prefs.strictGmpGate)}
              onToggleStrictGmpGate={(val) => updatePref('strictGmpGate', val)}
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

      <QuickManualRxModal
        isOpen={showManualRxModal}
        onClose={() => setShowManualRxModal(false)}
        isEs={isEs}
        onCreated={(created) => {
          const first = Array.isArray(created) ? created[0] : null;
          if (first?.id || first?.code) handleSelectOrAddPatient(first.id || first.code, true);
        }}
      />

      <ImportPrescriptionModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        title={isEs ? 'Importar Prescripción o Reporte Clínico' : 'Import Patient Prescription'}
        persistEndpoint="/api/labels/import"
        note={isEs
          ? 'Importa una prescripción médica o reporte Fagron directamente al Estudio de Etiquetas para revisar y generar sus etiquetas.'
          : 'Import a clinical prescription or Fagron test report directly into Label Studio to review and print labels.'}
        onImported={(created) => {
          setShowImport(false);
          refreshWorklist?.();
          const first = Array.isArray(created) ? created[0] : null;
          if (first?.id || first?.code) handleSelectOrAddPatient(first.id || first.code, true);
        }}
      />

      {showRefillModal && (
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
          onRefillUpdated={(updated) => {
            setCurrentRx((prev) => (prev ? { ...prev, ...updated } : prev));
          }}
          onSelectCycleCode={(code) => {
            if (code) handleSelectOrAddPatient(code, true);
          }}
        />
      )}

      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
        isEs={isEs}
      />

      {!embedded && <PublicUnifiedFooter lang={lang} />}
    </div>
    </LabelsWorkspaceProvider>
  );
}
