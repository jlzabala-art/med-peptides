'use client';

import React, { useState, useEffect } from 'react';
import {
  Download, Globe, ChevronDown, ChevronUp, Loader,
  Search, Plus, X, Building, User, Users, ShieldCheck, CheckCircle, Layers, FileText
} from '@/lib/icons';
import { toast } from 'react-hot-toast';
import StandardDrawer from '@/components/ui/StandardDrawer';

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_SUPPLIER_SCOPES = [
  { id: 'all',          label: 'Global Catalog (All Suppliers)', badge: '580+ products', currency: 'USD', filter: null },
  { id: 'filtered',     label: 'Active Table Filters',           badge: 'Current View',   currency: 'USD', filter: 'filtered' },
  { id: 'lotusland',    label: 'Lotusland / RegenPept',          badge: 'Peptides & Research', currency: 'USD', filter: 'supplier-lotusland', catalogueFilter: 'RegenPept' },
  { id: 'magenta',      label: 'Magenta (Compounding & Peptides)', badge: 'Compounding Lab', currency: 'AED', filter: 'supplier-magenta' },
  { id: 'europeptides', label: 'EuroPeptides',                   badge: 'European Research', currency: 'USD', filter: 'supplier-europeptides' },
  { id: 'larimedical',  label: 'LARIMEDICAL (Sterilia)',         badge: 'Clinical Sterile', currency: 'EUR', filter: 'supplier-larimedical' },
  { id: 'fagron',       label: 'Fagron Genomics',                badge: 'Genomics & Tests', currency: 'EUR', filter: 'supplier-fagron' },
  { id: 'dermadry',     label: 'Dermadry',                       badge: 'Medical Devices',  currency: 'USD', filter: 'supplier-dermadry' },
  { id: 'colway',       label: 'Colway',                         badge: 'Native Collagen',  currency: 'EUR', filter: 'supplier-colway' },
];

const CATEGORY_OPTIONS = [
  { id: 'all',                  label: 'Todas las Categorías / All Categories' },
  { id: 'peptides',             label: 'Péptidos y Biorreguladores (Peptides)' },
  { id: 'cosmetics',            label: 'Cosmecéutica y Cuidado Facial (Skincare)' },
  { id: 'aesthetic_injectables',label: 'Inyectables Estéticos (Aesthetic Injectables)' },
  { id: 'raw_material',         label: 'Materia Prima y APIs (Raw Materials)' },
  { id: 'iv_drip',              label: 'Sueroterapia (IV Drip Formulations)' },
  { id: 'supplements',          label: 'Nutracéuticos y Suplementos (Supplements)' },
  { id: 'diagnostic_test',      label: 'Genómica y Tests Diagnósticos (Genomics)' },
];

const MARGIN_PRESETS = [0, 10, 15, 20, 25, 30, 40, 50];

const RECIPIENT_TYPES = [
  { id: 'doctor',     label: 'Médico (Doctor)',        icon: User     },
  { id: 'wholeseller',label: 'Wholesaler (Mayorista)',  icon: Building },
  { id: 'patient',    label: 'Paciente (Patient)',      icon: User     },
  { id: 'clinic',     label: 'Clínica (Clinic)',        icon: Building },
  { id: 'general',    label: 'General (Sin asignar)',   icon: Users    },
];

// ─── Shared input style ────────────────────────────────────────────────────────
const INPUT_STYLE = {
  width: '100%',
  padding: '0.45rem 0.65rem',
  fontSize: '0.8rem',
  borderRadius: '6px',
  border: '1px solid #cbd5e1',
  outline: 'none',
  boxSizing: 'border-box',
  backgroundColor: '#ffffff',
};

