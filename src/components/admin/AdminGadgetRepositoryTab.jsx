import React, { useState } from 'react';
import {
  Settings, DollarSign, RefreshCw, Users, Shield, ArrowRightLeft, Database, Globe, Check, AlertTriangle, Layers
} from 'lucide-react';
import AppDataTable from '../ui/AppDataTable';
import AppFilterBar from '../ui/AppFilterBar';
import AppEntityCell from '../ui/AppEntityCell';
import { useToast } from '../../hooks/useToast';

// Gadget Metadata Definition
const ADMIN_GADGETS = [
  {
    id: 'AdminFinanceWidget',
    name: 'Finance Intelligence',
    icon: DollarSign,
    category: 'Operational',
    description: 'Tracks cashflow, calculates gross margins, estimates taxes, and visualizes financial performance.',
    status: 'active',
    baseClass: true
  },
  {
    id: 'AdminProductSyncWidget',
    name: 'Catalog Synchronizer',
    icon: RefreshCw,
    category: 'Inventory',
    description: 'Synchronizes external catalog structures (Zoho Books/Bigin) and updates internal product inventory.',
    status: 'active',
    baseClass: true
  },
  {
    id: 'AdminZohoCRMWidget',
    name: 'Zoho CRM Hub',
    icon: Users,
    category: 'Integrations',
    description: 'Coordinates active deals, lead management, and relationship pipelines via Zoho Bigin.',
    status: 'active',
    baseClass: true
  },
  {
    id: 'SystemAuditLogWidget',
    name: 'System Audit Log',
    icon: Shield,
    category: 'Security',
    description: 'Displays raw platform events, security traces, login events, and transaction modifications.',
    status: 'active',
    baseClass: true
  },
  {
    id: 'PayoutManagerWidget',
    name: 'Payout Manager',
    icon: ArrowRightLeft,
    category: 'Finance',
    description: 'Aggregates due balances and orchestrates mass payouts across physician networks and clinical partners.',
    status: 'active',
    baseClass: true
  },
  {
    id: 'AdminSupplyNotifierWidget',
    name: 'Supply Notifier',
    icon: Database,
    category: 'Inventory',
    description: 'Detects low-stock thresholds globally and alerts the logistics teams for urgent restocks.',
    status: 'active',
    baseClass: true
  },
  {
    id: 'GlobalLogisticsQueueWidget',
    name: 'Global Logistics Queue',
    icon: Globe,
    category: 'Operations',
    description: 'Manages incoming stock transfers, international shipments, and inter-warehouse movements.',
    status: 'active',
    baseClass: true
  },
  {
    id: 'B2BOrderApprovalsWidget',
    name: 'B2B Order Approvals',
    icon: Check,
    category: 'Sales',
    description: 'Review interface for bulk B2B purchases that require administrative sign-off due to volume or compliance.',
    status: 'active',
    baseClass: true
  }
];

export default function AdminGadgetRepositoryTab() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGadgets = ADMIN_GADGETS.filter(g =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: 'gadget',
      header: 'Gadget Name',
      sortKey: 'gadget',
      sortValue: (row) => row.name.toLowerCase(),
      render: (row) => {
        const Icon = row.icon;
        return (
          <AppEntityCell
            title={row.name}
            subtitle={row.id}
            icon={<Icon size={18} />}
          />
        );
      }
    },
    {
      key: 'category',
      header: 'Category',
      sortKey: 'category',
      sortValue: (row) => row.category.toLowerCase(),
      render: (row) => (
        <span style={{
          display: 'inline-block',
          padding: '0.2rem 0.6rem',
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: 600,
          background: 'var(--surface-hover)',
          color: 'var(--text-main)',
          border: '1px solid var(--border-color)'
        }}>
          {row.category}
        </span>
      )
    },
    {
      key: 'description',
      header: 'Function / Description',
      render: (row) => (
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {row.description}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Role Base Class',
      render: (row) => (
        <span style={{ fontSize: '0.8rem', color: row.baseClass ? 'var(--color-success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          {row.baseClass ? <Layers size={14} /> : null}
          {row.baseClass ? 'Root Parameter' : 'Inherited'}
        </span>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '1400px' }}>
      
      {/* ── HEADER ── */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>
          Gadget Repository
        </h2>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Central repository for all operational platform widgets. The Admin gadgets below act as the architectural base class parameterizations for Doctor, Wholesaler, and Patient variations.
        </p>
      </div>

      <AppFilterBar
        searchPlaceholder="Search gadgets or functions..."
        onSearch={setSearchTerm}
      />

      <AppDataTable
        data={filteredGadgets}
        columns={columns}
        defaultSortKey="category"
      />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <AlertTriangle size={18} color="var(--color-warning)" />
        <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
          <strong>Note:</strong> Modifying the base behavior of these gadgets globally affects their scoped derivatives across professional and patient portals.
        </span>
      </div>
    </div>
  );
}
