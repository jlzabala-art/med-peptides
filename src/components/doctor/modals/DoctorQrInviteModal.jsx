'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  X,
  Copy,
  Check,
  Download,
  Share2,
  Stethoscope,
  Sparkles,
  ExternalLink,
  Printer
} from '@/lib/icons';
import notifier from '../../../services/NotificationService';

export default function DoctorQrInviteModal({
  isOpen,
  onClose,
  doctorId = 'dr-hanieh-erdmann',
  doctorName = 'Dr. Hanieh Erdmann',
  clinicName = 'Bedaya Polyclinic L.L.C.',
}) {
  const [copied, setCopied] = useState(false);
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://regenpept.com';

  if (!isOpen) return null;

  const intakeUrl = `${origin || 'https://regenpept.com'}/rx/intake?doc=${encodeURIComponent(doctorId)}&dr=${encodeURIComponent(doctorName)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(intakeUrl);
    setCopied(true);
    notifier.success('Enlace de autoinscripción copiado.');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Hola! Por favor completa tu ficha clínica antes de tu consulta con ${doctorName}:\n${intakeUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.70)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100000,
        padding: '1rem',
        animation: 'qrModalFade 0.2s ease',
      }}
    >
      <style>{`
        @keyframes qrModalFade {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        @media print {
          body * {
            visibility: hidden;
          }
          #doctor-qr-printable, #doctor-qr-printable * {
            visibility: visible;
          }
          #doctor-qr-printable {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>

      <div
        id="doctor-qr-printable"
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          maxWidth: '460px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #003666 0%, #002244 100%)',
            padding: '1.25rem 1.5rem',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
              }}
            >
              <QrCode size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                Autoinscripción en Consulta
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#cbd5e1' }}>
                {doctorName} • {clinicName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div
          style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '1rem',
          }}
        >
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.4 }}>
            Tus pacientes pueden escanear este QR en la sala de espera o abrir el enlace en su móvil para completar sus datos en 30 segundos.
          </p>

          {/* QR Code Container */}
          <div
            style={{
              padding: '16px',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '2px dashed #cbd5e1',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              display: 'inline-flex',
            }}
          >
            <QRCodeSVG
              value={intakeUrl}
              size={190}
              level="H"
              includeMargin={false}
              fgColor="#003666"
            />
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: '0.72rem', color: '#16a34a', fontWeight: 700 }}>
            <span>✓ Se asigna automáticamente a tu consulta</span>
          </div>

          {/* URL Box */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '6px 10px',
              gap: '8px',
            }}
          >
            <span
              style={{
                flex: 1,
                fontSize: '0.75rem',
                color: '#64748b',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textAlign: 'left',
                fontFamily: 'monospace',
              }}
            >
              {intakeUrl}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: copied ? '#16a34a' : '#0d9488',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>

          {/* Quick Share Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%' }}>
            <button
              type="button"
              onClick={handleWhatsApp}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#25D366',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Share2 size={15} />
              <span>Enviar por WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#334155',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Printer size={15} />
              <span>Imprimir Cartel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
