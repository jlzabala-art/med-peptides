'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, X, Copy, Check, Download, MessageCircle, Mail, ExternalLink } from '@/lib/icons';

/**
 * IntakePatientQrModal — Google Cloud UX Modal for Sharing Digital Prescription with Patient via QR & Links
 */
export default function IntakePatientQrModal({
  isOpen,
  onClose,
  officialCode,
  patientName,
  fullPublicUrl,
  copiedPatientLink,
  onCopyPatientLink,
  onDownloadQrPng
}) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.70)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100000,
      padding: '1rem'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        maxWidth: '480px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #bfdbfe',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#0284c7',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <QrCode size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                Patient Access & Digital QR Code
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#475569' }}>
                {officialCode} · {patientName || 'Patient'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          <div style={{
            padding: '14px',
            background: '#ffffff',
            borderRadius: '12px',
            border: '2px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
            display: 'inline-block'
          }}>
            <QRCodeSVG
              id="patient-intake-qr-code"
              value={fullPublicUrl}
              size={200}
              level="H"
              includeMargin={false}
            />
          </div>

          <div style={{ width: '100%', textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
              Public Digital Prescription URL
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '4px 8px',
              gap: '6px'
            }}>
              <input
                type="text"
                readOnly
                value={fullPublicUrl}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontFamily: 'monospace',
                  color: '#0f172a',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={onCopyPatientLink}
                style={{
                  padding: '5px 10px',
                  background: copiedPatientLink ? '#15803d' : '#003666',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap'
                }}
              >
                {copiedPatientLink ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedPatientLink ? 'Copied ✓' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Quick Share Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%' }}>
            <button
              type="button"
              onClick={onDownloadQrPng}
              style={{
                padding: '9px 12px',
                borderRadius: '8px',
                background: '#f1f5f9',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Download size={14} />
              <span>Download QR (PNG)</span>
            </button>

            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                `Atlas Clinical Services — Medical Prescription ${officialCode}\nPatient: ${patientName || 'Clinical Patient'}\nView Electronic Prescription & Posology: ${fullPublicUrl}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '9px 12px',
                borderRadius: '8px',
                background: '#22c55e',
                color: '#ffffff',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <MessageCircle size={14} />
              <span>Share WhatsApp</span>
            </a>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%' }}>
            <a
              href={`mailto:?subject=${encodeURIComponent(`Medical Prescription ${officialCode} — Atlas Clinical Services`)}&body=${encodeURIComponent(
                `Dear Patient,\n\nYour digital electronic prescription (${officialCode}) is available for consultation.\n\nYou can access the full treatment dossier and posology guide at the following link:\n${fullPublicUrl}\n\nKind regards,\nAtlas Clinical Services`
              )}`}
              style={{
                padding: '9px 12px',
                borderRadius: '8px',
                background: '#f8fafc',
                color: '#475569',
                border: '1px solid #e2e8f0',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Mail size={14} />
              <span>Send via Email</span>
            </a>

            <a
              href={fullPublicUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '9px 12px',
                borderRadius: '8px',
                background: '#003666',
                color: '#ffffff',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <ExternalLink size={14} />
              <span>Open Patient View</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
