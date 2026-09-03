"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Building2, Search, X, Check, Loader2 } from 'lucide-react';
import { searchClinicsAction } from '../../../actions/patientsActions';
import { searchClinics } from '../../../repositories/userRepository';
import { logger } from '../../../utils/logger';

export default function ClinicPicker({
  value, // clinicId or clinic name
  clinicName: initialClinicName,
  onChange, // ({ clinicId, clinicName }) => void
  disabled = false,
  placeholder = "Search clinic by name or location..."
}) {
  const [queryText, setQueryText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState(
    value || initialClinicName ? { id: value || '', name: initialClinicName || value } : null
  );

  const containerRef = useRef(null);

  // Sync internal state when external value changes
  useEffect(() => {
    if (value || initialClinicName) {
      setSelectedClinic({ id: value || '', name: initialClinicName || value });
    } else {
      setSelectedClinic(null);
    }
  }, [value, initialClinicName]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch / search clinics
  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        // Try server action first
        const serverResults = await searchClinicsAction(queryText, 50);
        if (active && Array.isArray(serverResults) && serverResults.length > 0) {
          setClinics(serverResults);
          setLoading(false);
          return;
        }

        // Fallback to repository
        const fallbackResults = await searchClinics(queryText, 50);
        if (active) {
          setClinics(fallbackResults || []);
        }
      } catch (err) {
        logger.warn('Clinic search error in ClinicPicker', { error: err.message });
      } finally {
        if (active) setLoading(false);
      }
    }, 150);


    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [queryText, isOpen]);

  const handleSelect = (clinic) => {
    setSelectedClinic(clinic);
    setIsOpen(false);
    setQueryText('');
    if (onChange) {
      onChange({ clinicId: clinic.id, clinicName: clinic.name || clinic.id });
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSelectedClinic(null);
    if (onChange) {
      onChange({ clinicId: '', clinicName: '' });
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {selectedClinic?.name ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.55rem 0.75rem',
          borderRadius: '8px',
          border: '1px solid var(--border, #e2e8f0)',
          background: 'var(--surface-50, #f8fafc)',
          fontSize: '0.875rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
            <Building2 size={16} color="var(--color-primary, #003666)" style={{ flexShrink: 0 }} />
            <span style={{ fontWeight: 600, color: 'var(--text-primary, #0f172a)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {selectedClinic.name}
            </span>
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted, #94a3b8)',
                padding: '2px',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Remove clinic"
            >
              <X size={15} />
            </button>
          )}
        </div>
      ) : (
        <div>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              disabled={disabled}
              value={queryText}
              onFocus={() => setIsOpen(true)}
              onChange={(e) => {
                setQueryText(e.target.value);
                if (!isOpen) setIsOpen(true);
              }}
              placeholder={placeholder}
              style={{
                width: '100%',
                padding: '0.6rem 2.2rem 0.6rem 2.2rem',
                borderRadius: '8px',
                border: '1px solid var(--border, #e2e8f0)',
                background: 'var(--surface, #ffffff)',
                fontSize: '0.875rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <Search size={15} color="var(--text-muted, #94a3b8)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            {loading && (
              <Loader2 size={15} className="spin" color="var(--text-muted, #94a3b8)" style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            )}
          </div>

          {isOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              maxHeight: '220px',
              overflowY: 'auto',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              border: '1px solid var(--border, #e2e8f0)',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              zIndex: 1050,
              padding: '0.35rem 0'
            }}>
              {loading && clinics.length === 0 ? (
                <div style={{ padding: '0.75rem 1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Searching clinics...
                </div>
              ) : clinics.length === 0 ? (
                <div style={{ padding: '0.75rem 1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  No clinics found.
                </div>
              ) : (
                clinics.map((clinic) => (
                  <div
                    key={clinic.id}
                    onClick={() => handleSelect(clinic)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.55rem 0.85rem',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-100, #f1f5f9)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Building2 size={14} color="var(--text-muted, #64748b)" />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>{clinic.name || clinic.id}</div>
                        {clinic.city && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{clinic.city}</div>}
                      </div>
                    </div>
                    {selectedClinic?.id === clinic.id && <Check size={15} color="var(--color-primary, #003666)" />}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
