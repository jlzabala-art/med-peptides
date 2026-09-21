"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  FileText, 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  Mail, 
  Send, 
  RefreshCw, 
  Link2, 
  ShieldCheck,
  FileDown
} from '@/lib/icons';
import notifier from '@/services/NotificationService';
import './WorkspaceShareDatasheetModal.css';

export default function WorkspaceShareDatasheetModal({
  isOpen,
  onClose,
  activeWs,
  items = [],
}) {
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' | 'raw'
  const [loading, setLoading] = useState(false);
  const [generatedData, setGeneratedData] = useState(null);
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedLinks, setCopiedLinks] = useState(false);

  // Initialize recipient from active workspace target
  useEffect(() => {
    if (isOpen && activeWs) {
      const target = activeWs.targetEntity;
      const initialName = target?.name || target?.displayName || (activeWs.name ? `${activeWs.name} Contact` : 'Healthcare Practitioner');
      const initialEmail = target?.email || '';
      setRecipientName(initialName);
      setRecipientEmail(initialEmail);
    }
  }, [isOpen, activeWs]);

  // Generate Email using Gemini API
  const handleGenerate = useCallback(async (isRegeneration = false) => {
    if (!items || items.length === 0) {
      notifier.warning('Please add at least one compound to the workspace first.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/workspace/generate-datasheet-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          workspaceName: activeWs?.name || 'Clinical Dossier',
          recipientName: recipientName.trim() || 'Healthcare Practitioner',
          recipientEmail: recipientEmail.trim(),
          customNotes: customNotes.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP error ${res.status}`);
      }

      const data = await res.json();
      setGeneratedData(data);
      setCustomSubject(data.subject || '');
      if (isRegeneration) {
        notifier.success('Regenerated Pharma English documentation with Gemini AI!');
      }
    } catch (err) {
      console.error('[Share Datasheets Modal] Error:', err);
      notifier.error(`Generation error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [items, activeWs, recipientName, recipientEmail, customNotes]);

  // Trigger initial generation when modal opens and has items
  useEffect(() => {
    if (isOpen && items && items.length > 0 && !generatedData) {
      handleGenerate();
    }
  }, [isOpen, items, generatedData, handleGenerate]);

  // Reset when closed
  useEffect(() => {
    if (!isOpen) {
      setGeneratedData(null);
      setCopiedEmail(false);
      setCopiedLinks(false);
      setCustomNotes('');
    }
  }, [isOpen]);

  // Copy full plain-text/markdown email
  const handleCopyEmail = async () => {
    const textToCopy = generatedData?.fullEmailBody;
    if (!textToCopy) return;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedEmail(true);
      notifier.success('Complete Pharma English email copied to clipboard!');
      setTimeout(() => setCopiedEmail(false), 3000);
    } catch (err) {
      console.error('Failed to copy text:', err);
      notifier.error('Could not copy to clipboard.');
    }
  };

  // Copy clean list of product links
  const handleCopyLinks = async () => {
    if (!generatedData?.compounds || generatedData.compounds.length === 0) return;

    const linksText = generatedData.compounds.map(c => 
      `• ${c.compoundName} (${c.dosageFormat})\n  Monograph: ${c.monographUrl}\n  Analytical PDF: ${c.pdfUrl}`
    ).join('\n\n');

    try {
      await navigator.clipboard.writeText(linksText);
      setCopiedLinks(true);
      notifier.success('Product links copied to clipboard!');
      setTimeout(() => setCopiedLinks(false), 3000);
    } catch {
      notifier.error('Could not copy links.');
    }
  };

  // Generate Mailto URL
  const mailtoUrl = useMemo(() => {
    if (!generatedData?.fullEmailBody) return '';
    const subject = encodeURIComponent(customSubject || generatedData.subject || 'Clinical Product Documentation — Med-Peptides');
    const body = encodeURIComponent(generatedData.fullEmailBody);
    const targetTo = encodeURIComponent(recipientEmail || '');
    return `mailto:${targetTo}?cc=business@med-peptides.com&subject=${subject}&body=${body}`;
  }, [generatedData, customSubject, recipientEmail]);

  if (!isOpen) return null;

  return (
    <div className="ws-datasheet-modal-backdrop" onClick={onClose}>
      <div className="ws-datasheet-modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="ws-datasheet-header">
          <div className="ws-datasheet-header-left">
            <div className="ws-datasheet-header-icon">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="ws-datasheet-title">Share Clinical Datasheets</h3>
              <div className="ws-datasheet-subtitle">
                <span>From: <strong>business@med-peptides.com</strong></span>
                <span className="ws-datasheet-ai-chip">Gemini 2.5 Flash · Pharma English</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="ws-datasheet-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sender & Recipient Strip */}
        <div className="ws-datasheet-meta-strip">
          <div className="ws-datasheet-meta-field">
            <label className="ws-datasheet-meta-label">
              <Mail size={12} /> Recipient Name / Practice
            </label>
            <input
              type="text"
              className="ws-datasheet-meta-input"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="e.g. Dr. Alexander Vance / Longevity Clinic"
            />
          </div>
          <div className="ws-datasheet-meta-field">
            <label className="ws-datasheet-meta-label">
              <Send size={12} /> Recipient Email (Optional)
            </label>
            <input
              type="email"
              className="ws-datasheet-meta-input"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="e.g. clinic@medical-practice.com"
            />
          </div>
        </div>

        {/* Body Content */}
        <div className="ws-datasheet-body">
          {/* Navigation Tabs */}
          <div className="ws-datasheet-tabs">
            <button
              type="button"
              className={`ws-datasheet-tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
              onClick={() => setActiveTab('preview')}
            >
              <FileText size={14} /> Clinical Preview ({items.length} Compounds)
            </button>
            <button
              type="button"
              className={`ws-datasheet-tab-btn ${activeTab === 'raw' ? 'active' : ''}`}
              onClick={() => setActiveTab('raw')}
            >
              <Mail size={14} /> Full Ready-to-Send Email
            </button>
          </div>

          {loading ? (
            <div className="ws-datasheet-loading">
              <div className="ws-datasheet-spinner"></div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem' }}>
                Gemini AI is reading workspace compounds & drafting Pharma English documentation...
              </p>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                Synthesizing RP-HPLC purity benchmarks, LC-MS identities, and live URLs for {items.length} products.
              </span>
            </div>
          ) : generatedData ? (
            <>
              {/* Subject Field */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label className="ws-datasheet-meta-label">Subject Line:</label>
                <input
                  type="text"
                  className="ws-datasheet-meta-input"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  style={{ fontWeight: 700, color: '#003666' }}
                />
              </div>

              {activeTab === 'preview' ? (
                <>
                  {/* Executive Summary Box */}
                  <div className="ws-datasheet-summary-box">
                    <div className="ws-datasheet-summary-header">
                      <ShieldCheck size={14} /> Executive Pharmaceutical Summary
                    </div>
                    <div>{generatedData.executiveSummary}</div>
                  </div>

                  {/* Staged Compounds Cards */}
                  <div className="ws-datasheet-compounds-list">
                    <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Attached Compound Monograph Packages
                    </div>
                    {generatedData.compounds?.map((c, idx) => (
                      <div key={idx} className="ws-datasheet-compound-card">
                        <div className="ws-datasheet-compound-top">
                          <span className="ws-datasheet-compound-title">
                            <span style={{ color: '#0284c7' }}>#{idx + 1}</span> {c.compoundName}
                          </span>
                          <span className="ws-datasheet-compound-dosage">{c.dosageFormat}</span>
                        </div>
                        <p className="ws-datasheet-compound-desc">{c.pharmacologicalProfile}</p>
                        <div className="ws-datasheet-compound-specs">{c.analyticalSpecs}</div>
                        <div className="ws-datasheet-compound-actions">
                          <a
                            href={c.monographUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ws-datasheet-link-btn"
                          >
                            <ExternalLink size={12} /> View Live Monograph
                          </a>
                          <a
                            href={c.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ws-datasheet-link-btn pdf"
                          >
                            <FileDown size={12} /> Spec Sheet PDF
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                /* Raw Full Email Tab */
                <textarea
                  className="ws-datasheet-raw-box"
                  value={generatedData.fullEmailBody}
                  onChange={(e) => setGeneratedData({ ...generatedData, fullEmailBody: e.target.value })}
                  rows={14}
                />
              )}
            </>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
              No data generated yet. Click "Generate" below to start.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="ws-datasheet-footer">
          <div className="ws-datasheet-footer-left">
            <button
              type="button"
              onClick={() => handleGenerate(true)}
              className="ws-datasheet-btn ws-datasheet-btn-secondary"
              disabled={loading}
              title="Regenerate documentation with Gemini AI"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Regenerate
            </button>
            <button
              type="button"
              onClick={handleCopyLinks}
              className="ws-datasheet-btn ws-datasheet-btn-secondary"
              disabled={!generatedData}
              title="Copy a clean list of all monograph and PDF links"
            >
              {copiedLinks ? <Check size={14} color="#16a34a" /> : <Link2 size={14} />}
              <span>{copiedLinks ? 'Links Copied!' : 'Copy Links'}</span>
            </button>
          </div>

          <div className="ws-datasheet-footer-right">
            <button
              type="button"
              onClick={handleCopyEmail}
              className="ws-datasheet-btn ws-datasheet-btn-primary"
              disabled={!generatedData || loading}
              title="Copy the complete email text to clipboard"
            >
              {copiedEmail ? <Check size={14} color="#86efac" /> : <Copy size={14} />}
              <span>{copiedEmail ? 'Email Copied!' : 'Copy Full Email'}</span>
            </button>
            <a
              href={mailtoUrl}
              className="ws-datasheet-btn ws-datasheet-btn-accent"
              style={{ pointerEvents: !generatedData ? 'none' : 'auto', opacity: !generatedData ? 0.6 : 1 }}
              title="Open default email application prefilled with business@med-peptides.com"
            >
              <Send size={14} /> Open in Email App
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
