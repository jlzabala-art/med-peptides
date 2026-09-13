"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Sparkles } from '@/lib/icons';

/**
 * ProfessionalWelcomeOverlay
 * ─────────────────────────────────────────────────────────────────────────────
 * Executive entrance splash screen:
 * - 100% English professional clinical branding.
 * - Glowing molecular emblem and glassmorphic aesthetic.
 * - Brief 1.8s duration with ease-out dissolve so it never slows down the user.
 * - Tap/Click anywhere to skip instantly.
 */
export default function ProfessionalWelcomeOverlay() {
  const { user, activeRole } = useAuth();
  const [visible, setVisible] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    // Show on entrance to the portal. Uses sessionStorage so it greets on portal arrival
    // without interrupting every minor internal subtab click within 3 minutes.
    try {
      const lastShown = Number(sessionStorage.getItem('rp_portal_welcome_ts') || '0');
      const now = Date.now();
      
      // If entering portal anew (or > 3 minutes since last entrance greeting)
      if (!lastShown || (now - lastShown > 180000)) {
        setVisible(true);
        sessionStorage.setItem('rp_portal_welcome_ts', String(now));

        const fadeTimer = setTimeout(() => {
          setFadingOut(true);
        }, 1500);

        const removeTimer = setTimeout(() => {
          setVisible(false);
        }, 1850);

        return () => {
          clearTimeout(fadeTimer);
          clearTimeout(removeTimer);
        };
      }
    } catch {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 1700);
      return () => clearTimeout(t);
    }
  }, []);

  const handleDismiss = () => {
    setFadingOut(true);
    setTimeout(() => setVisible(false), 200);
  };

  if (!visible) return null;

  const roleTitle = activeRole ? String(activeRole).toUpperCase() : 'CLINICAL';
  const userName = user?.displayName || user?.email?.split('@')[0] || 'Authorized Specialist';

  return (
    <div
      onClick={handleDismiss}
      role="status"
      aria-label="Welcome to Atlas Services Portal"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at 50% 35%, rgba(2, 44, 84, 0.96) 0%, #001529 70%, #000c18 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        color: '#ffffff',
        cursor: 'pointer',
        userSelect: 'none',
        opacity: fadingOut ? 0 : 1,
        transform: fadingOut ? 'scale(1.02)' : 'scale(1)',
        transition: 'opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        padding: '1.5rem',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <style>{`
        @keyframes rp-pulse-glow {
          0% { transform: scale(0.97); opacity: 0.85; filter: drop-shadow(0 0 16px rgba(14, 165, 233, 0.3)); }
          50% { transform: scale(1.03); opacity: 1; filter: drop-shadow(0 0 32px rgba(14, 165, 233, 0.65)); }
          100% { transform: scale(0.97); opacity: 0.85; filter: drop-shadow(0 0 16px rgba(14, 165, 233, 0.3)); }
        }
        @keyframes rp-laser-sweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes rp-fade-up {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Main Glass Card */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        maxWidth: '480px',
        width: '100%',
        animation: 'rp-fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}>
        
        {/* Emblem */}
        <div style={{
          width: '74px',
          height: '74px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.2) 0%, rgba(2, 132, 199, 0.08) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
          animation: 'rp-pulse-glow 2.4s ease-in-out infinite',
          boxShadow: '0 8px 32px rgba(0, 34, 68, 0.4)',
        }}>
          <svg width="42" height="42" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 4L42 14V34L24 44L6 34V14L24 4Z" stroke="#38BDF8" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M24 12V36" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            <path d="M14 20L34 28" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M14 28L34 20" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="24" cy="24" r="4" fill="#0EA5E9" />
          </svg>
        </div>

        {/* Institutional Accreditation Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 14px',
          borderRadius: '999px',
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          marginBottom: '1rem',
        }}>
          <ShieldCheck size={13} color="#38bdf8" />
          <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', color: '#e0f2fe', textTransform: 'uppercase' }}>
            AUTHORIZED SECURE WORKSPACE · {roleTitle}
          </span>
        </div>

        {/* Brand Name with Precision Typography */}
        <h1 style={{
          margin: '0 0 0.4rem 0',
          fontSize: '1.9rem',
          fontWeight: 900,
          letterSpacing: '-0.03em',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          ATLAS
          <span style={{ fontSize: '0.95rem', fontWeight: 500, color: '#38bdf8', letterSpacing: '0.04em' }}>
            SERVICES
          </span>
        </h1>

        {/* Subtitle / Value Proposition */}
        <p style={{
          margin: '0 0 1.5rem 0',
          fontSize: '0.88rem',
          lineHeight: '1.5',
          color: '#94a3b8',
          fontWeight: 400,
          maxWidth: '380px',
        }}>
          Enterprise Clinical Operations &amp; Intelligence Platform
        </p>

        {/* Personalized Welcome Badge */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '10px',
          padding: '8px 18px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '1.75rem',
        }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 8px #10b981' }} />
          <span style={{ fontSize: '0.78rem', color: '#f1f5f9', fontWeight: 600 }}>
            Welcome back, {userName}
          </span>
        </div>

        {/* Sleek Progress Laser Bar */}
        <div style={{
          width: '180px',
          height: '2px',
          borderRadius: '999px',
          background: 'rgba(255, 255, 255, 0.12)',
          overflow: 'hidden',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, #0284c7, #38bdf8, #10b981)',
            animation: 'rp-laser-sweep 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
          }} />
        </div>

        {/* Non-intrusive hint */}
        <span style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '0.85rem', letterSpacing: '0.02em' }}>
          Tap anywhere to continue
        </span>
      </div>
    </div>
  );
}
