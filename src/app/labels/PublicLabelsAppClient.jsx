'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import './labels-studio.css';
import { useRouter, useSearchParams } from 'next/navigation';
import PharmacyLabelsModal from '@/components/prescription/PharmacyLabelsModal';
import ImportPrescriptionModal from '@/features/prescriptions/components/ImportPrescriptionModal';
import EmptyState from '@/components/ui/EmptyState';
import LabelsHeader from './components/LabelsHeader';
import LabelsSearchDropdown from './components/LabelsSearchDropdown';
import LabelsBatchBar from './components/LabelsBatchBar';
import LabelsMetaStrip from './components/LabelsMetaStrip';
import LabelsOffscreenRenderer from './components/LabelsOffscreenRenderer';
import LabelsWorkspaceSkeleton from './components/LabelsWorkspaceSkeleton';
import LabelsErrorBoundary from './components/LabelsErrorBoundary';
import LabelsAtlasDock from './components/LabelsAtlasDock';
import {
  Search,
  Check,
  Share2,
  Database,
  ShieldCheck,
  User,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  X,
  Copy,
  Upload,
  Stethoscope,
  Printer,
  Layers,
  Plus,
  Trash2,
  CheckCircle,
  Sliders
} from '@/lib/icons';
import PharmapolisLabelSvg from '@/components/prescription/PharmapolisLabelSvg';
import { generateA4BatchPdf } from '@/utils/a4BatchPdfGenerator';
import { detectOptimalLabelDimensions, CONTAINER_SIZE_PRESETS } from '@/utils/labels/containerDimensionDetector';
import { useAuth } from '@/context/AuthContext';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/firebase';
import { trackToolUsage } from '@/hooks/useAnalytics';

// Flagship featured cases for instant 1-click access
const FEATURED_PATIENTS = [
  { code: 'BOX01399AATRI', name: 'Haya Hassen Al-Haidose', title: 'TrichoSol 100mL & TrichoWash 250mL' },
  { code: '51812', name: 'Abdulla Sultan Alotaiba', title: 'Metabolic & Longevity (Parts 1 & 2)' },
  { code: '51857', name: 'Amna Sultan Alotaiba', title: 'Metabolic & Lipid Optimization' },
  { code: '50957', name: 'Alan Maclean Rutledge', title: 'Proteolytic & Mitochondrial' },
  { code: '51861', name: 'Basma Haitham Bouzo', title: 'Topical Scalp & Metabolic' },
  { code: '51811', name: 'Sarah Al Nuaimi', title: 'Hormonal & Transdermal' },
];

// LocalStorage key for tracking the last 5 consulted prescriptions (GCP UX Rule #7)
const RECENT_KEY = 'pls_recent_prescriptions_v1';
const QUEUE_STORAGE_KEY = 'pls_patient_queue_formats_v2';
const ACTIVE_RX_KEY = 'pls_last_active_rx_code';
const LABELED_STORAGE_KEY = 'pls_labeled_parts_v1';

function getInitialLabeledSet() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LABELED_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function getRecentPrescriptions() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecentPrescription(item) {
  if (typeof window === 'undefined' || !item?.code) return [];
  try {
    const list = getRecentPrescriptions();
    const filtered = list.filter(p => String(p.code) !== String(item.code));
    const updated = [
      {
        code: String(item.code),
        patientName: item.patientName || item.name || 'Patient',
        title: item.title || item.treatmentTitle || 'Compounded Formula',
        date: item.date || item.prodDate || item.prescriptionDate || null,
        timestamp: Date.now()
      },
      ...filtered
    ].slice(0, 5); // Keep exactly last 5
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Failed to save recent prescription to localStorage:', e);
    return [];
  }
}

