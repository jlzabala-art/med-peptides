"use client";

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Share2, 
  Building2, 
  User, 
  ShieldCheck, 
  CheckCircle2 
} from '@/lib/icons';
import { getRecentEntitiesFast } from '@/repositories/workspaceSearchRepository';
import notifier from '@/services/NotificationService';
import toast from 'react-hot-toast';

const CURATED_COMPOUNDS = [
  { slug: 'retatrutide', name: 'Retatrutide (Triple Agonist)', doses: ['5mg', '10mg', '15mg'], formats: ['Vial', 'Lyophilized 10-Pack'] },
  { slug: 'bpc-157', name: 'BPC-157 (Body Protection Compound)', doses: ['5mg', '10mg'], formats: ['Vial', 'Lyophilized 10-Pack'] },
  { slug: 'tb-500', name: 'TB-500 (Thymosin β4)', doses: ['2mg', '5mg', '10mg'], formats: ['Vial', 'Lyophilized 10-Pack'] },
  { slug: 'tirzepatide', name: 'Tirzepatide (GIP/GLP-1)', doses: ['5mg', '10mg', '15mg', '30mg'], formats: ['Vial', 'Lyophilized 10-Pack'] },
  { slug: 'semaglutide', name: 'Semaglutide (GLP-1)', doses: ['2mg', '5mg'], formats: ['Vial', 'Lyophilized 10-Pack'] },
  { slug: 'cagrilintide', name: 'Cagrilintide (Amylin Analog)', doses: ['5mg', '10mg'], formats: ['Vial', 'Lyophilized 10-Pack'] },
  { slug: 'semax', name: 'Semax (Heptapeptide ACTH 4-10)', doses: ['30mg', '60mg'], formats: ['Nasal Spray', 'Vial'] },
  { slug: 'epitalon', name: 'Epitalon (Epithalamin Synthetic)', doses: ['10mg', '50mg'], formats: ['Vial', 'Lyophilized 10-Pack'] },
  { slug: 'mots-c', name: 'MOTS-c (Mitochondrial Peptide)', doses: ['10mg'], formats: ['Vial', 'Lyophilized 10-Pack'] },
  { slug: 'kpv', name: 'KPV (α-MSH 11-13)', doses: ['5mg'], formats: ['Vial', 'Capsules'] },
];

