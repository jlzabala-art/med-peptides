'use client';

import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  MessageCircle, 
  User, 
  FileText, 
  Stethoscope, 
  ArrowRight,
  TrendingUp,
  Award
} from '@/lib/icons';
import { toast } from 'react-hot-toast';
import notifier from '../../services/NotificationService';

export default function DoctorUpgradePlanModal({ 
  isOpen, 
  onClose, 
  currentTier = 'basic',
  doctorName = 'Doctor',
  doctorId = '',
  onUpgradeSuccess
}) {
  const [loading, setLoading] = useState(false);
  const isPro = currentTier === 'advanced' || currentTier === 'pro';

  if (!isOpen) return null;

  const handleRequestUpgrade = async () => {
    setLoading(true);
    const toastId = toast.loading('Processing upgrade request…');
    try {
      // 1. Send notification to admin
      await notifier.send({
        to: ['admin'],
        type: 'user',
        title: '💎 Pro Plan Upgrade Request',
        message: `Dr. ${doctorName} (ID: ${doctorId || 'doctor'}) has requested an upgrade to Advanced Pro Plan.`,
        data: { doctorId, doctorName, requestedTier: 'advanced' }
      });

      // 2. Open WhatsApp direct channel to admin / conciergerie
      const text = encodeURIComponent(`Hello, I am Dr. ${doctorName}. I would like to activate the Advanced Pro Plan for my clinical practice on Med-Peptides / Atlas Health. Please coordinate the activation.`);
      const waUrl = `https://wa.me/34600000000?text=${text}`; // Support line
      
      toast.success('Upgrade request submitted! Our clinical team will reach out immediately.', { id: toastId });
      
      // Notify parent if simulation callback passed
      if (onUpgradeSuccess) onUpgradeSuccess();
      
      setTimeout(() => {
        window.open(waUrl, '_blank');
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
      toast.error('Error processing request: ' + err.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const COMPARISON_FEATURES = [
    {
      feature: 'Clinical Prescription Issuance',
      basic: 'Manual (product by product)',
      pro: 'Unlimited + Custom 1-Tap Regimens',
      highlight: true
    },
    {
      feature: 'Atlas AI Clinical Scribe & Copilot',
      basic: '5 queries / month',
      pro: 'Unlimited (blood panel & genetics interpretation)',
      highlight: true
    },
    {
      feature: 'Patient Admin Guide & U-100 Syringe Units',
      basic: 'Standard Lotusland format',
      pro: '100% White-Label (Clinic logo & branding)',
      highlight: true
    },
    {
      feature: 'Active Patients Directory',
      basic: 'Up to 30 active patients',
      pro: 'Unlimited Patients + SOAP Clinical Notes',
      highlight: false
    },
    {
      feature: 'WhatsApp Predictive Refill Alerts',
      basic: 'Manual follow-up',
      pro: 'Automated predictive alerts before vial completion',
      highlight: true
    },
    {
      feature: 'Lotusland Formulary Clinical Pricing',
      basic: 'Included',
      pro: 'Included + Bioequivalence comparator',
      highlight: false
    },
    {
      feature: 'Telehealth & Consultation Calendar',
      basic: 'Not available',
      pro: 'Integrated appointments & video consults',
      highlight: false
    },
    {
      feature: 'Clinical Support Channel',
      basic: 'Standard (Email / Ticket)',
      pro: 'Priority VIP (Direct 24/7 WhatsApp)',
      highlight: true
    }
  ];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          color: '#0f172a',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          maxWidth: '860px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Hero */}
        <div
          style={{
            background: 'linear-gradient(135deg, #042f2e 0%, #0d9488 50%, #0284c7 100%)',
            color: '#ffffff',
            padding: '2rem',
            position: 'relative',
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            <X size={20} />
          </button>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            <Award size={14} /> Lotusland & Atlas Health Medical Membership
          </div>

          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
            Elevate Your Practice to Advanced Pro
          </h2>
          <p style={{ margin: 0, fontSize: '0.95rem', color: '#ccfbf1', maxWidth: '650px', lineHeight: 1.5 }}>
            Empower your longevity and regenerative practice with Atlas AI clinical intelligence, bespoke patient branding, and automated recurring retention.
          </p>
        </div>

        {/* Current Plan Indicator Strip */}
        <div
          style={{
            padding: '0.85rem 2rem',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#64748b' }}>Your Current Tier:</span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '2px 10px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.78rem',
                backgroundColor: isPro ? '#f0fdfa' : '#f1f5f9',
                color: isPro ? '#0f766e' : '#475569',
                border: isPro ? '1px solid #99f6e4' : '1px solid #cbd5e1',
              }}
            >
              {isPro ? '💎 Advanced Pro (Active)' : '🟢 Basic Plan (Clinical Starter)'}
            </span>
          </div>
          <div style={{ color: '#0d9488', fontWeight: 600, fontSize: '0.82rem' }}>
            Physician: {doctorName}
          </div>
        </div>

        {/* Responsive styles for modal */}
        <style>{`
          @media (max-width: 768px) {
            .modal-matrix-desktop {
              display: none !important;
            }
            .modal-matrix-mobile {
              display: flex !important;
              flex-direction: column !important;
              gap: 0.75rem !important;
            }
            .modal-header-hero {
              padding: 1.25rem 1rem !important;
            }
            .modal-body-container {
              padding: 1rem !important;
            }
          }
          @media (min-width: 769px) {
            .modal-matrix-desktop {
              display: block !important;
            }
            .modal-matrix-mobile {
              display: none !important;
            }
          }
        `}</style>

        {/* Comparison Table Content */}
        <div className="modal-body-container" style={{ padding: '1.5rem 2rem', overflowY: 'auto', flex: 1 }}>
          {/* Desktop Matrix View */}
          <div className="modal-matrix-desktop" style={{ border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '1rem', width: '38%', fontWeight: 700, color: '#475569' }}>Clinical Capability</th>
                  <th style={{ padding: '1rem', width: '28%', fontWeight: 700, color: '#64748b', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.9rem', color: '#334155' }}>🟢 Basic Plan</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>Free • Essential Access</div>
                  </th>
                  <th style={{ padding: '1rem', width: '34%', fontWeight: 800, color: '#0d9488', textAlign: 'center', background: 'rgba(13, 148, 136, 0.06)' }}>
                    <div style={{ fontSize: '0.95rem', color: '#0f766e', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <Sparkles size={16} /> 💎 Advanced Pro
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#0d9488', fontWeight: 600 }}>Monthly Clinical Subscription</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_FEATURES.map((row, idx) => (
                  <tr 
                    key={idx} 
                    style={{ 
                      borderBottom: '1px solid #f1f5f9',
                      backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa'
                    }}
                  >
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#1e293b' }}>
                      {row.feature}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#64748b' }}>
                      {row.basic}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center', fontWeight: 600, color: '#0f766e', background: 'rgba(13, 148, 136, 0.04)' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={16} color="#0d9488" />
                        <span>{row.pro}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Native Feature Cards (<= 768px) */}
          <div className="modal-matrix-mobile" style={{ display: 'none' }}>
            {COMPARISON_FEATURES.map((row, idx) => (
              <div
                key={idx}
                style={{
                  background: '#ffffff',
                  border: row.highlight ? '1px solid #99f6e4' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1rem',
                  boxShadow: row.highlight ? '0 2px 8px rgba(13, 148, 136, 0.08)' : '0 1px 3px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                    {row.feature}
                  </h4>
                  {row.highlight && (
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, background: '#f0fdfa', color: '#0f766e', border: '1px solid #99f6e4', padding: '2px 6px', borderRadius: '10px' }}>
                      ⚡ PRO
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.5rem' }}>
                  {/* Pro Container */}
                  <div style={{ padding: '0.65rem 0.8rem', borderRadius: '8px', background: 'rgba(13, 148, 136, 0.06)', border: '1px solid #99f6e4' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0f766e' }}>
                        💎 Advanced Pro
                      </span>
                      <Check size={14} color="#0d9488" strokeWidth={3} />
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f766e' }}>
                      {row.pro}
                    </div>
                  </div>

                  {/* Basic Container */}
                  <div style={{ padding: '0.55rem 0.8rem', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', marginBottom: '1px' }}>
                      🟢 Basic Plan
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                      {row.basic}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Value Prop Callouts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
            <div style={{ padding: '1rem', borderRadius: '12px', background: '#f0fdfa', border: '1px solid #ccfbf1' }}>
              <div style={{ color: '#0f766e', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={16} /> +40% Patient Retention
              </div>
              <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.78rem', color: '#334155', lineHeight: 1.4 }}>
                Smart refill reminders ensure peptide therapies are completed with continuous patient adherence.
              </p>
            </div>

            <div style={{ padding: '1rem', borderRadius: '12px', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
              <div style={{ color: '#1d4ed8', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} /> White-Label Clinic Prestige
              </div>
              <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.78rem', color: '#334155', lineHeight: 1.4 }}>
                Deliver dosing schedules and administration instructions featuring your private clinic branding.
              </p>
            </div>

            <div style={{ padding: '1rem', borderRadius: '12px', background: '#faf5ff', border: '1px solid #e9d5ff' }}>
              <div style={{ color: '#7e22ce', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} /> Atlas AI Clinical Copilot
              </div>
              <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.78rem', color: '#334155', lineHeight: 1.4 }}>
                Synthesize blood markers, detect contraindications, and compute exact U-100 syringe units in seconds.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '1.25rem 2rem',
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              No long-term commitment • Instant activation via clinical support or administration
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Close
            </button>

            {!isPro ? (
              <button
                type="button"
                onClick={handleRequestUpgrade}
                disabled={loading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0.65rem 1.5rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(13, 148, 136, 0.35)',
                  opacity: loading ? 0.7 : 1,
                  transition: 'transform 0.15s ease',
                }}
              >
                <Sparkles size={18} />
                Request Pro Plan Upgrade 💎
              </button>
            ) : (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '10px',
                  background: '#f0fdfa',
                  color: '#0f766e',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  border: '1px solid #99f6e4',
                }}
              >
                <Check size={18} /> Already enjoying Advanced Pro Plan
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
