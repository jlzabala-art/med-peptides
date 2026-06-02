/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import AdminTabErrorBoundary from '../components/admin/AdminTabErrorBoundary';
import RefillReminderBanner from '../components/shared/RefillReminderBanner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc, serverTimestamp, getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  LayoutDashboard, Layers, Package, TrendingUp, Settings,
  LogOut, ChevronRight, ArrowRight, Clock, CheckCircle2,
  AlertCircle, Truck, Box, BarChart3, Laptop, Bell,
  MapPin, Paintbrush, Globe, MessageSquare, Brain, Mail,
  Sparkles, ChevronUp, ChevronDown, ClipboardList, Zap, Users, FileText
} from 'lucide-react';

import WholesalerBulkOrderBuilder from '../components/wholesaler/WholesalerBulkOrderBuilder';
import AdminMetricsDashboard from '../components/admin/AdminMetricsDashboard';
import GeographyAreasTab from '../components/wholesaler/GeographyAreasTab';
import BrandingTab from '../components/wholesaler/BrandingTab';
import DomainsTab from '../components/wholesaler/DomainsTab';
import ClientsTab from '../components/wholesaler/ClientsTab';
import CatalogList from '../components/wholesaler/CatalogList';
import CatalogCreatorFlow from '../components/wholesaler/CatalogCreatorFlow';
import EmailCampaignBuilder from '../components/wholesaler/EmailCampaignBuilder';
import { Card, MetricCard } from '../components/ui';
// ── Flat tab list (for reference) ────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',    label: 'Overview',    icon: LayoutDashboard },
  { id: 'rx-inbox',    label: 'Rx Inbox',    icon: ClipboardList },
  { id: 'bulk-orders', label: 'Bulk Orders', icon: Layers },
  { id: 'geography',   label: 'Geography Areas', icon: MapPin },
  { id: 'branding',    label: 'Branding',    icon: Paintbrush },
  { id: 'domains',     label: 'Domains',     icon: Globe },
  { id: 'clients',     label: 'Clients',     icon: Users },
  { id: 'catalogs',    label: 'Catalog Builder', icon: FileText },
  { id: 'email-campaigns', label: 'Email Campaigns', icon: Mail },
  { id: 'inventory',   label: 'Inventory',   icon: Box },
  { id: 'settings',    label: 'Settings',    icon: Settings },
];

// ── Semantic groups for AppSidebar ─────────────────────────────────────────────────
const WHOLESALER_NAV_GROUPS = [
  {
    id: 'overview', label: 'Overview',
    items: [{ id: 'overview', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    id: 'franchise', label: 'Franchise Partner',
    items: [
      { id: 'geography',   label: 'Geography Areas', icon: MapPin },
      { id: 'branding',    label: 'Branding',    icon: Paintbrush },
      { id: 'domains',     label: 'Domains',     icon: Globe },
      { id: 'clients',     label: 'Clients',     icon: Users },
      { id: 'catalogs',    label: 'Catalog Builder', icon: FileText },
      { id: 'email-campaigns', label: 'Email Campaigns', icon: Mail },
    ],
  },
  {
    id: 'operations', label: 'Operations',
    items: [
      { id: 'rx-inbox',    label: 'Rx Inbox',    icon: ClipboardList },
      { id: 'bulk-orders', label: 'Bulk Orders', icon: Layers },
      { id: 'messages', label: 'Messages', icon: MessageSquare },
      { id: 'clinical-ai', label: 'Atlas Health', icon: Brain },
    ],
  },
  {
    id: 'account', label: 'Inventory & Account',
    items: [
      { id: 'inventory', label: 'Inventory', icon: Box },
      { id: 'settings',  label: 'Settings',  icon: Settings },
    ],
  },
];

// ── Rx status pipeline ─────────────────────────────────────────────────────────
const RX_PIPELINE = [
  { key: 'assigned_to_wholesaler', label: 'Assigned',   color: '#6366f1', bg: '#ede9fe' },
  { key: 'added_to_bulk',          label: 'In Bulk',    color: '#8b5cf6', bg: '#f5f3ff' },
  { key: 'fulfilled',              label: 'Fulfilled',  color: 'var(--color-success)', bg: '#d1fae5' },
];

// ── Kit logistics status tracker milestones ──────────────────────────────────
const KIT_STEPS = [
  { key: 'kit_dispatched', label: 'Kit Enviado', icon: '📦' },
  { key: 'sample_ready', label: 'Muestra Lista', icon: '🧪' },
  { key: 'collection_label_sent', label: 'Etiqueta Generada', icon: '🏷️' },
  { key: 'in_transit', label: 'En Tránsito', icon: '🚚' },
  { key: 'processing', label: 'Analizando', icon: '🔬' },
  { key: 'results_available', label: 'Resultados Listos', icon: '📋' }
];

// ── KPI Card ───────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, color, urgent, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        flex: '1 1 150px', minWidth: 0,
        background: 'var(--color-bg-surface)',
        borderRadius: '4px',
        border: '1px solid #dadce0',
        borderTop: urgent ? `3px solid ${color}` : '1px solid #dadce0',
        padding: '1.25rem',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.15s',
      }}
      onMouseEnter={e => onClick && (e.currentTarget.style.boxShadow = '0 1px 3px rgba(60,64,67,0.3), 0 4px 8px rgba(60,64,67,0.15)')}
      onMouseLeave={e => onClick && (e.currentTarget.style.boxShadow = 'none')}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon size={18} color="#5f6368" strokeWidth={2} />
          {urgent && <span style={{ fontSize: '0.65rem', fontWeight: 500, color: color, textTransform: 'uppercase' }}>ACTION</span>}
        </div>
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: 500, color: '#202124', lineHeight: 1, fontFamily: 'monospace' }}>
        {value}
      </div>
      <div style={{ fontSize: '0.8rem', fontWeight: 500, color: '#3c4043', marginTop: '0.5rem' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.7rem', color: '#5f6368', marginTop: '0.15rem' }}>{sub}</div>}
    </div>
  );
}

