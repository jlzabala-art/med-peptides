"use client";

import React, { useState } from 'react';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import Lock from 'lucide-react/dist/esm/icons/lock';
import Key from 'lucide-react/dist/esm/icons/key';
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import Smartphone from 'lucide-react/dist/esm/icons/smartphone';
import Mail from 'lucide-react/dist/esm/icons/mail';
import Laptop from 'lucide-react/dist/esm/icons/laptop';
import Send from 'lucide-react/dist/esm/icons/send';
import X from 'lucide-react/dist/esm/icons/x';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import toast from 'react-hot-toast';
import { triggerHaptic } from '@/utils/haptics';

export default function DoctorPracticeClaimModal({
  isOpen,
  onClose,
  doctor = {},
  opaqueCode = '',
  onAuthorized = null
}) {
  const [licenseInput, setLicenseInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [rememberDevice, setRememberDevice] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [activeTab, setActiveTab] = useState('claim'); // 'claim' | 'magic_link' | 'forgot_password'

  if (!isOpen) return null;

  // Masking helpers to ensure Zero-Knowledge display (never exposing plaintext on public browsers)
  const maskString = (str, visibleEnd = 3) => {
    if (!str || typeof str !== 'string') return '••••••••';
    const clean = str.trim();
    if (clean.length <= visibleEnd) return '••••' + clean;
    return '••••••••' + clean.slice(-visibleEnd);
  };

  const maskedLicense = doctor.licenseNumber || doctor.license
    ? maskString(doctor.licenseNumber || doctor.license, 4)
    : 'On file with Atlas Health';
  const maskedPhone = doctor.phone
    ? maskString(doctor.phone, 4)
    : 'On file with Atlas Health';
  const maskedEmail = doctor.email
    ? `••••@${doctor.email.split('@')[1] || 'domain.com'}`
    : 'On file with Atlas Health';

  const doctorDisplayName = doctor.name || `Treating Physician (${opaqueCode || 'Practice'})`;
  const clinicDisplayName = doctor.clinic || 'Accredited Medical Practice';

  const handleClaimSubmit = async (e) => {
    if (e) e.preventDefault();
    triggerHaptic('medium');

    if (!licenseInput.trim() && !emailInput.trim()) {
      toast.error('Please enter your Medical License ID or registered clinical email.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/doctor/claim-practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorSlug: doctor.slug || opaqueCode,
          doctorName: doctor.name || '',
          clinic: doctor.clinic || '',
          licenseInput: licenseInput.trim(),
          emailInput: emailInput.trim(),
          phoneInput: phoneInput.trim(),
          rememberDevice: Boolean(rememberDevice)
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit practice verification request.');
      }

      setSubmittedSuccess(true);
      toast.success('Verification request submitted to Medical Operations.');
    } catch (err) {
      console.error('Error submitting practice claim:', err);
      toast.error(err.message || 'Error submitting request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMagicLink = async () => {
    triggerHaptic('medium');
    const targetPhone = phoneInput.trim() || doctor.phone || '';
    const targetEmail = emailInput.trim() || doctor.email || '';

    if (!targetPhone && !targetEmail) {
      toast.error('Please specify your WhatsApp number or registered email to receive the access link.');
      return;
    }

    setIsSendingMagicLink(true);
    try {
      const res = await fetch('/api/doctor/request-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorSlug: doctor.slug || opaqueCode,
          phone: targetPhone,
          email: targetEmail,
          rememberDevice: Boolean(rememberDevice)
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch 1-Tap Access Link.');
      }

      setMagicLinkSent(true);
      toast.success('Instant 1-Tap Access Link dispatched to your WhatsApp/Email!');
    } catch (err) {
      console.error('Error requesting magic link:', err);
      toast.error(err.message || 'Could not send 1-Tap Access link.');
    } finally {
      setIsSendingMagicLink(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
          border: '1px solid #e2e8f0'
        }}
      >
        {/* Header */}
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
            aria-label="Close modal"
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ShieldCheck size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '0.70rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.9, fontWeight: 700 }}>
                Atlas Health Services · Clinical Portal
              </div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                Verify Practice & Unlock Dossiers
              </h2>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '0.80rem', opacity: 0.9, lineHeight: 1.4 }}>
            In compliance with UAE Health Data Law & HIPAA, nominal patient identities are restricted to the authorized treating physician.
          </p>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {submittedSuccess ? (
            <div style={{ textAlign: 'center', padding: '24px 8px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#f0fdf4',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}
              >
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ fontSize: '1.20rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                Practice Verification Request Sent
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5, marginBottom: '20px' }}>
                Medical Operations has been alerted with your practice credentials. You will receive an instant confirmation on WhatsApp / Email once authorized, unlocking full nominal patient records.
              </p>
              <div
                style={{
                  padding: '12px 16px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.80rem',
                  color: '#64748b',
                  marginBottom: '20px'
                }}
              >
                Workstation trust is queued for this browser. Once approved, refreshing this page will reveal all clinical dossiers.
              </div>
              <button
                type="button"
                onClick={() => {
                  if (typeof onAuthorized === 'function') onAuthorized();
                  onClose();
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#003666',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 650,
                  fontSize: '0.90rem',
                  cursor: 'pointer'
                }}
              >
                Return to Clinical View
              </button>
            </div>
          ) : magicLinkSent ? (
            <div style={{ textAlign: 'center', padding: '24px 8px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}
              >
                <Smartphone size={34} />
              </div>
              <h3 style={{ fontSize: '1.20rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                1-Tap Access Link Dispatched
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5, marginBottom: '20px' }}>
                A password-free clinical access link has been sent to your verified mobile/email. Open the link to instantly unlock patient dossiers and bind this workstation.
              </p>
              <button
                type="button"
                onClick={onClose}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#003666',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 650,
                  fontSize: '0.90rem',
                  cursor: 'pointer'
                }}
              >
                Understood, Return to Portal
              </button>
            </div>
          ) : (
            <>
              {/* Practice Summary (Zero sensitive data exposed) */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  marginBottom: '18px'
                }}
              >
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Target Clinical Practice
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
                  {doctorDisplayName}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                  {clinicDisplayName} · Portal Code: <code style={{ background: '#e2e8f0', padding: '1px 4px', borderRadius: '4px' }}>{opaqueCode}</code>
                </div>
              </div>

              {/* Masked Credentials on File (Zero-Knowledge) */}
              <div
                style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  marginBottom: '18px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontWeight: 700, color: '#1e40af', marginBottom: '8px' }}>
                  <Lock size={13} />
                  <span>Clinical Records On File with Atlas Health:</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '6px', fontSize: '0.76rem', color: '#1e3a8a' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#475569' }}>Medical License / DHA:</span>
                    <span style={{ fontWeight: 600 }}>{maskedLicense}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#475569' }}>Registered Mobile:</span>
                    <span style={{ fontWeight: 600 }}>{maskedPhone}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#475569' }}>Official Clinical Domain:</span>
                    <span style={{ fontWeight: 600 }}>{maskedEmail}</span>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div
                style={{
                  display: 'flex',
                  borderBottom: '1px solid #e2e8f0',
                  marginBottom: '16px'
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveTab('claim')}
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    border: 'none',
                    borderBottom: activeTab === 'claim' ? '2px solid #003666' : '2px solid transparent',
                    background: 'transparent',
                    fontSize: '0.80rem',
                    fontWeight: activeTab === 'claim' ? 700 : 500,
                    color: activeTab === 'claim' ? '#003666' : '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  Confirm Identity
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('magic_link')}
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    border: 'none',
                    borderBottom: activeTab === 'magic_link' ? '2px solid #003666' : '2px solid transparent',
                    background: 'transparent',
                    fontSize: '0.80rem',
                    fontWeight: activeTab === 'magic_link' ? 700 : 500,
                    color: activeTab === 'magic_link' ? '#003666' : '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  1-Tap WhatsApp Link
                </button>
              </div>

              {activeTab === 'claim' ? (
                <form onSubmit={handleClaimSubmit}>
                  {/* Medical License Field */}
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Official Medical License ID (DHA / MOH / COMB / GMC)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Key size={15} style={{ position: 'absolute', left: '12px', top: '11px', color: '#94a3b8' }} />
                      <input
                        type="text"
                        placeholder="e.g. DHA-P-0319842"
                        value={licenseInput}
                        onChange={(e) => setLicenseInput(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 12px 9px 36px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.84rem',
                          color: '#0f172a',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  {/* Registered Email or Phone */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                        Registered Email
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Mail size={14} style={{ position: 'absolute', left: '10px', top: '11px', color: '#94a3b8' }} />
                        <input
                          type="email"
                          placeholder="doctor@clinic.ae"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '9px 10px 9px 32px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.80rem',
                            color: '#0f172a',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                        WhatsApp / Mobile
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Smartphone size={14} style={{ position: 'absolute', left: '10px', top: '11px', color: '#94a3b8' }} />
                        <input
                          type="tel"
                          placeholder="+971 52 425 1519"
                          value={phoneInput}
                          onChange={(e) => setPhoneInput(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '9px 10px 9px 32px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.80rem',
                            color: '#0f172a',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Workstation Persistence Checkbox */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      padding: '10px 12px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      marginBottom: '18px'
                    }}
                  >
                    <input
                      type="checkbox"
                      id="rememberWorkstation"
                      checked={rememberDevice}
                      onChange={(e) => setRememberDevice(e.target.checked)}
                      style={{ marginTop: '2px', cursor: 'pointer' }}
                    />
                    <label htmlFor="rememberWorkstation" style={{ fontSize: '0.76rem', color: '#475569', cursor: 'pointer', lineHeight: 1.4 }}>
                      <strong style={{ color: '#0f172a' }}>Trust this clinical workstation (90 days).</strong> Keep nominal patient dossiers accessible on this computer without prompting for re-authentication.
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      width: '100%',
                      padding: '11px',
                      background: '#003666',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 650,
                      fontSize: '0.88rem',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Verifying Credentials...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={16} />
                        <span>Request Practice Authorization</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* 1-Tap WhatsApp Link Tab (Forgot Password / Instant Access) */
                <div>
                  <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.4, marginBottom: '14px' }}>
                    Forgot your password or visiting from your consultation desk? Request an instant, single-use 1-Tap Access Link delivered straight to your verified WhatsApp or email.
                  </p>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Your WhatsApp Number or Registered Email
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. +971 52 425 1519 or doctor@clinic.ae"
                      value={phoneInput || emailInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.includes('@')) {
                          setEmailInput(val);
                        } else {
                          setPhoneInput(val);
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.84rem',
                        color: '#0f172a',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      padding: '10px 12px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      marginBottom: '18px'
                    }}
                  >
                    <input
                      type="checkbox"
                      id="rememberWorkstationMagic"
                      checked={rememberDevice}
                      onChange={(e) => setRememberDevice(e.target.checked)}
                      style={{ marginTop: '2px', cursor: 'pointer' }}
                    />
                    <label htmlFor="rememberWorkstationMagic" style={{ fontSize: '0.76rem', color: '#475569', cursor: 'pointer', lineHeight: 1.4 }}>
                      <strong style={{ color: '#0f172a' }}>Remember this clinical computer (90 days).</strong> Seamless passwordless access upon clicking the WhatsApp link.
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={handleSendMagicLink}
                    disabled={isSendingMagicLink}
                    style={{
                      width: '100%',
                      padding: '11px',
                      background: '#0d9488',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 650,
                      fontSize: '0.88rem',
                      cursor: isSendingMagicLink ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {isSendingMagicLink ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Sending Access Link...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Send 1-Tap Access Link to my WhatsApp</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 24px',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.72rem',
            color: '#64748b'
          }}
        >
          <span>UAE Health Data Protection & HIPAA Verified</span>
          <span>Atlas Health Services</span>
        </div>
      </div>
    </div>
  );
}