export default function QuickShareDatasheetModal({
  isOpen,
  onClose,
  item = null,
  activeWs = null,
  initialRecipient = null,
}) {
  const [recipientType, setRecipientType] = useState('wholesaler');
  const [wholesalers, setWholesalers] = useState([]);
  const [loadingWholesalers, setLoadingWholesalers] = useState(false);
  const [selectedRecipientId, setSelectedRecipientId] = useState('');
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState(null);
  const [copied, setCopied] = useState(false);

  // Standalone compound selection when item is not preselected
  const [selectedCompoundIdx, setSelectedCompoundIdx] = useState(0);
  const [selectedDose, setSelectedDose] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');

  // Initialize recipient from active workspace target or initialRecipient if available
  useEffect(() => {
    if (isOpen) {
      setGeneratedLink(null);
      setCopied(false);

      if (initialRecipient) {
        setSelectedRecipientId(initialRecipient.id || 'custom');
        setCustomName(initialRecipient.name || initialRecipient.companyName || initialRecipient.fullName || '');
        setCustomEmail(initialRecipient.email || initialRecipient.contactEmail || '');
        setCustomPhone(initialRecipient.phone || initialRecipient.whatsapp || initialRecipient.contactPhone || '');
        setRecipientType(initialRecipient.type || initialRecipient.role || 'wholesaler');
      } else {
        const target = activeWs?.targetEntity;
        if (target) {
          setSelectedRecipientId(target.id || 'custom');
          setCustomName(target.name || target.displayName || target.companyName || '');
          setCustomEmail(target.email || '');
          setCustomPhone(target.phone || '');
          if (target.role === 'wholesaler' || target.type === 'wholeseller' || activeWs?.type === 'wholesaler') {
            setRecipientType('wholesaler');
          } else {
            setRecipientType('doctor');
          }
        } else {
          setSelectedRecipientId('');
          setCustomName('');
          setCustomEmail('');
          setCustomPhone('');
        }
      }

      // Load wholesaler directory for quick select if no recipient locked
      if (!initialRecipient) {
        setLoadingWholesalers(true);
        getRecentEntitiesFast('wholeseller')
          .then((res) => setWholesalers(res || []))
          .catch(() => setWholesalers([]))
          .finally(() => setLoadingWholesalers(false));
      }
    }
  }, [isOpen, activeWs, initialRecipient]);

  if (!isOpen) return null;

  const currentCompound = CURATED_COMPOUNDS[selectedCompoundIdx] || CURATED_COMPOUNDS[0];
  const itemName = item?.canonicalName || item?.name || item?.displayName || currentCompound.name;
  const itemDose = item?.dosage || item?.dose || selectedDose || currentCompound.doses[0];
  const itemFormat = item?.format || item?.presentation || selectedFormat || currentCompound.formats[0];
  const itemSlug = item?.slug || currentCompound.slug;

  const handleSelectWholesaler = (e) => {
    const id = e.target.value;
    setSelectedRecipientId(id);
    if (!id || id === 'custom') {
      return;
    }
    const found = wholesalers.find((w) => w.id === id);
    if (found) {
      setCustomName(found.name || found.companyName || found.fullName || '');
      setCustomEmail(found.email || '');
      setCustomPhone(found.phone || '');
    }
  };

  const handleGenerateLink = async () => {
    setIsGenerating(true);
    try {
      const recipientName = customName.trim() || (recipientType === 'wholesaler' ? 'Wholesale Partner' : 'Medical Practitioner');

      const res = await fetch('/api/short-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: itemSlug,
          dose: itemDose,
          format: itemFormat,
          supplier: item.supplier || item.supplierId || null,
          productName: itemName,
          recipient: {
            id: selectedRecipientId !== 'custom' ? selectedRecipientId : null,
            name: recipientName,
            email: customEmail.trim(),
            phone: customPhone.trim(),
            type: recipientType,
          },
          variant: {
            productId: item.productId || item.id,
            productName: itemName,
            dose: itemDose,
            format: itemFormat,
          },
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate tracking short URL');
      }

      const data = await res.json();
      setGeneratedLink(data);

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(data.shortUrl);
        setCopied(true);
        toast.success(`Tracked datasheet URL generated and copied for ${recipientName}!`);
      }
    } catch (err) {
      console.error('[QuickShareDatasheetModal] Error:', err);
      notifier.error(`Error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (generatedLink?.shortUrl && navigator.clipboard) {
      await navigator.clipboard.writeText(generatedLink.shortUrl);
      setCopied(true);
      toast.success('Unique link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const cleanRecipientName = customName.trim() || 'Wholesale Partner';
  const waText = `*Official Technical Datasheet — ATLAS HEALTH*\n📋 *Compound:* ${itemName} (${itemDose} ${itemFormat})\nRecipient: ${cleanRecipientName}\n\nAccess verified analytical specifications and monograph:\n${generatedLink?.shortUrl || ''}`;
  const waUrl = `https://wa.me/${customPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(waText)}`;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: '#003666',
            padding: '16px 20px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <Share2 size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>
                Share Unique Datasheet
              </div>
              <div style={{ fontSize: '0.72rem', color: '#bfdbfe' }}>
                {itemName} • {itemDose} ({itemFormat})
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.8,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Item Highlight Pill or Compound Picker */}
          {item ? (
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
                  {itemName}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Dosage: <strong style={{ color: '#0369a1' }}>{itemDose}</strong> | Format: <strong>{itemFormat}</strong>
                </div>
              </div>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: '#15803d',
                  backgroundColor: '#dcfce7',
                  padding: '2px 8px',
                  borderRadius: '99px',
                  border: '1px solid #bbf7d0',
                }}
              >
                Dual HPLC ≥99.2%
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                Select Peptide / Compound:
              </label>
              <select
                value={selectedCompoundIdx}
                onChange={(e) => {
                  const idx = Number(e.target.value);
                  setSelectedCompoundIdx(idx);
                  setSelectedDose(CURATED_COMPOUNDS[idx]?.doses[0] || '');
                  setSelectedFormat(CURATED_COMPOUNDS[idx]?.formats[0] || '');
                }}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  fontSize: '0.82rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontWeight: 700,
                  color: '#0f172a'
                }}
              >
                {CURATED_COMPOUNDS.map((c, i) => (
                  <option key={c.slug} value={i}>
                    🔬 {c.name}
                  </option>
                ))}
              </select>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                <span style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 600 }}>Dosis:</span>
                {currentCompound.doses.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedDose(d)}
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      border: (selectedDose || currentCompound.doses[0]) === d ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                      backgroundColor: (selectedDose || currentCompound.doses[0]) === d ? '#eff6ff' : '#ffffff',
                      color: (selectedDose || currentCompound.doses[0]) === d ? '#0284c7' : '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!generatedLink ? (
            <>
              {/* Recipient Selector */}
              {initialRecipient ? (
                <div style={{ padding: '8px 12px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '0.78rem', color: '#166534' }}>
                    Assigned Recipient: <strong>{customName}</strong>
                    {customEmail && <span style={{ opacity: 0.8 }}> ({customEmail})</span>}
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#15803d', backgroundColor: '#dcfce7', padding: '1px 6px', borderRadius: '4px' }}>
                    Confirmed ✓
                  </span>
                </div>
              ) : (
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#334155',
                      marginBottom: '6px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em',
                    }}
                  >
                    Wholesale Partner / Recipient
                  </label>

                  {wholesalers.length > 0 && (
                    <select
                      value={selectedRecipientId}
                      onChange={handleSelectWholesaler}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        fontSize: '0.82rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                        marginBottom: '8px',
                        color: '#0f172a',
                        fontWeight: 600,
                      }}
                    >
                      <option value="">-- Seleccionar de Mayoristas Registrados --</option>
                      {wholesalers.map((w) => (
                        <option key={w.id} value={w.id}>
                          🏢 {w.name || w.companyName || w.fullName} {w.city ? `(${w.city})` : ''}
                        </option>
                      ))}
                      <option value="custom">✏️ Other / New Recipient...</option>
                    </select>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Client or Company Name"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      style={{
                        padding: '8px 12px',
                        fontSize: '0.8rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                      }}
                    />
                    <input
                      type="email"
                      placeholder="Email (optional)"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      style={{
                        padding: '8px 12px',
                        fontSize: '0.8rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Informative Note */}
              <div
                style={{
                  fontSize: '0.72rem',
                  lineHeight: 1.45,
                  color: '#475569',
                  backgroundColor: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                }}
              >
                <ShieldCheck size={16} style={{ color: '#0284c7', flexShrink: 0, marginTop: '1px' }} />
                <span>
                  <strong>Unique & Tracked Link:</strong> Every time you share, a dedicated non-repeatable link is created. You can track exactly when and how many times the recipient viewed this monograph.
                </span>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleGenerateLink}
                disabled={isGenerating}
                style={{
                  width: '100%',
                  padding: '11px',
                  backgroundColor: '#0b57d0',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: isGenerating ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 4px rgba(11, 87, 208, 0.25)',
                  marginTop: '4px',
                }}
              >
                {isGenerating ? (
                  <span>Generating secure link...</span>
                ) : (
                  <>
                    <Share2 size={16} />
                    <span>Generate & Copy Unique Link</span>
                  </>
                )}
              </button>
            </>
          ) : (
            /* Result View: Link Generated */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  padding: '14px',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '10px',
                  textAlign: 'center',
                }}
              >
                <CheckCircle2 size={28} style={{ color: '#16a34a', margin: '0 auto 6px' }} />
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#14532d' }}>
                  Unique Tracked Link Generated!
                </div>
                <div style={{ fontSize: '0.72rem', color: '#15803d', marginTop: '2px' }}>
                  Dedicated to <strong>{cleanRecipientName}</strong>
                </div>
              </div>

              {/* Short URL Box */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 10px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                  }}
                >
                  <input
                    type="text"
                    readOnly
                    value={generatedLink.shortUrl}
                    style={{
                      flex: 1,
                      border: 'none',
                      backgroundColor: 'transparent',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '5px 10px',
                      backgroundColor: copied ? '#137333' : '#0b57d0',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copied ? 'Copied ✓' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>

              {/* Actions Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <a
                  href={generatedLink.targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#334155',
                    textDecoration: 'none',
                  }}
                >
                  <ExternalLink size={14} />
                  <span>View Datasheet</span>
                </a>

                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    backgroundColor: '#25d366',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    textDecoration: 'none',
                  }}
                >
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
