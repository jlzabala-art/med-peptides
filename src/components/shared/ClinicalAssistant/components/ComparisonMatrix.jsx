import Scale from "lucide-react/dist/esm/icons/scale";
import Check from "lucide-react/dist/esm/icons/check";
import X from "lucide-react/dist/esm/icons/x";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
/* eslint-disable no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';





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

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
          <thead>
            <tr>
              <th style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', background: 'var(--color-bg-surface)', width: '30%' }}></th>
              {compounds.map((c, i) => (
                <th key={i} style={{
                  padding: '1rem',
                  borderBottom: '2px solid var(--primary)',
                  backgroundColor: 'white',
                  textAlign: 'center',
                  fontSize: '0.78rem',
                  fontWeight: 900,
                  color: 'var(--primary)',
                  textTransform: 'uppercase'
                }}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} style={{ backgroundColor: ri % 2 === 0 ? 'transparent' : '#fcfdfe' }}>
                <td style={{
                  padding: '0.85rem 1rem',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: 'var(--color-text-secondary)',
                  borderBottom: '1px solid #f1f5f9'
                }}>
                  {row.label}
                </td>
                {compounds.map((c, ci) => (
                  <td key={ci} style={{
                    padding: '0.85rem 1rem',
                    fontSize: '0.75rem',
                    color: 'var(--color-text-primary)',
                    textAlign: 'center',
                    borderBottom: '1px solid #f1f5f9',
                    borderLeft: '1px solid #f1f5f9'
                  }}>
                    {data[c]?.[row.key] || '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--color-bg-surface)', fontSize: '0.62rem', color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>
        * Based on current clinical research data and comparative analysis.
      </div>
    </div>
  );
}