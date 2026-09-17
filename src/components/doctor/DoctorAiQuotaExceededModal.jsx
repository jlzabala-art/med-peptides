'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Sparkles,
  Zap,
  Award,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from '@/lib/icons';
import { toast } from 'react-hot-toast';
import notifier from '../../services/NotificationService';

/**
 * DoctorAiQuotaExceededModal
 * ─────────────────────────────────────────────────────────────────────────────
 * Modal rendered when a basic tier physician has used all 5 complimentary AI queries.
 * Provides clear rationale and high-conversion paths to upgrade to Advanced Pro.
 */
export default function DoctorAiQuotaExceededModal({
  isOpen,
  onClose,
  doctorId = '',
  doctorName = 'Doctor',
  clinicName = '',
  onUpgradeSuccess,
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleRequestUpgrade = async () => {
    setLoading(true);
    const toastId = toast.loading('Submitting upgrade request…');
    try {
      // 1. Notify admin
      await notifier.send({
        to: ['admin'],
        type: 'user',
        title: '💎 Pro Plan Upgrade (AI Limit Reached)',
        message: `Dr. ${doctorName} has reached their 5 monthly AI queries and requested an upgrade to Advanced Pro Plan.`,
        data: { doctorId, doctorName, clinic: clinicName, requestedTier: 'advanced' }
      });

      // 2. Open WhatsApp VIP support channel
      const text = encodeURIComponent(
        `Hello, I am Dr. ${doctorName}${clinicName ? ` from ${clinicName}` : ''}. I reached my 5 free AI clinical queries on Atlas Health and would like to activate the Advanced Pro Plan for unlimited AI scribe and patient tools.`
      );
      const waUrl = `https://wa.me/34600000000?text=${text}`;

      toast.success('Upgrade request received! Connecting with clinical team…', { id: toastId });

      if (onUpgradeSuccess) onUpgradeSuccess();

      setTimeout(() => {
        window.open(waUrl, '_blank');
        onClose();
      }, 1000);
    } catch (err) {
      console.error('[DoctorAiQuotaExceededModal] Upgrade request error:', err);
      toast.error('Error submitting request: ' + (err.message || 'Please try again'), { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleViewMembershipSheet = () => {
    onClose();
    router.push('/doctor/membership');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10050,
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          maxWidth: '560px',
          width: '100%',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            padding: '2rem 2rem 1.5rem 2rem',
            color: '#ffffff',
            position: 'relative'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
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

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.75rem'
            }}
          >
            <AlertTriangle size={14} /> Monthly Free Limit Reached (5/5)
          </div>

          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#ffffff' }}>
            You’ve used your 5 free AI queries this month
          </h2>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5 }}>
            The Basic Plan includes 5 complimentary consultations per month with Atlas AI Clinical Scribe. To continue generating prescriptions and structuring clinical notes without interruption, upgrade to the Advanced Pro Plan.
          </p>
        </div>

        {/* Pro Benefits Highlights */}
        <div style={{ padding: '1.5rem 2rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#0f766e', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Award size={15} /> What unlocks with Advanced Pro:
          </div>

          <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: '#f0fdfa', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #ccfbf1' }}>
              <CheckCircle2 size={18} color="#0d9488" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '0.88rem', color: '#134e4a', display: 'block' }}>Unlimited Atlas AI Clinical Scribe</strong>
                <span style={{ fontSize: '0.78rem', color: '#0f766e' }}>No monthly caps on dictation parsing, blood panel analysis, or hormonal calculation.</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <CheckCircle2 size={18} color="#0d9488" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '0.88rem', color: '#1e293b', display: 'block' }}>100% White-Label Patient Guides</strong>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Reconstitution & U-100 syringe units with your clinic logo and direct contact info.</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <CheckCircle2 size={18} color="#0d9488" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '0.88rem', color: '#1e293b', display: 'block' }}>Automated WhatsApp Refill Alerts</strong>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Remind patients 5 days before vial depletion (+40% therapy adherence).</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={handleRequestUpgrade}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.9rem',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(13, 148, 136, 0.35)',
                transition: 'transform 0.15s ease'
              }}
            >
              <Sparkles size={18} />
              {loading ? 'Processing…' : 'Upgrade to Advanced Pro Tier ⚡'}
            </button>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={handleViewMembershipSheet}
                style={{
                  flex: 1,
                  padding: '0.65rem 1rem',
                  borderRadius: '12px',
                  background: '#f8fafc',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <span>Compare Plan Features</span>
                <ArrowRight size={14} />
              </button>

              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '12px',
                  background: 'transparent',
                  color: '#64748b',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
