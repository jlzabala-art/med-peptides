'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { User, Building2, Stethoscope, Factory, Globe, Search, Plus, Check, Loader2, FileText } from 'lucide-react';

const RECIPIENT_TYPES = [
  { id: 'doctor', label: 'Clínica / Médico', icon: Stethoscope, color: '#0d9488', bg: '#f0fdfa' },
  { id: 'patient', label: 'Paciente', icon: User, color: '#7c3aed', bg: '#f5f3ff' },
  { id: 'wholeseller', label: 'Wholesaler / Mayorista', icon: Building2, color: '#c2410c', bg: '#fff7ed' },
  { id: 'supplier', label: 'Proveedor', icon: Factory, color: '#2563eb', bg: '#eff6ff' },
  { id: 'external', label: 'Externo / Nuevo', icon: Globe, color: '#475569', bg: '#f8fafc' },
];

/**
 * RecipientHierarchySelector
 * 
 * 2-Step Hierarchical Selector:
 * 1. Pick Type / Role (Doctor, Patient, Wholesaler, Supplier, External)
 * 2. Lazy load directory contacts for that role (limit 25) with search,
 *    or enter custom recipient details.
 * 
 * Complies with Golden Rule #1 & #2 (Zero heavy payloads, lazy on-demand queries).
 */
