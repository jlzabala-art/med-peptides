'use client';

import React, { useState, useMemo, useEffect } from 'react';
import StatusBadge from '@/components/ui/StatusBadge';
import {
  X,
  Repeat,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Stethoscope,
  Sparkles,
  Layers
} from 'lucide-react';
import toast from 'react-hot-toast';
import { normalizeLabelsArray, getLabelDisplayTitle } from '@/utils/labels/labelContract';

/**
 * Intelligent helper to parse treatment course duration in days from parts or instructions.
 */
function estimateCourseDurationDays(parts = [], labels = []) {
  const combinedText = [
    ...normalizeLabelsArray(parts).map(p => `${p.title || ''} ${p.volume || ''} ${p.directions || ''} ${p.posology || ''}`),
    ...normalizeLabelsArray(labels).map((l, idx) => `${getLabelDisplayTitle(l, idx)} ${l.volume || ''} ${l.directions || ''}`)
  ].join(' ').toLowerCase();

  if (combinedText.includes('3 months') || combinedText.includes('90 days') || combinedText.includes('90 días')) return 90;
  if (combinedText.includes('2 months') || combinedText.includes('60 days') || combinedText.includes('60 días') || combinedText.includes('2 meses')) return 60;
  if (combinedText.includes('1 month') || combinedText.includes('30 days') || combinedText.includes('30 días') || combinedText.includes('1 mes')) return 30;
  if (combinedText.includes('15 days') || combinedText.includes('15 días')) return 15;
  if (combinedText.includes('10 days') || combinedText.includes('10 días')) return 10;
  return 60; // Standard clinical default
}

/**
 * PrescriptionRefillModal
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud UX Modal for Prescription Refill & Cycle Duplication.
 * Allows clinicians/dispensers to selectively choose which compounding parts
 * to reorder, adjusts cycle numbers, and schedules the next refill alert.
 */
