import React from 'react';
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Mail from "lucide-react/dist/esm/icons/mail";
import Edit from "lucide-react/dist/esm/icons/edit";
import Eye from "lucide-react/dist/esm/icons/eye";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import Truck from "lucide-react/dist/esm/icons/truck";

function fmtShortDate(date) {
  if (!date) return '';
  const d = date?.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function ActivityTimeline({ document }) {
  // Mock generating a realistic timeline based on document status
  const events = [];
  
  if (document.createdAt) {
    events.push({ icon: FileText, color: '#64748b', bg: '#f1f5f9', title: 'Document Created', time: document.createdAt, desc: 'Initial draft created.' });
  }

  // Quotation Specifics
  if (document.status === 'Sent' || document.status === 'Accepted' || document.commercialStatus) {
    events.push({ icon: Mail, color: '#2563eb', bg: '#eff6ff', title: 'Sent to Customer', time: new Date(Date.now() - 86400000 * 2), desc: 'Email delivered to primary contact.' });
    events.push({ icon: Eye, color: '#8b5cf6', bg: '#f3e8ff', title: 'Viewed by Customer', time: new Date(Date.now() - 86400000 * 1.5), desc: 'Customer opened the proposal link.' });
  }

  if (document.status === 'Accepted' || document.commercialStatus === 'Accepted') {
    events.push({ icon: CheckCircle2, color: '#059669', bg: '#d1fae5', title: 'Approved', time: new Date(Date.now() - 86400000), desc: 'Terms accepted.' });
  }

  // Order Specifics
  if (document.operationalStatus === 'Manufacturing' || document.operationalStatus === 'Ready to Ship' || document.operationalStatus === 'Delivered') {
    events.push({ icon: Truck, color: '#d97706', bg: '#fef3c7', title: 'Manufacturing Started', time: new Date(Date.now() - 43200000), desc: 'PO generated and sent to supplier.' });
  }

  if (document.financialStatus === 'Paid') {
    events.push({ icon: DollarSign, color: '#059669', bg: '#d1fae5', title: 'Payment Received', time: new Date(Date.now() - 3600000), desc: 'Invoice paid in full.' });
  }

  // Sort descending
  events.sort((a, b) => b.time - a.time);

  return (
    <div style={{ padding: '0 0.5rem' }}>
      {events.length === 0 && <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No activity yet.</div>}
      
      {events.map((evt, i) => (
        <div key={i} style={{ display: 'flex', gap: '1rem', position: 'relative', paddingBottom: i === events.length - 1 ? 0 : '1.5rem' }}>
          
          {/* Vertical Line */}
          {i < events.length - 1 && (
            <div style={{ position: 'absolute', left: '16px', top: '32px', bottom: 0, width: '2px', background: '#e2e8f0', zIndex: 0 }} />
          )}

          {/* Icon */}
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: evt.bg, color: evt.color, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, flexShrink: 0 }}>
            {React.createElement(evt.icon, { size: 16 })}
          </div>

          {/* Content */}
          <div style={{ paddingTop: '0.25rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {evt.title}
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#94a3b8' }}>{fmtShortDate(evt.time)}</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
              {evt.desc}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
