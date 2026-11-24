'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, X, FileText, CheckCircle2, Calendar, RefreshCw, MessageCircle } from '@/lib/icons';
import { computeRefillSchedule, formatShortDate } from '@/utils/refillSchedule';

export default function PatientWelcomePdfModal({
  isOpen,
  onClose,
  rx = {},
  rxId = '',
  patientName = '',
  doctorName = '',
  compoundedFormulations = [],
  patientPublicUrl = '',
  urlLot = '',
  urlBud = '',
  initialIsEs = false,
}) {
  const [pdfEs, setPdfEs] = useState(Boolean(initialIsEs));

  useEffect(() => {
    if (isOpen) {
      setPdfEs(Boolean(initialIsEs));
    }
  }, [isOpen, initialIsEs]);

  if (!isOpen) return null;

  const cleanCode = String(rxId || rx?.code || rx?.fileNumber || 'RX').replace(/^#/, '').trim();
  const baseUrl = patientPublicUrl || `https://www.atlashealth-services.com/rx/${encodeURIComponent(cleanCode)}?view=patient`;
  const sep = baseUrl.includes('?') ? '&' : '?';
  const qrUrl = `${baseUrl}${sep}lang=${pdfEs ? 'es' : 'en'}&src=welcome_card`;

  const primaryFormulation = Array.isArray(compoundedFormulations) && compoundedFormulations.length > 0
    ? compoundedFormulations[0]
    : null;
  const treatmentName =
    primaryFormulation?.title ||
    rx?.treatmentTitle ||
    rx?.dispensingForm ||
    (pdfEs ? 'Fórmula Magistral Personalizada' : 'Personalized Compounded Formula');
  const posologyLine =
    primaryFormulation?.posology?.dosageInstructions ||
    primaryFormulation?.posology?.regimen ||
    (pdfEs ? 'Seguir la pauta indicada por tu médico.' : 'Take as directed by your physician.');
  const storageLine =
    rx?.storage ||
    primaryFormulation?.storage ||
    (pdfEs ? 'Nevera 2°C – 8°C · No congelar' : '2°C – 8°C Refrigerated · Do not freeze');
  const lotVal = urlLot || rx?.lotNumber || rx?.lote || rx?.batchCode || '';
  const budVal = urlBud || rx?.expDate || rx?.bud || '';

  const refillSchedule = computeRefillSchedule(rx || {}, compoundedFormulations);
  const tentativeRefillStr = refillSchedule.tentativeRefillDate
    ? formatShortDate(refillSchedule.tentativeRefillDate, pdfEs)
    : '';

  const features = pdfEs
    ? [
        { icon: FileText, title: 'Información de tu prescripción', desc: 'Consulta cómo tomarlo, conservación y guía visual en 3 pasos.' },
        { icon: Calendar, title: 'Registrar tu uso diario', desc: 'Marca tus dosis y activa recordatorios para no olvidar ninguna toma.' },
        { icon: RefreshCw, title: 'Solicitar tu Refill en 1 clic', desc: tentativeRefillStr ? `Pide tu reposición antes del ${tentativeRefillStr}.` : 'Pide tu reposición antes de quedarte sin tratamiento.' },
        { icon: MessageCircle, title: 'Contactar con nosotros', desc: 'Resuelve dudas 24/7 con Atlas AI o habla por WhatsApp con soporte.' },
      ]
    : [
        { icon: FileText, title: 'View prescription details', desc: 'Check how to take it, storage rules, and the 3-step visual guide.' },
        { icon: Calendar, title: 'Log your daily doses', desc: 'Track adherence and turn on gentle reminders so you stay on schedule.' },
        { icon: RefreshCw, title: 'Request a 1-click Refill', desc: tentativeRefillStr ? `Reorder easily before ${tentativeRefillStr}.` : 'Reorder before your supply runs out.' },
        { icon: MessageCircle, title: 'Contact Atlas anytime', desc: 'Ask Atlas AI 24/7 or message our patient care team on WhatsApp.' },
      ];

  const handlePrintPdf = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={pdfEs ? 'Vista previa de tarjeta de bienvenida' : 'Welcome card PDF preview'}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '16px',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #atlas-welcome-pdf-sheet,
          #atlas-welcome-pdf-sheet * {
            visibility: visible !important;
          }
          #atlas-welcome-pdf-sheet {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 24px 28px !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          .atlas-pdf-no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Top Preview Toolbar */}
      <div
        className="atlas-pdf-no-print"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '680px',
          background: '#0f172a',
          color: '#ffffff',
          borderRadius: '10px 10px 0 0',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={17} color="#60a5fa" />
          <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>
            {pdfEs ? 'Vista previa · Tarjeta de Bienvenida (PDF)' : 'Preview · Patient Welcome Card (PDF)'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', background: '#1e293b', borderRadius: '6px', padding: '2px', border: '1px solid #334155' }}>
            <button
              type="button"
              onClick={() => setPdfEs(false)}
              style={{
                padding: '4px 9px',
                borderRadius: '4px',
                border: 'none',
                background: !pdfEs ? '#1a73e8' : 'transparent',
                color: '#ffffff',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setPdfEs(true)}
              style={{
                padding: '4px 9px',
                borderRadius: '4px',
                border: 'none',
                background: pdfEs ? '#1a73e8' : 'transparent',
                color: '#ffffff',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              ES
            </button>
          </div>

          <button
            type="button"
            onClick={handlePrintPdf}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '6px',
              border: 'none',
              background: '#1a73e8',
              color: '#ffffff',
              fontSize: '0.80rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Printer size={15} />
            <span>{pdfEs ? 'Descargar / Imprimir PDF' : 'Download / Print PDF'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label={pdfEs ? 'Cerrar' : 'Close'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              border: '1px solid #334155',
              background: 'transparent',
              color: '#cbd5e1',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Printable 1-Page Sheet */}
      <div
        id="atlas-welcome-pdf-sheet"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '680px',
          background: '#ffffff',
          borderRadius: '0 0 10px 10px',
          border: '1px solid #dadce0',
          padding: '28px 30px',
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.28)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          color: '#202124',
          boxSizing: 'border-box',
        }}
      >
        {/* Sheet Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderBottom: '2px solid #e8f0fe', paddingBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#003666', letterSpacing: '-0.01em' }}>
              Atlas Health Services
            </div>
            <div style={{ fontSize: '0.74rem', color: '#5f6368', fontWeight: 600 }}>
              {pdfEs ? 'Farmacia de Precisión y Medicina Regenerativa' : 'Precision Compounding & Longevity Care'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'inline-block', fontSize: '0.76rem', fontWeight: 800, color: '#1a73e8', background: '#e8f0fe', padding: '4px 10px', borderRadius: '6px', fontFamily: 'monospace' }}>
              Rx #{cleanCode}
            </span>
          </div>
        </div>

        {/* Thank You Hero */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
            <CheckCircle2 size={15} color="#16a34a" />
            <span>{pdfEs ? 'Gracias por tu compra' : 'Thank you for your order'}</span>
          </div>
          <h2 style={{ margin: '0 0 6px', fontSize: '1.22rem', fontWeight: 800, color: '#202124' }}>
            {pdfEs
              ? `Gracias por confiar en Atlas Health${patientName ? `, ${patientName}` : ''}`
              : `Thank you for trusting Atlas Health${patientName ? `, ${patientName}` : ''}`}
          </h2>
          <p style={{ margin: 0, fontSize: '0.86rem', color: '#5f6368', lineHeight: 1.5 }}>
            {pdfEs
              ? 'Guarda esta tarjeta junto a tu tratamiento. Escanea el código QR en cualquier momento con la cámara de tu móvil para acceder a tu guía privada.'
              : 'Keep this card with your medication. Scan the QR code anytime with your phone camera to open your private treatment guide.'}
          </p>
        </div>

        {/* Essential Medication Summary */}
        <div style={{ border: '1px solid #dadce0', borderRadius: '8px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.96rem', fontWeight: 800, color: '#202124' }}>{treatmentName}</span>
            {(lotVal || budVal) && (
              <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#5f6368' }}>
                {lotVal ? `${pdfEs ? 'Lote' : 'Lot'}: ${lotVal}` : ''}
                {lotVal && budVal ? ' · ' : ''}
                {budVal ? `${pdfEs ? 'Cad' : 'BUD'}: ${budVal}` : ''}
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#1a73e8' }}>
            {posologyLine}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#5f6368' }}>
            <strong>{pdfEs ? 'Conservación:' : 'Storage:'}</strong> {storageLine}
          </div>
        </div>

        {/* Central QR + 4 Features */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', alignItems: 'center', border: '1.5px solid #bfdbfe', background: '#f8fbff', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px' }}>
            <div style={{ background: '#ffffff', padding: '12px', borderRadius: '10px', border: '1px solid #dadce0' }}>
              <QRCodeSVG value={qrUrl} size={136} level="M" />
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1a73e8' }}>
              {pdfEs ? 'Escanea con tu cámara' : 'Scan with your phone camera'}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#003666' }}>
              {pdfEs ? 'Qué puedes hacer con este QR:' : 'What you can do with this QR:'}
            </div>
            {features.map((feat, i) => {
              const IconComp = feat.icon;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '9px' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '6px', background: '#e8f0fe', color: '#1a73e8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                    <IconComp size={13} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#202124', lineHeight: 1.25 }}>{feat.title}</div>
                    <div style={{ fontSize: '0.74rem', color: '#5f6368', lineHeight: 1.35 }}>{feat.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', fontSize: '0.74rem', color: '#5f6368' }}>
          <span>
            {doctorName ? `${pdfEs ? 'Prescrito por:' : 'Prescribed by:'} ${doctorName}` : 'Atlas Health Clinical Team'}
          </span>
          <span>
            WhatsApp: +971 56 417 9256 · atlashealth-services.com
          </span>
        </div>
      </div>
    </div>
  );
}
