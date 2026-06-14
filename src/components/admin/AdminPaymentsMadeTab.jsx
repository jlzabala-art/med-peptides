import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import React from 'react';

import AdminPageHeader from './AdminPageHeader';

export default function AdminPaymentsMadeTab() {
  return (
    <div>
      <AdminPageHeader
        title="Payments Made"
        subtitle="Track payments sent to suppliers for your Bills."
        icon={DollarSign}
      />
      <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
        <h3 style={{ color: '#64748b', margin: 0 }}>Payments Made functionality coming soon.</h3>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.5rem' }}>This module will synchronize with Zoho Books to track outbound payments.</p>
      </div>
    </div>
  );
}