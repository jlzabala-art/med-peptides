"use client";

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
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { db, functions } from '../../firebase';
import { collection, query, orderBy, getDocs, limit, where } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import AppFilterBar from '../ui/AppFilterBar';
import toast from 'react-hot-toast';

import DataTable from '../ui/DataTable';
import PageHeader from '../ui/PageHeader';
import GlobalSearchBar from '../ui/GlobalSearchBar';
import StatusChip from '../ui/StatusChip';
import CopyableId from '../ui/CopyableId';

export default function AdminDeployHostingTab() {
  const [isDeploying, setIsDeploying] = useState(false);
  const [isBackingUpDB, setIsBackingUpDB] = useState(false);
  const [isBackingUpCode, setIsBackingUpCode] = useState(false);
  const [backups, setBackups] = useState([]);
  const [loadingBackups, setLoadingBackups] = useState(true);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchBackups = async () => {
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
    let active = true;
    const load = async () => {
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
        if (!active) return;
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBackups(data);
      } catch (err) {
        console.error("Error fetching backups", err);
      } finally {
        if (active) setLoadingBackups(false);
      }
    };
    load();
    return () => {
      active = false;
    };
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

  // ── DataTable Configuration ──────────────────────────────────────────────────
  const columns = useMemo(() => [
    {
      key: 'id',
      header: 'ID',
      render: (val, row) => <CopyableId value={row.id} />
    },
    {
      key: 'timestamp',
      header: 'Date & Time',
      render: (val, row) => row.timestamp ? new Date(row.timestamp.seconds * 1000).toLocaleString() : 'Just now'
    },
    {
      key: 'type',
      header: 'Type',
      render: (val) => <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{val}</span>
    },
    {
      key: 'source',
      header: 'Source'
    },
    {
      key: 'triggeredBy',
      header: 'Triggered By'
    },
    {
      key: 'status',
      header: 'Status',
      render: (val) => <StatusChip status={val} />
    },
    {
      key: 'details',
      header: 'Details',
      render: (val) => (
        <span 
          style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '250px', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} 
          title={val}
        >
          {val}
        </span>
      )
    }
  ], []);

  // Filter integration
  const activeFilters = [];
  if (statusFilter) {
    activeFilters.push({
      key: 'status',
      label: 'Status',
      value: statusFilter,
      onRemove: () => setStatusFilter('')
    });
  }

  const filterOptions = [
    {
      key: 'status',
      label: 'Estado',
      options: [
        { label: 'Todos', value: '' },
        { label: 'Success', value: 'Success' },
        { label: 'Failed', value: 'Failed' },
      ],
      value: statusFilter,
      onChange: setStatusFilter
    }
  ];

  const filteredBackups = useMemo(() => {
    let result = backups;
    if (statusFilter) {
      result = result.filter(b => b.status === statusFilter);
    }
    return result;
  }, [backups, statusFilter]);


  return (
    <div style={{ padding: '0 2rem 2rem 2rem' }}>
      
      {/* Header (Golden Rule #9) */}
      <PageHeader 
        title="Deploy & Hosting"
        subtitle="Manage your Git repository, monitor automated backups, and trigger new deployments."
        icon={Server}
        actions={
          <button
            onClick={fetchBackups}
            className="gcp-btn gcp-btn--secondary"
            disabled={loadingBackups}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RefreshCw size={16} className={loadingBackups ? "spin" : ""} />
            {loadingBackups ? 'Refreshing...' : 'Refresh'}
          </button>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
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
          style={{ backgroundColor: 'white', borderRadius: '12px', padding: 0, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid var(--border-light)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        >
          <div style={{ padding: '1.5rem', flex: 1 }}>
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

      {/* Global Search & Filters (Golden Rule #7) */}
      <div style={{ marginBottom: '1.5rem' }}>
        <GlobalSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search backups by type, origin or details..."
          resultCount={filteredBackups.length}
          namespace="admin-backups"
          size="lg"
          filters={activeFilters}
          filterOptions={filterOptions}
        />
        {/* We keep the Date Range filter below the search bar as a specialized filter */}
        <div style={{ marginTop: '0.75rem' }}>
          <AppFilterBar 
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </div>
      </div>

      {/* BACKUP HISTORY TABLE (Golden Rule #3) */}
      <div className="gcp-table-container">
        {loadingBackups ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading backup history...</div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredBackups}
            keyField={(row) => row.id}
            emptyMessage="No backups registered yet. Click 'DB' or 'Code' to test."
            globalSearch={true}
            searchQuery={searchQuery}
          />
        )}
      </div>
    </div>
  );
}