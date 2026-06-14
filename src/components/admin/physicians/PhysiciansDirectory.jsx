import Mail from "lucide-react/dist/esm/icons/mail";
import Phone from "lucide-react/dist/esm/icons/phone";
import MoreVertical from "lucide-react/dist/esm/icons/more-vertical";
import LayoutGrid from "lucide-react/dist/esm/icons/layout-grid";
import List from "lucide-react/dist/esm/icons/list";
import Users from "lucide-react/dist/esm/icons/users";
import Plus from "lucide-react/dist/esm/icons/plus";
import React, { useState } from 'react';
import { Card } from '../../ui';








export default function PhysiciansDirectory({ doctors, onSelectDoctor, patientMap, orderMap, onAddPhysician }) {
  const [view, setView] = useState('table'); // 'table' or 'card'
  const [search, setSearch] = useState('');

  const filteredDoctors = doctors.filter(d => 
    (d.displayName || d.firstName || d.email || '').toLowerCase().includes(search.toLowerCase())
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

  const renderTable = () => (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
        <thead style={{ backgroundColor: 'var(--color-bg-surface)', borderBottom: '2px solid var(--border)' }}>
          <tr>
            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Physician</th>
            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Specialty / Clinic</th>
            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Status</th>
            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Patients</th>
            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Orders</th>
            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Revenue</th>
            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', width: '50px' }}></th>
          </tr>
        </thead>
        <tbody>
          {filteredDoctors.map(d => {
            const name = getDoctorName(d);
            const pCount = getPatientsCount(d.id);
            const { count: oCount, revenue } = getOrdersData(d.id);

            return (
              <tr 
                key={d.id} 
                onClick={() => onSelectDoctor(d)}
                style={{ 
                  borderBottom: '1px solid var(--border)', 
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{d.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                  <div style={{ color: 'var(--text-main)' }}>{d.specialty || 'General'}</div>
                  <div style={{ color: 'var(--text-muted)' }}>{d.clinicName || '-'}</div>
                </td>
                <td style={{ padding: '1rem' }}>
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
                </td>
                <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>{pCount}</td>
                <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>{oCount}</td>
                <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>AED {revenue.toLocaleString()}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={(e) => { e.stopPropagation(); /* quick actions */ }}>
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderCards = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', padding: '1rem' }}>
      {filteredDoctors.map(d => {
        const name = getDoctorName(d);
        const pCount = getPatientsCount(d.id);
        return (
          <Card key={d.id} onClick={() => onSelectDoctor(d)} style={{ padding: '1.5rem', cursor: 'pointer', transition: 'transform 0.2s', ':hover': { transform: 'translateY(-2px)' } }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.25rem' }}>
                  {name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>{name}</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{d.specialty || 'General'}</span>
                </div>
              </div>
              <MoreVertical size={18} color="var(--text-muted)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <Mail size={14} /> {d.email || 'No email'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <Phone size={14} /> {d.phone || 'No phone'}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Patients</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{pCount}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</span>
                <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>{d.status || 'Active'}</span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );

  if (!doctors || doctors.length === 0) {
    return (
      <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'var(--color-bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <Users size={32} color="var(--primary)" />
        </div>
        <h2 style={{ margin: '0 0 1rem 0', color: 'var(--text-main)', fontSize: '1.5rem' }}>Welcome to Physician Management</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 0 2rem 0', lineHeight: 1.5 }}>
          Manage your physician network, clinics, activity and performance. Start by adding your first physician to the platform.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="gcp-btn-primary" onClick={onAddPhysician}>
            <Plus size={16} style={{ marginRight: '0.5rem' }} /> Add First Physician
          </button>
          <button className="gcp-btn-secondary">
            Import Physicians
          </button>
          <button className="gcp-btn-secondary">
            Watch Demo
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1 }}>
      {/* Toolbar */}
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-bg-surface)', flexWrap: 'wrap', gap: '1rem' }}>
        {/* Search */}
        <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Search physicians by name, email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.6rem 1rem', paddingLeft: '2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--background)' }}
          />
          <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            <Mail size={16} />
          </div>
        </div>

        {/* Actions & View Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <button 
              onClick={() => setView('table')}
              style={{ padding: '0.5rem', background: view === 'table' ? 'var(--color-bg-hover)' : 'transparent', border: 'none', cursor: 'pointer', color: view === 'table' ? 'var(--primary)' : 'var(--text-muted)' }}>
              <List size={18} />
            </button>
            <div style={{ width: '1px', backgroundColor: 'var(--border)' }}></div>
            <button 
              onClick={() => setView('card')}
              style={{ padding: '0.5rem', background: view === 'card' ? 'var(--color-bg-hover)' : 'transparent', border: 'none', cursor: 'pointer', color: view === 'card' ? 'var(--primary)' : 'var(--text-muted)' }}>
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>

      </div>

      {/* Directory Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {view === 'table' ? renderTable() : renderCards()}
      </div>

    </Card>
  );
}