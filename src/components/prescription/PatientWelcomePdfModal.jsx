'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, X, FileText, CheckCircle2, Calendar, RefreshCw, MessageCircle } from '@/lib/icons';
import { computeRefillSchedule, formatShortDate } from '@/utils/refillSchedule';

function cleanTreatmentTitle(rawTitle, apis = [], pdfEs = false) {
  const firstApi = Array.isArray(apis) && apis.length > 0 ? apis[0] : null;
  const apiName = firstApi?.name || firstApi?.productName || '';
  const apiDosage = firstApi?.dosage || '';
  if (apiName) {
    return apiDosage ? `${apiName} (${apiDosage})` : apiName;
  }
  const cleaned = String(rawTitle || '')
    .replace(/\bCompounded\b/gi, '')
    .replace(/\bCompounding\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return cleaned || (pdfEs ? 'Tratamiento Personalizado' : 'Personalized Treatment');
}

function WelcomeA6Card({
  pdfEs,
  cleanCode,
  patientName,
  doctorName,
  treatmentName,
  posologyLine,
  storageLine,
  lotVal,
  budVal,
  qrUrl,
  features,
  isGridCell = false,
}) {
  return (
    <div
      className="atlas-a6-card"
      style={{
        width: '105mm',
        height: '148mm',
        background: '#ffffff',
        padding: '6.5mm 7mm',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '3mm',
        color: '#202124',
        boxSizing: 'border-box',
        border: isGridCell ? '1px dashed #cbd5e1' : '1px solid #dadce0',
        borderRadius: isGridCell ? '0' : '8px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1.5px solid #e8f0fe', paddingBottom: '2.5mm' }}>
        <div>
          <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#003666', letterSpacing: '-0.01em' }}>
            Atlas Health Services
          </div>
          <div style={{ fontSize: '8.5px', color: '#5f6368', fontWeight: 600 }}>
            {pdfEs ? 'Cuidado Clínico Personalizado' : 'Personalized Precision Care'}
          </div>
        </div>
        <span style={{ fontSize: '9px', fontWeight: 800, color: '#1a73e8', background: '#e8f0fe', padding: '2.5px 7px', borderRadius: '4px', fontFamily: 'monospace' }}>
          #{cleanCode}
        </span>
      </div>

      {/* Thank You Hero */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '7px 9px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontSize: '8.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '2px' }}>
          <CheckCircle2 size={11} color="#16a34a" />
          <span>{pdfEs ? 'Gracias por tu compra' : 'Thank you for your order'}</span>
        </div>
        <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#202124', lineHeight: 1.25 }}>
          {pdfEs
            ? `Gracias por confiar en Atlas${patientName ? `, ${patientName}` : ''}`
            : `Thank you for trusting Atlas${patientName ? `, ${patientName}` : ''}`}
        </div>
        <div style={{ fontSize: '8.5px', color: '#5f6368', marginTop: '2px', lineHeight: 1.3 }}>
          {pdfEs
            ? 'Guarda esta tarjeta junto a tu tratamiento para acceder rápido con tu móvil.'
            : 'Keep this card with your treatment for instant access from your phone.'}
        </div>
      </div>

      {/* Essential Summary */}
      <div style={{ border: '1px solid #dadce0', borderRadius: '6px', padding: '7px 9px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <div style={{ fontSize: '11px', fontWeight: 800, color: '#202124', lineHeight: 1.2 }}>
          {treatmentName}
        </div>
        <div style={{ fontSize: '9.5px', fontWeight: 600, color: '#1a73e8', lineHeight: 1.3 }}>
          {posologyLine}
        </div>
        <div style={{ fontSize: '8.5px', color: '#5f6368', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
          <span>{storageLine}</span>
          {(lotVal || budVal) && (
            <span style={{ fontFamily: 'monospace' }}>
              {lotVal ? `${pdfEs ? 'Lote' : 'Lot'}: ${lotVal}` : ''}
              {lotVal && budVal ? ' · ' : ''}
              {budVal ? `${pdfEs ? 'Usar antes' : 'Use before'}: ${budVal}` : ''}
            </span>
          )}
        </div>
      </div>

      {/* Central QR + 4 Features */}
      <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '8px', alignItems: 'center', border: '1px solid #bfdbfe', background: '#f8fbff', borderRadius: '6px', padding: '8px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '3px' }}>
          <div style={{ background: '#ffffff', padding: '5px', borderRadius: '6px', border: '1px solid #dadce0' }}>
            <QRCodeSVG value={qrUrl} size={76} level="M" />
          </div>
          <div style={{ fontSize: '7.5px', fontWeight: 800, color: '#1a73e8', lineHeight: 1.15 }}>
            {pdfEs ? '1. Abre tu cámara' : '1. Open phone camera'}
          </div>
          <div style={{ fontSize: '6.8px', color: '#5f6368', lineHeight: 1.2 }}>
            {pdfEs ? 'Apunta aquí y pulsa el enlace' : 'Point here & tap the link'}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {features.map((feat, i) => {
            const IconComp = feat.icon;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
                <div style={{ width: 15, height: 15, borderRadius: '4px', background: '#e8f0fe', color: '#1a73e8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                  <IconComp size={9} />
                </div>
                <div>
                  <div style={{ fontSize: '8.5px', fontWeight: 700, color: '#202124', lineHeight: 1.15 }}>{feat.title}</div>
                  <div style={{ fontSize: '7.5px', color: '#5f6368', lineHeight: 1.2 }}>{feat.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '2mm', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '7.5px', color: '#5f6368' }}>
        <span>{doctorName ? `${pdfEs ? 'Dr.' : 'By'} ${doctorName}` : 'Atlas Health'}</span>
        <span>WhatsApp +971 55 356 1058</span>
      </div>
    </div>
  );
}

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
  const [layoutMode, setLayoutMode] = useState('a6'); // 'a6' | 'a4_4up'

  useEffect(() => {
    if (isOpen) {
      setPdfEs(Boolean(initialIsEs));
    }
  }, [isOpen, initialIsEs]);

  if (!isOpen || typeof document === 'undefined') return null;

  const cleanCode = String(rxId || rx?.code || rx?.fileNumber || 'RX').replace(/^#/, '').trim();
  const baseUrl = patientPublicUrl || `https://www.atlashealth-services.com/rx/${encodeURIComponent(cleanCode)}?view=patient`;
  const sep = baseUrl.includes('?') ? '&' : '?';
  const qrUrl = `${baseUrl}${sep}lang=${pdfEs ? 'es' : 'en'}&src=welcome_card`;

  const primaryFormulation = Array.isArray(compoundedFormulations) && compoundedFormulations.length > 0
    ? compoundedFormulations[0]
    : null;
  const treatmentName = cleanTreatmentTitle(
    primaryFormulation?.title || rx?.treatmentTitle || rx?.dispensingForm,
    primaryFormulation?.apis || rx?.apis,
    pdfEs
  );
  const posologyLine =
    primaryFormulation?.posology?.dosageInstructions ||
    primaryFormulation?.posology?.regimen ||
    (pdfEs ? 'Seguir la pauta indicada por tu médico.' : 'Take as directed by your physician.');
  const storageLine =
    rx?.storage ||
    primaryFormulation?.storage ||
    (pdfEs ? 'Nevera 2°C – 8°C' : '2°C – 8°C Refrigerated');
  const lotVal = urlLot || rx?.lotNumber || rx?.lote || rx?.batchCode || '';
  const budVal = urlBud || rx?.expDate || rx?.bud || '';

  const refillSchedule = computeRefillSchedule(rx || {}, compoundedFormulations);
  const tentativeRefillStr = refillSchedule.tentativeRefillDate
    ? formatShortDate(refillSchedule.tentativeRefillDate, pdfEs)
    : '';

  const features = pdfEs
    ? [
        { icon: FileText, title: 'Guía y prescripción', desc: 'Cómo tomarlo y guía en 3 pasos.' },
        { icon: Calendar, title: 'Registrar tu uso', desc: 'Marca dosis y activa avisos.' },
        { icon: RefreshCw, title: 'Refill en 1 clic', desc: tentativeRefillStr ? `Pedir antes del ${tentativeRefillStr}.` : 'Repón antes de quedarte sin dosis.' },
        { icon: MessageCircle, title: 'Contactar con Atlas', desc: 'Atlas AI 24/7 y WhatsApp directo.' },
      ]
    : [
        { icon: FileText, title: 'Prescription & guide', desc: 'How to take it & 3-step guide.' },
        { icon: Calendar, title: 'Log daily use', desc: 'Track doses & enable reminders.' },
        { icon: RefreshCw, title: '1-click Refill', desc: tentativeRefillStr ? `Reorder before ${tentativeRefillStr}.` : 'Reorder before running out.' },
        { icon: MessageCircle, title: 'Contact Atlas', desc: '24/7 Atlas AI & WhatsApp support.' },
      ];

  const handlePrintPdf = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const cardProps = {
    pdfEs,
    cleanCode,
    patientName,
    doctorName,
    treatmentName,
    posologyLine,
    storageLine,
    lotVal,
    budVal,
    qrUrl,
    features,
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={pdfEs ? 'Vista previa de tarjeta A6' : 'A6 welcome card PDF preview'}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(15, 23, 42, 0.74)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '12px 16px',
        boxSizing: 'border-box',
      }}
      onClick={onClose}
    >
      <style>{`
        @page {
          size: ${layoutMode === 'a4_4up' ? 'A4 portrait' : 'A6 portrait'};
          margin: 0;
        }
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
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: #ffffff !important;
          }
          .atlas-pdf-no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Fixed Top Preview Toolbar (Always visible above any page header) */}
      <div
        className="atlas-pdf-no-print"
        onClick={(e) => e.stopPropagation()}
        style={{
          flexShrink: 0,
          width: '100%',
          maxWidth: layoutMode === 'a4_4up' ? '210mm' : '460px',
          background: '#0f172a',
          color: '#ffffff',
          borderRadius: '10px',
          padding: '10px 14px',
          marginBottom: '12px',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={16} color="#60a5fa" />
          <span style={{ fontSize: '0.84rem', fontWeight: 700 }}>
            {pdfEs ? 'Vista previa · Tarjeta A6' : 'Preview · A6 Welcome Card'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {/* Format Switcher: 1x A6 vs 4x A6 on A4 */}
          <div style={{ display: 'inline-flex', background: '#1e293b', borderRadius: '6px', padding: '2px', border: '1px solid #334155' }}>
            <button
              type="button"
              onClick={() => setLayoutMode('a6')}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: 'none',
                background: layoutMode === 'a6' ? '#1a73e8' : 'transparent',
                color: '#ffffff',
                fontSize: '0.70rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              1 × A6
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('a4_4up')}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: 'none',
                background: layoutMode === 'a4_4up' ? '#1a73e8' : 'transparent',
                color: '#ffffff',
                fontSize: '0.70rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              4 × A6 (A4)
            </button>
          </div>

          {/* Language Switcher */}
          <div style={{ display: 'inline-flex', background: '#1e293b', borderRadius: '6px', padding: '2px', border: '1px solid #334155' }}>
            <button
              type="button"
              onClick={() => setPdfEs(false)}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: 'none',
                background: !pdfEs ? '#1a73e8' : 'transparent',
                color: '#ffffff',
                fontSize: '0.70rem',
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
                padding: '4px 8px',
                borderRadius: '4px',
                border: 'none',
                background: pdfEs ? '#1a73e8' : 'transparent',
                color: '#ffffff',
                fontSize: '0.70rem',
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
              gap: '5px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              background: '#1a73e8',
              color: '#ffffff',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Printer size={14} />
            <span>{pdfEs ? 'Guardar / Imprimir PDF' : 'Save / Print PDF'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label={pdfEs ? 'Cerrar' : 'Close'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '30px',
              height: '30px',
              borderRadius: '6px',
              border: '1px solid #334155',
              background: 'transparent',
              color: '#cbd5e1',
              cursor: 'pointer',
            }}
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Scrollable Preview Area */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          width: '100%',
          overflowY: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          paddingBottom: '16px',
        }}
      >
        <div
          id="atlas-welcome-pdf-sheet"
          onClick={(e) => e.stopPropagation()}
          style={{
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.30)',
            background: layoutMode === 'a4_4up' ? '#ffffff' : 'transparent',
            maxWidth: '100%',
            overflowX: 'auto',
          }}
        >
          {layoutMode === 'a4_4up' ? (
            <div
              style={{
                width: '210mm',
                height: '296mm',
                display: 'grid',
                gridTemplateColumns: '105mm 105mm',
                gridTemplateRows: '148mm 148mm',
                background: '#ffffff',
              }}
            >
              {[0, 1, 2, 3].map((idx) => (
                <WelcomeA6Card key={idx} {...cardProps} isGridCell />
              ))}
            </div>
          ) : (
            <WelcomeA6Card {...cardProps} />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
