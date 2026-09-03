import React from 'react';
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import PageHeader from '../ui/PageHeader';

import { MetricCard } from '../ui';
import ArrowUpRight from "lucide-react/dist/esm/icons/arrow-up-right";
import ArrowDownRight from "lucide-react/dist/esm/icons/arrow-down-right";
import CreditCard from "lucide-react/dist/esm/icons/credit-card";

export default function AdminPaymentsTab() {
  return (
    <div style={{ padding: '0 2rem 2rem 2rem' }}>
      <PageHeader
        title="Payments Hub"
        subtitle="Track inbound payments from clients and outbound payments to suppliers."
        icon={DollarSign}
      />
      
      {/* KPI Cards (Generated automatically per Rule #22) */}
      <div className="kpi-scroll-row" style={{ marginBottom: '1.5rem' }}>
        <MetricCard
          title="Total Received (This Month)"
          value="$124,500.00"
          icon={ArrowDownRight}
          color="var(--color-success)"
        />
        <MetricCard
          title="Pending Receivables"
          value="$32,100.00"
          icon={CreditCard}
          color="var(--color-warning)"
          alert={true}
        />
        <MetricCard
          title="Pending Payables"
          value="$18,400.00"
          icon={ArrowUpRight}
          color="var(--color-danger)"
        />
        <MetricCard
          title="Failed Payments"
          value="3"
          icon={CreditCard}
          color="var(--color-danger)"
        />
      </div>

      <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
        <h3 style={{ color: '#64748b', margin: 0 }}>Payments functionality coming soon.</h3>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.5rem' }}>This module will synchronize with Zoho Books to track all inbound and outbound payments.</p>
      </div>
    </div>
  );
}
