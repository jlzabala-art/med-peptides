import Building2 from "lucide-react/dist/esm/icons/building-2";
import React, { useState } from 'react';


export default function WholesalerCohortTable({ wholesalersWithStats }) {
  const [expanded, setExpanded] = useState({});
  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

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
          <Building2 size={16} color="#1a73e8" />
          Wholesalers B2B Performance
        </h3>
        <span className="amd-caption" style={{ color: '#5f6368' }}>
          Active network volume
        </span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Wholesaler</th>
              <th style={{ textAlign: 'center' }}>Patients</th>
              <th style={{ textAlign: 'center' }}>Total</th>
              <th style={{ width: '2rem' }}></th>
            </tr>
          </thead>
          <tbody>
            {wholesalersWithStats.map((ws) => (
              <React.Fragment key={ws.id}>
                <tr>
                  <td style={{ fontWeight: 600 }}>{ws.name}</td>
                  <td style={{ textAlign: 'center', color: '#5f6368' }}>{ws.patientCount}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span
                      className="amd-badge"
                      style={{ backgroundColor: '#e8f0fe', color: '#1a73e8' }}
                    >
                      {ws.doctorCount + ws.patientCount} members
                    </span>
                  </td>
                  <td>
                    <button
                      className="amd-expand-btn"
                      onClick={() => toggle(ws.id)}
                      title="More details"
                    >
                      {expanded[ws.id] ? '▲' : '▼'}
                    </button>
                  </td>
                </tr>
                {expanded[ws.id] && (
                  <tr className="amd-expanded-row">
                    <td colSpan={4}>
                      <strong>Clinics &amp; Physicians:</strong> {ws.doctorCount}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {wholesalersWithStats.length === 0 && (
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
                  No wholesalers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}