'use client';

import React, { useMemo } from 'react';
import SearchableSelect from './SearchableSelect';
import { GOAL_TYPES, GOAL_LABELS } from '../../constants/goalTypes';
import { normalizeGoal } from '../../services/clinicalTaxonomyNormalizer';

export const GOAL_ICONS = {
  anti_aging: '🧬',
  fat_loss: '⚡',
  tissue_repair: '🔬',
  cognitive: '🧠',
  muscle_growth: '💪',
  libido_wellness: '⚖️',
  general_health: '🛡️',
};

export default function CanonicalGoalSelect({
  value,
  onChange,
  disabled = false,
  placeholder = 'Select clinical goal...',
  allowCustom = true,
}) {
  const options = useMemo(() => {
    return Object.entries(GOAL_LABELS).map(([key, label]) => ({
      value: label,
      label: `${GOAL_ICONS[key] || '🎯'} ${label}`,
      key,
    }));
  }, []);

  const normalized = useMemo(() => normalizeGoal(value), [value]);

  const handleChange = (selectedLabel) => {
    onChange?.(selectedLabel);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
      <SearchableSelect
        value={normalized.label || value || ''}
        onChange={handleChange}
        options={options}
        placeholder={placeholder}
        disabled={disabled}
      />
      {normalized.isCustom && value && (
        <span
          style={{
            fontSize: '0.65rem',
            color: '#d97706',
            backgroundColor: '#fffbeb',
            border: '1px solid #fef3c7',
            padding: '1px 6px',
            borderRadius: '4px',
            alignSelf: 'flex-start',
            marginTop: '2px',
          }}
        >
          Custom non-standard goal
        </span>
      )}
    </div>
  );
}
