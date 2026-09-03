"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  UploadCloud, CheckCircle2, RefreshCw, XCircle, AlertTriangle, 
  ArrowRight, BookOpen, Building2, Tag, SlidersHorizontal, Sparkles, 
  FileText, Trash2, Check, FileCheck, Layers, Bot, Info, ShieldCheck, X,
  DollarSign, Package, Percent, PlusCircle, Link2, Eye, Loader2, Truck, CreditCard
} from 'lucide-react';
import { storage, ref, uploadBytes, getDownloadURL } from '../../firebase';
import DataTable from '../ui/DataTable';
import StandardDrawer from '../ui/StandardDrawer';
import SearchableSelect from '../ui/SearchableSelect';
import TextField from '../ui/TextField';
import StatusBadge from '../ui/StatusBadge';
import { useSupplierData } from './suppliers/useSupplierData';
import { getCatalog } from '../../repositories/productRepository';
import notifier from '../../services/NotificationService';
import { formatCurrencyAdaptive, formatNumberAdaptive } from '../../utils/formatters';
import { normalizeSupplierId, getCanonicalSupplierName } from '../../data/productConstants';

const SCAN_PHASES = [
  "📷 Leyendo píxeles y estructura óptica del documento...",
  "🧪 Extrayendo nombres químicos, purezas y cantidades en gramos...",
  "⚖️ Detectando unidades de medida (g/kg/mg) y tamaños de lote...",
  "💰 Calculando precios unitarios, totales y descuento comercial (-25%)...",
  "🔗 Contrastando ítems con el catálogo maestro de Firestore..."
];

const SUPPLIER_DEFAULTS = {
  'supplier-lotusland': {
    paymentTerms: '50% Advance / 50% on B/L',
    incoterm: 'DAP',
    currency: 'USD',
    discount: 25,
    shippingCost: 150
  },
  'supplier-glp-direct': {
    paymentTerms: '100% T/T Advance',
    incoterm: 'FOB',
    currency: 'USD',
    discount: 20,
    shippingCost: 120
  },
  'supplier-peptidelabs': {
    paymentTerms: 'Net 30 Days',
    incoterm: 'DDP',
    currency: 'USD',
    discount: 15,
    shippingCost: 80
  }
};

