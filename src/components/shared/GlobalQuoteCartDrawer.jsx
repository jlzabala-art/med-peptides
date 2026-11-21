'use client';

import React, { useState, useEffect } from 'react';
import { X, Trash2, FileText, ShoppingBag, Plus, Minus, Pin, PinOff } from 'lucide-react';
import { usePublicWorkspace } from '@/context/PublicWorkspaceContext';
import { buildSchedulePdfBlob } from '@/lib/pdf/schedulePdfBuilder';
import { usePdfPreview } from '@/context/PdfPreviewContext';
import { toast } from 'react-hot-toast';

/**
 * GlobalQuoteCartDrawer
 * Cross-catalog RFQ / Quote Workspace drawer mounted globally so users can
 * accumulate items across /pricing/*, /vials, /collection/* and preview a
 * unified Pro-Forma PDF from anywhere in the platform.
 */
export default function GlobalQuoteCartDrawer() {
  const {
    rfqItems,
    currency,
    isSpanish,
    isQuoteDrawerOpen,
    setIsQuoteDrawerOpen,
    updateRfqQty,
    removeRfqItem,
    clearRfqItems,
  } = usePublicWorkspace();
  const { openPdfPreview } = usePdfPreview();
  const [isDocked, setIsDocked] = useState(false);

  useEffect(() => {
    if (!isQuoteDrawerOpen || typeof window === 'undefined') return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsQuoteDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isQuoteDrawerOpen, setIsQuoteDrawerOpen]);

  if (!isQuoteDrawerOpen) return null;

  const totalEstimate = rfqItems.reduce(
    (sum, item) => sum + Number(item.unitPrice || item.price || 0) * Number(item.qty || 1),
    0
  );

  const handlePreviewCombinedQuote = () => {
    if (!rfqItems.length) return;
    openPdfPreview({
      title: isSpanish ? 'Resumen de Cotización / RFQ' : 'Combined Quote / RFQ Summary',
      subtitle: `${rfqItems.length} SKUs · ${currency}`,
      downloadName: `Atlas_Quote_${currency}_${new Date().toISOString().slice(0, 10)}.pdf`,
      getPdfBlob: () =>
        buildSchedulePdfBlob({
          title: 'ATLAS HEALTH SERVICES — CROSS-CATALOG QUOTE SUMMARY',
          subtitle: isSpanish ? 'Borrador de Solicitud Comercial (RFQ)' : 'Combined Commercial Quote Request (RFQ)',
          documentRef: `RFQ-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}`,
          currency,
          tierLabel: 'Combined Workspace Quote',
          head: ['#', 'SKU / Ref', 'Product', 'Qty', `Unit (${currency})`, `Subtotal (${currency})`],
          body: rfqItems.map((item, idx) => {
            const unit = Number(item.unitPrice || item.price || 0);
            const qty = Number(item.qty || 1);
            return [
              idx + 1,
              item.sku || item.id || '—',
              item.name || item.title || 'Item',
              qty,
              unit > 0 ? `${currency} ${unit.toFixed(2)}` : 'On Request',
              unit > 0 ? `${currency} ${(unit * qty).toFixed(2)}` : 'On Request',
            ];
          }),
          rightAlignCols: [3, 4, 5],
        }),
    });
  };

  return (
    <div
      role="dialog"
      aria-modal={!isDocked}
      aria-label={isSpanish ? 'Cotización Activa' : 'Active Quote Workspace'}
      className={`atlas-mobile-sheet-backdrop ${isDocked ? 'atlas-sheet-docked' : ''}`.trim()}
      onClick={() => {
        if (!isDocked) setIsQuoteDrawerOpen(false);
      }}
    >
      <div
        className="atlas-mobile-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '12px 20px 16px',
            background: '#003666',
            color: '#ffffff',
          }}
        >
          <div className="atlas-mobile-sheet-handle" aria-hidden="true" />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShoppingBag size={18} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                  {isSpanish ? 'Cotización Activa (Cross-Catalog)' : 'Active Quote Workspace'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#bae6fd' }}>
                  {rfqItems.length} {isSpanish ? 'productos seleccionados' : 'selected items'} · {currency}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setIsDocked((v) => !v)}
                aria-label={isDocked ? 'Undock quote workspace' : 'Dock quote workspace'}
                title={isDocked
                  ? (isSpanish ? 'Desacoplar panel' : 'Undock panel')
                  : (isSpanish ? 'Fijar al lateral mientras navegas (≥1280px)' : 'Dock side-by-side while browsing (≥1280px)')}
                className="hide-on-mobile-header"
                style={{
                  background: isDocked ? 'rgba(56, 189, 248, 0.28)' : 'rgba(255,255,255,0.12)',
                  border: isDocked ? '1px solid rgba(125, 211, 252, 0.6)' : 'none',
                  color: '#ffffff',
                  borderRadius: '8px',
                  width: '36px',
                  height: '36px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                {isDocked ? <PinOff size={15} /> : <Pin size={15} />}
              </button>
              <button
                type="button"
                onClick={() => setIsQuoteDrawerOpen(false)}
                aria-label="Close"
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: 'none',
                  color: '#ffffff',
                  borderRadius: '8px',
                  width: '40px',
                  height: '40px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {rfqItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b', fontSize: '0.86rem' }}>
              {isSpanish
                ? 'Tu espacio de cotización está vacío. Añade productos desde cualquier catálogo o tarifa para consolidar un único PDF.'
                : 'Your quote workspace is empty. Add products from any catalog or price schedule to build a unified PDF quote.'}
            </div>
          ) : (
            rfqItems.map((item) => {
              const key = item.id || item.sku;
              const unit = Number(item.unitPrice || item.price || 0);
              return (
                <div
                  key={key}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0f172a' }}>
                      {item.name || item.title}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRfqItem(key)}
                      style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                      aria-label="Remove item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem', color: '#64748b' }}>
                    <span className="font-mono">{item.sku || item.id}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => updateRfqQty(key, Math.max(1, (item.qty || 1) - 1))}
                        style={{ border: '1px solid #cbd5e1', borderRadius: '6px', width: '24px', height: '24px', background: '#f8fafc', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="font-mono font-bold" style={{ color: '#0f172a' }}>{item.qty || 1}</span>
                      <button
                        type="button"
                        onClick={() => updateRfqQty(key, (item.qty || 1) + 1)}
                        style={{ border: '1px solid #cbd5e1', borderRadius: '6px', width: '24px', height: '24px', background: '#f8fafc', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Plus size={12} />
                      </button>
                      {unit > 0 && (
                        <span className="font-mono font-bold" style={{ color: '#003666', marginLeft: '6px' }}>
                          {currency} {(unit * (item.qty || 1)).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {rfqItems.length > 0 && (
          <div style={{ padding: '14px 20px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {totalEstimate > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                <span>{isSpanish ? 'Total estimado' : 'Estimated Total'}</span>
                <span className="font-mono">{currency} {totalEstimate.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handlePreviewCombinedQuote}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#003666',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <FileText size={15} />
                <span>{isSpanish ? 'Previsualizar PDF' : 'Preview Quote PDF'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  clearRfqItems();
                  toast.success(isSpanish ? 'Cotización limpiada' : 'Quote workspace cleared');
                }}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                {isSpanish ? 'Limpiar' : 'Clear'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
