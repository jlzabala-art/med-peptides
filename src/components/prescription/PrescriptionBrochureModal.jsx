'use client';

import React, { useState, useRef } from 'react';
import { X, Printer, Download, QrCode, FileText, User, ShieldCheck, Stethoscope, Check, ExternalLink, Calendar, MapPin, Pill } from '@/lib/icons';
import { QRCodeSVG } from 'qrcode.react';

export default function PrescriptionBrochureModal({
  isOpen,
  onClose,
  rx = {},
  compoundedFormulations = [],
  genomicsData = null,
  currentStatus = 'active',
  isPatientView = false,
  publicUrl = '',
  patientPublicUrl = '',
  onOpenLabels = null
}) {
  const [docType, setDocType] = useState(isPatientView ? 'patient' : 'medical'); // 'medical' | 'patient'
  const sheetRef = useRef(null);

  if (!isOpen) return null;

  const rxId = rx.prescriptionNumber || rx.prescriptionCode || rx.id || 'BOX03483AATRI';
  const fileNumber = rx.fileNumber || rx.fileNo || '51857';
  const patientName = (rx.patientName || rx.patient?.name || 'Patient Record').toUpperCase();
  const doctorName = rx.doctorName || rx.treatingDoctor || rx.physician || 'Dr. Marina Cordeiro Fernandes';
  const clinicName = rx.clinicName || 'NOVA Clinic Day Surgery Center, Dubai';
  const doctorLicense = rx.doctorLicense || 'DHA-91105367';
  const batchCode = rx.batchCode || 'PHARM-2026-B948';
  const issueDate = rx.date || rx.createdAt || '15-09-2026';
  const expiryDate = rx.expiryDate || rx.expDate || '15-09-2027';

  // Target URLs for QR codes
  const doctorQrUrl = publicUrl || `https://med-peptides.com/rx/${rxId}`;
  const patientQrUrl = patientPublicUrl || `https://med-peptides.com/rx/${rxId}?view=patient`;

  // Formulations fallback
  const formulations = compoundedFormulations && compoundedFormulations.length > 0 
    ? compoundedFormulations 
    : [
        {
          name: 'TrichoTest™ Personalized Follicular Therapy',
          dosageForm: 'Topical Scalp Solution',
          volume: '100 mL',
          posology: 'Apply 1 mL once daily in the evening directly to affected scalp areas.',
          formula: 'Minoxidil 5%, Finasteride 0.1%, Latanoprost 0.005%, Biotin 0.2% in TrichoSol™ vehicle.'
        }
      ];

  // High-Precision Isolated Print Engine
  const handlePrint = () => {
    const sheetEl = sheetRef.current;
    if (!sheetEl) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const sheetHtml = sheetEl.innerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${docType === 'medical' ? 'Clinical_Monograph' : 'Patient_Treatment_Guide'}_${rxId}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm 15mm;
            }
            * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            body {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #202124;
              background: #ffffff;
              font-size: 11.5px;
              line-height: 1.4;
            }
            .a4-print-sheet {
              width: 100%;
              max-width: 100%;
              margin: 0 auto;
            }
            h1, h2, h3, h4, p { margin: 0; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 6px 8px; border: 1px solid #dadce0; }
            th { background: #f8fafc; font-weight: 600; text-align: left; }
            .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-weight: 600; font-size: 10px; }
          </style>
        </head>
        <body>
          <div class="a4-print-sheet">
            ${sheetHtml}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 300);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="gcp-brochure-backdrop">
      <style>{`
        .gcp-brochure-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(15, 23, 42, 0.78);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        .gcp-brochure-dialog {
          background: #ffffff;
          border-radius: 12px;
          max-width: 900px;
          width: 100%;
          max-height: 94vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.35);
          overflow: hidden;
          border: 1px solid #dadce0;
        }
        @media (max-width: 640px) {
          .gcp-brochure-backdrop {
            padding: 0;
            align-items: flex-end;
          }
          .gcp-brochure-dialog {
            max-height: 100dvh;
            height: 100%;
            border-radius: 14px 14px 0 0;
            border: none;
          }
        }
        .gcp-brochure-header {
          padding: 12px 20px;
          border-bottom: 1px solid #dadce0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #ffffff;
          flex-shrink: 0;
          gap: 12px;
        }
        .gcp-brochure-body {
          flex: 1 1 auto;
          min-height: 0;
          overflow-y: auto;
          background: #f1f3f4;
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          -webkit-overflow-scrolling: touch;
        }
        @media (max-width: 640px) {
          .gcp-brochure-body {
            padding: 10px;
          }
        }
        /* Realistic A4 Document Canvas */
        .gcp-a4-sheet {
          background: #ffffff;
          width: 100%;
          max-width: 760px;
          min-height: 960px;
          box-shadow: 0 4px 16px rgba(60, 64, 67, 0.15), 0 1px 3px rgba(60, 64, 67, 0.1);
          border: 1px solid #dadce0;
          border-radius: 4px;
          padding: 36px 40px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          color: #202124;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
        }
        @media (max-width: 640px) {
          .gcp-a4-sheet {
            padding: 20px 16px;
            gap: 14px;
          }
        }
        .gcp-brochure-footer {
          flex-shrink: 0;
          background: #ffffff;
          border-top: 1px solid #dadce0;
          padding: 12px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          box-shadow: 0 -2px 6px rgba(60, 64, 67, 0.06);
          z-index: 10;
        }
        @media (max-width: 640px) {
          .gcp-brochure-footer {
            position: sticky;
            bottom: 0;
            left: 0;
            right: 0;
            width: 100%;
            padding: 10px 14px calc(10px + env(safe-area-inset-bottom, 8px)) 14px;
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
            box-shadow: 0 -4px 18px rgba(60, 64, 67, 0.12);
            border-top: 1px solid #e0e0e0;
          }
        }
      `}</style>

      <div className="gcp-brochure-dialog">
        {/* Header */}
        <div className="gcp-brochure-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '6px',
              background: '#e8f0fe',
              color: '#1a73e8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #d2e3fc'
            }}>
              <FileText size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#202124' }}>
                  {docType === 'medical' ? 'Clinical Monograph & Dossier' : 'Patient Personalized Treatment Guide'}
                </h3>
                <span style={{
                  background: '#e6f4ea',
                  color: '#137333',
                  border: '1px solid #ceead6',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  A4 · Vector Print Ready
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: '#5f6368' }}>
                Official Prescription #{rxId} · Live Document Preview
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* View Switcher (Only available for doctors/admins) */}
            {!isPatientView && (
              <div style={{
                display: 'inline-flex',
                background: '#f1f3f4',
                padding: '3px',
                borderRadius: '6px',
                gap: '3px'
              }}>
                <button
                  type="button"
                  onClick={() => setDocType('medical')}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '4px',
                    border: docType === 'medical' ? '1px solid #dadce0' : '1px solid transparent',
                    background: docType === 'medical' ? '#ffffff' : 'transparent',
                    color: docType === 'medical' ? '#1a73e8' : '#5f6368',
                    fontSize: '0.76rem',
                    fontWeight: docType === 'medical' ? 600 : 500,
                    cursor: 'pointer'
                  }}
                >
                  Medical Brochure
                </button>
                <button
                  type="button"
                  onClick={() => setDocType('patient')}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '4px',
                    border: docType === 'patient' ? '1px solid #dadce0' : '1px solid transparent',
                    background: docType === 'patient' ? '#ffffff' : 'transparent',
                    color: docType === 'patient' ? '#1a73e8' : '#5f6368',
                    fontSize: '0.76rem',
                    fontWeight: docType === 'patient' ? 600 : 500,
                    cursor: 'pointer'
                  }}
                >
                  Patient Guide
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              style={{
                background: 'transparent',
                border: 'none',
                padding: '8px',
                borderRadius: '50%',
                cursor: 'pointer',
                color: '#5f6368',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Body: Live A4 Sheet Preview */}
        <div className="gcp-brochure-body">
          <div ref={sheetRef} className="gcp-a4-sheet">

            {/* ════════════════════════════════════════════════════════════════
                VIEW A: MEDICAL BROCHURE (CLINICAL MONOGRAPH & COMPOUNDING)
            ════════════════════════════════════════════════════════════════ */}
            {docType === 'medical' ? (
              <>
                {/* 1. Official Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #003666', paddingBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#003666', letterSpacing: '0.04em' }}>
                      PHARMAPOLIS & MED-PEPTIDES
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Clinical Compounding Monograph & Prescription Dossier
                    </div>
                    <div style={{ fontSize: '0.70rem', color: '#64748b', marginTop: '2px' }}>
                      EU GMP Certified Laboratory · 1A Arhimandrit Evlogi St, 4013 Plovdiv, Bulgaria
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1a73e8' }}>
                      RX #{rxId}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#475569' }}>
                      File No: <strong>{fileNumber}</strong> · Batch: <strong>{batchCode}</strong>
                    </div>
                    <div style={{ fontSize: '0.70rem', color: '#64748b' }}>
                      Date: {issueDate} · Exp: {expiryDate}
                    </div>
                  </div>
                </div>

                {/* 2. Patient & Prescriber Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '12px 14px'
                }}>
                  <div>
                    <div style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      PATIENT DEMOGRAPHICS
                    </div>
                    <div style={{ fontSize: '0.90rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                      {patientName}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '2px' }}>
                      Indication: <strong>Personalized Follicular Therapy</strong>
                    </div>
                    <div style={{ marginTop: '6px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: '#e6f4ea',
                        color: '#137333',
                        border: '1px solid #ceead6',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        textTransform: 'uppercase'
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#137333' }} />
                        {currentStatus || 'ACTIVE TREATMENT'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      PRESCRIBING PHYSICIAN
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                      {doctorName}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '2px' }}>
                      License: <strong>{doctorLicense}</strong>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#475569' }}>
                      Clinic: <strong>{clinicName}</strong>
                    </div>
                  </div>
                </div>

                {/* 3. Clinical Pharmacogenomics Summary (TrichoTest™) */}
                {genomicsData && (
                  <div style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '10px 14px',
                    background: '#ffffff'
                  }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#003666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Clinical Pharmacogenomics Panel (TrichoTest™ DNA Profile)
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '4px' }}>
                      Formulation customized according to patient genetic polymorphism analysis (SULT1A1 sulfotransferase activity, AR androgen sensitivity, and prostaglandin pathway kinetics).
                    </div>
                  </div>
                )}

                {/* 4. Formulations / Active Compounds Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Compounded Pharmaceutical Formulations ({formulations.length} {formulations.length === 1 ? 'Phase' : 'Phases'})
                  </div>

                  {formulations.map((phase, idx) => (
                    <div
                      key={idx}
                      style={{
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        overflow: 'hidden'
                      }}
                    >
                      <div style={{
                        background: '#f8fafc',
                        padding: '8px 12px',
                        borderBottom: '1px solid #cbd5e1',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#1a73e8', textTransform: 'uppercase', marginRight: '6px' }}>
                            Phase {phase.phaseNumber || idx + 1}:
                          </span>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>
                            {phase.name || phase.productName}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {phase.dosageForm || 'Topical Scalp Solution'} · {phase.volume || '100 mL'}
                        </div>
                      </div>

                      <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div>
                          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                            Active Formula &amp; Vehicle
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#1e293b', marginTop: '2px', fontFamily: 'monospace' }}>
                            {phase.formula || phase.ingredients || 'Minoxidil, Finasteride, Latanoprost in TrichoSol™ base'}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                            Prescribed Posology &amp; Directions for Use
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#1e293b', marginTop: '2px' }}>
                            {phase.posology || phase.directions || 'Apply 1 mL once daily in the evening directly to affected scalp areas. Massage gently.'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 5. Official Verification Box with DOCTOR QR CODE */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  marginTop: 'auto',
                  gap: '16px'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#003666', textTransform: 'uppercase' }}>
                      Official Clinical Dossier Verification
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#475569', maxWidth: '440px' }}>
                      Scan the QR code to verify this medical prescription monograph in the European digital repository, inspect certificates of analysis (CoA), and check batch release status.
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#1a73e8', fontFamily: 'monospace', marginTop: '4px' }}>
                      {doctorQrUrl}
                    </div>
                  </div>

                  <div style={{
                    padding: '8px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    flexShrink: 0
                  }}>
                    <QRCodeSVG
                      value={doctorQrUrl}
                      size={90}
                      level="H"
                      includeMargin={false}
                    />
                    <span style={{ fontSize: '0.58rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Doctor Verification
                    </span>
                  </div>
                </div>

                {/* 6. Signature Block */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '24px',
                  borderTop: '1px dashed #cbd5e1',
                  paddingTop: '12px',
                  marginTop: '6px'
                }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Treating Physician Signature &amp; Stamp:</div>
                    <div style={{ height: '36px', borderBottom: '1px solid #94a3b8', marginTop: '10px' }} />
                    <div style={{ fontSize: '0.70rem', fontWeight: 600, color: '#334155', marginTop: '4px' }}>
                      {doctorName} · License {doctorLicense}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Compounding Pharmacist Release:</div>
                    <div style={{ height: '36px', borderBottom: '1px solid #94a3b8', marginTop: '10px' }} />
                    <div style={{ fontSize: '0.70rem', fontWeight: 600, color: '#334155', marginTop: '4px' }}>
                      Pharmapolis Quality Assurance · EU GMP Certified
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* ════════════════════════════════════════════════════════════════
                  VIEW B: PATIENT BROCHURE (PERSONALIZED TREATMENT GUIDE)
              ════════════════════════════════════════════════════════════════ */
              <>
                {/* 1. Warm Patient Header */}
                <div style={{ borderBottom: '2px solid #003666', paddingBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#003666' }}>
                        YOUR PERSONALIZED TREATMENT GUIDE
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>
                        Digital Posology Regimen &amp; Step-by-Step Daily Instructions
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#1a73e8' }}>
                        Ref: #{rxId}
                      </div>
                      <div style={{ fontSize: '0.70rem', color: '#64748b' }}>
                        {clinicName}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Personalized Welcome Card */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '14px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Prescribed Specifically For:</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                      {patientName}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#475569', marginTop: '3px' }}>
                      Prescribing Physician: <strong>{doctorName}</strong>
                    </div>
                  </div>
                  <div>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background: '#e6f4ea',
                      color: '#137333',
                      border: '1px solid #ceead6',
                      fontSize: '0.72rem',
                      fontWeight: 700
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#137333' }} />
                      ACTIVE TREATMENT
                    </span>
                  </div>
                </div>

                {/* 3. Step-by-Step Daily Application Guide */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.80rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    How to Apply Your Topical Treatment Correctly
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px' }}>
                      <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#1a73e8' }}>STEP 1</div>
                      <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#1e293b', marginTop: '2px' }}>Dry Scalp</div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '4px' }}>Ensure your hair and scalp are completely clean and dry before applying.</div>
                    </div>
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px' }}>
                      <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#1a73e8' }}>STEP 2</div>
                      <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#1e293b', marginTop: '2px' }}>Dose: 1 mL</div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '4px' }}>Measure 1 mL (approx. 6 sprays or 1 full dropper pipet) on target areas.</div>
                    </div>
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px' }}>
                      <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#1a73e8' }}>STEP 3</div>
                      <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#1e293b', marginTop: '2px' }}>Massage</div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '4px' }}>Gently massage with fingertips for 30–45 seconds to enhance absorption.</div>
                    </div>
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px' }}>
                      <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#1a73e8' }}>STEP 4</div>
                      <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#1e293b', marginTop: '2px' }}>Leave-In</div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '4px' }}>Do not wash, wet, or rinse hair for at least 4 hours after application.</div>
                    </div>
                  </div>
                </div>

                {/* 4. Treatment Timeline & Posology */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.80rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Your Prescribed Treatment Regimen
                  </div>

                  {formulations.map((phase, idx) => (
                    <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px 14px', background: '#f8fafc' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                          {phase.name || phase.productName}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#1a73e8', fontWeight: 600 }}>
                          {phase.volume || '100 mL'} · 60-Day Supply
                        </span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#334155', marginTop: '4px' }}>
                        {phase.posology || 'Apply 1 mL once daily in the evening directly to affected scalp areas.'}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 5. What to Expect & Care Advice */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '12px 14px'
                }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#003666', textTransform: 'uppercase' }}>
                      Storage Instructions
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '4px', lineHeight: 1.4 }}>
                      • Store at room temperature (15–25°C) away from direct sunlight.<br/>
                      • Keep the bottle tightly closed when not in use.<br/>
                      • Keep out of reach of children and domestic pets.
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#003666', textTransform: 'uppercase' }}>
                      Clinical Response Milestones
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '4px', lineHeight: 1.4 }}>
                      • <strong>Weeks 1–4:</strong> Follicular stimulation & stabilization.<br/>
                      • <strong>Weeks 5–8:</strong> Noticeable reduction in shedding.<br/>
                      • <strong>Weeks 9–12:</strong> Visible hair caliber & density gains.
                    </div>
                  </div>
                </div>

                {/* 6. Patient QR Code & Refill Box */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  marginTop: 'auto',
                  gap: '16px'
                }}>
                  <div>
                    <div style={{ fontSize: '0.80rem', fontWeight: 800, color: '#1e40af' }}>
                      Scan to Access Your Patient Portal &amp; Request Refills
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#334155', marginTop: '3px', maxWidth: '440px' }}>
                      Scan this QR code with your smartphone camera to view your digital dosage tracker, update your treating physician, or request a prescription renewal.
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#2563eb', fontFamily: 'monospace', marginTop: '4px' }}>
                      {patientQrUrl}
                    </div>
                  </div>

                  <div style={{
                    padding: '8px',
                    background: '#ffffff',
                    border: '1px solid #93c5fd',
                    borderRadius: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    flexShrink: 0
                  }}>
                    <QRCodeSVG
                      value={patientQrUrl}
                      size={100}
                      level="H"
                      includeMargin={false}
                    />
                    <span style={{ fontSize: '0.58rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>
                      Patient Portal QR
                    </span>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>

        {/* Footer Actions (Sticky on Mobile) */}
        <div className="gcp-brochure-footer">
          <div style={{ fontSize: '0.74rem', color: '#5f6368' }}>
            Document format: <strong>A4 Portrait (210 × 297 mm)</strong> · Vector Resolution
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {!isPatientView && onOpenLabels && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLabels();
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  height: '36px',
                  padding: '0 14px',
                  borderRadius: '4px',
                  background: '#ffffff',
                  border: '1px solid #dadce0',
                  color: '#1a73e8',
                  fontSize: '0.80rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Pill size={14} />
                <span>View Bottle Labels</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                height: '36px',
                padding: '0 18px',
                borderRadius: '4px',
                background: '#1a73e8',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 600,
                border: '1px solid #1a73e8',
                boxShadow: '0 1px 2px rgba(60,64,67,0.3)',
                cursor: 'pointer'
              }}
            >
              <Printer size={15} />
              <span>Print / Save as PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                height: '36px',
                padding: '0 14px',
                borderRadius: '4px',
                background: '#ffffff',
                border: '1px solid #dadce0',
                color: '#5f6368',
                fontSize: '0.80rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <span>Close</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
