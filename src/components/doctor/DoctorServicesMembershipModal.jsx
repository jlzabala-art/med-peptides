"use client";

import React, { useState } from 'react';
import {
  X,
  Check,
  Sparkles,
  Zap,
  ShieldCheck,
  MessageCircle,
  Award,
  Info,
  Clock,
  CheckCircle2,
  Building,
  FileText,
  User,
  Stethoscope
} from '@/lib/icons';
import {
  DOCTOR_TIERS,
  DOCTOR_CAPABILITIES_MATRIX,
  resolveDoctorTier
} from '@/data/doctorMembershipTiers';

export default function DoctorServicesMembershipModal({
  isOpen,
  onClose,
  doctor = {},
  doctorName = 'Doctor',
  clinicName = 'Medical Practice',
  currentTier = 'basic'
}) {
  const [activeTabFilter, setActiveTabFilter] = useState('all'); // 'all' | 'highlight'
  const [showWhiteLabelPreview, setShowWhiteLabelPreview] = useState(false);

  if (!isOpen) return null;

  const resolved = resolveDoctorTier(doctor);
  const isPro = resolved.isPro || currentTier === 'advanced' || currentTier === 'pro';

  const effectiveDoctorName = doctor.name || doctorName || 'Dr. Hanieh Erdmann';
  const effectiveClinicName = doctor.clinic || clinicName || 'Bedaya Polyclinic L.L.C.';

  const handleContactWhatsApp = (subject = 'Atlas Health Services & Pro Tier Inquiry') => {
    const text = encodeURIComponent(
      `Hello Atlas Health Team, I am Dr. ${effectiveDoctorName} (${effectiveClinicName}). I am reviewing the Atlas Platform Services & Capabilities Matrix and would like more information regarding ${subject}.`
    );
    const waUrl = `https://wa.me/971553561058?text=${text}`; // Atlas Conciergerie line
    window.open(waUrl, '_blank');
  };

  const filteredRows = activeTabFilter === 'highlight' 
    ? DOCTOR_CAPABILITIES_MATRIX.filter(r => r.highlight) 
    : DOCTOR_CAPABILITIES_MATRIX;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '940px',
          maxHeight: '92vh',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(60,64,67,0.28), 0 0 0 1px #dadce0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal Header (Google Cloud Console Standard) ── */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #e0e0e0',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '16px',
            position: 'relative'
          }}
        >
          <div>
            <div
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#1a73e8',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Award size={14} color="#1a73e8" />
              <span>Atlas Health Platform · Services & Membership Tiers</span>
            </div>
            <h2
              style={{
                margin: 0,
                fontSize: '1.28rem',
                fontWeight: 700,
                color: '#202124',
                letterSpacing: '-0.01em'
              }}
            >
              Physician Services: Free Starter Access vs. Advanced Pro
            </h2>
            <p
              style={{
                margin: '4px 0 0 0',
                fontSize: '0.84rem',
                color: '#5f6368',
                lineHeight: 1.45
              }}
            >
              Licensed physicians receive 100% complimentary public access to the Atlas platform, with optional premium services for white-label practice automation.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              background: 'transparent',
              color: '#5f6368',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f3f4'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Modal Body (Scrollable Container) ── */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}
        >
          {/* Informational Callout (GCP Alert Style) */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '6px',
              backgroundColor: '#e8f0fe',
              border: '1px solid #d2e3fc',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}
          >
            <Info size={18} color="#1a73e8" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.82rem', color: '#174ea6', lineHeight: 1.5 }}>
              <strong>Complimentary Access for Licensed Physicians: </strong>
              Every verified medical practitioner has free lifetime access to browse formularies, prescribe compounding therapies, and manage up to 30 active patients at zero cost. The <strong>Advanced Pro Plan</strong> is an optional suite designed for practices seeking automated white-label guides, custom branding, and WhatsApp refill workflows.
            </div>
          </div>

          {/* ── Two Tier Overview Cards (GCP Grid) ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '14px'
            }}
          >
            {/* Card 1: 🟢 Basic Plan */}
            <div
              style={{
                border: '1px solid #dadce0',
                borderRadius: '8px',
                padding: '16px',
                backgroundColor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(60,64,67,0.08)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#188038' }} />
                    <span style={{ fontSize: '0.96rem', fontWeight: 700, color: '#202124' }}>
                      {DOCTOR_TIERS.BASIC.name}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      backgroundColor: DOCTOR_TIERS.BASIC.badgeBg,
                      color: DOCTOR_TIERS.BASIC.badgeColor,
                      border: '1px solid #ceead6',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}
                  >
                    {!isPro ? 'YOUR CURRENT TIER' : DOCTOR_TIERS.BASIC.badge}
                  </span>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#202124' }}>
                    {DOCTOR_TIERS.BASIC.priceDisplay} <span style={{ fontSize: '0.82rem', fontWeight: 500, color: '#5f6368' }}>/ {DOCTOR_TIERS.BASIC.frequency}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#5f6368', marginTop: '2px' }}>
                    {DOCTOR_TIERS.BASIC.summary}
                  </div>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {DOCTOR_TIERS.BASIC.keyHighlights.map((feat, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.79rem', color: '#3c4043' }}>
                      <Check size={14} color="#188038" strokeWidth={2.5} style={{ flexShrink: 0 }} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div
                style={{
                  marginTop: '14px',
                  paddingTop: '10px',
                  borderTop: '1px solid #f1f3f4',
                  fontSize: '0.74rem',
                  color: '#70757a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <CheckCircle2 size={13} color="#188038" />
                <span>Verified medical registration for Dr. {effectiveDoctorName}</span>
              </div>
            </div>

            {/* Card 2: 💎 Advanced Pro Plan */}
            <div
              style={{
                border: '1.5px solid #1a73e8',
                borderRadius: '8px',
                padding: '16px',
                backgroundColor: '#f8fafd',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 2px 8px rgba(26,115,232,0.12)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={16} color="#1a73e8" />
                    <span style={{ fontSize: '0.96rem', fontWeight: 800, color: '#1a73e8' }}>
                      {DOCTOR_TIERS.PRO.name}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      backgroundColor: isPro ? '#e6f4ea' : DOCTOR_TIERS.PRO.badgeBg,
                      color: isPro ? '#137333' : DOCTOR_TIERS.PRO.badgeColor,
                      border: isPro ? '1px solid #ceead6' : '1px solid #d2e3fc',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}
                  >
                    {isPro ? 'ACTIVE PRO MEMBER 💎' : DOCTOR_TIERS.PRO.badge}
                  </span>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#202124' }}>
                    {DOCTOR_TIERS.PRO.priceDisplay} <span style={{ fontSize: '0.82rem', fontWeight: 500, color: '#5f6368' }}>/ {DOCTOR_TIERS.PRO.frequency}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#1a73e8', fontWeight: 600, marginTop: '2px' }}>
                    {DOCTOR_TIERS.PRO.summary}
                  </div>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {DOCTOR_TIERS.PRO.keyHighlights.map((feat, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.79rem', color: '#174ea6' }}>
                      <Sparkles size={13} color="#1a73e8" style={{ flexShrink: 0 }} />
                      <strong style={{ fontWeight: 600 }}>{feat}</strong>
                    </li>
                  ))}
                </ul>
              </div>

              <div
                style={{
                  marginTop: '14px',
                  paddingTop: '10px',
                  borderTop: '1px solid #d2e3fc',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setShowWhiteLabelPreview(!showWhiteLabelPreview)}
                    style={{
                      flex: 1,
                      padding: '7px 10px',
                      borderRadius: '4px',
                      backgroundColor: '#ffffff',
                      color: '#1a73e8',
                      border: '1px solid #dadce0',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <Building size={13} />
                    <span>{showWhiteLabelPreview ? 'Hide Clinic Preview' : 'Preview White-Label'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleContactWhatsApp('Advanced Pro Plan Activation')}
                    style={{
                      flex: 1.4,
                      padding: '7px 12px',
                      borderRadius: '4px',
                      backgroundColor: '#1a73e8',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <MessageCircle size={14} />
                    <span>{isPro ? 'Contact Concierge' : 'Inquire via WhatsApp'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Dynamic Interactive White-Label Clinic Preview ── */}
          {showWhiteLabelPreview && (
            <div
              style={{
                padding: '14px 18px',
                borderRadius: '8px',
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                animation: 'fadeIn 0.2s ease-out'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ⚡ Interactive White-Label Guide Simulation
                </span>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  Preview for: <strong>{effectiveClinicName}</strong>
                </span>
              </div>

              {/* Mock Patient Handout Header */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                      {effectiveClinicName}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      {effectiveDoctorName} · Specialist in Longevity & Dermatology
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.68rem', background: '#f0fdfa', color: '#0f766e', border: '1px solid #99f6e4', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                      OFFICIAL PATIENT POSOLOGY
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.4 }}>
                  "Your personalized peptide protocol has been configured by {effectiveDoctorName} at {effectiveClinicName}. Follow the interactive reconstitution steps below."
                </div>
              </div>
            </div>
          )}

          {/* ── Table Filter Selector (All vs Pro Highlights) ── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '10px',
              borderTop: '1px solid #e0e0e0'
            }}
          >
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#202124' }}>
              Detailed Capabilities Matrix
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setActiveTabFilter('all')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: activeTabFilter === 'all' ? '1px solid #1a73e8' : '1px solid #dadce0',
                  backgroundColor: activeTabFilter === 'all' ? '#e8f0fe' : '#ffffff',
                  color: activeTabFilter === 'all' ? '#1a73e8' : '#5f6368',
                  cursor: 'pointer'
                }}
              >
                All Capabilities ({DOCTOR_CAPABILITIES_MATRIX.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTabFilter('highlight')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: activeTabFilter === 'highlight' ? '1px solid #1a73e8' : '1px solid #dadce0',
                  backgroundColor: activeTabFilter === 'highlight' ? '#e8f0fe' : '#ffffff',
                  color: activeTabFilter === 'highlight' ? '#1a73e8' : '#5f6368',
                  cursor: 'pointer'
                }}
              >
                Pro Highlights ({DOCTOR_CAPABILITIES_MATRIX.filter(r => r.highlight).length})
              </button>
            </div>
          </div>

          {/* ── Capabilities Table (Google Cloud Table Style) ── */}
          <div
            style={{
              border: '1px solid #dadce0',
              borderRadius: '6px',
              overflow: 'hidden',
              backgroundColor: '#ffffff'
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '0.82rem'
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #dadce0' }}>
                  <th style={{ padding: '10px 14px', width: '38%', fontWeight: 700, color: '#3c4043' }}>
                    Feature / Clinical Capability
                  </th>
                  <th style={{ padding: '10px 14px', width: '28%', textAlign: 'center', fontWeight: 700, color: '#3c4043' }}>
                    🟢 Basic Plan (Free)
                  </th>
                  <th
                    style={{
                      padding: '10px 14px',
                      width: '34%',
                      textAlign: 'center',
                      fontWeight: 700,
                      backgroundColor: '#f8fafd',
                      color: '#1a73e8',
                      borderLeft: '1px solid #d2e3fc'
                    }}
                  >
                    💎 Advanced Pro
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: idx === filteredRows.length - 1 ? 'none' : '1px solid #f1f3f4',
                      backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa'
                    }}
                  >
                    <td style={{ padding: '10px 14px', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: 600, color: '#202124' }}>
                        {row.feature}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#5f6368', marginTop: '2px', lineHeight: 1.4 }}>
                        {row.description}
                      </div>
                    </td>

                    <td style={{ padding: '10px 14px', textAlign: 'center', verticalAlign: 'middle', color: '#5f6368' }}>
                      <div
                        style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          backgroundColor: '#f1f3f4',
                          borderRadius: '4px',
                          color: '#3c4043',
                          fontSize: '0.76rem',
                          fontWeight: 500
                        }}
                      >
                        {row.basic}
                      </div>
                    </td>

                    <td
                      style={{
                        padding: '10px 14px',
                        textAlign: 'center',
                        verticalAlign: 'middle',
                        backgroundColor: '#f8fafd',
                        borderLeft: '1px solid #d2e3fc'
                      }}
                    >
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 10px',
                          backgroundColor: '#e8f0fe',
                          border: '1px solid #d2e3fc',
                          borderRadius: '4px',
                          color: '#1a73e8',
                          fontWeight: 600,
                          fontSize: '0.77rem'
                        }}
                      >
                        <Check size={13} color="#1a73e8" strokeWidth={2.5} />
                        <span>{row.pro}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Modal Footer (GCP Actions Bar) ── */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid #e0e0e0',
            backgroundColor: '#f8f9fa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#5f6368' }}>
            <span>Practice Onboarding & Registration: </span>
            <strong style={{ color: '#202124' }}>WhatsApp Concierge: +971 55 356 1058</strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '7px 16px',
                borderRadius: '4px',
                border: '1px solid #dadce0',
                backgroundColor: '#ffffff',
                color: '#1a73e8',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f1f3f4'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => handleContactWhatsApp('Physician Membership & Services')}
              style={{
                padding: '7px 18px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: '#16a34a',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#15803d'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#16a34a'; }}
            >
              <MessageCircle size={14} />
              <span>Contact Atlas on WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
