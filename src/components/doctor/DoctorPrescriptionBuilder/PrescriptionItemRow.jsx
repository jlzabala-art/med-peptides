"use client";

import React, { useState } from 'react';
import ClipboardList from "lucide-react/dist/esm/icons/clipboard-list";
import Plus from "lucide-react/dist/esm/icons/plus";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import PackageSearch from "lucide-react/dist/esm/icons/package-search";
import { ITEM_UNITS, FREQUENCIES, DURATIONS } from '../../../config/prescriptionConfig';
import { resolveVariantPrice, formatPrice } from '../../../utils/resolvePrice';

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

export default 
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
