'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Download, Globe, FileText, ChevronDown, ChevronUp, Loader, 
  Search, Plus, Check, X, Building, User, Users, ExternalLink,
  ShieldCheck, Sparkles
} from '@/lib/icons';
import { toast } from 'react-hot-toast';

const SUPPLIER_SCOPES = [
  { id: 'lotusland', label: 'Lotusland / RegenPept', badge: '104 variants', currency: 'USD', filter: 'lotusland', catalogueFilter: 'RegenPept' },
  { id: 'europeptides', label: 'EuroPeptides', badge: '54 variants', currency: 'USD', filter: 'europeptides' },
  { id: 'larimedical', label: 'LARIMEDICAL (Sterilia)', badge: '8 variants', currency: 'EUR', filter: 'supplier-larimedical' },
  { id: 'all', label: 'Global Catalog (All Suppliers)', badge: '166+ variants', currency: 'USD', filter: null },
  { id: 'filtered', label: 'Active Table Filters', badge: 'Current View', currency: 'USD', filter: 'filtered' },
];

const MARGIN_PRESETS = [0, 10, 15, 20, 25, 30, 40, 50];

const RECIPIENT_TYPES = [
  { id: 'general', label: 'General', icon: Users },
  { id: 'clinic', label: 'Clínica', icon: Building },
  { id: 'doctor', label: 'Médico', icon: User },
  { id: 'wholeseller', label: 'Mayorista', icon: Building },
  { id: 'patient', label: 'Paciente', icon: User },
];

