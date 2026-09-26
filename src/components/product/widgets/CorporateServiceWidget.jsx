"use client";

import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  ExternalLink,
  QrCode,
  Copy,
  Check,
  Award
} from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';

/**
 * CorporateServiceWidget
 * Specialized Google Cloud Console-compliant sidebar card for Corporate Acquisitions & Residency (Law 14/2013 / UAE).
 */
export default function CorporateServiceWidget({
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
        toast.success(isEs ? 'Enlace del expediente copiado ✓' : 'Program URL copied ✓');
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      toast.error('Could not copy URL');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1rem' }}>
      
      {/* ── CARD 1: STATUTORY FRAMEWORK & TIMELINE ── */}
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
            <Building2 size={15} color="#003666" />
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isEs ? 'MARCO NORMATIVO' : 'STATUTORY FRAMEWORK'}
            </span>
          </div>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#003666', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '1px 6px', borderRadius: '4px' }}>
            LEY 14/2013
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.74rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <Clock size={14} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#0f172a', display: 'block' }}>
                {isEs ? '20 Días Hábiles (UGE-CE)' : '20 Business Days Resolution'}
              </strong>
              <span style={{ color: '#64748b', fontSize: '0.70rem' }}>
                {isEs ? 'Silencio administrativo positivo por ley' : 'Statutory positive administrative silence'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <ShieldCheck size={14} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#0f172a', display: 'block' }}>
                {isEs ? 'Schengen: 29 Países' : '29 Schengen Countries'}
              </strong>
              <span style={{ color: '#64748b', fontSize: '0.70rem' }}>
                {isEs ? 'Libre circulación sin visados fronterizos' : 'Free visa-free mobility across Schengen'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <Award size={14} color="#7c3aed" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#0f172a', display: 'block' }}>
                {isEs ? 'Titularidad 100% S.L.' : '100% Equity Ownership'}
              </strong>
              <span style={{ color: '#64748b', fontSize: '0.70rem' }}>
                {isEs ? 'Sociedad mercantil constituida sin pasivos' : 'Clean S.L. vehicle with verified due diligence'}
              </span>
            </div>
          </div>
        </div>

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
              background: 'linear-gradient(135deg, #003666 0%, #001f3f 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,54,102,0.2)'
            }}
          >
            <span>{isEs ? 'Iniciar Consulta Confidencial' : 'Initiate Confidential Inquiry'}</span>
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
              {isEs ? 'EXPEDIENTE DIGITAL' : 'DIGITAL DOSSIER'}
            </span>
          </div>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#003666', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '1px 6px', borderRadius: '4px' }}>
            OFICIAL
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
