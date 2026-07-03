import React, { useState } from 'react';
import { Mail, Phone, MoreVertical, Search, Users, Plus } from '@/lib/icons';
import DataTable from '../../ui/DataTable';

export default function PhysiciansDirectory({ doctors = [], isLoading = false, onSelectDoctor, patientMap = {}, orderMap = {}, onAddPhysician }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDoctors = doctors.filter(d => 
    (d.displayName || d.firstName || d.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDoctorName = (d) => {
    return d.displayName || [d.firstName, d.lastName].filter(Boolean).join(' ') || 'Unnamed Physician';
  };

  const getPatientsCount = (doctorId) => {
    return patientMap[doctorId]?.length || 0;
  };

  const getOrdersData = (doctorId) => {
    const docOrders = orderMap[doctorId] || [];
    const rev = docOrders.reduce((sum, o) => sum + (o.total || o.amount || 0), 0);
    return { count: docOrders.length, revenue: rev };
  };

  const columns = [
    {
      header: 'Physician',
      accessor: (d) => {
        const name = getDoctorName(d);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{d.email}</div>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Specialty / Clinic',
      accessor: (d) => (
        <div style={{ fontSize: '0.85rem' }}>
          <div style={{ color: 'var(--text-main)' }}>{d.specialty || 'General'}</div>
          <div style={{ color: 'var(--text-muted)' }}>{d.clinicName || '-'}</div>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (d) => (
        <span style={{ 
          padding: '0.25rem 0.75rem', 
          borderRadius: '1rem', 
          fontSize: '0.75rem', 
          fontWeight: 600,
          backgroundColor: (d.status === 'active' || !d.status) ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          color: (d.status === 'active' || !d.status) ? 'var(--color-success)' : 'var(--color-danger)'
        }}>
          {d.status || 'Active'}
        </span>
      )
    },
    {
      header: 'Patients',
      accessor: (d) => <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>{getPatientsCount(d.id)}</span>
    },
    {
      header: 'Orders',
      accessor: (d) => <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>{getOrdersData(d.id).count}</span>
    },
    {
      header: 'Revenue',
      accessor: (d) => <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>AED {getOrdersData(d.id).revenue.toLocaleString()}</span>
    }
  ];

  // Quick actions to show on hover (similar to Quotations)
  const renderActions = (d) => (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <button 
        onClick={(e) => { e.stopPropagation(); onSelectDoctor(d); }}
        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--background)', cursor: 'pointer' }}>
        View Profile
      </button>
    </div>
  );

  const toolbar = (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: '300px' }}>
        <input 
          type="text" 
          placeholder="Search physicians by name, email..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--background)' }}
        />
        <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
      </div>
      <button className="gcp-btn-primary" onClick={onAddPhysician}>
        <Plus size={16} style={{ marginRight: '0.5rem' }} /> Add Physician
      </button>
    </div>
  );

  const emptyState = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 2rem', textAlign: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'var(--color-bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <Users size={32} color="var(--primary)" />
      </div>
      <h2 style={{ margin: '0 0 1rem 0', color: 'var(--text-main)', fontSize: '1.25rem' }}>No Physicians Found</h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 0 2rem 0', lineHeight: 1.5 }}>
        {searchQuery ? `No physicians matched "${searchQuery}".` : 'Manage your physician network. Start by adding your first physician to the platform.'}
      </p>
      {!searchQuery && (
        <button className="gcp-btn-primary" onClick={onAddPhysician}>
          <Plus size={16} style={{ marginRight: '0.5rem' }} /> Add First Physician
        </button>
      )}
    </div>
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <DataTable 
        data={filteredDoctors}
        columns={columns}
        isLoading={isLoading}
        onRowClick={onSelectDoctor}
        renderActions={renderActions}
        emptyState={emptyState}
        toolbar={toolbar}
      />
    </div>
  );
}