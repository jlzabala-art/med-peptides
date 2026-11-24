'use client';

import React, { useState, useMemo } from 'react';
import { MessageCircle, CheckCircle2, Send } from '@/lib/icons';
import { COUNTRY_DIAL_CODES, EMAIL_REGEX, resolveInitialPhoneState } from '@/utils/contactValidation';
import toast from 'react-hot-toast';

export default function PatientContactAtlasCard({
  rx = null,
  rxId = '',
  patientName = '',
  isEs = false,
}) {
  const initialPhoneParsed = useMemo(
    () =>
      resolveInitialPhoneState(
        rx?.patient?.phone || rx?.patientPhone || '',
        rx?.patient?.country || rx?.country || ''
      ),
    [rx?.patient?.phone, rx?.patientPhone, rx?.patient?.country, rx?.country]
  );

  const [dialCode, setDialCode] = useState(initialPhoneParsed.dialCode);
  const [phoneDigits, setPhoneDigits] = useState(initialPhoneParsed.digits);
  const [email, setEmail] = useState(String(rx?.patient?.email || rx?.patientEmail || '').trim());
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({ phone: '', email: '', message: '', general: '' });
  const [submitting, setSubmitting] = useState(false);
  const [sentInfo, setSentInfo] = useState(null);

  const topics = isEs
    ? [
        { id: 'dosing', label: 'Cómo usarlo / Dosis', template: 'Tengo una duda sobre cómo aplicar mi dosis: ' },
        { id: 'delivery', label: 'Envío / Entrega', template: 'Quisiera consultar el estado de entrega de mi pedido: ' },
        { id: 'refill', label: 'Refill / Renovación', template: 'Quisiera información para renovar mi tratamiento: ' },
        { id: 'side_effects', label: 'Consulta clínica', template: 'Quisiera hacer una consulta sobre mi tratamiento: ' },
      ]
    : [
        { id: 'dosing', label: 'Dosing / How to use', template: 'I have a question about how to take my dose: ' },
        { id: 'delivery', label: 'Delivery / Tracking', template: 'I would like to check on my delivery status: ' },
        { id: 'refill', label: 'Refill / Renewal', template: 'I have a question about renewing my treatment: ' },
        { id: 'side_effects', label: 'Clinical Question', template: 'I have a clinical question about my treatment: ' },
      ];

  const handleTopicClick = (t) => {
    setTopic(t.label);
    if (!message.trim()) {
      setMessage(t.template);
    }
    if (errors.message) setErrors((prev) => ({ ...prev, message: '' }));
  };

  const handlePhoneChange = (e) => {
    const digitsOnly = String(e.target.value || '').replace(/\D/g, '').slice(0, 15);
    setPhoneDigits(digitsOnly);
    if (errors.phone || errors.general) {
      setErrors((prev) => ({ ...prev, phone: '', general: '' }));
    }
  };

  const handleEmailChange = (e) => {
    const val = String(e.target.value || '').replace(/\s+/g, '');
    setEmail(val);
    if (errors.email || errors.general) {
      setErrors((prev) => ({ ...prev, email: '', general: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const cleanDigits = phoneDigits.replace(/\D/g, '');
    const cleanEmail = email.trim();
    const cleanMsg = message.trim();
    const nextErrors = { phone: '', email: '', message: '', general: '' };

    if (!cleanDigits && !cleanEmail) {
      nextErrors.general = isEs
        ? 'Introduce al menos un móvil/WhatsApp o un email válido para responderte.'
        : 'Please enter a valid mobile/WhatsApp number or email address so we can reply.';
    }
    if (cleanDigits && (cleanDigits.length < 7 || cleanDigits.length > 15)) {
      nextErrors.phone = isEs
        ? 'El móvil debe tener entre 7 y 15 dígitos (sin incluir el prefijo).'
        : 'Mobile number must be 7 to 15 digits (excluding country code).';
    }
    if (cleanEmail && !EMAIL_REGEX.test(cleanEmail)) {
      nextErrors.email = isEs
        ? 'Formato de email no válido (ej. nombre@dominio.com).'
        : 'Invalid email format (e.g. name@domain.com).';
    }
    if (!cleanMsg) {
      nextErrors.message = isEs ? 'Escribe tu consulta antes de enviar.' : 'Please enter your question before sending.';
    }

    if (nextErrors.phone || nextErrors.email || nextErrors.message || nextErrors.general) {
      setErrors(nextErrors);
      return;
    }

    const fullPhone = cleanDigits ? `${dialCode}${cleanDigits}` : '';
    const combinedContact = [fullPhone, cleanEmail].filter(Boolean).join(' · ');

    setSubmitting(true);
    try {
      const res = await fetch('/api/portal/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'patient_contact_atlas',
          rxId,
          patientName,
          phone: fullPhone,
          email: cleanEmail,
          contact: combinedContact,
          topic: topic || undefined,
          message: cleanMsg,
        }),
      });
      if (!res.ok) throw new Error('Failed to send');
      setSentInfo({ phone: fullPhone, email: cleanEmail, message: cleanMsg });
      setMessage('');
      toast.success(isEs ? 'Mensaje enviado a Atlas ✓' : 'Message sent to Atlas ✓');
    } catch {
      toast.error(isEs ? 'No se pudo enviar el mensaje.' : 'Could not send message.');
    } finally {
      setSubmitting(false);
    }
  };

  if (sentInfo) {
    const waText = encodeURIComponent(`Hi Atlas Health, regarding Rx #${rxId}: ${sentInfo.message}`);
    return (
      <div
        id="contact-atlas-card"
        style={{
          background: '#ffffff',
          border: '1px solid #bbf7d0',
          borderTop: '4px solid #16a34a',
          borderRadius: '10px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={22} color="#16a34a" />
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.0rem', color: '#14532d' }}>
              {isEs ? '¡Mensaje enviado a Atlas!' : 'Message Sent to Atlas!'}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#5f6368' }}>
              {isEs
                ? `Te responderemos a ${[sentInfo.phone, sentInfo.email].filter(Boolean).join(' / ')}.`
                : `We will reply to ${[sentInfo.phone, sentInfo.email].filter(Boolean).join(' / ')}.`}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <a
            href={`https://wa.me/971553561058?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '6px',
              background: '#16a34a',
              color: '#ffffff',
              fontSize: '0.80rem',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            <MessageCircle size={14} />
            <span>{isEs ? 'Abrir chat en WhatsApp' : 'Chat on WhatsApp'}</span>
          </a>
          <button
            type="button"
            onClick={() => setSentInfo(null)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #dadce0',
              background: '#ffffff',
              color: '#3c4043',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {isEs ? 'Enviar otra consulta' : 'Send another message'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      id="contact-atlas-card"
      style={{
        background: '#ffffff',
        border: '1px solid #dadce0',
        borderRadius: '8px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        boxShadow: '0 1px 2px 0 rgba(60, 64, 67, 0.08)',
      }}
    >
      <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {isEs ? 'Soporte al Paciente' : 'Patient Support'}
        </div>
        <h3 style={{ margin: '4px 0 4px', fontSize: '1.02rem', fontWeight: 700, color: '#202124' }}>
          {isEs ? '5. Contactar con Atlas' : '5. Contact Atlas'}
        </h3>
        <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', lineHeight: 1.45 }}>
          {isEs
            ? 'Elige un tema o escríbenos directamente. Verificaremos tu contacto para responderte rápido.'
            : 'Pick a quick topic or write to us directly. Your contact details are pre-filled if available.'}
        </p>
      </div>

      {/* Quick Topic Chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        {topics.map((t) => {
          const active = topic === t.label;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => handleTopicClick(t)}
              style={{
                padding: '5px 10px',
                borderRadius: '999px',
                border: `1px solid ${active ? '#1a73e8' : '#dadce0'}`,
                background: active ? '#e8f0fe' : '#f8fafc',
                color: active ? '#1a73e8' : '#3c4043',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Dedicated Mobile (Country Flag + Digits) & Email */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
              {isEs ? 'Móvil / WhatsApp' : 'Mobile / WhatsApp'}
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <select
                aria-label={isEs ? 'Prefijo de país' : 'Country dial code'}
                value={dialCode}
                onChange={(e) => setDialCode(e.target.value)}
                style={{
                  width: '104px',
                  flexShrink: 0,
                  height: '40px',
                  borderRadius: '6px',
                  border: `1px solid ${errors.phone ? '#dc2626' : '#cbd5e1'}`,
                  padding: '0 6px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  background: '#f8fafc',
                }}
              >
                {COUNTRY_DIAL_CODES.map((c) => (
                  <option key={`${c.iso}-${c.code}`} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                value={phoneDigits}
                onChange={handlePhoneChange}
                placeholder="55 123 4567"
                style={{
                  flex: 1,
                  minWidth: 0,
                  height: '40px',
                  borderRadius: '6px',
                  border: `1px solid ${errors.phone ? '#dc2626' : '#cbd5e1'}`,
                  padding: '0 10px',
                  fontSize: '0.84rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            {errors.phone && (
              <div style={{ fontSize: '0.72rem', color: '#dc2626', marginTop: '4px', fontWeight: 600 }}>
                {errors.phone}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
              {isEs ? 'Correo electrónico (Email)' : 'Email Address'}
            </label>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={handleEmailChange}
              placeholder={isEs ? 'nombre@ejemplo.com' : 'name@example.com'}
              style={{
                width: '100%',
                height: '40px',
                borderRadius: '6px',
                border: `1px solid ${errors.email ? '#dc2626' : '#cbd5e1'}`,
                padding: '0 10px',
                fontSize: '0.84rem',
                boxSizing: 'border-box',
              }}
            />
            {errors.email && (
              <div style={{ fontSize: '0.72rem', color: '#dc2626', marginTop: '4px', fontWeight: 600 }}>
                {errors.email}
              </div>
            )}
          </div>
        </div>

        {errors.general && (
          <div style={{ fontSize: '0.76rem', color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '8px 10px', fontWeight: 600 }}>
            {errors.general}
          </div>
        )}

        <div>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (errors.message) setErrors((prev) => ({ ...prev, message: '' }));
            }}
            placeholder={isEs ? 'Escribe tu consulta aquí...' : 'Write your question here...'}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: `1px solid ${errors.message ? '#dc2626' : '#cbd5e1'}`,
              fontSize: '0.84rem',
              resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
          {errors.message && (
            <div style={{ fontSize: '0.72rem', color: '#dc2626', marginTop: '4px', fontWeight: 600 }}>
              {errors.message}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <a
            href={`https://wa.me/971553561058?text=${encodeURIComponent(`Hi Atlas Health, I have a question about Rx #${rxId}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="gcp-btn-secondary"
            style={{
              minHeight: '42px',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.80rem',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <MessageCircle size={15} color="#16a34a" />
            <span>{isEs ? 'WhatsApp Directo' : 'Direct WhatsApp'}</span>
          </a>

          <button
            type="submit"
            disabled={submitting}
            className="gcp-btn-primary"
            style={{
              minHeight: '42px',
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: submitting ? 'wait' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Send size={14} />
            <span>{submitting ? (isEs ? 'Enviando...' : 'Sending...') : (isEs ? 'Enviar a Atlas' : 'Send to Atlas')}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
