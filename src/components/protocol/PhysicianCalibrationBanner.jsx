"use client";

import React from 'react';
import { Stethoscope, CheckCircle2, Sparkles, X, ShieldCheck, ArrowRight } from 'lucide-react';

export default function PhysicianCalibrationBanner({ calibration, onReset }) {
  if (!calibration) return null;

  const {
    doctorName,
    patientName,
    rxCode,
    calibratedApi,
    calibratedDose,
    standardDose,
    status
  } = calibration;

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        border: '1px solid #7dd3fc',
        borderRadius: '12px',
        padding: '14px 20px',
        marginBottom: '20px',
        boxShadow: '0 4px 12px rgba(2, 132, 199, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#0284c7',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Stethoscope size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0369a1' }}>
                Physician Clinical Calibration Active
              </span>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 750,
                  background: '#0284c7',
                  color: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  letterSpacing: '0.02em'
                }}
              >
                DR. {String(doctorName || 'PHYSICIAN').toUpperCase()}
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#0c4a6e', marginTop: '2px' }}>
              Patient Dossier: <strong>{patientName || 'Clinical Patient'}</strong> {rxCode ? `(Prescription #${rxCode})` : ''}
            </div>
          </div>
        </div>

        {onReset && (
          <button
            type="button"
            onClick={onReset}
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              color: '#0369a1',
              background: '#ffffff',
              border: '1px solid #bae6fd',
              padding: '4px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>Reset to Standard Protocol View</span>
            <X size={12} />
          </button>
        )}
      </div>

      {/* Calibration Comparison Details */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '8px',
          background: '#ffffff',
          borderRadius: '8px',
          padding: '10px 14px',
          border: '1px solid #bae6fd'
        }}
      >
        <div>
          <div style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Doctor&apos;s Calibrated Formulation
          </div>
          <div style={{ fontSize: '0.84rem', fontWeight: 750, color: '#0f172a', marginTop: '2px' }}>
            {calibratedApi}: <span style={{ color: '#0284c7' }}>{calibratedDose}</span>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Standard Atlas Benchmark
          </div>
          <div style={{ fontSize: '0.84rem', fontWeight: 650, color: '#475569', marginTop: '2px' }}>
            {standardDose || 'Standard Literature Range'}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Calibration Status
          </div>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#15803d', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={13} color="#16a34a" />
            <span>Physician Sovereign Calibration Applied</span>
          </div>
        </div>
      </div>

      <div style={{ fontSize: '0.72rem', color: '#0369a1', lineHeight: 1.45 }}>
        ℹ️ <strong>System Note:</strong> Atlas recognizes and preserves Dr. {doctorName}&apos;s personalized dosing calibration. This protocol view incorporates the doctor&apos;s active clinical decision without altering standard pharmacopeia baseline data.
      </div>
    </div>
  );
}
