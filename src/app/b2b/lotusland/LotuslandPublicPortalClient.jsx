"use client";

import React, { useState, useMemo } from 'react';
import {
  Download,
  Share2,
  Building2,
  Package,
  Layers,
  DollarSign,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  FileText,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Info,
  Sparkles
} from 'lucide-react';
import { DataTable, StatusBadge, CopyableId } from '@/components/ui';
import MetricCard from '@/components/ui/MetricCard';
import GlobalSearchBar from '@/components/ui/GlobalSearchBar';
import { getLotuslandProcurementReport } from '@/services/lotuslandProcurementService';
import { exportLotuslandProcurementXlsx } from '@/utils/exportLotuslandProcurementXlsx';
import { KNOWN_PEPTIDE_DATA } from '@/utils/knownPeptideData';
import { getPeptideReferenceDossier } from '@/data/peptideReferenceDossiers';
import toast from 'react-hot-toast';

export default function LotuslandPublicPortalClient() {
  const [activeTab, setActiveTab] = useState('apis'); // 'apis' | 'invoices' | 'corporate'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');

  const reportData = useMemo(() => {
    return getLotuslandProcurementReport();
  }, []);

  const { summary, apis, invoices, metadata } = reportData;

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

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Public link copied to clipboard!', { icon: '🔗' });
    }
  };

  // Helper for Clinical Info
  const getClinicalInfo = (apiName) => {
    const cleanKey = apiName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const knownMatch = Object.entries(KNOWN_PEPTIDE_DATA).find(([k]) => {
      const kClean = k.toLowerCase().replace(/[^a-z0-9]/g, '');
      return cleanKey.includes(kClean) || kClean.includes(cleanKey);
    });
    const known = knownMatch ? knownMatch[1] : null;
    const dossier = getPeptideReferenceDossier({ name: apiName, canonicalName: apiName });

    return {
      targetSystem: known?.targetSystem || dossier?.pharmacology?.title || 'Targeted Cellular & Metabolic Modulation',
      moa: known?.mechanismOfAction || dossier?.pharmacology?.moa || 'Selective receptor ligand stimulating targeted physiological cascades.',
      halfLife: known?.halfLife || 'Physiological peptide kinetics (protease-regulated clearance)',
      sequence: known?.sequence || null
    };
  };

  const apiColumns = [
    {
      header: 'API Active Principle',
      accessor: 'name',
      width: '24%',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 750, color: '#003666', fontSize: '0.88rem' }}>
              {row.name}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.70rem', color: '#64748b' }}>
            <span>CAS: {row.casNumber}</span>
            <span>·</span>
            <span>{row.grade}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Therapeutic Class',
      accessor: 'therapeuticClass',
      width: '16%',
      render: (row) => (
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
      header: 'Total Procured',
      accessor: 'totalGrams',
      width: '11%',
      render: (row) => (
        <div>
          <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.86rem' }}>
            {row.totalGrams.toLocaleString()} g
          </span>
          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
            {row.invoiceCount} {row.invoiceCount === 1 ? 'order' : 'orders'}
          </div>
        </div>
      )
    },
    {
      header: 'Latest Invoice Date',
      accessor: 'latestDate',
      width: '14%',
      render: (row) => (
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
      header: 'Weighted Cost / g',
      accessor: 'weightedAvgCost',
      width: '11%',
      render: (row) => (
        <div>
          <span style={{ fontWeight: 700, color: '#0284c7', fontSize: '0.85rem' }}>
            ${row.weightedAvgCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
            Latest: ${row.latestCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
      )
    },
    {
      header: 'Catalog Price / g',
      accessor: 'catalogPrice',
      width: '11%',
      render: (row) => (
        <div>
          <span style={{ fontWeight: 750, color: '#16a34a', fontSize: '0.85rem' }}>
            ${row.catalogPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <div style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 600 }}>
            +{row.marginPercent}% margin
          </div>
        </div>
      )
    },
    {
      header: 'Lifetime Spend',
      accessor: 'totalSpendUSD',
      width: '13%',
      render: (row) => (
        <span style={{ fontWeight: 800, color: '#003666', fontSize: '0.90rem' }}>
          ${row.totalSpendUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      )
    }
  ];

  const invoiceColumns = [
    {
      header: 'Invoice #',
      accessor: 'invoiceNumber',
      width: '16%',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontWeight: 750, color: '#003666', fontSize: '0.82rem' }}>
            {row.invoiceNumber}
          </span>
        </div>
      )
    },
    {
      header: 'Release Date',
      accessor: 'date',
      width: '14%',
      render: (row) => (
        <span style={{ fontSize: '0.78rem', color: '#475569' }}>
          {row.date}
        </span>
      )
    },
    {
      header: 'Licensed Buyer Entity',
      accessor: 'buyer',
      width: '32%',
      render: (row) => (
        <div style={{ fontSize: '0.76rem', color: '#1e293b', fontWeight: 600 }}>
          {row.buyer}
        </div>
      )
    },
    {
      header: 'Original Total',
      accessor: 'grandTotal',
      width: '18%',
      render: (row) => (
        <div>
          <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.84rem' }}>
            {row.currency === 'EUR' ? '€' : '$'}{row.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} {row.currency}
          </span>
          {row.currency === 'EUR' && (
            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
              FX Rate: 1.08 USD/EUR
            </div>
          )}
        </div>
      )
    },
    {
      header: 'USD Equivalent',
      accessor: 'grandTotalUSD',
      width: '20%',
      render: (row) => (
        <span style={{ fontWeight: 800, color: '#003666', fontSize: '0.88rem' }}>
          ${row.grandTotalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
        </span>
      )
    }
  ];

  // Master-Detail Expandable Row
  const renderDetailRow = (row) => {
    const clinical = getClinicalInfo(row.name);

    return (
      <div style={{
        backgroundColor: '#f8fafc',
        padding: '1.25rem',
        borderLeft: '4px solid #003666',
        borderRadius: '0 0 8px 8px',
        margin: '0.25rem 0 0.5rem 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {/* Quick Clinical Indication Accordion */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          padding: '0.85rem 1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Sparkles size={14} color="#003666" />
            <h5 style={{ margin: 0, fontSize: '0.78rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase' }}>
              Clinical Indication & Mechanism (¿Para qué sirve?)
            </h5>
          </div>
          <p style={{ margin: '0 0 8px 0', fontSize: '0.80rem', color: '#334155', lineHeight: 1.5 }}>
            <strong>Target System:</strong> {clinical.targetSystem}
          </p>
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: 1.45 }}>
            <strong>Mechanism:</strong> {clinical.moa}
          </p>
        </div>

        {/* Purchase Receipts */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h5 style={{ margin: 0, fontSize: '0.76rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
              Reconciled Purchase Orders ({row.receipts.length})
            </h5>
            <span style={{ fontSize: '0.70rem', color: '#64748b' }}>
              First Order: {row.firstDate} · Most Recent: {row.latestDate}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.65rem' }}>
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
                <div style={{ fontSize: '0.70rem', color: '#64748b' }}>
                  {rec.buyer}
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
      </div>
    );
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', color: '#202124' }}>
      {/* Google Cloud Style Header Top Bar */}
      <header style={{
        backgroundColor: '#0b192c',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '0.75rem 1.5rem',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            backgroundColor: '#00a3e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.85rem'
          }}>
            A
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.02em' }}>
              ATLAS HEALTH SERVICES
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
              Global Sourcing Network · Public Partner Portal
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={handleExport}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#16a34a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Download size={14} /> Download Audit (.xlsx)
          </button>
          <button
            type="button"
            onClick={handleShare}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Share2 size={14} /> Share
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1rem 4rem 1rem' }}>
        {/* Title & Institutional Eyebrow */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              backgroundColor: '#003666',
              color: '#ffffff',
              padding: '2px 8px',
              borderRadius: '4px'
            }}>
              OFFICIAL SUPPLIER PORTAL
            </span>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Hong Kong SAR Reg: 71705158 · Corridors: Hong Kong & UAE (Magenta / Mediluxe)
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(1.35rem, 3.5vw, 1.85rem)',
            fontWeight: 800,
            color: '#003666',
            margin: '0 0 6px 0',
            letterSpacing: '-0.02em',
            textWrap: 'balance'
          }}>
            Lotusland Limited · Historical API Procurement & Commercial Audit
          </h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', maxWidth: '850px', lineHeight: 1.5 }}>
            Consolidated ledger of active pharmaceutical principles (APIs), per-gram acquisition costs, and reconciled commercial invoices from the beginning of the commercial relationship.
          </p>
        </div>

        {/* 4 GCP Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <MetricCard
            title="Total Sourcing Capital"
            value={`$${summary.totalSpendUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            subtitle="10 Commercial Releases Reconciled"
            icon={DollarSign}
            color="#003666"
          />
          <MetricCard
            title="Total API Mass Procured"
            value={`${summary.totalGramsProcured.toLocaleString('en-US')} g`}
            subtitle="Pure Lyophilized Bulk Mass"
            icon={Package}
            color="#0284c7"
          />
          <MetricCard
            title="Active Principles (APIs)"
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

        {/* GCP Style Navigation Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #cbd5e1',
          marginBottom: '1.25rem',
          gap: '8px'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('apis')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'apis' ? '3px solid #003666' : '3px solid transparent',
              color: activeTab === 'apis' ? '#003666' : '#64748b',
              fontWeight: activeTab === 'apis' ? 800 : 600,
              padding: '10px 16px',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Layers size={16} /> API Raw Materials ({apis.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('invoices')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'invoices' ? '3px solid #003666' : '3px solid transparent',
              color: activeTab === 'invoices' ? '#003666' : '#64748b',
              fontWeight: activeTab === 'invoices' ? 800 : 600,
              padding: '10px 16px',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FileText size={16} /> Commercial Invoices ({invoices.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('corporate')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'corporate' ? '3px solid #003666' : '3px solid transparent',
              color: activeTab === 'corporate' ? '#003666' : '#64748b',
              fontWeight: activeTab === 'corporate' ? 800 : 600,
              padding: '10px 16px',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Building2 size={16} /> Corporate & Banking Registry
          </button>
        </div>

        {/* Tab 1: API Raw Materials */}
        {activeTab === 'apis' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <GlobalSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search 41 APIs (e.g. Tirzepatide, BPC-157, Semaglutide, Epithalon, CAS)..."
              resultCount={filteredApis.length}
              totalCount={apis.length}
            />

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', marginRight: '4px' }}>
                Filter Class:
              </span>
              {categories.slice(0, 8).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedClass(cat)}
                  style={{
                    background: selectedClass === cat ? '#003666' : '#ffffff',
                    color: selectedClass === cat ? '#ffffff' : '#334155',
                    border: '1px solid #cbd5e1',
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

            <DataTable
              data={filteredApis}
              columns={apiColumns}
              keyField="name"
              expandableRender={renderDetailRow}
              emptyTitle="No APIs match your filter"
              emptySubtitle="Try adjusting your search or category."
            />
          </div>
        )}

        {/* Tab 2: Commercial Invoices */}
        {activeTab === 'invoices' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              padding: '1rem',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '0.82rem',
              color: '#475569',
              lineHeight: 1.5
            }}>
              Summary of all 10 certified commercial releases executed between <strong>Lotusland Limited</strong> and licensed receiving pharmacies (<strong>Magenta RX Plus Compounding Pharmacy</strong> &amp; <strong>Mediluxe Health Solutions FZE</strong>).
            </div>

            <DataTable
              data={invoices}
              columns={invoiceColumns}
              keyField="invoiceNumber"
              emptyTitle="No invoices found"
              emptySubtitle="All 10 commercial releases are reconciled."
            />
          </div>
        )}

        {/* Tab 3: Corporate & Banking Registry */}
        {activeTab === 'corporate' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {/* Supplier Details */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <Building2 size={18} color="#003666" />
                <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#003666' }}>
                  Supplier Legal Entity
                </h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.80rem' }}>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.70rem', textTransform: 'uppercase', fontWeight: 700 }}>Legal Name</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{metadata.legalName}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.70rem', textTransform: 'uppercase', fontWeight: 700 }}>Registration Number</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>Hong Kong SAR #{metadata.regNumber}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.70rem', textTransform: 'uppercase', fontWeight: 700 }}>Registered Office</span>
                  <span style={{ color: '#334155' }}>{metadata.address}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.70rem', textTransform: 'uppercase', fontWeight: 700 }}>Commercial Desk Contact</span>
                  <span style={{ color: '#334155' }}>{metadata.contactPerson} ({metadata.phone}) · {metadata.email}</span>
                </div>
              </div>
            </div>

            {/* Banking Settlement */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <ShieldCheck size={18} color="#16a34a" />
                <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#003666' }}>
                  Banking &amp; Settlement Corridor
                </h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.80rem' }}>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.70rem', textTransform: 'uppercase', fontWeight: 700 }}>Beneficiary Bank</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>Citibank N.A., Hong Kong Branch</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.70rem', textTransform: 'uppercase', fontWeight: 700 }}>Beneficiary Name</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>Lotusland Limited</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.70rem', textTransform: 'uppercase', fontWeight: 700 }}>Bank Account Number</span>
                  <span style={{ fontWeight: 700, color: '#003666', fontFamily: 'monospace' }}>395710448</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.70rem', textTransform: 'uppercase', fontWeight: 700 }}>SWIFT / BIC Code</span>
                  <span style={{ fontWeight: 700, color: '#003666', fontFamily: 'monospace' }}>CITIHKHX</span>
                </div>
              </div>
            </div>

            {/* Licensed Receiving Facilities */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <Package size={18} color="#0284c7" />
                <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#003666' }}>
                  Authorized Facilities in UAE
                </h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.80rem' }}>
                <div>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>Magenta Pharma Medicine Trading LLC</span>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.70rem' }}>TRN: 100574948400003 · Dubai Investments Park 2</span>
                  <span style={{ color: '#334155', fontSize: '0.72rem' }}>Magenta RX Plus Compounding Pharmacy (Al Mamzar &amp; Al Jaddaf)</span>
                </div>
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>Mediluxe Health Solutions FZE</span>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.70rem' }}>TRN: 104906198700003 (Medical Guild Trading FZC)</span>
                  <span style={{ color: '#334155', fontSize: '0.72rem' }}>Sharjah Publishing City &amp; Dubai Silicon Oasis</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

