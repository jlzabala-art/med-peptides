'use client';

import React, { useState, useMemo } from 'react';
import { Bell, CheckCircle2, AlertCircle, X } from '@/lib/icons';
import InternationalPhoneInput from '@/components/ui/InternationalPhoneInput';

const COMMON_DOMAIN_TYPOS = {
  'gamil.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gmail.con': 'gmail.com',
  'hotmial.com': 'hotmail.com',
  'hotmal.com': 'hotmail.com',
  'hotmail.con': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outllok.com': 'outlook.com',
  'yaho.com': 'yahoo.com',
  'yahoo.con': 'yahoo.com',
  'iclud.com': 'icloud.com',
  'icoud.com': 'icloud.com',
};

function getEmailSuggestion(rawEmail) {
  const trimmed = String(rawEmail || '').trim().toLowerCase();
  const atIdx = trimmed.indexOf('@');
  if (atIdx < 1) return null;
  const local = trimmed.slice(0, atIdx);
  const domain = trimmed.slice(atIdx + 1);
  if (COMMON_DOMAIN_TYPOS[domain]) {
    return `${local}@${COMMON_DOMAIN_TYPOS[domain]}`;
  }
  return null;
}

function isValidEmailFormat(rawEmail) {
  return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(String(rawEmail || '').trim());
}

