"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, QrCode, AlertCircle, Camera, Check } from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';

export default function QrScannerModal({ isOpen, onClose, onDetected }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const router = useRouter();

  const [hasCamera, setHasCamera] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [detectedText, setDetectedText] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setDetectedText(null);
      setErrorMsg(null);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const startCamera = async () => {
    setErrorMsg(null);
    setDetectedText(null);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setHasCamera(false);
      setErrorMsg('La cámara web no está disponible en este dispositivo o navegador.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' }, // Prefer rear camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsScanning(true);
        beginScanLoop();
      }
    } catch (err) {
      console.warn('[QrScannerModal] Camera error:', err);
      setHasCamera(false);
      setErrorMsg('No se pudo acceder a la cámara. Por favor verifica los permisos en tu navegador.');
    }
  };

  const handleBarcodeResult = (rawText) => {
    if (!rawText) return;
    triggerHaptic('success');
    setDetectedText(rawText);
    stopCamera();

    if (onDetected) {
      onDetected(rawText);
      onClose();
      return;
    }

    // Default intelligent routing:
    let target = rawText.trim();
    if (target.includes('/p/')) {
      const parts = target.split('/p/');
      if (parts[1]) {
        router.push(`/p/${parts[1]}`);
        onClose();
        return;
      }
    }

    // If it is a token or slug
    if (target.startsWith('http://') || target.startsWith('https://')) {
      window.location.href = target;
    } else {
      router.push(`/p/${encodeURIComponent(target)}`);
    }
    onClose();
  };

  const beginScanLoop = () => {
    if (typeof window === 'undefined' || !('BarcodeDetector' in window)) {
      // BarcodeDetector not natively available in this browser
      return;
    }

    const detector = new window.BarcodeDetector({
      formats: ['qr_code', 'code_128', 'ean_13', 'data_matrix'],
    });

    const intervalId = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) return;

      try {
        const barcodes = await detector.detect(videoRef.current);
        if (barcodes && barcodes.length > 0) {
          clearInterval(intervalId);
          handleBarcodeResult(barcodes[0].rawValue);
        }
      } catch {
        // Continue scanning silently
      }
    }, 250);

    return () => clearInterval(intervalId);
  };

  if (!isOpen) return null;

  return (
    <div className="qr-scanner-backdrop" role="dialog" aria-modal="true" aria-label="Escáner QR de Viales">
      <style>{`
        .qr-scanner-backdrop {
          position: fixed;
          inset: 0;
          z-index: 10000;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          animation: qrFadeIn 0.2s ease;
        }
        @keyframes qrFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .qr-scanner-card {
          width: 100%;
          max-width: 440px;
          background: #0f172a;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
        }
        .qr-scanner-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .qr-scanner-title {
          font-size: 1rem;
          font-weight: 700;
          color: #f8fafc;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .qr-scanner-close {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 6px;
          display: flex;
        }
        .qr-scanner-close:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.1);
        }
        .qr-scanner-view {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          background: #000000;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .qr-video-feed {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .qr-reticle {
          position: absolute;
          width: 220px;
          height: 220px;
          border: 2px dashed #38bdf8;
          border-radius: 16px;
          box-shadow: 0 0 0 4000px rgba(0, 0, 0, 0.45);
          pointer-events: none;
          animation: reticlePulse 2s infinite ease-in-out;
        }
        @keyframes reticlePulse {
          0%, 100% { border-color: #38bdf8; }
          50% { border-color: #0284c7; }
        }
        .qr-scanner-footer {
          padding: 1rem 1.25rem;
          text-align: center;
          font-size: 0.82rem;
          color: #94a3b8;
        }
        .qr-error-box {
          padding: 2rem 1.5rem;
          text-align: center;
          color: #f87171;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }
      `}</style>

      <div className="qr-scanner-card">
        <div className="qr-scanner-header">
          <span className="qr-scanner-title">
            <QrCode size={18} color="#38bdf8" />
            Escanear Vial / QR Ficha Técnica
          </span>
          <button
            type="button"
            onClick={onClose}
            className="qr-scanner-close"
            aria-label="Cerrar escáner"
          >
            <X size={20} />
          </button>
        </div>

        <div className="qr-scanner-view">
          {errorMsg ? (
            <div className="qr-error-box">
              <AlertCircle size={32} color="#f87171" />
              <span>{errorMsg}</span>
            </div>
          ) : (
            <>
              <video ref={videoRef} className="qr-video-feed" playsInline muted autoPlay />
              {isScanning && <div className="qr-reticle" />}
            </>
          )}
        </div>

        <div className="qr-scanner-footer">
          {detectedText ? (
            <span style={{ color: '#4ade80', fontWeight: 'bold' }}>
              ✓ Código detectado: {detectedText}
            </span>
          ) : (
            <span>Enfoca la cámara hacia el código QR impreso en el vial o la caja para abrir su ficha técnica instantáneamente.</span>
          )}
        </div>
      </div>
    </div>
  );
}
