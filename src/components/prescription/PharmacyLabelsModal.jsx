'use client';

import React, { useState, useRef } from 'react';
import { X, Download, QrCode, ExternalLink, Check, Maximize2, Edit3, FileText, Copy, RotateCcw, Database, Eye, Pill, ChevronLeft, ChevronRight, Share2, AlertTriangle } from '@/lib/icons';
import StatusBadge from '@/components/ui/StatusBadge';
import { labelsRepository } from '@/repositories/labelsRepository';
import PharmapolisLabelSvg from './PharmapolisLabelSvg';
import { getCustomsFriendlySuggestions, findCustomsRisks } from '@/utils/labels/customsNaming';
import { formatApisForEditor, labelToMarkdown, parseMarkdownToLabel } from '@/utils/labels/labelMarkdown';
import ClinicPicker from '@/components/admin/patients/ClinicPicker';
import { canvasToPngBlobWithDpi } from '@/utils/pngDpi';

/**
 * Optical Print Legibility Pill Badge
 * Alarms with warning red when font size drops below 6.0 pt legal pharmaceutical threshold.
 */
function FontLegibilityPill({ pt = 0, isEs = false, compact = false }) {
  const isAlarm = pt < 6.0;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: compact ? '1px 6px' : '2px 8px',
        borderRadius: '4px',
        fontSize: compact ? '0.65rem' : '0.68rem',
        fontWeight: 700,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        background: isAlarm ? '#fef2f2' : '#f0fdf4',
        border: `1px solid ${isAlarm ? '#f87171' : '#86efac'}`,
        color: isAlarm ? '#dc2626' : '#15803d',
        boxShadow: isAlarm ? '0 1px 3px rgba(220,38,38,0.18)' : 'none',
        whiteSpace: 'nowrap',
        transition: 'all 0.2s ease'
      }}
      title={
        isAlarm
          ? (isEs ? `⚠️ Alarma de Legibilidad: ${pt} pt es menor que el mínimo legal recomendado de 6.0 pt. Ilegible sin lupa.` : `⚠️ Legibility Alarm: ${pt} pt is below the 6.0 pt regulatory threshold. Hard to read without magnification.`)
          : (isEs ? `✓ ${pt} pt cumple el estándar farmacéutico (≥ 6.0 pt legible)` : `✓ ${pt} pt meets pharmaceutical standard (≥ 6.0 pt readable)`)
      }
    >
      <span>{isAlarm ? '⚠️' : '✓'}</span>
      <span>{pt} pt</span>
      <span style={{ opacity: 0.85, fontWeight: 600 }}>
        {isAlarm ? (isEs ? '· ¡Alarma < 6 pt!' : '· Alarm < 6 pt!') : (isEs ? '· Legible' : '· Legible')}
      </span>
    </span>
  );
}

