"use client";

import React, { useState } from 'react';

function VariantRow({ variant, navigate }) {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  return (
    <div className="px-4 py-3 bg-white rounded-md border border-slate-200 flex flex-col gap-2 shadow-sm">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <span className="font-semibold text-sm text-slate-900">
            {variant.name}
          </span>
          <span className="text-xs text-slate-500 mt-0.5">
            SKU: {variant.sku || 'N/A'}
            {(variant.dosage || variant.route || variant.form) && (
              <span className="ml-2 pl-2 border-l border-slate-200">
                {variant.dosage && (
                  <span className="mr-1.5 font-medium">{variant.dosage}</span>
                )}
                {variant.form && <span className="mr-1.5">• {variant.form}</span>}
                {variant.route && <span>• {variant.route}</span>}
              </span>
            )}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSection('pricing');
            }}
            className={`px-3 py-1.5 text-xs font-semibold border rounded transition-colors ${
              expandedSection === 'pricing'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Pricing {expandedSection === 'pricing' ? '▼' : '▶'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSection('inventory');
            }}
            className={`px-3 py-1.5 text-xs font-semibold border rounded transition-colors ${
              expandedSection === 'inventory'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Inventory {expandedSection === 'inventory' ? '▼' : '▶'}
          </button>
        </div>
      </div>

      {expandedSection === 'pricing' && (() => {
        const retailUnit = variant.pricing?.retail || variant.guestVialPrice || 0;
        const clinicUnit = variant.pricing?.clinic || variant.proVialPrice || 0;
        const wholesaleUnit = variant.pricing?.wholesale || 0;
        const masterUnit = variant.pricing?.supplierCost || variant.pricing?.master || 0;

        const retailKit = variant.pricing?.retail10 || variant.guestKitPrice || 0;
        const clinicKit = variant.pricing?.clinic10 || variant.proKitPrice || 0;
        const wholesaleKit = variant.pricing?.wholesale10 || 0;
        const masterKit = variant.pricing?.supplierCost10 || 0;

        const hasKit = parseFloat(retailKit) > 0 || parseFloat(clinicKit) > 0 || parseFloat(wholesaleKit) > 0 || parseFloat(masterKit) > 0;
        const marginPercent = (retailUnit > 0 && masterUnit > 0) ? (((retailUnit - masterUnit) / retailUnit) * 100).toFixed(1) : null;

        return (
          <div className="mt-2 p-4 bg-slate-50 rounded border border-slate-200">
            <div className="flex justify-between items-center mb-3">
              <h5 className="m-0 text-sm font-semibold text-slate-700">
                Pricing Tiers & Profit Margin
              </h5>
              <div className="flex items-center gap-2">
                {marginPercent && (
                  <span className="text-[0.7rem] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    Gross Margin: {marginPercent}%
                  </span>
                )}
                <span className={`text-[0.7rem] font-semibold px-2.5 py-0.5 rounded-full ${hasKit ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-500'}`}>
                  {hasKit ? '✓ Set of 10 Available' : '✗ No Set of 10'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-[1.5fr_1fr_1fr] gap-2 text-xs mb-4 pb-2 border-b border-slate-200">
              <strong className="text-slate-500">Tier</strong>
              <strong className="text-right text-slate-500">1 Unit</strong>
              <strong className="text-right text-slate-500">Set of 10</strong>

              <span className="text-slate-900 font-medium">Retail</span>
              <span className="text-right">${parseFloat(retailUnit).toFixed(2)}</span>
              <span className="text-right">
                {parseFloat(retailKit) > 0 ? `$${parseFloat(retailKit).toFixed(2)}` : '-'}
              </span>

              <span className="text-slate-900 font-medium">Doctor / Clinic</span>
              <span className="text-right">${parseFloat(clinicUnit).toFixed(2)}</span>
              <span className="text-right">
                {parseFloat(clinicKit) > 0 ? `$${parseFloat(clinicKit).toFixed(2)}` : '-'}
              </span>

              <span className="text-slate-900 font-medium">Wholesale</span>
              <span className="text-right">${parseFloat(wholesaleUnit).toFixed(2)}</span>
              <span className="text-right">
                {parseFloat(wholesaleKit) > 0 ? `$${parseFloat(wholesaleKit).toFixed(2)}` : '-'}
              </span>

              <span className="text-slate-900 font-medium">Master (Cost)</span>
              <span className="text-right font-semibold text-slate-600">${parseFloat(masterUnit).toFixed(2)}</span>
              <span className="text-right font-semibold text-slate-600">
                {parseFloat(masterKit) > 0 ? `$${parseFloat(masterKit).toFixed(2)}` : '-'}
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/sku-sync?sku=${encodeURIComponent(variant.sku || '')}&productId=${encodeURIComponent(variant.id || '')}`);
              }}
              className="w-full p-2.5 text-xs font-semibold bg-white text-slate-900 border border-slate-300 rounded hover:bg-slate-50 flex justify-between items-center transition-colors"
            >
              <span>Manage Pricing in Detail</span>
              <span>→</span>
            </button>
          </div>
        );
      })()}

      {expandedSection === 'inventory' && (() => {
        const stockQty = variant.stock?.qty ?? variant.stock?.quantity ?? (typeof variant.stock === 'number' ? variant.stock : 0);
        const minAlert = variant.minStockAlert ?? variant.stock?.minAlert ?? 5;
        const isLowStock = stockQty > 0 && stockQty <= minAlert;
        const isOutOfStock = stockQty <= 0 || variant.stock?.available === false;

        return (
          <div className="mt-2 p-4 bg-slate-50 rounded border border-slate-200">
            <div className="flex justify-between items-center mb-3">
              <h5 className="m-0 text-sm font-semibold text-slate-700">
                Inventory & Lot Quality
              </h5>
              {isLowStock && (
                <span className="text-[0.7rem] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 animate-pulse">
                  ⚠️ Low Stock (≤ {minAlert} units)
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2 text-xs mb-4">
              <div className="flex justify-between pb-1 border-b border-slate-200">
                <span className="text-slate-500">Warehouse:</span>
                <strong className="text-slate-900">
                  {variant.warehouse || variant.stock?.warehouse || 'Primary Warehouse'}
                </strong>
              </div>
              <div className="flex justify-between pb-1 border-b border-slate-200">
                <span className="text-slate-500">Total Stock Qty:</span>
                <strong className={`font-semibold ${isOutOfStock ? 'text-red-600' : (isLowStock ? 'text-amber-600' : 'text-slate-900')}`}>
                  {stockQty} units {isLowStock ? '(Restock Recommended)' : ''}
                </strong>
              </div>
              <div className="flex justify-between pb-1 border-b border-slate-200">
                <span className="text-slate-500">Threshold Alert:</span>
                <strong className="text-slate-700">{minAlert} units</strong>
              </div>
              <div className="flex justify-between pb-1 border-b border-slate-200">
                <span className="text-slate-500">Batch / Lot Number:</span>
                <strong className="text-slate-900">{variant.batchNumber || 'LOT-2026-GEN'}</strong>
              </div>
              <div className="flex justify-between pb-1 border-b border-slate-200">
                <span className="text-slate-500">Expiry Date:</span>
                <strong className="text-slate-900">{variant.expirationDate || '24 Months Post-Lyophilization'}</strong>
              </div>
              {variant.coaUrl && (
                <div className="flex justify-between pb-1 border-b border-slate-200">
                  <span className="text-slate-500">COA Certificate:</span>
                  <a href={variant.coaUrl} target="_blank" rel="noreferrer" className="text-blue-600 font-semibold underline">
                    View Lab HPLC Certificate ↗
                  </a>
                </div>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/sku-sync?sku=${encodeURIComponent(variant.sku || '')}&productId=${encodeURIComponent(variant.id || '')}`);
              }}
              className="w-full p-2.5 text-xs font-semibold bg-white text-slate-900 border border-slate-300 rounded hover:bg-slate-50 flex justify-between items-center transition-colors"
            >
              <span>Manage Inventory in Detail</span>
              <span>→</span>
            </button>
          </div>
        );
      })()}
    </div>
  );
}

// Prevent re-renders if the variant data and navigate ref haven't changed
export default React.memo(VariantRow, (prev, next) =>
  prev.variant.id === next.variant.id &&
  prev.variant.stock === next.variant.stock &&
  prev.variant.isActive === next.variant.isActive &&
  prev.variant.price === next.variant.price &&
  prev.navigate === next.navigate
);
