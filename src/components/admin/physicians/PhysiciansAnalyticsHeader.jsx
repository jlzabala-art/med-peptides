import Users from "lucide-react/dist/esm/icons/users";
import UserPlus from "lucide-react/dist/esm/icons/user-plus";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import Activity from "lucide-react/dist/esm/icons/activity";
import React from 'react';
import { Card } from '../../ui';





export default function PhysiciansAnalyticsHeader({ stats }) {
  const { totalPhysicians = 0, activePhysicians = 0, newThisMonth = 0, totalRevenue = 0 } = stats || {};

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
      <Card style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'var(--color-bg-surface)' }}>
        <div style={{ padding: '1rem', backgroundColor: 'rgba(26,115,232,0.1)', borderRadius: 'var(--radius-md)', color: 'var(--primary)' }}>
          <Users size={24} />
        </div>
        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Physicians</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>{totalPhysicians}</div>
        </div>
      </Card>

      <Card style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'var(--color-bg-surface)' }}>
        <div style={{ padding: '1rem', backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: 'var(--radius-md)', color: 'var(--color-success)' }}>
          <Activity size={24} />
        </div>
        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Active</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-success)' }}>{activePhysicians}</div>
        </div>
      </Card>

      <Card style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'var(--color-bg-surface)' }}>
        <div style={{ padding: '1rem', backgroundColor: 'rgba(245,158,11,0.1)', borderRadius: 'var(--radius-md)', color: '#d97706' }}>
          <UserPlus size={24} />
        </div>
        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>New This Month</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>{newThisMonth}</div>
        </div>
      </Card>

      <Card style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'var(--color-bg-surface)' }}>
        <div style={{ padding: '1rem', backgroundColor: 'rgba(139,92,246,0.1)', borderRadius: 'var(--radius-md)', color: '#8b5cf6' }}>
          <DollarSign size={24} />
        </div>
        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Revenue Generated</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>AED {totalRevenue.toLocaleString()}</div>
        </div>
      </Card>

    </div>
  );
}