import React, { useState } from 'react';
import Users from "lucide-react/dist/esm/icons/users";
import UserPlus from "lucide-react/dist/esm/icons/user-plus";
import Clock from "lucide-react/dist/esm/icons/clock";
import { Activity } from '@/lib/icons';
import { MetricCard, KpiScopeBar } from '../../ui';
import { usePatientAggregates } from '../../../hooks/data/usePatientAggregates';

export default function PatientsKPIs({ filteredCount = null, isFiltered = false }) {
  const { data: aggs, isLoading } = usePatientAggregates();
  const [scope, setScope] = useState('filtered');

  const totalPatients = aggs?.totalPatients || 0;
  const activePatients = aggs?.activePatients || 0;
  const newPatients = aggs?.newPatients || 0;
  const awaitingFollowUp = aggs?.awaitingFollowUp || 0;

  const displayedTotal = (scope === 'filtered' && isFiltered && filteredCount != null) ? filteredCount : totalPatients;

  const kpis = [
    { label: 'Total Patients', value: displayedTotal, subtitle: scope === 'global' ? 'All clinic patients' : (isFiltered ? 'Matching active filters' : 'Active directory'), color: 'var(--color-primary, #003666)', icon: Users },
    { label: 'Active Treatments', value: activePatients, subtitle: 'Currently in protocol', color: '#16a34a', icon: Activity },
    { label: 'New This Month', value: newPatients, subtitle: 'Registered in last 30 days', color: '#8b5cf6', icon: UserPlus },
    { label: 'Awaiting Follow-Up', value: awaitingFollowUp, subtitle: 'Pending consultation', color: '#d97706', alert: awaitingFollowUp > 0, icon: Clock }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
      <KpiScopeBar
        scope={scope}
        onScopeChange={setScope}
        isFiltered={isFiltered}
        filteredCount={filteredCount}
        globalCount={totalPatients}
        scopeLabel={scope === 'global' ? 'Entire Database (Unfiltered)' : (isFiltered ? 'Matching Active Filters' : 'Active Patient Directory')}
      />
      <div className="dashboard-kpi-grid">
        {kpis.map((kpi, idx) => (
          <MetricCard
            key={idx}
            title={kpi.label}
            value={kpi.value}
            subtitle={kpi.subtitle}
            color={kpi.color}
            icon={kpi.icon}
            alert={kpi.alert}
            loading={isLoading}
          />
        ))}
      </div>
    </div>
  );
}
