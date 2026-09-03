import React from 'react';
import { Checkbox } from '../../../components/ui';
import BaseImportTab from './BaseImportTab';
import { getStatusColor } from './utils';
import productRepository from '../../../repositories/productRepository';
import DataTable from '../../ui/DataTable';
import StatusChip from '../../ui/StatusChip';
import { toast } from 'react-hot-toast';

export default function ImportCatalogsTab() {
  const handleSave = async (data) => {
    try {
      await productRepository.importCatalogs(data);
      toast.success('Catalogs saved successfully!');
    } catch (error) {
      console.error('Error saving catalogs:', error);
      toast.error('Failed to save catalogs.');
    }
  };

  const renderDiffTable = ({ parsedData, selectedRows, toggleRow, toggleAll }) => {
    const tableData = parsedData.map((item, idx) => {
      const needsMapping = item.original_text?.includes('arg') || item.original_text?.includes('acetate');
      const status = needsMapping ? 'MODIFIED' : 'NEW';
      const colors = getStatusColor(status);
      return { ...item, _idx: idx, _status: status, _colors: colors, _needsMapping: needsMapping };
    });

    const columns = [
      {
        key: '_select',
        header: (
          <Checkbox
            checked={selectedRows.size === parsedData.length}
            onChange={(e) => toggleAll(e.target.checked)}
          />
        ),
        render: (r) => (
          <Checkbox checked={selectedRows.has(r._idx)} onChange={() => toggleRow(r._idx)} />
        )
      },
      {
        key: '_status',
        header: 'Status',
        render: (r) => (
          <span style={{
            backgroundColor: r._colors.bg, color: r._colors.text, border: `1px solid ${r._colors.border}`,
            padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700
          }}>
            {r._colors.label}
          </span>
        )
      },
      {
        key: 'original_text',
        header: 'Original Extracted Name',
        render: (r) => <span style={{ color: 'var(--text-muted)' }}>{r.original_text || r.peptide_name}</span>
      },
      {
        key: 'peptide_name',
        header: 'Semantic Mapping (Canonical)',
        render: (r) => (
          <div>
            <strong>{r.peptide_name}</strong>
            {r._needsMapping && <div style={{ fontSize: '0.75rem', color: '#854d0e', marginTop: '4px' }}>✨ AI Normalized</div>}
          </div>
        )
      },
      {
        key: 'cas_number',
        header: 'CAS Number / MW',
        render: (r) => r.cas_number
          ? <span style={{ fontFamily: 'monospace' }}>CAS: {r.cas_number}</span>
          : <span style={{ color: '#cbd5e1' }}>--</span>
      }
    ];

    return (
      <div style={{ opacity: 1 }}>
        <DataTable
          data={tableData}
          columns={columns}
          keyField="_idx"
          emptyTitle="No catalog data"
          emptyDescription="Upload a file to see parsed items."
          rowStyle={(r) => ({ opacity: selectedRows.has(r._idx) ? 1 : 0.5 })}
        />
      </div>
    );
  };

  return (
    <BaseImportTab
      title="Import Catalogs (Semantic Match)"
      description="Upload raw supplier catalogs. The AI will normalize weird peptide names into our canonical format (e.g. BPC157 arg → BPC-157) and extract CAS numbers."
      context="Catalog"
      renderDiffTable={renderDiffTable}
      onSave={handleSave}
    />
  );
}
