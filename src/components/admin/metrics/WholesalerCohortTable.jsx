"use client";

import Building2 from "lucide-react/dist/esm/icons/building-2";
import React, { useState } from 'react';
import DataTable from '../../ui/DataTable';

export default function WholesalerCohortTable({ wholesalersWithStats }) {
  const [expanded, setExpanded] = useState({});
  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="amd-table-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 className="amd-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#202124' }}>
          <Building2 size={16} color="#1a73e8" />
          Wholesalers B2B Performance
        </h3>
        <span className="amd-caption" style={{ color: '#5f6368' }}>Active network volume</span>
      </div>

      <div className="gcp-table-container">
        <DataTable
          columns={[
            {
              key: 'name',
              header: 'Wholesaler',
              render: (val) => <span style={{ fontWeight: 600 }}>{val}</span>
            },
            {
              key: 'patientCount',
              header: 'Patients',
              render: (val) => <span style={{ textAlign: 'center', color: '#5f6368', display: 'block' }}>{val}</span>
            },
            {
              key: 'doctorCount',
              header: 'Total',
              render: (val, row) => (
                <span
                  className="amd-badge"
                  style={{ backgroundColor: '#e8f0fe', color: '#1a73e8', display: 'block', textAlign: 'center' }}
                >
                  {row.doctorCount + row.patientCount} members
                </span>
              )
            },
            {
              key: 'id',
              header: '',
              render: (val, row) => (
                <button
                  className="amd-expand-btn"
                  onClick={() => toggle(row.id)}
                  title="More details"
                >
                  {expanded[row.id] ? '▲' : '▼'}
                </button>
              )
            }
          ]}
          data={wholesalersWithStats}
          keyField="id"
          renderExpanded={(row) => expanded[row.id] ? (
            <div style={{ padding: '0.5rem 1rem', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
              <strong>Clinics &amp; Physicians:</strong> {row.doctorCount}
            </div>
          ) : null}
          emptyMessage="No wholesalers found."
        />
      </div>
    </div>
  );
}