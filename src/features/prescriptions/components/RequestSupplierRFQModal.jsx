"use client";

import React, { useState } from 'react';
import {
  Building2,
  X,
  Send,
  Link,
  Copy,
  Check,
  ExternalLink,
  Share2,
  Beaker,
  ShieldCheck,
  Package
} from 'lucide-react';
import { serverCreateSupplierRFQFromPrescription } from '../../../actions/supplierRfqActions';
import { toast } from 'react-hot-toast';

export default function RequestSupplierRFQModal({ rx, isOpen, onClose, onSuccess }) {
  const [selectedSupplier, setSelectedSupplier] = useState('Fagron Genomics / Lab');
  const [notes, setNotes] = useState('Please provide compounding quotation, available batch expiry, certificate of analysis (COA), and express cold-chain freight.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRFQ, setGeneratedRFQ] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !rx) return null;

  const code = rx.prescriptionCode || rx.fagronDetails?.boxId || rx.id;
  const patient = rx.patient?.name || rx.patientName || 'Clinical Patient';
  const formulations = rx.formulationBlocks || [];

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await serverCreateSupplierRFQFromPrescription({
        rxId: rx.id || code,
        supplierName: selectedSupplier,
        notes,
        requestedByUid: 'clinic_admin'
      });

      if (res.success) {
        setGeneratedRFQ(res);
        toast.success(`Supplier RFQ generated: ${res.prfqId}`);
        if (onSuccess) onSuccess(res);
      } else {
        toast.error(res.error || 'Failed to generate supplier RFQ');
      }
    } catch (err) {
      toast.error('Error generating RFQ: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const fullUrl = generatedRFQ ? `${window.location.origin}${generatedRFQ.publicUrl}` : '';

  const handleCopyLink = () => {
    if (!fullUrl) return;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    toast.success('RFQ Magic Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    if (!generatedRFQ) return;
    const itemsSummary = formulations.map((f, i) =>
      `• Phase ${i + 1} (${f.vehicle || 'Standard'}): ${(f.items || f.ingredients || []).map(ing => `${ing.name} ${ing.dosage || ing.concentration || ''}`).join(', ')}`
    ).join('\n');

    const msg = `*🚨 REQUEST FOR COMPOUNDING QUOTATION (RFQ) — ${generatedRFQ.prfqId}*
────────────────────────────
*Clinic:* Med-Peptides & Magenta Health Compounding Network
*Prescription Sample Reference:* ${code}

*Clinical Formulations Required:*
${itemsSummary || 'Custom active pharmaceutical compounds and excipients'}

🔗 *Direct Supplier Quotation Link (No Login Required):*
${fullUrl}

Please input your unit prices, packaging fee, and estimated turnaround days directly on the link above. Thank you!`;

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        maxWidth: '560px',
        width: '100%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid #dadce0',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e8eaed',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8f9fa'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={20} color="#1a73e8" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#202124', margin: 0 }}>
              Request Supplier Quotation (RFQ)
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#5f6368', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px' }}>
          {!generatedRFQ ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Prescription Context */}
              <div style={{
                backgroundColor: '#e8f0fe',
                borderRadius: '8px',
                padding: '12px 16px',
                border: '1px solid #d2e3fc',
                fontSize: '0.84rem',
                color: '#1a73e8'
              }}>
                <div style={{ fontWeight: 700 }}>Prescription: {code}</div>
                <div style={{ color: '#3c4043', marginTop: '2px' }}>Patient: {patient}</div>
                {formulations.length > 0 && (
                  <div style={{ marginTop: '6px', fontSize: '0.8rem', color: '#5f6368' }}>
                    Includes <strong>{formulations.length} formulation blocks</strong> ({formulations.map(f => f.vehicle || 'Vehicle').join(' + ')})
                  </div>
                )}
              </div>

              {/* Target Supplier Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#3c4043', marginBottom: '6px' }}>
                  Target Compounding Supplier / Lab
                </label>
                <select
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1px solid #dadce0',
                    fontSize: '0.86rem',
                    color: '#202124',
                    outline: 'none',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <option value="Fagron Genomics / Lab">Fagron Genomics / Compounding Lab</option>
                  <option value="Pharmapolis Compounding Pharmacy">Pharmapolis Specialist Compounding</option>
                  <option value="Eurofins Scientific Compounding">Eurofins Scientific Compounding</option>
                  <option value="Open Lab Network (Direct Magic Link)">Open Lab Network (Direct Magic Link)</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#3c4043', marginBottom: '6px' }}>
                  Procurement Notes / Compounding Specifications
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #dadce0',
                    fontSize: '0.84rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Footer CTA */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #dadce0',
                    backgroundColor: '#ffffff',
                    color: '#3c4043',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={handleGenerate}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#1a73e8',
                    color: '#ffffff',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: isGenerating ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Send size={15} />
                  {isGenerating ? 'Generating Link…' : 'Generate RFQ & Magic Link'}
                </button>
              </div>
            </div>
          ) : (
            /* RFQ Generated Result State */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                backgroundColor: '#e6f4ea',
                borderRadius: '8px',
                padding: '16px',
                border: '1px solid #ceead6',
                color: '#137333',
                textAlign: 'center'
              }}>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1e8e3e' }}>
                  RFQ Created: {generatedRFQ.prfqId}
                </div>
                <div style={{ fontSize: '0.82rem', marginTop: '4px' }}>
                  Zero-login public supplier quote link is ready for dispatch.
                </div>
              </div>

              {/* Magic Link Box */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#3c4043', marginBottom: '6px' }}>
                  Direct Supplier Magic Link
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    readOnly
                    value={fullUrl}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #dadce0',
                      fontSize: '0.82rem',
                      fontFamily: 'monospace',
                      backgroundColor: '#f8f9fa',
                      color: '#202124'
                    }}
                  />
                  <button
                    onClick={handleCopyLink}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '6px',
                      border: '1px solid #1a73e8',
                      backgroundColor: copied ? '#e6f4ea' : '#e8f0fe',
                      color: copied ? '#137333' : '#1a73e8',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Share & Open Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  onClick={handleWhatsAppShare}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '6px',
                    border: '1px solid #bbf7d0',
                    backgroundColor: '#f0fdf4',
                    color: '#166534',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Share2 size={16} color="#16a34a" /> Send via WhatsApp
                </button>

                <a
                  href={fullUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '10px 14px',
                    borderRadius: '6px',
                    border: '1px solid #dadce0',
                    backgroundColor: '#ffffff',
                    color: '#1a73e8',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <ExternalLink size={16} /> Open Public Page
                </a>
              </div>

              {/* Done button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  onClick={onClose}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#1a73e8',
                    color: '#ffffff',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
