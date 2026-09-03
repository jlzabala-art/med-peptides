import React from 'react';
import { useRouter } from 'next/navigation';
import MetricCard from '../../ui/MetricCard';
import { Users, UserPlus, DollarSign, Activity } from 'lucide-react';

export default function PhysiciansAnalyticsHeader({ stats }) {
  const router = useRouter();
  const { totalPhysicians = 0, totalPrescriptions = 0, totalPatients = 0, totalRevenue = 0 } = stats || {};

  return (
    <div className="kpi-scroll-row" style={{ marginBottom: '2rem' }}>
      <MetricCard
        title="Patients"
        value={totalPatients}
        icon={UserPlus}
        color="#d97706"
        onClick={() => router.push('/admin/patients')}
        className="clickable-card"
      />
      <MetricCard
        title="Prescriptions"
        value={totalPrescriptions}
        icon={Activity}
        color="var(--color-success)"
        onClick={() => router.push('/admin/prescriptions')}
        className="clickable-card"
      />
      <MetricCard
        title="Total Physicians"
        value={totalPhysicians}
        icon={Users}
        color="var(--color-primary)"
        onClick={() => router.push('/admin/physicians')}
        className="clickable-card"
      />
      <MetricCard
        title="Pending Approvals"
        value={0} // To be connected to stats.totalPending
        icon={Users}
        color="#8b5cf6"
        onClick={() => router.push('/admin/users?status=pending')}
        className="clickable-card"
      />
    </div>
  );
}