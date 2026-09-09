"use client";

import React, { useState, useEffect, useRef } from 'react';
import Package from "lucide-react/dist/esm/icons/package";
import Minus from "lucide-react/dist/esm/icons/minus";
import Plus from "lucide-react/dist/esm/icons/plus";
import QrCode from "lucide-react/dist/esm/icons/qr-code";
import X from "lucide-react/dist/esm/icons/x";
import Camera from "lucide-react/dist/esm/icons/camera";
import Check from "lucide-react/dist/esm/icons/check";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import { subscribeToInventory, updateInventoryQuantity } from '../../../repositories/inventoryRepository';
import { updateWarehouseStockAction } from '../../../actions/wholesalerActions';
import { useAuth } from '../../../context/AuthContext';
import { getActiveProductsPaginated } from '../../../repositories/productRepository';
import { searchAlgolia } from '../../../services/algoliaSearch';
import { triggerHaptic } from '../../../utils/haptics';
import notifier from '../../../services/NotificationService';
import { logger } from '../../../utils/logger';
import EmptyState from '../../ui/EmptyState';

export default function RealTimeStockManagerWidget() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [scannedResult, setScannedResult] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    async function loadCatalog() {
      try {
        const res = await getActiveProductsPaginated(20);
        setProducts(res?.items || res?.products || []);
      } catch (err) {
        logger.error('Error fetching active products', { error: err?.message });
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    }
    loadCatalog();
  }, []);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeToInventory(user.uid, (items) => {
      setInventory(items || []);
    });

    return () => unsub();
  }, [user]);

  // Clean up camera stream when modal closes
  useEffect(() => {
    if (!isScannerOpen && streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, [isScannerOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported on this device/browser');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Check if BarcodeDetector API is supported
      if ('BarcodeDetector' in window) {
        const barcodeDetector = new window.BarcodeDetector({
          formats: ['qr_code', 'code_128', 'ean_13', 'upc_a']
        });

        const detectLoop = async () => {
          if (!streamRef.current || !videoRef.current) return;
          try {
            if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
              const barcodes = await barcodeDetector.detect(videoRef.current);
              if (barcodes.length > 0) {
                const code = barcodes[0].rawValue;
                handleCodeDetected(code);
                return;
              }
            }
          } catch {
            // Detector loop frame drop
          }
          if (streamRef.current) {
            requestAnimationFrame(detectLoop);
          }
        };
        requestAnimationFrame(detectLoop);
      }
    } catch (err) {
      setCameraError(err.message || 'Could not access camera');
    }
  };

  const handleOpenScanner = () => {
    triggerHaptic('medium');
    setIsScannerOpen(true);
    setScannedResult(null);
    setTimeout(() => {
      startCamera();
    }, 100);
  };

  const handleCloseScanner = () => {
    triggerHaptic('tap');
    setIsScannerOpen(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const handleCodeDetected = async (rawCode) => {
    triggerHaptic('success');
    const normalized = rawCode.trim();
    let matchedProduct = products.find(p => 
      p.id?.toLowerCase() === normalized.toLowerCase() ||
      p.sku?.toLowerCase() === normalized.toLowerCase() ||
      p.name?.toLowerCase().includes(normalized.toLowerCase())
    );

    if (!matchedProduct && normalized.length >= 2) {
      try {
        const algoliaRes = await searchAlgolia(normalized);
        if (algoliaRes.products?.length > 0) {
          matchedProduct = algoliaRes.products[0];
          setProducts(prev => [matchedProduct, ...prev.filter(p => p.id !== matchedProduct.id)]);
        }
      } catch (searchErr) {
        logger.debug('Algolia barcode lookup fallback:', searchErr?.message);
      }
    }

    if (matchedProduct) {
      setScannedResult({
        code: normalized,
        product: matchedProduct,
      });
      notifier.success(`Barcode detected: ${normalized} (${matchedProduct.name})`);
    } else {
      setScannedResult({
        code: normalized,
        product: { id: normalized, name: `SKU: ${normalized}` },
      });
      notifier.warn(`Barcode ${normalized} not found in catalog.`);
    }
  };

  const updateQuantity = async (productId, currentQty, delta) => {
    triggerHaptic('tap');
    const newQty = Math.max(0, currentQty + delta);
    try {
      const prodData = products.find((p) => p.id === productId);
      await updateInventoryQuantity(user?.uid || 'global_wholesaler', productId, newQty, prodData?.name || productId);
      // Also trigger Server Action for persistence
      await updateWarehouseStockAction({
        productId,
        newQuantity: newQty,
        wholesalerId: user?.uid || 'global_wholesaler',
      });
    } catch (err) {
      logger.error('Error updating inventory qty', { error: err.message });
    }
  };

  return (
    <div className="card" style={{ padding: '1.5rem', background: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header with Mobile Scanner Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={18} color="#003666" /> Warehouse Physical Inventory
          </h3>
          <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>
            Real-time on-hand SKU counts & warehouse scan check-in
          </p>
        </div>

        {/* Scan Barcode / QR Button (Golden Rule #23: min 44px touch target) */}
        <button
          onClick={handleOpenScanner}
          style={{
            padding: '0.5rem 0.85rem',
            borderRadius: '10px',
            backgroundColor: '#003666',
            color: '#ffffff',
            border: 'none',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            minHeight: '44px',
            minWidth: '44px',
            boxShadow: '0 2px 8px rgba(0, 54, 102, 0.18)',
            transition: 'all 0.15s ease',
          }}
        >
          <QrCode size={16} />
          <span>Scan Barcode / QR</span>
        </button>
      </div>

      {/* SKU Inventory List */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '340px' }}>
        {loadingProducts ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div className="skeleton" style={{ height: '60px', borderRadius: '12px' }} />
            <div className="skeleton" style={{ height: '60px', borderRadius: '12px' }} />
            <div className="skeleton" style={{ height: '60px', borderRadius: '12px' }} />
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No inventory products"
            subtitle="Products created in the master catalog will appear here with real-time stock counts."
          />
        ) : (
          products.slice(0, 10).map(prod => {
            const invItem = inventory.find(i => i.productId === prod.id) || { quantity: 0, threshold: 10 };
            const isLow = invItem.quantity <= invItem.threshold;

          return (
            <div 
              key={prod.id} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '0.75rem 1rem', 
                background: '#f8fafc', 
                borderRadius: '12px', 
                border: isLow ? '1px solid #fed7aa' : '1px solid #e2e8f0', 
                flexWrap: 'wrap', 
                gap: '0.5rem' 
              }}
            >
              <div>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>{prod.name}</div>
                {isLow ? (
                  <div style={{ fontSize: '0.72rem', color: '#ea580c', fontWeight: 800, marginTop: '0.15rem' }}>Low Stock Alert</div>
                ) : (
                  <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700, marginTop: '0.15rem' }}>Optimal Stock Level</div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {/* 44px Touch Targets for Mobile Warehouse Operation (Golden Rule #23) */}
                <button 
                  onClick={() => updateQuantity(prod.id, invItem.quantity, -1)}
                  aria-label="Decrease quantity"
                  style={{ 
                    background: '#e2e8f0', 
                    border: 'none', 
                    borderRadius: '8px', 
                    minWidth: '44px', 
                    minHeight: '44px', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    touchAction: 'manipulation',
                  }}
                >
                  <Minus size={16} color="#1e293b" />
                </button>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', minWidth: '36px', textAlign: 'center' }}>
                  {invItem.quantity}
                </div>
                <button 
                  onClick={() => updateQuantity(prod.id, invItem.quantity, 1)}
                  aria-label="Increase quantity"
                  style={{ 
                    background: '#003666', 
                    border: 'none', 
                    borderRadius: '8px', 
                    minWidth: '44px', 
                    minHeight: '44px', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    touchAction: 'manipulation',
                  }}
                >
                  <Plus size={16} color="#ffffff" />
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>

      {/* Barcode & QR Scanner Modal */}
      {isScannerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '480px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1rem 1.25rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f8fafc',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Camera size={18} color="#003666" />
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                  Warehouse Barcode / QR Scanner
                </h4>
              </div>
              <button
                onClick={handleCloseScanner}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  minWidth: '44px',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Video Feed / Fallback */}
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '240px',
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {/* Reticle Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    width: '180px',
                    height: '140px',
                    border: '2px dashed #38bdf8',
                    borderRadius: '8px',
                    pointerEvents: 'none',
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.35)',
                  }}
                />

                {cameraError && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '1rem',
                      textAlign: 'center',
                      color: '#cbd5e1',
                      gap: '0.5rem',
                    }}
                  >
                    <AlertCircle size={24} color="#f59e0b" />
                    <span style={{ fontSize: '0.8rem' }}>{cameraError}</span>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      Use manual barcode or handheld laser scanner below
                    </span>
                  </div>
                )}
              </div>

              {/* Scanned Result Card */}
              {scannedResult && (
                <div
                  style={{
                    padding: '0.85rem 1rem',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #86efac',
                    borderRadius: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Check size={16} color="#16a34a" />
                      <strong style={{ fontSize: '0.88rem', color: '#14532d' }}>
                        {scannedResult.product.name}
                      </strong>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#166534', fontFamily: 'monospace', marginTop: '0.2rem' }}>
                      Scanned Code: {scannedResult.code}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      onClick={() => {
                        const invItem = inventory.find(i => i.productId === scannedResult.product.id) || { quantity: 120 };
                        updateQuantity(scannedResult.product.id, invItem.quantity, 1);
                        notifier.success(`+1 Unit checked into ${scannedResult.product.name}`);
                      }}
                      style={{
                        padding: '0.4rem 0.75rem',
                        backgroundColor: '#16a34a',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        minHeight: '38px',
                      }}
                    >
                      +1 Unit
                    </button>
                    <button
                      onClick={() => {
                        const invItem = inventory.find(i => i.productId === scannedResult.product.id) || { quantity: 120 };
                        updateQuantity(scannedResult.product.id, invItem.quantity, 10);
                        notifier.success(`+10 Units (Box) checked into ${scannedResult.product.name}`);
                      }}
                      style={{
                        padding: '0.4rem 0.75rem',
                        backgroundColor: '#003666',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        minHeight: '38px',
                      }}
                    >
                      +10 (Box)
                    </button>
                  </div>
                </div>
              )}

              {/* Manual Barcode / Lot # Entry */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Enter Lot # or Barcode (e.g. LOT-A12-24)"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && manualCode) {
                      handleCodeDetected(manualCode);
                      setManualCode('');
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem',
                    minHeight: '44px',
                  }}
                />
                <button
                  onClick={() => {
                    if (manualCode) {
                      handleCodeDetected(manualCode);
                      setManualCode('');
                    }
                  }}
                  disabled={!manualCode}
                  style={{
                    padding: '0.65rem 1rem',
                    backgroundColor: manualCode ? '#003666' : '#94a3b8',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: manualCode ? 'pointer' : 'not-allowed',
                    minHeight: '44px',
                  }}
                >
                  Lookup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}