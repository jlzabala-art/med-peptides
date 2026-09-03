"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Stethoscope, Search, X, Check, Loader2 } from 'lucide-react';
import { searchDoctorsAction } from '../../../actions/patientsActions';
import { searchPhysicians } from '../../../repositories/userRepository';
import { logger } from '../../../utils/logger';

export default function PhysicianPicker({
  value, // doctorId
  physicianName: initialDoctorName,
  clinicId, // optional selected clinic to prioritize
  onChange, // ({ doctorId, doctorName }) => void
  disabled = false,
  placeholder = "Search doctor by name, email or specialty..."
}) {
  const [queryText, setQueryText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(
    value || initialDoctorName ? { id: value || '', name: initialDoctorName || value } : null
  );

  const containerRef = useRef(null);

  useEffect(() => {
    if (value || initialDoctorName) {
      setSelectedDoctor({ id: value || '', name: initialDoctorName || value });
    } else {
      setSelectedDoctor(null);
    }
  }, [value, initialDoctorName]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const serverResults = await searchDoctorsAction(queryText, clinicId, 50);
        if (active && Array.isArray(serverResults) && serverResults.length > 0) {
          setDoctors(serverResults);
          setLoading(false);
          return;
        }

        // Fallback to repository
        const fallbackResults = await searchPhysicians(queryText, 50);
        if (active) {
          let list = (fallbackResults || []).map((data) => ({
            id: data.id,
            name: data.displayName || data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.email,
            email: data.email || '',
            specialty: data.specialty || 'General Practitioner',
            clinicId: data.clinicId || null,
          }));

          if (clinicId) {
            list.sort((a, b) => (b.clinicId === clinicId ? 1 : 0) - (a.clinicId === clinicId ? 1 : 0));
          }

          setDoctors(list);
        }
      } catch (err) {
        logger.warn('Doctor search error in PhysicianPicker', { error: err.message });
      } finally {
        if (active) setLoading(false);
      }
    }, 150);


    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [queryText, clinicId, isOpen]);

  const handleSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setIsOpen(false);
    setQueryText('');
    if (onChange) {
      onChange({ doctorId: doctor.id, doctorName: doctor.name || doctor.id });
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSelectedDoctor(null);
    if (onChange) {
      onChange({ doctorId: '', doctorName: '' });
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {selectedDoctor?.name ? (
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
            <Stethoscope size={16} color="var(--color-primary, #003666)" style={{ flexShrink: 0 }} />
            <span style={{ fontWeight: 600, color: 'var(--text-primary, #0f172a)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {selectedDoctor.name}
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
              title="Remove doctor"
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
              {loading && doctors.length === 0 ? (
                <div style={{ padding: '0.75rem 1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Searching physicians...
                </div>
              ) : doctors.length === 0 ? (
                <div style={{ padding: '0.75rem 1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  No physicians found.
                </div>
              ) : (
                doctors.map((doctor) => {
                  const isClinicMatch = clinicId && doctor.clinicId === clinicId;
                  return (
                    <div
                      key={doctor.id}
                      onClick={() => handleSelect(doctor)}
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
                        <Stethoscope size={14} color="var(--text-muted, #64748b)" />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary, #0f172a)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span>{doctor.name}</span>
                            {isClinicMatch && (
                              <span style={{ fontSize: '0.68rem', padding: '1px 5px', borderRadius: '4px', background: 'var(--color-info-bg, #eff6ff)', color: 'var(--color-info, #2563eb)', fontWeight: 700 }}>
                                Clinic Affiliated
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {doctor.specialty || 'Practitioner'}{doctor.email ? ` · ${doctor.email}` : ''}
                          </div>
                        </div>
                      </div>
                      {selectedDoctor?.id === doctor.id && <Check size={15} color="var(--color-primary, #003666)" />}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
