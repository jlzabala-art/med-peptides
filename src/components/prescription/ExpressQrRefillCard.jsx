'use client';

import React, { useState, useMemo } from 'react';
import { RefreshCw, CheckCircle2, MessageSquare, Calendar, AlertTriangle } from '@/lib/icons';
import { computeRefillSchedule, formatShortDate } from '@/utils/refillSchedule';
import toast from 'react-hot-toast';

const COUNTRY_DIAL_CODES = [
  { code: '+971', iso: 'AE', flag: '🇦🇪', name: 'UAE', aliases: ['uae', 'ae', 'united arab emirates', 'dubai', 'abu dhabi'] },
  { code: '+34', iso: 'ES', flag: '🇪🇸', name: 'Spain', aliases: ['es', 'spain', 'españa', 'espana'] },
  { code: '+1', iso: 'US', flag: '🇺🇸', name: 'US / CA', aliases: ['us', 'usa', 'united states', 'ca', 'canada'] },
  { code: '+44', iso: 'GB', flag: '🇬🇧', name: 'UK', aliases: ['gb', 'uk', 'united kingdom', 'england'] },
  { code: '+966', iso: 'SA', flag: '🇸🇦', name: 'Saudi Arabia', aliases: ['sa', 'ksa', 'saudi', 'saudi arabia'] },
  { code: '+974', iso: 'QA', flag: '🇶🇦', name: 'Qatar', aliases: ['qa', 'qatar'] },
  { code: '+965', iso: 'KW', flag: '🇰🇼', name: 'Kuwait', aliases: ['kw', 'kuwait'] },
  { code: '+973', iso: 'BH', flag: '🇧🇭', name: 'Bahrain', aliases: ['bh', 'bahrain'] },
  { code: '+968', iso: 'OM', flag: '🇴🇲', name: 'Oman', aliases: ['om', 'oman'] },
  { code: '+49', iso: 'DE', flag: '🇩🇪', name: 'Germany', aliases: ['de', 'germany', 'deutschland'] },
  { code: '+33', iso: 'FR', flag: '🇫🇷', name: 'France', aliases: ['fr', 'france'] },
  { code: '+39', iso: 'IT', flag: '🇮🇹', name: 'Italy', aliases: ['it', 'italy', 'italia'] },
  { code: '+351', iso: 'PT', flag: '🇵🇹', name: 'Portugal', aliases: ['pt', 'portugal'] },
  { code: '+41', iso: 'CH', flag: '🇨🇭', name: 'Switzerland', aliases: ['ch', 'switzerland'] },
  { code: '+31', iso: 'NL', flag: '🇳🇱', name: 'Netherlands', aliases: ['nl', 'netherlands'] },
  { code: '+52', iso: 'MX', flag: '🇲🇽', name: 'Mexico', aliases: ['mx', 'mexico', 'méxico'] },
  { code: '+57', iso: 'CO', flag: '🇨🇴', name: 'Colombia', aliases: ['co', 'colombia'] },
  { code: '+54', iso: 'AR', flag: '🇦🇷', name: 'Argentina', aliases: ['ar', 'argentina'] },
  { code: '+56', iso: 'CL', flag: '🇨🇱', name: 'Chile', aliases: ['cl', 'chile'] },
  { code: '+55', iso: 'BR', flag: '🇧🇷', name: 'Brazil', aliases: ['br', 'brazil', 'brasil'] },
  { code: '+91', iso: 'IN', flag: '🇮🇳', name: 'India', aliases: ['in', 'india'] },
  { code: '+61', iso: 'AU', flag: '🇦🇺', name: 'Australia', aliases: ['au', 'australia'] },
];

