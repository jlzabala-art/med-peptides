"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  X,
  ExternalLink,
  Tag,
  Copy,
  Calendar,
  Clock,
  CheckCircle2,
  Stethoscope,
  Pill,
  ShieldCheck,
  FileText,
  Loader2,
  ArrowUpRight,
  MessageCircle,
  Lock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import StatusBadge from '@/components/ui/StatusBadge';
import CopyableId from '@/components/ui/CopyableId';

export default function DoctorResourceInspectorDrawer({
  selectedInspectorItem,
  onClose,
  doctor,
  isAuthorizedViewer = false,
  opaqueCode = '',
  signingTaskId,
  onSignOffPrescription,
  onOpenLabelsModal,
  onShareProposalWhatsApp,
  onCopyProposalLink
}) {
  const [inspectorTab, setInspectorTab] = useState('dossier');

  if (!selectedInspectorItem) return null;

  const isTask = selectedInspectorItem.type === 'task';
  const item = selectedInspectorItem.data;
  const rx = isTask ? selectedInspectorItem.prescription : item;
  const rxCode = rx?.code || rx?.prescriptionNumber || item?.code || 'N/A';
  const rawPatientName = rx?.patientName || item?.patientName || 'Anonymous Patient';
  const cleanSuffix = String(rxCode).replace(/[^a-zA-Z0-9]/g, '');
  const codifiedPatientId = `PT-${cleanSuffix.length >= 4 ? cleanSuffix.slice(-4).toUpperCase() : '4512'}`;
  const patientName = isAuthorizedViewer ? rawPatientName : `Patient ${codifiedPatientId}`;

  // De-identify any prescription codes that contain patient name slugs
  const maskCode = (code, rawName) => {
    if (!code || code === 'N/A') return 'N/A';
    if (isAuthorizedViewer) return code;
    let clean = String(code);
    if (rawName && rawName !== 'Anonymous Patient') {
      const parts = rawName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().split(/\s+/).filter(p => p.length >= 2);
      for (const part of parts) {
        clean = clean.replace(new RegExp(`[-_]?${part}`, 'gi'), '');
      }
      clean = clean.replace(/[-_]+$/, '');
    }
    clean = clean.replace(/-(?:[a-z]{3,}-?)+$/i, '');
    return clean || `RX-${codifiedPatientId}`;
  };
  const safeRxCode = maskCode(rxCode, rawPatientName);

  const rawTitle = rx?.treatmentTitle || item?.title || 'Personalized Clinical Protocol';
  const treatmentTitle = String(rawTitle).replace(/\s*\(Propuesta de Tratamiento\)/gi, '').replace(/\s*\(Sin Pedido\)/gi, '').replace(/\s*\(Propuesta\)/gi, '').trim();
  const itemsList = rx?.items && rx.items.length > 0 ? rx.items : (rx?.prescriptionLines || []);
  const posology = rx?.posology || item?.description || 'Administer as directed by treating physician according to physiological circadian cycle.';
  const isProposal = rx?.status === 'proposal_pending' || rx?.isTreatmentProposal || rx?.orderStatus === 'Offer Not Accepted';
  const status = isProposal ? 'proposal_pending' : (rx?.status || (isTask ? item?.priority : 'active'));
  const createdDate = rx?.createdAt || rx?.createdDate ? new Date(rx.createdAt || rx.createdDate).toLocaleDateString() : 'Active Regimen';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        justifyContent: 'flex-end'
      }}
      onClick={onClose}
    >
      <aside
        style={{
          width: '100%',
          maxWidth: '480px',
          height: '100%',
          background: '#ffffff',
          boxShadow: '-6px 0 28px rgba(0,0,0,0.18)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Top Header (GCP Style) */}
        <div
          style={{
            padding: '16px 20px',
            background: '#f8fafc',
            borderBottom: '1px solid #dadce0',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              Clinical Registry · Resource Inspector
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                {isTask ? `Task: ${item.title}` : `Prescription #${safeRxCode}`}
              </h3>
              <CopyableId value={safeRxCode} iconOnly={true} />
            </div>
            <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <StatusBadge status={status} />
              {rx && (
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={11} /> {createdDate}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {rx && (
              <Link
                href={`/rx/${safeRxCode}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Open full monograph dossier in new tab"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '4px',
                  border: '1px solid #dadce0',
                  background: '#ffffff',
                  color: '#003666',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none'
                }}
              >
                <ExternalLink size={14} />
              </Link>
            )}
            {rx && onOpenLabelsModal && (
              <button
                type="button"
                onClick={() => onOpenLabelsModal(rx)}
                title="View prescription bottle labels"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '4px',
                  border: '1px solid #dadce0',
                  background: '#ffffff',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <Tag size={14} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              title="Close inspector"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '4px',
                border: 'none',
                background: 'transparent',
                color: '#5f6368',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Drawer GCP Subtabs Strip */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #e2e8f0',
            background: '#ffffff',
            padding: '0 16px',
            gap: '4px'
          }}
        >
          {[
            { id: 'dossier', label: 'Clinical Dossier', icon: FileText },
            { id: 'items', label: `Prescription Items (${itemsList.length || 1})`, icon: Pill },
            { id: 'dispensary', label: 'Quality & Tracking', icon: ShieldCheck }
          ].map((t) => {
            const Icon = t.icon;
            const isActive = inspectorTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setInspectorTab(t.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 12px',
                  border: 'none',
                  borderBottom: isActive ? '2px solid #003666' : '2px solid transparent',
                  background: 'transparent',
                  color: isActive ? '#003666' : '#64748b',
                  fontSize: '0.78rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.12s'
                }}
              >
                <Icon size={14} color={isActive ? '#003666' : '#64748b'} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Drawer Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {inspectorTab === 'dossier' && (
            <>
              {/* Clinical Task & Action Scheduling */}
              {isTask && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#003666', textTransform: 'uppercase' }}>
                      Clinical Action & Timeline
                    </span>
                    <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#1d4ed8', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={11} /> Timeline: {item.dueDate || 'Immediate'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '4px', lineHeight: 1.45 }}>
                    {item.description}
                  </div>
                </div>
              )}

              {/* Patient Information Card */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                    Patient Demographics & Record
                  </span>
                  {!isAuthorizedViewer && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.66rem',
                      fontWeight: 700,
                      color: '#b45309',
                      background: '#fffbeb',
                      border: '1px solid #fde68a',
                      padding: '2px 7px',
                      borderRadius: '12px'
                    }}>
                      <Lock size={10} />
                      <span>Protected</span>
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#0f172a' }}>
                  {patientName}
                </div>
                {isAuthorizedViewer && rx?.patient?.dob && (
                  <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                    DOB: {rx.patient.dob} {rx.patient?.gender ? `· ${rx.patient.gender}` : ''}
                  </div>
                )}
                {!isAuthorizedViewer && (
                  <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '3px' }}>
                    DHA/HIPAA Protected Clinical Dossier · Contact verified on file
                  </div>
                )}
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Canonical Ref:</span>
                  <CopyableId value={safeRxCode} />
                </div>
              </div>

              {/* Prescribing Doctor Information */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '14px 16px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Treating Physician
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#003666', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Stethoscope size={14} />
                  <span>{doctor?.name || 'Treating Physician'}</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '3px' }}>
                  {doctor?.specialty || 'Regenerative Medicine & Longevity'} · Lic: {doctor?.license || doctor?.licenseNumber || 'DHA-Licensed'}
                </div>
              </div>

              {/* Clinical Regimen Title & Posology */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '14px 16px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Regimen & Posology Schedule
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                  {treatmentTitle}
                </div>
                <div style={{ background: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: '6px', padding: '10px 12px', fontSize: '0.8rem', color: '#134e4a', lineHeight: 1.45 }}>
                  {posology}
                </div>
              </div>

              {/* Unaccepted Proposal / Patient Follow-up Block */}
              {isProposal && (
                <div style={{
                  background: '#fef7e0',
                  border: '1px solid #feefc3',
                  borderRadius: '6px',
                  padding: '16px'
                }}>
                  <div style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#b06000',
                    textTransform: 'uppercase',
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <Clock size={13} color="#b06000" />
                    <span>Clinical Treatment Proposal · Awaiting Patient</span>
                  </div>
                  <div style={{
                    fontSize: '0.82rem',
                    color: '#78350f',
                    lineHeight: 1.45,
                    marginBottom: '12px'
                  }}>
                    This personalized formulation was recommended by Dr. {doctor?.name || 'treating physician'}, but the patient has not yet confirmed or purchased the treatment order.
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => onShareProposalWhatsApp && onShareProposalWhatsApp(rx)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '10px 16px',
                        borderRadius: '4px',
                        background: '#25d366',
                        border: '1px solid #1ebc59',
                        color: '#ffffff',
                        fontSize: '0.82rem',
                        fontWeight: 650,
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(37,211,102,0.25)',
                        transition: 'all 0.12s'
                      }}
                    >
                      <MessageCircle size={15} style={{ color: '#ffffff' }} />
                      <span>WhatsApp Clinical Follow-up</span>
                    </button>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => onCopyProposalLink && onCopyProposalLink(rx)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: '4px',
                          background: '#ffffff',
                          border: '1px solid #dadce0',
                          color: '#1a73e8',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <Copy size={13} />
                        <span>Copy Link</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => onSignOffPrescription && onSignOffPrescription(rx, e)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: '4px',
                          background: '#003666',
                          border: '1px solid #002244',
                          color: '#ffffff',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <CheckCircle2 size={13} />
                        <span>Convert to Active Rx</span>
                      </button>
                    </div>
                    <div style={{ fontSize: '0.70rem', color: '#64748b', textAlign: 'center', lineHeight: 1.35 }}>
                      Patient can review posology, ingredients, and confirm payment directly from the shared link.
                    </div>
                  </div>
                </div>
              )}

              {/* Clinical Sign-off & Task Action Block */}
              {!isProposal && (isTask || (rx && ['pending', 'draft'].includes((rx.status || '').toLowerCase()))) && (() => {
                const targetEntity = isTask ? item : rx;
                const isSigned = targetEntity?.isSigned || targetEntity?.status === 'approved' || rx?.status === 'approved';
                const isSigning = signingTaskId === (targetEntity?.id || targetEntity?.code || rx?.code);

                return (
                  <div style={{
                    background: isSigned ? '#f0fdf4' : '#fffbeb',
                    border: `1px solid ${isSigned ? '#bbf7d0' : '#fde68a'}`,
                    borderRadius: '6px',
                    padding: '16px'
                  }}>
                    <div style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: isSigned ? '#166534' : '#92400e',
                      textTransform: 'uppercase',
                      marginBottom: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      {isSigned ? (
                        <>
                          <CheckCircle2 size={13} color="#16a34a" />
                          <span>Clinical Dispensing Authorized & Signed</span>
                        </>
                      ) : (
                        <>
                          <Clock size={13} color="#b45309" />
                          <span>Pending Physician Clinical Authorization</span>
                        </>
                      )}
                    </div>
                    <div style={{
                      fontSize: '0.82rem',
                      color: isSigned ? '#14532d' : '#78350f',
                      lineHeight: 1.45,
                      marginBottom: '12px'
                    }}>
                      {isSigned
                        ? `Prescription digitally authorized by ${doctor?.name || 'Treating Physician'} for compounding and release.`
                        : (item?.description || `Compounded prescription awaiting physician electronic sign-off.`)}
                    </div>

                    {!isSigned ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button
                          type="button"
                          disabled={isSigning}
                          onClick={(e) => onSignOffPrescription && onSignOffPrescription(targetEntity, e)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            width: '100%',
                            padding: '10px 16px',
                            borderRadius: '4px',
                            background: '#003666',
                            border: '1px solid #002244',
                            color: '#ffffff',
                            fontSize: '0.82rem',
                            fontWeight: 650,
                            cursor: isSigning ? 'wait' : 'pointer',
                            boxShadow: '0 1px 3px rgba(0,54,102,0.25)',
                            transition: 'all 0.12s'
                          }}
                        >
                          {isSigning ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              <span>Authorizing & Signing...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={15} style={{ color: '#38bdf8' }} />
                              <span>Authorize & Sign Dispensing Order</span>
                            </>
                          )}
                        </button>
                        <div style={{ fontSize: '0.70rem', color: '#64748b', textAlign: 'center', lineHeight: 1.35 }}>
                          Electronically verifies patient posology, API tolerance, and authorizes compounding batch release.
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <CheckCircle2 size={14} /> Signed & Approved
                        </span>
                        <Link
                          href={`/rx/${safeRxCode}`}
                          target="_blank"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            color: '#003666',
                            textDecoration: 'none'
                          }}
                        >
                          <span>Official Pad</span>
                          <ArrowUpRight size={12} />
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })()}
            </>
          )}

          {inspectorTab === 'items' && (
            <>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                Active Compounded Ingredients & Prescription Items ({itemsList.length || 1})
              </div>
              {itemsList.length === 0 ? (
                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '6px', fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>
                  Custom personalized prescription regimen under clinical review.
                </div>
              ) : (
                itemsList.map((it, idx) => (
                  <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#0f172a' }}>{it.name}</span>
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0d9488', background: '#f0fdf4', padding: '2px 8px', borderRadius: '4px', border: '1px solid #bbf7d0' }}>
                        {it.dose || it.vehicle || 'Pharmaceutical Grade'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', lineHeight: 1.35 }}>
                      Vehicle / Base: {it.vehicle || 'Micronized Plant-Based HPMC Capsules (Acid-Resistant)'}
                    </div>
                    <div style={{ marginTop: '6px', fontSize: '0.70rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={11} /> EU GMP Verified Active API
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {inspectorTab === 'dispensary' && (
            <>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '14px 16px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Laboratory & Dispensary Verification
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#003666', marginBottom: '4px' }}>
                  EU GMP Certified Cleanroom Dispensary
                </div>
                <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748b', lineHeight: 1.4 }}>
                  Formulated under ISO Class 5 Laminar Airflow with HPLC purity certification by Atlas Certified Compounding Solutions.
                </p>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '14px 16px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Patient Access & Security
                </div>
                <p style={{ margin: '0 0 10px 0', fontSize: '0.76rem', color: '#475569', lineHeight: 1.4 }}>
                  Digital clinical dossier is protected by codified access token. Patients can verify authenticity and dosage guidelines directly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/rx/${safeRxCode}?view=patient`;
                    navigator.clipboard?.writeText(url);
                    toast.success('Patient direct link copied ✓');
                  }}
                  style={{
                    height: '32px',
                    padding: '0 12px',
                    borderRadius: '4px',
                    border: '1px solid #dadce0',
                    background: '#ffffff',
                    color: '#003666',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Copy size={13} />
                  <span>Copy Patient View Link</span>
                </button>
              </div>

              {rx && onOpenLabelsModal && (
                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '6px', padding: '14px 16px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Prescription Bottle Label
                  </div>
                  <p style={{ margin: '0 0 10px 0', fontSize: '0.76rem', color: '#0c4a6e', lineHeight: 1.4 }}>
                    Direct access to vector print templates formatted for amber pharmaceutical bottles.
                  </p>
                  <button
                    type="button"
                    onClick={() => onOpenLabelsModal(rx)}
                    style={{
                      height: '32px',
                      padding: '0 12px',
                      borderRadius: '4px',
                      border: 'none',
                      background: '#0284c7',
                      color: '#ffffff',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Tag size={13} />
                    <span>Open Bottle Labels Modal</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Drawer Bottom Action Bar */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid #dadce0',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              height: '34px',
              padding: '0 14px',
              borderRadius: '4px',
              border: '1px solid #dadce0',
              background: '#ffffff',
              color: '#3c4043',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Close
          </button>

          {rx && (
            <Link
              href={`/rx/${safeRxCode}`}
              style={{
                height: '34px',
                padding: '0 16px',
                borderRadius: '4px',
                background: '#003666',
                color: '#ffffff',
                fontSize: '0.78rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                textDecoration: 'none'
              }}
            >
              <span>Open Full Monograph</span>
              <ArrowUpRight size={13} />
            </Link>
          )}
        </div>
      </aside>
    </div>
  );
}
