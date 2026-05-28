import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function DataTable({ columns, data, keyField = 'id', emptyMessage = 'No data found.', expandableRender }) {
  const [expandedId, setExpandedId] = useState(null);
  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead style={{ backgroundColor: 'var(--color-bg-app)', borderBottom: '1px solid var(--color-border)' }}>
          <tr>
            {expandableRender && <th style={{ width: '40px', padding: '1rem' }}></th>}
            {columns.map((col, idx) => (
              <th 
                key={col.key || idx} 
                style={{ 
                  padding: '1rem', 
                  fontSize: '0.85rem', 
                  fontWeight: 600, 
                  color: 'var(--color-text-secondary)',
                  textAlign: col.align || 'left',
                  width: col.width || 'auto'
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            const isExpanded = expandedId === row[keyField];
            return (
              <React.Fragment key={row[keyField]}>
                <tr 
                  onClick={() => expandableRender && setExpandedId(isExpanded ? null : row[keyField])}
                  style={{ 
                    borderBottom: '1px solid var(--color-border)', 
                    cursor: expandableRender ? 'pointer' : 'default',
                    backgroundColor: isExpanded ? 'var(--color-bg-hover)' : 'transparent'
                  }}
                >
                  {expandableRender && (
                    <td style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </td>
                  )}
                  {columns.map((col, idx) => (
                    <td 
                      key={col.key || idx} 
                      style={{ 
                        padding: '1rem', 
                        fontSize: '0.9rem', 
                        color: 'var(--color-text-primary)',
                        textAlign: col.align || 'left'
                      }}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
                {isExpanded && expandableRender && (
                  <tr style={{ backgroundColor: 'var(--color-bg-hover)', borderBottom: '1px solid var(--color-border)' }}>
                    <td colSpan={columns.length + 1} style={{ padding: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
                      {expandableRender(row)}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