export default function CatalogExportPopover({
  isOpen,
  onClose,
  onExportJSON,
  onExportCSV,
  onOpenExportHub,
  onGeneratePDF,
  onGenerateWebShare,
  markupPercent = 20,
  setMarkupPercent,
  actionLoading = null,
  filteredProductIds = [],
}) {
  // ── Scope & Dynamic Suppliers ───────────────────────────────────────────────
  const [supplierScopes, setSupplierScopes] = useState(BASE_SUPPLIER_SCOPES);
  const [selectedScope,  setSelectedScope]  = useState('lotusland');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCustomMargin, setIsCustomMargin] = useState(!MARGIN_PRESETS.includes(markupPercent));

  // ── Recipient state ─────────────────────────────────────────────────────────
  const [recipientType,    setRecipientType]    = useState('doctor');
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

  // ── Fetch dynamic suppliers from database ──────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    fetch('/api/suppliers/search?limit=50')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!active || !data || !Array.isArray(data.items)) return;
        const knownIds = new Set(BASE_SUPPLIER_SCOPES.map(s => s.id));
        const extraSuppliers = data.items
          .filter(sup => sup.id && !knownIds.has(sup.id))
          .map(sup => ({
            id: sup.id,
            label: sup.name || sup.displayName || sup.id,
            badge: sup.country || 'Supplier',
            currency: sup.currency || 'USD',
            filter: `supplier-${sup.id}`
          }));
        if (extraSuppliers.length > 0) {
          setSupplierScopes([...BASE_SUPPLIER_SCOPES, ...extraSuppliers]);
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, [isOpen]);

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
        params.set('limit', '40');

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
    if (!newName.trim()) { toast.error('Please enter a name'); return; }
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
        toast.success(`"${data.item.name}" guardado y asignado`);
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
      currency: scopeObj.currency || 'USD',
      supplierId: scopeObj.id === 'filtered' ? null : (scopeObj.filter || scopeObj.id),
      catalogueFilter: scopeObj.catalogueFilter || null,
      category: selectedCategory || 'all',
      recipientType: recipientType === 'general' ? 'clinic' : recipientType,
      recipientName:  selectedClient ? selectedClient.name  : (recipientType === 'general' ? 'General' : `All ${recipientType}s`),
      recipientEmail: selectedClient?.email  || null,
      recipientId:    selectedClient?.id     || null,
      recipientUserId: selectedClient?.id    || null,
      recipientPhone: selectedClient?.phone  || null,
    };
    if (scopeObj.id === 'filtered') {
      extras.productIds = filteredProductIds;
      extras.variantCount = filteredProductIds.length;
    } else if (scopeObj.catalogueFilter) {
      extras.catalogueFilter = scopeObj.catalogueFilter;
      extras.productIds = [];
    }
    return extras;
  };

  const handleTriggerPDF = () => {
    const scopeObj = supplierScopes.find(s => s.id === selectedScope) || supplierScopes[0];
    const isFiltered = scopeObj.id === 'filtered';
    const extras = buildScopeExtras(scopeObj);
    onGeneratePDF?.(
      scopeObj.filter === 'filtered' ? null : scopeObj.filter,
      isFiltered ? `Curated View (${filteredProductIds.length} items)` : scopeObj.label,
      `${scopeObj.id}-pdf`,
      extras
    );
    onClose();
  };

  const handleTriggerWebShare = () => {
    const scopeObj = supplierScopes.find(s => s.id === selectedScope) || supplierScopes[0];
    const isFiltered = scopeObj.id === 'filtered';
    const supplierId = scopeObj.id === 'lotusland'     ? 'supplier-lotusland'
                     : scopeObj.id === 'magenta'       ? 'supplier-magenta'
                     : scopeObj.id === 'larimedical'   ? 'supplier-larimedical'
                     : scopeObj.id === 'europeptides'  ? 'supplier-europeptides'
                     : scopeObj.id === 'fagron'        ? 'supplier-fagron'
                     : scopeObj.id === 'dermadry'      ? 'supplier-dermadry'
                     : scopeObj.id === 'colway'        ? 'supplier-colway'
                     : scopeObj.id === 'filtered'      ? null : (scopeObj.filter || scopeObj.id);
    const extras = buildScopeExtras(scopeObj);
    onGenerateWebShare?.(
      supplierId,
      isFiltered ? `Curated View (${filteredProductIds.length} items)` : scopeObj.label,
      `${scopeObj.id}-web`,
      extras
    );
    onClose();
  };

  // ── Derived ─────────────────────────────────────────────────────────────────
  const currentScopeObj = supplierScopes.find(s => s.id === selectedScope) || supplierScopes[0];

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

  // ── Footer CTA buttons ──────────────────────────────────────────────────────
  const drawerFooter = (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%' }}>
      {/* PDF Button */}
      <button
        type="button"
        onClick={handleTriggerPDF}
        disabled={Boolean(actionLoading)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '0.4rem', padding: '0.65rem 0.5rem',
          border: 'none', borderRadius: '8px', cursor: actionLoading ? 'not-allowed' : 'pointer',
          backgroundColor: '#0369a1', color: '#ffffff',
          fontSize: '0.8rem', fontWeight: 700,
          opacity: actionLoading ? 0.7 : 1,
          boxShadow: '0 2px 6px rgba(3,105,161,0.28)',
          whiteSpace: 'nowrap',
          transition: 'all 0.12s ease',
        }}
        title={`Generar Catálogo PDF (+${markupPercent}%) con registro de asignación`}
      >
        {actionLoading?.includes('pdf')
          ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
          : <span>📄</span>}
        <span>{actionLoading?.includes('pdf') ? 'Generando PDF…' : `PDF (+${markupPercent}%)`}</span>
      </button>

      {/* Web Share Button */}
      <button
        type="button"
        onClick={handleTriggerWebShare}
        disabled={Boolean(actionLoading)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '0.4rem', padding: '0.65rem 0.5rem',
          border: 'none', borderRadius: '8px', cursor: actionLoading ? 'not-allowed' : 'pointer',
          backgroundColor: '#16a34a', color: '#ffffff',
          fontSize: '0.8rem', fontWeight: 700,
          opacity: actionLoading ? 0.7 : 1,
          boxShadow: '0 2px 6px rgba(22,163,74,0.28)',
          whiteSpace: 'nowrap',
          transition: 'all 0.12s ease',
        }}
        title={`Generar Enlace Web Único Rastreado (+${markupPercent}%)`}
      >
        {actionLoading?.includes('web')
          ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
          : <span>🔗</span>}
        <span>{actionLoading?.includes('web') ? 'Generando Enlace…' : `Web Link (+${markupPercent}%)`}</span>
      </button>
    </div>
  );

  return (
    <StandardDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Export & Share Catalog"
      subtitle={`${currentScopeObj.label} · +${markupPercent}%`}
      width="450px"
      bodyPadding="1.25rem"
      footer={drawerFooter}
      expandable={false}
      zIndex={9999}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

        {/* ── 1. SUPPLIER / SCOPE ─────────────────────────────────────────── */}
        <div>
          <label style={sectionLabel}>1 · Supplier / Proveedor</label>
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
              {supplierScopes.map(s => {
                const badgeText = s.id === 'filtered'
                  ? `${filteredProductIds?.length || 0} items in view`
                  : s.badge;
                return (
                  <option key={s.id} value={s.id}>
                    {s.label} ({badgeText})
                  </option>
                );
              })}
            </select>
            <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }}>
              <ChevronDown size={14} />
            </div>
          </div>
        </div>

        {/* ── 2. CATEGORY ─────────────────────────────────────────────────── */}
        <div>
          <label style={sectionLabel}>2 · Categoría de Productos</label>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              style={{
                ...INPUT_STYLE,
                padding: '0.55rem 2rem 0.55rem 0.75rem',
                fontWeight: 600,
                appearance: 'none',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              }}
            >
              {CATEGORY_OPTIONS.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
            <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }}>
              <ChevronDown size={14} />
            </div>
          </div>
        </div>

        {/* ── 3. MARGIN ON COST ───────────────────────────────────────────── */}
        <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ ...sectionLabel, marginBottom: 0 }}>3 · Margen Comercial (Margin on Cost)</label>
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
                  <option key={pct} value={pct}>{pct === 0 ? '0% — Precio Base Proveedor (EXW)' : `+${pct}% Margen Comercial`}</option>
                ))}
                <option value="custom">✏️ Margen Personalizado %…</option>
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

        {/* ── 4. ASSIGN RECIPIENT / CLIENT ─────────────────────────────────── */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ ...sectionLabel, marginBottom: 0 }}>4 · Asignar a Médico, Wholesaler o Paciente</label>
            {selectedClient && (
              <button
                type="button"
                onClick={() => setSelectedClient(null)}
                style={{ border: 'none', background: 'none', fontSize: '0.68rem', fontWeight: 700, color: '#dc2626', cursor: 'pointer', padding: 0 }}
              >
                Desasignar
              </button>
            )}
          </div>

          {/* Quick Recipient Type Segmented Pills */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px', marginBottom: '10px' }}>
            {RECIPIENT_TYPES.map(r => {
              const Icon = r.icon;
              const isSelected = recipientType === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleTypeChange(r.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '3px',
                    padding: '6px 2px',
                    borderRadius: '6px',
                    border: isSelected ? '1.5px solid #0284c7' : '1px solid #e2e8f0',
                    background: isSelected ? '#f0f9ff' : '#f8fafc',
                    color: isSelected ? '#0369a1' : '#64748b',
                    fontSize: '0.65rem',
                    fontWeight: isSelected ? 800 : 600,
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                  }}
                >
                  <Icon size={13} color={isSelected ? '#0284c7' : '#64748b'} />
                  <span>{r.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Client Search and Dropdown */}
          {recipientType === 'general' ? (
            <div style={{ padding: '8px', background: '#f8fafc', borderRadius: '6px', fontSize: '0.74rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} color="#0d9488" />
              <span>Enlace general no asociado a un usuario individual.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Seleccionar {RECIPIENT_TYPES.find(r => r.id === recipientType)?.label}
                </span>
                {!showQuickAdd && (
                  <button
                    type="button"
                    onClick={() => setShowQuickAdd(true)}
                    style={{ background: 'none', border: 'none', padding: 0, fontSize: '0.7rem', fontWeight: 700, color: '#0284c7', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                  >
                    <Plus size={11} />
                    <span>Crear nuevo</span>
                  </button>
                )}
              </div>

              {/* Search filter input */}
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder={`Buscar ${recipientType} por nombre o email...`}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    ...INPUT_STYLE,
                    paddingLeft: '28px',
                    fontSize: '0.78rem'
                  }}
                />
                <Search size={13} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: 0, color: '#94a3b8', cursor: 'pointer' }}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Client Select dropdown */}
              <div style={{ position: 'relative' }}>
                <select
                  value={selectedClient ? selectedClient.id : ''}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === '__add_new__') {
                      setShowQuickAdd(true);
                    } else if (val === '') {
                      setSelectedClient(null);
                    } else {
                      const found = clientsList.find(c => c.id === val);
                      if (found) {
                        setSelectedClient(found);
                        setShowQuickAdd(false);
                      }
                    }
                  }}
                  style={{
                    ...INPUT_STYLE,
                    padding: '0.55rem 2rem 0.55rem 0.75rem',
                    fontWeight: 600,
                    appearance: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                    backgroundColor: selectedClient ? '#f0fdf4' : '#ffffff',
                    borderColor: selectedClient ? '#86efac' : '#cbd5e1',
                    color: selectedClient ? '#166534' : '#1e293b',
                  }}
                >
                  <option value="">
                    {isLoadingClients
                      ? `Cargando ${recipientType}s…`
                      : `-- Elegir ${RECIPIENT_TYPES.find(r => r.id === recipientType)?.label} registrado --`}
                  </option>
                  {clientsList.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} {item.email ? `(${item.email})` : item.phone ? `(${item.phone})` : ''}
                    </option>
                  ))}
                  <option value="__add_new__">
                    ➕ Registrar nuevo {RECIPIENT_TYPES.find(r => r.id === recipientType)?.label}…
                  </option>
                </select>
                <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }}>
                  {isLoadingClients ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <ChevronDown size={14} />}
                </div>
              </div>

              {/* Selected Entity Card */}
              {selectedClient && (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0',
                  borderRadius: '6px', fontSize: '0.75rem', color: '#166534', marginTop: '2px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                    <CheckCircle size={14} color="#16a34a" />
                    <div>
                      <div style={{ fontWeight: 800 }}>{selectedClient.name}</div>
                      <div style={{ opacity: 0.8, fontSize: '0.68rem' }}>
                        {selectedClient.email || selectedClient.phone || 'ID: ' + selectedClient.id} · Asignado para enlace único
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedClient(null)}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#166534', display: 'flex', alignItems: 'center' }}
                    title="Quitar asignación"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Quick-add form inline */}
              {showQuickAdd && (
                <form
                  onSubmit={handleQuickCreateClient}
                  style={{ marginTop: '6px', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '7px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155' }}>
                      Nuevo {RECIPIENT_TYPES.find(r => r.id === recipientType)?.label}
                    </span>
                    <button type="button" onClick={() => setShowQuickAdd(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, color: '#94a3b8' }}>
                      <X size={12} />
                    </button>
                  </div>
                  <input type="text" required autoFocus placeholder="Nombre / Razón Social *" value={newName} onChange={e => setNewName(e.target.value)} style={{ ...INPUT_STYLE }} />
                  <input type="email" placeholder="Email de contacto" value={newEmail} onChange={e => setNewEmail(e.target.value)} style={{ ...INPUT_STYLE }} />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input type="text" placeholder="Teléfono / WhatsApp" value={newPhone} onChange={e => setNewPhone(e.target.value)} style={{ ...INPUT_STYLE, flex: 1 }} />
                    <button
                      type="submit" disabled={isCreatingClient}
                      style={{ padding: '4px 12px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700, cursor: isCreatingClient ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
                    >
                      {isCreatingClient ? 'Guardando…' : 'Guardar'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Informative Security & Tracking Note */}
        <div style={{
          padding: '8px 10px',
          background: '#eff6ff',
          borderRadius: '8px',
          border: '1px solid #bfdbfe',
          fontSize: '0.72rem',
          color: '#1e40af',
          display: 'flex',
          flexDirection: 'column',
          gap: '3px'
        }}>
          <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span>🔒</span> Enlace Único con Auditoría &amp; Tracking
          </div>
          <div style={{ color: '#3b82f6', lineHeight: 1.35 }}>
            Al generar el Web Link o PDF, se creará un enlace firmado único. Quedará registrado en la ficha del usuario en la tabla de usuarios, notificando en tiempo real cada vez que lo abra o descargue.
          </div>
        </div>

        {/* ── 5. ADVANCED TOOLS (COLLAPSIBLE) ─────────────────────────────── */}
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
            <span>Raw Data &amp; Herramientas Avanzadas</span>
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
