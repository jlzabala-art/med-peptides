"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Search, 
  User, 
  Building2, 
  Stethoscope, 
  Factory, 
  Globe, 
  Plus, 
  Check, 
  Loader2, 
  X, 
  RotateCcw,
  Sparkles,
  CheckCircle2
} from '@/lib/icons';

const ROLE_BADGES = {
  doctor: { label: 'Doctor', color: '#0d9488', bg: '#f0fdfa' },
  clinic: { label: 'Clinic', color: '#0d9488', bg: '#f0fdfa' },
  wholesaler: { label: 'Wholesaler', color: '#c2410c', bg: '#fff7ed' },
  wholeseller: { label: 'Wholesaler', color: '#c2410c', bg: '#fff7ed' },
  patient: { label: 'Patient', color: '#7c3aed', bg: '#f5f3ff' },
  client: { label: 'Patient', color: '#7c3aed', bg: '#f5f3ff' },
  supplier: { label: 'Supplier', color: '#2563eb', bg: '#eff6ff' },
  external: { label: 'Manual', color: '#475569', bg: '#f8fafc' },
};

function getRoleMeta(type = '') {
  const t = String(type).toLowerCase();
  return ROLE_BADGES[t] || { label: type || 'Contact', color: '#475569', bg: '#f1f5f9' };
}

