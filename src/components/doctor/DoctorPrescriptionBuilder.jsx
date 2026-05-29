/**
 * DoctorPrescriptionBuilder.jsx
 *
 * Doctor's prescription builder — type-cart with Firestore persistence.
 * Two modes: patient prescription | clinic supply order.
 *
 * Features:
 *   - Product/Protocol search + add
 *   - Per-item: quantity, dosage, frequency, duration, notes
 *   - Patient selector (registered patients or free-text)
 *   - Delivery: direct to patient | via wholesaler | clinic supply
 *   - Save draft (auto-save on change) + Send action
 *   - Timeline events on status changes
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  collection, doc, addDoc, updateDoc, serverTimestamp, getDocs,
  query, where, orderBy, limit
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { logAction } from '../../services/auditLogger';
import {
  ClipboardList, Plus, Trash2, Send, Save, Search, User, Building,
  ChevronDown, FlaskConical, PackageSearch, AlertCircle, CheckCircle2,
  Clock, X, ArrowRight, Loader2, Stethoscope, ShoppingBag, UploadCloud
} from 'lucide-react';
import {
  RX_TYPE, DELIVERY_METHOD, RX_STATUS, newRxDraft,
  ITEM_UNITS, FREQUENCIES, DURATIONS, RX_STATUS_META, rxEvent
} from '../../config/prescriptionConfig';
import { apiCatalog } from '../../data/apis';
import CatalogPreviewPanel from '../wholesaler/CatalogPreviewPanel';


// ── Mini status badge ─────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const m = RX_STATUS_META[status] || RX_STATUS_META.draft;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      padding: '0.25rem 0.65rem', borderRadius: '999px',
      background: m.bg, color: m.color,
      fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.03em',
    }}>
      {m.emoji} {m.label}
    </span>
  );
}

// ── Item row in the prescription cart ─────────────────────────────────────────
function PrescriptionItemRow({ item, index, onChange, onRemove, onAddTest, catalogProducts }) {
  const [type, setType] = useState('patient');
  const [open, setOpen] = useState(false);

  const upd = (field, val) => onChange(index, { ...item, [field]: val });

  const isCompounded = item.type === 'supplement_compounding';

  return (
    <div style={{
      border: '1px solid #e2e8f0', borderRadius: '14px',
      overflow: 'hidden', background: 'var(--color-bg-surface)',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      {/* Row summary */}
      <div style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
          background: isCompounded ? 'rgba(13,148,136,0.08)' : (item.type === 'protocol' ? 'rgba(139,92,246,0.08)' : (item.productType === 'testing' || item.type === 'testing' ? 'rgba(245,158,11,0.08)' : 'rgba(0,54,102,0.07)')),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {isCompounded
            ? <FlaskConical size={16} color="#0d9488" />
            : (item.type === 'protocol'
              ? <FlaskConical size={16} color="#8b5cf6" />
              : (item.productType === 'testing' || item.type === 'testing' ? <ClipboardList size={16} color="#f59e0b" /> : <PackageSearch size={16} color="var(--color-primary)" />))}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--color-text-primary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.name} {isCompounded && <span style={{ color: '#0d9488', fontSize: '0.7rem', fontWeight: 600 }}>(Fórmula Magistral)</span>}
          </div>
          {isCompounded ? (
            <div style={{ fontSize: '0.68rem', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>
              Formato: {item.format === 'capsules' ? 'Cápsulas' : item.format === 'powder' ? 'Polvo' : item.format === 'drops' ? 'Gotas' : 'Liposomal'} | {item.ingredients?.length || 0} Ingredientes
            </div>
          ) : (
            item.sku && <div style={{ fontSize: '0.68rem', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>SKU: {item.sku}</div>
          )}
        </div>

        {/* Quick qty */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
          <button onClick={() => upd('quantity', Math.max(1, (item.quantity || 1) - 1))}
            style={qtyBtn}>−</button>
          <span style={{ fontWeight: 900, color: '#0f172a', minWidth: 24, textAlign: 'center' }}>
            {item.quantity || 1}
          </span>
          <button onClick={() => upd('quantity', (item.quantity || 1) + 1)}
            style={qtyBtn}>+</button>
          {isCompounded ? (
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', padding: '0.25rem 0.4rem', fontWeight: 600 }}>
              {item.unit || 'uds'}
            </span>
          ) : (
            <select value={item.unit || 'vials'}
              onChange={e => upd('unit', e.target.value)}
              style={{ fontSize: '0.7rem', border: '1px solid #e2e8f0', borderRadius: '6px',
                padding: '0.25rem 0.4rem', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
              {ITEM_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          )}
        </div>

        <button onClick={() => setOpen(v => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-border)', padding: '0.25rem' }}>
          <ChevronDown size={14} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
        </button>

        <button onClick={() => onRemove(index)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fca5a5', padding: '0.25rem' }}>
          <Trash2 size={14} />
        </button>
      </div>

      {/* Expanded dosage details */}
      {open && (
        <div style={{ padding: '0 1rem 1rem', borderTop: '1px solid #f1f5f9',
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem', paddingTop: '0.75rem' }}>
          
          {/* Compounding Ingredients list if compounded */}
          {isCompounded && (
            <div style={{ gridColumn: '1 / -1', background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '8px', padding: '0.65rem 0.85rem', marginBottom: '0.4rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span>🧪 Composición de la Fórmula ({item.ingredients?.length || 0} APIs)</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.4rem' }}>
                {item.ingredients?.map((ing, ingIdx) => (
                  <div key={ingIdx} style={{ fontSize: '0.72rem', color: '#115e59', background: 'var(--color-bg-surface)', padding: '0.3rem 0.5rem', borderRadius: '4px', border: '1px solid #ccfbf1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>{ing.name}</span>
                    <span style={{ fontWeight: 800, color: '#0d9488' }}>{ing.dose} {ing.unit}</span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#0d9488', marginTop: '0.5rem', fontWeight: 500 }}>
                <strong>Vehículo base:</strong> {item.excipient === 'cellulose_capsule' ? 'Cápsula de celulosa (veggie)' : item.excipient === 'flavored_powder_base' ? 'Base de polvo saborizada' : item.excipient === 'vegetable_glycerin' ? 'Glicerina vegetal pura' : 'Vehículo liposomal líquido'}
              </div>
            </div>
          )}

          {/* Pricing Breakdown Accordion Section */}
          <div style={{ gridColumn: '1 / -1', background: 'var(--color-bg-app)', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.6rem 0.8rem', marginBottom: '0.4rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span>📊 Desglose de Precios (B2B / B2C)</span>
            </div>
            {item.type === 'supplement_compounding' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem', fontSize: '0.75rem', textAlign: 'center', padding: '0.5rem 0' }}>
                <span style={{ color: '#0d9488', fontWeight: 800, fontSize: '0.85rem' }}>Pendiente de Cotización</span>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.65rem' }}>El costo final de esta fórmula magistral será determinado por tu Account Manager una vez enviada la orden.</span>
              </div>
            ) : item.pricing ? (() => {
              const clinicVal = resolveVariantPrice({ pricing: item.pricing }, { tier: 'clinic' });
              const patientVal = resolveVariantPrice({ pricing: item.pricing }, { tier: 'retail' });
              const clinicFmt = clinicVal?.perUnit != null ? formatPrice(clinicVal.perUnit, clinicVal.currency) : '—';
              const patientFmt = patientVal?.perUnit != null ? formatPrice(patientVal.perUnit, patientVal.currency) : '—';
              
              // Calculate default margin/markup
              let defaultMarginText = '—';
              if (clinicVal?.perUnit && patientVal?.perUnit) {
                const diff = patientVal.perUnit - clinicVal.perUnit;
                const pct = Math.round((diff / clinicVal.perUnit) * 100);
                defaultMarginText = `+${pct}% (Margen aplicado)`;
              }

              return (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', fontSize: '0.75rem' }}>
                  <div>
                    <span style={{ color: 'var(--color-text-secondary)', display: 'block', fontSize: '0.65rem', fontWeight: 600 }}>COSTO CLÍNICA (B2B)</span>
                    <strong style={{ color: '#0f172a' }}>{clinicFmt}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-secondary)', display: 'block', fontSize: '0.65rem', fontWeight: 600 }}>PRECIO PACIENTE (B2C)</span>
                    <strong style={{ color: 'var(--color-text-primary)' }}>{patientFmt}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-secondary)', display: 'block', fontSize: '0.65rem', fontWeight: 600 }}>MARGEN ESTIMADO</span>
                    <strong style={{ color: 'var(--color-success)' }}>{defaultMarginText}</strong>
                  </div>
                </div>
              );
            })() : (
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>
                Precios no disponibles para este ítem.
              </div>
            )}
          </div>

          {!isCompounded ? (
            <>
              <label className="gcp-label">
                Dosis
                <input value={item.dosage || ''} onChange={e => upd('dosage', e.target.value)}
                  placeholder="e.g. 5mg" className="gcp-input" />
              </label>
              <label className="gcp-label">
                Frecuencia
                <select value={item.frequency || ''} onChange={e => upd('frequency', e.target.value)} className="gcp-input">
                  <option value="">— Seleccionar —</option>
                  {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </label>
              <label className="gcp-label">
                Duración
                <select value={item.duration || ''} onChange={e => upd('duration', e.target.value)} className="gcp-input">
                  <option value="">— Seleccionar —</option>
                  {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </label>
              <label style={{ ...fieldLabel, gridColumn: '1 / -1' }}>
                Notas del ítem
                <input value={item.notes || ''} onChange={e => upd('notes', e.target.value)}
                  placeholder="Instrucciones especiales…" className="gcp-input" />
              </label>

              {/* Recommended Optional Tests section */}
              {item.type === 'protocol' && item.recommended_tests?.length > 0 && (
                <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #e2e8f0', paddingTop: '0.6rem', marginTop: '0.4rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span>🔬 Pruebas de Diagnóstico Recomendadas (Opcionales)</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {item.recommended_tests.map(testId => {
                      const match = catalogProducts?.find(p => p.id === testId);
                      if (!match) return null;
                      
                      return (
                        <div key={testId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--color-bg-app)', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.45rem 0.6rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>{match.displayName || match.name}</span>
                            <span style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>{match.category} | {match.desc || match.description}</span>
                          </div>
                          <button
                            onClick={() => onAddTest({
                              type: 'testing',
                              id: match.id,
                              name: match.displayName || match.name || '',
                              sku: match.sku || match.variants?.[0]?.sku || '',
                              pricing: match.pricing || null,
                              quantity: 1,
                              unit: 'kits',
                              dosage: '',
                              frequency: '',
                              duration: '',
                              notes: ''
                            })}
                            style={{
                              fontSize: '0.68rem', fontWeight: 600, color: '#1a73e8', background: '#e8f0fe', border: 'none', borderRadius: '4px', padding: '0.3rem 0.65rem', cursor: 'pointer', transition: 'all 0.15s'
                            }}
                          >
                            + Añadir
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <label style={{ ...fieldLabel, gridColumn: '1 / -1' }}>
              Pauta de uso / Instrucciones de dosificación sugeridas
              <textarea 
                value={item.dosage || ''} 
                onChange={e => upd('dosage', e.target.value)}
                placeholder="Ej: Tomar 2 cápsulas diarias por la mañana con el desayuno." 
                rows={2}
                style={{ ...fieldInput, resize: 'vertical', lineHeight: 1.4, marginTop: '0.2rem' }} 
              />
            </label>
          )}
        </div>
      )}
    </div>
  );
}

// ── Product search mini-dropdown ───────────────────────────────────────────────
function ProductSearchBar({ onAdd, catalogProducts = [], catalogProtocols = [] }) {
  const [q, setQ]           = useState('');
  const [mode, setMode]     = useState('catalog'); // 'catalog' | 'apis'
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounce = useRef(null);

  const search = useCallback((term, currentMode) => {
    console.log('[ProductSearch] Starting local search for term:', term);
    if (term.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      if (currentMode === 'catalog') {
        const filtered = catalogProducts.filter(p =>
          (p.name || p.displayName || '').toLowerCase().includes(term.toLowerCase())
        );
        const protos = catalogProtocols.filter(p =>
          (p.name || '').toLowerCase().includes(term.toLowerCase())
        );
        setResults([...filtered.slice(0, 6), ...protos.slice(0, 4)]);
      } else {
        const filteredApis = apiCatalog.filter(a => 
          (a.name || '').toLowerCase().includes(term.toLowerCase())
        );
        setResults(filteredApis.slice(0, 10));
      }
    } catch (err) {
      console.error('[ProductSearch] Error in local search:', err);
    } finally {
      setLoading(false);
    }
  }, [catalogProducts, catalogProtocols]);

  const handleInput = (val) => {
    setQ(val);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => search(val, mode), 150);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setQ('');
    setResults([]);
  };

  const handleAdd = (item) => {
    if (mode === 'apis') {
      onAdd({
        type: 'supplement_compounding',
        id: `comp-${item.id}-${Date.now()}`,
        name: `Fórmula con ${item.name}`,
        sku: 'MAGISTRAL',
        pricing: null,
        quantity: 1,
        unit: 'vials',
        dosage: '',
        frequency: '',
        duration: '',
        notes: '',
        format: 'capsules',
        excipient: 'cellulose_capsule',
        ingredients: [{
           id: item.id,
           name: item.name,
           dose: '',
           unit: item.baseUnit,
        }]
      });
    } else {
      onAdd({
        type:      item.type,
        id:        item.id,
        name:      item.name || item.displayName || '',
        sku:       item.sku || item.variants?.[0]?.sku || '',
        imageUrl:  item.imageUrl || item.image || '',
        pricing:   item.pricing || null,
        quantity:  1,
        unit:      item.productType === 'testing' || item.type === 'testing' ? 'kits' : 'vials',
        dosage:    '',
        frequency: '',
        duration:  '',
        notes:     '',
        recommended_tests: item.recommended_tests || [],
      });
    }
    setQ('');
    setResults([]);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <button 
          onClick={() => handleModeChange('catalog')}
          style={{ flex: 1, padding: '0.4rem', borderRadius: '8px', border: mode === 'catalog' ? '2px solid #003666' : '1px solid #cbd5e1', background: mode === 'catalog' ? '#f0f9ff' : 'var(--color-bg-surface)', fontWeight: mode === 'catalog' ? 800 : 600, color: mode === 'catalog' ? 'var(--color-primary)' : 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '0.75rem' }}>
          Catálogo Regular
        </button>
        <button 
          onClick={() => handleModeChange('apis')}
          style={{ flex: 1, padding: '0.4rem', borderRadius: '8px', border: mode === 'apis' ? '2px solid #0d9488' : '1px solid #cbd5e1', background: mode === 'apis' ? '#f0fdfa' : 'var(--color-bg-surface)', fontWeight: mode === 'apis' ? 800 : 600, color: mode === 'apis' ? '#0d9488' : 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '0.75rem' }}>
          Materias Primas (Fórmula Magistral)
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem',
        border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '0.6rem 0.9rem',
        background: 'var(--color-bg-app)', transition: 'border-color 0.15s' }}
        onFocus={e => e.currentTarget.style.borderColor = mode === 'catalog' ? 'var(--color-primary)' : '#0d9488'}
        onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'}>
        {loading ? <Loader2 size={15} color="var(--color-text-tertiary)" style={{ animation: 'rxSpin 1s linear infinite' }} />
                 : <Search size={15} color="var(--color-text-tertiary)" />}
        <input value={q} onChange={e => handleInput(e.target.value)}
          placeholder={mode === 'catalog' ? "Buscar producto o protocolo para añadir…" : "Buscar API puro para componer receta..."}
          style={{ flex: 1, border: 'none', background: 'none', outline: 'none',
            fontSize: '0.82rem', color: 'var(--color-text-primary)', fontFamily: 'inherit' }} />
      </div>

      {results.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 50,
          background: 'var(--color-bg-surface)', borderRadius: '12px', border: '1px solid #e2e8f0',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)', overflow: 'hidden',
        }}>
          {results.map(r => (
            <button key={r.id} onClick={() => handleAdd(r)} style={{
              width: '100%', textAlign: 'left', background: 'none', border: 'none',
              cursor: 'pointer', padding: '0.65rem 1rem',
              display: 'flex', alignItems: 'center', gap: '0.65rem',
              borderBottom: '1px solid #f8fafc',
              transition: 'background 0.1s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-app)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <span style={{ fontSize: '0.9rem' }}>
                {mode === 'apis' ? '🧪' : (r.type === 'protocol' ? '🧬' : (r.productType === 'testing' || r.type === 'testing' ? '🔬' : '💊'))}
              </span>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {r.name || r.displayName}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>
                  {mode === 'apis' ? `API Base: ${r.baseUnit}` : (r.type === 'protocol' ? 'Protocolo' : `SKU: ${r.sku || '—'}`)}
                </div>
              </div>
              <Plus size={13} color={mode === 'apis' ? "#0d9488" : "var(--color-primary)"} style={{ marginLeft: 'auto' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Shared style tokens ───────────────────────────────────────────────────────
const qtyBtn = {
width: 24, height: 24, borderRadius: '4px', border: '1px solid #cbd5e1',
  background: 'var(--color-bg-app)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700,
  color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
};
const fieldLabel = {
  display: 'flex', flexDirection: 'column', gap: '0.25rem',
  fontSize: '0.68rem', fontWeight: 800, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em',
};
const fieldInput = {
  fontSize: '0.8rem', color: 'var(--color-text-primary)', fontFamily: 'inherit', fontWeight: 600,
  border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.35rem 0.5rem',
  outline: 'none', background: 'var(--color-bg-surface)',
};

// ── Main Builder ──────────────────────────────────────────────────────────────
import { arrayUnion } from 'firebase/firestore'; 
import { resolveVariantPrice, formatPrice } from '../../utils/resolvePrice';
import { SUPPLEMENT_APIS, FORMATS, VEHICLES } from '../../data/supplementApis';

const calculateCompoundPricing = (ingredients, servings, formatId, marginPct) => {
  const format = FORMATS.find(f => f.id === formatId) || FORMATS[0];
  const baseFee = format.baseFee;
  
  let ingredientCost = 0;
  ingredients.forEach(ing => {
    const api = SUPPLEMENT_APIS.find(a => a.id === ing.apiId);
    if (api) {
      ingredientCost += Number(ing.dose || 0) * api.costPerUnit * Number(servings || 0);
    }
  });

  const b2bCost = baseFee + ingredientCost;
  const markup = b2bCost * (Number(marginPct || 30) / 100);
  const b2cPrice = b2bCost + markup;

  return {
    b2bCost,
    b2cPrice,
    markup
  };
};

export default function DoctorPrescriptionBuilder({ doctorId, doctorMeta, patients = [], onSaved, prefilledData }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [ocrFile, setOcrFile] = useState(null);
  const [isUploadingOcr, setIsUploadingOcr] = useState(false);
  const { user, userProfile } = useAuth();

  const doctorName  = doctorMeta?.doctorName || user?.displayName || 'Dr.';
  const doctorEmail = user?.email || '';

  const [rx, setRx]           = useState(() => ({
    ...newRxDraft(doctorId, doctorName, doctorEmail),
    shippingAddressType: 'patient',
    shippingAddress: { address: '', city: '', zip: '', country: '' },
    delegatedAssistantId: '',
    kitStatus: 'none',
    ...prefilledData,
  }));

  useEffect(() => {
    if (prefilledData) {
      setRx(prev => ({
        ...prev,
        ...prefilledData,
      }));
    }
  }, [prefilledData]);
  const [saving, setSaving]   = useState(false);
  const [sending, setSending] = useState(false);
  const [savedId, setSavedId] = useState(null);  // Firestore doc ID once saved
  const [toast, setToast]     = useState(null);  // { msg, ok }
  const [wholesalers, setWholesalers] = useState([]);

  // Patient creation states
  const [isCreatingPatient, setIsCreatingPatient] = useState(false);
  const [newPatientFirstName, setNewPatientFirstName] = useState('');
  const [newPatientLastName, setNewPatientLastName] = useState('');
  const [newPatientEmail, setNewPatientEmail] = useState('');
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [creatingPatientLoading, setCreatingPatientLoading] = useState(false);

  // Catalog browser states
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [catalogProtocols, setCatalogProtocols] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [showCatalogBrowser, setShowCatalogBrowser] = useState(false);
  const [catalogSearchQuery, setCatalogSearchQuery] = useState('');

  // Markup and margin configuration states
  const [showMarginModal, setShowMarginModal] = useState(false);
  const [markupMargin, setMarkupMargin] = useState(30);

  // Compounding Supplement States
  const [builderTab, setBuilderTab] = useState('catalog'); // 'catalog' | 'compounding'
  const [compoundName, setCompoundName] = useState('');
  const [compoundFormat, setCompoundFormat] = useState('capsules');
  const [compoundExcipient, setCompoundExcipient] = useState('cellulose_capsule');
  const [compoundServings, setCompoundServings] = useState(60);
  const [compoundInstructions, setCompoundInstructions] = useState('');
  const [compoundIngredients, setCompoundIngredients] = useState([]); // Array of { apiId, dose }

  useEffect(() => {
    if (doctorMeta?.defaultMarkupMargin != null) {
      setMarkupMargin(doctorMeta.defaultMarkupMargin);
    } else if (userProfile?.defaultMarkupMargin != null) {
      setMarkupMargin(userProfile.defaultMarkupMargin);
    }
  }, [doctorMeta, userProfile]);

  // Load wholesalers list for assignment
  useEffect(() => {
    getDocs(query(collection(db, 'users'), where('role', '==', 'wholesaler'), limit(30)))
      .then(snap => setWholesalers(snap.docs.map(d => ({ uid: d.id, ...d.data() }))))
      .catch(() => {});
  }, []);

  // Load linked assistants list for delegation
  const [assistantsList, setAssistantsList] = useState([]);
  useEffect(() => {
    if (!doctorId) return;
    const fetchAssistants = async () => {
      try {
        const q = query(
          collection(db, 'users'),
          where('role', '==', 'staff'),
          where('assignedDoctorIds', 'array-contains', doctorId)
        );
        const snap = await getDocs(q);
        setAssistantsList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('Error fetching assistants for builder:', err);
      }
    };
    fetchAssistants();
  }, [doctorId]);

  // Recent prescriptions history states
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const [loadingRecentRx, setLoadingRecentRx] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

  useEffect(() => {
    if (!doctorId) return;
    const fetchRecentRx = async () => {
      setLoadingRecentRx(true);
      try {
        const q = query(
          collection(db, 'prescriptions'),
          where('doctorId', '==', doctorId),
          limit(100)
        );
        const snap = await getDocs(q);
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Sort in memory by createdAt desc
        list.sort((a, b) => {
          const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
          const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
          return timeB - timeA;
        });
        setRecentPrescriptions(list.slice(0, 5));
      } catch (err) {
        console.error('Error fetching recent prescriptions:', err);
      } finally {
        setLoadingRecentRx(false);
      }
    };
    fetchRecentRx();
  }, [doctorId]);

  // Fetch full store catalog
  useEffect(() => {
    const fetchCatalog = async () => {
      setCatalogLoading(true);
      try {
        const prodSnap = await getDocs(query(collection(db, 'products'), limit(150)));
        const protoSnap = await getDocs(query(collection(db, 'protocols'), limit(100)));
        setCatalogProducts(prodSnap.docs.map(d => ({ id: d.id, type: 'product', ...d.data() })));
        setCatalogProtocols(protoSnap.docs.map(d => ({ id: d.id, type: 'protocol', ...d.data() })));
      } catch (err) {
        console.error('Error fetching catalog:', err);
      } finally {
        setCatalogLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Field helpers ──────────────────────────────────────────────────────────
  const setField = (path, val) => setRx(prev => {
    const updated = { ...prev };
    const parts = path.split('.');
    let cur = updated;
    for (let i = 0; i < parts.length - 1; i++) { cur = cur[parts[i]] = { ...cur[parts[i]] }; }
    cur[parts[parts.length - 1]] = val;
    return updated;
  });

  const setType = (type) => {
    setRx(prev => ({
      ...prev,
      type,
      delivery: {
        ...prev.delivery,
        method: type === RX_TYPE.CLINIC_SUPPLY
          ? DELIVERY_METHOD.CLINIC_SUPPLY
          : DELIVERY_METHOD.DIRECT_PATIENT,
      },
    }));
  };

  const addItem = (item) => setRx(prev => {
    // Avoid duplicates in items list
    if (prev.items.some(i => i.id === item.id)) {
      showToast('Este ítem ya está en la prescripción.');
      return prev;
    }
    return { ...prev, items: [...prev.items, item] };
  });

  const updateItem = (i, updated) => setRx(prev => {
    const items = [...prev.items];
    items[i] = updated;
    return { ...prev, items };
  });

  const removeItem = (i) => setRx(prev => ({
    ...prev, items: prev.items.filter((_, idx) => idx !== i)
  }));

  // Patient creation flow
  const handleCreatePatient = async (e) => {
    e.preventDefault();
    if (!newPatientEmail.trim()) {
      showToast('El correo electrónico es requerido.', false);
      return;
    }
    setCreatingPatientLoading(true);
    try {
      const emailClean = newPatientEmail.trim().toLowerCase();
      
      // Check existing patient
      const qExist = query(collection(db, 'users'), where('email', '==', emailClean));
      const existSnap = await getDocs(qExist);
      let patientUid = '';
      let patientFullName = `${newPatientFirstName} ${newPatientLastName}`.trim();
      
      if (!existSnap.empty) {
        const existingUser = existSnap.docs[0];
        patientUid = existingUser.id;
        const existData = existingUser.data();
        patientFullName = `${existData.firstName || ''} ${existData.lastName || ''}`.trim() || patientFullName;
        
        await updateDoc(doc(db, 'users', patientUid), {
          assignedDoctorIds: arrayUnion(doctorId)
        });
      } else {
        const newDoc = await addDoc(collection(db, 'users'), {
          firstName: newPatientFirstName.trim(),
          lastName: newPatientLastName.trim(),
          email: emailClean,
          phone: newPatientPhone.trim(),
          role: 'patient',
          createdAt: serverTimestamp(),
          assignedDoctorIds: [doctorId]
        });
        patientUid = newDoc.id;
      }

      // Create relationship
      const relQ = query(
        collection(db, 'doctor_patient_relationships'),
        where('doctorId', '==', doctorId),
        where('patientId', '==', patientUid)
      );
      const relSnap = await getDocs(relQ);
      if (relSnap.empty) {
        await addDoc(collection(db, 'doctor_patient_relationships'), {
          doctorId,
          patientId: patientUid,
          patientEmail: emailClean,
          patientName: patientFullName,
          status: 'active',
          initiatedBy: doctorId,
          initiatedByRole: 'doctor',
          createdAt: new Date().toISOString(),
          activatedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      // Select patient in the prescription draft
      setField('patient.uid', patientUid);
      setField('patient.name', patientFullName);
      setField('patient.email', emailClean);
      setField('patient.phone', newPatientPhone.trim());

      showToast('Paciente creado y seleccionado con éxito.');
      setIsCreatingPatient(false);
      
      setNewPatientFirstName('');
      setNewPatientLastName('');
      setNewPatientEmail('');
      setNewPatientPhone('');
      
    } catch (err) {
      console.error('Error creating patient:', err);
      showToast('Error al registrar paciente.', false);
    } finally {
      setCreatingPatientLoading(false);
    }
  };

  // ── Save draft ─────────────────────────────────────────────────────────────
  const saveDraft = async () => {
    if (rx.items.length === 0) { showToast('Añade al menos un producto o protocolo.', false); return; }
    setSaving(true);
    try {
      const payload = {
        ...rx,
        status:    RX_STATUS.DRAFT,
        markupMargin: Number(markupMargin),
        updatedAt: serverTimestamp(),
        timeline:  [
          ...rx.timeline,
          { event: 'draft_saved', actorId: doctorId, actorRole: 'doctor', note: `Borrador guardado con margen de ${markupMargin}%`, timestamp: new Date().toISOString() },
        ],
      };

      if (savedId) {
        await updateDoc(doc(db, 'prescriptions', savedId), payload);
        await logAction(user?.uid, 'doctor', 'PRESCRIPTION_UPDATE_DRAFT', savedId, { itemsCount: items.length });
        showToast('Borrador guardado.');
      } else {
        const ref = await addDoc(collection(db, 'prescriptions'), {
          ...payload, createdAt: serverTimestamp(),
        });
        setSavedId(ref.id);
        await logAction(user?.uid, 'doctor', 'PRESCRIPTION_CREATE_DRAFT', ref.id, { itemsCount: items.length });
        showToast('Prescripción creada y guardada como borrador.');
      }
      onSaved?.(true);
    } catch (err) {
      console.error('[DoctorPrescriptionBuilder] save error', err);
      showToast('Error al guardar. Inténtalo de nuevo.', false);
    } finally {
      setSaving(false);
    }
  };

  // ── Wholesaler toggle helper ──────────────────────────────────────────────
  const toggleWholesaler = (ws) => {
    setRx(prev => {
      const alreadyIn = prev.wholesalerIds.includes(ws.uid);
      const wsArr     = alreadyIn
        ? prev.wholesalers.filter(w => w.uid !== ws.uid)
        : [...prev.wholesalers, { uid: ws.uid, name: `${ws.firstName||''} ${ws.lastName||''}`.trim(), email: ws.email||'', phone: ws.phone||'' }];
      return {
        ...prev,
        wholesalers:   wsArr,
        wholesalerIds: wsArr.map(w => w.uid),
        // keep legacy delivery field in sync with first selected wholesaler
        delivery: { ...prev.delivery, wholesalerId: wsArr[0]?.uid||'', wholesalerName: wsArr[0]?.name||'', wholesalerEmail: wsArr[0]?.email||'' },
      };
    });
  };

  // ── Send (multi-recipient) ────────────────────────────────────────────────
  const send = () => {
    if (rx.items.length === 0) { showToast('Añade al menos un ítem antes de enviar.', false); return; }

    const hasPatient     = rx.shareWithPatient && (rx.patient.email || rx.patient.uid);
    const hasWholesalers = rx.wholesalerIds.length > 0;
    if (!hasPatient && !hasWholesalers) {
      showToast('Selecciona al menos un destinatario (paciente o wholesaler).', false); return;
    }
    if (rx.shareWithPatient && !rx.patient.email && !rx.patient.uid) {
      showToast('Especifica el paciente (email o registro) antes de enviar.', false); return;
    }

    // Trigger margin configuration modal
    setShowMarginModal(true);
  };

  const confirmAndSend = async () => {
    setShowMarginModal(false);
    setSending(true);
    try {
      const hasPatient     = rx.shareWithPatient && (rx.patient.email || rx.patient.uid);
      const newStatus = hasPatient ? RX_STATUS.SENT : RX_STATUS.ASSIGNED_TO_WS;

      const recipients = [];
      if (hasPatient)     recipients.push('sent_to_patient');
      if (rx.wholesalerIds.length > 0) recipients.push(`sent_via_wholesaler(${rx.wholesalerIds.join(',')})`);

      const event = {
        event: hasPatient && rx.wholesalerIds.length > 0 ? 'sent_to_all'
             : hasPatient ? 'sent_to_patient' : 'sent_via_wholesaler',
        actorId: doctorId, actorRole: 'doctor',
        note: `Compartido con: ${[hasPatient ? rx.patient.name||rx.patient.email : null, ...rx.wholesalers.map(w=>w.name)].filter(Boolean).join(', ')} (Margen: ${markupMargin}%)`,
        timestamp: new Date().toISOString(),
      };

      const payload = {
        ...rx,
        status:       newStatus,
        markupMargin: Number(markupMargin),
        updatedAt:    serverTimestamp(),
        expiresAt:    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        timeline:     [...rx.timeline, event],
      };

      if (savedId) {
        await updateDoc(doc(db, 'prescriptions', savedId), payload);
      } else {
        const ref = await addDoc(collection(db, 'prescriptions'), { ...payload, createdAt: serverTimestamp() });
        setSavedId(ref.id);
      }

      setRx(prev => ({ ...prev, status: newStatus, markupMargin: Number(markupMargin) }));
      const total = (hasPatient ? 1 : 0) + rx.wholesalerIds.length;
      showToast(`✅ Prescripción enviada a ${total} destinatario${total > 1 ? 's' : ''}.`);
      onSaved?.(false);
    } catch (err) {
      console.error('[DoctorPrescriptionBuilder] send error', err);
      showToast('Error al enviar.', false);
    } finally {
      setSending(false);
    }
  };

  const isSent = rx.status !== RX_STATUS.DRAFT;

  // Filter products/protocols for catalog browser
  const filteredCatalogItems = [
    ...catalogProducts.map(p => ({ ...p, typeLabel: p.productType === 'testing' || p.type === 'testing' ? 'Prueba Diagnóstico' : 'Producto' })),
    ...catalogProtocols.map(p => ({ ...p, typeLabel: 'Protocolo' }))
  ].filter(item => {
    if (!catalogSearchQuery) return true;
    const q = catalogSearchQuery.toLowerCase();
    return (
      (item.name || item.displayName || '').toLowerCase().includes(q) ||
      (item.sku || '').toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999,
          padding: '0.75rem 1.25rem', borderRadius: '4px',
          background: toast.ok ? '#0f172a' : '#d93025', color: 'var(--color-bg-surface)',
          fontSize: '0.82rem', fontWeight: 600,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '0.5rem',
          animation: 'rxFadeIn 0.2s ease',
        }}>
          {toast.ok ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: '4px', background: '#e8f0fe',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ClipboardList size={16} color="#1a73e8" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#202124' }}>
              Creador de Prescripciones
            </h2>
            <p style={{ margin: 0, fontSize: '0.72rem', color: '#5f6368' }}>
              {savedId ? `ID Borrador: ${savedId.slice(0, 8)}…` : 'Nueva orden de prescripción'}
            </p>
          </div>
        </div>
        <StatusBadge status={rx.status} />
      </div>

      {/* ── Type selector ── */}

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {[
          { id: RX_TYPE.PATIENT,       label: 'Prescripción Paciente',   icon: User,       color: '#1a73e8' },
          { id: RX_TYPE.CLINIC_SUPPLY, label: 'Suministro de Clínica', icon: Building, color: '#137333' },
        ].map(t => {
          const active = rx.type === t.id;
          return (
            <button key={t.id} onClick={() => setType(t.id)} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
              padding: '0.6rem', borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit',
              border: `1px solid ${active ? t.color : '#dadce0'}`,
              background: active ? `${t.color}0a` : 'var(--color-bg-surface)',
              color: active ? t.color : '#5f6368',
              fontWeight: 600, fontSize: '0.78rem', transition: 'all 0.15s',
            }}>
              <t.icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* --- Stepper UI --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', marginTop: '0.5rem', background: 'var(--color-bg-surface)', padding: '1rem', borderRadius: '8px', border: '1px solid #dadce0', flexWrap: 'wrap', gap: '0.5rem' }}>
        {[
          { step: 1, label: "Origin" },
          { step: 2, label: "Prescription" },
          { step: 3, label: "Logistics" },
          { step: 4, label: "Summary" }
        ].map(s => (
          <div key={s.step} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: currentStep === s.step ? 1 : 0.5, cursor: 'pointer' }} onClick={() => setCurrentStep(s.step)}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: currentStep === s.step ? '#1a73e8' : 'var(--color-border)', color: currentStep === s.step ? 'var(--color-bg-surface)' : 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>
              {s.step}
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: currentStep === s.step ? 600 : 500, color: currentStep === s.step ? '#1a73e8' : 'var(--color-text-secondary)' }}>{s.label}</span>
          </div>
        ))}
      </div>


      {currentStep === 1 && (
        <div className="gcp-card" style={{ marginBottom: '1rem', border: '1.5px dashed #cbd5e1', background: 'var(--color-bg-app)' }}>
          <div className="gcp-header" style={{ color: '#0f172a' }}>📷 Scan Prescription (OCR)</div>
          <p style={{ fontSize: '0.75rem', color: '#5f6368', marginBottom: '1rem' }}>
            If you have a handwritten or printed prescription, upload it here. The system will attempt to auto-fill patient data and medications.
          </p>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <label style={{ cursor: 'pointer' }} className="gcp-btn-secondary">
              <UploadCloud size={14} /> Select File
              <input type="file" style={{ display: 'none' }} accept="image/*,.pdf" onChange={(e) => {
                if(e.target.files && e.target.files[0]) {
                  setOcrFile(e.target.files[0]);
                  setIsUploadingOcr(true);
                  // Mock OCR processing
                  setTimeout(() => setIsUploadingOcr(false), 2000);
                }
              }} />
            </label>
            {ocrFile && (
              <span style={{ fontSize: '0.8rem', color: 'var(--color-success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                {isUploadingOcr ? <><Loader2 size={14} style={{ animation: 'rxSpin 1s linear infinite' }} /> Analyzing...</> : <><CheckCircle2 size={14} /> File uploaded and processed</>}
              </span>
            )}
          </div>
        </div>
      )}


      {/* ── PATIENT section ── */}
      {rx.type === RX_TYPE.PATIENT && (
        <div className="gcp-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="gcp-header"><User size={14} /> Destinatario / Paciente</div>
            <button 
              onClick={() => setIsCreatingPatient(!isCreatingPatient)}
              style={{
                background: 'none', border: 'none', color: '#1a73e8', fontWeight: 600,
                fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'inherit'
              }}
            >
              {isCreatingPatient ? '← Volver a Selector' : '+ Registrar Nuevo Paciente'}
            </button>
          </div>

          {isCreatingPatient ? (
            <form onSubmit={handleCreatePatient} className="form-grid-2col" style={{ gap: '0.75rem' }}>
              <label className="gcp-label">
                Nombre
                <input required value={newPatientFirstName} onChange={e => setNewPatientFirstName(e.target.value)}
                  placeholder="Ej: Juan" className="gcp-input" />
              </label>
              <label className="gcp-label">
                Apellido
                <input required value={newPatientLastName} onChange={e => setNewPatientLastName(e.target.value)}
                  placeholder="Ej: Pérez" className="gcp-input" />
              </label>
              <label className="gcp-label">
                Email (ID del usuario)
                <input required type="email" value={newPatientEmail} onChange={e => setNewPatientEmail(e.target.value)}
                  placeholder="juan.perez@ejemplo.com" className="gcp-input" />
              </label>
              <label className="gcp-label">
                Teléfono / WhatsApp
                <input value={newPatientPhone} onChange={e => setNewPatientPhone(e.target.value)}
                  placeholder="+34 600 000 000" className="gcp-input" />
              </label>
              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
                <button type="button" onClick={() => setIsCreatingPatient(false)} className="gcp-btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={creatingPatientLoading} className="gcp-btn-primary">
                  {creatingPatientLoading && <Loader2 size={12} className="animate-spin" />}
                  Registrar y Seleccionar
                </button>
              </div>
            </form>
          ) : (
            <div className="form-grid-2col" style={{ gap: '0.75rem' }}>
              <label className="gcp-label">
                Seleccionar de tus pacientes
                <select value={rx.patient.uid || ''} onChange={e => {
                  const p = patients.find(pt => pt.uid === e.target.value);
                  if (p) {
                    setField('patient.uid',   p.uid);
                    setField('patient.name',  `${p.firstName||''} ${p.lastName||''}`.trim());
                    setField('patient.email', p.email||'');
                    setField('patient.phone', p.phone||'');
                  } else { setField('patient.uid', ''); }
                }} className="gcp-input">
                  <option value="">— Escribe los datos a continuación —</option>
                  {patients.map(p => (
                    <option key={p.uid} value={p.uid}>
                      {`${p.firstName||''} ${p.lastName||''}`.trim() || p.email}
                    </option>
                  ))}
                </select>
              </label>
              <label className="gcp-label">
                Nombre del paciente
                <input value={rx.patient.name} onChange={e => setField('patient.name', e.target.value)}
                  placeholder="Nombre y Apellidos" className="gcp-input" />
              </label>
              <label className="gcp-label">
                Email
                <input value={rx.patient.email} type="email" onChange={e => setField('patient.email', e.target.value)}
                  placeholder="paciente@correo.com" className="gcp-input" />
              </label>
              <label className="gcp-label">
                Teléfono / WhatsApp
                <input value={rx.patient.phone} onChange={e => setField('patient.phone', e.target.value)}
                  placeholder="+34 600 000 000" className="gcp-input" />
              </label>
            </div>
          )}
        </div>
      )}

      {/* ── DIRECCIÓN DE ENVÍO Y DELEGACIÓN LOGÍSTICA ── */}
      
<div className="gcp-card">
        <div className="gcp-header">📦 Envío y Delegación Logística</div>
        
        <div className="form-grid-2col" style={{ gap: '0.75rem' }}>
          
          {/* Shipping Address Type */}
          <label className="gcp-label">
            Destinatario de Envío
            <select 
              value={rx.shippingAddressType || 'patient'} 
              onChange={e => setRx(p => ({ ...p, shippingAddressType: e.target.value }))}
              className="gcp-input"
            >
              <option value="patient">Dirección del Paciente</option>
              <option value="clinic">Dirección de la Clínica</option>
            </select>
          </label>

          {/* Assistant delegation select */}
          <label className="gcp-label">
            Delegar gestión a Asistente
            <select 
              value={rx.delegatedAssistantId || ''} 
              onChange={e => setRx(p => ({ ...p, delegatedAssistantId: e.target.value }))}
              className="gcp-input"
            >
              <option value="">— Sin delegar —</option>
              {assistantsList.map(ass => (
                <option key={ass.id} value={ass.id}>
                  {ass.firstName} {ass.lastName} ({ass.email})
                </option>
              ))}
            </select>
          </label>

          {/* Inline warning notification if patient address details are missing */}
          {rx.shippingAddressType === 'patient' && (!rx.shippingAddress?.address || !rx.shippingAddress?.city) && (
            <div style={{
              gridColumn: '1 / -1',
              background: 'var(--color-warning-bg)',
              border: '1px solid #fef3c7',
              borderRadius: '6px',
              padding: '0.6rem 0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: '#b45309'
            }}>
              <span>⚠️ El paciente no tiene dirección completa en el borrador actual. ¿Deseas enviar a la Clínica?</span>
              <button 
                type="button"
                onClick={() => setRx(p => ({ ...p, shippingAddressType: 'clinic' }))}
                style={{
                  background: '#f59e0b', color: 'var(--color-bg-surface)', border: 'none', borderRadius: '4px',
                  padding: '0.2rem 0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.7rem'
                }}
              >
                Enviar a Clínica
              </button>
            </div>
          )}

          {/* Address fields if patient shipping is selected */}
          {rx.shippingAddressType === 'patient' && (
            <div className="address-grid-4col" style={{ gridColumn: '1 / -1', gap: '0.5rem', background: 'var(--color-bg-app)', padding: '0.75rem', borderRadius: '6px', border: '1px solid #dadce0' }}>
              <label className="gcp-label">
                Dirección
                <input 
                  value={rx.shippingAddress?.address || ''} 
                  onChange={e => setRx(p => ({ ...p, shippingAddress: { ...(p.shippingAddress || {}), address: e.target.value } }))}
                  placeholder="Calle, número, piso"
                  className="gcp-input"
                />
              </label>
              <label className="gcp-label">
                Ciudad
                <input 
                  value={rx.shippingAddress?.city || ''} 
                  onChange={e => setRx(p => ({ ...p, shippingAddress: { ...(p.shippingAddress || {}), city: e.target.value } }))}
                  placeholder="Ej: Madrid"
                  className="gcp-input"
                />
              </label>
              <label className="gcp-label">
                Cód. Postal
                <input 
                  value={rx.shippingAddress?.zip || ''} 
                  onChange={e => setRx(p => ({ ...p, shippingAddress: { ...(p.shippingAddress || {}), zip: e.target.value } }))}
                  placeholder="28001"
                  className="gcp-input"
                />
              </label>
              <label className="gcp-label">
                País
                <input 
                  value={rx.shippingAddress?.country || 'España'} 
                  onChange={e => setRx(p => ({ ...p, shippingAddress: { ...(p.shippingAddress || {}), country: e.target.value } }))}
                  placeholder="España"
                  className="gcp-input"
                />
              </label>
            </div>
          )}

          {/* Clinic Address confirmation note */}
          {rx.shippingAddressType === 'clinic' && (
            <div style={{
              gridColumn: '1 / -1',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '6px',
              padding: '0.65rem 0.85rem',
              fontSize: '0.75rem',
              color: '#1e40af'
            }}>
              ℹ️ **Envío a Clínica**: Los productos de esta prescripción serán entregados en la dirección física de la clínica médica del doctor supervisor.
            </div>
          )}
        </div>
      </div>

      {/* ── COMPARTIR CON (multi-recipient) ── */}
      <div className="gcp-card">
        <div className="gcp-header">📤 Compartir prescripción con</div>
        <div style={{ fontSize: '0.68rem', color: '#5f6368', marginTop: '-0.25rem' }}>
          El médico decide explícitamente quién recibe esta prescripción. Puede ser paciente, uno o varios wholesalers, o ambos.
        </div>

        {/* Patient toggle */}
        {rx.type === RX_TYPE.PATIENT && (
          <div style={{
            padding: '0.6rem 0.8rem', borderRadius: '4px',
            border: `1px solid ${rx.shareWithPatient ? '#1a73e8' : '#dadce0'}`,
            background: rx.shareWithPatient ? '#e8f0fe30' : 'var(--color-bg-surface)',
            transition: 'all 0.15s', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
          }} onClick={() => setRx(p => ({ ...p, shareWithPatient: !p.shareWithPatient }))}>
            <div style={{
              width: 18, height: 18, borderRadius: '4px', flexShrink: 0,
              border: `2px solid ${rx.shareWithPatient ? '#1a73e8' : 'var(--color-border)'}`,
              background: rx.shareWithPatient ? '#1a73e8' : 'var(--color-bg-surface)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.12s',
            }}>
              {rx.shareWithPatient && <CheckCircle2 size={12} color="var(--color-bg-surface)" strokeWidth={3} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.8rem', color: rx.shareWithPatient ? '#1a73e8' : '#3c4043' }}>
                👤 Compartir con el paciente
              </div>
              <div style={{ fontSize: '0.68rem', color: '#5f6368', marginTop: '0.05rem' }}>
                {rx.shareWithPatient
                  ? (rx.patient.name || rx.patient.email || 'Ver y pagar aparecerá en su perfil')
                  : 'El paciente no verá esta prescripción'}
              </div>
            </div>
          </div>
        )}

        {/* Wholesalers multi-select */}
        <div>
          <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#70757a',
            textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
            🏭 Wholesalers ({rx.wholesalerIds.length} seleccionados)
          </div>
          {wholesalers.length === 0 ? (
            <div style={{ fontSize: '0.75rem', color: '#9aa0a6', fontStyle: 'italic', padding: '0.25rem 0' }}>
              No hay wholesalers registrados en la plataforma.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {wholesalers.map(ws => {
                const selected = rx.wholesalerIds.includes(ws.uid);
                return (
                  <div key={ws.uid} style={{
                    padding: '0.5rem 0.75rem', borderRadius: '4px',
                    border: `1px solid ${selected ? '#6366f1' : '#dadce0'}`,
                    background: selected ? '#6366f108' : 'var(--color-bg-surface)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem',
                    transition: 'all 0.12s',
                  }} onClick={() => toggleWholesaler(ws)}>
                    <div style={{
                      width: 16, height: 16, borderRadius: '3px', flexShrink: 0,
                      border: `2px solid ${selected ? '#6366f1' : 'var(--color-border)'}`,
                      background: selected ? '#6366f1' : 'var(--color-bg-surface)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {selected && <CheckCircle2 size={10} color="var(--color-bg-surface)" strokeWidth={3} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.78rem',
                        color: selected ? '#4338ca' : '#3c4043' }}>
                        {`${ws.firstName||''} ${ws.lastName||''}`.trim() || ws.email}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: '#5f6368' }}>
                        {ws.email}{ws.phone ? ` · ${ws.phone}` : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── RECETAS ANTERIORES DEL HISTORIAL ── */}
      <div className="gcp-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="gcp-header"><Clock size={14} /> Recetas Anteriores y Plantillas del Historial</div>
          <button 
            type="button"
            onClick={() => setShowHistoryPanel(v => !v)}
            style={{
              background: 'none', border: 'none', color: '#1a73e8', fontWeight: 600,
              fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'inherit'
            }}
          >
            {showHistoryPanel ? 'Ocultar Historial' : 'Mostrar Historial (Duplicar)'}
          </button>
        </div>
        
        {showHistoryPanel && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {loadingRecentRx ? (
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textAlign: 'center', padding: '0.5rem' }}>
                Cargando historial de recetas...
              </div>
            ) : recentPrescriptions.length === 0 ? (
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', fontStyle: 'italic', textAlign: 'center', padding: '0.5rem' }}>
                No se encontraron recetas previas para este médico.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '200px', overflowY: 'auto' }}>
                {recentPrescriptions.map(prevRx => (
                  <div key={prevRx.id} className="history-rx-row" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.5rem 0.65rem', border: '1px solid #e2e8f0', borderRadius: '6px',
                    background: 'var(--color-bg-app)', fontSize: '0.75rem', gap: '0.5rem'
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span>📄 {prevRx.patient?.name || prevRx.patient?.email || 'Suministro Clínica'}</span>
                        <span style={{ fontSize: '0.65rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
                          ({prevRx.createdAt ? new Date(prevRx.createdAt.seconds ? prevRx.createdAt.seconds * 1000 : prevRx.createdAt).toLocaleDateString() : '—'})
                        </span>
                      </div>
                      <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.68rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '0.15rem' }}>
                        {prevRx.items?.map(it => `${it.name} (${it.quantity} ${it.unit})`).join(', ')}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (prevRx.items && prevRx.items.length > 0) {
                          prevRx.items.forEach(it => {
                            addItem({
                              ...it,
                              id: it.type === 'supplement_compounding' ? `COMP-${it.format.substring(0, 3).toUpperCase()}-${it.servings || 60}-${Math.floor(1000 + Math.random() * 9000)}` : it.id,
                              sku: it.type === 'supplement_compounding' ? `COMP-${it.format.substring(0, 3).toUpperCase()}-${it.servings || 60}-${Math.floor(1000 + Math.random() * 9000)}` : (it.sku || '')
                            });
                          });
                          if (prevRx.patient && prevRx.type === 'patient') {
                            setField('patient.uid', prevRx.patient.uid || '');
                            setField('patient.name', prevRx.patient.name || '');
                            setField('patient.email', prevRx.patient.email || '');
                            setField('patient.phone', prevRx.patient.phone || '');
                          }
                          if (prevRx.diagnosis) {
                            setRx(prev => ({ ...prev, diagnosis: prevRx.diagnosis }));
                          }
                          showToast('Items de receta anterior cargados en el borrador.');
                        }
                      }}
                      style={{
                        background: '#e8f0fe', color: '#1a73e8', border: 'none', borderRadius: '4px',
                        padding: '0.3rem 0.6rem', fontWeight: 700, fontSize: '0.68rem', cursor: 'pointer',
                        flexShrink: 0
                      }}
                    >
                      Duplicar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Item search + list ── */}
      <div className="gcp-card">
        {/* Toggle between Catalog and Compounding */}
        <div style={{ display: 'flex', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.5rem', marginBottom: '0.75rem', gap: '1rem' }}>
          <button
            type="button"
            onClick={() => setBuilderTab('catalog')}
            style={{
              background: 'none', border: 'none', borderBottom: builderTab === 'catalog' ? '2px solid #1a73e8' : 'none',
              color: builderTab === 'catalog' ? '#1a73e8' : 'var(--color-text-secondary)', fontWeight: 700, fontSize: '0.78rem',
              padding: '0.25rem 0.5rem', cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.15s'
            }}
          >
            📦 Catálogo de Productos y Protocolos
          </button>
          <button
            type="button"
            onClick={() => setBuilderTab('compounding')}
            style={{
              background: 'none', border: 'none', borderBottom: builderTab === 'compounding' ? '2px solid #0d9488' : 'none',
              color: builderTab === 'compounding' ? '#0d9488' : 'var(--color-text-secondary)', fontWeight: 700, fontSize: '0.78rem',
              padding: '0.25rem 0.5rem', cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.15s'
            }}
          >
            🧪 Formulación Magistral (Suplementos)
          </button>
        </div>

        {builderTab === 'compounding' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', background: '#f0fdfa', border: '1px solid #99f6e4', padding: '1rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🔬 Compositor de Fórmulas Magistrales</span>
              <span style={{ fontSize: '0.68rem', color: '#115e59', background: '#ccfbf1', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>Compounding</span>
            </div>

            {/* Presets Plantillas Rápidas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', background: 'var(--color-bg-surface)', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid #ccfbf1' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                💡 Plantillas Populares de Suplementos (Carga Rápida)
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[
                  {
                    name: 'Fórmula Celular Antienvejecimiento',
                    format: 'capsules',
                    excipient: 'cellulose_capsule',
                    servings: 60,
                    instructions: 'Tomar 2 cápsulas al día con el desayuno.',
                    ingredients: [
                      { apiId: 'nmn', dose: '500' },
                      { apiId: 'resveratrol', dose: '250' },
                      { apiId: 'nad_pure', dose: '50' }
                    ]
                  },
                  {
                    name: 'Soporte Cognitivo & Relajación',
                    format: 'capsules',
                    excipient: 'cellulose_capsule',
                    servings: 60,
                    instructions: 'Tomar 2 cápsulas por la noche 30 minutos antes de dormir.',
                    ingredients: [
                      { apiId: 'magnesium_glycinate', dose: '400' },
                      { apiId: 'zinc_picolinate', dose: '15' },
                      { apiId: 'vitamin_b12', dose: '1000' }
                    ]
                  },
                  {
                    name: 'Soporte Inmune & Energía',
                    format: 'powder',
                    excipient: 'flavored_powder_base',
                    servings: 30,
                    instructions: 'Disolver 1 toma (cucharada) en un vaso de agua por la mañana.',
                    ingredients: [
                      { apiId: 'vitamin_c', dose: '1000' },
                      { apiId: 'vitamin_d3', dose: '5000' },
                      { apiId: 'coq10', dose: '100' }
                    ]
                  }
                ].map((tmpl, tIdx) => (
                  <button
                    key={tIdx}
                    type="button"
                    onClick={() => {
                      setCompoundName(tmpl.name);
                      setCompoundFormat(tmpl.format);
                      setCompoundExcipient(tmpl.excipient);
                      setCompoundServings(tmpl.servings);
                      setCompoundInstructions(tmpl.instructions);
                      setCompoundIngredients(tmpl.ingredients);
                      showToast(`Plantilla "${tmpl.name}" cargada.`);
                    }}
                    style={{
                      background: '#e6fffa', color: '#0d9488', border: '1px solid #99f6e4',
                      borderRadius: '4px', padding: '0.3rem 0.5rem', fontSize: '0.68rem',
                      fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#0d9488'; e.currentTarget.style.color = 'var(--color-bg-surface)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#e6fffa'; e.currentTarget.style.color = '#0d9488'; }}
                  >
                    🚀 {tmpl.name}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="compounding-grid">
              <label className="gcp-label">
                Nombre de la Fórmula
                <input 
                  value={compoundName} 
                  onChange={e => setCompoundName(e.target.value)} 
                  placeholder="Ej: Fórmula Celular Antienvejecimiento" 
                  style={{ ...fieldInput, borderColor: '#5eead4' }} 
                />
              </label>
              
              <label className="gcp-label">
                Formato
                <select 
                  value={compoundFormat} 
                  onChange={e => {
                    const fmt = e.target.value;
                    setCompoundFormat(fmt);
                    const compatibleExc = VEHICLES.find(v => v.formats.includes(fmt));
                    if (compatibleExc) setCompoundExcipient(compatibleExc.id);
                    const formatDef = FORMATS.find(f => f.id === fmt);
                    if (formatDef) setCompoundServings(formatDef.defaultServings);
                  }} 
                  style={{ ...fieldInput, borderColor: '#5eead4', cursor: 'pointer' }}
                >
                  {FORMATS.map(f => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
              </label>
              
              <label className="gcp-label">
                Excipiente / Vehículo
                <select 
                  value={compoundExcipient} 
                  onChange={e => setCompoundExcipient(e.target.value)} 
                  style={{ ...fieldInput, borderColor: '#5eead4', cursor: 'pointer' }}
                >
                  {VEHICLES.filter(v => v.formats.includes(compoundFormat)).map(v => (
                    <option key={v.id} value={v.id}>{v.label}</option>
                  ))}
                </select>
              </label>
              
              <label className="gcp-label">
                Cantidad ({compoundFormat === 'capsules' ? 'Cápsulas' : 'Tomas'})
                <input 
                  type="number" 
                  min="1" 
                  value={compoundServings} 
                  onChange={e => setCompoundServings(Number(e.target.value))} 
                  style={{ ...fieldInput, borderColor: '#5eead4' }} 
                />
              </label>
            </div>

            <div style={{ background: 'var(--color-bg-surface)', border: '1px solid #ccfbf1', borderRadius: '6px', padding: '0.75rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #e6fffa', paddingBottom: '0.35rem', marginBottom: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>🧬 Ingredientes Activos de Suplementación (APIs)</span>
                <button
                  type="button"
                  onClick={() => {
                    setCompoundIngredients(p => [...p, { apiId: SUPPLEMENT_APIS[0].id, dose: '' }]);
                  }}
                  style={{
                    background: '#0d9488', color: 'white', border: 'none', borderRadius: '4px',
                    padding: '0.25rem 0.5rem', fontSize: '0.65rem', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  + Añadir Ingrediente
                </button>
              </div>

              {compoundIngredients.length === 0 ? (
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', textAlign: 'center', padding: '1rem', fontStyle: 'italic' }}>
                  Añade ingredientes activos para componer tu suplemento personalizado.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {compoundIngredients.map((ing, idx) => {
                    const selectedApi = SUPPLEMENT_APIS.find(a => a.id === ing.apiId) || SUPPLEMENT_APIS[0];
                    return (
                      <div key={idx} className="ingredients-grid-row">
                        <select
                          value={ing.apiId}
                          onChange={e => {
                            const newIngredients = [...compoundIngredients];
                            newIngredients[idx] = { ...newIngredients[idx], apiId: e.target.value };
                            setCompoundIngredients(newIngredients);
                          }}
                          style={{ ...fieldInput, flex: 2, padding: '0.25rem 0.4rem', fontSize: '0.75rem', cursor: 'pointer' }}
                        >
                          {SUPPLEMENT_APIS.map(api => (
                            <option key={api.id} value={api.id}>{api.name} ({api.category})</option>
                          ))}
                        </select>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1 }}>
                          <input
                            type="number"
                            placeholder="Dosis"
                            value={ing.dose}
                            onChange={e => {
                              const newIngredients = [...compoundIngredients];
                              newIngredients[idx] = { ...newIngredients[idx], dose: e.target.value };
                              setCompoundIngredients(newIngredients);
                            }}
                            style={{ ...fieldInput, width: '100%', padding: '0.25rem 0.4rem', fontSize: '0.75rem' }}
                          />
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-secondary)', minWidth: '30px' }}>
                            {selectedApi.unit}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.68rem', color: 'var(--color-text-secondary)', minWidth: '80px', textAlign: 'right' }}>
                          {(Number(ing.dose || 0) * selectedApi.costPerUnit).toFixed(4)}€ / toma
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setCompoundIngredients(p => p.filter((_, i) => i !== idx));
                          }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fca5a5', padding: '0.25rem' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <label className="gcp-label">
              Pauta de uso sugerida para la fórmula
              <input
                value={compoundInstructions}
                onChange={e => setCompoundInstructions(e.target.value)}
                placeholder="Ej: Tomar 2 cápsulas diarias por la mañana con el desayuno."
                style={{ ...fieldInput, borderColor: '#5eead4' }}
              />
            </label>

            {(() => {
              const format = FORMATS.find(f => f.id === compoundFormat) || FORMATS[0];
              const pricingInfo = calculateCompoundPricing(compoundIngredients, compoundServings, compoundFormat, markupMargin);
              const totalB2B = pricingInfo.b2bCost;
              const totalB2C = pricingInfo.b2cPrice;
              const marginAmt = pricingInfo.markup;

              return (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #ccfbf1', paddingTop: '0.85rem', marginTop: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
                    <div>
                      <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.65rem', display: 'block', fontWeight: 600 }}>COSTO CLÍNICA (B2B)</span>
                      <strong style={{ color: '#0f172a' }}>{totalB2B.toFixed(2)} EUR</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--color-success)', fontSize: '0.65rem', display: 'block', fontWeight: 600 }}>MARGEN MÉDICO ({markupMargin}%)</span>
                      <strong style={{ color: '#0f766e' }}>+{marginAmt.toFixed(2)} EUR</strong>
                    </div>
                    <div>
                      <span style={{ color: '#0d9488', fontSize: '0.65rem', display: 'block', fontWeight: 600 }}>P.V.P. PACIENTE (B2C)</span>
                      <strong style={{ color: '#0d9488', fontSize: '0.82rem' }}>{totalB2C.toFixed(2)} EUR</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!compoundName.trim()) {
                        showToast('Por favor, indica un nombre para la fórmula.', false);
                        return;
                      }
                      if (compoundIngredients.length === 0) {
                        showToast('Por favor, añade al menos un ingrediente activo.', false);
                        return;
                      }
                      if (compoundIngredients.some(ing => !ing.dose || isNaN(Number(ing.dose)) || Number(ing.dose) <= 0)) {
                        showToast('Por favor, indica dosis válidas para todos los ingredientes.', false);
                        return;
                      }

                      const formulaSku = `COMP-${compoundFormat.substring(0, 3).toUpperCase()}-${compoundServings}-${Math.floor(1000 + Math.random() * 9000)}`;
                      const resolvedIngredients = compoundIngredients.map(ing => {
                        const api = SUPPLEMENT_APIS.find(a => a.id === ing.apiId);
                        return {
                          apiId: ing.apiId,
                          name: api.name,
                          dose: ing.dose,
                          unit: api.unit,
                          costPerUnit: api.costPerUnit
                        };
                      });

                      addItem({
                        type: 'supplement_compounding',
                        id: formulaSku,
                        sku: formulaSku,
                        name: compoundName.trim(),
                        format: compoundFormat,
                        excipient: compoundExcipient,
                        quantity: 1,
                        unit: 'fórmula',
                        ingredients: resolvedIngredients,
                        dosage: compoundInstructions || `Tomar según indicación del profesional. (${compoundServings} ${format.unitLabel})`,
                        pricing: {
                          retail: {
                            perUnit: totalB2C,
                            currency: 'EUR'
                          },
                          clinic: {
                            perUnit: totalB2B,
                            currency: 'EUR'
                          }
                        }
                      });

                      setCompoundName('');
                      setCompoundIngredients([]);
                      setCompoundInstructions('');
                      showToast('Fórmula magistral añadida al carrito de prescripción.');
                    }}
                    style={{
                      background: '#0d9488', color: 'white', border: 'none', borderRadius: '4px',
                      padding: '0.45rem 0.9rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#0f766e'}
                    onMouseLeave={e => e.currentTarget.style.background = '#0d9488'}
                  >
                    ➕ Agregar Fórmula a Prescripción
                  </button>
                </div>
              );
            })()}
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="gcp-header"><PackageSearch size={14} /> Productos y Protocolos</div>
              <button 
                onClick={() => setShowCatalogBrowser(!showCatalogBrowser)}
                style={{
                  background: 'none', border: 'none', color: '#1a73e8', fontWeight: 600,
                  fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'inherit'
                }}
              >
                {showCatalogBrowser ? 'Ocultar Catálogo completo' : 'Ver Catálogo completo'}
              </button>
            </div>

            <ProductSearchBar onAdd={addItem} catalogProducts={catalogProducts} catalogProtocols={catalogProtocols} />

            {/* Catalog Panel (Collapsible Grid) */}
            {showCatalogBrowser && (
              <div style={{
                background: '#f8f9fa',
                border: '1px solid #dadce0',
                borderRadius: '4px',
                padding: '0.75rem',
                marginTop: '0.5rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#202124' }}>
                    Catálogo de la Aplicación ({filteredCatalogItems.length} items)
                  </div>
                  <input 
                    value={catalogSearchQuery}
                    onChange={e => setCatalogSearchQuery(e.target.value)}
                    placeholder="Filtrar catálogo..."
                    style={{
                      fontSize: '0.7rem',
                      padding: '0.25rem 0.5rem',
                      border: '1px solid #dadce0',
                      borderRadius: '3px',
                      width: '150px'
                    }}
                  />
                </div>
                {catalogLoading ? (
                  <div style={{ fontSize: '0.75rem', color: '#5f6368', textAlign: 'center', padding: '1rem' }}>
                    Cargando catálogo...
                  </div>
                ) : filteredCatalogItems.length === 0 ? (
                  <div style={{ fontSize: '0.75rem', color: '#9aa0a6', textAlign: 'center', padding: '1rem', fontStyle: 'italic' }}>
                    No se encontraron productos en el catálogo.
                  </div>
                ) : (
                  <div style={{ maxHeight: '600px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff' }}>
                    <CatalogPreviewPanel 
                      catalog={{
                        heroTitle: "Catálogo Clínico Integral",
                        heroSubtitle: "Vademécum interactivo para formulación",
                        sections: [
                          {
                            title: "Tratamientos y Protocolos",
                            products: filteredCatalogItems.filter(i => i.type !== 'protocol').map(i => i.id),
                            protocols: filteredCatalogItems.filter(i => i.type === 'protocol').map(i => i.id)
                          }
                        ]
                      }}
                      products={filteredCatalogItems.filter(i => i.type !== 'protocol')}
                      protocols={filteredCatalogItems.filter(i => i.type === 'protocol')}
                      onAdd={addItem}
                    />
                  </div>
                )}
              </div>
            )}
          
{rx.items.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#5f6368', fontSize: '0.78rem',
            padding: '1.5rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
            <ClipboardList size={24} strokeWidth={1.5} style={{ color: 'var(--color-border)' }} />
            <span>Busca en la barra de arriba o despliega el catálogo para añadir ítems de prescripción (Rx)</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
            {rx.items.map((item, i) => (
              <PrescriptionItemRow key={i} item={item} index={i}
                onChange={updateItem} onRemove={removeItem}
                onAddTest={addItem} catalogProducts={catalogProducts} />
            ))}
            <div style={{ textAlign: 'right', fontSize: '0.72rem', fontWeight: 600, color: '#5f6368', marginTop: '0.25rem' }}>
              {rx.items.length} items agregados
            </div>
          </div>
        )}
      </>
    )}
  </div>
      
      {currentStep === 4 && (
      <>
{/* ── LIVE PRICING ESTIMATION PANEL ── */}
      {rx.items.length > 0 && (
        <div className="gcp-card" style={{ border: "1.5px solid #cbd5e1", background: "var(--color-bg-app)" }}>
          <div className="gcp-header">📊 Resumen de Precios y Margen Clínico</div>
          {(() => {
            let totalClinic = 0;
            let hasPricing = false;
            let hasCompounding = false;
            
            rx.items.forEach(item => {
              if (item.type === 'supplement_compounding') {
                hasCompounding = true;
              }
              if (item.pricing) {
                const clinicVal = resolveVariantPrice({ pricing: item.pricing }, { tier: 'clinic' });
                if (clinicVal?.perUnit) {
                  totalClinic += clinicVal.perUnit * (item.quantity || 1);
                  hasPricing = true;
                }
              }
            });
            
            if (!hasPricing && !hasCompounding) {
              return (
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', fontStyle: 'italic', textAlign: 'center' }}>
                  Añade productos con precio para ver la estimación de costes.
                </div>
              );
            }

            if (!hasPricing && hasCompounding) {
              return (
                <div style={{ fontSize: '0.75rem', color: '#0f766e', background: '#f0fdfa', border: '1px solid #99f6e4', padding: '0.85rem', borderRadius: '8px', textAlign: 'center', fontWeight: 600 }}>
                  🧪 Tu receta contiene Fórmulas Magistrales puras. <br/>
                  <span style={{ fontSize: '0.68rem', color: '#134e4a', fontWeight: 400 }}>El costo total B2B y el margen B2C sugerido serán calculados y enviados por tu Account Manager una vez se solicite la cotización.</span>
                </div>
              );
            }

            const markupVal = totalClinic * (Number(markupMargin) / 100);
            const totalPatient = totalClinic + markupVal;
            const currency = rx.items.find(i => i.pricing)?.pricing?.clinic?.currency || 'EUR';
            
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {hasCompounding && (
                  <div style={{ fontSize: '0.7rem', color: '#b45309', background: 'var(--color-warning-bg)', border: '1px solid #fde68a', padding: '0.5rem 0.75rem', borderRadius: '6px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <AlertCircle size={14} />
                    <span><strong>Atención:</strong> El total estimado excluye las Fórmulas Magistrales. Su costo se cotizará por separado.</span>
                  </div>
                )}
                {/* Margin Slider */}
                <div style={{ background: 'var(--color-bg-surface)', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#3c4043', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Ajustar Margen Clínico Global
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#0d9488', background: '#f0fdfa', padding: '0.15rem 0.5rem', borderRadius: '4px', border: '1px solid #99f6e4' }}>
                      {markupMargin}%
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input 
                      type="range" 
                      min="0" 
                      max="150" 
                      step="5"
                      value={markupMargin} 
                      onChange={e => setMarkupMargin(Number(e.target.value))}
                      style={{ flex: 1, height: '6px', borderRadius: '3px', accentColor: '#0d9488', cursor: 'pointer' }}
                    />
                    <input 
                      type="number"
                      min="0" 
                      max="150"
                      value={markupMargin}
                      onChange={e => setMarkupMargin(Math.min(150, Math.max(0, Number(e.target.value))))}
                      style={{ width: '60px', padding: '0.25rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-primary)', textAlign: 'center' }}
                    />
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', marginTop: '0.4rem', fontStyle: 'italic' }}>
                    * Ajusta el slider para recalcular el PVP de venta al paciente y tu beneficio clínico.
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', textAlign: 'center' }}>
                  <div style={{ background: 'var(--color-bg-surface)', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.6rem' }}>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.62rem', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>
                      Costo Clínica (B2B)
                    </span>
                    <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{formatPrice(totalClinic, currency)}</strong>
                  </div>
                  <div style={{ background: 'var(--color-bg-surface)', border: '1px solid #ccfbf1', borderRadius: '8px', padding: '0.6rem' }}>
                    <span style={{ color: '#0f766e', fontSize: '0.62rem', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>
                      Tu Margen Médico
                    </span>
                    <strong style={{ color: '#0d9488', fontSize: '0.95rem' }}>+{formatPrice(markupVal, currency)}</strong>
                  </div>
                  <div style={{ background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '8px', padding: '0.6rem' }}>
                    <span style={{ color: '#0f766e', fontSize: '0.62rem', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>
                      Total Paciente (B2C)
                    </span>
                    <strong style={{ color: '#0d9488', fontSize: '1rem' }}>{formatPrice(totalPatient, currency)}</strong>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ── Clinical notes ── */}
      <div className="gcp-card">
        <div className="gcp-header"><Stethoscope size={14} /> Notas clínicas</div>
        <div className="form-grid-2col" style={{ gap: '0.75rem' }}>
          <label className="gcp-label">
            Diagnóstico / Indicación principal
            <input value={rx.diagnosis} onChange={e => setRx(p => ({ ...p, diagnosis: e.target.value }))}
              placeholder="Ej: Recuperación muscular, antienvejecimiento..." className="gcp-input" />
          </label>
          <label style={{ ...fieldLabel, gridColumn: '1 / -1' }}>
            Instrucciones para el paciente / wholesaler
            <textarea value={rx.clinicalNotes}
              onChange={e => setRx(p => ({ ...p, clinicalNotes: e.target.value }))}
              placeholder="Dosis total, pautas de almacenamiento, contraindicaciones..."
              rows={3}
              style={{ ...fieldInput, resize: 'vertical', lineHeight: 1.4 }} />
          </label>
        </div>
      </div>

      
      </>
      )}
{/* ── Navigation Buttons ── */}
      {!isSent && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', background: 'var(--color-bg-surface)', padding: '1rem', borderRadius: '8px', border: '1px solid #dadce0', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            {currentStep > 1 && (
              <button onClick={() => setCurrentStep(s => s - 1)} className="gcp-btn-secondary">
                ← Previous
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button onClick={saveDraft} disabled={saving} className="gcp-btn-secondary">
              {saving ? <Loader2 size={14} style={{ animation: 'rxSpin 1s linear infinite' }} /> : <Save size={14} />}
              Save Draft
            </button>
            {currentStep < 4 ? (
              <button onClick={() => setCurrentStep(s => s + 1)} className="gcp-btn-primary">
                Next →
              </button>
            ) : (
              <button onClick={send} disabled={sending} className="gcp-btn-primary">
                {sending ? <Loader2 size={14} style={{ animation: 'rxSpin 1s linear infinite' }} /> : <Send size={14} />}
                {rx.items.some(i => i.type === 'supplement_compounding') ? "Request Quote" : "Send Prescription"}
              </button>
            )}
          </div>
        </div>
      )}
{isSent && (
        <ShareConfirmation
          rxId={savedId}
          rx={rx}
          onNewPrescription={() => {
            setRx({
              ...newRxDraft(doctorId, doctorName, doctorEmail),
              shippingAddressType: 'patient',
              shippingAddress: { address: '', city: '', zip: '', country: '' },
              delegatedAssistantId: '',
              kitStatus: 'none',
            });
            setSavedId(null);
          }}
          onClose={() => onSaved?.(true)}
        />
      )}

      {showMarginModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'var(--color-bg-surface)', borderRadius: '4px', width: '100%', maxWidth: '440px', padding: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', border: '1px solid #dadce0' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#202124', margin: '0 0 0.5rem' }}>Configuración de Margen Clínico (Rx)</h3>
            <p style={{ fontSize: '0.75rem', color: '#5f6368', margin: '0 0 1rem', lineHeight: 1.4 }}>
              Configura el porcentaje de margen que deseas aplicar sobre el precio clínico para este pedido de prescripción.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#202124', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                  Porcentaje de Margen (%)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={markupMargin}
                    onChange={e => setMarkupMargin(e.target.value)}
                    style={{ width: '100px', background: 'var(--color-bg-surface)', border: '1px solid #dadce0', borderRadius: '4px', padding: '0.45rem 0.6rem', fontSize: '0.8rem', color: '#202124', outline: 'none', fontFamily: 'inherit' }}
                    onFocus={(e) => e.target.style.borderColor = '#1a73e8'}
                    onBlur={(e) => e.target.style.borderColor = '#dadce0'}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3c4043' }}>%</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#5f6368', marginTop: '0.35rem', fontStyle: 'italic' }}>
                  * Este margen se aplica sobre el precio clínico y no incluye el costo de envío (shipping).
                </div>
              </div>

              {/* Estimate preview */}
              {rx.items.length > 0 && (
                <div style={{ background: '#f8f9fa', border: '1px solid #dadce0', borderRadius: '4px', padding: '0.6rem 0.8rem', fontSize: '0.75rem' }}>
                  <div style={{ fontWeight: 700, color: '#202124', borderBottom: '1px solid #e0e0e0', paddingBottom: '0.3rem', marginBottom: '0.4rem', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.04em' }}>
                    Estimación del Pedido
                  </div>
                  {(() => {
                    let totalClinic = 0;
                    let hasPricing = false;
                    
                    rx.items.forEach(item => {
                      if (item.pricing) {
                        const clinicVal = resolveVariantPrice({ pricing: item.pricing }, { tier: 'clinic' });
                        if (clinicVal?.perUnit) {
                          totalClinic += clinicVal.perUnit * (item.quantity || 1);
                          hasPricing = true;
                        }
                      }
                    });

                    if (!hasPricing) {
                      return <span style={{ color: '#70757a', fontStyle: 'italic' }}>Precio no resuelto para los ítems</span>;
                    }

                    const markupVal = totalClinic * (Number(markupMargin) / 100);
                    const totalPatient = totalClinic + markupVal;
                    const currency = rx.items[0]?.pricing?.clinic?.currency || 'EUR';

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#5f6368' }}>Total Clínica (Base B2B):</span>
                          <strong>{formatPrice(totalClinic, currency)}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)' }}>
                          <span>Margen Médico ({markupMargin}%):</span>
                          <strong>+{formatPrice(markupVal, currency)}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e0e0e0', paddingTop: '0.25rem', marginTop: '0.25rem', fontSize: '0.8rem', fontWeight: 700 }}>
                          <span style={{ color: '#202124' }}>Total Estimado Paciente:</span>
                          <span style={{ color: '#1a73e8' }}>{formatPrice(totalPatient, currency)}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowMarginModal(false)} className="gcp-btn-secondary">
                Cancelar
              </button>
              <button type="button" onClick={confirmAndSend} className="gcp-btn-primary">
                Confirmar y Enviar
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes rxSpin    { to { transform: rotate(360deg); } }
        @keyframes rxFadeIn  { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes rxSlideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        
        .form-grid-2col {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        .address-grid-4col {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
        }
        .compounding-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 0.65rem;
        }
        .ingredients-grid-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .history-rx-row {
          transition: all 0.15s ease;
        }
        .history-rx-row:hover {
          background: #f1f5f9 !important;
          border-color: #cbd5e1 !important;
        }
        
        @media (max-width: 768px) {
          .form-grid-2col {
            grid-template-columns: 1fr !important;
          }
          .address-grid-4col {
            grid-template-columns: 1fr !important;
          }
          .compounding-grid {
            grid-template-columns: 1fr !important;
          }
          .ingredients-grid-row {
            flex-direction: column !important;
            align-items: stretch !important;
            background: #ffffff;
            padding: 0.75rem;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            position: relative;
          }
          .ingredients-grid-row > button {
            align-self: flex-end;
            margin-top: 0.25rem;
          }
        }
      `}</style>
    </div>
  );
}

// ── Share Confirmation Card ────────────────────────────────────────────────────
function ShareConfirmation({ rxId, rx, onNewPrescription }) {
  const [copied, setCopied] = useState(false);

  const rxUrl = rxId
    ? `${window.location.origin}/rx/${rxId}`
    : null;

  const patientName = rx.patient?.name || rx.patient?.email || 'el paciente';
  const itemCount   = rx.items?.length || 0;
  const itemList    = (rx.items || []).slice(0, 3).map(i => i.name).join(', ');

  const copyLink = async () => {
    if (!rxUrl) return;
    try {
      await navigator.clipboard.writeText(rxUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = rxUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const waMsg = encodeURIComponent(
    `Hola ${patientName},\n\nTe he enviado una prescripción médica con ${itemCount} ítem${itemCount !== 1 ? 's' : ''} (${itemList}${itemCount > 3 ? '…' : ''}).\n\nPuedes verla y realizar el pago directamente desde:\n${rxUrl || '(plataforma)'}\n\nCualquier duda, con gusto te atiendo.`
  );
  const emailSubject = encodeURIComponent(`Tu prescripción médica — ${itemCount} ítem${itemCount !== 1 ? 's' : ''}`);
  const emailBody = encodeURIComponent(
    `Hola ${patientName},\n\nTe adjunto el enlace a tu prescripción médica.\n\nProductos/Protocolos: ${itemList}${itemCount > 3 ? '...' : ''}\n\nAccede y realiza el pago aquí:\n${rxUrl || '(plataforma)'}\n\nSaludos,\n${rx.doctorName || 'Tu médico'}`
  );

  return (
    <div style={{
      borderRadius: '18px', overflow: 'hidden',
      border: '1.5px solid rgba(16,185,129,0.25)',
      boxShadow: '0 8px 32px rgba(16,185,129,0.12)',
      animation: 'rxSlideUp 0.3s ease',
    }}>
      {/* Green header */}
      <div style={{
        background: 'linear-gradient(135deg, #065f46, #047857)',
        padding: '1.25rem 1.5rem',
        display: 'flex', alignItems: 'center', gap: '0.85rem',
      }}>
        <div style={{ width: 44, height: 44, borderRadius: '12px',
          background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle2 size={22} color="var(--color-bg-surface)" />
        </div>
        <div>
          <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--color-bg-surface)', letterSpacing: '-0.01em' }}>
            Prescripción enviada ✅
          </div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.1rem' }}>
            {rx.delivery?.method === 'via_wholesaler'
              ? `Asignada al wholesaler ${rx.delivery.wholesalerName || ''}. El paciente será contactado.`
              : `${patientName} puede verla y pagar desde su perfil ahora mismo.`}
          </div>
        </div>
      </div>

      {/* Share options */}
      <div style={{ background: 'var(--color-bg-surface)', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Rx link */}
        {rxUrl && (
          <div>
            <div style={{ fontSize: '0.63rem', fontWeight: 800, color: 'var(--color-text-tertiary)',
              textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.4rem' }}>
              🔗 Enlace directo a la prescripción
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.65rem 0.9rem', borderRadius: '10px',
              border: '1px solid #e2e8f0', background: 'var(--color-bg-app)' }}>
              <span style={{ flex: 1, fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {rxUrl}
              </span>
              <button onClick={copyLink} style={{
                padding: '0.35rem 0.75rem', borderRadius: '7px', flexShrink: 0,
                border: 'none', background: copied ? 'var(--color-success)' : 'var(--color-primary)',
                color: 'var(--color-bg-surface)', fontWeight: 800, fontSize: '0.72rem', cursor: 'pointer',
                fontFamily: 'inherit', transition: 'background 0.2s',
              }}>
                {copied ? '✓ Copiado' : 'Copiar'}
              </button>
            </div>
          </div>
        )}

        {/* Share buttons */}
        <div>
          <div style={{ fontSize: '0.63rem', fontWeight: 800, color: 'var(--color-text-tertiary)',
            textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>
            Compartir con el paciente
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            {/* WhatsApp */}
            <a href={`https://wa.me/?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.6rem 1.1rem', borderRadius: '10px',
                background: '#25d366', color: 'var(--color-bg-surface)',
                fontWeight: 800, fontSize: '0.78rem', textDecoration: 'none',
                boxShadow: '0 3px 10px rgba(37,211,102,0.3)', transition: 'all 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <span style={{ fontSize: '1rem' }}>💬</span> WhatsApp
            </a>

            {/* Email */}
            <a href={`mailto:${rx.patient?.email || ''}?subject=${emailSubject}&body=${emailBody}`}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.6rem 1.1rem', borderRadius: '10px',
                background: 'var(--color-bg-app)', color: 'var(--color-text-secondary)',
                border: '1px solid #e2e8f0', fontWeight: 800, fontSize: '0.78rem',
                textDecoration: 'none', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-bg-app)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <span style={{ fontSize: '1rem' }}>✉️</span> Email
            </a>

            {/* Copy summary */}
            <button onClick={() => {
              const summary = `Prescripción médica — ${rx.doctorName || 'Tu médico'}\n\nPaciente: ${patientName}\nProductos: ${(rx.items || []).map(i => `• ${i.name} × ${i.quantity} ${i.unit}`).join('\n')}\n${rx.diagnosis ? `\nDiagnóstico: ${rx.diagnosis}` : ''}\n${rx.clinicalNotes ? `\nNotas: ${rx.clinicalNotes}` : ''}\n\nVer y pagar: ${rxUrl || '(plataforma)'}`;
              navigator.clipboard.writeText(summary).catch(() => {});
              setCopied(true);
              setTimeout(() => setCopied(false), 2500);
            }} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.6rem 1.1rem', borderRadius: '10px',
              background: 'var(--color-bg-app)', color: 'var(--color-text-secondary)',
              border: '1px solid #e2e8f0', fontWeight: 800, fontSize: '0.78rem',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-bg-app)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <span style={{ fontSize: '1rem' }}>📋</span> Copiar resumen
            </button>
          </div>
        </div>

        {/* Rx summary chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', padding: '0.75rem',
          borderRadius: '10px', background: 'var(--color-bg-app)', border: '1px solid #f1f5f9' }}>
          {(rx.items || []).map((item, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              padding: '0.2rem 0.65rem', borderRadius: '999px',
              background: item.type === 'protocol' ? 'rgba(139,92,246,0.08)' : 'rgba(0,54,102,0.07)',
              color: item.type === 'protocol' ? '#7c3aed' : 'var(--color-primary)',
              fontSize: '0.68rem', fontWeight: 700 }}>
              {item.type === 'protocol' ? '🧬' : '💊'}
              {item.name} · {item.quantity} {item.unit}
            </span>
          ))}
        </div>

        {/* New Rx button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.25rem' }}>
          <button onClick={onNewPrescription} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.65rem 1.25rem', borderRadius: '10px',
            border: '1.5px solid #e2e8f0', background: 'var(--color-bg-surface)',
            cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem',
            color: 'var(--color-text-secondary)', fontFamily: 'inherit', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}>
            <Plus size={13} /> Nueva prescripción
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Card shell style ──────────────────────────────────────────────────────────
const card = {
  background: 'var(--color-bg-surface)', borderRadius: '4px', border: '1px solid #cbd5e1',
  padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem',
};
const sectionHeader = {
  display: 'flex', alignItems: 'center', gap: '0.4rem',
  fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-text-secondary)',
  textTransform: 'uppercase', letterSpacing: '0.07em',
};
