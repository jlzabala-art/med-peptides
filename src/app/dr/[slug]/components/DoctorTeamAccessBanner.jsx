'use client';

import React, { useState } from 'react';
import { Lock, Sparkles, UserCheck, Stethoscope, ClipboardList, ArrowRight, Mail, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * DoctorTeamAccessBanner
 * ─────────────────────────────────────────────────────────────────────────────
 * Modular GCP-style banner for /dr/[slug]:
 *  - When unauthenticated: Instant 1-step Clinic Email unlock (for Doctor or Assistant)
 *    plus 1-Tap Magic Link fallback.
 *  - When authenticated: Quick role switcher between Assistant Prep Mode (follow-ups,
 *    portal invites, refills) and Doctor Sign-Off Mode (batch signature queue).
 */
export default function DoctorTeamAccessBanner({
  doctorSlug = '',
  isAuthorizedViewer = false,
  viewerRole = 'doctor',
  onSetViewerRole,
  onQuickUnlocked,
  onOpenMagicLogin,
  onOpenAssistantQueue,
  onOpenDoctorSignOff,
  pendingTasksCount = 0,
  refillsDueCount = 0,
}) {
  const [emailInput, setEmailInput] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleQuickEmailUnlock = async (e) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      toast.error('Enter your registered clinic or assistant email.');
      return;
    }

    setIsUnlocking(true);
    try {
      const res = await fetch('/api/doctor/quick-email-unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorSlug, email: cleanEmail }),
      });
      const data = await res.json();
      if (!res.ok || !data?.authorized) {
        throw new Error(data?.error || 'Could not verify email.');
      }

      if (data.workstationToken) {
        try {
          localStorage.setItem('atlas_workstation_session', data.workstationToken);
        } catch (err) {
          console.debug('Could not save workstation session:', err);
        }
      }
      onQuickUnlocked?.(data.viewerRole || 'doctor');
      toast.success(
        data.viewerRole === 'assistant'
          ? 'Unlocked in Assistant Mode (90 days).'
          : 'Portal unlocked for 90 days!'
      );
    } catch (err) {
      toast.error(err.message || 'Verification failed.');
    } finally {
      setIsUnlocking(false);
    }
  };

  if (!isAuthorizedViewer) {
    return (
      <section
        aria-label="1-Step Practice and Assistant Access"
        style={{
          marginBottom: '16px',
          padding: '12px 16px',
          borderRadius: '10px',
          background: '#f8fafc',
          border: '1px solid #cbd5e1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '240px', flex: '1 1 280px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: '#e0f2fe',
              color: '#0369a1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Lock size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
              Patient Names Masked · Instant Clinic Email Unlock
            </div>
            <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '2px' }}>
              Enter your registered clinic or assistant email to unlock patient names for 90 days — no password needed.
            </div>
          </div>
        </div>

        <form
          onSubmit={handleQuickEmailUnlock}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flex: '1 1 320px', justifyContent: 'flex-end' }}
        >
          <div style={{ position: 'relative', minWidth: '210px', flex: '1 1 210px', maxWidth: '280px' }}>
            <Mail size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="clinic@email.com"
              aria-label="Registered clinic or assistant email"
              style={{
                width: '100%',
                height: '36px',
                padding: '0 10px 0 32px',
                borderRadius: '7px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: '0.80rem',
                color: '#0f172a',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isUnlocking}
            className="gcp-btn-primary"
            style={{ fontSize: '0.78rem', height: '36px', padding: '0 14px', whiteSpace: 'nowrap' }}
          >
            {isUnlocking ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            <span>{isUnlocking ? 'Verifying...' : 'Unlock'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenMagicLogin}
            className="gcp-btn-secondary"
            style={{ fontSize: '0.76rem', height: '36px', padding: '0 11px', whiteSpace: 'nowrap' }}
          >
            <span>WhatsApp Link</span>
          </button>
        </form>
      </section>
    );
  }

  return (
    <section
      aria-label="Clinical Team Workflow Switcher"
      style={{
        marginBottom: '14px',
        padding: '10px 14px',
        borderRadius: '10px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          Clinic Desk View:
        </span>
        <button
          type="button"
          onClick={() => {
            onSetViewerRole?.('doctor');
            onOpenDoctorSignOff?.();
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 11px',
            borderRadius: '7px',
            border: viewerRole === 'doctor' ? '1.5px solid #003666' : '1px solid #e2e8f0',
            background: viewerRole === 'doctor' ? '#eff6ff' : '#f8fafc',
            color: viewerRole === 'doctor' ? '#003666' : '#475569',
            fontSize: '0.76rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Stethoscope size={13} />
          <span>Doctor Sign-Off Mode</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onSetViewerRole?.('assistant');
            onOpenAssistantQueue?.();
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 11px',
            borderRadius: '7px',
            border: viewerRole === 'assistant' ? '1.5px solid #0d9488' : '1px solid #e2e8f0',
            background: viewerRole === 'assistant' ? '#f0fdfa' : '#f8fafc',
            color: viewerRole === 'assistant' ? '#0f766e' : '#475569',
            fontSize: '0.76rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <UserCheck size={13} />
          <span>Assistant Prep Queue</span>
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem', color: '#475569' }}>
        <ClipboardList size={13} color="#0d9488" />
        <span>
          <strong>{pendingTasksCount}</strong> follow-ups · <strong>{refillsDueCount}</strong> refills due
        </span>
        <button
          type="button"
          onClick={onOpenAssistantQueue}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            border: 'none',
            background: 'transparent',
            color: '#0284c7',
            fontWeight: 700,
            fontSize: '0.74rem',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <span>Open Queue</span>
          <ArrowRight size={12} />
        </button>
      </div>
    </section>
  );
}
