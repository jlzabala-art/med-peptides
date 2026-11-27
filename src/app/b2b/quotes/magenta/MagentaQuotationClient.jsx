'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Download,
  Share2,
  Check,
  ShieldCheck,
  Building2,
  Calendar,
  Box,
  Truck,
  Sparkles,
  Layers,
  Clock,
  Printer,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '@/components/ui/DataTable';
import CopyableId from '@/components/ui/CopyableId';
import Breadcrumb from '@/components/ui/Breadcrumb';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import { useSurfacePolicy } from '@/hooks/useSurfacePolicy';
import {
  MAGENTA_OFFICIAL_QUOTATION_202611,
  MAGENTA_OFFICIAL_QUOTATION_20261127,
} from '@/services/lotuslandProcurementService';

export default function MagentaQuotationClient() {
  const { canSeeCostTier } = useSurfacePolicy();
  const [selectedQuoteId, setSelectedQuoteId] = useState('QT-MAG-20261127');
  const quote =
    selectedQuoteId === 'QT-MAG-20261127'
      ? MAGENTA_OFFICIAL_QUOTATION_20261127
      : MAGENTA_OFFICIAL_QUOTATION_202611;
  const [copied, setCopied] = useState(false);
  const [showInternalAudit, setShowInternalAudit] = useState(false);
  const showAudit = Boolean(canSeeCostTier && showInternalAudit);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Official quotation link copied to clipboard');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const columns = [
    {
      key: 'itemNumber',
      header: '#',
      label: '#',
      width: '5%',
      align: 'center',
      render: (val) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#64748b' }}>
          {val}
        </span>
      )
    },
    {
      key: 'apiName',
      header: 'API Active Principle & CAS',
      label: 'API Active Principle & CAS',
      width: '28%',
      render: (_val, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 800, color: '#003666', fontSize: '0.90rem' }}>
              {row.apiName}
            </span>
            {row.datasheetHref && (
              <Link
                href={row.datasheetHref}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: '#1a73e8',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  padding: '2px 7px',
                  borderRadius: '999px',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
                title={`Open shareable technical datasheet for ${row.apiName}`}
              >
                <FileText size={11} />
                <span>Technical Datasheet</span>
              </Link>
            )}
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
      key: 'therapeuticClass',
      header: 'Therapeutic Class',
      label: 'Therapeutic Class',
      width: '18%',
      render: (val) => (
        <span style={{
          fontSize: '0.72rem',
          fontWeight: 650,
          backgroundColor: '#eff6ff',
          color: '#1e40af',
          padding: '2px 8px',
          borderRadius: '4px',
          display: 'inline-block'
        }}>
          {val}
        </span>
      )
    },
    {
      key: 'quantityGrams',
      header: 'Allocated Quantity',
      label: 'Allocated Quantity',
      width: '13%',
      align: 'right',
      render: (val) => (
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.90rem' }}>
            {val} g
          </span>
          <div style={{ fontSize: '0.66rem', color: '#64748b' }}>
            {val < 1 ? `${val * 1000} mg` : 'Net API mass'}
          </div>
        </div>
      )
    },
    ...(showAudit ? [
      {
        key: 'lotuslandUnitCostUSD',
        header: 'Net Cost / g (-25%)',
        label: 'Net Cost / g (-25%)',
        width: '12%',
        align: 'right',
        render: (val) => (
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontWeight: 700, color: '#0284c7', fontSize: '0.84rem' }}>
              ${val.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <div style={{ fontSize: '0.64rem', color: '#64748b' }}>
              Internal Cost
            </div>
          </div>
        )
      }
    ] : []),
    {
      key: 'unitPriceUSD',
      header: showAudit ? 'Offered / g (+6%)' : 'Special Volume Price / g',
      label: 'Special Volume Price / g',
      width: showAudit ? '12%' : '18%',
      align: 'right',
      render: (val, row) => (
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontWeight: 800, color: '#166534', fontSize: '0.92rem' }}>
            ${val.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          {row.listPriceUSD ? (
            <div style={{ fontSize: '0.64rem', color: '#64748b', textDecoration: 'line-through' }}>
              List: ${row.listPriceUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}/g
            </div>
          ) : (
            <div style={{ fontSize: '0.64rem', color: '#16a34a', fontWeight: 650 }}>
              ${row.lineTotalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} total
            </div>
          )}
        </div>
      )
    },
    {
      key: 'lineTotalUSD',
      header: 'Total Amount (USD)',
      label: 'Total Amount (USD)',
      width: '12%',
      align: 'right',
      render: (val) => (
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontWeight: 850, color: '#003666', fontSize: '0.94rem' }}>
            ${val.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      )
    }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <PublicUnifiedHeader
        brandHref="/lotusland"
        loginRedirect="/b2b/quotes/magenta"
        hideCurrencySelector={true}
        hideAccountManager={true}
        breadcrumb={[
          { label: 'B2B Quotations', href: '/lotusland' },
          { label: quote.quoteId },
        ]}
        extraActions={
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            {canSeeCostTier && (
              <button
                type="button"
                onClick={() => setShowInternalAudit(!showInternalAudit)}
                className="puh-btn puh-btn-ghost"
                title="Admin only: toggle internal cost & 6% commission audit"
              >
                <span className="puh-btn-label">
                  {showAudit ? 'Admin Audit (ON)' : 'Client View'}
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={handlePrint}
              className="puh-btn"
              style={{
                background: '#2563eb',
                border: '1px solid #1d4ed8',
                color: '#ffffff',
                fontWeight: 600,
              }}
            >
              <Printer size={14} />
              <span className="puh-btn-label">Print / Save PDF</span>
            </button>
          </div>
        }
      />

      {/* ── Main Container ── */}
      <main style={{ maxWidth: '1440px', width: '100%', margin: '0 auto', padding: '1.25rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Breadcrumb */}
        <Breadcrumb items={[
          { label: 'B2B Procurement', href: '/lotusland' },
          { label: 'Lotusland Sourcing Corridor', href: '/lotusland' },
          { label: `Quotation ${quote.quoteId}` }
        ]} />

        {/* Quote Switcher (Admin & Client) */}
        <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'QT-MAG-20261127', label: 'QT-MAG-20261127 · Metabolic & Incretin Bulk (270g · $303,690)' },
            { id: 'QT-MAG-20261104', label: 'QT-MAG-20261104 · Previous Allocation (60.2g · $37,179.50)' },
          ].map((opt) => {
            const active = selectedQuoteId === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedQuoteId(opt.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '999px',
                  fontSize: '0.76rem',
                  fontWeight: active ? 700 : 600,
                  cursor: 'pointer',
                  backgroundColor: active ? '#003666' : '#ffffff',
                  color: active ? '#ffffff' : '#3c4043',
                  border: `1px solid ${active ? '#003666' : '#dadce0'}`,
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* ── Header Metadata Box (Google Cloud Console Card Pattern) ── */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #dadce0',
          padding: '1.25rem 1.5rem',
          boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  background: '#dcfce7',
                  color: '#166534',
                  border: '1px solid #86efac',
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  Verified B2B Spot Allocation
                </span>
                <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                  Reference: <CopyableId value={quote.quoteId} />
                </span>
              </div>
              <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#003666' }}>
                Magenta Pharma Medicine Trading LLC · API Sourcing Allocation
              </h1>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                Issued by {quote.issuer.companyName} ({quote.issuer.jurisdiction}) — Official Institutional API Volume Proposal.
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.70rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                Quotation Date
              </div>
              <div style={{ fontSize: '0.90rem', fontWeight: 750, color: '#0f172a' }}>
                {quote.date}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#d97706', fontWeight: 650, marginTop: '2px' }}>
                Valid until: {quote.validUntil} (US Allocation Stock)
              </div>
            </div>
          </div>

          {/* Issuer vs Client Details 2-Column */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid #e2e8f0'
          }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px 12px' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase', marginBottom: '4px' }}>
                🏢 Issued By (Supplier & Sourcing Agent)
              </div>
              <div style={{ fontWeight: 750, color: '#0f172a', fontSize: '0.84rem' }}>
                {quote.issuer.companyName}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                TRN: {quote.issuer.trn} · {quote.issuer.facility}
              </div>
              {showAudit && (
                <div style={{ fontSize: '0.72rem', color: '#0284c7', marginTop: '2px' }}>
                  Internal Source: {quote.supplier.companyName} ({quote.supplier.allocationSource})
                </div>
              )}
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px 12px' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase', marginBottom: '4px' }}>
                🏥 Billed To (Licensed Client)
              </div>
              <div style={{ fontWeight: 750, color: '#0f172a', fontSize: '0.84rem' }}>
                {quote.client.companyName}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                TRN: {quote.client.trn} · {quote.client.facility}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#166534', marginTop: '2px' }}>
                Terms: {quote.client.paymentTerms}
              </div>
            </div>
          </div>
        </div>

        {/* ── 4 Google Cloud Metric KPIs (Rule #22) ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px'
        }}>
          <div style={{ background: '#ffffff', border: '1px solid #dadce0', borderRadius: '8px', padding: '12px 14px', boxShadow: '0 1px 2px rgba(60,64,67,0.06)' }}>
            <span style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              Total Invoiced Amount
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 850, color: '#003666', marginTop: '3px' }}>
              ${quote.totals.grandTotalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.70rem', color: '#16a34a', fontWeight: 650, marginTop: '2px' }}>
              Net Settlement to Mediluxe (USD)
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #dadce0', borderRadius: '8px', padding: '12px 14px', boxShadow: '0 1px 2px rgba(60,64,67,0.06)' }}>
            <span style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              Procured Mass & Scope
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 850, color: '#0f172a', marginTop: '3px' }}>
              {quote.totals.totalQuantityGrams} g
            </div>
            <div style={{ fontSize: '0.70rem', color: '#64748b', marginTop: '2px' }}>
              {quote.items.length} Specialized Active Principles
            </div>
          </div>

          {showAudit ? (
            <>
              <div style={{ background: '#ffffff', border: '1px solid #dadce0', borderRadius: '8px', padding: '12px 14px', boxShadow: '0 1px 2px rgba(60,64,67,0.06)' }}>
                <span style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  Net Cost Allocation (-25%)
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 850, color: '#0284c7', marginTop: '3px' }}>
                  ${quote.totals.lotuslandNetCostUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '0.70rem', color: '#64748b', marginTop: '2px' }}>
                  Admin Internal Cost Basis
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #dadce0', borderRadius: '8px', padding: '12px 14px', boxShadow: '0 1px 2px rgba(60,64,67,0.06)' }}>
                <span style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  Atlas Net Commission (+6%)
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 850, color: '#16a34a', marginTop: '3px' }}>
                  +${quote.totals.mediluxeGrossMarginUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '0.70rem', color: '#16a34a', fontWeight: 700, marginTop: '2px' }}>
                  Admin Only · +6.00% over Net
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={{ background: '#ffffff', border: '1px solid #dadce0', borderRadius: '8px', padding: '12px 14px', boxShadow: '0 1px 2px rgba(60,64,67,0.06)' }}>
                <span style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  Standard List Reference
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 850, color: '#475569', marginTop: '3px', textDecoration: quote.totals.listSubtotalUSD ? 'line-through' : 'none' }}>
                  ${(quote.totals.listSubtotalUSD || quote.totals.grandTotalUSD).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '0.70rem', color: '#64748b', marginTop: '2px' }}>
                  Published Catalog Reference (USD)
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #dadce0', borderRadius: '8px', padding: '12px 14px', boxShadow: '0 1px 2px rgba(60,64,67,0.06)' }}>
                <span style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  Volume Allocation Savings
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 850, color: '#16a34a', marginTop: '3px' }}>
                  {quote.totals.clientSavingsVsListUSD
                    ? `-$${quote.totals.clientSavingsVsListUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                    : 'Preferred Rate'}
                </div>
                <div style={{ fontSize: '0.70rem', color: '#16a34a', fontWeight: 700, marginTop: '2px' }}>
                  {quote.totals.clientSavingsVsListUSD ? '-20.5% Net vs. List Price' : 'Verified Partner Allocation'}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Quotation Items Table ── */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #dadce0',
          boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Box size={16} color="#003666" />
              <span style={{ fontWeight: 800, fontSize: '0.86rem', color: '#003666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Quotation Line Items (4 Active Principles)
              </span>
            </div>
            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
              Air courier cold-chain delivery: 3–5 business days
            </span>
          </div>

          <DataTable
            data={quote.items}
            columns={columns}
            keyField="itemNumber"
            emptyMessage="No items in this quotation."
          />

          {/* Table Footer Totals Bar */}
          <div style={{
            padding: '14px 18px',
            backgroundColor: '#f8fafc',
            borderTop: '2px solid #cbd5e1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              All 4 APIs certified with HPLC & Mass Spectrometry assays. Standard cold-chain transit with continuous temperature data logging.
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  Grand Total Invoiced:
                </span>
                <div style={{ fontSize: '1.30rem', fontWeight: 850, color: '#003666' }}>
                  ${quote.totals.grandTotalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PublicUnifiedFooter lang="en" />
    </div>
  );
}

