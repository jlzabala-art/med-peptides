'use client';

import React, { useState } from 'react';
import { 
  DollarSign, TrendingUp, ShieldCheck, CreditCard, Percent, 
  ArrowUpRight, RefreshCw, Edit2, Check, X, Sparkles 
} from 'lucide-react';
import CopyableId from '../../ui/CopyableId';
import DataTable from '../../ui/DataTable';
import AlgoliaProductSwitcherModal from '../modals/AlgoliaProductSwitcherModal';
import { updateQuotation } from '../../../repositories/quotationRepository';
import notifier from '../../../services/NotificationService';
import { triggerHaptic } from '../../../utils/haptics';

export default function PricingTab({ quotation, quotationId }) {
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingMarginIndex, setEditingMarginIndex] = useState(null);
  const [customMarginInput, setCustomMarginInput] = useState('');
  const [saving, setSaving] = useState(false);

  if (!quotation) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
        No pricing details available.
      </div>
    );
  }

  const currentId = quotationId || quotation.id;
  const items = Array.isArray(quotation.items) ? quotation.items : [];
  const currency = quotation.currency || 'USD';
  const currencySymbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';

  let subtotal = 0;
  let totalCost = 0;

  items.forEach(it => {
    const qty = Number(it.quantity || 1);
    const rate = Number(it.unitPrice || it.unitRate || it.price || 0);
    const cost = Number(it.supplierCost || rate * 0.55);
    subtotal += rate * qty;
    totalCost += cost * qty;
  });

  const taxTotal = quotation.taxTotal !== undefined ? Number(quotation.taxTotal) : Math.round(subtotal * 0.05 * 100) / 100;
  const grandTotal = quotation.grandTotal !== undefined && Number(quotation.grandTotal) > 0
    ? Number(quotation.grandTotal)
    : Math.round((subtotal + taxTotal) * 100) / 100;

  const grossProfit = subtotal - totalCost;
  const marginPercent = subtotal > 0
    ? Math.round((grossProfit / subtotal) * 1000) / 10
    : Number(quotation.marginPercent || 0);

  const tier = (quotation.tier || quotation.tierLevel || quotation.priceTier || 'cost').toUpperCase();
  const paymentTerms = (quotation.paymentTerms || 'due_on_receipt').replace(/_/g, ' ').toUpperCase();

  // ── Global Margin Change Handler ──────────────────────────────────────────
  const handleApplyGlobalMargin = async (newMarginPct) => {
    if (!currentId) return;
    setSaving(true);
    triggerHaptic('impactMedium');

    try {
      const marginDecimal = Number(newMarginPct) / 100;
      let newSubtotal = 0;

      const updatedItems = items.map(it => {
        const qty = Number(it.quantity || 1);
        const cost = Number(it.supplierCost || 0) || (Number(it.unitPrice || it.price || 0) * 0.55);
        // unitPrice = cost / (1 - marginDecimal)
        const newRate = cost > 0 && marginDecimal < 1
          ? Math.round((cost / (1 - marginDecimal)) * 100) / 100
          : Number(it.unitPrice || it.price || 0);
        
        newSubtotal += newRate * qty;
        return {
          ...it,
          unitPrice: newRate,
          unitRate: newRate,
          margin: Number(newMarginPct)
        };
      });

      const newTax = Math.round(newSubtotal * 0.05 * 100) / 100;
      const newGrandTotal = Math.round((newSubtotal + newTax) * 100) / 100;

      const payload = {
        items: updatedItems,
        marginPercent: Number(newMarginPct),
        subtotal: newSubtotal,
        taxTotal: newTax,
        grandTotal: newGrandTotal,
        totalAmount: newGrandTotal
      };

      await updateQuotation(currentId, payload);
      window.dispatchEvent(new CustomEvent('quotation-updated', { detail: payload }));
      notifier.success(`Margen global actualizado al ${newMarginPct}%`);
    } catch (err) {
      notifier.error(`Error actualizando margen: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // ── Line-Item Margin Change Handler ───────────────────────────────────────
  const handleApplyItemMargin = async (index, newMarginPct) => {
    if (!currentId || index == null) return;
    setSaving(true);
    triggerHaptic('select');

    try {
      const marginDecimal = Number(newMarginPct) / 100;
      const updatedItems = [...items];
      const target = updatedItems[index];
      const cost = Number(target.supplierCost || 0) || (Number(target.unitPrice || target.price || 0) * 0.55);
      const newRate = cost > 0 && marginDecimal < 1
        ? Math.round((cost / (1 - marginDecimal)) * 100) / 100
        : Number(target.unitPrice || target.price || 0);

      updatedItems[index] = {
        ...target,
        unitPrice: newRate,
        unitRate: newRate,
        margin: Number(newMarginPct)
      };

      let newSubtotal = 0;
      updatedItems.forEach(it => {
        newSubtotal += Number(it.unitPrice || it.price || 0) * Number(it.quantity || 1);
      });
      const newTax = Math.round(newSubtotal * 0.05 * 100) / 100;
      const newGrandTotal = Math.round((newSubtotal + newTax) * 100) / 100;

      const payload = {
        items: updatedItems,
        subtotal: newSubtotal,
        taxTotal: newTax,
        grandTotal: newGrandTotal,
        totalAmount: newGrandTotal
      };

      await updateQuotation(currentId, payload);
      window.dispatchEvent(new CustomEvent('quotation-updated', { detail: payload }));
      notifier.success(`Margen de ${target.name || 'ítem'} actualizado al ${newMarginPct}%`);
      setEditingMarginIndex(null);
    } catch (err) {
      notifier.error(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // ── Product Switcher Handler (Algolia Replacement) ────────────────────────
  const handleOpenSwitcher = (index) => {
    setEditingIndex(index);
    setSwitcherOpen(true);
  };

  const handleSelectProduct = async (newProduct) => {
    if (editingIndex == null || !currentId) return;
    setSaving(true);
    triggerHaptic('impactHeavy');

    try {
      const updatedItems = [...items];
      const prev = updatedItems[editingIndex];
      const newCost = Number(newProduct.supplierCost || newProduct.basePrice || newProduct.masterPrice || prev.supplierCost || 25);
      const currentMarginDecimal = Number(prev.margin || marginPercent || 45) / 100;
      const newUnitPrice = Math.round((newCost / (1 - currentMarginDecimal)) * 100) / 100;

      updatedItems[editingIndex] = {
        ...prev,
        productId: newProduct.id || newProduct.objectID || prev.productId,
        name: newProduct.name || newProduct.displayName || prev.name,
        dosage: newProduct.dosage || newProduct.presentation || prev.dosage,
        supplierName: newProduct.supplierName || newProduct.supplier || prev.supplierName,
        supplierId: newProduct.supplierId || prev.supplierId,
        supplierCost: newCost,
        unitPrice: newUnitPrice,
        unitRate: newUnitPrice,
        slug: newProduct.slug || prev.slug,
      };

      let newSubtotal = 0;
      updatedItems.forEach(it => {
        newSubtotal += Number(it.unitPrice || it.price || 0) * Number(it.quantity || 1);
      });
      const newTax = Math.round(newSubtotal * 0.05 * 100) / 100;
      const newGrandTotal = Math.round((newSubtotal + newTax) * 100) / 100;

      const payload = {
        items: updatedItems,
        subtotal: newSubtotal,
        taxTotal: newTax,
        grandTotal: newGrandTotal,
        totalAmount: newGrandTotal,
      };

      await updateQuotation(currentId, payload);
      window.dispatchEvent(new CustomEvent('quotation-updated', { detail: payload }));
      notifier.success(`Producto sustituido con éxito por ${newProduct.name || 'nuevo compuesto'}`);
      setSwitcherOpen(false);
      setEditingIndex(null);
    } catch (err) {
      notifier.error(`Error al sustituir producto: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Header Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Subtotal
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
            {currencySymbol}{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 2 }}>
            {items.length} line items
          </div>
        </div>

        {/* Dynamic Margin Card with 1-Tap Quick Adjuster */}
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <TrendingUp size={12} />
                Margin %
              </span>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#15803d' }}>
                Gross: {currencySymbol}{grossProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#15803d', marginTop: 4 }}>
              {marginPercent}%
            </div>
          </div>

          {/* Quick Margin Pills (0 Friction, 1-Click) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleApplyGlobalMargin(Math.max(10, Math.round(marginPercent - 5)))}
              style={{
                border: '1px solid #bbf7d0',
                background: '#ffffff',
                color: '#15803d',
                borderRadius: 4,
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '2px 6px',
                cursor: 'pointer',
              }}
              title="Disminuir 5%"
            >
              -5%
            </button>
            {[30, 40, 45, 50, 60].map((pct) => (
              <button
                key={pct}
                type="button"
                disabled={saving}
                onClick={() => handleApplyGlobalMargin(pct)}
                style={{
                  border: Math.round(marginPercent) === pct ? '1px solid #15803d' : '1px solid #bbf7d0',
                  background: Math.round(marginPercent) === pct ? '#15803d' : '#ffffff',
                  color: Math.round(marginPercent) === pct ? '#ffffff' : '#15803d',
                  borderRadius: 4,
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {pct}%
              </button>
            ))}
            <button
              type="button"
              disabled={saving}
              onClick={() => handleApplyGlobalMargin(Math.min(90, Math.round(marginPercent + 5)))}
              style={{
                border: '1px solid #bbf7d0',
                background: '#ffffff',
                color: '#15803d',
                borderRadius: 4,
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '2px 6px',
                cursor: 'pointer',
              }}
              title="Aumentar 5%"
            >
              +5%
            </button>
          </div>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Estimated Tax
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
            {currencySymbol}{taxTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 2 }}>
            5% VAT / Regional
          </div>
        </div>

        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px' }}>
          <div style={{ fontSize: '0.72rem', color: '#1e40af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Grand Total
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1d4ed8', marginTop: 4 }}>
            {currencySymbol}{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#3b82f6', marginTop: 2 }}>
            Billing: {currency}
          </div>
        </div>
      </div>

      {/* 2. Commercial Terms & Tier Info */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>
            Applied Pricing Tier
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: '#f1f5f9', borderRadius: 6, fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
            <Percent size={13} color="var(--color-primary, #003666)" />
            {tier}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>
            Payment Terms
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: '#f1f5f9', borderRadius: 6, fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
            <CreditCard size={13} color="var(--color-primary, #003666)" />
            {paymentTerms}
          </div>
        </div>
      </div>

      {/* 3. Itemized Pricing & Margin Table */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', padding: '0.75rem' }}>
        <div style={{ padding: '8px 12px', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Line-Item Margin & Financial Breakdown</span>
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
            {items.length} {items.length === 1 ? 'producto' : 'productos'}
          </span>
        </div>

        <DataTable
          columns={[
            {
              key: 'name',
              header: 'Product / Item',
              width: '32%',
              render: (it, index) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.86rem' }}>
                      {it.name || it.productName || 'Custom Item'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenSwitcher(index)}
                      style={{
                        border: '1px solid #cbd5e1',
                        background: '#f8fafc',
                        color: '#003666',
                        borderRadius: 5,
                        padding: '2px 7px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#003666'; e.currentTarget.style.backgroundColor = '#eff6ff'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                      title="Cambiar este producto por otro del catálogo con Algolia"
                    >
                      <RefreshCw size={10} />
                      <span>Sustituir</span>
                    </button>
                  </div>
                  {it.dosage && <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{it.dosage}</div>}
                </div>
              )
            },
            {
              key: 'quantity',
              header: 'Qty',
              width: '10%',
              render: (it) => <div style={{ textAlign: 'center', fontWeight: 600 }}>{Number(it.quantity || 1)}</div>
            },
            {
              key: 'supplierCost',
              header: 'Est. Cost',
              width: '15%',
              minRole: 'admin',
              render: (it) => {
                const rate = Number(it.unitPrice || it.unitRate || it.price || 0);
                const cost = Number(it.supplierCost || rate * 0.55);
                return <div style={{ textAlign: 'right', color: '#64748b' }}>{currencySymbol}{cost.toFixed(2)}</div>;
              }
            },
            {
              key: 'unitPrice',
              header: 'Unit Rate',
              width: '15%',
              render: (it) => {
                const rate = Number(it.unitPrice || it.unitRate || it.price || 0);
                return <div style={{ textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>{currencySymbol}{rate.toFixed(2)}</div>;
              }
            },
            {
              key: 'total',
              header: 'Total',
              width: '14%',
              render: (it) => {
                const qty = Number(it.quantity || 1);
                const rate = Number(it.unitPrice || it.unitRate || it.price || 0);
                return <div style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-primary, #003666)' }}>{currencySymbol}{(rate * qty).toFixed(2)}</div>;
              }
            },
            {
              key: 'margin',
              header: 'Margin',
              width: '14%',
              minRole: 'admin',
              render: (it, index) => {
                const qty = Number(it.quantity || 1);
                const rate = Number(it.unitPrice || it.unitRate || it.price || 0);
                const cost = Number(it.supplierCost || rate * 0.55);
                const lineTotal = rate * qty;
                const lineCost = cost * qty;
                const itemMargin = it.margin !== undefined
                  ? Number(it.margin)
                  : (lineTotal > 0 ? Math.round(((lineTotal - lineCost) / lineTotal) * 100) : 0);

                const isEditing = editingMarginIndex === index;

                return (
                  <div style={{ textAlign: 'right', position: 'relative' }}>
                    {isEditing ? (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#ffffff', padding: 2, border: '1px solid #16a34a', borderRadius: 6, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                        {[30, 40, 50].map(m => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => handleApplyItemMargin(index, m)}
                            style={{
                              border: 'none',
                              background: '#f0fdf4',
                              color: '#15803d',
                              borderRadius: 4,
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '2px 4px',
                              cursor: 'pointer'
                            }}
                          >
                            {m}%
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setEditingMarginIndex(null)}
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 2, color: '#94a3b8' }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEditingMarginIndex(index)}
                        style={{
                          border: 'none',
                          background: itemMargin >= 40 ? '#f0fdf4' : '#fffbeb',
                          color: itemMargin >= 40 ? '#15803d' : '#b45309',
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                        title="Toca para cambiar el margen de este ítem"
                      >
                        <span>{itemMargin}%</span>
                        <Edit2 size={10} style={{ opacity: 0.6 }} />
                      </button>
                    )}
                  </div>
                );
              }
            }
          ]}
          data={items}
          keyField="id"
          pagination={false}
          hideExpandColumn={true}
          emptyTitle="No line items recorded"
        />
      </div>

      {/* Algolia Instant Product Switcher Modal */}
      <AlgoliaProductSwitcherModal
        isOpen={switcherOpen}
        onClose={() => { setSwitcherOpen(false); setEditingIndex(null); }}
        currentItem={editingIndex != null ? items[editingIndex] : null}
        onSelectProduct={handleSelectProduct}
      />
    </div>
  );
}
