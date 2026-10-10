'use client';

import React, { useState, useRef } from 'react';
import { X, Download, QrCode, ExternalLink, Check, Maximize2, Edit3, FileText, Copy, RotateCcw, Database, Eye, Pill, ChevronLeft, ChevronRight, Share2 } from '@/lib/icons';
import { db } from '@/firebase';
import { doc, updateDoc, getDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import PharmapolisLabelSvg from './PharmapolisLabelSvg';

function formatApisForEditor(item) {
  if (!item) return '';
  if (Array.isArray(item.apis) && item.apis.length > 0) {
    const list = item.apis.filter(a => {
      if (typeof a === 'string') return Boolean(a.trim());
      return !a.isVehicle && !a.isVehicleOrBase;
    });
    if (list.length > 0) {
      return list.map(a => {
        if (typeof a === 'string') return a.trim();
        const drug = a.drugName || a.drug || a.name || a.productName || '';
        const dose = a.dosage || a.dose || a.strength || '';
        return dose ? `${drug}: ${dose}` : drug;
      }).filter(Boolean).join('\n');
    }
  }
  if (item.formula) {
    return item.formula
      .split(/\s*(?:\+|\bin\b)\s*/i)
      .map(p => p.trim())
      .filter(Boolean)
      .join('\n');
  }
  return '';
}

function labelToMarkdown(item) {
  if (!item) return '';
  const patient = item.patientName || item.patient?.name || '';
  const fileNo = item.fileNumber || item.rxCode || item.fileNo || item.id || '';
  const batch = item.batchCode || item.lote || fileNo || '';
  const volume = item.volume || item.size || item.netContent || '100 mL';
  const dosageForm = item.dosageForm || 'Topical Scalp Solution';
  const mfg = item.prodDate || item.mfgDate || '05-10-2026';
  const exp = item.expDate || '04-10-2027';
  const doctor = item.doctorName || item.physician || 'Dr. Marina Cordeiro Fernandes';
  const clinic = item.clinicName || 'NOVA Clinic Day Surgery Center, Dubai';
  const license = item.doctorLicense || 'DHA-91105367';
  const storage = item.storage || 'Store at room temperature';
  const title = item.productTitle || item.productName || 'Compounded Pharmaceutical Protocol';

  let apisText = '';
  if (Array.isArray(item.apis) && item.apis.length > 0) {
    const list = item.apis.filter(a => {
      if (typeof a === 'string') return Boolean(a.trim());
      return !a.isVehicle && !a.isVehicleOrBase;
    });
    if (list.length > 0) {
      apisText = list.map(a => {
        if (typeof a === 'string') return `- ${a.replace(/^[*-]\s*/, '').trim()}`;
        const drug = a.drugName || a.drug || a.name || a.productName || '';
        const dose = a.dosage || a.dose || a.strength || '';
        return dose ? `- ${drug}: ${dose}` : `- ${drug}`;
      }).join('\n');
    }
  }
  if (!apisText && item.formula) {
    apisText = item.formula
      .split(/\s*(?:\+|\bin\b)\s*/i)
      .map(p => `- ${p.trim()}`)
      .join('\n');
  }
  if (!apisText) {
    apisText = '- Active Compounded Formulation';
  }

  const vehicle = typeof item.vehicle === 'string' ? item.vehicle : (item.vehicle?.name || '');
  const directions = item.directions || item.instructions || 'Apply / take as directed by prescribing physician.';
  const warnings = item.warnings || item.warning || 'For external / patient use only. Keep out of reach of children.';

  return `---
patient: ${patient}
fileNumber: ${fileNo}
batch: ${batch}
volume: ${volume}
dosageForm: ${dosageForm}
mfg: ${mfg}
exp: ${exp}
doctor: ${doctor}
clinic: ${clinic}
license: ${license}
storage: ${storage}
---

# ${title}

## ACTIVE COMPOUNDED INGREDIENTS
${apisText}

## COMPOUNDING VEHICLE
${vehicle || ''}

## DIRECTIONS FOR USE
${directions}

## WARNINGS & PRECAUTIONS
${warnings}
`;
}

function parseMarkdownToLabel(mdText, baseItem = {}) {
  const result = { ...baseItem };
  if (!mdText) return result;

  const cleanMd = mdText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const fmMatch = cleanMd.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  let body = cleanMd;
  if (fmMatch) {
    body = cleanMd.slice(fmMatch[0].length);
    const lines = fmMatch[1].split('\n');
    lines.forEach(line => {
      const idx = line.indexOf(':');
      if (idx > 0) {
        const key = line.slice(0, idx).trim().toLowerCase();
        const val = line.slice(idx + 1).trim();
        if (key === 'patient' || key === 'patientname') result.patientName = val;
        else if (key === 'filenumber' || key === 'rxcode' || key === 'file' || key === 'rx') {
          result.fileNumber = val;
          result.rxCode = val;
        }
        else if (key === 'batch' || key === 'batchcode' || key === 'lote') {
          result.batchCode = val;
          result.lote = val;
        }
        else if (key === 'volume' || key === 'size' || key === 'netcontent' || key === 'net') result.volume = val;
        else if (key === 'dosageform' || key === 'form') result.dosageForm = val;
        else if (key === 'mfg' || key === 'proddate' || key === 'mfgdate') {
          result.prodDate = val;
          result.mfgDate = val;
        }
        else if (key === 'exp' || key === 'expdate' || key === 'expiry') result.expDate = val;
        else if (key === 'doctor' || key === 'doctorname' || key === 'physician') result.doctorName = val;
        else if (key === 'clinic' || key === 'clinicname') result.clinicName = val;
        else if (key === 'license' || key === 'doctorlicense') result.doctorLicense = val;
        else if (key === 'storage') result.storage = val;
      }
    });
  }

  const titleMatch = body.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    result.productTitle = titleMatch[1].trim();
    result.productName = titleMatch[1].trim();
  }

  const apiMatch = body.match(/##\s+ACTIVE\s+COMPOUNDED\s+INGREDIENTS\s*\n([\s\S]*?)(?=\n##|$)/i);
  if (apiMatch) {
    const rawApis = apiMatch[1]
      .split('\n')
      .map(l => l.replace(/^[*-]\s*/, '').trim())
      .filter(Boolean);
    if (rawApis.length > 0) {
      result.apis = rawApis.map(line => {
        const colonIdx = line.indexOf(':');
        if (colonIdx > 0) {
          return {
            drugName: line.slice(0, colonIdx).trim(),
            dosage: line.slice(colonIdx + 1).trim()
          };
        }
        return { drugName: line };
      });
      result.formula = rawApis.join(' + ');
    }
  }

  const vehMatch = body.match(/##\s+(?:COMPOUNDING\s+)?VEHICLE(?:\s*&\s*BASE)?\s*\n([\s\S]*?)(?=\n##|$)/i);
  if (vehMatch) {
    const veh = vehMatch[1].trim();
    result.vehicle = (veh.toLowerCase().includes('none') || veh.toLowerCase().includes('n/a')) ? '' : veh;
  }

  const dirMatch = body.match(/##\s+DIRECTIONS\s*(?:FOR\s*USE)?\s*\n([\s\S]*?)(?=\n##|$)/i);
  if (dirMatch) {
    result.directions = dirMatch[1].trim();
  }

  const warnMatch = body.match(/##\s+WARNINGS?\s*(?:&|AND)?\s*PRECAUTIONS?\s*\n([\s\S]*?)(?=\n##|$)/i);
  if (warnMatch) {
    result.warnings = warnMatch[1].trim();
  }

  return result;
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
  const [activeVariant, setActiveVariant] = useState('backQr'); // 'front' | 'backQr' | 'frontWithQr'
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf'); // 'pdf' | 'png'
  const [isGeneratingPng, setIsGeneratingPng] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [dpi, setDpi] = useState(300); // 300 | 600 | 1200
  const [showCutGuides, setShowCutGuides] = useState(false); // Scissor cut lines & crop marks toggle (default false for clean label)
  const [zoomLevel, setZoomLevel] = useState('fit'); // 'fit' | 1 | 1.5 | 2

  // Live Online Editing & Markdown Support
  const [isEditing, setIsEditing] = useState(Boolean(initialEditMode));
  const [editorTab, setEditorTab] = useState('fields'); // 'fields' | 'markdown'
  const [editedOverrides, setEditedOverrides] = useState({});
  const [markdownText, setMarkdownText] = useState('');
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

  // Keep markdown text synced when selected product changes (must run unconditionally before any early returns)
  React.useEffect(() => {
    if (!isOpen || !labels || labels.length === 0) return;
    const active = editedOverrides[selectedProductIdx] || labels[selectedProductIdx] || labels[0];
    if (active) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMarkdownText(labelToMarkdown(active));
    }
  }, [isOpen, selectedProductIdx, labels, editedOverrides]);

  if (!isOpen || !labels || labels.length === 0) return null;

  const baseItem = labels[selectedProductIdx] || labels[0];
  const currentItem = editedOverrides[selectedProductIdx] || baseItem;

  const handleFieldChange = (key, val) => {
    const updated = { ...currentItem, [key]: val };
    setEditedOverrides(prev => ({
      ...prev,
      [selectedProductIdx]: updated
    }));
    setMarkdownText(labelToMarkdown(updated));
  };

  const handleApisFieldChange = (rawText) => {
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    const apisArray = lines.map(line => {
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0) {
        return {
          drugName: line.slice(0, colonIdx).trim(),
          dosage: line.slice(colonIdx + 1).trim()
        };
      }
      return { drugName: line };
    });
    const updated = {
      ...currentItem,
      apis: apisArray,
      formula: lines.join(' + ')
    };
    setEditedOverrides(prev => ({
      ...prev,
      [selectedProductIdx]: updated
    }));
    setMarkdownText(labelToMarkdown(updated));
  };

  const handleMarkdownChange = (newMd) => {
    setMarkdownText(newMd);
    const parsed = parseMarkdownToLabel(newMd, baseItem);
    setEditedOverrides(prev => ({
      ...prev,
      [selectedProductIdx]: parsed
    }));
  };

  const handleResetOriginal = () => {
    setEditedOverrides(prev => {
      const copy = { ...prev };
      delete copy[selectedProductIdx];
      return copy;
    });
    setMarkdownText(labelToMarkdown(baseItem));
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

  const handleShareEditor = () => {
    if (typeof window === 'undefined') return;
    const rawCode = currentItem.fileNumber || currentItem.rxCode || baseItem.fileNumber || baseItem.rxCode || baseItem.id || '';
    const cleanCode = encodeURIComponent(String(rawCode).trim());
    const origin = window.location.origin;
    const phaseParam = (selectedProductIdx != null && selectedProductIdx > 0) ? `&phase=${selectedProductIdx + 1}` : '';
    const url = `${origin}/rx/${cleanCode}/labels?edit=true${phaseParam}`;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedShareLink(true);
      setTimeout(() => setCopiedShareLink(false), 2500);
    }
  };

  const handleSaveToFirebase = async () => {
    try {
      setIsSavingToFirebase(true);
      setFirebaseSaveError(null);
      setFirebaseSaveSuccess(false);

      if (!db) {
        throw new Error(isEs ? 'Base de datos no inicializada' : 'Database not initialized');
      }

      const rawId = currentItem.rxId || currentItem.prescriptionId || currentItem.fileNumber || currentItem.id;
      let targetDocRef = null;
      let existingData = null;

      // 1. Direct doc lookup
      if (rawId) {
        try {
          const directRef = doc(db, 'prescriptions', String(rawId));
          const snap = await getDoc(directRef);
          if (snap.exists()) {
            targetDocRef = directRef;
            existingData = snap.data();
          }
        } catch (err) {
          console.warn('[PharmacyLabelsModal] Direct lookup fallback:', err);
        }
      }

      // 2. Query fallback across identifiers
      if (!targetDocRef) {
        const candidates = [
          String(rawId || ''),
          String(currentItem.fileNumber || ''),
          String(currentItem.rxCode || ''),
          String(currentItem.batchCode || '')
        ].filter(Boolean);

        for (const cand of candidates) {
          for (const field of ['code', 'prescriptionCode', 'fileNumber', 'id', 'fagron.boxId', 'fagronDetails.boxId']) {
            const q = query(collection(db, 'prescriptions'), where(field, '==', cand));
            const qSnap = await getDocs(q);
            if (!qSnap.empty) {
              targetDocRef = qSnap.docs[0].ref;
              existingData = qSnap.docs[0].data();
              break;
            }
          }
          if (targetDocRef) break;
        }
      }

      if (!targetDocRef) {
        throw new Error(isEs ? `No se encontró la prescripción "${rawId || 'actual'}" en Firestore.` : `Prescription "${rawId || 'current'}" not found in Firestore.`);
      }

      // Build payload for Firestore
      const updatePayload = {
        updatedAt: serverTimestamp(),
        lastModifiedBy: 'pharmacy_label_editor'
      };

      if (currentItem.patientName) {
        updatePayload.patientName = currentItem.patientName;
        if (existingData?.patient && typeof existingData.patient === 'object') {
          updatePayload['patient.name'] = currentItem.patientName;
          updatePayload['patient.displayName'] = currentItem.patientName;
        }
      }

      if (currentItem.doctorName) {
        updatePayload.doctorName = currentItem.doctorName;
        if (existingData?.treatingDoctor && typeof existingData.treatingDoctor === 'object') {
          updatePayload['treatingDoctor.name'] = currentItem.doctorName;
        }
        if (existingData?.doctor && typeof existingData.doctor === 'object') {
          updatePayload['doctor.name'] = currentItem.doctorName;
        }
      }

      if (currentItem.clinicName) {
        updatePayload.clinicName = currentItem.clinicName;
        if (existingData?.treatingClinic && typeof existingData.treatingClinic === 'object') {
          updatePayload['treatingClinic.name'] = currentItem.clinicName;
        }
      }

      if (currentItem.productTitle || currentItem.productName || currentItem.title) {
        const fullTitle = currentItem.productTitle || currentItem.productName || currentItem.title;
        updatePayload.productTitle = fullTitle;
        updatePayload.productName = fullTitle;
        updatePayload.title = fullTitle;
        updatePayload.medicationName = fullTitle;
      }

      if (currentItem.vehicle || currentItem.compoundingVehicle) {
        const vVal = currentItem.vehicle || currentItem.compoundingVehicle;
        updatePayload.vehicle = vVal;
        updatePayload.compoundingVehicle = vVal;
      }

      if (Array.isArray(currentItem.apis) && currentItem.apis.length > 0) {
        updatePayload.apis = currentItem.apis;
        updatePayload.items = currentItem.apis;
        updatePayload.compounds = currentItem.apis;
      } else if (Array.isArray(currentItem.items) && currentItem.items.length > 0) {
        updatePayload.apis = currentItem.items;
        updatePayload.items = currentItem.items;
        updatePayload.compounds = currentItem.items;
      }

      if (currentItem.batchCode) {
        updatePayload.batchCode = currentItem.batchCode;
        updatePayload.dispensingBatch = currentItem.batchCode;
        if (existingData?.fagron) {
          updatePayload['fagron.boxId'] = currentItem.batchCode;
        }
      }

      if (currentItem.volume) {
        updatePayload.volume = currentItem.volume;
      }

      if (currentItem.expDate) {
        updatePayload.expDate = currentItem.expDate;
        updatePayload.expiryDate = currentItem.expDate;
      }
      if (currentItem.prodDate || currentItem.mfgDate) {
        updatePayload.mfgDate = currentItem.prodDate || currentItem.mfgDate;
        updatePayload.prodDate = currentItem.prodDate || currentItem.mfgDate;
      }

      if (currentItem.directions) {
        updatePayload.directions = currentItem.directions;
        updatePayload.instructions = currentItem.directions;
        if (existingData?.posology && typeof existingData.posology === 'object') {
          updatePayload['posology.regimen'] = currentItem.directions;
        }
      }

      if (currentItem.storage) {
        updatePayload.storage = currentItem.storage;
      }

      if (currentItem.warnings) {
        updatePayload.warnings = currentItem.warnings;
      }

      if (currentItem.formula) {
        updatePayload.formula = currentItem.formula;
      }

      const phaseIdx = Math.max(0, (currentItem.phaseNumber || 1) - 1);

      // Also sync multi-part sequential phases in rx.parts if present
      if (Array.isArray(existingData?.parts)) {
        const updatedParts = [...existingData.parts];
        if (updatedParts[phaseIdx]) {
          updatedParts[phaseIdx] = {
            ...updatedParts[phaseIdx],
            title: currentItem.productTitle || updatedParts[phaseIdx].title,
            volume: currentItem.volume || updatedParts[phaseIdx].volume,
            directions: currentItem.directions || updatedParts[phaseIdx].directions,
            posology: currentItem.directions || updatedParts[phaseIdx].posology,
            vehicle: currentItem.vehicle || updatedParts[phaseIdx].vehicle,
            apis: currentItem.apis || updatedParts[phaseIdx].apis
          };
          updatePayload.parts = updatedParts;
        }
      }

      // Preserve full label snapshot across all phases in pharmacyLabels array
      const allModalLabels = labels.map((lbl, idx) => {
        const ovr = editedOverrides[idx];
        return ovr ? { ...lbl, ...ovr } : lbl;
      });
      const currentLabelsSnapshot = Array.isArray(existingData?.pharmacyLabels) && existingData.pharmacyLabels.length >= allModalLabels.length
        ? [...existingData.pharmacyLabels]
        : [...allModalLabels];
      currentLabelsSnapshot[phaseIdx] = {
        ...(currentLabelsSnapshot[phaseIdx] || {}),
        ...currentItem
      };
      updatePayload.pharmacyLabels = currentLabelsSnapshot;

      await updateDoc(targetDocRef, updatePayload);

      // Invalidate server cache immediately
      try {
        fetch('/api/prescriptions/invalidate-cache', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: rawId || targetDocRef.id })
        }).catch(err => console.warn('[PharmacyLabelsModal] Invalidate cache warning:', err));
      } catch (cacheErr) {
        console.warn('[PharmacyLabelsModal] Cache invalidation call failed:', cacheErr);
      }

      setFirebaseSaveSuccess(true);
      setTimeout(() => setFirebaseSaveSuccess(false), 3000);

      // Dispatch event to inform other active components (e.g. prescription views)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('prescription-updated', {
          detail: {
            id: targetDocRef.id,
            rxId: rawId,
            updatedFields: updatePayload,
            updatedData: updatePayload,
            item: currentItem
          }
        }));
      }

      if (typeof onPrescriptionUpdated === 'function') {
        onPrescriptionUpdated({
          id: targetDocRef.id,
          rxId: rawId,
          updatedFields: updatePayload,
          updatedData: updatePayload,
          item: currentItem
        });
      }
    } catch (err) {
      console.error('[PharmacyLabelsModal] Error saving to Firebase:', err);
      setFirebaseSaveError(err.message || 'Error saving to Firebase');
      setTimeout(() => setFirebaseSaveError(null), 4000);
    } finally {
      setIsSavingToFirebase(false);
    }
  };

  // Calculated pixel dimensions at current DPI: (mm / 25.4) * DPI
  const exportWidthPx = Math.round((dimensions.widthMm / 25.4) * dpi);
  const exportHeightPx = Math.round((dimensions.heightMm / 25.4) * dpi);

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
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = widthPx;
        canvas.height = heightPx;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, widthPx, heightPx);
        ctx.drawImage(img, 0, 0, widthPx, heightPx);
        URL.revokeObjectURL(svgUrl);

        const pngDataUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngDataUrl;

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

        const variantClean = activeVariant === 'backQr' ? 'BACK-QR' : (activeVariant === 'frontWithQr' ? 'FRONT-QR' : 'FRONT');

        const nameSegments = [supplierClean, patientClean, rxCodeClean, partTag, sizeTag, `${dimensions.widthMm}x${dimensions.heightMm}mm`, variantClean, `${dpi}DPI`].filter(Boolean);
        downloadLink.download = `${nameSegments.join('_')}.png`;
        downloadLink.click();
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

      const variantClean = activeVariant === 'backQr' ? 'BACK-QR' : (activeVariant === 'frontWithQr' ? 'FRONT-QR' : 'FRONT');

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
          padding: 16px 20px 48px 20px;
          min-height: auto;
          display: flex;
          align-items: flex-start;
          justify-content: center;
        }
        .gcp-labels-backdrop.is-standalone-page .gcp-labels-dialog {
          max-width: 960px;
          max-height: none;
          height: auto;
          box-shadow: 0 1px 3px rgba(60, 64, 67, 0.12), 0 2px 8px rgba(60, 64, 67, 0.08);
          border: 1px solid #dadce0;
          border-radius: 8px;
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
          max-width: 860px;
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
            grid-template-columns: 1fr 1fr !important;
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
          .gcp-toolbar-select {
            height: 36px !important;
            font-size: 13px !important;
          }
          .gcp-toolbar-btn {
            height: 36px !important;
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
          .gcp-editor-aux-btn {
            flex: 1 1 calc(25% - 6px) !important;
            min-width: 66px !important;
            height: 36px !important;
            justify-content: center !important;
          }
        }
      `}</style>

      <div className="gcp-labels-dialog">
        {/* Header */}
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

        {/* Content Body */}
        <div className="gcp-labels-body">
          {/* Google Cloud Dedicated Primary Resource / Formula Selector Card */}
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
                  <span className="gcp-resource-subtitle-code">
                    {currentItem.fileNumber || currentItem.rxCode || 'RX-COMPOUND'}
                  </span>
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

            {/* Unwrapped Full Name and Formula Details Banner (Zero ellipsis · 100% visible on both mobile and laptop) */}
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
                    <option value="pdf">{isEs ? `PDF (Esta Etiqueta · ${dimensions.widthMm}×${dimensions.heightMm}mm)` : `PDF (Current Label · ${dimensions.widthMm}×${dimensions.heightMm}mm)`}</option>
                    {labels.length > 1 && (
                      <>
                        <option value="pdf_all">{isEs ? `PDF (Todas · ${labels.length} Etiquetas)` : `PDF (All ${labels.length} Labels)`}</option>
                        <option value="pdf_a4">{isEs ? `Hoja A4 (10 por hoja · 2×5 Grid)` : `A4 Sheet (10 per page · 2×5 Grid)`}</option>
                      </>
                    )}
                    <option value="png">{isEs ? 'PNG (Imagen HD)' : 'PNG (HD Image)'}</option>
                    <option value="md">Markdown (.md)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bottom Row: Tool Actions (Cut Guides, Edit, Share) */}
            <div className="gcp-toolbar-row-bottom">
              {/* Field 5: Cut Guides (✂) Toggle */}
              <button
                type="button"
                onClick={() => setShowCutGuides(prev => !prev)}
                className="gcp-toolbar-btn"
                style={{
                  border: showCutGuides ? '1px solid #1a73e8' : '1px solid #dadce0',
                  background: showCutGuides ? '#e8f0fe' : '#ffffff',
                  color: showCutGuides ? '#1a73e8' : '#5f6368'
                }}
                title={isEs ? 'Mostrar/Ocultar guías de corte con tijera' : 'Toggle scissor cut lines & crop marks'}
              >
                <span style={{ fontSize: '0.88rem' }}>✂</span>
                <span>{isEs ? 'Guías de Corte' : 'Cut Guides'}</span>
                <span style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: showCutGuides ? '#1a73e8' : '#dadce0',
                  display: 'inline-block'
                }} />
              </button>

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
              maxWidth: '860px',
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
                {/* Tabs */}
                <div className="gcp-editor-tabs-wrap" style={{ display: 'inline-flex', background: '#e8f0fe', padding: '2px', borderRadius: '4px', gap: '2px' }}>
                  <button
                    type="button"
                    onClick={() => setEditorTab('fields')}
                    className="gcp-editor-tab-btn"
                    style={{
                      padding: '4px 10px',
                      borderRadius: '3px',
                      border: 'none',
                      background: editorTab === 'fields' ? '#ffffff' : 'transparent',
                      color: editorTab === 'fields' ? '#1a73e8' : '#5f6368',
                      fontSize: '0.74rem',
                      fontWeight: editorTab === 'fields' ? 700 : 500,
                      cursor: 'pointer',
                      boxShadow: editorTab === 'fields' ? '0 1px 2px rgba(60,64,67,0.15)' : 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Edit3 size={12} />
                    <span>{isEs ? 'Campos' : 'Fields'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorTab('markdown')}
                    className="gcp-editor-tab-btn"
                    style={{
                      padding: '4px 10px',
                      borderRadius: '3px',
                      border: 'none',
                      background: editorTab === 'markdown' ? '#ffffff' : 'transparent',
                      color: editorTab === 'markdown' ? '#1a73e8' : '#5f6368',
                      fontSize: '0.74rem',
                      fontWeight: editorTab === 'markdown' ? 700 : 500,
                      cursor: 'pointer',
                      boxShadow: editorTab === 'markdown' ? '0 1px 2px rgba(60,64,67,0.15)' : 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <FileText size={12} />
                    <span>Markdown (.md)</span>
                  </button>
                </div>

                {/* Editor Action Buttons: Save to Atlas, Download .md, Reset */}
                <div className="gcp-editor-actions-wrap" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  {/* SAVE TO ATLAS BUTTON */}
                  <button
                    type="button"
                    onClick={handleSaveToFirebase}
                    disabled={isSavingToFirebase}
                    className="gcp-editor-save-btn"
                    style={{
                      padding: '4px 12px',
                      borderRadius: '4px',
                      border: firebaseSaveSuccess ? '1px solid #137333' : '1px solid #1a73e8',
                      background: firebaseSaveSuccess ? '#e6f4ea' : '#1a73e8',
                      color: firebaseSaveSuccess ? '#137333' : '#ffffff',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: isSavingToFirebase ? 'wait' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'all 0.15s',
                      boxShadow: '0 1px 2px rgba(60,64,67,0.2)'
                    }}
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
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: '1px solid #dadce0',
                      background: '#ffffff',
                      color: '#3c4043',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title={isEs ? 'Descargar monografía en formato Markdown' : 'Download monograph in Markdown format'}
                  >
                    <Download size={12} />
                    <span>{isEs ? 'Descargar .md' : 'Download .md'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetOriginal}
                    className="gcp-editor-aux-btn"
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: '1px solid #dadce0',
                      background: '#ffffff',
                      color: '#d93025',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title={isEs ? 'Restablecer datos originales de la prescripción' : 'Reset to original prescription data'}
                  >
                    <RotateCcw size={12} />
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
                {editorTab === 'fields' ? (
                  <div className="gcp-editor-fields-grid">
                    {/* Row 1: Patient Name (6 cols) | Dispensing Batch (3 cols) | Net Quantity (3 cols) */}
                    <div className="gcp-col-6 gcp-field-wrap">
                      <label className="gcp-form-label">
                        {isEs ? 'Nombre Paciente' : 'Patient Name'}
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
                        {isEs ? 'Lote (Batch)' : 'Dispensing Batch'}
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
                        {isEs ? 'Cantidad Neta' : 'Net Quantity'}
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
                      <label className="gcp-form-label">
                        {isEs ? 'Título Producto / Fórmula' : 'Product Title / Formula'}
                      </label>
                      <input
                        type="text"
                        value={currentItem.productTitle || currentItem.productName || ''}
                        onChange={(e) => handleFieldChange('productTitle', e.target.value)}
                        className="gcp-form-input"
                        placeholder="e.g. Phase 2: Metabolic & Lipid Optimization Evening Formula"
                      />
                    </div>

                    {/* Row 3: Prescribing Doctor (6 cols) & Clinic (6 cols) -> generous width, zero truncation */}
                    <div className="gcp-col-6 gcp-field-wrap">
                      <label className="gcp-form-label">
                        {isEs ? 'Médico Prescriptor' : 'Prescribing Doctor'}
                      </label>
                      <input
                        type="text"
                        value={currentItem.doctorName || currentItem.physician || ''}
                        onChange={(e) => handleFieldChange('doctorName', e.target.value)}
                        className="gcp-form-input"
                        placeholder="Dr. Marina Cordeiro Fernandes"
                      />
                    </div>

                    <div className="gcp-col-6 gcp-field-wrap">
                      <label className="gcp-form-label">
                        {isEs ? 'Clínica' : 'Clinic'}
                      </label>
                      <input
                        type="text"
                        value={currentItem.clinicName || ''}
                        onChange={(e) => handleFieldChange('clinicName', e.target.value)}
                        className="gcp-form-input"
                        placeholder="NOVA Clinic, Dubai"
                      />
                    </div>

                    <div className="gcp-col-12 gcp-field-wrap">
                      <label className="gcp-form-label">
                        <span>{isEs ? 'Principios Activos y Concentración' : 'Active Ingredients & Strength'}</span>
                        <span style={{ fontSize: '0.66rem', color: '#5f6368', textTransform: 'none', fontWeight: 500 }}>
                          {isEs ? '(un ingrediente por línea · formato: Fármaco: Dosis)' : '(one per line · Drug: Dose)'}
                        </span>
                      </label>
                      <textarea
                        rows={4}
                        value={formatApisForEditor(currentItem)}
                        onChange={(e) => handleApisFieldChange(e.target.value)}
                        className="gcp-form-textarea"
                        style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
                        placeholder="Ubiquinol (Kaneka® CoQ10): 250 mg&#10;Saw Palmetto Extract: 250 mg&#10;Arginine: 1.5%"
                      />
                    </div>

                    <div className="gcp-col-12 gcp-field-wrap">
                      <label className="gcp-form-label">
                        {isEs ? 'Vehículo de Formulación (Compounding Vehicle)' : 'Compounding Vehicle'}
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
                      <label className="gcp-form-label">
                        {isEs ? 'Posología / Modo de Empleo (Directions for Use)' : 'Directions for Use'}
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
                        {isEs ? 'Fecha Fabricación (Mfg)' : 'Mfg Date'}
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
                        {isEs ? 'Fecha Caducidad (Exp)' : 'Expiry Date'}
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
                        {isEs ? 'Conservación / Almacenamiento' : 'Storage Conditions'}
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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.70rem', color: '#5f6368' }}>
                        {isEs ? 'Edita directamente el archivo Markdown. Los cambios se sincronizan en vivo con el SVG, PDFs y Firebase.' : 'Edit raw Markdown. Changes reflect live on the SVG, PDF outputs and Firebase.'}
                      </span>
                    </div>
                    <textarea
                      rows={10}
                      value={markdownText}
                      onChange={(e) => handleMarkdownChange(e.target.value)}
                      style={{
                        width: '100%',
                        fontSize: '0.76rem',
                        lineHeight: 1.45,
                        padding: '8px',
                        border: '1px solid #dadce0',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                        background: '#ffffff',
                        color: '#1e293b'
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
              maxWidth: '760px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              alignSelf: 'stretch',
              flexShrink: 0
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px', flexWrap: 'wrap', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {isEs ? 'Vista Previa en Vivo' : 'Live Preview'}
                </span>
                <span style={{ fontSize: '0.66rem', color: '#137333', background: '#e6f4ea', border: '1px solid #ceead6', padding: '1px 6px', borderRadius: '3px', fontWeight: 600 }}>
                  Vector SVG · Min 6.5pt Print Legible
                </span>
              </div>

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
          </div>

        </div>

        {/* ── GCP Sticky Action Footer / Mobile Dock Sticker ── */}
        <div className="gcp-labels-sticky-footer">
          {/* Desktop Single-Line Specs */}
          <div className="gcp-footer-desktop-specs" style={{ minWidth: 0, flex: '0 1 auto', overflow: 'hidden' }}>
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
                onClick={handleSaveToFirebase}
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
