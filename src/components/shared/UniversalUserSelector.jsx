import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useRoleAccess } from '../../hooks/useRoleAccess';
import { useAlgoliaSearch } from '../../hooks/data/useAlgoliaSearch';
import User from "lucide-react/dist/esm/icons/user";
import { Search, Plus, X, UserPlus, Check, RefreshCw, History } from "lucide-react";
import toast from 'react-hot-toast';

/**
 * UniversalUserSelector
 * Standard UI for selecting users (patients, doctors, account managers, clinics).
 * Uses Algolia for search and Firestore for a default list of recent/assigned users.
 * Supports inline Quick-Create for new patients/users without losing active context.
 */
export default function UniversalUserSelector({ 
  roleFilter = 'patient', // 'patient', 'doctor', 'wholesaler', 'clinic'
  value, // string (id)
  selectedUserObject = null, // optional full object if already selected
  onChange, // function(userObject)
  currentUserId,
  label,
  icon: Icon = User,
  placeholder = "Search by name, email, phone...",
  disabled = false,
  containerStyle = {}
}) {
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  // Quick Create Form State
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientEmail, setNewPatientEmail] = useState('');
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [newPatientDob, setNewPatientDob] = useState('');

  const { is } = useRoleAccess();

  const facetFilter = `role:${roleFilter}`;
  const { hits: searchResults, loading: searchLoading, isAlgoliaActive } = useAlgoliaSearch(
    'atlas_users', 
    searchTerm, 
    { facetFilters: [facetFilter] }
  );

  useEffect(() => {
    let active = true;
    const fetchTargets = async () => {
      setLoading(true);
      try {
        const usersRef = collection(db, 'users');
        let q;
        
        if (roleFilter === 'patient') {
           if (is('admin')) {
             q = query(usersRef, where('role', '==', 'patient'), limit(50));
           } else {
             q = query(usersRef, where('assignedDoctorId', '==', currentUserId), limit(50));
           }
        } else if (roleFilter === 'clinic') {
           if (is('admin')) {
             q = query(usersRef, where('role', '==', 'clinic'), limit(50));
           } else {
             q = query(usersRef, where('assignedAccountManagerId', '==', currentUserId), limit(50));
           }
        } else {
           // For doctors, wholesalers, etc. - fetch latest 50 globally
           q = query(usersRef, where('role', '==', roleFilter), limit(50));
        }

        if (q) {
          const snap = await getDocs(q);
          if (active) {
            setTargets(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          }
        }
      } catch (err) {
        console.error('Error fetching targets:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    if (currentUserId || is('admin') || ['doctor', 'wholesaler', 'staff'].includes(roleFilter)) {
      fetchTargets();
    } else {
      if (active) setLoading(false);
    }
    return () => { active = false; };
  }, [roleFilter, currentUserId, is]);

  const displayTargets = (isAlgoliaActive && searchTerm.trim()) ? searchResults : targets;

  // Selected Target object lookup
  const selectedTarget = useMemo(() => {
    if (selectedUserObject) return selectedUserObject;
    if (!value) return null;
    return targets.find(t => (t.id || t.objectID) === value) || null;
  }, [selectedUserObject, value, targets]);

  const handleSelect = (e) => {
    const activeList = (isAlgoliaActive && searchTerm.trim()) ? searchResults : targets;
    const selectedId = e.target.value;
    if (!selectedId) {
      onChange(null);
      return;
    }
    let t = activeList.find(x => (x.id || x.objectID) === selectedId);
    if (!t) {
      t = targets.find(x => (x.id || x.objectID) === selectedId);
    }
    onChange(t || null);
  };

  const handleQuickCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newPatientName.trim()) {
      toast.error('Please enter the patient full name');
      return;
    }
    setCreating(true);
    try {
      const newUserPayload = {
        name: newPatientName.trim(),
        displayName: newPatientName.trim(),
        email: newPatientEmail.trim().toLowerCase(),
        phone: newPatientPhone.trim(),
        dob: newPatientDob || null,
        role: roleFilter,
        status: 'active',
        assignedDoctorId: currentUserId || null,
        createdAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, 'users'), newUserPayload);
      const createdObj = { id: docRef.id, ...newUserPayload };
      
      // Update local cache
      setTargets(prev => [createdObj, ...prev]);
      
      // Auto-select newly created user
      onChange(createdObj);
      
      // Reset form & close modal
      setNewPatientName('');
      setNewPatientEmail('');
      setNewPatientPhone('');
      setNewPatientDob('');
      setShowQuickCreate(false);

      toast.success(`${roleFilter === 'patient' ? 'Patient' : 'User'} created & selected successfully!`);
    } catch (err) {
      console.error('Error creating new patient:', err);
      toast.error(`Failed to create patient: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  // Helper for avatar initials
  const getInitials = (nameStr) => {
    if (!nameStr) return 'P';
    const parts = nameStr.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div style={{ background: 'var(--color-bg-surface, #fff)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border, #e5e7eb)', ...containerStyle }}>
      
      {/* Header with Title & + Quick Create Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        {label && (
          <h3 style={{ fontSize: '0.95rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main, #111827)', fontWeight: 600 }}>
            <Icon size={16} />
            {label}
          </h3>
        )}

        {roleFilter === 'patient' && !disabled && (
          <button
            type="button"
            onClick={() => setShowQuickCreate(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid var(--color-primary, #003666)',
              background: 'var(--color-primary-bg, #eff6ff)',
              color: 'var(--color-primary, #003666)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Plus size={14} />
            + New Patient
          </button>
        )}
      </div>

      {/* Selected Patient Preview Card */}
      {selectedTarget ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          padding: '0.85rem 1rem',
          background: 'var(--surface-50, #f8fafc)',
          borderRadius: '10px',
          border: '1.5px solid var(--color-primary, #003666)',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--color-primary, #003666)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.9rem',
              flexShrink: 0
            }}>
              {getInitials(selectedTarget.name || selectedTarget.displayName)}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main, #111827)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {selectedTarget.name || selectedTarget.displayName || selectedTarget.email}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #6b7280)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {selectedTarget.email && <span>{selectedTarget.email}</span>}
                {selectedTarget.phone && <span>· {selectedTarget.phone}</span>}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
            {roleFilter === 'patient' && (
              <button
                type="button"
                onClick={() => {
                  window.open(`/admin/prescriptions?patientId=${selectedTarget.id || selectedTarget.objectID}`, '_blank');
                }}
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: '6px',
                  border: '1px solid #bfdbfe',
                  background: '#eff6ff',
                  color: 'var(--color-primary, #003666)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
                title="View patient prescription & dosage history"
              >
                <History size={13} />
                History
              </button>
            )}
            <button
              type="button"
              onClick={() => onChange(null)}
              disabled={disabled}
              style={{
                padding: '0.35rem 0.65rem',
                borderRadius: '6px',
                border: '1px solid var(--border, #d1d5db)',
                background: '#fff',
                color: 'var(--text-secondary, #4b5563)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Change
            </button>
          </div>
        </div>
      ) : (
        /* Search & Dropdown Selector */
        <>
          <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary, #9ca3af)' }} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              className="focus:ring-blue-500 focus:border-blue-500"
              style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.25rem', borderRadius: '8px', border: '1px solid var(--border, #e5e7eb)', fontSize: '0.88rem', outline: 'none' }}
            />
          </div>
          
          <select 
            value={value || ''} 
            onChange={handleSelect}
            disabled={disabled}
            className="focus:ring-blue-500 focus:border-blue-500"
            style={{
              width: '100%',
              padding: '0.65rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--border, #e5e7eb)',
              fontFamily: 'inherit',
              fontSize: '0.88rem',
              outline: 'none',
              background: 'var(--bg-main, #fff)',
              color: 'var(--text-main, #111827)'
            }}
          >
            <option value="">
              -- {searchTerm ? (searchLoading ? 'Searching...' : 'Search Results') : 'Select Active Patient (Recent 50)'} --
            </option>

            {displayTargets.map(t => (
              <option key={t.id || t.objectID} value={t.id || t.objectID}>
                {t.name || t.displayName || t.email} {t.email ? `(${t.email})` : ''}
              </option>
            ))}
          </select>
        </>
      )}

      {/* Inline Quick Create Patient Modal / Sheet */}
      {showQuickCreate && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(3px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}>
          <div style={{
            width: '100%',
            maxWidth: '520px',
            background: '#fff',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            padding: '1.25rem',
            boxShadow: '0 -10px 25px rgba(0,0,0,0.15)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            {/* Drag Handle */}
            <div style={{ width: '40px', height: '4px', background: '#cbd5e1', borderRadius: '2px', margin: '0 auto 1rem' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserPlus size={20} color="var(--color-primary, #003666)" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Quick Add New Patient
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickCreate(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleQuickCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                  Full Name <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newPatientName}
                  onChange={e => setNewPatientName(e.target.value)}
                  placeholder="Ex: Carlos Méndez"
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border, #d1d5db)', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={newPatientEmail}
                    onChange={e => setNewPatientEmail(e.target.value)}
                    placeholder="carlos@example.com"
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border, #d1d5db)', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={newPatientPhone}
                    onChange={e => setNewPatientPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border, #d1d5db)', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                  Date of Birth <span style={{ fontWeight: 400, color: 'var(--text-tertiary)' }}>(optional)</span>
                </label>
                <input
                  type="date"
                  value={newPatientDob}
                  onChange={e => setNewPatientDob(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border, #d1d5db)', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowQuickCreate(false)}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border, #d1d5db)', background: '#fff', fontWeight: 600, color: 'var(--text-secondary)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', background: 'var(--color-primary, #003666)', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                >
                  {creating ? <RefreshCw size={16} className="animate-spin" /> : <Check size={16} />}
                  {creating ? 'Saving...' : 'Create & Select'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

