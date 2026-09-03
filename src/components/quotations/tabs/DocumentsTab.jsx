'use client';

import React, { useState } from 'react';
import { FileText, Download, Share2, ExternalLink, RefreshCw, Sparkles, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';
import DocumentShareModal from '../../admin/catalog/document-generator/DocumentShareModal';
import notifier from '../../../services/NotificationService';

export default function DocumentsTab({ quotation, quotationId }) {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(quotation?.url || null);

  if (!quotation) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
        No documents available.
      </div>
    );
  }

  const items = Array.isArray(quotation.items) ? quotation.items : [];
  const clientName = quotation.clientName || quotation.patientName || quotation.wholesalerName || quotation.clinicName || 'Client';
  const clientEmail = quotation.recipientEmail || quotation.patientEmail || '';
  const refNumber = quotation.quotationNumber || quotation.id || `QUO-${Date.now()}`;

  const handleGeneratePdf = async () => {
    setGenerating(true);
    notifier.info('Generating official quotation PDF document...');

    const payload = {
      productIds: items.map(it => it.productId || it.id).filter(Boolean),
      docType: 'quotation',
      priceTier: quotation.tier || 'cost',
      currency: quotation.currency || 'USD',
      recipientType: quotation.category || quotation.recipientType || 'patient',
      recipientName: clientName,
      recipientEmail: clientEmail,
      clientId: quotation.patientId || quotation.clinicId || quotation.wholesalerId || null,
      validUntil: quotation.validUntil || null,
      commercialNotes: quotation.commercialNotes || null,
      paymentTerms: quotation.paymentTerms || 'due_on_receipt',
    };

    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate PDF (HTTP ${response.status})`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            if (data.type === 'complete' && data.url) {
              setPdfUrl(data.url);
              notifier.success('Official PDF generated and ready to share! ✓');
            }
          } catch {
            // Ignore partial stream line chunks
          }
        }
      }
    } catch (err) {
      notifier.error(err.message || 'Failed to generate PDF');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Official Document Card */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary, #003666)' }}>
              <FileText size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
                Official Quotation Document
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Reference: {refNumber} · Format: PDF (Vector HD)
              </div>
            </div>
          </div>

          <span style={{
            padding: '3px 8px',
            borderRadius: 6,
            fontSize: '0.72rem',
            fontWeight: 700,
            background: pdfUrl ? '#f0fdf4' : '#fffbeb',
            color: pdfUrl ? '#15803d' : '#b45309'
          }}>
            {pdfUrl ? 'Ready to Share' : 'Draft / Not Generated'}
          </span>
        </div>

        {/* Action Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
          {pdfUrl ? (
            <>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  background: 'var(--color-primary, #003666)',
                  color: '#fff',
                  borderRadius: 8,
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
              >
                <Download size={14} />
                Download PDF
              </a>

              <button
                type="button"
                onClick={() => setShareModalOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  background: '#f0fdf4',
                  color: '#15803d',
                  border: '1px solid #bbf7d0',
                  borderRadius: 8,
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Share2 size={14} />
                Share via WhatsApp / Email / QR
              </button>

              <button
                type="button"
                disabled={generating}
                onClick={handleGeneratePdf}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 12px',
                  background: '#f8fafc',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={13} className={generating ? 'animate-spin' : ''} />
                Regenerate
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={generating}
              onClick={handleGeneratePdf}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 16px',
                background: 'var(--color-primary, #003666)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Sparkles size={14} />
              {generating ? 'Generating Document...' : 'Generate Official PDF Quote'}
            </button>
          )}
        </div>
      </div>

      {/* 2. Embedded Document Live Preview or Frame */}
      {pdfUrl && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Live Document Viewer</span>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--color-primary, #003666)', fontSize: '0.74rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              Open in Full Screen <ExternalLink size={11} />
            </a>
          </div>
          <iframe
            src={`${pdfUrl}#toolbar=0`}
            title="Quotation PDF Preview"
            style={{ width: '100%', height: '420px', border: 'none' }}
          />
        </div>
      )}

      {/* 3. Document Share Modal */}
      {shareModalOpen && (
        <DocumentShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          pdfUrl={pdfUrl}
          docType="quotation"
          variantCount={items.length}
          recipientName={clientName}
          recipientEmail={clientEmail}
          accountManagerName={quotation.accountManagerId || 'Atlas Commercial Desk'}
        />
      )}
    </div>
  );
}
