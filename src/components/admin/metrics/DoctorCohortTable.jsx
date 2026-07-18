"use client";

import React, { useState } from 'react';
import { Users } from '@/lib/icons';
import DataTable from '../../ui/DataTable';

export default function DoctorCohortTable({ wholesalerId, scopedDoctors, doctorsWithPatients }) {
  const [expanded, setExpanded] = useState({});
  const rows = wholesalerId ? scopedDoctors : doctorsWithPatients;
  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="amd-table-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 className="amd-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#202124' }}>
          <Users size={16} color="#1a73e8" />
          Physicians &amp; Clinics — Patient Volume
        </h3>
        <span className="amd-caption" style={{ color: '#5f6368' }}>Ordered by patient count</span>
      </div>

      <div className="gcp-table-container">
        <DataTable
          columns={[
            {
              key: 'name',
              header: 'Name',
              render: (val) => <span style={{ fontWeight: 600 }}>{val}</span>
            },
            {
              key: 'role',
              header: 'Role',
              render: (val) => <span style={{ textAlign: 'center', textTransform: 'capitalize', color: '#5f6368', display: 'block' }}>{val}</span>
            },
            {
              key: 'patientCount',
              header: 'Patients',
              render: (val) => (
                <span
                  className="amd-badge"
                  style={{
                    backgroundColor: val > 0 ? '#e6f4ea' : '#f1f3f4',
                    color: val > 0 ? '#137333' : '#5f6368',
                    display: 'block',
                    textAlign: 'center',
                  }}
                >
                  {val} {val === 1 ? 'patient' : 'patients'}
                </span>
              )
            },
            {
              key: 'institution',
              header: '',
              render: (val, row) => val ? (
                <button
                  className="amd-expand-btn"
                  onClick={() => toggle(row.id)}
                  title="More details"
                >
                  {expanded[row.id] ? '▲' : '▼'}
                </button>
              ) : null
            }
          ]}
          data={rows}
          keyField="id"
          expandedRows={expanded}
          renderExpanded={(row) => row.institution && expanded[row.id] ? (
            <div style={{ padding: '0.5rem 1rem', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
              <strong>Institution:</strong> {row.institution}
            </div>
          ) : null}
          emptyMessage="No physicians or clinics found."
        />
      </div>
    </div>
  );
}