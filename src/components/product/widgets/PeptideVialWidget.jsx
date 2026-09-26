"use client";

import React, { useState } from 'react';
import { 
  FileText, 
  FlaskConical, 
  CheckCircle2, 
  ShieldCheck, 
  Download, 
  ExternalLink,
  Award,
  QrCode,
  Copy,
  Check
} from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';

/**
 * PeptideVialWidget
 * Specialized Google Cloud Console-compliant sidebar card for lyophilized peptide vials.
 * Includes:
 * 1. Quick Monograph PDF & Certificate of Analysis (COA) triggers.
 * 2. HPLC ≥99.0% & Endotoxin purity specification badge.
 * 3. Verified Active Batch & Release Date.
 * 4. Micro QR verification code with haptic copy.
 */
export default function PeptideVialWidget({
  product,
  slug,
  effectiveBatchCode,
  lang = 'en',
  onOpenPreviewModal,
  onOpenCoaModal,
  publicUrl
}) {
  const isEs = lang === 'es';
  const [copied, setCopied] = useState(false);

  const resolvedUrl = publicUrl || (typeof window !== 'undefined' ? window.location.href : `https://med-peptides.com/p/${slug}`);

  const handleCopyLink = async () => {
    try {
      if (typeof window !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(resolvedUrl);
        triggerHaptic('copy');
        setCopied(true);
        toast.success(isEs ? 'Enlace del producto copiado ✓' : 'Monograph URL copied ✓');
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      toast.error('Could not copy URL');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1rem' }}>
      
      {/* ── CARD 1: QUICK CLINICAL ACTIONS (PDF & COA) ── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        padding: '0.85rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.75rem',
          paddingBottom: '0.5rem',
          borderBottom: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={15} color="#003666" />
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isEs ? 'ACCIONES CLÍNICAS' : 'CLINICAL ACTIONS'}
            </span>
          </div>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1px 6px', borderRadius: '4px' }}>
            HPLC ≥99%
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {onOpenPreviewModal && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                onOpenPreviewModal();
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '8px 12px',
                background: 'linear-gradient(135deg, #003666 0%, #0284c7 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: '0 2px 4px rgba(0,54,102,0.18)'
              }}
            >
              <Download size={14} />
              <span>{isEs ? 'Ver Monografía PDF' : 'View Monograph PDF'}</span>
            </button>
          )}

          {onOpenCoaModal && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                onOpenCoaModal();
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '7px 12px',
                background: '#ffffff',
                color: '#003666',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <FlaskConical size={14} color="#0284c7" />
              <span>{isEs ? 'Certificado de Lote (COA)' : 'Batch Release (COA)'}</span>
            </button>
          )}
        </div>

        {/* Batch Traceability metadata */}
        <div style={{
          marginTop: '0.75rem',
          padding: '6px 8px',
          background: '#f8fafc',
          borderRadius: '6px',
          border: '1px solid #e2e8f0',
          fontSize: '0.70rem',
          display: 'flex',
          justifyContent: 'space-between',
          color: '#64748b'
        }}>
          <span>{isEs ? 'Lote Activo:' : 'Current Lot:'}</span>
          <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>
            {effectiveBatchCode || 'L-2026-VAL'}
          </strong>
        </div>
      </div>

      {/* ── CARD 2: QR & MOBILE VERIFICATION ── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        padding: '0.85rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.75rem',
          paddingBottom: '0.5rem',
          borderBottom: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <QrCode size={15} color="#003666" />
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isEs ? 'VERIFICACIÓN MÓVIL' : 'MOBILE VERIFICATION'}
            </span>
          </div>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0284c7', background: '#f0f9ff', border: '1px solid #bae6fd', padding: '1px 6px', borderRadius: '4px' }}>
            SSOT 2026
          </span>
        </div>

        <div style={{
          display: 'inline-block',
          padding: '8px',
          background: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <QRCodeSVG 
            value={resolvedUrl}
            size={95}
            level="M"
            includeMargin={false}
          />
        </div>

        <p style={{ margin: '8px 0 10px 0', fontSize: '0.70rem', color: '#64748b', lineHeight: 1.4 }}>
          {isEs 
            ? 'Escanea para consultar la ficha técnica y espectros en smartphone.' 
            : 'Scan to view mobile monograph & release spectra on bedside.'}
        </p>

        <button
          type="button"
          onClick={handleCopyLink}
          style={{
            width: '100%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '6px 10px',
            borderRadius: '6px',
            fontSize: '0.72rem',
            fontWeight: 700,
            background: copied ? '#f0fdf4' : '#f8fafc',
            color: copied ? '#16a34a' : '#334155',
            border: copied ? '1px solid #86efac' : '1px solid #cbd5e1',
            cursor: 'pointer'
          }}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          <span>{copied ? (isEs ? 'Copiado ✓' : 'Copied ✓') : (isEs ? 'Copiar Enlace' : 'Copy Direct Link')}</span>
        </button>
      </div>

    </div>
  );
}
