import GitBranch from "lucide-react/dist/esm/icons/git-branch";
import GitCommit from "lucide-react/dist/esm/icons/git-commit";
import Database from "lucide-react/dist/esm/icons/database";
import Clock from "lucide-react/dist/esm/icons/clock";
import Terminal from "lucide-react/dist/esm/icons/terminal";
import Activity from "lucide-react/dist/esm/icons/activity";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import HardDriveDownload from "lucide-react/dist/esm/icons/hard-drive-download";
import Server from "lucide-react/dist/esm/icons/server";
import CalendarIcon from "lucide-react/dist/esm/icons/calendar";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import XCircle from "lucide-react/dist/esm/icons/x-circle";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';












import { db, functions } from '../../firebase';
import { collection, query, orderBy, getDocs, limit, where } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import AppFilterBar from '../ui/AppFilterBar';
import toast from 'react-hot-toast';

export default function AdminDeployHostingTab() {
  const [isDeploying, setIsDeploying] = useState(false);
  const [isBackingUpDB, setIsBackingUpDB] = useState(false);
  const [isBackingUpCode, setIsBackingUpCode] = useState(false);
  const [backups, setBackups] = useState([]);
  const [loadingBackups, setLoadingBackups] = useState(true);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const fetchBackups = async () => {
    setLoadingBackups(true);
    try {
      let constraints = [];
      if (dateRange.start) {
        constraints.push(where('timestamp', '>=', new Date(dateRange.start)));
      }
      if (dateRange.end) {
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        constraints.push(where('timestamp', '<=', endDate));
      }
      const q = query(
        collection(db, 'system_backups'), 
        ...constraints, 
        orderBy('timestamp', 'desc'), 
        limit(20)
      );
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
  }, [dateRange]);

  const handleManualDBBackup = async () => {
    setIsBackingUpDB(true);
    try {
      const triggerBackup = httpsCallable(functions, 'triggerManualBackup');
      await triggerBackup();
      setTimeout(fetchBackups, 2000);
    } catch (err) {
      console.error("Error triggering DB backup", err);
      toast.error("Error triggering DB backup. Check console for details.");
    } finally {
      setIsBackingUpDB(false);
    }
  };

  const handleManualCodeBackup = async () => {
    setIsBackingUpCode(true);
    try {
      const response = await fetch('/api/run-code-backup');
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to trigger code backup');
      }
      toast.success("Code backup executed successfully via local script.");
    } catch (err) {
      console.error("Error triggering Code backup", err);
      toast.error("Error triggering Code backup. This relies on the local Vite dev server plugin.");
    } finally {
      setIsBackingUpCode(false);
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
          style={{ backgroundColor: 'white', borderRadius: '12px', padding: 0, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid var(--border-light)', overflow: 'hidden' }}
        >
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', color: '#10b981' }}>
                <Database size={20} />
              </div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Automated Backups</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ padding: '0.5rem', background: 'white', borderRadius: '8px', color: '#3b82f6', alignSelf: 'flex-start', boxShadow: 'var(--shadow-sm)' }}>
                  <GitCommit size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>Code Backup (Git)</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Executes locally via Cron every night at <strong>01:00 AM</strong>.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ padding: '0.5rem', background: 'white', borderRadius: '8px', color: '#10b981', alignSelf: 'flex-start', boxShadow: 'var(--shadow-sm)' }}>
                  <Database size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>Database Export (Firestore)</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Executes via Cloud Scheduler every night at <strong>02:00 AM</strong>. Maximum 5 copies retained.</p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-light)', background: '#f8fafc', display: 'flex', gap: '1rem' }}>
            <button
              onClick={handleManualCodeBackup}
              disabled={isBackingUpCode}
              style={{
                flex: 1, padding: '0.75rem 1rem', background: 'white', border: '1px solid var(--border-color)', color: 'var(--text-main)',
                borderRadius: '8px', fontWeight: 600, cursor: isBackingUpCode ? 'not-allowed' : 'pointer',
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
                opacity: isBackingUpCode ? 0.7 : 1, transition: 'all 0.2s'
              }}
            >
              {isBackingUpCode ? <><RefreshCw size={18} className="spin" /> Zipping...</> : <><GitCommit size={18}/> Code</>}
            </button>
            <button
              onClick={handleManualDBBackup}
              disabled={isBackingUpDB}
              style={{
                flex: 1, padding: '0.75rem 1rem', background: 'white', border: '1px solid var(--border-color)', color: 'var(--text-main)',
                borderRadius: '8px', fontWeight: 600, cursor: isBackingUpDB ? 'not-allowed' : 'pointer',
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
                opacity: isBackingUpDB ? 0.7 : 1, transition: 'all 0.2s'
              }}
            >
              {isBackingUpDB ? <><RefreshCw size={18} className="spin" /> Exporting...</> : <><Database size={18}/> DB</>}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={fetchBackups} style={{ background: 'none', border: '1px solid var(--border-light)', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
              Refresh
            </button>
          </div>
        </div>
        <div style={{ padding: '1rem 1.5rem', backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-light)' }}>
          <AppFilterBar 
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
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