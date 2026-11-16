'use client';

import React, { useState } from 'react';
import { X, FilePlus2, User, Stethoscope, FlaskConical } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * QuickManualRxModal
 * ─────────────────────────────────────────────────────────────────────────────
 * Allows operators to create a compounded prescription directly in /labels
 * without needing to upload a PDF/scan first. Persists via POST /api/labels/import.
 */
export default function QuickManualRxModal({ isOpen, onClose, onCreated, isEs = false }) {
  const [patientName, setPatientName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [productTitle, setProductTitle] = useState('');
  const [activesText, setActivesText] = useState('');
  const [volume, setVolume] = useState('30 mL');
  const [directions, setDirections] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientName.trim() || !productTitle.trim()) {
      toast.error(isEs ? 'Nombre del paciente y fórmula son obligatorios' : 'Patient name and formula title are required');
      return;
    }

    setSubmitting(true);
    try {
      const code = `RX-${Math.floor(10000 + Math.random() * 90000)}`;
      const apis = activesText
        .split(/[,;\n]+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((name) => ({ name }));

      const labelObj = {
        phaseNumber: 1,
        partKey: 'part_1',
        productTitle: productTitle.trim(),
        productName: productTitle.trim(),
        volume: volume.trim() || '30 mL',
        directions: directions.trim() || 'Apply or administer as directed by physician.',
        apis,
        composition: activesText.trim(),
        activesSummary: activesText.trim(),
        batchNumber: batchNumber.trim() || undefined,
        expiryDate: expiryDate || undefined,
        approvalStatus: 'draft',
      };

      const rxPayload = {
        code,
        prescriptionCode: code,
        patientName: patientName.trim(),
        doctorName: doctorName.trim() || 'Prescribing Physician',
        title: productTitle.trim(),
        treatmentTitle: productTitle.trim(),
        status: 'draft',
        parts: [
          {
            title: productTitle.trim(),
            volume: volume.trim() || '30 mL',
            directions: labelObj.directions,
            apis,
          },
        ],
        pharmacyLabels: [labelObj],
      };

      const res = await fetch('/api/labels/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prescriptions: [rxPayload] }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Could not create prescription');
      }

      toast.success(isEs ? `Prescripción #${code} creada` : `Prescription #${code} created`);
      setPatientName('');
      setDoctorName('');
      setProductTitle('');
      setActivesText('');
      setDirections('');
      setBatchNumber('');
      setExpiryDate('');
      onCreated?.(data.created || [{ code }]);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Error creating prescription');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isEs ? 'Nueva Prescripción Manual' : 'Quick Manual Prescription'}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.58)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #cbd5e1',
          boxShadow: '0 20px 45px rgba(15, 23, 42, 0.22)',
        }}
      >
        <div
          style={{
            padding: '14px 18px',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FilePlus2 size={18} color="#1a73e8" />
            <div>
              <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
                {isEs ? 'Nueva Prescripción Manual (Sin PDF)' : 'Quick Manual Prescription (No PDF)'}
              </h3>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                {isEs ? 'Crea un borrador directo y ábrelo en el estudio de etiquetas' : 'Creates a direct draft and opens it in Label Studio'}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.74rem', fontWeight: 700, color: '#334155' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <User size={12} color="#1a73e8" />
                {isEs ? 'Paciente *' : 'Patient Name *'}
              </span>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder={isEs ? 'Nombre completo del paciente' : 'Full patient name'}
                style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.74rem', fontWeight: 700, color: '#334155' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Stethoscope size={12} color="#16a34a" />
                {isEs ? 'Médico Prescriptor' : 'Prescribing Physician'}
              </span>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder={isEs ? 'Dr. / Dra. ...' : 'Dr. ...'}
                style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
              />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.74rem', fontWeight: 700, color: '#334155' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FlaskConical size={12} color="#7c3aed" />
                {isEs ? 'Nombre de la Fórmula *' : 'Formula Title *'}
              </span>
              <input
                type="text"
                required
                value={productTitle}
                onChange={(e) => setProductTitle(e.target.value)}
                placeholder="e.g. GHK-Cu 2% + Minoxidil 5% Topical"
                style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.74rem', fontWeight: 700, color: '#334155' }}>
              <span>{isEs ? 'Volumen / Cant.' : 'Volume / Qty'}</span>
              <input
                type="text"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                placeholder="30 mL"
                style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
              />
            </label>
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.74rem', fontWeight: 700, color: '#334155' }}>
            <span>{isEs ? 'Principios Activos (separados por coma)' : 'Active Ingredients (comma separated)'}</span>
            <input
              type="text"
              value={activesText}
              onChange={(e) => setActivesText(e.target.value)}
              placeholder="GHK-Cu 2%, Minoxidil 5%, Finasteride 0.1%"
              style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.74rem', fontWeight: 700, color: '#334155' }}>
            <span>{isEs ? 'Posología / Instrucciones' : 'Directions / Posology'}</span>
            <textarea
              rows={2}
              value={directions}
              onChange={(e) => setDirections(e.target.value)}
              placeholder={isEs ? 'Aplicar 1 mL cada noche...' : 'Apply 1 mL once nightly...'}
              style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', resize: 'vertical' }}
            />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.74rem', fontWeight: 700, color: '#334155' }}>
              <span>{isEs ? 'Lote (opcional)' : 'Lot # (optional)'}</span>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                placeholder="PH-2026-001"
                style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontFamily: 'monospace' }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.74rem', fontWeight: 700, color: '#334155' }}>
              <span>{isEs ? 'Caducidad BUD (opcional)' : 'BUD / Expiry (optional)'}</span>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
              />
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
            >
              {isEs ? 'Cancelar' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#1a73e8', color: '#ffffff', fontWeight: 700, fontSize: '0.8rem', cursor: submitting ? 'not-allowed' : 'pointer' }}
            >
              {submitting ? (isEs ? 'Creando...' : 'Creating...') : (isEs ? 'Crear y Abrir Etiqueta' : 'Create & Open Studio')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
