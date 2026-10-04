"use client";

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Clock, 
  Droplet, 
  FlaskConical, 
  Calendar, 
  ShieldCheck, 
  Share2, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  Eye, 
  FileText, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  Activity,
  CheckCircle2,
  ChevronRight,
  Maximize2
} from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';
import toast from 'react-hot-toast';
import DocumentPreviewModal from '../ui/DocumentPreviewModal';

/**
 * PrescriptionPosologyQrCard
 * ─────────────────────────────────────────────────────────────────────────────
 * GCP-Styled Advanced Clinical Posology & Interactive QR Sharing Suite.
 * Enriches prescription datasheets with structured step-by-step administration,
 * biological timeline milestones, actives synergy, and multi-channel sharing.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export default function PrescriptionPosologyQrCard({ rx, onOpenPreview = null }) {
  const [copied, setCopied] = useState(false);
  const [activeStepTab, setActiveStepTab] = useState(0);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);

  if (!rx) return null;

  const rxId = rx.id || rx.prescriptionNumber || 'RX-PRESCRIPTION';
  const posology = rx.structuredPosology || {};
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://med-peptides.com';
  const publicUrl = rx.publicDossierUrl || `${baseUrl}/rx/${rxId}`;

  const steps = posology.applicationSteps || [
    {
      step: 1,
      title: 'Scalp Preparation',
      timing: 'Night (21:30 - 22:00)',
      instruction: 'Ensure scalp is clean and thoroughly dry. Part hair in 1-2 cm sections across lower-density target areas.'
    },
    {
      step: 2,
      title: 'Precision Dosing (1.0 ml)',
      timing: 'Exact Daily Dose',
      instruction: 'Draw exactly 1.0 ml using the calibrated pipette. Exceeding recommended dose saturates follicular receptors without clinical benefit.'
    },
    {
      step: 3,
      title: 'Root-Targeted Drop Application',
      timing: 'Dermal Contact',
      instruction: 'Apply drops directly onto the scalp surface (avoiding hair shaft), distributing evenly across target zones.'
    },
    {
      step: 4,
      title: 'Microcirculation Massage',
      timing: '60 - 90 Seconds',
      instruction: 'Perform gentle circular massage with fingertips to stimulate microvascular flow and optimize liposomal transdermal absorption.'
    },
    {
      step: 5,
      title: 'Overnight Action Period',
      timing: '6 to 8 Continuous Hours',
      instruction: 'Leave on during overnight rest. Allow to air dry without direct heat from hair dryers. Wash hands thoroughly with soap after application.'
    },
    {
      step: 6,
      title: 'Morning Cleansing',
      timing: 'Next Morning',
      instruction: 'Wash hair the following morning with a mild, gentle neutral shampoo (pH 5.5, sulfate-free).'
    }
  ];

  const timeline = posology.timeline || [
    {
      phase: 'Weeks 1 - 3',
      title: 'Adaptation & Stabilization Phase',
      badge: 'Month 1',
      description: 'Arresting active telogen shedding. Mild temporary shedding may occur as old telogen hairs cycle out to initiate active anagen growth.'
    },
    {
      phase: 'Weeks 4 - 8',
      title: 'Anagen Activation & Proliferation',
      badge: 'Month 2',
      description: 'Dermal papilla cellular stimulation via IGrantine-F1™ and androgenic control via 17-α-Estradiol. Noticeable reduction in wash shedding.'
    },
    {
      phase: 'Weeks 9 - 12',
      title: 'Hair Caliber, Density & Consolidation',
      badge: 'Month 3',
      description: 'Follicular diameter increase and enhanced visual scalp coverage. Completion of 3-vial course (300 ml). Clinical evaluation with prescriber.'
    }
  ];

  const docs = rx.documents || rx.attachedDocuments || [];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      triggerHaptic('copy');
      setCopied(true);
      toast.success('Enlace de la ficha pública copiado ✓');
      setTimeout(() => setCopied(false), 2200);
    } catch {
      toast.error('No se pudo copiar el enlace');
    }
  };

  const handleDownloadQrPng = () => {
    try {
      const svg = document.getElementById(`qr-prescription-${rxId}`);
      if (!svg) return;
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = 600;
        canvas.height = 600;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 600, 600);
        ctx.drawImage(img, 50, 50, 500, 500);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `QR_${rxId}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
      toast.success('QR Code downloaded ✓');
    } catch (err) {
      console.warn('[PrescriptionPosologyQrCard] Download error:', err);
    }
  };

  const patientName = typeof rx.patient === 'object' && rx.patient !== null
    ? (rx.patient.name || rx.patient.displayName || rx.patient.email || rx.patientName || 'Patient')
    : (rx.patientName || (typeof rx.patient === 'string' ? rx.patient : '') || 'Patient');
  const patientAlias = rx.patientAlias || rx.patient?.alias ? ` (~${rx.patientAlias || rx.patient?.alias})` : '';
  const doctorName = typeof rx.doctor === 'object' && rx.doctor !== null
    ? (rx.doctor.name || rx.doctor.displayName || rx.doctorName || 'Dr. Hanieh Erdmann')
    : (rx.doctorName || (typeof rx.doctor === 'string' ? rx.doctor : '') || 'Dr. Hanieh Erdmann');

  // Dynamic formula & posology extraction
  const rawItems = rx.items || rx.compounds || [];
  let formulaText = rx.formulaName || rx.title || '';
  if (rawItems.length > 0) {
    const activeItems = rawItems
      .filter(i => i.itemType !== 'vehicle_base' && i.itemType !== 'consumable')
      .map(i => {
        const conc = i.concentration || i.dosage || '';
        return `${i.name}${conc && !i.name.includes(conc) ? ` ${conc}` : ''}`;
      });
    const vehicle = rawItems.find(i => i.itemType === 'vehicle_base');
    const activeStr = activeItems.length > 0 ? activeItems.join(' + ') : rawItems.map(i => i.name).join(' + ');
    formulaText = vehicle ? `${activeStr} in ${vehicle.name}` : activeStr;
    if (rx.structuredPosology?.packLabel) {
      formulaText += ` (${rx.structuredPosology.packLabel})`;
    }
  }
  const posologyText = rx.structuredPosology?.summary || rx.posology || rx.dosageSchedule || 'Apply according to medical indication.';

  const shareTextWhatsApp = encodeURIComponent(
    `*Atlas Health — Clinical Dossier & Medical Posology*\n` +
    `📋 *Prescription:* ${rxId}\n` +
    `👤 *Patient:* ${patientName}${patientAlias}\n` +
    `🩺 *Prescribing Physician:* ${doctorName}\n` +
    `🧪 *Formula:* ${formulaText}\n` +
    `🕒 *Posology:* ${posologyText}\n\n` +
    `🔗 *View Full Digital Dossier & Verification:*\n${publicUrl}`
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
      
      {/* ── CARD 1: Posology & Protocol Header ────────────────────────────────────────── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        padding: '1.25rem',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0284c7, #0369a1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)'
            }}>
              <Clock size={18} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                Posology Guide & Administration Protocol
              </h4>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                Personalized Clinical Protocol — 90-Day Therapeutic Course (N3)
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              padding: '3px 8px',
              borderRadius: '6px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#15803d'
            }}>
              1.0 ml / Night (Topical)
            </span>
            <span style={{
              padding: '3px 8px',
              borderRadius: '6px',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#475569'
            }}>
              3x 100 ml (TrichoSol™)
            </span>
          </div>
        </div>

        {/* ── 15-Day Automated Refill Alert Banner ─────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4, #eff6ff)',
          border: '1px solid #bae6fd',
          borderRadius: '10px',
          padding: '0.85rem 1rem',
          marginBottom: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.1rem' }}>⏰</span>
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                  Preventive Refill Alert (15 Days Before Exhaustion)
                </span>
                <span style={{ display: 'inline-block', marginLeft: '6px', fontSize: '0.68rem', fontWeight: 800, padding: '1px 6px', borderRadius: '4px', background: '#dcfce7', color: '#15803d' }}>
                  ✓ ACTIVE & SCHEDULED
                </span>
              </div>
            </div>
            
            <button
              type="button"
              onClick={async () => {
                triggerHaptic('impact');
                const tId = toast.loading('Sending test alert...');
                try {
                  const res = await fetch('/api/prescriptions/refill-alerts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prescriptionId: rxId, action: 'trigger' })
                  });
                  const json = await res.json();
                  if (json.success) {
                    toast.success('Alert sent to Doctor and Administrator ✓', { id: tId });
                  } else {
                    toast.error(json.error || 'Failed to dispatch alert', { id: tId });
                  }
                } catch (err) {
                  toast.error(err.message, { id: tId });
                }
              }}
              style={{
                background: '#ffffff',
                border: '1px solid #0284c7',
                color: '#0284c7',
                borderRadius: '6px',
                padding: '3px 10px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>🔔</span>
              <span>Test / Notify Now</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.5rem', fontSize: '0.75rem', marginTop: '2px' }}>
            <div style={{ background: '#ffffff', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Treatment Start</div>
              <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '1px' }}>15 Sep 2026</div>
            </div>
            <div style={{ background: '#ffffff', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total Duration</div>
              <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '1px' }}>90 Days (3 Vials)</div>
            </div>
            <div style={{ background: '#ffffff', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Estimated End</div>
              <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '1px' }}>14 Dec 2026</div>
            </div>
            <div style={{ background: '#fef3c7', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #fde68a' }}>
              <div style={{ fontSize: '0.66rem', color: '#92400e', fontWeight: 800, textTransform: 'uppercase' }}>🔔 Alert Trigger (-15d)</div>
              <div style={{ fontWeight: 800, color: '#b45309', marginTop: '1px' }}>29 Nov 2026</div>
            </div>
          </div>
        </div>

        {/* Step-by-Step Interactive Guide */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '0.75rem',
          marginTop: '0.75rem'
        }}>
          {steps.map((st, idx) => (
            <div 
              key={idx}
              style={{
                padding: '0.85rem',
                borderRadius: '10px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: '#0284c7',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {st.step}
                </span>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0369a1', background: '#e0f2fe', padding: '1px 6px', borderRadius: '4px' }}>
                  {st.timing}
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                {st.title}
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#475569', lineHeight: 1.45 }}>
                {st.instruction}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CARD 2: Biological Milestones & Synergy ─────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* Timeline */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '1.25rem',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
            <Activity size={16} color="#0d9488" />
            <h5 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Biological Response Timeline (90 Days)
            </h5>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {timeline.map((tm, idx) => (
              <div key={idx} style={{
                padding: '0.75rem 0.85rem',
                borderRadius: '8px',
                background: '#f0fdfa',
                border: '1px solid #ccfbf1',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f766e' }}>
                    {tm.phase} — {tm.title}
                  </span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#ffffff', background: '#0d9488', padding: '1px 6px', borderRadius: '4px' }}>
                    {tm.badge}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.74rem', color: '#134e4a', lineHeight: 1.4 }}>
                  {tm.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* QR Code & Direct Share Box */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '1.25rem',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
              <ShieldCheck size={16} color="#16a34a" />
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Clinical Access & QR Verification
              </span>
            </div>
            <p style={{ margin: '0 0 1rem', fontSize: '0.73rem', color: '#64748b' }}>
              Scan to access digital dossier, interactive posology schedule, and attached prescriptions
            </p>
          </div>

          {/* Interactive QR SVG */}
          <div 
            onClick={() => setShowQrModal(true)}
            style={{
              padding: '10px',
              borderRadius: '12px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              cursor: 'pointer',
              position: 'relative'
            }}
            title="Click to enlarge QR code"
          >
            <QRCodeSVG 
              id={`qr-prescription-${rxId}`}
              value={publicUrl}
              size={130}
              level="H"
              includeMargin={false}
            />
            <div style={{
              position: 'absolute',
              bottom: 4,
              right: 4,
              background: 'rgba(15,23,42,0.7)',
              borderRadius: '4px',
              padding: '2px',
              display: 'flex'
            }}>
              <Maximize2 size={10} color="#ffffff" />
            </div>
          </div>

          {/* Share Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', marginTop: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={handleCopyLink}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '0.55rem',
                  borderRadius: '8px',
                  background: copied ? '#f0fdf4' : '#ffffff',
                  border: `1px solid ${copied ? '#86efac' : '#cbd5e1'}`,
                  color: copied ? '#15803d' : '#334155',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {copied ? <Check size={14} color="#15803d" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy URL'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadQrPng}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '0.55rem',
                  borderRadius: '8px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Download size={14} />
                <span>Download QR</span>
              </button>
            </div>

            {/* Direct WhatsApp Share Button */}
            <a
              href={`https://wa.me/?text=${shareTextWhatsApp}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '0.6rem 1rem',
                borderRadius: '8px',
                background: '#25D366',
                color: '#ffffff',
                fontSize: '0.78rem',
                fontWeight: 800,
                textDecoration: 'none',
                boxShadow: '0 2px 6px rgba(37, 211, 102, 0.25)',
                transition: 'opacity 0.15s'
              }}
            >
              <Share2 size={14} />
              <span>Share via WhatsApp</span>
            </a>

            {/* View Public Dossier Link */}
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                fontSize: '0.72rem',
                color: '#0284c7',
                fontWeight: 700,
                textDecoration: 'none',
                marginTop: '2px'
              }}
            >
              <span>Open Verified Public Dossier</span>
              <ExternalLink size={11} />
            </a>
          </div>
        </div>
      </div>

      {/* ── CARD 3: Attached Official Documents Quick Preview ───────────────────────── */}
      {docs.length > 0 && (
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '1.25rem',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={16} color="#6366f1" />
              <h5 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Official Clinical Documents ({docs.length})
              </h5>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700, background: '#f0fdf4', padding: '2px 8px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
              Verified ✓
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
            {docs.map((doc, dIdx) => (
              <div 
                key={doc.id || dIdx}
                style={{
                  padding: '0.85rem',
                  borderRadius: '10px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem'
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {doc.title || doc.name || `Document ${dIdx + 1}`}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                    {doc.type?.includes('pdf') || doc.url?.endsWith('.pdf') ? '📄 Official Signed PDF' : '🖼️ Fagron TrichoTest Template'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenPreview) {
                        onOpenPreview(doc);
                      } else {
                        setPreviewDoc(doc);
                      }
                    }}
                    style={{
                      padding: '0.4rem 0.65rem',
                      borderRadius: '6px',
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      color: '#2563eb',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                  >
                    <Eye size={12} />
                    <span>View</span>
                  </button>

                  {doc.url && (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        padding: '0.4rem 0.55rem',
                        borderRadius: '6px',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        color: '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        textDecoration: 'none'
                      }}
                      title="Download original file"
                    >
                      <Download size={12} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox QR Modal */}
      {showQrModal && (
        <div 
          onClick={() => setShowQrModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            padding: '1rem'
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '2rem',
              maxWidth: 380,
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              position: 'relative'
            }}
          >
            <h3 style={{ margin: '0 0 0.5rem', color: '#0f172a', fontWeight: 800, fontSize: '1.1rem' }}>
              Prescription QR Code
            </h3>
            <p style={{ margin: '0 0 1.5rem', color: '#64748b', fontSize: '0.8rem' }}>
              {rxId} · {patientName}
            </p>
            
            <div style={{
              padding: '16px',
              background: '#ffffff',
              borderRadius: '16px',
              display: 'inline-block',
              border: '2px solid #e2e8f0',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
            }}>
              <QRCodeSVG 
                value={publicUrl}
                size={220}
                level="H"
                includeMargin={false}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={handleDownloadQrPng}
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  borderRadius: '10px',
                  background: '#0284c7',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Download PNG
              </button>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                style={{
                  padding: '0.65rem 1rem',
                  borderRadius: '10px',
                  background: '#f1f5f9',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Internal Document Preview Modal Fallback */}
      {previewDoc && (
        <DocumentPreviewModal 
          url={previewDoc.url}
          name={previewDoc.title || previewDoc.name}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
}
