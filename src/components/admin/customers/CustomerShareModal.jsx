"use client";

import React, { useState, useEffect } from 'react';
import { Modal } from '../../ui';
import { Share2, Copy, Check, ExternalLink, Package, FileText, Sparkles, Building2 } from '@/lib/icons';
import notifier from '../../../services/NotificationService';
import { resolveCustomerTier } from './PricingTierSelectorCell';

export default function CustomerShareModal({
  isOpen,
  onClose,
  customer,
  customerType = 'wholesaler',
  onSuccess
}) {
  const [pageType, setPageType] = useState('catalog'); // 'catalog' | 'protocols' | 'peptide'
  const [selectedPeptide, setSelectedPeptide] = useState('bpc-157');
  const [supplier, setSupplier] = useState('lotusland'); // Default Lotusland as requested
  const [showPrices, setShowPrices] = useState(true);
  const [marginPercent, setMarginPercent] = useState(25);
  const [channel, setChannel] = useState('whatsapp');
  const [generating, setGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // Initialize margin from customer tier when modal opens
  useEffect(() => {
    if (customer) {
      const tier = resolveCustomerTier(customer, customerType);
      if (tier && typeof tier.margin === 'number') {
        setMarginPercent(tier.margin);
      }
      setGeneratedUrl('');
      setCopied(false);
    }
  }, [customer, customerType, isOpen]);

  if (!customer) return null;

  const customerName = customer.name || customer.companyName || customer.legalName || 'Customer';

  const handleGenerateShare = async () => {
    setGenerating(true);
    try {
      // 1. If sharing specific peptide or protocols, we can use the direct URL with affiliate tracking or catalog share token
      const res = await fetch('/api/catalog/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: supplier,
          catalogueFilter: supplier,
          category: 'all',
          priceMarkupPercent: showPrices ? Number(marginPercent) : 0,
          priceSource: customerType === 'wholesaler' ? 'wholeseller' : 'clinic',
          recipientUserId: customer.id,
          recipientName: customerName,
          recipientEmail: customer.contactEmail || customer.email || '',
          recipientPhone: customer.contactPhone || customer.phone || '',
          recipientType: customerType,
          channel: channel,
          notes: `Public page share: ${pageType} with ${supplier} supplier & ${showPrices ? marginPercent : 0}% margin.`
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate shared link.');
      }

      let finalUrl = data.shareUrl;
      if (pageType === 'protocols') {
        finalUrl = `${window.location.origin}/proto?shareToken=${data.catalogId || data.catalogCode || 'pt'}&ref=${customer.id}`;
      } else if (pageType === 'peptide') {
        finalUrl = `${window.location.origin}/p/${selectedPeptide}?shareToken=${data.catalogId || data.catalogCode || 'pt'}&ref=${customer.id}`;
      }

      setGeneratedUrl(finalUrl);

      // Copy automatically to clipboard
      await navigator.clipboard.writeText(finalUrl);
      setCopied(true);
      notifier.success('Public link generated & copied to clipboard!');
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Error sharing page:', err);
      notifier.error(err.message || 'Could not generate shareable page.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedUrl) return;
    await navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    notifier.success('Copied link to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate Customer Shared Page"
      size="md"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', width: '100%' }}>
          <button
            type="button"
            onClick={onClose}
            className="gcp-btn-secondary"
            style={{ padding: '7px 16px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600 }}
          >
            Close
          </button>
          {!generatedUrl ? (
            <button
              type="button"
              onClick={handleGenerateShare}
              disabled={generating}
              className="gcp-btn-primary"
              style={{
                padding: '7px 18px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Share2 size={14} /> {generating ? 'Generating Link...' : 'Generate & Copy Link'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCopy}
              className="gcp-btn-primary"
              style={{
                padding: '7px 18px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied ✓' : 'Copy Link'}
            </button>
          )}
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.85rem' }}>
        
        {/* Recipient Context Banner */}
        <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Building2 size={20} color="#2563eb" />
          <div>
            <div style={{ fontWeight: 700, color: '#1e40af' }}>{customerName}</div>
            <div style={{ fontSize: '0.74rem', color: '#3b82f6' }}>
              Target Category: <strong style={{ textTransform: 'capitalize' }}>{customerType}</strong> · Associated ID: <code>{customer.id}</code>
            </div>
          </div>
        </div>

        {/* 1. Page Type Selection */}
        <div>
          <label style={{ display: 'block', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
            1. Select Public Page to Share
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {[
              { id: 'catalog', label: 'B2B Catalog', sub: 'Interactive Products', icon: Package },
              { id: 'protocols', label: 'Protocols Directory', sub: 'Clinical Formulations', icon: FileText },
              { id: 'peptide', label: 'Peptide Monograph', sub: 'Specific Compound', icon: Sparkles }
            ].map(item => {
              const Icon = item.icon;
              const isSelected = pageType === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPageType(item.id)}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: `1.5px solid ${isSelected ? '#2563eb' : '#cbd5e1'}`,
                    backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    textAlign: 'center'
                  }}
                >
                  <Icon size={18} color={isSelected ? '#2563eb' : '#64748b'} />
                  <span style={{ fontWeight: 700, fontSize: '0.80rem', color: isSelected ? '#1e40af' : '#334155' }}>
                    {item.label}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                    {item.sub}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Specific Peptide Selector if peptide chosen */}
        {pageType === 'peptide' && (
          <div>
            <label style={{ display: 'block', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
              Select Peptide Monograph
            </label>
            <select
              value={selectedPeptide}
              onChange={e => setSelectedPeptide(e.target.value)}
              className="gcp-select"
              style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            >
              <option value="bpc-157">BPC-157 (Body Protection Compound)</option>
              <option value="tirzepatide">Tirzepatide (GIP / GLP-1 Dual Agonist)</option>
              <option value="semaglutide">Semaglutide (GLP-1 Receptor Agonist)</option>
              <option value="retatrutide">Retatrutide (Triple GIP/GLP-1/Glucagon)</option>
              <option value="ghk-cu">GHK-Cu (Copper Tripeptide Complex)</option>
              <option value="nad-plus">NAD+ (Nicotinamide Adenine Dinucleotide)</option>
              <option value="epithalon">Epithalon (Telomerase Activator)</option>
              <option value="cjc-1295-ipamorelin">CJC-1295 + Ipamorelin Blend</option>
            </select>
          </div>
        )}

        {/* 2. Supplier Scope (Lotusland by default) */}
        <div>
          <label style={{ display: 'block', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
            2. Supplier Price & Stock Baseline
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <select
              value={supplier}
              onChange={e => setSupplier(e.target.value)}
              className="gcp-select"
              style={{ flex: 1, padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 600 }}
            >
              <option value="lotusland">Lotusland Biotech (Default Primary Supplier)</option>
              <option value="magenta">Magenta Labs (Secondary EU Compounder)</option>
              <option value="all">All Verified Global Compounders</option>
            </select>
            <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700, backgroundColor: '#f0fdf4', padding: '5px 8px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
              Verified Partner
            </span>
          </div>
        </div>

        {/* 3. Pricing Margin Confirmation */}
        <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="checkbox"
                checked={showPrices}
                onChange={e => setShowPrices(e.target.checked)}
              />
              Show Pricing to Customer
            </label>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Customer Tier Default: <strong>{marginPercent}%</strong>
            </span>
          </div>

          {showPrices && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Confirmed Profit Margin (%):</span>
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={marginPercent}
                  onChange={e => setMarginPercent(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontWeight: 700,
                    marginTop: '2px'
                  }}
                />
              </div>
              <div style={{ flex: 1, fontSize: '0.75rem', color: '#475569', backgroundColor: '#ffffff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                Catalog prices will be calculated as: <code>Base Cost + {marginPercent}%</code>.
              </div>
            </div>
          )}
        </div>

        {/* 4. Generated Link Output */}
        {generatedUrl && (
          <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#f0fdf4', border: '1.5px solid #86efac', animation: 'fadeIn 0.2s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontWeight: 700, color: '#166534', fontSize: '0.78rem' }}>
                🎉 Personalized Link Active (Tracking Enabled):
              </span>
              <a href={generatedUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#15803d', display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                Test Open <ExternalLink size={12} />
              </a>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                readOnly
                value={generatedUrl}
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: '1px solid #bbf7d0',
                  fontSize: '0.76rem',
                  backgroundColor: '#ffffff',
                  color: '#1e293b'
                }}
              />
              <button
                type="button"
                onClick={handleCopy}
                className="gcp-btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.76rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#15803d', marginTop: '6px' }}>
              All visits, page impressions, and cart draft creations by {customerName} will be recorded in this customer's intelligence history.
            </div>
          </div>
        )}

      </div>
    </Modal>
  );
}