export default function PharmacyLabelsModal({
  isOpen,
  onClose,
  labels = [],
  initialLabelIndex = 0,
  isEs = false,
  initialEditMode = false,
  isStandalone = false,
  onPrescriptionUpdated = null
}) {
  const [selectedProductIdx, setSelectedProductIdx] = useState(initialLabelIndex || 0);
  const [activeVariant, setActiveVariantState] = useState(() => {
    const valid = ['front', 'backQr', 'frontWithQr', 'shipping'];
    const saved = labels?.[initialLabelIndex]?.lastVariant || labels?.[0]?.lastVariant;
    if (valid.includes(saved)) return saved;
    try {
      const ls = typeof window !== 'undefined' ? window.localStorage.getItem('pharmacyLabelVariant') : null;
      if (valid.includes(ls)) return ls;
    } catch { /* storage unavailable */ }
    return 'backQr';
  }); // 'front' | 'backQr' | 'frontWithQr' | 'shipping'
  const setActiveVariant = (v) => {
    setActiveVariantState(v);
    try { window.localStorage.setItem('pharmacyLabelVariant', v); } catch { /* storage unavailable */ }
  };
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [exportFormat, setExportFormat] = useState('png'); // 'png' | 'pdf' (Default to PNG as requested)
  const [isGeneratingPng, setIsGeneratingPng] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [compareMode, setCompareMode] = useState(true); // show Delivery + Shipping side by side by default
  const [shippingDraft, setShippingDraft] = useState(null); // null = not editing
  const [dpi, setDpi] = useState(300); // 300 | 600 | 1200
  const [showCutGuides, setShowCutGuides] = useState(false); // Scissor cut lines & crop marks toggle (default false for clean label)
  const [zoomLevel, setZoomLevel] = useState('fit'); // 'fit' | 1 | 1.5 | 2

  // Live Online Editing & Markdown Support
  const [isEditing, setIsEditing] = useState(Boolean(initialEditMode));
  const [editorTab, setEditorTab] = useState('fields'); // 'fields' | 'markdown'
  const [editedOverrides, setEditedOverrides] = useState({});
  const [markdownText, setMarkdownText] = useState('');
  const [apisEditorText, setApisEditorText] = useState('');
  const [copiedMd, setCopiedMd] = useState(false);
  const [isSavingToFirebase, setIsSavingToFirebase] = useState(false);
  const [firebaseSaveSuccess, setFirebaseSaveSuccess] = useState(false);
  const [firebaseSaveError, setFirebaseSaveError] = useState(null);

  // Sync selected index when opened or changed from outside
  React.useEffect(() => {
    if (initialLabelIndex != null && initialLabelIndex >= 0 && labels && initialLabelIndex < labels.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedProductIdx(initialLabelIndex);
    }
  }, [initialLabelIndex, labels]);

  // Sizing Presets & Custom Dimensions
  const [selectedPreset, setSelectedPreset] = useState('75x45');
  const [dimensions, setDimensions] = useState({ widthMm: 75, heightMm: 45 });
  const [customWidth, setCustomWidth] = useState(75);
  const [customHeight, setCustomHeight] = useState(45);

  const svgContainerRef = useRef(null);

  // Keep markdown text & apis text synced when selected product changes (must run unconditionally before any early returns)
  React.useEffect(() => {
    if (!isOpen || !labels || labels.length === 0) return;
    const active = editedOverrides[selectedProductIdx] || labels[selectedProductIdx] || labels[0];
    if (active) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMarkdownText(active.labelMarkdown || labelToMarkdown(active));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setApisEditorText(formatApisForEditor(active));
    }
  }, [isOpen, selectedProductIdx, labels]);

  if (!isOpen || !labels || labels.length === 0) return null;

  const baseItem = labels[selectedProductIdx] || labels[0];
  const currentItem = editedOverrides[selectedProductIdx] || baseItem;

  const handleFieldChange = (key, val) => {
    const updated = { ...currentItem, [key]: val };
    const newMd = labelToMarkdown(updated);
    updated.labelMarkdown = newMd;
    setEditedOverrides(prev => ({
      ...prev,
      [selectedProductIdx]: updated
    }));
    setMarkdownText(newMd);
  };

  const handleApisFieldChange = (rawText) => {
    setApisEditorText(rawText);
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    const apisArray = lines.map(line => {
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0) {
        const drug = line.slice(0, colonIdx).trim();
        const dose = line.slice(colonIdx + 1).trim();
        return {
          drugName: drug,
          name: drug,
          activeIngredient: drug,
          dosage: dose,
          dose: dose,
          strength: dose,
          concentration: dose
        };
      }
      return {
        drugName: line,
        name: line,
        activeIngredient: line,
        dosage: '',
        dose: '',
        strength: '',
        concentration: ''
      };
    });
    const updated = {
      ...currentItem,
      apis: apisArray,
      formula: lines.join(' + ')
    };
    const newMd = labelToMarkdown(updated);
    updated.labelMarkdown = newMd;
    setEditedOverrides(prev => ({
      ...prev,
      [selectedProductIdx]: updated
    }));
    setMarkdownText(newMd);
  };

  const handleMarkdownChange = (newMd) => {
    setMarkdownText(newMd);
    const parsed = parseMarkdownToLabel(newMd, baseItem);
    parsed.labelMarkdown = newMd;
    setEditedOverrides(prev => ({
      ...prev,
      [selectedProductIdx]: parsed
    }));
    setApisEditorText(formatApisForEditor(parsed));
  };

  const handleResetOriginal = () => {
    setEditedOverrides(prev => {
      const copy = { ...prev };
      delete copy[selectedProductIdx];
      return copy;
    });
    const original = labels[selectedProductIdx] || labels[0];
    if (original) {
      setMarkdownText(original.labelMarkdown || labelToMarkdown(original));
      setApisEditorText(formatApisForEditor(original));
    }
  };

  const handleCopyMarkdown = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(markdownText);
      setCopiedMd(true);
      setTimeout(() => setCopiedMd(false), 2000);
    }
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([markdownText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const rawPatient = currentItem.patientName || currentItem.patient?.name || '';
    const patientClean = rawPatient.trim().replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
    const rxCodeClean = String(currentItem.fileNumber || currentItem.rxCode || 'RX').trim().replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
    a.download = `PHARMAPOLIS_${patientClean || 'LABEL'}_${rxCodeClean}_spec.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getShareUrl = () => {
    if (typeof window === 'undefined') return '';
    const rawCode = currentItem.fileNumber || currentItem.rxCode || baseItem.fileNumber || baseItem.rxCode || baseItem.id || '';
    const cleanCode = encodeURIComponent(String(rawCode).trim());
    const origin = window.location.origin;
    const phaseParam = (selectedProductIdx != null && selectedProductIdx > 0) ? `&phase=${selectedProductIdx + 1}` : '';
    return `${origin}/labels?rx=${cleanCode}${phaseParam}&edit=true`;
  };

  const handleShareEditor = async () => {
    if (typeof window === 'undefined') return;
    const url = getShareUrl();
    const rawPatient = currentItem.patientName || currentItem.patient?.name || baseItem.patientName || 'Patient';
    const rawCode = currentItem.fileNumber || currentItem.rxCode || baseItem.fileNumber || baseItem.id || '';
    const title = currentItem.productTitle || currentItem.productName || 'Compounded Pharmaceutical Formulation';
    const partText = labels.length > 1 ? ` (Part ${(selectedProductIdx || 0) + 1})` : '';

    const shareData = {
      title: `${rawPatient} • #${rawCode} Compounding Label`,
      text: isEs
        ? `🏷️ Pharmapolis Label Studio • Paciente: ${rawPatient} • Prescripción: #${rawCode} • Fórmula${partText}: ${title}`
        : `🏷️ Pharmapolis Label Studio • Patient: ${rawPatient} • Prescription: #${rawCode} • Formula${partText}: ${title}`,
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

  const handleShareWhatsApp = () => {
    if (typeof window === 'undefined') return;
    const url = getShareUrl();
    const rawPatient = currentItem.patientName || currentItem.patient?.name || baseItem.patientName || 'Patient';
    const rawCode = currentItem.fileNumber || currentItem.rxCode || baseItem.fileNumber || baseItem.id || '';
    const title = currentItem.productTitle || currentItem.productName || 'Compounded Pharmaceutical Formulation';
    const partText = labels.length > 1 ? ` (Part ${(selectedProductIdx || 0) + 1})` : '';

    const text = isEs
      ? `🏷️ *Pharmapolis Compounding Label Studio*\n👤 *Paciente:* ${rawPatient}\n📋 *Prescripción:* #${rawCode}\n💊 *Fórmula${partText}:* ${title}\n🔗 *Ver y Editar Etiqueta:* ${url}`
      : `🏷️ *Pharmapolis Compounding Label Studio*\n👤 *Patient:* ${rawPatient}\n📋 *Prescription:* #${rawCode}\n💊 *Formula${partText}:* ${title}\n🔗 *View & Edit Label:* ${url}`;

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSaveToFirebase = async (explicitStatus = null) => {
    try {
      setIsSavingToFirebase(true);
      setFirebaseSaveError(null);
      setFirebaseSaveSuccess(false);

      const rawId = currentItem.rxId || currentItem.prescriptionId || currentItem.fileNumber || currentItem.id;
      // Guard strictly against React SyntheticEvent being passed when used as onClick={handleSaveToFirebase}
      const safeExplicitStatus = typeof explicitStatus === 'string' && explicitStatus.trim() ? explicitStatus.trim() : null;
      const targetStatus = safeExplicitStatus 
        || (typeof currentItem.approvalStatus === 'string' ? currentItem.approvalStatus : null) 
        || 'draft';

      const saveResult = await labelsRepository.savePrescriptionLabel({
        rawId,
        currentItem: {
          ...currentItem,
          approvalStatus: targetStatus
        },
        markdownText,
        activeVariant,
        labels,
        selectedProductIdx,
        editedOverrides,
        approvalStatus: targetStatus
      });

      if (saveResult.updatedLabel) {
        setEditedOverrides(prev => ({
          ...prev,
          [selectedProductIdx]: {
            ...(prev[selectedProductIdx] || {}),
            ...saveResult.updatedLabel
          }
        }));
      }

      setFirebaseSaveSuccess(true);
      setTimeout(() => setFirebaseSaveSuccess(false), 3000);

      // Dispatch event to inform other active components (e.g. prescription views)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('prescription-updated', {
          detail: {
            id: saveResult.docId,
            rxId: rawId,
            updatedFields: saveResult.payload,
            updatedData: saveResult.payload,
            item: saveResult.updatedLabel || currentItem
          }
        }));
      }

      if (typeof onPrescriptionUpdated === 'function') {
        onPrescriptionUpdated({
          id: saveResult.docId,
          rxId: rawId,
          updatedFields: saveResult.payload,
          updatedData: saveResult.payload,
          item: saveResult.updatedLabel || currentItem
        });
      }
    } catch (err) {
      console.error('[PharmacyLabelsModal] Error saving to Firebase via labelsRepository:', err);
      setFirebaseSaveError(err.message || 'Error saving to Firebase');
      setTimeout(() => setFirebaseSaveError(null), 4000);
    } finally {
      setIsSavingToFirebase(false);
    }
  };

  // Calculated pixel dimensions at current DPI: (mm / 25.4) * DPI
  const exportWidthPx = Math.round((dimensions.widthMm / 25.4) * dpi);
  const exportHeightPx = Math.round((dimensions.heightMm / 25.4) * dpi);

  // ── Optical Print Typography Monitor & Regulatory Alarm (< 6.0 pt) ──
  const calculatePhysicalPt = (svgUnits) => {
    return Number(((svgUnits * (dimensions.widthMm || 75)) / 529.17).toFixed(1));
  };

  const parsedApisCount = (apisEditorText || '').split('\n').filter(l => l.trim()).length || 1;
  const rawDirText = currentItem.directions || currentItem.instructions || '';
  const dirLinesCount = Math.max(1, Math.ceil(rawDirText.length / 54));
  const patNameLength = (currentItem.patientName || '').length;

  let dirSvgUnits = 26;
  let ingSvgUnits = 26;
  let patSvgUnits = 34;
  let titleSvgUnits = 38;

  if (activeVariant === 'backQr') {
    ingSvgUnits = parsedApisCount <= 2 ? 28 : (parsedApisCount <= 4 ? 26 : 22);
    dirSvgUnits = dirLinesCount <= 2 ? 26 : 23;
    patSvgUnits = patNameLength > 36 ? 30 : (patNameLength > 28 ? 34 : 38);
    titleSvgUnits = 32;
  } else if (activeVariant === 'front' || activeVariant === 'frontWithQr') {
    ingSvgUnits = 38;
    dirSvgUnits = 35;
    patSvgUnits = patNameLength > 36 ? 30 : (patNameLength > 28 ? 34 : 38);
    titleSvgUnits = (currentItem.productTitle || '').length > 48 ? 44 : 50;
  } else if (activeVariant === 'shipping') {
    const calcHeight = Math.round(((dimensions.heightMm || 45) / (dimensions.widthMm || 75)) * 1500);
    const shipBase = Math.min(35, Math.max(24, Math.round(calcHeight * 0.040)));
    dirSvgUnits = shipBase;
    ingSvgUnits = shipBase;
    patSvgUnits = shipBase;
    titleSvgUnits = Math.min(48, Math.max(32, Math.round(calcHeight * 0.054)));
  }

  const dirPt = calculatePhysicalPt(dirSvgUnits);
  const ingPt = calculatePhysicalPt(ingSvgUnits);
  const patientPt = calculatePhysicalPt(patSvgUnits);
  const titlePt = calculatePhysicalPt(titleSvgUnits);
  const minPatientPt = Math.min(dirPt, ingPt, patientPt);
  const hasFontAlarm = minPatientPt < 6.0;

  const PRESETS = [
    { id: '100x55', label: '100 × 55 mm', sub: isEs ? 'Bote Cilíndrico 100ml' : 'Compounding Bottle 100ml', w: 100, h: 55 },
    { id: '70x35_pomade', label: '70 × 35 mm', sub: isEs ? 'Tarro Pomada 30g' : 'Topical Pomade Jar 30g', w: 70, h: 35 },
    { id: '75x45', label: '75 × 45 mm', sub: isEs ? 'Estándar' : 'Standard', w: 75, h: 45 },
    { id: '90x38', label: '90 × 38 mm', sub: isEs ? 'Térmica' : 'Thermal', w: 90, h: 38 },
    { id: '100x50', label: '100 × 50 mm', sub: isEs ? 'Caja' : 'Box', w: 100, h: 50 },
    { id: '50x30', label: '50 × 30 mm', sub: isEs ? 'Mini Vial' : 'Mini Vial', w: 50, h: 30 },
    { id: 'custom', label: isEs ? 'Medida Libre' : 'Custom Size', sub: 'mm', w: null, h: null }
  ];

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset.id);
    if (preset.id !== 'custom') {
      setDimensions({ widthMm: preset.w, heightMm: preset.h });
      setCustomWidth(preset.w);
      setCustomHeight(preset.h);
    }
  };

  const handleCustomWidthChange = (val) => {
    const num = Math.max(25, Math.min(250, Number(val) || 25));
    setCustomWidth(num);
    setDimensions(prev => ({ ...prev, widthMm: num }));
  };

  const handleCustomHeightChange = (val) => {
    const num = Math.max(20, Math.min(200, Number(val) || 20));
    setCustomHeight(num);
    setDimensions(prev => ({ ...prev, heightMm: num }));
  };

  // Dynamic High-Resolution PNG Generator from SVG with user-selected DPI (300 / 600 / 1200)
  const handleDownloadPng = async () => {
    try {
      setIsGeneratingPng(true);
      const svgElement = svgContainerRef.current?.querySelector('svg');
      if (!svgElement) {
        setIsGeneratingPng(false);
        return;
      }

      const widthPx = exportWidthPx;
      const heightPx = exportHeightPx;

      const clonedSvg = svgElement.cloneNode(true);
      clonedSvg.setAttribute('width', `${widthPx}px`);
      clonedSvg.setAttribute('height', `${heightPx}px`);

      const svgXml = new XMLSerializer().serializeToString(clonedSvg);
      const svgBlob = new Blob([svgXml], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = widthPx;
        canvas.height = heightPx;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, widthPx, heightPx);
        ctx.drawImage(img, 0, 0, widthPx, heightPx);
        URL.revokeObjectURL(svgUrl);

        // Embed the selected DPI in the PNG metadata (pHYs) so viewers/printers
        // read the same resolution that was selected (canvas defaults to 72 DPI).
        const pngBlob = await canvasToPngBlobWithDpi(canvas, dpi);
        const pngObjectUrl = URL.createObjectURL(pngBlob);
        const downloadLink = document.createElement('a');
        downloadLink.href = pngObjectUrl;

        // ── Standardized Clinical File Naming Engine (Supplier + Patient + Rx + Part + Size + Specs) ──
        const rawSupplier = currentItem.pharmacy || currentItem.supplier || 'Pharmapolis';
        const supplierClean = rawSupplier.replace(/Compounding|Pharmacy|L\.?L\.?C\.?/gi, '').trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || 'PHARMAPOLIS';

        const rawPatient = currentItem.patientName || currentItem.patient?.name || currentItem.patient || '';
        const patientClean = rawPatient.trim().replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();

        const rxCodeClean = String(currentItem.fileNumber || currentItem.rxCode || currentItem.id || 'RX')
          .trim()
          .replace(/[^a-zA-Z0-9-]/g, '')
          .toUpperCase();

        const isMultiPart = labels.length > 1 || Boolean(currentItem.phaseNumber && currentItem.phaseNumber > 0);
        const partTag = isMultiPart ? `PART-${currentItem.phaseNumber || (selectedProductIdx + 1)}` : '';

        const rawVol = String(currentItem.volume || currentItem.size || currentItem.netContent || '').trim();
        let sizeTag = '';
        const volMatch = rawVol.match(/(\d+(?:\.\d+)?)\s*(ml|caps?|capsules?|g|mg)?/i);
        if (volMatch) {
          const num = volMatch[1];
          let unit = (volMatch[2] || '').toUpperCase();
          if (unit.startsWith('CAP')) unit = 'CAPS';
          sizeTag = `${num}${unit}`;
        } else if (rawVol) {
          sizeTag = rawVol.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8);
        }

        const variantClean = activeVariant === 'backQr' ? 'BACK-QR' : activeVariant === 'frontWithQr' ? 'FRONT-QR' : activeVariant === 'shipping' ? 'SHIPPING' : 'FRONT';

        const nameSegments = [supplierClean, patientClean, rxCodeClean, partTag, sizeTag, `${dimensions.widthMm}x${dimensions.heightMm}mm`, variantClean, `${dpi}DPI`].filter(Boolean);
        downloadLink.download = `${nameSegments.join('_')}.png`;
        downloadLink.click();
        setTimeout(() => URL.revokeObjectURL(pngObjectUrl), 2000);
        setIsGeneratingPng(false);
      };
      img.onerror = () => {
        setIsGeneratingPng(false);
      };
      img.src = svgUrl;
    } catch (err) {
      console.error('Error generating PNG:', err);
      setIsGeneratingPng(false);
    }
  };

  // High-Precision SVG-to-Canvas rasterizer at specified physical DPI
  const svgElementToImageData = async (svgEl, widthMm, heightMm, targetDpi = 600) => {
    const widthPx = Math.round((widthMm / 25.4) * targetDpi);
    const heightPx = Math.round((heightMm / 25.4) * targetDpi);
    const clonedSvg = svgEl.cloneNode(true);
    clonedSvg.setAttribute('width', `${widthPx}px`);
    clonedSvg.setAttribute('height', `${heightPx}px`);

    const svgXml = new XMLSerializer().serializeToString(clonedSvg);
    const svgBlob = new Blob([svgXml], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = widthPx;
          canvas.height = heightPx;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, widthPx, heightPx);
          ctx.drawImage(img, 0, 0, widthPx, heightPx);
          URL.revokeObjectURL(svgUrl);
          resolve(canvas.toDataURL('image/png', 1.0));
        } catch (err) {
          URL.revokeObjectURL(svgUrl);
          reject(err);
        }
      };
      img.onerror = (err) => {
        URL.revokeObjectURL(svgUrl);
        reject(err);
      };
      img.src = svgUrl;
    });
  };

  // High-Resolution 1:1 Physical Scaled PDF Generator (Editable & Vector Compatible)
  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      const svgElement = svgContainerRef.current?.querySelector('svg');
      if (!svgElement) {
        setIsGeneratingPdf(false);
        return;
      }

      const imgData = await svgElementToImageData(svgElement, dimensions.widthMm, dimensions.heightMm, Math.max(dpi, 600));

      const { jsPDF } = await import('jspdf');
      const isLandscape = dimensions.widthMm >= dimensions.heightMm;
      const pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [dimensions.widthMm, dimensions.heightMm],
        compress: true
      });

      pdf.addImage(imgData, 'PNG', 0, 0, dimensions.widthMm, dimensions.heightMm, undefined, 'SLOW');

      // Standardized Clinical File Naming Engine (Supplier + Patient + Rx + Part + Size + Specs)
      const rawSupplier = currentItem.pharmacy || currentItem.supplier || 'Pharmapolis';
      const supplierClean = rawSupplier.replace(/Compounding|Pharmacy|L\.?L\.?C\.?/gi, '').trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || 'PHARMAPOLIS';

      const rawPatient = currentItem.patientName || currentItem.patient?.name || currentItem.patient || '';
      const patientClean = rawPatient.trim().replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();

      const rxCodeClean = String(currentItem.fileNumber || currentItem.rxCode || currentItem.id || 'RX')
        .trim()
        .replace(/[^a-zA-Z0-9-]/g, '')
        .toUpperCase();

      const isMultiPart = labels.length > 1 || Boolean(currentItem.phaseNumber && currentItem.phaseNumber > 0);
      const partTag = isMultiPart ? `PART-${currentItem.phaseNumber || (selectedProductIdx + 1)}` : '';

      const rawVol = String(currentItem.volume || currentItem.size || currentItem.netContent || '').trim();
      let sizeTag = '';
      const volMatch = rawVol.match(/(\d+(?:\.\d+)?)\s*(ml|caps?|capsules?|g|mg)?/i);
      if (volMatch) {
        const num = volMatch[1];
        let unit = (volMatch[2] || '').toUpperCase();
        if (unit.startsWith('CAP')) unit = 'CAPS';
        sizeTag = `${num}${unit}`;
      } else if (rawVol) {
        sizeTag = rawVol.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8);
      }

      const variantClean = activeVariant === 'backQr' ? 'BACK-QR' : activeVariant === 'frontWithQr' ? 'FRONT-QR' : activeVariant === 'shipping' ? 'SHIPPING' : 'FRONT';

      const nameSegments = [supplierClean, patientClean, rxCodeClean, partTag, sizeTag, `${dimensions.widthMm}x${dimensions.heightMm}mm`, variantClean].filter(Boolean);

      pdf.setProperties({
        title: nameSegments.join('_'),
        subject: currentItem.productTitle || currentItem.productName || 'Pharmapolis Compounded Label',
        author: 'Pharmapolis Dispensary / Atlas Clinical Services',
        creator: 'Pharmapolis Digital Prescription Registry'
      });

      pdf.save(`${nameSegments.join('_')}.pdf`);
    } catch (innerErr) {
      console.error('Error generating PDF with jsPDF:', innerErr);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Full package: every part × (Delivery + Shipping) as PNGs + manifest, bundled in one ZIP
  const handleDownloadZipPackage = async () => {
    setIsGeneratingZip(true);
    let root = null;
    let host = null;
    try {
      const [{ default: JSZip }, { createRoot }, { flushSync }] = await Promise.all([
        import('jszip'),
        import('react-dom/client'),
        import('react-dom')
      ]);
      const zip = new JSZip();
      host = document.createElement('div');
      host.style.cssText = 'position:fixed;left:-99999px;top:0;width:1500px;pointer-events:none;';
      document.body.appendChild(host);
      root = createRoot(host);

      const clean = (v, fallback = '') => String(v || fallback).trim().replace(/[^a-zA-Z0-9-]/g, '_').toUpperCase();
      const variants = [['backQr', 'DELIVERY'], ['shipping', 'SHIPPING']];
      const manifest = [];
      const first = editedOverrides[0] ? { ...labels[0], ...editedOverrides[0] } : labels[0];
      const rxClean = clean(first?.fileNumber || first?.rxCode || first?.id, 'RX');
      const patientClean = clean(first?.patientName || first?.patient?.name);
      const folder = [rxClean, patientClean].filter(Boolean).join('_');

      for (let idx = 0; idx < labels.length; idx++) {
        const item = editedOverrides[idx] ? { ...labels[idx], ...editedOverrides[idx] } : labels[idx];
        const partTag = labels.length > 1 ? `PART-${item.phaseNumber || idx + 1}` : '';
        for (const [variantKey, variantName] of variants) {
          flushSync(() => {
            root.render(
              <PharmapolisLabelSvg
                labelData={item}
                variant={variantKey}
                widthMm={dimensions.widthMm}
                heightMm={dimensions.heightMm}
                showCutGuides={false}
              />
            );
          });
          const svgEl = host.querySelector('svg');
          if (!svgEl) continue;
          const dataUrl = await svgElementToImageData(svgEl, dimensions.widthMm, dimensions.heightMm, dpi);
          const blob = await (await fetch(dataUrl)).blob();
          const fileName = [rxClean, patientClean, partTag, variantName, `${dpi}DPI`].filter(Boolean).join('_') + '.png';
          zip.file(`${folder}/${variantName}/${fileName}`, blob);
          manifest.push({
            part: item.phaseNumber || idx + 1,
            variant: variantName,
            file: `${variantName}/${fileName}`,
            title: variantKey === 'shipping'
              ? (item.shippingTitle || getCustomsFriendlySuggestions(item)[0])
              : (item.productTitle || item.productName || ''),
            customsRisks: variantKey === 'shipping' ? findCustomsRisks(item) : undefined
          });
        }
      }

      zip.file(`${folder}/manifest.json`, JSON.stringify({ generatedAt: new Date().toISOString(), dpi, files: manifest }, null, 2));
      const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${folder}_LABELS.zip`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (err) {
      console.error('Error generating labels ZIP:', err);
      setFirebaseSaveError(isEs ? 'No se pudo generar el ZIP' : 'Could not generate the ZIP');
      setTimeout(() => setFirebaseSaveError(null), 4000);
    } finally {
      if (root) root.unmount();
      if (host) host.remove();
      setIsGeneratingZip(false);
    }
  };

  // Bulk High-Precision PDF Generator (Supports 1:1 Multi-Page Roll & A4 10-Sticker Sheets)
  const handleDownloadAllPdf = async (mode = 'individual') => {
    try {
      setIsGeneratingPdf(true);
      const { jsPDF } = await import('jspdf');

      if (mode === 'a4_sheet') {
        // European standard A4 Sticker Sheet (210 × 297 mm, 2 columns × 5 rows = 10 stickers, 75 × 45 mm)
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
          compress: true
        });

        const STICKER_W = 75;
        const STICKER_H = 45;
        const MARGIN_LEFT = 25;
        const MARGIN_TOP = 25;
        const COL_GAP = 10;
        const ROW_GAP = 5;
        const COLS = 2;
        const ROWS = 5;
        const STICKERS_PER_PAGE = COLS * ROWS;

        const totalPages = Math.max(1, Math.ceil(labels.length / STICKERS_PER_PAGE));

        for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
          if (pageIdx > 0) pdf.addPage('a4', 'portrait');

          // Header
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(8);
          pdf.setTextColor(71, 85, 105);
          pdf.text(`PHARMAPOLIS COMPOUNDING PHARMACY — A4 PRESCRIPTION LABELS (75 × 45 mm) | Sheet ${pageIdx + 1}/${totalPages}`, MARGIN_LEFT, 14);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(7);
          pdf.setTextColor(148, 163, 184);
          pdf.text(`EU GMP Vector Standard • High-Precision Resolution (600 DPI) • Generated ${new Date().toLocaleDateString('en-GB')}`, MARGIN_LEFT, 18);

          const pageLabels = labels.slice(pageIdx * STICKERS_PER_PAGE, (pageIdx + 1) * STICKERS_PER_PAGE);

          for (let i = 0; i < pageLabels.length; i++) {
            const globalIdx = pageIdx * STICKERS_PER_PAGE + i;
            const col = i % COLS;
            const row = Math.floor(i / COLS);
            const x = MARGIN_LEFT + col * (STICKER_W + COL_GAP);
            const y = MARGIN_TOP + row * (STICKER_H + ROW_GAP);

            const container = document.getElementById(`pharmapolis-bulk-label-${globalIdx}`);
            const svgEl = container?.querySelector('svg');
            if (svgEl) {
              const imgData = await svgElementToImageData(svgEl, STICKER_W, STICKER_H, 600);
              pdf.addImage(imgData, 'PNG', x, y, STICKER_W, STICKER_H, undefined, 'SLOW');
              pdf.setDrawColor(226, 232, 240);
              pdf.setLineWidth(0.2);
              pdf.roundedRect(x, y, STICKER_W, STICKER_H, 1.5, 1.5, 'S');
            }
          }
        }

        const dateStr = new Date().toISOString().slice(0, 10);
        pdf.save(`PHARMAPOLIS_A4_STICKERS_SHEET_${labels.length}_LABELS_${dateStr}.pdf`);
      } else {
        // Individual 1:1 Scale Multi-page PDF for Thermal Label / Roll Printers
        const isLandscape = dimensions.widthMm >= dimensions.heightMm;
        const pdf = new jsPDF({
          orientation: isLandscape ? 'landscape' : 'portrait',
          unit: 'mm',
          format: [dimensions.widthMm, dimensions.heightMm],
          compress: true
        });

        for (let idx = 0; idx < labels.length; idx++) {
          if (idx > 0) {
            pdf.addPage([dimensions.widthMm, dimensions.heightMm], isLandscape ? 'landscape' : 'portrait');
          }
          const container = document.getElementById(`pharmapolis-bulk-label-${idx}`);
          const svgEl = container?.querySelector('svg');
          if (svgEl) {
            const imgData = await svgElementToImageData(svgEl, dimensions.widthMm, dimensions.heightMm, Math.max(dpi, 600));
            pdf.addImage(imgData, 'PNG', 0, 0, dimensions.widthMm, dimensions.heightMm, undefined, 'SLOW');
          }
        }

        const dateStr = new Date().toISOString().slice(0, 10);
        pdf.save(`PHARMAPOLIS_LABELS_BULK_${labels.length}_ITEMS_${dimensions.widthMm}x${dimensions.heightMm}mm_${dateStr}.pdf`);
      }
    } catch (err) {
      console.error('Error generating bulk PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleCopyLink = () => {
    if (currentItem.targetRxUrl) {
      navigator.clipboard.writeText(currentItem.targetRxUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className={`gcp-labels-backdrop ${isStandalone ? 'is-standalone-page' : ''}`}>
      <style>{`
        .gcp-labels-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          overflow-y: auto;
          box-sizing: border-box;
        }
        .gcp-labels-backdrop.is-standalone-page {
          position: static;
          inset: auto;
          z-index: 1;
          background: transparent;
          backdrop-filter: none;
          padding: 0 !important;
          min-height: auto;
          display: flex;
          align-items: stretch;
          justify-content: center;
          width: 100%;
        }
        .gcp-labels-backdrop.is-standalone-page .gcp-labels-dialog {
          max-width: 100% !important;
          width: 100% !important;
          max-height: none;
          height: auto;
          box-shadow: none !important;
          border: none !important;
          border-radius: 0 !important;
          background: transparent !important;
        }
        .gcp-labels-backdrop.is-standalone-page .gcp-labels-body {
          max-width: 1100px;
          margin: 0 auto;
          width: 100%;
          padding: 8px 16px 40px 16px;
        }
        .gcp-labels-dialog {
          background: #ffffff;
          border-radius: 12px;
          max-width: 940px;
          width: 100%;
          max-height: calc(100vh - 32px);
          max-height: calc(100dvh - 32px);
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 48px -10px rgba(60, 64, 67, 0.28), 0 4px 12px rgba(60, 64, 67, 0.15);
          overflow: hidden;
          border: 1px solid #dadce0;
          position: relative;
          margin: auto;
          box-sizing: border-box;
        }
        .gcp-labels-header {
          padding: 10px 18px;
          border-bottom: 1px solid #dadce0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #ffffff;
          flex-shrink: 0;
          box-sizing: border-box;
        }
        .gcp-labels-body {
          flex: 1 1 auto;
          min-height: 0;
          overflow-y: auto;
          padding: 12px 18px 28px 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
          box-sizing: border-box;
          width: 100%;
        }
        .gcp-labels-sticky-footer {
          flex-shrink: 0;
          background: #ffffff;
          border-top: 1px solid #dadce0;
          padding: 10px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          z-index: 20;
          box-shadow: 0 -2px 8px rgba(60, 64, 67, 0.08);
          box-sizing: border-box;
          width: 100%;
        }
        .gcp-footer-desktop-specs {
          display: block;
          min-width: 0;
          flex: 0 1 auto;
          overflow: hidden;
        }
        .gcp-footer-mobile-specs {
          display: none;
        }
        .gcp-footer-actions-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
          flex-wrap: nowrap;
        }
        .gcp-footer-secondary-grid {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .gcp-btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 36px;
          padding: 0 16px;
          border-radius: 4px;
          background: #1a73e8;
          color: #ffffff;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid #1a73e8;
          box-shadow: 0 1px 2px rgba(60, 64, 67, 0.3);
          transition: background 0.15s, box-shadow 0.15s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .gcp-btn-primary:hover:not(:disabled) {
          background: #1557b0;
          box-shadow: 0 1px 3px rgba(60, 64, 67, 0.4);
        }
        .gcp-btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 36px;
          padding: 0 12px;
          border-radius: 4px;
          background: #ffffff;
          border: 1px solid #dadce0;
          color: #1a73e8;
          font-size: 0.80rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .gcp-btn-secondary:hover {
          background: #f8fafd;
          border-color: #1a73e8;
        }
        .gcp-btn-copy {
          color: #3c4043;
          font-weight: 500;
        }
        .gcp-btn-copy:hover {
          color: #202124;
        }

        /* ── Google Cloud Resource Selector (Dedicated Full-Width Banner) ── */
        .gcp-resource-selector-card {
          width: 100%;
          max-width: 860px;
          background: #ffffff;
          border: 1px solid #c2e7ff;
          border-left: 4px solid #1a73e8;
          border-radius: 8px;
          padding: 10px 14px;
          box-shadow: 0 1px 3px rgba(60, 64, 67, 0.08);
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex-shrink: 0;
        }
        .gcp-resource-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          flex-wrap: wrap;
        }
        .gcp-resource-icon-box {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          background: #e8f0fe;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .gcp-resource-title-label {
          font-size: 0.68rem;
          font-weight: 700;
          color: #5f6368;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .gcp-resource-subtitle-code {
          font-size: 0.74rem;
          font-weight: 600;
          color: #1a73e8;
        }
        .gcp-resource-count-badge {
          font-size: 0.70rem;
          font-weight: 600;
          color: #1a73e8;
          background: #e8f0fe;
          padding: 2px 8px;
          border-radius: 12px;
          border: 1px solid #d2e3fc;
          white-space: nowrap;
        }
        .gcp-resource-nav-btn {
          width: 30px;
          height: 30px;
          border-radius: 4px;
          border: 1px solid #dadce0;
          background: #ffffff;
          color: #5f6368;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s;
        }
        .gcp-resource-nav-btn:hover:not(:disabled) {
          background: #f1f3f4;
          color: #202124;
          border-color: #1a73e8;
        }
        .gcp-resource-nav-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .gcp-resource-select {
          width: 100%;
          height: 40px;
          padding: 0 34px 0 12px;
          border-radius: 6px;
          border: 1.5px solid #1a73e8;
          background: #ffffff;
          font-size: 0.83rem;
          letter-spacing: -0.01em;
          font-weight: 600;
          color: #202124;
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%231a73e8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          outline: none;
          box-sizing: border-box;
        }
        .gcp-resource-select:focus {
          box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.2);
        }
        .gcp-resource-details-strip {
          display: flex;
          align-items: center;
          gap: 8px 14px;
          flex-wrap: wrap;
          background: #f8fafd;
          border: 1px solid #e8eaed;
          border-radius: 6px;
          padding: 8px 12px;
        }
        .gcp-resource-detail-item {
          display: inline-flex;
          align-items: baseline;
          gap: 6px;
          flex-wrap: wrap;
        }
        .gcp-detail-tag {
          font-size: 0.68rem;
          font-weight: 700;
          color: #5f6368;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .gcp-detail-text {
          font-size: 0.82rem;
          font-weight: 600;
          color: #202124;
          word-break: break-word;
        }
        .gcp-detail-patient {
          color: #202124;
          font-weight: 700;
        }
        .gcp-detail-formula {
          color: #1a73e8;
          font-weight: 700;
        }

        /* ── Controls Toolbar (Structured 2-Row Layout) ── */
        .gcp-controls-toolbar {
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: #ffffff;
          padding: 10px 14px;
          border-radius: 8px;
          border: 1px solid #dadce0;
          width: 100%;
          max-width: 960px;
          margin: 0 auto;
          box-sizing: border-box;
          box-shadow: 0 1px 3px rgba(60, 64, 67, 0.06);
        }
        .gcp-toolbar-row-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px 14px;
          width: 100%;
        }
        .gcp-toolbar-group {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px 12px;
          flex: 1 1 auto;
          min-width: 0;
        }
        .gcp-toolbar-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          color: #1a73e8;
          background: #e8f0fe;
          border: 1px solid #d2e3fc;
          padding: 4px 10px;
          border-radius: 4px;
          font-weight: 600;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .gcp-toolbar-row-bottom {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          flex-wrap: wrap;
          gap: 8px;
          width: 100%;
          padding-top: 8px;
          border-top: 1px dashed #e8eaed;
        }
        .gcp-toolbar-control {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .gcp-toolbar-label {
          font-size: 0.70rem;
          font-weight: 700;
          color: #5f6368;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          white-space: nowrap;
        }
        .gcp-toolbar-select {
          height: 32px;
          padding: 0 24px 0 8px;
          border-radius: 4px;
          border: 1px solid #dadce0;
          background: #ffffff;
          font-size: 0.78rem;
          font-weight: 600;
          color: #202124;
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235f6368' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 6px center;
          outline: none;
          transition: border-color 0.15s;
        }
        .gcp-toolbar-select:focus {
          border-color: #1a73e8;
        }
        .gcp-toolbar-btn {
          height: 32px;
          padding: 0 12px;
          border-radius: 4px;
          border: 1px solid #dadce0;
          background: #ffffff;
          color: #3c4043;
          font-size: 0.76rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.15s;
        }
        .gcp-toolbar-btn:hover {
          border-color: #1a73e8;
          color: #1a73e8;
        }

        /* ── Google Cloud Resource Editor Header & Toolbar Bar ── */
        .gcp-editor-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f8fafd;
          border-bottom: 1px solid #dadce0;
          padding: 0 12px;
          min-height: 42px;
          box-sizing: border-box;
          gap: 12px;
        }
        .gcp-editor-tabs-wrap {
          display: flex;
          align-items: center;
          gap: 2px;
          height: 100%;
        }
        .gcp-editor-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0 12px;
          height: 42px;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          color: #5f6368;
          font-size: 0.76rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
          box-sizing: border-box;
        }
        .gcp-editor-tab-btn:hover {
          color: #202124;
          background: rgba(0, 0, 0, 0.02);
        }
        .gcp-editor-tab-btn.active {
          color: #1a73e8;
          font-weight: 600;
          border-bottom: 2px solid #1a73e8;
          background: transparent;
        }
        .gcp-editor-actions-wrap {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .gcp-editor-save-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 30px;
          padding: 0 12px;
          border-radius: 4px;
          background: #1a73e8;
          color: #ffffff;
          border: 1px solid #1a73e8;
          font-size: 0.74rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          box-shadow: 0 1px 2px rgba(60,64,67,0.2);
          white-space: nowrap;
        }
        .gcp-editor-save-btn:hover:not(:disabled) {
          background: #1557b0;
          border-color: #1557b0;
          box-shadow: 0 1px 3px rgba(60,64,67,0.3);
        }
        .gcp-editor-save-btn:disabled {
          opacity: 0.7;
          cursor: wait;
        }
        .gcp-editor-save-btn.is-success {
          background: #e6f4ea;
          color: #137333;
          border-color: #ceead6;
          box-shadow: none;
        }
        .gcp-editor-aux-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          height: 30px;
          padding: 0 10px;
          border-radius: 4px;
          background: #ffffff;
          border: 1px solid #dadce0;
          color: #3c4043;
          font-size: 0.74rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .gcp-editor-aux-btn:hover {
          background: #f1f3f4;
          border-color: #bdc1c6;
          color: #202124;
        }
        .gcp-editor-reset-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          height: 30px;
          padding: 0 10px;
          border-radius: 4px;
          background: #ffffff;
          border: 1px solid #dadce0;
          color: #d93025;
          font-size: 0.74rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .gcp-editor-reset-btn:hover {
          background: #fce8e6;
          border-color: #fad2cf;
        }

        /* ── Responsive 12-Column Google Cloud Editor Form (NO INNER SCROLL TRAP) ── */
        .gcp-editor-container {
          padding: 14px 16px;
          background: #fafbfc;
          overflow: visible;
          box-sizing: border-box;
          width: 100%;
        }
        .gcp-editor-fields-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 12px;
          width: 100%;
          box-sizing: border-box;
        }
        .gcp-col-12 { grid-column: span 12; }
        .gcp-col-6  { grid-column: span 6; }
        .gcp-col-4  { grid-column: span 4; }
        .gcp-col-3  { grid-column: span 3; }

        .gcp-field-wrap {
          display: flex;
          flex-direction: column;
          gap: 4px;
          box-sizing: border-box;
        }
        .gcp-form-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.70rem;
          font-weight: 700;
          color: #5f6368;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 2px;
        }
        .gcp-form-input {
          width: 100%;
          height: 38px;
          font-size: 0.86rem;
          font-weight: 500;
          color: #202124;
          background: #ffffff;
          border: 1px solid #dadce0;
          border-radius: 4px;
          padding: 0 10px;
          box-sizing: border-box;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .gcp-form-input:focus {
          border-color: #1a73e8;
          outline: none;
          box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
        }
        .gcp-form-textarea {
          width: 100%;
          font-size: 0.84rem;
          line-height: 1.45;
          padding: 8px 10px;
          border: 1px solid #dadce0;
          border-radius: 4px;
          box-sizing: border-box;
          background: #ffffff;
          color: #202124;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .gcp-form-textarea:focus {
          border-color: #1a73e8;
          outline: none;
          box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
        }

        /* ── Compact screens (<= 768px): Strictly following Rule #23 and Google Cloud Mobile UX ── */
        @media (max-width: 768px) {
          .gcp-labels-backdrop:not(.is-standalone-page) {
            padding: 0 !important;
            align-items: flex-end !important;
          }
          .gcp-labels-backdrop.is-standalone-page {
            padding: 8px 8px 32px 8px !important;
          }
          .gcp-labels-backdrop:not(.is-standalone-page) .gcp-labels-dialog {
            max-height: 100dvh !important;
            height: 100dvh !important;
            border-radius: 14px 14px 0 0 !important;
            border: none !important;
            box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.25) !important;
          }
          .gcp-labels-backdrop.is-standalone-page .gcp-labels-dialog {
            border-radius: 8px !important;
            height: auto !important;
            max-height: none !important;
          }
          .gcp-labels-header {
            padding: 10px 14px !important;
          }
          .gcp-labels-body {
            padding: 10px 12px 32px 12px !important;
            gap: 10px !important;
          }
          .gcp-labels-sticky-footer {
            padding: 10px 14px calc(12px + env(safe-area-inset-bottom, 10px)) 14px !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 8px !important;
            background: #ffffff !important;
            border-top: 1px solid #dadce0 !important;
            box-shadow: 0 -4px 18px rgba(60, 64, 67, 0.12) !important;
          }
          .gcp-footer-desktop-specs {
            display: none !important;
          }
          .gcp-footer-mobile-specs {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 8px !important;
            font-size: 0.76rem !important;
            color: #5f6368 !important;
            padding: 0 2px !important;
          }
          .gcp-footer-actions-wrap {
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 8px !important;
          }
          .gcp-btn-primary {
            width: 100% !important;
            height: 44px !important;
            min-height: 44px !important;
            font-size: 0.88rem !important;
            border-radius: 6px !important;
            font-weight: 700 !important;
          }
          .gcp-btn-secondary {
            width: 100% !important;
            height: 42px !important;
            min-height: 42px !important;
            font-size: 0.82rem !important;
            border-radius: 6px !important;
          }
          .gcp-footer-secondary-grid {
            display: grid !important;
            grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)) !important;
            gap: 8px !important;
            width: 100% !important;
          }
          .gcp-footer-secondary-grid .gcp-btn-secondary {
            width: 100% !important;
            height: 40px !important;
            min-height: 40px !important;
            justify-content: center !important;
          }
          .gcp-editor-container {
            padding: 10px 10px 24px 10px !important;
            max-height: none !important;
            overflow: visible !important;
          }
          .gcp-editor-fields-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .gcp-col-12, .gcp-col-6, .gcp-col-4, .gcp-col-3 {
            grid-column: span 1 !important;
          }
          .gcp-form-input {
            height: 44px !important;
            min-height: 44px !important;
            font-size: 16px !important; /* Prevents iOS Safari 120% auto-zoom */
            padding: 0 12px !important;
            border-radius: 6px !important;
          }
          .gcp-form-textarea {
            font-size: 15px !important;
            padding: 10px 12px !important;
            border-radius: 6px !important;
            min-height: 96px !important;
          }
          .gcp-form-label {
            font-size: 0.72rem !important;
            margin-bottom: 4px !important;
          }
          .gcp-resource-select {
            height: 44px !important;
            font-size: 13.5px !important;
            border-radius: 6px !important;
          }
          .gcp-resource-nav-btn {
            width: 38px !important;
            height: 38px !important;
            border-radius: 6px !important;
          }
          .gcp-resource-details-strip {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 6px !important;
          }
          .gcp-controls-toolbar {
            padding: 8px 10px !important;
            gap: 8px !important;
          }
          .gcp-toolbar-row-top {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 8px !important;
          }
          .gcp-toolbar-group {
            width: 100% !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 8px !important;
          }
          .gcp-toolbar-control {
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 4px !important;
          }
          .gcp-toolbar-select {
            width: 100% !important;
            height: 40px !important;
            font-size: 14px !important;
          }
          .gcp-toolbar-badge {
            align-self: flex-start !important;
          }
          .gcp-toolbar-btn {
            height: 38px !important;
            font-size: 13px !important;
            padding: 0 10px !important;
          }
          .gcp-editor-header-bar {
            padding: 8px 10px !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 8px !important;
          }
          .gcp-editor-tabs-wrap {
            width: 100% !important;
            display: flex !important;
          }
          .gcp-editor-tab-btn {
            flex: 1 1 50% !important;
            justify-content: center !important;
            height: 36px !important;
          }
          .gcp-editor-actions-wrap {
            width: 100% !important;
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 6px !important;
          }
          .gcp-editor-save-btn {
            width: 100% !important;
            height: 40px !important;
            justify-content: center !important;
            font-size: 0.82rem !important;
          }
          .gcp-editor-aux-btn,
          .gcp-editor-reset-btn {
            flex: 1 1 calc(50% - 3px) !important;
            min-width: 66px !important;
            height: 36px !important;
            justify-content: center !important;
          }
        }
      `}</style>

      <div className="gcp-labels-dialog">
        {/* Header (Only in popup modal mode; hidden in standalone GCP studio) */}
        {!isStandalone && (
          <div className="gcp-labels-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: '6px',
                background: '#e8f0fe',
                color: '#1a73e8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #d2e3fc'
              }}>
                <QrCode size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#202124' }}>
                    {isEs ? 'Etiquetas Farmacéuticas Vectoriales' : 'Vector Pharmacy Compounding Labels'}
                  </h3>
                  <span style={{
                    background: '#e6f4ea',
                    color: '#137333',
                    border: '1px solid #ceead6',
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    EU GMP Certified
                  </span>
                </div>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#5f6368' }}>
                  {isEs 
                    ? 'Pharmapolis Compounding Pharmacy · Renderizado vectorial SVG & Exportador Multi-DPI a medida' 
                    : 'Pharmapolis Compounding Pharmacy · Vector SVG Engine & Multi-DPI PNG Exporter'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              style={{
                background: 'transparent',
                border: 'none',
                padding: '8px',
                borderRadius: '50%',
                cursor: 'pointer',
                color: '#5f6368',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.15s, color 0.15s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f3f4'; e.currentTarget.style.color = '#202124'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#5f6368'; }}
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="gcp-labels-body">
          {/* Google Cloud Dedicated Primary Resource / Formula Selector Card (Only in popup modal mode) */}
          {!isStandalone && (
            <div className="gcp-resource-selector-card">
              <div className="gcp-resource-header-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <div className="gcp-resource-icon-box">
                    <Pill size={16} color="#1a73e8" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <span className="gcp-resource-title-label">
                      {isEs ? 'Prescripción y Fórmula Seleccionada' : 'Selected Prescription & Formula'}
                    </span>
                    <a
                      href={`/rx/${encodeURIComponent(String(currentItem.fileNumber || currentItem.rxCode || '').replace(/^#/, '').trim())}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gcp-resource-subtitle-code"
                      style={{
                        textDecoration: 'none',
                        color: '#1a73e8',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer'
                      }}
                      title={isEs ? 'Abrir expediente de prescripción pública (nueva pestaña)' : 'Open public prescription dossier (new tab)'}
                    >
                      <span>{currentItem.fileNumber || currentItem.rxCode || 'RX-COMPOUND'}</span>
                      <ExternalLink size={11} style={{ opacity: 0.6 }} />
                    </a>
                  </div>
                </div>

                {labels.length > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <span className="gcp-resource-count-badge">
                      {selectedProductIdx + 1} / {labels.length}
                    </span>
                    <button
                      type="button"
                      className="gcp-resource-nav-btn"
                      disabled={selectedProductIdx === 0}
                      onClick={() => setSelectedProductIdx(prev => Math.max(0, prev - 1))}
                      title={isEs ? 'Fórmula Anterior' : 'Previous Formula'}
                      aria-label="Previous Formula"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      className="gcp-resource-nav-btn"
                      disabled={selectedProductIdx >= labels.length - 1}
                      onClick={() => setSelectedProductIdx(prev => Math.min(labels.length - 1, prev + 1))}
                      title={isEs ? 'Siguiente Fórmula' : 'Next Formula'}
                      aria-label="Next Formula"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* If multi-product / multi-phase, large full-width responsive dropdown */}
              {labels.length > 1 && (
                <div style={{ position: 'relative', width: '100%' }}>
                  <label htmlFor="gcp-label-phase-primary" style={{ display: 'none' }}>
                    {isEs ? 'Seleccionar Fórmula:' : 'Select Formula:'}
                  </label>
                  <select
                    id="gcp-label-phase-primary"
                    value={selectedProductIdx}
                    onChange={(e) => setSelectedProductIdx(Number(e.target.value))}
                    className="gcp-resource-select"
                  >
                    {labels.map((lbl, idx) => {
                      const phase = lbl.phaseNumber ? `Phase ${lbl.phaseNumber}: ` : `${idx + 1}. `;
                      const title = lbl.productName || lbl.productTitle || 'Compounded Formula';
                      const vol = lbl.volume ? ` (${lbl.volume})` : '';
                      return (
                        <option key={lbl.id || idx} value={idx}>
                          {phase}{title}{vol}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {/* Unwrapped Full Name and Formula Details Banner */}
              <div className="gcp-resource-details-strip">
                <div className="gcp-resource-detail-item">
                  <span className="gcp-detail-tag">{isEs ? 'Paciente:' : 'Patient:'}</span>
                  <span className="gcp-detail-text gcp-detail-patient">
                    {currentItem.patientName || currentItem.patient?.name || 'N/A'}
                  </span>
                </div>
                <div className="gcp-resource-detail-item">
                  <span className="gcp-detail-tag">{isEs ? 'Fórmula:' : 'Formula:'}</span>
                  <span className="gcp-detail-text gcp-detail-formula">
                    {currentItem.phaseNumber ? `Phase ${currentItem.phaseNumber}: ` : ''}{currentItem.productTitle || currentItem.productName || 'Compounded Protocol'}
                  </span>
                </div>
                {currentItem.volume && (
                  <div className="gcp-resource-detail-item">
                    <span className="gcp-detail-tag">{isEs ? 'Cantidad:' : 'Net:'}</span>
                    <span className="gcp-detail-text">🧴 {currentItem.volume}</span>
                  </div>
                )}
                {currentItem.batchCode && (
                  <div className="gcp-resource-detail-item">
                    <span className="gcp-detail-tag">{isEs ? 'Lote:' : 'Batch:'}</span>
                    <span className="gcp-detail-text">🏷️ {currentItem.batchCode}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Google Cloud Compact Controls Toolbar (Structured 2-Row Layout) */}
          <div className="gcp-controls-toolbar">
            {/* Top Row: Configuration Selectors + Active Output Resolution Badge */}
            <div className="gcp-toolbar-row-top">
              <div className="gcp-toolbar-group">
                {/* Field 1: Label Variant (Type) */}
                <div className="gcp-toolbar-control">
                  <label htmlFor="gcp-label-variant" className="gcp-toolbar-label">
                    {isEs ? 'Tipo:' : 'Label:'}
                  </label>
                  <select
                    id="gcp-label-variant"
                    value={activeVariant}
                    onChange={(e) => setActiveVariant(e.target.value)}
                    className="gcp-toolbar-select"
                  >
                    <option value="backQr">{isEs ? 'Reverso con QR (Trazabilidad)' : 'Back Label with QR (Traceability)'}</option>
                    <option value="front">{isEs ? 'Frontal Estándar' : 'Front Label (Standard)'}</option>
                    <option value="frontWithQr">{isEs ? 'Frontal con Micro-QR' : 'Front Label with Micro-QR'}</option>
                    <option value="shipping">{isEs ? '📦 Etiqueta de Envío (Aduanas)' : '📦 Shipping Label (Customs-Safe)'}</option>
                  </select>
                </div>

                {/* Field 2: Label Size / Format */}
                <div className="gcp-toolbar-control">
                  <label htmlFor="gcp-label-size" className="gcp-toolbar-label">
                    {isEs ? 'Medida:' : 'Size:'}
                  </label>
                  <select
                    id="gcp-label-size"
                    value={selectedPreset}
                    onChange={(e) => {
                      const p = PRESETS.find(x => x.id === e.target.value);
                      if (p) handleSelectPreset(p);
                    }}
                    className="gcp-toolbar-select"
                  >
                    {PRESETS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label} ({p.sub})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Custom mm Inputs if Custom is selected */}
                {selectedPreset === 'custom' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <span style={{ fontSize: '0.70rem', color: '#5f6368' }}>W:</span>
                      <input
                        type="number"
                        min="25"
                        max="250"
                        value={customWidth}
                        onChange={(e) => handleCustomWidthChange(e.target.value)}
                        style={{
                          width: '42px',
                          height: 28,
                          padding: '0 3px',
                          fontSize: '0.76rem',
                          border: '1px solid #dadce0',
                          borderRadius: '4px',
                          textAlign: 'center',
                          fontWeight: 600
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '0.70rem', color: '#94a3b8' }}>×</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <span style={{ fontSize: '0.70rem', color: '#5f6368' }}>H:</span>
                      <input
                        type="number"
                        min="20"
                        max="200"
                        value={customHeight}
                        onChange={(e) => handleCustomHeightChange(e.target.value)}
                        style={{
                          width: '42px',
                          height: 28,
                          padding: '0 3px',
                          fontSize: '0.76rem',
                          border: '1px solid #dadce0',
                          borderRadius: '4px',
                          textAlign: 'center',
                          fontWeight: 600
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '0.70rem', color: '#5f6368', fontWeight: 600 }}>mm</span>
                  </div>
                )}

                {/* Field 3: Print Resolution / DPI */}
                <div className="gcp-toolbar-control">
                  <label htmlFor="gcp-label-dpi" className="gcp-toolbar-label">
                    DPI:
                  </label>
                  <select
                    id="gcp-label-dpi"
                    value={dpi}
                    onChange={(e) => setDpi(Number(e.target.value))}
                    className="gcp-toolbar-select"
                  >
                    <option value={300}>300 DPI (Standard)</option>
                    <option value={600}>600 DPI (Micro-Print)</option>
                    <option value={1200}>1200 DPI (Ultra HD)</option>
                  </select>
                </div>

                {/* Field 4: Export Format Selector (PDF / PNG / MD) */}
                <div className="gcp-toolbar-control">
                  <label htmlFor="gcp-label-format" className="gcp-toolbar-label">
                    {isEs ? 'Formato:' : 'Format:'}
                  </label>
                  <select
                    id="gcp-label-format"
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="gcp-toolbar-select"
                  >
                    <option value="png">{isEs ? `PNG (Imagen HD · ${dpi} DPI)` : `PNG (HD Graphic · ${dpi} DPI)`}</option>
                    <option value="pdf">{isEs ? `PDF (Esta Etiqueta · ${dimensions.widthMm}×${dimensions.heightMm}mm)` : `PDF (Current Label · ${dimensions.widthMm}×${dimensions.heightMm}mm)`}</option>
                    {labels.length > 1 && (
                      <>
                        <option value="pdf_all">{isEs ? `PDF (Todas · ${labels.length} Etiquetas)` : `PDF (All ${labels.length} Labels)`}</option>
                        <option value="pdf_a4">{isEs ? `Hoja A4 (10 por hoja · 2×5 Grid)` : `A4 Sheet (10 per page · 2×5 Grid)`}</option>
                      </>
                    )}
                    <option value="zip">{isEs ? `Paquete ZIP (Delivery + Shipping · ${labels.length > 1 ? 'todas las partes' : 'esta etiqueta'})` : `ZIP Package (Delivery + Shipping · ${labels.length > 1 ? 'all parts' : 'this label'})`}</option>
                    <option value="md">Markdown (.md)</option>
                  </select>
                </div>

                {/* Field 5: Cut Guides (✂) Print & Layout Setting */}
                <div className="gcp-toolbar-control">
                  <label htmlFor="gcp-label-guides" className="gcp-toolbar-label">
                    {isEs ? 'Guías:' : 'Guides:'}
                  </label>
                  <button
                    type="button"
                    id="gcp-label-guides"
                    onClick={() => setShowCutGuides(prev => !prev)}
                    className="gcp-toolbar-btn"
                    style={{
                      height: 32,
                      padding: '0 10px',
                      border: showCutGuides ? '1px solid #1a73e8' : '1px solid #dadce0',
                      background: showCutGuides ? '#e8f0fe' : '#ffffff',
                      color: showCutGuides ? '#1a73e8' : '#5f6368',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: 600,
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    title={showCutGuides
                      ? (isEs ? 'Guías de corte: ACTIVADAS (imprime líneas punteadas de tijera y recorte)' : 'Cut Guides: ON (scissor crop lines & trim marks visible)')
                      : (isEs ? 'Guías de corte: DESACTIVADAS (etiqueta limpia sin marcas de corte)' : 'Cut Guides: OFF (clean label without cut marks)')
                    }
                  >
                    <span style={{ fontSize: '0.88rem' }}>✂</span>
                    <span style={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      letterSpacing: '0.03em',
                      color: showCutGuides ? '#1a73e8' : '#70757a'
                    }}>
                      {showCutGuides ? (isEs ? 'ON (Activas)' : 'ON') : (isEs ? 'OFF (Inactivas)' : 'OFF')}
                    </span>
                    <span style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: showCutGuides ? '#1a73e8' : '#dadce0',
                      display: 'inline-block',
                      boxShadow: showCutGuides ? '0 0 0 2px rgba(26,115,232,0.25)' : 'none'
                    }} />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Row: Tool Actions (Edit, Share) */}
            <div className="gcp-toolbar-row-bottom">
              {/* Field 6: Online Label Editor Toggle */}
              <button
                type="button"
                onClick={() => setIsEditing(prev => !prev)}
                className="gcp-toolbar-btn"
                style={{
                  border: isEditing ? '1px solid #1a73e8' : '1px solid #dadce0',
                  background: isEditing ? '#e8f0fe' : '#ffffff',
                  color: isEditing ? '#1a73e8' : '#3c4043'
                }}
                title={isEs ? 'Editar campos de la etiqueta' : 'Edit label fields'}
              >
                <Edit3 size={13} />
                <span>{isEs ? 'Editar' : 'Edit'}</span>
                <span style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: isEditing ? '#1a73e8' : '#dadce0',
                  display: 'inline-block'
                }} />
              </button>

              {/* Field 7: Compartir Editor (Enlace Directo) */}
              <button
                type="button"
                onClick={handleShareEditor}
                className="gcp-toolbar-btn"
                style={{
                  border: copiedShareLink ? '1px solid #137333' : '1px solid #dadce0',
                  background: copiedShareLink ? '#e6f4ea' : '#ffffff',
                  color: copiedShareLink ? '#137333' : '#3c4043'
                }}
                title={isEs ? 'Copiar enlace directo del editor para compartir con un tercero' : 'Copy direct link to share editor with third party'}
              >
                {copiedShareLink ? <Check size={13} color="#137333" /> : <Share2 size={13} />}
                <span>{copiedShareLink ? (isEs ? 'Copiado ✓' : 'Copied ✓') : (isEs ? 'Compartir' : 'Share')}</span>
              </button>


            </div>
          </div>

          {/* Online Label Editor & Markdown Sync Panel */}
          {isEditing && (
            <div style={{
              width: '100%',
              maxWidth: '960px',
              margin: '0 auto',
              background: '#ffffff',
              border: '1px solid #1a73e8',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(26,115,232,0.12)',
              overflow: 'hidden',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              flexShrink: 0,
              marginBottom: '6px'
            }}>
              {/* Editor Header Bar with Tabs and Actions */}
              <div className="gcp-editor-header-bar">
                {/* Tabs & Approval Status (Golden Rule #8 & #28) */}
                <div className="gcp-editor-tabs-wrap" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setEditorTab('fields')}
                    className={`gcp-editor-tab-btn ${editorTab === 'fields' ? 'active' : ''}`}
                  >
                    <Edit3 size={13} />
                    <span>{isEs ? 'Campos' : 'Fields'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorTab('markdown')}
                    className={`gcp-editor-tab-btn ${editorTab === 'markdown' ? 'active' : ''}`}
                  >
                    <FileText size={13} />
                    <span>Markdown (.md)</span>
                  </button>

                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginLeft: '4px' }}>
                    <StatusBadge status={currentItem.approvalStatus || 'draft'} />
                    <span style={{ fontSize: '0.70rem', color: '#5f6368', fontWeight: 700 }}>
                      v{currentItem.version || 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = currentItem.approvalStatus === 'approved' ? 'draft' : 'approved';
                        handleFieldChange('approvalStatus', next);
                        handleSaveToFirebase(next);
                      }}
                      disabled={isSavingToFirebase}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        border: currentItem.approvalStatus === 'approved' ? '1px solid #dadce0' : '1px solid #ceead6',
                        background: currentItem.approvalStatus === 'approved' ? '#fff' : '#e6f4ea',
                        color: currentItem.approvalStatus === 'approved' ? '#5f6368' : '#137333',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      title={isEs ? 'Cambiar estado de aprobación clínica' : 'Change clinical approval status'}
                    >
                      {currentItem.approvalStatus === 'approved'
                        ? (isEs ? '↺ Revertir a Borrador' : '↺ Revert to Draft')
                        : (isEs ? '✓ Aprobar Etiqueta' : '✓ Approve Label')}
                    </button>
                  </div>
                </div>

                {/* Editor Action Buttons: Save to Atlas, Download .md, Reset */}
                <div className="gcp-editor-actions-wrap">
                  {/* SAVE TO ATLAS BUTTON */}
                  <button
                    type="button"
                    onClick={() => handleSaveToFirebase()}
                    disabled={isSavingToFirebase}
                    className={`gcp-editor-save-btn ${firebaseSaveSuccess ? 'is-success' : ''}`}
                    title={isEs ? 'Guardar cambios directamente en Atlas (base de datos oficial)' : 'Save changes directly to Atlas'}
                  >
                    {firebaseSaveSuccess ? (
                      <>
                        <Check size={13} color="#137333" />
                        <span>{isEs ? 'Guardado en Atlas ✓' : 'Saved to Atlas ✓'}</span>
                      </>
                    ) : (
                      <>
                        <Database size={13} />
                        <span>{isSavingToFirebase ? (isEs ? 'Guardando...' : 'Saving...') : (isEs ? 'Guardar en Atlas' : 'Save to Atlas')}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadMarkdown}
                    className="gcp-editor-aux-btn"
                    title={isEs ? 'Descargar monografía en formato Markdown' : 'Download monograph in Markdown format'}
                  >
                    <Download size={13} />
                    <span>{isEs ? 'Descargar .md' : 'Download .md'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetOriginal}
                    className="gcp-editor-reset-btn"
                    title={isEs ? 'Restablecer datos originales de la prescripción' : 'Reset to original prescription data'}
                  >
                    <RotateCcw size={13} />
                    <span>{isEs ? 'Restablecer' : 'Reset'}</span>
                  </button>
                </div>
              </div>

              {/* Status Message / Error if any */}
              {firebaseSaveError && (
                <div style={{ padding: '6px 12px', background: '#fce8e6', color: '#c5221f', fontSize: '0.72rem', fontWeight: 600, borderBottom: '1px solid #fad2cf' }}>
                  ⚠️ {firebaseSaveError}
                </div>
              )}

              {/* Tab Body */}
              <div className="gcp-editor-container">
                {hasFontAlarm && (
                  <div style={{ margin: '8px 12px 0', padding: '10px 14px', borderRadius: '8px', background: '#fef2f2', border: '1px solid #f87171', color: '#991b1b', display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.78rem' }}>
                    <AlertTriangle size={18} style={{ color: '#dc2626', flexShrink: 0, marginTop: '1px' }} />
                    <div>
                      <div style={{ fontWeight: 800 }}>
                        {isEs ? '⚠️ Alarma de Legibilidad Física (< 6.0 pt)' : '⚠️ Optical Legibility Alarm (< 6.0 pt)'}
                      </div>
                      <div style={{ marginTop: '2px', lineHeight: 1.4, color: '#7f1d1d' }}>
                        {isEs
                          ? `Al imprimir a ${dimensions.widthMm}×${dimensions.heightMm} mm, algunos textos clínicos quedan en ${minPatientPt} pt (< 6.0 pt recomendado por normativas farmacéuticas). Te recomendamos usar un formato más grande (ej. 100×55 mm) o acortar el texto para asegurar una lectura perfecta sin lupa.`
                          : `When printed at ${dimensions.widthMm}×${dimensions.heightMm} mm, clinical typography drops to ${minPatientPt} pt (< 6.0 pt regulatory threshold). Consider selecting a wider label (e.g. 100×55 mm) or condensing text for clear readability.`}
                      </div>
                    </div>
                  </div>
                )}

                {editorTab === 'fields' ? (
                  <div className="gcp-editor-fields-grid">
                    {/* Row 1: Patient Name (6 cols) | Dispensing Batch (3 cols) | Net Quantity (3 cols) */}
                    <div className="gcp-col-6 gcp-field-wrap">
                      <label className="gcp-form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span>{isEs ? 'Nombre Paciente' : 'Patient Name'}</span>
                          <span style={{ color: '#dc2626', marginLeft: '3px', fontWeight: 700 }} title={isEs ? 'Campo obligatorio' : 'Required field'}>*</span>
                        </div>
                        <FontLegibilityPill pt={patientPt} isEs={isEs} compact={true} />
                      </label>
                      <input
                        type="text"
                        value={currentItem.patientName || currentItem.patient?.name || ''}
                        onChange={(e) => handleFieldChange('patientName', e.target.value)}
                        className="gcp-form-input"
                        placeholder="e.g. Amna Sultan Mohamed Ahmed Alotaiba"
                      />
                    </div>

                    <div className="gcp-col-3 gcp-field-wrap">
                      <label className="gcp-form-label">
                        <span>{isEs ? 'Lote (Batch)' : 'Dispensing Batch'}</span>
                        <span style={{ color: '#dc2626', marginLeft: '3px', fontWeight: 700 }} title={isEs ? 'Campo obligatorio' : 'Required field'}>*</span>
                      </label>
                      <input
                        type="text"
                        value={currentItem.batchCode || currentItem.lote || currentItem.fileNumber || ''}
                        onChange={(e) => handleFieldChange('batchCode', e.target.value)}
                        className="gcp-form-input"
                        placeholder="PHARM-2026-..."
                      />
                    </div>

                    <div className="gcp-col-3 gcp-field-wrap">
                      <label className="gcp-form-label">
                        <span>{isEs ? 'Cantidad Neta' : 'Net Quantity'}</span>
                        <span style={{ color: '#dc2626', marginLeft: '3px', fontWeight: 700 }} title={isEs ? 'Campo obligatorio' : 'Required field'}>*</span>
                      </label>
                      <input
                        type="text"
                        value={currentItem.volume || currentItem.size || currentItem.netContent || ''}
                        onChange={(e) => handleFieldChange('volume', e.target.value)}
                        className="gcp-form-input"
                        placeholder="60 Caps / 100 mL"
                      />
                    </div>

                    {/* Row 2: Product Title / Formula (12 cols - full width so complete formula title is 100% visible) */}
                    <div className="gcp-col-12 gcp-field-wrap">
                      <label className="gcp-form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span>{isEs ? 'Título Producto / Fórmula' : 'Product Title / Formula'}</span>
                          <span style={{ color: '#dc2626', marginLeft: '3px', fontWeight: 700 }} title={isEs ? 'Campo obligatorio' : 'Required field'}>*</span>
                        </div>
                        <FontLegibilityPill pt={titlePt} isEs={isEs} compact={true} />
                      </label>
                      <input
                        type="text"
                        value={currentItem.productTitle || currentItem.productName || ''}
                        onChange={(e) => handleFieldChange('productTitle', e.target.value)}
                        className="gcp-form-input"
                        placeholder="e.g. Phase 2: Metabolic & Lipid Optimization Evening Formula"
                      />
                    </div>

                    {/* Customs-friendly quick suggestions (Shipping variant only) */}
                    {activeVariant === 'shipping' && (
                      <div className="gcp-col-12 gcp-field-wrap">
                        <label className="gcp-form-label">
                          <span>{isEs ? 'Nombre para Aduanas / Shipping' : 'Customs / Shipping Name'}</span>
                          <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 500, textTransform: 'none', marginLeft: '4px' }}>
                            {isEs ? '(Opcional)' : '(Optional)'}
                          </span>
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <input
                            type="text"
                            value={shippingDraft !== null ? shippingDraft : (currentItem.shippingTitle || '')}
                            onChange={(e) => setShippingDraft(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') { handleFieldChange('shippingTitle', shippingDraft ?? ''); setShippingDraft(null); }
                              if (e.key === 'Escape') setShippingDraft(null);
                            }}
                            onBlur={() => {
                              if (shippingDraft !== null) { handleFieldChange('shippingTitle', shippingDraft); setShippingDraft(null); }
                            }}
                            className="gcp-form-input"
                            style={{ flex: 1, minWidth: 0 }}
                            placeholder={getCustomsFriendlySuggestions(currentItem)[0]}
                          />
                          {shippingDraft !== null && (
                            <>
                              <button
                                type="button"
                                aria-label={isEs ? 'Guardar nombre' : 'Save name'}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => { handleFieldChange('shippingTitle', shippingDraft); setShippingDraft(null); }}
                                style={{ width: '44px', height: '44px', flexShrink: 0, borderRadius: '6px', border: '1px solid #137333', background: '#e6f4ea', color: '#137333', fontSize: '1rem', cursor: 'pointer' }}
                              >
                                ✔
                              </button>
                              <button
                                type="button"
                                aria-label={isEs ? 'Cancelar edición' : 'Cancel edit'}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => setShippingDraft(null)}
                                style={{ width: '44px', height: '44px', flexShrink: 0, borderRadius: '6px', border: '1px solid #c5221f', background: '#fce8e6', color: '#c5221f', fontSize: '1rem', cursor: 'pointer' }}
                              >
                                ❌
                              </button>
                            </>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                          {getCustomsFriendlySuggestions(currentItem).map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => handleFieldChange('shippingTitle', s)}
                              style={{
                                padding: '6px 10px',
                                minHeight: '44px',
                                borderRadius: '999px',
                                border: currentItem.shippingTitle === s ? '1px solid #1a73e8' : '1px solid #dadce0',
                                background: currentItem.shippingTitle === s ? '#e8f0fe' : '#fff',
                                color: currentItem.shippingTitle === s ? '#1a73e8' : '#3c4043',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                        {(() => {
                          const risks = findCustomsRisks(currentItem);
                          if (risks.length === 0) {
                            return (
                              <div style={{ marginTop: '8px', padding: '6px 10px', borderRadius: '6px', background: '#e6f4ea', color: '#137333', fontSize: '0.72rem', fontWeight: 600 }}>
                                ✓ {isEs ? 'Sin términos de riesgo aduanero detectados' : 'No customs-risk terms detected'}
                              </div>
                            );
                          }
                          return (
                            <div style={{ marginTop: '8px', padding: '8px 10px', borderRadius: '6px', background: '#fef7e0', border: '1px solid #f9e2a0', color: '#b06000', fontSize: '0.72rem', fontWeight: 600 }}>
                              ⚠️ {isEs ? 'Posible retención en aduanas. Revisa:' : 'Possible customs hold. Review:'}
                              <ul style={{ margin: '4px 0 0 16px', padding: 0, fontWeight: 500 }}>
                                {risks.map((r, i) => (
                                  <li key={`${r.field}-${r.term}-${i}`}>
                                    <b>{r.field}</b>: &ldquo;{r.term}&rdquo;
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* Row 3: Prescribing Doctor (6 cols) & Clinic (6 cols) -> generous width, zero truncation */}
                    <div className="gcp-col-6 gcp-field-wrap">
                      <label className="gcp-form-label">
                        <span>{isEs ? 'Médico Prescriptor' : 'Prescribing Doctor'}</span>
                        <span style={{ color: '#dc2626', marginLeft: '3px', fontWeight: 700 }} title={isEs ? 'Campo obligatorio' : 'Required field'}>*</span>
                      </label>
                      <input
                        type="text"
                        value={currentItem.doctorName || currentItem.physician || ''}
                        onChange={(e) => handleFieldChange('doctorName', e.target.value)}
                        className="gcp-form-input"
                        placeholder={isEs ? "Dr. Nombre y Apellidos" : "Dr. Prescribing Physician"}
                      />
                    </div>

                    <div className="gcp-col-6 gcp-field-wrap">
                      <label className="gcp-form-label">
                        <span>{isEs ? 'Clínica' : 'Clinic'}</span>
                        <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 500, textTransform: 'none', marginLeft: '4px' }}>
                          {isEs ? '(Opcional · Elegir de Atlas)' : '(Optional · Select from Atlas)'}
                        </span>
                      </label>
                      <ClinicPicker
                        value={currentItem.clinicId || ''}
                        clinicName={currentItem.clinicName || ''}
                        allowCustom={true}
                        onChange={({ clinicId, clinicName }) => {
                          const updated = {
                            ...currentItem,
                            clinicName: clinicName || '',
                            clinicId: clinicId || ''
                          };
                          const newMd = labelToMarkdown(updated);
                          updated.labelMarkdown = newMd;
                          setEditedOverrides(prev => ({
                            ...prev,
                            [selectedProductIdx]: updated
                          }));
                          setMarkdownText(newMd);
                        }}
                        placeholder={isEs ? "Seleccionar clínica de Atlas..." : "Select clinic from Atlas..."}
                      />
                    </div>

                    <div className="gcp-col-12 gcp-field-wrap">
                      <label className="gcp-form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span>{isEs ? 'Principios Activos y Concentración' : 'Active Ingredients & Strength'}</span>
                          <span style={{ color: '#dc2626', marginLeft: '3px', fontWeight: 700 }} title={isEs ? 'Campo obligatorio' : 'Required field'}>*</span>
                          <span style={{ fontSize: '0.66rem', color: '#5f6368', textTransform: 'none', fontWeight: 500, marginLeft: '6px' }}>
                            {isEs ? '(un ingrediente por línea · formato: Fármaco: Dosis)' : '(one per line · Drug: Dose)'}
                          </span>
                        </div>
                        <FontLegibilityPill pt={ingPt} isEs={isEs} compact={true} />
                      </label>
                      <textarea
                        rows={4}
                        value={apisEditorText}
                        onChange={(e) => handleApisFieldChange(e.target.value)}
                        className="gcp-form-textarea"
                        style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
                        placeholder="Ubiquinol (Kaneka® CoQ10): 250 mg&#10;Saw Palmetto Extract: 250 mg&#10;Arginine: 1.5%"
                      />
                    </div>

                    <div className="gcp-col-12 gcp-field-wrap">
                      <label className="gcp-form-label">
                        <span>{isEs ? 'Vehículo de Formulación' : 'Compounding Vehicle'}</span>
                        <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 500, textTransform: 'none', marginLeft: '4px' }}>
                          {isEs ? '(Opcional)' : '(Optional)'}
                        </span>
                      </label>
                      <input
                        type="text"
                        value={typeof currentItem.vehicle === 'string' ? currentItem.vehicle : (currentItem.vehicle?.name || '')}
                        onChange={(e) => handleFieldChange('vehicle', e.target.value)}
                        className="gcp-form-input"
                        placeholder="Vegetable capsules. Gluten-free, lactose-free..."
                      />
                    </div>

                    <div className="gcp-col-12 gcp-field-wrap">
                      <label className="gcp-form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span>{isEs ? 'Posología / Modo de Empleo (Directions for Use)' : 'Directions for Use'}</span>
                          <span style={{ color: '#dc2626', marginLeft: '3px', fontWeight: 700 }} title={isEs ? 'Campo obligatorio' : 'Required field'}>*</span>
                        </div>
                        <FontLegibilityPill pt={dirPt} isEs={isEs} compact={true} />
                      </label>
                      <input
                        type="text"
                        value={currentItem.directions || currentItem.instructions || ''}
                        onChange={(e) => handleFieldChange('directions', e.target.value)}
                        className="gcp-form-input"
                        placeholder="Take 1 capsule once daily with breakfast."
                      />
                    </div>

                    <div className="gcp-col-3 gcp-field-wrap">
                      <label className="gcp-form-label">
                        <span>{isEs ? 'Fecha Fabricación (Mfg)' : 'Mfg Date'}</span>
                        <span style={{ color: '#dc2626', marginLeft: '3px', fontWeight: 700 }} title={isEs ? 'Campo obligatorio' : 'Required field'}>*</span>
                      </label>
                      <input
                        type="text"
                        value={currentItem.prodDate || currentItem.mfgDate || ''}
                        onChange={(e) => handleFieldChange('prodDate', e.target.value)}
                        className="gcp-form-input"
                        placeholder="DD-MM-YYYY"
                      />
                    </div>

                    <div className="gcp-col-3 gcp-field-wrap">
                      <label className="gcp-form-label">
                        <span>{isEs ? 'Fecha Caducidad (Exp)' : 'Expiry Date'}</span>
                        <span style={{ color: '#dc2626', marginLeft: '3px', fontWeight: 700 }} title={isEs ? 'Campo obligatorio' : 'Required field'}>*</span>
                      </label>
                      <input
                        type="text"
                        value={currentItem.expDate || ''}
                        onChange={(e) => handleFieldChange('expDate', e.target.value)}
                        className="gcp-form-input"
                        placeholder="DD-MM-YYYY"
                      />
                    </div>

                    <div className="gcp-col-6 gcp-field-wrap">
                      <label className="gcp-form-label">
                        <span>{isEs ? 'Conservación / Almacenamiento' : 'Storage Conditions'}</span>
                        <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 500, textTransform: 'none', marginLeft: '4px' }}>
                          {isEs ? '(Opcional)' : '(Optional)'}
                        </span>
                      </label>
                      <input
                        type="text"
                        value={currentItem.storage || ''}
                        onChange={(e) => handleFieldChange('storage', e.target.value)}
                        className="gcp-form-input"
                        placeholder="Store in a cool dry place, below 25°C."
                      />
                    </div>
                  </div>

                ) : (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.74rem', color: '#0f172a', fontWeight: '600' }}>
                        {isEs 
                          ? 'Edición Flexible Markdown (.md): Incluye fecha de caducidad (exp), farmacia dispensadora, dirección, principios activos y posología. Todo se sincroniza en vivo con el SVG y Firebase.' 
                          : 'Flexible Markdown (.md) Editor: Full control of expiration (exp), dispensary pharmacy, address, active ingredients, and posology. Syncs live with SVG and Firebase.'}
                      </span>
                    </div>
                    <textarea
                      rows={16}
                      value={markdownText}
                      onChange={(e) => handleMarkdownChange(e.target.value)}
                      spellCheck={false}
                      style={{
                        width: '100%',
                        minHeight: '340px',
                        fontSize: '0.80rem',
                        lineHeight: 1.5,
                        padding: '12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        boxSizing: 'border-box',
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                        background: '#f8fafc',
                        color: '#0f172a',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* High-Precision Interactive Vector SVG Preview Frame */}
          <div
            style={{
              width: '100%',
              maxWidth: '960px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              flexShrink: 0,
              boxSizing: 'border-box'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px', flexWrap: 'wrap', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {isEs ? 'Vista Previa en Vivo' : 'Live Preview'}
                </span>
                <FontLegibilityPill pt={minPatientPt} isEs={isEs} compact={false} />
              </div>

              <button
                type="button"
                onClick={() => setCompareMode((v) => !v)}
                aria-pressed={compareMode}
                style={{
                  padding: '6px 10px',
                  minHeight: '32px',
                  borderRadius: '4px',
                  border: compareMode ? '1px solid #1a73e8' : '1px solid #dadce0',
                  background: compareMode ? '#e8f0fe' : '#fff',
                  color: compareMode ? '#1a73e8' : '#3c4043',
                  fontSize: '0.70rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {isEs ? 'Comparar Delivery / Shipping' : 'Compare Delivery / Shipping'}
              </button>

              {/* Multi-step Zoom Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '0.68rem', color: '#5f6368', textTransform: 'uppercase', fontWeight: 600, marginRight: '2px' }}>
                  Zoom:
                </span>
                <div style={{ display: 'inline-flex', background: '#f1f3f4', padding: '2px', borderRadius: '4px', gap: '2px' }}>
                  {[
                    { id: 'fit', label: isEs ? 'Ajustar' : 'Fit' },
                    { id: 1, label: '100%' },
                    { id: 1.5, label: '150%' },
                    { id: 2, label: '200%' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setZoomLevel(opt.id)}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '3px',
                        border: 'none',
                        background: zoomLevel === opt.id ? '#ffffff' : 'transparent',
                        color: zoomLevel === opt.id ? '#1a73e8' : '#5f6368',
                        fontSize: '0.70rem',
                        fontWeight: zoomLevel === opt.id ? 700 : 500,
                        boxShadow: zoomLevel === opt.id ? '0 1px 2px rgba(60,64,67,0.15)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div
              ref={svgContainerRef}
              style={{
                width: '100%',
                borderRadius: '8px',
                border: '1px solid #dadce0',
                boxShadow: '0 2px 6px rgba(60,64,67,0.12), 0 6px 14px rgba(60,64,67,0.06)',
                overflow: 'auto',
                background: '#ffffff',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: zoomLevel === 'fit' ? 'center' : 'flex-start',
                padding: zoomLevel === 'fit' ? '8px' : '20px',
                maxHeight: zoomLevel === 'fit' ? 'clamp(180px, 30vh, 250px)' : '420px',
                boxSizing: 'border-box'
              }}
            >
              <div style={{
                width: zoomLevel === 'fit' 
                  ? 'auto' 
                  : zoomLevel === 1 
                    ? '380px' 
                    : zoomLevel === 1.5 
                      ? '620px' 
                      : '860px',
                height: zoomLevel === 'fit' ? '100%' : 'auto',
                maxWidth: zoomLevel === 'fit' ? '100%' : 'none',
                maxHeight: zoomLevel === 'fit' ? 'clamp(170px, 28vh, 240px)' : 'none',
                aspectRatio: `${dimensions.widthMm} / ${dimensions.heightMm}`,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: zoomLevel === 'fit' ? '0' : '0 auto'
              }}>
                <PharmapolisLabelSvg
                  labelData={currentItem}
                  variant={activeVariant}
                  widthMm={dimensions.widthMm}
                  heightMm={dimensions.heightMm}
                  showCutGuides={showCutGuides}
                />
              </div>
            </div>

            {compareMode && (() => {
              const otherVariant = activeVariant === 'shipping' ? 'backQr' : 'shipping';
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {otherVariant === 'shipping' ? 'Shipping' : 'Delivery'}
                  </span>
                  <div style={{
                    width: '100%',
                    borderRadius: '8px',
                    border: '1px solid #dadce0',
                    background: '#ffffff',
                    padding: '8px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    <div style={{ width: '100%', maxWidth: '380px', aspectRatio: `${dimensions.widthMm} / ${dimensions.heightMm}` }}>
                      <PharmapolisLabelSvg
                        labelData={currentItem}
                        variant={otherVariant}
                        widthMm={dimensions.widthMm}
                        heightMm={dimensions.heightMm}
                        showCutGuides={false}
                      />
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

        </div>

        {/* ── GCP Sticky Action Footer / Mobile Dock Sticker ── */}
        <div className="gcp-labels-sticky-footer">
          {/* Desktop Single-Line Specs */}
          <div className="gcp-footer-desktop-specs" style={{ minWidth: 0, flex: '0 1 auto', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              background: '#e8f0fe',
              color: '#1a73e8',
              padding: '3px 10px',
              borderRadius: '4px',
              fontSize: '0.76rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap'
            }}>
              {isEs ? `Parte ${selectedProductIdx + 1}` : `Part ${selectedProductIdx + 1}`}
            </span>
            <StatusBadge status={currentItem.approvalStatus || 'draft'} />
            <span style={{ fontSize: '0.72rem', color: '#5f6368', fontWeight: 600 }}>
              v{currentItem.version || 1}
            </span>
          </div>

          {/* Mobile Part Badge */}
          <div className="gcp-footer-mobile-specs" style={{ display: 'none' }}>
            <span style={{
              background: '#e8f0fe',
              color: '#1a73e8',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap'
            }}>
              {isEs ? `Parte ${selectedProductIdx + 1}` : `Part ${selectedProductIdx + 1}`}
            </span>
          </div>

          {/* Action Buttons Group (Google Cloud UX Hierarchy) */}
          <div className="gcp-footer-actions-wrap" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, flexWrap: 'nowrap' }}>
            {/* Primary Action: Download based on selected format */}
            {exportFormat === 'md' ? (
              <button
                type="button"
                className="gcp-btn-primary"
                onClick={handleDownloadMarkdown}
                style={{ background: '#1a73e8' }}
              >
                <Download size={15} />
                <span>
                  {isEs ? 'Descargar Markdown (.md)' : 'Download Markdown (.md)'}
                </span>
              </button>
            ) : exportFormat === 'pdf' ? (
              <button
                type="button"
                className="gcp-btn-primary"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                style={{
                  cursor: isGeneratingPdf ? 'wait' : 'pointer',
                  opacity: isGeneratingPdf ? 0.75 : 1
                }}
              >
                <Download size={15} />
                <span>
                  {isGeneratingPdf 
                    ? (isEs ? 'Generando PDF...' : 'Creating PDF...') 
                    : (isEs ? `Descargar PDF (${dimensions.widthMm}×${dimensions.heightMm}mm)` : `Download PDF (${dimensions.widthMm}×${dimensions.heightMm}mm)`)}
                </span>
              </button>
            ) : exportFormat === 'pdf_all' ? (
              <button
                type="button"
                className="gcp-btn-primary"
                onClick={() => handleDownloadAllPdf('individual')}
                disabled={isGeneratingPdf}
                style={{
                  cursor: isGeneratingPdf ? 'wait' : 'pointer',
                  opacity: isGeneratingPdf ? 0.75 : 1
                }}
              >
                <Download size={15} />
                <span>
                  {isGeneratingPdf 
                    ? (isEs ? 'Generando PDF...' : 'Creating PDF...') 
                    : (isEs ? `Descargar Todas (${labels.length})` : `Download All (${labels.length})`)}
                </span>
              </button>
            ) : exportFormat === 'zip' ? (
              <button
                type="button"
                className="gcp-btn-primary"
                onClick={handleDownloadZipPackage}
                disabled={isGeneratingZip}
                style={{
                  cursor: isGeneratingZip ? 'wait' : 'pointer',
                  opacity: isGeneratingZip ? 0.75 : 1
                }}
              >
                <Download size={15} />
                <span>
                  {isGeneratingZip
                    ? (isEs ? 'Generando ZIP...' : 'Creating ZIP...')
                    : (isEs ? `Descargar ZIP (${labels.length * 2} etiquetas)` : `Download ZIP (${labels.length * 2} labels)`)}
                </span>
              </button>
            ) : exportFormat === 'pdf_a4' ? (
              <button
                type="button"
                className="gcp-btn-primary"
                onClick={() => handleDownloadAllPdf('a4_sheet')}
                disabled={isGeneratingPdf}
                style={{
                  cursor: isGeneratingPdf ? 'wait' : 'pointer',
                  opacity: isGeneratingPdf ? 0.75 : 1
                }}
              >
                <Download size={15} />
                <span>
                  {isGeneratingPdf 
                    ? (isEs ? 'Generando Hoja A4...' : 'Creating A4 Sheet...') 
                    : (isEs ? `Descargar Hoja A4 (${labels.length})` : `Download A4 Sheet (${labels.length})`)}
                </span>
              </button>
            ) : (
              <button
                type="button"
                className="gcp-btn-primary"
                onClick={handleDownloadPng}
                disabled={isGeneratingPng}
                style={{
                  cursor: isGeneratingPng ? 'wait' : 'pointer',
                  opacity: isGeneratingPng ? 0.75 : 1
                }}
              >
                <Download size={15} />
                <span>
                  {isGeneratingPng 
                    ? (isEs ? `Generando ${dpi} DPI...` : `Rendering ${dpi} DPI...`) 
                    : (isEs ? `Descargar PNG (${dpi} DPI)` : `Download PNG (${dpi} DPI)`)}
                </span>
              </button>
            )}

            {/* Save to Firebase Action (visible when in Edit mode) */}
            {isEditing && (
              <button
                type="button"
                className="gcp-btn-secondary"
                onClick={() => handleSaveToFirebase()}
                disabled={isSavingToFirebase}
                title={isEs ? 'Guardar cambios en Firebase' : 'Save changes to Firebase'}
                style={{
                  background: firebaseSaveSuccess ? '#e6f4ea' : '#ffffff',
                  color: firebaseSaveSuccess ? '#137333' : '#1a73e8',
                  border: firebaseSaveSuccess ? '1px solid #137333' : '1px solid #1a73e8',
                  fontWeight: 600
                }}
              >
                {firebaseSaveSuccess ? <Check size={14} color="#137333" /> : <Database size={14} />}
                <span>{firebaseSaveSuccess ? (isEs ? 'Guardado ✓' : 'Saved ✓') : (isSavingToFirebase ? (isEs ? 'Guardando...' : 'Saving...') : (isEs ? 'Guardar Cambios' : 'Save Changes'))}</span>
              </button>
            )}

            {/* Secondary Actions (Share & QR Link Grid) */}
            <div className="gcp-footer-secondary-grid">
              <button
                type="button"
                className="gcp-btn-secondary"
                onClick={handleShareEditor}
                style={{
                  color: copiedShareLink ? '#137333' : '#3c4043',
                  background: copiedShareLink ? '#e6f4ea' : '#ffffff',
                  borderColor: copiedShareLink ? '#ceead6' : '#dadce0'
                }}
                title={isEs ? 'Copiar enlace directo del editor para compartir con un tercero' : 'Copy direct link to share editor with a third party'}
              >
                {copiedShareLink ? <Check size={14} color="#137333" /> : <Share2 size={14} />}
                <span>{copiedShareLink ? (isEs ? 'Copiado ✓' : 'Copied ✓') : (isEs ? 'Compartir' : 'Share')}</span>
              </button>



              {currentItem.targetRxUrl && (
                <button
                  type="button"
                  className="gcp-btn-secondary gcp-btn-copy"
                  onClick={handleCopyLink}
                  style={{
                    color: copiedLink ? '#137333' : '#3c4043',
                    background: copiedLink ? '#e6f4ea' : '#ffffff',
                    borderColor: copiedLink ? '#ceead6' : '#dadce0'
                  }}
                  title={currentItem.targetRxUrl}
                >
                  {copiedLink ? <Check size={14} color="#137333" /> : <ExternalLink size={14} />}
                  <span>{copiedLink ? (isEs ? 'Copiado ✓' : 'Copied ✓') : (isEs ? 'Copiar QR' : 'Copy QR Link')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden offscreen vector container for bulk PDF and A4 grid generation */}
      {labels.length > 1 && (
        <div
          style={{ position: 'fixed', left: '-9999px', top: '-9999px', opacity: 0, pointerEvents: 'none' }}
          aria-hidden="true"
        >
          {labels.map((item, idx) => (
            <div key={item.id || idx} id={`pharmapolis-bulk-label-${idx}`}>
              <PharmapolisLabelSvg
                data={editedOverrides[idx] || item}
                variant={activeVariant}
                widthMm={exportFormat === 'pdf_a4' ? 75 : dimensions.widthMm}
                heightMm={exportFormat === 'pdf_a4' ? 45 : dimensions.heightMm}
                dpi={Math.max(dpi, 300)}
                showCutGuides={showCutGuides}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