// ── Rx row in pipeline board (Non-expandable, simple overview) ───────────────────
function SimpleRxRow({ rx }) {
  const step = RX_PIPELINE.find(s => s.key === rx.status) || RX_PIPELINE[0];
  const date = rx.createdAt?.toDate
    ? rx.createdAt.toDate().toLocaleDateString('en-US', { day: '2-digit', month: 'short' })
    : '—';
  return (
    <div style={{
      background: 'var(--color-bg-surface)', borderBottom: '1px solid #e2e8f0', padding: '0.75rem 1rem',
      display: 'flex', alignItems: 'center', gap: '0.85rem',
    }}>
      <ClipboardList size={16} color="var(--color-text-secondary)" />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a', display: 'flex', alignItems: 'center' }}>
            {rx.patient?.name || rx.patient?.email || 'Patient'} — {rx.doctorName || 'Dr.'}
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.dispatchEvent(new CustomEvent('OPEN_ATLAS_CLINICAL_MODE', {
                  detail: {
                    contextType: 'prescription',
                    data: rx,
                    prompt: `Analiza la receta de ${rx.patient?.name || 'paciente'}. Sugiere recomendaciones de dispensación y analiza rentabilidad/demanda de estos productos.`
                  }
                }));
              }}
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))',
                border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: '6px',
                padding: '0.2rem 0.5rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.65rem',
                fontWeight: 700,
                color: '#6366f1',
                cursor: 'pointer',
                marginLeft: '0.5rem'
              }}
              title="Analizar Receta con Atlas"
            >
              <Sparkles size={12} color="#6366f1" />
              Atlas
            </button>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '0.1rem' }}>
            {rx.items?.length || 0} item{(rx.items?.length || 0) !== 1 ? 's' : ''} · {date}
          </div>
        </div>
        <span style={{
          padding: '0.15rem 0.5rem', borderRadius: '4px',
          border: `1px solid ${step.color}40`, color: step.color,
          fontSize: '0.7rem', fontWeight: 600, whiteSpace: 'nowrap',
        }}>
          {step.label}
        </span>
      </div>
    </div>
  );
}

