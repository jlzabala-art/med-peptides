import X from "lucide-react/dist/esm/icons/x";
import ExternalLink from "lucide-react/dist/esm/icons/external-link";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import CloudLightning from "lucide-react/dist/esm/icons/cloud-lightning";
import Activity from "lucide-react/dist/esm/icons/activity";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import Box from "lucide-react/dist/esm/icons/box";
import React from 'react';








import AccountManagerWorkspace from './AccountManagerWorkspace';

export default function InvoiceDetailWorkspace({ invoice, onClose }) {
  const amount = Number(invoice.grandTotal) || Number(invoice.totalAmount) || 0;
  // Mock logic based on the user's prompt requirements
  const isOverdue = invoice.status === 'Overdue';
  const riskScore = isOverdue ? 32 : (invoice.status === 'Paid' ? 95 : 84);
  const paidAmount = invoice.status === 'Paid' ? amount : (invoice.status === 'Partially Paid' ? amount * 0.4 : 0);
  const outstandingAmount = amount - paidAmount;
  const progressPercent = amount > 0 ? (paidAmount / amount) * 100 : 0;

  return (
    <div style={{ 
      width: '450px', background: 'white', borderLeft: '1px solid var(--border)', 
      display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' 
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>{invoice.documentNumber || invoice.id.slice(0,8)}</h2>
            <span style={{ 
              background: invoice.status === 'Paid' ? '#dcfce7' : (isOverdue ? '#fef2f2' : '#fef3c7'),
              color: invoice.status === 'Paid' ? '#166534' : (isOverdue ? '#b91c1c' : '#854d0e'),
              padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700
            }}>
              {invoice.status || 'Draft'}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>{invoice.customerName}</p>
        </div>
        <button onClick={onClose} style={{ background: 'var(--bg-subtle)', border: 'none', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <X size={18} color="var(--color-text-tertiary)" />
        </button>
      </div>

      {/* Atlas AI Copilot */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', letterSpacing: '0.5px' }}>Atlas AI Financial Copilot</h3>
        <div style={{ background: 'linear-gradient(to right, #1e293b, #0f172a)', borderRadius: '12px', padding: '1.25rem', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Payment Risk Score</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {riskScore > 80 ? <ShieldCheck size={18} color="#34d399" /> : <AlertTriangle size={18} color="#fbbf24" />}
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: riskScore > 80 ? '#34d399' : '#fbbf24' }}>{riskScore}/100</span>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5 }}>
            {riskScore > 80 
              ? "This customer has an excellent payment history. No collection risks identified."
              : "Warning: Customer's average payment delay is increasing. High risk of becoming overdue."}
          </p>
        </div>
      </div>

      {/* Payment Visibility */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', letterSpacing: '0.5px' }}>Payment Status</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Total</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>€{amount.toLocaleString()}</span>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'var(--bg-subtle)', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}>
          <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--color-primary)', transition: 'width 0.5s ease-out' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Paid</p>
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#10b981' }}>€{paidAmount.toLocaleString()}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Outstanding</p>
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: outstandingAmount > 0 ? '#ef4444' : 'var(--color-text-primary)' }}>€{outstandingAmount.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Customer Financial Panel */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', letterSpacing: '0.5px' }}>Customer Financial Health</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Credit Limit</p>
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>€50,000</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Avg. Delay</p>
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>12 Days</p>
          </div>
        </div>
      </div>

      {/* Account Manager Workspace */}
      <AccountManagerWorkspace invoice={invoice} />

      {/* Zoho Integration */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CloudLightning size={16} color="#10b981" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Zoho Books Sync</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Synced 3 mins ago</span>
        </div>
        <button style={{ 
          width: '100%', padding: '0.75rem', background: 'white', border: '1px solid var(--border)', 
          borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
          fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-primary)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}>
          Open in Zoho Books <ExternalLink size={16} />
        </button>
      </div>

    </div>
  );
}