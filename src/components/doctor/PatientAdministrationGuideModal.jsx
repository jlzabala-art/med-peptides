'use client';

import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Copy, 
  Check, 
  MessageCircle, 
  Droplet, 
  Thermometer, 
  Calendar, 
  AlertCircle,
  FileText,
  User,
  Stethoscope
} from '@/lib/icons';
import { toast } from 'react-hot-toast';

export default function PatientAdministrationGuideModal({ isOpen, onClose, rx, isDoctor = true }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !rx) return null;

  const patientName = rx.patientName || rx.patient?.name || 'Patient';
  const doctorName = rx.doctorName || rx.doctor?.name || 'Physician';
  const patientPhone = rx.patientPhone || rx.patient?.phone || '';
  const items = rx.items || rx.compounds || rx.products || [];
  const dateIssued = rx.createdAt 
    ? (typeof rx.createdAt.toDate === 'function' ? rx.createdAt.toDate().toLocaleDateString() : new Date(rx.createdAt).toLocaleDateString())
    : (rx.dateIssued || new Date().toLocaleDateString());

  // Calculation helpers for syringe units
  const calculateGuidance = (item) => {
    const name = item.name || item.productName || item.product_title || 'Peptide';
    const doseStr = (item.dosage || item.dose || item.quantityBottles || '250 mcg').toString();
    
    // Parse vial mg (e.g. 5mg, 10mg)
    let vialMg = 5;
    const mgMatch = name.match(/(\d+(?:\.\d+)?)\s*mg/i);
    if (mgMatch) vialMg = parseFloat(mgMatch[1]);

    // Recommended Bac Water (ml)
    const diluentMl = vialMg >= 10 ? 2.0 : 2.0;

    // Dose in mg
    let doseMg = 0.25;
    if (doseStr.toLowerCase().includes('mcg')) {
      const num = parseFloat(doseStr) || 250;
      doseMg = num / 1000;
    } else if (doseStr.toLowerCase().includes('mg')) {
      doseMg = parseFloat(doseStr) || 0.25;
    }

    // Units on U-100 syringe: (doseMg / (vialMg / diluentMl)) * 100
    const concentration = vialMg / diluentMl; // mg per ml
    const mlPerDose = concentration > 0 ? (doseMg / concentration) : 0.1;
    const syringeUnits = Math.round(mlPerDose * 100);

    const frequency = item.frequency || item.dosing_frequency || 'Once Weekly';
    const route = item.route || 'Subcutaneous (SC)';

    return {
      name,
      doseStr,
      vialMg,
      diluentMl,
      syringeUnits: Math.max(1, syringeUnits),
      mlPerDose: mlPerDose.toFixed(2),
      frequency,
      route,
      instructions: item.instructions || `Administer ${doseStr} (${syringeUnits} units) subcutaneously as clinically prescribed.`
    };
  };

  const guidanceItems = items.map(calculateGuidance);

  // Generate plain-text summary for WhatsApp / SMS / Email
  const generateFormattedText = () => {
    let text = `📋 *GUÍA DE ADMINISTRACIÓN CLÍNICA*\n`;
    text += `*Paciente:* ${patientName}\n`;
    text += `*Prescriptor:* ${doctorName}\n`;
    text += `*Fecha de Emisión:* ${dateIssued}\n\n`;
    text += `────────────────────\n`;

    guidanceItems.forEach((g, idx) => {
      text += `*${idx + 1}. ${g.name}*\n`;
      text += `• Reconstitución: Diluir con ${g.diluentMl} ml de Agua Bacteriostática (inyectar suavemente por la pared del vial, NO agitar).\n`;
      text += `• Dosis Prescrita: ${g.doseStr}\n`;
      text += `• Jeringa de Insulina U-100: Cargar exactamente *${g.syringeUnits} UNIDADES* (${g.mlPerDose} ml).\n`;
      text += `• Vía y Frecuencia: ${g.route} • ${g.frequency}\n`;
      text += `• Conservación: Guardar en frigorífico a 2°C – 8°C. Proteger de la luz.\n\n`;
    });

    text += `────────────────────\n`;
    text += `ℹ️ Para cualquier consulta sobre su pauta, consulte con su clínica o médico prescriptor.`;
    return text;
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(generateFormattedText());
      setCopied(true);
      toast.success('Instrucciones copiadas al portapapeles');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Error al copiar al portapapeles');
    }
  };

  const handleSendWhatsApp = () => {
    const text = encodeURIComponent(generateFormattedText());
    const cleanPhone = patientPhone.replace(/[^0-9]/g, '');
    const url = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${text}`
      : `https://wa.me/?text=${text}`;
    window.open(url, '_blank', 'noopener,noreferrer');
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
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--color-surface, #ffffff)',
          color: 'var(--color-text-primary, #0f172a)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxWidth: '720px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid var(--color-border, #e2e8f0)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--color-border, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--color-surface-subtle, #f8fafc)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(13, 148, 136, 0.12)',
                color: '#0d9488',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Stethoscope size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                Guía de Administración para el Paciente
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                Reconstitución, calibración de jeringa U-100 y pauta posológica
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: '0.4rem',
              borderRadius: '8px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Patient / Doctor Meta Bar */}
        <div
          style={{
            padding: '0.85rem 1.5rem',
            backgroundColor: 'rgba(241, 245, 249, 0.6)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.5rem',
            fontSize: '0.85rem',
            borderBottom: '1px solid var(--color-border, #e2e8f0)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <User size={15} color="#0d9488" />
            <span style={{ color: '#64748b' }}>Paciente:</span>
            <strong style={{ color: '#0f172a' }}>{patientName}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Stethoscope size={15} color="#0d9488" />
            <span style={{ color: '#64748b' }}>Médico:</span>
            <strong style={{ color: '#0f172a' }}>{doctorName}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={15} color="#0d9488" />
            <span style={{ color: '#64748b' }}>Fecha:</span>
            <span>{dateIssued}</span>
          </div>
        </div>

        {/* Body Guide Cards */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {guidanceItems.map((item, idx) => (
            <div
              key={idx}
              style={{
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                padding: '1.25rem',
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#0d9488',
                    letterSpacing: '0.05em',
                  }}
                >
                  Compuesto #{idx + 1}
                </span>
                <span
                  style={{
                    backgroundColor: 'rgba(13, 148, 136, 0.1)',
                    color: '#0f766e',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  {item.frequency}
                </span>
              </div>

              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#0f172a' }}>
                {item.name}
              </h4>

              {/* Syringe Unit Highlight Box */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '0.75rem',
                  marginTop: '0.75rem',
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#f0fdfa',
                    border: '1px solid #99f6e4',
                    borderRadius: '8px',
                    padding: '0.75rem',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: '#0f766e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Droplet size={14} /> Jeringa U-100
                  </div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#115e59', marginTop: '2px' }}>
                    {item.syringeUnits} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Unidades</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Volumen exacto: {item.mlPerDose} ml
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '0.75rem',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Droplet size={14} /> Diluyente Requerido
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#334155', marginTop: '2px' }}>
                    {item.diluentMl} ml
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Agua Bacteriostática estéril
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    padding: '0.75rem',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: '#1d4ed8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Thermometer size={14} /> Conservación
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e40af', marginTop: '2px' }}>
                    2°C – 8°C
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Refrigerado • No congelar
                  </div>
                </div>
              </div>

              {/* Instructions text */}
              <div style={{ fontSize: '0.85rem', lineHeight: '1.5', color: '#334155' }}>
                <strong>Instrucciones:</strong> {item.instructions}
              </div>
            </div>
          ))}

          {/* Clinical General Safety Tips */}
          <div
            style={{
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '10px',
              padding: '0.85rem 1rem',
              display: 'flex',
              gap: '0.75rem',
              fontSize: '0.8rem',
              color: '#92400e',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Recomendación para el paciente:</strong> Limpiar el tapón del vial con una toallita de alcohol antes de cada uso. Desechar la aguja en un contenedor de bioseguridad homologado tras cada inyección. Mantener fuera del alcance de los niños.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--color-border, #e2e8f0)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            background: 'var(--color-surface-subtle, #f8fafc)',
          }}
        >
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleCopyText}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.5rem 0.9rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#334155',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {copied ? <Check size={16} color="#16a34a" /> : <Copy size={16} />}
              {copied ? 'Copiado ✓' : 'Copiar Texto'}
            </button>

            <button
              onClick={handleSendWhatsApp}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.5rem 0.9rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#25D366',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <MessageCircle size={16} />
              Enviar por WhatsApp
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Printer size={16} />
              Imprimir / PDF
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
