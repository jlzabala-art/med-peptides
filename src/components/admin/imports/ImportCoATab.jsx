import React from 'react';
import { Checkbox } from '../../../components/ui';
import BaseImportTab from './BaseImportTab';
import { getStatusColor } from './utils';
import * as XLSX from 'xlsx';
import { Download } from '@/lib/icons';
import productRepository from '../../../repositories/productRepository';
import DataTable from '../../ui/DataTable';

export default function ImportCoATab() {
  const handleSave = async (data) => {
    try {
      await productRepository.importCoAs(data);
      alert('Certificates saved successfully!');
    } catch (error) {
      console.error('Error saving certificates:', error);
      alert('Failed to save certificates.');
    }
  };

  const renderDiffTable = ({ parsedData, selectedRows, toggleRow, toggleAll, updateRow }) => {
    const exportErrors = () => {
      const errors = parsedData.filter(item => parseFloat(item.purity_percentage) < 98);
      const worksheet = XLSX.utils.js_to_sheet(errors);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Quarantined");
      XLSX.writeFile(workbook, "Quarantined_Batches.xlsx");
    };

    const tableData = parsedData.map((item, idx) => {
      const purity = parseFloat(item.purity_percentage);
      const isQuarantined = purity < 98;
      const status = isQuarantined ? 'ALERT' : 'UNCHANGED';
      const colors = getStatusColor(status);
      const score = item.confidence_score || 0;
      let confColor = '#10b981';
      if (score < 50) confColor = '#ef4444';
      else if (score < 80) confColor = '#f59e0b';
      return { ...item, _idx: idx, _isQuarantined: isQuarantined, _colors: colors, _score: score, _confColor: confColor };
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
        render: (r) => <Checkbox checked={selectedRows.has(r._idx)} onChange={() => toggleRow(r._idx)} />
      },
      {
        key: '_score',
        header: 'AI Confidence',
        sortValue: (r) => r._score,
        render: (r) => <span style={{ fontWeight: 700, color: r._confColor }}>{r._score}%</span>
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
        key: 'batch_number',
        header: 'Batch Number',
        render: (r) => (
          <input
            type="text"
            value={r.batch_number || ''}
            onChange={(e) => updateRow(r._idx, 'batch_number', e.target.value)}
            style={{ width: '100%', padding: '0.25rem', border: '1px solid var(--border)', borderRadius: '4px', fontWeight: 'bold' }}
          />
        )
      },
      {
        key: 'peptide_name',
        header: 'Product Tested',
        render: (r) => (
          <input
            type="text"
            value={r.peptide_name || ''}
            onChange={(e) => updateRow(r._idx, 'peptide_name', e.target.value)}
            style={{ width: '100%', padding: '0.25rem', border: '1px solid var(--border)', borderRadius: '4px' }}
          />
        )
      },
      {
        key: 'purity_percentage',
        header: 'Purity %',
        align: 'right',
        render: (r) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input
              type="number"
              step="0.1"
              value={r.purity_percentage || ''}
              onChange={(e) => updateRow(r._idx, 'purity_percentage', parseFloat(e.target.value))}
              style={{ width: '60px', padding: '0.25rem', border: '1px solid var(--border)', borderRadius: '4px', textAlign: 'right', fontWeight: 'bold', color: r._isQuarantined ? '#ef4444' : '#10b981' }}
            />%
          </div>
        )
      },
      {
        key: '_action',
        header: 'Action Required',
        render: (r) => r._isQuarantined
          ? <span style={{ color: '#ef4444', fontWeight: 600 }}>⚠️ Manager Override Required</span>
          : <span style={{ color: '#10b981' }}>Clear for Inventory</span>
      }
    ];

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button onClick={exportErrors} className="gcp-btn gcp-btn--secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', padding: '4px 12px' }}>
            <Download size={14} /> Export Quarantined to Excel
          </button>
        </div>
        <DataTable
          data={tableData}
          columns={columns}
          keyField="_idx"
          emptyTitle="No CoA data"
          emptyDescription="Upload a Certificate of Analysis file to see parsed items."
          rowStyle={(r) => ({
            backgroundColor: r._score < 50 && selectedRows.has(r._idx) ? '#fef2f2' : (r._isQuarantined ? '#fef2f2' : 'transparent'),
            opacity: selectedRows.has(r._idx) ? 1 : 0.5
          })}
        />
      </div>
    );
  };

  return (
    <BaseImportTab
      title="Import Certificates (Auto-Quarantine)"
      description="Upload Certificates of Analysis (PDF/Images). The AI will extract purity levels and automatically flag batches under 98% purity for managerial review."
      context="COA"
      renderDiffTable={renderDiffTable}
      onSave={handleSave}
    />
  );
}
