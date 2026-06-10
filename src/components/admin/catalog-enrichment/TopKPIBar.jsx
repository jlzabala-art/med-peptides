import React from 'react';
import { Card } from '../../ui';
import { CheckCircle, XCircle, AlertTriangle, CloudOff, Database, Activity, Star } from 'lucide-react';

export default function TopKPIBar({ auditResults }) {
  const matched = auditResults.filter(r => r.confidence >= 90).length;
  const missing = auditResults.filter(r => r.confidence === 0).length;
  const dosageMismatch = auditResults.filter(r => r.confidence > 0 && r.confidence < 90 && r.reason?.includes('Dosage')).length;
  const supplierMismatch = auditResults.filter(r => r.confidence > 0 && r.confidence < 90 && r.reason?.includes('Supplier')).length;
  const notSynced = auditResults.filter(r => r.zohoStatus === 'Pending' || r.zohoStatus === 'Error').length;
  const ready = auditResults.filter(r => r.zohoStatus === 'Ready').length;

  // Calculate Health Score (simple mock calculation based on matches)
  const total = auditResults.length || 1;
  const healthScore = Math.round(((matched + ready) / (total * 2)) * 100) || 0;

  const kpis = [
    { label: 'Matched', value: matched, icon: CheckCircle, color: 'var(--color-success)' },
    { label: 'Missing', value: missing, icon: XCircle, color: 'var(--color-danger)' },
    { label: 'Dosage Mismatch', value: dosageMismatch, icon: AlertTriangle, color: '#f59e0b' },
    { label: 'Missing Supplier', value: supplierMismatch, icon: Database, color: '#8b5cf6' },
    { label: 'Not Synced', value: notSynced, icon: CloudOff, color: 'var(--text-muted)' },
    { label: 'Ready For Import', value: ready, icon: Activity, color: '#0ea5e9' },
  ];

  return (
    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
      
      {/* KPI Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
        gap: '1rem',
        flex: 1
      }}>
        {kpis.map((kpi, idx) => (
          <Card key={idx} style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {kpi.label}
              </span>
              <kpi.icon size={16} color={kpi.color} />
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {kpi.value}
            </div>
          </Card>
        ))}
      </div>

      {/* Health Score Card */}
      <Card style={{ 
        padding: '1.25rem', 
        minWidth: '200px', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, rgba(26,115,232,0.05) 0%, rgba(26,115,232,0.1) 100%)',
        border: '1px solid rgba(26,115,232,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
          <Star size={18} fill="currentColor" />
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Catalog Quality</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
          <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>{healthScore}</span>
          <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>/ 100</span>
        </div>
      </Card>

    </div>
  );
}
