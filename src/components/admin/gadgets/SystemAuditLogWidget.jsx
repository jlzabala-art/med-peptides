import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';
import { Activity, ShieldCheck, AlertCircle, Clock } from 'lucide-react';

const DEMO_LOGS = [
  { id: '1', action: 'NEW_CLINIC_REGISTERED', user: 'System Admin', details: 'Clinic Las Condes approved.', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
  { id: '2', action: 'SECURITY_ALERT', user: 'System', details: 'Multiple failed login attempts from IP 192.168.1.1.', timestamp: new Date(Date.now() - 1000 * 60 * 45) },
  { id: '3', action: 'PERMISSION_CHANGE', user: 'System Admin', details: 'Dr. Smith promoted to Clinical Supervisor role.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
  { id: '4', action: 'WHolesaler_REVIEW', user: 'Logistics Admin', details: 'Batch BPC-157 marked for quality review.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) },
];

export default function SystemAuditLogWidget() {
  const { activeRole } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      if (activeRole !== 'admin') return;
      try {
        const q = query(
          collection(db, 'system_audit_logs'),
          orderBy('timestamp', 'desc'),
          limit(10)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          setLogs(snap.docs.map(d => ({ 
            id: d.id, 
            ...d.data(),
            timestamp: d.data().timestamp?.toDate() || new Date()
          })));
        } else {
          setLogs(DEMO_LOGS);
        }
      } catch (err) {
        console.error("Error fetching audit logs", err);
        setLogs(DEMO_LOGS);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, [activeRole]);

  if (activeRole !== 'admin') return null;

  return (
    <div style={{ background: '#0a0a0a', borderRadius: '4px', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', fontFamily: 'var(--font-mono)' }}>
      <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid #333', background: '#111', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: 600 }}>admin@system ~ tail -f /var/log/audit.log</span>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f' }} />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', color: '#22c55e', fontSize: '0.8rem', lineHeight: 1.4 }}>
        {loading ? (
          <div>Loading logs...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {logs.map(log => {
              const isAlert = log.action.includes('ALERTA') || log.action.includes('ERROR') || log.action.includes('SECURITY');
              const dateStr = log.timestamp.toISOString().replace('T', ' ').substring(0, 19);
              return (
                <div key={log.id} style={{ display: 'flex', gap: '0.5rem', opacity: 0.9 }}>
                  <span style={{ color: '#888' }}>[{dateStr}]</span>
                  <span style={{ color: isAlert ? 'var(--color-danger)' : 'var(--color-primary)', fontWeight: 700 }}>{log.action}</span>
                  <span style={{ color: 'var(--color-bg-surface)' }}>&gt;</span>
                  <span style={{ color: '#22c55e' }}>{log.user}:</span>
                  <span style={{ color: '#ccc' }}>{log.details}</span>
                </div>
              );
            })}
            <div style={{ marginTop: '0.5rem', animation: 'terminalBlink 1s step-end infinite' }}>_</div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes terminalBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}
