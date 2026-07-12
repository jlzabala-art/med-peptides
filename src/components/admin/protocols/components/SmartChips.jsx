import React from 'react';
import { Package, Activity, Edit3, Archive } from '@/lib/icons';

export default function SmartChips({ activeChip, setActiveChip }) {
  const chips = [
    { id: 'all', label: 'All Protocols', icon: <Package size={14} /> },
    { id: 'active', label: 'Active', icon: <Activity size={14} /> },
    { id: 'drafts', label: 'Drafts', icon: <Edit3 size={14} /> },
    { id: 'archived', label: 'Archived', icon: <Archive size={14} /> },
  ];

  return (
    <div
      className="smart-chips-bar"
      style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}
    >
      {chips.map((chip) => (
        <button
          key={chip.id}
          className={`smart-chip ${activeChip === chip.id ? 'active' : 'inactive'}`}
          onClick={() => setActiveChip(chip.id)}
        >
          {chip.icon} {chip.label}
        </button>
      ))}
    </div>
  );
}
