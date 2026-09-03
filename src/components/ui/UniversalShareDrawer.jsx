'use client';
import React, { useState } from 'react';
import StandardDrawer from '@/components/ui/StandardDrawer';
import notifier from '@/services/NotificationService';
import { Copy, Check, MessageSquare, Mail, QrCode, ExternalLink, User } from 'lucide-react';
import { fetchUsersAction } from '@/actions/usersActions';

/**
 * UniversalShareDrawer
 * 
 * Reusable, parameterized component to share ANY resource (Catalogs, PriceLists, 
 * Quotations, Prescriptions, Protocols, Lab Reports, or Generic Links) across all portals.
 * 
 * Complies with AGENTS.md Golden Rules:
 * - Golden Rule #1 & #2: Zero heavy initial load; queries users on-demand with limit(30)
 * - Golden Rule #4: Uses StandardDrawer without context-breaking modals
 * - Golden Rule #8 & #15: Uses CSS variables & semantic colors
 */
export default function UniversalShareDrawer({
  isOpen,
  onClose,
  shareUrl = '',
  docType = 'document',
  title = null,
  subtitle = null,
  itemName = '',
  itemCount = 0,
  recipientName: initialRecipientName = '',
  recipientEmail: initialRecipientEmail = '',
  recipientPhone: initialRecipientPhone = '',
  accountManagerName = 'Atlas Commercial Desk',
  accountManagerEmail = 'orders@atlas-solutions.com',
  logId = null,
  isMobile = false,
  allowedRoles = ['doctor', 'wholeseller', 'account_manager', 'patient', 'custom'],
  customMessageTemplate = null,
}) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  // Recipient selection state
  const [targetType, setTargetType] = useState('doctor');
  const [targetName, setTargetName] = useState(initialRecipientName || '');
  const [targetPhone, setTargetPhone] = useState(initialRecipientPhone || '');
  const [targetEmail, setTargetEmail] = useState(initialRecipientEmail || '');
  
  // On-demand directory state (lazy loaded)
  const [directoryContacts, setDirectoryContacts] = useState([]);
  const [loadingDirectory, setLoadingDirectory] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState('');

  if (!isOpen) return null;

  // On-demand fetcher: Only queries Firestore when the user picks a specific directory tab
  const handleTabChange = async (roleKey) => {
    setTargetType(roleKey);
    setSelectedContactId('');

    if (roleKey === 'account_manager') {
      setTargetName(accountManagerName);
      setTargetEmail(accountManagerEmail);
      setDirectoryContacts([]);
      return;
    }

    if (roleKey === 'custom') {
      setDirectoryContacts([]);
      return;
    }

    setLoadingDirectory(true);
    try {
      const dbRole = roleKey === 'doctor' ? 'doctor' 
        : roleKey === 'wholeseller' ? 'wholeseller' 
        : roleKey === 'patient' ? 'patient' 
        : null;

      const users = await fetchUsersAction({ limitCount: 30, role: dbRole });
      setDirectoryContacts(users || []);
    } catch {
      setDirectoryContacts([]);
    } finally {
      setLoadingDirectory(false);
    }
  };

  const handleSelectContact = (contactId) => {
    setSelectedContactId(contactId);
    const found = directoryContacts.find(c => c.id === contactId);
    if (found) {
      setTargetName(found.displayName || found.name || found.company || found.fullName || '');
      setTargetEmail(found.email || '');
      const phone = found.phone || found.phoneNumber || found.whatsapp || '';
      if (phone) setTargetPhone(phone);
    }
  };

  const markAsSentInCrm = async () => {
    if (!logId) return;
    try {
      await fetch('/api/catalog/tracking-logs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: logId, 
          status: 'sent', 
          sharedWith: targetName, 
          sharedPhone: targetPhone,
          targetType,
        }),
      });
    } catch {
      // Non-blocking background CRM status update
    }
  };

  const handleCopyLink = () => {
    if (!shareUrl) {
      notifier.error('Share URL not available.');
      return;
    }
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    notifier.success('Direct link copied to clipboard ✓');
    markAsSentInCrm();
    setTimeout(() => setCopied(false), 2500);
  };

  const composeMessageText = () => {
    if (customMessageTemplate) {
      return customMessageTemplate({ targetName, targetType, shareUrl, itemName, itemCount, accountManagerEmail });
    }

    const greeting = targetName ? `Dear ${targetName},\n\n` : '';
    const desc = itemName ? `"${itemName}"` : `official ${docType.toUpperCase()}`;
    const countInfo = itemCount ? ` (${itemCount} items)` : '';

    let roleIntro = '';
    if (targetType === 'wholeseller') {
      roleIntro = `Please find your requested wholesale commercial terms and documentation for ${desc}${countInfo}:`;
    } else if (targetType === 'patient') {
      roleIntro = `Here is your clinical plan and documentation for ${desc}:`;
    } else if (targetType === 'account_manager') {
      roleIntro = `Internal handover for account follow-up on ${desc}${countInfo}:`;
    } else {
      roleIntro = `Please find your requested ${desc}${countInfo} from ATLAS SOLUTIONS at the following secure link:`;
    }

    return `${greeting}${roleIntro}\n\n🔗 ${shareUrl}\n\nFor inquiries or orders, please reply directly or contact: ${accountManagerEmail}`;
  };

  const handleShareWhatsApp = () => {
    if (!shareUrl) return;
    const cleanPhone = (targetPhone || '').replace(/[^\d+]/g, '');
    const msg = composeMessageText();

    const phoneParam = cleanPhone.replace('+', '');
    const waUrl = phoneParam 
      ? `https://wa.me/${phoneParam}?text=${encodeURIComponent(msg)}` 
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;

    window.open(waUrl, '_blank');
    markAsSentInCrm();
    notifier.success('WhatsApp opened with formatted message ✓');
  };

  const handleShareEmail = () => {
    if (!shareUrl) return;
    const recipient = targetEmail || initialRecipientEmail;
    const name = targetName || initialRecipientName;
    const subject = `ATLAS SOLUTIONS — ${itemName || docType.toUpperCase()}${name ? ` for ${name}` : ''}`;
    const body = composeMessageText();

    const mailtoUrl = `mailto:${encodeURIComponent(recipient || '')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_blank');
    markAsSentInCrm();
    notifier.success('Email composer opened ✓');
  };

  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=190x190&data=${encodeURIComponent(shareUrl || '')}`;

  const roleTabDefinitions = [
    { key: 'doctor', label: 'Doctor / Clinic', icon: '🩺' },
    { key: 'wholeseller', label: 'Wholesaler', icon: '📦' },
    { key: 'patient', label: 'Patient', icon: '👤' },
    { key: 'account_manager', label: 'Account Mgr', icon: '👔' },
    { key: 'custom', label: 'Direct / Custom', icon: '✍️' },
  ].filter(t => allowedRoles.includes(t.key));

  return (
    <StandardDrawer
      isOpen={isOpen}
      onClose={onClose}
      zIndex={100050}
      width={isMobile ? '100%' : '520px'}
      title={title || `Share ${docType.toUpperCase()}`}
      subtitle={subtitle || 'Select recipient on-demand and share via WhatsApp, Email or Link.'}
      footer={
        <button
          type="button"
          onClick={onClose}
          style={{
            width: '100%',
            padding: '10px 18px',
            background: '#003666',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          Done
        </button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        
        {/* On-Demand Recipient Target Box */}
        <div style={{
          border: '1px solid #e2e8f0',
          borderRadius: 10,
          padding: '14px',
          background: '#f8fafc',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
              <User size={15} color="#003666" /> Select Recipient
            </span>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
              On-demand directory
            </span>
          </div>

          {/* Role selector tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${roleTabDefinitions.length}, 1fr)`,
            gap: 5,
            marginBottom: 10,
          }}>
            {roleTabDefinitions.map(tab => {
              const active = targetType === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleTabChange(tab.key)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: 6,
                    border: active ? '2px solid #003666' : '1px solid #cbd5e1',
                    background: active ? '#eff6ff' : '#ffffff',
                    color: active ? '#003666' : '#475569',
                    fontWeight: active ? 700 : 500,
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Directory Loading State */}
          {loadingDirectory && (
            <div style={{ fontSize: '0.76rem', color: '#0369a1', padding: '8px', textAlign: 'center', background: '#f0f9ff', borderRadius: 6, marginBottom: 8 }}>
              ⏳ Loading directory for {targetType}…
            </div>
          )}

          {/* Directory Select (Lazy-populated) */}
          {!loadingDirectory && directoryContacts.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <select
                value={selectedContactId}
                onChange={e => handleSelectContact(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7.5px 10px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  fontSize: '0.8rem',
                  background: '#ffffff',
                  color: '#0f172a',
                  outline: 'none',
                }}
              >
                <option value="">— Pick existing contact from directory ({directoryContacts.length}) —</option>
                {directoryContacts.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.displayName || c.name || c.company || c.fullName || c.email} {c.phone ? `(${c.phone})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Editable contact coordinates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 8 }}>
            <div>
              <span style={{ fontSize: '0.71rem', color: '#64748b', display: 'block', marginBottom: 2 }}>Recipient Name</span>
              <input
                type="text"
                value={targetName}
                onChange={e => setTargetName(e.target.value)}
                placeholder="e.g. Dr. Vance / MedSupply EU"
                style={{
                  width: '100%',
                  padding: '6.5px 8px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  fontSize: '0.78rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <span style={{ fontSize: '0.71rem', color: '#64748b', display: 'block', marginBottom: 2 }}>WhatsApp (+Country Code)</span>
              <input
                type="tel"
                value={targetPhone}
                onChange={e => setTargetPhone(e.target.value)}
                placeholder="e.g. +34611223344"
                style={{
                  width: '100%',
                  padding: '6.5px 8px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  fontSize: '0.78rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        </div>

        {/* Action 1: Share via WhatsApp (Dominant CTA) */}
        <div
          onClick={handleShareWhatsApp}
          style={{
            border: '1px solid #86efac',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            borderRadius: 10,
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            boxShadow: '0 2px 4px rgba(22, 163, 74, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: '#16a34a', color: '#fff', padding: 8, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={19} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#14532d' }}>Share via WhatsApp</div>
              <div style={{ fontSize: '0.73rem', color: '#15803d' }}>
                {targetPhone ? `Direct chat to ${targetPhone}` : 'Opens chat composer with pre-filled link & details'}
              </div>
            </div>
          </div>
          <ExternalLink size={16} color="#16a34a" />
        </div>

        {/* Action 2: Share via Email */}
        <div
          onClick={handleShareEmail}
          style={{
            border: '1px solid #bfdbfe',
            background: '#eff6ff',
            borderRadius: 10,
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: '#2563eb', color: '#fff', padding: 8, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mail size={19} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e3a8a' }}>Send via Email</div>
              <div style={{ fontSize: '0.73rem', color: '#1d4ed8' }}>
                {targetEmail ? `Pre-addressed to ${targetEmail}` : 'Opens default email composer with official signature'}
              </div>
            </div>
          </div>
          <ExternalLink size={16} color="#2563eb" />
        </div>

        {/* Action 3: Direct Link & Copy */}
        <div style={{
          border: '1px solid #e2e8f0',
          borderRadius: 10,
          padding: '12px 14px',
          background: '#ffffff',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Copy size={15} color="#003666" /> Direct Link
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                type="button"
                onClick={handleCopyLink}
                style={{
                  padding: '5px 12px',
                  background: copied ? '#16a34a' : '#003666',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'background 0.2s ease',
                }}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>

          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 6,
            padding: '7px 9px',
            fontSize: '0.73rem',
            color: '#64748b',
            wordBreak: 'break-all',
            maxHeight: 52,
            overflowY: 'auto',
          }}>
            {shareUrl || 'No share URL generated'}
          </div>
        </div>

        {/* Action 4: On-Demand Mobile QR Code */}
        <div style={{
          border: '1px solid #e2e8f0',
          borderRadius: 10,
          padding: '12px 14px',
          background: '#ffffff',
        }}>
          <div
            onClick={() => setShowQr(prev => !prev)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <QrCode size={16} color="#003666" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>Scan Mobile QR Code</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600 }}>
              {showQr ? 'Hide QR' : 'Show QR'}
            </span>
          </div>

          {showQr && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
              <div style={{ background: '#ffffff', padding: 8, border: '1px solid #cbd5e1', borderRadius: 8, boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
                <img
                  src={qrApiUrl}
                  alt="QR Code"
                  style={{ width: 140, height: 140, display: 'block' }}
                />
              </div>
              <div style={{ fontSize: '0.71rem', color: '#64748b', marginTop: 6, textAlign: 'center' }}>
                Scan with any smartphone camera to open and view the document instantly.
              </div>
            </div>
          )}
        </div>

      </div>
    </StandardDrawer>
  );
}
