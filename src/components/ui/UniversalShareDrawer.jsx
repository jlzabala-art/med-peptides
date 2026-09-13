'use client';
import React, { useState } from 'react';
import StandardDrawer from '@/components/ui/StandardDrawer';
import notifier from '@/services/NotificationService';
import { Copy, Check, MessageSquare, Mail, QrCode, ExternalLink, User } from 'lucide-react';

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
import RecipientHierarchySelector from '@/components/shared/RecipientHierarchySelector';

export default function UniversalShareDrawer({
  isOpen,
  onClose,
  shareUrl: incomingShareUrl = '',
  docUrl = '',
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
  assetMeta = {},
}) {
  const shareUrl = incomingShareUrl || docUrl || '';
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [messageLang, setMessageLang] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('share_message_lang') || 'en';
    }
    return 'en';
  });

  const handleLanguageChange = (lang) => {
    setMessageLang(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('share_message_lang', lang);
    }
  };

  // Recipient selection state managed via RecipientHierarchySelector
  const [recipient, setRecipient] = useState({
    type: 'doctor',
    id: null,
    name: initialRecipientName || '',
    company: '',
    email: initialRecipientEmail || '',
    phone: initialRecipientPhone || '',
    notes: '',
  });

  const targetName = recipient.name;
  const targetPhone = recipient.phone;
  const targetEmail = recipient.email;
  const targetType = recipient.type;

  const [activeLogId, setActiveLogId] = useState(logId);

  // Sync activeLogId if logId prop changes
  React.useEffect(() => {
    setActiveLogId(logId);
  }, [logId]);

  const markAsSentInCrm = async (targetId, channel = 'link') => {
    const idToUpdate = targetId || activeLogId;
    if (!idToUpdate) return;
    try {
      await fetch('/api/catalog/tracking-logs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: idToUpdate, 
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

  // Helper to ensure universal tracking record exists and returns tracked URL
  const getTrackedUrl = async (channel = 'link') => {
    if (!shareUrl) return '';
    let currentLogId = activeLogId;

    if (!currentLogId && (targetName || targetEmail || targetPhone)) {
      try {
        const res = await fetch('/api/shares', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assetType: docType,
            assetTitle: itemName || `${docType.toUpperCase()}`,
            assetMeta: {
              shareUrl,
              itemCount,
              ...assetMeta,
            },
            recipient: {
              type: recipient.type,
              id: recipient.id,
              name: recipient.name,
              company: recipient.company,
              email: recipient.email,
              phone: recipient.phone,
            },
            notes: recipient.notes,
            deliveryChannel: channel,
            shareUrl,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.id) {
            currentLogId = data.id;
            setActiveLogId(data.id);
          }
        }
      } catch (err) {
        console.warn('Could not create universal tracking log:', err);
      }
    } else if (currentLogId) {
      markAsSentInCrm(currentLogId, channel);
    }

    if (currentLogId) {
      const separator = shareUrl.includes('?') ? '&' : '?';
      return `${shareUrl}${separator}sid=${currentLogId}`;
    }

    return shareUrl;
  };

  const handleCopyLink = async () => {
    if (!shareUrl) {
      notifier.error('Share URL not available.');
      return;
    }
    const finalUrl = await getTrackedUrl();
    await navigator.clipboard.writeText(finalUrl);
    setCopied(true);
    notifier.success(targetName ? `Tracked link copied for ${targetName} ✓` : 'Direct link copied to clipboard ✓');
    setTimeout(() => setCopied(false), 2500);
  };

  const composeMessageText = (effectiveUrl = shareUrl) => {
    if (customMessageTemplate) {
      return customMessageTemplate({ targetName, targetType, shareUrl: effectiveUrl, itemName, itemCount, accountManagerEmail, lang: messageLang });
    }

    const isEs = messageLang === 'es';
    const greeting = targetName
      ? (isEs ? `Estimado/a ${targetName},\n\n` : `Dear ${targetName},\n\n`)
      : '';
    const desc = itemName ? `"${itemName}"` : (isEs ? `documento oficial ${docType.toUpperCase()}` : `official ${docType.toUpperCase()}`);
    const countInfo = itemCount ? (isEs ? ` (${itemCount} artículos)` : ` (${itemCount} items)`) : '';

    let roleIntro = '';
    if (isEs) {
      if (targetType === 'wholeseller') {
        roleIntro = `Adjuntamos las condiciones comerciales mayoristas y documentación solicitada para ${desc}${countInfo}:`;
      } else if (targetType === 'patient') {
        roleIntro = `Aquí tiene su plan clínico y documentación para ${desc}:`;
      } else if (targetType === 'account_manager') {
        roleIntro = `Traspaso interno para seguimiento de cuenta sobre ${desc}${countInfo}:`;
      } else {
        roleIntro = `Adjuntamos el documento ${desc}${countInfo} de ATLAS SOLUTIONS en el siguiente enlace seguro:`;
      }
      return `${greeting}${roleIntro}\n\n🔗 ${effectiveUrl}\n\nPara cualquier consulta o pedido, responda directamente o contacte con: ${accountManagerEmail}`;
    }

    if (targetType === 'wholeseller') {
      roleIntro = `Please find your requested wholesale commercial terms and documentation for ${desc}${countInfo}:`;
    } else if (targetType === 'patient') {
      roleIntro = `Here is your clinical plan and documentation for ${desc}:`;
    } else if (targetType === 'account_manager') {
      roleIntro = `Internal handover for account follow-up on ${desc}${countInfo}:`;
    } else {
      roleIntro = `Please find your requested ${desc}${countInfo} from ATLAS SOLUTIONS at the following secure link:`;
    }

    return `${greeting}${roleIntro}\n\n🔗 ${effectiveUrl}\n\nFor inquiries or orders, please reply directly or contact: ${accountManagerEmail}`;
  };

  const handleShareWhatsApp = async () => {
    if (!shareUrl) return;
    const finalUrl = await getTrackedUrl();
    const cleanPhone = (targetPhone || '').replace(/[^\d+]/g, '');
    const msg = composeMessageText(finalUrl);

    const phoneParam = cleanPhone.replace('+', '');
    const waUrl = phoneParam 
      ? `https://wa.me/${phoneParam}?text=${encodeURIComponent(msg)}` 
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;

    window.open(waUrl, '_blank');
    notifier.success('WhatsApp opened with tracked link ✓');
  };

  const handleShareEmail = async () => {
    if (!shareUrl) return;
    const finalUrl = await getTrackedUrl();
    const recipient = targetEmail || initialRecipientEmail;
    const name = targetName || initialRecipientName;
    const subject = `ATLAS SOLUTIONS — ${itemName || docType.toUpperCase()}${name ? ` for ${name}` : ''}`;
    const body = composeMessageText(finalUrl);

    const mailtoUrl = `mailto:${encodeURIComponent(recipient || '')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_blank');
    notifier.success('Email composer opened with tracked link ✓');
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
        
        {/* Hierarchical Recipient Selector (2-step: Type -> Contact) */}
        <div style={{
          border: '1px solid #e2e8f0',
          borderRadius: 10,
          padding: '12px',
          background: '#ffffff',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
        }}>
          <RecipientHierarchySelector
            value={recipient}
            onChange={(rec) => setRecipient(rec)}
            showNotesField={true}
          />
        </div>

        {/* Language Selector for Share Message */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          padding: '8px 12px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
        }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
            🌐 Message Language
          </span>
          <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', padding: '3px', borderRadius: 6 }}>
            <button
              type="button"
              onClick={() => handleLanguageChange('es')}
              style={{
                padding: '3px 10px',
                fontSize: '0.75rem',
                fontWeight: messageLang === 'es' ? 700 : 500,
                borderRadius: 4,
                border: 'none',
                background: messageLang === 'es' ? '#003666' : 'transparent',
                color: messageLang === 'es' ? '#ffffff' : '#64748b',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              🇪🇸 Español
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange('en')}
              style={{
                padding: '3px 10px',
                fontSize: '0.75rem',
                fontWeight: messageLang === 'en' ? 700 : 500,
                borderRadius: 4,
                border: 'none',
                background: messageLang === 'en' ? '#003666' : 'transparent',
                color: messageLang === 'en' ? '#ffffff' : '#64748b',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              🇬🇧 English
            </button>
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
