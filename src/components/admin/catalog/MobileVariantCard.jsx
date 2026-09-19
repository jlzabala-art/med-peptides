"use client";

import React, { useState } from 'react';
import { Package, MoreVertical, Archive, Trash2, Edit3, ShoppingCart, ShieldCheck, DollarSign, TrendingUp, History, FileText, Send, ChevronDown, ChevronRight } from 'lucide-react';
import MobileActionSheet from '../../ui/MobileActionSheet';
import VariantTimelinePanel from './VariantTimelinePanel';
import { formatNumberAdaptive, formatCurrencyAdaptive } from '../../../utils/formatters';
import { PRESENTATION_LABELS } from '../../../constants/presentationTypes';
import { resolveChannelPrice, calculateMarginMetrics, COMMERCIAL_CHANNELS } from '../../../utils/commercialPricingHelper';
import notifier from '../../../services/NotificationService';

import { calculateTotalMg } from '../../../utils/calculateTotalMg';

export default function MobileVariantCard({ 
  row, 
  selectedProduct, 
  onQuickAction, 
  displayCurrency = 'USD', 
  priceView = 'unit', 
  commercialChannel = 'cost', 
  onUpdateVariantField 
}) {
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);

  // Fallback defaults
  const format = row.presentation || '';
  const displayFormat = PRESENTATION_LABELS[format] || format || 'Variant';
  
  // Extract supplier
  const supplier = row.supplierName || row.supplier || 'Unknown Supplier';
  
  // Dosage logic
  const rawStrength = row.strength || row.dosage || row.dose || row.dosage_per_vial;
  const dosage = rawStrength !== null && rawStrength !== undefined
      ? (typeof rawStrength === 'object' ? (rawStrength.value || rawStrength.label || null) : String(rawStrength))
      : null;

  // Additional fields for Tests and API
  const sampleType = row.sampleType || row.extractionMethod || null;
  const turnaroundTime = row.turnaroundTime || null;
  const purity = row.purity || row.specs || null;
  const moq = row.moq || null;
  const leadTime = row.supplierLeadTime || row.leadTime || null;

  // Currency multiplier
  const multiplier = displayCurrency === 'EUR' ? 0.92 : (displayCurrency === 'AED' ? 3.67 : 1);
  const sym = displayCurrency === 'EUR' ? '€' : (displayCurrency === 'AED' ? '' : '$');
  const suf = displayCurrency === 'AED' ? ' د.إ' : '';

  // Channel Pricing Resolution
  const costRes = resolveChannelPrice(row, 'cost', priceView);
  const rawCostUSD = costRes.price;

  const currentChannelRes = resolveChannelPrice(row, commercialChannel === 'all' ? 'cost' : commercialChannel, priceView);
  const rawPriceUSD = currentChannelRes.price;

  // Margin calculation for selected channel
  const marginInfo = calculateMarginMetrics(rawCostUSD, rawPriceUSD);

  const convertedPrice = (typeof rawPriceUSD === 'number') ? rawPriceUSD * multiplier : null;
  const unitLabel = priceView === 'kit' ? 'kit' : 'unit';

  const primaryPrice = convertedPrice !== null 
    ? `${sym}${formatNumberAdaptive(convertedPrice)}${suf}` 
    : '—';

  // Normalized $/g and $/mg
  let normalizedPrice = null;
  let normalizedPriceGram = null;
  const totalMg = calculateTotalMg(row) || calculateTotalMg(selectedProduct) || (row.doseMg ?? row.totalMg ?? parseFloat(rawStrength || 0));
  if (convertedPrice !== null && totalMg > 0 && typeof totalMg === 'number') {
     const qty = priceView === 'kit' || priceView === 'tier_10' ? (row.quantityPerKit || 10) : (priceView === 'tier_50' ? 50 : (priceView === 'tier_100' ? 100 : 1));
     const pMg = convertedPrice / (totalMg * qty);
     const pGram = pMg * 1000;
     normalizedPrice = `${sym}${formatNumberAdaptive(pMg)}${suf}/mg`;
     normalizedPriceGram = `${sym}${formatNumberAdaptive(pGram)}${suf}/g`;
  }

  // Active channel descriptor
  const activeChannelMeta = COMMERCIAL_CHANNELS.find(c => c.id === commercialChannel) || COMMERCIAL_CHANNELS[0];

  return (
    <>
      <div 
        className="bg-white rounded-lg border border-slate-200 overflow-hidden relative"
        style={{ marginBottom: '10px', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
      >
        {/* Native Mobile Collapsed Header (UX Variant Prompt Spec) */}
        <div 
          onClick={() => setShowTimeline(!showTimeline)}
          style={{
            padding: '12px 14px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            backgroundColor: showTimeline ? '#f8fafc' : '#ffffff',
            borderBottom: showTimeline ? '1px solid #e2e8f0' : 'none',
            userSelect: 'none'
          }}
        >
          {/* Top Row: Dosage (Primary) vs Commercial Price */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#003666', display: 'flex', alignItems: 'center' }}>
                {showTimeline ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </span>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
                {dosage || displayFormat}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 850, color: '#0f172a' }}>
                {primaryPrice}
              </span>
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsActionSheetOpen(true);
                }}
                style={{
                  minWidth: '44px',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '50%',
                  marginRight: '-8px'
                }}
                aria-label="Open variant actions"
              >
                <MoreVertical size={18} />
              </button>
            </div>
          </div>

          {/* Sub Row: Format · Supplier on Left, Channel Status [ WS ] on Right */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '26px' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>
              {displayFormat} • {supplier}
            </span>

            <span 
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: '4px',
                textTransform: 'uppercase',
                backgroundColor: activeChannelMeta.badgeBg || '#eff6ff',
                borderColor: activeChannelMeta.badgeBorder || '#bfdbfe',
                color: activeChannelMeta.color || '#003666',
                border: '1px solid'
              }}
            >
              {activeChannelMeta.shortLabel || 'WS'}
            </span>
          </div>
        </div>

        {/* Dynamic Details (Purity, Sample Type, TAT) */}
        {(purity || sampleType || turnaroundTime) && !showTimeline && (
          <div style={{ padding: '0 14px 10px 40px', display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.72rem', color: '#64748b' }}>
            {purity && (
              <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100 font-medium">
                Purity: {purity}
              </span>
            )}
            {sampleType && (
              <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                Sample: {sampleType}
              </span>
            )}
            {turnaroundTime && (
              <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                TAT: {turnaroundTime}
              </span>
            )}
          </div>
        )}

        {/* Collapsed Secondary Pricing & Channel Preview (shown only when collapsed) */}
        {!showTimeline && commercialChannel === 'all' && (
          <div style={{ padding: '0 14px 12px 14px', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Commercial Channels ({unitLabel.toUpperCase()})
            </div>
            <div className="grid grid-cols-2 gap-2">
              {/* 1. Cost */}
              {(() => {
                const p = resolveChannelPrice(row, 'cost', priceView).price;
                const cP = p != null ? p * multiplier : null;
                return (
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <div className="text-[10px] font-bold text-slate-500">📦 Cost (Master)</div>
                    <div className="text-[12px] font-bold text-slate-800">
                      {cP != null ? `${sym}${formatNumberAdaptive(cP)}${suf}` : '—'}
                    </div>
                  </div>
                );
              })()}

              {/* 2. Wholesale */}
              {(() => {
                const cost = resolveChannelPrice(row, 'cost', priceView).price;
                const sell = resolveChannelPrice(row, 'wholesale', priceView).price;
                const m = calculateMarginMetrics(cost, sell);
                const cP = sell != null ? sell * multiplier : null;
                return (
                  <div className="bg-blue-50/60 p-2 rounded border border-blue-200/80">
                    <div className="text-[10px] font-bold text-blue-700 flex justify-between items-center">
                      <span>🏢 Wholesale</span>
                      {m.marginPct != null && <span>+{m.marginPct}%</span>}
                    </div>
                    <div className="text-[12px] font-bold text-blue-900">
                      {cP != null ? `${sym}${formatNumberAdaptive(cP)}${suf}` : '—'}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Expanded State: Master-Detail Panel */}
        {showTimeline && (
          <div style={{ borderTop: '1px solid #e2e8f0' }}>
            <VariantTimelinePanel 
              variant={row} 
              selectedProduct={selectedProduct} 
              onUpdateVariantField={onUpdateVariantField} 
            />
          </div>
        )}
      </div>

      {/* Mobile Action Sheet Drawer */}
      <MobileActionSheet 
        isOpen={isActionSheetOpen}
        onClose={() => setIsActionSheetOpen(false)}
        title={`${supplier} - ${dosage || displayFormat}`}
        actions={[
          {
            label: 'Quote to Client (Clinic / Wholesaler / Patient)',
            icon: FileText,
            onClick: () => {
              setIsActionSheetOpen(false);
              const quoteItem = {
                productId: row.productId || row.id,
                variantId: row.id || row.sku,
                name: `${supplier} · ${dosage || displayFormat}`,
                dosage: dosage || '',
                unitPrice: row.resolvedPrice?.perUnit || row.price || 0,
                supplierCost: row.supplierCost || row.costPrice || 0,
                supplierId: row.supplierId || row.supplier || '',
                supplierName: supplier,
                quantity: 1,
              };
              window.dispatchEvent(new CustomEvent('open-quotation-wizard', {
                detail: {
                  type: 'manual',
                  recipientType: 'clinic',
                  source: 'mobile_catalog_variant',
                  items: [quoteItem],
                  initialItem: quoteItem
                }
              }));
              notifier.info('Starting client quotation...');
            }
          },
          {
            label: 'Request Supplier RFQ',
            icon: Send,
            onClick: () => {
              setIsActionSheetOpen(false);
              onQuickAction?.('request_rfq', row);
            }
          },
          {
            label: 'Add to Order',
            icon: ShoppingCart,
            onClick: () => {
              setIsActionSheetOpen(false);
              onQuickAction?.('create_order', row);
            }
          },
          {
            label: 'Archive Variant',
            icon: Archive,
            onClick: () => {
              setIsActionSheetOpen(false);
              onQuickAction?.('archive', row);
            }
          },
          {
            label: 'Delete Variant',
            icon: Trash2,
            danger: true,
            onClick: () => {
              setIsActionSheetOpen(false);
              onQuickAction?.('delete', row);
            }
          }
        ]}
      />
    </>
  );
}
