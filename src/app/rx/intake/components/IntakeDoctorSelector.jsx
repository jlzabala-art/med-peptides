"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/firebase';
import { searchAlgoliaFederated } from '@/services/algoliaSearch';
import {
  Stethoscope, Building2, Search, Check, Plus, Edit3, X,
  UserCheck, ShieldCheck, ChevronDown, RefreshCw, Mail, Phone
} from '@/lib/icons';

/**
 * IntakeDoctorSelector
 * Google Cloud UX compliant Doctor & Clinic search and selection.
 * Integrates Algolia `atlas_users` index with Firestore fallback for registered doctors and clinics.
 */
export default function IntakeDoctorSelector({
  physicianForm,
  setPhysicianForm,
  setQuotationEmail,
  isPhysicianValid
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [algoliaHits, setAlgoliaHits] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [dbDoctors, setDbDoctors] = useState([]);
  const [loadingDb, setLoadingDb] = useState(true);
  const [manualMode, setManualMode] = useState(false);
  const wrapperRef = useRef(null);

  // 1. Initial load of registered doctors and clinics from Firestore
  useEffect(() => {
    let active = true;
    const fetchRegistered = async () => {
      try {
        const usersRef = collection(db, 'users');
        const qDocs = query(usersRef, where('role', 'in', ['doctor', 'clinic', 'admin']), limit(30));
        const snap = await getDocs(qDocs);
        if (active) {
          const list = snap.docs.map(doc => {
            const d = doc.data();
            return {
              id: doc.id,
              name: d.name || d.displayName || d.doctorName || '',
              license: d.licenseNumber || d.license || '',
              clinic: d.clinic || d.clinicName || '',
              email: d.email || '',
              phone: d.phone || '',
              specialty: d.specialty || (d.role === 'doctor' ? 'Physician Specialist' : 'Clinical Facility'),
              role: d.role
            };
          }).filter(u => u.name && u.email && !u.name.includes('Test Admin') && !u.name.includes('Batch Import'));
          setDbDoctors(list);
        }
      } catch (err) {
        console.warn('[IntakeDoctorSelector] Firestore initial load:', err.message);
      } finally {
        if (active) setLoadingDb(false);
      }
    };
    fetchRegistered();
    return () => { active = false; };
  }, []);

  // 2. Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 3. Debounced Algolia + Local Search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setAlgoliaHits([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await searchAlgoliaFederated(searchTerm.trim(), ['atlas_users'], 8);
        const rawUsers = res.users || [];
        
        const hits = rawUsers
          .filter(u => ['doctor', 'clinic', 'admin'].includes(u.role) || u.doctorName || u.clinicName)
          .map(u => ({
            id: u.objectID || u.id,
            name: u.name || u.displayName || u.doctorName || '',
            license: u.licenseNumber || u.license || '',
            clinic: u.clinic || u.clinicName || '',
            email: u.email || '',
            phone: u.phone || '',
            specialty: u.specialty || 'Physician Specialist',
            role: u.role || 'doctor'
          }));

        setAlgoliaHits(hits);
      } catch (e) {
        console.warn('[IntakeDoctorSelector] Algolia search error:', e.message);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Combined candidates for dropdown
  const candidates = useMemo(() => {
    if (searchTerm.trim()) {
      if (algoliaHits.length > 0) return algoliaHits;
      // Fallback local filter
      const q = searchTerm.toLowerCase();
      return dbDoctors.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.clinic.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q) ||
        d.license.toLowerCase().includes(q)
      );
    }
    return dbDoctors;
  }, [searchTerm, algoliaHits, dbDoctors]);

  const handleSelectDoctor = (doc) => {
    setPhysicianForm({
      ...physicianForm,
      name: doc.name,
      licenseNumber: doc.license || physicianForm.licenseNumber || '',
      clinic: doc.clinic || physicianForm.clinic || '',
      email: doc.email || physicianForm.email || '',
      phone: doc.phone || physicianForm.phone || '',
      specialty: doc.specialty || 'Physician Specialist',
      doctorId: doc.id
    });
    if (doc.email && setQuotationEmail) {
      setQuotationEmail(doc.email);
    }
    setIsOpen(false);
    setSearchTerm('');
    setManualMode(false);
    toast.success(`Selected ${doc.name} ✓`);
  };

  const isSelected = Boolean(physicianForm.name && physicianForm.email);

  return (
    <div ref={wrapperRef} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      
      {/* ── Search Input / Autocomplete Bar ── */}
      <div style={{ position: 'relative' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#f8fafc',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          padding: '6px 12px',
          transition: 'all 0.15s ease',
          boxShadow: isOpen ? '0 0 0 2px #bfdbfe' : 'none'
        }}>
          <Search size={16} style={{ color: '#64748b', flexShrink: 0 }} />
          <input
            type="text"
            value={searchTerm}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            placeholder="Search registered doctors & clinics (Algolia)..."
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '0.84rem',
              color: '#0f172a'
            }}
          />
          {isSearching && (
            <RefreshCw size={14} className="animate-spin" style={{ color: '#0284c7' }} />
          )}
          {searchTerm && (
            <button
              type="button"
              onClick={() => { setSearchTerm(''); }}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px' }}
            >
              <X size={14} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b', padding: '2px' }}
          >
            <ChevronDown size={16} />
          </button>
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px rgba(15, 23, 42, 0.15)',
            maxHeight: '260px',
            overflowY: 'auto',
            zIndex: 99999,
            padding: '6px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 8px',
              borderBottom: '1px solid #f1f5f9',
              fontSize: '0.70rem',
              fontWeight: 700,
              color: '#64748b',
              textTransform: 'uppercase'
            }}>
              <span>{searchTerm ? 'Search Results (Algolia)' : 'Registered Clinical Providers'}</span>
              <span>{candidates.length} Available</span>
            </div>

            {candidates.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '0.80rem' }}>
                No matching doctors found in Algolia index.
                <div style={{ marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setManualMode(true);
                      setIsOpen(false);
                    }}
                    style={{
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      border: '1px solid #bfdbfe',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    + Enter Custom / New Doctor
                  </button>
                </div>
              </div>
            ) : (
              candidates.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => handleSelectDoctor(doc)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'background 0.12s ease',
                    background: physicianForm.email === doc.email ? '#eff6ff' : 'transparent',
                    borderBottom: '1px solid #f8fafc'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = physicianForm.email === doc.email ? '#eff6ff' : 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      background: '#e0f2fe',
                      color: '#0284c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Stethoscope size={16} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {doc.name}
                      </div>
                      <div style={{ fontSize: '0.73rem', color: '#64748b', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {doc.clinic && <span>🏢 {doc.clinic}</span>}
                        {doc.license && <span>· Lic. {doc.license}</span>}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 600 }}>
                      {doc.email}
                    </span>
                    {physicianForm.email === doc.email && (
                      <Check size={16} style={{ color: '#16a34a' }} />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ── Selected Doctor Summary Pill / Edit Toggle ── */}
      {isSelected && !manualMode && (
        <div style={{
          background: isPhysicianValid ? '#f0fdf4' : '#fffbeb',
          border: isPhysicianValid ? '1px solid #bbf7d0' : '1px solid #fde68a',
          borderRadius: '8px',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <UserCheck size={18} style={{ color: isPhysicianValid ? '#16a34a' : '#d97706', flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 750, color: '#0f172a' }}>
                {physicianForm.name} {physicianForm.clinic ? `(${physicianForm.clinic})` : ''}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                ✉ {physicianForm.email} {physicianForm.licenseNumber ? `· Lic: ${physicianForm.licenseNumber}` : ''}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setManualMode(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#0284c7',
              fontSize: '0.74rem',
              fontWeight: 650,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px'
            }}
          >
            <Edit3 size={12} />
            Edit Fields
          </button>
        </div>
      )}

      {/* ── Manual Fields (Always visible if manualMode or not yet selected) ── */}
      {(!isSelected || manualMode) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '4px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
              Physician Full Name *
            </label>
            <input
              type="text"
              required
              value={physicianForm.name}
              onChange={(e) => setPhysicianForm({ ...physicianForm, name: e.target.value })}
              placeholder="e.g. Dr. Jane Doe"
              style={{
                width: '100%', padding: '8px 12px', borderRadius: '6px',
                border: '1px solid #cbd5e1', fontSize: '0.84rem', color: '#0f172a',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                Medical License / No. *
              </label>
              <input
                type="text"
                value={physicianForm.licenseNumber}
                onChange={(e) => setPhysicianForm({ ...physicianForm, licenseNumber: e.target.value })}
                placeholder="e.g. MD-982314"
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: '6px',
                  border: '1px solid #cbd5e1', fontSize: '0.84rem', color: '#0f172a',
                  boxSizing: 'border-box', fontFamily: 'monospace'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                Practice / Clinic
              </label>
              <input
                type="text"
                value={physicianForm.clinic}
                onChange={(e) => setPhysicianForm({ ...physicianForm, clinic: e.target.value })}
                placeholder="e.g. Dermatology Clinic"
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: '6px',
                  border: '1px solid #cbd5e1', fontSize: '0.84rem', color: '#0f172a',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                Physician Email (For Compounding Quotes) *
              </label>
              <input
                type="email"
                required
                value={physicianForm.email}
                onChange={(e) => {
                  setPhysicianForm({ ...physicianForm, email: e.target.value });
                  if (setQuotationEmail) setQuotationEmail(e.target.value);
                }}
                placeholder="doctor@clinic.com"
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: '6px',
                  border: '1px solid #cbd5e1', fontSize: '0.84rem', color: '#0f172a',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                Phone Number
              </label>
              <input
                type="tel"
                value={physicianForm.phone}
                onChange={(e) => setPhysicianForm({ ...physicianForm, phone: e.target.value })}
                placeholder="+34 600 000 000"
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: '6px',
                  border: '1px solid #cbd5e1', fontSize: '0.84rem', color: '#0f172a',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