// ── Interactive & Expandable RxRow in Wholesaler Rx Inbox ──────────────────────────
function ExpandableRxRow({ rx, catalogProducts = [], catalogProtocols = [] }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [acting, setActing] = useState(false);
  
  // Kit status states
  const [kitStatus, setKitStatus] = useState(rx.kitStatus || 'kit_dispatched');
  const [collectionLabelUrl, setCollectionLabelUrl] = useState(rx.collectionLabelUrl || '');
  const [labResultsUrl, setLabResultsUrl] = useState(rx.labResultsUrl || '');

  // Recommendation builder states
  const [recommendations, setRecommendations] = useState(rx.recommendations || []);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [recQty, setRecQty] = useState(1);
  const [recUnit, setRecUnit] = useState('vials');
  const [recDosage, setRecDosage] = useState('');

  const step = RX_PIPELINE.find(s => s.key === rx.status) || RX_PIPELINE[0];
  const date = rx.createdAt?.toDate
    ? rx.createdAt.toDate().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  const hasTestingItems = rx.items?.some(i => 
    i.productType === 'testing' || 
    i.type === 'testing' || 
    i.category === 'testing' ||
    (i.name && (
      i.name.toLowerCase().includes('test') || 
      i.name.toLowerCase().includes('eterna') || 
      i.name.toLowerCase().includes('progen') || 
      i.name.toLowerCase().includes('nutrigen') || 
      i.name.toLowerCase().includes('diagnostics')
    ))
  );

  const handleUpdateKitStatus = async (statusVal) => {
    setActing(true);
    try {
      const updateData = { kitStatus: statusVal, updatedAt: serverTimestamp() };
      
      // Auto-set status metadata in timeline
      const timelineEvent = {
        event: `kit_status_${statusVal}`,
        note: t('wholesaler.timeline_notes.kit_status_updated', { status: t(`wholesaler.kit_steps.${statusVal}`, { defaultValue: statusVal }) }),
        timestamp: new Date().toISOString()
      };
      
      await updateDoc(doc(db, 'prescriptions', rx.id), {
        ...updateData,
        timeline: [...(rx.timeline || []), timelineEvent]
      });
      setKitStatus(statusVal);
    } catch (err) {
      console.error('Error updating kit status:', err);
    } finally {
      setActing(false);
    }
  };

  const handleSaveCollectionLabel = async () => {
    if (!collectionLabelUrl.trim()) return;
    setActing(true);
    try {
      await updateDoc(doc(db, 'prescriptions', rx.id), {
        collectionLabelUrl: collectionLabelUrl.trim(),
        kitStatus: 'collection_label_sent',
        updatedAt: serverTimestamp(),
        timeline: [
          ...(rx.timeline || []),
          {
            event: 'kit_collection_label_sent',
            note: t('wholesaler.timeline_notes.label_uploaded'),
            timestamp: new Date().toISOString()
          }
        ]
      });
      setKitStatus('collection_label_sent');
      alert(t('wholesaler.alerts.label_saved'));
    } catch (err) {
      console.error(err);
    } finally {
      setActing(false);
    }
  };

  const handleSaveLabResults = async () => {
    if (!labResultsUrl.trim()) return;
    setActing(true);
    try {
      await updateDoc(doc(db, 'prescriptions', rx.id), {
        labResultsUrl: labResultsUrl.trim(),
        kitStatus: 'results_available',
        updatedAt: serverTimestamp(),
        timeline: [
          ...(rx.timeline || []),
          {
            event: 'kit_results_available',
            note: t('wholesaler.timeline_notes.results_uploaded'),
            timestamp: new Date().toISOString()
          }
        ]
      });
      setKitStatus('results_available');
      alert(t('wholesaler.alerts.results_saved'));
    } catch (err) {
      console.error(err);
    } finally {
      setActing(false);
    }
  };

  const handleAddRecommendation = () => {
    if (!selectedProduct) return;
    
    // Find item details from catalog
    let matchedItem = catalogProducts.find(p => p.id === selectedProduct);
    let itemType = 'product';
    if (!matchedItem) {
      matchedItem = catalogProtocols.find(p => p.id === selectedProduct);
      itemType = 'protocol';
    }
    
    if (!matchedItem) return;
    
    const newRec = {
      productId: matchedItem.id,
      name: matchedItem.name,
      quantity: Number(recQty),
      unit: recUnit,
      dosage: recDosage,
      type: itemType,
      recommendedAt: new Date().toISOString()
    };

    setRecommendations(prev => [...prev, newRec]);
    setSelectedProduct('');
    setRecQty(1);
    setRecDosage('');
  };

  const handleRemoveRecommendation = (idx) => {
    setRecommendations(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSaveRecommendations = async () => {
    setActing(true);
    try {
      await updateDoc(doc(db, 'prescriptions', rx.id), {
        recommendations: recommendations,
        updatedAt: serverTimestamp(),
        timeline: [
          ...(rx.timeline || []),
          {
            event: 'kit_recommendations_updated',
            note: t('wholesaler.timeline_notes.recommendations_uploaded'),
            timestamp: new Date().toISOString()
          }
        ]
      });
      alert(t('wholesaler.alerts.recommendations_saved'));
    } catch (err) {
      console.error(err);
    } finally {
      setActing(false);
    }
  };

  return (
    <div style={{
      background: 'var(--color-bg-surface)', border: '1px solid #dadce0', borderRadius: '4px',
      marginBottom: '0.5rem', overflow: 'hidden', transition: 'box-shadow 0.15s'
    }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 1px 2px rgba(60,64,67,0.1), 0 2px 6px rgba(60,64,67,0.05)'}
    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* Row Header */}
      <div 
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: 'pointer'
        }}
      >
        {expanded ? <ChevronUp size={16} color="#5f6368" /> : <ChevronDown size={16} color="#5f6368" />}
        <ClipboardList size={16} color="#6366f1" />
        
        <div style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#202124', display: 'flex', alignItems: 'center' }}>
              {rx.patient?.name || rx.patient?.email || 'Patient'} 
              <span style={{ fontWeight: 400, color: '#5f6368', marginLeft: '0.4rem' }}>— Dr/a. {rx.doctorName || 'Médico'}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.dispatchEvent(new CustomEvent('OPEN_ATLAS_CLINICAL_MODE', {
                    detail: {
                      contextType: 'prescription',
                      data: rx,
                      prompt: `Analiza la receta detallada de ${rx.patient?.name || 'paciente'}. Proporciona consejos para la gestión de este pedido b2b o evalúa requerimientos logísticos de los péptidos incluidos.`
                    }
                  }));
                }}
                style={{
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))',
                  border: '1px solid rgba(99,102,241,0.2)',
                  borderRadius: '6px',
                  padding: '0.2rem 0.5rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: '#6366f1',
                  cursor: 'pointer',
                  marginLeft: '0.75rem'
                }}
                title="Analizar con Atlas"
              >
                <Sparkles size={12} color="#6366f1" />
                Atlas AI
              </button>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#5f6368', marginTop: '0.1rem' }}>
              {rx.items?.length || 0} item{(rx.items?.length || 0) !== 1 ? 's' : ''} · Creado el {date}
              {rx.shippingAddressType && (
                <span style={{ marginLeft: '0.5rem', padding: '0.05rem 0.35rem', background: '#f1f3f4', borderRadius: '2px', fontWeight: 600, color: '#5f6368' }}>
                  Envío: {rx.shippingAddressType === 'clinic' ? '🏥 Clínica' : '🏠 Paciente'}
                </span>
              )}
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {hasTestingItems && (
              <span style={{
                padding: '0.15rem 0.5rem', borderRadius: '2px', background: '#fef7e0', color: '#b06000',
                fontSize: '0.65rem', fontWeight: 800, border: '1px solid rgba(176,96,0,0.2)'
              }}>
                TEST DIAGNÓSTICO
              </span>
            )}
            
            <span style={{
              padding: '0.15rem 0.5rem', borderRadius: '2px',
              border: `1px solid ${step.color}40`, color: step.color, background: step.bg,
              fontSize: '0.7rem', fontWeight: 600, whiteSpace: 'nowrap',
            }}>
              {step.label}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded details drawer */}
      {expanded && (
        <div style={{ padding: '1rem', background: '#f8f9fa', borderTop: '1px solid #dadce0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Section 1: Prescribed items detail */}
          <div style={detailBlock}>
            <div style={detailTitle}>📝 Productos Prescritos</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.55rem' }}>
              {rx.items?.map((item, index) => (
                <div key={index} style={{ padding: '0.5rem', background: 'var(--color-bg-surface)', border: '1px solid #dadce0', borderRadius: '4px', fontSize: '0.75rem' }}>
                  <div style={{ fontWeight: 700, color: '#202124' }}>{item.name}</div>
                  <div style={{ color: '#5f6368', fontSize: '0.7rem', marginTop: '0.15rem' }}>
                    Cant: <strong>{item.quantity} {item.unit || 'uds'}</strong>
                    {item.dosage && ` · Dosis: ${item.dosage}`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Testing kit manager */}
          {hasTestingItems && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', flexWrap: 'wrap' }}>
              
              {/* Left Column: Logistics Status Tracker */}
              <div style={detailBlock}>
                <div style={detailTitle}>🔬 Gestión de Estado de Kit</div>
                
                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={labelStyle}>Estado de logística actual:</label>
                  <select 
                    value={kitStatus} 
                    onChange={(e) => handleUpdateKitStatus(e.target.value)}
                    disabled={acting}
                    style={selectStyle}
                  >
                    {KIT_STEPS.map(step => (
                      <option key={step.key} value={step.key}>{step.label}</option>
                    ))}
                  </select>
                </div>

                {/* Upload simulated label URL */}
                <div style={{ borderTop: '1px solid #f1f3f4', paddingTop: '0.75rem', marginBottom: '0.75rem' }}>
                  <label style={labelStyle}>Etiqueta de recogida (PDF URL):</label>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <input 
                      value={collectionLabelUrl} 
                      onChange={(e) => setCollectionLabelUrl(e.target.value)} 
                      placeholder="https://example.com/etiqueta.pdf"
                      style={inputStyle}
                    />
                    <button 
                      onClick={handleSaveCollectionLabel}
                      disabled={acting}
                      style={buttonStyle}
                    >
                      Guardar
                    </button>
                  </div>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.62rem', color: 'var(--color-text-tertiary)' }}>
                    Al guardar, el estado del kit pasará automáticamente a 'Etiqueta Generada'.
                  </p>
                </div>

                {/* Upload simulated results URL */}
                <div style={{ borderTop: '1px solid #f1f3f4', paddingTop: '0.75rem' }}>
                  <label style={labelStyle}>Resultados Clínicos (PDF URL):</label>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <input 
                      value={labResultsUrl} 
                      onChange={(e) => setLabResultsUrl(e.target.value)} 
                      placeholder="https://example.com/resultados.pdf"
                      style={inputStyle}
                    />
                    <button 
                      onClick={handleSaveLabResults}
                      disabled={acting}
                      style={buttonStyle}
                    >
                      Guardar
                    </button>
                  </div>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.62rem', color: 'var(--color-text-tertiary)' }}>
                    Al guardar, el estado del kit pasará automáticamente a 'Resultados Listos'.
                  </p>
                </div>
              </div>

              {/* Right Column: Recommendations Builder */}
              <div style={detailBlock}>
                <div style={detailTitle}>💡 Constructor de Recomendaciones de Receta</div>
                
                {/* Add recommendation selector */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.5fr 1fr', gap: '0.4rem', marginBottom: '0.6rem' }}>
                  <div>
                    <span style={miniLabelStyle}>PRODUCTO / PROTOCOLO</span>
                    <select 
                      value={selectedProduct} 
                      onChange={e => setSelectedProduct(e.target.value)}
                      style={selectStyle}
                    >
                      <option value="">-- Seleccionar --</option>
                      <optgroup title="Productos">
                        {catalogProducts.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </optgroup>
                      <optgroup title="Protocolos">
                        {catalogProtocols.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                  <div>
                    <span style={miniLabelStyle}>CANT.</span>
                    <input 
                      type="number" 
                      min="1" 
                      value={recQty}
                      onChange={e => setRecQty(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <span style={miniLabelStyle}>DOSIS/FREQ</span>
                    <input 
                      value={recDosage}
                      onChange={e => setRecDosage(e.target.value)}
                      placeholder="ej: 1 vial semanal"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <button 
                  onClick={handleAddRecommendation}
                  style={{
                    width: '100%', padding: '0.35rem 0.5rem', background: '#6366f1', color: 'var(--color-bg-surface)',
                    border: 'none', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700,
                    cursor: 'pointer', marginBottom: '0.75rem'
                  }}
                >
                  + Añadir a Recomendación
                </button>

                {/* List of recommended items */}
                <div style={{ maxHeight: '110px', overflowY: 'auto', background: 'var(--color-bg-app)', border: '1px solid #dadce0', borderRadius: '4px', padding: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {recommendations.length === 0 ? (
                    <div style={{ color: 'var(--color-text-tertiary)', fontStyle: 'italic', fontSize: '0.7rem', padding: '0.5rem', textAlign: 'center' }}>
                      No hay recomendaciones añadidas para este test todavía.
                    </div>
                  ) : (
                    recommendations.map((rec, rIdx) => (
                      <div key={rIdx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.25rem 0.4rem', background: 'var(--color-bg-surface)', border: '1px solid #e2e8f0', borderRadius: '2px', fontSize: '0.7rem' }}>
                        <span>
                          <strong>{rec.name}</strong> ({rec.quantity} {rec.unit}) {rec.dosage && `· ${rec.dosage}`}
                        </span>
                        <button 
                          onClick={() => handleRemoveRecommendation(rIdx)}
                          style={{ border: 'none', background: 'none', color: '#fca5a5', cursor: 'pointer', padding: '0.1rem' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {recommendations.length > 0 && (
                  <button
                    onClick={handleSaveRecommendations}
                    disabled={acting}
                    style={{
                      width: '100%', marginTop: '0.75rem', padding: '0.4rem', background: 'var(--color-success)', color: 'var(--color-bg-surface)',
                      border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    💾 Guardar Recomendaciones en Receta
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Styles for Expanded Row ──────────────────────────────────────────────────
const detailBlock = {
  background: 'var(--color-bg-surface)',
  border: '1px solid #dadce0',
  borderRadius: '4px',
  padding: '0.75rem 1rem',
  boxShadow: '0 1px 2px 0 rgba(60,64,67,0.1)'
};

const detailTitle = {
  fontSize: '0.72rem',
  fontWeight: 700,
  color: '#202124',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  borderBottom: '1px solid #f1f3f4',
  paddingBottom: '0.4rem',
  marginBottom: '0.6rem'
};

const labelStyle = {
  fontSize: '0.68rem',
  fontWeight: 700,
  color: 'var(--color-text-secondary)',
  display: 'block',
  marginBottom: '0.25rem'
};

const miniLabelStyle = {
  fontSize: '0.58rem',
  fontWeight: 700,
  color: 'var(--color-text-tertiary)',
  display: 'block',
  marginBottom: '0.15rem'
};

const selectStyle = {
  width: '100%',
  padding: '0.35rem 0.5rem',
  borderRadius: '4px',
  border: '1px solid #dadce0',
  fontSize: '0.75rem',
  color: '#3c4043',
  background: 'var(--color-bg-surface)',
  outline: 'none'
};

const inputStyle = {
  flex: 1,
  padding: '0.35rem 0.5rem',
  borderRadius: '4px',
  border: '1px solid #dadce0',
  fontSize: '0.75rem',
  color: '#3c4043',
  background: 'var(--color-bg-surface)',
  outline: 'none'
};

const buttonStyle = {
  padding: '0.35rem 0.75rem',
  background: '#1a73e8',
  color: 'var(--color-bg-surface)',
  border: 'none',
  borderRadius: '4px',
  fontWeight: 600,
  fontSize: '0.75rem',
  cursor: 'pointer'
};

// ── Overview Tab ───────────────────────────────────────────────────────────────
export function WholesalerOverviewTab({ uid, onNavigate }) {
  const [rxList, setRxList] = useState([]);
  const [bulkOrders, setBulkOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Live Rx assigned to this wholesaler
  useEffect(() => {
    if (!uid) return;
    const q = query(
      collection(db, 'prescriptions'),
      where('wholesalerId', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(40)
    );
    const unsub = onSnapshot(q, snap => {
      setRxList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, [uid]);

  // Live bulk orders from this wholesaler
  useEffect(() => {
    if (!uid) return;
    const q = query(
      collection(db, 'bulk_orders'),
      where('wholesalerId', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    const unsub = onSnapshot(q, snap => {
      setBulkOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});
    return () => unsub();
  }, [uid]);

  const assigned  = rxList.filter(r => r.status === 'assigned_to_wholesaler').length;
  const inBulk    = rxList.filter(r => r.status === 'added_to_bulk').length;
  const fulfilled = rxList.filter(r => r.status === 'fulfilled').length;
  const pendingBulk = bulkOrders.filter(b => ['pending', 'processing'].includes(b.status)).length;
  const recentRx  = rxList.slice(0, 8);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>

      {/* Alert: new Rx assigned */}
      {assigned > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.9rem 1.25rem', borderRadius: '14px',
          background: 'linear-gradient(135deg, #ede9fe, #f5f3ff)',
          border: '1px solid rgba(99,102,241,0.25)',
        }}>
          <AlertCircle size={18} color="#6366f1" />
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#3730a3' }}>
              {assigned} new prescription{assigned > 1 ? 's' : ''} assigned to you
            </span>
            <span style={{ fontSize: '0.78rem', color: '#4338ca', marginLeft: '0.5rem' }}>
              — Review and add to a bulk order
            </span>
          </div>
          <button
            onClick={() => onNavigate('rx-inbox')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              padding: '0.45rem 0.9rem', borderRadius: '8px',
              background: '#6366f1', color: 'var(--color-bg-surface)', border: 'none',
              fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Review <ArrowRight size={12} />
          </button>
        </div>
      )}

      {/* KPI row */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <MetricCard
          title="Assigned Rx"
          value={loading ? '…' : assigned}
          subtitle="waiting to be added to bulk"
          icon={ClipboardList}
          color="#6366f1"
          alert={assigned > 0}
          onClick={() => onNavigate('rx-inbox')}
        />
        <MetricCard
          title="In Bulk Orders"
          value={loading ? '…' : inBulk}
          subtitle="consolidated, pending shipment"
          icon={Layers}
          color="#8b5cf6"
          onClick={() => onNavigate('bulk-orders')}
        />
        <MetricCard
          title="Pending Bulk Orders"
          value={loading ? '…' : pendingBulk}
          subtitle="awaiting admin confirmation"
          icon={Truck}
          color="#f59e0b"
          alert={pendingBulk > 0}
          onClick={() => onNavigate('bulk-orders')}
        />
        <MetricCard
          title="Fulfilled"
          value={loading ? '…' : fulfilled}
          subtitle="prescriptions delivered"
          icon={CheckCircle2}
          color="var(--color-success)"
        />
      </div>

      {/* Hero CTA: Build Bulk Order GCP Style */}
      <div style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid #e2e8f0', borderRadius: '4px', padding: '1.25rem 1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem',
        flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Layers size={16} color="#0f172a" />
            <span style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>
              Build Bulk Order
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            Consolidate assigned Rx + B2C orders + your own stock items into a single purchase order.
          </p>
        </div>
        <button
          onClick={() => onNavigate('bulk-orders')}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.6rem 1rem', borderRadius: '4px',
            background: 'var(--color-bg-surface)', color: '#0f172a',
            border: '1px solid #cbd5e1', fontWeight: 600, fontSize: '0.8rem',
            cursor: 'pointer',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-app)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--color-bg-surface)'}
        >
          Open Builder <ArrowRight size={14} />
        </button>
      </div>

      {/* Rx Pipeline Board */}
      <div>
        {/* Pipeline legend bar */}
        {rxList.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.3rem', height: 8, borderRadius: '999px', overflow: 'hidden', background: '#f1f5f9', marginBottom: '0.6rem' }}>
              {RX_PIPELINE.map(step => {
                const count = rxList.filter(r => r.status === step.key).length;
                return count > 0 ? (
                  <div key={step.key} style={{
                    width: `${(count / rxList.length) * 100}%`,
                    background: step.color, transition: 'width 0.5s ease',
                  }} title={`${step.label}: ${count}`} />
                ) : null;
              })}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {RX_PIPELINE.map(step => {
                const count = rxList.filter(r => r.status === step.key).length;
                return count > 0 ? (
                  <span key={step.key} style={{
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                    fontSize: '0.65rem', fontWeight: 700, color: step.color,
                  }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: step.color, display: 'inline-block' }} />
                    {step.label} ({count})
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
            Assigned Prescriptions
            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', fontWeight: 600, marginLeft: '0.5rem' }}>
              {rxList.length} total
            </span>
          </div>
          <button
            onClick={() => onNavigate('rx-inbox')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#6366f1', fontWeight: 700, fontSize: '0.78rem', fontFamily: 'inherit',
            }}
          >
            View all <ArrowRight size={13} />
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                height: 64, borderRadius: '14px',
                background: 'linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%)',
                backgroundSize: '200% 100%', animation: 'wsShimmer 1.5s infinite',
              }} />
            ))}
          </div>
        ) : rxList.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '2.5rem', background: 'var(--color-bg-app)',
            borderRadius: '16px', border: '2px dashed #e2e8f0', color: 'var(--color-text-tertiary)',
          }}>
            <ClipboardList size={32} strokeWidth={1.2} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
              No prescriptions assigned yet
            </div>
            <div style={{ fontSize: '0.78rem', marginTop: '0.3rem' }}>
              Prescriptions assigned by doctors will appear here
            </div>
          </div>
        ) : (
          <div style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid #e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
            {recentRx.map(rx => <SimpleRxRow key={rx.id} rx={rx} />)}
            {rxList.length > 8 && (
              <button
                onClick={() => onNavigate('rx-inbox')}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  padding: '0.75rem', border: 'none', background: 'var(--color-bg-app)',
                  color: '#6366f1', fontWeight: 600, fontSize: '0.75rem',
                  cursor: 'pointer', borderTop: '1px solid #e2e8f0'
                }}
              >
                View {rxList.length - 8} more <ArrowRight size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes wsShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}

// ── Bulk Orders Tab ────────────────────────────────────────────────────────────
export function WholesalerBulkTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '10px', background: 'rgba(99,102,241,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Layers size={18} color="#6366f1" />
        </div>
        <div>
          <div style={{ fontWeight: 900, fontSize: '1rem', color: '#0f172a' }}>Bulk Order Builder</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)' }}>
            Consolidate Rx + B2C + stock items into one purchase order
          </div>
        </div>
      </div>
      <div style={{
        background: 'var(--color-bg-surface)', borderRadius: '20px', padding: '1.5rem',
        border: '1px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      }}>
        <WholesalerBulkOrderBuilder />
      </div>
    </div>
  );
}

// ── Rx Inbox Tab ──────────────────────────────────────────────────────────────
export function WholesalerRxInboxTab({ uid }) {
  const [rxList, setRxList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load catalog data for recommendations builder
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [catalogProtocols, setCatalogProtocols] = useState([]);
  useEffect(() => {
    getDocs(query(collection(db, 'products'), limit(150)))
      .then(snap => setCatalogProducts(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
      .catch(() => {});
    getDocs(query(collection(db, 'protocols'), limit(100)))
      .then(snap => setCatalogProtocols(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!uid) return;
    const q = query(
      collection(db, 'prescriptions'),
      where('wholesalerId', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const unsub = onSnapshot(q, snap => {
      setRxList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, [uid]);

  return (
    <div>
      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', marginBottom: '1rem' }}>
        Rx Inbox <span style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>({rxList.length} total)</span>
      </div>
      {loading ? (
        <div style={{ color: 'var(--color-text-tertiary)', fontSize: '0.85rem', padding: '2rem', textAlign: 'center' }}>Loading prescriptions…</div>
      ) : rxList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-bg-app)', borderRadius: '16px', border: '2px dashed #e2e8f0', color: 'var(--color-text-tertiary)' }}>
          <ClipboardList size={32} strokeWidth={1.2} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
          <div style={{ fontWeight: 700, color: 'var(--color-text-secondary)' }}>No prescriptions assigned</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          {rxList.map(rx => (
            <ExpandableRxRow 
              key={rx.id} 
              rx={rx} 
              catalogProducts={catalogProducts} 
              catalogProtocols={catalogProtocols} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Mobile not supported ───────────────────────────────────────────────────────
function MobileNotSupported() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
      padding: '2rem', textAlign: 'center',
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💻</div>
      <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-bg-surface)', marginBottom: '0.75rem' }}>
        B2B Wholesaler Portal
      </div>
      <div style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.65)', maxWidth: 320, lineHeight: 1.65, marginBottom: '2rem' }}>
        The B2B portal is optimized for <strong style={{ color: 'var(--color-bg-surface)' }}>laptop or desktop</strong>.
        Please access from a computer to manage prescriptions and bulk orders.
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.6rem',
        padding: '0.75rem 1.25rem', borderRadius: '12px',
        background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
        fontSize: '0.82rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)',
      }}>
        <Laptop size={16} /> Access from your computer
      </div>
    </div>
  );
}

// ── Placeholder tab ────────────────────────────────────────────────────────────
export function PlaceholderTab({ title, description }) {
  return (
    <div style={{
      textAlign: 'center', padding: '3rem 2rem', background: 'var(--color-bg-app)',
      borderRadius: '20px', border: '2px dashed #e2e8f0',
    }}>
      <Zap size={36} strokeWidth={1.2} color="var(--color-text-tertiary)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
      <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>{title}</div>
      <div style={{ fontSize: '0.82rem', color: 'var(--color-text-tertiary)', maxWidth: 360, margin: '0 auto' }}>{description}</div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
import { Outlet, useLocation } from 'react-router-dom';
import AppPortalLayout from '../layout/AppPortalLayout';

export default function WholesalerHome() {
  const { user, userProfile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile]   = useState(window.innerWidth < 1024);
  const [rxBadge, setRxBadge]     = useState(0);

  // Derive active tab from URL (e.g. /wholesaler/rx-inbox -> rx-inbox)
  const pathParts = location.pathname.split('/').filter(Boolean);
  // Default to 'overview' if exactly /wholesaler
  const activeTab = pathParts.length > 1 ? pathParts[pathParts.length - 1] : 'overview';

  const uid     = user?.uid;
  const name    = userProfile?.firstName
    ? `${userProfile.firstName} ${userProfile.lastName || ''}`.trim()
    : user?.displayName || 'Partner';
  const company = userProfile?.company || userProfile?.clinicName || '';

  // Responsive guard
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  // Badge: unread Rx assigned
  useEffect(() => {
    if (!uid) return;
    const q = query(
      collection(db, 'prescriptions'),
      where('wholesalerId', '==', uid),
      where('status', '==', 'assigned_to_wholesaler'),
      limit(20)
    );
    const unsub = onSnapshot(q, snap => setRxBadge(snap.size), () => {});
    return () => unsub();
  }, [uid]);

  const handleLogout = useCallback(() => { logout?.(); window.location.href = '/'; }, [logout]);

  const currentTab = TABS.find(t => t.id === activeTab);

  const topbarActions = rxBadge > 0 ? (
    <button
      onClick={() => navigate('/wholesaler/rx-inbox')}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.4rem 0.8rem', borderRadius: '4px',
        background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)',
        color: '#4f46e5', fontWeight: 700, fontSize: '0.75rem',
        cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', marginRight: '0.5rem'
      }}
      title="Unread Rx"
    >
      <Bell size={14} /> {rxBadge}
    </button>
  ) : null;

  return (
    <AppPortalLayout allowedRoles={['wholesaler', 'admin']}>
      <div style={{ padding: '2rem' }}>
        <RefillReminderBanner role="wholesaler" />
        <AdminTabErrorBoundary tabId={activeTab} tabLabel={currentTab?.label || activeTab}>
          <Outlet context={{ uid }} />
        </AdminTabErrorBoundary>
      </div>
    </AppPortalLayout>
  );
}
