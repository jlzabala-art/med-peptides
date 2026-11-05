'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  FileText,
  ExternalLink,
  Copy,
  Check,
  Share2,
  Printer,
  Calendar,
  User,
  ShieldCheck,
  Truck,
  Building2,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';

/**
 * ExternalFulfillmentRefillCard
 * 
 * Specialized clinical card & refill passport for prescriptions fulfilled by external suppliers/partners
 * (e.g. UAE Peptides, DN LAB, external compounders) where Atlas Health does not directly apply physical labels
 * to the packaging, but MUST retain clinical custody, patient education, and refill linkage.
 *
 * Implements:
 * - Dual-QR: QR 1 (Direct Patient Refill) + QR 2 (Product Monograph & Cold Storage Guide)
 * - 1-Click WhatsApp Delivery to patient
 * - Printable A6 / Flyer format for inclusion in courier packaging
 */
export default function ExternalFulfillmentRefillCard({
  prescription,
  labelData,
  isEs = true,
  onSwitchToInternalLabel
}) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const fileNumber = (
    prescription?.fileNumber ||
    prescription?.id ||
    labelData?.fileNumber ||
    labelData?.rxCode ||
    'RX-ATLAS'
  ).replace(/^#/, '').trim();

  const patientName =
    prescription?.patientName ||
    prescription?.patient?.name ||
    labelData?.patientName ||
    'Paciente';

  const doctorName =
    prescription?.doctorName ||
    prescription?.doctor?.name ||
    'Dr. Khalid Shukri';

  const clinicName =
    prescription?.clinicName ||
    prescription?.clinic?.name ||
    'Medi-Gyn Clinic';

  const supplierName =
    prescription?.supplierFulfillment?.supplierName ||
    prescription?.supplierName ||
    prescription?.pharmacy ||
    labelData?.pharmacyName ||
    'UAE Peptides (DN LAB)';

  const supplierContact =
    prescription?.supplierFulfillment?.contact ||
    'Agustín';

  const productTitle =
    prescription?.productTitle ||
    prescription?.productName ||
    labelData?.productTitle ||
    labelData?.productName ||
    'Retatrutide (GLP-3) 30 mg Pre-filled Pen';

  const productSlug =
    prescription?.productSlug ||
    labelData?.productSlug ||
    'retatrutide';

  const quantity =
    prescription?.quantity ||
    labelData?.quantity ||
    '2 unidades (60 mg total)';

  const cycleDays =
    prescription?.treatmentDurationDays ||
    prescription?.cycleDays ||
    84;

  const storageInfo =
    labelData?.storage ||
    prescription?.storage ||
    'Conservar refrigerado (2°C - 8°C). No congelar.';

  // QR URLs
  const refillUrl =
    labelData?.targetRxUrl ||
    labelData?.qrRefillUrl ||
    prescription?.qrRefillUrl ||
    `https://www.atlashealth-services.com/rx/${encodeURIComponent(fileNumber)}?view=patient&action=refill`;

  const productUrl =
    labelData?.qrProductUrl ||
    labelData?.productUrl ||
    prescription?.productUrl ||
    `https://www.atlashealth-services.com/product/${encodeURIComponent(productSlug)}`;

  // Copy Handlers
  const handleCopyLink = () => {
    navigator.clipboard?.writeText(refillUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopySummary = () => {
    const text = isEs
      ? `📋 Atlas Health - Pasaporte de Prescripción & Refill
Paciente: ${patientName}
Prescripción: #${fileNumber}
Médico: ${doctorName} (${clinicName})
Medicación: ${productTitle} (Cant: ${quantity})
Duración estimada: ${cycleDays} días
Proveedor de suministro: ${supplierName} (${supplierContact})

🔗 Solicitar Renovación (Refill): ${refillUrl}
📖 Ficha del Producto & Conservación: ${productUrl}`
      : `📋 Atlas Health - Prescription & Refill Passport
Patient: ${patientName}
Rx Code: #${fileNumber}
Physician: ${doctorName} (${clinicName})
Medication: ${productTitle} (Qty: ${quantity})
Duration: ${cycleDays} days
Fulfillment: ${supplierName} (${supplierContact})

🔗 Request Medication Refill: ${refillUrl}
📖 Product Monograph & Storage: ${productUrl}`;

    navigator.clipboard?.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  // WhatsApp Share Handler
  const handleShareWhatsApp = () => {
    const msg = isEs
      ? `Estimada/o ${patientName}, adjuntamos su Pasaporte de Tratamiento para la prescripción #${fileNumber} (${productTitle}) emitida por ${doctorName}.

Para solicitar su renovación (Refill) cuando finalice el suministro:
🔗 ${refillUrl}

Para consultar la posología, conservación y modo de uso:
📖 ${productUrl}

Atlas Health Clinical Services`
      : `Dear ${patientName}, here is your Treatment Passport for prescription #${fileNumber} (${productTitle}) issued by ${doctorName}.

To request your medication refill:
🔗 ${refillUrl}

Product monograph and storage guidance:
📖 ${productUrl}

Atlas Health Clinical Services`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '920px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {/* ── LOGISTIC CONTEXT BANNER ── */}
      <div style={{
        background: '#eff6ff',
        border: '1.5px solid #bfdbfe',
        borderRadius: '10px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            background: '#dbeafe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1d4ed8',
            flexShrink: 0
          }}>
            <Truck size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e3a8a' }}>
                {isEs ? 'Modalidad: Envío por Proveedor Externo' : 'Fulfillment: External Supplier Dropship'}
              </span>
              <span style={{
                background: '#dbeafe',
                color: '#1e40af',
                fontSize: '0.68rem',
                fontWeight: 750,
                padding: '2px 8px',
                borderRadius: '12px'
              }}>
                {supplierName}
              </span>
            </div>
            <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: '#475569' }}>
              {isEs
                ? `El producto se despacha directamente desde el proveedor. Generamos la Tarjeta Clínica y los códigos QR para que el paciente mantenga la trazabilidad y renueve el refill con nosotros.`
                : `Product is fulfilled directly by external partner. This card provides the patient with direct refill access and clinical monograph.`}
            </p>
          </div>
        </div>

        {onSwitchToInternalLabel && (
          <button
            type="button"
            onClick={onSwitchToInternalLabel}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #93c5fd',
              background: '#ffffff',
              color: '#1d4ed8',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>{isEs ? 'Cambiar a Etiqueta Física (Mi Delivery)' : 'Switch to Physical Adhesive Label'}</span>
            <ArrowRight size={13} />
          </button>
        )}
      </div>

      {/* ── CLINICAL REFILL PASSPORT (PRINTABLE / SHAREABLE CARD) ── */}
      <div
        id="atlas-refill-card-print"
        style={{
          background: '#ffffff',
          border: '1.5px solid #cbd5e1',
          borderRadius: '12px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
          overflow: 'hidden'
        }}
      >
        {/* Card Header */}
        <div style={{
          background: 'linear-gradient(135deg, #003666 0%, #002244 100%)',
          padding: '16px 20px',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Building2 size={16} color="#93c5fd" />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#bfdbfe' }}>
                Atlas Health Clinical Network
              </span>
              <span style={{ color: '#60a5fa' }}>•</span>
              <span style={{ fontSize: '0.75rem', color: '#e2e8f0', fontWeight: 600 }}>
                {clinicName}
              </span>
            </div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
              {isEs ? 'Pasaporte de Tratamiento & Renovación (Refill)' : 'Treatment & Medication Refill Passport'}
            </h3>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#93c5fd', display: 'block' }}>
              Prescription ID
            </span>
            <span style={{ fontSize: '0.95rem', fontWeight: 900, fontFamily: 'monospace', color: '#ffffff' }}>
              #{fileNumber}
            </span>
          </div>
        </div>

        {/* Patient & Prescription Metadata Bar */}
        <div style={{
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          padding: '12px 20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          fontSize: '0.76rem'
        }}>
          <div>
            <span style={{ color: '#64748b', fontWeight: 600, display: 'block', textTransform: 'uppercase', fontSize: '0.66rem' }}>
              {isEs ? 'Paciente' : 'Patient'}
            </span>
            <strong style={{ color: '#0f172a', fontSize: '0.86rem' }}>{patientName}</strong>
          </div>

          <div>
            <span style={{ color: '#64748b', fontWeight: 600, display: 'block', textTransform: 'uppercase', fontSize: '0.66rem' }}>
              {isEs ? 'Médico Prescriptor' : 'Prescribing Physician'}
            </span>
            <strong style={{ color: '#0f172a' }}>{doctorName}</strong>
          </div>

          <div>
            <span style={{ color: '#64748b', fontWeight: 600, display: 'block', textTransform: 'uppercase', fontSize: '0.66rem' }}>
              {isEs ? 'Medicación & Suministro' : 'Medication & Supply'}
            </span>
            <strong style={{ color: '#003666' }}>{productTitle}</strong>
            <span style={{ display: 'block', color: '#64748b', fontSize: '0.70rem' }}>{quantity}</span>
          </div>

          <div>
            <span style={{ color: '#64748b', fontWeight: 600, display: 'block', textTransform: 'uppercase', fontSize: '0.66rem' }}>
              {isEs ? 'Ciclo de Tratamiento' : 'Cycle Duration'}
            </span>
            <strong style={{ color: '#16a34a' }}>{cycleDays} {isEs ? 'días (12 semanas)' : 'days (12 weeks)'}</strong>
            <span style={{ display: 'block', color: '#64748b', fontSize: '0.70rem' }}>{storageInfo}</span>
          </div>
        </div>

        {/* ── DUAL QR CODE WORKBENCH (REFILL + PRODUCT) ── */}
        <div style={{
          padding: '24px 20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {/* QR 1: REFILL DIRECTO */}
          <div style={{
            border: '2px solid #003666',
            borderRadius: '10px',
            padding: '18px 16px',
            background: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,54,102,0.06)'
          }}>
            <span style={{
              background: '#003666',
              color: '#ffffff',
              fontSize: '0.70rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              padding: '4px 10px',
              borderRadius: '12px',
              marginBottom: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Sparkles size={12} />
              <span>QR 1 · {isEs ? 'Renovación de Medicación' : 'Medication Refill'}</span>
            </span>

            {/* QR SVG Element */}
            <div style={{
              padding: '10px',
              background: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              marginBottom: '12px'
            }}>
              <QRCodeSVG
                value={refillUrl}
                size={160}
                level="M"
                includeMargin={false}
                fgColor="#003666"
                bgColor="#ffffff"
              />
            </div>

            <h4 style={{ margin: '0 0 4px', fontSize: '0.90rem', fontWeight: 800, color: '#0f172a' }}>
              {isEs ? 'Escanear para Pedir Refill' : 'Scan to Request Refill'}
            </h4>
            <p style={{ margin: '0 0 12px', fontSize: '0.74rem', color: '#64748b', lineHeight: 1.4 }}>
              {isEs
                ? 'El paciente solicita el siguiente lote en 1 clic directamente vinculado a su prescripción autorizada.'
                : 'Allows the patient to order the next supply in 1 click, directly linked to this authorized Rx.'}
            </p>

            <div style={{ display: 'flex', gap: '6px', width: '100%', marginTop: 'auto' }}>
              <button
                type="button"
                onClick={handleCopyLink}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#334155',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                {copiedLink ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                <span>{copiedLink ? (isEs ? '¡Copiado!' : 'Copied!') : (isEs ? 'Copiar Enlace' : 'Copy Link')}</span>
              </button>

              <a
                href={refillUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: '1px solid #003666',
                  background: '#003666',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <span>{isEs ? 'Abrir' : 'Open'}</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* QR 2: FICHA DE PRODUCTO */}
          <div style={{
            border: '2px solid #0284c7',
            borderRadius: '10px',
            padding: '18px 16px',
            background: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(2,132,199,0.06)'
          }}>
            <span style={{
              background: '#0284c7',
              color: '#ffffff',
              fontSize: '0.70rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              padding: '4px 10px',
              borderRadius: '12px',
              marginBottom: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Info size={12} />
              <span>QR 2 · {isEs ? 'Ficha de Producto' : 'Product Monograph'}</span>
            </span>

            {/* QR SVG Element */}
            <div style={{
              padding: '10px',
              background: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              marginBottom: '12px'
            }}>
              <QRCodeSVG
                value={productUrl}
                size={160}
                level="M"
                includeMargin={false}
                fgColor="#0369a1"
                bgColor="#ffffff"
              />
            </div>

            <h4 style={{ margin: '0 0 4px', fontSize: '0.90rem', fontWeight: 800, color: '#0f172a' }}>
              {isEs ? 'Escanear para Ficha Técnica' : 'Scan for Product Dossier'}
            </h4>
            <p style={{ margin: '0 0 12px', fontSize: '0.74rem', color: '#64748b', lineHeight: 1.4 }}>
              {isEs
                ? 'Monografía clínica, pauta de titulación por semanas, posología y guía de conservación refrigerada.'
                : 'Clinical monograph, weekly titration ramp, posology, and cold storage guidance (2°C-8°C).'}
            </p>

            <div style={{ display: 'flex', gap: '6px', width: '100%', marginTop: 'auto' }}>
              <a
                href={productUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: '1px solid #0284c7',
                  background: '#f0f9ff',
                  color: '#0369a1',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <span>{isEs ? 'Ver Ficha de Producto' : 'View Monograph'}</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>

        {/* Card Footer Notes */}
        <div style={{
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          fontSize: '0.72rem',
          color: '#64748b'
        }}>
          <span>
            {isEs
              ? `Emitido bajo protocolo clínico de Atlas Health · Suministro directo por ${supplierName}`
              : `Issued under Atlas Health Clinical Protocol · Direct dispatch by ${supplierName}`}
          </span>
          <span style={{ fontWeight: 600, color: '#334155' }}>
            {isEs ? 'Conservación: 2°C - 8°C' : 'Storage: 2°C - 8°C'}
          </span>
        </div>
      </div>

      {/* ── OPERATIONAL ACTION TOOLBAR ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '12px 16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* WhatsApp Share Button */}
          <button
            type="button"
            onClick={handleShareWhatsApp}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: '#25D366',
              color: '#ffffff',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(37,211,102,0.25)'
            }}
          >
            <Share2 size={15} />
            <span>{isEs ? 'Enviar por WhatsApp a la Paciente' : 'Send via WhatsApp'}</span>
          </button>

          {/* Copy Full Clinical Summary */}
          <button
            type="button"
            onClick={handleCopySummary}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {copiedSummary ? <Check size={15} color="#16a34a" /> : <Copy size={15} />}
            <span>{copiedSummary ? (isEs ? '¡Copiado!' : 'Copied!') : (isEs ? 'Copiar Resumen Clínico' : 'Copy Clinical Summary')}</span>
          </button>
        </div>

        {/* Print / Export Action */}
        <button
          type="button"
          onClick={() => window.print()}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: '1px solid #003666',
            background: '#003666',
            color: '#ffffff',
            fontSize: '0.78rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Printer size={15} />
          <span>{isEs ? 'Imprimir Tarjeta A6 / Volante' : 'Print A6 Flyer'}</span>
        </button>
      </div>
    </div>
  );
}

