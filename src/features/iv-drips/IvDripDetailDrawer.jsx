"use client";
/**
 * IvDripDetailDrawer.jsx
 * Drawer lateral con detalle completo de un vial IV Drip
 */
import React from 'react';
import { X, FlaskConical, Package, DollarSign, AlertTriangle, CheckCircle, Copy } from '@/lib/icons';

function copyToClipboard(text) {
  navigator.clipboard?.writeText(text);
}

export default function IvDripDetailDrawer({ vial, ingredientMap = {}, onClose }) {
  if (!vial) return null;

  const hasOptional  = vial.optional_separate_vials?.length > 0;
  const needsReview  = vial.optional_separate_vials?.some(o => o.requires_review);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)', zIndex: 1000 }}
      />
      {/* Drawer */}
      <div style={{
        position: 'fixed', right: 0, top: 0, bottom: 0, width: 520, maxWidth: '96vw',
        background: '#fff', zIndex: 1001, overflowY: 'auto', boxShadow: '-10px 0 40px rgba(0,0,0,0.12)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#003666' }}>
          <div>
            <div style={{ fontSize: 11, color: '#93c5fd', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>IV Drip Vial</div>
            <h2 style={{ margin: 0, fontSize: 18, color: '#fff', fontWeight: 700 }}>{vial.commercial_names?.[0] || vial.vial_id}</h2>
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              <code
                onClick={() => copyToClipboard(vial.sku)}
                title="Click to copy"
                style={{ fontSize: 11, background: 'rgba(255,255,255,0.15)', color: '#e0f2fe', padding: '2px 8px', borderRadius: 4, cursor: 'pointer' }}
              >
                {vial.sku} <Copy size={10} />
              </code>
              {vial.volume_ml && <span style={{ fontSize: 11, color: '#93c5fd' }}>{vial.volume_ml} mL</span>}
              <span style={{ fontSize: 11, color: vial.type === 'customized' ? '#fbbf24' : '#86efac' }}>
                {vial.type === 'customized' ? '⚙️ Custom' : '✓ Standard'}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', padding: 8, cursor: 'pointer', color: '#fff', lineHeight: 0 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Commercial Names / Aliases */}
          {vial.commercial_names?.length > 1 && (
            <section>
              <h3 style={sectionTitle}>Presentaciones comerciales</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {vial.commercial_names.map((name, i) => (
                  <div key={i} style={{ fontSize: 13, color: '#0f172a', padding: '6px 10px', background: '#f8fafc', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Package size={13} style={{ color: '#64748b' }} /> {name}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Ingredients */}
          <section>
            <h3 style={sectionTitle}>Ingredientes ({vial.ingredients?.length || 0})</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  <th style={th}>Ingrediente</th>
                  <th style={{ ...th, textAlign: 'right' }}>Cantidad</th>
                  <th style={{ ...th, textAlign: 'right' }}>Unidad</th>
                </tr>
              </thead>
              <tbody>
                {(vial.ingredients || []).map((ing, i) => {
                  const master = ingredientMap[ing.ingredient_id];
                  return (
                    <tr key={ing.ingredient_id} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={{ ...td }}>
                        <div style={{ fontWeight: 500, color: '#0f172a' }}>{master?.name || ing.ingredient_id}</div>
                        {master?.common_name && <div style={{ fontSize: 11, color: '#94a3b8' }}>{master.common_name}</div>}
                        {ing.requires_review && <div style={{ fontSize: 10, color: '#d97706' }}>⚠️ Requiere revisión</div>}
                      </td>
                      <td style={{ ...td, textAlign: 'right', fontFamily: 'monospace', color: '#475569' }}>
                        {ing.quantity ?? '—'}
                      </td>
                      <td style={{ ...td, textAlign: 'right', color: '#64748b' }}>{ing.unit || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          {/* Optional Add-ons */}
          {hasOptional && (
            <section>
              <h3 style={{ ...sectionTitle, color: '#d97706' }}>
                Add-ons Opcionales — Vial Separado
                {needsReview && <span style={{ fontSize: 11, color: '#ef4444', marginLeft: 8 }}>⚠️ Revisar</span>}
              </h3>
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: 12 }}>
                {vial.optional_separate_vials.map(opt => {
                  const master = ingredientMap[opt.ingredient_id];
                  return (
                    <div key={opt.ingredient_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '6px 0', borderBottom: '1px solid #fde68a' }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 500, color: '#92400e' }}>{master?.name || opt.ingredient_id}</div>
                        {opt.applies_to && <div style={{ fontSize: 11, color: '#b45309' }}>Aplica a: {opt.applies_to.join(', ')}</div>}
                        {opt.note && <div style={{ fontSize: 11, color: '#d97706', fontStyle: 'italic' }}>{opt.note}</div>}
                        {opt.requires_specific_prescription && <div style={{ fontSize: 10, color: '#dc2626' }}>⚕️ Requiere Rx específica</div>}
                      </div>
                      <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#92400e' }}>
                        {opt.requires_review ? '⚠️ sin dosis' : `${opt.quantity} ${opt.unit}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Administration */}
          <section>
            <h3 style={sectionTitle}>Administración</h3>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: 12, fontSize: 12, color: '#166534' }}>
              <div><strong>Vía:</strong> {vial.administration?.route || 'Intravenous'}</div>
              <div style={{ marginTop: 6 }}><strong>Instrucción:</strong> {vial.administration?.instruction}</div>
              <div style={{ marginTop: 6 }}><strong>Dilución en:</strong> {vial.administration?.compatible_fluid_options?.join(', ')}</div>
              <div style={{ marginTop: 6 }}><strong>Consumibles:</strong> {vial.administration?.consumables?.join(', ')}</div>
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                {vial.administration?.requires_prescription && (
                  <span style={{ fontSize: 10, background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: 20 }}>✓ Requiere Rx</span>
                )}
                {vial.administration?.requires_physician_approval && (
                  <span style={{ fontSize: 10, background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: 20 }}>✓ Aprobación médica</span>
                )}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section>
            <h3 style={sectionTitle}>Pricing</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <PriceCard label="Precio clínica" value={`AED ${vial.pricing?.clinic_price_aed}`} color="#16a34a" />
              <PriceCard label="Coste interno" value={`AED ${vial.pricing?.internal_cost_aed}`} color="#dc2626" note="Solo Admin" />
              <PriceCard label="Beneficio bruto" value={`AED ${vial.pricing?.gross_profit_aed}`} color="#2563eb" />
              <PriceCard label="Margen" value={`${vial.pricing?.gross_margin_percent}%`} color="#7c3aed" />
            </div>
          </section>

          {/* Disclaimer */}
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: 10, fontSize: 11, color: '#991b1b' }}>
            ⚕️ {vial.disclaimer}
          </div>

          {/* Notes */}
          {vial.notes && (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, fontSize: 12, color: '#475569', fontStyle: 'italic' }}>
              {vial.notes}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => {
              const quoteItem = {
                productId: vial.id || vial.sku || `iv_${Date.now()}`,
                name: vial.name || 'IV Formulation',
                dosage: vial.specs?.volume || 'IV Infusion',
                unitPrice: Number(vial.pricing?.clinic_aed || vial.pricing?.retail_aed || 0),
                supplierCost: Number(vial.pricing?.internal_cost_aed || 0),
                quantity: 1,
                category: 'IV Drips',
                pricing: {
                  retail: { perUnit: Number(vial.pricing?.retail_aed || 0) },
                  clinic: { perUnit: Number(vial.pricing?.clinic_aed || 0) },
                  wholesale: { perUnit: Number(vial.pricing?.wholesale_aed || vial.pricing?.clinic_aed || 0) },
                  cost: { perUnit: Number(vial.pricing?.internal_cost_aed || 0) }
                }
              };
              window.dispatchEvent(new CustomEvent('open-quotation-wizard', {
                detail: {
                  type: 'manual',
                  recipientType: 'clinic',
                  source: 'iv_drips',
                  items: [quoteItem],
                  initialItem: quoteItem
                }
              }));
              onClose?.();
            }}
            style={{ flex: 1, background: '#003666', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            + Crear Cotización
          </button>
          <button
            type="button"
            onClick={() => {
              onClose?.();
            }}
            style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, padding: '10px 16px', fontSize: 13, cursor: 'pointer' }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </>
  );
}

const sectionTitle = { fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px' };
const th = { padding: '8px 6px', textAlign: 'left', fontSize: 11, color: '#64748b', fontWeight: 600, borderBottom: '1px solid #e2e8f0' };
const td = { padding: '8px 6px', fontSize: 12 };

function PriceCard({ label, value, color, note }) {
  return (
    <div style={{ background: `${color}08`, border: `1px solid ${color}25`, borderRadius: 8, padding: '10px 12px' }}>
      <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label} {note && <span style={{ color: '#94a3b8' }}>({note})</span>}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color, marginTop: 2 }}>{value}</div>
    </div>
  );
}
