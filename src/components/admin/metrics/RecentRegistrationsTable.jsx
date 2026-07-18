"use client";

import Users from "lucide-react/dist/esm/icons/users";
import React, { useState } from 'react';
import DataTable from '../../ui/DataTable';

export default function RecentRegistrationsTable({ recentUsers, wholesalerId, navigateToUserTab, formatDate }) {
  const [expanded, setExpanded] = useState({});
  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="amd-table-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 className="amd-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#202124' }}>
          <Users size={16} color="#1a73e8" />
          Recent Registrations
        </h3>
        <span className="amd-caption" style={{ color: '#5f6368' }}>Latest platform signups</span>
      </div>

      <div className="gcp-table-container">
        <DataTable
          columns={[
            {
              key: 'fullName',
              header: 'Name',
              render: (val, row) => (
                <span
                  style={{ fontWeight: 600, color: '#1a73e8', cursor: 'pointer' }}
                  onClick={() => navigateToUserTab(row.role)}
                >
                  {row.fullName || row.displayName || row.email || 'N/A'}
                </span>
              )
            },
            {
              key: 'role',
              header: 'Role',
              render: (val) => (
                <span style={{ textAlign: 'center', textTransform: 'capitalize', color: '#5f6368', display: 'block' }}>
                  {val || 'patient'}
                </span>
              )
            },
            {
              key: 'status',
              header: 'Status',
              render: (val) => (
                <span
                  className="amd-badge"
                  style={{
                    backgroundColor: val === 'active' ? '#e6f4ea' : '#fef7e0',
                    color: val === 'active' ? '#137333' : '#b06000',
                    display: 'block',
                    textAlign: 'center',
                  }}
                >
                  {val || 'pending'}
                </span>
              )
            },
            {
              key: 'id',
              header: '',
              render: (val, row) => (
                <button
                  className="amd-expand-btn"
                  onClick={(e) => { e.stopPropagation(); toggle(row.id); }}
                  title="More details"
                >
                  {expanded[row.id] ? '▲' : '▼'}
                </button>
              )
            }
          ]}
          data={recentUsers}
          keyField="id"
          renderExpanded={(row) => expanded[row.id] ? (
            <div style={{ padding: '0.75rem 1rem', background: 'var(--surface)', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div><strong>Email:</strong> {row.email || 'N/A'}</div>
              <div><strong>Geographical Zone:</strong> {row.geographicalZone || row.zone || 'N/A'}</div>
              <div><strong>Created At:</strong> {formatDate(row.createdAt)}</div>
            </div>
          ) : null}
          emptyMessage="No recent registrations found."
        />
      </div>
    </div>
  );
}