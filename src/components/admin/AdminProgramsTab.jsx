import Activity from "lucide-react/dist/esm/icons/activity";
import Users from "lucide-react/dist/esm/icons/users";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import Dna from "lucide-react/dist/esm/icons/dna";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import React, { useState } from 'react';






import { StatusChip } from '../ui';

const MOCK_PROGRAMS = [
  { id: 'prg_1', name: 'Longevity Base Protocol', type: 'Anti-Aging', patients: 1250, revenue: 1250000, status: 'active', trend: '+12%' },
  { id: 'prg_2', name: 'Metabolic Reset 90-Day', type: 'Weight Loss', patients: 840, revenue: 2100000, status: 'active', trend: '+24%' },
  { id: 'prg_3', name: 'Athletic Recovery Stack', type: 'Performance', patients: 420, revenue: 315000, status: 'active', trend: '+5%' },
  { id: 'prg_4', name: 'Hair Restoration', type: 'Aesthetics', patients: 65, revenue: 45000, status: 'beta', trend: '+45%' }
];

export default function AdminProgramsTab() {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = MOCK_PROGRAMS.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.type.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%', gap: '1.5rem', backgroundColor: '#f1f5f9' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={24} color="#1a73e8" /> Healthcare Program Engine
        </h1>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
          Manage structured clinical protocols, track patient enrollment, and measure program economics.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '12px', background: '#eff6ff', borderRadius: '50%', color: '#1d4ed8' }}><Dna size={24} /></div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Active Programs</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{MOCK_PROGRAMS.filter(p => p.status === 'active').length}</div>
          </div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '12px', background: '#f0fdf4', borderRadius: '50%', color: '#15803d' }}><Users size={24} /></div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Enrolled Patients</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{MOCK_PROGRAMS.reduce((acc, p) => acc + p.patients, 0).toLocaleString()}</div>
          </div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '12px', background: '#fefce8', borderRadius: '50%', color: '#a16207' }}><DollarSign size={24} /></div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Program Revenue</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>${(MOCK_PROGRAMS.reduce((acc, p) => acc + p.revenue, 0) / 1000000).toFixed(1)}M</div>
          </div>
        </div>
      </div>

      {/* Program List */}
      <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Search programs..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '300px', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none' }}
          />
          <button className="gcp-btn-primary">Create Program</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Program Name</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Type</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Enrolled Patients</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Revenue</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }} className="hover-bg">
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-main)' }}>{p.name}</td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{p.type}</td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>{p.patients.toLocaleString()}</td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>${p.revenue.toLocaleString()} <span style={{ fontSize: '0.75rem', color: '#16a34a', marginLeft: '0.5rem' }}>{p.trend}</span></td>
                  <td style={{ padding: '1rem 1.5rem' }}><StatusChip status={p.status} /></td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><ArrowRight size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`.hover-bg:hover { background-color: #f8fafc; }`}</style>
    </div>
  );
}