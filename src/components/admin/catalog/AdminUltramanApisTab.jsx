"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  Package, 
  FlaskConical, 
  Layers, 
  CheckCircle, 
  Search,
  DollarSign,
  TrendingUp,
  Cpu,
  Calculator,
  ArrowRight
} from '@/lib/icons';
import PageHeader from '@/components/ui/PageHeader';
import MetricCard from '@/components/ui/MetricCard';
import GlobalSearchBar from '@/components/ui/GlobalSearchBar';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import CopyableId from '@/components/ui/CopyableId';
import { getUltramanApis, invalidateUltramanApisCache } from '@/repositories/ultramanApiRepository';
import { calculatePharmapolisCost, COST_STANDARDS } from '@/services/pharmapolisCostEngine';
import toast from 'react-hot-toast';

// Official 6 UltraPerson products for quick cost testing
const ULTRAPERSON_SAMPLE_PRODUCTS = [
  {
    id: 'ultraperson-energy-metabolic-vitality',
    name: 'UltraPerson Energy & Metabolic Vitality',
    ingredients: [
      { name: 'Coenzyme Q10 (ubiquinone)', doseMg: 125 },
      { name: 'PQQ (pyrroloquinoline quinone)', doseMg: 20 },
      { name: 'Panax ginseng extract', doseMg: 200 },
      { name: 'Alpha-lipoic acid (ALA)', doseMg: 150 },
      { name: 'Black pepper extract (piperine)', doseMg: 5 }
    ]
  },
  {
    id: 'ultraperson-longevity-cellular-renewal',
    name: 'UltraPerson Longevity & Cellular Renewal',
    ingredients: [
      { name: 'Trans-Resveratrol (micronized)', doseMg: 250 },
      { name: 'Fisetin', doseMg: 100 },
      { name: 'Curcumin phytosome (enhanced)', doseMg: 100 },
      { name: 'Grape seed extract', doseMg: 50 }
    ]
  },
  {
    id: 'ultraperson-immune-strength-defense',
    name: 'UltraPerson Immune Strength & Defense',
    ingredients: [
      { name: 'Quercetin phytosome', doseMg: 250 },
      { name: 'Vitamin C (ascorbic acid)', doseMg: 120 },
      { name: 'Zinc (as zinc picolinate)', doseMg: 50 },
      { name: 'Elderberry extract', doseMg: 60 },
      { name: 'Olive leaf extract', doseMg: 20 },
      { name: 'Vitamin D3 (cholecalciferol)', doseMg: 0.025 }
    ]
  },
  {
    id: 'ultraperson-cognitive-clarity-focus',
    name: 'UltraPerson Cognitive Clarity & Focus',
    ingredients: [
      { name: 'Bacopa monnieri extract', doseMg: 320 },
      { name: 'L-Theanine', doseMg: 150 },
      { name: 'Maritime pine bark extract (Pycnogenol)', doseMg: 30 }
    ]
  },
  {
    id: 'ultraperson-sleep-quality-restoration',
    name: 'UltraPerson Sleep Quality & Restoration',
    ingredients: [
      { name: 'L-Theanine', doseMg: 200 },
      { name: 'Lemon balm extract', doseMg: 150 },
      { name: 'Magnolia bark extract', doseMg: 70 },
      { name: 'Apigenin', doseMg: 50 },
      { name: 'Saffron stigma extract', doseMg: 30 }
    ]
  },
  {
    id: 'ultraperson-stress-resilience-emotional-balance',
    name: 'UltraPerson Stress Resilience & Emotional Balance',
    ingredients: [
      { name: 'Ashwagandha root extract', doseMg: 300 },
      { name: 'L-Theanine', doseMg: 200 }
    ]
  }
];