export default function CatalogExportPopover({
  isOpen,
  onClose,
  anchorRef,
  onExportJSON,
  onExportCSV,
  onOpenExportHub,
  onGeneratePDF,
  onGenerateWebShare,
  markupPercent = 20,
  setMarkupPercent,
  actionLoading = null,
  isMobile = false,
  filteredProductIds = [],
}) {
  const popoverRef = useRef(null);
  
  // Scopes & Margins
  const [selectedScope, setSelectedScope] = useState('lotusland');
  const [isCustomMargin, setIsCustomMargin] = useState(
    !MARGIN_PRESETS.includes(markupPercent)
  );

  // Recipient Personalization State
  const [recipientType, setRecipientType] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [clientsList, setClientsList] = useState([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [showRawTools, setShowRawTools] = useState(false);

  // Quick Add Form fields
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target) &&
        anchorRef?.current && !anchorRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener('pointerdown', handleOutside);
    }, 40);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('pointerdown', handleOutside);
    };
  }, [isOpen, onClose, anchorRef]);

  // Fetch clients when recipientType changes or search query updates
  useEffect(() => {
    if (recipientType === 'general' || !isOpen) return;

    let active = true;
    const fetchClients = async () => {
      setIsLoadingClients(true);
      try {
        const queryParams = new URLSearchParams();
        if (recipientType && recipientType !== 'general') {
          queryParams.set('type', recipientType);
        }
        if (searchQuery.trim()) {
          queryParams.set('q', searchQuery.trim());
        }
        queryParams.set('limit', '30');

        const res = await fetch(`/api/catalog/clients?${queryParams.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch clients');
        const data = await res.json();
        if (active) {
          setClientsList(data.items || []);
        }
      } catch (err) {
        console.warn('Error searching clients:', err);
      } finally {
        if (active) setIsLoadingClients(false);
      }
    };

    const debounce = setTimeout(fetchClients, searchQuery ? 200 : 0);
    return () => {
      active = false;
      clearTimeout(debounce);
    };
  }, [recipientType, searchQuery, isOpen]);

  // Reset selected client when switching types (unless already set to matching type)
  const handleTypeChange = (typeId) => {
    setRecipientType(typeId);
    setSearchQuery('');
    setShowQuickAdd(false);
    if (selectedClient && selectedClient.type !== typeId) {
      setSelectedClient(null);
    }
  };

  // Quick create client
  const handleQuickCreateClient = async (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error('Indica el nombre de la clínica / médico');
      return;
    }
    setIsCreatingClient(true);
    try {
      const res = await fetch('/api/catalog/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: recipientType,
          name: newName.trim(),
          email: newEmail.trim(),
          phone: newPhone.trim(),
        }),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Error creando destinatario');
      }
      const data = await res.json();
      if (data.item) {
        setSelectedClient(data.item);
        toast.success(`Destinatario "${data.item.name}" guardado y seleccionado`);
        setShowQuickAdd(false);
        setNewName('');
        setNewEmail('');
        setNewPhone('');
      }
    } catch (err) {
      toast.error(err.message || 'Error guardando');
    } finally {
      setIsCreatingClient(false);
    }
  };

  // Handle PDF Export
  const handleTriggerPDF = () => {
    const scopeObj = SUPPLIER_SCOPES.find(s => s.id === selectedScope) || SUPPLIER_SCOPES[0];
    const recipientName = selectedClient ? selectedClient.name : (recipientType === 'general' ? null : `All ${recipientType}s`);
    const recipientEmail = selectedClient?.email || null;
    const recipientId = selectedClient?.id || null;

    const extraParams = {
      currency: scopeObj.currency,
      recipientName,
      recipientType: recipientType === 'general' ? 'clinic' : recipientType,
      recipientEmail,
      recipientId,
    };

    if (scopeObj.id === 'filtered') {
      extraParams.productIds = filteredProductIds;
    } else if (scopeObj.catalogueFilter) {
      extraParams.catalogueFilter = scopeObj.catalogueFilter;
      extraParams.productIds = [];
    }

    onGeneratePDF?.(
      scopeObj.filter === 'filtered' ? null : scopeObj.filter,
      scopeObj.label,
      `${scopeObj.id}-pdf`,
      extraParams
    );
    onClose();
  };

  // Handle Web Share Export
  const handleTriggerWebShare = () => {
    const scopeObj = SUPPLIER_SCOPES.find(s => s.id === selectedScope) || SUPPLIER_SCOPES[0];
    const recipientName = selectedClient ? selectedClient.name : (recipientType === 'general' ? 'Valued Partner' : `${recipientType.toUpperCase()} Distribution`);
    const recipientEmail = selectedClient?.email || null;
    const recipientUserId = selectedClient?.id || null;
    const recipientPhone = selectedClient?.phone || null;

    const extraParams = {
      currency: scopeObj.currency,
      recipientName,
      recipientType: recipientType === 'general' ? 'clinic' : recipientType,
      recipientEmail,
      recipientPhone,
      recipientUserId,
    };

    if (scopeObj.id === 'filtered') {
      extraParams.productIds = filteredProductIds;
    } else if (scopeObj.catalogueFilter) {
      extraParams.catalogueFilter = scopeObj.catalogueFilter;
      extraParams.category = 'all';
    }

    const supplierId = scopeObj.id === 'lotusland' ? 'supplier-lotusland'
      : scopeObj.id === 'larimedical' ? 'supplier-larimedical'
      : scopeObj.id === 'europeptides' ? 'supplier-europeptides'
      : scopeObj.id === 'filtered' ? null : 'all';

    onGenerateWebShare?.(
      supplierId,
      scopeObj.label,
      `${scopeObj.id}-web`,
      extraParams
    );
    onClose();
  };

  if (!isOpen) return null;

  const currentScopeObj = SUPPLIER_SCOPES.find(s => s.id === selectedScope) || SUPPLIER_SCOPES[0];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobile && (
        <div 
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(3px)',
            zIndex: 9998,
          }}
        />
      )}

      <div
        ref={popoverRef}
        style={{
          position: isMobile ? 'fixed' : 'absolute',
          top: isMobile ? 'auto' : 'calc(100% + 6px)',
          bottom: isMobile ? 0 : 'auto',
          right: isMobile ? 0 : 0,
          left: isMobile ? 0 : 'auto',
          width: isMobile ? '100vw' : '360px',
          maxWidth: '100vw',
          maxHeight: isMobile ? '88vh' : '82vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: isMobile ? '16px 16px 0 0' : '12px',
          boxShadow: '0 16px 40px -4px rgba(15, 23, 42, 0.22), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          zIndex: 9999,
          overflow: 'hidden',
          animation: isMobile ? 'slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)' : 'fadeIn 0.15s ease',
          boxSizing: 'border-box'
        }}
      >
        <style>{`
          @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div style={{
          padding: '0.75rem 1rem',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '7px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem'
            }}>
              🚀
            </div>
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
                Export & Share Catalog
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                Optimized pricing & personalized delivery
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              padding: '4px',
              cursor: 'pointer',
              color: '#94a3b8',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#0f172a'}
            onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
          >
            <X size={17} />
          </button>
        </div>

        {/* ── SCROLLABLE CONTENT BODY ─────────────────────────────────────── */}
        <div style={{
          padding: '0.85rem 1rem',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
          flex: 1,
        }}>

          {/* 1. SUPPLIER / SCOPE SELECTOR */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '5px',
            }}>
              1. Supplier / Scope
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedScope}
                onChange={(e) => setSelectedScope(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 2rem 0.55rem 0.75rem',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  outline: 'none',
                  appearance: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                }}
              >
                {SUPPLIER_SCOPES.map(scope => (
                  <option key={scope.id} value={scope.id}>
                    {scope.label} — ({scope.badge})
                  </option>
                ))}
              </select>
              <div style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                color: '#64748b'
              }}>
                <ChevronDown size={14} />
              </div>
            </div>
          </div>

          {/* 2. MARGIN ON COST (COMPACT DROPDOWN + CUSTOM INPUT) */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '0.65rem 0.75rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#334155',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                margin: 0
              }}>
                2. Margin on Cost
              </label>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#0369a1',
                backgroundColor: '#e0f2fe',
                padding: '2px 8px',
                borderRadius: '9999px'
              }}>
                +{markupPercent}% EXW
              </span>
            </div>

            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <select
                  value={isCustomMargin ? 'custom' : markupPercent}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'custom') {
                      setIsCustomMargin(true);
                    } else {
                      setIsCustomMargin(false);
                      setMarkupPercent(parseInt(val, 10) || 0);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '0.45rem 1.8rem 0.45rem 0.65rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#0f172a',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    outline: 'none',
                    appearance: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {MARGIN_PRESETS.map(pct => (
                    <option key={pct} value={pct}>
                      {pct === 0 ? '0% Cost (Base Price)' : `+${pct}% Margin`}
                    </option>
                  ))}
                  <option value="custom">Custom Margin %…</option>
                </select>
                <div style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  color: '#64748b'
                }}>
                  <ChevronDown size={13} />
                </div>
              </div>

              {isCustomMargin && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <input
                    type="number"
                    min="0"
                    max="300"
                    autoFocus
                    value={markupPercent}
                    onChange={(e) => setMarkupPercent(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    style={{
                      width: '58px',
                      padding: '0.45rem 0.3rem',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      textAlign: 'center',
                      borderRadius: '6px',
                      border: '1px solid #0284c7',
                      outline: 'none',
                      backgroundColor: '#ffffff'
                    }}
                  />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>%</span>
                </div>
              )}
            </div>
          </div>

          {/* 3. RECIPIENT PERSONALIZATION (TYPE SELECTION + FAST AUTOCOMPLETE + QUICK ADD) */}
          <div style={{
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '0.65rem 0.75rem',
            backgroundColor: '#ffffff'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#334155',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                margin: 0
              }}>
                3. Recipient / Client
              </label>
              {selectedClient && (
                <button
                  type="button"
                  onClick={() => setSelectedClient(null)}
                  style={{
                    border: 'none',
                    background: 'none',
                    fontSize: '0.68rem',
                    color: '#dc2626',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Clear client
                </button>
              )}
            </div>

            {/* Step 1: Type Pills */}
            <div style={{
              display: 'flex',
              gap: '4px',
              overflowX: 'auto',
              paddingBottom: '4px',
              marginBottom: '6px'
            }}>
              {RECIPIENT_TYPES.map(rt => {
                const active = recipientType === rt.id;
                const IconComp = rt.icon;
                return (
                  <button
                    key={rt.id}
                    type="button"
                    onClick={() => handleTypeChange(rt.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      padding: '4px 8px',
                      fontSize: '0.7rem',
                      fontWeight: active ? 700 : 500,
                      borderRadius: '6px',
                      border: active ? '1px solid #0284c7' : '1px solid #e2e8f0',
                      backgroundColor: active ? '#f0f9ff' : '#ffffff',
                      color: active ? '#0284c7' : '#64748b',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      transition: 'all 0.12s ease'
                    }}
                  >
                    <IconComp size={11} />
                    <span>{rt.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Step 2: Specific Recipient Selection */}
            {recipientType === 'general' ? (
              <div style={{
                fontSize: '0.74rem',
                color: '#64748b',
                padding: '4px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <ShieldCheck size={14} color="#0d9488" />
                <span>Generates standard clinical catalog for general partner use.</span>
              </div>
            ) : (
              <div>
                {/* Active selected client chip */}
                {selectedClient ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.45rem 0.65rem',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #86efac',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    color: '#166534',
                  }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span style={{ fontWeight: 700 }}>{selectedClient.name}</span>
                      {selectedClient.email && (
                        <span style={{ opacity: 0.8, fontSize: '0.7rem', marginLeft: '6px' }}>
                          ({selectedClient.email})
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedClient(null)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        color: '#166534',
                        display: 'flex',
                        alignItems: 'center',
                        marginLeft: '6px'
                      }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Live search input */}
                    <div style={{ position: 'relative', marginBottom: '4px' }}>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Search ${recipientType} name, email...`}
                        style={{
                          width: '100%',
                          padding: '0.4rem 1.8rem 0.4rem 0.65rem',
                          fontSize: '0.78rem',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94a3b8',
                        pointerEvents: 'none'
                      }}>
                        {isLoadingClients ? (
                          <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} />
                        ) : (
                          <Search size={12} />
                        )}
                      </div>
                    </div>

                    {/* Results list if searching or clients available */}
                    {clientsList.length > 0 && !showQuickAdd && (
                      <div style={{
                        maxHeight: '96px',
                        overflowY: 'auto',
                        border: '1px solid #f1f5f9',
                        borderRadius: '6px',
                        backgroundColor: '#ffffff',
                        marginBottom: '4px'
                      }}>
                        {clientsList.map(item => (
                          <div
                            key={item.id}
                            onClick={() => setSelectedClient(item)}
                            style={{
                              padding: '4px 8px',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              borderBottom: '1px solid #f8fafc',
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}
                          >
                            <span style={{ fontWeight: 600, color: '#1e293b' }}>{item.name}</span>
                            <span style={{ fontSize: '0.68rem', color: '#64748b' }}>{item.email || item.country}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Toggle Quick Add Inline Form */}
                    {!showQuickAdd ? (
                      <button
                        type="button"
                        onClick={() => setShowQuickAdd(true)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '3px 0',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: '#0284c7',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <Plus size={12} />
                        <span>Dar de alta {RECIPIENT_TYPES.find(r => r.id === recipientType)?.label} nuevo…</span>
                      </button>
                    ) : (
                      /* Inline Quick Add Micro-Form */
                      <form
                        onSubmit={handleQuickCreateClient}
                        style={{
                          marginTop: '6px',
                          padding: '8px',
                          backgroundColor: '#f8fafc',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '5px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155' }}>
                            Nueva {RECIPIENT_TYPES.find(r => r.id === recipientType)?.label}
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowQuickAdd(false)}
                            style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, color: '#94a3b8' }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                        <input
                          type="text"
                          required
                          autoFocus
                          placeholder="Nombre / Razón Social *"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          style={{ padding: '4px 6px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                        />
                        <input
                          type="email"
                          placeholder="Email de contacto"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          style={{ padding: '4px 6px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                        />
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <input
                            type="text"
                            placeholder="Teléfono / WhatsApp"
                            value={newPhone}
                            onChange={(e) => setNewPhone(e.target.value)}
                            style={{ flex: 1, padding: '4px 6px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                          />
                          <button
                            type="submit"
                            disabled={isCreatingClient}
                            style={{
                              padding: '4px 10px',
                              backgroundColor: '#0284c7',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              cursor: isCreatingClient ? 'not-allowed' : 'pointer',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {isCreatingClient ? 'Guardando…' : 'Guardar y asignar'}
                          </button>
                        </div>
                      </form>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* 4. PRIMARY EXPORT ACTION BUTTONS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {/* Download PDF Button */}
            <button
              type="button"
              onClick={handleTriggerPDF}
              disabled={Boolean(actionLoading)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                width: '100%',
                padding: '0.65rem 1rem',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: '#0369a1',
                color: '#ffffff',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: actionLoading ? 'not-allowed' : 'pointer',
                opacity: actionLoading ? 0.7 : 1,
                boxShadow: '0 1px 3px rgba(3, 105, 161, 0.3)',
                transition: 'all 0.12s ease'
              }}
              onMouseEnter={e => { if (!actionLoading) e.currentTarget.style.backgroundColor = '#0284c7'; }}
              onMouseLeave={e => { if (!actionLoading) e.currentTarget.style.backgroundColor = '#0369a1'; }}
            >
              {actionLoading?.includes('pdf') ? (
                <Loader size={15} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <span>📄</span>
              )}
              <span>
                {actionLoading?.includes('pdf') 
                  ? 'Generando PDF…' 
                  : `Descargar Catálogo PDF (+${markupPercent}%)`}
              </span>
            </button>

            {/* Create Web Share Link Button */}
            <button
              type="button"
              onClick={handleTriggerWebShare}
              disabled={Boolean(actionLoading)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                width: '100%',
                padding: '0.65rem 1rem',
                border: '1px solid #bae6fd',
                borderRadius: '8px',
                backgroundColor: '#f0f9ff',
                color: '#0284c7',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: actionLoading ? 'not-allowed' : 'pointer',
                opacity: actionLoading ? 0.7 : 1,
                transition: 'all 0.12s ease'
              }}
              onMouseEnter={e => { if (!actionLoading) e.currentTarget.style.backgroundColor = '#e0f2fe'; }}
              onMouseLeave={e => { if (!actionLoading) e.currentTarget.style.backgroundColor = '#f0f9ff'; }}
            >
              {actionLoading?.includes('web') ? (
                <Loader size={15} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Globe size={15} />
              )}
              <span>
                {actionLoading?.includes('web') 
                  ? 'Generando Enlace…' 
                  : `Generar Enlace Web Compartido (+${markupPercent}%)`}
              </span>
            </button>
          </div>

          {/* 5. ADVANCED & RAW DATA TOOLS (COMPACT ACCORDION) */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
            <button
              type="button"
              onClick={() => setShowRawTools(prev => !prev)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '4px 2px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b',
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              <span>Raw Data & Advanced Tools</span>
              {showRawTools ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>

            {showRawTools && (
              <div style={{
                marginTop: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '3px',
                backgroundColor: '#f8fafc',
                padding: '6px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0'
              }}>
                <button
                  type="button"
                  onClick={() => { onExportJSON?.(); onClose(); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 8px',
                    border: 'none',
                    background: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#334155',
                    cursor: 'pointer',
                    textAlign: 'left',
                    borderRadius: '4px'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'none'}
                >
                  <span>💾</span>
                  <span>JSON (Full Products & Variants)</span>
                </button>

                <button
                  type="button"
                  onClick={() => { onExportCSV?.(); onClose(); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 8px',
                    border: 'none',
                    background: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#334155',
                    cursor: 'pointer',
                    textAlign: 'left',
                    borderRadius: '4px'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'none'}
                >
                  <span>📊</span>
                  <span>CSV (Spreadsheet Format)</span>
                </button>

                <button
                  type="button"
                  onClick={() => { onOpenExportHub?.(); onClose(); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 8px',
                    border: 'none',
                    background: '#e0f2fe',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#0369a1',
                    cursor: 'pointer',
                    textAlign: 'left',
                    borderRadius: '4px'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#bae6fd'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#e0f2fe'}
                >
                  <span>🚀</span>
                  <span>Open Unified Multi-Catalogue Export Hub…</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
