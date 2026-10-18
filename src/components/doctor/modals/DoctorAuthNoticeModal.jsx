"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Lock from 'lucide-react/dist/esm/icons/lock';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import LogIn from 'lucide-react/dist/esm/icons/log-in';
import UserPlus from 'lucide-react/dist/esm/icons/user-plus';
import Smartphone from 'lucide-react/dist/esm/icons/smartphone';
import X from 'lucide-react/dist/esm/icons/x';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import { triggerHaptic } from '@/utils/haptics';

/**
 * DoctorAuthNoticeModal
 * ─────────────────────────────────────────────────────────────────────────────
 * Frictionless authentication and clinical data protection notice modal.
 * Triggered whenever an unauthenticated visitor clicks a security lock,
 * locked sidebar item, or confidential dossier within the Doctor Portal.
 *
 * Provides clear, zero-friction pathways:
 * 1. Standard Physician Sign In (/login)
 * 2. Practice Registration / Alta Médica (/login?tab=register&role=doctor)
 * 3. 1-Tap Passwordless WhatsApp Magic Link (direct link to Claim verification)
 * 4. Dismissible without blocking public blueprint exploration
 */
export default function DoctorAuthNoticeModal({
  isOpen,
  onClose,
  doctor = {},
  opaqueCode = '',
  onOpenClaimModal = null,
  resourceName = 'Patient records and clinical dossiers'
}) {
  const router = useRouter();

  if (!isOpen) return null;

  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const returnUrl = currentPath ? encodeURIComponent(currentPath) : '';

  // Zero-Knowledge masking helper
  const maskDoctorName = (name) => {
    if (!name || typeof name !== 'string') return 'Accredited Treating Physician';
    const parts = name.trim().split(/\s+/);
    return parts.map(p => {
      if (p.toLowerCase() === 'dr.' || p.toLowerCase() === 'dr') return p;
      if (p.length <= 2) return p[0] + '•';
      return p[0] + '•'.repeat(Math.min(p.length - 1, 4));
    }).join(' ');
  };

  const maskedName = doctor.name ? maskDoctorName(doctor.name) : 'Accredited Treating Physician';

  const handleSignIn = () => {
    triggerHaptic('medium');
    onClose();
    router.push(`/login?redirect=${returnUrl}`);
  };

  const handleRegister = () => {
    triggerHaptic('medium');
    onClose();
    router.push(`/login?tab=register&role=doctor&redirect=${returnUrl}`);
  };

  const handle1TapWhatsApp = () => {
    triggerHaptic('medium');
    onClose();
    if (typeof onOpenClaimModal === 'function') {
      onOpenClaimModal();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.25), 0 1px 3px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #e2e8f0',
          position: 'relative',
          animation: 'fadeInScale 0.18s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div
          style={{
            background: 'linear-gradient(135deg, #003666 0%, #0d9488 100%)',
            padding: '20px 24px',
            color: '#ffffff',
            position: 'relative'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Lock size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.9, fontWeight: 700 }}>
                Security & Data Protection
              </div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '2px 0 0 0', lineHeight: 1.25 }}>
                Medical Authentication Required
              </h2>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Regulatory explanation */}
          <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
            {resourceName ? (
              <>
                <strong>{resourceName}</strong> is protected under the <strong>UAE Health Data Protection Law</strong> (Federal Law No. 2 of 2019) and DHA regulatory standards.
              </>
            ) : (
              <>Nominal patient dossiers and physician records are strictly confidential under healthcare data regulations.</>
            )}
            {' '}To view unmasked identities, clinical posology, or manage prescriptions, please verify your physician credentials.
          </p>

          {/* Practice Summary Box */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Practice Portal
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {maskedName}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#0d9488', fontWeight: 600 }}>
                Practice ID: {opaqueCode || 'DR-ACTIVE'} · DHA Registered
              </div>
            </div>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#e0f2fe',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <ShieldCheck size={18} />
            </div>
          </div>

          {/* Action Pathways */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', paddingTop: '4px' }}>
            {/* Primary Action: Sign In */}
            <button
              type="button"
              onClick={handleSignIn}
              style={{
                width: '100%',
                padding: '11px 16px',
                borderRadius: '8px',
                background: '#003666',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 1px 3px rgba(0, 54, 102, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              <LogIn size={16} />
              <span>Sign In to Physician Account</span>
              <ArrowRight size={14} style={{ marginLeft: 'auto', opacity: 0.8 }} />
            </button>

            {/* Secondary Action: Register */}
            <button
              type="button"
              onClick={handleRegister}
              style={{
                width: '100%',
                padding: '10px 16px',
                borderRadius: '8px',
                background: '#ffffff',
                color: '#003666',
                border: '1px solid #cbd5e1',
                fontSize: '0.84rem',
                fontWeight: 650,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
            >
              <UserPlus size={15} color="#003666" />
              <span>Register Medical Practice / Alta Médica</span>
            </button>

            {/* 1-Tap WhatsApp Link / Claim */}
            {onOpenClaimModal && (
              <button
                type="button"
                onClick={handle1TapWhatsApp}
                style={{
                  width: '100%',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  background: '#f0fdfa',
                  color: '#0f766e',
                  border: '1px solid #99f6e4',
                  fontSize: '0.82rem',
                  fontWeight: 650,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Smartphone size={15} color="#0d9488" />
                <span>1-Tap WhatsApp Link (Passwordless Access)</span>
              </button>
            )}
          </div>
        </div>

        {/* Frictionless Footer / Guest Option */}
        <div
          style={{
            padding: '12px 24px',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.74rem',
            color: '#64748b'
          }}
        >
          <span>End-to-End Encrypted · HIPAA</span>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#475569',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0
            }}
          >
            Continue browsing public blueprints
          </button>
        </div>
      </div>
    </div>
  );
}
