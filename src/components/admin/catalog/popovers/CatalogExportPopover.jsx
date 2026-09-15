'use client';

import React, { useState, useEffect } from 'react';
import {
  Download, Globe, ChevronDown, ChevronUp, Loader,
  Search, Plus, X, Building, User, Users, ShieldCheck,
} from '@/lib/icons';
import { toast } from 'react-hot-toast';
import StandardDrawer from '@/components/ui/StandardDrawer';

// ─── Constants ────────────────────────────────────────────────────────────────

const SUPPLIER_SCOPES = [
  { id: 'lotusland',    label: 'Lotusland / RegenPept',      badge: '104 variants', currency: 'USD', filter: 'lotusland',          catalogueFilter: 'RegenPept' },
  { id: 'europeptides', label: 'EuroPeptides',                badge: '54 variants',  currency: 'USD', filter: 'europeptides' },
  { id: 'larimedical',  label: 'LARIMEDICAL (Sterilia)',      badge: '8 variants',   currency: 'EUR', filter: 'supplier-larimedical' },
  { id: 'all',          label: 'Global Catalog (All Suppliers)', badge: '166+ variants', currency: 'USD', filter: null },
  { id: 'filtered',     label: 'Active Table Filters',        badge: 'Current View', currency: 'USD', filter: 'filtered' },
];

const MARGIN_PRESETS = [0, 10, 15, 20, 25, 30, 40, 50];

const RECIPIENT_TYPES = [
  { id: 'general',    label: 'General',    icon: Users    },
  { id: 'clinic',     label: 'Clinic',     icon: Building },
  { id: 'doctor',     label: 'Doctor',     icon: User     },
  { id: 'wholeseller',label: 'Wholesaler', icon: Building },
  { id: 'patient',    label: 'Patient',    icon: User     },
];

// ─── Shared input style ────────────────────────────────────────────────────────
const INPUT_STYLE = {
  width: '100%',
  padding: '0.42rem 0.65rem',
  fontSize: '0.8rem',
  borderRadius: '6px',
  border: '1px solid #cbd5e1',
  outline: 'none',
  boxSizing: 'border-box',
  backgroundColor: '#ffffff',
};

// ─── Main Component ────────────────────────────────────────────────────────────

/**
 * CatalogExportPopover (now powered by StandardDrawer)
 *
 * Renders as:
 *  • Laptop ≥ 768px → Side-over drawer sliding from the right (440px wide)
 *  • Mobile < 768px → Bottom-sheet drawer with tactile handle
 *
 * All positioning, backdrop, animation and Escape handling are delegated to
 * StandardDrawer — this component only owns the business logic.
 */
