import React from 'react';
import { Package, Clock, Activity, AlertCircle, Calendar, Filter } from '@/lib/icons';
import styles from './Prescriptions.module.css';

export default function PrescriptionsFiltersBar({
  activeChip,
  setActiveChip,
}) {
  const chips = [
    { id: 'all', label: 'All Prescriptions', icon: <Package size={14} /> },
    { id: 'awaiting', label: 'Awaiting Review', icon: <Clock size={14} /> },
    { id: 'active', label: 'Active', icon: <Activity size={14} /> },
    { id: 'refills_due', label: 'Refills Due (< 7d)', icon: <AlertCircle size={14} /> },
    { id: 'recent', label: 'Recent (7 Days)', icon: <Calendar size={14} /> },
  ];

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      padding: '0.75rem 1rem', 
      borderBottom: '1px solid var(--border)',
      backgroundColor: '#f8fafc',
      gap: '1rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', paddingRight: '1rem', borderRight: '1px solid var(--border)' }}>
        <Filter size={16} /> Filters
      </div>
      <div className={styles.chipsScrollRow} style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', flex: 1, alignItems: 'center' }}>
        {chips.map((chip) => (
          <button
            key={chip.id}
            onClick={() => setActiveChip(chip.id)}
            className={`${styles.smartChip} ${activeChip === chip.id ? styles.smartChipActive : styles.smartChipInactive}`}
          >
            {chip.icon} {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
}
