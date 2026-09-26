"use client";

import React, { useState } from 'react';
import { 
  Droplets, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  QrCode, 
  Copy, 
  Check 
} from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';

/**
 * SolventReconWidget
 * Specialized Google Cloud Console-compliant sidebar card for sterile bacteriostatic water & reconstitution diluents.
 */
export default function SolventReconWidget({
  product,
  slug,
  lang = 'en',
  onOpenInquiry,
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
        toast.success(isEs ? 'Enlace copiado al portapapeles ✓' : 'Diluent URL copied ✓');
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      toast.error('Could not copy URL');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1rem' }}>
      
      {/* ── CARD 1: SOLVENT SAFETY & 28-DAY RULE ── */}
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
            <Droplets size={15} color="#0284c7" />
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isEs ? 'SEGURIDAD DE DILUYENTE' : 'DILUENT SAFETY'}
            </span>
          </div>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0284c7', background: '#f0f9ff', border: '1px solid #bae6fd', padding: '1px 6px', borderRadius: '4px' }}>
            Ph. Eur.
          </span>
        </div>

        {/* 28-day puncture limit callout */}
        <div style={{
          padding: '8px 10px',
          background: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: '6px',
          marginBottom: '0.75rem',
          display: 'flex',
          gap: '8px',
          alignItems: 'flex-start'
        }}>
          <AlertTriangle size={15} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.72rem', color: '#92400e', lineHeight: 1.4 }}>
            <strong>{isEs ? 'Regla Estricta de 28 Días:' : 'Strict 28-Day Puncture Rule:'}</strong>
            <p style={{ margin: '2px 0 0 0' }}>
              {isEs 
                ? 'Desechar el vial exactamente a los 28 días tras la primera punción estéril para evitar contaminación bacteriana.'
                : 'Discard vial exactly 28 days post first septum puncture to prevent microbial breach.'}
            </p>
          </div>
        </div>

        {/* Parameters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.74rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
            <span>{isEs ? 'Conservante:' : 'Preservative:'}</span>
            <strong style={{ color: '#0f172a' }}>0.9% Benzyl Alcohol</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
            <span>{isEs ? 'Endotoxinas:' : 'Endotoxins:'}</span>
            <strong style={{ color: '#16a34a' }}>&lt; 0.25 EU/mL</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
            <span>{isEs ? 'Osmolaridad:' : 'Osmolarity:'}</span>
            <strong style={{ color: '#0f172a' }}>Isotónico (~300 mOsm/L)</strong>
          </div>
        </div>
      </div>

      {/* ── CARD 2: QR VERIFICATION ── */}
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
              {isEs ? 'VERIFICACIÓN DE LOTE' : 'LOT VERIFICATION'}
            </span>
          </div>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1px 6px', borderRadius: '4px' }}>
            ESTÉRIL
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

        <button
          type="button"
          onClick={handleCopyLink}
          style={{
            width: '100%',
            marginTop: '10px',
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
