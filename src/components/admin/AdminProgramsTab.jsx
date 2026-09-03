"use client";

import Activity from "lucide-react/dist/esm/icons/activity";
import Users from "lucide-react/dist/esm/icons/users";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import Dna from "lucide-react/dist/esm/icons/dna";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import Archive from "lucide-react/dist/esm/icons/archive";
import React, { useState, useMemo } from 'react';

import PageHeader from '../ui/PageHeader';
import GlobalSearchBar from '../ui/GlobalSearchBar';
import DataTable from '../ui/DataTable';
import StatusChip from '../ui/StatusChip';
import CopyableId from '../ui/CopyableId';
import MetricCard from '../ui/MetricCard';

const MOCK_PROGRAMS = [
  { id: 'prg_1', name: 'Longevity Base Protocol', type: 'Anti-Aging', patients: 1250, revenue: 1250000, status: 'active', trend: '+12%' },
  { id: 'prg_2', name: 'Metabolic Reset 90-Day', type: 'Weight Loss', patients: 840, revenue: 2100000, status: 'active', trend: '+24%' },
  { id: 'prg_3', name: 'Athletic Recovery Stack', type: 'Performance', patients: 420, revenue: 315000, status: 'active', trend: '+5%' },
  { id: 'prg_4', name: 'Hair Restoration', type: 'Aesthetics', patients: 65, revenue: 45000, status: 'beta', trend: '+45%' }
];

export default function AdminProgramsTab({ isSubTab = false }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState([]); // string[]

  const ALL_TYPES = [
    { label: 'Anti-Aging',   value: 'Anti-Aging' },
    { label: 'Weight Loss',  value: 'Weight Loss' },
    { label: 'Performance',  value: 'Performance' },
    { label: 'Aesthetics',   value: 'Aesthetics' },
  ];

  const activeFilters = typeFilter.map(val => ({
    key: `type-${val}`,
    label: 'Type',
    value: val,
    onRemove: () => setTypeFilter(prev => prev.filter(v => v !== val))
  }));

  const filterOptions = [
    {
      key: 'type',
      label: 'Program Type',
      multiSelect: true,
      values: typeFilter,
      options: ALL_TYPES.map(t => ({
        ...t,
        count: MOCK_PROGRAMS.filter(p => p.type === t.value).length || null,
      })),
      onChange: setTypeFilter
    }
  ];

  const filtered = useMemo(() => {
    if (typeFilter.length === 0) return MOCK_PROGRAMS;
    return MOCK_PROGRAMS.filter(p => typeFilter.includes(p.type));
  }, [typeFilter]);


  const columns = useMemo(() => [
    {
      key: 'id',
      header: 'ID',
      render: (val, row) => <CopyableId value={val} />
    },
    {
      key: 'name',
      header: 'Program Name',
      render: (val) => <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{val}</span>
    },
    {
      key: 'type',
      header: 'Type'
    },
    {
      key: 'patients',
      header: 'Enrolled Patients',
      render: (val) => val.toLocaleString()
    },
    {
      key: 'revenue',
      header: 'Total Revenue',
      render: (val, row) => (
        <span>
          ${val.toLocaleString()}
          <span style={{ fontSize: '0.75rem', color: '#16a34a', marginLeft: '0.5rem' }}>{row.trend}</span>
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (val) => <StatusChip status={val} />
    }
  ], []);

  // Master-Detail Pattern implementation (Golden Rule #4)
  const expandableRender = (row) => (
    <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-main)' }}>Program Configuration: {row.name}</h4>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
        Detailed insights and protocol phases for this program would be configured here, avoiding the need for a separate modal.
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button className="gcp-btn gcp-btn--secondary">View Enrolled Patients</button>
        <button className="gcp-btn gcp-btn--secondary">Edit Financials</button>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '0 2rem 2rem 2rem' }}>
      {/* Header (Golden Rule #9) */}
      <PageHeader
        title="Programas"
        subtitle="Gestión de programas de salud"
      />

      {/* KPI Cards */}
      <div className="kpi-scroll-row" style={{ marginBottom: '2rem' }}>
        <MetricCard
          title="Active Programs"
          value={MOCK_PROGRAMS.filter(p => p.status === 'active').length}
          icon={Dna}
          color="var(--color-primary)"
        />
        <MetricCard
          title="Enrolled Patients"
          value={MOCK_PROGRAMS.reduce((acc, p) => acc + p.patients, 0).toLocaleString()}
          icon={Users}
          color="var(--color-success)"
        />
        <MetricCard
          title="Program Revenue"
          value={`$${(MOCK_PROGRAMS.reduce((acc, p) => acc + p.revenue, 0) / 1000000).toFixed(1)}M`}
          icon={DollarSign}
          color="var(--color-warning)"
        />
        <MetricCard
          title="Draft / Archived"
          value={MOCK_PROGRAMS.filter(p => p.status === 'draft' || p.status === 'archived').length}
          icon={Archive}
          color="var(--color-danger)"
        />
      </div>

      {/* Global Search & Filters (Golden Rule #7) */}
      <div style={{ marginBottom: '1.5rem' }}>
        <GlobalSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search programs..."
          resultCount={filtered.length}
          namespace="admin-programs"
          size="lg"
          filters={activeFilters}
          filterOptions={filterOptions}
        />
      </div>

      {/* Program List (Golden Rule #3) */}
      <div className="gcp-table-container">
        <DataTable
          columns={columns}
          data={filtered}
          keyField={(row) => row.id}
          globalSearch={true}
          searchQuery={searchQuery}
          expandableRender={expandableRender}
        />
      </div>
    </div>
  );
}