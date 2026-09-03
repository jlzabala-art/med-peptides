"use client";
import React, { useState } from 'react';
import { Stethoscope, ShieldCheck, ArrowRight } from '@/lib/icons';
import MedicalSupervisionModal from './MedicalSupervisionModal';

export default function MedicalSupervisionBanner({ itemName, itemType = 'protocol', style = {} }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div 
        style={{
          background: 'linear-gradient(135deg, rgba(0, 54, 102, 0.04) 0%, rgba(2, 132, 199, 0.07) 100%)',
          border: '1px solid rgba(2, 132, 199, 0.2)',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          margin: '1.5rem 0',
          ...style
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 300px' }}>
          <div style={{
            width: 44, height: 44,
            borderRadius: '12px',
            background: 'rgba(2, 132, 199, 0.12)',
            color: '#0284c7',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>
            <Stethoscope size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Clinical Network
              </span>
            </div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Looking for Clinical Guidance or Prescription?
            </h4>
            <p style={{ margin: '0.15rem 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Connect with an affiliated physician to evaluate this {itemType} for your specific profile.
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '999px',
            background: 'var(--primary, #003666)',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.84rem',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0, 54, 102, 0.15)',
            transition: 'all 0.2s'
          }}
        >
          Request Doctor Review <ArrowRight size={14} />
        </button>
      </div>

      <MedicalSupervisionModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        itemName={itemName} 
        itemType={itemType} 
      />
    </>
  );
}
