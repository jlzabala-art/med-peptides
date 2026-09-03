'use client';

import React, { useState } from 'react';
import { 
  UserPlus, 
  X, 
  Mail, 
  Copy, 
  Check, 
  Sparkles, 
  MessageSquare,
  DollarSign
} from '@/lib/icons';
import notifier from '@/services/NotificationService';

export default function InviteUserModal({
  isOpen,
  onClose
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'doctor',
    pricingChannel: 'clinic',
    clinicName: ''
  });

  const [generatedInvite, setGeneratedInvite] = useState(null);

  if (!isOpen) return null;

  const handleGenerateInvite = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      notifier.error('Please provide at least a name and email.');
      return;
    }

    const token = `inv_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const inviteLink = `${window.location.origin}/login?invite=${token}&role=${formData.role}&email=${encodeURIComponent(formData.email)}`;

    const whatsappMessage = `Hello Dr. ${formData.name},\n\nYou have been invited to the Atlas Health Clinical Platform as a ${formData.role.toUpperCase()} with ${formData.pricingChannel.toUpperCase()} pricing.\n\nAccess your clinical workspace here:\n${inviteLink}\n\nBest regards,\nAtlas Health Clinical Operations`;

    setGeneratedInvite({
      token,
      inviteLink,
      whatsappMessage
    });

    notifier.success(`Invitation token generated for ${formData.name}!`);
  };

  const handleCopyLink = () => {
    if (!generatedInvite) return;
    navigator.clipboard?.writeText(generatedInvite.inviteLink);
    notifier.success('Invitation link copied to clipboard!');
  };

  const handleOpenWhatsApp = () => {
    if (!generatedInvite) return;
    const phone = formData.phone.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(generatedInvite.whatsappMessage);
    const url = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1.5rem'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        width: '100%',
        maxWidth: '560px',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        overflow: 'hidden',
        border: '1px solid #cbd5e1'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'rgba(0,163,224,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}>
              <UserPlus size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                Instant User Invitation & Onboarding
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                Generate onboarding link with pre-assigned role & price channel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!generatedInvite ? (
            <form onSubmit={handleGenerateInvite} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                  Full Name / Practitioner Name:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Carlos Méndez"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                    Email Address:
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="doctor@clinic.ae"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                    Phone / WhatsApp:
                  </label>
                  <input
                    type="text"
                    placeholder="+971 50 000 0000"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                    Assigned Role:
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  >
                    <option value="doctor">Practitioner / Physician</option>
                    <option value="clinic">Clinic / Practice</option>
                    <option value="wholesaler">Wholesaler / Distributor</option>
                    <option value="patient">Patient</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                    Assigned Pricing Channel:
                  </label>
                  <select
                    value={formData.pricingChannel}
                    onChange={(e) => setFormData(prev => ({ ...prev, pricingChannel: e.target.value }))}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  >
                    <option value="clinic">Clinic (Cost + 50%)</option>
                    <option value="wholesale">Wholesale B2B (Cost + 30%)</option>
                    <option value="retail">Retail / Patient (Public)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                style={{
                  marginTop: '0.5rem',
                  padding: '0.7rem',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem'
                }}
              >
                <Sparkles size={16} /> Generate Magic Invitation Link
              </button>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.2s ease-out' }}>
              <div style={{ padding: '0.85rem', backgroundColor: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#166534', marginBottom: '0.2rem' }}>
                  ✓ Invitation Ready for {formData.name}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#475569' }}>
                  Role: <strong>{formData.role.toUpperCase()}</strong> · Pricing: <strong>{formData.pricingChannel.toUpperCase()}</strong>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                  Direct Onboarding URL:
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    readOnly
                    value={generatedInvite.inviteLink}
                    style={{ flex: 1, padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.78rem', backgroundColor: '#f8fafc', color: '#334155' }}
                  />
                  <button
                    onClick={handleCopyLink}
                    style={{
                      padding: '0.55rem 0.85rem',
                      backgroundColor: 'var(--primary)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <Copy size={14} /> Copy
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                <button
                  onClick={handleOpenWhatsApp}
                  style={{
                    padding: '0.7rem',
                    backgroundColor: '#22c55e',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <MessageSquare size={16} /> Send via WhatsApp
                </button>
                <button
                  onClick={() => {
                    const mailto = `mailto:${formData.email}?subject=Invitation%20to%20Atlas%20Health%20Clinical%20Platform&body=${encodeURIComponent(generatedInvite.whatsappMessage)}`;
                    window.location.href = mailto;
                  }}
                  style={{
                    padding: '0.7rem',
                    backgroundColor: '#f8fafc',
                    color: '#0f172a',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Mail size={16} /> Send via Email
                </button>
              </div>

              <button
                onClick={() => setGeneratedInvite(null)}
                style={{
                  marginTop: '0.5rem',
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                ← Invite Another User
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
