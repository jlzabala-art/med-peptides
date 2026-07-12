"use client";

import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useDoctorPatients } from '../../../hooks/data/useDoctorPatients';
import { Users, Search, UserPlus, MoreHorizontal } from '@/lib/icons';

export default function MedicalPatientsPage() {
  const { userProfile } = useAuth();
  const { patients, loading, error, hasMore, loadMore } = useDoctorPatients({ doctorId: userProfile?.uid, pageSize: 20 });
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = patients.filter(p => 
    p.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '2rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.5rem' }}>
            <Users size={32} /> Patient Directory
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your patients, review health records, and create prescriptions.</p>
        </div>
        <button 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        >
          <UserPlus size={20} /> Invite Patient
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search patients by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                fontSize: '0.95rem',
                background: 'var(--bg-app)'
              }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-app)', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>Patient</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>Last Visit</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && patients.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }} />
                        <div>
                          <div className="skeleton" style={{ width: 120, height: 16, marginBottom: 8 }} />
                          <div className="skeleton" style={{ width: 160, height: 12 }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}><div className="skeleton" style={{ width: 60, height: 24, borderRadius: 12 }} /></td>
                    <td style={{ padding: '1rem 1.5rem' }}><div className="skeleton" style={{ width: 80, height: 16 }} /></td>
                    <td style={{ padding: '1rem 1.5rem' }}><div className="skeleton" style={{ width: 32, height: 32, borderRadius: 8 }} /></td>
                  </tr>
                ))
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    {searchTerm ? "No patients match your search." : "No patients found. Invite a patient to get started."}
                  </td>
                </tr>
              ) : (
                filteredPatients.map(patient => (
                  <tr key={patient.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-hover, #f8fafc)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '50%', 
                          background: 'var(--primary-light, #eff6ff)', 
                          color: 'var(--primary)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontWeight: 800 
                        }}>
                          {patient.firstName?.[0] || 'P'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{patient.firstName} {patient.lastName}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{patient.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '99px', 
                        background: '#ecfdf5', 
                        color: '#10b981', 
                        fontSize: '0.8rem', 
                        fontWeight: 700 
                      }}>
                        Active
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <button style={{ background: 'transparent', border: '1px solid var(--border)', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {error && <div style={{ color: 'red', padding: '1rem 1.5rem', borderTop: '1px solid var(--border)' }}>{error}</div>}
        
        {hasMore && (
          <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <button 
              onClick={loadMore} 
              disabled={loading}
              style={{
                padding: '0.5rem 1.5rem',
                backgroundColor: 'white',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: loading ? 'wait' : 'pointer',
                color: 'var(--text-main)',
                fontSize: '0.9rem'
              }}
            >
              {loading ? 'Loading...' : 'Load More Patients'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
