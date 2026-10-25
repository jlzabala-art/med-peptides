"use client";

import React from 'react';

/**
 * PrescriptionTrustWatermark
 * ─────────────────────────────────────────────────────────────────────────────
 * Subtle, luxury clinical watermark and security seal rendered in the background
 * of public prescription dossiers.
 * 
 * - mode="patient": Soothing teal/emerald wellness seal with stylized botanical/DNA motif,
 *   reinforcing patient calm, safety, and certified EU GMP quality.
 * - mode="doctor": High-density corporate navy GCP clinical governance seal with Rx (℞)
 *   insignia, reinforcing legal compliance, full posology audit, and professional authority.
 * 
 * Fully non-interactive (pointer-events: none), responsive, and ultra-low opacity (0.035 - 0.05)
 * so it never compromises text contrast or readability.
 */
export default function PrescriptionTrustWatermark({ mode = 'patient' }) {
  const isPatient = mode === 'patient';

  return (
    <div
      aria-hidden="true"
      className="prescription-trust-watermark-root"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        userSelect: 'none',
      }}
    >
      {/* ── Patient Mode: Calming Clinical Care & EU GMP Quality Seal ─────── */}
      {isPatient ? (
        <div
          style={{
            position: 'absolute',
            top: '80px',
            right: '-60px',
            width: '520px',
            height: '520px',
            opacity: 0.045,
            transform: 'rotate(-8deg)',
            transition: 'opacity 0.3s ease',
          }}
        >
          <svg viewBox="0 0 500 500" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="patientSealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0d9488" />
                <stop offset="50%" stopColor="#16a34a" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
              <path
                id="patientSealTextPathOuter"
                d="M 250, 250 m -215, 0 a 215,215 0 1,1 430,0 a 215,215 0 1,1 -430,0"
              />
              <path
                id="patientSealTextPathInner"
                d="M 250, 250 m -165, 0 a 165,165 0 1,1 330,0 a 165,165 0 1,1 -330,0"
              />
            </defs>

            {/* Outer Decorative Concentric Rings */}
            <circle cx="250" cy="250" r="240" stroke="url(#patientSealGrad)" strokeWidth="2.5" strokeDasharray="6 4" />
            <circle cx="250" cy="250" r="226" stroke="url(#patientSealGrad)" strokeWidth="1" />
            <circle cx="250" cy="250" r="195" stroke="url(#patientSealGrad)" strokeWidth="1.5" />
            <circle cx="250" cy="250" r="145" stroke="url(#patientSealGrad)" strokeWidth="2" strokeDasharray="3 3" />
            <circle cx="250" cy="250" r="135" stroke="url(#patientSealGrad)" strokeWidth="1" />

            {/* Circular Perimeter Typography */}
            <text fill="#0f766e" fontSize="13.5" fontWeight="700" letterSpacing="4.5">
              <textPath href="#patientSealTextPathOuter" startOffset="0%">
                ★ ATLAS HEALTH SERVICES • OFFICIAL CLINICAL PRESCRIPTION • EU GMP COMPLIANT ★
              </textPath>
            </text>

            <text fill="#166534" fontSize="11" fontWeight="600" letterSpacing="3.5">
              <textPath href="#patientSealTextPathInner" startOffset="5%">
                VERIFIED PHYSICIAN SIGNATURE • PATIENT WELLNESS ASSURANCE • CLEANROOM DISPENSED •
              </textPath>
            </text>

            {/* Central Medical Loto / Helix Emblem */}
            <g transform="translate(250, 250)">
              {/* Central Petals / Bio Shield */}
              <path
                d="M 0,-85 C 35,-45 45,-15 0,35 C -45,-15 -35,-45 0,-85 Z"
                fill="url(#patientSealGrad)"
                opacity="0.35"
              />
              <path
                d="M 0,-85 C 35,-45 45,-15 0,35 C -45,-15 -35,-45 0,-85 Z"
                transform="rotate(60)"
                fill="url(#patientSealGrad)"
                opacity="0.25"
              />
              <path
                d="M 0,-85 C 35,-45 45,-15 0,35 C -45,-15 -35,-45 0,-85 Z"
                transform="rotate(-60)"
                fill="url(#patientSealGrad)"
                opacity="0.25"
              />
              <path
                d="M 0,-85 C 35,-45 45,-15 0,35 C -45,-15 -35,-45 0,-85 Z"
                transform="rotate(120)"
                fill="url(#patientSealGrad)"
                opacity="0.2"
              />
              <path
                d="M 0,-85 C 35,-45 45,-15 0,35 C -45,-15 -35,-45 0,-85 Z"
                transform="rotate(-120)"
                fill="url(#patientSealGrad)"
                opacity="0.2"
              />
              <path
                d="M 0,-85 C 35,-45 45,-15 0,35 C -45,-15 -35,-45 0,-85 Z"
                transform="rotate(180)"
                fill="url(#patientSealGrad)"
                opacity="0.25"
              />

              {/* Heart & Cross Core */}
              <circle cx="0" cy="0" r="28" fill="#ffffff" stroke="url(#patientSealGrad)" strokeWidth="2" />
              <path
                d="M -5,-14 H 5 V -5 H 14 V 5 H 5 V 14 H -5 V 5 H -14 V -5 H -5 Z"
                fill="#0d9488"
              />
            </g>
          </svg>
        </div>
      ) : (
        /* ── Doctor Mode: GCP Corporate Clinical Governance & Rx Seal ────────── */
        <div
          style={{
            position: 'absolute',
            top: '70px',
            right: '-40px',
            width: '540px',
            height: '540px',
            opacity: 0.05,
            transform: 'rotate(5deg)',
            transition: 'opacity 0.3s ease',
          }}
        >
          <svg viewBox="0 0 500 500" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="doctorSealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#003666" />
                <stop offset="60%" stopColor="#1a73e8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
              <path
                id="doctorSealTextPathOuter"
                d="M 250, 250 m -215, 0 a 215,215 0 1,1 430,0 a 215,215 0 1,1 -430,0"
              />
              <path
                id="doctorSealTextPathInner"
                d="M 250, 250 m -165, 0 a 165,165 0 1,1 330,0 a 165,165 0 1,1 -330,0"
              />
            </defs>

            {/* Geometric Outer Gear & Regulatory Rings */}
            <circle cx="250" cy="250" r="240" stroke="url(#doctorSealGrad)" strokeWidth="2.5" />
            <circle cx="250" cy="250" r="230" stroke="url(#doctorSealGrad)" strokeWidth="1" strokeDasharray="4 2" />
            <circle cx="250" cy="250" r="195" stroke="url(#doctorSealGrad)" strokeWidth="1.5" />
            <circle cx="250" cy="250" r="145" stroke="url(#doctorSealGrad)" strokeWidth="2" />
            <circle cx="250" cy="250" r="135" stroke="url(#doctorSealGrad)" strokeWidth="1" strokeDasharray="5 5" />

            {/* Circular Perimeter Typography */}
            <text fill="#003666" fontSize="13" fontWeight="800" letterSpacing="4">
              <textPath href="#doctorSealTextPathOuter" startOffset="0%">
                ★ ATLAS CLINICAL OPERATING SYSTEM • AUTHORIZED MEDICAL DIRECTORY • CLINICAL AUDIT ★
              </textPath>
            </text>

            <text fill="#1a73e8" fontSize="11" fontWeight="700" letterSpacing="3">
              <textPath href="#doctorSealTextPathInner" startOffset="4%">
                STERILE & COMPOUNDED FORMULARY • ZERO-TRUST GOVERNANCE • EU PHARMACOPEIA QA •
              </textPath>
            </text>

            {/* Central Heraldic Rx Medical Emblem */}
            <g transform="translate(250, 250)">
              {/* Outer Shield */}
              <path
                d="M 0,-90 L 65,-55 L 65,25 C 65,70 0,100 0,100 C 0,100 -65,70 -65,25 L -65,-55 Z"
                stroke="url(#doctorSealGrad)"
                strokeWidth="2.5"
                fill="none"
              />
              <path
                d="M 0,-80 L 55,-50 L 55,20 C 55,60 0,85 0,85 C 0,85 -55,60 -55,20 L -55,-50 Z"
                fill="url(#doctorSealGrad)"
                opacity="0.12"
              />

              {/* Classic Prescription Monogram (Rx / ℞) */}
              <text
                x="-2"
                y="35"
                textAnchor="middle"
                fontFamily="Georgia, serif"
                fontSize="92"
                fontWeight="900"
                fill="url(#doctorSealGrad)"
                opacity="0.85"
              >
                ℞
              </text>
            </g>
          </svg>
        </div>
      )}
    </div>
  );
}
