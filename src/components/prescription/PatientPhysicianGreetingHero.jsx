"use client";

import React from 'react';
import { ShieldCheck, Calendar, MessageSquare, Sun, Moon, Clock, UserCheck, Stethoscope, Sparkles } from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';

/**
 * PatientPhysicianGreetingHero
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud UX compliant, Trust-First Hero for Patients.
 * 
 * Solves the cognitive overload by unifying 4 previous fragmented cards:
 * 1. Immediate clinical trust anchor (Prescribing Physician photo & credentials).
 * 2. Warm personal greeting to the patient.
 * 3. Integrated personalized clinical note from the doctor.
 * 4. Human-friendly regimen summary (Morning / Evening / Duration pills).
 * 5. Single, non-duplicated action cluster (Sync to Calendar & Contact Doctor).
 * 
 * Strictly zero commercial pressure upfront (Regla #26 Progressive Disclosure).
 */
export default function PatientPhysicianGreetingHero({
  patientName = 'Patient',
  patientRef = '',
  doctorName = 'Dr. Marina Cordeiro Fernandes',
  doctorSpecialty = 'Longevity & Functional Medicine',
  doctorClinic = 'Atlas Health Services',
  doctorNote = '',
  formulationsCount = 2,
  onSyncCalendar = null,
  onOpenDoctorContact = null,
  isEs = false
}) {
  return (
    <div
      className="rx-card patient-physician-greeting-hero"
      style={{
        position: 'relative',
        background: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #dadce0',
        boxShadow: 'none',
        padding: '1.25rem 1.5rem',
        marginBottom: '1rem',
        overflow: 'hidden',
      }}
    >
      {/* Top Bar: Doctor Identity & Verification Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          paddingBottom: '0.85rem',
          borderBottom: '1px solid #f1f3f4',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '6px',
              background: '#f1f5f9',
              color: '#003666',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            <Stethoscope size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.90rem', fontWeight: 700, color: '#202124' }}>
                {doctorName}
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  fontSize: '0.66rem',
                  fontWeight: 600,
                  color: '#137333',
                  background: '#e6f4ea',
                  padding: '1px 6px',
                  borderRadius: '4px',
                }}
              >
                <ShieldCheck size={11} />
                <span>{isEs ? 'Médico Colegiado' : 'Verified Physician'}</span>
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#5f6368', marginTop: '1px' }}>
              {doctorSpecialty} • {doctorClinic}
            </div>
          </div>
        </div>

        {/* Action Cluster (Single, clean place for patient actions) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onSyncCalendar && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                onSyncCalendar();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '4px',
                background: '#ffffff',
                border: '1px solid #dadce0',
                color: '#1a73e8',
                fontSize: '0.76rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title={isEs ? 'Añadir tomas al calendario' : 'Sync doses to calendar'}
            >
              <Calendar size={13} color="#1a73e8" />
              <span>{isEs ? 'Añadir a Calendario' : 'Sync Calendar'}</span>
            </button>
          )}

          {onOpenDoctorContact && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                onOpenDoctorContact();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '4px',
                background: '#ffffff',
                border: '1px solid #dadce0',
                color: '#3c4043',
                fontSize: '0.76rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title={isEs ? 'Contactar con la clínica' : 'Send question to doctor'}
            >
              <MessageSquare size={13} color="#5f6368" />
              <span>{isEs ? 'Consultar al Médico' : 'Contact Doctor'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Greeting & Clinical Summary */}
      <div style={{ marginBottom: '0.85rem' }}>
        <h1
          style={{
            margin: '0 0 0.35rem 0',
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#0f172a',
            letterSpacing: '-0.01em',
          }}
        >
          {isEs ? `Bienvenido, ${patientName}` : `Welcome, ${patientName}`}
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: '0.82rem',
            lineHeight: 1.5,
            color: '#475569',
            maxWidth: '680px',
          }}
        >
          {isEs
            ? `Tu médico ha prescrito ${formulationsCount} fórmulas personalizadas preparadas para ti. A continuación encontrarás la guía de toma clara, para qué sirve cada una y cómo conservarla.`
            : `Your physician has prepared ${formulationsCount} custom clinical formulations for your care. Below you will find your clear posology schedule, the clinical purpose of each formula, and simple guidance.`}
        </p>
      </div>

      {/* Doctor's Personalized Clinical Note (Integrated, Not Floating) */}
      {doctorNote && (
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            marginBottom: '0.9rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
          }}
        >
          <div
            style={{
              padding: '4px',
              borderRadius: '4px',
              background: '#e0f2fe',
              color: '#0284c7',
              marginTop: '1px',
              flexShrink: 0,
            }}
          >
            <Sparkles size={14} />
          </div>
          <div>
            <div
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: '#0369a1',
                marginBottom: '2px',
              }}
            >
              {isEs ? `Instrucción personal de ${doctorName}` : `Personal Note from ${doctorName}`}
            </div>
            <div
              style={{
                fontSize: '0.84rem',
                fontWeight: 600,
                color: '#1e293b',
                lineHeight: 1.45,
              }}
            >
              “{doctorNote}”
            </div>
          </div>
        </div>
      )}

      {/* High-Level Regimen Schedule Chips (Human-Readable Overview) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '4px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            fontSize: '0.74rem',
            fontWeight: 600,
            color: '#334155',
          }}
        >
          <Sun size={13} color="#475569" />
          <span>{isEs ? 'Toma Matutina (Desayuno)' : 'Morning Regimen (Breakfast)'}</span>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '4px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            fontSize: '0.74rem',
            fontWeight: 600,
            color: '#334155',
          }}
        >
          <Moon size={13} color="#475569" />
          <span>{isEs ? 'Toma Nocturna (Antes de Dormir)' : 'Night Regimen (Before Sleep)'}</span>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '4px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            fontSize: '0.74rem',
            fontWeight: 600,
            color: '#475569',
          }}
        >
          <Clock size={13} color="#64748b" />
          <span>{isEs ? '60 Días de Tratamiento' : '60 Daily Doses (2 Months)'}</span>
        </div>
      </div>
    </div>
  );
}