function getPhoneDigitCount(rawPhone) {
  return String(rawPhone || '').replace(/\D/g, '').length;
}

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
  const [phonePrefix, setPhonePrefix] = useState(isEs ? '+34' : '+971');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
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

  const emailTrimmed = email.trim();
  const emailSuggestion = useMemo(() => getEmailSuggestion(emailTrimmed), [emailTrimmed]);
  const emailValid = emailTrimmed.length > 0 && isValidEmailFormat(emailTrimmed) && !emailSuggestion;
  const emailHasError = emailTouched && emailTrimmed.length > 0 && !isValidEmailFormat(emailTrimmed);

  const localDigits = phoneNumber.replace(/\D/g, '');
  const fullPhone = localDigits.length > 0 ? `${phonePrefix} ${phoneNumber.trim()}`.trim() : phone.trim();
  const fullDigits = getPhoneDigitCount(fullPhone);
  const phoneEntered = localDigits.length > 0 || phone.trim().length > 0;
  const phoneValid = phoneEntered && fullDigits >= 8 && fullDigits <= 15;
  const phoneTooShort = phoneEntered && fullDigits > 0 && fullDigits < 8;

  if ((!needsPhone && !needsEmail) || dismissed) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextPhone = needsPhone ? (phoneEntered ? fullPhone : '') : cleanExistingPhone;
    const nextEmail = needsEmail ? emailTrimmed : cleanExistingEmail;

    if ((needsPhone && !phoneEntered) && (needsEmail && !emailTrimmed)) {
      setErrorMsg(
        isEs
          ? 'Introduce tu WhatsApp (con prefijo de país) o tu email personal.'
          : 'Please enter your WhatsApp (with country code) or personal email.'
      );
      return;
    }
    if (needsPhone && phoneEntered && !phoneValid) {
      setErrorMsg(
        isEs
          ? 'Revisa tu número de WhatsApp: selecciona el país e introduce entre 8 y 15 dígitos.'
          : 'Check your WhatsApp number: pick your country code and enter 8–15 digits.'
      );
      return;
    }
    if (needsEmail && emailTrimmed && !isValidEmailFormat(emailTrimmed)) {
      setEmailTouched(true);
      setErrorMsg(
        isEs
          ? 'El email no parece válido (ejemplo: nombre@gmail.com).'
          : 'Email format looks invalid (e.g. name@gmail.com).'
      );
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
          ...(needsPhone && nextPhone ? { patientPhone: nextPhone } : {}),
          ...(needsEmail && nextEmail ? { patientEmail: nextEmail } : {}),
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
          <div style={{ fontSize: '0.76rem', color: '#475569', lineHeight: 1.45, marginBottom: '12px' }}>
            {isEs
              ? 'Añade tu dato de contacto para recibir el recordatorio de caducidad (BUD) y una copia privada de esta guía.'
              : 'Add your contact details to receive your Beyond-Use Date (BUD) refill reminder and a private copy of this guide.'}
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'flex-start' }}>
              {needsPhone && (
                <div style={{ flex: '1 1 230px', minWidth: 0 }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.71rem',
                      fontWeight: 700,
                      color: '#334155',
                      marginBottom: '4px',
                    }}
                  >
                    <span>{isEs ? 'WhatsApp (elige país)' : 'WhatsApp (select country)'}</span>
                    {phoneValid && (
                      <span style={{ color: '#16a34a', fontWeight: 700 }}>
                        ✓ {isEs ? 'Formato válido' : 'Valid'}
                      </span>
                    )}
                  </label>
                  <InternationalPhoneInput
                    phonePrefix={phonePrefix}
                    onPrefixChange={(prefix) => setPhonePrefix(prefix)}
                    phoneNumber={phoneNumber}
                    onPhoneNumberChange={(num) => {
                      setPhoneNumber(num);
                      if (errorMsg) setErrorMsg('');
                    }}
                    onChange={(fullVal) => setPhone(typeof fullVal === 'string' ? fullVal : '')}
                    countryHint={isEs ? 'ES' : 'AE'}
                    lang={isEs ? 'es' : 'en'}
                    placeholder={isEs ? '600 123 456' : '50 123 4567'}
                  />
                  <div style={{ fontSize: '0.68rem', color: phoneTooShort ? '#d97706' : '#64748b', marginTop: '4px', lineHeight: 1.35 }}>
                    {phoneTooShort
                      ? (isEs
                          ? 'Faltan dígitos: escribe tu número sin repetir el prefijo.'
                          : 'Too short: enter your local digits without repeating the country code.')
                      : (isEs
                          ? 'Escribe solo el número local sin el 0 inicial (el prefijo ya está incluido).'
                          : 'Enter local digits only without leading 0 (country code is included).')}
                  </div>
                </div>
              )}

              {needsEmail && (
                <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                  <label
                    htmlFor="patient-reminder-email"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.71rem',
                      fontWeight: 700,
                      color: '#334155',
                      marginBottom: '4px',
                    }}
                  >
                    <span>{isEs ? 'Email personal' : 'Personal email'}</span>
                    {emailValid && (
                      <span style={{ color: '#16a34a', fontWeight: 700 }}>
                        ✓ {isEs ? 'Válido' : 'Valid'}
                      </span>
                    )}
                  </label>
                  <input
                    id="patient-reminder-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    onBlur={() => setEmailTouched(true)}
                    placeholder={isEs ? 'nombre@gmail.com' : 'name@gmail.com'}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      minHeight: '42px',
                      padding: '8px 11px',
                      borderRadius: '8px',
                      border: `1px solid ${emailHasError ? '#dc2626' : emailValid ? '#16a34a' : '#cbd5e1'}`,
                      background: '#ffffff',
                      fontSize: '0.84rem',
                      color: '#0f172a',
                    }}
                  />
                  {emailSuggestion ? (
                    <div style={{ marginTop: '4px', fontSize: '0.70rem', color: '#b45309', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span>{isEs ? '¿Quisiste decir' : 'Did you mean'}</span>
                      <button
                        type="button"
                        onClick={() => setEmail(emailSuggestion)}
                        style={{
                          border: '1px solid #f59e0b',
                          background: '#fffbeb',
                          color: '#92400e',
                          borderRadius: '6px',
                          padding: '2px 7px',
                          fontSize: '0.70rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {emailSuggestion}
                      </button>
                      <span>?</span>
                    </div>
                  ) : emailHasError ? (
                    <div style={{ marginTop: '4px', fontSize: '0.69rem', color: '#dc2626', fontWeight: 600 }}>
                      {isEs ? 'Incluye "@" y dominio (ej. nombre@gmail.com).' : 'Include "@" and domain (e.g. name@gmail.com).'}
                    </div>
                  ) : (
                    <div style={{ marginTop: '4px', fontSize: '0.68rem', color: '#64748b', lineHeight: 1.35 }}>
                      {isEs ? 'Ejemplo: nombre@gmail.com (sin espacios).' : 'Example: name@gmail.com (no spaces).'}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="submit"
                disabled={isSaving}
                style={{
                  minHeight: '42px',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#003666',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  opacity: isSaving ? 0.7 : 1,
                  whiteSpace: 'nowrap',
                }}
              >
                {isSaving ? (isEs ? 'Guardando...' : 'Saving...') : (isEs ? 'Guardar contacto' : 'Save contact')}
              </button>

              {errorMsg && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.74rem', color: '#dc2626', fontWeight: 600 }}>
                  <AlertCircle size={14} />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
