import React, { useState, useEffect } from 'react';
import CreateWholesellerDrawer from './CreateWholesellerDrawer';
import { collection, query, getDocs, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import AppFilterBar from '../ui/AppFilterBar';
import AppEntityCell from '../ui/AppEntityCell';
import AppDataTable from '../ui/AppDataTable';
import AppActionGroup from '../ui/AppActionGroup';
import {
  Building2,
  Globe,
  ShieldCheck,
  Eye,
  EyeOff,
  ClipboardList,
  Plus,
  Building,
  FileText,
  CheckCircle2,
  X,
} from 'lucide-react';

export default function AdminWholesellersTab() {
  const [wholesellers, setWholesellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    fetchWholesellers();
  }, []);

  async function fetchWholesellers() {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, 'wholesellers'));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setWholesellers(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const columns = [
    {
      header: 'Company Name',
      key: 'name',
      render: (row) => (
        <AppEntityCell
          title={row.companyName || row.name || 'Unnamed'}
          subtitle={
            <>
              <span style={{ opacity: 0.5 }}>↳</span> {row.id}
            </>
          }
          icon={<Building2 size={16} />}
        />
      ),
    },
    {
      header: 'Type',
      key: 'type',
      render: (row) => (
        <span style={{ textTransform: 'capitalize' }}>{row.type || 'Standard'}</span>
      ),
    },
    { header: 'Region', key: 'region', render: (row) => row.region || 'Global' },
    {
      header: 'Status',
      key: 'status',
      render: (row) => (
        <span className={`status-badge status-${row.status === 'active' ? 'active' : 'inactive'}`}>
          {row.status === 'active' ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  async function handleUpdate(id, data) {
    try {
      await updateDoc(doc(db, 'wholesellers', id), data);
      setWholesellers((prev) => prev.map((w) => (w.id === id ? { ...w, ...data } : w)));
    } catch (err) {
      console.error('Update failed', err);
    }
  };

  async function handleCreate(data) {
    try {
      const newId = 'ws_' + Date.now();
      await setDoc(doc(db, 'wholesellers', newId), {
        ...data,
        status: 'active',
        createdAt: new Date().toISOString(),
      });
      setIsDrawerOpen(false);
      fetchWholesellers();
    } catch (err) {
      console.error('Create failed', err);
    }
  };

  const renderExpandedRow = (row) => {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          borderLeft: '3px solid var(--primary)',
          paddingLeft: '1.25rem',
        }}
      >
        <WholesellerDetailPanel wholeseller={row} onUpdate={handleUpdate} />
      </div>
    );
  };

  const filtered = wholesellers.filter((w) => {
    if (
      searchTerm &&
      !(w.companyName || w.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      <AppFilterBar
        searchPlaceholder="Search wholeseller companies..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
      />
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, minHeight: 0 }}
      >
        {/* GCP Table Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '0.25rem' }}>
          <button
            className="btn btn-primary"
            onClick={() => setIsDrawerOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '13px',
              padding: '0.4rem 1rem',
            }}
          >
            <Plus size={16} /> New Wholeseller
          </button>
        </div>
        <AppDataTable
          data={filtered}
          columns={columns}
          keyField="id"
          loading={loading}
          expandable={true}
          renderExpandedRow={renderExpandedRow}
        />
      </div>

      {isDrawerOpen && (
        <CreateWholesellerDrawer 
          onClose={() => setIsDrawerOpen(false)} 
          onSuccess={handleCreate} 
        />
      )}
    </div>
  );
}

function WholesellerDetailPanel({ wholeseller, onUpdate }) {
  const [activeTab, setActiveTab] = useState('company');

  const tabs = [
    { id: 'company', label: 'Company Info', icon: Building },
    { id: 'geography', label: 'Geography', icon: Globe },
    { id: 'access', label: 'Product Access', icon: ShieldCheck },
    { id: 'branding', label: 'Branding', icon: Eye },
    { id: 'pricing', label: 'Pricing', icon: EyeOff },
    { id: 'leads', label: 'Lead Routing', icon: ClipboardList },
  ];

  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '0',
        display: 'flex',
        minHeight: '350px',
        overflow: 'hidden',
      }}
    >
      {/* Sidebar Tabs */}
      <div style={{ width: '200px', borderRight: '1px solid var(--border)', padding: '1rem 0' }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              width: '100%',
              padding: '0.75rem 1.5rem',
              backgroundColor: activeTab === t.id ? 'var(--color-bg-elevated)' : 'transparent',
              borderLeft: activeTab === t.id ? '3px solid var(--primary)' : '3px solid transparent',
              color: activeTab === t.id ? 'var(--primary)' : 'var(--text-secondary)',
              border: 'none',
              borderRight: 'none',
              borderTop: 'none',
              borderBottom: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, padding: '2rem' }}>
        {activeTab === 'company' && (
          <div style={{ maxWidth: '600px' }}>
            <h4
              style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', fontSize: '1.1rem' }}
            >
              Organization Details
            </h4>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    marginBottom: '0.25rem',
                  }}
                >
                  Company Name
                </label>
                <input
                  type="text"
                  defaultValue={wholeseller.companyName}
                  onBlur={(e) => onUpdate(wholeseller.id, { companyName: e.target.value })}
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '0.5rem 0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    marginBottom: '0.25rem',
                  }}
                >
                  Contact Email
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="email"
                    defaultValue={wholeseller.email || ''}
                    onBlur={(e) => onUpdate(wholeseller.id, { email: e.target.value })}
                    style={{
                      flex: 1,
                      maxWidth: '300px',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      background: 'var(--bg-card)',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                    }}
                  />
                  {wholeseller.zohoSyncStatus ? (
                    <span style={{ fontSize: '0.8rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                      <CheckCircle2 size={14} /> Zoho Synced
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <X size={14} /> Not Synced
                    </span>
                  )}
                </div>
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    marginBottom: '0.25rem',
                  }}
                >
                  Tax ID / VAT
                </label>
                <input
                  type="text"
                  defaultValue={wholeseller.taxId}
                  onBlur={(e) => onUpdate(wholeseller.id, { taxId: e.target.value })}
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '0.5rem 0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem',
                  }}
                />
              </div>
              <div style={{ marginTop: '1rem' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={wholeseller.status === 'active'}
                    onChange={(e) =>
                      onUpdate(wholeseller.id, { status: e.target.checked ? 'active' : 'inactive' })
                    }
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                    Active Wholeseller Organization
                  </span>
                </label>
                <p
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    marginTop: '0.5rem',
                    paddingLeft: '1.8rem',
                  }}
                >
                  Disabling this organization will instantly freeze access for all associated
                  Account Managers and sub-entities.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'geography' && (
          <div style={{ maxWidth: '600px' }}>
            <h4 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', fontSize: '1.1rem' }}>
              Territory Assignment
            </h4>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Assigned Country
                </label>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--color-bg-app)', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.9rem', fontWeight: 500 }}>
                  {wholeseller.country || 'Global / Unassigned'}
                </div>
              </div>
              {wholeseller.zones && wholeseller.zones.length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    Specific Zones / Regions
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {wholeseller.zones.map(z => (
                      <span key={z} style={{ padding: '4px 8px', backgroundColor: 'var(--primary-light, #e0f2fe)', color: 'var(--primary-dark, #0369a1)', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                        {z}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab !== 'company' && activeTab !== 'geography' && (
          <div
            style={{
              color: 'var(--text-muted)',
              padding: '3rem',
              textAlign: 'center',
              border: '1px dashed var(--border)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-elevated)',
            }}
          >
            <p style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Configuration panel for <strong>{tabs.find((t) => t.id === activeTab)?.label}</strong>
            </p>
            <p style={{ fontSize: '0.9rem' }}>
              This enterprise module will control {wholeseller.companyName || 'this organization'}'s organizational rules
              in future releases.
            </p>
          </div>
        )}
      </div>
    
      <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.8, background: 'var(--surface)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', pointerEvents: 'none', zIndex: 1000, boxShadow: 'var(--shadow-sm)' }}>
        Widget: AdminWholesellersTab | Props: none
      </div>
    
</div>
  );
}
