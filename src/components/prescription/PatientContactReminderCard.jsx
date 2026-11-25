'use client';

import React, { useState } from 'react';
import { Bell, CheckCircle2, X } from '@/lib/icons';

/**
 * Subtle, non-intrusive patient contact capture card shown on ?view=patient
 * ONLY when phone or email is missing from Atlas. If both already exist in Atlas,
 * renders nothing so returning patients are never asked again.
 */
export default function PatientContactReminderCard({
  rxId,
  rxCode,
  existingPhone = '',
  existingEmail = '',
  isEs = false,
  onContactSaved,
}) {
  const cleanExistingPhone = String(existingPhone || '').trim();
  const cleanExistingEmail = String(existingEmail || '').trim();
  const needsPhone = !cleanExistingPhone;
  const needsEmail = !cleanExistingEmail;

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedDone, setSavedDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return sessionStorage.getItem(`atlas_contact_dismissed_${rxCode || rxId}`) === '1';
    } catch {
      return false;
    }
  });

  if ((!needsPhone && !needsEmail) || dismissed) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextPhone = needsPhone ? phone.trim() : cleanExistingPhone;
    const nextEmail = needsEmail ? email.trim() : cleanExistingEmail;

    if ((needsPhone && !phone.trim()) && (needsEmail && !email.trim())) {
      setErrorMsg(isEs ? 'Introduce tu WhatsApp o email.' : 'Please enter your WhatsApp or email.');
      return;
    }
    if (needsEmail && email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg(isEs ? 'Email no válido.' : 'Please enter a valid email.');
      return;
    }

    setErrorMsg('');
    setIsSaving(true);
    try {
      const res = await fetch('/api/prescriptions/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prescriptionId: rxId,
          code: rxCode,
          status: 'current',
          patientContactCapture: true,
          ...(needsPhone && phone.trim() ? { patientPhone: phone.trim() } : {}),
          ...(needsEmail && email.trim() ? { patientEmail: email.trim() } : {}),
        }),
      });
      if (!res.ok) {
        throw new Error('Failed to save');
      }
      setSavedDone(true);
      onContactSaved?.({
        phone: nextPhone,
        email: nextEmail,
      });
    } catch {
      setErrorMsg(isEs ? 'No se pudo guardar. Inténtalo de nuevo.' : 'Could not save right now. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (savedDone) {
    return (
      <div
        style={{
          marginTop: '14px',
          padding: '12px 16px',
          borderRadius: '10px',
          border: '1px solid #bbf7d0',
          background: '#f0fdf4',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.82rem',
          fontWeight: 600,
          color: '#166534',
        }}
      >
        <CheckCircle2 size={16} color="#16a34a" />
        <span>
          {isEs
            ? 'Guardado ✓ Te avisaremos cuando toque renovar tu fórmula.'
            : 'Saved ✓ We will send your BUD & refill reminder there.'}
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: '14px',
        padding: '14px 16px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        background: '#f8fafc',
        position: 'relative',
      }}
    >
      <button
        type="button"
        aria-label={isEs ? 'Cerrar aviso' : 'Dismiss'}
        onClick={() => {
          setDismissed(true);
          try {
            sessionStorage.setItem(`atlas_contact_dismissed_${rxCode || rxId}`, '1');
          } catch { /* ignore */ }
        }}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          border: 'none',
          background: 'transparent',
          color: '#94a3b8',
          cursor: 'pointer',
          padding: '4px',
          display: 'inline-flex',
        }}
      >
        <X size={15} />
      </button>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', paddingRight: '24px' }}>
        <div
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '8px',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Bell size={15} color="#1d4ed8" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
            {isEs ? 'Guarda tu guía y aviso de caducidad' : 'Save your guide & BUD reminder'}
          </div>
          <div style={{ fontSize: '0.76rem', color: '#475569', lineHeight: 1.45, marginBottom: '10px' }}>
            {isEs
              ? 'Añade tu dato de contacto para recibir el recordatorio de caducidad (BUD) y una copia privada de esta guía.'
              : 'Add your contact details to receive your Beyond-Use Date (BUD) refill reminder and a private copy of this guide.'}
          </div>

          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              alignItems: 'center',
            }}
          >
            {needsPhone && (
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={isEs ? 'WhatsApp (ej. +34 600...)' : 'WhatsApp (e.g. +971 50...)'}
                style={{
                  flex: '1 1 170px',
                  minHeight: '38px',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '0.8rem',
                  color: '#0f172a',
                }}
              />
            )}
            {needsEmail && (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isEs ? 'Email personal' : 'Personal email'}
                style={{
                  flex: '1 1 190px',
                  minHeight: '38px',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '0.8rem',
                  color: '#0f172a',
                }}
              />
            )}
            <button
              type="submit"
              disabled={isSaving}
              style={{
                minHeight: '38px',
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                background: '#003666',
                color: '#ffffff',
                fontSize: '0.78rem',
                fontWeight: 650,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.7 : 1,
                whiteSpace: 'nowrap',
              }}
            >
              {isSaving ? (isEs ? 'Guardando...' : 'Saving...') : (isEs ? 'Guardar' : 'Save')}
            </button>
          </form>
          {errorMsg && (
            <div style={{ marginTop: '6px', fontSize: '0.73rem', color: '#dc2626', fontWeight: 600 }}>
              {errorMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
