import React from 'react';
import { Globe } from 'lucide-react';

export default function PageVisitsTable({ visitsPeriod, setVisitsPeriod, prioritizedViews }) {
  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '1.5rem',
        border: '1px solid #dadce0',
        boxShadow: '0 1px 2px 0 rgba(60,67,70,0.1)',
        marginBottom: '2rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '1rem',
            fontWeight: 600,
            color: '#202124',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Globe size={18} color="#1a73e8" />
          Page Visits Analytics
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: '#5f6368', fontWeight: 500 }}>
            Timeframe:
          </span>
          <select
            value={visitsPeriod}
            onChange={(e) => setVisitsPeriod(e.target.value)}
            style={{
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              border: '1px solid #dadce0',
              fontSize: '0.72rem',
              color: '#3c4043',
              backgroundColor: 'var(--color-bg-surface)',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.8rem',
            textAlign: 'left',
          }}
        >
          <thead>
            <tr style={{ borderBottom: '2px solid #dadce0', backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#5f6368' }}>
                Page Path
              </th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#5f6368' }}>
                Page Title
              </th>
              <th
                style={{
                  padding: '0.75rem 1rem',
                  fontWeight: 600,
                  color: '#5f6368',
                  textAlign: 'center',
                }}
              >
                Visits
              </th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#5f6368' }}>
                Geographical Origins (Top)
              </th>
            </tr>
          </thead>
          <tbody>
            {prioritizedViews.map((view, idx) => {
              const countryStrings = Object.entries(view.countries)
                .sort((a, b) => b[1] - a[1])
                .map(([country, count]) => `${country} (${count})`)
                .join(', ');

              return (
                <tr
                  key={idx}
                  style={{
                    borderBottom: '1px solid #dadce0',
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8f9fa')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td
                    style={{
                      padding: '0.75rem 1rem',
                      fontWeight: 600,
                      color: '#1a73e8',
                    }}
                  >
                    {view.path}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#202124' }}>{view.title}</td>
                  <td
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'center',
                      fontWeight: 700,
                      color: '#202124',
                    }}
                  >
                    {view.count}
                  </td>
                  <td
                    style={{ padding: '0.75rem 1rem', color: '#5f6368', fontSize: '0.75rem' }}
                  >
                    {countryStrings || 'N/A'}
                  </td>
                </tr>
              );
            })}
            {prioritizedViews.length === 0 && (
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
                  No page views recorded in this period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
