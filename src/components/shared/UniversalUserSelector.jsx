import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { useRoleAccess } from '../../hooks/useRoleAccess';
import { useAlgoliaSearch } from '../../hooks/data/useAlgoliaSearch';
import User from "lucide-react/dist/esm/icons/user";
import { Search } from "lucide-react";

/**
 * UniversalUserSelector
 * Standard UI for selecting users (patients, doctors, account managers, clinics).
 * Uses Algolia for search and Firestore for a default list of recent/assigned users.
 */
export default function UniversalUserSelector({ 
  roleFilter = 'patient', // 'patient', 'doctor', 'wholesaler', 'clinic'
  value, // string (id)
  onChange, // function(userObject)
  currentUserId,
  label,
  icon: Icon = User,
  placeholder = "Buscar por nombre, email, teléfono...",
  disabled = false,
  containerStyle = {}
}) {
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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

  const handleSelect = (e) => {
    const activeList = (isAlgoliaActive && searchTerm.trim()) ? searchResults : targets;
    const selectedId = e.target.value;
    if (!selectedId) {
      onChange(null);
      return;
    }
    // Search in current active list, fallback to targets
    let t = activeList.find(x => (x.id || x.objectID) === selectedId);
    if (!t) {
      t = targets.find(x => (x.id || x.objectID) === selectedId);
    }
    onChange(t || null);
  };

  const displayTargets = (isAlgoliaActive && searchTerm.trim()) ? searchResults : targets;
  
  // Make sure the currently selected user is in the options list
  // so the dropdown displays their name if they were selected previously 
  // but aren't in the current top 50 or search results
  const hasSelectedTarget = value && !displayTargets.find(t => (t.id || t.objectID) === value);
  const selectedTargetInTargets = hasSelectedTarget ? targets.find(t => (t.id || t.objectID) === value) : null;

  return (
    <div style={{ background: 'var(--color-bg-surface, #fff)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border, #e5e7eb)', ...containerStyle }}>
      {label && (
        <h3 style={{ fontSize: '0.95rem', margin: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main, #111827)' }}>
          <Icon size={16} />
          {label}
        </h3>
      )}

      <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
        <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary, #9ca3af)' }} />
        <input 
          type="text" 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="focus:ring-blue-500 focus:border-blue-500"
          style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2.25rem', borderRadius: '6px', border: '1px solid var(--border, #e5e7eb)', fontSize: '0.85rem', outline: 'none' }}
        />
      </div>
      
      <select 
        value={value || ''} 
        onChange={handleSelect}
        disabled={disabled}
        className="focus:ring-blue-500 focus:border-blue-500"
        style={{
          width: '100%',
          padding: '0.5rem 0.75rem',
          borderRadius: '6px',
          border: '1px solid var(--border, #e5e7eb)',
          fontFamily: 'inherit',
          fontSize: '0.85rem',
          outline: 'none',
          background: 'var(--bg-main, #fff)',
          color: 'var(--text-main, #111827)'
        }}
      >
        <option value="">-- {searchTerm ? (searchLoading ? 'Buscando...' : 'Resultados de búsqueda') : 'Últimos dados de alta (50)'} --</option>
        
        {/* Inject the selected user if it's missing from the current view */}
        {hasSelectedTarget && selectedTargetInTargets && (
           <option key={selectedTargetInTargets.id || selectedTargetInTargets.objectID} value={selectedTargetInTargets.id || selectedTargetInTargets.objectID}>
             {selectedTargetInTargets.name || selectedTargetInTargets.email} {selectedTargetInTargets.role ? `(${selectedTargetInTargets.role})` : ''}
           </option>
        )}
        {hasSelectedTarget && !selectedTargetInTargets && (
           <option key={value} value={value}>
             ID: {value} (Usuario guardado)
           </option>
        )}

        {displayTargets.map(t => (
          <option key={t.id || t.objectID} value={t.id || t.objectID}>
            {t.name || t.email} {t.role ? `(${t.role})` : ''}
          </option>
        ))}
      </select>
    </div>
  );
}
