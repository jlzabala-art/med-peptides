'use client';

import React from 'react';
import Stethoscope from 'lucide-react/dist/esm/icons/stethoscope';
import Plus from 'lucide-react/dist/esm/icons/plus';
import UserPlus from 'lucide-react/dist/esm/icons/user-plus';
import Pill from 'lucide-react/dist/esm/icons/pill';
import FlaskConical from 'lucide-react/dist/esm/icons/flask-conical';
import MessageSquare from 'lucide-react/dist/esm/icons/message-square';
import CopyableId from '../../ui/CopyableId';

export default function DoctorCockpitHeader({
  doctorMeta,
  isSimulatingDrErdmann,
  doctorId,
  showBuilder,
  setShowBuilder,
  onNavigate,
}) {
  return (
    <div
      style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #003666 0%, #002244 100%)',
        borderRadius: '14px',
        padding: '1.25rem 1.4rem',
        color: '#ffffff',
        boxShadow: '0 4px 20px rgba(0, 54, 102, 0.22)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        border: '1px solid rgba(255, 255, 255, 0.12)',
      }}
    >
      <style>{`
        @keyframes gcpPulseBeaconOverview {
          0% { transform: scale(0.95); opacity: 0.9; box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.6); }
          70% { transform: scale(1.1); opacity: 1; box-shadow: 0 0 0 7px rgba(34, 197, 94, 0); }
          100% { transform: scale(0.95); opacity: 0.9; box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
              flexShrink: 0,
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <Stethoscope size={26} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0, letterSpacing: '-0.01em', color: '#ffffff' }}>
                {isSimulatingDrErdmann 
                  ? 'Dr. Hanieh Erdmann • Practice Cockpit' 
                  : (doctorMeta?.name ? `${doctorMeta.name} • Practice Cockpit` : 'Clinical Practice Cockpit')}
              </h2>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '2px 8px', borderRadius: '12px', backgroundColor: 'rgba(34, 197, 94, 0.16)', border: '1px solid rgba(34, 197, 94, 0.35)', fontSize: '0.72rem', color: '#4ade80', fontWeight: 700 }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#22c55e', animation: 'gcpPulseBeaconOverview 2s infinite' }} />
                <span>Realtime Sync ✓</span>
              </div>
            </div>

            {/* Physician Credential & Facility Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Lic: <CopyableId value={isSimulatingDrErdmann ? 'DHA-00013060-006' : (doctorId || 'DOC-ACTIVE')} />
              </span>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>•</span>
              <span style={{ fontSize: '0.75rem', color: '#93c5fd', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                🏥 {isSimulatingDrErdmann ? 'Bedaya Polyclinic L.L.C.' : 'Specialist Clinical Practice'}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>•</span>
              <span style={{ fontSize: '0.70rem', color: '#86efac', backgroundColor: 'rgba(34, 197, 94, 0.15)', padding: '1px 6px', borderRadius: '4px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                🟢 DHA Regulated Practice (UAE)
              </span>
              <span style={{ fontSize: '0.70rem', color: '#cbd5e1', backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '1px 6px', borderRadius: '4px' }}>
                Latency 14ms
              </span>
            </div>
          </div>
        </div>

        {/* Primary CTA: New Prescription */}
        <button
          type="button"
          onClick={() => setShowBuilder(!showBuilder)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            minHeight: '44px',
            borderRadius: '8px',
            backgroundColor: showBuilder ? '#ffffff' : '#0d9488',
            color: showBuilder ? '#003666' : '#ffffff',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            transition: 'all 0.15s ease',
            flexShrink: 0,
          }}
        >
          <Plus size={16} />
          <span>{showBuilder ? 'Close Rx Form' : 'New Prescription'}</span>
        </button>
      </div>

      {/* Quick Launch Clinical Action Chips */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '2px',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('open-quick-create', { detail: { type: 'new-patient' } }));
            }
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            minHeight: '40px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.22)',
            color: '#ffffff',
            fontSize: '0.8125rem',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          <UserPlus size={15} />
          <span>Intake Patient</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate?.('catalog')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 16px',
            minHeight: '44px',
            borderRadius: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.14)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: '#ffffff',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          <Pill size={15} />
          <span>Lotusland Formulary</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate?.('protocols')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 16px',
            minHeight: '44px',
            borderRadius: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.14)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: '#ffffff',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          <FlaskConical size={15} />
          <span>Clinical Protocols</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate?.('messages')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 16px',
            minHeight: '44px',
            borderRadius: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.14)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: '#ffffff',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          <MessageSquare size={15} />
          <span>Patient Inquiries</span>
        </button>
      </div>
    </div>
  );
}
