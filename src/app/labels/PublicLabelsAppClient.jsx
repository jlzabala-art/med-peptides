'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import PharmacyLabelsModal from '@/components/prescription/PharmacyLabelsModal';
import ImportPrescriptionModal from '@/features/prescriptions/components/ImportPrescriptionModal';
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

// Label size presets and variants for individual patient customization
const LABEL_SIZE_PRESETS = [
  { id: '75x45', widthMm: 75, heightMm: 45, labelEn: '75 × 45 mm (Standard)', labelEs: '75 × 45 mm (Estándar)' },
  { id: '100x55', widthMm: 100, heightMm: 55, labelEn: '100 × 55 mm (Large Jar)', labelEs: '100 × 55 mm (Frasco Grande)' },
  { id: '90x38', widthMm: 90, heightMm: 38, labelEn: '90 × 38 mm (Vial / Ampoule)', labelEs: '90 × 38 mm (Vial / Ampolla)' },
];

const LABEL_VARIANT_OPTIONS = [
  { id: 'backQr', labelEs: 'Trasera con QR', labelEn: 'Back with QR' },
  { id: 'front', labelEs: 'Frontal sin QR', labelEn: 'Front without QR' },
  { id: 'frontWithQr', labelEs: 'Frontal con QR', labelEn: 'Front with QR' },
];