export default function RecipientHierarchySelector({
  value = null, // { type, id, name, company, email, phone, notes }
  onChange,
  disabled = false,
  showNotesField = true,
}) {
  const [selectedType, setSelectedType] = useState(value?.type || 'doctor');
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isManualMode, setIsManualMode] = useState(value?.type === 'external' || (!value?.id && Boolean(value?.name)));

  // Form fields for custom / selected recipient
  const [recipientName, setRecipientName] = useState(value?.name || '');
  const [recipientCompany, setRecipientCompany] = useState(value?.company || '');
  const [recipientEmail, setRecipientEmail] = useState(value?.email || '');
  const [recipientPhone, setRecipientPhone] = useState(value?.phone || '');
  const [recipientNotes, setRecipientNotes] = useState(value?.notes || '');
  const [selectedId, setSelectedId] = useState(value?.id || null);

  // Sync state if initial value changes externally
  useEffect(() => {
    if (value) {
      if (value.type && value.type !== selectedType) setSelectedType(value.type);
      if (value.name !== undefined) setRecipientName(value.name || '');
      if (value.company !== undefined) setRecipientCompany(value.company || '');
      if (value.email !== undefined) setRecipientEmail(value.email || '');
      if (value.phone !== undefined) setRecipientPhone(value.phone || '');
      if (value.notes !== undefined) setRecipientNotes(value.notes || '');
      if (value.id !== undefined) setSelectedId(value.id);
    }
  }, [value]);

  // Fetch contacts for selected type when not in manual/external mode
  const fetchContacts = useCallback(async (type, query = '') => {
    if (type === 'external') {
      setContacts([]);
      return;
    }
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ type, limit: '25' });
      if (query.trim()) params.set('q', query.trim());
      const res = await fetch(`/api/shares/recipients?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setContacts(data.items || []);
      } else {
        setContacts([]);
      }
    } catch (err) {
      console.error('[RecipientHierarchySelector] Fetch error:', err);
      setContacts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Trigger fetch when type changes
  useEffect(() => {
    if (selectedType === 'external') {
      setIsManualMode(true);
      setContacts([]);
    } else {
      fetchContacts(selectedType, searchQuery);
    }
  }, [selectedType, fetchContacts]);

  // Notify parent of updates
  const notifyChange = (updates = {}) => {
    if (typeof onChange === 'function') {
      const merged = {
        type: selectedType,
        id: selectedId,
        name: recipientName,
        company: recipientCompany,
        email: recipientEmail,
        phone: recipientPhone,
        notes: recipientNotes,
        ...updates,
      };
      onChange(merged);
    }
  };

  const handleTypeSelect = (typeId) => {
    setSelectedType(typeId);
    setSearchQuery('');
    setSelectedId(null);
    if (typeId === 'external') {
      setIsManualMode(true);
      notifyChange({ type: typeId, id: null });
    } else {
      setIsManualMode(false);
      setRecipientName('');
      setRecipientCompany('');
      setRecipientEmail('');
      setRecipientPhone('');
      notifyChange({ type: typeId, id: null, name: '', company: '', email: '', phone: '' });
      fetchContacts(typeId, '');
    }
  };

  const handleContactSelect = (contact) => {
    setSelectedId(contact.id);
    setRecipientName(contact.name || '');
    setRecipientCompany(contact.company || '');
    setRecipientEmail(contact.email || '');
    setRecipientPhone(contact.phone || '');
    notifyChange({
      type: selectedType,
      id: contact.id,
      name: contact.name || '',
      company: contact.company || '',
      email: contact.email || '',
      phone: contact.phone || '',
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* ── Step 1: Recipient Type Pills ── */}
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '0.75rem', 
          fontWeight: 700, 
          color: '#475569', 
          marginBottom: '6px',
          textTransform: 'uppercase',
          letterSpacing: '0.04em'
        }}>
          1. ¿Para quién es el recurso compartido?
        </label>
        <div style={{ 
          display: 'flex', 
          gap: '6px', 
          overflowX: 'auto', 
          paddingBottom: '4px',
          WebkitOverflowScrolling: 'touch' 
        }}>
          {RECIPIENT_TYPES.map((t) => {
            const isSelected = selectedType === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                disabled={disabled}
                onClick={() => handleTypeSelect(t.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 10px',
                  borderRadius: '8px',
                  border: isSelected ? `2px solid ${t.color}` : '1px solid #cbd5e1',
                  backgroundColor: isSelected ? t.bg : '#ffffff',
                  color: isSelected ? t.color : '#475569',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.78rem',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
              >
                <Icon size={14} color={t.color} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Step 2: Directory Search or Manual Form ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <label style={{ 
            fontSize: '0.75rem', 
            fontWeight: 700, 
            color: '#475569',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            2. Seleccionar contacto / Destinatario
          </label>
          {selectedType !== 'external' && (
            <button
              type="button"
              onClick={() => {
                const next = !isManualMode;
                setIsManualMode(next);
                if (next) setSelectedId(null);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#0284c7',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: '0 2px'
              }}
            >
              {isManualMode ? '← Buscar en agenda' : '+ Ingresar datos manuales'}
            </button>
          )}
        </div>

        {/* Option A: Search Directory Dropdown */}
        {!isManualMode ? (
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', color: '#94a3b8' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  fetchContacts(selectedType, e.target.value);
                }}
                placeholder={`Buscar ${selectedType === 'doctor' ? 'médico o clínica' : selectedType === 'patient' ? 'paciente' : selectedType === 'wholeseller' ? 'mayorista' : 'proveedor'}...`}
                disabled={disabled}
                style={{
                  width: '100%',
                  padding: '7px 32px 7px 30px',
                  borderRadius: '7px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.8rem',
                  outline: 'none',
                  backgroundColor: '#ffffff'
                }}
              />
              {isLoading && (
                <Loader2 size={14} className="animate-spin" style={{ position: 'absolute', right: '10px', color: '#0284c7' }} />
              )}
            </div>

            {/* Matching Contacts List */}
            <div style={{
              maxHeight: '160px',
              overflowY: 'auto',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              marginTop: '6px',
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 5px rgba(0,0,0,0.04)'
            }}>
              {isLoading && contacts.length === 0 ? (
                <div style={{ padding: '12px', fontSize: '0.78rem', color: '#64748b', textAlign: 'center' }}>
                  Cargando agenda...
                </div>
              ) : contacts.length === 0 ? (
                <div style={{ padding: '12px', fontSize: '0.78rem', color: '#64748b', textAlign: 'center' }}>
                  No se encontraron resultados.{' '}
                  <span 
                    onClick={() => setIsManualMode(true)} 
                    style={{ color: '#0284c7', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
                  >
                    Ingresar manualmente
                  </span>
                </div>
              ) : (
                contacts.map(c => {
                  const isSelected = selectedId === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => handleContactSelect(c)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? '#f0fdf4' : 'transparent',
                        transition: 'background 0.1s ease',
                      }}
                      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }}>
                          {c.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.company ? `${c.company} · ` : ''}{c.email || c.phone || 'Sin contacto directo'}
                        </div>
                      </div>
                      {isSelected && (
                        <div style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.74rem', fontWeight: 700 }}>
                          <Check size={14} /> Seleccionado
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* Option B: Manual Input Fields */
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
            gap: '8px', 
            backgroundColor: '#f8fafc', 
            padding: '10px', 
            borderRadius: '8px',
            border: '1px solid #e2e8f0' 
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>
                Nombre completo *
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => {
                  setRecipientName(e.target.value);
                  notifyChange({ name: e.target.value });
                }}
                placeholder="Ej. Dr. Carlos Gómez"
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.78rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>
                Empresa / Clínica
              </label>
              <input
                type="text"
                value={recipientCompany}
                onChange={(e) => {
                  setRecipientCompany(e.target.value);
                  notifyChange({ company: e.target.value });
                }}
                placeholder="Ej. Clínica Regenera"
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.78rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>
                Email
              </label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => {
                  setRecipientEmail(e.target.value);
                  notifyChange({ email: e.target.value });
                }}
                placeholder="contacto@ejemplo.com"
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.78rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>
                WhatsApp / Teléfono
              </label>
              <input
                type="tel"
                value={recipientPhone}
                onChange={(e) => {
                  setRecipientPhone(e.target.value);
                  notifyChange({ phone: e.target.value });
                }}
                placeholder="+34 600 000 000"
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.78rem'
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Optional Step 3: Purpose / Notes ── */}
      {showNotesField && (
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '0.75rem', 
            fontWeight: 700, 
            color: '#475569', 
            marginBottom: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            Notas / Propósito del envío (opcional)
          </label>
          <input
            type="text"
            value={recipientNotes}
            onChange={(e) => {
              setRecipientNotes(e.target.value);
              notifyChange({ notes: e.target.value });
            }}
            placeholder="Ej. Cotización de péptidos Q3, Muestra clínica para evaluación..."
            style={{
              width: '100%',
              padding: '6px 8px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.78rem',
              backgroundColor: '#ffffff'
            }}
          />
        </div>
      )}
    </div>
  );
}
