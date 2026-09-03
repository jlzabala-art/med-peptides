"use client";

import React from 'react';
import SegmentedControl from '../../ui/SegmentedControl';
import CurrencySelector from '../../ui/CurrencySelector';
import GoalsCoverageWidget from './GoalsCoverageWidget';
import { CLINICAL_GOALS, getGoalLabel } from '../../../config/goals';
import { PRESENTATION_LABELS } from '../../../constants/presentationTypes';
import { getProductTypeLabel } from '../../../config/productTypes';
import { Eye, Library } from 'lucide-react';

/**
 * CatalogToolbar
 * ─────────────────────────────────────────────────────────────────────────────
 * Modular toolbar component for catalog pricing tiers, currency selection,
 * category filters, and active filter chips.
 */
export default function CatalogToolbar({
  priceView,
  setPriceView,
  displayCurrency,
  setDisplayCurrency,
  showGoalsCoverage,
  setShowGoalsCoverage,
  setIsSavedPdfsOpen,
  filterCategory,
  setMultiParam,
  filterGoals,
  filterPresentation,
  filterSupplier,
  categoryOptions,
  getCategoryLabel,
  supplierIdToName,
  handleClearAllFilters
}) {
  const hasActiveFilters = filterCategory.length > 0 || filterGoals.length > 0 || filterPresentation.length > 0 || filterSupplier.length > 0;

  return (
    <div className="flex flex-col gap-3 mb-4">
      {/* Top Bar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="flex items-center gap-6 flex-wrap">
          {/* Pricing Tier Selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">PRICING TIERS</span>
            <SegmentedControl
              value={priceView}
              onChange={setPriceView}
              options={[
                { id: 'unit', label: 'Unit (×1)' },
                { id: 'kit', label: 'Tier ×10' },
                { id: 'tier_50', label: 'Tier ×50' },
                { id: 'tier_100', label: 'Tier ×100' }
              ]}
              layoutIdPrefix="pricing-tier-selector"
            />
          </div>

          {/* Currency Selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Currency</span>
            <CurrencySelector
              value={displayCurrency}
              onChange={setDisplayCurrency}
              currencies={['USD', 'EUR', 'AED']}
            />
          </div>
        </div>

        {/* Action Widgets */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowGoalsCoverage(!showGoalsCoverage)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              showGoalsCoverage
                ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Eye size={14} />
            {showGoalsCoverage ? 'Hide Goals Coverage' : 'Goals Coverage'}
          </button>

          <button
            type="button"
            onClick={() => setIsSavedPdfsOpen?.(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
          >
            <Library size={14} />
            PDF Library
          </button>
        </div>
      </div>

      {/* Goals Coverage Widget Collapsible Panel */}
      {showGoalsCoverage && (
        <div className="mb-2">
          <GoalsCoverageWidget />
        </div>
      )}

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap text-xs bg-slate-50/80 p-2.5 rounded-lg border border-slate-200">
          <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Active Filters:</span>

          {filterProductType && (
            <span className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-md text-slate-700 font-medium">
              Type: {getProductTypeLabel(filterProductType)}
              <button onClick={() => updateUrlParam('productType', '')} className="hover:text-red-500 ml-0.5">×</button>
            </span>
          )}

          {filterCategory.map(cat => (
            <span key={cat} className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-md text-slate-700 font-medium">
              Category: {getCategoryLabel?.(cat) || cat}
              <button onClick={() => setMultiParam('category', filterCategory.filter(c => c !== cat))} className="hover:text-red-500 ml-0.5">×</button>
            </span>
          ))}

          {filterGoals.map(goal => (
            <span key={goal} className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-200 px-2 py-1 rounded-md text-indigo-800 font-medium">
              Goal: {getGoalLabel?.(goal) || goal}
              <button onClick={() => setMultiParam('goals', filterGoals.filter(g => g !== goal))} className="hover:text-red-500 ml-0.5">×</button>
            </span>
          ))}

          {filterPresentation.map(pres => (
            <span key={pres} className="inline-flex items-center gap-1 bg-teal-50 border border-teal-200 px-2 py-1 rounded-md text-teal-800 font-medium">
              Format: {PRESENTATION_LABELS[pres] || pres}
              <button onClick={() => setMultiParam('presentation', filterPresentation.filter(p => p !== pres))} className="hover:text-red-500 ml-0.5">×</button>
            </span>
          ))}

          {filterSupplier.map(sup => (
            <span key={sup} className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 px-2 py-1 rounded-md text-blue-800 font-medium">
              Supplier: {supplierIdToName[sup] || sup}
              <button onClick={() => setMultiParam('supplier', filterSupplier.filter(s => s !== sup))} className="hover:text-red-500 ml-0.5">×</button>
            </span>
          ))}

          <button
            onClick={handleClearAllFilters}
            className="text-xs text-red-600 hover:text-red-800 font-semibold underline ml-auto cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
