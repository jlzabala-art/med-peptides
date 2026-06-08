import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import DataTable from '../ui/DataTable';
import { Tabs, StatusChip } from '../ui';
import AppFilterBar from '../ui/AppFilterBar';
import AppEntityCell from '../ui/AppEntityCell';
import { Users, Building2, UserCircle, Briefcase, Mail, Phone, Plus, X } from 'lucide-react';
import CreateUserModal from './CreateUserModal'; // Using the standard creation drawer

export default function AdminAccountManagersTab() {
  const [managers, setManagers] = useState([]);
  const [wholesellers, setWholesellers] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      // Fetch account managers
      const q = query(collection(db, 'users'), where('role', '==', 'account_manager'));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setManagers(list);

      // Fetch wholeseller names for mapping
      const wsSnap = await getDocs(collection(db, 'wholesellers'));
      const wsMap = {};
      wsSnap.docs.forEach((d) => {
        wsMap[d.id] = d.data().companyName || d.data().name || 'Unnamed Org';
      });
      setWholesellers(wsMap);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Manager Name',
      key: 'name',
      render: (row) => (
        <AppEntityCell
          title={row.displayName || row.name || row.email}
          subtitle={
            <>
              <span style={{ opacity: 0.5 }}>↳</span> {row.email}
            </>
          }
          icon={
            row.photoURL ? (
              <img
                src={row.photoURL}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 'var(--radius-sm)',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <UserCircle size={20} />
            )
          }
        />
      ),
    },
    {
      header: 'Organization',
      key: 'wholesellerId',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building2 size={14} color="var(--text-muted)" />
          <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
            {row.wholesellerId ? wholesellers[row.wholesellerId] || 'Unknown Org' : 'Unassigned'}
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => (
        <StatusChip status={row.disabled ? 'inactive' : 'active'} label={row.disabled ? 'Suspended' : 'Active'} />
      ),
    },
  ];

  async function handleUpdate(id, data) {
    try {
      await updateDoc(doc(db, 'users', id), data);
      setManagers((prev) => prev.map((m) => (m.id === id ? { ...m, ...data } : m)));
    } catch (err) {
      console.error('Update failed', err);
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
        <ManagerDetailPanel manager={row} wholesellers={wholesellers} onUpdate={handleUpdate} />
      </div>
    );
  };

  const filtered = managers.filter((m) => {
    if (
      searchTerm &&
      !(m.displayName || m.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      <AppFilterBar
        searchPlaceholder="Search account managers..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        actions={
          <button className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>
            <Plus size={16} /> New Account Manager
          </button>
        }
      />
      <div style={{ flex: 1, minHeight: 0 }}>
        <DataTable
          data={filtered}
          columns={columns}
          keyField="id"
          loading={loading}
          expandable={true}
          renderExpandedRow={renderExpandedRow}
        />
      </div>

      {isCreateOpen && (
        <CreateUserModal
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => {
            setIsCreateOpen(false);
            fetchData();
          }}
          defaultRole="account_manager"
        />
      )}
      <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.8, background: 'var(--surface)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', pointerEvents: 'none', zIndex: 1000, boxShadow: 'var(--shadow-sm)' }}>
        Widget: AdminAccountManagersTab | Props: none
      </div>
    </div>
  );
}

function ManagerDetailPanel({ manager, wholesellers, onUpdate }) {
  const [activeTab, setActiveTab] = useState('profile');


  const orgOptions = Object.entries(wholesellers).map(([id, name]) => ({ id, name }));

  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '300px',
      }}
    >
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          {
            id: 'profile',
            label: 'Operational Profile',
            icon: Briefcase,
            content: (
              <div style={{ maxWidth: '600px' }}>
                <h4
                  style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', fontSize: '1.1rem' }}
                >
                  Operational Assignments
                </h4>
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  <div>
                    <Toggle label="Account Active" checked={!manager.disabled} onChange={(checked) => onUpdate(manager.id, { disabled: !checked })} />
                  </div>
                </div>
              </div>
            )
          },
          {
            id: 'contact',
            label: 'Contact & Routing',
            icon: Phone,
            content: (
              <div style={{ maxWidth: '600px' }}>
                <h4
                  style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', fontSize: '1.1rem' }}
                >
                  Contact Info
                </h4>
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        color: 'var(--text-muted)',
                        marginBottom: '0.4rem',
                      }}
                    >
                      Phone Number
                    </label>
                    <TextField defaultValue={manager.phone || ''} onBlur={(e) => onUpdate(manager.id, { phone: e.target.value })} />
                  </div>
                </div>
              </div>
            )
          }
        ]}
      />
    </div>
  );
}