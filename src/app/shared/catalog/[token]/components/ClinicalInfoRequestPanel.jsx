'use client';

/**
 * ClinicalInfoRequestPanel
 * ─────────────────────────────────────────────────────────────────────────────
 * Zero-economic, purely clinical "Request More Information" micro-form.
 * Appears as an expandable panel under each product card.
 * Captures: name, email, and what specifically they want to know.
 * Submits to /api/catalog/tracking-logs with docType: 'info_request'.
 * NEVER shows price, tier, or margin data.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useCallback } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Send, Check, Loader2 } from 'lucide-react';

const INFO_TOPICS = [
  { value: 'mechanism',    label: '🔬 Mechanism of Action & Pharmacodynamics' },
  { value: 'dosing',       label: '💉 Clinical Dosing Protocols & Administration Routes' },
  { value: 'safety',       label: '🛡️ Safety Profile, Contraindications & Interactions' },
  { value: 'research',     label: '📚 Peer-Reviewed Research & Clinical Evidence' },
  { value: 'availability', label: '📦 Formulation Availability & Presentation Options' },
  { value: 'combination',  label: '🔗 Combination Therapy & Stack Compatibility' },
  { value: 'regulatory',   label: '⚖️ Regulatory Status & Institutional Compliance' },
  { value: 'other',        label: '📝 Other Clinical Question' },
];

export default function ClinicalInfoRequestPanel({ product, catalogMeta }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name,   setName]   = useState('');
  const [email,  setEmail]  = useState('');
  const [topic,  setTopic]  = useState('mechanism');
  const [notes,  setNotes]  = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'submitting' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!email || !name) {
      setErrorMsg('Please provide your name and professional email.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    setStatus('submitting');
    setErrorMsg('');
    try {
      await fetch('/api/catalog/tracking-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docType: 'info_request',
          productSlug: product?.slug || product?.id || '',
          productName: product?.canonicalName || product?.name || product?.title || '',
          recipient: {
            name,
            email,
            type: 'info_request',
          },
          accountManager: {
            name: catalogMeta?.accountManagerName && catalogMeta.accountManagerName !== 'Atlas Commercial Desk'
              ? catalogMeta.accountManagerName
              : 'Clinical Information Desk',
            email: catalogMeta?.accountManagerEmail && catalogMeta.accountManagerEmail !== 'orders@atlas-solutions.com'
              ? catalogMeta.accountManagerEmail
              : 'clinical@atlashealth.com',
          },
          shareUrl: typeof window !== 'undefined' ? window.location.href : '',
          items: [{ topic, notes: notes.trim().slice(0, 500) }],
        }),
      });
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMsg('Failed to submit. Please try again or contact us directly.');
    }
  }, [name, email, topic, notes, product, catalogMeta]);

  const handleReset = () => {
    setStatus('idle');
    setName('');
    setEmail('');
    setTopic('mechanism');
    setNotes('');
    setErrorMsg('');
    setIsOpen(false);
  };

  const fieldStyle = {
    width: '100%',
    padding: '8px 11px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '0.84rem',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  };

  return (
    <div style={{ marginTop: '10px' }}>
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.78rem',
          fontWeight: 700,
          color: '#0284c7',
          backgroundColor: isOpen ? '#f0f9ff' : 'transparent',
          border: '1px solid',
          borderColor: isOpen ? '#bae6fd' : '#e2e8f0',
          borderRadius: '8px',
          padding: '5px 12px',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f0f9ff'; e.currentTarget.style.borderColor = '#bae6fd'; }}
        onMouseLeave={e => { if (!isOpen) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = '#e2e8f0'; } }}
      >
        <BookOpen size={13} />
        <span>Request Clinical Information</span>
        {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {/* Expandable panel */}
      {isOpen && (
        <div
          style={{
            marginTop: '10px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '16px',
            animation: 'fadeIn 0.15s ease',
          }}
        >
          {status === 'success' ? (
            /* Success state */
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                backgroundColor: '#f0fdf4', border: '2px solid #bbf7d0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 10px',
              }}>
                <Check size={22} color="#16a34a" />
              </div>
              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem', marginBottom: '4px' }}>
                Information Request Received
              </div>
              <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '0 0 12px', lineHeight: 1.4 }}>
                Our clinical team will follow up at <strong>{email}</strong> within 24 business hours with detailed documentation on{' '}
                <strong>{product?.canonicalName || product?.name || 'this compound'}</strong>.
              </p>
              <div style={{
                fontSize: '0.74rem', color: '#94a3b8', backgroundColor: '#f1f5f9',
                padding: '6px 12px', borderRadius: '6px', display: 'inline-block',
              }}>
                📋 Strictly clinical information only — no commercial data will be shared.
              </div>
              <div style={{ marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={handleReset}
                  style={{ fontSize: '0.78rem', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Submit another inquiry
                </button>
              </div>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} noValidate>
              <div style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
                  📬 Request Clinical Documentation
                </div>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 12px', lineHeight: 1.4 }}>
                  Our medical team will send you peer-reviewed literature, dosing protocols, and safety data for{' '}
                  <strong style={{ color: '#0f172a' }}>{product?.canonicalName || product?.name || 'this compound'}</strong>.
                  No commercial information is included.
                </p>
              </div>

              {/* Topic selector */}
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>
                  What would you like to know?
                </label>
                <select
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  style={{ ...fieldStyle, cursor: 'pointer' }}
                  required
                >
                  {INFO_TOPICS.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Name + Email row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>
                    Name / Institution *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Dr. García / Clinic Name"
                    style={fieldStyle}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>
                    Professional Email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="doctor@clinic.com"
                    style={fieldStyle}
                    required
                  />
                </div>
              </div>

              {/* Optional notes */}
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>
                  Additional clinical context <span style={{ fontWeight: 400, color: '#94a3b8' }}>(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Patient profile, specific indication, concurrent treatments..."
                  rows={2}
                  maxLength={500}
                  style={{ ...fieldStyle, resize: 'vertical', minHeight: '56px' }}
                />
              </div>

              {/* Error */}
              {errorMsg && (
                <div style={{ fontSize: '0.78rem', color: '#dc2626', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '7px 10px', marginBottom: '10px' }}>
                  {errorMsg}
                </div>
              )}

              {/* Disclaimer + Submit */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0, lineHeight: 1.3, maxWidth: '240px' }}>
                  🔒 Strictly clinical. Your data is used only to fulfill this inquiry.
                </p>
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  style={{
                    backgroundColor: status === 'submitting' ? '#94a3b8' : '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: status === 'submitting' ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'background 0.15s ease',
                    flexShrink: 0,
                  }}
                >
                  {status === 'submitting' ? (
                    <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /><span>Sending…</span></>
                  ) : (
                    <><Send size={14} /><span>Request Information</span></>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