export default function CatalogExportPopover({
  isOpen,
  onClose,
  // anchorRef — no longer needed; drawer uses a portal
  onExportJSON,
  onExportCSV,
  onOpenExportHub,
  onGeneratePDF,
  onGenerateWebShare,
  markupPercent = 20,
  setMarkupPercent,
  actionLoading = null,
  // isMobile — no longer needed; StandardDrawer handles responsiveness
  filteredProductIds = [],
}) {
  // ── Scope & Margin ──────────────────────────────────────────────────────────
  const [selectedScope,  setSelectedScope]  = useState('lotusland');
  const [isCustomMargin, setIsCustomMargin] = useState(!MARGIN_PRESETS.includes(markupPercent));

  // ── Recipient state ─────────────────────────────────────────────────────────
  const [recipientType,    setRecipientType]    = useState('general');
  const [searchQuery,      setSearchQuery]      = useState('');
  const [clientsList,      setClientsList]      = useState([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [selectedClient,   setSelectedClient]   = useState(null);
  const [showQuickAdd,     setShowQuickAdd]     = useState(false);
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [showRawTools,     setShowRawTools]     = useState(false);

  // ── Quick-add fields ────────────────────────────────────────────────────────
  const [newName,  setNewName]  = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // ── Reset state when drawer closes ─────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setClientsList([]);
      setShowQuickAdd(false);
      setShowRawTools(false);
    }
  }, [isOpen]);

  // ── Fetch clients with debounce ─────────────────────────────────────────────
  useEffect(() => {
    if (recipientType === 'general' || !isOpen) return;

    let active = true;
    const fetchClients = async () => {
      setIsLoadingClients(true);
      try {
        const params = new URLSearchParams();
        params.set('type', recipientType);
        if (searchQuery.trim()) params.set('q', searchQuery.trim());
        params.set('limit', '30');

        const res = await fetch(`/api/catalog/clients?${params}`);
        if (!res.ok) throw new Error('Failed to fetch clients');
        const data = await res.json();
        if (active) setClientsList(data.items || []);
      } catch (err) {
        console.warn('Error searching clients:', err);
      } finally {
        if (active) setIsLoadingClients(false);
      }
    };

    const t = setTimeout(fetchClients, searchQuery ? 200 : 0);
    return () => { active = false; clearTimeout(t); };
  }, [recipientType, searchQuery, isOpen]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleTypeChange = (typeId) => {
    setRecipientType(typeId);
    setSearchQuery('');
    setShowQuickAdd(false);
    if (selectedClient && selectedClient.type !== typeId) setSelectedClient(null);
  };

  const handleQuickCreateClient = async (e) => {
    e.preventDefault();
    if (!newName.trim()) { toast.error('Indica el nombre'); return; }
    setIsCreatingClient(true);
    try {
      const res = await fetch('/api/catalog/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: recipientType, name: newName.trim(), email: newEmail.trim(), phone: newPhone.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Error creando destinatario');
      }
      const data = await res.json();
      if (data.item) {
        setSelectedClient(data.item);
        toast.success(`"${data.item.name}" saved and selected`);
        setShowQuickAdd(false);
        setNewName(''); setNewEmail(''); setNewPhone('');
      }
    } catch (err) {
      toast.error(err.message || 'Error saving client');
    } finally {
      setIsCreatingClient(false);
    }
  };

  const buildScopeExtras = (scopeObj) => {
    const extras = {
      currency: scopeObj.currency,
      recipientType: recipientType === 'general' ? 'clinic' : recipientType,
      recipientName:  selectedClient ? selectedClient.name  : (recipientType === 'general' ? null : `All ${recipientType}s`),
      recipientEmail: selectedClient?.email  || null,
      recipientId:    selectedClient?.id     || null,
      recipientPhone: selectedClient?.phone  || null,
    };
    if (scopeObj.id === 'filtered') {
      extras.productIds = filteredProductIds;
    } else if (scopeObj.catalogueFilter) {
      extras.catalogueFilter = scopeObj.catalogueFilter;
      extras.productIds = [];
    }
    return extras;
  };

  const handleTriggerPDF = () => {
    const scopeObj = SUPPLIER_SCOPES.find(s => s.id === selectedScope) || SUPPLIER_SCOPES[0];
    onGeneratePDF?.(
      scopeObj.filter === 'filtered' ? null : scopeObj.filter,
      scopeObj.label,
      `${scopeObj.id}-pdf`,
      buildScopeExtras(scopeObj)
    );
    onClose();
  };

  const handleTriggerWebShare = () => {
    const scopeObj = SUPPLIER_SCOPES.find(s => s.id === selectedScope) || SUPPLIER_SCOPES[0];
    const supplierId = scopeObj.id === 'lotusland'     ? 'supplier-lotusland'
                     : scopeObj.id === 'larimedical'   ? 'supplier-larimedical'
                     : scopeObj.id === 'europeptides'  ? 'supplier-europeptides'
                     : scopeObj.id === 'filtered'      ? null : 'all';
    onGenerateWebShare?.(supplierId, scopeObj.label, `${scopeObj.id}-web`, buildScopeExtras(scopeObj));
    onClose();
  };

  // ── Derived ─────────────────────────────────────────────────────────────────
  const currentScopeObj = SUPPLIER_SCOPES.find(s => s.id === selectedScope) || SUPPLIER_SCOPES[0];

  // ── Section label style ─────────────────────────────────────────────────────
  const sectionLabel = {
    display: 'block',
    fontSize: '0.7rem',
    fontWeight: 700,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '6px',
  };

  // ── Footer — always-visible primary CTA buttons ─────────────────────────────
  const drawerFooter = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* PDF */}
      <button
        type="button"
        onClick={handleTriggerPDF}
        disabled={Boolean(actionLoading)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '0.5rem', width: '100%', padding: '0.7rem 1rem',
          border: 'none', borderRadius: '8px', cursor: actionLoading ? 'not-allowed' : 'pointer',
          backgroundColor: '#0369a1', color: '#ffffff',
          fontSize: '0.85rem', fontWeight: 700,
          opacity: actionLoading ? 0.7 : 1,
          boxShadow: '0 2px 6px rgba(3,105,161,0.28)',
          transition: 'background 0.12s ease',
        }}
      >
        {actionLoading?.includes('pdf')
          ? <Loader size={15} style={{ animation: 'spin 1s linear infinite' }} />
          : <span>📄</span>}
        <span>{actionLoading?.includes('pdf') ? 'Generating PDF…' : `Download PDF Catalog (+${markupPercent}%)`}</span>
      </button>

      {/* Web Share */}
      <button
        type="button"
        onClick={handleTriggerWebShare}
        disabled={Boolean(actionLoading)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '0.5rem', width: '100%', padding: '0.7rem 1rem',
          border: '1.5px solid #bae6fd', borderRadius: '8px',
          cursor: actionLoading ? 'not-allowed' : 'pointer',
          backgroundColor: '#f0f9ff', color: '#0284c7',
          fontSize: '0.85rem', fontWeight: 700,
          opacity: actionLoading ? 0.7 : 1,
          transition: 'background 0.12s ease',
        }}
      >
        {actionLoading?.includes('web')
          ? <Loader size={15} style={{ animation: 'spin 1s linear infinite' }} />
          : <Globe size={15} />}
        <span>{actionLoading?.includes('web') ? 'Generating Link…' : `Generate Web Link (+${markupPercent}%)`}</span>
      </button>
    </div>
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <StandardDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Export & Share Catalog"
      subtitle={`${currentScopeObj.label} · +${markupPercent}%`}
      width="440px"
      bodyPadding="1.25rem"
      footer={drawerFooter}
      expandable={false}
      zIndex={9999}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

        {/* ── 1. SUPPLIER / SCOPE ─────────────────────────────────────────── */}
        <div>
          <label style={sectionLabel}>1 · Supplier / Scope</label>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedScope}
              onChange={e => setSelectedScope(e.target.value)}
              style={{
                ...INPUT_STYLE,
                padding: '0.55rem 2rem 0.55rem 0.75rem',
                fontWeight: 600,
                appearance: 'none',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              }}
            >
              {SUPPLIER_SCOPES.map(s => (
                <option key={s.id} value={s.id}>
                  {s.label}  ({s.badge})
                </option>
              ))}
            </select>
            <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }}>
              <ChevronDown size={14} />
            </div>
          </div>
        </div>

        {/* ── 2. MARGIN ON COST ───────────────────────────────────────────── */}
        <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ ...sectionLabel, marginBottom: 0 }}>2 · Margin on Cost</label>
            <span style={{
              fontSize: '0.75rem', fontWeight: 800, color: '#0369a1',
              backgroundColor: '#e0f2fe', padding: '2px 10px', borderRadius: '9999px',
            }}>
              +{markupPercent}% EXW
            </span>
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <select
                value={isCustomMargin ? 'custom' : markupPercent}
                onChange={e => {
                  if (e.target.value === 'custom') {
                    setIsCustomMargin(true);
                  } else {
                    setIsCustomMargin(false);
                    setMarkupPercent(parseInt(e.target.value, 10) || 0);
                  }
                }}
                style={{ ...INPUT_STYLE, appearance: 'none', padding: '0.45rem 1.8rem 0.45rem 0.65rem', fontWeight: 600, cursor: 'pointer' }}
              >
                {MARGIN_PRESETS.map(pct => (
                  <option key={pct} value={pct}>{pct === 0 ? '0% — Base Price (EXW)' : `+${pct}% Margin`}</option>
                ))}
                <option value="custom">✏️ Custom Margin %…</option>
              </select>
              <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }}>
                <ChevronDown size={13} />
              </div>
            </div>

            {isCustomMargin && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input
                  type="number" min="0" max="300" autoFocus
                  value={markupPercent}
                  onChange={e => setMarkupPercent(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  style={{ width: '64px', padding: '0.45rem 0.4rem', fontSize: '0.82rem', fontWeight: 700, textAlign: 'center', borderRadius: '6px', border: '1.5px solid #0284c7', outline: 'none' }}
                />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>%</span>
              </div>
            )}
          </div>
        </div>

        {/* ── 3. RECIPIENT / CLIENT ───────────────────────────────────────── */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ ...sectionLabel, marginBottom: 0 }}>3 · Recipient / Client</label>
            {selectedClient && (
              <button
                type="button"
                onClick={() => setSelectedClient(null)}
                style={{ border: 'none', background: 'none', fontSize: '0.68rem', fontWeight: 700, color: '#dc2626', cursor: 'pointer', padding: 0 }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Type pills */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
            {RECIPIENT_TYPES.map(rt => {
              const active = recipientType === rt.id;
              const Icon = rt.icon;
              return (
                <button
                  key={rt.id}
                  type="button"
                  onClick={() => handleTypeChange(rt.id)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '3px',
                    padding: '4px 9px', fontSize: '0.7rem', fontWeight: active ? 700 : 500,
                    borderRadius: '6px',
                    border: active ? '1.5px solid #0284c7' : '1px solid #e2e8f0',
                    backgroundColor: active ? '#f0f9ff' : '#ffffff',
                    color: active ? '#0284c7' : '#64748b',
                    cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.1s ease',
                  }}
                >
                  <Icon size={11} />
                  <span>{rt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Step 2: specific selection */}
          {recipientType === 'general' ? (
            <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px', padding: '2px 0' }}>
              <ShieldCheck size={14} color="#0d9488" />
              <span>Standard clinical catalog — general partner distribution.</span>
            </div>
          ) : selectedClient ? (
            /* Active chip */
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.5rem 0.7rem', backgroundColor: '#f0fdf4', border: '1px solid #86efac',
              borderRadius: '7px', fontSize: '0.78rem', color: '#166534',
            }}>
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <span style={{ fontWeight: 700 }}>{selectedClient.name}</span>
                {selectedClient.email && (
                  <span style={{ opacity: 0.75, fontSize: '0.7rem', marginLeft: '6px' }}>({selectedClient.email})</span>
                )}
              </div>
              <button type="button" onClick={() => setSelectedClient(null)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#166534', marginLeft: '8px' }}>
                <X size={13} />
              </button>
            </div>
          ) : (
            <>
              {/* Search input */}
              <div style={{ position: 'relative', marginBottom: '4px' }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={`Search ${recipientType}…`}
                  style={{ ...INPUT_STYLE, paddingRight: '1.8rem' }}
                />
                <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }}>
                  {isLoadingClients ? <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={12} />}
                </div>
              </div>

              {/* Results */}
              {clientsList.length > 0 && !showQuickAdd && (
                <div style={{ maxHeight: '108px', overflowY: 'auto', border: '1px solid #f1f5f9', borderRadius: '7px', marginBottom: '6px' }}>
                  {clientsList.map(item => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedClient(item)}
                      style={{ padding: '5px 9px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f8fafc' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}
                    >
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{item.name}</span>
                      <span style={{ fontSize: '0.68rem', color: '#64748b' }}>{item.email || item.country}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick-add toggle */}
              {!showQuickAdd ? (
                <button
                  type="button"
                  onClick={() => setShowQuickAdd(true)}
                  style={{ background: 'none', border: 'none', padding: '3px 0', fontSize: '0.72rem', fontWeight: 700, color: '#0284c7', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                >
                  <Plus size={12} />
                  <span>Add new {RECIPIENT_TYPES.find(r => r.id === recipientType)?.label || 'recipient'}…</span>
                </button>
              ) : (
                /* Inline quick-add form */
                <form
                  onSubmit={handleQuickCreateClient}
                  style={{ marginTop: '6px', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '7px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155' }}>
                      New {RECIPIENT_TYPES.find(r => r.id === recipientType)?.label || 'Recipient'}
                    </span>
                    <button type="button" onClick={() => setShowQuickAdd(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, color: '#94a3b8' }}>
                      <X size={12} />
                    </button>
                  </div>
                  <input type="text"  required autoFocus placeholder="Name / Company Name *" value={newName}  onChange={e => setNewName(e.target.value)}  style={{ ...INPUT_STYLE }} />
                  <input type="email"           placeholder="Contact email"                   value={newEmail} onChange={e => setNewEmail(e.target.value)} style={{ ...INPUT_STYLE }} />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input type="text" placeholder="Phone / WhatsApp" value={newPhone} onChange={e => setNewPhone(e.target.value)} style={{ ...INPUT_STYLE, flex: 1 }} />
                    <button
                      type="submit" disabled={isCreatingClient}
                      style={{ padding: '4px 12px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700, cursor: isCreatingClient ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
                    >
                      {isCreatingClient ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>

        {/* ── 4. ADVANCED TOOLS (COLLAPSIBLE) ─────────────────────────────── */}
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
          <button
            type="button"
            onClick={() => setShowRawTools(p => !p)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '4px 2px', background: 'none', border: 'none', cursor: 'pointer',
              color: '#64748b', fontSize: '0.7rem', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}
          >
            <span>Raw Data &amp; Advanced Tools</span>
            {showRawTools ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {showRawTools && (
            <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '3px', backgroundColor: '#f8fafc', padding: '6px', borderRadius: '7px', border: '1px solid #e2e8f0' }}>
              {[
                { emoji: '💾', label: 'JSON (Full Products & Variants)', onClick: () => { onExportJSON?.(); onClose(); }, bg: 'transparent' },
                { emoji: '📊', label: 'CSV (Spreadsheet Format)',        onClick: () => { onExportCSV?.();  onClose(); }, bg: 'transparent' },
                { emoji: '🚀', label: 'Open Unified Multi-Catalogue Export Hub…', onClick: () => { onOpenExportHub?.(); onClose(); }, bg: '#e0f2fe', color: '#0369a1' },
              ].map(({ emoji, label, onClick, bg, color }) => (
                <button
                  key={label}
                  type="button"
                  onClick={onClick}
                  style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '6px 8px', border: 'none', background: bg || 'none', fontSize: '0.78rem', fontWeight: 600, color: color || '#334155', cursor: 'pointer', textAlign: 'left', borderRadius: '5px' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = bg === '#e0f2fe' ? '#bae6fd' : '#f1f5f9'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = bg || ''}
                >
                  <span>{emoji}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </StandardDrawer>
  );
}
