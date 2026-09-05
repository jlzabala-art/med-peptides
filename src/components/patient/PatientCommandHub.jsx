'use client';

import React, { useState, useEffect } from 'react';
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2';
import Pill from 'lucide-react/dist/esm/icons/pill';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import Truck from 'lucide-react/dist/esm/icons/truck';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import HeartPulse from 'lucide-react/dist/esm/icons/heart-pulse';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import UploadCloud from 'lucide-react/dist/esm/icons/upload-cloud';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import MessageSquare from 'lucide-react/dist/esm/icons/message-square';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';

import notifier from '../../services/NotificationService';
import { fetchPortalDashboardDataAction } from '../../actions/portalDashboardActions';

export default function PatientCommandHub({ userId = null, initialData = null }) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [doseTaken, setDoseTaken] = useState(false);
  const [refillRequested, setRefillRequested] = useState(false);
  const [showMonograph, setShowMonograph] = useState(false);

  useEffect(() => {
    if (initialData) return;
    async function load() {
      const res = await fetchPortalDashboardDataAction('patient', userId);
      setData(res);
      setLoading(false);
    }
    load();
  }, [userId, initialData]);

  const handleMarkDose = () => {
    setDoseTaken(true);
    notifier.success('Today’s dose logged successfully! Medical team notified.');
  };

  const handleRequestRefill = () => {
    setRefillRequested(true);
    notifier.success('Refill request sent to your prescribing physician!');
  };

  const regimen = data?.regimen || {
    peptideName: 'BPC-157 5mg + TB-500 5mg Blend',
    dosage: '250 mcg daily (0.1 ml / 10 units)',
    format: 'Reconstituted Subcutaneous Vial',
    currentWeek: 4,
    totalWeeks: 8,
    reconstitutionNotes: 'Keep refrigerated at 2°C – 8°C. Do not freeze.',
  };

  const delivery = data?.delivery || {
    orderId: 'ORD-99321',
    status: 'In Transit',
    courier: 'DHL Express',
    trackingCode: 'DHL-7740192',
    estimatedDelivery: 'Tomorrow by 14:00',
  };

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)',
        borderRadius: '16px',
        padding: '1.25rem 1.5rem',
        color: '#ffffff',
        boxShadow: '0 4px 20px rgba(124, 58, 237, 0.25)',
        marginBottom: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.18)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f0abfc',
            }}
          >
            <HeartPulse size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 900, margin: 0, letterSpacing: '-0.01em', color: '#ffffff' }}>
              My Patient Treatment Hub
            </h2>
            <span style={{ fontSize: '0.78rem', color: '#e9d5ff', fontWeight: 500 }}>
              Daily Dosage Tracker • Prescription Refills • Delivery Tracking
            </span>
          </div>
        </div>

        {/* Today's Dose Badge Action */}
        <button
          onClick={handleMarkDose}
          disabled={doseTaken}
          style={{
            padding: '8px 14px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: doseTaken ? '#10b981' : '#ffffff',
            color: doseTaken ? '#ffffff' : '#5b21b6',
            fontSize: '0.82rem',
            fontWeight: 800,
            cursor: doseTaken ? 'default' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{doseTaken ? 'Dose Logged ✓' : 'Mark Today’s Dose Taken'}</span>
        </button>
      </div>

      {/* Quick Launch Mobile Action Bar */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <button
          type="button"
          onClick={handleRequestRefill}
          disabled={refillRequested}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 12px',
            borderRadius: '8px',
            backgroundColor: refillRequested ? '#10b981' : 'rgba(255, 255, 255, 0.18)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: '#ffffff',
            fontSize: '0.78rem',
            fontWeight: 800,
            cursor: refillRequested ? 'default' : 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <RefreshCw size={14} />
          <span>{refillRequested ? 'Refill Requested ✓' : 'Request Rx Refill'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            notifier.info(`Live tracking for ${delivery.trackingCode}: ${delivery.status} (${delivery.estimatedDelivery})`);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 12px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.14)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: '#ffffff',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <Truck size={14} />
          <span>Track Delivery ({delivery.status})</span>
        </button>

        <button
          type="button"
          onClick={() => setShowMonograph(!showMonograph)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 12px',
            borderRadius: '8px',
            backgroundColor: showMonograph ? '#ffffff' : 'rgba(255, 255, 255, 0.14)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: showMonograph ? '#5b21b6' : '#ffffff',
            fontSize: '0.78rem',
            fontWeight: 800,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <FileText size={14} />
          <span>Treatment Monograph</span>
        </button>

        <button
          type="button"
          onClick={() => {
            notifier.info('Opening Bloodwork PDF Uploader...');
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 12px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.14)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: '#ffffff',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <UploadCloud size={14} />
          <span>Upload Lab Results</span>
        </button>
      </div>

      {/* Expanded Monograph Quick Modal Card */}
      {showMonograph && (
        <div style={{ backgroundColor: '#ffffff', color: '#0f172a', padding: '1rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#5b21b6', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} /> Clinical Treatment Monograph
            </span>
            <button type="button" onClick={() => setShowMonograph(false)} style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', fontWeight: 800 }}>✕</button>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div><strong>Active Compound:</strong> {regimen.peptideName}</div>
            <div><strong>Dosage Schedule:</strong> {regimen.dosage}</div>
            <div><strong>Presentation:</strong> {regimen.format}</div>
            <div style={{ color: '#0369a1', backgroundColor: '#f0f9ff', padding: '6px 8px', borderRadius: '6px', marginTop: '4px', fontSize: '0.75rem', border: '1px solid #bae6fd' }}>
              ❄️ <strong>Storage Guidance:</strong> {regimen.reconstitutionNotes}
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Active Treatment & Order Tracking Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
        {/* Active Regimen Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            color: '#0f172a',
            padding: '1rem',
            borderRadius: '12px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase' }}>
              Current Regimen (Week {regimen.currentWeek} of {regimen.totalWeeks})
            </span>
            <span style={{ padding: '2px 8px', borderRadius: '10px', backgroundColor: '#f3e8ff', color: '#6d28d9', fontSize: '0.7rem', fontWeight: 800 }}>
              Active
            </span>
          </div>
          <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
            {regimen.peptideName}
          </h4>
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
            Dose: <strong>{regimen.dosage}</strong>
          </p>

          {/* Progress Bar */}
          <div style={{ marginTop: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#6d28d9', marginBottom: '0.25rem' }}>
              <span>Cycle Progress</span>
              <span>50% Complete</span>
            </div>
            <div style={{ height: '6px', backgroundColor: '#f3e8ff', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: '50%', height: '100%', backgroundColor: '#7c3aed' }} />
            </div>
          </div>
        </div>

        {/* Prescription Refill Alert Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            color: '#0f172a',
            padding: '1rem',
            borderRadius: '12px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#c2410c', textTransform: 'uppercase' }}>
              Refill Reminder
            </span>
            <span style={{ padding: '2px 8px', borderRadius: '10px', backgroundColor: '#ffedd5', color: '#c2410c', fontSize: '0.7rem', fontWeight: 800 }}>
              5 Days Supply Remaining
            </span>
          </div>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.78rem', color: '#475569', lineHeight: 1.3 }}>
            Your current vial has 5 days of medication left. Request a doctor refill to prevent gaps.
          </p>
          <button
            onClick={handleRequestRefill}
            disabled={refillRequested}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '7px',
              backgroundColor: refillRequested ? '#10b981' : '#ea580c',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: refillRequested ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
            }}
          >
            <RefreshCw size={14} />
            <span>{refillRequested ? 'Refill Requested ✓' : 'Request Doctor Refill'}</span>
          </button>
        </div>

        {/* Live Delivery Status Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            color: '#0f172a',
            padding: '1rem',
            borderRadius: '12px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>
              Live Order Delivery
            </span>
            <span style={{ padding: '2px 8px', borderRadius: '10px', backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '0.7rem', fontWeight: 800 }}>
              {delivery.status}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Truck size={17} color="#0284c7" />
            <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>{delivery.orderId}</strong>
          </div>
          <p style={{ margin: 0, fontSize: '0.76rem', color: '#475569' }}>
            Courier: <strong>{delivery.courier}</strong> ({delivery.trackingCode})
          </p>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.74rem', color: '#0284c7', fontWeight: 700 }}>
            ETA: {delivery.estimatedDelivery}
          </p>
        </div>
      </div>
    </div>
  );
}
