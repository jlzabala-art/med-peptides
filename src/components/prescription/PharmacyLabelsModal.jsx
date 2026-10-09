'use client';

import React, { useState, useRef } from 'react';
import { X, Download, Printer, QrCode, ExternalLink, Check, Maximize2, Edit3, FileText, Copy, RotateCcw, Database } from '@/lib/icons';
import { db } from '@/firebase';
import { doc, updateDoc, getDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import PharmapolisLabelSvg from './PharmapolisLabelSvg';

function formatApisForEditor(item) {
  if (!item) return '';
  if (Array.isArray(item.apis) && item.apis.length > 0) {
    const list = item.apis.filter(a => !a.isVehicle && !a.isVehicleOrBase);
    if (list.length > 0) {
      return list.map(a => {
        const drug = a.drugName || a.drug || a.name || a.productName || '';
        const dose = a.dosage || a.dose || a.strength || '';
        return dose ? `${drug}: ${dose}` : drug;
      }).join('\n');
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
    const list = item.apis.filter(a => !a.isVehicle && !a.isVehicleOrBase);
    if (list.length > 0) {
      apisText = list.map(a => {
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

  const fmMatch = mdText.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  let body = mdText;
  if (fmMatch) {
    body = mdText.slice(fmMatch[0].length);
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
  isEs = false
}) {
  const [selectedProductIdx, setSelectedProductIdx] = useState(initialLabelIndex || 0);
  const [activeVariant, setActiveVariant] = useState('backQr'); // 'front' | 'backQr' | 'frontWithQr'
  const [copiedLink, setCopiedLink] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf'); // 'pdf' | 'png'
  const [isGeneratingPng, setIsGeneratingPng] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [dpi, setDpi] = useState(300); // 300 | 600 | 1200
  const [showCutGuides, setShowCutGuides] = useState(false); // Scissor cut lines & crop marks toggle (default false for clean label)
  const [zoomLevel, setZoomLevel] = useState('fit'); // 'fit' | 1 | 1.5 | 2

  // Live Online Editing & Markdown Support
  const [isEditing, setIsEditing] = useState(false);
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
      setSelectedProductIdx(initialLabelIndex);
    }
  }, [initialLabelIndex, labels]);

  // Sizing Presets & Custom Dimensions
  const [selectedPreset, setSelectedPreset] = useState('75x45');
  const [dimensions, setDimensions] = useState({ widthMm: 75, heightMm: 45 });
  const [customWidth, setCustomWidth] = useState(75);
  const [customHeight, setCustomHeight] = useState(45);

  const svgContainerRef = useRef(null);

  if (!isOpen || !labels || labels.length === 0) return null;

  const baseItem = labels[selectedProductIdx] || labels[0];
  const currentItem = editedOverrides[selectedProductIdx] || baseItem;

  // Keep markdown text synced when selected product changes
  React.useEffect(() => {
    const active = editedOverrides[selectedProductIdx] || labels[selectedProductIdx] || labels[0];
    if (active) {
      setMarkdownText(labelToMarkdown(active));
    }
  }, [selectedProductIdx, labels]);

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
        } catch (_) {}
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

      if (currentItem.warnings) {
        updatePayload.warnings = currentItem.warnings;
      }

      if (currentItem.formula) {
        updatePayload.formula = currentItem.formula;
      }

      // Preserve full label snapshot in pharmacyLabels array
      const currentLabelsSnapshot = Array.isArray(existingData?.pharmacyLabels) ? [...existingData.pharmacyLabels] : [];
      const phaseIdx = Math.max(0, (currentItem.phaseNumber || 1) - 1);
      currentLabelsSnapshot[phaseIdx] = {
        ...(currentLabelsSnapshot[phaseIdx] || {}),
        ...currentItem
      };
      updatePayload.pharmacyLabels = currentLabelsSnapshot;

      await updateDoc(targetDocRef, updatePayload);

      setFirebaseSaveSuccess(true);
      setTimeout(() => setFirebaseSaveSuccess(false), 3000);

      // Dispatch event to inform other active components (e.g. prescription views)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('prescription-updated', {
          detail: { id: targetDocRef.id, updatedFields: updatePayload }
        }));
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

  // High-Resolution 1:1 Physical Scaled PDF Generator (Editable & Vector Compatible)
  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      const svgElement = svgContainerRef.current?.querySelector('svg');
      if (!svgElement) {
        setIsGeneratingPdf(false);
        return;
      }

      // Render at ultra-sharp resolution (600 DPI) for crisp physical printing
      const pdfRenderDpi = Math.max(dpi, 600);
      const widthPx = Math.round((dimensions.widthMm / 25.4) * pdfRenderDpi);
      const heightPx = Math.round((dimensions.heightMm / 25.4) * pdfRenderDpi);

      const clonedSvg = svgElement.cloneNode(true);
      clonedSvg.setAttribute('width', `${widthPx}px`);
      clonedSvg.setAttribute('height', `${heightPx}px`);

      const svgXml = new XMLSerializer().serializeToString(clonedSvg);
      const svgBlob = new Blob([svgXml], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = async () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = widthPx;
          canvas.height = heightPx;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, widthPx, heightPx);
          ctx.drawImage(img, 0, 0, widthPx, heightPx);
          URL.revokeObjectURL(svgUrl);

          const imgData = canvas.toDataURL('image/png', 1.0);

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
      img.onerror = () => {
        setIsGeneratingPdf(false);
      };
      img.src = svgUrl;
    } catch (err) {
      console.error('Error generating PDF:', err);
      setIsGeneratingPdf(false);
    }
  };

  // High-Precision Vector Print Engine
  const handlePrint = () => {
    const svgElement = svgContainerRef.current?.querySelector('svg');
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const svgHtml = svgElement ? svgElement.outerHTML : '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${currentItem.productName || 'Pharmapolis Label'} - ${dimensions.widthMm}x${dimensions.heightMm}mm</title>
          <style>
            @page {
              size: ${dimensions.widthMm}mm ${dimensions.heightMm}mm;
              margin: 0;
            }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              padding: 0;
              width: ${dimensions.widthMm}mm;
              height: ${dimensions.heightMm}mm;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #fff;
              overflow: hidden;
            }
            svg {
              width: ${dimensions.widthMm}mm !important;
              height: ${dimensions.heightMm}mm !important;
              display: block;
            }
          </style>
        </head>
        <body>
          ${svgHtml}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 250);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleCopyLink = () => {
    if (currentItem.targetRxUrl) {
      navigator.clipboard.writeText(currentItem.targetRxUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="gcp-labels-backdrop">
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
        }
        .gcp-labels-dialog {
          background: #ffffff;
          border-radius: 12px;
          max-width: 920px;
          width: 100%;
          max-height: 94vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 48px -10px rgba(60, 64, 67, 0.28), 0 4px 12px rgba(60, 64, 67, 0.15);
          overflow: hidden;
          border: 1px solid #dadce0;
          position: relative;
        }
        .gcp-labels-header {
          padding: 12px 18px;
          border-bottom: 1px solid #dadce0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #ffffff;
          flex-shrink: 0;
        }
        .gcp-labels-body {
          flex: 1 1 auto;
          min-height: 0;
          overflow-y: auto;
          padding: 12px 18px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: center;
          -webkit-overflow-scrolling: touch;
        }
        .gcp-labels-sticky-footer {
          flex-shrink: 0;
          background: #ffffff;
          border-top: 1px solid #dadce0;
          padding: 10px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          z-index: 20;
          box-shadow: 0 -2px 6px rgba(60, 64, 67, 0.05);
        }
        .gcp-footer-desktop-specs {
          display: block;
          min-width: 0;
          flex: 1 1 auto;
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
          flex-wrap: wrap;
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
          gap: 7px;
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
          padding: 0 14px;
          border-radius: 4px;
          background: #ffffff;
          border: 1px solid #dadce0;
          color: #1a73e8;
          font-size: 0.80rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
          white-space: nowrap;
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

        /* ── Laptop Screen Breakpoint (641px - 1040px) ── */
        @media (min-width: 641px) and (max-width: 1040px) {
          .gcp-labels-dialog {
            max-width: 96vw;
            max-height: 94vh;
          }
          .gcp-labels-sticky-footer {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
            padding: 10px 16px;
          }
          .gcp-footer-desktop-specs {
            text-align: center;
            width: 100%;
          }
          .gcp-footer-desktop-specs > div {
            justify-content: center;
          }
          .gcp-footer-actions-wrap {
            width: 100%;
            justify-content: center;
            gap: 8px;
          }
        }

        /* ── Compact Laptop Viewport Height (<= 850px) ── */
        @media (max-height: 850px) {
          .gcp-labels-dialog {
            max-height: 96vh;
          }
          .gcp-labels-header {
            padding: 8px 14px;
          }
          .gcp-labels-body {
            padding: 8px 14px;
            gap: 6px;
          }
          .gcp-labels-sticky-footer {
            padding: 8px 14px;
          }
          .gcp-btn-primary, .gcp-btn-secondary {
            height: 32px;
            font-size: 0.78rem;
          }
        }

        /* ── Responsive Mobile Rules (Google Cloud Mobile UX Standards) ── */
        @media (max-width: 640px) {
          .gcp-labels-backdrop {
            padding: 0;
            align-items: flex-end;
          }
          .gcp-labels-dialog {
            max-height: 100dvh;
            height: 100%;
            border-radius: 14px 14px 0 0;
            border: none;
            box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.25);
          }
          .gcp-labels-header {
            padding: 10px 14px;
          }
          .gcp-labels-body {
            padding: 10px 12px 14px 12px;
            gap: 8px;
          }
          .gcp-labels-sticky-footer {
            position: sticky;
            bottom: 0;
            left: 0;
            right: 0;
            width: 100%;
            padding: 10px 14px calc(10px + env(safe-area-inset-bottom, 8px)) 14px;
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
            background: #ffffff;
            border-top: 1px solid #e0e0e0;
            box-shadow: 0 -4px 18px rgba(60, 64, 67, 0.12), 0 -1px 3px rgba(60, 64, 67, 0.08);
          }
          .gcp-footer-desktop-specs {
            display: none;
          }
          .gcp-footer-mobile-specs {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            font-size: 0.74rem;
            color: #5f6368;
            padding: 0 2px;
          }
          .gcp-footer-actions-wrap {
            display: flex;
            flex-direction: column;
            gap: 8px;
            width: 100%;
          }
          .gcp-btn-primary {
            width: 100%;
            height: 42px;
            font-size: 0.86rem;
            border-radius: 6px;
          }
          .gcp-footer-secondary-grid {
            display: grid;
            gap: 8px;
            width: 100%;
          }
          .gcp-btn-secondary {
            width: 100%;
            height: 38px;
            font-size: 0.78rem;
            border-radius: 6px;
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
          {/* Google Cloud Compact Controls Toolbar (Dropdown Fields) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            background: '#f8fafc',
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #dadce0',
            width: '100%',
            maxWidth: '760px',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: 1 }}>
              {/* Field 1: Preparation / Phase (if multi-product) */}
              {labels.length > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <label htmlFor="gcp-label-phase" style={{ fontSize: '0.70rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                    {isEs ? 'Fase:' : 'Phase:'}
                  </label>
                  <select
                    id="gcp-label-phase"
                    value={selectedProductIdx}
                    onChange={(e) => setSelectedProductIdx(Number(e.target.value))}
                    style={{
                      height: 30,
                      padding: '0 24px 0 8px',
                      borderRadius: '4px',
                      border: '1px solid #dadce0',
                      background: '#ffffff',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      color: '#202124',
                      cursor: 'pointer',
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235f6368' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 6px center',
                      outline: 'none'
                    }}
                  >
                    {labels.map((lbl, idx) => (
                      <option key={lbl.id || idx} value={idx}>
                        Phase {lbl.phaseNumber || idx + 1}: {lbl.productName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Field 2: Label Variant (Type) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <label htmlFor="gcp-label-variant" style={{ fontSize: '0.70rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                  {isEs ? 'Tipo:' : 'Label:'}
                </label>
                <select
                  id="gcp-label-variant"
                  value={activeVariant}
                  onChange={(e) => setActiveVariant(e.target.value)}
                  style={{
                    height: 30,
                    padding: '0 24px 0 8px',
                    borderRadius: '4px',
                    border: '1px solid #dadce0',
                    background: '#ffffff',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    color: '#202124',
                    cursor: 'pointer',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235f6368' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 6px center',
                    outline: 'none'
                  }}
                >
                  <option value="backQr">{isEs ? 'Reverso con QR (Trazabilidad)' : 'Back Label with QR (Traceability)'}</option>
                  <option value="front">{isEs ? 'Frontal Estándar' : 'Front Label (Standard)'}</option>
                  <option value="frontWithQr">{isEs ? 'Frontal con Micro-QR' : 'Front Label with Micro-QR'}</option>
                </select>
              </div>

              {/* Field 3: Label Size / Format */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <label htmlFor="gcp-label-size" style={{ fontSize: '0.70rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                  {isEs ? 'Medida:' : 'Size:'}
                </label>
                <select
                  id="gcp-label-size"
                  value={selectedPreset}
                  onChange={(e) => {
                    const p = PRESETS.find(x => x.id === e.target.value);
                    if (p) handleSelectPreset(p);
                  }}
                  style={{
                    height: 30,
                    padding: '0 24px 0 8px',
                    borderRadius: '4px',
                    border: '1px solid #dadce0',
                    background: '#ffffff',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    color: '#202124',
                    cursor: 'pointer',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235f6368' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 6px center',
                    outline: 'none'
                  }}
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
                        height: 26,
                        padding: '0 3px',
                        fontSize: '0.74rem',
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
                        height: 26,
                        padding: '0 3px',
                        fontSize: '0.74rem',
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

              {/* Field 4: Print Resolution / DPI */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <label htmlFor="gcp-label-dpi" style={{ fontSize: '0.70rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                  DPI:
                </label>
                <select
                  id="gcp-label-dpi"
                  value={dpi}
                  onChange={(e) => setDpi(Number(e.target.value))}
                  style={{
                    height: 30,
                    padding: '0 22px 0 8px',
                    borderRadius: '4px',
                    border: '1px solid #dadce0',
                    background: '#ffffff',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    color: '#202124',
                    cursor: 'pointer',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235f6368' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 6px center',
                    outline: 'none'
                  }}
                >
                  <option value={300}>300 DPI (Standard)</option>
                  <option value={600}>600 DPI (Micro-Print)</option>
                  <option value={1200}>1200 DPI (Ultra HD)</option>
                </select>
              </div>

              {/* Field 5: Export Format Selector (PDF / PNG) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <label htmlFor="gcp-label-format" style={{ fontSize: '0.70rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                  {isEs ? 'Formato:' : 'Format:'}
                </label>
                <select
                  id="gcp-label-format"
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  style={{
                    height: 30,
                    padding: '0 24px 0 8px',
                    borderRadius: '4px',
                    border: '1px solid #1a73e8',
                    background: '#f8fafd',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    color: '#1a73e8',
                    cursor: 'pointer',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%231a73e8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 6px center',
                    outline: 'none'
                  }}
                >
                  <option value="pdf">PDF (Editable 1:1)</option>
                  <option value="png">PNG (Imagen HD)</option>
                </select>
              </div>

              {/* Field 5: Cut Guides (✂) Toggle */}
              <button
                type="button"
                onClick={() => setShowCutGuides(prev => !prev)}
                style={{
                  height: 30,
                  padding: '0 10px',
                  borderRadius: '4px',
                  border: showCutGuides ? '1px solid #1a73e8' : '1px solid #dadce0',
                  background: showCutGuides ? '#e8f0fe' : '#ffffff',
                  color: showCutGuides ? '#1a73e8' : '#5f6368',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s'
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

              {/* Field 6: Online Label & Markdown Editor Toggle */}
              <button
                type="button"
                onClick={() => setIsEditing(prev => !prev)}
                style={{
                  height: 30,
                  padding: '0 10px',
                  borderRadius: '4px',
                  border: isEditing ? '1px solid #1a73e8' : '1px solid #dadce0',
                  background: isEditing ? '#e8f0fe' : '#ffffff',
                  color: isEditing ? '#1a73e8' : '#3c4043',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s'
                }}
                title={isEs ? 'Editar campos de la etiqueta y formato Markdown con guardado en Firebase' : 'Edit label fields & Markdown with live Firebase sync'}
              >
                <Edit3 size={13} />
                <span>{isEs ? 'Editar / Markdown (.md)' : 'Edit / Markdown (.md)'}</span>
                <span style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: isEditing ? '#1a73e8' : '#dadce0',
                  display: 'inline-block'
                }} />
              </button>
            </div>

            {/* Active Output Pixel Resolution Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.70rem',
              color: '#1a73e8',
              background: '#e8f0fe',
              border: '1px solid #d2e3fc',
              padding: '3px 8px',
              borderRadius: '4px',
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}>
              <span>{exportWidthPx} × {exportHeightPx} px</span>
              <span>·</span>
              <span>{dpi} DPI</span>
            </div>
          </div>

          {/* Online Label Editor & Markdown Sync Panel */}
          {isEditing && (
            <div style={{
              width: '100%',
              maxWidth: '760px',
              background: '#ffffff',
              border: '1px solid #1a73e8',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(26,115,232,0.12)',
              overflow: 'hidden',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              marginBottom: '4px'
            }}>
              {/* Editor Header Bar with Tabs and Actions */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                background: '#f8fafd',
                borderBottom: '1px solid #d2e3fc',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                {/* Tabs */}
                <div style={{ display: 'inline-flex', background: '#e8f0fe', padding: '2px', borderRadius: '4px', gap: '2px' }}>
                  <button
                    type="button"
                    onClick={() => setEditorTab('fields')}
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

                {/* Editor Action Buttons: Save to Firebase, Copy .md, Download .md, Reset */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  {/* SAVE TO FIREBASE BUTTON */}
                  <button
                    type="button"
                    onClick={handleSaveToFirebase}
                    disabled={isSavingToFirebase}
                    style={{
                      padding: '4px 10px',
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
                    title={isEs ? 'Guardar cambios directamente en Firebase (base de datos oficial)' : 'Save changes directly to Firebase'}
                  >
                    {firebaseSaveSuccess ? (
                      <>
                        <Check size={13} color="#137333" />
                        <span>{isEs ? 'Guardado en Firebase ✓' : 'Saved in Firebase ✓'}</span>
                      </>
                    ) : (
                      <>
                        <Database size={13} />
                        <span>{isSavingToFirebase ? (isEs ? 'Guardando...' : 'Saving...') : (isEs ? 'Guardar en Firebase' : 'Save to Firebase')}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyMarkdown}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: '1px solid #dadce0',
                      background: copiedMd ? '#e6f4ea' : '#ffffff',
                      color: copiedMd ? '#137333' : '#3c4043',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title={isEs ? 'Copiar especificación en Markdown al portapapeles' : 'Copy Markdown specification to clipboard'}
                  >
                    {copiedMd ? <Check size={12} color="#137333" /> : <Copy size={12} />}
                    <span>{copiedMd ? (isEs ? 'Copiado ✓' : 'Copied ✓') : (isEs ? 'Copiar .md' : 'Copy .md')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadMarkdown}
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
              <div style={{ padding: '12px', background: '#fafbfc', maxHeight: '280px', overflowY: 'auto' }}>
                {editorTab === 'fields' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', marginBottom: '3px' }}>
                        {isEs ? 'Nombre Paciente' : 'Patient Name'}
                      </label>
                      <input
                        type="text"
                        value={currentItem.patientName || currentItem.patient?.name || ''}
                        onChange={(e) => handleFieldChange('patientName', e.target.value)}
                        style={{ width: '100%', height: 28, fontSize: '0.78rem', padding: '0 8px', border: '1px solid #dadce0', borderRadius: '4px', boxSizing: 'border-box', fontWeight: 600 }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', marginBottom: '3px' }}>
                        {isEs ? 'Título Producto / Fórmula' : 'Product Title / Formula'}
                      </label>
                      <input
                        type="text"
                        value={currentItem.productTitle || currentItem.productName || ''}
                        onChange={(e) => handleFieldChange('productTitle', e.target.value)}
                        style={{ width: '100%', height: 28, fontSize: '0.78rem', padding: '0 8px', border: '1px solid #dadce0', borderRadius: '4px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', marginBottom: '3px' }}>
                        {isEs ? 'Cantidad Neta (Net Quantity)' : 'Net Quantity'}
                      </label>
                      <input
                        type="text"
                        value={currentItem.volume || currentItem.size || currentItem.netContent || ''}
                        onChange={(e) => handleFieldChange('volume', e.target.value)}
                        style={{ width: '100%', height: 28, fontSize: '0.78rem', padding: '0 8px', border: '1px solid #dadce0', borderRadius: '4px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', marginBottom: '3px' }}>
                        {isEs ? 'Lote (Dispensing Batch)' : 'Dispensing Batch'}
                      </label>
                      <input
                        type="text"
                        value={currentItem.batchCode || currentItem.lote || currentItem.fileNumber || ''}
                        onChange={(e) => handleFieldChange('batchCode', e.target.value)}
                        style={{ width: '100%', height: 28, fontSize: '0.78rem', padding: '0 8px', border: '1px solid #dadce0', borderRadius: '4px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', marginBottom: '3px' }}>
                        {isEs ? 'Principios Activos y Concentración (uno por línea)' : 'Active Ingredients & Strength (one per line)'}
                      </label>
                      <textarea
                        rows={3}
                        value={formatApisForEditor(currentItem)}
                        onChange={(e) => handleApisFieldChange(e.target.value)}
                        style={{ width: '100%', fontSize: '0.78rem', padding: '6px 8px', border: '1px solid #dadce0', borderRadius: '4px', boxSizing: 'border-box', fontFamily: 'monospace' }}
                        placeholder="Minoxidil: 4%&#10;Spironolactone: 1%&#10;Arginine: 1.5%"
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', marginBottom: '3px' }}>
                        {isEs ? 'Vehículo de Formulación (Compounding Vehicle)' : 'Compounding Vehicle'}
                      </label>
                      <input
                        type="text"
                        value={typeof currentItem.vehicle === 'string' ? currentItem.vehicle : (currentItem.vehicle?.name || '')}
                        onChange={(e) => handleFieldChange('vehicle', e.target.value)}
                        style={{ width: '100%', height: 28, fontSize: '0.78rem', padding: '0 8px', border: '1px solid #dadce0', borderRadius: '4px', boxSizing: 'border-box' }}
                        placeholder="TrichoSol™ (Alcohol-Free Hydrophilic Compounding Vehicle, 100 mL)"
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', marginBottom: '3px' }}>
                        {isEs ? 'Posología / Modo de Empleo (Directions for Use)' : 'Directions for Use'}
                      </label>
                      <input
                        type="text"
                        value={currentItem.directions || currentItem.instructions || ''}
                        onChange={(e) => handleFieldChange('directions', e.target.value)}
                        style={{ width: '100%', height: 28, fontSize: '0.78rem', padding: '0 8px', border: '1px solid #dadce0', borderRadius: '4px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', marginBottom: '3px' }}>
                        {isEs ? 'Médico Prescriptor' : 'Prescribing Doctor'}
                      </label>
                      <input
                        type="text"
                        value={currentItem.doctorName || currentItem.physician || ''}
                        onChange={(e) => handleFieldChange('doctorName', e.target.value)}
                        style={{ width: '100%', height: 28, fontSize: '0.78rem', padding: '0 8px', border: '1px solid #dadce0', borderRadius: '4px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', marginBottom: '3px' }}>
                        {isEs ? 'Clínica' : 'Clinic'}
                      </label>
                      <input
                        type="text"
                        value={currentItem.clinicName || ''}
                        onChange={(e) => handleFieldChange('clinicName', e.target.value)}
                        style={{ width: '100%', height: 28, fontSize: '0.78rem', padding: '0 8px', border: '1px solid #dadce0', borderRadius: '4px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', marginBottom: '3px' }}>
                        {isEs ? 'Fecha Fabricación (Mfg)' : 'Mfg Date'}
                      </label>
                      <input
                        type="text"
                        value={currentItem.prodDate || currentItem.mfgDate || ''}
                        onChange={(e) => handleFieldChange('prodDate', e.target.value)}
                        style={{ width: '100%', height: 28, fontSize: '0.78rem', padding: '0 8px', border: '1px solid #dadce0', borderRadius: '4px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', marginBottom: '3px' }}>
                        {isEs ? 'Fecha Caducidad (Exp)' : 'Expiry Date'}
                      </label>
                      <input
                        type="text"
                        value={currentItem.expDate || ''}
                        onChange={(e) => handleFieldChange('expDate', e.target.value)}
                        style={{ width: '100%', height: 28, fontSize: '0.78rem', padding: '0 8px', border: '1px solid #dadce0', borderRadius: '4px', boxSizing: 'border-box' }}
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
          {/* Desktop Single-Line Specs & Direct Patient Link (No Redundant Titles) */}
          <div className="gcp-footer-desktop-specs" style={{ minWidth: 0, flex: '1 1 auto', overflow: 'hidden' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.78rem',
              color: '#5f6368',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              <span style={{ fontWeight: 600, color: '#202124' }}>
                {currentItem.dosageForm || 'Topical Scalp Solution'}
              </span>
              <span style={{ color: '#dadce0' }}>•</span>
              <span>{currentItem.volume || '100 mL'}</span>
              {currentItem.targetRxUrl && (
                <>
                  <span style={{ color: '#dadce0' }}>•</span>
                  <a
                    href={currentItem.targetRxUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#1a73e8',
                      textDecoration: 'none',
                      fontWeight: 500,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                  >
                    <span>{isEs ? 'Ver Portal Paciente' : 'Patient View'}</span>
                    <ExternalLink size={12} />
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Mobile Top Micro-Specs Strip (Visible Only on Mobile) */}
          <div className="gcp-footer-mobile-specs">
            <div style={{ fontWeight: 600, color: '#202124', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentItem.dosageForm || 'Topical Solution'}
            </div>
            <div style={{ color: '#5f6368', whiteSpace: 'nowrap', fontSize: '0.72rem' }}>
              {currentItem.volume || '100 mL'}
            </div>
          </div>

          {/* Action Buttons Group (Google Cloud UX Hierarchy) */}
          <div className="gcp-footer-actions-wrap">
            {/* Primary Action: Download based on selected format */}
            {exportFormat === 'pdf' ? (
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
                <Download size={16} />
                <span>
                  {isGeneratingPdf 
                    ? (isEs ? 'Generando PDF...' : 'Creating PDF...') 
                    : (isEs ? `Descargar PDF (${dimensions.widthMm}×${dimensions.heightMm}mm)` : `Download PDF (${dimensions.widthMm}×${dimensions.heightMm}mm)`)}
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
                <Download size={16} />
                <span>
                  {isGeneratingPng 
                    ? (isEs ? `Generando ${dpi} DPI...` : `Rendering ${dpi} DPI...`) 
                    : (isEs ? `Descargar PNG (${dpi} DPI)` : `Download PNG (${dpi} DPI)`)}
                </span>
              </button>
            )}

            {/* Quick Alternate Format Action Button */}
            {exportFormat === 'pdf' ? (
              <button
                type="button"
                className="gcp-btn-secondary"
                onClick={handleDownloadPng}
                disabled={isGeneratingPng}
                title={isEs ? 'Descargar como imagen PNG' : 'Download as PNG image'}
              >
                <Download size={14} />
                <span>{isGeneratingPng ? 'PNG...' : 'PNG'}</span>
              </button>
            ) : (
              <button
                type="button"
                className="gcp-btn-secondary"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                title={isEs ? 'Descargar como PDF editable 1:1' : 'Download as editable 1:1 PDF'}
              >
                <Download size={14} />
                <span>{isGeneratingPdf ? 'PDF...' : 'PDF'}</span>
              </button>
            )}

            {/* Secondary Symmetrical Actions */}
            <div
              className="gcp-footer-secondary-grid"
              style={{
                gridTemplateColumns: currentItem.targetRxUrl ? '1fr 1fr' : '1fr'
              }}
            >
              <button
                type="button"
                className="gcp-btn-secondary"
                onClick={handlePrint}
              >
                <Printer size={15} />
                <span>{isEs ? 'Imprimir' : 'Print Label'}</span>
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
                  <span>{copiedLink ? (isEs ? 'Copiado ✓' : 'Copied ✓') : (isEs ? 'Copiar Enlace' : 'Copy QR Link')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
