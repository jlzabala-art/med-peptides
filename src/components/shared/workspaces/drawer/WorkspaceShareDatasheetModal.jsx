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
  const [audience, setAudience] = useState('doctor'); // 'doctor' | 'wholesaler' | 'patient'

  // Initialize recipient & audience from active workspace target
  useEffect(() => {
    if (isOpen && activeWs) {
      const target = activeWs.targetEntity;
      const initialName = target?.name || target?.displayName || (activeWs.name ? `${activeWs.name} Contact` : 'Healthcare Practitioner');
      const initialEmail = target?.email || '';
      setRecipientName(initialName);
      setRecipientEmail(initialEmail);

      if (activeWs.type === 'wholesaler' || target?.role === 'wholesaler' || target?.accountType === 'wholesaler') {
        setAudience('wholesaler');
      } else if (activeWs.type === 'patient' || target?.role === 'patient') {
        setAudience('patient');
      } else {
        setAudience('doctor');
      }
    }
  }, [isOpen, activeWs]);

  // Generate Email using Gemini API
  const handleGenerate = useCallback(async (isRegeneration = false, targetAudience = audience) => {
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
          audience: targetAudience || 'doctor',
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
        notifier.success(`Regenerated documentation for ${targetAudience} profile!`);
      }
    } catch (err) {
      console.error('[Share Datasheets Modal] Error:', err);
      notifier.error(`Generation error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [items, activeWs, recipientName, recipientEmail, customNotes, audience]);

  // Handle audience change and re-draft
  const handleAudienceChange = (newAudience) => {
    if (newAudience === audience && generatedData) return;
    setAudience(newAudience);
    handleGenerate(true, newAudience);
  };

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

  // Build Rich Formatted HTML Email preserving styling, colors, cards, and links
  const generateRichEmailHtml = useCallback(() => {
    if (!generatedData) return '';
    const cleanRecipient = recipientName?.trim() || 'Healthcare Practitioner';
    const compounds = generatedData.compounds || [];
    const workspaceName = activeWs?.name || 'Clinical Dossier';

    const compoundCardsHtml = compounds.map((c, idx) => {
      const rawName = c.compoundName || '';
      const cleanName = rawName.replace(/\s*\([^)]*\)/g, '').trim() || rawName;
      return `
        <div style="margin-bottom: 16px; padding: 16px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px;">
            <tr>
              <td align="left" style="font-size: 15px; font-weight: 700; color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                <span style="color: #0284c7; font-weight: 800; margin-right: 6px;">#${idx + 1}</span>
                ${cleanName}
              </td>
              <td align="right" style="font-size: 12px; font-weight: 700; color: #0284c7; background-color: #eff6ff; padding: 4px 10px; border-radius: 6px; border: 1px solid #bfdbfe; white-space: nowrap; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                ${c.dosageFormat || 'Standard Vial'}
              </td>
            </tr>
          </table>
          
          <p style="margin: 0 0 10px 0; font-size: 13px; line-height: 1.5; color: #334155; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            ${c.pharmacologicalProfile || ''}
          </p>
          
          <div style="margin-bottom: 12px; padding: 6px 10px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 11px; font-weight: 600; color: #059669; letter-spacing: 0.02em; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            🛡️ ${c.analyticalSpecs || 'RP-HPLC Purity ≥ 99.0% · ESI-MS Concordant'}
          </div>
          
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding-right: 10px;">
                <a href="${c.monographUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 6px 14px; background-color: #003666; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 700; border-radius: 6px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                  View Live Monograph &rarr;
                </a>
              </td>
              <td>
                <a href="${c.pdfUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 6px 14px; background-color: #fef2f2; color: #b91c1c; text-decoration: none; font-size: 12px; font-weight: 700; border-radius: 6px; border: 1px solid #fecaca; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                  Analytical PDF (Spec Sheet)
                </a>
              </td>
            </tr>
          </table>
        </div>
      `;
    }).join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${customSubject || generatedData.subject || 'Clinical Product Documentation'}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <div style="max-width: 640px; margin: 16px auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
    
    <!-- Institutional Header -->
    <div style="background-color: #003666; padding: 22px 26px; color: #ffffff;">
      <div style="font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: #93c5fd; margin-bottom: 4px;">
        ATLAS HEALTH · PHARMACEUTICAL NETWORK
      </div>
      <h1 style="margin: 0 0 6px 0; font-size: 19px; font-weight: 800; letter-spacing: -0.01em; color: #ffffff;">
        Clinical Product Documentation & Analytical Specifications
      </h1>
      <div style="font-size: 12px; color: #bfdbfe;">
        Ref: <strong>${workspaceName}</strong> · Dispatched by Medical Affairs Desk (business@med-peptides.com)
      </div>
    </div>

    <!-- Main Container -->
    <div style="padding: 22px 26px;">
      <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.6; color: #1e293b;">
        Dear <strong>${cleanRecipient}</strong>,
      </p>
      
      <p style="margin: 0 0 16px 0; font-size: 13.5px; line-height: 1.6; color: #334155;">
        Following your inquiry, please find below the certified clinical monographs and analytical specifications for the pharmaceutical compounds staged in your dossier (${workspaceName}).
      </p>

      <!-- Executive Summary Box -->
      <div style="margin-bottom: 20px; padding: 14px 16px; background-color: #f0fdf4; border-left: 4px solid #16a34a; border-radius: 6px;">
        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #15803d; margin-bottom: 5px;">
          ✓ Executive Pharmaceutical Summary
        </div>
        <div style="font-size: 13px; line-height: 1.55; color: #14532d; font-weight: 500;">
          ${generatedData.executiveSummary || 'All formulations are synthesized under strict aseptic conditions with dual-stage RP-HPLC purity verification (≥ 99.0%) and ESI-MS molecular identity confirmation.'}
        </div>
      </div>

      <!-- Attached Monograph Section -->
      <div style="margin-bottom: 12px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #475569;">
        Attached Compound Monograph Packages (${compounds.length})
      </div>
      
      ${compoundCardsHtml}

      <!-- Regulatory & Logistics Assurances -->
      <div style="margin-top: 22px; padding: 15px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #003666; margin-bottom: 6px;">
          Regulatory & Cold-Chain Logistics Assurances
        </div>
        <ul style="margin: 0; padding-left: 18px; font-size: 12px; line-height: 1.6; color: #475569;">
          <li><strong>Analytical Integrity:</strong> Validated CoA and monoisotopic mass spectrometry data included with each batch release.</li>
          <li><strong>Cold-Chain Logistics:</strong> Temperature-monitored distribution (-20°C / 2°C–8°C validated transport).</li>
          <li><strong>Institutional Compliance:</strong> Complete traceability from GMP-grade synthesis to accredited laboratory release.</li>
        </ul>
      </div>

      <!-- Signoff -->
      <div style="margin-top: 22px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; line-height: 1.5; color: #475569;">
        <div style="font-weight: 700; color: #0f172a;">Medical Affairs & Institutional Supply Division</div>
        <div>Atlas Health · Med-Peptides Laboratory & Research Network</div>
        <div><a href="mailto:business@med-peptides.com" style="color: #0284c7; text-decoration: none;">business@med-peptides.com</a> | <a href="https://med-peptides.com" style="color: #0284c7; text-decoration: none;">https://med-peptides.com</a></div>
      </div>

    </div>

    <!-- Footer Notice -->
    <div style="background-color: #f1f5f9; padding: 12px 26px; font-size: 11px; line-height: 1.4; color: #64748b; border-top: 1px solid #e2e8f0;">
      This clinical documentation transmission is confidential and intended solely for authorized medical practitioners, accredited researchers, and institutional partners.
    </div>

  </div>
</body>
</html>
    `.trim();
  }, [generatedData, recipientName, activeWs?.name, customSubject]);

  // Robust multi-MIME copy to clipboard (HTML + Plain text fallback)
  const copyFormattedHtmlToClipboard = useCallback(async (htmlContent, plainTextContent) => {
    try {
      if (typeof window !== 'undefined' && navigator.clipboard && window.ClipboardItem) {
        const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
        const textBlob = new Blob([plainTextContent || ''], { type: 'text/plain' });
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': htmlBlob,
            'text/plain': textBlob,
          }),
        ]);
        return true;
      }
    } catch (err) {
      console.warn('[Clipboard] ClipboardItem write failed, trying fallback:', err);
    }

    // Fallback: document.execCommand('copy') with temporary HTML container
    try {
      const container = document.createElement('div');
      container.setAttribute('contenteditable', 'true');
      container.innerHTML = htmlContent;
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.opacity = '0';
      document.body.appendChild(container);

      const range = document.createRange();
      range.selectNodeContents(container);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);

      const success = document.execCommand('copy');
      selection.removeAllRanges();
      document.body.removeChild(container);
      if (success) return true;
    } catch (err) {
      console.warn('[Clipboard] execCommand fallback failed:', err);
    }

    // Fallback plain text
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(plainTextContent || '');
        return true;
      }
    } catch {
      // Ignore
    }
    return false;
  }, []);

  // Copy full rich HTML formatted email
  const handleCopyEmail = async () => {
    if (!generatedData) return;
    const richHtml = generateRichEmailHtml();
    const plainText = generatedData.fullEmailBody || '';

    const copied = await copyFormattedHtmlToClipboard(richHtml, plainText);
    if (copied) {
      setCopiedEmail(true);
      notifier.success('Formatted HTML email copied to clipboard! Ready to paste into Gmail, Outlook, or Apple Mail.');
      setTimeout(() => setCopiedEmail(false), 3000);
    } else {
      notifier.error('Could not copy to clipboard.');
    }
  };

  // Open in email app: Copy rich HTML to clipboard first, then trigger mailto
  const handleOpenEmailApp = async () => {
    if (!generatedData) return;
    const richHtml = generateRichEmailHtml();
    const plainText = generatedData.fullEmailBody || '';

    await copyFormattedHtmlToClipboard(richHtml, plainText);
    notifier.success('Formatted HTML email copied to clipboard! Paste (⌘V / Ctrl+V) in your email app.');

    // Launch email client
    if (mailtoUrl) {
      const tempLink = document.createElement('a');
      tempLink.href = mailtoUrl;
      tempLink.click();
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

        {/* Audience Persona Bar */}
        <div className="ws-datasheet-audience-bar">
          <span className="ws-datasheet-audience-label">
            <Sparkles size={13} color="#2563eb" /> Audience Persona:
          </span>
          <div className="ws-datasheet-audience-chips">
            <button
              type="button"
              className={`ws-datasheet-audience-chip ${audience === 'doctor' ? 'active' : ''}`}
              onClick={() => handleAudienceChange('doctor')}
              title="Tailor Pharma English tone for Doctors and Prescribers"
            >
              🩺 Doctor / Prescriber
            </button>
            <button
              type="button"
              className={`ws-datasheet-audience-chip ${audience === 'wholesaler' ? 'active' : ''}`}
              onClick={() => handleAudienceChange('wholesaler')}
              title="Tailor tone for B2B Wholesalers and Distributors"
            >
              🏢 Wholesaler / B2B
            </button>
            <button
              type="button"
              className={`ws-datasheet-audience-chip ${audience === 'patient' ? 'active' : ''}`}
              onClick={() => handleAudienceChange('patient')}
              title="Tailor tone for Private Patients and Clients"
            >
              🛡️ Patient / Private
            </button>
          </div>
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
          {/* Navigation Tabs & Format Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '1rem' }}>
            <div className="ws-datasheet-tabs" style={{ margin: 0 }}>
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
            <div style={{ fontSize: '0.72rem', color: '#0f766e', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#f0fdfa', padding: '4px 10px', borderRadius: '6px', border: '1px solid #99f6e4' }}>
              <Check size={12} color="#0d9488" /> Rich HTML Email (Preserves Colors & Links on Paste)
            </div>
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
            <button
              type="button"
              onClick={handleOpenEmailApp}
              className="ws-datasheet-btn ws-datasheet-btn-accent"
              disabled={!generatedData || loading}
              title="Copy formatted rich HTML email to clipboard and launch your email client"
            >
              <Send size={14} /> Open in Email App
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
