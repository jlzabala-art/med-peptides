import React, { useState } from 'react';
import { Users } from 'lucide-react';

export default function RecentRegistrationsTable({ recentUsers, wholesalerId, navigateToUserTab, formatDate }) {
  const [expanded, setExpanded] = useState({});

  const toggle = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="amd-table-section">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <h3
          className="amd-title"
          style={{
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#202124',
          }}
        >
          <Users size={16} color="#1a73e8" />
          Recent Registrations
        </h3>
        <span className="amd-caption" style={{ color: '#5f6368' }}>
          Latest platform signups
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th style={{ textAlign: 'center' }}>Role</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ width: '2rem' }}></th>
            </tr>
          </thead>
          <tbody>
            {recentUsers.map((user) => (
              <React.Fragment key={user.id}>
                <tr style={{ cursor: 'pointer' }} onClick={() => navigateToUserTab(user.role)}>
                  <td style={{ fontWeight: 600, color: '#1a73e8' }}>
                    {user.fullName || user.displayName || user.email || 'N/A'}
                  </td>
                  <td
                    style={{
                      textAlign: 'center',
                      textTransform: 'capitalize',
                      color: '#5f6368',
                    }}
                  >
                    {user.role || 'patient'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span
                      className="amd-badge"
                      style={{
                        backgroundColor: user.status === 'active' ? '#e6f4ea' : '#fef7e0',
                        color: user.status === 'active' ? '#137333' : '#b06000',
                      }}
                    >
                      {user.status || 'pending'}
                    </span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button
                      className="amd-expand-btn"
                      onClick={() => toggle(user.id)}
                      title="More details"
                    >
                      {expanded[user.id] ? '▲' : '▼'}
                    </button>
                  </td>
                </tr>
                {expanded[user.id] && (
                  <tr className="amd-expanded-row" onClick={(e) => e.stopPropagation()}>
                    <td colSpan={4}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div>
                          <strong>Email:</strong> {user.email || 'N/A'}
                        </div>
                        <div>
                          <strong>Geographical Zone:</strong> {user.geographicalZone || user.zone || 'N/A'}
                        </div>
                        <div>
                          <strong>Created At:</strong> {formatDate(user.createdAt)}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {recentUsers.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: '#9aa0a6',
                    fontStyle: 'italic',
                  }}
                >
                  No recent registrations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
