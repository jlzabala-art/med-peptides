"use client";

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Phone,
  Copy,
  Check,
  Share2,
  ExternalLink,
  Download,
  ShieldCheck,
  User,
  Stethoscope,
  FileText
} from '@/lib/icons';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import StandardDrawer from '@/components/ui/StandardDrawer';

export default function ShareIntakeWhatsAppModal({ isOpen, onClose, rx = null }) {
  const { user, userProfile } = useAuth();
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientType, setRecipientType] = useState('patient'); // 'patient' | 'doctor'
  const [shareMode, setShareMode] = useState(rx ? 'dossier' : 'intake'); // 'dossier' | 'intake'
  const [lang, setLang] = useState('en');
  const [copiedType, setCopiedType] = useState(null); // 'all' | 'link'

  useEffect(() => {
    if (rx) {
      setShareMode('dossier');
    } else {
      setShareMode('intake');
    }
  }, [rx]);

  if (!isOpen) return null;

  const isEs = lang === 'es';
  const origin = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://med-peptides.com';

  const userEmail = user?.email || userProfile?.email || '';
  
  // URLs
  const intakeBaseUrl = `${origin}/rx/intake`;
  const intakeUrl = userEmail 
    ? `${intakeBaseUrl}?am=${encodeURIComponent(userEmail)}`
    : intakeBaseUrl;

  const primaryRxId = (rx?._sessionMembers && rx?._sessionMembers[0]?.id) || rx?.id || '';
  const rxCode = rx?.prescriptionNumber || rx?.code || primaryRxId;
  const rxDossierUrl = `${origin}/rx/${encodeURIComponent(rxCode)}`;

  const activeUrl = (shareMode === 'dossier' && rx) ? rxDossierUrl : intakeUrl;
  const patientName = rx?.patient?.name || rx?.patientName || 'Patient';
  const doctorName = rx?.doctor?.name || rx?.doctorName || 'Prescribing Physician';

  const isMultiPart = Boolean(rx?._isSessionGroup || (rx?._sessionMembers && rx?._sessionMembers.length > 1));
  const partsCount = rx?._sessionCount || rx?._sessionMembers?.length || (rx?.totalParts || 0);
  const testName = rx?.fagron?.testName || 'NutriGen';

  // Clinical message templates
  const getMessage = () => {
    if (shareMode === 'dossier' && rx) {
      if (isMultiPart) {
        const partsList = (rx._sessionMembers || []).map((m, idx) => {
          const partNum = m.partNumber || idx + 1;
          const items = m.prescriptionLines || m.items || [];
          const itemNames = items.slice(0, 3).map(i => i.productName || i.name).filter(Boolean);
          const moreCount = items.length > 3 ? ` +${items.length - 3} more` : '';
          return isEs
            ? `• Parte ${partNum} (${items.length} principios activos): ${itemNames.join(', ')}${moreCount}`
            : `• Part ${partNum} (${items.length} active ingredients): ${itemNames.join(', ')}${moreCount}`;
        }).join('\n');

        if (isEs) {
          return `📋 *Atlas Clinical Platform — Expediente Integral Fagron ${testName}*\n\nEstimado/a ${patientName},\n\nPuede acceder a su prescripción genética multiparte digitalizada (#${rxCode}), que incluye *${partsCount} fórmulas magistrales secuenciales* con su pauta posológica completa:\n\n${partsList}\n\n🔗 ${rxDossierUrl}\n\n🔒 Prescrito y verificado por ${doctorName}.`;
        }
        return `📋 *Atlas Clinical Platform — Comprehensive Fagron ${testName} Dossier*\n\nDear ${patientName},\n\nYou can access your verified multi-part genetic prescription (#${rxCode}), which includes *${partsCount} sequential compounded formulations* with customized administration schedules:\n\n${partsList}\n\n🔗 ${rxDossierUrl}\n\n🔒 Prescribed & clinically verified by ${doctorName}.`;
      }

      if (isEs) {
        return `📋 *Atlas Clinical Platform — Expediente de Prescripción Digital*\n\nEstimado/a ${patientName},\n\nPuede acceder a su prescripción médica digitalizada (#${rxCode}), pautas de administración, calendario de dosificación y verificación clínica a través del siguiente enlace seguro:\n\n🔗 ${rxDossierUrl}\n\n🔒 Verificado por ${doctorName}.`;
      }
      return `📋 *Atlas Clinical Platform — Digital Prescription Dossier*\n\nDear ${patientName},\n\nYou can access your verified digital prescription (#${rxCode}), administration protocol, posology schedule, and clinical verification via the following secure link:\n\n🔗 ${rxDossierUrl}\n\n🔒 Prescribed & verified by ${doctorName}.`;
    }

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
    const textToCopy = type === 'link' ? activeUrl : messageText;
    navigator?.clipboard?.writeText(textToCopy);
    setCopiedType(type);
    toast.success(
      type === 'link' 
        ? (isEs ? 'Enlace copiado al portapapeles ✓' : 'Link copied to clipboard ✓')
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
      a.download = rx ? `Atlas-Rx-${rxCode}-QR.png` : `Atlas-Intake-Portal-QR.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const drawerTitle = rx 
    ? (isEs ? `Compartir Prescripción #${rxCode}` : `Share Prescription #${rxCode}`)
    : (isEs ? 'Compartir Portal Público de Prescripciones' : 'Share Public Prescription Intake Portal');

  const drawerSubtitle = rx 
    ? (isEs ? `Paciente: ${patientName}` : `Patient: ${patientName}`)
    : (isEs ? 'Permite a pacientes o médicos subir recetas para digitalización IA' : 'Allow patients or physicians to upload prescriptions for AI digitization');

  // GCP Console standard sticky footer actions
  const drawerFooter = (
    <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
      <button
        type="button"
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: '#5f6368',
          fontSize: '13px',
          fontWeight: 500,
          cursor: 'pointer',
          padding: '8px 12px',
          borderRadius: '4px',
          transition: 'background 0.15s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f1f3f4'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
      >
        {isEs ? 'Cerrar' : 'Close'}
      </button>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => handleCopy('link')}
          style={{
            height: '36px',
            padding: '0 14px',
            borderRadius: '4px',
            background: '#ffffff',
            border: '1px solid #dadce0',
            color: '#1a73e8',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'background 0.15s ease, border-color 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f8fafd';
            e.currentTarget.style.borderColor = '#1a73e8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.borderColor = '#dadce0';
          }}
        >
          {copiedType === 'link' ? <Check size={14} style={{ color: '#137333' }} /> : <Copy size={14} />}
          <span>{copiedType === 'link' ? (isEs ? 'Copiado' : 'Copied') : (isEs ? 'Copiar Enlace' : 'Copy Link')}</span>
        </button>

        <button
          type="button"
          onClick={() => window.open(activeUrl, '_blank', 'noopener,noreferrer')}
          style={{
            height: '36px',
            padding: '0 12px',
            borderRadius: '4px',
            background: '#ffffff',
            border: '1px solid #dadce0',
            color: '#3c4043',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f1f3f4'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
          title={isEs ? 'Abrir enlace en pestaña nueva' : 'Open link in new tab'}
        >
          <ExternalLink size={14} color="#5f6368" />
          <span>{isEs ? 'Abrir' : 'Open'}</span>
        </button>

        <button
          type="button"
          onClick={handleLaunchWhatsApp}
          style={{
            height: '36px',
            padding: '0 16px',
            borderRadius: '4px',
            background: '#1e8e3e',
            color: '#ffffff',
            border: 'none',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#188038'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#1e8e3e'; }}
        >
          <Phone size={14} />
          <span>{isEs ? 'Enviar vía WhatsApp' : 'Send via WhatsApp'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <StandardDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={drawerTitle}
      subtitle={drawerSubtitle}
      width="560px"
      footer={drawerFooter}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* GCP Underline Tabs */}
        {rx && (
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #dadce0',
            gap: '24px',
            marginTop: '-0.25rem',
          }}>
            <button
              type="button"
              onClick={() => setShareMode('dossier')}
              style={{
                padding: '8px 0 10px 0',
                border: 'none',
                background: 'transparent',
                color: shareMode === 'dossier' ? '#1a73e8' : '#5f6368',
                fontWeight: 500,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                borderBottom: shareMode === 'dossier' ? '2px solid #1a73e8' : '2px solid transparent',
                marginBottom: '-1px',
                transition: 'color 0.15s ease, border-color 0.15s ease',
              }}
            >
              <FileText size={15} color={shareMode === 'dossier' ? '#1a73e8' : '#5f6368'} />
              <span>{isEs ? 'Expediente del Paciente' : 'Patient Rx Dossier'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShareMode('intake')}
              style={{
                padding: '8px 0 10px 0',
                border: 'none',
                background: 'transparent',
                color: shareMode === 'intake' ? '#1a73e8' : '#5f6368',
                fontWeight: 500,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                borderBottom: shareMode === 'intake' ? '2px solid #1a73e8' : '2px solid transparent',
                marginBottom: '-1px',
                transition: 'color 0.15s ease, border-color 0.15s ease',
              }}
            >
              <Share2 size={15} color={shareMode === 'intake' ? '#1a73e8' : '#5f6368'} />
              <span>{isEs ? 'Portal de Subida General' : 'General Intake Portal'}</span>
            </button>
          </div>
        )}

        {/* GCP Account Manager attribution notice */}
        {userEmail && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: '#e6f4ea',
            border: '1px solid #ceead6',
            borderRadius: '4px',
            padding: '10px 14px',
            fontSize: '12px',
            color: '#137333',
            lineHeight: 1.4,
          }}>
            <ShieldCheck size={16} style={{ color: '#137333', flexShrink: 0 }} />
            <div>
              <strong style={{ fontWeight: 600 }}>{isEs ? 'Atribución de Account Manager:' : 'Account Manager Attribution:'}</strong>{' '}
              {isEs 
                ? <>Vinculado a <strong>({userEmail})</strong>.</>
                : <>Attributed to <strong>({userEmail})</strong>.</>}
            </div>
          </div>
        )}

        {/* Options Row: Target recipient & Language (GCP standard segmented controls) */}
        <div style={{
          display: 'flex',
          gap: '12px',
          padding: '8px 12px',
          background: '#f8f9fa',
          borderRadius: '4px',
          border: '1px solid #dadce0',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Recipient Segmented Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#5f6368', fontWeight: 500 }}>
              {isEs ? 'Audiencia:' : 'Audience:'}
            </span>
            <div style={{ display: 'inline-flex', border: '1px solid #dadce0', borderRadius: '4px', overflow: 'hidden', background: '#ffffff' }}>
              <button
                type="button"
                onClick={() => setRecipientType('patient')}
                style={{
                  padding: '5px 12px',
                  border: 'none',
                  background: recipientType === 'patient' ? '#e8f0fe' : '#ffffff',
                  color: recipientType === 'patient' ? '#1a73e8' : '#3c4043',
                  fontWeight: recipientType === 'patient' ? 500 : 400,
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  borderRight: shareMode === 'intake' ? '1px solid #dadce0' : 'none',
                }}
              >
                <User size={13} color={recipientType === 'patient' ? '#1a73e8' : '#5f6368'} />
                <span>{isEs ? 'Para Paciente' : 'To Patient'}</span>
              </button>

              {shareMode === 'intake' && (
                <button
                  type="button"
                  onClick={() => setRecipientType('doctor')}
                  style={{
                    padding: '5px 12px',
                    border: 'none',
                    background: recipientType === 'doctor' ? '#e8f0fe' : '#ffffff',
                    color: recipientType === 'doctor' ? '#1a73e8' : '#3c4043',
                    fontWeight: recipientType === 'doctor' ? 500 : 400,
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <Stethoscope size={13} color={recipientType === 'doctor' ? '#1a73e8' : '#5f6368'} />
                  <span>{isEs ? 'Para Médico' : 'To Doctor'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Lang Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#5f6368', fontWeight: 500 }}>
              {isEs ? 'Idioma:' : 'Language:'}
            </span>
            <div style={{ display: 'inline-flex', border: '1px solid #dadce0', borderRadius: '4px', overflow: 'hidden', background: '#ffffff' }}>
              <button
                type="button"
                onClick={() => setLang('en')}
                style={{
                  padding: '4px 10px',
                  border: 'none',
                  borderRight: '1px solid #dadce0',
                  background: lang === 'en' ? '#e8f0fe' : '#ffffff',
                  color: lang === 'en' ? '#1a73e8' : '#5f6368',
                  fontWeight: lang === 'en' ? 600 : 400,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang('es')}
                style={{
                  padding: '4px 10px',
                  border: 'none',
                  background: lang === 'es' ? '#e8f0fe' : '#ffffff',
                  color: lang === 'es' ? '#1a73e8' : '#5f6368',
                  fontWeight: lang === 'es' ? 600 : 400,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                ES
              </button>
            </div>
          </div>
        </div>

        {/* GCP Form Input */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#3c4043', marginBottom: '4px' }}>
            {isEs ? 'Teléfono del Destinatario (Opcional, con prefijo):' : 'Recipient Phone Number (Optional, with country code):'}
          </label>
          <input
            type="tel"
            placeholder="+1 555 000 0000"
            value={recipientPhone}
            onChange={(e) => setRecipientPhone(e.target.value)}
            style={{
              width: '100%',
              height: '36px',
              padding: '0 12px',
              borderRadius: '4px',
              border: '1px solid #dadce0',
              fontSize: '13px',
              color: '#202124',
              backgroundColor: '#ffffff',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#1a73e8';
              e.target.style.boxShadow = '0 0 0 1px #1a73e8';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#dadce0';
              e.target.style.boxShadow = 'none';
            }}
          />
          <div style={{ fontSize: '11px', color: '#5f6368', marginTop: '4px' }}>
            {isEs ? 'Si lo deja vacío, WhatsApp le permitirá elegir cualquier contacto o grupo.' : 'If left empty, WhatsApp lets you pick any contact or group.'}
          </div>
        </div>

        {/* Message Preview Box */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#3c4043' }}>
              {isEs ? 'Vista Previa del Mensaje:' : 'Message Preview:'}
            </span>
            <span style={{
              fontSize: '11px',
              color: '#137333',
              background: '#e6f4ea',
              border: '1px solid #ceead6',
              borderRadius: '4px',
              padding: '1px 6px',
              fontWeight: 500,
            }}>
              ✓ {isEs ? 'Enlace Directo Incluido' : 'Direct Link Included'}
            </span>
          </div>

          <div style={{
            background: '#f8f9fa',
            border: '1px solid #dadce0',
            borderRadius: '4px',
            padding: '12px 14px',
            fontSize: '12px',
            color: '#3c4043',
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap',
            fontFamily: 'Roboto, -apple-system, sans-serif',
            maxHeight: '130px',
            overflowY: 'auto',
          }}>
            {messageText}
          </div>
        </div>

        {/* Direct Link + QR Section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          background: '#ffffff',
          border: '1px solid #dadce0',
          borderRadius: '4px',
          padding: '12px 16px',
        }}>
          <div style={{ background: '#ffffff', padding: '6px', borderRadius: '4px', border: '1px solid #dadce0', flexShrink: 0 }}>
            <QRCodeSVG
              id="share-intake-qr"
              value={activeUrl}
              size={64}
              level="M"
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '11px', color: '#5f6368', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {shareMode === 'dossier' 
                ? (isEs ? 'Enlace Directo al Expediente' : 'Direct Prescription Dossier URL')
                : (isEs ? 'Enlace Oficial de Acceso Público' : 'Official Public Intake URL')}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#202124',
              fontFamily: "'Roboto Mono', SFMono-Regular, monospace",
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              background: '#f1f3f4',
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid #dadce0',
              marginTop: '4px',
            }}>
              {activeUrl}
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => handleCopy('link')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1a73e8',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  padding: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {copiedType === 'link' ? <Check size={12} style={{ color: '#137333' }} /> : <Copy size={12} />}
                <span>{copiedType === 'link' ? (isEs ? 'Copiado' : 'Copied') : (isEs ? 'Copiar Enlace' : 'Copy Link')}</span>
              </button>
              <span style={{ color: '#dadce0' }}>•</span>
              <button
                type="button"
                onClick={handleDownloadQrPng}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#5f6368',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  padding: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Download size={12} />
                <span>{isEs ? 'Descargar QR' : 'Download QR'}</span>
              </button>
              <span style={{ color: '#dadce0' }}>•</span>
              <a
                href={activeUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#1a73e8',
                  fontSize: '12px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <ExternalLink size={12} />
                <span>{isEs ? 'Abrir Enlace' : 'Open Link'}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </StandardDrawer>
  );
}

