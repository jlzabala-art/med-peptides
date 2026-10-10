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
  Layers,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  FileText,
  Users,
  Smartphone
} from '@/lib/icons';

export default function DoctorServicesMembershipModal({
  isOpen,
  onClose,
  doctorName = 'Doctor',
  clinicName = 'Medical Practice',
  currentTier = 'basic'
}) {
  const [activeTabFilter, setActiveTabFilter] = useState('all'); // 'all' | 'highlight'

  if (!isOpen) return null;

  const isPro = currentTier === 'advanced' || currentTier === 'pro';

  const handleContactWhatsApp = (subject = 'Atlas Health Services & Pro Tier Inquiry') => {
    const text = encodeURIComponent(
      `Hello Atlas Health Team, I am Dr. ${doctorName} (${clinicName}). I am reviewing the Atlas Platform Services & Capabilities Matrix and would like more information regarding ${subject}.`
    );
    const waUrl = `https://wa.me/971553561058?text=${text}`; // Atlas Conciergerie line
    window.open(waUrl, '_blank');
  };

  const COMPARISON_ROWS = [
    {
      category: 'PRESCRIPTION & PROTOCOLS',
      feature: 'Clinical Prescription Issuance',
      basic: 'Manual (product by product)',
      pro: 'Unlimited + Pre-Configured 1-Tap Protocols',
      description: 'Save custom multi-vial regimens (e.g. GHK-Cu Hair Protocol, Epithalon Reset) and issue them in one tap.',
      highlight: true
    },
    {
      category: 'CLINICAL INTELLIGENCE',
      feature: 'Atlas AI Clinical Scribe & Copilot',
      basic: '5 queries / session',
      pro: 'UNLIMITED • Blood panels & genetics interpretation',
      description: 'Synthesizes patient biomarkers, flags contraindications, and calculates reconstitution mL & U-100 syringe units.',
      highlight: true
    },
    {
      category: 'PRACTICE AUTHORITY',
      feature: 'Patient Admin Guide (Reconstitution & Syringes)',
      basic: 'Standard Atlas Health format',
      pro: '100% White-Label with your clinic logo & branding',
      description: 'Patients receive an interactive portal and printable PDF stamped with your clinic authority and direct contacts.',
      highlight: true
    },
    {
      category: 'RETENTION & ADHERENCE',
      feature: 'WhatsApp Predictive Refill Alerts',
      basic: 'Manual clinic follow-up',
      pro: 'Automated 5 days before vial completion',
      description: 'Proactive reminders with direct renewal links, boosting longitudinal patient adherence by +40%.',
      highlight: true
    },
    {
      category: 'PATIENT DIRECTORY',
      feature: 'Active Patients Directory & Records',
      basic: 'Up to 30 active patients',
      pro: 'Unlimited Patients + Longitudinal SOAP Notes',
      description: 'Complete longitudinal therapy tracking, biometric evolution, and structured clinical timeline.',
      highlight: false
    },
    {
      category: 'PHARMACOPEIA ACCESS',
      feature: 'Lotusland Formulary & Compounding Pricing',
      basic: 'Standard verified catalog access',
      pro: 'VIP Access + Bioequivalence & Thermal Stability Matrix',
      description: 'In-depth pharmacokinetics, bioequivalence benchmarks, and compounding stability data.',
      highlight: false
    },
    {
      category: 'TELEHEALTH & APPOINTMENTS',
      feature: 'Telemedicine & Video Consultation Rooms',
      basic: 'Manual scheduling',
      pro: 'Integrated appointments & encrypted video consults',
      description: 'Conduct follow-ups for local and international longevity patients within the portal.',
      highlight: false
    },
    {
      category: 'CLINICAL SUPPORT',
      feature: 'Pharmacological & Technical Support',
      basic: 'Standard email & ticketing (24-48h response)',
      pro: '24/7 Direct VIP WhatsApp Line',
      description: 'Instant direct communication with the Compounding Technical Director for formulation inquiries.',
      highlight: true
    }
  ];

  const filteredRows = activeTabFilter === 'highlight' 
    ? COMPARISON_ROWS.filter(r => r.highlight) 
    : COMPARISON_ROWS;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
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
          maxWidth: '920px',
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
              Every verified medical professional has free lifetime access to browse formularies, prescribe compounding therapies, and provide patient care. The <strong>Advanced Pro Plan</strong> is an optional suite designed for clinics seeking automated white-label guides, custom branding, and WhatsApp refill workflows.
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
                      Basic Plan
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      backgroundColor: '#e6f4ea',
                      color: '#137333',
                      border: '1px solid #ceead6',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}
                  >
                    ACTIVE BY DEFAULT
                  </span>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#202124' }}>
                    $0 <span style={{ fontSize: '0.82rem', fontWeight: 500, color: '#5f6368' }}>/ free forever</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#5f6368', marginTop: '2px' }}>
                    Standard clinical access for all licensed practitioners.
                  </div>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    'Full Lotusland & Compounding Formulary Access',
                    'Individual Product Prescription Issuance',
                    'Up to 30 Active Patients Directory',
                    'Standard Med-Peptides Posology & Syringe Guide',
                    '5 Clinical AI queries per browser session',
                    'Standard Email / Ticketing Support (24-48h)'
                  ].map((feat, i) => (
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
                <span>Included with verified medical registration</span>
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
                      Advanced Pro
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      backgroundColor: '#e8f0fe',
                      color: '#1a73e8',
                      border: '1px solid #d2e3fc',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}
                  >
                    PRACTICE SUITE
                  </span>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#202124' }}>
                    Custom <span style={{ fontSize: '0.82rem', fontWeight: 500, color: '#5f6368' }}>/ monthly practice billing</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#1a73e8', fontWeight: 600, marginTop: '2px' }}>
                    White-label branding & automated adherence workflows.
                  </div>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    'Unlimited 1-Tap Protocol Regimens (GHK-Cu, Epithalon, etc.)',
                    '100% White-Label Patient Guides stamped with Clinic Logo',
                    'Automated WhatsApp Predictive Refill Alerts (5 days prior)',
                    'Unlimited Active Patients + Longitudinal SOAP Notes',
                    'UNLIMITED Atlas AI Clinical Scribe & Genetics/Labs interpretation',
                    '24/7 Direct VIP WhatsApp Line with Compounding Director'
                  ].map((feat, i) => (
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
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <button
                  type="button"
                  onClick={() => handleContactWhatsApp('Advanced Pro Plan Activation')}
                  style={{
                    width: '100%',
                    padding: '8px 14px',
                    borderRadius: '4px',
                    backgroundColor: '#1a73e8',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1557b0'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#1a73e8'; }}
                >
                  <MessageCircle size={14} />
                  <span>Request Pro Plan Upgrade via WhatsApp</span>
                </button>
              </div>
            </div>
          </div>

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
                All Capabilities ({COMPARISON_ROWS.length})
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
                Pro Highlights ({COMPARISON_ROWS.filter(r => r.highlight).length})
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
            <span>Questions on practice onboarding? </span>
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
