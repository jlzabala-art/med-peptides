import React from 'react';
import { FileText, Clock, Send, CheckCircle, TrendingUp, DollarSign } from '@/lib/icons';

export default function QuotationsKPIBanner({ quotations = [], loading = false }) {
  // Skeleton KPI
  if (loading) {
    return (
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ flex: '1 1 180px', minWidth: '150px', background: 'var(--color-bg-surface)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ width: 40, height: 40, borderRadius: '8px', background: 'var(--color-bg-subtle)', marginBottom: '1rem' }} />
            <div style={{ height: '14px', width: '60%', background: 'var(--color-bg-subtle)', borderRadius: '4px', marginBottom: '0.5rem' }} />
            <div style={{ height: '24px', width: '80%', background: 'var(--color-bg-subtle)', borderRadius: '6px' }} />
          </div>
        ))}
      </div>
    );
  }

  const draftCount = quotations.filter(q => q.status === 'Draft').length;
  const pendingCount = quotations.filter(q => q.status === 'Pending Review' || q.status === 'Negotiation').length;
  const sentCount = quotations.filter(q => q.status === 'Sent' || q.status === 'Viewed').length;
  const acceptedCount = quotations.filter(q => q.status === 'Accepted' || q.status === 'Converted').length;

  const acceptedOrders = quotations.filter(q => q.status === 'Accepted' || q.status === 'Converted');
  const totalRevenue = acceptedOrders.reduce((sum, q) => sum + (Number(q.totalAmount) || 0), 0);
  
  const totalMarginPercent = acceptedOrders.reduce((sum, q) => sum + (Number(q.marginPercent) || 0), 0);
  const avgMargin = acceptedOrders.length > 0 ? (totalMarginPercent / acceptedOrders.length) : 0;

  const kpis = [
    { label: 'Drafts', value: draftCount, icon: FileText, color: '#64748b', bg: '#f1f5f9' },
    { label: 'Pending Review', value: pendingCount, icon: Clock, color: '#f59e0b', bg: '#fef3c7' },
    { label: 'Sent', value: sentCount, icon: Send, color: '#3b82f6', bg: '#dbeafe' },
    { label: 'Accepted', value: acceptedCount, icon: CheckCircle, color: '#10b981', bg: '#d1fae5' },
    { label: 'Total Revenue (Won)', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: '#0ea5e9', bg: '#e0f2fe' },
    { label: 'Avg Margin (Won)', value: `${avgMargin.toFixed(1)}%`, icon: TrendingUp, color: '#8b5cf6', bg: '#ede9fe' },
  ];

  return (
    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div key={idx} style={{ 
            flex: '1 1 180px', 
            minWidth: '150px', 
            background: 'var(--color-bg-surface)', 
            padding: '1.25rem', 
            borderRadius: '12px', 
            border: '1px solid var(--border)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
          }}>
            <div style={{ 
              width: 40, height: 40, borderRadius: '8px', 
              background: kpi.bg, color: kpi.color, 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '1rem' 
            }}>
              <Icon size={20} />
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '0.25rem' }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {kpi.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
