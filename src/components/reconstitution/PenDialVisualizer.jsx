"use client";

import React from 'react';
import { ShieldCheck, AlertCircle } from '@/lib/icons';

/**
 * PenDialVisualizer
 * ─────────────────────────────────────────────────────────────────────────────
 * Patient-friendly visual click-dial panel for Pre-filled Pens (3 mL) and
 * Standalone 3 mL Refill Cartridges. Never mentions vials or insulin syringes.
 * When `isCartridge` is true, renders a crystal-clear Phase 1 Cartridge Loading diagram.
 */
export default function PenDialVisualizer({
  penClicks = 15,
  volumeMl = 0.15,
  totalDoses = 20,
  strengthLabel = '5 mg',
  isCartridge = false,
  lang = 'en',
}) {
  const isEs = lang === 'es';
  const volStr = Number(volumeMl || 0).toFixed(2);
  const exceedsSingleDial = penClicks > 60;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Phase 1 Visual Diagram ONLY for Standalone 3 mL Refill Cartridge */}
      {isCartridge && (
        <div style={{
          background: '#f0fdf4',
          border: '1.5px solid #86efac',
          borderRadius: '14px',
          padding: '14px 16px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '10px',
          }}>
            <div>
              <div style={{ fontSize: '0.70rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {isEs ? 'Paso Previo Exclusivo · Cartucho de Recambio (3 mL)' : 'Phase 1 Exclusive · Standalone 3 mL Refill Cartridge'}
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                {isEs ? 'Cómo cargar tu cartucho de 3 mL en tu pluma reutilizable' : 'How to load your 3 mL cartridge into your reusable pen'}
              </div>
            </div>
            <span style={{
              fontSize: '0.70rem',
              fontWeight: 700,
              padding: '3px 9px',
              borderRadius: '999px',
              background: '#ffffff',
              border: '1px solid #86efac',
              color: '#15803d',
            }}>
              {isEs ? 'Mismos clics que la pluma precargada' : 'Same dial clicks as pre-filled pen'}
            </span>
          </div>

          <svg
            viewBox="0 0 680 108"
            style={{ width: '100%', height: 'auto', display: 'block', background: '#ffffff', borderRadius: '10px', border: '1px solid #dcfce7' }}
            role="img"
            aria-label={isEs ? 'Diagrama de carga de cartucho de 3 mL en pluma reutilizable' : '3 mL refill cartridge loading schematic into reusable pen'}
          >
            {/* Step A: Unscrew holder */}
            <rect x="14" y="16" width="196" height="76" rx="8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
            <text x="112" y="34" fill="#0f172a" fontSize="10.5" fontWeight="800" textAnchor="middle">
              {isEs ? '1A. Desenroscar & Émbolo a 0' : '1A. Unscrew & Reset Plunger'}
            </text>
            <rect x="30" y="48" width="58" height="16" rx="3" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.2" />
            <path d="M 96 56 L 114 56" stroke="#16a34a" strokeWidth="2" strokeDasharray="3 2" />
            <rect x="120" y="46" width="74" height="20" rx="3" fill="#003666" />
            <text x="112" y="82" fill="#475569" fontSize="8.8" textAnchor="middle">
              {isEs ? 'Retraer varilla interna al fondo' : 'Retract internal rod fully back'}
            </text>

            {/* Arrow 1->2 */}
            <path d="M 218 54 L 236 54 M 231 49 L 236 54 L 231 59" stroke="#16a34a" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />

            {/* Step B: Insert 3 mL Glass Cartridge */}
            <rect x="242" y="16" width="196" height="76" rx="8" fill="#f0fdf4" stroke="#86efac" strokeWidth="1.2" />
            <text x="340" y="34" fill="#15803d" fontSize="10.5" fontWeight="800" textAnchor="middle">
              {isEs ? '1B. Insertar Cartucho 3 mL' : '1B. Slide 3 mL Cartridge In'}
            </text>
            {/* Cartridge with rubber septum */}
            <rect x="272" y="48" width="10" height="16" rx="2" fill="#16a34a" />
            <rect x="282" y="46" width="84" height="20" rx="3" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.4" />
            <rect x="352" y="48" width="12" height="16" rx="1" fill="#334155" />
            <path d="M 374 56 L 408 56 M 399 51 L 408 56 L 399 61" stroke="#0284c7" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <text x="340" y="82" fill="#166534" fontSize="8.8" fontWeight="700" textAnchor="middle">
              {isEs ? 'Séptum de goma hacia la punta' : 'Rubber septum facing front tip'}
            </text>

            {/* Arrow 2->3 */}
            <path d="M 446 54 L 464 54 M 459 49 L 464 54 L 459 59" stroke="#16a34a" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />

            {/* Step C: Lock & Ready to Dial */}
            <rect x="470" y="16" width="196" height="76" rx="8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
            <text x="568" y="34" fill="#0f172a" fontSize="10.5" fontWeight="800" textAnchor="middle">
              {isEs ? '1C. Enroscar y Listo para Dial' : '1C. Screw Tight & Dial'}
            </text>
            <line x1="486" y1="56" x2="504" y2="56" stroke="#64748b" strokeWidth="2" />
            <rect x="504" y="48" width="50" height="16" rx="2" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.2" />
            <rect x="554" y="46" width="82" height="20" rx="3" fill="#003666" />
            <rect x="590" y="50" width="26" height="12" rx="2" fill="#ffffff" />
            <text x="603" y="59" fill="#003666" fontSize="9.5" fontWeight="900" textAnchor="middle" fontFamily="monospace">{penClicks}</text>
            <rect x="636" y="49" width="14" height="14" rx="2" fill="#0284c7" />
            <text x="568" y="82" fill="#475569" fontSize="8.8" textAnchor="middle">
              {isEs ? 'Enroscar aguja 31G/32G y purgar' : 'Attach 31G/32G needle & prime'}
            </text>
          </svg>
        </div>
      )}

      {/* Main Pen Dial Readout & Graphic Stage */}
      <div style={{
        width: '100%',
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        border: '1.5px solid #cbd5e1',
        borderRadius: '14px',
        padding: '1.15rem clamp(0.85rem, 2.5vw, 1.5rem)',
        boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
      }}>
        {/* Top Readout */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          paddingBottom: '0.9rem',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '1rem',
        }}>
          <div>
            <div style={{ fontSize: '0.70rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {isCartridge
                ? (isEs ? `Cartucho Precargado 3.0 mL (${strengthLabel})` : `3.0 mL Pre-filled Cartridge (${strengthLabel})`)
                : (isEs ? `Pluma Precargada 3.0 mL (${strengthLabel})` : `3.0 mL Pre-filled Pen (${strengthLabel})`)}
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
              {isEs ? `Gira el dial exactamente hasta ${penClicks} clics` : `Turn the dial window right to ${penClicks} clicks`}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{
              background: exceedsSingleDial ? '#fef2f2' : '#eff6ff',
              border: exceedsSingleDial ? '1.5px solid #fca5a5' : '1.5px solid #93c5fd',
              borderRadius: '10px',
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'baseline',
              gap: '6px',
            }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 900, fontFamily: 'monospace', color: exceedsSingleDial ? '#dc2626' : '#003666', lineHeight: 1 }}>
                {penClicks}
              </span>
              <span style={{ fontSize: '0.84rem', fontWeight: 800, color: exceedsSingleDial ? '#dc2626' : '#1d4ed8' }}>
                {isEs ? 'Clics' : 'Clicks'}
              </span>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b' }}>
                ({volStr} mL)
              </span>
            </div>

            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '10px',
              padding: '6px 12px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '0.64rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>
                {isCartridge ? (isEs ? 'Dosis / Cartucho' : 'Doses / Cartridge') : (isEs ? 'Dosis / Pluma' : 'Doses / Pen')}
              </div>
              <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#166534', fontFamily: 'monospace' }}>
                ~{totalDoses}
              </div>
            </div>
          </div>
        </div>

        {/* Clean High-Contrast SVG Injector Pen Graphic */}
        <svg
          viewBox="0 0 720 116"
          style={{ width: '100%', height: 'auto', display: 'block' }}
          role="img"
          aria-label={isEs ? `Ventana de dial de pluma marcando ${penClicks} clics` : `Pen dial window showing ${penClicks} clicks`}
        >
          {/* Needle 31G/32G */}
          <line x1="18" y1="58" x2="64" y2="58" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="64" y="45" width="20" height="26" rx="4" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.5" />
          {/* Transparent 3 mL Glass Cartridge Chamber */}
          <rect x="84" y="34" width="180" height="48" rx="6" fill="#f8fafc" stroke="#0284c7" strokeWidth="2" />
          <rect x="88" y="39" width="142" height="38" rx="4" fill="#bae6fd" fillOpacity="0.65" />
          {/* Cartridge graduations */}
          {[116, 148, 180, 212, 240].map((x) => (
            <line key={x} x1={x} y1="34" x2={x} y2="48" stroke="#0369a1" strokeWidth="1.3" opacity="0.7" />
          ))}
          <text x="160" y="63" fill="#003666" fontSize="11" fontWeight="800" textAnchor="middle">
            3.0 mL · {strengthLabel}
          </text>

          {/* Ergonomic Pen Body */}
          <rect x="264" y="28" width="340" height="60" rx="10" fill="#003666" stroke="#0f172a" strokeWidth="1.8" />
          {/* Grip Accent Lines */}
          {[294, 306, 318, 330].map((x) => (
            <line key={x} x1={x} y1="38" x2={x} y2="78" stroke="#38bdf8" strokeWidth="2" opacity="0.3" strokeLinecap="round" />
          ))}
          <text x="394" y="53" fill="#e0f2fe" fontSize="10" fontWeight="700" textAnchor="middle" letterSpacing="0.06em">
            {isCartridge ? (isEs ? 'PLUMA REUTILIZABLE' : 'REUSABLE PEN') : 'ATLAS PRECISION PEN'}
          </text>
          <text x="394" y="69" fill="#7dd3fc" fontSize="9" fontWeight="600" textAnchor="middle">
            {isEs ? '1 Clic = 0.01 mL' : '1 Click = 0.01 mL'}
          </text>

          {/* Big Illuminated Dial Window */}
          <rect x="478" y="36" width="96" height="44" rx="8" fill="#ffffff" stroke={exceedsSingleDial ? '#ef4444' : '#38bdf8'} strokeWidth="2.8" />
          <text
            x="526"
            y="66"
            fill={exceedsSingleDial ? '#dc2626' : '#003666'}
            fontSize="24"
            fontWeight="900"
            textAnchor="middle"
            fontFamily="monospace"
          >
            {penClicks}
          </text>
          {/* Pointer triangle */}
          <polygon points="526,20 519,31 533,31" fill={exceedsSingleDial ? '#dc2626' : '#38bdf8'} />

          {/* Dial Knob + Injection Thumb Button */}
          <rect x="604" y="36" width="52" height="44" rx="6" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
          {[616, 626, 636, 646].map((x) => (
            <line key={x} x1={x} y1="40" x2={x} y2="76" stroke="#475569" strokeWidth="2" />
          ))}
          <rect x="656" y="42" width="42" height="32" rx="8" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />
          <text x="677" y="61" fill="#ffffff" fontSize="9" fontWeight="800" textAnchor="middle">
            {isEs ? 'PULSA' : 'PUSH'}
          </text>
        </svg>

        {/* Bottom Safety Callout */}
        <div style={{
          marginTop: '0.85rem',
          padding: '0.7rem 1rem',
          borderRadius: '8px',
          background: exceedsSingleDial ? '#fef2f2' : '#f0f9ff',
          border: exceedsSingleDial ? '1px solid #fecaca' : '1px solid #bae6fd',
          fontSize: '0.78rem',
          color: exceedsSingleDial ? '#991b1b' : '#0369a1',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          lineHeight: 1.45,
        }}>
          {exceedsSingleDial ? (
            <>
              <AlertCircle size={16} style={{ flexShrink: 0, color: '#dc2626' }} />
              <span>
                {isEs
                  ? `Esta dosis requiere ${penClicks} clics (el dial estándar llega hasta 60 clics por disparo). Divide en 2 disparos (${Math.floor(penClicks / 2)} + ${Math.ceil(penClicks / 2)} clics) o elige una concentración mayor.`
                  : `This dose requires ${penClicks} clicks (standard pens dial up to 60 clicks per injection). Split into 2 injections (${Math.floor(penClicks / 2)} + ${Math.ceil(penClicks / 2)} clicks) or select a higher strength.`}
              </span>
            </>
          ) : (
            <>
              <ShieldCheck size={16} style={{ flexShrink: 0, color: '#0284c7' }} />
              <span>
                {isEs
                  ? 'Compatible con agujas estándar ISO 11608-2 para pluma (31G / 32G × 4–5 mm). Sin mezcla manual ni jeringas de insulina.'
                  : 'Compatible with standard ISO 11608-2 pen needles (31G / 32G × 4–5 mm). Zero manual mixing or insulin syringes required.'}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
