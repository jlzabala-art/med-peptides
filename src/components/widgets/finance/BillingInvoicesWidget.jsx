import React from 'react';
import { FileText, Download } from '@/lib/icons';
import BaseWidget from '../core/BaseWidget';

import { useRoleAccess } from '../../../hooks/useRoleAccess';

export default function BillingInvoicesWidget(props) {
  const { is } = useRoleAccess();

  const invoices = [
    { id: 'INV-2026-001', amount: 1250, status: 'PAID', date: '2026-05-01' },
    { id: 'INV-2026-002', amount: 3400, status: 'PENDING', date: '2026-06-10' },
    { id: 'INV-2026-003', amount: 890, status: 'OVERDUE', date: '2026-04-15' },
  ];

  return (
    <BaseWidget 
      title={is('patient') ? "My Invoices" : "B2B Medical Billing"} 
      icon={FileText} 
      {...props}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {invoices.map(invoice => (
          <div 
            key={invoice.id} 
            style={{
              padding: '10px 12px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div 
                style={{
                  padding: '6px',
                  borderRadius: '6px',
                  backgroundColor: invoice.status === 'PAID' ? '#dcfce7' : invoice.status === 'PENDING' ? '#fef9c3' : '#fee2e2',
                  color: invoice.status === 'PAID' ? '#166534' : invoice.status === 'PENDING' ? '#854d0e' : '#991b1b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FileText size={15} />
              </div>
              <div>
                <p style={{ margin: 0, color: '#0f172a', fontWeight: 700, fontSize: '0.85rem' }}>{invoice.id}</p>
                <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '0.74rem' }}>{invoice.date}</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: '#0f172a', fontWeight: 800, fontSize: '0.88rem' }}>${invoice.amount}</span>
              <button 
                style={{
                  padding: '5px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  color: '#475569',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Download invoice"
              >
                <Download size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </BaseWidget>
  );
}