function getDoctorSlug(rx, fallbackDocName) {
  if (rx?.doctorSlug) return rx.doctorSlug;
  if (rx?.doctor?.slug) return rx.doctor.slug;
  if (rx?.doctor?.opaqueCode) return rx.doctor.opaqueCode;
  if (rx?.treatingDoctor?.slug) return rx.treatingDoctor.slug;
  if (rx?.treatingDoctor?.opaqueCode) return rx.treatingDoctor.opaqueCode;
  if (rx?.doctorCode) return rx.doctorCode;
  
  const name = rx?.doctorName || rx?.physician || rx?.doctor?.name || rx?.treatingDoctor?.name || fallbackDocName || 'Marina Cordeiro Fernandes';
  return String(name)
    .toLowerCase()
    .replace(/^dr[a]?\.\s*/i, '')
    .replace(/^dr[a]?\s*/i, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// Label size presets and variants for individual patient customization (Adaptive to Packaging)
const LABEL_SIZE_PRESETS = CONTAINER_SIZE_PRESETS;

const LABEL_VARIANT_OPTIONS = [
  { id: 'backQr', labelEs: 'Trasera con QR', labelEn: 'Back with QR' },
  { id: 'front', labelEs: 'Frontal sin QR', labelEn: 'Front without QR' },
  { id: 'frontWithQr', labelEs: 'Frontal con QR', labelEn: 'Front with QR' },
  { id: 'shipping', labelEs: 'Etiqueta de Envío', labelEn: 'Shipping Label' },
];

export default function PublicLabelsAppClient({
  initialRx = null,
  initialLabels = [],
  initialCode = '',
  initialQueue = [],
  initialEditMode = true,
  initialLabelIndex = 0,
  initialLang = 'en'
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Patient Batch Queue State with Automatic Container Dimensions
  const [patientQueue, setPatientQueue] = useState(() => {
    if (Array.isArray(initialQueue) && initialQueue.length > 0) {
      return initialQueue.map((item, idx) => {
        const enrichedLabels = (item.labels || []).map((lbl) => {
          const opt = detectOptimalLabelDimensions(lbl);
          return {
            ...lbl,
            widthMm: lbl.widthMm || opt.widthMm,
            heightMm: lbl.heightMm || opt.heightMm,
            containerTag: opt.containerTag
          };
        });
        const firstOpt = detectOptimalLabelDimensions(enrichedLabels[0] || item.rx);
        return {
          code: String(item.code || item.rx?.fileNumber || item.rx?.code),
          rx: item.rx,
          labels: enrichedLabels,
          selectedPartIndex: (idx === 0 && initialLabelIndex != null && initialLabelIndex !== 0) ? initialLabelIndex : 'all',
          variant: 'backQr',
          widthMm: item.widthMm || firstOpt.widthMm,
          heightMm: item.heightMm || firstOpt.heightMm,
          containerTag: firstOpt.containerTag
        };
      });
    }
    if (initialRx) {
      const enrichedLabels = (initialLabels || []).map((lbl) => {
        const opt = detectOptimalLabelDimensions(lbl);
        return {
          ...lbl,
          widthMm: lbl.widthMm || opt.widthMm,
          heightMm: lbl.heightMm || opt.heightMm,
          containerTag: opt.containerTag
        };
      });
      const firstOpt = detectOptimalLabelDimensions(enrichedLabels[0] || initialRx);
      return [{
        code: String(initialCode || initialRx?.fileNumber || initialRx?.code || ''),
        rx: initialRx,
        labels: enrichedLabels,
        selectedPartIndex: (initialLabelIndex != null && initialLabelIndex !== 0) ? initialLabelIndex : 'all',
        variant: 'backQr',
        widthMm: firstOpt.widthMm,
        heightMm: firstOpt.heightMm,
        containerTag: firstOpt.containerTag
      }];
    }
    return [];
  });

  const [activeQueueIndex, setActiveQueueIndex] = useState(0);
  const [isGeneratingBatchPdf, setIsGeneratingBatchPdf] = useState(false);
  const [batchPdfProgress, setBatchPdfProgress] = useState(null);

  // Total label parts count across whole patient queue
  const totalBatchLabelsCount = React.useMemo(() => {
    return patientQueue.reduce((acc, pItem) => {
      const pLabels = Array.isArray(pItem.labels) && pItem.labels.length > 0 ? pItem.labels : [{}];
      const count = (pItem.selectedPartIndex != null && pItem.selectedPartIndex !== 'all') ? 1 : pLabels.length;
      return acc + count;
    }, 0);
  }, [patientQueue]);

  // Active Single Prescription State (mirrored from queue)
  const [currentRx, setCurrentRx] = useState(initialRx);
  const [labels, setLabels] = useState(initialLabels);
  const [activeCode, setActiveCode] = useState(initialCode);
  const [labelIndex, setLabelIndex] = useState(typeof initialLabelIndex === 'number' ? initialLabelIndex : 0);
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [lang, setLang] = useState(initialLang || 'en');
  const isEs = lang === 'es';

  // Search & Recent State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const [isLoadingRx, setIsLoadingRx] = useState(false);
  const [copyCodeSuccess, setCopyCodeSuccess] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [copiedShareType, setCopiedShareType] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [isApprovingRx, setIsApprovingRx] = useState(false);
  const [isBatchApproving, setIsBatchApproving] = useState(false);
  const [labeledMap, setLabeledMap] = useState(getInitialLabeledSet);

  const searchBoxRef = useRef(null);
  const searchInputRef = useRef(null);

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
      if (highlightedIndex >= 0 && items[highlightedIndex]) {
        e.preventDefault();
        handleSelectOrAddPatient(items[highlightedIndex].code, true);
        setSearchOpen(false);
        setHighlightedIndex(-1);
      }
    } else if (e.key === 'Escape') {
      setSearchOpen(false);
      setHighlightedIndex(-1);
    }
  };

  // Sync title dynamically
  const patientName = currentRx?.patient?.name || currentRx?.patientName || 'Patient';
  const rxCode = currentRx?.fileNumber || currentRx?.code || activeCode;
  const cleanRxCode = String(rxCode || '').replace(/^#/, '').trim();
  const docName = currentRx?.doctorName || currentRx?.physician || currentRx?.doctor?.name || currentRx?.treatingDoctor?.name || 'Dr. Marina Cordeiro Fernandes';
  const doctorSlug = getDoctorSlug(currentRx, docName);

  // Hydrate recents from localStorage and track studio usage on mount
  useEffect(() => {
    setRecentPrescriptions(getRecentPrescriptions());

    // Track usage in user profile and analytics
    if (user?.uid) {
      try {
        const userRef = doc(db, 'users', user.uid);
        updateDoc(userRef, {
          'usageStats.labelStudioVisits': increment(1),
          'usageStats.lastLabelStudioAt': new Date().toISOString(),
          lastActiveAt: new Date().toISOString()
        }).catch(() => {});
      } catch {
        /* ignore */
      }
      trackToolUsage('pharmapolis_labels_studio', {
        userId: user.uid,
        email: user.email,
        timestamp: new Date().toISOString()
      });
    }
  }, [user]);

  // Save active prescription to recents when loaded
  useEffect(() => {
    if (currentRx) {
      const pName = currentRx?.patient?.name || currentRx?.patientName || 'Patient';
      const cCode = currentRx?.fileNumber || currentRx?.code || activeCode;
      const title = currentRx?.treatmentTitle || currentRx?.productTitle || (labels[0]?.productTitle) || 'Compounded Formula';
      const date = currentRx?.prescriptionDate || currentRx?.date || currentRx?.prodDate || (labels[0]?.prodDate) || null;
      const updated = saveRecentPrescription({ code: cCode, patientName: pName, title, date });
      if (updated && updated.length > 0) {
        setRecentPrescriptions(updated);
      }
    }
  }, [currentRx, activeCode, labels]);

  // Clear recents handler
  const handleClearRecent = (e) => {
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(RECENT_KEY);
      setRecentPrescriptions([]);
    }
  };

  // Restore saved format settings per patient and restore last active prescription on refresh
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const rawSaved = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (rawSaved) {
        const savedFormats = JSON.parse(rawSaved);
        if (savedFormats && typeof savedFormats === 'object') {
          setPatientQueue(prev => prev.map(p => {
            const fmt = savedFormats[String(p.code).toUpperCase()];
            if (fmt) {
              return {
                ...p,
                widthMm: fmt.widthMm || p.widthMm,
                heightMm: fmt.heightMm || p.heightMm,
                variant: fmt.variant || p.variant,
                selectedPreset: fmt.selectedPreset || p.selectedPreset,
                selectedPartIndex: fmt.selectedPartIndex !== undefined ? fmt.selectedPartIndex : p.selectedPartIndex
              };
            }
            return p;
          }));
        }
      }

      // Saved formats restored per patient code
    } catch { /* storage unavailable */ }
  }, []);

  // Save format settings per patient whenever queue changes
  useEffect(() => {
    if (typeof window === 'undefined' || !patientQueue.length) return;
    try {
      const formatsMap = {};
      patientQueue.forEach(p => {
        if (p.code) {
          formatsMap[String(p.code).toUpperCase()] = {
            widthMm: p.widthMm,
            heightMm: p.heightMm,
            variant: p.variant,
            selectedPreset: p.selectedPreset,
            selectedPartIndex: p.selectedPartIndex
          };
        }
      });
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(formatsMap));
      const activeItem = patientQueue[activeQueueIndex] || patientQueue[0];
      if (activeItem?.code) {
        localStorage.setItem(ACTIVE_RX_KEY, activeItem.code);
      }
    } catch { /* storage unavailable */ }
  }, [patientQueue, activeQueueIndex]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const mode = isEs ? 'Estudio de Etiquetas' : 'Compounding Label Studio';
      document.title = `${mode} • #${rxCode} (${patientName}) • Pharmapolis & Atlas Health`;
    }
  }, [isEs, rxCode, patientName]);

  // Keyboard shortcut ⌘K to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchOpen(true);
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Perform search query (debounced)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/labels/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (data?.success && Array.isArray(data.results)) {
          setSearchResults(data.results);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.warn('Search fetch error:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Synchronize URL query params with current batch queue
  const updateUrlWithQueue = (queue, activeIdx = 0) => {
    if (typeof window === 'undefined' || !queue.length) return;
    const codesParam = queue.map(p => p.code).join(',');
    const activeItem = queue[activeIdx] || queue[0];
    const phaseParam = (typeof activeItem?.selectedPartIndex === 'number') ? `&phase=${activeItem.selectedPartIndex + 1}` : '&phase=1';
    const newUrl = `/labels?rx=${encodeURIComponent(codesParam)}${phaseParam}&edit=true&lang=${lang}`;
    window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
    try {
      if (activeItem?.code) localStorage.setItem(ACTIVE_RX_KEY, activeItem.code);
    } catch { /* storage unavailable */ }
  };

  // Add or switch active patient in the batch queue
  const handleSelectOrAddPatient = async (code, activateImmediately = true) => {
    if (!code) return;
    const cleanCode = String(code).trim();
    const existingIdx = patientQueue.findIndex(p => String(p.code) === cleanCode);

    if (existingIdx >= 0) {
      if (activateImmediately) {
        handleSwitchActivePatient(existingIdx);
      }
      setSearchOpen(false);
      return;
    }

    setIsLoadingRx(true);
    try {
      const res = await fetch(`/api/labels/load?code=${encodeURIComponent(cleanCode)}`);
      const data = await res.json();
      if (data?.success && data.rx) {
        const enrichedLabels = (data.labels || []).map((lbl) => {
          const opt = detectOptimalLabelDimensions(lbl);
          return {
            ...lbl,
            widthMm: lbl.widthMm || opt.widthMm,
            heightMm: lbl.heightMm || opt.heightMm,
            containerTag: opt.containerTag
          };
        });
        const firstOpt = detectOptimalLabelDimensions(enrichedLabels[0] || data.rx);
        const newItem = {
          code: cleanCode,
          rx: data.rx,
          labels: enrichedLabels,
          selectedPartIndex: 'all',
          variant: 'backQr',
          widthMm: firstOpt.widthMm,
          heightMm: firstOpt.heightMm,
          containerTag: firstOpt.containerTag
        };

        const nextQueue = [...patientQueue, newItem];
        setPatientQueue(nextQueue);

        if (activateImmediately) {
          const newIdx = nextQueue.length - 1;
          setActiveQueueIndex(newIdx);
          setCurrentRx(data.rx);
          setLabels(data.labels || []);
          setActiveCode(cleanCode);
          setLabelIndex(0);
          updateUrlWithQueue(nextQueue, newIdx);
          setSearchOpen(false);
        } else {
          updateUrlWithQueue(nextQueue, activeQueueIndex);
        }

        // Update recents
        const updated = saveRecentPrescription({
          code: cleanCode,
          patientName: data.rx.patient?.name || data.rx.patientName || 'Patient',
          title: data.rx.treatmentTitle || 'Compounded Formula',
          date: data.rx.prescriptionDate || data.rx.date || null
        });
        if (updated && updated.length > 0) {
          setRecentPrescriptions(updated);
        }
      } else {
        toast.error(isEs ? `No se encontraron datos para la prescripción #${cleanCode}` : `No data found for prescription #${cleanCode}`);
      }
    } catch (err) {
      console.error('Error adding patient to batch:', err);
      toast.error(isEs ? 'Error al cargar la prescripción' : 'Failed to load prescription');
    } finally {
      setIsLoadingRx(false);
    }
  };

  // Legacy alias for existing callbacks
  const handleSelectPatient = (code) => handleSelectOrAddPatient(code, true);

  // Switch active patient in view
  const handleSwitchActivePatient = (idx) => {
    if (idx < 0 || idx >= patientQueue.length) return;
    setActiveQueueIndex(idx);
    const item = patientQueue[idx];
    setCurrentRx(item.rx);
    setLabels(item.labels);
    setActiveCode(item.code);
    const safeIdx = typeof item.selectedPartIndex === 'number' ? item.selectedPartIndex : 0;
    setLabelIndex(safeIdx);
    updateUrlWithQueue(patientQueue, idx);
  };

  // Remove a patient from the queue (supports deleting even when 1 is remaining)
  const handleRemoveFromQueue = (idxToRemove, e) => {
    if (e) e.stopPropagation();

    const nextQueue = patientQueue.filter((_, i) => i !== idxToRemove);
    setPatientQueue(nextQueue);

    if (nextQueue.length === 0) {
      setActiveQueueIndex(0);
      setCurrentRx(null);
      setLabels([]);
      setActiveCode('');
      setLabelIndex(0);
      if (typeof window !== 'undefined') {
        const newUrl = `/labels${lang ? `?lang=${lang}` : ''}`;
        window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
        try {
          localStorage.removeItem(ACTIVE_RX_KEY);
        } catch { /* storage unavailable */ }
      }
      return;
    }

    let nextActiveIdx = activeQueueIndex;
    if (activeQueueIndex >= nextQueue.length) {
      nextActiveIdx = nextQueue.length - 1;
    } else if (activeQueueIndex === idxToRemove) {
      nextActiveIdx = Math.max(0, idxToRemove - 1);
    }
    setActiveQueueIndex(nextActiveIdx);
    const activeItem = nextQueue[nextActiveIdx];
    if (activeItem) {
      setCurrentRx(activeItem.rx);
      setLabels(activeItem.labels);
      setActiveCode(activeItem.code);
      const safeActiveIdx = typeof activeItem.selectedPartIndex === 'number' ? activeItem.selectedPartIndex : 0;
      setLabelIndex(safeActiveIdx);
    }
    updateUrlWithQueue(nextQueue, nextActiveIdx);
  };

  // Update specific patient label config (format, size, variant, part)
  const handleUpdatePatientConfig = (idx, changes) => {
    setPatientQueue(prev => {
      const next = [...prev];
      if (!next[idx]) return prev;
      const pItem = { ...next[idx] };
      const labels = Array.isArray(pItem.labels) ? [...pItem.labels] : [{}];
      const targetPart = typeof changes.selectedPartIndex === 'number' ? changes.selectedPartIndex : labelIndex;
      if (labels[targetPart]) {
        labels[targetPart] = {
          ...labels[targetPart],
          widthMm: changes.widthMm ?? labels[targetPart].widthMm,
          heightMm: changes.heightMm ?? labels[targetPart].heightMm,
          variant: changes.variant ?? labels[targetPart].variant,
          lastVariant: changes.variant ?? labels[targetPart].lastVariant
        };
      }
      pItem.labels = labels;
      if (changes.widthMm != null) pItem.widthMm = changes.widthMm;
      if (changes.heightMm != null) pItem.heightMm = changes.heightMm;
      if (changes.variant != null) pItem.variant = changes.variant;
      if (changes.selectedPreset != null) pItem.selectedPreset = changes.selectedPreset;
      next[idx] = pItem;
      return next;
    });
    if (idx === activeQueueIndex && typeof changes.selectedPartIndex === 'number') {
      setLabelIndex(changes.selectedPartIndex);
    }
  };

  // Direct 1-Click Prescription Approval for Compounding & Label Specialists (Reimi / Kasia)
  const handleApprovePrescription = async () => {
    const code = cleanRxCode || activeCode;
    if (!code) return;
    setIsApprovingRx(true);
    const toastId = toast.loading(isEs ? `Aprobando receta #${code}...` : `Approving prescription #${code}...`);
    try {
      const res = await fetch('/api/prescriptions/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prescriptionId: currentRx?.id || code,
          prescriptionNumber: code,
          status: 'approved',
          reason: 'Authorized for compounding & label release by Compounding Label Specialist (Reimi / Kasia Studio)',
          updatedBy: user?.displayName || user?.email || 'Compounding Studio Specialist'
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to approve prescription');
      }

      // Update currentRx state locally
      setCurrentRx(prev => prev ? { ...prev, status: 'approved', state: 'approved', isSigned: true } : prev);

      // Update in patientQueue
      setPatientQueue(prevQueue => prevQueue.map(p => {
        if (p.code === code || p.code === activeCode) {
          return {
            ...p,
            rx: p.rx ? { ...p.rx, status: 'approved', state: 'approved', isSigned: true } : p.rx
          };
        }
        return p;
      }));

      toast.success(
        isEs 
          ? `Receta #${code} aprobada y autorizada para formulación ✓`
          : `Prescription #${code} approved & authorized for compounding release ✓`,
        { id: toastId }
      );
    } catch (err) {
      console.error('Error approving prescription in Label Studio:', err);
      toast.error(err.message || 'Error approving prescription', { id: toastId });
    } finally {
      setIsApprovingRx(false);
    }
  };

  // Labeled tracking across whole batch queue (Quality checklist)
  const isPartLabeled = (code, partIdx = 0) => {
    if (!code) return false;
    return Boolean(labeledMap[`${String(code).toUpperCase()}_${partIdx}`]);
  };

  const isPatientFullyLabeled = (pItem) => {
    if (!pItem?.code) return false;
    const labelsCount = Array.isArray(pItem.labels) && pItem.labels.length > 0 ? pItem.labels.length : 1;
    for (let i = 0; i < labelsCount; i++) {
      if (!isPartLabeled(pItem.code, i)) return false;
    }
    return true;
  };

  const totalLabeledCount = React.useMemo(() => {
    let count = 0;
    patientQueue.forEach(pItem => {
      const labelsCount = Array.isArray(pItem.labels) && pItem.labels.length > 0 ? pItem.labels.length : 1;
      const partsToCheck = (pItem.selectedPartIndex != null && pItem.selectedPartIndex !== 'all')
        ? [pItem.selectedPartIndex]
        : Array.from({ length: labelsCount }, (_, i) => i);
      partsToCheck.forEach(partIdx => {
        if (isPartLabeled(pItem.code, partIdx)) count++;
      });
    });
    return count;
  }, [patientQueue, labeledMap]);

  const handleToggleLabeled = (code = cleanRxCode || activeCode, partIdx = labelIndex) => {
    if (!code) return;
    const key = `${String(code).toUpperCase()}_${partIdx}`;
    setLabeledMap(prev => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(LABELED_STORAGE_KEY, JSON.stringify(next));
      } catch { /* storage unavailable */ }
      const newStatus = next[key];
      if (newStatus) {
        toast.success(
          isEs
            ? `Frasco #${code} (Parte ${partIdx + 1}) marcado como etiquetado ✓`
            : `Bottle #${code} (Part ${partIdx + 1}) marked as labeled ✓`,
          { duration: 2000 }
        );
      }
      return next;
    });
  };

  // Batch Approval for entire Patient Queue (Reimi / Kasia Studio)
  const handleBatchApprove = async () => {
    const unapproved = patientQueue.filter(p => {
      const st = p.rx?.status || p.rx?.state;
      return st !== 'approved' && !p.rx?.isSigned;
    });

    if (unapproved.length === 0) {
      toast.success(isEs ? 'Todas las recetas del lote ya están autorizadas ✓' : 'All prescriptions in batch are already authorized ✓');
      return;
    }

    setIsBatchApproving(true);
    const toastId = toast.loading(isEs ? `Aprobando ${unapproved.length} recetas en lote...` : `Batch approving ${unapproved.length} prescriptions...`);

    try {
      const results = await Promise.allSettled(
        unapproved.map(p => {
          const code = String(p.code || p.rx?.fileNumber || '').trim();
          return fetch('/api/prescriptions/update-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prescriptionId: p.rx?.id || code,
              prescriptionNumber: code,
              status: 'approved',
              reason: 'Batch authorized for compounding & label release by Compounding Studio Specialist (Reimi / Kasia)',
              updatedBy: user?.displayName || user?.email || 'Compounding Studio Specialist'
            })
          }).then(res => res.json());
        })
      );

      const approvedCodes = new Set(unapproved.map(p => String(p.code).trim()));

      // Update patientQueue
      setPatientQueue(prevQueue => prevQueue.map(p => {
        if (approvedCodes.has(String(p.code).trim())) {
          return {
            ...p,
            rx: p.rx ? { ...p.rx, status: 'approved', state: 'approved', isSigned: true } : p.rx
          };
        }
        return p;
      }));

      // Update currentRx if in batch
      if (approvedCodes.has(String(cleanRxCode).trim()) || approvedCodes.has(String(activeCode).trim())) {
        setCurrentRx(prev => prev ? { ...prev, status: 'approved', state: 'approved', isSigned: true } : prev);
      }

      const successful = results.filter(r => r.status === 'fulfilled' && r.value?.success).length;
      toast.success(
        isEs 
          ? `¡${successful} de ${unapproved.length} recetas autorizadas para formulación! ✓`
          : `Successfully authorized ${successful} of ${unapproved.length} prescriptions! ✓`,
        { id: toastId }
      );
    } catch (err) {
      console.error('Error during batch approval:', err);
      toast.error(isEs ? 'Error en aprobación en lote' : 'Error during batch approval', { id: toastId });
    } finally {
      setIsBatchApproving(false);
    }
  };

  // Laboratory Hotkeys for Reimi & Kasia (A: Approve, L: Toggle Labeled, ArrowRight/Left: Switch, 1-4: Variant)
  useEffect(() => {
    const handleKeyDownBench = (e) => {
      // Do nothing if typing in an input, textarea, or contentEditable
      const tag = e.target.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) {
        return;
      }
      // If search or import modal is open, don't hijack
      if (searchOpen || showImport) {
        return;
      }

      // 'a' or 'A': Approve active prescription if not approved
      if ((e.key === 'a' || e.key === 'A') && !e.metaKey && !e.ctrlKey) {
        const isAppr = currentRx?.status === 'approved' || currentRx?.state === 'approved' || currentRx?.isSigned;
        if (!isAppr && !isApprovingRx) {
          e.preventDefault();
          handleApprovePrescription();
        }
      }

      // 'l' or 'L': Toggle labeled status
      if ((e.key === 'l' || e.key === 'L') && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handleToggleLabeled(cleanRxCode || activeCode, labelIndex);
      }

      // ArrowRight: next part or next patient
      if (e.key === 'ArrowRight' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        if (labels.length > 1 && labelIndex < labels.length - 1) {
          const nextIdx = labelIndex + 1;
          setLabelIndex(nextIdx);
          const newUrl = `/labels?rx=${encodeURIComponent(activeCode)}&phase=${nextIdx + 1}&edit=true&lang=${lang}`;
          window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
        } else if (patientQueue.length > 1 && activeQueueIndex < patientQueue.length - 1) {
          handleSwitchActivePatient(activeQueueIndex + 1);
        }
      }

      // ArrowLeft: prev part or prev patient
      if (e.key === 'ArrowLeft' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        if (labels.length > 1 && labelIndex > 0) {
          const prevIdx = labelIndex - 1;
          setLabelIndex(prevIdx);
          const newUrl = `/labels?rx=${encodeURIComponent(activeCode)}&phase=${prevIdx + 1}&edit=true&lang=${lang}`;
          window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
        } else if (patientQueue.length > 1 && activeQueueIndex > 0) {
          handleSwitchActivePatient(activeQueueIndex - 1);
        }
      }

      // 1, 2, 3, 4: switch variant
      const variantMap = { '1': 'backQr', '2': 'front', '3': 'frontWithQr', '4': 'shipping' };
      if (variantMap[e.key] && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handleUpdatePatientConfig(activeQueueIndex, { variant: variantMap[e.key] });
        const vNames = {
          backQr: isEs ? 'Trasera con QR' : 'Back with QR',
          front: isEs ? 'Frontal' : 'Front',
          frontWithQr: isEs ? 'Frontal con QR' : 'Front with QR',
          shipping: isEs ? 'Etiqueta de Envío' : 'Shipping Label'
        };
        toast(isEs ? `Variante: ${vNames[variantMap[e.key]]}` : `Variant: ${vNames[variantMap[e.key]]}`, { icon: '🏷️', duration: 1500 });
      }
    };

    window.addEventListener('keydown', handleKeyDownBench);
    return () => window.removeEventListener('keydown', handleKeyDownBench);
  }, [searchOpen, showImport, currentRx, isApprovingRx, cleanRxCode, activeCode, labelIndex, labels, patientQueue, activeQueueIndex, isEs, lang]);

  // Generate and download A4 Multi-Patient Batch PDF
  const handleDownloadA4BatchPdf = async () => {
    if (!patientQueue.length) return;

    // Calculate total label parts across queue
    let totalLabelPartsCount = 0;
    patientQueue.forEach((pItem) => {
      const labels = Array.isArray(pItem.labels) && pItem.labels.length > 0 ? pItem.labels : [{}];
      const count = (pItem.selectedPartIndex != null && pItem.selectedPartIndex !== 'all') ? 1 : labels.length;
      totalLabelPartsCount += count;
    });

    setIsGeneratingBatchPdf(true);
    setBatchPdfProgress({ current: 0, total: totalLabelPartsCount, patient: '' });

    try {
      const batchItems = [];

      for (let i = 0; i < patientQueue.length; i++) {
        const pItem = patientQueue[i];
        const labels = Array.isArray(pItem.labels) && pItem.labels.length > 0 ? pItem.labels : [{}];
        // If user specifically picked a single part, honor it; otherwise print ALL parts
        const partsToInclude = (pItem.selectedPartIndex != null && pItem.selectedPartIndex !== 'all')
          ? [pItem.selectedPartIndex]
          : labels.map((_, idx) => idx);

        for (const partIdx of partsToInclude) {
          const pLabel = labels[partIdx] || labels[0] || {};
          const pName = pItem.rx?.patient?.name || pItem.rx?.patientName || pLabel.patientName || 'Patient';
          const rxC = pItem.code;
          const partLbl = pLabel.partLabel || (labels.length > 1 ? `Part ${partIdx + 1}/${labels.length}` : '');

          // Grab SVG element from offscreen renderer
          const svgElId = `batch-svg-${rxC}-${partIdx}`;
          const svgEl = document.getElementById(svgElId);

          if (!svgEl) {
            console.warn(`SVG element #${svgElId} not found in DOM`);
            continue;
          }

          // Optimal container dimensions for this specific bottle/part
          const optDims = detectOptimalLabelDimensions(pLabel);
          const effectiveWidthMm = Number(pLabel.widthMm || (pItem.widthMm !== 75 ? pItem.widthMm : optDims.widthMm)) || 75;
          const effectiveHeightMm = Number(pLabel.heightMm || (pItem.heightMm !== 45 ? pItem.heightMm : optDims.heightMm)) || 45;
          const containerTag = pLabel.containerTag || optDims.containerTag || '';
          const effectiveVariant = pLabel.variant || pLabel.lastVariant || pItem.variant || 'backQr';

          batchItems.push({
            patientName: pName,
            rxCode: rxC,
            partLabel: partLbl,
            variant: effectiveVariant,
            variantLabel: effectiveVariant === 'shipping' ? 'Shipping' : (effectiveVariant === 'front' ? 'Standard' : (effectiveVariant === 'frontWithQr' ? 'Front+MicroQR' : 'Delivery')),
            widthMm: effectiveWidthMm,
            heightMm: effectiveHeightMm,
            containerTag: containerTag,
            svgEl: svgEl,
            svgElement: svgEl
          });
        }
      }

      if (batchItems.length === 0) {
        toast.error(isEs ? 'No se encontraron las etiquetas SVG en el DOM' : 'Could not find rendered SVG labels in DOM');
        return;
      }

      await generateA4BatchPdf({
        items: batchItems,
        isEs,
        dpi: 600,
        onProgress: (prog) => {
          setBatchPdfProgress(prog);
        }
      });
    } catch (err) {
      console.error('Error generating A4 batch PDF:', err);
      toast.error(isEs ? `Error al generar PDF A4: ${err.message}` : `Failed to generate A4 PDF: ${err.message}`);
    } finally {
      setIsGeneratingBatchPdf(false);
      setBatchPdfProgress(null);
    }
  };

  // Helper to format result dates cleanly
  const formatResultDate = (rawDate) => {
    if (!rawDate) return '';
    if (typeof rawDate === 'string') {
      const trimmed = rawDate.trim();
      const ddmmyyyy = trimmed.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
      if (ddmmyyyy) {
        const d = new Date(`${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString(isEs ? 'es-ES' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        }
        return trimmed;
      }
      const yyyymmdd = trimmed.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);
      if (yyyymmdd) {
        const d = new Date(`${yyyymmdd[1]}-${yyyymmdd[2]}-${yyyymmdd[3]}`);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString(isEs ? 'es-ES' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        }
        return trimmed;
      }
      const d = new Date(trimmed);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString(isEs ? 'es-ES' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      }
      return trimmed;
    }
    return '';
  };

  // Build current shareable deep-link
  const getShareUrl = () => {
    if (typeof window === 'undefined') return '';
    const origin = window.location.origin;
    const phaseParam = (labelIndex != null && labelIndex > 0) ? `&phase=${labelIndex + 1}` : '&phase=1';
    return `${origin}/labels?rx=${encodeURIComponent(activeCode)}${phaseParam}&edit=true&lang=${lang}`;
  };

  // Unified Share Handler with 3 Modes (GCP Console UX): 'active' | 'batch' | 'clean'
  const handleShareType = async (type = 'active') => {
    if (typeof window === 'undefined') return;
    const origin = window.location.origin;
    let url = '';
    let title = '';
    let text = '';

    if (type === 'clean') {
      url = `${origin}/labels`;
      title = isEs ? 'Compounding Label Studio • Atlas Health' : 'Compounding Label Studio • Atlas Health';
      text = isEs
        ? '🏷️ Atlas Compounding Studio — Espacio de trabajo para formulación magistral.'
        : '🏷️ Atlas Compounding Studio — Compounding workspace.';
    } else if (type === 'batch') {
      if (!patientQueue.length) return;
      const allCodes = patientQueue.map(p => p.code).filter(Boolean).join(',');
      url = `${origin}/labels?rx=${encodeURIComponent(allCodes)}&edit=true&lang=${lang}`;
      const names = patientQueue.map(p => p.rx?.patientName || p.code).join(', ');
      title = `Atlas Compounding Studio • ${patientQueue.length} ${isEs ? 'Prescripciones' : 'Prescriptions'}`;
      text = isEs
        ? `🏷️ Atlas Compounding Studio • Lote de ${patientQueue.length} prescripciones: ${names}`
        : `🏷️ Atlas Compounding Studio • Batch of ${patientQueue.length} prescriptions: ${names}`;
    } else {
      // 'active'
      url = getShareUrl();
      const currentLabel = labels[labelIndex] || {};
      const formulaTitle = currentLabel.productTitle || currentLabel.productName || currentRx?.treatmentTitle || 'Compounded Pharmaceutical Formula';
      const partInfo = labels.length > 1 ? ` (Part ${labelIndex + 1}/${labels.length})` : '';
      title = `${patientName} • #${rxCode} Compounding Label`;
      text = isEs
        ? `🏷️ Atlas Compounding Studio • Paciente: ${patientName} • Prescripción: #${rxCode} • Fórmula${partInfo}: ${formulaTitle}`
        : `🏷️ Atlas Compounding Studio • Patient: ${patientName} • Prescription: #${rxCode} • Formula${partInfo}: ${formulaTitle}`;
    }

    // Try native share first on mobile
    if (navigator?.share && typeof navigator.canShare === 'function' && navigator.canShare({ title, text, url })) {
      try {
        await navigator.share({ title, text, url });
        setCopiedShareType(type);
        setCopiedShareLink(true);
        setTimeout(() => {
          setCopiedShareType(null);
          setCopiedShareLink(false);
        }, 2500);
        return;
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('Web Share API error:', err);
        }
      }
    }

    // Clipboard fallback
    if (navigator?.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setCopiedShareType(type);
        setCopiedShareLink(true);
        setTimeout(() => {
          setCopiedShareType(null);
          setCopiedShareLink(false);
        }, 2500);
      } catch (clipErr) {
        console.warn('Clipboard writeText failed:', clipErr);
      }
    }
  };

  // Default handler for active prescription (backwards-compatible)
  const handleShare = () => handleShareType('active');

  // Copy prescription code
  const handleCopyCode = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(rxCode);
      setCopyCodeSuccess(true);
      setTimeout(() => setCopyCodeSuccess(false), 2000);
    }
  };

  return (
    <div className="public-label-studio-root">


      {/* ── 1. Google Cloud Console Header with Search & Actions ── */}
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
        onOpenImport={() => setShowImport(true)}
        onShare={handleShare}
        onShareType={handleShareType}
        copiedShareLink={copiedShareLink}
        copiedShareType={copiedShareType}
        activeCode={activeCode}
        patientName={patientName}
        onKeyDownSearch={handleKeyDownSearch}
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

      {/* ── 2. Patient Batch Queue Strip ── */}
      {patientQueue.length > 0 && (
        <LabelsBatchBar
          patientQueue={patientQueue}
          activeQueueIndex={activeQueueIndex}
          totalBatchLabelsCount={totalBatchLabelsCount}
          onSwitchActivePatient={handleSwitchActivePatient}
          onRemoveFromQueue={handleRemoveFromQueue}
          onBatchApprove={handleBatchApprove}
          isBatchApproving={isBatchApproving}
          totalLabeledCount={totalLabeledCount}
          isPatientFullyLabeled={isPatientFullyLabeled}
          isEs={isEs}
        />
      )}

      {/* ── 3. Unified Resource Metadata Strip ── */}
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
            const newUrl = `/labels?rx=${encodeURIComponent(activeCode)}&phase=${idx + 1}&edit=true&lang=${lang}`;
            window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
          }}
          onQuickSearchPatient={() => {
            setSearchQuery(patientName);
            setSearchOpen(true);
            searchInputRef.current?.focus();
          }}
        />
      )}

      {/* ── 4. Main Independent Label Studio Workspace ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: '48px' }}>
        {patientQueue.length === 0 ? (
          <div className="pls-gcp-home">
            {/* ── 4 Google Cloud KPI Metric Cards (Golden Rule #22) ── */}
            <div className="pls-gcp-kpis">
              <div className="pls-gcp-kpi-card">
                <div className="pls-gcp-kpi-top">
                  <span>{isEs ? "Cola de Impresión" : "Batch Print Queue"}</span>
                  <Printer size={15} color="#1a73e8" />
                </div>
                <div className="pls-gcp-kpi-val">{patientQueue.length} {isEs ? "Recetas" : "Queued"}</div>
                <div className="pls-gcp-kpi-sub">{isEs ? "Impresión múltiple A4 y Térmica" : "Multi-label A4 & Thermal ready"}</div>
              </div>

              <div className="pls-gcp-kpi-card">
                <div className="pls-gcp-kpi-top">
                  <span>{isEs ? "Formatos de Etiqueta" : "Label Formats"}</span>
                  <Layers size={15} color="#0d9488" />
                </div>
                <div className="pls-gcp-kpi-val">Zebra & A4 PDF</div>
                <div className="pls-gcp-kpi-sub">{isEs ? "Frasco (75×45 / 90×50) y Envío" : "Bottle (75×45 / 90×50) & Shipping"}</div>
              </div>

              <div className="pls-gcp-kpi-card">
                <div className="pls-gcp-kpi-top">
                  <span>{isEs ? "Estándar Farmacéutico" : "Compliance Standard"}</span>
                  <ShieldCheck size={15} color="#16a34a" />
                </div>
                <div className="pls-gcp-kpi-val">EU GMP & QR</div>
                <div className="pls-gcp-kpi-sub">{isEs ? "Trazabilidad y posología verificada" : "Verified posology & QR link"}</div>
              </div>

              <div className="pls-gcp-kpi-card">
                <div className="pls-gcp-kpi-top">
                  <span>{isEs ? "Pacientes de Muestra" : "Ready Clinical Cases"}</span>
                  <FileText size={15} color="#7c3aed" />
                </div>
                <div className="pls-gcp-kpi-val">{FEATURED_PATIENTS.length} {isEs ? "Casos" : "Dossiers"}</div>
                <div className="pls-gcp-kpi-sub">{isEs ? "Acceso instantáneo en 1 clic" : "1-Click instant label preview"}</div>
              </div>
            </div>

            {/* ── Main 2-Column Google Cloud Console Workspace ── */}
            <div className="pls-gcp-grid">
              {/* Step 1: Select or Search Existing Patient */}
              <section className="pls-gcp-card">
                <div className="pls-gcp-card-header">
                  <div>
                    <h2 className="pls-gcp-card-title">
                      <Search size={17} color="#1a73e8" />
                      <span>{isEs ? "1. Seleccionar Paciente o Buscar Receta" : "1. Select Patient or Search Prescription"}</span>
                    </h2>
                    <p className="pls-gcp-card-subtitle">
                      {isEs
                        ? "Haz clic en cualquier paciente de la lista o escribe su nombre / código RX en el buscador superior para abrir sus etiquetas."
                        : "Click any patient below or search by name / RX code in top search bar to immediately open and print their labels."}
                    </p>
                  </div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "5px 10px",
                      fontSize: "0.74rem",
                      fontWeight: 650,
                      color: "#5f6368",
                      background: "#f1f5f9",
                      borderRadius: "6px",
                      whiteSpace: "nowrap",
                      flexShrink: 0
                    }}
                  >
                    <span>{isEs ? "Pulsa" : "Press"}</span>
                    <kbd style={{ padding: '1px 5px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 700 }}>⌘K</kbd>
                    <span>{isEs ? "para buscar" : "to search"}</span>
                  </div>
                </div>

                {/* Recent Prescriptions (if any) */}
                {recentPrescriptions.length > 0 && (
                  <div style={{ borderBottom: "1px solid #dadce0" }}>
                    <div style={{
                      padding: "8px 20px",
                      background: "#f8fafc",
                      borderBottom: "1px solid #f1f3f4",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "0.70rem",
                      fontWeight: 700,
                      color: "#5f6368",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em"
                    }}>
                      <span>{isEs ? "Consultados Recientemente" : "Recently Opened"}</span>
                      <button
                        type="button"
                        onClick={handleClearRecent}
                        style={{ border: "none", background: "transparent", color: "#1a73e8", fontSize: "0.70rem", fontWeight: 600, cursor: "pointer" }}
                      >
                        {isEs ? "Limpiar" : "Clear"}
                      </button>
                    </div>
                    {recentPrescriptions.map((r) => (
                      <div
                        key={"recent-" + r.code}
                        className="pls-gcp-patient-row"
                        onClick={() => handleSelectOrAddPatient(r.code, true)}
                      >
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#202124" }}>{r.patientName}</span>
                            <span style={{ fontSize: "0.72rem", fontFamily: "monospace", fontWeight: 700, color: "#1a73e8", background: "#e8f0fe", padding: "1px 7px", borderRadius: "4px" }}>
                              #{r.code}
                            </span>
                          </div>
                          <span style={{ fontSize: "0.76rem", color: "#5f6368" }}>{r.title}</span>
                        </div>
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          background: "#1a73e8",
                          color: "#ffffff",
                          fontSize: "0.76rem",
                          fontWeight: 650,
                          flexShrink: 0
                        }}>
                          <span>{isEs ? "Abrir Etiqueta" : "Open Label"}</span>
                          <ChevronRight size={13} />
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Featured / Sample Patients Directory (Deduplicated against recents) */}
                <div>
                  <div style={{
                    padding: "8px 20px",
                    background: "#f8fafc",
                    borderBottom: "1px solid #f1f3f4",
                    fontSize: "0.70rem",
                    fontWeight: 700,
                    color: "#5f6368",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em"
                  }}>
                    {isEs ? "Recetas Listas para Previsualizar e Imprimir (1 Clic)" : "Ready Prescriptions — Click to Preview & Print"}
                  </div>
                  {FEATURED_PATIENTS
                    .filter(p => !recentPrescriptions.some(r => String(r.code).toUpperCase() === String(p.code).toUpperCase()))
                    .map((p) => (
                    <div
                      key={p.code}
                      className="pls-gcp-patient-row"
                      onClick={() => handleSelectOrAddPatient(p.code, true)}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#202124" }}>{p.name}</span>
                          <span style={{ fontSize: "0.72rem", fontFamily: "monospace", fontWeight: 700, color: "#1a73e8", background: "#e8f0fe", padding: "1px 7px", borderRadius: "4px" }}>
                            #{p.code}
                          </span>
                        </div>
                        <span style={{ fontSize: "0.76rem", color: "#5f6368" }}>{p.title}</span>
                      </div>
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        background: "#ffffff",
                        border: "1px solid #dadce0",
                        color: "#1a73e8",
                        fontSize: "0.76rem",
                        fontWeight: 650,
                        flexShrink: 0
                      }}>
                        <span>{isEs ? "Abrir Etiqueta" : "Open Label"}</span>
                        <ChevronRight size={13} />
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Step 2: Upload New Prescription PDF / Image */}
              <aside style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="pls-gcp-card">
                  <div className="pls-gcp-card-header">
                    <div>
                      <h2 className="pls-gcp-card-title">
                        <Upload size={17} color="#1a73e8" />
                        <span>{isEs ? "2. ¿Paciente Nuevo? Subir Receta" : "2. New Patient? Upload Prescription"}</span>
                      </h2>
                      <p className="pls-gcp-card-subtitle">
                        {isEs
                          ? "Sube el PDF o escaneo de la receta para generar automáticamente sus etiquetas."
                          : "Upload a prescription PDF or scan to automatically extract formulas and generate labels."}
                      </p>
                    </div>
                  </div>
                  <div className="pls-gcp-upload-body" style={{ padding: "16px 20px" }}>
                    <button
                      type="button"
                      className="pls-gcp-upload-zone"
                      onClick={() => setShowImport(true)}
                      style={{
                        width: "100%",
                        border: "1.5px dashed #93c5fd",
                        background: "#f8fafd",
                        borderRadius: "8px",
                        padding: "18px 16px",
                        textAlign: "center",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "8px"
                      }}
                    >
                      <div style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        background: "#e8f0fe",
                        color: "#1a73e8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <Upload size={18} />
                      </div>
                      <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#202124" }}>
                        {isEs ? "Subir Receta (PDF o Escaneo)" : "Upload Prescription (PDF or Scan)"}
                      </div>
                      <div style={{ fontSize: "0.74rem", color: "#5f6368", maxWidth: "300px", lineHeight: 1.4 }}>
                        {isEs
                          ? "Extrae paciente, médico, activos y posología para generar las etiquetas automáticamente."
                          : "Automatically extracts patient, physician, actives, and posology to build bottle & shipping labels."}
                      </div>
                      <span style={{
                        marginTop: "4px",
                        padding: "7px 14px",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        color: "#ffffff",
                        background: "#1a73e8",
                        borderRadius: "6px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        boxShadow: "0 1px 2px rgba(26,115,232,0.25)"
                      }}>
                        <Upload size={14} />
                        <span>{isEs ? "Seleccionar archivo..." : "Select PDF or Image..."}</span>
                      </span>
                    </button>
                  </div>
                </div>

                {/* Quick Link to Public Custom Compounding Builder (/compounding) */}
                <div className="pls-gcp-card" style={{ padding: "16px 20px", background: "#f8fafd", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#202124", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Sparkles size={15} color="#7c3aed" />
                    <span>{isEs ? "Laboratorio de Formulación (/compounding)" : "Custom Compounding Lab (/compounding)"}</span>
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "#5f6368", margin: 0, lineHeight: 1.45 }}>
                    {isEs
                      ? "¿Quieres configurar una fórmula personalizada en cápsulas veganas HPMC paso a paso?"
                      : "Need to configure a custom vegan HPMC capsule formula step by step?"}
                  </p>
                  <Link
                    href="/compounding"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: "#1a73e8",
                      textDecoration: "none",
                      marginTop: "2px"
                    }}
                  >
                    <span>{isEs ? "Abrir Configurador de Fórmulas" : "Open Custom Formula Builder"}</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </aside>
            </div>
          </div>
        ) : isLoadingRx ? (
          <LabelsWorkspaceSkeleton isEs={isEs} />
        ) : (
          <LabelsErrorBoundary isEs={isEs}>
            <PharmacyLabelsModal
              key={`${activeCode}-${labelIndex}`}
              isOpen={true}
              onClose={() => {
                // Standalone mode maintains workspace
              }}
              labels={labels}
              initialLabelIndex={labelIndex}
              hideInternalPartsSwitcher={true}
              onLabelIndexChange={(newIdx) => {
                setLabelIndex(newIdx);
                const newUrl = `/labels?rx=${encodeURIComponent(activeCode)}&phase=${newIdx + 1}&edit=true&lang=${lang}`;
                window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
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
                    next[activeQueueIndex] = {
                      ...next[activeQueueIndex],
                      labels: updatedFields.pharmacyLabels
                    };
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
        )}

        {/* ── Hidden Offscreen Container for Batch High-Res SVG Rasterization ── */}
        <LabelsOffscreenRenderer patientQueue={patientQueue} />
      </main>

      {/* Import Prescription — shared engine, server-side persistence without Atlas validation */}
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
          if (first?.id || first?.code) handleSelectPatient(first.id || first.code);
        }}
      />

      {/* ── Fixed Bottom Atlas Copilot Dock (GCP Sticky Dock) ── */}
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
    </div>
  );
}
