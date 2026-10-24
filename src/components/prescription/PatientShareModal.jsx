"use client";

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Share2, 
  ShieldCheck, 
  QrCode, 
  Download,
  Smartphone
} from '@/lib/icons';
import { toast } from 'react-hot-toast';
import { triggerHaptic } from '@/utils/haptics';
import { generatePatientAccessKey } from '@/utils/prescriptionToken';

export default function PatientShareModal({
  isOpen,
  onClose,
  rxId = '',
  patientName = 'Patient',
  patientPublicUrl = '',
  doctorName = '',
  doctorClinic = '',
  lang = 'en'
}) {
  const [copied, setCopied] = useState(false);
  const isEs = lang === 'es';

  // Generate zero-friction tokenized access link for patient
  const tokenKey = generatePatientAccessKey(rxId);
  const tokenizedUrl = patientPublicUrl 
    ? `${patientPublicUrl}${patientPublicUrl.includes('?') ? '&' : '?'}k=${tokenKey}`
    : '';

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(tokenizedUrl);
      setCopied(true);
      triggerHaptic('success');
      toast.success(isEs ? 'Enlace directo del paciente copiado ✓' : 'Direct patient link copied ✓');
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      toast.error('Could not copy link');
    }
  };

  const handleDownloadQrPng = () => {
    try {
      const svg = document.getElementById('patient-share-qr-svg');
      if (!svg) return;
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width + 40;
        canvas.height = img.height + 40;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        const a = document.createElement('a');
        a.download = `Atlas_Prescription_${rxId}_QR.png`;
        a.href = canvas.toDataURL('image/png');
        a.click();
        triggerHaptic('success');
        toast.success(isEs ? 'Código QR descargado ✓' : 'QR Code downloaded ✓');
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (err) {
      toast.error('Download error');
    }
  };

  const waMessage = isEs
    ? `Estimado/a ${patientName},\nLe comparto el acceso digital seguro a su prescripción médica #${rxId} emitida por ${doctorName || doctorClinic || 'su clínica'}.\n\nPuede consultar sus fórmulas, horarios y pautas aquí:\n${tokenizedUrl || patientPublicUrl}`
    : `Dear ${patientName},\nHere is the secure access to your digital medical prescription #${rxId} issued by ${doctorName || doctorClinic || 'your clinic'}.\n\nYou can review your formulation schedule and instructions here:\n${tokenizedUrl || patientPublicUrl}`;

  const waLink = `https://wa.me/?text=${encodeURIComponent(waMessage)}`;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        padding: '1rem'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          maxWidth: '440px',
          width: '100%',
          boxShadow: '0 24px 48px -12px rgba(0, 54, 102, 0.3)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              background: '#e0f2fe',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Share2 size={16} />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 750, color: '#0f172a' }}>
                {isEs ? 'Compartir con el Paciente' : 'Share with Patient'}
              </div>
              <div style={{ fontSize: '0.70rem', color: '#64748b' }}>
                {patientName} · Ref: {rxId}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              borderRadius: '6px',
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Privacy safe badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '0.72rem',
            color: '#065f46',
            lineHeight: 1.35
          }}>
            <ShieldCheck size={16} color="#059669" style={{ flexShrink: 0 }} />
            <div>
              <strong>{isEs ? 'Vista Segura para el Paciente' : 'Patient Safe View'}:</strong>{' '}
              {isEs 
                ? 'El paciente solo verá sus pautas y posología, sin costes internos ni datos técnicos de laboratorio.' 
                : 'Patient only sees posology and schedule without internal laboratory pricing or raw manufacturing details.'}
            </div>
          </div>

          {/* Central QR Code for in-clinic scanning */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px',
            gap: '10px'
          }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 650, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Smartphone size={14} color="#0284c7" />
              <span>{isEs ? 'Escanear en consulta con el móvil' : 'In-clinic scan with patient mobile'}</span>
            </div>

            <div style={{
              background: '#ffffff',
              padding: '12px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <QRCodeSVG
                id="patient-share-qr-svg"
                value={tokenizedUrl || patientPublicUrl}
                size={160}
                level="H"
                includeMargin={false}
              />
            </div>

            <button
              type="button"
              onClick={handleDownloadQrPng}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#0284c7',
                fontSize: '0.72rem',
                fontWeight: 650,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Download size={13} />
              <span>{isEs ? 'Descargar QR en imagen (PNG)' : 'Download QR Image (PNG)'}</span>
            </button>
          </div>

          {/* Communication Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* WhatsApp Direct */}
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => triggerHaptic('impact')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: '#25D366',
                color: '#ffffff',
                textDecoration: 'none',
                padding: '10px 16px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                boxShadow: '0 2px 6px rgba(37, 211, 102, 0.25)',
                transition: 'filter 0.15s'
              }}
            >
              <span>💬</span>
              <span>{isEs ? 'Enviar por WhatsApp al Paciente' : 'Send to Patient via WhatsApp'}</span>
            </a>

            {/* Copy Safe URL & Open Preview */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  background: copied ? '#f0fdf4' : '#ffffff',
                  color: copied ? '#16a34a' : '#1e293b',
                  border: `1px solid ${copied ? '#86efac' : '#cbd5e1'}`,
                  padding: '9px 12px',
                  borderRadius: '8px',
                  fontSize: '0.76rem',
                  fontWeight: 650,
                  cursor: 'pointer'
                }}
              >
                {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                <span>{copied ? (isEs ? 'Enlace Copiado ✓' : 'Link Copied ✓') : (isEs ? 'Copiar Enlace' : 'Copy Link')}</span>
              </button>

              <a
                href={patientPublicUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  background: '#f8fafc',
                  color: '#0284c7',
                  border: '1px solid #cbd5e1',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  fontSize: '0.76rem',
                  fontWeight: 650,
                  textDecoration: 'none',
                  cursor: 'pointer'
                }}
              >
                <ExternalLink size={14} />
                <span>{isEs ? 'Vista Previa' : 'Preview'}</span>
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
