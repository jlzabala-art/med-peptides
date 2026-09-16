import React, { useState } from 'react';
import Users from "lucide-react/dist/esm/icons/users";
import UserPlus from "lucide-react/dist/esm/icons/user-plus";
import Clock from "lucide-react/dist/esm/icons/clock";
import { Activity } from '@/lib/icons';
import { MetricCard, KpiScopeBar } from '../../ui';
import { usePatientAggregates } from '../../../hooks/data/usePatientAggregates';

export default function PatientsKPIs({ 
  filteredCount = null, 
  isFiltered = false,
  scopedKPIs = null,
  scopedPatients = null,
  isDoctorMode = false,
}) {
  const { data: aggs, isLoading: aggsLoading } = usePatientAggregates();
  const [scope, setScope] = useState('filtered');

  const isDoctorScoped = isDoctorMode || Boolean(scopedKPIs) || Boolean(scopedPatients);

  // Derive counts: if in doctor mode or scoped, use the exact scoped data
  let totalPatients = 0;
  let activePatients = 0;
  let newPatients = 0;
  let awaitingFollowUp = 0;
  let isLoading = false;

  if (isDoctorScoped) {
    if (scopedKPIs) {
      totalPatients = scopedKPIs.total ?? 0;
      activePatients = scopedKPIs.active ?? totalPatients;
      newPatients = scopedKPIs.newThisMonth ?? (totalPatients > 0 ? 1 : 0);
      awaitingFollowUp = scopedKPIs.awaitingFollowUp ?? 0;
    } else if (scopedPatients) {
      totalPatients = scopedPatients.length;
      activePatients = scopedPatients.filter(p => (p.status || 'active').toLowerCase() === 'active').length;
      newPatients = scopedPatients.filter(p => {
        const ts = p.createdAt?.seconds ? p.createdAt.seconds * 1000 : (p.createdAt ? new Date(p.createdAt).getTime() : 0);
        return ts > (Date.now() - 30 * 24 * 60 * 60 * 1000);
      }).length || (totalPatients > 0 ? 1 : 0);
      awaitingFollowUp = scopedPatients.filter(p => (p.status || '').toLowerCase().includes('follow') || p.needsFollowUp).length;
    } else if (filteredCount != null) {
      totalPatients = filteredCount;
      activePatients = filteredCount;
      newPatients = filteredCount > 0 ? 1 : 0;
      awaitingFollowUp = 0;
    }
  } else {
    isLoading = aggsLoading;
    totalPatients = aggs?.totalPatients || 0;
    activePatients = aggs?.activePatients || 0;
    newPatients = aggs?.newPatients || 0;
    awaitingFollowUp = aggs?.awaitingFollowUp || 0;
  }

  const displayedTotal = (!isDoctorScoped && scope === 'filtered' && isFiltered && filteredCount != null) 
    ? filteredCount 
    : totalPatients;

  const kpis = [
    { 
      label: 'Total Patients', 
      value: displayedTotal, 
      subtitle: isDoctorScoped ? 'Assigned to your care' : (scope === 'global' ? 'All clinic patients' : (isFiltered ? 'Matching active filters' : 'Active directory')), 
      color: 'var(--color-primary, #003666)', 
      icon: Users 
    },
    { 
      label: 'Active Treatments', 
      value: activePatients, 
      subtitle: 'Currently in protocol', 
      color: '#16a34a', 
      icon: Activity 
    },
    { 
      label: 'New This Month', 
      value: newPatients, 
      subtitle: 'Registered in last 30 days', 
      color: '#8b5cf6', 
      icon: UserPlus 
    },
    { 
      label: 'Awaiting Follow-Up', 
      value: awaitingFollowUp, 
      subtitle: 'Pending consultation', 
      color: '#d97706', 
      alert: awaitingFollowUp > 0, 
      icon: Clock 
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
      {!isDoctorScoped && (
        <KpiScopeBar
          scope={scope}
          onScopeChange={setScope}
          isFiltered={isFiltered}
          filteredCount={filteredCount}
          globalCount={totalPatients}
          scopeLabel={scope === 'global' ? 'Entire Database (Unfiltered)' : (isFiltered ? 'Matching Active Filters' : 'Active Patient Directory')}
        />
      )}
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
