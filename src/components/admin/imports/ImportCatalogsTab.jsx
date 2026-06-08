import React from 'react';
import { Checkbox } from '../../../components/ui';
import BaseImportTab from './BaseImportTab';
import { getStatusColor } from './utils';

export default function ImportCatalogsTab() {
  const handleSave = async (data) => {
    console.log("Saving Catalogs...", data);
    // TODO: Connect to Firestore
  };

  const renderDiffTable = ({ parsedData, selectedRows, toggleRow, toggleAll }) => (
    <table className="gcp-table" style={{ width: '100%', fontSize: '0.9rem' }}>
      <thead>
        <tr>
          <th style={{ width: '40px', textAlign: 'center' }}>
            <Checkbox checked={selectedRows.size === parsedData.length} onChange={(e) => toggleAll(e.target.checked)} />
          </th>
          <th>Status</th>
          <th>Original Extracted Name</th>
          <th>Semantic Mapping (Canonical)</th>
          <th>CAS Number / MW</th>
        </tr>
      </thead>
      <tbody>
        {parsedData.map((item, idx) => {
          // AI Semantic mapping mock improvement
          const needsMapping = item.original_text?.includes('arg') || item.original_text?.includes('acetate');
          const status = needsMapping ? 'MODIFIED' : 'NEW';
          const colors = getStatusColor(status);
          
          return (
            <tr key={idx} style={{ opacity: selectedRows.has(idx) ? 1 : 0.5 }}>
              <td style={{ textAlign: 'center' }}>
                <Checkbox checked={selectedRows.has(idx)} onChange={() => toggleRow(idx)} />
              </td>
              <td>
                <span style={{ 
                  backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}`,
                  padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700
                }}>
                  {colors.label}
                </span>
              </td>
              <td style={{ color: 'var(--text-muted)' }}>{item.original_text || item.peptide_name}</td>
              <td>
                <strong>{item.peptide_name}</strong>
                {needsMapping && <div style={{ fontSize: '0.75rem', color: '#854d0e', marginTop: '4px' }}>✨ AI Normalized</div>}
              </td>
              <td>
                {item.cas_number ? <span style={{ fontFamily: 'monospace' }}>CAS: {item.cas_number}</span> : <span style={{ color: '#cbd5e1' }}>--</span>}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  return (
    <BaseImportTab 
      title="Import Catalogs (Semantic Match)"
      description="Upload raw supplier catalogs. The AI will normalize weird peptide names into our canonical format (e.g. BPC157 arg -> BPC-157) and extract CAS numbers."
      context="Catalog"
      renderDiffTable={renderDiffTable}
      onSave={handleSave}
    />
  );
}
