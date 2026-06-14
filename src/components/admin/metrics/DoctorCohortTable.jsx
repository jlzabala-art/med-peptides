import Users from "lucide-react/dist/esm/icons/users";
import React, { useState } from 'react';


export default function DoctorCohortTable({ wholesalerId, scopedDoctors, doctorsWithPatients }) {
  const [expanded, setExpanded] = useState({});
  const rows = wholesalerId ? scopedDoctors : doctorsWithPatients;
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
          <Users size={16} color="#1a73e8" />
          Physicians &amp; Clinics — Patient Volume
        </h3>
        <span className="amd-caption" style={{ color: '#5f6368' }}>
          Ordered by patient count
        </span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th style={{ textAlign: 'center' }}>Role</th>
              <th style={{ textAlign: 'center' }}>Patients</th>
              <th style={{ width: '2rem' }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((doc) => (
              <React.Fragment key={doc.id}>
                <tr>
                  <td style={{ fontWeight: 600 }}>{doc.name}</td>
                  <td
                    style={{
                      textAlign: 'center',
                      textTransform: 'capitalize',
                      color: '#5f6368',
                    }}
                  >
                    {doc.role}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span
                      className="amd-badge"
                      style={{
                        backgroundColor: doc.patientCount > 0 ? '#e6f4ea' : '#f1f3f4',
                        color: doc.patientCount > 0 ? '#137333' : '#5f6368',
                      }}
                    >
                      {doc.patientCount} {doc.patientCount === 1 ? 'patient' : 'patients'}
                    </span>
                  </td>
                  <td>
                    {doc.institution && (
                      <button
                        className="amd-expand-btn"
                        onClick={() => toggle(doc.id)}
                        title="More details"
                      >
                        {expanded[doc.id] ? '▲' : '▼'}
                      </button>
                    )}
                  </td>
                </tr>
                {expanded[doc.id] && doc.institution && (
                  <tr className="amd-expanded-row">
                    <td colSpan={4}>
                      <strong>Institution:</strong> {doc.institution}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {rows.length === 0 && (
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
                  No physicians or clinics found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}