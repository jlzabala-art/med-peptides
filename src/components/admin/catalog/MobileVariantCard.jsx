"use client";

import React, { useState } from 'react';
import { Package, MoreVertical, Archive, Trash2, Edit3, ShoppingCart, ShieldCheck, DollarSign, TrendingUp, History, FileText, Send } from 'lucide-react';
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
    ? `${sym}${formatNumberAdaptive(convertedPrice)}${suf} / ${unitLabel}` 
    : 'Not priced';

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
        style={{ padding: '14px', marginBottom: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
      >
        {/* Header: Format and Supplier */}
        <div className="flex justify-between items-start mb-3 gap-2">
          <div className="flex-1">
            <h3 className="text-[14px] font-medium text-slate-800 m-0 leading-tight flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-slate-900">{dosage || displayFormat}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600">{displayFormat}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 font-normal">{supplier}</span>
            </h3>
          </div>
          
          <button 
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsActionSheetOpen(true);
            }}
            className="flex-shrink-0 flex items-center justify-center w-8 h-8 -mt-1 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
            style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
            aria-label={`Open actions`}
          >
            <MoreVertical size={18} />
          </button>
        </div>

        {/* Dynamic Details (Purity, Sample Type, TAT) */}
        {(purity || sampleType || turnaroundTime) && (
          <div className="mb-3 flex flex-wrap gap-y-2 gap-x-4 text-xs text-slate-600">
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

        {/* Pricing Section: Single Channel vs Waterfall Matrix */}
        {commercialChannel === 'all' ? (
          /* Waterfall 2x2 Grid for Mobile */
          <div className="pt-3 border-t border-slate-100">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
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
                    <div className="text-[13px] font-bold text-slate-800">
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
                    <div className="text-[13px] font-bold text-blue-900">
                      {cP != null ? `${sym}${formatNumberAdaptive(cP)}${suf}` : '—'}
                    </div>
                  </div>
                );
              })()}

              {/* 3. Clinic */}
              {(() => {
                const cost = resolveChannelPrice(row, 'cost', priceView).price;
                const sell = resolveChannelPrice(row, 'clinic', priceView).price;
                const m = calculateMarginMetrics(cost, sell);
                const cP = sell != null ? sell * multiplier : null;
                return (
                  <div className="bg-emerald-50/60 p-2 rounded border border-emerald-200/80">
                    <div className="text-[10px] font-bold text-emerald-700 flex justify-between items-center">
                      <span>🏥 Clinic</span>
                      {m.marginPct != null && <span>+{m.marginPct}%</span>}
                    </div>
                    <div className="text-[13px] font-bold text-emerald-900">
                      {cP != null ? `${sym}${formatNumberAdaptive(cP)}${suf}` : '—'}
                    </div>
                  </div>
                );
              })()}

              {/* 4. Retail */}
              {(() => {
                const cost = resolveChannelPrice(row, 'cost', priceView).price;
                const sell = resolveChannelPrice(row, 'retail', priceView).price;
                const m = calculateMarginMetrics(cost, sell);
                const cP = sell != null ? sell * multiplier : null;
                return (
                  <div className="bg-purple-50/60 p-2 rounded border border-purple-200/80">
                    <div className="text-[10px] font-bold text-purple-700 flex justify-between items-center">
                      <span>🛍️ Retail</span>
                      {m.marginPct != null && <span>+{m.marginPct}%</span>}
                    </div>
                    <div className="text-[13px] font-bold text-purple-900">
                      {cP != null ? `${sym}${formatNumberAdaptive(cP)}${suf}` : '—'}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        ) : (
          /* Single Selected Channel View */
          <div className="flex flex-col gap-1.5 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span 
                  className="text-[10px] font-bold px-2 py-0.5 rounded border uppercase"
                  style={{
                    backgroundColor: activeChannelMeta.badgeBg,
                    borderColor: activeChannelMeta.badgeBorder,
                    color: activeChannelMeta.color
                  }}
                >
                  {activeChannelMeta.icon} {activeChannelMeta.shortLabel}
                </span>
                <span className="text-[15px] font-bold text-slate-900">
                  {primaryPrice}
                </span>
              </div>
              
              {(normalizedPriceGram || normalizedPrice) && (
                <div className="flex flex-col items-end text-right bg-slate-50 px-2 py-0.5 rounded border border-slate-100 leading-tight">
                  {normalizedPriceGram && (
                    <span className="text-[11px] font-bold text-slate-800">
                      {normalizedPriceGram}
                    </span>
                  )}
                  {normalizedPrice && (
                    <span className="text-[9.5px] font-medium text-slate-500">
                      {normalizedPrice}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Margin Info Pill if channel !== 'cost' */}
            {commercialChannel !== 'cost' && marginInfo.marginPct != null && (
              <div className="flex items-center gap-2 text-xs flex-wrap mt-0.5">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[11px] ${
                  marginInfo.marginPct >= 30 ? 'bg-emerald-100 text-emerald-800' :
                  marginInfo.marginPct >= 15 ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  <TrendingUp size={11} /> {marginInfo.marginPct}% Margin
                </span>
                <span className="text-slate-500 text-[11px]">
                  +{sym}{formatNumberAdaptive(marginInfo.profitDelta * multiplier)}{suf} profit (Cost: {sym}{formatNumberAdaptive(rawCostUSD * multiplier)}{suf})
                </span>
              </div>
            )}
          </div>
        )}

        {/* Change History Toggle for Mobile */}
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowTimeline(!showTimeline);
            }}
            className="text-[11px] font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1.5 py-1 px-1.5 rounded hover:bg-sky-50 transition-colors"
          >
            <History size={12} />
            <span>{showTimeline ? 'Hide History' : `Change History (${(row.timeline || row.history || []).length})`}</span>
          </button>
        </div>

        {showTimeline && (
          <div className="mt-2 -mx-3 -mb-3">
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
