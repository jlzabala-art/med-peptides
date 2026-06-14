import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import React from 'react';

import AdminPageHeader from './AdminPageHeader';

export default function AdminPaymentsReceivedTab() {
  return (
    <div>
      <AdminPageHeader
        title="Payments Received"
        subtitle="Track payments received from clients for your Invoices."
        icon={DollarSign}
      />
      <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
        <h3 style={{ color: '#64748b', margin: 0 }}>Payments Received functionality coming soon.</h3>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.5rem' }}>This module will synchronize with Zoho Books to track inbound payments.</p>
      </div>
    </div>
  );
}