"use client";

import React, { useState } from 'react';
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import Plus from "lucide-react/dist/esm/icons/plus";

export default 
function ShareConfirmation({ rxId, rx, onNewPrescription }) {
  const [copied, setCopied] = useState(false);

  const rxUrl = rxId
    ? `${window.location.origin}/rx/${rxId}`
    : null;

  const patientName = rx.patient?.name || rx.patient?.email || 'el paciente';
  const itemCount   = rx.items?.length || 0;
  const itemList    = (rx.items || []).slice(0, 3).map(i => i.name).join(', ');

  const copyLink = async () => {
    if (!rxUrl) return;
    try {
      await navigator.clipboard.writeText(rxUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = rxUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const waMsg = encodeURIComponent(
    `Hola ${patientName},\n\nTe he enviado una prescripción médica con ${itemCount} ítem${itemCount !== 1 ? 's' : ''} (${itemList}${itemCount > 3 ? '…' : ''}).\n\nPuedes verla y realizar el pago directamente desde:\n${rxUrl || '(plataforma)'}\n\nCualquier duda, con gusto te atiendo.`
  );
  const emailSubject = encodeURIComponent(`Tu prescripción médica — ${itemCount} ítem${itemCount !== 1 ? 's' : ''}`);
  const emailBody = encodeURIComponent(
    `Hola ${patientName},\n\nTe adjunto el enlace a tu prescripción médica.\n\nProductos/Protocolos: ${itemList}${itemCount > 3 ? '...' : ''}\n\nAccede y realiza el pago aquí:\n${rxUrl || '(plataforma)'}\n\nSaludos,\n${rx.doctorName || 'Tu médico'}`
  );

  return (
    <div style={{
      borderRadius: '18px', overflow: 'hidden',
      border: '1.5px solid rgba(16,185,129,0.25)',
      boxShadow: '0 8px 32px rgba(16,185,129,0.12)',
      animation: 'rxSlideUp 0.3s ease',
    }}>
      {/* Green header */}
      <div style={{
        background: 'linear-gradient(135deg, #065f46, #047857)',
        padding: '1.25rem 1.5rem',
        display: 'flex', alignItems: 'center', gap: '0.85rem',
      }}>
        <div style={{ width: 44, height: 44, borderRadius: '12px',
          background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle2 size={22} color="var(--color-bg-surface)" />
        </div>
        <div>
          <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--color-bg-surface)', letterSpacing: '-0.01em' }}>
            Prescripción enviada ✅
          </div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.1rem' }}>
            {rx.delivery?.method === 'via_wholesaler'
              ? `Asignada al wholesaler ${rx.delivery.wholesalerName || ''}. El paciente será contactado.`
              : `${patientName} puede verla y pagar desde su perfil ahora mismo.`}
          </div>
        </div>
      </div>

      {/* Share options */}
      <div style={{ background: 'var(--color-bg-surface)', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Rx link */}
        {rxUrl && (
          <div>
            <div style={{ fontSize: '0.63rem', fontWeight: 800, color: 'var(--color-text-tertiary)',
              textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.4rem' }}>
              🔗 Enlace directo a la prescripción
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.65rem 0.9rem', borderRadius: '10px',
              border: '1px solid #e2e8f0', background: 'var(--color-bg-app)' }}>
              <span style={{ flex: 1, fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {rxUrl}
              </span>
              <button onClick={copyLink} style={{
                padding: '0.35rem 0.75rem', borderRadius: '7px', flexShrink: 0,
                border: 'none', background: copied ? 'var(--color-success)' : 'var(--color-primary)',
                color: 'var(--color-bg-surface)', fontWeight: 800, fontSize: '0.72rem', cursor: 'pointer',
                fontFamily: 'inherit', transition: 'background 0.2s',
              }}>
                {copied ? '✓ Copiado' : 'Copiar'}
              </button>
            </div>
          </div>
        )}

        {/* Share buttons */}
        <div>
          <div style={{ fontSize: '0.63rem', fontWeight: 800, color: 'var(--color-text-tertiary)',
            textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>
            Compartir con el paciente
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            {/* WhatsApp */}
            <a href={`https://wa.me/?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.6rem 1.1rem', borderRadius: '10px',
                background: '#25d366', color: 'var(--color-bg-surface)',
                fontWeight: 800, fontSize: '0.78rem', textDecoration: 'none',
                boxShadow: '0 3px 10px rgba(37,211,102,0.3)', transition: 'all 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <span style={{ fontSize: '1rem' }}>💬</span> WhatsApp
            </a>

            {/* Email */}
            <a href={`mailto:${rx.patient?.email || ''}?subject=${emailSubject}&body=${emailBody}`}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.6rem 1.1rem', borderRadius: '10px',
                background: 'var(--color-bg-app)', color: 'var(--color-text-secondary)',
                border: '1px solid #e2e8f0', fontWeight: 800, fontSize: '0.78rem',
                textDecoration: 'none', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-bg-app)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <span style={{ fontSize: '1rem' }}>✉️</span> Email
            </a>

            {/* Copy summary */}
            <button onClick={() => {
              const summary = `Prescripción médica — ${rx.doctorName || 'Tu médico'}\n\nPaciente: ${patientName}\nProductos: ${(rx.items || []).map(i => `• ${i.name} × ${i.quantity} ${i.unit}`).join('\n')}\n${rx.diagnosis ? `\nDiagnóstico: ${rx.diagnosis}` : ''}\n${rx.clinicalNotes ? `\nNotas: ${rx.clinicalNotes}` : ''}\n\nVer y pagar: ${rxUrl || '(plataforma)'}`;
              navigator.clipboard.writeText(summary).catch(() => {});
              setCopied(true);
              setTimeout(() => setCopied(false), 2500);
            }} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.6rem 1.1rem', borderRadius: '10px',
              background: 'var(--color-bg-app)', color: 'var(--color-text-secondary)',
              border: '1px solid #e2e8f0', fontWeight: 800, fontSize: '0.78rem',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-bg-app)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <span style={{ fontSize: '1rem' }}>📋</span> Copiar resumen
            </button>
          </div>
        </div>

        {/* Rx summary chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', padding: '0.75rem',
          borderRadius: '10px', background: 'var(--color-bg-app)', border: '1px solid #f1f5f9' }}>
          {(rx.items || []).map((item, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              padding: '0.2rem 0.65rem', borderRadius: '999px',
              background: item.type === 'protocol' ? 'rgba(139,92,246,0.08)' : 'rgba(0,54,102,0.07)',
              color: item.type === 'protocol' ? '#7c3aed' : 'var(--color-primary)',
              fontSize: '0.68rem', fontWeight: 700 }}>
              {item.type === 'protocol' ? '🧬' : '💊'}
              {item.name} · {item.quantity} {item.unit}
            </span>
          ))}
        </div>

        {/* New Rx button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.25rem' }}>
          <button onClick={onNewPrescription} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.65rem 1.25rem', borderRadius: '10px',
            border: '1.5px solid #e2e8f0', background: 'var(--color-bg-surface)',
            cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem',
            color: 'var(--color-text-secondary)', fontFamily: 'inherit', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}>
            <Plus size={13} /> Nueva prescripción
          </button>
        </div>
      </div>
    </div>
  );
}

