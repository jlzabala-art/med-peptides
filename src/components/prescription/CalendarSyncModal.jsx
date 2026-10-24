"use client";

import React from 'react';
import {
  Calendar,
  X,
  CheckCircle2,
  Clock,
  ExternalLink,
  Download,
  ShieldCheck
} from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';
import { generateGoogleCalendarUrl, downloadIcsFile } from '@/utils/calendarSync';
import toast from 'react-hot-toast';

export default function CalendarSyncModal({
  isOpen,
  onClose,
  rxId = '',
  patientName = '',
  doctorName = '',
  compoundedFormulations = [],
  patientPublicUrl = '',
  isEs = false
}) {
  if (!isOpen) return null;

  const formulaSummary = (compoundedFormulations || [])
    .map(f => f.title || f.name)
    .filter(Boolean)
    .join(' + ') || `Prescripción #${rxId}`;

  const posologySummary = (compoundedFormulations || [])
    .map(f => f.posology?.regimen || f.posologySummary)
    .filter(Boolean)
    .join('; ') || (isEs ? 'Seguir pauta médica indicada en el expediente' : 'Follow dosing schedule as prescribed');

  const eventTitle = isEs
    ? `Toma de Medicación: ${formulaSummary}`
    : `Medication Schedule: ${formulaSummary}`;

  const eventDescription = isEs
    ? `Recordatorio de toma para ${patientName || 'Paciente'}.\nPrescrito por: ${doctorName || 'Médico Prescriptor'}.\n\nPauta: ${posologySummary}\n\n🔗 Ver expediente clínico completo: ${patientPublicUrl}`
    : `Dosing reminder for ${patientName || 'Patient'}.\nPrescribed by: ${doctorName || 'Prescribing Physician'}.\n\nSchedule: ${posologySummary}\n\n🔗 Full Clinical Dossier: ${patientPublicUrl}`;

  const handleOpenGoogleCalendar = () => {
    triggerHaptic('medium');
    const url = generateGoogleCalendarUrl({
      title: eventTitle,
      description: eventDescription,
      startHour: 8,
      durationMinutes: 15,
      daysCount: 90
    });
    window.open(url, '_blank', 'noopener,noreferrer');
    toast.success(isEs ? 'Abriendo Google Calendar...' : 'Opening Google Calendar...');
    onClose();
  };

  const handleDownloadIcs = () => {
    triggerHaptic('medium');
    downloadIcsFile({
      filename: `Pauta_Medica_${rxId || 'Atlas'}.ics`,
      title: eventTitle,
      description: eventDescription,
      startHour: 8,
      durationMinutes: 15,
      daysCount: 90
    });
    toast.success(isEs ? 'Archivo de calendario descargado (.ics) ✓' : 'Calendar file downloaded (.ics) ✓');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.25), 0 1px 3px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #e2e8f0',
          position: 'relative',
          animation: 'fadeInScale 0.18s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #003666 100%)',
            padding: '18px 22px',
            color: '#ffffff',
            position: 'relative'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              position: 'absolute',
              top: '14px',
              right: '14px',
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Calendar size={20} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.9, fontWeight: 700 }}>
                {isEs ? 'Adherencia & Hábitos de Salud' : 'Treatment Adherence'}
              </div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '2px 0 0 0', lineHeight: 1.25 }}>
                {isEs ? 'Sincronizar Pauta con tu Calendario' : 'Sync Regimen with Calendar'}
              </h2>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
            {isEs
              ? 'Añade recordatorios diarios automáticos para no olvidar ninguna toma a lo largo de tu ciclo de 90 días.'
              : 'Add automatic daily reminders to your calendar so you never miss a dose throughout your 90-day cycle.'}
          </p>

          {/* Regimen Summary Card */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b' }}>
              <span style={{ fontWeight: 700, textTransform: 'uppercase' }}>{isEs ? 'Prescripción' : 'Prescription'}</span>
              <span style={{ fontFamily: 'monospace' }}>#{rxId}</span>
            </div>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
              {formulaSummary}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#16a34a', marginTop: '2px' }}>
              <Clock size={13} />
              <span>{isEs ? 'Horario recomendado: 08:00 AM (90 días recurrentes)' : 'Recommended schedule: 08:00 AM (90 daily recurring)'}</span>
            </div>
          </div>

          {/* Action Pathways */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '4px' }}>
            {/* 1-Click Google Calendar */}
            <button
              type="button"
              onClick={handleOpenGoogleCalendar}
              style={{
                width: '100%',
                padding: '11px 16px',
                borderRadius: '8px',
                background: '#ffffff',
                color: '#1e293b',
                border: '1px solid #dadce0',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 1px 2px rgba(60,64,67,0.08)',
                transition: 'all 0.15s ease'
              }}
            >
              <Calendar size={16} color="#1a73e8" />
              <span>{isEs ? 'Añadir a Google Calendar (1-Clic)' : 'Add to Google Calendar (1-Click)'}</span>
              <ExternalLink size={14} style={{ marginLeft: 'auto', opacity: 0.6 }} />
            </button>

            {/* Download .ICS for Apple / Outlook */}
            <button
              type="button"
              onClick={handleDownloadIcs}
              style={{
                width: '100%',
                padding: '10px 16px',
                borderRadius: '8px',
                background: '#003666',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 1px 3px rgba(0, 54, 102, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              <Download size={15} />
              <span>{isEs ? 'Descargar para Apple Calendar / Outlook (.ics)' : 'Download for Apple Calendar / Outlook (.ics)'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '10px 22px',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.72rem',
            color: '#64748b'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={12} color="#16a34a" />
            <span>{isEs ? 'Sin registro adicional necesario' : 'No account setup required'}</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#475569',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0
            }}
          >
            {isEs ? 'Cerrar' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