export default function AdminUltramanApisTab() {
  const [apis, setApis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Interactive Simulator state
  const [selectedProduct, setSelectedProduct] = useState(ULTRAPERSON_SAMPLE_PRODUCTS[0]);
  const [capsulesCount, setCapsulesCount] = useState(60);
  const [marginPercent, setMarginPercent] = useState(15);

  const fetchApis = async (forceRefresh = false) => {
    try {
      setLoading(true);
      if (forceRefresh) invalidateUltramanApisCache();
      const data = await getUltramanApis({ forceRefresh });
      setApis(data || []);
      if (forceRefresh) toast.success('Pharmapolis APIs catalog refreshed from Firestore ✓');
    } catch (err) {
      toast.error('Failed to load APIs: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApis();
  }, []);

  // Filtered list
  const filteredApis = useMemo(() => {
    return apis.filter(item => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        item.name.toLowerCase().includes(q) || 
        (item.spec && item.spec.toLowerCase().includes(q)) || 
        item.id.toLowerCase().includes(q);
      const matchPriority = priorityFilter === 'ALL' || item.priority === priorityFilter;
      return matchQuery && matchPriority;
    });
  }, [apis, searchQuery, priorityFilter]);

  // Interactive Cost Calculation
  const costReport = useMemo(() => {
    if (!selectedProduct) return null;
    return calculatePharmapolisCost({
      activeIngredients: selectedProduct.ingredients,
      capsPerBottle: capsulesCount,
      grossMargin: marginPercent / 100,
      apisCatalog: apis.length > 0 ? apis : undefined
    });
  }, [selectedProduct, capsulesCount, marginPercent, apis]);

  // Priority count badges
  const priorityACount = useMemo(() => apis.filter(a => a.priority === 'A').length, [apis]);

  // DataTable column definitions (Golden Rule #3 & #30)
  const columns = [
    {
      key: 'rawIndex',
      label: '#',
      width: '5%',
      render: (val) => <span className="text-xs text-muted-foreground font-mono">#{val}</span>
    },
    {
      key: 'name',
      label: 'API / Ingredient Name',
      width: '30%',
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-sm text-foreground">{val}</span>
          <span className="text-xs text-muted-foreground line-clamp-1">{row.spec || 'Standard grade'}</span>
        </div>
      )
    },
    {
      key: 'id',
      label: 'Canonical ID',
      width: '20%',
      render: (val) => <CopyableId value={val} />
    },
    {
      key: 'priority',
      label: 'Priority',
      width: '10%',
      render: (val) => {
        if (val === 'A') return <StatusBadge status="active" label="Priority A" />;
        if (val === 'B') return <StatusBadge status="pending" label="Priority B" />;
        if (val === 'C') return <StatusBadge status="draft" label="Priority C" />;
        return <span className="text-xs text-muted-foreground">—</span>;
      }
    },
    {
      key: 'packSizeKg',
      label: 'Pack Size',
      width: '10%',
      render: (val) => <span className="text-xs font-mono">{val || 1} kg</span>
    },
    {
      key: 'priceEurKg',
      label: 'Price (€ / kg)',
      width: '12%',
      render: (val) => (
        <span className="text-xs font-semibold text-foreground font-mono">
          €{Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      )
    },
    {
      key: 'priceEurGram',
      label: 'Price (€ / g)',
      width: '13%',
      render: (val, row) => (
        <div className="flex flex-col font-mono">
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
            €{Number(val || 0).toFixed(4)}
          </span>
          {row.currencyOriginal === 'USD' && (
            <span className="text-[10px] text-muted-foreground">
              (${row.purchasePriceOriginal} USD)
            </span>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6 p-4 max-w-7xl mx-auto w-full">
      {/* ── PageHeader ── */}
      <PageHeader
        title="Pharmapolis APIs & UltraPerson Costing"
        subtitle="Authoritative catalog of 118 APIs and dynamic batch compounding cost engine for UltraPerson / Ultraman supplements."
        panel="admin"
        actions={
          <button
            onClick={() => fetchApis(true)}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Force Refresh</span>
          </button>
        }
      />

      {/* ── Metric KPIs (Rule #22) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Pharmapolis APIs"
          value={apis.length}
          subtitle="Cataloged in Firestore"
          icon={FlaskConical}
          color="#003666"
        />
        <MetricCard
          title="Priority A Actives"
          value={priorityACount}
          subtitle="Core nutraceutical ingredients"
          icon={TrendingUp}
          color="#16a34a"
        />
        <MetricCard
          title="Official Compounding Lab"
          value="Pharmapolis"
          subtitle="Plovdiv, Bulgaria (EU GMP)"
          icon={Package}
          color="#0d9488"
        />
        <MetricCard
          title="Costing Framework"
          value="CAT-CAP v1.1"
          subtitle="+9.8% Landed | +7% Merma | OP-39"
          icon={Calculator}
          color="#7c3aed"
        />
      </div>

      {/* ── INTERACTIVE COMPOUNDING COST SIMULATOR ── */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">Interactive Compounding Cost Engine</h3>
              <p className="text-xs text-muted-foreground">Calculates exact live production costs per batch and capsule based on current API prices.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Gross Margin:</span>
            <div className="flex gap-1 bg-muted p-1 rounded-lg">
              <button
                onClick={() => setMarginPercent(15)}
                className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                  marginPercent === 15 ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                15% (÷0.85)
              </button>
              <button
                onClick={() => setMarginPercent(10)}
                className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                  marginPercent === 10 ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                10% (÷0.90)
              </button>
            </div>
          </div>
        </div>

        {/* Controls row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Compounded Product Formula
            </label>
            <select
              value={selectedProduct?.id}
              onChange={(e) => {
                const prod = ULTRAPERSON_SAMPLE_PRODUCTS.find(p => p.id === e.target.value);
                if (prod) setSelectedProduct(prod);
              }}
              className="w-full text-sm bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-primary outline-none"
            >
              {ULTRAPERSON_SAMPLE_PRODUCTS.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.ingredients.length} APIs)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Capsules Per Bottle (Batch Size)
            </label>
            <div className="flex gap-2">
              {[30, 60, 90, 120, 180].map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCapsulesCount(c)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                    capsulesCount === c
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-muted/50 border-border text-foreground hover:bg-muted'
                  }`}
                >
                  {c} caps
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-end">
            <div className="flex items-center justify-between p-2.5 bg-muted/40 rounded-lg border border-border">
              <span className="text-xs text-muted-foreground">Components in Formula:</span>
              <span className="text-xs font-bold font-mono text-foreground">
                {costReport?.componentsCount} (Solid APIs + Diluent)
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic calculation results waterflow */}
        {costReport && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-2">
            {/* 1. Raw & Landed Material */}
            <div className="p-4 bg-muted/30 border border-border rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">1. Adjusted Materials</span>
                <div className="text-2xl font-bold font-mono text-foreground mt-1">
                  €{costReport.materials.adjustedMaterialCostEur.toFixed(2)}
                </div>
              </div>
              <div className="text-xs space-y-1 mt-3 pt-3 border-t border-border/60 text-muted-foreground">
                <div className="flex justify-between">
                  <span>API Net Purchase:</span>
                  <span className="font-mono text-foreground">€{costReport.materials.rawNetEur.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Landed (+9.8%):</span>
                  <span className="font-mono text-foreground">€{costReport.materials.landedCostEur.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Waste Merma (+7%):</span>
                  <span className="font-mono text-emerald-600 font-bold">+€{(costReport.materials.adjustedMaterialCostEur - costReport.materials.landedCostEur).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* 2. Capsule Preparation (CAT-CAP) */}
            <div className="p-4 bg-muted/30 border border-border rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">2. Prep & Labour</span>
                <div className="text-2xl font-bold font-mono text-foreground mt-1">
                  €{costReport.preparation.totalPreparationEur.toFixed(2)}
                </div>
              </div>
              <div className="text-xs space-y-1 mt-3 pt-3 border-t border-border/60 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Labour ({costReport.labour.totalLabourMinutes} min):</span>
                  <span className="font-mono text-foreground">€{costReport.labour.totalLabourEur.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Empty Caps (CON-08):</span>
                  <span className="font-mono text-foreground">€{costReport.preparation.emptyCapsulesEur.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fixed Packaging:</span>
                  <span className="font-mono text-foreground">€{costReport.preparation.packagingEur.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* 3. Total Production Cost (TPC) */}
            <div className="p-4 bg-muted/30 border border-border rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">3. Total Production</span>
                <div className="text-2xl font-bold font-mono text-foreground mt-1">
                  €{costReport.totalProductionCostEur.toFixed(2)}
                </div>
              </div>
              <div className="text-xs space-y-1 mt-3 pt-3 border-t border-border/60 text-muted-foreground">
                <div className="flex justify-between">
                  <span>TPC / Bottle:</span>
                  <span className="font-mono text-foreground">€{costReport.totalProductionCostEur.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pharmapolis Margin:</span>
                  <span className="font-mono text-foreground font-bold">{costReport.margin.percentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Lab Margin (€):</span>
                  <span className="font-mono text-foreground">€{costReport.margin.pharmapolisProfitEur.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* 4. Final Manufacturing Selling Price */}
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">4. Final Selling Price</span>
                <div className="text-3xl font-extrabold font-mono text-emerald-700 dark:text-emerald-400 mt-1">
                  €{costReport.finalPricing.netSellingPriceEur.toFixed(2)}
                  <span className="text-xs font-normal text-muted-foreground ml-1">net</span>
                </div>
              </div>
              <div className="text-xs space-y-1.5 mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800/60">
                <div className="flex justify-between font-bold text-emerald-900 dark:text-emerald-200">
                  <span>Cost Per Capsule:</span>
                  <span className="font-mono text-sm">€{costReport.finalPricing.netPerCapEur.toFixed(3)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground text-[11px]">
                  <span>Incl. 20% VAT:</span>
                  <span className="font-mono">€{costReport.finalPricing.grossSellingPriceEur.toFixed(2)} (€{costReport.finalPricing.grossPerCapEur.toFixed(3)}/cap)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── APIS SEARCH & FILTER BAR ── */}
      <div className="flex flex-col gap-3">
        <GlobalSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Search Pharmapolis APIs by name, chemical specification, or ID (⌘K)..."
          resultCount={filteredApis.length}
          namespace="pharmapolis_apis"
          filters={[
            { id: 'ALL', label: 'All Priorities', active: priorityFilter === 'ALL', onClick: () => setPriorityFilter('ALL') },
            { id: 'A', label: 'Priority A (Core)', active: priorityFilter === 'A', onClick: () => setPriorityFilter('A') },
            { id: 'B', label: 'Priority B', active: priorityFilter === 'B', onClick: () => setPriorityFilter('B') },
            { id: 'C', label: 'Priority C (Specialty)', active: priorityFilter === 'C', onClick: () => setPriorityFilter('C') }
          ]}
        />
      </div>

      {/* ── APIS DATA TABLE (Rule #3) ── */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <DataTable
          data={filteredApis}
          columns={columns}
          loading={loading}
          emptyMessage="No Pharmapolis APIs found matching your search."
          expandableRender={(row) => (
            <div className="p-4 bg-muted/20 border-t border-border grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="font-bold text-foreground block mb-1">Pharmacopeial Specification</span>
                <p className="text-muted-foreground">{row.spec || 'Standard compounded grade Ph.Eur / USP.'}</p>
                <div className="mt-2 text-muted-foreground">
                  <span>Packaging size: </span>
                  <strong className="text-foreground">{row.packSizeKg} kg</strong>
                </div>
              </div>

              <div>
                <span className="font-bold text-foreground block mb-1">Pricing Breakdown</span>
                <div className="space-y-1 font-mono text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Base Purchase (€/kg):</span>
                    <strong className="text-foreground">€{Number(row.priceEurKg).toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Base Purchase (€/g):</span>
                    <strong className="text-emerald-600">€{Number(row.priceEurGram).toFixed(4)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Landed +9.8% (€/g):</span>
                    <strong className="text-foreground">€{(row.priceEurGram * 1.098).toFixed(4)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Waste Merma +7% (€/g):</span>
                    <strong className="text-foreground">€{(row.priceEurGram * 1.098 * 1.07).toFixed(4)}</strong>
                  </div>
                </div>
              </div>

              <div>
                <span className="font-bold text-foreground block mb-1">Cost Simulation by Capsule Dose</span>
                <div className="space-y-1 font-mono text-muted-foreground">
                  <div className="flex justify-between">
                    <span>At 50 mg dose:</span>
                    <strong className="text-foreground">€{(0.05 * row.priceEurGram * 1.098 * 1.07).toFixed(4)} / cap</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>At 100 mg dose:</span>
                    <strong className="text-foreground">€{(0.10 * row.priceEurGram * 1.098 * 1.07).toFixed(4)} / cap</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>At 250 mg dose:</span>
                    <strong className="text-foreground">€{(0.25 * row.priceEurGram * 1.098 * 1.07).toFixed(4)} / cap</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
}
