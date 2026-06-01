import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, GitCommit, Database, Clock, Terminal, Activity, ShieldCheck, HardDriveDownload, Server, Calendar as CalendarIcon, CheckCircle, XCircle } from 'lucide-react';
import { db, functions } from '../../firebase';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

export default function AdminDeployHostingTab() {
  const [isDeploying, setIsDeploying] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backups, setBackups] = useState([]);
  const [loadingBackups, setLoadingBackups] = useState(true);

  const fetchBackups = async () => {
    setLoadingBackups(true);
    try {
      const q = query(collection(db, 'system_backups'), orderBy('timestamp', 'desc'), limit(15));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBackups(data);
    } catch (err) {
      console.error("Error fetching backups", err);
    } finally {
      setLoadingBackups(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleManualBackup = async () => {
    setIsBackingUp(true);
    try {
      const triggerBackup = httpsCallable(functions, 'triggerManualBackup');
      await triggerBackup();
      // Wait a moment and refresh the list
      setTimeout(fetchBackups, 2000);
    } catch (err) {
      console.error("Error triggering backup", err);
      alert("Error triggering backup. Check console for details.");
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleDeploy = () => {
    setIsDeploying(true);
    setTimeout(() => setIsDeploying(false), 3000); // Simulate deployment
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', color: 'var(--text-primary)' }}>
      <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Server size={28} color="var(--color-primary)" />
          Deploy & Hosting
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
          Manage your Git repository, monitor automated backups, and trigger new deployments.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* GIT REPOSITORY CARD */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid var(--border-light)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '8px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', color: '#3b82f6' }}>
              <GitBranch size={20} />
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Version Control</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)' }}>Active Branch</span>
              <span style={{ fontWeight: 600, backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>main</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)' }}>Last Commit</span>
              <span style={{ fontFamily: 'monospace', color: '#3b82f6' }}>a7f83b2</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)' }}>Status</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontWeight: 600 }}>
                <ShieldCheck size={14} /> Up to date
              </span>
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <button
              onClick={handleDeploy}
              disabled={isDeploying}
              style={{
                width: '100%', padding: '0.75rem', borderRadius: '8px', border: 'none',
                backgroundColor: isDeploying ? '#94a3b8' : 'var(--color-primary)',
                color: 'white', fontWeight: 600, cursor: isDeploying ? 'not-allowed' : 'pointer',
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
                transition: 'background-color 0.2s'
              }}
            >
              {isDeploying ? <Activity size={18} className="animate-spin" /> : <Terminal size={18} />}
              {isDeploying ? 'Deploying...' : 'Trigger Manual Deploy'}
            </button>
          </div>
        </motion.div>

        {/* NIGHTLY BACKUPS CARD */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid var(--border-light)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', color: '#10b981' }}>
              <Database size={20} />
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Automated Backups</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ borderLeft: '3px solid #3b82f6', paddingLeft: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <Clock size={14} color="#64748b" />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>Code Backup (Git)</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Executes locally via Cron every night at <strong>01:00 AM</strong>.</p>
            </div>

            <div style={{ borderLeft: '3px solid #10b981', paddingLeft: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <Clock size={14} color="#64748b" />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>Database Export (Firestore)</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Executes via Cloud Scheduler every night at <strong>02:00 AM</strong>.</p>
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <button
              onClick={handleManualBackup}
              disabled={isBackingUp}
              style={{
                width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0',
                backgroundColor: 'white', color: '#334155', fontWeight: 600, cursor: isBackingUp ? 'not-allowed' : 'pointer',
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { if(!isBackingUp) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; }}
            >
              {isBackingUp ? <Activity size={18} className="animate-spin" /> : <HardDriveDownload size={18} />}
              {isBackingUp ? 'Executing Backup...' : 'Run Backup Now'}
            </button>
          </div>
        </motion.div>

      </div>

      {/* BACKUP HISTORY TABLE */}
      <div style={{ marginTop: '2.5rem', backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarIcon size={18} /> Backup History Registry
          </h2>
          <button onClick={fetchBackups} style={{ background: 'none', border: '1px solid var(--border-light)', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
            Refresh
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', color: '#64748b' }}>
                <th style={{ padding: '0.75rem 1.5rem', fontWeight: 600 }}>Date & Time</th>
                <th style={{ padding: '0.75rem 1.5rem', fontWeight: 600 }}>Type</th>
                <th style={{ padding: '0.75rem 1.5rem', fontWeight: 600 }}>Source</th>
                <th style={{ padding: '0.75rem 1.5rem', fontWeight: 600 }}>Triggered By</th>
                <th style={{ padding: '0.75rem 1.5rem', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '0.75rem 1.5rem', fontWeight: 600 }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {loadingBackups ? (
                <tr>
                  <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading backup history...</td>
                </tr>
              ) : backups.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No backups registered yet. Click "Run Backup Now" to test.</td>
                </tr>
              ) : backups.map(b => (
                <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.75rem 1.5rem', color: '#475569', whiteSpace: 'nowrap' }}>
                    {b.timestamp ? new Date(b.timestamp.seconds * 1000).toLocaleString() : 'Just now'}
                  </td>
                  <td style={{ padding: '0.75rem 1.5rem', fontWeight: 500, color: '#334155' }}>{b.type}</td>
                  <td style={{ padding: '0.75rem 1.5rem', color: '#64748b' }}>{b.source}</td>
                  <td style={{ padding: '0.75rem 1.5rem', color: '#64748b' }}>{b.triggeredBy}</td>
                  <td style={{ padding: '0.75rem 1.5rem' }}>
                    <span style={{ 
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                      backgroundColor: b.status === 'Success' ? '#dcfce7' : '#fee2e2',
                      color: b.status === 'Success' ? '#166534' : '#991b1b'
                    }}>
                      {b.status === 'Success' ? <CheckCircle size={12}/> : <XCircle size={12}/>}
                      {b.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1.5rem', color: '#64748b', fontSize: '0.8rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={b.details}>
                    {b.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
