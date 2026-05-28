import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import AppFilterBar from '../ui/AppFilterBar';
import AppEntityCell from '../ui/AppEntityCell';
import { Building2, Globe, ShieldCheck, Eye, EyeOff, ClipboardList, Plus, Building, FileText, CheckCircle2, X } from 'lucide-react';

export default function AdminWholesellersTab() {
  const [wholesellers, setWholesellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  useEffect(() => { fetchWholesellers(); }, []);

  const fetchWholesellers = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, 'wholesellers'));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setWholesellers(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Company Name',
      key: 'name',
      render: (row) => (
        <AppEntityCell
          title={row.companyName || row.name || 'Unnamed'}
          subtitle={<><span style={{ opacity: 0.5 }}>↳</span> {row.id}</>}
          icon={<Building2 size={16} />}
        />
      )
    },
    { header: 'Type', key: 'type', render: (row) => <span style={{ textTransform: 'capitalize' }}>{row.type || 'Standard'}</span> },
    { header: 'Region', key: 'region', render: (row) => row.region || 'Global' },
    { header: 'Status', key: 'status', render: (row) => (
        <span className={`status-badge status-${row.status === 'active' ? 'active' : 'inactive'}`}>
          {row.status === 'active' ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  const handleUpdate = async (id, data) => {
    try {
      await updateDoc(doc(db, 'wholesellers', id), data);
      setWholesellers(prev => prev.map(w => w.id === id ? { ...w, ...data } : w));
    } catch (err) {
      console.error('Update failed', err);
    }
  };

  const handleCreate = async (data) => {
    try {
      const newId = 'ws_' + Date.now();
      await setDoc(doc(db, 'wholesellers', newId), { ...data, status: 'active', createdAt: new Date().toISOString() });
      setIsDrawerOpen(false);
      fetchWholesellers();
    } catch (err) {
      console.error('Create failed', err);
    }
  };

  const renderExpandedRow = (row) => {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1.5rem', 
        borderLeft: '3px solid var(--primary)', 
        paddingLeft: '1.25rem' 
      }}>
        <WholesellerDetailPanel wholeseller={row} onUpdate={handleUpdate} />
      </div>
    );
  };

  const filtered = wholesellers.filter(w => {
    if (searchTerm && !(w.companyName || w.name || '').toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      <AppFilterBar 
        searchPlaceholder="Search wholeseller companies..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        actions={
          <button className="btn btn-primary" onClick={() => setIsDrawerOpen(true)}>
            <Plus size={16} /> New Wholeseller
          </button>
        }
      />
      <div style={{ flex: 1, minHeight: 0 }}>
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
        <div className="drawer-overlay" onClick={() => setIsDrawerOpen(false)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', justifyContent: 'flex-end'
        }}>
          <div className="drawer-content" onClick={e => e.stopPropagation()} style={{
            width: '450px', backgroundColor: 'var(--color-bg-surface)', height: '100%',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Create New Wholeseller</h2>
              <button onClick={() => setIsDrawerOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={24} />
              </button>
            </div>
            <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
              <form id="create-ws-form" onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                handleCreate(Object.fromEntries(fd.entries()));
              }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Company Name *</label>
                  <input name="companyName" required className="app-input" style={{ width: '100%', padding: '0.75rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Business Type</label>
                  <select name="type" className="app-input" style={{ width: '100%', padding: '0.75rem' }}>
                    <option value="distributor">Regional Distributor</option>
                    <option value="clinic_network">Clinic Network</option>
                    <option value="pharmacy">Pharmacy Chain</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Region Focus</label>
                  <input name="region" className="app-input" style={{ width: '100%', padding: '0.75rem' }} placeholder="e.g. Europe, North America" />
                </div>
              </form>
            </div>
            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn btn-outline" onClick={() => setIsDrawerOpen(false)}>Cancel</button>
              <button type="submit" form="create-ws-form" className="btn btn-primary">Create Organization</button>
            </div>
          </div>
        </div>
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
    { id: 'leads', label: 'Lead Routing', icon: ClipboardList }
  ];

  return (
    <div style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0', display: 'flex', minHeight: '350px', overflow: 'hidden' }}>
      {/* Sidebar Tabs */}
      <div style={{ width: '200px', borderRight: '1px solid var(--border)', padding: '1rem 0' }}>
        {tabs.map(t => (
          <button 
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.75rem 1.5rem',
              backgroundColor: activeTab === t.id ? 'var(--color-bg-elevated)' : 'transparent',
              borderLeft: activeTab === t.id ? '3px solid var(--primary)' : '3px solid transparent',
              color: activeTab === t.id ? 'var(--primary)' : 'var(--text-secondary)',
              border: 'none', borderRight: 'none', borderTop: 'none', borderBottom: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '0.9rem', fontWeight: 500
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
            <h4 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Organization Details</h4>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Company Name</label>
                <input 
                  type="text" 
                  defaultValue={wholeseller.companyName} 
                  onBlur={e => onUpdate(wholeseller.id, { companyName: e.target.value })}
                  style={{ width: '100%', maxWidth: '400px', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '4px', background: 'transparent', color: 'var(--text-primary)' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Tax ID / VAT</label>
                <input 
                  type="text" 
                  defaultValue={wholeseller.taxId} 
                  onBlur={e => onUpdate(wholeseller.id, { taxId: e.target.value })}
                  style={{ width: '100%', maxWidth: '400px', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '4px', background: 'transparent', color: 'var(--text-primary)' }} 
                />
              </div>
              <div style={{ marginTop: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={wholeseller.status === 'active'} 
                    onChange={e => onUpdate(wholeseller.id, { status: e.target.checked ? 'active' : 'inactive' })}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Active Wholeseller Organization</span>
                </label>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem', paddingLeft: '1.8rem' }}>
                  Disabling this organization will instantly freeze access for all associated Account Managers and sub-entities.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'company' && (
          <div style={{ color: 'var(--text-muted)', padding: '3rem', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-elevated)' }}>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Configuration panel for <strong>{tabs.find(t => t.id === activeTab)?.label}</strong></p>
            <p style={{ fontSize: '0.9rem' }}>This enterprise module will control {wholeseller.companyName}'s organizational rules in future releases.</p>
          </div>
        )}
      </div>
    </div>
  );
}
