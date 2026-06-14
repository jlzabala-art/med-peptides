import Globe from "lucide-react/dist/esm/icons/globe";
import Truck from "lucide-react/dist/esm/icons/truck";
import HardDrive from "lucide-react/dist/esm/icons/hard-drive";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import GitCommit from "lucide-react/dist/esm/icons/git-commit";
import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';





import DataTable from '../ui/DataTable';
import ScreenPermissionsSettings from './ScreenPermissionsSettings';
import notifier from '../../services/NotificationService';

export default function AdminSettingsTab({ readOnly = false }) {
  const [settings, setSettings] = useState({
    exchangeRates: { uae: 3.67, qatar: 3.64, kuwait: 0.31, saudi: 3.75, euro: 0.92, row: 1 },
    eurExchangeRates: { uae: 4.0, qatar: 3.95, kuwait: 0.34, saudi: 4.08, usd: 1.09, row: 1.09 },
    shippingCosts: { standard: 0, express: 50, courier: 30 },
    deliveryTimes: { standard: '5-7 days', express: '2-3 days', courier: 'next day' },
  });
  const [loading, setLoading] = useState(true);
  const [backups, setBackups] = useState([]);

  useEffect(() => {
    fetchSettings();
    fetchBackups();
  }, []);

  async function fetchBackups() {
    try {
      const response = await fetch('/backups.js?t=' + new Date().getTime());
      if (response.ok) {
        const data = await response.js();
        setBackups(data);
      }
    } catch (e) {
      console.error('Failed to fetch backups:', e);
    }
  };

  async function fetchSettings() {
    try {
      setLoading(true);
      const docSnap = await getDocs(query(collection(db, 'settings')));
      const globalSettings = docSnap.docs.find((d) => d.id === 'global');

      if (globalSettings) {
        setSettings(globalSettings.data());
      } else {
        await setDoc(doc(db, 'settings', 'global'), settings);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  async function handleUpdateSettings(updates) {
    try {
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);
      await setDoc(doc(db, 'settings', 'global'), newSettings);
    } catch (err) {
      console.error('Error updating settings:', err);
      notifier.info('Failed to save settings.');
    }
  };

  if (loading)
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading settings...
      </div>
    );

  // Convert objects to arrays for DataTable
  const usdRatesArray = Object.entries(settings.exchangeRates || {}).map(([key, value]) => ({
    id: key,
    currency: key,
    rate: value,
  }));
  const eurRatesArray = Object.entries(settings.eurExchangeRates || {}).map(([key, value]) => ({
    id: key,
    currency: key,
    rate: value,
  }));

  const shippingMethods = Object.keys(settings.shippingCosts || {});
  const shippingArray = shippingMethods.map((method) => ({
    id: method,
    method,
    cost: settings.shippingCosts[method],
    time: settings.deliveryTimes?.[method] || '',
  }));

  const usdColumns = [
    {
      header: 'Currency (vs USD)',
      key: 'currency',
      render: (row) => (
        <span style={{ fontWeight: 600, textTransform: 'uppercase' }}>{row.currency}</span>
      ),
    },
    {
      header: 'Exchange Rate',
      key: 'rate',
      align: 'right',
      render: (row) =>
        readOnly ? (
          <span style={{ fontWeight: 700 }}>{row.rate}</span>
        ) : (
          <input
            type="number"
            step="0.001"
            defaultValue={row.rate}
            onBlur={(e) => {
              const newVal = parseFloat(e.target.value);
              if (isNaN(newVal)) return;
              const newRates = { ...settings.exchangeRates, [row.currency]: newVal };
              handleUpdateSettings({ exchangeRates: newRates });
            }}
            style={{
              width: '100px',
              padding: '0.4rem',
              textAlign: 'right',
              borderRadius: '4px',
              border: '1px solid var(--border)',
            }}
          />
        ),
    },
  ];

  const eurColumns = [
    {
      header: 'Currency (vs EUR)',
      key: 'currency',
      render: (row) => (
        <span style={{ fontWeight: 600, textTransform: 'uppercase' }}>{row.currency}</span>
      ),
    },
    {
      header: 'Exchange Rate',
      key: 'rate',
      align: 'right',
      render: (row) =>
        readOnly ? (
          <span style={{ fontWeight: 700 }}>{row.rate}</span>
        ) : (
          <input
            type="number"
            step="0.001"
            defaultValue={row.rate}
            onBlur={(e) => {
              const newVal = parseFloat(e.target.value);
              if (isNaN(newVal)) return;
              const newRates = { ...(settings.eurExchangeRates || {}), [row.currency]: newVal };
              handleUpdateSettings({ eurExchangeRates: newRates });
            }}
            style={{
              width: '100px',
              padding: '0.4rem',
              textAlign: 'right',
              borderRadius: '4px',
              border: '1px solid var(--border)',
            }}
          />
        ),
    },
  ];

  const shippingColumns = [
    {
      header: 'Shipping Method',
      key: 'method',
      render: (row) => (
        <span style={{ fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)' }}>
          {row.method}
        </span>
      ),
    },
    {
      header: 'Base Cost (USD)',
      key: 'cost',
      render: (row) =>
        readOnly ? (
          <span style={{ fontWeight: 700 }}>${row.cost}</span>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>$</span>
            <input
              type="number"
              defaultValue={row.cost}
              onBlur={(e) => {
                const newVal = parseFloat(e.target.value);
                if (isNaN(newVal)) return;
                const newCosts = { ...settings.shippingCosts, [row.method]: newVal };
                handleUpdateSettings({ shippingCosts: newCosts });
              }}
              style={{
                width: '100px',
                padding: '0.4rem',
                borderRadius: '4px',
                border: '1px solid var(--border)',
              }}
            />
          </div>
        ),
    },
    {
      header: 'Estimated Time',
      key: 'time',
      render: (row) =>
        readOnly ? (
          <span style={{ fontWeight: 700 }}>{row.time || 'N/A'}</span>
        ) : (
          <input
            type="text"
            placeholder="e.g. 5-7 days"
            defaultValue={row.time}
            onBlur={(e) => {
              const newTimes = { ...(settings.deliveryTimes || {}), [row.method]: e.target.value };
              handleUpdateSettings({ deliveryTimes: newTimes });
            }}
            style={{
              width: '100%',
              maxWidth: '200px',
              padding: '0.4rem',
              borderRadius: '4px',
              border: '1px solid var(--border)',
            }}
          />
        ),
    },
  ];

  const backupColumns = [
    {
      header: 'Commit',
      key: 'hash',
      width: '100px',
      render: (row) => (
        <span className="mono-data" style={{ fontWeight: 600, color: 'var(--primary)' }}>
          {row.hash}
        </span>
      ),
    },
    {
      header: 'Date',
      key: 'date',
      render: (row) => (
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {new Date(row.date).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Message',
      key: 'message',
      render: (row) => <span>{row.message}</span>,
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '2rem',
        marginBottom: '4rem',
      }}
    >
      {/* Financial Configurations */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-bg-surface)',
            padding: '1.5rem',
          }}
        >
          <h2
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: '1.25rem',
              marginBottom: '1.5rem',
              borderBottom: '2px solid var(--primary-light)',
              paddingBottom: '0.75rem',
            }}
          >
            <Globe size={24} color="var(--primary)" />
            Exchange Rates (Base: USD)
          </h2>
          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
            }}
          >
            <DataTable columns={usdColumns} data={usdRatesArray} keyField="id" />
          </div>
        </div>

        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-bg-surface)',
            padding: '1.5rem',
          }}
        >
          <h2
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: '1.25rem',
              marginBottom: '1.5rem',
              borderBottom: '2px solid var(--secondary-light)',
              paddingBottom: '0.75rem',
            }}
          >
            <Globe size={24} color="var(--secondary)" />
            Exchange Rates (Base: EUR)
          </h2>
          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
            }}
          >
            <DataTable columns={eurColumns} data={eurRatesArray} keyField="id" />
          </div>
        </div>
      </div>

      {/* Logistics and Cache */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-bg-surface)',
            padding: '1.5rem',
          }}
        >
          <h2
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: '1.25rem',
              marginBottom: '1.5rem',
              borderBottom: '2px solid var(--secondary-light)',
              paddingBottom: '0.75rem',
            }}
          >
            <Truck size={24} color="var(--secondary)" />
            Logistics & Delivery
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Configure shipping costs (USD) and estimated windows.
          </p>

          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
            }}
          >
            <DataTable columns={shippingColumns} data={shippingArray} keyField="id" />
          </div>
        </div>

        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-bg-surface)',
            padding: '1.5rem',
          }}
        >
          <h2
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: '1.25rem',
              marginBottom: '1rem',
              borderBottom: '2px solid var(--primary-light)',
              paddingBottom: '0.75rem',
            }}
          >
            <HardDrive size={24} color="var(--primary)" />
            App Cache Control
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Clear all cached session data (products, protocols, exchange rates). Use this after
            making bulk Firestore changes so users see fresh data on next load.
          </p>
          <button
            className="btn btn-outline"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--error)',
              borderColor: 'var(--error)',
            }}
            onClick={() => {
              Object.keys(sessionStorage)
                .filter((k) => k.startsWith('rp_'))
                .forEach((k) => sessionStorage.removeItem(k));
              notifier.info('Cache cleared. Reloading...');
              window.location.reload();
            }}
          >
            <Trash2 size={16} /> Clear App Cache &amp; Reload
          </button>
        </div>

        {/* Backups Table */}
        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-bg-surface)',
            padding: '1.5rem',
          }}
        >
          <h2
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: '1.25rem',
              marginBottom: '1rem',
              borderBottom: '2px solid var(--primary-light)',
              paddingBottom: '0.75rem',
            }}
          >
            <GitCommit size={24} color="var(--primary)" />
            Automated System Backups
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Local snapshot backups via Git. Automatically running every 3 hours. Showing the last 5
            commits.
          </p>
          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
            }}
          >
            {backups.length > 0 ? (
              <DataTable columns={backupColumns} data={backups} keyField="hash" />
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No backups available. Auto backup script may not be running.
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Dynamic Role Permissions */}
      <ScreenPermissionsSettings />
      <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.8, background: 'var(--surface)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', pointerEvents: 'none', zIndex: 1000, boxShadow: 'var(--shadow-sm)' }}>
        Widget: AdminSettingsTab | Props: none
      </div>
</div>
  );
}