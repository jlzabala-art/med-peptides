"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Edit2, Check, X } from 'lucide-react';
import notifier from '../../services/NotificationService';
import SearchableSelect from './SearchableSelect';
import CountrySelect from './CountrySelect';
import CanonicalGoalSelect, { GOAL_ICONS } from './CanonicalGoalSelect';
import CanonicalAllergySelect from './CanonicalAllergySelect';
import { normalizeGoal, normalizeCountry, normalizeAllergies } from '../../services/clinicalTaxonomyNormalizer';
import { DOSAGE_UNITS } from '../../constants/dosageUnits';

/**
 * InlineEditableCell
 * ─────────────────────────────────────────────────────────────────────────────
 * A universal component for inline editing of scalar values inside DataTables
 * or drawers. Conforms to Golden Rule #5 (Inline Editing Standard).
 */
export default function InlineEditableCell({
  value,
  type = 'text', // 'text', 'number', 'select', 'dosage', 'email', 'tel', 'country', 'goal', 'allergy'
  options = [], // [{ label, value }] for select type
  onSave, // async function(newValue)
  format, // function(value) => string | ReactNode
  placeholder = 'Click to edit...',
  prefix = null,
  suffix = null,
  align = 'left',
  stacked = false,
  width = null
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef(null);

  // For dosage type: split into numeric value and unit
  const parseDosageStr = (str) => {
    if (!str) return { val: '', unit: 'mg' };
    const match = String(str).trim().match(/^([\d.,]+)\s*([a-zA-Zµ/%]+(?:\/[a-zA-Zµ]+)?)/);
    if (match) return { val: match[1], unit: match[2] || 'mg' };
    return { val: str, unit: 'mg' };
  };

  const [dosageNum, setDosageNum] = useState(() => parseDosageStr(value).val);
  const [dosageUnit, setDosageUnit] = useState(() => parseDosageStr(value).unit);

  // Sync value if it changes externally while not editing
  useEffect(() => {
    if (!isEditing) {
      setCurrentValue(value ?? '');
      const parsed = parseDosageStr(value);
      setDosageNum(parsed.val);
      setDosageUnit(parsed.unit);
    }
  }, [value, isEditing]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (type === 'text' || type === 'number' || type === 'dosage') {
        inputRef.current.select();
      }
    }
  }, [isEditing, type]);

  const handleSave = async (overrideValue) => {
    let valToSave = overrideValue !== undefined ? overrideValue : currentValue;

    if (type === 'dosage') {
      valToSave = dosageNum ? `${dosageNum} ${dosageUnit}` : '';
    }

    // If value didn't change, just exit edit mode
    if (valToSave === (value ?? '')) {
      setIsEditing(false);
      return;
    }

    // Validation
    if (type === 'email' && valToSave) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(valToSave)) {
        notifier.error('Invalid email format');
        return;
      }
    }
    
    if (type === 'tel' && valToSave) {
      const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]*$/;
      const digitsOnly = valToSave.replace(/\D/g, '');
      if (!phoneRegex.test(valToSave) || digitsOnly.length < 6) {
        notifier.error('Invalid phone number format');
        return;
      }
    }

    setIsSaving(true);
    try {
      await onSave(valToSave);
      setIsEditing(false);
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setCurrentValue(value ?? '');
      const parsed = parseDosageStr(value);
      setDosageNum(parsed.val);
      setDosageUnit(parsed.unit);
      setIsEditing(false);
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  const formattedDisplay = (() => {
    if (format && value != null && value !== '') {
      return format(value);
    }
    if (type === 'goal' && value) {
      const g = normalizeGoal(value);
      const icon = GOAL_ICONS[g.key] || '🎯';
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem' }}>
          <span>{icon}</span>
          <span style={{ fontWeight: 600 }}>{g.label || value}</span>
          {g.isCustom && (
            <span style={{ fontSize: '0.65rem', color: '#d97706', backgroundColor: '#fffbeb', border: '1px solid #fef3c7', padding: '1px 5px', borderRadius: '4px' }}>
              custom
            </span>
          )}
        </span>
      );
    }
    if (type === 'country' && value) {
      const c = normalizeCountry(value);
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem' }}>
          <span>{c.flag || '🌍'}</span>
          <span>{c.name || value}</span>
        </span>
      );
    }
    if (type === 'allergy' && value) {
      const a = normalizeAllergies(value);
      if (a.isNKDA) {
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#15803d', fontWeight: 600, backgroundColor: '#f0fdf4', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', border: '1px solid #bbf7d0' }}>
            ✓ NKDA
          </span>
        );
      }
      if (a.items.length === 0) {
        return <span style={{ opacity: 0.5 }}>{placeholder}</span>;
      }
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
          {a.items.map((it, idx) => (
            <span
              key={idx}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: it.category === 'excipient' ? 700 : 500,
                backgroundColor: it.category === 'excipient' ? '#fef2f2' : '#f1f5f9',
                color: it.category === 'excipient' ? '#991b1b' : '#334155',
                border: `1px solid ${it.category === 'excipient' ? '#fecaca' : '#e2e8f0'}`,
              }}
            >
              {it.category === 'excipient' && '⚠️ '}
              {it.name}
            </span>
          ))}
        </div>
      );
    }
    if (type === 'select' && options) {
      return (options.find(o => o.value === value)?.label || value || <span style={{ opacity: 0.5 }}>{placeholder}</span>);
    }
    return (value != null && value !== '' ? String(value) : <span style={{ opacity: 0.5 }}>{placeholder}</span>);
  })();

  if (isEditing) {
    return (
      <div 
        style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start',
          position: 'relative'
        }}
      >
        <style>{`
          .inline-dosage-input::-webkit-outer-spin-button,
          .inline-dosage-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
          .inline-dosage-input { -moz-appearance: textfield; }
          .inline-edit-pill-btn {
            transition: transform 0.12s ease, opacity 0.15s ease, background-color 0.15s ease;
          }
          .inline-edit-pill-btn:hover {
            transform: scale(1.08);
          }
          .inline-edit-pill-btn:active {
            transform: scale(0.95);
          }
        `}</style>
        
        {type === 'goal' ? (
          <div style={{ minWidth: '220px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ flex: 1 }}>
              <CanonicalGoalSelect
                value={currentValue}
                onChange={(val) => {
                  setCurrentValue(val);
                  handleSave(val);
                }}
              />
            </div>
            <button 
              type="button"
              className="inline-edit-pill-btn"
              onMouseDown={(e) => { e.preventDefault(); setIsEditing(false); }} 
              style={{ 
                backgroundColor: '#fee2e2', border: 'none', borderRadius: '5px', padding: '0', cursor: 'pointer', 
                color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '24px', height: '24px', flexShrink: 0
              }}
              title="Cancel (Esc)"
            >
              <X size={13} strokeWidth={2.5} />
            </button>
          </div>
        ) : type === 'country' ? (
          <div style={{ minWidth: '220px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ flex: 1 }}>
              <CountrySelect
                value={currentValue}
                onChange={(val) => {
                  setCurrentValue(val);
                  handleSave(val);
                }}
              />
            </div>
            <button 
              type="button"
              className="inline-edit-pill-btn"
              onMouseDown={(e) => { e.preventDefault(); setIsEditing(false); }} 
              style={{ 
                backgroundColor: '#fee2e2', border: 'none', borderRadius: '5px', padding: '0', cursor: 'pointer', 
                color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '24px', height: '24px', flexShrink: 0
              }}
              title="Cancel (Esc)"
            >
              <X size={13} strokeWidth={2.5} />
            </button>
          </div>
        ) : type === 'allergy' ? (
          <CanonicalAllergySelect
            value={currentValue}
            onSave={(val) => {
              setCurrentValue(val);
              handleSave(val);
            }}
            onCancel={() => setIsEditing(false)}
          />
        ) : type === 'select' ? (
          <div style={{ minWidth: '160px', opacity: isSaving ? 0.7 : 1 }}>
            <SearchableSelect
              value={currentValue}
              onChange={(val) => {
                setCurrentValue(val);
                handleSave(val);
              }}
              options={options}
              disabled={isSaving}
              placeholder="Search..."
            />
          </div>
        ) : type === 'dosage' ? (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            border: '1.5px solid var(--color-primary, #0284c7)',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 14px -2px rgba(2, 132, 199, 0.2), 0 2px 6px -1px rgba(0,0,0,0.06)',
            padding: '2px 4px 2px 6px',
            height: '34px',
            whiteSpace: 'nowrap',
            opacity: isSaving ? 0.7 : 1
          }}>
            {prefix && <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.82rem', fontWeight: 600 }}>{prefix}</span>}
            
            <input
              ref={inputRef}
              type="number"
              className="inline-dosage-input"
              value={dosageNum}
              onChange={(e) => setDosageNum(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSaving}
              step="any"
              placeholder="0"
              style={{
                width: '48px',
                height: '100%',
                border: 'none',
                outline: 'none',
                padding: '0 2px',
                fontSize: '0.88rem',
                fontWeight: 700,
                textAlign: 'right',
                color: '#0f172a',
                background: 'transparent'
              }}
            />

            <select
              value={dosageUnit}
              onChange={(e) => setDosageUnit(e.target.value)}
              disabled={isSaving}
              style={{
                height: '24px',
                border: 'none',
                outline: 'none',
                padding: '0 4px',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#334155',
                backgroundColor: '#f1f5f9',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {DOSAGE_UNITS.map(u => (
                <option key={u.value} value={u.value}>{u.value}</option>
              ))}
            </select>

            <div style={{ width: '1px', height: '18px', backgroundColor: '#cbd5e1', margin: '0 2px' }} />

            {isSaving ? (
              <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px', margin: '0 4px' }} />
            ) : (
              <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                <button 
                  className="inline-edit-pill-btn"
                  onMouseDown={(e) => { e.preventDefault(); handleSave(); }} 
                  style={{ 
                    backgroundColor: '#dcfce7', border: 'none', borderRadius: '5px', padding: '0', cursor: 'pointer', 
                    color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '24px', height: '24px'
                  }}
                  title="Save (Enter)"
                >
                  <Check size={13} strokeWidth={2.5} />
                </button>
                <button 
                  className="inline-edit-pill-btn"
                  onMouseDown={(e) => { e.preventDefault(); setCurrentValue(value ?? ''); setIsEditing(false); }} 
                  style={{ 
                    backgroundColor: '#fee2e2', border: 'none', borderRadius: '5px', padding: '0', cursor: 'pointer', 
                    color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '24px', height: '24px'
                  }}
                  title="Cancel (Esc)"
                >
                  <X size={13} strokeWidth={2.5} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            border: '1.5px solid var(--color-primary, #0284c7)',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 14px -2px rgba(2, 132, 199, 0.2), 0 2px 6px -1px rgba(0,0,0,0.06)',
            padding: '2px 4px 2px 8px',
            height: '34px',
            whiteSpace: 'nowrap',
            opacity: isSaving ? 0.7 : 1
          }}>
            {prefix && <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.82rem', fontWeight: 600 }}>{prefix}</span>}
            <input
              ref={inputRef}
              type={type === 'number' ? 'number' : type === 'email' ? 'email' : type === 'tel' ? 'tel' : 'text'}
              className={type === 'number' ? 'inline-dosage-input' : undefined}
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSaving}
              step={type === 'number' ? 'any' : undefined}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: '0.88rem',
                fontWeight: 600,
                width: width || (type === 'number' ? '70px' : '110px'),
                textAlign: align,
                background: 'transparent',
                height: '100%',
                color: '#0f172a'
              }}
            />
            {suffix && <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.82rem', fontWeight: 600 }}>{suffix}</span>}
            
            <div style={{ width: '1px', height: '18px', backgroundColor: '#cbd5e1', margin: '0 2px' }} />

            {isSaving ? (
              <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px', margin: '0 4px' }} />
            ) : (
              <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                <button 
                  className="inline-edit-pill-btn"
                  onMouseDown={(e) => { e.preventDefault(); handleSave(); }} 
                  style={{ 
                    backgroundColor: '#dcfce7', border: 'none', borderRadius: '5px', padding: '0', cursor: 'pointer', 
                    color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '24px', height: '24px'
                  }}
                  title="Save (Enter)"
                >
                  <Check size={13} strokeWidth={2.5} />
                </button>
                <button 
                  className="inline-edit-pill-btn"
                  onMouseDown={(e) => { e.preventDefault(); setCurrentValue(value ?? ''); setIsEditing(false); }} 
                  style={{ 
                    backgroundColor: '#fee2e2', border: 'none', borderRadius: '5px', padding: '0', cursor: 'pointer', 
                    color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '24px', height: '24px'
                  }}
                  title="Cancel (Esc)"
                >
                  <X size={13} strokeWidth={2.5} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className="inline-editable-trigger"
      onClick={() => setIsEditing(true)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '2px 4px',
        margin: '-2px -4px', // Offset padding to keep layout stable
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        justifyContent: align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start',
      }}
      title="Click to edit"
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle, #f1f5f9)';
        const icon = e.currentTarget.querySelector('.edit-icon');
        if (icon) icon.style.opacity = '1';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        const icon = e.currentTarget.querySelector('.edit-icon');
        if (icon) icon.style.opacity = '0.7';
      }}
    >
      <span style={{ 
        display: 'inline-flex', 
        flexDirection: stacked ? 'column' : 'row',
        alignItems: stacked ? 'center' : 'center', 
        gap: stacked ? '0' : '2px', 
        whiteSpace: 'normal', 
        wordBreak: 'break-word' 
      }}>
        {prefix && <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85em' }}>{prefix}</span>}
        <span style={{ lineHeight: 1.2 }}>{formattedDisplay}</span>
        {suffix && <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85em', lineHeight: 1.2 }}>{suffix}</span>}
      </span>
      <span className="edit-icon" style={{ opacity: 0.7, transition: 'opacity 0.2s', color: 'var(--color-primary)', flexShrink: 0 }}>
        <Edit2 size={12} />
      </span>
    </div>
  );
}