const SORTED_DIAL_CODES = [...COUNTRY_DIAL_CODES].sort((a, b) => b.code.length - a.code.length);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function resolveInitialPhoneState(rawPhone = '', rawCountry = '') {
  const trimmed = String(rawPhone || '').trim();
  if (trimmed) {
    const normalized = trimmed.replace(/[\s()-]/g, '');
    const withPlus = normalized.startsWith('00') ? `+${normalized.slice(2)}` : normalized;
    if (withPlus.startsWith('+')) {
      const match = SORTED_DIAL_CODES.find((c) => withPlus.startsWith(c.code));
      if (match) {
        return {
          dialCode: match.code,
          digits: withPlus.slice(match.code.length).replace(/\D/g, '').slice(0, 15),
        };
      }
    }
    const onlyDigits = trimmed.replace(/\D/g, '').slice(0, 15);
    if (onlyDigits) {
      return { dialCode: '+971', digits: onlyDigits };
    }
  }

  const cNorm = String(rawCountry || '').trim().toLowerCase();
  if (cNorm) {
    const byCountry = COUNTRY_DIAL_CODES.find((c) => c.aliases.includes(cNorm));
    if (byCountry) {
      return { dialCode: byCountry.code, digits: '' };
    }
  }

  return { dialCode: '+971', digits: '' };
}

