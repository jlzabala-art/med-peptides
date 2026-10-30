'use client';

import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  X,
  ShieldCheck,
  MessageCircle,
  QrCode,
  Lock,
  AlertTriangle,
  ExternalLink,
  Smartphone
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DoctorPatientShareModal({
  isOpen,
  onClose,
  doctor = {},
  opaqueCode = '',
  isAdmin = false,
  lang = 'en'
}) {
  const [activeTab, setActiveTab] = useState('patient');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedDoctorLink, setCopiedDoctorLink] = useState(false);
  const [showQr, setShowQr] = useState(true);

  if (!isOpen) return null;

  const isEs = lang === 'es';
  const docName = doctor?.name ? (doctor.name.startsWith('Dr') ? doctor.name : `Dr. ${doctor.name}`) : 'Physician';
  const effectiveCode = opaqueCode || doctor?.opaqueCode || 'DR-CLINICAL';

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.atlashealth-services.com';
  const patientIntakeUrl = `${baseUrl}/dr/${effectiveCode}?view=patient`;
  const doctorPortalUrl = `${baseUrl}/dr/${effectiveCode}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(patientIntakeUrl)}&margin=10`;

  const handleCopyPatientLink = async () => {
    try {
      if (navigator?.clipboard) {
        await navigator.clipboard.writeText(patientIntakeUrl);
        setCopiedLink(true);
        toast.success(isEs ? 'Enlace del paciente copiado ✓' : 'Patient intake link copied ✓');
        setTimeout(() => setCopiedLink(false), 2500);
      }
    } catch {
      toast.error('Could not copy link');
    }
  };

  const handleCopyDoctorLink = async () => {
    try {
      if (navigator?.clipboard) {
        await navigator.clipboard.writeText(doctorPortalUrl);
        setCopiedDoctorLink(true);
        toast.success(isEs ? 'Enlace médico 1-Tap copiado ✓' : 'Doctor 1-Tap portal link copied ✓');
        setTimeout(() => setCopiedDoctorLink(false), 2500);
      }
    } catch {
      toast.error('Could not copy link');
    }
  };

  const handleWhatsAppShare = () => {
    const message = isEs
      ? `Estimado/a paciente, aquí tiene el enlace de acceso directo al portal de atención e intake clínico con ${docName} en Atlas Health Services:\n\n${patientIntakeUrl}\n\nPuede consultar sus fórmulas magistrales, posología y gestionar su seguimiento médico.`
      : `Dear patient, here is your direct link to the clinical intake and patient care portal with ${docName} at Atlas Health Services:\n\n${patientIntakeUrl}\n\nYou can review your compounded regimens, verify posology, and complete your clinical intake securely.`;

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '560px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          border: '1px solid #dadce0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#eff6ff',
                color: '#1a73e8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Share2 size={18} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                {isEs ? 'Compartir Portal Clínico' : 'Share Clinical Portal'}
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                {docName} • {doctor?.clinic || 'My London Skin Clinic'}
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
              color: '#64748b',
              padding: '6px',
              borderRadius: '6px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Role Segmented Tabs (Admin vs Patient View) */}
        {isAdmin && (
          <div
            style={{
              display: 'flex',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              padding: '4px 16px'
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('patient')}
              style={{
                flex: 1,
                padding: '8px 12px',
                fontSize: '0.80rem',
                fontWeight: 650,
                border: 'none',
                background: activeTab === 'patient' ? '#ffffff' : 'transparent',
                color: activeTab === 'patient' ? '#1a73e8' : '#64748b',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: activeTab === 'patient' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Smartphone size={14} />
              <span>{isEs ? 'Versión para Pacientes (Segura)' : 'Patient Intake View (Safe)'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('doctor')}
              style={{
                flex: 1,
                padding: '8px 12px',
                fontSize: '0.80rem',
                fontWeight: 650,
                border: 'none',
                background: activeTab === 'doctor' ? '#ffffff' : 'transparent',
                color: activeTab === 'doctor' ? '#b45309' : '#64748b',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: activeTab === 'doctor' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Lock size={14} />
              <span>{isEs ? 'Acceso Médico 1-Tap (Admin)' : 'Physician 1-Tap Access (Admin)'}</span>
            </button>
          </div>
        )}

        {/* Content Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {activeTab === 'patient' ? (
            <>
              {/* Compliance & Safeguard Banner */}
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}
              >
                <ShieldCheck size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.78rem', color: '#166534', lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 700, marginBottom: '2px' }}>
                    {isEs ? 'Protección de Privacidad DHA & HIPAA' : 'DHA & HIPAA Zero-Trust Patient View'}
                  </div>
                  <div>
                    {isEs
                      ? 'Este enlace es 100% seguro para pacientes. Bloquea costes de compounding, notas internas, y acceso a otros historiales.'
                      : 'This link is 100% safe to share with patients. All wholesale manufacturing costs, internal clinical notes, and other patient dossiers are strictly hidden.'}
                  </div>
                </div>
              </div>

              {/* Direct Patient URL Box */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 650, color: '#334155', marginBottom: '6px' }}>
                  {isEs ? 'Enlace Directo de Intake y Registro de Pacientes' : 'Direct Patient Intake & Registration Link'}
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    readOnly
                    value={patientIntakeUrl}
                    style={{
                      flex: 1,
                      height: '38px',
                      padding: '0 12px',
                      fontSize: '0.80rem',
                      fontFamily: 'monospace',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      color: '#0f172a'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCopyPatientLink}
                    style={{
                      height: '38px',
                      padding: '0 16px',
                      borderRadius: '6px',
                      border: '1px solid #1a73e8',
                      background: copiedLink ? '#15803d' : '#1a73e8',
                      color: '#ffffff',
                      fontSize: '0.80rem',
                      fontWeight: 650,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {copiedLink ? <Check size={15} /> : <Copy size={15} />}
                    <span>{copiedLink ? (isEs ? 'Copiado' : 'Copied') : (isEs ? 'Copiar' : 'Copy')}</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons: WhatsApp & QR */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  style={{
                    height: '42px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#25D366',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 1px 3px rgba(37,211,102,0.3)'
                  }}
                >
                  <MessageCircle size={17} />
                  <span>{isEs ? 'Enviar por WhatsApp' : 'Send via WhatsApp'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowQr(prev => !prev)}
                  style={{
                    height: '42px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#1e293b',
                    fontSize: '0.82rem',
                    fontWeight: 650,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <QrCode size={17} color="#1a73e8" />
                  <span>{showQr ? (isEs ? 'Ocultar Código QR' : 'Hide QR Code') : (isEs ? 'Ver Código QR' : 'Show QR Code')}</span>
                </button>
              </div>

              {/* Waiting Room QR Code Display */}
              {showQr && (
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}
                >
                  <img
                    src={qrImageUrl}
                    alt="Patient Intake QR Code"
                    width={110}
                    height={110}
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      padding: '4px'
                    }}
                  />
                  <div style={{ flex: 1, fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                      {isEs ? 'Código QR para Recepción y Consulta' : 'Clinic Reception & Waiting Room QR'}
                    </div>
                    <div>
                      {isEs
                        ? 'Los pacientes pueden escanear este código con la cámara de su móvil en la sala de espera para iniciar su formulario médico.'
                        : 'Patients can scan this QR code with their mobile phone camera at front desk or in the clinic waiting room to open their intake.'}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Physician 1-Tap Access (Admin Restricted) */}
              <div
                style={{
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}
              >
                <AlertTriangle size={18} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.78rem', color: '#92400e', lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 700, marginBottom: '2px' }}>
                    {isEs ? 'Acceso Médico de Control Total (No enviar a pacientes)' : 'Physician Control Credential (DO NOT share with patients)'}
                  </div>
                  <div>
                    {isEs
                      ? 'Este enlace otorga acceso inmediato para firmar recetas, ver historiales de pacientes y autorizar dispensaciones.'
                      : 'This credential grants full physician powers: prescription sign-off, access to all patient clinical records, and compounding orders.'}
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 650, color: '#334155', marginBottom: '6px' }}>
                  {isEs ? 'Enlace Directo a Consola Médica (1-Tap)' : 'Direct Physician Console Link (1-Tap)'}
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    readOnly
                    value={doctorPortalUrl}
                    style={{
                      flex: 1,
                      height: '38px',
                      padding: '0 12px',
                      fontSize: '0.80rem',
                      fontFamily: 'monospace',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      color: '#0f172a'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCopyDoctorLink}
                    style={{
                      height: '38px',
                      padding: '0 16px',
                      borderRadius: '6px',
                      border: '1px solid #b45309',
                      background: copiedDoctorLink ? '#15803d' : '#b45309',
                      color: '#ffffff',
                      fontSize: '0.80rem',
                      fontWeight: 650,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {copiedDoctorLink ? <Check size={15} /> : <Copy size={15} />}
                    <span>{copiedDoctorLink ? (isEs ? 'Copiado' : 'Copied') : (isEs ? 'Copiar' : 'Copy')}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              height: '34px',
              padding: '0 16px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              fontSize: '0.80rem',
              fontWeight: 650,
              cursor: 'pointer'
            }}
          >
            {isEs ? 'Cerrar' : 'Done / Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