export default function PublicLabelsAppClient({
  initialRx,
  initialLabels = [],
  initialCode = '51812',
  initialQueue = [],
  initialEditMode = true,
  initialLabelIndex = 0,
  initialLang = 'en'
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Patient Batch Queue State
  const [patientQueue, setPatientQueue] = useState(() => {
    if (Array.isArray(initialQueue) && initialQueue.length > 0) {
      return initialQueue.map((item, idx) => ({
        code: String(item.code || item.rx?.fileNumber || item.rx?.code),
        rx: item.rx,
        labels: item.labels || [],
        selectedPartIndex: (idx === 0 && initialLabelIndex != null) ? initialLabelIndex : 0,
        variant: 'backQr',
        widthMm: 75,
        heightMm: 45
      }));
    }
    if (initialRx) {
      return [{
        code: String(initialCode || initialRx?.fileNumber || initialRx?.code || '51812'),
        rx: initialRx,
        labels: initialLabels || [],
        selectedPartIndex: initialLabelIndex || 0,
        variant: 'backQr',
        widthMm: 75,
        heightMm: 45
      }];
    }
    return [];
  });

  const [activeQueueIndex, setActiveQueueIndex] = useState(0);
  const [isGeneratingBatchPdf, setIsGeneratingBatchPdf] = useState(false);
  const [batchPdfProgress, setBatchPdfProgress] = useState(null);
  const [openConfigIdx, setOpenConfigIdx] = useState(null);

  // Active Single Prescription State (mirrored from queue)
  const [currentRx, setCurrentRx] = useState(initialRx);
  const [labels, setLabels] = useState(initialLabels);
  const [activeCode, setActiveCode] = useState(initialCode);
  const [labelIndex, setLabelIndex] = useState(initialLabelIndex);
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [lang, setLang] = useState(initialLang || 'en');
  const isEs = lang === 'es';

  // Search & Recent State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const [isLoadingRx, setIsLoadingRx] = useState(false);
  const [copyCodeSuccess, setCopyCodeSuccess] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const searchBoxRef = useRef(null);
  const searchInputRef = useRef(null);

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
    const phaseParam = activeItem?.selectedPartIndex ? `&phase=${activeItem.selectedPartIndex + 1}` : '&phase=1';
    const newUrl = `/labels?rx=${encodeURIComponent(codesParam)}${phaseParam}&edit=true&lang=${lang}`;
    window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
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
        const newItem = {
          code: cleanCode,
          rx: data.rx,
          labels: data.labels || [],
          selectedPartIndex: 0,
          variant: 'backQr',
          widthMm: 75,
          heightMm: 45
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
        alert(isEs ? `No se encontraron datos para la prescripción #${cleanCode}` : `No data found for prescription #${cleanCode}`);
      }
    } catch (err) {
      console.error('Error adding patient to batch:', err);
      alert(isEs ? 'Error al cargar la prescripción' : 'Failed to load prescription');
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
    setLabelIndex(item.selectedPartIndex || 0);
    updateUrlWithQueue(patientQueue, idx);
  };

  // Remove a patient from the queue
  const handleRemoveFromQueue = (idxToRemove, e) => {
    if (e) e.stopPropagation();
    if (patientQueue.length <= 1) return; // Keep at least one patient active

    const nextQueue = patientQueue.filter((_, i) => i !== idxToRemove);
    setPatientQueue(nextQueue);

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
      setLabelIndex(activeItem.selectedPartIndex || 0);
    }
    updateUrlWithQueue(nextQueue, nextActiveIdx);
  };

  // Update specific patient label config (format, size, variant, part)
  const handleUpdatePatientConfig = (idx, changes) => {
    setPatientQueue(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...changes };
      return next;
    });
    if (idx === activeQueueIndex && changes.selectedPartIndex != null) {
      setLabelIndex(changes.selectedPartIndex);
    }
  };

  // Generate and download A4 Multi-Patient Batch PDF
  const handleDownloadA4BatchPdf = async () => {
    if (!patientQueue.length) return;
    setIsGeneratingBatchPdf(true);
    setBatchPdfProgress({ current: 0, total: patientQueue.length, patient: '' });

    try {
      const batchItems = [];

      for (let i = 0; i < patientQueue.length; i++) {
        const pItem = patientQueue[i];
        const partIdx = pItem.selectedPartIndex || 0;
        const pLabel = pItem.labels[partIdx] || pItem.labels[0] || {};
        const pName = pItem.rx?.patient?.name || pItem.rx?.patientName || 'Patient';
        const rxC = pItem.code;
        const partLbl = pLabel.partLabel || (pItem.labels.length > 1 ? `Part ${partIdx + 1}` : '');

        // Grab SVG element from offscreen renderer
        const svgElId = `batch-svg-${rxC}-${partIdx}`;
        const svgEl = document.getElementById(svgElId);

        if (!svgEl) {
          console.warn(`SVG element #${svgElId} not found in DOM`);
          continue;
        }

        batchItems.push({
          patientName: pName,
          rxCode: rxC,
          partLabel: partLbl,
          widthMm: Number(pItem.widthMm) || 75,
          heightMm: Number(pItem.heightMm) || 45,
          svgElement: svgEl
        });
      }

      if (batchItems.length === 0) {
        alert(isEs ? 'No se encontraron las etiquetas SVG en el DOM' : 'Could not find rendered SVG labels in DOM');
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
      alert(isEs ? `Error al generar PDF A4: ${err.message}` : `Failed to generate A4 PDF: ${err.message}`);
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
      <style>{`
        .public-label-studio-root {
          min-height: 100vh;
          min-height: 100dvh;
          background: #f8fafc;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          display: flex;
          flex-direction: column;
          color: #202124;
        }

        /* Top Google Cloud Header */
        .pls-header {
          background: #ffffff;
          border-bottom: 1px solid #dadce0;
          padding: 8px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          position: sticky;
          top: 0;
          z-index: 60;
          box-shadow: 0 1px 2px rgba(60,64,67,0.06);
        }

        .pls-brand-link {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: inherit;
          flex-shrink: 0;
        }
        .pls-brand-icon {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: 800;
          font-size: 14px;
          box-shadow: 0 1px 3px rgba(26,115,232,0.3);
        }
        .pls-brand-text {
          display: flex;
          flex-direction: column;
        }
        .pls-brand-title {
          font-size: 0.90rem;
          font-weight: 700;
          color: #202124;
          letter-spacing: -0.2px;
          line-height: 1.2;
        }
        .pls-brand-subtitle {
          font-size: 0.68rem;
          color: #5f6368;
          font-weight: 500;
        }

        /* Search input container */
        .pls-search-container {
          position: relative;
          flex: 1;
          max-width: 580px;
          min-width: 220px;
        }
        .pls-search-input-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f1f3f4;
          border: 1px solid transparent;
          border-radius: 8px;
          padding: 6px 12px;
          transition: all 0.2s ease;
        }
        .pls-search-input-wrap:focus-within {
          background: #ffffff;
          border-color: #1a73e8;
          box-shadow: 0 1px 3px rgba(26,115,232,0.25);
        }
        .pls-search-input {
          border: none;
          background: transparent;
          outline: none;
          font-size: 0.85rem;
          color: #202124;
          width: 100%;
        }
        .pls-search-input::placeholder {
          color: #80868b;
        }
        .pls-search-badge {
          font-size: 0.65rem;
          background: #e8eaed;
          color: #5f6368;
          padding: 2px 5px;
          border-radius: 4px;
          font-weight: 600;
          letter-spacing: 0.5px;
          flex-shrink: 0;
        }

        /* Search dropdown */
        .pls-search-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          right: 0;
          background: #ffffff;
          border: 1px solid #dadce0;
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(60,64,67,0.18);
          max-height: 380px;
          overflow-y: auto;
          z-index: 100;
        }
        .pls-search-item {
          padding: 10px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #f1f3f4;
          cursor: pointer;
          transition: background 0.15s;
        }
        .pls-search-item:last-child {
          border-bottom: none;
        }
        .pls-search-item:hover {
          background: #f8fafd;
        }
        .pls-search-item-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }
        .pls-search-item-name {
          font-size: 0.84rem;
          font-weight: 600;
          color: #202124;
        }
        .pls-search-item-desc {
          font-size: 0.72rem;
          color: #5f6368;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .pls-search-item-badge {
          font-size: 0.68rem;
          font-weight: 600;
          color: #1a73e8;
          background: #e8f0fe;
          padding: 3px 8px;
          border-radius: 4px;
          flex-shrink: 0;
        }
        .pls-search-item-date {
          font-size: 0.70rem;
          color: #5f6368;
          font-weight: 500;
          background: #f1f3f4;
          padding: 1px 6px;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          gap: 3px;
        }
        .pls-search-item-action-wrap {
          flex-shrink: 0;
          margin-left: auto;
          padding-left: 10px;
          display: flex;
          align-items: center;
        }
        .pls-search-btn-add-batch {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1a73e8;
          font-size: 0.74rem;
          font-weight: 600;
          height: 32px;
          min-width: 76px;
          padding: 0 10px;
          border-radius: 4px;
          cursor: pointer;
          white-space: nowrap;
          flex-shrink: 0;
          transition: all 0.15s ease;
          box-sizing: border-box;
        }
        .pls-search-btn-add-batch:hover {
          background: #dbeafe;
          border-color: #93c5fd;
          color: #1e40af;
        }
        .pls-search-btn-add-batch.in-batch {
          background: #e6f4ea;
          border-color: #ceead6;
          color: #137333;
        }
        .pls-search-btn-add-batch.in-batch:hover {
          background: #d4edda;
        }

        /* Batch Patient Queue Strip */
        .pls-batch-bar {
          background: #ffffff;
          border-bottom: 1px solid #dadce0;
          padding: 8px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          position: sticky;
          top: 49px;
          z-index: 55;
          box-shadow: 0 1px 2px rgba(60,64,67,0.04);
        }
        .pls-batch-info-label {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }
        .pls-batch-count-badge {
          background: #e8f0fe;
          color: #1a73e8;
          font-size: 0.70rem;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 12px;
        }
        .pls-batch-scroll {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          min-width: 0;
          overflow-x: auto;
          padding: 2px 0;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .pls-batch-scroll::-webkit-scrollbar {
          display: none;
        }
        .pls-batch-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 0.76rem;
          cursor: pointer;
          white-space: nowrap;
          flex-shrink: 0;
          min-width: max-content;
          transition: all 0.15s ease;
          position: relative;
        }
        .pls-batch-pill:hover {
          background: #f1f5f9;
          border-color: #94a3b8;
        }
        .pls-batch-pill.active {
          background: #eff6ff;
          border-color: #1a73e8;
          box-shadow: 0 1px 3px rgba(26,115,232,0.18);
        }
        .pls-batch-pill-name {
          font-weight: 700;
          color: #1e293b;
        }
        .pls-batch-pill.active .pls-batch-pill-name {
          color: #1a73e8;
        }
        .pls-batch-pill-badge {
          font-size: 0.66rem;
          font-family: monospace;
          background: #e2e8f0;
          color: #475569;
          padding: 1px 5px;
          border-radius: 3px;
          font-weight: 600;
        }
        .pls-batch-pill.active .pls-batch-pill-badge {
          background: #dbeafe;
          color: #1e40af;
        }
        .pls-batch-pill-format-btn {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #065f46;
          font-size: 0.66rem;
          font-weight: 700;
          padding: 1px 5px;
          border-radius: 3px;
          cursor: pointer;
        }
        .pls-batch-pill-format-btn:hover {
          background: #d1fae5;
        }
        .pls-batch-pill-remove {
          background: transparent;
          border: none;
          cursor: pointer;
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2px;
          border-radius: 50%;
        }
        .pls-batch-pill-remove:hover {
          color: #ef4444;
          background: #fee2e2;
        }
        .pls-batch-popover {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 10px;
          box-shadow: 0 4px 16px rgba(15,23,42,0.15);
          z-index: 120;
          min-width: 220px;
        }
        .pls-popover-opt {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          text-align: left;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 0.72rem;
          color: #334155;
          cursor: pointer;
          transition: background 0.1s;
        }
        .pls-popover-opt:hover {
          background: #f1f3f4;
        }
        .pls-popover-opt.selected {
          background: #eff6ff;
          border-color: #93c5fd;
          color: #1e40af;
          font-weight: 700;
        }

        /* Top Header Action Buttons */
        .pls-actions-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .pls-btn-print-batch {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #1a73e8;
          color: #ffffff;
          border: 1px solid #1a73e8;
          border-radius: 6px;
          padding: 6px 12px;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 0 1px 2px rgba(26,115,232,0.3);
          transition: all 0.15s ease;
        }
        .pls-btn-print-batch:hover:not(:disabled) {
          background: #1557b0;
          border-color: #1557b0;
        }
        .pls-btn-print-batch:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .pls-btn-batch-count {
          background: rgba(255, 255, 255, 0.25);
          color: #ffffff;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 10px;
        }
        .pls-btn-share {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #ffffff;
          color: #3c4043;
          border: 1px solid #dadce0;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
        }
        .pls-btn-share:hover {
          background: #f8fafd;
          border-color: #1a73e8;
          color: #1a73e8;
        }
        .pls-lang-toggle {
          display: inline-flex;
          background: #f1f3f4;
          padding: 2px;
          border-radius: 4px;
          border: 1px solid #dadce0;
        }
        .pls-lang-btn {
          border: none;
          font-size: 0.70rem;
          padding: 3px 8px;
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .pls-lang-btn.active {
          background: #ffffff;
          color: #1a73e8;
          font-weight: 700;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        .pls-lang-btn.inactive {
          background: transparent;
          color: #5f6368;
          font-weight: 500;
        }

        /* Active Patient Context Strip */
        .pls-context-strip {
          background: #f8fafd;
          border-bottom: 1px solid #dadce0;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .pls-context-patient {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .pls-context-name {
          font-size: 0.92rem;
          font-weight: 700;
          color: #202124;
        }
        .pls-context-meta {
          font-size: 0.76rem;
          color: #5f6368;
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .pls-code-pill-wrap {
          background: #ffffff;
          border: 1px solid #dadce0;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          overflow: hidden;
          transition: border-color 0.15s;
        }
        .pls-code-pill-wrap:hover {
          border-color: #1a73e8;
        }
        .pls-code-pill-link {
          font-family: monospace;
          font-weight: 600;
          font-size: 0.76rem;
          color: #1a73e8;
          text-decoration: none;
          padding: 2px 7px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: background 0.15s;
        }
        .pls-code-pill-link:hover {
          background: #e8f0fe;
          text-decoration: underline;
        }
        .pls-code-pill-copy {
          background: transparent;
          border: none;
          border-left: 1px solid #dadce0;
          padding: 3px 6px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #5f6368;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .pls-code-pill-copy:hover {
          background: #f1f3f4;
          color: #1a73e8;
        }
        .pls-doctor-link {
          color: #202124;
          font-weight: 600;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 6px;
          border-radius: 4px;
          transition: all 0.15s;
        }
        .pls-doctor-link:hover {
          background: #e8f0fe;
          color: #1a73e8;
          text-decoration: underline;
        }

        /* Formula parts pills */
        .pls-parts-tabs {
          display: inline-flex;
          align-items: center;
          background: #e8eaed;
          padding: 2px;
          border-radius: 6px;
          gap: 2px;
        }
        .pls-part-btn {
          border: none;
          font-size: 0.74rem;
          padding: 4px 10px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          color: #5f6368;
          background: transparent;
          transition: all 0.15s;
        }
        .pls-part-btn.active {
          background: #ffffff;
          color: #1a73e8;
          font-weight: 700;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }

        /* Import button */
        .pls-btn-import {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 32px;
          padding: 0 12px;
          border-radius: 4px;
          border: 1px solid #1a73e8;
          background: #1a73e8;
          color: #ffffff;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, box-shadow 0.15s;
          white-space: nowrap;
        }
        .pls-btn-import:hover {
          background: #1765cc;
          box-shadow: 0 1px 3px rgba(60,64,67,0.3);
        }

        /* Unified Google Cloud Resource Metadata Strip (Zero nested cards) */
        .pls-meta-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          width: 100%;
        }
        .pls-meta-item {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          min-width: 0;
        }
        .pls-meta-icon {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .pls-meta-text {
          display: inline-flex;
          align-items: baseline;
          gap: 6px;
          min-width: 0;
        }
        .pls-meta-k {
          font-size: 0.70rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #5f6368;
          white-space: nowrap;
        }
        .pls-meta-v {
          font-size: 0.86rem;
          font-weight: 700;
          color: #202124;
          white-space: nowrap;
        }
        .pls-meta-v.mono {
          font-family: monospace;
          color: #1a73e8;
        }
        .pls-meta-link {
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .pls-meta-link:hover {
          text-decoration: underline;
        }
        .pls-meta-action-btn {
          background: transparent;
          border: none;
          color: #5f6368;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 2px 4px;
          border-radius: 4px;
          transition: background 0.15s, color 0.15s;
        }
        .pls-meta-action-btn:hover {
          background: #e8eaed;
          color: #202124;
        }
        .pls-meta-divider {
          width: 1px;
          height: 16px;
          background: #dadce0;
          flex-shrink: 0;
        }

        /* Mobile Adjustments (Golden Rule #23) */
        @media (max-width: 768px) {
          .pls-header {
            padding: 8px 12px !important;
            gap: 8px !important;
            flex-wrap: wrap !important;
          }
          .pls-brand-text {
            display: none !important;
          }
          .pls-actions-wrap {
            margin-left: auto;
            gap: 6px !important;
          }
          .pls-btn-print-batch .pls-btn-print-label {
            display: none;
          }
          .pls-btn-print-batch {
            padding: 6px 10px !important;
            height: 34px !important;
          }
          /* Search drops to its own full-width line */
          .pls-search-container {
            order: 3 !important;
            flex: 1 1 100% !important;
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
          }
          .pls-btn-import .pls-btn-label {
            display: none;
          }
          .pls-btn-import {
            width: 34px;
            height: 34px;
            padding: 0;
            justify-content: center;
          }
          .pls-search-input {
            font-size: 16px !important; /* Prevents iOS Safari auto-zoom */
          }
          .pls-search-badge {
            display: none !important;
          }
          .pls-btn-share {
            padding: 6px 8px !important;
            font-size: 0.74rem !important;
          }
          .pls-context-strip {
            padding: 8px 12px !important;
            gap: 6px !important;
          }
          .pls-meta-row {
            gap: 8px !important;
          }
          .pls-meta-divider {
            display: none;
          }
          .pls-meta-item {
            width: 100%;
            justify-content: flex-start;
          }
          .pls-meta-parts {
            margin-top: 4px;
          }
        }
      `}</style>

      {/* ── 1. Google Cloud Console Header ── */}
      <header className="pls-header">
        {/* Brand */}
        <Link href="/labels" className="pls-brand-link">
          <div className="pls-brand-icon">
            <span>℞</span>
          </div>
          <div className="pls-brand-text">
            <span className="pls-brand-title">Compounding Label Studio</span>
            <span className="pls-brand-subtitle">Pharmapolis • Atlas Health</span>
          </div>
        </Link>

        {/* Algolia Instant Search Container */}
        <div className="pls-search-container" ref={searchBoxRef}>
          <div className="pls-search-input-wrap">
            <Search size={15} color="#5f6368" />
            <input
              ref={searchInputRef}
              type="text"
              className="pls-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              placeholder={isEs
                ? "Buscar paciente o nº historia (Selección múltiple: puedes añadir varios)... (⌘K)"
                : "Search patient or file # (Multi-selection: add multiple to batch)... (⌘K)"}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#80868b' }}
              >
                <X size={14} />
              </button>
            )}
            <span className="pls-search-badge" title={isEs ? "Selección múltiple disponible" : "Multi-selection enabled"}>
              ⌘K • {isEs ? 'Múltiple' : 'Multi'}
            </span>
          </div>

          {/* Search Dropdown Results */}
          {searchOpen && (
            <div className="pls-search-dropdown">
              <div style={{ padding: '8px 12px', background: '#f8fafc', borderBottom: '1px solid #e8eaed', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.70rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {searchQuery 
                    ? (isEs ? 'Resultados de Algolia y Portal (Selecciona o añade al lote)' : 'Algolia & Portal Matches (Select or Add to Batch)')
                    : (recentPrescriptions.length > 0 
                        ? (isEs ? '🕒 Últimos 5 consultados' : '🕒 Recently Consulted (Last 5)')
                        : (isEs ? 'Prescripciones Destacadas' : 'Featured Prescriptions'))}
                </span>
                {searchQuery ? (
                  isSearching ? (
                    <span style={{ fontSize: '0.68rem', color: '#1a73e8' }}>Searching...</span>
                  ) : (
                    <span style={{ fontSize: '0.68rem', color: '#5f6368' }}>{searchResults.length} {searchResults.length === 1 ? 'match' : 'matches'}</span>
                  )
                ) : (
                  recentPrescriptions.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearRecent}
                      style={{ border: 'none', background: 'transparent', color: '#1a73e8', fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      {isEs ? 'Borrar Historial' : 'Clear History'}
                    </button>
                  )
                )}
              </div>

              {/* Items List */}
              {(() => {
                const itemsToRender = searchQuery.trim() 
                  ? searchResults 
                  : (recentPrescriptions.length > 0 ? recentPrescriptions : FEATURED_PATIENTS);

                if (itemsToRender.length === 0 && !isSearching) {
                  return (
                    <div style={{ padding: '16px', textAlign: 'center', fontSize: '0.80rem', color: '#80868b' }}>
                      {isEs ? 'No se encontraron registros.' : 'No matching records found.'}
                    </div>
                  );
                }

                return itemsToRender.map((item) => {
                  const dateStr = formatResultDate(item.date);
                  const isRecent = !searchQuery.trim() && recentPrescriptions.length > 0;
                  const isInBatch = patientQueue.some(p => String(p.code) === String(item.code));

                  return (
                    <div
                      key={`${item.code}-${item.id || item.timestamp || item.name}`}
                      className="pls-search-item"
                      onClick={() => handleSelectOrAddPatient(item.code, true)}
                    >
                      <div className="pls-search-item-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span className="pls-search-item-name">
                            {item.patientName || item.name || 'Patient'}
                          </span>
                          {isInBatch && (
                            <span style={{ fontSize: '0.65rem', color: '#1d4ed8', background: '#dbeafe', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                              {isEs ? '✓ En Lote' : '✓ In Batch'}
                            </span>
                          )}
                          {dateStr && (
                            <span className="pls-search-item-date" title={isEs ? 'Fecha de Prescripción' : 'Prescription Date'}>
                              📅 {dateStr}
                            </span>
                          )}
                          {isRecent && (
                            <span style={{ fontSize: '0.65rem', color: '#137333', background: '#e6f4ea', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>
                              {isEs ? 'Reciente' : 'Recent'}
                            </span>
                          )}
                        </div>
                        <div className="pls-search-item-desc">
                          #{item.code} • {item.title || item.treatmentTitle || 'Compounded Pharmaceutical Protocol'}
                        </div>
                      </div>
                      <div className="pls-search-item-action-wrap">
                        <button
                          type="button"
                          className={`pls-search-btn-add-batch ${isInBatch ? 'in-batch' : ''}`}
                          title={isInBatch ? (isEs ? "Ya está en el lote" : "Already in batch") : (isEs ? "Añadir a la cola de lote" : "Add to batch queue")}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectOrAddPatient(item.code, false);
                          }}
                        >
                          {isInBatch ? (
                            <>
                              <Check size={12} color="#137333" />
                              <span>{isEs ? 'En Lote' : 'In Batch'}</span>
                            </>
                          ) : (
                            <>
                              <Plus size={12} />
                              <span>{isEs ? 'Añadir' : 'Add'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>

        {/* Action Buttons: Print Batch A4, Import, Share, Language */}
        <div className="pls-actions-wrap">
          {/* Global Action: Print All Patients in A4 PDF Sheet */}
          <button
            type="button"
            className="pls-btn-print-batch"
            onClick={handleDownloadA4BatchPdf}
            disabled={isGeneratingBatchPdf || patientQueue.length === 0}
            title={isEs ? 'Imprimir todas las etiquetas del lote en un folio A4 en formato PDF' : 'Print all queued labels onto an A4 PDF sheet'}
            aria-label={isEs ? 'Imprimir Lote en A4 (PDF)' : 'Print Batch in A4 (PDF)'}
          >
            <Printer size={14} />
            <span className="pls-btn-print-label">
              {isGeneratingBatchPdf
                ? (batchPdfProgress
                    ? `${isEs ? 'Rasterizando' : 'Rendering'} ${batchPdfProgress.current}/${batchPdfProgress.total}...`
                    : (isEs ? 'Generando...' : 'Generating...'))
                : (isEs ? 'Imprimir Lote A4' : 'Print Batch A4')}
            </span>
            <span className="pls-btn-batch-count">
              {patientQueue.length}
            </span>
          </button>

          {/* Import Prescription (Account Managers · no Atlas validation) */}
          <button
            type="button"
            id="pls-import-rx-btn"
            className="pls-btn-import"
            onClick={() => setShowImport(true)}
            title={isEs ? 'Importar prescripción (Account Managers · sin validación Atlas)' : 'Import prescription (Account Managers · no Atlas validation)'}
            aria-label={isEs ? 'Importar prescripción' : 'Import prescription'}
          >
            <Upload size={14} />
            <span className="pls-btn-label">{isEs ? 'Importar Rx' : 'Import Rx'}</span>
          </button>

          {/* Share Button (Web Share API on mobile, Copy link fallback) */}
          <button
            type="button"
            className="pls-btn-share"
            onClick={handleShare}
            style={{
              borderColor: copiedShareLink ? '#ceead6' : '#dadce0',
              background: copiedShareLink ? '#e6f4ea' : '#ffffff',
              color: copiedShareLink ? '#137333' : '#3c4043'
            }}
            title={isEs ? 'Compartir enlace público del estudio' : 'Share public studio link'}
          >
            {copiedShareLink ? <Check size={14} color="#137333" /> : <Share2 size={14} />}
            <span>{copiedShareLink ? (isEs ? 'Copiado ✓' : 'Copied ✓') : (isEs ? 'Compartir' : 'Share')}</span>
          </button>

          {/* Language Switcher */}
          <div className="pls-lang-toggle">
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`pls-lang-btn ${!isEs ? 'active' : 'inactive'}`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang('es')}
              className={`pls-lang-btn ${isEs ? 'active' : 'inactive'}`}
            >
              ES
            </button>
          </div>
        </div>
      </header>

      {/* ── 2. Patient Batch Queue Strip (Multi-Patient & A4 Format) ── */}
      <section className="pls-batch-bar" aria-label="Patient Batch Queue">
        <div className="pls-batch-info-label">
          <Layers size={15} color="#1a73e8" />
          <span style={{ fontWeight: 700, fontSize: '0.80rem', color: '#1e293b' }}>
            {isEs ? 'Lote de Pacientes:' : 'Patient Batch:'}
          </span>
          <span className="pls-batch-count-badge">
            {patientQueue.length} {patientQueue.length === 1 ? (isEs ? 'paciente' : 'patient') : (isEs ? 'pacientes' : 'patients')}
          </span>
        </div>

        {/* Scrollable list of patient pills with per-patient format toggles */}
        <div className="pls-batch-scroll">
          {patientQueue.map((pItem, qIdx) => {
            const isActive = activeQueueIndex === qIdx;
            const pName = pItem.rx?.patient?.name || pItem.rx?.patientName || 'Patient';
            const sizeLabel = `${pItem.widthMm}×${pItem.heightMm}mm`;
            const isConfigOpen = openConfigIdx === qIdx;

            return (
              <div
                key={`queue-${pItem.code}-${qIdx}`}
                className={`pls-batch-pill ${isActive ? 'active' : ''}`}
                onClick={() => handleSwitchActivePatient(qIdx)}
                title={isEs ? `Activar etiquetas de ${pName}` : `Activate labels for ${pName}`}
              >
                <span className="pls-batch-pill-name">{pName}</span>
                <span className="pls-batch-pill-badge">#{pItem.code}</span>
                
                {/* Format badge & config toggle button */}
                <button
                  type="button"
                  className="pls-batch-pill-format-btn"
                  title={isEs ? 'Configurar formato individual de esta etiqueta' : 'Configure individual format for this label'}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenConfigIdx(isConfigOpen ? null : qIdx);
                  }}
                >
                  <span>{sizeLabel}</span>
                  <ChevronDown size={11} />
                </button>

                {/* Remove button if more than 1 patient */}
                {patientQueue.length > 1 && (
                  <button
                    type="button"
                    className="pls-batch-pill-remove"
                    title={isEs ? `Quitar a ${pName} del lote` : `Remove ${pName} from batch`}
                    onClick={(e) => handleRemoveFromQueue(qIdx, e)}
                    aria-label="Remove patient"
                  >
                    <X size={12} />
                  </button>
                )}

                {/* Per-patient config popover */}
                {isConfigOpen && (
                  <div
                    className="pls-batch-popover"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.74rem', marginBottom: '6px', color: '#0f172a' }}>
                      {isEs ? 'Formato de Etiqueta:' : 'Label Format:'}
                    </div>

                    {/* Size presets */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
                      {LABEL_SIZE_PRESETS.map((preset) => {
                        const isSelected = pItem.widthMm === preset.widthMm && pItem.heightMm === preset.heightMm;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            className={`pls-popover-opt ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleUpdatePatientConfig(qIdx, { widthMm: preset.widthMm, heightMm: preset.heightMm })}
                          >
                            <span>{isEs ? preset.labelEs : preset.labelEn}</span>
                            {isSelected && <Check size={12} color="#1a73e8" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Variant options */}
                    <div style={{ fontWeight: 700, fontSize: '0.74rem', marginBottom: '4px', color: '#0f172a' }}>
                      {isEs ? 'Tipo de Etiqueta:' : 'Label Variant:'}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
                      {LABEL_VARIANT_OPTIONS.map((variantOpt) => {
                        const isSelected = pItem.variant === variantOpt.id;
                        return (
                          <button
                            key={variantOpt.id}
                            type="button"
                            className={`pls-popover-opt ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleUpdatePatientConfig(qIdx, { variant: variantOpt.id })}
                          >
                            <span>{isEs ? variantOpt.labelEs : variantOpt.labelEn}</span>
                            {isSelected && <Check size={12} color="#1a73e8" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Formula part if multi-part */}
                    {pItem.labels.length > 1 && (
                      <>
                        <div style={{ fontWeight: 700, fontSize: '0.74rem', marginBottom: '4px', color: '#0f172a' }}>
                          {isEs ? 'Parte a Imprimir:' : 'Part to Print:'}
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {pItem.labels.map((lbl, pIdx) => (
                            <button
                              key={pIdx}
                              type="button"
                              className={`pls-popover-opt ${pItem.selectedPartIndex === pIdx ? 'selected' : ''}`}
                              style={{ flex: 1, justifyContent: 'center' }}
                              onClick={() => handleUpdatePatientConfig(qIdx, { selectedPartIndex: pIdx })}
                            >
                              {lbl.partLabel || `Part ${pIdx + 1}`}
                            </button>
                          ))}
                        </div>
                      </>
                    )}

                    <div style={{ marginTop: '8px', textAlign: 'right' }}>
                      <button
                        type="button"
                        style={{ border: 'none', background: '#1a73e8', color: '#fff', fontSize: '0.72rem', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer' }}
                        onClick={() => setOpenConfigIdx(null)}
                      >
                        {isEs ? 'Listo' : 'Done'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 3. Unified Google Cloud Resource Metadata Strip (Zero nested cards) ── */}
      <div className="pls-context-strip">
        <div className="pls-meta-row">
          {/* Patient Item */}
          <div className="pls-meta-item">
            <span className="pls-meta-icon" style={{ background: '#f3e8fd', color: '#8430ce' }}>
              <User size={13} />
            </span>
            <div className="pls-meta-text">
              <span className="pls-meta-k">{isEs ? 'Paciente' : 'Patient'}:</span>
              <span className="pls-meta-v">{patientName}</span>
            </div>
            <button
              type="button"
              className="pls-meta-action-btn"
              onClick={() => {
                setSearchQuery(patientName);
                setSearchOpen(true);
                searchInputRef.current?.focus();
              }}
              title={isEs ? `Buscar prescripciones de ${patientName}` : `Search prescriptions for ${patientName}`}
              aria-label={isEs ? 'Buscar paciente' : 'Search patient'}
            >
              <Search size={12} />
            </button>
          </div>

          <span className="pls-meta-divider" aria-hidden="true" />

          {/* Prescription Item */}
          <div className="pls-meta-item">
            <span className="pls-meta-icon" style={{ background: '#e8f0fe', color: '#1a73e8' }}>
              <FileText size={13} />
            </span>
            <div className="pls-meta-text">
              <span className="pls-meta-k">{isEs ? 'Prescripción' : 'Prescription'}:</span>
              <a
                href={`/rx/${encodeURIComponent(cleanRxCode)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="pls-meta-v mono pls-meta-link"
                title={isEs ? `Abrir prescripción #${cleanRxCode}` : `Open prescription #${cleanRxCode}`}
              >
                #{cleanRxCode}
                <ExternalLink size={11} style={{ opacity: 0.6 }} />
              </a>
            </div>
            <button
              type="button"
              className="pls-meta-action-btn"
              onClick={handleCopyCode}
              title={isEs ? 'Copiar código de prescripción' : 'Copy prescription code'}
              aria-label={isEs ? 'Copiar código' : 'Copy code'}
            >
              {copyCodeSuccess ? <Check size={12} color="#137333" /> : <Copy size={12} />}
            </button>
          </div>

          <span className="pls-meta-divider" aria-hidden="true" />

          {/* Doctor Item */}
          <div className="pls-meta-item">
            <span className="pls-meta-icon" style={{ background: '#e6f4ea', color: '#137333' }}>
              <Stethoscope size={13} />
            </span>
            <div className="pls-meta-text">
              <span className="pls-meta-k">{isEs ? 'Médico' : 'Doctor'}:</span>
              <a
                href={`/dr/${encodeURIComponent(doctorSlug)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="pls-meta-v pls-meta-link"
                title={isEs ? `Ir al portal clínico de ${docName}` : `Go to doctor portal of ${docName}`}
              >
                {docName}
                <ExternalLink size={11} style={{ opacity: 0.6 }} />
              </a>
            </div>
          </div>

          {/* Formula Parts Switcher (Part 1 / Part 2) */}
          {labels.length > 1 && (
            <>
              <span className="pls-meta-divider" aria-hidden="true" />
              <div className="pls-meta-item pls-meta-parts">
                <span className="pls-meta-k">{isEs ? 'Fórmula' : 'Formula'}:</span>
                <div className="pls-parts-tabs">
                  {labels.map((lbl, idx) => {
                    const isActive = labelIndex === idx;
                    const labelText = lbl.partLabel || `Part ${idx + 1}`;
                    return (
                      <button
                        key={idx}
                        type="button"
                        className={`pls-part-btn ${isActive ? 'active' : ''}`}
                        onClick={() => {
                          setLabelIndex(idx);
                          const newUrl = `/labels?rx=${encodeURIComponent(activeCode)}&phase=${idx + 1}&edit=true&lang=${lang}`;
                          window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
                        }}
                      >
                        {labelText}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── 4. Main Independent Label Studio Workspace ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {isLoadingRx ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#5f6368', fontSize: '0.90rem' }}>
            <p>{isEs ? 'Cargando datos de prescripción y formulación magistral...' : 'Loading prescription & compounding formulations...'}</p>
          </div>
        ) : (
          <PharmacyLabelsModal
            key={`${activeCode}-${labelIndex}`}
            isOpen={true}
            onClose={() => {
              // Standalone mode maintains workspace
            }}
            labels={labels}
            initialLabelIndex={labelIndex}
            initialEditMode={isEditing}
            isStandalone={true}
            isEs={isEs}
          />
        )}

        {/* ── Hidden Offscreen Container for Batch High-Res SVG Rasterization ── */}
        <div
          id="pls-offscreen-batch-render"
          style={{
            position: 'absolute',
            left: '-9999px',
            top: '-9999px',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
            pointerEvents: 'none',
            visibility: 'hidden'
          }}
          aria-hidden="true"
        >
          {patientQueue.map((pItem) => {
            const partIdx = pItem.selectedPartIndex || 0;
            const pLabel = pItem.labels[partIdx] || pItem.labels[0] || {};
            return (
              <div key={`offscreen-${pItem.code}-${partIdx}`}>
                <PharmapolisLabelSvg
                  labelData={pLabel}
                  variant={pItem.variant || 'backQr'}
                  widthMm={pItem.widthMm || 75}
                  heightMm={pItem.heightMm || 45}
                  showCutGuides={true}
                  svgRef={(node) => {
                    if (node) {
                      node.id = `batch-svg-${pItem.code}-${partIdx}`;
                    }
                  }}
                />
              </div>
            );
          })}
        </div>
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
    </div>
  );
}
