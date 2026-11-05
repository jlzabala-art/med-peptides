"use client";

import React, { useState, useMemo } from 'react';
import { Download, Search, FileText, CheckCircle2, DollarSign, Package, Layers, Sparkles, Calendar } from 'lucide-react';
import { DataTable, StatusBadge, CopyableId } from '../../ui';
import MetricCard from '../../ui/MetricCard';
import GlobalSearchBar from '../../ui/GlobalSearchBar';
import { getLotuslandProcurementReport } from '../../../services/lotuslandProcurementService';
import { exportLotuslandProcurementXlsx } from '../../../utils/exportLotuslandProcurementXlsx';
import { LotuslandApiMobileCard } from '../../../app/b2b/lotusland/LotuslandPublicPortalClient';
import toast from 'react-hot-toast';

export default function LotuslandProcurementLedger() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');

  const reportData = useMemo(() => {
    return getLotuslandProcurementReport();
  }, []);

  const { summary, apis } = reportData;

  const categories = useMemo(() => {
    const set = new Set(apis.map(a => a.therapeuticClass));
    return ['all', ...Array.from(set)];
  }, [apis]);

  const filteredApis = useMemo(() => {
    return apis.filter(api => {
      const matchesSearch = !searchQuery || 
        api.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        api.therapeuticClass.toLowerCase().includes(searchQuery.toLowerCase()) ||
        api.casNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        api.invoiceRefs.some(ref => ref.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesClass = selectedClass === 'all' || api.therapeuticClass === selectedClass;

      return matchesSearch && matchesClass;
    });
  }, [apis, searchQuery, selectedClass]);

  const handleExport = () => {
    try {
      const fileName = exportLotuslandProcurementXlsx();
      toast.success(`Exported: ${fileName}`, { icon: '📊' });
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to generate Excel export.');
    }
  };

  const columns = [
    {
      key: 'name',
      accessor: 'name',
      header: 'API Active Principle',
      label: 'API Active Principle',
      width: '24%',
      sortable: true,
      sortValue: (r) => r.name,
      render: (_val, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 700, color: '#003666', fontSize: '0.85rem' }}>
              {row.name}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.70rem', color: '#64748b' }}>
            <span>CAS: {row.casNumber || 'N/A'}</span>
            <span>·</span>
            <span>{row.grade}</span>
          </div>
        </div>
      )
    },
    {
      key: 'therapeuticClass',
      accessor: 'therapeuticClass',
      header: 'Therapeutic Category',
      label: 'Therapeutic Category',
      width: '16%',
      sortable: true,
      sortValue: (r) => r.therapeuticClass,
      render: (_val, row) => (
        <span style={{
          fontSize: '0.72rem',
          fontWeight: 600,
          backgroundColor: '#f1f5f9',
          color: '#334155',
          padding: '2px 8px',
          borderRadius: '4px',
          display: 'inline-block'
        }}>
          {row.therapeuticClass}
        </span>
      )
    },
    {
      key: 'totalGrams',
      accessor: 'totalGrams',
      header: 'Total Procured',
      label: 'Total Procured',
      width: '11%',
      sortable: true,
      sortValue: (r) => r.totalGrams,
      render: (_val, row) => (
        <div>
          <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.86rem' }}>
            {row.totalGrams.toLocaleString()} g
          </span>
          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
            Across {row.invoiceCount} {row.invoiceCount === 1 ? 'order' : 'orders'}
          </div>
        </div>
      )
    },
    {
      key: 'latestDate',
      accessor: 'latestDate',
      header: 'Latest Invoice Date',
      label: 'Latest Invoice Date',
      width: '14%',
      sortable: true,
      sortValue: (r) => r.latestDate,
      render: (_val, row) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={12} color="#003666" />
            <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.80rem' }}>
              {row.latestDate}
            </span>
          </div>
          <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
            {row.invoiceCount > 1 ? `${row.firstDate} → ${row.latestDate}` : 'Single release'}
          </div>
        </div>
      )
    },
    {
      key: 'catalogPrice',
      accessor: 'catalogPrice',
      header: 'Invoiced Cost / g',
      label: 'Invoiced Cost / g',
      width: '15%',
      sortable: true,
      sortValue: (r) => r.catalogPrice,
      render: (_val, row) => (
        <div>
          <span style={{ fontWeight: 750, color: '#003666', fontSize: '0.88rem' }}>
            ${row.catalogPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '1px' }}>
            {row.invoiceCount > 1
              ? `Avg (${row.invoiceCount} orders) · Latest: $${(row.latestCost * 1.06).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
              : 'Single release'}
          </div>
        </div>
      )
    },
    {
      key: 'totalSpendUSD',
      accessor: 'totalSpendUSD',
      header: 'Lifetime Spend',
      label: 'Lifetime Spend',
      width: '13%',
      sortable: true,
      sortValue: (r) => r.totalSpendUSD,
      render: (_val, row) => (
        <span style={{ fontWeight: 800, color: '#003666', fontSize: '0.88rem' }}>
          ${row.totalSpendUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      )
    }
  ];

  // Master-Detail Expandable Row
  const renderDetailRow = (row) => (
    <div style={{
      backgroundColor: '#f8fafc',
      padding: '1rem 1.25rem',
      borderLeft: '4px solid #003666',
      borderRadius: '0 0 8px 8px',
      margin: '0.25rem 0 0.5rem 0'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h5 style={{ margin: 0, fontSize: '0.82rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase' }}>
          Purchase Order Receipts for {row.name}
        </h5>
        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
          First Order: {row.firstDate} · Most Recent: {row.latestDate}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
        {row.receipts.map((rec, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '0.65rem 0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.78rem' }}>
                {rec.invoiceNumber}
              </span>
              <span style={{
                fontSize: '0.70rem',
                color: '#003666',
                background: '#eff6ff',
                border: '1px solid #dbeafe',
                padding: '2px 6px',
                borderRadius: '4px',
                fontWeight: 650,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Calendar size={11} color="#1d4ed8" />
                {rec.date}
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#475569' }}>
              Entity: {rec.buyer}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', borderTop: '1px solid #f1f5f9', paddingTop: '4px' }}>
              <span style={{ fontWeight: 600, color: '#0284c7', fontSize: '0.75rem' }}>
                {rec.quantityGrams} g @ ${rec.unitCostUSD.toFixed(2)}/g
              </span>
              <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.80rem' }}>
                ${rec.lineTotalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2rem' }}>
      {/* Executive Header with 1-Click Excel Export */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '1.25rem',
        backgroundColor: '#f8fafc',
        borderRadius: '10px',
        border: '1px solid #e2e8f0'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '0.70rem',
              fontWeight: 800,
              backgroundColor: '#003666',
              color: '#ffffff',
              padding: '2px 8px',
              borderRadius: '4px'
            }}>
              PRESET REPORT
            </span>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#003666', fontWeight: 800 }}>
              Lotusland Limited · Historical API Procurement Audit
            </h3>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
            Consolidated active principle purchases, weighted per-gram procurement costs, and catalog margins across 10 commercial releases.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="btn btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#16a34a',
            borderColor: '#15803d',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.85rem',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(22, 163, 74, 0.2)'
          }}
        >
          <Download size={16} /> Export Lotusland Audit (.xlsx)
        </button>
      </div>

      {/* 4 GCP Metric Cards (Rule #22) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <MetricCard
          title="Total Lifetime Spend"
          value={`$${summary.totalSpendUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle="10 Commercial Releases Reconciled"
          icon={DollarSign}
          color="#003666"
        />
        <MetricCard
          title="Total API Mass Procured"
          value={`${summary.totalGramsProcured.toLocaleString('en-US')} g`}
          subtitle="Cumulative Pure Lyophilized & Powder"
          icon={Package}
          color="#0284c7"
        />
        <MetricCard
          title="Unique Active Principles"
          value={`${summary.uniqueApisCount} APIs`}
          subtitle="Metabolic, Healing & Bioregulators"
          icon={Layers}
          color="#16a34a"
        />
        <MetricCard
          title="Audited Date Range"
          value={summary.dateRange}
          subtitle="100% Traceable to Signed Invoices"
          icon={CheckCircle2}
          color="#7c3aed"
        />
      </div>

      {/* Priority Search & Category Filter (Rule #7) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <GlobalSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search 41 APIs (e.g. Tirzepatide, BPC-157, Semaglutide, Epithalon, CAS)..."
          resultCount={filteredApis.length}
          totalCount={apis.length}
        />

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', marginRight: '4px' }}>
            Category:
          </span>
          {categories.slice(0, 8).map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedClass(cat)}
              style={{
                background: selectedClass === cat ? '#003666' : '#f1f5f9',
                color: selectedClass === cat ? '#ffffff' : '#334155',
                border: 'none',
                borderRadius: '16px',
                padding: '3px 10px',
                fontSize: '0.72rem',
                fontWeight: selectedClass === cat ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {cat === 'all' ? 'All Classes' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Authoritative DataTable with Master-Detail (Rule #3 & #4) */}
      <DataTable
        data={filteredApis}
        columns={columns}
        keyField="name"
        sortable={true}
        mobileCardComponent={LotuslandApiMobileCard}
        expandableRender={renderDetailRow}
        emptyTitle="No APIs match your search criteria"
        emptySubtitle="Try searching for another peptide name or resetting filters."
      />
    </div>
  );
}