function getInitials(name = '') {
  if (!name) return '??';
  const clean = name.replace(/^Dr\.\s+/i, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.substring(0, 2).toUpperCase();
}

/**
 * UniversalRecipientCombobox
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud UX Standard single-field search & selection component for recipients.
 * Replaces cumbersome 5-button card matrices with a streamlined 42px Combobox:
 * 1. Compact Entity Chip when selected (with role badge, workspace link & Change button)
 * 2. Unified omnibox search across Doctors, Clinics, Wholesalers, Patients, Suppliers
 * 3. Inline manual entry fallback without taking extra vertical screen space
 */
export default function UniversalRecipientCombobox({
  value = null, // { type, id, name, company, email, phone, notes, source }
  onChange,
  disabled = false,
  autoBoundWorkspaceEntity = null,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);

  // Manual inputs
  const [manualName, setManualName] = useState('');
  const [manualContact, setManualContact] = useState('');
  const [manualType, setManualType] = useState('doctor');

  const containerRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch recipients across all roles
  const fetchRecipients = useCallback(async (query = '') => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ type: 'all', limit: '35' });
      if (query.trim()) params.set('q', query.trim());
      const res = await fetch(`/api/shares/recipients?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setContacts(data.items || []);
      } else {
        setContacts([]);
      }
    } catch (err) {
      console.error('[UniversalRecipientCombobox] Error:', err);
      setContacts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Trigger search on focus or query change
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        fetchRecipients(searchQuery);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, searchQuery, fetchRecipients]);

  const handleSelectContact = (contact) => {
    setIsOpen(false);
    setSearchQuery('');
    setIsManualMode(false);
    if (typeof onChange === 'function') {
      onChange({
        type: contact.type || contact.role || 'doctor',
        id: contact.id,
        name: contact.name || '',
        company: contact.company || '',
        email: contact.email || '',
        phone: contact.phone || '',
        notes: '',
        source: 'directory'
      });
    }
  };

  const handleApplyWorkspaceRecipient = () => {
    if (!autoBoundWorkspaceEntity) return;
    if (typeof onChange === 'function') {
      onChange({
        type: autoBoundWorkspaceEntity.type || 'doctor',
        id: autoBoundWorkspaceEntity.id || null,
        name: autoBoundWorkspaceEntity.name || autoBoundWorkspaceEntity.displayName || '',
        company: autoBoundWorkspaceEntity.company || autoBoundWorkspaceEntity.clinicName || '',
        email: autoBoundWorkspaceEntity.email || '',
        phone: autoBoundWorkspaceEntity.phone || '',
        notes: autoBoundWorkspaceEntity.notes || '',
        source: 'workspace'
      });
    }
    setIsOpen(false);
  };

  const handleConfirmManual = () => {
    if (!manualName.trim()) return;
    const isEmail = manualContact.includes('@');
    const newRecipient = {
      type: manualType,
      id: null,
      name: manualName.trim(),
      company: '',
      email: isEmail ? manualContact.trim() : '',
      phone: !isEmail ? manualContact.trim() : '',
      notes: '',
      source: 'manual'
    };
    if (typeof onChange === 'function') {
      onChange(newRecipient);
    }
    setIsManualMode(false);
    setIsOpen(false);
  };

  const handleClear = () => {
    if (typeof onChange === 'function') {
      onChange({
        type: 'doctor',
        id: null,
        name: '',
        company: '',
        email: '',
        phone: '',
        notes: '',
        source: null
      });
    }
    setSearchQuery('');
    setIsManualMode(false);
    setIsOpen(true);
  };

  const hasSelectedValue = Boolean(value?.name || value?.id);
  const roleMeta = getRoleMeta(value?.type);

  return (
    <div ref={containerRef} style={{ width: '100%', position: 'relative' }}>
      
      {/* ── STATE 1: Entity Selected (GCP Compact Entity Chip) ── */}
      {hasSelectedValue && !isManualMode ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          padding: '8px 12px',
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          minHeight: '44px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: roleMeta.bg,
              color: roleMeta.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.74rem',
              flexShrink: 0,
              border: `1px solid ${roleMeta.color}30`
            }}>
              {getInitials(value.name)}
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {value.name}
                </span>
                <span style={{
                  padding: '1px 6px',
                  borderRadius: '4px',
                  fontSize: '0.66rem',
                  fontWeight: 700,
                  background: roleMeta.bg,
                  color: roleMeta.color,
                  border: `1px solid ${roleMeta.color}40`,
                  textTransform: 'capitalize'
                }}>
                  {roleMeta.label}
                </span>
                {value.source === 'workspace' && (
                  <span style={{
                    padding: '1px 6px',
                    borderRadius: '4px',
                    fontSize: '0.64rem',
                    fontWeight: 700,
                    background: '#e0f2fe',
                    color: '#0369a1',
                    border: '1px solid #bae6fd',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}>
                    <Sparkles size={10} /> Active Workspace
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {[value.company, value.email, value.phone].filter(Boolean).join(' · ') || 'Tracked direct recipient'}
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={disabled}
            onClick={handleClear}
            style={{
              padding: '5px 10px',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '0.74rem',
              fontWeight: 600,
              color: '#334155',
              cursor: disabled ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'all 0.15s ease'
            }}
          >
            Change
          </button>
        </div>
      ) : isManualMode ? (
        /* ── STATE 2: Inline Manual Mode (Clean Compact Grid) ── */
        <div style={{
          background: '#f8fafc',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          padding: '10px 12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#334155' }}>
              Custom Recipient Details
            </span>
            <button
              type="button"
              onClick={() => setIsManualMode(false)}
              style={{ background: 'none', border: 'none', fontSize: '0.70rem', color: '#64748b', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px', marginBottom: '8px' }}>
            <div>
              <input
                type="text"
                placeholder="Full Name / Clinic Name *"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  fontSize: '0.80rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  background: '#ffffff'
                }}
              />
            </div>

            <div>
              <input
                type="text"
                placeholder="WhatsApp Phone or Email"
                value={manualContact}
                onChange={(e) => setManualContact(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  fontSize: '0.80rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  background: '#ffffff'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['doctor', 'wholesaler', 'patient'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setManualType(t)}
                  style={{
                    padding: '3px 8px',
                    fontSize: '0.68rem',
                    fontWeight: manualType === t ? 700 : 500,
                    borderRadius: '4px',
                    border: manualType === t ? '1px solid #003666' : '1px solid #cbd5e1',
                    background: manualType === t ? '#003666' : '#ffffff',
                    color: manualType === t ? '#ffffff' : '#475569',
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleConfirmManual}
              disabled={!manualName.trim()}
              style={{
                padding: '6px 14px',
                fontSize: '0.76rem',
                fontWeight: 700,
                background: manualName.trim() ? '#003666' : '#94a3b8',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: manualName.trim() ? 'pointer' : 'not-allowed'
              }}
            >
              Confirm Recipient
            </button>
          </div>
        </div>
      ) : (
        /* ── STATE 3: Searching Omnibox with Floating Dropdown ── */
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '0 10px',
            minHeight: '42px',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
          }}>
            <Search size={15} color="#64748b" style={{ flexShrink: 0, marginRight: '8px' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => {
                setIsOpen(true);
                fetchRecipients(searchQuery);
              }}
              placeholder="Search doctor, clinic, wholesaler, patient by name, email or phone..."
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '0.82rem',
                color: '#0f172a',
                background: 'transparent',
                height: '40px'
              }}
            />
            {isLoading && <Loader2 size={14} className="animate-spin" color="#003666" style={{ marginRight: '6px' }} />}
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px 4px' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Quick link button to active workspace recipient if available */}
          {autoBoundWorkspaceEntity && (autoBoundWorkspaceEntity.name || autoBoundWorkspaceEntity.id) && (
            <div style={{ marginTop: '6px' }}>
              <button
                type="button"
                onClick={handleApplyWorkspaceRecipient}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: '#0369a1',
                  cursor: 'pointer'
                }}
              >
                <Sparkles size={12} color="#0284c7" />
                <span>Link active workspace recipient: <strong>{autoBoundWorkspaceEntity.name}</strong></span>
              </button>
            </div>
          )}

          {/* Floating Results Dropdown */}
          {isOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)',
              maxHeight: '260px',
              overflowY: 'auto',
              zIndex: 100070
            }}>
              {contacts.length > 0 ? (
                contacts.map((c) => {
                  const m = getRoleMeta(c.type || c.role);
                  return (
                    <div
                      key={c.id}
                      onClick={() => handleSelectContact(c)}
                      style={{
                        padding: '8px 12px',
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        transition: 'background 0.1s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.80rem', fontWeight: 600, color: '#0f172a' }}>
                            {c.name}
                          </span>
                          <span style={{
                            padding: '1px 5px',
                            borderRadius: '4px',
                            fontSize: '0.64rem',
                            fontWeight: 700,
                            background: m.bg,
                            color: m.color,
                            border: `1px solid ${m.color}30`
                          }}>
                            {m.label}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.70rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {[c.company, c.email, c.phone].filter(Boolean).join(' · ')}
                        </div>
                      </div>
                      <Check size={14} color="#94a3b8" />
                    </div>
                  );
                })
              ) : !isLoading ? (
                <div style={{ padding: '14px 12px', textAlign: 'center', fontSize: '0.75rem', color: '#64748b' }}>
                  No contacts found in directory matching "{searchQuery}"
                </div>
              ) : null}

              {/* Bottom option: Enter manual details */}
              <div
                onClick={() => {
                  setIsManualMode(true);
                  setIsOpen(false);
                }}
                style={{
                  padding: '9px 12px',
                  background: '#f8fafc',
                  borderTop: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  color: '#0284c7'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
              >
                <Plus size={13} />
                <span>+ Enter custom / unlisted recipient</span>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
