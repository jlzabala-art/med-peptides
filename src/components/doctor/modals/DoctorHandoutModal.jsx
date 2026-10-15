"use client";

import React from 'react';
import { FileText, X, Printer, Copy, MessageCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { resolvePrescriptionParts } from '@/utils/clinical/clinicalFormulations';

export default function DoctorHandoutModal({
  isOpen,
  onClose,
  handoutRx,
  doctor,
  onShareWhatsApp
}) {
  if (!isOpen || !handoutRx) return null;

  const parts = resolvePrescriptionParts(handoutRx);

  const handleCopyText = () => {
    const partsText = parts.map(p => `• ${p.title}:\n  APIs: ${(p.apis || []).map(a => `${a.name} ${a.dose || ''}`).join(', ')}\n  Directions: ${p.posology || p.schedule || 'As directed'}`).join('\n\n');
    const handoutText = `📋 POSOLOGY HANDOUT\nPatient: ${handoutRx.patientName || 'Patient'}\nPhysician: ${doctor?.name || 'Treating Physician'}\nCode: #${handoutRx.code || handoutRx.prescriptionNumber || handoutRx.id}\n\n${partsText}`;
    navigator.clipboard?.writeText(handoutText);
    toast.success('Handout text copied to clipboard ✓');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1050,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '90vh',
          background: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.22)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #dadce0'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 20px',
            background: '#003666',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FileText size={18} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#ffffff' }}>
                Patient Posology & Administration Handout
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', opacity: 0.85 }}>
                Clinical compounding regimen for {handoutRx.patientName || 'Patient'} · Code #{handoutRx.code || handoutRx.prescriptionNumber}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#ffffff'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Patient & Clinic Metadata Card */}
          <div
            style={{
              padding: '12px 16px',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              fontSize: '12px'
            }}
          >
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '11px', fontWeight: 600 }}>PATIENT</span>
              <strong style={{ color: '#0f172a', fontSize: '13px' }}>{handoutRx.patientName || 'Patient'}</strong>
              {handoutRx.patient?.dob && <span style={{ color: '#64748b', display: 'block' }}>DOB: {handoutRx.patient.dob}</span>}
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '11px', fontWeight: 600 }}>PRESCRIBING PHYSICIAN</span>
              <strong style={{ color: '#0f172a' }}>{doctor?.name || 'Treating Physician'}</strong>
              <span style={{ color: '#64748b', display: 'block' }}>{doctor?.clinic || 'Specialized Clinic'}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '11px', fontWeight: 600 }}>PRESCRIPTION CODE</span>
              <strong style={{ color: '#1a73e8' }}>#{handoutRx.code || handoutRx.prescriptionNumber}</strong>
              <span style={{ color: '#64748b', display: 'block' }}>Date: {handoutRx.dateFormatted || handoutRx.date || 'Active'}</span>
            </div>
          </div>

          {/* Treatment Title */}
          {handoutRx.treatmentTitle && (
            <div style={{ padding: '10px 14px', background: '#eff6ff', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase' }}>Therapeutic Protocol:</span>
              <p style={{ margin: '2px 0 0 0', fontSize: '13px', fontWeight: 600, color: '#1e3a8a' }}>{handoutRx.treatmentTitle}</p>
            </div>
          )}

          {/* Formulation Parts / Phases */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {parts.map((part, pIdx) => (
              <div
                key={pIdx}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    padding: '10px 14px',
                    background: '#f1f5f9',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <strong style={{ fontSize: '13px', color: '#1e293b' }}>
                    {part.title || `Part ${pIdx + 1}`}
                  </strong>
                  {part.volume && (
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569', background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px' }}>
                      {part.volume}
                    </span>
                  )}
                </div>

                <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Active Ingredients in this part */}
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Active Ingredients (APIs):</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                      {(part.apis || []).map((api, aIdx) => (
                        <div
                          key={aIdx}
                          style={{
                            padding: '6px 10px',
                            background: '#f8fafc',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            fontSize: '12px'
                          }}
                        >
                          <strong style={{ color: '#0f172a' }}>{api.name}</strong>
                          {api.dose && <span style={{ color: '#1a73e8', fontWeight: 600, marginLeft: '6px' }}>({api.dose})</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Posology / Administration Instructions */}
                  {(part.posology || part.schedule) && (
                    <div style={{ padding: '10px', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>How to Take / Apply:</span>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#14532d', lineHeight: 1.45 }}>
                        {part.posology || part.schedule}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Safety Precautions Note */}
          <div style={{ padding: '10px 14px', background: '#fffbeb', borderRadius: '6px', border: '1px solid #fde68a', fontSize: '11.5px', color: '#92400e' }}>
            <strong>Important:</strong> Keep compounded medicines in a cool, dry place away from direct sunlight. Follow the exact posology prescribed by {doctor?.name || 'your physician'}. In case of any adverse reaction, discontinue use and contact your clinic immediately.
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div
          style={{
            padding: '12px 20px',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <button
            type="button"
            onClick={() => window.print()}
            style={{
              height: '36px',
              padding: '0 14px',
              borderRadius: '6px',
              border: '1px solid #dadce0',
              background: '#ffffff',
              color: '#3c4043',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Printer size={14} />
            <span>Print Handout</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handleCopyText}
              style={{
                height: '36px',
                padding: '0 14px',
                borderRadius: '6px',
                border: '1px solid #dadce0',
                background: '#ffffff',
                color: '#3c4043',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Copy size={14} />
              <span>Copy Text</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (onShareWhatsApp) onShareWhatsApp(handoutRx);
              }}
              style={{
                height: '36px',
                padding: '0 16px',
                borderRadius: '6px',
                border: 'none',
                background: '#16a34a',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <MessageCircle size={14} />
              <span>Share on WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
