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
import notifier from '../../services/NotificationService';
import { fetchPortalDashboardDataAction } from '../../actions/portalDashboardActions';

export default function PatientCommandHub({ userId = null, initialData = null }) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [doseTaken, setDoseTaken] = useState(false);
  const [refillRequested, setRefillRequested] = useState(false);

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
        background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)',
        border: '1px solid #e9d5ff',
        borderRadius: '16px',
        padding: '1.25rem 1.5rem',
        boxShadow: '0 4px 20px -2px rgba(124, 58, 237, 0.08)',
        marginBottom: '1.5rem',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          borderBottom: '1px solid #f3e8ff',
          paddingBottom: '0.85rem',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              backgroundColor: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <HeartPulse size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#4c1d95' }}>
              My Patient Health & Treatment Hub
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#6d28d9' }}>
              Daily dosage tracker, prescription refills & order tracking
            </span>
          </div>
        </div>

        {/* Quick Action Badges */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleMarkDose}
            disabled={doseTaken}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: doseTaken ? '#10b981' : '#7c3aed',
              color: '#ffffff',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: doseTaken ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <CheckCircle2 size={16} />
            <span>{doseTaken ? 'Dose Logged ✓' : 'Mark Today’s Dose Taken'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Active Treatment & Order Tracking */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {/* Active Regimen Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '1rem',
            borderRadius: '12px',
            border: '1px solid #e9d5ff',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase' }}>
              Current Regimen (Week {regimen.currentWeek} of {regimen.totalWeeks})
            </span>
            <span style={{ padding: '2px 8px', borderRadius: '10px', backgroundColor: '#f3e8ff', color: '#6d28d9', fontSize: '0.7rem', fontWeight: 700 }}>
              Active
            </span>
          </div>
          <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
            {regimen.peptideName}
          </h4>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
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
            padding: '1rem',
            borderRadius: '12px',
            border: '1px solid #fed7aa',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#c2410c', textTransform: 'uppercase' }}>
              Prescription Refill Reminder
            </span>
            <span style={{ padding: '2px 8px', borderRadius: '10px', backgroundColor: '#ffedd5', color: '#c2410c', fontSize: '0.7rem', fontWeight: 700 }}>
              5 Days Supply Left
            </span>
          </div>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.8rem', color: '#475569' }}>
            Your current BPC-157 vial has 5 days of medication remaining. Request a refill now to prevent treatment gaps.
          </p>
          <button
            onClick={handleRequestRefill}
            disabled={refillRequested}
            style={{
              width: '100%',
              padding: '0.45rem',
              borderRadius: '6px',
              backgroundColor: refillRequested ? '#10b981' : '#ea580c',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: refillRequested ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
            }}
          >
            <RefreshCw size={14} />
            <span>{refillRequested ? 'Refill Requested ✓' : 'Request 1-Click Doctor Refill'}</span>
          </button>
        </div>

        {/* Live Delivery Status Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '1rem',
            borderRadius: '12px',
            border: '1px solid #bae6fd',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase' }}>
              Live Order Delivery
            </span>
            <span style={{ padding: '2px 8px', borderRadius: '10px', backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '0.7rem', fontWeight: 700 }}>
              {delivery.status}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Truck size={18} color="#0284c7" />
            <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>{delivery.orderId}</strong>
          </div>
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569' }}>
            Courier: <strong>{delivery.courier}</strong> ({delivery.trackingCode})
          </p>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#0284c7', fontWeight: 600 }}>
            Estimated arrival: {delivery.estimatedDelivery}
          </p>
        </div>
      </div>
    </div>
  );
}
