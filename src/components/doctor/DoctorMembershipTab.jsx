'use client';

import React, { useState, useContext } from 'react';
import { 
  Award, 
  Check, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  TrendingUp, 
  FileText, 
  MessageCircle, 
  Stethoscope, 
  Users, 
  ArrowRight,
  HelpCircle,
  Clock,
  Building,
  CheckCircle2
} from '@/lib/icons';
import { toast } from 'react-hot-toast';
import { DoctorContext } from '../../templates/DoctorDashboard';
import notifier from '../../services/NotificationService';

export default function DoctorMembershipTab() {
  const context = useContext(DoctorContext) || {};
  const {
    doctorId = 'dr-hanieh-erdmann',
    doctorMeta = {},
    subscriptionTier = 'basic',
    isProDoctor = false,
    openUpgradeModal
  } = context;

  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);
  const [mobileFilter, setMobileFilter] = useState('all'); // 'all' | 'highlight'

  const doctorDisplayName = doctorMeta?.doctorName || doctorMeta?.name || 'Dr. Hanieh Erdmann';
  const clinicDisplayName = doctorMeta?.clinicName || doctorMeta?.clinic || 'Bedaya Polyclinic L.L.C.';
  const specialty = doctorMeta?.specialty || 'Specialist in Dermatology & Longevity';

  const handleRequestUpgrade = async () => {
    setLoading(true);
    const toastId = toast.loading('Registering upgrade request…');
    try {
      // 1. Send notification to admin
      await notifier.send({
        to: ['admin'],
        type: 'user',
        title: '💎 Pro Plan Upgrade Request',
        message: `Dr. ${doctorDisplayName} (ID: ${doctorId}) from ${clinicDisplayName} has requested an upgrade to the Advanced Pro Plan from the Membership Sheet.`,
        data: { doctorId, doctorName: doctorDisplayName, clinic: clinicDisplayName, requestedTier: 'advanced' }
      });

      // 2. Direct WhatsApp message to medical conciergerie
      const text = encodeURIComponent(
        `Hello, I am Dr. ${doctorDisplayName} from ${clinicDisplayName}. I have reviewed the tier comparison and would like to request an UPGRADE to the Advanced Pro Plan for my peptide practice on Med-Peptides / Atlas Health.`
      );
      const waUrl = `https://wa.me/34600000000?text=${text}`;

      toast.success('Request registered successfully! The clinical administration team will coordinate your activation immediately.', { id: toastId });
      setRequested(true);

      setTimeout(() => {
        window.open(waUrl, '_blank');
      }, 1000);
    } catch (err) {
      console.error(err);
      toast.error('Error processing request: ' + err.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const COMPARISON_ROWS = [
    {
      category: 'Prescription & Dosing',
      feature: 'Clinical Prescription Issuance',
      basic: 'Manual product by product',
      pro: 'Unlimited + Pre-configured 1-Tap Protocols',
      description: 'In the Pro Plan, you can save custom regimens (e.g. GHK-Cu Hair Protocol or Epithalon Longevity) and prescribe them in a single tap.',
      highlight: true
    },
    {
      category: 'Clinical Intelligence',
      feature: 'Atlas AI Clinical Scribe & Copilot',
      basic: '5 basic monthly queries',
      pro: 'UNLIMITED • Blood panel & genetics interpretation',
      description: 'The copilot synthesizes biomarkers, flags contraindications, and calculates reconstitution milliliters and U-100 syringe units in seconds.',
      highlight: true
    },
    {
      category: 'Practice Identity',
      feature: 'Patient Admin Guide (Reconstitution & Syringe)',
      basic: 'Standard Med-Peptides format',
      pro: '100% White-Label with your clinic logo',
      description: 'Your patients receive an interactive guide and official PDF stamped with your clinic logo and contact info (e.g., Bedaya Polyclinic), reinforcing your clinical authority.',
      highlight: true
    },
    {
      category: 'Retention & Adherence',
      feature: 'WhatsApp Predictive Refill Alerts',
      basic: 'Manual follow-up by clinic staff',
      pro: 'Automated 5 days before vial depletion',
      description: 'Patients receive an automated reminder with a direct renewal link, boosting treatment continuity by +40% with zero administrative burden.',
      highlight: true
    },
    {
      category: 'Patient Management',
      feature: 'Active Patients Directory',
      basic: 'Up to 30 active patients',
      pro: 'Unlimited Patients + Advanced SOAP Notes',
      description: 'Complete longitudinal therapy history, biomarker tracking, and structured clinical notes.',
      highlight: false
    },
    {
      category: 'Formulary & Compounding',
      feature: 'Lotusland Formulary Clinical Pricing',
      basic: 'Standard catalog access',
      pro: 'VIP Access + Bioequivalence Comparator',
      description: 'In-depth pharmacokinetics and thermal stability comparison for all Lotusland peptide preparations.',
      highlight: false
    },
    {
      category: 'Telemedicine',
      feature: 'Telehealth & Appointment Scheduling',
      basic: 'Not available',
      pro: 'Integrated appointments & secure video consults',
      description: 'Organize follow-ups for local and international patients with encrypted telehealth rooms.',
      highlight: false
    },
    {
      category: 'Support & Guidance',
      feature: 'Clinical & Pharmacological Support',
      basic: 'Email & ticketing (24-48h response)',
      pro: '24/7 Direct VIP WhatsApp Line',
      description: 'Real-time communication with the Compounding Technical Director for complex reconstitution questions or vial compatibility.',
      highlight: true
    }
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* ── TOP HERO HEADER ──────────────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #042f2e 0%, #0d9488 45%, #0284c7 100%)',
          borderRadius: '20px',
          padding: '2.5rem 2rem',
          color: '#ffffff',
          boxShadow: '0 12px 32px rgba(13, 148, 136, 0.25)',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '2rem'
        }}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(8px)', padding: '6px 14px', borderRadius: '30px', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
            <Award size={15} /> Lotusland & Atlas Health Medical Membership Sheet
          </div>

          <h1 style={{ margin: '0 0 0.75rem 0', fontSize: '2.1rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#ffffff', lineHeight: 1.2 }}>
            Elevate Your Clinical Practice: Basic vs. Advanced Pro
          </h1>
          <p style={{ margin: 0, fontSize: '1rem', color: '#ccfbf1', maxWidth: '780px', lineHeight: 1.6 }}>
            Designed for specialist physicians in longevity, trichology, and regenerative medicine. Explore the differences between the complimentary starter tier and the automated tools that drive superior patient adherence in the Pro tier.
          </p>

          {/* Current Doctor Status Strip */}
          <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', background: 'rgba(0, 0, 0, 0.25)', padding: '12px 18px', borderRadius: '12px', width: 'fit-content' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: '#99f6e4' }}>Active Physician:</span>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>{doctorDisplayName}</span>
              <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>({clinicDisplayName})</span>
            </div>
            <div style={{ height: '16px', width: '1px', background: 'rgba(255, 255, 255, 0.3)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.85rem', color: '#99f6e4' }}>Current Tier:</span>
              <span
                style={{
                  padding: '3px 12px',
                  borderRadius: '12px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  backgroundColor: isProDoctor ? '#f0fdfa' : '#fff7ed',
                  color: isProDoctor ? '#0f766e' : '#c2410c',
                  border: isProDoctor ? '1px solid #99f6e4' : '1px solid #fed7aa'
                }}
              >
                {isProDoctor ? '💎 Advanced Pro Plan Active' : '🟢 Basic Plan (Clinical Starter)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── CURRENT TIER CONTEXT CARD ────────────────────────────────────── */}
      {!isProDoctor && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #fed7aa',
            borderLeft: '5px solid #f97316',
            borderRadius: '14px',
            padding: '1.25rem 1.75rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            flexWrap: 'wrap',
            boxShadow: '0 2px 8px rgba(249, 115, 22, 0.08)'
          }}
        >
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c2410c', fontWeight: 800, fontSize: '0.95rem' }}>
              <Zap size={18} /> Your practice is currently on the Basic Tier
            </div>
            <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
              You have full access to prescribe individual products from the Lotusland formulary. However, your patients do not receive automated WhatsApp refill reminders or personalized guides with your clinic branding.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRequestUpgrade}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.85rem 1.5rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(13, 148, 136, 0.35)',
              flexShrink: 0
            }}
          >
            <Sparkles size={18} />
            {loading ? 'Processing…' : 'Upgrade to Pro Tier ⚡'}
          </button>
        </div>
      )}

      {/* ── RESPONSIVE STYLES ────────────────────────────────────────────── */}
      <style>{`
        @media (max-width: 768px) {
          .matrix-desktop-table {
            display: none !important;
          }
          .matrix-mobile-cards {
            display: flex !important;
            flex-direction: column !important;
            gap: 0.85rem !important;
          }
          .membership-hero-box {
            padding: 1.5rem 1.25rem !important;
            border-radius: 16px !important;
          }
          .membership-hero-title {
            font-size: 1.45rem !important;
          }
          .mobile-floating-upgrade-bar {
            display: flex !important;
          }
        }
        @media (min-width: 769px) {
          .matrix-desktop-table {
            display: block !important;
          }
          .matrix-mobile-cards {
            display: none !important;
          }
          .mobile-floating-upgrade-bar {
            display: none !important;
          }
        }
      `}</style>

      {/* ── SIDE-BY-SIDE COMPARISON (DESKTOP TABLE & MOBILE CARDS) ───────── */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.05)', marginBottom: '2.5rem' }}>
        <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
              Clinical Capabilities Matrix
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Key differences between the essential edition and the professional medical suite
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '8px', fontWeight: 600 }}>
            Updated September 2026
          </span>
        </div>

        {/* 💻 DESKTOP TABLE VIEW (> 768px) */}
        <div className="matrix-desktop-table" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '1.25rem 1.5rem', width: '38%', fontWeight: 800, color: '#334155' }}>
                  Clinical Capability
                </th>
                <th style={{ padding: '1.25rem 1rem', width: '28%', textAlign: 'center', color: '#475569' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#334155' }}>🟢 Basic Plan</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500, marginTop: '2px' }}>
                    Free • Starter Access
                  </div>
                </th>
                <th style={{ padding: '1.25rem 1.25rem', width: '34%', textAlign: 'center', background: 'rgba(13, 148, 136, 0.07)', borderLeft: '2px solid #99f6e4', borderRight: '2px solid #99f6e4' }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f766e', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Sparkles size={18} /> 💎 Advanced Pro
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#0d9488', fontWeight: 700, marginTop: '2px' }}>
                    Monthly Clinical Subscription
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                  }}
                >
                  <td style={{ padding: '1.1rem 1.5rem', verticalAlign: 'top' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                      {row.feature}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
                      {row.description}
                    </div>
                  </td>

                  <td style={{ padding: '1.1rem 1rem', textAlign: 'center', verticalAlign: 'middle', color: '#64748b', fontSize: '0.84rem' }}>
                    <div style={{ display: 'inline-block', padding: '4px 10px', background: '#f1f5f9', borderRadius: '8px', color: '#475569' }}>
                      {row.basic}
                    </div>
                  </td>

                  <td style={{ padding: '1.1rem 1.25rem', textAlign: 'center', verticalAlign: 'middle', background: 'rgba(13, 148, 136, 0.04)', borderLeft: '2px solid #ccfbf1', borderRight: '2px solid #ccfbf1' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '10px', color: '#0f766e', fontWeight: 700, fontSize: '0.84rem' }}>
                      <Check size={16} color="#0d9488" strokeWidth={3} />
                      <span>{row.pro}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 📱 MOBILE NATIVE COMPARISON CARDS (<= 768px) */}
        <div className="matrix-mobile-cards" style={{ display: 'none', padding: '1rem' }}>
          {/* Segmented Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setMobileFilter('all')}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: mobileFilter === 'all' ? '1px solid #0d9488' : '1px solid #e2e8f0',
                background: mobileFilter === 'all' ? '#0d9488' : '#f8fafc',
                color: mobileFilter === 'all' ? '#ffffff' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              All Features ({COMPARISON_ROWS.length})
            </button>
            <button
              type="button"
              onClick={() => setMobileFilter('highlight')}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: mobileFilter === 'highlight' ? '1px solid #0d9488' : '1px solid #e2e8f0',
                background: mobileFilter === 'highlight' ? '#0d9488' : '#f8fafc',
                color: mobileFilter === 'highlight' ? '#ffffff' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              ⚡ Pro Highlights ({COMPARISON_ROWS.filter(r => r.highlight).length})
            </button>
          </div>

          {/* Cards List */}
          {(mobileFilter === 'highlight' ? COMPARISON_ROWS.filter(r => r.highlight) : COMPARISON_ROWS).map((row, idx) => (
            <div
              key={idx}
              style={{
                background: '#ffffff',
                border: row.highlight ? '1px solid #99f6e4' : '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '1.15rem',
                boxShadow: row.highlight ? '0 3px 12px rgba(13, 148, 136, 0.08)' : '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              {/* Category & Tag */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 800, color: '#0d9488' }}>
                  {row.category}
                </span>
                {row.highlight && (
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#f0fdfa', color: '#0f766e', border: '1px solid #99f6e4', padding: '2px 8px', borderRadius: '12px' }}>
                    ⚡ PRO EXCLUSIVE
                  </span>
                )}
              </div>

              {/* Title & description */}
              <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                {row.feature}
              </h4>
              <p style={{ margin: '0 0 0.9rem 0', fontSize: '0.8rem', color: '#64748b', lineHeight: 1.45 }}>
                {row.description}
              </p>

              {/* Stacked Comparison Comparison Units */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {/* 💎 Advanced Pro Highlight Container */}
                <div style={{ padding: '0.75rem 0.9rem', borderRadius: '10px', background: 'rgba(13, 148, 136, 0.06)', border: '1px solid #99f6e4' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0f766e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Sparkles size={14} /> 💎 Advanced Pro Plan
                    </span>
                    <span style={{ background: '#0d9488', color: '#ffffff', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={12} strokeWidth={3} />
                    </span>
                  </div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f766e', lineHeight: 1.35 }}>
                    {row.pro}
                  </div>
                </div>

                {/* 🟢 Basic Plan Container */}
                <div style={{ padding: '0.65rem 0.9rem', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', marginBottom: '2px' }}>
                    🟢 Basic Plan (Free)
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.35 }}>
                    {row.basic}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🚀 FLOATING STICKY UPGRADE BAR ON MOBILE (<= 768px) */}
      {!isProDoctor && (
        <div
          className="mobile-floating-upgrade-bar"
          style={{
            position: 'fixed',
            bottom: '72px',
            left: '16px',
            right: '16px',
            zIndex: 40,
            display: 'none', // Controlled by media query
            boxShadow: '0 8px 24px rgba(13, 148, 136, 0.45)',
            borderRadius: '14px',
          }}
        >
          <button
            type="button"
            onClick={handleRequestUpgrade}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.9rem 1.25rem',
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
            }}
          >
            <Zap size={18} />
            <span>{loading ? 'Processing…' : 'Upgrade to Advanced Pro ⚡'}</span>
          </button>
        </div>
      )}

      {/* ── 3 PILARES DE RETORNO CLÍNICO (POR QUÉ EVOLUCIONAR) ───────────── */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', textAlign: 'center' }}>
          Why do specialist physicians upgrade to Pro?
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#64748b', textAlign: 'center', maxWidth: '650px', margin: '0 auto 1.5rem' }}>
          The Advanced Pro tier transforms peptide prescribing into a predictable, automated, and recurring revenue stream for your practice.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.25rem' }}>
          
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0d9488', marginBottom: '1rem' }}>
              <TrendingUp size={24} />
            </div>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
              +40% Treatment Adherence
            </h4>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
              60% of patients abandon regenerative therapies by forgetting to reorder their refill vial in time. With Pro automated WhatsApp alerts, your patients complete their 8 to 12 week cycles without interruption.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d4ed8', marginBottom: '1rem' }}>
              <Building size={24} />
            </div>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
              White-Label Clinic Prestige
            </h4>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
              Your patients receive instructions branded with your own clinic logo (Bedaya Polyclinic), elevating practice reputation and supporting premium consultation fees.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7e22ce', marginBottom: '1rem' }}>
              <Sparkles size={24} />
            </div>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
              Save up to 4 hours weekly
            </h4>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
              Atlas AI interprets patient lab work, converts reconstitution volumes to U-100 syringe units, and generates clinical guides in seconds, eliminating manual math and patient doubt calls.
            </p>
          </div>

        </div>
      </div>

      {/* ── PROMINENT UPGRADE CARD / CTA ──────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: '20px',
          padding: '2.5rem 2rem',
          color: '#ffffff',
          boxShadow: '0 16px 36px rgba(15, 23, 42, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginBottom: '2.5rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', marginBottom: '1.25rem', boxShadow: '0 4px 20px rgba(13, 148, 136, 0.4)' }}>
          <Sparkles size={28} />
        </div>

        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
          Activate the Advanced Pro Plan for Your Practice
        </h2>
        <p style={{ fontSize: '0.95rem', color: '#94a3b8', maxWidth: '620px', margin: '0 0 1.75rem 0', lineHeight: 1.6 }}>
          No long-term contract. Guided instant activation by our clinical team with dedicated support for Dr. Hanieh Erdmann.
        </p>

        {!isProDoctor ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem' }}>
            <button
              type="button"
              onClick={handleRequestUpgrade}
              disabled={loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '1rem 2.5rem',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '1.05rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 25px rgba(13, 148, 136, 0.45)',
                transition: 'transform 0.15s ease',
              }}
            >
              <Zap size={20} />
              {loading ? 'Submitting request…' : '⚡ Request Upgrade to Advanced Pro Plan'}
            </button>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Upon requesting an upgrade, a clinical advisor will activate your membership and configure your clinic branding.
            </span>
          </div>
        ) : (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.85rem 1.75rem', borderRadius: '12px', background: '#f0fdfa', border: '1px solid #99f6e4', color: '#0f766e', fontWeight: 800, fontSize: '0.95rem' }}>
            <CheckCircle2 size={20} color="#0d9488" />
            Your practice is already enjoying all benefits of the Advanced Pro Plan!
          </div>
        )}
      </div>

      {/* ── FREQUENTLY ASKED QUESTIONS (FAQ) ─────────────────────────────── */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem' }}>
        <h4 style={{ margin: '0 0 1.25rem 0', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HelpCircle size={20} color="#0d9488" /> Frequently Asked Questions about Medical Membership
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b' }}>
              Can I continue using the Basic Plan indefinitely?
            </div>
            <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
              Yes. The Basic Plan is 100% free and never expires. You can continue issuing standard clinical prescriptions for your patients with full access to the official Lotusland formulary.
            </p>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b' }}>
              Is there a minimum commitment for the Pro Plan?
            </div>
            <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
              No, the monthly subscription is fully flexible. You can pause or return to the basic tier at any time by notifying your clinical advisor.
            </p>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b' }}>
              How are patient guides customized with my clinic logo?
            </div>
            <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
              Once the Pro Plan is active, you can upload your clinic logo and letterhead in Settings, or send it via WhatsApp to our technical support team to have it ready in under 15 minutes.
            </p>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b' }}>
              How do WhatsApp refill reminders work?
            </div>
            <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
              The system estimates vial lifespan based on prescribed dosage (e.g. 30 days). When 5 days remain before vial depletion, the patient receives a friendly reminder with current dosage and the option to request renewal directly from your clinic.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
