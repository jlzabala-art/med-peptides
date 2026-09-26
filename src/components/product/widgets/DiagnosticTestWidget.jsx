"use client";

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FlaskConical, 
  Clock, 
  CheckCircle2, 
  ExternalLink,
  QrCode,
  Copy,
  Check,
  Award,
  Activity,
  Download
} from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';

/**
 * DiagnosticTestWidget
 * Specialized Google Cloud Console-compliant sidebar card for CE-IVDR diagnostic test kits (Bloodo™ Suite).
 */
export default function DiagnosticTestWidget({
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
        toast.success(isEs ? 'Enlace del test diagnóstico copiado ✓' : 'Diagnostic test URL copied ✓');
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      toast.error('Could not copy URL');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1rem' }}>
      
      {/* ── CARD 1: CLINICAL LABORATORY SPECIFICATIONS ── */}
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
            <Activity size={15} color="#0284c7" />
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isEs ? 'LABORATORIO CLÍNICO' : 'CLINICAL LABORATORY'}
            </span>
          </div>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0284c7', background: '#f0f9ff', border: '1px solid #bae6fd', padding: '1px 6px', borderRadius: '4px' }}>
            CE-IVDR
          </span>
        </div>

        {/* Diagnostic Key Parameters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.74rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <CheckCircle2 size={14} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#0f172a', display: 'block' }}>LifeLab1 Central Lab</strong>
              <span style={{ color: '#64748b', fontSize: '0.70rem' }}>
                {isEs ? 'Lic. NM-334 / NR-4864 · ISO 15189' : 'Lic. NM-334 / NR-4864 · ISO 15189'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <Clock size={14} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#0f172a', display: 'block' }}>{isEs ? 'Tiempo de Informe: 48–72h' : 'Reporting Window: 48–72h'}</strong>
              <span style={{ color: '#64748b', fontSize: '0.70rem' }}>{isEs ? 'Desde recepción en laboratorio central' : 'From central laboratory receipt'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <ShieldCheck size={14} color="#7c3aed" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#0f172a', display: 'block' }}>Whatman® 903 Card</strong>
              <span style={{ color: '#64748b', fontSize: '0.70rem' }}>{isEs ? 'DBS sangre capilar · Secado al aire' : 'Capillary DBS · Air-drying required'}</span>
            </div>
          </div>
        </div>

        {/* ── Official Bloodo 2026 Product Catalog Download Button ── */}
        <a
          href="/docs/bloodo-product-catalog-2026.pdf"
          target="_blank"
          rel="noopener noreferrer"
          download="bloodo-product-catalog-2026.pdf"
          onClick={() => triggerHaptic('selection')}
          style={{
            width: '100%',
            marginTop: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '8px 12px',
            background: 'linear-gradient(135deg, #003666 0%, #0284c7 100%)',
            color: '#ffffff',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '0.76rem',
            fontWeight: 700,
            boxShadow: '0 2px 4px rgba(0,54,102,0.18)',
            transition: 'all 0.15s ease'
          }}
          title={isEs ? 'Descargar Catálogo Completo Bloodo 2026 en PDF' : 'Download Complete Bloodo 2026 Catalog in PDF'}
        >
          <Download size={14} />
          <span>{isEs ? 'Catálogo Bloodo 2026 (PDF)' : 'Download Bloodo Catalog (PDF)'}</span>
        </a>

        {onOpenInquiry && (
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              onOpenInquiry();
            }}
            style={{
              width: '100%',
              marginTop: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '8px 12px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(2,132,199,0.2)'
            }}
          >
            <span>{isEs ? 'Consultar Kit Diagnóstico' : 'Inquire Diagnostic Kit'}</span>
          </button>
        )}
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
              {isEs ? 'ACCESO PACIENTE / QR' : 'PATIENT ACCESS QR'}
            </span>
          </div>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1px 6px', borderRadius: '4px' }}>
            ENCRIPTADO
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
            ? 'Instrucciones visuales de toma capilar en teléfono móvil.' 
            : 'Scan for mobile capillary blood collection walkthrough.'}
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
