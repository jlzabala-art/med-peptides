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

    // Check if dismissed in this session
    try {
      const isDismissed = sessionStorage.getItem(storageKey);
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

  const cleanTitle = isDoc
    ? (recipientName.startsWith('Dr.') ? recipientName : `Dr. ${recipientName}`)
    : recipientName;

  return (
    <div
      className="nwb-root"
      data-nwb
      style={{
        background: isDoc
          ? 'linear-gradient(90deg, #002244 0%, #003666 60%, #004b87 100%)'
          : isPatient
          ? 'linear-gradient(90deg, #3b0764 0%, #581c87 60%, #6b21a8 100%)'
          : 'linear-gradient(90deg, #1c1917 0%, #292524 60%, #44403c 100%)',
        color: '#ffffff',
        padding: '7px 16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        position: 'relative',
        zIndex: 90,
        fontSize: '0.80rem',
        borderBottom: '1px solid rgba(255,255,255,0.12)',
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .nwb-root .nwb-tagline { display: none; }
          .nwb-root button { min-height: 44px; min-width: 44px; justify-content: center; }
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
        {/* Left: Personalized Nominal Welcome & Verification Shield */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div
            style={{
              background: 'rgba(255,255,255,0.18)',
              padding: '3px 8px',
              borderRadius: '6px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontWeight: 700,
              fontSize: '0.74rem',
              letterSpacing: '0.02em',
              backdropFilter: 'blur(4px)',
            }}
          >
            <ShieldCheck size={14} color="#86efac" />
            <span>{isEs ? 'ACCESO VERIFICADO' : 'VERIFIED ACCESS'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>
              {isEs ? 'Bienvenido/a,' : 'Welcome,'} <strong>{cleanTitle}</strong>
            </span>
            <span className="nwb-tagline" style={{ opacity: 0.6 }}>•</span>
            <span className="nwb-tagline" style={{ opacity: 0.9, fontSize: '0.76rem' }}>
              {isDoc
                ? (isEs ? `Sesión clínica activa por ${sessionDuration} sin contraseña` : `Active clinical session for ${sessionDuration} passwordless`)
                : isPatient
                ? (isEs ? `Expediente digital certificado por ${cleanVerifiedBy}` : `Digital clinical dossier certified by ${cleanVerifiedBy}`)
                : (isEs ? `Catálogo mayorista oficial con márgenes B2B autorizados` : `Official wholesale catalog with authorized B2B margins`)}
            </span>
          </div>
        </div>

        {/* Right: Add to Home Screen (PWA) & Dismiss */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={handleInstallClick}
            title={isEs ? 'Añadir icono a la pantalla de inicio de tu smartphone' : 'Add icon to smartphone home screen'}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#ffffff',
              padding: '3px 10px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'background 0.2s ease',
            }}
          >
            <Smartphone size={13} color="#93c5fd" />
            <span>{isEs ? 'Añadir a Inicio' : 'Add to Home Screen'}</span>
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            title={isEs ? 'Ocultar aviso de bienvenida' : 'Dismiss welcome notice'}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              padding: '2px',
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
