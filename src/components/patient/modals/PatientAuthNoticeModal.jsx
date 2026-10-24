"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Lock,
  ShieldCheck,
  LogIn,
  UserPlus,
  X,
  ArrowRight,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

/**
 * PatientAuthNoticeModal
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud UX Frictionless Authentication & Healthcare Privacy Barrier.
 * Triggered whenever an unauthenticated patient clicks to:
 * - Request prescription refill / quotation
 * - Order compounded medication
 * - View unmasked clinical posology or access their patient portal
 *
 * Pathways:
 * 1. 1-Tap Google Sign In (Auto-return to prescription)
 * 2. Standard Patient Login (/login?redirect=...)
 * 3. Patient Registration / Alta de Paciente
 * 4. Read-only exploration without blocking the user
 */
export default function PatientAuthNoticeModal({
  isOpen,
  onClose,
  rxId = '',
  doctorName = 'Accredited Treating Physician',
  actionGoal = 'quotation', // 'quotation' | 'refill' | 'order' | 'portal'
  isEs = false
}) {
  const router = useRouter();
  const { loginWithGoogle } = useAuth();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  if (!isOpen) return null;

  const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';
  const returnUrl = currentPath ? encodeURIComponent(currentPath) : '';

  const handleGoogleSignIn = async () => {
    triggerHaptic('medium');
    setIsGoogleLoading(true);
    try {
      if (loginWithGoogle) {
        await loginWithGoogle();
        toast.success(isEs ? 'Sesión de paciente iniciada ✓' : 'Patient session verified ✓');
        onClose();
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      } else {
        router.push(`/login?redirect=${returnUrl}`);
      }
    } catch (err) {
      console.error('Google Sign In error:', err);
      toast.error(isEs ? 'Error al autenticar con Google. Intente con email/contraseña.' : 'Google sign-in error. Please try email login.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSignIn = () => {
    triggerHaptic('medium');
    onClose();
    router.push(`/login?redirect=${returnUrl}`);
  };

  const handleRegister = () => {
    triggerHaptic('medium');
    onClose();
    router.push(`/login?tab=register&role=patient&redirect=${returnUrl}`);
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
        {/* Header Ribbon (Google Cloud Medical Teal/Blue Theme) */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e40af 100%)',
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
                {isEs ? 'Seguridad & Protección de Datos Sanitarios' : 'Security & Clinical Privacy'}
              </div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '2px 0 0 0', lineHeight: 1.25 }}>
                {isEs ? 'Identificación de Paciente Requerida' : 'Patient Authentication Required'}
              </h2>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Regulatory & Safety notice */}
          <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
            {isEs ? (
              <>
                Por normativa sanitaria y protección de datos clínicos (RGPD / HIPAA / Ley Federal Sanitaria), para <strong>{actionGoal === 'refill' ? 'solicitar la reposición' : 'pedir la medicación o cotización'}</strong> vinculada a esta receta es necesario verificar su identidad de paciente.
              </>
            ) : (
              <>
                Under health data privacy regulations and medical dispensing standards (GDPR / HIPAA / UAE Health Data Protection Law), requesting <strong>{actionGoal === 'refill' ? 'prescription renewals' : 'medication dispensing & official quotations'}</strong> requires verified patient authentication.
              </>
            )}
          </p>

          {/* Prescription Context Box */}
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
                {isEs ? 'Expediente Clínico' : 'Clinical Prescription Record'}
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {rxId ? `Ref #${rxId}` : 'Prescription Dossier'}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 600 }}>
                {doctorName ? (doctorName.startsWith('Dr') ? doctorName : `Dr. ${doctorName}`) : 'Treating Physician'}
              </div>
            </div>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#f0fdf4',
                color: '#16a34a',
                border: '1px solid #bbf7d0',
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
            {/* 1-Tap Google Sign In */}
            <button
              type="button"
              disabled={isGoogleLoading}
              onClick={handleGoogleSignIn}
              style={{
                width: '100%',
                padding: '11px 16px',
                borderRadius: '8px',
                background: '#ffffff',
                color: '#1e293b',
                border: '1px solid #dadce0',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 1px 2px rgba(60,64,67,0.08)',
                transition: 'all 0.15s ease'
              }}
            >
              {isGoogleLoading ? (
                <Loader2 size={16} className="animate-spin" color="#1a73e8" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              )}
              <span>{isEs ? 'Acceder con Google (1-Clic)' : 'Continue with Google (1-Click)'}</span>
            </button>

            {/* Secondary Action: Standard Email/Password Sign In */}
            <button
              type="button"
              onClick={handleSignIn}
              style={{
                width: '100%',
                padding: '10px 16px',
                borderRadius: '8px',
                background: '#003666',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.84rem',
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
              <LogIn size={15} />
              <span>{isEs ? 'Iniciar Sesión con Email' : 'Sign In with Email'}</span>
              <ArrowRight size={14} style={{ marginLeft: 'auto', opacity: 0.8 }} />
            </button>

            {/* Tertiary Action: Register */}
            <button
              type="button"
              onClick={handleRegister}
              style={{
                width: '100%',
                padding: '9px 16px',
                borderRadius: '8px',
                background: '#ffffff',
                color: '#003666',
                border: '1px solid #cbd5e1',
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
              <UserPlus size={14} color="#003666" />
              <span>{isEs ? 'Crear Cuenta de Paciente / Alta' : 'Create Patient Account'}</span>
            </button>
          </div>
        </div>

        {/* Footer: Read-only dismissal */}
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
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={12} color="#16a34a" />
            <span>Encrypted · HIPAA & GDPR</span>
          </span>
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
            {isEs ? 'Seguir explorando en modo lectura' : 'Continue in read-only mode'}
          </button>
        </div>
      </div>
    </div>
  );
}
