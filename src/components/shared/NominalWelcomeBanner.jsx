'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ShieldCheck, Smartphone, X, Sparkles, Check, ArrowUpRight } from 'lucide-react';

/**
 * NominalWelcomeBanner
 * 
 * Elegant, institutional welcome header shown on public pages (/dr/[slug], /rx/[code], /c/[id])
 * when accessed via tracked links or 1-Tap authentication tokens.
 * 
 * Features:
 * - Nominal personalized welcome ("Bienvenido Dr. [Nombre]")
 * - 90-day trusted workstation session indicator
 * - 1-Click "Añadir a Inicio" / PWA install trigger with iOS/Android guidance
 * - Dismissible with session persistence
 */
export default function NominalWelcomeBanner({
  recipientName = '',
  role = 'doctor', // 'doctor' | 'patient' | 'wholesaler' | 'client'
  clinicName = '',
  verifiedBy = 'Atlas Health Services',
  hideVerifiedBadge = false,
  sessionDuration = '90 days',
  storageKey = 'atlas_welcome_banner_dismissed',
  lang = 'en'
}) {
  const isEs = lang === 'es';
  const [dismissed, setDismissed] = useState(true);
  const [pwaPrompt, setPwaPrompt] = useState(null);
  const [showPwaInstructions, setShowPwaInstructions] = useState(false);
  const [isIos, setIsIos] = useState(false);

  const cleanVerifiedBy = useMemo(() => {
    if (!verifiedBy) return 'Atlas Health Services';
    return String(verifiedBy).replace(/^(Dr\.?\s*)+/i, 'Dr. ').trim();
  }, [verifiedBy]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Rule #74: Remember dismissal in localStorage (once per device, not repeatedly)
    try {
      const isDismissed = localStorage.getItem(storageKey) || sessionStorage.getItem(storageKey);
      if (!isDismissed && recipientName) {
        setDismissed(false);
      }
    } catch {
      setDismissed(false);
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Capture PWA install event for Android / Chrome / Edge
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setPwaPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, [storageKey, recipientName]);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(storageKey, 'true');
      sessionStorage.setItem(storageKey, 'true');
    } catch {
      /* ignore */
    }
  };

  const handleInstallClick = async () => {
    if (pwaPrompt) {
      pwaPrompt.prompt();
      const choice = await pwaPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setPwaPrompt(null);
      }
    } else {
      setShowPwaInstructions((prev) => !prev);
    }
  };

  if (dismissed || !recipientName) return null;

  const isDoc = role === 'doctor';
  const isPatient = role === 'patient';
  const isWholesale = role === 'wholesaler';

  const isInstitution = /(clinic|hospital|center|centre|medical|health|group|polyclinic|llc|inc|s\.l\.|corp|practice|labs|farmacia)/i.test(recipientName);

  const cleanTitle = (isDoc && !isInstitution)
    ? (recipientName.startsWith('Dr.') ? recipientName : `Dr. ${recipientName}`)
    : recipientName;

  return (
    <div
      className="nwb-root"
      data-nwb
      style={{
        background: '#f8fafc',
        color: '#334155',
        padding: '6px 14px',
        position: 'relative',
        zIndex: 10,
        fontSize: '0.76rem',
        borderBottom: '1px solid #e2e8f0',
      }}
    >
      <style>{`
        .nwb-install-short { display: none; }
        @media (max-width: 768px) {
          .nwb-root { padding: 4px 10px !important; }
          .nwb-root .nwb-tagline,
          .nwb-root .nwb-install-full { display: none; }
          .nwb-root .nwb-install-short { display: inline; }
          .nwb-root .nwb-patient-welcome-text { font-size: 0.72rem; }
          .nwb-root button { min-height: 30px; justify-content: center; }
        }
      `}</style>
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        {/* Left: Subtle Inline Verified Chip (Rule #74: No heavy sticky blue bar) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {!hideVerifiedBadge && (
            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                color: '#15803d',
                padding: '2px 8px',
                borderRadius: '999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontWeight: 700,
                fontSize: '0.70rem',
                letterSpacing: '0.02em',
              }}
            >
              <ShieldCheck size={13} color="#16a34a" />
              <span>{isEs ? 'ACCESO VERIFICADO' : 'VERIFIED ACCESS'}</span>
            </div>
          )}

          <div className={isPatient ? 'nwb-patient-welcome-text' : ''} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a' }}>
            <span>
              {isEs ? 'Bienvenido/a,' : 'Welcome,'} <strong>{cleanTitle}</strong>
            </span>
            <span className="nwb-tagline" style={{ opacity: 0.4 }}>•</span>
            <span className="nwb-tagline" style={{ color: '#475569', fontSize: '0.74rem' }}>
              {isDoc
                ? (isEs ? `Sesión clínica activa por ${sessionDuration} sin contraseña` : `Active clinical session for ${sessionDuration} passwordless`)
                : isPatient
                ? (hideVerifiedBadge
                    ? (isEs ? 'Tu guía personalizada de tratamiento' : 'Your personalized treatment guide')
                    : (isEs ? `Expediente digital certificado por ${cleanVerifiedBy}` : `Digital clinical dossier certified by ${cleanVerifiedBy}`))
                : (isEs ? `Catálogo mayorista oficial con márgenes B2B autorizados` : `Official wholesale catalog with authorized B2B margins`)}
            </span>
          </div>
        </div>

        {/* Right: Subtle Add to Home Screen & Dismiss */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={handleInstallClick}
            title={isEs ? 'Añadir icono a la pantalla de inicio de tu smartphone' : 'Add icon to smartphone home screen'}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#003666',
              padding: '3px 9px',
              borderRadius: '6px',
              fontSize: '0.71rem',
              fontWeight: 650,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'background 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <Smartphone size={13} color="#0284c7" />
            <span className="nwb-install-full">{isEs ? 'Añadir a Inicio' : 'Add to Home Screen'}</span>
            <span className="nwb-install-short">{isEs ? 'Instalar' : 'Install'}</span>
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            title={isEs ? 'Ocultar aviso de bienvenida' : 'Dismiss welcome notice'}
            aria-label={isEs ? 'Cerrar' : 'Dismiss'}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Popover instructions for iOS / Safari if native prompt not available */}
      {showPwaInstructions && (
        <div
          style={{
            maxWidth: '1280px',
            margin: '8px auto 0 auto',
            padding: '8px 12px',
            background: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(8px)',
            borderRadius: '6px',
            fontSize: '0.74rem',
            lineHeight: 1.4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          <div>
            {isIos ? (
              <span>
                📱 <strong>En iPhone/iPad</strong>: Pulsa el botón de Compartir en Safari (icono de cuadrado con flecha ⎋) y selecciona <strong>"Añadir a la pantalla de inicio" ⊞</strong>.
              </span>
            ) : (
              <span>
                📱 <strong>En Android/Chrome</strong>: Pulsa el menú de 3 puntos arriba a la derecha y selecciona <strong>"Añadir a pantalla de inicio"</strong> o "Instalar aplicación".
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowPwaInstructions(false)}
            style={{
              background: '#ffffff',
              color: '#002244',
              border: 'none',
              borderRadius: '4px',
              padding: '2px 8px',
              fontWeight: 700,
              fontSize: '0.70rem',
              cursor: 'pointer',
              marginLeft: '10px',
              flexShrink: 0,
            }}
          >
            Entendido
          </button>
        </div>
      )}
    </div>
  );
}
