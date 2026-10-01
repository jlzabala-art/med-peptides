"use client";

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  Phone,
  Copy,
  Check,
  Share2,
  ExternalLink,
  Download,
  Dna,
  FileText,
  Sparkles,
  ShieldCheck,
  User,
  Stethoscope
} from '@/lib/icons';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

export default function ShareIntakeWhatsAppModal({ isOpen, onClose }) {
  const { user, userProfile } = useAuth();
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientType, setRecipientType] = useState('patient'); // 'patient' | 'doctor' | 'general'
  const [lang, setLang] = useState('en');
  const [copiedType, setCopiedType] = useState(null); // 'all' | 'link'

  if (!isOpen) return null;

  const isEs = lang === 'es';
  const baseUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/rx/intake` 
    : 'https://med-peptides.com/rx/intake';

  const userEmail = user?.email || userProfile?.email || '';
  const intakeUrl = userEmail 
    ? `${baseUrl}?am=${encodeURIComponent(userEmail)}`
    : baseUrl;

  // Customized clinical message templates
  const getMessage = () => {
    if (isEs) {
      if (recipientType === 'doctor') {
        return `🩺 *Atlas Clinical Intelligence — Portal Médico de Digitalización de Prescripciones*\n\nEstimado Dr./Dra.,\n\nPuede digitalizar y verificar de forma instantánea informes genéticos de Fagron Genomics (TrichoTest™, NutriGen™, etc.) o recetas magistrales a través de nuestro portal seguro sin necesidad de registro previo:\n\n🔗 ${intakeUrl}\n\nEl motor multimodal con IA extraerá automáticamente todas las formulaciones, principios activos y pautas de dosificación.`;
      }
      return `🏥 *Atlas Clinical Platform — Portal de Subida de Recetas y Fagron Genomics*\n\nEstimado/a paciente,\n\nPuede subir directamente su informe de Fagron Genomics (TrichoTest, NutriGen, etc.) o receta médica en PDF o fotografía para su digitalización y validación inmediata:\n\n🔗 ${intakeUrl}\n\n🔒 Portal confidencial sin necesidad de registro previo.`;
    } else {
      if (recipientType === 'doctor') {
        return `🩺 *Atlas Clinical Intelligence — Prescription & Fagron Intake Portal*\n\nDear Doctor,\n\nYou can instantly digitize and clinically verify Fagron Genomics reports (TrichoTest™, NutriGen™, etc.) or medical prescriptions through our secure portal with no registration required:\n\n🔗 ${intakeUrl}\n\nAtlas AI will extract all magistral formulations, active ingredients, and posology guidelines.`;
      }
      return `🏥 *Atlas Clinical Platform — Prescription & Fagron Intake Portal*\n\nDear Patient,\n\nYou can directly upload your Fagron Genomics report (TrichoTest, NutriGen, etc.) or medical prescription in PDF or image format for clinical digitization:\n\n🔗 ${intakeUrl}\n\n🔒 Secure, confidential portal with no account required.`;
    }
  };

  const messageText = getMessage();

  const handleLaunchWhatsApp = () => {
    let cleanPhone = recipientPhone.replace(/\D/g, '');
    let url = '';
    if (cleanPhone) {
      url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(messageText)}`;
    } else {
      url = `https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopy = (type) => {
    const textToCopy = type === 'link' ? intakeUrl : messageText;
    navigator?.clipboard?.writeText(textToCopy);
    setCopiedType(type);
    toast.success(
      type === 'link' 
        ? (isEs ? 'Enlace del portal copiado al portapapeles ✓' : 'Intake link copied to clipboard ✓')
        : (isEs ? 'Mensaje para WhatsApp copiado ✓' : 'WhatsApp message copied ✓')
    );
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleDownloadQrPng = () => {
    const svg = document.getElementById('share-intake-qr');
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
      a.download = `Atlas-Intake-Portal-QR.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        padding: '1rem'
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '1.75rem',
          maxWidth: '560px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 20px 40px -8px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          border: '1px solid #e2e8f0'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#eff6ff',
              color: '#1d4ed8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              border: '1px solid #bfdbfe'
            }}>
              <Share2 size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                {isEs ? 'Compartir Portal Público de Prescripciones' : 'Share Public Prescription Intake Portal'}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                {isEs 
                  ? 'Permite a pacientes o médicos subir sus recetas y análisis genéticos para su digitalización con IA' 
                  : 'Allow patients or physicians to upload prescriptions and genomics reports for AI digitization'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '8px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Account Manager attribution notice */}
        {userEmail && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '10px',
            padding: '10px 14px',
            fontSize: '0.8rem',
            color: '#166534'
          }}>
            <ShieldCheck size={18} style={{ color: '#16a34a', flexShrink: 0 }} />
            <div>
              <strong>{isEs ? 'Atribución de Account Manager Activa:' : 'Active Account Manager Attribution:'}</strong>{' '}
              {isEs 
                ? <>Las recetas enviadas o cargadas a través de este enlace se vincularán automáticamente a tu usuario <strong>({userEmail})</strong>.</>
                : <>Prescriptions uploaded through this link will be automatically attributed to your account <strong>({userEmail})</strong>.</>}
            </div>
          </div>
        )}

        {/* Options Row: Target recipient & Language */}
        <div style={{
          display: 'flex',
          gap: '10px',
          background: '#f8fafc',
          padding: '8px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Recipient Segmented Selector */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              type="button"
              onClick={() => setRecipientType('patient')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: recipientType === 'patient' ? '#0284c7' : 'transparent',
                color: recipientType === 'patient' ? '#ffffff' : '#64748b',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <User size={13} />
              <span>{isEs ? 'Para Paciente' : 'To Patient'}</span>
            </button>

            <button
              type="button"
              onClick={() => setRecipientType('doctor')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: recipientType === 'doctor' ? '#0284c7' : 'transparent',
                color: recipientType === 'doctor' ? '#ffffff' : '#64748b',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Stethoscope size={13} />
              <span>{isEs ? 'Para Médico / Colega' : 'To Doctor / Colleague'}</span>
            </button>
          </div>

          {/* Lang Toggle */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              type="button"
              onClick={() => setLang('es')}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: 'none',
                background: lang === 'es' ? '#ffffff' : 'transparent',
                color: lang === 'es' ? '#0f172a' : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.75rem',
                boxShadow: lang === 'es' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer'
              }}
            >
              ES 🇪🇸
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: 'none',
                background: lang === 'en' ? '#ffffff' : 'transparent',
                color: lang === 'en' ? '#0f172a' : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.75rem',
                boxShadow: lang === 'en' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer'
              }}
            >
              EN 🇺🇸
            </button>
          </div>
        </div>

        {/* Optional Phone Input */}
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
            {isEs ? 'Teléfono del Destinatario (Opcional, con prefijo):' : 'Recipient Phone Number (Optional, with country code):'}
          </label>
          <input
            type="tel"
            placeholder="+34 600 000 000"
            value={recipientPhone}
            onChange={(e) => setRecipientPhone(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              fontSize: '0.88rem',
              color: '#0f172a',
              boxSizing: 'border-box',
              outline: 'none'
            }}
          />
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
            {isEs ? 'Si lo deja vacío, WhatsApp le permitirá elegir cualquier contacto o grupo al abrirse.' : 'If left empty, WhatsApp lets you pick any contact or group upon opening.'}
          </div>
        </div>

        {/* Message Preview Box */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>
              {isEs ? 'Vista Previa del Mensaje a Enviar:' : 'Message Preview:'}
            </span>
            <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700 }}>
              ✓ {isEs ? 'Enlace Directo Incluido' : 'Direct Link Included'}
            </span>
          </div>

          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '12px 14px',
            fontSize: '0.82rem',
            color: '#334155',
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            maxHeight: '130px',
            overflowY: 'auto'
          }}>
            {messageText}
          </div>
        </div>

        {/* Direct Link + QR Section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '14px',
          padding: '12px 16px'
        }}>
          <div style={{ background: '#ffffff', padding: '6px', borderRadius: '8px', border: '1px solid #cbd5e1', flexShrink: 0 }}>
            <QRCodeSVG
              id="share-intake-qr"
              value={intakeUrl}
              size={64}
              level="M"
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.74rem', color: '#15803d', fontWeight: 800 }}>
              {isEs ? 'ENLACE OFICIAL DE ACCESO PÚBLICO' : 'OFFICIAL PUBLIC INTAKE URL'}
            </div>
            <div style={{
              fontSize: '0.82rem',
              color: '#0f172a',
              fontWeight: 700,
              fontFamily: 'monospace',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {intakeUrl}
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => handleCopy('link')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0284c7',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {copiedType === 'link' ? <Check size={12} style={{ color: '#16a34a' }} /> : <Copy size={12} />}
                <span>{copiedType === 'link' ? (isEs ? 'Copiado' : 'Copied') : (isEs ? 'Copiar Enlace' : 'Copy Link')}</span>
              </button>
              <span style={{ color: '#cbd5e1' }}>•</span>
              <button
                type="button"
                onClick={handleDownloadQrPng}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Download size={12} />
                <span>{isEs ? 'Descargar QR' : 'Download QR'}</span>
              </button>
              <span style={{ color: '#cbd5e1' }}>•</span>
              <a
                href={intakeUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#0284c7',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <ExternalLink size={12} />
                <span>{isEs ? 'Abrir Portal' : 'Open Portal'}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleLaunchWhatsApp}
            style={{
              flex: '1 1 180px',
              padding: '0.75rem 1.25rem',
              borderRadius: '12px',
              background: '#25D366',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.92rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)'
            }}
          >
            <Phone size={18} />
            <span>{isEs ? 'Enviar WhatsApp' : 'Send WhatsApp'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleCopy('link')}
            style={{
              flex: '1 1 140px',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              background: '#0284c7',
              border: '1px solid #0284c7',
              color: '#ffffff',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.2)'
            }}
          >
            {copiedType === 'link' ? <Check size={16} style={{ color: '#ffffff' }} /> : <Copy size={16} />}
            <span>{copiedType === 'link' ? (isEs ? '¡Enlace Copiado!' : 'Copied!') : (isEs ? 'Copiar Enlace' : 'Copy Link')}</span>
          </button>

          <button
            type="button"
            onClick={() => window.open(intakeUrl, '_blank', 'noopener,noreferrer')}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
            title="Abrir el portal de subida en una nueva pestaña"
          >
            <ExternalLink size={16} />
            <span>{isEs ? 'Abrir Portal' : 'Open Portal'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
