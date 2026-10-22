"use client";

import React, { useState, useEffect, useMemo } from 'react';
import X from 'lucide-react/dist/esm/icons/x';
import Key from 'lucide-react/dist/esm/icons/key';
import Copy from 'lucide-react/dist/esm/icons/copy';
import Check from 'lucide-react/dist/esm/icons/check';
import ExternalLink from 'lucide-react/dist/esm/icons/external-link';
import MessageCircle from 'lucide-react/dist/esm/icons/message-circle';
import Mail from 'lucide-react/dist/esm/icons/mail';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import Clock from 'lucide-react/dist/esm/icons/clock';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import toast from 'react-hot-toast';
import { triggerHaptic } from '@/utils/haptics';
import { generateDoctorWelcomeWhatsApp, generateDoctorWelcomeEmail } from '@/data/doctorOnboardingTemplates';

export default function DoctorAccessLinkModal({
  isOpen,
  onClose,
  doctor
}) {
  const [selectedFormat, setSelectedFormat] = useState('whatsapp'); // 'whatsapp' | 'email'
  const [durationHours, setDurationHours] = useState(24);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState(null);
  const [copied, setCopied] = useState(false);

  // Derive doctor info
  const docName = useMemo(() => {
    if (!doctor) return 'Doctor';
    return doctor.displayName || [doctor.firstName, doctor.lastName].filter(Boolean).join(' ') || doctor.name || 'Physician';
  }, [doctor]);

  const docSlug = useMemo(() => {
    if (!doctor) return '';
    return doctor.slug || doctor.id || '';
  }, [doctor]);

  const docPhone = useMemo(() => {
    if (!doctor) return '';
    return doctor.phone || doctor.mobile || '';
  }, [doctor]);

  const docEmail = useMemo(() => {
    if (!doctor) return '';
    return doctor.email || doctor.secondaryEmail || '';
  }, [doctor]);

  const docClinic = useMemo(() => {
    if (!doctor) return '';
    return doctor.clinicName || doctor.clinic || 'Specialized Clinic';
  }, [doctor]);

  // Reset or auto-generate when doctor changes
  useEffect(() => {
    if (isOpen && doctor) {
      setGeneratedData(null);
      setCopied(false);
    }
  }, [isOpen, doctor]);

  if (!isOpen || !doctor) return null;

  const handleGenerateLink = async () => {
    triggerHaptic('medium');
    setIsGenerating(true);
    try {
      const res = await fetch('/api/doctor/request-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorSlug: docSlug,
          phone: docPhone,
          email: docEmail,
          rememberDevice: true,
          expiresInHours: Number(durationHours) || 24
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate access link.');
      }

      setGeneratedData(data);
      toast.success(`1-Tap Access link generated (${durationHours}h validity)`);
    } catch (err) {
      console.error('Error generating link:', err);
      toast.error(err.message || 'Could not generate link.');
    } finally {
      setIsGenerating(false);
    }
  };

  const currentAccessUrl = generatedData?.accessUrl || `https://www.atlashealth-services.com/dr/${encodeURIComponent(docSlug)}?magic_token=[GENERATE_TOKEN]`;

  const whatsappMessage = generateDoctorWelcomeWhatsApp({
    doctorName: docName,
    accessUrl: currentAccessUrl,
    durationHours: Number(durationHours) || 24
  });

  const emailData = generateDoctorWelcomeEmail({
    doctorName: docName,
    accessUrl: currentAccessUrl,
    durationHours: Number(durationHours) || 24,
    clinicName: docClinic
  });

  const handleCopy = () => {
    triggerHaptic('selection');
    const textToCopy = selectedFormat === 'whatsapp'
      ? whatsappMessage
      : `Subject: ${emailData.subject}\n\n${emailData.body}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success(`${selectedFormat === 'whatsapp' ? 'WhatsApp message' : 'Email text'} copied to clipboard!`);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    triggerHaptic('medium');
    const cleanPhone = docPhone.replace(/[^0-9]/g, '');
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`
      : `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(waUrl, '_blank');
  };

  const handleOpenEmail = () => {
    triggerHaptic('medium');
    const mailto = `mailto:${encodeURIComponent(docEmail)}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
    window.open(mailto, '_blank');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(15, 23, 42, 0.7)',
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
          width: '100%',
          maxWidth: '780px',
          maxHeight: '90vh',
          background: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #dadce0'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - GCP Slate / Google Blue */}
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
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                background: '#e8f0fe',
                color: '#1a73e8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Key size={17} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#202124', letterSpacing: '-0.01em' }}>
                1-Tap Access & Onboarding Dispatch
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: '#5f6368' }}>
                Atlas Health Services · Direct Physician Portal Authorization
              </p>
            </div>
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

        {/* Doctor Summary Banner */}
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
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#202124' }}>
              {docName}
            </span>
            <span style={{ fontSize: '0.74rem', color: '#5f6368', marginLeft: '8px' }}>
              ({docClinic})
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.74rem', color: '#3c4043' }}>
            {docPhone && <span>📱 {docPhone}</span>}
            {docEmail && <span>✉️ {docEmail}</span>}
          </div>
        </div>

        {/* Configuration Toolbar */}
        <div
          style={{
            padding: '12px 20px',
            background: '#ffffff',
            borderBottom: '1px solid #dadce0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          {/* Format Selector: Option 1 (WhatsApp) vs Option 2 (Email) */}
          <div style={{ display: 'inline-flex', background: '#f1f3f4', padding: '3px', borderRadius: '6px' }}>
            <button
              type="button"
              onClick={() => { triggerHaptic('selection'); setSelectedFormat('whatsapp'); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '4px',
                border: 'none',
                background: selectedFormat === 'whatsapp' ? '#ffffff' : 'transparent',
                color: selectedFormat === 'whatsapp' ? '#166534' : '#5f6368',
                fontWeight: selectedFormat === 'whatsapp' ? 700 : 500,
                fontSize: '0.78rem',
                cursor: 'pointer',
                boxShadow: selectedFormat === 'whatsapp' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <MessageCircle size={14} />
              <span>Option 1: WhatsApp (1-Tap Mobile)</span>
            </button>

            <button
              type="button"
              onClick={() => { triggerHaptic('selection'); setSelectedFormat('email'); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '4px',
                border: 'none',
                background: selectedFormat === 'email' ? '#ffffff' : 'transparent',
                color: selectedFormat === 'email' ? '#1a73e8' : '#5f6368',
                fontWeight: selectedFormat === 'email' ? 700 : 500,
                fontSize: '0.78rem',
                cursor: 'pointer',
                boxShadow: selectedFormat === 'email' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <Mail size={14} />
              <span>Option 2: Formal Email Letter</span>
            </button>
          </div>

          {/* Duration Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={14} style={{ color: '#5f6368' }} />
            <span style={{ fontSize: '0.74rem', color: '#5f6368', fontWeight: 600 }}>Link Validity:</span>
            <select
              value={durationHours}
              onChange={(e) => setDurationHours(Number(e.target.value))}
              style={{
                padding: '5px 10px',
                borderRadius: '4px',
                border: '1px solid #dadce0',
                fontSize: '0.76rem',
                fontWeight: 600,
                color: '#202124',
                background: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <option value={24}>24 Hours (Standard · Recommended)</option>
              <option value={48}>48 Hours</option>
              <option value={168}>7 Days (Extended Onboarding)</option>
              <option value={1}>1 Hour (Strict)</option>
            </select>

            <button
              type="button"
              onClick={handleGenerateLink}
              disabled={isGenerating}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '4px',
                border: 'none',
                background: '#1a73e8',
                color: '#ffffff',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: isGenerating ? 'wait' : 'pointer',
                opacity: isGenerating ? 0.7 : 1,
                boxShadow: '0 1px 2px rgba(26, 115, 232, 0.3)'
              }}
            >
              {isGenerating ? <Loader2 size={13} className="spin" /> : <Sparkles size={13} />}
              <span>{generatedData ? 'Re-generate Token' : 'Generate 1-Tap Token'}</span>
            </button>
          </div>
        </div>

        {/* Content Body: Preview */}
        <div
          style={{
            padding: '16px 20px',
            flex: 1,
            overflowY: 'auto',
            background: '#ffffff'
          }}
        >
          {/* Status info bar */}
          <div
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              background: generatedData ? '#f0fdf4' : '#fffbeb',
              border: `1px solid ${generatedData ? '#bbf7d0' : '#fef08a'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} style={{ color: generatedData ? '#16a34a' : '#d97706' }} />
              <span style={{ fontSize: '0.76rem', color: generatedData ? '#166534' : '#92400e', fontWeight: 600 }}>
                {generatedData
                  ? `Active 24h Token: ${generatedData.magicToken?.slice(0, 16)}... (Expires: ${new Date(generatedData.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
                  : 'Click "Generate 1-Tap Token" to issue a live token or copy the preview template below.'}
              </span>
            </div>
            <span style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 600 }}>
              Authorized for 90 Days Upon 1st Click
            </span>
          </div>

          {/* Formatted Text Box */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                fontFamily: selectedFormat === 'whatsapp' ? 'inherit' : 'monospace',
                fontSize: selectedFormat === 'whatsapp' ? '0.82rem' : '0.78rem',
                lineHeight: 1.55,
                color: '#202124',
                background: '#f8f9fa',
                border: '1px solid #dadce0',
                borderRadius: '6px',
                padding: '14px 16px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                maxHeight: '340px',
                overflowY: 'auto'
              }}
            >
              {selectedFormat === 'whatsapp' ? (
                whatsappMessage
              ) : (
                <>
                  <div style={{ fontWeight: 700, color: '#1a73e8', marginBottom: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                    Subject: {emailData.subject}
                  </div>
                  {emailData.body}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions - GCP Style */}
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
            🔒 Public Domain: <code style={{ color: '#1a73e8', fontWeight: 700 }}>https://www.atlashealth-services.com</code>
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
              Close
            </button>

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
              <span>{copied ? 'Copied ✓' : 'Copy Message & Link'}</span>
            </button>

            {selectedFormat === 'whatsapp' ? (
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
                <span>Open in WhatsApp</span>
                <ExternalLink size={12} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOpenEmail}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 16px',
                  borderRadius: '4px',
                  border: 'none',
                  background: '#1a73e8',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(26, 115, 232, 0.3)'
                }}
              >
                <Mail size={14} />
                <span>Open in Email Client</span>
                <ExternalLink size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
