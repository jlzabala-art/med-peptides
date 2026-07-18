import React from 'react';
import { Globe } from '@/lib/icons';
import DataTable from '../../ui/DataTable';

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#202124', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Globe size={18} color="#1a73e8" />
          Page Visits Analytics
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: '#5f6368', fontWeight: 500 }}>Timeframe:</span>
          <select
            value={visitsPeriod}
            onChange={(e) => setVisitsPeriod(e.target.value)}
            style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #dadce0', fontSize: '0.72rem', color: '#3c4043', backgroundColor: 'var(--color-bg-surface)', cursor: 'pointer', outline: 'none' }}
          >
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      <div className="gcp-table-container">
        <DataTable
          columns={[
            {
              key: 'path',
              header: 'Page Path',
              render: (val) => <span style={{ fontWeight: 600, color: '#1a73e8' }}>{val}</span>
            },
            {
              key: 'title',
              header: 'Page Title',
              render: (val) => <span style={{ color: '#202124' }}>{val}</span>
            },
            {
              key: 'count',
              header: 'Visits',
              render: (val) => <span style={{ display: 'block', textAlign: 'center', fontWeight: 700, color: '#202124' }}>{val}</span>
            },
            {
              key: 'countries',
              header: 'Geographical Origins (Top)',
              render: (val) => {
                const countryStrings = Object.entries(val || {})
                  .sort((a, b) => b[1] - a[1])
                  .map(([country, count]) => `${country} (${count})`)
                  .join(', ');
                return <span style={{ color: '#5f6368', fontSize: '0.75rem' }}>{countryStrings || 'N/A'}</span>;
              }
            }
          ]}
          data={prioritizedViews}
          keyField={(row, idx) => idx.toString()}
          emptyMessage="No page views recorded in this period."
        />
      </div>
    </div>
  );
}