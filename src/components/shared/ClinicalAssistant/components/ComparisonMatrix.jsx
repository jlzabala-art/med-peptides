import Scale from "lucide-react/dist/esm/icons/scale";
import Check from "lucide-react/dist/esm/icons/check";
import X from "lucide-react/dist/esm/icons/x";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
/* eslint-disable no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';
import DataTable from '@/components/ui/DataTable';





export default function ComparisonMatrix({ 
  compounds = [], 
  rows = [
    { label: 'Primary Goal', key: 'goal' },
    { label: 'Mechanism', key: 'mechanism' },
    { label: 'Research Maturity', key: 'maturity' },
    { label: 'Administration', key: 'admin' }
  ],
  data = {} 
}) {
  return (
    <div style={{
      margin: '1rem 0',
      width: '100%',
      backgroundColor: 'white',
      borderRadius: '20px',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
    }}>
      <div style={{
        padding: '1rem',
        backgroundColor: 'var(--color-bg-app)',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem'
      }}>
        <Scale size={18} color="var(--primary)" />
        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>Comparison Matrix</span>
      </div>

      <DataTable
        columns={[
          {
            key: 'label',
            header: 'Parameter',
            width: '30%',
            render: (val) => (
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-text-secondary)' }}>
                {val}
              </span>
            ),
          },
          ...compounds.map((c, idx) => ({
            key: `cmp_${idx}`,
            header: c,
            align: 'center',
            render: (val) => val || '—',
          })),
        ]}
        data={rows.map((row, ri) => {
          const item = { id: row.key || `row-${ri}`, label: row.label };
          compounds.forEach((c, ci) => {
            item[`cmp_${ci}`] = data[c]?.[row.key] || '—';
          });
          return item;
        })}
        pagination={false}
        enableAskAtlas={false}
      />
      <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--color-bg-surface)', fontSize: '0.62rem', color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>
        * Based on current clinical research data and comparative analysis.
      </div>
    </div>
  );
}