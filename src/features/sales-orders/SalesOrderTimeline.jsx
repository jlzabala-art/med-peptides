import React from 'react';
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import Clock from "lucide-react/dist/esm/icons/clock";
import User from "lucide-react/dist/esm/icons/user";
import FileText from "lucide-react/dist/esm/icons/file-text";

function fmtDate(date) {
  if (!date) return 'N/A';
  const d = date?.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function SalesOrderTimeline({ order }) {
  // Synthesize events from order state since we don't have a real history array yet
  const events = [];

  events.push({
    id: 1,
    title: 'Order Created',
    description: `Sales order ${order.documentNumber || order.id.slice(0, 8)} generated.`,
    date: order.createdAt,
    user: 'System',
    status: 'completed'
  });

  if (order.commercialStatus === 'Accepted') {
    events.push({
      id: 2,
      title: 'Customer Approved',
      description: 'Order confirmed and moved to operational queue.',
      date: new Date(Date.now() - 86400000 * 2), // Mock date
      user: order.customerName,
      status: 'completed'
    });
  }

  if (order.poGenerated) {
    events.push({
      id: 3,
      title: 'PO Generated',
      description: 'Purchase Order #PO-2938 sent to supplier.',
      date: new Date(Date.now() - 86400000 * 1.5),
      user: 'Atlas Auto',
      status: 'completed'
    });
  }

  if (order.operationalStatus === 'Manufacturing') {
    events.push({
      id: 4,
      title: 'Manufacturing Started',
      description: 'Production initiated at supplier facility.',
      date: new Date(Date.now() - 86400000 * 1),
      user: 'Supplier Sync',
      status: 'in-progress'
    });
  } else if (order.operationalStatus === 'In Transit' || order.operationalStatus === 'Delivered') {
    events.push({
      id: 4,
      title: 'Shipment Created',
      description: 'AWB #12093810293 created via DHL.',
      date: new Date(Date.now() - 86400000 * 0.5),
      user: 'Logistics',
      status: 'completed'
    });
  }

  if (order.financialStatus === 'Paid') {
    events.push({
      id: 5,
      title: 'Invoice Paid',
      description: `Payment received for ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(order.grandTotal || 0)}.`,
      date: new Date(),
      user: 'Finance API',
      status: 'completed'
    });
  } else if (order.financialStatus === 'Unpaid' && order.commercialStatus === 'Accepted') {
    events.push({
      id: 6,
      title: 'Awaiting Payment',
      description: 'Invoice sent to customer, awaiting wire transfer.',
      date: new Date(),
      user: 'System',
      status: 'pending'
    });
  }

  return (
    <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '0.9rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Operational Timeline</h3>
      
      <div style={{ position: 'relative', paddingLeft: '1rem' }}>
        {/* Vertical Line */}
        <div style={{ position: 'absolute', left: '1.45rem', top: '1rem', bottom: '1rem', width: '2px', background: '#e2e8f0' }} />

        {events.map((evt, idx) => (
          <div key={evt.id} style={{ display: 'flex', gap: '1rem', marginBottom: idx === events.length - 1 ? 0 : '1.5rem', position: 'relative' }}>
            <div style={{ 
              width: 16, height: 16, borderRadius: '50%', background: '#fff', border: evt.status === 'completed' ? '2px solid #10b981' : (evt.status === 'in-progress' ? '2px solid #2563eb' : '2px solid #cbd5e1'), 
              marginTop: '0.25rem', zIndex: 1, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
               {evt.status === 'completed' && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />}
               {evt.status === 'in-progress' && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563eb' }} />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{evt.title}</span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{fmtDate(evt.date)}</span>
              </div>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                {evt.description}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: '#64748b' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><User size={12} /> {evt.user}</span>
                {evt.status === 'completed' && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#10b981' }}><CheckCircle2 size={12} /> Logged</span>}
                {evt.status === 'pending' && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#d97706' }}><Clock size={12} /> Pending</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
