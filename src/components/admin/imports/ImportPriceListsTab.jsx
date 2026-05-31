import React from 'react';
import BaseImportTab from './BaseImportTab';
import { getStatusColor } from './utils';

export default function ImportPriceListsTab() {
  const handleSave = async (data) => {
    console.log("Saving Price List...", data);
    // TODO: Connect to Firestore
  };

  const renderDiffTable = ({ parsedData, selectedRows, toggleRow, toggleAll }) => (
    <table className="gcp-table" style={{ width: '100%', fontSize: '0.9rem' }}>
      <thead>
        <tr>
          <th style={{ width: '40px', textAlign: 'center' }}>
            <input type="checkbox" checked={selectedRows.size === parsedData.length} onChange={(e) => toggleAll(e.target.checked)} />
          </th>
          <th>Status</th>
          <th>Product / Dosage</th>
          <th>New Supplier Cost</th>
          <th>Margin Impact (Simulated)</th>
        </tr>
      </thead>
      <tbody>
        {parsedData.map((item, idx) => {
          // Margin Impact mock logic
          const priceIncreased = Math.random() > 0.6;
          const status = priceIncreased ? 'MODIFIED' : 'UNCHANGED';
          const colors = getStatusColor(status);
          
          return (
            <tr key={idx} style={{ opacity: selectedRows.has(idx) ? 1 : 0.5 }}>
              <td style={{ textAlign: 'center' }}>
                <input type="checkbox" checked={selectedRows.has(idx)} onChange={() => toggleRow(idx)} />
              </td>
              <td>
                <span style={{ 
                  backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}`,
                  padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700
                }}>
                  {colors.label}
                </span>
              </td>
              <td>
                <strong>{item.peptide_name}</strong>
                {item.dosage && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.dosage}</div>}
              </td>
              <td>
                <strong>${item.unit_cost}</strong>
                {priceIncreased && <div style={{ fontSize: '0.75rem', color: '#ef4444' }}>↑ Up from ${(item.unit_cost * 0.8).toFixed(2)}</div>}
              </td>
              <td>
                {priceIncreased ? (
                  <span style={{ color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    📉 Margin drops by 12%
                  </span>
                ) : (
                  <span style={{ color: '#10b981', fontWeight: 600 }}>🟢 Margin Stable (45%)</span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  return (
    <BaseImportTab 
      title="Import Price Lists (Margin Simulator)"
      description="Upload supplier price lists (PDF/Excel). The AI will compare the new costs against your current selling prices and flag margin drops."
      context="PriceList"
      renderDiffTable={renderDiffTable}
      onSave={handleSave}
    />
  );
}
