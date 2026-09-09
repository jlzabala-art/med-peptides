"use client";

import React, { useState, useEffect } from 'react';
import Bot from "lucide-react/dist/esm/icons/bot";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import Activity from "lucide-react/dist/esm/icons/activity";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import notifier from '../../services/NotificationService';

export default function PatientAdherenceWidget({ doctorId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchAdherence = async () => {
      setLoading(true);
      try {
        let q = query(collection(db, 'prescriptions'), limit(30));
        if (doctorId) {
          q = query(collection(db, 'prescriptions'), where('doctorId', '==', doctorId), limit(30));
        }
        const snap = await getDocs(q);
        if (isMounted) {
          const atRisk = [];
          snap.docs.forEach(doc => {
            const d = doc.data();
            const adherence = d.adherenceScore ?? d.adherence ?? 100;
            const daysLeft = d.refillDaysLeft ?? 14;
            const isLate = daysLeft <= 0;
            const isLowScore = adherence < 85;

            if (isLate || isLowScore) {
              atRisk.push({
                id: doc.id,
                name: d.patientName || 'Patient',
                protocol: Array.isArray(d.items) 
                  ? d.items.map(i => i.productName || i.name).join(' + ') 
                  : (d.protocolName || 'Active Protocol'),
                adherenceScore: adherence,
                riskLevel: adherence < 70 || daysLeft <= -7 ? 'High' : 'Medium',
                reason: isLate 
                  ? `Refill window expired ${Math.abs(daysLeft)} days ago.` 
                  : `Reported adherence score dropped to ${adherence}%.`,
                suggestedAction: isLate 
                  ? 'Send automated refill notification and check-in prompt.' 
                  : 'Schedule follow-up consultation to evaluate dosage tolerance.',
              });
            }
          });
          setData(atRisk);
        }
      } catch (err) {
        console.error('Error loading patient adherence:', err);
        if (isMounted) setData([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchAdherence();
    return () => { isMounted = false; };
  }, [doctorId]);

  if (loading) {
    return (
      <div style={{ backgroundColor: 'var(--color-bg-surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--color-border)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <Activity size={20} color="var(--color-text-tertiary)" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-tertiary)' }}>Analyzing Patient Adherence...</h2>
        </div>
        <div style={{ height: '100px', backgroundColor: 'var(--color-bg-elevated)', borderRadius: '8px', animation: 'pulse 2s infinite' }}></div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--color-bg-surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)', padding: '0.5rem', borderRadius: '8px', color: 'white' }}>
            <Activity size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>AI Adherence Watchlist</h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Patients at risk of protocol drop-off or missed refills</p>
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <div style={{ padding: '1.5rem', textAlign: 'center', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={32} color="#16a34a" />
          <strong style={{ color: '#15803d', fontSize: '0.95rem' }}>Optimal Protocol Adherence</strong>
          <span style={{ color: '#166534', fontSize: '0.8rem' }}>All active patients are currently within their expected refill and protocol adherence windows.</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {data.map((patient) => (
            <div key={patient.id} style={{ padding: '1rem', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: patient.riskLevel === 'High' ? '#ef4444' : '#f59e0b' }}></div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div>
                  <strong style={{ fontSize: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {patient.name}
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '0.1rem 0.5rem', borderRadius: '12px', backgroundColor: patient.riskLevel === 'High' ? '#fef2f2' : '#fffbeb', color: patient.riskLevel === 'High' ? '#ef4444' : '#d97706', border: `1px solid ${patient.riskLevel === 'High' ? '#fecaca' : '#fde68a'}` }}>
                      Score: {patient.adherenceScore}/100
                    </span>
                  </strong>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>{patient.protocol}</div>
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', color: '#334155', marginBottom: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <AlertTriangle size={14} color={patient.riskLevel === 'High' ? '#ef4444' : '#f59e0b'} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{patient.reason}</span>
              </div>

              <div style={{ backgroundColor: '#f1f5f9', padding: '0.75rem', borderRadius: '6px', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Bot size={16} color="#6366f1" />
                <span style={{ fontSize: '0.85rem', color: '#0f172a' }}><strong>AI Suggestion:</strong> {patient.suggestedAction}</span>
              </div>
              
              <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => notifier.info(`Follow-up notification initiated for ${patient.name}`)}
                  style={{ fontSize: '0.8rem', fontWeight: 600, color: 'white', backgroundColor: '#0f172a', border: 'none', padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Take Action
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
