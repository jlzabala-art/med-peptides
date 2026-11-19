'use client';

import React from 'react';
import { Lock, Sparkles, UserCheck, Stethoscope, ClipboardList, ArrowRight } from 'lucide-react';

/**
 * DoctorTeamAccessBanner
 * ─────────────────────────────────────────────────────────────────────────────
 * Modular GCP-style banner for /dr/[slug]:
 *  - When unauthenticated: Frictionless 1-Tap Magic Link CTA for Doctor & Assistant.
 *  - When authenticated: Quick role switcher between Assistant Prep Mode (follow-ups,
 *    portal invites, refills) and Doctor Sign-Off Mode (batch signature queue).
 */
export default function DoctorTeamAccessBanner({
  isAuthorizedViewer = false,
  viewerRole = 'doctor',
  onSetViewerRole,
  onOpenMagicLogin,
  onOpenAssistantQueue,
  onOpenDoctorSignOff,
  pendingTasksCount = 0,
  refillsDueCount = 0,
}) {
  if (!isAuthorizedViewer) {
    return (
      <section
        aria-label="1-Tap Practice and Assistant Access"
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '240px', flex: '1 1 320px' }}>
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
              Patient Names Masked · 1-Tap Access for Physician &amp; Medical Assistant
            </div>
            <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '2px' }}>
              No password needed. Unlock full patient dossiers, refill reminders, and WhatsApp follow-ups for 90 days on this clinic browser.
            </div>
          </div>
        </div>

        <button
          type="button"
          className="gcp-btn-primary"
          onClick={onOpenMagicLogin}
          style={{ fontSize: '0.78rem', padding: '8px 14px', whiteSpace: 'nowrap' }}
        >
          <Sparkles size={14} />
          <span>1-Tap Login (Doctor / Assistant)</span>
        </button>
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
