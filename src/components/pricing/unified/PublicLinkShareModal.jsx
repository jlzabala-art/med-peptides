'use client';

import React, { useState } from 'react';
import { Share2, X, Copy, MessageSquare, FileText, FileDown, Calendar, Building2, Check, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * PublicLinkShareModal
 * ─────────────────────────────────────────────────────────────────────────────
 * Modal for creating and distributing tokenized public links, verified PDF
 * dossiers, and CSV/Excel exports for specific B2B prospects.
 */
export default function PublicLinkShareModal({
  group,
  onClose,
  onGeneratePdf,
  onCopyLink,
  onWhatsAppShare
}) {
  const [recipientOrg, setRecipientOrg] = useState('');
  const [validityDays, setValidityDays] = useState('30');
  const [copied, setCopied] = useState(false);

  if (!group) return null;

  // Build the effective shareable link with optional token/recipient attribution
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const params = new URLSearchParams();
  if (recipientOrg.trim()) {
    params.set('client', recipientOrg.trim().toLowerCase().replace(/\s+/g, '-'));
  }
  if (validityDays !== 'perpetual') {
    params.set('validDays', validityDays);
  }
  const queryStr = params.toString() ? `?${params.toString()}` : '';
  const shareableUrl = `${origin}${group.route}${queryStr}`;

  const handleCopy = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(shareableUrl);
      setCopied(true);
      toast.success(`Public tokenized link for ${group.label} copied ✓`);
      setTimeout(() => setCopied(false), 2000);
      if (onCopyLink) onCopyLink(group);
    }
  };

  const handleWhatsApp = () => {
    if (typeof window !== 'undefined') {
      const recipientPart = recipientOrg ? ` for ${recipientOrg}` : '';
      const msg = `Hello, please find the official B2B price schedule for ${group.label} (${group.badge})${recipientPart}:\n${shareableUrl}\n\nIssued by Atlas Health Services · Precision Medicine.`;
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      if (onWhatsAppShare) onWhatsAppShare(group);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15,23,42,0.6)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          maxWidth: '520px',
          width: '100%',
          padding: '24px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              backgroundColor: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Share2 size={18} color="#0284c7" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                Share Price Schedule · {group.label}
              </h3>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                Authorized access link for clinics, doctors, and wholesale partners
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b', padding: '4px' }}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Client Tagging & Expiration Options */}
        <div style={{
          padding: '12px', backgroundColor: '#f8fafc', borderRadius: '6px',
          border: '1px solid #e2e8f0', marginBottom: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'
        }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
              <Building2 size={12} />
              <span>Recipient / Clinic Name</span>
            </label>
            <input
              type="text"
              value={recipientOrg}
              onChange={(e) => setRecipientOrg(e.target.value)}
              placeholder="e.g. Transcend Healthcare"
              style={{
                width: '100%',
                padding: '6px 10px',
                fontSize: '12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
              <Clock size={12} />
              <span>Link Expiration</span>
            </label>
            <select
              value={validityDays}
              onChange={(e) => setValidityDays(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px',
                fontSize: '12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                boxSizing: 'border-box'
              }}
            >
              <option value="7">7 Days (Short Quote)</option>
              <option value="14">14 Days (Standard)</option>
              <option value="30">30 Days (Monthly)</option>
              <option value="perpetual">Perpetual (No Expiration)</option>
            </select>
          </div>
        </div>

        {/* Public Link Box */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            Public Access Link (Tokenized)
          </label>
          <div style={{ display: 'flex', gap: '6px' }}>
            <input
              type="text"
              readOnly
              value={shareableUrl}
              style={{
                flex: 1,
                padding: '8px 12px',
                fontSize: '12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                color: '#1e293b',
                outline: 'none'
              }}
            />
            <button
              type="button"
              onClick={handleCopy}
              style={{
                padding: '8px 14px',
                backgroundColor: '#003666',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                flexShrink: 0
              }}
              title="Copy link to clipboard"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Direct Channel Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={handleWhatsApp}
            style={{
              width: '100%',
              padding: '10px 14px',
              backgroundColor: '#16a34a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <MessageSquare size={15} />
            <span>Share via WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onGeneratePdf) onGeneratePdf(group);
              onClose();
            }}
            style={{
              width: '100%',
              padding: '10px 14px',
              backgroundColor: '#ffffff',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <FileText size={15} color="#d97706" />
            <span>Download Verified PDF Dossier</span>
          </button>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#475569',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
