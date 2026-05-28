 
import React from 'react';

/**
 * Unified chip system for tags and secondary filters across all collections.
 */
export default function SharedChip({ 
  label, 
  icon: Icon, 
  isActive = false, 
  onClick 
}) {
  return (
    <button
      className={`col-chip ${isActive ? 'active' : ''}`}
      onClick={onClick}
      type="button"
    >
      {Icon && <Icon className="col-chip-icon" />}
      <span>{label}</span>
    </button>
  );
}
