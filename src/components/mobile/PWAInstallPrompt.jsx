'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Share2, PlusSquare } from '@/lib/icons';

/**
 * PWAInstallPrompt
 * ─────────────────────────────────────────────────────────────────────────────
 * A non-intrusive bottom toast offering 1-click or guided installation to Home Screen
 * for iOS Safari and Android Chrome to unlock full-screen mode without browser bars.
 */
export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/shared/')) {
      return;
    }

    // Check if already in standalone mode (already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) return;

    // Check if dismissed recently (7 days cooldown)
    const dismissedAt = localStorage.getItem('pwa_prompt_dismissed');
    if (dismissedAt && Date.now() - parseInt(dismissedAt, 10) < 7 * 24 * 60 * 60 * 1000) {
      return;
    }

    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isIosDevice);

    const isMobile = window.innerWidth <= 768;
    if (!isMobile) return;

    // Android/Chrome beforeinstallprompt event
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // If iOS and not standalone, show prompt after 4 seconds of usage
    if (isIosDevice) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 4000);
      return () => clearTimeout(timer);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
    setShowPrompt(false);
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (!showPrompt) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '84px',
        left: '16px',
        right: '16px',
        maxWidth: '460px',
        margin: '0 auto',
        backgroundColor: '#0f172a',
        color: '#ffffff',
        padding: '1rem 1.15rem',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
        zIndex: 9995,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
        border: '1px solid rgba(255,255,255,0.1)',
        animation: 'slideUpPrompt 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor: 'var(--color-primary, #003666)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Download size={18} color="#ffffff" />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800 }}>Install Atlas AI App</h4>
            <p style={{ margin: 0, fontSize: '0.74rem', color: '#94a3b8' }}>
              Full-screen native view with 15% more space
            </p>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <X size={18} />
        </button>
      </div>

      {isIOS ? (
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.06)',
          padding: '0.6rem 0.85rem',
          borderRadius: '10px',
          fontSize: '0.78rem',
          color: '#cbd5e1',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>Tap <Share2 size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> and then <strong>"Add to Home Screen"</strong></span>
          <PlusSquare size={14} color="#38bdf8" />
        </div>
      ) : (
        <button
          onClick={handleInstallClick}
          style={{
            width: '100%',
            padding: '0.6rem',
            borderRadius: '10px',
            backgroundColor: '#0284c7',
            color: '#ffffff',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          Add to Home Screen
        </button>
      )}

      <style jsx global>{`
        @keyframes slideUpPrompt {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