function cleanProductTitle(f, fallback) {
  const short = String(f?.shortTitle || f?.title || '').trim();
  const isGenericTitle = !short || /^compounded\s+(formula|formulation|nasal\s*spray)$/i.test(short);
  if (!isGenericTitle) {
    const clean = short
      .replace(/\bCompounded\b/gi, '')
      .replace(/\bCompounding\b/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
    return f?.volume && !clean.toLowerCase().includes(String(f.volume).toLowerCase())
      ? `${clean} (${f.volume})`
      : clean;
  }
  const firstApi = Array.isArray(f?.apis) && f.apis.length > 0 ? f.apis[0] : null;
  if (firstApi?.name || firstApi?.productName) {
    const name = firstApi.name || firstApi.productName;
    return firstApi.dosage ? `${name} (${firstApi.dosage})` : name;
  }
  const raw = String(f?.treatmentType || f?.dispensingForm || fallback || '');
  return raw
    .replace(/\bCompounded\b/gi, '')
    .replace(/\bCompounding\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim() || fallback;
}

export default function ExpressQrRefillCard({
  rxCode,
  rx = null,
  formulations = [],
  initialPartNumber = null,
  initialProductName = '',
  defaultContact = '',
  defaultPhone = '',
  defaultEmail = '',
  defaultCountry = '',
  scanSource = '',
  isEs = false,
}) {
  const options = useMemo(() => {
    if (Array.isArray(formulations) && formulations.length > 0) {
      return formulations.map((f, idx) => ({
        partNumber: f.partNumber || idx + 1,
        title: cleanProductTitle(f, `Treatment ${idx + 1}`),
      }));
    }
    return [{ partNumber: initialPartNumber || 1, title: cleanProductTitle({}, initialProductName || 'Personalized Treatment') }];
  }, [formulations, initialPartNumber, initialProductName]);

  const defaultSelected = useMemo(() => {
    if (initialPartNumber) {
      const byPart = options.find((o) => Number(o.partNumber) === Number(initialPartNumber));
      if (byPart) return byPart;
    }
    if (initialProductName) {
      const norm = initialProductName.toLowerCase();
      const byName = options.find((o) => o.title.toLowerCase().includes(norm) || norm.includes(o.title.toLowerCase()));
      if (byName) return byName;
    }
    return options[0];
  }, [options, initialPartNumber, initialProductName]);

  const initialPhoneSource = defaultPhone || (!String(defaultContact || '').includes('@') ? defaultContact : '');
  const initialEmailSource = defaultEmail || (String(defaultContact || '').includes('@') ? defaultContact : '');
  const initialPhoneParsed = useMemo(
    () => resolveInitialPhoneState(initialPhoneSource, defaultCountry || rx?.patient?.country || rx?.country || ''),
    [initialPhoneSource, defaultCountry, rx?.patient?.country, rx?.country]
  );

  const isMultiPart = options.length > 1;
  const hasExplicitInitialPart = Boolean(initialPartNumber || initialProductName);
  const [refillScope, setRefillScope] = useState(
    isMultiPart && !hasExplicitInitialPart ? 'full' : 'partial'
  );
  const [selectedParts, setSelectedParts] = useState(() => {
    if (isMultiPart && !hasExplicitInitialPart) {
      return options.map((o) => Number(o.partNumber));
    }
    return [Number(defaultSelected?.partNumber || 1)];
  });
  const [selectedPart, setSelectedPart] = useState(defaultSelected?.partNumber || 1);
  const [quantity, setQuantity] = useState(1);
  const [dialCode, setDialCode] = useState(initialPhoneParsed.dialCode);
  const [phoneDigits, setPhoneDigits] = useState(initialPhoneParsed.digits);
  const [email, setEmail] = useState(String(initialEmailSource || '').trim());
  const [notes, setNotes] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ phone: '', email: '', general: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState(null);

  const refillSchedule = useMemo(
    () => computeRefillSchedule(rx || {}, formulations),
    [rx, formulations]
  );

  const activeSelectedOptions = useMemo(() => {
    if (!isMultiPart || refillScope === 'full') return options;
    const picked = options.filter((o) => selectedParts.includes(Number(o.partNumber)));
    return picked.length > 0 ? picked : [options[0]];
  }, [isMultiPart, refillScope, options, selectedParts]);

  const selectedTitle = useMemo(() => {
    if (isMultiPart && refillScope === 'full') {
      return isEs
        ? `Tratamiento completo (${options.length} partes): ${options.map((o) => o.title).join(' + ')}`
        : `Full Regimen (${options.length} parts): ${options.map((o) => o.title).join(' + ')}`;
    }
    if (isMultiPart) {
      return activeSelectedOptions.map((o) => o.title).join(' + ');
    }
    return (
      options.find((o) => Number(o.partNumber) === Number(selectedPart))?.title ||
      initialProductName ||
      'Personalized Treatment'
    );
  }, [isMultiPart, refillScope, options, activeSelectedOptions, selectedPart, initialProductName, isEs]);

  const togglePartSelection = (partNum) => {
    const num = Number(partNum);
    setSelectedParts((prev) => {
      if (prev.includes(num)) {
        if (prev.length === 1) return prev; // Keep at least 1 selected
        return prev.filter((p) => p !== num);
      }
      return [...prev, num].sort((a, b) => a - b);
    });
  };

  const handlePhoneChange = (e) => {
    const digitsOnly = String(e.target.value || '').replace(/\D/g, '').slice(0, 15);
    setPhoneDigits(digitsOnly);
    if (fieldErrors.phone || fieldErrors.general) {
      setFieldErrors((prev) => ({ ...prev, phone: '', general: '' }));
    }
  };

  const handleEmailChange = (e) => {
    const val = String(e.target.value || '').replace(/\s+/g, '');
    setEmail(val);
    if (fieldErrors.email || fieldErrors.general) {
      setFieldErrors((prev) => ({ ...prev, email: '', general: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const cleanDigits = phoneDigits.replace(/\D/g, '');
    const cleanEmail = email.trim();
    const nextErrors = { phone: '', email: '', general: '' };

    if (!cleanDigits && !cleanEmail) {
      nextErrors.general = isEs
        ? 'Introduce al menos un móvil/WhatsApp o un email válido para confirmar el refill.'
        : 'Please enter a valid mobile/WhatsApp number or email address.';
    }
    if (cleanDigits && (cleanDigits.length < 7 || cleanDigits.length > 15)) {
      nextErrors.phone = isEs
        ? 'El número debe tener entre 7 y 15 dígitos (sin incluir el prefijo).'
        : 'Phone number must be 7 to 15 digits (excluding country code).';
    }
    if (cleanEmail && !EMAIL_REGEX.test(cleanEmail)) {
      nextErrors.email = isEs
        ? 'Formato de email no válido (ej. nombre@dominio.com).'
        : 'Invalid email format (e.g. name@domain.com).';
    }

    if (nextErrors.phone || nextErrors.email || nextErrors.general) {
      setFieldErrors(nextErrors);
      return;
    }

    const fullPhone = cleanDigits ? `${dialCode}${cleanDigits}` : '';
    const combinedContact = [fullPhone, cleanEmail].filter(Boolean).join(' · ');

    setSubmitting(true);
    try {
      const res = await fetch(`/api/prescriptions/${encodeURIComponent(rxCode)}/request-refill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partNumber: isMultiPart ? activeSelectedOptions[0]?.partNumber : selectedPart,
          refillScope: isMultiPart ? refillScope : 'single',
          selectedParts: activeSelectedOptions.map((o) => ({ partNumber: o.partNumber, title: o.title })),
          productName: selectedTitle,
          quantity,
          phone: fullPhone,
          email: cleanEmail,
          contactInfo: combinedContact,
          notes,
          source: scanSource || 'direct',
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Could not submit refill request');
      }
      setSubmittedResult(json);
      toast.success(isEs ? 'Solicitud de refill enviada a Atlas ✓' : 'Refill request sent to Atlas ✓');
    } catch (err) {
      toast.error(err.message || 'Error sending refill request');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedResult) {
    const fullPhoneDisplay = phoneDigits ? `${dialCode}${phoneDigits}` : '';
    const waText = encodeURIComponent(
      `Hi Atlas Health, I just submitted Refill Request ${submittedResult.requestId} for Rx #${rxCode}: ${quantity}x ${selectedTitle}.`
    );
    return (
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #bbf7d0',
          borderTop: '4px solid #16a34a',
          borderRadius: '10px',
          padding: '20px',
          marginBottom: '16px',
          boxShadow: '0 2px 8px rgba(22, 163, 74, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckCircle2 size={20} color="#16a34a" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.02rem', color: '#14532d' }}>
                {isEs ? '¡Solicitud de Refill Recibida!' : 'Refill Request Received!'}
              </div>
              <div style={{ fontSize: '0.76rem', color: '#5f6368', fontFamily: 'monospace' }}>
                Ref: {submittedResult.requestId} · Rx #{rxCode}
              </div>
            </div>
          </div>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#15803d', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '3px 10px', borderRadius: '999px' }}>
            {isEs ? 'En revisión' : 'Requested'}
          </span>
        </div>

        {/* 3-Step Mini Progress Tracker */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase' }}>
              1. {isEs ? 'Recibido ✓' : 'Received ✓'}
            </span>
            <span style={{ fontSize: '0.72rem', color: '#334155', fontWeight: 600 }}>
              {isEs ? 'Notificado ahora' : 'Logged now'}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#1a73e8', textTransform: 'uppercase' }}>
              2. {isEs ? 'Preparación' : 'Preparation'}
            </span>
            <span style={{ fontSize: '0.72rem', color: '#5f6368' }}>
              {isEs ? 'Validación y lote' : 'Pharmacy & review'}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
              3. {isEs ? 'Envío' : 'Delivery'}
            </span>
            <span style={{ fontSize: '0.72rem', color: '#5f6368' }}>
              {isEs ? 'Aviso por WhatsApp' : 'WhatsApp tracking'}
            </span>
          </div>
        </div>

        {/* Structured Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', fontSize: '0.80rem', background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '8px', padding: '10px 14px' }}>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>
              {isEs ? 'Tratamiento' : 'Treatment'}
            </div>
            <div style={{ fontWeight: 700, color: '#14532d' }}>
              {quantity}× {selectedTitle}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>
              {isEs ? 'Contacto de confirmación' : 'Confirmation Contact'}
            </div>
            <div style={{ fontWeight: 600, color: '#14532d' }}>
              {[fullPhoneDisplay, email].filter(Boolean).join(' · ') || '—'}
            </div>
          </div>
        </div>

        {/* Action Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
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
              fontWeight: 700,
              fontSize: '0.80rem',
              textDecoration: 'none',
            }}
          >
            <MessageSquare size={14} />
            <span>{isEs ? 'Confirmar / Escribir por WhatsApp' : 'Message Atlas on WhatsApp'}</span>
          </a>
          <button
            type="button"
            onClick={() => setSubmittedResult(null)}
            style={{
              padding: '7px 12px',
              borderRadius: '6px',
              border: '1px solid #dadce0',
              background: '#ffffff',
              color: '#3c4043',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {isEs ? 'Hacer otra solicitud' : 'Submit another request'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      style={{
        background: '#ffffff',
        border: '1px solid #dadce0',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '16px',
        boxShadow: '0 1px 2px 0 rgba(60, 64, 67, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw size={17} color="#1a73e8" />
          <span style={{ fontWeight: 700, fontSize: '1.02rem', color: '#202124' }}>
            {isEs ? '3. Solicitar Refill' : '3. Request Refill'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {scanSource === 'label_qr' && (
            <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#0f766e', background: '#f0fdfa', border: '1px solid #99f6e4', padding: '2px 8px', borderRadius: '4px' }}>
              {isEs ? 'Escaneo QR Etiqueta' : 'Label QR Scan'}
            </span>
          )}
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1a73e8', background: '#e8f0fe', padding: '3px 8px', borderRadius: '4px' }}>
            Rx #{rxCode}
          </span>
        </div>
      </div>

      {refillSchedule.purchaseDate && (
        <div
          style={{
            background: refillSchedule.isTwoWeekWarning ? '#fffbeb' : '#f8fafc',
            border: `1px solid ${refillSchedule.isTwoWeekWarning ? '#fde68a' : '#e2e8f0'}`,
            borderRadius: '8px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            fontSize: '0.80rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', color: '#3c4043' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <Calendar size={14} color="#5f6368" />
              <strong>{isEs ? 'Dispensado:' : 'Dispensed:'}</strong>{' '}
              {formatShortDate(refillSchedule.purchaseDate, isEs)}
            </span>
            <span>
              <strong>{isEs ? 'Refill estimado:' : 'Tentative refill:'}</strong>{' '}
              {formatShortDate(refillSchedule.tentativeRefillDate, isEs)}
            </span>
          </div>
          {refillSchedule.daysRemaining !== null && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.74rem',
                fontWeight: 700,
                padding: '3px 9px',
                borderRadius: '999px',
                background: refillSchedule.isTwoWeekWarning ? '#fef3c7' : '#e8f0fe',
                color: refillSchedule.isTwoWeekWarning ? '#b45309' : '#1a73e8',
              }}
            >
              {refillSchedule.isTwoWeekWarning && <AlertTriangle size={13} />}
              {refillSchedule.daysRemaining <= 0
                ? (isEs ? 'Refill recomendado ahora' : 'Refill due now')
                : refillSchedule.isTwoWeekWarning
                ? (isEs ? `Quedan ${refillSchedule.daysRemaining} días — Pedir ya` : `${refillSchedule.daysRemaining} days left — Order now`)
                : (isEs ? `Quedan ${refillSchedule.daysRemaining} días` : `${refillSchedule.daysRemaining} days remaining`)}
            </span>
          )}
        </div>
      )}

      {/* Row 1: Product / Multi-Part Scope & Quantity */}
      {isMultiPart ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>
              {isEs ? 'Qué deseas renovar' : 'What would you like to refill?'}
            </label>
            <div style={{ display: 'inline-flex', border: '1px solid #dadce0', borderRadius: '6px', overflow: 'hidden', background: '#f8fafc' }}>
              <button
                type="button"
                onClick={() => setRefillScope('full')}
                style={{
                  padding: '5px 10px',
                  border: 'none',
                  borderRight: '1px solid #dadce0',
                  background: refillScope === 'full' ? '#1a73e8' : 'transparent',
                  color: refillScope === 'full' ? '#ffffff' : '#3c4043',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {isEs ? `Todo (${options.length} partes)` : `Full Regimen (${options.length} parts)`}
              </button>
              <button
                type="button"
                onClick={() => setRefillScope('partial')}
                style={{
                  padding: '5px 10px',
                  border: 'none',
                  background: refillScope === 'partial' ? '#1a73e8' : 'transparent',
                  color: refillScope === 'partial' ? '#ffffff' : '#3c4043',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {isEs ? 'Elegir partes' : 'Select parts'}
              </button>
            </div>
          </div>

          {refillScope === 'full' ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '10px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              {options.map((opt) => (
                <span
                  key={opt.partNumber}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    color: '#0f766e',
                    background: '#f0fdfa',
                    border: '1px solid #99f6e4',
                    padding: '4px 9px',
                    borderRadius: '999px',
                  }}
                >
                  <span>✓</span>
                  <span>{opt.title}</span>
                </span>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '8px' }}>
              {options.map((opt) => {
                const checked = selectedParts.includes(Number(opt.partNumber));
                return (
                  <label
                    key={opt.partNumber}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      minHeight: '44px',
                      padding: '8px 11px',
                      borderRadius: '8px',
                      border: checked ? '1.5px solid #1a73e8' : '1px solid #cbd5e1',
                      background: checked ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#202124',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePartSelection(opt.partNumber)}
                      style={{ width: '16px', height: '16px', accentColor: '#1a73e8', flexShrink: 0 }}
                    />
                    <span>{isEs ? `Parte ${opt.partNumber}: ` : `Part ${opt.partNumber}: `}{opt.title}</span>
                  </label>
                );
              })}
            </div>
          )}

          <div style={{ maxWidth: '220px' }}>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
              {isEs ? 'Ciclos / Cantidad' : 'Cycles / Quantity'}
            </label>
            <select
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              style={{ width: '100%', height: '38px', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '0 10px', fontSize: '0.84rem', fontWeight: 600 }}
            >
              {[1, 2, 3, 4, 5].map((q) => (
                <option key={q} value={q}>
                  {q} {q === 1 ? (isEs ? 'ciclo / unidad' : 'cycle / unit') : (isEs ? 'ciclos / unidades' : 'cycles / units')}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
              {isEs ? 'Producto a repetir' : 'Product to Refill'}
            </label>
            <select
              value={selectedPart}
              onChange={(e) => setSelectedPart(Number(e.target.value))}
              style={{ width: '100%', height: '38px', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '0 10px', fontSize: '0.84rem', fontWeight: 600 }}
            >
              {options.map((opt) => (
                <option key={opt.partNumber} value={opt.partNumber}>
                  {opt.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
              {isEs ? 'Cantidad' : 'Quantity'}
            </label>
            <select
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              style={{ width: '100%', height: '38px', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '0 10px', fontSize: '0.84rem', fontWeight: 600 }}
            >
              {[1, 2, 3, 4, 5].map((q) => (
                <option key={q} value={q}>
                  {q} {q === 1 ? (isEs ? 'unidad' : 'unit') : (isEs ? 'unidades' : 'units')}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Row 2: Dedicated Mobile (Country Flag + Digits) & Email */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
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
                border: `1px solid ${fieldErrors.phone ? '#dc2626' : '#cbd5e1'}`,
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
              placeholder={isEs ? '55 123 4567' : '55 123 4567'}
              style={{
                flex: 1,
                minWidth: 0,
                height: '38px',
                borderRadius: '6px',
                border: `1px solid ${fieldErrors.phone ? '#dc2626' : '#cbd5e1'}`,
                padding: '0 10px',
                fontSize: '0.84rem',
                boxSizing: 'border-box',
              }}
            />
          </div>
          {fieldErrors.phone && (
            <div style={{ fontSize: '0.72rem', color: '#dc2626', marginTop: '4px', fontWeight: 600 }}>
              {fieldErrors.phone}
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
              height: '38px',
              borderRadius: '6px',
              border: `1px solid ${fieldErrors.email ? '#dc2626' : '#cbd5e1'}`,
              padding: '0 10px',
              fontSize: '0.84rem',
              boxSizing: 'border-box',
            }}
          />
          {fieldErrors.email && (
            <div style={{ fontSize: '0.72rem', color: '#dc2626', marginTop: '4px', fontWeight: 600 }}>
              {fieldErrors.email}
            </div>
          )}
        </div>
      </div>

      {fieldErrors.general && (
        <div style={{ fontSize: '0.76rem', color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '8px 10px', fontWeight: 600 }}>
          {fieldErrors.general}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={isEs ? 'Nota opcional (ej. entregar esta semana)...' : 'Optional delivery or clinical note...'}
          style={{ flex: '1 1 220px', height: '38px', borderRadius: '6px', border: '1px solid #e2e8f0', padding: '0 10px', fontSize: '0.82rem' }}
        />
        <button
          type="submit"
          disabled={submitting}
          className="gcp-btn-primary"
          style={{
            height: '40px',
            padding: '0 18px',
            borderRadius: '8px',
            fontWeight: 800,
            fontSize: '0.84rem',
            cursor: submitting ? 'wait' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <RefreshCw size={15} />
          <span>
            {submitting
              ? isEs ? 'Enviando a Atlas...' : 'Sending to Atlas...'
              : isEs ? 'Solicitar Refill Ahora' : 'Confirm Refill Request'}
          </span>
        </button>
      </div>
    </form>
  );
}
