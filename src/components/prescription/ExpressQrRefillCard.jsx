'use client';

import React, { useState, useMemo } from 'react';
import { RefreshCw, CheckCircle2, MessageSquare } from '@/lib/icons';
import toast from 'react-hot-toast';

export default function ExpressQrRefillCard({
  rxCode,
  formulations = [],
  initialPartNumber = null,
  initialProductName = '',
  defaultContact = '',
  isEs = false,
}) {
  const options = useMemo(() => {
    if (Array.isArray(formulations) && formulations.length > 0) {
      return formulations.map((f, idx) => ({
        partNumber: f.partNumber || idx + 1,
        title: f.title || f.treatmentType || f.dispensingForm || `Formulation ${idx + 1}`,
      }));
    }
    return [{ partNumber: initialPartNumber || 1, title: initialProductName || 'Compounded Formulation' }];
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

  const [selectedPart, setSelectedPart] = useState(defaultSelected?.partNumber || 1);
  const [quantity, setQuantity] = useState(1);
  const [contactInfo, setContactInfo] = useState(defaultContact || '');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState(null);

  const selectedTitle =
    options.find((o) => Number(o.partNumber) === Number(selectedPart))?.title ||
    initialProductName ||
    'Compounded Formulation';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/prescriptions/${encodeURIComponent(rxCode)}/request-refill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partNumber: selectedPart,
          productName: selectedTitle,
          quantity,
          contactInfo,
          notes,
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
    const waText = encodeURIComponent(
      `Hi Atlas Health, I just submitted Refill Request ${submittedResult.requestId} for Rx #${rxCode}: ${quantity}x ${selectedTitle}.`
    );
    return (
      <div
        style={{
          background: '#f0fdf4',
          border: '1px solid #86efac',
          borderLeft: '4px solid #16a34a',
          borderRadius: '10px',
          padding: '16px 18px',
          marginBottom: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 800, fontSize: '0.98rem' }}>
          <CheckCircle2 size={20} color="#16a34a" />
          <span>
            {isEs ? '¡Solicitud de Refill Confirmada!' : 'Refill Request Confirmed!'} ({submittedResult.requestId})
          </span>
        </div>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#14532d', lineHeight: 1.5 }}>
          {isEs
            ? `Hemos notificado al equipo de Atlas Health y a tu médico para preparar ${quantity}× ${selectedTitle} (Receta #${rxCode}).`
            : `Atlas Health Operations and your prescribing physician have been notified to prepare ${quantity}× ${selectedTitle} (Rx #${rxCode}).`}
        </p>
        <div>
          <a
            href={`https://wa.me/971564179256?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '6px',
              background: '#ffffff',
              border: '1px solid #bbf7d0',
              color: '#15803d',
              fontWeight: 700,
              fontSize: '0.8rem',
              textDecoration: 'none',
            }}
          >
            <MessageSquare size={14} />
            <span>{isEs ? 'Escribir por WhatsApp a Atlas' : 'Message Atlas on WhatsApp'}</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: '#ffffff',
        border: '1px solid #bfdbfe',
        borderLeft: '4px solid #003666',
        borderRadius: '10px',
        padding: '16px 18px',
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0, 54, 102, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw size={18} color="#003666" />
          <span style={{ fontWeight: 800, fontSize: '0.96rem', color: '#0f172a' }}>
            {isEs ? 'Refill Express por QR' : 'Express QR Refill Request'}
          </span>
        </div>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0369a1', background: '#eff6ff', padding: '3px 8px', borderRadius: '6px' }}>
          Rx #{rxCode}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
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

        <div>
          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
            {isEs ? 'Tu WhatsApp / Teléfono o Email' : 'Your WhatsApp / Phone or Email'}
          </label>
          <input
            type="text"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            placeholder={isEs ? '+971... o email@ejemplo.com' : '+971... or email@example.com'}
            style={{ width: '100%', height: '38px', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '0 10px', fontSize: '0.84rem', boxSizing: 'border-box' }}
          />
        </div>
      </div>

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
