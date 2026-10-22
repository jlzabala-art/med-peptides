"use client";

import React, { useState, useEffect, useMemo } from 'react';
import X from 'lucide-react/dist/esm/icons/x';
import MessageCircle from 'lucide-react/dist/esm/icons/message-circle';
import Mail from 'lucide-react/dist/esm/icons/mail';
import Copy from 'lucide-react/dist/esm/icons/copy';
import Check from 'lucide-react/dist/esm/icons/check';
import Stethoscope from 'lucide-react/dist/esm/icons/stethoscope';
import UserCheck from 'lucide-react/dist/esm/icons/user-check';
import Activity from 'lucide-react/dist/esm/icons/activity';
import RotateCw from 'lucide-react/dist/esm/icons/rotate-cw';
import ExternalLink from 'lucide-react/dist/esm/icons/external-link';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import Edit3 from 'lucide-react/dist/esm/icons/edit-3';
import toast from 'react-hot-toast';
import { triggerHaptic } from '@/utils/haptics';
import { FOLLOWUP_SCENARIOS, generatePatientFollowUpMessage } from '@/data/patientFollowUpTemplates';

export default function DoctorPatientFollowUpModal({
  isOpen,
  onClose,
  task = {},
  doctor = {}
}) {
  const [selectedScenario, setSelectedScenario] = useState('treatment_inquiry');
  const [language, setLanguage] = useState('es'); // 'es' | 'en'
  const [editedMessage, setEditedMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [isEditingManually, setIsEditingManually] = useState(false);

  const patientName = useMemo(() => {
    return task.patientName || task.patient?.name || 'Estimado Paciente';
  }, [task]);

  const patientPhone = useMemo(() => {
    const raw = task.patientPhone || task.patient?.phone || task.phone || task.mobile || '';
    return raw.replace(/[^0-9+]/g, '');
  }, [task]);

  const patientEmail = useMemo(() => {
    return task.patientEmail || task.patient?.email || task.email || '';
  }, [task]);

  const treatmentTitle = useMemo(() => {
    return task.treatmentTitle || task.title || task.productName || 'Tratamiento Médico Personalizado';
  }, [task]);

  const rxCode = useMemo(() => {
    return task.code || task.prescriptionNumber || task.id || '';
  }, [task]);

  const doctorName = useMemo(() => {
    return doctor.name || doctor.displayName || 'Dr. Khalid Shukri';
  }, [doctor]);

  const patientPortalUrl = useMemo(() => {
    return rxCode ? `https://www.atlashealth-services.com/rx/${encodeURIComponent(rxCode)}` : 'https://www.atlashealth-services.com';
  }, [rxCode]);

  // Update default generated message when scenario, language, or task changes
  useEffect(() => {
    if (isOpen) {
      const generated = generatePatientFollowUpMessage({
        scenario: selectedScenario,
        language,
        patientName,
        doctorName,
        treatmentTitle,
        rxCode,
        patientPortalUrl
      });
      setEditedMessage(generated);
      setIsEditingManually(false);
      setCopied(false);
    }
  }, [isOpen, selectedScenario, language, patientName, doctorName, treatmentTitle, rxCode, patientPortalUrl]);

  if (!isOpen) return null;

  const handleScenarioChange = (scenarioId) => {
    triggerHaptic('selection');
    setSelectedScenario(scenarioId);
    setIsEditingManually(false);
  };

  const handleLanguageToggle = (lang) => {
    triggerHaptic('selection');
    setLanguage(lang);
    setIsEditingManually(false);
  };

  const handleCopy = () => {
    triggerHaptic('selection');
    navigator.clipboard.writeText(editedMessage);
    setCopied(true);
    toast.success('Mensaje copiado al portapapeles ✓');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    triggerHaptic('medium');
    const cleanPhone = patientPhone.replace(/[^0-9]/g, '');
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(editedMessage)}`
      : `https://wa.me/?text=${encodeURIComponent(editedMessage)}`;
    window.open(waUrl, '_blank');
  };

  const handleOpenEmail = () => {
    triggerHaptic('medium');
    const subject = language === 'en'
      ? `Clinical Follow-up: Personalized Treatment Plan (${treatmentTitle})`
      : `Seguimiento Médico: Pauta de Tratamiento (${treatmentTitle})`;
    const mailto = `mailto:${encodeURIComponent(patientEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(editedMessage)}`;
    window.open(mailto, '_blank');
  };

  const renderIcon = (iconName) => {
    switch (iconName) {
      case 'Stethoscope': return <Stethoscope size={14} />;
      case 'UserCheck': return <UserCheck size={14} />;
      case 'Activity': return <Activity size={14} />;
      case 'RotateCw': return <RotateCw size={14} />;
      default: return <Stethoscope size={14} />;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(5px)',
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
          width: '100%',
          maxWidth: '780px',
          maxHeight: '92vh',
          background: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.28)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #dadce0'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - GCP Slate */}
        <div
          style={{
            padding: '14px 20px',
            background: '#ffffff',
            borderBottom: '1px solid #dadce0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '6px',
                background: '#e8f0fe',
                color: '#1a73e8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Stethoscope size={18} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 700, color: '#202124', letterSpacing: '-0.01em' }}>
                Previsualización de Seguimiento Clínico
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: '#5f6368' }}>
                Tono médico empático · Revisión previa por el facultativo antes del envío
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Language Switcher */}
            <div style={{ display: 'inline-flex', background: '#f1f3f4', padding: '2px', borderRadius: '4px' }}>
              <button
                type="button"
                onClick={() => handleLanguageToggle('es')}
                style={{
                  padding: '4px 8px',
                  borderRadius: '3px',
                  border: 'none',
                  background: language === 'es' ? '#ffffff' : 'transparent',
                  color: language === 'es' ? '#1a73e8' : '#5f6368',
                  fontWeight: language === 'es' ? 700 : 500,
                  fontSize: '0.72rem',
                  cursor: 'pointer'
                }}
              >
                🇪🇸 ES
              </button>
              <button
                type="button"
                onClick={() => handleLanguageToggle('en')}
                style={{
                  padding: '4px 8px',
                  borderRadius: '3px',
                  border: 'none',
                  background: language === 'en' ? '#ffffff' : 'transparent',
                  color: language === 'en' ? '#1a73e8' : '#5f6368',
                  fontWeight: language === 'en' ? 700 : 500,
                  fontSize: '0.72rem',
                  cursor: 'pointer'
                }}
              >
                🇬🇧 EN
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#5f6368',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Clinical Patient & Treatment Context Ribbon */}
        <div
          style={{
            padding: '10px 20px',
            background: '#f8f9fa',
            borderBottom: '1px solid #dadce0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#202124' }}>
              👤 {patientName}
            </span>
            <span style={{ fontSize: '0.74rem', color: '#1a73e8', background: '#e8f0fe', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
              {treatmentTitle}
            </span>
            {rxCode && (
              <span style={{ fontSize: '0.72rem', color: '#5f6368', fontFamily: 'monospace' }}>
                Ref: #{rxCode}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.74rem', color: '#5f6368' }}>
            {patientPhone && <span>📱 {patientPhone}</span>}
            {patientEmail && <span>✉️ {patientEmail}</span>}
          </div>
        </div>

        {/* Scenario Selection Tabs (4 Contexts) */}
        <div
          style={{
            padding: '10px 20px',
            background: '#ffffff',
            borderBottom: '1px solid #dadce0',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Escenario de Seguimiento Clínico:
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '8px' }}>
            {FOLLOWUP_SCENARIOS.map((s) => {
              const isActive = selectedScenario === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleScenarioChange(s.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: `1.5px solid ${isActive ? '#1a73e8' : '#dadce0'}`,
                    background: isActive ? '#e8f0fe' : '#ffffff',
                    color: isActive ? '#1a73e8' : '#3c4043',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  title={s.description}
                >
                  <span style={{ flexShrink: 0, color: isActive ? '#1a73e8' : '#5f6368' }}>
                    {renderIcon(s.icon)}
                  </span>
                  <span style={{ fontSize: '0.73rem', fontWeight: isActive ? 700 : 500, lineHeight: 1.25 }}>
                    {language === 'en' ? s.labelEn : s.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Message Editor & Preview */}
        <div
          style={{
            padding: '14px 20px',
            flex: 1,
            overflowY: 'auto',
            background: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Edit3 size={13} style={{ color: '#5f6368' }} />
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#3c4043' }}>
                Previsualización Editable del Mensaje
              </span>
              {isEditingManually && (
                <span style={{ fontSize: '0.68rem', color: '#d97706', background: '#fffbeb', padding: '1px 6px', borderRadius: '3px', fontWeight: 600 }}>
                  Editado manualmente
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                const generated = generatePatientFollowUpMessage({
                  scenario: selectedScenario,
                  language,
                  patientName,
                  doctorName,
                  treatmentTitle,
                  rxCode,
                  patientPortalUrl
                });
                setEditedMessage(generated);
                setIsEditingManually(false);
                toast.success('Texto restaurado a la plantilla original');
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#1a73e8',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Restablecer plantilla
            </button>
          </div>

          <textarea
            value={editedMessage}
            onChange={(e) => {
              setEditedMessage(e.target.value);
              setIsEditingManually(true);
            }}
            rows={10}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: '6px',
              border: '1px solid #dadce0',
              background: '#f8f9fa',
              fontSize: '0.80rem',
              lineHeight: 1.55,
              color: '#202124',
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => { e.target.style.borderColor = '#1a73e8'; e.target.style.background = '#ffffff'; }}
            onBlur={(e) => { e.target.style.borderColor = '#dadce0'; e.target.style.background = '#f8f9fa'; }}
          />

          {/* 1-Click Patient Portal Link Helper */}
          <div
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} style={{ color: '#16a34a' }} />
              <span style={{ fontSize: '0.74rem', color: '#166534', fontWeight: 600 }}>
                Enlace de Paciente (1-Click sin password):
              </span>
              <code style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700 }}>
                {patientPortalUrl}
              </code>
            </div>
            <a
              href={patientPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.70rem',
                color: '#1a73e8',
                textDecoration: 'none',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}
            >
              <span>Ver Ficha</span>
              <ExternalLink size={11} />
            </a>
          </div>
        </div>

        {/* Footer Actions - Multi-Channel Dispatch */}
        <div
          style={{
            padding: '12px 20px',
            background: '#ffffff',
            borderTop: '1px solid #dadce0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <div style={{ fontSize: '0.72rem', color: '#5f6368' }}>
            Dominio seguro: <strong style={{ color: '#1a73e8' }}>https://www.atlashealth-services.com</strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '7px 14px',
                borderRadius: '4px',
                border: '1px solid #dadce0',
                background: '#ffffff',
                color: '#3c4043',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cerrar
            </button>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '4px',
                border: '1px solid #1a73e8',
                background: '#ffffff',
                color: '#1a73e8',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {copied ? <Check size={14} style={{ color: '#16a34a' }} /> : <Copy size={14} />}
              <span>{copied ? 'Copiado ✓' : 'Copiar Mensaje'}</span>
            </button>

            {/* Email Dispatch */}
            <button
              type="button"
              onClick={handleOpenEmail}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '4px',
                border: '1px solid #dadce0',
                background: '#ffffff',
                color: '#3c4043',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Abrir en cliente de correo con asunto y cuerpo pre-rellenados"
            >
              <Mail size={14} style={{ color: '#1a73e8' }} />
              <span>Enviar por Email</span>
            </button>

            {/* WhatsApp Dispatch */}
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 16px',
                borderRadius: '4px',
                border: 'none',
                background: '#16a34a',
                color: '#ffffff',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(22, 163, 74, 0.3)'
              }}
            >
              <MessageCircle size={14} />
              <span>Enviar por WhatsApp</span>
              <ExternalLink size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
