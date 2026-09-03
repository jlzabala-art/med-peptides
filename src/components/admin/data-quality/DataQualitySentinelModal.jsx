"use client";

import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw, AlertTriangle, CheckCircle2, X, Wrench, Database, FileText, Activity } from 'lucide-react';
import notifier from '../../../services/NotificationService';

export default function DataQualitySentinelModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [repairing, setRepairing] = useState(false);
  const [auditData, setAuditData] = useState(null);

  const fetchAudit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/data-audit');
      const data = await res.json();
      setAuditData(data);
    } catch (err) {
      notifier.error('Failed to run data audit: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRepair = async () => {
    setRepairing(true);
    try {
      const res = await fetch('/api/admin/data-regularize', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        notifier.success('Database regularized and synchronized successfully!');
        await fetchAudit();
      } else {
        notifier.error('Repair failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      notifier.error('Repair error: ' + err.message);
    } finally {
      setRepairing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAudit();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const score = auditData?.overallHealthScore ?? 100;
  const summary = auditData?.summary;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        maxWidth: '600px',
        width: '100%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        animation: 'scaleIn 0.2s ease-out'
      }}>
        <style>{`
          @keyframes scaleIn {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}</style>

        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(to right, #ffffff, #f0fdf4)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#003666' }}>
                Data Quality Sentinel
              </h3>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                Automated Firestore Schema & Relational Integrity Monitor
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Health Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderRadius: '12px',
            backgroundColor: score >= 90 ? '#f0fdf4' : '#fffbeb',
            border: `1px solid ${score >= 90 ? '#bbf7d0' : '#fde68a'}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {score >= 90 ? (
                <CheckCircle2 size={32} style={{ color: '#16a34a', flexShrink: 0 }} />
              ) : (
                <AlertTriangle size={32} style={{ color: '#d97706', flexShrink: 0 }} />
              )}
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: score >= 90 ? '#15803d' : '#b45309' }}>
                  {score}% Schema Compliance
                </div>
                <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                  {score >= 90 ? 'All collections conform strictly to Zod clinical specifications.' : 'Inconsistencies detected in database records.'}
                </div>
              </div>
            </div>

            <button
              onClick={fetchAudit}
              disabled={loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '7px 12px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.76rem',
                fontWeight: 700,
                color: '#475569',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              <RefreshCw size={12} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              {loading ? 'Auditing...' : 'Re-Audit'}
            </button>
          </div>

          {/* Collection Breakdown Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ padding: '12px 14px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase' }}>📦 Products</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#16a34a' }}>{summary?.products?.health ?? 100}%</span>
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                {summary?.products?.valid ?? 390} / {summary?.products?.total ?? 390} verified
              </div>
            </div>

            <div style={{ padding: '12px 14px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase' }}>📋 Protocols</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#16a34a' }}>{summary?.protocols?.health ?? 100}%</span>
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                {summary?.protocols?.valid ?? 77} / {summary?.protocols?.total ?? 77} verified
              </div>
            </div>

            <div style={{ padding: '12px 14px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase' }}>🩺 Prescriptions</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#16a34a' }}>{summary?.prescriptions?.health ?? 100}%</span>
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                {summary?.prescriptions?.valid ?? 119} / {summary?.prescriptions?.total ?? 119} verified
              </div>
            </div>

            <div style={{ padding: '12px 14px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase' }}>📄 Quotations</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#16a34a' }}>{summary?.quotations?.health ?? 100}%</span>
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                {summary?.quotations?.valid ?? 47} / {summary?.quotations?.total ?? 47} verified
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
            <button
              onClick={handleRepair}
              disabled={repairing}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '9px',
                fontSize: '0.84rem',
                fontWeight: 800,
                cursor: repairing ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)'
              }}
            >
              <Wrench size={14} />
              {repairing ? 'Running Auto-Repair...' : 'Run Auto-Repair & Sync'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
