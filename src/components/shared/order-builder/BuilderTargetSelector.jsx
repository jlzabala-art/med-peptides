import React from 'react';
import UniversalUserSelector from '../UniversalUserSelector';
import User from "lucide-react/dist/esm/icons/user";
import Building from "lucide-react/dist/esm/icons/building";

/**
 * BuilderTargetSelector
 * Allows selecting the target of the order based on the current mode.
 * 
 * Modes:
 *  - 'prescription': Target is a Patient (requires doctorId)
 *  - 'wholesale': Target is a Clinic (requires accountManagerId)
 *  - 'admin': Target is a Wholesaler, then optionally a Clinic
 */
export default function BuilderTargetSelector({ mode, selectedTarget, onSelectTarget, currentUserId }) {
  const roleFilter = mode === 'prescription' ? 'patient' 
                   : (mode === 'wholesale' ? 'clinic' : 'wholesaler');
                   
  const label = mode === 'prescription' ? 'Select Patient' 
              : (mode === 'wholesale' ? 'Select Clinic' : 'Select Wholesaler');
              
  const Icon = mode === 'prescription' ? User : Building;

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <UniversalUserSelector
        roleFilter={roleFilter}
        value={selectedTarget?.id || selectedTarget?.objectID || ''}
        onChange={(user) => onSelectTarget(user)}
        currentUserId={currentUserId}
        label={label}
        icon={Icon}
        placeholder="Search by name, email, phone..."
        containerStyle={{ background: 'var(--color-bg-surface, #fff)', padding: '1.5rem' }}
      />
    </div>
  );
}