/**
 * ScanPriceListWidget
 * ─────────────────────────────────────────────────────────────────────────────
 * Institutional AI OCR widget for scanning, extracting, and matching supplier
 * price lists against the product catalog with full live status tracking,
 * quantity & commercial discount support, supplier quotation creation,
 * original document storage, and auto-redirection.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export default function ScanPriceListWidget({ 
  onClose, 
  onScanComplete, 
  isEmbedded = false, 
  initialData = null, 
  zIndex = 10050,
  onApplied, 
  initialSupplierId = 'supplier-lotusland'
}) {
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadedFileMetadata, setUploadedFileMetadata] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanPhaseIndex, setScanPhaseIndex] = useState(0);
  const [scanResult, setScanResult] = useState(null);
  const [scanMeta, setScanMeta] = useState(null);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [rawOcrResponse, setRawOcrResponse] = useState(null);

  // Supplier & Mapping States
  const { suppliers } = useSupplierData();
  const [targetSupplierId, setTargetSupplierId] = useState(initialData?.supplierId || initialSupplierId);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [targetCategory, setTargetCategory] = useState(initialData?.category || 'Recovery & Repair');
  const [agreementDiscount, setAgreementDiscount] = useState(25);
  const [quotationDate, setQuotationDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentTerms, setPaymentTerms] = useState(SUPPLIER_DEFAULTS[initialSupplierId]?.paymentTerms || '50% Advance / 50% on B/L');
  const [shippingCost, setShippingCost] = useState(SUPPLIER_DEFAULTS[initialSupplierId]?.shippingCost || 150);
  const [incoterm, setIncoterm] = useState(SUPPLIER_DEFAULTS[initialSupplierId]?.incoterm || 'DAP');
  const [quotationStatus, setQuotationStatus] = useState('approved');

  // Application / Commit States
  const [isApplying, setIsApplying] = useState(false);
  const [applyProgressPercent, setApplyProgressPercent] = useState(0);
  const [applyStatusText, setApplyStatusText] = useState('');
  const [showAppliedDrawer, setShowAppliedDrawer] = useState(false);
  const [appliedResults, setAppliedResults] = useState(null);

  // Catalog Reference Data for interactive matching
  const [categoriesList, setCategoriesList] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);

  const handleSupplierChange = useCallback((supId) => {
    setTargetSupplierId(supId);
    const defaults = SUPPLIER_DEFAULTS[supId];
    if (defaults) {
      if (defaults.paymentTerms) setPaymentTerms(defaults.paymentTerms);
      if (defaults.incoterm) setIncoterm(defaults.incoterm);
      if (defaults.discount != null) setAgreementDiscount(defaults.discount);
      if (defaults.shippingCost != null) setShippingCost(defaults.shippingCost);
    }
  }, []);

  // Phase animation during scan
  useEffect(() => {
    let interval = null;
    if (isScanning) {
      setScanPhaseIndex(0);
      interval = setInterval(() => {
        setScanPhaseIndex(prev => (prev + 1) % SCAN_PHASES.length);
      }, 1500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isScanning]);


  // Fetch catalog categories & products for interactive matching
  useEffect(() => {
    async function fetchCatalogData() {
      try {
        const productsList = await getCatalog();
        const cats = new Set();
        const prods = [];
        (productsList || []).forEach(d => {
          if (d.category) cats.add(d.category);
          const currentCost = d.supplierPricing?.netCost || d.supplierCost || d.unit_price || (d.variants?.[0]?.unit_price) || 0;
          const currentListPrice = d.supplierPricing?.listPrice || d.price || 0;
          prods.push({
            id: d.id,
            name: d.canonicalName || d.name || d.displayName || d.id,
            category: d.category || '',
            currentCost: Number(currentCost) || 0,
            currentListPrice: Number(currentListPrice) || 0,
            supplierName: d.supplierPricing?.supplierName || d.supplier || ''
          });
        });
        setCategoriesList(Array.from(cats).sort());
        setAvailableProducts(prods);
      } catch (err) {
        console.error("Error fetching catalog for price scan:", err);
      }
    }
    fetchCatalogData();
  }, []);

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles?.length > 0) {
      const selected = acceptedFiles[0];
      setFile(selected);
      setError(null);
      setScanResult(null);
      setScanMeta(null);
      setUploadedFileMetadata(null);

      // Generate local thumbnail preview
      if (selected.type.startsWith('image/')) {
        const url = URL.createObjectURL(selected);
        setFilePreview(url);
      } else {
        setFilePreview(null);
      }
    }
  }, []);

  const handleRemoveFile = (e) => {
    if (e) e.stopPropagation();
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFile(null);
    setFilePreview(null);
    setScanResult(null);
    setScanMeta(null);
    setUploadedFileMetadata(null);
    setError(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1 
  });

  const handleScan = async () => {
    if (!file) {
      notifier.info("Please attach a price list image to start scanning.");
      return;
    }

    setIsScanning(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result;
        try {
          const res = await fetch('/api/catalog/scan-price-list', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64Data,
              mimeType: file.type || 'image/jpeg',
              targetCategory: targetCategory || null,
              targetSupplierId: targetSupplierId === 'new' ? null : (targetSupplierId || null)
            })
          });

          const data = await res.json();

          if (data.success && Array.isArray(data.items) && data.items.length > 0) {
            setScanResult(data.items);
            setScanMeta({
              currency: data.currency || 'USD',
              grossSubtotal: data.gross_subtotal,
              discountPercentage: data.global_discount_percentage,
              discountedTotal: data.discounted_total,
              supplierNameDetected: data.supplier_name_detected
            });

            if (data.global_discount_percentage != null) {
              setAgreementDiscount(data.global_discount_percentage);
            }
            if (data.supplier_name_detected) {
              const matchedSup = suppliers.find(s => 
                (s.name || '').toLowerCase().includes(data.supplier_name_detected.toLowerCase())
              );
              if (matchedSup) setTargetSupplierId(matchedSup.id);
            }

            notifier.success(`AI extracted ${data.items.length} line items with quantities and pricing`);
          } else if (data.success && Array.isArray(data.items) && data.items.length === 0) {
            throw new Error("No price list items detected in image. Ensure the image has clear text and numerical prices.");
          } else {
            throw new Error(data.error || data.message || "Failed to parse price list from image");
          }
        } catch (err) {
          console.error("Scanning failed:", err);
          setError(err.message || "An error occurred while scanning the image.");
          notifier.error("AI scanning failed: " + (err.message || "Unknown error"));
        } finally {
          setIsScanning(false);
        }
      };
      reader.onerror = () => {
        setIsScanning(false);
        setError("Failed to read the file.");
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setIsScanning(false);
      setError("An unexpected error occurred.");
    }
  };

  // Row field update helper
  const handleUpdateItem = (idx, field, val) => {
    setScanResult(prev => {
      const updated = [...prev];
      const item = { ...updated[idx], [field]: val };
      if (field === 'quantity' || field === 'unit_price') {
        const q = parseFloat(field === 'quantity' ? val : item.quantity) || 0;
        const p = parseFloat(field === 'unit_price' ? val : item.unit_price) || 0;
        item.total_price = Number((q * p).toFixed(2));
        item.new_cost = p;
      }
      updated[idx] = item;
      return updated;
    });
  };

  // Quick Action: Set all items to create / update
  const handleSetAllActions = (actionType) => {
    setScanResult(prev => (prev || []).map(it => ({
      ...it,
      action: actionType,
      requires_creation: actionType === 'create'
    })));
  };

  // Calculate live computed totals
  const computedGrossSubtotal = useMemo(() => {
    if (!scanResult) return 0;
    return scanResult
      .filter(it => it.action !== 'ignore')
      .reduce((acc, it) => acc + (Number(it.total_price) || (Number(it.quantity || 1) * Number(it.unit_price || 0))), 0);
  }, [scanResult]);

  const computedDiscountAmount = useMemo(() => {
    const disc = parseFloat(agreementDiscount) || 0;
    return (computedGrossSubtotal * disc) / 100;
  }, [computedGrossSubtotal, agreementDiscount]);

  const computedNetTotal = useMemo(() => {
    return computedGrossSubtotal - computedDiscountAmount;
  }, [computedGrossSubtotal, computedDiscountAmount]);

  const computedPayableTotal = useMemo(() => {
    const ship = parseFloat(shippingCost) || 0;
    return computedNetTotal + ship;
  }, [computedNetTotal, shippingCost]);

  const handleApply = async () => {
    if (!scanResult || scanResult.length === 0) return;
    setIsApplying(true);
    setError(null);
    setApplyProgressPercent(15);
    setApplyStatusText("Validando acuerdo comercial y subiendo documento probatorio...");

    try {
      // Step 1: Upload source quotation file to Firebase Storage if available
      let sourceFile = uploadedFileMetadata;
      if (file && !sourceFile && storage) {
        try {
          setApplyProgressPercent(30);
          setApplyStatusText(`Subiendo archivo probatorio "${file.name}" a Firebase Storage...`);
          const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const fileRef = ref(storage, `supplier_quotations/${Date.now()}_${cleanFileName}`);
          const snap = await uploadBytes(fileRef, file, {
            contentType: file.type || 'image/jpeg'
          });
          const downloadUrl = await getDownloadURL(snap.ref);
          sourceFile = {
            fileName: file.name,
            fileUrl: downloadUrl,
            fileSize: file.size,
            mimeType: file.type || 'image/jpeg'
          };
          setUploadedFileMetadata(sourceFile);
        } catch (storageErr) {
          console.warn("Storage upload warning (continuing with database record):", storageErr);
        }
      }

      setApplyProgressPercent(60);
      setApplyStatusText("Guardando productos, variantes y creando la Cotización en Firestore...");

      const res = await fetch('/api/catalog/apply-price-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: scanResult,
          targetSupplierId,
          newSupplierName,
          targetCategory,
          agreementDiscount,
          quotationDate,
          sourceFile,
          paymentTerms,
          shippingCost,
          incoterm,
          quotationStatus
        })
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Error al aplicar los precios en la base de datos.");
      }

      setApplyProgressPercent(90);
      setApplyStatusText("Sincronizando índices y preparando vista de verificación...");

      const recentImportPayload = {
        ids: data.affectedProductIds || [],
        supplierId: data.finalSupplierId || targetSupplierId,
        supplierName: data.finalSupplierName || 'Lotusland',
        quotationId: data.quotationId,
        quotationNumber: data.quotationNumber,
        quotationDocUrl: data.quotationDocUrl,
        timestamp: Date.now(),
        count: (data.affectedProductIds || []).length
      };

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('regenpept_recent_imported', JSON.stringify(recentImportPayload));
        } catch (e) {
          console.warn('Failed to save recent import to localStorage', e);
        }
        window.dispatchEvent(new CustomEvent('catalog-recent-import', { detail: recentImportPayload }));
      }

      setApplyProgressPercent(100);
      setApplyStatusText("¡Cotización e importación completadas con éxito!");
      notifier.success(`Quotation ${data.quotationNumber || ''} registered: ${data.createdCount || 0} created, ${data.updatedCount || 0} updated!`);
      
      if (onScanComplete) {
        onScanComplete(recentImportPayload);
      }
      
      if (onClose) onClose();

      if (typeof window !== 'undefined') {
        setTimeout(() => {
          const url = new URL(window.location.href);
          url.pathname = '/admin/catalog';
          url.searchParams.set('timeframe', 'today');
          url.searchParams.set('status', 'active');
          if (data.finalSupplierId) {
            url.searchParams.set('supplier', data.finalSupplierId);
          }
          window.location.href = url.toString();
        }, 300);
      }
    } catch (err) {
      console.error("Failed to apply prices:", err);
      setError("Failed to save some prices: " + (err.message || err));
      notifier.error("Failed to apply prices: " + (err.message || err));
    } finally {
      setIsApplying(false);
    }
  };

  // Supplier options
  const supplierOptions = useMemo(() => {
    const opts = [
      { label: 'Lotusland (Recommended)', value: 'supplier-lotusland', subLabel: 'Canonical Supplier' }
    ];
    (suppliers || [])
      .filter(s => s && s.id && s.id !== 'supplier-lotusland' && (s.name || s.companyName))
      .forEach(s => {
        opts.push({
          label: s.name || s.companyName,
          value: s.id,
          subLabel: s.type || 'Supplier'
        });
      });
    opts.push({
      label: '+ Create New Supplier...',
      value: 'new'
    });
    return opts;
  }, [suppliers]);

  // Category options
  const categoryOptions = useMemo(() => {
    const opts = [
      { label: 'Recovery & Repair (Default)', value: 'Recovery & Repair' }
    ];
    categoriesList.filter(c => c !== 'Recovery & Repair').forEach(c => {
      opts.push({ label: c.charAt(0).toUpperCase() + c.slice(1), value: c });
    });
    return opts;
  }, [categoriesList]);

  // Product match options
  const productMatchOptions = useMemo(() => {
    return availableProducts.map(p => ({
      label: p.name,
      value: p.id,
      subLabel: p.category
    }));
  }, [availableProducts]);

  const content = (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: isEmbedded ? '0' : '0.25rem 0' }}>
      
      {/* ── TOP MOVING PROGRESS LINE ────────────────────────────────────────── */}
      {(isScanning || isApplying) && (
        <div style={{
          position: 'absolute',
          top: isEmbedded ? '-0.5rem' : '-1.5rem',
          left: isEmbedded ? 0 : '-1.5rem',
          right: isEmbedded ? 0 : '-1.5rem',
          height: '4px',
          zIndex: 99,
          overflow: 'hidden',
          backgroundColor: 'rgba(2, 132, 199, 0.15)',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px'
        }}>
          <div style={{
            width: '45%',
            height: '100%',
            background: 'linear-gradient(90deg, #0284c7, #38bdf8, #10b981)',
            borderRadius: '4px',
            animation: 'scanProgressSweep 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite'
          }} />
        </div>
      )}

      {/* Global CSS animation for smooth sweep */}
      <style jsx global>{`
        @keyframes scanProgressSweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}</style>

      {/* ── 1. Initial Upload & Configuration View ─────────────────────── */}
      {!scanResult && !isScanning && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Top Settings Panel */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <SlidersHorizontal size={16} style={{ color: '#003666' }} />
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                  Procurement & Import Settings
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                Automatic multi-tier volume pricing extraction
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
              alignItems: 'start'
            }}>
              <SearchableSelect
                label="Target Supplier"
                value={targetSupplierId}
                onChange={handleSupplierChange}
                options={supplierOptions}
                placeholder="Select supplier..."
              />

              <SearchableSelect
                label="Target Category"
                value={targetCategory}
                onChange={(val) => setTargetCategory(val)}
                options={categoryOptions}
                placeholder="Category for new items..."
              />
            </div>
          </div>

          {/* Drag and Drop Zone / File Preview */}
          {!file ? (
            <div 
              {...getRootProps()} 
              style={{
                width: '100%',
                padding: '3rem 2rem',
                border: isDragActive ? '2px dashed #0284c7' : '2px dashed #cbd5e1',
                borderRadius: '14px',
                backgroundColor: isDragActive ? '#f0f9ff' : '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'center'
              }}
            >
              <input {...getInputProps()} />
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
              }}>
                <UploadCloud size={30} style={{ color: '#0284c7' }} />
              </div>
              <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                Drag and drop your quotation or price list image here
              </p>
              <span style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: '#64748b' }}>
                Extracts Peptide Name, Quantity (g), Unit Price/g, Line Totals, and -25% Commercial Discount
              </span>
            </div>
          ) : (
            <div style={{
              width: '100%',
              padding: '1.25rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {filePreview ? (
                  <img 
                    src={filePreview} 
                    alt="Price List Preview" 
                    style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }} 
                  />
                ) : (
                  <div style={{ width: '64px', height: '64px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={24} style={{ color: '#64748b' }} />
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{file.name}</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{formatFileSize(file.size)}</span>
                </div>
              </div>
              <button 
                onClick={handleRemoveFile} 
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 600 }}
              >
                <Trash2 size={15} /> Remove
              </button>
            </div>
          )}

          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '0.875rem 1rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem'
            }}>
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '0.5rem' }}>
            <button 
              onClick={handleScan}
              disabled={!file}
              className="gcp-btn-primary" 
              style={{ 
                width: '100%', 
                maxWidth: '340px', 
                padding: '0.75rem 1.5rem', 
                fontSize: '0.95rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                backgroundColor: !file ? '#94a3b8' : '#003666',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: !file ? 'not-allowed' : 'pointer',
                boxShadow: !file ? 'none' : '0 4px 14px rgba(0,54,102,0.25)'
              }}
            >
              <Sparkles size={17} /> Scan & Extract with AI <ArrowRight size={17} />
            </button>
          </div>
        </div>
      )}

      {/* ── 2. Scanning / Analyzing Loading State with Dynamic Status ─────── */}
      {isScanning && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4rem 2rem',
          backgroundColor: '#ffffff',
          border: '1px solid #bae6fd',
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: '0 4px 14px rgba(2,132,199,0.06)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#f0f9ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem',
            border: '2px solid #38bdf8',
            boxShadow: '0 0 16px rgba(56,189,248,0.25)'
          }}>
            <RefreshCw size={28} className="animate-spin" style={{ color: '#0284c7' }} />
          </div>

          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
            Vision AI Processing Quotation...
          </h3>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '20px'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#0284c7',
              boxShadow: '0 0 0 3px rgba(2,132,199,0.2)'
            }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0369a1' }}>
              Paso {scanPhaseIndex + 1} de {SCAN_PHASES.length}: {SCAN_PHASES[scanPhaseIndex]}
            </span>
          </div>

          <p style={{ marginTop: '0.75rem', color: '#64748b', fontSize: '0.82rem', maxWidth: '460px' }}>
            Extrayendo automáticamente cantidades en gramos, costes por unidad, purezas químicas y subtotales.
          </p>
        </div>
      )}

      {/* ── 3. Applying / Database Writes Active Status Overlay ───────────── */}
      {isApplying && (
        <div style={{
          padding: '2.5rem 1.5rem',
          backgroundColor: '#ffffff',
          border: '1px solid #86efac',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(16,185,129,0.1)'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#ecfdf5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            border: '2px solid #10b981'
          }}>
            <Loader2 size={30} className="animate-spin" style={{ color: '#059669' }} />
          </div>

          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#065f46' }}>
            Guardando Cotización y Registrando Documento Probatorio...
          </h3>

          <div style={{ width: '100%', maxWidth: '420px', marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, color: '#047857' }}>
              <span>Progreso de Importación</span>
              <span>{applyProgressPercent}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                width: `${applyProgressPercent}%`,
                height: '100%',
                backgroundColor: '#10b981',
                borderRadius: '4px',
                transition: 'width 0.2s ease-out'
              }} />
            </div>
          </div>

          <span style={{
            marginTop: '1rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#0f172a',
            padding: '4px 12px',
            backgroundColor: '#f1f5f9',
            borderRadius: '6px'
          }}>
            {applyStatusText || "Escribiendo variantes e historial de precios..."}
          </span>
        </div>
      )}

      {/* ── 4. Results Review & Interactive Table ────────────────────────── */}
      {scanResult && !isScanning && !isApplying && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Top Commercial Summary Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.75rem',
            padding: '1rem',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Quoted Gross Subtotal
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                ${formatNumberAdaptive(computedGrossSubtotal, 2)}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                {scanResult.filter(i => i.action !== 'ignore').length} Line Items
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase' }}>
                Commercial Discount
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <input
                  type="number"
                  value={agreementDiscount}
                  onChange={(e) => setAgreementDiscount(e.target.value)}
                  style={{
                    width: '60px',
                    padding: '2px 6px',
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: '#0369a1',
                    border: '1px solid #bae6fd',
                    borderRadius: '6px',
                    backgroundColor: '#f0f9ff'
                  }}
                />
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0369a1' }}>%</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#0369a1' }}>
                -${formatNumberAdaptive(computedDiscountAmount, 2)} savings
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
                Total Payable
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669' }}>
                ${formatNumberAdaptive(computedPayableTotal, 2)}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>
                Incl. ${formatNumberAdaptive(shippingCost, 2)} shipping to {getCanonicalSupplierName(targetSupplierId)}
              </span>
            </div>
          </div>

          {/* Quick Bulk Action Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
              Line Items & Target Action ({scanResult.length})
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleSetAllActions('create')}
                style={{
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#0284c7',
                  backgroundColor: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                ✨ Set All to "Create New Product"
              </button>
              <button
                type="button"
                onClick={() => handleSetAllActions('update')}
                style={{
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#059669',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                🔗 Set All to "Update Matched"
              </button>
            </div>
          </div>

          {/* Scanned Items Table */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
            <DataTable
              data={scanResult.map((it, idx) => ({ ...it, _idx: idx }))}
              keyField="_idx"
              minHeight="auto"
              hidePagination={true}
              columns={[
                {
                  key: 'peptide_name',
                  header: 'Peptide / Raw Material',
                  width: '28%',
                  render: (r) => (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <input
                        type="text"
                        value={r.peptide_name || ''}
                        onChange={(e) => handleUpdateItem(r._idx, 'peptide_name', e.target.value)}
                        style={{
                          fontWeight: 700,
                          color: '#0f172a',
                          fontSize: '0.85rem',
                          border: '1px solid transparent',
                          borderRadius: '4px',
                          padding: '2px 4px',
                          backgroundColor: 'transparent'
                        }}
                        onFocus={(e) => { e.target.style.borderColor = '#94a3b8'; e.target.style.backgroundColor = '#fff'; }}
                        onBlur={(e) => { e.target.style.borderColor = 'transparent'; e.target.style.backgroundColor = 'transparent'; }}
                      />
                      <span style={{ fontSize: '0.72rem', color: '#64748b', paddingLeft: '4px' }}>
                        Grade: {r.purity_or_grade || 'USP / API'}
                      </span>
                    </div>
                  )
                },
                {
                  key: 'quantity',
                  header: 'Quantity',
                  width: '18%',
                  render: (r) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input
                        type="number"
                        value={r.quantity || ''}
                        onChange={(e) => handleUpdateItem(r._idx, 'quantity', e.target.value)}
                        style={{
                          width: '75px',
                          padding: '3px 6px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: '#0f172a',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px'
                        }}
                      />
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b' }}>
                        {r.unit_of_measure || 'g'}
                      </span>
                    </div>
                  )
                },
                {
                  key: 'unit_price',
                  header: 'Price / Unit & Drift (Δ)',
                  width: '22%',
                  render: (r) => {
                    const matched = availableProducts.find(p => p.id === r.productId);
                    const previousCost = matched?.currentCost || r.previous_cost || null;
                    const newCost = Number(r.unit_price || r.new_cost || 0);
                    const hasPrevious = previousCost && previousCost > 0;
                    const deltaPercent = hasPrevious ? ((newCost - previousCost) / previousCost) * 100 : null;

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={r.unit_price || ''}
                            onChange={(e) => handleUpdateItem(r._idx, 'unit_price', e.target.value)}
                            style={{
                              width: '75px',
                              padding: '3px 6px',
                              fontSize: '0.85rem',
                              fontWeight: 700,
                              color: '#059669',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px'
                            }}
                          />
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>/{r.unit_of_measure || 'g'}</span>
                        </div>

                        {/* Price Drift Delta Badge */}
                        {hasPrevious && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {deltaPercent < 0 ? (
                              <span style={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                color: '#15803d',
                                backgroundColor: '#dcfce7',
                                border: '1px solid #bbf7d0',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '2px'
                              }} title={`Previous cost: $${previousCost}/${r.unit_of_measure || 'g'}`}>
                                ↓ {deltaPercent.toFixed(1)}% (Prev: ${previousCost})
                              </span>
                            ) : deltaPercent > 0 ? (
                              <span style={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                color: '#b91c1c',
                                backgroundColor: '#fee2e2',
                                border: '1px solid #fecaca',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '2px'
                              }} title={`Previous cost: $${previousCost}/${r.unit_of_measure || 'g'}`}>
                                ↑ +{deltaPercent.toFixed(1)}% (Prev: ${previousCost})
                              </span>
                            ) : (
                              <span style={{
                                fontSize: '0.68rem',
                                fontWeight: 600,
                                color: '#64748b',
                                backgroundColor: '#f1f5f9',
                                padding: '1px 5px',
                                borderRadius: '4px'
                              }}>
                                = No drift (${previousCost})
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }
                },
                {
                  key: 'total_price',
                  header: 'Line Total',
                  width: '16%',
                  align: 'right',
                  render: (r) => (
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                      ${formatNumberAdaptive(r.total_price || (r.quantity * r.unit_price) || 0, 2)}
                    </span>
                  )
                },
                {
                  key: 'action',
                  header: 'Catalog Action',
                  width: '20%',
                  render: (r) => (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <select
                        value={r.action || 'create'}
                        onChange={(e) => handleUpdateItem(r._idx, 'action', e.target.value)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          borderRadius: '6px',
                          border: r.action === 'create' ? '1px solid #93c5fd' : (r.action === 'update' ? '1px solid #86efac' : '1px solid #cbd5e1'),
                          backgroundColor: r.action === 'create' ? '#eff6ff' : (r.action === 'update' ? '#f0fdf4' : '#f8fafc'),
                          color: r.action === 'create' ? '#1d4ed8' : (r.action === 'update' ? '#15803d' : '#64748b'),
                          cursor: 'pointer'
                        }}
                      >
                        <option value="create">✨ Create New Product</option>
                        <option value="update">🔗 Update Catalog</option>
                        <option value="ignore">✕ Ignore</option>
                      </select>

                      {r.action === 'update' && (
                        <select
                          value={r.productId || ''}
                          onChange={(e) => {
                            const pId = e.target.value;
                            const matched = availableProducts.find(p => p.id === pId);
                            handleUpdateItem(r._idx, 'productId', pId);
                            handleUpdateItem(r._idx, 'matchedProductName', matched?.name || '');
                          }}
                          style={{
                            padding: '3px 6px',
                            fontSize: '0.72rem',
                            borderRadius: '4px',
                            border: '1px solid #cbd5e1',
                            color: '#0f172a'
                          }}
                        >
                          <option value="">-- Choose matching product --</option>
                          {availableProducts.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  )
                }
              ]}
            />
          </div>

          {/* Supplier Quotation Terms & Agreement Box */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={16} style={{ color: '#003666' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                  Supplier Quotation Terms & Procurement Contract
                </span>
              </div>
              <span style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <FileCheck size={14} /> Creates formal record in 'supplier_quotations'
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.875rem',
              alignItems: 'start'
            }}>
              <SearchableSelect
                label="Assigned Supplier"
                value={targetSupplierId}
                onChange={handleSupplierChange}
                options={supplierOptions}
              />

              <TextField
                label="Quotation Date"
                type="date"
                value={quotationDate}
                onChange={(e) => setQuotationDate(e.target.value)}
              />

              <SearchableSelect
                label="Category for New Items"
                value={targetCategory}
                onChange={(val) => setTargetCategory(val)}
                options={categoryOptions}
              />
            </div>

            {/* Commercial Terms Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.875rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid #f1f5f9',
              alignItems: 'start'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                  Payment Terms
                </label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  style={{
                    padding: '0.45rem 0.65rem',
                    fontSize: '0.82rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <option value="50% Advance / 50% on B/L">50% Advance / 50% on B/L</option>
                  <option value="100% T/T Advance">100% T/T Advance</option>
                  <option value="Net 30 Days">Net 30 Days</option>
                  <option value="Crypto (USDT/USDC)">Crypto (USDT / USDC)</option>
                  <option value="Letter of Credit (L/C)">Letter of Credit (L/C)</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                  Shipping & Freight ($)
                </label>
                <input
                  type="number"
                  step="1"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(e.target.value)}
                  placeholder="0.00"
                  style={{
                    padding: '0.45rem 0.65rem',
                    fontSize: '0.82rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                  Incoterm
                </label>
                <select
                  value={incoterm}
                  onChange={(e) => setIncoterm(e.target.value)}
                  style={{
                    padding: '0.45rem 0.65rem',
                    fontSize: '0.82rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <option value="DAP">DAP (Delivered at Place)</option>
                  <option value="FOB">FOB (Free on Board)</option>
                  <option value="CIF">CIF (Cost, Insurance & Freight)</option>
                  <option value="DDP">DDP (Delivered Duty Paid)</option>
                  <option value="EXW">EXW (Ex Works)</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                  Quotation Status
                </label>
                <select
                  value={quotationStatus}
                  onChange={(e) => setQuotationStatus(e.target.value)}
                  style={{
                    padding: '0.45rem 0.65rem',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    borderRadius: '6px',
                    border: quotationStatus === 'accepted' ? '1px solid #86efac' : '1px solid #fde047',
                    backgroundColor: quotationStatus === 'accepted' ? '#f0fdf4' : '#fefce8',
                    color: quotationStatus === 'accepted' ? '#15803d' : '#a16207'
                  }}
                >
                  <option value="accepted">✓ Accepted (Active in Catalog)</option>
                  <option value="received">⏳ Received / Under Review</option>
                  <option value="negotiation">💬 In Negotiation</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '0.875rem 1rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem'
            }}>
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          {/* Footer Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              onClick={() => {
                setScanResult(null);
                setScanMeta(null);
                setFile(null);
                setFilePreview(null);
                setUploadedFileMetadata(null);
              }}
              style={{
                padding: '0.55rem 1.25rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#64748b',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Start Over
            </button>

            <button 
              onClick={handleApply} 
              disabled={scanResult.filter(i => i.action !== 'ignore').length === 0 || isApplying} 
              style={{
                padding: '0.55rem 1.5rem',
                fontSize: '0.88rem',
                fontWeight: 700,
                color: '#ffffff',
                backgroundColor: scanResult.filter(i => i.action !== 'ignore').length === 0 ? '#94a3b8' : '#059669',
                border: 'none',
                borderRadius: '8px',
                cursor: scanResult.filter(i => i.action !== 'ignore').length === 0 || isApplying ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: scanResult.filter(i => i.action !== 'ignore').length === 0 ? 'none' : '0 2px 6px rgba(5,150,105,0.3)'
              }}
            >
              <CheckCircle2 size={15} /> Apply & Import Prices ({scanResult.filter(i => i.action !== 'ignore').length})
            </button>
          </div>
        </div>
      )}
    </div>
  );

  if (isEmbedded) return content;

  return (
    <StandardDrawer
      title="Scan Price List & Quotation"
      isOpen={true}
      onClose={onClose}
      width="min(94vw, 920px)"
      zIndex={zIndex}
    >
      {content}
    </StandardDrawer>
  );
}