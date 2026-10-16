"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, X, Check, Loader2, Sparkles, AlertCircle, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { calculateTreatmentDates } from '@/utils/clinical/clinicalFormulations';
import { triggerHaptic } from '@/utils/haptics';

/**
 * EditTreatmentDurationModal
 * ─────────────────────────────────────────────────────────────────────────────
 * Dedicated, mobile-first responsive pop-up modal for adjusting treatment start
 * date, posology duration, and projected completion date.
 *
 * Conforms to Google Cloud Console design standards:
 * - Explicit ✕ button and ESC key listener
 * - Touch targets >= 44px for mobile devices
 * - Live bidirectional date/duration calculations
 * - Non-blocking async submission with loading feedback (Rule #25)
 */
export default function EditTreatmentDurationModal({
  isOpen,
  onClose,
  prescription,
  onSave
}) {
  if (!isOpen || !prescription) return null;

  return (
    <EditTreatmentDurationModalDialog
      key={prescription.id || prescription.code}
      onClose={onClose}
      prescription={prescription}
      onSave={onSave}
    />
  );
}

function EditTreatmentDurationModalDialog({
  onClose,
  prescription,
  onSave
}) {
  const initialDates = useMemo(() => calculateTreatmentDates(prescription), [prescription]);
  const [startDate, setStartDate] = useState(initialDates.startDate || new Date().toISOString().slice(0, 10));
  const [durationDays, setDurationDays] = useState(initialDates.durationDays || 30);
  const [isSaving, setIsSaving] = useState(false);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Live calculation of preview dates
  const liveDates = useMemo(() => {
    return calculateTreatmentDates(prescription, startDate, durationDays);
  }, [prescription, startDate, durationDays]);

  const patientName = prescription.patientName || prescription.patient?.name || 'Patient';
  const rxCode = prescription.prescriptionNumber || prescription.code || prescription.id || 'RX-MED';
  const treatmentTitle = prescription.treatmentTitle || prescription.regimenShortTitle || 'Precision Regimen';
  const invoiceRef = prescription.invoiceRef || prescription.invoiceNumber;
  const itemSubtitle = (prescription.items && prescription.items.length > 0)
    ? prescription.items.map(i => `${i.name || ''} ${i.dose || ''}`.trim()).filter(Boolean).join(' · ')
    : null;

  // Preset helpers
  const setQuickDate = (type) => {
    triggerHaptic('selection');
    const now = new Date();
    if (type === 'today') {
      setStartDate(now.toISOString().slice(0, 10));
    } else if (type === 'nextMonday') {
      const day = now.getDay();
      const diff = (8 - day) % 7 || 7;
      now.setDate(now.getDate() + diff);
      setStartDate(now.toISOString().slice(0, 10));
    } else if (type === 'nextMonth') {
      const nextM = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      setStartDate(nextM.toISOString().slice(0, 10));
    }
  };

  const setPresetDuration = (days) => {
    triggerHaptic('selection');
    setDurationDays(days);
  };

  const handleFormSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      setIsSaving(true);
      triggerHaptic('medium');
      await onSave({
        prescription,
        startDate,
        durationDays: Number(durationDays) || 30,
        endDate: liveDates?.endDate
      });
      onClose();
    } catch (err) {
      console.error('Error in EditTreatmentDurationModal:', err);
      toast.error(err.message || 'Could not update treatment schedule');
    } finally {
      setIsSaving(false);
    }
  };

  const durationPresets = [
    { label: '14 Days', days: 14, sub: '2 wks' },
    { label: '30 Days', days: 30, sub: '1 mo' },
    { label: '60 Days', days: 60, sub: '2 mos' },
    { label: '90 Days', days: 90, sub: '3 mos' },
    { label: '180 Days', days: 180, sub: '6 mos' }
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          maxHeight: '92vh',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeInUp 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 22px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1a73e8',
                flexShrink: 0
              }}
            >
              <Calendar size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em' }}>
                Edit Treatment Timeline
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                Schedule start date & clinical duration for <strong style={{ color: '#0f172a' }}>{patientName}</strong>
              </p>
            </div>
          </div>

          {/* Explicit ✕ Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f1f5f9';
              e.currentTarget.style.color = '#0f172a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.color = '#64748b';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div style={{ padding: '20px 22px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* Prescription Context Banner */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
                {treatmentTitle}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: '#1a73e8',
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}
                >
                  {rxCode}
                </span>
                {invoiceRef && (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: '#475569',
                      background: '#e2e8f0',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}
                  >
                    {invoiceRef}
                  </span>
                )}
              </div>
            </div>
            {itemSubtitle && (
              <div style={{ fontSize: '0.76rem', color: '#64748b', lineHeight: 1.3 }}>
                {itemSubtitle}
              </div>
            )}
          </div>

          {/* Section 1: Start Date */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} style={{ color: '#1a73e8' }} />
                <span>Therapy Start Date</span>
              </label>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  type="button"
                  onClick={() => setQuickDate('today')}
                  style={{
                    fontSize: '0.70rem',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate('nextMonday')}
                  style={{
                    fontSize: '0.70rem',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Next Mon
                </button>
              </div>
            </div>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                width: '100%',
                minHeight: '44px',
                padding: '10px 14px',
                fontSize: '0.90rem',
                fontWeight: 600,
                color: '#0f172a',
                border: '1.5px solid #cbd5e1',
                borderRadius: '8px',
                background: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1a73e8'}
              onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
            />
          </div>

          {/* Section 2: Duration */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} style={{ color: '#047857' }} />
                <span>Treatment Duration</span>
              </label>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {Math.round(durationDays / 7)} Weeks total
              </span>
            </div>

            {/* Quick Presets Pills */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', marginBottom: '10px' }}>
              {durationPresets.map((preset) => {
                const isActive = Number(durationDays) === preset.days;
                return (
                  <button
                    key={preset.days}
                    type="button"
                    onClick={() => setPresetDuration(preset.days)}
                    style={{
                      minHeight: '44px',
                      padding: '4px 6px',
                      borderRadius: '8px',
                      border: isActive ? '1.5px solid #1a73e8' : '1px solid #cbd5e1',
                      background: isActive ? '#eff6ff' : '#ffffff',
                      color: isActive ? '#1a73e8' : '#334155',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: isActive ? 700 : 600,
                      transition: 'all 0.12s ease'
                    }}
                  >
                    <span style={{ fontSize: '0.76rem' }}>{preset.days}d</span>
                    <span style={{ fontSize: '0.62rem', opacity: 0.75 }}>{preset.sub}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Days Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number"
                min="1"
                max="365"
                value={durationDays}
                onChange={(e) => setDurationDays(Math.max(1, parseInt(e.target.value, 10) || 1))}
                style={{
                  width: '90px',
                  minHeight: '44px',
                  padding: '8px 12px',
                  fontSize: '0.90rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '8px',
                  textAlign: 'center',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#1a73e8'}
                onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
              />
              <span style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
                custom consecutive days
              </span>
            </div>
          </div>

          {/* Section 3: Live Projected Timeline Box */}
          <div
            style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
              border: '1px solid #bbf7d0',
              borderRadius: '12px',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} style={{ color: '#059669' }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Projected Clinical Schedule
                </span>
              </div>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#047857',
                  background: '#dcfce7',
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}
              >
                {liveDates?.durationLabel || `${durationDays} Days`}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#047857' }}>START DATE</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#064e3b' }}>
                  {liveDates?.startFormatted || startDate}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', color: '#059669', opacity: 0.7 }}>
                <ArrowRight size={18} />
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#047857' }}>PROJECTED COMPLETION</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#064e3b' }}>
                  {liveDates?.endFormatted || 'Calculating...'}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.70rem', color: '#047857', opacity: 0.85, borderTop: '1px dashed #a7f3d0', paddingTop: '8px' }}>
              Atlas Dispensary will align adherence tracking and refill readiness notifications based on this timeline.
            </div>
          </div>
        </div>

        {/* Modal Footer / Actions */}
        <div
          style={{
            padding: '14px 22px',
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            style={{
              minHeight: '44px',
              padding: '0 16px',
              fontSize: '0.84rem',
              fontWeight: 600,
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#475569',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleFormSubmit}
            style={{
              minHeight: '44px',
              padding: '0 20px',
              fontSize: '0.84rem',
              fontWeight: 700,
              borderRadius: '8px',
              border: 'none',
              background: '#1a73e8',
              color: '#ffffff',
              cursor: isSaving ? 'wait' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 6px rgba(26, 115, 232, 0.35)',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={(e) => {
              if (!isSaving) e.currentTarget.style.background = '#1557b0';
            }}
            onMouseLeave={(e) => {
              if (!isSaving) e.currentTarget.style.background = '#1a73e8';
            }}
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving to Firestore...</span>
              </>
            ) : (
              <>
                <Check size={16} />
                <span>Save Timeline</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
