'use client';

import React from 'react';
import Stethoscope from 'lucide-react/dist/esm/icons/stethoscope';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import Users from 'lucide-react/dist/esm/icons/users';
import Pill from 'lucide-react/dist/esm/icons/pill';
import X from 'lucide-react/dist/esm/icons/x';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';

/**
 * IndividualDoctorSimulationBanner
 * ─────────────────────────────────────────────────────────────────────────────
 * Displayed when an administrator or evaluator is simulating the portal as
 * Dr. Hanieh Erdmann (German Specialist Dermatologist & Trichologist).
 */
export default function IndividualDoctorSimulationBanner({
  doctor = {
    name: 'Dr. Hanieh Erdmann',
    title: 'German Board Certified Specialist Dermatologist & Trichologist',
    license: 'DHA-00013060-006',
    clinic: 'Bedaya Polyclinic L.L.C. (Dubai)'
  },
  patientCount = 12,
  prescriptionCount = 18,
  onExit
}) {
  return (
    <div
      style={{
        background: 'linear-gradient(90deg, #003666 0%, #005a9c 100%)',
        color: '#ffffff',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.82rem',
        borderBottom: '2px solid #00a3e0',
        gap: '12px',
        flexWrap: 'wrap',
        boxShadow: '0 2px 10px rgba(0, 54, 102, 0.15)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}
    >
      {/* Left: Physician Persona & Credentials */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '6px',
            padding: '5px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.78rem',
            fontWeight: 800,
            letterSpacing: '0.5px'
          }}
        >
          <span>🇩🇪</span>
          <span>INDIVIDUAL DOCTOR SIMULATION</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <strong style={{ fontSize: '0.92rem', color: '#ffffff' }}>{doctor.name}</strong>
          <span style={{ opacity: 0.8 }}>•</span>
          <span style={{ color: '#e0f2fe', fontSize: '0.78rem' }}>{doctor.title}</span>
        </div>

        <div
          style={{
            background: 'rgba(0, 163, 224, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '12px',
            padding: '2px 8px',
            fontSize: '0.72rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: '#ffffff'
          }}
        >
          <ShieldCheck size={12} color="#38bdf8" />
          <span>{doctor.license}</span>
        </div>

        <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.75)' }}>
          📍 {doctor.clinic}
        </span>
      </div>

      {/* Right: Scope Badges & Exit Action */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              padding: '3px 8px',
              borderRadius: '4px',
              fontSize: '0.74rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Users size={12} color="#7dd3fc" />
            <span>Strict Scope: <strong>{patientCount} Assigned {patientCount === 1 ? 'Patient' : 'Patients'}</strong></span>
          </span>
          <span
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              padding: '3px 8px',
              borderRadius: '4px',
              fontSize: '0.74rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Pill size={12} color="#a7f3d0" />
            <span><strong>{prescriptionCount} Active {prescriptionCount === 1 ? 'Prescription' : 'Prescriptions'}</strong></span>
          </span>
        </div>

        {onExit && (
          <button
            onClick={onExit}
            style={{
              background: '#ffffff',
              color: '#003666',
              border: 'none',
              padding: '5px 12px',
              borderRadius: '6px',
              fontWeight: 800,
              fontSize: '0.76rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = '#f0fdf4'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = '#ffffff'; }}
          >
            <ArrowLeft size={13} />
            <span>Exit Simulation</span>
          </button>
        )}
      </div>
    </div>
  );
}
