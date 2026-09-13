"use client";

import { useEffect, useCallback, useRef } from 'react';

/**
 * useQuotationsContextBridge
 * 
 * Manages the 3-level context hierarchy for the Atlas Health Quotations & Estimates Module:
 * - Level 1 (Macro): Entire quotations directory / filtered view (KPIs, pipeline value, margins, filters)
 * - Level 2 (Micro): Individual Quotation focus (Drawer, expanded row, client, totals, margin %, valid until)
 * - Level 3 (Nano): Specific line item / compounded peptide focus (Dosage, lab supplier, cost vs rate, margin)
 * 
 * Dispatches 'admin-context-update' events listened by PortalLayout -> ClinicalAssistant.
 */
export function useQuotationsContextBridge({
  quotations = [],
  kpis = null,
  activeFilters = {},
  selectedQuote = null,
  selectedItem = null,
  role = 'admin'
} = {}) {
  const lastDispatchedRef = useRef(null);

  const dispatchContext = useCallback((levelOverride = null, extra = {}) => {
    if (typeof window === 'undefined') return;

    let level = 1;
    let payload = {};

    const activeQ = extra.quote || selectedQuote;
    const activeItem = extra.item || selectedItem;

    if (activeItem && activeQ) {
      // ── Level 3: Nano / Line Item Focus ────────────────────────────────────
      level = 3;
      const rate = Number(activeItem.unitRate || activeItem.unitPrice || activeItem.price || 0);
      const cost = Number(activeItem.supplierCost || activeItem.unitCost || (rate > 0 ? rate * 0.55 : 0));
      const qty = Number(activeItem.quantity || 1);
      const lineTotal = Number(activeItem.totalPrice || activeItem.subtotal || rate * qty);

      let marginPct = 0;
      if (rate > 0 && cost > 0) {
        marginPct = Math.round(((rate - cost) / rate) * 100);
      }

      payload = {
        level: 3,
        page: 'quotations',
        isQuotationsContext: true,
        isEstimateContext: true,
        isLineItemContext: true,
        entityName: `${activeItem.name || 'Compounded Item'} (${activeItem.dosage || ''})`,
        quoteNumber: activeQ.quotationNumber || activeQ.id,
        clientName: activeQ.clientName || 'Direct Client',
        item: activeItem,
        itemName: activeItem.name,
        dosage: activeItem.dosage,
        presentation: activeItem.presentation,
        supplierName: activeItem.supplierName || 'Compounding Lab',
        quantity: qty,
        unitRate: rate,
        supplierCost: cost,
        lineTotal,
        marginPct,
        summary: `Item Focus in Quote ${activeQ.quotationNumber}: ${activeItem.name} (${activeItem.dosage || ''}) x${qty}. Rate: $${rate}, Supplier Cost: $${cost}, Margin: ${marginPct}%. Lab: ${activeItem.supplierName || 'Standard'}.`,
        quickActions: [
          { label: '📊 Simular Margen Ítem', prompt: `Analiza el margen de ${activeItem.name} (${activeItem.dosage}): coste $${cost} vs precio $${rate} (${marginPct}% margen). ¿Hay margen para ofrecer un descuento por volumen?` },
          { label: '📦 Stock en Catálogo', prompt: `Comprueba la disponibilidad y alternativas para ${activeItem.name} en el catálogo de proveedores` },
          { label: '🏷️ Comparar Laboratorios', prompt: `¿Qué otros laboratorios proveedores pueden suministrar ${activeItem.name} (${activeItem.dosage}) con mejor margen o menor tiempo de entrega?` }
        ]
      };
    } else if (activeQ) {
      // ── Level 2: Micro / Quotation Focus ───────────────────────────────────
      level = 2;
      const qNum = activeQ.quotationNumber || activeQ.id || 'N/A';
      const client = activeQ.clientName || activeQ.recipientName || 'Direct Client';
      const grandTotal = Number(activeQ.grandTotal || activeQ.subtotal || 0);
      const margin = Number(activeQ.marginPercent || 0);
      const status = String(activeQ.status || 'draft').toUpperCase();
      const items = activeQ.items || [];
      const days = activeQ.daysRemaining !== undefined ? activeQ.daysRemaining : 30;

      payload = {
        level: 2,
        page: 'quotations',
        isQuotationsContext: true,
        isEstimateContext: true,
        isLineItemContext: false,
        entityName: `Quote #${qNum} — ${client}`,
        quoteNumber: qNum,
        clientName: client,
        clientEmail: activeQ.clientEmail || '',
        category: activeQ.category || 'clinic',
        grandTotal,
        subtotal: activeQ.subtotal || grandTotal,
        marginPercent: margin,
        status,
        daysRemaining: days,
        isExpired: activeQ.isExpired || false,
        requiresColdChain: activeQ.requiresColdChain !== false,
        itemsCount: items.length,
        itemsSummary: items.map(i => `${i.name || 'Compound'} (${i.dosage || '1 vial'}) x${i.quantity || 1}`).join(', '),
        shippingAddress: activeQ.shippingAddress || null,
        biginContactId: activeQ.biginContactId || null,
        quote: activeQ,
        summary: `Quotation Focus: #${qNum} for ${client} (${activeQ.category?.toUpperCase() || 'CLIENT'}). Grand Total: $${grandTotal.toFixed(2)}, Margin: ${margin}%, Status: ${status}. Items: ${items.length} (${items.slice(0, 3).map(i => i.name).join(', ')}). Valid: ${days} days remaining.`,
        quickActions: [
          { label: '💡 Estrategia de Margen', prompt: `Analiza la cotización #${qNum} de $${grandTotal.toFixed(2)} para ${client} (margen actual: ${margin}%). ¿Es un precio competitivo y rentable según su categoría?` },
          { label: '✉️ Redactar Propuesta Comercial', prompt: `Redacta un mensaje profesional para enviar por WhatsApp o email a ${client} resumiendo la cotización #${qNum} con las condiciones de envío y cadena de frío.` },
          { label: '🔄 Convertir a Pedido', prompt: `¿Cuáles son los pasos y requisitos de stock para convertir la cotización #${qNum} a Sales Order y emitir las órdenes de compra a proveedores?` },
          { label: '❄️ Verificación de Logística', prompt: `Verifica los requisitos de cadena de frío refrigerada (2-8°C) y destino de entrega para la cotización #${qNum}` }
        ]
      };
    } else {
      // ── Level 1: Macro / Pipeline Level ───────────────────────────────────
      level = 1;
      const totalCount = kpis?.totalQuotes ?? quotations.length;
      const pipelineVal = kpis?.pipelineValue ?? quotations.reduce((sum, q) => sum + (Number(q.grandTotal) || 0), 0);
      const wonVal = kpis?.totalRevenueWon ?? kpis?.wonValue ?? 0;
      const avgMargin = kpis?.avgMarginPercent ?? kpis?.avgMargin ?? 48.0;

      payload = {
        level: 1,
        page: 'quotations',
        isQuotationsContext: true,
        isEstimateContext: true,
        isLineItemContext: false,
        label: 'Quotations & Estimates Hub',
        totalQuotations: totalCount,
        pipelineValue: pipelineVal,
        wonRevenue: wonVal,
        avgMarginPercent: avgMargin,
        activeFilters,
        summary: `Estimates Directory: ${totalCount} quotations registered. Active pipeline: $${pipelineVal.toLocaleString()}. Average Margin: ${avgMargin}%. Active range: ${activeFilters.range || 'All'}.`,
        quickActions: [
          { label: '📈 Análisis de Pipeline', prompt: 'Dame un resumen ejecutivo del pipeline comercial de cotizaciones activas, importes pendientes y tasa estimada de conversión.' },
          { label: '⏳ Cotizaciones por Vencer', prompt: '¿Cuáles son las cotizaciones activas que están próximas a vencer (menos de 7 días de validez) para hacer seguimiento?' },
          { label: '🔍 Auditar Márgenes Bajos', prompt: 'Identifica cotizaciones activas con un margen comercial inferior al 40% para revisar su estructura de costes.' },
          { label: '📊 Comparar Clínicas vs B2C', prompt: 'Compara el volumen y ticket medio de cotizaciones dirigidas a clínicas y médicos versus pacientes directos.' }
        ]
      };
    }

    // Deduplicate rapid identical dispatches
    const signature = `${payload.level}:${payload.quoteNumber || 'pipeline'}:${payload.itemName || 'none'}`;
    if (lastDispatchedRef.current === signature) return;
    lastDispatchedRef.current = signature;

    window.dispatchEvent(
      new CustomEvent('admin-context-update', {
        detail: payload
      })
    );
  }, [selectedQuote, selectedItem, quotations, kpis, activeFilters]);

  useEffect(() => {
    dispatchContext();
  }, [dispatchContext]);

  return {
    dispatchContext,
    setLevel2: (quote) => dispatchContext(2, { quote, item: null }),
    setLevel3: (item, quote) => dispatchContext(3, { item, quote }),
    resetToLevel1: () => dispatchContext(1, { quote: null, item: null })
  };
}
