"use client";

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Copy, Check, ExternalLink, X, Download, ShieldCheck } from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';
import toast from 'react-hot-toast';

/**
 * UniversalQrCard
 * Unified, GCP-styled QR display component across Med-Peptides.
 * Standardizes layout, typography, "Enlarge QR" lightbox modal, copy, and download.
 */
export default function UniversalQrCard({
  value = '',
  title = '',
  subtitle = '',
  badge = null,
  size = 96,
  lang = 'en',
  icon: IconComponent = QrCode,
  showCopyButton = true,
  className = '',
  style = {}
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const isEs = lang === 'es';

  const defaultTitle = isEs ? 'ACCESO QR VERIFICADO' : 'VERIFIED PROTOCOL';
  const defaultSubtitle = isEs ? 'Escanear para acceso clínico instantáneo' : 'Scan for Instant Clinical Access';
  const displayTitle = title || defaultTitle;
  const displaySubtitle = subtitle || defaultSubtitle;

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      triggerHaptic('copy');
      setCopied(true);
      toast.success(isEs ? 'Enlace QR copiado ✓' : 'QR link copied to clipboard ✓');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy link');
    }
  };

  const handleDownloadQr = () => {
    try {
      const svg = document.getElementById(`qr-svg-${Math.abs(hashString(value))}`);
      if (!svg) return;
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = 600;
        canvas.height = 600;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 600, 600);
        ctx.drawImage(img, 50, 50, 500, 500);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `atlas-qr-${Date.now()}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
      toast.success(isEs ? 'Código QR descargado ✓' : 'QR code downloaded ✓');
    } catch (err) {
      console.warn('[UniversalQrCard] Download error:', err);
    }
  };

  const qrId = `qr-svg-${Math.abs(hashString(value || 'default'))}`;

  return (
    <>
      <div 
        className={`universal-qr-card ${className}`}
        style={{
          background: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          padding: '0.85rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          textAlign: 'center',
          width: '100%',
          boxSizing: 'border-box',
          ...style
        }}
      >
        {/* Optional Header Row with Badge */}
        {(title || badge) && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid #f1f5f9'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IconComponent size={15} color="#003666" />
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {displayTitle}
              </span>
            </div>
            {badge && (
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1px 6px', borderRadius: '4px' }}>
                {badge}
              </span>
            )}
          </div>
        )}

        {/* QR Code Container */}
        <div style={{
          display: 'inline-flex',
          padding: '8px',
          background: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          marginBottom: '6px'
        }}>
          <QRCodeSVG 
            id={qrId}
            value={value || 'https://med-peptides.com'}
            size={size}
            level="M"
            includeMargin={false}
          />
        </div>

        {/* Subtitle */}
        {displaySubtitle && (
          <div style={{ margin: '4px 0 6px 0', fontSize: '0.68rem', color: '#64748b', fontWeight: 600, lineHeight: 1.35 }}>
            {displaySubtitle}
          </div>
        )}

        {/* Action Controls Strip: [ Enlarge QR ] */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '6px' }}>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '3px 8px',
              fontSize: '0.70rem',
              fontWeight: 700,
              color: '#0d9488',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s ease'
            }}
            title={isEs ? 'Ampliar código QR' : 'Enlarge QR code for mobile scanning'}
          >
            <QrCode size={11} />
            <span>{isEs ? 'Ampliar QR' : 'Enlarge QR'}</span>
          </button>

          {showCopyButton && (
            <button
              type="button"
              onClick={handleCopy}
              style={{
                background: copied ? '#ecfdf5' : '#f8fafc',
                border: `1px solid ${copied ? '#a7f3d0' : '#cbd5e1'}`,
                borderRadius: '6px',
                padding: '3px 8px',
                fontSize: '0.70rem',
                fontWeight: 700,
                color: copied ? '#059669' : '#475569',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.15s ease'
              }}
              title={isEs ? 'Copiar enlace al portapapeles' : 'Copy link to clipboard'}
            >
              {copied ? <Check size={11} color="#059669" /> : <Copy size={11} />}
              <span>{copied ? (isEs ? 'Copiado' : 'Copied') : (isEs ? 'Copiar' : 'Copy')}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── High-Contrast Full-Screen Lightbox Modal ── */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100099,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '380px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              <X size={16} />
            </button>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#003666', fontWeight: 800, fontSize: '0.86rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
              <ShieldCheck size={16} color="#0d9488" />
              <span>{displayTitle}</span>
            </div>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.76rem', color: '#64748b' }}>
              {displaySubtitle}
            </p>

            {/* High-Resolution QR */}
            <div style={{
              display: 'inline-flex',
              padding: '16px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '2px solid #e2e8f0',
              boxShadow: '0 4px 12px rgba(0, 54, 102, 0.08)',
              marginBottom: '16px'
            }}>
              <QRCodeSVG 
                value={value || 'https://med-peptides.com'}
                size={220}
                level="Q"
                includeMargin={false}
              />
            </div>

            {/* Direct Target URL Display */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '8px 10px',
              fontSize: '0.72rem',
              color: '#334155',
              fontFamily: 'monospace',
              wordBreak: 'break-all',
              marginBottom: '14px',
              maxHeight: '48px',
              overflowY: 'auto'
            }}>
              {value}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '9px 12px',
                  backgroundColor: copied ? '#16a34a' : '#003666',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease'
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? (isEs ? 'Copiado' : 'Copied') : (isEs ? 'Copiar Enlace' : 'Copy Link')}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadQr}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '9px 12px',
                  backgroundColor: '#f8fafc',
                  color: '#0f172a',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Download size={14} />
                <span>{isEs ? 'Descargar PNG' : 'Download PNG'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
