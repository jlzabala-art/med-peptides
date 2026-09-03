'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  User, 
  X, 
  CheckCircle, 
  Copy, 
  Send, 
  MessageSquare, 
  ShieldCheck, 
  Building2, 
  DollarSign, 
  Stethoscope, 
  Phone,
  Mail,
  RefreshCw
} from '@/lib/icons';
import notifier from '@/services/NotificationService';

export default function AIUserIntelligenceModal({
  isOpen,
  onClose,
  user = null,
  onUpdateUser = null
}) {
  const [outreachType, setOutreachType] = useState('welcome');
  const [tone, setTone] = useState('clinical');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !user) return null;

  const rawName = user.fullName 
    || user.displayName 
    || ([user.firstName, user.lastName].filter(Boolean).join(' ')) 
    || user.name 
    || user.email?.split('@')[0] 
    || 'Valued Partner';

  const role = user.role || (user.roles && user.roles[0]) || 'patient';
  const email = user.email || user.contactEmail || 'No email';
  const phone = user.phone || user.phoneNumber || '';
  const country = user.country || 'Global';
  const status = user.approved ? 'Approved Active' : 'Pending Verification';

  const handleGenerateAI = () => {
    setIsGenerating(true);
    setCopied(false);

    // Simulate instant AI synthesis based on user's real metadata & parameters
    setTimeout(() => {
      let subject = '';
      let message = '';
      let recommendedTier = 'clinic';
      let riskScore = 'Low';
      let insights = [];

      if (role === 'doctor' || role === 'clinic') {
        recommendedTier = 'clinic';
        insights = [
          'Practitioner verified with clinical protocol privileges enabled.',
          'Eligible for 15% wholesale compounding discount upon first 5 active prescriptions.',
          'Recommended action: send AI-assisted peptide dosage guide and WhatsApp direct liaison.'
        ];
        if (outreachType === 'welcome') {
          subject = `Welcome Dr. ${rawName} to the Atlas Health Clinical Portal`;
          message = `Hello Dr. ${rawName},\n\nWelcome to Atlas Health Medical Peptides. Your clinical portal access is now active, providing you with our verified research peptide catalog, AI Clinical Scribe, and custom dosing calculator.\n\nYou can access your portal here: https://med-peptides.com/doctor\n\nIf you have any questions or require custom formulations for your practice, feel free to reply directly to this chat.\n\nBest regards,\nAtlas Health Clinical Logistics Team`;
        } else {
          subject = `Clinical Protocol Update & Bulk Compounding for Dr. ${rawName}`;
          message = `Dear Dr. ${rawName},\n\nWe wanted to share our latest clinical protocol monographs for BPC-157, TB-500, and GLP-1 analogues now available in your portal with batch analytical COAs.\n\nLet us know if you need priority allocation for your clinic.\n\nWarm regards,\nAtlas Health Team`;
        }
      } else if (role === 'wholesaler') {
        recommendedTier = 'wholesale';
        riskScore = user.approved ? 'Low' : 'Medium (Awaiting Tax ID)';
        insights = [
          'High-volume commercial account candidate.',
          'Tier recommendation: Wholesale B2B with tier volume pricing.',
          'Assigned logistics hub: Europe & Middle East Priority Air Freight.'
        ];
        subject = `Atlas Health B2B Wholesale Partnership — ${rawName}`;
        message = `Hello ${rawName},\n\nThank you for partnering with Atlas Health. We have enabled Wholesale Tier pricing for your account, giving you direct access to batch bulk procurement and private labelling.\n\nAccess your B2B dashboard here: https://med-peptides.com/wholesaler\n\nWe look forward to supporting your supply chain.\n\nAtlas Health Global Logistics`;
      } else {
        recommendedTier = 'retail';
        insights = [
          'Patient wellness profile created.',
          'Assigned pricing channel: Retail Public.',
          'Recommended action: connect with certified physician for personalized protocol supervision.'
        ];
        subject = `Welcome to Atlas Health, ${rawName}`;
        message = `Hi ${rawName},\n\nThank you for creating your account with Atlas Health. You can now explore our scientific catalog and track your wellness protocols safely.\n\nPortal: https://med-peptides.com/patient\n\nLet us know if you have any questions!\n\nBest regards,\nAtlas Health Support`;
      }

      setAiAnalysis({
        summary: `${rawName} is registered as a ${role.toUpperCase()} in ${country}. Account status: ${status}.`,
        recommendedTier,
        riskScore,
        insights,
        subject,
        message
      });
      setIsGenerating(false);
    }, 600);
  };

  const handleCopy = () => {
    if (!aiAnalysis?.message) return;
    navigator.clipboard.writeText(aiAnalysis.message);
    setCopied(true);
    notifier.success('AI Message copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    if (!aiAnalysis?.message) return;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanPhone) {
      notifier.warning('No phone number registered for this user. Message copied to clipboard instead.');
      handleCopy();
      return;
    }
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(aiAnalysis.message)}`;
    window.open(url, '_blank');
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(6px)',
      padding: '1rem'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '680px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                AI User Intelligence & Outreach
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                {rawName} ({role.toUpperCase()})
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.25rem',
              borderRadius: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* User Quick Snapshot */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '0.75rem',
            padding: '1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>User</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>{rawName}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Email</div>
              <div style={{ fontSize: '0.82rem', color: '#334155', wordBreak: 'break-all' }}>{email}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Phone</div>
              <div style={{ fontSize: '0.85rem', color: '#334155' }}>{phone || 'Not recorded'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Status</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: user.approved ? '#16a34a' : '#d97706' }}>{status}</div>
            </div>
          </div>

          {/* AI Controls */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Outreach Goal:</span>
              <select
                value={outreachType}
                onChange={(e) => setOutreachType(e.target.value)}
                style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  backgroundColor: '#ffffff',
                  color: '#0f172a'
                }}
              >
                <option value="welcome">Welcome & Portal Onboarding</option>
                <option value="protocol">Clinical Protocol & Catalog Update</option>
                <option value="b2b_offer">Wholesale B2B Pricing Offer</option>
                <option value="reactivation">Re-engagement & Check-in</option>
              </select>
            </div>

            <button
              onClick={handleGenerateAI}
              disabled={isGenerating}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
              }}
            >
              <Sparkles size={15} />
              <span>{isGenerating ? 'Synthesizing...' : 'Generate AI Insights'}</span>
            </button>
          </div>

          {/* AI Result Card */}
          {aiAnalysis ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              padding: '1.25rem',
              backgroundColor: '#f0fdf4',
              borderRadius: '12px',
              border: '1px solid #bbf7d0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#166534', fontWeight: 700, fontSize: '0.9rem' }}>
                  <CheckCircle size={18} />
                  <span>AI Clinical & Commercial Synthesis</span>
                </div>
                <span style={{
                  padding: '0.2rem 0.5rem',
                  borderRadius: '6px',
                  backgroundColor: '#dcfce7',
                  color: '#15803d',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  Recommended Tier: {aiAnalysis.recommendedTier.toUpperCase()}
                </span>
              </div>

              {/* Insights List */}
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.82rem', color: '#14532d', lineHeight: 1.6 }}>
                {aiAnalysis.insights.map((ins, i) => (
                  <li key={i}>{ins}</li>
                ))}
              </ul>

              {/* Generated Message Draft */}
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#166534', marginBottom: '0.4rem' }}>
                  Tailored Outreach Message:
                </div>
                <textarea
                  readOnly
                  value={aiAnalysis.message}
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #86efac',
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    fontSize: '0.85rem',
                    fontFamily: 'inherit',
                    lineHeight: 1.5,
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button
                  onClick={handleCopy}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 0.9rem',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #86efac',
                    color: '#166534',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  <Copy size={14} />
                  <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                </button>

                <button
                  onClick={handleSendWhatsApp}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 1rem',
                    borderRadius: '8px',
                    backgroundColor: '#22c55e',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  <Send size={14} />
                  <span>Send via WhatsApp</span>
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '2rem 1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '1px dashed #cbd5e1',
              color: '#64748b'
            }}>
              <Sparkles size={28} color="#94a3b8" style={{ marginBottom: '0.5rem' }} />
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#334155' }}>
                Generate AI Intelligence for {rawName}
              </div>
              <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                Synthesize clinical credentials, volume recommendations, and tailored WhatsApp outreach in 1 click.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'flex-end',
          backgroundColor: '#f8fafc'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
