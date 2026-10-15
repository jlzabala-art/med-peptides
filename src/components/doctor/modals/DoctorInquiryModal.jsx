"use client";

import React from 'react';
import { X, Sparkles, MessageCircle } from 'lucide-react';

export default function DoctorInquiryModal({
  isOpen,
  onClose,
  doctor,
  inquiryPeptide,
  onOpenIntake,
  onContactWhatsApp
}) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 65,
        background: 'rgba(32, 33, 36, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '500px',
          maxWidth: '100%',
          background: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #dadce0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
              Clinical Protocol Consultation
            </h3>
            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
              Attributed to {doctor?.name || 'Physician'}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#5f6368', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          {inquiryPeptide && (
            <div style={{ padding: '10px 14px', background: '#e0f2fe', borderRadius: '6px', marginBottom: '14px', fontSize: '0.80rem', color: '#0369a1', fontWeight: 600 }}>
              Selected Principle: {inquiryPeptide.name} ({inquiryPeptide.purity || '≥ 99% HPLC'})
            </div>
          )}
          <p style={{ margin: '0 0 16px 0', fontSize: '0.80rem', color: '#475569', lineHeight: 1.5 }}>
            To integrate this active pharmaceutical ingredient into a customized medical protocol, you can initiate a digital prescription intake or schedule a clinical review.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenIntake) onOpenIntake();
              }}
              style={{
                height: '40px',
                borderRadius: '6px',
                border: '1px solid #1a73e8',
                background: '#1a73e8',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Sparkles size={15} />
              <span>Submit Digital Prescription with AI</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (onContactWhatsApp) {
                  onContactWhatsApp(
                    inquiryPeptide ? `Compounding Consultation: ${inquiryPeptide.name}` : 'Clinical Consultation',
                    inquiryPeptide ? `Inquiring about integrating ${inquiryPeptide.name} into custom prescription protocol.` : ''
                  );
                }
                onClose();
              }}
              style={{
                height: '40px',
                borderRadius: '6px',
                border: '1px solid #bbf7d0',
                background: '#f0fdf4',
                color: '#15803d',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <MessageCircle size={15} color="#16a34a" />
              <span>Inquire via Clinical WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
