import React from 'react';
import '../../styles/gcp-theme.css';

export default function GcpTable({ headers = [], children, className = '', style = {} }) {
  return (
    <div className={`gcp-table-container ${className}`} style={style}>
      <table className="gcp-table">
        {headers && headers.length > 0 && (
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i}>{h}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {children}
        </tbody>
      </table>
    </div>
  );
}
