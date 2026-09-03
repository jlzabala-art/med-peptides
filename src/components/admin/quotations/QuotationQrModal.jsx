"use client";

import React, { useState } from 'react';
import { X, QrCode, Copy, Check, ExternalLink, Share2, Printer, ShieldCheck } from 'lucide-react';
import notifier from '../../../services/NotificationService';

export default function QuotationQrModal({ isOpen, onClose, quotation }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !quotation) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://regenpept.com';
  const token = quotation.publicToken || quotation.id;
  const quoteUrl = `${origin}/quotation/${token}`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(quoteUrl)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(quoteUrl);
      setCopied(true);
      notifier.success('Client proposal link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      notifier.error('Failed to copy link');
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Pass - ${quotation.quotationNumber}</title>
          <style>
            body { font-family: system-ui, sans-serif; text-align: center; padding: 40px; color: #0f172a; }
            .card { border: 2px solid #003666; border-radius: 16px; padding: 30px; max-width: 400px; margin: 0 auto; }
            h2 { color: #003666; margin: 0 0 8px; }
            p { color: #64748b; font-size: 14px; margin: 4px 0 20px; }
            img { width: 220px; height: 220px; border-radius: 8px; }
            .badge { display: inline-block; background: #eff6ff; color: #0284c7; padding: 4px 12px; border-radius: 20px; font-weight: 700; font-size: 12px; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>${quotation.quotationNumber}</h2>
            <p>Prepared for: <strong>${quotation.clientName}</strong><br>Grand Total: <strong>$${(quotation.grandTotal || 0).toFixed(2)}</strong></p>
            <img src="${qrApiUrl}" alt="QR Code" />
            <div><span class="badge">Scan to review & approve prescription</span></div>
          </div>
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        maxWidth: '440px',
        width: '100%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        animation: 'scaleIn 0.2s ease-out'
      }}>
        <style>{`
          @keyframes scaleIn {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}</style>

        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(to right, #ffffff, #f8fafc)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <QrCode size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: '#003666' }}>
                Instant QR Pass
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                {quotation.quotationNumber}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', padding: '4px', borderRadius: '6px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
              {quotation.clientName}
            </div>
            <div style={{ fontSize: '0.80rem', color: '#64748b', marginTop: '2px' }}>
              Total: <strong style={{ color: '#0d9488' }}>${(quotation.grandTotal || 0).toFixed(2)}</strong> • ❄️ 2-8°C Insulated Express
            </div>
          </div>

          {/* QR Container */}
          <div style={{
            padding: '14px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '2px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            marginBottom: '16px'
          }}>
            <img
              src={qrApiUrl}
              alt="Quotation QR Code"
              style={{ width: '200px', height: '200px', display: 'block', borderRadius: '6px' }}
            />
          </div>

          <p style={{ fontSize: '0.76rem', color: '#64748b', margin: '0 0 16px', maxWidth: '320px', lineHeight: 1.4 }}>
            Scan with smartphone camera to open and digitally approve the prescription proposal in 1 click.
          </p>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            <button
              onClick={handleCopy}
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '10px 14px',
                backgroundColor: copied ? '#f0fdf4' : '#f1f5f9',
                color: copied ? '#16a34a' : '#0f172a',
                border: `1px solid ${copied ? '#bbf7d0' : '#cbd5e1'}`,
                borderRadius: '8px',
                fontSize: '0.80rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>

            <button
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '10px 16px',
                backgroundColor: '#7c3aed',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.80rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(124, 58, 237, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              <Printer size={14} /> Print QR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
