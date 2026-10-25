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
  const [showImport, setShowImport] = useState(false);

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

  // Hydrate recents from localStorage
  useEffect(() => {
    setRecentPrescriptions(getRecentPrescriptions());
  }, []);

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

  // Native Web Share with Clipboard fallback (GCP mobile-friendly)
  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    const url = getShareUrl();
    const currentLabel = labels[labelIndex] || {};
    const formulaTitle = currentLabel.productTitle || currentLabel.productName || currentRx?.treatmentTitle || 'Compounded Pharmaceutical Formula';
    const partInfo = labels.length > 1 ? ` (Part ${labelIndex + 1}/${labels.length})` : '';

    const shareData = {
      title: `${patientName} • #${rxCode} Compounding Label`,
      text: isEs
        ? `🏷️ Pharmapolis Label Studio • Paciente: ${patientName} • Prescripción: #${rxCode} • Fórmula${partInfo}: ${formulaTitle}`
        : `🏷️ Pharmapolis Label Studio • Patient: ${patientName} • Prescription: #${rxCode} • Formula${partInfo}: ${formulaTitle}`,
      url: url,
    };

    if (navigator?.share && typeof navigator.canShare === 'function' && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('Web Share API error:', err);
        }
      }
    }

    if (navigator?.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedShareLink(true);
      setTimeout(() => setCopiedShareLink(false), 2500);
    }
  };

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
        copiedShareLink={copiedShareLink}
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
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {patientQueue.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
            <EmptyState
              icon={Layers}
              title={isEs ? 'Compounding Label Studio • Pharmapolis' : 'Compounding Label Studio • Pharmapolis'}
              subtitle={isEs ? 'Busca un paciente o nº de historia clínica (⌘K) para comenzar a diseñar y previsualizar etiquetas de frasco y de envío.' : 'Search for a patient or file # (⌘K) to start designing and previewing formula and courier shipping labels.'}
              action={{
                label: isEs ? 'Buscar Prescripción (⌘K)' : 'Search Prescriptions (⌘K)',
                onClick: () => {
                  setSearchOpen(true);
                  searchInputRef.current?.focus();
                }
              }}
            />

            {/* Quick Demo Cases */}
            <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', maxWidth: '640px', width: '100%' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {isEs ? 'O prueba con un paciente de ejemplo:' : 'Or test with a sample patient:'}
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                {FEATURED_PATIENTS.slice(0, 4).map((p) => (
                  <button
                    key={p.code}
                    type="button"
                    onClick={() => handleSelectOrAddPatient(p.code, true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.80rem',
                      fontWeight: 600,
                      color: '#1e293b',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#1a73e8';
                      e.currentTarget.style.color = '#1a73e8';
                      e.currentTarget.style.background = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#cbd5e1';
                      e.currentTarget.style.color = '#1e293b';
                      e.currentTarget.style.background = '#ffffff';
                    }}
                  >
                    <span>{p.name}</span>
                    <span style={{ fontSize: '0.70rem', color: '#64748b', fontFamily: 'monospace' }}>#{p.code}</span>
                  </button>
                ))}
              </div>
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