export default function PrescriptionRefillModal({
  isOpen,
  onClose,
  currentRx = {},
  labels = [],
  cleanRxCode = '',
  patientName = '',
  docName = '',
  isEs = false,
  presetPartIndex = null,
  onRefillCreated,
  onRefillUpdated,
  onSelectCycleCode,
}) {
  const rawParts = useMemo(() => (
    Array.isArray(currentRx?.parts) && currentRx.parts.length > 0
      ? currentRx.parts
      : (Array.isArray(labels) && labels.length > 0
          ? normalizeLabelsArray(labels).map((l, i) => ({
              title: getLabelDisplayTitle(l, i),
              volume: l.volume || '',
              directions: l.directions || '',
              apis: l.apis || []
            }))
          : [{ title: currentRx?.productTitle || 'Formula 1', volume: currentRx?.volume || '', directions: '' }]
        )
  ), [currentRx, labels]);

  const [activeTab, setActiveTab] = useState('issue'); // 'issue' | 'manage'
  const [selectedIndices, setSelectedIndices] = useState(() => {
    if (typeof presetPartIndex === 'number' && presetPartIndex >= 0 && presetPartIndex < rawParts.length) {
      return [presetPartIndex];
    }
    return rawParts.map((_, i) => i);
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refill cycle calculation
  const currentCycle = Number(currentRx?.refillCycle || 1);
  const nextCycle = currentCycle + 1;
  const newCodePreview = `${cleanRxCode.replace(/-R\d+$/i, '')}-R${nextCycle}`;

  // Course duration & intelligent refill date estimation
  const estimatedDays = useMemo(() => estimateCourseDurationDays(rawParts, labels), [rawParts, labels]);
  const [durationDays, setDurationDays] = useState(estimatedDays);

  const defaultAlertDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + Math.max(durationDays - 15, 5));
    return d.toISOString().split('T')[0];
  }, [durationDays]);

  const [refillDate, setRefillDate] = useState(defaultAlertDate);
  const [operatorNotes, setOperatorNotes] = useState('');

  // Manage existing schedule & cycle history state
  const [cycles, setCycles] = useState([]);
  const [loadingCycles, setLoadingCycles] = useState(false);
  const [manageAlertDate, setManageAlertDate] = useState('');
  const [manageAlertStatus, setManageAlertStatus] = useState('scheduled');
  const [manageDurationDays, setManageDurationDays] = useState(60);
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);

  // Resynchronize selection and fetch cycle history whenever modal opens or prescription/part changes
  useEffect(() => {
    if (!isOpen) return;
    if (typeof presetPartIndex === 'number' && presetPartIndex >= 0 && presetPartIndex < rawParts.length) {
      setSelectedIndices([presetPartIndex]);
    } else {
      setSelectedIndices(rawParts.map((_, i) => i));
    }
    setDurationDays(estimatedDays);
    setManageAlertDate(currentRx?.refillAlertDate || currentRx?.nextRefillDate || defaultAlertDate);
    setManageAlertStatus(currentRx?.refillAlertStatus || 'scheduled');
    setManageDurationDays(Number(currentRx?.courseDurationDays || estimatedDays || 60));

    const rxId = currentRx?.id || cleanRxCode;
    if (!rxId) return;
    let cancelled = false;
    setLoadingCycles(true);
    fetch(`/api/prescriptions/refill?prescriptionId=${encodeURIComponent(rxId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data?.success && Array.isArray(data.cycles)) {
          setCycles(data.cycles);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingCycles(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, currentRx?.id, cleanRxCode, presetPartIndex, rawParts.length, estimatedDays, defaultAlertDate]);

  if (!isOpen) return null;

  const togglePart = (idx) => {
    setSelectedIndices(prev => {
      if (prev.includes(idx)) {
        if (prev.length === 1) {
          toast.error(isEs ? 'Debes seleccionar al menos una fórmula para el refill' : 'You must select at least one formula for refill');
          return prev;
        }
        return prev.filter(i => i !== idx);
      }
      return [...prev, idx].sort((a, b) => a - b);
    });
  };

  const handleSaveSchedule = async () => {
    const rxId = currentRx?.id || cleanRxCode;
    if (!rxId) return;
    setIsSavingSchedule(true);
    try {
      const res = await fetch('/api/prescriptions/refill', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prescriptionId: rxId,
          refillAlertDate: manageAlertDate,
          refillAlertStatus: manageAlertStatus,
          courseDurationDays: Number(manageDurationDays),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update schedule');
      toast.success(isEs ? 'Programación de refill actualizada' : 'Refill schedule updated');
      if (typeof onRefillUpdated === 'function') {
        onRefillUpdated(data);
      }
    } catch (err) {
      toast.error(err.message || 'Error updating refill schedule');
    } finally {
      setIsSavingSchedule(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedIndices.length === 0) {
      toast.error(isEs ? 'Selecciona al menos una parte' : 'Select at least one formula part');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/prescriptions/refill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourcePrescriptionId: currentRx?.id || cleanRxCode,
          selectedPartIndices: selectedIndices,
          refillCycle: nextCycle,
          courseDurationDays: Number(durationDays),
          nextRefillDate: refillDate,
          operatorNotes: operatorNotes.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create refill');
      }

      toast.success(
        isEs
          ? `¡Refill #${data.newCode} creado con éxito!`
          : `Refill #${data.newCode} created successfully!`
      );

      if (typeof onRefillCreated === 'function') {
        onRefillCreated(data);
      }
      onClose();
    } catch (err) {
      console.error('[PrescriptionRefillModal] Error:', err);
      toast.error(err.message || 'Error processing refill');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.15s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          width: '100%',
          maxWidth: '580px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.22), 0 4px 12px rgba(0,0,0,0.08)',
          border: '1px solid #cbd5e1',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── HEADER ── */}
        <div style={{
          padding: '1.1rem 1.4rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Repeat size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>
                {isEs ? 'Duplicar / Renovar Prescripción (Refill)' : 'Refill / Duplicate Prescription'}
              </h2>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Rx #{cleanRxCode}</span>
                <span>•</span>
                <span>{patientName || 'Patient'}</span>
                <span>•</span>
                <span>{docName || 'Doctor'}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* ── TABS: Issue New Cycle vs Manage Schedule & History ── */}
        <div style={{
          display: 'flex',
          gap: '4px',
          padding: '8px 1.4rem',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('issue')}
            style={{
              flex: 1,
              padding: '7px 10px',
              borderRadius: '6px',
              border: activeTab === 'issue' ? '1px solid #10b981' : '1px solid transparent',
              background: activeTab === 'issue' ? '#ecfdf5' : 'transparent',
              color: activeTab === 'issue' ? '#065f46' : '#64748b',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {isEs ? '1. Renovar / Nuevo Ciclo' : '1. Issue New Cycle'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manage')}
            style={{
              flex: 1,
              padding: '7px 10px',
              borderRadius: '6px',
              border: activeTab === 'manage' ? '1px solid #0284c7' : '1px solid transparent',
              background: activeTab === 'manage' ? '#eff6ff' : 'transparent',
              color: activeTab === 'manage' ? '#1e40af' : '#64748b',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {isEs ? `2. Alertas e Historial (${cycles.length || 1})` : `2. Schedule & History (${cycles.length || 1})`}
          </button>
        </div>

        {activeTab === 'manage' ? (
          <div style={{ overflowY: 'auto', padding: '1.25rem 1.4rem', flex: 1 }}>
            <div style={{
              padding: '12px 14px',
              borderRadius: '8px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              marginBottom: '1rem'
            }}>
              <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '10px' }}>
                {isEs ? 'Programación actual de este ciclo' : 'Current Cycle Refill Schedule'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    {isEs ? 'Estado de alerta' : 'Alert Status'}
                  </label>
                  <select
                    value={manageAlertStatus}
                    onChange={(e) => setManageAlertStatus(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem', background: '#fff' }}
                  >
                    <option value="scheduled">{isEs ? 'Programado' : 'Scheduled'}</option>
                    <option value="completed">{isEs ? 'Completado' : 'Completed'}</option>
                    <option value="paused">{isEs ? 'Pausado' : 'Paused'}</option>
                    <option value="cancelled">{isEs ? 'Cancelado' : 'Cancelled'}</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    {isEs ? 'Próxima fecha de refill' : 'Next Refill Alert Date'}
                  </label>
                  <input
                    type="date"
                    value={manageAlertDate}
                    onChange={(e) => setManageAlertDate(e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem', background: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    {isEs ? 'Duración (días)' : 'Duration (days)'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={manageDurationDays}
                    onChange={(e) => setManageDurationDays(e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem', background: '#fff' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  disabled={isSavingSchedule}
                  onClick={handleSaveSchedule}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#1a73e8',
                    color: '#fff',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: isSavingSchedule ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSavingSchedule ? (isEs ? 'Guardando...' : 'Saving...') : (isEs ? 'Guardar Programación' : 'Save Schedule')}
                </button>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '8px' }}>
                {isEs ? 'Cadena de Ciclos (Refill Lineage)' : 'Refill Cycle Lineage'}
              </div>
              {loadingCycles ? (
                <div style={{ fontSize: '0.8rem', color: '#64748b', padding: '12px 0' }}>
                  {isEs ? 'Cargando historial de ciclos...' : 'Loading cycle history...'}
                </div>
              ) : cycles.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: '#64748b', padding: '12px 0' }}>
                  {isEs ? 'Sin ciclos previos registrados.' : 'No prior cycles recorded.'}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {cycles.map((c) => {
                    const isCurrent = c.code === cleanRxCode || c.id === currentRx?.id;
                    return (
                      <div
                        key={c.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: isCurrent ? '1.5px solid #1a73e8' : '1px solid #e2e8f0',
                          background: isCurrent ? '#eff6ff' : '#ffffff'
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <strong style={{ fontSize: '0.82rem', color: '#0f172a' }}>#{c.code}</strong>
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569', background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px' }}>
                              {isEs ? `Ciclo ${c.refillCycle}` : `Cycle ${c.refillCycle}`}
                            </span>
                            <StatusBadge status={c.refillAlertStatus || c.status} />
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '3px' }}>
                            {c.partsCount} {isEs ? 'partes' : 'parts'} · {c.refillAlertDate ? `${isEs ? 'Próx. alerta' : 'Next alert'}: ${c.refillAlertDate}` : (isEs ? 'Sin alerta' : 'No alert date')}
                          </div>
                        </div>
                        {!isCurrent && typeof onSelectCycleCode === 'function' && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectCycleCode(c.code);
                              onClose();
                            }}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              background: '#fff',
                              color: '#1a73e8',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              flexShrink: 0
                            }}
                          >
                            {isEs ? 'Abrir en Estudio' : 'Open in Studio'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
        /* ── FORM CONTENT ── */
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '1.25rem 1.4rem', flex: 1 }}>
          {/* New Cycle Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            backgroundColor: '#eff6ff',
            borderRadius: '8px',
            border: '1px solid #bfdbfe',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="#2563eb" />
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e40af' }}>
                  {isEs ? 'Nuevo Código Asignado' : 'Assigned Refill Identifier'}:
                </div>
                <div style={{ fontSize: '0.72rem', color: '#3b82f6' }}>
                  {isEs ? 'Clonado con historial clínico vinculado' : 'Cloned with linked clinical lineage'}
                </div>
              </div>
            </div>
            <span style={{
              fontSize: '0.88rem',
              fontWeight: 800,
              padding: '3px 10px',
              backgroundColor: '#ffffff',
              color: '#1d4ed8',
              borderRadius: '6px',
              border: '1px solid #93c5fd'
            }}>
              #{newCodePreview}
            </span>
          </div>

          {/* Selective Parts Picker */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{isEs ? 'Seleccionar fórmulas a renovar:' : 'Select formula parts to include:'}</span>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                {selectedIndices.length} / {rawParts.length} {isEs ? 'activas' : 'selected'}
              </span>
            </div>

            {/* Smart Preset Quick Switches (Golden Rule #5) */}
            {rawParts.length > 1 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                background: '#f8fafc',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                marginBottom: '8px',
                gap: '8px'
              }}>
                <span style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 600 }}>
                  {typeof presetPartIndex === 'number' && presetPartIndex >= 0
                    ? (isEs ? `Prefijado en Parte ${presetPartIndex + 1}:` : `Preset to Part ${presetPartIndex + 1}:`)
                    : (isEs ? 'Selección rápida:' : 'Quick toggle:')}
                </span>
                <div style={{ display: 'inline-flex', gap: '6px' }}>
                  {typeof presetPartIndex === 'number' && presetPartIndex >= 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedIndices([presetPartIndex])}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        border: selectedIndices.length === 1 && selectedIndices[0] === presetPartIndex ? '1.5px solid #10b981' : '1px solid #cbd5e1',
                        background: selectedIndices.length === 1 && selectedIndices[0] === presetPartIndex ? '#ecfdf5' : '#ffffff',
                        color: selectedIndices.length === 1 && selectedIndices[0] === presetPartIndex ? '#065f46' : '#64748b',
                        fontSize: '0.68rem',
                        fontWeight: 750,
                        cursor: 'pointer'
                      }}
                    >
                      {isEs ? `Solo Parte ${presetPartIndex + 1}` : `Part ${presetPartIndex + 1} Only`}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedIndices(rawParts.map((_, i) => i))}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      border: selectedIndices.length === rawParts.length ? '1.5px solid #1a73e8' : '1px solid #cbd5e1',
                      background: selectedIndices.length === rawParts.length ? '#e8f0fe' : '#ffffff',
                      color: selectedIndices.length === rawParts.length ? '#1a73e8' : '#64748b',
                      fontSize: '0.68rem',
                      fontWeight: 750,
                      cursor: 'pointer'
                    }}
                  >
                    {isEs ? `Todas las Partes (${rawParts.length})` : `All Parts (${rawParts.length})`}
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {rawParts.map((part, idx) => {
                const isSelected = selectedIndices.includes(idx);
                return (
                  <div
                    key={idx}
                    onClick={() => togglePart(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: isSelected ? '1.5px solid #059669' : '1.5px solid #e2e8f0',
                      backgroundColor: isSelected ? '#f0fdf4' : '#f8fafc',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      opacity: isSelected ? 1 : 0.6
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // handled by parent div
                      style={{ marginTop: '3px', cursor: 'pointer', accentColor: '#059669' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <span style={{ fontSize: '0.84rem', fontWeight: 700, color: isSelected ? '#065f46' : '#64748b' }}>
                          {part.title || `Part ${idx + 1}`}
                        </span>
                        {part.volume && (
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#475569' }}>
                            {part.volume}
                          </span>
                        )}
                      </div>
                      {part.directions && (
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {part.directions}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Intelligent Refill Schedule / Next Refill Date Prompt */}
          <div style={{
            padding: '12px 14px',
            backgroundColor: '#fffbeb',
            borderRadius: '8px',
            border: '1px solid #fde68a',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 800, color: '#b45309', marginBottom: '8px' }}>
              <Clock size={14} color="#d97706" />
              <span>{isEs ? 'Agenda Inteligente de Reposición (Atlas AI)' : 'Intelligent Refill Schedule (Atlas AI)'}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#78350f', marginBottom: '4px' }}>
                  {isEs ? 'Duración del Ciclo (Días)' : 'Course Duration (Days)'}
                </label>
                <input
                  type="number"
                  min="5"
                  max="365"
                  value={durationDays}
                  onChange={(e) => {
                    const days = parseInt(e.target.value, 10) || 60;
                    setDurationDays(days);
                    const d = new Date();
                    d.setDate(d.getDate() + Math.max(days - 15, 5));
                    setRefillDate(d.toISOString().split('T')[0]);
                  }}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem',
                    backgroundColor: '#ffffff'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#78350f', marginBottom: '4px' }}>
                  {isEs ? 'Próxima Alerta de Refill' : 'Next Refill Reminder Date'}
                </label>
                <input
                  type="date"
                  value={refillDate}
                  onChange={(e) => setRefillDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem',
                    backgroundColor: '#ffffff'
                  }}
                />
              </div>
            </div>

            <div style={{ fontSize: '0.7rem', color: '#92400e', marginTop: '8px', lineHeight: 1.3 }}>
              {isEs
                ? 'ℹ️ Al guardar, se enviará una notificación preventiva tanto al médico como al portal del paciente 15 días antes de la fecha de finalización.'
                : 'ℹ️ Saving schedules preventative notifications to both doctor and patient portals 15 days before treatment exhaustion.'}
            </div>
          </div>

          {/* Notes input */}
          <div style={{ marginBottom: '0.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
              {isEs ? 'Notas del operador (opcional):' : 'Operator Notes (optional):'}
            </label>
            <textarea
              rows={2}
              placeholder={isEs ? 'Ej. El paciente solicitó solo la crema nocturna para este segundo mes...' : 'E.g. Patient requested only evening formula for month 2...'}
              value={operatorNotes}
              onChange={(e) => setOperatorNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.8rem',
                resize: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* ── FOOTER ACTIONS ── */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px solid #e2e8f0'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {isEs ? 'Cancelar' : 'Cancel'}
            </button>

            <button
              type="submit"
              disabled={isSubmitting || selectedIndices.length === 0}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 18px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#059669',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <Repeat size={14} />
              <span>{isSubmitting ? (isEs ? 'Creando ciclo...' : 'Creating Refill...') : (isEs ? 'Crear y Guardar Refill' : 'Save & Issue Refill Cycle')}</span>
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}

