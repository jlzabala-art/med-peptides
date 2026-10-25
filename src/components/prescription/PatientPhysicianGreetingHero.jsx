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
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        borderLeft: '5px solid #0d9488',
        boxShadow: '0 2px 8px -2px rgba(13, 148, 136, 0.08), 0 1px 3px rgba(0,0,0,0.04)',
        padding: '1.25rem 1.5rem',
        marginBottom: '1rem',
        overflow: 'hidden',
      }}
    >
      {/* Background soft ambient gradient */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '280px',
          height: '100%',
          background: 'radial-gradient(ellipse at top right, rgba(13, 148, 136, 0.06), transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top Bar: Doctor Identity & Verification Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          paddingBottom: '0.85rem',
          borderBottom: '1px solid #f1f5f9',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0d9488, #0f766e)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1rem',
              boxShadow: '0 2px 6px rgba(13, 148, 136, 0.25)',
              flexShrink: 0,
            }}
          >
            <Stethoscope size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                {doctorName}
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  fontSize: '0.66rem',
                  fontWeight: 700,
                  color: '#0d9488',
                  background: '#f0fdfa',
                  border: '1px solid #ccfbf1',
                  padding: '1px 6px',
                  borderRadius: '10px',
                }}
              >
                <ShieldCheck size={11} />
                {isEs ? 'Médico Colegiado' : 'Verified Physician'}
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '1px' }}>
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
                borderRadius: '6px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                color: '#1e293b',
                fontSize: '0.76rem',
                fontWeight: 650,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title={isEs ? 'Añadir tomas al calendario' : 'Sync doses to calendar'}
            >
              <Calendar size={13} color="#0d9488" />
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
                borderRadius: '6px',
                background: '#f0fdfa',
                border: '1px solid #99f6e4',
                color: '#0f766e',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title={isEs ? 'Contactar con la clínica' : 'Send question to doctor'}
            >
              <MessageSquare size={13} color="#0d9488" />
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
            borderRadius: '16px',
            background: '#fffbeb',
            border: '1px solid #fef3c7',
            fontSize: '0.74rem',
            fontWeight: 700,
            color: '#b45309',
          }}
        >
          <Sun size={13} color="#d97706" />
          <span>{isEs ? 'Toma Matutina (Desayuno)' : 'Morning Regimen (Breakfast)'}</span>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '16px',
            background: '#f5f3ff',
            border: '1px solid #ede9fe',
            fontSize: '0.74rem',
            fontWeight: 700,
            color: '#6d28d9',
          }}
        >
          <Moon size={13} color="#7c3aed" />
          <span>{isEs ? 'Toma Nocturna (Antes de Dormir)' : 'Night Regimen (Before Sleep)'}</span>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '16px',
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
            fontSize: '0.74rem',
            fontWeight: 650,
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
