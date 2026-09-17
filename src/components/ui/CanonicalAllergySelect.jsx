'use client';

import React, { useState } from 'react';
import { COMMON_ALLERGIES, NKDA_LABEL } from '../../constants/clinicalAllergies';
import { normalizeAllergies } from '../../services/clinicalTaxonomyNormalizer';
import { AlertTriangle, Check, Plus, X, ShieldCheck } from '@/lib/icons';

export default function CanonicalAllergySelect({
  value,
  onChange,
  disabled = false,
  onSave,
  onCancel,
}) {
  const normalized = normalizeAllergies(value);
  const [allergiesList, setAllergiesList] = useState(() => {
    if (normalized.isNKDA) return ['NKDA'];
    return normalized.items.map((it) => it.name);
  });
  const [selectedCommon, setSelectedCommon] = useState('');
  const [customInput, setCustomInput] = useState('');

  const isNKDA = allergiesList.includes('NKDA') || allergiesList.includes(NKDA_LABEL);

  const handleToggleNKDA = () => {
    if (isNKDA) {
      setAllergiesList([]);
    } else {
      setAllergiesList(['NKDA']);
    }
  };

  const handleAddAllergy = (name) => {
    if (!name || !name.trim()) return;
    const cleanName = name.trim();
    // Remove NKDA if adding a real allergy
    const updated = allergiesList.filter((a) => a !== 'NKDA' && a !== NKDA_LABEL);
    if (!updated.some((a) => a.toLowerCase() === cleanName.toLowerCase())) {
      setAllergiesList([...updated, cleanName]);
    }
    setSelectedCommon('');
    setCustomInput('');
  };

  const handleRemove = (nameToRemove) => {
    setAllergiesList(allergiesList.filter((a) => a !== nameToRemove));
  };

  const handleConfirmSave = () => {
    const finalValue = isNKDA ? NKDA_LABEL : allergiesList.join(', ');
    onChange?.(finalValue);
    onSave?.(finalValue);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '8px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1.5px solid #cbd5e1',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        minWidth: '280px',
        maxWidth: '420px',
      }}
    >
      {/* Top Header & NKDA Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>
          Allergies & Intolerances
        </span>
        <button
          type="button"
          onClick={handleToggleNKDA}
          disabled={disabled}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.68rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '12px',
            border: `1px solid ${isNKDA ? '#16a34a' : '#cbd5e1'}`,
            backgroundColor: isNKDA ? '#f0fdf4' : '#f8fafc',
            color: isNKDA ? '#15803d' : '#64748b',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <ShieldCheck size={12} />
          {isNKDA ? '✓ NKDA Active' : 'Set as NKDA'}
        </button>
      </div>

      {/* Active Allergy Chips */}
      {!isNKDA && allergiesList.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', maxHeight: '100px', overflowY: 'auto' }}>
          {allergiesList.map((allergy, idx) => {
            const isExcipient = COMMON_ALLERGIES.some(
              (ca) => ca.name.toLowerCase() === allergy.toLowerCase() && ca.category === 'excipient'
            );
            return (
              <span
                key={idx}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: '6px',
                  backgroundColor: isExcipient ? '#fee2e2' : '#fef3c7',
                  color: isExcipient ? '#b91c1c' : '#92400e',
                  border: `1px solid ${isExcipient ? '#fca5a5' : '#fde68a'}`,
                }}
              >
                {isExcipient && <AlertTriangle size={11} color="#b91c1c" />}
                {allergy}
                <button
                  type="button"
                  onClick={() => handleRemove(allergy)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    color: isExcipient ? '#b91c1c' : '#92400e',
                  }}
                >
                  <X size={11} />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Quick Add Pickers (Disabled if NKDA) */}
      {!isNKDA && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {/* Common Allergies Dropdown */}
          <select
            value={selectedCommon}
            onChange={(e) => handleAddAllergy(e.target.value)}
            disabled={disabled}
            style={{
              width: '100%',
              fontSize: '0.78rem',
              padding: '4px 6px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#f8fafc',
              color: '#334155',
            }}
          >
            <option value="">+ Pick common allergy or excipient...</option>
            <optgroup label="⚠️ Compounding Excipients (High Priority)">
              {COMMON_ALLERGIES.filter((a) => a.category === 'excipient').map((a) => (
                <option key={a.id} value={a.name}>
                  {a.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="💊 Common Drug Classes">
              {COMMON_ALLERGIES.filter((a) => a.category === 'drug').map((a) => (
                <option key={a.id} value={a.name}>
                  {a.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="🌿 Environmental & Dietary">
              {COMMON_ALLERGIES.filter((a) => !['excipient', 'drug'].includes(a.category)).map((a) => (
                <option key={a.id} value={a.name}>
                  {a.name}
                </option>
              ))}
            </optgroup>
          </select>

          {/* Custom Write-in */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Or type custom allergy..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddAllergy(customInput);
                }
              }}
              style={{
                flex: 1,
                fontSize: '0.78rem',
                padding: '3px 6px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={() => handleAddAllergy(customInput)}
              disabled={!customInput.trim()}
              style={{
                padding: '3px 8px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f1f5f9',
                cursor: customInput.trim() ? 'pointer' : 'default',
                fontSize: '0.72rem',
                fontWeight: 600,
              }}
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '4px' }}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '3px 8px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              fontSize: '0.75rem',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleConfirmSave}
          style={{
            padding: '3px 10px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: '#16a34a',
            color: '#ffffff',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Check size={12} /> Save
        </button>
      </div>
    </div>
  );
}
