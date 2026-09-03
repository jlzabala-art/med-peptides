"use client";

import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

import { ShieldCheck, AlertCircle, Save, RefreshCw } from '@/lib/icons';
import DataTable from '../ui/DataTable';





const AVAILABLE_ROLES = ['admin', 'clinic', 'doctor', 'wholesaler', 'sales_agent', 'staff', 'patient', 'guest', 'support', 'agency', 'logistics'];

const DEFAULT_TABS = [
  'dashboard', 'my-profile', 'messages', 'calendar', 'leads', 'orders', 
  'bulk-orders', 'doctors', 'patients', 'clinical-ai', 'protocols', 
  'products', 'stock', 'variants', 'shipping', 'catalogs'
];

export default function ScreenPermissionsSettings() {
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchPermissions();
  }, []);

  async function fetchPermissions() {
    setLoading(true);
    try {
      const docRef = doc(db, 'system', 'role_permissions');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setPermissions(snap.data());
      } else {
        // Init with empty or defaults
        const defaults = {};
        DEFAULT_TABS.forEach(t => defaults[t] = ['*']);
        setPermissions(defaults);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch screen permissions.');
    } finally {
      setLoading(false);
    }
  }

  const handleRoleToggle = (tabId, role) => {
    setPermissions(prev => {
      const tabRoles = prev[tabId] || [];
      // If turning ON role, add it
      if (!tabRoles.includes(role)) {
        return { ...prev, [tabId]: [...tabRoles, role].filter(r => r !== '*') }; // if adding specific, remove wildcard
      } 
      // If turning OFF role, remove it
      else {
        return { ...prev, [tabId]: tabRoles.filter(r => r !== role) };
      }
    });
  };

  const handleWildcardToggle = (tabId) => {
    setPermissions(prev => {
      const tabRoles = prev[tabId] || [];
      if (tabRoles.includes('*')) {
        return { ...prev, [tabId]: [] };
      } else {
        return { ...prev, [tabId]: ['*'] };
      }
    });
  };

  const addNewTab = () => {
    const tabName = window.prompt("Enter new tab ID:");
    if (tabName && tabName.trim() !== '') {
      setPermissions(prev => ({ ...prev, [tabName.trim()]: ['*'] }));
    }
  };

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await setDoc(doc(db, 'system', 'role_permissions'), permissions);
      setSuccess('Permissions saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to save permissions.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '2rem' }}>
        <RefreshCw size={24} style={{ animation: 'spin 1.5s linear infinite' }} />
        <span>Loading screen permissions...</span>
      </div>
    );
  }

  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      backgroundColor: 'var(--color-bg-surface)',
      padding: '1.5rem',
      marginTop: '2rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '2px solid var(--primary-light)', paddingBottom: '0.75rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', margin: 0 }}>
          <ShieldCheck size={24} color="var(--primary)" />
          Screen & Tab Permissions
        </h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={addNewTab} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
            Add Tab ID
          </button>
          <button onClick={handleSave} className="btn btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
            {saving ? <RefreshCw size={14} className="spin" /> : <Save size={14} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        Control which roles can access specific admin tabs. 'admin' role always has access. Check '*' to allow all authenticated roles with dashboard access.
      </p>

      {error && <div style={{ color: 'var(--error)', marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}><AlertCircle size={16}/> {error}</div>}
      {success && <div style={{ color: 'var(--success)', marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}><ShieldCheck size={16}/> {success}</div>}

      {/* Permissions DataTable */}
      {(() => {
        const tableData = Object.keys(permissions).sort().map(tabId => {
          const roles = permissions[tabId] || [];
          const isAll = roles.includes('*');
          return { tabId, roles, isAll };
        });

        const columns = [
          {
            key: 'tabId',
            header: 'Tab ID',
            sortKey: 'tabId',
            render: (r) => <span style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.85rem' }}>{r.tabId}</span>
          },
          {
            key: '_all',
            header: 'All (*)',
            align: 'center',
            render: (r) => (
              <input
                type="checkbox"
                checked={r.isAll}
                onChange={() => handleWildcardToggle(r.tabId)}
                style={{ cursor: 'pointer', width: '16px', height: '16px' }}
              />
            )
          },
          ...AVAILABLE_ROLES.map(role => ({
            key: `role_${role}`,
            header: role,
            align: 'center',
            render: (r) => (
              <input
                type="checkbox"
                checked={r.roles.includes(role)}
                onChange={() => handleRoleToggle(r.tabId, role)}
                disabled={r.isAll || role === 'admin'}
                style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                title={role === 'admin' ? 'Admin always has access' : ''}
              />
            )
          }))
        ];

        return (
          <DataTable
            data={tableData}
            columns={columns}
            keyField="tabId"
            emptyTitle="No permissions defined"
            globalSearch
            searchPlaceholder="Search by tab ID..."
          />
        );
      })()}
    </div>
  );
}