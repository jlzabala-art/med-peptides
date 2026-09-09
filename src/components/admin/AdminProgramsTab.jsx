"use client";

import Activity from "lucide-react/dist/esm/icons/activity";
import Users from "lucide-react/dist/esm/icons/users";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import Dna from "lucide-react/dist/esm/icons/dna";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import React, { useState, useEffect, useMemo } from 'react';

import PageHeader from '../ui/PageHeader';
import GlobalSearchBar from '../ui/GlobalSearchBar';
import DataTable from '../ui/DataTable';
import StatusChip from '../ui/StatusChip';
import CopyableId from '../ui/CopyableId';
import MetricCard from '../ui/MetricCard';
import EmptyState from '../ui/EmptyState';
import { getAllProtocols } from '../../repositories/protocolRepository';

export default function AdminProgramsTab({ isSubTab = false }) {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState([]);

  useEffect(() => {
    let isMounted = true;
    async function loadPrograms() {
      setLoading(true);
      try {
        const protocols = await getAllProtocols();
        if (isMounted) {
          const mapped = (protocols || []).map(p => ({
            id: p.id,
            name: p.title || p.name || 'Clinical Program',
            type: p.category || p.condition || p.objective || 'General Health',
            patients: p.enrolledPatients || p.patientsCount || 0,
            revenue: p.totalRevenue || p.revenue || 0,
            status: (p.status || 'active').toLowerCase(),
            trend: p.trend || '+0%'
          }));
          setPrograms(mapped);
        }
      } catch (err) {
        console.error('Error fetching programs:', err);
        if (isMounted) setPrograms([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadPrograms();
    return () => { isMounted = false; };
  }, []);

  const allTypes = useMemo(() => {
    const types = new Set(programs.map(p => p.type).filter(Boolean));
    return Array.from(types).map(t => ({ label: t, value: t }));
  }, [programs]);

  const activeFilters = typeFilter.map(val => ({
    key: `type-${val}`,
    label: 'Type',
    value: val,
    onRemove: () => setTypeFilter(prev => prev.filter(v => v !== val))
  }));

  const filterOptions = [
    {
      id: 'type',
      label: 'Program Type',
      type: 'select',
      value: typeFilter,
      options: allTypes.map(t => ({
        ...t,
        count: programs.filter(p => p.type === t.value).length || null,
      })),
      onChange: setTypeFilter
    }
  ];

  const filtered = useMemo(() => {
    let list = programs;
    if (typeFilter.length > 0) {
      list = list.filter(p => typeFilter.includes(p.type));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.type.toLowerCase().includes(q));
    }
    return list;
  }, [programs, typeFilter, searchQuery]);

  const columns = useMemo(() => [
    {
      key: 'id',
      header: 'ID',
      width: '18%',
      render: (val) => <CopyableId value={val} />
    },
    {
      key: 'name',
      header: 'Program Name',
      width: '32%',
      render: (val) => <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{val}</span>
    },
    {
      key: 'type',
      header: 'Type',
      width: '20%'
    },
    {
      key: 'patients',
      header: 'Enrolled Patients',
      width: '15%',
      render: (val) => (val || 0).toLocaleString()
    },
    {
      key: 'status',
      header: 'Status',
      width: '15%',
      render: (val) => <StatusChip status={val} />
    }
  ], []);

  const expandableRender = (row) => (
    <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-main)' }}>Program Configuration: {row.name}</h4>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
        Detailed insights and protocol phases for this program are configured through the Master Protocol repository.
      </p>
    </div>
  );

  const totalPatients = useMemo(() => programs.reduce((acc, p) => acc + (p.patients || 0), 0), [programs]);
  const activeCount = useMemo(() => programs.filter(p => p.status === 'active').length, [programs]);

  return (
    <div style={{ padding: '0 2rem 2rem 2rem' }}>
      <PageHeader
        title="Programs"
        subtitle="Clinical protocol program templates and patient enrolments"
      />

      {/* KPI Cards (Golden Rule #22) */}
      <div className="kpi-scroll-row" style={{ marginBottom: '2rem' }}>
        <MetricCard
          title="Active Programs"
          value={activeCount}
          icon={Dna}
          color="var(--color-primary)"
        />
        <MetricCard
          title="Enrolled Patients"
          value={totalPatients.toLocaleString()}
          icon={Users}
          color="var(--color-success)"
        />
        <MetricCard
          title="Program Categories"
          value={allTypes.length}
          icon={Activity}
          color="var(--color-info)"
        />
        <MetricCard
          title="Total Programs"
          value={programs.length}
          icon={TrendingUp}
          color="var(--color-primary)"
        />
      </div>

      {/* Search and Filters (Golden Rule #7) */}
      <div style={{ marginBottom: '1.5rem' }}>
        <GlobalSearchBar
          placeholder="Search clinical programs by name or objective..."
          value={searchQuery}
          onChange={setSearchQuery}
          filters={filterOptions}
          activeFilters={activeFilters}
          resultsCount={filtered.length}
        />
      </div>

      {/* DataTable (Golden Rule #3) */}
      <DataTable
        columns={columns}
        data={filtered}
        isLoading={loading}
        expandableRender={expandableRender}
        emptyState={
          <EmptyState
            icon={Dna}
            title="No clinical programs found"
            subtitle="Programs and therapy templates configured in the protocols module will appear here."
          />
        }
      />
    </div>
  );
}